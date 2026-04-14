---
title: "🔐 Guide IAM : Keycloak & authentik"
description: "Concepts, Architecture, Cas d'usage Cloud & On-Premise (Proxmox) — Comparaison Keycloak vs authentik"
created: "2026-04-05"
# updated: "2026-04-04"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"

---

<!-- # 🔐 Guide IAM Complet : Keycloak & authentik -->
> **Concepts, Architecture, Cas d'usage Cloud & On-Premise (Proxmox) — Comparaison Keycloak vs authentik**

---

## Table des matières

1. [Les bases de l'IAM](#1-les-bases-de-liam)
2. [Keycloak — Concepts & Architecture](#2-keycloak--concepts--architecture)
3. [Keycloak — Installation pratique](#3-keycloak--installation-pratique)
4. [Keycloak — Cas d'usage concrets](#4-keycloak--cas-dusage-concrets)
5. [authentik — Concepts & Architecture](#5-authentik--concepts--architecture)
6. [authentik — Installation pratique](#6-authentik--installation-pratique)
7. [Keycloak vs authentik — Comparaison complète](#7-keycloak-vs-authentik--comparaison-complète)
8. [Déploiement On-Premise : Proxmox](#8-déploiement-on-premise--proxmox)
9. [Déploiement Cloud](#9-déploiement-cloud)
10. [Choisir entre Keycloak et authentik](#10-choisir-entre-keycloak-et-authentik)
11. [Ressources officielles](#11-ressources-officielles)
12. [Exemples pratiques complets — Keycloak](#12-exemples-pratiques-complets--keycloak)
    - [Ex.1 — On-Premise : SSO React + API Node.js (end-to-end)](#-exemple-1--keycloak-on-premise-proxmoxvm--sso-pour-une-app-react--api-nodejs)
    - [Ex.2 — On-Premise : Fédération Active Directory](#-exemple-2--keycloak-on-premise--fédération-active-directory-ldap)
    - [Ex.3 — Cloud K8s : Realm as Code + GitLab + Grafana](#%EF%B8%8F-exemple-3--keycloak-cloud-kubernetes--gitops--realm-as-code)
13. [Exemples pratiques complets — authentik](#13-exemples-pratiques-complets--authentik)
    - [Ex.4 — On-Premise : Portail SSO homelab (Grafana, Portainer)](#-exemple-4--authentik-on-premise-proxmox--portail-sso-pour-homelab)
    - [Ex.5 — MFA conditionnel par groupe (Flow personnalisé)](#-exemple-5--authentik--mfa-conditionnel-par-groupe-flow-personnalisé)
    - [Ex.6 — Cloud K8s : OIDC pour GitLab + Nextcloud](#%EF%B8%8F-exemple-6--authentik-cloud-kubernetes--oidc-pour-gitlab--nextcloud)
    - [Ex.7 — Provisioning SCIM automatique](#-exemple-7--authentik--provisioning-scim-vers-slackgithub)
14. [Dépannage et erreurs fréquentes](#14-dépannage-et-cas-derreurs-fréquents)
15. [Scripts utilitaires (backup, healthcheck)](#15-scripts-utilitaires)

---

## 1. Les bases de l'IAM

### Qu'est-ce que l'IAM ?

**IAM = Identity and Access Management** — c'est l'ensemble des outils et processus qui répondent à trois questions fondamentales :

| Question | Terme technique | Exemple concret |
|---|---|---|
| Qui es-tu ? | **Authentification (AuthN)** | Tu tapes ton mot de passe |
| Qu'as-tu le droit de faire ? | **Autorisation (AuthZ)** | Tu peux lire les fichiers mais pas les supprimer |
| Qu'as-tu fait ? | **Audit** | Le log dit que tu t'es connecté à 9h |

> 💡 **Analogie simple** : c'est comme un immeuble de bureaux. Le badge à l'entrée vérifie *qui tu es* (AuthN), la porte de la salle serveur n'est accessible qu'aux admins (AuthZ), et le registre de sécurité trace chaque passage (Audit).

### Les concepts clés

**Identity Provider (IdP)** : le service central qui gère les identités. C'est lui qui dit "oui, c'est bien Alice". Keycloak et authentik sont des IdPs.

**Single Sign-On (SSO)** : tu te connectes une seule fois, et toutes tes applications te reconnaissent. Comme un bracelet de festival — un contrôle d'entrée, accès à toutes les scènes.

**OAuth 2.0** : protocole de *délégation d'accès*. Il permet à une app d'accéder à tes données sans connaître ton mot de passe.

**OpenID Connect (OIDC)** : protocole d'*authentification* basé sur OAuth 2.0. Il ajoute la couche "identité" — il répond à "qui est cet utilisateur ?". C'est le standard moderne pour le SSO.

**SAML 2.0** : protocole d'authentification plus ancien, basé sur XML. Encore très utilisé dans les entreprises avec des applications legacy (Salesforce, Jira, etc.).

**LDAP / Active Directory** : annuaire d'entreprise qui stocke les utilisateurs. Keycloak et authentik peuvent se connecter à un AD existant.

```
Flux SSO simplifié :

Utilisateur → Application → "Je ne te connais pas" → Redirige vers l'IdP
                                                              ↓
                                                    Connexion sur Keycloak/authentik
                                                              ↓
                                          Token remis à l'application → Accès accordé
```

---

## 2. Keycloak — Concepts & Architecture

### Qu'est-ce que Keycloak ?

Keycloak est un serveur SSO/IdP **open-source** développé et maintenu par **Red Hat** (depuis 2014). C'est la référence dans le monde Java/entreprise. Il est maintenant un projet incubé par la **CNCF** (Cloud Native Computing Foundation), comme Kubernetes.

Il gère en natif : SSO, OIDC, OAuth 2.0, SAML 2.0, MFA, LDAP, et bien plus.

> ⚠️ **Ce que Keycloak n'est PAS** : ce n'est pas un remplacement d'Active Directory. Il peut s'y connecter, mais ne gère pas les GPO, les stratégies Windows ou l'authentification Kerberos native.

### Les briques fondamentales de Keycloak

#### 🏠 Realm (le "tenant")

Un realm est un **espace totalement isolé** dans Keycloak. Chaque realm a ses propres utilisateurs, applications, rôles et configuration. C'est l'unité d'isolation.

```
Keycloak
├── master      ← Réservé à l'administration de Keycloak lui-même (JAMAIS pour vos apps)
├── production  ← Vos utilisateurs prod + applications prod
└── staging     ← Environnement de test isolé
```

> ✅ **Bonne pratique** : créez **un realm par environnement** (prod, staging, dev) ou **un realm par client** (si vous faites du multi-tenant). Ne mettez jamais vos utilisateurs dans `master`.

#### 📱 Client (une application)

Un client représente une application qui délègue son authentification à Keycloak.

| Type de client | Utilisation | Exemples |
|---|---|---|
| **Public** | App sans backend sécurisé, ne peut pas garder un secret | SPA React, app mobile |
| **Confidential** | App avec backend, a un `client_secret` | API Node.js, app Spring Boot |
| **Bearer-only** | API qui valide les tokens mais n'initie pas de login | Microservice interne |

**Configuration clé d'un client :**
- **Redirect URIs** : URLs autorisées après le login (ex: `https://monapp.com/callback`)
- **Web Origins** : domaines autorisés pour CORS (ex: `https://monapp.com`)

#### 👤 Users (utilisateurs)

Les utilisateurs vivent dans un realm. Chaque utilisateur a :
- Des **identifiants** : `username`, `email`
- Des **credentials** : mot de passe, OTP, clé WebAuthn
- Des **attributs** : données personnalisées (`département`, `matricule`)
- Un **état** : actif/inactif, email vérifié, actions requises

#### 👥 Groups (groupes)

Les groupes organisent les utilisateurs de manière hiérarchique et permettent d'hériter de rôles et d'attributs.

```
Employees/
├── Engineering/
│   ├── Backend/   ← hérite des rôles de Engineering et Employees
│   └── Frontend/
└── Marketing/
```

#### 🎭 Roles (rôles = permissions)

| Type | Portée | Exemple |
|---|---|---|
| **Realm role** | Global au realm | `admin`, `user`, `staff` |
| **Client role** | Spécifique à une app | `myapp:editor`, `myapp:viewer` |
| **Composite role** | Regroupe d'autres rôles | `manager` = `staff` + `myapp:editor` |

> 💡 **Pattern recommandé** : créez des groupes (par équipe/département), assignez des rôles aux groupes, ajoutez les utilisateurs dans les groupes. Évitez d'assigner des rôles directement aux utilisateurs.

#### 🔑 Sessions et Tokens

Quand un utilisateur se connecte, Keycloak crée une **session SSO**. Tant qu'elle est active, il n'a pas besoin de se reconnecter pour accéder aux autres apps du même realm.

| Token | Durée typique | Usage |
|---|---|---|
| **Access Token** (JWT) | 5 min | Envoyé aux APIs pour prouver l'accès |
| **Refresh Token** | 30 min | Obtenir un nouveau Access Token sans reconnexion |
| **ID Token** (JWT) | 5 min | Infos sur l'utilisateur, pour le client uniquement |

### Architecture type de Keycloak

```
Internet
    ↓
[Reverse Proxy — Nginx/Traefik/Caddy]  ← TLS termination ici
    ↓  (headers X-Forwarded-* propagés)
[Keycloak — port 8080]
    ↓
[PostgreSQL — port 5432]
```

**Composants :**

| Composant | Rôle |
|---|---|
| **Keycloak** (Quarkus/Java) | Serveur IdP principal |
| **PostgreSQL** | Stockage : users, realms, sessions, clients |
| **Reverse Proxy** | TLS, headers, load balancing |
| **Infinispan** (embarqué) | Cache distribué (sessions, tokens) pour la HA |

> ⚠️ **Point critique : Hostname & Proxy**  
> Keycloak exige une configuration de hostname explicite en production. Une mauvaise configuration cause des boucles de login, des redirect_uri cassées, etc.
>
> Variables critiques :
> ```bash
> KC_HOSTNAME=auth.example.com     # URL publique
> KC_HOSTNAME_STRICT=true          # Rejeter les autres hostnames
> KC_PROXY_HEADERS=xforwarded      # Faire confiance aux headers du proxy
> ```

---

## 3. Keycloak — Installation pratique

### Option 1 : Démarrage rapide (dev/test)

```bash
docker run -p 8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:26 start-dev
```

Accédez à : `http://localhost:8080`

> ⛔ **JAMAIS en production** : `start-dev` désactive TLS et les contrôles de sécurité.

### Option 2 : Docker Compose avec PostgreSQL (recommandé)

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    container_name: keycloak-db
    environment:
      POSTGRES_DB: keycloak
      POSTGRES_USER: keycloak
      POSTGRES_PASSWORD: keycloak_secret
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U keycloak"]
      interval: 5s
      retries: 5
    networks:
      - keycloak-net

  keycloak:
    image: quay.io/keycloak/keycloak:26
    container_name: keycloak
    command: start-dev   # Remplacer par "start" en production avec TLS
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
      KC_DB_USERNAME: keycloak
      KC_DB_PASSWORD: keycloak_secret
      KC_HOSTNAME: localhost
      KC_BOOTSTRAP_ADMIN_USERNAME: admin
      KC_BOOTSTRAP_ADMIN_PASSWORD: admin
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - keycloak-net

volumes:
  postgres_data:

networks:
  keycloak-net:
    name: keycloak-network
    driver: bridge    
```

```bash
docker compose up -d
docker compose logs -f keycloak
# Attendre : "Keycloak 26.x.x started"
```

### Variables de configuration essentielles

| Variable | Description | Exemple |
|---|---|---|
| `KC_DB` | Type de BDD | `postgres` |
| `KC_DB_URL` | URL JDBC | `jdbc:postgresql://host:5432/db` |
| `KC_HOSTNAME` | URL publique | `auth.example.com` |
| `KC_PROXY_HEADERS` | Headers proxy | `xforwarded` |
| `KC_HEALTH_ENABLED` | Endpoint `/health` | `true` |
| `KC_METRICS_ENABLED` | Métriques Prometheus | `true` |
| `KC_BOOTSTRAP_ADMIN_USERNAME` | Admin initial | `admin` |

### Configuration production (avec Nginx)

```nginx
# /etc/nginx/sites-enabled/keycloak
server {
    listen 443 ssl;
    server_name auth.example.com;

    ssl_certificate /etc/ssl/certs/fullchain.pem;
    ssl_certificate_key /etc/ssl/private/privkey.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Et dans le `docker-compose.yml` pour la prod :
```yaml
command: start
environment:
  KC_HOSTNAME: auth.example.com
  KC_PROXY_HEADERS: xforwarded
  KC_HTTP_ENABLED: "true"   # HTTP entre Nginx et Keycloak (réseau interne)
```

---

## 4. Keycloak — Cas d'usage concrets

### Cas 1 : SSO pour une startup (pas d'AD existant)

**Scénario** : startup de 30 personnes, applications web React + API Node.js. Pas d'annuaire existant.

```
Stratégie : Keycloak comme IdP principal
Où sont les users : dans la BDD PostgreSQL de Keycloak

Architecture :
  Traefik → Keycloak → PostgreSQL
  
Realm : "mycompany"
Clients :
  - frontend-app (Public, OIDC) → SPA React
  - backend-api (Bearer-only) → API Node.js

Flow :
  1. L'utilisateur va sur myapp.com
  2. Redirigé vers auth.mycompany.com/realms/mycompany
  3. Se connecte → reçoit un token JWT
  4. Le token est envoyé à l'API → accès autorisé
```

### Cas 2 : Entreprise avec Active Directory

**Scénario** : 500 employés, AD existant, migration vers des apps web modernes.

```
Stratégie : Fédération LDAP/AD
Où sont les users : dans l'AD — Keycloak synchronise

Configuration dans Keycloak :
  Realm settings → User Federation → Add LDAP provider
  Connection URL : ldap://ad.company.local
  Bind DN : CN=keycloak-svc,OU=ServiceAccounts,DC=company,DC=local
  User DN : OU=Employees,DC=company,DC=local

Avantage : un seul mot de passe (celui de l'AD)
           révocation centralisée (désactiver l'AD = tout révoqué)
```

### Cas 3 : Plateforme SaaS multi-tenant

**Scénario** : vous hébergez une plateforme et chaque client a ses propres utilisateurs.

```
Stratégie : un Realm par client (tenant)

Keycloak
├── master (admin)
├── client-acme      ← Realm dédié à ACME Corp
│   ├── Users : alice@acme.com, bob@acme.com
│   └── Identity Brokering → Azure AD d'ACME
├── client-globex    ← Realm dédié à Globex
│   ├── Users : john@globex.com
│   └── Fédération LDAP Globex
└── client-initech   ← Realm avec users locaux

Chaque client a son URL : auth.example.com/realms/client-acme
```

### Cas 4 : Social Login (brokering)

**Scénario** : application grand public, les utilisateurs peuvent se connecter avec Google ou GitHub.

```
Stratégie : Identity Brokering vers IdP externe

Dans Keycloak :
  Realm → Identity Providers → Add Google
  → Client ID + Secret de Google OAuth
  
Flow :
  Utilisateur → "Se connecter avec Google"
  → Keycloak redirige vers Google
  → Google authentifie → retourne à Keycloak
  → Keycloak crée un compte local lié (account linking)
  → Token Keycloak émis pour l'application
```

---

## 5. authentik — Concepts & Architecture

### Qu'est-ce que authentik ?

authentik est un IdP open-source moderne, développé depuis 2020, distribué sous **licence MIT**. Il est écrit en **Python (Django)** côté serveur.

Sa philosophie : **tout est modulaire et personnalisable** — les parcours d'authentification, les conditions d'accès, les intégrations.

> 💡 **Différence clé avec Keycloak** : authentik intègre nativement un **proxy d'accès** (Outpost). Il peut protéger des applications qui ne supportent pas OIDC/SAML sans modifier ces applications.

### Les objets principaux d'authentik

#### 📱 Applications

Une application dans authentik = un service à protéger. C'est ce que voit l'utilisateur dans son portail (`http://authentik/if/user/`).

Chaque application est liée à un **Provider** qui définit le protocole.

#### 🔌 Providers (protocoles)

| Provider | Protocole | Cas d'usage |
|---|---|---|
| **OAuth2/OIDC** | OpenID Connect | Apps web modernes |
| **SAML** | SAML 2.0 | Apps d'entreprise, legacy |
| **Proxy** | Forward Auth | Apps sans support OIDC/SAML |
| **LDAP** | LDAP v3 | Apps qui ne parlent que LDAP |
| **SCIM** | SCIM 2.0 | Provisioning automatique |
| **RADIUS** | RADIUS | VPN, Wi-Fi, équipements réseau |

#### 🔄 Sources (fédération entrante)

Une source = authentik *consomme* des identités venant d'ailleurs.

> ⚠️ **Provider ≠ Source**  
> - **Provider** : authentik *fournit* des identités vers une app  
> - **Source** : authentik *reçoit* des identités depuis un système externe (LDAP, Google, GitHub...)

#### 🤖 Outposts (les bras armés d'authentik)

Un outpost est un composant déployé séparément qui étend authentik sur le réseau.

| Outpost | Rôle |
|---|---|
| **Proxy Outpost** | Intercepte le trafic HTTP, protège les apps non-OIDC. Fonctionne avec Nginx, Traefik, Caddy via Forward Auth |
| **LDAP Outpost** | Expose un serveur LDAP basé sur les users authentik |
| **RADIUS Outpost** | Serveur RADIUS pour VPN et équipements réseau |

### Le moteur de flows : Flows → Stages → Policies

C'est **la grande force d'authentik** : les parcours d'authentification sont entièrement personnalisables sans coder.

```
Flow "connexion"
    ↓
Stage 1 : Identification (demande username/email)
    ↓ [Policy : l'utilisateur existe ?]
Stage 2 : Password (vérification mot de passe)
    ↓ [Policy : l'utilisateur est dans le groupe "mfa-required" ?]
Stage 3 : MFA (TOTP ou WebAuthn)  ← sauté si la policy = false
    ↓
Stage 4 : User Login (crée la session)
    ↓
Accès accordé
```

**Flows disponibles par défaut :**

| Désignation | Objectif |
|---|---|
| `authentication` | Connexion utilisateur |
| `authorization` | Consentement avant accès à une app |
| `enrollment` | Inscription |
| `recovery` | Récupération de mot de passe |
| `invalidation` | Déconnexion |

**Exemple de Policy (Python) :**
```python
# Policy d'expression : MFA requis pour les admins
return ak_user.ak_groups.filter(name="admins").exists()
```

### Architecture d'authentik

```
Internet
    ↓
[Reverse Proxy — Traefik/Nginx]
    ↓
[authentik Server — port 9000]   ← Interface web + API + Flows
[authentik Worker]                ← Tâches de fond (emails, SCIM, LDAP sync)
    ↓
[PostgreSQL]
```

> ℹ️ **Depuis la version 2025.10**, Redis n'est plus nécessaire. La communication inter-processus et le cache passent par PostgreSQL directement, simplifiant le déploiement.

---

## 6. authentik — Installation pratique

### Installation avec Docker Compose

#### Étape 1 : Préparer l'environnement

```bash
mkdir -p ~/authentik-lab && cd ~/authentik-lab

# Générer les secrets
echo "AUTHENTIK_SECRET_KEY=$(openssl rand -base64 60 | tr -d '\n')" > .env
echo "PG_PASS=$(openssl rand -base64 36 | tr -d '\n')" >> .env
```

> 🔑 `AUTHENTIK_SECRET_KEY` est la clé maître. Ne la changez jamais sans invalider toutes les sessions. Ne la committez JAMAIS dans un repo git.

#### Étape 2 : Fichier docker-compose.yml

```yaml
services:
  postgresql:
    image: docker.io/library/postgres:16-alpine
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -d $${POSTGRES_DB} -U $${POSTGRES_USER}"]
      start_period: 20s
      interval: 30s
      retries: 5
    env_file:
      - .env
    environment:
      POSTGRES_DB: ${PG_DB:-authentik}
      POSTGRES_PASSWORD: ${PG_PASS:?database password required}
      POSTGRES_USER: ${PG_USER:-authentik}
    volumes:
      - database:/var/lib/postgresql/data

  server:
    image: ghcr.io/goauthentik/server:2026.2.1
    restart: unless-stopped
    command: server
    env_file:
      - .env
    environment:
      AUTHENTIK_POSTGRESQL__HOST: postgresql
      AUTHENTIK_POSTGRESQL__USER: ${PG_USER:-authentik}
      AUTHENTIK_POSTGRESQL__NAME: ${PG_DB:-authentik}
      AUTHENTIK_POSTGRESQL__PASSWORD: ${PG_PASS}
      AUTHENTIK_SECRET_KEY: ${AUTHENTIK_SECRET_KEY}
    volumes:
      - ./data:/media
      - ./custom-templates:/templates
    ports:
      - "9000:9000"
      - "9443:9443"
    depends_on:
      postgresql:
        condition: service_healthy

  worker:
    image: ghcr.io/goauthentik/server:2026.2.1
    restart: unless-stopped
    command: worker
    user: root
    env_file:
      - .env
    environment:
      AUTHENTIK_POSTGRESQL__HOST: postgresql
      AUTHENTIK_POSTGRESQL__USER: ${PG_USER:-authentik}
      AUTHENTIK_POSTGRESQL__NAME: ${PG_DB:-authentik}
      AUTHENTIK_POSTGRESQL__PASSWORD: ${PG_PASS}
      AUTHENTIK_SECRET_KEY: ${AUTHENTIK_SECRET_KEY}
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock  # Pour gérer les outposts
      - ./data:/media
      - ./certs:/certs
    depends_on:
      postgresql:
        condition: service_healthy

volumes:
  database:
```

#### Étape 3 : Démarrer et configurer

```bash
docker compose up -d
docker compose logs -f server
# Attendre : "Starting gunicorn"

# Accéder au setup initial (1 seule fois !)
open http://localhost:9000/if/flow/initial-setup/
```

**URLs importantes :**

| Interface | URL |
|---|---|
| Setup initial (1 seule fois) | `http://localhost:9000/if/flow/initial-setup/` |
| Administration | `http://localhost:9000/if/admin/` |
| Portail utilisateurs | `http://localhost:9000/if/user/` |
| API | `http://localhost:9000/api/v3/` |

---

## 7. Keycloak vs authentik — Comparaison complète

### Vue d'ensemble

| Critère | **Keycloak** | **authentik** |
|---|---|---|
| Langage | Java (Quarkus) | Python (Django) |
| Licence | Apache 2.0 | MIT |
| Depuis | 2014 | 2020 |
| Maintenu par | Red Hat / CNCF | goauthentik.io |
| Mémoire RAM (min prod) | ~700 Mo — 1 Go | ~500 Mo |
| Support commercial | ✅ Red Hat SSO | ✅ Enterprise edition |

### Fonctionnalités

| Fonctionnalité | Keycloak | authentik |
|---|---|---|
| SSO (OIDC) | ✅ | ✅ |
| SSO (SAML) | ✅ | ✅ |
| MFA (TOTP, WebAuthn) | ✅ | ✅ |
| Fédération LDAP/AD | ✅ | ✅ |
| Identity Brokering (Google, GitHub...) | ✅ | ✅ |
| **Proxy d'accès intégré** | ❌ (externe requis) | ✅ Outpost natif |
| **Serveur LDAP intégré** | ❌ (consomme, n'expose pas) | ✅ LDAP Outpost |
| **Provisioning SCIM** | ❌ (extensions tierces) | ✅ natif |
| Flows d'auth personnalisables | ✅ (Authentication Flows) | ✅ (Flows/Stages/Policies) |
| Multi-tenant (Realms) | ✅ (Realms) | ✅ (Tenants/Brands) |
| Authorization Services (RBAC fin) | ✅ (UMA, policies) | ⚠️ Basique |
| Interface admin | Moderne (React) | Moderne (lit-html) |
| RADIUS | ❌ | ✅ Outpost |

### Avantages et inconvénients détaillés

#### ✅ Keycloak — Avantages

- **Maturité et stabilité** : 10+ ans d'existence, utilisé par des milliers d'entreprises.
- **Écosystème énorme** : documentation abondante, nombreux adapters (Java, Node.js, etc.), large communauté.
- **Authorization Services** : gestion fine des permissions (RBAC, ABAC, UMA) pour des cas complexes.
- **Support Red Hat** : option enterprise avec SLA, certifications FIPS, support officiel.
- **Multi-realm avancé** : isolation parfaite entre tenants, gestion fine par realm.
- **Standard de facto en entreprise** : vos équipes ont probablement déjà de l'expérience avec.

#### ❌ Keycloak — Inconvénients

- **Lourd en ressources** : Java/JVM = démarrage lent (30-60s), RAM élevée (~1 Go min prod).
- **Configuration complexe** : la courbe d'apprentissage est raide. Le hostname/proxy mal configuré = bugs subtils.
- **Pas de proxy intégré** : pour protéger des apps non-OIDC, il faut un composant externe.
- **Pas de SCIM natif** : le provisioning automatique vers les apps nécessite des extensions.
- **Pas de RADIUS** : aucun support natif pour VPN/Wi-Fi.
- **Personnalisation des flows laborieuse** : les "Authentication Flows" de Keycloak sont moins flexibles qu'authentik.

#### ✅ authentik — Avantages

- **Proxy d'accès intégré** : protège n'importe quelle app (même sans support OIDC) via Forward Auth avec Traefik/Nginx.
- **Flows ultra-flexibles** : flows/stages/policies permettent des parcours d'auth conditionnels sans code.
- **SCIM natif** : provisioning automatique des comptes dans les applications.
- **LDAP + RADIUS intégrés** : expose un serveur LDAP et RADIUS pour les apps legacy et équipements réseau.
- **Léger** : Python/Django, ~500 Mo, démarrage rapide.
- **Idéal homelab/infrastructure de taille moyenne** : simplicité de déploiement, interface intuitive.
- **Portail utilisateurs intégré** : les utilisateurs voient toutes leurs apps dans une seule interface.

#### ❌ authentik — Inconvénients

- **Moins mature** : 4 ans d'existence, l'API change plus souvent, certains comportements peuvent surprendre.
- **Authorization fine-grained limitée** : pas d'équivalent aux Authorization Services de Keycloak pour les permissions complexes.
- **Communauté plus petite** : moins de ressources/tutoriels qu'avec Keycloak.
- **Pas de support Kerberos** : ne peut pas s'intégrer nativement avec des flux Kerberos.
- **Exclusivement conteneurisé** : pas d'installation bare metal officielle (Docker obligatoire).
- **Moins de certifications** : Keycloak est plus avancé sur FIPS 140-2 et les certifications de sécurité.

### Tableau de décision rapide

| Situation | Recommandation |
|---|---|
| Grande entreprise, besoin de support commercial | **Keycloak** (Red Hat SSO) |
| Homelab, infrastructure de taille moyenne | **authentik** |
| Besoin de protéger des apps sans OIDC/SAML | **authentik** (Proxy Outpost) |
| RBAC/ABAC très fin (permissions complexes) | **Keycloak** (Authorization Services) |
| Multi-tenant avec isolation stricte | **Keycloak** (Realms) |
| Provisioning SCIM vers les apps | **authentik** |
| Conformité FIPS, certifications | **Keycloak** |
| VPN/Wi-Fi avec RADIUS | **authentik** |
| Équipe familière avec Java/Red Hat | **Keycloak** |
| Équipe DevOps Python-friendly | **authentik** |

---

## 8. Déploiement On-Premise : Proxmox

Proxmox est un hyperviseur open-source populaire pour les homelabs et les petites entreprises. Voici comment déployer Keycloak ou authentik sur Proxmox.

### Architecture recommandée sur Proxmox

```
Proxmox Host (ex: 192.168.1.10)
├── VM ou CT : Reverse Proxy (Nginx/Traefik/Caddy) — IP: 192.168.1.20
│   └── Gère le TLS (Let's Encrypt ou cert interne)
├── VM ou CT : Keycloak ou authentik — IP: 192.168.1.30
│   └── Docker Compose : IdP + PostgreSQL
└── VM ou CT : Applications protégées — IP: 192.168.1.40+
```

### Option A : LXC Container (Proxmox CT)

Les LXC sont plus légers que les VMs. Idéal pour authentik (Python) ; acceptable pour Keycloak (Java nécessite un peu plus de ressources).

**Création d'un container Proxmox pour authentik :**

```bash
# Dans l'interface Proxmox, ou via CLI :
pct create 200 local:vztmpl/ubuntu-24.04-standard_24.04-2_amd64.tar.zst \
  --hostname authentik \
  --memory 2048 \
  --cores 2 \
  --rootfs local-lvm:20 \
  --net0 name=eth0,bridge=vmbr0,ip=192.168.1.30/24,gw=192.168.1.1 \
  --unprivileged 1 \
  --features nesting=1   # Requis pour Docker dans LXC

pct start 200
pct exec 200 -- bash -c "apt update && apt install -y docker.io docker-compose-plugin"
```

> ⚠️ **Docker dans LXC** : activez `nesting=1` et `keyctl=1` dans les features du container. Sans ça, Docker ne fonctionnera pas correctement.

**Ressources recommandées :**

| Outil | CPU (cœurs) | RAM | Disque |
|---|---|---|---|
| authentik | 2 | 2 Go | 20 Go |
| Keycloak | 2 | 2 Go | 20 Go |
| Keycloak (prod) | 4 | 4 Go | 50 Go |

### Option B : VM Proxmox (plus robuste)

Pour la production, une VM est préférable (meilleure isolation, snapshot, live migration).

```bash
# Créer une VM Ubuntu 24.04
qm create 300 \
  --name keycloak-prod \
  --memory 4096 \
  --cores 4 \
  --scsi0 local-lvm:50 \
  --cdrom local:iso/ubuntu-24.04-server.iso \
  --net0 virtio,bridge=vmbr0
```

Ensuite, installer Docker dans la VM Ubuntu :

```bash
# Dans la VM Ubuntu
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### Déploiement Keycloak sur Proxmox avec Caddy (TLS auto)

**Structure de fichiers :**
```
/opt/keycloak/
├── docker-compose.yml
├── Caddyfile
└── .env
```

**Caddyfile (TLS automatique via Let's Encrypt) :**
```
auth.votredomaine.com {
    reverse_proxy keycloak:8080
}
```

**docker-compose.yml (avec Caddy) :**
```yaml
services:
  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - keycloak-net

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: keycloak
      POSTGRES_USER: keycloak
      POSTGRES_PASSWORD: ${KC_DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - keycloak-net

  keycloak:
    image: quay.io/keycloak/keycloak:26
    command: start
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
      KC_DB_USERNAME: keycloak
      KC_DB_PASSWORD: ${KC_DB_PASSWORD}
      KC_HOSTNAME: auth.votredomaine.com
      KC_PROXY_HEADERS: xforwarded
      KC_HTTP_ENABLED: "true"
      KC_BOOTSTRAP_ADMIN_USERNAME: ${KC_ADMIN_USER}
      KC_BOOTSTRAP_ADMIN_PASSWORD: ${KC_ADMIN_PASSWORD}
    networks:
      - keycloak-net
    depends_on:
      - postgres

volumes:
  postgres_data:
  caddy_data:
  caddy_config:

networks:
  keycloak-net:
```

**Fichier .env :**
```bash
KC_DB_PASSWORD=un_mot_de_passe_fort_ici
KC_ADMIN_USER=admin
KC_ADMIN_PASSWORD=un_autre_mot_de_passe_fort
```

### Déploiement authentik sur Proxmox avec Traefik

**Structure :**
```
/opt/authentik/
├── docker-compose.yml
├── traefik/
│   ├── traefik.yml
│   └── dynamic/
└── .env
```

**traefik.yml :**
```yaml
entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
  websecure:
    address: ":443"

certificatesResolvers:
  letsencrypt:
    acme:
      email: votre@email.com
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web

providers:
  docker:
    exposedByDefault: false
```

**docker-compose.yml (authentik + Traefik) :**
```yaml
services:
  traefik:
    image: traefik:v3
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./traefik/traefik.yml:/etc/traefik/traefik.yml
      - /var/run/docker.sock:/var/run/docker.sock
      - traefik_letsencrypt:/letsencrypt
    networks:
      - proxy

  postgresql:
    image: postgres:16-alpine
    restart: unless-stopped
    env_file: .env
    environment:
      POSTGRES_DB: authentik
      POSTGRES_USER: authentik
      POSTGRES_PASSWORD: ${PG_PASS}
    volumes:
      - database:/var/lib/postgresql/data
    networks:
      - authentik-net

  server:
    image: ghcr.io/goauthentik/server:2026.2.1
    restart: unless-stopped
    command: server
    env_file: .env
    environment:
      AUTHENTIK_POSTGRESQL__HOST: postgresql
      AUTHENTIK_POSTGRESQL__PASSWORD: ${PG_PASS}
      AUTHENTIK_SECRET_KEY: ${AUTHENTIK_SECRET_KEY}
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.authentik.rule=Host(`auth.votredomaine.com`)"
      - "traefik.http.routers.authentik.tls.certresolver=letsencrypt"
      - "traefik.http.services.authentik.loadbalancer.server.port=9000"
    networks:
      - proxy
      - authentik-net
    depends_on:
      postgresql:
        condition: service_healthy

  worker:
    image: ghcr.io/goauthentik/server:2026.2.1
    restart: unless-stopped
    command: worker
    user: root
    env_file: .env
    environment:
      AUTHENTIK_POSTGRESQL__HOST: postgresql
      AUTHENTIK_POSTGRESQL__PASSWORD: ${PG_PASS}
      AUTHENTIK_SECRET_KEY: ${AUTHENTIK_SECRET_KEY}
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - authentik-net
    depends_on:
      postgresql:
        condition: service_healthy

volumes:
  database:
  traefik_letsencrypt:

networks:
  proxy:
  authentik-net:
```

### Exemple concret : Protéger Portainer avec authentik sur Proxmox

**Contexte** : vous avez Portainer sur Proxmox et voulez que l'accès passe par authentik (Forward Auth).

```
Requête vers portainer.votredomaine.com
    ↓
Traefik : "authentification requise"
    ↓ (Forward Auth)
authentik : "l'utilisateur est-il connecté ?"
    → Non → Redirige vers la page de login authentik
    → Oui → Laisse passer la requête vers Portainer
```

**Labels Traefik pour Portainer :**
```yaml
# Dans le docker-compose.yml de Portainer :
portainer:
  image: portainer/portainer-ce
  labels:
    - "traefik.enable=true"
    - "traefik.http.routers.portainer.rule=Host(`portainer.votredomaine.com`)"
    - "traefik.http.routers.portainer.middlewares=authentik@docker"
    - "traefik.http.services.portainer.loadbalancer.server.port=9000"
```

**Middleware authentik (dans Traefik dynamic config) :**
```yaml
http:
  middlewares:
    authentik:
      forwardAuth:
        address: http://authentik-server:9000/outpost.goauthentik.io/auth/traefik
        trustForwardHeader: true
        authResponseHeaders:
          - X-authentik-username
          - X-authentik-groups
          - X-authentik-email
```

---

## 9. Déploiement Cloud

### Sur Kubernetes (K8s) — Keycloak avec l'Operator

Keycloak fournit un **Operator Kubernetes officiel** qui gère le cycle de vie de Keycloak via des CRDs (Custom Resource Definitions).

```bash
# Installer l'Operator Keycloak
kubectl apply -f https://raw.githubusercontent.com/keycloak/keycloak-k8s-resources/26.0.0/kubernetes/keycloaks.k8s.keycloak.org-v1.yml
kubectl apply -f https://raw.githubusercontent.com/keycloak/keycloak-k8s-resources/26.0.0/kubernetes/keycloakrealmimports.k8s.keycloak.org-v1.yml
kubectl apply -f https://raw.githubusercontent.com/keycloak/keycloak-operator/26.0.0/target/kubernetes/kubernetes.yml
```

**Manifest Keycloak (CRD) :**
```yaml
apiVersion: k8s.keycloak.org/v2alpha1
kind: Keycloak
metadata:
  name: keycloak
  namespace: keycloak
spec:
  instances: 2          # Haute disponibilité
  db:
    vendor: postgres
    host: postgres-svc
    usernameSecret:
      name: keycloak-db-secret
      key: username
    passwordSecret:
      name: keycloak-db-secret
      key: password
  http:
    tlsSecret: keycloak-tls-secret
  hostname:
    hostname: auth.example.com
  proxy:
    headers: xforwarded
```

**Import de Realm en tant que code (GitOps) :**
```yaml
apiVersion: k8s.keycloak.org/v2alpha1
kind: KeycloakRealmImport
metadata:
  name: my-realm-import
spec:
  keycloakCRName: keycloak
  realm:
    realm: production
    displayName: "Production"
    enabled: true
    clients:
      - clientId: frontend-app
        protocol: openid-connect
        publicClient: true
        redirectUris:
          - "https://app.example.com/*"
```

### Sur Kubernetes — authentik avec Helm

```bash
# Ajouter le repo Helm
helm repo add authentik https://charts.goauthentik.io
helm repo update

# Installer
helm upgrade --install authentik authentik/authentik \
  --namespace authentik \
  --create-namespace \
  -f values.yaml
```

**values.yaml minimal :**
```yaml
authentik:
  secret_key: "votre-secret-key-ici"
  postgresql:
    password: "votre-pg-password"

postgresql:
  enabled: true
  auth:
    password: "votre-pg-password"

ingress:
  enabled: true
  ingressClassName: nginx
  hosts:
    - host: auth.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: authentik-tls
      hosts:
        - auth.example.com
```

### Sur AWS / GCP / Azure

**Option 1 : VM (EC2/Compute Engine/Azure VM)**

Identique à l'installation on-premise. Utilisez un domaine avec Let's Encrypt.

```bash
# EC2 Ubuntu 24.04
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
mkdir /opt/keycloak && cd /opt/keycloak
# Copier votre docker-compose.yml
docker compose up -d
```

**Option 2 : Managed Kubernetes (EKS/GKE/AKS)**

Utilisez les approches Helm/Operator décrites ci-dessus avec un Ingress Controller (Nginx ou ALB).

**Option 3 : Services managés complémentaires**

| Composant | AWS | GCP | Azure |
|---|---|---|---|
| PostgreSQL | RDS | Cloud SQL | Azure Database |
| TLS | ACM | Managed Certs | Azure Key Vault |
| DNS | Route 53 | Cloud DNS | Azure DNS |
| Secrets | Secrets Manager | Secret Manager | Key Vault |

**Exemple avec RDS (AWS) pour Keycloak :**
```yaml
# Dans docker-compose ou variables K8s :
KC_DB: postgres
KC_DB_URL: jdbc:postgresql://mydb.xxxx.eu-west-1.rds.amazonaws.com:5432/keycloak
KC_DB_USERNAME: keycloak
KC_DB_PASSWORD: ${DB_PASSWORD}  # Depuis AWS Secrets Manager via External Secrets
```

### Haute Disponibilité (HA)

**Keycloak HA sur K8s :**
```
Ingress (sticky sessions) 
    ↓
Keycloak Replica 1 ←→ Infinispan (cache distribué) ←→ Keycloak Replica 2
    ↓                                                          ↓
                    PostgreSQL HA (Patroni / CloudNativePG)
```

**authentik HA sur K8s :**
```
Ingress
    ↓              ↓
Server Pod 1   Server Pod 2   ← Horizontal Scaling
    ↓              ↓
Worker Pod 1   Worker Pod 2
    ↓              ↓
        PostgreSQL HA
```

---

## 10. Choisir entre Keycloak et authentik

### Arbre de décision

```
Avez-vous besoin de protéger des apps sans OIDC/SAML ?
    → OUI : authentik (Proxy Outpost)
    → NON : continuer

Avez-vous un besoin de conformité FIPS ou de support Red Hat ?
    → OUI : Keycloak
    → NON : continuer

Avez-vous besoin de SCIM ou RADIUS ?
    → OUI : authentik
    → NON : continuer

Avez-vous besoin d'Authorization Services avancés (UMA/ABAC) ?
    → OUI : Keycloak
    → NON : continuer

Contexte homelab / infrastructure de taille moyenne ?
    → OUI : authentik (plus simple)
    → NON (grande entreprise) : Keycloak
```

### Combinaison possible

Les deux outils ne sont pas exclusifs :

```
Keycloak (IdP principal, OIDC/SAML pour les apps modernes)
    ↕ Identity Brokering
authentik (Proxy Outpost pour les apps legacy non-OIDC)
```

authentik peut utiliser Keycloak comme source externe et inversement. Dans un SI existant avec Keycloak, authentik peut servir de proxy pour les applications non compatibles.

### Check-list avant de déployer

Avant de lancer quoi que ce soit, répondez à ces questions :

- [ ] **Nombre d'utilisateurs** : <100 (authentik suffit), >1000 (Keycloak recommandé)
- [ ] **Applications à protéger** : supportent-elles OIDC/SAML ?
- [ ] **Annuaire existant** : LDAP/AD à connecter ?
- [ ] **Besoin de MFA** : TOTP, WebAuthn ?
- [ ] **Environnements** : prod + staging + dev isolés ?
- [ ] **HA requis** : tolérance de panne ?
- [ ] **Backup** : stratégie pour PostgreSQL ?
- [ ] **TLS** : où terminer le TLS (reverse proxy recommandé) ?
- [ ] **Monitoring** : Prometheus/Grafana requis ?

---

## 11. Ressources officielles

### Keycloak

| Ressource | URL |
|---|---|
| Documentation officielle | https://www.keycloak.org/documentation |
| Guides pratiques | https://www.keycloak.org/guides |
| Getting started Docker | https://www.keycloak.org/getting-started/getting-started-docker |
| Configuring production | https://www.keycloak.org/server/configuration-production |
| Keycloak Operator (K8s) | https://www.keycloak.org/operator/installation |
| GitHub | https://github.com/keycloak/keycloak |
| Forum communauté | https://keycloak.discourse.group |

### authentik

| Ressource | URL |
|---|---|
| Documentation officielle | https://docs.goauthentik.io |
| Installation Docker Compose | https://docs.goauthentik.io/install-config/install/docker-compose/ |
| Configuration (variables) | https://docs.goauthentik.io/install-config/configuration/ |
| Helm Chart (K8s) | https://docs.goauthentik.io/install-config/install/kubernetes/ |
| GitHub | https://github.com/goauthentik/authentik |
| Discord communauté | https://discord.gg/jg33eMhnj6 |

### Standards IAM

| Standard | Description |
|---|---|
| [RFC 6749](https://www.rfc-editor.org/rfc/rfc6749) | OAuth 2.0 |
| [RFC 7636](https://www.rfc-editor.org/rfc/rfc7636) | PKCE |
| [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html) | OIDC |
| [NIST SP 800-63](https://pages.nist.gov/800-63-4/) | Niveaux d'assurance |

---

*Document généré le 05/04/2026 — Versions de référence : Keycloak 26.x, authentik 2026.2.x*


---

## 12. Exemples pratiques complets — Keycloak

> Ces exemples suivent une progression logique : installation → configuration → intégration → test. Chaque exemple est autonome et directement applicable.

---

### 🧪 Exemple 1 — Keycloak On-Premise (Proxmox/VM) : SSO pour une app React + API Node.js

**Contexte** : vous avez une startup. Une SPA React (`https://app.example.com`) parle à une API Node.js (`https://api.example.com`). Vous voulez que les utilisateurs se connectent une seule fois via Keycloak.

#### Étape 1 : Démarrer Keycloak avec Docker Compose

```bash
mkdir /opt/keycloak && cd /opt/keycloak

cat > .env << 'EOF'
KC_DB_PASSWORD=monMotDePassePostgres
KC_ADMIN_USER=admin
KC_ADMIN_PASSWORD=monMotDePasseAdmin
EOF

cat > docker-compose.yml << 'EOF'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: keycloak
      POSTGRES_USER: keycloak
      POSTGRES_PASSWORD: ${KC_DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U keycloak"]
      interval: 5s
      retries: 5
    networks: [kc-net]

  keycloak:
    image: quay.io/keycloak/keycloak:26
    command: start-dev   # start en prod avec TLS
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
      KC_DB_USERNAME: keycloak
      KC_DB_PASSWORD: ${KC_DB_PASSWORD}
      KC_HOSTNAME: localhost
      KC_BOOTSTRAP_ADMIN_USERNAME: ${KC_ADMIN_USER}
      KC_BOOTSTRAP_ADMIN_PASSWORD: ${KC_ADMIN_PASSWORD}
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
    networks: [kc-net]

volumes:
  postgres_data:
networks:
  kc-net:
EOF

docker compose up -d
docker compose logs -f keycloak
# ✅ Attendre : "Keycloak 26.x.x started"
```

#### Étape 2 : Créer le Realm "myapp"

Via l'interface web `http://localhost:8080` → Administration Console → admin/monMotDePasseAdmin

1. Cliquer sur le menu realm en haut à gauche → **Create realm**
2. **Realm name** : `myapp`
3. **Enabled** : On → **Create**

Ou via l'API (automatisable en CI/CD) :

```bash
# Obtenir un token admin
TOKEN=$(curl -s -X POST http://localhost:8080/realms/master/protocol/openid-connect/token \
  -d "client_id=admin-cli&grant_type=password&username=admin&password=monMotDePasseAdmin" \
  | jq -r '.access_token')

# Créer le realm
curl -s -X POST http://localhost:8080/admin/realms \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"realm":"myapp","enabled":true,"displayName":"Mon Application"}'

echo "✅ Realm myapp créé"
```

#### Étape 3 : Créer les utilisateurs

```bash
# Créer l'utilisateur alice
curl -s -X POST http://localhost:8080/admin/realms/myapp/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@example.com",
    "firstName": "Alice",
    "lastName": "Martin",
    "enabled": true,
    "credentials": [{
      "type": "password",
      "value": "alice123",
      "temporary": false
    }]
  }'

echo "✅ Utilisateur alice créé"
```

#### Étape 4 : Créer le client pour la SPA React (Public)

```bash
curl -s -X POST http://localhost:8080/admin/realms/myapp/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "react-frontend",
    "name": "Application React",
    "protocol": "openid-connect",
    "publicClient": true,
    "standardFlowEnabled": true,
    "directAccessGrantsEnabled": false,
    "redirectUris": ["http://localhost:3000/*", "https://app.example.com/*"],
    "webOrigins": ["http://localhost:3000", "https://app.example.com"]
  }'

echo "✅ Client react-frontend créé"
```

#### Étape 5 : Créer le client pour l'API Node.js (Bearer-only)

```bash
curl -s -X POST http://localhost:8080/admin/realms/myapp/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "node-api",
    "name": "API Node.js",
    "protocol": "openid-connect",
    "bearerOnly": true
  }'

echo "✅ Client node-api créé"
```

#### Étape 6 : Créer des rôles et les assigner

```bash
# Créer le rôle "user"
curl -s -X POST http://localhost:8080/admin/realms/myapp/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"user","description":"Utilisateur standard"}'

# Créer le rôle "admin"
curl -s -X POST http://localhost:8080/admin/realms/myapp/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"admin","description":"Administrateur"}'

# Récupérer l'ID du rôle "user"
ROLE_ID=$(curl -s http://localhost:8080/admin/realms/myapp/roles/user \
  -H "Authorization: Bearer $TOKEN" | jq -r '.id')

# Récupérer l'ID d'alice
ALICE_ID=$(curl -s "http://localhost:8080/admin/realms/myapp/users?username=alice" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[0].id')

# Assigner le rôle "user" à alice
curl -s -X POST "http://localhost:8080/admin/realms/myapp/users/$ALICE_ID/role-mappings/realm" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "[{\"id\":\"$ROLE_ID\",\"name\":\"user\"}]"

echo "✅ Rôle user assigné à alice"
```

#### Étape 7 : Intégration côté React (frontend)

```bash
# Dans votre projet React
npm install keycloak-js
```

```javascript
// src/keycloak.js
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080',           // URL de Keycloak
  realm: 'myapp',                          // Votre realm
  clientId: 'react-frontend',             // Votre client public
});

export default keycloak;
```

```javascript
// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './keycloak';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ReactKeycloakProvider
    authClient={keycloak}
    initOptions={{ onLoad: 'login-required' }}  // Redirige vers KC si non connecté
  >
    <App />
  </ReactKeycloakProvider>
);
```

```javascript
// src/App.jsx
import { useKeycloak } from '@react-keycloak/web';

function App() {
  const { keycloak } = useKeycloak();

  // Appel API avec le token JWT
  const fetchData = async () => {
    const response = await fetch('http://localhost:4000/api/data', {
      headers: {
        // Le token est automatiquement inclus par Keycloak
        'Authorization': `Bearer ${keycloak.token}`
      }
    });
    return response.json();
  };

  return (
    <div>
      <p>Connecté en tant que : <strong>{keycloak.tokenParsed?.preferred_username}</strong></p>
      <p>Rôles : {keycloak.tokenParsed?.realm_access?.roles?.join(', ')}</p>
      <button onClick={() => keycloak.logout()}>Déconnexion</button>
    </div>
  );
}

export default App;
```

#### Étape 8 : Intégration côté API Node.js (backend)

```bash
npm install keycloak-connect express express-session
```

```javascript
// server.js
const express = require('express');
const session = require('express-session');
const Keycloak = require('keycloak-connect');

const app = express();

// Configuration de la session (requise par keycloak-connect)
const memoryStore = new session.MemoryStore();
app.use(session({
  secret: 'mon-secret-session',
  resave: false,
  saveUninitialized: true,
  store: memoryStore,
}));

// Configuration Keycloak
const keycloak = new Keycloak({ store: memoryStore }, {
  realm: 'myapp',
  'auth-server-url': 'http://localhost:8080',
  'ssl-required': 'external',
  resource: 'node-api',
  'bearer-only': true,  // L'API valide les tokens, ne redirige pas
});

app.use(keycloak.middleware());

// Route publique — accessible sans token
app.get('/api/public', (req, res) => {
  res.json({ message: 'Accessible à tous' });
});

// Route protégée — token requis
app.get('/api/data', keycloak.protect(), (req, res) => {
  const user = req.kauth.grant.access_token.content;
  res.json({
    message: 'Données protégées',
    user: user.preferred_username,
    roles: user.realm_access?.roles || [],
  });
});

// Route réservée aux admins
app.get('/api/admin', keycloak.protect('realm:admin'), (req, res) => {
  res.json({ message: 'Zone admin uniquement' });
});

app.listen(4000, () => console.log('API démarrée sur http://localhost:4000'));
```

#### ✅ Test complet du flux

```bash
# 1. Obtenir un token pour alice (simule le login depuis React)
TOKEN=$(curl -s -X POST \
  http://localhost:8080/realms/myapp/protocol/openid-connect/token \
  -d "grant_type=password&client_id=react-frontend&username=alice&password=alice123" \
  | jq -r '.access_token')

# 2. Appeler l'API avec ce token
curl -s http://localhost:4000/api/data \
  -H "Authorization: Bearer $TOKEN" | jq

# Résultat attendu :
# {
#   "message": "Données protégées",
#   "user": "alice",
#   "roles": ["offline_access", "uma_authorization", "user"]
# }

# 3. Tenter d'accéder à la zone admin (doit échouer pour alice)
curl -s http://localhost:4000/api/admin \
  -H "Authorization: Bearer $TOKEN"

# Résultat attendu : 403 Forbidden
```

---

### 🏢 Exemple 2 — Keycloak On-Premise : Fédération Active Directory (LDAP)

**Contexte** : votre entreprise a un Active Directory. 300 employés. Vous voulez qu'ils se connectent aux nouvelles apps web avec leurs identifiants Windows.

```
AD (ldap://ad.company.local)
        ↓  synchronisation
    Keycloak
        ↓  SSO
   Applications web
```

#### Configuration de la fédération LDAP dans Keycloak

Via l'interface : **Realm myapp** → **User Federation** → **Add LDAP provider**

Ou via API :

```bash
curl -s -X POST http://localhost:8080/admin/realms/myapp/components \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "active-directory",
    "providerId": "ldap",
    "providerType": "org.keycloak.storage.UserStorageProvider",
    "config": {
      "vendor": ["ad"],
      "connectionUrl": ["ldap://ad.company.local:389"],
      "bindDn": ["CN=keycloak-svc,OU=ServiceAccounts,DC=company,DC=local"],
      "bindCredential": ["motDePasseServiceAccount"],
      "usersDn": ["OU=Employees,DC=company,DC=local"],
      "usernameLDAPAttribute": ["sAMAccountName"],
      "rdnLDAPAttribute": ["cn"],
      "uuidLDAPAttribute": ["objectGUID"],
      "userObjectClasses": ["person,organizationalPerson,user"],
      "searchScope": ["2"],
      "syncRegistrations": ["false"],
      "editMode": ["READ_ONLY"],
      "importEnabled": ["true"],
      "batchSizeForSync": ["1000"],
      "fullSyncPeriod": ["604800"],
      "changedSyncPeriod": ["86400"]
    }
  }'
```

#### Mapper les attributs AD vers les tokens

```bash
# Récupérer l'ID du composant LDAP
LDAP_ID=$(curl -s "http://localhost:8080/admin/realms/myapp/components?type=org.keycloak.storage.UserStorageProvider" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[0].id')

# Mapper l'attribut "department" de l'AD
curl -s -X POST "http://localhost:8080/admin/realms/myapp/components" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"department\",
    \"providerId\": \"user-attribute-ldap-mapper\",
    \"providerType\": \"org.keycloak.storage.ldap.mappers.LDAPStorageMapper\",
    \"parentId\": \"$LDAP_ID\",
    \"config\": {
      \"ldap.attribute\": [\"department\"],
      \"user.model.attribute\": [\"department\"],
      \"always.read.value.from.ldap\": [\"true\"],
      \"is.mandatory.in.ldap\": [\"false\"]
    }
  }"
```

#### Test de synchronisation

```bash
# Déclencher une synchronisation manuelle
curl -s -X POST "http://localhost:8080/admin/realms/myapp/user-storage/$LDAP_ID/sync?action=triggerFullSync" \
  -H "Authorization: Bearer $TOKEN" | jq

# Résultat attendu :
# { "added": 287, "updated": 0, "removed": 0, "failed": 0 }
```

---

### ☁️ Exemple 3 — Keycloak Cloud (Kubernetes + GitOps) : Realm as Code

**Contexte** : équipe DevOps, déploiement sur GKE/EKS. Vous voulez gérer la configuration Keycloak comme du code (GitOps).

#### Structure du repo Git

```
keycloak-config/
├── keycloak/
│   ├── kustomization.yaml
│   ├── keycloak-cr.yaml          # Déploiement Keycloak
│   └── realm-production.yaml     # Realm en tant que code
└── apps/
    ├── gitlab-client.yaml
    └── grafana-client.yaml
```

#### keycloak-cr.yaml — Déploiement Keycloak

```yaml
apiVersion: k8s.keycloak.org/v2alpha1
kind: Keycloak
metadata:
  name: keycloak
  namespace: keycloak
spec:
  instances: 2
  image: quay.io/keycloak/keycloak:26
  db:
    vendor: postgres
    host: postgres-svc.keycloak.svc.cluster.local
    database: keycloak
    port: 5432
    usernameSecret:
      name: keycloak-db-creds
      key: username
    passwordSecret:
      name: keycloak-db-creds
      key: password
  http:
    httpEnabled: true
  hostname:
    hostname: auth.example.com
    strict: true
  proxy:
    headers: xforwarded
  resources:
    requests:
      memory: "512Mi"
      cpu: "500m"
    limits:
      memory: "1Gi"
      cpu: "1000m"
```

#### realm-production.yaml — Le realm complet en YAML

```yaml
apiVersion: k8s.keycloak.org/v2alpha1
kind: KeycloakRealmImport
metadata:
  name: production-realm
  namespace: keycloak
spec:
  keycloakCRName: keycloak
  realm:
    realm: production
    displayName: "Production"
    enabled: true
    sslRequired: "external"
    loginTheme: "keycloak"
    
    # Politique de mots de passe
    passwordPolicy: "length(12) and upperCase(1) and digits(1) and specialChars(1)"
    
    # Durées de vie des tokens
    accessTokenLifespan: 300          # 5 minutes
    ssoSessionMaxLifespan: 36000      # 10 heures
    refreshTokenMaxReuse: 0           # Rotation obligatoire
    
    # Rôles
    roles:
      realm:
        - name: user
          description: Utilisateur standard
        - name: admin
          description: Administrateur
        - name: devops
          description: Équipe DevOps
    
    # Groupes
    groups:
      - name: Engineering
        realmRoles: [user, devops]
        subGroups:
          - name: Backend
          - name: Frontend
      - name: Management
        realmRoles: [user, admin]
    
    # Clients
    clients:
      - clientId: gitlab
        name: "GitLab"
        protocol: openid-connect
        publicClient: false              # Confidential
        standardFlowEnabled: true
        redirectUris:
          - "https://gitlab.example.com/users/auth/openid_connect/callback"
        webOrigins:
          - "https://gitlab.example.com"
        defaultClientScopes:
          - openid
          - profile
          - email
          - roles
      
      - clientId: grafana
        name: "Grafana"
        protocol: openid-connect
        publicClient: false
        standardFlowEnabled: true
        redirectUris:
          - "https://grafana.example.com/login/generic_oauth"
        
    # Identity Provider (Google)
    identityProviders:
      - alias: google
        displayName: "Google"
        providerId: google
        enabled: true
        config:
          clientId: "VOTRE_GOOGLE_CLIENT_ID"
          clientSecret: "VOTRE_GOOGLE_CLIENT_SECRET"
          syncMode: IMPORT
```

```bash
# Déployer via kubectl
kubectl apply -f keycloak/
kubectl get keycloak -n keycloak
kubectl get keycloakrealmimport -n keycloak

# Voir l'état
kubectl describe keycloak keycloak -n keycloak
```

#### Intégration GitLab avec Keycloak (exemple concret)

Dans la configuration GitLab (`/etc/gitlab/gitlab.rb`) :

```ruby
gitlab_rails['omniauth_providers'] = [
  {
    name: "openid_connect",
    label: "Keycloak SSO",
    icon: "https://auth.example.com/resources/img/keycloak-logo.png",
    args: {
      name: "openid_connect",
      scope: ["openid", "profile", "email"],
      response_type: "code",
      issuer: "https://auth.example.com/realms/production",
      discovery: true,
      client_auth_method: "query",
      uid_field: "preferred_username",
      client_options: {
        identifier: "gitlab",
        secret: "LE_CLIENT_SECRET_DEPUIS_KEYCLOAK",
        redirect_uri: "https://gitlab.example.com/users/auth/openid_connect/callback"
      }
    }
  }
]
```

#### Intégration Grafana avec Keycloak

Dans `grafana.ini` ou variables d'environnement Docker :

```ini
[auth.generic_oauth]
enabled = true
name = Keycloak SSO
allow_sign_up = true
client_id = grafana
client_secret = LE_CLIENT_SECRET_DEPUIS_KEYCLOAK
scopes = openid profile email roles
auth_url = https://auth.example.com/realms/production/protocol/openid-connect/auth
token_url = https://auth.example.com/realms/production/protocol/openid-connect/token
api_url = https://auth.example.com/realms/production/protocol/openid-connect/userinfo

# Mapper les rôles Keycloak → rôles Grafana
role_attribute_path = contains(realm_access.roles[*], 'admin') && 'GrafanaAdmin' || contains(realm_access.roles[*], 'devops') && 'Editor' || 'Viewer'
```

```bash
# En Docker Compose
environment:
  GF_AUTH_GENERIC_OAUTH_ENABLED: "true"
  GF_AUTH_GENERIC_OAUTH_NAME: "Keycloak SSO"
  GF_AUTH_GENERIC_OAUTH_CLIENT_ID: "grafana"
  GF_AUTH_GENERIC_OAUTH_CLIENT_SECRET: "LE_SECRET"
  GF_AUTH_GENERIC_OAUTH_SCOPES: "openid profile email roles"
  GF_AUTH_GENERIC_OAUTH_AUTH_URL: "https://auth.example.com/realms/production/protocol/openid-connect/auth"
  GF_AUTH_GENERIC_OAUTH_TOKEN_URL: "https://auth.example.com/realms/production/protocol/openid-connect/token"
  GF_AUTH_GENERIC_OAUTH_API_URL: "https://auth.example.com/realms/production/protocol/openid-connect/userinfo"
  GF_AUTH_GENERIC_OAUTH_ROLE_ATTRIBUTE_PATH: "contains(realm_access.roles[*], 'admin') && 'GrafanaAdmin' || 'Viewer'"
```

#### ✅ Test end-to-end

```bash
# Vérifier que Keycloak est accessible
curl -s https://auth.example.com/realms/production/.well-known/openid-configuration | jq '.issuer'
# "https://auth.example.com/realms/production"

# Vérifier les endpoints disponibles
curl -s https://auth.example.com/realms/production/.well-known/openid-configuration \
  | jq '{
      authorization: .authorization_endpoint,
      token: .token_endpoint,
      userinfo: .userinfo_endpoint,
      jwks: .jwks_uri
    }'
```

---

## 13. Exemples pratiques complets — authentik

---

### 🏠 Exemple 4 — authentik On-Premise (Proxmox) : Portail SSO pour homelab

**Contexte** : homelab avec Proxmox. Vous avez Grafana, Portainer, et un Wiki (Wikijs). Vous voulez un seul login pour tout, via authentik + Traefik.

```
Flux complet :
  Navigateur → grafana.home.lab
      ↓ Traefik detecte : "auth requise"
      ↓ Forward Auth vers authentik
      ↓ authentik : "utilisateur connecté ?"
        → NON : page de login authentik
        → OUI : laisse passer
      ↓ Grafana reçoit la requête avec les headers d'identité
```

#### Étape 1 : Stack complète docker-compose.yml

```yaml
# /opt/homelab/docker-compose.yml
services:
  # ─── Reverse Proxy ─────────────────────────────────────────────
  traefik:
    image: traefik:v3
    restart: unless-stopped
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedByDefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
      - "--certificatesresolvers.letsencrypt.acme.email=vous@example.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik_letsencrypt:/letsencrypt
    networks: [proxy]

  # ─── authentik ─────────────────────────────────────────────────
  postgresql:
    image: postgres:16-alpine
    restart: unless-stopped
    env_file: .env
    environment:
      POSTGRES_DB: authentik
      POSTGRES_USER: authentik
      POSTGRES_PASSWORD: ${PG_PASS}
    volumes:
      - authentik_db:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U authentik"]
      interval: 10s
      retries: 5
    networks: [authentik-net]

  authentik-server:
    image: ghcr.io/goauthentik/server:2026.2.1
    restart: unless-stopped
    command: server
    env_file: .env
    environment:
      AUTHENTIK_POSTGRESQL__HOST: postgresql
      AUTHENTIK_POSTGRESQL__PASSWORD: ${PG_PASS}
      AUTHENTIK_SECRET_KEY: ${AUTHENTIK_SECRET_KEY}
      AUTHENTIK_ERROR_REPORTING__ENABLED: "false"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.authentik.rule=Host(`auth.home.lab`)"
      - "traefik.http.routers.authentik.tls.certresolver=letsencrypt"
      - "traefik.http.services.authentik.loadbalancer.server.port=9000"
      # Middleware d'authentification utilisable par les autres apps
      - "traefik.http.middlewares.authentik-mw.forwardauth.address=http://authentik-server:9000/outpost.goauthentik.io/auth/traefik"
      - "traefik.http.middlewares.authentik-mw.forwardauth.trustForwardHeader=true"
      - "traefik.http.middlewares.authentik-mw.forwardauth.authResponseHeaders=X-authentik-username,X-authentik-groups,X-authentik-email,X-authentik-name,X-authentik-uid"
    networks: [proxy, authentik-net]
    depends_on:
      postgresql:
        condition: service_healthy

  authentik-worker:
    image: ghcr.io/goauthentik/server:2026.2.1
    restart: unless-stopped
    command: worker
    user: root
    env_file: .env
    environment:
      AUTHENTIK_POSTGRESQL__HOST: postgresql
      AUTHENTIK_POSTGRESQL__PASSWORD: ${PG_PASS}
      AUTHENTIK_SECRET_KEY: ${AUTHENTIK_SECRET_KEY}
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    networks: [authentik-net]
    depends_on:
      postgresql:
        condition: service_healthy

  # ─── Applications protégées ────────────────────────────────────
  grafana:
    image: grafana/grafana:latest
    restart: unless-stopped
    environment:
      GF_SERVER_ROOT_URL: https://grafana.home.lab
      # Accepter les headers d'authentification de authentik
      GF_AUTH_PROXY_ENABLED: "true"
      GF_AUTH_PROXY_HEADER_NAME: "X-authentik-username"
      GF_AUTH_PROXY_HEADER_PROPERTY: "username"
      GF_AUTH_PROXY_AUTO_SIGN_UP: "true"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.grafana.rule=Host(`grafana.home.lab`)"
      - "traefik.http.routers.grafana.tls.certresolver=letsencrypt"
      # ⬇️ CE LABEL applique le middleware d'auth authentik
      - "traefik.http.routers.grafana.middlewares=authentik-mw@docker"
      - "traefik.http.services.grafana.loadbalancer.server.port=3000"
    networks: [proxy]

  portainer:
    image: portainer/portainer-ce:latest
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer_data:/data
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.portainer.rule=Host(`portainer.home.lab`)"
      - "traefik.http.routers.portainer.tls.certresolver=letsencrypt"
      - "traefik.http.routers.portainer.middlewares=authentik-mw@docker"
      - "traefik.http.services.portainer.loadbalancer.server.port=9000"
    networks: [proxy]

volumes:
  authentik_db:
  traefik_letsencrypt:
  portainer_data:

networks:
  proxy:
  authentik-net:
```

```bash
# Fichier .env
echo "AUTHENTIK_SECRET_KEY=$(openssl rand -base64 60 | tr -d '\n')" > .env
echo "PG_PASS=$(openssl rand -base64 36 | tr -d '\n')" >> .env

docker compose up -d
```

#### Étape 2 : Configuration initiale d'authentik

```bash
# Ouvrir le setup initial (une seule fois !)
open http://auth.home.lab/if/flow/initial-setup/
```

Créer le compte `akadmin` avec un mot de passe fort.

#### Étape 3 : Créer l'application "Grafana" dans authentik via l'API

```bash
# Obtenir un token API depuis l'interface :
# Admin → Tokens & App Passwords → Create → Type: API
# Copier le token

AUTHENTIK_TOKEN="votre-token-api-ici"
AUTHENTIK_URL="https://auth.home.lab"

# 1. Créer le Provider (protocole = Proxy)
PROVIDER_ID=$(curl -s -X POST "$AUTHENTIK_URL/api/v3/providers/proxy/" \
  -H "Authorization: Token $AUTHENTIK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Grafana Proxy Provider",
    "mode": "forward_single",
    "external_host": "https://grafana.home.lab",
    "authorization_flow": "default-authorization-flow"
  }' | jq -r '.pk')

echo "Provider créé : $PROVIDER_ID"

# 2. Créer l'Application liée au Provider
curl -s -X POST "$AUTHENTIK_URL/api/v3/core/applications/" \
  -H "Authorization: Token $AUTHENTIK_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Grafana\",
    \"slug\": \"grafana\",
    \"provider\": $PROVIDER_ID,
    \"meta_launch_url\": \"https://grafana.home.lab\",
    \"meta_icon\": \"https://grafana.com/static/img/menu/grafana2.svg\"
  }"

echo "✅ Application Grafana créée dans authentik"
```

#### Étape 4 : Créer un utilisateur via l'API authentik

```bash
# Créer l'utilisateur "bob"
curl -s -X POST "$AUTHENTIK_URL/api/v3/core/users/" \
  -H "Authorization: Token $AUTHENTIK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "bob",
    "name": "Bob Dupont",
    "email": "bob@example.com",
    "is_active": true,
    "groups": []
  }'

# Définir son mot de passe
USER_ID=$(curl -s "$AUTHENTIK_URL/api/v3/core/users/?username=bob" \
  -H "Authorization: Token $AUTHENTIK_TOKEN" | jq -r '.results[0].pk')

curl -s -X POST "$AUTHENTIK_URL/api/v3/core/users/$USER_ID/set_password/" \
  -H "Authorization: Token $AUTHENTIK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password": "BobPassword123!"}'

echo "✅ Utilisateur bob créé (ID: $USER_ID)"
```

#### Étape 5 : Créer un groupe et limiter l'accès à Grafana

```bash
# Créer le groupe "grafana-users"
GROUP_ID=$(curl -s -X POST "$AUTHENTIK_URL/api/v3/core/groups/" \
  -H "Authorization: Token $AUTHENTIK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "grafana-users",
    "is_superuser": false
  }' | jq -r '.pk')

# Ajouter bob au groupe
curl -s -X POST "$AUTHENTIK_URL/api/v3/core/groups/$GROUP_ID/add_user/" \
  -H "Authorization: Token $AUTHENTIK_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"pk\": $USER_ID}"

echo "✅ Bob ajouté au groupe grafana-users"
```

#### Étape 6 : Créer une Policy — seuls les membres de "grafana-users" peuvent accéder

Dans l'interface authentik :

```
Admin → Policies → Create → Expression Policy

Name: "Check grafana-users membership"
Expression:
```

```python
# Policy Python — retourne True si l'utilisateur est autorisé
return ak_is_group_member(request.user, name="grafana-users")
```

Puis lier cette policy à l'application Grafana :

```
Admin → Applications → Grafana → Policy/Group Bindings
→ Create Binding → Policy : "Check grafana-users membership"
```

#### ✅ Test du flux complet

```bash
# Tenter d'accéder à Grafana sans être connecté
curl -I https://grafana.home.lab
# → 302 Redirect vers https://auth.home.lab/...

# Après connexion avec bob (via navigateur)
# Grafana s'ouvre directement, le header X-authentik-username est transmis
# Grafana crée automatiquement le compte bob (GF_AUTH_PROXY_AUTO_SIGN_UP=true)
```

---

### 🔐 Exemple 5 — authentik : MFA conditionnel par groupe (Flow personnalisé)

**Contexte** : vous voulez que les admins aient le MFA obligatoire, mais pas les utilisateurs normaux.

#### Créer le Flow d'authentification avec MFA conditionnel

Dans l'interface authentik :

**Admin → Flows → Create**

```
Name: "Connexion avec MFA conditionnel"
Designation: authentication
```

**Ajouter les Stages dans l'ordre :**

```
Stage 1 : Identification
  → Type: Identification Stage
  → User fields: Username, Email
  → Name: "Identification"

Stage 2 : Mot de passe
  → Type: Password Stage
  → Name: "Password"

Stage 3 : MFA (conditionnel)
  → Type: Authenticator Validate Stage
  → Name: "MFA Validation"
  → Device classes: TOTP, WebAuthn
```

**Créer la Policy pour le Stage 3 :**

```
Admin → Policies → Create → Expression Policy

Name: "mfa-required-for-admins"
Expression:
```

```python
# MFA requis uniquement si l'utilisateur est dans le groupe "admins"
# ou si sa connexion vient d'une IP externe
from ipaddress import ip_address, ip_network

user_is_admin = ak_is_group_member(request.user, name="admins")

# Vérifier si l'IP est externe (hors réseau local)
client_ip = request.http_request.META.get("REMOTE_ADDR", "")
try:
    is_local = ip_address(client_ip) in ip_network("192.168.0.0/16")
except ValueError:
    is_local = False

# MFA requis pour les admins OU si connexion externe
return user_is_admin or not is_local
```

**Lier la Policy au Stage MFA :**

```
Flow → Stages → MFA Validation → Bindings
→ Add Binding → Policy: "mfa-required-for-admins"
→ Negate (si la policy = True → exécuter le stage)
```

#### Forcer l'enrôlement TOTP à la première connexion

```
Stage 4 : Enrôlement TOTP (conditionnel)
  → Type: Authenticator TOTP Setup Stage
  → Name: "TOTP Setup"

Policy pour ce stage :
```

```python
# Déclencher l'enrôlement si l'utilisateur n'a pas encore de TOTP
# ET s'il est dans le groupe admins
from authentik.stages.authenticator_totp.models import TOTPDevice

user_is_admin = ak_is_group_member(request.user, name="admins")
has_totp = TOTPDevice.objects.filter(user=request.user, confirmed=True).exists()

# Forcer le setup si admin sans TOTP configuré
return user_is_admin and not has_totp
```

---

### ☁️ Exemple 6 — authentik Cloud (Kubernetes) : OIDC pour GitLab + Nextcloud

**Contexte** : déploiement Kubernetes sur GKE. Vous voulez un SSO OIDC pour GitLab et Nextcloud.

#### Installation via Helm

```bash
# Ajouter le repo
helm repo add authentik https://charts.goauthentik.io && helm repo update

# values.yaml
cat > values-authentik.yaml << 'EOF'
authentik:
  secret_key: "$(openssl rand -base64 60)"
  log_level: info
  
  postgresql:
    host: "postgresql"
    name: "authentik"
    user: "authentik"
    password: "pgpassword123"

  email:
    host: "smtp.gmail.com"
    port: 587
    use_tls: true
    username: "noreply@example.com"
    password: "smtp-app-password"
    from: "noreply@example.com"

postgresql:
  enabled: true
  auth:
    username: authentik
    password: pgpassword123
    database: authentik

ingress:
  enabled: true
  ingressClassName: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: auth.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: authentik-tls
      hosts:
        - auth.example.com

replicas: 2   # HA

resources:
  server:
    requests:
      memory: 512Mi
      cpu: 250m
    limits:
      memory: 1Gi
      cpu: 500m
EOF

helm upgrade --install authentik authentik/authentik \
  --namespace authentik \
  --create-namespace \
  -f values-authentik.yaml
```

```bash
# Vérifier le déploiement
kubectl get pods -n authentik
kubectl get ingress -n authentik
```

#### Configuration GitLab avec authentik (OIDC)

**Dans authentik :**

```bash
AUTHENTIK_TOKEN="votre-token-admin"
AUTHENTIK_URL="https://auth.example.com"

# 1. Créer le Provider OIDC pour GitLab
PROVIDER=$(curl -s -X POST "$AUTHENTIK_URL/api/v3/providers/oauth2/" \
  -H "Authorization: Token $AUTHENTIK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "GitLab OIDC Provider",
    "authorization_flow": "default-authorization-flow",
    "client_type": "confidential",
    "client_id": "gitlab",
    "redirect_uris": "https://gitlab.example.com/users/auth/openid_connect/callback",
    "sub_mode": "hashed_user_id",
    "include_claims_in_id_token": true,
    "signing_key": "default-rsa"
  }')

echo $PROVIDER | jq '{client_id: .client_id, client_secret: .client_secret}'
# ⬆️ Noter le client_secret — vous en aurez besoin pour GitLab
```

**Dans la configuration GitLab :**

```ruby
# /etc/gitlab/gitlab.rb
gitlab_rails['omniauth_enabled'] = true
gitlab_rails['omniauth_allow_single_sign_on'] = ['openid_connect']
gitlab_rails['omniauth_auto_link_user'] = ['openid_connect']
gitlab_rails['omniauth_block_auto_created_users'] = false

gitlab_rails['omniauth_providers'] = [
  {
    name: "openid_connect",
    label: "SSO authentik",
    args: {
      name: "openid_connect",
      scope: ["openid", "profile", "email"],
      response_type: "code",
      issuer: "https://auth.example.com/application/o/gitlab/",
      discovery: true,
      client_auth_method: "query",
      uid_field: "preferred_username",
      send_scope_to_token_endpoint: true,
      client_options: {
        identifier: "gitlab",
        secret: "LE_CLIENT_SECRET_DEPUIS_AUTHENTIK",
        redirect_uri: "https://gitlab.example.com/users/auth/openid_connect/callback"
      }
    }
  }
]
```

```bash
# Reconfigurer GitLab
gitlab-ctl reconfigure
gitlab-ctl restart
```

#### Configuration Nextcloud avec authentik (OIDC)

**Dans authentik — créer le Provider pour Nextcloud :**

```bash
NEXTCLOUD_PROVIDER=$(curl -s -X POST "$AUTHENTIK_URL/api/v3/providers/oauth2/" \
  -H "Authorization: Token $AUTHENTIK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nextcloud OIDC",
    "authorization_flow": "default-authorization-flow",
    "client_type": "confidential",
    "client_id": "nextcloud",
    "redirect_uris": "https://nextcloud.example.com/apps/oidc_login/oidc",
    "sub_mode": "hashed_user_id",
    "property_mappings": []
  }')

echo $NEXTCLOUD_PROVIDER | jq '{client_id: .client_id, client_secret: .client_secret}'
```

**Dans Nextcloud — config.php :**

```php
<?php
// /var/www/html/config/config.php

$CONFIG = [
  // ... config existante ...
  
  // OIDC via authentik
  'oidc_login_provider_url' => 'https://auth.example.com/application/o/nextcloud/',
  'oidc_login_client_id' => 'nextcloud',
  'oidc_login_client_secret' => 'LE_CLIENT_SECRET_DEPUIS_AUTHENTIK',
  'oidc_login_auto_redirect' => false,        // true = redirige auto vers SSO
  'oidc_login_end_session_redirect' => true,
  'oidc_login_button_text' => 'Connexion SSO',
  'oidc_login_hide_password_form' => false,   // true = cache login local
  'oidc_login_use_id_token' => true,
  'oidc_login_attributes' => [
    'id' => 'preferred_username',
    'name' => 'name',
    'mail' => 'email',
    'groups' => 'groups',                     // Sync des groupes authentik
  ],
  'oidc_login_default_group' => 'oidc-users',
  'oidc_create_groups' => true,
];
```

#### ✅ Test du SSO complet

```bash
# Vérifier le discovery endpoint d'authentik
curl -s https://auth.example.com/application/o/gitlab/.well-known/openid-configuration \
  | jq '{
      issuer: .issuer,
      auth: .authorization_endpoint,
      token: .token_endpoint
    }'

# Résultat attendu :
# {
#   "issuer": "https://auth.example.com/application/o/gitlab/",
#   "auth": "https://auth.example.com/application/o/authorize/",
#   "token": "https://auth.example.com/application/o/token/"
# }
```

---

### 🔄 Exemple 7 — authentik : Provisioning SCIM vers Slack/GitHub

**Contexte** : quand vous créez un utilisateur dans authentik, vous voulez qu'il soit automatiquement créé dans GitHub Enterprise et Slack. C'est le **provisioning SCIM**.

```
authentik (source de vérité)
    ↓ SCIM sync automatique
GitHub Enterprise ← utilisateur créé/désactivé
Slack             ← utilisateur créé/désactivé
```

#### Configuration SCIM pour GitHub Enterprise

**Dans GitHub Enterprise :**
- Settings → Authentication Security → SCIM Provisioning
- Copier le token SCIM

**Dans authentik :**

```bash
# Créer le Provider SCIM pour GitHub
curl -s -X POST "$AUTHENTIK_URL/api/v3/providers/scim/" \
  -H "Authorization: Token $AUTHENTIK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "GitHub Enterprise SCIM",
    "url": "https://api.github.com/scim/v2/enterprises/VOTRE-ORG",
    "token": "LE_TOKEN_SCIM_GITHUB",
    "filter_group": "github-users"
  }'
```

Résultat : chaque utilisateur ajouté au groupe `github-users` dans authentik sera automatiquement créé sur GitHub Enterprise. Si vous désactivez l'utilisateur dans authentik → il est désactivé sur GitHub.

#### Workflow complet : onboarding d'un nouvel employé

```
HR crée le compte dans authentik
    ↓ (automatique)
    → Compte créé sur GitHub Enterprise
    → Compte créé sur Slack
    → Invitation email envoyée (Email Stage dans le flow d'enrollment)
    → L'employé configure son TOTP (stage obligatoire)
    → Accès à GitLab, Grafana, Nextcloud (SSO automatique)
```

---

## 14. Dépannage et cas d'erreurs fréquents

### Problèmes courants Keycloak

#### ❌ Erreur : "Invalid redirect_uri"

```
Error: redirect_uri_mismatch
```

**Cause** : l'URL de callback de votre application ne correspond pas exactement à ce qui est configuré dans Keycloak.

```bash
# Vérifier la config du client
curl -s http://localhost:8080/admin/realms/myapp/clients \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.[] | select(.clientId=="react-frontend") | .redirectUris'

# Si l'URL est http://localhost:3000/* mais que votre app envoie
# http://localhost:3000/callback → ajouter l'URL exacte

# Corriger :
CLIENT_ID=$(curl -s http://localhost:8080/admin/realms/myapp/clients \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.[] | select(.clientId=="react-frontend") | .id')

curl -s -X PUT "http://localhost:8080/admin/realms/myapp/clients/$CLIENT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "react-frontend",
    "redirectUris": [
      "http://localhost:3000/*",
      "http://localhost:3000/callback",   # Ajouter l'URL exacte
      "https://app.example.com/*"
    ]
  }'
```

#### ❌ Erreur : Boucle de redirection infinie

**Cause** : `KC_HOSTNAME` ou `KC_PROXY_HEADERS` mal configurés derrière un reverse proxy.

```bash
# Diagnostic : voir les logs
docker compose logs keycloak | grep -i "hostname\|proxy\|redirect"

# Solution : vérifier les variables
docker compose exec keycloak /opt/keycloak/bin/kc.sh show-config \
  | grep -i "hostname\|proxy"

# Configuration correcte pour Nginx/Traefik :
environment:
  KC_HOSTNAME: auth.example.com
  KC_PROXY_HEADERS: xforwarded     # ← OBLIGATOIRE derrière un proxy
  KC_HTTP_ENABLED: "true"
```

#### ❌ Les rôles n'apparaissent pas dans le token

```bash
# Vérifier le contenu du token (decoder un JWT)
TOKEN="eyJhbG..."
echo $TOKEN | cut -d'.' -f2 | base64 -d 2>/dev/null | jq '.realm_access.roles'

# Si les rôles sont absents : vérifier les "Client Scopes"
# Le scope "roles" doit être dans les Default Client Scopes du client

# Via l'interface :
# Clients → react-frontend → Client Scopes → Add → roles
```

### Problèmes courants authentik

#### ❌ Erreur CSRF : "CSRF verification failed"

```bash
# Cause : cookie domain non configuré
# Solution : ajouter dans .env
echo "AUTHENTIK_COOKIE_DOMAIN=home.lab" >> .env
docker compose up -d
```

#### ❌ Le Forward Auth ne fonctionne pas avec Traefik

```bash
# Vérifier que l'Outpost est actif
curl -s "$AUTHENTIK_URL/api/v3/outposts/instances/" \
  -H "Authorization: Token $AUTHENTIK_TOKEN" \
  | jq '.[].service_connection_set'

# Tester le endpoint de forward auth directement
curl -v http://authentik-server:9000/outpost.goauthentik.io/auth/traefik \
  -H "X-Forwarded-Host: grafana.home.lab"

# Résultat attendu si non authentifié :
# HTTP/1.1 302 Found
# Location: https://auth.home.lab/outpost.goauthentik.io/start?rd=...
```

#### ❌ Erreur : "No flow found" lors du setup initial

```bash
# Vérifier que les flows par défaut sont bien créés
curl -s "$AUTHENTIK_URL/api/v3/flows/instances/" \
  -H "Authorization: Token $AUTHENTIK_TOKEN" \
  | jq '.[].slug'

# Si vide : les migrations ne sont pas terminées
docker compose logs authentik-server | tail -30
# Attendre "Starting gunicorn"
```

---

## 15. Scripts utilitaires

### Script de backup automatique

```bash
#!/bin/bash
# /opt/scripts/backup-iam.sh
# Usage : ./backup-iam.sh keycloak|authentik

set -euo pipefail
BACKUP_DIR="/opt/backups/iam"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

case "${1:-}" in
  keycloak)
    echo "📦 Backup Keycloak..."
    # Export de la BDD PostgreSQL
    docker compose -f /opt/keycloak/docker-compose.yml exec -T postgres \
      pg_dump -U keycloak keycloak | gzip > "$BACKUP_DIR/keycloak_db_$DATE.sql.gz"
    
    # Export JSON du realm via l'API
    TOKEN=$(curl -s -X POST http://localhost:8080/realms/master/protocol/openid-connect/token \
      -d "client_id=admin-cli&grant_type=password&username=admin&password=$KC_ADMIN_PASSWORD" \
      | jq -r '.access_token')
    
    for REALM in myapp production staging; do
      curl -s "http://localhost:8080/admin/realms/$REALM/partial-export?exportClients=true&exportGroupsAndRoles=true" \
        -H "Authorization: Bearer $TOKEN" \
        | gzip > "$BACKUP_DIR/keycloak_realm_${REALM}_$DATE.json.gz"
      echo "✅ Realm $REALM exporté"
    done
    ;;
    
  authentik)
    echo "📦 Backup authentik..."
    docker compose -f /opt/authentik/docker-compose.yml exec -T postgresql \
      pg_dump -U authentik authentik | gzip > "$BACKUP_DIR/authentik_db_$DATE.sql.gz"
    
    # Backup des médias (logos, etc.)
    tar -czf "$BACKUP_DIR/authentik_media_$DATE.tar.gz" /opt/authentik/data/
    ;;
    
  *)
    echo "Usage: $0 keycloak|authentik"
    exit 1
    ;;
esac

# Nettoyer les backups de plus de 30 jours
find "$BACKUP_DIR" -name "*.gz" -mtime +30 -delete

echo "✅ Backup terminé : $BACKUP_DIR"
ls -lh "$BACKUP_DIR"
```

```bash
chmod +x /opt/scripts/backup-iam.sh

# Automatiser avec cron
echo "0 2 * * * root /opt/scripts/backup-iam.sh keycloak" >> /etc/cron.d/iam-backup
echo "0 3 * * * root /opt/scripts/backup-iam.sh authentik" >> /etc/cron.d/iam-backup
```

### Script de test de santé

```bash
#!/bin/bash
# /opt/scripts/healthcheck-iam.sh

echo "=== Keycloak Health Check ==="
KC_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health/ready)
if [ "$KC_HEALTH" = "200" ]; then
  echo "✅ Keycloak : OK"
else
  echo "❌ Keycloak : KO (HTTP $KC_HEALTH)"
  # Envoyer une alerte (ex: via ntfy, Slack webhook, etc.)
  curl -s -X POST https://ntfy.sh/votre-channel \
    -d "Keycloak est DOWN sur $(hostname)" \
    -H "Title: ⚠️ Alerte IAM"
fi

echo ""
echo "=== authentik Health Check ==="
AK_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9000/-/health/ready/)
if [ "$AK_HEALTH" = "200" ]; then
  echo "✅ authentik : OK"
else
  echo "❌ authentik : KO (HTTP $AK_HEALTH)"
fi

echo ""
echo "=== Vérification des tokens expirés ==="
# Compter les sessions actives Keycloak
TOKEN=$(curl -s -X POST http://localhost:8080/realms/master/protocol/openid-connect/token \
  -d "client_id=admin-cli&grant_type=password&username=admin&password=$KC_ADMIN_PASSWORD" \
  | jq -r '.access_token')

SESSIONS=$(curl -s http://localhost:8080/admin/realms/myapp/sessions/stats \
  -H "Authorization: Bearer $TOKEN" | jq '.')
echo "Sessions actives Keycloak : $SESSIONS"
```
