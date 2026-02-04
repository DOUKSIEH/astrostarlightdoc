---
title: "Kubernetes - Odoo"
description: "Guide d'Administration : Odoo, CloudNativePG & ngrok avec K8S"
created: "2026-02-03"
# updated: "2026-02-02"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"
# hide_table_of_contents: false
---

# 📚 Formation Complète : Architecture Odoo sur Kubernetes avec Talos Linux

## Table des Matières

1. [Vue d'ensemble de l'architecture](#1-vue-densemble-de-larchitecture)
2. [Spécialisation des nœuds avec les labels](#2-spécialisation-des-nœuds-avec-les-labels)
3. [Exposition externe avec ngrok](#3-exposition-externe-avec-ngrok)
4. [Déploiement sécurisé d'Odoo](#4-déploiement-sécurisé-dodoo)
5. [Haute disponibilité de la base de données](#5-haute-disponibilité-de-la-base-de-données)
6. [Guide de diagnostic et dépannage](#6-guide-de-diagnostic-et-dépannage)
7. [Bonnes pratiques de production](#7-bonnes-pratiques-de-production)

---

## 1. Vue d'ensemble de l'architecture

### 🎯 Objectif de l'infrastructure

Cette architecture vise à créer une plateforme Kubernetes **hybride** où :
- Les applications métier (Odoo + PostgreSQL) tournent sur des nœuds dédiés
- Les outils d'observabilité (monitoring, logs, SIEM) ont leurs propres ressources
- Chaque composant est isolé et optimisé selon ses besoins

### 🏗️ Architecture globale

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Cluster Talos Kubernetes                        │
│                                                                       │
│  ┌──────────────────────┐        ┌──────────────────────┐           │
│  │   Master Node        │        │   Master Nodes       │           │
│  │   (Control Plane)    │        │   (HA)               │           │
│  └──────────────────────┘        └──────────────────────┘           │
│                                                                       │
│  ┌───────────────────────────────────────────────────────┐          │
│  │              Worker Nodes (4 nœuds)                    │          │
│  │                                                         │          │
│  │  ┌─────────────┐  ┌─────────────┐                    │          │
│  │  │ Worker 1    │  │ Worker 2    │  ← Production      │          │
│  │  │ 4 GB RAM    │  │ 4 GB RAM    │     (Odoo + DB)    │          │
│  │  │ role=prod   │  │ role=prod   │                    │          │
│  │  └─────────────┘  └─────────────┘                    │          │
│  │                                                         │          │
│  │  ┌─────────────┐  ┌─────────────┐                    │          │
│  │  │ Worker 3    │  │ Worker 4    │  ← Monitoring      │          │
│  │  │ 6 GB RAM    │  │ 6 GB RAM    │     (ELK, Loki)    │          │
│  │  │ role=mon    │  │ role=mon    │                    │          │
│  │  └─────────────┘  └─────────────┘                    │          │
│  └───────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
```

### 📊 Répartition des ressources

| Nœud | RAM | CPU | Rôle | Charge de travail |
|------|-----|-----|------|-------------------|
| **Worker 1** | 4 GB | 2+ cores | Production | Odoo (backend web) |
| **Worker 2** | 4 GB | 2+ cores | Production | PostgreSQL (base de données) |
| **Worker 3** | 6 GB | 2+ cores | Monitoring | Elasticsearch, Kibana |
| **Worker 4** | 6 GB | 2+ cores | Monitoring | Loki, Grafana, Prometheus |

### 🎓 Pourquoi cette séparation ?

**Isolation des ressources**
- Les outils de monitoring consomment beaucoup de RAM (Elasticsearch surtout)
- Odoo et PostgreSQL ont besoin de performances stables
- En séparant, un pic de consommation sur les logs n'impacte pas la production

**Simplicité de gestion**
- Mise à l'échelle indépendante (ajouter des workers monitoring sans toucher à la prod)
- Maintenance ciblée (redémarrer le monitoring sans affecter les utilisateurs)
- Facturation séparée si vous êtes en cloud

---

## 2. Spécialisation des nœuds avec les labels

### 🏷️ Qu'est-ce qu'un label Kubernetes ?

Un **label** est une paire clé-valeur attachée à un objet Kubernetes (nœud, pod, service, etc.). C'est comme une étiquette autocollante que vous collez sur vos serveurs pour les catégoriser.

```yaml
# Exemple de label sur un nœud
metadata:
  labels:
    role: production          # Clé : role, Valeur : production
    capacity: high            # Clé : capacity, Valeur : high
    environment: staging      # Clé : environment, Valeur : staging
```

### 📌 Appliquer des labels aux nœuds

#### Commande de base

```bash
kubectl label node <nom-du-nœud> <clé>=<valeur>
```

#### Cas pratique : votre cluster

```bash
# Étiqueter les nœuds de production (4 GB)
kubectl label node talos-worker1 role=production
kubectl label node talos-worker2 role=production

# Étiqueter les nœuds de monitoring (6 GB)
kubectl label node talos-worker3 role=monitoring capacity=high
kubectl label node talos-worker4 role=monitoring capacity=high
```

**Résultat** :
```bash
$ kubectl get nodes --show-labels

NAME            STATUS   LABELS
talos-worker1   Ready    role=production
talos-worker2   Ready    role=production
talos-worker3   Ready    role=monitoring,capacity=high
talos-worker4   Ready    role=monitoring,capacity=high
```

### 🎯 Utiliser les labels pour placer les pods

Une fois les nœuds étiquetés, vous utilisez **nodeSelector** ou **affinity** dans vos déploiements pour forcer les pods à aller sur les bons nœuds.

#### Méthode 1 : nodeSelector (simple)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: odoo
spec:
  template:
    spec:
      nodeSelector:
        role: production  # Ce pod ira SEULEMENT sur les nœuds avec role=production
```

#### Méthode 2 : affinity (avancée, utilisée dans votre config)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: odoo
spec:
  template:
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:  # Règle STRICTE
            nodeSelectorTerms:
            - matchExpressions:
              - key: role
                operator: In            # Le nœud doit avoir...
                values: ["production"]  # ...role=production
```

### 🔍 Différence nodeSelector vs affinity

| Critère | nodeSelector | affinity |
|---------|--------------|----------|
| **Simplicité** | ✅ Très simple | ⚠️ Plus verbeux |
| **Flexibilité** | ❌ Basique (égalité seulement) | ✅ Avancée (In, NotIn, Exists, etc.) |
| **Règles multiples** | ❌ ET logique uniquement | ✅ ET/OU complexes |
| **Préférence vs Obligation** | ❌ Toujours obligatoire | ✅ `required` ou `preferred` |

**Exemple de règle complexe avec affinity :**
```yaml
affinity:
  nodeAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      nodeSelectorTerms:
      - matchExpressions:
        - key: role
          operator: In
          values: ["production"]
        - key: zone
          operator: NotIn        # ET zone != europe
          values: ["europe"]
```

### 🎓 Cas d'usage réels

**Scénario 1 : Garantir que PostgreSQL est sur production**
```yaml
# CloudNativePG Cluster
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: role
            operator: In
            values: ["production"]
```

**Scénario 2 : Préférer les nœuds avec haute capacité**
```yaml
affinity:
  nodeAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:  # Préférence, pas obligation
    - weight: 100
      preference:
        matchExpressions:
        - key: capacity
          operator: In
          values: ["high"]
```

### ⚙️ Vérifier le placement des pods

```bash
# Voir sur quel nœud tourne chaque pod
kubectl get pods -o wide -n odoo-v19

# Résultat attendu :
NAME        READY   STATUS    NODE
odoo-db-1   1/1     Running   talos-worker1  ✅ (production)
odoo-db-2   1/1     Running   talos-worker2  ✅ (production)
odoo-xxx    1/1     Running   talos-worker1  ✅ (production)
```

Si un pod se retrouve sur `talos-worker3` ou `talos-worker4`, c'est que l'affinity n'est pas configurée !

---

## 3. Exposition externe avec ngrok

### 🌐 Qu'est-ce que ngrok ?

**ngrok** est un service qui crée un **tunnel sécurisé** entre votre cluster Kubernetes (privé, sans IP publique) et Internet.

```
┌─────────────┐       Tunnel HTTPS        ┌──────────────┐
│  Internet   │ ←──────────────────────→  │  Cluster K8s │
│  (public)   │   https://xxx.ngrok.app   │  (privé)     │
└─────────────┘                            └──────────────┘
```

### 🔑 Pourquoi l'API Key et l'Authtoken ?

ngrok utilise **deux clés différentes** avec des rôles distincts :

#### 1️⃣ **API Key** (`credentials.apiKey`)

**Rôle** : Permet à l'opérateur ngrok de **gérer votre compte** via l'API ngrok.

**Ce qu'elle fait** :
- Créer/supprimer des tunnels programmatiquement
- Réserver des domaines (ex : `mon-odoo.ngrok.app`)
- Configurer des certificats TLS personnalisés
- Récupérer les IDs de vos ressources (comme `rd_xxx` pour un domaine réservé)

**Analogie** :
C'est comme la **carte d'accès administrateur** qui permet de configurer l'infrastructure.

#### 2️⃣ **Authtoken** (`credentials.authtoken`)

**Rôle** : Permet d'**ouvrir un tunnel** depuis votre cluster vers les serveurs ngrok.

**Ce qu'elle fait** :
- Authentifie chaque connexion tunnel
- Associe le tunnel à votre compte ngrok
- Permet le routage du trafic vers votre cluster

**Analogie** :
C'est comme le **badge de sécurité** que porte chaque employé pour entrer dans le bâtiment.

### 🔐 Schéma de fonctionnement

```
┌────────────────────────────────────────────────────────────────┐
│  1. Installation de l'opérateur ngrok                          │
│                                                                  │
│  helm upgrade --install ngrok-operator ngrok/ngrok-operator \  │
│    --set credentials.apiKey=$NGROK_API_KEY \                   │
│    --set credentials.authtoken=$NGROK_AUTHTOKEN                │
└────────────────┬───────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────┐
│  2. L'opérateur utilise l'API Key pour :                       │
│     - Récupérer la liste de vos domaines réservés             │
│     - Obtenir l'ID du domaine (ex: rd_2v9...)                 │
│     - Configurer les certificats TLS automatiques             │
└────────────────┬───────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────┐
│  3. Vous créez un objet Domain dans Kubernetes                 │
│                                                                  │
│  apiVersion: ngrok.k8s.ngrok.com/v1alpha1                      │
│  kind: Domain                                                   │
│  metadata:                                                      │
│    name: odoo-domain                                           │
│  spec:                                                          │
│    domain: mon-odoo.ngrok.app   # Doit exister sur ngrok.com  │
└────────────────┬───────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────┐
│  4. L'opérateur utilise l'Authtoken pour :                    │
│     - Ouvrir un tunnel HTTPS vers les serveurs ngrok          │
│     - Associer ce tunnel à votre domaine réservé              │
│     - Maintenir la connexion active                           │
└────────────────┬───────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────┐
│  5. Vous créez un Ingress Kubernetes                           │
│                                                                  │
│  kind: Ingress                                                  │
│  spec:                                                          │
│    ingressClassName: ngrok                                     │
│    rules:                                                       │
│    - host: mon-odoo.ngrok.app                                  │
│      http:                                                      │
│        paths:                                                   │
│        - path: /                                               │
│          backend:                                              │
│            service:                                            │
│              name: odoo                                        │
│              port: 8069                                        │
└────────────────┬───────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────┐
│  6. Flux de trafic final                                       │
│                                                                  │
│  Utilisateur                                                    │
│      ↓                                                          │
│  https://mon-odoo.ngrok.app                                    │
│      ↓                                                          │
│  Serveurs ngrok (Cloud)                                        │
│      ↓                                                          │
│  Tunnel HTTPS (authentifié par authtoken)                      │
│      ↓                                                          │
│  Ingress Controller (dans K8s)                                 │
│      ↓                                                          │
│  Service Odoo (port 8069)                                      │
│      ↓                                                          │
│  Pod Odoo                                                       │
└────────────────────────────────────────────────────────────────┘
```

### 📝 Installation complète de ngrok

#### Étape 1 : Récupérer vos clés

Connectez-vous sur https://dashboard.ngrok.com

```bash
# Dans Settings > API
export NGROK_API_KEY="2v9xxxxx_xxxxxxxxxxxxxxxxxxxxxxxx"

# Dans Getting Started > Your Authtoken
export NGROK_AUTHTOKEN="2v9xxxxx_xxxxxxxxxxxxxxxxxxxxxxxx"
```

#### Étape 2 : Installer l'opérateur

```bash
# Ajouter le repo Helm
helm repo add ngrok https://ngrok.github.io/kubernetes-ingress-controller
helm repo update

# Installer avec vos credentials
helm upgrade --install ngrok-operator ngrok/ngrok-operator \
  --namespace ngrok-operator \
  --create-namespace \
  --set credentials.apiKey=$NGROK_API_KEY \
  --set credentials.authtoken=$NGROK_AUTHTOKEN
```

#### Étape 3 : Vérifier l'installation

```bash
# Les pods doivent être Running
kubectl get pods -n ngrok-operator

# Résultat attendu :
NAME                                     READY   STATUS
ngrok-operator-manager-xxxxx             1/1     Running
ngrok-operator-agent-xxxxx               1/1     Running  ← Celui-ci gère les tunnels
```

#### Étape 4 : Réserver un domaine (sur ngrok.com)

1. Allez sur https://dashboard.ngrok.com/cloud-edge/domains
2. Cliquez sur "New Domain"
3. Choisissez un nom : `mon-odoo.ngrok.app`
4. Notez l'ID du domaine (commence par `rd_`)

#### Étape 5 : Créer l'objet Domain dans Kubernetes

```yaml
apiVersion: ngrok.k8s.ngrok.com/v1alpha1
kind: Domain
metadata:
  name: odoo-domain
  namespace: odoo-v19
spec:
  domain: mon-odoo.ngrok.app  # Le domaine que vous avez réservé
```

```bash
kubectl apply -f domain.yaml
```

#### Étape 6 : Créer l'Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: odoo-ingress
  namespace: odoo-v19
spec:
  ingressClassName: ngrok
  rules:
  - host: mon-odoo.ngrok.app
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: odoo
            port:
              number: 8069
```

```bash
kubectl apply -f ingress.yaml
```

### 🔍 Diagnostic ngrok

#### Vérifier que le domaine est validé

```bash
kubectl get domains -n odoo-v19

# Résultat attendu :
NAME           DOMAIN                 CNAME                    AGE
odoo-domain    mon-odoo.ngrok.app     xxx.ngrok-cname.com     5m
```

Si le champ `CNAME` est vide, il y a un problème.

#### Voir l'erreur détaillée

```bash
kubectl describe domain odoo-domain -n odoo-v19

# Cherchez dans Events :
# ✅ Normal   Synced   Domain synced successfully
# ❌ Warning  Error    Invalid API key
```

#### Vérifier que l'Ingress a une adresse

```bash
kubectl get ingress -n odoo-v19

# Résultat attendu :
NAME            CLASS   HOSTS                  ADDRESS                     PORTS
odoo-ingress    ngrok   mon-odoo.ngrok.app     https://mon-odoo.ngrok.app  80, 443
```

Si `ADDRESS` est vide, attendez 1-2 minutes ou vérifiez les logs :

```bash
kubectl logs -n ngrok-operator deployment/ngrok-operator-agent
```

### ⚠️ Erreurs fréquentes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `Invalid API key` | API Key incorrecte | Vérifier sur dashboard.ngrok.com |
| `Domain not found` | Domaine non réservé | Réserver le domaine sur ngrok.com d'abord |
| `Authtoken invalid` | Authtoken incorrect | Régénérer sur dashboard.ngrok.com |
| `Tunnel not connected` | Agent pod crashé | `kubectl logs -n ngrok-operator ngrok-operator-agent-xxx` |

---

## 4. Déploiement sécurisé d'Odoo

### 🔒 Les 3 problèmes de sécurité résolus

Votre manifeste Odoo corrige trois problèmes critiques :

1. **Permissions d'écriture sur les volumes**
2. **Sécurité du pod (PodSecurity)**
3. **Placement sur les bons nœuds (affinity)**

### 📋 Manifeste commenté ligne par ligne

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: odoo
  namespace: odoo-v19
spec:
  replicas: 1  # Une seule instance Odoo pour l'instant
  selector:
    matchLabels:
      app: odoo
  template:
    metadata:
      labels:
        app: odoo
    spec:
      # ═════════════════════════════════════════════════════════
      # PROBLÈME #3 : PLACEMENT SUR LES BONS NŒUDS
      # ═════════════════════════════════════════════════════════
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: role
                operator: In
                values: ["production"]
      # ✅ Ce pod ira UNIQUEMENT sur worker1 ou worker2
      
      # ═════════════════════════════════════════════════════════
      # PROBLÈME #1 : PERMISSIONS D'ÉCRITURE SUR LES VOLUMES
      # ═════════════════════════════════════════════════════════
      securityContext:
        fsGroup: 101  # Tous les fichiers créés appartiendront au groupe 101
      # 
      # 🎓 Explication de fsGroup :
      # - L'image Odoo utilise l'utilisateur "odoo" (UID 101, GID 101)
      # - Par défaut, les volumes sont créés avec root:root (UID 0, GID 0)
      # - Odoo ne peut pas écrire dedans → Permission denied
      # - fsGroup=101 fait que tous les fichiers du volume auront GID 101
      # - Odoo peut maintenant écrire dans /var/lib/odoo
      
      containers:
      - name: odoo
        image: odoo:17
        args: 
          - "--"
          - "-d"
          - "app"              # Nom de la base de données
          - "-i"
          - "base"             # Module à installer au démarrage
          - "--data-dir"
          - "/var/lib/odoo"    # Répertoire de données
        
        # ═════════════════════════════════════════════════════════
        # PROBLÈME #2 : SÉCURITÉ DU POD (PodSecurity)
        # ═════════════════════════════════════════════════════════
        securityContext:
          allowPrivilegeEscalation: false  # Empêche de devenir root
          runAsUser: 101                   # Tourne en tant qu'utilisateur 101 (odoo)
          capabilities:
            drop: ["ALL"]                  # Retire toutes les capacités système
        # 
        # ✅ Ces paramètres respectent le niveau PodSecurity "baseline"
        # ✅ Le pod ne peut pas escalader ses privilèges
        # ✅ Sécurité renforcée contre les attaques
        
        env:
          # Connexion à PostgreSQL
          - name: HOST
            value: "odoo-db-rw"  # Service CloudNativePG (read-write)
          - name: USER
            value: "app"
          - name: PASSWORD
            valueFrom:
              secretKeyRef:
                name: odoo-db-app  # Secret créé par CloudNativePG
                key: password
          
          # ═════════════════════════════════════════════════════════
          # FIX BONUS : VARIABLES D'ENVIRONNEMENT POUR LES FICHIERS
          # ═════════════════════════════════════════════════════════
          - name: HOME
            value: "/var/lib/odoo"
          # 🎓 Odoo essaie d'écrire dans $HOME/.local et $HOME/.config
          # Par défaut, HOME=/root mais on n'est pas root → Permission denied
          # En mettant HOME=/var/lib/odoo (avec fsGroup=101), ça fonctionne
          
          - name: XDG_DATA_HOME
            value: "/var/lib/odoo/.local/share"
          # 🎓 XDG = Spécification Linux pour les répertoires utilisateur
          # Odoo y stocke des fichiers de cache et de configuration
          
          - name: XDG_CONFIG_HOME
            value: "/var/lib/odoo/.config"
          # 🎓 Odoo y stocke sa configuration utilisateur
        
        volumeMounts:
          - name: odoo-data
            mountPath: /var/lib/odoo  # Point de montage du volume
      
      volumes:
        - name: odoo-data
          emptyDir: {}  # Volume temporaire (perdu si le pod redémarre)
```

### 🎓 Comprendre fsGroup en détail

#### Problème sans fsGroup

```
┌─────────────────────────────────────────────────────────┐
│  Volume créé par Kubernetes                              │
│  /var/lib/odoo/                                         │
│  Owner: root (UID 0)                                    │
│  Group: root (GID 0)                                    │
│  Permissions: drwxr-xr-x (755)                          │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Container Odoo essaie d'écrire                          │
│  User: odoo (UID 101)                                   │
│  Group: odoo (GID 101)                                  │
│                                                          │
│  $ touch /var/lib/odoo/test.txt                         │
│  ❌ touch: cannot touch 'test.txt': Permission denied   │
└─────────────────────────────────────────────────────────┘
```

#### Solution avec fsGroup

```
┌─────────────────────────────────────────────────────────┐
│  securityContext:                                        │
│    fsGroup: 101                                         │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  Volume modifié par Kubernetes au montage                │
│  /var/lib/odoo/                                         │
│  Owner: root (UID 0)                                    │
│  Group: odoo (GID 101)  ← Changé automatiquement !     │
│  Permissions: drwxrwsr-x (2775)  ← Ajout du bit setgid │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  Container Odoo peut maintenant écrire                   │
│  User: odoo (UID 101)                                   │
│  Group: odoo (GID 101)  ← Correspond au groupe du vol  │
│                                                          │
│  $ touch /var/lib/odoo/test.txt                         │
│  ✅ Fichier créé avec succès                            │
│  -rw-r--r-- 1 odoo odoo 0 test.txt                     │
└─────────────────────────────────────────────────────────┘
```

Le **bit setgid** (s dans `drwxrwsr-x`) fait que tous les nouveaux fichiers héritent automatiquement du groupe 101.

### 🔐 Comprendre les SecurityContext

#### Au niveau du Pod (securityContext global)

```yaml
spec:
  securityContext:
    fsGroup: 101              # Groupe des fichiers du volume
    runAsUser: 1000           # UID par défaut pour tous les containers
    runAsGroup: 1000          # GID par défaut pour tous les containers
    fsGroupChangePolicy: OnRootMismatch  # Optimisation (ne change que si nécessaire)
```

#### Au niveau du Container (securityContext spécifique)

```yaml
containers:
- name: odoo
  securityContext:
    runAsUser: 101                    # Surcharge le pod-level
    allowPrivilegeEscalation: false   # Empêche sudo, setuid, etc.
    readOnlyRootFilesystem: true      # Rend / en lecture seule
    capabilities:
      drop: ["ALL"]                   # Retire toutes les capacités Linux
      add: ["NET_BIND_SERVICE"]       # Ajoute seulement celle-ci si besoin
```

#### Capacités Linux expliquées

Les **capabilities** sont des permissions système très fines. Par défaut, un container a plusieurs capacités (ex : `CHOWN`, `SETUID`, `KILL`).

| Capacité | Ce qu'elle permet | Pourquoi la retirer |
|----------|-------------------|---------------------|
| `CHOWN` | Changer le propriétaire de fichiers | Attaquant pourrait prendre le contrôle de fichiers sensibles |
| `SETUID` | Changer d'utilisateur | Pourrait devenir root |
| `NET_ADMIN` | Modifier la config réseau | Pourrait sniffer le trafic |
| `SYS_ADMIN` | Opérations d'administration | Pourrait monter des volumes, modifier le kernel |

En mettant `drop: ["ALL"]`, on retire **toutes** ces capacités, rendant le container beaucoup plus sûr.

### 🌍 Comprendre les variables d'environnement XDG

XDG (X Desktop Group) est un standard Linux pour organiser les fichiers utilisateur.

| Variable | Chemin par défaut | Ce qui y est stocké |
|----------|-------------------|---------------------|
| `HOME` | `/root` ou `/home/user` | Répertoire personnel |
| `XDG_DATA_HOME` | `$HOME/.local/share` | Données d'application (cache, bases locales) |
| `XDG_CONFIG_HOME` | `$HOME/.config` | Fichiers de configuration |
| `XDG_CACHE_HOME` | `$HOME/.cache` | Fichiers temporaires/cache |
| `XDG_STATE_HOME` | `$HOME/.local/state` | État de l'application (logs, historique) |

**Pourquoi Odoo en a besoin ?**

```python
# Dans le code Python d'Odoo :
import os
config_dir = os.path.expanduser("~/.config/odoo")
data_dir = os.path.expanduser("~/.local/share/odoo")

# Si HOME=/root et qu'on n'est pas root → Permission denied
# Si HOME=/var/lib/odoo → ça fonctionne !
```

---

## 5. Haute disponibilité de la base de données

### 🗄️ CloudNativePG (CNPG) expliqué

CloudNativePG est un **opérateur Kubernetes** qui gère des clusters PostgreSQL avec :
- Haute disponibilité (plusieurs instances)
- Réplication automatique
- Failover automatique (si le primaire tombe, un replica devient primaire)
- Sauvegardes automatiques

### 🏗️ Architecture du cluster PostgreSQL

```
┌─────────────────────────────────────────────────────────────────┐
│                  Cluster CloudNativePG : odoo-db                 │
│                                                                   │
│  ┌──────────────────┐                 ┌──────────────────┐      │
│  │   odoo-db-1      │ ←─Réplication─→ │   odoo-db-2      │      │
│  │   (PRIMARY)      │                 │   (STANDBY)      │      │
│  │                  │                 │                  │      │
│  │  PostgreSQL 18   │                 │  PostgreSQL 18   │      │
│  │  Port 5432       │                 │  Port 5432       │      │
│  │                  │                 │                  │      │
│  │  PVC: 5Gi        │                 │  PVC: 5Gi        │      │
│  │  Worker 1        │                 │  Worker 2        │      │
│  └──────────────────┘                 └──────────────────┘      │
│          │                                     │                 │
│          └─────────────┬───────────────────────┘                 │
│                        │                                         │
│          ┌─────────────┴──────────────┐                         │
│          │   Services Kubernetes       │                         │
│          │                            │                         │
│          │  odoo-db-rw  (read-write) │ ← Pointe vers PRIMARY   │
│          │  odoo-db-ro  (read-only)  │ ← Pointe vers STANDBY   │
│          │  odoo-db-r   (read-any)   │ ← Load-balancing        │
│          └────────────────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

### 📊 Rôles des services

| Service | Cible | Usage | Exemple |
|---------|-------|-------|---------|
| `odoo-db-rw` | PRIMARY uniquement | Écritures (INSERT, UPDATE, DELETE) | Odoo backend |
| `odoo-db-ro` | STANDBY uniquement | Lectures lourdes (rapports) | Analytics |
| `odoo-db-r` | PRIMARY + STANDBY | Lectures légères (équilibrage) | API lecture |

### 🔄 Fonctionnement de la réplication

#### 1. Réplication streaming (par défaut)

```
┌──────────────────┐                    ┌──────────────────┐
│   PRIMARY        │                    │   STANDBY        │
│   odoo-db-1      │                    │   odoo-db-2      │
│                  │                    │                  │
│  1. INSERT INTO  │                    │                  │
│     users(...)   │                    │                  │
│                  │                    │                  │
│  2. Écrit dans   │                    │                  │
│     WAL (log)    │                    │                  │
│                  │                    │                  │
│  3. Envoie WAL ──┼──────────────────→ │  4. Reçoit WAL   │
│     via stream   │   TCP 5432         │                  │
│                  │                    │  5. Replay WAL   │
│                  │                    │     (applique    │
│                  │                    │     les modifs)  │
│                  │                    │                  │
│  Latence: ~10ms  │                    │  Délai: ~50ms    │
└──────────────────┘                    └──────────────────┘
```

**WAL** (Write-Ahead Log) = Journal de toutes les modifications, envoyé en continu au standby.

#### 2. Niveaux de synchronisation

CloudNativePG supporte 3 modes :

| Mode | Garantie | Performance | Risque de perte |
|------|----------|-------------|-----------------|
| **async** (par défaut) | Aucune | ✅ Rapide | Quelques secondes de données si crash |
| **sync** | Le standby confirme | ⚠️ Plus lent | Aucune (tolérance zéro) |
| **quorum** | N standbys confirment | ⚠️ Très lent | Aucune |

Votre config utilise **async** :
```yaml
spec:
  minSyncReplicas: 0  # 0 = async, 1+ = sync
  maxSyncReplicas: 0
```

### ⚡ Failover automatique

Si `odoo-db-1` (PRIMARY) tombe :

```
T=0s   ┌──────────────┐      ┌──────────────┐
       │  odoo-db-1   │      │  odoo-db-2   │
       │  PRIMARY ✅  │ ───→ │  STANDBY ✅  │
       └──────────────┘      └──────────────┘

T=1s   ┌──────────────┐      ┌──────────────┐
       │  odoo-db-1   │      │  odoo-db-2   │
       │  ❌ CRASH    │      │  STANDBY ✅  │
       └──────────────┘      └──────────────┘
              │                      │
              │                      ▼
              │              ┌──────────────────┐
              │              │ Opérateur CNPG   │
              │              │ détecte le crash │
              │              └──────────────────┘
              │                      │
T=3s          │                      ▼
              │              ┌──────────────────┐
              │              │ Promotion de     │
              │              │ odoo-db-2 en     │
              │              │ PRIMARY          │
              │              └──────────────────┘
              │                      │
              ▼                      ▼
       ┌──────────────┐      ┌──────────────┐
       │  odoo-db-1   │      │  odoo-db-2   │
       │  ❌ DOWN     │      │  PRIMARY ✅  │
       └──────────────┘      └──────────────┘
                                     │
T=10s                                ▼
                             ┌──────────────────┐
                             │ Service odoo-db-rw│
                             │ redirige vers     │
                             │ odoo-db-2         │
                             └──────────────────┘
```

**Temps d'indisponibilité typique** : 5-10 secondes

### 📦 Stockage persistant

Chaque instance PostgreSQL a son propre PVC (PersistentVolumeClaim) :

```bash
$ kubectl get pvc -n odoo-v19

NAME        STATUS   VOLUME                                     CAPACITY
odoo-db-1   Bound    pvc-889c9a7a-967a-451a-965a-b07dd9d40c42   5Gi
odoo-db-2   Bound    pvc-7b8c3d9e-123f-456g-789h-012i3j4k5l6m   5Gi
```

**Caractéristiques** :
- StorageClass : `local-path` (volumes locaux sur chaque worker)
- Taille : 5 Gi par instance
- AccessMode : `ReadWriteOnce` (un seul pod peut monter le volume en écriture)

**Attention** : Avec `local-path`, si un worker tombe, le volume est perdu. Pour la production, utilisez :
- **Ceph** (stockage distribué)
- **Longhorn** (simple à installer sur Kubernetes)
- **NFS** (si vous avez un NAS)

### 🔐 Credentials automatiques

CloudNativePG crée automatiquement des secrets :

```bash
$ kubectl get secrets -n odoo-v19

NAME                TYPE     DATA   AGE
odoo-db-app         Opaque   6      10m    ← Utilisateur applicatif
odoo-db-superuser   Opaque   6      10m    ← Superuser (postgres)
odoo-db-ca          Opaque   2      10m    ← Certificat CA pour TLS
odoo-db-replication Opaque   2      10m    ← Certificat pour réplication
odoo-db-server      Opaque   2      10m    ← Certificat serveur
```

**Récupérer le mot de passe** :

```bash
# Mot de passe de l'utilisateur "app"
kubectl get secret odoo-db-app -n odoo-v19 -o jsonpath='{.data.password}' | base64 -d

# Mot de passe du superuser "postgres"
kubectl get secret odoo-db-superuser -n odoo-v19 -o jsonpath='{.data.password}' | base64 -d
```

### 🧪 Tester la haute disponibilité

```bash
# 1. Voir le cluster actuel
kubectl cnpg status odoo-db -n odoo-v19

# 2. Identifier le primaire
kubectl get pods -n odoo-v19 -l role=primary

# 3. Supprimer le primaire (simule un crash)
kubectl delete pod odoo-db-1 -n odoo-v19

# 4. Observer le failover (5-10 secondes)
watch kubectl get pods -n odoo-v19

# 5. Vérifier que le nouveau primaire est odoo-db-2
kubectl cnpg status odoo-db -n odoo-v19
```

---

## 6. Guide de diagnostic et dépannage

### 🔍 Méthodologie de diagnostic

Quand quelque chose ne fonctionne pas, suivez cette méthode **top-down** :

```
1. Le site est-il accessible depuis Internet ?
   ↓ NON → Vérifier ngrok
   ↓ OUI
   
2. L'Ingress route-t-il vers le bon service ?
   ↓ NON → Vérifier Ingress
   ↓ OUI
   
3. Le service Odoo existe-t-il et a-t-il des endpoints ?
   ↓ NON → Vérifier Service
   ↓ OUI
   
4. Le pod Odoo est-il Running ?
   ↓ NON → Vérifier Pod (logs, describe)
   ↓ OUI
   
5. Odoo se connecte-t-il à PostgreSQL ?
   ↓ NON → Vérifier CloudNativePG
   ↓ OUI
   
6. Les données sont-elles présentes ?
   ↓ NON → Vérifier PVC/volumes
```

### 🌐 Diagnostic 1 : Tunnel ngrok

#### Vérifier que le domaine est validé

```bash
kubectl get domains -n odoo-v19
```

**Résultat attendu** :
```
NAME          DOMAIN                 CNAME                        AGE
odoo-domain   mon-odoo.ngrok.app     xxx.ngrok-cname.com         5m
```

**Si CNAME est vide** :
```bash
# Voir l'erreur
kubectl describe domain odoo-domain -n odoo-v19

# Erreurs fréquentes :
# - "Invalid API key" → Vérifier NGROK_API_KEY
# - "Domain not found" → Réserver le domaine sur ngrok.com
# - "Domain already claimed" → Un autre compte utilise ce domaine
```

#### Vérifier que l'Ingress a une adresse

```bash
kubectl get ingress -n odoo-v19
```

**Résultat attendu** :
```
NAME            CLASS   HOSTS                  ADDRESS                     PORTS
odoo-ingress    ngrok   mon-odoo.ngrok.app     https://mon-odoo.ngrok.app  80,443
```

**Si ADDRESS est vide** :
```bash
# Attendre 1-2 minutes, ou vérifier les logs de l'agent
kubectl logs -n ngrok-operator deployment/ngrok-operator-agent --tail=50

# Chercher des erreurs :
# - "Tunnel connection refused"
# - "Authtoken invalid"
# - "Rate limit exceeded"
```

#### Tester la connexion depuis Internet

```bash
curl -I https://mon-odoo.ngrok.app

# Résultat attendu :
# HTTP/2 200
# server: nginx
# ...
```

**Si erreur 502/503** :
- Le tunnel est OK mais Odoo ne répond pas
- Vérifier le pod Odoo (section suivante)

### 🗄️ Diagnostic 2 : CloudNativePG

#### Vérifier l'état du cluster

```bash
kubectl get cluster -n odoo-v19
```

**Résultat attendu** :
```
NAME      AGE   INSTANCES   READY   STATUS                     PRIMARY
odoo-db   1h    2           2       Cluster in healthy state   odoo-db-1
```

**États possibles** :
| Status | Signification | Action |
|--------|---------------|--------|
| `Cluster in healthy state` | ✅ Tout va bien | Rien |
| `Creating a new replica` | ⏳ En cours de déploiement | Attendre |
| `Cluster is not ready` | ❌ Problème grave | Vérifier les pods |
| `Cluster is unrecoverable` | 💀 PVCs perdus | Recréer le cluster |

#### Voir l'état détaillé

```bash
kubectl cnpg status odoo-db -n odoo-v19
```

**Résultat attendu** :
```
Cluster Summary
Name:             odoo-db
Namespace:        odoo-v19
System ID:        7234567890123456789
PostgreSQL Image: ghcr.io/cloudnative-pg/postgresql:18.1
Primary instance: odoo-db-1
Status:           Cluster in healthy state
Instances:        2
Ready instances:  2

Instances status
Name        Database Size  Current LSN  Replication role  Status  Node
----        -------------  -----------  ----------------  ------  ----
odoo-db-1   33 MB          0/6000098    Primary           OK      talos-worker1
odoo-db-2   33 MB          0/6000098    Standby (async)   OK      talos-worker2
```

**Points à vérifier** :
- ✅ `Current LSN` doit être identique (ou très proche) entre PRIMARY et STANDBY
- ✅ `Replication role` doit être clair (Primary vs Standby)
- ✅ `Status` doit être "OK" pour tous

**Si un standby est en retard** :
```
odoo-db-2   33 MB          0/4000000    Standby (async)   Replication lag   talos-worker2
                                                           ^^^^^^^^^^^^^^^^
```

Causes possibles :
- Réseau lent entre les workers
- Standby surchargé (CPU/RAM)
- Trop d'écritures sur le PRIMARY

#### Extraire le mot de passe

```bash
kubectl get secret odoo-db-app -n odoo-v19 -o jsonpath='{.data.password}' | base64 -d
```

#### Tester la connexion directe

```bash
# Depuis un pod de debug dans le cluster
kubectl run -it --rm debug --image=postgres:16 --restart=Never -- psql \
  -h odoo-db-rw.odoo-v19.svc.cluster.local \
  -U app \
  -d app

# Entrez le mot de passe extrait ci-dessus
# Si ça fonctionne :
app=> \dt
         List of relations
 Schema |  Name  | Type  | Owner
--------+--------+-------+-------
 public | users  | table | app
```

### 📦 Diagnostic 3 : Application Odoo

#### Vérifier que le pod est Running

```bash
kubectl get pods -n odoo-v19
```

**États possibles** :

| Status | Signification | Action |
|--------|---------------|--------|
| `Running` | ✅ Le pod tourne | Vérifier les logs |
| `Pending` | ⏳ En attente de scheduling | `kubectl describe pod` |
| `CrashLoopBackOff` | 💥 Le pod crash en boucle | Lire les logs |
| `ImagePullBackOff` | 🖼️ Impossible de télécharger l'image | Vérifier le nom de l'image |
| `Error` | ❌ Erreur au démarrage | `kubectl describe pod` |

#### Lire les logs

```bash
# Logs en temps réel
kubectl logs -f deployment/odoo -n odoo-v19

# 100 dernières lignes
kubectl logs deployment/odoo -n odoo-v19 --tail=100

# Logs du container précédent (si CrashLoop)
kubectl logs deployment/odoo -n odoo-v19 --previous
```

**Erreurs fréquentes dans les logs** :

| Erreur | Cause | Solution |
|--------|-------|----------|
| `psycopg2.OperationalError: could not connect to server` | PostgreSQL inaccessible | Vérifier CloudNativePG |
| `FATAL: password authentication failed` | Mauvais mot de passe | Vérifier le secret `odoo-db-app` |
| `PermissionError: [Errno 13] Permission denied: '/var/lib/odoo'` | fsGroup manquant | Ajouter `securityContext.fsGroup: 101` |
| `OSError: [Errno 28] No space left on device` | Volume plein | Augmenter la taille du PVC |
| `psycopg2.ProgrammingError: relation "res_users" does not exist` | Base vide | Odoo n'a pas initialisé la DB |

#### Vérifier les ressources (OOM Killed)

```bash
kubectl describe pod <nom-du-pod> -n odoo-v19 | grep -A 5 "Last State"
```

**Si vous voyez** :
```
Last State:     Terminated
  Reason:       OOMKilled
  Exit Code:    137
```

→ Le pod a été tué car il a dépassé sa limite de mémoire.

**Solution** :
```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "250m"
  limits:
    memory: "2Gi"     # Augmenter cette valeur
    cpu: "1000m"
```

#### Entrer dans le container

```bash
# Shell interactif
kubectl exec -it deployment/odoo -n odoo-v19 -- /bin/bash

# Vérifier les fichiers
ls -la /var/lib/odoo

# Vérifier la connexion DB
psql -h odoo-db-rw -U app -d app

# Vérifier les processus
ps aux | grep odoo
```

### 🖥️ Diagnostic 4 : Placement des pods

#### Voir sur quel worker tourne chaque pod

```bash
kubectl get pods -o wide -n odoo-v19
```

**Résultat attendu** :
```
NAME        READY   STATUS    NODE
odoo-db-1   1/1     Running   talos-worker1  ✅
odoo-db-2   1/1     Running   talos-worker2  ✅
odoo-xxx    1/1     Running   talos-worker1  ✅
```

**Si un pod est sur worker3 ou worker4** :
- L'affinity n'est pas configurée correctement
- Le nœud n'a pas le bon label

```bash
# Vérifier les labels des nœuds
kubectl get nodes --show-labels | grep role

# Ajouter le label si manquant
kubectl label node talos-worker1 role=production
```

#### Vérifier les ressources disponibles

```bash
# CPU et RAM par nœud
kubectl top node

# Résultat :
NAME            CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
talos-worker1   250m         12%    1500Mi          37%
talos-worker2   800m         40%    2800Mi          70%  ← PostgreSQL ici
talos-worker3   150m         7%     800Mi           13%
talos-worker4   200m         10%    1200Mi          20%
```

Si un nœud est à >80% de RAM, les pods risquent d'être evicted (expulsés).

---

## 7. Bonnes pratiques de production

### 🔒 Sécurité

#### 1. NetworkPolicies

Limitez le trafic réseau entre les pods :

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: odoo-network-policy
  namespace: odoo-v19
spec:
  podSelector:
    matchLabels:
      app: odoo
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ngrok-operator  # Seulement ngrok peut contacter Odoo
    ports:
    - protocol: TCP
      port: 8069
  egress:
  - to:
    - podSelector:
        matchLabels:
          cnpg.io/cluster: odoo-db  # Odoo peut seulement parler à PostgreSQL
    ports:
    - protocol: TCP
      port: 5432
  - to:  # DNS
    - namespaceSelector:
        matchLabels:
          name: kube-system
    ports:
    - protocol: UDP
      port: 53
```

#### 2. Secrets externes (Sealed Secrets)

Ne jamais committer les secrets dans Git. Utilisez **Sealed Secrets** :

```bash
# Installer le contrôleur
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml

# Créer un secret sealed
kubectl create secret generic odoo-db-password \
  --from-literal=password='SuperSecretPassword123' \
  --dry-run=client -o yaml | \
  kubeseal -o yaml > sealed-secret.yaml

# Committer sealed-secret.yaml dans Git (il est chiffré)
git add sealed-secret.yaml
```

#### 3. Scan d'images

Scannez vos images pour les vulnérabilités :

```bash
# Avec Trivy
trivy image odoo:17

# Résultat :
# CRITICAL: 3
# HIGH: 12
# MEDIUM: 45
```

### 📊 Monitoring

#### 1. Prometheus et Grafana

CloudNativePG expose des métriques Prometheus :

```yaml
# Dans le Cluster CNPG
spec:
  monitoring:
    enablePodMonitor: true  # Active les métriques
```

Dashboards Grafana recommandés :
- **CloudNativePG** : Dashboard ID 20417
- **Kubernetes** : Dashboard ID 15760
- **PostgreSQL** : Dashboard ID 9628

#### 2. Alertes critiques

```yaml
# PrometheusRule pour CloudNativePG
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: cnpg-alerts
spec:
  groups:
  - name: cloudnativepg
    rules:
    - alert: PostgreSQLDown
      expr: pg_up == 0
      for: 1m
      annotations:
        summary: "PostgreSQL instance {{ $labels.pod }} is down"
    
    - alert: ReplicationLag
      expr: pg_replication_lag_seconds > 60
      for: 5m
      annotations:
        summary: "Replication lag is {{ $value }}s on {{ $labels.pod }}"
```

### 💾 Sauvegardes

#### 1. Sauvegardes CloudNativePG

```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: odoo-db
spec:
  backup:
    barmanObjectStore:
      destinationPath: s3://my-bucket/backups/
      s3Credentials:
        accessKeyId:
          name: s3-creds
          key: ACCESS_KEY_ID
        secretAccessKey:
          name: s3-creds
          key: ACCESS_SECRET_KEY
    retentionPolicy: "30d"  # Garder 30 jours
```

#### 2. Sauvegardes manuelles

```bash
# Créer une sauvegarde
kubectl cnpg backup odoo-db -n odoo-v19

# Lister les sauvegardes
kubectl get backups -n odoo-v19

# Restaurer depuis une sauvegarde
kubectl cnpg restore odoo-db-restored \
  --cluster odoo-db \
  --backup odoo-db-20250203120000 \
  -n odoo-v19
```

### 📈 Performance

#### 1. Tuning PostgreSQL

```yaml
spec:
  postgresql:
    parameters:
      # Mémoire
      shared_buffers: "512MB"           # 25% de la RAM du pod
      effective_cache_size: "1536MB"    # 75% de la RAM du pod
      work_mem: "16MB"                  # RAM par opération de tri
      maintenance_work_mem: "128MB"     # RAM pour VACUUM, CREATE INDEX
      
      # Connexions
      max_connections: "200"
      
      # Checkpoints
      checkpoint_completion_target: "0.9"
      wal_buffers: "16MB"
      
      # Disque
      random_page_cost: "1.1"          # Pour SSD (4.0 pour HDD)
      effective_io_concurrency: "200"   # Pour SSD (2 pour HDD)
```

#### 2. Connection pooling avec PgBouncer

```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Pooler
metadata:
  name: odoo-pooler
spec:
  cluster:
    name: odoo-db
  instances: 3
  type: rw  # read-write
  pgbouncer:
    poolMode: transaction
    parameters:
      max_client_conn: "1000"
      default_pool_size: "25"
```

Puis dans Odoo, connectez-vous à `odoo-pooler-rw` au lieu de `odoo-db-rw`.

### 🔄 CI/CD

#### 1. GitOps avec ArgoCD

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: odoo-v19
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/votrecompany/odoo-k8s
    targetRevision: main
    path: manifests/odoo-v19
  destination:
    server: https://kubernetes.default.svc
    namespace: odoo-v19
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

#### 2. Tests de déploiement

```bash
#!/bin/bash
# deploy-test.sh

# 1. Déployer dans un namespace de staging
kubectl apply -f manifests/ -n odoo-staging

# 2. Attendre que les pods soient ready
kubectl wait --for=condition=ready pod -l app=odoo -n odoo-staging --timeout=300s

# 3. Tester l'API Odoo
curl -f http://odoo.odoo-staging.svc.cluster.local:8069/web/database/selector || exit 1

# 4. Si tout est OK, déployer en prod
kubectl apply -f manifests/ -n odoo-v19
```

### 📚 Documentation

Créez un runbook pour l'équipe ops :

```markdown
# Runbook Odoo Production

## Contacts d'urgence
- DevOps : +33 6 XX XX XX XX
- DBA : +33 6 YY YY YY YY

## Procédures

### Redémarrer Odoo sans downtime
1. Vérifier qu'il y a 2+ replicas : `kubectl get deploy odoo -n odoo-v19`
2. Scaler à 3 : `kubectl scale deploy odoo --replicas=3 -n odoo-v19`
3. Attendre que les 3 soient ready
4. Redémarrer : `kubectl rollout restart deploy odoo -n odoo-v19`
5. Revenir à 2 replicas une fois stabilisé

### Restaurer la base de données
1. Lister les backups : `kubectl get backups -n odoo-v19`
2. Créer un nouveau cluster : `kubectl cnpg restore ...`
3. Tester la connexion
4. Basculer Odoo vers le nouveau cluster
```

---

## 🎓 Récapitulatif et Quiz

### Points clés à retenir

1. **Labels** : Permettent de catégoriser et placer intelligemment les pods sur les bons nœuds
2. **Affinity** : Contrôle strict du placement (production vs monitoring)
3. **ngrok** : Exposition sécurisée sans IP publique (API Key + Authtoken)
4. **SecurityContext** : fsGroup + runAsUser + capabilities pour la sécurité
5. **CloudNativePG** : Haute disponibilité PostgreSQL avec réplication automatique
6. **Diagnostic** : Approche top-down (Internet → Ingress → Service → Pod → DB)

### Questions de compréhension

1. **Pourquoi séparer les nœuds production et monitoring ?**
   <details>
   <summary>Réponse</summary>
   Pour isoler les ressources et éviter qu'un pic sur les outils de monitoring (Elasticsearch) n'impacte les performances d'Odoo en production.
   </details>

2. **Quelle est la différence entre l'API Key et l'Authtoken ngrok ?**
   <details>
   <summary>Réponse</summary>
   - API Key : Gère votre compte (créer domaines, tunnels) via l'API
   - Authtoken : Authentifie les connexions tunnel depuis votre cluster
   </details>

3. **Pourquoi utiliser fsGroup: 101 ?**
   <details>
   <summary>Réponse</summary>
   Pour que les fichiers créés dans le volume aient le groupe 101 (odoo), permettant au container (qui tourne en tant qu'utilisateur 101) d'écrire dedans.
   </details>

4. **Que se passe-t-il si le PRIMARY PostgreSQL tombe ?**
   <details>
   <summary>Réponse</summary>
   L'opérateur CloudNativePG détecte la panne (3s), promeut le STANDBY en PRIMARY (5s), et redirige le service odoo-db-rw vers la nouvelle instance (2s). Downtime total : ~10 secondes.
   </details>

5. **Comment vérifier que les pods Odoo sont sur les bons workers ?**
   <details>
   <summary>Réponse</summary>
   `kubectl get pods -o wide -n odoo-v19` et vérifier la colonne NODE. Ils doivent être sur talos-worker1 ou talos-worker2 uniquement.
   </details>

---

## 📖 Ressources supplémentaires

### Documentation officielle

- **Kubernetes** : https://kubernetes.io/docs/
- **Talos Linux** : https://www.talos.dev/
- **CloudNativePG** : https://cloudnative-pg.io/
- **ngrok** : https://ngrok.com/docs/k8s/
- **Odoo** : https://www.odoo.com/documentation/

### Outils recommandés

- **k9s** : Interface terminal pour Kubernetes
- **Lens** : IDE graphique pour Kubernetes
- **kubectx/kubens** : Switcher rapidement de contexte/namespace
- **stern** : Logs multi-pods en temps réel
- **kube-capacity** : Voir les ressources disponibles

### Commandes utiles

```bash
# Installer k9s
brew install derailed/k9s/k9s  # macOS
# ou télécharger depuis https://github.com/derailed/k9s/releases

# Installer kubectx
brew install kubectx  # macOS

# Installer stern
brew install stern  # macOS

# Utilisation
k9s                              # Interface interactive
kubectx                          # Lister les contextes
kubens odoo-v19                  # Switcher de namespace
stern odoo -n odoo-v19           # Logs de tous les pods odoo
```

---



> 🎉 Cette documentation devrait vous donner toutes les clés pour comprendre, déployer et maintenir votre infrastructure Odoo sur Kubernetes avec Talos Linux !
