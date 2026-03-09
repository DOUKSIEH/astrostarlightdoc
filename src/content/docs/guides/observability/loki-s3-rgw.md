---
title: "Guide : Loki + Stockage S3 (Ceph RGW)"
description: "Loki + Stockage S3 (Ceph RGW) — Guide Complet & Pédagogique"
created: "2026-02-24"
# updated: "2026-02-08"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"

---

<!-- # 📊 Loki + Stockage S3 (Ceph RGW) — Guide Complet & Pédagogique -->

<div align="center">

<!-- <img src="https://upload.wikimedia.org/wikipedia/commons/3/39/Kubernetes_logo_without_workmark.svg" alt="Kubernetes Logo" width="70"/> -->
<img src="https://grafana.com/static/img/logos/logo-loki.svg" alt="Loki Logo" width="90"/>


> **Collecte, stockage et visualisation de logs Kubernetes — de zéro à la production.**

</div>

---

## 📚 Table des Matières

| # | Section | Ce que vous allez apprendre |
|---|---------|----------------------------|
| 1 | [Comprendre l'architecture](#1--comprendre-larchitecture) | Loki, Promtail, Ceph : comment ça s'articule |
| 2 | [Prérequis](#2--prérequis) | Ce qu'il faut avant de commencer |
| 3 | [Créer les Buckets S3](#3--créer-les-buckets-s3-sur-ceph-rgw) | Provisioner le stockage objet via un Job K8s |
| 4 | [Tester l'écriture S3](#4--tester-lécriture-dans-s3) | Valider que le stockage fonctionne |
| 5 | [URL Presign](#5--générer-une-url-presign) | Accéder à un objet sans credentials |
| 6 | [Déployer Loki via Helm](#6--déployer-loki-via-helm) | Configuration complète annotée |
| 7 | [Vérifications](#7--vérifications-post-déploiement) | S'assurer que tout fonctionne |
| 8 | [Debug & Problèmes fréquents](#8--debug--problèmes-fréquents) | Résoudre les erreurs classiques |

> **Prérequis** : Cluster Kubernetes fonctionnel, `kubectl` configuré, `helm` v3 installé.

---

## 1 — Comprendre l'Architecture

### 1.1 Pourquoi Loki ?

> *"Loki, c'est comme une bibliothèque pour vos logs : Promtail est le bibliothécaire qui collecte les livres, Loki les classe et les stocke sur S3, et Grafana est le lecteur qui vient les consulter."*

**Sans Loki :**
```
App Pod A  →  logs perdus après crash du Pod
App Pod B  →  logs sur le Node, difficilement accessibles
App Pod C  →  logs en mémoire, disparus au redémarrage
```

**Avec Loki :**
```
App Pod A  ─┐
App Pod B  ─┼─→ Promtail ─→ Loki ─→ S3 (Ceph) ─→ Grafana
App Pod C  ─┘   (collecte)  (index)  (stockage)   (requêtes)
```

**La différence clé avec Elasticsearch :**

| | Elasticsearch | Loki |
|---|---|---|
| **Indexation** | Indexe le contenu complet | Indexe seulement les **labels** |
| **Recherche** | Plein texte instantané | Recherche dans les labels, grep dans le contenu |
| **Ressources** | Élevées (RAM/CPU) | Très légères |
| **Coût stockage** | Élevé (index gros) | Faible (logs compressés sur S3) |
| **Idéal pour** | Recherche complexe | Logs Kubernetes à faible coût |

---

### 1.2 Architecture complète

```
┌──────────────────────────────────────────────────────────────────────┐
│                        CLUSTER KUBERNETES                            │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  NODE 1                                                      │   │
│  │                                                              │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐             │   │
│  │  │  Pod nginx │  │  Pod API   │  │  Pod MySQL │             │   │
│  │  │ /var/log/  │  │ /var/log/  │  │ /var/log/  │             │   │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘             │   │
│  │        └───────────────┼───────────────┘                    │   │
│  │                        ▼                                     │   │
│  │            ┌───────────────────────┐                        │   │
│  │            │  PROMTAIL (DaemonSet) │ ← 1 Pod par Node       │   │
│  │            │ • Lit les fichiers log│                        │   │
│  │            │ • Ajoute des labels   │                        │   │
│  │            │   (namespace, pod...) │                        │   │
│  │            │ • Envoie à Loki       │                        │   │
│  │            └───────────┬───────────┘                        │   │
│  └────────────────────────│─────────────────────────────────────┘   │
│                           │  HTTP POST /loki/api/v1/push            │
│  ┌────────────────────────▼─────────────────────────────────────┐   │
│  │  LOKI (Deployment/StatefulSet)                               │   │
│  │  • Reçoit les logs de Promtail                               │   │
│  │  • Crée un index léger (labels seulement)                    │   │
│  │  • Compresse et stocke les chunks sur S3                     │   │
│  │  • Répond aux requêtes LogQL de Grafana                      │   │
│  └───────────────────────┬──────────────────────────────────────┘   │
└──────────────────────────│───────────────────────────────────────────┘
                           │  S3 API (HTTP)
                           ▼
            ┌──────────────────────────────┐
            │       CEPH RGW               │
            │  http://192.168.1.50:7480    │
            │                              │
            │  loki-chunks  ← données logs │
            │  loki-ruler   ← règles       │
            │  loki-admin   ← config       │
            └──────────────────────────────┘
                           │
            ┌──────────────▼───────────────┐
            │       GRAFANA                │
            │  DataSource → Loki           │
            │  Dashboards, alertes, LogQL  │
            └──────────────────────────────┘
```

---

### 1.3 Les 3 buckets S3 expliqués

| Bucket | Contenu | Analogie |
|--------|---------|----------|
| **loki-chunks** | Les logs compressés (les données réelles) | Le fond d'archives |
| **loki-ruler** | Les règles d'alertes Loki (Ruler component) | Le registre des règles |
| **loki-admin** | Configuration et métadonnées admin | Le bureau du directeur |

---

### 1.4 C'est quoi Ceph RGW ?

**Ceph** est un système de stockage distribué open-source. **RGW** (RADOS Gateway) expose une **API compatible S3** — vous pouvez donc utiliser les mêmes commandes `aws s3` que sur AWS, mais sur votre propre infrastructure !

```
AWS S3    →  stockage objet chez Amazon
Ceph RGW  →  stockage objet chez VOUS (même API, mêmes commandes)

Avantages :
  ✅ Données restent dans votre datacenter
  ✅ Coût maîtrisé
  ✅ Compatible avec tous les outils S3 (aws-cli, SDKs, Loki...)
```

---

## 2 — Prérequis

### 2.1 Checklist avant de commencer

- [ ] Cluster Kubernetes fonctionnel (`kubectl get nodes` répond)
- [ ] Namespace `monitoring` existant (ou à créer)
- [ ] Ceph RGW accessible depuis le cluster : `http://192.168.1.50:7480`
- [ ] `kubectl` configuré sur votre machine
- [ ] `helm` v3 installé (`helm version`)

### 2.2 Créer le namespace monitoring

```bash
# Créer le namespace (si inexistant)
kubectl create namespace monitoring

# Vérifier
kubectl get namespace monitoring
# NAME         STATUS   AGE
# monitoring   Active   5s
```

### 2.3 Créer le Secret avec les credentials S3

> 💡 **Pourquoi un Secret Kubernetes ?**
> Pour ne jamais écrire les credentials en clair dans vos fichiers YAML ou votre historique shell. Le Secret est stocké dans etcd (chiffré en production), et les Pods y accèdent via des variables d'environnement injectées automatiquement.

```bash
# Créer le secret avec vos clés d'accès Ceph RGW
# IMPORTANT : Remplacez VOTRE_ACCESS_KEY et VOTRE_SECRET_KEY par vos vraies valeurs
kubectl -n monitoring create secret generic loki-s3-creds \
  --from-literal=access_key=VOTRE_ACCESS_KEY \
  --from-literal=secret_key=VOTRE_SECRET_KEY

# Vérifier que le secret existe (les valeurs sont masquées)
kubectl -n monitoring get secret loki-s3-creds
# NAME             TYPE     DATA   AGE
# loki-s3-creds   Opaque   2      5s

# Voir les clés stockées (pas les valeurs, c'est normal)
kubectl -n monitoring describe secret loki-s3-creds
# Data
# ====
# access_key:  20 bytes   ← présent ✅
# secret_key:  40 bytes   ← présent ✅
```

> ⚠️ **Ne commitez jamais** les credentials en clair dans Git.
> Utilisez toujours des Secrets Kubernetes ou un gestionnaire externe (HashiCorp Vault, AWS Secrets Manager).

### 2.4 Tester la connectivité vers Ceph RGW

```bash
# Vérifier que le endpoint est joignable depuis votre machine
curl -I http://192.168.1.50:7480

# Résultat attendu :
# HTTP/1.1 403 Forbidden
# ← Normal ! 403 = connecté, mais pas d'credentials → c'est OK
# ← Si "Connection refused" → Ceph RGW est éteint ou problème réseau
```

---

## 3 — Créer les Buckets S3 sur Ceph RGW

### 3.1 Pourquoi utiliser un Job Kubernetes ?

> *"Plutôt que d'exécuter une commande depuis votre machine locale, on utilise un Job Kubernetes. Pourquoi ? Il tourne depuis l'intérieur du cluster, accède au réseau interne et aux Secrets — propre, traçable, et reproductible."*

**Comparaison des approches :**

| Approche | Avantages | Inconvénients |
|---|---|---|
| Commande locale | Simple | Credential sur votre machine, réseau externe |
| Job Kubernetes | Propre, secrets intégrés, réseau interne, traçable | YAML à écrire |

Les Jobs Kubernetes se suppriment automatiquement (`ttlSecondsAfterFinished`) et peuvent être rejoués à tout moment.

---

### 3.2 Manifest du Job — Création des buckets

```yaml
# ─────────────────────────────────────────────────────────────
# Fichier : create-buckets.yaml
# Objectif : Créer les 3 buckets S3 nécessaires à Loki
#            sur Ceph RGW, de façon sécurisée et idempotente
# ─────────────────────────────────────────────────────────────

apiVersion: batch/v1
kind: Job                          # Un Job = tâche avec un début et une fin
metadata:
  name: s3-create-buckets
  namespace: monitoring            # Même namespace que Loki et le Secret
spec:

  ttlSecondsAfterFinished: 60      # ← Nettoyage automatique
                                   #   Le Job disparaît 60s après sa fin
                                   #   (succès ou échec) → cluster propre

  backoffLimit: 0                  # ← 0 retry si échec
                                   #   On préfère voir l'erreur tout de suite
                                   #   plutôt que de masquer le problème
                                   #   avec des tentatives répétées

  template:
    spec:
      restartPolicy: Never         # ← OBLIGATOIRE pour les Jobs
                                   #   "Never" = si le conteneur plante, ne pas
                                   #   le redémarrer (c'est le Job qui gère les retries
                                   #   via backoffLimit)

      # ── Contexte de sécurité au niveau du Pod ────────────
      securityContext:
        runAsNonRoot: true         # ← Le Pod ne peut pas tourner en root
                                   #   Bonne pratique de sécurité obligatoire
                                   #   en production
        seccompProfile:
          type: RuntimeDefault     # ← Applique le profil seccomp par défaut
                                   #   du runtime (containerd/CRI-O)
                                   #   Limite les appels système autorisés

      containers:
        - name: aws
          image: amazon/aws-cli:2.15.33
          # ↑ Image officielle AWS CLI
          #   Version fixe (jamais "latest" en production !)
          #   "latest" peut casser votre déploiement lors d'une mise à jour
          #   de l'image en arrière-plan

          # ── Sécurité au niveau du conteneur ──────────────
          securityContext:
            allowPrivilegeEscalation: false
            # ↑ Interdit d'élever les privilèges pendant l'exécution
            #   (ex: via sudo ou setuid binaries)

            runAsUser: 1000
            # ↑ Tourne avec l'UID 1000 (utilisateur non-root)
            #   Complète runAsNonRoot au niveau conteneur

            capabilities:
              drop: ["ALL"]
              # ↑ Supprime toutes les Linux capabilities du conteneur
              #   (NET_RAW, SYS_ADMIN, etc.)
              #   Le conteneur n'a que les permissions strictement nécessaires

          command: ["sh", "-lc"]
          # ↑ Lance un shell bash en mode "login" (-l)
          #   Le flag -c indique que le script suit dans "args"

          args:
            - |
              # "set -e" : le script s'arrête immédiatement si une commande échoue
              # SANS "set -e", un "aws s3 mb" qui échoue serait ignoré silencieusement
              set -e

              # Désactive le pager interactif AWS CLI
              # Sans ça, la sortie s'affiche page par page et bloque le script
              export AWS_PAGER=""

              # Désactive la tentative de récupération des métadonnées EC2
              # Hors AWS, le CLI tente pendant 30 secondes de contacter
              # l'endpoint de métadonnées 169.254.169.254 avant de timeout
              # → OBLIGATOIRE pour éviter des timeouts de 30s à chaque commande
              export AWS_EC2_METADATA_DISABLED=true

              # Force le "path style" pour l'URL S3
              # ─────────────────────────────────────────────
              # Style virtual-hosted (défaut AWS) :
              #   http://loki-chunks.192.168.1.50:7480/object
              #                       ↑ IMPOSSIBLE de résoudre en DNS !
              #
              # Style path (obligatoire pour Ceph RGW) :
              #   http://192.168.1.50:7480/loki-chunks/object
              #                           ↑ Correct, Ceph comprend ça
              # ─────────────────────────────────────────────
              export AWS_S3_ADDRESSING_STYLE=path

              endpoint="http://192.168.1.50:7480"

              # Créer les 3 buckets
              # "|| true" rend la commande idempotente :
              # si le bucket existe déjà, on ne plante pas ("|| true" = succès quand même)
              # Sans "|| true", "set -e" stopperait le script si un bucket existe déjà
              aws s3 mb s3://loki-chunks --endpoint-url "$endpoint" || true
              aws s3 mb s3://loki-ruler  --endpoint-url "$endpoint" || true
              aws s3 mb s3://loki-admin  --endpoint-url "$endpoint" || true

              # Confirmer la création en listant tous les buckets
              echo "=== Buckets existants sur Ceph RGW ==="
              aws s3 ls --endpoint-url "$endpoint"

          # ── Variables d'environnement ─────────────────────
          env:
            # Les credentials viennent du Secret Kubernetes créé à l'étape 2
            # Kubernetes injecte les valeurs au démarrage du Pod
            # → Jamais de credentials en clair dans le YAML !

            - name: AWS_ACCESS_KEY_ID
              valueFrom:
                secretKeyRef:
                  name: loki-s3-creds   # Nom du Secret
                  key: access_key        # Clé dans le Secret

            - name: AWS_SECRET_ACCESS_KEY
              valueFrom:
                secretKeyRef:
                  name: loki-s3-creds
                  key: secret_key

            - name: AWS_DEFAULT_REGION
              value: us-east-1
              # ↑ Ceph RGW ignore cette valeur (ce n'est pas AWS),
              #   mais l'AWS CLI exige qu'une région soit définie
              #   La valeur "us-east-1" est arbitraire ici
```

### 3.3 Exécution

```bash
# Appliquer le manifest
kubectl apply -f create-buckets.yaml
# job.batch/s3-create-buckets created

# Suivre les logs en temps réel
# -f = follow (comme tail -f)
kubectl -n monitoring logs job/s3-create-buckets -f

# Résultat attendu :
# make_bucket: loki-chunks
# make_bucket: loki-ruler
# make_bucket: loki-admin
# === Buckets existants sur Ceph RGW ===
# 2024-01-15 10:23:45 loki-admin
# 2024-01-15 10:23:45 loki-chunks
# 2024-01-15 10:23:46 loki-ruler

# Vérifier le statut final du Job
kubectl -n monitoring get job s3-create-buckets
# NAME                 COMPLETIONS   DURATION   AGE
# s3-create-buckets    1/1           8s         15s
#                      ↑ 1/1 = succès ✅

# Note : Le Job disparaîtra automatiquement après 60 secondes
```

---

## 4 — Tester l'Écriture dans S3

> 💡 **Pourquoi ce test ?**
> Avant de déployer Loki, on vérifie que l'écriture dans S3 fonctionne réellement. Si Loki ne peut pas écrire, il refusera de démarrer et sera difficile à déboguer. Mieux vaut valider maintenant !

```yaml
# ─────────────────────────────────────────────────────────────
# Fichier : s3-write-test.yaml
# Objectif : Écrire un fichier test dans loki-chunks pour
#            valider les permissions S3 (lecture + écriture)
# ─────────────────────────────────────────────────────────────

apiVersion: batch/v1
kind: Job
metadata:
  name: s3-write-test
  namespace: monitoring
spec:
  ttlSecondsAfterFinished: 60
  backoffLimit: 0
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: aws
          image: amazon/aws-cli:2.15.33

          command: ["sh", "-lc"]
          args:
            - |
              set -e
              export AWS_S3_ADDRESSING_STYLE=path
              export AWS_EC2_METADATA_DISABLED=true

              endpoint="http://192.168.1.50:7480"

              # ── TEST 1 : Écriture ─────────────────────────
              # Créer un fichier texte dans /tmp
              # (filesystem éphémère du Pod, disparaît à sa suppression)
              echo "hello loki — test écriture $(date)" > /tmp/test.txt

              # Uploader vers S3
              # Syntaxe : aws s3 cp <source> <destination> --endpoint-url <url>
              # "cp" fonctionne dans les deux sens : local→S3 ou S3→local
              aws s3 cp /tmp/test.txt \
                s3://loki-chunks/test.txt \
                --endpoint-url "$endpoint"
              echo "✅ Upload réussi !"

              # ── TEST 2 : Listage ──────────────────────────
              # Vérifier que le fichier est bien présent
              echo "=== Contenu du bucket loki-chunks ==="
              aws s3 ls s3://loki-chunks/ --endpoint-url "$endpoint"
              # Doit afficher : ... test.txt

              # ── TEST 3 : Téléchargement ────────────────────
              # Re-télécharger le fichier pour valider la lecture
              aws s3 cp \
                s3://loki-chunks/test.txt \
                /tmp/test-download.txt \
                --endpoint-url "$endpoint"
              echo "=== Contenu du fichier re-téléchargé ==="
              cat /tmp/test-download.txt
              # Doit afficher : "hello loki — test écriture ..."

          env:
            - name: AWS_ACCESS_KEY_ID
              valueFrom:
                secretKeyRef:
                  name: loki-s3-creds
                  key: access_key
            - name: AWS_SECRET_ACCESS_KEY
              valueFrom:
                secretKeyRef:
                  name: loki-s3-creds
                  key: secret_key
            - name: AWS_DEFAULT_REGION
              value: us-east-1
```

```bash
kubectl apply -f s3-write-test.yaml
kubectl -n monitoring logs job/s3-write-test -f

# Résultat attendu :
# upload: /tmp/test.txt to s3://loki-chunks/test.txt
# ✅ Upload réussi !
# === Contenu du bucket loki-chunks ===
# 2024-01-15 10:25:12         38 test.txt
# === Contenu du fichier re-téléchargé ===
# hello loki — test écriture Mon Jan 15 10:25:11 UTC 2024
```

---

## 5 — Générer une URL Presign

### 5.1 C'est quoi une URL Presign ?

> *"Une URL presign est comme un billet d'entrée temporaire : elle permet d'accéder à un fichier S3 privé sans avoir besoin de credentials, pendant une durée limitée."*

```
Cas d'usage concrets :
  → Partager un fichier de log avec un collègue sans lui donner vos clés
  → Debug : visualiser directement un objet dans votre navigateur
  → Intégrations : donner un accès temporaire à une application externe
```

**Comment ça marche :**

```
URL normale S3 (accès refusé sans credentials) :
  http://192.168.1.50:7480/loki-chunks/test.txt
  → 403 Forbidden ❌

URL Presign (accès autorisé jusqu'à expiration) :
  http://192.168.1.50:7480/loki-chunks/test.txt
    ?X-Amz-Algorithm=AWS4-HMAC-SHA256
    &X-Amz-Credential=...
    &X-Amz-Date=20240115T102512Z
    &X-Amz-Expires=3600          ← valide 1 heure
    &X-Amz-Signature=abc123...   ← signature HMAC de vos credentials
  → 200 OK ✅ (pendant 3600 secondes)
```

```yaml
# ─────────────────────────────────────────────────────────────
# Fichier : s3-presign.yaml
# Objectif : Générer une URL temporaire pour accéder
#            à test.txt sans fournir de credentials
# ─────────────────────────────────────────────────────────────

apiVersion: batch/v1
kind: Job
metadata:
  name: s3-presign
  namespace: monitoring
spec:
  ttlSecondsAfterFinished: 30    # Tâche rapide → nettoyage après 30s
  backoffLimit: 0
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: aws
          image: amazon/aws-cli:2.15.33
          command: ["sh", "-lc"]
          args:
            - |
              export AWS_S3_ADDRESSING_STYLE=path
              export AWS_EC2_METADATA_DISABLED=true
              endpoint="http://192.168.1.50:7480"

              echo "=== URL Presign valable 1 heure ==="

              # "presign" génère une URL signée avec vos credentials
              # La signature est intégrée dans les paramètres de l'URL
              # --expires-in : durée de validité en secondes
              #   3600 = 1 heure | 86400 = 24 heures | 604800 = 7 jours (max)
              aws s3 presign s3://loki-chunks/test.txt \
                --endpoint-url "$endpoint" \
                --expires-in 3600

              echo ""
              echo "→ Copiez cette URL dans votre navigateur pour voir le fichier !"

          env:
            - name: AWS_ACCESS_KEY_ID
              valueFrom:
                secretKeyRef:
                  name: loki-s3-creds
                  key: access_key
            - name: AWS_SECRET_ACCESS_KEY
              valueFrom:
                secretKeyRef:
                  name: loki-s3-creds
                  key: secret_key
            - name: AWS_DEFAULT_REGION
              value: us-east-1
```

```bash
kubectl apply -f s3-presign.yaml
kubectl -n monitoring logs job/s3-presign

# Résultat : une longue URL que vous pouvez ouvrir dans un navigateur
# http://192.168.1.50:7480/loki-chunks/test.txt?X-Amz-Algorithm=...
```

---

## 6 — Déployer Loki via Helm

### 6.1 Ajouter le repo Helm Grafana

```bash
# Ajouter le dépôt officiel Grafana
# (contient Loki, Grafana, Promtail, Tempo, Mimir...)
helm repo add grafana https://grafana.github.io/helm-charts

# Mettre à jour les index locaux
# (équivalent à "apt update" avant d'installer un paquet)
helm repo update

# Vérifier l'ajout
helm repo list
# NAME     URL
# grafana  https://grafana.github.io/helm-charts

# Voir les versions disponibles de Loki
helm search repo grafana/loki --versions | head -5
```

> 💡 **Principe Helm :** Un chart Helm est un template paramétrable. `loki-values.yaml` contient vos personnalisations — il **surcharge** uniquement les valeurs par défaut que vous voulez modifier.

---

### 6.2 Fichier `loki-values.yaml` — Configuration complète commentée

```yaml
# ═══════════════════════════════════════════════════════════════════════
# Fichier : kubernetes/infrastructure/monitoring/loki-values.yaml
# Objectif : Configuration Loki avec stockage sur Ceph S3
#
# Structure :
#   loki:           → Configuration du serveur Loki lui-même
#   grafana:        → Optionnel, installation Grafana intégrée
#   promtail:       → Agent de collecte de logs (DaemonSet)
# ═══════════════════════════════════════════════════════════════════════

# ──────────────────────────────────────────────────────────────────────
# SECTION LOKI — Configuration du serveur central
# ──────────────────────────────────────────────────────────────────────
loki:

  # ── Mode de déploiement ─────────────────────────────────────────────
  deploymentMode: SingleBinary
  # Options disponibles :
  #   SingleBinary   → Tout en 1 Pod (simple, parfait pour commencer)
  #                    CPU/RAM réduits, pas de haute disponibilité
  #   SimpleScalable → Sépare read / write / backend en composants distincts
  #                    Bon équilibre scalabilité / complexité
  #   Distributed    → Chaque microservice dans son propre Deployment
  #                    Pour les très grandes charges (>10k logs/s)
  # → SingleBinary est recommandé pour démarrer


  # ── Injection des credentials S3 via variables d'environnement ──────
  # Ces variables viennent du Secret "loki-s3-creds" (jamais en clair !)
  # Loki (via le SDK AWS) les lit automatiquement pour s'authentifier
  extraEnv:

    - name: AWS_ACCESS_KEY_ID
      valueFrom:
        secretKeyRef:
          name: loki-s3-creds    # ← Nom du Secret Kubernetes (étape 2)
          key: access_key         # ← Nom de la clé dans le Secret

    - name: AWS_SECRET_ACCESS_KEY
      valueFrom:
        secretKeyRef:
          name: loki-s3-creds
          key: secret_key

    - name: AWS_DEFAULT_REGION
      value: us-east-1
      # ↑ Ceph RGW ignore cette valeur,
      #   mais le SDK AWS l'exige pour fonctionner
      #   "us-east-1" est une valeur arbitraire ici

    - name: AWS_S3_ADDRESSING_STYLE
      value: path
      # ↑ CRUCIAL pour Ceph RGW !
      # Force l'URL au format "path style" :
      #   ✅ http://192.168.1.50:7480/loki-chunks/object  (path)
      #   ❌ http://loki-chunks.192.168.1.50:7480/object  (virtual-hosted)
      # Ceph ne supporte pas le style virtual-hosted

    - name: AWS_EC2_METADATA_DISABLED
      value: "true"
      # ↑ Empêche le SDK d'essayer de contacter le service de métadonnées EC2
      #   (169.254.169.254) pour récupérer des credentials automatiques.
      #   Hors AWS, cette tentative timeout après 30 secondes → le Pod démarre lentement


  # ── Configuration des buckets S3 ────────────────────────────────────
  storage:
    type: s3                     # Type de backend de stockage objet

    bucketNames:
      chunks: loki-chunks        # ← Bucket principal : logs compressés
                                  #   C'est ici que 99% des données sont stockées
      ruler: loki-ruler          # ← Bucket pour les règles d'alertes Loki Ruler
      admin: loki-admin          # ← Bucket pour les données administratives


  # ── Configuration interne de Loki ───────────────────────────────────
  # Note importante sur la syntaxe :
  #   Charts Loki récents (≥ 5.x)  → structuredConfig:  (YAML)
  #   Charts Loki anciens (< 5.x)  → config: |          (texte brut)
  #   En cas d'erreur, voir la section 8 Debug
  structuredConfig:

    # Mode d'authentification
    # false → mode mono-tenant (simple, tous les logs ensemble)
    # true  → mode multi-tenant (header X-Scope-OrgID requis par Promtail)
    auth_enabled: false

    # ── Serveur HTTP ───────────────────────────────────────────────────
    server:
      http_listen_port: 3100
      # ↑ Port sur lequel Loki écoute les connexions
      #   Promtail envoie vers http://loki:3100/loki/api/v1/push
      #   Grafana interroge http://loki:3100 pour les requêtes LogQL

    # ── Paramètres communs ─────────────────────────────────────────────
    common:
      replication_factor: 1
      # ↑ Nombre de copies de chaque chunk de données
      #   1 = pas de réplication (économique, adapté en SingleBinary)
      #   3 = haute disponibilité (nécessite 3 instances Loki)
      #   En SingleBinary, la réplication est assurée par S3 lui-même

    # ── Schéma de stockage ─────────────────────────────────────────────
    schema_config:
      configs:
        - from: "2024-01-01"
          # ↑ Date de début d'application de ce schéma
          #   Loki supporte plusieurs schémas pour les migrations progressives
          #   Les logs avant cette date utilisent l'ancien schéma (si existant)

          store: tsdb
          # ↑ Moteur d'indexation
          #   tsdb    = Time Series Database Index (recommandé depuis v2.8, 2023)
          #             Plus rapide, moins d'espace, compaction automatique
          #   boltdb-shipper = ancien format, ne plus utiliser pour les nouveaux déploiements

          object_store: s3
          # ↑ Où stocker les chunks de logs
          #   s3 = utilise les buckets S3 définis dans storage.bucketNames

          schema: v13
          # ↑ Version du format de stockage Loki
          #   v13 = dernière version (2024), la plus efficace
          #   v12, v11 = versions antérieures, encore supportées pour migration

          index:
            prefix: loki_index_
            # ↑ Préfixe des fichiers d'index créés dans S3
            #   Résultat : loki_index_19358/... dans le bucket

            period: 24h
            # ↑ Un nouveau fichier d'index est créé toutes les 24 heures
            #   Permet une gestion fine de la rétention
            #   et des requêtes rapides sur une plage de temps donnée

    # ── Configuration détaillée du backend S3 ──────────────────────────
    storage_config:
      aws:
        s3: http://192.168.1.50:7480
        # ↑ URL de votre Ceph RGW
        #   Pour AWS natif, ce serait : s3://us-east-1
        #   Loki construit les URLs : http://192.168.1.50:7480/loki-chunks/...

        region: us-east-1
        # ↑ Ignoré par Ceph, mais requis par le SDK AWS

        s3forcepathstyle: true
        # ↑ OBLIGATOIRE pour Ceph RGW
        #   Identique à AWS_S3_ADDRESSING_STYLE=path
        #   Les deux paramètres doivent être définis (SDK + config Loki)

        insecure: true
        # ↑ Autorise HTTP (sans TLS/HTTPS)
        #   En production avec HTTPS, mettre false et configurer les certificats

    # ── Rétention des logs ─────────────────────────────────────────────
    limits_config:
      retention_period: 168h
      # ↑ Durée de conservation des logs = 7 jours (168 heures)
      #   Après ce délai, Loki supprime automatiquement les vieux logs de S3
      #   via le processus de compaction
      #   Ajustez selon vos besoins métier et votre capacité S3 :
      #     24h   = 1 jour (très court, économise l'espace)
      #     168h  = 7 jours (standard)
      #     720h  = 30 jours (conformité réglementaire)


# ──────────────────────────────────────────────────────────────────────
# SECTION GRAFANA — Interface de visualisation
# ──────────────────────────────────────────────────────────────────────
grafana:
  enabled: false
  # ↑ Ne pas installer Grafana via ce chart
  #   Raison : Grafana est souvent déjà déployé séparément dans monitoring
  #   Mettez "true" pour un déploiement tout-en-un (dev/test)


# ──────────────────────────────────────────────────────────────────────
# SECTION PROMTAIL — Agent de collecte de logs
# ──────────────────────────────────────────────────────────────────────
promtail:
  enabled: true
  # ↑ Installe Promtail comme un DaemonSet
  #   → 1 Pod Promtail sur chaque Node du cluster
  #   → Chaque Pod lit /var/log/pods/ de son Node et envoie à Loki

  config:
    clients:
      - url: http://loki:3100/loki/api/v1/push
        # ↑ URL où Promtail envoie les logs
        #   "loki" = nom du Service Kubernetes créé par le chart Loki
        #   Résolution DNS interne : loki.monitoring.svc.cluster.local
        #
        #   Si Promtail est dans un namespace différent, utiliser :
        #   http://loki.monitoring.svc.cluster.local:3100/loki/api/v1/push
```

---

### 6.3 Déployer avec Helm

```bash
# ── ÉTAPE 1 : Valider la configuration AVANT de déployer ──────────────
# --dry-run génère le YAML qui serait appliqué, sans rien créer
# C'est le moyen le plus rapide de détecter les erreurs de configuration
helm upgrade --install loki grafana/loki \
  --namespace monitoring \
  -f kubernetes/infrastructure/monitoring/loki-values.yaml \
  --dry-run | tail -80

# Si vous voyez "Error: ..." → corriger loki-values.yaml avant de continuer
# Si le YAML s'affiche sans erreur → passer à l'étape 2


# ── ÉTAPE 2 : Déploiement réel ─────────────────────────────────────────
helm upgrade --install loki grafana/loki \
  --namespace monitoring \
  --create-namespace \
  # ↑ --create-namespace : crée le namespace s'il n'existe pas encore
  #   Pratique mais préférez créer le namespace manuellement
  #   pour mieux contrôler ses paramètres (labels, quotas...)
  -f kubernetes/infrastructure/monitoring/loki-values.yaml

# Résultat attendu :
# Release "loki" does not exist. Installing it now.
# NAME: loki
# LAST DEPLOYED: Mon Jan 15 10:30:00 2024
# NAMESPACE: monitoring
# STATUS: deployed
# REVISION: 1


# ── ÉTAPE 3 : Surveiller le démarrage ─────────────────────────────────
# -w = watch (affichage en temps réel des changements d'état)
kubectl -n monitoring get pods -w

# Évolution attendue :
# NAME                  READY   STATUS              AGE
# loki-0                0/1     ContainerCreating   5s
# loki-promtail-4xkgn   0/1     ContainerCreating   5s
# loki-promtail-8dvrg   0/1     ContainerCreating   5s
# loki-0                1/1     Running             30s   ← ✅
# loki-promtail-4xkgn   1/1     Running             15s   ← ✅
# loki-promtail-8dvrg   1/1     Running             15s   ← ✅

# Ctrl+C pour arrêter le watch
```

---

## 7 — Vérifications Post-Déploiement

### 7.1 Vérifier les Pods

```bash
# Lister les pods Loki et Promtail
kubectl -n monitoring get pods | grep -E "loki|promtail"

# Résultat attendu :
# NAME                  READY   STATUS    RESTARTS   AGE
# loki-0                1/1     Running   0          5m    ← Serveur Loki
# loki-promtail-4xkgn   1/1     Running   0          5m    ← Agent Node 1
# loki-promtail-8dvrg   1/1     Running   0          5m    ← Agent Node 2
# loki-promtail-k5bzv   1/1     Running   0          5m    ← Agent Node 3

# ⚠️ STATUS = CrashLoopBackOff → voir section 8 Debug
# ⚠️ RESTARTS > 0 → le Pod a crashé et redémarré → voir les logs
```

### 7.2 Vérifier les Services

```bash
kubectl -n monitoring get svc | grep loki

# Résultat attendu :
# NAME            TYPE        CLUSTER-IP      PORT(S)    AGE
# loki            ClusterIP   10.96.100.5     3100/TCP   5m   ← Service principal
# loki-headless   ClusterIP   None            3100/TCP   5m   ← DNS interne StatefulSet

# "loki" (ClusterIP:3100) est l'adresse que Promtail utilise
# "loki-headless" (clusterIP: None) est utilisé en interne par le StatefulSet
```

### 7.3 Vérifier les logs Loki

```bash
# Afficher les 200 dernières lignes
kubectl -n monitoring logs deploy/loki --tail=200

# ✅ Lignes positives :
# level=info msg="Loki started"
# level=info msg="Starting ingester"
# level=info msg="compactor started"      ← Compaction S3 active

# ❌ Lignes d'erreur à investiguer :
# level=error msg="failed to connect to S3"            → problème Ceph
# level=error msg="NoSuchBucket"                       → buckets non créés
# level=error msg="context deadline exceeded"          → timeout réseau/S3
# level=error msg="NoCredentialProviders"              → credentials manquants
```

### 7.4 Vérifier les logs Promtail

```bash
# Logs de tous les Pods Promtail en même temps
kubectl -n monitoring logs \
  -l app.kubernetes.io/name=promtail \
  --tail=100

# ✅ Lignes positives :
# level=info msg="Promtail started"
# level=info msg="Tailing file" path=/var/log/pods/...
# level=info msg="Successfully sent log entries"

# ❌ Lignes d'erreur :
# level=error msg="Error sending log entries"   → connexion Loki échouée
# level=warn  msg="failed to tail file"         → fichier log inaccessible
```

### 7.5 Vérifier que Loki écrit dans S3

```yaml
# ─────────────────────────────────────────────────────────────
# Fichier : s3-inspect.yaml
# Objectif : Vérifier que Loki a bien créé des objets TSDB
#            dans loki-chunks (preuve que l'ingestion fonctionne)
# ─────────────────────────────────────────────────────────────

apiVersion: batch/v1
kind: Job
metadata:
  name: s3-inspect
  namespace: monitoring
spec:
  ttlSecondsAfterFinished: 60
  backoffLimit: 0
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: aws
          image: amazon/aws-cli:2.15.33
          command: ["sh", "-lc"]
          args:
            - |
              export AWS_S3_ADDRESSING_STYLE=path
              export AWS_EC2_METADATA_DISABLED=true
              endpoint="http://192.168.1.50:7480"

              echo "=== Contenu COMPLET de loki-chunks ==="
              # --recursive : liste aussi les sous-dossiers (objets dans des "pseudo-répertoires")
              # Après ~5 minutes de fonctionnement, vous devriez voir des fichiers TSDB
              aws s3 ls s3://loki-chunks/ \
                --endpoint-url "$endpoint" \
                --recursive

              # ✅ Résultat attendu :
              # 2024-01-15 10:30:00   38 test.txt
              # 2024-01-15 10:35:45  4521 loki_index_19358/index_19358_1705314945.tsdb.gz
              # 2024-01-15 10:36:01 124832 chunks/01HMBXYZ123456789ABCDEF
              #                             ↑ TSDB index ✅    ↑ Chunks de logs ✅

              echo ""
              echo "=== Contenu de loki-ruler ==="
              # Normal d'être vide si vous n'avez pas créé de règles d'alertes
              aws s3 ls s3://loki-ruler/ \
                --endpoint-url "$endpoint" \
                --recursive || echo "(vide — normal sans règles d'alertes)"

          env:
            - name: AWS_ACCESS_KEY_ID
              valueFrom:
                secretKeyRef:
                  name: loki-s3-creds
                  key: access_key
            - name: AWS_SECRET_ACCESS_KEY
              valueFrom:
                secretKeyRef:
                  name: loki-s3-creds
                  key: secret_key
            - name: AWS_DEFAULT_REGION
              value: us-east-1
```

```bash
kubectl apply -f s3-inspect.yaml
kubectl -n monitoring logs job/s3-inspect -f
```

### 7.6 Tester une requête LogQL

```bash
# Ouvrir un tunnel local vers le Service Loki
# (sans exposer Loki à l'extérieur)
kubectl -n monitoring port-forward svc/loki 3100:3100 &

# Vérifier que Loki est prêt
curl http://localhost:3100/ready
# ready ← ✅

# Requête LogQL : logs du namespace "monitoring" des 5 dernières minutes
# LogQL utilise des sélecteurs de labels entre {} comme PromQL
curl -s \
  "http://localhost:3100/loki/api/v1/query_range" \
  --data-urlencode 'query={namespace="monitoring"}' \
  --data-urlencode "start=$(date -d '5 minutes ago' +%s)000000000" \
  --data-urlencode "end=$(date +%s)000000000" \
  | python3 -m json.tool | head -40

# Fermer le tunnel
kill %1
```

---

## 8 — Debug & Problèmes Fréquents

### 8.1 Commandes de debug essentielles

```bash
# ─── Voir la configuration Helm actuellement appliquée ─────────────────
helm get values loki -n monitoring
# Affiche VOS overrides (ce que vous avez modifié via loki-values.yaml)

helm get values loki -n monitoring --all
# Affiche TOUTES les valeurs : les vôtres + les défauts du chart
# Utile pour voir ce qui est appliqué sans le savoir


# ─── Valider sans déployer (dry-run) ───────────────────────────────────
# Génère le YAML qui serait appliqué — idéal pour trouver les erreurs de config
helm upgrade --install loki grafana/loki \
  -n monitoring \
  -f kubernetes/infrastructure/monitoring/loki-values.yaml \
  --dry-run | tail -80


# ─── Voir les événements d'un Pod ──────────────────────────────────────
kubectl -n monitoring describe pod loki-0
# Regarder la section "Events:" en bas
# Messages courants :
#   "OOMKilled"          → Pod tué par manque de mémoire → augmenter limits.memory
#   "ImagePullBackOff"   → Image introuvable → vérifier le nom/tag
#   "CrashLoopBackOff"   → L'app plante au démarrage → voir les logs


# ─── Logs avant un crash ───────────────────────────────────────────────
kubectl -n monitoring logs loki-0 --previous
# "--previous" = logs du conteneur AVANT le dernier redémarrage
# Indispensable quand un Pod est en CrashLoopBackOff


# ─── Tester la connectivité S3 depuis l'intérieur du cluster ───────────
# Lance un Pod de debug éphémère (supprimé automatiquement avec --rm)
kubectl run s3-debug \
  --rm -it \
  --image=amazon/aws-cli:2.15.33 \
  --env="AWS_ACCESS_KEY_ID=VOTRE_KEY" \
  --env="AWS_SECRET_ACCESS_KEY=VOTRE_SECRET" \
  --env="AWS_DEFAULT_REGION=us-east-1" \
  -- sh

# Dans le Pod de debug :
# aws s3 ls --endpoint-url http://192.168.1.50:7480
# → Teste la connectivité réseau et les credentials depuis le cluster


# ─── Voir la consommation de ressources ────────────────────────────────
kubectl -n monitoring top pods
# NAME                  CPU(cores)   MEMORY(bytes)
# loki-0                50m          256Mi
# loki-promtail-4xkgn   10m          64Mi
```

---

### 8.2 Problèmes fréquents et solutions

#### ❌ `structuredConfig not recognized` ou `schema_config missing`

```
Symptôme :
  helm upgrade --dry-run affiche une erreur sur structuredConfig
  OU Loki démarre mais ignore la configuration du schéma

Cause :
  La syntaxe a changé entre les versions majeures du chart Loki :
  - Chart Loki ≥ 5.x (récent)  → structuredConfig: (YAML structuré)
  - Chart Loki < 5.x (ancien)  → config: |         (texte brut YAML)

Diagnostic :
  helm search repo grafana/loki
  # Vérifiez votre version de chart installée

Solution A — Chart récent (≥ 5.x) :
  Utiliser structuredConfig: comme dans ce guide ← recommandé

Solution B — Chart ancien (< 5.x) :
  Remplacer structuredConfig: par config: |
  loki:
    config: |                 ← Texte brut (le | indique un bloc multilignes)
      auth_enabled: false
      server:
        http_listen_port: 3100
      schema_config:
        ...
```

---

#### ❌ `NoCredentialProviders` ou timeout de 30 secondes

```
Symptôme dans les logs Loki :
  level=error msg="failed to connect" err="NoCredentialProviders: no valid providers"
  OU
  Loki met 30+ secondes à démarrer (timeout silencieux)

Cause probable :
  1. Variables d'environnement AWS non injectées dans le Pod
  2. Secret "loki-s3-creds" absent ou dans le mauvais namespace
  3. AWS_EC2_METADATA_DISABLED non défini
     → Le SDK essaie de contacter 169.254.169.254 pendant 30 secondes

Diagnostic :
  # Vérifier que le Secret est présent
  kubectl -n monitoring get secret loki-s3-creds

  # Vérifier les variables d'environnement dans le Pod Loki
  kubectl -n monitoring exec loki-0 -- env | grep AWS
  # Doit afficher :
  # AWS_ACCESS_KEY_ID=...
  # AWS_SECRET_ACCESS_KEY=...
  # AWS_EC2_METADATA_DISABLED=true

Solution :
  1. Recréer le Secret dans le bon namespace (monitoring)
  2. Vérifier extraEnv dans loki-values.yaml
  3. Ajouter AWS_EC2_METADATA_DISABLED: "true"
  4. Redeployer : helm upgrade ...
```

---

#### ❌ `dial tcp: lookup loki-chunks.192.168.1.50` — Mauvais format d'URL

```
Symptôme :
  level=error msg="dial tcp: lookup loki-chunks.192.168.1.50: no such host"
  (Loki essaie de résoudre "loki-chunks.192.168.1.50" comme un DNS !)

Cause :
  s3forcepathstyle est à false (valeur par défaut)
  → Le SDK construit l'URL en mode "virtual-hosted" :
  ❌ http://loki-chunks.192.168.1.50:7480   (impossible à résoudre en DNS)

  s3forcepathstyle: true
  → Le SDK construit l'URL en mode "path" :
  ✅ http://192.168.1.50:7480/loki-chunks

Solution :
  S'assurer que les DEUX paramètres sont définis :
  1. Dans structuredConfig.storage_config.aws : s3forcepathstyle: true
  2. Dans extraEnv : AWS_S3_ADDRESSING_STYLE: path
```

---

#### ❌ Promtail ne collecte pas les logs

```
Symptôme :
  Logs Promtail : "Error sending log entries to Loki"
  OU silence total (aucun log dans Grafana)

Vérification :
  # Tester la connexion Promtail → Loki
  kubectl -n monitoring exec ds/loki-promtail -- \
    wget -qO- http://loki:3100/ready
  # Attendu : "ready"

Causes et solutions :

  1. URL Loki incorrecte
     Vérifier : promtail.config.clients[0].url
     → http://loki:3100/loki/api/v1/push           (même namespace)
     → http://loki.monitoring.svc.cluster.local:3100/loki/api/v1/push
                                                   (namespace différent)

  2. Loki pas encore prêt (premier démarrage)
     → Attendre 1-2 minutes, Promtail réessaie automatiquement

  3. Loki en CrashLoopBackOff
     → Résoudre le problème Loki d'abord (voir les autres erreurs)
```

---

### 8.3 Configurer Grafana pour lire Loki

```bash
# Ajouter Loki comme DataSource dans Grafana existant
# (via provisioning automatique — recommandé)

cat << 'EOF' > grafana-loki-datasource.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-loki-datasource
  namespace: monitoring
  labels:
    grafana_datasource: "1"   # Label reconnu par le sidecar Grafana
data:
  loki.yaml: |
    apiVersion: 1
    datasources:
      - name: Loki
        type: loki
        access: proxy            # Grafana proxifie les requêtes (recommandé)
        url: http://loki:3100   # URL interne au cluster
        isDefault: false
        jsonData:
          maxLines: 1000         # Nombre max de lignes par requête
          timeout: 60            # Timeout en secondes pour les requêtes longues
EOF

kubectl apply -f grafana-loki-datasource.yaml
```

**Exemples de requêtes LogQL dans Grafana :**

```logql
# Tous les logs du namespace monitoring
{namespace="monitoring"}

# Logs d'un Pod spécifique
{pod="loki-0"}

# Logs d'erreur uniquement (grep)
{namespace="monitoring"} |= "error"

# Logs JSON parsés : filtre sur le champ "level"
{namespace="monitoring"} | json | level="error"

# Comptage des erreurs par Pod sur 1 minute
sum(rate({namespace="monitoring"} |= "error" [1m])) by (pod)

# Logs des 5 dernières minutes contenant "timeout"
{namespace="monitoring"} |= "timeout"
```

---

## ✅ Checklist Finale

```
Stockage S3
[ ] Secret loki-s3-creds créé dans le namespace monitoring
[ ] Ceph RGW accessible depuis le cluster (curl → 403 Forbidden)
[ ] Job create-buckets : 3 buckets créés avec succès
[ ] Job s3-write-test : upload et download réussis

Déploiement
[ ] helm repo add grafana + helm repo update
[ ] loki-values.yaml configuré (s3forcepathstyle, credentials, schema)
[ ] helm upgrade --dry-run sans erreurs
[ ] helm upgrade --install réussi (STATUS: deployed)

Vérifications
[ ] Pod loki-0 en état Running
[ ] Pods promtail Running sur chaque Node
[ ] Logs Loki sans erreur ("Loki started", "ingester started")
[ ] Job s3-inspect : objets TSDB visibles dans loki-chunks
[ ] curl localhost:3100/ready → "ready"

Grafana
[ ] DataSource Loki ajouté
[ ] Requête test {namespace="monitoring"} retourne des logs
```

---

## 📌 Ressources Utiles

- 📘 [Documentation officielle Loki](https://grafana.com/docs/loki/latest/)
- 📗 [Chart Helm Loki — valeurs disponibles](https://github.com/grafana/loki/tree/main/production/helm/loki)
- 📊 [Référence LogQL](https://grafana.com/docs/loki/latest/query/)
- 🛠️ [Ceph RGW et compatibilité S3](https://docs.ceph.com/en/latest/radosgw/s3/)
- 🔐 [Loki — Sécurité et multi-tenancy](https://grafana.com/docs/loki/latest/operations/)

---

<div align="center">

:::note
**Guide Loki + S3 Ceph RGW · Kubernetes · Helm · Promtail · Grafana**

**Tous les blocs de code sont commentés ligne par ligne 🚀**
:::



</div>
