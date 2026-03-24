---
title: "🎯 🏛️ Analyse de l'Offre & Compréhension du Besoin Client"
description: "Mission OPS N3 — Socle STCA / Expertise Production"
created: "2026-03-24"
# updated: "2026-02-08"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"

---


<!-- # 🏛️ Analyse de l'Offre & Compréhension du Besoin Client
## Mission OPS N3 — Socle STCA / Expertise Production
### Client : La Poste — BGPN / DIWO / Direction Supervision et Production -->

> **Statut du document :** Vivant — non exhaustif, ouvert à l'évolution au fil des échanges avec les équipes.
> **Audience :** Équipe DSP, responsable de mission, ingénieur d'affaires.
> **Objectif :** Démontrer la compréhension du contexte, proposer une approche structurée et ouvrir le dialogue sur les priorités réelles.

---

## 📋 Table des matières

| # | Section |
|---|---------|
| 1 | Lecture du contexte organisationnel |
| 2 | Architecture et composants critiques |
| 3 | Ce que j'entends derrière l'offre |
| 4 | Framework CALMS appliqué à cette mission |
| 5 | Approche proposée — Du RUN réactif au RUN industriel |
| 6 | Points de vigilance à première vue |
| 7 | Questions pour calibrer la réalité terrain |
| 8 | Valeur ajoutée et ouvertures d'évolution |
| 9 | Glossaire de référence |

---

## 1️⃣ Lecture du contexte organisationnel

### La chaîne de responsabilité

La mission s'inscrit dans une organisation multicouches qu'il faut comprendre pour bien se positionner :

```
Groupe La Poste
└── BGPN — Branche Grand Public & Numérique (créée juillet 2021)
    └── DSI BGPN — SI centré Client, levier digital
        └── DIWO — Data · Infrastructure · Workplace · Opérations
            └── DSP — Direction Supervision et Production
                ├── Tour de contrôle (supervision, incidents, crises)
                ├── Processus IT & Performance Opérationnelle (ITSM)
                ├── Socles Outils de Production (observabilité, build/run)
                └── Expertise Production ← MA MISSION ICI
                    Socle STCA · PRAs · Système & Infrastructure N3
```

### Ce que cela implique concrètement

La DSP est le **garant de la continuité de service** pour un SI qui sert des millions d'utilisateurs — bureaux de poste, services en ligne, professionnels, collectivités. Chaque incident non maîtrisé a un impact direct sur le business et la réputation.

Le domaine **Expertise Production** où s'inscrit la mission est le dernier rempart technique : quand N1 et N2 ne peuvent pas résoudre, c'est ce niveau qui intervient. C'est une responsabilité critique et souvent sous-documentée.

### La tension structurelle à comprendre

```
Exigence métier :          Réalité technique :
Zéro interruption    ↔     Systèmes legacy (appliances IBM)
Agilité maximale     ↔     Procédures manuelles existantes
Modernisation rapide ↔     Dette technique accumulée
```

> **Ma lecture :** La mission ne demande pas seulement quelqu'un qui "fait tourner" les appliances IBM. Elle cherche quelqu'un capable de **réduire progressivement cette tension** en industrialisant le RUN sans casser la stabilité existante.

---

## 2️⃣ Architecture et composants critiques

### Vue simplifiée du système

```
[ Utilisateurs finaux — millions de clients La Poste ]
                    ↓
[ IBM WebSEAL — Reverse Proxy sécurisé ]
  → Authentification · Contrôle d'accès · Terminaison TLS/certificats
                    ↓
[ Applications métiers — services La Poste ]
  → Couche applicative critique (haute disponibilité requise)
                    ↓
[ Infrastructure : VM Linux (RedHat/Debian) · Appliances IBM · ESX ]
  → Socle STCA — cible principale de la mission
                    ↓
[ Chaîne d'outillage OPS ]
  Git · Jenkins · Ansible/AWX · Prometheus · Grafana · ELK/Splunk
```

### Pourquoi IBM WebSEAL est le composant le plus critique

