---
title: "Observabilité Haute Disponibilité"
description: "Thanos vs Mimir vs VictoriaMetrics — Comparatif Pédagogique"
created: "2026-04-09"
# updated: "2026-04-04"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"

---



<!-- # 📘 Guide Complet de l'Observabilité Haute Disponibilité
## Thanos vs Mimir vs VictoriaMetrics — Comparatif Pédagogique -->

> **Public cible :** Tout niveau — débutant curieux, développeur, SRE, architecte infrastructure.
> **Objectif :** Comprendre, choisir et mettre en œuvre la bonne solution de stockage long terme pour vos métriques Prometheus.

---

## Table des Matières

1. [Le Problème que ces outils résolvent](#1-le-problème-que-ces-outils-résolvent)
2. [Vue d'ensemble rapide](#2-vue-densemble-rapide)
3. [Thanos — L'Extension Modulaire](#3-thanos--lextension-modulaire)
4. [Grafana Mimir — La Puissance Industrielle](#4-grafana-mimir--la-puissance-industrielle)
5. [VictoriaMetrics — La Performance Brute](#5-victoriametrics--la-performance-brute)
6. [Comparatif Décisionnel](#6-comparatif-décisionnel)
7. [Cas Pratiques Sectoriels](#7-cas-pratiques-sectoriels)
8. [Bonnes Pratiques en Production](#8-bonnes-pratiques-en-production)
9. [Guide de Choix Final](#9-guide-de-choix-final)

---

## 1. Le Problème que ces outils résolvent

### Prometheus seul : ses limites

Prometheus est excellent pour collecter et interroger des métriques **en temps réel**. Mais il a deux limites importantes :

**Limite 1 — La durée de rétention :**
Par défaut, Prometheus ne garde les données que **15 jours** sur disque local. Si vous voulez analyser les tendances sur 6 mois, 1 an ou 5 ans, il vous faut une solution externe.

**Limite 2 — La haute disponibilité :**
Si votre serveur Prometheus tombe en panne ou que son disque est plein, vous perdez vos métriques. Il n'y a pas de réplication native.

```
Situation classique sans solution HA :

[Prometheus] ─── disque local ─── max 15 jours
      │
      └── si le disque plante → perte totale des données 😱
```

### La solution : un backend de stockage long terme

Thanos, Mimir et VictoriaMetrics répondent tous à ce problème, mais avec des approches très différentes.

```
Situation avec solution HA :

[Prometheus] ──→ [Thanos / Mimir / VictoriaMetrics] ──→ [S3 / Disque]
                         stockage illimité dans le temps ✅
                         haute disponibilité ✅
                         vue unifiée multi-serveurs ✅
```

---

## 2. Vue d'ensemble rapide

| Critère | Thanos | Mimir | VictoriaMetrics |
|---|---|---|---|
| **Créateur** | Improbable (open source) | Grafana Labs | VictoriaMetrics Inc. |
| **Architecture** | Composants modulaires | Microservices purs | Binaire unique (ou cluster) |
| **Stockage** | S3 / Cloud Object Storage | S3 uniquement | Disque local ou S3 |
| **Compatibilité Prometheus** | Totale (extension) | Totale (API PromQL) | Totale (scraping + PromQL) |
| **Multi-tenancy** | Partiel | Natif | Partiel |
| **Consommation RAM** | Moyenne | Élevée | Très faible |
| **Complexité d'installation** | Moyenne | Élevée | Très faible |
| **Courbe d'apprentissage** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Idéal pour** | Multi-cloud, legacy | Très grande échelle | Petits/moyens setups |

---

## 3. Thanos — L'Extension Modulaire

### 3.1 Concept fondamental

> **Analogie :** Thanos, c'est comme ajouter un **service d'archivage postal** à votre bureau existant. Votre bureau (Prometheus) continue de fonctionner normalement, et un coursier (Sidecar) part régulièrement déposer des copies à l'entrepôt central (S3).

Thanos ne **remplace pas** Prometheus. Il vient se **greffer dessus** pour étendre ses capacités.

### 3.2 Architecture détaillée

```
┌─────────────────────────────────────────────────────────────────┐
│                         ARCHITECTURE THANOS                      │
│                                                                  │
│  Datacenter A                    Datacenter B                    │
│  ┌──────────────┐               ┌──────────────┐                │
│  │  Prometheus  │               │  Prometheus  │                │
│  │  (scraping)  │               │  (scraping)  │                │
│  └──────┬───────┘               └──────┬───────┘                │
│         │                              │                         │
│  ┌──────▼───────┐               ┌──────▼───────┐                │
│  │   SIDECAR    │               │   SIDECAR    │                │
│  │ (lit + envoie│               │ (lit + envoie│                │
│  │  vers S3)    │               │  vers S3)    │                │
│  └──────┬───────┘               └──────┬───────┘                │
│         │                              │                         │
│         └──────────────┬───────────────┘                         │
│                        │                                         │
│              ┌─────────▼────────┐                               │
│              │  OBJECT STORAGE  │                               │
│              │   (S3 / MinIO)   │                               │
│              │  données froides │                               │
│              └─────────┬────────┘                               │
│                        │                                         │
│              ┌─────────▼────────┐                               │
│              │  STORE GATEWAY   │                               │
│              │ (requête le S3)  │                               │
│              └─────────┬────────┘                               │
│                        │                                         │
│              ┌─────────▼────────┐     ┌────────────┐           │
│              │     QUERIER      │────→│   Grafana  │           │
│              │  (vue unifiée)   │     │ (dashboard)│           │
│              └─────────┬────────┘     └────────────┘           │
│                        │                                         │
│              ┌─────────▼────────┐                               │
│              │    COMPACTOR     │                               │
│              │ (compresse le S3)│                               │
│              └──────────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Rôle de chaque composant

**Sidecar (obligatoire)**
- S'installe **à côté de chaque Prometheus** (un Sidecar par Prometheus)
- Lit les blocs TSDB (format Prometheus) et les copie vers S3 toutes les 2 heures
- Expose les données récentes (< 2h) directement pour les requêtes en temps réel
- C'est le "pont" entre votre Prometheus local et le stockage centralisé

**Querier (obligatoire)**
- Point d'entrée unique pour **toutes** vos requêtes PromQL
- Agrège les réponses de plusieurs Sidecars et du Store Gateway
- Déduplique les données si plusieurs Prometheus scrapent les mêmes cibles
- Expose une API compatible Prometheus → Grafana s'y connecte sans modification

**Store Gateway (pour les données anciennes)**
- Lit les blocs stockés sur S3 et les rend accessibles au Querier
- Maintient un index en mémoire pour accélérer les recherches
- Fonctionne en mode **stateless** : peut être redémarré sans perte de données

**Compactor (maintenance)**
- Tourne périodiquement (toutes les quelques heures)
- Fusionne les petits blocs en blocs plus grands (downsampling)
- Réduit l'espace disque sur S3 jusqu'à **70%** sur les vieilles données
- Applique les règles de rétention (ex: supprimer après 1 an)

**Ruler (optionnel)**
- Exécute les règles d'alerting et d'enregistrement à l'échelle globale
- Utile quand vous voulez des alertes cross-datacenter

**Query Frontend (optionnel, recommandé en production)**
- Met en cache les résultats des requêtes répétitives
- Découpe les grosses requêtes en sous-requêtes parallèles
- Réduit la charge sur le Querier

### 3.4 Avantages et inconvénients détaillés

**✅ Avantages**

- **Conservation de l'existant :** Votre Prometheus actuel continue à fonctionner sans modification. Vous ajoutez Thanos progressivement.
- **Multi-cloud natif :** Supporte AWS S3, GCS, Azure Blob Storage, MinIO (auto-hébergé). Idéal si vous avez des clouds différents.
- **Déduplication :** Si vous avez deux Prometheus en haute disponibilité qui scrapent les mêmes cibles, Thanos fusionne intelligemment les données.
- **Flexibilité :** Vous activez uniquement les composants dont vous avez besoin.
- **Downsampling automatique :** Les données de plus de 40 jours peuvent être compressées (garder 1 point/minute au lieu de 1 point/15s).

**❌ Inconvénients**

- **Dépendance aux disques locaux Prometheus :** Si le disque de Prometheus est plein ou corrompu avant que le Sidecar ait pu copier les données vers S3, vous perdez ces données.
- **Gestion de nombreux composants :** En production sérieuse, vous déployez 5-6 processus différents. Plus de surface d'attaque pour les pannes.
- **Latence des requêtes :** Les requêtes sur des données très anciennes impliquent des allers-retours vers S3, ce qui est plus lent qu'un disque local.
- **Pas de multi-tenancy natif :** Tous les utilisateurs voient toutes les métriques (sauf avec des proxies supplémentaires).

### 3.5 Courbe d'apprentissage

**Niveau : Intermédiaire ⭐⭐⭐**

Étapes typiques d'apprentissage :

1. **Semaine 1 :** Comprendre le concept Sidecar, déployer sur un setup de test
2. **Semaine 2-3 :** Configurer le Querier et le Store Gateway, tester les requêtes historiques
3. **Semaine 4 :** Mettre en place le Compactor, valider la politique de rétention
4. **Mois 2 :** Optimiser les performances, mettre en place le Query Frontend

### 3.6 Configuration minimale de démarrage

```yaml
# docker-compose.yml - Thanos minimal
version: '3'
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--storage.tsdb.max-block-duration=2h'  # Requis pour Thanos
      - '--storage.tsdb.min-block-duration=2h'
      - '--web.enable-lifecycle'

  thanos-sidecar:
    image: quay.io/thanos/thanos:latest
    command:
      - sidecar
      - --tsdb.path=/prometheus
      - --prometheus.url=http://prometheus:9090
      - --objstore.config-file=/config/s3.yml
    volumes:
      - prometheus-data:/prometheus
      - ./s3.yml:/config/s3.yml

  thanos-store:
    image: quay.io/thanos/thanos:latest
    command:
      - store
      - --objstore.config-file=/config/s3.yml

  thanos-querier:
    image: quay.io/thanos/thanos:latest
    command:
      - query
      - --store=thanos-sidecar:10901
      - --store=thanos-store:10901
    ports:
      - "9091:10902"  # Interface web Thanos
```

```yaml
# s3.yml - Configuration du stockage objet
type: S3
config:
  bucket: "mes-metriques-prometheus"
  endpoint: "s3.eu-west-1.amazonaws.com"
  access_key: "AKIAXXXXXXXX"
  secret_key: "xxxxxxxxxxxxxxxx"
```

---

## 4. Grafana Mimir — La Puissance Industrielle

### 4.1 Concept fondamental

> **Analogie :** Mimir, c'est un **entrepôt logistique Amazon** : des milliers de petits robots spécialisés travaillent en parallèle pour ranger, traiter et retrouver des milliards de colis. Chaque robot a une tâche précise. Si l'un tombe en panne, les autres continuent. C'est ultra-efficace à grande échelle, mais vous ne montez pas ce système dans votre garage.

Mimir est conçu pour les **entreprises qui gèrent des dizaines de millions de séries temporelles** (grandes banques, fournisseurs cloud, opérateurs télécom).

### 4.2 Architecture détaillée

```
┌──────────────────────────────────────────────────────────────────────┐
│                          ARCHITECTURE MIMIR                           │
│                                                                        │
│  Sources de données                                                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                       │
│  │ Prometheus │  │ Prometheus │  │ Prometheus │  (n instances)         │
│  │  Client A  │  │  Client B  │  │  Client C  │                        │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘                       │
│        │               │               │                               │
│        └───────────────┴───────────────┘                               │
│                         │  Remote Write (HTTP)                         │
│                         ▼                                               │
│              ┌──────────────────────┐                                 │
│              │    DISTRIBUTOR       │  ← Reçoit les données            │
│              │ (load balancing +    │    les distribue aux ingesters   │
│              │  validation)         │    selon le hash des labels      │
│              └──────────┬───────────┘                                 │
│                         │  Hash Ring (consistent hashing)             │
│          ┌──────────────┼──────────────┐                               │
│          ▼              ▼              ▼                               │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐                         │
│  │ INGESTER  │  │ INGESTER  │  │ INGESTER  │  ← Écrit en RAM          │
│  │    #1     │  │    #2     │  │    #3     │    puis flush sur S3      │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘                         │
│        └──────────────┴───────────────┘                               │
│                         │                                               │
│              ┌──────────▼───────────┐                                 │
│              │   OBJECT STORAGE     │  ← S3 uniquement                │
│              │       (S3)           │                                  │
│              └──────────┬───────────┘                                 │
│                         │                                               │
│     ┌───────────────────┼───────────────────┐                         │
│     ▼                   ▼                   ▼                         │
│ ┌────────┐        ┌──────────┐       ┌─────────────┐                  │
│ │STORE   │        │ QUERIER  │       │   COMPACTOR │                  │
│ │GATEWAY │        │          │       │             │                  │
│ └────────┘        └────┬─────┘       └─────────────┘                  │
│                        │                                               │
│              ┌─────────▼────────┐                                     │
│              │  QUERY FRONTEND  │  ← Cache + split des requêtes       │
│              └─────────┬────────┘                                     │
│                        │                                               │
│              ┌─────────▼────────┐                                     │
│              │     Grafana      │                                     │
│              └──────────────────┘                                     │
│                                                                        │
│  [Composants additionnels : Ruler, Alertmanager, Compactor]            │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.3 Rôle de chaque composant

**Distributor**
- Reçoit toutes les données entrantes via **Remote Write** (protocole Prometheus)
- Valide le format des métriques (labels, timestamps)
- Distribue les séries temporelles aux Ingesters via un **consistent hashing** sur les labels
- Sans état (stateless) → facile à scaler horizontalement

**Ingester**
- Reçoit les données d'un Distributor et les stocke **en mémoire (WAL)**
- Toutes les 2 heures, flush les données en mémoire vers S3 sous forme de blocs
- **Stateful** : crucial à ne pas supprimer sans précautions (sinon perte de données récentes)
- Réplication : chaque série est stockée sur **3 Ingesters** par défaut (tolérance aux pannes)

**Store Gateway**
- Identique à Thanos : lit les blocs stockés sur S3
- Maintient un index en mémoire pour accélérer les recherches

**Querier**
- Reçoit les requêtes PromQL du Query Frontend
- Interroge simultanément les Ingesters (données récentes) et le Store Gateway (données anciennes)
- Fusionne les résultats

**Query Frontend**
- Met en cache les résultats (Redis ou cache interne)
- **Découpe les requêtes longues** en sous-requêtes parallèles (ex: "métriques sur 1 an" → 365 requêtes d'un jour chacune, exécutées en parallèle)
- Résultat : requêtes 10x plus rapides sur de larges plages temporelles

**Compactor**
- Fusionne les blocs S3 et applique le downsampling
- Gestion des politiques de rétention par tenant (client)

**Ruler**
- Exécute les règles d'alerting Prometheus à l'échelle globale
- Supporte le multi-tenancy (règles par client)

### 4.4 Le Multi-Tenancy expliqué

C'est la fonctionnalité clé de Mimir par rapport aux concurrents.

```
Sans multi-tenancy (Thanos, VictoriaMetrics) :
──────────────────────────────────────────────
Prometheus A ──┐
Prometheus B ──┼──→ [Stockage Unique] ←── Tous voient tout
Prometheus C ──┘


Avec multi-tenancy (Mimir) :
────────────────────────────
Prometheus A (tenant: cardiologie)  ──→ [Partition A] ←── Seule la Cardio voit A
Prometheus B (tenant: radiologie)   ──→ [Partition B] ←── Seule la Radio voit B
Prometheus C (tenant: chirurgie)    ──→ [Partition C] ←── Seule la Chirurgie voit C

Le stockage physique est partagé (économique) mais logiquement isolé (sécurisé)
```

Pour activer le tenant, il suffit d'ajouter un header HTTP :
```bash
# Remote Write depuis Prometheus
remote_write:
  - url: http://mimir:9009/api/v1/push
    headers:
      X-Scope-OrgID: "cardiologie"  # ← Identifiant du tenant
```

### 4.5 Avantages et inconvénients détaillés

**✅ Avantages**

- **Scalabilité quasi infinie :** Chaque composant peut être scalé indépendamment. Besoin de plus de capacité d'écriture ? Ajoutez des Ingesters.
- **Multi-tenancy natif et strict :** Isolation garantie entre clients/équipes/projets. Idéal pour les fournisseurs de service.
- **Résilience maximale :** Réplication des données sur plusieurs Ingesters. Pas de SPOF (Single Point of Failure).
- **Requêtes parallèles ultra-rapides :** Le Query Frontend découpe et parallélise automatiquement.
- **Rétention par tenant :** Chaque client peut avoir sa propre durée de rétention.

**❌ Inconvénients**

- **Très gourmand en ressources :** Un setup minimal de production nécessite 3 Ingesters (pour la réplication), un Distributor, un Query Frontend, un Querier, un Store Gateway, un Compactor… soit environ **16 Go de RAM minimum** pour un setup vide.
- **Kubernetes pratiquement obligatoire :** Gérer manuellement le cycle de vie de 8+ microservices est infaisable en production. Helm chart fourni, mais demande une expertise K8s.
- **Debugging complexe :** Quand quelque chose ne va pas, il faut savoir dans quel composant chercher.
- **Coût opérationnel élevé :** Nécessite une équipe avec des compétences DevOps/SRE avancées.

### 4.6 Courbe d'apprentissage

**Niveau : Expert ⭐⭐⭐⭐⭐**

1. **Prérequis :** Maîtriser Kubernetes, Helm, Prometheus, PromQL
2. **Mois 1 :** Déployer avec le Helm chart officiel en mode "monolithique" (test uniquement)
3. **Mois 2 :** Comprendre chaque composant, passer en mode microservices
4. **Mois 3-6 :** Tuning des performances, gestion du multi-tenancy, monitoring du monitoring

### 4.7 Configuration minimale (mode monolithique pour tests)

```yaml
# mimir-config.yml - Mode monolithique (NON recommandé en production)
# Tous les composants dans un seul processus pour les tests

target: all

ingester:
  ring:
    replication_factor: 1  # En prod: mettre 3

blocks_storage:
  backend: s3
  s3:
    bucket_name: mimir-metriques
    endpoint: s3.eu-west-1.amazonaws.com

compactor:
  sharding_ring:
    kvstore:
      store: memberlist

store_gateway:
  sharding_ring:
    replication_factor: 1

ruler_storage:
  backend: s3
  s3:
    bucket_name: mimir-ruler
    endpoint: s3.eu-west-1.amazonaws.com
```

```bash
# Lancement en mode test (monolithique)
docker run -p 9009:9009 \
  -v ./mimir-config.yml:/etc/mimir/config.yml \
  grafana/mimir:latest \
  --config.file=/etc/mimir/config.yml
```

---

## 5. VictoriaMetrics — La Performance Brute

### 5.1 Concept fondamental

> **Analogie :** VictoriaMetrics, c'est un **moteur diesel ultra-optimisé** : moins d'entretien, moins de carburant, mais une puissance de traction impressionnante. Là où Prometheus consomme 8 Go de RAM pour 1 million de séries, VictoriaMetrics en consomme 800 Mo.

L'objectif de VictoriaMetrics est simple : **stocker le maximum de données avec le minimum de ressources**, sans sacrifier les performances de lecture.

### 5.2 Architecture détaillée

VictoriaMetrics existe en deux saveurs :

#### Version Single (un seul binaire)

```
┌────────────────────────────────────────────────────┐
│              VICTORIAMETRICS SINGLE                 │
│                                                     │
│  Sources de données entrantes                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │Prometheus│  │ Telegraf │  │ Grafana  │          │
│  │ (scrape) │  │  Agent   │  │  Agent   │          │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘          │
│       │             │             │                  │
│       └─────────────┼─────────────┘                  │
│                     │  Multiple protocols :           │
│                     │  Prometheus Remote Write        │
│                     │  InfluxDB line protocol         │
│                     │  OpenTSDB                       │
│                     ▼                                 │
│         ┌───────────────────────┐                   │
│         │   VICTORIAMETRICS     │                   │
│         │   (processus unique)  │                   │
│         │                       │                   │
│         │  ┌─────────────────┐  │                   │
│         │  │  Ingestion API  │  │                   │
│         │  └────────┬────────┘  │                   │
│         │           │           │                   │
│         │  ┌────────▼────────┐  │                   │
│         │  │  Moteur TSDB    │  │                   │
│         │  │  (compression   │  │                   │
│         │  │   avancée)      │  │                   │
│         │  └────────┬────────┘  │                   │
│         │           │           │                   │
│         │  ┌────────▼────────┐  │                   │
│         │  │  Query Engine   │  │                   │
│         │  │  (PromQL +      │  │                   │
│         │  │   MetricsQL)    │  │                   │
│         │  └────────┬────────┘  │                   │
│         └───────────┼───────────┘                   │
│                     │                               │
│                     ▼                               │
│              ┌─────────────┐                        │
│              │   Grafana   │                        │
│              └─────────────┘                        │
│                                                     │
│  Stockage : /var/lib/victoriametrics (disque local) │
└────────────────────────────────────────────────────┘
```

#### Version Cluster (pour la haute disponibilité)

```
┌────────────────────────────────────────────────────────┐
│              VICTORIAMETRICS CLUSTER                    │
│                                                         │
│  Sources de données                                     │
│       │                                                 │
│       ▼                                                 │
│  ┌──────────────┐   ← Répartit l'écriture              │
│  │  vminsert    │     entre les vmstorages              │
│  │  (écriture)  │                                       │
│  └──────┬───────┘                                       │
│         │                                               │
│  ┌──────┴───────────────────┐                           │
│  ▼          ▼               ▼                           │
│ ┌─────┐  ┌─────┐  ┌─────────────────┐                 │
│ │ vm  │  │ vm  │  │   vmstorage     │  ← Stockage      │
│ │store│  │store│  │   (n instances) │    répliqué      │
│ │ #1  │  │ #2  │  └─────────────────┘                  │
│ └─────┘  └─────┘                                       │
│       │                                                 │
│  ┌──────────────┐   ← Agrège les résultats              │
│  │  vmselect    │     de tous les vmstorages            │
│  │  (lecture)   │                                       │
│  └──────┬───────┘                                       │
│         │                                               │
│  ┌──────▼───────┐                                       │
│  │   Grafana    │                                       │
│  └──────────────┘                                       │
│                                                         │
│  [Composants additionnels : vmagent, vmalert, vmauth]   │
└────────────────────────────────────────────────────────┘
```

### 5.3 L'écosystème VictoriaMetrics

VictoriaMetrics propose une suite complète d'outils :

**vmagent** — Collecteur léger (remplace Prometheus)
- Consomme 5-10x moins de RAM que Prometheus
- Peut scraper des milliers de cibles avec 200 Mo de RAM
- Supporte le sharding automatique (plusieurs vmagents se répartissent les cibles)

**vmalert** — Moteur d'alerting
- Compatible avec les règles d'alerting Prometheus
- Peut envoyer vers Alertmanager ou directement vers Grafana

**vmauth** — Proxy d'authentification
- Ajoute une couche d'authentification et de routage
- Permet un multi-tenancy basique

**vmbackup / vmrestore** — Backup et restauration
- Sauvegarde incrémentale vers S3 ou disque local
- Restauration point-in-time

### 5.4 Pourquoi VictoriaMetrics est si efficace

VictoriaMetrics utilise plusieurs optimisations uniques :

**Compression agressive :**
```
Données brutes Prometheus (float64 + timestamp) :
1 point = 16 octets × 4 milliards de points = 64 Go

Mêmes données dans VictoriaMetrics :
1 point ≈ 0.4 octet (compression delta-of-delta + XOR encoding)
4 milliards de points ≈ 1.6 Go → Réduction de 97.5% !
```

**Index inversé personnalisé :**
Les requêtes de type `{job="prometheus", env="prod"}` sont résolues par un index bitmap ultra-optimisé, bien plus rapide que les index B-tree classiques.

**Ingestion sans locks :**
L'architecture interne évite les verrous partagés (mutex), permettant d'utiliser tous les cœurs CPU en parallèle.

### 5.5 MetricsQL : une extension de PromQL

VictoriaMetrics propose **MetricsQL**, un superset de PromQL avec des fonctions supplémentaires :

```promql
# PromQL classique (fonctionne aussi dans VictoriaMetrics)
rate(http_requests_total[5m])

# MetricsQL - Fonctions supplémentaires utiles
# Détection d'anomalies
anomaly_score(http_requests_total[1h])

# Prévision linéaire
predict_linear(disk_usage[7d], 86400)  # Prédit le niveau dans 24h

# Fonctions de rollup étendues
rollup_increase(http_requests_total[1d], "1h")
```

### 5.6 Avantages et inconvénients détaillés

**✅ Avantages**

- **Consommation mémoire 10x inférieure à Prometheus :** 1 million de séries actives = ~200 Mo de RAM (contre 2+ Go pour Prometheus).
- **Compression exceptionnelle :** Jusqu'à 97% de réduction par rapport au stockage brut.
- **Ingestion ultra-rapide :** Peut ingérer des millions de points par seconde sur un seul serveur.
- **Installation triviale :** Un seul binaire Go, zéro dépendance. Fonctionne sur Debian, Ubuntu, CentOS, sans Docker si nécessaire.
- **Compatible avec tout :** Accepte Prometheus Remote Write, InfluxDB line protocol, OpenTSDB, Graphite, CSV... sans configuration.
- **Remplacement drop-in de Prometheus :** L'API est entièrement compatible PromQL → Grafana se reconnecte sans modification.

**❌ Inconvénients**

- **Multi-tenancy moins mature :** vmauth permet un routage par tenant, mais l'isolation n'est pas aussi stricte que Mimir.
- **Moins d'écosystème que Thanos :** Moins d'intégrations natives pour certains outils cloud spécifiques.
- **Documentation parfois moins exhaustive :** Certaines fonctionnalités avancées sont moins bien documentées que Mimir.
- **Données longues durées sur S3 :** La version Single stocke uniquement sur disque local ; pour S3, il faut le mode cluster ou vmbackup.

### 5.7 Courbe d'apprentissage

**Niveau : Débutant-Intermédiaire ⭐⭐**

1. **Jour 1 :** Lancer le binaire, connecter Prometheus en Remote Write, voir les données dans Grafana
2. **Semaine 1 :** Comprendre les options de configuration, mettre en place vmagent
3. **Mois 1 :** Déployer le cluster, configurer vmalert et vmauth
4. **Mois 2 :** Tuning avancé, MetricsQL, stratégie de backup

### 5.8 Configuration minimale de démarrage

```bash
# Installation en 3 commandes (Linux amd64)
wget https://github.com/VictoriaMetrics/VictoriaMetrics/releases/latest/download/victoria-metrics-linux-amd64-*.tar.gz
tar xzf victoria-metrics-linux-amd64-*.tar.gz
./victoria-metrics -storageDataPath=/var/lib/victoriametrics -retentionPeriod=12
# ↑ Démarré ! Port 8428 disponible immédiatement
```

```yaml
# prometheus.yml - Configurer Prometheus pour envoyer vers VictoriaMetrics
global:
  scrape_interval: 15s

remote_write:
  - url: http://victoriametrics:8428/api/v1/write

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
```

```yaml
# docker-compose.yml - Stack complète avec Grafana
version: '3'
services:
  victoriametrics:
    image: victoriametrics/victoria-metrics:latest
    command:
      - -storageDataPath=/storage
      - -retentionPeriod=24  # 24 mois de rétention
      - -httpListenAddr=:8428
    volumes:
      - vm-data:/storage
    ports:
      - "8428:8428"

  grafana:
    image: grafana/grafana:latest
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    ports:
      - "3000:3000"
    # Dans Grafana : ajouter une source "Prometheus" pointant sur http://victoriametrics:8428

volumes:
  vm-data:
```

---

## 6. Comparatif Décisionnel

### 6.1 Tableau de comparaison complet

| Critère | Thanos | Mimir | VictoriaMetrics |
|---|---|---|---|
| **Architecture** | Extension Prometheus | Microservices purs | Binaire unique / Cluster |
| **Modèle de stockage** | S3 (via Sidecar) | S3 uniquement | Disque local + S3 optionnel |
| **Réception des données** | Pull (via Sidecar) | Push (Remote Write) | Push et Pull |
| **Protocoles supportés** | Prometheus natif | Prometheus Remote Write | Prometheus, InfluxDB, OpenTSDB, Graphite, CSV |
| **Multi-tenancy** | Non natif | Natif et strict | Partiel (vmauth) |
| **HA / Réplication** | Via plusieurs Prometheus | Réplication 3x native | Réplication dans le cluster |
| **RAM pour 1M séries** | ~2 Go (Prometheus) + overhead | ~4-8 Go | ~200 Mo |
| **Compression** | Prometheus standard | Prometheus standard | 10x mieux que Prometheus |
| **Query language** | PromQL | PromQL | PromQL + MetricsQL |
| **Cache de requêtes** | Query Frontend (optionnel) | Query Frontend (intégré) | Intégré |
| **Kubernetes requis** | Non (recommandé) | Fortement recommandé | Non |
| **Complexité setup** | Moyenne | Très élevée | Très faible |
| **Nombre de processus** | 4-6 | 8-12 | 1 (single) ou 3 (cluster) |
| **License** | Apache 2.0 | AGPL-3.0 | Apache 2.0 |
| **Support commercial** | Non (Grafana pour support) | Grafana Labs | VictoriaMetrics Inc. |

### 6.2 Matrice de décision par taille d'infrastructure

| Taille | Séries actives | Ingestion/s | Recommandation |
|---|---|---|---|
| **Petite** | < 500k | < 50k | VictoriaMetrics Single |
| **Moyenne** | 500k - 5M | 50k - 500k | VictoriaMetrics Cluster ou Thanos |
| **Grande** | 5M - 50M | 500k - 5M | Thanos ou Mimir |
| **Très grande** | > 50M | > 5M | Mimir |

### 6.3 Matrice de décision par besoin métier

| Besoin principal | Meilleur choix | Pourquoi |
|---|---|---|
| Démarrage rapide, budget limité | VictoriaMetrics Single | 1 binaire, 0 configuration |
| Multi-cloud avec plusieurs Prometheus existants | Thanos | Conserve l'existant, vue unifiée |
| Isolation stricte entre équipes/clients | Mimir | Multi-tenancy natif |
| Millions de capteurs IoT | VictoriaMetrics | Compression + ingestion ultra-efficace |
| Conformité réglementaire (5-10 ans) | Thanos | S3 = coût faible pour archivage long terme |
| SaaS de monitoring (offrir à des clients) | Mimir | Multi-tenancy + facturation par tenant |
| Remplacement de Prometheus sans migration | VictoriaMetrics | API 100% compatible |

---

## 7. Cas Pratiques Sectoriels

### 7.1 🏦 Secteur Bancaire et Finance

#### Contexte et contraintes

Les banques sont soumises à des réglementations strictes (Bâle III, DSP2, RGPD, PCI-DSS) qui imposent :
- Conservation des logs et métriques pendant **5 à 10 ans** minimum
- Traçabilité complète des SLAs
- Audit possible à tout moment par les régulateurs
- Isolation stricte entre les systèmes (front office, back office, conformité)

#### Architecture recommandée : Thanos

```
┌─────────────────────────────────────────────────────────┐
│                  ARCHITECTURE BANCAIRE                   │
│                                                         │
│  Systèmes de production                                 │
│  ┌────────────────────────────────────────────────┐     │
│  │  Prometheus Front Office    │  Prometheus Core  │     │
│  │  (métriques transactions)   │  Banking          │     │
│  └────────────┬────────────────┴────────┬──────────┘     │
│               │                         │                 │
│          Sidecar                   Sidecar               │
│               │                         │                 │
│               └────────────┬────────────┘                 │
│                            │                             │
│                   ┌────────▼────────┐                   │
│                   │   S3 / MinIO    │                   │
│                   │  (chiffré AES)  │                   │
│                   │  Rétention: 7ans│                   │
│                   └────────┬────────┘                   │
│                            │                             │
│                 ┌──────────▼──────────┐                 │
│                 │   Thanos Querier    │                 │
│                 │  + Store Gateway   │                 │
│                 └──────────┬──────────┘                 │
│                            │                             │
│           ┌────────────────┼─────────────────┐          │
│           ▼                ▼                 ▼          │
│     ┌──────────┐    ┌──────────┐    ┌────────────────┐  │
│     │ Grafana  │    │ Rapports │    │  API Audit     │  │
│     │(équipes) │    │(régulat.)│    │  (régulateurs) │  │
│     └──────────┘    └──────────┘    └────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

#### Cas d'usage concret : Preuve de SLA pour la BCE

Une banque européenne doit prouver que son système de paiement SEPA a respecté un SLA de 99.95% de disponibilité sur les 3 dernières années.

```promql
# Requête PromQL pour calculer le SLA sur une période historique longue
# (possible uniquement avec un stockage long terme comme Thanos)

# Taux de disponibilité sur les 3 dernières années
(
  1 - (
    sum_over_time(up{job="payment-api"}[3y] offset 0) == 0
  ) / count_over_time(up{job="payment-api"}[3y])
) * 100

# Résultat attendu : 99.97% → preuve exportable pour les régulateurs
```

```promql
# Alerte : dégradation du temps de réponse des transactions
alert: PaymentLatencyHigh
expr: |
  histogram_quantile(0.99,
    rate(payment_duration_seconds_bucket[5m])
  ) > 2.0
for: 5m
labels:
  severity: critical
  team: sre-payments
annotations:
  summary: "P99 transactions > 2s (SLA menacé)"
  runbook: "https://wiki.bank.com/runbooks/payment-latency"
```

#### Bonne pratique : Chiffrement et conformité

```yaml
# thanos-bucket-config.yml - S3 chiffré pour données bancaires
type: S3
config:
  bucket: "bank-metrics-archive"
  endpoint: "s3.eu-central-1.amazonaws.com"
  region: "eu-central-1"
  # Chiffrement côté serveur obligatoire
  sse_config:
    type: "SSE-KMS"
    kms_key_id: "arn:aws:kms:eu-central-1:123456789:key/abc-def"
  # Versioning pour audit trail
  # Activer dans la console S3 : bucket > Properties > Versioning
```

---

### 7.2 ⚡ Secteur Énergétique (Smart Grid)

#### Contexte et contraintes

Les réseaux électriques intelligents génèrent un volume de données **massif** :
- Millions de compteurs Linky / smart meters envoyant des relevés toutes les 10 secondes
- Centaines de milliers de capteurs sur les lignes haute tension
- Nécessité d'analyser les pics de consommation en temps réel
- Prévision de la charge pour les 24 prochaines heures

#### Architecture recommandée : VictoriaMetrics Cluster

```
┌──────────────────────────────────────────────────────────────┐
│                 ARCHITECTURE SMART GRID                       │
│                                                               │
│  Terrain                                                      │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  5M compteurs    500k capteurs    200k sous-stations│     │
│  │  (10s interval)  (1s interval)   (1s interval)      │     │
│  └───────┬───────────────┬──────────────────┬──────────┘     │
│          │               │                  │                 │
│          └───────────────┴──────────────────┘                 │
│                          │  ~50M points/seconde               │
│                          ▼                                     │
│          ┌───────────────────────────────┐                   │
│          │    vmagent (collecteurs)      │                   │
│          │  (100 instances distribuées) │                   │
│          └───────────────┬───────────────┘                   │
│                          │                                     │
│          ┌───────────────▼───────────────┐                   │
│          │         vminsert             │                   │
│          │   (3 instances, load balanced)│                  │
│          └───────────────┬───────────────┘                   │
│                          │                                     │
│    ┌─────────────────────┼────────────────────┐               │
│    ▼                     ▼                    ▼               │
│  ┌──────────┐      ┌──────────┐        ┌──────────┐          │
│  │vmstorage │      │vmstorage │        │vmstorage │          │
│  │  node 1  │      │  node 2  │        │  node 3  │          │
│  │ (4 To NVMe)│    │ (4 To NVMe)│      │ (4 To NVMe)│        │
│  └──────────┘      └──────────┘        └──────────┘          │
│          │                                                     │
│          ▼                                                     │
│  ┌────────────────┐   ┌────────────────────────────────┐     │
│  │   vmselect     │   │    Applications métier          │     │
│  │  (lecture)     │──→│  - Dashboard temps réel         │     │
│  └────────────────┘   │  - Algorithme de prévision      │     │
│                        │  - Détection de fraude          │     │
│                        │  - Rapport réglementaire (RTE)  │     │
│                        └────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

#### Cas d'usage concret : Détection de fraude sur les compteurs

```promql
# Détection d'anomalie sur un compteur électrique
# Un compteur qui consomme 5x plus que sa moyenne habituelle = fraude potentielle

alert: SmartMeterAnomalyDetected
expr: |
  (
    electricity_consumption_kwh{meter_type="residential"}
    /
    avg_over_time(electricity_consumption_kwh{meter_type="residential"}[30d])
  ) > 5
for: 1h
labels:
  severity: warning
  team: fraud-detection
annotations:
  summary: "Compteur {{ $labels.meter_id }} consomme {{ $value }}x sa moyenne"
  action: "Envoyer technicien sur site"
```

```promql
# Prévision de pic de charge pour les 24 prochaines heures (MetricsQL)
# Utile pour prévenir les opérateurs de réseau

predict_linear(
  sum(electricity_consumption_kwh[7d]),
  86400  # 86400 secondes = 24 heures
)
```

#### Impact économique : Comparaison du coût de stockage

```
Scénario : 5 millions de compteurs, relevé toutes les 10 secondes = 500k points/seconde

Avec Prometheus standard :
  - 1 point ≈ 16 octets
  - Par jour : 500k × 86400 × 16 = ~691 Go/jour
  - Par an : 252 To/an → Coût S3 : ~5500 €/mois

Avec VictoriaMetrics (compression 97%) :
  - 1 point ≈ 0.4 octet
  - Par jour : ~17 Go/jour
  - Par an : ~6 To/an → Coût S3 : ~130 €/mois

Économie annuelle : ~64 000 € sur le stockage seul 🎉
```

---

### 7.3 ✈️ Secteur Transport et Logistique

#### Contexte et contraintes

Les opérateurs logistiques multi-sites ont besoin de :
- Visibilité centralisée sur des dizaines de sites (ports, entrepôts, aéroports)
- Chaque site a son propre environnement IT souvent autonome
- Vue consolidée pour le management sans centraliser toutes les données

#### Architecture recommandée : Thanos Multi-Sites

```
┌──────────────────────────────────────────────────────────────────┐
│                  ARCHITECTURE LOGISTIQUE MULTI-SITES              │
│                                                                    │
│  Port de Marseille        Port de Le Havre        Entrepôt Lyon  │
│  ┌─────────────────┐    ┌─────────────────┐    ┌────────────────┐│
│  │   Prometheus    │    │   Prometheus    │    │  Prometheus    ││
│  │  (grues, navires│    │  (containers,   │    │  (robots,      ││
│  │   douanes)      │    │   portiques)    │    │   convoyeurs)  ││
│  └────────┬────────┘    └────────┬────────┘    └───────┬────────┘│
│           │                      │                      │         │
│       Sidecar                Sidecar                Sidecar      │
│           │                      │                      │         │
│           └──────────────────────┴──────────────────────┘         │
│                                  │                                 │
│                       S3 centralisé (Paris)                       │
│                    ┌─────────────────────────┐                   │
│                    │   bucket: logistics-fr   │                  │
│                    │  Marseille/  Le-Havre/   │                  │
│                    │  Lyon/                   │                  │
│                    └────────────┬────────────┘                   │
│                                  │                                 │
│                    ┌─────────────▼────────────┐                  │
│                    │    Thanos Querier         │                  │
│                    │  (Vue nationale unifiée)  │                  │
│                    └─────────────┬────────────┘                  │
│                                  │                                 │
│          ┌───────────────────────┼──────────────────────┐         │
│          ▼                       ▼                       ▼         │
│  ┌──────────────┐      ┌──────────────────┐    ┌─────────────┐   │
│  │ Grafana Dir. │      │ Dashboard OPS    │    │ API KPI     │   │
│  │ Nationale    │      │ (par site)       │    │ (reporting) │   │
│  └──────────────┘      └──────────────────┘    └─────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

#### Cas d'usage concret : Dashboard national du trafic portuaire

```promql
# KPI : Nombre de containers traités par port aujourd'hui
sum by (port) (
  increase(containers_processed_total[24h])
)

# Alerte : Retard de traitement sur un quai
alert: QuayProcessingDelay
expr: |
  avg by (port, quay) (
    container_waiting_time_minutes
  ) > 120
for: 30m
labels:
  severity: warning
annotations:
  summary: "File d'attente > 2h sur {{ $labels.port }}/{{ $labels.quay }}"

# Comparaison de la performance entre ports sur les 30 derniers jours
sum_over_time(containers_processed_total[30d])
  / on(port) group_left
sum_over_time(vessels_docked_total[30d])
# = containers traités par navire = KPI d'efficacité portuaire
```

#### Bonne pratique : Isolation réseau par site

```yaml
# thanos-sidecar sur site distant avec connexion limitée
# Optimisation pour bande passante réduite (site isolé)

# thanos-sidecar.yml
objstore.config: |
  type: S3
  config:
    bucket: logistics-fr
    # Préfixe par site pour organiser les données
    prefix: "marseille/"
    endpoint: s3.eu-west-3.amazonaws.com

# Paramètre crucial pour réseau lent : ne pas envoyer les données
# plus souvent que nécessaire
tsdb.upload-compact: true
min-time: -6h  # Envoyer vers S3 uniquement les blocs de plus de 6h
```

---

### 7.4 🏥 Secteur Santé (Hôpitaux et Cliniques)

#### Contexte et contraintes

Le secteur de la santé a les contraintes les plus strictes :
- **Secret médical** : les données de métriques peuvent indirectement révéler des informations sur les patients
- **RGPD et HDS** (Hébergeur de Données de Santé) : hébergement obligatoirement en France
- **Isolation stricte** entre services (cardio ne voit pas les données de la radio)
- **Disponibilité critique** : une panne de monitoring peut avoir des conséquences graves

#### Architecture recommandée : Mimir Multi-Tenant

```
┌──────────────────────────────────────────────────────────────────┐
│                  ARCHITECTURE HÔPITAL MIMIR                       │
│                                                                    │
│  Services cliniques (chacun son Prometheus)                       │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────────┐  │
│  │Cardiologie│  │Radiologie │  │ Chirurgie │  │  Urgences    │  │
│  │Prometheus │  │Prometheus │  │Prometheus │  │  Prometheus  │  │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └──────┬───────┘  │
│        │              │              │                │            │
│        │ tenant:cardio│ tenant:radio │ tenant:chir    │tenant:urg  │
│        └──────────────┴──────────────┴────────────────┘            │
│                                │  Remote Write + Header tenant     │
│                                ▼                                   │
│                    ┌───────────────────────┐                      │
│                    │    MIMIR Distributor   │                     │
│                    └───────────┬───────────┘                      │
│                                │                                   │
│                ┌───────────────┼───────────────┐                  │
│                ▼               ▼               ▼                  │
│         ┌──────────┐   ┌──────────┐   ┌──────────┐              │
│         │Ingester 1│   │Ingester 2│   │Ingester 3│              │
│         └──────────┘   └──────────┘   └──────────┘              │
│                                │                                   │
│                    ┌───────────▼───────────┐                      │
│                    │  OVHcloud Object      │                      │
│                    │  Storage (HDS certif) │                      │
│                    │  Paris, France        │                      │
│                    └───────────┬───────────┘                      │
│                                │                                   │
│                    ┌───────────▼───────────┐                      │
│                    │   Mimir Querier        │                     │
│                    └───────────┬───────────┘                      │
│                                │                                   │
│   ┌────────────────────────────┼──────────────────────────────┐   │
│   ▼                            ▼                              ▼   │
│  ┌──────────────┐      ┌──────────────┐              ┌──────────┐ │
│  │Grafana Cardio│      │Grafana Radio │              │Grafana   │ │
│  │(tenant:cardio│      │(tenant:radio │              │DSI       │ │
│  │ token unique)│      │ token unique)│              │(tous)    │ │
│  └──────────────┘      └──────────────┘              └──────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

#### Configuration de l'isolation par tenant

```yaml
# prometheus-cardiologie.yml
remote_write:
  - url: http://mimir-loadbalancer:9009/api/v1/push
    headers:
      X-Scope-OrgID: "cardiologie"  # ← Identifiant strict du service
    # Token d'authentification via vmauth ou Nginx
    basic_auth:
      username: "cardio-prometheus"
      password: "${CARDIO_SECRET}"
    # En cas d'échec, garder les données localement
    queue_config:
      max_samples_per_send: 10000
      batch_send_deadline: 5s
      max_shards: 5
```

```yaml
# mimir-tenants.yml - Limites par service
overrides:
  cardiologie:
    ingestion_rate: 10000       # 10k samples/s max
    max_series_per_user: 500000 # 500k séries max
    retention_period: 5y        # 5 ans (conformité)
  radiologie:
    ingestion_rate: 5000
    max_series_per_user: 200000
    retention_period: 10y       # 10 ans (imagerie = longue durée)
  urgences:
    ingestion_rate: 50000       # Plus élevé pour les urgences
    max_series_per_user: 1000000
    retention_period: 5y
```

#### Cas d'usage concret : Alerte sur les équipements critiques

```promql
# Alerte : Scanner IRM hors ligne (Radiologie uniquement)
# Chaque service n'a accès qu'à ses propres métriques via son tenant Grafana

alert: MRIScannerOffline
expr: |
  up{job="mri-scanner", department="radiologie"} == 0
for: 2m
labels:
  severity: critical
  tenant: radiologie
  pager: true
annotations:
  summary: "Scanner IRM {{ $labels.device_id }} hors ligne"
  runbook: "Appeler astreinte biomédicale : 06.XX.XX.XX.XX"

# Alerte : Charge CPU anormale sur les serveurs de Cardiologie
# (pas visible par la Radiologie grâce au multi-tenancy)
alert: CardiologyServerHighCPU
expr: |
  avg by (instance) (
    rate(node_cpu_seconds_total{mode!="idle",
         namespace="cardiologie"}[5m])
  ) > 0.9
for: 10m
labels:
  tenant: cardiologie
  severity: warning
```

---

### 7.5 🛡️ Secteur Assurance

#### Contexte et contraintes

Les compagnies d'assurance ont des besoins d'**analyse de tendances sur le très long terme** :
- Corréler les incidents techniques avec les sinistres (intempéries, accidents)
- Analyser les comportements des applications mobiles pour ajuster les offres
- Détection de fraude par analyse des patterns d'utilisation

#### Architecture recommandée : VictoriaMetrics avec rétention longue durée

```
┌──────────────────────────────────────────────────────────────────┐
│                  ARCHITECTURE ASSURANCE                           │
│                                                                    │
│  Sources de données                                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │ App mobile │  │  Portail   │  │  Serveurs  │  │  IoT       │ │
│  │ assurance  │  │  Web       │  │  Backend   │  │  (véhicles │ │
│  │ (iOS/Android│  │  (souscript│  │  (tarific. │  │ connectés) │ │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘ │
│        │               │               │               │          │
│        └───────────────┴───────────────┴───────────────┘          │
│                                │                                   │
│                    ┌───────────▼───────────┐                      │
│                    │      vmagent          │                      │
│                    │  (collecte unifiée)   │                      │
│                    └───────────┬───────────┘                      │
│                                │                                   │
│                    ┌───────────▼───────────┐                      │
│                    │   VictoriaMetrics     │                      │
│                    │      Single           │                      │
│                    │  Rétention: 36 mois   │                      │
│                    │  Stockage: 2 To NVMe  │                      │
│                    └───────────┬───────────┘                      │
│                                │                                   │
│        ┌───────────────────────┼────────────────────┐             │
│        ▼                       ▼                    ▼             │
│  ┌──────────┐          ┌──────────────┐    ┌──────────────┐      │
│  │ Grafana  │          │   Jupyter    │    │   Export     │      │
│  │Dashboard │          │  Notebooks   │    │   CSV/API    │      │
│  │ Ops      │          │  (actuariat) │    │  (actuaires) │      │
│  └──────────┘          └──────────────┘    └──────────────┘      │
│                                                                    │
│  Backup automatique vers S3 (vmbackup, quotidien)                 │
└──────────────────────────────────────────────────────────────────┘
```

#### Cas d'usage concret : Corrélation sinistres / météo

```promql
# Corrélation entre les pics de déclarations de sinistres
# et les conditions météorologiques sur 3 ans

# Volume de déclarations de sinistres auto par région et par heure
sum by (region) (
  increase(insurance_claims_submitted_total{
    type="auto"
  }[1h])
)

# Détection des pics anormaux (> 3x la moyenne hebdomadaire)
alert: ClaimsSpikeDetected
expr: |
  (
    sum by (region) (
      increase(insurance_claims_submitted_total[1h])
    )
    /
    sum by (region) (
      avg_over_time(
        increase(insurance_claims_submitted_total[1h])[7d:1h]
      )
    )
  ) > 3
for: 30m
labels:
  severity: warning
  team: actuariat
annotations:
  summary: "Pic de sinistres détecté en {{ $labels.region }}"
  description: >
    Volume {{ $value }}x supérieur à la moyenne.
    Vérifier corrélation avec données météo (tempête, verglas, inondation).
```

```promql
# Analyse de l'adoption des fonctionnalités de l'app mobile
# Pour ajuster le pricing et les offres

# Taux d'utilisation de la déclaration de sinistre en ligne (vs téléphone)
sum(rate(claim_submitted_total{channel="mobile_app"}[30d]))
/
sum(rate(claim_submitted_total[30d]))
* 100
# Si > 70%, investir davantage dans l'app plutôt que dans le centre d'appels
```

---

## 8. Bonnes Pratiques en Production

### 8.1 Pratiques communes à toutes les solutions

**Règle 1 : Définir une politique de rétention claire dès le départ**

```yaml
# VictoriaMetrics
-retentionPeriod=24  # 24 mois

# Thanos (Compactor)
retention.resolution-raw: 30d   # Données brutes : 30 jours
retention.resolution-5m: 180d   # Données 5min : 6 mois
retention.resolution-1h: 730d   # Données horaires : 2 ans

# Mimir (par tenant)
overrides:
  default:
    retention_period: 365d  # 1 an par défaut
  compliance:
    retention_period: 2555d # 7 ans pour la conformité
```

**Règle 2 : Surveiller... votre système de surveillance**

```promql
# Alerte : VictoriaMetrics ingère moins que d'habitude
alert: VMIngestionLow
expr: |
  rate(vm_rows_inserted_total[5m])
  < 0.5 * avg_over_time(rate(vm_rows_inserted_total[5m])[1h:5m])
for: 15m
labels:
  severity: warning

# Alerte : Store Gateway Thanos ne répond plus
alert: ThanosStoreGatewayDown
expr: up{job="thanos-store-gateway"} == 0
for: 5m
labels:
  severity: critical
```

**Règle 3 : Tester les restaurations régulièrement**

```bash
# Test mensuel de restauration VictoriaMetrics
# 1. Restaurer dans un environnement de test
vmrestore \
  -storageDataPath=/tmp/vm-restore-test \
  -src=s3://mes-backups/vm-backup-2024-01-01

# 2. Vérifier que les données sont accessibles
curl "http://localhost:8428/api/v1/query?query=up" | jq '.data.result | length'
# Doit retourner > 0

# 3. Documenter le RTO (Recovery Time Objective) mesuré
```

### 8.2 Bonnes pratiques Thanos

**Dimensionnement du Store Gateway :**

```yaml
# thanos-store.yml - Configuration recommandée pour production
args:
  - store
  - --objstore.config-file=/config/s3.yml
  # Index cache en mémoire (accélère les requêtes)
  - --index-cache-size=2GB
  # Chunk pool pour réduire les allocations mémoire
  - --chunk-pool-size=4GB
  # Nombre de requêtes parallèles vers S3
  - --store.grpc.series-max-concurrency=40
```

**Déduplication correcte avec plusieurs Prometheus HA :**

```yaml
# prometheus.yml - OBLIGATOIRE : label de réplique
global:
  external_labels:
    cluster: "prod-eu-west"
    replica: "prometheus-0"  # "prometheus-1" sur le second Prometheus

# thanos-querier.yml
args:
  - query
  - --query.replica-label=replica  # Thanos fusionne automatiquement les données
```

### 8.3 Bonnes pratiques Mimir

**Éviter la perte de données sur les Ingesters :**

```yaml
# mimir-ingester.yml
ingester:
  ring:
    replication_factor: 3  # TOUJOURS 3 en production
  # Ne jamais supprimer un Ingester brusquement
  # Toujours utiliser le drain avant arrêt
  lifecycler:
    # Attendre que les blocs soient flushés avant de quitter
    final_sleep: 0s
    min_ready_duration: 15s
```

```bash
# Procédure d'arrêt sécurisé d'un Ingester
# 1. Déclencher le flush (envoyer les données RAM vers S3)
curl -X POST http://ingester-0:9009/ingester/flush

# 2. Attendre que le flush soit terminé
watch curl -s http://ingester-0:9009/ready

# 3. Seulement alors, stopper le pod
kubectl delete pod mimir-ingester-0
```

**Monitoring des limites par tenant :**

```promql
# Alerte : Un tenant approche de sa limite de séries
alert: MimirTenantNearSeriesLimit
expr: |
  (
    cortex_ingester_memory_series / ignoring(tenant)
    group_left(tenant) cortex_limits_per_user_series_in_memory
  ) > 0.8
for: 15m
labels:
  severity: warning
annotations:
  summary: "Tenant {{ $labels.tenant }} à {{ $value | humanizePercentage }} de sa limite"
```

### 8.4 Bonnes pratiques VictoriaMetrics

**Optimiser les performances d'ingestion :**

```bash
# Paramètres de démarrage recommandés pour un setup production
./victoria-metrics \
  -storageDataPath=/var/lib/victoriametrics \
  -retentionPeriod=24 \
  # Augmenter la mémoire allouée pour les lectures (défaut: 60% RAM)
  -memory.allowedPercent=70 \
  # Activer la déduplication (si plusieurs Prometheus envoient les mêmes données)
  -dedup.minScrapeInterval=15s \
  # Activer la compression des snapshots
  -snapshotsMaxAge=5d \
  # Limiter les requêtes concurrentes pour éviter la surcharge
  -search.maxConcurrentRequests=16 \
  # Timeout pour les grosses requêtes
  -search.maxQueryDuration=60s
```

**Stratégie de backup avec vmbackup :**

```bash
#!/bin/bash
# backup_vm.sh - Backup quotidien incrémental vers S3
DATE=$(date +%Y-%m-%d)

vmbackup \
  -storageDataPath=/var/lib/victoriametrics \
  -dst=s3://mon-bucket-vm/backups/${DATE} \
  # Backup incrémental (plus rapide que full)
  -origin=s3://mon-bucket-vm/backups/latest \
  # Mettre à jour le pointeur "latest"
  && aws s3 sync \
    s3://mon-bucket-vm/backups/${DATE} \
    s3://mon-bucket-vm/backups/latest

# Ajouter dans crontab : 0 2 * * * /opt/scripts/backup_vm.sh
```

---

## 9. Guide de Choix Final

### L'arbre de décision

```
Votre situation
      │
      ▼
Avez-vous déjà des Prometheus en production ?
      │
      ├── NON ──→ Voulez-vous la solution la plus simple ?
      │                 │
      │                 ├── OUI ──→ VictoriaMetrics Single ✅
      │                 │
      │                 └── NON ──→ Avez-vous besoin de multi-tenancy strict ?
      │                               │
      │                               ├── OUI ──→ Mimir (si K8s disponible) ✅
      │                               └── NON ──→ VictoriaMetrics Cluster ✅
      │
      └── OUI ──→ Voulez-vous conserver vos Prometheus ?
                    │
                    ├── OUI ──→ Avez-vous plusieurs sites/datacenters ?
                    │               │
                    │               ├── OUI ──→ Thanos ✅
                    │               └── NON ──→ Thanos ou VictoriaMetrics
                    │                           (Remote Write + remplacement)
                    │
                    └── NON ──→ Scalabilité prioritaire (>50M séries) ?
                                  │
                                  ├── OUI ──→ Mimir ✅
                                  └── NON ──→ VictoriaMetrics ✅
```

### Résumé par profil

| Profil | Solution | Raison principale |
|---|---|---|
| **Développeur solo / startup** | VictoriaMetrics Single | Démarrage en 5 minutes |
| **Petite équipe ops (< 5 personnes)** | VictoriaMetrics Single | Maintenance minimale |
| **Entreprise avec plusieurs datacenters** | Thanos | Vue unifiée multi-sites |
| **Fournisseur SaaS de monitoring** | Mimir | Multi-tenancy strict |
| **Industrie IoT / Energy** | VictoriaMetrics Cluster | Compression + volume |
| **Banque / Finance / Conformité** | Thanos | Archivage S3 long terme |
| **Hôpital / Santé** | Mimir | Isolation par service |
| **GAFAM / Hyperscaler** | Mimir | Milliards de séries |

### Compatibilité avec votre stack

| Votre environnement | Recommandation | Notes |
|---|---|---|
| VM Linux (Vagrant / bare metal) | VictoriaMetrics | Binaire unique, parfait |
| Docker Compose | VictoriaMetrics ou Thanos | Thanos si déjà Prometheus |
| Kubernetes | Les 3 fonctionnent | Mimir préféré pour sa scalabilité |
| Kubernetes + Helm | Mimir ou Thanos | Helm charts officiels disponibles |
| Cloud-native (AWS/GCP/Azure) | Thanos ou Mimir | Intégration S3 native |

---

## Conclusion

**VictoriaMetrics** est la porte d'entrée idéale pour 80% des projets. Sa simplicité d'installation, sa performance exceptionnelle et sa compatibilité totale avec PromQL en font un choix quasi universellement bon pour commencer — et souvent suffisant pour rester.

**Thanos** est le choix naturel pour les entreprises qui ont déjà investi dans Prometheus, qui opèrent sur plusieurs sites géographiques, ou qui ont des contraintes d'archivage long terme. Il respecte l'existant tout en l'étendant.

**Mimir** est réservé aux environnements qui ont véritablement besoin de son niveau de puissance : des dizaines de millions de séries, plusieurs équipes ou clients à isoler strictement, et une équipe DevOps/SRE mature pour l'opérer.

> 💡 **Conseil final :** Commencez par VictoriaMetrics. Si vous atteignez ses limites (rares), migrez vers Thanos ou Mimir. L'API étant compatible PromQL dans les trois cas, vos dashboards Grafana resteront intacts.

---

*Document rédigé pour la montée en compétence des équipes infrastructure.*
*Sources : Documentation officielle Thanos, Grafana Mimir, VictoriaMetrics *
