---
title: "🏗️ Packer & Golden Image Odoo 19"
description: "Guide pédagogique complet - Packer & Golden Image Odoo 19"
created: "2026-03-29"
#updated: "2026-02-02"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"

---

> **Public visé** : Débutants, développeurs, administrateurs système, DevOps  
<!-- > **Niveau** : Débutant → Intermédiaire  
> **Durée estimée** : 60 à 120 minutes de lecture et pratique -->

---

## 📚 Table des matières

1. [C'est quoi Packer ?](#1-cest-quoi-packer-)
2. [Les concepts fondamentaux](#2-les-concepts-fondamentaux)
3. [Architecture d'un template Packer](#3-architecture-dun-template-packer)
4. [Le workflow Packer étape par étape](#4-le-workflow-packer-étape-par-étape)
5. [Cas pratique : Golden Image Odoo 19](#5-cas-pratique--golden-image-odoo-19)
6. [Bonnes pratiques](#6-bonnes-pratiques)
7. [Pièges fréquents et solutions](#7-pièges-fréquents-et-solutions)
8. [Comparaison avec d'autres outils](#8-comparaison-avec-dautres-outils)
9. [Aller plus loin](#9-aller-plus-loin)
10. [Récapitulatif visuel](#10-récapitulatif-visuel)
11. [🚨 Sécurité de la chaîne d'approvisionnement — L'affaire Trivy](#11--sécurité-de-la-chaîne-dapprovisionnement--laffaire-trivy)

---

## 1. C'est quoi Packer ?

### 🎯 Définition simple

**Packer** est un outil gratuit et open source créé par [HashiCorp](https://www.hashicorp.com/). Il permet de **créer automatiquement des images machines** prêtes à l'emploi, que ce soit pour le cloud (AWS, Azure, GCP), des VMs locales ou des conteneurs Docker.

> 💡 **Analogie cuisine** : Si ton infrastructure était une cuisine, Packer serait la **recette écrite et reproductible** qui te permet de préparer le même plat identique à chaque fois, peu importe qui cuisine et dans quelle cuisine.

### 🖼️ C'est quoi une "image machine" ?

Une **image machine**, c'est une **photo instantanée** d'un système d'exploitation déjà configuré et prêt à l'emploi. Elle contient :

- Le système d'exploitation (Ubuntu, Debian, Windows…)
- Les logiciels installés (Odoo, Nginx, PostgreSQL…)
- Les fichiers de configuration
- Les correctifs de sécurité appliqués

### ⭐ C'est quoi une "Golden Image" ?

Une **Golden Image** ("Image Dorée") est une image de référence **préconfigurée, testée et validée**. Elle sert de **base commune** pour tous tes déploiements.

| Aspect | Sans Golden Image | Avec Golden Image |
|--------|-------------------|-------------------|
| Déploiement | Installation manuelle à chaque fois | Image prête en quelques secondes |
| Cohérence | Risque de différences entre serveurs | Tous les serveurs sont identiques |
| Sécurité | Mises à jour oubliées possibles | Correctifs intégrés dès le départ |
| Documentation | Notes personnelles, wiki obsolète | Le template HCL **est** la documentation |
| Versioning | Difficile à tracer | Versionné avec Git comme du code |

---

## 2. Les concepts fondamentaux

### 🏗️ Les 3 composants clés

Packer fonctionne avec **3 types de composants** qui s'exécutent dans un ordre précis :

```
┌─────────────────────────────────────────────────────┐
│                   TEMPLATE PACKER                   │
│                                                     │
│  1. BUILDER       2. PROVISIONERS    3. POST-PROCS  │
│  ┌──────────┐     ┌─────────────┐    ┌───────────┐  │
│  │ Crée la  │ --> │ Configure   │ -> │ Finalise  │  │
│  │ machine  │     │ la machine  │    │ l'image   │  │
│  │temporaire│     │(installe,   │    │(push,     │  │
│  │          │     │ configure)  │    │ compress) │  │
│  └──────────┘     └─────────────┘    └───────────┘  │
└─────────────────────────────────────────────────────┘
```

---

### 🔨 Les Builders — "Je crée la machine"

Le **builder** est responsable de **démarrer une machine temporaire** sur la plateforme cible. C'est lui qui sait comment créer une VM sur AWS, un conteneur Docker, etc.

| Builder | Plateforme | Usage typique |
|---------|-----------|---------------|
| `docker` | Docker | Images de conteneurs |
| `amazon-ebs` | AWS | AMIs pour EC2 |
| `azure-arm` | Azure | Images managées |
| `qemu` | KVM / libvirt | VMs Linux locales |
| `proxmox-iso` | Proxmox | Templates VM homelab |
| `virtualbox-iso` | VirtualBox | Images de développement |

> 💡 Packer supporte plus de **52 builders** via son système de plugins.

---

### ⚙️ Les Provisioners — "Je configure la machine"

Les **provisioners** s'exécutent **après** la création de la machine temporaire. Ils installent des logiciels, copient des fichiers, lancent des scripts.

| Provisioner | Description | Exemple d'usage |
|-------------|-------------|-----------------|
| `shell` | Exécute des commandes bash | Installer des paquets apt |
| `ansible` | Exécute des playbooks Ansible | Configuration complexe |
| `file` | Copie des fichiers locaux vers la VM | Copier des configs |
| `powershell` | Scripts PowerShell | Images Windows |

> ⚠️ Les provisioners s'exécutent **dans l'ordre** dans lequel ils sont déclarés dans le template.

---

### 📦 Les Post-Processors — "Je finalise l'image"

Les **post-processors** s'exécutent **après** la création de l'image. Ils permettent des actions supplémentaires.

| Post-Processor | Action |
|----------------|--------|
| `docker-tag` | Tague l'image Docker |
| `docker-push` | Pousse vers un registry (Docker Hub, Harbor…) |
| `manifest` | Génère un fichier JSON avec les métadonnées du build |
| `compress` | Compresse l'image en archive |
| `checksum` | Calcule les checksums SHA256/MD5 |

---

## 3. Architecture d'un template Packer

### 📄 Le format HCL2

Depuis Packer v1.7.0, le format recommandé est **HCL2** (HashiCorp Configuration Language). C'est lisible, structuré, et supporte les variables, les boucles, les conditions.

> ⚠️ L'ancien format JSON est encore supporté mais est considéré **legacy**. Utilisez HCL2 pour tous vos nouveaux projets.

### 🗂️ Structure d'un template HCL

Un template Packer est composé de **4 blocs principaux** :

```hcl
# ┌──────────────────────────────────────────────────────┐
# │  BLOC 1 : packer {}                                   │
# │  Déclare la version minimale de Packer et les plugins │
# └──────────────────────────────────────────────────────┘

packer {
  # Version minimale requise de l'outil Packer
  required_version = ">= 1.15.0"

  required_plugins {
    # Déclaration du plugin Docker
    # Packer va le télécharger automatiquement lors du "packer init"
    docker = {
      version = ">= 1.1.0"
      source  = "github.com/hashicorp/docker"
    }
  }
}


# ┌──────────────────────────────────────────────────────┐
# │  BLOC 2 : variable {}                                 │
# │  Paramètres réutilisables et configurables            │
# └──────────────────────────────────────────────────────┘

variable "image_name" {
  type        = string          # Type de donnée : string, number, bool, list...
  default     = "mon-app"       # Valeur par défaut (optionnelle)
  description = "Nom de l'image Docker finale"
}


# ┌──────────────────────────────────────────────────────┐
# │  BLOC 3 : source {}                                   │
# │  Définit le builder et sa configuration               │
# └──────────────────────────────────────────────────────┘

source "docker" "ubuntu" {
  image  = "ubuntu:24.04"  # Image Docker de base à utiliser
  commit = true             # Enregistrer le conteneur comme image après provisioning
}


# ┌──────────────────────────────────────────────────────┐
# │  BLOC 4 : build {}                                    │
# │  Orchestre sources, provisioners et post-processors   │
# └──────────────────────────────────────────────────────┘

build {
  # Référence le builder défini plus haut (type.nom)
  sources = ["source.docker.ubuntu"]

  # Provisioner : installe des paquets sur la machine temporaire
  provisioner "shell" {
    inline = [
      "apt-get update",
      "apt-get install -y curl"
    ]
  }

  # Post-processor : tague l'image avec un nom et une version
  post-processor "docker-tag" {
    repository = "mon-registry/mon-app"
    tags       = ["latest", "1.0.0"]
  }
}
```

---

## 4. Le workflow Packer étape par étape

### Étape 1 — `packer init` : Installer les plugins

```bash
# Cette commande lit le bloc "required_plugins" dans ton template
# et télécharge automatiquement les plugins nécessaires.
#
# ✅ À exécuter UNE SEULE FOIS par projet
#    (ou quand tu ajoutes un nouveau plugin)

packer init mon-template.pkr.hcl
```

**Ce qui se passe :**
- Packer lit le bloc `required_plugins`
- Il télécharge les plugins depuis `releases.hashicorp.com` ou GitHub
- Les plugins sont stockés dans `~/.config/packer/plugins/`

---

### Étape 2 — `packer validate` : Vérifier la syntaxe

```bash
# Vérifie que le template est syntaxiquement correct
# et que toutes les références sont valides.
#
# ✅ Ne crée RIEN — c'est une vérification uniquement
# ✅ Très rapide (quelques secondes)
# ✅ À exécuter AVANT chaque build pour éviter les erreurs

packer validate mon-template.pkr.hcl
```

**Ce que ça vérifie :**
- La syntaxe HCL (pas d'accolades manquantes, etc.)
- Les références entre blocs (variable non définie, builder inexistant…)
- Les types de variables

---

### Étape 3 — `packer build` : Construire l'image

```bash
# Lance la construction complète de l'image.
# C'est l'étape qui prend du temps.
#
# Option : passer des variables en ligne de commande avec -var
packer build \
  -var "image_name=mon-app" \
  mon-template.pkr.hcl

# Alternative : passer un fichier de variables
packer build \
  -var-file="prod.pkrvars.hcl" \
  mon-template.pkr.hcl
```

**Ce qui se passe en coulisses :**

```
1. 🚀 Démarrage  → Le builder crée la machine temporaire
2. 🔗 Connexion  → Packer se connecte (SSH, WinRM, ou exec Docker)
3. ⚙️  Config    → Les provisioners configurent la machine
4. 📸 Capture   → Le builder crée l'image finale
5. 🗑️  Nettoyage → La machine temporaire est détruite
6. 📦 Post-proc → Les post-processors s'exécutent (tag, push…)
```

---

## 5. Cas pratique : Golden Image Odoo 19

### 🎯 Objectif

Construire une image Docker **Ubuntu 24.04 + Odoo 19** prête à l'emploi, reproductible, et poussable sur un registry Harbor.

### 📁 Structure du projet

```
odoo19-packer/
├── odoo19.pkr.hcl          # Template principal Packer
├── variables.pkr.hcl        # Déclaration des variables
├── prod.pkrvars.hcl         # Valeurs des variables (NE PAS versionner si secrets)
└── scripts/
    └── install_odoo.sh      # Script d'installation Odoo
```

---

### 📄 Fichier 1 : `variables.pkr.hcl`

```hcl
# ============================================================
# FICHIER : variables.pkr.hcl
# RÔLE    : Déclare toutes les variables paramétrables du build
# ============================================================

# URL du package .deb officiel d'Odoo 19
# On le rend configurable pour faciliter les mises à jour de version
variable "odoo_deb_url" {
  type        = string
  description = "URL complète du fichier .deb Odoo 19 à télécharger"
  # Pas de valeur par défaut : elle DOIT être fournie au build
}

# Empreinte SHA256 du package Odoo pour vérifier son intégrité
# INDISPENSABLE pour éviter d'installer un package corrompu ou malveillant
variable "odoo_deb_sha256" {
  type        = string
  description = "Empreinte SHA256 du package .deb (vérification d'intégrité)"
}

# Nom de l'image Docker produite
variable "image_name" {
  type        = string
  default     = "odoo19"   # Valeur par défaut si non spécifié
  description = "Nom de l'image Docker finale"
}

# Adresse du registry Harbor où pousser l'image
variable "harbor_registry" {
  type        = string
  default     = "192.168.5.120"
  description = "Adresse IP ou hostname du registry Harbor"
}
```

---

### 📄 Fichier 2 : `odoo19.pkr.hcl` (template principal)

```hcl
# ============================================================
# FICHIER : odoo19.pkr.hcl
# RÔLE    : Template principal — orchestre le build Odoo 19
# ============================================================

# ── Bloc packer ──────────────────────────────────────────────
packer {
  required_version = ">= 1.15.0"

  required_plugins {
    docker = {
      version = ">= 1.1.0"
      source  = "github.com/hashicorp/docker"
    }
  }
}


# ── Source : Builder Docker ───────────────────────────────────
# On part d'une image Ubuntu 24.04 "propre" (LTS, support long terme)
source "docker" "odoo19" {
  image  = "ubuntu:24.04"

  # commit = true : au lieu de créer un .tar, Packer commit le conteneur
  # comme une vraie image Docker (comme un "docker commit")
  commit = true
}


# ── Build : Assemblage complet ────────────────────────────────
build {
  # Référence le builder défini ci-dessus
  sources = ["source.docker.odoo19"]

  # ── Provisioner : Installation d'Odoo ────────────────────
  # On délègue l'installation à un script externe pour garder
  # le template HCL lisible et le script testable indépendamment
  provisioner "shell" {
    # Chemin vers le script d'installation
    script = "scripts/install_odoo.sh"

    # Passage des variables Packer comme variables d'environnement
    # pour que le script bash puisse y accéder
    environment_vars = [
      "ODOO_DEB_URL=${var.odoo_deb_url}",
      "ODOO_DEB_SHA256=${var.odoo_deb_sha256}",
    ]
  }

  # ── Post-Processor : Tag de l'image finale ───────────────
  # On tague l'image avec le nom du registry Harbor + version
  post-processor "docker-tag" {
    # Chemin complet dans le registry : registry/projet/image
    repository = "${var.harbor_registry}/odoo/${var.image_name}"

    # Plusieurs tags : "latest" pour la dernière version,
    # + tag daté pour garder un historique versionné
    tags = ["latest", "19.0.20260328"]
  }
}
```

---

### 📄 Fichier 3 : `scripts/install_odoo.sh`

```bash
#!/usr/bin/env bash
# ============================================================
# FICHIER : scripts/install_odoo.sh
# RÔLE    : Installe et configure Odoo 19 dans le conteneur
# ============================================================

# ── Sécurité du script ────────────────────────────────────────
# Ces options sont INDISPENSABLES dans un script de provisioning :
#   -e  : Arrêt immédiat si une commande échoue (exit on error)
#   -u  : Erreur si une variable non définie est utilisée
#   -x  : Affiche chaque commande avant exécution (debug)
#   -o pipefail : Détecte les erreurs dans les pipes (cmd1 | cmd2)
set -euxo pipefail


# ── Variables (injectées par Packer via environment_vars) ─────
# Ces variables sont définies dans le template HCL et transmises
# à ce script comme variables d'environnement
ODOO_DEB_URL="${ODOO_DEB_URL}"
ODOO_DEB_SHA256="${ODOO_DEB_SHA256}"


# ── 1. Mode non-interactif ─────────────────────────────────────
# DEBIAN_FRONTEND=noninteractive empêche apt-get de poser
# des questions interactives (timezone, localisation, etc.)
# Sans ça, le build se BLOQUE en attendant une saisie utilisateur !
export DEBIAN_FRONTEND=noninteractive


# ── 2. Configuration de la timezone ───────────────────────────
# tzdata pose normalement une question interactive "Quelle timezone ?"
# On préconfigure la réponse AVANT son installation pour éviter le blocage

# Écrire la timezone dans le fichier de configuration système
echo "Europe/Paris" > /etc/timezone

# Créer le lien symbolique vers le fichier zoneinfo correspondant
ln -sf /usr/share/zoneinfo/Europe/Paris /etc/localtime


# ── 3. Mise à jour et installation des prérequis ──────────────
# On met d'abord à jour la liste des paquets disponibles
apt-get update

# Installation minimale des outils nécessaires :
#   --no-install-recommends : n'installe pas les paquets "recommandés"
#                             pour garder l'image légère
#   tzdata  : gestion des timezones (configuré en non-interactif)
#   curl    : pour télécharger le package Odoo
#   gnupg   : pour vérifier les signatures (non utilisé ici mais bonne pratique)
apt-get install -y --no-install-recommends \
  tzdata \
  curl \
  gnupg


# ── 4. Création de l'utilisateur Odoo ─────────────────────────
# Odoo doit tourner avec son propre utilisateur système (pas root !)
# C'est une bonne pratique de sécurité : principe du moindre privilège

# Créer le groupe "odoo" avec l'ID 1000 s'il n'existe pas encore
# "|| true" : si la commande échoue (groupe déjà existant), on continue quand même
if ! getent group odoo; then
  groupadd -g 1000 odoo || true
fi

# Créer l'utilisateur "odoo" s'il n'existe pas encore
#   -u 1000    : UID fixe (important pour la cohérence entre conteneurs)
#   -g odoo    : groupe principal
#   -m         : créer le répertoire home
#   -d ...     : chemin du répertoire home
#   -s /bin/bash : shell par défaut
if ! id -u odoo >/dev/null 2>&1; then
  useradd -u 1000 -g odoo -m -d /var/lib/odoo -s /bin/bash odoo || true
fi


# ── 5. Téléchargement du package Odoo ─────────────────────────
# On télécharge le fichier .deb depuis l'URL fournie en variable
#   -o /tmp/odoo.deb  : fichier de destination
#   -sSL              : silencieux, suis les redirections, mode SSL

echo "📥 Téléchargement d'Odoo depuis : $ODOO_DEB_URL"
curl -o /tmp/odoo.deb -sSL "$ODOO_DEB_URL"


# ── 6. Vérification de l'intégrité (SHA256) ───────────────────
# ÉTAPE DE SÉCURITÉ CRITIQUE !
# On vérifie que le fichier téléchargé correspond bien à l'empreinte attendue.
# Si quelqu'un a altéré le fichier (attaque, corruption réseau…), le build ÉCHOUE ici.
#
# Format attendu par sha256sum : "<hash>  <fichier>"
#                                 ↑ deux espaces entre hash et nom de fichier

echo "🔒 Vérification de l'intégrité SHA256..."
echo "$ODOO_DEB_SHA256  /tmp/odoo.deb" | sha256sum -c -

# Si la vérification échoue, sha256sum retourne un code d'erreur non-zéro
# et le script s'arrête immédiatement (grâce à set -e défini en début de script)


# ── 7. Installation d'Odoo ─────────────────────────────────────
echo "⚙️  Installation d'Odoo 19..."

# On installe le .deb local
# apt-get résoudra et installera automatiquement toutes les dépendances
apt-get install -y --no-install-recommends /tmp/odoo.deb


# ── 8. Nettoyage ──────────────────────────────────────────────
# IMPORTANT pour garder l'image légère !
# On supprime tout ce qui n'est plus nécessaire après l'installation :
echo "🧹 Nettoyage des fichiers temporaires..."

# Supprimer le fichier .deb téléchargé (plus besoin après installation)
rm -rf /tmp/odoo.deb

# Vider le cache APT (listes de paquets et paquets en cache)
# Ces fichiers peuvent représenter plusieurs centaines de Mo
rm -rf /var/lib/apt/lists/*

echo "✅ Installation d'Odoo 19 terminée avec succès !"
```

---

### 📄 Fichier 4 : `prod.pkrvars.hcl` (valeurs des variables)

```hcl
# ============================================================
# FICHIER : prod.pkrvars.hcl
# RÔLE    : Valeurs concrètes des variables pour l'environnement de production
# ⚠️  CE FICHIER NE DOIT PAS ÊTRE VERSIONNÉ si il contient des secrets
#     Ajoutez-le à votre .gitignore si nécessaire
# ============================================================

# URL officielle du package Odoo 19 (à adapter selon la version exacte)
odoo_deb_url = "https://nightly.odoo.com/19.0/nightly/deb/odoo_19.0.latest_all.deb"

# Empreinte SHA256 du package (à récupérer sur le site officiel Odoo ou via sha256sum)
# Exemple : sha256sum odoo_19.0.latest_all.deb
odoo_deb_sha256 = "a1b2c3d4e5f6...valeur_sha256_réelle_ici"

# Nom de l'image (optionnel car une valeur par défaut existe dans variables.pkr.hcl)
image_name = "odoo19"

# Adresse du registry Harbor local
harbor_registry = "192.168.5.120"
```

---

## 6. Workflow complet — Du build au push

### 🚀 Commandes dans l'ordre

```bash
# ── Étape 1 : Initialiser le projet Packer ────────────────────
# Télécharge les plugins déclarés dans required_plugins
# N'exécuter qu'UNE SEULE FOIS (ou si on ajoute un nouveau plugin)
packer init odoo19.pkr.hcl


# ── Étape 2 : Valider la syntaxe du template ──────────────────
# Détecte les erreurs AVANT de lancer le build (rapide, aucun coût)
packer validate -var-file="prod.pkrvars.hcl" odoo19.pkr.hcl


# ── Étape 3 : Construire l'image ──────────────────────────────
# Lance le build complet (peut prendre 5 à 15 minutes)
packer build -var-file="prod.pkrvars.hcl" odoo19.pkr.hcl

# Alternative : passer les variables directement en ligne de commande
packer build \
  -var "odoo_deb_url=https://..." \
  -var "odoo_deb_sha256=abc123..." \
  odoo19.pkr.hcl


# ── Étape 4 : Vérifier l'image créée ─────────────────────────
# Lister les images Docker disponibles localement
docker images | grep odoo19

# Résultat attendu :
# 192.168.5.120/odoo/odoo19   latest   sha256:abc...   5 minutes ago   1.2GB
# 192.168.5.120/odoo/odoo19   19.0.20260328   sha256:abc...   5 minutes ago   1.2GB


# ── Étape 5 : Pousser vers Harbor ─────────────────────────────
# Se connecter au registry Harbor
docker login 192.168.5.120

# Pousser l'image vers le registry
docker push 192.168.5.120/odoo/odoo19:latest
docker push 192.168.5.120/odoo/odoo19:19.0.20260328
```

---

## 7. Bonnes pratiques

### ✅ Checklist d'un bon template Packer

```
□ Utiliser set -euxo pipefail dans tous les scripts bash
□ Configurer DEBIAN_FRONTEND=noninteractive avant apt-get
□ Vérifier l'intégrité des téléchargements avec SHA256
□ Ne jamais hardcoder de secrets dans le template HCL
□ Nettoyer les caches et fichiers temporaires en fin de script
□ Versionner les images avec un tag daté (pas seulement "latest")
□ Toujours exécuter packer validate avant packer build
□ Utiliser des variables pour tous les paramètres changeants
```

### 🔐 Gestion des secrets

```bash
# ❌ MAUVAIS : secret hardcodé dans le template
variable "db_password" {
  default = "MonSuperMotDePasse123!"  # NE JAMAIS FAIRE ÇA !
}

# ✅ BON : secret passé via variable d'environnement
# Dans votre shell, avant de lancer packer build :
export PKR_VAR_db_password="MonSuperMotDePasse123!"
# Packer lit automatiquement les variables PKR_VAR_<nom>

# ✅ ENCORE MIEUX : utiliser HashiCorp Vault pour les secrets en production
```

---

## 8. Pièges fréquents et solutions

| Problème | Symptôme | Cause | Solution |
|----------|----------|-------|----------|
| **Blocage tzdata** | Build figé sur l'installation | tzdata demande une timezone interactivement | Configurer `DEBIAN_FRONTEND=noninteractive` et `echo "Europe/Paris" > /etc/timezone` avant l'installation |
| **UID/GID déjà existant** | `useradd: UID 1000 is not unique` | L'UID 1000 est déjà pris dans l'image de base | Vérifier avec `id -u odoo` avant création, utiliser `|| true` |
| **Plugin manquant** | `Error: Could not find plugin` | `packer init` non exécuté | Toujours lancer `packer init` en premier |
| **Package corrompu** | Erreur SHA256 | Téléchargement interrompu | Relancer le build, vérifier l'URL |
| **Secrets exposés** | Secrets visibles dans les logs ou Git | Variables hardcodées | Utiliser `PKR_VAR_*` ou Vault |
| **Image trop lourde** | Image de plusieurs Go | Cache APT non nettoyé | Ajouter `rm -rf /var/lib/apt/lists/*` en fin de script |
| **Build non reproductible** | Images différentes selon la date | `apt-get upgrade` modifie les versions | Épingler les versions des paquets critiques |

---

## 9. Comparaison avec d'autres outils

### Packer vs Dockerfile

```
┌─────────────────────────────────────────────────────────────┐
│                  PACKER vs DOCKERFILE                        │
├─────────────────────────────┬───────────────────────────────┤
│         PACKER              │         DOCKERFILE             │
├─────────────────────────────┼───────────────────────────────┤
│ VMs ET conteneurs           │ Conteneurs uniquement          │
│ Multi-plateforme            │ Docker uniquement              │
│ Shell, Ansible, Chef...     │ Instructions Dockerfile        │
│ Intégration Terraform/Vault │ Écosystème Docker natif        │
│ Template versionné en HCL   │ Dockerfile versionné           │
└─────────────────────────────┴───────────────────────────────┘

💡 QUAND CHOISIR QUOI ?
→ Application web simple dans Docker : Dockerfile suffit
→ Infrastructure multi-cloud (AWS + Azure + on-prem) : Packer
→ Besoin de VMs et de conteneurs avec la même config : Packer
```

### Packer vs Ansible (seul)

```
┌─────────────────────────────────────────────────────────────┐
│                 PACKER vs ANSIBLE                            │
├─────────────────────────────┬───────────────────────────────┤
│         PACKER              │         ANSIBLE (seul)         │
├─────────────────────────────┼───────────────────────────────┤
│ Build time (avant deploy)   │ Run time (pendant deploy)      │
│ Image figée et immuable     │ Configuration dynamique        │
│ Démarrage INSTANTANÉ        │ Dépend de la complexité        │
│ Pas de réseau au démarrage  │ Requiert l'accès aux repos     │
└─────────────────────────────┴───────────────────────────────┘

💡 LA MEILLEURE APPROCHE : LES DEUX ENSEMBLE !
→ Packer + Ansible en provisioner = image pré-configurée
→ Ansible post-déploiement = mises à jour légères en production
```

---

## 10. Récapitulatif visuel

### 🗺️ Vue d'ensemble du workflow

```
  ┌─────────────────────────────────────────────────────────────────┐
  │                    WORKFLOW PACKER COMPLET                       │
  └─────────────────────────────────────────────────────────────────┘

  [Écriture du template]
       │
       ├── variables.pkr.hcl   → Variables paramétrables
       ├── odoo19.pkr.hcl      → Template principal
       └── scripts/install.sh  → Script de provisioning
       │
       ▼
  packer init
  └─ Télécharge les plugins (docker, ansible, etc.)
       │
       ▼
  packer validate
  └─ Vérifie la syntaxe — AUCUN build, AUCUN coût
       │
       ▼
  packer build
  ├─ 1. Builder démarre un conteneur Ubuntu 24.04
  ├─ 2. Packer se connecte au conteneur
  ├─ 3. Provisioner exécute install_odoo.sh
  │      ├─ Configuration timezone
  │      ├─ Installation dépendances
  │      ├─ Création utilisateur odoo
  │      ├─ Téléchargement + vérification SHA256
  │      ├─ Installation Odoo 19
  │      └─ Nettoyage des caches
  ├─ 4. Docker commit → Image créée
  ├─ 5. Conteneur temporaire détruit
  └─ 6. Post-processor docker-tag → Image taguée
       │
       ▼
  docker push → Image poussée sur Harbor Registry
       │
       ▼
  ✅ Golden Image Odoo 19 disponible pour tous les déploiements !
```

---

### 📌 Les commandes à retenir

```bash
# Installer les plugins
packer init montemplate.pkr.hcl

# Valider la syntaxe
packer validate montemplate.pkr.hcl

# Construire l'image
packer build montemplate.pkr.hcl

# Construire avec un fichier de variables
packer build -var-file="prod.pkrvars.hcl" montemplate.pkr.hcl

# Construire avec des variables inline
packer build -var "key=value" montemplate.pkr.hcl

# Déboguer un build (plus de logs)
PACKER_LOG=1 packer build montemplate.pkr.hcl
```

---

## 🎯 Pour aller plus loin

### Intégration avec Terraform

> Une fois ta Golden Image Odoo 19 créée, tu peux automatiser son déploiement avec Terraform :

```hcl
# Exemple : déployer l'image Odoo sur Azure Container Apps avec Terraform
resource "azurerm_container_app" "odoo" {
  name                         = "odoo19"
  container_app_environment_id = azurerm_container_app_environment.env.id
  resource_group_name          = azurerm_resource_group.rg.name
  revision_mode                = "Single"

  template {
    container {
      name   = "odoo19"
      # On utilise l'image construite avec Packer !
      image  = "192.168.5.120/odoo/odoo19:latest"
      cpu    = 1.0
      memory = "2Gi"
    }
  }
}
```

### Pousser sur plusieurs registries en parallèle

```hcl
# Dans le bloc build, on peut chaîner plusieurs post-processors
build {
  sources = ["source.docker.odoo19"]

  provisioner "shell" {
    script = "scripts/install_odoo.sh"
  }

  # Tag pour Harbor (registry privé)
  post-processor "docker-tag" {
    repository = "192.168.5.120/odoo/odoo19"
    tags       = ["latest"]
  }

  # Tag pour Docker Hub (registry public)
  post-processor "docker-tag" {
    repository = "monorg/odoo19"
    tags       = ["latest"]
  }
}
```

---

---

## 11. 🚨 Sécurité de la chaîne d'approvisionnement — L'affaire Trivy

> ⚠️ **Pourquoi cette section ici ?**  
> Construire une Golden Image, c'est bien. Mais si les **outils que tu utilises pour la sécuriser sont eux-mêmes compromis**, toute ta chaîne de confiance s'effondre. L'affaire Trivy de 2026 est l'exemple parfait d'une **attaque de supply chain** qui aurait pu contaminer des milliers de pipelines CI/CD. Comprendre ce qui s'est passé, c'est comprendre pourquoi les bonnes pratiques de sécurité ne sont pas optionnelles.

---

### 🔍 C'est quoi une attaque "supply chain" ?

**Supply chain** = chaîne d'approvisionnement logicielle. Dans notre contexte DevOps, ça désigne tout ce dont ton pipeline dépend pour fonctionner :

```
TON CODE
    │
    ├── Dépendances (npm, pip, go modules…)
    ├── Images Docker de base (ubuntu:24.04, python:3.12…)
    ├── Actions GitHub (actions/checkout, aquasecurity/trivy-action…)
    ├── Outils de build (Packer, GoReleaser, make…)
    └── Outils de sécurité (scanners de vulnérabilités, SAST…)
```

Une **attaque supply chain** ne cible pas ton code directement. Elle **empoisonne un maillon de cette chaîne** pour que tu télécharges et exécutes du code malveillant sans t'en rendre compte.

> 💡 **Analogie** : C'est comme si quelqu'un remplaçait les ingrédients dans les rayons de ton supermarché par des produits empoisonnés qui ressemblent exactement aux originaux. Tu cuisines ta recette habituelle, mais le résultat est toxique.

---

### 📖 L'affaire Trivy — Chronologie et analyse

#### Qu'est-ce que Trivy ?

**Trivy** est un scanner de vulnérabilités open source très populaire, développé par Aqua Security. Il est massivement utilisé dans les pipelines CI/CD pour détecter des failles dans les images Docker, les dépendances, les fichiers IaC, etc. C'est exactement le genre d'outil qu'on intègrerait dans un pipeline de création de Golden Image.

#### Acte I — Fin février 2026 : Le dépôt vidé

Fin février 2026, le dépôt GitHub de Trivy est compromis via une attaque dite **Pwn Request** : un workflow GitHub Actions mal configuré permet à un attaquant de voler un token (`ORG_REPO_TOKEN`) associé au compte de service `aqua-bot`. Ce token avait des permissions très étendues sur au moins 33 workflows de l'organisation.

Résultat immédiat : releases supprimées, dépôt partiellement vidé. Spectaculaire, mais principalement destructeur.

#### Acte II — 19 mars 2026 : La release empoisonnée

Vingt jours plus tard, le même credential volé — **jamais révoqué entre-temps** — est réutilisé pour une attaque beaucoup plus sophistiquée.

```
Chronologie du 19 mars 2026 (heure UTC) :

17:43 → Tag v0.69.4 poussé vers un commit malveillant
         Déclenchement automatique des workflows de release

17:51 → Tentative abandonnée (tag v0.70.0 supprimé)
         L'attaquant choisit v0.69.4 pour se fondre dans la série existante

18:05 → Bot Homebrew ouvre automatiquement une PR pour intégrer 0.69.4

18:25 → Publication officielle de la release compromise sur GitHub

19:35 → PR Homebrew mergée → bouteilles compromises disponibles

22:06 → Réécriture en rafale des tags v0.1.0 à v0.2.5 sur setup-trivy
         via l'API GitHub directement (aucun workflow déclenché)

22 mars → Images Docker Hub 0.69.5 et 0.69.6 poussées
           (sans release GitHub correspondante)
           Le tag "latest" pointe désormais vers 0.69.6 compromise
```

#### Comment la release malveillante a-t-elle été construite ?

L'attaquant a préparé deux **commits imposteurs** : un ciblant `actions/checkout`, un autre ciblant `aquasecurity/trivy`. Ces commits étaient conçus pour paraître légitimes :

- Auteurs crédibles et messages de commit plausibles
- Modifications volontairement discrètes pour se noyer dans un diff ordinaire

Le commit côté Trivy introduisait trois changements clés :

```yaml
# Changement 1 : Pinning de actions/checkout vers un SHA malveillant
# (paradoxe : pinner par SHA est une BONNE pratique... sauf si le SHA est malveillant)
- uses: actions/checkout@v4
+ uses: actions/checkout@a1b2c3d4e5f6...  # SHA pointant vers un fork malveillant

# Changement 2 : Désactivation silencieuse de la validation GoReleaser
- args: release
+ args: release --skip=validate   # Contourne les vérifications de release

# Changement 3 : Modifications cosmétiques du YAML
# pour diluer les vrais signaux dans le diff et tromper les reviewers
```

#### Le domaine typosquatté — le vecteur de commande et contrôle

L'attaquant a utilisé le domaine **`scan.aquasecurtiy.org`** (remarque l'inversion : `securtiy` au lieu de `security`) pour piloter les machines compromises. Le faux `actions/checkout` téléchargeait depuis ce domaine des fichiers Go destinés à remplacer des composants du binaire Trivy.

```
Domaine légitime :  scan.aquasecurity.org
Domaine malveillant: scan.aquasecurtiy.org
                              ↑
                        "securtiy" ≠ "security"
                        inversion des lettres r et i
```

Les capacités documentées de la charge utile malveillante :
- Vol de secrets en mémoire
- Collecte de clés SSH
- Récupération de credentials cloud (AWS, Azure, GCP)
- Vol de tokens Kubernetes

#### Canaux de distribution touchés

| Canal | Statut | Versions affectées |
|-------|--------|-------------------|
| GitHub Releases | Compromis | v0.69.4 |
| Docker Hub | Compromis | v0.69.4, v0.69.5, v0.69.6, `latest` |
| Homebrew | Compromis puis rollback | v0.69.4 → rollback vers v0.69.3 |
| AWS ECR | Probablement compromis | v0.69.4 |
| GHCR | Probablement compromis | v0.69.4 |
| `trivy-action` | 75 tags sur 76 réécrits | Tous sauf `@0.35.0` |
| `setup-trivy` | Tags v0.1.0 à v0.2.5 supprimés | Seul v0.2.6 sain conservé |

> ⚠️ **Point critique sur `latest`** : Des pipelines qui ne demandaient **pas explicitement** les versions 0.69.5 ou 0.69.6 pouvaient récupérer une image compromise via un simple tag `latest`. C'est l'argument le plus fort contre l'utilisation de tags flottants en production.

---

### 🎓 Les leçons concrètes pour tes pipelines

#### Leçon 1 — Un secret partagé = une bombe à retardement

Dans l'affaire Trivy, un seul token (`ORG_REPO_TOKEN`) donnait accès à 33 workflows différents. La compromission d'un seul point a ouvert l'ensemble de l'organisation.

```yaml
# ❌ MAUVAIS : un token global d'organisation, partout
env:
  GITHUB_TOKEN: ${{ secrets.ORG_REPO_TOKEN }}  # Accès à tout l'org !

# ✅ BON : des permissions minimales, déclarées explicitement
permissions:
  contents: read      # Lecture seule par défaut
  packages: write     # Write uniquement là où c'est nécessaire

jobs:
  build:
    permissions:
      contents: read  # Jamais plus que nécessaire
```

#### Leçon 2 — La rotation immédiate n'est pas négociable

Le délai de **20 jours** entre l'incident initial et le second acte est précisément la fenêtre d'exploitation. Un credential volé qui n'est pas révoqué immédiatement reste une porte ouverte.

```bash
# Procédure à suivre dès qu'un secret est suspecté compromis :

# 1. Révoquer IMMÉDIATEMENT le token sur GitHub
#    → Settings > Developer Settings > Personal Access Tokens > Revoke

# 2. Auditer tous les workflows qui l'utilisaient
grep -r "ORG_REPO_TOKEN" .github/workflows/

# 3. Générer un nouveau token avec des permissions RÉDUITES

# 4. Auditer les actions effectuées avec le token compromis
#    → GitHub Audit Log de l'organisation
```

#### Leçon 3 — Pinner par SHA ne suffit pas si tu ne vérifies pas la provenance

```yaml
# ❌ DANGEREUX : SHA malveillant (légitime en apparence, mais orphelin)
- uses: actions/checkout@a1b2c3d4e5f6789abcdef...  # SHA non signé, non vérifié

# ✅ BON : SHA connu et vérifié + commentaire de traçabilité
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2
#                          ↑ Vérifier que ce SHA appartient bien au dépôt officiel
#                            et correspond à un tag de release connu

# ✅ ENCORE MIEUX : utiliser un outil comme Dependabot ou Renovate
# pour maintenir ces SHAs à jour automatiquement
```

**Comment vérifier un SHA ?**

```bash
# Vérifier qu'un SHA appartient bien à l'historique officiel d'un dépôt
git ls-remote https://github.com/actions/checkout | grep "v4.2.2"

# Vérifier qu'un commit est signé
git log --show-signature a1b2c3d4...
```

#### Leçon 4 — Évite les tags flottants en CI/CD critique

```yaml
# ❌ DANGEREUX : tag flottant — peut pointer vers n'importe quoi demain
image: aquasec/trivy:latest
- uses: aquasecurity/trivy-action@master

# ✅ BON : version épinglée
image: aquasec/trivy:0.68.0

# ✅ ENCORE MIEUX : digest immuable (un digest identifie une image de façon unique)
image: aquasec/trivy@sha256:abc123def456...
# Le digest d'une image ne change jamais, contrairement à un tag
```

#### Leçon 5 — Valide la provenance des artefacts que tu consommes

```bash
# Vérifier la signature cosign d'une image Docker (si disponible)
cosign verify aquasec/trivy:0.68.0 \
  --certificate-identity "https://github.com/aquasecurity/trivy/.github/workflows/release.yaml@refs/tags/v0.68.0" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com"

# Vérifier le SBOM (Software Bill of Materials) d'une image
syft aquasec/trivy:0.68.0

# Calculer et vérifier le SHA256 d'un binaire téléchargé
sha256sum trivy_0.68.0_Linux-64bit.tar.gz
# Comparer avec la valeur publiée sur le GitHub Release officiel
```

#### Leçon 6 — Audite régulièrement les permissions de tes workflows

```yaml
# ✅ Template de workflow GitHub Actions sécurisé
name: Build and scan

# Permissions globales minimales (read-only par défaut)
permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest

    # Permissions spécifiques au job (principe du moindre privilège)
    permissions:
      contents: read
      packages: write    # Uniquement si ce job pousse des images
      id-token: write    # Uniquement si ce job utilise OIDC

    steps:
      # Toujours pinner les actions par SHA vérifiable
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2

      # Éviter d'exposer les secrets en ligne de commande (visibles dans les logs)
      # ❌ Mauvais :
      # run: curl -H "Authorization: Bearer ${{ secrets.MY_TOKEN }}" ...

      # ✅ Bon : passer via une variable d'environnement
      - name: Call API
        env:
          MY_TOKEN: ${{ secrets.MY_TOKEN }}
        run: curl -H "Authorization: Bearer $MY_TOKEN" ...
```

---

### 🛡️ Si tu utilises Trivy — Que faire ?

#### Versions à traiter comme non fiables

```
❌ Binaires et images :
   - v0.69.4, v0.69.5, v0.69.6
   - Tag "latest" sur Docker Hub (entre le 19 et le 23 mars 2026)

❌ GitHub Actions :
   - aquasecurity/trivy-action : tous les tags SAUF @0.35.0
   - aquasecurity/setup-trivy  : toutes les versions AVANT v0.2.6

✅ Versions considérées saines :
   - Binaires/images : v0.68.x et antérieures (avant l'incident)
   - trivy-action    : @0.35.0 uniquement
   - setup-trivy     : v0.2.6 uniquement
```

#### Checklist de remédiation

```bash
# 1. Rechercher les références compromises dans tout ton dépôt
grep -r "0.69.4\|0.69.5\|0.69.6\|trivy:latest" \
  .github/workflows/ Dockerfiles/ helm/ k8s/

# 2. Vérifier les caches CI/CD et registries miroirs internes
#    (une image cachée peut persister même après nettoyage du pipeline)

# 3. Auditer les pulls Docker Hub autour des 19-23 mars 2026
docker events --since "2026-03-19" --until "2026-03-23" --filter type=image

# 4. Rechercher toute communication vers le domaine malveillant
grep -r "aquasecurtiy" /var/log/  # Note : "securtiy" avec faute de frappe !

# 5. Considérer comme compromis tout pipeline ayant exécuté
#    une version Trivy affectée pendant la fenêtre d'exposition

# 6. Rotation complète des secrets potentiellement exposés
#    (clés SSH, credentials cloud, tokens Kubernetes, PATs GitHub…)
```

---

### 🔄 Alternatives recommandées à Trivy

Tant qu'Aqua Security n'aura pas publié une analyse complète et transparente de l'ensemble de l'incident avec des garanties sur les mesures correctives, voici des alternatives matures à considérer :

| Outil | Rôle | Mainteneur | Maturité |
|-------|------|------------|----------|
| **Grype** | Scanner de vulnérabilités | Anchore | ✅ Production |
| **Syft** | Génération de SBOM | Anchore | ✅ Production |
| **Grype** + **Syft** | Remplacement complet de Trivy | Anchore | ✅ Production |

```bash
# Installer Grype (scanner de vulnérabilités — remplace trivy pour les CVE)
curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b /usr/local/bin

# Scanner une image Docker
grype aquasec/trivy:0.68.0

# Installer Syft (génération de SBOM — inventaire des dépendances)
curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin

# Générer un SBOM au format SPDX
syft aquasec/trivy:0.68.0 -o spdx-json > sbom.json
```

```yaml
# Équivalent GitHub Actions sécurisé
# Remplacer trivy-action par grype-action

- name: Scan image with Grype
  uses: anchore/scan-action@v3
  with:
    image: "mon-registry/mon-image:latest"
    fail-build: true
    severity-cutoff: high
```

---

### 🧠 La vraie leçon à retenir

L'affaire Trivy illustre un principe fondamental de la sécurité DevOps :

> **Un pipeline CI/CD doit être administré comme un système critique.**

Ce n'est pas seulement une question de code. C'est une question de :

```
┌─────────────────────────────────────────────────────────────┐
│              SÉCURITÉ D'UN PIPELINE CI/CD                    │
├──────────────────────────┬──────────────────────────────────┤
│ Séparation des privilèges│ Jamais de super-token global     │
│ Secrets éphémères        │ OIDC plutôt que PATs long-lived  │
│ Rotation immédiate       │ Révoquer dès suspicion, pas après│
│ Signatures obligatoires  │ Cosign pour images et commits    │
│ Contrôle des tags        │ Interdire "latest" en production │
│ Vérification provenance  │ SHA + signature + SBOM           │
│ Capacité de réponse      │ Runbook d'incident prêt à l'avance│
└──────────────────────────┴──────────────────────────────────┘
```

> 💬 **En résumé** : Si tu construis des Golden Images avec Packer, l'outil en lui-même est sûr. Mais **l'ensemble de la chaîne** — les actions GitHub que tu utilises, les images de base que tu consommes, les scanners que tu intègres — doit être traité avec le même niveau de rigueur. La Golden Image n'est aussi fiable que le maillon le plus faible de sa chaîne de fabrication.

---

> 📝 **Ce document est une documentation vivante.**  
> Versionne-le avec ton template Packer dans Git pour garder une trace de toutes les évolutions de ton infrastructure.  
>
> 🚀 **Prochaines étapes suggérées** :  
> 1. Installer Packer localement et tester le workflow avec une image Ubuntu simple  
> 2. Adapter le template à ta version d'Odoo  
> 3. Intégrer le build dans une pipeline CI/CD (GitHub Actions, GitLab CI…)  
> 4. Auditer les permissions de tes workflows GitHub Actions existants  
> 5. Remplacer tous les tags `latest` par des versions épinglées dans tes pipelines