IBM WebSEAL est un **reverse proxy de sécurité** qui filtre et authentifie tout le trafic entrant. Il est au croisement de la sécurité, de la performance et de la disponibilité.

| Risque | Conséquence | Impact |
|--------|-------------|--------|
| Certificat expiré | Erreur HTTPS pour tous les utilisateurs | Service totalement inaccessible |
| Surcharge des jonctions | Dégradation des temps de réponse | Expérience utilisateur dégradée |
| Mauvaise configuration d'accès | Blocage de flux applicatifs légitimes | Interruption de services métiers |
| Perte d'une instance sans HA validé | Panne généralisée | Impact business immédiat |

> **Point de vigilance immédiat :** La gestion des certificats WebSEAL est citée explicitement dans l'offre. C'est souvent le risque le plus visible et le moins automatisé dans les environnements de ce type. C'est ma priorité d'audit numéro un.

### Les appliances IBM — Spécificités à prendre en compte

Les appliances IBM ne se gèrent pas comme des serveurs Linux classiques. Elles ont leurs propres contraintes :

- **Accès restreints** : pas de SSH root standard, interfaces propriétaires
- **Patching spécifique** : mises à jour firmware avec procédures validées par IBM
- **Intégration Ansible limitée** : les modules génériques ne fonctionnent pas toujours — il faut des rôles adaptés ou des modules spécifiques (URI, raw, expect)
- **Journalisation propriétaire** : les logs ne sont pas toujours au format standard — parsing ELK/Splunk à configurer

---

## 3️⃣ Ce que j'entends derrière l'offre

L'offre liste des compétences techniques, mais ce qu'elle exprime réellement c'est un besoin en trois niveaux :

### Niveau 1 — Stabilisation immédiate

> *"Quelqu'un qui maîtrise l'environnement et peut intervenir sans dégrader."*

L'équipe a besoin d'un N3 capable de prendre en charge des incidents complexes **dès le premier jour**, sans phase d'apprentissage à risque sur des systèmes critiques.

### Niveau 2 — Industrialisation progressive

> *"Quelqu'un qui transforme les procédures manuelles en automatismes fiables."*

La mention d'Ansible/AWX, des déploiements automatisés et des chaînes d'industrialisation indique que l'équipe sait où elle veut aller mais manque peut-être de ressources pour y aller.

### Niveau 3 — Capitalisation et résilience collective

> *"Quelqu'un qui ne garde pas le savoir pour lui, mais le rend accessible à l'équipe."*

La demande explicite de "rédaction de procédures N3" et de "transmission de compétences" montre que la direction a identifié un risque de **dépendance à des experts individuels** — ce que j'appelle le "Bus Factor".

---

## 4️⃣ Framework CALMS appliqué à cette mission

