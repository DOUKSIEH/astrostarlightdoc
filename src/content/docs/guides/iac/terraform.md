---
title: "🐳 Guide Terraform : Déployez votre infrastructure"
description: "📘 Documentation Ansible — Du débutant à la maîtrise"
created: "2026-04-04"
# updated: "2026-04-04"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"

---

# 🏗️ Terraform — Guide Complet de A à Z

> **Documentation pédagogique** couvrant l'architecture, les concepts fondamentaux, la sécurité, les modules, les backends distants, les rollbacks, les bonnes pratiques, et bien plus encore.

---

## Table des matières

1. [Introduction & Philosophie](#1-introduction--philosophie)
2. [Architecture de Terraform](#2-architecture-de-terraform)
3. [Déclaratif vs Impératif](#3-déclaratif-vs-impératif)
4. [Installation & Premier pas](#4-installation--premier-pas)
5. [Le langage HCL](#5-le-langage-hcl)
6. [Structure d'un projet](#6-structure-dun-projet)
7. [Le Workflow Terraform](#7-le-workflow-terraform)
8. [Provisionner une VM NixOS sur Proxmox](#8-provisionner-une-vm-nixos-sur-proxmox)
9. [La Gestion du State](#9-la-gestion-du-state)
10. [Backends distants — GitLab & Azure](#10-backends-distants--gitlab--azure)
11. [Rollbacks & Gestion des échecs](#11-rollbacks--gestion-des-échecs)
12. [Les Variables, Locals & Outputs](#12-les-variables-locals--outputs)
13. [Les Modules](#13-les-modules)
14. [Exemple : Serveur PostgreSQL sur Azure avec un module](#14-exemple--serveur-postgresql-sur-azure-avec-un-module)
15. [Concepts avancés](#15-concepts-avancés)
16. [Bonnes pratiques de sécurité](#16-bonnes-pratiques-de-sécurité)
17. [CI/CD avec GitLab CI & GitHub Actions](#17-cicd-avec-gitlab-ci--github-actions)
18. [Limites de Terraform](#18-limites-de-terraform)
19. [Terraform vs Ansible — Complémentarité](#19-terraform-vs-ansible--complémentarité)
20. [Outils de l'écosystème](#20-outils-de-lécosystème)
21. [Glossaire](#21-glossaire)

---

## 1. Introduction & Philosophie

### Qu'est-ce que Terraform ?

Terraform est un outil d'**Infrastructure as Code (IaC)** créé par HashiCorp. Il permet de **décrire, provisionner et gérer** des infrastructures cloud ou on-premises à travers des fichiers de configuration texte, versionnés dans Git comme du code applicatif.

**Sans Terraform :**
- Vous cliquez dans des consoles web
- Vous tapez des commandes ad hoc
- Personne ne sait exactement ce qui tourne en production
- Recréer un environnement prend des heures

**Avec Terraform :**
- Votre infrastructure est décrite dans des fichiers `.tf`
- `terraform apply` crée ou met à jour tout
- `terraform plan` montre exactement ce qui va changer
- Vous pouvez recréer un environnement identique en quelques minutes

### Pourquoi apprendre Terraform ?

- Compétence très demandée sur le marché DevOps
- Compatible avec +1000 providers (AWS, Azure, GCP, Proxmox, GitHub, GitLab, Cloudflare…)
- Approche déclarative claire et auditable
- Gestion des dépendances automatique entre ressources
- Une certification officielle reconnue : **HashiCorp Certified: Terraform Associate**

### Terraform vs OpenTofu

OpenTofu est le fork open source de Terraform, né après le changement de licence de HashiCorp en 2023 (passage de MPL à BSL). Les deux partagent le même socle HCL, les mêmes providers et le même workflow. Dans la plupart des commandes, remplacez simplement `terraform` par `tofu`.

| Critère | Terraform | OpenTofu |
|---|---|---|
| Licence | BSL 1.1 | MPL 2.0 (open source) |
| Gouvernance | HashiCorp (IBM) | Linux Foundation |
| Chiffrement du state | Non natif | Oui, natif |
| Compatibilité | Référence | ~99% compatible |

---

## 2. Architecture de Terraform

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────┐
│                    Vous (opérateur)                  │
│             Écrivez du code HCL (.tf)               │
└────────────────────────┬────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                  CLI Terraform                       │
│  terraform init / plan / apply / destroy            │
└──────┬─────────────────┬──────────────────┬─────────┘
       │                 │                  │
       ▼                 ▼                  ▼
┌──────────┐    ┌──────────────┐    ┌──────────────┐
│ Registry │    │  Providers   │    │    State     │
│ (modules │    │  (plugins)   │    │ (tfstate)   │
│ publics) │    │              │    │             │
└──────────┘    └──────┬───────┘    └──────────────┘
                       │
                       ▼
          ┌────────────────────────┐
          │      APIs Cloud        │
          │  AWS / Azure / GCP /   │
          │  Proxmox / GitHub …    │
          └────────────────────────┘
```

### Les 4 composants clés

#### 1. Le CLI Terraform
C'est l'outil en ligne de commande que vous installez sur votre machine. Il orchestre tout : téléchargement des providers, calcul du plan d'exécution, application des changements.

#### 2. Le Registry Terraform
Situé sur `registry.terraform.io`, c'est le dépôt officiel des providers et des modules réutilisables. Vous y trouvez le provider AWS, Azure, Proxmox, et des milliers de modules prêts à l'emploi.

#### 3. Les Providers
Ce sont des **plugins** qui font l'interface entre Terraform et les APIs des fournisseurs. Chaque provider est un binaire Go téléchargé par `terraform init`. Il traduit vos ressources HCL en appels API REST.

```
Provider AWS    → appelle l'API AWS
Provider Azure  → appelle l'API Azure
Provider Proxmox → appelle l'API Proxmox VE
```

#### 4. Le State (fichier d'état)
Le fichier `terraform.tfstate` est la **mémoire de Terraform**. Il contient une représentation JSON de toutes les ressources créées. Sans lui, Terraform ne sait pas ce qui existe déjà.

> ⚠️ **Attention** : En équipe, le state doit être stocké dans un **backend distant** (S3, Azure Blob, GitLab…) et jamais dans Git.

---

## 3. Déclaratif vs Impératif

### L'approche Impérative (Ansible, scripts shell…)

Avec une approche impérative, vous dites **comment** faire les choses, étape par étape.

```bash
# Script shell impératif
aws ec2 run-instances --image-id ami-123456 --instance-type t2.micro
PUBLIC_IP=$(aws ec2 describe-instances ... | jq -r '.PublicIp')
aws ec2 associate-address --public-ip $PUBLIC_IP
```

**Problèmes :**
- Si le script est interrompu à mi-chemin, l'état est incohérent
- Exécuter le script deux fois peut créer deux instances
- Vous devez gérer vous-même l'ordre des opérations
- Difficile de savoir ce qui existe vraiment

### L'approche Déclarative (Terraform)

Avec Terraform, vous décrivez **ce que vous voulez** (l'état final), pas comment y arriver.

```hcl
# Terraform déclaratif : vous décrivez l'état souhaité
resource "aws_instance" "web" {
  ami           = "ami-123456"
  instance_type = "t2.micro"

  tags = {
    Name = "serveur-web"
  }
}
```

**Avantages :**
- **Idempotent** : appliquer deux fois produit le même résultat
- Terraform calcule automatiquement l'ordre de création
- `terraform plan` montre les différences avant d'agir
- L'état est tracé dans le fichier `.tfstate`

### Tableau comparatif

| Critère | Déclaratif (Terraform) | Impératif (Script/Ansible) |
|---|---|---|
| Ce que vous décrivez | L'état final souhaité | Les étapes à exécuter |
| Idempotence | Garantie nativement | À gérer manuellement |
| Gestion des dépendances | Automatique | Manuelle |
| Visibilité des changements | `terraform plan` | Pas de preview |
| Rollback | Via le state | Complexe |
| Config post-provisionnement | Limité | Excellent (Ansible) |

### Comprendre l'idempotence

```hcl
# Ce code peut être appliqué 1 fois ou 100 fois : le résultat est toujours le même
resource "azurerm_resource_group" "example" {
  name     = "mon-groupe"
  location = "West Europe"
}
```

Si le groupe existe déjà : Terraform ne fait rien.
S'il n'existe pas : Terraform le crée.
S'il est différent : Terraform le met à jour.

---

## 4. Installation & Premier pas

### Installer Terraform

#### Linux (Ubuntu/Debian)

```bash
# Méthode officielle via apt
wget -O - https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg

echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] \
  https://apt.releases.hashicorp.com $(lsb_release -cs) main" | \
  sudo tee /etc/apt/sources.list.d/hashicorp.list

sudo apt update && sudo apt install terraform
```

#### macOS

```bash
brew tap hashicorp/tap
brew install hashicorp/tap/terraform
```

#### Avec tfenv (recommandé — gestion de versions)

```bash
# Installer tfenv
git clone https://github.com/tfutils/tfenv.git ~/.tfenv
echo 'export PATH="$HOME/.tfenv/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Lister les versions disponibles
tfenv list-remote

# Installer une version spécifique
tfenv install 1.9.0
tfenv use 1.9.0

# Vérifier
terraform version
```

### Votre premier fichier Terraform

```hcl
# main.tf — Exemple minimal avec le provider "local"
# Ce provider ne touche pas au cloud : parfait pour s'entraîner

terraform {
  required_providers {
    local = {
      source  = "hashicorp/local"
      version = "~> 2.0"
    }
  }
}

resource "local_file" "bonjour" {
  content  = "Bonjour depuis Terraform !"
  filename = "/tmp/terraform-test.txt"
}
```

```bash
# Initialiser (télécharge le provider)
terraform init

# Voir ce qui va être fait
terraform plan

# Appliquer
terraform apply

# Vérifier
cat /tmp/terraform-test.txt

# Détruire
terraform destroy
```

---

## 5. Le langage HCL

HCL (**HashiCorp Configuration Language**) est le langage utilisé par Terraform. Il est conçu pour être lisible par des humains et parseable par des machines.

### Structure de base

```hcl
# Un bloc ressource
resource "type_ressource" "nom_local" {
  attribut1 = "valeur"
  attribut2 = 42
  attribut3 = true

  # Bloc imbriqué
  sous_bloc {
    cle = "valeur"
  }
}

# Un commentaire sur une ligne
/* Un commentaire
   sur plusieurs lignes */
```

### Les types de données

```hcl
# String
nom = "mon-serveur"

# Number (entier ou décimal)
port    = 5432
ratio   = 0.5

# Boolean
actif   = true
debug   = false

# Liste (list)
zones = ["eu-west-1a", "eu-west-1b", "eu-west-1c"]

# Map (dictionnaire clé-valeur)
tags = {
  environnement = "production"
  equipe        = "devops"
  cout          = "projet-alpha"
}

# Référencer un élément de liste
premier_element = zones[0]   # "eu-west-1a"

# Référencer un élément de map
env = tags["environnement"]  # "production"
```

### Les expressions et interpolations

```hcl
variable "env" {
  default = "prod"
}

locals {
  # Interpolation de chaîne
  nom_complet = "serveur-${var.env}-web"

  # Expression conditionnelle (ternaire)
  taille_instance = var.env == "prod" ? "Standard_D4s_v3" : "Standard_B2s"

  # Fonctions built-in
  nom_upper  = upper(var.env)           # "PROD"
  liste_len  = length(["a", "b", "c"]) # 3
  date_now   = timestamp()
}

resource "azurerm_virtual_machine" "vm" {
  name = local.nom_complet   # "serveur-prod-web"
  size = local.taille_instance
}
```

### Les fonctions utiles

```hcl
locals {
  # Chaînes
  majuscule   = upper("hello")          # "HELLO"
  minuscule   = lower("WORLD")          # "world"
  remplace    = replace("a-b-c", "-", "_")  # "a_b_c"
  format_str  = format("vm-%03d", 5)    # "vm-005"

  # Listes
  liste_jointe = join(", ", ["a", "b", "c"])  # "a, b, c"
  liste_aplatie = flatten([["a", "b"], ["c"]]) # ["a", "b", "c"]

  # Maps
  fusionne    = merge(
    { env = "prod" },
    { region = "eu-west" }
  )  # { env = "prod", region = "eu-west" }

  # Fichiers
  script_contenu = file("scripts/init.sh")

  # Encodage
  en_base64   = base64encode("mon-secret")
  depuis_json = jsondecode(file("config.json"))
  vers_json   = jsonencode({ cle = "valeur" })
}
```

---

## 6. Structure d'un projet

### Structure recommandée (projet simple)

```
mon-projet/
├── versions.tf          # Contraintes de version Terraform et providers
├── main.tf              # Ressources principales
├── variables.tf         # Déclarations des variables
├── outputs.tf           # Valeurs exposées après apply
├── terraform.tfvars     # Valeurs des variables (⚠️ ne pas commiter si secrets)
└── .terraform.lock.hcl  # Lock des providers (à commiter dans Git)
```

### Structure recommandée (projet plus grand)

```
infra/
├── versions.tf
├── providers.tf         # Configuration des providers
├── network.tf           # Ressources réseau
├── compute.tf           # VMs, instances
├── database.tf          # Bases de données
├── storage.tf           # Stockage
├── security.tf          # Groupes de sécurité, IAM
├── variables.tf
├── locals.tf            # Valeurs calculées localement
├── outputs.tf
└── terraform.tfvars
```

### Le fichier versions.tf

```hcl
# versions.tf — Toujours commencer par ce fichier !
terraform {
  required_version = ">= 1.9.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.100"
    }
    proxmox = {
      source  = "bpg/proxmox"
      version = "~> 0.60"
    }
  }

  # Backend distant (voir section 10)
  backend "azurerm" {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "tfstate12345"
    container_name       = "tfstate"
    key                  = "production.terraform.tfstate"
  }
}
```

### Le .gitignore indispensable

```gitignore
# .gitignore pour un projet Terraform

# Répertoire de travail Terraform (binaires des providers)
.terraform/

# Fichiers de state (contiennent des données sensibles !)
*.tfstate
*.tfstate.backup

# Variables potentiellement sensibles
*.tfvars
*.tfvars.json

# Fichiers de plan exportés
*.tfplan

# Override files (fichiers de surcharge locaux)
override.tf
override.tf.json
*_override.tf
*_override.tf.json

# NE PAS exclure : .terraform.lock.hcl (à commiter !)
```

---

## 7. Le Workflow Terraform

### Les commandes principales

```
Code HCL
   │
   ▼
terraform init       → Télécharge les providers
   │
   ▼
terraform fmt        → Formate le code
   │
   ▼
terraform validate   → Vérifie la syntaxe
   │
   ▼
terraform plan       → Prévisualise les changements
   │
   ▼
terraform apply      → Applique les changements
   │
   ▼
terraform destroy    → Détruit l'infrastructure
```

### Détail de chaque commande

#### `terraform init`

```bash
# Initialise le répertoire de travail
# - Télécharge les providers déclarés dans versions.tf
# - Configure le backend
# - Installe les modules

terraform init

# Mettre à jour les providers
terraform init -upgrade

# Migrer vers un nouveau backend
terraform init -migrate-state
```

#### `terraform fmt`

```bash
# Formate automatiquement tous les fichiers .tf du répertoire courant
terraform fmt

# Vérifier sans modifier (pour la CI)
terraform fmt -check -recursive
```

#### `terraform validate`

```bash
# Vérifie la syntaxe HCL et la cohérence des configurations
# Ne contacte pas les APIs cloud
terraform validate
```

#### `terraform plan`

```bash
# Affiche ce qui va être créé/modifié/détruit
terraform plan

# Sauvegarder le plan pour l'appliquer ensuite
terraform plan -out=monplan.tfplan

# Passer des variables en ligne de commande
terraform plan -var="environnement=prod" -var="region=westeurope"

# Utiliser un fichier de variables
terraform plan -var-file="prod.tfvars"
```

**Lecture du plan :**
```
# azurerm_resource_group.example will be created
+ resource "azurerm_resource_group" "example" {
  + id       = (known after apply)
  + location = "westeurope"
  + name     = "mon-groupe"
}

Plan: 1 to add, 0 to change, 0 to destroy.
```

- `+` = création
- `~` = modification
- `-` = suppression
- `-/+` = destruction puis recréation

#### `terraform apply`

```bash
# Applique les changements (demande confirmation)
terraform apply

# Appliquer sans confirmation (pour la CI/CD)
terraform apply -auto-approve

# Appliquer un plan exporté (recommandé en CI/CD)
terraform apply monplan.tfplan

# Appliquer uniquement une ressource spécifique
terraform apply -target=azurerm_virtual_machine.mon_serveur
```

#### `terraform destroy`

```bash
# Détruit toutes les ressources (demande confirmation)
terraform destroy

# Sans confirmation
terraform destroy -auto-approve

# Détruire une ressource spécifique
terraform destroy -target=azurerm_virtual_machine.mon_serveur
```

#### Commandes de débogage

```bash
# Mode verbeux pour déboguer
TF_LOG=DEBUG terraform apply

# Niveaux de log disponibles : TRACE, DEBUG, INFO, WARN, ERROR
export TF_LOG=INFO
export TF_LOG_PATH=./terraform.log

# Voir les outputs après apply
terraform output
terraform output nom_output
terraform output -json
```

---

## 8. Provisionner une VM NixOS sur Proxmox

### Prérequis

- Un serveur Proxmox VE avec l'API activée
- Un token API Proxmox
- Une image NixOS disponible dans Proxmox (ISO ou template cloud-init)

### Configuration du provider Proxmox

```hcl
# versions.tf
terraform {
  required_version = ">= 1.9.0"

  required_providers {
    proxmox = {
      source  = "bpg/proxmox"
      version = "~> 0.60"
    }
  }
}
```

```hcl
# providers.tf
provider "proxmox" {
  endpoint  = var.proxmox_url      # "https://192.168.1.100:8006/"
  api_token = var.proxmox_token    # "terraform@pve!terraform=xxxx-xxxx"
  insecure  = true                 # Désactiver si vous avez un certificat valide

  ssh {
    agent    = true
    username = "root"
  }
}
```

### Les variables

```hcl
# variables.tf
variable "proxmox_url" {
  description = "URL de l'API Proxmox VE"
  type        = string
}

variable "proxmox_token" {
  description = "Token API Proxmox (format: user@realm!token_name=secret)"
  type        = string
  sensitive   = true
}

variable "proxmox_node" {
  description = "Nom du nœud Proxmox cible"
  type        = string
  default     = "pve"
}

variable "vm_name" {
  description = "Nom de la VM NixOS"
  type        = string
  default     = "nixos-server"
}

variable "vm_cores" {
  description = "Nombre de CPU cores"
  type        = number
  default     = 2
}

variable "vm_memory" {
  description = "RAM en Mo"
  type        = number
  default     = 2048
}

variable "vm_disk_size" {
  description = "Taille du disque en Go"
  type        = number
  default     = 20
}

variable "vm_ip" {
  description = "Adresse IP de la VM"
  type        = string
  default     = "192.168.1.200/24"
}

variable "vm_gateway" {
  description = "Passerelle par défaut"
  type        = string
  default     = "192.168.1.1"
}

variable "ssh_public_key" {
  description = "Clé SSH publique pour accéder à la VM"
  type        = string
}
```

### La ressource VM NixOS

```hcl
# main.tf

# Télécharger l'ISO NixOS depuis Internet
resource "proxmox_virtual_environment_download_file" "nixos_iso" {
  content_type = "iso"
  datastore_id = "local"
  node_name    = var.proxmox_node

  url = "https://channels.nixos.org/nixos-23.11/latest-nixos-minimal-x86_64-linux.iso"

  # Checksum pour vérifier l'intégrité du téléchargement
  # Vérifiez le checksum actuel sur le site NixOS
  checksum_algorithm = "sha256"
  checksum           = "REMPLACEZ_PAR_LE_CHECKSUM_OFFICIEL"
}

# Créer la VM NixOS
resource "proxmox_virtual_environment_vm" "nixos" {
  name        = var.vm_name
  description = "VM NixOS provisionnée par Terraform"
  node_name   = var.proxmox_node
  vm_id       = 200  # ID unique dans Proxmox

  # CPU
  cpu {
    cores = var.vm_cores
    type  = "x86-64-v2-AES"  # Compatible avec la plupart des configs
  }

  # Mémoire
  memory {
    dedicated = var.vm_memory
  }

  # Disque système
  disk {
    datastore_id = "local-lvm"
    file_format  = "raw"
    interface    = "virtio0"
    size         = var.vm_disk_size
  }

  # Lecteur CD-ROM avec l'ISO NixOS
  cdrom {
    enabled   = true
    file_id   = proxmox_virtual_environment_download_file.nixos_iso.id
    interface = "ide2"
  }

  # Interface réseau (VirtIO pour de meilleures performances)
  network_device {
    bridge  = "vmbr0"
    model   = "virtio"
  }

  # Cloud-init (optionnel — fonctionne si vous utilisez un template cloud-init)
  initialization {
    ip_config {
      ipv4 {
        address = var.vm_ip
        gateway = var.vm_gateway
      }
    }

    user_account {
      username = "nixos"
      keys     = [var.ssh_public_key]
    }
  }

  # Agent QEMU pour la communication avec Proxmox
  agent {
    enabled = true
  }

  # Options de démarrage
  boot_order = ["virtio0", "ide2"]

  # Démarrer la VM après création
  started = true

  # S'assurer que le disque est créé avant la VM
  depends_on = [proxmox_virtual_environment_download_file.nixos_iso]
}
```

### Utiliser un template cloud-init NixOS (approche recommandée)

Une approche plus propre consiste à créer un template NixOS dans Proxmox, puis à le cloner :

```hcl
# Cloner depuis un template existant (plus rapide qu'une installation ISO)
resource "proxmox_virtual_environment_vm" "nixos_clone" {
  name      = var.vm_name
  node_name = var.proxmox_node
  vm_id     = 201

  # Cloner depuis un template (VM ID 9000 = votre template NixOS)
  clone {
    vm_id = 9000
    full  = true  # Clone complet (pas lié)
  }

  cpu {
    cores = var.vm_cores
  }

  memory {
    dedicated = var.vm_memory
  }

  # Redimensionner le disque
  disk {
    datastore_id = "local-lvm"
    interface    = "virtio0"
    size         = var.vm_disk_size
    discard      = "on"  # Support TRIM
  }

  network_device {
    bridge = "vmbr0"
    model  = "virtio"
  }

  # Configuration cloud-init pour NixOS
  initialization {
    ip_config {
      ipv4 {
        address = var.vm_ip
        gateway = var.vm_gateway
      }
    }

    dns {
      servers = ["1.1.1.1", "8.8.8.8"]
    }

    user_account {
      username = "admin"
      keys     = [var.ssh_public_key]
    }
  }

  started = true
}
```

### Les outputs

```hcl
# outputs.tf
output "vm_id" {
  description = "ID Proxmox de la VM NixOS"
  value       = proxmox_virtual_environment_vm.nixos.vm_id
}

output "vm_name" {
  description = "Nom de la VM"
  value       = proxmox_virtual_environment_vm.nixos.name
}

output "vm_ip" {
  description = "Adresse IP de la VM"
  value       = var.vm_ip
}

output "ssh_command" {
  description = "Commande SSH pour se connecter"
  value       = "ssh nixos@${split("/", var.vm_ip)[0]}"
}
```

### Le fichier terraform.tfvars

```hcl
# terraform.tfvars — NE PAS COMMITER dans Git !
proxmox_url   = "https://192.168.1.100:8006/"
proxmox_token = "terraform@pve!terraform=votre-token-secret"
proxmox_node  = "pve"
vm_name       = "nixos-dev"
vm_cores      = 4
vm_memory     = 4096
vm_disk_size  = 30
vm_ip         = "192.168.1.201/24"
vm_gateway    = "192.168.1.1"
ssh_public_key = "ssh-ed25519 AAAA... user@machine"
```

### Appliquer

```bash
terraform init
terraform plan
terraform apply
```

---

## 9. La Gestion du State

### Qu'est-ce que le state ?

Le state est un fichier JSON (`terraform.tfstate`) qui contient la représentation complète de votre infrastructure telle que Terraform la connaît. C'est la **source de vérité** de Terraform.

```json
{
  "version": 4,
  "terraform_version": "1.9.0",
  "serial": 42,
  "lineage": "abc-123-def",
  "resources": [
    {
      "mode": "managed",
      "type": "azurerm_resource_group",
      "name": "example",
      "provider": "provider[\"registry.terraform.io/hashicorp/azurerm\"]",
      "instances": [
        {
          "schema_version": 0,
          "attributes": {
            "id": "/subscriptions/xxx/resourceGroups/mon-groupe",
            "location": "westeurope",
            "name": "mon-groupe"
          }
        }
      ]
    }
  ]
}
```

### Pourquoi le state est critique

```
Sans state : Terraform ne sait pas ce qui existe → il voudrait TOUT recréer
Avec state : Terraform compare l'état réel avec le code → il calcule les diffs
```

### Commandes de gestion du state

```bash
# Lister toutes les ressources dans le state
terraform state list

# Voir les détails d'une ressource
terraform state show azurerm_resource_group.example

# Renommer une ressource dans le state
# (utile après avoir renommé une ressource dans le code)
terraform state mv azurerm_resource_group.old azurerm_resource_group.new

# Importer une ressource existante dans le state
# (pour gérer une ressource créée manuellement)
terraform import azurerm_resource_group.example /subscriptions/xxx/resourceGroups/mon-groupe

# Supprimer une ressource du state (sans la détruire !)
terraform state rm azurerm_resource_group.example

# Forcer la mise à jour du state depuis l'API
terraform refresh
```

### Le lock du state

Quand plusieurs personnes travaillent en parallèle, Terraform verrouille le state pour éviter les modifications simultanées. Ce mécanisme est automatique avec les backends distants compatibles.

```
Personne A lance terraform apply → state verrouillé
Personne B lance terraform apply → ⛔ "Error: Error locking state"
```

---

## 10. Backends distants — GitLab & Azure

### Pourquoi un backend distant ?

Par défaut, Terraform stocke le state localement (`terraform.tfstate`). En équipe, c'est problématique :
- Pas de partage entre équipiers
- Pas de verrouillage
- Risque de perte (disque dur)
- Secrets dans le state visibles localement

Un backend distant résout tout cela.

---

### Backend GitLab (HTTP Backend)

GitLab offre un backend HTTP natif pour stocker le state Terraform, sans infrastructure supplémentaire.

#### Configuration

```hcl
# versions.tf
terraform {
  required_version = ">= 1.9.0"

  backend "http" {
    address        = "https://gitlab.com/api/v4/projects/MON_PROJECT_ID/terraform/state/production"
    lock_address   = "https://gitlab.com/api/v4/projects/MON_PROJECT_ID/terraform/state/production/lock"
    unlock_address = "https://gitlab.com/api/v4/projects/MON_PROJECT_ID/terraform/state/production/lock"
    lock_method    = "POST"
    unlock_method  = "DELETE"
    retry_wait_min = 5

    # Les credentials sont passés via variables d'environnement
    # TF_HTTP_USERNAME et TF_HTTP_PASSWORD
  }
}
```

#### Authentification

```bash
# Option 1 : Variables d'environnement (recommandé)
export TF_HTTP_USERNAME="votre-username-gitlab"
export TF_HTTP_PASSWORD="votre-personal-access-token"  # Scope: api

# Option 2 : Variables Terraform
export TF_VAR_gitlab_token="votre-token"
```

#### Dans une pipeline GitLab CI

```yaml
# .gitlab-ci.yml
variables:
  TF_HTTP_USERNAME: "gitlab-ci-token"
  TF_HTTP_PASSWORD: "${CI_JOB_TOKEN}"
  # CI_JOB_TOKEN est automatiquement disponible dans GitLab CI

terraform_apply:
  image: hashicorp/terraform:1.9
  script:
    - terraform init
    - terraform apply -auto-approve
```

#### Récupérer le Project ID GitLab

```bash
# Via l'API GitLab
curl --header "PRIVATE-TOKEN: votre-token" \
  "https://gitlab.com/api/v4/projects/votre-namespace%2Fvotre-projet" \
  | jq '.id'
```

---

### Backend Azure Storage Account

Azure Blob Storage est la solution recommandée pour les projets utilisant Azure.

#### Créer le Storage Account manuellement (une seule fois)

```bash
# Via Azure CLI
RESOURCE_GROUP="terraform-state-rg"
STORAGE_ACCOUNT="tfstate$(date +%s)"   # Nom unique
CONTAINER="tfstate"
LOCATION="westeurope"

# Créer le groupe de ressources
az group create --name $RESOURCE_GROUP --location $LOCATION

# Créer le Storage Account
az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS \
  --encryption-services blob \
  --min-tls-version TLS1_2 \
  --allow-blob-public-access false  # Bloquer l'accès public !

# Créer le container
az storage container create \
  --name $CONTAINER \
  --account-name $STORAGE_ACCOUNT

echo "Storage Account créé : $STORAGE_ACCOUNT"
```

> 💡 **Conseil** : On peut aussi créer ce Storage Account avec Terraform dans un projet séparé dédié au "bootstrap" de l'infrastructure Terraform.

#### Activer le versioning des blobs (essentiel pour les rollbacks)

```bash
az storage account blob-service-properties update \
  --account-name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --enable-versioning true \
  --enable-delete-retention true \
  --delete-retention-days 30
```

#### Configuration du backend Azure

```hcl
# versions.tf
terraform {
  required_version = ">= 1.9.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.100"
    }
  }

  backend "azurerm" {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "tfstate12345"   # Votre nom unique
    container_name       = "tfstate"
    key                  = "production.terraform.tfstate"

    # Authentification via Service Principal (variables d'environnement)
    # ARM_CLIENT_ID, ARM_CLIENT_SECRET, ARM_SUBSCRIPTION_ID, ARM_TENANT_ID
  }
}
```

#### Authentification Azure (Service Principal)

```bash
# Créer un Service Principal dédié à Terraform
az ad sp create-for-rbac \
  --name "terraform-state-sp" \
  --role "Storage Blob Data Owner" \
  --scopes "/subscriptions/VOTRE_SUB_ID/resourceGroups/terraform-state-rg"

# Output :
# {
#   "appId": "xxx",        → ARM_CLIENT_ID
#   "password": "xxx",     → ARM_CLIENT_SECRET
#   "tenant": "xxx"        → ARM_TENANT_ID
# }
```

```bash
# Variables d'environnement pour l'authentification
export ARM_CLIENT_ID="appId-du-sp"
export ARM_CLIENT_SECRET="password-du-sp"
export ARM_SUBSCRIPTION_ID="votre-subscription-id"
export ARM_TENANT_ID="votre-tenant-id"

# Initialiser avec le backend Azure
terraform init
```

#### Organisation multi-environnements

```
tfstate/
├── dev.terraform.tfstate
├── staging.terraform.tfstate
└── production.terraform.tfstate
```

```hcl
# Pour le dev, utilisez une clé différente
backend "azurerm" {
  resource_group_name  = "terraform-state-rg"
  storage_account_name = "tfstate12345"
  container_name       = "tfstate"
  key                  = "dev.terraform.tfstate"   # ← différent par env
}
```

#### Migrer d'un backend local vers Azure

```bash
# 1. Configurez le backend azurerm dans versions.tf
# 2. Puis lancez :
terraform init -migrate-state
# Terraform vous demande confirmation avant de copier le state
```

---

## 11. Rollbacks & Gestion des échecs

### Comment Terraform gère-t-il les échecs ?

Quand un `terraform apply` échoue en cours d'exécution, Terraform **s'arrête** et **ne met pas à jour le state** pour les ressources qui n'ont pas encore été créées. Les ressources déjà créées avant l'erreur sont dans le state.

```
Ressource A → créée ✅ (dans le state)
Ressource B → créée ✅ (dans le state)
Ressource C → ERREUR ❌ (pas dans le state)
Ressource D → pas tentée (dépend de C)
```

Lors du prochain `terraform apply`, Terraform va réessayer depuis C.

### Rollback avec un backend local

```bash
# Le fichier terraform.tfstate.backup est créé automatiquement à chaque apply

# 1. Voir le backup disponible
ls -la terraform.tfstate*
# terraform.tfstate
# terraform.tfstate.backup

# 2. Restaurer le backup
cp terraform.tfstate.backup terraform.tfstate

# 3. Réappliquer pour ramener l'infra à cet état
terraform apply
```

### Rollback avec Azure Storage (versioning)

Grâce au versioning des blobs activé précédemment, vous pouvez restaurer n'importe quelle version du state.

```bash
# Lister les versions du state
az storage blob list \
  --account-name tfstate12345 \
  --container-name tfstate \
  --prefix "production.terraform.tfstate" \
  --include "v" \
  --query "[].{name:name, lastModified:properties.lastModified, versionId:versionId}" \
  --output table

# Télécharger une version spécifique
az storage blob download \
  --account-name tfstate12345 \
  --container-name tfstate \
  --name "production.terraform.tfstate" \
  --version-id "2024-01-15T10:30:00.0000000Z" \
  --file terraform.tfstate.old

# Restaurer cette version en tant que version courante
az storage blob upload \
  --account-name tfstate12345 \
  --container-name tfstate \
  --name "production.terraform.tfstate" \
  --file terraform.tfstate.old \
  --overwrite

# Puis appliquer pour réconcilier l'infra avec cet état
terraform apply
```

### Rollback avec GitLab

GitLab conserve l'historique des states. Vous pouvez récupérer une version précédente via l'interface web ou l'API.

```bash
# Lister les states via l'API GitLab
curl --header "PRIVATE-TOKEN: votre-token" \
  "https://gitlab.com/api/v4/projects/PROJECT_ID/terraform/state"

# Télécharger une version spécifique du state
curl --header "PRIVATE-TOKEN: votre-token" \
  "https://gitlab.com/api/v4/projects/PROJECT_ID/terraform/state/production" \
  -o state-backup.json
```

### Forcer le déverrouillage du state (si bloqué)

```bash
# Si un apply a été interrompu brutalement, le state peut rester verrouillé
# Terraform affiche le Lock ID dans l'erreur

terraform force-unlock LOCK-ID-AFFICHÉ-DANS-LERREUR
```

### Recréer une ressource spécifique

```bash
# Marquer une ressource pour recréation au prochain apply
terraform apply -replace=azurerm_virtual_machine.mon_serveur

# Ancienne méthode (dépréciée mais encore fonctionnelle)
terraform taint azurerm_virtual_machine.mon_serveur
terraform apply
```

### Limites importantes à connaître

> ⚠️ Terraform ne fait **pas** de rollback automatique en cas d'échec partiel. Si 5 ressources sur 10 ont été créées avant une erreur, elles restent créées. Un rollback nécessite une intervention manuelle.

> ⚠️ Restaurer un state ne restaure pas automatiquement l'infrastructure. C'est comme montrer à Terraform une "carte" différente : il va ensuite calculer les actions pour que la réalité corresponde à cette carte.

---

## 12. Les Variables, Locals & Outputs

### Variables d'entrée (`variable`)

Les variables permettent de **paramétrer** votre configuration.

```hcl
# variables.tf

# Variable simple avec valeur par défaut
variable "environnement" {
  description = "Environnement cible (dev, staging, prod)"
  type        = string
  default     = "dev"

  # Validation personnalisée
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environnement)
    error_message = "L'environnement doit être dev, staging ou prod."
  }
}

# Variable numérique
variable "replicas" {
  description = "Nombre de réplicas"
  type        = number
  default     = 2

  validation {
    condition     = var.replicas >= 1 && var.replicas <= 10
    error_message = "Le nombre de réplicas doit être entre 1 et 10."
  }
}

# Variable sensible (masquée dans les logs)
variable "mot_de_passe_db" {
  description = "Mot de passe de la base de données"
  type        = string
  sensitive   = true
  # Pas de default → obligatoire à fournir
}

# Variable liste
variable "zones_disponibilite" {
  description = "Zones de disponibilité Azure"
  type        = list(string)
  default     = ["1", "2", "3"]
}

# Variable map
variable "tags_communs" {
  description = "Tags appliqués à toutes les ressources"
  type        = map(string)
  default = {
    gere_par      = "terraform"
    equipe        = "infrastructure"
    projet        = "mon-projet"
  }
}

# Variable objet structuré
variable "config_vm" {
  description = "Configuration de la VM"
  type = object({
    taille       = string
    disque_go    = number
    zone         = string
  })
  default = {
    taille    = "Standard_B2s"
    disque_go = 30
    zone      = "1"
  }
}
```

### Passer des valeurs aux variables

**Ordre de priorité (du plus faible au plus fort) :**

1. Valeur `default` dans le code
2. Fichier `terraform.tfvars` (chargé automatiquement)
3. Fichiers `*.auto.tfvars` (chargés automatiquement par ordre alphabétique)
4. `-var-file="fichier.tfvars"` en ligne de commande
5. `-var="clé=valeur"` en ligne de commande
6. Variables d'environnement `TF_VAR_nom_variable`

```bash
# Via fichier tfvars
terraform apply -var-file="prod.tfvars"

# Via ligne de commande
terraform apply -var="environnement=prod" -var="replicas=5"

# Via variables d'environnement
export TF_VAR_environnement="prod"
export TF_VAR_mot_de_passe_db="MonSecretSuperFort!"
terraform apply
```

### Variables locales (`locals`)

Les locals sont des valeurs calculées **à l'intérieur** du module, non paramétrables de l'extérieur.

```hcl
# locals.tf
locals {
  # Construire un nom cohérent
  prefixe       = "${var.projet}-${var.environnement}"
  nom_vm        = "${local.prefixe}-vm"
  nom_db        = "${local.prefixe}-db"

  # Tags fusionnés (tags communs + tags spécifiques)
  tags = merge(
    var.tags_communs,
    {
      environnement = var.environnement
      cree_le       = formatdate("YYYY-MM-DD", timestamp())
    }
  )

  # Calcul conditionnel
  est_production = var.environnement == "prod"
  taille_vm      = local.est_production ? "Standard_D4s_v3" : "Standard_B2s"
  replicas       = local.est_production ? 3 : 1
}

# Utilisation dans les ressources
resource "azurerm_linux_virtual_machine" "vm" {
  name     = local.nom_vm
  size     = local.taille_vm
  tags     = local.tags
}
```

### Outputs (valeurs de sortie)

Les outputs exposent des valeurs après `terraform apply`. Utiles pour :
- Afficher les IPs, URLs créées
- Partager des valeurs entre modules
- Fournir des données à des outils externes

```hcl
# outputs.tf
output "ip_publique" {
  description = "Adresse IP publique du serveur"
  value       = azurerm_public_ip.vm.ip_address
}

output "chaine_connexion_db" {
  description = "Chaîne de connexion à la base de données"
  value       = azurerm_postgresql_server.db.fqdn
}

# Output sensible (masqué par défaut)
output "mot_de_passe_admin" {
  description = "Mot de passe administrateur généré"
  value       = random_password.admin.result
  sensitive   = true
}

# Output structuré
output "infos_serveur" {
  description = "Informations complètes du serveur"
  value = {
    nom          = azurerm_linux_virtual_machine.vm.name
    ip_privee    = azurerm_linux_virtual_machine.vm.private_ip_address
    ip_publique  = azurerm_public_ip.vm.ip_address
    region       = azurerm_linux_virtual_machine.vm.location
  }
}
```

```bash
# Afficher tous les outputs
terraform output

# Afficher un output spécifique
terraform output ip_publique

# Format JSON (pour les scripts)
terraform output -json

# Afficher un output sensible
terraform output -raw mot_de_passe_admin
```

---

## 13. Les Modules

### Pourquoi utiliser des modules ?

Un **module** est un ensemble de fichiers Terraform regroupés dans un répertoire, créant un composant réutilisable.

```
Sans modules :
├── main.tf (500 lignes de code dupliqué pour dev, staging, prod)

Avec modules :
├── modules/
│   ├── vm/              # Module réutilisable "VM"
│   ├── database/        # Module réutilisable "Database"
│   └── network/         # Module réutilisable "Network"
├── environments/
│   ├── dev/
│   │   └── main.tf     # Utilise les modules avec config dev
│   ├── staging/
│   │   └── main.tf     # Utilise les modules avec config staging
│   └── prod/
│       └── main.tf     # Utilise les modules avec config prod
```

### Structure d'un module

```
modules/vm/
├── main.tf          # Ressources du module
├── variables.tf     # Variables d'entrée du module
├── outputs.tf       # Valeurs exposées par le module
└── README.md        # Documentation
```

### Créer un module simple (VM Azure)

```hcl
# modules/vm/variables.tf
variable "nom" {
  description = "Nom de la VM"
  type        = string
}

variable "resource_group_name" {
  description = "Nom du Resource Group"
  type        = string
}

variable "location" {
  description = "Région Azure"
  type        = string
}

variable "taille" {
  description = "Taille de la VM Azure"
  type        = string
  default     = "Standard_B2s"
}

variable "admin_username" {
  description = "Nom d'utilisateur administrateur"
  type        = string
  default     = "azureadmin"
}

variable "ssh_public_key" {
  description = "Clé SSH publique"
  type        = string
}

variable "subnet_id" {
  description = "ID du subnet"
  type        = string
}

variable "tags" {
  description = "Tags à appliquer"
  type        = map(string)
  default     = {}
}
```

```hcl
# modules/vm/main.tf
resource "azurerm_network_interface" "nic" {
  name                = "${var.nom}-nic"
  location            = var.location
  resource_group_name = var.resource_group_name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = var.subnet_id
    private_ip_address_allocation = "Dynamic"
  }

  tags = var.tags
}

resource "azurerm_linux_virtual_machine" "vm" {
  name                = var.nom
  resource_group_name = var.resource_group_name
  location            = var.location
  size                = var.taille
  admin_username      = var.admin_username

  network_interface_ids = [azurerm_network_interface.nic.id]

  admin_ssh_key {
    username   = var.admin_username
    public_key = var.ssh_public_key
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }

  tags = var.tags
}
```

```hcl
# modules/vm/outputs.tf
output "vm_id" {
  description = "ID de la VM"
  value       = azurerm_linux_virtual_machine.vm.id
}

output "ip_privee" {
  description = "Adresse IP privée"
  value       = azurerm_network_interface.nic.private_ip_address
}

output "nom" {
  description = "Nom de la VM"
  value       = azurerm_linux_virtual_machine.vm.name
}
```

### Utiliser le module

```hcl
# environments/prod/main.tf

module "vm_web" {
  source = "../../modules/vm"   # Chemin relatif vers le module

  nom                 = "prod-vm-web"
  resource_group_name = azurerm_resource_group.prod.name
  location            = azurerm_resource_group.prod.location
  taille              = "Standard_D4s_v3"
  ssh_public_key      = var.ssh_public_key
  subnet_id           = module.network.subnet_web_id
  tags                = local.tags
}

module "vm_api" {
  source = "../../modules/vm"   # Même module, configuration différente

  nom                 = "prod-vm-api"
  resource_group_name = azurerm_resource_group.prod.name
  location            = azurerm_resource_group.prod.location
  taille              = "Standard_D2s_v3"
  ssh_public_key      = var.ssh_public_key
  subnet_id           = module.network.subnet_api_id
  tags                = local.tags
}

# Accéder aux outputs du module
output "ip_vm_web" {
  value = module.vm_web.ip_privee
}
```

### Sources de modules

```hcl
# Depuis un chemin local
module "exemple" {
  source = "./modules/mon-module"
}

# Depuis le registry public Terraform
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"
}

# Depuis Git
module "exemple" {
  source = "git::https://github.com/mon-org/terraform-modules.git//modules/vm?ref=v1.2.0"
}

# Depuis GitLab (projet privé)
module "exemple" {
  source = "git::https://gitlab.com/mon-org/terraform-modules.git//modules/vm?ref=main"
}
```

---

## 14. Exemple : Serveur PostgreSQL sur Azure avec un module

### Structure du projet

```
projet-postgresql/
├── versions.tf
├── providers.tf
├── main.tf
├── variables.tf
├── outputs.tf
├── terraform.tfvars
└── modules/
    └── postgresql/
        ├── main.tf
        ├── variables.tf
        └── outputs.tf
```

### Le module PostgreSQL

```hcl
# modules/postgresql/variables.tf
variable "nom" {
  description = "Nom du serveur PostgreSQL"
  type        = string
}

variable "resource_group_name" {
  description = "Nom du Resource Group"
  type        = string
}

variable "location" {
  description = "Région Azure"
  type        = string
}

variable "admin_login" {
  description = "Login administrateur"
  type        = string
  default     = "pgadmin"
}

variable "admin_password" {
  description = "Mot de passe administrateur"
  type        = string
  sensitive   = true
}

variable "sku" {
  description = "SKU du serveur PostgreSQL"
  type        = string
  default     = "GP_Gen5_2"   # General Purpose, 2 vCores
}

variable "version_pg" {
  description = "Version de PostgreSQL"
  type        = string
  default     = "14"
}

variable "stockage_go" {
  description = "Espace de stockage en Go"
  type        = number
  default     = 32
}

variable "databases" {
  description = "Liste des bases de données à créer"
  type        = list(string)
  default     = ["app_db"]
}

variable "ips_autorisees" {
  description = "Plages IP autorisées à se connecter"
  type = list(object({
    nom       = string
    ip_debut  = string
    ip_fin    = string
  }))
  default = []
}

variable "tags" {
  type    = map(string)
  default = {}
}
```

```hcl
# modules/postgresql/main.tf

# Serveur PostgreSQL Flexible (recommandé par Microsoft)
resource "azurerm_postgresql_flexible_server" "postgres" {
  name                   = var.nom
  resource_group_name    = var.resource_group_name
  location               = var.location
  version                = var.version_pg
  administrator_login    = var.admin_login
  administrator_password = var.admin_password

  storage_mb = var.stockage_go * 1024  # Conversion Go → Mo

  sku_name = var.sku  # Exemple : "GP_Standard_D2s_v3"

  # Backup automatique
  backup_retention_days        = 7
  geo_redundant_backup_enabled = false

  # Maintenance window
  maintenance_window {
    day_of_week  = 0  # Dimanche
    start_hour   = 3  # 3h du matin
    start_minute = 0
  }

  tags = var.tags
}

# Créer les bases de données
resource "azurerm_postgresql_flexible_server_database" "databases" {
  for_each  = toset(var.databases)

  name      = each.value
  server_id = azurerm_postgresql_flexible_server.postgres.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

# Règles de firewall
resource "azurerm_postgresql_flexible_server_firewall_rule" "regle" {
  for_each = {
    for regle in var.ips_autorisees :
    regle.nom => regle
  }

  name             = each.value.nom
  server_id        = azurerm_postgresql_flexible_server.postgres.id
  start_ip_address = each.value.ip_debut
  end_ip_address   = each.value.ip_fin
}

# Configuration du serveur
resource "azurerm_postgresql_flexible_server_configuration" "config" {
  for_each = {
    "max_connections"         = "100"
    "shared_buffers"          = "16384"
    "log_min_duration_statement" = "1000"   # Log les requêtes > 1s
  }

  name      = each.key
  value     = each.value
  server_id = azurerm_postgresql_flexible_server.postgres.id
}
```

```hcl
# modules/postgresql/outputs.tf
output "server_id" {
  description = "ID du serveur PostgreSQL"
  value       = azurerm_postgresql_flexible_server.postgres.id
}

output "fqdn" {
  description = "Nom de domaine complet du serveur"
  value       = azurerm_postgresql_flexible_server.postgres.fqdn
}

output "admin_login" {
  description = "Login administrateur"
  value       = azurerm_postgresql_flexible_server.postgres.administrator_login
}

output "connection_string" {
  description = "Chaîne de connexion PostgreSQL"
  value       = "postgresql://${azurerm_postgresql_flexible_server.postgres.administrator_login}@${azurerm_postgresql_flexible_server.postgres.fqdn}:5432/app_db?sslmode=require"
  sensitive   = false
}
```

### Utilisation du module dans le projet principal

```hcl
# versions.tf
terraform {
  required_version = ">= 1.9.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.100"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "tfstate12345"
    container_name       = "tfstate"
    key                  = "postgresql-prod.terraform.tfstate"
  }
}
```

```hcl
# providers.tf
provider "azurerm" {
  features {}
}
```

```hcl
# main.tf

# Générer un mot de passe aléatoire fort
resource "random_password" "pg_admin" {
  length           = 24
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "${local.prefixe}-rg"
  location = var.location
  tags     = local.tags
}

# Utilisation du module PostgreSQL
module "postgresql" {
  source = "./modules/postgresql"

  nom                 = "${local.prefixe}-postgres"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  admin_login         = "pgadmin"
  admin_password      = random_password.pg_admin.result
  version_pg          = "14"
  stockage_go         = var.environnement == "prod" ? 128 : 32
  sku                 = var.environnement == "prod" ? "GP_Standard_D4s_v3" : "B_Standard_B1ms"

  databases = ["app_db", "analytics_db"]

  ips_autorisees = [
    {
      nom      = "bureau-paris"
      ip_debut = "82.65.10.0"
      ip_fin   = "82.65.10.255"
    },
    {
      nom      = "github-actions"
      ip_debut = "192.30.252.0"
      ip_fin   = "192.30.255.255"
    }
  ]

  tags = local.tags
}

# Stocker le mot de passe dans Azure Key Vault (bonne pratique)
resource "azurerm_key_vault_secret" "pg_password" {
  name         = "postgresql-admin-password"
  value        = random_password.pg_admin.result
  key_vault_id = azurerm_key_vault.main.id
}
```

```hcl
# locals.tf
locals {
  prefixe = "${var.projet}-${var.environnement}"
  tags = {
    projet        = var.projet
    environnement = var.environnement
    gere_par      = "terraform"
  }
}
```

```hcl
# variables.tf
variable "location" {
  description = "Région Azure"
  type        = string
  default     = "westeurope"
}

variable "projet" {
  description = "Nom du projet"
  type        = string
}

variable "environnement" {
  description = "Environnement (dev, staging, prod)"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environnement)
    error_message = "Valeur attendue : dev, staging ou prod."
  }
}
```

```hcl
# outputs.tf
output "postgresql_fqdn" {
  description = "Endpoint de connexion PostgreSQL"
  value       = module.postgresql.fqdn
}

output "postgresql_connection_string" {
  description = "Chaîne de connexion complète"
  value       = module.postgresql.connection_string
}

output "postgresql_admin_password" {
  description = "Mot de passe administrateur (sensible)"
  value       = random_password.pg_admin.result
  sensitive   = true
}
```

```hcl
# terraform.tfvars — Ne pas commiter !
projet        = "monapp"
environnement = "dev"
location      = "westeurope"
```

---

## 15. Concepts avancés

### `count` — Créer plusieurs ressources identiques

```hcl
variable "nb_serveurs" {
  default = 3
}

resource "azurerm_linux_virtual_machine" "serveurs" {
  count = var.nb_serveurs

  name                = "vm-${count.index + 1}"  # vm-1, vm-2, vm-3
  resource_group_name = azurerm_resource_group.main.name
  # ...
}

# Accéder à une ressource spécifique
output "ip_vm1" {
  value = azurerm_linux_virtual_machine.serveurs[0].private_ip_address
}

# Accéder à toutes les IPs
output "toutes_ips" {
  value = azurerm_linux_virtual_machine.serveurs[*].private_ip_address
}
```

### `for_each` — Créer des ressources depuis une map ou un set

```hcl
# Préféré à count quand chaque ressource a des attributs différents
variable "serveurs" {
  default = {
    web = { taille = "Standard_B2s", zone = "1" }
    api = { taille = "Standard_D2s_v3", zone = "2" }
    db  = { taille = "Standard_D4s_v3", zone = "3" }
  }
}

resource "azurerm_linux_virtual_machine" "serveurs" {
  for_each = var.serveurs

  name = "vm-${each.key}"   # vm-web, vm-api, vm-db
  size = each.value.taille
  zone = each.value.zone
  # ...
}

# Accéder à une ressource spécifique
output "ip_web" {
  value = azurerm_linux_virtual_machine.serveurs["web"].private_ip_address
}
```

### Expression `for` — Transformer des collections

```hcl
locals {
  # Créer une liste à partir d'une map
  noms_serveurs = [for k, v in var.serveurs : "vm-${k}"]
  # → ["vm-web", "vm-api", "vm-db"]

  # Créer une map filtrée
  serveurs_prod = {
    for k, v in var.serveurs :
    k => v
    if v.zone == "1"
  }

  # Transformer des outputs de module
  ips_serveurs = {
    for k, v in azurerm_linux_virtual_machine.serveurs :
    k => v.private_ip_address
  }
}
```

### `dynamic` — Blocs dynamiques

```hcl
variable "regles_secu" {
  default = [
    { nom = "http",  port = 80,   direction = "Inbound" },
    { nom = "https", port = 443,  direction = "Inbound" },
    { nom = "ssh",   port = 22,   direction = "Inbound" },
  ]
}

resource "azurerm_network_security_group" "nsg" {
  name                = "mon-nsg"
  location            = var.location
  resource_group_name = var.resource_group_name

  # Bloc dynamic pour éviter la répétition
  dynamic "security_rule" {
    for_each = var.regles_secu
    content {
      name                       = security_rule.value.nom
      priority                   = 100 + index(var.regles_secu, security_rule.value)
      direction                  = security_rule.value.direction
      access                     = "Allow"
      protocol                   = "Tcp"
      destination_port_range     = security_rule.value.port
      source_address_prefix      = "*"
      destination_address_prefix = "*"
      source_port_range          = "*"
    }
  }
}
```

### `lifecycle` — Contrôler le comportement des ressources

```hcl
resource "azurerm_postgresql_flexible_server" "postgres" {
  name = "ma-base-de-donnees"
  # ...

  lifecycle {
    # Ne JAMAIS détruire cette ressource (même avec terraform destroy)
    prevent_destroy = true

    # Créer la nouvelle ressource AVANT de détruire l'ancienne
    # Utile pour les mises à jour sans downtime
    create_before_destroy = true

    # Ignorer les changements sur certains attributs
    # (ex: attributs modifiés en dehors de Terraform)
    ignore_changes = [
      tags["last_modified"],
      administrator_password,  # Géré en dehors de Terraform
    ]
  }
}
```

### `depends_on` — Dépendances explicites

```hcl
# Normalement, Terraform gère les dépendances automatiquement via les références
# depends_on est utile pour des dépendances implicites (non visibles dans le code)

resource "azurerm_role_assignment" "role" {
  principal_id   = azurerm_user_assigned_identity.identity.principal_id
  role_definition_name = "Contributor"
  scope          = azurerm_storage_account.storage.id

  # On s'assure que le storage account est complètement prêt
  depends_on = [azurerm_storage_account.storage]
}
```

### Workspaces — Gérer plusieurs environnements

```bash
# Lister les workspaces
terraform workspace list

# Créer un nouveau workspace
terraform workspace new staging
terraform workspace new production

# Changer de workspace
terraform workspace select production

# Voir le workspace actif
terraform workspace show   # → production
```

```hcl
# Utiliser le workspace dans le code
locals {
  env_config = {
    default = {
      taille_vm   = "Standard_B2s"
      replicas    = 1
    }
    staging = {
      taille_vm   = "Standard_D2s_v3"
      replicas    = 2
    }
    production = {
      taille_vm   = "Standard_D4s_v3"
      replicas    = 3
    }
  }

  config = local.env_config[terraform.workspace]
}

resource "azurerm_linux_virtual_machine" "vm" {
  name  = "vm-${terraform.workspace}"
  size  = local.config.taille_vm
  # ...
}
```

---

## 16. Bonnes pratiques de sécurité

### 🔐 Ne jamais mettre de secrets dans le code

```hcl
# ❌ MAUVAIS — Secret dans le code source
resource "azurerm_postgresql_flexible_server" "db" {
  administrator_password = "MonMotDePasse123!"  # NE JAMAIS FAIRE ÇA
}

# ✅ BON — Via variable d'environnement
# export TF_VAR_db_password="MonMotDePasse123!"
variable "db_password" {
  type      = string
  sensitive = true
}

resource "azurerm_postgresql_flexible_server" "db" {
  administrator_password = var.db_password
}
```

### 🔐 Générer les secrets avec Terraform

```hcl
# Génération d'un mot de passe fort
resource "random_password" "db_admin" {
  length           = 32
  special          = true
  override_special = "!#$%&*-_=+?"
  min_lower        = 2
  min_upper        = 2
  min_numeric      = 2
  min_special      = 2
}

# Stocker dans Azure Key Vault
resource "azurerm_key_vault_secret" "db_password" {
  name         = "db-admin-password"
  value        = random_password.db_admin.result
  key_vault_id = azurerm_key_vault.main.id

  lifecycle {
    ignore_changes = [value]  # Ne pas changer le mot de passe à chaque apply
  }
}
```

### 🔐 Sécuriser le state

```hcl
# Azure Storage Account sécurisé pour le state
resource "azurerm_storage_account" "tfstate" {
  name                     = "tfstate${random_string.suffix.result}"
  resource_group_name      = azurerm_resource_group.tfstate.name
  location                 = azurerm_resource_group.tfstate.location
  account_tier             = "Standard"
  account_replication_type = "GRS"  # Géo-redondant

  # Sécurité
  min_tls_version           = "TLS1_2"
  allow_nested_items_to_be_public = false  # Pas d'accès public
  shared_access_key_enabled = false  # Désactiver les clés partagées

  # Chiffrement par défaut activé
  blob_properties {
    versioning_enabled = true
    delete_retention_policy {
      days = 30
    }
  }
}

# Accès uniquement via Azure AD
resource "azurerm_role_assignment" "tfstate_access" {
  principal_id         = data.azurerm_client_config.current.object_id
  role_definition_name = "Storage Blob Data Owner"
  scope                = azurerm_storage_account.tfstate.id
}
```

### 🔐 Utiliser des variables sensibles

```hcl
# Marquer explicitement les variables sensibles
variable "api_key" {
  description = "Clé API du service externe"
  type        = string
  sensitive   = true  # Masqué dans les logs et le plan
}

output "api_key_masked" {
  value     = var.api_key
  sensitive = true  # Masqué dans les outputs
}
```

### 🔐 Principe du moindre privilège

```hcl
# Créer un Service Principal avec seulement les permissions nécessaires
resource "azurerm_role_assignment" "terraform_sp" {
  principal_id         = azurerm_user_assigned_identity.terraform.principal_id
  role_definition_name = "Contributor"
  # Scope limité au Resource Group, pas à toute la subscription
  scope = azurerm_resource_group.app.id
}
```

### 🔐 Scanner le code avec Checkov

```bash
# Installer Checkov
pip install checkov

# Scanner votre code Terraform
checkov -d .

# Scanner et ignorer certaines règles
checkov -d . --skip-check CKV_AZURE_35,CKV_AZURE_36

# Output JSON pour la CI
checkov -d . -o json > checkov-report.json
```

### 🔐 Utiliser tflint pour détecter les erreurs

```bash
# Installer tflint
curl -s https://raw.githubusercontent.com/terraform-linters/tflint/master/install_linux.sh | bash

# Initialiser avec les plugins
tflint --init

# Scanner
tflint --recursive

# Configuration recommandée
cat > .tflint.hcl << 'EOF'
plugin "azurerm" {
  enabled = true
  version = "0.26.0"
  source  = "github.com/terraform-linters/tflint-ruleset-azurerm"
}

rule "terraform_documented_variables" {
  enabled = true
}

rule "terraform_documented_outputs" {
  enabled = true
}

rule "terraform_naming_convention" {
  enabled = true
}
EOF
```

### 🔐 Chiffrement des données sensibles au repos

```hcl
# Azure Key Vault pour gérer les clés de chiffrement
resource "azurerm_key_vault" "main" {
  name                = "${local.prefixe}-kv"
  location            = var.location
  resource_group_name = var.resource_group_name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"

  # Activer la protection contre la suppression
  purge_protection_enabled   = true
  soft_delete_retention_days = 90

  # Réseau : accès uniquement depuis des IPs spécifiées
  network_acls {
    default_action = "Deny"
    bypass         = "AzureServices"
    ip_rules       = ["82.65.10.0/24"]  # IP de votre bureau
  }
}
```

### 🔐 Checklist sécurité Terraform

| Pratique | Pourquoi |
|---|---|
| State dans un backend distant chiffré | Éviter la fuite de secrets stockés dans le state |
| Variables sensibles marquées `sensitive = true` | Masquer dans les logs et le plan |
| Jamais de secrets en dur dans le code | Éviter les fuites dans Git |
| Accès au state via IAM (pas de clé API) | Éviter le vol de clés |
| `prevent_destroy = true` sur les BDD prod | Éviter les destructions accidentelles |
| Versioning du state activé | Permettre les rollbacks |
| Checkov dans la CI | Détecter les mauvaises configs de sécurité |
| Lock du state actif | Éviter les conflits en équipe |
| `.gitignore` incluant `*.tfvars` et `.terraform/` | Ne pas commiter de secrets |
| Principe du moindre privilège | Limiter l'impact d'un compte compromis |

---

## 17. CI/CD avec GitLab CI & GitHub Actions

### GitLab CI — Pipeline Terraform complet

```yaml
# .gitlab-ci.yml

variables:
  TF_ROOT: ${CI_PROJECT_DIR}
  TF_STATE_NAME: ${CI_PROJECT_NAME}
  # Backend GitLab
  TF_HTTP_USERNAME: gitlab-ci-token
  TF_HTTP_PASSWORD: ${CI_JOB_TOKEN}

  # Azure (définis dans GitLab → Settings → CI/CD → Variables)
  # ARM_CLIENT_ID, ARM_CLIENT_SECRET, ARM_SUBSCRIPTION_ID, ARM_TENANT_ID

image: hashicorp/terraform:1.9

cache:
  key: terraform-${CI_COMMIT_REF_SLUG}
  paths:
    - ${TF_ROOT}/.terraform/

stages:
  - validate
  - plan
  - apply
  - destroy

before_script:
  - cd ${TF_ROOT}
  - terraform init
    -backend-config="address=https://gitlab.com/api/v4/projects/${CI_PROJECT_ID}/terraform/state/${TF_STATE_NAME}"
    -backend-config="lock_address=https://gitlab.com/api/v4/projects/${CI_PROJECT_ID}/terraform/state/${TF_STATE_NAME}/lock"
    -backend-config="unlock_address=https://gitlab.com/api/v4/projects/${CI_PROJECT_ID}/terraform/state/${TF_STATE_NAME}/lock"
    -backend-config="username=gitlab-ci-token"
    -backend-config="password=${CI_JOB_TOKEN}"
    -backend-config="lock_method=POST"
    -backend-config="unlock_method=DELETE"
    -backend-config="retry_wait_min=5"

fmt:
  stage: validate
  script:
    - terraform fmt -check -recursive
  allow_failure: false

validate:
  stage: validate
  script:
    - terraform validate

plan:
  stage: plan
  script:
    - terraform plan -out=plan.tfplan
  artifacts:
    paths:
      - plan.tfplan
    expire_in: 1 week
  only:
    - merge_requests
    - main

apply:
  stage: apply
  script:
    - terraform apply plan.tfplan
  dependencies:
    - plan
  when: manual   # Approbation manuelle requise
  only:
    - main
  environment:
    name: production

destroy:
  stage: destroy
  script:
    - terraform destroy -auto-approve
  when: manual
  only:
    - main
```

### GitHub Actions — Workflow Terraform complet

```yaml
# .github/workflows/terraform.yml

name: Terraform

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  pull-requests: write   # Pour commenter les PRs

env:
  TF_VERSION: "1.9.0"
  ARM_CLIENT_ID: ${{ secrets.ARM_CLIENT_ID }}
  ARM_CLIENT_SECRET: ${{ secrets.ARM_CLIENT_SECRET }}
  ARM_SUBSCRIPTION_ID: ${{ secrets.ARM_SUBSCRIPTION_ID }}
  ARM_TENANT_ID: ${{ secrets.ARM_TENANT_ID }}

jobs:
  terraform-check:
    name: Validate & Plan
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TF_VERSION }}

      - name: Terraform Format Check
        id: fmt
        run: terraform fmt -check -recursive
        continue-on-error: true

      - name: Terraform Init
        id: init
        run: terraform init

      - name: Terraform Validate
        id: validate
        run: terraform validate -no-color

      - name: Terraform Plan
        id: plan
        run: terraform plan -no-color -out=plan.tfplan
        continue-on-error: true

      # Commenter le plan sur la Pull Request
      - name: Commenter la PR avec le plan
        uses: actions/github-script@v7
        if: github.event_name == 'pull_request'
        with:
          script: |
            const output = `#### 🖌 Terraform Format: \`${{ steps.fmt.outcome }}\`
            #### ⚙️ Terraform Init: \`${{ steps.init.outcome }}\`
            #### 🔍 Terraform Validate: \`${{ steps.validate.outcome }}\`
            #### 📖 Terraform Plan: \`${{ steps.plan.outcome }}\`

            <details><summary>Voir le Plan</summary>

            \`\`\`terraform
            ${{ steps.plan.outputs.stdout }}
            \`\`\`

            </details>`;

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: output
            })

      - name: Upload Plan
        uses: actions/upload-artifact@v4
        with:
          name: terraform-plan
          path: plan.tfplan

  terraform-apply:
    name: Apply
    runs-on: ubuntu-latest
    needs: terraform-check
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    environment: production   # Requiert une approbation dans GitHub

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TF_VERSION }}

      - name: Terraform Init
        run: terraform init

      - name: Download Plan
        uses: actions/download-artifact@v4
        with:
          name: terraform-plan

      - name: Terraform Apply
        run: terraform apply -auto-approve plan.tfplan
```

### Variables d'environnement en CI

```bash
# Dans GitHub Secrets ou GitLab CI/CD Variables

# Azure
ARM_CLIENT_ID=xxxxx
ARM_CLIENT_SECRET=xxxxx
ARM_SUBSCRIPTION_ID=xxxxx
ARM_TENANT_ID=xxxxx

# AWS
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_DEFAULT_REGION=eu-west-1

# Proxmox
TF_VAR_proxmox_token=terraform@pve!terraform=xxxx

# Variables Terraform génériques
TF_VAR_environnement=prod
TF_VAR_projet=monapp
```

---

## 18. Limites de Terraform

### Ce que Terraform ne fait pas bien

#### 1. Configuration des machines après provisionnement

Terraform crée des VMs, mais n'installe pas de logiciels, ne gère pas les fichiers de configuration, ne relance pas des services. Pour ça, utilisez **Ansible, Chef, ou Puppet**.

```hcl
# ❌ À éviter : les provisioners sont le "dernier recours" de Terraform
resource "azurerm_linux_virtual_machine" "vm" {
  # ...

  provisioner "remote-exec" {
    inline = [
      "sudo apt-get update",
      "sudo apt-get install -y nginx",   # Utilisez Ansible à la place !
    ]
  }
}
```

**Problèmes des provisioners :**
- Non idempotents (exécuter deux fois peut casser)
- Pas gérés par le state Terraform
- Difficiles à déboguer
- Terraform ne sait pas les relancer si seuls les scripts changent

#### 2. Pas de rollback automatique

Si un `terraform apply` échoue à 80%, les 80% créés restent. Il n'y a pas de transaction.

#### 3. Gestion du drift

Si quelqu'un modifie une ressource directement dans la console cloud, Terraform ne le sait pas immédiatement. Il faut lancer `terraform plan` pour détecter la différence, ou configurer `terraform refresh`.

#### 4. Sensibilité du state

Le state peut contenir des mots de passe, des clés, des tokens en clair. Il faut :
- Le chiffrer (backend Azure avec chiffrement activé)
- Limiter les accès
- Ne jamais le commiter dans Git

#### 5. Courbe d'apprentissage des modules

La modularisation peut devenir complexe à grande échelle, surtout avec des dépendances entre modules.

#### 6. Temps d'exécution

Sur de grandes infrastructures (100+ ressources), `terraform plan` et `terraform apply` peuvent prendre plusieurs minutes.

---

## 19. Terraform vs Ansible — Complémentarité

### Deux outils, deux rôles

```
┌─────────────────────────────────────────────────────┐
│                  TERRAFORM                          │
│                                                     │
│  Provisionner l'infrastructure :                   │
│  ✅ Créer des VMs                                  │
│  ✅ Créer des réseaux, VPCs                        │
│  ✅ Créer des bases de données                     │
│  ✅ Gérer des DNS, load balancers                  │
│  ✅ Suivi de l'état via tfstate                    │
│  ❌ Installer nginx sur une VM                     │
└─────────────────────────────────────────────────────┘
         │ Passe les IPs et infos à
         ▼
┌─────────────────────────────────────────────────────┐
│                   ANSIBLE                           │
│                                                     │
│  Configurer les machines :                         │
│  ✅ Installer des paquets (nginx, postgres…)       │
│  ✅ Gérer des fichiers de config                   │
│  ✅ Démarrer/arrêter des services                  │
│  ✅ Appliquer des patches de sécurité              │
│  ❌ Gérer l'état de l'infrastructure cloud         │
└─────────────────────────────────────────────────────┘
```

### Workflow combiné

```bash
# Étape 1 : Terraform provisionne l'infrastructure
terraform apply

# Étape 2 : Récupérer les IPs des VMs créées
terraform output -json > infra-outputs.json

# Étape 3 : Ansible configure les machines
# Avec un inventaire dynamique qui lit l'output Terraform
ansible-playbook -i terraform-inventory.py site.yml
```

### Quand utiliser quoi ?

| Besoin | Outil recommandé |
|---|---|
| Créer/modifier/détruire des ressources cloud | Terraform |
| Installer un package sur un serveur | Ansible |
| Gérer des comptes IAM, des rôles | Terraform |
| Configurer nginx, apache, postgres | Ansible |
| Gérer des DNS, certificates TLS cloud | Terraform |
| Déployer une application (Docker, systemd) | Ansible |
| Provisionner des clusters Kubernetes | Terraform |
| Configurer des namespaces et déploiements K8s | Helm + Kubectl |

---

## 20. Outils de l'écosystème

### tfenv — Gestionnaire de versions Terraform

```bash
tfenv list           # Lister les versions installées
tfenv list-remote    # Lister les versions disponibles
tfenv install 1.9.0  # Installer une version
tfenv use 1.9.0      # Utiliser une version
```

Fichier `.terraform-version` à la racine du projet :
```
1.9.0
```
tfenv sélectionne automatiquement la bonne version.

### tflint — Linter Terraform

```bash
# .tflint.hcl
plugin "azurerm" {
  enabled = true
  version = "0.26.0"
  source  = "github.com/terraform-linters/tflint-ruleset-azurerm"
}
```

```bash
tflint --init
tflint --recursive
```

### terraform-docs — Documentation automatique

```bash
# Générer automatiquement le README.md d'un module
terraform-docs markdown ./modules/postgresql > modules/postgresql/README.md
```

Génère un tableau avec toutes les variables et leurs descriptions.

### Checkov — Sécurité

```bash
checkov -d .                    # Scanner un répertoire
checkov -f main.tf              # Scanner un fichier
checkov -d . --framework terraform   # Uniquement les règles Terraform
```

### Terragrunt — DRY pour Terraform

Terragrunt évite la répétition des configurations de backend et de providers dans des projets multi-environnements.

```hcl
# terragrunt.hcl (à la racine)
remote_state {
  backend = "azurerm"
  config = {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "tfstate12345"
    container_name       = "tfstate"
    key                  = "${path_relative_to_include()}/terraform.tfstate"
  }
}
```

### Résumé des outils

| Outil | Rôle | Indispensable ? |
|---|---|---|
| tfenv | Gérer les versions de Terraform | Recommandé |
| tflint | Linter pour détecter les erreurs | Recommandé |
| terraform-docs | Générer la doc des modules | Recommandé |
| Checkov | Scanner la sécurité | Essentiel en entreprise |
| Terragrunt | Éviter la répétition multi-env | Projets complexes |
| Infracost | Estimer les coûts cloud | Très utile |
| Atlantis | Automatiser Terraform via PR | Alternatif à la CI custom |

---

## 21. Glossaire

| Terme | Définition |
|---|---|
| **HCL** | HashiCorp Configuration Language — le langage de Terraform |
| **Provider** | Plugin qui connecte Terraform à un service cloud (AWS, Azure…) |
| **Resource** | Un objet d'infrastructure géré par Terraform (VM, BDD, réseau…) |
| **Data source** | Permet de lire des données existantes sans les créer |
| **State** | Fichier JSON contenant l'état connu de l'infrastructure |
| **Backend** | Système de stockage du state (local, Azure, GitLab…) |
| **Module** | Ensemble de fichiers Terraform réutilisables |
| **Workspace** | Environnement isolé avec son propre state |
| **Plan** | Prévisualisation des changements que Terraform va appliquer |
| **Apply** | Exécution des changements prévus dans le plan |
| **Idempotence** | Propriété : appliquer N fois produit le même résultat que 1 fois |
| **Drift** | Différence entre l'état Terraform et la réalité cloud |
| **Lock** | Verrouillage du state pendant un apply pour éviter les conflits |
| **tfvars** | Fichier de valeurs pour les variables Terraform |
| **Provisioner** | Mécanisme (à éviter) pour exécuter des scripts sur des machines |
| **Registry** | Dépôt public de providers et modules Terraform |
| **IaC** | Infrastructure as Code — gérer l'infra comme du code source |
| **Sensitive** | Attribut/variable masqué dans les logs et le plan |
| **lifecycle** | Bloc pour contrôler le comportement de création/destruction |
| **for_each** | Meta-argument pour créer plusieurs ressources depuis une map |

---

## Pour aller plus loin

### Ressources officielles

- [Documentation officielle Terraform](https://developer.hashicorp.com/terraform/docs)
- [Tutoriels officiels HashiCorp](https://developer.hashicorp.com/terraform/tutorials)
- [Registry Terraform](https://registry.terraform.io)
- [Documentation des modules](https://developer.hashicorp.com/terraform/tutorials/modules)

### Formation et certification

- **Certification Terraform Associate 003** : valide les compétences fondamentales
- **Certification Terraform Professional** : pour les utilisateurs avancés
- [devopssec.fr — Cours complet Terraform](https://devopssec.fr/article/cours-complet-terraform)

### Communauté

- [discuss.hashicorp.com](https://discuss.hashicorp.com/c/terraform-core)
- [Awesome Terraform (GitHub)](https://github.com/shuaibiyy/awesome-terraform)
- [Terraform Best Practices](https://www.terraform-best-practices.com)

---

*Documentation rédigée en avril 2026 — compatible Terraform ≥ 1.9 et OpenTofu ≥ 1.8*
