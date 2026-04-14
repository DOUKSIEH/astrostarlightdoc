---
title: "🛡️ SIEM : Graylog · Wazuh · Suricata"
description: "Documentation Pédagogique — Installation · Architecture · Sécurité · Bonnes Pratiques · Comparaison Cloud"
created: "2026-04-10"
# updated: "2026-04-04"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"

---
<!-- # 🛡️ Documentation Pédagogique Complète — SIEM Open Source
## Graylog · Wazuh · Suricata
### Installation · Architecture · Sécurité · Bonnes Pratiques · Comparaison Cloud

--- -->

> **📖 À qui s'adresse ce document ?**
>
> Ce guide est destiné à **tout public** : débutants en cybersécurité, administrateurs systèmes, responsables SSI, analystes SOC, ingénieurs DevSecOps, étudiants, DSI, ou simplement curieux. Chaque concept technique est expliqué avec des **analogies du quotidien** avant d'entrer dans le détail.
> Aucun prérequis avancé n'est nécessaire pour comprendre les grandes lignes.

---

## 📋 Table des matières

1. [Introduction — Qu'est-ce qu'un SIEM ?](#1-introduction)
2. [Graylog — Présentation complète](#2-graylog)
   - 2.1 Histoire
   - 2.2 Architecture
   - 2.3 Concepts fondamentaux
   - 2.4 **Graylog Open vs Graylog Security — Comprendre la différence**
   - 2.5 **Graylog Security — Module SIEM avancé (détail complet)**
   - 2.6 Comparaison Graylog vs ELK vs IBM QRadar vs Splunk
   - 2.7 Avantages & Inconvénients (vision DevSecOps)
   - 2.8 **Installation complète sur Linux**
   - 2.9 **Bonnes pratiques, recommandations et limites**
3. [Wazuh — Présentation complète](#3-wazuh)
   - 3.1 Histoire
   - 3.2 Architecture
   - 3.3 Concepts fondamentaux
   - 3.4 Avantages & Inconvénients
   - 3.5 **Installation complète sur Linux**
   - 3.6 **Bonnes pratiques, recommandations et limites**
4. [Suricata — Présentation complète](#4-suricata)
   - 4.1 Histoire
   - 4.2 Architecture
   - 4.3 Concepts fondamentaux
   - 4.4 Avantages & Inconvénients
   - 4.5 **Installation complète sur Linux**
   - 4.6 **Bonnes pratiques, recommandations et limites**
5. [La Sainte Trinité SOC — Graylog + Wazuh + Suricata](#5-trinite-soc)
   - 5.1 Pourquoi combiner les trois ? Le cas pratique
   - 5.2 Architecture de production recommandée
   - 5.3 Flux d'un incident réel — De l'attaque à l'alerte
   - 5.4 Intégration technique (conteneurs / VM)
   - 5.5 Avantages & Inconvénients du combo
   - 5.6 Dimensionnement
6. [Cas d'usage par secteur](#6-cas-dusage)
7. [Comparaison avec les solutions Cloud (Azure & AWS)](#7-comparaison-cloud)
8. [Tendances du marché](#8-tendances)
9. [Tableau récapitulatif final](#9-recapitulatif)
10. [Glossaire](#10-glossaire)
11. [Ressources pour aller plus loin](#11-ressources)

---

## 1. Introduction — Qu'est-ce qu'un SIEM ? {#1-introduction}

### 🎯 Définition simple

**SIEM = Security Information and Event Management**
(en français : Gestion des Informations et des Événements de Sécurité)

> 💡 **Analogie du commissariat de police :**
> Imaginez une grande ville avec des caméras de surveillance, des capteurs d'alarme, des agents de patrouille à pied, des radars automatiques et des portiques de sécurité à chaque entrée. Chaque dispositif, seul, ne voit qu'une infime partie de la ville.
>
> Le **SIEM**, c'est la **salle de commandement centrale** : elle reçoit en temps réel toutes les alertes de tous les dispositifs, les corrèle ("la caméra A a vu un homme en rouge, le radar B a détecté une voiture suspecte au même endroit 5 minutes après..."), les archive pendant des années, et permet aux enquêteurs de remonter le fil d'un incident — même plusieurs semaines après les faits.

Un SIEM remplit deux grandes missions :

| Mission | Description |
|---|---|
| **SIM** — Security Information Management | Collecter, stocker et archiver les logs à long terme |
| **SEM** — Security Event Management | Détecter, corréler et alerter sur les événements en temps réel |

### 🧱 Les briques d'un écosystème SOC open source

```
┌────────────────────────────────────────────────────────────────┐
│                     RÉSEAU & SYSTÈMES                          │
│    Serveurs · Postes Windows/Linux · Firewall · Cloud · IoT    │
└──────────┬───────────────────────────────┬─────────────────────┘
           │  Logs (fichiers, événements)   │  Trafic réseau (paquets)
           ▼                               ▼
    ┌─────────────┐                 ┌─────────────┐
    │   WAZUH     │                 │  SURICATA   │
    │  Agent EDR  │                 │  IDS / IPS  │
    │  (sur hôte) │                 │  (réseau)   │
    └──────┬──────┘                 └──────┬──────┘
           │                              │
           └──────────────┬───────────────┘
                          │  Alertes & logs centralisés
                          ▼
                   ┌─────────────┐
                   │   GRAYLOG   │
                   │    SIEM     │
                   │  (cerveau)  │
                   └──────┬──────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
         📊 Dashboards  🔔 Alertes  🔍 Investigation
         Temps réel    Email/Slack  Forensics
```

### 🌡️ Pourquoi ces trois outils ensemble ?

Chaque outil couvre une couche différente — ils sont **complémentaires**, jamais redondants :

| Outil | Couche surveillée | Question fondamentale | Analogie |
|---|---|---|---|
| **Suricata** | Réseau (trafic) | "Qui parle à qui sur le réseau ?" | Caméras aux carrefours |
| **Wazuh** | Hôte (serveurs/postes) | "Que se passe-t-il à l'intérieur des machines ?" | Agent de sécurité dans chaque bâtiment |
| **Graylog** | Centralisation & corrélation | "Quel est le tableau d'ensemble ?" | Salle de commandement |

> 💡 **Analogie médicale :**
> - Suricata = l'**électrocardiogramme** (flux sanguin / réseau)
> - Wazuh = les **analyses de sang** (état interne / hôtes)
> - Graylog = le **médecin généraliste** qui lit tous les résultats et pose le diagnostic

---

## 2. Graylog {#2-graylog}

### 📜 2.1 Histoire

| Année | Événement clé |
|---|---|
| **2009** | Lennart Koopmann (Hambourg, Allemagne) crée un collecteur de logs personnel, frustré par les limites de syslog |
| **2010** | Première version publiée sur GitHub sous le nom "Graylog2" |
| **2012** | Fondation de **Torch Networks**, devenue ensuite **Graylog Inc.** |
| **2014** | Graylog 0.91 — première interface web stable |
| **2016** | Graylog 2.0 — intégration native d'Elasticsearch pour la recherche plein texte |
| **2018** | Graylog 3.0 — dashboards dynamiques, pipeline avancé |
| **2020** | Graylog 4.0 — refonte interface, nouveau moteur d'alertes |
| **2021** | **Graylog Security** — module SIEM dédié avec corrélation d'événements |
| **2023** | Graylog 5.x — **Illuminate** (packs de contenus sectoriels pré-configurés) |
| **2024** | Plus de **50 000 installations** actives dans le monde |

> 💡 **Contexte historique :**
> Avant Graylog, les administrateurs "lisaient" leurs logs en faisant `grep` dans des fichiers texte. Imaginez chercher une aiguille dans une botte de foin de 10 millions de lignes. Graylog a transformé cette expérience en créant un **moteur de recherche pour les logs**, comparable à ce que Google est pour le Web.

---

### 🏗️ 2.2 Architecture de Graylog

```
┌──────────────────────────────────────────────────────────────┐
│                     GRAYLOG SERVER NODE                      │
│                                                              │
│  ┌──────────────┐    ┌────────────────┐   ┌──────────────┐  │
│  │    INPUTS    │───▶│   PROCESSING   │──▶│   OUTPUTS    │  │
│  │  (réception) │    │   (pipelines)  │   │ (destinations│  │
│  │  GELF/Syslog │    │  Enrichissement│   │  Alertes...  │  │
│  │  Beats/CEF   │    │  Filtrage      │   │              │  │
│  └──────────────┘    └────────────────┘   └──────────────┘  │
└──────────────────────────────────────────────────────────────┘
         │  Configuration                  │  Recherche/Stockage
         ▼                                 ▼
  ┌──────────────┐                 ┌──────────────────┐
  │   MongoDB    │                 │  Elasticsearch   │
  │              │                 │  ou OpenSearch   │
  │ - Config     │                 │                  │
  │ - Metadata   │                 │ - Tous les logs  │
  │ - Streams    │                 │ - Index par date │
  │ - Dashboards │                 │ - Plein texte    │
  └──────────────┘                 └──────────────────┘
                                           ▲
                                   ┌───────┴──────┐
                                   │  Interface   │
                                   │    Web       │
                                   │  (port 9000) │
                                   └──────────────┘
```

**Description des composants :**

| Composant | Rôle détaillé | Analogie |
|---|---|---|
| **Graylog Server** | Cœur du système : reçoit, traite, indexe les messages | Le chef d'orchestre |
| **MongoDB** | Stocke la configuration (streams, dashboards, alertes) — PAS les logs | Le carnet de notes |
| **Elasticsearch / OpenSearch** | Stocke et indexe TOUS les messages — permet la recherche | La bibliothèque géante |
| **Interface Web** | Tableau de bord, recherche, gestion (port 9000 par défaut) | L'écran de pilotage |

> 💡 **Pourquoi 3 services distincts ?**
> MongoDB est rapide pour les petites données structurées (config). Elasticsearch est optimisé pour indexer des milliards de messages texte. Graylog Server est l'intelligence qui lie tout ça. C'est comme avoir un comptable (MongoDB), une archive géante (Elasticsearch) et un directeur (Graylog).

---

### ⚙️ 2.3 Concepts fondamentaux

#### 📥 Les Inputs (Entrées)

> 💡 **Analogie :** Un Input, c'est comme une **boîte aux lettres spécialisée**. Vous pouvez avoir une boîte pour les lettres recommandées (Syslog TCP), une pour les colis (GELF), une pour les emails (Beats)... Chaque boîte accepte un format particulier, sur un port particulier.

| Input | Port par défaut | Usage typique |
|---|---|---|
| **GELF TCP/UDP** | 12201 | Format natif Graylog — structuré JSON |
| **Syslog UDP** | 514 | Équipements réseau, Linux, anciens systèmes |
| **Syslog TCP** | 514 | Syslog fiable (avec accusé de réception) |
| **Beats** | 5044 | Agents Elastic : Filebeat, Winlogbeat, Auditbeat |
| **CEF (ArcSight)** | 5555 | Firewalls, antivirus, produits de sécurité |
| **Raw/Plaintext** | 5555 | Applications custom, scripts |
| **AMQP/Kafka** | variable | Architectures haute disponibilité |

#### 🔄 Les Streams (Flux de routage)

> 💡 **Analogie :** Les **tapis roulants d'un aéroport**. Chaque tapis est dédié à une destination : tapis 1 pour Paris, tapis 2 pour Londres. Graylog route chaque message vers le bon "tapis" selon des règles.

Les streams permettent de : séparer les logs par origine, appliquer des permissions différentes par équipe, stocker dans des index avec des rétentions différentes, et déclencher des alertes spécifiques.

#### 🔎 Les Pipelines (Traitement des messages)

> 💡 **Analogie :** La chaîne de montage automobile. Chaque "station" fait une opération précise — extraire un champ, géolocaliser une IP, ajouter un tag de conformité.

```
Message brut reçu
      ▼ [Stage 0]
  Règle 1 : Extraire l'adresse IP du message texte brut
      ▼ [Stage 1]
  Règle 2 : Géolocaliser l'IP (pays, ville)
  Règle 3 : Consulter une liste noire (threat intelligence)
      ▼ [Stage 2]
  Règle 4 : Classifier le niveau de risque
  Règle 5 : Ajouter des champs de conformité (PCI-DSS, GDPR)
      ▼
Message enrichi stocké dans Elasticsearch
```

#### 🔔 Les Alertes

> 💡 **Analogie :** Le **détecteur incendie intelligent** — pas n'importe quelle fumée ne déclenche l'alarme, seulement une combinaison précise de conditions.

| Type d'alerte | Description | Exemple |
|---|---|---|
| **Seuil (Count)** | Nombre de messages dépassant un seuil | > 10 échecs SSH en 5 min |
| **Corrélation** | Plusieurs événements liés entre eux | Scan + connexion + élévation privilege |
| **Absence (Missing)** | Aucun log reçu sur une période | Serveur critique silencieux depuis 15 min |
| **Valeur statistique** | Moyenne/percentile anormale | Temps de réponse 10x supérieur à la normale |

Destinations d'alertes : `Email · Slack · PagerDuty · OpsGenie · Teams · HTTP Webhook · Jira · ServiceNow`

#### 🔍 Le langage de recherche (Lucene)

```lucene
# Recherche simple
ssh failed

# Recherche dans un champ précis
source:web-server-01 AND level:ERROR

# Plage de valeurs
http_response_code:[400 TO 599]

# Exclusion
NOT source:monitoring-bot

# Wildcards
source:web-* AND message:*injection*
```

---

### 🔀 2.4 Graylog Open vs Graylog Security — Comprendre la différence fondamentale {#graylog-open-vs-security}

> 💡 **C'est ici que la définition de "SIEM" devient précise et importante.**

#### Le problème de la confusion fréquente

Beaucoup de personnes installent Graylog Open et pensent avoir un SIEM complet. C'est partiellement vrai, mais la réalité est plus nuancée. Voici la distinction claire :

```
┌─────────────────────────────────────────────────────────────────┐
│                    GRAYLOG OPEN (Gratuit)                       │
│                    "SIEM-Light" / Gestionnaire de logs          │
│                                                                 │
│  ✅ Collecte et centralise les logs de partout                  │
│  ✅ Recherche ultra-rapide (milliards de messages)              │
│  ✅ Dashboards et visualisations personnalisables               │
│  ✅ Alertes basiques (seuil, absence, statistiques)             │
│  ✅ Pipelines d'enrichissement des données                      │
│  ✅ RGPD (anonymisation, rétention configurable)                │
│                                                                 │
│  ❌ Pas de règles de détection pré-configurées                  │
│  ❌ Pas de corrélation d'événements avancée                     │
│  ❌ Pas de Threat Intelligence intégrée                         │
│  ❌ Pas de gestion d'enquêtes (case management)                 │
│  ❌ Pas de détection comportementale (UEBA)                     │
│  ❌ Sigma Rules non supportées nativement                       │
│                                                                 │
│  → Tu dois créer TOUTES tes règles de sécurité à la main       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                 GRAYLOG SECURITY (Payant)                       │
│                    Vrai SIEM                                    │
│                                                                 │
│  ✅ TOUT ce que fait Graylog Open, PLUS :                       │
│  ✅ Sigma Rules — règles de détection standard industrie        │
│  ✅ Corrélation d'événements avancée (séquentielle, temporelle) │
│  ✅ UEBA — analyse comportementale utilisateurs/entités         │
│  ✅ Threat Intelligence intégrée (MISP, OTX, Abuse.ch...)      │
│  ✅ Case Management — gestion complète des enquêtes             │
│  ✅ Illuminate — packs contenus sectoriels pré-configurés       │
│  ✅ Asset Inventory & Risk Scoring                              │
│  ✅ Rapports de conformité automatiques (PCI, RGPD, NIS2...)   │
│  ✅ Anomaly Detection (ML)                                      │
│                                                                 │
│  → Prêt à l'emploi pour un SOC professionnel                   │
└─────────────────────────────────────────────────────────────────┘
```

#### Tableau comparatif officiel

| Fonctionnalité | Graylog Open | Graylog Security |
|---|---|---|
| Collecte logs (tous formats) | ✅ | ✅ |
| Recherche plein texte | ✅ | ✅ |
| Dashboards personnalisés | ✅ | ✅ |
| Alertes basiques | ✅ | ✅ |
| Pipelines d'enrichissement | ✅ | ✅ |
| Corrélation d'événements | ❌ | ✅ |
| Sigma Rules | ❌ | ✅ |
| Threat Intelligence | ❌ | ✅ |
| UEBA comportemental | ❌ | ✅ |
| Case Management | ❌ | ✅ |
| Illuminate (packs) | Partiel | ✅ Complet |
| Asset Inventory | ❌ | ✅ |
| Rapports conformité auto | ❌ | ✅ |
| Anomaly Detection (ML) | ❌ | ✅ |
| **Niveau SIEM** | **SIEM-Light** | **SIEM Complet** |
| **Coût** | **Gratuit** | **Payant (abonnement)** |

> 💡 **Conseil pour les petites structures :**
> Graylog Open + Wazuh + Suricata bien configurés couvrent **70 à 80% des besoins SOC** d'une PME, sans aucun coût de licence. Wazuh "compense" les manques de Graylog Open en apportant la détection sur les hôtes avec ses propres règles pré-configurées.

---

### 🔐 2.5 Graylog Security — Module SIEM Avancé (détail complet) {#graylog-security}

> 💡 **Analogie globale :**
> Si Graylog Open est le **bibliothécaire** qui range et retrouve tous les livres, **Graylog Security** ajoute un **détective privé** qui parcourt en permanence la bibliothèque, établit des connexions entre des livres apparemment sans lien, identifie les schémas d'activité suspects et génère automatiquement des dossiers d'enquête complets.

---

#### 🎯 2.5.1 Le Moteur de Corrélation d'Événements

> 💡 **Analogie :** C'est le **détective qui relie les indices**. Chaque log seul n'est pas alarmant. Mais si dans les 10 dernières minutes un utilisateur fait 50 tentatives de connexion échouées, puis réussit, puis accède à 200 fichiers, puis lance un outil de compression ZIP... Le moteur voit cette séquence et génère une alerte critique "Brute Force suivi d'exfiltration possible".

```
┌─────────────────────────────────────────────────────────┐
│              MOTEUR DE CORRÉLATION                      │
│                                                         │
│  Événement 1 : Échec auth SSH (src: 1.2.3.4)           │
│  Événement 2 : Échec auth SSH (src: 1.2.3.4) x49       │
│  Événement 3 : Succès auth SSH (src: 1.2.3.4)          │
│  Événement 4 : Commande "cat /etc/shadow" détectée      │
│  Événement 5 : Connexion sortante vers IP inconnue      │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  RÈGLE DE CORRÉLATION :                         │   │
│  │  IF events 1+2 (count>10) THEN 3               │   │
│  │  AND event 4 within 5 min                       │   │
│  │  AND event 5 within 10 min                      │   │
│  │  → ALERT: "Brute Force + Compromise"            │   │
│  │  Severity: CRITICAL                             │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Types de corrélations supportées :**

| Type | Description | Exemple |
|---|---|---|
| **Séquentielle** | A puis B puis C dans un ordre précis | Login → Privilege escalation → Data access |
| **Temporelle** | X événements en Y minutes | 100 requêtes DNS en 1 minute |
| **Par entité** | Même IP / même user dans plusieurs événements | Un utilisateur sur 3 systèmes différents en 2 min |
| **Absence** | A se produit mais B n'arrive pas | Login sans logout correspondant |
| **Statistique** | Déviation par rapport à la baseline | Trafic 10x supérieur à la moyenne |

---

#### 🧠 2.5.2 UEBA — Analyse Comportementale

> 💡 **Analogie :** Un employé de banque travaille tous les jours de 9h à 18h, depuis Paris. Un jour, à 3h du matin, depuis Tokyo, quelqu'un utilise ses identifiants et consulte 5 000 dossiers en 10 minutes. Même si le mot de passe est correct, c'est **anormal**. L'UEBA détecte cette anomalie comportementale sans avoir besoin d'une règle explicite.

```
┌─────────────────────────────────────────────────────────────┐
│                    PROFIL COMPORTEMENTAL                    │
│                                                             │
│  👤 Utilisateur "jean.dupont@banque.fr"                     │
│  Horaires habituels    : Lun-Ven, 08h30-19h00              │
│  Localisations         : Paris (IP 192.168.x.x)            │
│  Applications accédées : CRM, Email, ERP                   │
│  Volume données/jour   : ~500 Mo                           │
│                                                             │
│  🚨 ANOMALIE DÉTECTÉE                                       │
│  Connexion à 02:47 depuis IP 185.x.x.x (Russie)            │
│  Téléchargement de 8 Go depuis serveur RH                  │
│  Score de risque: 97/100 → ALERTE CRITIQUE                 │
└─────────────────────────────────────────────────────────────┘
```

**Dimensions comportementales analysées :**

| Dimension | Indicateurs |
|---|---|
| **Temporel** | Heure de connexion, durée de session, fréquence |
| **Géographique** | Pays/ville, déplacement impossible (Paris→Tokyo en 30 min) |
| **Volumétrique** | Quantité de données accédées/téléchargées |
| **Applicatif** | Applications utilisées hors du profil habituel |
| **Réseau** | Protocoles, destinations inhabituelles |
| **Privilèges** | Élévation de droits, accès à des ressources sensibles |

---

#### 🌐 2.5.3 Threat Intelligence (Renseignement sur les Menaces)

> 💡 **Analogie :** C'est le **fichier des personnes recherchées** partagé entre tous les commissariats du monde. Si une adresse IP figure dans vos logs ET dans ces listes noires, Graylog Security génère immédiatement une alerte.

**Sources de Threat Intelligence intégrables :**

| Source | Type de données | Mise à jour |
|---|---|---|
| **AlienVault OTX** | IPs, domaines, fichiers malveillants | Temps réel |
| **MISP** | IOCs structurés (partagés entre CERTs) | Configurable |
| **Abuse.ch** | Ransomware, botnet, malware | Quotidienne |
| **Emerging Threats** | Règles réseau | Quotidienne |
| **Custom feeds** | Listes internes | Manuel |

**Flux de vérification TI :**
```
Log entrant avec src_ip = 185.220.101.33
         ▼
  [Lookup Table TI]
  "Est-ce que 185.220.101.33 est dans une liste noire ?"
         ├── OUI → Enrichir : catégorie "Tor Exit Node", score 95/100
         │          → Déclencher alerte "IOC détecté"
         └── NON → Traitement normal
```

---

#### 🗂️ 2.5.4 Case Management — Gestion des Enquêtes

> 💡 **Analogie :** C'est le **dossier d'enquête judiciaire**. Quand un détective ouvre une enquête, il rassemble toutes les preuves dans un même dossier. Graylog Security permet de créer des "cases" qui regroupent tous les événements liés à un incident.

```
┌──────────────────────────────────────────────────────────────┐
│  CASE #2024-0142 : "Suspected Ransomware - Serveur PROD-01"  │
│  Statut: IN_PROGRESS  Priorité: CRITICAL  Assigné: A.Martin  │
├──────────────────────────────────────────────────────────────┤
│  📅 TIMELINE                                                  │
│  14:32 - FIM alerte : 2 847 fichiers modifiés en 3 min       │
│  14:33 - Wazuh : Process "vssadmin delete shadows" détecté   │
│  14:34 - Suricata : Connexion sortante port 443 → IP TOR     │
│  14:35 - Graylog Security : Alerte corrélation générée       │
│  14:40 - Analyste : Machine isolée du réseau                 │
│                                                              │
│  🔍 PREUVES RATTACHÉES                                        │
│  - 4 827 événements Wazuh filtrés                            │
│  - 12 alertes Suricata                                       │
│  - Capture réseau (PCAP) : 45 Mo                             │
│                                                              │
│  ✅ ACTIONS RÉALISÉES                                         │
│  [x] Isolation réseau      [x] Snapshot VM                  │
│  [x] Notification RSSI     [ ] Dépôt plainte ANSSI           │
└──────────────────────────────────────────────────────────────┘
```

---

#### 📐 2.5.5 Sigma Rules — Le Standard Universel de Détection

> 💡 **Analogie :** Sigma est comme une **recette de cuisine universelle**. Si vous écrivez une recette en Sigma, n'importe quel chef (Graylog, Splunk, Elastic SIEM, Microsoft Sentinel) peut la lire et la reproduire. Plus besoin de réécrire vos règles de détection pour chaque outil.

**Exemple de règle Sigma :**
```yaml
title: Détection de Mimikatz (outil de vol de mots de passe)
status: stable
description: Détecte l'utilisation de Mimikatz sur Windows
logsource:
    category: process_creation
    product: windows
detection:
    selection:
        CommandLine|contains:
            - 'sekurlsa::logonpasswords'
            - 'lsadump::sam'
            - 'kerberos::golden'
    condition: selection
level: critical
tags:
    - attack.credential_access
    - attack.t1003
```

Graylog Security importe et convertit automatiquement ces règles Sigma en règles de détection natives. Le repository officiel contient **+3 000 règles** gratuites : https://github.com/SigmaHQ/sigma

---

#### 📦 2.5.6 Illuminate — Les Packs de Contenus Sectoriels

> 💡 **Analogie :** C'est le **kit de démarrage professionnel** — au lieu de partir de zéro, Illuminate vous fournit des dashboards, des règles et des parsers déjà configurés pour les sources les plus courantes.

| Pack | Contenu | Pour qui |
|---|---|---|
| **Windows** | Event ID critiques, Sysmon, Active Directory | Toutes entreprises |
| **Linux/Unix** | Auth, Sudo, Cron, SSH | Admin système |
| **Firewall** | Palo Alto, Cisco ASA, Fortinet, pfSense | Équipes réseau |
| **AWS** | CloudTrail, GuardDuty, VPC Flow Logs | Cloud teams |
| **Microsoft 365** | Azure AD, Exchange, Teams | Équipes M365 |
| **Wazuh** | Alertes Wazuh pré-parsées | SOC |
| **Suricata** | EVE JSON pré-parsé | SOC réseau |

---

#### 🏷️ 2.5.7 Architecture de Graylog Security

```
┌────────────────────────────────────────────────────────────────┐
│                    GRAYLOG SECURITY PLATFORM                   │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                COUCHE DE DÉTECTION                        │ │
│  │  Sigma Rules · UEBA Engine · TI Lookup · Corrélation     │ │
│  └──────────────────────────────────────────────────────────┘ │
│                           │                                    │
│  ┌────────────────────────▼─────────────────────────────────┐ │
│  │                COUCHE DE RÉPONSE                          │ │
│  │  Case Manager · Illuminate · Rapports Conformité         │ │
│  │  Asset Inventory · Anomaly Detection                     │ │
│  └──────────────────────────────────────────────────────────┘ │
│                           │                                    │
│  ┌────────────────────────▼─────────────────────────────────┐ │
│  │          GRAYLOG OPEN (Collecte + Stockage)               │ │
│  │       Inputs · Pipelines · Streams · Alertes basiques    │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

---

#### 💰 2.5.8 Modèle de licence Graylog

```
┌───────────────┬──────────────────┬────────────────────────────┐
│  Open Source  │   Operations     │         Security           │
│   (Gratuit)   │   (Payant ~$)    │     (Payant $$)            │
├───────────────┼──────────────────┼────────────────────────────┤
│ Collecte logs │ Archivage long   │ ✅ Moteur de corrélation   │
│ Recherche     │ terme            │ ✅ UEBA                    │
│ Dashboards    │ Rapports avancés │ ✅ Threat Intelligence      │
│ Alertes       │ Alertes avancées │ ✅ Sigma Rules             │
│ Pipelines     │ Support pro      │ ✅ Case Management         │
│               │                  │ ✅ Illuminate complet      │
│               │                  │ ✅ Conformité auto         │
│               │                  │ ✅ Asset Inventory         │
└───────────────┴──────────────────┴────────────────────────────┘
```

---

### ⚔️ 2.6 Graylog vs ELK vs IBM QRadar vs Splunk {#graylog-vs-concurrents}

> 💡 **Contexte DevSecOps :**
> En tant qu'ingénieur DevSecOps, choisir son SIEM est une décision stratégique. Voici une comparaison honnête des alternatives les plus courantes.

#### Graylog vs ELK Stack (Elasticsearch + Logstash + Kibana)

> 💡 **Analogie :**
> ELK, c'est comme acheter tous les matériaux d'une cuisine dans une grande surface de bricolage : vous avez tout ce qu'il faut pour construire quelque chose d'excellent, mais vous devez assembler vous-même chaque meuble, chaque tuyau, chaque câble. Graylog, c'est la cuisine semi-équipée : elle est déjà partiellement montée, et les pièces s'assemblent plus intuitivement.

| Critère | Graylog Open | ELK Stack |
|---|---|---|
| **Installation** | Relativement simple (3 composants) | Complexe (4+ composants + config) |
| **Interface web** | Intuitive, orientée sécurité | Kibana : puissante mais généraliste |
| **Prêt pour la sécurité** | ✅ Dès l'installation | ❌ Nécessite Elastic SIEM add-on |
| **Format natif** | GELF (JSON structuré) | Flexible (mais à configurer) |
| **Alerting** | ✅ Natif et simple | ⚠️ Watcher (complexe) ou Elastic Alerts |
| **Pipelines** | ✅ GUI + DSL simple | Logstash : puissant mais config lourde |
| **Coût** | Gratuit (open) | Gratuit (mais Elastic SIEM = payant) |
| **Communauté** | Bonne | Excellente (plus grande) |
| **SIEM natif** | ⚠️ Security add-on payant | ⚠️ Elastic Security (payant au-delà du base) |
| **Scalabilité** | Bonne | Excellente |

**Verdict :** Pour commencer un SOC rapidement avec peu de ressources, Graylog est plus direct. ELK offre plus de flexibilité mais demande plus de travail de configuration. **Pour un vrai SIEM, les deux nécessitent leur module payant ou Wazuh en complément.**

---

#### Graylog vs IBM QRadar

> 💡 **Analogie :**
> IBM QRadar, c'est le **Boeing 747** de la cybersécurité : extrêmement puissant, prêt pour les vols transocéaniques, avec des systèmes redondants partout... mais il vous faut un pilote certifié, un hangar entier, et un budget conséquent. Graylog, c'est le **Cessna bien équipé** : vous pouvez voler loin avec, il est beaucoup plus accessible, et vous pouvez l'entretenir vous-même.

| Critère | Graylog | IBM QRadar |
|---|---|---|
| **Coût** | Gratuit / ~quelques k€/an (Security) | **Dizaines à centaines de milliers €/an** |
| **Installation** | 1–2 semaines | 1–3 mois (intégrateur requis) |
| **Intelligence native** | ⚠️ Manuelle (Open) / Bonne (Security) | ✅✅ Très avancée (corrélation réseau native) |
| **Corrélation complexe** | Bonne (Security) | Excellente (offenses avancées) |
| **Scalabilité entreprise** | Bonne | Excellente (Fortune 500) |
| **Équipe requise** | Admin système + analyste | Équipe SOC certifiée IBM |
| **Pour qui** | PME → ETI → Grandes entreprises | Très grandes entreprises / gouvernements |
| **Avantage QRadar** | — | Corrélation réseau automatique sans intervention humaine |

:::note

Le **Fortune 500** est le classement des 500 plus grandes entreprises américaines par chiffre d'affaires (ex: Walmart, Apple, JPMorgan).

- Ces entreprises gèrent des pétaoctets de données et des millions d'événements par seconde.

- Quand on dit qu'un outil est taillé pour le "Fortune 500", cela signifie qu'il est conçu pour ne jamais saturer, même à l'échelle d'une banque mondiale ou d'un opérateur télécom global.
:::

**Verdict DevSecOps :** À moins d'être dans une très grande organisation avec budget SOC conséquent, Graylog (surtout avec Wazuh + Suricata) offre **90% des fonctionnalités de QRadar pour 5% du prix**.

---

#### Graylog vs Splunk

> 💡 **Analogie :**
> Splunk, c'est la **Ferrari des SIEM** : ultra-performant, magnifique interface, écosystème d'applications incroyable, intégrations partout... mais un coût qui peut mettre une PME en difficulté financière. Graylog, c'est la **BMW bien équipée** : très capable, nettement moins cher, et qui fait le travail pour 95% des organisations.

| Critère | Graylog | Splunk |
|---|---|---|
| **Coût** | Gratuit → quelques k€/an | **~300–500€/Go ingéré/jour** (très élevé à l'échelle) |
| **Interface** | Bonne | Excellente |
| **Ecosystem** | 300+ connecteurs | 2 000+ apps (Splunkbase) |
| **SPL vs Lucene** | Lucene (simple) | SPL (puissant mais à apprendre) |
| **Machine Learning** | Security add-on | Splunk ML Toolkit (excellent) |
| **SOAR** | Via intégrations | Splunk SOAR (excellent) |
| **Pour PME** | ✅ Idéal | ❌ Souvent trop cher |
| **Pour grandes org.** | ✅ Viable | ✅ Premium |

**Verdict DevSecOps :** Splunk est le leader du marché, mais son modèle de pricing à la volumétrie le rend inaccessible pour la majorité des organisations. Graylog offre une alternative crédible et souvent suffisante.

---

#### Tableau de positionnement global

| Solution | Profil idéal | Budget | Expertise requise |
|---|---|---|---|
| **Graylog Open + Wazuh + Suricata** | PME, ETI, DevSecOps, SOC en construction | Infra seulement | Moyenne |
| **Graylog Security** | ETI, grandes entreprises open source | $$ | Moyenne |
| **ELK + Elastic SIEM** | Orgs avec équipe data + sécurité | Infra + licence | Élevée |
| **IBM QRadar** | Grandes entreprises, gouvernements | $$$$ | Très élevée |
| **Splunk** | Entreprises avec gros budget | $$$$ | Élevée |
| **Microsoft Sentinel** | Environnements Microsoft-centric | $$$ (pay/Go) | Faible-moyenne |
| **AWS GuardDuty + SH** | Environnements AWS-centric | $$ (pay/use) | Faible |

---

### ✅❌ 2.7 Avantages & Inconvénients de Graylog (Vision DevSecOps) {#graylog-avantages}

#### ✅ Avantages

| Avantage | Détail |
|---|---|
| **Vitesse de recherche** | Basé sur OpenSearch/Elasticsearch : ultra-rapide pour fouiller des téraoctets de données |
| **Facilité d'utilisation** | Interface intuitive pour les analystes SOC — pas besoin d'être expert pour chercher des logs |
| **Pipelines de données** | Outil idéal pour "nettoyer" et anonymiser les données avant stockage (crucial pour RGPD) |
| **Format GELF** | JSON structuré moderne — bien meilleur que syslog brut pour l'analyse |
| **Scalabilité** | Architecture cluster pour les très grands volumes |
| **Connecteurs** | 300+ connecteurs disponibles |
| **Intégration DevSecOps** | S'intègre parfaitement dans des pipelines CI/CD, Kubernetes, Docker |

**Cas pratique DevSecOps — Surveiller Keycloak avec Graylog :**

> Si vous reliez votre Keycloak à Graylog :
> 1. Keycloak envoie chaque événement de connexion/échec via Syslog ou GELF
> 2. Graylog parse le log et extrait le nom d'utilisateur et l'IP
> 3. Un dashboard affiche une **carte du monde** des tentatives de connexion en temps réel
> 4. Si une IP bannie essaie de se connecter à votre instance Odoo, Graylog envoie une alerte immédiate sur Slack ou Discord

#### ❌ Inconvénients

| Inconvénient | Détail |
|---|---|
| **Moins "Out-of-the-box" (version Open)** | Dans sa version gratuite, il ne vient pas avec des milliers de règles de détection pré-configurées — contrairement à Wazuh |
| **Pas de SOAR natif** | Alerte très bien, mais n'automatise pas la réponse (bloquer un port firewall, isoler un hôte) aussi bien qu'un vrai outil SOAR |
| **3 services à gérer** | MongoDB + OpenSearch + Graylog = complexité opérationnelle |
| **Consommation RAM** | OpenSearch seul peut consommer 4–8 Go — prévoir du matériel suffisant |
| **Corrélation avancée = payant** | Pour un vrai SIEM, il faut le module Security |
| **Montées de version** | Parfois délicates entre versions majeures |

> 💡 **Synthèse DevSecOps :**
> "Graylog est la solution idéale pour les entreprises qui veulent passer du simple stockage de logs à une véritable stratégie de détection de menaces, **sans la complexité et le prix des SIEM traditionnels**. Couplé à Wazuh et Suricata, il constitue un SOC open source complet équivalant à des solutions coûtant des dizaines de milliers d'euros."

---

### 🛠️ 2.8 Installation de Graylog sur Linux (Ubuntu 22.04 LTS) {#install-graylog}

> ⚠️ **Prérequis système minimum :**
> - OS : Ubuntu 22.04 LTS / Debian 12 / RHEL 8-9
> - RAM : **8 Go minimum** (16 Go recommandé en production)
> - CPU : 4 vCPU minimum
> - Disque : 50 Go minimum (selon volume de logs)
> - Java : OpenJDK 17 (installé automatiquement)

#### Étape 0 — Préparation du système

```bash
# Mise à jour complète du système
sudo apt update && sudo apt upgrade -y

# Installation des outils nécessaires
sudo apt install -y apt-transport-https curl gnupg2 uuid-runtime pwgen lsb-release

# Désactiver le swap (recommandé pour Elasticsearch/OpenSearch)
sudo swapoff -a
sudo sed -i '/swap/d' /etc/fstab

# Vérifier la version d'Ubuntu
lsb_release -a
```

> 💡 **Pourquoi désactiver le swap ?** OpenSearch est très sensible aux performances disque. Si le système utilise le swap, les requêtes de recherche deviennent extrêmement lentes. Mieux vaut avoir assez de RAM réelle.

---

#### Étape 1 — Installation de MongoDB 6.0

```bash
# Importer la clé GPG officielle MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor

# Ajouter le dépôt MongoDB
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] \
  https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Mettre à jour et installer
sudo apt update
sudo apt install -y mongodb-org

# Démarrer et activer MongoDB
sudo systemctl daemon-reload
sudo systemctl enable mongod
sudo systemctl start mongod

# Vérifier
sudo systemctl status mongod   # Doit afficher "active (running)"
```

---

#### Étape 2 — Installation d'OpenSearch 2.x

```bash
# Ajouter la clé et le dépôt OpenSearch
curl -o- https://artifacts.opensearch.org/publickeys/opensearch.pgp | \
  sudo gpg --dearmor --batch --yes -o /usr/share/keyrings/opensearch-keyring.gpg

echo "deb [signed-by=/usr/share/keyrings/opensearch-keyring.gpg] \
  https://artifacts.opensearch.org/releases/bundle/opensearch/2.x/apt stable main" | \
  sudo tee /etc/apt/sources.list.d/opensearch-2.x.list

sudo apt update
sudo apt install -y opensearch=2.12.0

# Configurer OpenSearch pour Graylog
sudo tee /etc/opensearch/opensearch.yml > /dev/null <<EOF
cluster.name: graylog
node.name: node-1
network.host: 127.0.0.1
http.port: 9200
discovery.type: single-node
plugins.security.disabled: true
action.auto_create_index: false
indices.query.bool.max_clause_count: 32768
EOF

# Allouer 50% de la RAM disponible (max 32 Go)
sudo tee /etc/opensearch/jvm.options.d/graylog.options > /dev/null <<EOF
-Xms4g
-Xmx4g
EOF

# Paramètre kernel obligatoire
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Démarrer OpenSearch
sudo systemctl daemon-reload
sudo systemctl enable opensearch
sudo systemctl start opensearch

# Vérifier (attendre 30-60 secondes)
curl -s http://localhost:9200
# Doit retourner un JSON avec "cluster_name": "graylog"
```

---

#### Étape 3 — Installation de Graylog

```bash
# Ajouter le dépôt Graylog
wget https://packages.graylog2.org/repo/packages/graylog-6.1-repository_latest.deb
sudo dpkg -i graylog-6.1-repository_latest.deb
sudo apt update
sudo apt install -y graylog-server

# Générer le password_secret (clé de chiffrement — CONSERVEZ-LA PRÉCIEUSEMENT)
pwgen -N 1 -s 96
# → Exemple : "xK9mP2jQ8rL5vN3wA7eB4cF6uH1sD0tG..."

# Générer le hash SHA256 du mot de passe administrateur
echo -n "VotreMotDePasseAdmin" | sha256sum | awk '{print $1}'
# → Exemple : "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"

# Éditer la configuration principale
sudo nano /etc/graylog/server/server.conf
```

**Paramètres clés dans `server.conf` :**
```ini
# SÉCURITÉ
password_secret = xK9mP2jQ8rL5vN3wA7eB4cF6uH1sD0tG...
root_password_sha2 = a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3

# RÉSEAU
http_bind_address = 0.0.0.0:9000

# ELASTICSEARCH / OPENSEARCH
elasticsearch_hosts = http://127.0.0.1:9200

# MONGODB
mongodb_uri = mongodb://localhost/graylog

# TIMEZONE
root_timezone = Europe/Paris
```

```bash
# Démarrer Graylog
sudo systemctl daemon-reload
sudo systemctl enable graylog-server
sudo systemctl start graylog-server

# Suivre le démarrage (attendre le message "Graylog server up and running")
sudo journalctl -fu graylog-server
```

**Accès à l'interface web :**
```
URL      : http://VOTRE_IP_SERVEUR:9000
Login    : admin
Password : VotreMotDePasseAdmin (celui hashé plus haut)
```

---

#### Étape 4 — Créer un premier Input et tester

**Créer un Input Syslog UDP dans l'interface web :**
1. Menu **System → Inputs**
2. Sélectionner **Syslog UDP** → **Launch new input**
3. Titre : `Syslog-Linux` · Port : `514` · Bind : `0.0.0.0`
4. Cliquer **Save**

**Tester depuis un autre serveur Linux :**
```bash
echo "Test log depuis $(hostname)" | nc -u -w1 GRAYLOG_IP 514
```

**Ouvrir les ports du firewall :**
```bash
sudo ufw allow 9000/tcp   # Interface web
sudo ufw allow 514/udp    # Syslog UDP
sudo ufw allow 12201/udp  # GELF UDP
sudo ufw allow 12201/tcp  # GELF TCP
sudo ufw allow 5044/tcp   # Beats (Filebeat, Winlogbeat)
```

---

#### Étape 5 — Sécurisation post-installation

```bash
# Activer HTTPS (certificat auto-signé)
sudo openssl req -x509 -newkey rsa:4096 \
  -keyout /etc/graylog/server/server.key \
  -out /etc/graylog/server/server.crt \
  -days 365 -nodes \
  -subj "/CN=graylog.votredomaine.com"

# Dans server.conf, ajouter :
# http_enable_tls = true
# http_tls_cert_file = /etc/graylog/server/server.crt
# http_tls_key_file  = /etc/graylog/server/server.key

sudo systemctl restart graylog-server
```

**Tableau des ports Graylog :**
```
Port 9000  TCP  → Interface web
Port 9200  TCP  → OpenSearch (interne uniquement)
Port 27017 TCP  → MongoDB (interne uniquement)
Port 514   UDP  → Syslog UDP
Port 514   TCP  → Syslog TCP
Port 12201 UDP  → GELF UDP
Port 12201 TCP  → GELF TCP
Port 5044  TCP  → Beats
```

---

#### Étape 6 — Dépannage courant

```bash
# Statut de tous les services
sudo systemctl status mongod opensearch graylog-server

# Logs Graylog en temps réel
sudo journalctl -fu graylog-server

# Tester la connexion OpenSearch
curl -s http://localhost:9200/_cluster/health?pretty

# Tester MongoDB
mongosh --eval "db.adminCommand('ping')"
```

| Problème | Cause probable | Solution |
|---|---|---|
| Graylog ne démarre pas | password_secret manquant | Vérifier server.conf |
| OpenSearch timeout | RAM insuffisante | Réduire Xmx dans jvm.options |
| Interface web inaccessible | Firewall actif | `sudo ufw allow 9000/tcp` |
| Aucun log reçu | Input non démarré | System → Inputs → Vérifier statut |
| MongoDB connexion refusée | MongoDB non démarré | `sudo systemctl start mongod` |

---

### ✅ 2.9 Bonnes pratiques, recommandations et limites de Graylog {#graylog-bonnes-pratiques}

#### 🔒 Bonnes pratiques de sécurité

| Pratique | Pourquoi | Comment |
|---|---|---|
| **Activer HTTPS** | Les logs contiennent des données sensibles | Certificat Let's Encrypt ou PKI interne |
| **Changer les mots de passe par défaut** | Évident — mais souvent oublié | `root_password_sha2` dans server.conf |
| **Isoler MongoDB et OpenSearch** | Ne pas les exposer sur internet | Bind sur `127.0.0.1`, firewall strict |
| **Activer l'authentification LDAP/AD** | Gestion centralisée des accès | System → Authentication → LDAP |
| **Rôles et permissions granulaires** | Principe du moindre privilège | Créer des rôles SOC / admin / lecture seule |
| **Chiffrer les données au repos** | Conformité RGPD, NIS2 | Chiffrement disque (LUKS) ou OpenSearch TLS |
| **Activer l'audit des actions Graylog** | Savoir qui a fait quoi dans le SIEM | System → Audit Log |
| **Sauvegarder MongoDB régulièrement** | Configuration perdue = SIEM inutilisable | `mongodump` quotidien |
| **Monitoring du SIEM lui-même** | Un SIEM tombé en silence est dangereux | Alertes "absence de logs" depuis sources critiques |

#### 📏 Recommandations de déploiement

```
✅ DO (Faire)                         ❌ DON'T (Ne pas faire)
──────────────────────────────────    ────────────────────────────────────
Séparer les services sur des VMs      Tout installer sur 1 VM avec 4 Go RAM
Utiliser des index par type de logs   Un seul index pour tout
Configurer la rétention des index     Laisser OpenSearch se remplir à 100%
Tester les alertes régulièrement      Créer une alerte et ne jamais vérifier
Documenter les pipelines créés        Laisser des pipelines "mystère" actifs
Mettre à jour régulièrement           Rester sur des versions anciennes
Utiliser Illuminate (Security)        Repartir de zéro pour chaque source
Activer la suppression automatique    Garder éternellement tous les logs bruts
```

#### ⚠️ Limites à connaître

| Limite | Impact | Mitigation |
|---|---|---|
| **Pas de SOAR natif** | Ne peut pas bloquer automatiquement un attaquant | Intégrer TheHive + Shuffle, ou Wazuh Active Response |
| **Corrélation = module payant** | Version gratuite = alertes simples seulement | Utiliser Wazuh pour la corrélation côté hôte |
| **Performances OpenSearch** | Requêtes lentes si sous-dimensionné | Respecter le sizing (8+ Go RAM) |
| **Pas de décodeurs automatiques** | Certains logs arrivent bruts, non parsés | Créer des extracteurs ou pipelines |
| **Montées de version délicates** | Risque de casse configuration | Toujours tester en environnement de staging |
| **Scalabilité manuelle** | Ajouter des nœuds n'est pas automatique | Prévoir l'architecture cluster dès le départ |
| **Pas d'agent natif** | Nécessite Filebeat/Sidecar pour les endpoints | Utiliser Wazuh comme agent principal |

#### 📊 Cas pratique — Règles de rétention recommandées

```
Index "sécurité-critique"  → Rétention : 365 jours (conformité NIS2/DORA)
Index "logs-applicatifs"   → Rétention : 90 jours
Index "logs-réseau"        → Rétention : 30 jours
Index "debug-développement"→ Rétention : 7 jours
Archivage froid (S3/Glacier)→ 5 à 10 ans (selon réglementation sectorielle)
```

---

## 3. Wazuh {#3-wazuh}

### 📜 3.1 Histoire

| Année | Événement clé |
|---|---|
| **2003** | Daniel B. Cid crée **OSSEC** (Open Source Security), premier HIDS open source majeur |
| **2009** | OSSEC devient le HIDS le plus téléchargé au monde (plusieurs millions d'installations) |
| **2014** | OSSEC peine à évoluer : maintenance ralentie, manque de documentation, interface absente |
| **2015** | Fork d'OSSEC par Santiago Bassett et son équipe → naissance officielle de **Wazuh** |
| **2016** | Wazuh 1.0 — intégration Elastic Stack (Elasticsearch + Kibana) |
| **2018** | Wazuh 3.0 — architecture distribuée, manager/agent redesigné |
| **2020** | Wazuh 4.0 — nouveau manager, agents optimisés, Vulnerability Detector amélioré |
| **2022** | **+10 millions de téléchargements** — devient la référence HIDS/EDR open source |
| **2023** | Wazuh 4.5 — capacités XDR, intégration cloud native (AWS, Azure, GCP) |
| **2024** | Wazuh 4.8 — SCA amélioré, MITRE ATT&CK mapping complet, remediation active |

> 💡 **L'histoire d'un fork réussi :**
> OSSEC était comme une **vieille voiture fiable mais sans entretien** : elle fonctionnait, mais les pièces détachées manquaient, la carrosserie rouillait, et personne ne lisait le manuel. Wazuh a pris ce moteur, l'a reconstruit dans un châssis moderne, ajouté une interface tactile, le GPS, la climatisation, et un service après-vente. Résultat : le même moteur de confiance, mais une expérience radicalement différente.

---

### 🏗️ 3.2 Architecture de Wazuh

```
┌──────────────────────────────────────────────────────────────────┐
│                        WAZUH MANAGER                             │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐    │
│  │  Analyser   │  │ Vulnerability│  │  Active Response     │    │
│  │  (règles)   │  │  Detector    │  │  (blocage auto)      │    │
│  └─────────────┘  └──────────────┘  └──────────────────────┘    │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐    │
│  │  FIM        │  │ SCA (audit   │  │  Syscollector        │    │
│  │  (fichiers) │  │  conformité) │  │  (inventaire)        │    │
│  └─────────────┘  └──────────────┘  └──────────────────────┘    │
└──────────────────────────────┬───────────────────────────────────┘
                               │ Protocole OSSEC (TLS chiffré)
              ┌────────────────┼──────────────────┐
              ▼                ▼                  ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ Agent Linux  │  │Agent Windows │  │ Agent macOS  │
    │  Ubuntu/RHEL │  │  Server/WS   │  │              │
    └──────────────┘  └──────────────┘  └──────────────┘
              │                ▼
    ┌──────────────┐  ┌──────────────┐
    │ Agent Docker │  │ Agent Cloud  │
    │  Containers  │  │AWS/Azure/GCP │
    └──────────────┘  └──────────────┘

              ▼ (Alertes + données)
┌─────────────────────────────────────────────────────┐
│                  WAZUH INDEXER                      │
│              (OpenSearch distribué)                 │
└───────────────────────┬─────────────────────────────┘
                        │
              ┌─────────▼──────────┐
              │  WAZUH DASHBOARD   │
              │  (Interface Kibana)│
              │  Port 443 (HTTPS)  │
              └────────────────────┘
```

**Description des composants :**

| Composant | Rôle | Analogie |
|---|---|---|
| **Wazuh Manager** | Reçoit les données des agents, applique les règles, génère les alertes | Le commissariat central |
| **Wazuh Agent** | Collecte les données sur chaque machine surveillée | L'agent de police en patrouille |
| **Wazuh Indexer** | Stocke toutes les alertes et logs (OpenSearch) | L'archive judiciaire numérique |
| **Wazuh Dashboard** | Interface web de visualisation et gestion | Le tableau des opérations |

---

### ⚙️ 3.3 Concepts fondamentaux

#### 🕵️ HIDS — Host Intrusion Detection System

> 💡 **Analogie :**
> Wazuh Agent, c'est comme un **détective privé installé à l'intérieur de votre maison** (pas devant la porte, mais dedans). Il voit tout : qui ouvre les tiroirs, qui change les serrures, qui reçoit des colis suspects, qui tente d'accéder au coffre-fort. Et chaque soir, il envoie son rapport au commissariat (Wazuh Manager).

```
┌────────────────────────────────────────────────────────────────┐
│               CE QUE L'AGENT WAZUH SURVEILLE                   │
├────────────────────┬───────────────────────────────────────────┤
│ 📁 Fichiers & Dirs │ Création, modification, suppression (FIM) │
│ 👤 Utilisateurs    │ Connexions, sudo, élévations de privilèges│
│ ⚙️  Processus      │ Programmes lancés, commandes exécutées     │
│ 🌐 Réseau          │ Connexions actives, ports en écoute        │
│ 📦 Logiciels       │ Packages installés, versions (CVE scan)    │
│ 📋 Logs système    │ Syslog, auth.log, Windows Event Logs       │
│ ☁️  Cloud          │ AWS CloudTrail, Azure Activity, GCP Logs   │
│ 🐳 Containers      │ Docker, Kubernetes events                  │
│ 🔐 Configuration   │ Audit CIS Benchmarks (SCA)                │
└────────────────────┴───────────────────────────────────────────┘
```

#### 🔍 FIM — File Integrity Monitoring

> 💡 **Analogie :**
> Imaginez un notaire qui prend une **photo officielle de chaque document important** dans votre coffre-fort. Si quelqu'un modifie un document — même d'un seul mot — la prochaine vérification révèle que la photo ne correspond plus à la réalité. C'est exactement ce que fait FIM : il prend une empreinte cryptographique (hash) de chaque fichier surveillé.

**Comment fonctionne FIM :**

```
Phase 1 : BASELINE (état initial)
   /etc/passwd  →  hash SHA256 = "abc123..."
   /etc/shadow  →  hash SHA256 = "def456..."
   /usr/bin/ssh →  hash SHA256 = "ghi789..."

Phase 2 : SURVEILLANCE (vérification régulière)
   /etc/passwd  →  hash SHA256 = "abc123..." ✅ OK
   /etc/shadow  →  hash SHA256 = "ZZZ999..." ❌ MODIFIÉ !
   /usr/bin/ssh →  hash SHA256 = "ghi789..." ✅ OK

Phase 3 : ALERTE
   🚨 "Fichier /etc/shadow modifié à 14:32:01
       Utilisateur : root
       Hash précédent : def456...
       Hash actuel    : ZZZ999...
       → Possible compromission des mots de passe !"
```

**Configuration FIM dans `ossec.conf` :**
```xml
<syscheck>
  <!-- Fréquence de vérification (en secondes) -->
  <frequency>3600</frequency>

  <!-- Répertoires Linux à surveiller -->
  <directories check_all="yes" realtime="yes">/etc</directories>
  <directories check_all="yes">/usr/bin,/usr/sbin</directories>
  <directories check_all="yes">/bin,/sbin</directories>

  <!-- Répertoires Windows à surveiller -->
  <directories check_all="yes">%WINDIR%\System32</directories>
  <directories check_all="yes">%PROGRAMFILES%</directories>

  <!-- Fichiers à ignorer (trop de faux positifs) -->
  <ignore>/etc/mtab</ignore>
  <ignore>/etc/hosts.deny</ignore>
</syscheck>
```

#### 🛡️ Vulnerability Detection (Détection de Vulnérabilités)

> 💡 **Analogie :**
> C'est le **contrôle technique obligatoire de votre voiture**. Wazuh inspecte chaque logiciel installé sur vos serveurs, compare les versions avec les bases de données CVE (Common Vulnerabilities and Exposures), et vous dit lesquels ont une faille connue — avec le niveau de gravité (CVSS score).

```
Wazuh Agent collecte :
  - nginx 1.18.0 (installé)
  - OpenSSL 1.1.1k
  - Python 3.9.5
  
Wazuh compare avec NVD/CVE :
  - nginx 1.18.0 → CVE-2023-44487 (HTTP/2 Rapid Reset) CVSS: 7.5 HIGH ⚠️
  - OpenSSL 1.1.1k → CVE-2022-0778 (Infinite Loop) CVSS: 7.5 HIGH ⚠️
  
→ Alerte : "2 vulnérabilités critiques sur SERV-WEB-01"
→ Recommandation : "Mettre à jour nginx → 1.25.3, OpenSSL → 3.0.8"
```

#### 📋 Système de Règles et Décodeurs

> 💡 **Analogie :**
> Les **décodeurs** sont des traducteurs : ils transforment un texte brut en informations structurées. Les **règles** sont des enquêteurs : elles lisent les informations structurées et décident si c'est suspect ou non.

**Exemple de décodeur (transforme le texte en champs) :**
```xml
<!-- Décodeur pour SSH -->
<decoder name="sshd">
  <prematch>^sshd[\d+]</prematch>
</decoder>

<decoder name="sshd-failed">
  <parent>sshd</parent>
  <prematch>^Failed password</prematch>
  <regex>^Failed password for (\S+) from (\S+) port</regex>
  <order>user, srcip</order>
</decoder>
```

**Ce que le décodeur produit :**
```
Log brut: "sshd[1234]: Failed password for admin from 1.2.3.4 port 22345"
         ↓
Champs structurés:
  - decoder: sshd-failed
  - user: admin
  - srcip: 1.2.3.4
```

**Exemple de règle (évalue les champs) :**
```xml
<rule id="5710" level="5">
  <if_matched_sid>5501</if_matched_sid>
  <match>^Failed password</match>
  <description>Tentative de connexion SSH échouée</description>
  <group>authentication_failed,sshd,pci_dss_10.2.4,hipaa_164.312.b</group>
</rule>

<!-- Règle de corrélation : brute force = 10 échecs en 2 minutes -->
<rule id="5720" level="10" frequency="10" timeframe="120">
  <if_matched_sid>5710</if_matched_sid>
  <same_source_ip/>
  <description>BRUTE FORCE SSH : Multiple tentatives échouées</description>
  <mitre>
    <id>T1110</id>  <!-- MITRE ATT&CK : Brute Force -->
  </mitre>
</rule>
```

**Échelle des niveaux d'alerte :**

```
Niveau  0  → Ignoré (bruit, maintenance)
Niveau  3  → Information (activité normale enregistrée)
Niveau  5  → Bas (tentative isolée, à surveiller)
Niveau  7  → Moyen (activité suspecte)
Niveau  9  → Élevé (probable incident)
Niveau 12  → Critique (incident confirmé)
Niveau 15  → Maximum (compromission grave, alerte immédiate)
```

#### 🧩 Les Modules Wazuh

| Module | Fonction | Cas d'usage concret |
|---|---|---|
| **FIM** | Surveillance intégrité fichiers | Détection rootkits, ransomware |
| **SCA** | Audit configuration sécurité | Conformité CIS, PCI-DSS |
| **Vulnerability Detector** | Scan CVE sur packages | Patch management |
| **Syscollector** | Inventaire matériel et logiciel | CMDB automatique |
| **Log Collection** | Centralisation syslog, Windows Events | Audit trail |
| **Command Monitoring** | Surveillance commandes exécutées | Détection abus privilèges |
| **Active Response** | Blocage automatique des attaquants | Bloquer IP brute force |
| **VirusTotal** | Analyse fichiers suspects | Détection malware |
| **Docker** | Surveillance conteneurs | Sécurité Kubernetes |
| **AWS/Azure/GCP** | Logs cloud natifs | Cloud security posture |
| **MITRE ATT&CK** | Mapping des techniques d'attaque | Threat hunting |

#### 🤖 Active Response — La Réaction Automatique

> 💡 **Analogie :**
> C'est le **videur automatique de boîte de nuit**. Si quelqu'un essaie d'entrer trop souvent avec un faux billet (brute force), la porte se ferme automatiquement devant lui — sans avoir besoin d'appeler la sécurité humaine.

**Exemple d'Active Response : bloquer une IP après brute force**
```xml
<!-- Dans ossec.conf -->
<active-response>
  <command>firewall-drop</command>        <!-- Commande à exécuter -->
  <location>local</location>              <!-- Sur l'agent concerné -->
  <rules_id>5720</rules_id>               <!-- Déclenché par la règle brute force -->
  <timeout>600</timeout>                  <!-- Bloquer pendant 10 minutes -->
</active-response>
```

Résultat : dès que la règle 5720 (brute force SSH) se déclenche, Wazuh exécute automatiquement `iptables -A INPUT -s 1.2.3.4 -j DROP` sur le serveur concerné.

---

### ✅❌ 3.4 Avantages & Inconvénients de Wazuh

| ✅ Avantages | ❌ Inconvénients |
|---|---|
| 100% gratuit et open source | Manager consomme beaucoup de ressources (>8 Go RAM) |
| Agents multi-plateformes (Linux, Windows, macOS, Solaris, AIX) | Règles en XML : syntaxe à apprendre |
| Frameworks de conformité intégrés (PCI, HIPAA, GDPR, NIS2) | Scalabilité à grande échelle complexe |
| Mapping MITRE ATT&CK natif | Faux positifs nombreux sans calibration |
| Détection temps réel (FIM realtime) | Interface dashboard moins intuitive que des outils payants |
| Active Response : réaction automatique | Documentation parfois incomplète sur cas avancés |
| XDR gratuit avec Wazuh 4.x | Mises à jour majeures parfois compliquées |
| Communauté très active (30 000+ membres GitHub) | Pas de SOAR natif complet |
| Intégration native avec Graylog et Elastic | Nécessite OpenSearch (ressources additionnelles) |

---

### 🛠️ 3.5 Installation de Wazuh sur Linux (Ubuntu 22.04 LTS) {#install-wazuh}

Wazuh propose deux modes d'installation :
- **Installation tout-en-un** : Manager + Indexer + Dashboard sur une seule machine (test/lab)
- **Installation distribuée** : chaque composant sur un serveur dédié (production)

Nous détaillons l'installation **tout-en-un** (la plus courante pour démarrer).

> ⚠️ **Prérequis système :**
> - OS : Ubuntu 22.04 / Debian 12 / RHEL 8-9
> - RAM : **8 Go minimum** (16 Go recommandé)
> - CPU : 4 vCPU minimum
> - Disque : 50 Go minimum
> - Réseau : Port 1514 (agents), 1515 (enregistrement), 443 (dashboard), 9200 (indexer)

#### Étape 1 — Installation automatique (méthode recommandée)

Wazuh fournit un script d'installation tout-en-un officiel :

```bash
# Télécharger et exécuter le script d'installation
curl -sO https://packages.wazuh.com/4.8/wazuh-install.sh
chmod +x wazuh-install.sh

# Installation complète (Manager + Indexer + Dashboard)
sudo bash wazuh-install.sh -a

# Le script va :
# 1. Vérifier les prérequis
# 2. Installer Wazuh Indexer (OpenSearch)
# 3. Installer Wazuh Manager
# 4. Installer Wazuh Dashboard (Kibana-like)
# 5. Configurer les certificats TLS
# 6. Démarrer tous les services
# 7. Afficher les credentials de connexion
```

> 💡 **Le script d'installation prend environ 10-20 minutes** selon la connexion internet et les performances du serveur. C'est le moyen le plus simple pour un premier déploiement.

À la fin de l'installation, le script affiche :
```
INFO: --- Summary ---
INFO: You can access the web interface https://VOTRE_IP
    User: admin
    Password: XXXXXXXXXXXXXXXXXX
```

**Notez bien ce mot de passe !**

---

#### Étape 2 — Installation manuelle détaillée (pour comprendre chaque composant)

##### A. Wazuh Indexer

```bash
# Ajouter le dépôt Wazuh
curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | \
  gpg --no-default-keyring --keyring gnupg-ring:/usr/share/keyrings/wazuh.gpg --import
chmod 644 /usr/share/keyrings/wazuh.gpg

echo "deb [signed-by=/usr/share/keyrings/wazuh.gpg] \
  https://packages.wazuh.com/4.x/apt/ stable main" | \
  tee /etc/apt/sources.list.d/wazuh.list

apt update

# Installer Wazuh Indexer
apt install -y wazuh-indexer

# Configurer le nœud OpenSearch
tee /etc/wazuh-indexer/opensearch.yml > /dev/null <<EOF
network.host: "0.0.0.0"
node.name: "node-1"
cluster.initial_master_nodes:
  - "node-1"
cluster.name: "wazuh-cluster"
path.data: /var/lib/wazuh-indexer
path.logs: /var/log/wazuh-indexer
plugins.security.ssl.transport.pemcert_filepath: /etc/wazuh-indexer/certs/indexer.pem
plugins.security.ssl.transport.pemkey_filepath: /etc/wazuh-indexer/certs/indexer-key.pem
plugins.security.ssl.transport.pemtrustedcas_filepath: /etc/wazuh-indexer/certs/root-ca.pem
plugins.security.ssl.http.enabled: true
plugins.security.ssl.http.pemcert_filepath: /etc/wazuh-indexer/certs/indexer.pem
plugins.security.ssl.http.pemkey_filepath: /etc/wazuh-indexer/certs/indexer-key.pem
plugins.security.ssl.http.pemtrustedcas_filepath: /etc/wazuh-indexer/certs/root-ca.pem
plugins.security.authcz.admin_dn:
  - "CN=admin,OU=Wazuh,O=Wazuh,L=California,C=US"
plugins.security.nodes_dn:
  - "CN=node-1,OU=Wazuh,O=Wazuh,L=California,C=US"
EOF

# Démarrer Wazuh Indexer
systemctl daemon-reload
systemctl enable wazuh-indexer
systemctl start wazuh-indexer
```

##### B. Wazuh Manager

```bash
# Installer Wazuh Manager
apt install -y wazuh-manager

# Le fichier de configuration principal
# /var/ossec/etc/ossec.conf

# Démarrer Wazuh Manager
systemctl daemon-reload
systemctl enable wazuh-manager
systemctl start wazuh-manager

# Vérifier le statut
/var/ossec/bin/wazuh-control status
```

##### C. Wazuh Dashboard

```bash
# Installer le dashboard
apt install -y wazuh-dashboard

# Configuration (pointer vers l'indexer)
tee /etc/wazuh-dashboard/opensearch_dashboards.yml > /dev/null <<EOF
server.host: 0.0.0.0
server.port: 443
opensearch.hosts: https://localhost:9200
opensearch.ssl.verificationMode: certificate
opensearch.username: kibanaserver
opensearch.password: kibanaserver
server.ssl.enabled: true
server.ssl.key: "/etc/wazuh-dashboard/certs/dashboard-key.pem"
server.ssl.certificate: "/etc/wazuh-dashboard/certs/dashboard.pem"
EOF

# Démarrer le dashboard
systemctl daemon-reload
systemctl enable wazuh-dashboard
systemctl start wazuh-dashboard
```

---

#### Étape 3 — Déploiement des agents Wazuh

L'agent Wazuh doit être installé sur **chaque machine que vous souhaitez surveiller**.

##### Agent sur Ubuntu/Debian :

```bash
# Sur la machine à surveiller (remplacer WAZUH_MANAGER_IP)
curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | \
  gpg --no-default-keyring --keyring gnupg-ring:/usr/share/keyrings/wazuh.gpg --import
chmod 644 /usr/share/keyrings/wazuh.gpg

echo "deb [signed-by=/usr/share/keyrings/wazuh.gpg] \
  https://packages.wazuh.com/4.x/apt/ stable main" | \
  tee /etc/apt/sources.list.d/wazuh.list

apt update
apt install -y wazuh-agent

# Configurer l'agent (pointer vers le manager)
tee /var/ossec/etc/ossec.conf > /dev/null <<EOF
<ossec_config>
  <client>
    <server>
      <address>WAZUH_MANAGER_IP</address>
      <port>1514</port>
      <protocol>tcp</protocol>
    </server>
  </client>
</ossec_config>
EOF

# Enregistrer l'agent auprès du manager
/var/ossec/bin/agent-auth -m WAZUH_MANAGER_IP

# Démarrer l'agent
systemctl daemon-reload
systemctl enable wazuh-agent
systemctl start wazuh-agent
```

##### Agent sur Windows (PowerShell — exécuter en administrateur) :

```powershell
# Télécharger et installer l'agent Windows
Invoke-WebRequest -Uri "https://packages.wazuh.com/4.x/windows/wazuh-agent-4.8.0-1.msi" `
  -OutFile "${env:tmp}\wazuh-agent-4.8.0.msi"

# Installer avec les paramètres du manager
msiexec.exe /i "${env:tmp}\wazuh-agent-4.8.0.msi" /q `
  WAZUH_MANAGER="WAZUH_MANAGER_IP" `
  WAZUH_REGISTRATION_SERVER="WAZUH_MANAGER_IP"

# Démarrer le service
NET START WazuhSvc
```

##### Agent sur CentOS/RHEL :

```bash
# Ajouter le dépôt
rpm --import https://packages.wazuh.com/key/GPG-KEY-WAZUH

cat > /etc/yum.repos.d/wazuh.repo << EOF
[wazuh]
gpgcheck=1
gpgkey=https://packages.wazuh.com/key/GPG-KEY-WAZUH
enabled=1
name=EL-\$releasever - Wazuh
baseurl=https://packages.wazuh.com/4.x/yum/
protect=1
EOF

# Installer l'agent
yum install -y wazuh-agent

# Configurer et démarrer (même procédure que Ubuntu)
```

---

#### Étape 4 — Vérification et premiers pas dans le dashboard

```bash
# Sur le manager : vérifier les agents connectés
/var/ossec/bin/agent_control -l
# Doit lister vos agents avec statut "Active"

# Tester une règle manuellement
/var/ossec/bin/wazuh-logtest
# Entrer un log pour voir quelle règle se déclenche
# Ex: "sshd[1234]: Failed password for root from 1.2.3.4 port 22"
```

**Accès au Dashboard :**
```
URL : https://VOTRE_IP_SERVEUR (port 443)
Login : admin
Mot de passe : (affiché à la fin de l'installation)
```

**Sections principales du dashboard :**
- **Security Events** : Toutes les alertes en temps réel
- **Integrity Monitoring** : Modifications de fichiers (FIM)
- **Vulnerability Detection** : CVEs trouvées
- **Security Configuration Assessment** : Score de conformité
- **MITRE ATT&CK** : Carte des techniques d'attaque détectées

---

#### Étape 5 — Configuration avancée recommandée

```bash
# Activer la surveillance des logs d'authentification Linux
# Dans /var/ossec/etc/ossec.conf (sur le manager)

# Pour Linux
<localfile>
  <log_format>syslog</log_format>
  <location>/var/log/auth.log</location>
</localfile>

# Pour surveiller les commandes sudo
<localfile>
  <log_format>syslog</log_format>
  <location>/var/log/sudo.log</location>
</localfile>

# Activer l'audit des appels système (auditd)
apt install -y auditd
# Ajouter dans /etc/audit/rules.d/audit.rules :
-w /etc/passwd -p wa -k identity
-w /etc/shadow -p wa -k identity
-w /etc/sudoers -p wa -k sudoers
```

**Ports réseau Wazuh à ouvrir :**
```
Port 1514  TCP/UDP  → Communication Manager ↔ Agent
Port 1515  TCP      → Enregistrement des agents
Port 1516  TCP      → Cluster Wazuh (multi-manager)
Port 443   TCP      → Interface web Dashboard (HTTPS)
Port 9200  TCP      → Wazuh Indexer (interne uniquement)
Port 9300  TCP      → Cluster Indexer (interne)
```

---

## 4. Suricata {#4-suricata}

### 📜 4.1 Histoire

| Année | Événement clé |
|---|---|
| **1998** | Martin Roesch crée **Snort** : premier IDS réseau open source |
| **2004** | Snort devient la référence mondiale de l'IDS réseau (millions d'installations) |
| **2008** | La **OISF** (Open Information Security Foundation) est fondée avec le soutien du DHS américain |
| **2010** | **Suricata 1.0** publié : concurrent direct de Snort, mais multi-threadé dès le départ |
| **2012** | Suricata 1.3 — support GPU, performances record sur trafic haute densité |
| **2014** | Suricata 2.0 — IPS inline (blocage actif), amélioration décodage protocoles |
| **2015** | Suricata 3.0 — multithreading optimisé, support AF_PACKET pour Linux |
| **2017** | Suricata 4.0 — HTTP/2, support JA3/JA3S (fingerprint TLS) |
| **2019** | Suricata 5.0 — nouveau moteur de détection en Rust, anomaly detection |
| **2021** | Suricata 6.0 — datasets complets, MQTT (IoT), performances 40 Gbps |
| **2022** | **+500 000 déploiements actifs** estimés, standard de facto réseau open source |
| **2023** | Suricata 7.0 — protocoles OT industriels (Modbus, DNP3), major perf boost |

> 💡 **Pourquoi Suricata a détrôné Snort ?**
> Snort est comme un **guichetier qui traite les clients un par un** : excellent, fiable, mais limité par son débit. Suricata est comme un **bureau de poste avec 16 guichets** ouverts simultanément. Avec le trafic réseau moderne (10 Gbps, 40 Gbps), Snort mono-thread était dépassé. Suricata multi-thread a résolu ce problème fondamental.

---

### 🏗️ 4.2 Architecture de Suricata

```
Trafic réseau entrant
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│                     SURICATA ENGINE                           │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                  LAYER 1 : CAPTURE                      │  │
│  │   • AF_PACKET (Linux natif, haute perf.)                │  │
│  │   • PF_RING / NETMAP (très haute perf.)                 │  │
│  │   • PCAP (mode passif, test/debug)                      │  │
│  │   • NFQ / NFQUEUE (mode IPS inline)                     │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          │                                    │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                  LAYER 2 : DECODE                       │  │
│  │   Ethernet → IP → TCP/UDP → HTTP/DNS/TLS/SMTP...        │  │
│  │   "Comprendre" chaque paquet et le reconstituer          │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          │                                    │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │               LAYER 3 : DETECTION ENGINE                │  │
│  │   • Matching règles (signatures)                        │  │
│  │   • Analyse statistique                                 │  │
│  │   • Protocol anomaly detection                          │  │
│  │   • JA3/JA3S fingerprinting TLS                         │  │
│  │   ┌──────────────────────────────────────────────────┐  │  │
│  │   │  Thread 1  Thread 2  Thread 3  ... Thread N      │  │  │
│  │   └──────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          │                                    │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                  LAYER 4 : OUTPUTS                      │  │
│  │   • EVE JSON (principal — vers Graylog/Elastic)         │  │
│  │   • Fast log (alertes texte simples)                    │  │
│  │   • PCAP per-rule (capture à la demande)                │  │
│  │   • Unified2 (compatibilité Snort)                      │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

**Modes de déploiement :**

| Mode | Description | Avantage | Inconvénient |
|---|---|---|---|
| **IDS passif (PCAP/TAP)** | Copie du trafic analysée | Zéro risque de coupure | Ne bloque pas |
| **IDS passif (AF_PACKET)** | Port miroir/SPAN sur switch | Performant, Linux natif | Ne bloque pas |
| **IPS inline (NFQ)** | Trafic passe à travers Suricata | Bloque en temps réel | Risque si crash |
| **IPS inline (AF_PACKET)** | Mode pont réseau | Haute performance | Critique pour prod |

---

### ⚙️ 4.3 Concepts fondamentaux

#### 🔭 IDS vs IPS — La différence fondamentale

> 💡 **Analogie de l'aéroport :**
>
> **Mode IDS :** L'agent de sécurité aux rayons X **observe** les bagages et voit un couteau. Il lève la main pour appeler son collègue, mais le passager est déjà passé. L'alerte a été générée, mais le trafic n'a pas été bloqué.
>
> **Mode IPS :** La porte automatique qui s'est reliée aux rayons X **refuse l'accès** au passager dès que l'objet suspect est détecté. Le trafic est bloqué en temps réel, avant d'atteindre sa destination.

```
┌─────────────────────────────────────────────────────────────┐
│  MODE IDS (passif)                                          │
│                                                             │
│  Internet ──── Switch (SPAN) ────► Réseau interne          │
│                     │                                       │
│                     │ (copie)                               │
│                     ▼                                       │
│                  Suricata                                   │
│                  (observe + alerte, ne bloque pas)          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  MODE IPS (inline)                                          │
│                                                             │
│  Internet ───► Suricata ───► Réseau interne                 │
│               (TOUT le trafic passe par Suricata)           │
│               (Peut bloquer avant de transmettre)           │
└─────────────────────────────────────────────────────────────┘
```

#### 📏 Anatomie d'une Règle Suricata

> 💡 **Analogie :** Une règle Suricata, c'est comme un **mandat de recherche très précis** : "Arrêter tout véhicule de marque X (protocole), de couleur rouge (source IP), qui transporte un paquet contenant l'objet Y (contenu payload), entre telle et telle heure (conditions), et qui se dirige vers telle destination."

**Structure complète :**
```
action  proto  src_ip  src_port  direction  dst_ip  dst_port  (options)
```

**Exemple 1 — Détection d'un scan de ports :**
```suricata
alert tcp any any -> $HOME_NET any (
  msg:"SCAN Nmap TCP SYN scan détecté";
  flags:S;
  detection_filter:track by_src, count 50, seconds 5;
  classtype:network-scan;
  sid:1000001; rev:1;
)
```

**Exemple 2 — Détection malware C2 :**
```suricata
alert dns $HOME_NET any -> any 53 (
  msg:"MALWARE DNS requête domaine généré algorithmiquement (DGA)";
  dns.query; content:".xyz";
  dns.query; content:".top";
  pcre:"/^[a-z0-9]{12,}\.(xyz|top|club)$/";
  threshold: type limit, track by_src, count 10, seconds 60;
  classtype:trojan-activity;
  sid:1000002; rev:1;
)
```

**Exemple 3 — Détection exfiltration DNS :**
```suricata
alert dns $HOME_NET any -> any 53 (
  msg:"Possible DNS tunneling - requêtes DNS suspectes volumineuses";
  dns.query; content:".";
  byte_test:0,>,200,0,string,dec;
  threshold: type both, track by_src, count 100, seconds 60;
  classtype:policy-violation;
  sid:1000003; rev:1;
)
```

**Décryptage des options importantes :**

| Option | Signification |
|---|---|
| `msg` | Message d'alerte affiché dans les logs |
| `content` | Chaîne de caractères à rechercher dans le payload |
| `pcre` | Expression régulière (Perl Compatible) |
| `threshold` | Condition de seuil pour éviter les faux positifs |
| `classtype` | Catégorie de la menace |
| `sid` | Identifiant unique de la règle (doit être unique) |
| `rev` | Révision de la règle (incrémenté à chaque modification) |
| `flow` | Direction du flux (to_server, to_client, established) |
| `flags` | Drapeaux TCP (S=SYN, A=ACK, F=FIN, R=RST) |

#### 📊 EVE JSON — Le Format de Sortie Universel

> 💡 **Analogie :** EVE JSON, c'est le **rapport d'incident standardisé** de Suricata. Comme un rapport de police écrit toujours dans le même format (numéro, date, faits, suspects, preuves), EVE JSON permet à n'importe quel outil (Graylog, Elastic, Splunk) de lire et analyser les alertes Suricata.

**Exemple d'événement EVE JSON complet :**
```json
{
  "timestamp": "2024-03-15T14:32:11.441232+0100",
  "flow_id": 1234567890,
  "in_iface": "eth0",
  "event_type": "alert",
  "src_ip": "192.168.1.45",
  "src_port": 54321,
  "dest_ip": "185.220.101.33",
  "dest_port": 443,
  "proto": "TCP",
  "app_proto": "tls",
  "tls": {
    "subject": "CN=suspicious.xyz",
    "issuerdn": "CN=Let's Encrypt",
    "ja3": {"hash": "abc123...", "string": "769,47-53,..."},
    "ja3s": {"hash": "def456..."}
  },
  "alert": {
    "action": "allowed",
    "gid": 1,
    "signature_id": 2036594,
    "rev": 4,
    "signature": "ET MALWARE Emotet CnC Beacon Detected",
    "category": "A Network Trojan was Detected",
    "severity": 1
  },
  "flow": {
    "pkts_toserver": 12,
    "pkts_toclient": 8,
    "bytes_toserver": 2048,
    "bytes_toclient": 4096,
    "start": "2024-03-15T14:32:05.123456+0100"
  }
}
```

#### 🧪 Analyse Protocolaire Approfondie

Suricata ne se contente pas de chercher des patterns dans les données brutes. Il **comprend** les protocoles et peut analyser le contenu applicatif :

```
┌─────────────────────────────────────────────────────────────┐
│         PROTOCOLES SUPPORTÉS PAR SURICATA                   │
├──────────────────┬──────────────────────────────────────────┤
│ Couche Réseau    │ IPv4, IPv6, ICMP                         │
│ Couche Transport │ TCP, UDP, SCTP                           │
│ Web              │ HTTP, HTTPS/TLS, HTTP/2                  │
│ DNS              │ DNS, DoH (DNS over HTTPS)                │
│ Email            │ SMTP, IMAP, POP3                         │
│ Fichiers         │ FTP, SMB, NFS                            │
│ Admin            │ SSH, RDP, Telnet                         │
│ Microsoft        │ DCE/RPC, Kerberos, NTLM                  │
│ Base de données  │ MySQL, PostgreSQL (partiel)              │
│ IoT              │ MQTT, Modbus, DNP3, ENIP/CIP             │
│ VPN              │ IKEv2, WireGuard (partiel)               │
│ Voix             │ SIP, RTP                                 │
└──────────────────┴──────────────────────────────────────────┘
```

#### 🌐 Gestion des Sources de Règles

```bash
# Suricata-update : gestionnaire de règles officiel
sudo apt install -y suricata-update

# Lister les sources disponibles
sudo suricata-update list-sources

# Activer les sources gratuites
sudo suricata-update enable-source et/open          # Emerging Threats Open
sudo suricata-update enable-source oisf/trafficid   # OISF Traffic ID
sudo suricata-update enable-source sslbl/ja3-fingerprints  # JA3 TLS fingerprints

# Mettre à jour toutes les règles
sudo suricata-update

# Résultat : règles téléchargées dans /var/lib/suricata/rules/suricata.rules
```

---

### ✅❌ 4.4 Avantages & Inconvénients de Suricata

| ✅ Avantages | ❌ Inconvénients |
|---|---|
| Multi-thread : analyse 10–40+ Gbps | Configuration initiale complexe |
| IDS + IPS + NSM dans un seul outil | Tuning des règles nécessite de l'expertise |
| EVE JSON : format standard universel | Faux positifs nombreux sans calibration |
| Compatible règles Snort | Consommation CPU/RAM sur fort trafic |
| Analyse applicative (HTTP, TLS, DNS...) | Pas d'interface graphique native |
| Support protocoles OT/IoT (Modbus, DNP3) | Mises à jour règles nécessitent automation |
| JA3/JA3S : fingerprinting TLS | Pas de SOAR intégré |
| 100% gratuit et open source | Documentation technique dense pour débutants |
| Déploiement flexible (IDS passif ou IPS inline) | — |

---

### 🛠️ 4.5 Installation de Suricata sur Linux (Ubuntu 22.04 LTS) {#install-suricata}

> ⚠️ **Prérequis système :**
> - OS : Ubuntu 22.04 / Debian 12 / RHEL 8-9
> - RAM : 2 Go minimum (4 Go recommandé)
> - CPU : 2 vCPU minimum (4+ pour fort trafic)
> - Interface réseau : accès au trafic à analyser (SPAN, TAP, ou inline)

#### Étape 1 — Installation de Suricata

```bash
# Méthode 1 : Dépôt officiel OISF (version la plus récente recommandée)
sudo add-apt-repository ppa:oisf/suricata-stable
sudo apt update
sudo apt install -y suricata suricata-update

# Vérifier la version installée
suricata --build-info | head -5
# Doit afficher : "Suricata version X.Y.Z"

# Méthode 2 : Dépôt Ubuntu standard (version plus ancienne)
# sudo apt install -y suricata
```

---

#### Étape 2 — Configuration principale

```bash
# Le fichier de configuration principal
sudo nano /etc/suricata/suricata.yaml
```

**Sections importantes à modifier :**

```yaml
# ============================================================
# 1. DÉFINIR LE RÉSEAU LOCAL (OBLIGATOIRE !)
# ============================================================
vars:
  address-groups:
    HOME_NET: "[192.168.0.0/16,10.0.0.0/8,172.16.0.0/12]"
    # Adaptez à votre réseau : ex: "[192.168.1.0/24]"
    EXTERNAL_NET: "!$HOME_NET"
    HTTP_SERVERS: "$HOME_NET"
    DNS_SERVERS: "$HOME_NET"

  port-groups:
    HTTP_PORTS: "80"
    SHELLCODE_PORTS: "!80"
    ORACLE_PORTS: 1521
    SSH_PORTS: 22

# ============================================================
# 2. INTERFACE RÉSEAU À SURVEILLER
# ============================================================
af-packet:
  - interface: eth0          # Nom de votre interface réseau
    cluster-id: 99
    cluster-type: cluster_flow
    defrag: yes
    use-mmap: yes
    tpacket-v3: yes
    ring-size: 2048
    block-size: 32768
    threads: auto            # Utilise tous les CPU disponibles

# ============================================================
# 3. FORMAT DE SORTIE EVE JSON (vers Graylog)
# ============================================================
outputs:
  - eve-log:
      enabled: yes
      filetype: regular
      filename: /var/log/suricata/eve.json
      types:
        - alert:
            payload: yes
            payload-printable: yes
            http-body: yes
            metadata: yes
        - http:
            extended: yes
        - dns:
            version: 2
        - tls:
            extended: yes
            session-resumption: no
        - files:
            force-magic: yes
        - smtp: {}
        - ssh: {}
        - flow: {}
        - netflow: {}
  
  # Log rapide pour alertes simples (lisible par un humain)
  - fast:
      enabled: yes
      filename: /var/log/suricata/fast.log
      append: yes

  # Log des statistiques
  - stats:
      enabled: yes
      filename: /var/log/suricata/stats.log
      interval: 8

# ============================================================
# 4. RÈGLES
# ============================================================
rule-files:
  - suricata.rules   # Règles téléchargées par suricata-update

default-rule-path: /var/lib/suricata/rules

# ============================================================
# 5. PERFORMANCE (adapter au matériel)
# ============================================================
threading:
  set-cpu-affinity: yes
  cpu-affinity:
    - management-cpu-set:
        cpu: [ 0 ]
    - receive-cpu-set:
        cpu: [ 0 ]
    - worker-cpu-set:
        cpu: [ "all" ]        # Tous les CPUs pour les workers
        mode: "exclusive"
  detect-thread-ratio: 1.0
```

---

#### Étape 3 — Téléchargement et mise à jour des règles

```bash
# Mettre à jour les sources de règles
sudo suricata-update update-sources

# Activer les sources gratuites recommandées
sudo suricata-update enable-source et/open          # Emerging Threats
sudo suricata-update enable-source oisf/trafficid   # Identification trafic

# Télécharger et compiler les règles
sudo suricata-update

# Vérifier combien de règles sont disponibles
sudo suricata-update 2>&1 | grep "rules loaded"
# Exemple : "10428 rules loaded"
```

---

#### Étape 4 — Démarrage et vérification

```bash
# Tester la configuration avant de démarrer
sudo suricata -T -c /etc/suricata/suricata.yaml -v
# "Configuration provided was successfully loaded." = OK

# Démarrer Suricata
sudo systemctl enable suricata
sudo systemctl start suricata

# Vérifier le statut
sudo systemctl status suricata

# Suivre les alertes en temps réel
sudo tail -f /var/log/suricata/fast.log

# Suivre les alertes EVE JSON en temps réel (formaté)
sudo tail -f /var/log/suricata/eve.json | python3 -m json.tool
```

---

#### Étape 5 — Test de détection avec du trafic simulé

```bash
# Test 1 : Générer une alerte de test (règle Suricata built-in)
curl http://testmynids.org/uid/index.html
# Doit générer : "ET INFO Observed DNS Query to .testmynids.org..."

# Test 2 : Tester la détection d'une tentative de scan
sudo apt install -y nmap
nmap -sS localhost
# Doit générer une alerte de scan dans fast.log

# Test 3 : Utiliser suricatasc pour les stats en temps réel
sudo suricatasc -c /var/run/suricata/suricata-command.socket
# Dans le shell suricatasc : tapez "dump-counters"

# Vérifier les statistiques globales
sudo cat /var/log/suricata/stats.log | tail -50
```

---

#### Étape 6 — Intégration avec Graylog (envoi EVE JSON)

**Option A — Via Filebeat (recommandé) :**

```bash
# Installer Filebeat
curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-8.12.0-amd64.deb
sudo dpkg -i filebeat-8.12.0-amd64.deb

# Configurer Filebeat pour lire EVE JSON et envoyer à Graylog
sudo tee /etc/filebeat/filebeat.yml > /dev/null <<EOF
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /var/log/suricata/eve.json
    json.keys_under_root: true
    json.add_error_key: true
    json.message_key: log

output.logstash:
  hosts: ["GRAYLOG_IP:5044"]   # Port Beats de Graylog

fields:
  source: suricata
  type: suricata_eve
EOF

sudo systemctl enable filebeat
sudo systemctl start filebeat
```

**Dans Graylog : créer l'Input Beats :**
1. System → Inputs → Beats (port 5044)
2. Créer un Extractor pour parser le JSON EVE
3. Les alertes Suricata apparaissent dans Graylog

**Option B — Via Syslog direct :**

```yaml
# Dans suricata.yaml, ajouter dans outputs:
  - syslog:
      enabled: yes
      facility: local5
      format: "[%i] <%d> -- "
      level: Info
```

```bash
# Configurer rsyslog pour router vers Graylog
echo "local5.* @GRAYLOG_IP:514" | sudo tee -a /etc/rsyslog.d/suricata.conf
sudo systemctl restart rsyslog
```

---

#### Étape 7 — Mode IPS (blocage actif) — Configuration avancée

> ⚠️ **Attention :** Le mode IPS bloque le trafic en temps réel. Une mauvaise règle peut couper des services légitimes. Testez toujours en mode IDS d'abord.

```bash
# Activer le mode IPS via NFQueue (iptables)
# Rediriger le trafic entrant vers la queue Suricata
sudo iptables -I FORWARD -j NFQUEUE --queue-num 0
sudo iptables -I INPUT -j NFQUEUE --queue-num 0
sudo iptables -I OUTPUT -j NFQUEUE --queue-num 0

# Dans suricata.yaml, changer le mode de capture :
# nfq:
#   mode: accept
#   queue-len: 4096

# Démarrer Suricata en mode IPS
sudo suricata --nfq-mode -q 0 -D

# Pour qu'une règle BLOQUE au lieu d'alerter,
# changer "alert" en "drop" dans la règle :
# drop tcp $HOME_NET any -> $EXTERNAL_NET 4444 (...)
```

---

#### Récapitulatif des fichiers importants Suricata

```
/etc/suricata/suricata.yaml          → Configuration principale
/var/lib/suricata/rules/             → Règles téléchargées
/var/log/suricata/fast.log           → Alertes format texte (rapide)
/var/log/suricata/eve.json           → Alertes format EVE JSON (complet)
/var/log/suricata/stats.log          → Statistiques de performance
/var/run/suricata/suricata-command.socket → Interface de commande
```

**Commandes utiles :**
```bash
# Recharger les règles sans redémarrer
sudo kill -USR2 $(pidof suricata)

# Afficher les statistiques
sudo suricatasc -c /var/run/suricata/suricata-command.socket dump-counters

# Tester une règle spécifique sur un fichier PCAP
sudo suricata -r capture.pcap -c /etc/suricata/suricata.yaml -l /tmp/test-output/

# Vérifier les performances en temps réel
sudo watch -n 1 "cat /var/log/suricata/stats.log | grep -E 'capture|decoder|detect' | tail -20"
```

---

## 5. La Sainte Trinité SOC — Graylog + Wazuh + Suricata {#5-trinite-soc}

### 🏙️ Pourquoi "Sainte Trinité" ?

> 💡 **Analogie :**
> Imaginez une forteresse médiévale. Elle a besoin de trois lignes de défense :
> - Les **archers sur les remparts** (Suricata) : ils voient tout ce qui approche par le réseau
> - Les **gardes à l'intérieur** (Wazuh) : ils surveillent chaque pièce, chaque couloir, chaque serf
> - Le **général dans la tour de commandement** (Graylog) : il reçoit tous les rapports, prend les décisions, garde la mémoire de tous les incidents

**Ajouter Wazuh et Suricata à Graylog transforme votre installation d'un simple gestionnaire de logs en une véritable forteresse de cybersécurité.**

---

### 🎭 5.1 Le rôle de chaque outil (détail)

| Outil | Rôle principal | Ce qu'il surveille | Ce qu'il ne fait PAS |
|---|---|---|---|
| **Wazuh** | HIDS / EDR | L'intérieur de vos serveurs : fichiers modifiés, scans de ports, connexions root, processus suspects | Il ne voit pas le trafic réseau entre machines |
| **Suricata** | NIDS / IPS | Le trafic réseau : tentatives d'intrusion, malwares, scans réseau, exfiltrations DNS | Il ne voit pas ce qui se passe à l'intérieur des machines |
| **Graylog** | SIEM / Centralisateur | Récupère les alertes des deux autres pour les corréler, les afficher et les archiver | Il ne détecte pas par lui-même (Open) — il analyse ce qu'on lui envoie |

> 💡 **C'est exactement pour ça qu'on les combine.** Chacun a un angle mort que les deux autres couvrent.

---

### 💡 5.2 Pourquoi les combiner ? — Le cas pratique

**Scénario : Attaque réelle sur une instance Odoo**

> 💡 Ce scénario illustre pourquoi ni Suricata seul, ni Wazuh seul, ni Graylog seul ne suffisent — mais ensemble, ils forment un SOC complet.

```
⏱️ T+0 : RECONNAISSANCE

Attaquant (IP: 185.220.101.33) scanne les ports de votre serveur Odoo

🎥 SURICATA voit :
   → "Nmap SYN scan depuis 185.220.101.33"
   → Alerte EVE JSON générée → Filebeat → Graylog
   ✅ Suricata : DÉTECTE
   ❌ Wazuh   : Ne voit rien (trafic réseau externe non encore sur le serveur)

⏱️ T+3min : EXPLOITATION

L'attaquant envoie une requête SQL Injection sur le formulaire de login Odoo

🎥 SURICATA voit :
   → "ET WEB_SPECIFIC_APPS SQL Injection attempt"
   → Alerte EVE JSON → Graylog

👮 WAZUH voit (sur le serveur Odoo) :
   → Log nginx : "HTTP 500 - /web/login - 185.220.101.33"
   → Alerte niveau 6 "Erreur serveur web"

⏱️ T+5min : INTRUSION RÉUSSIE

L'attaquant a accès au shell via une webshell uploadée

👮 WAZUH voit :
   → FIM : nouveau fichier .php dans /var/www/odoo/static/
   → Processus "python3 -c import socket,subprocess..." lancé
   → Connexion sortante depuis nginx vers IP externe
   → ALERTE CRITIQUE niveau 14

🎥 SURICATA voit :
   → Connexion TCP sortante vers 185.220.101.44:4444
   → "ET MALWARE Generic Reverse Shell Detected"

⏱️ T+5min30 : GRAYLOG CORRÈLE TOUT

🖥️ GRAYLOG reçoit :
   Event 1 : Scan (Suricata)  — src_ip: 185.220.101.33
   Event 2 : SQLi (Suricata) — src_ip: 185.220.101.33
   Event 3 : FIM (Wazuh)      — Nouveau fichier .php suspect
   Event 4 : Rev shell (Wazuh + Suricata) — CRITIQUE

   CORRÉLATION : "La même IP (185.220.101.33) a d'abord scanné,
   puis tenté une injection SQL, puis une webshell a été déposée,
   puis un reverse shell a été établi depuis le serveur Odoo."

   → UNE SEULE ALERTE CRITIQUE au lieu de 4 notifications isolées
   → CASE créé automatiquement : "Incident-Odoo-2024-0015"
   → Slack #soc-critical notifié
   → Ticket Jira créé
```

**Sans Graylog :** Vous recevez 4 emails séparés sans lien entre eux.
**Sans Suricata :** Vous ne voyez pas le scan initial et l'injection SQL.
**Sans Wazuh :** Vous ne voyez pas la webshell ni les commandes exécutées.
**Avec les trois :** Vous avez une timeline complète de l'attaque en < 6 minutes.

---

### 🏗️ 5.3 Architecture de production recommandée

```
╔═══════════════════════════════════════════════════════════════════╗
║                    DATACENTER / CLOUD                            ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         ║
║  │Serveur   │  │ Poste    │  │Serveur   │  │Container │         ║
║  │Linux     │  │Windows   │  │Web/App   │  │Docker    │         ║
║  │[Wazuh Ag]│  │[Wazuh Ag]│  │[Wazuh Ag]│  │[Wazuh Ag]│         ║
║  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘         ║
║       └─────────────┴─────────────┴──────┬────────┘             ║
║                                          │ Port 1514 (TLS)      ║
║                             ┌────────────▼──────────────┐       ║
║                             │      WAZUH MANAGER        │       ║
║                             │   + Indexer + Dashboard   │       ║
║                             └────────────┬──────────────┘       ║
║                                          │ Alertes Wazuh        ║
║  Trafic réseau (SPAN/TAP)                │ (Filebeat/GELF)      ║
║  ┌────────────────┐                      │                      ║
║  │   SURICATA     │                      │                      ║
║  │   IDS/IPS      │                      │                      ║
║  │ Interface eth1 │                      │                      ║
║  │ (mode miroir)  │                      │                      ║
║  └───────┬────────┘                      │                      ║
║          │ EVE JSON (Filebeat)            │                      ║
║          └──────────────┬────────────────┘                      ║
║                         │                                       ║
║               ┌──────────▼──────────┐                          ║
║               │      GRAYLOG        │                          ║
║               │   SIEM Central      │                          ║
║               │  + OpenSearch       │                          ║
║               │  + MongoDB          │                          ║
║               └──────────┬──────────┘                          ║
║                          │                                      ║
║             ┌────────────┼────────────┐                        ║
║             ▼            ▼            ▼                        ║
║       📊 Dashboards  🔔 Alertes   🎫 Tickets                  ║
║       Temps réel    Email/Slack  Jira/ServiceNow               ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

### 🔧 5.4 Intégration technique — Comment les connecter

#### A. Architecture avec conteneurs Docker

> 💡 **Idéale pour un lab DevSecOps ou une PME souhaitant démarrer rapidement.**

```yaml
# docker-compose.yml simplifié
version: '3.8'
services:

  # ── SURICATA ──────────────────────────────────────────────
  suricata:
    image: jasonish/suricata:latest
    network_mode: host              # Accès à l'interface réseau hôte
    cap_add:
      - NET_ADMIN
      - NET_RAW
    volumes:
      - ./suricata/config:/etc/suricata
      - suricata-logs:/var/log/suricata
    command: -i eth0 --af-packet

  # ── FILEBEAT (relais Suricata → Graylog) ─────────────────
  filebeat-suricata:
    image: elastic/filebeat:8.12.0
    volumes:
      - suricata-logs:/var/log/suricata:ro
      - ./filebeat/suricata.yml:/usr/share/filebeat/filebeat.yml:ro
    depends_on:
      - suricata

  # ── WAZUH MANAGER ────────────────────────────────────────
  wazuh-manager:
    image: wazuh/wazuh-manager:4.8.0
    ports:
      - "1514:1514/tcp"   # Agents
      - "1515:1515/tcp"   # Enregistrement
    volumes:
      - wazuh-data:/var/ossec/data
    environment:
      - WAZUH_MANAGER_IP=wazuh-manager

  # ── GRAYLOG ───────────────────────────────────────────────
  mongodb:
    image: mongo:6.0
    volumes:
      - mongodb-data:/data/db

  opensearch:
    image: opensearchproject/opensearch:2.12.0
    environment:
      - discovery.type=single-node
      - plugins.security.disabled=true
      - "OPENSEARCH_JAVA_OPTS=-Xms2g -Xmx2g"
    volumes:
      - opensearch-data:/usr/share/opensearch/data

  graylog:
    image: graylog/graylog:6.1
    ports:
      - "9000:9000"     # Interface web
      - "12201:12201/udp"  # GELF UDP
      - "514:514/udp"   # Syslog UDP
      - "5044:5044/tcp" # Beats
    environment:
      - GRAYLOG_PASSWORD_SECRET=MinimumPasswordSecretWith16Characters
      - GRAYLOG_ROOT_PASSWORD_SHA2=8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918
      - GRAYLOG_HTTP_EXTERNAL_URI=http://localhost:9000/
      - GRAYLOG_ELASTICSEARCH_HOSTS=http://opensearch:9200
      - GRAYLOG_MONGODB_URI=mongodb://mongodb/graylog
    depends_on:
      - mongodb
      - opensearch

volumes:
  suricata-logs:
  wazuh-data:
  mongodb-data:
  opensearch-data:
```

#### B. Architecture sur VMs distinctes

```
VM 1 : Graylog Server      → 16 Go RAM, 8 CPU, 200 Go disque
VM 2 : Wazuh Manager       → 8 Go RAM, 4 CPU, 100 Go disque
VM 3 : Suricata IDS        → 4 Go RAM, 4 CPU, 50 Go disque
                             (+ accès au trafic réseau via TAP/SPAN)
```

#### C. Configuration Filebeat pour relayer les alertes Wazuh vers Graylog

```yaml
# /etc/filebeat/filebeat.yml sur le serveur Wazuh
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /var/ossec/logs/alerts/alerts.json
    json.keys_under_root: true
    json.add_error_key: true
    
  - type: log
    enabled: true
    paths:
      - /var/log/suricata/eve.json
    json.keys_under_root: true
    
output.logstash:
  hosts: ["GRAYLOG_IP:5044"]

fields:
  source_type: "security-stack"
```

---

### ✅❌ 5.5 Avantages & Inconvénients du combo Graylog + Wazuh + Suricata

#### ✅ Avantages

| Avantage | Détail |
|---|---|
| **Visibilité à 360°** | Réseau (Suricata) + Hôtes (Wazuh) + Corrélation (Graylog) = couverture complète |
| **Open Source & Gratuit** | Puissance équivalente à des solutions coûtant des dizaines de milliers d'euros |
| **Conformité** | Répond aux exigences ISO 27001, RGPD, NIS2, PCI-DSS avec la bonne configuration |
| **Flexibilité totale** | Tout est personnalisable — règles, dashboards, alertes, intégrations |
| **Communauté active** | Des milliers de règles, dashboards et configurations partagés gratuitement |
| **Évolutif** | Commence petit (1 VM), s'étend à des centaines de nœuds |
| **Multi-plateforme** | Linux, Windows, macOS, conteneurs, cloud — Wazuh surveille tout |
| **Standard industrie** | Sigma, MITRE ATT&CK, EVE JSON — compatibles avec l'écosystème cybersécurité |

#### ❌ Inconvénients

| Inconvénient | Détail | Solution |
|---|---|---|
| **Complexité de configuration** | Configurer les règles Suricata et les décodeurs Wazuh demande du temps et de l'expertise | Formation, documentation, aide communautaire |
| **Consommation ressources** | Wazuh + Graylog + OpenSearch : minimum 8 Go RAM, idéalement 16–24 Go | Prévoir le sizing dès le départ |
| **Pas de SOAR natif** | Détection excellente, réponse automatisée limitée | Intégrer TheHive + Shuffle, ou Wazuh Active Response |
| **Maintenance continue** | Mises à jour, tuning des règles, gestion des faux positifs | Automatiser avec Ansible, planifier du temps |
| **Courbe d'apprentissage** | 3 outils distincts à maîtriser | Formation progressive — commencer par Wazuh all-in-one |
| **Pas d'IA/ML avancé** | Détection d'anomalies limitée par rapport aux solutions cloud | Compenser avec des règles de corrélation bien écrites |

---

### 💾 5.6 Dimensionnement selon la taille

| Organisation | Agents Wazuh | EPS* | Config recommandée | RAM totale | Coût infra/mois |
|---|---|---|---|---|---|
| **Lab / TPE** | < 10 | < 100 | 1 VM tout-en-un | 8 Go | ~50€ |
| **PME** | 10–100 | 100–1 000 | 3 VMs dédiées | 24 Go total | ~300€ |
| **ETI** | 100–500 | 1 000–5 000 | Cluster Graylog, Wazuh distribué | 64 Go total | ~1 000€ |
| **Grande entreprise** | > 500 | > 5 000 | Architecture HA distribuée, S3 archive | 128+ Go | ~5 000€ |

> *EPS = Events Per Second (événements par seconde ingérés)

## 6. Cas d'usage par secteur {#6-cas-dusage}

### 🏦 6.1 Secteur Bancaire et Financier

**Contraintes réglementaires :** DORA (2025), PCI-DSS v4, RGPD, NIS2, directive BCBS

> 💡 **Analogie :**
> Une banque, c'est un coffre-fort géant avec des milliers de portes et de tiroirs. Chaque employé a une clé différente qui ouvre seulement certaines portes. La cybersécurité bancaire doit savoir en permanence : qui a ouvert quelle porte, à quelle heure, combien de temps, ce qu'il a pris. Et si quelqu'un essaie d'ouvrir une porte qui ne lui appartient pas — même avec la bonne clé — il faut le détecter immédiatement.

**Menaces principales dans le secteur bancaire :**

| Menace | Fréquence | Impact |
|---|---|---|
| Fraude interne (employés) | Élevée | Financier + Réputation |
| Ransomware ciblé | Moyenne | Opérationnel critique |
| Attaque supply chain (prestataires) | Croissante | Systémique |
| Phishing dirigés (spear phishing) | Très élevée | Point d'entrée initial |
| DDoS sur plateformes bancaires | Élevée | Disponibilité, perte revenus |
| Fraude aux virements (BEC) | Élevée | Financier direct |

**Cas d'usage avec Graylog + Wazuh + Suricata :**

```
Scénario 1 : FRAUDE INTERNE
─────────────────────────────
Employé du back-office accède à 500 dossiers clients (hors de son périmètre)
à 22h depuis son domicile.

• Wazuh : Alerte accès inhabituels base de données (heure + volume)
• Graylog : Corrèle avec l'historique → "comportement 10x supérieur à la normale"
• Action : Alerte compliance + blocage compte en attente vérification

Scénario 2 : RANSOMWARE
─────────────────────────────
Poste d'un opérateur bancaire infecté par Ransomware (via faux PDF reçu par email)

• Suricata : Connexion sortante vers C2 connu (règle ET MALWARE)
• Wazuh FIM : 2 000 fichiers chiffrés en 3 minutes → alerte CRITIQUE
• Wazuh : Détection "vssadmin delete shadows" (suppression sauvegardes)
• Active Response : Isolation automatique du poste
• Graylog : Case créé, ticket SIEM envoyé automatiquement

Scénario 3 : CONFORMITÉ PCI-DSS
─────────────────────────────
Audit PCI-DSS trimestriel approchant

• Wazuh SCA : Génère rapport conformité CIS Benchmark automatique
• Graylog : Rapport des 90 derniers jours d'accès aux données cartes
• Dashboard dédié : Score de conformité en temps réel par service
```

**Règle Graylog pour fraude bancaire :**
```
CONDITION : count(event_type:db_access AND user:${user}) > 100 in 1h
AND hour_of_day NOT IN [8, 9, 10, ..., 18]
→ ALERTE "Accès hors-horaires excessifs - possible fraude interne"
```

---

### 🏥 6.2 Secteur Santé

**Contraintes réglementaires :** HDS (Hébergeur Données de Santé), RGPD, NIS2, HIPAA (US)

> 💡 **Analogie :**
> Dans un hôpital, le dossier médical d'un patient, c'est son ADN numérique : ultra-sensible, protégé par la loi, et convoité par les cybercriminels (valeur 10x supérieure aux données bancaires sur le darkweb). Imaginez que chaque médecin, infirmier, secrétaire médicale ait une clé différente, et que Wazuh surveille chaque accès à chaque dossier — 24h/24, 7j/7.

**Équipements médicaux connectés (IoMT) surveillés par Suricata :**
```
• Scanners IRM / Scanner CT → protocole DICOM
• Pompes à perfusion connectées → Ethernet/WiFi
• Moniteurs cardiaques → HL7
• Systèmes de stérilisation → MODBUS
• Systèmes de gestion pharmacie → FHIR
```

**Cas d'usage :**

| Scénario | Outil | Règle/Action |
|---|---|---|
| Accès non autorisé au DPI (ex: médecin consulte dossier hors patient) | Wazuh + Graylog | Alerte si accès à dossier sans rdv correspondant |
| Ransomware WannaCry (ciblage hôpitaux) | Suricata + Wazuh | Détection exploit SMB + chiffrement fichiers |
| Exfiltration dossiers patients vers cloud personnel | Suricata | Upload >100Mo vers Dropbox/Google Drive personnel |
| Mise à disposition équipement biomédical sur internet | Suricata | Connexion DICOM depuis IP externe → BLOQUÉ |
| Audit conformité HDS | Wazuh SCA | Rapport audit mensuel automatique |

---

### ⚡ 6.3 Secteur Énergie et Infrastructures Critiques

**Contraintes réglementaires :** NIS2, IEC 62443, LPM/LOPMI (France), NERC CIP (US)

> 💡 **Analogie :**
> Une centrale électrique ou un réseau d'eau, c'est comme le **système nerveux de toute une région**. Si un attaquant prend le contrôle du logiciel qui gère les vannes d'une centrale hydraulique, il peut provoquer des inondations. Si un ransomware chiffre les systèmes de contrôle, des milliers de foyers perdent l'électricité. C'est pourquoi Suricata, capable de comprendre les protocoles industriels (Modbus, DNP3), est particulièrement précieux ici.

**Architecture IT/OT spécifique à l'énergie :**

```
┌─────────────────┐    DMZ industrielle    ┌──────────────────┐
│   RÉSEAU IT     │◄──────────────────────►│  RÉSEAU OT/ICS   │
│ (bureaux, ERP)  │   [Suricata surveille  │ (automates, SCADA│
│  [Wazuh agents] │    TOUT ce qui traverse│  PLCs, HMI...)   │
└─────────────────┘    la DMZ]             └──────────────────┘
         │                                          │
         └──────────────────┬───────────────────────┘
                            ▼
                       GRAYLOG SIEM
                  (alerte si IT → OT suspect)
```

**Règle Suricata pour protocoles industriels :**
```suricata
# Détecter une commande Modbus d'écriture (Write) anormale
alert modbus any any -> $OT_SERVERS any (
  msg:"MODBUS Write Command - Possible unauthorized control";
  modbus.function:16;    # Function 16 = Write Multiple Registers
  threshold: type limit, track by_src, count 1, seconds 60;
  classtype:policy-violation;
  sid:7001001;
)
```

---

### 🚌 6.4 Secteur Transport

**Contraintes :** NIS2, réglementation DGAC (aérien), SNCF Réseau, RATP

> 💡 **Analogie :**
> Un réseau de transport, c'est comme un organisme vivant avec des milliers de nerfs : systèmes de billetique, signalisation ferroviaire, GPS de flottes, gestion des vols, contrôle du trafic. Si un composant est compromis, c'est potentiellement la sécurité de milliers de voyageurs qui est en jeu.

**Cas d'usage spécifiques :**

| Secteur transport | Menace | Outil | Détection |
|---|---|---|---|
| **Ferroviaire** | Manipulation signalisation | Wazuh FIM | Modification binaires systèmes critiques |
| **Aérien** | Fausse alerte bagages | Suricata | Accès non autorisé aux systèmes bagages |
| **Maritime** | Faux positionnement GPS (spoofing) | Suricata | Anomalie trafic AIS/GPS |
| **Urbain (bus/métro)** | Ransomware billetique | Wazuh + Graylog | Chiffrement fichiers + alerte critique |
| **Logistique** | Vol de données de fret | Suricata | Exfiltration données WMS |

---

### 🏢 6.5 Secteur Assurance

**Contraintes :** Solvabilité II, DORA (2025), RGPD, NIS2

> 💡 **Analogie :**
> Une compagnie d'assurance, c'est une **bibliothèque des vulnérabilités humaines** : elle sait exactement qui est malade, qui a eu un accident, qui a des problèmes financiers, qui a une maison de valeur. Ces données sont une cible de choix pour les cybercriminels et pour les fraudeurs internes. Graylog permet d'auditer chaque accès, de détecter les comportements anormaux et de prouver la conformité réglementaire.

**Cas d'usage :**

| Scénario | Outils | Valeur ajoutée |
|---|---|---|
| Fraude au dossier sinistre (employé modifie un sinistre) | Wazuh FIM + Graylog | Détection modification base de données |
| Exfiltration portefeuille clients | Suricata | Alerte gros volumes vers destinations inconnues |
| Intrusion via courtier partenaire | Suricata + Wazuh | Détection comportement anormal compte partenaire |
| Rapport conformité Solvabilité II | Graylog + Wazuh | Export automatique des contrôles d'accès |
| Compromission d'un agent commercial | Wazuh | Exécution outils hacking sur poste professionnel |

---

## 7. Comparaison avec les solutions Cloud {#7-comparaison-cloud}

### 📊 7.1 Microsoft Sentinel (Azure)

> 💡 **Analogie :**
> Si Graylog + Wazuh + Suricata, c'est un **couteau suisse que vous assemblez et affûtez vous-même** (puissant, flexible, mais demande du temps et de l'expertise), Microsoft Sentinel est un **robot culinaire haut de gamme** : il sort de la boîte prêt à l'emploi, vous n'avez pas à vous soucier de l'entretien, mais vous payez l'abonnement chaque mois — et si vous arrêtez de payer, vous perdez tout accès à vos données.

**Présentation de Microsoft Sentinel :**
Microsoft Sentinel est un SIEM/SOAR cloud-native, entièrement managé sur Azure. Il s'appuie sur **Log Analytics Workspace** et s'intègre nativement à tout l'écosystème Microsoft : M365, Azure AD, Defender for Endpoint, Defender for Cloud.

**Comparaison détaillée :**

| Critère | Open Source (Graylog + Wazuh + Suricata) | Microsoft Sentinel |
|---|---|---|
| **Coût licences** | 0€ | ~2–5€ / Go ingéré / mois |
| **Coût infrastructure** | 300–2000€/mois (serveurs) | Inclus dans pay-per-use |
| **Déploiement** | 1–3 semaines (expertise requise) | Quelques heures |
| **Maintenance** | Équipe interne (mises à jour, tuning) | Managé par Microsoft |
| **Connecteurs natifs** | 300+ (communautaires) | 200+ Microsoft + 300 partenaires |
| **SOAR (automatisation)** | Via intégrations externes (TheHive, Shuffle) | Natif (Logic Apps / Playbooks) |
| **Machine Learning** | Limité (règles manuelles) | Avancé (Azure ML, UEBA natif) |
| **Threat Intelligence** | Manuel (MISP, OTX) | Microsoft TI intégré (TI Map) |
| **Sigma Rules** | ✅ Via Graylog Security | ✅ Via Sentinel Analytics |
| **Analyse comportementale** | ⚠️ Partielle (Graylog Security) | ✅ UEBA natif Microsoft |
| **Surveillance réseau** | ✅ Suricata (très détaillé) | ⚠️ Basique (pas d'équivalent Suricata) |
| **Surveillance endpoints** | ✅ Wazuh (agents partout) | ✅ Defender for Endpoint (payant) |
| **Souveraineté des données** | ✅ On-premise possible | ❌ Données dans Azure (région configurable) |
| **Conformité NIS2/LPM** | ✅ Contrôle total | ⚠️ Dépend du contrat Microsoft |
| **Personnalisation** | ✅ Totale (tout configurable) | ✅ Bonne (KQL queries) |
| **Scalabilité** | Manuelle (ajout de nœuds) | Automatique (cloud) |
| **Courbe d'apprentissage** | Élevée (3+ outils à maîtriser) | Moyenne (KQL à apprendre) |
| **Forensics réseau** | ✅ PCap complet avec Suricata | ❌ Pas d'équivalent |

**Tarification Microsoft Sentinel (estimation 2024) :**

```
┌─────────────────────────────────────────────────────────────┐
│              COÛT SENTINEL (Pay-As-You-Go)                  │
├────────────────────┬───────────┬───────────────────────────┤
│ Volume quotidien   │ Prix/Go   │ Coût mensuel estimé        │
├────────────────────┼───────────┼───────────────────────────┤
│ 1 Go/jour          │ ~2.46€    │ ~75€/mois                 │
│ 10 Go/jour         │ ~2.46€    │ ~740€/mois                │
│ 50 Go/jour         │ ~2.46€    │ ~3 700€/mois              │
│ 100 Go/jour        │ ~2.10€    │ ~6 300€/mois (commitment) │
│ 500 Go/jour        │ ~1.80€    │ ~27 000€/mois             │
└────────────────────┴───────────┴───────────────────────────┘
Note : Les "Commitment Tiers" réduisent le prix de 15 à 60%
```

**Points forts de Sentinel :**
- Intégration M365/Azure AD parfaite (sans agent)
- SOAR complet avec Logic Apps
- Mise à jour automatique des règles de détection
- Support Microsoft Enterprise inclus
- Conformité certifications cloud Microsoft

**Points faibles de Sentinel :**
- Coût élevé à grande échelle
- Pas d'équivalent à Suricata pour la profondeur réseau
- Dépendance totale à Microsoft
- Données hébergées chez un acteur non-européen (CLOUD Act)

---

### ☁️ 7.2 AWS Security Hub + Amazon GuardDuty

> 💡 **Analogie :**
> GuardDuty + Security Hub, c'est le **détective privé spécialisé de l'immeuble Amazon**. Il connaît parfaitement chaque couloir, chaque ascenseur, chaque serrure de l'immeuble AWS. Mais si vous avez aussi des bureaux ailleurs (datacenter, Azure, on-premise), il est un peu perdu hors de son territoire.

**L'écosystème de sécurité AWS :**

| Service AWS | Équivalent open source | Description |
|---|---|---|
| **Amazon GuardDuty** | Wazuh + Suricata (cloud) | Détection menaces sur AWS (ML) |
| **AWS Security Hub** | Graylog | Centralisation et corrélation findings |
| **Amazon Inspector** | Wazuh Vuln. Detector | Scan vulnérabilités EC2/containers |
| **AWS CloudTrail** | Wazuh (log cloud) | Audit de toutes les actions AWS |
| **Amazon Detective** | Graylog (investigation) | Analyse graphique des incidents |
| **AWS WAF** | Suricata (IPS applicatif) | Filtrage applicatif web |
| **AWS Shield** | Suricata (réseau) | Protection DDoS |
| **VPC Flow Logs** | Suricata EVE JSON | Logs de flux réseau VPC |
| **Amazon Macie** | Wazuh (DLP) | Détection données sensibles S3 |

**Comparaison détaillée :**

| Critère | Open Source (Graylog + Wazuh + Suricata) | AWS Security Hub + GuardDuty |
|---|---|---|
| **Coût** | Infrastructure fixe | Variable (par événement analysé) |
| **Périmètre** | Multi-cloud + on-premise + réseau | Principalement environnement AWS |
| **Déploiement** | Complexe (expertise requise) | Simple (AWS Console) |
| **Règles de détection** | Totalement personnalisables | Managées par AWS (ML) |
| **Faux positifs** | À calibrer manuellement | Peu (ML AWS bien calibré) |
| **Forensics réseau** | ✅ PCAP complet (Suricata) | ⚠️ VPC Flow Logs (métadonnées seulement) |
| **Surveillance endpoints** | ✅ Wazuh (agents) | ⚠️ Systems Manager + Inspector |
| **Souveraineté** | ✅ Données chez vous | ❌ Données AWS (CLOUD Act) |
| **Analyse comportementale** | ⚠️ Via Graylog Security | ✅ GuardDuty ML natif |
| **Intégration AWS native** | ⚠️ Requires configuration | ✅ Natif (1 clic) |
| **Support** | Communauté + prestataires | AWS Support (payant) |
| **Scalabilité** | Manuelle | Automatique (serverless) |

**Tarification AWS GuardDuty (estimation 2024) :**

```
GuardDuty analyse plusieurs types de sources :
• CloudTrail events : ~4$ / million d'événements
• VPC Flow Logs : ~1$ / Go analysé  
• DNS logs : ~0.80$ / million de requêtes
• EKS/Runtime: variable selon utilisation

Pour une infrastructure moyenne (100 instances EC2) :
→ Estimation : 200 à 800€/mois pour GuardDuty seul
```

---

### 🏆 7.3 Matrice de décision complète

```
┌──────────────────────────────────────────────────────────────────┐
│                    AIDE À LA DÉCISION                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Q1 : Avez-vous une équipe technique SOC interne ?              │
│       ├── NON ──► Q2                                            │
│       └── OUI ──► Q3                                            │
│                                                                  │
│  Q2 : Avez-vous un MSSP (prestataire sécurité managée) ?        │
│       ├── NON ──► 🤝 Recommandation : Commencer par Sentinel    │
│       │              ou GuardDuty selon votre cloud principal   │
│       └── OUI ──► Le MSSP choisit souvent open source          │
│                                                                  │
│  Q3 : Êtes-vous principalement sur un seul cloud ?              │
│       ├── Azure/M365 ──► 🔵 Microsoft Sentinel (natif)         │
│       ├── AWS ──────────► 🟠 AWS Security Hub + GuardDuty       │
│       └── Hybride/Multi ─► Q4                                   │
│                                                                  │
│  Q4 : Avez-vous des contraintes de souveraineté des données ?   │
│       ├── OUI (NIS2/LPM/Défense) ──► 🟢 Open Source (on-prem) │
│       └── NON ──► Q5                                            │
│                                                                  │
│  Q5 : Quel est votre budget mensuel SIEM ?                      │
│       ├── < 500€/mois ──► 🟢 Open Source                        │
│       ├── 500€–5k€/mois ─► Mix Open Source + Security add-ons  │
│       └── > 5k€/mois ──────► Cloud SIEM ou MSSP                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Tableau de synthèse final :**

| Critère | Open Source | Sentinel | AWS |
|---|---|---|---|
| **Budget limité** | ✅✅ | ❌ | ⚠️ |
| **Équipe technique** | Requise | Légère | Légère |
| **Environnement Microsoft** | ⚠️ | ✅✅ | ❌ |
| **Environnement AWS** | ⚠️ | ❌ | ✅✅ |
| **On-premise fort** | ✅✅ | ⚠️ | ⚠️ |
| **Souveraineté données** | ✅✅ | ⚠️ | ⚠️ |
| **Profondeur réseau** | ✅✅ | ❌ | ⚠️ |
| **Déploiement rapide** | ❌ | ✅✅ | ✅✅ |
| **SOAR natif** | ⚠️ | ✅✅ | ✅ |
| **ML / UEBA** | ⚠️ | ✅✅ | ✅✅ |
| **Conformité réglementaire EU** | ✅✅ | ⚠️ | ⚠️ |

---

## 8. Tendances du marché {#8-tendances}

### 📈 8.1 Chiffres clés

| Indicateur | Valeur 2024 | Projection 2027 |
|---|---|---|
| Marché SIEM mondial | ~5.5 Mds $ | ~9.8 Mds $ |
| Croissance annuelle (CAGR) | ~14% | — |
| Part cloud SIEM | ~45% | ~65% |
| Part open source SIEM | ~20% | ~25% |
| Wazuh téléchargements | > 15 millions | — |
| Suricata déploiements actifs | > 500 000 | — |
| Organisations victimes ransomware / an | ~66% | — |
| Coût moyen d'une violation de données | ~4.5 M$ | — |

---

### 🔮 8.2 Les 8 grandes tendances

#### 1. 🔄 Convergence SIEM + SOAR + XDR

> 💡 **Analogie :** Avant, les forces de l'ordre avaient des radios séparées, des bases de données séparées, des voitures séparées, et personne ne se parlait. Aujourd'hui, tout est intégré dans un système de commandement unifié où chaque information est automatiquement partagée et les réponses sont coordonnées. C'est exactement cette convergence qui s'opère dans le SIEM.

```
SIEM (détecter) + SOAR (automatiser) + XDR (corrélation étendue)
                          │
                          ▼
                SecOps Platform Unifiée
            (Wazuh 4.x + Graylog Security)
```

**Wazuh s'oriente XDR :** depuis 2023, Wazuh peut isoler automatiquement un hôte compromis, bloquer une IP, supprimer un processus malveillant — sans intervention humaine.

#### 2. 🤖 IA et Machine Learning dans la détection

| Capacité | Open Source aujourd'hui | Tendance 2025–2026 |
|---|---|---|
| Détection d'anomalies | ⚠️ Limitée | ✅ Plugins ML disponibles |
| UEBA comportemental | ⚠️ Graylog Security | ✅ Wazuh UEBA en développement |
| Réduction faux positifs | ❌ Manuel | ✅ Auto-tuning ML |
| Threat Hunting assisté | ❌ | ✅ LLM / ChatGPT-like queries |
| Résumé incidents auto | ❌ | ✅ Génération rapport IA |

#### 3. ☁️ SIEM Cloud-Native et hybride

Les organisations **full-cloud** adoptent des SIEMs natifs (Sentinel, GuardDuty).
Les environnements **hybrides** (cloud + on-premise) restent sur open source ou solutions mixtes.
Les organisations soumises à la **souveraineté des données** (défense, énergie, santé) maintiennent des déploiements on-premise.

#### 4. 📜 NIS2, DORA et RGPD comme accélérateurs

- **NIS2** (transposée en France en 2024) : impose des capacités de détection et réponse aux incidents pour ~10 000 nouvelles entités en France
- **DORA** (Digital Operational Resilience Act, 2025) : impose des exigences SIEM spécifiques pour le secteur financier européen
- **RGPD** : les violations de données doivent être notifiées en 72h — impossible sans SIEM

> 💡 Ces réglementations ont **multiplié par 3 la demande** de solutions SIEM en Europe depuis 2022.

#### 5. 🧠 Threat Intelligence Partagée

```
STIX / TAXII                 → Standard d'échange d'IOCs
MISP                         → Plateforme open source de partage
ISAC sectoriels              → Partage entre acteurs d'un même secteur
                               (FS-ISAC pour la finance, H-ISAC pour la santé)
Wazuh CDB Lists              → Listes noires locales
Suricata Threat Intel feeds  → Règles ET Pro, abuse.ch
```

#### 6. 🏭 Sécurité OT/IoT — Nouveaux territoires

Suricata 7.0 et les évolutions de Wazuh étendent la surveillance aux environnements industriels :
- Protocoles Modbus, DNP3, EtherNet/IP, BACnet
- Équipements médicaux (DICOM, HL7, FHIR)
- IoT industriel (MQTT, CoAP)
- Véhicules connectés (CAN bus surveillance partielle)

#### 7. 🌐 SOC-as-a-Service (MSSPs)

De nombreuses PME n'ont pas les moyens d'avoir une équipe SOC interne. Les **MSSPs** (Managed Security Service Providers) opèrent Graylog/Wazuh pour leurs clients :

```
Client PME ──► MSSP (opère Graylog + Wazuh + Suricata)
              └── Forfait mensuel : 2 000–10 000€
              └── SLA : alertes traitées en < 30 min
              └── Rapport mensuel de sécurité
```

#### 8. 🔐 Zero Trust + SIEM

Le modèle **Zero Trust** ("ne jamais faire confiance, toujours vérifier") renforce le rôle du SIEM :
- Chaque accès est loggué et analysé
- Les comportements déviants sont détectés plus facilement
- Wazuh surveille les identités et les accès au niveau hôte
- Graylog corrèle les authentifications à travers tous les systèmes

---

## 9. Tableau récapitulatif final {#9-recapitulatif}

### 🥊 Comparaison des trois outils

| Critère | Graylog | Wazuh | Suricata |
|---|---|---|---|
| **Rôle principal** | SIEM / Centralisation logs | HIDS / EDR / XDR | IDS/IPS réseau |
| **Couche surveillée** | Agrégation | Hôte (endpoint) | Réseau (trafic) |
| **Langage** | Java | C / Python | C / Rust |
| **Licence** | SSPL (open core) | GPL v2 | GPL v2 |
| **Interface web native** | ✅ Très bonne | ✅ Bonne | ❌ Aucune |
| **Agents requis** | Via Beats/Sidecar | ✅ Agents natifs | ❌ N/A (passif) |
| **Stockage logs** | Elasticsearch/OpenSearch | OpenSearch | Fichiers EVE JSON |
| **Corrélation** | ✅ Avancée (Security) | ⚠️ Basique | ❌ Non |
| **Détection anomalies** | ✅ (Security) | ⚠️ Limitée | ❌ Règles seulement |
| **Conformité** | ✅ Via Security + Illuminate | ✅ PCI/HIPAA/GDPR natif | ❌ Non |
| **Scalabilité** | ✅ Cluster horizontal | ⚠️ Complexe >500 agents | ✅ Multi-thread |
| **Complexité déploiement** | ⭐⭐⭐ Moyenne-élevée | ⭐⭐ Moyenne | ⭐ Faible-moyenne |
| **Ressources requises** | 8–16 Go RAM min | 8 Go RAM min | 2–4 Go RAM min |
| **Communauté** | ⭐⭐⭐ Bonne | ⭐⭐⭐⭐ Très bonne | ⭐⭐⭐⭐⭐ Excellente |
| **Coût (open source)** | Gratuit (Security payant) | Gratuit | Gratuit |

---

### 🎯 Quelle combinaison pour quel besoin ?

| Besoin / Contexte | Recommandation |
|---|---|
| **SOC complet open source** | Graylog + Wazuh + Suricata |
| **Démarrer simplement (budget 0)** | Wazuh All-in-One + Suricata |
| **Surveillance réseau seulement** | Suricata + EVE JSON → Elastic/Graylog |
| **Surveillance endpoints seulement** | Wazuh seul |
| **Environnement Microsoft complet** | Microsoft Sentinel |
| **Environnement AWS natif** | GuardDuty + Security Hub |
| **Hybride cloud + on-premise** | Wazuh + Graylog + Sentinel |
| **Conformité NIS2 / DORA urgente** | Wazuh (frameworks intégrés) + Graylog |
| **Souveraineté données obligatoire** | Tout open source, on-premise |
| **PME sans équipe SOC** | MSSP avec open source ou Sentinel |
| **OT/ICS/SCADA** | Suricata (protocoles OT) + Wazuh |
| **Haute disponibilité critique** | Cluster Graylog + Wazuh distribué |

---

## 10. Glossaire {#10-glossaire}

| Terme | Définition simple | Analogie |
|---|---|---|
| **SIEM** | Collecte et corrèle les événements de sécurité | Salle de commandement de police |
| **HIDS** | Détection d'intrusion sur un hôte (machine) | Détective privé à domicile |
| **NIDS** | Détection d'intrusion sur le réseau | Caméra de surveillance à un carrefour |
| **IDS** | Détecte les attaques et alerte | Agent de sécurité qui crie "alerte" |
| **IPS** | Détecte ET bloque les attaques | Porte automatique qui refuse l'entrée |
| **EDR** | Protection endpoint avec capacité de réponse | Garde du corps avec kit médical |
| **XDR** | Détection étendue (endpoint + réseau + cloud) | Tour de contrôle tout-en-un |
| **SOAR** | Automatise la réponse aux incidents | Robot qui gère les urgences automatiquement |
| **SOC** | Centre opérationnel de sécurité | Commissariat de police numérique |
| **FIM** | Surveillance de l'intégrité des fichiers | Notaire qui certifie les documents |
| **SCA** | Évaluation de la configuration sécurité | Contrôle technique d'un véhicule |
| **CVE** | Identifiant d'une vulnérabilité connue | Numéro de dossier pour une faille de sécurité |
| **EPS** | Événements par seconde (charge du SIEM) | Débit de voitures sur une autoroute |
| **EVE JSON** | Format de sortie universel de Suricata | Rapport de police standardisé |
| **GELF** | Format de log natif Graylog (JSON) | Formulaire officiel structuré |
| **MITRE ATT&CK** | Catalogue des techniques d'attaques réelles | Manuel des méthodes criminelles |
| **TTP** | Tactiques, Techniques et Procédures des attaquants | Mode opératoire d'un criminel |
| **IOC** | Indicateur de Compromission | Empreinte digitale d'une intrusion |
| **Threat Intelligence** | Renseignement sur les cybermenaces | Fichier central des personnes recherchées |
| **MSSP** | Prestataire de sécurité managée | Société de gardiennage externalisée |
| **UEBA** | Analyse comportementale utilisateurs et entités | Profilage comportemental des employés |
| **JA3/JA3S** | Empreinte digitale d'une connexion TLS | Plaque d'immatriculation d'un véhicule chiffré |
| **PCI-DSS** | Standard sécurité données bancaires (cartes) | Norme de sécurité des coffres-forts bancaires |
| **RGPD** | Protection des données personnelles (EU) | Loi sur le secret du courrier |
| **NIS2** | Directive cybersécurité EU (2024) | Nouvelle réglementation de sécurité nationale |
| **DORA** | Résilience numérique secteur financier EU (2025) | Code de la route pour les banques numériques |
| **HDS** | Hébergeur de Données de Santé (certification FR) | Label qualité pour données médicales |
| **Sigma Rule** | Règle de détection universelle (standard) | Recette de cuisine internationale |
| **Lucene** | Langage de requête Graylog/Elasticsearch | Google pour les logs |
| **Baseline** | État de référence normal d'un système | Photo officielle d'un document |
| **PCAP** | Capture de trafic réseau brut | Enregistrement vidéo d'une caméra |
| **Hash / SHA256** | Empreinte cryptographique d'un fichier | ADN numérique d'un fichier |
| **Cluster** | Groupe de serveurs fonctionnant ensemble | Équipe de relais sportif |
| **Agent** | Petit logiciel installé sur une machine surveillée | Balise GPS sur un véhicule |

---

## 11. Ressources pour aller plus loin {#11-ressources}

### 📚 Documentation officielle

| Outil | Documentation | Lien |
|---|---|---|
| **Graylog** | Docs complètes | https://docs.graylog.org |
| **Wazuh** | Documentation officielle | https://documentation.wazuh.com |
| **Suricata** | Docs et guides | https://docs.suricata.io |

### 🎓 Formation et apprentissage

| Ressource | Contenu | Niveau |
|---|---|---|
| **Wazuh Training** | Cours officiels gratuits | Débutant → Avancé |
| **TryHackMe** | Labs SOC pratiques | Débutant → Intermédiaire |
| **Hack The Box Academy** | Sécurité défensive | Intermédiaire → Avancé |
| **SANS SEC555** | SIEM with Tactical Analytics | Expert |
| **LetsDefend.io** | Simulations SOC réalistes | Intermédiaire |
| **CyberDefenders** | Blue team challenges | Intermédiaire |

### 🔧 Règles et Threat Intelligence

| Source | Type | Gratuit |
|---|---|---|
| **Emerging Threats Open** | Règles Suricata/Snort | ✅ Oui |
| **SigmaHQ GitHub** | Sigma Rules (3000+) | ✅ Oui |
| **MISP Project** | Partage IOCs | ✅ Oui |
| **AlienVault OTX** | Threat Intelligence | ✅ Oui |
| **Abuse.ch** | Ransomware/Botnet IOCs | ✅ Oui |
| **MalwareBazaar** | Hashes malware | ✅ Oui |
| **MITRE ATT&CK** | Tactiques attaquants | ✅ Oui |
| **Emerging Threats Pro** | Règles premium | ❌ Payant |

### 🏆 Certifications recommandées

| Certification | Organisme | Pertinence SIEM |
|---|---|---|
| **CompTIA Security+** | CompTIA | Bases sécurité (débutant) |
| **Certified SOC Analyst (CSA)** | EC-Council | Opérations SOC (intermédiaire) |
| **GIAC GCIA** | SANS | Analyse intrusion réseau Suricata (expert) |
| **GIAC GCED** | SANS | Défense entreprise (expert) |
| **Microsoft SC-200** | Microsoft | Sentinel spécifique (intermédiaire) |
| **AWS Security Specialty** | AWS | AWS Security Hub (intermédiaire) |
| **Wazuh Certified Engineer** | Wazuh Inc. | Wazuh spécifique (intermédiaire) |

### 🌐 Communautés et veille

| Communauté | Plateforme |
|---|---|
| Wazuh Community | https://groups.google.com/g/wazuh |
| Graylog Community | https://community.graylog.org |
| Suricata Forum | https://forum.suricata.io |
| r/netsec | Reddit |
| Slack DFIR.community | Slack |
| Twitter/X #BlueTeam | Twitter/X |
| ANSSI (France) | https://www.ssi.gouv.fr |
| CERT-FR | https://www.cert.ssi.gouv.fr |

---

## 📝 Notes de version et remerciements

```
Document     : Documentation Pédagogique SIEM Open Source
Version      : 3.0 (complète — édition DevSecOps & Tout Public)
Date         : Avril 2026
Outils       : Graylog 5.x / Graylog Security, Wazuh 4.8, Suricata 7.x
OS testé     : Ubuntu 22.04 LTS

Nouveautés v3 :
  - Section Graylog Open vs Graylog Security (comparaison détaillée)
  - Comparaison Graylog vs ELK vs IBM QRadar vs Splunk
  - Vision DevSecOps avec cas pratiques (Keycloak, Odoo)
  - Bonnes pratiques + recommandations pour chaque outil
  - Limites documentées avec mitigations
  - Section "Sainte Trinité SOC" avec docker-compose
  - Guide de tuning faux positifs (Wazuh + Suricata)
  - Logrotate et gestion opérationnelle

Mise à jour  : Les versions des logiciels évoluent rapidement.
               Vérifiez toujours la documentation officielle
               pour les versions les plus récentes.

Licence      : CC BY-SA 4.0 — Libre de partager et d'adapter
               avec attribution obligatoire.
```

---

*🛡️ "La sécurité n'est pas un produit, c'est un processus." — Bruce Schneier*
