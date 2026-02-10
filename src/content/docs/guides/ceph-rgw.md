---
title: "CEPH - RADOS GATEWAY"
description: "Déploiement de Ceph RADOS Gateway (S3) sur Proxmox VE 9"
created: "2026-02-07"
updated: "2026-02-08"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"

---

# 📘 Guide Complet : Déploiement de Ceph RADOS Gateway (S3) sur Proxmox VE 9

## 🎯 Objectif du Guide

>Ce guide vous accompagne pas à pas dans la mise en place d'un **stockage objet compatible S3** basé sur Ceph RADOS Gateway (RGW) sur Proxmox VE 9. Cette solution permet à vos applications (Kubernetes, conteneurs, scripts) d'utiliser le protocole S3 pour stocker et récupérer des données.

:::note
**Configuration cible :**
- **Nœud :** `pve`
- **Adresse IP :** `192.168.**.**/24`
- **Réseau :** Bridge
- **Architecture :** Mono-nœud (optimisé pour un seul serveur Proxmox)
:::
---

## 📚 Table des Matières

1. [Comprendre Ceph : Les Fondamentaux](#1-comprendre-ceph--les-fondamentaux)
2. [Comprendre le RADOS Gateway](#2-comprendre-le-rados-gateway)
3. [Prérequis et Vérifications](#3-prérequis-et-vérifications)
4. [Configuration du Cluster Mono-Nœud](#4-configuration-du-cluster-mono-nœud)
5. [Installation du RADOS Gateway](#5-installation-du-rados-gateway)
6. [Configuration et Démarrage du Service](#6-configuration-et-démarrage-du-service)
7. [Gestion des Pools et Applications](#7-gestion-des-pools-et-applications)
8. [Création d'Utilisateurs S3](#8-création-dutilisateurs-s3)
9. [Tests et Validation](#9-tests-et-validation)
10. [Configuration Avancée (SSL/TLS)](#10-configuration-avancée-ssltls)
11. [Dépannage et Maintenance](#11-dépannage-et-maintenance)

---

## 1. Comprendre Ceph : Les Fondamentaux

### 🐙 Qu'est-ce que Ceph ?
:::tip
**Ceph** est un système de stockage distribué open-source conçu pour offrir une **scalabilité** infinie, une **haute disponibilité** et des **performances** exceptionnelles. Créé en 2004 et maintenu par la communauté (Red Hat/IBM), Ceph est utilisé par des géants comme CERN, OVH, et DigitalOcean.
:::

```
┌─────────────────────────────────────────────────────────────────┐
│                         Ceph = 3 en 1                           │
├─────────────────────────────────────────────────────────────────┤
│  📦 Stockage Objet (S3/Swift)  │  🗂️  Stockage Bloc (RBD)      │
│  🎯 Applications web           │  🎯 Machines virtuelles        │
│  🎯 Backup/Archive             │  🎯 Bases de données           │
├────────────────────────────────┴────────────────────────────────┤
│  📁 Stockage Fichier (CephFS)                                   │
│  🎯 NAS distribué, partages réseau                              │
└─────────────────────────────────────────────────────────────────┘
                            ⬇️
              ⚙️  RADOS (Reliable Autonomic Distributed Object Store)
                    Le cœur intelligent de Ceph
```

### 🧩 Les Composants de Ceph Expliqués

Ceph fonctionne comme un **orchestre** où chaque composant joue un rôle précis :

#### 1️⃣ **Monitor (MON)** - Le Chef d'Orchestre

```
Rôle : Surveiller l'état du cluster et maintenir la carte du cluster
Port : 6789
Nombre recommandé : 3 ou 5 (toujours impair pour le quorum)
```

**Analogie :** Comme un contrôleur aérien qui surveille tous les avions (OSDs) et maintient la carte du trafic.

**Ce qu'il fait :**
- 📊 Maintient la "Cluster Map" (carte de tous les composants)
- 🔍 Surveille la santé des OSDs, Managers, et autres services
- ✅ Établit le **quorum** (consensus) entre les monitors
- 🚨 Détecte les pannes et déclenche les reconfigurations

**Sur Proxmox :**
```bash
# Vérifier le monitor
systemctl status ceph-mon@pve-douk
# Voir les logs
journalctl -u ceph-mon@pve-douk -f
```

---

#### 2️⃣ **Manager (MGR)** - Le Tableau de Bord

```
Rôle : Gestion, monitoring, et interface utilisateur
Port : 8443 (Dashboard web)
Nombre recommandé : 2 (1 actif, 1 standby)
```

**Analogie :** Comme le tableau de bord d'une voiture qui affiche vitesse, température, et consommation.

**Ce qu'il fait :**
- 📈 Collecte les statistiques et métriques du cluster
- 🌐 Fournit le **Ceph Dashboard** (interface web graphique)
- 🔌 Active les modules (Prometheus, Grafana, RESTful API)
- ⚡ Optimise les performances (balancer, placement groups)

**Sur Proxmox :**
```bash
# Vérifier le manager
systemctl status ceph-mgr@pve-douk
# Accéder au dashboard (si activé)
# https://192.168.1.50:8443
```

---

#### 3️⃣ **OSD (Object Storage Daemon)** - Les Disques Intelligents

```
Rôle : Stocker les données réelles sur les disques physiques
Port : 6800-7300 (un port par OSD)
Nombre : Minimum 3, recommandé 10+ pour production
```

**Analogie :** Comme des bibliothécaires qui rangent, protègent et récupèrent les livres (données).

**Ce qu'il fait :**
- 💾 **Stocke les objets** sur les disques physiques (SSD/HDD)
- 🔄 **Réplique les données** vers d'autres OSDs (par défaut 3 copies)
- 🔍 **Vérifie l'intégrité** des données (scrubbing, checksums)
- ⚖️ **Auto-équilibre** les données entre les disques
- 🛡️ **Auto-répare** les données corrompues ou manquantes

**Architecture d'un OSD :**
```
OSD 0 (Disque /dev/sdb)
├── BlueStore (backend de stockage moderne)
│   ├── Métadonnées → RocksDB (base de données)
│   └── Données → Direct sur disque brut
├── PG (Placement Groups) → Groupes logiques d'objets
└── Réplication → Copie vers OSD 1 et OSD 2
```

**Sur Proxmox :**
```bash
# Lister les OSDs
ceph osd tree
# Vérifier un OSD spécifique
systemctl status ceph-osd@0
# Statistiques des OSDs
ceph osd df
```

---

#### 4️⃣ **MDS (Metadata Server)** - Pour CephFS (Optionnel)

```
Rôle : Gérer les métadonnées pour le système de fichiers CephFS
Utilisé uniquement si : Vous utilisez CephFS (partage de fichiers)
```

**Ce composant n'est PAS nécessaire pour le RADOS Gateway (S3).**

---

### 🔄 Comment Ceph Stocke les Données : RADOS

**RADOS** (Reliable Autonomic Distributed Object Store) est le **cœur de Ceph**. C'est un système intelligent qui gère automatiquement la distribution et la protection des données.

#### 📊 Le Voyage d'une Donnée dans Ceph

```
1️⃣ CLIENT ÉCRIT UN FICHIER
   │
   │  "backup.tar.gz" (100 MB)
   ▼
2️⃣ FRAGMENTATION EN OBJETS
   │
   │  Découpé en objets de 4 MB
   │  ├── backup.tar.gz.0 (4 MB)
   │  ├── backup.tar.gz.1 (4 MB)
   │  ├── ...
   │  └── backup.tar.gz.24 (4 MB)
   ▼
3️⃣ HACHAGE AVEC CRUSH ALGORITHM
   │
   │  Chaque objet → Hash → Numéro de PG (Placement Group)
   │  backup.tar.gz.0 → Hash → PG 2.3f
   ▼
4️⃣ PLACEMENT DANS LES OSDs
   │
   │  CRUSH calcule : PG 2.3f → [OSD 0, OSD 3, OSD 7]
   │  ├── Copie primaire → OSD 0 (SSD)
   │  ├── Réplica 1 → OSD 3 (HDD)
   │  └── Réplica 2 → OSD 7 (HDD)
   ▼
5️⃣ ÉCRITURE DISTRIBUÉE
   │
   │  Les 3 OSDs écrivent en parallèle
   │  Confirmation quand 2/3 confirment (min_size)
   ▼
6️⃣ ACK AU CLIENT
   
   ✅ "backup.tar.gz écrit avec succès"
```

#### 🎯 CRUSH Algorithm : Le GPS de Ceph

**CRUSH** (Controlled Replication Under Scalable Hashing) est l'algorithme qui décide **où** stocker chaque objet.

**Avantages de CRUSH :**
- 🚀 **Décentralisé** : Chaque client calcule lui-même la position des données
- 📍 **Déterministe** : Le même objet sera toujours au même endroit
- ⚖️ **Équilibré** : Distribution uniforme des données
- 🛡️ **Intelligent** : Respecte les règles de placement (rack, datacenter, etc.)

**Exemple concret :**
```bash
# Afficher la règle CRUSH pour un pool
ceph osd pool get rbd crush_rule

# Visualiser l'arbre CRUSH (hiérarchie des OSDs)
ceph osd tree
```

**Sortie typique :**
```
ID  CLASS  WEIGHT   TYPE NAME          STATUS  REWEIGHT  PRI-AFF
-1         2.72760  root default
-3         2.72760      host pve-douk
 0   ssd   0.90920          osd.0          up   1.00000  1.00000
 1   hdd   0.90920          osd.1          up   1.00000  1.00000
 2   hdd   0.90920          osd.2          up   1.00000  1.00000
```

---

### 🏊 Les Pools : Organiser les Données

Un **pool** est un conteneur logique qui regroupe des objets avec les mêmes règles de réplication et de placement.

**Analogie :** Comme des piscines dans un complexe aquatique :
- 🏊 Pool "rbd" : Pour les disques des VMs (nécessite haute performance)
- 🏊 Pool "backups" : Pour les sauvegardes (peut être plus lent)
- 🏊 Pool "rgw.buckets.data" : Pour les fichiers S3 (volume élevé)

#### 📋 Paramètres Importants d'un Pool

| Paramètre | Description | Exemple |
|-----------|-------------|---------|
| **size** | Nombre de copies de chaque objet | `3` (3 copies) |
| **min_size** | Minimum de copies pour autoriser I/O | `2` (2 copies OK) |
| **pg_num** | Nombre de Placement Groups | `128` (selon formule) |
| **crush_rule** | Règle de placement des objets | `replicated_rule` |
| **application** | Type d'application utilisant le pool | `rgw`, `rbd`, `cephfs` |

**Commandes utiles :**
```bash
# Lister les pools
ceph osd pool ls

# Détails d'un pool
ceph osd pool get rbd all

# Modifier la taille d'un pool
ceph osd pool set rbd size 2

# Créer un nouveau pool
ceph osd pool create mon-pool 128 128
```

---

### 🔢 Placement Groups (PG) : Les Groupes Logiques

Les **PG** sont des groupes intermédiaires entre les objets et les OSDs. Ils permettent de gérer efficacement des milliards d'objets.

```
Millions d'Objets
       ⬇️
PG 2.0, PG 2.1, PG 2.2... (Centaines de PGs)
       ⬇️
OSD 0, OSD 1, OSD 2... (Dizaines d'OSDs)
       ⬇️
Disques Physiques
```

**Pourquoi les PG ?**
- 📦 **Scalabilité** : Impossible de mapper 1 milliard d'objets directement vers 100 OSDs
- ⚡ **Performance** : Les opérations de réplication/rééquilibrage se font par PG
- 🧮 **Calcul simplifié** : Hash d'objet → PG → OSDs

**Formule de calcul des PG :**
```
PG_num = (OSDs * 100) / size

Exemple :
- 10 OSDs
- Size = 3 (3 réplicas)
→ PG_num = (10 * 100) / 3 = 333 ≈ 256 (puissance de 2)
```

**Vérifier les PG :**
```bash
# État des PG
ceph pg stat

# PG par pool
ceph osd pool get rbd pg_num

# Détails d'un PG spécifique
ceph pg 2.0 query
```

---

### 🛡️ Résilience et Auto-Guérison de Ceph

Ceph est conçu pour **ne jamais perdre de données**, même en cas de pannes multiples.

#### 🔄 Scénario de Panne et Récupération

**Situation initiale :**
```
Objet "photo.jpg" répliqué sur :
├── OSD 0 (SSD) ✅
├── OSD 3 (HDD) ✅
└── OSD 7 (HDD) ✅
```

**💥 PANNE : OSD 3 tombe en panne**

```
T+0s  : Monitor détecte l'absence de heartbeat de OSD 3
T+10s : OSD 3 marqué comme "down"
T+5m  : OSD 3 marqué comme "out" (si toujours down)

État actuel :
├── OSD 0 (SSD) ✅ Copie primaire
├── OSD 3 (HDD) ❌ PANNE
└── OSD 7 (HDD) ✅ Copie secondaire

⚠️ DÉGRADÉ : 2/3 copies disponibles (min_size=2 → I/O OK)
```

**🔧 AUTO-RÉPARATION : Ceph recrée la 3ème copie**

```
T+5m  : CRUSH recalcule → Nouvelle cible = OSD 5
T+6m  : Copie de OSD 0 → OSD 5 (rééquilibrage)
T+15m : Rééquilibrage terminé

État final :
├── OSD 0 (SSD) ✅ Copie primaire
├── OSD 5 (HDD) ✅ Nouvelle copie
└── OSD 7 (HDD) ✅ Copie existante

✅ HEALTH_OK : 3/3 copies restaurées
```

**Commandes de surveillance :**
```bash
# Surveiller le rééquilibrage en temps réel
watch ceph -s

# Voir les objets en cours de migration
ceph pg dump | grep active+remapped
```

---

### 📊 États de Santé de Ceph

Ceph communique constamment son état via le Monitor.

| État | Signification | Action |
|------|---------------|--------|
| **HEALTH_OK** | ✅ Tout fonctionne parfaitement | Aucune |
| **HEALTH_WARN** | ⚠️ Attention requise | Investiguer |
| **HEALTH_ERR** | 🚨 Problème critique | Intervention urgente |

**Exemples de HEALTH_WARN courants :**
```bash
# 1. Pas assez d'OSDs pour la réplication
HEALTH_WARN too few PGs per OSD

# 2. PG dégradés (copie manquante)
HEALTH_WARN 15/3000 objects degraded

# 3. Application non activée sur pool
HEALTH_WARN application not enabled on pool 'default.rgw.buckets.data'

# 4. Horloge désynchronisée
HEALTH_WARN clock skew detected
```

**Vérifier la santé :**
```bash
# Statut global
ceph -s

# Détails des problèmes
ceph health detail

# Historique
ceph health history
```

---

### 🎯 Pourquoi Ceph pour Proxmox ?

Proxmox VE intègre nativement Ceph pour offrir un **stockage hyperconvergé** (compute + storage sur les mêmes serveurs).

**Avantages spécifiques :**

| Avantage | Bénéfice pour Proxmox |
|----------|----------------------|
| 🚀 **Performance** | Les VMs accèdent directement aux OSDs (pas de NFS/iSCSI) |
| 🔄 **Live Migration** | Déplacement de VMs sans interruption |
| 📦 **Stockage unifié** | Disques VMs + Conteneurs + Backups + S3 |
| 💰 **Économique** | Pas besoin de SAN coûteux |
| 🛡️ **Résilient** | Survie aux pannes de disques et serveurs |
| ⚙️ **Intégration native** | Géré via l'interface Proxmox |

**Architecture Proxmox + Ceph :**
```
┌────────────────────────────────────────────────────────┐
│           Proxmox VE (Hyperviseur)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   VM Odoo    │  │  VM Nextcloud│  │  CT Postgres │ │
│  │   (RBD)      │  │    (RBD)     │  │    (RBD)     │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                 │          │
│         └─────────────────┴─────────────────┘          │
│                           │                            │
├───────────────────────────┼────────────────────────────┤
│                    Ceph Cluster                        │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────────┐ │
│  │ Monitor │  │ Manager │  │ OSD 0   │  │ RGW (S3) │ │
│  │ (MON)   │  │ (MGR)   │  │ OSD 1   │  │          │ │
│  │         │  │         │  │ OSD 2   │  │          │ │
│  └─────────┘  └─────────┘  └─────────┘  └──────────┘ │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
                  💾 Disques Physiques
```

---

### 🎓 Récapitulatif : Ceph en 5 Points Clés

1. **🐙 Ceph = Stockage Distribué Universel**
   - Objet (S3), Bloc (RBD), Fichier (CephFS)

2. **🧩 Architecture Modulaire**
   - Monitor (carte), Manager (dashboard), OSD (stockage)

3. **🎯 RADOS + CRUSH = Intelligence**
   - Distribution automatique et équilibrée des données

4. **🛡️ Résilience Native**
   - Auto-réparation, réplication, protection des données

5. **⚡ Scalabilité Linéaire**
   - Ajoutez des disques/serveurs → Performance augmente

---

## 2. Comprendre le RADOS Gateway

### 🔍 Qu'est-ce que le RADOS Gateway (RGW) ?

Le **RADOS Gateway** est une couche d'abstraction qui transforme votre cluster Ceph en un système de stockage objet compatible avec les API S3 (Amazon) et Swift (OpenStack).

```
┌─────────────────────────────────────────────────────────┐
│  Applications (Odoo, Kubernetes, aws-cli, s3cmd...)     │
└─────────────────────┬───────────────────────────────────┘
                      │ Requêtes HTTP/S3
                      ▼
┌─────────────────────────────────────────────────────────┐
│          RADOS Gateway (RGW) - Port 7480                │
│  Traduit S3 → RADOS  |  Gère authentification S3       │
└─────────────────────┬───────────────────────────────────┘
                      │ Commandes RADOS natives
                      ▼
┌─────────────────────────────────────────────────────────┐
│            Cluster Ceph (Monitors + OSDs)               │
│  Stocke les objets dans les pools (.rgw.*, default.*)  │
└─────────────────────────────────────────────────────────┘
```

### ✅ Avantages du RGW

- **Compatibilité universelle** : Fonctionne avec tous les outils S3 (aws-cli, s3cmd, boto3, minio-client...)
- **Abstraction** : Les applications n'ont pas besoin de comprendre Ceph
- **Scalabilité** : Peut gérer des milliards d'objets
- **Multi-tenant** : Isolation entre utilisateurs et buckets
- **RESTful API** : Interface HTTP standard

---

## 3. Prérequis et Vérifications

### 📋 Vérifier l'état du Cluster Ceph

Avant de commencer, assurez-vous que votre cluster Ceph est opérationnel :

```bash
# Vérifier le statut global
sudo ceph -s

# Vérifier les monitors
sudo ceph mon stat

# Vérifier les OSDs
sudo ceph osd stat

# Lister les pools existants
sudo ceph osd pool ls
```

**Sortie attendue pour `ceph -s` :**
```
  cluster:
    id:     xxxxx-xxxx-xxxx-xxxx-xxxxxxxxx
    health: HEALTH_OK (ou HEALTH_WARN acceptable)
 
  services:
    mon: 1 daemons
    mgr: pve-douk(active)
    osd: X osds: X up, X in
```

### 📦 Installation du Paquet RADOS Gateway

```bash
# Mettre à jour les dépôts
sudo apt update

# Installer le paquet radosgw
sudo apt install radosgw -y

# Vérifier l'installation
radosgw --version
```

**Sortie attendue :**
```
ceph version 18.2.x (quincy) ou supérieur
```

---

## 4. Configuration du Cluster Mono-Nœud

### ⚠️ Pourquoi cette étape est cruciale ?

Par défaut, Ceph est conçu pour fonctionner avec **3 réplicas** (3 copies de chaque donnée sur 3 serveurs différents). Sur un **serveur unique**, cette configuration est impossible et empêcherait le cluster de fonctionner correctement.

### 🔧 Étape A : Modifier la Configuration Globale

```bash
# Éditer le fichier de configuration Ceph
sudo nano /etc/pve/ceph.conf
```

**Ajouter ou modifier dans la section `[global]` :**

```ini
[global]
    # ... configuration existante ...
    
    # Configuration mono-nœud : 1 seule copie des données
    osd_pool_default_size = 1       # Nombre de copies par objet
    osd_pool_default_min_size = 1   # Minimum de copies pour I/O
    
    # Désactiver les avertissements de réplication
    mon_warn_on_pool_no_redundancy = false
```

**💡 Explication des paramètres :**
- `osd_pool_default_size = 1` : Crée 1 seule copie de chaque objet (au lieu de 3)
- `osd_pool_default_min_size = 1` : Autorise les lectures/écritures même avec 1 seule copie
- `mon_warn_on_pool_no_redundancy = false` : Supprime les alertes liées à l'absence de réplication

### 🔄 Étape B : Appliquer la Configuration

```bash
# Redémarrer les services de gestion Ceph
sudo systemctl restart ceph-mon@pve-douk
sudo systemctl restart ceph-mgr@pve-douk

# Attendre quelques secondes pour la stabilisation
sleep 5

# Vérifier que les services sont actifs
sudo systemctl status ceph-mon@pve-douk
sudo systemctl status ceph-mgr@pve-douk
```

### 🔄 Étape C : Appliquer aux Pools Existants

Si vous avez déjà des pools créés, il faut modifier leur taille :

```bash
# Lister tous les pools
sudo ceph osd pool ls

# Appliquer la configuration size=1 à tous les pools
for pool in $(sudo ceph osd pool ls); do
    echo "Configuration du pool: $pool"
    sudo ceph osd pool set "$pool" size 1
    sudo ceph osd pool set "$pool" min_size 1
done

# Vérifier l'application
sudo ceph osd pool ls detail
```

### ✅ Vérification Finale

```bash
# Le cluster doit être en HEALTH_OK ou HEALTH_WARN (acceptable)
sudo ceph -s

# Les pools doivent afficher size=1
sudo ceph osd pool get rbd size
```

---

## 5. Installation du RADOS Gateway

### 🔐 Étape A : Création du Keyring (Identité RGW)

Le keyring est un fichier contenant les clés cryptographiques qui permettent au RGW de s'authentifier auprès du cluster Ceph.

```bash
# Créer le keyring avec les permissions appropriées
sudo ceph auth get-or-create client.rgw.pve-douk \
  mon 'allow rw' \
  osd 'allow rwx' \
  mgr 'allow rw' \
  -o /etc/pve/priv/ceph.client.rgw.pve-douk.keyring

# Vérifier la création
cat /etc/pve/priv/ceph.client.rgw.pve-douk.keyring
```

**Sortie attendue :**
```
[client.rgw.pve-douk]
	key = AQDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx==
	caps mgr = "allow rw"
	caps mon = "allow rw"
	caps osd = "allow rwx"
```

### 👥 Étape B : Ajouter l'Utilisateur ceph au Groupe www-data

Les fichiers dans `/etc/pve/priv/` appartiennent automatiquement à `root:www-data`. Pour que le service RGW (qui s'exécute sous l'utilisateur `ceph`) puisse lire le keyring, il faut l'ajouter au groupe `www-data` :

```bash
# Ajouter ceph au groupe www-data
sudo usermod -a -G www-data ceph

# Vérifier l'ajout
groups ceph
# Sortie attendue : ceph : ceph www-data

# Vérifier les permissions du keyring
ls -la /etc/pve/priv/ceph.client.rgw.pve-douk.keyring
# Sortie attendue : -r-------- 1 root www-data ... ceph.client.rgw.pve-douk.keyring
```

**💡 Pourquoi cette étape ?**
- `/etc/pve/priv/` est un système de fichiers spécial (pmxcfs)
- On ne peut pas modifier directement les permissions avec `chown`
- La solution est d'ajouter l'utilisateur `ceph` au groupe qui a accès (`www-data`)

### 🔗 Étape C : Créer le Lien Systemd

Ce lien permet de gérer le service RGW avec les commandes `systemctl` standard :

```bash
# Créer le répertoire si nécessaire
sudo mkdir -p /etc/systemd/system/ceph-radosgw.target.wants

# Créer le lien symbolique
sudo ln -s /lib/systemd/system/ceph-radosgw@.service \
  /etc/systemd/system/ceph-radosgw.target.wants/ceph-radosgw@rgw.pve-douk.service

# Recharger la configuration systemd
sudo systemctl daemon-reload

# Vérifier le lien
ls -la /etc/systemd/system/ceph-radosgw.target.wants/
```

---

## 6. Configuration et Démarrage du Service

### ⚙️ Étape A : Configuration dans ceph.conf

```bash
# Éditer le fichier de configuration
sudo nano /etc/pve/ceph.conf
```

**Ajouter cette section à la fin du fichier :**

```ini
[client.rgw.pve-douk]
	host = pve-douk
	keyring = /etc/pve/priv/ceph.client.rgw.pve-douk.keyring
	log_file = /var/log/ceph/ceph-rgw-pve-douk.log
	rgw_frontends = beast endpoint=192.168.1.50:7480
	rgw_dns_name = pve-douk.local
	rgw_thread_pool_size = 512
```

**💡 Explication des paramètres :**

| Paramètre | Description | Valeur |
|-----------|-------------|--------|
| `host` | Nom d'hôte du serveur | `pve-douk` |
| `keyring` | Chemin du fichier d'authentification | `/etc/pve/priv/ceph.client.rgw.pve-douk.keyring` |
| `log_file` | Emplacement des logs RGW | `/var/log/ceph/ceph-rgw-pve-douk.log` |
| `rgw_frontends` | Configuration du serveur web (Beast) | `beast endpoint=192.168.1.50:7480` |
| `rgw_dns_name` | Nom DNS pour les buckets virtuels | `pve-douk.local` |
| `rgw_thread_pool_size` | Nombre de threads pour les requêtes | `512` (ajustable selon ressources) |

### 🚀 Étape B : Démarrer le Service

```bash
# Activer le service au démarrage
sudo systemctl enable ceph-radosgw@rgw.pve-douk

# Démarrer le service
sudo systemctl start ceph-radosgw@rgw.pve-douk

# Vérifier le statut (doit être "active (running)")
sudo systemctl status ceph-radosgw@rgw.pve-douk
```

**Sortie attendue :**
```
● ceph-radosgw@rgw.pve-douk.service - Ceph rados gateway
     Loaded: loaded (/lib/systemd/system/ceph-radosgw@.service; enabled)
     Active: active (running) since Fri 2026-02-07 14:30:00 CET
   Main PID: 12345 (radosgw)
      Tasks: 25
     Memory: 128.0M
        CPU: 2.5s
```

### 🔍 Étape C : Vérification du Démarrage

```bash
# Vérifier que le port 7480 écoute
sudo ss -tlnp | grep 7480
# Sortie attendue : LISTEN ... 192.168.1.50:7480 ... radosgw

# Vérifier les logs (ne doit pas contenir d'erreur)
sudo tail -50 /var/log/ceph/ceph-rgw-pve-douk.log

# Tester l'accès HTTP
curl http://192.168.1.50:7480
```

**Réponse HTTP attendue (XML) :**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<ListAllMyBucketsResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
    <Owner>
        <ID>anonymous</ID>
        <DisplayName/>
    </Owner>
    <Buckets/>
</ListAllMyBucketsResult>
```

✅ **Si vous voyez cette réponse XML, votre RADOS Gateway fonctionne !**

---

## 7. Gestion des Pools et Applications

### 📦 Comprendre les Pools RGW

Le RADOS Gateway crée automatiquement plusieurs pools pour organiser les données :

| Pool | Rôle | Taille typique |
|------|------|----------------|
| `.rgw.root` | Métadonnées racine du RGW | Petit (< 100 MB) |
| `default.rgw.control` | Contrôle et coordination | Très petit |
| `default.rgw.meta` | Métadonnées des buckets et users | Petit |
| `default.rgw.log` | Logs d'utilisation et d'accès | Moyen |
| `default.rgw.buckets.index` | Index des objets dans les buckets | Moyen |
| `default.rgw.buckets.data` | **Données réelles des objets** | **Le plus grand** |
| `default.rgw.users.uid` | Mapping UID → User | Très petit |
| `default.rgw.users.keys` | Clés d'accès S3 | Très petit |

### ✅ Étape A : Lister les Pools Créés

```bash
# Lister tous les pools
sudo ceph osd pool ls

# Afficher les détails (incluant l'application)
sudo ceph osd pool ls detail | grep rgw
```

### 🏷️ Étape B : Activer l'Application RGW sur les Pools

Pour que Ceph reconnaisse officiellement ces pools comme appartenant au RGW (et éviter les avertissements `HEALTH_WARN`), il faut activer l'application `rgw` :

```bash
# Méthode automatique : activer pour tous les pools RGW
for pool in $(sudo ceph osd pool ls | grep -E '\.rgw|rgw\.'); do
    echo "Activation de l'application RGW sur le pool: $pool"
    sudo ceph osd pool application enable "$pool" rgw 2>/dev/null || echo "  → Déjà activé"
done

# Vérifier l'activation
sudo ceph osd pool ls detail | grep -E "application rgw"
```

**Ou méthode manuelle (si vous préférez le contrôle) :**

```bash
# Pools principaux
sudo ceph osd pool application enable .rgw.root rgw
sudo ceph osd pool application enable default.rgw.control rgw
sudo ceph osd pool application enable default.rgw.meta rgw
sudo ceph osd pool application enable default.rgw.log rgw
sudo ceph osd pool application enable default.rgw.buckets.index rgw
sudo ceph osd pool application enable default.rgw.buckets.data rgw

# Pools utilisateurs
sudo ceph osd pool application enable default.rgw.users.uid rgw
sudo ceph osd pool application enable default.rgw.users.keys rgw
sudo ceph osd pool application enable default.rgw.users.email rgw

# Autres pools (si présents)
sudo ceph osd pool application enable default.rgw.gc rgw
sudo ceph osd pool application enable default.rgw.lc rgw
sudo ceph osd pool application enable default.rgw.data.root rgw
```

### 🔍 Vérification Finale

```bash
# Le cluster doit afficher HEALTH_OK
sudo ceph -s

# Tous les pools RGW doivent avoir l'application activée
sudo ceph osd pool application get default.rgw.buckets.data
# Sortie attendue : { "rgw": {} }
```

---

## 8. Création d'Utilisateurs S3

### 👤 Comprendre les Utilisateurs S3

Les utilisateurs S3 possèdent :
- **UID** : Identifiant unique (ex: `odoo-operator`, `backup-user`)
- **Display Name** : Nom lisible par un humain
- **Access Key** : Équivalent d'un nom d'utilisateur (public)
- **Secret Key** : Équivalent d'un mot de passe (privé)

### 🆕 Étape A : Créer un Utilisateur

```bash
# Créer un utilisateur pour Odoo (exemple)
sudo radosgw-admin user create \
  --uid="odoo-operator" \
  --display-name="Odoo Backup User" \
  --email="odoo@pve-douk.local"
```

**Sortie attendue (exemple) :**
```json
{
    "user_id": "odoo-operator",
    "display_name": "Odoo Backup User",
    "email": "odoo@pve-douk.local",
    "suspended": 0,
    "max_buckets": 1000,
    "subusers": [],
    "keys": [
        {
            "user": "odoo-operator",
            "access_key": "ABCDEF1234567890WXYZ",
            "secret_key": "AbCdEf1234567890WxYzAbCdEf1234567890WxYz"
        }
    ],
    "swift_keys": [],
    "caps": [],
    "op_mask": "read, write, delete",
    "system": "false",
    "admin": "false",
    "default_placement": "",
    "default_storage_class": "",
    "placement_tags": [],
    "bucket_quota": {
        "enabled": false,
        "check_on_raw": false,
        "max_size": -1,
        "max_size_kb": 0,
        "max_objects": -1
    },
    "user_quota": {
        "enabled": false,
        "check_on_raw": false,
        "max_size": -1,
        "max_size_kb": 0,
        "max_objects": -1
    },
    "temp_url_keys": [],
    "type": "rgw",
    "mfa_ids": []
}
```

⚠️ **IMPORTANT : Sauvegardez immédiatement l'Access Key et la Secret Key !**

```bash
# Sauvegarder les credentials dans un fichier sécurisé
sudo radosgw-admin user info --uid=odoo-operator > /root/odoo-operator-credentials.json
sudo chmod 600 /root/odoo-operator-credentials.json
```

### 📋 Étape B : Commandes de Gestion des Utilisateurs

```bash
# Lister tous les utilisateurs
sudo radosgw-admin user list

# Afficher les détails d'un utilisateur
sudo radosgw-admin user info --uid=odoo-operator

# Générer de nouvelles clés pour un utilisateur existant
sudo radosgw-admin key create --uid=odoo-operator --key-type=s3 --gen-access-key --gen-secret

# Créer un utilisateur avec des clés personnalisées
sudo radosgw-admin user create \
  --uid=custom-user \
  --display-name="Custom User" \
  --access-key="MY_CUSTOM_ACCESS_KEY" \
  --secret-key="MY_CUSTOM_SECRET_KEY"

# Modifier un utilisateur (exemple: changer le max_buckets)
sudo radosgw-admin user modify --uid=odoo-operator --max-buckets=100

# Suspendre un utilisateur (désactiver temporairement)
sudo radosgw-admin user suspend --uid=odoo-operator

# Réactiver un utilisateur
sudo radosgw-admin user enable --uid=odoo-operator

# Supprimer un utilisateur (et tous ses buckets)
sudo radosgw-admin user rm --uid=odoo-operator --purge-data
```

### 🔐 Étape C : Configuration des Quotas (Optionnel)

```bash
# Définir un quota de 100 GB pour un utilisateur
sudo radosgw-admin quota set --quota-scope=user --uid=odoo-operator --max-size=100G

# Activer le quota
sudo radosgw-admin quota enable --quota-scope=user --uid=odoo-operator

# Vérifier le quota
sudo radosgw-admin user stats --uid=odoo-operator
```

---

## 9. Tests et Validation

### 🧪 Étape A : Installation de s3cmd

```bash
# Installer s3cmd (client S3 en ligne de commande)
sudo apt install s3cmd -y

# Vérifier l'installation
s3cmd --version
```

### ⚙️ Étape B : Configuration de s3cmd

**Méthode 1 : Configuration interactive**

```bash
s3cmd --configure
```

**Paramètres à entrer :**
```
Access Key: [Votre Access Key]
Secret Key: [Votre Secret Key]
Default Region: [Laisser vide ou taper "default"]
S3 Endpoint: 192.168.1.50:7480
DNS-style bucket: %(bucket)s.192.168.1.50:7480
Encryption password: [Laisser vide]
Path to GPG program: [Laisser par défaut]
Use HTTPS protocol: No
HTTP Proxy: [Laisser vide]
Test access? Y
```

**Méthode 2 : Fichier de configuration direct**

```bash
# Créer le fichier de configuration
nano ~/.s3cfg
```

**Contenu du fichier :**
```ini
[default]
access_key = VOTRE_ACCESS_KEY
secret_key = VOTRE_SECRET_KEY
host_base = 192.168.1.50:7480
host_bucket = %(bucket)s.192.168.1.50:7480
use_https = False
check_ssl_certificate = False
check_ssl_hostname = False
```

### 🧪 Étape C : Tests Basiques avec s3cmd

```bash
# 1. Créer un bucket
s3cmd mb s3://test-bucket

# 2. Lister les buckets
s3cmd ls
# Sortie attendue : 2026-02-07 14:30  s3://test-bucket

# 3. Créer un fichier de test
echo "Hello from Ceph RADOS Gateway!" > test.txt

# 4. Uploader le fichier
s3cmd put test.txt s3://test-bucket/

# 5. Lister le contenu du bucket
s3cmd ls s3://test-bucket/
# Sortie attendue : 2026-02-07 14:31    32   s3://test-bucket/test.txt

# 6. Télécharger le fichier
s3cmd get s3://test-bucket/test.txt downloaded.txt

# 7. Vérifier le contenu
cat downloaded.txt
# Sortie attendue : Hello from Ceph RADOS Gateway!

# 8. Obtenir des informations sur le fichier
s3cmd info s3://test-bucket/test.txt

# 9. Supprimer le fichier
s3cmd del s3://test-bucket/test.txt

# 10. Supprimer le bucket (doit être vide)
s3cmd rb s3://test-bucket
```

### 🐳 Étape D : Test depuis Kubernetes (Si applicable)

#### 1️⃣ Créer un Bucket depuis Kubernetes

```bash
kubectl run s3-create-bucket \
  --image=amazon/aws-cli:2.15.33 \
  --restart=Never \
  --rm \
  -i \
  --env="AWS_ACCESS_KEY_ID=VOTRE_ACCESS_KEY" \
  --env="AWS_SECRET_ACCESS_KEY=VOTRE_SECRET_KEY" \
  --command -- aws s3 mb s3://odoo-backups --endpoint-url http://192.168.1.50:7480
```

**Sortie attendue :**
```
make_bucket: odoo-backups
pod "s3-create-bucket" deleted
```

---

#### 2️⃣ Uploader un Fichier de Test

Cette commande crée un fichier texte et l'envoie dans le bucket :

```bash
kubectl run s3-test-upload \
  --rm \
  -i \
  --tty \
  --image=amazon/aws-cli:2.15.33 \
  --env="AWS_ACCESS_KEY_ID=VOTRE_ACCESS_KEY" \
  --env="AWS_SECRET_ACCESS_KEY=VOTRE_SECRET_KEY" \
  --command -- sh -c "echo 'Hello from Kubernetes to Ceph S3!' > test-k8s.txt && aws s3 cp test-k8s.txt s3://odoo-backups/ --endpoint-url http://192.168.1.50:7480"
```

**Sortie attendue :**
```
upload: ./test-k8s.txt to s3://odoo-backups/test-k8s.txt
pod "s3-test-upload" deleted
```

---

#### 3️⃣ Lister les Objets dans le Bucket

```bash
kubectl run s3-list \
  --rm \
  -i \
  --tty \
  --image=amazon/aws-cli:2.15.33 \
  --env="AWS_ACCESS_KEY_ID=VOTRE_ACCESS_KEY" \
  --env="AWS_SECRET_ACCESS_KEY=VOTRE_SECRET_KEY" \
  --command -- aws s3 ls s3://odoo-backups/ --endpoint-url http://192.168.1.50:7480
```

**Sortie attendue :**
```
2026-02-07 14:35:21         34 test-k8s.txt
pod "s3-list" deleted
```

---

#### 4️⃣ Télécharger et Vérifier le Contenu

**Méthode A : Télécharger le fichier localement**

```bash
kubectl run s3-download \
  --rm \
  -i \
  --tty \
  --image=amazon/aws-cli:2.15.33 \
  --env="AWS_ACCESS_KEY_ID=VOTRE_ACCESS_KEY" \
  --env="AWS_SECRET_ACCESS_KEY=VOTRE_SECRET_KEY" \
  --command -- sh -c "aws s3 cp s3://odoo-backups/test-k8s.txt - --endpoint-url http://192.168.1.50:7480"
```

**Sortie attendue :**
```
Hello from Kubernetes to Ceph S3!
pod "s3-download" deleted
```

**Méthode B : Afficher le contenu directement**

```bash
kubectl run s3-cat \
  --rm \
  -i \
  --tty \
  --image=amazon/aws-cli:2.15.33 \
  --env="AWS_ACCESS_KEY_ID=VOTRE_ACCESS_KEY" \
  --env="AWS_SECRET_ACCESS_KEY=VOTRE_SECRET_KEY" \
  --command -- aws s3 cp s3://odoo-backups/test-k8s.txt - --endpoint-url http://192.168.1.50:7480
```

---

#### 5️⃣ Rendre un Fichier Public (ACL)

Par défaut, les fichiers uploadés dans S3 sont **privés**. Pour rendre un fichier accessible publiquement via une URL HTTP, il faut modifier son **ACL (Access Control List)**.

##### 🔍 Comprendre les ACL S3

| ACL | Description | Accès |
|-----|-------------|-------|
| `private` | Défaut - Seul le propriétaire peut lire | Authentification requise |
| `public-read` | Lecture publique autorisée | Accessible via URL HTTP |
| `public-read-write` | Lecture et écriture publiques | ⚠️ Dangereux - éviter |
| `authenticated-read` | Lecture pour utilisateurs authentifiés | Credentials S3 requis |

##### 📝 Commande pour Rendre Public

**Commande complète avec sécurité Kubernetes :**

```bash
kubectl run s3-make-public \
  --rm \
  -i \
  --image=amazon/aws-cli:2.15.33 \
  --overrides='{
    "spec": {
      "securityContext": {
        "runAsNonRoot": true,
        "runAsUser": 1000,
        "seccompProfile": { "type": "RuntimeDefault" }
      },
      "containers": [{
        "name": "s3-make-public",
        "image": "amazon/aws-cli:2.15.33",
        "env": [
          {"name": "AWS_ACCESS_KEY_ID", "value": "VOTRE_ACCESS_KEY"},
          {"name": "AWS_SECRET_ACCESS_KEY", "value": "VOTRE_SECRET_KEY"},
          {"name": "AWS_DEFAULT_REGION", "value": "us-east-1"}
        ],
        "command": ["aws", "s3api", "put-object-acl"],
        "args": [
          "--bucket", "odoo-backups",
          "--key", "test-k8s.txt",
          "--acl", "public-read",
          "--endpoint-url", "http://192.168.1.50:7480"
        ],
        "securityContext": {
          "allowPrivilegeEscalation": false,
          "capabilities": { "drop": ["ALL"] }
        }
      }]
    }
  }'
```

**💡 Explication des paramètres :**

| Paramètre | Valeur | Description |
|-----------|--------|-------------|
| `--bucket` | `odoo-backups` | Nom du bucket contenant le fichier |
| `--key` | `test-k8s.txt` | Nom du fichier (chemin dans le bucket) |
| `--acl` | `public-read` | Type d'ACL : lecture publique |
| `--endpoint-url` | `http://192.168.1.50:7480` | URL de votre RADOS Gateway |

**Paramètres de sécurité Kubernetes :**
- `runAsNonRoot: true` : Empêche l'exécution en tant que root
- `runAsUser: 1000` : Utilise l'UID 1000 (utilisateur non privilégié)
- `seccompProfile` : Active le profil de sécurité par défaut
- `allowPrivilegeEscalation: false` : Interdit l'élévation de privilèges
- `capabilities: drop: ALL` : Supprime toutes les capacités Linux

**Sortie attendue :**
```
pod "s3-make-public" deleted
```

##### ✅ Vérifier que le Fichier est Public

**Méthode 1 : Vérifier l'ACL**

```bash
kubectl run s3-check-acl \
  --rm \
  -i \
  --tty \
  --image=amazon/aws-cli:2.15.33 \
  --env="AWS_ACCESS_KEY_ID=VOTRE_ACCESS_KEY" \
  --env="AWS_SECRET_ACCESS_KEY=VOTRE_SECRET_KEY" \
  --command -- aws s3api get-object-acl \
    --bucket odoo-backups \
    --key test-k8s.txt \
    --endpoint-url http://192.168.1.50:7480
```

**Sortie attendue (JSON) :**
```json
{
    "Owner": {
        "DisplayName": "Odoo Backup User",
        "ID": "odoo-operator"
    },
    "Grants": [
        {
            "Grantee": {
                "Type": "Group",
                "URI": "http://acs.amazonaws.com/groups/global/AllUsers"
            },
            "Permission": "READ"
        }
    ]
}
```

**🔍 Interprétation :**
- `URI: AllUsers` → Le fichier est accessible à tous
- `Permission: READ` → Les utilisateurs peuvent lire (télécharger) le fichier

**Méthode 2 : Tester l'URL Publique**

L'URL publique suit le format : `http://IP_RGW:PORT/BUCKET/FICHIER`

```
http://192.168.1.50:7480/odoo-backups/test-k8s.txt
```

**Test avec curl depuis n'importe quelle machine :**

```bash
# Depuis Proxmox
curl http://192.168.1.50:7480/odoo-backups/test-k8s.txt

# Depuis un Pod Kubernetes
kubectl run curl-test \
  --rm \
  -i \
  --tty \
  --image=curlimages/curl:latest \
  --command -- curl http://192.168.1.50:7480/odoo-backups/test-k8s.txt
```

**Sortie attendue :**
```
Hello from Kubernetes to Ceph S3!
```

**Test dans un navigateur web :**

1. Ouvrez votre navigateur
2. Collez l'URL : `http://192.168.1.50:7480/odoo-backups/test-k8s.txt`
3. Le contenu du fichier doit s'afficher directement

**📸 Résultat visuel attendu dans le navigateur :**
```
Hello from Kubernetes to Ceph S3!
```

---

##### 🔐 Rendre un Fichier à Nouveau Privé

Si vous souhaitez révoquer l'accès public :

```bash
kubectl run s3-make-private \
  --rm \
  -i \
  --image=amazon/aws-cli:2.15.33 \
  --env="AWS_ACCESS_KEY_ID=VOTRE_ACCESS_KEY" \
  --env="AWS_SECRET_ACCESS_KEY=VOTRE_SECRET_KEY" \
  --command -- aws s3api put-object-acl \
    --bucket odoo-backups \
    --key test-k8s.txt \
    --acl private \
    --endpoint-url http://192.168.1.50:7480
```

**Vérification :**
```bash
curl http://192.168.1.50:7480/odoo-backups/test-k8s.txt
# Résultat : AccessDenied (403 Forbidden)
```

---

##### 📋 Récapitulatif des Commandes ACL

```bash
# 1. Rendre public (lecture seule)
aws s3api put-object-acl --bucket BUCKET --key FICHIER --acl public-read --endpoint-url http://192.168.1.50:7480

# 2. Rendre privé (défaut)
aws s3api put-object-acl --bucket BUCKET --key FICHIER --acl private --endpoint-url http://192.168.1.50:7480

# 3. Vérifier l'ACL actuel
aws s3api get-object-acl --bucket BUCKET --key FICHIER --endpoint-url http://192.168.1.50:7480

# 4. Rendre tout le bucket public (⚠️ Dangereux)
aws s3api put-bucket-acl --bucket BUCKET --acl public-read --endpoint-url http://192.168.1.50:7480
```

---

##### ⚠️ Bonnes Pratiques de Sécurité

| ✅ À Faire | ❌ À Éviter |
|-----------|------------|
| Rendre public uniquement les fichiers nécessaires | Rendre public tout le bucket |
| Utiliser des noms de fichiers non prévisibles | Utiliser `public-read-write` (écriture publique) |
| Mettre en place une politique de révocation | Exposer des fichiers sensibles |
| Utiliser HTTPS en production | Laisser les credentials dans l'historique bash |
| Documenter les fichiers publics | Oublier de révoquer les anciens fichiers |

**💡 Conseil professionnel :**

Pour les environnements de production, préférez :
1. **Pré-signed URLs** : URLs temporaires avec expiration
2. **Bucket Policies** : Règles d'accès plus fines
3. **CloudFront/CDN** : Distribution avec cache et HTTPS

**Exemple de pré-signed URL (validité 1 heure) :**

```bash
kubectl run s3-presign \
  --rm \
  -i \
  --tty \
  --image=amazon/aws-cli:2.15.33 \
  --env="AWS_ACCESS_KEY_ID=VOTRE_ACCESS_KEY" \
  --env="AWS_SECRET_ACCESS_KEY=VOTRE_SECRET_KEY" \
  --command -- aws s3 presign s3://odoo-backups/test-k8s.txt \
    --expires-in 3600 \
    --endpoint-url http://192.168.1.50:7480
```

**Sortie : URL signée valable 1 heure**
```
http://192.168.1.50:7480/odoo-backups/test-k8s.txt?AWSAccessKeyId=...&Signature=...&Expires=1675782000
```

Cette URL peut être partagée temporairement sans exposer vos credentials !

### ✅ Étape E : Vérification Finale de la Santé

```bash
# 1. État du cluster (doit être HEALTH_OK)
sudo ceph -s

# 2. Statistiques des pools RGW
sudo ceph df | grep rgw

# 3. Lister les buckets via radosgw-admin
sudo radosgw-admin bucket list

# 4. Statistiques d'utilisation d'un bucket
sudo radosgw-admin bucket stats --bucket=test-bucket

# 5. Usage global des utilisateurs
sudo radosgw-admin usage show

# 6. Vérifier les processus
ps aux | grep radosgw

# 7. Vérifier les connexions réseau
sudo netstat -tlnp | grep 7480
```

---

## 10. Configuration Avancée (SSL/TLS)

### 🔒 Pourquoi Activer SSL/TLS ?

- **Sécurité** : Chiffrement des données en transit
- **Authentification** : Vérification de l'identité du serveur
- **Conformité** : Requis pour certaines applications en production

### 📜 Étape A : Générer un Certificat Auto-signé

```bash
# Générer le certificat SSL (valable 1 an)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:4096 \
  -keyout /etc/pve/priv/rgw-pve-douk.key \
  -out /etc/pve/priv/rgw-pve-douk.crt \
  -subj "/C=FR/ST=IDF/L=Paris/O=Proxmox/CN=192.168.1.50"

# Vérifier les fichiers créés
ls -la /etc/pve/priv/rgw-pve-douk.*
```

**💡 Pour un certificat Let's Encrypt (production) :**

```bash
# Installer certbot
sudo apt install certbot -y

# Obtenir un certificat (nécessite un nom de domaine public)
sudo certbot certonly --standalone -d s3.votre-domaine.com

# Les certificats seront dans :
# /etc/letsencrypt/live/s3.votre-domaine.com/fullchain.pem
# /etc/letsencrypt/live/s3.votre-domaine.com/privkey.pem
```

### ⚙️ Étape B : Modifier la Configuration RGW

```bash
# Éditer ceph.conf
sudo nano /etc/pve/ceph.conf
```

**Modifier la section `[client.rgw.pve-douk]` :**

```ini
[client.rgw.pve-douk]
	host = pve-douk
	keyring = /etc/pve/priv/ceph.client.rgw.pve-douk.keyring
	log_file = /var/log/ceph/ceph-rgw-pve-douk.log
	rgw_frontends = beast endpoint=192.168.1.50:7480 ssl_endpoint=192.168.1.50:7481 ssl_certificate=/etc/pve/priv/rgw-pve-douk.crt ssl_private_key=/etc/pve/priv/rgw-pve-douk.key
	rgw_dns_name = pve-douk.local
	rgw_thread_pool_size = 512
```

**💡 Explication :**
- `endpoint=192.168.1.50:7480` : HTTP (non chiffré) - optionnel
- `ssl_endpoint=192.168.1.50:7481` : HTTPS (chiffré)
- `ssl_certificate` : Chemin du certificat
- `ssl_private_key` : Chemin de la clé privée

### 🔄 Étape C : Redémarrer le Service

```bash
# Redémarrer le RGW
sudo systemctl restart ceph-radosgw@rgw.pve-douk

# Vérifier le statut
sudo systemctl status ceph-radosgw@rgw.pve-douk

# Vérifier que les deux ports écoutent
sudo ss -tlnp | grep -E '7480|7481'
```

**Sortie attendue :**
```
LISTEN ... 192.168.1.50:7480 ... radosgw (HTTP)
LISTEN ... 192.168.1.50:7481 ... radosgw (HTTPS)
```

### 🔥 Étape D : Ouvrir le Pare-feu

```bash
# Via Proxmox Firewall (interface web)
# Datacenter > Firewall > Add
# Port: 7481, Protocol: TCP, Action: ACCEPT

# Ou via pvesh (CLI)
sudo pvesh create /cluster/firewall/rules \
  --action ACCEPT \
  --type in \
  --dport 7481 \
  --proto tcp \
  --comment "Ceph RADOS Gateway HTTPS"

# Ou via iptables
sudo iptables -I INPUT -p tcp --dport 7481 -j ACCEPT -m comment --comment "Ceph RGW HTTPS"
```

### 🧪 Étape E : Tester HTTPS

```bash
# Tester avec curl (ignorer le certificat auto-signé)
curl -k https://192.168.1.50:7481

# Ou vérifier le certificat
curl -v https://192.168.1.50:7481
```

### ⚙️ Étape F : Reconfigurer s3cmd pour HTTPS

```bash
# Modifier ~/.s3cfg
nano ~/.s3cfg
```

**Changer les paramètres :**
```ini
host_base = 192.168.1.50:7481
host_bucket = %(bucket)s.192.168.1.50:7481
use_https = True
check_ssl_certificate = False  # False pour certificat auto-signé
check_ssl_hostname = False
```

**Tester :**
```bash
s3cmd ls  # Doit fonctionner en HTTPS
```

---

## 11. Dépannage et Maintenance

### 🔍 Problème 1 : Le Service ne Démarre Pas

**Symptôme :**
```bash
sudo systemctl status ceph-radosgw@rgw.pve-douk
# Affiche : Failed to start
```

**Solutions :**

```bash
# 1. Vérifier les logs détaillés
sudo journalctl -u ceph-radosgw@rgw.pve-douk -n 100 --no-pager

# 2. Vérifier le keyring
ls -la /etc/pve/priv/ceph.client.rgw.pve-douk.keyring
# Doit exister et être lisible

# 3. Vérifier que ceph est dans le groupe www-data
groups ceph
# Doit afficher : ceph www-data

# Si non, ajouter :
sudo usermod -a -G www-data ceph

# 4. Vérifier la configuration
sudo ceph auth get client.rgw.pve-douk
# Doit afficher les capacités mon, osd, mgr

# 5. Vérifier le port (ne doit pas être utilisé)
sudo ss -tlnp | grep 7480

# 6. Redémarrer avec logs verbeux
sudo systemctl stop ceph-radosgw@rgw.pve-douk
sudo /usr/bin/radosgw -f --cluster ceph --name client.rgw.pve-douk --setuser ceph --setgroup ceph
# Observer les erreurs en direct (Ctrl+C pour arrêter)

# 7. Redémarrer normalement
sudo systemctl start ceph-radosgw@rgw.pve-douk
```

### 🔍 Problème 2 : Erreur "Unable to Find Keyring"

**Symptôme :**
```
auth: unable to find a keyring on /etc/pve/priv/ceph.client.rgw.pve-douk.keyring
```

**Solutions :**

```bash
# 1. Vérifier que le fichier existe
ls -la /etc/pve/priv/ceph.client.rgw.pve-douk.keyring

# Si absent, recréer :
sudo ceph auth get-or-create client.rgw.pve-douk \
  mon 'allow rw' \
  osd 'allow rwx' \
  mgr 'allow rw' \
  -o /etc/pve/priv/ceph.client.rgw.pve-douk.keyring

# 2. Vérifier les permissions
sudo usermod -a -G www-data ceph

# 3. Tester la lecture
sudo -u ceph cat /etc/pve/priv/ceph.client.rgw.pve-douk.keyring

# Si erreur "Permission denied", le groupe n'est pas correctement configuré
```

### 🔍 Problème 3 : HEALTH_WARN - Application Not Enabled

**Symptôme :**
```bash
sudo ceph -s
# Affiche : HEALTH_WARN application not enabled on X pool(s)
```

**Solution :**

```bash
# Activer l'application RGW sur tous les pools
for pool in $(sudo ceph osd pool ls | grep -E '\.rgw|rgw\.'); do
    sudo ceph osd pool application enable "$pool" rgw 2>/dev/null
done

# Vérifier
sudo ceph -s  # Doit afficher HEALTH_OK
```

### 🔍 Problème 4 : Impossible de se Connecter (Erreur S3)

**Symptôme :**
```bash
s3cmd ls
# Erreur : ERROR: S3 error: 403 (SignatureDoesNotMatch)
```

**Solutions :**

```bash
# 1. Vérifier les credentials
sudo radosgw-admin user info --uid=votre-uid

# 2. Régénérer les clés si nécessaire
sudo radosgw-admin key create --uid=votre-uid --key-type=s3 --gen-access-key --gen-secret

# 3. Vérifier la configuration s3cmd
cat ~/.s3cfg
# Access_key et secret_key doivent correspondre

# 4. Tester avec curl
curl -v http://192.168.1.50:7480

# 5. Vérifier les logs RGW
sudo tail -f /var/log/ceph/ceph-rgw-pve-douk.log
```

### 🔍 Problème 5 : Performances Lentes

**Solutions :**

```bash
# 1. Augmenter le nombre de threads
sudo nano /etc/pve/ceph.conf
# Modifier : rgw_thread_pool_size = 1024

# 2. Vérifier les performances du cluster
sudo ceph osd perf

# 3. Vérifier l'utilisation CPU/RAM du RGW
top -p $(pgrep radosgw)

# 4. Activer le cache (dans ceph.conf)
rgw_cache_enabled = true
rgw_cache_lru_size = 100000

# 5. Redémarrer après modifications
sudo systemctl restart ceph-radosgw@rgw.pve-douk
```

### 📊 Commandes de Diagnostic Avancées

```bash
# État détaillé du cluster
sudo ceph health detail

# Statistiques d'utilisation des pools
sudo ceph df

# Statistiques des OSDs
sudo ceph osd df tree

# Logs en temps réel
sudo journalctl -u ceph-radosgw@rgw.pve-douk -f

# Statistiques RGW détaillées
sudo radosgw-admin usage show --show-log-entries=false

# Liste des buckets avec taille
for bucket in $(sudo radosgw-admin bucket list | jq -r '.[]'); do
    echo "Bucket: $bucket"
    sudo radosgw-admin bucket stats --bucket="$bucket" | jq '.usage'
done

# Vérifier les processus RGW
ps aux | grep radosgw

# Tester la connectivité réseau
telnet 192.168.1.50 7480
# Ou
nc -zv 192.168.1.50 7480

# Tracer les connexions
sudo tcpdump -i any port 7480 -nn
```

### 🔧 Commandes de Maintenance Courantes

```bash
# Nettoyer les objets orphelins (garbage collection)
sudo radosgw-admin gc process

# Compacter les pools RGW
sudo ceph osd pool scrub default.rgw.buckets.data

# Sauvegarder la configuration RGW
sudo cp /etc/pve/ceph.conf /root/ceph.conf.backup.$(date +%Y%m%d)
sudo radosgw-admin user list > /root/rgw-users-backup.$(date +%Y%m%d).json

# Redémarrer tous les services Ceph (attention en production)
sudo systemctl restart ceph.target

# Vérifier l'intégrité du cluster après maintenance
sudo ceph health detail
sudo ceph -s
```

---

## 📚 Annexes

### A. Architecture Complète

```
┌─────────────────────────────────────────────────────────────────┐
│                    Applications Clientes                        │
│  (Kubernetes, Docker, Scripts Python/Boto3, aws-cli, s3cmd)    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS (Port 7480/7481)
                         │ Protocole S3 (PUT/GET/DELETE objects)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   RADOS Gateway (RGW)                           │
│  - Authentification S3 (Access Key / Secret Key)               │
│  - Gestion des buckets et ACL                                  │
│  - Traduction S3 → RADOS                                       │
│  - Service: ceph-radosgw@rgw.pve-douk                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Protocole RADOS natif
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Cluster Ceph (pve-douk)                       │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ Monitor     │  │ Manager     │  │ OSDs (x3+)  │            │
│  │ (ceph-mon)  │  │ (ceph-mgr)  │  │ (ceph-osd)  │            │
│  │ Port 6789   │  │ Port 8443   │  │             │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                 │
│  Pools RGW :                                                    │
│  - .rgw.root                                                    │
│  - default.rgw.buckets.data (données objets)                   │
│  - default.rgw.buckets.index (index)                           │
│  - default.rgw.meta (métadonnées)                              │
│  - ...                                                          │
└─────────────────────────────────────────────────────────────────┘
                         │
                         │ Stockage physique
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              Disques Physiques (SSD/HDD)                        │
│  /dev/sdb, /dev/sdc, /dev/sdd, ...                             │
└─────────────────────────────────────────────────────────────────┘
```

### B. Fichiers de Configuration Importants

| Fichier | Description | Emplacement |
|---------|-------------|-------------|
| `ceph.conf` | Configuration globale Ceph + RGW | `/etc/pve/ceph.conf` |
| Keyring RGW | Clés d'authentification du RGW | `/etc/pve/priv/ceph.client.rgw.pve-douk.keyring` |
| Logs RGW | Journaux d'activité du RGW | `/var/log/ceph/ceph-rgw-pve-douk.log` |
| Certificat SSL | Certificat TLS (si activé) | `/etc/pve/priv/rgw-pve-douk.crt` |
| Clé privée SSL | Clé privée TLS (si activée) | `/etc/pve/priv/rgw-pve-douk.key` |
| Service systemd | Unité systemd du RGW | `/lib/systemd/system/ceph-radosgw@.service` |
| Config s3cmd | Configuration client S3 | `~/.s3cfg` |

### C. Ports Réseau Utilisés

| Port | Protocole | Service | Description |
|------|-----------|---------|-------------|
| 6789 | TCP | Ceph Monitor | Communication cluster Ceph |
| 6800-7300 | TCP | Ceph OSDs | Communication inter-OSDs |
| 7480 | TCP | RGW HTTP | API S3 non chiffrée |
| 7481 | TCP | RGW HTTPS | API S3 chiffrée (SSL/TLS) |
| 8443 | TCP | Ceph Manager | Dashboard Ceph (optionnel) |

### D. Ressources et Documentation

- **Documentation officielle Ceph :** https://docs.ceph.com/
- **RADOS Gateway Admin Guide :** https://docs.ceph.com/en/latest/radosgw/admin/
- **S3 API Reference :** https://docs.aws.amazon.com/AmazonS3/latest/API/
- **Proxmox Ceph Documentation :** https://pve.proxmox.com/wiki/Ceph
- **s3cmd Documentation :** https://s3tools.org/usage

### E. Checklist de Mise en Production

- [ ] Cluster Ceph en `HEALTH_OK`
- [ ] Configuration mono-nœud appliquée (`size=1`, `min_size=1`)
- [ ] RADOS Gateway installé et démarré
- [ ] Keyring créé avec bonnes permissions
- [ ] Pools RGW avec application activée
- [ ] Utilisateur S3 créé avec credentials sauvegardés
- [ ] Tests de connexion réussis (s3cmd, curl)
- [ ] SSL/TLS configuré (production recommandée)
- [ ] Pare-feu ouvert (ports 7480, 7481)
- [ ] Monitoring configuré (logs, alertes)
- [ ] Documentation des credentials (coffre-fort sécurisé)
- [ ] Sauvegarde de la configuration (`ceph.conf`, keyrings)
- [ ] Plan de reprise après incident documenté

---

## 🎉 Conclusion

Félicitations ! Vous avez maintenant un **stockage objet S3 opérationnel** basé sur Ceph RADOS Gateway sur votre serveur Proxmox VE 9.

### Ce que vous avez accompli :

✅ Installation et configuration du RADOS Gateway  
✅ Optimisation pour un environnement mono-nœud  
✅ Création d'utilisateurs S3 avec authentification  
✅ Tests et validation du fonctionnement  
✅ Configuration SSL/TLS pour la sécurité  
✅ Maîtrise des outils de diagnostic et maintenance  

### Prochaines étapes possibles :

- 🔧 **Intégration avec Kubernetes** : Utiliser le RGW comme backend pour vos applications
- 📊 **Monitoring avancé** : Prometheus + Grafana pour surveiller les performances
- 🔐 **Authentification LDAP/AD** : Centraliser la gestion des utilisateurs
- 🌐 **Load Balancing** : HAProxy devant plusieurs instances RGW (si multi-nœuds)
- 💾 **Politique de rétention** : Lifecycle policies pour archivage automatique
- 🔄 **Réplication multi-sites** : Synchroniser plusieurs clusters Ceph distants

### Besoin d'aide ?

- Consultez les logs : `sudo journalctl -u ceph-radosgw@rgw.pve-douk -f`
- Vérifiez la santé : `sudo ceph -s`
- Lisez la documentation officielle : https://docs.ceph.com/

---

**Auteur :** Guide créé pour Proxmox VE 9 avec Ceph Quincy/Reef  
**Dernière mise à jour :** Février 2026  
**Version du document :** 1.0

---

📝 **Note :** Ce guide suppose une configuration mono-nœud. Pour un cluster multi-nœuds en production, adaptez les paramètres de réplication (`size=3`, `min_size=2`) et déployez plusieurs instances RGW pour la haute disponibilité.