Le framework CALMS est le cadre de référence pour évaluer et faire progresser la maturité DevOps d'une organisation. Je l'utilise ici comme grille de lecture du besoin et comme fil conducteur de mon intervention.

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRAMEWORK CALMS                             │
├──────┬──────────────────────────────────────────────────────────┤
│  C   │  CULTURE       → Casser les silos, collaboration         │
│  A   │  AUTOMATION    → Pipelines, IaC, déploiements auto       │
│  L   │  LEAN          → Réduire les gaspillages, fluidifier     │
│  M   │  MEASUREMENT   → Métriques DORA, SLO, dashboards         │
│  S   │  SHARING       → Docs, runbooks, guildes, standards      │
└──────┴──────────────────────────────────────────────────────────┘
```

### C — Culture : Casser les silos entre N1/N2/N3

**Le problème dans un environnement de RUN legacy :** Le savoir N3 reste concentré chez quelques experts. Quand ils ne sont pas disponibles, N1 et N2 sont bloqués et escaladent systématiquement. Cela crée une dépendance critique et épuise les experts.

**Ce que je propose :**
- Rituels hebdomadaires d'échange incident/apprentissage entre niveaux
- Post-mortems blameless documentés et accessibles à tous
- Habilitation progressive de N2 via AWX (ils lancent des diagnostics sans accès direct aux appliances)

**Indicateur de succès :** Réduction du taux d'escalade N2 → N3 de 30% en 6 mois.

---

### A — Automation : Zéro Touche sur les actes à risque

**Le problème :** Les tâches manuelles répétitives sont la source principale d'incidents dans les environnements critiques. Un mauvais copier-coller lors d'un renouvellement de certificat peut couper le service pour des millions d'utilisateurs.

**Priorités d'automatisation que je propose :**

| Tâche actuellement manuelle | Risque | Solution Ansible/AWX |
|-----------------------------|--------|---------------------|
| Renouvellement certificats SSL WebSEAL | Expiration → coupure totale | Workflow AWX auto-piloté avec alerting J-30/J-15/J-7 |
| Patching appliances IBM (firmware) | Erreur de procédure → indisponibilité | Playbook Ansible avec étapes de validation et rollback |
| Déploiement d'instances applicatives | Régression → incident P1 | Pipeline Jenkins → Ansible → validation automatique |
| Vérification de la répartition de charge | Asymétrie non détectée → surcharge | Script de contrôle automatisé + dashboard Grafana |
| Génération de reporting d'état | Temps perdu, erreurs manuelles | Rapport HTML automatisé généré par Ansible/scripts Bash |

**Exemple concret — Avant/Après sur les certificats :**

```
AVANT (mode manuel) :
Administrateur → vérification manuelle → renouvellement serveur par serveur
→ Risque d'oubli → Expiration → Coupure service → Incident P1

APRÈS (mode automatisé) :
AWX schedule → détection certificat < 30 jours
→ Notification équipe → Workflow de renouvellement Ansible → Validation → Deploy
→ Zéro interruption · Traçabilité complète · Auditabilité garantie
```

---

### L — Lean : Réduire la dette technique progressivement

**Le problème :** La dette technique se nourrit des tâches répétitives non automatisées. Chaque heure passée sur une tâche manuelle est une heure qui n'est pas investie en stabilisation ou amélioration.

**Gaspillages à identifier et éliminer en priorité :**

- Scripts Bash anciens non maintenables → migration vers rôles Ansible structurés
- Procédures en tête des experts → externalisation en runbooks Git-versionnés
- Dépendances à des configurations "fantômes" (modifiées hors code) → audit de drift
- Réponses aux incidents sans capitalisation → post-mortems systématiques

**Indicateur LEAN :** Lead time d'une intervention (de la détection à la résolution documentée). L'objectif est de réduire ce délai de 30% sur les incidents récurrents en 6 mois.

---

### M — Measurement : Piloter par la donnée, prouver la stabilité

**Le problème :** Sans métriques, il est impossible de prouver à la direction que le socle est stable ou de justifier un investissement en automatisation.

**Métriques ITIL à mettre en place ou renforcer :**

| Métrique | Définition | Cible pour un socle critique |
|----------|-----------|------------------------------|
| **MTTD** | Mean Time To Detect — délai de détection d'un incident | < 5 minutes (alerte automatique) |
| **MTTR** | Mean Time To Repair — délai de rétablissement | < 1 heure sur P1 |
| **MTBF** | Mean Time Between Failures — fiabilité réelle du socle | À mesurer sur 3 mois pour baseline |
| **RTO** | Recovery Time Objective — durée max d'interruption acceptable | Défini dans les PRAs |
| **RPO** | Recovery Point Objective — perte de données max acceptable | Défini dans les PRAs |

**Cycle de vie d'un incident — vision ITIL :**

```
Incident survient
    ↓
[MTTD] Détection — alerte monitoring ou remontée N1
    ↓
Qualification / Triage — sévérité P1/P2/P3/P4
    ↓
[Début MTTR] Diagnostic — logs, métriques, traces
    ↓
Résolution — remédiation, rollback ou contournement
    ↓
[Fin MTTR] Validation — tests, confirmation service rétabli
    ↓
