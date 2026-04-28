---
title: "📘 Installation d'AWX Operator sur Kubernetes (Talos)"
description: "Guide pratique : Installation d'AWX Operator sur Kubernetes (Talos)"
created: "2026-04-27"
updated: "2026-04-28"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"
---



> **Documentation pédagogique** : déployer AWX (la version open-source d'Ansible Tower) sur un cluster Kubernetes basé sur Talos Linux, en utilisant Helm et l'Operator officiel.

---

## 🎯 Objectif

À la fin de ce guide, tu auras :

- Un **AWX Operator** qui tourne dans ton cluster et qui agit comme un "chef d'orchestre"
- Une **instance AWX** complète (PostgreSQL + Web UI + Task workers)
- Une configuration adaptée aux **contraintes de sécurité de Talos Linux**
- Les bons réflexes pour **déboguer** en cas de souci

---

## 🧠 Comprendre l'architecture avant de commencer

Avant de taper des commandes, il faut comprendre ce qu'on va installer. Sinon, en cas d'erreur, tu seras perdu.

### Les 3 couches du déploiement

```
┌─────────────────────────────────────────────────┐
│  Couche 1 : HELM (le "package manager")        │
│  → Installe l'AWX Operator                      │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  Couche 2 : OPERATOR (le "chef d'orchestre")   │
│  → Surveille les ressources de type "AWX"       │
│  → Crée les pods, services, secrets, etc.       │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  Couche 3 : INSTANCE AWX (l'application)       │
│  → PostgreSQL (base de données)                 │
│  → Web (interface utilisateur)                  │
│  → Task (exécution des playbooks Ansible)       │
└─────────────────────────────────────────────────┘
```

> 💡 **Analogie simple** : Helm est l'épicier qui livre les ingrédients. L'Operator est le cuisinier qui prépare le plat. L'instance AWX est le plat servi.

---

## ⚙️ Prérequis

Avant de commencer, vérifie que tu as bien :

| Élément | Pourquoi |
|---|---|
| Un cluster Kubernetes (ici **Talos**) | C'est notre infrastructure |
| `kubectl` configuré | Pour parler au cluster |
| `helm` installé (v3+) | Pour installer l'Operator |
| Une **StorageClass** fonctionnelle (ex: `local-path`) | PostgreSQL a besoin de stockage persistant |
| Au moins **2 vCPU et 4 Go de RAM** dispo dans le cluster | AWX est gourmand |

Vérification rapide :

```bash
# Vérifier la connexion au cluster
kubectl cluster-info

# Vérifier les StorageClass disponibles
kubectl get storageclass

# Vérifier la version de Helm
helm version
```

---

## 1️⃣ Préparation : créer un namespace dédié

**Bonne pratique de sécurité** 🛡️ : on isole AWX dans son propre namespace pour appliquer des règles RBAC, NetworkPolicies et quotas spécifiques.

```bash
# Création d'un namespace isolé pour AWX
kubectl create namespace awx

# (Optionnel mais recommandé) Labelliser le namespace
# Cela permet d'appliquer des Pod Security Standards plus tard
kubectl label namespace awx \
    pod-security.kubernetes.io/enforce=baseline \
    pod-security.kubernetes.io/warn=restricted
```

> 🔐 **Sécurité** : ne jamais déployer AWX dans le namespace `default`. Cela évite les conflits et limite les permissions.

---

## 2️⃣ Installation de l'AWX Operator via Helm

L'Operator est le "cerveau" 🧠 : il surveille en permanence les ressources Kubernetes de type `AWX` et crée tout ce qu'il faut (pods, services, secrets...) pour que ton instance fonctionne.

### Étape 2.1 : Ajouter le repo Helm officiel

```bash
# Ajout du dépôt Helm officiel maintenu par la communauté Ansible
helm repo add awx-operator https://ansible.github.io/awx-operator/

# Mise à jour du cache local pour récupérer la dernière version disponible
helm repo update

# (Bonne pratique) Vérifier les versions disponibles avant d'installer
helm search repo awx-operator --versions | head -5
```

### Étape 2.2 : Installer l'Operator seul

> ⚠️ **Important** : on installe **uniquement** l'Operator dans un premier temps, **pas** l'instance AWX. On gardera le contrôle sur la configuration de l'instance via notre propre fichier YAML.

```bash
# Installation de l'Operator (version épinglée pour la reproductibilité)
helm install awx-operator awx-operator/awx-operator \
    --namespace awx \
    --version 2.19.1 \
    --set AWX.enabled=false
    # ↑ AWX.enabled=false : on n'installe PAS encore l'instance AWX,
    #   uniquement l'Operator. On déploiera l'instance manuellement
    #   pour avoir le contrôle total sur sa configuration.
```

> 💡 **Bonne pratique** : toujours **épingler la version** (`--version`) en production. Sans ça, une mise à jour du repo pourrait casser ton déploiement de manière imprévisible.

### Étape 2.3 : Vérifier que l'Operator tourne

```bash
# Lister les pods dans le namespace awx
kubectl get pods -n awx

# Tu dois voir quelque chose comme :
# NAME                                               READY   STATUS    RESTARTS   AGE
# awx-operator-controller-manager-xxxxxxxxxx-xxxxx   2/2     Running   0          1m
```

Le `2/2` signifie que les 2 conteneurs du pod (le manager + le RBAC proxy) sont prêts. Si tu vois `1/2` ou `CrashLoopBackOff`, on regardera dans la section debug.

---

## 3️⃣ Configurer l'instance AWX (le fichier `awx.yaml`)

C'est ici que se joue toute la "magie" 🪄 pour faire fonctionner AWX sur **Talos Linux**, qui a des règles de sécurité plus strictes que les autres distributions Kubernetes.

### Pourquoi Talos pose problème ?

Talos est une distribution Linux **immutable et sécurisée** dédiée à Kubernetes. Par défaut, elle :

- Monte les volumes persistants en `root:root` (UID 0)
- Applique des SecurityContextConstraints stricts
- Empêche les conteneurs de tourner en root

Or, **PostgreSQL doit tourner avec l'UID 26** (`postgres`) et **doit pouvoir écrire** dans son dossier de données. Sans configuration, on obtient l'erreur classique :

```
chown: changing ownership of '/var/lib/pgsql/data': Permission denied
```

### Solution : le fichier `awx.yaml`

Crée un fichier `awx.yaml` avec ce contenu :

```yaml
# ============================================
# Définition d'une instance AWX gérée par l'Operator
# ============================================
apiVersion: awx.ansible.com/v1beta1
kind: AWX                              # Type de ressource créé par l'Operator
metadata:
  name: awx-server                     # Nom de l'instance (utilisé partout)
  namespace: awx                       # Doit correspondre à où l'Operator tourne

spec:
  # ========================================
  # 1. SERVICE & ACCÈS RÉSEAU
  # ========================================
  # ClusterIP = pas exposé en dehors du cluster (sécurisé par défaut)
  # On fera un port-forward ou on ajoutera un Ingress plus tard
  service_type: ClusterIP

  # ========================================
  # 2. STOCKAGE PERSISTANT
  # ========================================
  # StorageClass utilisée pour le PVC de PostgreSQL
  # ⚠️ Adapte ce nom à ce que renvoie 'kubectl get storageclass'
  postgres_storage_class: local-path

  # Taille du volume PostgreSQL (par défaut 8Gi, on peut augmenter)
  postgres_storage_requirements:
    requests:
      storage: 10Gi

  # ========================================
  # 3. CORRECTIFS DE SÉCURITÉ POUR TALOS 🛡️
  # ========================================
  # CRUCIAL pour Talos : active un init-container qui corrige
  # les permissions du dossier /var/lib/pgsql/data AVANT le démarrage
  # de PostgreSQL. Sans ça → "Permission denied".
  postgres_data_volume_init: true

  # Force l'UID/GID Postgres (26) sur le pod et sur le volume
  # - runAsUser: 26 → le processus tourne en tant qu'utilisateur postgres
  # - fsGroup: 26 → Kubernetes change le propriétaire du volume monté
  postgres_security_context_settings:
    runAsUser: 26
    fsGroup: 26
    runAsNonRoot: true                 # Bonne pratique : interdire root

  # Sécurité pour les pods AWX (Web et Task)
  # UID 1000 = utilisateur "awx" non-privilégié dans l'image
  security_context_settings:
    runAsUser: 1000
    fsGroup: 1000
    runAsNonRoot: true

  # ========================================
  # 4. DIMENSIONNEMENT (RESSOURCES) 📊
  # ========================================
  # On définit des "requests" (minimum garanti) modestes
  # pour permettre le déploiement sur de petits clusters.
  # ⚠️ En production, monte ces valeurs ET ajoute des "limits".

  postgres_resource_requirements:
    requests:
      cpu: "100m"                      # 0.1 vCPU minimum
      memory: "512Mi"                  # 512 Mo minimum
    limits:                            # ⬅️ AJOUT recommandé en prod
      cpu: "1000m"
      memory: "2Gi"

  web_resource_requirements:
    requests:
      cpu: "100m"
      memory: "512Mi"
    limits:
      cpu: "1000m"
      memory: "2Gi"

  task_resource_requirements:
    requests:
      cpu: "100m"
      memory: "1Gi"                    # Task = plus de RAM (exécute Ansible)
    limits:
      cpu: "2000m"
      memory: "4Gi"

  # ========================================
  # 5. RÉPLICATION (HAUTE DISPONIBILITÉ) - optionnel
  # ========================================
  # Pour un environnement de prod, augmente ces valeurs.
  # Pour un lab/test, laisse à 1.
  replicas: 1
```

### 🔍 Décryptage des paramètres critiques pour Talos

| Paramètre | Rôle | Si tu le retires... |
|---|---|---|
| `postgres_data_volume_init: true` | Lance un init-container en root pour `chown` le volume avant que Postgres démarre | PostgreSQL crashe au boot avec "Permission denied" |
| `fsGroup: 26` | Demande à Kubernetes de changer le groupe propriétaire du volume vers GID 26 | Postgres ne peut pas écrire ses fichiers |
| `runAsUser: 26` | Force le processus PostgreSQL à tourner en tant qu'UID 26 | Risque de tourner en root → refus par Talos |
| `runAsNonRoot: true` | Refuse explicitement le démarrage en root | (Bonne pratique de sécurité) |

> 📝 **Note pédagogique** : sur Talos, l'erreur `Permission denied` sur Postgres arrive parce que l'hôte monte le volume en `root:root`. Les paramètres `fsGroup: 26` et `postgres_data_volume_init: true` sont tes **deux boucliers principaux** pour forcer Kubernetes à donner les bons droits à l'utilisateur Postgres.

---

## 4️⃣ Déploiement et suivi

### Étape 4.1 : Appliquer la configuration

```bash
# Applique le fichier de configuration au cluster
kubectl apply -f awx.yaml -n awx

# Tu devrais voir : awx.awx.ansible.com/awx-server created
```

À partir de ce moment, l'Operator détecte qu'une nouvelle ressource `AWX` existe et commence son travail. C'est le **workflow de réconciliation** :

```
1. Operator détecte la ressource AWX
2. → Crée les Secrets (mots de passe, clés)
3. → Crée le PVC pour Postgres
4. → Démarre le pod Postgres
5. → Attend que Postgres soit prêt
6. → Lance le Job de migration (création des tables)
7. → Démarre le pod Web
8. → Démarre le pod Task
9. → Status: Successful 🎉
```

### Étape 4.2 : Surveiller dans le bon ordre

> 🎓 **Conseil pédagogique** : ne lance **PAS** tous ces `kubectl get` en boucle au hasard. Suis **l'ordre du workflow** ci-dessous pour identifier exactement où ça bloque si quelque chose va mal.

#### 🔎 Étape A : Les logs de l'Operator (le chef d'orchestre)

```bash
# Suivre en direct les logs de l'Operator pour voir s'il rencontre des erreurs
kubectl logs -f deployment/awx-operator-controller-manager \
    -n awx \
    -c awx-manager
# ↑ -c awx-manager : on cible le bon conteneur (le pod en a 2)
# Ctrl+C pour quitter
```

Ce que tu cherches :
- ✅ `PLAY RECAP` avec `failed=0` → tout va bien
- ❌ `failed=1` ou messages `ERROR` → un problème à creuser

#### 🔎 Étape B : PostgreSQL doit démarrer en premier

```bash
# Surveiller spécifiquement le pod Postgres
kubectl get pods -n awx \
    -l "app.kubernetes.io/component=database" \
    --watch
# Ctrl+C pour quitter
```

Tu attends `Running 1/1`. Si ça reste en `Init:0/1`, c'est que l'init-container de permissions tourne encore (normal).

#### 🔎 Étape C : Le job de migration

```bash
# Lister les jobs (création des tables, données initiales)
kubectl get jobs -n awx

# Le job 'awx-server-migration-xxx' doit finir en COMPLETIONS 1/1
```

#### 🔎 Étape D : Web et Task démarrent à la fin

```bash
# Vue d'ensemble finale
kubectl get all -n awx
```

Tu dois voir, à terme :

```
pod/awx-operator-controller-manager-xxx   2/2  Running
pod/awx-server-postgres-15-0              1/1  Running
pod/awx-server-task-xxx                   4/4  Running
pod/awx-server-web-xxx                    3/3  Running
```

> ⏱️ **Patience** : le déploiement complet prend généralement **5 à 10 minutes**.

---

## 5️⃣ Post-installation : accès et administration

Une fois que tout est en `Running`, il faut récupérer le mot de passe admin (généré aléatoirement) et accéder à l'interface.

### Étape 5.1 : Récupérer le mot de passe admin

```bash
# Le mot de passe est stocké dans un Secret Kubernetes (encodé en base64)
kubectl get secret awx-server-admin-password \
    -n awx \
    -o jsonpath="{.data.password}" \
    | base64 --decode \
    && echo
# ↑ '&& echo' ajoute juste un saut de ligne pour la lisibilité
```

> 🔐 **Bonne pratique de sécurité** :
> - **Change ce mot de passe** dès la première connexion
> - **Ne stocke jamais** ce mot de passe en clair dans Git ou Slack
> - Pour la production, utilise un gestionnaire de secrets (Vault, Sealed Secrets, External Secrets Operator)

### Étape 5.2 : Accéder à l'interface (port-forward pour les tests)

```bash
# Crée un tunnel local entre ton poste et le service AWX
kubectl port-forward service/awx-server-service \
    -n awx \
    --address 0.0.0.0 \
    8080:80
# ↑ 8080 = port local, 80 = port du service dans le cluster
# ↑ --address 0.0.0.0 = accessible depuis n'importe quelle interface
#   (à RETIRER si tu veux limiter à localhost uniquement = plus sécurisé)
```

Puis ouvre ton navigateur sur : **http://localhost:8080**

- **Utilisateur** : `admin`
- **Mot de passe** : (celui récupéré à l'étape 5.1)

> ⚠️ **Le port-forward, c'est pour les tests !** En production, expose AWX via un **Ingress** avec **TLS (HTTPS)** et idéalement une **authentification SSO** (LDAP, OIDC, SAML).

### Étape 5.3 (Production) : Exposer via un Ingress sécurisé

Exemple minimal d'Ingress avec cert-manager (à adapter à ton cluster) :

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: awx-ingress
  namespace: awx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod   # cert-manager
    nginx.ingress.kubernetes.io/proxy-body-size: "200m"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - awx.exemple.com
      secretName: awx-tls
  rules:
    - host: awx.exemple.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: awx-server-service
                port:
                  number: 80
```

---

## 6️⃣ 🧰 Boîte à outils "Debug" (en cas de pépin)

Voici les commandes essentielles à connaître pour diagnostiquer un problème.

### Tableau récapitulatif

| Commande | Utilité |
|---|---|
| `kubectl explain awx.spec` | Voir **tous les paramètres** acceptés par TON operator (très utile pour les versions différentes) |
| `kubectl describe awx awx-server -n awx` | Voir les **événements** de haut niveau (erreurs de configuration, état général) |
| `kubectl describe pod <pod_name> -n awx` | Voir pourquoi un pod est bloqué (Pending, ImagePullBackOff, etc.) |
| `kubectl logs -f <pod_name> -n awx` | Voir pourquoi un conteneur **crashe** (erreurs applicatives) |
| `kubectl logs -f <pod_name> -n awx -c <container>` | Cibler un conteneur précis dans un pod multi-conteneurs |
| `kubectl logs <pod_name> -n awx --previous` | Voir les logs du conteneur **avant son crash** (très utile en CrashLoopBackOff) |
| `kubectl rollout restart deployment <name> -n awx` | Forcer un redémarrage propre après une modif de config |
| `kubectl get events -n awx --sort-by='.lastTimestamp'` | Voir tous les événements du namespace **dans l'ordre chronologique** |

### Cas concrets fréquents

#### 🚨 Cas 1 : Postgres en `CrashLoopBackOff` avec "Permission denied"

```bash
# Vérifier les logs
kubectl logs -n awx awx-server-postgres-15-0
# Si tu vois "Permission denied" → c'est le problème Talos
```

**Solution** : vérifier que `postgres_data_volume_init: true` et `fsGroup: 26` sont bien dans ton `awx.yaml`, puis :

```bash
# Supprimer le PVC corrompu (⚠️ perte des données Postgres)
kubectl delete pvc -n awx postgres-15-awx-server-postgres-15-0
# Réappliquer la config
kubectl apply -f awx.yaml -n awx
```

#### 🚨 Cas 2 : Le pod reste en `Pending`

```bash
kubectl describe pod <nom_du_pod> -n awx
# Regarde la section "Events" en bas
```

Causes courantes :
- Pas assez de ressources CPU/RAM dans le cluster → réduire les `requests`
- Pas de StorageClass disponible → vérifier `postgres_storage_class`
- Problème de PVC → `kubectl get pvc -n awx`

#### 🚨 Cas 3 : Erreurs de réconciliation côté Operator

```bash
# Logs détaillés de l'Operator
kubectl logs -f deployment/awx-operator-controller-manager \
    -n awx \
    -c awx-manager \
    --tail=100
```

Si tu vois des erreurs Ansible (`failed=1`), lis attentivement le `msg:` qui explique le problème exact.

---

## 🛡️ Bonnes pratiques de sécurité (récap)

Voici un checklist à valider **avant** de mettre AWX en production :

- [ ] Namespace **dédié** avec Pod Security Standards activés
- [ ] **Mot de passe admin changé** dès la première connexion
- [ ] **Pas de port-forward** en production → **Ingress + HTTPS** obligatoires
- [ ] Mots de passe et secrets stockés dans **Vault** ou **Sealed Secrets**, jamais en clair
- [ ] **Limites de ressources** (`limits.cpu`, `limits.memory`) définies pour tous les pods
- [ ] **NetworkPolicy** restreignant les communications entrantes/sortantes du namespace `awx`
- [ ] **Backups réguliers** de la base PostgreSQL (CronJob ou Velero)
- [ ] **RBAC strict** : un compte admin AWX ≠ un compte cluster-admin Kubernetes
- [ ] **Authentification SSO** (LDAP/OIDC) pour les utilisateurs AWX
- [ ] **Versions épinglées** pour Helm chart et image AWX (reproductibilité)
- [ ] **Surveillance / Monitoring** : Prometheus + Grafana sur les pods AWX
- [ ] **Rotation des credentials** (DB password, secret_key) planifiée

---

## 7️⃣ 🧹 Nettoyage total (le "Fresh Start")

Après un test, une démo, ou en cas d'installation foireuse, on **désinstalle proprement** pour s'assurer qu'aucun résidu ne vienne polluer une éventuelle nouvelle installation.

### Pourquoi un nettoyage en plusieurs étapes ?

> 🎓 **Le piège classique** : faire `kubectl delete namespace awx` directement.
>
> Ça **semble** fonctionner, mais ça peut bloquer indéfiniment si une ressource a un **finalizer** (un "verrou" qui empêche la suppression tant qu'une condition n'est pas remplie). Résultat : ton namespace reste coincé en `Terminating` pendant des heures.

La bonne approche, c'est de supprimer les ressources **dans l'ordre inverse de leur création** :

```
Ordre de création (installation)        Ordre de suppression (nettoyage)
────────────────────────────────        ─────────────────────────────────
1. Namespace                            1. Instance AWX (pods, services)
2. Operator (Helm)                      2. Operator (Helm uninstall)
3. Instance AWX (CRD)                   3. Ressources résiduelles (PVC, Secrets)
4. Pods, services, PVC...               4. Namespace (en dernier)
```

### Étape 7.1 : Supprimer l'instance AWX

```bash
# Supprime la ressource custom AWX
# L'Operator va automatiquement nettoyer les pods, services et configmaps associés
kubectl delete awx awx-server -n awx --wait=false
# ↑ --wait=false : on ne bloque pas le terminal en attendant la fin
#                   (utile si une ressource a un finalizer qui traîne)
```

> 💡 **Que se passe-t-il en arrière-plan ?** L'Operator détecte la suppression et lance son cycle de "déconstruction" : arrêt des pods Web/Task, puis Postgres, puis suppression des services et configmaps qu'il avait créés.

### Étape 7.2 : Supprimer l'Operator via Helm

```bash
# Helm sait ce qu'il a installé → il sait aussi tout désinstaller proprement
helm uninstall awx-operator -n awx

# Vérification : le pod controller-manager doit disparaître
kubectl get pods -n awx
```

### Étape 7.3 : Nettoyer les ressources résiduelles

Même après les étapes 7.1 et 7.2, certaines ressources **persistent volontairement** pour éviter une perte de données accidentelle. Il faut les supprimer manuellement.

```bash
# Suppression des Persistent Volume Claims (= les disques de PostgreSQL)
# ⚠️ ATTENTION : cela supprime DÉFINITIVEMENT les données AWX !
kubectl delete pvc --all -n awx

# Suppression des Secrets (mots de passe admin, clés DB, certificats internes)
kubectl delete secrets --all -n awx

# Suppression des Jobs résiduels (migrations terminées qui restent en historique)
kubectl delete jobs --all -n awx
```

> 🛡️ **Bonne pratique sécurité** : avant de supprimer les PVC en production, **fais un backup** de la base PostgreSQL ! Une fois le PVC supprimé, les données sont **irrécupérables** (sauf snapshot du stockage sous-jacent).
>
> ```bash
> # Exemple de backup rapide AVANT suppression
> kubectl exec -n awx awx-server-postgres-15-0 -- \
>     pg_dumpall -U postgres > awx-backup-$(date +%Y%m%d).sql
> ```

### Étape 7.4 (optionnelle) : Recréer le namespace de zéro

Si tu veux **vraiment** repartir d'une page blanche (par exemple pour réinstaller proprement) :

```bash
# Suppression complète du namespace (et de TOUT ce qu'il contient)
kubectl delete namespace awx

# Vérifier qu'il a bien disparu (et pas en Terminating)
kubectl get namespace awx
# → Doit retourner : Error from server (NotFound)

# Recréation du namespace pour une nouvelle installation
kubectl create namespace awx
```

### 🚨 Que faire si le namespace reste bloqué en `Terminating` ?

C'est le cauchemar classique : ton namespace est en `Terminating` depuis 10 minutes et rien ne bouge. Voici comment diagnostiquer :

```bash
# 1. Voir ce qui bloque la suppression
kubectl get namespace awx -o yaml | grep -A 5 finalizers

# 2. Lister les ressources qui résistent encore
kubectl api-resources --verbs=list --namespaced -o name \
    | xargs -n 1 kubectl get --show-kind --ignore-not-found -n awx
```

Si tu vois une ressource AWX résiduelle avec un finalizer, tu peux le retirer **en dernier recours** :

```bash
# ⚠️ Attention : à utiliser uniquement si tu es sûr de toi
kubectl patch awx awx-server -n awx \
    -p '{"metadata":{"finalizers":[]}}' \
    --type=merge
```

> 📝 **Note pédagogique** : un finalizer, c'est un "garde-fou" que les Operators ajoutent pour pouvoir nettoyer **proprement** leurs ressources avant la suppression. Le retirer manuellement contourne ce nettoyage → c'est pourquoi c'est à n'utiliser qu'en dernier recours, après avoir compris **pourquoi** il bloque.

### Tableau récap : checklist de nettoyage

| Étape | Commande | Effet |
|---|---|---|
| 1 | `kubectl delete awx awx-server -n awx` | Supprime l'instance AWX (pods, services) |
| 2 | `helm uninstall awx-operator -n awx` | Supprime l'Operator + ses CRDs |
| 3 | `kubectl delete pvc --all -n awx` | ⚠️ Supprime les **données** PostgreSQL |
| 4 | `kubectl delete secrets --all -n awx` | Supprime mots de passe et clés |
| 5 | `kubectl delete jobs --all -n awx` | Supprime les jobs de migration |
| 6 | `kubectl delete namespace awx` | (Optionnel) repart de zéro |

---

## 📚 Pour aller plus loin

- 📖 [Documentation officielle AWX Operator](https://github.com/ansible/awx-operator)
- 📖 [Documentation Talos Linux](https://www.talos.dev/)
- 📖 [Guide Helm officiel](https://helm.sh/docs/)
- 📖 `kubectl explain awx.spec --recursive` → arborescence complète des paramètres

---

## ✅ Conclusion

Tu disposes maintenant :

- D'un AWX **fonctionnel** sur Talos
- D'une compréhension claire du **rôle de chaque composant**
- D'une **boîte à outils de debug** pour t'en sortir en autonomie
- D'une **base sécurisée** prête à être durcie pour la production

> 🎓 **Le mot de la fin** : Kubernetes peut sembler complexe, mais il suit toujours la même logique : **déclaratif** (tu décris l'état souhaité) + **réconciliation** (le système converge vers cet état). Si quelque chose ne marche pas, demande-toi simplement : « Quelle étape de la réconciliation a échoué ? » et utilise les commandes de debug pour le découvrir.

Bon AWX ! 🚀
