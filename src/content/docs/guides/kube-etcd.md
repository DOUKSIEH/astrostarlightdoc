---
title: "Guide: Kubernetes & etcd"
description: "Architecture, résilience et bonnes pratiques pour maîtriser Kubernetes et etcd."
created: "2026-02-24"
# updated: "2026-02-08"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"

---

<!-- # 📖 Kubernetes & etcd — Guide Complet & Pédagogique -->



<div align="center">

<img src="https://upload.wikimedia.org/wikipedia/commons/3/39/Kubernetes_logo_without_workmark.svg" alt="Kubernetes Logo" width="120"/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<img src="https://raw.githubusercontent.com/etcd-io/etcd/main/logos/etcd-horizontal-color.svg" alt="etcd Logo" width="200"/>

*De l'architecture fondamentale aux workloads avancés — avec exemples détaillés nginx et bien plus.*

</div>

---

## 📚 Table des Matières

| # | Section | Contenu |
|---|---------|---------|
| 1 | [Architecture Kubernetes](#1-architecture-kubernetes) | Control Plane, Worker Nodes, composants |
| 1.5 | [Boucles de Contrôle](#15-les-boucles-de-contrôle-controller-loops) | Controller loops, thermostat analogy |
| 1.6 | [ReplicaSet](#16-replicaset--le-garant-du-nombre-de-répliques) | ReplicaSet vs Deployment, self-healing |
| 2 | [etcd — La Mémoire du Cluster](#2-etcd--la-mémoire-du-cluster) | Raft complet, élection, écriture, panne |
| 3 | [Pods](#3-pods--lunité-de-base) | Cycle de vie, multi-conteneurs, probes |
| 4 | [Deployments](#4-deployments--déployer-et-scaler) | nginx, rolling updates, rollback |
| 5 | [Services & Networking](#5-services--réseau) | ClusterIP, NodePort, LoadBalancer |
| 6 | [ConfigMaps & Secrets](#6-configmaps--secrets) | Configuration et données sensibles |
| 7 | [Namespaces](#7-namespaces) | Isolation, quotas |
| 8 | [StatefulSets](#8-statefulsets--applications-stateful) | MySQL, stockage persistant |
| 9 | [DaemonSets](#9-daemonsets--un-pod-par-nœud) | Monitoring, logs sur chaque node |
| 10 | [Jobs & CronJobs](#10-jobs--cronjobs) | Tâches ponctuelles et planifiées |
| 11 | [Volumes & PersistentVolumes](#11-volumes--persistentvolumes) | Stockage persistant |
| 12 | [Ingress](#12-ingress--exposition-http) | Routage HTTP/HTTPS |
| 13 | [RBAC & Sécurité](#13-rbac--sécurité) | Roles, permissions |
| 14 | [Diagnostic & Troubleshooting](#14-diagnostic--troubleshooting) | Commandes essentielles |
| 15 | [etcd — Maintenance Avancée](#15-etcd--maintenance-avancée) | Backups, restauration, monitoring |

> **Prérequis** : Bases de Docker. Un cluster local avec [kind](https://kind.sigs.k8s.io/) ou [minikube](https://minikube.sigs.k8s.io/) est recommandé pour pratiquer.

---

## 1. Architecture Kubernetes

<div align="center">
<img src="https://upload.wikimedia.org/wikipedia/commons/3/39/Kubernetes_logo_without_workmark.svg" alt="Kubernetes" width="60"/>
</div>

> *"Kubernetes, c'est un chef d'orchestre : chaque conteneur est un musicien, Kubernetes fait jouer tout ça en harmonie."*

### 1.1 Vue d'ensemble

```
┌─────────────────────────────────────────────────────────┐
│                    CLUSTER KUBERNETES                    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              CONTROL PLANE (Cerveau)             │   │
│  │                                                  │   │
│  │  ┌──────────┐  ┌──────┐  ┌─────────┐  ┌──────┐ │   │
│  │  │API Server│  │ etcd │  │Scheduler│  │Ctrl  │ │   │
│  │  │(port 6443│  │(2379)│  │         │  │Mgr   │ │   │
│  │  └──────────┘  └──────┘  └─────────┘  └──────┘ │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌────────────────┐  ┌────────────────┐                │
│  │  WORKER NODE 1 │  │  WORKER NODE 2 │                │
│  │                │  │                │                │
│  │ ┌────┐ ┌────┐  │  │ ┌────┐ ┌────┐ │                │
│  │ │Pod │ │Pod │  │  │ │Pod │ │Pod │ │                │
│  │ └────┘ └────┘  │  │ └────┘ └────┘ │                │
│  │ Kubelet        │  │ Kubelet        │                │
│  │ Kube-proxy     │  │ Kube-proxy     │                │
│  └────────────────┘  └────────────────┘                │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Le Control Plane

| Composant | Rôle | Port | Analogie |
|-----------|------|------|----------|
| **API Server** | Point d'entrée unique — toutes les requêtes passent par lui. | 6443 | Standard téléphonique |
| **etcd** | Stocke **tout** l'état du cluster (clé-valeur). | 2379/2380 | Archives centrales |
| **Scheduler** | Choisit sur quel Node déployer un Pod. | — | Service logistique |
| **Controller Manager** | Maintient l'état souhaité (recrée Pods crashés, etc.). | — | Service qualité |

**Flux d'une commande `kubectl apply` :**

```
kubectl apply -f nginx.yaml
        │
        ▼
   API Server ──────→ Valide & stocke dans etcd
        │
        ▼
   Controller Manager ──→ Détecte qu'un Deployment doit créer des Pods
        │
        ▼
   Scheduler ──────→ Choisit le Worker Node le plus adapté
        │
        ▼
   Kubelet (Worker) ──→ Télécharge l'image et lance le conteneur
```

### 1.3 Les Worker Nodes

| Composant | Rôle |
|-----------|------|
| **Kubelet** | Agent sur chaque Node — reçoit les ordres, lance les Pods, vérifie leur santé. |
| **Kube-proxy** | Gère les règles réseau (iptables/ipvs) pour router le trafic vers les bons Pods. |
| **Container Runtime** | Lance réellement les conteneurs (containerd, CRI-O). Docker retiré en K8s 1.24. |

### 1.4 Le concept déclaratif — YAML comme source de vérité

> Avec Kubernetes, vous ne dites **pas** "lance ce conteneur". Vous dites **"je veux cet état"** — Kubernetes fait le nécessaire et le maintient.

```yaml
# Vous déclarez :
replicas: 3   # "Je veux 3 répliques"

# Kubernetes garantit :
# - Si 1 Pod crash → il en recrée 1
# - Si un Node tombe → il déplace les Pods ailleurs
# - Si vous mettez replicas: 5 → il en ajoute 2
```

---

### 1.5 Les Boucles de Contrôle (Controller Loops)

> *"Les boucles de contrôle sont le cœur battant de Kubernetes — elles comparent en permanence ce que vous voulez avec ce qui existe, et corrigent les écarts."*

#### 🔄 Le principe fondamental

```
        ┌──────────────────────────────────────────┐
        │           BOUCLE DE CONTRÔLE             │
        │                                          │
        │   ┌─────────┐         ┌─────────────┐   │
        │   │ DESIRED │         │   CURRENT   │   │
        │   │  STATE  │         │    STATE    │   │
        │   │"3 pods" │         │  "2 pods"   │   │
        │   └────┬────┘         └──────┬──────┘   │
        │        │                     │           │
        │        └──────────┬──────────┘           │
        │                   ▼                      │
        │           ┌───────────────┐              │
        │           │  DIFFÉRENCE ? │              │
        │           │  3 - 2 = 1   │              │
        │           └───────┬───────┘              │
        │                   ▼                      │
        │           ┌───────────────┐              │
        │           │    ACTION     │              │
        │           │  Créer 1 Pod  │              │
        │           └───────┬───────┘              │
        │                   │                      │
        │                   └──→ (recommence ∞)    │
        └──────────────────────────────────────────┘
```

**La boucle ne s'arrête JAMAIS.** Elle tourne en permanence, toutes les quelques secondes, pour détecter et corriger tout écart entre l'état désiré et l'état réel.

---

#### 🏠 Analogie : Le Thermostat

```
Thermostat de maison :
  Température désirée : 20°C  (Desired State)
  Température actuelle : 17°C (Current State)
  Différence : -3°C
  Action : Allume le chauffage

  → Toutes les minutes, il vérifie et ajuste
  → S'il fait 22°C, il coupe le chauffage
  → Il boucle indéfiniment

Kubernetes fonctionne EXACTEMENT pareil :
  Répliques désirées : 3  (Desired State dans etcd)
  Répliques actuelles : 2 (Current State observé)
  Différence : -1 Pod
  Action : Crée 1 nouveau Pod

  → Toutes les X secondes, il vérifie et ajuste
  → Si trop de Pods, il en supprime
  → Il boucle indéfiniment
```

---

#### ⚙️ Les Contrôleurs principaux dans Kubernetes

Chaque **Controller** est une boucle dédiée à un type de ressource :

| Contrôleur | Surveille | Action corrective |
|-----------|-----------|-------------------|
| **Deployment Controller** | Deployments | Crée/supprime des ReplicaSets |
| **ReplicaSet Controller** | ReplicaSets | Crée/supprime des Pods |
| **Node Controller** | Nodes | Marque les Nodes défaillants, réassigne les Pods |
| **Job Controller** | Jobs | Crée des Pods, suit les completions |
| **CronJob Controller** | CronJobs | Crée des Jobs au bon moment |
| **Endpoints Controller** | Services/Pods | Met à jour la liste des Pods sains |
| **Namespace Controller** | Namespaces | Nettoie les ressources à la suppression |

Tous ces contrôleurs tournent **dans le `kube-controller-manager`** — un seul processus qui regroupe toutes ces boucles.

---

#### 🔗 La Chaîne Deployment → ReplicaSet → Pod

C'est l'exemple le plus important à comprendre. Il y a **deux boucles imbriquées** :

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   BOUCLE 1 : Deployment Controller                             │
│   ════════════════════════════════                             │
│                                                                 │
│   Vous écrivez :  Deployment "nginx", replicas=3               │
│         │                                                       │
│         ▼                                                       │
│   Desired State : "Il doit exister un ReplicaSet nginx-v2"     │
│   Current State : "Aucun ReplicaSet n'existe"                  │
│   Action        : Créer ReplicaSet nginx-v2 avec replicas=3   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   BOUCLE 2 : ReplicaSet Controller                             │
│   ════════════════════════════════                             │
│                                                                 │
│   Desired State : "3 Pods avec label app=nginx doivent tourner"│
│   Current State : "0 Pod existe"                               │
│   Action        : Créer 3 Pods                                 │
│         │                                                       │
│         ▼                                                       │
│   Desired State : "3 Pods"                                     │
│   Current State : "1 Pod Running, 2 en création"               │
│   Action        : Attendre...                                  │
│         │                                                       │
│         ▼                                                       │
│   Desired State : "3 Pods"                                     │
│   Current State : "3 Pods Running" ✅                          │
│   Action        : Rien à faire — état atteint !                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Illustration avec kubectl :**

```bash
# Créer un Deployment
kubectl apply -f deployment-nginx.yaml

# On voit les 3 couches :
kubectl get deployment nginx-deployment
# NAME               DESIRED   CURRENT   READY
# nginx-deployment   3         3         3

kubectl get replicaset
# NAME                          DESIRED   CURRENT   READY
# nginx-deployment-7fb96c846b   3         3         3
#    └── Hash de la version ──┘

kubectl get pods
# NAME                                READY   STATUS
# nginx-deployment-7fb96c846b-4xkgn   1/1     Running
# nginx-deployment-7fb96c846b-8dvrg   1/1     Running
# nginx-deployment-7fb96c846b-k5bzv   1/1     Running
```

---

### 1.6 ReplicaSet — Le Garant du Nombre de Répliques

> *"Le ReplicaSet est le gardien : il compte en permanence les Pods vivants et s'assure que le bon nombre tourne."*

#### Qu'est-ce qu'un ReplicaSet ?

Un **ReplicaSet** (RS) a une seule mission : **maintenir N copies d'un Pod en vie à tout moment**.

```yaml
# replicaset-nginx.yaml (rarement utilisé directement — préférez Deployment)
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: nginx-rs
spec:
  replicas: 3           # Je veux 3 Pods en permanence
  selector:
    matchLabels:
      app: nginx        # Surveille les Pods avec ce label
  template:
    metadata:
      labels:
        app: nginx      # DOIT correspondre au selector
    spec:
      containers:
        - name: nginx
          image: nginx:1.25
```

#### La boucle du ReplicaSet en détail

```
SCÉNARIO : ReplicaSet veut 3 Pods, un Pod crash

T=0s   : [Pod-1 ✅] [Pod-2 ✅] [Pod-3 ✅]  → Desired=3, Current=3 ✓

T=30s  : Pod-2 plante (OOM, erreur app...)
         [Pod-1 ✅] [Pod-2 ☠️] [Pod-3 ✅]  → Desired=3, Current=2 ✗

T=30.1s: ReplicaSet Controller détecte le gap
         "Desired=3, Current=2 → manque 1 Pod !"
         Action : Envoie une requête à l'API Server : "Crée Pod-4"

T=30.2s: Scheduler choisit un Node disponible

T=30.5s: Kubelet sur le Node lance le conteneur

T=32s  : [Pod-1 ✅] [Pod-3 ✅] [Pod-4 ✅]  → Desired=3, Current=3 ✓
         Récupération en ~2 secondes !
```

#### ReplicaSet vs Deployment — Lequel choisir ?

```
ReplicaSet seul :
  ✅ Maintient N répliques
  ❌ Pas de rolling update
  ❌ Pas d'historique de versions
  ❌ Rollback impossible
  → Utilisez-le rarement directement

Deployment (recommandé) :
  ✅ Maintient N répliques (via ReplicaSet)
  ✅ Rolling updates sans coupure
  ✅ Historique des versions (kubectl rollout history)
  ✅ Rollback en une commande
  → Utilisez TOUJOURS Deployment en production

Deployment gère des ReplicaSets :
  Deployment v1 ──→ ReplicaSet-v1 ──→ [Pod, Pod, Pod]
  
  Après mise à jour :
  Deployment v2 ──→ ReplicaSet-v2 ──→ [Pod, Pod, Pod]  (nouveau)
                    ReplicaSet-v1 ──→ [] (conservé pour rollback)
```

```bash
# Voir les ReplicaSets d'un Deployment (après 2 déploiements)
kubectl get replicaset
# NAME                          DESIRED   CURRENT   READY   AGE
# nginx-deployment-7fb96c846b   3         3         3       10m  ← version active
# nginx-deployment-6d4c5f8a1e   0         0         0       25m  ← ancienne version (rollback possible)
```

#### Simuler la self-healing : exercice pratique

```bash
# Déployer
kubectl apply -f deployment-nginx.yaml

# Observer les pods
kubectl get pods -l app=nginx

# Supprimer manuellement un Pod
kubectl delete pod nginx-deployment-7fb96c846b-4xkgn

# Observer immédiatement : K8s recrée un Pod automatiquement !
kubectl get pods -l app=nginx --watch
# NAME                                READY   STATUS              RESTARTS
# nginx-deployment-7fb96c846b-8dvrg   1/1     Running             0
# nginx-deployment-7fb96c846b-k5bzv   1/1     Running             0
# nginx-deployment-7fb96c846b-4xkgn   0/1     Terminating         0
# nginx-deployment-7fb96c846b-9pmxz   0/1     ContainerCreating   0  ← NOUVEAU !
# nginx-deployment-7fb96c846b-9pmxz   1/1     Running             0  ← Récupéré ✅
```

---

## 2. etcd — La Mémoire du Cluster

<div align="center">
<img src="https://raw.githubusercontent.com/etcd-io/etcd/main/logos/etcd-horizontal-color.svg" alt="etcd Logo" width="180"/>
</div>

> *"etcd est aux données ce que le disque dur est à votre ordinateur — si ça tombe, tout est perdu."*

### 2.1 Ce qu'etcd stocke

| Donnée | Exemple |
|--------|---------|
| État désiré | "3 répliques du Pod nginx" |
| État actuel | "2 Pods running, 1 en crash" |
| Secrets & ConfigMaps | Mots de passe, variables d'environnement |
| RBAC | Qui a le droit de faire quoi |
| Métadonnées | Labels, annotations, namespaces |

### 2.2 Algorithme Raft — Explication pédagogique complète

> *"Raft, c'est comme un groupe de colocataires qui doit prendre des décisions : ils élisent un porte-parole (leader), et toute décision doit être approuvée par la majorité avant d'être appliquée."*

#### 🏫 L'analogie de la classe

Imaginez une classe de 5 élèves qui doit tenir un **registre commun** (le journal de classe). La règle est simple :
- **1 seul élève** peut écrire dans le registre à la fois (le **leader**)
- Avant d'écrire, il doit obtenir l'**accord de la majorité** (3/5)
- Si le leader est absent, les autres **élisent un nouveau leader**
- Tous les autres élèves copient ce que le leader écrit (**followers**)

C'est exactement ce que fait Raft avec etcd !

---

#### 📋 Les 3 Rôles dans Raft

```
┌─────────────────────────────────────────────────────────────┐
│                    CLUSTER ETCD (5 membres)                 │
│                                                             │
│   ┌──────────────┐                                          │
│   │   LEADER     │  ← Reçoit TOUTES les écritures          │
│   │   (Node A)   │  ← Réplique vers les Followers          │
│   │  Term: 42    │  ← Envoie des heartbeats toutes les     │
│   └──────┬───────┘    150ms pour dire "je suis vivant"     │
│          │                                                  │
│    ┌─────┼──────┐                                           │
│    ▼     ▼      ▼                                           │
│  ┌───┐ ┌───┐  ┌───┐                                         │
│  │ B │ │ C │  │ D │  ← FOLLOWERS                           │
│  │ ✓ │ │ ✓ │  │ ✓ │  ← Répliquent les données              │
│  └───┘ └───┘  └───┘  ← Peuvent aussi servir les lectures   │
│                                                             │
│   ┌──────────────┐                                          │
│   │  CANDIDATE   │  ← État temporaire pendant l'élection   │
│   │  (Node E)    │  ← Sollicite des votes                  │
│   └──────────────┘                                          │
└─────────────────────────────────────────────────────────────┘
```

| Rôle | Description | Combien | Durée |
|------|-------------|---------|-------|
| **Leader** | Seul à accepter les écritures. Envoie des heartbeats. | 1 seul | Jusqu'à panne/timeout |
| **Follower** | Réplique les données. Vote lors des élections. | N-1 | Permanent (hors élection) |
| **Candidate** | En train de demander des votes pour devenir Leader. | 0 ou plusieurs | Très court (ms) |

---

#### 🗳️ Phase 1 — L'Élection du Leader

**Scénario : Le cluster démarre pour la première fois.**

```
ÉTAPE 1 : Tous les membres démarrent en tant que FOLLOWER
──────────────────────────────────────────────────────────
  [A: Follower]  [B: Follower]  [C: Follower]
  Timeout: 152ms  Timeout: 187ms  Timeout: 203ms
  ← Chaque nœud attend un temps aléatoire (150-300ms)


ÉTAPE 2 : A arrive à timeout en premier → devient CANDIDATE
──────────────────────────────────────────────────────────
  [A: CANDIDATE] → "Je veux être leader ! Votez pour moi !"
  A s'incrémente : Term = 1 (numéro d'élection)
  A vote pour lui-même (1 vote)


ÉTAPE 3 : A envoie une RequestVote à B et C
──────────────────────────────────────────────────────────
  A ──→ B : "Vote pour moi, Term=1"
  A ──→ C : "Vote pour moi, Term=1"

  B répond : "OK, je vote pour toi" (B n'a voté pour personne à Term=1)
  C répond : "OK, je vote pour toi"


ÉTAPE 4 : A obtient 3/3 votes → devient LEADER
──────────────────────────────────────────────────────────
  [A: LEADER ✅]  [B: Follower]  [C: Follower]
  A annonce : "Je suis le leader du Term 1 !"
  A commence à envoyer des heartbeats toutes les 150ms
```

**Règles de vote :**
- Chaque nœud ne vote qu'**une fois par Term**
- Un nœud vote pour le candidat dont les **données sont les plus à jour**
- Le candidat avec la **majorité** (quorum) devient leader

---

#### ✍️ Phase 2 — L'Écriture d'une Donnée (Consensus)

**Scénario : `kubectl apply` crée un nouveau Deployment → etcd doit l'enregistrer.**

```
CLUSTER : A=Leader, B=Follower, C=Follower, D=Follower, E=Follower
─────────────────────────────────────────────────────────────────

ÉTAPE 1 : L'API Server envoie l'écriture au Leader A
  API Server ──→ A (Leader) : "Écris : deployment/nginx = {replicas:3}"


ÉTAPE 2 : A ajoute l'entrée dans son log LOCAL (pas encore commitée)
  A : Log = [..., entrée#57: "deployment/nginx = {replicas:3}"]
  Statut : UNCOMMITTED (pas encore validé)


ÉTAPE 3 : A réplique vers TOUS les Followers
  A ──→ B : "AppendEntries: entrée#57"
  A ──→ C : "AppendEntries: entrée#57"
  A ──→ D : "AppendEntries: entrée#57"
  A ──→ E : "AppendEntries: entrée#57"


ÉTAPE 4 : Les Followers accusent réception
  B ──→ A : "✅ Reçu et écrit dans mon log"
  C ──→ A : "✅ Reçu et écrit dans mon log"
  D ──→ A : "✅ Reçu et écrit dans mon log"
  E ──→ A : "❌ Timeout (panne réseau)"


ÉTAPE 5 : A a reçu 4/5 ACK = majorité atteinte (quorum = 3)
  A : "Quorum OK ! Je commite l'entrée #57"
  A envoie : "Commitez l'entrée #57 !" à B, C, D


ÉTAPE 6 : COMMIT — la donnée est officiellement enregistrée
  A, B, C, D → appliquent l'entrée dans leur base de données
  E → rattrapera son retard quand il reviendra en ligne

  API Server reçoit : "✅ Écriture confirmée"
  L'entrée est maintenant DURABLE (même si A tombe)
```

**Résumé visuel :**

```
kubectl apply   →   API Server   →   etcd Leader
                                          │
                               1. Log (uncommitted)
                                          │
                               2. Réplique vers Followers
                                          │
                               3. Attend quorum ACKs
                                          │
                               4. COMMIT si quorum atteint
                                          │
                    API Server   ←   "✅ Succès"
```

---

#### 💥 Phase 3 — Panne du Leader (Ré-élection)

**Scénario : Le Leader A tombe soudainement.**

```
AVANT LA PANNE :
  [A: Leader ❤️]  [B: Follower]  [C: Follower]  [D: Follower]  [E: Follower]


A TOMBE (crash serveur, panne réseau...) :
  [A: ☠️ DOWN]  [B: Follower]  [C: Follower]  [D: Follower]  [E: Follower]

  B, C, D, E : "On ne reçoit plus de heartbeat de A..."
  Après 300-600ms de silence → election timeout déclenché


NOUVELLE ÉLECTION (Term 2) :
  B arrive à timeout en premier → devient Candidate

  B ──→ C : "Vote Term=2 ?" → C : "✅ OK"
  B ──→ D : "Vote Term=2 ?" → D : "✅ OK"
  B ──→ E : "Vote Term=2 ?" → E : "✅ OK"

  B obtient 4/4 votes → NOUVEAU LEADER !

APRÈS RÉ-ÉLECTION :
  [A: ☠️ DOWN]  [B: LEADER ✅]  [C: Follower]  [D: Follower]  [E: Follower]

  Temps d'indisponibilité : ~500ms (imperceptible pour les apps)
```

**Et si A revient en ligne après ?**

```
A redémarre → se voit avec Term=1 (obsolète)
B annonce : "Je suis leader, Term=2"
A voit Term=2 > Term=1 → A se soumet et redevient Follower
A rattrape les entrées manquées depuis B
→ Cluster de nouveau à 5 membres ✅
```

---

#### 🧮 Quorum — Le Calcul Essentiel

```
Formule : Quorum = ⌊N/2⌋ + 1

N=1 : ⌊1/2⌋ + 1 = 1   → Quorum=1, pannes tolérées=0
N=3 : ⌊3/2⌋ + 1 = 2   → Quorum=2, pannes tolérées=1  ← STANDARD
N=5 : ⌊5/2⌋ + 1 = 3   → Quorum=3, pannes tolérées=2  ← CRITIQUE
N=7 : ⌊7/2⌋ + 1 = 4   → Quorum=4, pannes tolérées=3

Pourquoi nombre IMPAIR ?
  N=4 : Quorum=3, pannes tolérées=1  → même qu'un cluster de 3 !
  (inutile d'avoir 4 membres si ça ne donne pas plus de résilience)
```

| Membres | Quorum | Pannes tolérées | Usage recommandé |
|---------|--------|-----------------|------------------|
| 1 | 1 | 0 | Dev/test uniquement |
| 3 | 2 | **1** | Production standard |
| 5 | 3 | **2** | Production critique |
| 7 | 4 | **3** | Très haute dispo |

> ⚠️ **Jamais 2 membres** (si 1 tombe, quorum impossible). **Évitez plus de 7** (latence accrue). Toujours un nombre **impair**.

---

#### ⚡ Paramètres Raft à connaître

```yaml
# Configuration etcd (valeurs par défaut)
heartbeat-interval: 100ms    # Fréquence des heartbeats du Leader
election-timeout: 1000ms     # Délai avant de déclencher une élection

# Règle : election-timeout doit être 10× heartbeat-interval minimum
# Si latence réseau > heartbeat-interval → élections intempestives !
```

```bash
# Vérifier le leader actuel
etcdctl endpoint status --cluster -w table
# ENDPOINT           ID                STATUS    IS LEADER
# 192.168.1.10:2379  8e9e05c52164694d  healthy   true      ← Leader
# 192.168.1.11:2379  a2f4c8d3e1b5f6a1  healthy   false
# 192.168.1.12:2379  c3d5e7f9a1b2c4d6  healthy   false
```

---

### 2.3 Quorum — Tableau de tolérance aux pannes

| Membres | Quorum | Pannes tolérées | Pannes réseau tolérées |
|---------|--------|-----------------|----------------------|
| 1 | 1 | 0 | 0 |
| 3 | 2 | 1 | 1 |
| 5 | 3 | 2 | 2 |
| 7 | 4 | 3 | 3 |

---

## 3. Pods — L'Unité de Base

> *"Un Pod, c'est comme un appartement : plusieurs conteneurs peuvent y cohabiter, partageant le réseau et le stockage."*

### 3.1 Qu'est-ce qu'un Pod ?

Un Pod est la **plus petite unité déployable** dans Kubernetes. Il encapsule :
- Un ou plusieurs conteneurs
- Un espace réseau partagé (même IP, mêmes ports)
- Des volumes optionnels partagés entre les conteneurs

```
┌──────────────────────────────────────┐
│               POD                    │
│  IP: 10.244.0.5                      │
│                                      │
│  ┌────────────┐  ┌────────────────┐  │
│  │ Conteneur  │  │ Conteneur      │  │
│  │ nginx      │  │ log-sidecar    │  │
│  │ :80        │  │ (lit les logs) │  │
│  └────────────┘  └────────────────┘  │
│         └──── Volume partagé ───┘    │
└──────────────────────────────────────┘
```

### 3.2 Pod Simple — Exemple nginx

```yaml
# pod-nginx.yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-simple
  labels:
    app: nginx
    env: dev
spec:
  containers:
    - name: nginx
      image: nginx:1.25
      ports:
        - containerPort: 80
      resources:
        requests:
          cpu: "100m"      # 0.1 CPU garanti
          memory: "128Mi"  # 128 Mo garanti
        limits:
          cpu: "500m"      # max 0.5 CPU
          memory: "256Mi"  # max 256 Mo
```

```bash
# Déployer
kubectl apply -f pod-nginx.yaml

# Vérifier
kubectl get pod nginx-simple
kubectl describe pod nginx-simple

# Accéder aux logs
kubectl logs nginx-simple

# Entrer dans le conteneur
kubectl exec -it nginx-simple -- /bin/bash

# Supprimer
kubectl delete pod nginx-simple
```

### 3.3 Pod Multi-Conteneurs (Pattern Sidecar)

```yaml
# pod-sidecar.yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-avec-sidecar
spec:
  volumes:
    - name: logs-partages
      emptyDir: {}  # volume temporaire en RAM/disque

  containers:
    # Conteneur principal
    - name: nginx
      image: nginx:1.25
      volumeMounts:
        - name: logs-partages
          mountPath: /var/log/nginx

    # Sidecar : collecte les logs nginx et les envoie ailleurs
    - name: log-collector
      image: busybox:1.36
      command: ["sh", "-c", "tail -f /logs/access.log"]
      volumeMounts:
        - name: logs-partages
          mountPath: /logs
```

### 3.4 Probes — Vérifier la santé d'un Pod

```yaml
spec:
  containers:
    - name: nginx
      image: nginx:1.25
      
      # Liveness : "Le conteneur est-il vivant ?"
      # Si échec → Kubernetes redémarre le conteneur
      livenessProbe:
        httpGet:
          path: /healthz
          port: 80
        initialDelaySeconds: 10   # Attendre 10s avant la 1ère vérif
        periodSeconds: 5          # Vérifier toutes les 5s
        failureThreshold: 3       # 3 échecs → redémarrage
      
      # Readiness : "Le conteneur est-il prêt à recevoir du trafic ?"
      # Si échec → retiré du Service (ne reçoit plus de trafic)
      readinessProbe:
        httpGet:
          path: /ready
          port: 80
        initialDelaySeconds: 5
        periodSeconds: 3
      
      # Startup : "Le conteneur a-t-il démarré ?"
      # Utile pour les apps lentes au démarrage
      startupProbe:
        httpGet:
          path: /started
          port: 80
        failureThreshold: 30      # 30 × 10s = 5 min max pour démarrer
        periodSeconds: 10
```

### 3.5 Cycle de vie d'un Pod

```
Pending ──→ Running ──→ Succeeded (Job terminé avec succès)
                   └──→ Failed    (tous les conteneurs ont planté)
                   └──→ Unknown   (communication perdue avec le Node)

États des conteneurs :
  Waiting   → en attente (téléchargement image, Init containers...)
  Running   → en cours d'exécution
  Terminated → terminé (exit code 0 = succès, autre = échec)
```

---

## 4. Deployments — Déployer et Scaler

> *"Un Deployment, c'est le gestionnaire de vos Pods — il garantit que le bon nombre de répliques tourne en permanence."*

### 4.1 Pourquoi pas juste des Pods ?

| Action | Pod seul | Deployment |
|--------|----------|------------|
| Pod crash | ❌ Perdu pour toujours | ✅ Recréé automatiquement |
| Montée en charge | ❌ Manuel | ✅ `kubectl scale` |
| Mise à jour | ❌ Interruption | ✅ Rolling update sans coupure |
| Rollback | ❌ Impossible | ✅ `kubectl rollout undo` |

### 4.2 Deployment nginx Complet

```yaml
# deployment-nginx.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3          # Je veux 3 Pods en permanence
  
  selector:
    matchLabels:
      app: nginx       # Ce Deployment gère les Pods avec ce label
  
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1   # Max 1 Pod indispo pendant la mise à jour
      maxSurge: 1         # Max 1 Pod en plus pendant la mise à jour
  
  template:             # Template des Pods à créer
    metadata:
      labels:
        app: nginx      # DOIT correspondre au selector ci-dessus
        version: "1.25"
    spec:
      containers:
        - name: nginx
          image: nginx:1.25
          ports:
            - containerPort: 80
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "256Mi"
          livenessProbe:
            httpGet:
              path: /
              port: 80
            initialDelaySeconds: 10
            periodSeconds: 5
          readinessProbe:
            httpGet:
              path: /
              port: 80
            initialDelaySeconds: 5
            periodSeconds: 3
```

```bash
# Déployer
kubectl apply -f deployment-nginx.yaml

# Observer les Pods créés
kubectl get pods -l app=nginx
# NAME                                READY   STATUS    RESTARTS   AGE
# nginx-deployment-7fb96c846b-4xkgn   1/1     Running   0          30s
# nginx-deployment-7fb96c846b-8dvrg   1/1     Running   0          30s
# nginx-deployment-7fb96c846b-k5bzv   1/1     Running   0          30s

# Voir le Deployment
kubectl get deployment nginx-deployment
# NAME               READY   UP-TO-DATE   AVAILABLE   AGE
# nginx-deployment   3/3     3            3           1m
```

### 4.3 Scaler un Deployment

```bash
# Passer à 5 répliques
kubectl scale deployment nginx-deployment --replicas=5

# Ou modifier le YAML et re-appliquer
kubectl edit deployment nginx-deployment  # ouvre l'éditeur

# Autoscaling (HPA - Horizontal Pod Autoscaler)
kubectl autoscale deployment nginx-deployment \
  --cpu-percent=70 \
  --min=2 \
  --max=10
# → K8s ajoute/supprime des Pods selon la charge CPU
```

### 4.4 Rolling Update — Mise à jour sans coupure

```bash
# Mettre à jour l'image nginx de 1.25 vers 1.26
kubectl set image deployment/nginx-deployment nginx=nginx:1.26

# Suivre le déploiement en temps réel
kubectl rollout status deployment/nginx-deployment
# Waiting for deployment "nginx-deployment" rollout to finish: 1 out of 3 new replicas have been updated...
# Waiting for deployment "nginx-deployment" rollout to finish: 2 out of 3 new replicas have been updated...
# deployment "nginx-deployment" successfully rolled out
```

**Ce qui se passe en coulisse :**

```
AVANT : [nginx:1.25] [nginx:1.25] [nginx:1.25]

PENDANT :
  Étape 1 : [nginx:1.25] [nginx:1.25] [nginx:1.25] + [nginx:1.26] (surge +1)
  Étape 2 : [nginx:1.25] [nginx:1.25] [nginx:1.26]  (-1 ancien)
  Étape 3 : [nginx:1.25] [nginx:1.26] [nginx:1.26]
  Étape 4 : [nginx:1.26] [nginx:1.26] [nginx:1.26]

APRÈS : [nginx:1.26] [nginx:1.26] [nginx:1.26]
→ Aucune interruption de service !
```

### 4.5 Rollback — Revenir en arrière

```bash
# Voir l'historique des déploiements
kubectl rollout history deployment/nginx-deployment
# REVISION  CHANGE-CAUSE
# 1         kubectl apply -f deployment-nginx.yaml
# 2         kubectl set image ... nginx=nginx:1.26

# Rollback vers la version précédente
kubectl rollout undo deployment/nginx-deployment

# Rollback vers une révision spécifique
kubectl rollout undo deployment/nginx-deployment --to-revision=1

# Annoter les déploiements pour l'historique (bonne pratique)
kubectl annotate deployment nginx-deployment \
  kubernetes.io/change-cause="Mise à jour nginx 1.26 - ticket #123"
```

---

## 5. Services — Réseau

> *"Un Service est une adresse IP stable pour accéder à vos Pods — même si les Pods changent (redémarrent, se déplacent), le Service reste fixe."*

### 5.1 Pourquoi un Service ?

Les Pods ont des IPs éphémères — à chaque redémarrage, nouvelle IP. Un Service fournit une IP stable et fait du **load balancing** entre les Pods.

```
Client
  │
  ▼
Service (IP stable: 10.96.100.1, port 80)
  │
  ├──→ Pod 1 (10.244.0.5:80)
  ├──→ Pod 2 (10.244.1.3:80)
  └──→ Pod 3 (10.244.2.7:80)
```

### 5.2 ClusterIP — Accès interne uniquement

```yaml
# service-clusterip.yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  type: ClusterIP      # Défaut — accessible seulement depuis l'intérieur du cluster
  selector:
    app: nginx          # Cible les Pods avec ce label
  ports:
    - protocol: TCP
      port: 80          # Port du Service
      targetPort: 80    # Port du conteneur
```

```bash
kubectl apply -f service-clusterip.yaml

# Voir le Service
kubectl get service nginx-service
# NAME            TYPE        CLUSTER-IP      PORT(S)   AGE
# nginx-service   ClusterIP   10.96.100.1     80/TCP    10s

# Tester depuis un Pod dans le cluster
kubectl run test --rm -it --image=busybox -- wget -qO- http://nginx-service
```

### 5.3 NodePort — Accès depuis l'extérieur

```yaml
# service-nodeport.yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-nodeport
spec:
  type: NodePort
  selector:
    app: nginx
  ports:
    - protocol: TCP
      port: 80           # Port interne du Service
      targetPort: 80     # Port du conteneur
      nodePort: 30080    # Port exposé sur chaque Node (30000-32767)
```

```bash
# Accès : http://<IP-du-Node>:30080
kubectl get nodes -o wide   # Obtenir l'IP d'un Node
```

### 5.4 LoadBalancer — Accès cloud (AWS, GCP, Azure)

```yaml
# service-loadbalancer.yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-lb
spec:
  type: LoadBalancer    # Provisionne un LB externe via le cloud provider
  selector:
    app: nginx
  ports:
    - port: 80
      targetPort: 80
```

```bash
kubectl get service nginx-lb
# NAME       TYPE           CLUSTER-IP     EXTERNAL-IP      PORT(S)
# nginx-lb   LoadBalancer   10.96.100.2    52.14.183.21     80:31234/TCP
#                                          ↑ IP publique assignée par AWS/GCP
```

### 5.5 Service Headless — DNS direct vers les Pods

```yaml
# Utilisé avec les StatefulSets — retourne les IPs des Pods directement
spec:
  clusterIP: None    # Pas d'IP de Service — DNS retourne les IPs des Pods
  selector:
    app: mysql
```

---

## 6. ConfigMaps & Secrets

> *"Ne mettez jamais une configuration ou un mot de passe en dur dans votre image Docker. Utilisez ConfigMaps et Secrets."*

### 6.1 ConfigMap — Configuration non sensible

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: nginx-config
data:
  # Valeurs simples
  APP_ENV: "production"
  APP_PORT: "8080"
  LOG_LEVEL: "info"
  
  # Fichier entier (nginx.conf)
  nginx.conf: |
    server {
        listen 80;
        server_name example.com;
        location / {
            root /usr/share/nginx/html;
            index index.html;
        }
    }
```

**Utilisation dans un Pod :**

```yaml
spec:
  containers:
    - name: nginx
      image: nginx:1.25
      
      # Méthode 1 : Variables d'environnement individuelles
      env:
        - name: APP_ENV
          valueFrom:
            configMapKeyRef:
              name: nginx-config
              key: APP_ENV
      
      # Méthode 2 : Toutes les clés comme variables d'env
      envFrom:
        - configMapRef:
            name: nginx-config
      
      # Méthode 3 : Monter comme fichier
      volumeMounts:
        - name: config-volume
          mountPath: /etc/nginx/conf.d/
  
  volumes:
    - name: config-volume
      configMap:
        name: nginx-config
        items:
          - key: nginx.conf
            path: default.conf
```

### 6.2 Secrets — Données sensibles

```bash
# Créer un secret depuis la ligne de commande
kubectl create secret generic db-credentials \
  --from-literal=username=admin \
  --from-literal=password=S3cr3tP@ssw0rd

# Créer depuis des fichiers
kubectl create secret generic tls-cert \
  --from-file=tls.crt=./cert.pem \
  --from-file=tls.key=./key.pem
```

```yaml
# secret.yaml (valeurs encodées en base64)
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
data:
  username: YWRtaW4=         # echo -n "admin" | base64
  password: UzNjcjN0UEBzc3cwcmQ=
```

**Utilisation dans un Pod :**

```yaml
spec:
  containers:
    - name: app
      image: mon-app:1.0
      env:
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: username
        - name: DB_PASS
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: password
```

> ⚠️ Les Secrets sont encodés en **base64** (pas chiffrés !). En production, utilisez **Sealed Secrets** ou un gestionnaire externe (HashiCorp Vault, AWS Secrets Manager).

---

## 7. Namespaces

> *"Les Namespaces sont des dossiers dans votre cluster — ils isolent les ressources entre équipes ou environnements."*

### 7.1 Namespaces par défaut

| Namespace | Contenu |
|-----------|---------|
| `default` | Vos ressources si vous ne spécifiez pas de namespace |
| `kube-system` | Composants Kubernetes (kube-dns, kube-proxy...) |
| `kube-public` | Données lisibles par tous (peu utilisé) |
| `kube-node-lease` | Heartbeats des nodes |

### 7.2 Créer et utiliser des Namespaces

```bash
# Créer
kubectl create namespace production
kubectl create namespace staging
kubectl create namespace monitoring

# Déployer dans un namespace
kubectl apply -f deployment-nginx.yaml -n production

# Voir les ressources d'un namespace
kubectl get all -n production

# Changer le namespace par défaut
kubectl config set-context --current --namespace=production
```

### 7.3 ResourceQuota — Limiter un namespace

```yaml
# quota-production.yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: quota-prod
  namespace: production
spec:
  hard:
    pods: "20"                  # Max 20 Pods
    requests.cpu: "4"           # CPU total demandé : 4 cores
    requests.memory: 8Gi        # RAM totale demandée : 8 Go
    limits.cpu: "8"
    limits.memory: 16Gi
    persistentvolumeclaims: "10"
```

```bash
kubectl apply -f quota-production.yaml
kubectl describe resourcequota quota-prod -n production
```

---

## 8. StatefulSets — Applications Stateful

> *"Un Deployment traite chaque Pod comme identique et jetable. Un StatefulSet donne une identité stable à chaque Pod — indispensable pour les bases de données."*

### 8.1 Deployment vs StatefulSet

| Critère | Deployment | StatefulSet |
|---------|------------|-------------|
| Nommage des Pods | `app-xyz123` (aléatoire) | `app-0`, `app-1`, `app-2` (stable) |
| Ordre de démarrage | Parallèle | Séquentiel (0, puis 1, puis 2) |
| Stockage | Partagé ou éphémère | Volume dédié par Pod |
| DNS stable | ❌ | ✅ `app-0.svc`, `app-1.svc`... |
| Usage | Apps sans état (nginx, API) | BDD, Kafka, Elasticsearch |

### 8.2 StatefulSet MySQL

```yaml
# statefulset-mysql.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
spec:
  serviceName: mysql-headless   # Service headless associé
  replicas: 3
  selector:
    matchLabels:
      app: mysql
  
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
        - name: mysql
          image: mysql:8.0
          ports:
            - containerPort: 3306
          env:
            - name: MYSQL_ROOT_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: mysql-secret
                  key: root-password
          volumeMounts:
            - name: mysql-data
              mountPath: /var/lib/mysql
          resources:
            requests:
              cpu: "500m"
              memory: "512Mi"
            limits:
              cpu: "1"
              memory: "1Gi"
  
  # Template de volume — chaque Pod obtient son propre PVC
  volumeClaimTemplates:
    - metadata:
        name: mysql-data
      spec:
        accessModes: ["ReadWriteOnce"]
        storageClassName: "standard"
        resources:
          requests:
            storage: 10Gi

---
# Service Headless associé
apiVersion: v1
kind: Service
metadata:
  name: mysql-headless
spec:
  clusterIP: None          # Headless !
  selector:
    app: mysql
  ports:
    - port: 3306
```

```bash
kubectl apply -f statefulset-mysql.yaml

kubectl get statefulset mysql
# NAME    READY   AGE
# mysql   3/3     2m

kubectl get pods -l app=mysql
# NAME      READY   STATUS    RESTARTS   AGE
# mysql-0   1/1     Running   0          2m   ← démarre en premier
# mysql-1   1/1     Running   0          1m30s
# mysql-2   1/1     Running   0          1m

# DNS stable pour chaque Pod :
# mysql-0.mysql-headless.default.svc.cluster.local
# mysql-1.mysql-headless.default.svc.cluster.local
# mysql-2.mysql-headless.default.svc.cluster.local
```

---

## 9. DaemonSets — Un Pod par Nœud

> *"Un DaemonSet garantit qu'une copie d'un Pod tourne sur CHAQUE Node du cluster — parfait pour la surveillance ou la collecte de logs."*

### 9.1 Cas d'usage

| Usage | Exemple |
|-------|---------|
| Collecte de logs | Fluentd, Filebeat |
| Monitoring système | Prometheus Node Exporter, Datadog agent |
| Réseau | Calico, Weave, Cilium |
| Sécurité | Falco, agents antivirus |
| Stockage | Ceph, Gluster agents |

### 9.2 DaemonSet Node Exporter (Monitoring)

```yaml
# daemonset-node-exporter.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-exporter
  namespace: monitoring
  labels:
    app: node-exporter
spec:
  selector:
    matchLabels:
      app: node-exporter
  
  template:
    metadata:
      labels:
        app: node-exporter
    spec:
      # Autoriser l'accès au réseau du Node (nécessaire pour l'export de métriques)
      hostNetwork: true
      hostPID: true
      
      tolerations:
        # Aussi sur les nodes Control Plane
        - key: node-role.kubernetes.io/control-plane
          operator: Exists
          effect: NoSchedule
      
      containers:
        - name: node-exporter
          image: prom/node-exporter:v1.7.0
          ports:
            - containerPort: 9100
              hostPort: 9100
          args:
            - "--path.procfs=/host/proc"
            - "--path.sysfs=/host/sys"
          volumeMounts:
            - name: proc
              mountPath: /host/proc
              readOnly: true
            - name: sys
              mountPath: /host/sys
              readOnly: true
          resources:
            requests:
              cpu: "50m"
              memory: "64Mi"
            limits:
              cpu: "200m"
              memory: "128Mi"
      
      volumes:
        - name: proc
          hostPath:
            path: /proc
        - name: sys
          hostPath:
            path: /sys
```

### 9.3 DaemonSet Fluentd — Collecte de logs

```yaml
# daemonset-fluentd.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd
  namespace: logging
spec:
  selector:
    matchLabels:
      app: fluentd
  template:
    metadata:
      labels:
        app: fluentd
    spec:
      serviceAccountName: fluentd   # Compte de service avec les bons droits
      tolerations:
        - key: node-role.kubernetes.io/control-plane
          operator: Exists
          effect: NoSchedule
      
      containers:
        - name: fluentd
          image: fluent/fluentd-kubernetes-daemonset:v1-debian-elasticsearch
          env:
            - name: FLUENT_ELASTICSEARCH_HOST
              value: "elasticsearch.logging.svc.cluster.local"
            - name: FLUENT_ELASTICSEARCH_PORT
              value: "9200"
          volumeMounts:
            - name: varlog
              mountPath: /var/log
            - name: varlibdockercontainers
              mountPath: /var/lib/docker/containers
              readOnly: true
          resources:
            requests:
              cpu: "100m"
              memory: "200Mi"
            limits:
              cpu: "500m"
              memory: "500Mi"
      
      volumes:
        - name: varlog
          hostPath:
            path: /var/log
        - name: varlibdockercontainers
          hostPath:
            path: /var/lib/docker/containers
```

```bash
kubectl apply -f daemonset-fluentd.yaml -n logging

kubectl get daemonset -n logging
# NAME      DESIRED   CURRENT   READY   NODE SELECTOR
# fluentd   3         3         3       <none>
# → 1 Pod sur chaque Node du cluster

kubectl get pods -n logging -o wide
# NAME            READY   STATUS    NODE
# fluentd-4xkgn   1/1     Running   worker-1
# fluentd-8dvrg   1/1     Running   worker-2
# fluentd-k5bzv   1/1     Running   control-plane
```

---

## 10. Jobs & CronJobs

### 10.1 Jobs — Tâches ponctuelles

> *"Un Job est une tâche qui a un début et une fin — contrairement à un Deployment qui tourne indéfiniment."*

```yaml
# job-migration-db.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: migration-base-de-donnees
spec:
  completions: 1         # Nombre de Pods qui doivent réussir
  parallelism: 1         # Pods lancés en parallèle
  backoffLimit: 3        # Nombre de tentatives avant d'abandonner
  activeDeadlineSeconds: 300  # Timeout : 5 minutes max
  
  template:
    spec:
      restartPolicy: OnFailure   # OBLIGATOIRE pour un Job (Never ou OnFailure)
      containers:
        - name: migration
          image: mon-app:1.0
          command: ["python", "migrate.py", "--run"]
          env:
            - name: DB_HOST
              value: "mysql-headless.default.svc.cluster.local"
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: password
```

```bash
kubectl apply -f job-migration-db.yaml

# Suivre le Job
kubectl get jobs
# NAME                      COMPLETIONS   DURATION   AGE
# migration-base-de-donnees 1/1           15s        1m

# Voir les logs
kubectl logs job/migration-base-de-donnees

# Job avec parallélisme : traiter 10 items avec 3 workers en parallèle
kubectl create job traitement-batch \
  --image=mon-app:1.0 \
  -- python batch.py
```

### 10.2 Job Parallèle — Traitement par lots

```yaml
# job-parallel.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: traitement-images
spec:
  completions: 10       # 10 tâches au total
  parallelism: 3        # 3 en parallèle à la fois
  backoffLimit: 5
  
  template:
    spec:
      restartPolicy: OnFailure
      containers:
        - name: worker
          image: mon-image-processor:1.0
          command: ["python", "process.py"]
          env:
            - name: BATCH_INDEX
              valueFrom:
                fieldRef:
                  fieldPath: metadata.annotations['batch.kubernetes.io/job-completion-index']
```

### 10.3 CronJobs — Tâches planifiées

> *"Un CronJob, c'est crontab de Linux — mais pour Kubernetes."*

```yaml
# cronjob-backup.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: backup-quotidien
spec:
  schedule: "0 2 * * *"    # Tous les jours à 2h du matin
  #           │ │ │ │ │
  #           │ │ │ │ └── Jour de la semaine (0=dim, 6=sam)
  #           │ │ │ └──── Mois (1-12)
  #           │ │ └────── Jour du mois (1-31)
  #           │ └──────── Heure (0-23)
  #           └────────── Minute (0-59)
  
  concurrencyPolicy: Forbid     # Ne pas lancer si le précédent tourne encore
  successfulJobsHistoryLimit: 3  # Garder 3 Jobs réussis
  failedJobsHistoryLimit: 1      # Garder 1 Job échoué
  startingDeadlineSeconds: 60    # Si manqué, max 60s pour rattraper
  
  jobTemplate:
    spec:
      backoffLimit: 2
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: backup
              image: postgres:15
              command:
                - /bin/sh
                - -c
                - |
                  pg_dump -h $DB_HOST -U $DB_USER $DB_NAME > /backup/db-$(date +%Y%m%d).sql
                  echo "Backup terminé : $(date)"
              env:
                - name: DB_HOST
                  value: "postgres.default.svc.cluster.local"
                - name: DB_USER
                  valueFrom:
                    secretKeyRef:
                      name: db-credentials
                      key: username
                - name: DB_NAME
                  value: "production"
              volumeMounts:
                - name: backup-storage
                  mountPath: /backup
          volumes:
            - name: backup-storage
              persistentVolumeClaim:
                claimName: backup-pvc
```

**Exemples de schedules courants :**

```bash
# Toutes les minutes
schedule: "* * * * *"

# Toutes les 5 minutes
schedule: "*/5 * * * *"

# Tous les jours à minuit
schedule: "0 0 * * *"

# Tous les lundis à 9h
schedule: "0 9 * * 1"

# Le 1er de chaque mois à 6h
schedule: "0 6 1 * *"

# Toutes les heures
schedule: "0 * * * *"
```

```bash
kubectl apply -f cronjob-backup.yaml

kubectl get cronjob
# NAME               SCHEDULE    SUSPEND   ACTIVE   LAST SCHEDULE
# backup-quotidien   0 2 * * *   False     0        23h

# Lancer manuellement un CronJob (pour tester)
kubectl create job backup-test --from=cronjob/backup-quotidien

# Suspendre un CronJob
kubectl patch cronjob backup-quotidien -p '{"spec":{"suspend":true}}'
```

---

## 11. Volumes & PersistentVolumes

> *"Les conteneurs sont éphémères — quand un Pod meurt, ses données disparaissent. Les Volumes persistent les données."*

### 11.1 Types de volumes

| Type | Durée de vie | Usage |
|------|-------------|-------|
| `emptyDir` | Vie du Pod | Données temporaires partagées entre conteneurs |
| `hostPath` | Vie du Node | Accès aux fichiers du Node (logs système) |
| `PersistentVolume` | Indépendant | Données persistantes (BDD) |
| `configMap` | — | Monter une ConfigMap comme fichier |
| `secret` | — | Monter un Secret comme fichier |

### 11.2 PersistentVolume (PV) & PersistentVolumeClaim (PVC)

```
Administrateur crée le PV          Développeur crée le PVC
(stockage disponible)              (demande de stockage)
       │                                    │
       ▼                                    ▼
┌────────────────┐        lie         ┌────────────────┐
│ PersistentVol  │◄──────────────────►│ PVClaim        │
│ 20Gi, SSD      │                    │ Besoin: 10Gi   │
└────────────────┘                    └────────────────┘
                                             │
                                             ▼
                                        Monté dans le Pod
```

```yaml
# PersistentVolume (créé par l'admin)
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-mysql-data
spec:
  capacity:
    storage: 20Gi
  accessModes:
    - ReadWriteOnce     # 1 seul Pod peut lire/écrire
  persistentVolumeReclaimPolicy: Retain  # Garder les données après suppression du PVC
  storageClassName: "manual"
  hostPath:
    path: /data/mysql   # Sur le Node (dev/test uniquement)

---
# PersistentVolumeClaim (créé par le développeur)
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: "manual"
  resources:
    requests:
      storage: 10Gi   # Demande 10Gi du PV de 20Gi disponible

---
# Utilisation dans un Pod
apiVersion: v1
kind: Pod
metadata:
  name: mysql-pod
spec:
  containers:
    - name: mysql
      image: mysql:8.0
      volumeMounts:
        - name: mysql-storage
          mountPath: /var/lib/mysql
  volumes:
    - name: mysql-storage
      persistentVolumeClaim:
        claimName: mysql-pvc    # Référence au PVC
```

### 11.3 StorageClass — Provisionnement dynamique

```yaml
# En cloud (AWS, GCP, Azure), le PV est créé automatiquement
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ssd-rapide
provisioner: kubernetes.io/aws-ebs   # AWS EBS
parameters:
  type: gp3
  iops: "3000"
  encrypted: "true"
reclaimPolicy: Delete
allowVolumeExpansion: true

---
# Le PVC déclenche la création automatique du PV
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-data
spec:
  storageClassName: "ssd-rapide"    # Référence la StorageClass
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 50Gi
# → AWS crée automatiquement un volume EBS gp3 de 50Gi
```

---

## 12. Ingress — Exposition HTTP

> *"Un Service NodePort ou LoadBalancer expose 1 Service = 1 port. L'Ingress permet de router plusieurs Services sur le port 80/443 selon l'URL."*

### 12.1 Sans vs Avec Ingress

```
SANS INGRESS :
  api.exemple.com    → LoadBalancer :80 → Service API
  app.exemple.com    → LoadBalancer :80 → Service Frontend
  → 2 LoadBalancers = 2 IPs publiques = coût × 2

AVEC INGRESS :
  api.exemple.com    ─┐
  app.exemple.com    ─┤→ Ingress Controller → Service API
  /admin             ─┘                    → Service Frontend
  → 1 seul LoadBalancer, routage intelligent
```

### 12.2 Ingress nginx

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mon-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: letsencrypt-prod  # TLS auto
spec:
  ingressClassName: nginx
  
  # TLS
  tls:
    - hosts:
        - api.exemple.com
        - app.exemple.com
      secretName: tls-exemple-com
  
  rules:
    # Routage par hostname
    - host: api.exemple.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-service
                port:
                  number: 8080
    
    - host: app.exemple.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-service
                port:
                  number: 3000
          # Routage par chemin
          - path: /admin
            pathType: Prefix
            backend:
              service:
                name: admin-service
                port:
                  number: 9000
```

```bash
# Installer nginx Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.4/deploy/static/provider/cloud/deploy.yaml

kubectl apply -f ingress.yaml

kubectl get ingress
# NAME          CLASS   HOSTS                               ADDRESS        PORTS
# mon-ingress   nginx   api.exemple.com,app.exemple.com     52.14.10.5     80,443
```

---

## 13. RBAC & Sécurité

> *"RBAC (Role-Based Access Control) — qui peut faire quoi dans votre cluster."*

### 13.1 Concepts RBAC

```
ServiceAccount / User / Group
          │
          │ lié par RoleBinding
          ▼
       Role (dans 1 namespace) ou ClusterRole (tout le cluster)
          │
          └── Rules : [Verbs] sur [Resources]
                      get, list, create, update, delete
                      pods, deployments, secrets...
```

### 13.2 Exemple — Développeur lecture seule

```yaml
# Role : lecture seule sur les Pods dans le namespace "dev"
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: lecture-pods
  namespace: dev
rules:
  - apiGroups: [""]
    resources: ["pods", "pods/log"]
    verbs: ["get", "list", "watch"]
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list"]

---
# Lier le Role à un utilisateur
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: binding-dev-alice
  namespace: dev
subjects:
  - kind: User
    name: alice
    apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: lecture-pods
  apiGroup: rbac.authorization.k8s.io
```

### 13.3 ServiceAccount pour une application

```yaml
# ServiceAccount pour un Pod qui doit lire les ConfigMaps
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-reader
  namespace: production

---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: configmap-reader
  namespace: production
rules:
  - apiGroups: [""]
    resources: ["configmaps"]
    verbs: ["get", "list"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: app-configmap-binding
  namespace: production
subjects:
  - kind: ServiceAccount
    name: app-reader
roleRef:
  kind: Role
  name: configmap-reader
  apiGroup: rbac.authorization.k8s.io

---
# Utilisation dans le Deployment
spec:
  template:
    spec:
      serviceAccountName: app-reader   # Associer le SA au Pod
      containers:
        - name: app
          image: mon-app:1.0
```

---

## 14. Diagnostic & Troubleshooting

> *"Quand quelque chose ne va pas, ces commandes sont vos meilleurs alliés."*

### 14.1 Commandes de base

```bash
# ─── PODS ────────────────────────────────────────────────
# Lister tous les pods (avec leur status)
kubectl get pods -A                         # Tous les namespaces
kubectl get pods -n production -o wide      # Avec IP et Node
kubectl get pods --watch                    # Surveiller en temps réel

# Détails complets d'un Pod (events inclus)
kubectl describe pod <nom-du-pod>

# Logs
kubectl logs <pod>                          # Logs du conteneur principal
kubectl logs <pod> -c <conteneur>           # Logs d'un conteneur spécifique
kubectl logs <pod> --previous               # Logs avant le dernier crash
kubectl logs <pod> -f                       # Suivre en temps réel
kubectl logs <pod> --tail=100               # 100 dernières lignes

# Entrer dans un Pod
kubectl exec -it <pod> -- /bin/bash
kubectl exec -it <pod> -c <conteneur> -- sh

# ─── DEPLOYMENTS ─────────────────────────────────────────
kubectl get deployments -A
kubectl describe deployment <nom>
kubectl rollout status deployment/<nom>
kubectl rollout history deployment/<nom>

# ─── EVENTS ──────────────────────────────────────────────
# Les events expliquent souvent pourquoi un Pod ne démarre pas
kubectl get events -n <namespace> --sort-by='.lastTimestamp'
kubectl describe pod <pod> | grep -A10 Events

# ─── NODES ───────────────────────────────────────────────
kubectl get nodes
kubectl describe node <nom-node>
kubectl top nodes              # Utilisation CPU/RAM (nécessite metrics-server)
kubectl top pods -A
```

### 14.2 Diagnostic par symptôme

**Pod en état `Pending` :**

```bash
kubectl describe pod <pod>
# Chercher dans les Events :
# → "Insufficient cpu/memory" → Node pas assez de ressources
# → "no nodes available"      → Tous les nodes sont taintés
# → "PVC not bound"           → PersistentVolumeClaim non satisfait
```

**Pod en `CrashLoopBackOff` :**

```bash
kubectl logs <pod> --previous   # Logs avant le crash
kubectl describe pod <pod>      # Voir exit code et raison
# Exit Code 1  → Erreur applicative
# Exit Code 137 → OOMKilled (manque de mémoire)
# Exit Code 139 → Segmentation fault
```

**Pod en `ImagePullBackOff` :**

```bash
kubectl describe pod <pod>
# → "unauthorized" → Pas de credentials pour le registry privé
# → "not found"    → Nom d'image ou tag incorrect
# Solution : kubectl create secret docker-registry regcred \
#   --docker-server=<registry> --docker-username=<user> --docker-password=<pass>
```

**Service inaccessible :**

```bash
# Vérifier que le selector correspond aux labels des Pods
kubectl get service <svc> -o yaml | grep selector
kubectl get pods --show-labels | grep <label>

# Tester depuis un Pod de debug
kubectl run debug --rm -it --image=busybox -- sh
# Dans le Pod : wget -qO- http://<service-name>:<port>

# Vérifier les endpoints du Service
kubectl get endpoints <service-name>
# Si ENDPOINTS est <none> → selector ne matche aucun Pod
```

### 14.3 Pod de debug temporaire

```bash
# Lancer un Pod de debug éphémère (supprimé automatiquement)
kubectl run debug \
  --rm -it \
  --image=nicolaka/netshoot \  # Image riche en outils réseau
  -- bash

# Depuis ce pod, tester :
# nslookup mon-service.default.svc.cluster.local
# curl http://mon-service:80
# ping 10.244.0.5
```

---

## 15. etcd — Maintenance Avancée

<div align="center">
<img src="https://raw.githubusercontent.com/etcd-io/etcd/main/logos/etcd-horizontal-color.svg" alt="etcd Logo" width="160"/>
</div>

### 15.1 Sauvegardes etcd

```bash
# Variables d'environnement pour etcdctl
export ETCDCTL_API=3
export ETCDCTL_ENDPOINTS=https://127.0.0.1:2379
export ETCDCTL_CACERT=/etc/kubernetes/pki/etcd/ca.crt
export ETCDCTL_CERT=/etc/kubernetes/pki/etcd/server.crt
export ETCDCTL_KEY=/etc/kubernetes/pki/etcd/server.key

# Créer un snapshot
etcdctl snapshot save /backup/etcd-$(date +%Y%m%d-%H%M%S).db

# Vérifier l'intégrité
etcdutl snapshot status /backup/etcd-*.db --write-out=table
# +----------+----------+------------+------------+
# |   HASH   | REVISION | TOTAL KEYS | TOTAL SIZE |
# +----------+----------+------------+------------+
# | fc5e5e6e |   843291 |       1247 |     5.2 MB |
# +----------+----------+------------+------------+

# Script de backup automatique (cron)
cat << 'EOF' > /usr/local/bin/backup-etcd.sh
#!/bin/bash
BACKUP_DIR="/backup/etcd"
RETENTION_DAYS=7
mkdir -p $BACKUP_DIR

etcdctl snapshot save $BACKUP_DIR/etcd-$(date +%Y%m%d-%H%M%S).db
find $BACKUP_DIR -name "*.db" -mtime +$RETENTION_DAYS -delete
echo "Backup etcd terminé : $(date)"
EOF
chmod +x /usr/local/bin/backup-etcd.sh

# Cron : toutes les heures
echo "0 * * * * root /usr/local/bin/backup-etcd.sh" >> /etc/crontab
```

### 15.2 Restaurer etcd

```bash
# ⚠️ PROCÉDURE DE RESTAURATION — À exécuter sur TOUS les control planes

# Étape 1 : Arrêter les composants du Control Plane
mv /etc/kubernetes/manifests /etc/kubernetes/manifests.bak
# (les composants sont des static pods — les déplacer les arrête)

# Étape 2 : Sauvegarder l'ancien etcd
mv /var/lib/etcd /var/lib/etcd.bak

# Étape 3 : Restaurer depuis le snapshot
etcdutl snapshot restore /backup/etcd-20240115-020000.db \
  --data-dir=/var/lib/etcd \
  --name=master-1 \
  --initial-cluster=master-1=https://192.168.1.10:2380 \
  --initial-cluster-token=etcd-cluster-1 \
  --initial-advertise-peer-urls=https://192.168.1.10:2380

# Étape 4 : Corriger les permissions
chown -R etcd:etcd /var/lib/etcd

# Étape 5 : Relancer le Control Plane
mv /etc/kubernetes/manifests.bak /etc/kubernetes/manifests

# Étape 6 : Vérifier
etcdctl endpoint health
etcdctl endpoint status --cluster -w table
```

### 15.3 Maintenance courante

```bash
# ─── COMPACTION ──────────────────────────────────────────
# Obtenir la révision actuelle
REV=$(etcdctl endpoint status --write-out=json | \
  python3 -c "import sys,json; print(json.load(sys.stdin)[0]['Status']['header']['revision'])")

# Compacter jusqu'à la révision actuelle
etcdctl compact $REV

# ─── DÉFRAGMENTATION ──────────────────────────────────────
# Toujours après une compaction
etcdctl defrag --endpoints=https://127.0.0.1:2379
# Défragmenter tous les membres
etcdctl defrag --cluster

# ─── ALARMES ─────────────────────────────────────────────
etcdctl alarm list
# memberID:8e9e05c52164694d alarm:NOSPACE
etcdctl alarm disarm    # Après résolution

# ─── SANTÉ DU CLUSTER ────────────────────────────────────
etcdctl endpoint health --cluster
# https://192.168.1.10:2379 is healthy
# https://192.168.1.11:2379 is healthy
# https://192.168.1.12:2379 is healthy

etcdctl endpoint status --cluster -w table
# ENDPOINT           ID              STATUS   LEADER DB SIZE
# 192.168.1.10:2379  8e9e05c52164694d healthy  true   5.2 MB
```

### 15.4 Métriques et alertes

```yaml
# Alerte Prometheus — Exemples complets
groups:
  - name: etcd.rules
    rules:
      # Pas de leader
      - alert: EtcdNoLeader
        expr: etcd_server_has_leader == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "etcd n'a pas de leader !"

      # Latence disque élevée
      - alert: EtcdHighDiskLatency
        expr: histogram_quantile(0.99, rate(etcd_disk_backend_commit_duration_seconds_bucket[5m])) > 0.025
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Latence disque etcd > 25ms"

      # Base de données proche du quota
      - alert: EtcdDatabaseNearQuota
        expr: etcd_mvcc_db_total_size_in_bytes / etcd_server_quota_backend_bytes > 0.8
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "etcd utilise > 80% de son quota"

      # Changements de leader fréquents
      - alert: EtcdLeaderChanges
        expr: increase(etcd_server_leader_changes_seen_total[15m]) > 3
        labels:
          severity: warning
        annotations:
          summary: "Changements de leader etcd fréquents"
```

### 15.5 Checklist Production

- [ ] **Cluster de 3 ou 5 membres** (nombre impair)
- [ ] **SSD dédié pour etcd** (latence < 10ms en p99)
- [ ] **Réseau < 10ms** entre membres etcd
- [ ] **mTLS activé** clients et peers
- [ ] **Backups toutes les heures** sur stockage externe (S3/GCS)
- [ ] **Restauration testée** sur cluster de staging
- [ ] **Quota configuré** (ex : 8 Go) et surveillé
- [ ] **Compaction automatique** (toutes les semaines)
- [ ] **Alertes Prometheus** configurées (leader, latence, quota)
- [ ] **Runbook de restauration** documenté et accessible

---

## 🎯 Récapitulatif — Choisir le bon objet Kubernetes

| Besoin | Objet à utiliser |
|--------|-----------------|
| App sans état (nginx, API REST) | **Deployment** |
| App avec état (MySQL, Kafka, Redis) | **StatefulSet** |
| Agent sur chaque Node (logs, monitoring) | **DaemonSet** |
| Tâche ponctuelle (migration, batch) | **Job** |
| Tâche planifiée (backup, rapport) | **CronJob** |
| Exposer en interne | **Service ClusterIP** |
| Exposer sur un port Node | **Service NodePort** |
| Exposer via cloud LB | **Service LoadBalancer** |
| Routage HTTP/HTTPS multi-services | **Ingress** |
| Configuration non sensible | **ConfigMap** |
| Mots de passe, certificats | **Secret** |
| Stockage persistant | **PVC + PV** |
| Isolation équipe/env | **Namespace** |
| Limiter les ressources | **ResourceQuota** |
| Contrôle d'accès | **RBAC (Role + RoleBinding)** |

---

## 📌 Ressources Utiles

- 📘 [Documentation officielle Kubernetes](https://kubernetes.io/docs/)
- 📗 [Guide etcd](https://etcd.io/docs/)
- 📊 [Prometheus pour le monitoring](https://prometheus.io/docs/)
- 🛠️ [kind — cluster local](https://kind.sigs.k8s.io/)
- 🛠️ [minikube — cluster local](https://minikube.sigs.k8s.io/)
- 🔐 [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets)
- 📈 [Lens — IDE pour Kubernetes](https://k8slens.dev/)

---

<div align="center">

<img src="https://upload.wikimedia.org/wikipedia/commons/3/39/Kubernetes_logo_without_workmark.svg" alt="Kubernetes" width="50"/>
&nbsp;&nbsp;
<img src="https://raw.githubusercontent.com/etcd-io/etcd/main/logos/etcd-horizontal-color.svg" alt="etcd" width="100"/>

*Bonne exploration de Kubernetes et etcd ! 🚀*

*Guide complet · Architecture · Workloads · Réseau · Sécurité · Maintenance*

</div>
