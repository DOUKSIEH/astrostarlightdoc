---
title: "Analyse Technique du Poste DevOps"
description: "Analyse Technique du Poste DevOps"
created: "2026-02-19"
# updated: "2026-02-04"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"
---

# 🚇 **Analyse Technique du Poste DevOps – Alignement CALMS & DevSecOps**
### Poste : Expert DevOps Outillage de Production F/H – DSI/FAB | RATP Group
**Référence :** R0016172 | **Localisation :** Noisy-le-Grand (93) | **Contrat :** CDI | **Télétravail :** 2–3 jours/semaine

> *Ce document est un outil de travail partagé. Son objectif : poser un cadre commun pour faciliter nos échanges, clarifier l'état actuel de l'infrastructure, identifier les urgences et projeter ensemble une contribution à court et long terme.*

---

## 📌 Pourquoi ce Document ?

Avant tout entretien technique, il est utile de partager une lecture commune du contexte. Ce document permet de :

1. **Démontrer ma compréhension** des enjeux réels du poste, au-delà de la fiche descriptive.
2. **Structurer notre échange** autour des thèmes clés : sauvegarde, automatisation, sécurité, infrastructure.
3. **Clarifier l'état actuel** de l'infrastructure pour identifier les urgences et les priorités.
4. **Projeter ma contribution** à court terme (stabilisation) et long terme (modernisation).

---

## 🏛️ Contexte : Le Défi du SI RATP

Le Système d'Information du Groupe RATP est l'un des plus complexes de France dans le secteur du transport public. Toute défaillance dans la chaîne de sauvegarde ou d'outillage de production peut impacter directement la continuité de service pour des millions de voyageurs.

| Indicateur | Volume |
|---|---|
| Applications critiques | 500+ |
| Machines virtuelles | 8 000 |
| Serveurs physiques | 1 500 |
| Stockage | 3 Po (Pétaoctets) |
| Bases de données | 2 000 |
| Datacenters | 2 |
| Cloud | Public hybride |

---

## 🧭 Cadre d'Analyse : Modèle CALMS & DevSecOps

Le modèle **CALMS** est le référentiel que j'utilise pour évaluer la maturité DevOps d'une organisation et identifier les leviers d'amélioration. Chaque section de ce document y est explicitement rattachée.

| Lettre | Pilier | Focus DevSecOps | Objectif RATP |
|---|---|---|---|
| **C** | Culture | Collaboration transverse | Briser les silos Dev / Ops / Sécurité / Métiers |
| **A** | Automatisation | Security by Design | Intégrer la sécurité dans les pipelines CI/CD |
| **L** | Lean | Réduction des risques | Éliminer les goulots d'étranglement opérationnels |
| **M** | Mesure | Métriques de sécurité | Suivre RTO/RPO, MTTR, taux de couverture sauvegarde |
| **S** | Sharing | Transparence & documentation | Partager les procédures, capitaliser les connaissances |

---

## 🔐 1. Sauvegarde & Résilience
*Piliers CALMS concernés : **C** · **A** · **M** · **S***

> **Enjeu :** Sur un SI de 8 000 VM et 500+ applications critiques, la politique de sauvegarde est le socle de toute résilience. Elle doit être définie, automatisée, testée et auditée en continu. Sans cela, tous les efforts de modernisation restent fragiles.

### 1.1 Politique de Sauvegarde — *M · C*

