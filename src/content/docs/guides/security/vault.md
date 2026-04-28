---
title: "🚀 Les fondamentaux de la gestion des secrets avec HashiCorp Vault"
description: "HashiCorp Vault : gérez vos secrets en toute sécurité"
created: "2026-03-30"
updated: "2026-04-27"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"
---




<!-- > **Version couverte** : Vault Community Edition 1.21.x (mars 2026) -->
> **Public cible** : Développeurs, DevOps, Administrateurs Systèmes, Équipes Sécurité

---

## Table des matières

1. [C'est quoi Vault, concrètement ?](#1-cest-quoi-vault-concrètement)
2. [Vault est-il fait pour vous ?](#2-vault-est-il-fait-pour-vous)
3. [Architecture & concepts clés](#3-architecture--concepts-clés)
4. [Secrets Engines — les moteurs de Vault](#4-secrets-engines--les-moteurs-de-vault)
5. [Méthodes d'authentification](#5-méthodes-dauthentification)
6. [Policies — le contrôle d'accès](#6-policies--le-contrôle-daccès)
7. [Installation](#7-installation)
8. [Mode développement (dev mode)](#8-mode-développement-dev-mode)
9. [Configuration production](#9-configuration-production)
10. [Initialisation & Unsealing](#10-initialisation--unsealing)
11. [Auto-unseal avec AWS KMS](#11-auto-unseal-avec-aws-kms)
12. [Secrets KV — Stockage clé-valeur](#12-secrets-kv--stockage-clé-valeur)
13. [Transit — Chiffrement as a Service](#13-transit--chiffrement-as-a-service)
14. [Authentification userpass et AppRole](#14-authentification-userpass-et-approle)
15. [Écrire des Policies HCL](#15-écrire-des-policies-hcl)
16. [PKI — Autorité de certification interne](#16-pki--autorité-de-certification-interne)
17. [Opérer en production](#17-opérer-en-production)
18. [Vault CE vs Enterprise vs OpenBao](#18-vault-ce-vs-enterprise-vs-openbao)
19. [Licence BSL — Ce que ça implique](#19-licence-bsl--ce-que-ça-implique)
20. [À retenir](#20-à-retenir)

---

## 1. C'est quoi Vault, concrètement ?

Imaginez que votre équipe stocke ses mots de passe de bases de données dans des fichiers `.env`, ses clés API dans des variables d'environnement, et ses certificats TLS dans un dossier partagé. C'est ce que fait la majorité des équipes — et c'est exactement le problème que Vault résout.

**HashiCorp Vault est un coffre-fort numérique centralisé** qui :

- **Stocke** vos secrets chiffrés (mots de passe, clés API, certificats, tokens)
- **Génère** des credentials temporaires à la demande (base de données, cloud, SSH)
- **Chiffre** vos données sans que votre application ait jamais accès aux clés
- **Contrôle** finement qui peut accéder à quoi, et quand
- **Audite** chaque accès avec un journal complet et immuable

### La différence fondamentale avec un simple gestionnaire de mots de passe

Un gestionnaire de mots de passe (Bitwarden, 1Password) stocke des secrets **statiques** : vous y déposez un mot de passe, il est conservé jusqu'à ce que vous le changiez manuellement.

Vault va beaucoup plus loin avec les **secrets dynamiques** : au lieu de stocker un mot de passe PostgreSQL, Vault crée un utilisateur PostgreSQL à chaque demande, avec une durée de vie limitée (ex: 1 heure). Quand le temps expire, Vault supprime automatiquement l'utilisateur. **Personne ne partage jamais le même credential.**

---

## 2. Vault est-il fait pour vous ?

Vault est puissant, mais il est aussi complexe à opérer. Avant de l'adopter, évaluez honnêtement votre contexte.

### ✅ Vault est un bon choix si vous avez besoin de...

| Besoin | Pourquoi Vault excelle |
|--------|------------------------|
| **Secrets dynamiques** | Credentials base de données, cloud, SSH générés à la demande avec TTL |
| **PKI interne** | Autorité de certification intégrée, certificats courts (heures/jours) |
| **Chiffrement applicatif** | Transit : votre app ne voit jamais les clés de chiffrement |
| **Audit fort** | Journal complet de qui accède à quoi, quand, et pourquoi |
| **Multi-équipes** | Isolation des secrets par équipe/environnement avec policies ACL |
| **Rotation automatique** | Révocation instantanée, rotation des credentials |
| **Intégration Kubernetes** | Auth native via ServiceAccount, injection de secrets |

### ❌ Vault est probablement surdimensionné si...

| Situation | Alternative plus simple |
|-----------|------------------------|
| Quelques secrets d'équipe | Bitwarden, 1Password Teams |
| Secrets CI/CD simples | Variables secrètes GitLab/GitHub, AWS Secrets Manager |
| Équipe < 10 personnes, mono-environnement | SOPS + Git, Infisical, Doppler |
| Pas de budget ops dédié | Solution managée (HCP Vault, Infisical Cloud) |
| Besoin ponctuel de certificats | Let's Encrypt, Certbot |

> ⚠️ **Avertissement** : Vault est une brique d'infrastructure critique. Une panne ou une mauvaise configuration impacte **toutes** les applications qui en dépendent. Assurez-vous d'avoir les ressources humaines pour l'opérer avant de l'adopter.

---

## 3. Architecture & concepts clés

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                        VAULT SERVER                         │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Auth Methods│    │Secrets Engine│    │   Policies   │  │
│  │  (Qui êtes-  │───▶│  (Quels      │◀───│  (Que pouvez-│  │
│  │   vous ?)    │    │   secrets ?) │    │   vous faire?)│  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│          │                   │                              │
│          ▼                   ▼                              │
│  ┌──────────────┐    ┌──────────────┐                       │
│  │   Identity   │    │   Storage    │                       │
│  │   System     │    │   Backend    │                       │
│  │  (Entities,  │    │    (Raft)    │                       │
│  │   Aliases)   │    │              │                       │
│  └──────────────┘    └──────────────┘                       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   Audit Devices                      │   │
│  │         (Journal complet de tous les accès)          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Les quatre composants principaux

**1. Auth Methods (Méthodes d'authentification)**
Comment vous prouvez votre identité à Vault : mot de passe, token Kubernetes, credentials cloud, certificat TLS, etc.

**2. Secrets Engines (Moteurs de secrets)**
Les "étages" spécialisés du coffre-fort : KV pour le stockage classique, Database pour les credentials dynamiques, PKI pour les certificats, etc.

**3. Policies (Politiques d'accès)**
Les règles qui définissent ce que vous pouvez faire une fois authentifié : lire tel secret, écrire dans tel chemin, gérer telle auth method.

**4. Audit Devices (Journaux d'audit)**
Un enregistrement complet et immuable de toutes les opérations effectuées sur Vault.

### Sealed vs Unsealed — Le verrou de Vault

Vault démarre toujours **scellé (sealed)**. Dans cet état, il refuse toute opération — les données sont chiffrées avec une clé maître qui est elle-même chiffrée.

Pour devenir opérationnel, Vault doit être **déverrouillé (unsealed)** :

```
État SEALED                    État UNSEALED
──────────────                 ──────────────
✗ Aucune requête               ✓ API disponible
✗ Secrets inaccessibles        ✓ Secrets accessibles
✗ Auth methods inactives       ✓ Auth methods actives

        ┌─────────────────────────────────┐
        │     Comment unseal Vault ?      │
        │                                 │
        │  Mode Shamir (défaut)           │
        │  → Clé maître divisée en N parts│
        │    M parts nécessaires pour     │
        │    déverrouiller (ex: 3/5)      │
        │                                 │
        │  Auto-unseal (recommandé prod)  │
        │  → Service externe (KMS, etc.)  │
        │    détient la clé               │
        └─────────────────────────────────┘
```

### Le système d'identité (Identity System)

Un point souvent sous-estimé : Vault maintient un système d'identité qui **consolide** les différentes méthodes d'authentification.

- **Entity** : représente une personne ou une application unique dans Vault
- **Alias** : lie une entity à une auth method (ex: `alice` via userpass + `alice` via OIDC = même entity)
- **Group** : regroupe des entities pour leur appliquer des policies communes

Cela permet d'avoir une vision unifiée des accès même si vous utilisez plusieurs auth methods.

---

## 4. Secrets Engines — les moteurs de Vault

### Les deux familles de secrets

**Secrets statiques** — Le coffre-fort traditionnel
Vous déposez un secret (mot de passe, clé API), Vault le conserve jusqu'à ce que vous le modifiiez manuellement.

**Secrets dynamiques** — L'usine à credentials
Vault génère un nouveau credential à chaque demande, avec une durée de vie limitée. À expiration, il est automatiquement révoqué.

### Les engines les plus utilisés

| Engine | Famille | Ce qu'il fait concrètement |
|--------|---------|---------------------------|
| **KV v2** | Statique | Coffre-fort classique avec versioning (10 versions conservées) |
| **Transit** | Chiffrement | Chiffre/déchiffre vos données sans jamais exposer la clé |
| **Database** | Dynamique | Crée un user PostgreSQL/MySQL à la demande, le supprime après expiration |
| **PKI** | Dynamique | Émet des certificats TLS signés par votre CA interne |
| **SSH** | Dynamique | Signe les clés SSH ou génère des mots de passe OTP |
| **AWS/Azure/GCP** | Dynamique | Génère des credentials cloud temporaires (IAM, service account) |
| **Cubbyhole** | Statique | Coffre-fort personnel lié à votre token — personne d'autre ne peut y accéder |

### Quel engine pour quel besoin ?

| Votre besoin | Engine recommandé | Raison |
|-------------|------------------|--------|
| Stocker des clés API tierces | KV v2 | Secrets statiques imposés par le fournisseur |
| Accès base de données pour vos apps | Database | Plus de mot de passe partagé, rotation automatique |
| Chiffrer des données sensibles (RGPD) | Transit | Les développeurs n'ont jamais accès aux clés |
| Certificats TLS internes (mTLS) | PKI | Certificats courts, révocation facile |
| Accès SSH aux serveurs | SSH | Plus de clés SSH qui traînent, accès audité |
| Credentials AWS temporaires | AWS | Plus d'access keys permanentes dans les configs |

---

## 5. Méthodes d'authentification

Avant d'accéder à un secret, vous devez **prouver votre identité**. Vault propose plusieurs méthodes selon que vous êtes un humain ou une machine.

### Le problème de l'authentification machine

Pour un humain, c'est simple : vous tapez un mot de passe ou vous utilisez votre SSO d'entreprise.

Mais comment une **application** prouve-t-elle son identité ? Elle ne peut pas taper de mot de passe. C'est là qu'interviennent les méthodes d'auth spécialisées :

- **AppRole** : l'application reçoit un `role_id` (son identité) et un `secret_id` (son mot de passe jetable, à usage unique)
- **Kubernetes** : le pod utilise son ServiceAccount token — Vault vérifie auprès de l'API Kubernetes que le pod est bien celui qu'il prétend être
- **AWS/Azure/GCP** : l'instance cloud utilise son identité machine (instance metadata) — Vault vérifie auprès du cloud provider

### Quelle méthode pour qui ?

| Qui s'authentifie | Méthode recommandée | Comment ça marche |
|------------------|--------------------|--------------------|
| Développeur en local | **Userpass** | Login/mot de passe classique |
| Employé en entreprise | **OIDC ou LDAP** | SSO via Keycloak, Okta, Azure AD, Active Directory |
| Pipeline CI/CD | **AppRole** | `role_id` en variable, `secret_id` généré à chaque run |
| Pod Kubernetes | **Kubernetes auth** | ServiceAccount token vérifié par Vault |
| Instance EC2/VM cloud | **AWS/Azure/GCP auth** | Identité machine du cloud provider |
| Serveur on-premise | **AppRole ou TLS certs** | Selon votre infrastructure |

> 💡 **Le "Secret Zero Problem"** : Comment donner le premier secret à une application de manière sécurisée ? AppRole le résout avec le **response wrapping** : le `secret_id` est enveloppé dans un token à usage unique qui expire en quelques minutes.

---

## 6. Policies — le contrôle d'accès

### L'analogie du badge d'accès

Pensez aux badges dans un immeuble de bureaux. Votre badge vous donne accès à certains étages et certaines salles, pas à tout le bâtiment.

Les policies Vault fonctionnent pareil : elles définissent les **chemins** (paths) auxquels vous avez accès et **ce que vous pouvez y faire**.

> **Règle d'or** : Par défaut, tout est refusé. Une policy n'accorde que ce qui est explicitement listé.

### Les capabilities (permissions)

| Capability | Ce que ça permet | Exemple concret |
|-----------|-----------------|-----------------|
| `read` | Lire la valeur d'un secret | Récupérer le mot de passe de la base de données |
| `list` | Voir la liste des secrets (pas leur contenu) | Savoir qu'un secret "db-password" existe |
| `create` | Créer un nouveau secret | Ajouter une nouvelle clé API |
| `update` | Modifier un secret existant | Changer le mot de passe |
| `delete` | Supprimer un secret | Retirer une clé API révoquée |
| `sudo` | Actions d'administration | Modifier les policies, gérer les auth methods |
| `deny` | Refuser **explicitement** (prioritaire sur tout) | Bloquer l'accès même si une autre policy l'autorise |

> ⚠️ `deny` est prioritaire : si une policy accorde `read` et une autre applique `deny` sur le même chemin, c'est `deny` qui gagne.

---

## 7. Installation

### Linux (Debian/Ubuntu)

```bash
# 1. Ajouter la clé GPG HashiCorp
wget -O - https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor \
  -o /usr/share/keyrings/hashicorp-archive-keyring.gpg

# 2. Ajouter le dépôt officiel
echo "deb [arch=$(dpkg --print-architecture) \
  signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] \
  https://apt.releases.hashicorp.com \
  $(grep -oP '(?<=UBUNTU_CODENAME=).*' /etc/os-release || lsb_release -cs) main" \
  | sudo tee /etc/apt/sources.list.d/hashicorp.list

# 3. Installer Vault
sudo apt update && sudo apt install vault

# 4. Vérifier l'installation
vault --version
# → Vault v1.21.x
```

### Linux (RHEL/CentOS/Amazon Linux)

```bash
# RHEL/CentOS
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://rpm.releases.hashicorp.com/RHEL/hashicorp.repo
sudo yum -y install vault

# Amazon Linux
sudo yum install -y yum-utils shadow-utils
sudo yum-config-manager --add-repo https://rpm.releases.hashicorp.com/AmazonLinux/hashicorp.repo
sudo yum install vault
```

### macOS

```bash
# Via Homebrew
brew tap hashicorp/tap
brew install hashicorp/tap/vault
```

### Créer l'utilisateur système dédié

```bash
# Créer un utilisateur système sans shell (sécurité)
sudo useradd --system --home /opt/vault/data --shell /sbin/nologin vault

# Créer les répertoires nécessaires
sudo mkdir -p /etc/vault.d        # Configuration
sudo mkdir -p /opt/vault/data     # Données Raft
sudo mkdir -p /opt/vault/tls      # Certificats TLS
sudo mkdir -p /var/log/vault      # Logs

# Permissions
sudo chown -R vault:vault /opt/vault /var/log/vault
sudo chmod 750 /opt/vault/data
```

---

## 8. Mode développement (dev mode)

Le mode dev est parfait pour **découvrir Vault localement**. Il est entièrement en mémoire, démarré déverrouillé, et ne nécessite aucune configuration.

> ❌ **N'utilisez jamais le mode dev en production** — toutes les données sont perdues à l'arrêt.

### Démarrer en mode dev

```bash
# Démarrer le serveur dev (dans un terminal)
vault server -dev -dev-root-token-id="root"

# Dans un second terminal : configurer l'environnement
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='root'

# Vérifier que Vault répond
vault status
```

**Sortie attendue de `vault status` :**
```
Key             Value
---             -----
Seal Type       shamir
Initialized     true
Sealed          false       ← Vault est déverrouillé
Total Shares    1
Threshold       1
Version         1.21.x
Mode            dev         ← On est bien en mode dev
```

### Premiers pas avec le mode dev

```bash
# Écrire un secret
vault kv put secret/mon-app/db \
  username="admin" \
  password="s3cr3t"
# → Key              Value
# → ---              -----
# → created_time     2026-03-01T10:00:00Z
# → version          1

# Lire un secret
vault kv get secret/mon-app/db
# → === Secret Path ===
# → secret/data/mon-app/db
# → === Data ===
# → username    admin
# → password    s3cr3t

# Lire uniquement un champ
vault kv get -field=password secret/mon-app/db
# → s3cr3t
```

---

## 9. Configuration production

### Fichier de configuration HCL

```hcl
# /etc/vault.d/vault.hcl
# Configuration Vault pour production avec Raft (stockage intégré)

# Interface utilisateur web (accessible sur https://vault-addr:8200/ui)
ui = true

# Empêche les secrets d'être swappés sur le disque
disable_mlock = false

# Adresses de l'API et du cluster
api_addr     = "https://vault.mondomaine.com:8200"
cluster_addr = "https://vault.mondomaine.com:8201"

# ─────────────────────────────────────────────
# STOCKAGE : Raft (recommandé, intégré à Vault)
# ─────────────────────────────────────────────
storage "raft" {
  path    = "/opt/vault/data"    # Répertoire de données
  node_id = "vault-node-1"       # Identifiant unique de ce nœud

  # Pour un cluster HA à 3 nœuds, ajouter les pairs :
  retry_join {
    leader_api_addr = "https://vault-node-2.mondomaine.com:8200"
  }
  retry_join {
    leader_api_addr = "https://vault-node-3.mondomaine.com:8200"
  }
}

# ─────────────────────────────────────────────
# LISTENER : TLS obligatoire en production
# ─────────────────────────────────────────────
listener "tcp" {
  address       = "0.0.0.0:8200"
  cluster_address = "0.0.0.0:8201"

  # Chemins vers vos certificats TLS
  tls_cert_file = "/opt/vault/tls/vault-cert.pem"
  tls_key_file  = "/opt/vault/tls/vault-key.pem"
  tls_ca_cert_file = "/opt/vault/tls/vault-ca.pem"

  # Désactiver les anciens protocoles
  tls_min_version = "tls12"
}

# ─────────────────────────────────────────────
# TÉLÉMÉTRIE : Exposition des métriques Prometheus
# ─────────────────────────────────────────────
telemetry {
  prometheus_retention_time = "30s"
  disable_hostname          = true
}
```

### Service systemd

```ini
# /etc/systemd/system/vault.service
[Unit]
Description="HashiCorp Vault - Gestionnaire de secrets"
Documentation=https://developer.hashicorp.com/vault
Requires=network-online.target
After=network-online.target
ConditionFileNotEmpty=/etc/vault.d/vault.hcl

[Service]
User=vault
Group=vault
ProtectSystem=full
ProtectHome=read-only
PrivateTmp=yes
PrivateDevices=yes
SecureBits=keep-caps

# Vault a besoin de mlock pour éviter que les secrets aillent en swap
AmbientCapabilities=CAP_IPC_LOCK
CapabilityBoundingSet=CAP_SYSLOG CAP_IPC_LOCK
NoNewPrivileges=yes

ExecStart=/usr/bin/vault server -config=/etc/vault.d/vault.hcl
ExecReload=/bin/kill --signal HUP $MAINPID
KillMode=process
KillSignal=SIGINT
Restart=on-failure
RestartSec=5
TimeoutStopSec=30
LimitMEMLOCK=infinity  # Nécessaire pour mlock

[Install]
WantedBy=multi-user.target
```

```bash
# Activer et démarrer le service
sudo systemctl daemon-reload
sudo systemctl enable vault
sudo systemctl start vault

# Vérifier le statut
sudo systemctl status vault
```

---

## 10. Initialisation & Unsealing

### Initialisation (une seule fois)

L'initialisation génère les clés de déverrouillage et le token root initial. **À faire une seule fois** lors du premier démarrage.

```bash
# Configurer l'adresse Vault
export VAULT_ADDR='https://vault.mondomaine.com:8200'

# Initialiser avec 5 clés Shamir (3 nécessaires pour déverrouiller)
vault operator init \
  -key-shares=5 \
  -key-threshold=3 \
  -format=json > /tmp/vault-init.json

# Afficher le résultat (À CONSERVER PRÉCIEUSEMENT !)
cat /tmp/vault-init.json
```

**Sortie (exemple) :**
```json
{
  "unseal_keys_b64": [
    "clé1_en_base64",
    "clé2_en_base64",
    "clé3_en_base64",
    "clé4_en_base64",
    "clé5_en_base64"
  ],
  "unseal_keys_hex": ["..."],
  "unseal_threshold": 3,
  "unseal_shares": 5,
  "root_token": "hvs.XXXXXXXXXXXXXXXXXXXXXXXXX"
}
```

> 🔐 **Sécurité critique** : Les unseal keys et le root token doivent être distribués à des personnes différentes et stockés de manière sécurisée (coffre physique, HSM, gestionnaire de secrets externe). **Ne les stockez JAMAIS dans le même endroit.**

### Déverrouillage manuel (Shamir)

```bash
# Fournir 3 clés parmi les 5 (à faire sur chaque redémarrage)
vault operator unseal <clé1_en_base64>
vault operator unseal <clé2_en_base64>
vault operator unseal <clé3_en_base64>

# Vérifier que Vault est déverrouillé
vault status
# → Sealed: false  ← C'est bon !
```

### Connexion avec le token root initial

```bash
# S'authentifier avec le root token
vault login hvs.XXXXXXXXXXXXXXXXXXXXXXXXX

# ⚠️ Bonnes pratiques :
# 1. Utilisez le root token UNIQUEMENT pour la configuration initiale
# 2. Créez des admins via auth methods
# 3. Révoquez le root token initial dès que possible
vault token revoke -self
```

---

## 11. Auto-unseal avec AWS KMS

En production, l'unsealing manuel est problématique : Vault se re-scelle à chaque redémarrage et nécessite une intervention humaine. L'**auto-unseal** délègue cette opération à un service de confiance.

### Configuration AWS KMS

```bash
# 1. Créer une clé KMS dans AWS (via CLI ou console)
aws kms create-key \
  --description "Vault Auto-Unseal Key" \
  --key-usage ENCRYPT_DECRYPT \
  --key-spec SYMMETRIC_DEFAULT

# Récupérer le Key ID
aws kms list-keys
```

```hcl
# Ajouter dans /etc/vault.d/vault.hcl

# Bloc seal pour auto-unseal avec AWS KMS
seal "awskms" {
  region     = "eu-west-1"              # Votre région AWS
  kms_key_id = "arn:aws:kms:eu-west-1:123456789012:key/abcd-1234-..."

  # Utiliser le rôle IAM de l'instance (recommandé)
  # Ne jamais mettre les credentials en clair ici !
  # Si nécessaire, utiliser des variables d'environnement :
  # access_key = ""   ← NE PAS FAIRE ÇA
  # secret_key = ""   ← NE PAS FAIRE ÇA
}
```

> 💡 **Bonne pratique** : Si votre instance EC2 tourne dans le même compte AWS que la clé KMS, attachez un rôle IAM à l'instance avec les permissions KMS. Vault utilisera automatiquement ce rôle sans aucune credential en clair.

**Permissions IAM minimales nécessaires :**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "kms:Encrypt",
        "kms:Decrypt",
        "kms:DescribeKey"
      ],
      "Resource": "arn:aws:kms:eu-west-1:123456789012:key/votre-key-id"
    }
  ]
}
```

### Autres méthodes d'auto-unseal

| Méthode | Configuration |
|---------|--------------|
| **Azure Key Vault** | `seal "azurekeyvault" { tenant_id = "..." vault_name = "..." key_name = "..." }` |
| **GCP Cloud KMS** | `seal "gcpckms" { project = "..." location = "..." key_ring = "..." crypto_key = "..." }` |
| **Transit (autre Vault)** | `seal "transit" { address = "https://vault-primary:8200" token = "..." key_name = "..." }` |

---

## 12. Secrets KV — Stockage clé-valeur

KV v2 est le secrets engine le plus utilisé. Il offre un stockage classique avec **versioning** (10 dernières versions conservées par défaut).

### Activer l'engine KV v2

```bash
# En dev mode, secret/ est déjà activé en KV v1
# En production, activer KV v2 sur un nouveau chemin
vault secrets enable -path=kv -version=2 kv

# Vérifier les engines activés
vault secrets list
```

### Opérations de base

```bash
# ─────────────────────────────────────
# ÉCRIRE un secret
# ─────────────────────────────────────
vault kv put kv/production/database \
  host="db.mondomaine.com" \
  port="5432" \
  username="app_user" \
  password="s3cur3P@ssw0rd" \
  dbname="myapp"

# Sortie :
# == Secret Path ==
# kv/data/production/database
# === Metadata ===
# created_time     2026-03-01T10:00:00Z
# version          1

# ─────────────────────────────────────
# LIRE un secret
# ─────────────────────────────────────
vault kv get kv/production/database

# Lire seulement un champ spécifique
vault kv get -field=password kv/production/database

# Lire en JSON (utile pour les scripts)
vault kv get -format=json kv/production/database | jq '.data.data'

# ─────────────────────────────────────
# METTRE À JOUR (crée une nouvelle version)
# ─────────────────────────────────────
vault kv put kv/production/database \
  host="db.mondomaine.com" \
  port="5432" \
  username="app_user" \
  password="n3wP@ssw0rd2026" \  # Nouveau mot de passe
  dbname="myapp"

# Vérifier les versions disponibles
vault kv metadata get kv/production/database
# → versions: {1: ..., 2: ...}

# ─────────────────────────────────────
# LIRE UNE VERSION PRÉCÉDENTE
# ─────────────────────────────────────
vault kv get -version=1 kv/production/database

# ─────────────────────────────────────
# SUPPRIMER la dernière version
# ─────────────────────────────────────
vault kv delete kv/production/database
# Note : les données restent dans l'historique, seule la version courante est marquée "deleted"

# SUPPRIMER définitivement une version spécifique
vault kv destroy -versions=1 kv/production/database

# ─────────────────────────────────────
# LISTER les secrets d'un chemin
# ─────────────────────────────────────
vault kv list kv/production/
# → Keys
# → ----
# → database
# → api-keys/
```

### Utilisation via l'API REST

```bash
# Lire un secret via l'API (utile pour les scripts et applications)
curl \
  --header "X-Vault-Token: $VAULT_TOKEN" \
  --request GET \
  https://vault.mondomaine.com:8200/v1/kv/data/production/database

# Écrire un secret via l'API
curl \
  --header "X-Vault-Token: $VAULT_TOKEN" \
  --header "Content-Type: application/json" \
  --request POST \
  --data '{"data": {"username": "admin", "password": "s3cr3t"}}' \
  https://vault.mondomaine.com:8200/v1/kv/data/production/database
```

---

## 13. Transit — Chiffrement as a Service

Transit est unique : votre application envoie des données à Vault pour les chiffrer/déchiffrer, mais **n'a jamais accès aux clés de chiffrement**. Les clés ne quittent jamais Vault.

C'est particulièrement utile pour la conformité RGPD : vous pouvez chiffrer des données personnelles et les déchiffrer uniquement sur demande autorisée.

### Activer l'engine Transit

```bash
vault secrets enable transit
```

### Créer une clé de chiffrement

```bash
# Créer une clé AES-256-GCM256 (recommandée)
vault write -f transit/keys/mon-app type=aes256-gcm96

# Créer une clé RSA (pour asymétrique)
vault write -f transit/keys/mon-app-rsa type=rsa-4096

# Voir les propriétés de la clé
vault read transit/keys/mon-app
```

### Chiffrer et déchiffrer

```bash
# ─────────────────────────────────────
# CHIFFRER des données
# ─────────────────────────────────────
# Les données doivent être encodées en base64
DONNEES_B64=$(echo -n "Données sensibles à protéger" | base64)

vault write transit/encrypt/mon-app plaintext=$DONNEES_B64

# Sortie :
# Key            Value
# ---            -----
# ciphertext     vault:v1:DlvnIAU7yBWvqPYKg7k3eM8Lk...
# key_version    1

# Stocker uniquement le ciphertext dans votre base de données
CIPHERTEXT="vault:v1:DlvnIAU7yBWvqPYKg7k3eM8Lk..."

# ─────────────────────────────────────
# DÉCHIFFRER des données
# ─────────────────────────────────────
vault write transit/decrypt/mon-app ciphertext=$CIPHERTEXT

# Sortie :
# Key          Value
# ---          -----
# plaintext    RG9ubsOpZXMgc2Vuc2libGVzIMOgIHByb3TDqWdlcg==

# Décoder le résultat base64
echo "RG9ubsOpZXMgc2Vuc2libGVzIMOgIHByb3TDqWdlcg==" | base64 -d
# → Données sensibles à protéger
```

### Rotation des clés (sans re-chiffrement de toutes les données)

```bash
# Créer une nouvelle version de la clé
vault write -f transit/keys/mon-app/rotate

# La clé passe à la version 2
# Les nouvelles données sont chiffrées avec v2
# Les anciennes données chiffrées avec v1 restent déchiffrables

# Voir les versions
vault read transit/keys/mon-app
# → min_decryption_version    1
# → min_encryption_version    2  ← Nouvelles données avec v2

# Re-chiffrer les anciennes données avec la nouvelle clé (optionnel)
vault write transit/rewrap/mon-app \
  ciphertext="vault:v1:DlvnIAU7yBWvqPYKg7k3eM8Lk..."
# → Retourne un nouveau ciphertext avec v2
```

### Exemple Python complet

```python
import hvac  # pip install hvac
import base64

client = hvac.Client(
    url='https://vault.mondomaine.com:8200',
    token='votre-token'
)

# Chiffrer
def chiffrer(donnees: str, cle: str = 'mon-app') -> str:
    b64 = base64.b64encode(donnees.encode()).decode()
    response = client.secrets.transit.encrypt_data(
        name=cle,
        plaintext=b64
    )
    return response['data']['ciphertext']

# Déchiffrer
def dechiffrer(ciphertext: str, cle: str = 'mon-app') -> str:
    response = client.secrets.transit.decrypt_data(
        name=cle,
        ciphertext=ciphertext
    )
    b64 = response['data']['plaintext']
    return base64.b64decode(b64).decode()

# Utilisation
secret = "email@utilisateur.com"  # Donnée RGPD
chiffre = chiffrer(secret)
print(f"Stocké en BDD : {chiffre}")   # vault:v1:DlvnI...

recupere = dechiffrer(chiffre)
print(f"Déchiffré : {recupere}")       # email@utilisateur.com
```

---

## 14. Authentification userpass et AppRole

### Méthode userpass (pour les humains)

```bash
# ─────────────────────────────────────
# CONFIGURATION (par l'admin)
# ─────────────────────────────────────

# Activer l'auth method userpass
vault auth enable userpass

# Créer un utilisateur
vault write auth/userpass/users/alice \
  password="MonMotDePasseSécurisé!" \
  policies="policy-dev-team"

# Modifier le mot de passe
vault write auth/userpass/users/alice \
  password="NouveauMotDePasse!"

# ─────────────────────────────────────
# CONNEXION (par l'utilisateur)
# ─────────────────────────────────────

vault login -method=userpass \
  username=alice \
  password="MonMotDePasseSécurisé!"

# Vault retourne un token valable selon la policy
# Key                    Value
# ---                    -----
# token                  hvs.CAES...
# token_duration         768h
# token_renewable        true
# token_policies         ["default", "policy-dev-team"]
```

### Méthode AppRole (pour les applications)

AppRole est conçu pour les machines et les pipelines CI/CD.

```bash
# ─────────────────────────────────────
# CONFIGURATION (par l'admin)
# ─────────────────────────────────────

# Activer AppRole
vault auth enable approle

# Créer un rôle pour votre application
vault write auth/approle/role/mon-app \
  token_policies="policy-mon-app" \
  token_ttl="1h" \           # Le token expire après 1 heure
  token_max_ttl="4h" \       # Maximum 4 heures même en renouvellement
  secret_id_ttl="10m" \      # Le secret_id expire en 10 minutes
  secret_id_num_uses=1        # Le secret_id n'est utilisable qu'une seule fois

# Récupérer le role_id (à mettre en variable d'env dans votre app)
vault read auth/approle/role/mon-app/role-id
# → role_id: 9c741c69-c24a-4e14-9b90-7b8c7f8c3a4a

# Générer un secret_id (à faire à chaque déploiement ou via CI/CD)
vault write -f auth/approle/role/mon-app/secret-id
# → secret_id:           8f3f3f2c-7c8d-4c8a-9c8d-8f3f3f2c7c8d
# → secret_id_accessor:  abc123...

# ─────────────────────────────────────
# AUTHENTIFICATION (dans l'application)
# ─────────────────────────────────────

# L'application s'authentifie avec role_id + secret_id
vault write auth/approle/login \
  role_id="9c741c69-c24a-4e14-9b90-7b8c7f8c3a4a" \
  secret_id="8f3f3f2c-7c8d-4c8a-9c8d-8f3f3f2c7c8d"

# → token    hvs.CAES...   ← Token à utiliser pour les requêtes suivantes
```

### AppRole avec Response Wrapping (sécurité renforcée)

Le response wrapping résout le "secret zero problem" : comment donner le `secret_id` à l'application de manière sécurisée ?

```bash
# Générer un secret_id wrappé dans un token à usage unique (TTL 5 minutes)
vault write -wrap-ttl=5m -f auth/approle/role/mon-app/secret-id

# → wrapping_token:    hvs.WRAP...  ← Token wrapper (expire en 5 min)
# → wrapping_ttl:      5m
# → creation_path:     auth/approle/role/mon-app/secret-id

# L'application déroule le token pour obtenir le vrai secret_id
vault unwrap hvs.WRAP...
# → secret_id: 8f3f3f2c-...   ← Le vrai secret_id

# Si quelqu'un intercepte le token wrapper, vous le saurez :
# une deuxième tentative de dérobage retourne une erreur
```

### Exemple Go — Authentification AppRole

```go
package main

import (
    "fmt"
    "log"
    vault "github.com/hashicorp/vault/api"
)

func main() {
    // Configuration du client Vault
    config := vault.DefaultConfig()
    config.Address = "https://vault.mondomaine.com:8200"

    client, err := vault.NewClient(config)
    if err != nil {
        log.Fatal(err)
    }

    // Authentification AppRole
    data := map[string]interface{}{
        "role_id":   "9c741c69-c24a-4e14-9b90-7b8c7f8c3a4a",
        "secret_id": "8f3f3f2c-7c8d-4c8a-9c8d-8f3f3f2c7c8d",
    }

    resp, err := client.Logical().Write("auth/approle/login", data)
    if err != nil {
        log.Fatal(err)
    }

    // Utiliser le token reçu
    client.SetToken(resp.Auth.ClientToken)

    // Lire un secret
    secret, err := client.KVv2("kv").Get(nil, "production/database")
    if err != nil {
        log.Fatal(err)
    }

    fmt.Println("Mot de passe DB:", secret.Data["password"])
}
```

---

## 15. Écrire des Policies HCL

Les policies définissent précisément les droits d'accès. Elles sont écrites en HCL (HashiCorp Configuration Language).

### Structure d'une policy

```hcl
# Syntaxe générale
path "chemin/vers/secret" {
  capabilities = ["liste", "des", "permissions"]
}

# Wildcards disponibles :
# *  → remplace un ou plusieurs segments (secret/data/dev/*)
# +  → remplace exactement un segment (secret/data/+/config)
```

### Exemple complet — Policy équipe développement

```hcl
# policy-dev-team.hcl
# Policy pour l'équipe de développement

# ─────────────────────────────────────
# Accès complet aux secrets de dev
# ─────────────────────────────────────
path "kv/data/development/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

# Accès aux métadonnées (versions) en dev
path "kv/metadata/development/*" {
  capabilities = ["read", "list"]
}

# ─────────────────────────────────────
# Lecture seule sur staging
# ─────────────────────────────────────
path "kv/data/staging/*" {
  capabilities = ["read", "list"]
}

# ─────────────────────────────────────
# Aucun accès à la production
# (tout ce qui n'est pas listé est refusé par défaut)
# ─────────────────────────────────────

# ─────────────────────────────────────
# Permettre de renouveler son propre token
# ─────────────────────────────────────
path "auth/token/renew-self" {
  capabilities = ["update"]
}

# Permettre de voir les informations de son token
path "auth/token/lookup-self" {
  capabilities = ["read"]
}
```

### Exemple complet — Policy application CI/CD

```hcl
# policy-ci-runner.hcl
# Policy pour les pipelines GitLab/GitHub CI

# Lecture seule sur les secrets de build
path "kv/data/ci/*" {
  capabilities = ["read"]
}

# Accès au Transit pour signer des artefacts
path "transit/sign/ci-signing-key" {
  capabilities = ["update"]
}

# Vérification de signatures
path "transit/verify/ci-signing-key" {
  capabilities = ["update"]
}

# Générer des credentials AWS temporaires pour les déploiements
path "aws/creds/deployer-role" {
  capabilities = ["read"]
}
```

### Appliquer une policy

```bash
# Créer/mettre à jour une policy depuis un fichier
vault policy write dev-team policy-dev-team.hcl

# Créer une policy inline
vault policy write ci-runner - <<EOF
path "kv/data/ci/*" {
  capabilities = ["read"]
}
EOF

# Lister les policies existantes
vault policy list

# Lire une policy
vault policy read dev-team

# Vérifier la syntaxe sans appliquer
vault policy fmt policy-dev-team.hcl

# Tester les accès (utile pour déboguer)
# Créer un token avec la policy et tester
vault token create -policy=dev-team -ttl=30m
```

### Tester une policy avec `vault token capabilities`

```bash
# Créer un token de test avec la policy
TEST_TOKEN=$(vault token create -policy=dev-team -ttl=10m -format=json | jq -r '.auth.client_token')

# Vérifier ce que ce token peut faire sur un chemin spécifique
VAULT_TOKEN=$TEST_TOKEN vault token capabilities kv/data/development/ma-config
# → create, delete, list, read, update

VAULT_TOKEN=$TEST_TOKEN vault token capabilities kv/data/production/secrets
# → deny   ← Bien refusé !
```

---

## 16. PKI — Autorité de certification interne

Vault PKI vous permet de créer votre propre PKI (Public Key Infrastructure) et d'émettre des certificats TLS signés par votre CA interne. C'est idéal pour le mTLS entre microservices.

### Mettre en place une CA Root + Intermédiaire

```bash
# ─────────────────────────────────────
# ÉTAPE 1 : Créer la CA Root
# ─────────────────────────────────────

# Activer le PKI engine pour la CA root
vault secrets enable -path=pki pki

# Définir la durée de vie maximale des certificats (10 ans pour la root)
vault secrets tune -max-lease-ttl=87600h pki

# Générer la clé et le certificat auto-signé de la CA root
vault write -field=certificate pki/root/generate/internal \
  common_name="Mon Entreprise Root CA" \
  issuer_name="root-ca" \
  ttl=87600h \
  key_type=rsa \
  key_bits=4096 > root-ca.crt

# Configurer les URLs de distribution
vault write pki/config/urls \
  issuing_certificates="https://vault.mondomaine.com:8200/v1/pki/ca" \
  crl_distribution_points="https://vault.mondomaine.com:8200/v1/pki/crl"

# ─────────────────────────────────────
# ÉTAPE 2 : Créer la CA Intermédiaire
# ─────────────────────────────────────

# Activer un second PKI engine pour la CA intermédiaire
vault secrets enable -path=pki_int pki

# Durée de vie max des certificats émis (5 ans pour l'intermédiaire)
vault secrets tune -max-lease-ttl=43800h pki_int

# Générer la CSR de la CA intermédiaire
vault write -format=json pki_int/intermediate/generate/internal \
  common_name="Mon Entreprise Intermediate CA" \
  issuer_name="intermediate-ca" \
  key_type=rsa \
  key_bits=4096 \
  | jq -r '.data.csr' > intermediate.csr

# Signer la CSR avec la CA root
vault write -format=json pki/root/sign-intermediate \
  issuer_ref="root-ca" \
  csr=@intermediate.csr \
  format=pem_bundle \
  ttl=43800h \
  | jq -r '.data.certificate' > intermediate.crt

# Importer le certificat signé dans la CA intermédiaire
vault write pki_int/intermediate/set-signed certificate=@intermediate.crt

# ─────────────────────────────────────
# ÉTAPE 3 : Créer un rôle pour émettre des certificats
# ─────────────────────────────────────
vault write pki_int/roles/mondomaine-com \
  issuer_ref="intermediate-ca" \
  allowed_domains="mondomaine.com,svc.cluster.local" \
  allow_subdomains=true \
  allow_glob_domains=false \
  max_ttl="720h" \     # 30 jours maximum
  key_type="rsa" \
  key_bits=2048

# ─────────────────────────────────────
# ÉTAPE 4 : Émettre un certificat
# ─────────────────────────────────────
vault write pki_int/issue/mondomaine-com \
  common_name="mon-service.mondomaine.com" \
  ttl="24h"

# Sortie : certificate, issuing_ca, private_key, serial_number
```

### Renouvellement automatique avec Vault Agent

```bash
# Vault Agent surveille l'expiration et renouvelle automatiquement
# Exemple de template pour un certificat

# vault-agent.hcl
auto_auth {
  method "approle" {
    config = {
      role_id_file_path   = "/etc/vault/role-id"
      secret_id_file_path = "/etc/vault/secret-id"
    }
  }
}

template {
  source      = "/etc/vault/templates/cert.tpl"
  destination = "/etc/nginx/ssl/server.crt"
  command     = "systemctl reload nginx"  # Recharge après renouvellement
}
```

---

## 17. Opérer en production

### Cluster Haute Disponibilité (HA)

Pour la production, un cluster d'au moins **3 nœuds** est recommandé pour la tolérance aux pannes.

```
Node 1 (Leader)          Node 2 (Follower)         Node 3 (Follower)
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│   ACTIVE     │◄────────►│   STANDBY    │◄────────►│   STANDBY    │
│  vault-1     │  Raft    │  vault-2     │  Raft    │  vault-3     │
│  :8200/:8201 │          │  :8200/:8201 │          │  :8200/:8201 │
└──────────────┘          └──────────────┘          └──────────────┘
       ▲                                                    ▲
       │              Load Balancer                        │
       └───────────────────┬────────────────────────────────┘
                           │
                     vault.mondomaine.com:443
```

```bash
# Voir l'état du cluster Raft
vault operator raft list-peers

# Output:
# Node            Address                        State       Voter
# ----            -------                        -----       -----
# vault-node-1    vault-1.mondomaine.com:8201    leader      true
# vault-node-2    vault-2.mondomaine.com:8201    follower    true
# vault-node-3    vault-3.mondomaine.com:8201    follower    true
```

### Sauvegardes (Snapshots Raft)

```bash
# Créer un snapshot manuel
vault operator raft snapshot save /backup/vault-snapshot-$(date +%Y%m%d-%H%M%S).snap

# Automatiser avec un cron
# /etc/cron.d/vault-backup
0 2 * * * vault /usr/bin/vault operator raft snapshot save \
  /backup/vault-snapshot-$(date +\%Y\%m\%d).snap

# Restaurer depuis un snapshot (en cas de disaster recovery)
vault operator raft snapshot restore /backup/vault-snapshot-20260301.snap
```

### Monitoring avec Prometheus

```bash
# Activer l'endpoint de métriques
vault write sys/config/ui prometheus_retention_time="30s"

# Requêtes Prometheus utiles
# Métriques disponibles sur /v1/sys/metrics?format=prometheus
curl \
  --header "X-Vault-Token: $VAULT_TOKEN" \
  https://vault.mondomaine.com:8200/v1/sys/metrics?format=prometheus
```

**Métriques clés à surveiller :**

| Métrique | Alerte si... |
|----------|-------------|
| `vault_core_unsealed` | = 0 (Vault est scellé) |
| `vault_expire_num_leases` | > seuil (trop de leases) |
| `vault_runtime_alloc_bytes` | Croissance continue (fuite mémoire) |
| `vault_token_lookup` | Taux d'erreurs élevé |
| `vault_audit_log_request_failure` | > 0 (audit en échec = Vault se scelle) |

> ⚠️ **Important** : Si l'audit device (journal d'audit) échoue, Vault se scelle automatiquement par sécurité. Surveillez `vault_audit_log_request_failure`.

### Activer les journaux d'audit

```bash
# Activer l'audit vers un fichier
vault audit enable file file_path=/var/log/vault/audit.log

# Activer l'audit vers syslog
vault audit enable syslog tag="vault" facility="AUTH"

# Vérifier les audit devices actifs
vault audit list

# Exemple d'entrée d'audit (JSON)
# {
#   "time": "2026-03-01T10:00:00Z",
#   "type": "request",
#   "auth": {"client_token": "hmac:...", "policies": ["dev-team"]},
#   "request": {
#     "operation": "read",
#     "path": "kv/data/production/database"
#   }
# }
```

### Hardening de sécurité

```bash
# 1. Ne pas lancer Vault en root (déjà configuré dans le service systemd)

# 2. Révoquer le root token initial après la configuration
vault token revoke <root-token>

# 3. Configurer le verrouillage des comptes (userpass, AppRole, LDAP)
vault write sys/config/user-lockout \
  lockout_threshold=5 \        # Verrouillage après 5 échecs
  lockout_duration=15m \       # Durée du verrouillage
  lockout_counter_reset=5m     # Reset du compteur après 5 min

# 4. Activer SELinux/AppArmor sur le serveur

# 5. Rotation périodique de la clé de chiffrement maître
vault operator rotate

# 6. Vérifier la santé du cluster
vault operator members
vault status
```

---

## 18. Vault CE vs Enterprise vs OpenBao

### Comparaison des éditions

| Fonctionnalité | Vault CE | Vault Enterprise | OpenBao |
|---------------|----------|-----------------|---------|
| KV, Transit, PKI, Database, SSH | ✅ | ✅ | ✅ |
| Auth methods (AppRole, K8s, OIDC, LDAP) | ✅ | ✅ | ✅ |
| Auto-unseal (Cloud KMS, Transit) | ✅ | ✅ | ✅ |
| Raft storage intégré | ✅ | ✅ | ✅ |
| Interface Web | ✅ | ✅ | ✅ |
| Namespaces (multi-tenancy) | ❌ | ✅ | ✅ |
| Replication (DR, Performance) | ❌ | ✅ | ❌ |
| MFA intégrée | ❌ | ✅ | ❌ |
| Sentinel (policies avancées) | ❌ | ✅ | ❌ |
| Control Groups | ❌ | ✅ | ❌ |
| HSM Support | ❌ | ✅ | ❌ |
| **Licence** | BSL 1.1 | Commerciale | MPL 2.0 (OSI) |
| **Coût** | Gratuit | Payant | Gratuit |
| **Maturité** | 10+ ans | 10+ ans | 2+ ans |

### Quand choisir quoi ?

| Profil | Solution recommandée | Raison |
|--------|---------------------|--------|
| Petite équipe (< 10 dev) | Infisical, Doppler, SOPS | Complexité réduite |
| Startup / équipe moyenne | **Vault CE** | Excellent rapport puissance/complexité |
| Plateforme interne multi-équipes | **Vault Enterprise** ou **OpenBao** | Namespaces, isolation |
| Kubernetes-first | External Secrets + Vault/OpenBao | Intégration native |
| Conformité stricte | **Vault Enterprise** | MFA, Sentinel, Control Groups |
| Licence open source requise | **OpenBao** | MPL 2.0, namespaces inclus |

### OpenBao — le fork open source

OpenBao est un fork de Vault créé en 2023 après le changement de licence, maintenu par la **Linux Foundation** sous licence MPL 2.0.

```bash
# Installation OpenBao (même API que Vault)
wget https://github.com/openbao/openbao/releases/download/v2.x.x/bao_2.x.x_linux_amd64.zip
unzip bao_2.x.x_linux_amd64.zip
sudo mv bao /usr/local/bin/

# Commandes identiques à Vault (alias)
bao server -dev
bao kv put secret/test key=value
bao kv get secret/test
```

---

## 19. Licence BSL — Ce que ça implique

Depuis août 2023, Vault est sous **Business Source License (BSL) 1.1** au lieu de MPL 2.0. C'est une licence source-available, pas open source au sens OSI.

### Ce que vous pouvez faire

| Usage | Autorisé ? |
|-------|-----------|
| Utiliser Vault pour vos besoins internes | ✅ Oui |
| Déployer Vault pour vos propres applications | ✅ Oui |
| Consulting et services autour de Vault | ✅ Oui |
| Contribuer au code source | ✅ Oui |
| Créer une offre managée concurrente à HCP Vault | ❌ Non |

**En pratique** : si vous utilisez Vault pour vos besoins internes ou en tant que consultant, vous n'êtes pas impacté. La restriction cible les offres "Vault-as-a-Service" concurrentes à HashiCorp.

---

## 20. À retenir

### Les 7 points essentiels

1. **Vault est puissant mais exigeant** : évaluez si vous avez les ressources pour l'opérer avant d'adopter.

2. **Vault CE couvre 80% des besoins** : KV, Transit, PKI, Database, SSH, toutes les auth methods — gratuit et complet.

3. **Enterprise pour les grandes organisations** : namespaces multi-tenant, réplication DR, MFA intégrée, Sentinel.

4. **Auto-unseal en production** : configurez-le impérativement (AWS KMS, Azure Key Vault, GCP KMS) pour éviter les interventions manuelles après chaque redémarrage.

5. **Moindre privilège toujours** : écrivez des policies précises, jamais de wildcards sur la production, testez-les avant de déployer.

6. **Audit obligatoire** : activez au moins un audit device en production. Son échec scelle automatiquement Vault.

7. **OpenBao** : alternative open source mature avec namespaces inclus, une vraie alternative si la licence BSL est bloquante.

### Checklist de démarrage

```
□ Installation de Vault CE (via package manager)
□ Création de l'utilisateur système dédié
□ Configuration de vault.hcl (Raft storage, TLS, api_addr)
□ Service systemd configuré et activé
□ Initialisation avec clés Shamir (3/5 minimum)
□ Distribution sécurisée des unseal keys
□ Configuration de l'auto-unseal (production)
□ Activation de l'audit device
□ Création des auth methods (userpass, AppRole, K8s selon besoins)
□ Écriture des policies (moindre privilège)
□ Révocation du root token initial
□ Configuration du monitoring (Prometheus + alertes)
□ Mise en place des sauvegardes automatiques (snapshots Raft)
□ Test de restauration depuis snapshot
□ Documentation des procédures d'incident
```

---

*Documentation basée sur HashiCorp Vault Community Edition 1.21.x — Mars 2026*
*Sources : [HashiCorp Developer Docs](https://developer.hashicorp.com/vault), [Production Hardening Guide](https://developer.hashicorp.com/vault/docs/concepts/production-hardening)*
