---
title: "Guide pédagogique : Prometheus · Grafana · Thanos · Alertmanager"
description: "Guide pédagogique tous niveaux — Architecture, Installation, Production, Sécurité, Incidents"
created: "2026-04-05"
# updated: "2026-04-04"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"

---

# Documentation Complète : Prometheus · Grafana · Thanos · Alertmanager
### Guide pédagogique tous niveaux — Architecture, Installation, Production, Sécurité, Incidents

---

> **Public visé** : Débutants curieux, développeurs, SRE, architectes, équipes sécurité/conformité (santé, banque, assurance).  
> **Version de référence** : Prometheus 2.53+, Grafana 11+, Thanos 0.35+, Alertmanager 0.27+  
> **Dernière mise à jour** : Avril 2026

---

## Table des matières

1. [Contexte et Histoire](#1-contexte-et-histoire)
2. [Concepts fondamentaux](#2-concepts-fondamentaux)
3. [Architecture détaillée](#3-architecture-détaillée)
4. [Prometheus — Installation et Configuration](#4-prometheus--installation-et-configuration)
5. [PromQL — Le langage de requête](#5-promql--le-langage-de-requête)
6. [Grafana — Visualisation et Tableaux de bord](#6-grafana--visualisation-et-tableaux-de-bord)
7. [Alertmanager — Gestion des alertes](#7-alertmanager--gestion-des-alertes)
8. [Thanos — Haute disponibilité et Long terme](#8-thanos--haute-disponibilité-et-long-terme)
9. [Prometheus vs Thanos — Comparaison approfondie](#9-prometheus-vs-thanos--comparaison-approfondie)
10. [Cas d'utilisation en production — Secteurs sensibles](#10-cas-dutilisation-en-production--secteurs-sensibles)
11. [Sauvegarde et Restauration](#11-sauvegarde-et-restauration)
12. [Sécurité et Conformité](#12-sécurité-et-conformité)
13. [Gestion des incidents — Alertes en retard et cas critiques](#13-gestion-des-incidents--alertes-en-retard-et-cas-critiques)
14. [Bonnes pratiques et Anti-patterns](#14-bonnes-pratiques-et-anti-patterns)
15. [Exporteurs courants](#15-exporteurs-courants)
16. [Kubernetes — Intégration avancée](#16-kubernetes--intégration-avancée)
17. [Annexes — Commandes et références rapides](#17-annexes--commandes-et-références-rapides)

---

## 1. Contexte et Histoire

### 1.1 Naissance de Prometheus (2012–2016)

L'histoire commence chez **SoundCloud**, la plateforme de streaming musical. En 2012, leurs ingénieurs Matt T. Proud et Julius Volz font face à un défi : leur infrastructure microservices, distribuée sur des dizaines de services, est impossible à surveiller avec les outils classiques de l'époque (Nagios, Zabbix, Graphite).

Ces outils ont été conçus pour une infrastructure **statique** : des serveurs physiques avec des IPs fixes, des services prévisibles. Mais SoundCloud déploie des dizaines de services qui apparaissent et disparaissent dynamiquement. Il leur faut quelque chose de nouveau.

Inspirés par **Borgmon**, l'outil interne de monitoring de Google (jamais rendu public), ils créent Prometheus. Le nom est évocateur : Prométhée, le titan qui apporte le feu aux hommes — ici, la connaissance sur l'état d'un système.

**Chronologie clé :**

| Année | Événement |
|-------|-----------|
| 2012 | Création interne chez SoundCloud par Matt T. Proud et Julius Volz |
| 2015 | Publication en open source sur GitHub |
| 2016 | Intégration à la CNCF (Cloud Native Computing Foundation) — 2ème projet après Kubernetes |
| 2018 | Statut "graduated" à la CNCF — signe de maturité et de stabilité |
| 2020+ | Standard de facto pour l'observabilité cloud-native |
| 2026 | Prometheus 3.x — support natif OpenTelemetry, Native Histograms GA |

### 1.2 L'émergence de Grafana (2014)

**Torkel Ödegaard**, développeur suédois, travaille chez Orbitz (voyagiste en ligne). Il utilise Kibana pour visualiser des données Elasticsearch, mais veut une interface similaire pour Graphite et d'autres sources. Il fork Kibana 3 et crée **Grafana**, publié en janvier 2014.

Grafana devient rapidement indépendant de Kibana et s'impose comme **la** solution de visualisation universelle : elle se connecte à n'importe quelle source de données (Prometheus, InfluxDB, Loki, Elasticsearch, PostgreSQL, etc.).

En 2019, Grafana Labs lève 24M$ et l'entreprise s'étoffe. Elle développe ensuite Loki (logs), Tempo (traces) et Mimir (Prometheus à grande échelle), formant l'écosystème **LGTM** (Loki, Grafana, Tempo, Mimir).

### 1.3 Naissance de Thanos (2018)

Prometheus excelle pour une instance unique, mais a une limite fondamentale : **pas de haute disponibilité native**. Deux instances Prometheus surveillant le même cluster ne peuvent pas dédupliquer leurs données, et la rétention est limitée par le disque local.

**Bartek Plotka** et **Fabian Reinartz** (ingénieurs chez Improbable, studio de jeux vidéo) créent **Thanos** pour résoudre ces problèmes. Thanos est publié en 2018 et rejoint la CNCF en 2019.

Le nom vient du personnage Marvel — comme Thanos peut doubler la puissance en "collectant les gemmes", le projet double les capacités de Prometheus en ajoutant le stockage objet et la fédération globale.

### 1.4 Naissance d'Alertmanager

Alertmanager est né avec Prometheus lui-même. Dès 2013, l'équipe réalise qu'un système d'alertes doit être séparé du moteur de collecte. Cette séparation des responsabilités est un principe fondateur : Prometheus évalue les conditions, Alertmanager décide quoi faire des alertes (grouper, silencer, router, notifier).

---

## 2. Concepts fondamentaux

### 2.1 Métriques et séries temporelles

Une **métrique** est une mesure numérique représentant l'état d'un système à un instant donné : usage CPU, nombre de requêtes HTTP, latence d'une base de données...

Une **série temporelle** (time series) est l'enregistrement de cette métrique dans le temps. Elle est identifiée par :

```
<nom_metrique>{<label1>="<valeur1>", <label2>="<valeur2>", ...}
```

Exemple concret :
```
http_requests_total{method="GET", status="200", handler="/api/users"} 1547
http_requests_total{method="POST", status="201", handler="/api/users"} 83
http_requests_total{method="GET", status="404", handler="/api/users"} 12
```

Ce sont **3 séries temporelles distinctes** issues de la même métrique.

### 2.2 Les 4 types de métriques

#### Counter (Compteur)
Un compteur ne fait qu'augmenter (ou se réinitialiser lors d'un redémarrage). Il représente un cumul.

```
# Nombre total de requêtes HTTP depuis le démarrage
http_requests_total{method="GET"} 12483
```

> **Règle d'or** : Utilisez `rate()` ou `increase()` pour calculer le taux à partir d'un counter, jamais la valeur brute.

#### Gauge (Jauge)
Une jauge peut monter et descendre. Elle représente un état courant.

```
# Mémoire disponible en bytes
node_memory_MemAvailable_bytes 2147483648

# Nombre de connexions actives
mysql_global_status_threads_connected 47
```

#### Histogram
Un histogramme mesure la distribution d'une valeur. Il crée automatiquement plusieurs séries :
- `_bucket` : compteurs par tranche (bucket)
- `_sum` : somme de toutes les valeurs
- `_count` : nombre total d'observations

```
# Latence des requêtes HTTP
http_request_duration_seconds_bucket{le="0.1"} 24054
http_request_duration_seconds_bucket{le="0.5"} 33444
http_request_duration_seconds_bucket{le="1.0"} 33781
http_request_duration_seconds_bucket{le="+Inf"} 33785
http_request_duration_seconds_sum 1234.5
http_request_duration_seconds_count 33785
```

> **Avantage majeur** : Les histogrammes sont agrégables entre instances (contrairement aux summaries). Préférez-les toujours en environnement multi-pods.

#### Summary (Résumé)
Similaire à l'histogramme, mais les quantiles sont calculés côté client. **Moins flexible** car non agrégeable entre instances.

```
rpc_duration_seconds{quantile="0.5"} 0.047
rpc_duration_seconds{quantile="0.9"} 0.089
rpc_duration_seconds{quantile="0.99"} 0.193
```

### 2.3 Labels — La dimension supplémentaire

Les labels sont des paires clé-valeur qui permettent de filtrer et d'agréger les métriques. C'est la fonctionnalité la plus puissante de Prometheus — et la plus dangereuse si mal utilisée.

**Bonne utilisation :**
```
# Labels à cardinalité faible et maîtrisée
http_requests_total{
  env="production",
  service="api-gateway",
  method="GET",
  status="200"
}
```

**Utilisation à éviter absolument :**
```
# Labels à cardinalité explosive = OOM garanti
http_requests_total{user_id="uuid-1234-..."} # ❌ Millions de séries
http_requests_total{trace_id="abc123"}        # ❌ Infini
http_requests_total{request_body="..."}       # ❌ Jamais
```

### 2.4 Le modèle Pull vs Push

Prometheus utilise un **modèle Pull** : il va lui-même chercher les métriques sur chaque cible, en scrapant l'endpoint `/metrics` exposé par les applications ou les exporteurs.

```
Prometheus ──── GET /metrics ────> Application (port 8080)
               <── 200 OK + métriques ──
```

**Avantages du Pull :**
- Prometheus sait si une cible est joignable ou non
- Pas de configuration côté application pour connaître l'adresse de Prometheus
- Facilité de débogage (on peut curl `/metrics` manuellement)
- Prometheus contrôle la fréquence de collecte

**Cas où Push est nécessaire :**
- Jobs éphémères (cron, batch) qui n'existent pas assez longtemps → utiliser **Push Gateway**
- Environnements derrière un pare-feu strict
- Métriques d'applications qui ne peuvent pas exposer un serveur HTTP

### 2.5 La découverte de services (Service Discovery)

Dans un environnement dynamique (Kubernetes, Docker Swarm, cloud), les IPs des services changent constamment. Prometheus supporte la découverte automatique via :

- **Kubernetes** : découverte des pods, services, endpoints, nœuds
- **Docker Swarm** : découverte des services et tâches
- **Consul, Eureka, Zookeeper** : registres de services
- **EC2, GCE, Azure** : instances cloud
- **DNS SRV** : enregistrements DNS de services
- **file_sd** : fichier JSON/YAML mis à jour dynamiquement (universal fallback)

---

## 3. Architecture détaillée

### 3.1 Architecture de Prometheus (standalone)

```
┌─────────────────────────────────────────────────────────────────┐
│                        PROMETHEUS SERVER                         │
│                                                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌─────────────────────┐ │
│  │   Retrieval  │    │    TSDB      │    │   HTTP Server       │ │
│  │   (Scraper)  │───>│  (Storage)   │<───│   (API + UI)        │ │
│  └──────────────┘    └──────────────┘    └─────────────────────┘ │
│         │                                          │              │
│  ┌──────┴──────┐                        ┌─────────┴───────────┐  │
│  │  Service    │                        │   Rules Engine      │  │
│  │  Discovery  │                        │ (Recording+Alerting)│  │
│  └─────────────┘                        └─────────────────────┘  │
│                                                  │                │
└──────────────────────────────────────────────────┼───────────────┘
                                                   │
                                          ┌────────▼────────┐
                                          │  Alertmanager   │
                                          │ (Notifications) │
                                          └─────────────────┘

         ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
         │ node-export │  │ app Python  │  │ MySQL exprt │
         │  :9100      │  │  :8080      │  │  :9104      │
         └─────────────┘  └─────────────┘  └─────────────┘
               ↑                ↑                ↑
               └────────────────┴────────────────┘
                    Prometheus scrappe /metrics
```

### 3.2 Architecture TSDB (Time Series Database)

La base de données interne de Prometheus est conçue pour des performances optimales en écriture et en lecture :

```
$PROMETHEUS_DATA/
├── chunks_head/          ← Données récentes en mémoire (WAL)
├── wal/                  ← Write-Ahead Log (protection crash)
│   ├── 00000000
│   └── 00000001
├── 01BKGV7JC0RY8NFH6T68LG/ ← Bloc compacté (2h par défaut)
│   ├── chunks/
│   │   └── 000001
│   ├── index
│   ├── meta.json
│   └── tombstones
└── 01BKGTZQ1ERBDOEQP75G946/ ← Bloc plus ancien
    └── ...
```

**Fonctionnement :**
1. Les données arrivent dans le WAL (Write-Ahead Log) — protection contre les pannes
2. Après ~2h, elles sont compactées en blocs sur disque
3. Les blocs anciens sont mergés progressivement (compaction)
4. La rétention par défaut est de **15 jours**

### 3.3 Architecture Grafana

```
┌─────────────────────────────────────────────────────┐
│                    GRAFANA SERVER                     │
│                                                       │
│  ┌──────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │  Dashboard   │  │   Alerting  │  │   Plugin    │  │
│  │   Engine     │  │   Engine    │  │   System    │  │
│  └──────────────┘  └─────────────┘  └─────────────┘  │
│         │                │                │            │
│  ┌──────┴───────────────────────────────┐ │            │
│  │          Data Source Manager         │ │            │
│  └───────────────────────────────────────┘ │            │
│         │                                   │            │
└─────────┼───────────────────────────────────────────────┘
          │
    ┌─────┴──────┐  ┌──────────┐  ┌──────────┐  ┌──────┐
    │ Prometheus │  │  Loki    │  │  Tempo   │  │  PG  │
    └────────────┘  └──────────┘  └──────────┘  └──────┘
```

### 3.4 Architecture Thanos

```
┌──────────────────────────────────────────────────────────────────┐
│                         THANOS CLUSTER                            │
│                                                                    │
│  Prometheus A  ──── Thanos Sidecar A ──┐                          │
│  (Cluster 1)                           │                          │
│                                        ├──> Object Storage        │
│  Prometheus B  ──── Thanos Sidecar B ──┘    (S3/GCS/Azure)        │
│  (Cluster 2)                                                       │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    Thanos Query                              │  │
│  │  (Vue globale — requêtes PromQL sur toutes les sources)     │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌──────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │  Thanos Store    │  │ Thanos Compact │  │  Thanos Ruler    │  │
│  │  (Object Storage)│  │ (Downsample)   │  │ (Rules globales) │  │
│  └──────────────────┘  └────────────────┘  └──────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Prometheus — Installation et Configuration

### 4.1 Installation sur Linux (méthode binaire)

```bash
# 1. Créer un utilisateur dédié (sans shell de connexion)
sudo useradd --no-create-home --shell /bin/false prometheus

# 2. Créer les répertoires nécessaires
sudo mkdir -p /etc/prometheus /var/lib/prometheus

# 3. Télécharger Prometheus
PROMETHEUS_VERSION="2.53.1"
wget https://github.com/prometheus/prometheus/releases/download/v${PROMETHEUS_VERSION}/prometheus-${PROMETHEUS_VERSION}.linux-amd64.tar.gz

# 4. Extraire et installer les binaires
tar xvf prometheus-${PROMETHEUS_VERSION}.linux-amd64.tar.gz
sudo cp prometheus-${PROMETHEUS_VERSION}.linux-amd64/prometheus /usr/local/bin/
sudo cp prometheus-${PROMETHEUS_VERSION}.linux-amd64/promtool /usr/local/bin/

# 5. Copier les consoles et librairies
sudo cp -r prometheus-${PROMETHEUS_VERSION}.linux-amd64/consoles /etc/prometheus/
sudo cp -r prometheus-${PROMETHEUS_VERSION}.linux-amd64/console_libraries /etc/prometheus/

# 6. Permissions correctes
sudo chown -R prometheus:prometheus /etc/prometheus /var/lib/prometheus
sudo chown prometheus:prometheus /usr/local/bin/prometheus /usr/local/bin/promtool
```

### 4.2 Configuration principale (prometheus.yml)

```yaml
# /etc/prometheus/prometheus.yml

global:
  # Fréquence de scraping par défaut
  scrape_interval: 15s
  # Délai avant qu'une alerte soit considérée comme déclenchée
  evaluation_interval: 15s
  # Timeout d'un scrape individuel
  scrape_timeout: 10s
  # Labels ajoutés à toutes les métriques (identification de l'instance Prometheus)
  external_labels:
    datacenter: 'dc-paris-01'
    env: 'production'
    region: 'eu-west-1'

# Fichiers de règles d'alertes et d'enregistrement
rule_files:
  - "/etc/prometheus/rules/*.yml"

# Configuration de l'Alertmanager
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - "alertmanager:9093"
      # Timeout de communication avec l'Alertmanager
      timeout: 10s

# Points de collecte (scrape targets)
scrape_configs:
  # Prometheus se surveille lui-même
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
    # Métadonnées supplémentaires
    relabel_configs:
      - target_label: component
        replacement: 'prometheus'

  # Surveillance système avec node_exporter
  - job_name: 'node'
    static_configs:
      - targets:
          - 'serveur-app-01:9100'
          - 'serveur-app-02:9100'
          - 'serveur-db-01:9100'
        labels:
          role: 'application'
      - targets:
          - 'serveur-db-02:9100'
        labels:
          role: 'database'
    # Durée de rétention des données pour ce job
    # (override possible par job)
    scrape_interval: 30s

  # Découverte automatique dans Kubernetes
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      # Ne scraper que les pods avec l'annotation prometheus.io/scrape: "true"
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      # Utiliser le port défini dans l'annotation
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        target_label: __address__
        regex: (.+)
        replacement: $1

  # Découverte via fichier (utile pour des cibles dynamiques)
  - job_name: 'file-based-discovery'
    file_sd_configs:
      - files:
          - '/etc/prometheus/targets/*.json'
        refresh_interval: 1m
```

### 4.3 Fichier systemd (service Linux)

```ini
# /etc/systemd/system/prometheus.service

[Unit]
Description=Prometheus Monitoring System
Documentation=https://prometheus.io/docs/introduction/overview/
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=prometheus
Group=prometheus
ExecReload=/bin/kill -HUP $MAINPID
ExecStart=/usr/local/bin/prometheus \
    --config.file=/etc/prometheus/prometheus.yml \
    --storage.tsdb.path=/var/lib/prometheus \
    --storage.tsdb.retention.time=30d \
    --storage.tsdb.retention.size=50GB \
    --web.console.libraries=/etc/prometheus/console_libraries \
    --web.console.templates=/etc/prometheus/consoles \
    --web.listen-address=0.0.0.0:9090 \
    --web.external-url=https://prometheus.mon-domaine.com \
    --web.enable-lifecycle \
    --web.enable-admin-api \
    --log.level=info

# Sécurité renforcée
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ReadWritePaths=/var/lib/prometheus

Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
# Activer et démarrer le service
sudo systemctl daemon-reload
sudo systemctl enable prometheus
sudo systemctl start prometheus
sudo systemctl status prometheus

# Vérifier les logs
sudo journalctl -u prometheus -f
```

### 4.4 Installation avec Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:v2.53.1
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ./prometheus/rules:/etc/prometheus/rules:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
      - '--web.enable-lifecycle'
      - '--web.enable-admin-api'
    restart: unless-stopped
    networks:
      - monitoring

  node-exporter:
    image: prom/node-exporter:v1.8.0
    container_name: node-exporter
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    restart: unless-stopped
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:11.4.0
    container_name: grafana
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning:ro
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_SERVER_ROOT_URL=https://grafana.mon-domaine.com
    restart: unless-stopped
    networks:
      - monitoring

  alertmanager:
    image: prom/alertmanager:v0.27.0
    container_name: alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml:ro
      - alertmanager_data:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
      - '--cluster.listen-address=0.0.0.0:9094'
    restart: unless-stopped
    networks:
      - monitoring

volumes:
  prometheus_data:
  grafana_data:
  alertmanager_data:

networks:
  monitoring:
    driver: bridge
```

### 4.5 Rechargement de configuration à chaud

```bash
# Valider la configuration avant de recharger
promtool check config /etc/prometheus/prometheus.yml

# Recharger sans redémarrer (si --web.enable-lifecycle est activé)
curl -X POST http://localhost:9090/-/reload

# Via signal SIGHUP
kill -HUP $(pgrep prometheus)
```

---

## 5. PromQL — Le langage de requête

### 5.1 Sélecteurs de base

```promql
# Sélectionner toutes les séries d'une métrique
http_requests_total

# Filtrer avec des labels (égalité exacte)
http_requests_total{method="GET", status="200"}

# Filtrer avec une regex
http_requests_total{handler=~"/api/.*"}

# Exclure un label
http_requests_total{status!="200"}

# Combiner plusieurs conditions
http_requests_total{
  env="production",
  method=~"GET|POST",
  status!~"5.."
}
```

### 5.2 Sélecteurs temporels (range vectors)

```promql
# Valeurs des 5 dernières minutes
http_requests_total[5m]

# Valeur il y a exactement 1 heure
http_requests_total offset 1h

# Valeurs des 5 dernières minutes, il y a 1 heure
http_requests_total[5m] offset 1h
```

### 5.3 Fonctions essentielles

```promql
# Taux de requêtes par seconde sur 5 minutes (pour les counters)
rate(http_requests_total[5m])

# Augmentation sur une période (utile pour les dashboards)
increase(http_requests_total[1h])

# Valeur instantanée d'une gauge
node_memory_MemAvailable_bytes

# Pourcentage d'usage CPU
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Pourcentage d'usage mémoire
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# Espace disque utilisé en pourcentage
100 - ((node_filesystem_avail_bytes{fstype!="tmpfs"} / node_filesystem_size_bytes) * 100)

# Percentile 95 de latence (histogramme)
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Agrégation par service
sum by (service) (rate(http_requests_total[5m]))

# Top 5 des services les plus sollicités
topk(5, sum by (service) (rate(http_requests_total[5m])))

# Taux d'erreur HTTP
rate(http_requests_total{status=~"5.."}[5m]) /
rate(http_requests_total[5m])
```

### 5.4 Opérateurs binaires et jointures

```promql
# Ratio entre deux métriques
node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes

# Comparaison (retourne uniquement si condition vraie)
node_memory_MemAvailable_bytes < 1073741824  # < 1 Go

# Jointure de métriques différentes par labels communs
http_requests_total * on (instance) group_left (role) node_role_info

# Soustraction avec correspondance de labels
rate(http_requests_total[5m]) unless on (instance) up == 0
```

### 5.5 Recording Rules (pré-calcul)

Les recording rules pré-calculent des expressions complexes pour accélérer les dashboards.

```yaml
# /etc/prometheus/rules/recording.yml
groups:
  - name: performance_rules
    interval: 1m
    rules:
      # Taux de requêtes HTTP par service (pré-calculé)
      - record: job:http_requests:rate5m
        expr: sum by (job) (rate(http_requests_total[5m]))

      # Usage CPU par instance
      - record: instance:node_cpu_utilisation:rate5m
        expr: |
          1 - avg by (instance) (
            rate(node_cpu_seconds_total{mode="idle"}[5m])
          )

      # Latence P99 par service
      - record: job:http_request_duration_p99:rate5m
        expr: |
          histogram_quantile(0.99,
            sum by (job, le) (
              rate(http_request_duration_seconds_bucket[5m])
            )
          )
```

---

## 6. Grafana — Visualisation et Tableaux de bord

### 6.1 Installation de Grafana

```bash
# Méthode apt (Ubuntu/Debian)
sudo apt-get install -y apt-transport-https software-properties-common
wget -q -O - https://apt.grafana.com/gpg.key | sudo gpg --dearmor -o /usr/share/keyrings/grafana.gpg
echo "deb [signed-by=/usr/share/keyrings/grafana.gpg] https://apt.grafana.com stable main" | \
    sudo tee /etc/apt/sources.list.d/grafana.list
sudo apt-get update
sudo apt-get install grafana

# Démarrage
sudo systemctl enable grafana-server
sudo systemctl start grafana-server
```

### 6.2 Configuration de Grafana (grafana.ini)

```ini
# /etc/grafana/grafana.ini (extraits importants)

[server]
http_addr = 127.0.0.1
http_port = 3000
domain = grafana.mon-domaine.com
root_url = https://grafana.mon-domaine.com
serve_from_sub_path = false

[database]
type = postgres
host = pg-grafana:5432
name = grafana
user = grafana
password = ${GF_DATABASE_PASSWORD}
ssl_mode = require

[security]
admin_user = admin
# Ne jamais mettre le mot de passe en clair ici en production
admin_password = ${GF_SECURITY_ADMIN_PASSWORD}
secret_key = ${GF_SECURITY_SECRET_KEY}
disable_gravatar = true
cookie_secure = true
cookie_samesite = strict
content_type_protection = true
x_content_type_options = true
x_xss_protection = true

[auth]
disable_login_form = false
disable_signout_menu = false
signout_redirect_url =

[auth.ldap]
enabled = true
config_file = /etc/grafana/ldap.toml

[users]
allow_sign_up = false
auto_assign_org_role = Viewer

[alerting]
enabled = true
execute_alerts = true

[unified_alerting]
enabled = true

[log]
mode = console
level = warn
```

### 6.3 Provisionnement automatique (Infrastructure as Code)

Le provisionnement permet de déployer dashboards et datasources via des fichiers YAML, sans cliquer dans l'interface.

**Datasource Prometheus :**
```yaml
# /etc/grafana/provisioning/datasources/prometheus.yml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
    jsonData:
      timeInterval: "15s"
      queryTimeout: "60s"
      httpMethod: POST
    secureJsonData:
      # Si authentification activée sur Prometheus
      # basicAuthPassword: ${PROMETHEUS_PASSWORD}
```

**Dashboard automatique :**
```yaml
# /etc/grafana/provisioning/dashboards/dashboards.yml
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: 'Monitoring'
    type: file
    disableDeletion: false
    updateIntervalSeconds: 30
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
      foldersFromFilesStructure: true
```

### 6.4 Panels essentiels dans Grafana

**Panel Time Series (graphique)** — pour les métriques qui évoluent dans le temps :
```json
{
  "type": "timeseries",
  "title": "Taux de requêtes HTTP",
  "targets": [{
    "expr": "sum by (service) (rate(http_requests_total[5m]))",
    "legendFormat": "{{service}}"
  }],
  "fieldConfig": {
    "defaults": {
      "unit": "reqps",
      "thresholds": {
        "steps": [
          {"color": "green", "value": 0},
          {"color": "yellow", "value": 100},
          {"color": "red", "value": 500}
        ]
      }
    }
  }
}
```

**Panel Stat** — pour afficher une valeur unique avec état :
```
Expression : (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100
Unité : percent (0-100)
Seuils : 0=vert, 80=orange, 90=rouge
```

**Panel Table** — pour lister les instances avec leurs métriques :
```promql
# Espace disque par serveur et par partition
100 - ((node_filesystem_avail_bytes{fstype!="tmpfs"}
        / node_filesystem_size_bytes) * 100)
```

---

## 7. Alertmanager — Gestion des alertes

### 7.1 Concepts clés

Alertmanager reçoit les alertes de Prometheus et les traite en 4 étapes :

1. **Groupement** : Regrouper les alertes similaires pour éviter le "storm" d'alertes
2. **Inhibition** : Supprimer des alertes de moindre importance quand une alerte majeure est active
3. **Silences** : Mettre en pause des alertes temporairement (maintenance)
4. **Routage** : Envoyer les alertes aux bons destinataires selon les labels

### 7.2 Règles d'alerte dans Prometheus

```yaml
# /etc/prometheus/rules/alerts.yml
groups:
  - name: infrastructure
    rules:
      # Alerte si une instance est inaccessible
      - alert: InstanceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
          team: ops
        annotations:
          summary: "Instance {{ $labels.instance }} est inaccessible"
          description: |
            L'instance {{ $labels.instance }} du job {{ $labels.job }}
            est inaccessible depuis {{ $value }} secondes.
          runbook_url: "https://wiki.mon-domaine.com/runbooks/instance-down"

      # Alerte mémoire
      - alert: HighMemoryUsage
        expr: |
          (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 90
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Mémoire élevée sur {{ $labels.instance }}"
          description: "Usage mémoire : {{ printf \"%.1f\" $value }}%"

      # Alerte disque
      - alert: DiskSpaceCritical
        expr: |
          (1 - (node_filesystem_avail_bytes{fstype!="tmpfs"}
          / node_filesystem_size_bytes)) * 100 > 85
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "Espace disque critique sur {{ $labels.instance }}"
          description: |
            Partition {{ $labels.mountpoint }} : {{ printf "%.1f" $value }}% utilisé.
            Espace restant : {{ humanize1024 node_filesystem_avail_bytes }} octets

      # Alerte latence élevée
      - alert: HighLatency
        expr: |
          histogram_quantile(0.99,
            sum by (job, le) (rate(http_request_duration_seconds_bucket[5m]))
          ) > 2
        for: 5m
        labels:
          severity: warning
          team: backend
        annotations:
          summary: "Latence P99 élevée pour {{ $labels.job }}"
          description: "P99 = {{ printf \"%.3f\" $value }}s (seuil : 2s)"

  - name: database
    rules:
      # Alerte réplication MySQL en retard
      - alert: MySQLReplicationLag
        expr: mysql_slave_status_seconds_behind_master > 30
        for: 2m
        labels:
          severity: critical
          team: dba
        annotations:
          summary: "Réplication MySQL en retard sur {{ $labels.instance }}"
          description: "Retard : {{ $value }} secondes"
```

### 7.3 Configuration Alertmanager

```yaml
# /etc/alertmanager/alertmanager.yml

global:
  resolve_timeout: 5m
  smtp_smarthost: 'smtp.mon-domaine.com:587'
  smtp_from: 'alertmanager@mon-domaine.com'
  smtp_auth_username: 'alertmanager@mon-domaine.com'
  smtp_auth_password: '${SMTP_PASSWORD}'
  smtp_require_tls: true

# Modèles de notification personnalisés
templates:
  - '/etc/alertmanager/templates/*.tmpl'

# Arbre de routage
route:
  # Route par défaut
  receiver: 'team-ops-email'
  group_by: ['alertname', 'datacenter', 'app']
  group_wait: 30s       # Attendre avant d'envoyer (grouper les alertes)
  group_interval: 5m    # Intervalle entre deux groupes
  repeat_interval: 4h   # Répéter si l'alerte persiste

  routes:
    # Alertes critiques → PagerDuty immédiatement
    - match:
        severity: critical
      receiver: 'pagerduty-critical'
      group_wait: 10s
      repeat_interval: 1h
      continue: true  # Continuer vers les autres routes aussi

    # Alertes base de données → équipe DBA
    - match:
        team: dba
      receiver: 'team-dba'
      group_by: ['alertname', 'instance']

    # Alertes backend → équipe backend
    - match:
        team: backend
      receiver: 'team-backend-slack'

    # Pas d'alertes la nuit pour les warnings (sauf critique)
    - match:
        severity: warning
      receiver: 'team-ops-email'
      mute_time_intervals:
        - outside-business-hours

# Inhibition : si un serveur est down, ne pas envoyer les alertes enfants
inhibit_rules:
  - source_match:
      alertname: 'InstanceDown'
    target_match_re:
      alertname: 'HighMemoryUsage|DiskSpaceCritical|HighLatency'
    equal: ['instance']

  # Si alerte critique active, inhiber les warnings du même service
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'instance']

# Intervalles de temps pour les silences planifiés
time_intervals:
  - name: outside-business-hours
    time_intervals:
      - times:
          - start_time: '18:00'
            end_time: '08:00'
        weekdays: ['monday:friday']
      - weekdays: ['saturday', 'sunday']

# Définition des récepteurs
receivers:
  - name: 'team-ops-email'
    email_configs:
      - to: 'ops@mon-domaine.com'
        send_resolved: true
        html: '{{ template "email.html" . }}'

  - name: 'pagerduty-critical'
    pagerduty_configs:
      - routing_key: '${PAGERDUTY_KEY}'
        send_resolved: true
        severity: '{{ if eq .GroupLabels.severity "critical" }}critical{{ else }}warning{{ end }}'
        description: '{{ template "pagerduty.description" . }}'

  - name: 'team-dba'
    email_configs:
      - to: 'dba@mon-domaine.com'
    slack_configs:
      - api_url: '${SLACK_DBA_WEBHOOK}'
        channel: '#alerts-database'
        title: '{{ template "slack.title" . }}'
        text: '{{ template "slack.text" . }}'

  - name: 'team-backend-slack'
    slack_configs:
      - api_url: '${SLACK_BACKEND_WEBHOOK}'
        channel: '#alerts-backend'
        send_resolved: true
```

### 7.4 Template de notification personnalisé

```
{{/* /etc/alertmanager/templates/email.tmpl */}}
{{ define "email.html" }}
<!DOCTYPE html>
<html>
<body>
<h2>{{ if eq .Status "firing" }}🔴 ALERTE{{ else }}✅ RÉSOLU{{ end }}</h2>
<table>
  {{ range .Alerts }}
  <tr>
    <td><b>Alerte</b></td><td>{{ .Labels.alertname }}</td>
  </tr>
  <tr>
    <td><b>Sévérité</b></td><td>{{ .Labels.severity }}</td>
  </tr>
  <tr>
    <td><b>Instance</b></td><td>{{ .Labels.instance }}</td>
  </tr>
  <tr>
    <td><b>Description</b></td><td>{{ .Annotations.description }}</td>
  </tr>
  <tr>
    <td><b>Runbook</b></td><td><a href="{{ .Annotations.runbook_url }}">Voir le runbook</a></td>
  </tr>
  {{ end }}
</table>
</body>
</html>
{{ end }}
```

---

## 8. Thanos — Haute disponibilité et Long terme

### 8.1 Composants de Thanos

| Composant | Rôle | Port par défaut |
|-----------|------|-----------------|
| **Sidecar** | S'attache à Prometheus, envoie les données vers le stockage objet | 10901 (gRPC), 10902 (HTTP) |
| **Store** | Expose les données du stockage objet via gRPC | 10901, 10902 |
| **Query** | Interface de requête globale (PromQL sur toutes les sources) | 10902 |
| **Query Frontend** | Cache et parallelisation des requêtes | 10902 |
| **Compact** | Compaction et downsampling des données historiques | 10902 |
| **Ruler** | Évaluation des règles globalement | 10901, 10902 |
| **Receive** | Point d'entrée pour le mode Push (Remote Write) | 10907, 10908, 10909 |

### 8.2 Installation du Sidecar Thanos

```yaml
# docker-compose.yml — Prometheus + Thanos Sidecar
services:
  prometheus:
    image: prom/prometheus:v2.53.1
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.min-block-duration=2h'
      - '--storage.tsdb.max-block-duration=2h'  # Important pour Thanos
      - '--web.enable-lifecycle'

  thanos-sidecar:
    image: quay.io/thanos/thanos:v0.35.0
    command:
      - 'sidecar'
      - '--tsdb.path=/prometheus'
      - '--prometheus.url=http://prometheus:9090'
      - '--grpc-address=0.0.0.0:10901'
      - '--http-address=0.0.0.0:10902'
      - '--objstore.config-file=/etc/thanos/bucket.yml'
    volumes:
      - prometheus_data:/prometheus
      - ./thanos/bucket.yml:/etc/thanos/bucket.yml:ro
```

### 8.3 Configuration du stockage objet (S3 compatible)

```yaml
# /etc/thanos/bucket.yml
type: S3
config:
  bucket: "prometheus-long-term-storage"
  endpoint: "s3.eu-west-1.amazonaws.com"
  region: "eu-west-1"
  access_key: "${AWS_ACCESS_KEY}"
  secret_key: "${AWS_SECRET_KEY}"
  # Pour MinIO ou autre S3-compatible
  # endpoint: "minio:9000"
  # insecure: false

# Alternative GCS
# type: GCS
# config:
#   bucket: "prometheus-long-term"

# Alternative Azure Blob Storage
# type: AZURE
# config:
#   storage_account: "moncompte"
#   storage_account_key: "${AZURE_KEY}"
#   container: "prometheus"
```

### 8.4 Architecture Thanos complète

```yaml
# docker-compose-thanos.yml

services:
  thanos-query:
    image: quay.io/thanos/thanos:v0.35.0
    command:
      - 'query'
      - '--grpc-address=0.0.0.0:10901'
      - '--http-address=0.0.0.0:10902'
      # Se connecte aux sidecars et aux stores
      - '--store=thanos-sidecar-dc1:10901'
      - '--store=thanos-sidecar-dc2:10901'
      - '--store=thanos-store:10901'
      # Déduplication des séries (si 2 Prometheus surveillent le même cluster)
      - '--query.replica-label=prometheus_replica'
    ports:
      - "10902:10902"

  thanos-store:
    image: quay.io/thanos/thanos:v0.35.0
    command:
      - 'store'
      - '--grpc-address=0.0.0.0:10901'
      - '--http-address=0.0.0.0:10902'
      - '--data-dir=/data'
      - '--objstore.config-file=/etc/thanos/bucket.yml'
    volumes:
      - thanos_store_data:/data
      - ./thanos/bucket.yml:/etc/thanos/bucket.yml:ro

  thanos-compact:
    image: quay.io/thanos/thanos:v0.35.0
    command:
      - 'compact'
      - '--data-dir=/data'
      - '--objstore.config-file=/etc/thanos/bucket.yml'
      - '--http-address=0.0.0.0:10902'
      # Downsampling : 5m pour données > 40j, 1h pour données > 1 an
      - '--retention.resolution-raw=40d'
      - '--retention.resolution-5m=120d'
      - '--retention.resolution-1h=5y'
      - '--wait'  # Fonctionner en mode daemon
    volumes:
      - thanos_compact_data:/data
      - ./thanos/bucket.yml:/etc/thanos/bucket.yml:ro

  thanos-query-frontend:
    image: quay.io/thanos/thanos:v0.35.0
    command:
      - 'query-frontend'
      - '--http-address=0.0.0.0:10902'
      - '--query-frontend.downstream-url=http://thanos-query:10902'
      # Cache des requêtes (Redis recommandé en production)
      - '--query-range.response-cache-config-file=/etc/thanos/cache.yml'
    ports:
      - "19902:10902"
```

---

## 9. Prometheus vs Thanos — Comparaison approfondie

### 9.1 Tableau comparatif global

| Critère | Prometheus seul | Prometheus + Thanos |
|---------|----------------|---------------------|
| **Complexité d'installation** | ⭐ Simple | ⭐⭐⭐⭐ Complexe |
| **Haute disponibilité** | ❌ Non native | ✅ Oui (déduplication) |
| **Rétention données** | 15 jours (défaut) | Illimitée (stockage objet) |
| **Coût infrastructure** | Faible | Élevé (objet storage, compute) |
| **Vue globale multi-cluster** | ❌ Fédération limitée | ✅ Query global |
| **Downsampling** | ❌ Non | ✅ Oui (5m, 1h, raw) |
| **Requêtes longues périodes** | Lent sur >30j | Rapide avec downsampling |
| **Conformité RGPD / rétention** | Difficile | Facile (contrôle S3 lifecycle) |
| **Debugging** | Simple | Complexe (multi-composants) |
| **Equipe requise** | 1 SRE junior | 2-3 SRE expérimentés |

### 9.2 Quand utiliser Prometheus seul ?

**Scénarios idéaux pour Prometheus standalone :**

- **Startup / petite structure** : < 50 services, < 500 000 séries temporelles
- **Monitoring d'un seul cluster** : pas besoin de vue globale
- **Rétention courte suffisante** : données < 30 jours acceptables
- **Équipe petite** : un seul outil à maîtriser
- **Prototype / développement** : mise en route rapide en 30 minutes
- **Conformité non-critique** : pas d'obligation de rétention longue

**Limites concrètes de Prometheus seul :**
```
Règle empirique :
- < 1 million de séries actives  : Prometheus seul OK
- 1-10 millions de séries        : Prometheus + remote_write vers VictoriaMetrics
- > 10 millions de séries        : Thanos ou Mimir obligatoire
- Rétention > 3 mois obligatoire : Thanos ou stockage externe
```

### 9.3 Quand utiliser Thanos ?

**Scénarios qui nécessitent Thanos :**

- **Multi-datacenter** : vous avez des Prometheus dans plusieurs DC/régions
- **Haute disponibilité** : vous ne pouvez pas vous permettre une perte de données
- **Compliance légale** : obligation de conserver les métriques 5-10 ans
- **Grandes équipes** : plusieurs équipes avec leurs propres instances Prometheus
- **Kubernetes multi-cluster** : une vue unifiée de tous vos clusters
- **Débogage historique** : besoin de comparer la semaine passée avec il y a 1 an

### 9.4 Alternatives à considérer

| Solution | Forces | Pour qui ? |
|----------|--------|------------|
| **VictoriaMetrics** | Performance extrême, compatible PromQL, simple | Alternative à Thanos, plus performante |
| **Grafana Mimir** | Multi-tenant natif, cloud-native, compatible Thanos | Grandes entreprises, SaaS |
| **Cortex** | Précurseur de Mimir, mature | Legacy, si déjà déployé |
| **InfluxDB** | Bon pour IoT, flexibilité de schéma | Cas spéciaux non-Prometheus |

---

## 10. Cas d'utilisation en production — Secteurs sensibles

### 10.1 Secteur Bancaire et Financier

**Contraintes réglementaires :**
- **Bâle III / DORA** : exigences de résilience opérationnelle, audit des systèmes
- **PCI-DSS** : surveillance des accès aux données de carte bancaire
- **RGPD** : minimisation des données dans les métriques
- **Rétention** : logs et métriques souvent conservés 5 à 10 ans

**Architecture recommandée :**

```
┌─────────────────────────────────────────────────────────────┐
│                    BANQUE — Architecture Monitoring          │
│                                                              │
│  Zone Production              Zone Monitoring (isolée)       │
│  ┌─────────────┐              ┌─────────────────────────┐   │
│  │ API Payment │──/metrics──> │ Prometheus (HA x2)      │   │
│  │ API Client  │              │ + Thanos Sidecar        │   │
│  │ Core Banking│              └─────────────────────────┘   │
│  └─────────────┘                         │                  │
│                                          ▼                  │
│                              ┌─────────────────────────┐   │
│                              │ Stockage S3 chiffré     │   │
│                              │ (rétention 7 ans)       │   │
│                              │ + chiffrement SSE-KMS   │   │
│                              └─────────────────────────┘   │
│                                          │                  │
│  Zone Consultation (lecture seule)       ▼                  │
│  ┌─────────────┐              ┌─────────────────────────┐   │
│  │   Grafana   │<─────────────│   Thanos Query          │   │
│  │ (auth LDAP) │              │ (read-only, TLS mutuel) │   │
│  └─────────────┘              └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Métriques critiques pour la banque :**
```yaml
# Règles d'alerte secteur bancaire
groups:
  - name: banking_critical
    rules:
      # Latence des transactions de paiement
      - alert: PaymentHighLatency
        expr: |
          histogram_quantile(0.99,
            rate(payment_transaction_duration_seconds_bucket{
              env="production"
            }[5m])
          ) > 3
        for: 2m
        labels:
          severity: critical
          domain: payment
        annotations:
          summary: "Latence paiement P99 > 3s"
          impact: "SLA client compromis"
          runbook_url: "https://wiki/runbooks/payment-latency"

      # Taux d'erreur des API financières
      - alert: FinancialAPIErrorRate
        expr: |
          rate(http_requests_total{
            service=~"api-payment|api-account|api-transfer",
            status=~"5.."
          }[5m]) /
          rate(http_requests_total{
            service=~"api-payment|api-account|api-transfer"
          }[5m]) > 0.01
        for: 1m
        labels:
          severity: critical
          domain: core-banking
        annotations:
          summary: "Taux d'erreur API > 1% sur {{ $labels.service }}"

      # Détection de patterns anormaux (pic soudain de requêtes = potentielle attaque)
      - alert: UnusualRequestSpike
        expr: |
          rate(http_requests_total{service="api-payment"}[5m]) >
          avg_over_time(rate(http_requests_total{service="api-payment"}[5m])[1h:5m]) * 5
        for: 3m
        labels:
          severity: warning
          domain: security
        annotations:
          summary: "Pic anormal de requêtes sur API paiement"
```

**Bonnes pratiques secteur bancaire :**
- **Jamais de données personnelles dans les labels** (numéro de compte, IBAN, nom client)
- **Chiffrement end-to-end** : TLS sur tous les endpoints `/metrics`
- **Authentification mTLS** entre Prometheus et les cibles
- **Journaux d'audit** : qui consulte quoi dans Grafana (plugin Audit Log)
- **Séparation des environnements** : un Prometheus par environnement (prod/préprod/dev)
- **Accès Grafana via SSO LDAP/SAML** avec MFA obligatoire

### 10.2 Secteur Santé (RGPD / HDS)

**Contraintes spécifiques :**
- **HDS (Hébergeur de Données de Santé)** : certification obligatoire en France
- **HIPAA** (USA) : stricte protection des données de santé
- **RGPD Article 9** : données de santé = catégorie spéciale, protection maximale
- **Traçabilité** : qui accède aux métriques et quand

> ⚠️ **Règle absolue** : Les métriques ne doivent JAMAIS contenir d'identifiants patients (nom, numéro de sécu, IPP). Utilisez uniquement des compteurs agrégés.

**Labels autorisés en santé :**
```promql
# ✅ OK — métriques agrégées, aucune donnée personnelle
http_requests_total{service="dossier-patient-api", department="urgences"}

# ❌ INTERDIT — identifiant patient dans le label
http_requests_total{patient_id="123456", ipp="P987654"}
```

**Métriques critiques santé :**
```yaml
groups:
  - name: healthcare_critical
    rules:
      # Disponibilité du système de dossiers patients (DMP)
      - alert: DossierPatientSystemDown
        expr: up{service="dmp-api"} == 0
        for: 30s
        labels:
          severity: critical
          domain: patient-care
        annotations:
          summary: "Système DMP inaccessible"
          impact: "Accès aux dossiers patients impossible — risque patient"

      # Disponibilité des équipements connectés (monitoring ICU)
      - alert: MedicalDeviceGatewayDown
        expr: up{service="medical-device-gateway"} == 0
        for: 1m
        labels:
          severity: critical
          domain: clinical
        annotations:
          summary: "Passerelle équipements médicaux indisponible"

      # Latence des appels API vers les systèmes critiques
      - alert: ClinicalAPIHighLatency
        expr: |
          histogram_quantile(0.95,
            rate(http_request_duration_seconds_bucket{
              service=~"hl7-gateway|fhir-api"
            }[5m])
          ) > 5
        for: 2m
        labels:
          severity: critical
```

### 10.3 Surveillance de systèmes de sauvegarde

La surveillance des sauvegardes est souvent négligée jusqu'au moment critique (restauration).

**Métriques de sauvegarde via Push Gateway :**
```bash
#!/bin/bash
# Script de sauvegarde avec métriques Prometheus

BACKUP_START=$(date +%s)
BACKUP_STATUS=0
BACKUP_SIZE=0
JOB_NAME="backup_postgresql"
INSTANCE="prod-db-01"
PUSHGATEWAY_URL="http://pushgateway:9091"

# Effectuer la sauvegarde
pg_dump -Fc mydb > /backup/mydb_$(date +%Y%m%d_%H%M%S).dump
BACKUP_STATUS=$?
BACKUP_SIZE=$(du -b /backup/mydb_*.dump | tail -1 | cut -f1)

BACKUP_END=$(date +%s)
BACKUP_DURATION=$((BACKUP_END - BACKUP_START))

# Pousser les métriques vers Push Gateway
cat << EOF | curl --data-binary @- ${PUSHGATEWAY_URL}/metrics/job/${JOB_NAME}/instance/${INSTANCE}
# HELP backup_last_success_timestamp_seconds Timestamp de la dernière sauvegarde réussie
# TYPE backup_last_success_timestamp_seconds gauge
backup_last_success_timestamp_seconds $([ $BACKUP_STATUS -eq 0 ] && echo $BACKUP_END || echo 0)

# HELP backup_duration_seconds Durée de la sauvegarde en secondes
# TYPE backup_duration_seconds gauge
backup_duration_seconds $BACKUP_DURATION

# HELP backup_size_bytes Taille de la sauvegarde en octets
# TYPE backup_size_bytes gauge
backup_size_bytes $BACKUP_SIZE

# HELP backup_success Succès de la dernière sauvegarde (1=OK, 0=KO)
# TYPE backup_success gauge
backup_success $( [ $BACKUP_STATUS -eq 0 ] && echo 1 || echo 0)
EOF
```

**Alertes sur les sauvegardes :**
```yaml
groups:
  - name: backup_monitoring
    rules:
      # Alerte si sauvegarde non effectuée depuis 25h (doit tourner quotidiennement)
      - alert: BackupMissing
        expr: |
          time() - backup_last_success_timestamp_seconds{job="backup_postgresql"} > 90000
        for: 5m
        labels:
          severity: critical
          domain: backup
        annotations:
          summary: "Sauvegarde PostgreSQL manquante sur {{ $labels.instance }}"
          description: |
            Dernière sauvegarde réussie il y a
            {{ humanizeDuration (time() - backup_last_success_timestamp_seconds) }}.
            Vérifier le job de sauvegarde immédiatement.

      # Sauvegarde en échec
      - alert: BackupFailed
        expr: backup_success == 0
        for: 0m
        labels:
          severity: critical
        annotations:
          summary: "Sauvegarde échouée sur {{ $labels.instance }}"

      # Taille anormale (sauvegarde trop petite = corruption possible)
      - alert: BackupSizeAnomaly
        expr: |
          backup_size_bytes < (
            avg_over_time(backup_size_bytes[7d]) * 0.5
          )
        for: 0m
        labels:
          severity: warning
        annotations:
          summary: "Taille sauvegarde anormalement petite sur {{ $labels.instance }}"
          description: "Taille actuelle {{ humanize1024 backup_size_bytes }}B vs moyenne 7j"
```

---

## 11. Sauvegarde et Restauration

### 11.1 Sauvegarde de Prometheus

**Méthode 1 — Snapshot via API (recommandée, sans downtime)**
```bash
# Créer un snapshot de la TSDB
curl -X POST http://localhost:9090/api/v1/admin/tsdb/snapshot

# Réponse :
# {"status":"success","data":{"name":"20240415T153000Z-abc123def456"}}

# Le snapshot est dans /var/lib/prometheus/snapshots/
ls /var/lib/prometheus/snapshots/

# Copier vers stockage externe
rsync -av /var/lib/prometheus/snapshots/20240415T153000Z-abc123def456/ \
    backup-server:/backups/prometheus/$(date +%Y%m%d)/
```

**Méthode 2 — Backup du répertoire de données (avec arrêt)**
```bash
# Arrêter Prometheus
sudo systemctl stop prometheus

# Backup complet
tar -czf /backup/prometheus_data_$(date +%Y%m%d_%H%M%S).tar.gz \
    /var/lib/prometheus/

# Redémarrer
sudo systemctl start prometheus
```

**Méthode 3 — Volume Docker avec pause**
```bash
# Pause du container (freeze)
docker pause prometheus

# Backup du volume
docker run --rm \
    -v prometheus_data:/source:ro \
    -v /backup:/backup \
    alpine tar -czf /backup/prometheus_$(date +%Y%m%d).tar.gz /source

# Reprendre
docker unpause prometheus
```

### 11.2 Restauration de Prometheus

```bash
# 1. Arrêter Prometheus
sudo systemctl stop prometheus

# 2. Sauvegarder les données actuelles (précaution)
sudo mv /var/lib/prometheus /var/lib/prometheus.old

# 3. Créer un nouveau répertoire de données
sudo mkdir /var/lib/prometheus

# 4a. Restaurer depuis un snapshot
sudo cp -r /backup/prometheus/snapshot/* /var/lib/prometheus/
# OU
# 4b. Restaurer depuis une archive complète
sudo tar -xzf /backup/prometheus_data_20240415.tar.gz -C /

# 5. Corriger les permissions
sudo chown -R prometheus:prometheus /var/lib/prometheus

# 6. Redémarrer
sudo systemctl start prometheus

# 7. Vérifier l'intégrité
promtool tsdb analyze /var/lib/prometheus
```

### 11.3 Sauvegarde de Grafana

```bash
# Sauvegarder la base de données SQLite (si Grafana standalone)
cp /var/lib/grafana/grafana.db /backup/grafana_$(date +%Y%m%d).db

# Sauvegarder les plugins et provisioning
tar -czf /backup/grafana_config_$(date +%Y%m%d).tar.gz \
    /etc/grafana/ \
    /var/lib/grafana/plugins/

# Pour PostgreSQL (production recommandée)
pg_dump -h localhost -U grafana grafana | \
    gzip > /backup/grafana_db_$(date +%Y%m%d).sql.gz
```

**Exporter les dashboards via API :**
```bash
#!/bin/bash
# Script d'export automatique de tous les dashboards Grafana

GRAFANA_URL="http://localhost:3000"
GRAFANA_TOKEN="<votre-token-API>"
BACKUP_DIR="/backup/grafana/dashboards/$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

# Récupérer la liste de tous les dashboards
DASHBOARDS=$(curl -s -H "Authorization: Bearer $GRAFANA_TOKEN" \
    "$GRAFANA_URL/api/search?type=dash-db" | \
    jq -r '.[].uid')

# Exporter chaque dashboard
for uid in $DASHBOARDS; do
    DASHBOARD_JSON=$(curl -s -H "Authorization: Bearer $GRAFANA_TOKEN" \
        "$GRAFANA_URL/api/dashboards/uid/$uid")
    
    DASHBOARD_TITLE=$(echo $DASHBOARD_JSON | jq -r '.dashboard.title' | \
        tr ' ' '_' | tr -cd '[:alnum:]_-')
    
    echo $DASHBOARD_JSON | jq '.dashboard' > \
        "$BACKUP_DIR/${uid}_${DASHBOARD_TITLE}.json"
    echo "✅ Exporté : $DASHBOARD_TITLE"
done

echo "Backup terminé : $BACKUP_DIR"
```

### 11.4 Plan de reprise d'activité (PRA) — Prometheus

```
Scénario : Panne totale du serveur Prometheus

RTO (Recovery Time Objective) : < 30 minutes
RPO (Recovery Point Objective) : < 2 heures (fréquence des snapshots)

Procédure :
1. Provisionner un nouveau serveur (Terraform/Ansible) : ~10 min
2. Installer Prometheus via Ansible playbook : ~5 min
3. Restaurer le dernier snapshot : ~10 min
4. Vérifier que toutes les cibles sont scrapées : ~5 min
Total : ~30 minutes

Si Thanos est utilisé :
- Les données historiques sont dans S3 : aucune perte
- Prometheus peut démarrer vide et reconstruire depuis Thanos Store
- RTO : < 15 minutes (seulement l'installation)
- RPO : 0 (données dans S3)
```

---

## 12. Sécurité et Conformité

### 12.1 Sécurisation de Prometheus

**TLS et authentification basique :**
```yaml
# /etc/prometheus/web.yml — Fichier de configuration web

tls_server_config:
  cert_file: /etc/prometheus/certs/prometheus.crt
  key_file: /etc/prometheus/certs/prometheus.key
  # Forcer TLS 1.2 minimum
  min_version: TLS12
  # Chiffrements recommandés
  cipher_suites:
    - TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
    - TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256

basic_auth_users:
  # Généré avec : htpasswd -nBC 10 admin
  admin: $2y$10$h8d9fK...
  readonly: $2y$10$j7f3kL...
```

```bash
# Lancer Prometheus avec web.yml
prometheus \
  --config.file=/etc/prometheus/prometheus.yml \
  --web.config.file=/etc/prometheus/web.yml
```

**Reverse proxy Nginx avec auth :**
```nginx
# /etc/nginx/sites-available/prometheus

server {
    listen 443 ssl http2;
    server_name prometheus.mon-domaine.com;

    ssl_certificate /etc/letsencrypt/live/mon-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mon-domaine.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;

    # Authentification basique
    auth_basic "Prometheus - Accès restreint";
    auth_basic_user_file /etc/nginx/.htpasswd;

    # En-têtes de sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header Content-Security-Policy "default-src 'self'" always;

    location / {
        proxy_pass http://localhost:9090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        # Whitelist IP — restreindre encore davantage
        allow 10.0.0.0/8;
        allow 192.168.0.0/16;
        deny all;
    }
}
```

### 12.2 mTLS entre Prometheus et les cibles

Pour les environnements sensibles (banque, santé), utiliser l'authentification mutuelle par certificats :

```yaml
# Configuration Prometheus pour mTLS
scrape_configs:
  - job_name: 'secure-targets'
    scheme: https
    tls_config:
      # Certificat de l'autorité de certification
      ca_file: /etc/prometheus/certs/ca.crt
      # Certificat client de Prometheus
      cert_file: /etc/prometheus/certs/prometheus-client.crt
      key_file: /etc/prometheus/certs/prometheus-client.key
      # Vérifier le nom du serveur
      insecure_skip_verify: false
    static_configs:
      - targets: ['app-01:8443']
```

### 12.3 RBAC dans Grafana

```yaml
# Rôles et permissions dans Grafana
# Viewer    : lecture seule des dashboards partagés
# Editor    : créer/modifier des dashboards
# Admin     : configuration complète

# Provisionnement des équipes et permissions
apiVersion: 1
teams:
  - name: "Équipe Ops"
    org_id: 1
    email: "ops@mon-domaine.com"
    
  - name: "Équipe DBA"
    org_id: 1
    email: "dba@mon-domaine.com"
```

### 12.4 Audit des accès Grafana

```ini
# Activer les logs d'audit dans grafana.ini
[log]
mode = console file
level = info

[log.file]
log_rotate = true
max_lines = 1000000
max_size_shift = 28  # 256 MB

# Plugin d'audit Enterprise
[audit]
enabled = true
log_frontend_requests = true
```

---

## 13. Gestion des incidents — Alertes en retard et cas critiques

### 13.1 Pourquoi les alertes arrivent-elles en retard ?

C'est l'une des questions les plus fréquentes en production. Voici les causes et les solutions :

**Cause 1 : La clause `for:` dans les règles d'alerte**

```yaml
# Cette alerte ne se déclenchera QUE si la condition est vraie pendant 5 minutes
- alert: HighCPU
  expr: node_cpu_utilisation > 0.90
  for: 5m  # ← C'est voulu ! Évite les faux positifs
```

La clause `for:` est intentionnelle : elle évite les alertes sur des pics transitoires. Pour les incidents critiques, réduire à `1m` ou `0m`.

**Cause 2 : Délai de groupement dans Alertmanager**

```yaml
route:
  group_wait: 30s      # Alertmanager attend 30s avant d'envoyer
  group_interval: 5m   # Si nouveau membre, attend encore 5m
  repeat_interval: 4h  # Ne répète l'alerte que toutes les 4h
```

Pour les alertes P1 (critiques) : réduire `group_wait` à 10s.

**Cause 3 : Prometheus scrape en retard**

```
Diagnostic :
prometheus_rule_group_last_evaluation_timestamp_seconds
prometheus_rule_group_last_duration_seconds
scrape_duration_seconds
```

```yaml
# Alerte sur le retard d'évaluation des règles
- alert: PrometheusRuleEvaluationSlow
  expr: |
    prometheus_rule_group_last_duration_seconds >
    prometheus_rule_group_interval_seconds * 0.9
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Évaluation des règles Prometheus trop lente"
```

**Cause 4 : Alertmanager injoignable**

```yaml
# Surveiller la connectivité Prometheus -> Alertmanager
- alert: AlertmanagerDown
  expr: alertmanager_notifications_failed_total > 0
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: "Alertmanager inaccessible depuis Prometheus"
```

### 13.2 Plan de réponse aux incidents (SRE)

**Niveaux de sévérité recommandés :**

| Niveau | Définition | Temps de réponse | Canal |
|--------|-----------|-----------------|-------|
| **P1 / Critical** | Service down, impact client direct, perte de données | < 15 min | PagerDuty + SMS + Call |
| **P2 / High** | Dégradation significative, SLA menacé | < 1 heure | Slack + Email |
| **P3 / Medium** | Anomalie détectée, pas d'impact immédiat | < 4 heures | Email |
| **P4 / Low** | Information, tendance à surveiller | < 24 heures | Ticket ITSM |

**Procédure d'incident type :**

```
1. DÉTECTION (automatique via Alertmanager)
   ↓
2. NOTIFICATION → Astreinte PagerDuty ou Slack
   Délai cible : < 2 min

3. ACCUSÉ DE RÉCEPTION
   → L'ingénieur d'astreinte confirme la prise en charge
   → Ouvre un bridge de crise (Zoom/Teams)
   Délai cible : < 5 min

4. TRIAGE
   → Identifier l'impact réel (combien d'utilisateurs affectés ?)
   → Prometheus : vérifier les dashboards Grafana
   → Thanos Query : comparer avec données historiques
   Délai cible : < 15 min

5. MITIGATION
   → Action immédiate pour limiter l'impact
   → Redémarrage service, bascule, rollback...
   Délai cible : < 30 min (P1)

6. RÉSOLUTION
   → Confirmer retour à la normale via métriques
   → Vérifier that alerts are resolved in Alertmanager

7. POST-MORTEM (dans les 48h)
   → Root Cause Analysis
   → Actions correctives documentées
   → Amélioration des alertes et runbooks
```

### 13.3 Dead Man's Switch — L'alerte qui surveille vos alertes

Un **Dead Man's Switch** est une alerte qui se déclenche si votre système de monitoring lui-même tombe en panne. C'est la surveillance de la surveillance.

```yaml
# Dans Prometheus — règle qui est TOUJOURS vraie
- alert: Watchdog
  expr: vector(1)
  labels:
    severity: none
  annotations:
    summary: "Cette alerte confirme que Prometheus fonctionne"
    description: |
      Si cette alerte disparaît, Prometheus ou Alertmanager
      est en panne. Ce silence inattendu doit déclencher
      une alerte externe.
```

**Configuration Alertmanager pour Dead Man's Switch :**
```yaml
# Envoyer le Watchdog vers un service externe (ex: healthchecks.io)
receivers:
  - name: 'watchdog'
    webhook_configs:
      - url: 'https://hc-ping.com/votre-uuid-unique'
        send_resolved: false  # Important : envoyer en continu

route:
  routes:
    - match:
        alertname: Watchdog
      receiver: watchdog
      group_wait: 0s
      repeat_interval: 60s  # Ping toutes les 60 secondes
```

### 13.4 Alertes sur les métriques manquantes

```yaml
# Détecter l'absence d'une métrique (source de données silencieuse)
- alert: MetricAbsent
  expr: absent(up{job="critical-service"})
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "La métrique 'up' est absente pour critical-service"
    description: |
      Le service ne scrape plus. Causes possibles :
      - Service arrêté
      - Endpoint /metrics inaccessible
      - Réseau coupé entre Prometheus et la cible
```

### 13.5 Runbook — Modèle de réponse aux alertes

```markdown
# Runbook : InstanceDown

## Symptôme
L'alerte `InstanceDown` est déclenchée pour l'instance {{ $labels.instance }}.

## Impact
- Service {{ $labels.job }} inaccessible
- Risque de dégradation si instance critique

## Diagnostic immédiat (< 2 minutes)

### 1. Vérifier l'état depuis Prometheus
URL : http://prometheus:9090/targets

### 2. Ping réseau
ping {{ $labels.instance }}

### 3. Tenter le curl direct
curl http://{{ $labels.instance }}/metrics

### 4. Vérifier les logs système
ssh {{ $labels.instance }}
journalctl -u {{ $labels.job }} -n 100 --no-pager

## Actions de mitigation

### Si le service est arrêté
systemctl restart {{ $labels.job }}

### Si le serveur est inaccessible
- Vérifier le cloud provider (AWS Console / Azure Portal)
- Contacter l'équipe réseau si VPN/firewall

## Escalade
- Si non résolu en 15 min → Appeler le responsable technique
- Si perte de données confirmée → Activer le PCA (Plan de Continuité)

## Résolution
Confirmer que l'alerte est passée à "resolved" dans Alertmanager.
Documenter la cause dans le ticket incident.
```

---

## 14. Bonnes pratiques et Anti-patterns

### 14.1 Nommage des métriques

```
# Convention : <namespace>_<subsystem>_<name>_<unit>

# ✅ Bon
http_requests_total                    # compteur
node_memory_MemAvailable_bytes         # jauge avec unité
http_request_duration_seconds          # histogramme avec unité
database_connections_active            # jauge

# ❌ Mauvais
requests                               # trop vague
httpRequestsCount                      # camelCase interdit
my.custom.metric                       # points interdits
request_duration_ms                    # ms déconseillé (préférer seconds)
```

### 14.2 Cardinalité — Le piège numéro 1

```promql
# Surveiller la cardinalité de votre Prometheus
prometheus_tsdb_head_series             # Nombre de séries actives
prometheus_tsdb_head_chunks             # Nombre de chunks

# Identifier les métriques à haute cardinalité
topk(10,
  count by (__name__) ({__name__=~".+"})
)
```

**Règles de cardinalité :**
- < 1 million de séries : normal
- 1-5 millions de séries : surveiller la RAM (environ 1-2 Ko/série)
- > 10 millions de séries : architecture à revoir

### 14.3 Règles d'alerte — Les pièges courants

```yaml
# ❌ MAUVAIS — alerte qui ne sait pas si le problème est résolu
- alert: DiskAlert
  expr: node_filesystem_avail_bytes < 1073741824
  # Pas de for: → alerte oscillante (flapping)

# ✅ BON
- alert: DiskSpaceLow
  expr: |
    (node_filesystem_avail_bytes{fstype!="tmpfs"}
    / node_filesystem_size_bytes) * 100 < 15
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "Espace disque faible ({{ printf \"%.1f\" $value }}%)"

# ❌ MAUVAIS — alerte sur valeur absolue sans contexte
- alert: HighRequestRate
  expr: http_requests_total > 1000
  # http_requests_total est un counter ! Toujours croissant

# ✅ BON — utiliser rate() pour les counters
- alert: HighRequestRate
  expr: rate(http_requests_total[5m]) > 100
  for: 5m
```

### 14.4 Les 4 Golden Signals (SRE)

Définis par Google SRE, ce sont les 4 métriques à surveiller en priorité :

```promql
# 1. LATENCE — Temps de réponse (distinguer succès et erreurs !)
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))

# 2. TRAFIC — Volume de requêtes
sum(rate(http_requests_total[5m]))

# 3. ERREURS — Taux d'erreur
rate(http_requests_total{status=~"5.."}[5m]) /
rate(http_requests_total[5m])

# 4. SATURATION — Utilisation des ressources
# CPU
1 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m]))
# Mémoire
1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)
# Queue depth, connexions DB...
```

### 14.5 SLO / SLI — Définir des objectifs mesurables

```yaml
# Définir un SLO de disponibilité à 99.9% (8.77h d'indisponibilité/an)

groups:
  - name: slo_api_payment
    rules:
      # SLI : taux de succès des requêtes
      - record: slo:api_payment:success_rate5m
        expr: |
          sum(rate(http_requests_total{
            service="api-payment", status!~"5.."
          }[5m])) /
          sum(rate(http_requests_total{service="api-payment"}[5m]))

      # Alerte si on risque de dépasser le budget d'erreur
      - alert: SLOBudgetBurning
        expr: |
          1 - slo:api_payment:success_rate5m < 0.001
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Budget d'erreur API Paiement en épuisement"
          description: |
            Taux de succès actuel : {{ printf "%.4f" $value | humanizePercentage }}
            SLO cible : 99.9%
```

---

## 15. Exporteurs courants

### 15.1 Node Exporter — Métriques système Linux

```bash
# Installation
wget https://github.com/prometheus/node_exporter/releases/download/v1.8.0/\
node_exporter-1.8.0.linux-amd64.tar.gz
tar xvf node_exporter-1.8.0.linux-amd64.tar.gz
sudo cp node_exporter-1.8.0.linux-amd64/node_exporter /usr/local/bin/

# Service systemd
cat > /etc/systemd/system/node-exporter.service << 'EOF'
[Unit]
Description=Node Exporter
After=network.target

[Service]
User=prometheus
ExecStart=/usr/local/bin/node_exporter \
  --collector.systemd \
  --collector.processes \
  --web.listen-address=:9100
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable --now node-exporter
```

### 15.2 Tableau des exporteurs par technologie

| Technologie | Exporteur | Port | Métriques clés |
|-------------|-----------|------|----------------|
| Linux/macOS | node_exporter | 9100 | CPU, RAM, disque, réseau |
| Windows | windows_exporter | 9182 | CPU, RAM, disque, IIS, AD |
| PostgreSQL | postgres_exporter | 9187 | Connexions, requêtes, réplication |
| MySQL/MariaDB | mysqld_exporter | 9104 | Connexions, requêtes, réplication |
| Redis | redis_exporter | 9121 | Mémoire, hits, commandes |
| MongoDB | mongodb_exporter | 9216 | Opérations, réplication, collections |
| Nginx | nginx-prometheus-exporter | 9113 | Requêtes, connexions actives |
| HAProxy | haproxy_exporter | 9101 | Sessions, erreurs, temps de réponse |
| Kafka | kafka_exporter | 9308 | Topics, partitions, lag consommateurs |
| Elasticsearch | elasticsearch_exporter | 9114 | Indices, nœuds, recherches |
| Blackbox | blackbox_exporter | 9115 | HTTP, HTTPS, TCP, DNS, ICMP |
| SNMP | snmp_exporter | 9116 | Switch, routeur, imprimante |
| JMX/Java | jmx_exporter | 8080 | JVM heap, GC, threads |

### 15.3 Blackbox Exporter — Surveillance externe

```yaml
# blackbox.yml
modules:
  http_2xx:
    prober: http
    timeout: 10s
    http:
      valid_http_versions: ["HTTP/1.1", "HTTP/2.0"]
      valid_status_codes: [200, 201, 204]
      method: GET
      follow_redirects: true
      preferred_ip_protocol: "ip4"
      tls_config:
        insecure_skip_verify: false

  https_check_certificate:
    prober: http
    timeout: 10s
    http:
      fail_if_ssl: false
      fail_if_not_ssl: true
      tls_config:
        insecure_skip_verify: false

  tcp_connect:
    prober: tcp
    timeout: 5s

  icmp_ping:
    prober: icmp
    timeout: 5s
```

```yaml
# Configuration Prometheus pour Blackbox
scrape_configs:
  - job_name: 'blackbox-http'
    metrics_path: /probe
    params:
      module: [http_2xx]
    static_configs:
      - targets:
          - https://api.mon-domaine.com/health
          - https://www.mon-domaine.com
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: blackbox-exporter:9115
```

**Alertes Blackbox :**
```yaml
- alert: WebsiteDown
  expr: probe_success == 0
  for: 2m
  labels:
    severity: critical
  annotations:
    summary: "Site inaccessible : {{ $labels.instance }}"

- alert: SSLCertificateExpiringSoon
  expr: |
    probe_ssl_earliest_cert_expiry - time() < 86400 * 14
  for: 1h
  labels:
    severity: warning
  annotations:
    summary: "Certificat SSL expire dans {{ humanizeDuration (probe_ssl_earliest_cert_expiry - time()) }}"
    description: "Cible : {{ $labels.instance }}"
```

---

## 16. Kubernetes — Intégration avancée

### 16.1 kube-prometheus-stack (Helm)

La manière la plus simple de déployer Prometheus + Grafana + Alertmanager dans Kubernetes :

```bash
# Ajouter le dépôt Helm
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Créer le namespace
kubectl create namespace monitoring

# Installer la stack complète
helm install kube-prometheus-stack \
  prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set prometheus.prometheusSpec.retention=30d \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.storageClassName=fast-ssd \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=100Gi \
  --set grafana.adminPassword="${GRAFANA_PASSWORD}" \
  --set alertmanager.alertmanagerSpec.storage.volumeClaimTemplate.spec.resources.requests.storage=10Gi
```

### 16.2 ServiceMonitor — Découverte automatique

```yaml
# ServiceMonitor pour surveiller automatiquement un service applicatif
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: my-app-monitor
  namespace: monitoring
  labels:
    release: kube-prometheus-stack
spec:
  namespaceSelector:
    matchNames:
      - production
  selector:
    matchLabels:
      app: my-app
  endpoints:
    - port: metrics
      interval: 30s
      path: /metrics
      scheme: http
```

### 16.3 PrometheusRule dans Kubernetes

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: my-app-alerts
  namespace: monitoring
  labels:
    release: kube-prometheus-stack
spec:
  groups:
    - name: my-app
      rules:
        - alert: PodCrashLooping
          expr: |
            rate(kube_pod_container_status_restarts_total[15m]) * 60 * 15 > 0
          for: 5m
          labels:
            severity: warning
          annotations:
            summary: "Pod en CrashLoopBackOff : {{ $labels.pod }}"
```

---

## 17. Annexes — Commandes et références rapides

### 17.1 Commandes promtool

```bash
# Valider la configuration
promtool check config /etc/prometheus/prometheus.yml

# Valider les règles d'alertes
promtool check rules /etc/prometheus/rules/*.yml

# Tester les règles (unit tests)
promtool test rules tests/my_rules_test.yml

# Analyser la TSDB
promtool tsdb analyze /var/lib/prometheus

# Lister les blocs de la TSDB
promtool tsdb list /var/lib/prometheus

# Requête PromQL en ligne de commande
promtool query instant http://localhost:9090 'up'
promtool query range http://localhost:9090 'up' --start=$(date -d '1h ago' +%s) --end=$(date +%s) --step=1m
```

### 17.2 API Prometheus — Exemples curl

```bash
# Requête instantanée
curl 'http://localhost:9090/api/v1/query?query=up'

# Requête sur une plage temporelle
curl 'http://localhost:9090/api/v1/query_range?query=up&start=2024-01-01T00:00:00Z&end=2024-01-01T01:00:00Z&step=60'

# Lister toutes les métriques
curl 'http://localhost:9090/api/v1/label/__name__/values'

# Voir les cibles actives
curl 'http://localhost:9090/api/v1/targets'

# Recharger la configuration
curl -X POST 'http://localhost:9090/-/reload'

# Vérifier l'état de santé
curl 'http://localhost:9090/-/healthy'
curl 'http://localhost:9090/-/ready'
```

### 17.3 API Alertmanager

```bash
# Lister les alertes actives
curl 'http://localhost:9093/api/v2/alerts'

# Lister les silences
curl 'http://localhost:9093/api/v2/silences'

# Créer un silence (maintenance 2h)
curl -X POST 'http://localhost:9093/api/v2/silences' \
  -H 'Content-Type: application/json' \
  -d '{
    "matchers": [{"name": "instance", "value": "serveur-01:9100", "isRegex": false}],
    "startsAt": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "endsAt": "'$(date -u -d '+2 hours' +%Y-%m-%dT%H:%M:%S.000Z)'",
    "comment": "Maintenance planifiée",
    "createdBy": "ops-team"
  }'

# Supprimer un silence
curl -X DELETE 'http://localhost:9093/api/v2/silences/{silence-id}'
```

### 17.4 Ressources documentaires officielles

| Ressource | URL |
|-----------|-----|
| Documentation officielle Prometheus | https://prometheus.io/docs/ |
| GitHub Prometheus | https://github.com/prometheus/prometheus |
| Awesome Prometheus | https://github.com/roaldnefs/awesome-prometheus |
| Documentation Grafana | https://grafana.com/docs/grafana/ |
| Documentation Thanos | https://thanos.io/tip/thanos/ |
| Documentation Alertmanager | https://prometheus.io/docs/alerting/latest/ |
| Grafana Dashboards | https://grafana.com/grafana/dashboards/ |
| PromQL Cheat Sheet | https://promlabs.com/promql-cheat-sheet/ |
| Mixin SLO | https://github.com/metalmatze/slo-libsonnet |

### 17.5 Checklist de mise en production

```
PROMETHEUS
□ Utilisateur dédié créé (pas root)
□ TLS activé sur l'endpoint web
□ Authentification configurée (basic auth ou OAuth2)
□ Rétention définie selon les besoins légaux
□ Règles de validation promtool passées
□ Alertes Dead Man's Switch configurées
□ Sauvegarde automatique des snapshots en place
□ Monitoring de Prometheus lui-même actif

GRAFANA
□ Mot de passe admin changé
□ Base de données PostgreSQL (pas SQLite) en production
□ SSO/LDAP configuré
□ Dashboards sauvegardés en Git (GitOps)
□ Provisioning automatique des datasources
□ Rôles et permissions définis

ALERTMANAGER
□ Groupement des alertes configuré
□ Inhibitions pertinentes définies
□ Canaux de notification testés (email, Slack, PagerDuty)
□ Silences planifiés pour les maintenances
□ Runbooks référencés dans les annotations
□ Haute disponibilité (3 instances minimum en prod)

THANOS (si applicable)
□ Stockage objet configuré et chiffré
□ Cycle de vie S3 défini (rétention des données)
□ Compaction et downsampling activés
□ Thanos Query Frontend avec cache
□ Métriques Thanos dans Grafana
```

---

*Documentation générée en Avril 2026 — Sources : prometheus.io, grafana.com, thanos.io, CNCF*


