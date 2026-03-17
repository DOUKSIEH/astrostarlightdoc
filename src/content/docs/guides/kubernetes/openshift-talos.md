---
title: "🚀 OpenShift vs Talos : Choisir sa plateforme Kubernetes et déployer Odoo 19 + PostgreSQL 17"
description: "Guide pédagogique complet pour Choisir sa plateforme Kubernetes (OpenShift vs Talos)"
created: "2026-03-13"
#updated: "2026-02-02"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"

---

<!-- # 🚀 OpenShift vs Talos : Choisir sa plateforme Kubernetes et déployer Odoo 19 + PostgreSQL 17 -->

> **À qui s'adresse ce guide ?**
> Ce document s'adresse à un public hétérogène : développeurs, administrateurs systèmes, managers techniques, architectes cloud et décideurs. Les concepts sont introduits avec des analogies concrètes avant d'entrer dans les détails techniques. Vous pouvez lire chaque section indépendamment selon votre besoin.

---

## Table des matières

1. [Le contexte : pourquoi ce choix est important ?](#1-le-contexte--pourquoi-ce-choix-est-important-)
2. [Comprendre Kubernetes en 2 minutes](#2-comprendre-kubernetes-en-2-minutes)
3. [OpenShift — La plateforme entreprise tout-en-un](#3-openshift--la-plateforme-entreprise-tout-en-un)
4. [Talos — L'OS minimaliste conçu pour Kubernetes](#4-talos--los-minimaliste-conçu-pour-kubernetes)
5. [Comparaison détaillée : OpenShift vs Talos](#5-comparaison-détaillée--openshift-vs-talos)
6. [Déployer Odoo 19 + PostgreSQL 17 sur OpenShift](#6-déployer-odoo-19--postgresql-17-sur-openshift)
7. [Déployer Odoo 19 + PostgreSQL 17 sur Talos](#7-déployer-odoo-19--postgresql-17-sur-talos)
8. [Gestion des incidents et haute disponibilité](#8-gestion-des-incidents-et-haute-disponibilité)
9. [Bonnes pratiques de sécurité](#9-bonnes-pratiques-de-sécurité)
10. [Conclusion et arbre de décision](#10-conclusion-et-arbre-de-décision)
11. [Ressources utiles](#11-ressources-utiles)

---

## 1. Le contexte : pourquoi ce choix est important ?

### L'analogie de la cuisine

Imaginez que vous devez ouvrir un restaurant :

- **Option A — Cuisine clé en main** : Vous louez une cuisine entièrement équipée. Tout est déjà installé : fours, hottes, plans de travail, ventilation. Vous payez plus cher, mais vous cuisinez dès le premier jour. Si quelque chose tombe en panne, un technicien est inclus dans le contrat. → C'est **OpenShift**.

- **Option B — Cuisine à construire** : Vous achetez les murs vides et choisissez vous-même chaque équipement, exactement adapté à votre cuisine. C'est moins cher, totalement personnalisé, mais vous devez savoir ce que vous faites. En cas de panne, vous réparez vous-même. → C'est **Talos**.

Les deux approches sont valides. Le bon choix dépend de votre équipe, de votre budget et de vos contraintes.

### Les questions à se poser avant de choisir

```
┌─────────────────────────────────────────────────────────────┐
│  1. Mon équipe est-elle expérimentée sur Kubernetes ?       │
│  2. Ai-je besoin d'un support professionnel 24h/24 ?        │
│  3. Mon budget permet-il des licences commerciales ?        │
│  4. Ai-je besoin d'une conformité réglementaire (ISO, SOC)?│
│  5. Veux-je contrôler chaque composant de mon infra ?       │
└─────────────────────────────────────────────────────────────┘
```

Les réponses guideront naturellement vers l'une ou l'autre solution.

---

## 2. Comprendre Kubernetes en 2 minutes

Avant de parler d'OpenShift et Talos, il faut comprendre ce qu'est Kubernetes — la technologie sur laquelle les deux s'appuient.

### L'analogie de l'hôtel

Un **conteneur** c'est une chambre d'hôtel : un espace isolé, standardisé, avec tout le nécessaire à l'intérieur (votre application + ses dépendances).

**Kubernetes** c'est le gestionnaire de l'hôtel :
- Il sait quelles chambres sont disponibles
- Il place les clients (applications) dans les bonnes chambres
- Si une chambre a un problème, il déplace le client dans une autre automatiquement
- Il peut ouvrir de nouvelles ailes si l'affluence augmente (scaling)

### Architecture Kubernetes de base

```
                    ┌──────────────────────────────────────────────┐
                    │            PLAN DE CONTRÔLE                  │
                    │  ┌────────────┐  ┌───────┐  ┌────────────┐  │
                    │  │ API Server │  │ etcd  │  │ Scheduler  │  │
                    │  │ (entrée)   │  │(état) │  │ (placement)│  │
                    │  └────────────┘  └───────┘  └────────────┘  │
                    └───────────────────┬──────────────────────────┘
                                        │ ordres
                    ┌───────────────────▼──────────────────────────┐
                    │              NŒUDS DE TRAVAIL                │
                    │  ┌──────────────┐    ┌──────────────────┐    │
                    │  │   Nœud 1     │    │     Nœud 2       │    │
                    │  │ ┌──────────┐ │    │ ┌──────────────┐ │    │
                    │  │ │  Pod A   │ │    │ │    Pod C     │ │    │
                    │  │ │ (app)    │ │    │ │   (app)      │ │    │
                    │  │ └──────────┘ │    │ └──────────────┘ │    │
                    │  │ ┌──────────┐ │    │ ┌──────────────┐ │    │
                    │  │ │  Pod B   │ │    │ │    Pod D     │ │    │
                    │  │ │ (app)    │ │    │ │   (app)      │ │    │
                    │  │ └──────────┘ │    │ └──────────────┘ │    │
                    │  └──────────────┘    └──────────────────┘    │
                    └──────────────────────────────────────────────┘
                                        ▲
                               kubectl / oc
                              (vos commandes)
```

**OpenShift** et **Talos** sont deux façons différentes de faire fonctionner Kubernetes. La même application peut tourner sur l'un ou l'autre sans modification des manifests YAML.

---

## 3. OpenShift — La plateforme entreprise tout-en-un

### Présentation

**OpenShift** est développé par **Red Hat** (filiale d'IBM). C'est une distribution Kubernetes enrichie d'une couche d'outils professionnels intégrés : interface graphique, sécurité renforcée, outils CI/CD, monitoring, gestion des certificats…

Lancée en 2011 comme simple PaaS, OpenShift a basculé vers Kubernetes en 2015 avec sa version 3. Depuis OpenShift 4 (2019), la plateforme est entièrement gérée via des **opérateurs** — des programmes qui automatisent les tâches complexes à votre place.

Il existe aussi **OKD**, la version 100 % open-source et gratuite d'OpenShift, idéale pour s'entraîner avant de passer à la version commerciale.

### Architecture OpenShift — Vue en couches

```
┌────────────────────────────────────────────────────────────────────┐
│               OpenShift Container Platform (Red Hat)               │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  RHCOS — Red Hat CoreOS (OS immutable dédié)                 │  │
│  │  Mis à jour automatiquement par MachineConfigOperator        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ▼                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Kubernetes (orchestration)                                  │  │
│  │  API Server · Scheduler · etcd · Controller Manager         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ▼                                     │
│  ┌──────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐  │
│  │  Sécurité    │ │  Registry   │ │  CI/CD      │ │Observabil.│  │
│  │  SELinux     │ │  Intégré    │ │  Tekton     │ │Prometheus │  │
│  │  RBAC / SCC  │ │  Quay.io   │ │  ArgoCD     │ │Grafana    │  │
│  │  Clair/Quay  │ │ImageStreams │ │  S2I        │ │ELK Stack  │  │
│  └──────────────┘ └─────────────┘ └─────────────┘ └───────────┘  │
│                              ▼                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  OperatorHub — catalogue d'opérateurs certifiés              │  │
│  │  CNPG · CrunchyData · Redis · Kafka · Vault · Velero · …   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ▼                                     │
│  ┌─────────────────────────────┐  ┌───────────────────────────┐   │
│  │  Vos applications           │  │  Réseau & exposition       │   │
│  │  Odoo 19 (2 réplicas)       │  │  Routes HTTPS (cert auto)  │   │
│  │  PostgreSQL CNPG (3 nœuds)  │  │  SDN OVN-Kubernetes       │   │
│  └─────────────────────────────┘  └───────────────────────────┘   │
│                              ▼                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Infrastructure (bare-metal · AWS · Azure · GCP · VMware)    │  │
│  │  Abstrait par OpenShift — même API partout                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
                           Support Red Hat 24h/24
```

> **Lecture du schéma :** Chaque couche est préinstallée et intégrée. Vous ne choisissez pas les composants — Red Hat les a déjà sélectionnés, certifiés et assemblés pour vous. C'est la force et la limite d'OpenShift à la fois.

### Ce qu'OpenShift apporte de plus que Kubernetes seul

```
Kubernetes seul          OpenShift (Kubernetes +)
─────────────────        ─────────────────────────────────────
Orchestration pods   →   + Console web intuitive (point-and-click)
Networking de base   →   + Routes HTTPS avec certificats automatiques
Pas de registre      →   + Registre d'images intégré (Quay)
Sécurité basique     →   + SELinux, RBAC, SCC avancés
Pas de CI/CD         →   + Tekton Pipelines + ArgoCD inclus
Monitoring manuel    →   + Prometheus + Grafana préinstallés
Opérateurs à trouver →   + OperatorHub avec catalogue certifié
```

### Avantages détaillés

**🔒 Sécurité renforcée**

- Intégration native avec **SELinux** — isolation des processus au niveau OS
- **RBAC** (Role-Based Access Control) : chaque utilisateur n'a accès qu'à ce dont il a besoin
- **Security Context Constraints (SCC)** : empêche les conteneurs de s'exécuter en root par défaut
- Scan de vulnérabilités des images via **Clair** ou **Quay**

**🛠️ Tout est intégré**

- Pas besoin d'installer séparément un registry, un pipeline CI/CD, un système de monitoring
- Interface web (console OpenShift) accessible même pour des équipes non expertes en ligne de commande
- OperatorHub : une marketplace pour installer des bases de données, outils de backup, etc. en quelques clics

**📞 Support professionnel**

- Red Hat propose un support 24/7 avec des SLA définis
- Indispensable pour les environnements critiques où une panne est inacceptable

### Limites

| Limite | Détail |
|---|---|
| **Coût** | Les licences Red Hat peuvent représenter un budget significatif. OKD est gratuit mais sans support. |
| **Complexité** | L'installation et la configuration initiales sont plus lourdes qu'une distribution Kubernetes standard |
| **Ressources** | OpenShift consomme plus de CPU/RAM qu'une distribution légère |
| **Rigidité** | Certains comportements sont imposés par Red Hat (ex. interdiction de tourner en root) |

### Vulnérabilités et risques à connaître

```
Risque                   Description                        Mitigation
─────────────────────    ──────────────────────────────────  ─────────────────────────────
Images non patchées      CVE dans les images de base         Scanner régulièrement avec Clair/Quay
Config par défaut        Certains SCC trop permissifs        Audit régulier des SCC
Attaque supply chain     Compromission d'un opérateur        Vérifier les signatures des images
Menaces internes         Utilisateur avec trop de droits     Principe du moindre privilège
```

### Installation rapide sur un seul nœud (pour tester)

OpenShift propose une installation guidée depuis sa console cloud. Voici les prérequis minimaux :

| Ressource | Minimum requis | Recommandé |
|---|---|---|
| vCPU | 8 cœurs | 12+ cœurs |
| RAM | 16 Go | 32 Go |
| Disque | 120 Go | 200 Go SSD |
| Réseau | IP fixe ou DHCP réservée | Accès internet direct |

```bash
# 1. Installer le client oc (OpenShift CLI)
wget https://mirror.openshift.com/pub/openshift-v4/x86_64/clients/ocp/stable/openshift-client-linux.tar.gz
tar xvfz openshift-client-linux.tar.gz
chmod +x oc
mv oc ~/.local/bin/

# Vérifier l'installation
oc version
# Client Version: 4.14.x

# 2. Après installation du cluster, configurer l'accès
cp kubeconfig ~/.kube/ocp.yml
export KUBECONFIG=~/.kube/ocp.yml

# 3. Vérifier l'état du cluster
oc get nodes
# NAME                STATUS   ROLES                         AGE
# mon-cluster.local   Ready    control-plane,master,worker   2h
```

> **💡 Pour tester chez soi :** Un mini-PC avec 16 Go de RAM (type Minisforum, Intel NUC) suffit pour un cluster mono-nœud OpenShift. C'est idéal pour se former sans infrastructure cloud.

---

## 4. Talos — L'OS minimaliste conçu pour Kubernetes

### Présentation

**Talos** est un système d'exploitation (OS) Linux conçu spécifiquement et uniquement pour faire tourner Kubernetes. Là où OpenShift est une plateforme complète, Talos est un OS épuré au maximum.

### L'analogie de la voiture de course

Un OS traditionnel (Ubuntu, CentOS…) c'est comme une voiture familiale : polyvalente, avec plein d'options, mais pas optimisée pour une seule tâche.

**Talos** c'est une voiture de course : elle n'a que ce qu'il faut pour aller vite et en sécurité. Pas de siège arrière, pas de coffre, pas de radio — mais elle est légère, rapide et fiable.

Concrètement :
- **Pas de shell SSH** : on ne peut pas se connecter en ligne de commande classique. Tout passe par une API gRPC.
- **Système de fichiers en lecture seule (immutable)** : personne ne peut modifier l'OS en cours d'exécution, même avec les droits root.
- **Surface d'attaque minimale** : moins il y a de code, moins il y a de façons d'attaquer le système.

### Architecture Talos — Vue en couches

```
┌────────────────────────────────────────────────────────────────────┐
│            Talos Linux — plateforme Kubernetes minimaliste         │
│                                                                    │
│  ┌─────────────────────────────────────┐  ┌─────────────────────┐ │
│  │  Talos OS (Linux immutable)         │  │  Sécurité by design │ │
│  │  Lecture seule — zéro modification  │  │  Système fichiers   │ │
│  │  Pas de SSH — accès via API gRPC    │  │  read-only          │ │
│  │  Surface d'attaque minimale         │  │  mTLS API           │ │
│  └─────────────────────────────────────┘  └─────────────────────┘ │
│                              ▼                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Kubernetes (orchestration)                                  │  │
│  │  API Server · Scheduler · etcd · Controller Manager         │  │
│  │  Identique à tout cluster K8s standard                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ▼                                     │
│          ┌── Composants que VOUS choisissez librement ──┐          │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌────────┐ │
│  │   Stockage    │ │    Réseau     │ │ Observabilité │ │GitOps  │ │
│  │   Longhorn    │ │ Cilium (CNI)  │ │  Prometheus   │ │ArgoCD  │ │
│  │  Rook-Ceph   │ │  Flannel      │ │  Grafana      │ │Flux    │ │
│  │  OpenEBS     │ │  MetalLB      │ │  Loki         │ │Vault   │ │
│  │  local-path  │ │  NGINX Ingress│ │  Alertmanager │ │Sealed  │ │
│  └───────────────┘ └───────────────┘ └───────────────┘ └────────┘ │
│                              ▼                                     │
│  ┌─────────────────────────────┐  ┌───────────────────────────┐   │
│  │  Vos applications           │  │  Administration           │   │
│  │  Odoo 19 (2 réplicas)       │  │  talosctl (API gRPC)      │   │
│  │  PostgreSQL CNPG (3 nœuds)  │  │  kubectl (K8s standard)   │   │
│  └─────────────────────────────┘  └───────────────────────────┘   │
│                              ▼                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Infrastructure (bare-metal · cloud · edge · Raspberry Pi)   │  │
│  │  Aucune dépendance propriétaire · Déploiement déclaratif Git │  │
│  │  Mise à jour atomique : succès complet ou rollback auto      │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

> **Lecture du schéma :** Contrairement à OpenShift, la zone "composants à choisir" est entièrement ouverte. Vous choisissez Longhorn ou Rook-Ceph pour le stockage, Cilium ou Flannel pour le réseau, etc. Cette liberté est à double tranchant : plus de flexibilité, plus de responsabilité.

### Ce que "immutable" signifie en pratique

```
OS traditionnel (Ubuntu)         OS Talos (immutable)
──────────────────────────        ──────────────────────────────────
Peut être modifié à chaud    →   Lecture seule : zéro modification possible
SSH disponible (port 22)     →   Pas de SSH, accès API gRPC uniquement
Packages installables        →   Aucun package additionnel possible
Diffs de config au fil du    →   Tout est déclaratif, versionné dans Git
  temps (configuration drift)
Mise à jour risquée          →   Mise à jour atomique (succès ou rollback)
```

### Avantages détaillés

**🔐 Sécurité maximale par conception**

L'absence de shell et le système immutable ne sont pas des limitations : ce sont des **choix de conception délibérés**. Un attaquant qui compromet un conteneur ne peut pas "sortir" vers l'OS et y installer des outils malveillants, car il n'y a rien à modifier.

**💰 Zéro coût de licence**

Talos est entièrement open-source. La société Sidero Labs propose un support commercial optionnel, mais la plateforme elle-même est gratuite.

**🔧 Contrôle total**

Chaque composant de votre stack est choisi par vous : stockage, réseau, ingress controller, monitoring. Pas de composants imposés, pas de lock-in.

**⚡ Légèreté et performance**

L'empreinte mémoire de Talos est significativement inférieure à celle d'OpenShift, ce qui laisse plus de ressources disponibles pour vos applications.

### Limites

| Limite | Détail |
|---|---|
| **Courbe d'apprentissage** | Sans shell ni interface graphique, le débogage est moins intuitif pour les équipes juniors |
| **Tout est à configurer** | Stockage, réseau, ingress : rien n'est préinstallé, tout est à choisir et assembler |
| **Support communautaire** | Pas de hotline professionnelle — la résolution d'incidents repose sur votre équipe et la communauté |
| **Gestion des secrets** | Aucune solution intégrée : il faut ajouter Vault, Sealed Secrets ou External Secrets Operator |

### Vulnérabilités et risques à connaître

```
Risque                   Description                        Mitigation
─────────────────────    ──────────────────────────────────  ─────────────────────────────
Erreurs de config        Pas de garde-fou automatique        Revues de config systématiques
API exposée              Accès non sécurisé à l'API Talos    Certificats mTLS + réseau privé
Dépendances tierces      Chaque composant ajouté = risque    SBOM + scan de vulnérabilités
Pas de shell = debug dur Incident difficile à diagnostiquer  Monitoring robuste obligatoire
```

---

## 5. Comparaison détaillée : OpenShift vs Talos

### Vue architecturale côte à côte

```
OPENSHIFT                               TALOS
──────────────────────────────────      ──────────────────────────────────
┌────────────────────────────────┐      ┌────────────────────────────────┐
│         Red Hat                │      │     Votre choix                │
│  Console web · CI/CD · Quay    │      │  ArgoCD · Grafana · Vault …   │
├────────────────────────────────┤      ├────────────────────────────────┤
│      OperatorHub certifié      │      │   Helm Charts / OperatorHub    │
├────────────────────────────────┤      ├────────────────────────────────┤
│         Kubernetes             │      │         Kubernetes             │
├────────────────────────────────┤      ├────────────────────────────────┤
│  RHCOS (OS immutable Red Hat)  │      │  Talos OS (immutable minimal)  │
├────────────────────────────────┤      ├────────────────────────────────┤
│  AWS · Azure · GCP · VMware    │      │  N'importe quelle machine      │
└────────────────────────────────┘      └────────────────────────────────┘
  Support Red Hat (payant)                Support communauté (gratuit)
```

### Tableau comparatif global

| Critère | OpenShift | Talos |
|---|---|---|
| **Type** | Plateforme Kubernetes entreprise | OS minimaliste pour Kubernetes |
| **Complexité** | Élevée (mais guidée, interface web) | Faible OS, mais stack à assembler |
| **Sécurité** | Très bonne (outils intégrés) | Excellente (immutable par design) |
| **Support** | Professionnel Red Hat (SLA) | Communauté + Sidero Labs optionnel |
| **Coût** | Licences Red Hat | Gratuit (open source) |
| **Stockage** | CSI drivers intégrés | À installer (Longhorn, Rook-Ceph…) |
| **Base de données** | Opérateurs natifs (CNPG, CrunchyData) | Opérateurs externes (CNPG, Zalando) |
| **Flexibilité** | Limitée (choix imposés par Red Hat) | Totale (aucun lock-in) |
| **Interface graphique** | Console web complète | Aucune native (Rancher, Lens en option) |
| **Monitoring** | Prometheus + Grafana inclus | À installer (kube-prometheus-stack) |
| **Idéal pour** | Entreprises, équipes mixtes | Équipes expérimentées, cloud/edge |
| **RTO/RPO** | Facile avec outils intégrés | Requiert une bonne automatisation |

### Comparaison par profil d'équipe

```
Vous êtes une startup de 5 développeurs ?
└── → Talos : moins cher, plus léger, contrôle total

Vous êtes une DSI de 500 personnes avec un audit annuel ?
└── → OpenShift : support, conformité, traçabilité intégrés

Vous déployez sur des sites industriels isolés (edge) ?
└── → Talos : empreinte minimale, pas de dépendances cloud

Vous migrez depuis un hébergement classique sans expertise K8s ?
└── → OpenShift : plus proche de l'expérience "serveur géré"

Vous avez une équipe SRE expérimentée qui veut tout contrôler ?
└── → Talos : liberté totale de la stack
```

---

## 6. Déployer Odoo 19 + PostgreSQL 17 sur OpenShift

### Qu'est-ce qu'Odoo et CNPG ?

**Odoo 19** est un ERP open source complet (gestion commerciale, comptabilité, RH, stocks…). C'est l'application que nous voulons déployer de façon résiliente.

**CloudNativePG (CNPG)** est un opérateur Kubernetes qui gère PostgreSQL de façon native : création automatique de clusters, réplication synchrone, sauvegardes continues, bascule automatique en cas de panne.

### Architecture cible du déploiement

```
                        ┌─────────────────┐
        Internet ──────►│  Route HTTPS    │  (OpenShift : certificat automatique)
                        └────────┬────────┘
                                 │
                        ┌────────▼────────────────────────────────┐
                        │    Service Kubernetes (load balancer)    │
                        └──────┬──────────────────────┬───────────┘
                               │                      │
                    ┌──────────▼──────┐    ┌──────────▼──────┐
                    │   Pod Odoo #1   │    │   Pod Odoo #2   │
                    │   PORT 8069     │    │   PORT 8069     │
                    └──────────┬──────┘    └──────────┬──────┘
                               │    se connectent à   │
                               └──────────┬───────────┘
                                          │
                    ┌─────────────────────▼──────────────────────┐
                    │     Services CNPG (créés automatiquement)   │
                    │  odoo-db-rw  │  odoo-db-ro  │  odoo-db-r   │
                    │  (R+W)       │  (lecture)   │  (tous)      │
                    └───────────────────┬────────────────────────┘
                                        │
                    ┌───────────────────▼────────────────────────┐
                    │      Cluster PostgreSQL 17 (CNPG)           │
                    │  ┌──────────────┐  ┌──────────────────────┐│
                    │  │  Primaire    │──►│  Réplica 1           ││
                    │  │  (R+W)       │  │  (synchro temps réel)││
                    │  └──────────────┘  └──────────────────────┘│
                    │                    ┌──────────────────────┐ │
                    │                    │  Réplica 2           │ │
                    │                    │  (synchro temps réel)│ │
                    │                    └──────────────────────┘ │
                    └───────────────────┬────────────────────────┘
                                        │ WAL continu + snapshots
                                        ▼
                              ┌─────────────────┐
                              │  Backup S3      │
                              │  (30 jours)     │
                              └─────────────────┘
```

> **Pourquoi 3 services CNPG ?** CNPG crée automatiquement 3 points d'entrée distincts :
> - `odoo-db-rw` → toujours le **primaire** (lectures + écritures) — c'est celui qu'utilise Odoo
> - `odoo-db-ro` → les **réplicas** (lectures seules) — utile pour les outils de reporting
> - `odoo-db-r` → **tous les nœuds** — pour des cas d'usage avancés

### Prérequis

- Un cluster OpenShift opérationnel (ou OKD pour tester)
- L'opérateur CloudNativePG installé depuis l'**OperatorHub**
- Un bucket S3 (ou compatible : MinIO, OVH Object Storage…) pour les sauvegardes
- Un namespace dédié et les secrets nécessaires

### Étape 0 — Préparer les secrets et le namespace

```bash
# Créer le namespace dédié
oc new-project odoo-production

# Créer le secret pour la base de données et les sauvegardes S3
oc create secret generic odoo-db-secret \
  --from-literal=username=odoo \
  --from-literal=password=MonMotDePasseSecurisé123! \
  --from-literal=AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE \
  --from-literal=AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY \
  -n odoo-production

# Vérifier que le secret est créé
oc get secret odoo-db-secret -n odoo-production
```

### Étape 1 — Déployer PostgreSQL 17 avec CNPG

```yaml
# cluster-postgres.yaml
# Ce fichier décrit un cluster PostgreSQL haute disponibilité :
# 3 instances (1 primaire + 2 réplicas) avec sauvegardes automatiques S3

apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: odoo-db
  namespace: odoo-production
spec:
  # 1 primaire + 2 réplicas : bascule automatique si le primaire tombe
  instances: 3

  # Version PostgreSQL cible
  imageName: ghcr.io/cloudnative-pg/postgresql:17

  # Stockage : 10 Go par instance via le CSI driver OpenShift
  storage:
    size: 10Gi
    storageClass: gp2   # ← Spécifique OpenShift/AWS — à adapter selon votre infra

  # Initialisation : créer la base "odoo" avec l'utilisateur "odoo"
  bootstrap:
    initdb:
      database: odoo
      owner: odoo
      secret:
        name: odoo-db-secret

  # Expose des métriques pour Prometheus (monitoring OpenShift intégré)
  monitoring:
    enablePodMonitor: true

  # Sauvegardes automatiques continues vers S3
  backup:
    barmanObjectStore:
      destinationPath: s3://mon-bucket-backups/odoo-db
      s3Credentials:
        accessKeyId:
          name: odoo-db-secret
          key: AWS_ACCESS_KEY_ID
        secretAccessKey:
          name: odoo-db-secret
          key: AWS_SECRET_ACCESS_KEY
    retentionPolicy: "30d"   # Conserver 30 jours de sauvegardes
```

```bash
# Appliquer la configuration
oc apply -f cluster-postgres.yaml

# Suivre la création du cluster en temps réel
oc get cluster odoo-db -n odoo-production -w

# Vérifier que les 3 pods sont démarrés (patience : 3-5 minutes)
oc get pods -n odoo-production -l cnpg.io/cluster=odoo-db

# Résultat attendu :
# NAME        READY   STATUS    RESTARTS   AGE
# odoo-db-1   1/1     Running   0          5m   ← primaire
# odoo-db-2   1/1     Running   0          4m   ← réplica 1
# odoo-db-3   1/1     Running   0          3m   ← réplica 2

# Identifier qui est le primaire
oc get pods -n odoo-production -l cnpg.io/instanceRole=primary
```

### Étape 2 — Déployer Odoo 19

```yaml
# odoo-deployment.yaml
# Déploiement d'Odoo 19 avec 2 réplicas et health checks

apiVersion: apps/v1
kind: Deployment
metadata:
  name: odoo
  namespace: odoo-production
spec:
  # 2 réplicas : si l'un tombe, l'autre continue à servir les requêtes
  replicas: 2
  selector:
    matchLabels:
      app: odoo
  template:
    metadata:
      labels:
        app: odoo
    spec:
      containers:
      - name: odoo
        image: odoo:19.0
        env:
        # Connexion à PostgreSQL via le service CNPG (toujours le primaire)
        - name: HOST
          value: odoo-db-rw
        - name: USER
          value: odoo
        - name: PASSWORD
          valueFrom:
            secretKeyRef:
              name: odoo-db-secret
              key: password
        ports:
        - containerPort: 8069
          name: http
        # Limites de ressources : évite qu'Odoo consomme tout le cluster
        resources:
          requests:
            cpu: "1"       # Minimum garanti
            memory: "2Gi"
          limits:
            cpu: "2"       # Maximum autorisé
            memory: "4Gi"
        # OpenShift redémarre le pod si Odoo ne répond plus à ces sondes
        livenessProbe:
          httpGet:
            path: /web/health
            port: 8069
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /web/health
            port: 8069
          initialDelaySeconds: 30
          periodSeconds: 10
---
# Service : point d'entrée réseau interne vers les pods Odoo
apiVersion: v1
kind: Service
metadata:
  name: odoo
  namespace: odoo-production
spec:
  selector:
    app: odoo
  ports:
  - port: 80
    targetPort: 8069
```

```bash
# Déployer Odoo
oc apply -f odoo-deployment.yaml

# Vérifier le déploiement (attendre que READY soit 2/2)
oc get pods -n odoo-production -l app=odoo
# NAME                   READY   STATUS    RESTARTS   AGE
# odoo-5d8b9f7d4-k2xp9   1/1     Running   0          3m
# odoo-5d8b9f7d4-m7tn1   1/1     Running   0          3m
```

### Étape 3 — Exposer Odoo sur Internet

```bash
# Créer une Route HTTPS (spécifique à OpenShift, certificat automatique Let's Encrypt)
oc create route edge odoo \
  --service=odoo \
  --hostname=odoo.mon-domaine.com \
  --insecure-policy=Redirect \
  -n odoo-production

# Vérifier la route
oc get route odoo -n odoo-production
# NAME   HOST/PORT               PATH   SERVICES   PORT   TERMINATION
# odoo   odoo.mon-domaine.com           odoo       80     edge/Redirect
```

### Étape 4 — Planifier des sauvegardes manuelles

```bash
# Déclencher une sauvegarde manuelle immédiate (avant une mise à jour, par exemple)
cat <<EOF | oc apply -f -
apiVersion: postgresql.cnpg.io/v1
kind: Backup
metadata:
  name: backup-avant-maj-$(date +%Y%m%d)
  namespace: odoo-production
spec:
  cluster:
    name: odoo-db
EOF

# Suivre l'état de la sauvegarde
oc get backup -n odoo-production
# NAME                        PHASE       AGE
# backup-avant-maj-20260301   completed   2m
```

---

## 7. Déployer Odoo 19 + PostgreSQL 17 sur Talos

### Différences clés avec OpenShift

```
OpenShift                          Talos
──────────────────────────────     ────────────────────────────────────
oc apply -f ...               →   kubectl apply -f ...
Route HTTPS (intégrée)        →   Ingress NGINX + cert-manager
storageClass: gp2 (natif)     →   storageClass: longhorn (à installer)
Monitoring inclus             →   kube-prometheus-stack (à installer)
OperatorHub (point-and-click) →   Helm install cnpg/cloudnative-pg
```

La configuration CNPG et Odoo est **presque identique** — c'est l'un des grands avantages de Kubernetes : les manifests sont portables. Les différences portent uniquement sur le stockage et l'exposition du service.

### Prérequis

```bash
# Vérifier l'accès au cluster Talos
talosctl config endpoint 192.168.1.10   # IP d'un nœud control-plane
talosctl health
# message: OK

# Vérifier l'état de Kubernetes
kubectl get nodes
# NAME          STATUS   ROLES           AGE   VERSION
# talos-cp-01   Ready    control-plane   1h    v1.29.0
# talos-w-01    Ready    worker          1h    v1.29.0
# talos-w-02    Ready    worker          1h    v1.29.0

# Vérifier que Longhorn est installé et opérationnel
kubectl get pods -n longhorn-system | grep -c Running
# Doit afficher un nombre > 0

# Installer CNPG si ce n'est pas encore fait
helm repo add cnpg https://cloudnative-pg.github.io/charts
helm upgrade --install cnpg \
  --namespace cnpg-system \
  --create-namespace \
  cnpg/cloudnative-pg
```

### Étape 0 — Préparer les secrets

```bash
kubectl create namespace odoo-production

kubectl create secret generic odoo-db-secret \
  --from-literal=username=odoo \
  --from-literal=password=MonMotDePasseSecurisé123! \
  --from-literal=AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE \
  --from-literal=AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY \
  -n odoo-production
```

### Étape 1 — Déployer PostgreSQL 17 avec CNPG

La configuration est identique à OpenShift, avec un seul changement : la `storageClass`.

```yaml
# cluster-postgres-talos.yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: odoo-db
  namespace: odoo-production
spec:
  instances: 3
  imageName: ghcr.io/cloudnative-pg/postgresql:17
  storage:
    size: 10Gi
    storageClass: longhorn   # ← Longhorn au lieu de gp2 — seule différence avec OpenShift
  bootstrap:
    initdb:
      database: odoo
      owner: odoo
      secret:
        name: odoo-db-secret
  monitoring:
    enablePodMonitor: true
  backup:
    barmanObjectStore:
      destinationPath: s3://mon-bucket-backups/odoo-db
      s3Credentials:
        accessKeyId:
          name: odoo-db-secret
          key: AWS_ACCESS_KEY_ID
        secretAccessKey:
          name: odoo-db-secret
          key: AWS_SECRET_ACCESS_KEY
    retentionPolicy: "30d"
```

```bash
kubectl apply -f cluster-postgres-talos.yaml

# Suivre la création du cluster
kubectl get cluster odoo-db -n odoo-production -w
```

### Étape 2 — Déployer Odoo 19

```yaml
# odoo-deployment-talos.yaml
# Strictement identique à la version OpenShift — c'est la portabilité Kubernetes
apiVersion: apps/v1
kind: Deployment
metadata:
  name: odoo
  namespace: odoo-production
spec:
  replicas: 2
  selector:
    matchLabels:
      app: odoo
  template:
    metadata:
      labels:
        app: odoo
    spec:
      containers:
      - name: odoo
        image: odoo:19.0
        env:
        - name: HOST
          value: odoo-db-rw
        - name: USER
          value: odoo
        - name: PASSWORD
          valueFrom:
            secretKeyRef:
              name: odoo-db-secret
              key: password
        ports:
        - containerPort: 8069
        resources:
          requests:
            cpu: "1"
            memory: "2Gi"
          limits:
            cpu: "2"
            memory: "4Gi"
        livenessProbe:
          httpGet:
            path: /web/health
            port: 8069
          initialDelaySeconds: 60
          periodSeconds: 30
---
apiVersion: v1
kind: Service
metadata:
  name: odoo
  namespace: odoo-production
spec:
  selector:
    app: odoo
  ports:
  - port: 80
    targetPort: 8069
```

```bash
kubectl apply -f odoo-deployment-talos.yaml
```

### Étape 3 — Exposer Odoo avec NGINX Ingress

Sur Talos, il n'y a pas de "Route" OpenShift. On utilise un **Ingress** standard Kubernetes avec NGINX et cert-manager pour les certificats.

```yaml
# odoo-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: odoo
  namespace: odoo-production
  annotations:
    # Redirection automatique HTTP → HTTPS
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    # Certificat TLS automatique via cert-manager (Let's Encrypt)
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - odoo.mon-domaine.com
    secretName: odoo-tls-cert
  rules:
  - host: odoo.mon-domaine.com
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

```bash
kubectl apply -f odoo-ingress.yaml

# Vérifier l'Ingress et l'adresse IP assignée
kubectl get ingress -n odoo-production
# NAME   CLASS   HOSTS                  ADDRESS          PORTS     AGE
# odoo   nginx   odoo.mon-domaine.com   203.0.113.42     80, 443   2m
```

---

## 8. Gestion des incidents et haute disponibilité

### Ce que "haute disponibilité" signifie concrètement

La haute disponibilité (HA) c'est la capacité à **continuer à fonctionner même si une partie du système tombe** — un serveur, un pod, un disque.

```
Sans HA                          Avec HA (notre configuration)
──────────────────────────        ─────────────────────────────────────────
Un seul serveur PostgreSQL   →   3 nœuds (1 primaire + 2 réplicas)
Un seul pod Odoo             →   2 pods Odoo (load balancer entre les deux)
Si ça tombe → panne totale   →   Si un nœud tombe → bascule automatique < 2min
Backup manuel irrégulier     →   WAL continu + snapshot quotidien vers S3
```

### Mécanisme de failover CNPG — de la panne au rétablissement

```
t=0 : PANNE DU PRIMAIRE
      │
      │  Primaire PostgreSQL ne répond plus
      │
t+10s : DÉTECTION
      │
      │  CNPG Operator détecte la panne via les health checks
      │  → Évalue quel réplica est le plus à jour
      │
t+15s : ÉLECTION
      │
      │  CNPG élit Réplica 1 comme nouveau primaire
      │  → Réplica 1 sort du mode lecture seule
      │  → Les services odoo-db-rw sont redirigés vers lui
      │
t+30s à 2min : SERVICE RÉTABLI
      │
      │  Odoo se reconnecte automatiquement via odoo-db-rw
      │  → Réplica 2 commence à se synchroniser avec le nouveau primaire
      │
      ▼
t+quelques minutes : CLUSTER RECONSTITUÉ
        Réplica 2 synchronisé
        Ancien primaire peut rejoindre comme réplica après réparation

┌─────────────────────────────────────────────────────────────────┐
│  Impact utilisateur : erreur ~30s · Aucune perte de données     │
│  grâce à la réplication synchrone (WAL archiving continu)       │
└─────────────────────────────────────────────────────────────────┘
```

### Les indicateurs clés à définir AVANT un incident

| Indicateur | Définition | Notre configuration |
|---|---|---|
| **RTO** (Recovery Time Objective) | Temps maximum pour rétablir le service | < 5 minutes avec CNPG HA |
| **RPO** (Recovery Point Objective) | Quantité maximale de données perdues | < 5 minutes (WAL archiving continu) |
| **SLA** | Taux de disponibilité garanti | 99,9% = max 8h de panne/an |

### Procédure type en cas d'incident

```
INCIDENT DÉTECTÉ
      │
      ▼
1. DÉTECTION (< 1 min)
   Prometheus déclenche une alerte
   PagerDuty / Slack notifie l'équipe de garde
   ─────────────────────────────────────────────
      │
      ▼
2. TRIAGE (< 5 min)
   Quelle est la portée ? (un pod ? un nœud ? tout le cluster ?)
   Quel est l'impact utilisateur concret ?
   ─────────────────────────────────────────────
      │
      ▼
3. CONTAINMENT (< 10 min)
   Isoler le composant défaillant
   Basculer le trafic vers les instances saines
   ─────────────────────────────────────────────
      │
      ▼
4. DIAGNOSTIC
   Analyser logs + métriques
   Identifier la cause racine (pas les symptômes)
   ─────────────────────────────────────────────
      │
      ▼
5. REMÉDIATION
   Corriger ou restaurer depuis backup
   ─────────────────────────────────────────────
      │
      ▼
6. POST-MORTEM (dans les 48h)
   Documenter : quoi, quand, pourquoi, comment éviter
   Mettre à jour les runbooks
```

### Commandes de diagnostic rapide

#### Sur OpenShift

```bash
# Vue d'ensemble immédiate
oc get nodes
oc get pods -n odoo-production
oc get events -n odoo-production --sort-by='.lastTimestamp' | tail -20

# Logs d'Odoo en temps réel
oc logs -f deployment/odoo -n odoo-production

# Logs d'un pod spécifique (avant son crash)
oc logs <nom-du-pod> --previous -n odoo-production

# État détaillé du cluster PostgreSQL
oc get cluster odoo-db -n odoo-production -o yaml | grep -A5 status

# Qui est le primaire PostgreSQL ?
oc get pods -n odoo-production -l cnpg.io/instanceRole=primary

# Forcer une bascule PostgreSQL (si le primaire est défaillant)
oc cnpg promote odoo-db odoo-db-2 -n odoo-production
```

#### Sur Talos

```bash
# Diagnostic OS via l'API Talos (pas de SSH !)
talosctl -n 192.168.1.11 dmesg | tail -50      # Logs kernel du nœud
talosctl -n 192.168.1.11 service               # État des services Talos
talosctl -n 192.168.1.11 memory                # Utilisation mémoire
talosctl -n 192.168.1.11 containers            # Conteneurs en cours

# Kubernetes
kubectl get pods -n odoo-production
kubectl logs -f deployment/odoo -n odoo-production
kubectl describe pod <pod-name> -n odoo-production

# Redémarrer un nœud Talos proprement (drain + reboot)
kubectl drain talos-w-01 --ignore-daemonsets --delete-emptydir-data
talosctl -n 192.168.1.11 reboot
kubectl uncordon talos-w-01
```

### Scénarios d'incidents fréquents et solutions

#### Scénario 1 — Un pod Odoo est en CrashLoopBackOff

```bash
# 1. Identifier l'exit code (indice sur la cause)
kubectl describe pod <pod-odoo> -n odoo-production | grep -A5 "Last State"
# Exit code 137 → OOM Kill → augmenter les limites mémoire
# Exit code 1   → erreur applicative → vérifier logs + connexion BDD
# Exit code 143 → arrêt propre → augmenter initialDelaySeconds

# 2. Lire les logs du pod avant le crash
kubectl logs <pod-odoo> --previous -n odoo-production | tail -50

# 3. Corriger selon le diagnostic
# OOM Kill : augmenter les limites
kubectl set resources deployment/odoo \
  --limits=memory=6Gi -n odoo-production

# Erreur BDD : vérifier la connexion
kubectl exec -it <pod-odoo> -n odoo-production -- \
  psql postgresql://odoo:password@odoo-db-rw/odoo -c "SELECT 1;"
```

#### Scénario 2 — PostgreSQL primaire inaccessible

```bash
# CNPG détecte automatiquement et élit un nouveau primaire
# Surveiller l'élection en temps réel
kubectl get events -n odoo-production --field-selector reason=FailoverStarted -w

# Vérifier qui est le nouveau primaire après bascule
kubectl get pods -n odoo-production -l cnpg.io/instanceRole=primary

# La bascule prend généralement 30s à 2min — aucune intervention nécessaire
```

#### Scénario 3 — Restauration complète depuis sauvegarde (scénario catastrophe)

```bash
# 1. Lister les sauvegardes disponibles
kubectl get backup -n odoo-production

# 2. Créer un nouveau cluster depuis la sauvegarde choisie
cat <<EOF | kubectl apply -f -
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: odoo-db-restored
  namespace: odoo-production
spec:
  instances: 3
  storage:
    size: 10Gi
    storageClass: longhorn   # ou gp2 sur OpenShift
  bootstrap:
    recovery:
      backup:
        name: backup-avant-maj-20260301   # Nom du backup à restaurer
EOF

# 3. Attendre que le cluster soit prêt
kubectl wait --for=condition=Ready cluster/odoo-db-restored \
  -n odoo-production --timeout=600s

# 4. Vérifier l'intégrité des données
kubectl exec -it odoo-db-restored-1 -n odoo-production -- \
  psql -U odoo -c "SELECT count(*) FROM res_partner;"

# 5. Basculer Odoo vers le cluster restauré
kubectl set env deployment/odoo HOST=odoo-db-restored-rw \
  -n odoo-production
```

---

## 9. Bonnes pratiques de sécurité

### Les 6 règles fondamentales (communes aux deux plateformes)

#### Règle 1 — Principe du moindre privilège

Ne donnez à chaque composant que les droits dont il a strictement besoin.

```yaml
# ❌ Trop permissif — à ne jamais faire en production
spec:
  containers:
  - name: odoo
    securityContext:
      runAsUser: 0   # root — ouverture maximale aux attaquants

# ✅ Restrictif — configuration recommandée
spec:
  serviceAccountName: odoo-sa   # ServiceAccount dédié avec droits limités
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 1000
  containers:
  - name: odoo
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop: ["ALL"]
```

#### Règle 2 — Ne jamais stocker de secrets en clair dans les manifests

```yaml
# ❌ En clair dans le YAML — dangereux si commité dans Git
env:
- name: PASSWORD
  value: "MonMotDePasse123!"

# ✅ Référence à un Secret Kubernetes
env:
- name: PASSWORD
  valueFrom:
    secretKeyRef:
      name: odoo-db-secret
      key: password

# ✅✅ Pour aller encore plus loin : chiffrer les secrets dans Git
# avec Sealed Secrets (le fichier peut alors être commité sans risque)
kubeseal --format yaml < odoo-db-secret.yaml > odoo-db-secret-sealed.yaml
```

#### Règle 3 — Scanner les images régulièrement en CI/CD

```bash
# Scanner manuellement avec Trivy (utiliser la v0.69.3+ suite à l'incident mars 2026)
trivy image odoo:19.0

# Intégrer dans GitHub Actions — bloque le pipeline si CVE CRITICAL trouvée
- name: Scanner l'image Odoo
  run: |
    trivy image --exit-code 1 --severity CRITICAL odoo:19.0
```

#### Règle 4 — Limiter les ressources (toujours, sans exception)

Sans limites, un seul pod peut épuiser toutes les ressources du nœud et faire tomber tous les autres services.

```yaml
resources:
  requests:          # Garanti : le pod peut toujours utiliser ça au minimum
    cpu: "500m"      # 0.5 vCPU
    memory: "1Gi"
  limits:            # Maximum : au-delà, le pod est tué (OOM) ou ralenti
    cpu: "2"
    memory: "4Gi"
```

#### Règle 5 — Activer les Network Policies

Par défaut, tous les pods peuvent communiquer entre eux. Isolez vos namespaces :

```yaml
# Autoriser uniquement les pods Odoo à parler à PostgreSQL
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-odoo-to-postgres
  namespace: odoo-production
spec:
  podSelector:
    matchLabels:
      cnpg.io/cluster: odoo-db
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: odoo
    ports:
    - protocol: TCP
      port: 5432
  policyTypes:
  - Ingress
```

#### Règle 6 — Tester les restaurations régulièrement

Une sauvegarde qui n'a jamais été testée n'est pas une sauvegarde.

```bash
#!/bin/bash
# test-restauration.sh — À exécuter mensuellement
echo "=== Test de restauration PostgreSQL ==="

# Créer un namespace de test isolé
kubectl create namespace odoo-restore-test

# Lancer la restauration depuis la dernière sauvegarde
kubectl apply -f restore-test-cluster.yaml -n odoo-restore-test

# Attendre que le cluster soit prêt (max 10 minutes)
kubectl wait --for=condition=Ready cluster/odoo-db-test \
  -n odoo-restore-test --timeout=600s

# Vérifier l'intégrité des données
kubectl exec -it odoo-db-test-1 -n odoo-restore-test -- \
  psql -U odoo -c "SELECT schemaname, tablename FROM pg_tables
                   WHERE schemaname='public' LIMIT 10;"

echo "=== Test terminé — nettoyage ==="
kubectl delete namespace odoo-restore-test
```

### Sécurité spécifique GitHub Actions (leçon de l'incident Trivy — mars 2026)

L'incident Trivy a exposé des failles de configuration CI/CD très répandues. Voici comment s'en prémunir :

#### Éviter le piège "Pwn Request"

```yaml
# ❌ DANGEREUX — exécute le code de l'attaquant avec vos permissions
on:
  pull_request_target:    # ← déclencheur risqué
jobs:
  build:
    steps:
      - uses: actions/checkout@v4   # checkout du fork = code attaquant !

# ✅ SÉCURISÉ — limiter les permissions explicitement
on:
  pull_request_target:
jobs:
  build:
    permissions:
      contents: read   # ← moindre privilège
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.sha }}
```

#### Échapper les expressions dans les workflows

```yaml
# ❌ INJECTION possible via le titre de la PR
- run: echo "Branche: ${{ github.event.pull_request.head.ref }}"

# ✅ Passage par variable d'environnement (échappement automatique)
- env:
    BRANCH_NAME: ${{ github.event.pull_request.head.ref }}
  run: echo "Branche: $BRANCH_NAME"
```

#### Épingler les actions par hash plutôt que par tag

```yaml
# ❌ Un tag peut être déplacé vers un commit malveillant
- uses: actions/checkout@v4

# ✅ Un hash SHA est immuable
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2
```

#### Surveiller le trafic réseau sortant des runners

Des outils comme **Harden-Runner** (StepSecurity) détectent et bloquent les appels vers des domaines non autorisés — exactement ce qu'aurait pu bloquer lors de l'exfiltration du token Trivy.

```yaml
- uses: step-security/harden-runner@v2
  with:
    egress-policy: audit   # ou 'block' en mode strict
    allowed-endpoints: >
      github.com:443
      registry-1.docker.io:443
      ghcr.io:443
```

---

## 10. Conclusion et arbre de décision

### L'arbre de décision

```
Vous devez choisir une plateforme Kubernetes
                    │
                    ▼
    ┌───────────────────────────────────┐
    │ Avez-vous besoin de conformité    │
    │ réglementaire ou d'un support     │
    │ professionnel 24h/24 ?            │
    └───────────┬──────────────┬────────┘
               OUI             NON
                │               │
                ▼               ▼
          OPENSHIFT     Votre équipe maîtrise-t-elle
                         bien Kubernetes ?
                              │         │
                             OUI        NON
                              │         │
                              ▼         ▼
                           TALOS     Commencez par
                                     OKD ou Minikube
                                     pour vous former

┌──────────────────────────────────────────────────────────┐
│  Dans tous les cas pour Odoo + PostgreSQL :              │
│  → Utilisez CNPG (même manifests sur les deux)           │
│  → Activez les sauvegardes S3 dès le premier jour        │
│  → Testez votre restauration avant la première mise en   │
│    production                                            │
└──────────────────────────────────────────────────────────┘
```

### Synthèse des recommandations

**Choisissez OpenShift si :**
- Votre organisation a des obligations de conformité (SOC2, ISO 27001, RGPD avec audit)
- Vous avez besoin d'un support professionnel réactif avec SLA
- Vos équipes sont mixtes (des profils moins techniques doivent gérer le cluster)
- Vous déployez dans un environnement enterprise multi-équipes

**Choisissez Talos si :**
- Vous voulez maîtriser chaque composant de votre infrastructure
- Vous déployez sur du matériel edge ou dans des environnements contraints en ressources
- Votre équipe a une bonne maîtrise de Kubernetes et de l'open source
- Le budget licences est un facteur bloquant

**Pour Odoo 19 + CNPG, les deux fonctionnent excellemment.** La différence principale est opérationnelle : OpenShift facilite la gestion quotidienne, Talos offre plus de contrôle et de légèreté.

### Bonnes pratiques communes (peu importe votre choix)

| Pratique | Pourquoi | Outil recommandé |
|---|---|---|
| Sauvegardes automatiques testées | Récupérer après un incident | CNPG + Barman + S3 |
| Monitoring et alertes | Détecter les incidents avant les utilisateurs | Prometheus + Grafana + Alertmanager |
| Plan de reprise (RTO/RPO définis) | Savoir quoi faire pendant une panne | Runbook documenté + tests réguliers |
| Scan de sécurité en CI/CD | Ne pas déployer de CVE critiques | Trivy (v0.69.3+, post-incident) |
| Principe du moindre privilège | Limiter l'impact d'une compromission | RBAC + NetworkPolicy + SCC |
| GitOps déclaratif | Traçabilité et reproductibilité totales | ArgoCD ou Flux |
| SBOM sur chaque artefact | Inventaire des composants, réponse aux CVE | Syft + Dependency-Track |

---

## 11. Ressources utiles

### Documentation officielle des plateformes

- [OpenShift Documentation](https://docs.openshift.com/) — Guide complet de la plateforme
- [OKD Documentation](https://docs.okd.io/) — La version open source gratuite d'OpenShift
- [Talos Documentation](https://www.talos.dev/docs/) — Guide officiel Talos
- [Sidero Labs](https://www.siderolabs.com/) — Support commercial pour Talos

### Applications et opérateurs

- [CloudNativePG (CNPG)](https://cloudnative-pg.io/) — Opérateur PostgreSQL pour Kubernetes
- [Odoo 19 Documentation](https://www.odoo.com/documentation/19.0/) — Documentation officielle Odoo
- [Longhorn](https://longhorn.io/) — Stockage persistant distribué pour Talos
- [MetalLB](https://metallb.universe.tf/) — Load Balancer on-premise pour Talos
- [cert-manager](https://cert-manager.io/) — Gestion automatique des certificats TLS

### Sécurité et monitoring

- [Prometheus](https://prometheus.io/) — Monitoring et alertes
- [Grafana](https://grafana.com/) — Visualisation des métriques
- [Loki](https://grafana.com/oss/loki/) — Agrégation de logs (alternative légère à ELK)
- [Velero](https://velero.io/) — Sauvegardes de namespaces Kubernetes complets
- [Trivy](https://github.com/aquasecurity/trivy) — Scanner de vulnérabilités (utiliser la v0.69.3+ après l'incident de mars 2026)
- [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets) — Chiffrement des secrets dans Git
- [Harden-Runner](https://github.com/step-security/harden-runner) — Sécurisation des workflows GitHub Actions

### GitOps et automatisation

- [ArgoCD](https://argo-cd.readthedocs.io/) — Déploiement GitOps déclaratif
- [Flux](https://fluxcd.io/) — Alternative GitOps légère, bien intégrée avec Talos
- [Helm](https://helm.sh/) — Gestionnaire de paquets Kubernetes

### Pour aller plus loin

- [CNPG — Guide de déploiement sur OpenShift](https://cloudnative-pg.io/documentation/current/openshift/)
- [CNPG — Guide de haute disponibilité](https://cloudnative-pg.io/documentation/current/replication/)
- [SBOM et sécurité supply chain](https://blog.stephane-robert.info/post/trivy-depot-github-vide/) — Analyse de l'incident Trivy mars 2026
- [Talos — Guides de déploiement par plateforme](https://www.talos.dev/latest/talos-guides/)
- [kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack) — Stack monitoring complète pour Talos

---

> **En résumé :** OpenShift et Talos sont deux approches valides et complémentaires. Le déploiement d'Odoo 19 avec PostgreSQL via CNPG fonctionne sur les deux plateformes avec des manifests YAML très proches. Ce qui diffère, c'est la façon de gérer, surveiller et sécuriser l'infrastructure au quotidien — et c'est là que votre contexte (équipe, budget, contraintes réglementaires) doit guider votre choix.
