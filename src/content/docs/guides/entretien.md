---
title: "Guide: DevSecOps - CALMS"
description: "Maîtriser les concepts, anticiper et structurer"
created: "2026-03-04"
# updated: "2026-02-08"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"

---



> **Objectif :** Maîtriser les concepts, anticiper et structurer

---

## 🗺️ Sommaire

| # | Thème | Pilier CALMS |
|---|-------|-------------|
| 0 | [Framework CALMS — Explication pédagogique](#0--framework-calms--explication-pédagogique) | Référence |
| 1 | [Cloud vs On-Premises](#1--cloud-vs-on-premises) | **C · A · L** |
| 2 | [Cloud Native — Microservices, Docker, Kubernetes](#2--cloud-native--microservices-docker-kubernetes) | **A · L · M** |
| 3 | [Observabilité, Supervision & SIEM](#3--observabilité-supervision--siem) | **M · S · A** |
| 4 | [CI/CD & DevSecOps — Scans, SAST, DAST, Trivy, Checkov](#4--cicd--devsecops--scans-sast-dast-trivy-checkov) | **A · M · S** |
| 5 | [Terraform & Ansible — IaC en profondeur](#5--terraform--ansible--iac-en-profondeur) | **A · S** |
| 6 | [Sauvegardes & Restauration — Guide complet](#6--sauvegardes--restauration--guide-complet) | **A · M · C** |
| 7 | [Gestion d'Incident de A à Z — Mise en situation](#7--gestion-dincident-de-a-à-z--mise-en-situation) | **M · C · S** |
| 8 | [Glossaire de référence](#8--glossaire-de-référence) | Référence |

---

## 0 · 📐 Framework CALMS — Explication pédagogique

> **C'est quoi CALMS ?** C'est le cadre de référence pour évaluer et faire progresser la maturité DevOps d'une organisation. Chaque lettre est un pilier indépendant mais connecté aux autres.

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRAMEWORK CALMS                             │
├──────┬──────────────────────────────────────────────────────────┤
│  C   │  CULTURE       → Casser les silos, collaboration         │
│  A   │  AUTOMATION    → Pipelines, IaC, déploiements auto       │
│  L   │  LEAN          → Réduire les gaspillages, fluidifier     │
│  M   │  MEASUREMENT   │ Métriques DORA, SLO, dashboards         │
│  S   │  SHARING       → Docs, runbooks, guildes, standards      │
└──────┴──────────────────────────────────────────────────────────┘
```

### 🔍 Chaque pilier expliqué simplement

**C — Culture**
> La culture, c'est la façon dont les équipes travaillent ensemble. Sans culture DevOps, l'automatisation ne sert à rien : les Dev balancent du code par-dessus le mur, les Ops subissent.
- **Silo** = Dev, Ops et Sécu ne parlent pas → erreurs en prod, blâme mutuel
- **Culture DevOps** = équipe produit mixte, responsabilité partagée, post-mortems blameless

**A — Automation**
> Automatiser, c'est transformer chaque action manuelle répétable en pipeline, script ou playbook. Une action manuelle est une source d'erreur et un goulot d'étranglement.
- Build, test, déploiement → CI/CD
- Configuration serveurs → Ansible
- Provisionnement infra → Terraform
- Sécurité → scans automatisés dans les pipelines

**L — Lean**
> Le Lean DevOps, c'est traquer et supprimer les gaspillages dans le flux de livraison : les attentes, les validations manuelles inutiles, les environnements indisponibles.
- **Lead time** = délai commit → production. Plus il est court, plus l'équipe est efficace.
- **Bottleneck** = goulot d'étranglement (ex : validation manuelle de sécurité qui prend 2 semaines)

**M — Measurement**
> Ce qu'on ne mesure pas, on ne peut pas l'améliorer. Les métriques DORA sont les 4 indicateurs de référence de la performance DevOps.

| Métrique DORA | Définition simple | Elite |
|---|---|---|
| **Deployment Frequency** | Combien de fois on déploie en prod | Plusieurs fois/jour |
| **Lead Time for Changes** | Délai entre le commit et la prod | < 1 heure |
| **Change Failure Rate** | % de déploiements qui cassent quelque chose | < 5% |
| **MTTR** | Temps pour réparer après un incident | < 1 heure |

**S — Sharing**
> Le partage, c'est la mémoire collective de l'équipe. Runbooks, documentation, standards, guildes. Sans partage, tout le savoir est dans la tête de 2 personnes… qui peuvent partir demain.

### 🔗 CALMS + DevSecOps

Le **DevSecOps** intègre la sécurité à chaque pilier, plutôt que de l'ajouter en bout de chaîne :

```
C  → Culture sécurité : "shift-left", la sécurité est l'affaire de tous
A  → Scans automatisés dans les pipelines (SAST, DAST, Trivy, Checkov)
L  → Réduire les frictions sécurité (pas de blocage inutile, exceptions tracées)
M  → Métriques de vulnérabilités, MTTR sécurité, taux de couverture
S  → Partage des guidelines sécurité, formation, guildes
```

---

## 1 · ☁️ Cloud vs On-Premises

*Piliers CALMS : **C · A · L***

### 📚 Explication pédagogique

**On-Premises (On-Prem)**
> Vous possédez et gérez vos propres serveurs physiques dans votre datacenter. Vous êtes responsable de tout : matériel, réseau, virtualisation, OS, applications, sécurité.

**Cloud Public** (AWS, Azure, GCP)
> Vous louez des ressources à un fournisseur. Vous ne gérez pas le matériel. Facturation à l'usage. Scalabilité quasi-infinie.

**Cloud Hybride**
> Combinaison des deux. Les applications sensibles restent on-prem, les charges variables vont dans le cloud. C'est la réalité de la plupart des grandes entreprises françaises.

**Cloud Privé**
> Infrastructures cloud dédiées, gérées par l'entreprise (ex : OpenStack, VMware vSphere) ou hébergées chez un prestataire mais isolées.

```
┌───────────────────────────────────────────────────────────────────┐
│                  MODÈLES DE RESPONSABILITÉ                        │
├─────────────────┬────────────────┬─────────────────┬─────────────┤
│                 │   On-Premises  │  IaaS (Cloud)   │  PaaS/SaaS  │
├─────────────────┼────────────────┼─────────────────┼─────────────┤
│ Applications    │     Vous       │     Vous        │  Fournisseur│
│ Runtime / OS    │     Vous       │     Vous        │  Fournisseur│
│ Virtualisation  │     Vous       │  Fournisseur    │  Fournisseur│
│ Matériel réseau │     Vous       │  Fournisseur    │  Fournisseur│
│ Datacenter      │     Vous       │  Fournisseur    │  Fournisseur│
└─────────────────┴────────────────┴─────────────────┴─────────────┘
```

---

### ❓ Questions & Réponses attendues

---

**Q1 : Quelles sont les différences fondamentales entre cloud public, privé et hybride ?**

> ✅ **Réponse attendue :**
> Le cloud public (AWS, Azure, GCP) offre des ressources mutualisées à la demande, sans investissement matériel, avec facturation à l'usage et scalabilité quasi-infinie. Le cloud privé conserve la maîtrise totale des données et de l'infrastructure — essentiel pour les SI sensibles, les données soumises à réglementation (RGPD, LPM) ou les workloads nécessitant des performances déterministes. Le modèle hybride combine les deux : les charges sensibles ou stables restent on-prem, les charges variables ou les projets innovants vont dans le cloud public. La clé est de définir une politique claire de placement des workloads selon leur criticité, leur sensibilité et leur profil de charge.

---

**Q2 : Dans un contexte SI sensible, quels critères conditionnent le choix cloud vs on-prem ?**

> ✅ **Réponse attendue :**
> Plusieurs critères entrent en jeu : la souveraineté des données (les données sensibles de défense ou de transport critique ne peuvent pas quitter le territoire national sans encadrement réglementaire strict), les exigences de conformité (RGPD, LPM pour les OIV, HDS pour la santé), la latence requise par les applications temps-réel, les niveaux de disponibilité garantis et la capacité à auditer l'infrastructure. Pour un OIV comme la RATP, certains systèmes critiques (supervision du réseau, données de billettique) restent on-prem pour des raisons de souveraineté et de latence, tandis que des services moins sensibles (outillage DevOps, environnements de développement) peuvent être hébergés dans un cloud qualifié (SecNumCloud ANSSI ou équivalent).

---

**Q3 : Comment gérez-vous la sécurité du réseau dans un environnement hybride ?**

> ✅ **Réponse attendue :**
> La sécurité réseau hybride repose sur plusieurs couches complémentaires : la segmentation réseau avec des VLANs isolant les zones par criticité (DMZ, production, développement, management), des connexions sécurisées entre on-prem et cloud via VPN IPsec ou ExpressRoute/Direct Connect (liaison dédiée chiffrée), un bastion (jump host) comme unique point d'entrée sécurisé vers les ressources critiques avec journalisation de toutes les sessions, et une politique IAM stricte appliquant le principe du moindre privilège. Dans un SI sensible, j'ajoute systématiquement une règle de segmentation : si un système legacy non patchable ne peut pas être isolé, il est placé dans un VLAN de quarantaine avec règles de firewall très restrictives.

---

**Q4 : Qu'est-ce que le modèle de responsabilité partagée dans le cloud ?**

> ✅ **Réponse attendue :**
> Dans le cloud, la sécurité est partagée entre le fournisseur et le client. Le fournisseur sécurise l'infrastructure physique, la virtualisation et les services gérés — c'est la "sécurité du cloud". Le client est responsable de ce qu'il déploie dessus : la configuration des services, la gestion des accès et des identités, le chiffrement des données, la sécurité du réseau virtuel et des applications — c'est la "sécurité dans le cloud". La confusion de responsabilité est l'une des causes les plus fréquentes de failles en environnement cloud. En pratique, je m'assure toujours que la matrice de responsabilité est documentée et connue de l'équipe pour chaque service utilisé.

---

## 2 · 🐳 Cloud Native — Microservices, Docker, Kubernetes

*Piliers CALMS : **A · L · M***

### 📚 Explication pédagogique

**Architecture Monolithique vs Microservices**

```
MONOLITHE                          MICROSERVICES
┌────────────────────┐             ┌──────┐ ┌──────┐ ┌──────┐
│  Authentification  │             │ Auth │ │Paiem.│ │Notif.│
│  Paiement          │    →→→      └──┬───┘ └──┬───┘ └──┬───┘
│  Notifications     │                │        │        │
│  Catalogue         │             ┌──┴────────┴────────┴──┐
└────────────────────┘             │    API Gateway / Mesh  │
  1 déploiement = tout             └───────────────────────┘
  1 bug = tout tombe                 Déploiement indépendant
```

**Docker — La conteneurisation**
> Un conteneur Docker, c'est une unité logicielle autonome qui contient le code, le runtime, les librairies et la configuration nécessaires. Il s'exécute de façon identique partout. Un conteneur ≠ une VM : il partage le kernel de l'OS hôte, il est donc plus léger et démarre en millisecondes.

**Kubernetes (K8s) — L'orchestration**
> Kubernetes gère le déploiement, la mise à l'échelle et la disponibilité des conteneurs à grande échelle. Il garantit que le bon nombre de conteneurs tourne en permanence, les redémarre si un pod tombe, et répartit le trafic.

```
┌─────────────────────────────────────────────────────────────────┐
│                  CLUSTER KUBERNETES                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Control Plane (anciennement Master)                    │   │
│  │  ├── API Server   : point d'entrée de toutes les        │   │
│  │  │                  commandes kubectl                   │   │
│  │  ├── etcd          : base de données de l'état du       │   │
│  │  │                  cluster                             │   │
│  │  ├── Scheduler     : décide sur quel nœud déployer      │   │
│  │  └── Controller    : maintient l'état désiré            │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Worker Node │  │  Worker Node │  │  Worker Node │          │
│  │  ┌─────────┐ │  │  ┌─────────┐ │  │  ┌─────────┐ │          │
│  │  │  Pod(s) │ │  │  │  Pod(s) │ │  │  │  Pod(s) │ │          │
│  │  └─────────┘ │  │  └─────────┘ │  │  └─────────┘ │          │
│  │  kubelet     │  │  kubelet     │  │  kubelet     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

**Concepts Kubernetes essentiels :**

| Concept | Définition simple |
|---|---|
| **Pod** | Plus petite unité K8s — 1 ou plusieurs conteneurs partageant réseau et stockage |
| **Deployment** | Décrit l'état désiré (ex : 3 réplicas de mon-app) |
| **Service** | Point d'accès réseau stable vers un ensemble de pods |
| **Ingress** | Routage HTTP/HTTPS entrant vers les services |
| **ConfigMap** | Configuration non sensible externalisée |
| **Secret** | Configuration sensible (chiffrée, base64) |
| **PersistentVolume** | Stockage persistant indépendant du cycle de vie des pods |
| **Namespace** | Isolation logique de ressources dans le cluster |
| **RBAC** | Role-Based Access Control — qui a le droit de faire quoi |
| **NetworkPolicy** | Règles de firewall réseau entre pods |
| **HPA** | Horizontal Pod Autoscaler — scale automatiquement selon métriques |

---

### ❓ Questions & Réponses attendues

---

**Q1 : Quels sont les avantages et inconvénients des microservices par rapport au monolithe ?**

> ✅ **Réponse attendue :**
> Les microservices permettent un déploiement indépendant de chaque service (une équipe peut déployer sans bloquer les autres), une scalabilité granulaire (on scale uniquement le service sous pression, pas tout l'applicatif), une meilleure isolation des pannes (un service qui tombe n'impacte pas forcément les autres) et la liberté technologique (chaque service peut utiliser le langage le plus adapté). En contrepartie, la complexité opérationnelle explose : on passe d'un seul binaire à gérer à des dizaines de services avec leurs propres cycles de vie, leurs propres dépendances réseau et leurs propres politiques de sécurité. Les défis sont la gestion de la communication inter-services (latence, pannes partielles), la traçabilité des requêtes à travers les services (traces distribuées obligatoires), et la cohérence des données distribuées. Pour un SI critique, je recommande une approche pragmatique : le découpage en microservices là où le besoin de scalabilité ou d'indépendance de déploiement est réel, pas systématiquement.

---

**Q2 : Comment sécurisez-vous un cluster Kubernetes en production ?**

> ✅ **Réponse attendue :**
> La sécurité K8s se traite en plusieurs couches :
> - **Contrôle des accès** : RBAC strict avec le principe du moindre privilège — chaque compte de service n'a accès qu'aux ressources dont il a besoin. Aucun `cluster-admin` accordé sans justification.
> - **Sécurité réseau** : NetworkPolicies pour isoler les namespaces et contrôler les flux inter-pods. Par défaut, tout-à-tout bloqué, on ouvre explicitement.
> - **Sécurité des images** : scan des images avec Trivy ou Clair avant déploiement, politique d'admission pour rejeter les images avec des CVE critiques non patchées (OPA Gatekeeper ou Kyverno).
> - **Secrets** : ne pas utiliser les Secrets Kubernetes natifs en base64 non chiffrés. Intégrer HashiCorp Vault ou Sealed Secrets pour un chiffrement réel.
> - **Pod Security** : Pod Security Admission (ou PodSecurityPolicy legacy) pour interdire les pods en mode privilégié, les montages hostPath dangereux, les conteneurs root.
> - **Audit logs** : activer l'audit logging de l'API Server pour tracer toutes les actions.
> - **CIS Benchmark** : valider la configuration du cluster contre le CIS Kubernetes Benchmark avec `kube-bench`.

---

**Q3 : Expliquez la différence entre un Deployment, un StatefulSet et un DaemonSet.**

> ✅ **Réponse attendue :**
> Un **Deployment** gère des pods sans état (stateless) — les pods sont interchangeables, on peut les scaler et les remplacer librement. C'est adapté aux API, aux applications web, aux workers.
> Un **StatefulSet** gère des pods avec état (stateful) — chaque pod a une identité stable (nom, stockage persistant, ordre de démarrage). C'est indispensable pour les bases de données, les systèmes de files de messages comme Kafka, les clusters nécessitant une coordination (ex : Elasticsearch).
> Un **DaemonSet** garantit qu'une instance du pod tourne sur chaque nœud du cluster (ou sur un sous-ensemble défini par labels). C'est l'outil idéal pour les agents de monitoring (Node Exporter, Fluentd, agents de sécurité EDR) qui doivent être présents partout.

---

**Q4 : Comment gérez-vous la mise à jour d'un service Kubernetes sans interruption ?**

> ✅ **Réponse attendue :**
> Kubernetes gère nativement le rolling update via la stratégie `RollingUpdate` d'un Deployment : les pods sont remplacés progressivement, les anciens pods ne sont terminés que quand les nouveaux sont `Ready`. Les paramètres `maxSurge` (pods supplémentaires autorisés pendant la mise à jour) et `maxUnavailable` (pods indisponibles autorisés) permettent de calibrer la vitesse de déploiement vs la disponibilité. Pour les services critiques, je configure des `readinessProbes` et `livenessProbes` précises pour que K8s ne route du trafic vers un pod que quand il est vraiment prêt. Pour les changements à risque, j'utilise une stratégie canary via Argo Rollouts ou via un Ingress contrôleur (Nginx/Traefik) qui route un pourcentage du trafic vers la nouvelle version, permet de valider les métriques, puis bascule progressivement ou rollback en cas de dégradation.

---

## 3 · 📡 Observabilité, Supervision & SIEM

*Piliers CALMS : **M · S · A***

### 📚 Explication pédagogique

**Supervision ≠ Observabilité**

```
SUPERVISION (ce qu'on SAVAIT mesurer à l'avance)
  → "Le CPU est à 90%" / "Le service est UP ou DOWN"
  → Alertes binaires prédéfinies
  → Orienté ressources

OBSERVABILITÉ (comprendre un système qu'on ne connaît pas à l'avance)
  → "Pourquoi cette requête est-elle lente pour cet utilisateur spécifique ?"
  → Corrélation Logs + Métriques + Traces
  → Orienté comportement et service
```

**Les 3 piliers de l'observabilité :**

```
┌─────────────────────────────────────────────────────────────────┐
│  LOGS       → "Qu'est-ce qui s'est passé ?"                     │
│               Enregistrement horodaté des événements            │
│               Outils : ELK (Elasticsearch+Logstash+Kibana),     │
│                        Loki + Grafana, Splunk                   │
├─────────────────────────────────────────────────────────────────┤
│  MÉTRIQUES  → "À quel rythme, combien, pendant combien ?"       │
│               Mesures numériques dans le temps                  │
│               Outils : Prometheus + Grafana, Datadog, Dynatrace │
├─────────────────────────────────────────────────────────────────┤
│  TRACES     → "Par où est passée cette requête ?"               │
│               Suivi d'une requête à travers les microservices   │
│               Outils : Jaeger, Zipkin, OpenTelemetry, Dynatrace │
└─────────────────────────────────────────────────────────────────┘
```

**Le SIEM — Ce qu'il fait vraiment**
> Un SIEM collecte les logs de toutes les sources (applications, réseau, OS, CI/CD), les normalise, les corrèle et déclenche des alertes de sécurité. C'est la tour de contrôle de la sécurité opérationnelle.

```
Sources d'événements                    SIEM                     SOC
├── Logs applicatifs              ┌──────────────┐
├── Logs CI/CD (Jenkins/GitLab)  │  Collecte    │
├── Logs authentification    →   │  Normalise   │  →  Corrèle  →  🚨 Alerte
├── Logs firewall / réseau       │  Indexe      │  →  Détecte  →  Investigation
├── Logs OS / serveurs           │  Stocke      │  →  Reporte  →  Réponse
└── Logs Kubernetes              └──────────────┘
```

**SLI / SLO / SLA — La hiérarchie**

```
SLI (ce qu'on MESURE)    →  latence p99 = 230ms en temps réel
SLO (ce qu'on VISE)      →  latence p99 < 400ms sur 99,9% du temps
SLA (ce qu'on PROMET)    →  disponibilité ≥ 99,5% par mois (contrat)
Règle : SLO plus strict que SLA = marge de manœuvre (error budget)
```

---

### ❓ Questions & Réponses attendues

---

**Q1 : Quelle est la différence entre supervision et observabilité ? Donnez un exemple concret.**

> ✅ **Réponse attendue :**
> La supervision répond à "est-ce que ça marche ?" avec des seuils connus à l'avance (CPU > 80%, service répond ou non). L'observabilité répond à "pourquoi ça ne marche pas bien ?" en corrélant logs, métriques et traces pour comprendre un comportement interne sans forcément avoir anticipé le problème.
> Exemple concret : une API e-commerce répond lentement pour 3% des utilisateurs. La supervision dit "le service est UP" — aucune alerte. L'observabilité me permet de tracer ces requêtes spécifiques via un APM (Dynatrace, Datadog), de voir qu'elles font toutes un appel à un microservice `payment-service`, que ce service fait une requête vers une base de données qui prend 2 secondes sur certaines requêtes SQL non indexées. Sans traces distribuées, ce diagnostic prendrait des heures.

---

**Q2 : Comment configurez-vous l'alerting pour éviter l'alert fatigue ?**

> ✅ **Réponse attendue :**
> L'alert fatigue est le phénomène où les équipes ignorent les alertes parce qu'il y en a trop, ou qu'elles ne sont pas actionnables. Pour l'éviter : premièrement, on alerte sur des symptômes de service dégradé (SLO burn rate élevé, taux d'erreur HTTP 5xx) plutôt que sur des métriques d'infrastructure bas niveau (CPU à 80% qui peut être normal). Deuxièmement, chaque alerte doit avoir un runbook associé — si je ne sais pas quoi faire quand l'alerte se déclenche, je ne dois pas l'activer. Troisièmement, j'applique une classification par sévérité : alerte P1 = appel immédiat, P2 = notification Slack, P3 = ticket dans le backlog. Quatrièmement, je revois régulièrement le ratio alertes / actions réelles : une alerte qui ne génère pas d'action dans 90% des cas est soit mal calibrée, soit inutile.

---

**Q3 : Qu'est-ce qu'un SIEM et pourquoi est-il essentiel dans un SI sensible ?**

> ✅ **Réponse attendue :**
> Un SIEM (Security Information and Event Management) est la plateforme centrale qui collecte, normalise et corrèle les événements de sécurité provenant de toutes les sources du SI. Il permet de détecter des attaques qui ne seraient pas visibles source par source : par exemple, 5 tentatives de connexion échouées depuis une IP sur le VPN (log réseau) + une connexion réussie 10 minutes plus tard (log authentification) + un accès à un partage sensible (log fichier) = alerte de compromission de compte. Dans un SI sensible, le SIEM est obligatoire car il fournit la traçabilité réglementaire (LPM pour les OIV), permet la détection des menaces internes et externes, et alimente les équipes SOC pour la réponse à incident. La qualité du SIEM dépend de la qualité de son alimentation : des logs mal normalisés ou non horodatés correctement (d'où l'importance du NTP) produisent des corrélations fausses.

---

**Q4 : Comment implémentez-vous OpenTelemetry dans une application Java/Spring ?**

> ✅ **Réponse attendue :**
> OpenTelemetry est le standard open source pour instrumenter les applications et exporter métriques, traces et logs vers n'importe quel backend (Jaeger, Prometheus, Grafana Tempo, Datadog). Pour Spring Boot, l'approche la plus simple est le mode auto-instrumentation avec l'agent Java OpenTelemetry — il s'attache à la JVM au démarrage sans modifier le code applicatif (`-javaagent:opentelemetry-javaagent.jar`). Il instrumente automatiquement les frameworks courants (Spring MVC, JDBC, Kafka, gRPC). Pour les besoins plus fins, on utilise l'API et le SDK OpenTelemetry directement pour créer des spans personnalisés. Les données sont exportées via OTLP (OpenTelemetry Protocol) vers un collecteur OpenTelemetry qui les route vers les backends appropriés. L'avantage majeur : on change de backend de monitoring sans toucher au code applicatif.

---

## 4 · 🔐 CI/CD & DevSecOps — Scans, SAST, DAST, Trivy, Checkov

*Piliers CALMS : **A · M · S***

### 📚 Explication pédagogique

**Le pipeline CI/CD DevSecOps — Vue d'ensemble**

```
COMMIT → BUILD → SCAN SÉCURITÉ → TEST → PACKAGE → DÉPLOYER → VALIDER

  │        │            │            │       │          │          │
  │      Maven       SAST (code)   Tests    Nexus    Ansible    DAST
  │      Gradle      SCA (deps)   Units     OCI       K8s     (runtime)
  │       npm        Secrets      Intég.   Helm    Terraform
  │                  Trivy (img)
  │                  Checkov (IaC)
  │
  ▼
  Quality Gate → si KO : arrêt du pipeline, pas de déploiement
```

**Les types de scans — Explication claire**

| Sigle | Nom complet | Quand | Ce qu'il trouve | Outil typique |
|---|---|---|---|---|
| **SAST** | Static Application Security Testing | Au commit / build | Failles dans le code source (injections SQL, XSS, hard-coded secrets) | SonarQube, Semgrep, Checkmarx |
| **SCA** | Software Composition Analysis | Au build | CVE dans les dépendances open source (librairies Maven, npm…) | OWASP Dependency-Check, Snyk, Trivy |
| **Secrets scan** | — | Dès le commit (pre-hook) | Mots de passe, tokens, clés API dans le code | GitLeaks, TruffleHog, GitGuardian |
| **Scan image** | — | Avant déploiement | CVE dans les couches de l'image Docker | Trivy, Clair, Grype |
| **IaC scan** | — | Au build IaC | Mauvaises configs Terraform/Ansible/Helm/K8s | Checkov, tfsec, KICS |
| **DAST** | Dynamic Application Security Testing | En environnement de recette | Vulnérabilités en exécution (injections, XSS, auth bypass) | OWASP ZAP, Burp Suite |
| **SBOM** | Software Bill of Materials | À chaque release | Inventaire complet de tous les composants | Syft, CycloneDX |

**Trivy — L'outil incontournable**
> Trivy est un scanner de vulnérabilités polyvalent open source. Il analyse les images Docker, les systèmes de fichiers, les repos Git, les configs Kubernetes et Terraform.

```bash
# Scanner une image Docker
trivy image nginx:1.25

# Scanner un repo local (code + dépendances)
trivy fs .

# Scanner un manifest Kubernetes
trivy config ./k8s/

# Scanner une image avec seuil de sévérité (bloquant si CRITICAL)
trivy image --exit-code 1 --severity CRITICAL mon-app:latest
```

**Checkov — Scan de sécurité IaC**
> Checkov analyse statiquement les fichiers Terraform, Ansible, Kubernetes, Dockerfile pour détecter les mauvaises configurations de sécurité avant le déploiement.

```bash
# Scanner un répertoire Terraform
checkov -d ./terraform/

# Scanner un manifest Kubernetes
checkov -f ./k8s/deployment.yaml

# Scanner avec rapport JSON pour le pipeline
checkov -d ./terraform/ -o json > checkov-report.json
```

---

### 🚨 Mise en situation critique : Trivy détecte une faille de sécurité

> **Scénario :** Vous êtes DevSecOps. Votre pipeline de prod détecte une CVE CRITICAL (CVSS 9.8) dans une image Docker déjà déployée en production. Que faites-vous ?

**Processus de traitement — Étape par étape :**

```
ÉTAPE 1 — QUALIFICATION IMMÉDIATE (< 15 min)
  ├── Identifier précisément la CVE : CVE-XXXX-XXXX
  ├── Lire le bulletin officiel (NVD, MITRE)
  ├── Vérifier si la vulnérabilité est exploitable dans NOTRE contexte
  │   (le code vulnérable est-il exécuté ? l'application est-elle exposée ?)
  └── Score CVSS 9.8 = critique → escalade immédiate

ÉTAPE 2 — ÉVALUATION DE L'EXPLOITABILITÉ (< 30 min)
  ├── La faille est-elle dans une dépendance directe ou transitive ?
  ├── L'application expose-t-elle le vecteur d'attaque ? (réseau, authentifié/non ?)
  ├── Existe-t-il déjà un exploit public (ExploitDB, GitHub) ?
  └── L'application est-elle exposée sur Internet ou uniquement en interne ?

ÉTAPE 3 — DÉCISION IMMÉDIATE
  ├── Si exploitable + exposition externe → ISOLATION immédiate du service
  ├── Si exploitable + réseau interne → Restriction d'accès + patch sous 24h
  └── Si non exploitable dans notre contexte → Exception tracée + patch planifié

ÉTAPE 4 — REMÉDIATION
  ├── Mettre à jour la dépendance vulnérable dans le Dockerfile / pom.xml
  ├── Rebuild + re-scan Trivy (vérifier que la CVE disparaît)
  ├── Pipeline complet : build → scan → test → déploiement
  └── Vérifier que la version patchée est disponible et stable

ÉTAPE 5 — DÉPLOIEMENT DU PATCH
  ├── Déploiement en environnement de recette + validation
  ├── Déploiement en production (via pipeline standard ou urgence)
  └── Vérification post-déploiement : re-scan Trivy en prod

ÉTAPE 6 — DOCUMENTATION & AMÉLIORATION
  ├── Rapport d'incident sécurité documenté
  ├── Root Cause Analysis : pourquoi cette CVE est passée en prod ?
  ├── Amélioration du pipeline : seuil CVSS configuré comme quality gate bloquant
  └── Communication aux parties prenantes (RSSI, DSI)
```

---

### ❓ Questions & Réponses attendues

---

**Q1 : Quelle est la différence entre SAST et DAST ? Quand utiliser l'un vs l'autre ?**

> ✅ **Réponse attendue :**
> Le SAST (Static Application Security Testing) analyse le code source sans l'exécuter — il détecte les vulnérabilités "dans le code" comme les injections SQL potentielles, les fonctions cryptographiques faibles, les secrets codés en dur. Il s'intègre très tôt dans le pipeline (dès le commit), ne nécessite pas d'environnement fonctionnel, mais génère des faux positifs et ne voit pas les vulnérabilités de configuration. Le DAST (Dynamic Application Security Testing) attaque l'application en cours d'exécution comme le ferait un attaquant réel — il détecte les vulnérabilités réelles exposées (XSS, injections, problèmes d'authentification, mauvaise configuration des headers). Il génère peu de faux positifs mais nécessite un environnement déployé (recette/staging). Les deux sont complémentaires : le SAST protège tôt et couvre le code interne, le DAST valide que rien n'est exposé en conditions réelles.

---

**Q2 : Comment gérez-vous les faux positifs dans SonarQube ou Trivy ?**

> ✅ **Réponse attendue :**
> Les faux positifs sont inévitables et doivent être gérés avec rigueur pour ne pas polluer les rapports ni habituer les équipes à les ignorer (ce qui reviendrait à ignorer aussi les vrais positifs). Pour SonarQube, je marque les faux positifs comme "Won't Fix" avec une justification obligatoire documentée, et un ticket de revue associé. Pour Trivy, je maintiens un fichier `.trivyignore` versionné dans le repo avec les CVE ignorées, leur justification et une date d'expiration (la CVE peut devenir exploitable). Dans les deux cas, toute exception est soumise à une approbation formelle (lead sécu ou RSSI), tracée et périodiquement révisée. L'objectif est que les rapports restent exploitables : une liste de 500 alertes non triées ne vaut rien, une liste de 10 alertes réelles prioritaires permet d'agir.

---

**Q3 : Qu'est-ce qu'un SBOM et pourquoi devient-il obligatoire ?**

> ✅ **Réponse attendue :**
> Un SBOM (Software Bill of Materials) est un inventaire formel et lisible par machine de tous les composants d'une application : librairies, versions, licences, dépendances transitives. Il est généré automatiquement à chaque release par des outils comme Syft ou CycloneDX. Son importance est croissante pour plusieurs raisons : la sécurité de la supply chain logicielle (l'attaque SolarWinds a montré que la menace vient souvent des dépendances, pas du code maison), la conformité réglementaire (Executive Order US 2021 sur la cybersécurité l'impose, et les normes européennes suivent), et la gestion des vulnérabilités (quand Log4Shell est sorti en 2021, les organisations avec un SBOM ont identifié en heures quelles applications étaient exposées — les autres ont mis des semaines). Je génère systématiquement le SBOM à chaque release et le stocke dans Nexus avec l'artefact correspondant.

---

**Q4 : Comment intégrez-vous Checkov dans un pipeline GitLab CI pour Terraform ?**

> ✅ **Réponse attendue (avec exemple concret) :**

```yaml
# .gitlab-ci.yml
stages:
  - validate
  - security
  - plan
  - apply

terraform-validate:
  stage: validate
  image: hashicorp/terraform:latest
  script:
    - terraform init
    - terraform validate

checkov-scan:
  stage: security
  image: bridgecrew/checkov:latest
  script:
    - checkov -d . --framework terraform
              --output cli --output junitxml
              --output-file-path console,checkov-report.xml
    # Bloquant uniquement sur les HIGH et CRITICAL
    - checkov -d . --framework terraform
              --check CKV_AWS_* --compact
  artifacts:
    reports:
      junit: checkov-report.xml
    when: always
  allow_failure: false   # Bloquant : si Checkov fail, le pipeline s'arrête
```
> Ce pipeline bloque toute modification Terraform qui introduit une mauvaise configuration de sécurité (bucket S3 public, groupe de sécurité trop permissif, chiffrement désactivé) avant même le `terraform plan`.

---

## 5 · 🏗️ Terraform & Ansible — IaC en profondeur

*Piliers CALMS : **A · S***

### 📚 Explication pédagogique

**Terraform vs Ansible — Ce n'est pas la même chose**

```
┌──────────────────────────────┬─────────────────────────────────────┐
│         TERRAFORM            │              ANSIBLE                │
├──────────────────────────────┼─────────────────────────────────────┤
│ PROVISIONNER l'infrastructure│ CONFIGURER ce qui est provisionné   │
│ "Je crée 3 VMs, un réseau,   │ "J'installe Nginx, je configure     │
│  un load balancer"           │  l'appli, je déploie le code"       │
├──────────────────────────────┼─────────────────────────────────────┤
│ Déclaratif                   │ Procédural / Impératif              │
│ (décrit l'état final désiré) │ (décrit les actions à effectuer)    │
├──────────────────────────────┼─────────────────────────────────────┤
│ Maintient un état (tfstate)  │ Idempotent, pas de state central    │
├──────────────────────────────┼─────────────────────────────────────┤
│ Agentless (API cloud)        │ Agentless (SSH / WinRM)             │
└──────────────────────────────┴─────────────────────────────────────┘

Usage combiné :
  1. Terraform  →  crée les VMs, configure le réseau, crée les buckets
  2. Ansible    →  installe les packages, configure les apps, déploie
```

**Terraform — Les concepts fondamentaux**

```hcl
# main.tf — Exemple simple
terraform {
  backend "s3" {                    # tfstate stocké à distance (obligatoire en équipe)
    bucket = "mon-tfstate"
    key    = "prod/terraform.tfstate"
    region = "eu-west-1"
  }
}

provider "aws" {
  region = var.region               # Variables externalisées, jamais de valeurs en dur
}

resource "aws_instance" "app" {
  ami           = var.ami_id
  instance_type = var.instance_type

  tags = {
    Environment = var.environment   # Tags obligatoires pour la traçabilité
    ManagedBy   = "Terraform"
  }
}
```

**Le tfstate — Pourquoi c'est critique**
> Le fichier `terraform.tfstate` est la mémoire de Terraform : il sait ce qu'il a créé et peut calculer les changements nécessaires. En équipe, il DOIT être stocké dans un backend distant (S3, Azure Blob, GitLab) avec le verouillage activé (évite les conflits si deux personnes appliquent en même temps). Un tfstate local = catastrophe garantie en équipe.

**Ansible — Les concepts fondamentaux**

```yaml
# playbook-deploy.yml — Exemple structuré
---
- name: Déploiement application Java
  hosts: "{{ env }}_app_servers"     # Cible dynamique selon l'environnement
  become: yes                         # Élévation de privilèges (sudo)
  vars_files:
    - "vars/{{ env }}.yml"            # Variables par environnement
  roles:
    - role: java                      # Rôles modulaires réutilisables
    - role: application
    - role: nginx-reverse-proxy
```

```
Structure d'un rôle Ansible (bonne pratique)
roles/
└── application/
    ├── tasks/
    │   └── main.yml        # Actions principales
    ├── handlers/
    │   └── main.yml        # Actions déclenchées par notify (ex: restart nginx)
    ├── templates/
    │   └── app.conf.j2     # Templates Jinja2 de configuration
    ├── vars/
    │   └── main.yml        # Variables du rôle
    ├── defaults/
    │   └── main.yml        # Valeurs par défaut (surchargeables)
    ├── files/
    │   └── ...             # Fichiers statiques à copier
    └── meta/
        └── main.yml        # Métadonnées, dépendances entre rôles
```

**Idempotence — Concept clé Ansible**
> Un playbook Ansible est idempotent si son exécution multiple produit toujours le même résultat final. Si le fichier existe déjà → il n'est pas recréé. Si le service est déjà démarré → il n'est pas redémarré. Cela permet d'exécuter les playbooks en toute sécurité sur un parc existant.

---

### ❓ Questions & Réponses attendues

---

**Q1 : Qu'est-ce que le drift d'infrastructure et comment le gérez-vous ?**

> ✅ **Réponse attendue :**
> Le drift (ou dérive de configuration) est l'écart progressif entre ce qui est décrit dans l'IaC et ce qui existe réellement en production — causé par des modifications manuelles non tracées (un admin qui modifie directement un serveur "pour aller vite"). Le drift est dangereux car il rend l'infrastructure non reproductible, crée des comportements inattendus et des failles de sécurité. Pour le gérer, plusieurs approches : avec Terraform, `terraform plan` montre les drifts, et je configure une exécution planifiée (scheduled pipeline) qui exécute `terraform plan` quotidiennement et alerte si des drifts sont détectés. Avec Ansible, j'exécute les playbooks en mode `--check` (dry-run) régulièrement sur le parc pour détecter les dérives. La solution radicale est d'interdire les accès manuels aux serveurs de production (tout passe par le pipeline), ce qui est la cible mais nécessite une maturité organisationnelle suffisante.

---

**Q2 : Comment gérez-vous les secrets dans Terraform et Ansible ?**

> ✅ **Réponse attendue :**
> Les secrets ne doivent jamais apparaître en clair dans le code IaC ni dans le tfstate. Pour Terraform, j'utilise HashiCorp Vault comme source de secrets via le provider Vault, ou les secrets managers natifs des clouds (AWS Secrets Manager, Azure Key Vault). Le tfstate peut contenir des valeurs sensibles en clair — il doit donc être chiffré au repos (backend S3 avec chiffrement SSE-KMS) et son accès strictement contrôlé par IAM. Pour Ansible, les secrets sensibles sont chiffrés avec Ansible Vault (chiffrement AES-256 des fichiers de variables) et la clé de déchiffrement est injectée au runtime via une variable d'environnement ou récupérée depuis HashiCorp Vault. En aucun cas la clé Vault ne se trouve dans le repo Git. Je scanne systématiquement les repos avec GitLeaks dans la CI pour détecter tout secret qui aurait accidentellement été commité.

---

**Q3 : Expliquez comment vous testez un rôle Ansible avec Molecule.**

> ✅ **Réponse attendue :**
> Molecule est le framework de test standard pour les rôles Ansible. Il crée un environnement isolé (Docker ou VM), applique le rôle, puis exécute des tests de vérification. Le workflow type : `molecule create` instancie les conteneurs de test, `molecule converge` applique le rôle, `molecule verify` exécute les tests avec Testinfra ou Ansible (on vérifie que les packages sont installés, que les services tournent, que les fichiers ont les bons permissions), `molecule idempotence` réapplique le rôle et vérifie qu'aucun changement n'est détecté (test d'idempotence), `molecule destroy` nettoie. Dans la CI GitLab, j'intègre Molecule dans un job dédié qui s'exécute sur chaque MR modifiant un rôle. Ça évite de déployer des rôles non testés en production.

---

**Q4 : Qu'est-ce qu'un module Terraform et pourquoi les utiliser ?**

> ✅ **Réponse attendue :**
> Un module Terraform est un ensemble de ressources réutilisables regroupées avec une interface claire (variables d'entrée et sorties). C'est l'équivalent d'une fonction ou d'une librairie en programmation. Plutôt que de répliquer 50 lignes de configuration pour chaque environnement ou chaque projet, on appelle le module une fois avec les paramètres spécifiques. Les avantages sont nombreux : standardisation (tous les projets utilisent les mêmes patterns d'infrastructure validés), sécurité (les bonnes pratiques de sécurité sont encodées dans le module — chiffrement, tags obligatoires, logging activé — et toute l'organisation en bénéficie automatiquement), maintenabilité (corriger un problème dans le module le corrige partout). Je maintiens une bibliothèque de modules internes versionnés dans un registre Terraform privé (GitLab Terraform Registry), avec des tests automatisés (Terratest) et un changelog.

---

**Q5 : Comment gérez-vous les erreurs courantes en Terraform ?**

> ✅ **Réponse attendue (avec exemples) :**

> **Erreur : `Error: state lock`**
> Le tfstate est verrouillé par une autre exécution (ou un run précédent a crashé). Solution : identifier le processus qui tient le verrou, le terminer proprement, puis `terraform force-unlock <lock-id>` avec précaution.

> **Erreur : tfstate incohérent / ressource supprimée manuellement en dehors de Terraform**
> `terraform import <resource_type>.<name> <resource_id>` pour réconcilier. Si la ressource n'existe plus : `terraform state rm <resource>` pour la retirer du state.

> **Erreur : drift → `terraform plan` montre des changements non désirés**
> Ne jamais `terraform apply` les yeux fermés. Analyser chaque changement, comprendre son origine. Si c'est un drift manuel : corriger l'IaC pour refléter l'état voulu, ou laisser Terraform remettre à l'état cible si c'est intentionnel.

> **Erreur : secrets dans le tfstate**
> Rotation immédiate des secrets exposés, chiffrement du backend, revue des accès au tfstate, mise en place du provider Vault pour externaliser les secrets.

---

## 6 · 💾 Sauvegardes & Restauration — Guide complet

*Piliers CALMS : **A · M · C***

### 📚 Explication pédagogique

**Pourquoi les sauvegardes sont-elles critiques ?**
> Une sauvegarde non testée est une promesse non tenue. La seule façon de savoir qu'une sauvegarde fonctionne, c'est de la restaurer. Les sauvegardes doivent être dimensionnées selon les objectifs RTO/RPO définis par le métier.

**RTO et RPO — La base fondamentale**

```
          Sinistre survient            Service restauré
               │                            │
───────────────┼────────────────────────────┼──────────► temps
               │◄──────────── RTO ─────────►│
               │         (ex: 4h max)
               │
   Dernière sauvegarde
               │◄── RPO ──►│ Sinistre
                   (ex: 2h de données perdues au max)

RTO = combien de temps peut-on être hors service ?
RPO = combien de données peut-on perdre (en unité de temps) ?
```

**Les méthodes de sauvegarde**

| Méthode | Principe | RTO | RPO | Stockage |
|---|---|---|---|---|
| **Full** | Copie complète | Court (tout est là) | = fréquence de la full | Lourd |
| **Incrémentale** | Changements depuis la dernière sauvegarde | Long (chaîne à reconstruire) | = fréquence de l'incrémentale | Léger |
| **Différentielle** | Changements depuis le dernier Full | Moyen | = fréquence de la différentielle | Moyen (croissant) |
| **Snapshot** | Photo instantanée (VM, LUN) | Très court | Court | Variable |
| **CDP** | Continuous Data Protection (quasi temps réel) | Très court | Quasi nul | Lourd |
| **Réplication** | Copie synchrone/asynchrone en continu | Très court | Court à nul | Lourd |

> ⚠️ **Réplication ≠ Sauvegarde** : La réplication copie aussi les suppressions accidentelles et les corruptions. Elle ne remplace pas une sauvegarde.

**La règle 3-2-1-1-0 (standard industrie)**

```
3  copies des données (production + 2 copies)
  └── 2  supports différents (disque + NAS, tape ou cloud)
        └── 1  copie hors site (autre datacenter, cloud sécurisé)
              └── 1  copie immuable (WORM) ou air-gapped (anti-ransomware)
                    └── 0  erreur = prouvé par tests de restauration réguliers
```

**CommVault vs VEEAM — Les deux grands de l'industrie**

| Critère | CommVault | VEEAM |
|---|---|---|
| **Points forts** | Très large périmètre (DB, applis, cloud, tape) | Très fort sur VMware/Hyper-V, interface simple |
| **Périmètre** | Enterprise all-in-one, MSP | Environnements virtualisés et cloud |
| **Complexité** | Élevée, courbe d'apprentissage importante | Modérée, plus accessible |
| **Licences** | À l'agent / capacité | Socket / instance |
| **Immutabilité** | Oui (Commvault HyperScale X, cloud targets) | Oui (Veeam Hardened Repository, cloud immutable) |
| **Air gap** | Oui (tape, cloud isolé) | Oui (Veeam Hardened Repository Linux) |

**Le chiffrement des sauvegardes**

```
AES-256 — Standard de chiffrement militaire, pratiquement incassable

Deux niveaux de chiffrement :
├── Au repos (at rest)  : données chiffrées sur le support de sauvegarde
└── En transit          : données chiffrées pendant le transfert (TLS 1.2+)

Gestion des clés (point critique !) :
├── HSM (Hardware Security Module) : coffre physique pour les clés maîtres
├── KMS (Key Management Service)   : AWS KMS, Azure Key Vault, HashiCorp Vault
└── Règle absolue : la clé NE DOIT PAS être sur le même support que les données
```

---

### 🚨 Mise en situation : attaque ransomware sur le SI

> **Scénario :** Il est 3h du matin. Votre SIEM déclenche une alerte critique : chiffrement massif de fichiers détecté sur 30% des serveurs de production. C'est un ransomware. Que faites-vous ?

```
PHASE 1 — CONFINEMENT IMMÉDIAT (0 à 30 min)
  ├── Isoler les systèmes compromis du réseau (VLAN de quarantaine)
  │   sans les éteindre (préserve les preuves forensiques en mémoire)
  ├── Identifier le patient zéro (premier système compromis)
  ├── Évaluer la portée : quels systèmes sont touchés ? Quelles données ?
  ├── Activer la cellule de crise (DSI, RSSI, DG, Juridique)
  └── Notifier l'ANSSI si OIV (obligation réglementaire LPM)

PHASE 2 — ÉVALUATION (30 min à 2h)
  ├── Les sauvegardes sont-elles intactes et isolées ?
  │   → Vérifier que les sauvegardes immuables/air-gapped ne sont pas touchées
  ├── Identifier la souche du ransomware (ID Ransomware, logs SIEM)
  ├── Évaluer le RPO : quelle est la dernière sauvegarde saine ?
  ├── Évaluer le RTO : combien de temps pour restaurer les systèmes critiques ?
  └── Décision : payer la rançon ? (Réponse : JAMAIS sans avis ANSSI/Juridique)

PHASE 3 — RESTAURATION (2h à RTO)
  ├── Restaurer en priorité les systèmes critiques (selon plan de criticité)
  ├── Restaurer depuis les sauvegardes immuables sur des systèmes propres
  │   (JAMAIS sur les systèmes compromis sans nettoyage complet)
  ├── Valider l'intégrité des données restaurées (checksums, tests applicatifs)
  └── Reconnexion progressive au réseau après validation de chaque système

PHASE 4 — POST-INCIDENT
  ├── Analyse forensique complète (comment le ransomware est entré ?)
  ├── Rapport d'incident (ANSSI, direction, assurance cyber)
  ├── Combler les failles identifiées (vecteur d'entrée, propagation)
  └── Revue du PRA/PCA : améliorer les procédures de réponse
```

---

### ❓ Questions & Réponses attendues

---

**Q1 : Expliquez la règle 3-2-1-1-0 et pourquoi le dernier "0" est le plus important.**

> ✅ **Réponse attendue :**
> La règle 3-2-1-1-0 définit la stratégie de sauvegarde robuste : 3 copies des données, sur 2 supports différents, avec 1 copie hors site, 1 copie immuable ou air-gapped, et 0 erreur vérifiée par des tests de restauration. Le "0" est le plus important car il transforme une promesse en certitude. Sans test de restauration, je ne sais pas si mes sauvegardes sont exploitables. Les causes d'échec sont nombreuses : corruption silencieuse des données, incompatibilité de version entre l'agent de sauvegarde et l'OS restauré, procédure de restauration documentée mais jamais pratiquée donc trop lente, clés de chiffrement non disponibles au moment critique. Je planifie des tests de restauration mensuels sur un échantillon d'applications et des tests complets trimestriels, avec un compte-rendu documenté et archivé.

---

**Q2 : Qu'est-ce qu'une sauvegarde immuable et pourquoi est-elle devenue indispensable ?**

> ✅ **Réponse attendue :**
> Une sauvegarde immuable (technologie WORM — Write Once, Read Many) est une sauvegarde qu'aucun acteur ne peut modifier ou supprimer pendant une période définie, même un administrateur système avec les droits les plus élevés. Elle est devenue indispensable face aux ransomwares modernes qui ciblent systématiquement les sauvegardes : si les attaquants compromettent les comptes d'administration, ils peuvent supprimer les sauvegardes classiques avant de déclencher le chiffrement. Avec des sauvegardes immuables, même un compte administrateur compromis ne peut pas supprimer les sauvegardes pendant la période de rétention configurée. VEEAM propose le Veeam Hardened Repository (Linux avec immutabilité XFS), CommVault le support des cibles WORM (DataDomain, cloud S3 Object Lock). Je configure une période de rétention immuable d'au moins 30 jours pour les sauvegardes critiques.

---

**Q3 : Comment vérifiez-vous le chiffrement et l'intégrité des sauvegardes ?**

> ✅ **Réponse attendue :**
> Le chiffrement AES-256 est configuré au niveau de la solution de sauvegarde (CommVault ou VEEAM) pour s'appliquer au repos et en transit (TLS). Les clés de chiffrement sont stockées dans un gestionnaire de clés séparé (KMS cloud ou HSM on-premise) — jamais sur le même système que les sauvegardes. L'intégrité est vérifiée via des checksums (MD5, SHA-256) calculés au moment de la sauvegarde et vérifiés périodiquement. VEEAM propose le SureBackup qui démarre automatiquement une VM depuis la sauvegarde dans un environnement isolé et vérifie que l'OS démarre et que l'application répond. CommVault a un mécanisme similaire. Ces vérifications automatiques sont complétées par des tests manuels périodiques de restauration complète pour valider les procédures et mesurer le RTO réel.

---

**Q4 : Quelle est la différence entre PRA et PCA ?**

> ✅ **Réponse attendue :**
> Le PCA (Plan de Continuité d'Activité) vise à maintenir un niveau d'activité minimal (mode dégradé acceptable) pendant un incident majeur, sans interruption complète. Il prévoit les ressources alternatives, les procédures dégradées, les basculements vers des sites secondaires. Le PRA (Plan de Reprise d'Activité) définit comment reprendre une activité normale après qu'elle a été complètement interrompue suite à un sinistre majeur (destruction du datacenter principal, cyberattaque devastatrice). Il précise les priorités de remontée des systèmes, les RTO/RPO cibles et les procédures pas à pas. En pratique, les deux documents doivent être testés régulièrement (au moins annuellement) avec des scénarios réalistes, pas simplement validés en comité. Un PRA dans un tiroir qui n'a jamais été testé est un PRA qui échouera au moment critique.

---

## 7 · 🚨 Gestion d'Incident de A à Z — Mise en situation

*Piliers CALMS : **M · C · S***

### 📚 Explication pédagogique

**Les niveaux de criticité incidents**

| Niveau | Nom | Définition | Délai de prise en charge |
|---|---|---|---|
| **P1** | Critique | Service production totalement indisponible, impact maximal | < 15 min |
| **P2** | Majeur | Dégradation sévère, fonctionnalité clé hors service | < 30 min |
| **P3** | Modéré | Impact limité, contournement disponible | < 4 heures |
| **P4** | Mineur | Anomalie cosmétique, aucun impact fonctionnel | Prochaine itération |

**Le cycle de vie complet d'un incident**

```
 1. DÉTECTION        → Monitoring, alerte SIEM, ticket utilisateur
        │
 2. QUALIFICATION    → Est-ce P1/P2/P3/P4 ? Quel périmètre impacté ?
        │
 3. ESCALADE         → Qui est prévenu ? (équipe on-call, lead, management, métier)
        │
 4. DIAGNOSTIC       → Quelle est la cause ? (logs, métriques, traces)
        │
 5. RÉSOLUTION       → Rollback ? Patch ? Redémarrage ? Contournement ?
        │
 6. COMMUNICATION    → Mise à jour des parties prenantes pendant et après
        │
 7. CLÔTURE          → Confirmation de résolution, fin d'alerte
        │
 8. POST-MORTEM      → Analyse blameless des causes + actions d'amélioration
        │
 9. AMÉLIORATION     → Implémentation des actions, suivi dans le backlog
```

**Le Post-Mortem Blameless — Culture essentielle**
> Un post-mortem blameless ne cherche pas le coupable — il cherche les causes systémiques. L'objectif est d'améliorer le système, pas de punir les individus. Cette culture, popularisée par Google SRE, permet aux équipes de remonter les incidents sans peur, d'apprendre collectivement et d'éviter les récurrences.

**Structure d'un rapport de post-mortem :**

```
POST-MORTEM — [Nom de l'incident] — [Date]

1. RÉSUMÉ
   Date/heure début, fin, durée totale, services impactés, impact utilisateurs

2. CHRONOLOGIE DES ÉVÉNEMENTS
   HH:MM — Événement 1
   HH:MM — Événement 2
   [Chaque action, détection, décision horodatée]

3. CAUSE RACINE (Root Cause Analysis)
   Cause immédiate : [ce qui a déclenché l'incident]
   Cause profonde  : [pourquoi ce déclencheur a pu provoquer cet impact]
   Facteurs contributifs : [ce qui a aggravé ou permis l'incident]

4. IMPACT
   Services touchés, durée d'indisponibilité, nombre d'utilisateurs impactés,
   perte financière estimée si pertinent

5. CE QUI A BIEN FONCTIONNÉ
   [Ne pas oublier de valoriser ce qui a aidé à résoudre rapidement]

6. CE QUI AURAIT PU ÊTRE AMÉLIORÉ
   [Détection tardive ? Runbook manquant ? Communication insuffisante ?]

7. ACTIONS D'AMÉLIORATION
   │ Action                    │ Responsable │ Deadline │ Statut │
   │ Ajouter alerte sur X      │ Prénom N.   │ JJ/MM    │ TODO   │
   │ Rédiger runbook Y         │ Prénom N.   │ JJ/MM    │ TODO   │
```

---

### 🚨 Mise en situation complète : Panne applicative P1

> **Scénario réaliste :** Il est 14h37 un lundi. Le monitoring déclenche une alerte : l'application de billettique (application critique) ne répond plus. Des centaines d'utilisateurs sont impactés. Vous êtes d'astreinte. Décrivez votre démarche.

```
14:37 — DÉTECTION
  → Alerte PagerDuty/Opsgenie reçue : HTTP 503 sur /api/tickets
  → Dashboard SLO : taux d'erreur à 98%, SLO burn rate critique

14:38 — QUALIFICATION
  → Confirmer l'impact : API complètement down ? Partiellement ?
  → Vérifier si c'est un problème de monitoring ou un vrai incident
  → curl https://app/api/health → Connection refused → C'est réel → P1

14:39 — ESCALADE
  → Notification channel Slack #incident-p1 créé automatiquement
  → Lead technique prévenu, product owner prévenu
  → Utilisateurs : page de statut mise à jour "Incident en cours"

14:40 — DIAGNOSTIC (méthode entonnoir : du plus probable au moins probable)
  → Kubectl get pods -n production
     → 3 pods en CrashLoopBackOff depuis 14:35
  → Kubectl describe pod app-xxx → OOMKilled (Out Of Memory)
  → Kubectl logs app-xxx --previous → java.lang.OutOfMemoryError: Java heap space
  → Corrélation : déploiement effectué à 14:30 (7 min avant l'incident)
  → Hypothesis : le nouveau déploiement a introduit une fuite mémoire

14:45 — RÉSOLUTION — Décision : ROLLBACK
  → kubectl rollout undo deployment/billettique
  → Attendre que les pods soient Ready (readinessProbe)
  → Vérifier les métriques : taux d'erreur revient à 0%
  → curl https://app/api/health → 200 OK

14:52 — STABILISATION
  → Surveillance renforcée pendant 30 min
  → Confirmation auprès des équipes métier que le service est restauré
  → Mise à jour page de statut : "Incident résolu"

15:30 — COMMUNICATION POST-INCIDENT
  → Email de synthèse aux parties prenantes
  → Durée d'impact : 15 min
  → Cause : fuite mémoire introduite par la version v2.3.1
  → Action immédiate : rollback vers v2.3.0
  → Prochaine étape : post-mortem planifié le lendemain

J+1 — POST-MORTEM BLAMELESS
  Cause racine identifiée :
  → La v2.3.1 avait une fuite mémoire sur le batch de synchronisation
  → Les tests de charge en staging n'avaient pas reproduit la charge réelle de prod
  Actions d'amélioration :
  → Ajouter un test de charge dans le pipeline (k6, Gatling) — Responsable : X — 2 semaines
  → Configurer une alerte sur la consommation mémoire JVM avant saturation — R : Y — 1 semaine
  → Améliorer la parité staging/prod pour les données de test — R : Z — 1 mois
```

---

### ❓ Questions & Réponses attendues

---

**Q1 : Qu'est-ce qu'un post-mortem blameless et comment l'animez-vous ?**

> ✅ **Réponse attendue :**
> Un post-mortem blameless est une session d'analyse collective d'un incident majeur dont l'objectif est d'améliorer le système, pas de trouver un coupable. Les individus font des erreurs — c'est inévitable — mais si l'erreur d'une seule personne peut provoquer un incident P1, c'est que le système n'est pas suffisamment résilient. C'est sur le système qu'on agit.
> Pour l'animation, je commence par partager la chronologie établie avant la réunion (pas de reconstruction de mémoire en séance), je recueille les faits sans jugement, j'utilise la méthode des "5 pourquoi" pour descendre jusqu'à la cause racine, et je conclus par des actions concrètes avec des responsables et des deadlines — pas de vœux pieux. La règle absolue : aucune formulation du type "Untel a oublié de...", uniquement "Le processus ne garantissait pas que...".

---

**Q2 : Comment réduisez-vous le MTTR sur les incidents récurrents ?**

> ✅ **Réponse attendue :**
> Le MTTR se réduit sur trois axes. Premièrement, la détection plus rapide : améliorer l'observabilité (SLO burn rate plutôt qu'alertes infra), réduire le bruit d'alertes pour que les vraies alertes soient immédiatement visibles, mettre en place des alertes prédictives sur les tendances (mémoire qui croît lentement). Deuxièmement, le diagnostic plus rapide : des runbooks à jour couvrant les incidents récurrents (si un incident s'est produit une fois, il y a un runbook — s'il se reproduit, on l'exécute en 5 min), des dashboards préconfigurés corrélant les métriques clés, des traces distribuées pour localiser le goulot en microservices. Troisièmement, la résolution plus rapide : automatisation des actions de remédiation courantes (rollback automatique si SLO violé, redémarrage automatique d'un service défaillant), pratique régulière des procédures (game days, chaos engineering).

---

**Q3 : Qu'est-ce que le chaos engineering et comment l'utilisez-vous pour améliorer la résilience ?**

> ✅ **Réponse attendue :**
> Le chaos engineering, popularisé par Netflix avec Chaos Monkey, consiste à introduire intentionnellement des défaillances dans un système pour identifier ses points de faiblesse avant que l'incident réel ne les révèle. L'idée est simple : si je ne sais pas comment mon système se comporte quand un pod tombe, je préfère le découvrir lors d'un exercice contrôlé un mardi matin que lors d'un vrai incident un vendredi à 18h. En pratique, je commence par des exercices simples (tuer un pod Kubernetes — K8s devrait le redémarrer automatiquement), puis j'augmente la complexité (saturer la mémoire d'un nœud, injecter de la latence réseau entre services, couper une base de données). L'outil Chaos Mesh ou LitmusChaos permet d'orchestrer ces tests en environnement de staging, puis progressivement en production sur des créneaux maîtrisés. Chaque exercice produit un rapport et des actions d'amélioration.

---

**Q4 : Comment gérez-vous la communication pendant un incident P1 ?**

> ✅ **Réponse attendue :**
> La communication pendant un incident est aussi importante que la résolution technique — un incident bien géré techniquement mais mal communiqué crée une crise de confiance. Je suis une règle simple : une mise à jour toutes les 30 minutes maximum, même si je n'ai pas de solution — "Nous avons identifié la cause, la résolution est en cours, prochain point dans 30 min". Ça évite les questions de management qui interrompent le diagnostic. J'utilise une page de statut publique (Statuspage.io ou équivalent) mise à jour en temps réel, un canal Slack dédié à l'incident avec un war room virtuel, et une communication différenciée selon l'audience : les équipes techniques ont les détails techniques, le management a l'impact business et l'ETA de résolution, les utilisateurs finaux ont un message simple et honnête sans jargon.

---

## 8 · 📖 Glossaire de référence

### Gouvernance & Organisation

| Sigle | Définition rapide |
|---|---|
| **AMOA** | Assistance à Maîtrise d'Ouvrage — interface métier/IT |
| **CAB** | Change Advisory Board — comité d'approbation des changements |
| **CMDB** | Configuration Management Database — référentiel des composants SI |
| **COPIL** | Comité de Pilotage — instance stratégique |
| **COPRO** | Comité Projet — suivi opérationnel |
| **DAT** | Dossier d'Architecture Technique |
| **DCT** | Dossier de Conception Technique |
| **DEX** | Dossier d'Exploitation |
| **DSI** | Direction des Systèmes d'Information |
| **HNO** | Hors Normes Ouvrées — interventions hors heures de travail |
| **MCO** | Maintien en Condition Opérationnelle |
| **MCS** | Maintien en Condition de Sécurité |
| **OIV** | Opérateur d'Importance Vitale |

### CI/CD & DevSecOps

| Sigle | Définition rapide |
|---|---|
| **CI** | Continuous Integration — intégration continue avec build/tests automatiques |
| **CD** | Continuous Delivery/Deployment — livraison automatisée |
| **CVE** | Common Vulnerabilities and Exposures — identifiant unique d'une vulnérabilité |
| **CVSS** | Common Vulnerability Scoring System — score 0 à 10 |
| **DAST** | Dynamic Application Security Testing — tests en exécution |
| **IAM** | Identity and Access Management — gestion des identités et droits |
| **MFA** | Multi-Factor Authentication |
| **MR** | Merge Request (GitLab) / Pull Request (GitHub) |
| **SAST** | Static Application Security Testing — analyse du code source |
| **SBOM** | Software Bill of Materials — inventaire des composants |
| **SCA** | Software Composition Analysis — détection CVE dans les dépendances |
| **XSS** | Cross-Site Scripting — injection de scripts malveillants |

### Incidents & Continuité

| Sigle | Définition rapide |
|---|---|
| **MTBF** | Mean Time Between Failures — temps moyen entre pannes |
| **MTTR** | Mean Time To Restore — temps moyen de rétablissement |
| **PCA** | Plan de Continuité d'Activité — maintien en mode dégradé |
| **PRA** | Plan de Reprise d'Activité — reprise après sinistre |
| **RCA** | Root Cause Analysis — analyse de la cause racine |
| **RPO** | Recovery Point Objective — perte de données maximale acceptable |
| **RTO** | Recovery Time Objective — durée maximale d'interruption acceptable |
| **SLA** | Service Level Agreement — engagement contractuel |
| **SLI** | Service Level Indicator — indicateur mesuré en temps réel |
| **SLO** | Service Level Objective — objectif interne (plus strict que SLA) |

### Sauvegardes & Stockage

| Sigle | Définition rapide |
|---|---|
| **CDP** | Continuous Data Protection — sauvegarde quasi temps réel |
| **LUN** | Logical Unit Number — unité logique de stockage SAN |
| **WORM** | Write Once Read Many — stockage immuable anti-ransomware |

### Sécurité & Observabilité

| Sigle | Définition rapide |
|---|---|
| **APM** | Application Performance Monitoring — surveillance perf applicative |
| **EDR** | Endpoint Detection and Response |
| **NTP** | Network Time Protocol — synchronisation des horloges |
| **SIEM** | Security Information and Event Management |
| **SOC** | Security Operations Center |

### Infrastructure & DevOps

| Sigle | Définition rapide |
|---|---|
| **DORA** | DevOps Research and Assessment — métriques de référence |
| **HPA** | Horizontal Pod Autoscaler (Kubernetes) |
| **IaC** | Infrastructure as Code |
| **LPM** | Loi de Programmation Militaire — obligations sécurité OIV |
| **RBAC** | Role-Based Access Control |
| **RGPD** | Règlement Général sur la Protection des Données |

---

> 💡 **Conseil final pour l'entretien :** Structurez vos réponses avec le framework CALMS. Quand vous décrivez une solution technique, montrez toujours l'impact sur au moins deux piliers. Exemple : *"En standardisant nos templates Ansible [**A**], on a réduit le temps d'onboarding d'une semaine à 2 jours [**L**], et les runbooks associés sont désormais partagés avec toute l'équipe [**S**]."* Cela signale une pensée systémique, pas uniquement technique.

---

*Document rédigé pour préparation d'entretien DevSecOps senior · Méthode CALMS + DevSecOps · Version 1.0*