**Concepts fondamentaux :**
- **RPO** *(Recovery Point Objective)* : Quelle est la perte de données maximale acceptable ? (ex : 1h, 4h, 24h)
- **RTO** *(Recovery Time Objective)* : En combien de temps doit-on restaurer le service ?
- **PRA** *(Plan de Reprise d'Activité)* : Procédure de reprise après sinistre majeur.
- **PCA** *(Plan de Continuité d'Activité)* : Maintien du service pendant l'incident.

**État actuel — ce que je souhaite comprendre :**
- Les RPO/RTO sont-ils **définis par criticité métier** (ex : applications transactionnelles vs. archives) ou appliqués de façon uniforme ?
- Existe-t-il une **cartographie applicative** reliant chaque application à sa politique de sauvegarde ?
- Les sauvegardes couvrent-elles **100% de la CMDB** ? Le taux de couverture est-il mesuré et suivi ?
- Comment sont **priorisées** les applications critiques lors de la planification des fenêtres de sauvegarde ?


---

### 1.2 Chiffrement des Sauvegardes — *A · M*

> **Pourquoi c'est critique :** Le chiffrement protège les données en cas de vol ou de compromission des supports. Il est aussi une exigence réglementaire (RGPD, LPM pour les OIV).

**État actuel — ce que je souhaite comprendre :**
- Les sauvegardes sont-elles **chiffrées au repos et en transit** (ex : AES-256) ?
- Où sont **stockées les clés de chiffrement** (KMS, HSM, HashiCorp Vault) ?
- Les clés sont-elles **rotées automatiquement** (ex : tous les 90 jours) ?
- Qui a **accès aux clés** et comment est gérée la séparation des rôles (*least privilege*) ?

---

### 1.3 Gestion des Secrets — *A · S*

> **Pourquoi c'est critique :** Les secrets (mots de passe, tokens, certificats) sont des cibles privilégiées des attaquants. Leur gestion centralisée et leur rotation automatique sont des pratiques fondamentales de sécurité.

**État actuel — ce que je souhaite comprendre :**
- Où sont **stockés les secrets** utilisés par les outils de sauvegarde et les pipelines (Vault, CyberArk, ansible-vault) ?
- Les secrets sont-ils **rotés automatiquement** ou gérés manuellement ?
- Les pipelines CI/CD accèdent-ils aux secrets via **variables protégées et masquées** ?
- Existe-t-il un **audit des accès** aux secrets (qui a accédé à quoi, quand) ?

---

### 1.4 Protection contre les Ransomwares — *A · C · M*

> **Pourquoi c'est critique :** Les ransomwares ciblent en priorité les sauvegardes pour maximiser l'impact de l'attaque. Une infrastructure de sauvegarde non protégée est une infrastructure de sauvegarde inutile face à ce type de menace.

**État actuel — ce que je souhaite comprendre :**
- Utilisez-vous des **sauvegardes immuables** *(Immutable Backups)* — des sauvegardes qu'aucun acteur (y compris un administrateur) ne peut modifier ou supprimer pendant une période définie ?
- Existe-t-il un **air gap** (isolation logique ou physique) entre les sauvegardes et le réseau de production ?
- Des **tests de restauration post-attaque simulée** sont-ils réalisés ? À quelle fréquence ?
- Comment les sauvegardes sont-elles **isolées** des systèmes compromis lors d'un incident de sécurité ?

---

### 1.5 Tests de Restauration & Vérification de l'Intégrité — *A · M · S*

> **Pourquoi c'est critique :** Une sauvegarde non testée est une promesse non tenue. La seule façon de valider qu'une sauvegarde est exploitable, c'est de la restaurer. Ce point est souvent négligé et constitue l'un des risques les plus sous-estimés.

**État actuel — ce que je souhaite comprendre :**
- Les tests de restauration sont-ils **planifiés et automatisés**, ou réalisés uniquement sur demande lors d'incidents ?
- Couvrent-ils **l'ensemble du périmètre** (VM, bases de données, applications critiques) ou seulement un échantillon ?
- Les résultats des tests sont-ils **documentés, tracés et comparés** dans le temps ?
- Existe-t-il un processus de **vérification de l'intégrité** des sauvegardes (checksums, validation des données) ?

---

## 🏗️ 2. Environnement Hétérogène & Dette Technique
*Piliers CALMS concernés : **C** · **L** · **A***

> **Enjeu :** Gérer simultanément des systèmes allant de RHEL 5 à RHEL 9, de Windows Server 2008R2 à 2022R2, sur 8 000 VM représente un défi d'automatisation majeur. La dette technique accumulée sur les systèmes legacy est un risque opérationnel et sécuritaire permanent.

**État actuel — ce que je souhaite comprendre :**
- Comment les tâches de configuration et de maintenance sont-elles **automatisées sur les OS legacy** (RHEL 5/6, Windows 2008) qui ne supportent pas les agents modernes ?
- Existe-t-il une **segmentation réseau** isolant les systèmes obsolètes du reste de l'infrastructure ?
- Avez-vous un **plan de décommissionnement progressif** formalisé, avec des jalons définis ?
- Comment sont **priorisées les migrations** (par criticité applicative, par risque de sécurité, par service métier) ?


---

## 🔄 3. MCO & Support N2/N3
*Piliers CALMS concernés : **C** · **M** · **S***

> **Enjeu :** Le Maintien en Conditions Opérationnelles n'est pas qu'une activité réactive. Bien organisé, il est une source d'apprentissage précieuse et un levier d'amélioration continue. Réduire le MTTR *(Mean Time To Recovery)* et capitaliser les connaissances sont des objectifs clés.

### 3.1 Organisation du Support — *C · S*

**État actuel — ce que je souhaite comprendre :**
- Comment est structuré le **support N2/N3** ? Y a-t-il des spécialistes dédiés par outil (CommVault, VEEAM, DataDomain) ou une organisation transversale ?
- Les incidents sont-ils gérés selon un processus **ITIL** structuré (qualification, priorisation, escalade, clôture) ?
- Les **rétrospectives post-incident** *(Post-Mortem)* sont-elles formalisées et leurs actions de remédiation tracées ?
- Comment sont **escaladés** les incidents critiques vers les éditeurs (CommVault, VEEAM, Dell) ?


---

### 3.2 Intégration avec ServiceNow & CMDB — *A · M · S*

> **Pourquoi c'est critique :** La CMDB est le référentiel de vérité de l'infrastructure. Si les sauvegardes ne sont pas alignées avec la CMDB, des actifs critiques peuvent être sans protection sans que personne ne le détecte.

**État actuel — ce que je souhaite comprendre :**
- Les solutions de sauvegarde (CommVault, VEEAM) sont-elles **synchronisées automatiquement** avec la CMDB ServiceNow ?
- Le **taux de couverture** (actifs sauvegardés vs actifs inventoriés en CMDB) est-il mesuré et affiché dans un tableau de bord ?
- Une **ouverture automatique d'incident** dans ServiceNow est-elle déclenchée en cas d'échec de sauvegarde ?
- Comment sont **traités les écarts** entre la CMDB et les sauvegardes réelles (actifs non couverts, doublons, actifs décommissionnés) ?


---

## ⚙️ 4. Infrastructure as Code (IaC) & Automatisation
*Piliers CALMS concernés : **A** · **L** · **M** · DevSecOps*

> **Enjeu :** Sur un parc de 8 000 VM hétérogènes, chaque tâche manuelle est un risque d'erreur et un goulot d'étranglement. L'Infrastructure as Code (IaC) est la seule réponse viable pour gérer cette complexité à grande échelle, de façon reproductible et sécurisée.

---

### 4.1 Terraform — Provisionnement de l'Infrastructure — *A · M*

> **Rôle de Terraform :** Terraform permet de décrire l'infrastructure cible dans des fichiers de configuration versionnés (Git). Chaque changement d'infrastructure est tracé, réversible et auditable. C'est le fondement d'une infrastructure reproductible.

**État actuel — ce que je souhaite comprendre :**
- Terraform est-il **utilisé pour provisionner** les VM, le stockage et les ressources réseau ? Quels modules/patterns sont en place ?
- Comment les **états Terraform** *(terraform.tfstate)* sont-ils gérés ? Existe-t-il un backend distant (S3, Azure Blob, Terraform Cloud) avec verrouillage pour éviter les conflits ?
- Comment est gérée la **stratégie hybride** (on-premise + cloud public) ? Des providers multi-cloud sont-ils configurés ?
- Des outils de **scan de sécurité IaC** (Checkov, TfSec) sont-ils intégrés dans les pipelines pour détecter les mauvaises configurations avant déploiement ?
- Comment les **secrets** (credentials, tokens) sont-ils gérés dans les fichiers Terraform ? Sont-ils externalisés dans Vault ou un gestionnaire de secrets ?
- Des **tests automatisés** (Terratest, InSpec) sont-ils en place pour valider les infrastructures avant déploiement en production ?


---

### 4.2 Ansible — Automatisation de la Configuration — *A · L · S*

> **Rôle d'Ansible :** Ansible permet d'automatiser la configuration des systèmes (installation d'agents, hardening, gestion des certificats) de façon idempotente — c'est-à-dire qu'une même tâche peut être exécutée plusieurs fois sans effet de bord. C'est l'outil central pour gérer un parc hétérogène à grande échelle.

**État actuel — ce que je souhaite comprendre :**
- Quelle **version d'Ansible** est utilisée ? Une migration vers Ansible 5+ (collections) est-elle planifiée ?
- Les **inventaires** sont-ils statiques (fichiers manuels) ou dynamiques (synchronisés automatiquement avec VMware, AWS ou ServiceNow) ?
- Existe-t-il des **rôles et playbooks standardisés** pour les tâches récurrentes : déploiement des agents de sauvegarde (VEEAM/CommVault), configuration des politiques de sauvegarde, hardening des serveurs ?
- Comment **Ansible et Terraform** sont-ils intégrés ? Les pipelines CI/CD enchaînent-ils provisionnement (Terraform) et configuration (Ansible) ?
- Les **playbooks sont-ils testés** avant déploiement en production (Molecule, Testinfra, environnements de staging) ?
- Comment les déploiements sont-ils gérés sur les **OS legacy** (RHEL 5, Windows 2008) qui ont des contraintes de compatibilité spécifiques ?
- **ansible-lint** est-il utilisé avec des règles de sécurité pour garantir la qualité et la conformité des playbooks ?


---

### 4.3 Pipelines CI/CD — GitLab CI/CD — *A · M · DevSecOps*

> **Rôle des pipelines CI/CD :** Les pipelines automatisent le cycle de vie complet des changements d'infrastructure : validation du code, scans de sécurité, tests, déploiement. Ils éliminent les déploiements manuels et garantissent la traçabilité de chaque changement.

**État actuel — ce que je souhaite comprendre :**
- GitLab CI/CD est-il **déjà en place** pour le périmètre outillage de production, ou est-ce un chantier à initier ?
- Les pipelines couvrent-ils le **déploiement des agents de sauvegarde**, la configuration des politiques et le hardening des serveurs ?
- Des **scans de sécurité automatisés** (SAST, scan IaC, scan des secrets) sont-ils intégrés dans les pipelines ?
- Les pipelines incluent-ils une **étape de validation** (tests, approbation manuelle) avant déploiement en production ?
- Comment les **secrets des pipelines** (tokens, credentials) sont-ils gérés ? Sont-ils stockés dans les variables protégées GitLab ou externalisés dans Vault ?

---

### 4.4 Kubernetes & Conteneurisation — *A · L*

> **Contexte :** Kubernetes est mentionné dans les compétences attendues du poste. Son rôle dans le périmètre outillage de production (orchestration des agents de sauvegarde, déploiement d'outils de monitoring) est à clarifier.

**État actuel — ce que je souhaite comprendre :**
- Kubernetes est-il **déjà utilisé** dans le périmètre DSI/FAB ? Pour quels cas d'usage (agents de sauvegarde, outils de supervision, applications internes) ?
- Les déploiements Kubernetes sont-ils **gérés via Helm** (charts standardisés) ou des manifestes YAML directs ?
- Comment la **sécurité des clusters** est-elle assurée (RBAC, network policies, scan des images) ?
- Les workloads Kubernetes sont-ils **intégrés dans la politique de sauvegarde** (persistant volumes, états des applications stateful) ?

---

## 📡 5. Gestion des Événements, Supervision & SIEM
*Piliers CALMS concernés : **M** · **S** · **A***

> **Enjeu :** Un SI qu'on ne mesure pas est un SI qu'on ne maîtrise pas. La supervision centralisée des événements de sauvegarde et d'infrastructure est indispensable pour détecter les anomalies avant qu'elles ne deviennent des incidents.

**État actuel — ce que je souhaite comprendre :**
- Les **logs de sauvegarde** (CommVault, VEEAM, DataDomain) sont-ils intégrés dans un SIEM central (Splunk, QRadar) pour corrélation et alerting ?
- La **synchronisation NTP** est-elle active et vérifiée sur l'ensemble du parc pour garantir la cohérence des horodatages des logs ?
- La **rétention des logs** est-elle conforme aux exigences réglementaires (RGPD, LPM) et aux besoins d'investigation forensique ?
- Existe-t-il un **SOC** *(Security Operations Center)* pour la supervision en temps réel des événements de sécurité liés à l'outillage de production ?
- Les outils de monitoring actuels (Centreon, Dynatrace, TrueSight, NeoLoad) couvrent-ils le **périmètre outillage de sauvegarde** avec des alertes en temps réel ?


---

## 👥 6. Organisation de l'Équipe & Gouvernance
*Piliers CALMS concernés : **C** · **S***

> **Enjeu :** Un poste d'expert DevOps dans une équipe de 8 à 10 personnes avec des budgets pouvant atteindre 1M€ nécessite une organisation claire des rôles, une roadmap partagée et une culture de documentation pour éviter la dépendance aux individus.

**État actuel — ce que je souhaite comprendre :**
- Quelle est la **répartition actuelle des rôles** dans l'équipe ? Y a-t-il des spécialistes dédiés par outil (CommVault, VEEAM, DataDomain) ou une polyvalence attendue ?
- Comment fonctionne le **mode agile** (sprints, backlog, cérémonies) dans le quotidien de l'équipe ? Avec quel outil (Jira) ?
- Existe-t-il une **roadmap de modernisation** formalisée, avec des jalons définis et des priorités validées par la direction ?
- Comment est gérée la **documentation technique** (dossiers d'architecture, modes opératoires, procédures) ? Est-elle à jour et accessible à toute l'équipe ?
- Comment s'organisent les **astreintes** pour la couverture des incidents en dehors des heures ouvrées ?


---

## 🛡️ 7. Principes de Sécurité — Triade CIA
*Piliers CALMS concernés : Tous (sécurité intégrée — DevSecOps)*

> **La triade CIA** *(Confidentiality, Integrity, Availability)* est le cadre fondamental de la sécurité de l'information. Sur ce poste, chaque décision technique doit être évaluée à travers ce prisme.

| Principe | Définition | Application au Poste | Questions Clés |
|---|---|---|---|
| **Confidentialité** | Les données ne sont accessibles qu'aux personnes autorisées | Chiffrement des sauvegardes au repos et en transit, gestion des accès aux clés | Les sauvegardes sont-elles chiffrées ? Où sont stockées les clés ? Qui y a accès ? |
| **Intégrité** | Les données ne sont pas altérées de façon non autorisée | Tests de restauration, vérification des checksums, sauvegardes immuables | À quelle fréquence testez-vous les restaurations ? Les checksums sont-ils vérifiés ? |
| **Disponibilité** | Les données sont accessibles quand on en a besoin | RTO respectés, air gap contre les ransomwares, redondance des sauvegardes | Quel est le RTO actuel pour les applications critiques ? Est-il tenu lors des tests ? |

---

## 📊 Synthèse des Axes d'Analyse & Urgences Identifiées

| Domaine | Lettre CALMS | Urgence Court Terme | Horizon Long Terme |
|---|---|---|---|
| Politique de sauvegarde (RPO/RTO) | C · M | Audit couverture CMDB | Automatisation révision trimestrielle |
| Chiffrement & gestion des clés | A · M | Audit des gaps de chiffrement | Rotation automatique via Vault |
| Gestion des secrets | A · S | Cartographie et migration | Vault centralisé, audit complet |
| Protection ransomwares | A · C · M | Évaluation sauvegardes immuables | Architecture 3-2-1-1, air gap |
| Tests de restauration | A · M · S | Calendrier tests applications critiques | Automatisation complète via CI/CD |
| Environnements legacy | C · L · A | Cartographie et évaluation des risques | Pipelines de migration automatisés |
| MCO & Support N2/N3 | C · M · S | Runbooks incidents récurrents | Base de connaissances, réduction escalades |
| ServiceNow & CMDB | A · M · S | Alertes automatiques sur écarts | Réconciliation automatisée |
| Terraform (IaC) | A · M | Audit états et secrets | Bibliothèque de modules, scans Checkov |
| Ansible (Configuration) | A · L · S | Audit playbooks existants | Bibliothèque de rôles, tests Molecule |
| Pipelines CI/CD (GitLab) | A · M | Premiers pipelines critiques | Couverture complète + scans sécurité |
| Kubernetes | A · L | Clarification du périmètre | Intégration dans la politique de sauvegarde |
| Supervision & SIEM | M · S · A | Alertes sauvegarde temps réel | Corrélation logs dans le SIEM |
| Organisation & documentation | C · S | Intégration et compréhension des rôles | Base de connaissances partagée |

---



