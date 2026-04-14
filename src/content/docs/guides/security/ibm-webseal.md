---
title: "🔐 IBM WebSEAL"
description: "🔐 IBM WebSEAL — Documentation Pédagogique Complète"
created: "2026-04-09"
# updated: "2026-04-04"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"

---

<!-- # 🔐 IBM WebSEAL — Documentation Pédagogique Complète -->

<!-- > **Audience :** Ingénieurs OPS N3, DevOps, préparation entretien technique
> **Contexte mission :** Socle STCA — La Poste BGPN / DSP
> **Version :** 1.0 — Avril 2026 -->

<!-- --- -->

## 📋 Table des matières

| # | Section |
|---|---------|
| 1 | C'est quoi WebSEAL ? (en langage simple) |
| 2 | Architecture — Comment ça fonctionne |
| 3 | Les concepts clés à maîtriser |
| 4 | Méthodes d'authentification supportées |
| 5 | Les jonctions WebSEAL — Le cœur du système |
| 6 | Gestion des certificats SSL/TLS |
| 7 | Bonnes pratiques opérationnelles |
| 8 | Limites et contraintes connues |
| 9 | Vulnérabilités et risques de sécurité |
| 10 | Automatisation — Ansible & AWX |
| 11 | Commandes essentielles (`pdadmin`) |
| 12 | Monitoring et observabilité |
| 13 | Préparation entretien — Questions/Réponses |

---

## 1️⃣ C'est quoi WebSEAL ? (en langage simple)

### L'analogie du vigile d'immeuble

Imagine un immeuble de bureaux avec plein de services à l'intérieur (la comptabilité, les RH, la DSI...). Sans WebSEAL, chaque service aurait sa propre porte d'entrée, ses propres badges, ses propres règles. C'est le chaos.

**WebSEAL, c'est le vigile à l'entrée principale :**
- Il vérifie ton identité une seule fois (authentification)
- Il sait à quelles pièces tu as accès (autorisation)
- Il t'accompagne à la bonne porte sans que tu aies à re-t'identifier (SSO)
- Il garde une trace de tous tes passages (audit)
- Les services intérieurs ne voient jamais les visiteurs directement — tout passe par lui

### Définition technique

WebSEAL est un **reverse proxy de sécurité** (ou "Resource Manager") faisant partie de la suite IBM Security Access Manager (ISAM / ISVA). Il :

- Reçoit les requêtes HTTP/HTTPS des utilisateurs
- Authentifie et autorise chaque requête
- Transmet les requêtes aux serveurs applicatifs backend via des **jonctions**
- Applique des politiques de sécurité fines sur chaque ressource protégée

```
Internet / Réseau interne
        ↓
[ Client : navigateur, app mobile ]
        ↓  HTTPS
[ IBM WebSEAL ]  ← Point d'entrée unique, sécurisé
   ↓ Authentification
   ↓ Autorisation (ACL)
   ↓ Audit
[ Jonctions TCP/SSL ]
   ↓
[ Applications backend : app1, app2, app3... ]
```

---

## 2️⃣ Architecture — Comment ça fonctionne

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ISAM / ISVA ECOSYSTEM                        │
│                                                                     │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────────────────┐  │
│  │  Client  │───▶│   WebSEAL   │───▶│  Serveurs Backend         │  │
│  │ Browser  │    │ Reverse Proxy│    │  (via jonctions)          │  │
│  └──────────┘    └──────┬───────┘    │  ┌──────┐ ┌──────┐       │  │
│                         │            │  │ App1 │ │ App2 │  ...  │  │
│              ┌──────────▼──────────┐ │  └──────┘ └──────┘       │  │
│              │  Policy Server       │ └───────────────────────────┘  │
│              │  (pdmgrd)            │                               │
│              │  - Politiques ACL    │    ┌──────────────────────┐   │
│              │  - Espace protégé    │    │   LDAP / LDAPS       │   │
│              │  - Base utilisateurs │◀───│   Annuaire users     │   │
│              └─────────────────────┘    └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Composants principaux

| Composant | Rôle | Processus |
|-----------|------|-----------|
| **WebSEAL** | Reverse proxy — point d'entrée HTTPS | `webseald` |
| **Policy Server** | Moteur de politiques et d'autorisation | `pdmgrd` |
| **Authorization Server** | Évalue les droits d'accès en temps réel | `pdacld` |
| **LDAP Directory** | Référentiel des utilisateurs et groupes | Annuaire externe |
| **Appliance IBM** | Hardware / VM qui héberge WebSEAL | Firmware IBM propriétaire |

### Flux d'une requête authentifiée

```
1. Client envoie GET https://portail.laposte.fr/monservice
          ↓
2. WebSEAL reçoit la requête HTTPS (terminaison TLS ici)
          ↓
3. WebSEAL vérifie : l'utilisateur est-il authentifié ?
   → NON : redirige vers la page de login (formulaire, Basic Auth, cert...)
   → OUI : passe à l'étape 4
          ↓
4. WebSEAL interroge le Policy Server :
   "Est-ce que user@laposte.fr a le droit GET sur /monservice ?"
   → NON : retourne HTTP 403 Forbidden
   → OUI : passe à l'étape 5
          ↓
5. WebSEAL transmet la requête au backend via la jonction définie
   (avec les headers iv-user, iv-groups, iv-creds injectés)
          ↓
6. Backend répond à WebSEAL
          ↓
7. WebSEAL retourne la réponse au client
```

