---
title: "Audit de Maturité DevSecOps - CALMS"
description: "Maîtriser les concepts, anticiper et structurer"
created: "2026-03-04"
updated: "2026-04-28"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"

---

> **Classification :** Document de référence — Usage universel  
> **Cadre d'analyse :** Framework CALMS · DevSecOps · STRIDE · CIA · DORA Metrics · OWASP Top 10 · Règle 3-2-1-1-0  
> **Secteurs couverts :** Banque · Assurance · Santé · Transport · Énergie · Éducation · Industrie · Secteur Public

---

## Table des Matières

1. [Pourquoi Auditer sa Maturité DevSecOps ?](#1-pourquoi-auditer-sa-maturité-devsecops-)
2. [Comprendre le DevSecOps — Socle Conceptuel](#2-comprendre-le-devsecops--socle-conceptuel)
3. [Le Framework CALMS — Colonne Vertébrale de l'Audit](#3-le-framework-calms--colonne-vertébrale-de-laudit)
4. [Diagnostic par Interlocuteur — Questions Clés](#4-diagnostic-par-interlocuteur--questions-clés)
5. [Sécurité Intégrée — Shift Left & Outils](#5-sécurité-intégrée--shift-left--outils)
6. [Analyse des Risques — CIA & STRIDE](#6-analyse-des-risques--cia--stride)
7. [Gestion des Incidents & Postmortems](#7-gestion-des-incidents--postmortems)
8. [Sauvegardes & Restauration — Règle 3-2-1-1-0 & CALMS](#8-sauvegardes--restauration--règle-3-2-1-1-0--calms)
9. [Monitoring, Observabilité & SIEM](#9-monitoring-observabilité--siem)
10. [Feuille de Route — Lots 1 & 2](#10-feuille-de-route--lots-1--2)
11. [Recommandations & Différenciation](#11-recommandations--différenciation)
12. [Glossaire de Référence](#12-glossaire-de-référence)
13. [Références & Sources](#13-références--sources)

---

## 1. Pourquoi Auditer sa Maturité DevSecOps ?

### 1.1 Un Contexte de Transformation Accélérée

Le secteur IT traverse une mutation profonde qui touche toutes les organisations, quel que soit leur secteur d'activité. Les cycles de développement s'accélèrent, la pression réglementaire s'intensifie, et la surface d'attaque des systèmes d'information ne cesse de s'élargir.

| Indicateur marché | Valeur |
|-------------------|--------|
| Projets logiciels adoptant des pratiques DevSecOps | **90 %** |
| Croissance annuelle du marché DevSecOps | **+25 %** |
| Organisations ayant subi un incident lié à des pratiques DevOps mal sécurisées | **57 %** |
| Coût moyen d'un incident de sécurité (tous secteurs confondus) | **> 4,5 M€** (source IBM) |

### 1.2 Des Enjeux Communs à Tous les Secteurs

Quelle que soit l'organisation — banque, hôpital, transporteur, fournisseur d'énergie ou université — les défis de la transformation DevSecOps convergent autour de trois axes majeurs :

**Défi 1 — Conformité sans friction**
Intégrer la sécurité (RGPD, NIS2, ISO 27001, réglementations sectorielles) sans ralentir le Time-to-Market. Chaque secteur dispose de ses propres contraintes réglementaires, mais la logique est universelle : la sécurité doit être un accélérateur, pas un frein.

| Secteur | Réglementations clés |
|---------|---------------------|
| Banque / Assurance | ACPR, BCE, DORA réglementaire, PCI-DSS, RGPD |
| Santé | HDS (Hébergeur de Données de Santé), RGPD, ANSSI |
| Transport / Énergie (OIV) | LPM, NIS2, ANSSI, règlements sectoriels |
| Éducation | RGPD, CNIL, hébergement souverain |
| Secteur public | RGS (Référentiel Général de Sécurité), RGAA, eIDAS |

**Défi 2 — Hétérogénéité des pratiques**
Les équipes présentent des niveaux de maturité DevOps disparates. L'objectif d'un audit est d'harmoniser les pratiques sans niveler par le bas, en capitalisant sur les points forts existants.

**Défi 3 — Observabilité insuffisante**
Passer d'une surveillance purement technique (CPU/RAM/uptime) à une vision métier de la santé des systèmes : disponibilité des services critiques, latence des transactions, intégrité des données, conformité en temps réel.

### 1.3 Les Trois Grandes Questions de l'Audit

Un audit de maturité DevSecOps doit répondre à ces trois questions fondamentales :

1. **Où en sommes-nous réellement ?** — État des lieux objectif, sans complaisance.
2. **Quels sont les freins ?** — Obstacles organisationnels, techniques et culturels.
3. **Comment progresser ?** — Feuille de route priorisée, réaliste et actionnable.

---

## 2. Comprendre le DevSecOps — Socle Conceptuel

### 2.1 Définition et Principes Fondamentaux

Le **DevSecOps** est l'évolution du DevOps qui intègre la sécurité comme préoccupation de premier ordre à chaque étape du cycle de vie logiciel — non plus comme un verrou en fin de cycle, mais comme une responsabilité partagée.

> **Principe fondamental :** *"La sécurité est l'affaire de tous, intégrée dès la conception."*

### 2.2 Du Modèle en Silos au Modèle DevSecOps

**Problématique des silos (modèle traditionnel) :**

```
[DEV]  ──────►  [OPS]  ──────►  [SEC]  ──────►  Production
 Code            Deploy           Audit            ↑
                                              Délais & incidents
                                              Coût de correction x100
```

**Conséquences concrètes des silos :**
- Délais importants entre l'écriture du code et sa livraison
- Vulnérabilités découvertes trop tard, coût de correction élevé
- Incompréhensions entre équipes, blâme mutuel lors des incidents
- Sécurité perçue comme un obstacle par les développeurs

**Modèle DevSecOps — Le Shift Left :**

```
     SEC intégrée à chaque étape du cycle
          ↓           ↓           ↓
[DESIGN] ──► [DEV] ──► [TEST] ──► [OPS] ──► [PROD]
    ↑_________________feedback loop continu_______↑

Coût de correction d'une vulnérabilité :
  Détectée en design    : 1x
  Détectée en dev       : 10x
  Détectée en test      : 100x
  Détectée en production: 1000x
```

### 2.3 Le Cycle de Vie DevSecOps Complet

```
┌─────────────────────────────────────────────────────────────────────┐
│                   CYCLE DE VIE DEVSECOPS                            │
│                                                                     │
│  PLAN ──► CODE ──► BUILD ──► TEST ──► RELEASE ──► DEPLOY ──► OPERATE│
│   │        │        │        │         │            │          │    │
│ Threat   Secrets  SAST     DAST      Scan img    IaC scan    SIEM  │
│ Model    scan     SCA      Pentest   Checkov     Monitoring  RASP  │
│ STRIDE   Gitleaks Trivy    OWASP ZAP Signature   Grafana     SOC   │
│                                                                     │
│              ◄────────────── feedback continu ──────────────►       │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.4 Les Trois Piliers de la Transformation

**Pilier 1 — Culture :** Sans adoption culturelle, l'outillage ne sert à rien. La clé est de faire comprendre à chaque acteur (Dev, Ops, Sec, Management) que la sécurité est une responsabilité partagée.

**Pilier 2 — Automatisation :** Chaque contrôle manuel est une source d'erreur et un goulot d'étranglement. L'automatisation (pipelines CI/CD, scans de sécurité, déploiements) élimine les tâches répétitives et garantit la reproductibilité.

**Pilier 3 — Mesure :** Ce qui ne se mesure pas ne s'améliore pas. Les métriques DORA et les indicateurs de sécurité permettent de piloter la transformation et de justifier les investissements.

---

## 3. Le Framework CALMS — Colonne Vertébrale de l'Audit

Le framework **CALMS** est le référentiel d'audit de référence pour évaluer la maturité DevSecOps de manière systémique. Chaque pilier est indépendant mais connecté aux autres. <sup>[[1]](#ref-calms)</sup>

```
┌──────────────────────────────────────────────────────────────────────┐
│                      FRAMEWORK CALMS                                 │
├──────┬───────────────────────────────────────────────────────────────┤
│  C   │  CULTURE       → Casser les silos, responsabilité partagée   │
│  A   │  AUTOMATION    → Pipelines CI/CD, IaC, déploiements auto     │
│  L   │  LEAN          → Réduire les gaspillages, fluidifier         │
│  M   │  MEASUREMENT   → Métriques DORA, SLO, dashboards             │
│  S   │  SHARING       → Docs, runbooks, guildes, standards          │
└──────┴───────────────────────────────────────────────────────────────┘
```

### C — Culture (Collaboration & Organisation)

**Définition :** L'état d'esprit DevSecOps repose sur la collaboration transverse, la tolérance à l'erreur constructive et la responsabilité partagée de la sécurité.

**Ce qu'on observe dans une organisation mature :**
- Post-mortems blameless systématiques après chaque incident significatif
- Security Champions actifs au sein des équipes de développement
- Objectifs communs entre équipes Dev, Ops et Sécurité (OKRs partagés)
- La sécurité est perçue comme un catalyseur de qualité, non comme un frein

**Anti-patterns fréquents à détecter lors de l'audit :**
- "C'est la faute de l'autre équipe" → absence de responsabilité partagée
- Déploiements tardifs le vendredi soir → manque de confiance dans l'automatisation
- Tickets sécurité jamais consultés par les développeurs
- "On verra la sécurité à la fin" → culture Cycle en V non transformée

**Exemples concrets d'actions culturelles à recommander :**
- Mise en place de **guildes techniques** inter-équipes (sécurité, CI/CD, data)
- Organisation de sessions **GameDay** — simulation d'incidents réels pour tester la résilience
- Revues régulières d'incidents avec documentation partagée et sans désignation de coupable
- Programme **Security Champions** — former des relais sécurité dans chaque squad

**CALMS & Sauvegardes :** La culture DevSecOps s'applique aussi à la protection des données. Une organisation mature traite les sauvegardes comme un actif critique : procédures documentées, tests réguliers, postmortem systématique après tout échec de restauration.

---

### A — Automation (CI/CD & Infrastructure as Code)

**Définition :** L'automatisation industrialise la livraison logicielle, élimine les erreurs manuelles et garantit la reproductibilité des environnements.

**Indicateurs de maturité à évaluer :**
- Taux de couverture des tests automatisés (unitaires, intégration, end-to-end, sécurité)
- Maturité des pipelines CI/CD : lint → build → test → scan sécurité → deploy
- Usage de l'**Infrastructure as Code** (Terraform, Ansible, Pulumi)
- Présence d'un registre d'artefacts centralisé (Nexus, GitLab Registry)

**Exemple de pipeline CI/CD DevSecOps complet (cible) :**

```yaml
# Pipeline GitLab-CI DevSecOps — Référence universelle
stages:
  - lint           # Vérification syntaxe & secrets (TruffleHog, Gitleaks)
  - build          # Compilation & packaging
  - test-unit      # Tests unitaires (couverture > 80 %)
  - sast           # Analyse statique de sécurité (SonarQube, Semgrep)
  - sca            # Analyse des dépendances (Trivy, OWASP Dependency-Check)
  - iac-scan       # Scan de l'IaC Terraform (Checkov, tfsec)
  - dast           # Tests dynamiques (OWASP ZAP)
  - deploy-staging # Déploiement staging automatisé
  - smoke-test     # Tests de fumée post-déploiement
  - deploy-prod    # Déploiement production (Blue/Green ou Canary)
  - backup-verify  # Vérification automatique de la sauvegarde post-déploiement
```

**Automatisation des sauvegardes (CALMS/A) :** Les sauvegardes manuelles sont des sauvegardes défaillantes. L'automatisation implique :
- Déclenchement automatique selon une politique définie (fréquence, rétention)
- Tests de restauration automatiques périodiques avec rapport de résultat
- Alerting en cas d'échec de sauvegarde ou de dépassement de fenêtre
- Intégration dans le pipeline CI/CD : une sauvegarde est vérifiée avant tout déploiement en production

**Stratégies de déploiement avancées :**

| Stratégie | Description | Cas d'usage recommandé |
|-----------|-------------|------------------------|
| **Blue/Green** | Deux environnements identiques, bascule instantanée | Services critiques (santé, finance, énergie) |
| **Canary** | Déploiement progressif sur un % du trafic | Services à fort trafic (e-commerce, transport) |
| **Rolling Update** | Remplacement progressif pod par pod | Applications tolérantes aux versions mixtes |
| **Feature Flags** | Activation fonctionnelle découplée du déploiement | Toute organisation souhaitant découpler release et livraison |

---

### L — Lean (Optimisation des Flux)

**Définition :** Éliminer les gaspillages dans la chaîne de delivery pour réduire le Time-to-Market tout en maintenant la qualité et la sécurité.

**Indicateurs clés à mesurer :**
- **Lead Time** : durée entre un commit et sa mise en production
- **Nombre de hand-offs manuels** : approbations sécu, validations managériales non automatisables
- **Value Stream Map** : cartographie du flux de valeur de la feature à la production
- **Goulots d'étranglement** : validation sécurité bloquante, environnements indisponibles, processus de livraison manuel

**Exemple Value Stream — Avant / Après transformation DevSecOps :**

```
AVANT (Cycle en V / processus manuel) — Exemple secteur santé :
[Feature] ─► [Dev 3j] ─► [Review 2j] ─► [Tests 1j] ─►
  ─► [Validation DSI 5j] ─► [Recette 3j] ─► [Validation DPO 2j] ─►
  ─► [Déploiement manuel 1j] = ~18 jours

APRÈS (DevSecOps / pipeline automatisé) :
[Feature] ─► [Dev 2j] ─► [CI auto 4h] ─► [Scan sécu 1h] ─►
  ─► [Staging auto] ─► [Tests E2E 2h] ─► [Prod] = ~3 jours
```

**Lean & Sauvegardes :** Appliquer le Lean aux processus de sauvegarde, c'est :
- Éliminer les sauvegardes redondantes non justifiées par la politique de rétention
- Automatiser les tests de restauration plutôt que de les planifier manuellement
- Réduire le RTO (Recovery Time Objective) par des procédures documentées et exercées
- Identifier les goulots d'étranglement dans la chaîne de restauration (bande passante, temps de transfert)

---

### M — Measurement (Indicateurs & KPIs)

**Définition :** Ce qui ne se mesure pas ne s'améliore pas. La mesure permet de piloter la transformation DevSecOps et de justifier les investissements devant la direction.

**Les 4 métriques DORA (standard industrie) :** <sup>[[5]](#ref-dora)</sup>

| Métrique DORA | Définition | Niveau Elite | Niveau Bas |
|---------------|------------|--------------|------------|
| **Deployment Frequency** | Fréquence des déploiements en production | Plusieurs fois/jour | < 1 fois/mois |
| **Lead Time for Changes** | Délai commit → production | < 1 heure | > 6 mois |
| **Change Failure Rate** | % de déploiements causant un incident | < 5 % | > 15 % |
| **Mean Time to Recovery (MTTR)** | Temps de restauration après incident | < 1 heure | > 1 semaine |

**KPIs Sécurité complémentaires :**
- Nombre de vulnérabilités critiques (CVE) détectées / résolues par sprint
- Délai moyen de remédiation des CVE critiques (cible : < 48 h)
- Taux de couverture des tests de sécurité (SAST/DAST) sur les pipelines actifs
- Nombre de secrets détectés en clair dans les dépôts Git (cible : 0)

**KPIs Sauvegardes & Continuité (CALMS/M) :**
- **RPO réel vs RPO cible** : la dernière sauvegarde valide couvre-t-elle la fenêtre de perte acceptable ?
- **RTO réel vs RTO cible** : durée réelle de la dernière restauration vs l'objectif contractualisé
- **Taux de succès des tests de restauration** : cible > 99 %
- **Taux de couverture des actifs sauvegardés** : quel % des systèmes critiques est effectivement sauvegardé et testé ?
- **Nombre d'alertes d'échec de sauvegarde non traitées** : cible = 0

---

### S — Sharing (Partage & Transversalité)

**Définition :** La diffusion de la connaissance brise les silos et crée une intelligence collective autour des bonnes pratiques DevSecOps.

**Indicateurs de maturité :**
- Base de connaissances partagée à jour (Confluence, GitLab Wiki, Notion)
- Security Champions formés, actifs et reconnus dans les squads
- Sessions de partage régulières (Brown Bag Lunch, guildes techniques)
- Templates de pipelines CI/CD partagés et réutilisés à l'échelle de l'organisation
- Playbooks d'incident accessibles à toute l'équipe d'astreinte

**Programme Security Champions :**

```
Rôle du Security Champion :
├── Relais sécurité au sein de son squad
├── Participe aux revues de code avec un œil sécurité
├── Remonte les vulnérabilités identifiées vers l'équipe sécurité
├── Forme ses pairs sur les bonnes pratiques (OWASP, gestion secrets)
└── Participe au comité sécurité mensuel inter-équipes
```

**Sharing & Sauvegardes :** Les procédures de sauvegarde et de restauration doivent être :
- Documentées dans un runbook accessible à toute l'équipe (pas seulement à l'administrateur backup)
- Testées régulièrement en conditions réelles, avec un rapport partagé
- Révisées après chaque incident ou test de restauration infructueux
- Connues de l'équipe de direction (RSSI, DSI, DG) pour la gestion de crise

---

## 4. Diagnostic par Interlocuteur — Questions Clés

L'audit de maturité nécessite des approches différenciées selon le profil de l'interlocuteur. Les questions ci-dessous extraient le maximum d'information utile lors de la phase de diagnostic.

### 4.1 Questionnaire Management

*Objectif : comprendre la vision stratégique, la gouvernance, la tolérance au risque et les enjeux de continuité*

**Culture & Gouvernance :**
- Quelle est la tolérance à l'échec au sein de l'organisation ? Pratiquez-vous les post-mortems blameless ?
- La sécurité est-elle perçue comme un frein à la vélocité ou comme un catalyseur de qualité ?
- Existe-t-il un budget dédié à la dette technique, à la sécurité applicative et à la continuité d'activité ?
- Comment la direction mesure-t-elle le succès d'un sprint ? (vélocité feature vs. qualité vs. sécurité)
- Avez-vous des OKRs liés à la réduction de la dette technique ou à l'amélioration du MTTR ?

**Conformité & Continuité :**
- Êtes-vous soumis à des audits réglementaires sectoriels ? Quels sont les résultats récents ?
- Disposez-vous d'une politique formelle de gestion des vulnérabilités (SLA de remédiation par criticité) ?
- Votre PCA (Plan de Continuité d'Activité) et votre PRA (Plan de Reprise d'Activité) sont-ils à jour et testés ?
- Vos RTO et RPO sont-ils définis, documentés et connus de l'ensemble des parties prenantes ?
- Avez-vous réalisé un test de Disaster Recovery dans les 12 derniers mois ? Avec quels résultats ?

**Organisation & Priorités :**
- Quelle est la roadmap technique des 12 prochains mois ?
- Comment se prennent les décisions d'arbitrage entre fonctionnel, technique et sécurité ?
- Qui est responsable de la sécurité des données et de la continuité opérationnelle ?

---

### 4.2 Questionnaire Développeurs (Dev)

*Objectif : évaluer les pratiques de développement, de test et d'intégration sécurité*

**Qualité & Tests :**
- Quel est le taux de couverture actuel des tests unitaires ? Avez-vous une cible définie ?
- Des tests d'intégration automatisés sont-ils exécutés à chaque commit ?
- Pratiquez-vous le TDD (Test-Driven Development) ou le BDD (Behavior-Driven Development) ?
- Des tests de performance sont-ils automatisés avant chaque mise en production majeure ?

**Sécurité du Code — Shift Left :**
- Des outils SAST (SonarQube, Semgrep) sont-ils intégrés dans votre IDE ou votre pipeline CI ?
- Comment gérez-vous les secrets (tokens, mots de passe, clés API) ? Coffre-fort (HashiCorp Vault) ou variables d'environnement en clair ?
- Vos dépendances (bibliothèques tierces) sont-elles scannées pour détecter des CVE connues (Trivy, OWASP Dependency-Check) ?
- Vos commits sont-ils signés GPG ? Les branches `main`/`release` sont-elles protégées par des règles de merge obligatoires ?
- Utilisez-vous un fichier `.trivyignore` versionné avec justification et date d'expiration pour les exceptions ?

**CI/CD & Collaboration :**
- Avez-vous des pipelines CI opérationnels ? Quelle est la durée moyenne d'un pipeline complet ?
- Y a-t-il des critères de sécurité dans votre Definition of Done ?
- Utilisez-vous des feature flags pour découpler déploiement et activation fonctionnelle ?

---

### 4.3 Questionnaire Opérationnels (Ops)

*Objectif : évaluer l'industrialisation des déploiements, la résilience et l'observabilité*

**Infrastructure & Automatisation :**
- Utilisez-vous l'Infrastructure as Code (Terraform, Ansible, Pulumi) pour provisionner vos environnements ?
- Vos configurations d'infrastructure sont-elles versionnées dans Git (approche GitOps) ?
- Le déploiement en production est-il entièrement automatisé ou nécessite-t-il des interventions manuelles ?
- Disposez-vous d'environnements de staging identiques à la production (environment parity) ?
- Votre tfstate Terraform est-il stocké dans un backend distant sécurisé avec verrou (S3, Azure Blob, GitLab) ?

**Résilience & Continuité :**
- Avez-vous des procédures de rollback automatisées en cas d'échec de déploiement ?
- Quelles stratégies de déploiement utilisez-vous ? (Rolling, Blue/Green, Canary)
- Vos sauvegardes sont-elles automatisées, chiffrées et stockées hors site ?
- Combien de temps a duré votre dernière restauration complète ? Le résultat était-il conforme au RTO ?
- Avez-vous des copies immuables (WORM) de vos sauvegardes critiques pour résister aux ransomwares ?

**Observabilité :**
- Disposez-vous d'un système de monitoring centralisé ? (Prometheus/Grafana, Datadog, Dynatrace)
- Avez-vous des alertes configurées sur les SLO métier (disponibilité, latence) ?
- Les logs applicatifs sont-ils centralisés, structurés (JSON) et horodatés (NTP) ?
- Quel est votre MTTR actuel lors d'un incident en production ?

---

### 4.4 Questionnaire Sécurité (Sec / RSSI)

*Objectif : évaluer l'intégration de la sécurité dans le cycle de vie et la gestion des risques*

**Intégration DevSecOps :**
- La sécurité intervient-elle en début de cycle (conception/design) ou seulement en fin de cycle (recette/audit) ?
- Des scans SAST/DAST sont-ils intégrés nativement dans les pipelines CI/CD ? Qui en est responsable ?
- Utilisez-vous Trivy ou équivalent pour scanner les images Docker et les dépendances à chaque build ? <sup>[[3]](#ref-trivy)</sup>
- Avez-vous des Security Champions identifiés dans les équipes Dev ? Sont-ils formés et actifs ?

**Gestion des Vulnérabilités :**
- Disposez-vous d'un processus de gestion des CVE avec des SLA de remédiation définis par criticité ?
- Comment traitez-vous les vulnérabilités détectées : bloquez-vous le pipeline ou créez-vous un ticket ?
- Utilisez-vous l'OWASP Top 10 comme référentiel pour vos audits applicatifs ? <sup>[[4]](#ref-owasp)</sup>
- Les tests de pénétration (pentest) sont-ils réalisés régulièrement ? Avec quelle fréquence ?

**Conformité, Traçabilité & Continuité :**
- Disposez-vous d'un SIEM opérationnel pour la corrélation des événements de sécurité ?
- Les logs sont-ils horodatés NTP et conservés selon les exigences réglementaires applicables ?
- Vos sauvegardes sont-elles chiffrées (AES-256) au repos et en transit ?
- Les clés de chiffrement des sauvegardes sont-elles stockées séparément des données sauvegardées (HSM, KMS) ?
- Les sauvegardes sont-elles testées régulièrement ? Disposez-vous de preuves documentées des tests de restauration ?

---

## 5. Sécurité Intégrée — Shift Left & Outils

### 5.1 Les 4 Niveaux d'Analyse de Sécurité Applicative

La stratégie **Shift Left** déplace les contrôles de sécurité vers la gauche du cycle de vie. <sup>[[1]](#ref-calms)</sup>

```
IDE          SCM          CI Pipeline           Staging          Production
 |            |                |                   |                 |
[IDE Plugin]─[Pre-commit]─[SAST+SCA+IaC]─[DAST+Pentest]─[RASP+SIEM+WAF]
 ↑ Coût de correction :
   1x          10x              100x               1000x            ∞
```

| Analyse | Définition | Outils de référence | Déclencheur |
|---------|-----------|---------------------|-------------|
| **SAST** | Analyse du code source sans exécution — injections, XSS, secrets hardcodés | SonarQube, Semgrep, Gitleaks, TruffleHog | Chaque commit (pre-commit + CI) |
| **SCA** | Vulnérabilités CVE dans les librairies tierces — Supply Chain | Trivy, OWASP Dependency-Check, Snyk | Chaque build |
| **DAST** | Tests sur application en exécution — XSS, CSRF, mauvaises configs HTTP | OWASP ZAP, Burp Suite Enterprise | Après déploiement staging |
| **IaC Security** | Scan fichiers Terraform/K8s avant provisionnement | Checkov, tfsec, kube-score | Avant `terraform apply` |

#### A. SAST — Static Application Security Testing <sup>[[1]](#ref-calms) [[4]](#ref-owasp)</sup>

**Exemple d'intégration pipeline :**
```yaml
sast-scan:
  stage: sast
  image: semgrep/semgrep
  script:
    - semgrep --config=auto --error .
  allow_failure: false  # Bloque le pipeline si vulnérabilité critique
```

#### B. SCA — Software Composition Analysis <sup>[[3]](#ref-trivy) [[4]](#ref-owasp)</sup>

> **Note critique sur Trivy :** La release v0.69.4 de Trivy a subi une compromission de supply chain. Il est impératif de vérifier la signature des binaires Trivy via les checksums officiels et de toujours utiliser des versions épinglées et validées dans vos pipelines. Cette anecdote illustre l'importance de la **Supply Chain Security** même pour les outils de sécurité eux-mêmes. <sup>[[3]](#ref-trivy)</sup>

```yaml
sca-trivy:
  stage: sca
  image: aquasec/trivy:0.50.0  # Version épinglée et validée
  script:
    - trivy fs --exit-code 1 --severity CRITICAL,HIGH .
    - trivy image --exit-code 1 --severity CRITICAL $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
```

**Processus de traitement d'une CVE CRITICAL détectée :**

```
ÉTAPE 1 — QUALIFICATION (< 15 min)
  ├── Identifier précisément la CVE (NVD, MITRE)
  ├── Vérifier si la vulnérabilité est exploitable dans notre contexte
  └── Score CVSS > 9 → escalade immédiate

ÉTAPE 2 — ÉVALUATION DE L'EXPLOITABILITÉ (< 30 min)
  ├── La faille est-elle dans une dépendance directe ou transitive ?
  ├── L'application expose-t-elle le vecteur d'attaque ?
  └── Existe-t-il un exploit public (ExploitDB, GitHub) ?

ÉTAPE 3 — DÉCISION
  ├── Exploitable + exposition externe → ISOLATION immédiate
  ├── Exploitable + réseau interne    → Restriction + patch < 24h
  └── Non exploitable dans notre contexte → Exception tracée + patch planifié

ÉTAPE 4 — REMÉDIATION ET DÉPLOIEMENT
  ├── Mise à jour de la dépendance vulnérable
  ├── Rebuild + re-scan Trivy (vérifier la disparition de la CVE)
  └── Pipeline complet : build → scan → test → déploiement
```

#### C. DAST — Dynamic Application Security Testing <sup>[[4]](#ref-owasp)</sup>

**Outils recommandés :**
- **OWASP ZAP** : référence open-source, intégrable en pipeline CI/CD
- **Burp Suite Enterprise** : solution professionnelle pour les tests approfondis

#### D. IaC Security — Sécurité de l'Infrastructure as Code <sup>[[7]](#ref-checkov)</sup>

```yaml
checkov-scan:
  stage: security
  image: bridgecrew/checkov:latest
  script:
    - checkov -d . --framework terraform
              --output cli --output junitxml
              --output-file-path console,checkov-report.xml
  allow_failure: false
```

### 5.2 Gestion des Secrets

**Règles d'hygiène impératives :**
- Activer les **pre-commit hooks** (TruffleHog/Gitleaks) sur tous les dépôts
- Protéger les branches `main` et `release/*` (pas de push direct, MR obligatoire)
- Signer les commits Git avec une clé GPG (traçabilité, non-répudiation)
- Rotation automatique des credentials toutes les 90 jours maximum
- Aucun secret en clair dans les fichiers de configuration versionnés

**Architecture cible de gestion des secrets :**

```
┌──────────────────────────────────────────────────────┐
│               Coffre-fort centralisé                 │
│  (HashiCorp Vault / AWS Secrets Manager / Azure KV)  │
│  ┌─────────────┬──────────────┬────────────────────┐ │
│  │  DB Secrets │  API Keys    │  TLS Certs / PKI   │ │
│  └──────┬──────┴──────┬───────┴─────────┬──────────┘ │
│         │             │                 │            │
└─────────┼─────────────┼─────────────────┼────────────┘
          ↓             ↓                 ↓
    [Dev Squads]  [CI/CD Pipeline]  [Ops Infra]
    (dynamique)    (short-lived)    (rotation auto)
```

### 5.3 OWASP Top 10 — Gestion du Cycle de Vie Applicatif <sup>[[4]](#ref-owasp)</sup>

| Rang OWASP | Risque | Exemple d'impact sectoriel | Contrôle recommandé |
|------------|--------|---------------------------|---------------------|
| **A01** | Broken Access Control | Accès non autorisé aux dossiers patients (santé) ou comptes clients (banque) | Least Privilege, revue des IAM trimestrielle |
| **A02** | Cryptographic Failures | Exposition des données PII en transit ou au repos | TLS 1.3 obligatoire, AES-256 at rest |
| **A03** | Injection (SQL, NoSQL, LDAP) | Corruption des données contractuelles ou médicales | Requêtes préparées, WAF, SAST obligatoire |
| **A06** | Vulnerable Components | Exploitation via librairies outdatées | SCA Trivy/Dependency-Check dans CI |
| **A09** | Security Logging & Monitoring | Incident non détecté sur données sensibles | SIEM, alertes temps réel, rétention réglementaire |

---

## 6. Analyse des Risques — CIA & STRIDE

### 6.1 Triptyque CIA — Confidentialité, Intégrité, Disponibilité

**Formule de risque :**

```
Risque = Menace × Vulnérabilité × Impact
```

**Niveaux d'impact par type de données :**

| Type de donnée | Confidentialité | Intégrité | Disponibilité | Niveau de Risque |
|----------------|----------------|-----------|---------------|-----------------|
| Données personnelles (PII) | Maximale | Maximale | Haute | **Critique** |
| Données médicales (DMS) | Maximale | Maximale | Maximale | **Critique** |
| Données financières | Maximale | Maximale | Haute | **Critique** |
| Données industrielles critiques | Haute | Maximale | Maximale | **Critique** |
| Pipelines CI/CD | Moyenne | Haute | Haute | **Élevé** |
| Configurations d'infrastructure | Haute | Maximale | Moyenne | **Élevé** |
| Données de sauvegarde | **Maximale** | **Maximale** | **Haute** | **Critique** |

> **Note :** Les données de sauvegarde héritent du niveau de criticité des données qu'elles contiennent. Une sauvegarde non chiffrée de données médicales est un actif de niveau Critique qui expose l'ensemble du patrimoine informationnel.

### 6.2 Modèle STRIDE — Threat Modeling <sup>[[6]](#ref-stride)</sup>

Le modèle **STRIDE** identifie les menaces dès la phase de conception (Security by Design).

| Menace STRIDE | Propriété Violée | Scénario universel | Contre-mesure |
|---------------|-----------------|-------------------|---------------|
| **S**poofing (Usurpation) | Authentification | Usurpation d'identité pour accéder aux systèmes critiques | MFA obligatoire, Zero Trust, mTLS |
| **T**ampering (Altération) | Intégrité | Modification non autorisée de données critiques ou de configuration | Signature numérique, hash, contrôles d'accès stricts |
| **R**epudiation | Non-répudiation | Impossibilité de prouver qu'une action a été réalisée (conformité réglementaire) | SIEM, logs NTP, signature des commits GPG |
| **I**nformation Disclosure | Confidentialité | Fuite de données PII via API non sécurisée ou sauvegarde non chiffrée | TLS 1.3, chiffrement AES-256, masquage PII dans les logs |
| **D**enial of Service | Disponibilité | Attaque sur les APIs critiques ou le système de sauvegarde | WAF, rate limiting, autoscaling, copies immuables |
| **E**levation of Privilege | Autorisation | Escalade de privilèges dans les pipelines CI/CD ou les accès backup | Least Privilege, RBAC, audit trimestriel |

---

## 7. Gestion des Incidents & Postmortems

### 7.1 Cycle de Vie Complet d'un Incident <sup>[[2]](#ref-incident)</sup>

```
 1. DÉTECTION     → Monitoring, alerte SIEM, ticket utilisateur
        │
 2. QUALIFICATION → Est-ce P1/P2/P3/P4 ? Quel périmètre impacté ?
        │
 3. ESCALADE      → Qui est prévenu ? (on-call, lead, management, métier, RSSI)
        │
 4. DIAGNOSTIC    → Quelle est la cause ? (logs, métriques, traces distribuées)
        │
 5. RÉSOLUTION    → Rollback ? Patch ? Redémarrage ? Bascule PCA ?
        │
 6. COMMUNICATION → Mise à jour des parties prenantes (page de statut, email)
        │
 7. CLÔTURE       → Confirmation de résolution, fermeture des alertes
        │
 8. POSTMORTEM    → Analyse blameless des causes + actions correctives
        │
 9. AMÉLIORATION  → Implémentation des actions, suivi dans le backlog
```

**Niveaux de sévérité (universels) :**

| Sévérité | Définition | Exemple multiSecteur | Délai de réponse |
|----------|-----------|----------------------|-----------------|
| **P1 — Critique** | Service critique totalement indisponible ou violation de données | Système de paiement / DPI médical / SCADA inaccessible | < 15 minutes |
| **P2 — Haute** | Dégradation majeure de service | Latence élevée, perte partielle de fonctionnalités | < 1 heure |
| **P3 — Moyenne** | Fonctionnalité partielle impactée | Rapport non généré, délai de traitement allongé | < 4 heures |
| **P4 — Basse** | Impact mineur, contournement possible | Anomalie cosmétique, log d'erreur non bloquant | < 48 heures |

### 7.2 Postmortem Blameless — Template de Référence

> Le postmortem blameless ne cherche pas le coupable — il cherche les causes systémiques. Si l'erreur d'une seule personne peut provoquer un incident P1, c'est que le système n'est pas suffisamment résilient.

**Structure standardisée du postmortem :**

```
## POSTMORTEM — [Titre de l'incident] — [Date]

### 1. Résumé exécutif (5 lignes max)
### 2. Chronologie des événements (horodatée)
### 3. Cause racine (Root Cause Analysis — méthode 5 Whys)
### 4. Impact (utilisateurs, durée, SLA/SLO impactés)
### 5. Ce qui a bien fonctionné
### 6. Ce qui aurait pu être amélioré
### 7. Actions correctives
   | Action              | Responsable | Deadline | Statut |
   | Ajouter alerte X    | Prénom N.   | JJ/MM    | TODO   |
   | Rédiger runbook Y   | Prénom N.   | JJ/MM    | TODO   |
### 8. Métriques clés (MTTD / MTTR / Impact utilisateurs)
```

### 7.3 Mise en Situation — Incident P1 : Panne Applicative

```
14:37 — DÉTECTION
  → Alerte reçue : HTTP 503 sur l'API principale
  → Dashboard SLO : taux d'erreur à 98 %, SLO burn rate critique

14:38 — QUALIFICATION
  → Test rapide : curl https://app/api/health → Connection refused
  → Incident réel, qualifié P1 → escalade immédiate

14:39 — ESCALADE
  → Notification canal #incident-p1 (Slack/Teams)
  → Lead technique, product owner, management prévenus
  → Page de statut mise à jour : "Incident en cours d'investigation"

14:40 — DIAGNOSTIC (entonnoir : du plus probable au moins probable)
  → kubectl get pods → 3 pods en CrashLoopBackOff depuis 14h35
  → kubectl logs --previous → java.lang.OutOfMemoryError: Java heap space
  → Corrélation : déploiement effectué à 14h30
  → Hypothèse : le nouveau déploiement a introduit une fuite mémoire

14:45 — RÉSOLUTION → Décision : ROLLBACK
  → kubectl rollout undo deployment/app
  → Attendre que les pods soient Ready (readinessProbe)
  → Taux d'erreur revient à 0 % → service restauré

14:52 — STABILISATION ET COMMUNICATION
  → Surveillance renforcée 30 min
  → Page de statut : "Incident résolu — durée d'impact : 15 min"
  → Email de synthèse aux parties prenantes

J+1 — POSTMORTEM BLAMELESS
  → Cause racine : fuite mémoire dans la v2.3.1
  → Tests de charge staging insuffisants vs charge réelle prod
  → Actions : ajouter test de charge CI (k6/Gatling), alerte JVM mémoire
```

### 7.4 Ateliers GameDay — Scénarios de Simulation

| Scénario | Description | Compétence testée |
|----------|-------------|-------------------|
| Fuite de secrets | Injection d'un faux secret dans un commit Git | Détection TruffleHog + révocation credentials |
| Déni de Service | Montée en charge extrême sur les APIs | Autoscaling, WAF, alertes Grafana |
| Compte compromis | Tentative d'accès avec credentials volés | SIEM, alertes, procédure de blocage |
| Rollback d'urgence | Déploiement d'une version buguée | Rollback auto, MTTR < 1h |
| **Perte de sauvegarde** | Simulation d'une corruption de backup | Procédure de restauration depuis copie secondaire |
| **Ransomware** | Chiffrement simulé de données de production | PRA, isolation, restauration depuis copie immuable |

---

## 8. Sauvegardes & Restauration — Règle 3-2-1-1-0 & CALMS

La gestion des sauvegardes est un composant critique de la maturité DevSecOps. Une organisation qui maîtrise ses pipelines CI/CD mais dont les sauvegardes ne sont pas testées n'est pas mature. Les sauvegardes s'inscrivent dans chacun des piliers CALMS.

### 8.1 Concepts Fondamentaux — RTO et RPO

Les objectifs de récupération doivent être définis par le métier, validés par la direction, et mesurés régulièrement par les équipes techniques.

```
          Sinistre survient             Service restauré
               │                              │
───────────────┼──────────────────────────────┼──────────► temps
               │◄──────────── RTO ───────────►│
               │         (ex: 4h maximum)
               │
   Dernière sauvegarde saine
               │◄── RPO ──►│  Sinistre
                   (ex: 2h de données perdues au maximum)

RTO (Recovery Time Objective) = durée maximale d'interruption acceptable
RPO (Recovery Point Objective) = quantité de données maximale pouvant être perdue
```

**Exemples de RTO/RPO par secteur :**

| Secteur | Système | RTO cible | RPO cible |
|---------|---------|-----------|-----------|
| Banque | Système de paiement | < 15 min | < 1 min (réplication synchrone) |
| Santé | Dossier Patient Informatisé | < 4h | < 1h |
| Transport | Système de billettique | < 1h | < 15 min |
| Énergie (OIV) | SCADA / supervision | < 30 min | < 5 min |
| Éducation | ENT / plateforme e-learning | < 24h | < 4h |
| Industrie | ERP / MES | < 8h | < 2h |

> **Règle absolue :** Le RTO et le RPO ne sont pas des valeurs techniques — ce sont des engagements business. Ils doivent être définis par les responsables métier, validés par la direction, et inscrits dans les SLA/PRA.

### 8.2 La Règle 3-2-1-1-0 — Standard de Référence

La règle **3-2-1-1-0** est le standard industrie pour une stratégie de sauvegarde robuste face aux ransomwares, aux sinistres et aux erreurs humaines.

```
3  Copies des données
│
├── La copie de PRODUCTION (les données en temps réel)
├── La copie PRIMAIRE (sauvegarde locale, restauration rapide)
└── La copie SECONDAIRE (sauvegarde externe, protection sinistre)

  2  Supports différents (technologie différente = risque différent)
  │
  ├── Exemple 1 : Disque NAS + Bande magnétique LTO
  ├── Exemple 2 : Disque NAS + Stockage Object Cloud
  └── Exemple 3 : Disque local + Disque externe déporté

    1  Copie hors site (géographiquement distincte)
    │
    ├── Autre datacenter (distance > 50 km recommandée)
    ├── Cloud sécurisé (SecNumCloud ANSSI, HDS pour la santé)
    └── Coffre externe agréé pour les sauvegardes sur bande

      1  Copie immuable ou air-gapped (anti-ransomware)
      │
      ├── Immuable (WORM) : aucun acteur ne peut modifier/supprimer
      │   pendant la période de rétention — même un admin compromis
      └── Air-gapped : déconnectée du réseau, inaccessible en ligne
          (bande magnétique hors site, coffre physique)

        0  Erreur = sauvegardes prouvées valides par tests de restauration
           │
           └── C'est le "0" le plus important :
               Une sauvegarde non testée est une promesse non tenue.
               Des tests réguliers, documentés et archivés sont obligatoires.
```

**Pourquoi chaque composant est essentiel :**

| Composant | Protection contre | Sans ce composant |
|-----------|------------------|-------------------|
| 3 copies | Perte d'une copie unique | Une erreur de manipulation et tout est perdu |
| 2 supports | Défaillance d'un type de support | Une panne NAS détruit toutes les sauvegardes |
| 1 hors site | Sinistre physique (incendie, inondation) | Un sinistre au datacenter efface production ET sauvegardes |
| 1 immuable/air-gapped | Ransomware, admin malveillant | Le ransomware chiffre aussi les sauvegardes connectées |
| 0 erreur | Faux sentiment de sécurité | On découvre l'échec de restauration en pleine crise |

### 8.3 Les Méthodes de Sauvegarde

| Méthode | Principe | RTO | RPO | Stockage | Usage recommandé |
|---------|---------|-----|-----|----------|-----------------|
| **Full** | Copie complète de toutes les données | Court (tout est là) | = fréquence de la full | Lourd | Hebdomadaire, systèmes critiques |
| **Incrémentale** | Changements depuis la dernière sauvegarde | Long (chaîne à reconstruire) | = fréquence de l'incrémentale | Léger | Quotidien, complémentaire de la full |
| **Différentielle** | Changements depuis le dernier Full | Moyen | = fréquence de la différentielle | Moyen (croissant) | Bon compromis RTO/stockage |
| **Snapshot** | Photo instantanée (VM, LUN, volume) | Très court | Court | Variable | Rollback rapide, test environnement |
| **CDP** | Continuous Data Protection (quasi temps réel) | Très court | Quasi nul | Lourd | Systèmes transactionnels critiques |
| **Réplication** | Copie synchrone/asynchrone en continu | Très court | Court à nul | Lourd | PRA / Site secondaire |

> **⚠️ Avertissement critique :** La réplication N'EST PAS une sauvegarde. La réplication copie aussi les suppressions accidentelles et les corruptions. Si un ransomware chiffre les données primaires, la réplication propage immédiatement le chiffrement vers le site secondaire. Une vraie sauvegarde permet de revenir à un point dans le temps antérieur au sinistre.

### 8.4 Chiffrement et Intégrité des Sauvegardes

**Chiffrement obligatoire — Deux niveaux :**

```
AES-256 — Standard de chiffrement militaire, recommandation ANSSI

├── Au repos (at rest)   : données chiffrées sur le support de sauvegarde
│   → Même si le support est volé, les données sont illisibles
│
└── En transit (in flight): données chiffrées pendant le transfert
    → TLS 1.3 minimum pour tout transfert réseau des sauvegardes

Gestion des clés (point critique absolu !) :
├── HSM (Hardware Security Module) : coffre physique pour les clés maîtres
├── KMS cloud (AWS KMS, Azure Key Vault, GCP KMS)
└── RÈGLE ABSOLUE : la clé de déchiffrement NE DOIT PAS être
    stockée sur le même support que les données sauvegardées.
    (Une sauvegarde chiffrée dont la clé est perdue = données perdues)
```

**Vérification de l'intégrité :**
- Calcul de checksums (SHA-256) à la création de la sauvegarde
- Vérification périodique des checksums pour détecter les corruptions silencieuses
- Tests de déchiffrement automatiques pour valider que les clés sont disponibles
- Outils automatiques : VEEAM SureBackup, CommVault Automated Recovery Testing

### 8.5 Les Sauvegardes à Travers le Prisme CALMS

**C — Culture :**
- La direction doit comprendre et valider les RTO/RPO — ce sont des engagements business
- Les procédures de restauration sont connues de toute l'équipe, pas seulement de l'administrateur backup
- Chaque test de restauration échoué donne lieu à un postmortem blameless
- L'organisation considère la sauvegarde comme un actif critique, pas comme une formalité

**A — Automation :**
- Les sauvegardes sont entièrement automatisées selon une politique définie (fréquence, rétention)
- Les tests de restauration sont automatisés (VEEAM SureBackup, CommVault ART) avec rapport
- Le pipeline CI/CD déclenche automatiquement une vérification de sauvegarde avant déploiement critique
- Les alertes en cas d'échec de sauvegarde sont automatiques et traitées comme des alertes P2

**L — Lean :**
- Les sauvegardes redondantes non justifiées par la politique de rétention sont éliminées
- Le processus de restauration est documenté et optimisé pour atteindre le RTO cible
- Les goulots d'étranglement (bande passante, fenêtre de sauvegarde trop longue) sont identifiés et traités
- Les fenêtres de sauvegarde sont planifiées aux heures creuses pour ne pas impacter les performances

**M — Measurement :**
- RPO réel vs RPO cible mesuré et rapporté chaque mois
- RTO réel mesuré lors des tests de restauration (pas seulement estimé)
- Taux de succès des sauvegardes et des tests de restauration (dashboard dédié)
- Couverture des actifs sauvegardés (quel % des systèmes critiques est effectivement protégé ?)
- Alerte si un actif critique n'a pas été sauvegardé depuis plus de X heures

**S — Sharing :**
- Runbook de restauration documenté, versionné et accessible à toute l'équipe d'astreinte
- Résultats des tests de restauration partagés avec la direction (RSSI, DSI, DG)
- Procédures de crise (ransomware, sinistre) connues et exercées par l'ensemble des parties prenantes
- Matrice de contacts pour chaque scénario de crise (qui appelle qui, dans quel ordre)

### 8.6 Outils de Sauvegarde de Référence

| Critère | VEEAM Backup & Replication | CommVault Complete Backup & Recovery |
|---------|--------------------------|--------------------------------------|
| **Point fort** | Très performant sur VMware/Hyper-V et cloud, interface intuitive | Périmètre très large (DB, applis, cloud, bande), idéal enterprise |
| **Immuabilité** | Veeam Hardened Repository (Linux XFS), S3 Object Lock | DataDomain WORM, S3 Object Lock, cibles cloud |
| **Air-gap** | Veeam Hardened Repository déconnecté, bande | Bande magnétique hors site, coffre externe |
| **Test auto** | SureBackup (démarrage VM sauvegardée en labo isolé) | Automated Recovery Testing |
| **Environnement** | Virtualisé, cloud hybride, Kubernetes | Enterprise multi-plateforme (Linux, Windows, DB, SaaS) |
| **Chiffrement** | AES-256 au repos et en transit | AES-256 au repos et en transit, HSM support |

### 8.7 Scénario de Crise — Attaque Ransomware : Procédure de Réponse

```
PHASE 1 — CONFINEMENT IMMÉDIAT (0 à 30 min)
  ├── Isoler les systèmes compromis du réseau (VLAN de quarantaine)
  │   → Ne pas éteindre (préserve les preuves forensiques en mémoire)
  ├── Identifier le patient zéro (premier système compromis)
  ├── Évaluer la portée : quels systèmes sont touchés ? Quelles données ?
  ├── Activer la cellule de crise (DSI, RSSI, DG, Juridique, Communication)
  └── Notifier les autorités compétentes selon le secteur :
      → OIV / OSE : ANSSI (obligation LPM/NIS2)
      → Données personnelles : CNIL (si violation de données RGPD)
      → Santé : ANS (Agence du Numérique en Santé)

PHASE 2 — ÉVALUATION (30 min à 2h)
  ├── Les sauvegardes immuables/air-gapped sont-elles intactes ?
  │   → Vérifier physiquement l'isolation des copies WORM
  ├── Identifier la souche du ransomware (ID Ransomware, logs SIEM)
  ├── Évaluer le RPO réel : quelle est la dernière sauvegarde saine ?
  ├── Évaluer le RTO réel : combien de temps pour restaurer les systèmes critiques ?
  └── Décision de payer la rançon : JAMAIS sans avis ANSSI / Juridique
      (le paiement ne garantit pas la récupération et finance les attaquants)

PHASE 3 — RESTAURATION (selon RTO)
  ├── Restaurer en priorité selon la criticité des systèmes (plan documenté)
  ├── Restaurer UNIQUEMENT depuis les sauvegardes immuables sur des systèmes propres
  │   → JAMAIS sur les systèmes compromis sans réinstallation complète
  ├── Valider l'intégrité des données restaurées (checksums, tests fonctionnels)
  └── Reconnexion progressive au réseau après validation de chaque système

PHASE 4 — POST-INCIDENT
  ├── Analyse forensique : comment le ransomware est-il entré ?
  │   (vecteur initial : phishing, VPN non patché, credential volé, supply chain)
  ├── Rapport d'incident complet (ANSSI, direction, assurance cyber)
  ├── Combler les failles : patch, segmentation réseau, MFA, détection EDR
  └── Révision du PRA/PCA : améliorer les procédures, revoir les RTO/RPO
```

### 8.8 Questionnaire Audit — Sauvegardes & Continuité

**Pour le Management :**
- Vos RTO et RPO sont-ils formalisés, validés par la direction et contractualisés dans le PRA ?
- Avez-vous réalisé un test de Disaster Recovery complet dans les 12 derniers mois ?
- Votre organisation dispose-t-elle d'une assurance cyber couvrant les incidents ransomware ?
- La procédure de crise est-elle connue de la direction et exercée régulièrement ?

**Pour les Opérationnels (Ops) :**
- Vos sauvegardes respectent-elles la règle 3-2-1-1-0 ?
- Disposez-vous de copies immuables (WORM) ou air-gapped de vos données critiques ?
- Les sauvegardes sont-elles chiffrées (AES-256) au repos et en transit ?
- Les clés de chiffrement sont-elles stockées séparément des données sauvegardées ?
- Quand a eu lieu votre dernier test de restauration complet ? Résultat documenté ?

**Pour la Sécurité (Sec / RSSI) :**
- Les comptes d'accès aux systèmes de sauvegarde disposent-ils du MFA ?
- Vos sauvegardes sont-elles incluses dans le périmètre de votre SIEM (alertes sur accès anormaux) ?
- Existe-t-il des tests de restauration automatiques avec rapport de résultat archivé ?
- La politique de rétention des sauvegardes est-elle documentée et conforme aux exigences réglementaires ?

---

## 9. Monitoring, Observabilité & SIEM

### 9.1 Supervision vs Observabilité

```
SUPERVISION (ce qu'on savait mesurer à l'avance)
  → "Le CPU est à 90 %" / "Le service est UP ou DOWN"
  → Alertes binaires prédéfinies — orienté ressources

OBSERVABILITÉ (comprendre un système qu'on ne connaissait pas)
  → "Pourquoi cette requête est-elle lente pour cet utilisateur ?"
  → Corrélation Logs + Métriques + Traces — orienté comportement
```

### 9.2 Les 4 Golden Signals (SRE Google)

| Signal | Définition | Exemple multiSecteur | Seuil d'alerte |
|--------|-----------|----------------------|----------------|
| **Latence** | Temps de traitement des requêtes | Temps de réponse API critique | P95 > 500 ms |
| **Trafic** | Volume de requêtes par seconde | Consultations de données sensibles | Variation > ±30 % |
| **Erreurs** | Taux de requêtes en échec | % d'erreurs 5xx sur les APIs | > 1 % sur 5 min |
| **Saturation** | Niveau d'utilisation des ressources | CPU/Mémoire des pods Kubernetes | > 80 % pendant 5 min |

### 9.3 Stack d'Observabilité Recommandée

```
Applications ──► [OpenTelemetry Collector]
                          │
         ┌────────────────┼────────────────┐
         ↓                ↓                ↓
   [Prometheus]      [Loki / ELK]    [Jaeger / Tempo]
   (Métriques)          (Logs)          (Traces)
         │                │                │
         └────────────────┼────────────────┘
                          ↓
                    [Grafana Dashboards]
                          │
                    [PagerDuty / OpsGenie]
                    (Alerting & On-Call)
```

**Dashboards à créer en priorité :**
- **Dashboard Métier :** Disponibilité des services critiques, taux de succès des transactions
- **Dashboard CI/CD (DORA) :** Deployment Frequency, Lead Time, Change Failure Rate, MTTR
- **Dashboard Sécurité :** Vulnérabilités détectées/résolues, alertes SIEM, accès non autorisés
- **Dashboard Sauvegardes :** Taux de succès des sauvegardes, RPO réel, résultats des tests de restauration

### 9.4 SIEM — Cas d'Usage Prioritaires

**Sources d'événements à intégrer :**
- Logs des applications et APIs critiques
- Logs des accès aux données (traçabilité RGPD Art. 30, conformité sectorielle)
- Logs des pipelines CI/CD (builds, déploiements, accès aux secrets)
- Logs du système de sauvegarde (succès, échecs, accès, modifications de politique)
- Logs des équipements réseau (firewall, load balancer, WAF)
- Logs des systèmes d'authentification (IAM, SSO, MFA, Active Directory)

**Règles de corrélation SIEM prioritaires :**

| Cas d'usage SIEM | Sources | Criticité |
|-----------------|---------|-----------|
| Accès anormal à des données sensibles (hors horaires) | Logs appli + IAM | P1 — Immédiat |
| Volume inhabituel d'exports de données (exfiltration) | Logs API + réseau | P1 — Immédiat |
| Tentatives de brute force sur les APIs | WAF + Logs auth | P2 — Haute |
| Accès inattendu au système de sauvegarde | Logs backup + IAM | P1 — Immédiat |
| Modification de la politique de sauvegarde | Logs backup | P2 — Haute |
| Déploiement CI/CD corrélé à une dégradation | Pipeline logs + Grafana | P2 — Haute |

### 9.5 SLO / SLI — Contrats de Service

**Hiérarchie SLI → SLO → SLA :**

```
SLI (ce qu'on MESURE)   → latence P99 = 230 ms en temps réel
SLO (ce qu'on VISE)     → latence P99 < 400 ms sur 99,9 % du temps
SLA (ce qu'on PROMET)   → disponibilité ≥ 99,5 % par mois (contractuel)
Règle : SLO plus strict que SLA = marge de manœuvre (error budget)
```

| Service | SLI (indicateur) | SLO (objectif) | Error Budget mensuel |
|---------|-----------------|----------------|----------------------|
| APIs critiques | Disponibilité | 99,95 % | 21,9 min d'indisponibilité max |
| Système de sauvegarde | Taux de succès sauvegardes | > 99,9 % | < 0,1 % d'échecs |
| Restauration (tests auto) | Taux de succès restaurations | > 99 % | — |
| Pipeline CI/CD | Taux de succès builds | > 95 % | — |

---

## 10. Feuille de Route — Lots 1 & 2

### 10.1 Lot 1 — Diagnostic & Feuille de Route (Semaines 1-8)

| Phase | Semaines | Actions clés | Livrables |
|-------|----------|-------------|-----------|
| **Cadrage** | S1–S2 | Kick-off, collecte documentaire, validation du périmètre et des RTO/RPO | Document de cadrage, périmètre validé |
| **Interviews** | S2–S4 | Entretiens croisés par persona (Dev/Ops/Sec/Management) | Synthèse, matrice maturité CALMS |
| **Analyse Technique** | S3–S5 | Audit pipelines CI/CD, IaC Checkov, pratiques sécurité, sauvegardes | Rapport vulnérabilités, cartographie outils |
| **Scoring** | S5–S6 | Notation CALMS par pilier, benchmark DORA <sup>[[5]](#ref-dora)</sup>, analyse des gaps (DSOMM <sup>[[8]](#ref-dsomm)</sup>) | Radar maturité, scoring |
| **Roadmap** | S6–S8 | Priorisation, estimation charge, plan d'action 12 mois | Roadmap priorisée, Dashboard KPIs, support restitution |

**Livrables Lot 1 :**
- Rapport de diagnostic complet (forces, faiblesses, risques, état des sauvegardes)
- Radar de maturité DevSecOps — scoring CALMS par pilier et par équipe
- Dashboard de KPIs DORA — baseline mesurée
- Feuille de route priorisée sur 12 mois
- Support de restitution management

### 10.2 Lot 2 — Accompagnement & Mise en Œuvre (Semaines 9-24)

**Ateliers proposés :**

| Atelier | Durée | Public cible | Objectif |
|---------|-------|-------------|---------|
| **Value Stream Mapping** | 1 journée | Dev + Ops + Sec | Cartographier le flux, identifier les gaspillages |
| **GameDay / Chaos Engineering** | 1 journée | Ops + Sec | Tester la résilience (y compris restauration) |
| **Workshop IaC Security** | 2 jours | Dev + Ops | Sécuriser les templates Terraform avec Checkov |
| **Formation DevSecOps** | 3 jours | Tous | SAST/DAST/SCA, OWASP Top 10, STRIDE |
| **Security Champions Program** | Formation continue | Dev référents | Former les relais sécurité dans les squads |
| **DORA Metrics Workshop** | 1 journée | Management + Ops | Dashboards et métriques DORA |
| **Atelier Sauvegardes & PRA** | 1 journée | Ops + Sec + Management | Règle 3-2-1-1-0, tests restauration, procédures crise |

**Chantiers techniques prioritaires (Lot 2) :**

1. **Standardisation des pipelines CI/CD**
   - Créer un template GitLab-CI de référence intégrant SAST + SCA + IaC scan
   - Définir une Definition of Done incluant les critères de sécurité
   - Mettre en place un registre d'artefacts centralisé avec politique de rétention

2. **Implémentation du Shift Left sécurité**
   - Déployer TruffleHog en pre-commit hook sur tous les dépôts
   - Intégrer Trivy dans chaque pipeline pour les images Docker et dépendances
   - Déployer SonarQube/Semgrep pour l'analyse SAST continue

3. **Mise en conformité des sauvegardes (règle 3-2-1-1-0)**
   - Auditer les sauvegardes existantes selon la matrice 3-2-1-1-0
   - Mettre en place des copies immuables (WORM) pour les données critiques
   - Automatiser les tests de restauration avec rapport mensuel
   - Intégrer les métriques de sauvegarde dans le dashboard Grafana

4. **Observabilité complète**
   - Déployer la stack Prometheus/Grafana avec dashboards DORA, métier et sauvegardes
   - Configurer le SIEM avec les cas d'usage prioritaires (y compris alertes backup)
   - Définir et instrumenter les SLO pour les services critiques

5. **Programme Security Champions**
   - Identifier 1-2 Security Champions par squad
   - Former sur OWASP Top 10, STRIDE, gestion des secrets, sauvegardes sécurisées
   - Créer une communauté de pratique dédiée (canal Slack/Teams)

---

## 11. Recommandations & Différenciation

### 11.1 Axes de Différenciation d'une Offre d'Audit

| Axe | Positionnement | Valeur apportée |
|-----|---------------|-----------------|
| **Expertise multi-secteurs** | Connaissance des contraintes réglementaires de chaque secteur | Recommandations contextualisées, pas génériques |
| **Approche agnostique** | L'audit s'adapte à l'existant (hybride, on-prem, cloud, conteneurisé ou non) | Pas d'imposition de stack — pragmatisme |
| **Pédagogie & Change Management** | Livrables compréhensibles par tous (Dev, RSSI, management, DG) | Adhésion facilitée, quick wins visibles |
| **Référentiels reconnus** | CALMS, DORA, OWASP, STRIDE, ISO 27001, NIS2, règle 3-2-1-1-0 | Crédibilité auprès des auditeurs et régulateurs |
| **Vision systémique 360°** | L'audit couvre culture + processus + technique + continuité | Feuille de route durable, non cosmétique |

### 11.2 Risques Projet & Mitigations

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|-----------|
| Résistance culturelle des équipes | Haute | Critique | Approche bottom-up, Security Champions, quick wins visibles dès S4 |
| Scope creep | Moyenne | Haute | Périmètre formalisé dans le document de cadrage S1 |
| Indisponibilité des interlocuteurs clés | Moyenne | Haute | Planning anticipé, sponsors management identifiés |
| Environnements non documentés | Haute | Moyenne | Phase de collecte documentaire dédiée S1–S2 |
| Découverte d'une absence totale de sauvegardes testées | Variable | Critique | Traiter comme un risque immédiat, plan de remédiation prioritaire |

### 11.3 Conclusion d'Expertise

La maturité DevSecOps d'une organisation ne se mesure pas à la sophistication de ses outils, mais à sa capacité à délivrer des services de qualité, en sécurité, de manière prévisible et résiliente. Les deux dimensions souvent négligées — la **culture** et la **continuité** — sont précisément celles qui distinguent les organisations vraiment matures de celles qui ont simplement automatisé le désordre.

> **L'adoption culturelle d'une responsabilité partagée de la sécurité** — où chaque développeur, chaque opérationnel et chaque manager considère la sécurité et la continuité comme des garants de la qualité — est la clé du succès de toute transformation DevSecOps durable.

Le diagnostic (Lot 1) doit démontrer que **l'Automation et la Measurement** — deux piliers CALMS souvent sous-exploités <sup>[[9]](#ref-devopsinstitute)</sup> — sont les meilleurs alliés de la conformité réglementaire, de la résilience opérationnelle et de la confiance des parties prenantes.

---

## 12. Glossaire de Référence

### Gouvernance & Organisation

| Sigle/Terme | Définition |
|-------------|-----------|
| **CAB** | Change Advisory Board — comité d'approbation des changements |
| **CMDB** | Configuration Management Database — référentiel des composants SI |
| **DSI** | Direction des Systèmes d'Information |
| **MCO** | Maintien en Condition Opérationnelle |
| **MCS** | Maintien en Condition de Sécurité |
| **OIV / OSE** | Opérateur d'Importance Vitale / Opérateur de Services Essentiels |
| **PCA** | Plan de Continuité d'Activité — maintien en mode dégradé |
| **PRA** | Plan de Reprise d'Activité — reprise après sinistre |

### DevSecOps & CI/CD

| Sigle/Terme | Définition |
|-------------|-----------|
| **CI/CD** | Continuous Integration / Continuous Delivery — livraison automatisée continue |
| **CVE** | Common Vulnerabilities and Exposures — identifiant unique d'une vulnérabilité |
| **CVSS** | Common Vulnerability Scoring System — score de 0 à 10 |
| **DAST** | Dynamic Application Security Testing — tests de sécurité sur application en exécution |
| **Feature Flag** | Mécanisme d'activation/désactivation fonctionnelle sans déploiement |
| **IaC** | Infrastructure as Code — gestion de l'infrastructure par du code versionné |
| **SAST** | Static Application Security Testing — analyse statique du code source |
| **SBOM** | Software Bill of Materials — inventaire formel de tous les composants logiciels |
| **SCA** | Software Composition Analysis — détection des CVE dans les dépendances |
| **Shift Left** | Déplacement des contrôles de sécurité vers les phases précoces du cycle |

### Sauvegardes & Continuité

| Sigle/Terme | Définition |
|-------------|-----------|
| **Air-gap** | Sauvegarde physiquement déconnectée de tout réseau — protection maximale ransomware |
| **CDP** | Continuous Data Protection — protection quasi-temps-réel des données |
| **MTBF** | Mean Time Between Failures — temps moyen entre deux pannes |
| **MTTR** | Mean Time To Restore — temps moyen de rétablissement après incident |
| **RCA** | Root Cause Analysis — analyse de la cause racine |
| **RPO** | Recovery Point Objective — quantité de données maximale pouvant être perdue |
| **RTO** | Recovery Time Objective — durée maximale d'interruption acceptable |
| **SLA** | Service Level Agreement — engagement contractuel de niveau de service |
| **SLI** | Service Level Indicator — indicateur mesuré en temps réel |
| **SLO** | Service Level Objective — objectif interne (plus strict que le SLA) |
| **WORM** | Write Once Read Many — stockage immuable, anti-ransomware |

### Métriques & Observabilité

| Sigle/Terme | Définition |
|-------------|-----------|
| **APM** | Application Performance Monitoring — surveillance des performances applicatives |
| **DORA Metrics** | 4 métriques de référence DevOps : Deployment Frequency, Lead Time, CFR, MTTR |
| **Error Budget** | Marge d'indisponibilité autorisée = 100 % − SLO |
| **Golden Signals** | Les 4 signaux clés SRE : Latence, Trafic, Erreurs, Saturation |
| **NTP** | Network Time Protocol — synchronisation des horloges (essentiel pour les logs) |

### Sécurité

| Sigle/Terme | Définition |
|-------------|-----------|
| **CIA** | Confidentialité, Intégrité, Disponibilité — triptyque de la sécurité de l'information |
| **EDR** | Endpoint Detection and Response — détection et réponse sur les postes de travail |
| **HSM** | Hardware Security Module — module matériel de gestion des clés cryptographiques |
| **IAM** | Identity and Access Management — gestion des identités et des droits d'accès |
| **MFA** | Multi-Factor Authentication — authentification multi-facteurs |
| **RBAC** | Role-Based Access Control — contrôle d'accès basé sur les rôles |
| **SIEM** | Security Information and Event Management — corrélation des événements de sécurité |
| **SOC** | Security Operations Center — centre de surveillance et de réponse sécurité |
| **STRIDE** | Spoofing, Tampering, Repudiation, Info Disclosure, DoS, Elevation of Privilege |
| **WAF** | Web Application Firewall — pare-feu applicatif web |

---

## 13. Références & Sources

<a name="ref-calms"></a>
**[1] Culture DevSecOps & Framework CALMS**
Programme complet DevSecOps — CALMS, Three Ways, DORA, Shift Left, SRE, Security Champions.
🔗 https://blog.stephane-robert.info/docs/devops/

<a name="ref-incident"></a>
**[2] Gestion des Incidents**
Guide complet du cycle de vie d'un incident — Triage, Escalation, Résolution, Postmortem blameless.
🔗 https://graceful-salamander-33c222.netlify.app/guides/incident/incident/

<a name="ref-trivy"></a>
**[3] Trivy & Supply Chain Security**
Analyse de la compromission Trivy v0.69.4 — leçon sur la Supply Chain Security des outils DevSecOps.
🔗 https://blog.stephane-robert.info/post/trivy-actii/

<a name="ref-owasp"></a>
**[4] OWASP Top 10**
Référentiel des 10 risques de sécurité applicative les plus critiques — standard de référence mondial.
🔗 https://owasp.org/www-project-top-ten/

<a name="ref-dora"></a>
**[5] DORA Metrics — State of DevOps Report**
Les 4 métriques clés de performance DevOps : Deployment Frequency, Lead Time, Change Failure Rate, MTTR.
🔗 https://dora.dev

<a name="ref-stride"></a>
**[6] STRIDE Threat Modeling**
Méthodologie Microsoft de modélisation des menaces appliquée dès la phase de conception.
🔗 https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats

<a name="ref-checkov"></a>
**[7] Checkov — IaC Security**
Documentation officielle Checkov pour scanner les fichiers Terraform, Kubernetes et CloudFormation.
🔗 https://www.checkov.io

<a name="ref-dsomm"></a>
**[8] DSOMM — DevSecOps Maturity Model**
Modèle de maturité DevSecOps de référence pour scorer les pratiques par domaine.
🔗 https://dsomm.timo-pagel.de

<a name="ref-devopsinstitute"></a>
**[9] Framework CALMS — DevOps Institute**
Culture, Automation, Lean, Measurement, Sharing — cadre structurant de toute transformation DevOps.
🔗 https://www.devopsinstitute.com

**[10] Règle 3-2-1-1-0 & Stratégie de Sauvegarde**
Standard industrie pour la protection des données — VEEAM Best Practice Guide.
🔗 https://www.veeam.com/blog/321-backup-rule.html

**[11] NIS2 — Directive Européenne sur la Cybersécurité**
Exigences de cybersécurité pour les entités essentielles et importantes en Europe.
🔗 https://www.cert.ssi.gouv.fr/actualite/CERTFR-2023-ACT-005/

**[12] RGS — Référentiel Général de Sécurité (Secteur Public France)**
Règles de sécurité applicables aux systèmes d'information des autorités publiques.
🔗 https://www.ssi.gouv.fr/entreprise/reglementation/confiance-numerique/le-referentiel-general-de-securite-rgs/

---

> **Conseil pédagogique final :** Structurez vos analyses et vos recommandations avec le framework CALMS. Quand vous décrivez une solution technique, montrez toujours l'impact sur plusieurs piliers. Exemple : *"En automatisant les tests de restauration [A], on mesure le RTO réel chaque semaine [M], on partage les résultats avec la direction [S], et on réduit le risque d'une restauration défaillante en crise [C]."* Cette vision systémique différencie un audit superficiel d'une transformation durable.

---

*Document de référence pédagogique — Audit de Maturité DevSecOps — Usage universel tous secteurs*
*Version 2.0 — Avril 2026 — Cadre : CALMS · DevSecOps · DORA · OWASP · STRIDE · Règle 3-2-1-1-0*