Post-Mortem blameless — causes racines + actions
    ↓
[MTBF repart] Documentation et capitalisation
```

**Observabilité "métier" — aller au-delà du CPU :**

Les dashboards Grafana/Splunk ne doivent pas surveiller uniquement des métriques infrastructure. Sur un socle WebSEAL, les indicateurs pertinents sont :

- **Santé des jonctions WebSEAL** : connexions actives, erreurs par jonction
- **Validité des certificats** : J-30, J-15, J-7 avec alerting progressif
- **Temps de réponse applicatifs** : p50, p95, p99 (pas seulement la moyenne)
- **Taux d'erreur HTTP** : 4xx, 5xx par service, par heure
- **Charge des VMs** : corrélée aux pics d'activité métier (pas les seuils génériques)

---

### S — Sharing : Docs-as-Code — La documentation qui vit avec le code

**Le problème (Bus Factor) :** Si la connaissance du socle STCA repose sur 1 ou 2 experts, le départ ou l'indisponibilité de l'un d'eux met l'équipe en danger. C'est le risque organisationnel numéro un dans les environnements legacy.

**Docs-as-Code — Principe et application :**

L'approche Docs-as-Code consiste à **traiter la documentation comme du code** : versionnée dans Git, révisée via Merge Request, mise à jour en même temps que les playbooks Ansible qu'elle décrit.

```
Dépôt Git (exemple de structure)
├── ansible/
│   ├── roles/
│   │   ├── webseal-cert-renew/   ← rôle Ansible
│   │   │   ├── tasks/main.yml
│   │   │   └── README.md         ← documentation du rôle (Docs-as-Code)
│   │   └── ibm-appliance-patch/
│   └── playbooks/
├── docs/
│   ├── runbooks/
│   │   ├── incident-p1-webseal.md    ← runbook d'incident
│   │   ├── cert-expiry-response.md
│   │   └── pra-procedure.md
│   ├── architecture/
│   │   └── stca-overview.md
│   └── post-mortems/
│       └── 2025-03-incident-jonction.md   ← archivé, consultable
└── CHANGELOG.md
```

**Pourquoi c'est une évolution, pas une révolution :**

- Les runbooks existants sont migrés progressivement (pas de big bang)
- Chaque playbook Ansible créé est accompagné de son README dès le départ
- Les post-mortems sont archivés dans Git — consultables, cherchables, améliorables
- N1 et N2 peuvent consulter les runbooks directement dans GitLab/Confluence

> **Référence concrète :** Mon guide de gestion d'incident disponible en ligne illustre cette approche — structuration des phases (MTTD, MTTR, triage, diagnostic, post-mortem), scripts de diagnostic automatisés, aide-mémoire commandes par OS. C'est le type de documentation que je construis pour et avec l'équipe.

---

## 5️⃣ Approche proposée — Du RUN réactif au RUN industriel

### Vision générale

```
ÉTAT ACTUEL (hypothèse à confirmer)        →    CIBLE (6-12 mois)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RUN réactif                                →    RUN industriel
Interventions manuelles fréquentes         →    Automatisation des actes récurrents
Savoir concentré chez N3                   →    Runbooks accessibles à N2
Monitoring infrastructure                  →    Observabilité orientée service
Procédures en mémoire                      →    Docs-as-Code dans Git
Gestion réactive des certificats           →    Renouvellement auto avant expiration
PRA non testé régulièrement                →    PRA automatisé et testé mensuellement
```

### Phase 1 — Audit et stabilisation (J+0 à J+30)

**Objectif : comprendre avant d'agir.**

- Cartographie des SPOF (Single Points of Failure) : quels composants n'ont pas de redondance validée ?
- Inventaire des scripts Bash existants : lesquels sont critiques, lesquels sont obsolètes, lesquels ne sont plus compris par personne ?
- Audit des certificats : dates d'expiration, processus de renouvellement actuel, risques immédiats
- Lecture des PRAs existants : sont-ils testés ? Sont-ils à jour ? Sont-ils connus de l'équipe ?
- Identification des "configurations fantômes" : dérive entre l'état réel et l'état décrit (drift)

### Phase 2 — Industrialisation des actes à risque (J+30 à J+90)

**Objectif : automatiser ce qui fait peur.**

Création de rôles Ansible structurés pour :

```yaml
# Exemple de structure d'un rôle Ansible WebSEAL cert-renew
roles/webseal-cert-renew/
├── tasks/
│   ├── main.yml          # Orchestration principale
│   ├── check.yml         # Vérification validité cert actuel
│   ├── backup.yml        # Sauvegarde avant intervention
│   ├── deploy.yml        # Déploiement nouveau certificat
│   └── validate.yml      # Tests post-déploiement
├── handlers/
│   └── main.yml          # Restart WebSEAL si nécessaire
├── vars/
│   └── main.yml          # Variables (chemins, seuils, contacts)
├── defaults/
│   └── main.yml          # Valeurs par défaut surchargeables
└── README.md             # Documentation (Docs-as-Code)
```

Templates AWX à créer :
- Renouvellement certificat WebSEAL (exécutable par N2 avec approbation)
- Patching appliance IBM (exécutable par N3 avec checklist de validation)
- Diagnostic de charge (exécutable par N2 sans approbation)
- Restart contrôlé d'un service (avec validation avant et après)

### Phase 3 — Observabilité proactive (J+60 à J+120)

**Objectif : anticiper plutôt que réparer.**

Dashboards Grafana/Splunk orientés service :

| Dashboard | Métriques clés | Alertes configurées |
|-----------|---------------|---------------------|
| Santé WebSEAL | Jonctions actives, erreurs/min, latence p99 | Seuil d'erreur > 1%, latence > 2s |
| Certificats | Validité en jours par cert | Alerte J-30, J-15, J-7 |
| Appliances IBM | CPU, mémoire, connexions actives | Seuils adaptés aux profils de charge |
| PRAs | Dernière date de test, résultat | Alerte si test > 90 jours |

### Phase 4 — Autonomisation et résilience collective (J+90+)

**Objectif : rendre l'équipe moins dépendante du N3.**

- Formation N2 sur l'utilisation des templates AWX (diagnostics, redémarrages contrôlés)
- Runbooks complets pour les 10 incidents les plus fréquents
- Guildes mensuelles : partage de retours d'expérience, mise à jour des runbooks
- Tests PRA réguliers : procédure automatisée, résultats documentés

---

## 6️⃣ Points de vigilance à première vue

> **Note :** Ces points sont des hypothèses basées sur la lecture de l'offre. Ils seront confirmés ou infirmés lors des premiers échanges avec l'équipe. L'objectif n'est pas de critiquer l'existant, mais d'identifier où concentrer l'attention.

### 🔐 Gestion des certificats — Risque immédiat

**Signal d'alerte :** La mention explicite des certificats dans la liste des compétences ET dans les missions suggère que ce sujet est actif et potentiellement non automatisé.

**Risque :** Un certificat WebSEAL expiré = service totalement inaccessible pour tous les utilisateurs. C'est un incident P1 évitable à 100%.

**Question à poser :** Y a-t-il aujourd'hui un processus automatisé de surveillance et de renouvellement, ou est-ce géré par alertes calendaires manuelles ?

---

### 🧱 Scripts Bash — Dette technique invisible

**Signal d'alerte :** La demande de "réduction de la dette technique" et de "capitalisation" suggère que des scripts Bash existent, ont été écrits par des personnes qui ne sont peut-être plus là, et sont difficiles à maintenir.

**Risque :** Un script critique qui échoue silencieusement, une procédure documentée uniquement dans la tête d'un expert parti.

**Question à poser :** Quelle est la part de l'outillage RUN actuel qui est versionnée dans Git vs. stockée localement sur des serveurs ?

---

### 🔁 PRAs — Théoriques ou opérationnels ?

**Signal d'alerte :** La garantie des PRAs est citée comme mission, ce qui est rassurant. Mais dans beaucoup d'environnements, les PRAs existent sur papier mais ne sont pas testés régulièrement.

**Risque :** Un PRA non testé est un PRA qui échouera au moment critique. La découverte d'une dépendance manquante pendant une crise réelle est le pire scénario.

**Question à poser :** Quelle est la fréquence de test des PRAs ? Les résultats sont-ils documentés et archivés ?

---

### 🔒 Gestion des secrets — Ansible/AWX

**Signal d'alerte :** L'utilisation d'Ansible et d'AWX pour des opérations sensibles (certificats, déploiements en production) implique une gestion rigoureuse des secrets (mots de passe, clés, tokens).

**Risque :** Des secrets en clair dans des playbooks Ansible ou des variables AWX non chiffrées = risque de compromission et non-conformité.

**Question à poser :** Comment sont gérés les secrets dans l'environnement Ansible/AWX actuel ? Y a-t-il un Vault ou un gestionnaire de secrets centralisé ?

---

### 🔄 Drift de configuration — Configurations fantômes

**Signal d'alerte :** Dans les environnements avec appliances IBM et procédures partiellement manuelles, il est fréquent que la configuration réelle diverge de la configuration documentée ou versionnée.

**Risque :** Une panne causée par une "configuration fantôme" est difficile à diagnostiquer car elle n'est dans aucun runbook.

**Question à poser :** Y a-t-il un mécanisme de détection de drift (vérification que l'état réel = l'état souhaité) ?

---

## 7️⃣ Questions pour calibrer la réalité terrain

Ces questions ne sont pas des pièges — elles montrent que je viens structurer, pas juger.

### Sur l'automatisation et la maturité GitOps

- Quelle part du RUN est aujourd'hui consacrée à des tâches manuelles répétitives ? (Pour calibrer l'effort d'automatisation prioritaire)
- Les playbooks Ansible existants sont-ils structurés en rôles réutilisables, ou plutôt en scripts monolithiques ?
- Quel est le niveau d'utilisation actuel d'AWX — templates existants, fréquence d'exécution, qui peut lancer quoi ?
- Les configurations (Ansible, scripts) sont-elles versionnées dans Git avec des branches par environnement ?

### Sur la sécurité et les certificats

- Quel est le processus actuel de renouvellement des certificats WebSEAL — manuel, semi-automatisé, ou entièrement automatisé ?
- Comment les secrets (mots de passe, tokens) sont-ils gérés dans les playbooks Ansible — Ansible Vault, gestionnaire externe, ou variables en clair ?
- Y a-t-il une revue régulière des accès (IAM / comptes de service) sur les appliances IBM ?

### Sur la résilience et les PRAs

- À quelle fréquence les PRAs sont-ils testés, et comment les résultats sont-ils documentés ?
- En cas de perte d'une appliance IBM, le délai de reconstruction est-il mesuré ? S'appuie-t-on sur des snapshots VM ou sur une reconstruction par le code ?
- Y a-t-il un inventaire à jour de toutes les dépendances du socle STCA (certificats, comptes de service, configurations réseau) ?

### Sur la documentation et la capitalisation

- Où vit actuellement la documentation technique N3 — Confluence, wiki interne, partage réseau, ou uniquement dans les têtes ?
- Y a-t-il des runbooks pour les incidents récurrents, ou chaque incident repart de zéro ?
- Quelle est la fréquence de départ de collaborateurs sur ce périmètre, et comment le savoir est-il transmis ?

---

## 8️⃣ Ouvertures d'évolution

<!-- ### Ce que j'apporte dès le premier jour

| Dimension | Contribution immédiate |
|-----------|----------------------|
| **Stabilité** | Prise en charge N3 des incidents complexes — IBM WebSEAL, Linux, réseau |
| **Automatisation** | Création de rôles Ansible et templates AWX pour les actes à risque prioritaires |
| **Sécurité** | Audit et industrialisation de la gestion des certificats et des secrets |
| **Observabilité** | Dashboards Grafana/Splunk orientés service (pas seulement infrastructure) |
| **Documentation** | Runbooks N3, procédures d'exploitation, post-mortems blameless | -->

### Évolutions possibles selon la maturité de l'équipe

Ces pistes ne sont pas des engagements — ce sont des directions à explorer ensemble selon les priorités et le contexte :

**Évolution 1 — Docs-as-Code systématique**
Transformer le wiki ou Confluence en documentation versionnée dans Git, mise à jour en même temps que le code Ansible. Chaque runbook a un numéro de version, une date de dernière validation, et un propriétaire.

**Évolution 2 — GitOps pour le socle STCA**
Faire de Git la seule source de vérité pour les configurations du socle. Toute modification hors du code est détectée (drift) et corrigée automatiquement ou signalée. Protège l'équipe contre les "configurations fantômes".

**Évolution 3 — Reconstruction Bare Metal par le code**
Passer d'une dépendance aux snapshots VM à une capacité de reconstruction complète depuis Ansible. Réduit drastiquement le RTO en cas de perte d'un composant, et sécurise les PRAs.

**Évolution 4 — Habilitation progressive des N2 via AWX**
Créer des templates AWX que N2 peut exécuter sans accès direct aux appliances — diagnostics, redémarrages contrôlés, vérifications d'état. Réduit la dépendance au N3 sur les incidents courants.

**Évolution 5 — Alerting prédictif**
Dépasser le monitoring réactif (CPU > 80%) pour aller vers des alertes prédictives (tendance à la hausse sur 6h, corrélée avec les pics d'activité métier connus).

---

## 9️⃣ Glossaire de référence

| Terme | Définition rapide |
|-------|-----------------|
| **STCA** | Socle Technique de Chaîne Applicative — périmètre principal de la mission |
| **N3** | Niveau 3 d'expertise — dernier recours technique avant escalade éditeur/constructeur |
| **SPOF** | Single Point of Failure — composant dont la défaillance entraîne une panne totale |
| **Bus Factor** | Nombre de personnes dont le départ mettrait le projet en danger |
| **Drift** | Écart entre la configuration déclarée (code/doc) et l'état réel du système |
| **MCO** | Maintien en Condition Opérationnelle — maintenir les systèmes en état de fonctionner |
| **PRA** | Plan de Reprise d'Activité — procédure pour redémarrer après un sinistre |
| **RTO** | Recovery Time Objective — durée maximale d'interruption acceptable |
| **RPO** | Recovery Point Objective — perte de données maximale acceptable |
| **MTTD** | Mean Time To Detect — délai moyen de détection d'un incident |
| **MTTR** | Mean Time To Repair — délai moyen de rétablissement après incident |
| **MTBF** | Mean Time Between Failures — temps moyen entre deux pannes |
| **IBM WebSEAL** | Reverse proxy de sécurité IBM — composant central du socle STCA |
| **AWX** | Interface web open source pour Ansible — orchestration et scheduling |
| **Docs-as-Code** | Documentation versionnée dans Git, traitée comme du code source |
| **Blameless** | Post-mortem sans recherche de coupable — centré sur les causes systémiques |
| **ITSM** | IT Service Management — gestion des services IT (ITIL, ticketing, SLA) |

---

> 📌 **Note de clôture**
>
> Ce document est intentionnellement non exhaustif. Il représente ma compréhension initiale du besoin, basée sur la lecture de l'offre et le contexte BGPN. Certaines hypothèses seront confirmées ou infirmées dès les premiers échanges avec l'équipe.
>
> Ce que je cherche à montrer ici, c'est une posture : **je viens construire avec l'équipe, pas appliquer une recette toute faite.** Les priorités réelles sont celles de l'équipe et de la direction — mon rôle est de les aider à les atteindre plus vite, avec moins de risques et plus de sérénité.

---

*Document de compréhension du besoin — Mission OPS N3 / Socle STCA — La Poste BGPN*
*Version 1.0 — Ouvert à la révision après premiers échanges terrain*