---

## 3️⃣ Les concepts clés à maîtriser

### L'espace d'objets protégés (Protected Object Space)

WebSEAL représente toutes ses ressources comme une **arborescence d'objets**, similaire à un système de fichiers :

```
/WebSEAL/
└── portail.laposte.fr-default/    ← Instance WebSEAL
    ├── /                          ← Racine (WebSEAL local)
    ├── /public/                   ← Ressources publiques (non protégées)
    ├── /mon-compte/               ← Jonction vers app-compte (protégée)
    │   ├── /profil
    │   └── /parametres
    └── /suivi-colis/              ← Jonction vers app-tracking (protégée)
```

Chaque nœud peut avoir une **ACL** (politique d'accès) et un **POP** (Protected Object Policy).

### ACL — Access Control List

Une ACL définit **qui peut faire quoi** sur une ressource :

```
ACL "postiers-acl" :
  - Utilisateurs du groupe "agents-guichet"  → r (read)
  - Utilisateurs du groupe "responsables"    → r, x (read + execute)
  - sec_master                               → rwd (tout)
  - any-other (authentifié)                  → r
  - unauthenticated                          → (rien)
```

**Permissions WebSEAL :**
| Permission | Signification |
|-----------|---------------|
| `r` | Lecture (GET) |
| `w` | Écriture (POST/PUT) |
| `x` | Execute (traversal) |
| `d` | Delete (DELETE) |
| `T` | Traverse (accès aux sous-objets) |

### POP — Protected Object Policy

Politiques supplémentaires applicables sur un objet :
- Niveau d'authentification requis (ex: MFA obligatoire pour /admin/)
- Restrictions IP
- Limites de cache
- Audit renforcé

### Headers d'identité injectés par WebSEAL

Quand WebSEAL transmet une requête au backend, il **injecte automatiquement** des headers HTTP avec l'identité de l'utilisateur :

```http
GET /mon-compte/profil HTTP/1.1
Host: app-backend.internal
iv-user: jean.dupont@laposte.fr         ← Identifiant utilisateur
iv-groups: agents-guichet,employees     ← Groupes de l'utilisateur
iv-creds: <credential_token>            ← Token de session chiffré
iv-remote-address: 192.168.1.100        ← IP du client original
```

> ⚠️ **Point critique :** Ces headers doivent être **filtrés par WebSEAL** pour éviter qu'un utilisateur malveillant les falsifie directement depuis l'extérieur. Configuration : `junction -c iv-user,iv-groups` ET filtrage des headers entrants.

---

## 4️⃣ Méthodes d'authentification supportées

WebSEAL supporte de nombreuses méthodes, configurables par jonction ou globalement :

| Méthode | Description | Usage typique |
|---------|-------------|---------------|
| **Forms** | Formulaire HTML login/password | Portails web grand public |
| **Basic Auth** | Header HTTP `Authorization: Basic` | APIs, clients techniques |
| **Certificate** | Certificat client SSL/TLS | Accès très sécurisé, B2B |
| **Kerberos** | Token Kerberos (intranet) | SSO Windows / Active Directory |
| **LTPA** | Token IBM WebSphere | SSO avec apps IBM |
| **Headers HTTP** | Trust d'un header (EAI) | Délégation d'authentification |
| **OAuth / OIDC** | Tokens OAuth2 | Apps modernes, mobile |

### SSO — Comment ça marche avec LTPA

```
1. L'utilisateur s'authentifie sur WebSEAL (formulaire)
          ↓
2. WebSEAL génère un token LTPA (chiffré avec une clé partagée)
          ↓
3. WebSEAL injecte ce token dans la requête vers le backend WebSphere
          ↓
4. Le backend WebSphere valide le token LTPA (clé partagée)
   → Identifie l'utilisateur sans nouvelle authentification
          ↓
5. L'utilisateur accède à App1, App2, App3 sans se réauthentifier
```

> 📌 **À La Poste :** Le SSO via LTPA est typiquement utilisé pour connecter WebSEAL aux applications Java/WebSphere du socle STCA.

---

## 5️⃣ Les jonctions WebSEAL — Le cœur du système

### Qu'est-ce qu'une jonction ?

Une jonction est une **connexion TCP/IP configurée** entre WebSEAL et un serveur backend. C'est le mécanisme qui permet à WebSEAL de "proxyfier" les applications.

```
WebSEAL                          Backend
  /mon-compte  ──junction──▶  app-compte:8080
  /suivi       ──junction──▶  app-tracking:8443 (SSL)
  /api/v1      ──junction──▶  api-server:9090
```

### Types de jonctions

#### Standard Junction (`-t tcp` ou `-t ssl`)

La jonction **réécrit les URLs** — elle préfixe le chemin de jonction.

```
Client demande :   GET /mon-compte/profil
WebSEAL envoie :   GET /profil              ← Préfixe /mon-compte retiré
vers :             app-backend:8080/profil
```

**Problème :** Les liens absolus dans les réponses backend peuvent "casser" car le préfixe est absent côté backend.

#### Transparent Path Junction (`-x`)

La jonction **préserve le chemin complet** — aucune réécriture d'URL.

```
Client demande :   GET /mon-compte/profil
WebSEAL envoie :   GET /mon-compte/profil   ← Chemin conservé
vers :             app-backend:8080/mon-compte/profil
```

**Avantage :** Les liens absolus fonctionnent naturellement. Recommandé pour les applications modernes.

#### Virtual Host Junction

Chaque application répond sur un **sous-domaine différent** plutôt qu'un chemin.

```
clients.laposte.fr    ──▶  app-clients:8080
pro.laposte.fr        ──▶  app-pro:8080
suivi.laposte.fr      ──▶  app-tracking:8443
```

### Créer une jonction — commande `pdadmin`

```bash
# Jonction TCP standard
pdadmin> server task webseald-default create \
  -t tcp \
  -h app-backend.internal \
  -p 8080 \
  /mon-app

# Jonction SSL transparente avec SSO LTPA
pdadmin> server task webseald-default create \
  -t ssl \
  -h app-backend.internal \
  -p 8443 \
  -x \                    # Transparent path
  -A \                    # Activer LTPA
  -F /opt/webseal/ltpa.key \   # Fichier de clé LTPA
  -Z motdepasse_ltpa \   # Mot de passe clé LTPA
  -c iv-user,iv-groups \ # Headers identité à injecter
  /mon-app
```

### Vérifier l'état des jonctions

```bash
# Lister toutes les jonctions
pdadmin> server task webseald-default junctions

# Voir le détail d'une jonction
pdadmin> server task webseald-default show /mon-app

# Voir les connexions actives
pdadmin> server task webseald-default junction list
```

---

## 6️⃣ Gestion des certificats SSL/TLS

> ⚠️ **Risque N°1 en production.** Un certificat expiré sur WebSEAL = service totalement inaccessible pour tous les utilisateurs. Incident P1 évitable à 100%.

### Architecture des certificats dans WebSEAL

WebSEAL utilise un **keystore propriétaire** (format IBM GSKit / p12 / CMS) pour stocker ses certificats. Ce n'est pas le keystore Java standard.

```
WebSEAL Certificate Stores :
├── ssl.keyfile         ← Certificat serveur WebSEAL (présenté aux clients)
│   └── CN=portail.laposte.fr       ← Cert wildcard ou spécifique
│
├── junction.keyfile    ← Certificats pour les jonctions SSL vers backends
│   ├── CN=app-backend1.internal
│   └── CN=app-backend2.internal
│
└── client.keyfile      ← Certificats client (si auth par cert)
```

### Commandes de gestion des certificats (GSKit)

```bash
# Lister tous les certificats du keystore
gsk8capicmd_64 -cert -list all -db /opt/pdweb/etc/pdsrv.kdb \
  -stashed

# Voir les détails d'un certificat (date d'expiration !)
gsk8capicmd_64 -cert -details -label "portail.laposte.fr" \
  -db /opt/pdweb/etc/pdsrv.kdb -stashed

# Importer un nouveau certificat (renouvellement)
gsk8capicmd_64 -cert -import -file new_cert.p12 -type pkcs12 \
  -target /opt/pdweb/etc/pdsrv.kdb -stashed \
  -label "portail.laposte.fr"

# Définir le certificat par défaut (celui présenté aux clients)
gsk8capicmd_64 -cert -setdefault -label "portail.laposte.fr" \
  -db /opt/pdweb/etc/pdsrv.kdb -stashed
```

### Script de surveillance des expirations

```bash
#!/bin/bash
# check_webseal_certs.sh — À planifier en cron / AWX

KEYSTORE="/opt/pdweb/etc/pdsrv.kdb"
SEUIL_ALERTE=30  # Jours

# Extraire les dates d'expiration
gsk8capicmd_64 -cert -list all -db $KEYSTORE -stashed | \
  grep "Label:" | awk '{print $2}' | \
while read LABEL; do
  EXPIRY=$(gsk8capicmd_64 -cert -details -label "$LABEL" \
    -db $KEYSTORE -stashed 2>/dev/null | \
    grep "Not After" | awk -F: '{print $2}')
  
  # Calculer les jours restants
  EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s 2>/dev/null)
  TODAY_EPOCH=$(date +%s)
  DAYS_LEFT=$(( (EXPIRY_EPOCH - TODAY_EPOCH) / 86400 ))
  
  if [ "$DAYS_LEFT" -lt "$SEUIL_ALERTE" ]; then
    echo "⚠️  ALERTE : Certificat '$LABEL' expire dans $DAYS_LEFT jours ($EXPIRY)"
    # Envoyer une alerte (mail, Prometheus, Slack...)
  fi
done
```

### Processus de renouvellement recommandé

```
J-30 : Alerte automatique → commande nouveau certificat à la PKI
J-15 : Réception du nouveau certificat → import en environnement de TEST
J-7  : Import en PRÉ-PRODUCTION + validation
J-2  : Import en PRODUCTION (hors heures de pointe)
       └── Backup du keystore avant opération
       └── Import nouveau certificat
       └── Définir comme certificat par défaut
       └── Reload WebSEAL (sans coupure si HA)
       └── Validation : vérification SSL depuis un client externe
J     : Surveillance renforcée les 48h post-renouvellement
```

---

## 7️⃣ Bonnes pratiques opérationnelles

### ✅ Architecture et HA

```
MAUVAIS (SPOF) :
  Client → WebSEAL unique → Backend

BON (Haute Disponibilité) :
  Client → Load Balancer (F5/HAProxy)
             ├── WebSEAL Instance 1 (Active)
             └── WebSEAL Instance 2 (Standby/Active)
                    ↓
             Backend (multiple serveurs en jonction)
```

**Configuration HA WebSEAL :**
- Chaque instance WebSEAL partage le même Policy Server
- Les sessions utilisateur doivent être **partagées** (session replicas) ou le load balancer doit faire de la **sticky session**
- Les keystores certificats doivent être **synchronisés** entre instances

### ✅ Sécurité des jonctions

```bash
# ❌ MAUVAIS : Jonction TCP non chiffrée vers le backend
pdadmin> server task webseald-default create -t tcp -h app-backend -p 8080 /app

# ✅ BON : Jonction SSL chiffrée
pdadmin> server task webseald-default create -t ssl -h app-backend -p 8443 /app

# ✅ MIEUX : Avec mutual TLS (authentification mutuelle)
pdadmin> server task webseald-default create -t ssl \
  -K /opt/webseal/junction_client.p12 \  # Certificat client WebSEAL
  -h app-backend -p 8443 /app
```

### ✅ Filtrage des headers d'identité

```ini
# Dans webseald-default.conf
# Filtrer les headers iv-* des requêtes ENTRANTES (sécurité anti-spoofing)
[junction]
strip-hdr-components = iv-user iv-groups iv-creds

# Injecter uniquement pour les jonctions autorisées
# (configuré par jonction avec -c iv-user,iv-groups)
```

### ✅ Gestion des sessions

```ini
# webseald-default.conf — paramètres de session
[session]
# Durée maximale d'une session (secondes)
max-session-lifetime = 28800        # 8 heures

# Timeout d'inactivité
inactive-session-timeout = 1800     # 30 minutes

# Nombre maximum de sessions simultanées par user
max-session-per-user = 5

# Type de stockage de session (pour HA)
session-data-storage = drs          # Dynamic Routing Service (cluster)
```

### ✅ Configuration TLS sécurisée

```ini
# webseald-default.conf
[ssl]
# Désactiver les protocoles obsolètes
ssl-v2 = no
ssl-v3 = no
tls-v10 = no
tls-v11 = no
tls-v12 = yes    # Minimum recommandé
tls-v13 = yes    # Idéal

# Ciphers forts uniquement
ssl-ciphers = TLS_AES_256_GCM_SHA384,TLS_AES_128_GCM_SHA256,TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
```

### ✅ Suppression de la version dans les headers HTTP

```ini
# Masquer la bannière WebSEAL (éviter la divulgation de version)
[server]
suppress-server-identity = yes     # Cache "Server: WebSEAL/x.x.x"
```

---

## 8️⃣ Limites et contraintes connues

### Limites techniques

| Contrainte | Impact | Contournement |
|-----------|--------|---------------|
| **Appliance propriétaire** | Pas de SSH root standard, CLI limitée | Utiliser l'interface web LMI ou `pdadmin` |
| **Keystore IBM GSKit** | Incompatible avec les outils certbot/OpenSSL standards | Scripts GSKit dédiés obligatoires |
| **Modules Ansible limités** | Les modules `apt`, `yum`, `service` ne fonctionnent pas sur l'appliance | Modules `uri`, `raw`, `ibmsecurity` Python |
| **Logs propriétaires** | Format non-standard, parsing ELK complexe | Parsers Logstash/Splunk personnalisés |
| **Firmware IBM** | Mises à jour avec procédures validées IBM uniquement | Procédure de patching documentée obligatoire |
| **Réécriture d'URLs** | URLs cassées dans les apps avec liens absolus | Utiliser transparent junctions (`-x`) |
| **Pas de rechargement à chaud** | Changements de config nécessitent un restart | Planifier en heures creuses, prévenir les équipes |

### Limites opérationnelles

```
⚠️  Restart WebSEAL = Déconnexion de toutes les sessions actives
    (sauf si session persistence configurée avec DRS)

⚠️  Modification d'une jonction = Impact sur les apps derrière
    Toujours tester en préprod avant production

⚠️  Policy Server indisponible = WebSEAL refuse toutes les requêtes
    (fail-closed par défaut — sécurisé mais bloquant)

⚠️  LDAP indisponible = Authentification impossible
    Prévoir replica LDAP en HA obligatoire
```

### Limites de scalabilité

```ini
# Paramètres à surveiller sous charge
[server]
# Threads de traitement des requêtes
worker-threads = 50           # Défaut souvent insuffisant pour forte charge

# File d'attente des connexions
listen-backlog = 511

# Connexions maximales vers les backends (par jonction)
max-cached-session-workers-exceeded = 4096
```

---

## 9️⃣ Vulnérabilités et risques de sécurité

### Risques opérationnels principaux

#### 🔴 Expiration de certificat — Risque critique

**Probabilité :** Élevée si pas de surveillance automatisée
**Impact :** Service totalement inaccessible, incident P1
**Mitigation :** Alerting J-30/J-15/J-7, automatisation via AWX

#### 🔴 Divulgation de version — Risque moyen

WebSEAL révèle sa version dans les headers HTTP par défaut. Un attaquant peut cibler des CVE connues.

```bash
# Vérifier si la version est exposée
curl -I https://portail.laposte.fr 2>/dev/null | grep -i server
# → Server: WebSEAL/9.0.2.1  ← Problème si visible !

# Solution : activer suppress-server-identity = yes dans la config
```

#### 🔴 Vulnérabilités CVE connues (IBM Security Verify Access)

Des chercheurs ont identifié plusieurs vulnérabilités sérieuses dans les versions récentes :

- **RCE (Remote Code Execution)** — multiples vecteurs
- **Auth Bypass** — contournement d'authentification possible via headers spécifiques
- **LPE (Local Privilege Escalation)** — 8 vecteurs identifiés
- **Composants tiers obsolètes** — bibliothèques embarquées (libmodsecurity, Xerces-C) non mises à jour

> **Recommandation :** Appliquer les patches IBM régulièrement. En octobre 2022, 32 vulnérabilités ont été découvertes et n'ont été patchées qu'en juin 2024 (18 mois de délai !).

#### 🟠 Injection de headers d'identité — Risque élevé si mal configuré

```
Scénario d'attaque :
  Attaquant → POST https://portail.laposte.fr/api/admin
              Header: iv-user: admin@laposte.fr
              Header: iv-groups: admins,super-admins
  
  Si WebSEAL ne filtre PAS ces headers entrants
  → Le backend croit que l'attaquant est admin !

Mitigation : strip-hdr-components = iv-user iv-groups iv-creds
```

#### 🟠 Accès direct au backend (bypass WebSEAL)

```
Scénario :
  Attaquant découvre l'IP directe du backend (app-backend:8080)
  Accède directement sans passer par WebSEAL
  → Contourne toute la politique de sécurité

Mitigation :
  - Firewall : les backends n'acceptent QUE les connexions depuis WebSEAL
  - Réseau : backends sur VLAN isolé, non routable depuis Internet
  - Mutual TLS : backends exigent le certificat client de WebSEAL
```

#### 🟡 Exposition du runtime ISVA sans authentification

Le backend d'administration ISVA peut être accessible sans authentification depuis les serveurs WebSEAL (par design architectural). Si un attaquant compromet un serveur WebSEAL, il peut potentiellement prendre le contrôle de toute l'infrastructure d'authentification.

**Mitigation :**
- Segmentation réseau stricte
- Activer l'authentification SSL mutuelle sur le runtime ISVA (option disponible en ISVA 10.0.8+)

### Checklist de durcissement WebSEAL

```
✅ suppress-server-identity = yes
✅ Désactiver SSLv2, SSLv3, TLSv1.0, TLSv1.1
✅ Filtrer les headers iv-* entrants
✅ Backends non accessibles directement (firewall)
✅ Journalisation d'audit activée (toutes les authentifications)
✅ Compte sec_master avec mot de passe fort et rotation régulière
✅ Patches firmware à jour
✅ Sessions avec timeout d'inactivité
✅ MFA activé pour les accès sensibles (administration, données clients)
✅ Surveillance des certificats (J-30 minimum)
```

---

## 🤖 10 — Automatisation — Ansible & AWX

### Contraintes spécifiques aux appliances IBM

Les appliances WebSEAL ne sont **pas des serveurs Linux classiques**. L'automatisation Ansible nécessite des adaptations :

```yaml
# ❌ NE PAS UTILISER sur une appliance IBM WebSEAL
- name: Redémarrer WebSEAL
  ansible.builtin.service:
    name: webseald
    state: restarted

# ✅ UTILISER l'API REST de l'appliance ou pdadmin via SSH
- name: Redémarrer WebSEAL via API REST
  ansible.builtin.uri:
    url: "https://{{ webseal_host }}:9443/wga/reverseproxy/{{ instance }}"
    method: PUT
    body_format: json
    body:
      operation: "restart"
    user: "{{ admin_user }}"
    password: "{{ admin_password }}"
    validate_certs: yes
    status_code: 200
```

### Module Ansible recommandé — `ibmsecurity`

IBM fournit un module Python `ibmsecurity` compatible avec Ansible :

```bash
# Installation
pip install ibmsecurity

# Utilisation dans un playbook
- name: Vérifier les jonctions WebSEAL
  ibmsecurity.isam.web.reverse_proxy.junctions:
    isamapi: "{{ isamapi }}"
    webseal_id: "default"
    state: get
  register: junctions_info
```

### Playbook — Surveillance des certificats

```yaml
---
# playbooks/check_webseal_certs.yml
- name: Vérification certificats WebSEAL
  hosts: webseal_servers
  gather_facts: no

  vars:
    alert_threshold_days: 30
    webseal_keystore: /opt/pdweb/etc/pdsrv.kdb
    notification_email: "ops-n3@laposte.fr"

  tasks:
    - name: Récupérer la liste des certificats
      ansible.builtin.command:
        cmd: >
          gsk8capicmd_64 -cert -list all
          -db {{ webseal_keystore }} -stashed
      register: cert_list
      changed_when: false

    - name: Vérifier dates d'expiration
      ansible.builtin.script:
        cmd: scripts/check_cert_expiry.sh {{ webseal_keystore }} {{ alert_threshold_days }}
      register: cert_check
      changed_when: false

    - name: Envoyer alerte si certificats critiques
      ansible.builtin.mail:
        to: "{{ notification_email }}"
        subject: "⚠️ Certificat WebSEAL proche de l'expiration — {{ inventory_hostname }}"
        body: "{{ cert_check.stdout }}"
      when: cert_check.rc != 0
```

### Playbook — Renouvellement de certificat

```yaml
---
# playbooks/renew_webseal_cert.yml
- name: Renouvellement certificat WebSEAL
  hosts: webseal_servers
  serial: 1    # Un serveur à la fois (HA)

  tasks:
    - name: ÉTAPE 1 - Backup du keystore actuel
      ansible.builtin.copy:
        src: "{{ webseal_keystore }}"
        dest: "{{ webseal_keystore }}.bak-{{ ansible_date_time.date }}"
        remote_src: yes
      register: backup_result

    - name: ÉTAPE 2 - Vérification pré-déploiement
      ansible.builtin.command:
        cmd: >
          gsk8capicmd_64 -cert -validate -label "{{ cert_label }}"
          -db {{ new_cert_file }}
      register: cert_validate
      failed_when: cert_validate.rc != 0

    - name: ÉTAPE 3 - Import du nouveau certificat
      ansible.builtin.command:
        cmd: >
          gsk8capicmd_64 -cert -import
          -file {{ new_cert_file }} -type pkcs12
          -target {{ webseal_keystore }} -stashed
          -label "{{ cert_label }}"

    - name: ÉTAPE 4 - Définir comme certificat par défaut
      ansible.builtin.command:
        cmd: >
          gsk8capicmd_64 -cert -setdefault
          -label "{{ cert_label }}"
          -db {{ webseal_keystore }} -stashed

    - name: ÉTAPE 5 - Reload WebSEAL (via API)
      ansible.builtin.uri:
        url: "https://{{ webseal_host }}:9443/wga/reverseproxy/{{ instance }}"
        method: PUT
        body: '{"operation": "restart"}'
        body_format: json
        user: "{{ admin_user }}"
        password: "{{ admin_password }}"
        validate_certs: yes
      register: reload_result

    - name: ÉTAPE 6 - Validation post-déploiement
      ansible.builtin.command:
        cmd: >
          openssl s_client -connect {{ webseal_fqdn }}:443
          -servername {{ webseal_fqdn }} </dev/null 2>/dev/null
          | openssl x509 -noout -dates
      register: validation_result
      delegate_to: localhost

    - name: Vérification date expiration nouveau certificat
      ansible.builtin.assert:
        that:
          - "'notAfter' in validation_result.stdout"
        fail_msg: "ROLLBACK NÉCESSAIRE — Nouveau certificat non détecté !"

    - name: ROLLBACK si échec
      ansible.builtin.command:
        cmd: >
          cp {{ webseal_keystore }}.bak-{{ ansible_date_time.date }}
          {{ webseal_keystore }}
      when: validation_result.rc != 0
```

### Template AWX recommandé

```yaml
# Template AWX : "WebSEAL - Vérification Certificats"
# Exécutable par : N2 (sans approbation)
# Exécutable par : N1 (avec approbation N3)

Paramètres :
  - webseal_env: [production, preprod, dev]
  - alert_threshold: [7, 15, 30] (jours)

Schedule : Quotidien à 08h00

Notifications :
  - Slack : #ops-alertes
  - Email : ops-n3@laposte.fr
  - Si expiration < 7j : PagerDuty (incident automatique)
```

---

## 💻 11 — Commandes essentielles (`pdadmin`)

### Connexion et navigation

```bash
# Se connecter à pdadmin
pdadmin -a sec_master -p [password]
# Ou avec serveur distant
pdadmin -s policy-server.laposte.fr -a sec_master -p [password]

# En mode non-interactif (scripts)
pdadmin -a sec_master -p [password] << EOF
server list
EOF
```

### Gestion des instances WebSEAL

```bash
# Lister les instances WebSEAL
pdadmin> server list

# Voir l'état d'une instance
pdadmin> server show webseald-default

# Redémarrer une instance
pdadmin> server task webseald-default server restart

# Voir les statistiques de performance
pdadmin> server task webseald-default stats show all
```

### Gestion des jonctions

```bash
# Lister les jonctions
pdadmin> server task webseald-default junctions

# Détails d'une jonction
pdadmin> server task webseald-default show /mon-app

# Connections actives sur une jonction
pdadmin> server task webseald-default junction show /mon-app

# Supprimer une jonction
pdadmin> server task webseald-default delete /mon-app

# Throttle (limiter les connexions vers un backend en difficulté)
pdadmin> server task webseald-default throttle /mon-app
```

### Gestion des ACL

```bash
# Lister les ACL
pdadmin> acl list

# Voir une ACL
pdadmin> acl show mon-acl

# Créer une ACL
pdadmin> acl create agents-guichet-acl

# Ajouter une permission
pdadmin> acl modify agents-guichet-acl set group agents-guichet Trx

# Attacher une ACL à une ressource
pdadmin> acl attach /WebSEAL/portail-default/mon-app agents-guichet-acl

# Voir les ACL attachées à un objet
pdadmin> acl find /WebSEAL/portail-default/mon-app
```

### Gestion des utilisateurs

```bash
# Créer un utilisateur
pdadmin> user create jean.dupont cn=jean.dupont,dc=laposte,dc=fr Jean Dupont password

# Modifier un compte
pdadmin> user modify jean.dupont account-valid yes
pdadmin> user modify jean.dupont password-valid yes

# Ajouter à un groupe
pdadmin> group modify agents-guichet add user jean.dupont

# Voir les groupes d'un user
pdadmin> user show jean.dupont
```

### Commandes de diagnostic rapide

```bash
# Vérifier que WebSEAL peut joindre un backend (debug jonction)
pdadmin> server task webseald-default junctions
# Regarder "Current connections" et "Maximum connections"

# Voir les connexions actives au Policy Server
pdadmin> server show webseald-default

# Statistiques globales
pdadmin> server task webseald-default stats show all | grep -E "requests|errors|connections"

# Logs WebSEAL (sur le serveur directement)
tail -f /var/pdweb/log/msg__webseald-default.log
tail -f /var/pdweb/log/request.log
```

---

## 📊 12 — Monitoring et observabilité

### Métriques clés à surveiller

| Métrique | Source | Seuil d'alerte | Criticité |
|----------|--------|----------------|-----------|
| Certificat SSL — jours avant expiration | GSKit / script | < 30 jours | 🔴 Critique |
| Jonctions actives / total configurées | `pdadmin stats` | < 100% des jonctions | 🔴 Critique |
| Connexions actives vers les backends | `pdadmin show` | > 80% du max | 🟠 Élevée |
| Taux d'erreurs HTTP 5xx | Logs access | > 1% | 🟠 Élevée |
| Temps de réponse p99 | Logs access | > 3 secondes | 🟡 Moyenne |
| Sessions utilisateurs actives | `pdadmin stats` | Pic anormal | 🟡 Moyenne |
| CPU / RAM du serveur WebSEAL | Prometheus node_exporter | > 85% | 🟡 Moyenne |

### Parsing des logs WebSEAL pour ELK/Splunk

```
# Format des logs d'accès WebSEAL (msg__webseald-default.log)
# Exemple de ligne :
2026-04-09 08:45:12 [8765] 0x00000000 webseal INFO msg: 
Request from 192.168.1.100 - jean.dupont@laposte.fr
"GET /mon-compte/profil HTTP/1.1" 200 4521 bytes
junction: /mon-compte target: app-backend:8080 elapsed: 145ms
```

```
# Grok pattern Logstash pour parser ces logs
grok {
  match => {
    "message" => [
      "%{TIMESTAMP_ISO8601:timestamp} \[%{NUMBER:thread}\] .* Request from %{IP:client_ip} - %{DATA:username} \"%{WORD:method} %{DATA:uri} HTTP/%{NUMBER:http_version}\" %{NUMBER:status_code} %{NUMBER:bytes} bytes junction: %{DATA:junction} target: %{HOSTNAME:backend_host}:%{NUMBER:backend_port} elapsed: %{NUMBER:response_time_ms}ms"
    ]
  }
}
```

### Dashboard Grafana — Métriques recommandées

```
Panel 1 : Certificats SSL — Jours avant expiration (Bar chart)
  → Alerte visuelle rouge si < 30 jours

Panel 2 : Taux de succès des requêtes (2xx+3xx vs 4xx+5xx) (Time series)
  → Référence : 99.9% de succès attendu

Panel 3 : Temps de réponse p50 / p95 / p99 (Time series)
  → Baseline à établir sur 2 semaines

Panel 4 : Connexions actives par jonction (Gauge)
  → Alerte si > 80% de la limite configurée

Panel 5 : Top 10 des URIs les plus lentes (Table)
  → Identifier les goulots d'étranglement

Panel 6 : Sessions actives (Time series)
  → Corrélé avec les pics d'activité métier connus
```

---

## 🎯 13 — Préparation entretien — Questions / Réponses

### Questions techniques fréquentes

---

**Q : Expliquez-moi ce qu'est une jonction WebSEAL et pourquoi c'est important.**

*R :* Une jonction est le lien que WebSEAL crée avec un serveur applicatif backend. Tout le trafic destiné à ce backend passe obligatoirement par WebSEAL, qui applique sa politique de sécurité avant de transmettre. C'est l'outil central qui permet à WebSEAL de "proxyfier" et sécuriser n'importe quelle application web sans la modifier. Il existe plusieurs types — standard, transparent et virtual host — chacun avec des comportements différents sur la réécriture d'URLs.

---

**Q : Quelle est la différence entre une jonction standard et une jonction transparente ?**

*R :* Avec une jonction standard, WebSEAL retire le préfixe du chemin de jonction avant de transmettre la requête au backend. Par exemple, `/mon-app/page` devient `/page`. Cela peut casser les liens absolus dans les applications. Avec une jonction transparente (`-x`), le chemin complet est conservé — `/mon-app/page` reste `/mon-app/page`. C'est recommandé pour les applications modernes qui utilisent des liens absolus.

---

**Q : Comment WebSEAL gère-t-il le SSO avec des applications IBM WebSphere ?**

*R :* Via des tokens LTPA (Lightweight Third-Party Authentication). WebSEAL génère un token LTPA après authentification de l'utilisateur, et l'injecte dans les requêtes vers les backends WebSphere. Ces backends partagent la même clé de chiffrement et peuvent valider le token sans re-demander de credentials. La clé LTPA est configurée sur la jonction avec les paramètres `-A -F fichier_clé -Z password`.

---

**Q : Un certificat WebSEAL expire dans 3 jours en production. Quelle est votre procédure ?**

*R :*
1. **Alerte immédiate** à l'équipe et au responsable de mission — c'est un incident P1 potentiel
2. **Commande d'urgence** du nouveau certificat à la PKI (avec justification d'urgence)
3. **Préparation** : backup du keystore actuel, préparation de l'environnement de test
4. **Test en préprod** si délai le permet (même 1h de test vaut mieux que rien)
5. **Import en production** avec GSKit (`gsk8capicmd_64 -cert -import...`)
6. **Définir comme défaut** et reload WebSEAL (si HA : un nœud à la fois)
7. **Validation externe** : `openssl s_client -connect portail.laposte.fr:443` pour confirmer le nouveau certificat
8. **Post-mortem** : pourquoi l'alerte J-30 n'a-t-elle pas fonctionné ?

