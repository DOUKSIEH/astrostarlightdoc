---
title: "🐳 Guide Docker & Conteneurisation : De l'Histoire aux Bonnes Pratiques de Production"
description: "Maîtriser Docker en production avec les meilleures pratiques de sécurité, performance et fiabilité"
created: "2026-04-03"
updated: "2026-04-04"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"

---



<!-- # 🐳 Docker : Le Guide Complet — De A à Z -->
<!-- # 🐳 Docker & Conteneurisation : Le Guide Complet
## De l'Histoire aux Bonnes Pratiques de Production -->

> **Pour tous les publics** : curieux, développeurs, ops, DevSecOps, architectes  
> **Philosophie** : Comprendre avant d'appliquer. Chaque concept est expliqué simplement, avec des analogies du quotidien.

---

## 📋 Table des Matières

**Partie I — Les Fondations**
1. [Histoire & Origines de la Conteneurisation](#1-histoire--origines-de-la-conteneurisation)
2. [Conteneurisation vs Virtualisation](#2-conteneurisation-vs-virtualisation)
3. [Les Mécanismes Linux Sous le Capot](#3-les-mécanismes-linux-sous-le-capot)
4. [LXC/LXD : L'Ancêtre de Docker](#4-lxclxd--lancêtre-de-docker)

**Partie II — Docker en Profondeur**

5. [Docker : Architecture & Concepts Fondamentaux](#5-docker--architecture--concepts-fondamentaux)
6. [Images Docker : Comprendre les Layers](#6-images-docker--comprendre-les-layers)
7. [Cycle de Vie d'un Conteneur](#7-cycle-de-vie-dun-conteneur)
8. [Installation & Configuration du Daemon](#8-installation--configuration-du-daemon)

**Partie III — Construire & Distribuer**

9. [Dockerfile : Écrire des Images de Qualité](#9-dockerfile--écrire-des-images-de-qualité)
10. [Registries : Stocker & Distribuer les Images](#10-registries--stocker--distribuer-les-images)
11. [Volumes & Persistance des Données](#11-volumes--persistance-des-données)
12. [Réseaux Docker & DNS](#12-réseaux-docker--dns)
13. [Docker Compose](#13-docker-compose)

**Partie IV — Sécurité**

14. [Modèle de Menaces Docker](#14-modèle-de-menaces-docker)
15. [Capabilities Linux & Seccomp](#15-capabilities-linux--seccomp)
16. [AppArmor, SELinux & Rootless Mode](#16-apparmor-selinux--rootless-mode)
17. [Sécuriser les Images](#17-sécuriser-les-images)
18. [Gérer les Secrets Docker](#18-gérer-les-secrets-docker)
19. [Audit & Conformité CIS](#19-audit--conformité-cis)

**Partie V — Production & Orchestration**

20. [Performance & Optimisation](#20-performance--optimisation)
21. [Monitoring & Observabilité](#21-monitoring--observabilité)
22. [Pipeline CI/CD pour Images Docker](#22-pipeline-cicd-pour-images-docker)
23. [Orchestration : Swarm, Kubernetes & Alternatives](#23-orchestration--swarm-kubernetes--alternatives)
24. [Bonnes Pratiques Production — Checklist Complète](#24-bonnes-pratiques-production--checklist-complète)

**Annexes**

25. [Commandes CLI : Référence Complète](#25-commandes-cli--référence-complète)
26. [Glossaire](#26-glossaire)

---

# PARTIE I — LES FONDATIONS

---

## 1. Histoire & Origines de la Conteneurisation

### L'idée avant le nom

La conteneurisation, même sans ce nom, existe depuis les débuts de l'informatique. Dès que plusieurs programmes doivent partager une même machine, une question s'impose : **comment empêcher l'un de perturber l'autre ?** C'est la problématique de l'isolation, et elle est aussi vieille que les systèmes d'exploitation eux-mêmes.

> 🧩 **Analogie** : Imaginez un immeuble de bureaux. Chaque entreprise loue un étage (une machine virtuelle) ou simplement une salle (un conteneur). Dans un cas, chaque entreprise a sa propre infrastructure complète. Dans l'autre, elles partagent l'ascenseur, le hall et le système électrique — mais restent séparées entre elles.

### Chronologie : des origines à aujourd'hui

```
Années 1970  →  chroot (Unix) : changer la racine du système de fichiers
               Première forme d'isolation de l'environnement d'exécution

Années 1990  →  BSD Jail : chroot étendu avec isolation réseau et IP propre
               Premiers "sous-systèmes" réellement isolés

Années 2000  →  namespaces Linux (2002) : isolation des ressources système
               cgroups Linux (2007) : limitation des ressources
               LXC (2008) : premier vrai conteneur Linux "universel"

2013         →  Docker : révolution ! Interface simple, images portables, Hub
               Docker s'appuie initialement sur LXC, puis crée libcontainer

2014         →  Docker Compose, Kubernetes (Google), Rancher
               L'orchestration devient le nouveau défi

2015         →  OCI (Open Container Initiative) : standardisation des formats
               Docker Swarm, Kubernetes commence à dominer

2016         →  Docker intégré à Windows 10 (partenariat Microsoft)
               Adoption massive dans les entreprises

2017-2019    →  Kubernetes devient le standard de facto
               Containerd, CRI-O : l'écosystème se diversifie

2020+        →  Podman, Buildah, Skopeo : alternatives sans daemon
               WASM containers, conteneurs eBPF, edge computing
               Kubernetes everywhere : clouds, edge, IoT
```

### chroot : l'ancêtre (années 1970)

`chroot` (change root) permet de changer le répertoire racine `/` d'un processus. Le programme "croit" être à la racine du système, mais se retrouve en réalité dans une sous-arborescence isolée.

```bash
# Créer un mini-système de fichiers isolé
mkdir /jail
# ... copier les binaires nécessaires ...
chroot /jail /bin/bash
# Le processus ne peut pas accéder à ce qui est en dehors de /jail
```

**Limitation** : chroot ne protège que le système de fichiers. Les processus, le réseau, les utilisateurs restent partagés.

### BSD Jail (1999)

Les jails BSD étendent chroot avec une isolation réseau et la possibilité d'assigner des adresses IP propres. C'est le premier vrai "conteneur" moderne. Chaque jail a son propre espace réseau, ses processus isolés, ses utilisateurs.

### Naissance des cgroups et namespaces (Linux, 2002-2007)

Google contribue massivement au noyau Linux en introduisant deux mécanismes fondamentaux :

- **2002** : Les **namespaces** (isolation de la vue des ressources)
- **2007** : Les **cgroups** (contrôle de la consommation des ressources)

Ces deux briques constituent encore aujourd'hui **la base technique de tous les conteneurs**, y compris Docker.

### LXC : le conteneur natif Linux (2008)

LXC (Linux Containers) combine namespaces et cgroups pour créer des "machines virtuelles légères". C'est puissant, mais complexe à utiliser — il n'existe pas d'écosystème d'images, pas de format standard.

### 2013 : Docker change tout

Docker est présenté au **PyCon 2013** par Solomon Hykes (dotCloud, Y Combinator Summer 2010). La révolution n'est pas dans la technologie — LXC existe déjà — mais dans l'**expérience développeur** :

- **Format d'image standardisé** : une image Docker fonctionne partout
- **Dockerfile** : décrire une image en quelques lignes lisibles
- **Docker Hub** : un catalogue de 100 000+ images prêtes à l'emploi
- **CLI simple** : `docker run nginx` suffit pour lancer un serveur web

> Docker a rendu la conteneurisation **accessible à tous**, comme GitHub a rendu Git accessible à tous.

En 2014, Docker abandonne LXC et crée son propre runtime : **libcontainer** (écrit en Go), devenu aujourd'hui **containerd**.

### L'OCI : standardiser pour l'interopérabilité (2015)

L'**Open Container Initiative** (OCI), fondée par Docker, Google, CoreOS et d'autres, définit des standards ouverts pour :
- Le **format d'image** (OCI Image Spec)
- Le **runtime de conteneur** (OCI Runtime Spec)

Résultat : aujourd'hui, une image Docker peut être exécutée par containerd, CRI-O, Podman ou n'importe quel runtime OCI-compatible.

---

## 2. Conteneurisation vs Virtualisation

### Deux philosophies, deux niveaux d'abstraction

La virtualisation et la conteneurisation répondent toutes deux au besoin d'isolation, mais à des **niveaux différents** :

```
┌─────────────────────────────────────────────────────────────────┐
│                    VIRTUALISATION (VMs)                         │
│                                                                 │
│  App A    App B    App C                                        │
│  ─────    ─────    ─────                                        │
│  OS A     OS B     OS C    ← Chaque VM a son propre OS         │
│  ─────────────────────────                                      │
│         Hyperviseur        ← Couche d'abstraction matérielle    │
│  ─────────────────────────                                      │
│       Machine Physique                                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   CONTENEURISATION                              │
│                                                                 │
│  App A    App B    App C                                        │
│  ─────    ─────    ─────                                        │
│  Libs A   Libs B   Libs C  ← Seulement les dépendances         │
│  ─────────────────────────                                      │
│      Docker Engine (runtime)                                    │
│  ─────────────────────────                                      │
│       Kernel Linux partagé  ← Un seul kernel pour tous         │
│  ─────────────────────────                                      │
│       Machine Physique                                          │
└─────────────────────────────────────────────────────────────────┘
```

> 🧩 **Analogie** : La virtualisation, c'est louer un appartement entier (avec cuisine, salle de bain, etc.). La conteneurisation, c'est louer une chambre dans un coliving — tu as ton espace privé, mais tu partages les parties communes (le kernel).

### Tableau comparatif

| Critère | Virtualisation (VMs) | Conteneurisation |
|---|---|---|
| **Isolation** | OS complet isolé (hyperviseur) | Processus isolé (namespaces/cgroups) |
| **Taille** | Plusieurs Go (OS inclus) | Quelques Mo à centaines de Mo |
| **Démarrage** | Minutes (boot OS complet) | Secondes (processus direct) |
| **Ressources** | Élevées (RAM/CPU dédiés) | Légères (partage du kernel) |
| **Portabilité** | Dépend de l'hyperviseur | Très portable (standard OCI) |
| **Sécurité** | Isolation matérielle forte | Isolation logicielle (surface d'attaque partagée) |
| **Densité** | Quelques dizaines de VMs | Centaines de conteneurs |
| **Cas d'usage** | Multi-OS, isolation maximale | Microservices, CI/CD, cloud-native |

### Quand choisir quoi ?

**Choisissez la virtualisation si :**
- Vous devez faire tourner plusieurs systèmes d'exploitation différents (Windows + Linux)
- Vous avez des applications "legacy" qui nécessitent leur environnement natif
- Vous exigez une isolation matérielle absolue (environnements de sécurité critiques)
- Vous devez isoler des charges de travail qui partagent le même noyau représente un risque

**Choisissez la conteneurisation si :**
- Vous voulez déployer des applications rapidement et de façon reproductible
- Vous travaillez en microservices ou architecture cloud-native
- Vous voulez automatiser vos pipelines CI/CD
- Vous avez besoin de scalabilité dynamique

> ⚡ **Bonne nouvelle** : Les deux sont complémentaires. En production, les conteneurs tournent souvent **à l'intérieur** de VMs (couche de sécurité supplémentaire).

### Les avantages clés de la conteneurisation

**1. Portabilité & Cohérence**  
"Ça marche chez moi" appartient au passé. Un conteneur contient tout ce dont il a besoin. Il fonctionne identiquement en développement, en test et en production.

**2. Efficacité des ressources**  
Là où un serveur supporte 10 VMs, il peut accueillir des centaines de conteneurs. Moins de gaspillage, plus de densité, moins de coûts.

**3. Déploiement ultra-rapide**  
Démarrage en secondes (vs minutes pour une VM). Idéal pour l'élasticité et les pipelines CI/CD.

**4. Isolation renforcée**  
Chaque conteneur tourne dans son espace cloisonné. Une faille dans l'un n'affecte pas les autres (dans les limites de l'isolation logicielle).

**5. Scalabilité dynamique**  
Ajoutez ou supprimez des conteneurs à la volée selon la charge. Les orchestrateurs (Kubernetes) font ça automatiquement.

**6. DevOps facilité**  
L'environnement est versionné avec le code (Dockerfile). Les développeurs et les ops utilisent le même artefact.

---

## 3. Les Mécanismes Linux Sous le Capot

### Les trois piliers de la conteneurisation

Tout conteneur Linux repose sur trois mécanismes du noyau qui travaillent ensemble :

```
┌────────────────────────────────────────────────────────┐
│                    CONTENEUR                           │
│                                                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │  NAMESPACES  │ │   CGROUPS    │ │ CAPABILITIES  │   │
│  │              │ │              │ │               │   │
│  │ Ce que le    │ │ Ce que le    │ │ Ce que le     │   │
│  │ conteneur    │ │ conteneur    │ │ conteneur     │   │
│  │ VOIT         │ │ CONSOMME     │ │ PEUT FAIRE    │   │
│  │              │ │              │ │               │   │
│  │ "Murs"       │ │ "Compteurs"  │ │ "Droits"      │   │
│  └──────────────┘ └──────────────┘ └──────────────┘   │
└────────────────────────────────────────────────────────┘
```

### 3.1 Namespaces : l'isolation de la vue

Un **namespace** est un mécanisme du noyau Linux qui donne à un groupe de processus une **vue isolée** d'une ressource système. Les processus dans un namespace ne voient pas et ne peuvent pas accéder aux ressources des autres namespaces.

> 🧩 **Analogie** : Les namespaces sont comme des **cloisons dans un open space**. Chaque équipe a sa propre vue de son espace de travail, sans voir ni interférer avec les autres équipes — même si tout le monde est dans le même bâtiment (le même kernel).

Le noyau Linux implémente plusieurs types de namespaces :

| Namespace | Isole quoi ? | Effet dans le conteneur |
|---|---|---|
| **PID** | Processus | Le conteneur a son propre arbre de processus, commençant par PID 1 |
| **Network** | Réseau | Interface réseau, IP, ports, table de routage propres |
| **Mount** | Système de fichiers | Points de montage indépendants de l'hôte |
| **UTS** | Hostname | Hostname et nom de domaine propres |
| **IPC** | Communication inter-processus | Queues de messages, sémaphores isolés |
| **User** | Utilisateurs/groupes | Root dans le conteneur ≠ root sur l'hôte |
| **Cgroup** | Vue des cgroups | Isolation de la hiérarchie des contrôle-groupes |

**Exemple concret avec la commande `unshare`** (l'outil bas niveau qui crée des namespaces) :

```bash
# Créer un namespace utilisateur + processus avec son /proc dédié
$ unshare --user --pid --map-root-user --mount-proc --fork bash

root@host:~# id
uid=0(root) gid=0(root) groups=0(root),65534(nogroup)

root@host:~# ps aux
USER  PID  %CPU  %MEM  COMMAND
root    1   0.1   0.0  bash       ← PID 1 = notre bash !
root    8   0.0   0.0  ps aux
```

> 🔍 Le lecteur familier avec Docker reconnaîtra la similarité avec `docker exec -it /bin/bash` — c'est exactement le même mécanisme, géré automatiquement par Docker.

**Namespace PID en détail :**

```
Namespace parent (hôte)            Namespace conteneur A
─────────────────────              ────────────────────────
PID 1 (systemd)                    PID 1 (nginx)
PID 2 (dockerd)        →           PID 2 (nginx worker)
PID 3 (mon-conteneur)  →           PID 3 (nginx worker)
PID 4 (autre processus)

Les processus dans le namespace A voient leur propre arbre PID
(1, 2, 3), pas les PIDs 1, 2, 3, 4 de l'hôte.
```

**Lister les namespaces actifs :**

```bash
lsns --output-all
# Affiche tous les namespaces : type, PID, commande associée
```

### 3.2 Cgroups : l'allocation des ressources

Les **cgroups** (Control Groups) permettent de **limiter, prioriser et comptabiliser** l'utilisation des ressources d'un groupe de processus. Sans cgroups, un conteneur pourrait monopoliser tous les CPU et toute la RAM de l'hôte.

> 🧩 **Analogie** : Les cgroups sont les **compteurs individuels** de l'immeuble. Chaque appartement (conteneur) a son propre compteur électrique et son propre compteur d'eau. Impossible de consommer plus que ce qui est alloué.

| Ressource contrôlée | Paramètre Docker | Exemple |
|---|---|---|
| CPU | `--cpus` | `--cpus 0.5` (50% d'un cœur) |
| Mémoire RAM | `--memory` | `--memory 256m` |
| Swap | `--memory-swap` | `--memory-swap 256m` (pas de swap) |
| I/O disque | `--device-read-bps` | `--device-read-bps /dev/sda:10mb` |
| Nombre de processus | `--pids-limit` | `--pids-limit 100` |

**Exemple de manipulation directe des cgroups (bas niveau) :**

```bash
# Créer un cgroup avec une limite mémoire de 100 MB
sudo mkdir -p /sys/fs/cgroup/memory/mon-conteneur
echo 100000000 > /sys/fs/cgroup/memory/mon-conteneur/memory.limit_in_bytes

# Appliquer la règle à un processus (PID 1234)
echo 1234 > /sys/fs/cgroup/memory/mon-conteneur/cgroup.procs
# Si le processus dépasse 100 MB → il est tué automatiquement
```

Docker gère tout cela automatiquement via ses options CLI.

### 3.3 Capabilities : les privilèges granulaires

Linux divise les privilèges de l'utilisateur `root` en environ **40 unités discrètes** appelées **capabilities**. Plutôt que de donner "tous les pouvoirs" (root complet), on peut accorder uniquement ce dont le processus a besoin.

> 🧩 **Analogie** : Imaginez un trousseau de clés. L'administrateur système a toutes les clés du bâtiment. Un agent de ménage n'a que les clés des couloirs et des salles communes. Les capabilities, c'est ce trousseau de clés granulaire — on donne seulement les clés nécessaires.

**Docker retire par défaut les capabilities les plus dangereuses et n'en conserve que ~14.**

Capabilities retirées par défaut (dangereuses) :

| Capability | Risque si accordée |
|---|---|
| `CAP_SYS_ADMIN` | Presque équivalent à root complet (mount, quotas...) |
| `CAP_NET_ADMIN` | Modifier les règles iptables, interfaces réseau |
| `CAP_SYS_MODULE` | Charger des modules kernel |
| `CAP_SYS_PTRACE` | Déboguer d'autres processus |

```bash
# Supprimer TOUTES les capabilities (le plus sécurisé)
docker run --cap-drop ALL nginx

# Supprimer tout puis ajouter seulement le minimum nécessaire
docker run --cap-drop ALL --cap-add NET_BIND_SERVICE nginx
```

### 3.4 L'équation de la conteneurisation

```
Namespace  +  Cgroups  +  Capabilities  =  Conteneur

"Ce que je vois"  +  "Ce que je consomme"  +  "Ce que je peux faire"
    ↓                       ↓                         ↓
  Isolation              Limitation               Restriction
```

---

## 4. LXC/LXD : L'Ancêtre de Docker

### LXC : Linux Containers (2008)

LXC est le **premier gestionnaire de conteneurs** à utiliser nativement namespaces et cgroups. Il permet d'émuler des environnements Linux complets (Ubuntu, CentOS, Debian...) sur le même hôte.

**Différence avec Docker** : LXC crée des conteneurs "système" (similaires à des VMs légères), là où Docker crée des conteneurs "application" (un processus isolé).

```bash
# Avec LXC seul (verbeux)
sudo lxc-create --template download --name mon-conteneur -- -d ubuntu -r focal -a amd64
sudo lxc-start -n mon-conteneur
sudo lxc-attach -n mon-conteneur -- apt update
sudo lxc-attach -n mon-conteneur -- apt install nginx

# Avec LXD (surcouche simplifiée)
lxc launch ubuntu:20.04 mon-conteneur
lxc exec mon-conteneur -- apt install nginx
```

### Pourquoi Docker a-t-il remplacé LXC ?

| Critère | LXC | Docker |
|---|---|---|
| Portabilité | Fortement lié au système hôte | Image portable partout |
| Écosystème d'images | Quasi inexistant | 100 000+ images sur Docker Hub |
| Format d'image | Non standardisé | Standardisé (OCI) |
| Courbe d'apprentissage | Élevée | Accessible dès `docker run` |
| Intégration DevOps | Limitée | Natif (CI/CD, Compose, K8s) |

> Un conteneur LXC sur Ubuntu ne se migre pas facilement vers CentOS. Un conteneur Docker se déploie identiquement partout.

### LXC/Incus aujourd'hui

LXC reste utilisé pour des cas spécifiques (labs, test multi-distributions, simulation d'environnements système). **Incus** est le successeur communautaire de LXD (abandonné par Canonical), maintenant sous l'égide de Linux Containers.

---

# PARTIE II — DOCKER EN PROFONDEUR

---

## 5. Docker : Architecture & Concepts Fondamentaux

### Qu'est-ce que Docker ?

Docker est une **plateforme de conteneurisation** qui permet de packager une application avec toutes ses dépendances dans un conteneur portable et reproductible. L'analogie parfaite :

> 🐳 **Le docker** (l'ouvrier portuaire) manipule des **conteneurs maritimes** standardisés. Peu importe ce qu'il y a dedans, le conteneur s'empile, se transporte et se dépose de la même façon partout dans le monde. **Docker** (le logiciel) fait la même chose avec vos applications.

### Les 3 objets fondamentaux

| Objet | C'est quoi ? | Analogie |
|---|---|---|
| **Image** | Modèle immuable (read-only) composé de layers | Classe en POO / Moule à gâteau / Blueprint |
| **Conteneur** | Instance en cours d'exécution d'une image | Objet instancié / Gâteau fabriqué |
| **Registry** | Dépôt de stockage et distribution d'images | GitHub pour le code |

### Architecture client-serveur

Docker fonctionne en architecture **client-serveur** :

```
┌────────────────────────────────────────────────────────────────┐
│                     Machine Hôte                               │
│                                                                │
│  ┌─────────────┐    API REST     ┌──────────────────────────┐  │
│  │  Client     │ ─────────────→  │   Daemon (dockerd)       │  │
│  │  docker CLI │ ←───────────── │                          │  │
│  │             │  /var/run/      │  ┌────────┐ ┌────────┐  │  │
│  └─────────────┘  docker.sock   │  │Conteneur│ │Conteneur│  │  │
│                                 │  └────────┘ └────────┘  │  │
│                                 │       ↕           ↕      │  │
│                                 │  ┌────────────────────┐  │  │
│                                 │  │  containerd / runc  │  │  │
│                                 │  └────────────────────┘  │  │
│                                 └──────────────────────────┘  │
│                                            ↕                   │
│                                 ┌──────────────────────────┐  │
│                                 │     Kernel Linux          │  │
│                                 │  (namespaces + cgroups)   │  │
│                                 └──────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                                            ↕
                                   ┌──────────────┐
                                   │   Registry   │
                                   │ (Docker Hub) │
                                   └──────────────┘
```

### Le Daemon Docker (`dockerd`)

Le daemon est le **cœur** du système Docker :

- Écoute sur le socket Unix `/var/run/docker.sock`
- Gère toutes les ressources : images, conteneurs, réseaux, volumes
- **S'exécute en root par défaut** (point de sécurité critique)
- Délègue l'exécution réelle des conteneurs à **containerd**, puis à **runc**

```bash
# Vérifier que le daemon tourne
sudo systemctl status docker

# Voir les logs du daemon
sudo journalctl -u docker.service -f

# Infos complètes sur l'installation
docker info
```

> ⚠️ **Point de sécurité critique** : Toute personne ayant accès au socket Docker peut obtenir des privilèges root sur l'hôte. Voir la section Sécurité.

### Le Client Docker (`docker`)

L'outil en ligne de commande que vous utilisez. Il envoie des requêtes HTTP au daemon via l'API REST. Il peut se connecter à un daemon local ou distant.

```bash
# Daemon local (par défaut)
docker ps

# Daemon distant
DOCKER_HOST=tcp://remote-host:2376 docker ps
```

### La pile d'exécution complète

```
docker run nginx
    ↓
docker CLI (client)
    ↓ API REST
dockerd (daemon)
    ↓
containerd (gestion du cycle de vie)
    ↓
runc (exécution OCI, utilise namespaces/cgroups)
    ↓
Processus nginx isolé (PID 1 dans son namespace)
```

### Image vs Conteneur : la distinction fondamentale

```
                        IMAGE
                   ┌───────────┐
                   │  Immuable │  → 1 image peut créer
                   │ Read-Only │     N conteneurs
                   │  Layers   │
                   └─────┬─────┘
            ┌────────────┼────────────┐
            ↓            ↓            ↓
      ┌──────────┐ ┌──────────┐ ┌──────────┐
      │Conteneur1│ │Conteneur2│ │Conteneur3│
      │Layer R/W │ │Layer R/W │ │Layer R/W │  ← Chacun a sa couche d'écriture
      │(éphémère)│ │(éphémère)│ │(éphémère)│
      └──────────┘ └──────────┘ └──────────┘
```

| | Image | Conteneur |
|---|---|---|
| **Nature** | Modèle immuable | Instance (processus) |
| **Écriture** | Read-only | Layer R/W |
| **Persistance** | Stockée sur disque | Éphémère sans volume |
| **Multiplicité** | 1 image → N conteneurs | 1 conteneur = 1 exécution |
| **Analogie** | Classe / Moule | Objet / Gâteau |

---

## 6. Images Docker : Comprendre les Layers

### Le principe des couches

Une image Docker est construite comme un **millefeuille de couches** (layers), chacune représentant une modification du système de fichiers. C'est l'un des mécanismes les plus intelligents de Docker.

```
┌─────────────────────────────────┐  ← Layer 4 : COPY app/ (154 KB)
├─────────────────────────────────┤  ← Layer 3 : RUN apt install nginx (63 MB)
├─────────────────────────────────┤  ← Layer 2 : RUN apt update (5 MB)
├─────────────────────────────────┤  ← Layer 1 : Image de base Ubuntu (77 MB)
└─────────────────────────────────┘  ← scratch (vide, point de départ)
```

Chaque layer a une **signature SHA256 unique**. Si le contenu ne change pas, le hash ne change pas.

### Les 4 avantages du système de layers

**1. Partage** — Les layers communs sont partagés entre images

```bash
docker pull ubuntu:22.04        # Télécharge Ubuntu (~77 Mo)
docker pull nginx:latest        # Réutilise Ubuntu, télécharge que nginx
# Total : ~107 Mo au lieu de ~154 Mo si tout était dupliqué
```

**2. Cache** — Les layers inchangés sont réutilisés lors du build

```dockerfile
# Si requirements.txt ne change pas → pip install est mis en cache
COPY requirements.txt .
RUN pip install -r requirements.txt   # ← Mise en cache si requirements.txt inchangé
COPY . .                              # ← Rebuilder seulement si le code change
```

**3. Optimisation réseau** — Seuls les layers manquants sont téléchargés lors d'un `docker pull`

**4. Reproductibilité** — Chaque layer est identifié par son hash SHA256, garantissant l'intégrité

### Copy-on-Write (CoW) : comment les conteneurs écrivent

Quand un conteneur (layer R/W) veut modifier un fichier existant dans une layer read-only :

```
1. Docker copie le fichier dans le layer R/W du conteneur
2. Les modifications s'appliquent à la copie
3. Le layer original reste intact
4. Les autres conteneurs continuent de voir l'original
```

> ⚠️ **Performance** : Le CoW peut ralentir les écritures fréquentes sur des fichiers de l'image (logs, bases de données). Solution : utiliser des **volumes** pour les données qui changent souvent.

### Inspecter les layers

```bash
# Voir les layers et leur taille
docker image history nginx:alpine

# Format complet (pas tronqué)
docker image history --no-trunc nginx:alpine

# Inspecter les métadonnées de l'image
docker image inspect nginx:alpine

# Voir les hashes des layers
docker inspect nginx:alpine --format '{{json .RootFS.Layers}}'
```

### Tags : le système de versionnage

Un tag est un **pointeur** vers un commit spécifique d'une image — comme un tag Git.

```
mysql:8.0.33  ─┐
mysql:8.0     ─┼──→  Même image (même hash)
mysql:8       ─┤
mysql:latest  ─┘   (selon la date du pull — peut changer !)
```

> ⚠️ **Règle d'or** : Ne jamais utiliser `latest` en production. Épinglez toujours une version précise (`nginx:1.25.3`). `latest` peut pointer vers des versions différentes selon la date du pull.

### Docker Hub : trouver des images de confiance

Docker Hub (`https://hub.docker.com`) est le registry public officiel. Pour distinguer une image fiable :

- **Images officielles** : maintenues par Docker ou l'éditeur du logiciel. Pas de `/` dans le nom : `nginx`, `mysql`, `python`, `node`
- **Images vérifiées** : éditeur vérifié par Docker : `bitnami/nginx`
- **Images communautaires** : `utilisateur/image` — à évaluer avec précaution

```bash
# Chercher une image
docker search nginx --filter is-official=true

# Télécharger avec version épinglée (toujours !)
docker pull nginx:1.25.3-alpine
```

---

## 7. Cycle de Vie d'un Conteneur

### Les états d'un conteneur

```
              docker create
                   ↓
             [ CREATED ]      ← Conteneur créé, pas encore démarré
                   ↓
             docker start
                   ↓
             [ RUNNING ] ←──────── docker restart
                   ↓         ↑
         ┌─────────┴───────────────┐
         ↓                         ↓
     docker pause            docker stop / kill
         ↓                         ↓
     [ PAUSED ]              [ EXITED / STOPPED ]
         ↓                         ↓
    docker unpause           docker start   docker rm
                                  ↓              ↓
                             [ RUNNING ]   [ SUPPRIMÉ ]

     [ DEAD ] ← Erreur système, ne peut plus être géré normalement
```

### Descriptions des états

**`created`** : Le conteneur est créé (layer R/W alloué) mais aucun processus ne tourne.
```bash
docker create --name mon-app nginx:alpine
docker ps -a  # STATUS: Created
```

**`running`** : Le processus principal (PID 1) s'exécute.
```bash
docker start mon-app
docker ps     # STATUS: Up 5 seconds
```

**`paused`** : Le processus reçoit SIGSTOP, il est suspendu en mémoire. Zéro consommation CPU.
```bash
docker pause mon-app    # Suspend
docker unpause mon-app  # Reprend
```

**`exited`** : Le processus s'est terminé. Le conteneur + son layer R/W existent toujours.
```bash
docker stop mon-app   # SIGTERM puis SIGKILL après 10s
docker kill mon-app   # SIGKILL immédiat
```

**`dead`** : État d'erreur grave. Forcer la suppression avec `docker rm -f`.

### Codes de sortie : diagnostiquer les problèmes

| Code | Signification | Cause probable |
|---|---|---|
| `0` | Succès | Le processus s'est terminé normalement |
| `1-125` | Erreur applicative | Bug dans l'application |
| `126` | Non exécutable | Problème de permissions |
| `127` | Commande non trouvée | Binaire manquant dans l'image |
| `137` | SIGKILL | OOM killer, `docker kill`, ou `--memory` dépassée |
| `143` | SIGTERM | `docker stop` propre |

```bash
# Diagnostiquer un exit 137 (mémoire dépassée)
docker logs mon-app
docker inspect mon-app | grep -i oom
dmesg | grep -i "killed process"
```

### `docker stop` vs `docker kill`

| | `docker stop` | `docker kill` |
|---|---|---|
| Signal envoyé | SIGTERM → SIGKILL (après 10s) | SIGKILL immédiat |
| Arrêt propre ? | ✅ Oui (graceful) | ❌ Non (brutal) |
| Usage | 99% des cas | Conteneur bloqué/ne répond plus |

> ✅ **Règle** : Toujours utiliser `docker stop` sauf si le conteneur est complètement figé.

### Que fait exactement `docker run` ?

```bash
docker run -d --name web nginx:alpine
# Équivaut à :
docker pull nginx:alpine        # Si l'image n'est pas locale
docker create --name web nginx:alpine  # Crée le conteneur
docker start web                # Démarre le conteneur
```

---

## 8. Installation & Configuration du Daemon

### Installation sur Linux (Ubuntu/Debian)

```bash
# 1. Prérequis
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# 2. Clé GPG officielle Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 3. Dépôt officiel
echo "deb [arch=$(dpkg --print-architecture) \
  signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list

# 4. Installation
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 5. Vérification
docker --version
docker compose version
docker run hello-world
```

### Permettre l'utilisation sans sudo (développement)

```bash
sudo usermod -aG docker $USER
newgrp docker  # Appliquer sans se déconnecter

# Test
docker ps
```

> ⚠️ **Sécurité** : Appartenir au groupe `docker` équivaut à avoir les droits root sur la machine. En production, préférez le mode rootless.

### Configuration du Daemon (`/etc/docker/daemon.json`)

C'est le fichier de configuration central du daemon Docker. Il est lu au démarrage du service.

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  },
  "live-restore": true,
  "userland-proxy": false,
  "no-new-privileges": true,
  "icc": false
}
```

| Option | Description | Valeur recommandée |
|---|---|---|
| `log-driver` | Driver de logs | `json-file` (dev) ou `syslog` (prod) |
| `log-opts.max-size` | Taille max d'un fichier de log | `10m` |
| `live-restore` | Garder les conteneurs actifs si le daemon redémarre | `true` |
| `userland-proxy` | Proxy réseau userspace | `false` (performance) |
| `no-new-privileges` | Interdire l'acquisition de nouveaux privilèges | `true` (sécurité) |
| `icc` | Communication inter-conteneurs sur bridge default | `false` (sécurité) |

```bash
# Redémarrer après modification
sudo systemctl restart docker
sudo systemctl enable docker

# Vérifier la configuration
docker info
```

---

# PARTIE III — CONSTRUIRE & DISTRIBUER

---

## 9. Dockerfile : Écrire des Images de Qualité

### Qu'est-ce qu'un Dockerfile ?

Un Dockerfile est le **plan de construction** de votre image Docker. C'est un fichier texte qui décrit, étape par étape, comment assembler l'image.

> 🧩 **Analogie** : Le Dockerfile est comme une **recette de cuisine**. Il liste les ingrédients (image de base, paquets) et les étapes de préparation (commandes RUN). À la fin, on obtient le "plat" (l'image) que l'on peut reproduire à l'identique à tout moment.

### Instructions essentielles

| Instruction | Rôle | Obligatoire |
|---|---|---|
| `FROM` | Image de base | ✅ Oui |
| `RUN` | Exécuter une commande lors du build | Non |
| `COPY` | Copier des fichiers locaux dans l'image | Non |
| `ADD` | Copier + extraire archives (préférer COPY) | Non |
| `ENV` | Variable d'environnement persistante | Non |
| `ARG` | Variable de build (non persistée dans l'image) | Non |
| `EXPOSE` | Documenter le port d'écoute | Non |
| `VOLUME` | Déclarer un point de montage | Non |
| `USER` | Définir l'utilisateur d'exécution | Non |
| `WORKDIR` | Définir le répertoire de travail | Non |
| `CMD` | Commande par défaut au démarrage (surchargeable) | ✅ Recommandé |
| `ENTRYPOINT` | Point d'entrée fixe du conteneur | Non |
| `LABEL` | Ajouter des métadonnées | Non |
| `HEALTHCHECK` | Vérification de santé du conteneur | Non |

### Dockerfile basique commenté

```dockerfile
# Image de base : toujours épingler la version !
FROM debian:11.7-slim

# Métadonnées (bonnes pratiques)
LABEL maintainer="equipe@entreprise.com"
LABEL version="1.0"
LABEL description="Application web exemple"

# Variables d'environnement disponibles dans le conteneur
ENV APP_PORT=8080
ENV NODE_ENV=production

# Répertoire de travail (évite les chemins absolus dans les commandes)
WORKDIR /app

# Copier les dépendances d'abord (optimise le cache Docker)
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le reste du code (change souvent → en dernier)
COPY . .

# Documenter le port (n'ouvre pas le port, juste de la doc)
EXPOSE 8080

# Vérification de santé du conteneur
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Commande de démarrage (forme JSON recommandée)
CMD ["node", "server.js"]
```

### Les bonnes pratiques du Dockerfile

#### ✅ Optimiser le cache : mettre les éléments stables en premier

```dockerfile
# ❌ MAUVAIS : le code change souvent → invalide le cache pour npm install
COPY . .
RUN npm install

# ✅ BON : les dépendances changent moins souvent que le code
COPY package*.json ./          # Copie uniquement si package.json change
RUN npm ci                     # Mis en cache tant que package.json est stable
COPY src/ ./src/               # Code source → toujours en dernier
```

#### ✅ Un seul RUN pour les opérations liées (moins de layers)

```dockerfile
# ❌ MAUVAIS : 3 couches inutiles, apt cache conservé
RUN apt-get update
RUN apt-get install -y nginx
RUN rm -rf /var/lib/apt/lists/*

# ✅ BON : une seule couche, cache nettoyé dans la même instruction
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx=1.18.0-6.1+deb11u3 \
    curl=7.74.0-1.3+deb11u7 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
```

#### ✅ Spécifier les versions des paquets

```dockerfile
# ❌ Pas de version → résultat non reproductible
RUN apt-get install -y nginx curl

# ✅ Version épinglée → résultat garanti
RUN apt-get install -y nginx=1.18.0-6.1+deb11u3 curl=7.74.0-1.3+deb11u7
```

#### ✅ Utiliser un utilisateur non-root

```dockerfile
# Créer l'utilisateur
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Définir les permissions
COPY --chown=appuser:appgroup . .

# Basculer vers l'utilisateur non-root
USER appuser

CMD ["node", "server.js"]
```

#### ✅ CMD vs ENTRYPOINT

```dockerfile
# CMD seul : commande par défaut, surchargeable
CMD ["nginx", "-g", "daemon off;"]
# docker run mon-image                  → nginx -g daemon off;
# docker run mon-image echo "hello"     → echo "hello" (surcharge CMD)

# ENTRYPOINT + CMD : programme fixe + arguments par défaut
ENTRYPOINT ["python"]
CMD ["app.py"]
# docker run mon-image                  → python app.py
# docker run mon-image autre.py         → python autre.py (surcharge CMD)
# docker run --entrypoint sh mon-image  → sh (surcharge ENTRYPOINT)
```

### Multi-Stage Build : images ultra-légères

Le multi-stage build sépare la **phase de compilation** (image lourde avec outils de build) de l'**image finale** (légère, contenant seulement le runtime).

```dockerfile
# ──────────────────────────────────────────
# Étape 1 : BUILD (image lourde, temporaire)
# ──────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /build

# Installer toutes les dépendances (y compris devDependencies)
COPY package*.json ./
RUN npm ci

# Copier le code et builder
COPY . .
RUN npm run build

# ──────────────────────────────────────────
# Étape 2 : PRODUCTION (image légère finale)
# ──────────────────────────────────────────
FROM node:18-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

# Utilisateur non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copier UNIQUEMENT les artefacts de build
COPY --from=builder --chown=appuser:appgroup /build/dist ./dist
COPY --from=builder --chown=appuser:appgroup /build/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /build/package.json .

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s \
    CMD wget -qO- http://localhost:3000/health || exit 1

USER appuser

CMD ["node", "dist/server.js"]
```

**Résultat** : L'image finale peut passer de 1 Go à moins de 100 Mo — les outils de build, les tests, les `devDependencies` disparaissent.

### Exemple avancé : Go avec image distroless

```dockerfile
# Build
FROM golang:1.21-alpine AS builder
WORKDIR /build
COPY go.* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app ./cmd/server

# Production : image distroless (pas de shell, pas de gestionnaire de paquets)
FROM gcr.io/distroless/static:nonroot
COPY --from=builder /app /app
USER nonroot:nonroot
ENTRYPOINT ["/app"]
```

**Image résultante** : ~10 Mo, aucun shell, aucun outil de debug — surface d'attaque minimale.

### .dockerignore : exclure les fichiers inutiles

Comme `.gitignore`, ce fichier évite d'envoyer des fichiers inutiles au daemon lors du build (réduisant la taille du "build context" et accélérant le build) :

```
# .dockerignore
.git
.gitignore
.env
.env.*
node_modules
npm-debug.log
*.md
README*
tests/
test/
coverage/
__pycache__
*.pyc
.DS_Store
Thumbs.db
docker-compose*.yml
Dockerfile*
.dockerignore
```

### Outils de build alternatifs

| Outil | Éditeur | Particularité |
|---|---|---|
| **BuildKit** | Docker | Moteur moderne : parallélisme, cache avancé, secrets sécurisés |
| **Buildah** | Red Hat | Sans daemon Docker, idéal pour CI/CD sécurisé |
| **Kaniko** | Google | Build dans des pods Kubernetes sans privilèges |

```bash
# Activer BuildKit (défaut depuis Docker 23)
export DOCKER_BUILDKIT=1

# Build avec BuildKit et cache avancé
docker build \
  --cache-from type=registry,ref=mon-repo/mon-app:cache \
  --cache-to type=registry,ref=mon-repo/mon-app:cache,mode=max \
  -t mon-app:latest .
```

---

## 10. Registries : Stocker & Distribuer les Images

### Qu'est-ce qu'un registry ?

Un registry est un **entrepôt centralisé** où vous stockez, gérez et distribuez vos images Docker. C'est comme GitHub, mais pour les images conteneurisées.

**Flux de travail :**
```
Build local → docker push → Registry → docker pull → Déploiement
```

### Les principaux registries

| Registry | Type | Points forts |
|---|---|---|
| **Docker Hub** | Public/Privé | Le plus connu, 100K+ images officielles |
| **GitHub Container Registry (GHCR)** | Public/Privé | Intégré à GitHub CI/CD |
| **GitLab Container Registry** | Privé | Intégré aux pipelines GitLab |
| **Harbor** | Open Source | Scan de sécurité, contrôle d'accès fin |
| **AWS ECR** | Cloud | Natif AWS, intégré à EKS/ECS |
| **Google Artifact Registry** | Cloud | Natif GCP, multi-format |
| **Azure Container Registry** | Cloud | Natif Azure, intégré à AKS |
| **Nexus / Artifactory** | Enterprise | Multi-format (Maven, npm, Docker...) |
| **Quay.io** | Open Source | Red Hat, scan de sécurité |

### Commandes essentielles

```bash
# Authentification
docker login                              # Docker Hub
docker login ghcr.io                      # GitHub Container Registry
docker login registry.gitlab.com          # GitLab

# Pull : télécharger une image
docker pull nginx:1.25.3-alpine           # Docker Hub (par défaut)
docker pull ghcr.io/owner/image:tag       # GHCR
docker pull registry.example.com/app:v1  # Registry privé

# Tag : préparer pour le push
docker tag mon-app:latest mon-compte/mon-app:1.0.0
docker tag mon-app:latest ghcr.io/mon-org/mon-app:1.0.0

# Push : pousser vers le registry
docker push mon-compte/mon-app:1.0.0

# Se déconnecter (important sur des machines partagées)
docker logout
```

### Héberger son propre registry (Harbor)

Harbor est le registry open source de référence pour les entreprises. Il offre :
- Interface web intuitive
- Scan de vulnérabilités (Trivy intégré)
- Contrôle d'accès basé sur les rôles (RBAC)
- Signature et trust des images
- Réplication entre registries

```bash
# Lancement rapide avec Helm (Kubernetes)
helm install harbor harbor/harbor \
  --set expose.type=ingress \
  --set expose.ingress.hosts.core=harbor.example.com \
  --set externalURL=https://harbor.example.com
```

> 🔒 **Règle de sécurité** : Ne jamais utiliser des images publiques sans vérification. Préférez construire vos propres images à partir de bases officielles maintenues (Alpine, Debian slim, Chainguard). Scannez systématiquement avant déploiement.

---

## 11. Volumes & Persistance des Données

### Le problème de l'éphémérité

Par défaut, toutes les données écrites dans un conteneur **disparaissent** à sa suppression. C'est voulu : les conteneurs sont immuables et éphémères.

```
Sans volume :
┌────────────────────────────────┐
│  Conteneur                     │
│  ├── Layer image (read-only)   │
│  └── Layer R/W (éphémère)     │ ← données perdues si docker rm
└────────────────────────────────┘

Avec volume :
┌────────────────────────────────┐
│  Conteneur                     │
│  ├── Layer image (read-only)   │
│  └── Layer R/W (éphémère)     │
└────────────────┬───────────────┘
                 │ /var/lib/mysql (dans le conteneur)
                 ↓ monté sur
          /var/lib/docker/volumes/mon-volume/_data
               (sur l'hôte — persiste toujours)
```

### Les 3 méthodes de persistance

#### 1. Volumes Docker (recommandé en production)

Gérés entièrement par Docker, stockés dans `/var/lib/docker/volumes/`. Indépendants du chemin de l'hôte.

**Quand les utiliser :**
- Bases de données
- Données importantes à conserver
- Partage de données entre plusieurs conteneurs
- Stockage sur un hôte distant ou dans le cloud

```bash
# Créer un volume nommé
docker volume create db-data

# Utiliser un volume (syntaxe -v)
docker run -d \
  -v db-data:/var/lib/mysql \
  --name mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  mysql:8.0

# Utiliser un volume (syntaxe --mount, plus explicite et recommandée)
docker run -d \
  --mount type=volume,source=db-data,target=/var/lib/mysql \
  --name mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  mysql:8.0

# Volume partagé entre plusieurs conteneurs
docker run -d -v data-partagee:/data --name app1 mon-app
docker run -d -v data-partagee:/data --name app2 mon-app

# Inspecter un volume
docker volume inspect db-data

# Lister les volumes
docker volume ls

# Supprimer les volumes inutilisés
docker volume prune
```

**Déclaration dans le Dockerfile :**
```dockerfile
# Docker crée automatiquement un volume anonyme au lancement
VOLUME /var/lib/mysql
```

#### 2. Bind Mounts (recommandé en développement)

Lien direct entre un chemin absolu de l'hôte et un chemin du conteneur. Les fichiers de l'hôte **remplacent** ceux du conteneur.

**Quand les utiliser :**
- Développement avec live-reload (le code sur l'hôte est directement accessible dans le conteneur)
- Partage de fichiers de configuration
- Partage du code source pendant le dev

```bash
# Monter le répertoire courant dans le conteneur
docker run -d \
  -v $(pwd)/src:/app/src \
  --name dev-app \
  mon-app

# Syntaxe --mount (plus explicite)
docker run -d \
  --mount type=bind,source=$(pwd)/app,target=/app \
  mon-app

# ✅ Sécurité : monter en lecture seule
docker run -d \
  -v $(pwd)/config:/app/config:ro \
  mon-app

# Dev avec live-reload Node.js
docker run -d \
  -v $(pwd):/app \
  -w /app \
  -p 3000:3000 \
  node:18-alpine \
  npm run dev
```

> ⚠️ **Attention** : Le bind mount dépend du chemin de l'hôte. Si la structure de l'hôte change, le conteneur peut se comporter différemment. N'utilisez pas de bind mount en production.

#### 3. tmpfs (données temporaires en RAM)

Stockage uniquement en mémoire RAM. Aucune trace sur disque. Idéal pour des données sensibles éphémères.

```bash
docker run -d \
  --mount type=tmpfs,destination=/app/cache,tmpfs-size=100m \
  mon-app
```

### Tableau comparatif

| Méthode | Géré par | Persistance | Usage recommandé |
|---|---|---|---|
| **Volume Docker** | Docker | ✅ Oui | Production, BDD |
| **Bind Mount** | Système de fichiers hôte | ✅ Oui | Développement |
| **tmpfs** | RAM | ❌ Non (redémarrage) | Données sensibles temporaires |

### Sauvegarder et restaurer un volume

```bash
# Sauvegarder un volume dans une archive tar
docker run --rm \
  -v mon-volume:/data \
  -v $(pwd):/backup \
  alpine \
  tar czf /backup/backup-$(date +%Y%m%d-%H%M%S).tar.gz -C /data .

# Restaurer depuis une archive
docker run --rm \
  -v mon-volume:/data \
  -v $(pwd):/backup \
  alpine \
  tar xzf /backup/backup-20240101.tar.gz -C /data
```

---

## 12. Réseaux Docker & DNS

### Le NAT et l'isolation réseau

Docker crée par défaut un réseau virtuel privé (`bridge`) pour chaque hôte. Les conteneurs obtiennent des adresses IP privées (RFC 1918), et le daemon Docker effectue du **NAT** pour leur permettre d'accéder à Internet via l'IP publique de l'hôte.

```
┌─────────────────────────────────────────────────────────┐
│  Réseau application_web (172.20.0.0/24)                │
│  ┌────────────┐    ┌────────────┐                       │
│  │   mysql    │    │   apache   │    ┌──────────────┐   │
│  │172.20.0.2  │    │172.20.0.3  │───→│ Firewall NAT │──→ Internet
│  └────────────┘    └────────────┘    └──────────────┘   │
├─────────────────────────────────────────────────────────┤
│  Réseau application_python (172.21.0.0/24)             │
│  ┌────────────┐    ┌────────────┐                       │
│  │   python   │    │  mongodb   │                       │
│  └────────────┘    └────────────┘                       │
└─────────────────────────────────────────────────────────┘
```

### Types de réseaux Docker

| Réseau | Description | Cas d'usage |
|---|---|---|
| **bridge** (défaut) | Réseau virtuel NATé, isolé de l'hôte | Applications standard |
| **host** | Partage directement la stack réseau de l'hôte | Performance max (⚠️ sécurité réduite) |
| **none** | Aucune interface réseau (juste loopback) | Isolation totale |
| **overlay** | Réseau multi-hôtes (Docker Swarm) | Clusters |
| **macvlan** | Adresse MAC propre sur le réseau physique | Intégration réseau avancée |

### Commandes réseau

```bash
# Lister les réseaux
docker network ls

# Créer un réseau personnalisé (DNS activé automatiquement !)
docker network create app-network

# Réseau avec sous-réseau personnalisé
docker network create \
  --driver bridge \
  --subnet 172.25.0.0/24 \
  --gateway 172.25.0.1 \
  app-network

# Lancer un conteneur sur un réseau
docker run -d --name webserver --network app-network nginx

# Connecter un conteneur existant à un réseau
docker network connect app-network mon-conteneur

# Déconnecter
docker network disconnect app-network mon-conteneur

# Inspecter (voir les conteneurs connectés)
docker network inspect app-network

# Supprimer les réseaux inutilisés
docker network prune
```

### DNS : la magie des réseaux personnalisés

> ⭐ **Point clé** : Sur un réseau personnalisé (créé avec `docker network create`), Docker active automatiquement un **serveur DNS intégré**. Les conteneurs peuvent se contacter **par leur nom**.

```bash
# Créer un réseau
docker network create app-network

# Lancer MySQL
docker run -d \
  --name database \       # ← Ce nom devient un hostname DNS
  --network app-network \
  -e MYSQL_ROOT_PASSWORD=secret \
  mysql:8.0

# L'application peut joindre MySQL par son nom !
docker run -d \
  --name webapp \
  --network app-network \
  -e DB_HOST=database \   # ← "database" se résout automatiquement
  -e DB_PORT=3306 \
  mon-app

# Dans webapp : ping database → fonctionne !
# MySQL est accessible à l'adresse "database:3306"
```

> ⚠️ **Attention** : Sur le réseau **bridge par défaut** (sans `docker network create`), la résolution DNS par nom ne fonctionne **pas** automatiquement. Toujours utiliser des réseaux personnalisés.

### Exposer des ports de façon sécurisée

```bash
# ❌ Exposer sur toutes les interfaces (accessible depuis Internet !)
docker run -d -p 8080:80 nginx

# ✅ Exposer uniquement en local
docker run -d -p 127.0.0.1:8080:80 nginx

# Plusieurs ports
docker run -d -p 80:80 -p 443:443 nginx

# Port UDP
docker run -d -p 53:53/udp mon-dns

# Port aléatoire (Docker choisit)
docker run -d -P nginx
docker port <id>  # Voir le port assigné
```

---

## 13. Docker Compose

### Pourquoi Docker Compose ?

Gérer plusieurs conteneurs qui dépendent les uns des autres avec des commandes `docker run` séparées devient vite ingérable. Docker Compose permet de définir toute une stack applicative dans **un seul fichier YAML**.

> 🧩 **Analogie** : Docker Compose est comme un **chef d'orchestre**. Au lieu de donner des instructions à chaque musicien (conteneur) séparément, il lit la partition (le fichier YAML) et coordonne tout le monde simultanément.

> ⚠️ **Important** : Docker Compose est idéal pour le développement et les déploiements sur une seule machine. Il n'est **pas** un orchestrateur : il ne gère pas la haute disponibilité, la scalabilité automatique ou la distribution sur plusieurs machines. Pour ça : Kubernetes, Swarm ou Nomad.

### Structure d'un docker-compose.yml complet

```yaml
version: '3.8'

# Réseau personnalisé (DNS inter-services activé)
networks:
  app-network:
    driver: bridge

# Volumes persistants
volumes:
  db-data:
  redis-data:

# Services (= conteneurs)
services:

  # ─────────────────────────────
  # Base de données MySQL
  # ─────────────────────────────
  database:
    image: mysql:8.0.33
    container_name: app-database
    restart: unless-stopped
    networks:
      - app-network
    volumes:
      - db-data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}   # Depuis .env
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    # Limites de ressources
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.50'
    # Vérification de santé
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 30s

  # ─────────────────────────────
  # Cache Redis
  # ─────────────────────────────
  cache:
    image: redis:7.0-alpine
    container_name: app-cache
    restart: unless-stopped
    networks:
      - app-network
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

  # ─────────────────────────────
  # Application principale
  # ─────────────────────────────
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: production            # Multi-stage : étape de production
    container_name: app-web
    restart: unless-stopped
    networks:
      - app-network
    ports:
      - "127.0.0.1:3000:3000"      # Local seulement
    environment:
      NODE_ENV: production
      DB_HOST: database             # Résolution DNS automatique !
      DB_PORT: 3306
      REDIS_HOST: cache
    env_file:
      - .env                        # Variables depuis fichier .env
    depends_on:
      database:
        condition: service_healthy  # Attendre que MySQL soit prêt
      cache:
        condition: service_healthy
    volumes:
      - ./uploads:/app/uploads
    # Options de sécurité
    read_only: true
    tmpfs:
      - /tmp
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  # ─────────────────────────────
  # Reverse Proxy Nginx
  # ─────────────────────────────
  nginx:
    image: nginx:1.25.3-alpine
    container_name: app-nginx
    restart: unless-stopped
    networks:
      - app-network
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
```

### Fichier .env (ne jamais committer !)

```bash
# .env
DB_ROOT_PASSWORD=super_secret_root_password
DB_NAME=myapp
DB_USER=appuser
DB_PASSWORD=app_secure_password
REDIS_PASSWORD=redis_secure_password
```

```
# .gitignore
.env
.env.*
!.env.example   # Committer l'exemple sans valeurs réelles
```

### Commandes Docker Compose

```bash
# Démarrer tous les services (arrière-plan)
docker compose up -d

# Démarrer et rebuilder les images
docker compose up -d --build

# Voir les logs en temps réel
docker compose logs -f app

# Statut des services
docker compose ps

# Arrêter (sans supprimer)
docker compose stop

# Arrêter et supprimer les conteneurs
docker compose down

# Supprimer aussi les volumes (⚠️ données perdues !)
docker compose down -v

# Exécuter une commande dans un service
docker compose exec app sh
docker compose exec database mysql -u root -p

# Rebuilder une image spécifique
docker compose build app

# Voir la configuration résolue
docker compose config

# Scaler un service (3 instances de app)
docker compose up -d --scale app=3
```

### Politiques de redémarrage

| Politique | Comportement | Usage |
|---|---|---|
| `no` (défaut) | Ne redémarre jamais | Tests ponctuels |
| `on-failure[:n]` | Redémarre si code de sortie != 0 | Jobs batch |
| `always` | Toujours, même si arrêt manuel | Services critiques |
| `unless-stopped` | Toujours sauf si arrêt manuel explicite | ✅ Recommandé prod |

---

# PARTIE IV — SÉCURITÉ

---

## 14. Modèle de Menaces Docker

### Comprendre la surface d'attaque

Avant de sécuriser, il faut comprendre ce qu'on protège et contre quoi.

```
┌─────────────────────────────────────────────────────────────────┐
│                    SURFACE D'ATTAQUE DOCKER                     │
│                                                                 │
│  ┌─────────────┐     ┌──────────────┐     ┌─────────────────┐  │
│  │   Images    │     │   Daemon     │     │   Conteneurs    │  │
│  │             │     │  dockerd     │     │                 │  │
│  │ ● CVE dans  │     │ ● Tourne     │     │ ● Escape        │  │
│  │   les paquets│    │   en ROOT    │     │ ● Privilèges    │  │
│  │ ● Secrets   │     │ ● Socket     │     │   excessifs     │  │
│  │   exposés   │     │   exposé     │     │ ● Ressources    │  │
│  │ ● Images    │     │ ● API non    │     │   non limitées  │  │
│  │   non       │     │   sécurisée  │     │ ● Secrets en    │  │
│  │   signées   │     │              │     │   clair         │  │
│  └─────────────┘     └──────────────┘     └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### La règle fondamentale : le daemon tourne en root

Par défaut, `dockerd` s'exécute avec les privilèges root. Toute personne pouvant communiquer avec le socket Docker peut obtenir un accès root à l'hôte :

```bash
# ⚠️ DÉMONSTRATION DU RISQUE (ne pas faire en production)
# Un utilisateur du groupe docker peut faire ça :
docker run -it --rm -v /:/host alpine chroot /host
# → Shell root sur l'hôte !
```

> 🔴 **Règle absolue** : Ne jamais exposer `/var/run/docker.sock` sur le réseau ou dans des conteneurs applicatifs. N'ajouter au groupe `docker` que des utilisateurs de confiance.

### Conteneurs ≠ VMs : différence de sécurité

| Caractéristique | Conteneur | VM |
|---|---|---|
| Kernel | **Partagé** avec l'hôte | Propre kernel |
| Isolation | Namespaces + cgroups (logiciel) | Hyperviseur (matériel) |
| Escape | Plus facile (kernel partagé) | Rare (isolation matérielle) |
| Surface d'attaque | Kernel hôte partagé | Hyperviseur |

### Les vecteurs d'attaque principaux

1. **Image malveillante** : téléchargement d'une image compromise depuis Docker Hub
2. **Escape conteneur** : exploitation d'une faille kernel pour sortir de l'isolation
3. **Mauvaise configuration** : `--privileged`, socket exposé, secrets en clair
4. **Vulnérabilités applicatives** : CVE dans les packages de l'image
5. **Déni de service** : conteneur sans limites monopolisant les ressources

### Interdire `--privileged`

```bash
# ❌ INTERDIT en production : désactive TOUTES les protections
docker run --privileged nginx

# Ce conteneur peut :
# - Charger des modules kernel
# - Modifier les règles iptables
# - Monter des filesystems hôte
# - Accéder aux disques bruts
# - Accéder à tous les périphériques
```

**Alternatives sécurisées à `--privileged` :**

| Besoin | Alternative sécurisée |
|---|---|
| Accéder à un device | `--device /dev/xxx` |
| Capability spécifique | `--cap-add CAP_XXX` |
| Port < 1024 | `--cap-add NET_BIND_SERVICE` |
| Docker-in-Docker | Sysbox runtime ou Podman |

---

## 15. Capabilities Linux & Seccomp

### Capabilities : les privilèges granulaires

Docker accorde par défaut environ 14 capabilities. Les autres sont retirées.

**Capabilities accordées par défaut :**

| Capability | Usage |
|---|---|
| `CHOWN` | Changer le propriétaire des fichiers |
| `DAC_OVERRIDE` | Ignorer les permissions fichiers |
| `FSETID` | Conserver les bits setuid/setgid |
| `NET_BIND_SERVICE` | Binder ports < 1024 |
| `SETUID` / `SETGID` | Changer l'UID/GID |
| `KILL` | Envoyer des signaux à d'autres processus |
| `NET_RAW` | Utiliser RAW sockets (ping) |

**Capabilities retirées par défaut (dangereuses) :**

| Capability | Risque |
|---|---|
| `CAP_SYS_ADMIN` | Presque équivalent à root complet |
| `CAP_NET_ADMIN` | Modifier iptables, interfaces réseau |
| `CAP_SYS_MODULE` | Charger des modules kernel |
| `CAP_SYS_PTRACE` | Déboguer d'autres processus |

**Appliquer le principe du moindre privilège :**

```bash
# ✅ Bonne pratique : supprimer tout puis ajouter le minimum
docker run --cap-drop ALL --cap-add NET_BIND_SERVICE nginx
docker run --cap-drop ALL --cap-add CHOWN --cap-add SETUID --cap-add SETGID mon-app

# Vérifier les capabilities d'un conteneur
docker exec mon-conteneur cat /proc/1/status | grep Cap
# CapEff: 0000000000000000 = aucune capability
```

**Dans Docker Compose :**

```yaml
services:
  web:
    image: nginx:alpine
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
      - CHOWN
      - SETUID
      - SETGID
    security_opt:
      - no-new-privileges:true
```

### Conteneur ultra-sécurisé en une ligne

```bash
docker run -d \
  --name app-secure \
  --cap-drop ALL \
  --security-opt no-new-privileges:true \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=100m \
  --user 1000:1000 \
  --memory 256m \
  --cpus 0.5 \
  --pids-limit 100 \
  myapp:latest
```

### Seccomp : filtrer les appels système

Seccomp (Secure Computing Mode) filtre les **appels système** (syscalls) au niveau kernel. Un syscall non autorisé tue immédiatement le processus.

**Docker applique automatiquement un profil seccomp bloquant ~44 syscalls dangereux :**

| Syscall bloqué | Risque si autorisé |
|---|---|
| `reboot` | Redémarrer l'hôte |
| `kexec_load` | Charger un nouveau kernel |
| `mount` / `umount` | Monter des filesystems |
| `init_module` | Charger des modules kernel |
| `settimeofday` | Modifier l'heure système |

```bash
# Vérifier que seccomp est actif
docker run --rm alpine cat /proc/1/status | grep Seccomp
# Seccomp: 2  (2 = filtrage actif, 0 = désactivé)

# Profil personnalisé plus restrictif
docker run --security-opt seccomp=mon-profil.json myapp

# ❌ Désactiver seccomp (très dangereux)
docker run --security-opt seccomp=unconfined myapp
```

> ⚠️ `--privileged` désactive à la fois Seccomp ET AppArmor. Ne l'utilisez jamais en production.

---

## 16. AppArmor, SELinux & Rootless Mode

### AppArmor (Ubuntu/Debian)

AppArmor est un système de contrôle d'accès obligatoire (MAC) qui restreint ce que les processus peuvent faire au-delà des permissions Unix.

Docker applique automatiquement le profil `docker-default` sur Ubuntu/Debian :

```bash
# Vérifier l'état d'AppArmor
sudo aa-status

# Profil appliqué à un conteneur
docker inspect --format '{{.AppArmorProfile}}' mon-conteneur

# Profil par défaut :
# - Interdit l'écriture dans /proc et /sys
# - Restreint les montages
# - Bloque l'accès à certains devices
```

**Profil AppArmor personnalisé (/etc/apparmor.d/docker-nginx) :**

```
#include <tunables/global>

profile docker-nginx flags=(attach_disconnected,mediate_deleted) {
  #include <abstractions/base>

  # Lecture des fichiers web
  /var/www/** r,
  /etc/nginx/** r,

  # Écriture des logs
  /var/log/nginx/** rw,

  # Refuser l'écriture dans /proc et /sys
  deny /proc/** w,
  deny /sys/** w,
}
```

```bash
# Charger le profil
sudo apparmor_parser -r /etc/apparmor.d/docker-nginx

# Lancer avec ce profil
docker run --security-opt apparmor=docker-nginx nginx
```

### Mode Rootless : la sécurité maximale

Le mode rootless exécute le daemon Docker **et** tous les conteneurs en tant qu'utilisateur non-root. Même une escape réussie ne donne pas accès root à l'hôte.

```bash
# Prérequis
sudo apt install uidmap dbus-user-session

# Vérifier les prérequis
dockerd-rootless-setuptool.sh check

# Installer (en tant qu'utilisateur normal, pas root !)
dockerd-rootless-setuptool.sh install

# Configurer l'environnement
echo 'export PATH=/usr/bin:$PATH' >> ~/.bashrc
echo 'export DOCKER_HOST=unix:///run/user/$(id -u)/docker.sock' >> ~/.bashrc
source ~/.bashrc

# Activer le démarrage automatique
systemctl --user enable docker
loginctl enable-linger $(whoami)

# Vérifier
docker run --rm hello-world
```

**Limitations du mode rootless :**

| Fonctionnalité | Rootless | Solution alternative |
|---|---|---|
| Ports < 1024 | ❌ | Port > 1024 + reverse proxy |
| Cgroup v1 | ❌ | Migrer vers cgroup v2 |
| `--privileged` | ❌ | Pas nécessaire |
| Overlay network | ⚠️ Limité | VPN ou réseau externe |

### User Namespaces (userns-remap)

Mappe l'UID 0 (root) du conteneur sur un UID non privilégié de l'hôte.

```
Dans le conteneur    |    Sur l'hôte
─────────────────────┼─────────────────
UID 0 (root)         │    UID 100000
UID 1                │    UID 100001
...                  │    ...
UID 65535            │    UID 165535
```

```bash
# Configuration
sudo useradd -r -s /bin/false dockremap
echo "dockremap:100000:65536" | sudo tee -a /etc/subuid
echo "dockremap:100000:65536" | sudo tee -a /etc/subgid
```

```json
// /etc/docker/daemon.json
{
  "userns-remap": "dockremap"
}
```

```bash
sudo systemctl restart docker

# Vérifier : le processus sleep dans le conteneur doit avoir UID 100000 sur l'hôte
docker run -d alpine sleep 3600
ps aux | grep "sleep 3600"
# L'UID devrait être 100000, pas 0
```

---

## 17. Sécuriser les Images

### Lint du Dockerfile : Hadolint

```bash
# Via Docker (pas d'installation nécessaire)
docker run --rm -i hadolint/hadolint < Dockerfile

# Installation locale
wget -O hadolint https://github.com/hadolint/hadolint/releases/latest/download/hadolint-Linux-x86_64
chmod +x hadolint && sudo mv hadolint /usr/local/bin/
./hadolint Dockerfile
```

**Les 5 règles Hadolint les plus importantes :**

| Code | Règle | Exemple de correction |
|---|---|---|
| DL3007 | Ne pas utiliser `latest` dans FROM | `FROM debian:11.7-slim` |
| DL3008 | Spécifier les versions des paquets apt | `nginx=1.18.0-6.1+deb11u3` |
| DL3009 | Nettoyer les listes apt | `&& rm -rf /var/lib/apt/lists/*` |
| DL3015 | Utiliser `--no-install-recommends` | `apt-get install -y --no-install-recommends` |
| DL3059 | Consolider les instructions RUN | `&&` et `\` |

### Scanner les vulnérabilités : Trivy

**Trivy** est le scanner de vulnérabilités open source de référence.

```bash
# Scanner une image locale
trivy image nginx:latest

# Avec seuil de sévérité (exit 1 si CRITICAL)
trivy image --severity HIGH,CRITICAL nginx:latest

# Ignorer les vulnérabilités sans fix disponible
trivy image --ignore-unfixed nginx:latest

# Export JSON pour CI/CD
trivy image -f json -o rapport.json nginx:latest

# Via Docker (pas d'installation)
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy:latest image --severity CRITICAL mon-app:1.0
```

**Alternatives à Trivy :**

| Outil | Éditeur | Particularité |
|---|---|---|
| **Grype** | Anchore | Léger, rapide |
| **Snyk** | Snyk | Intégration IDE, SBOM |
| **Docker Scout** | Docker | Intégré à Docker Desktop |
| **Clair** | Quay | Registry-native |

### Audit de configuration : Dockle

```bash
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  goodwithtech/dockle:latest \
  --exit-code 1 \
  mon-app:1.0
```

**Alertes Dockle importantes :**

| Code | Description | Correction |
|---|---|---|
| CIS-DI-0001 | Pas d'utilisateur non-root | Ajouter `USER appuser` |
| CIS-DI-0006 | Pas de HEALTHCHECK | Ajouter `HEALTHCHECK` |
| DKL-DI-0006 | Tag `latest` utilisé | Épingler la version |

### Choisir la bonne image de base

| Image | Taille | Shell | Gestionnaire paquets | CVE potentiels |
|---|---|---|---|---|
| Ubuntu | ~75 Mo | ✅ | apt | Élevé |
| Debian slim | ~30 Mo | ✅ | apt | Moyen |
| Alpine | ~5 Mo | ✅ | apk | Faible |
| **Distroless** | ~20 Mo | ❌ | ❌ | **Très faible** |
| **Scratch** | 0 Mo | ❌ | ❌ | Application seule |

**Recommandations :**
- **Production** : Distroless (Google) ou Alpine
- **Debug nécessaire** : Alpine (shell disponible)
- **Binaires statiques (Go, Rust)** : Scratch ou Distroless static
- **Chainguard** : images basées sur Wolfi, mises à jour quotidiennes, CVE proches de 0

### Docker Content Trust (DCT) : signer les images

```bash
# Activer la vérification des signatures (refus des images non signées)
export DOCKER_CONTENT_TRUST=1

# Signer une image
docker trust sign monregistry/monapp:v1.0

# Vérifier la signature
docker trust inspect monregistry/monapp:v1.0

# Désactiver temporairement pour pull une image non signée
DOCKER_CONTENT_TRUST=0 docker pull ubuntu:22.04
```

### Dockerfile sécurisé complet

```dockerfile
# ✅ Version épinglée, image slim
FROM debian:11.7-slim

# ✅ Métadonnées
LABEL maintainer="equipe@entreprise.com" \
      version="1.0.0" \
      security.scan.date="2024-01-01"

# ✅ Une seule instruction RUN, versions épinglées, nettoyage
# ✅ Création utilisateur non-root dans le même RUN
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl=7.74.0-1.3+deb11u7 \
    nginx=1.18.0-6.1+deb11u3 \
    sudo=1.9.5p2-3+deb11u1 \
    # Paquets corrigeant des CVE critiques
    libc6=2.31-13+deb11u6 \
    libssl1.1=1.1.1n-0+deb11u5 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    # ✅ Utilisateur non-root
    && addgroup --system appgroup \
    && adduser --system --ingroup appgroup --no-create-home appuser \
    # ✅ sudo uniquement pour ce qui est nécessaire
    && echo "appuser ALL=(ALL) NOPASSWD: /usr/sbin/service nginx start" \
       >> /etc/sudoers.d/appuser

WORKDIR /app

# ✅ Copier avec le bon propriétaire
COPY --chown=appuser:appgroup . .

# ✅ Documenter le port
EXPOSE 80

# ✅ Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# ✅ Utilisateur non-root pour l'exécution
USER appuser

CMD ["nginx", "-g", "daemon off;"]
```

---

## 18. Gérer les Secrets Docker

### Pourquoi c'est critique

> 🚨 **Selon GitGuardian** : Des milliers d'images sur Docker Hub contiennent des clés AWS valides, tokens d'API et identifiants de production exposés.

| Risque | Conséquence | Exemple réel |
|---|---|---|
| Piratage cloud | Machines supprimées ou minage de crypto | Clé AWS → facture de 50 000€ |
| Fuite de données | Accès aux bases de données | Token DB → dump de la base clients |
| Compromission CI/CD | Push de code malveillant | Secret GitLab → pipeline compromis |

**Un secret dans une image est permanent.** Même supprimé dans une couche suivante, il reste accessible dans les couches précédentes via `docker history`.

### Où les secrets peuvent fuiter

```dockerfile
# ❌ INTERDIT : visible dans l'historique de l'image
ENV DATABASE_PASSWORD=supersecret

# ❌ INTERDIT : le fichier est copié dans une couche permanente
COPY .env /app/.env

# ❌ INTERDIT : ARG est visible dans docker history
ARG NPM_TOKEN
RUN npm install --registry=https://:${NPM_TOKEN}@npm.pkg.github.com
```

```bash
# Vérifier si des secrets sont dans l'historique
docker history mon-image --no-trunc | grep -iE 'password|secret|token|key'
```

### Méthode recommandée : BuildKit secrets

BuildKit permet de monter un secret **temporairement** pendant un `RUN`. Le secret n'est jamais stocké dans une couche.

```dockerfile
# syntax=docker/dockerfile:1
FROM python:3.12-slim

WORKDIR /app

# Le secret est monté pendant le RUN, puis disparaît
# Il n'est JAMAIS dans l'image finale
RUN --mount=type=secret,id=pip_conf,target=/etc/pip.conf \
    pip install -r requirements.txt

COPY . .
CMD ["python", "app.py"]
```

```bash
# Builder avec le secret
docker build --secret id=pip_conf,src=./pip.conf -t mon-app .

# Vérifier que le secret n'est pas dans l'image
docker run --rm mon-app cat /etc/pip.conf
# cat: /etc/pip.conf: No such file or directory ✅
```

**Exemple complet : accès à un registry NPM privé**

```bash
# Créer le fichier .npmrc (ne pas committer !)
echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" > .npmrc
echo ".npmrc" >> .gitignore
```

```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./

# .npmrc monté temporairement pour npm install uniquement
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    npm ci --only=production

COPY . .
CMD ["node", "server.js"]
```

```bash
docker build --secret id=npmrc,src=.npmrc -t mon-app .
```

**Options du mount secret :**

| Option | Description | Exemple |
|---|---|---|
| `id` | Identifiant (obligatoire) | `id=my_secret` |
| `target` | Chemin dans le conteneur | `target=/etc/config.json` |
| `required` | Échoue si absent | `required=true` |
| `mode` | Permissions (octal) | `mode=0400` |
| `uid`, `gid` | Propriétaire | `uid=1000` |

### Docker Compose secrets

```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    environment:
      # Convention *_FILE : l'image lit le fichier automatiquement
      MYSQL_ROOT_PASSWORD_FILE: /run/secrets/db_root_password
      MYSQL_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_root_password
      - db_password

  app:
    image: mon-app
    secrets:
      - db_password
    # Dans l'app : lire /run/secrets/db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt       # Depuis un fichier
  db_root_password:
    file: ./secrets/db_root_password.txt
  api_key:
    environment: API_KEY                   # Depuis une variable d'environnement
```

> 💡 **Convention `_FILE`** : Les images officielles (MySQL, PostgreSQL, WordPress) supportent les variables d'environnement suffixées `_FILE`. Elles lisent le contenu du fichier au démarrage au lieu d'utiliser la valeur directe.

### Comparaison des méthodes

| Méthode | Sécurité | Cas d'usage |
|---|---|---|
| Variables d'environnement | ⚠️ Faible (visible via `docker inspect`) | Dev uniquement |
| Bind mount (read-only) | ✅ Moyenne | Production simple |
| **BuildKit `--mount=type=secret`** | ✅✅ Élevée | **Secrets au build** |
| **Compose secrets** | ✅✅ Élevée | **Secrets au runtime** |
| **tmpfs** | ✅✅ Très élevée | Secrets éphémères ultra-sensibles |
| Vault / AWS Secrets Manager | ✅✅✅ Maximale | Enterprise |

### Chiffrer ses secrets avec SOPS

SOPS (Secrets OPerationS) chiffre les fichiers de secrets tout en gardant les clés visibles :

```bash
# Chiffrer un fichier de secrets avec GPG
sops -e -i secrets.json

# Le fichier chiffré (sûr à committer)
{
  "api_key": "ENC[AES256_GCM,data:abc123...,type:str]",
  "db_password": "ENC[AES256_GCM,data:def456...,type:str]"
}

# Déchiffrer dans le pipeline CI/CD
sops -d secrets.json > decrypted.json
docker build --secret id=config,src=decrypted.json -t mon-app .
rm -f decrypted.json  # Nettoyer immédiatement
```

### Scanner les secrets dans les images

```bash
# Avec Trivy
trivy image --scanners secret mon-app:latest

# Avec trufflehog
trufflehog docker --image mon-app:latest

# Avec Dockle
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  goodwithtech/dockle:latest mon-app:latest
```

### Règles d'or des secrets Docker

```
❌ JAMAIS                          ✅ TOUJOURS
──────────────────                 ──────────────────────────────────
ENV SECRET=xxx                  → --mount=type=secret (BuildKit)
COPY .env /app/                 → Monter au runtime via Compose secrets
ARG pour les secrets            → Fichiers secrets ou tmpfs
Secrets dans git                → Chiffrement SOPS ou vault
echo $SECRET dans les logs      → Ne jamais afficher de secrets
Variables d'env en production   → Fichiers /run/secrets/*
```

---

## 19. Audit & Conformité CIS

### Docker Bench for Security

Script officiel vérifiant la conformité au **CIS Docker Benchmark** (250+ pages de règles de sécurité) :

```bash
docker run --rm -it \
  --net host \
  --pid host \
  --userns host \
  --cap-add audit_control \
  -e DOCKER_CONTENT_TRUST=$DOCKER_CONTENT_TRUST \
  -v /var/lib:/var/lib:ro \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v /usr/lib/systemd:/usr/lib/systemd:ro \
  -v /etc:/etc:ro \
  docker/docker-bench-security
```

**Résultats possibles :**
- `[PASS]` : Conforme ✅
- `[WARN]` : Non conforme, correction recommandée ⚠️
- `[INFO]` : Information ℹ️

**Sections vérifiées :**

| Section | Contenu |
|---|---|
| 1 | Configuration de l'hôte |
| 2 | Configuration du daemon Docker |
| 3 | Fichiers de configuration du daemon |
| 4 | Images et Dockerfiles |
| 5 | Runtime des conteneurs |
| 6 | Opérations de sécurité |
| 7 | Docker Swarm |

### Recommandations CIS prioritaires

| ID | Recommandation | Impact |
|---|---|---|
| 2.1 | Activer `--live-restore` | Continuité de service |
| 2.2 | Désactiver `userland-proxy` | Performance + sécurité |
| 4.1 | Créer un user non-root dans les images | Isolation |
| 5.1 | Ne pas utiliser `--privileged` | **Critique** |
| 5.2 | Limiter les capabilities | Moindre privilège |
| 5.4 | Restreindre les montages sensibles | Intégrité hôte |
| 5.10 | Limiter la mémoire | Protection DoS |

### Lynis : audit du système hôte

```bash
# Cloner et lancer
git clone https://github.com/CISOfy/lynis
cd lynis
sudo ./lynis audit system

# Mode non privilégié (certains tests ignorés)
./lynis audit system
```

### Auditer le daemon Docker

```bash
# Installer auditd
sudo apt-get install auditd

# Vérifier si l'audit est actif
auditctl -l | grep /usr/bin/dockerd

# Ajouter les règles d'audit
cat > /etc/audit/rules.d/docker.rules << 'EOF'
## Audit du démon Docker
-w /usr/bin/docker -p wa
-w /var/lib/docker -p wa
-w /etc/docker -p wa
-w /lib/systemd/system/docker.service -p wa
-w /lib/systemd/system/docker.socket -p wa
-w /etc/default/docker -p wa
-w /etc/docker/daemon.json -p wa
-w /usr/bin/docker-containerd -p wa
EOF

sudo service auditd restart

# Consulter les logs
tail -f /var/log/audit/audit.log
```

### Centraliser les logs

```bash
# Vérifier le driver de logs actuel
docker info --format '{{.LoggingDriver}}'
# Si "json-file" en production → configurer un système centralisé

# Configurer syslog dans daemon.json
{
  "log-driver": "syslog",
  "log-opts": {
    "syslog-address": "tcp://logserver:514",
    "tag": "docker/{{.Name}}"
  }
}
```

---

# PARTIE V — PRODUCTION & ORCHESTRATION

---

## 20. Performance & Optimisation

### Optimiser la taille des images

La taille d'une image impacte directement le temps de déploiement, la consommation de disque et la surface d'attaque.

```dockerfile
# ✅ Images de base légères
FROM python:3.11-slim         # ~125 MB vs ~900 MB pour python:3.11
FROM node:18-alpine           # ~180 MB vs ~1 GB pour node:18

# ✅ Nettoyage dans le même RUN
RUN apt-get update && apt-get install -y --no-install-recommends \
    package \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ✅ Multi-stage build (voir section 9)

# ✅ .dockerignore complet

# ✅ COPY sélectif
COPY src/ ./src/              # Au lieu de COPY . .
COPY package*.json ./
```

**Inspecter la taille des layers :**

```bash
docker image history --format "table {{.CreatedBy}}\t{{.Size}}" mon-app
docker system df -v  # Espace disque total utilisé par Docker
```

### Optimiser le cache de build

L'ordre des instructions est crucial. Les layers stables → en haut. Les layers variables → en bas.

```dockerfile
# ❌ MAUVAIS : le code change souvent → invalide le cache pour pip install
COPY . .
RUN pip install -r requirements.txt

# ✅ BON : les dépendances changent rarement
COPY requirements.txt .          # Invalidé seulement si requirements.txt change
RUN pip install -r requirements.txt  # Mis en cache le reste du temps
COPY . .                         # Code source en dernier
```

### Limiter les ressources en production

```bash
# Mémoire
docker run -d \
  --memory="256m" \             # Limite stricte
  --memory-swap="256m" \        # = memory → pas de swap
  --memory-reservation="128m" \ # Soft limit (warning)
  mon-app

# CPU
docker run -d \
  --cpus="0.5" \                # 50% d'un cœur
  --cpu-shares=512 \            # Poids relatif (défaut: 1024)
  --cpuset-cpus="0,1" \        # Affinité : cœurs 0 et 1 seulement
  mon-app

# I/O
docker run -d \
  --blkio-weight=500 \
  --device-read-bps /dev/sda:10mb \
  --device-write-bps /dev/sda:10mb \
  mon-app

# Processus (protection contre les fork bombs)
docker run -d --pids-limit 100 mon-app
```

**Dans Docker Compose :**

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.50'
        reservations:
          memory: 256M
          cpus: '0.25'
```

### BuildKit : builds plus rapides

```bash
# Activer BuildKit (défaut depuis Docker 23+)
export DOCKER_BUILDKIT=1

# Cache distant (excellent pour CI/CD)
docker build \
  --cache-from type=registry,ref=mon-repo/mon-app:cache \
  --cache-to type=registry,ref=mon-repo/mon-app:cache,mode=max \
  -t mon-app:latest .

# Build multi-plateforme (ARM + AMD64)
docker buildx create --name multiarch --use
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t mon-app:latest \
  --push .
```

### Nettoyage régulier

```bash
# Voir l'espace utilisé
docker system df
docker system df -v  # Détaillé

# Nettoyer les ressources inutilisées
docker container prune    # Conteneurs arrêtés
docker image prune -a     # Images non utilisées
docker volume prune       # Volumes non montés
docker network prune      # Réseaux non utilisés

# Tout nettoyer en une commande
docker system prune -a --volumes

# Automatiser avec cron
# 0 2 * * * docker system prune -f >> /var/log/docker-cleanup.log 2>&1
```

---

## 21. Monitoring & Observabilité

### Statistiques en temps réel

```bash
# Stats de tous les conteneurs
docker stats

# Stats d'un conteneur (format personnalisé)
docker stats --format \
  "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"

# Snapshot (pas de stream continu)
docker stats --no-stream
```

### Healthcheck et auto-guérison

```dockerfile
# Dans le Dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1
```

```bash
# Voir l'état de santé
docker inspect --format='{{.State.Health.Status}}' mon-app
# Valeurs : starting | healthy | unhealthy

# Avec restart policy : redémarrage automatique si unhealthy
docker run -d \
  --restart=on-failure:5 \
  --health-cmd="curl -f http://localhost:8080/health || exit 1" \
  --health-interval=30s \
  --health-timeout=5s \
  --health-retries=3 \
  mon-app
```

### Drivers de logs

| Driver | Description | Usage |
|---|---|---|
| `json-file` (défaut) | Stockage local JSON | Développement |
| `syslog` | Envoi vers syslog | Production Linux |
| `journald` | Systemd journal | Production systemd |
| `fluentd` | Fluentd aggregator | Production cloud |
| `awslogs` | AWS CloudWatch | AWS |
| `splunk` | Splunk | Enterprise |
| `gelf` | Graylog | Self-hosted |

```bash
# Configurer les logs par conteneur
docker run -d \
  --log-driver=syslog \
  --log-opt syslog-address=tcp://logserver:514 \
  --log-opt tag="{{.Name}}/{{.ID}}" \
  mon-app
```

### Surveiller les événements Docker

```bash
# Tous les événements en temps réel
docker events

# Filtrer
docker events --filter "type=container"
docker events --filter "event=start"
docker events --filter "event=die"
docker events --filter "event=oom"   # Out of Memory = très utile !
docker events --filter "name=mon-app"

# Plage de temps
docker events --since '2024-01-01T00:00:00' --until '2024-01-01T23:59:59'
```

### Stack de monitoring complète

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.retention.time=30d'
    ports:
      - "127.0.0.1:9090:9090"

  grafana:
    image: grafana/grafana:latest
    volumes:
      - grafana-data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    ports:
      - "127.0.0.1:3000:3000"

  # Métriques des conteneurs Docker
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    ports:
      - "127.0.0.1:8080:8080"

volumes:
  prometheus-data:
  grafana-data:
```

---

## 22. Pipeline CI/CD pour Images Docker

### Architecture d'un pipeline sécurisé

```
Developer → Push Dockerfile → GitLab/GitHub CI
                                    ↓
                    ┌───────────────────────────────────┐
                    │ 1. Lint          (Hadolint)        │
                    │ 2. Build         (docker build)    │
                    │ 3. Test          (docker run)      │
                    │ 4. Sécurité      (Trivy + Dockle)  │
                    │ 5. Push          (Registry)        │
                    └───────────────────────────────────┘
                                    ↓
                        Registry (ECR, GHCR, Harbor...)
                                    ↓
                         Déploiement (K8s, Swarm...)
```

### .gitlab-ci.yml complet et sécurisé

```yaml
services:
  - docker:24.0-dind

variables:
  DOCKER_TLS_CERTDIR: "/certs"
  DOCKER_BUILDKIT: "1"
  IMAGE_NAME: "${CI_REGISTRY_IMAGE}:${CI_COMMIT_SHA}"
  IMAGE_LATEST: "${CI_REGISTRY_IMAGE}:latest"

stages:
  - lint
  - build
  - test
  - security
  - push

# ─────────────────────────────
# 1. Lint du Dockerfile
# ─────────────────────────────
dockerfile_lint:
  stage: lint
  image: hadolint/hadolint:2.12.0-debian
  script:
    - hadolint Dockerfile
  allow_failure: false

# ─────────────────────────────
# 2. Build de l'image
# ─────────────────────────────
image_build:
  stage: build
  image: docker:24.0
  script:
    - docker build --no-cache -t "$IMAGE_NAME" .
    - mkdir -p image
    - docker save "$IMAGE_NAME" > image/app.tar
  artifacts:
    paths:
      - image/
    expire_in: 1 hour
  allow_failure: false

# ─────────────────────────────
# 3. Tests fonctionnels
# ─────────────────────────────
image_test:
  stage: test
  image: docker:24.0
  before_script:
    - docker load -i image/app.tar
  script:
    - docker run --rm --name test -d "$IMAGE_NAME"
    - sleep 5
    - docker exec test curl -f http://localhost/ || exit 1
    - docker exec test node --version || true
    - docker stop test
  allow_failure: false

# ─────────────────────────────
# 4a. Scan Dockle
# ─────────────────────────────
dockle_scan:
  stage: security
  image: docker:24.0
  before_script:
    - docker load -i image/app.tar
  script:
    - docker run --rm
        -v /var/run/docker.sock:/var/run/docker.sock
        goodwithtech/dockle:latest
        --exit-code 1
        "$IMAGE_NAME"
  allow_failure: true   # Warning, ne bloque pas le pipeline

# ─────────────────────────────
# 4b. Scan Trivy
# ─────────────────────────────
trivy_scan:
  stage: security
  image: docker:24.0
  before_script:
    - docker load -i image/app.tar
  script:
    - docker run --rm
        -v /var/run/docker.sock:/var/run/docker.sock
        aquasec/trivy:latest image
        --exit-code 1
        --severity CRITICAL
        "$IMAGE_NAME"
  allow_failure: true

# ─────────────────────────────
# 5. Push vers le registry
# ─────────────────────────────
push_image:
  stage: push
  image: docker:24.0
  before_script:
    - docker load -i image/app.tar
    - docker login -u "$CI_REGISTRY_USER" -p "$CI_REGISTRY_PASSWORD" "$CI_REGISTRY"
  script:
    - docker push "$IMAGE_NAME"
    - docker tag "$IMAGE_NAME" "$IMAGE_LATEST"
    - docker push "$IMAGE_LATEST"
  only:
    - main
  allow_failure: false
```

### GitHub Actions

```yaml
name: Build, Scan & Push

on:
  push:
    branches: [main]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      packages: write
      security-events: write

    steps:
      - uses: actions/checkout@v4

      - name: Lint Dockerfile
        uses: hadolint/hadolint-action@v3.1.0
        with:
          dockerfile: Dockerfile

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build image
        uses: docker/build-push-action@v5
        with:
          context: .
          load: true
          tags: ghcr.io/${{ github.repository }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          secrets: |
            "npm_token=${{ secrets.NPM_TOKEN }}"

      - name: Scan with Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'ghcr.io/${{ github.repository }}:${{ github.sha }}'
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'

      - name: Upload Trivy results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'

      - name: Push image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ghcr.io/${{ github.repository }}:${{ github.sha }}
            ghcr.io/${{ github.repository }}:latest
```

---

## 23. Orchestration : Swarm, Kubernetes & Alternatives

### Pourquoi l'orchestration ?

Lancer un conteneur, c'est simple. Gérer des dizaines de conteneurs avec :
- Haute disponibilité (redémarrage automatique en cas de panne)
- Scalabilité (ajout/suppression automatique selon la charge)
- Distribution sur plusieurs machines
- Découverte de services et load balancing

→ C'est là qu'intervient l'orchestration.

### Quel orchestrateur choisir ?

| Situation | Outil recommandé |
|---|---|
| Dev local, stack multi-conteneurs | Docker Compose |
| 1 machine, projet simple | Docker Compose ou Swarm |
| 2-10 machines, cluster modeste | Docker Swarm ou Nomad |
| Production cloud-native, scalabilité | **Kubernetes** |
| Edge / IoT / homelab | K3s (Kubernetes léger) |

### Docker Swarm

Intégré à Docker, simple à configurer :

```bash
# Initialiser un cluster Swarm
docker swarm init

# Ajouter des nœuds (commande affichée à l'init)
docker swarm join --token SWMTKN-... X.X.X.X:2377

# Déployer un service
docker service create \
  --name webserver \
  --replicas 3 \
  --publish published=80,target=80 \
  nginx:alpine

# Mettre à l'échelle
docker service scale webserver=5

# Rolling update
docker service update \
  --image nginx:1.25.3-alpine \
  --update-parallelism 1 \
  --update-delay 10s \
  webserver

# Lister les services
docker service ls
docker service ps webserver
```

### Kubernetes (K8s) : le standard

Kubernetes est l'orchestrateur de conteneurs dominant. Ses concepts clés :

- **Pod** : plus petite unité, contient un ou plusieurs conteneurs
- **Deployment** : gère un ensemble de Pods identiques, assure la disponibilité
- **Service** : expose un Deployment sur le réseau (load balancing)
- **Ingress** : route HTTP/HTTPS vers les Services
- **ConfigMap / Secret** : configuration et secrets externalisés

```yaml
# Exemple de Deployment Kubernetes
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mon-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mon-app
  template:
    metadata:
      labels:
        app: mon-app
    spec:
      containers:
      - name: mon-app
        image: ghcr.io/mon-org/mon-app:1.0.0   # Version épinglée !
        ports:
        - containerPort: 3000
        resources:
          limits:
            memory: "256Mi"
            cpu: "500m"
          requests:
            memory: "128Mi"
            cpu: "250m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        securityContext:
          runAsNonRoot: true
          runAsUser: 1000
          readOnlyRootFilesystem: true
          allowPrivilegeEscalation: false
          capabilities:
            drop: ["ALL"]
```

### Alternatives à Kubernetes

**Nomad (HashiCorp)** : orchestrateur polyvalent supportant conteneurs, VMs et exécutables. Plus simple que Kubernetes, s'intègre nativement avec Vault et Consul.

**K3s** : distribution Kubernetes ultra-légère (~70 MB). Idéal pour edge computing, IoT, homelab, Raspberry Pi.

**Podman** : alternative à Docker sans daemon, conteneurs rootless par défaut. Compatible Docker CLI.

---

## 24. Bonnes Pratiques Production — Checklist Complète

### ✅ Checklist Images

- [ ] Version épinglée (pas de `latest`) : `FROM debian:11.7-slim`
- [ ] Image de base `slim` ou `alpine` ou `distroless`
- [ ] Multi-stage build pour séparer build et runtime
- [ ] `.dockerignore` configuré
- [ ] Utilisateur non-root : `USER appuser`
- [ ] `HEALTHCHECK` défini
- [ ] Versions des paquets épinglées
- [ ] Cache apt nettoyé dans le même `RUN`
- [ ] `--no-install-recommends` utilisé
- [ ] Scan Hadolint passé (0 erreur)
- [ ] Scan Trivy sans CRITICAL
- [ ] Scan Dockle passé

### ✅ Checklist Conteneurs

- [ ] Limites mémoire et CPU définies (`--memory`, `--cpus`)
- [ ] `--restart=unless-stopped`
- [ ] `--read-only` si possible
- [ ] `--cap-drop=ALL` + ajout minimal
- [ ] `--security-opt no-new-privileges:true`
- [ ] Pas de montage de `/var/run/docker.sock`
- [ ] `--pids-limit` défini
- [ ] Secrets via fichiers `/run/secrets/` ou BuildKit

### ✅ Checklist Réseau

- [ ] Réseaux Docker dédiés par application
- [ ] Ports exposés uniquement sur `127.0.0.1` si accès local
- [ ] Pas d'utilisation du réseau `host` (sauf cas exceptionnel)
- [ ] `icc: false` dans daemon.json

### ✅ Checklist Données

- [ ] Données persistantes dans des volumes nommés
- [ ] Sauvegardes automatisées des volumes critiques
- [ ] Pas de données sensibles dans les images
- [ ] Secrets chiffrés avec SOPS ou gérés via Vault

### ✅ Checklist Hôte & Daemon

- [ ] Docker Bench for Security exécuté régulièrement
- [ ] Audit du daemon Docker configuré (auditd)
- [ ] Logs centralisés (syslog, Fluentd, CloudWatch)
- [ ] `live-restore: true`
- [ ] `no-new-privileges: true`
- [ ] `userland-proxy: false`
- [ ] Mode rootless ou userns-remap configuré
- [ ] Docker et OS mis à jour régulièrement

### ✅ Checklist CI/CD

- [ ] Hadolint dans le pipeline
- [ ] Scan Trivy dans le pipeline (bloquant pour CRITICAL)
- [ ] Images versionnées avec le SHA du commit
- [ ] Pas de `latest` poussé en production
- [ ] Secrets gérés par la plateforme CI (GitLab CI vars, GitHub Secrets)
- [ ] BuildKit activé (`DOCKER_BUILDKIT=1`)

### Débogage : commandes essentielles

```bash
# Logs d'un conteneur
docker logs -f --tail=100 mon-app

# Shell dans un conteneur actif
docker exec -it mon-app sh

# Copier des fichiers
docker cp mon-app:/app/logs/error.log ./error.log

# Inspecter un conteneur
docker inspect mon-app

# Statistiques
docker stats --no-stream

# Processus
docker top mon-app

# Changements de fichiers
docker diff mon-app

# Événements OOM
docker events --filter "event=oom"

# Capabilities d'un conteneur
docker exec mon-app cat /proc/1/status | grep Cap

# Vérifier les limites
docker inspect --format='{{.HostConfig.Memory}}' mon-app
```

---

## 25. Commandes CLI : Référence Complète

### Images

```bash
docker pull <image>[:tag]              # Télécharger
docker push <image>[:tag]              # Pousser vers un registry
docker images / docker image ls        # Lister
docker image history <image>           # Historique des layers
docker image inspect <image>           # Métadonnées complètes
docker image prune [-a]                # Supprimer les inutilisées
docker rmi <image>                     # Supprimer une image
docker tag <source> <cible>           # Taguer
docker save <image> > file.tar         # Exporter
docker load < file.tar                 # Importer
docker search <terme>                  # Chercher sur Docker Hub
docker login / docker logout           # Authentification
docker trust inspect <image>           # Vérifier la signature
```

### Conteneurs

```bash
docker run [options] <image>           # Créer et démarrer
docker start <conteneur>               # Démarrer un conteneur arrêté
docker stop <conteneur>                # Arrêter proprement (SIGTERM)
docker kill <conteneur>                # Forcer l'arrêt (SIGKILL)
docker restart <conteneur>             # Redémarrer
docker pause / unpause <conteneur>     # Suspendre / Reprendre
docker rm <conteneur>                  # Supprimer (arrêté)
docker rm -f <conteneur>               # Forcer la suppression
docker ps [-a]                         # Lister les conteneurs
docker logs [-f] [--tail=N] <cont>    # Voir les logs
docker exec -it <conteneur> cmd        # Exécuter une commande
docker cp src <conteneur>:dest         # Copier des fichiers
docker inspect <conteneur>             # Métadonnées complètes
docker stats [--no-stream] [cont]     # Statistiques live
docker top <conteneur>                 # Processus du conteneur
docker diff <conteneur>                # Changements de fichiers
docker port <conteneur>                # Ports exposés
docker rename old new                  # Renommer
docker update [options] <conteneur>   # Mettre à jour les ressources
docker container prune                 # Supprimer les arrêtés
docker events                          # Événements en temps réel
```

### Volumes

```bash
docker volume create <nom>             # Créer
docker volume ls                       # Lister
docker volume inspect <nom>            # Inspecter
docker volume rm <nom>                 # Supprimer
docker volume prune                    # Supprimer les inutilisés
```

### Réseaux

```bash
docker network create <nom>            # Créer
docker network ls                      # Lister
docker network inspect <réseau>        # Inspecter
docker network connect <réseau> <cont> # Connecter un conteneur
docker network disconnect <r> <c>     # Déconnecter
docker network rm <réseau>             # Supprimer
docker network prune                   # Supprimer les inutilisés
```

### Build

```bash
docker build -t <nom>[:tag] .          # Builder une image
docker build -f Dockerfile.prod .      # Dockerfile spécifique
docker build --no-cache .              # Sans cache
docker build --build-arg KEY=val .     # Arguments de build
docker build --target stage .          # Multi-stage : étape cible
docker build --secret id=x,src=f .    # Secret de build (BuildKit)
docker build --platform linux/amd64,linux/arm64 . # Multi-arch
```

### Système

```bash
docker info                            # Infos sur le daemon
docker version                         # Versions client/serveur
docker system df [-v]                  # Espace disque
docker system prune [-a] [--volumes]  # Nettoyer les inutilisés
docker system events                   # Événements
```

### Options courantes de `docker run`

```
-d, --detach              En arrière-plan
-it                       Interactif + TTY (bash, sh)
--name <nom>              Nommer le conteneur
-p hôte:conteneur         Redirection de port
-p 127.0.0.1:8080:80     Port sur interface spécifique (sécurité)
-P                        Rediriger tous les ports EXPOSE (aléatoire)
-v volume:path            Monter un volume
-v /hôte:/conteneur       Bind mount
--mount type=...          Montage explicite (recommandé)
-e VAR=valeur             Variable d'environnement
--env-file fichier        Variables depuis un fichier
--network <réseau>        Réseau à utiliser
--hostname <nom>          Hostname du conteneur
--restart politique       no | on-failure | always | unless-stopped
--rm                      Supprimer à l'arrêt
--memory 256m             Limite mémoire
--memory-swap 256m        Limite mémoire + swap
--cpus 0.5                Limite CPU
--pids-limit 100          Limite processus (fork bomb)
--read-only               Système de fichiers en lecture seule
--tmpfs /tmp              Répertoire en RAM
--user uid:gid            Utilisateur d'exécution
--cap-drop ALL            Supprimer toutes les capabilities
--cap-add CAP_XXX         Ajouter une capability spécifique
--security-opt no-new-privileges:true  Interdire escalade privilèges
--security-opt seccomp=profil.json     Profil seccomp custom
--security-opt apparmor=profil         Profil AppArmor custom
--privileged              ❌ Désactive toutes protections (éviter !)
--workdir /app            Répertoire de travail
--label key=value         Métadonnée
--init                    Utiliser tini comme PID 1 (gestion signaux)
--health-cmd="..."        Commande de healthcheck
--health-interval=30s     Intervalle du healthcheck
--log-driver=syslog       Driver de logs
```

---

## 26. Glossaire

| Terme | Définition simple |
|---|---|
| **Image** | Modèle immuable en couches (read-only) depuis lequel les conteneurs sont créés. Comme un moule à gâteau. |
| **Conteneur** | Instance en cours d'exécution d'une image. Processus isolé avec sa propre couche d'écriture. Comme un gâteau fabriqué avec le moule. |
| **Layer (couche)** | Modification du système de fichiers représentant une instruction du Dockerfile. Les layers sont partagés et mis en cache. |
| **Registry** | Dépôt de stockage et distribution d'images (Docker Hub, GHCR, Harbor...). Comme GitHub pour le code. |
| **Dockerfile** | Fichier texte contenant les instructions pour construire une image. Comme une recette de cuisine. |
| **Volume** | Mécanisme de persistance des données géré par Docker, indépendant du cycle de vie des conteneurs. |
| **Bind Mount** | Lien direct entre un chemin de l'hôte et le conteneur. Idéal pour le développement. |
| **Namespace** | Mécanisme Linux donnant à un groupe de processus une vue isolée d'une ressource (PID, réseau, système de fichiers...). Les "murs" entre conteneurs. |
| **Cgroup** | Control Group : limite et comptabilise l'utilisation des ressources (CPU, RAM, I/O) par un groupe de processus. Les "compteurs individuels". |
| **Capability** | Fragment du privilège root Linux. Permet d'accorder des droits spécifiques sans donner root complet. |
| **Seccomp** | Filtre des appels système au niveau kernel. Un syscall non autorisé tue le processus. |
| **AppArmor/SELinux** | Systèmes de contrôle d'accès obligatoire (MAC) restreignant les actions des processus. |
| **Bridge** | Type de réseau Docker par défaut. Réseau virtuel NATé derrière l'IP de l'hôte. |
| **NAT** | Network Address Translation : traduction d'adresses IP privées ↔ publiques. |
| **daemon** | Processus `dockerd` qui gère tous les conteneurs en arrière-plan. Tourne en root par défaut. |
| **containerd** | Runtime de gestion du cycle de vie des conteneurs (sous le daemon). |
| **runc** | Outil bas niveau d'exécution OCI des conteneurs (sous containerd). |
| **BuildKit** | Moteur de build moderne de Docker. Plus rapide, parallèle, gestion avancée du cache et des secrets. |
| **Multi-stage build** | Technique de build en plusieurs étapes pour produire des images légères. |
| **ENTRYPOINT** | Point d'entrée fixe d'un conteneur. Définit le programme principal. |
| **CMD** | Commande par défaut d'un conteneur. Surchargeable via `docker run`. |
| **HEALTHCHECK** | Instruction Dockerfile ou option Docker définissant comment vérifier la santé d'un conteneur. |
| **CIS Benchmark** | Guide de bonnes pratiques de sécurité du Center for Internet Security. |
| **CVE** | Common Vulnerabilities and Exposures : identifiant unique d'une vulnérabilité de sécurité. |
| **CI/CD** | Intégration Continue / Déploiement Continu : automatisation du build, test et déploiement. |
| **DCT** | Docker Content Trust : signature cryptographique garantissant l'intégrité des images. |
| **OCI** | Open Container Initiative : standards ouverts pour le format d'image et le runtime. |
| **Swarm** | Orchestrateur natif Docker pour clusters multi-hôtes. Intégré à Docker. |
| **Kubernetes (K8s)** | Standard de l'orchestration de conteneurs en production. 8 lettres entre K et s. |
| **Pod** | Plus petite unité Kubernetes, contenant un ou plusieurs conteneurs partageant réseau et stockage. |
| **Rootless mode** | Mode Docker où le daemon et les conteneurs tournent sans privilèges root. |
| **SOPS** | Secrets OPerationS : outil de chiffrement de fichiers de secrets pour les versionner en sécurité. |
| **Distroless** | Images sans distribution Linux (pas de shell, pas de gestionnaire de paquets). Surface d'attaque minimale. |
| **Alpine** | Distribution Linux minimaliste (~5 Mo), souvent utilisée comme image de base légère. |
| **scratch** | Image Docker vide, point de départ pour les binaires statiques. |
| **userns-remap** | Fonctionnalité Docker mappant le root du conteneur sur un utilisateur non privilégié de l'hôte. |
| **Trivy** | Scanner de vulnérabilités open source pour images Docker, dépôts Git et IaC. |
| **Hadolint** | Linter de Dockerfile vérifiant les bonnes pratiques. |
| **Dockle** | Outil d'audit de sécurité des images Docker basé sur les règles CIS. |

---

## Ressources pour Aller Plus Loin

| Ressource | URL |
|---|---|
| Documentation officielle Docker | https://docs.docker.com |
| Docker Hub | https://hub.docker.com |
| CIS Benchmark Docker | https://www.cisecurity.org |
| Docker Bench for Security | https://github.com/docker/docker-bench-security |
| Hadolint (Dockerfile linter) | https://github.com/hadolint/hadolint |
| Trivy (scan de vulnérabilités) | https://github.com/aquasecurity/trivy |
| Dockle (audit d'images) | https://github.com/goodwithtech/dockle |
| Lynis (audit système) | https://github.com/CISOfy/lynis |
| Chainguard Images (CVE ≈ 0) | https://www.chainguard.dev |
| OWASP Docker Cheat Sheet | https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html |
| Blog Stéphane Robert (DevOps) | https://blog.stephane-robert.info |
| Enix — Guide Docker/Kubernetes | https://enix.io/fr/guide/docker-kubernetes/ |
| Red Hat — Qu'est-ce que la conteneurisation | https://www.redhat.com/fr/topics/cloud-native-apps/what-is-containerization |

---

*Documentation enrichie à partir des sources ENI, blog.stephane-robert.info, documentation officielle Docker et des meilleures pratiques de l'industrie.
