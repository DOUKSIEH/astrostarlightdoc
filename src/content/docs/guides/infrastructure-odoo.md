---
title: "Infrastructure - Kubernetes/Odoo-CNPG"
description: "Guide pédagogique complet pour déployer une infrastructure moderne avec Odoo 19 + PostgreSQL HA & ngrok avec K8S"
created: "2026-02-04"
#updated: "2026-02-02"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"

---

# 🏗️ Infrastructure Production : De Zéro à Odoo 19 sur Kubernetes

>Guide pédagogique complet pour déployer une infrastructure moderne avec Odoo 19 + PostgreSQL HA

---

## 📚 Table des Matières

1. [Vue d'ensemble et objectifs](#vue-densemble-et-objectifs)
2. [Architecture finale](#architecture-finale)
3. [Prérequis et fondations](#prérequis-et-fondations)
4. [Phase 1 : Réseau isolé (SDN)](#phase-1--réseau-isolé-sdn)
5. [Phase 2 : Sécurité périmétrique (OPNsense)](#phase-2--sécurité-périmétrique-opnsense)
6. [Phase 3 : Accès sécurisé (Bastion)](#phase-3--accès-sécurisé-bastion)
7. [Phase 4 : Cluster Kubernetes HA](#phase-4--cluster-kubernetes-ha)
8. [Phase 5 : Déploiement Odoo + PostgreSQL](#phase-5--déploiement-odoo--postgresql)
9. [Phase 6 : Observabilité](#phase-6--observabilité)
10. [Phase 7 : SIEM et sécurité avancée](#phase-7--siem-et-sécurité-avancée)
11. [Checklist de validation](#checklist-de-validation)

---

## 🎯 Vue d'ensemble et objectifs

### L'objectif final

Déployer **Odoo 19** avec **PostgreSQL haute disponibilité** (CloudNativePG) dans un cluster Kubernetes sécurisé, avec :

- ✅ **Isolation réseau totale** (SDN avec VLANs)
- ✅ **Stockage distribué** (Ceph)
- ✅ **Haute disponibilité** (3 masters K8s, 2+ workers)
- ✅ **Sécurité renforcée** (Firewall, Bastion, Zero Trust)
- ✅ **Observabilité complète** (Prometheus, Grafana, logs)
- ✅ **Détection d'intrusion** (SIEM avec Wazuh + Graylog)

### Pourquoi cette architecture ?

```
┌─────────────────────────────────────────────────────────────────┐
│                        ❌ Architecture Simple                    │
├─────────────────────────────────────────────────────────────────┤
│  Internet → VM Odoo (exposée directement)                       │
│  ⚠️  Pas de firewall                                            │
│  ⚠️  Pas de haute disponibilité                                 │
│  ⚠️  Pas d'isolation réseau                                     │
│  ⚠️  Single point of failure partout                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    ✅ Architecture Production                    │
├─────────────────────────────────────────────────────────────────┤
│  Internet → Firewall → VPN/Bastion → Kubernetes → Odoo          │
│  ✅ Plusieurs couches de sécurité                               │
│  ✅ Haute disponibilité (K8s + Ceph + CNPG)                     │
│  ✅ Isolation réseau (VLANs dédiés)                             │
│  ✅ Monitoring et alertes                                       │
│  ✅ Détection d'intrusion (SIEM)                                │
└─────────────────────────────────────────────────────────────────┘
```

### Principes directeurs

1. **Zero Trust** : Aucune confiance implicite, tout est vérifié
2. **Defense in Depth** : Plusieurs couches de sécurité
3. **Immutabilité** : Infrastructure as Code (IaC)
4. **Observabilité** : Visibilité totale sur tous les composants

---

## 🏛️ Architecture finale

### Vue d'ensemble en couches

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          COUCHE 7 : APPLICATIF                           │
│  ┌────────────────┐         ┌──────────────────┐                        │
│  │  Odoo 19       │ ←────→  │  PostgreSQL 18   │                        │
│  │  (Deployment)  │         │  (CloudNativePG) │                        │
│  │  3 replicas    │         │  3 instances HA  │                        │
│  └────────────────┘         └──────────────────┘                        │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
┌────────────────────────────────┴────────────────────────────────────────┐
│                        COUCHE 6 : OBSERVABILITÉ                          │
│  ┌──────────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐            │
│  │  Prometheus  │  │  Grafana │  │  Thanos │  │  Loki    │            │
│  └──────────────┘  └──────────┘  └─────────┘  └──────────┘            │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
┌────────────────────────────────┴────────────────────────────────────────┐
│                          COUCHE 5 : SIEM                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │  Wazuh       │  │  Graylog     │  │  Suricata    │                  │
│  │  (HIDS)      │  │  (Logs)      │  │  (NIDS)      │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
┌────────────────────────────────┴────────────────────────────────────────┐
│                    COUCHE 4 : ORCHESTRATION (Kubernetes)                 │
│  ┌─────────────────────────────────────────────────────────────┐        │
│  │  Control Plane (3 Masters)                                  │        │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │        │
│  │  │ Master 1 │  │ Master 2 │  │ Master 3 │                  │        │
│  │  │  etcd    │  │  etcd    │  │  etcd    │                  │        │
│  │  └──────────┘  └──────────┘  └──────────┘                  │        │
│  └─────────────────────────────────────────────────────────────┘        │
│  ┌─────────────────────────────────────────────────────────────┐        │
│  │  Data Plane (Workers)                                       │        │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │        │
│  │  │ Worker 1 │  │ Worker 2 │  │ Worker 3 │  │ Worker 4 │   │        │
│  │  │ 4GB RAM  │  │ 4GB RAM  │  │ 6GB RAM  │  │ 6GB RAM  │   │        │
│  │  │ prod     │  │ prod     │  │ monitor  │  │ monitor  │   │        │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │        │
│  └─────────────────────────────────────────────────────────────┘        │
│  CNI: Cilium   |   CSI: Ceph RBD + CephFS                               │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
┌────────────────────────────────┴────────────────────────────────────────┐
│                      COUCHE 3 : STOCKAGE (Ceph)                          │
│  ┌─────────────────────────────────────────────────────────────┐        │
│  │  Ceph Cluster (Distributed Storage)                         │        │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │        │
│  │  │  OSD 1   │  │  OSD 2   │  │  OSD 3   │  (3+ réplicas)   │        │
│  │  └──────────┘  └──────────┘  └──────────┘                  │        │
│  │  RBD (Block)   |   CephFS (File)   |   CRUSH Rules          │        │
│  └─────────────────────────────────────────────────────────────┘        │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
┌────────────────────────────────┴────────────────────────────────────────┐
│                    COUCHE 2 : ACCÈS SÉCURISÉ                             │
│  ┌─────────────────────────────────────────────────────────────┐        │
│  │  Bastion (NixOS)                                            │        │
│  │  - Seul point d'entrée SSH                                 │        │
│  │  - MFA obligatoire                                          │        │
│  │  - Logs audités                                             │        │
│  │  - kubectl, ansible, terraform                             │        │
│  └─────────────────────────────────────────────────────────────┘        │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
┌────────────────────────────────┴────────────────────────────────────────┐
│                  COUCHE 1 : SÉCURITÉ PÉRIMÉTRIQUE                        │
│  ┌─────────────────────────────────────────────────────────────┐        │
│  │  OPNsense (Firewall)                                        │        │
│  │  - NAT sortant                                              │        │
│  │  │  - IDS/IPS (Suricata)                                     │        │
│  │  - VPN WireGuard                                            │        │
│  │  - Blocage total Internet → Infra                           │        │
│  └─────────────────────────────────────────────────────────────┘        │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
┌────────────────────────────────┴────────────────────────────────────────┐
│                    COUCHE 0 : RÉSEAU ISOLÉ (SDN)                         │
│  ┌─────────────────────────────────────────────────────────────┐        │
│  │  Bridges Proxmox + VLANs                                    │        │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │        │
│  │  │ VLAN 10     │  │ VLAN 20     │  │ VLAN 30     │         │        │
│  │  │ Management  │  │ K8s Fabric  │  │ Ceph        │         │        │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │        │
│  │  ┌─────────────┐                                            │        │
│  │  │ VLAN 40     │                                            │        │
│  │  │ Monitoring  │                                            │        │
│  │  └─────────────┘                                            │        │
│  └─────────────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────────┘
                                 ▲
                                 │
                            Internet (WAN)
```

### Flux de données : De l'utilisateur à Odoo

```
┌────────────────────────────────────────────────────────────────────┐
│  1. Utilisateur externe veut accéder à Odoo                        │
└────────────────┬───────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────┐
│  2. Internet → OPNsense (Firewall)                                 │
│     ✓ Suricata (IDS/IPS) analyse le trafic                        │
│     ✓ Règles de filtrage appliquées                               │
│     ✓ NAT vers le bon réseau                                      │
└────────────────┬───────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────┐
│  3. VLAN 20 (Fabric K8s)                                           │
│     → Ingress Controller (Cilium ou nginx)                         │
└────────────────┬───────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────┐
│  4. Service Kubernetes : odoo-service                              │
│     → Load balancing vers les pods Odoo                           │
└────────────────┬───────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────┐
│  5. Pod Odoo (l'un des 3 replicas)                                 │
│     → Traitement de la requête                                     │
│     → Besoin de données ? → Connexion à PostgreSQL                │
└────────────────┬───────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────┐
│  6. Service PostgreSQL : odoo-db-rw                                │
│     → CloudNativePG route vers le PRIMARY                         │
└────────────────┬───────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────┐
│  7. PostgreSQL PRIMARY (odoo-db-1)                                 │
│     → Lecture/Écriture dans la base                               │
│     → Données stockées sur Ceph (PVC)                             │
└────────────────┬───────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────┐
│  8. Ceph Storage (VLAN 30)                                         │
│     → Stockage distribué et répliqué                              │
│     → Données sûres même si un nœud tombe                         │
└────────────────────────────────────────────────────────────────────┘

En parallèle :
┌────────────────────────────────────────────────────────────────────┐
│  📊 Prometheus collecte les métriques                              │
│  📝 Loki collecte les logs                                         │
│  🔍 Wazuh surveille les fichiers et processus                      │
│  🚨 Suricata détecte les intrusions réseau                         │
└────────────────────────────────────────────────────────────────────┘
```

---

## ✅ Prérequis et fondations

### Ce qui est déjà fait

| Composant | Status | Détails |
|-----------|--------|---------|
| **VM DevOps** | ✅ Opérationnel | Debian avec kubectl, helm, terraform, ansible |
| **Ceph Cluster** | ✅ Installé | OSDs opérationnels, disques correctement identifiés |
| **Documentation** | ✅ En place | Docusaurus exposé via ngrok |

### Infrastructure physique requise

```
Proxmox Cluster (minimum)
├─ Node 1 : 16 GB RAM, 4 cores, 500 GB SSD
├─ Node 2 : 16 GB RAM, 4 cores, 500 GB SSD
└─ Node 3 : 16 GB RAM, 4 cores, 500 GB SSD

Réseau
├─ Switch manageable (VLANs)
└─ Connexion Internet (pour téléchargements initiaux)
```

### Outils nécessaires

Sur votre **VM DevOps** :

```bash
# Vérifier que tout est installé
terraform --version    # IaC pour provisionner les VMs
ansible --version      # Configuration management
kubectl version        # Gestion Kubernetes
helm version           # Package manager K8s
```

---

## 📅 Phase 1 : Réseau isolé (SDN)

### 🎯 Objectif

Créer une **segmentation réseau stricte** avec des VLANs dédiés pour isoler :
- Le management (accès admin)
- Le trafic Kubernetes (pods, services)
- Le stockage Ceph (trafic de réplication)
- Le monitoring (métriques, logs)

### 🎓 Pourquoi des VLANs ?

**Sans VLANs** :
```
┌────────────────────────────────────────────┐
│  Tout le trafic sur le même réseau         │
│  ❌ Un attaquant peut sniffer tout         │
│  ❌ Pas de QoS possible                    │
│  ❌ Difficile de tracer les flux           │
└────────────────────────────────────────────┘
```

**Avec VLANs** :
```
┌────────────────────────────────────────────┐
│  VLAN 10 : Management (Admin uniquement)   │
│  VLAN 20 : K8s Fabric (Pods isolés)        │
│  VLAN 30 : Ceph (Trafic haute performance) │
│  VLAN 40 : Monitoring (Métriques/Logs)     │
│  ✅ Isolation L2 stricte                   │
│  ✅ QoS par VLAN                           │
│  ✅ Sécurité par segmentation              │
└────────────────────────────────────────────┘
```

### 📋 Tâches détaillées

#### 1.1 - Créer les bridges Proxmox

Sur **chaque nœud Proxmox** :

```bash
# Se connecter en SSH au nœud Proxmox
ssh root@proxmox-node1

# Éditer la configuration réseau
nano /etc/network/interfaces
```

Ajouter ces bridges :

```bash
# Bridge pour Management (VLAN 10)
auto vmbr10
iface vmbr10 inet static
    address 10.10.10.1/24
    bridge-ports none
    bridge-stp off
    bridge-fd 0
    bridge-vlan-aware yes

# Bridge pour Fabric K8s (VLAN 20)
auto vmbr20
iface vmbr20 inet static
    address 10.20.20.1/24
    bridge-ports none
    bridge-stp off
    bridge-fd 0
    bridge-vlan-aware yes

# Bridge pour Ceph Storage (VLAN 30)
auto vmbr30
iface vmbr30 inet static
    address 10.30.30.1/24
    bridge-ports none
    bridge-stp off
    bridge-fd 0
    bridge-vlan-aware yes

# Bridge pour Monitoring (VLAN 40)
auto vmbr40
iface vmbr40 inet static
    address 10.40.40.1/24
    bridge-ports none
    bridge-stp off
    bridge-fd 0
    bridge-vlan-aware yes
```

Appliquer les changements :

```bash
ifreload -a

# Vérifier
ip a | grep vmbr
```

#### 1.2 - Créer les VLANs sur le switch

Sur votre **switch manageable** :

```
VLAN 10 - Management
├─ Réseau : 10.10.10.0/24
├─ Gateway : 10.10.10.1
└─ Ports : Tagged sur tous les ports trunk

VLAN 20 - Kubernetes Fabric
├─ Réseau : 10.20.20.0/24
├─ Gateway : 10.20.20.1
└─ Ports : Tagged sur tous les ports trunk

VLAN 30 - Ceph Storage
├─ Réseau : 10.30.30.0/24
├─ Gateway : 10.30.30.1
└─ Ports : Tagged sur tous les ports trunk

VLAN 40 - Monitoring
├─ Réseau : 10.40.40.0/24
├─ Gateway : 10.40.40.1
└─ Ports : Tagged sur tous les ports trunk
```

#### 1.3 - Automatiser avec Terraform (optionnel)

Créez `network.tf` :

```hcl
terraform {
  required_providers {
    proxmox = {
      source = "bpg/proxmox"
      version = "~> 0.50"
    }
  }
}

provider "proxmox" {
  endpoint = "https://proxmox.local:8006"
  username = "root@pam"
  password = var.proxmox_password
  insecure = true
}

# Cette configuration documente l'infrastructure
# Les bridges sont créés manuellement (voir 1.1)
```

### ✅ Validation

```bash
# Sur chaque nœud Proxmox
ping 10.10.10.1  # Management
ping 10.20.20.1  # K8s
ping 10.30.30.1  # Ceph
ping 10.40.40.1  # Monitoring
```

### 📊 Tableau de plan d'adressage

| Réseau | VLAN | Subnet | Gateway | Usage | VMs prévues |
|--------|------|--------|---------|-------|-------------|
| Management | 10 | 10.10.10.0/24 | .1 | Admin, Bastion | 10.10.10.10 (Bastion) |
| K8s Fabric | 20 | 10.20.20.0/24 | .1 | Pods, Services | 10.20.20.11-20 (Masters/Workers) |
| Ceph Storage | 30 | 10.30.30.0/24 | .1 | Réplication Ceph | Interface dédiée sur chaque nœud |
| Monitoring | 40 | 10.40.40.0/24 | .1 | Prometheus, Grafana | 10.40.40.11-15 |

---

## 📅 Phase 2 : Sécurité périmétrique (OPNsense)

### 🎯 Objectif

Déployer un **firewall OPNsense** qui :
- Bloque tout trafic non autorisé depuis Internet
- Fournit du NAT sortant pour les VMs
- Détecte les intrusions avec Suricata (IDS/IPS)
- Offre un accès VPN sécurisé

### 🎓 Pourquoi OPNsense ?

OPNsense est un firewall open-source basé sur FreeBSD qui fournit :
- ✅ Interface web intuitive
- ✅ IDS/IPS intégré (Suricata)
- ✅ VPN (WireGuard, OpenVPN)
- ✅ Règles de firewall avancées
- ✅ Logs et monitoring

### 🏗️ Architecture OPNsense

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet (WAN)                       │
│                      (IP publique ISP)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     OPNsense Firewall                        │
│  ┌────────────┐                         ┌────────────┐      │
│  │ WAN        │                         │ LAN        │      │
│  │ (Internet) │                         │ (Fabric)   │      │
│  │ DHCP ISP   │                         │ 10.20.20.254│      │
│  └────────────┘                         └────────────┘      │
│                                                              │
│  🔥 Règles firewall                                         │
│  🛡️  Suricata IDS/IPS                                       │
│  🔒 VPN WireGuard                                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    VLAN 20 (Kubernetes)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Master 1 │  │ Master 2 │  │ Master 3 │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### 📋 Tâches détaillées

#### 2.1 - Créer la VM OPNsense avec Terraform

Créez `opnsense.tf` :

```hcl
resource "proxmox_virtual_environment_vm" "opnsense" {
  name      = "opnsense-fw"
  node_name = "proxmox-node1"
  
  cpu {
    cores = 2
    type  = "host"
  }
  
  memory {
    dedicated = 2048  # 2 GB RAM
  }
  
  disk {
    datastore_id = "local-lvm"
    file_id      = proxmox_virtual_environment_download_file.opnsense_iso.id
    interface    = "virtio0"
    size         = 32  # 32 GB
  }
  
  # Interface WAN (Internet)
  network_device {
    bridge = "vmbr0"  # Bridge connecté à Internet
  }
  
  # Interface LAN (Fabric K8s)
  network_device {
    bridge = "vmbr20"
    vlan_id = 20
  }
  
  # Interface Management
  network_device {
    bridge = "vmbr10"
    vlan_id = 10
  }
}

resource "proxmox_virtual_environment_download_file" "opnsense_iso" {
  content_type = "iso"
  datastore_id = "local"
  node_name    = "proxmox-node1"
  url          = "https://mirror.ams1.nl.leaseweb.net/opnsense/releases/24.1/OPNsense-24.1-dvd-amd64.iso.bz2"
}
```

Déployer :

```bash
terraform init
terraform plan
terraform apply
```

#### 2.2 - Installation initiale d'OPNsense

1. **Démarrer la VM** et suivre l'installateur
2. **Configurer les interfaces** :
   - WAN : vtnet0 (DHCP depuis ISP)
   - LAN : vtnet1 (10.20.20.254/24)
   - OPT1 : vtnet2 (10.10.10.254/24 - Management)

3. **Accéder à l'interface web** :
   ```
   https://10.20.20.254
   Utilisateur : root
   Mot de passe : opnsense
   ```

#### 2.3 - Configuration firewall de base

##### Règles WAN (Internet → Firewall)

```
┌──────────────────────────────────────────────────────────┐
│  WAN Rules (BLOQUER PAR DÉFAUT)                          │
├──────────────────────────────────────────────────────────┤
│  1. BLOCK * → * (Bloquer tout par défaut)               │
│  2. ALLOW VPN Port 51820/UDP → OPNsense (WireGuard)     │
│  3. ALLOW ICMP (ping) → OPNsense (pour diagnostics)     │
└──────────────────────────────────────────────────────────┘
```

##### Règles LAN (Kubernetes → Internet)

```
┌──────────────────────────────────────────────────────────┐
│  LAN Rules (AUTORISER PAR DÉFAUT)                        │
├──────────────────────────────────────────────────────────┤
│  1. ALLOW 10.20.20.0/24 → * Port 80,443 (HTTP/HTTPS)    │
│  2. ALLOW 10.20.20.0/24 → * Port 53 (DNS)               │
│  3. BLOCK 10.20.20.0/24 → 10.10.10.0/24 (Pas de mgmt)   │
│  4. ALLOW 10.20.20.0/24 → 10.30.30.0/24 (Ceph OK)       │
└──────────────────────────────────────────────────────────┘
```

Dans **Firewall → Rules → WAN** :

```
Action: Block
Interface: WAN
Protocol: Any
Source: Any
Destination: Any
Description: Block all by default
```

Dans **Firewall → Rules → LAN** :

```
Action: Pass
Interface: LAN
Protocol: TCP/UDP
Source: LAN net (10.20.20.0/24)
Destination: Any
Destination Port: 80, 443, 53
Description: Allow web and DNS
```

#### 2.4 - Activer Suricata (IDS/IPS)

1. **Aller dans Services → Intrusion Detection**
2. **Activer Suricata** sur l'interface WAN
3. **Télécharger les règles** :
   - ET Open Rules (gratuit)
   - Abuse.ch (malware)
4. **Mode** : IPS (Inline mode pour bloquer)
5. **Mettre à jour** les règles quotidiennement

#### 2.5 - Configurer VPN WireGuard

1. **Aller dans VPN → WireGuard**
2. **Créer une instance** :
   ```
   Nom : wg0
   Port : 51820
   Tunnel Address : 10.50.50.1/24
   ```
3. **Créer un peer** (votre laptop) :
   ```
   Public Key : <votre clé publique>
   Allowed IPs : 10.50.50.2/32
   ```
4. **Règles firewall** pour WireGuard :
   ```
   Action: Pass
   Interface: WAN
   Protocol: UDP
   Destination Port: 51820
   ```

### ✅ Validation

```bash
# Depuis votre laptop (hors du réseau)
ping 10.20.20.254  # Doit échouer (bloqué par firewall)

# Via VPN WireGuard
wg-quick up wg0
ping 10.20.20.254  # Doit fonctionner
ping 10.20.20.11   # Ping d'un master K8s
```

---

## 📅 Phase 3 : Accès sécurisé (Bastion)

### 🎯 Objectif

Déployer un **bastion NixOS** qui :
- Est le **seul point d'entrée SSH** dans l'infrastructure
- Nécessite une **authentification multi-facteurs (MFA)**
- **Audite tous les accès** (qui, quand, quoi)
- Contient les outils d'administration (kubectl, ansible, terraform)

### 🎓 Pourquoi un Bastion ?

**Sans bastion** :
```
┌────────────────────────────────────────────┐
│  SSH direct vers chaque serveur            │
│  ❌ Surface d'attaque énorme               │
│  ❌ Difficile d'auditer les accès          │
│  ❌ Gestion des clés complexe              │
└────────────────────────────────────────────┘
```

**Avec bastion** :
```
┌────────────────────────────────────────────┐
│  SSH uniquement vers le bastion            │
│  ✅ Un seul point d'entrée fortifié        │
│  ✅ Tous les accès loggés                  │
│  ✅ MFA obligatoire                        │
│  ✅ Jump host vers les autres serveurs     │
└────────────────────────────────────────────┘
```

### 🏗️ Architecture Bastion

```
┌──────────────────────────────────────────────────────────┐
│  Admin depuis Internet                                    │
└────────────────┬─────────────────────────────────────────┘
                 │
                 │ 1. VPN WireGuard
                 ▼
┌──────────────────────────────────────────────────────────┐
│  OPNsense Firewall                                        │
└────────────────┬─────────────────────────────────────────┘
                 │
                 │ 2. SSH avec MFA
                 ▼
┌──────────────────────────────────────────────────────────┐
│  Bastion NixOS (10.10.10.10)                             │
│  ┌────────────────────────────────────────────┐          │
│  │  - SSH hardening (clés ED25519 uniquement) │          │
│  │  - Google Authenticator (TOTP)             │          │
│  │  - fail2ban                                │          │
│  │  - Logs → Graylog                          │          │
│  └────────────────────────────────────────────┘          │
│  ┌────────────────────────────────────────────┐          │
│  │  Outils admin :                            │          │
│  │  - kubectl (accès K8s)                     │          │
│  │  - ansible (config VMs)                    │          │
│  │  - terraform (IaC)                         │          │
│  └────────────────────────────────────────────┘          │
└────────────────┬─────────────────────────────────────────┘
                 │
                 │ 3. Jump vers les serveurs
                 ▼
┌──────────────────────────────────────────────────────────┐
│  Masters K8s, Workers, autres VMs                        │
└──────────────────────────────────────────────────────────┘
```

### 📋 Tâches détaillées

#### 3.1 - Créer la VM Bastion avec Terraform

`bastion.tf` :

```hcl
resource "proxmox_virtual_environment_vm" "bastion" {
  name      = "bastion"
  node_name = "proxmox-node1"
  
  cpu {
    cores = 2
  }
  
  memory {
    dedicated = 2048
  }
  
  disk {
    datastore_id = "local-lvm"
    file_id      = proxmox_virtual_environment_download_file.nixos_iso.id
    interface    = "virtio0"
    size         = 20
  }
  
  network_device {
    bridge  = "vmbr10"
    vlan_id = 10
  }
  
  network_device {
    bridge  = "vmbr20"
    vlan_id = 20
  }
}
```

#### 3.2 - Configuration NixOS

`configuration.nix` :

```nix
{ config, pkgs, ... }:

{
  # Hostname
  networking.hostName = "bastion";
  
  # Interfaces réseau
  networking.interfaces = {
    ens18 = {
      ipv4.addresses = [{
        address = "10.10.10.10";
        prefixLength = 24;
      }];
    };
    ens19 = {
      ipv4.addresses = [{
        address = "10.20.20.10";
        prefixLength = 24;
      }];
    };
  };
  
  # SSH hardening
  services.openssh = {
    enable = true;
    settings = {
      PermitRootLogin = "no";
      PasswordAuthentication = false;
      PubkeyAuthentication = true;
      KbdInteractiveAuthentication = true;  # Pour Google Authenticator
      AuthenticationMethods = "publickey,keyboard-interactive";
    };
    extraConfig = ''
      # Seulement ED25519
      HostKeyAlgorithms ssh-ed25519
      PubkeyAcceptedKeyTypes ssh-ed25519
      
      # Logs verbeux
      LogLevel VERBOSE
    '';
  };
  
  # Google Authenticator (TOTP)
  security.pam.services.sshd.googleAuthenticator.enable = true;
  
  # fail2ban
  services.fail2ban = {
    enable = true;
    maxretry = 3;
    bantime = "1h";
  };
  
  # Outils admin
  environment.systemPackages = with pkgs; [
    kubectl
    kubernetes-helm
    terraform
    ansible
    git
    vim
    tmux
  ];
  
  # Utilisateur admin
  users.users.admin = {
    isNormalUser = true;
    extraGroups = [ "wheel" ];  # sudo
    openssh.authorizedKeys.keys = [
      "ssh-ed25519 AAAAC3... votre-cle-publique"
    ];
  };
}
```

Appliquer :

```bash
nixos-rebuild switch
```

#### 3.3 - Configurer Google Authenticator

Sur le bastion, en tant qu'utilisateur `admin` :

```bash
google-authenticator

# Questions :
# Do you want authentication tokens to be time-based? (y/n) y
# Do you want me to update your "/home/admin/.google_authenticator" file? (y/n) y
# Do you want to disallow multiple uses of the same authentication token? (y/n) y
# Do you want to allow up to 3 login attempts? (y/n) y
```

Scanner le QR code avec Google Authenticator sur votre smartphone.

#### 3.4 - Configurer kubectl

```bash
# Copier le kubeconfig depuis un master K8s (après Phase 4)
scp root@10.20.20.11:/etc/kubernetes/admin.conf ~/.kube/config

# Tester
kubectl get nodes
```

### ✅ Validation

```bash
# Depuis votre laptop, via VPN
ssh admin@10.10.10.10

# Vous devez :
# 1. Fournir votre clé SSH
# 2. Entrer le code TOTP (6 chiffres)
# 3. Être connecté au bastion

# Depuis le bastion, jump vers un master
ssh root@10.20.20.11
```

---

## 📅 Phase 4 : Cluster Kubernetes HA

### 🎯 Objectif

Déployer un **cluster Kubernetes haute disponibilité** avec :
- **3 masters** (control plane redondant)
- **4 workers** (2 pour prod, 2 pour monitoring)
- **etcd HA** (stockage clé-valeur distribué)
- **CNI Cilium** (réseau avancé avec eBPF)
- **CSI Ceph** (stockage persistant)

### 🎓 Architecture Kubernetes expliquée

```
┌───────────────────────────────────────────────────────────────┐
│                  CONTROL PLANE (3 Masters)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  Master 1    │  │  Master 2    │  │  Master 3    │        │
│  │  10.20.20.11 │  │  10.20.20.12 │  │  10.20.20.13 │        │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤        │
│  │ API Server   │  │ API Server   │  │ API Server   │        │
│  │ Scheduler    │  │ Scheduler    │  │ Scheduler    │        │
│  │ Controller   │  │ Controller   │  │ Controller   │        │
│  │ etcd         │  │ etcd         │  │ etcd         │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│         │                 │                 │                 │
│         └─────────────────┴─────────────────┘                 │
│                           │                                    │
│                  Load Balancer (VIP: 10.20.20.10)             │
└───────────────────────────┴───────────────────────────────────┘
                            │
┌───────────────────────────┴───────────────────────────────────┐
│                    DATA PLANE (4 Workers)                      │
│  ┌──────────────┐  ┌──────────────┐                          │
│  │  Worker 1    │  │  Worker 2    │  ← Production            │
│  │  10.20.20.21 │  │  10.20.20.22 │     (Odoo + DB)          │
│  │  4 GB RAM    │  │  4 GB RAM    │                          │
│  │  role=prod   │  │  role=prod   │                          │
│  └──────────────┘  └──────────────┘                          │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐                          │
│  │  Worker 3    │  │  Worker 4    │  ← Monitoring            │
│  │  10.20.20.23 │  │  10.20.20.24 │     (Prometheus, etc)    │
│  │  6 GB RAM    │  │  6 GB RAM    │                          │
│  │  role=mon    │  │  role=mon    │                          │
│  └──────────────┘  └──────────────┘                          │
└────────────────────────────────────────────────────────────────┘
```

### 📋 Tâches détaillées

#### 4.1 - Créer les VMs avec Terraform

`kubernetes-cluster.tf` :

```hcl
# Masters
resource "proxmox_virtual_environment_vm" "k8s_masters" {
  count     = 3
  name      = "k8s-master-${count.index + 1}"
  node_name = "proxmox-node${(count.index % 3) + 1}"
  
  cpu {
    cores = 2
    type  = "host"
  }
  
  memory {
    dedicated = 4096
  }
  
  disk {
    datastore_id = "local-lvm"
    file_id      = proxmox_virtual_environment_download_file.ubuntu_2204.id
    interface    = "scsi0"
    size         = 50
  }
  
  network_device {
    bridge  = "vmbr20"
    vlan_id = 20
  }
  
  network_device {
    bridge  = "vmbr30"
    vlan_id = 30
  }
  
  initialization {
    ip_config {
      ipv4 {
        address = "10.20.20.${11 + count.index}/24"
        gateway = "10.20.20.254"
      }
    }
    ip_config {
      ipv4 {
        address = "10.30.30.${11 + count.index}/24"
      }
    }
  }
}

# Workers Production
resource "proxmox_virtual_environment_vm" "k8s_workers_prod" {
  count     = 2
  name      = "k8s-worker-${count.index + 1}"
  node_name = "proxmox-node${(count.index % 3) + 1}"
  
  cpu {
    cores = 2
  }
  
  memory {
    dedicated = 4096
  }
  
  disk {
    datastore_id = "local-lvm"
    file_id      = proxmox_virtual_environment_download_file.ubuntu_2204.id
    interface    = "scsi0"
    size         = 50
  }
  
  network_device {
    bridge  = "vmbr20"
    vlan_id = 20
  }
  
  network_device {
    bridge  = "vmbr30"
    vlan_id = 30
  }
  
  initialization {
    ip_config {
      ipv4 {
        address = "10.20.20.${21 + count.index}/24"
        gateway = "10.20.20.254"
      }
    }
    ip_config {
      ipv4 {
        address = "10.30.30.${21 + count.index}/24"
      }
    }
  }
}

# Workers Monitoring
resource "proxmox_virtual_environment_vm" "k8s_workers_mon" {
  count     = 2
  name      = "k8s-worker-${count.index + 3}"
  node_name = "proxmox-node${(count.index % 3) + 1}"
  
  cpu {
    cores = 2
  }
  
  memory {
    dedicated = 6144  # 6 GB
  }
  
  disk {
    datastore_id = "local-lvm"
    file_id      = proxmox_virtual_environment_download_file.ubuntu_2204.id
    interface    = "scsi0"
    size         = 50
  }
  
  network_device {
    bridge  = "vmbr20"
    vlan_id = 20
  }
  
  network_device {
    bridge  = "vmbr30"
    vlan_id = 30
  }
  
  initialization {
    ip_config {
      ipv4 {
        address = "10.20.20.${23 + count.index}/24"
        gateway = "10.20.20.254"
      }
    }
    ip_config {
      ipv4 {
        address = "10.30.30.${23 + count.index}/24"
      }
    }
  }
}
```

Déployer :

```bash
terraform apply
```

#### 4.2 - Préparer les nœuds avec Ansible

`inventory.ini` :

```ini
[masters]
k8s-master-1 ansible_host=10.20.20.11
k8s-master-2 ansible_host=10.20.20.12
k8s-master-3 ansible_host=10.20.20.13

[workers_prod]
k8s-worker-1 ansible_host=10.20.20.21
k8s-worker-2 ansible_host=10.20.20.22

[workers_mon]
k8s-worker-3 ansible_host=10.20.20.23
k8s-worker-4 ansible_host=10.20.20.24

[all:vars]
ansible_user=root
ansible_ssh_private_key_file=~/.ssh/id_ed25519
```

`playbook-prepare.yml` :

```yaml
---
- name: Préparer les nœuds Kubernetes
  hosts: all
  become: yes
  tasks:
    - name: Désactiver swap
      shell: swapoff -a
      
    - name: Désactiver swap au redémarrage
      lineinfile:
        path: /etc/fstab
        regexp: '.*swap.*'
        state: absent
    
    - name: Charger les modules kernel
      modprobe:
        name: "{{ item }}"
      loop:
        - overlay
        - br_netfilter
    
    - name: Configurer sysctl
      sysctl:
        name: "{{ item.key }}"
        value: "{{ item.value }}"
        state: present
        reload: yes
      loop:
        - { key: 'net.bridge.bridge-nf-call-iptables', value: '1' }
        - { key: 'net.bridge.bridge-nf-call-ip6tables', value: '1' }
        - { key: 'net.ipv4.ip_forward', value: '1' }
    
    - name: Installer containerd
      apt:
        name:
          - containerd
          - apt-transport-https
          - ca-certificates
          - curl
        state: present
        update_cache: yes
    
    - name: Configurer containerd
      shell: |
        containerd config default > /etc/containerd/config.toml
        sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
        systemctl restart containerd
    
    - name: Ajouter la clé GPG Kubernetes
      apt_key:
        url: https://pkgs.k8s.io/core:/stable:/v1.29/deb/Release.key
        state: present
    
    - name: Ajouter le dépôt Kubernetes
      apt_repository:
        repo: deb https://pkgs.k8s.io/core:/stable:/v1.29/deb/ /
        state: present
    
    - name: Installer kubeadm, kubelet, kubectl
      apt:
        name:
          - kubelet=1.29.0-1.1
          - kubeadm=1.29.0-1.1
          - kubectl=1.29.0-1.1
        state: present
        update_cache: yes
    
    - name: Hold les paquets Kubernetes
      dpkg_selections:
        name: "{{ item }}"
        selection: hold
      loop:
        - kubelet
        - kubeadm
        - kubectl
```

Exécuter :

```bash
ansible-playbook -i inventory.ini playbook-prepare.yml
```

#### 4.3 - Initialiser le premier master

Sur `k8s-master-1` :

```bash
# Créer le fichier de configuration kubeadm
cat > kubeadm-config.yaml <<EOF
apiVersion: kubeadm.k8s.io/v1beta3
kind: ClusterConfiguration
kubernetesVersion: v1.29.0
controlPlaneEndpoint: "10.20.20.10:6443"  # VIP (à configurer avec keepalived)
networking:
  podSubnet: "10.244.0.0/16"
  serviceSubnet: "10.96.0.0/12"
---
apiVersion: kubeadm.k8s.io/v1beta3
kind: InitConfiguration
nodeRegistration:
  criSocket: unix:///var/run/containerd/containerd.sock
EOF

# Initialiser
kubeadm init --config kubeadm-config.yaml --upload-certs

# Sauvegarder la commande join affichée !
```

Configurer kubectl :

```bash
mkdir -p $HOME/.kube
cp /etc/kubernetes/admin.conf $HOME/.kube/config
chown $(id -u):$(id -g) $HOME/.kube/config
```

#### 4.4 - Joindre les autres masters

Sur `k8s-master-2` et `k8s-master-3`, utiliser la commande affichée par `kubeadm init` :

```bash
kubeadm join 10.20.20.10:6443 --token <token> \
  --discovery-token-ca-cert-hash sha256:<hash> \
  --control-plane --certificate-key <key>
```

#### 4.5 - Installer Cilium (CNI)

Sur `k8s-master-1` :

```bash
# Installer Cilium CLI
curl -L --remote-name-all https://github.com/cilium/cilium-cli/releases/latest/download/cilium-linux-amd64.tar.gz{,.sha256sum}
tar xzvfC cilium-linux-amd64.tar.gz /usr/local/bin
rm cilium-linux-amd64.tar.gz{,.sha256sum}

# Installer Cilium dans le cluster
cilium install --version 1.15.0

# Vérifier
cilium status --wait
```

#### 4.6 - Joindre les workers

Sur chaque worker, utiliser la commande join (sans `--control-plane`) :

```bash
kubeadm join 10.20.20.10:6443 --token <token> \
  --discovery-token-ca-cert-hash sha256:<hash>
```

#### 4.7 - Labelliser les workers

```bash
# Workers production
kubectl label node k8s-worker-1 role=production
kubectl label node k8s-worker-2 role=production

# Workers monitoring
kubectl label node k8s-worker-3 role=monitoring capacity=high
kubectl label node k8s-worker-4 role=monitoring capacity=high
```

#### 4.8 - Installer Ceph CSI

```bash
# Ajouter le repo Helm
helm repo add ceph-csi https://ceph.github.io/csi-charts
helm repo update

# Créer le namespace
kubectl create namespace ceph-csi-rbd

# Installer RBD (block storage)
helm install ceph-csi-rbd ceph-csi/ceph-csi-rbd \
  --namespace ceph-csi-rbd \
  --set csiConfig[0].clusterID=<votre-cluster-id> \
  --set csiConfig[0].monitors="{10.30.30.11:6789,10.30.30.12:6789,10.30.30.13:6789}"

# Créer une StorageClass
cat <<EOF | kubectl apply -f -
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ceph-rbd
provisioner: rbd.csi.ceph.com
parameters:
  clusterID: <votre-cluster-id>
  pool: kubernetes
  imageFeatures: layering
  csi.storage.k8s.io/provisioner-secret-name: csi-rbd-secret
  csi.storage.k8s.io/provisioner-secret-namespace: ceph-csi-rbd
  csi.storage.k8s.io/controller-expand-secret-name: csi-rbd-secret
  csi.storage.k8s.io/controller-expand-secret-namespace: ceph-csi-rbd
  csi.storage.k8s.io/node-stage-secret-name: csi-rbd-secret
  csi.storage.k8s.io/node-stage-secret-namespace: ceph-csi-rbd
reclaimPolicy: Delete
allowVolumeExpansion: true
volumeBindingMode: WaitForFirstConsumer
EOF
```

### ✅ Validation

```bash
# Vérifier les nœuds
kubectl get nodes -o wide

# Résultat attendu :
# NAME           STATUS   ROLES           AGE   VERSION
# k8s-master-1   Ready    control-plane   10m   v1.29.0
# k8s-master-2   Ready    control-plane   9m    v1.29.0
# k8s-master-3   Ready    control-plane   8m    v1.29.0
# k8s-worker-1   Ready    <none>          7m    v1.29.0
# k8s-worker-2   Ready    <none>          7m    v1.29.0
# k8s-worker-3   Ready    <none>          6m    v1.29.0
# k8s-worker-4   Ready    <none>          6m    v1.29.0

# Vérifier Cilium
cilium connectivity test

# Tester le stockage Ceph
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: test-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
  storageClassName: ceph-rbd
EOF

kubectl get pvc test-pvc
# STATUS doit être "Bound"
```

---

## 📅 Phase 5 : Déploiement Odoo + PostgreSQL

### 🎯 Objectif PRINCIPAL

Déployer **Odoo 19** avec **PostgreSQL 18 en haute disponibilité** (CloudNativePG) :
- ✅ 3 instances PostgreSQL (1 PRIMARY + 2 STANDBY)
- ✅ Réplication synchrone
- ✅ Failover automatique
- ✅ Stockage sur Ceph
- ✅ Odoo avec 3 replicas pour la charge
- ✅ Secrets sécurisés

### 🏗️ Architecture déploiement

```
┌─────────────────────────────────────────────────────────────┐
│                    Namespace: odoo-v19                       │
│                                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │  Ingress (exposition externe)                  │         │
│  │  https://odoo.example.com                      │         │
│  └─────────────────┬──────────────────────────────┘         │
│                    │                                         │
│                    ▼                                         │
│  ┌────────────────────────────────────────────────┐         │
│  │  Service: odoo (LoadBalancer)                  │         │
│  │  Port 8069                                     │         │
│  └─────────────────┬──────────────────────────────┘         │
│                    │                                         │
│         ┌──────────┴──────────┬──────────────┐             │
│         ▼                     ▼              ▼             │
│  ┌──────────┐         ┌──────────┐   ┌──────────┐         │
│  │  Odoo 1  │         │  Odoo 2  │   │  Odoo 3  │         │
│  │ (Pod)    │         │ (Pod)    │   │ (Pod)    │         │
│  └─────┬────┘         └─────┬────┘   └─────┬────┘         │
│        │                    │              │               │
│        └────────────────────┴──────────────┘               │
│                             │                               │
│                             ▼                               │
│  ┌────────────────────────────────────────────────┐         │
│  │  Service: odoo-db-rw                           │         │
│  │  (CloudNativePG read-write)                    │         │
│  └─────────────────┬──────────────────────────────┘         │
│                    │                                         │
│                    ▼                                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  PostgreSQL Cluster (CloudNativePG)                 │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │    │
│  │  │ odoo-db-1  │  │ odoo-db-2  │  │ odoo-db-3  │    │    │
│  │  │ PRIMARY ✅ │→│ STANDBY    │→│ STANDBY    │    │    │
│  │  └──────┬─────┘  └────────────┘  └────────────┘    │    │
│  │         │                                           │    │
│  │         ▼                                           │    │
│  │  PVC: 10Gi (Ceph RBD) × 3                          │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 📋 Tâches détaillées

#### 5.1 - Créer le namespace

```bash
kubectl create namespace odoo-v19
kubectl label namespace odoo-v19 pod-security.kubernetes.io/enforce=baseline
```

#### 5.2 - Installer CloudNativePG Operator

```bash
# Ajouter le repo Helm
helm repo add cnpg https://cloudnative-pg.github.io/charts
helm repo update

# Installer l'opérateur
helm install cnpg cnpg/cloudnative-pg \
  --namespace cnpg-system \
  --create-namespace

# Vérifier
kubectl get pods -n cnpg-system
```

#### 5.3 - Déployer le cluster PostgreSQL

`postgres-cluster.yaml` :

```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: odoo-db
  namespace: odoo-v19
spec:
  instances: 3
  
  # Affinity : sur les workers production
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: role
            operator: In
            values: ["production"]
  
  postgresql:
    parameters:
      max_connections: "300"
      shared_buffers: "1GB"
      effective_cache_size: "3GB"
      work_mem: "32MB"
      maintenance_work_mem: "256MB"
      random_page_cost: "1.1"  # SSD
      effective_io_concurrency: "200"
      wal_buffers: "16MB"
      min_wal_size: "2GB"
      max_wal_size: "8GB"
  
  storage:
    storageClass: ceph-rbd
    size: 10Gi
  
  # Haute disponibilité
  minSyncReplicas: 1  # Au moins 1 replica synchrone
  maxSyncReplicas: 2  # Maximum 2 replicas synchrones
  
  # Monitoring
  monitoring:
    enablePodMonitor: true
  
  # Backup (optionnel, configurez votre bucket S3)
  # backup:
  #   barmanObjectStore:
  #     destinationPath: s3://my-bucket/odoo-backups/
  #     s3Credentials:
  #       accessKeyId:
  #         name: s3-creds
  #         key: ACCESS_KEY_ID
  #       secretAccessKey:
  #         name: s3-creds
  #         key: SECRET_ACCESS_KEY
```

Appliquer :

```bash
kubectl apply -f postgres-cluster.yaml

# Surveiller le déploiement
watch kubectl get cluster -n odoo-v19
```

**Attendre que** :
```
NAME      INSTANCES   READY   STATUS                     PRIMARY
odoo-db   3           3       Cluster in healthy state   odoo-db-1
```

#### 5.4 - Récupérer les credentials PostgreSQL

```bash
# Mot de passe de l'utilisateur "app"
kubectl get secret odoo-db-app -n odoo-v19 -o jsonpath='{.data.password}' | base64 -d

# Sauvegarder ce mot de passe !
```

#### 5.5 - Déployer Odoo

`odoo-deployment.yaml` :

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: odoo
  namespace: odoo-v19
spec:
  replicas: 3
  selector:
    matchLabels:
      app: odoo
  template:
    metadata:
      labels:
        app: odoo
    spec:
      # Affinity : sur les workers production
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: role
                operator: In
                values: ["production"]
        # Anti-affinity : répartir les pods sur différents nœuds
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values: ["odoo"]
              topologyKey: kubernetes.io/hostname
      
      securityContext:
        fsGroup: 101
      
      containers:
      - name: odoo
        image: odoo:19.0
        args:
          - "--"
          - "-d"
          - "app"
          - "-i"
          - "base"
          - "--data-dir"
          - "/var/lib/odoo"
        
        securityContext:
          allowPrivilegeEscalation: false
          runAsUser: 101
          capabilities:
            drop: ["ALL"]
        
        env:
          - name: HOST
            value: "odoo-db-rw"
          - name: USER
            value: "app"
          - name: PASSWORD
            valueFrom:
              secretKeyRef:
                name: odoo-db-app
                key: password
          - name: HOME
            value: "/var/lib/odoo"
          - name: XDG_DATA_HOME
            value: "/var/lib/odoo/.local/share"
          - name: XDG_CONFIG_HOME
            value: "/var/lib/odoo/.config"
        
        ports:
        - containerPort: 8069
          name: http
        
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
        
        volumeMounts:
        - name: odoo-data
          mountPath: /var/lib/odoo
        
        livenessProbe:
          httpGet:
            path: /web/database/selector
            port: 8069
          initialDelaySeconds: 60
          periodSeconds: 30
        
        readinessProbe:
          httpGet:
            path: /web/database/selector
            port: 8069
          initialDelaySeconds: 30
          periodSeconds: 10
      
      volumes:
      - name: odoo-data
        persistentVolumeClaim:
          claimName: odoo-data-pvc
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: odoo-data-pvc
  namespace: odoo-v19
spec:
  accessModes:
    - ReadWriteMany  # Partagé entre les 3 pods
  storageClassName: cephfs  # CephFS pour RWX
  resources:
    requests:
      storage: 20Gi
---
apiVersion: v1
kind: Service
metadata:
  name: odoo
  namespace: odoo-v19
spec:
  type: LoadBalancer
  selector:
    app: odoo
  ports:
  - port: 80
    targetPort: 8069
    name: http
```

Appliquer :

```bash
kubectl apply -f odoo-deployment.yaml

# Surveiller
watch kubectl get pods -n odoo-v19
```

#### 5.6 - Exposer Odoo (Ingress)

`odoo-ingress.yaml` :

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: odoo-ingress
  namespace: odoo-v19
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - odoo.example.com
    secretName: odoo-tls
  rules:
  - host: odoo.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: odoo
            port:
              number: 80
```

Appliquer :

```bash
kubectl apply -f odoo-ingress.yaml
```

### ✅ Validation

```bash
# Vérifier les pods Odoo
kubectl get pods -n odoo-v19 -l app=odoo

# Résultat attendu : 3 pods Running

# Vérifier le cluster PostgreSQL
kubectl cnpg status odoo-db -n odoo-v19

# Résultat attendu :
# Primary: odoo-db-1
# Standby: odoo-db-2, odoo-db-3
# Status: Cluster in healthy state

# Tester l'accès
curl https://odoo.example.com

# Ou dans le navigateur : https://odoo.example.com
```

#### Test de failover PostgreSQL

```bash
# Supprimer le PRIMARY
kubectl delete pod odoo-db-1 -n odoo-v19

# Observer la promotion (10-15 secondes)
watch kubectl get pods -n odoo-v19 -l cnpg.io/cluster=odoo-db

# Vérifier le nouveau PRIMARY
kubectl cnpg status odoo-db -n odoo-v19

# Odoo devrait continuer à fonctionner sans interruption !
```

---

## 📅 Phase 6 : Observabilité

### 🎯 Objectif

Mettre en place une **stack complète d'observabilité** :
- **Prometheus** : Collecte de métriques
- **Thanos** : Stockage long terme
- **Grafana** : Visualisation
- **Loki** : Logs centralisés
- **Alertmanager** : Gestion des alertes

### 📋 Installation rapide

```bash
# Installer kube-prometheus-stack
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set prometheus.prometheusSpec.retention=30d \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.storageClassName=ceph-rbd \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=50Gi \
  --set grafana.adminPassword=VotreMotDePasseSecurise

# Installer Loki
helm install loki grafana/loki-stack \
  --namespace monitoring \
  --set loki.persistence.enabled=true \
  --set loki.persistence.storageClassName=ceph-rbd \
  --set loki.persistence.size=50Gi

# Accéder à Grafana
kubectl port-forward -n monitoring svc/kube-prometheus-stack-grafana 3000:80
# http://localhost:3000 (admin / VotreMotDePasseSecurise)
```

**Dashboards recommandés** :
- CloudNativePG : ID 20417
- Kubernetes Cluster : ID 15760
- Cilium : ID 16611

---

## 📅 Phase 7 : SIEM et sécurité avancée

### 🎯 Objectif

Déployer les outils de **détection et réponse** :
- **Wazuh** : HIDS (détection sur les nœuds)
- **Graylog** : Centralisation des logs
- **Suricata** : NIDS (déjà sur OPNsense)

### 📋 Installation

```bash
# Wazuh
helm repo add wazuh https://wazuh.github.io/wazuh-kubernetes
helm install wazuh wazuh/wazuh \
  --namespace security \
  --create-namespace

# Graylog
helm repo add graylog https://helm.graylog.org/
helm install graylog graylog/graylog \
  --namespace security \
  --set mongodb.persistence.storageClass=ceph-rbd \
  --set elasticsearch.persistence.storageClass=ceph-rbd
```

---

## ✅ Checklist de validation finale

### Infrastructure réseau

- [ ] VLANs 10, 20, 30, 40 créés et fonctionnels
- [ ] OPNsense déployé et configuré
- [ ] Suricata actif et mis à jour
- [ ] VPN WireGuard fonctionnel
- [ ] Bastion NixOS accessible avec MFA

### Kubernetes

- [ ] 3 masters en état Ready
- [ ] 4 workers en état Ready
- [ ] Workers correctement labellisés (production/monitoring)
- [ ] Cilium installé et fonctionnel
- [ ] Ceph CSI installé et StorageClass créée

### Odoo + PostgreSQL

- [ ] CloudNativePG Operator installé
- [ ] Cluster PostgreSQL avec 3 instances
- [ ] Toutes les instances PostgreSQL en healthy state
- [ ] Test de failover réussi
- [ ] Odoo déployé avec 3 replicas
- [ ] Tous les pods Odoo en Running
- [ ] Odoo accessible via https://
- [ ] Test de charge réussi

### Observabilité

- [ ] Prometheus collecte les métriques
- [ ] Grafana accessible avec dashboards
- [ ] Loki collecte les logs
- [ ] Alertmanager configuré

### Sécurité

- [ ] Wazuh déployé
- [ ] Graylog déployé
- [ ] Logs centralisés
- [ ] Alertes de sécurité actives

---

## 🎓 Récapitulatif pédagogique

### Ce que vous avez construit

```
🏗️ Une infrastructure complète de production :

Couche 0 : Réseau isolé (VLANs)
├─ Management (10.10.10.0/24)
├─ Kubernetes (10.20.20.0/24)
├─ Ceph (10.30.30.0/24)
└─ Monitoring (10.40.40.0/24)

Couche 1 : Sécurité périmétrique
├─ OPNsense (Firewall + IDS/IPS)
└─ VPN WireGuard

Couche 2 : Accès sécurisé
└─ Bastion NixOS (MFA)

Couche 3 : Stockage distribué
└─ Ceph (réplication 3x)

Couche 4 : Orchestration
├─ 3 Masters Kubernetes (HA)
├─ 4 Workers (2 prod + 2 monitoring)
├─ Cilium (CNI)
└─ Ceph CSI

Couche 5 : SIEM
├─ Wazuh (HIDS)
├─ Graylog (Logs)
└─ Suricata (NIDS)

Couche 6 : Observabilité
├─ Prometheus
├─ Grafana
├─ Thanos
└─ Loki

Couche 7 : Applicatif
├─ Odoo 19 (3 replicas)
└─ PostgreSQL 18 (CloudNativePG, 3 instances HA)
```

### Principes appliqués

1. **Defense in Depth** : Multiples couches de sécurité
2. **High Availability** : Redondance à tous les niveaux
3. **Zero Trust** : Vérification à chaque étape
4. **Infrastructure as Code** : Terraform + Ansible
5. **Observability** : Visibilité totale
6. **Isolation** : Segmentation réseau stricte

### Temps estimé par phase

| Phase | Temps | Complexité |
|-------|-------|------------|
| Phase 1 : SDN | 2h | ⭐⭐ |
| Phase 2 : OPNsense | 3h | ⭐⭐⭐ |
| Phase 3 : Bastion | 2h | ⭐⭐ |
| Phase 4 : Kubernetes | 4h | ⭐⭐⭐⭐ |
| Phase 5 : Odoo + DB | 2h | ⭐⭐ |
| Phase 6 : Observabilité | 2h | ⭐⭐ |
| Phase 7 : SIEM | 3h | ⭐⭐⭐ |
| **TOTAL** | **18h** | **~2-3 jours** |

---

## 📚 Ressources complémentaires

### Documentation officielle

- [Kubernetes](https://kubernetes.io/docs/)
- [CloudNativePG](https://cloudnative-pg.io/)
- [Cilium](https://docs.cilium.io/)
- [Ceph](https://docs.ceph.com/)
- [OPNsense](https://docs.opnsense.org/)
- [Odoo](https://www.odoo.com/documentation/)

### Guides avancés

- [Proxmox SDN](https://pve.proxmox.com/wiki/Software_Defined_Network)
- [Kubernetes the Hard Way](https://github.com/kelseyhightower/kubernetes-the-hard-way)
- [CloudNativePG Best Practices](https://cloudnative-pg.io/documentation/current/cloudnative-pg.v1/#postgresql-cnpg-io-v1-Cluster)

---

**Félicitations ! Vous avez maintenant une infrastructure production-ready pour Odoo 19 ! 🎉**