---

**Q : Comment automatiseriez-vous la surveillance des certificats WebSEAL ?**

*R :* Je créerais un workflow AWX exécuté quotidiennement, composé d'un playbook Ansible qui : (1) parcourt les keystores sur toutes les instances WebSEAL via GSKit, (2) calcule les jours restants avant expiration, (3) envoie des alertes graduées — notification Slack à J-30, mail à l'équipe à J-15, création automatique d'un ticket ITSM à J-7. Le playbook est idempotent et loggé dans AWX pour traçabilité. Je documenterais aussi le playbook de renouvellement pour que N2 puisse l'exécuter avec approbation.

---

**Q : Quel est le risque principal si le Policy Server ISAM est indisponible ?**

*R :* Par défaut, WebSEAL fonctionne en mode "fail-closed" : si le Policy Server ne répond pas, WebSEAL refuse toutes les requêtes par sécurité. C'est une interruption de service totale. Les mitigations sont : Policy Server en HA avec un replica, timeout bien configuré pour les décisions locales en cache, et monitoring proactif du Policy Server avant WebSEAL.

---

**Q : Comment détectez-vous une dérive de configuration sur WebSEAL ?**

*R :* La dérive est un risque réel avec les appliances IBM car certaines configurations peuvent être modifiées via l'interface graphique LMI sans passer par les playbooks. Mon approche : (1) versionner toutes les configurations dans Git comme référence de vérité, (2) créer un playbook Ansible de "compliance check" qui compare l'état réel (lu via l'API WebSEAL) avec l'état attendu (variables Ansible), (3) exécuter ce check quotidiennement via AWX et alerter sur toute divergence, (4) documenter les exceptions légitimes dans le code avec commentaires.

---

**Q : Quelle vulnérabilité vous préoccupe le plus sur WebSEAL ?**

*R :* Plusieurs risques me préoccupent. Le plus immédiat et évitable : l'expiration de certificats sans surveillance automatisée — c'est un P1 qui arrive régulièrement. Le plus sournois : l'injection de headers d'identité si le filtrage des headers `iv-*` entrants n'est pas activé — un attaquant peut se faire passer pour n'importe quel utilisateur. Et sur les versions récentes d'ISVA, des vulnérabilités sérieuses ont été découvertes (32 CVEs en 2022-2024), donc le patch management est critique.

---

**Q : Quelle est votre approche pour réduire le "Bus Factor" sur ce socle ?**

*R :* C'est exactement l'approche Docs-as-Code que je veux implémenter : chaque action effectuée sur le socle est documentée dans un runbook versionné dans Git, co-localisé avec les playbooks Ansible correspondants. Je crée les runbooks pour les 10 incidents les plus fréquents, je les teste avec les équipes N2, et j'organise des guildes mensuelles pour les mettre à jour. L'objectif : dans 6 mois, N2 peut traiter 70% des incidents courants sans escalade N3, et un nouveau N3 peut être opérationnel en 2 semaines maximum.

---

### Terminologie à maîtriser en entretien

| Terme | Explication rapide |
|-------|-------------------|
| **pdadmin** | Outil CLI d'administration WebSEAL / ISAM |
| **webseald** | Démon principal WebSEAL |
| **GSKit** | Toolkit IBM pour la gestion des keystores (certificats) |
| **LMI** | Local Management Interface — interface web d'administration de l'appliance |
| **ISAM / ISVA** | IBM Security Access Manager / Verify Access — suite incluant WebSEAL |
| **LTPA** | Token d'authentification partagé entre composants IBM |
| **sec_master** | Compte administrateur principal ISAM (à protéger absolument) |
| **POP** | Protected Object Policy — règles supplémentaires sur un objet (IP, MFA...) |
| **ACL** | Access Control List — qui peut faire quoi sur quelle ressource |
| **Junction** | Connexion WebSEAL vers un backend applicatif |
| **fail-closed** | Comportement de sécurité : en cas de doute, bloquer plutôt qu'autoriser |
| **DRS** | Dynamic Routing Service — service de réplication de sessions pour HA |

---

> 📌 **Note finale**
>
> Ce document est un support vivant à enrichir au fil des échanges terrain. Les commandes `pdadmin` et les chemins de fichiers peuvent varier selon la version du produit et la configuration de l'appliance La Poste.
>
> Priorité immédiate en mission : **audit des certificats et des jonctions existantes**, puis construction des runbooks manquants avec l'équipe.

---

*Documentation pédagogique IBM WebSEAL — Mission OPS N3 / Socle STCA — La Poste BGPN*
*Version 1.0 — Avril 2026 — Ouvert à révision*
