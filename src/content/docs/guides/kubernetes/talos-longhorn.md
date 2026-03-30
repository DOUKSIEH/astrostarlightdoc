---
title: "🚀 Migration de `local-path` vers Longhorn sur Talos Linux"
description: "Guide pédagogique complet - Migration de `local-path` vers Longhorn sur Talos Linux"
created: "2026-03-26"
#updated: "2026-02-02"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"

---

> **À qui s'adresse ce guide ?**
> Ce document est conçu pour **tout public curieux** : développeurs, administrateurs système, étudiants, ou simplement des personnes qui veulent comprendre comment fonctionne le stockage distribué dans Kubernetes. Aucune expérience préalable avec Longhorn n'est requise. Chaque commande est expliquée, chaque concept est illustré, chaque erreur est décortiquée.

> 📌 **Versions** : Longhorn 1.9.0 · Talos Linux v1.12.1 · Kubernetes 1.29+

---

## 📋 Table des matières

**Partie I — Comprendre avant d'agir**
1. [Pourquoi migrer ? local-path vs Longhorn](#1-pourquoi-migrer--local-path-vs-longhorn)
2. [Architecture de Longhorn : les deux plans](#2-architecture-de-longhorn--les-deux-plans)
3. [Les composants expliqués un par un](#3-les-composants-expliqués-un-par-un)
4. [Comment Longhorn stocke les données : volumes, réplicas, thin provisioning](#4-comment-longhorn-stocke-les-données--volumes-réplicas-thin-provisioning)
5. [Les snapshots en profondeur](#5-les-snapshots-en-profondeur)
6. [Les backups et le stockage secondaire](#6-les-backups-et-le-stockage-secondaire)
7. [Le stockage persistant Kubernetes — rappel fondamental](#7-le-stockage-persistant-kubernetes--rappel-fondamental)

**Partie II — Installer Longhorn sur Talos Linux**

8.  [Architecture de notre environnement de test](#8-architecture-de-notre-environnement-de-test)
9.  [Prérequis et préparation](#9-prérequis-et-préparation)
10. [Étape 1 — Préparer le nœud cible (labels)](#10-étape-1--préparer-le-nœud-cible-labels)
11. [Étape 2 — Créer le fichier de configuration Helm](#11-étape-2--créer-le-fichier-de-configuration-helm)
12. [Étape 3 — Résoudre les conflits de release Helm](#12-étape-3--résoudre-les-conflits-de-release-helm)
13. [Étape 4 — Résoudre l'erreur managedFields](#13-étape-4--résoudre-lerreur-managedfields)
14. [Étape 5 — Configurer la sécurité du namespace](#14-étape-5--configurer-la-sécurité-du-namespace)
15. [Étape 6 — Installer Longhorn via Helm](#15-étape-6--installer-longhorn-via-helm)
16. [Étape 7 — Valider et tester l'installation](#16-étape-7--valider-et-tester-linstallation)

**Partie III — Migrer depuis local-path**

17. [Comprendre les enjeux de la migration](#17-comprendre-les-enjeux-de-la-migration)
18. [Procédure de migration pas à pas](#18-procédure-de-migration-pas-à-pas)
19. [Cheat Sheet — Commandes essentielles](#19-cheat-sheet--commandes-essentielles)
20. [Glossaire des termes clés](#20-glossaire-des-termes-clés)

---

# PARTIE I — Comprendre avant d'agir

---

## 1. Pourquoi migrer ? local-path vs Longhorn

### Qu'est-ce que local-path ?

`local-path-provisioner` est un système de stockage **simple et local** intégré dans les distributions légères de Kubernetes comme K3s ou Talos. Son principe est aussi basique que son nom : stocker les données dans un dossier du nœud qui fait tourner le pod.

```
┌──────────────────────────────────────────────────────────┐
│                   CLUSTER KUBERNETES                     │
│                                                          │
│  ┌───────────────────────────────────────────────────┐   │
│  │              Nœud Worker 1                        │   │
│  │                                                   │   │
│  │   ┌──────────────┐        ┌───────────────────┐   │   │
│  │   │   Pod : App  │ ─────▶ │  /opt/local-path/ │   │   │
│  │   │  (base de    │        │  pvc-abc123/      │   │   │
│  │   │   données)   │        │  (disque local)   │   │   │
│  │   └──────────────┘        └───────────────────┘   │   │
│  │                                                   │   │
│  │   ⚠️  Si ce nœud tombe en panne → DONNÉES PERDUES │   │
│  └───────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

**Les limites critiques de local-path :**

| Problème | Conséquence concrète |
|---|---|
| 🔴 **Pas de réplication** | Panne du nœud = perte totale des données |
| 🔴 **Pod lié au nœud** | Si le nœud est hors ligne, le pod ne peut pas redémarrer ailleurs |
| 🔴 **Pas de snapshot natif** | Impossible de faire un point de restauration du volume |
| 🔴 **Pas de backup intégré** | Aucune solution de sauvegarde automatique |
| 🟡 **Pas d'interface** | Aucune visibilité sur l'état du stockage |
| ✅ **Simple et rapide** | Parfait pour les tests et le développement local |

> 💡 **Résumé en une phrase** : local-path c'est comme stocker des fichiers importants sur une seule clé USB sans copie de sauvegarde.

---

### Qu'est-ce que Longhorn ?

Longhorn est un système de stockage **distribué, répliqué et résilient** pour Kubernetes, créé par Rancher Labs (SUSE) et hébergé par la CNCF (Cloud Native Computing Foundation). Il transforme les disques locaux de vos nœuds en un pool de stockage partagé, accessible depuis n'importe quel pod du cluster.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLUSTER KUBERNETES                           │
│                                                                     │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐           │
│  │  Worker 1   │     │  Worker 2   │     │  Worker 3   │           │
│  │             │     │             │     │             │           │
│  │ ┌─────────┐ │     │ ┌─────────┐ │     │ ┌─────────┐ │           │
│  │ │Replica 1│ │◀───▶│ │Replica 2│ │◀───▶│ │Replica 3│ │           │
│  │ │(copie 1)│ │     │ │(copie 2)│ │     │ │(copie 3)│ │           │
│  │ └─────────┘ │     │ └─────────┘ │     │ └─────────┘ │           │
│  │  /var/lib/  │     │  /var/lib/  │     │  /var/lib/  │           │
│  │  longhorn/  │     │  longhorn/  │     │  longhorn/  │           │
│  └─────────────┘     └─────────────┘     └─────────────┘           │
│          ▲                                                          │
│          │  iSCSI (protocole de stockage réseau)                    │
│          │                                                          │
│  ┌───────┴──────────────────────┐                                   │
│  │      Longhorn Engine         │  ← 1 contrôleur dédié/volume     │
│  └──────────────────────────────┘                                   │
│          ▲                                                          │
│          │                                                          │
│  ┌───────┴───────┐                                                  │
│  │  Pod : App    │  ← accède à UN volume unifié, peu importe        │
│  │ (base de      │    sur quel nœud il tourne                       │
│  │  données)     │                                                  │
│  └───────────────┘                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

**Les avantages de Longhorn :**

| Fonctionnalité | Ce que ça signifie pour vous |
|---|---|
| ✅ **Réplication automatique** | Vos données existent sur N nœuds simultanément |
| ✅ **Haute disponibilité** | Un nœud tombe : vos applications continuent sans interruption |
| ✅ **Snapshots locaux** | Capturez l'état d'un volume en un instant, restaurez à volonté |
| ✅ **Backups distants** | Envoyez vos sauvegardes vers S3 ou NFS automatiquement |
| ✅ **Interface web** | Dashboard visuel complet (volumes, nœuds, réplicas, santé) |
| ✅ **Expansion en ligne** | Agrandissez un volume sans arrêter votre application |
| ✅ **CSI complet** | S'intègre nativement dans Kubernetes (PVC, StorageClass...) |

---

## 2. Architecture de Longhorn : les deux plans

La documentation officielle de Longhorn distingue deux couches architecturales fondamentales. Les comprendre évite beaucoup de confusion lors du débogage.

```
┌─────────────────────────────────────────────────────────────────────┐
│                   ARCHITECTURE LONGHORN                             │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   PLAN DE CONTRÔLE                          │   │
│  │                  (Control Plane)                            │   │
│  │                                                             │   │
│  │   Longhorn Manager                                          │   │
│  │   ┌──────────┐  ┌──────────┐  ┌──────────┐                 │   │
│  │   │Worker 1  │  │Worker 2  │  │Worker 3  │  ← DaemonSet    │   │
│  │   │ Manager  │  │ Manager  │  │ Manager  │    (1 pod        │   │
│  │   │  Pod     │  │  Pod     │  │  Pod     │    par nœud)     │   │
│  │   └──────────┘  └──────────┘  └──────────┘                 │   │
│  │        │                                                    │   │
│  │        ▼ Surveille l'API Kubernetes (CRDs)                  │   │
│  │   Création / Suppression / Expansion de volumes             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                           │                                         │
│                           ▼ orchestre                               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    PLAN DE DONNÉES                          │   │
│  │                    (Data Plane)                             │   │
│  │                                                             │   │
│  │   Longhorn Engine  ← UN par volume, tourne sur le nœud     │   │
│  │   ┌─────────────────────────────────────────────────────┐  │   │
│  │   │  Volume A : Engine A  ──────▶ Replica A1 (nœud 1)  │  │   │
│  │   │                       ──────▶ Replica A2 (nœud 2)  │  │   │
│  │   │                       ──────▶ Replica A3 (nœud 3)  │  │   │
│  │   └─────────────────────────────────────────────────────┘  │   │
│  │   ┌─────────────────────────────────────────────────────┐  │   │
│  │   │  Volume B : Engine B  ──────▶ Replica B1 (nœud 1)  │  │   │
│  │   │                       ──────▶ Replica B2 (nœud 2)  │  │   │
│  │   └─────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Pourquoi cette séparation est-elle importante ?

Cette architecture **microservices** est l'une des décisions de design les plus intelligentes de Longhorn.

**Dans un système monolithique** (comme Ceph ou GlusterFS), un seul processus central gère tous les volumes. Si ce processus plante → tout le stockage est affecté simultanément.

**Dans Longhorn**, chaque volume a son propre moteur indépendant. Si le moteur du Volume A plante → seul le Volume A est affecté. Les Volumes B, C, D continuent parfaitement. De plus, chaque volume peut être mis à jour indépendamment, sans interruption globale.

> 💡 **Analogie** : Imaginez une compagnie aérienne. Système monolithique = un seul pilote gère tous les avions (impossible). Système microservices = chaque avion a son propre pilote. Si un pilote a un problème, seul son avion est affecté.

---

## 3. Les composants expliqués un par un

### 3.1 — Longhorn Manager : le cerveau

```
┌─────────────────────────────────────────────────────────────────┐
│  LONGHORN MANAGER                                               │
│  Type : DaemonSet Kubernetes (1 pod par nœud)                  │
│                                                                 │
│  Responsabilités :                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. Surveille l'API Kubernetes (pattern "operator")      │   │
│  │ 2. Crée/supprime/gère les volumes (via CRDs Longhorn)   │   │
│  │ 3. Orchestre la création des Engines et Replicas        │   │
│  │ 4. Gère la reconstruction après une panne              │   │
│  │ 5. Expose l'API Longhorn (utilisée par l'UI et le CSI) │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Cycle de vie d'une demande (pattern Kubernetes "operator") :   │
│                                                                 │
│  Demande PVC ──▶ Kubernetes crée un CRD Volume ──▶ Manager     │
│  détecte le changement ──▶ crée l'Engine + les Replicas        │
└─────────────────────────────────────────────────────────────────┘
```

Le Longhorn Manager suit le **pattern Operator** de Kubernetes : il observe en permanence l'état des ressources (via l'API server) et agit pour réconcilier l'état réel avec l'état désiré. C'est exactement comme un opérateur humain qui surveille un tableau de bord et corrige les anomalies dès qu'elles apparaissent.

### 3.2 — Longhorn Engine : le moteur de données

```
┌─────────────────────────────────────────────────────────────────┐
│  LONGHORN ENGINE                                                │
│  Type : Processus Linux géré par l'Instance Manager            │
│  Nombre : UN par volume actif                                   │
│  Lieu : TOUJOURS sur le même nœud que le pod consommateur      │
│                                                                 │
│  Flux de données :                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  Pod App                                                │   │
│  │    │  (écriture de données)                             │   │
│  │    ▼                                                    │   │
│  │  Engine (sur le même nœud que le pod)                  │   │
│  │    │──iSCSI──▶ Replica 1 (nœud 1) ──▶ /var/lib/longhorn│   │
│  │    │──iSCSI──▶ Replica 2 (nœud 2) ──▶ /var/lib/longhorn│   │
│  │    │──iSCSI──▶ Replica 3 (nœud 3) ──▶ /var/lib/longhorn│   │
│  │                                                         │   │
│  │  ✅ L'écriture est confirmée SEULEMENT quand TOUTES les  │   │
│  │     replicas ont acquitté → cohérence garantie          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

> 🔍 **Point crucial** : L'Engine tourne toujours sur le **même nœud que le pod**. Cela minimise la latence réseau pour les I/O locaux. L'Engine gère ensuite la réplication vers les autres nœuds de façon synchrone et transparente.

### 3.3 — Instance Manager : le gardien des processus

L'Instance Manager est un pod présent sur chaque nœud. Son rôle est de démarrer, surveiller et arrêter les processus Engine et Replica locaux. C'est lui qui gère le cycle de vie des processus bas-niveau sur le nœud.

```
┌──────────────────────────────────────────────────┐
│  NŒUD WORKER 1                                   │
│                                                  │
│  Instance Manager Pod                            │
│  ┌────────────────────────────────────────────┐  │
│  │  Gère les processus locaux :               │  │
│  │  - Engine du Volume A (si attaché ici)    │  │
│  │  - Replica du Volume A (copie locale)     │  │
│  │  - Replica du Volume B (copie locale)     │  │
│  │  - Replica du Volume C (copie locale)     │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

### 3.4 — Le CSI Driver : le pont Kubernetes

CSI signifie **Container Storage Interface** — un standard universel qui définit comment les systèmes de stockage tiers s'intègrent dans Kubernetes.

```
┌────────────────────────────────────────────────────────────┐
│  FLUX D'UNE DEMANDE DE VOLUME (PVC)                        │
│                                                            │
│  1. kubectl apply -f mon-pvc.yaml                          │
│          │                                                 │
│          ▼                                                 │
│  2. API Kubernetes reçoit la demande PVC                   │
│          │                                                 │
│          ▼                                                 │
│  3. CSI Provisioner (Longhorn) détecte le PVC              │
│          │                                                 │
│          ▼                                                 │
│  4. CSI appelle l'API Longhorn Manager                     │
│          │                                                 │
│          ▼                                                 │
│  5. Longhorn Manager crée Volume + Engine + Replicas       │
│          │                                                 │
│          ▼                                                 │
│  6. CSI Attacher connecte le volume au nœud du pod         │
│          │                                                 │
│          ▼                                                 │
│  7. CSI Driver formate le volume (ext4) et le monte        │
│          │                                                 │
│          ▼                                                 │
│  8. Kubelet monte le volume dans le Pod                    │
│          │                                                 │
│          ▼                                                 │
│  9. Le Pod lit/écrit dans /data (ou autre mountPath)       │
└────────────────────────────────────────────────────────────┘
```

Le CSI Longhorn comprend plusieurs sous-composants :

| Composant | Rôle |
|---|---|
| `csi-provisioner` | Crée et supprime des volumes |
| `csi-attacher` | Attache/détache un volume à un nœud |
| `csi-resizer` | Gère l'expansion à chaud de volume |
| `csi-snapshotter` | Gère les VolumeSnapshots Kubernetes |

### 3.5 — L'interface Web Longhorn (UI)

L'UI Longhorn est une application React qui communique avec le Longhorn Manager via son API REST. Elle permet de :

- Visualiser l'état de tous les volumes et leur niveau de santé
- Voir les replicas de chaque volume (sur quels nœuds, état de sync)
- Créer/restaurer des snapshots manuellement
- Configurer et lancer des backups vers S3 ou NFS
- Superviser l'utilisation de l'espace disque de chaque nœud
- Activer/désactiver le scheduling sur un nœud pour la maintenance

```bash
# Accéder à l'UI en local (tunnel kubectl)
kubectl port-forward -n longhorn-system svc/longhorn-frontend 8080:80
# Puis ouvrir : http://localhost:8080
```

---

## 4. Comment Longhorn stocke les données : volumes, réplicas, thin provisioning

### 4.1 — Le Thin Provisioning : ne pas réserver ce qu'on n'utilise pas

Longhorn utilise le **thin provisioning** (provisionnement à la volée). Un volume de 20 Go ne réserve pas immédiatement 20 Go sur le disque. Il ne consomme que l'espace réellement écrit.

```
THICK PROVISIONING (réservation statique — NON utilisé par Longhorn)
  Volume déclaré : 20 Go
  Données réelles : 1 Go
  Espace réservé sur disque : 20 Go  ← 19 Go gaspillés

THIN PROVISIONING (Longhorn) ✅
  Volume déclaré : 20 Go
  Données réelles : 1 Go
  Espace réel sur disque : ~1 Go  ← efficace !

⚠️  LIMITE IMPORTANTE : Un volume Longhorn ne peut PAS rétrécir.
    Si vous écrivez 10 Go puis supprimez 9 Go de fichiers,
    l'espace sur disque reste à ~10 Go.
    Longhorn opère au niveau BLOC, pas au niveau FICHIER.
    Il ne sait pas que vous avez supprimé des fichiers dans ext4.
    → Solution : utiliser fstrim (disponible dans l'UI Longhorn)
```

### 4.2 — Les Réplicas : la chaîne de snapshots

Chaque réplica d'un volume Longhorn est constitué d'une **chaîne de fichiers différentiels** construite comme les couches d'un oignon. Chaque couche ne contient que les blocs qui ont changé par rapport à la couche précédente.

```
┌────────────────────────────────────────────────────────────────┐
│  STRUCTURE D'UN RÉPLICA LONGHORN                               │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  LIVE DATA (volume-head)                                │  │
│  │  Données actuellement lues/écrites par le pod.          │  │
│  │  Ce n'est pas encore un snapshot.                       │  │
│  └────────────────────────┬────────────────────────────────┘  │
│                           │  basé sur                         │
│  ┌────────────────────────▼────────────────────────────────┐  │
│  │  Snapshot 3 (le plus récent)                            │  │
│  │  Contient UNIQUEMENT les blocs qui ont changé           │  │
│  │  par rapport au Snapshot 2.                             │  │
│  └────────────────────────┬────────────────────────────────┘  │
│                           │  basé sur                         │
│  ┌────────────────────────▼────────────────────────────────┐  │
│  │  Snapshot 2                                             │  │
│  └────────────────────────┬────────────────────────────────┘  │
│                           │  basé sur                         │
│  ┌────────────────────────▼────────────────────────────────┐  │
│  │  Snapshot 1 (le plus ancien = base)                     │  │
│  │  Contient toutes les données initiales                  │  │
│  └─────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### 4.3 — Le Read Index : trouver la donnée la plus fraîche

Pour savoir où se trouve la version la plus récente d'un bloc de données, Longhorn maintient un **Read Index** en mémoire. C'est une table qui associe chaque bloc de 4 Ko à sa source la plus récente.

```
┌──────────────────────────────────────────────────────────────┐
│  READ INDEX (exemple pour un volume de 8 blocs de 4Ko)       │
│                                                              │
│  Bloc  │ Source des données les plus récentes               │
│  ────  │ ────────────────────────────────────────────────── │
│   0    │ Snapshot 3 (le plus récent)                        │
│   1    │ Live data (vient d'être écrit par le pod)          │
│   2    │ Snapshot 1 (le plus ancien)                        │
│   3    │ Snapshot 1                                         │
│   4    │ Snapshot 1                                         │
│   5    │ Live data (a été réécrit récemment)                │
│   6    │ Live data                                          │
│   7    │ Live data                                          │
│                                                              │
│  💡 Statistiques du Read Index :                             │
│     - Occupe 1 octet par bloc de 4 Ko en mémoire RAM        │
│     - Pour 1 To de volume → ~256 Mo de RAM consommés        │
│     - Maximum 254 snapshots par volume (limite de l'index)  │
└──────────────────────────────────────────────────────────────┘
```

**Lecture d'un bloc** : Longhorn consulte le Read Index → lit directement dans la couche indiquée.

**Écriture d'un bloc** : Longhorn écrit dans le Live Data → met à jour le Read Index → envoie l'écriture à **toutes les replicas simultanément** → confirme seulement quand toutes ont acquitté.

### 4.4 — Reconstruction automatique d'une replica

Quand une replica tombe en panne, Longhorn la reconstruit automatiquement sans interruption de service :

```
ÉTAPE 1 : Détection
  Engine détecte une Replica silencieuse
  → La marque "faulty"
  → Continue à fonctionner avec les replicas restantes
  (si N replicas configurées et au moins 1 saine : le volume reste opérationnel)

ÉTAPE 2 : Création de la nouvelle replica
  Longhorn Manager crée une replica vide sur un nœud sain différent
  → L'ajoute en mode WO (write-only : reçoit les nouvelles écritures)

ÉTAPE 3 : Synchronisation en arrière-plan (sans interruption)
  Pause très brève (millisecondes) des I/O
  → Snapshot de toutes les replicas saines
  → Reprise normale des I/O
  → Copie en arrière-plan depuis une replica saine
  → Quand sync complète → passage en mode RW (read-write)

ÉTAPE 4 : Nettoyage
  Suppression de la replica défectueuse
  Le volume retrouve son niveau de réplication cible
```

> ✅ **Votre application ne s'arrête jamais** pendant une reconstruction. Longhorn répare en arrière-plan.

---

## 5. Les snapshots en profondeur

### 5.1 — La mécanique des snapshots

Un snapshot Longhorn n'est **pas une copie complète** des données. C'est la "congélation" du Live Data actuel, qui devient une nouvelle couche immuable. Un nouveau Live Data vide est créé par-dessus.

```
AVANT le snapshot :
┌─────────────────────────────────────┐
│  Live Data  [A][B][ ][D][E][ ][G]  │  ← pod écrit ici
└──────────────────┬──────────────────┘
                   │ basé sur
┌──────────────────▼──────────────────┐
│  Snapshot 1  [a][b][c][ ][ ][f][ ] │  ← base
└─────────────────────────────────────┘

APRÈS "snapshot create" :
┌─────────────────────────────────────┐
│  Nouveau Live Data  [ ][ ][ ][ ]... │  ← nouveau vide, écritures ici
└──────────────────┬──────────────────┘
                   │ basé sur
┌──────────────────▼──────────────────┐
│  Snapshot 2 (= ancien Live Data)    │  ← gelé, immuable
│  [A][B][ ][D][E][ ][G]             │
└──────────────────┬──────────────────┘
                   │ basé sur
┌──────────────────▼──────────────────┐
│  Snapshot 1  [a][b][c][ ][ ][f][ ] │
└─────────────────────────────────────┘
```

### 5.2 — Supprimer un snapshot : la règle de conflation

Quand vous supprimez un snapshot, Longhorn **fusionne (conflate)** son contenu avec le snapshot suivant plus récent pour préserver la cohérence de la chaîne.

```
AVANT suppression de Snapshot 2 :
  Snapshot 3 (le plus récent)
       │
  Snapshot 2  ← à supprimer
       │
  Snapshot 1

APRÈS suppression de Snapshot 2 :
  Snapshot 3  ← absorbe le contenu de Snapshot 2
       │
  Snapshot 1
```

> ⚠️ **Règle importante** : On ne peut pas supprimer le snapshot le plus récent directement, car il faudrait le fusionner avec le Live Data en cours d'utilisation. Longhorn le marque "à supprimer" et le nettoie lors du prochain snapshot.

### 5.3 — Crash Consistency

Longhorn garantit la **cohérence après crash** (crash-consistent). Cela signifie que si le système s'arrête brutalement, les données sur disque sont dans un état cohérent — aucun bloc "à moitié écrit".

```
PROBLÈME : le cache OS (page cache)
  Application → écrit des données → OS garde en RAM (cache) → disque
                                          ↑
                              Si crash ici : données en cache perdues

SOLUTION LONGHORN :
  Avant chaque snapshot → Longhorn exécute sync()
  sync() = force l'OS à vider son cache vers le disque
  → Le snapshot capture l'état réel du disque

⚠️  Attention : crash-consistent ≠ application-consistent
    Pour une base de données, il faut aussi vider les buffers
    applicatifs (pg_dump, FLUSH TABLES...) avant le snapshot
    pour garantir des données 100% cohérentes au niveau applicatif.
```

---

## 6. Les backups et le stockage secondaire

### 6.1 — Snapshot vs Backup : la différence fondamentale

| | **Snapshot** | **Backup** |
|---|---|---|
| **Stockage** | Local dans le cluster | Distant (S3, NFS, externe) |
| **Format** | Chaîne de couches différentielles | Fichiers plats de 2 Mo |
| **Historique** | Conserve toutes les couches | Aplati (flattened), perd l'historique intermédiaire |
| **Restauration** | Rapide (données locales) | Plus lent (transfert réseau) |
| **Survie cluster** | Non (si cluster perdu → snapshots perdus) | Oui (données externes) |
| **Usage principal** | Point de retour rapide | Disaster recovery |

> 💡 **Analogie** : Le snapshot = Ctrl+Z dans un traitement de texte (rapide, local). Le backup = envoyer le document par email (plus lent, mais survit si l'ordinateur brûle).

### 6.2 — Comment un backup est créé : l'aplatissement en blocs de 2 Mo

Longhorn "aplatit" la chaîne de snapshots en blocs uniformes de 2 Mo pour le stockage distant.

```
STOCKAGE PRIMAIRE (cluster)              STOCKAGE SECONDAIRE (S3/NFS)
────────────────────────────────────     ─────────────────────────────────

Réplica d'un volume :                    Backup résultant :
                                         ┌──────────────────────────────┐
┌──────────────────────┐                 │  block-0001.blk (2Mo, .gz)   │
│  Snapshot 3 (récent) │  ──aplati──▶    │  block-0002.blk (2Mo, .gz)   │
└──────────┬───────────┘                 │  block-0003.blk (2Mo, .gz)   │
           │                             │  ...                         │
┌──────────▼───────────┐                 │  snap3.cfg (métadonnées :    │
│  Snapshot 2          │                 │   offsets + checksums)       │
└──────────┬───────────┘                 └──────────────────────────────┘
           │
┌──────────▼───────────┐
│  Snapshot 1 (base)   │
└──────────────────────┘

Incrémental : seuls les blocs de 2 Mo ayant changé sont retransmis.
Si aucun changement → le backup fait 0 octets sur le réseau
(mais la restauration fournit les données complètes depuis les blocs
déjà présents dans le backupstore).
```

### 6.3 — Volumes de Disaster Recovery (DR)

```
CLUSTER PRINCIPAL (région A)         CLUSTER DE SECOURS (région B)
────────────────────────────         ──────────────────────────────────
Volume A (production)                Volume DR-A
      │                                    │
      │  backup toutes les heures          │  Longhorn surveille
      ▼                                    ▼  les nouveaux backups
   Backupstore S3 ──────────────────▶  et restaure incrémentalement
   (externe)                               │
                                           │  En cas de sinistre :
                                           ▼
                                      Activer le Volume DR-A
                                      → devient un volume normal
                                      → RTO : quelques minutes
```

**RPO et RTO expliqués :**
- **RPO** (Recovery Point Objective) : combien de données peut-on perdre ? Défini par la fréquence des backups.
- **RTO** (Recovery Time Objective) : combien de temps pour reprendre le service ? Défini par l'intervalle de polling du backupstore.

Exemple : si les backups se font toutes les heures et qu'un backup prend 5 minutes à restaurer, et que le polling est toutes les 30 minutes → RTO = 5 min, RPO = 1h.

---

## 7. Le stockage persistant Kubernetes — rappel fondamental

### 7.1 — Les 4 objets fondamentaux

```
┌─────────────────────────────────────────────────────────────────────┐
│  ÉCOSYSTÈME DU STOCKAGE KUBERNETES                                  │
│                                                                     │
│  StorageClass (SC)                                                  │
│  "La recette de fabrication"                                        │
│  Définit COMMENT créer du stockage (quel provisioner,               │
│  combien de replicas, quel filesystem...).                          │
│  Exemple : StorageClass "longhorn" → driver.longhorn.io, 3 replicas │
│                  │                                                  │
│                  │ est utilisée par                                 │
│                  ▼                                                  │
│  PersistentVolumeClaim (PVC)                                        │
│  "La commande passée par une application"                           │
│  "Je veux 10 Go de stockage de type longhorn, mode ReadWriteOnce"   │
│                  │                                                  │
│                  │ est lié à (Bound)                                │
│                  ▼                                                  │
│  PersistentVolume (PV)                                              │
│  "Le stockage physique réel alloué"                                 │
│  Créé automatiquement par Longhorn en réponse au PVC               │
│                  │                                                  │
│                  │ est monté dans                                   │
│                  ▼                                                  │
│  Pod                                                                │
│  L'application monte le PVC et peut lire/écrire dans /data         │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.2 — La StorageClass Longhorn par défaut

À l'installation, Longhorn crée automatiquement cette StorageClass :

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: longhorn
provisioner: driver.longhorn.io    # C'est Longhorn qui crée les PV
allowVolumeExpansion: true         # Expansion à chaud autorisée
reclaimPolicy: Delete              # PV supprimé quand le PVC est supprimé
volumeBindingMode: Immediate       # PV créé immédiatement à la demande
parameters:
  numberOfReplicas: "3"            # 3 copies des données sur 3 nœuds
  staleReplicaTimeout: "30"        # Minutes avant replica considérée obsolète
  fsType: "ext4"                   # Système de fichiers du volume
```

### 7.3 — Deployment vs StatefulSet avec le stockage

```
DEPLOYMENT                              STATEFULSET
────────────────────────────────────    ─────────────────────────────────────
Pods identiques et interchangeables     Pods avec identité stable
                                        (postgres-0, postgres-1...)

⚠️  Plusieurs pods d'un Deployment      ✅ Chaque pod a son propre PVC
    NE PEUVENT PAS partager un          (via volumeClaimTemplates)
    volume RWO (ReadWriteOnce)          Parfait pour BDD, Kafka, Redis...

→ Si partage nécessaire : RWX           → Utiliser RWO (Longhorn standard)
  (Share Manager / NFS Longhorn)
```

---

# PARTIE II — Installer Longhorn sur Talos Linux

---

## 8. Architecture de notre environnement de test

```
Cluster Talos Linux v1.12.1
│
├── Master Node(s)             ← NE PAS déployer Longhorn ici
│                                (réservés au plan de contrôle K8s)
├── Worker 1                   ← Nœuds applicatifs classiques
├── Worker 2                   ← (pas de label Longhorn)
├── Worker 3                   ← (pas de label Longhorn)
│
└── Worker 4 (IP: .90)         ← 🎯 CIBLE : Longhorn de test
         │
         ├── Label: longhorn-test="true"
         ├── Chemin de données: /var/lib/longhorn/
         └── Héberge : Manager + Engine + Replicas
```

> 💡 **Stratégie progressive** : Déployer d'abord sur un seul nœud permet de valider l'installation sans impacter les workloads existants. Les labels peuvent ensuite être étendus à plusieurs workers.

---

## 9. Prérequis et préparation

```bash
# 1. Vérifier que kubectl pointe vers le bon cluster
kubectl cluster-info
# ✅ Attendu : Kubernetes control plane is running at https://...

# 2. Lister les nœuds et confirmer l'environnement Talos
kubectl get nodes -o wide
# ✅ Attendu : liste des nœuds avec STATUS = Ready

# 3. Vérifier Helm v3 est installé
helm version --short
# ✅ Attendu : v3.xx.x+...

# 4. Ajouter le dépôt Helm Longhorn
helm repo add longhorn https://charts.longhorn.io
helm repo update

# 5. Confirmer que Longhorn 1.9.0 est disponible
helm search repo longhorn --versions | grep "1.9.0"
# ✅ Attendu : longhorn/longhorn   1.9.0   ...
```

---

## 10. Étape 1 — Préparer le nœud cible (labels)

### Pourquoi les labels sont critiques pour Longhorn

Les **Labels Kubernetes** sont des paires clé=valeur attachées aux ressources. Le `nodeSelector` dans la configuration Longhorn utilise ces labels pour décider sur quels nœuds déployer ses pods.

```
SANS label :  Longhorn Manager se déploie sur TOUS les nœuds
              → Masters inclus (dangereux)
              → Consommation de ressources non contrôlée

AVEC label :  Longhorn Manager uniquement sur Worker 4
              → Isolation parfaite, contrôle total du placement
```

### Le problème : collision booléen vs string

Kubernetes stocke les labels comme des `string`. Si un label a été défini avec une valeur booléenne `true` (sans guillemets) par un autre outil, un `nodeSelector` cherchant `"true"` (string) peut ne pas le reconnaître. La solution : supprimer et recréer proprement.

```bash
# ────────────────────────────────────────────────────────────────
# ÉTAPE 1a : Supprimer l'ancien label (le "-" à la fin = suppression)
# ────────────────────────────────────────────────────────────────
kubectl label node talos-worker4 longhorn-test-
# Résultat attendu : node/talos-worker4 labeled
# (ou "label not found" si inexistant : c'est OK)

# ────────────────────────────────────────────────────────────────
# ÉTAPE 1b : Appliquer le label avec valeur STRING explicite
# Les guillemets doubles forcent le type string
# ────────────────────────────────────────────────────────────────
kubectl label node talos-worker4 longhorn-test="true"
# Résultat attendu : node/talos-worker4 labeled

# ────────────────────────────────────────────────────────────────
# VÉRIFICATION
# ────────────────────────────────────────────────────────────────
kubectl get node talos-worker4 --show-labels | grep longhorn
# ✅ Attendu : longhorn-test=true

# Version JSON pour vérifier le type exact stocké
kubectl get node talos-worker4 \
  -o jsonpath='{.metadata.labels.longhorn-test}'
# ✅ Attendu : true
```

---

## 11. Étape 2 — Créer le fichier de configuration Helm

Un chart Helm est une **recette paramétrable**. Le `values.yaml` contient les ingrédients que vous ajustez selon votre environnement.

```yaml
# ══════════════════════════════════════════════════════════════════
#  longhorn-values.yaml
#  Configuration Longhorn v1.9.0 pour Talos Linux
#  Objectif : déploiement isolé sur Worker 4 uniquement
# ══════════════════════════════════════════════════════════════════

# ──────────────────────────────────────────────────────────────────
#  SECTION 1 : Longhorn Manager
#
#  nodeSelector : limite le déploiement aux nœuds ayant ce label.
#  Sans cela → le DaemonSet se déploie sur TOUS les nœuds.
# ──────────────────────────────────────────────────────────────────
longhornManager:
  nodeSelector:
    longhorn-test: "true"

# ──────────────────────────────────────────────────────────────────
#  SECTION 2 : Longhorn Driver (composants CSI)
#
#  Le Driver installe : csi-attacher, csi-provisioner,
#  csi-resizer, csi-snapshotter. Doit être co-localisé
#  avec le Manager pour fonctionner correctement.
# ──────────────────────────────────────────────────────────────────
longhornDriver:
  nodeSelector:
    longhorn-test: "true"

# ──────────────────────────────────────────────────────────────────
#  SECTION 3 : Paramètres globaux
# ──────────────────────────────────────────────────────────────────
defaultSettings:

  # Chemin de stockage des données sur chaque nœud.
  #
  # Sur Talos Linux, l'OS est IMMUABLE (racine en lecture seule).
  # Seuls quelques chemins sont montés RW et persistent au reboot :
  #   /var/lib  ← chemin recommandé pour Longhorn
  #   /etc      ← configuration système (ne pas utiliser)
  #
  # CHEMINS À ÉVITER sur Talos :
  #   /tmp      → effacé à chaque redémarrage
  #   /home     → non persistant
  #   /opt      → en lecture seule
  defaultDataPath: /var/lib/longhorn

  # Tolérations pour les Taints Kubernetes.
  # Si vos nœuds ont des Taints personnalisées qui repoussent
  # les pods, listez les Tolerations correspondantes ici.
  # Format : "clé=valeur:Effet"
  # Effets possibles : NoSchedule | PreferNoSchedule | NoExecute
  taintToleration: "key=value:NoSchedule"

# ──────────────────────────────────────────────────────────────────
#  SECTION 4 : StorageClass par défaut
#
#  defaultClass: true → Longhorn devient le stockage par défaut.
#  Tout PVC sans storageClassName explicite l'utilisera.
#
#  ⚠️  Vérifier avant d'activer :
#  kubectl get sc | grep "(default)"
#  → S'assurer que local-path n'est plus default (sinon conflit)
# ──────────────────────────────────────────────────────────────────
persistence:
  defaultClass: true
  defaultClassReplicaCount: 1  # 1 seul nœud Longhorn ici (test)
                                # En production avec 3+ nœuds : mettre 3
```

---

## 12. Étape 3 — Résoudre les conflits de release Helm

### Comment Helm stocke son état

Helm enregistre l'historique de chaque déploiement dans des **Secrets Kubernetes**. Si une installation précédente a échoué, ces Secrets en état "failed" bloquent toute nouvelle tentative.

```
namespace: longhorn-system
├── Secret: sh.helm.release.v1.longhorn.v1  (tentative 1 → failed)
├── Secret: sh.helm.release.v1.longhorn.v2  (tentative 2 → failed)
└── Secret: sh.helm.release.v1.longhorn.v3  (tentative 3 → failed)
                                              ↑
                   Helm refuse de créer .v4 car .v3 = "failed"
```

**Erreur rencontrée :**
```
Error: cannot reuse a name that is still in use
```

**Solution :**

```bash
# ÉTAPE 1 : Lister les Secrets Helm en état d'échec
kubectl get secret -n longhorn-system | grep "sh.helm.release"

# ÉTAPE 2 : Suppression en pipeline bash
# Explication du pipeline :
#   kubectl get secret ...   → liste tous les secrets
#   grep "sh.helm.release"   → filtre seulement les secrets Helm
#   awk '{print $1}'         → extrait la colonne "nom" (colonne 1)
#   xargs kubectl delete ...  → supprime chaque secret listé
kubectl get secret -n longhorn-system \
  | grep "sh.helm.release" \
  | awk '{print $1}' \
  | xargs kubectl delete secret -n longhorn-system

# VÉRIFICATION : plus aucun Secret Helm
kubectl get secret -n longhorn-system | grep "sh.helm.release"
# ✅ Attendu : (aucune ligne)
```

---

## 13. Étape 4 — Résoudre l'erreur managedFields

### La source du problème

Kubernetes utilise `metadata.managedFields` pour tracer qui "possède" chaque ressource. Lors d'une réinstallation, si des CRDs existent déjà avec un `managedFields` incompatible, Kubernetes refuse le conflit de propriété.

**Erreur rencontrée :**
```
Error: INSTALLATION FAILED: metadata.managedFields must be nil
```

**Solution : nettoyage complet et méthodique**

> ⚠️ **Ces commandes sont irréversibles.** Sauvegardez vos données importantes avant de continuer.

```bash
# ════════════════════════════════════════════════════════════════
#  NETTOYAGE EN 3 ÉTAPES (ordre important !)
# ════════════════════════════════════════════════════════════════

# ── ÉTAPE 1 : Supprimer le namespace et tout son contenu ────────
# --force           : pas d'attente de terminaison gracieuse
# --grace-period=0  : suppression immédiate
kubectl delete ns longhorn-system --force --grace-period=0

# Attendre la disparition complète
kubectl get ns longhorn-system
# ✅ Attendu : Error from server (NotFound)...

# Si le namespace reste bloqué en "Terminating" (finalizers) :
kubectl patch namespace longhorn-system \
  -p '{"spec":{"finalizers":[]}}' --type=merge


# ── ÉTAPE 2 : Supprimer les ressources cluster-scoped ───────────
# ClusterRole et ClusterRoleBinding sont HORS de tout namespace.
# Ils ne sont PAS supprimés avec le namespace.
# -l : sélecteur de label (ne touche que les ressources Longhorn)
kubectl delete clusterrole \
  -l app.kubernetes.io/name=longhorn

kubectl delete clusterrolebinding \
  -l app.kubernetes.io/name=longhorn

# Vérification
kubectl get clusterrole | grep longhorn
# ✅ Attendu : (aucune ligne)


# ── ÉTAPE 3 : Supprimer les CRDs Longhorn ───────────────────────
# Les CRDs (schémas de ressources personnalisées) sont aussi
# cluster-scoped et doivent être supprimées manuellement.
kubectl get crd -o name \
  | grep longhorn.io \
  | xargs kubectl delete

# Vérification finale
kubectl get crd | grep longhorn
# ✅ Attendu : (aucune ligne)
```

---

## 14. Étape 5 — Configurer la sécurité du namespace

### Comprendre Pod Security Admission (PSA)

Le PSA est le système de sécurité intégré de Kubernetes depuis v1.23. Il applique des contraintes aux pods selon 3 niveaux :

```
NIVEAU         CONTRAINTES                           USAGE TYPIQUE
────────────   ─────────────────────────────────     ─────────────────────
restricted     Pas de root, pas de hostPath,         Applications utilisateurs
               pas de capabilities spéciales         (votre app Flask, Node.js...)

baseline       Bloque les configs "dangereuses"       Workloads classiques sans
               connues mais plus permissif            besoins système

privileged     AUCUNE restriction.                   Composants système :
               Accès complet aux ressources OS        Longhorn, Cilium, CSI drivers,
                                                     agents de monitoring
```

**Pourquoi Longhorn exige le niveau privileged :**

Longhorn doit interagir directement avec l'OS du nœud pour :
- Accéder aux block devices (`/dev/sda`, `/dev/nvme...`)
- Effectuer des `mount`/`umount` au niveau système
- Gérer les sessions iSCSI (via `open-iscsi`)
- Accéder à `/proc` et `/sys` pour les informations système

**Erreur sans ce label :**
```
Error creating: pods "longhorn-manager-xxxxx" is forbidden:
violates PodSecurity "baseline:latest":
hostPath volumes (restricted paths used in volumes [longhorn-data])
```

**Solution :**

```bash
# Les 3 modes PSA :
#   enforce → BLOQUE les pods qui violent le niveau (le plus important)
#   audit   → ENREGISTRE les violations dans les logs
#   warn    → AFFICHE un warning kubectl côté client
# En mettant les 3 à "privileged" : couverture complète

kubectl label namespace longhorn-system \
  pod-security.kubernetes.io/enforce=privileged \
  pod-security.kubernetes.io/audit=privileged \
  pod-security.kubernetes.io/warn=privileged \
  --overwrite
# --overwrite : met à jour les labels s'ils existent déjà

# VÉRIFICATION
kubectl describe namespace longhorn-system | grep -A5 "Labels"
# ✅ Attendu : pod-security.kubernetes.io/enforce=privileged
```

> 🔐 **Bonne pratique** : `privileged` est normal pour les namespaces système (`longhorn-system`, `kube-system`, `cilium`...). Ne jamais appliquer à vos namespaces applicatifs.

---

## 15. Étape 6 — Installer Longhorn via Helm

```bash
# ════════════════════════════════════════════════════════════════
#  INSTALLATION LONGHORN
# ════════════════════════════════════════════════════════════════
helm upgrade --install longhorn longhorn/longhorn \
  --namespace longhorn-system \
  --create-namespace \
  --version 1.9.0 \
  -f longhorn-values.yaml

# Décryptage de chaque argument :
# ────────────────────────────────────────────────────────────────
# helm upgrade --install
#   "Met à jour si existant, installe sinon"
#   Plus robuste que "helm install" qui échoue si déjà installé.
#
# longhorn
#   Nom de la "release" (notre instance de déploiement).
#   Sert à identifier et gérer cette installation dans Helm.
#
# longhorn/longhorn
#   Référence au chart : <dépôt>/<nom-du-chart>
#
# --namespace longhorn-system
#   Namespace cible pour le déploiement.
#
# --create-namespace
#   Crée le namespace automatiquement s'il n'existe pas.
#
# --version 1.9.0
#   Épingle la version exacte. Recommandé pour la reproductibilité.
#   Sans ce paramètre → Helm installe la dernière version disponible.
#
# -f longhorn-values.yaml
#   Notre fichier de configuration. Écrase les valeurs par défaut.
# ────────────────────────────────────────────────────────────────

# Surveiller la création des pods (Ctrl+C pour quitter)
kubectl get pods -n longhorn-system -w

# Sortie attendue après ~2-3 minutes :
# NAME                                        READY  STATUS
# longhorn-manager-7tzxp                      1/1    Running
# longhorn-driver-deployer-6b9d4ff88c-xvb2j  1/1    Running
# csi-attacher-7598b96cd-dn8x5                1/1    Running
# csi-provisioner-5d7f7c5b8-g98p2             1/1    Running
# csi-resizer-6c5c5784d-x8cvk                 1/1    Running
# csi-snapshotter-5c9b98f9c-m2q9t             1/1    Running
# longhorn-csi-plugin-bqj2n                   3/3    Running
# longhorn-ui-86f977fff8-4bptz                1/1    Running

# Si un pod reste en "Pending" ou "CrashLoopBackOff" :
kubectl describe pod -n longhorn-system <nom-du-pod>
# → Lire la section "Events" en bas de la sortie
```

---

## 16. Étape 7 — Valider et tester l'installation

### Vérifier les nœuds de stockage

```bash
kubectl get nodes.longhorn.io -n longhorn-system

# Sortie attendue :
# NAME            READY  ALLOWSCHEDULING  SCHEDULABLE  AGE
# talos-worker4   True   True             True         5m
#                  │         │               │
#                  │         │               └── Volumes créables ici
#                  │         └── Scheduling autorisé
#                  └── Nœud sain et opérationnel
```

### Test complet avec un PVC

```yaml
# Fichier : test-longhorn.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: longhorn-test-pvc
  namespace: longhorn-system
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: longhorn
  resources:
    requests:
      storage: 1Gi
---
apiVersion: v1
kind: Pod
metadata:
  name: longhorn-test-pod
  namespace: longhorn-system
spec:
  nodeSelector:
    longhorn-test: "true"
  containers:
  - name: test
    image: busybox
    command: ["sleep", "3600"]
    volumeMounts:
    - name: data
      mountPath: /mnt/data
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: longhorn-test-pvc
```

```bash
kubectl apply -f test-longhorn.yaml

# Attendre que le PVC soit Bound
kubectl get pvc longhorn-test-pvc -n longhorn-system -w
# ✅ Attendu : STATUS = Bound

# Attendre que le pod soit Running
kubectl get pod longhorn-test-pod -n longhorn-system -w
# ✅ Attendu : STATUS = Running

# Test 1 : Écrire dans le volume
kubectl exec -n longhorn-system longhorn-test-pod \
  -- sh -c "echo 'Longhorn OK !' > /mnt/data/test.txt"

# Test 2 : Relire pour confirmer
kubectl exec -n longhorn-system longhorn-test-pod \
  -- cat /mnt/data/test.txt
# ✅ Attendu : Longhorn OK !

# Test 3 : Vérifier l'espace monté
kubectl exec -n longhorn-system longhorn-test-pod \
  -- df -h /mnt/data
# ✅ Attendu : 1.0G disponible

# Nettoyage
kubectl delete -f test-longhorn.yaml
```

---

# PARTIE III — Migrer depuis local-path

---

## 17. Comprendre les enjeux de la migration

### Pourquoi la migration est forcément manuelle

```
local-path                              Longhorn
───────────────────────────────────     ─────────────────────────────────────
Fichiers dans /opt/local-path/pvc-xxx   Blocs gérés par iSCSI
Format : système de fichiers du nœud    Format : volume bloc répliqué
Portable : NON (lié au nœud physique)  Portable : OUI (détachable/rattachable)
```

Aucun outil ne migre automatiquement entre ces deux systèmes fondamentalement différents. La migration doit être **manuelle et contrôlée** :

1. Sauvegarde des données (dump applicatif)
2. Création d'un nouveau PVC Longhorn
3. Arrêt contrôlé de l'application
4. Restauration des données dans le nouveau volume
5. Reconfiguration pour pointer vers le nouveau PVC
6. Validation et nettoyage de l'ancien PVC

### Identifier ce qui doit migrer

```bash
# Lister TOUS les PVCs avec leur StorageClass
kubectl get pvc --all-namespaces \
  -o custom-columns=\
'NAMESPACE:.metadata.namespace,NOM:.metadata.name,STORAGE:.spec.storageClassName,TAILLE:.spec.resources.requests.storage'

# Filtrer uniquement les PVCs sur local-path
kubectl get pvc --all-namespaces | grep local-path
```

---

## 18. Procédure de migration pas à pas

### Exemple : migration d'une base PostgreSQL

```bash
# ════════════════════════════════════════════════════════════════
#  SCÉNARIO : postgres dans namespace "production"
#  Ancien PVC : postgres-data (local-path, 20Gi)
#  Nouveau PVC : postgres-data-longhorn (longhorn, 20Gi)
# ════════════════════════════════════════════════════════════════


# ── PHASE 1 : SAUVEGARDE ────────────────────────────────────────

kubectl get pods -n production -l app=postgres
# Exemple : postgres-0   1/1   Running

kubectl exec -n production postgres-0 \
  -- pg_dumpall -U postgres > /tmp/backup-$(date +%Y%m%d).sql

# Vérifier que la sauvegarde n'est pas vide
ls -lh /tmp/backup-*.sql
# ✅ Doit afficher une taille non nulle


# ── PHASE 2 : CRÉER LE NOUVEAU PVC LONGHORN ────────────────────

cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-data-longhorn
  namespace: production
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: longhorn
  resources:
    requests:
      storage: 20Gi
EOF

kubectl get pvc postgres-data-longhorn -n production -w
# ✅ Attendu : STATUS = Bound


# ── PHASE 3 : ARRÊT CONTRÔLÉ ────────────────────────────────────

# Scale à 0 = arrêt propre, sans supprimer le StatefulSet
kubectl scale statefulset postgres --replicas=0 -n production

kubectl get pods -n production -l app=postgres -w
# ✅ Attendu : (aucun pod listé)


# ── PHASE 4 : MISE À JOUR DU STATEFULSET ───────────────────────

# Exporter le StatefulSet actuel
kubectl get statefulset postgres -n production -o yaml \
  > /tmp/postgres-sts.yaml

# Éditer le fichier : chercher "claimName: postgres-data"
# et remplacer par "claimName: postgres-data-longhorn"
# Puis supprimer l'ancien StatefulSet sans toucher aux PVCs
kubectl delete statefulset postgres -n production --cascade=orphan
# --cascade=orphan : supprime UNIQUEMENT le StatefulSet,
#                    PAS les pods en cours ni les PVCs

# Appliquer le StatefulSet mis à jour
kubectl apply -f /tmp/postgres-sts.yaml


# ── PHASE 5 : REDÉMARRER ET RESTAURER ──────────────────────────

kubectl scale statefulset postgres --replicas=1 -n production

kubectl get pods -n production -l app=postgres -w
# ✅ Attendu : STATUS = Running

# Vérifier que le bon PVC est monté
kubectl describe pod postgres-0 -n production | grep -A3 "Volumes"
# ✅ Attendu : ClaimName: postgres-data-longhorn

# Restaurer les données
cat /tmp/backup-*.sql \
  | kubectl exec -i -n production postgres-0 \
    -- psql -U postgres
# ✅ Attendu : messages CREATE DATABASE, CREATE TABLE, COPY...


# ── PHASE 6 : VALIDATION ────────────────────────────────────────

kubectl exec -n production postgres-0 \
  -- psql -U postgres -c "\l"
# ✅ Attendu : liste de vos bases de données restaurées

kubectl logs -n production postgres-0 --tail=20
# ✅ Attendu : aucune erreur

# Volume sain dans Longhorn
kubectl get volumes.longhorn.io -n longhorn-system | grep postgres
# ✅ Attendu : STATE = attached, ROBUSTNESS = healthy


# ── PHASE 7 : NETTOYAGE (après 24-48h de validation) ───────────
kubectl delete pvc postgres-data -n production
# ⚠️  IRRÉVERSIBLE. Attendre confirmation que tout fonctionne.
```

### Désactiver local-path comme StorageClass par défaut

```bash
# Voir l'état actuel
kubectl get storageclass
# Problème typique : deux "(default)" = comportement imprévisible

# Retirer "default" de local-path
kubectl patch storageclass local-path -p \
  '{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"false"}}}'

# Confirmer Longhorn comme default
kubectl patch storageclass longhorn -p \
  '{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'

# Vérification finale
kubectl get storageclass
# NAME         PROVISIONER              DEFAULT
# local-path   rancher.io/local-path             ← plus default
# longhorn     driver.longhorn.io       true     ← nouveau default ✅
```

---

## 19. Cheat Sheet — Commandes essentielles

```bash
# ══════════════════════════════════════════════════════════════
#  DIAGNOSTIC
# ══════════════════════════════════════════════════════════════

# État de tous les pods Longhorn
kubectl get pods -n longhorn-system

# Description du DaemonSet Manager (events, erreurs)
kubectl describe ds longhorn-manager -n longhorn-system

# Logs en direct du Manager
kubectl logs -f -n longhorn-system \
  $(kubectl get pod -n longhorn-system \
    -l app=longhorn-manager -o name | head -1)

# État des nœuds de stockage
kubectl get nodes.longhorn.io -n longhorn-system

# État de tous les volumes Longhorn
kubectl get volumes.longhorn.io -n longhorn-system

# Réplicas d'un volume
kubectl get replicas.longhorn.io -n longhorn-system \
  -l longhornvolume=<nom-du-volume>


# ══════════════════════════════════════════════════════════════
#  MAINTENANCE
# ══════════════════════════════════════════════════════════════

# Redémarrer le Manager (résout beaucoup de problèmes)
kubectl rollout restart ds longhorn-manager -n longhorn-system

# Suivre le redémarrage
kubectl rollout status ds longhorn-manager -n longhorn-system

# Redémarrer le plugin CSI
kubectl rollout restart ds longhorn-csi-plugin -n longhorn-system


# ══════════════════════════════════════════════════════════════
#  INTERFACE WEB
# ══════════════════════════════════════════════════════════════

# Accès local : http://localhost:8080
kubectl port-forward -n longhorn-system svc/longhorn-frontend 8080:80


# ══════════════════════════════════════════════════════════════
#  VOLUMES ET PVC
# ══════════════════════════════════════════════════════════════

# Tous les PVCs (tous namespaces) avec leur StorageClass
kubectl get pvc --all-namespaces \
  -o custom-columns='NS:.metadata.namespace,NOM:.metadata.name,SC:.spec.storageClassName' \
  | sort -k3

# PVCs restant sur local-path à migrer
kubectl get pvc --all-namespaces | grep local-path

# Détails d'un PVC bloqué en Pending (lire les Events)
kubectl describe pvc <nom-pvc> -n <namespace>

# Tous les PersistentVolumes
kubectl get pv --sort-by=.spec.storageClassName


# ══════════════════════════════════════════════════════════════
#  STORAGECLASSES
# ══════════════════════════════════════════════════════════════

# Lister et voir laquelle est "(default)"
kubectl get storageclass

# Changer la StorageClass par défaut
kubectl patch storageclass <nom-sc> -p \
  '{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

---

## 20. Glossaire des termes clés

| Terme | Définition pédagogique |
|---|---|
| **Kubernetes** | Orchestrateur de conteneurs. Décide où et comment vos applications tournent dans un cluster de machines. |
| **Talos Linux** | OS Linux immuable et minimaliste conçu exclusivement pour Kubernetes. Pas de SSH, pas de gestionnaire de paquets : tout via une API. |
| **Helm** | Gestionnaire de paquets pour Kubernetes. Comme `apt` pour Ubuntu, mais pour les applications K8s. Un "package" s'appelle un "chart". |
| **DaemonSet** | Type de déploiement garantissant qu'UN pod tourne sur chaque nœud (ou sur les nœuds sélectionnés). |
| **CRD** | Custom Resource Definition. Étend Kubernetes avec de nouveaux types d'objets. Longhorn ajoute `Volume`, `Replica`, `Engine`... |
| **CSI** | Container Storage Interface. Standard universel permettant aux systèmes de stockage tiers de s'intégrer dans Kubernetes. |
| **PVC** | PersistentVolumeClaim. "Demande de stockage" : "je veux 10 Go de type longhorn". |
| **PV** | PersistentVolume. Le stockage physique réel alloué, en réponse à un PVC. |
| **StorageClass** | Définit un "type" de stockage (quel provisioner, combien de replicas, quel filesystem...). |
| **local-path** | Provisioner simple qui stocke dans un dossier du nœud. Rapide à déployer, sans aucune résilience. |
| **Longhorn Engine** | Contrôleur de données d'un volume. Un processus par volume, co-localisé avec le pod consommateur. |
| **Longhorn Manager** | Cerveau de Longhorn. Un pod par nœud (DaemonSet) qui gère le cycle de vie de tous les volumes. |
| **Replica** | Copie physique d'un volume sur un nœud. Avec 3 replicas, données sur 3 nœuds différents. |
| **Instance Manager** | Pod Longhorn gérant les processus Engine et Replica locaux sur chaque nœud. |
| **Snapshot** | Capture de l'état d'un volume à un instant T. Stocké localement. Retour arrière rapide. |
| **Backup** | Version aplatie d'un snapshot, exportée vers S3 ou NFS. Survit à la perte totale du cluster. |
| **Thin Provisioning** | Un volume ne réserve sur le disque que l'espace réellement utilisé, pas l'espace déclaré. |
| **Read Index** | Structure mémoire indiquant, pour chaque bloc de 4 Ko, dans quelle couche se trouve la donnée la plus récente. |
| **iSCSI** | Protocole de stockage réseau. Permet à un nœud d'accéder à un disque distant via TCP/IP. |
| **Crash Consistency** | Garantie qu'après un crash, les données disque sont dans un état cohérent (aucun bloc à moitié écrit). |
| **Label** | Paire clé=valeur attachée à une ressource Kubernetes pour la catégoriser et la cibler. |
| **nodeSelector** | Contrainte forçant l'exécution d'un pod sur des nœuds ayant certains labels. |
| **Taint / Toleration** | Taint = "répulsion" sur un nœud. Toleration = "immunité" d'un pod contre cette répulsion. |
| **Pod Security Admission** | Système Kubernetes contrôlant le niveau de privilèges des pods dans un namespace (restricted, baseline, privileged). |
| **StatefulSet** | Déploiement pour applications avec état (BDD, Kafka...). Chaque pod a une identité stable et son propre PVC. |
| **RWO / RWX** | ReadWriteOnce = un seul nœud en RW. ReadWriteMany = plusieurs nœuds simultanément (via Share Manager). |
| **RPO** | Recovery Point Objective : durée maximale de perte de données acceptable. Défini par la fréquence des backups. |
| **RTO** | Recovery Time Objective : durée maximale pour rétablir le service après un sinistre. |
| **Conflation** | Fusion de deux snapshots adjacents lors de la suppression d'un snapshot intermédiaire. |

---

> ✍️ **Document basé sur Longhorn 1.9.0 — Talos Linux v1.12.1**
> Source de référence officielle : [https://longhorn.io/docs/1.9.0/concepts/](https://longhorn.io/docs/1.9.0/concepts/)
>
> 💬 Ce guide évolue avec vos retours. Chaque erreur rencontrée et résolue mérite d'être ajoutée pour la communauté suivante.
