---
title: "📊 Observabilité Complète pour les Missions SRE Critiques"
description: "Infrastructures Bancaires · Santé · Assurance · Transport · Énergie"
created: "2026-04-05"
# updated: "2026-04-04"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"

---

<!-- # 📊 Observabilité Complète pour les Missions SRE Critiques
### Infrastructures Bancaires · Santé · Assurance · Transport · Énergie -->

> **Documentation pédagogique** — De zéro à une plateforme d'observabilité production-ready pour les environnements à criticité élevée.

---

## Table des matières

1. [Introduction : pourquoi l'observabilité est vitale dans les secteurs critiques](#1-introduction)
2. [Les trois piliers : Logs, Métriques, Traces](#2-les-trois-piliers)
3. [OpenTelemetry — Le standard universel](#3-opentelemetry)
4. [Grafana Tempo — Le tracing distribué](#4-grafana-tempo)
5. [La stack ELK — Elasticsearch, Logstash, Kibana](#5-la-stack-elk)
6. [Corrélation des signaux — Relier tout ensemble](#6-corrélation-des-signaux)
7. [Gestion des incidents SRE](#7-gestion-des-incidents-sre)
8. [Outils et plateformes du marché](#8-outils-et-plateformes)
9. [Bonnes pratiques sectorielles](#9-bonnes-pratiques-sectorielles)
10. [Architecture de référence par secteur](#10-architectures-de-référence)
11. [Checklist production-ready](#11-checklist-production-ready)

---

## 1. Introduction

### Pourquoi l'observabilité est vitale dans les secteurs critiques

Dans un hôpital, une panne du système de gestion des dossiers patients peut mettre des vies en danger. Dans une banque, une latence de 2 secondes sur le service de paiement coûte des millions d'euros et expose à des sanctions réglementaires. Dans le transport ferroviaire, un incident applicatif peut déclencher des retards en cascade affectant des centaines de milliers de passagers.

**L'observabilité dans ces contextes n'est pas un luxe — c'est une exigence réglementaire et éthique.**

```
Sans observabilité            Avec observabilité
─────────────────────────────────────────────────
"Le site est lent"      →    "Le p99 du service paiement
                              dépasse 800ms depuis 14h23,
                              corrélé au déploiement v2.3.1"

"On a eu une panne"     →    "L'incident a duré 8 minutes,
                              impactant 1.2% des transactions,
                              causé par un pool de connexions saturé"

"Les serveurs chauffent"→    "Le service auth consomme 340%
                              de CPU anormal — spike de tokens JWT"
```

### La différence entre monitoring et observabilité

| Monitoring | Observabilité |
|---|---|
| Détecte les problèmes **anticipés** | Permet de diagnostiquer les problèmes **imprévus** |
| "Le CPU dépasse 90 %" | "Pourquoi cette requête prend 8 secondes ?" |
| Known unknowns | Unknown unknowns |
| Dashboards fixes | Exploration libre |
| Alertes sur seuils | Corrélation multi-signaux |

> **Exemple concret (secteur bancaire)** : Un monitoring classique vous dit "erreur 500 sur /api/virement". L'observabilité vous dit "le service de virement appelle le service de contrôle des limites qui appelle la base Oracle — c'est la requête SQL de vérification du plafond qui prend 4 secondes à cause d'un index manquant sur la table COMPTES_CLIENTS".

---

## 2. Les trois piliers

### 2.1 Les Logs — "Que s'est-il passé exactement ?"

Un log est un **événement discret et horodaté**. C'est le rapport de police de votre système : chaque événement est consigné avec tous les détails disponibles au moment où il se produit.

#### Log non structuré vs structuré

**❌ Log non structuré (à éviter en production)**
```
2026-02-07 14:32:15 ERROR PaymentService - Payment failed for user 12345: insufficient funds (amount=99.99)
```
Problème : impossible à filtrer automatiquement, chaque service a son propre format.

**✅ Log structuré JSON (standard en production)**
```json
{
  "timestamp": "2026-02-07T14:32:15.042Z",
  "level": "ERROR",
  "service": "payment-api",
  "version": "2.3.1",
  "environment": "production",
  "message": "Payment failed: insufficient funds",
  "user_id": "usr_ANON_8f3a2b",
  "amount": 99.99,
  "currency": "EUR",
  "error_type": "InsufficientFundsError",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "span_id": "00f067aa0ba902b7",
  "request_id": "req-a1b2c3",
  "duration_ms": 127
}
```

**Pourquoi le JSON change tout** : filtrer sur `level="ERROR" AND service="payment-api"` prend 10 millisecondes. Faire la même chose avec une regex sur du texte libre prend plusieurs secondes — et casse dès que le format du message change.

#### Les 5 niveaux de sévérité

```
DEBUG   ──► Détails fins (dev uniquement — JAMAIS en production)
INFO    ──► Événements normaux ("Paiement de 99€ traité avec succès")
WARN    ──► Anormal mais non bloquant ("Retry n°2 vers le service externe")
ERROR   ──► Échec d'une opération ("Timeout connexion base de données")
FATAL   ──► Arrêt imminent du processus ("Port 8080 déjà occupé")
```

> **Règle d'or pour les secteurs critiques** : Chaque `ERROR` doit déclencher une investigation. Chaque `FATAL` doit déclencher une alerte immédiate. Si votre équipe reçoit 500 ERROR par heure, personne ne les lit — vous avez un problème de calibration de niveaux.

#### Les 6 champs obligatoires

| Champ | Rôle | Exemple |
|---|---|---|
| `timestamp` | Quand (UTC, ISO 8601) | `"2026-02-07T14:32:15.042Z"` |
| `level` | Gravité | `"ERROR"` |
| `service` | Qui émet | `"payment-api"` |
| `message` | Description stable | `"Payment failed: insufficient funds"` |
| `trace_id` | Corrélation inter-services | `"4bf92f3577b34..."` |
| `request_id` | Corrélation par requête | `"req-a1b2c3"` |

> ⚠️ **Secteurs réglementés** : Ne jamais logger en clair : numéros de carte bancaire, IBAN complets, données médicales, mots de passe, tokens d'authentification. Utilisez la pseudonymisation (`user_id: "usr_ANON_8f3a2b"` au lieu de l'email).

---

### 2.2 Les Métriques — "Quel est l'état du système ?"

Une métrique est une **valeur numérique agrégée dans le temps**. Si le log vous dit "cette requête a pris 342ms", la métrique vous dit "en moyenne sur la dernière minute, 99% des requêtes ont pris moins de 400ms".

#### Les 4 types fondamentaux

**Counter — Compteur qui ne fait que monter**
```
http_requests_total{service="payment", status="200"} 4237891
```
Ne lisez jamais la valeur brute. Calculez le taux :
```
# Requêtes par seconde sur les 5 dernières minutes
rate(http_requests_total[5m]) → "142 req/s en ce moment"
```

**Gauge — Valeur instantanée qui monte et descend**
```
node_memory_MemAvailable_bytes{instance="prod-node-1"} 8589934592
queue_pending_messages{queue="virement-urgent"} 47
```

**Histogram — Distribution des valeurs en buckets**
```
http_request_duration_seconds_bucket{le="0.1"} 2100   # 2100 requêtes < 100ms
http_request_duration_seconds_bucket{le="0.5"} 4350   # 4350 requêtes < 500ms
http_request_duration_seconds_bucket{le="+Inf"} 5000  # toutes les requêtes
```
Permet de calculer les **percentiles** (p50, p95, p99) — indispensables pour les SLO.

**Summary — Percentiles pré-calculés côté client**
À éviter si vous avez plusieurs instances : les percentiles de summaries ne s'agrègent pas entre pods.

#### La cardinalité : le piège qui fait tomber votre monitoring

```
# ✅ BON — cardinalité maîtrisée
http_requests_total{method="GET", status="200", service="payment"}
# method: 5 valeurs × status: 10 valeurs × service: 20 valeurs = 1000 séries

# ❌ DANGEREUX — explosion de cardinalité
http_requests_total{user_id="usr_12345", ...}
# user_id: 500 000 utilisateurs → 5 millions de séries → OOM de Prometheus
```

> **Règle absolue** : Jamais `user_id`, `request_id`, `trace_id`, ni une URL complète comme label de métrique. Ces informations appartiennent aux logs et aux traces.

#### Les frameworks de mesure

**Golden Signals (Google SRE)** — La vision globale d'un service :
- **Latence** : combien de temps prend une requête
- **Trafic** : combien de requêtes arrivent
- **Erreurs** : quel taux de requêtes échoue
- **Saturation** : dans quelle mesure votre système est proche de la limite

**RED** — Pour les APIs et microservices :
- **Rate** : débit en req/s
- **Errors** : taux d'erreur en %
- **Duration** : latence (p50, p99)

**USE** — Pour l'infrastructure :
- **Utilization** : % d'utilisation de la ressource
- **Saturation** : file d'attente, pression
- **Errors** : erreurs sur la ressource

---

### 2.3 Les Traces — "Où est le goulet d'étranglement ?"

Une trace reconstitue le **parcours complet d'une requête** à travers tous vos services. Elle est composée de **spans**, chacun représentant une opération.

#### Anatomie d'une trace

```
trace_id: 4bf92f3577b34da6a3ce929d0e0e4736

Service          Span                  Durée    Statut
─────────────────────────────────────────────────────────────
API Gateway      POST /virement        4200ms   ERROR
├─ Auth Service  validateToken           45ms   OK
├─ Virement Svc  processVirement       3600ms   ERROR
│  ├─ Virement   checkSolde              80ms   OK
│  ├─ Virement   checkLimite             30ms   OK
│  └─ Virement   callBanquePartenaire  3500ms   ERROR  ← CAUSE
└─ Audit Svc     logTransaction          35ms   OK
```

En un coup d'œil : la latence totale est de 4200ms, dont 3500ms passés dans un appel à la banque partenaire. Sans trace, vous passeriez 20 minutes à chercher dans les logs de 4 services différents.

#### Le header W3C Trace Context

Chaque service transmet le contexte de traçage au suivant via le header HTTP `traceparent` :

```
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
              │  │                                │                │
              │  └─ trace-id (32 hex, 128 bits)   │                └─ sampled=1
              │                                   └─ span-id (16 hex, 64 bits)
              └─ version (toujours 00)
```

Ce standard W3C garantit l'**interopérabilité** entre tous les outils (Tempo, Jaeger, Datadog, New Relic).

#### Head-based vs Tail-based Sampling

```
HEAD-BASED SAMPLING (décision à l'entrée)
─────────────────────────────────────────
Avantage : simple, coût réseau faible
Inconvénient : peut rater les erreurs rares (1/1000 requêtes)

Requête arrivée → Tirage au sort → 10% tracé, 90% ignoré
                                    ↓
                            Risque : l'erreur rare n'est
                            pas dans les 10% retenus

TAIL-BASED SAMPLING (décision après collecte)
─────────────────────────────────────────────
Avantage : capture TOUTES les erreurs et anomalies
Inconvénient : coût réseau élevé, buffer mémoire au collecteur

Tous les spans arrivent au Collector → Analyse → Garde 100% des erreurs
                                                  Garde 5% du trafic normal
```

> **Recommandation pour les secteurs critiques** : Utilisez le tail-based sampling avec une règle "garder 100% des traces en erreur". Dans un contexte bancaire ou médical, rater l'analyse d'un incident pour raison d'économie de stockage est inacceptable.

---

## 3. OpenTelemetry

### Le standard universel d'instrumentation

OpenTelemetry (OTel) est le projet CNCF qui résout le **vendor lock-in** : vous instrumentez votre code une fois, et vous pouvez envoyer les données vers n'importe quel backend.

```
AVANT OpenTelemetry          AVEC OpenTelemetry
───────────────────          ──────────────────
App ──► Agent Datadog        App ──► OTel SDK ──► OTel Collector
App ──► Agent New Relic                              │
App ──► Agent Elastic                                ├──► Tempo (traces)
                                                     ├──► Prometheus (métriques)
3 agents, 3 configurations                           └──► Loki (logs)
Migrer = tout réinstrumenter
                             Migrer = changer l'endpoint du Collector
```

### Les 4 composants

```
┌─────────────────────────────────────────────────────────────┐
│                        VOTRE APPLICATION                     │
│                                                              │
│  ┌─────────────┐    ┌─────────────────────────────────────┐ │
│  │   OTel API  │    │           OTel SDK                  │ │
│  │  (contrat   │───►│  (implémentation + configuration :  │ │
│  │   stable)   │    │   sampling, batching, exporters)    │ │
│  └─────────────┘    └──────────────────┬────────────────┘ │ │
└─────────────────────────────────────── │ ─────────────────┘ │
                                         │ OTLP (gRPC:4317 / HTTP:4318)
                              ┌──────────▼──────────┐
                              │   OTel COLLECTOR    │
                              │  ┌───────────────┐  │
                              │  │   Receivers   │  │
                              │  │  (OTLP, etc.) │  │
                              │  ├───────────────┤  │
                              │  │  Processors   │  │
                              │  │ (batch, filter│  │
                              │  │  enrich, mask)│  │
                              │  ├───────────────┤  │
                              │  │   Exporters   │  │
                              │  └───────┬───────┘  │
                              └──────────┼──────────┘
                    ┌──────────┬─────────┴──────────┐
                    ▼          ▼                     ▼
                  Tempo    Prometheus              Loki
                (traces)  (métriques)             (logs)
```

### Configuration du Collector — Exemple commenté

```yaml
# otel-collector.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: "0.0.0.0:4317"   # Les applications envoient ici
      http:
        endpoint: "0.0.0.0:4318"

processors:
  # OBLIGATOIRE : limite la mémoire pour éviter l'OOM
  memory_limiter:
    check_interval: 1s
    limit_mib: 2048
    spike_limit_mib: 512

  # Regroupe les données en lots pour réduire les appels réseau
  batch:
    send_batch_size: 1024
    timeout: 5s

  # CRITIQUE pour les secteurs réglementés : masquage des données sensibles
  transform:
    log_statements:
      - context: log
        statements:
          # Masque les numéros de carte bancaire
          - replace_all_patterns(attributes, "value",
            "\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b", "****-****-****-XXXX")
          # Masque les IBAN
          - replace_all_patterns(attributes, "value",
            "\\b[A-Z]{2}\\d{2}[A-Z0-9]{4}\\d{7}([A-Z0-9]?){0,16}\\b", "IBAN-MASKED")

exporters:
  # Traces → Tempo
  otlp/tempo:
    endpoint: "tempo:4317"
    tls:
      insecure: true   # En prod : certificat TLS obligatoire

  # Métriques → Prometheus
  prometheus:
    endpoint: "0.0.0.0:8889"

  # Logs → Loki
  loki:
    endpoint: "http://loki:3100/loki/api/v1/push"

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, transform, batch]
      exporters: [otlp/tempo]
    metrics:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [prometheus]
    logs:
      receivers: [otlp]
      processors: [memory_limiter, transform, batch]
      exporters: [loki]
```

### Auto-instrumentation par langage

L'auto-instrumentation instrumente automatiquement les bibliothèques courantes (HTTP, SQL, Redis, Kafka) **sans modifier votre code métier**.

**Java (secteur bancaire — très courant)**
```bash
# Ajoutez simplement l'agent au démarrage de la JVM
java -javaagent:opentelemetry-javaagent.jar \
     -Dotel.service.name=payment-service \
     -Dotel.exporter.otlp.endpoint=http://collector:4317 \
     -Dotel.traces.exporter=otlp \
     -Dotel.metrics.exporter=otlp \
     -Dotel.logs.exporter=otlp \
     -jar payment-service.jar
```

**Python**
```bash
pip install opentelemetry-distro opentelemetry-exporter-otlp
opentelemetry-bootstrap -a install  # installe les instrumentations auto

OTEL_SERVICE_NAME=payment-service \
OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4317 \
opentelemetry-instrument python app.py
```

**Node.js**
```javascript
// instrumentation.js — à charger AVANT votre application
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');

const sdk = new NodeSDK({
  serviceName: 'payment-service',
  traceExporter: new OTLPTraceExporter({
    url: 'http://collector:4317',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```
```bash
node --require ./instrumentation.js app.js
```

### Instrumentation manuelle — Contexte métier

L'auto-instrumentation couvre les appels HTTP et SQL. Pour le contexte **métier**, ajoutez de l'instrumentation manuelle :

```python
from opentelemetry import trace
from opentelemetry.trace import Status, StatusCode

tracer = trace.get_tracer("payment-service")

def process_virement(compte_debiteur: str, montant: float, devise: str):
    with tracer.start_as_current_span("process_virement") as span:
        # Attributs métier — utiles pour le diagnostic
        span.set_attribute("virement.compte_debiteur", compte_debiteur[:4] + "****")
        span.set_attribute("virement.montant_tranche", classify_amount(montant))
        span.set_attribute("virement.devise", devise)
        span.set_attribute("virement.type", "SEPA_INSTANTANE")

        try:
            result = execute_virement(compte_debiteur, montant)
            span.set_attribute("virement.reference", result.reference)
            span.set_status(Status(StatusCode.OK))
            return result
        except InsufficientFundsError as e:
            span.set_status(Status(StatusCode.ERROR, str(e)))
            span.record_exception(e)
            raise
```

### Conventions sémantiques

OpenTelemetry définit des noms d'attributs **standardisés** pour garantir la cohérence :

```
# HTTP
http.request.method = "POST"
http.response.status_code = 201
url.full = "https://api.banque.fr/virements"
server.address = "api.banque.fr"

# Base de données
db.system = "oracle"           # ou "postgresql", "mysql"
db.name = "COMPTES_PROD"
db.operation.name = "SELECT"
db.statement = "SELECT solde FROM comptes WHERE id = ?"

# Messaging (Kafka, RabbitMQ)
messaging.system = "kafka"
messaging.destination.name = "virements-urgents"
messaging.operation = "publish"
```

---

## 4. Grafana Tempo

### Le stockage de traces distribué

Tempo est le backend de traces de Grafana, conçu pour **stocker des volumes massifs de spans** à faible coût en utilisant un objet store (S3, GCS, Azure Blob) plutôt qu'une base de données classique.

### Pourquoi Tempo pour les secteurs critiques ?

```
Jaeger/Zipkin classiques     Grafana Tempo
────────────────────────     ─────────────
Index en mémoire (limité)    Index sur objet store (illimité)
Coût élevé à grande échelle  Coût faible (stockage objet)
Recherche par service/tags   Recherche par trace_id (Tempo)
                             + Tags search (Tempo 2.x)
Rétention limitée (RAM)      Rétention longue durée possible
```

> **Cas d'usage réglementaire** : Dans le secteur bancaire (DORA, NIS2), vous êtes obligés de conserver des preuves techniques d'incidents. Tempo + S3 vous permet de garder 1 an de traces à coût raisonnable.

### Architecture Tempo

```
                    ┌──────────────────────────────────────┐
Applications        │            TEMPO CLUSTER             │
──────────►         │  ┌──────────┐    ┌────────────────┐  │
(via OTLP)          │  │Distributor│   │    Ingester     │  │
                    │  │(réception)│──►│  (écrit en WAL) │  │
                    │  └──────────┘   └────────┬───────┘  │
                    │                          │ flush      │
                    │  ┌──────────┐   ┌────────▼───────┐  │
Grafana Explore ◄───│  │Querier   │   │Backend Storage │  │
(TraceQL)           │  │(lecture) │◄──│  (S3 / GCS)   │  │
                    │  └──────────┘   └────────────────┘  │
                    └──────────────────────────────────────┘
```

### Déploiement Tempo avec Helm

```yaml
# tempo-values.yaml
tempo:
  storage:
    trace:
      backend: s3
      s3:
        bucket: mon-bucket-traces-prod
        endpoint: s3.eu-west-1.amazonaws.com
        region: eu-west-1
        # Credentials via IAM Role ou secret K8s

  # Rétention : 30 jours en prod (adapter selon réglementation)
  compactor:
    compaction:
      block_retention: 720h  # 30 jours

  # Réception : tous les formats
  distributor:
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: "0.0.0.0:4317"
          http:
            endpoint: "0.0.0.0:4318"
```

```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm install tempo grafana/tempo-distributed -f tempo-values.yaml -n monitoring
```

### TraceQL — Le langage de requête de Tempo

TraceQL vous permet de rechercher des traces selon des critères précis :

```
# Trouver toutes les traces en erreur sur le service paiement
{ .service.name = "payment-service" && status = error }

# Traces plus lentes que 2 secondes
{ duration > 2s }

# Traces avec un span spécifique en erreur
{ .service.name = "payment-service" && .span.name = "callBanquePartenaire" && status = error }

# Traces avec un attribut métier (type de virement)
{ .virement.type = "SEPA_INSTANTANE" && duration > 500ms }

# Corrélation : toutes les traces impliquant un compte spécifique (anonymisé)
{ .db.statement =~ ".*compte_id_hash_abc123.*" }
```

### Intégration Tempo dans Grafana

```yaml
# grafana-datasource-tempo.yaml
apiVersion: 1
datasources:
  - name: Tempo
    type: tempo
    url: http://tempo:3100
    jsonData:
      tracesToLogsV2:
        datasourceUid: loki        # Lien automatique trace → logs
        spanStartTimeShift: "-1m"
        spanEndTimeShift: "1m"
        filterByTraceID: true
        filterBySpanID: true
      tracesToMetrics:
        datasourceUid: prometheus  # Lien automatique trace → métriques
      serviceMap:
        datasourceUid: prometheus  # Vue carte des services
      nodeGraph:
        enabled: true              # Graphe de dépendances inter-services
```

---

## 5. La stack ELK

### Elasticsearch, Logstash, Kibana

La stack ELK (ou Elastic Stack) est la solution la plus répandue pour la **gestion centralisée des logs** dans les environnements d'entreprise, notamment dans les secteurs réglementés qui ont besoin d'une recherche plein texte puissante.

```
Applications / Systèmes
        │
        ▼
┌───────────────┐    ┌─────────────┐    ┌───────────────┐
│  Filebeat /   │───►│  Logstash   │───►│ Elasticsearch │
│  Elastic Agent│    │  (pipeline) │    │  (stockage +  │
│  (collecte)   │    │  filter +   │    │   index)      │
└───────────────┘    │  transform  │    └───────┬───────┘
                     └─────────────┘            │
                                                ▼
                                          ┌──────────┐
                                          │  Kibana  │
                                          │(visuali- │
                                          │ sation)  │
                                          └──────────┘
```

### Logstash — Pipeline de transformation

Logstash transforme et enrichit les logs avant de les envoyer à Elasticsearch :

```ruby
# logstash-banking.conf

input {
  # Collecte depuis Kafka (découplage haute disponibilité)
  kafka {
    bootstrap_servers => "kafka:9092"
    topics => ["logs-production", "logs-payment", "logs-auth"]
    codec => json
    group_id => "logstash-prod"
  }

  # Collecte depuis Beats (serveurs legacy)
  beats {
    port => 5044
  }
}

filter {
  # Parse les logs JSON
  if [message] =~ /^\{/ {
    json {
      source => "message"
    }
  }

  # Enrichissement GeoIP (utile en banque pour détecter les fraudes)
  if [client_ip] {
    geoip {
      source => "client_ip"
      target => "geoip"
      fields => ["country_code2", "city_name", "timezone"]
    }
  }

  # Masquage des données sensibles (OBLIGATOIRE en finance/santé)
  mutate {
    gsub => [
      "message", "\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b", "****-****-****-XXXX",
      "message", "\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b", "IBAN-MASKED"
    ]
  }

  # Suppression des champs sensibles
  mutate {
    remove_field => ["password", "token", "authorization", "cookie",
                     "cvv", "pin", "numero_secu"]
  }

  # Calcul de la durée si ce sont des logs de requêtes
  if [request_time_ms] {
    ruby {
      code => "event.set('latency_category',
        event.get('request_time_ms').to_i > 2000 ? 'slow' :
        event.get('request_time_ms').to_i > 500  ? 'medium' : 'fast')"
    }
  }

  # Ajout de métadonnées de conformité
  mutate {
    add_field => {
      "[@metadata][compliance_processed]" => "true"
      "[@metadata][processing_timestamp]" => "%{@timestamp}"
    }
  }

  date {
    match => ["timestamp", "ISO8601"]
    target => "@timestamp"
  }
}

output {
  # Logs normaux → index rotatif (ILM : Index Lifecycle Management)
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "logs-prod-%{[service]}-%{+YYYY.MM.dd}"
    ilm_rollover_alias => "logs-prod"
    ilm_pattern => "000001"
    ilm_policy => "logs-prod-7days"   # Rétention 7 jours pour les logs bruts
    user => "${ELASTIC_USER}"
    password => "${ELASTIC_PASSWORD}"
  }

  # Logs d'audit séparés (rétention longue : 7 ans pour la finance)
  if [log_type] == "audit" {
    elasticsearch {
      hosts => ["elasticsearch:9200"]
      index => "audit-logs-%{+YYYY.MM}"
      ilm_policy => "audit-7years"
    }
  }
}
```

### Index Lifecycle Management (ILM)

En secteur critique, vous devez définir des politiques de rétention selon le type de log :

```json
// PUT _ilm/policy/logs-banking-policy
{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_primary_shard_size": "50gb",
            "max_age": "1d"
          },
          "set_priority": { "priority": 100 }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "shrink": { "number_of_shards": 1 },
          "forcemerge": { "max_num_segments": 1 },
          "set_priority": { "priority": 50 }
        }
      },
      "cold": {
        "min_age": "30d",
        "actions": {
          "freeze": {},
          "set_priority": { "priority": 0 }
        }
      },
      "delete": {
        "min_age": "90d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
```

> **Règle réglementaire** : Pour les logs d'audit de transactions financières (MiFID II, DSP2), la rétention minimale est souvent de 5 à 7 ans. Configurez des index séparés avec une politique ILM dédiée.

### Kibana — Requêtes KQL essentielles

```
# Tous les logs ERROR d'un service sur la dernière heure
level: "ERROR" AND service: "payment-api"

# Erreurs avec trace disponible (pour aller dans Tempo)
level: "ERROR" AND _exists_: trace_id

# Recherche d'une transaction spécifique
request_id: "req-a1b2c3" OR trace_id: "4bf92f3577b34da6a3ce929d0e0e4736"

# Latence anormale (Kibana avec champ numérique)
duration_ms > 2000 AND service: "checkout-api"

# Logs d'un incident (plage horaire)
@timestamp:[2026-02-07T14:20:00 TO 2026-02-07T14:45:00] AND level: ERROR
```

### Elastic APM — Intégration avec le tracing

Elastic APM permet la corrélation native entre logs ELK et traces :

```python
# Python avec Elastic APM
from elasticapm import Client
import elasticapm

client = Client({
    'SERVICE_NAME': 'payment-service',
    'SERVER_URL': 'http://apm-server:8200',
    'ENVIRONMENT': 'production',
    'TRANSACTION_SAMPLE_RATE': 0.1,  # 10% en prod normale
})

@elasticapm.capture_span('check_account_balance')
def check_balance(account_id: str) -> float:
    # Elastic APM injecte automatiquement le trace_id dans les logs
    # si vous utilisez un handler de logging compatible
    return db.query("SELECT balance FROM accounts WHERE id = ?", account_id)
```

### ELK vs Loki — Comparaison

| Critère | ELK (Elasticsearch) | Loki (Grafana) |
|---|---|---|
| **Recherche plein texte** | ✅ Très puissante | ⚠️ Sur labels uniquement |
| **Coût stockage** | ⚠️ Élevé | ✅ Faible |
| **Richesse des requêtes** | ✅ KQL très expressif | ✅ LogQL flexible |
| **Scalabilité** | ⚠️ Complexe | ✅ Simple (objet store) |
| **Conformité / audit** | ✅ SIEM intégré (Elastic Security) | ⚠️ Basique |
| **Corrélation APM native** | ✅ Elastic APM | ✅ Via OTel + Tempo |
| **Cas d'usage idéal** | Finance, santé (audit, SIEM) | Cloud-native, microservices |

---

## 6. Corrélation des signaux

### Relier logs, métriques et traces en 5 clics

La corrélation est ce qui transforme votre stack d'observabilité en **outil de diagnostic réel**. Sans elle, vous avez trois silos de données indépendants. Avec elle, vous naviguez du symptôme à la cause racine en moins de 2 minutes.

### Le principe : un identifiant commun

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   MÉTRIQUES  │    │    LOGS     │    │   TRACES    │
│             │    │             │    │             │
│ histogram   │    │ {           │    │ span {      │
│ {           │    │  trace_id:  │    │  trace_id:  │
│   # exemplar│◄──►│  "4bf92f..."│◄──►│  "4bf92f..."│
│   trace_id: │    │  span_id:   │    │  span_id:   │
│   "4bf92f."│    │  "00f067..."│    │  "00f067..."│
│ }           │    │ }           │    │ }           │
└─────────────┘    └─────────────┘    └─────────────┘
      │                  │                  │
      └──────────────────┼──────────────────┘
                         │
                   trace_id commun
               = clé de corrélation
```

### Les exemplars : le pont métrique → trace

Un exemplar est un `trace_id` attaché à un point de données d'un histogram. Dans Grafana, il apparaît comme un **losange cliquable** sur vos graphes de latence.

**Exposition en OpenMetrics**
```
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.5",service="payment"} 4350
http_request_duration_seconds_bucket{le="+Inf",service="payment"} 5000 # {trace_id="4bf92f3577b34da6a3ce929d0e0e4736"} 4.2
#                                                                         ^^^^^^^^ c'est l'exemplar
```

**Prérequis pour les exemplars**
```bash
# 1. Démarrer Prometheus avec le stockage d'exemplars activé
prometheus --enable-feature=exemplar-storage

# 2. Vérifier que votre scrape utilise OpenMetrics
# Dans prometheus.yml :
scrape_configs:
  - job_name: 'payment-service'
    static_configs:
      - targets: ['payment-service:8080']
    # Demander le format OpenMetrics (nécessaire pour les exemplars)
    scrape_protocols:
      - OpenMetricsText1.0.0
      - PrometheusText0.0.4
```

### Configuration des corrélations dans Grafana

```yaml
# grafana-datasources.yaml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    uid: prometheus
    url: http://prometheus:9090

  - name: Loki
    type: loki
    uid: loki
    url: http://loki:3100

  - name: Tempo
    type: tempo
    uid: tempo
    url: http://tempo:3100
    jsonData:
      # Trace → Logs : cliquer sur un span ouvre les logs correspondants
      tracesToLogsV2:
        datasourceUid: loki
        spanStartTimeShift: "-2m"   # Marge temporelle
        spanEndTimeShift: "2m"
        filterByTraceID: true
        filterBySpanID: false
        customQuery: true
        query: '{service="${__span.tags.service.name}"} |= "${__span.traceId}"'

      # Trace → Métriques : voir les métriques autour d'un incident
      tracesToMetrics:
        datasourceUid: prometheus
        spanStartTimeShift: "-5m"
        spanEndTimeShift: "5m"
        queries:
          - name: "Request rate"
            query: 'rate(http_requests_total{service="$__tags{service.name}"}[5m])'
          - name: "Error rate"
            query: 'rate(http_requests_total{service="$__tags{service.name}",status=~"5.."}[5m])'

      # Exemplars : les losanges cliquables sur les graphes
      exemplarTraceIdDestinations:
        - name: trace_id
          datasourceUid: tempo

      # Service Map : carte des dépendances inter-services
      serviceMap:
        datasourceUid: prometheus

  # Lien Loki → Tempo (log → trace)
  - name: Loki
    type: loki
    uid: loki
    url: http://loki:3100
    jsonData:
      derivedFields:
        - datasourceUid: tempo
          matcherRegex: '"trace_id":"(\w+)"'
          name: TraceID
          url: '$${__value.raw}'  # Ouvre automatiquement la trace dans Tempo
          urlDisplayLabel: "Voir la trace"
```

### Le workflow de diagnostic complet

```
1. ALERTE REÇUE
   ─────────────
   "SLO Burn Rate critique — service paiement"
   Slack/PagerDuty à 14h23
         │
         ▼
2. DASHBOARD RED (métriques)
   ──────────────────────────
   Ouvrir le dashboard payment-api
   → P99 à 4,2s depuis 14h21 (normal: 200ms)
   → Taux d'erreur: 12% (normal: 0.1%)
   → Losange (exemplar) visible sur le graphe P99
         │
         ▼ Clic sur le losange
3. TRACE (Tempo via exemplar)
   ───────────────────────────
   trace_id: 4bf92f3577b34da6a3ce929d0e0e4736

   POST /virement (4200ms) ← ROOT SPAN
   ├── validateToken (45ms) ✅
   ├── processVirement (3600ms) ❌
   │   ├── checkSolde (80ms) ✅
   │   └── callBanquePartenaire (3500ms) ❌  ← SUSPECT
   └── logAudit (35ms) ✅
         │
         ▼ Clic sur le span "callBanquePartenaire"
4. LOGS (Loki via corrélation trace_id)
   ─────────────────────────────────────
   14:21:03 ERROR payment-api | Bank API timeout after 3500ms
   14:21:03 WARN  payment-api | Retry 1/3 to BANQUE_PARTENAIRE
   14:21:04 WARN  payment-api | Retry 2/3 to BANQUE_PARTENAIRE
   14:21:05 WARN  payment-api | Retry 3/3 to BANQUE_PARTENAIRE
   14:21:05 ERROR payment-api | Circuit breaker OPEN for BANQUE_PARTENAIRE
         │
         ▼
5. CAUSE RACINE IDENTIFIÉE
   ─────────────────────────
   L'API de la banque partenaire ne répond plus depuis 14:21.
   Le circuit breaker s'est ouvert après 3 tentatives.
   Cause externe — action: contacter le support BANQUE_PARTENAIRE
   Temps de diagnostic: 2 minutes (vs 20-30 minutes sans corrélation)
```

---

## 7. Gestion des incidents SRE

### Les SLI, SLO et Error Budget

**SLI (Service Level Indicator)** — La mesure
```
SLI disponibilité = requêtes réussies / requêtes totales

SLI latence = requêtes traitées en < 300ms / requêtes totales
```

**SLO (Service Level Objective)** — L'objectif
```
SLO disponibilité : 99.9% sur 30 jours glissants
SLO latence      : 95% des requêtes < 300ms sur 30 jours glissants
```

**Error Budget** — La marge de manœuvre
```
SLO = 99.9%
Error Budget mensuel = 100% - 99.9% = 0.1% = 43.2 minutes d'indisponibilité/mois

Si budget restant > 50% → on peut déployer librement
Si budget restant < 20% → on ralentit les déploiements
Si budget épuisé → gel des déploiements, focus stabilité
```

### Le Burn Rate Alerting

Le burn rate mesure la vitesse à laquelle vous consommez votre budget d'erreur.

```yaml
# Règles d'alerte Prometheus avec burn rate multi-fenêtres
groups:
  - name: slo-payment-service
    rules:
      # Pré-calcul du taux d'erreur
      - record: service:http_error_ratio:rate5m
        expr: |
          sum by (service) (rate(http_requests_total{status=~"5.."}[5m]))
          /
          clamp_min(sum by (service) (rate(http_requests_total[5m])), 1)

      - record: service:http_error_ratio:rate1h
        expr: |
          sum by (service) (rate(http_requests_total{status=~"5.."}[1h]))
          /
          clamp_min(sum by (service) (rate(http_requests_total[1h])), 1)

      - record: service:http_error_ratio:rate6h
        expr: |
          sum by (service) (rate(http_requests_total{status=~"5.."}[6h]))
          /
          clamp_min(sum by (service) (rate(http_requests_total[6h])), 1)

      # PAGE CRITIQUE : burn rate 14.4× — budget épuisé en 50h
      # Multi-fenêtres : 1h ET 5m doivent dépasser le seuil
      - alert: SLOBurnCritical
        expr: |
          service:http_error_ratio:rate1h{service="payment-api"} > (14.4 * 0.001)
          and
          service:http_error_ratio:rate5m{service="payment-api"} > (14.4 * 0.001)
        for: 2m
        labels:
          severity: critical
          team: payments
          slo: availability
          page: "true"
        annotations:
          summary: "🔥 Burn rate critique — SLO payment-api en danger"
          description: >
            Le service payment-api consomme son budget d'erreur (SLO 99.9%)
            14× plus vite que la normale. Budget épuisé dans ~50h si non résolu.
            Taux d'erreur actuel: {{ $value | humanizePercentage }}
          runbook_url: "https://wiki.internal/runbooks/payment-error-rate"
          dashboard_url: "https://grafana.internal/d/payment-red"

      # TICKET WARNING : burn rate 6× — budget épuisé en 5 jours
      - alert: SLOBurnWarning
        expr: |
          service:http_error_ratio:rate6h{service="payment-api"} > (6 * 0.001)
          and
          service:http_error_ratio:rate30m{service="payment-api"} > (6 * 0.001)
        for: 15m
        labels:
          severity: warning
          team: payments
        annotations:
          summary: "⚠️ Burn rate élevé — SLO payment-api sous pression"
          runbook_url: "https://wiki.internal/runbooks/payment-error-rate"
```

### Structure d'une alerte production-ready

```yaml
# Template d'alerte — à respecter pour chaque nouvelle règle
- alert: ServiceNomSymptomeSeverite
  expr: |
    # 1. Toujours baser sur un SYMPTÔME (impact utilisateur)
    # ❌ JAMAIS : node_cpu_usage > 90
    # ✅ TOUJOURS : taux d'erreur, latence, disponibilité

    # 2. Protéger les divisions avec clamp_min
    sum(rate(http_requests_total{service="$service", status=~"5.."}[5m]))
    /
    clamp_min(sum(rate(http_requests_total{service="$service"}[5m])), 1)
    > 0.01

  # 3. for: pour filtrer les pics transitoires
  for: 5m   # critical: 5m, warning: 15-30m

  labels:
    severity: critical      # critical | warning | info — 3 niveaux max
    team: payments          # owner identifié = quelqu'un agit
    service: payment-api

  annotations:
    summary: "Description courte et actionnable"
    description: >
      Contexte détaillé avec valeur actuelle: {{ $value | humanizePercentage }}
      Impact: les paiements échouent pour les utilisateurs.
      Depuis: {{ $activeAt }}
    dashboard_url: "https://grafana.internal/d/payment-red?var-service=payment-api"
    runbook_url: "https://wiki.internal/runbooks/payment-error-rate"
    # En secteur critique : ajouter l'impact réglementaire
    regulatory_impact: "DSP2 — notification obligatoire si > 30min"
```

### Configuration Alertmanager

```yaml
# alertmanager.yml
global:
  resolve_timeout: 5m
  slack_api_url: "${SLACK_WEBHOOK_URL}"

# Règle de silence de la chaîne d'alerting
route:
  receiver: 'default'
  group_by: ['alertname', 'service', 'environment']
  group_wait: 30s          # Attente avant 1ère notification
  group_interval: 5m       # Délai entre mises à jour
  repeat_interval: 4h      # Rappel si toujours actif

  routes:
    # CRITICAL → PagerDuty (astreinte 24/7)
    - matchers:
        - severity = critical
      receiver: 'pagerduty-critical'
      repeat_interval: 1h
      routes:
        # Sous-route par équipe
        - matchers: [team = payments]
          receiver: 'pagerduty-payments'
        - matchers: [team = infrastructure]
          receiver: 'pagerduty-infra'

    # WARNING → Slack (heures ouvrées)
    - matchers:
        - severity = warning
      receiver: 'slack-warnings'
      repeat_interval: 6h

    # INFO → Jira ticket automatique
    - matchers:
        - severity = info
      receiver: 'jira-auto'
      repeat_interval: 24h

# Inhibition : éviter le spam lors d'une panne en cascade
inhibit_rules:
  # Si un service est en critical, supprimer ses alertes warning
  - source_matchers: [severity = critical]
    target_matchers: [severity = warning]
    equal: ['service']
  # Si l'infra est en critical, supprimer les alertes applicatives
  - source_matchers: [alertname = NodeDown]
    target_matchers: [severity =~ "critical|warning"]
    equal: ['instance']

receivers:
  - name: 'pagerduty-critical'
    pagerduty_configs:
      - service_key: "${PD_SERVICE_KEY}"
        description: '{{ template "pagerduty.default.description" . }}'
        details:
          runbook: '{{ .CommonAnnotations.runbook_url }}'
          dashboard: '{{ .CommonAnnotations.dashboard_url }}'
          regulatory: '{{ .CommonAnnotations.regulatory_impact }}'

  - name: 'slack-warnings'
    slack_configs:
      - channel: '#alerts-{{ .CommonLabels.team }}'
        title: '{{ .CommonAnnotations.summary }}'
        text: |
          *Impact* : {{ .CommonAnnotations.description }}
          *Dashboard* : {{ .CommonAnnotations.dashboard_url }}
          *Runbook* : {{ .CommonAnnotations.runbook_url }}
        color: '{{ if eq .Status "firing" }}warning{{ else }}good{{ end }}'

  # WATCHDOG — doit toujours être firing (détection de panne de l'alerting)
  - name: 'watchdog-heartbeat'
    webhook_configs:
      - url: 'https://pagerduty.com/v2/integration/WATCHDOG_KEY/heartbeat'
        send_resolved: false
```

### Le Runbook — Template par alerte

Un runbook est la **procédure documentée** que l'on suit quand une alerte se déclenche. Sans runbook, le MTTR dépend de l'expérience de qui est de garde.

```markdown
# Runbook : PaymentErrorRateHigh

## Informations rapides
- **Alerte** : PaymentErrorRateHigh
- **Seuil** : taux d'erreur > 1% sur 5 minutes
- **Sévérité** : critical
- **Owner** : équipe-payments@banque.fr
- **Dashboard** : https://grafana.internal/d/payment-red
- **Impact réglementaire** : DSP2 — notification ACPR si > 30min

## 1. Symptôme
Le service payment-api retourne plus de 1% d'erreurs 5xx.
Les utilisateurs voient des échecs sur les virements et paiements.

## 2. Diagnostic (< 5 minutes)

### Étape 1 — Quel type d'erreur ?
```
# Dans Grafana : ouvrir le dashboard payment-api → panel "Error by type"
# Ou en PromQL :
sum by (error_type) (rate(http_requests_total{service="payment-api",status=~"5.."}[5m]))
```

### Étape 2 — Quelle dépendance est en cause ?
Ouvrir une trace en erreur via l'exemplar (losange sur le graphe P99)
→ Identifier le span lent ou en erreur dans Tempo

### Étape 3 — Logs associés
```
# Dans Kibana ou Grafana Explore :
service:"payment-api" AND level:ERROR | tail 50
```

## 3. Remédiation

### Cas A : Timeout base de données Oracle
```sql
-- Vérifier les requêtes longues
SELECT sql_text, elapsed_time/1000000 as elapsed_seconds, executions
FROM v$sql WHERE elapsed_time > 5000000
ORDER BY elapsed_time DESC;
```
Action : escalader vers l'équipe DBA (DBA-oncall@banque.fr)

### Cas B : Service partenaire bancaire indisponible
Vérifier le statut : https://status.banque-partenaire.fr
Action : activer le mode dégradé (circuit breaker manuel)
```bash
kubectl set env deployment/payment-api CIRCUIT_BREAKER_PARTENAIRE=OPEN
```

### Cas C : Pic de charge
```
# Vérifier le scaling
kubectl get hpa payment-api -n production
kubectl describe hpa payment-api -n production
```
Action : scaling manuel si HPA ne réagit pas assez vite
```bash
kubectl scale deployment/payment-api --replicas=10 -n production
```

## 4. Escalade
- **T+0** : SRE de garde primaire (PagerDuty)
- **T+15min** : SRE de garde secondaire
- **T+30min** : Engineering Manager payments
- **T+30min** : Notification réglementaire DSP2 si paiements affectés (>30min)
- **T+60min** : CTO + Communication client

## 5. Post-incident
- Ouvrir un ticket post-mortem dans Jira : [template](https://jira.internal/POSTMORTEM)
- Réunion blameless dans les 48h
- Identifier les action items préventifs
```

### Le processus d'incident — 4 rôles

```
INCIDENT COMMANDER (IC)
├── Déclare l'incident (Slack : /incident start)
├── Coordonne les équipes
├── Décide des priorités et des actions
└── Valide la résolution

OPS LEAD
├── Exécute les actions techniques
├── Remonte l'état technique à l'IC
└── Documente les actions en temps réel

SCRIBE (Documenteur)
├── Prend des notes horodatées sur tout
├── Partage la timeline en temps réel
└── Prépare le post-mortem

COMMUNICATEUR
├── Gère la communication externe (clients, régulateur)
├── Met à jour la page de statut
└── Rédige les communiqués de crise
```

### Template de post-mortem blameless

```markdown
# Post-Mortem — Incident PROD-2026-042

## Résumé
- **Date** : 2026-02-07
- **Durée** : 23 minutes (14:21 → 14:44)
- **Sévérité** : SEV1
- **Impact** : 12% des virements en échec, ~4200 transactions affectées
- **Impact réglementaire** : Notification DSP2 envoyée à l'ACPR

## Timeline (UTC)
| Heure | Événement |
|-------|-----------|
| 14:21 | Début de la dégradation (circuit breaker BANQUE_PART s'ouvre) |
| 14:23 | Alerte SLO Burn Rate critique reçue par l'astreinte |
| 14:25 | Incident déclaré (IC: Jean D., Ops: Marie C.) |
| 14:29 | Cause identifiée (timeout API BANQUE_PARTENAIRE) |
| 14:35 | Mode dégradé activé (virements planifiés au lieu d'instantanés) |
| 14:44 | BANQUE_PARTENAIRE rétablit son API, circuit breaker fermé |
| 15:00 | Vérification SLO OK, incident clos |

## Cause racine
Déploiement d'une nouvelle version de l'API BANQUE_PARTENAIRE
sans communication préalable. Timeout de 3000ms insuffisant
pour la nouvelle version qui effectue des validations supplémentaires.

## Ce qui a bien fonctionné
- ✅ Alerte en 2 minutes (burn rate multi-fenêtres)
- ✅ Diagnostic en 6 minutes (corrélation logs/traces)
- ✅ Mode dégradé opérationnel (résilience applicative)
- ✅ Communication client dans les 10 minutes

## Ce qui doit être amélioré
- ❌ Pas de communication préalable de BANQUE_PARTENAIRE
- ❌ Timeout trop court (3000ms → augmenter à 8000ms)
- ❌ Pas de test de contrat API (contract testing)

## Action Items

| ID | Action | Priorité | Owner | Deadline |
|----|--------|----------|-------|----------|
| AI-1 | Augmenter le timeout BANQUE_PARTENAIRE à 8000ms | Haute | équipe-payments | J+2 |
| AI-2 | Mettre en place le contract testing (Pact) | Haute | équipe-payments | J+14 |
| AI-3 | Exiger une notification préalable des partenaires bancaires (SLA) | Moyenne | équipe-legal | J+30 |
| AI-4 | Ajouter une alerte sur le circuit breaker BANQUE_PARTENAIRE | Haute | SRE | J+3 |

## Blameless

Aucune personne n'est responsable de cet incident.
Les conditions systémiques qui ont permis cet incident sont identifiées
et font l'objet des action items ci-dessus.
```

---

## 8. Outils et plateformes

### Vue d'ensemble du marché

```
OPEN SOURCE (auto-hébergé)          SAAS / MANAGED
────────────────────────────        ─────────────────
Métriques :
  Prometheus                        Datadog, New Relic
  VictoriaMetrics (scale ++)        Grafana Cloud
  Thanos / Mimir (HA long terme)    Dynatrace

Logs :
  Loki (économique, cloud-native)   Datadog Logs
  ELK / OpenSearch (riche, SIEM)    Splunk, Elastic Cloud
  Graylog                           Sumo Logic

Traces :
  Tempo (économique, objet store)   Datadog APM
  Jaeger (mature, UI riche)         Honeycomb, Lightstep
  Zipkin                            New Relic APM

APM complet :
  SigNoz (open source tout-en-un)   Datadog, Dynatrace
  Grafana LGTM Stack                New Relic

Visualisation :
  Grafana                           Datadog, New Relic (intégré)

Alerting :
  Alertmanager                      PagerDuty, Opsgenie
  Grafana OnCall                    VictorOps, xMatters

Incident Management :
  incident.io                       PagerDuty Incidents
  Rootly                            Opsgenie Incidents
```

### Comparaison des stacks par secteur

| Secteur | Stack recommandée | Justification |
|---|---|---|
| **Banque / Finance** | ELK + Prometheus + Tempo + Grafana | SIEM intégré, audit logs longue durée, corrélation APM |
| **Santé / Hôpital** | Datadog ou Dynatrace (SaaS) | Conformité HDS, RGPD santé, support éditeur |
| **Assurance** | ELK + Grafana LGTM | Balance coût/fonctionnalités, audit réglementaire |
| **Transport (SNCF, RATP)** | Prometheus + Thanos + Grafana + Loki | Scalabilité, temps réel, multi-datacenter |
| **Énergie (RTE, EDF)** | Prometheus + InfluxDB + Grafana | Métriques industrielles OT/IT convergence |

### Grafana LGTM Stack — La référence open source

```
L — Loki     (logs)
G — Grafana  (visualisation)
T — Tempo    (traces)
M — Mimir    (métriques, compatible Prometheus, HA)

+  Alloy     (collecteur unifié, remplaçant de l'OTel Collector + Prometheus Agent)
+  Pyroscope (profiling continu)
+  OnCall    (gestion d'astreinte)
```

### Datadog — Le SaaS enterprise

Avantages pour les secteurs critiques :
- **Agent unifié** : une seule installation pour logs, métriques, traces et profiling
- **Corrélation automatique** : via les tags `service`, `env`, `version` (Unified Service Tagging)
- **Conformité** : certifié SOC 2, ISO 27001, HIPAA, PCI-DSS
- **Support SLA** : engagement contractuel avec SLA réponse

```yaml
# datadog-agent-values.yaml (déploiement Kubernetes)
datadog:
  apiKey: "${DD_API_KEY}"
  site: "datadoghq.eu"  # Datacenter européen (RGPD)

  # Activation de tous les signaux
  logs:
    enabled: true
    containerCollectAll: true

  apm:
    portEnabled: true
    enabled: true
    env: production

  clusterAgent:
    enabled: true

  # Tags obligatoires pour la corrélation automatique
  tags:
    - "env:production"
    - "team:payments"
    - "compliance:dsp2"

  # Conformité : masquage des données sensibles
  scrubbing:
    strings:
      - "password"
      - "authorization"
      - "token"
      - "iban"
      - "card_number"
```

### Dynatrace — L'IA pour les secteurs critiques

Dynatrace se distingue par son approche **causalité automatique** (Davis AI) :

```
Incident Dynatrace :
"Root cause identified: Database connection pool exhausted
 in service payment-api (pod: payment-api-7b4d9-xk2p)
 Impact: 847 affected users, 12 dependent services degraded
 Cause: Missing index on table TRANSACTIONS_2026"

vs

Incident classique :
"Alerte : taux d'erreur > 1% sur payment-api"
[Vous devez faire le diagnostic vous-même]
```

Idéal pour : environnements complexes avec 100+ services, équipes petites par rapport à la surface applicative.

### VictoriaMetrics — Prometheus à grande échelle

Pour les secteurs avec un **volume massif de métriques** (transport, énergie) :

```yaml
# VictoriaMetrics remplace Prometheus avec une meilleure scalabilité
# Compatible avec l'API Prometheus (PromQL fonctionne)

# Déploiement Kubernetes
apiVersion: apps/v1
kind: Deployment
metadata:
  name: victoria-metrics
spec:
  template:
    spec:
      containers:
        - name: victoria-metrics
          image: victoriametrics/victoria-metrics:latest
          args:
            - "-storageDataPath=/var/lib/victoria-metrics"
            - "-retentionPeriod=12"     # 12 mois de rétention
            - "-httpListenAddr=:8428"
            - "-dedup.minScrapeInterval=15s"
          volumeMounts:
            - name: storage
              mountPath: /var/lib/victoria-metrics
```

Avantage : 5-10× moins de RAM que Prometheus pour le même volume, rétention longue native.

---

## 9. Bonnes pratiques sectorielles

### 9.1 Secteur bancaire (DSP2, MiFID II, DORA, BÂLE III)

**Exigences réglementaires**
```
DORA (Digital Operational Resilience Act — 2025) :
- Monitoring de toutes les transactions critiques
- RTO (Recovery Time Objective) : < 2h pour les systèmes critiques
- Rétention des logs d'audit : 5 ans minimum
- Test annuel de résilience (chaos engineering documenté)

DSP2 (Directive Services de Paiement) :
- Notification de l'ACPR sous 4h si incident > 30min affectant les paiements
- Traçabilité complète des transactions (non-répudiation)
- Authentification forte documentée dans les logs

MiFID II :
- Conservation des communications électroniques : 5 ans
- Enregistrement de toutes les transactions d'investissement
```

**Architecture d'observabilité bancaire**
```yaml
# Politique de rétention
logs_transactions_financieres: 7 ans   # Audit réglementaire
logs_authentification:          5 ans   # DSP2, lutte anti-fraude
logs_applicatifs_prod:         90 jours # Diagnostic
logs_applicatifs_debug:         7 jours # Dev uniquement

# SLO pour les systèmes de paiement
slo_virements_instantanes:
  disponibilite: 99.95%   # Max 21min d'indispo/mois
  latence_p99: 1000ms     # Exigence SEPA Instant

slo_consultation_solde:
  disponibilite: 99.9%    # Max 43min d'indispo/mois
  latence_p99: 500ms
```

**Masquage obligatoire dans les logs**
```python
import re

PATTERNS_SENSIBLES = {
    # PAN (numéro de carte)
    r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b': '****-****-****-XXXX',
    # IBAN
    r'\b[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}\b': 'IBAN-MASKED',
    # BIC/SWIFT
    r'\b[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?\b': 'BIC-MASKED',
}

def sanitize_log(message: str) -> str:
    for pattern, replacement in PATTERNS_SENSIBLES.items():
        message = re.sub(pattern, replacement, message)
    return message
```

### 9.2 Secteur santé (HDS, RGPD Santé, HIPAA)

**Hébergement des données de santé (HDS)**
```
En France, toute donnée de santé doit être hébergée chez
un hébergeur certifié HDS (Hébergeur de Données de Santé).

Impact sur l'observabilité :
- Les logs contenant des données patient DOIVENT être sur un hébergeur HDS
- Les plateformes SaaS (Datadog, New Relic) doivent avoir une offre HDS
- Alternative : stack auto-hébergée sur infrastructure HDS (OVHcloud HDS, etc.)
```

**Ce qui ne doit JAMAIS apparaître dans les logs de santé**
```python
CHAMPS_INTERDITS_SANTE = [
    "patient_name",      # Identité directe
    "date_of_birth",     # Identifiant indirect
    "social_security",   # NIR / numéro de sécurité sociale
    "diagnostic",        # Donnée médicale
    "prescription",      # Donnée médicale
    "icd_code",          # Codification diagnostique
    "lab_results",       # Résultats d'analyses
    "medication",        # Traitements
]

# Utiliser des pseudonymes à la place
def log_patient_event(patient_id: str, event_type: str):
    logger.info("patient_event", extra={
        "patient_token": hashlib.sha256(
            f"{patient_id}{SECRET_SALT}".encode()
        ).hexdigest()[:16],  # Pseudonymisation
        "event_type": event_type,
        "trace_id": get_current_trace_id(),
    })
```

**SLO pour les systèmes critiques de santé**
```yaml
# Systèmes vitaux (réanimation, SAMU, bloc opératoire)
slo_systemes_vitaux:
  disponibilite: 99.999%  # 5 minutes d'indispo/an
  rto: 2min               # Recovery Time Objective
  rpo: 0                  # Recovery Point Objective (aucune perte de données)

# Dossier Patient Informatisé (DPI)
slo_dpi:
  disponibilite: 99.95%
  latence_p99: 2000ms     # Tolérance plus haute (usage professionnel)
```

### 9.3 Transport (SNCF, RATP, aérien)

**Contexte spécifique**
- Systèmes temps réel (signalisation, affichage voyageurs)
- Contraintes de sécurité ferroviaire (EN 50128, SIL 2/3/4)
- Millions d'événements par seconde (données de position, capteurs IoT)

```yaml
# Alertes spécifiques transport
- alert: TrainPositionLostContact
  expr: |
    time() - max by (train_id) (last_over_time(train_position_timestamp[5m])) > 60
  for: 30s   # 30 secondes sans position = alerte immédiate
  labels:
    severity: critical
    type: safety   # Alerte de sécurité (différent des alertes SLO)
  annotations:
    summary: "Perte de contact train {{ $labels.train_id }}"
    action: "Contacter le régulateur ligne immédiatement"

# Métriques spécifiques transport
train_delay_seconds{line="RER_A", direction="A", station="Chatelet"}
platform_occupancy_percent{station="Gare_du_Nord", platform="5"}
signaling_system_latency_ms{zone="Paris_Nord", type="ERTMS"}
```

### 9.4 Énergie (RTE, EDF, ENEDIS)

**Convergence OT/IT (Operational Technology / Information Technology)**
```
Systèmes OT (legacy)         Observabilité moderne
────────────────────         ────────────────────
SCADA (Modbus, DNP3)    ──►  OTel Collector avec receivers spécialisés
Capteurs industriels    ──►  InfluxDB ou VictoriaMetrics (time series)
Automates (PLC)         ──►  Telegraf (collecteur multi-protocoles)
Systèmes de conduite    ──►  Grafana (visualisation unifiée OT+IT)
```

```yaml
# Métriques énergie spécifiques
power_grid_frequency_hz{substation="Paris_Nord", phase="A"}
transformer_temperature_celsius{id="T001", location="Vincennes"}
smart_meter_communication_success_rate{region="IDF"}
renewable_production_mw{type="solar", park="Var_01"}

# Alertes spécifiques énergie
- alert: GridFrequencyOutOfBounds
  expr: |
    abs(power_grid_frequency_hz - 50) > 0.2
  for: 5s   # 5 secondes hors plage = situation d'urgence
  labels:
    severity: critical
    type: safety
    regulatory: "RTE-ENTSO-E"
```

---

## 10. Architectures de référence

### Architecture complète — Secteur bancaire

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ZONE APPLICATIVE (Production)                     │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Payment API  │  │   Auth Svc   │  │  Core Banking│             │
│  │ (Spring Boot)│  │  (Node.js)   │  │   (Java EE)  │             │
│  │              │  │              │  │              │             │
│  │ OTel Agent   │  │ OTel SDK     │  │ OTel Agent   │             │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
└─────────┼─────────────────┼─────────────────┼───────────────────────┘
          │                 │                 │ OTLP (gRPC)
          └─────────────────┴─────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ZONE COLLECTE (DMZ Monitoring)                    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              OpenTelemetry Collector (DaemonSet)              │  │
│  │                                                              │  │
│  │  Receivers: OTLP, Prometheus scrape, Syslog                 │  │
│  │  Processors: memory_limiter, batch, PII masking, enrichment │  │
│  │  Exporters: Tempo, Prometheus, Loki, Elastic                │  │
│  └──────────────────────────────┬───────────────────────────────┘  │
└─────────────────────────────────┼───────────────────────────────────┘
                                  │
          ┌───────────────────────┼──────────────────────┐
          ▼                       ▼                       ▼
┌─────────────────┐  ┌──────────────────┐  ┌──────────────────────┐
│ PROMETHEUS/MIMIR│  │   TEMPO + S3     │  │  ELASTICSEARCH       │
│  (métriques)    │  │   (traces)       │  │  (logs audit 7 ans)  │
│  Rétention: 1an │  │  Rétention: 90j  │  │  Rétention: 7 ans   │
└────────┬────────┘  └────────┬─────────┘  └──────────┬───────────┘
         │                    │                         │
         └────────────────────┴─────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │    GRAFANA      │
                    │  Dashboards :   │
                    │  - RED/USE      │
                    │  - SLO/Budget   │
                    │  - Audit        │
                    │  - Compliance   │
                    └────────┬────────┘
                             │
              ┌──────────────┼───────────────┐
              ▼              ▼               ▼
     ┌──────────────┐ ┌──────────┐  ┌──────────────┐
     │ ALERTMANAGER │ │ PAGERDUTY│  │ JIRA/TICKETS │
     │  (routing)   │ │(astreinte│  │  (incidents) │
     └──────────────┘ └──────────┘  └──────────────┘
```

### Architecture HA — Pour les systèmes 99.999%

```yaml
# Prometheus en mode HA avec Thanos
# Deux instances Prometheus scrapen les mêmes cibles
# Thanos déduplique et fournit une vue unifiée

prometheus-ha:
  replicas: 2
  thanos-sidecar: true   # Envoie vers S3

thanos-query:
  stores:
    - prometheus-0:10901
    - prometheus-1:10901
    - thanos-store:10905    # Données S3 long terme

thanos-store:
  objectStore:
    type: S3
    config:
      bucket: metrics-longterm-prod
      endpoint: s3.eu-west-1.amazonaws.com
      region: eu-west-1
```

---

## 11. Checklist production-ready

### ✅ Instrumentation

- [ ] Chaque service émet des logs **structurés en JSON**
- [ ] Les 6 champs obligatoires sont présents (`timestamp`, `level`, `service`, `message`, `trace_id`, `request_id`)
- [ ] Le `trace_id` est injecté automatiquement via OTel dans tous les logs
- [ ] Aucun secret, PII, ou donnée réglementée en clair dans les logs
- [ ] Les métriques RED sont exposées (rate, errors, duration)
- [ ] Pas de label à haute cardinalité (`user_id`, `request_id` en label)
- [ ] Les histograms utilisent des buckets adaptés au SLO
- [ ] L'auto-instrumentation OTel est activée pour les frameworks courants
- [ ] L'instrumentation manuelle couvre les opérations métier critiques
- [ ] Le `traceparent` W3C est propagé entre tous les services (y compris async/Kafka)

### ✅ Collecte

- [ ] Un OTel Collector est déployé (DaemonSet ou sidecar)
- [ ] `memory_limiter` est configuré (premier processor du pipeline)
- [ ] Le masquage des données sensibles est actif (processor `transform`)
- [ ] Les exporters sont configurés vers chaque backend (Prometheus, Tempo, Loki/ELK)

### ✅ Stockage

- [ ] Rétention définie par type de log (audit ≥ 5 ans, prod 90j, debug 7j)
- [ ] Politiques ILM/TTL configurées (données ne s'accumulent pas indéfiniment)
- [ ] Backup des données d'audit (exigence réglementaire)
- [ ] `--enable-feature=exemplar-storage` activé sur Prometheus

### ✅ Dashboards

- [ ] Dashboard overview (statut de tous les services critiques)
- [ ] Dashboard RED par service (rate, errors, duration)
- [ ] Dashboard USE infra (CPU, mémoire, disque, réseau)
- [ ] Dashboard SLO avec budget d'erreur restant
- [ ] Annotations de déploiement configurées (CI/CD → Grafana API)
- [ ] Data links configurés (métrique → trace, log → trace, trace → log)
- [ ] Variables Grafana pour filtrage dynamique ($service, $namespace)
- [ ] Pas de dashboard > 10 panneaux sur la page d'accueil
- [ ] Recording rules créées pour les requêtes coûteuses

### ✅ Alerting

- [ ] Alertes basées sur des **symptômes** (taux d'erreur, latence), pas des causes (CPU)
- [ ] `for: 5m` sur les alertes critical, `for: 15m` sur les warnings
- [ ] MWMBR configuré pour les services avec SLO (burn rate 14.4× et 6×)
- [ ] Chaque alerte a un `runbook_url` et un `dashboard_url`
- [ ] Chaque alerte a un `team` owner identifié
- [ ] Alertmanager configuré (grouping, inhibition, silencing)
- [ ] **Watchdog** déployé avec heartbeat côté outil d'astreinte
- [ ] Alertes `absent()` sur les exporters critiques
- [ ] Escalade temporelle configurée (PagerDuty/Opsgenie) : T+15, T+30, T+60
- [ ] Toutes les divisions PromQL protégées avec `clamp_min(denominator, 1)`

### ✅ Processus

- [ ] Runbooks rédigés pour chaque alerte critical
- [ ] Processus d'incident documenté (IC, Ops Lead, Scribe, Communicateur)
- [ ] Template de post-mortem blameless en place
- [ ] Exercices d'incident (game days) planifiés trimestriellement
- [ ] Revue des alertes trimestrielle (supprimer les alertes jamais déclenchées)
- [ ] Procédure de notification réglementaire documentée

### ✅ Sécurité et conformité (secteurs critiques)

- [ ] RBAC configuré sur Grafana (lecture seule pour les développeurs, écriture pour les SRE)
- [ ] RBAC configuré sur Elasticsearch/Kibana (accès aux logs d'audit restreint)
- [ ] Chiffrement TLS sur tous les flux de collecte (OTel → Collector → backends)
- [ ] Audit trail de l'accès aux données d'observabilité
- [ ] Hébergement conforme au secteur (HDS pour la santé, données UE pour la finance)
- [ ] Plan de continuité d'observabilité (que se passe-t-il si le Collector tombe ?)

---

## Ressources

### Lectures essentielles
- **Google SRE Book** : sre.google/sre-book — la référence fondatrice du SRE
- **Google SRE Workbook** : sre.google/workbook — pratiques concrètes (SLO, burn rate)
- **Rob Ewaschuk — My Philosophy on Alerting** : docs.google.com/document/d/199PqyG3UsyXlwieHaqbGiWVa8eMWi8zzAn0YfcApr8Q
- **Brendan Gregg — USE Method** : brendangregg.com/usemethod.html

### Documentation officielle
- **OpenTelemetry** : opentelemetry.io/docs
- **Grafana Tempo** : grafana.com/docs/tempo
- **Prometheus** : prometheus.io/docs
- **Alertmanager** : prometheus.io/docs/alerting/latest/alertmanager
- **Loki** : grafana.com/docs/loki
- **Elasticsearch** : elastic.co/guide/en/elasticsearch

### Standards réglementaires
- **DORA** : digital-operational-resilience-act.eu
- **W3C Trace Context** : w3.org/TR/trace-context
- **OpenMetrics** : openmetrics.io

---

*Document rédigé pour les équipes SRE opérant sur des infrastructures critiques.*

