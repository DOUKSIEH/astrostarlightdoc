---
title: "📚 AWS Cloud : Réussir le SAA-C03 — Manuel d'entraînement intensif"
description: "Préparer la certification SAA-C03 (AWS Certified Solutions Architect – Associate · Édition française) "
created: "2026-08-04"
# updated: "2026-05-02"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"

---
<!-- 
# Réussir le SAA-C03 — Manuel d'entraînement intensif

### AWS Certified Solutions Architect – Associate · Édition française -->

> **200 questions type examen · Corrigé expert entièrement commenté · Fiches de réflexes « mot-clé → solution » · Stratégie complète pour l'épreuve de 2 h 20**
>
> **Objectif : franchir la barre des 720/1000 dès la première tentative.**

Ce manuel est construit à partir du **guide officiel de l'examen SAA-C03** (domaines, pondérations, énoncés de tâches, périmètre des services), de la **documentation AWS** et de l'analyse de banques de questions d'entraînement. Les 200 questions sont **originales**, rédigées en français sous forme de mises en situation d'architecture, au format et au niveau de l'épreuve réelle.

---

## Sommaire

| # | Partie | Contenu | Temps conseillé |
|---|---|---|---|
| 0 | [Mode d'emploi](#partie-0) | Comment travailler ce manuel, légende typographique | 10 min |
| 1 | [Comprendre l'examen](#partie-1) | Format, notation, domaines, conditions de passage | 20 min |
| 2 | [Stratégie de l'épreuve](#partie-2) | Règle des 2 minutes, méthode des 3 passes, décodage des énoncés | 30 min |
| 3 | [Fiches de réflexes](#partie-3) | 6 tableaux « situation → service » à connaître par cœur | 2 h |
| 4 | [Examen blanc — 200 questions](#partie-4) | 3 séries chronométrées de 65 questions | 3 × 2 h 10 |
| 5 | [Corrigé détaillé commenté](#partie-5) | Réponse, justification, élimination des distracteurs, point clé | 6 h |
| 6 | [Annexes](#partie-6) | Grille de score, répartition par domaine, plan de révision | — |

---

<a id="partie-0"></a>

# Partie 0 — Mode d'emploi

## Légende typographique

Ce manuel utilise une signalétique constante d'un bout à l'autre du document :

| Élément | Rendu | Signification |
|---|---|---|
| Énoncé de question | **Texte en gras noir** | Le contexte et la question posée : à lire intégralement |
| Question finale | **❓ Phrase en gras** | La phrase qui contient le superlatif décisif |
| Options | **A.** · **B.** · **C.** · **D.** · **E.** | Les propositions parmi lesquelles choisir |
| Bonne réponse | <span style="color:#1a7f37"><strong>✅ Texte en vert</strong></span> | La réponse correcte, dans la partie corrigé uniquement |
| Point clé | > 💡 **À retenir** | La règle transposable à toutes les questions du même type |
| Piège | ⚠️ | Confusion classique sanctionnée le jour de l'examen |

> **Note d'affichage** — Le vert des réponses s'appuie sur des balises HTML intégrées au Markdown. Il s'affiche correctement dans **VS Code (aperçu)**, **Obsidian**, **Typora**, **Notion**, ainsi qu'à l'export **HTML** ou **PDF** (Pandoc, Marked, extensions « Markdown PDF »). Sur GitHub, la couleur est neutralisée mais le texte, le gras et les pictogrammes restent parfaitement lisibles.

## Comment travailler ce manuel

**Étape 1 — Poser les fondations (2 h).** Lisez les parties 1 à 3 avant toute chose. Les six fiches de réflexes de la partie 3 résolvent à elles seules environ **70 % des questions de l'examen** : c'est le meilleur rendement de votre temps de révision.

**Étape 2 — S'entraîner en conditions réelles (3 × 2 h 10).** La partie 4 contient 200 questions **mélangées**, sans aucun indice de domaine, exactement comme à l'examen. Découpez-la en trois séries :

| Série | Questions | Durée | Objectif de réussite |
|---|---|---|---|
| Série A | 1 à 65 | 130 minutes | ≥ 47/65 (72 %) |
| Série B | 66 à 130 | 130 minutes | ≥ 50/65 (77 %) |
| Série C | 131 à 200 | 140 minutes | ≥ 56/70 (80 %) |

Notez vos réponses sur une feuille séparée. **Aucune réponse n'apparaît dans la partie 4** : le corrigé est intégralement regroupé en partie 5.

**Étape 3 — Corriger activement (2 h par série).** Ne vous contentez pas de compter les points. Pour **chaque** question — y compris celles que vous avez réussies — lisez la justification et le bloc « À retenir ». Sur les questions ratées, écrivez en une phrase *pourquoi* votre option était fausse : c'est ce geste qui ancre la connaissance.

**Étape 4 — Cibler vos faiblesses.** L'annexe de la partie 6 donne la correspondance question → domaine. Reportez vos résultats dans la grille de score : tout domaine sous 70 % doit être retravaillé avec la fiche de réflexes correspondante avant de passer l'examen.

---

<a id="partie-1"></a>

# Partie 1 — Comprendre l'examen SAA-C03

L'examen **AWS Certified Solutions Architect – Associate (SAA-C03)** valide votre capacité à concevoir sur AWS des architectures **sécurisées, résilientes, performantes et optimisées en coûts**. Il s'adresse aux candidats disposant idéalement d'un an de pratique sur AWS.

## Carte d'identité de l'épreuve

| Caractéristique | Détail |
|---|---|
| **Nombre de questions** | 65 — dont **15 non notées** (questions d'évaluation, indiscernables) : seules 50 comptent |
| **Formats** | QCM à **réponse unique** (1 bonne réponse sur 4) et à **réponses multiples** (2 bonnes réponses sur 5) |
| **Durée** | **130 minutes** d'épreuve (créneau total en salle ≈ 140 minutes, soit 2 h 20) |
| **Score** | Échelle de 100 à 1 000 — **seuil de réussite : 720** |
| **Notation** | **Compensatoire** : seul le score global compte, inutile de réussir chaque domaine |
| **Pénalité** | **Aucune** pour une mauvaise réponse — ne laissez jamais une question vide |
| **Langues** | Disponible en français ; accommodation **« ESL +30 »** (30 minutes supplémentaires) à demander **avant** la réservation |
| **Modalités** | Centre Pearson VUE ou surveillance en ligne |
| **Coût** | 150 USD |
| **Validité** | 3 ans |

## Les quatre domaines officiels

| Domaine | Poids | Questions ici | Ce qui est évalué |
|---|---|---|---|
| **1. Architectures sécurisées** | **30 %** | 60 | IAM (rôles, politiques, moindre privilège), Organizations et SCP, sécurité réseau (SG, NACL, endpoints), chiffrement (KMS, SSE), protection des données (Object Lock, versioning), audit (CloudTrail, Config) |
| **2. Architectures résilientes** | **26 %** | 52 | Découplage (SQS, SNS, EventBridge), haute disponibilité multi-AZ, basculement (Route 53, RDS Multi-AZ), Auto Scaling, reprise après sinistre (RTO/RPO, sauvegardes, PITR) |
| **3. Architectures performantes** | **24 %** | 48 | Choix du stockage (S3, EBS, EFS, FSx), du calcul (EC2, Lambda, Fargate), des bases (RDS, Aurora, DynamoDB, ElastiCache), du réseau (CloudFront, Global Accelerator, Direct Connect), ingestion (Kinesis) |
| **4. Architectures à coûts optimisés** | **20 %** | 40 | Classes de stockage S3 et cycles de vie, modèles d'achat EC2 (On-Demand, RI, Savings Plans, Spot), dimensionnement des bases, réduction des coûts réseau (endpoints, CloudFront), suivi (Cost Explorer, Budgets) |
| | **100 %** | **200** | |

> 💡 **À retenir** — Le domaine 1 pèse à lui seul près d'un tiers de l'épreuve. Une lacune en IAM, chiffrement ou sécurité réseau est mathématiquement la plus coûteuse.

---

<a id="partie-2"></a>

# Partie 2 — Stratégie de l'épreuve

## 1. Gérer le temps : la règle des 2 minutes

130 minutes pour 65 questions, soit **2 minutes par question**. En pratique, procédez en **trois passes** :

| Passe | Durée | Ce que vous faites |
|---|---|---|
| **Passe 1** | 75 min | Répondez à toutes les questions « évidentes » en **moins de 90 secondes** chacune. Marquez (*flag*) celles qui demandent réflexion **sans vous y attarder**. |
| **Passe 2** | 40 min | Revenez sur les questions marquées, l'esprit reposé et le vocabulaire de l'examen réactivé. |
| **Passe 3** | 15 min | Vérifiez que **chaque question a une réponse** et relisez vos hésitations. |

⚠️ **Le piège numéro un est le temps, pas la difficulté.** Rester bloqué 6 minutes sur une question en fait perdre trois autres. Une question marquée et laissée de côté est presque toujours résolue plus vite au second passage.

## 2. Décoder l'énoncé : les mots-clés qui donnent la réponse

Les questions AWS sont écrites selon des schémas récurrents. Le superlatif de la dernière phrase désigne quasiment toujours la famille de réponse attendue :

| Expression dans l'énoncé | Ce que l'examen attend |
|---|---|
| **« MOST cost-effective »** / la plus rentable | La solution **la moins chère qui satisfait TOUTES les exigences** : Spot, S3 IA/Glacier, serverless, gateway endpoints, Reserved Instances |
| **« LEAST operational overhead »** / le moins d'effort opérationnel | Le service **le plus managé / serverless** : Lambda, Fargate, Aurora, DynamoDB. ⚠️ Éliminez les réponses avec EC2 auto-géré, scripts maison, cron |
| **« Highly available »** / hautement disponible | **Multi-AZ obligatoire** : ASG sur ≥ 2 AZ + ELB, RDS Multi-AZ, une NAT gateway par AZ. ⚠️ Une ressource unique est **toujours** fausse |
| **« Near real-time »** / quasi temps réel | **Kinesis** (Data Streams pour consommer, Firehose pour livrer). ⚠️ SQS sert au découplage, pas à l'analytique temps réel |
| **« Decouple »** / découpler | **SQS** (files), **SNS** (fan-out), **EventBridge** (routage d'événements) |
| **« Immutable / WORM / conformité »** | **S3 Object Lock** — mode *Compliance* si même le compte racine ne doit pas pouvoir supprimer |
| **« Minimal changes »** / sans modifier l'application | La solution qui **ne réécrit pas le code** : lift-and-shift, services compatibles (Amazon MQ, RDS même moteur, FSx) |
| **« Fully managed »** / entièrement géré | Écartez tout ce qui suppose d'administrer un serveur, d'appliquer des correctifs ou d'écrire un script de maintenance |
| **« Without exposing to the internet »** | VPC endpoints, PrivateLink, sous-réseaux privés, Session Manager — jamais d'IP publique ni de bastion |

## 3. La méthode d'élimination en quatre étapes

1. **Lisez la dernière phrase d'abord.** Elle contient la vraie question et son superlatif : coût ? effort opérationnel ? performance ? disponibilité ?
2. **Relevez les contraintes de l'énoncé** : RTO/RPO, protocole (NFS, SMB, AMQP), système d'exploitation, budget, délai, obligation réglementaire, « sans modifier l'application ».
3. **Éliminez les deux options qui violent une contrainte** : ressource unique alors que la haute disponibilité est exigée, service inadapté au protocole, accès public alors que l'accès privé est demandé, EC2 auto-géré alors que l'effort minimal est demandé.
4. **Entre les deux options restantes, choisissez celle qui satisfait le superlatif.** En cas de doute absolu : **la réponse la plus managée et répartie sur plusieurs zones de disponibilité est statistiquement la bonne.**

## 4. Les cinq erreurs qui coûtent le plus de points

| Erreur | Correction |
|---|---|
| Choisir une réponse **techniquement possible** mais qui ignore le superlatif | Deux options sont souvent valides : une seule est *la plus* économique / la moins opérationnelle |
| Confondre **RDS Multi-AZ** et **read replica** | Multi-AZ = disponibilité (standby **non interrogeable**) · Read replica = montée en charge en lecture |
| Confondre **EFS** et **FSx for Windows** | NFS/Linux → EFS · SMB/NTFS/Active Directory → FSx for Windows |
| Répondre **Spot** pour une charge critique | Spot exige *stateless* + *interruptible* explicitement mentionnés dans l'énoncé |
| Laisser une question **sans réponse** | Aucune pénalité : répondez toujours, même au hasard éclairé |

---

<a id="partie-3"></a>

# Partie 3 — Fiches de réflexes indispensables

Ces six tableaux constituent le cœur du programme. Objectif : lire la colonne de gauche et produire la colonne de droite **sans hésiter**.

## Fiche 1 — Stockage (S3, EBS, EFS, FSx)

| Situation / besoin | Réflexe SAA-C03 |
|---|---|
| Objets, site statique, data lake, sauvegardes | **S3** — durabilité 11 neufs, capacité illimitée |
| Accès fréquent → rare → archive | **S3 Standard** → **Standard-IA** (après 30 j) → **Glacier Instant / Flexible / Deep Archive** (restitution 12 h) |
| Schéma d'accès **inconnu ou changeant** | **S3 Intelligent-Tiering** (aucun frais de récupération) |
| Disque bloc attaché à une instance EC2 (une seule AZ) | **EBS** — *gp3* usage général, *io2* IOPS élevées ; snapshots stockés dans S3 |
| Fichiers partagés **Linux (NFS)**, multi-AZ, élastique | **EFS** |
| Fichiers partagés **Windows (SMB, Active Directory)** | **FSx for Windows File Server** |
| HPC, machine learning, très hautes performances fichiers | **FSx for Lustre** (intégration native S3) |
| Stockage hybride on-premises avec cache local | **Storage Gateway** (File / Volume / Tape Gateway) |
| Disque éphémère ultra-rapide (perdu à l'arrêt) | **Instance Store** |
| Données recréables, tolérantes à la perte d'une AZ | **S3 One Zone-IA** |
| Objets inaltérables (WORM, conformité) | **S3 Object Lock** — *Compliance* (absolu) / *Governance* (contournable) |

## Fiche 2 — Bases de données

| Situation / besoin | Réflexe SAA-C03 |
|---|---|
| Relationnel managé classique (MySQL, PostgreSQL, Oracle, SQL Server) | **RDS** — HA = **Multi-AZ** (standby non lisible) · lectures = **read replicas** |
| Relationnel haute performance cloud-native | **Aurora** — 6 copies sur 3 AZ, jusqu'à 15 réplicas |
| Charge relationnelle intermittente ou imprévisible | **Aurora Serverless** |
| Clé-valeur, latence milliseconde, échelle massive | **DynamoDB** · microseconde → **+ DAX** · multi-régions → **tables globales** |
| Cache en mémoire | **ElastiCache** — *Redis* (riche, persistant, réplication) / *Memcached* (simple, horizontal) |
| Entrepôt analytique (OLAP), BI sur plusieurs pétaoctets | **Redshift** |
| Restauration **à la seconde près** | **PITR** — RDS 35 j, DynamoDB 35 j |
| Base de graphes / séries temporelles / ledger | **Neptune** / **Timestream** / **QLDB** |
| Migration de base (même moteur ou hétérogène) | **DMS** (+ **SCT** en cas de changement de moteur) |

## Fiche 3 — Réseau et diffusion de contenu

| Situation / besoin | Réflexe SAA-C03 |
|---|---|
| CDN : cache mondial HTTP(S), contenu statique **et** dynamique | **CloudFront** (+ **OAC** pour verrouiller l'accès au bucket S3) |
| TCP/UDP mondial, IP anycast statiques, basculement rapide | **Global Accelerator** |
| Lien privé dédié on-premises ↔ AWS, débit constant garanti | **Direct Connect** (HA : deux connexions, ou VPN de secours) |
| Connexion chiffrée rapide à mettre en place via Internet | **Site-to-Site VPN** |
| Interconnecter des dizaines de VPC et l'on-premises | **Transit Gateway** (hub) · seulement 2 VPC → **VPC peering** |
| Accès privé à **S3 / DynamoDB** depuis un VPC | **Gateway endpoint** (**gratuit**) · autres services → **Interface endpoint / PrivateLink** |
| DNS : basculement, latence, géolocalisation, pondération | **Route 53** (politiques *failover* / *latency* / *geolocation* / *weighted*) |
| Répartition HTTP de niveau 7 (chemins, hôtes, en-têtes) | **ALB** · TCP/UDP niveau 4, IP statique, débit extrême → **NLB** |
| Uploads S3 lents depuis l'autre bout du monde | **S3 Transfer Acceleration** |
| Latence réseau minimale **entre instances EC2** | **Cluster placement group** (+ Enhanced Networking / EFA) |

## Fiche 4 — Sécurité et identité

| Situation / besoin | Réflexe SAA-C03 |
|---|---|
| EC2 / Lambda doit appeler un service AWS | **Rôle IAM** — ⚠️ jamais de clés d'accès en dur |
| Accès inter-comptes | **Rôle IAM assumé via STS** (relation d'approbation), jamais de clés partagées |
| Interdire des services ou des régions à des comptes entiers | **SCP** (AWS Organizations) |
| Secrets avec **rotation automatique** | **Secrets Manager** · simple paramètre de configuration → **Parameter Store** |
| Chiffrement au repos avec **audit d'usage des clés** | **SSE-KMS** (clé gérée par le client) + **CloudTrail** |
| Injection SQL / XSS / filtrage niveau 7 | **WAF** · DDoS → **Shield** · les deux à l'échelle de l'organisation → **Firewall Manager** |
| Inspection et filtrage du trafic VPC (type pare-feu) | **Network Firewall** |
| « Qui a appelé quelle API ? » | **CloudTrail** · état et conformité des ressources → **Config** |
| Détection de menaces (logs DNS, VPC, CloudTrail) | **GuardDuty** · vulnérabilités EC2/ECR → **Inspector** · données sensibles dans S3 → **Macie** |
| Shell sur une instance EC2 **sans port ouvert ni bastion** | **SSM Session Manager** |
| Fédération d'identités d'entreprise | **IAM Identity Center** (SSO) / SAML 2.0 · utilisateurs applicatifs → **Cognito** |

## Fiche 5 — Calcul, conteneurs et intégration

| Situation / besoin | Réflexe SAA-C03 |
|---|---|
| Événementiel, exécution < 15 min, sans serveur | **Lambda** |
| Conteneurs **sans gérer d'instances** | **Fargate** (ECS ou EKS) · interruptible → **Fargate Spot** |
| Découpler producteur et consommateur | **SQS** · ordre strict + traitement unique → **SQS FIFO** |
| Un message vers **plusieurs** destinataires | **SNS** (fan-out vers plusieurs files SQS) |
| Routage d'événements entre services et SaaS | **EventBridge** |
| Broker ActiveMQ / RabbitMQ existant, **sans réécriture** | **Amazon MQ** |
| Streaming temps réel, relecture, multi-consommateurs | **Kinesis Data Streams** · livraison simple vers S3/Redshift → **Firehose** |
| Orchestration de workflows avec états et reprises | **Step Functions** |
| SQL ad hoc sur des fichiers S3 | **Athena** · tableaux de bord → **QuickSight** · ETL et catalogue → **Glue** |
| Transfert réseau récurrent on-premises → AWS | **DataSync** · > 10 To hors ligne → **Snowball Edge** |
| Ingestion sans code depuis un SaaS (Salesforce, Zendesk…) | **AppFlow** |

## Fiche 6 — Optimisation des coûts

| Situation / besoin | Réflexe SAA-C03 |
|---|---|
| Charge stable 24/7 | **Reserved Instances / Savings Plans** (jusqu'à −72 %) |
| Batch *stateless* tolérant aux interruptions | **EC2 Spot** (jusqu'à −90 %, préavis de 2 minutes) |
| Charge intermittente qu'on démarre et arrête | **On-Demand** (on ne paie que les heures utilisées) |
| Capacité **garantie** sur une courte période, sans engagement | **On-Demand Capacity Reservation** |
| Trafic DynamoDB imprévisible | **Mode on-demand** · prévisible et soutenu → **provisionné + auto scaling** |
| Coûts de NAT gateway pour joindre S3 ou DynamoDB | **Gateway VPC endpoint** (gratuit) |
| Coûts de transfert sortant vers Internet | **CloudFront** (cache + tarif de sortie réduit) |
| Analyser et visualiser la dépense | **Cost Explorer** · alerter sur un seuil → **Budgets** · données brutes détaillées → **CUR** |
| Base RDS utilisée seulement quelques jours par mois | **Snapshot + restauration** ⚠️ l'arrêt d'une instance RDS est limité à **7 jours** |
| Réduire automatiquement le coût S3 sans connaître les accès | **S3 Intelligent-Tiering** |

---

<a id="partie-4"></a>

# Partie 4 — Examen blanc : 200 questions

Les questions sont **mélangées** : elles ne sont pas regroupées par domaine et aucun indice de domaine n'est visible, exactement comme le jour de l'examen. Le nombre de réponses attendues est indiqué sous chaque numéro.

**Aucune réponse n'apparaît dans cette partie.** Cochez vos choix au fil de l'eau, puis corrigez-vous avec la [partie 5](#partie-5).

---

<a id="serie-1"></a>

## ⏱️ Série A — Questions 1 à 65

> **Chronomètre : 130 minutes.** Objectif : ≥ 47 bonnes réponses (72 %)
> Notez vos réponses sur une feuille séparée, sans consulter le corrigé.

---

<a id="q1"></a>

### Question 1

`Réponse unique`

**Une entreprise exécute des instances Amazon EC2 dans des sous-réseaux privés d'un VPC. Ces instances doivent lire et écrire des objets dans un compartiment Amazon S3 situé dans la même Région. La politique de sécurité interdit que ce trafic transite par Internet. L'équipe souhaite également éviter des frais de traitement de données supplémentaires.**

**❓ Quelle solution répond à ces exigences avec le moins d'effort opérationnel ?**

- **A.** Déployer une NAT gateway dans un sous-réseau public et router le trafic sortant des sous-réseaux privés vers cette NAT gateway.
- **B.** Déployer un serveur proxy sur une instance EC2 dans un sous-réseau public et faire transiter les appels S3 par ce proxy.
- **C.** Établir une connexion AWS Site-to-Site VPN entre le VPC et le point de terminaison public d'Amazon S3.
- **D.** Créer un point de terminaison VPC de type Gateway pour Amazon S3 et ajouter la route correspondante dans les tables de routage des sous-réseaux privés.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c1)</sub>

---

<a id="q2"></a>

### Question 2

`Réponse unique`

**Une application de commerce en ligne écrit chaque commande directement dans une flotte d'instances EC2 chargées du traitement. Lors des opérations promotionnelles, le volume de commandes est multiplié par vingt en quelques minutes ; les instances saturent et des commandes sont perdues.**

**❓ Quelle solution garantit qu'aucune commande n'est perdue et permet à la couche de traitement d'absorber les pics ?**

- **A.** Augmenter la taille des instances EC2 de traitement et activer la surveillance détaillée CloudWatch.
- **B.** Publier les commandes dans une file Amazon SQS et placer les instances de traitement dans un groupe Auto Scaling qui se dimensionne sur la profondeur de la file.
- **C.** Écrire les commandes dans un volume Amazon EBS partagé et les lire par lots toutes les heures.
- **D.** Placer les instances de traitement derrière un Application Load Balancer avec des sessions persistantes.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c2)</sub>

---

<a id="q3"></a>

### Question 3

`Réponse unique`

**Une application de gestion documentaire s'exécute sur plusieurs instances EC2 Linux réparties dans trois zones de disponibilité derrière un Application Load Balancer. Toutes les instances doivent lire et écrire simultanément les mêmes fichiers via un système de fichiers POSIX, et le stockage doit croître automatiquement.**

**❓ Quelle solution de stockage répond à ce besoin ?**

- **A.** Un volume de stockage d'instance (instance store) répliqué par un script de synchronisation.
- **B.** Un système de fichiers Amazon EFS monté par toutes les instances, avec des cibles de montage dans chaque zone de disponibilité.
- **C.** Un compartiment Amazon S3 monté en tant que lecteur réseau sur chaque instance.
- **D.** Un volume Amazon EBS io2 attaché en Multi-Attach aux instances.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c3)</sub>

---

<a id="q4"></a>

### Question 4

`Réponse unique`

**Une équipe d'analystes travaille dans le compte AWS « Analytique » et doit lire des objets d'un compartiment S3 hébergé dans le compte « Production ». Les données sont sensibles et l'entreprise interdit la création d'utilisateurs IAM supplémentaires ou le partage d'identifiants d'accès à long terme.**

**❓ Quelle approche est la plus sécurisée ?**

- **A.** Créer un utilisateur IAM dans le compte Production et transmettre ses clés d'accès aux analystes.
- **B.** Rendre le compartiment public en lecture et restreindre l'accès par une condition sur l'adresse IP source.
- **C.** Copier chaque nuit les objets vers un compartiment du compte Analytique à l'aide d'un script planifié.
- **D.** Créer dans le compte Production un rôle IAM approuvant le compte Analytique, autoriser les analystes à l'assumer via AWS STS et accorder à ce rôle un accès en lecture au compartiment.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c4)</sub>

---

<a id="q5"></a>

### Question 5

`Réponse unique`

**Une société conserve les journaux applicatifs dans Amazon S3. Les journaux sont consultés fréquemment pendant 30 jours, puis presque jamais. La réglementation impose de les garder 7 ans. En cas de contrôle, un délai de restitution de 12 heures est acceptable.**

**❓ Quelle solution minimise le coût de stockage ?**

- **A.** Répliquer les objets vers un compartiment S3 One Zone-IA dans une autre Région après 30 jours.
- **B.** Appliquer une règle de cycle de vie qui déplace les objets vers S3 Glacier Deep Archive après 30 jours, puis les supprime après 7 ans.
- **C.** Appliquer une règle de cycle de vie qui déplace les objets vers S3 Standard-IA après 30 jours et les y laisse 7 ans.
- **D.** Conserver tous les objets dans S3 Standard et activer le versioning.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c5)</sub>

---

<a id="q6"></a>

### Question 6

`Réponses multiples — choisissez **deux** réponses`

**Une plateforme de traitement d'images doit distribuer chaque événement « nouvelle image » à quatre microservices indépendants (vignettes, indexation, modération, facturation). Chaque microservice consomme à son rythme et aucun événement ne doit être perdu, même si un microservice est indisponible plusieurs heures.**

**❓ Quelle combinaison d'actions répond à ces exigences ?**

- **A.** Publier chaque événement dans une rubrique Amazon SNS à laquelle sont abonnées quatre files Amazon SQS, une par microservice.
- **B.** Stocker les événements dans un volume Amazon EBS et faire interroger ce volume par les microservices.
- **C.** Envoyer les événements dans une seule file Amazon SQS lue par les quatre microservices.
- **D.** Associer une file de lettres mortes (DLQ) à chaque file SQS afin d'isoler les messages dont le traitement échoue de façon répétée.
- **E.** Invoquer directement les quatre microservices en parallèle depuis l'application, en mode synchrone.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c6)</sub>

---

<a id="q7"></a>

### Question 7

`Réponse unique`

**Une application de réservation utilise une base Amazon RDS for MySQL mono-AZ. Le tableau de bord montre une utilisation CPU proche de 90 % causée à 80 % par des requêtes de lecture de type reporting. Les écritures restent modérées. L'entreprise veut soulager la base sans modifier le code de la couche d'écriture.**

**❓ Quelle solution est la plus adaptée ?**

- **A.** Créer des réplicas en lecture Amazon RDS et diriger les requêtes de reporting vers leur point de terminaison.
- **B.** Activer le déploiement Multi-AZ et diriger les lectures vers l'instance de secours.
- **C.** Augmenter le nombre d'IOPS provisionnées du volume de stockage.
- **D.** Migrer la base vers Amazon DynamoDB et réécrire les requêtes SQL.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c7)</sub>

---

<a id="q8"></a>

### Question 8

`Réponse unique`

**Une application s'authentifie auprès d'une base Amazon RDS avec un mot de passe stocké en clair dans un fichier de configuration sur les instances EC2. L'équipe sécurité impose désormais le chiffrement de ce secret et sa rotation automatique tous les 30 jours, sans interruption de service.**

**❓ Quelle solution répond à ces exigences avec le moins d'effort opérationnel ?**

- **A.** Stocker le mot de passe dans un paramètre SecureString de AWS Systems Manager Parameter Store et écrire une fonction Lambda planifiée pour le changer.
- **B.** Stocker le mot de passe dans une variable d'environnement chiffrée du modèle de lancement du groupe Auto Scaling.
- **C.** Stocker le secret dans AWS Secrets Manager, activer la rotation gérée pour Amazon RDS et faire récupérer le secret par l'application via un rôle IAM.
- **D.** Chiffrer le fichier de configuration avec AWS KMS et le déchiffrer au démarrage de l'application.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c8)</sub>

---

<a id="q9"></a>

### Question 9

`Réponse unique`

**Un environnement de développement et de test comprend 120 instances EC2 On-Demand qui fonctionnent 24 h/24, 7 j/7. Après analyse, les développeurs n'y accèdent qu'en semaine, de 8 h à 20 h. L'entreprise veut réduire la facture sans supprimer d'environnement.**

**❓ Quelle solution offre la meilleure réduction de coût pour un effort minimal ?**

- **A.** Automatiser l'arrêt et le démarrage des instances hors des heures ouvrées, par exemple avec des règles Amazon EventBridge planifiées et AWS Systems Manager.
- **B.** Convertir les instances en instances Spot et gérer les interruptions dans l'application.
- **C.** Redimensionner toutes les instances vers un type plus petit et conserver un fonctionnement continu.
- **D.** Acheter des Reserved Instances de 3 ans pour les 120 instances.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c9)</sub>

---

<a id="q10"></a>

### Question 10

`Réponse unique`

**Une base Amazon RDS for PostgreSQL mono-AZ héberge une application de production. L'entreprise exige désormais un basculement automatique en cas de défaillance de la zone de disponibilité ou de l'instance, avec un objectif de temps de reprise de quelques minutes et aucune modification de l'application.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Modifier l'instance de base de données pour activer le déploiement Multi-AZ.
- **B.** Créer un réplica en lecture dans une autre zone de disponibilité et le promouvoir manuellement en cas d'incident.
- **C.** Planifier des instantanés toutes les 5 minutes et automatiser la restauration.
- **D.** Placer l'instance RDS derrière un Network Load Balancer réparti sur deux zones de disponibilité.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c10)</sub>

---

<a id="q11"></a>

### Question 11

`Réponse unique`

**Une équipe de recherche exécute une simulation numérique fortement couplée : les nœuds de calcul échangent en permanence des messages MPI et le temps de simulation dépend directement de la latence réseau entre les instances.**

**❓ Quelle configuration offre les meilleures performances réseau ?**

- **A.** Placer les instances derrière un Network Load Balancer pour équilibrer les échanges entre nœuds.
- **B.** Lancer les instances dans un groupe de placement en cluster (cluster placement group), au sein d'une même zone de disponibilité, avec des types d'instances prenant en charge Elastic Fabric Adapter.
- **C.** Répartir les instances dans un groupe de placement de type spread sur trois zones de disponibilité.
- **D.** Activer AWS Global Accelerator devant les nœuds de calcul.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c11)</sub>

---

<a id="q12"></a>

### Question 12

`Réponses multiples — choisissez **deux** réponses`

**Après un incident d'exposition de données, une entreprise veut garantir qu'aucun compartiment S3, dans aucun des 40 comptes de son organisation AWS Organizations, ne puisse être rendu accessible publiquement, même par un administrateur de compte membre.**

**❓ Quelle combinaison d'actions répond à cette exigence ?**

- **A.** Attacher une politique de contrôle des services (SCP) qui refuse les appels de désactivation de S3 Block Public Access et la mise en place de politiques publiques.
- **B.** Activer le paramètre S3 Block Public Access au niveau de chaque compte pour bloquer les ACL et les politiques publiques.
- **C.** Activer Amazon GuardDuty dans tous les comptes.
- **D.** Activer le versioning et MFA Delete sur tous les compartiments.
- **E.** Activer le chiffrement par défaut SSE-KMS sur tous les compartiments.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c12)</sub>

---

<a id="q13"></a>

### Question 13

`Réponse unique`

**Une entreprise doit transférer 500 To d'archives depuis son centre de données vers Amazon S3. La liaison Internet du site est de 1 Gbit/s et déjà utilisée à 60 % par la production. La migration doit être terminée en moins de deux semaines.**

**❓ Quelle solution est la plus appropriée ?**

- **A.** Déployer AWS DataSync sur site et planifier la synchronisation en dehors des heures ouvrées.
- **B.** Commander des équipements AWS Snowball Edge Storage Optimized, y copier les données sur site, puis les renvoyer à AWS pour importation dans S3.
- **C.** Établir une connexion AWS Direct Connect de 1 Gbit/s dédiée à la migration.
- **D.** Copier les données vers S3 avec la CLI AWS en activant les téléversements multipart et l'accélération de transfert.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c13)</sub>

---

<a id="q14"></a>

### Question 14

`Réponse unique`

**Une application web s'exécute sur un groupe Auto Scaling d'instances EC2 derrière un Application Load Balancer. Les sessions utilisateurs sont stockées en mémoire sur chaque instance : lorsqu'une instance est remplacée lors d'un événement de scaling, les utilisateurs sont déconnectés et perdent leur panier.**

**❓ Quelle solution rend l'architecture tolérante au remplacement des instances ?**

- **A.** Augmenter le délai de refroidissement (cooldown) du groupe Auto Scaling.
- **B.** Externaliser l'état des sessions dans un cluster Amazon ElastiCache for Redis partagé par les instances.
- **C.** Activer la protection contre la terminaison sur toutes les instances.
- **D.** Activer les sessions persistantes (sticky sessions) sur l'Application Load Balancer.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c14)</sub>

---

<a id="q15"></a>

### Question 15

`Réponses multiples — choisissez **deux** réponses`

**Un site média sert à des utilisateurs répartis sur trois continents un catalogue d'images et de vidéos volumineux ainsi que des pages dynamiques générées par une application derrière un Application Load Balancer. Les utilisateurs éloignés de la Région se plaignent de temps de chargement élevés.**

**❓ Quelle combinaison d'actions améliore le plus les performances perçues ?**

- **A.** Ajouter un réplica en lecture de la base de données dans la Région principale.
- **B.** Héberger les fichiers statiques (images, vidéos, CSS, JavaScript) dans Amazon S3 et les servir via une distribution Amazon CloudFront.
- **C.** Activer les sessions persistantes sur l'Application Load Balancer.
- **D.** Augmenter la taille des instances EC2 derrière l'Application Load Balancer.
- **E.** Configurer l'Application Load Balancer comme origine d'une distribution CloudFront afin de mettre en cache et d'accélérer le contenu dynamique au plus près des utilisateurs.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c15)</sub>

---

<a id="q16"></a>

### Question 16

`Réponse unique`

**Une entreprise découvre que plusieurs volumes Amazon EBS de production ne sont pas chiffrés. La politique de conformité impose le chiffrement au repos de toutes les données, avec des clés gérées dans AWS KMS. Une courte fenêtre de maintenance est autorisée.**

**❓ Quelle procédure permet de chiffrer ces volumes existants ?**

- **A.** Attacher un nouveau volume chiffré et activer le chiffrement par défaut de la Région, ce qui chiffre rétroactivement les volumes existants.
- **B.** Activer le chiffrement directement sur les volumes existants depuis la console Amazon EC2.
- **C.** Créer un instantané de chaque volume, copier l'instantané en activant le chiffrement avec une clé KMS, créer un volume à partir de la copie chiffrée et le rattacher à l'instance.
- **D.** Déplacer les données vers Amazon S3 avec le chiffrement SSE-KMS, puis recréer les volumes.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c16)</sub>

---

<a id="q17"></a>

### Question 17

`Réponses multiples — choisissez **deux** réponses`

**Une entreprise exécute deux types de charges sur Amazon EC2 : un socle de production stable et prévisible fonctionnant en continu depuis deux ans, et des traitements analytiques par lots exécutés la nuit, qui peuvent être interrompus et relancés sans conséquence.**

**❓ Quelle combinaison de modèles d'achat minimise le coût total ?**

- **A.** Exécuter les traitements par lots sur des instances Dedicated Hosts.
- **B.** Souscrire un Compute Savings Plan de 1 ou 3 ans couvrant la consommation de base de la production.
- **C.** Acheter des Reserved Instances Standard de 3 ans pour les traitements par lots.
- **D.** Exécuter la production sur des instances Spot pour bénéficier des remises maximales.
- **E.** Exécuter les traitements par lots sur des instances Spot, avec reprise automatique des tâches interrompues.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c17)</sub>

---

<a id="q18"></a>

### Question 18

`Réponse unique`

**Une entreprise doit préparer un plan de reprise après sinistre inter-Régions pour une application critique s'appuyant sur Amazon Aurora MySQL. L'objectif de point de reprise (RPO) est inférieur à une minute et l'objectif de temps de reprise (RTO) est inférieur à quinze minutes.**

**❓ Quelle stratégie répond à ces objectifs ?**

- **A.** Exporter les données vers Amazon S3 toutes les six heures et activer la réplication interrégionale du compartiment.
- **B.** Activer les sauvegardes automatiques et s'appuyer sur la restauration à un instant donné dans la Région principale.
- **C.** Déployer une base de données globale Amazon Aurora Global Database avec un cluster secondaire en lecture dans la seconde Région, promouvable en cas de sinistre, et une infrastructure applicative réduite prête à monter en charge.
- **D.** Copier chaque nuit les instantanés Aurora vers la Région secondaire et les restaurer en cas de sinistre.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c18)</sub>

---

<a id="q19"></a>

### Question 19

`Réponse unique`

**Les administrateurs se connectent aux instances EC2 des sous-réseaux privés via un hôte bastion exposé sur Internet avec le port 22 ouvert. L'équipe sécurité veut supprimer ce bastion, fermer tous les ports entrants et disposer d'un journal auditable des sessions d'administration.**

**❓ Quelle solution répond à ces exigences ?**

- **A.** Déployer AWS Client VPN et laisser le port 22 ouvert vers le VPC.
- **B.** Utiliser AWS Systems Manager Session Manager avec l'agent SSM et un rôle d'instance, sans aucune règle entrante dans les groupes de sécurité, et journaliser les sessions dans Amazon S3 ou CloudWatch Logs.
- **C.** Restreindre le port 22 du bastion aux adresses IP du siège et activer les journaux de flux VPC.
- **D.** Remplacer le bastion par une NAT gateway et se connecter en SSH à travers celle-ci.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c19)</sub>

---

<a id="q20"></a>

### Question 20

`Réponse unique`

**Une application de jeu mobile utilise Amazon DynamoDB pour stocker les profils de joueurs. La table absorbe des millions de lectures par seconde sur un petit nombre d'éléments très populaires, et les développeurs constatent des latences de quelques millisecondes qu'ils souhaitent réduire à la microseconde sans réécrire la logique d'accès.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Déployer un cluster Amazon DynamoDB Accelerator (DAX) devant la table et faire pointer l'application sur le point de terminaison DAX.
- **B.** Activer le mode de capacité à la demande sur la table DynamoDB.
- **C.** Créer un index secondaire global sur la clé de partition existante.
- **D.** Activer DynamoDB Streams et alimenter un cache applicatif via AWS Lambda.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c20)</sub>

---

<a id="q21"></a>

### Question 21

`Réponse unique`

**Une entreprise diffuse des vidéos de formation payantes stockées dans un compartiment Amazon S3 privé, via une distribution Amazon CloudFront. Les vidéos ne doivent être accessibles qu'aux abonnés authentifiés, pendant une durée limitée, et jamais directement depuis l'URL du compartiment.**

**❓ Quelle solution répond à ces exigences ?**

- **A.** Rendre le compartiment public en lecture et obscurcir les noms d'objets.
- **B.** Configurer un contrôle d'accès à l'origine (Origin Access Control) autorisant seulement CloudFront à lire le compartiment, et distribuer des URL signées CloudFront à durée de validité limitée.
- **C.** Placer une politique de compartiment autorisant l'accès depuis les plages d'adresses IP des abonnés.
- **D.** Activer le chiffrement SSE-KMS sur le compartiment et partager la clé avec les abonnés.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c21)</sub>

---

<a id="q22"></a>

### Question 22

`Réponse unique`

**Une application bancaire envoie des opérations de débit et de crédit vers un service de traitement. Chaque opération doit être traitée exactement une fois et dans l'ordre strict d'émission pour un même compte client.**

**❓ Quelle solution répond à cette exigence ?**

- **A.** Une file Amazon SQS standard, avec tri applicatif sur un horodatage.
- **B.** Amazon Data Firehose vers Amazon S3, suivi d'un traitement par lots.
- **C.** Une file Amazon SQS FIFO avec un identifiant de groupe de messages correspondant au compte client et la déduplication activée.
- **D.** Une rubrique Amazon SNS standard avec plusieurs abonnés.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c22)</sub>

---

<a id="q23"></a>

### Question 23

`Réponse unique`

**Une plateforme IoT collecte les mesures de 200 000 capteurs. Les données doivent être analysées en quasi temps réel par plusieurs applications simultanées (détection d'anomalies, tableau de bord, archivage), et chaque application doit pouvoir relire les données des 24 dernières heures en cas de bogue.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Écrire les mesures dans une file Amazon SQS standard lue par les trois applications.
- **B.** Envoyer les mesures dans une rubrique Amazon SNS avec trois abonnements HTTP.
- **C.** Ingérer les mesures dans Amazon Kinesis Data Streams, avec plusieurs consommateurs indépendants et une rétention configurée à 24 heures ou plus.
- **D.** Écrire les mesures directement dans Amazon S3 et analyser les fichiers avec Amazon Athena toutes les heures.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c23)</sub>

---

<a id="q24"></a>

### Question 24

`Réponse unique`

**Une entreprise stocke dans Amazon S3 des jeux de données dont les profils d'accès sont imprévisibles : certains objets sont consultés quotidiennement pendant des mois, d'autres jamais après leur création. L'équipe ne veut pas analyser les accès ni maintenir des règles de transition complexes.**

**❓ Quelle solution optimise le coût avec le moins d'effort opérationnel ?**

- **A.** Stocker tous les objets dans S3 Standard-IA.
- **B.** Utiliser la classe S3 Intelligent-Tiering, qui déplace automatiquement chaque objet entre les paliers d'accès selon son utilisation réelle.
- **C.** Créer une règle de cycle de vie qui transfère tous les objets vers S3 Glacier Instant Retrieval après 30 jours.
- **D.** Analyser mensuellement les journaux d'accès S3 et déplacer les objets manuellement.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c24)</sub>

---

<a id="q25"></a>

### Question 25

`Réponse unique`

**Une application web publique subit régulièrement des attaques par injection SQL et des scripts intersites, provenant d'adresses IP changeantes. Elle est hébergée derrière un Application Load Balancer. L'entreprise veut bloquer ces requêtes avant qu'elles n'atteignent l'application et limiter le nombre de requêtes par adresse IP.**

**❓ Quelle solution répond à ces exigences ?**

- **A.** Configurer des listes de contrôle d'accès réseau (NACL) pour bloquer les adresses IP malveillantes.
- **B.** Déployer Amazon Inspector sur les instances EC2 cibles.
- **C.** Activer les journaux de flux VPC et analyser le trafic avec Amazon Athena.
- **D.** Associer AWS WAF à l'Application Load Balancer avec les groupes de règles managés (SQLi, XSS) et une règle de type rate-based.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c25)</sub>

---

<a id="q26"></a>

### Question 26

`Réponses multiples — choisissez **deux** réponses`

**Une entreprise doit centraliser les sauvegardes de ses volumes Amazon EBS, de ses bases Amazon RDS et de ses systèmes de fichiers Amazon EFS répartis dans plusieurs comptes de son organisation. Un audit exige une politique de rétention uniforme, une copie des sauvegardes dans une seconde Région et l'impossibilité de supprimer une sauvegarde avant la fin de sa rétention.**

**❓ Quelle combinaison d'actions répond à ces exigences ?**

- **A.** Écrire des scripts AWS Lambda planifiés qui créent des instantanés pour chaque service.
- **B.** Activer le versioning S3 sur un compartiment de destination et y exporter les instantanés.
- **C.** Activer AWS Backup Vault Lock en mode conformité sur les coffres de sauvegarde.
- **D.** Utiliser AWS Backup avec un plan de sauvegarde appliqué par étiquettes, incluant une règle de copie interrégionale vers un coffre de sauvegarde secondaire.
- **E.** Activer la réplication interrégionale sur les volumes EBS.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c26)</sub>

---

<a id="q27"></a>

### Question 27

`Réponse unique`

**Une base de données transactionnelle auto-gérée sur une instance EC2 exige des performances de stockage constantes de 30 000 IOPS et une latence faible et prévisible, avec une durabilité renforcée pour un volume unique.**

**❓ Quel type de volume Amazon EBS est le plus adapté ?**

- **A.** Un volume st1 (HDD à débit optimisé).
- **B.** Un volume gp2 de 1 To.
- **C.** Un volume sc1 (HDD froid).
- **D.** Un volume io2 Block Express avec IOPS provisionnées.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c27)</sub>

---

<a id="q28"></a>

### Question 28

`Réponse unique`

**Une tâche de conversion de fichiers s'exécute environ 400 fois par jour, dure 20 secondes et consomme 512 Mo de mémoire. Elle tourne actuellement sur deux instances EC2 m5.large allumées en permanence. L'équipe veut réduire les coûts et supprimer l'administration des serveurs.**

**❓ Quelle solution est la plus économique ?**

- **A.** Migrer la tâche vers un service Amazon ECS sur EC2 fonctionnant en continu.
- **B.** Migrer la tâche vers une fonction AWS Lambda déclenchée par événement, avec 512 Mo de mémoire.
- **C.** Réserver les deux instances EC2 pour 3 ans.
- **D.** Remplacer les instances par des instances plus petites en Auto Scaling sur le CPU.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c28)</sub>

---

<a id="q29"></a>

### Question 29

`Réponses multiples — choisissez **deux** réponses`

**Une entreprise veut détecter automatiquement deux types de risques dans ses comptes AWS : d'une part les comportements suspects (appels d'API inhabituels, communications avec des adresses IP malveillantes connues, tentatives de compromission d'instances), d'autre part la présence de données personnelles non protégées dans ses compartiments Amazon S3.**

**❓ Quelle combinaison de services répond à ce besoin ?**

- **A.** Activer Amazon Macie pour découvrir et classer les données sensibles dans Amazon S3.
- **B.** Déployer AWS Shield Advanced sur tous les comptes.
- **C.** Activer AWS Artifact pour l'analyse des compartiments.
- **D.** Activer Amazon GuardDuty dans tous les comptes de l'organisation.
- **E.** Activer AWS Trusted Advisor en mode entreprise.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c29)</sub>

---

<a id="q30"></a>

### Question 30

`Réponse unique`

**Une application web tourne sur un groupe Auto Scaling de quatre instances EC2 dans une seule zone de disponibilité, derrière un Application Load Balancer. Une panne de zone a rendu le service totalement indisponible pendant plusieurs heures.**

**❓ Quelle modification améliore le plus la tolérance aux pannes ?**

- **A.** Étendre le groupe Auto Scaling à au moins deux zones de disponibilité supplémentaires, activer ces zones sur l'Application Load Balancer et définir une capacité minimale répartie.
- **B.** Activer la protection contre le scale-in sur les instances existantes.
- **C.** Créer un instantané AMI quotidien des instances pour permettre une reconstruction rapide.
- **D.** Doubler le nombre d'instances dans la même zone de disponibilité.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c30)</sub>

---

<a id="q31"></a>

### Question 31

`Réponse unique`

**Un institut de recherche exécute des simulations qui doivent lire et écrire plusieurs centaines de téraoctets stockés dans Amazon S3, avec un débit de plusieurs centaines de Go/s et une latence inférieure à la milliseconde, depuis un cluster de calcul Linux.**

**❓ Quelle solution de stockage est la plus adaptée ?**

- **A.** Des volumes Amazon EBS gp3 attachés à chaque nœud.
- **B.** Amazon EFS en mode de performance General Purpose.
- **C.** AWS Storage Gateway en mode fichier déployé dans le VPC.
- **D.** Amazon FSx for Lustre lié au compartiment S3, qui présente les objets sous forme de fichiers et restitue les résultats vers S3.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c31)</sub>

---

<a id="q32"></a>

### Question 32

`Réponse unique`

**Un audit de coûts révèle que le parc compte 600 volumes Amazon EBS gp2 et de nombreuses instances EC2 dont l'utilisation moyenne du processeur et de la mémoire est inférieure à 10 %. L'entreprise veut réduire la facture sans dégrader les performances.**

**❓ Quelle combinaison d'actions est la plus appropriée ?**

- **A.** Supprimer les instantanés EBS et désactiver la surveillance détaillée.
- **B.** Migrer toutes les instances vers des instances Spot.
- **C.** Convertir tous les volumes en io2 pour bénéficier de meilleures performances par euro.
- **D.** Convertir les volumes gp2 en gp3 et appliquer les recommandations de redimensionnement d'AWS Compute Optimizer.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c32)</sub>

---

<a id="q33"></a>

### Question 33

`Réponse unique`

**Une application à trois niveaux est déployée dans un VPC. Les serveurs web se trouvent dans des sous-réseaux publics, les serveurs applicatifs et la base de données dans des sous-réseaux privés. L'équipe sécurité exige que la base n'accepte de connexions que depuis les serveurs applicatifs, sans dépendre de plages d'adresses IP qui changent lors des événements d'Auto Scaling.**

**❓ Quelle configuration répond à cette exigence ?**

- **A.** Configurer le groupe de sécurité de la base pour autoriser le port de la base uniquement depuis l'identifiant du groupe de sécurité des serveurs applicatifs.
- **B.** Placer la base dans le même sous-réseau que les serveurs applicatifs.
- **C.** Autoriser le port de la base depuis 0.0.0.0/0 dans le groupe de sécurité et filtrer dans l'application.
- **D.** Configurer une NACL sur le sous-réseau de la base autorisant le port 3306 depuis le CIDR du VPC.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c33)</sub>

---

<a id="q34"></a>

### Question 34

`Réponse unique`

**Une chaîne de traitement doit exécuter chaque nuit une suite d'étapes conditionnelles : extraction, validation, transformation, puis notification. Certaines étapes durent plusieurs minutes, d'autres doivent être retentées avec temporisation, et l'équipe veut visualiser l'état d'avancement et les échecs sans écrire de code d'orchestration.**

**❓ Quelle solution répond à ce besoin avec le moins d'effort opérationnel ?**

- **A.** Un script shell exécuté par cron sur une instance EC2 dédiée.
- **B.** Une seule fonction AWS Lambda qui enchaîne toutes les étapes et gère les erreurs dans le code.
- **C.** Un service AWS Step Functions déclenché par une règle planifiée Amazon EventBridge, avec des états de nouvelle tentative et de capture d'erreurs.
- **D.** Une file Amazon SQS dans laquelle chaque étape dépose le message de l'étape suivante.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c34)</sub>

---

<a id="q35"></a>

### Question 35

`Réponses multiples — choisissez **deux** réponses`

**Une application serverless composée de milliers de fonctions AWS Lambda concurrentes se connecte à une base Amazon RDS for PostgreSQL. Aux heures de pointe, la base rejette des connexions et son processeur sature à cause du nombre d'ouvertures et de fermetures de connexions. La charge est en outre très irrégulière : quasi nulle la nuit, très forte quelques heures par jour.**

**❓ Quelle combinaison d'actions améliore le plus les performances et l'élasticité ?**

- **A.** Placer Amazon RDS Proxy entre les fonctions Lambda et la base afin de mutualiser et de réutiliser les connexions.
- **B.** Augmenter la limite de concurrence réservée des fonctions Lambda.
- **C.** Migrer la base vers Amazon Aurora Serverless v2, dont la capacité s'ajuste finement selon la charge réelle.
- **D.** Ouvrir une nouvelle connexion à la base à chaque invocation et la fermer immédiatement après.
- **E.** Placer la base derrière un Network Load Balancer.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c35)</sub>

---

<a id="q36"></a>

### Question 36

`Réponse unique`

**Une entreprise possède un compte AWS unique utilisé par cinq départements. La direction financière veut connaître le coût mensuel réel de chaque département et être alertée dès qu'un département dépasse son enveloppe.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Créer un compte AWS distinct par département et consulter les factures individuelles.
- **B.** Appliquer des étiquettes de répartition des coûts activées par département sur les ressources, analyser les dépenses par étiquette dans AWS Cost Explorer et créer un budget AWS Budgets avec alerte pour chaque département.
- **C.** Activer AWS Trusted Advisor et consulter la catégorie d'optimisation des coûts.
- **D.** Exporter les journaux CloudTrail vers Amazon S3 et compter les appels d'API par département.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c36)</sub>

---

<a id="q37"></a>

### Question 37

`Réponse unique`

**Une entreprise de 4 000 employés utilise Microsoft Active Directory sur site. Les employés doivent accéder à la console AWS de plusieurs comptes avec leurs identifiants d'entreprise, sans qu'aucun utilisateur IAM ne soit créé, et les départs doivent révoquer immédiatement l'accès.**

**❓ Quelle solution répond à ces exigences ?**

- **A.** Créer un rôle IAM avec une politique d'approbation ouverte à tous les principaux et le partager.
- **B.** Créer un utilisateur IAM par employé et synchroniser les mots de passe avec Active Directory.
- **C.** Distribuer des clés d'accès IAM partagées par département.
- **D.** Configurer AWS IAM Identity Center avec Active Directory comme source d'identité et attribuer des jeux d'autorisations aux comptes de l'organisation.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c37)</sub>

---

<a id="q38"></a>

### Question 38

`Réponse unique`

**Une application mondiale utilise Amazon DynamoDB. Les utilisateurs d'Europe, d'Amérique du Nord et d'Asie doivent lire et écrire les mêmes données avec une latence locale faible, et le service doit rester disponible si une Région devient indisponible.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Configurer des tables globales DynamoDB (Global Tables) avec un réplica dans chacune des trois Régions.
- **B.** Placer une distribution CloudFront devant l'API qui interroge une table unique.
- **C.** Sauvegarder la table toutes les heures et restaurer dans une autre Région en cas d'incident.
- **D.** Créer des réplicas en lecture DynamoDB dans chaque Région.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c38)</sub>

---

<a id="q39"></a>

### Question 39

`Réponse unique`

**Une équipe métier veut interroger en SQL, de façon ponctuelle, plusieurs téraoctets de fichiers journaux stockés dans Amazon S3. Les requêtes sont lancées quelques fois par semaine et l'équipe refuse d'administrer un cluster.**

**❓ Quelle solution répond à ce besoin avec le moins d'effort opérationnel et le meilleur coût ?**

- **A.** Déployer un cluster Amazon EMR permanent avec Apache Hive.
- **B.** Charger les données dans un cluster Amazon Redshift dimensionné pour le volume total.
- **C.** Importer les fichiers dans Amazon RDS for MySQL.
- **D.** Interroger directement les fichiers avec Amazon Athena, en s'appuyant sur un catalogue AWS Glue, et convertir les données au format Parquet avec partitionnement.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c39)</sub>

---

<a id="q40"></a>

### Question 40

`Réponses multiples — choisissez **deux** réponses`

**Un auditeur externe exige de pouvoir prouver que l'historique des appels d'API de tous les comptes d'une organisation AWS est complet et n'a pas été altéré, et que les modifications de configuration des ressources sont historisées.**

**❓ Quelle combinaison d'actions répond à ces exigences ?**

- **A.** Activer Amazon CloudWatch Logs Insights sur les journaux applicatifs.
- **B.** Activer les journaux de flux VPC dans tous les VPC.
- **C.** Activer les journaux d'accès de l'Application Load Balancer.
- **D.** Activer AWS Config dans chaque compte et Région, avec agrégation des données de configuration dans un compte d'audit.
- **E.** Créer un journal d'organisation AWS CloudTrail qui capture les événements de tous les comptes vers un compartiment S3 centralisé, avec la validation de l'intégrité des fichiers journaux activée.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c40)</sub>

---

<a id="q41"></a>

### Question 41

`Réponse unique`

**Une entreprise du secteur de la santé stocke des dossiers patients dans Amazon S3. La conformité impose que les données soient chiffrées au repos avec une clé dont l'entreprise contrôle la politique d'accès, que la clé soit renouvelée automatiquement chaque année et que chaque opération de déchiffrement soit traçable.**

**❓ Quelle solution répond à ces exigences ?**

- **A.** Chiffrement SSE-KMS avec une clé gérée par le client dans AWS KMS, rotation automatique activée et politique de clé restrictive.
- **B.** Chiffrement SSE-C, l'entreprise fournissant la clé à chaque requête.
- **C.** Chiffrement côté client avec une clé stockée dans un fichier sur les serveurs applicatifs.
- **D.** Chiffrement SSE-S3 avec des clés entièrement gérées par Amazon S3.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c41)</sub>

---

<a id="q42"></a>

### Question 42

`Réponse unique`

**Une application critique est déployée dans la Région eu-west-1 derrière un Application Load Balancer. L'entreprise déploie une pile identique mais réduite dans eu-west-3 et souhaite que le trafic bascule automatiquement vers la seconde Région si la première devient injoignable, en conservant le même nom de domaine.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Configurer un routage pondéré 50/50 entre les deux Régions.
- **B.** Placer un Application Load Balancer devant les deux Régions.
- **C.** Créer un enregistrement CNAME manuel à modifier en cas d'incident.
- **D.** Configurer dans Amazon Route 53 un routage de basculement (failover) actif-passif avec des health checks sur les deux points de terminaison.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c42)</sub>

---

<a id="q43"></a>

### Question 43

`Réponse unique`

**Un éditeur de jeux en ligne héberge ses serveurs de session dans deux Régions, derrière des Network Load Balancers. Le protocole est en TCP et UDP. Les joueurs se plaignent de latence et de coupures lors des incidents régionaux ; l'entreprise veut aussi disposer d'adresses IP fixes à déclarer dans son client de jeu.**

**❓ Quelle solution répond à ces exigences ?**

- **A.** Créer un accélérateur AWS Global Accelerator avec les deux Network Load Balancers comme points de terminaison et des adresses IP statiques Anycast.
- **B.** Déployer AWS Direct Connect vers les fournisseurs d'accès des joueurs.
- **C.** Utiliser un routage Route 53 par géolocalisation vers chaque Région.
- **D.** Créer une distribution Amazon CloudFront avec les Network Load Balancers comme origines.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c43)</sub>

---

<a id="q44"></a>

### Question 44

`Réponse unique`

**Un site de téléchargement de logiciels sert 200 To de fichiers par mois depuis des instances EC2 vers des utilisateurs du monde entier. La facture est dominée par les frais de transfert de données sortant vers Internet.**

**❓ Quelle solution réduit le plus ce coût ?**

- **A.** Augmenter le nombre d'instances EC2 pour paralléliser les téléchargements.
- **B.** Servir les fichiers via une distribution Amazon CloudFront, dont le tarif de transfert sortant est inférieur à celui d'EC2 et qui sert les téléchargements répétés depuis son cache.
- **C.** Déplacer les fichiers vers S3 Glacier Instant Retrieval.
- **D.** Activer S3 Transfer Acceleration sur le compartiment source.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c44)</sub>

---

<a id="q45"></a>

### Question 45

`Réponse unique`

**Une application hébergée dans des sous-réseaux privés doit appeler AWS Secrets Manager et Amazon CloudWatch Logs. La politique de sécurité interdit tout accès sortant vers Internet, y compris via une NAT gateway.**

**❓ Quelle solution permet ces appels ?**

- **A.** Créer un point de terminaison VPC de type Gateway pour ces deux services.
- **B.** Appairer le VPC avec un VPC public géré par AWS.
- **C.** Créer des points de terminaison VPC de type Interface (AWS PrivateLink) pour Secrets Manager et CloudWatch Logs dans les sous-réseaux privés.
- **D.** Déployer une NAT instance dédiée avec des règles restrictives.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c45)</sub>

---

<a id="q46"></a>

### Question 46

`Réponses multiples — choisissez **deux** réponses`

**Une file Amazon SQS alimente des travailleurs qui traitent chaque message en 4 à 8 minutes. L'équipe constate que certains messages sont traités plusieurs fois par des travailleurs différents, et que d'autres réapparaissent indéfiniment dans la file après plusieurs échecs.**

**❓ Quelle combinaison d'actions corrige ces deux problèmes ?**

- **A.** Passer la file en mode FIFO pour empêcher les doublons de traitement.
- **B.** Porter le délai d'invisibilité (visibility timeout) de la file au-delà de la durée maximale de traitement, ou l'étendre pendant le traitement.
- **C.** Configurer une file de lettres mortes avec une valeur `maxReceiveCount` adaptée pour retirer les messages en échec répété.
- **D.** Activer le sondage court (short polling) sur les consommateurs.
- **E.** Réduire le délai d'invisibilité à 30 secondes afin d'accélérer la reprise.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c46)</sub>

---

<a id="q47"></a>

### Question 47

`Réponses multiples — choisissez **deux** réponses`

**Une API REST exposée via Amazon API Gateway et adossée à AWS Lambda subit un pic de trafic quotidien. Une analyse montre que 70 % des appels sont des lectures identiques répétées et que certaines requêtes déclenchent des calculs coûteux sur une base Amazon RDS.**

**❓ Quelle combinaison d'actions améliore le plus les performances et réduit la charge sur la base ?**

- **A.** Activer les journaux d'exécution détaillés sur API Gateway.
- **B.** Activer la mise en cache des réponses au niveau de l'étape (stage) d'API Gateway pour les méthodes GET.
- **C.** Introduire un cluster Amazon ElastiCache pour Redis afin de mémoriser les résultats des requêtes coûteuses.
- **D.** Convertir l'API REST en API WebSocket.
- **E.** Augmenter le délai d'expiration des fonctions Lambda.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c47)</sub>

---

<a id="q48"></a>

### Question 48

`Réponse unique`

**Une nouvelle application mobile va utiliser Amazon DynamoDB. Son succès est incertain : le trafic peut rester nul plusieurs jours puis atteindre des dizaines de milliers de requêtes par seconde sans préavis. L'équipe ne veut ni sous-provisionner ni payer de la capacité inutilisée.**

**❓ Quel mode de capacité choisir ?**

- **A.** Le mode provisionné avec achat de capacité réservée.
- **B.** Le mode provisionné avec des valeurs élevées fixées à l'avance.
- **C.** Le mode de capacité à la demande (on-demand), facturé à la requête.
- **D.** Le mode provisionné avec Auto Scaling configuré entre des bornes larges.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c48)</sub>

---

<a id="q49"></a>

### Question 49

`Réponse unique`

**Un organisme financier doit conserver des relevés dans Amazon S3 pendant cinq ans en garantissant qu'aucun objet ne pourra être modifié ni supprimé pendant cette période, y compris par un administrateur disposant des droits de l'utilisateur racine du compte.**

**❓ Quelle solution répond à cette exigence ?**

- **A.** Activer S3 Object Lock en mode conformité (compliance) avec une période de rétention de cinq ans.
- **B.** Déplacer les objets vers S3 Glacier Deep Archive et supprimer les droits de suppression.
- **C.** Activer le versioning et une politique de compartiment refusant l'action `s3:DeleteObject`.
- **D.** Activer S3 Object Lock en mode gouvernance (governance) avec une période de rétention de cinq ans.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c49)</sub>

---

<a id="q50"></a>

### Question 50

`Réponse unique`

**Une application conteneurisée doit être exécutée sur AWS sans que l'équipe ait à provisionner, mettre à jour ou dimensionner des instances EC2. Elle doit rester disponible en cas de panne d'une zone et absorber des variations de trafic importantes.**

**❓ Quelle solution répond à ces exigences avec le moins d'effort opérationnel ?**

- **A.** Des conteneurs Docker lancés au démarrage d'instances EC2 via des données utilisateur.
- **B.** Un cluster Amazon EKS autogéré avec des nœuds Kubernetes administrés par l'équipe.
- **C.** Un service Amazon ECS avec le type de lancement AWS Fargate, réparti sur plusieurs zones de disponibilité derrière un Application Load Balancer, avec Service Auto Scaling.
- **D.** Un cluster Amazon ECS sur des instances EC2 gérées manuellement dans une zone de disponibilité.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c50)</sub>

---

<a id="q51"></a>

### Question 51

`Réponse unique`

**Une entreprise veut analyser 5 Po d'historique de ventes avec des requêtes SQL analytiques complexes (agrégations, jointures) exécutées en continu par des centaines d'analystes via un outil de BI, avec des temps de réponse de l'ordre de la seconde.**

**❓ Quelle solution est la plus adaptée ?**

- **A.** Amazon Redshift, entrepôt de données colonnaire massivement parallèle.
- **B.** Amazon Neptune.
- **C.** Amazon RDS for PostgreSQL avec des réplicas en lecture.
- **D.** Amazon DynamoDB avec des index secondaires globaux.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c51)</sub>

---

<a id="q52"></a>

### Question 52

`Réponse unique`

**Un système de fichiers Amazon EFS contient 60 To de données ; les mesures montrent que 85 % des fichiers ne sont plus lus après 30 jours mais doivent rester accessibles immédiatement en cas de besoin.**

**❓ Quelle solution réduit le coût de stockage ?**

- **A.** Copier tous les fichiers vers S3 Glacier Deep Archive et démonter EFS.
- **B.** Activer une politique de cycle de vie EFS qui bascule les fichiers non consultés depuis 30 jours vers la classe Infrequent Access.
- **C.** Réduire la taille du système de fichiers en supprimant les fichiers les plus anciens.
- **D.** Migrer l'ensemble du système de fichiers vers EFS One Zone.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c52)</sub>

---

<a id="q53"></a>

### Question 53

`Réponses multiples — choisissez **deux** réponses`

**Une organisation AWS comporte des unités organisationnelles pour la production et pour les environnements de test. La direction impose que les ressources ne puissent être créées que dans deux Régions européennes, et que les équipes de test ne puissent jamais désactiver la journalisation CloudTrail.**

**❓ Quelle combinaison d'actions applique ces règles de façon contraignante ?**

- **A.** Activer AWS Trusted Advisor pour surveiller la conformité régionale.
- **B.** Attacher aux utilisateurs IAM des politiques gérées limitant les Régions.
- **C.** Attacher une SCP refusant explicitement les actions `cloudtrail:StopLogging` et `cloudtrail:DeleteTrail`.
- **D.** Créer une règle AWS Config qui signale les ressources créées hors des Régions autorisées.
- **E.** Attacher aux unités organisationnelles une politique de contrôle des services (SCP) refusant les appels d'API en dehors des Régions autorisées.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c53)</sub>

---

<a id="q54"></a>

### Question 54

`Réponse unique`

**Après un déploiement défectueux, une table d'une base Amazon RDS for MySQL a été partiellement écrasée à 14 h 12. Les sauvegardes automatiques sont activées avec une période de rétention de 7 jours. L'entreprise veut retrouver l'état de la base juste avant l'incident, avec la perte de données la plus faible possible.**

**❓ Quelle action répond à ce besoin ?**

- **A.** Effectuer une restauration à un instant donné (point-in-time recovery) vers une nouvelle instance, à un horodatage juste antérieur à 14 h 12, puis rediriger l'application.
- **B.** Promouvoir un réplica en lecture existant.
- **C.** Restaurer le dernier instantané manuel disponible.
- **D.** Réappliquer les journaux binaires manuellement sur l'instance de production.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c54)</sub>

---

<a id="q55"></a>

### Question 55

`Réponse unique`

**Des filiales réparties sur cinq continents téléversent chaque jour des fichiers vidéo de plusieurs gigaoctets vers un compartiment Amazon S3 unique situé en Irlande. Les téléversements sont lents et échouent fréquemment depuis l'Asie et l'Amérique du Sud.**

**❓ Quelle solution améliore les performances de téléversement avec le moins de modifications ?**

- **A.** Activer S3 Transfer Acceleration sur le compartiment et faire pointer les clients sur le point de terminaison accéléré, en combinant avec des téléversements multipart.
- **B.** Compresser les vidéos avant l'envoi et augmenter la taille des instances de destination.
- **C.** Créer un compartiment par continent et fusionner les fichiers chaque nuit.
- **D.** Placer une distribution CloudFront devant le compartiment pour accélérer les téléversements.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c55)</sub>

---

<a id="q56"></a>

### Question 56

`Réponses multiples — choisissez **deux** réponses`

**L'analyse de la facture S3 d'une entreprise révèle un volume stocké très supérieur au volume utile. Le compartiment concerné a le versioning activé et reçoit des téléversements de fichiers volumineux depuis des clients mobiles souvent déconnectés.**

**❓ Quelle combinaison de règles de cycle de vie réduit ce coût ?**

- **A.** Une règle qui déplace tous les objets vers S3 One Zone-IA immédiatement après leur création.
- **B.** Une règle qui abandonne et supprime les téléversements multipart incomplets après 7 jours.
- **C.** Une règle qui active la réplication interrégionale des versions anciennes.
- **D.** Une règle qui expire les versions non actuelles des objets après un nombre de jours défini.
- **E.** Une règle qui désactive le versioning du compartiment.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c56)</sub>

---

<a id="q57"></a>

### Question 57

`Réponse unique`

**Une entreprise expose une application sur `www.exemple.fr` derrière un Application Load Balancer. Elle doit chiffrer le trafic en transit avec un certificat public de confiance, sans coût de certificat et sans intervention manuelle lors du renouvellement.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Utiliser AWS CloudHSM pour générer et héberger le certificat public.
- **B.** Acheter un certificat auprès d'une autorité tierce et l'installer manuellement sur chaque instance EC2.
- **C.** Générer un certificat auto-signé et le déployer sur l'Application Load Balancer.
- **D.** Demander un certificat public dans AWS Certificate Manager, l'associer à l'écouteur HTTPS de l'Application Load Balancer et valider le domaine par DNS pour bénéficier du renouvellement automatique.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c57)</sub>

---

<a id="q58"></a>

### Question 58

`Réponses multiples — choisissez **deux** réponses`

**Une application héritée, dont le code ne peut pas être modifié, s'exécute sur une instance EC2 unique. Elle écrit ses fichiers de travail sur le disque local et ne peut fonctionner qu'en un seul exemplaire à la fois. L'entreprise veut réduire l'impact d'une panne d'instance ou de zone de disponibilité.**

**❓ Quelle combinaison d'actions améliore la résilience sans modifier l'application ?**

- **A.** Déplacer les fichiers de travail vers un système de fichiers Amazon EFS accessible depuis toutes les zones de disponibilité.
- **B.** Lancer une seconde instance identique en parallèle et répartir le trafic entre les deux.
- **C.** Activer la protection contre la terminaison sur l'instance existante.
- **D.** Placer l'instance dans un groupe Auto Scaling de capacité minimale et maximale égale à 1, couvrant plusieurs zones de disponibilité, afin qu'une instance saine soit relancée automatiquement.
- **E.** Augmenter la taille de l'instance et ajouter un volume EBS plus rapide.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c58)</sub>

---

<a id="q59"></a>

### Question 59

`Réponse unique`

**Une application d'analyse en mémoire charge un jeu de données de 400 Go en RAM pour effectuer des calculs. Le processeur reste peu sollicité, mais l'application échoue régulièrement par manque de mémoire.**

**❓ Quelle famille d'instances EC2 est la plus adaptée ?**

- **A.** Une famille optimisée pour la mémoire (par exemple R7g ou X2idn).
- **B.** Une famille à usage général de petite taille avec un volume EBS io2.
- **C.** Une famille optimisée pour le calcul (par exemple C7g).
- **D.** Une famille optimisée pour le stockage (par exemple I4i).

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c59)</sub>

---

<a id="q60"></a>

### Question 60

`Réponse unique`

**Une application mobile grand public doit permettre à des millions d'utilisateurs de créer un compte, de se connecter avec une adresse e-mail ou un fournisseur d'identité social, d'activer l'authentification multifacteur, puis d'accéder à une API protégée.**

**❓ Quelle solution répond à ce besoin avec le moins d'effort opérationnel ?**

- **A.** Utiliser AWS Directory Service pour créer un annuaire contenant les utilisateurs de l'application.
- **B.** Créer un utilisateur IAM par utilisateur final avec MFA activé.
- **C.** Développer un service d'authentification maison sur des instances EC2 avec une base RDS.
- **D.** Utiliser un groupe d'utilisateurs Amazon Cognito pour l'inscription, la connexion fédérée et le MFA, puis autoriser les appels à l'API avec les jetons émis.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c60)</sub>

---

<a id="q61"></a>

### Question 61

`Réponse unique`

**Une application déployée sur des instances EC2 doit lire et écrire dans Amazon S3 et publier des messages dans Amazon SQS. Les développeurs ont inscrit des clés d'accès IAM dans le fichier de configuration de l'application, présent dans l'AMI.**

**❓ Quelle solution corrige ce problème de sécurité avec le moins d'effort opérationnel ?**

- **A.** Stocker les clés d'accès dans AWS Secrets Manager et les lire au démarrage de l'application.
- **B.** Faire tourner les clés d'accès toutes les semaines à l'aide d'une fonction Lambda.
- **C.** Attacher un rôle IAM aux instances via un profil d'instance et supprimer les clés d'accès du fichier de configuration ; le SDK récupère alors des identifiants temporaires automatiquement.
- **D.** Chiffrer le fichier de configuration et distribuer la clé de déchiffrement aux instances.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c61)</sub>

---

<a id="q62"></a>

### Question 62

`Réponse unique`

**Un site de commerce sert ses images via Amazon CloudFront avec un compartiment Amazon S3 comme origine. L'entreprise veut que la distribution continue de servir les images si le compartiment d'origine devient indisponible dans sa Région.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Augmenter la durée de vie du cache (TTL) des objets à 24 heures.
- **B.** Créer un groupe d'origines CloudFront associant le compartiment principal et un compartiment secondaire répliqué dans une autre Région, avec basculement sur codes d'erreur.
- **C.** Activer le versioning sur le compartiment d'origine.
- **D.** Créer une seconde distribution CloudFront pointant vers un compartiment secondaire.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c62)</sub>

---

<a id="q63"></a>

### Question 63

`Réponse unique`

**Une entreprise conserve 300 To d'archives de production sur des baies NAS dans son centre de données. Elle veut réduire son stockage local et déplacer les données vers Amazon S3, tout en conservant un accès aux fichiers les plus récents avec une faible latence via le protocole NFS, sans modifier les applications sur site.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Déployer AWS Storage Gateway en mode File Gateway sur site : les fichiers sont stockés comme objets dans S3, avec un cache local des données consultées récemment.
- **B.** Migrer les données vers Amazon EFS et l'exposer sur Internet.
- **C.** Monter un compartiment S3 directement sur les serveurs avec un client FUSE.
- **D.** Utiliser AWS Snowball pour déplacer les données, puis débrancher les baies NAS.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c63)</sub>

---

<a id="q64"></a>

### Question 64

`Réponse unique`

**Un institut publie des jeux de données scientifiques volumineux dans Amazon S3. Des laboratoires du monde entier les téléchargent massivement, et les frais de transfert sortant deviennent insoutenables pour l'institut. Les laboratoires acceptent de payer le coût de leurs propres téléchargements.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Créer un compte AWS par laboratoire et y copier les données.
- **B.** Déplacer les données vers S3 Glacier Flexible Retrieval.
- **C.** Facturer manuellement chaque laboratoire à partir des journaux d'accès S3.
- **D.** Activer l'option Requester Pays sur le compartiment, afin que le demandeur authentifié assume les frais de requête et de transfert.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c64)</sub>

---

<a id="q65"></a>

### Question 65

`Réponse unique`

**Une entreprise dispose d'une liaison AWS Direct Connect entre son centre de données et son VPC. L'équipe sécurité constate que le trafic circulant sur cette liaison n'est pas chiffré, ce que la politique de conformité interdit désormais pour les données réglementées.**

**❓ Quelle solution répond à cette exigence ?**

- **A.** Remplacer Direct Connect par un appairage de VPC.
- **B.** Établir une connexion AWS Site-to-Site VPN au-dessus de la liaison Direct Connect (VPN over Direct Connect) afin de chiffrer le trafic avec IPsec.
- **C.** Activer le chiffrement au repos sur les volumes EBS des instances cibles.
- **D.** Activer les journaux de flux VPC pour surveiller le trafic non chiffré.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c65)</sub>

---

<a id="serie-66"></a>

## ⏱️ Série B — Questions 66 à 130

> **Chronomètre : 130 minutes.** Objectif : ≥ 50 bonnes réponses (77 %)
> Notez vos réponses sur une feuille séparée, sans consulter le corrigé.

---

<a id="q66"></a>

### Question 66

`Réponse unique`

**Une entreprise veut router des événements applicatifs (création de client, annulation de commande, alerte de stock) vers des cibles différentes selon le type d'événement : certaines vers des fonctions Lambda, d'autres vers des files SQS, d'autres encore vers un partenaire SaaS. Les règles de routage doivent évoluer sans modifier les producteurs.**

**❓ Quelle solution répond à ce besoin avec le moins d'effort opérationnel ?**

- **A.** Créer une rubrique Amazon SNS par type d'événement et modifier les producteurs à chaque évolution.
- **B.** Écrire les événements dans Amazon S3 et déclencher un traitement horaire.
- **C.** Publier les événements sur un bus Amazon EventBridge et définir des règles de filtrage par motif d'événement, chacune pointant vers ses cibles.
- **D.** Publier tous les événements dans une file Amazon SQS unique et écrire un aiguilleur dans une fonction Lambda.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c66)</sub>

---

<a id="q67"></a>

### Question 67

`Réponse unique`

**Un flux de données de télémétrie doit être livré en continu dans un lac de données Amazon S3, converti au format Apache Parquet et partitionné par date, afin d'être interrogé ensuite par Amazon Athena. L'équipe ne veut écrire ni maintenir aucun code de consommation.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Amazon Kinesis Data Streams avec une application consommatrice développée en interne sur EC2.
- **B.** Amazon Data Firehose avec conversion de format en Parquet et partitionnement dynamique vers Amazon S3.
- **C.** Amazon SQS avec des fonctions Lambda écrivant des fichiers JSON dans S3.
- **D.** AWS DataSync planifié toutes les heures vers Amazon S3.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c67)</sub>

---

<a id="q68"></a>

### Question 68

`Réponse unique`

**Une entreprise exécute des traitements de rendu graphique dans des conteneurs sur AWS Fargate. Les tâches durent de 10 à 40 minutes, peuvent être relancées sans conséquence en cas d'interruption et représentent 70 % de la facture de calcul.**

**❓ Quelle solution réduit le coût de ces traitements ?**

- **A.** Réduire la mémoire allouée aux tâches en dessous des besoins réels.
- **B.** Souscrire des Reserved Instances EC2 de 3 ans.
- **C.** Passer les tâches sur des instances EC2 On-Demand plus grandes.
- **D.** Exécuter les tâches sur Fargate Spot, avec relance automatique des tâches interrompues.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c68)</sub>

---

<a id="q69"></a>

### Question 69

`Réponse unique`

**Un partenaire externe, qui ne possède pas de compte AWS, doit déposer chaque semaine un fichier volumineux dans un compartiment Amazon S3 privé. L'accès doit être limité à cette seule opération et expirer au bout de quelques heures.**

**❓ Quelle solution est la plus appropriée ?**

- **A.** Rendre le compartiment accessible en écriture publique et communiquer son nom.
- **B.** Créer un utilisateur IAM dédié au partenaire et lui transmettre ses clés d'accès.
- **C.** Générer une URL présignée S3 valable quelques heures, autorisant uniquement l'opération de dépôt sur la clé attendue.
- **D.** Créer un rôle IAM avec une politique d'approbation autorisant tous les principaux.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c69)</sub>

---

<a id="q70"></a>

### Question 70

`Réponse unique`

**Une application s'appuie sur un cluster Amazon ElastiCache for Redis pour son cache de session. Une panne du nœud principal a provoqué une indisponibilité de 40 minutes le temps de recréer le cluster manuellement.**

**❓ Quelle configuration évite ce scénario ?**

- **A.** Programmer un instantané du cache toutes les heures.
- **B.** Passer le moteur de Redis à Memcached.
- **C.** Créer un groupe de réplication Redis multi-AZ avec réplicas et basculement automatique activé.
- **D.** Augmenter la taille du nœud Redis existant.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c70)</sub>

---

<a id="q71"></a>

### Question 71

`Réponse unique`

**Une entreprise doit traiter chaque nuit 40 To de journaux bruts avec des tâches Apache Spark existantes, puis arrêter toute l'infrastructure une fois le traitement terminé. Les équipes ne veulent pas réécrire les tâches Spark.**

**❓ Quelle solution est la plus adaptée ?**

- **A.** Charger les journaux dans Amazon RDS et les traiter en SQL.
- **B.** Lancer un cluster Amazon EMR transitoire qui exécute les tâches Spark puis se termine automatiquement, en lisant et écrivant dans Amazon S3.
- **C.** Réécrire les tâches en fonctions AWS Lambda déclenchées par événement S3.
- **D.** Déployer un cluster Hadoop permanent sur des instances EC2.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c71)</sub>

---

<a id="q72"></a>

### Question 72

`Réponse unique`

**Une entreprise conserve depuis trois ans tous ses journaux applicatifs dans Amazon CloudWatch Logs, avec une rétention illimitée. Seuls les 14 derniers jours sont réellement consultés en exploitation ; le reste sert uniquement à d'éventuelles enquêtes annuelles.**

**❓ Quelle solution réduit le coût tout en préservant l'historique ?**

- **A.** Réduire le niveau de journalisation de l'application à ERROR uniquement.
- **B.** Définir une rétention de 14 jours sur les groupes de journaux et exporter en continu les journaux vers Amazon S3, avec transition vers une classe d'archive par règle de cycle de vie.
- **C.** Supprimer les groupes de journaux les plus anciens.
- **D.** Déplacer les journaux vers un cluster Amazon OpenSearch Service dimensionné pour trois ans.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c72)</sub>

---

<a id="q73"></a>

### Question 73

`Réponses multiples — choisissez **deux** réponses`

**Une entreprise craint qu'une suppression accidentelle ou malveillante d'objets dans un compartiment Amazon S3 critique ne provoque une perte définitive de données. Elle souhaite pouvoir revenir à l'état antérieur et rendre toute suppression définitive très difficile.**

**❓ Quelle combinaison d'actions répond à ce besoin ?**

- **A.** Activer le chiffrement par défaut SSE-KMS sur le compartiment.
- **B.** Activer MFA Delete sur le compartiment pour exiger une authentification multifacteur lors de la suppression définitive d'une version.
- **C.** Activer le versioning sur le compartiment afin de conserver les versions antérieures des objets.
- **D.** Créer une règle de cycle de vie supprimant les objets après 30 jours.
- **E.** Activer les journaux d'accès au serveur S3.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c73)</sub>

---

<a id="q74"></a>

### Question 74

`Réponse unique`

**Un groupe Auto Scaling remplace correctement les instances qui ne répondent plus au niveau matériel, mais l'équipe constate que des instances dont le processus applicatif est planté restent en service et reçoivent du trafic de l'Application Load Balancer pendant des heures.**

**❓ Quelle configuration corrige ce comportement ?**

- **A.** Activer la surveillance détaillée CloudWatch sur les instances.
- **B.** Réduire le délai de refroidissement du groupe Auto Scaling.
- **C.** Augmenter le nombre minimal d'instances du groupe.
- **D.** Configurer le groupe Auto Scaling pour utiliser les contrôles de santé de l'Elastic Load Balancing (type de health check « ELB ») et définir une période de grâce adaptée au démarrage de l'application.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c74)</sub>

---

<a id="q75"></a>

### Question 75

`Réponse unique`

**Une entreprise exploite la même application dans trois Régions (Amérique du Nord, Europe, Asie-Pacifique). Chaque utilisateur doit être dirigé vers la Région qui lui offre le meilleur temps de réponse réseau, et non vers celle de son pays de résidence.**

**❓ Quelle politique de routage Amazon Route 53 utiliser ?**

- **A.** Le routage basé sur la latence, avec un enregistrement par Région.
- **B.** Le routage pondéré à parts égales.
- **C.** Le routage par géolocalisation.
- **D.** Le routage multivaleur avec contrôles de santé.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c75)</sub>

---

<a id="q76"></a>

### Question 76

`Réponses multiples — choisissez **deux** réponses`

**Après une année de croissance rapide, une entreprise constate que sa facture AWS contient de nombreuses ressources inutilisées : volumes Amazon EBS détachés, adresses IP Elastic non associées, anciens instantanés et instances de test oubliées.**

**❓ Quelle combinaison d'actions permet d'identifier et de réduire durablement ces dépenses ?**

- **A.** Utiliser les recommandations d'optimisation d'AWS Trusted Advisor et d'AWS Compute Optimizer pour repérer les ressources inactives ou surdimensionnées.
- **B.** Acheter des Reserved Instances pour l'ensemble du parc, y compris les environnements temporaires.
- **C.** Passer toutes les instances de production en instances Spot.
- **D.** Désactiver AWS CloudTrail pour réduire les coûts de journalisation.
- **E.** Mettre en place AWS Budgets avec alertes et des rapports Cost Explorer réguliers par étiquette et par équipe, afin de suivre les dérives.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c76)</sub>

---

<a id="q77"></a>

### Question 77

`Réponse unique`

**Une entreprise doit bloquer tout le trafic provenant d'une plage d'adresses IP identifiée comme malveillante, pour l'ensemble des instances d'un sous-réseau, quel que soit leur groupe de sécurité.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Ajouter une règle de refus dans le groupe de sécurité de chaque instance.
- **B.** Supprimer la route par défaut de la table de routage du sous-réseau.
- **C.** Créer un point de terminaison VPC pour filtrer le trafic entrant.
- **D.** Ajouter une règle de refus (deny) pour cette plage dans la liste de contrôle d'accès réseau (NACL) associée au sous-réseau.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c77)</sub>

---

<a id="q78"></a>

### Question 78

`Réponses multiples — choisissez **deux** réponses`

**Une entreprise veut préparer une reprise après sinistre inter-Régions pour une application à trois niveaux. Le budget est limité : aucune capacité de calcul ne doit tourner en permanence dans la Région secondaire, mais la base de données doit y être disponible avec un RPO de quelques minutes, et l'application doit pouvoir être relancée en une à deux heures.**

**❓ Quelle combinaison d'actions met en œuvre cette stratégie de type pilot light ?**

- **A.** Maintenir dans la Région secondaire une pile complète dimensionnée comme la production, en fonctionnement continu.
- **B.** Créer une distribution CloudFront devant l'application de la Région principale.
- **C.** Copier automatiquement les instantanés chiffrés de la base vers la Région secondaire et y maintenir un réplica en lecture prêt à être promu.
- **D.** Effectuer une sauvegarde hebdomadaire sur bande dans le centre de données de l'entreprise.
- **E.** Conserver dans la Région secondaire les AMI et les modèles AWS CloudFormation permettant de déployer rapidement la couche applicative, sans instances en fonctionnement.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c78)</sub>

---

<a id="q79"></a>

### Question 79

`Réponses multiples — choisissez **deux** réponses`

**Une fonction AWS Lambda synchrone, appelée par une application mobile via Amazon API Gateway, dépasse régulièrement le budget de latence. Les mesures montrent un temps d'exécution proche de la limite de temporisation aux heures creuses (démarrages à froid fréquents) et un traitement lent, limité par le processeur, lors des exécutions normales.**

**❓ Quelle combinaison d'actions réduit la latence ?**

- **A.** Augmenter la mémoire allouée à la fonction, ce qui augmente proportionnellement la puissance processeur attribuée.
- **B.** Déplacer la fonction dans un VPC privé sans point de terminaison.
- **C.** Augmenter le délai d'expiration de la fonction à 15 minutes.
- **D.** Réduire la mémoire allouée pour diminuer le coût par invocation.
- **E.** Activer la concurrence provisionnée (provisioned concurrency) pour maintenir des environnements d'exécution initialisés.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c79)</sub>

---

<a id="q80"></a>

### Question 80

`Réponse unique`

**Une entreprise doit vérifier en continu que ses instances Amazon EC2 et ses images de conteneurs stockées dans Amazon ECR ne contiennent pas de vulnérabilités logicielles connues (CVE) ni d'exposition réseau non intentionnelle.**

**❓ Quel service répond à ce besoin ?**

- **A.** AWS Config avec des règles managées.
- **B.** AWS Security Hub uniquement.
- **C.** Amazon GuardDuty.
- **D.** Amazon Inspector, avec analyse continue des instances EC2 et des images ECR.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c80)</sub>

---

<a id="q81"></a>

### Question 81

`Réponse unique`

**Une base Amazon RDS for MySQL de production a été créée sans chiffrement. Un audit impose désormais le chiffrement au repos de toutes les bases contenant des données clients. Une fenêtre de maintenance planifiée est disponible.**

**❓ Quelle procédure permet d'obtenir une base chiffrée ?**

- **A.** Créer un instantané de l'instance, en réaliser une copie chiffrée avec une clé AWS KMS, restaurer une nouvelle instance à partir de cette copie et basculer l'application.
- **B.** Activer le chiffrement SSE-KMS sur le compartiment S3 des sauvegardes automatiques.
- **C.** Activer le chiffrement sur l'instance existante depuis la console Amazon RDS.
- **D.** Créer un réplica en lecture chiffré et le promouvoir.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c81)</sub>

---

<a id="q82"></a>

### Question 82

`Réponse unique`

**Un cluster Amazon Aurora MySQL comprend une instance d'écriture et deux instances de lecture réparties dans trois zones de disponibilité. L'équipe veut s'assurer que l'application se reconnecte automatiquement à la nouvelle instance d'écriture après un basculement, sans modification manuelle de configuration.**

**❓ Quelle approche répond à ce besoin ?**

- **A.** Placer les instances Aurora derrière un Network Load Balancer.
- **B.** Faire pointer l'application sur l'adresse IP de l'instance d'écriture actuelle.
- **C.** Faire pointer l'application sur le point de terminaison de cluster (writer endpoint) pour les écritures et sur le point de terminaison de lecteur (reader endpoint) pour les lectures.
- **D.** Créer un enregistrement Route 53 pondéré vers les trois instances.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c82)</sub>

---

<a id="q83"></a>

### Question 83

`Réponse unique`

**Une application de traitement vidéo écrit des fichiers temporaires très volumineux avec un besoin d'entrées/sorties aléatoires extrêmement élevé. Ces fichiers sont recréés à chaque traitement et n'ont aucune valeur après la fin de la tâche.**

**❓ Quelle solution de stockage offre les meilleures performances au meilleur coût ?**

- **A.** Un système de fichiers Amazon EFS en mode Max I/O.
- **B.** Un volume Amazon EBS io2 avec 64 000 IOPS provisionnées.
- **C.** Un compartiment Amazon S3 avec téléversements multipart.
- **D.** Le stockage d'instance NVMe local (instance store) d'un type d'instance adapté, utilisé comme espace de travail éphémère.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c83)</sub>

---

<a id="q84"></a>

### Question 84

`Réponse unique`

**Une application de traitement de données s'exécute sur des instances EC2 réparties dans trois zones de disponibilité et lit en continu des volumes importants depuis un cluster de bases de données situé dans une seule zone. La facture montre des frais de transfert de données entre zones de disponibilité très élevés.**

**❓ Quelle solution réduit ce coût sans dégrader la disponibilité globale du service ?**

- **A.** Remplacer les échanges internes par des appels passant par une NAT gateway.
- **B.** Chiffrer le trafic entre les instances et la base de données.
- **C.** Placer les instances de traitement et leur réplica de lecture dans la même zone de disponibilité, en conservant plusieurs zones pour la couche réellement critique.
- **D.** Regrouper tous les composants dans une seule Région supplémentaire.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c84)</sub>

---

<a id="q85"></a>

### Question 85

`Réponse unique`

**Des instances situées dans des sous-réseaux privés doivent accéder à Internet uniquement vers une liste restreinte de noms de domaine (dépôts de paquets et API partenaires). L'entreprise veut appliquer ce filtrage de façon centralisée et journalisée pour l'ensemble du VPC.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Supprimer la NAT gateway et utiliser des points de terminaison VPC pour tous les domaines.
- **B.** Ajouter des règles sortantes par adresse IP dans chaque groupe de sécurité.
- **C.** Configurer une NACL sortante refusant tout sauf quelques plages d'adresses.
- **D.** Déployer AWS Network Firewall dans le VPC avec des règles de filtrage par nom de domaine et journalisation des flux autorisés et bloqués.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c85)</sub>

---

<a id="q86"></a>

### Question 86

`Réponse unique`

**Une application héritée sur site utilise un courtier de messages compatible JMS et le protocole AMQP. L'entreprise veut la migrer vers AWS rapidement, sans réécrire le code de messagerie, tout en obtenant une solution managée et hautement disponible.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Remplacer le courtier par Amazon SNS avec des abonnements HTTP.
- **B.** Remplacer le courtier par Amazon SQS et adapter le code applicatif.
- **C.** Déployer Amazon MQ pour Apache ActiveMQ en mode actif/veille réparti sur deux zones de disponibilité.
- **D.** Installer et administrer un courtier ActiveMQ sur des instances EC2.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c86)</sub>

---

<a id="q87"></a>

### Question 87

`Réponse unique`

**Une application analytique interroge un cluster Amazon Aurora PostgreSQL. Le volume de lectures varie fortement dans la journée : la charge de reporting est nulle la nuit et très intense en fin de matinée. L'équipe veut adapter automatiquement la capacité de lecture sans intervention.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Créer manuellement six réplicas en lecture et les conserver en permanence.
- **B.** Augmenter la classe d'instance de l'instance d'écriture.
- **C.** Configurer Aurora Auto Scaling pour les réplicas en lecture, avec une cible d'utilisation, et faire pointer les lectures sur le point de terminaison de lecteur.
- **D.** Activer le mode Multi-AZ sur le cluster.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c87)</sub>

---

<a id="q88"></a>

### Question 88

`Réponse unique`

**Une plateforme de photos génère, pour chaque image originale stockée dans Amazon S3 Standard, plusieurs vignettes qui peuvent être régénérées à tout moment à partir de l'original. Ces vignettes représentent 40 To et sont consultées quelques fois par mois.**

**❓ Quelle classe de stockage minimise le coût pour les vignettes ?**

- **A.** S3 One Zone-IA, adaptée à des données reproductibles et peu consultées.
- **B.** S3 Standard-IA avec réplication interrégionale.
- **C.** S3 Standard.
- **D.** S3 Glacier Deep Archive.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c88)</sub>

---

<a id="q89"></a>

### Question 89

`Réponses multiples — choisissez **deux** réponses`

**Une plateforme de vente en ligne mondiale, exposée via CloudFront et un Application Load Balancer, a subi une attaque par déni de service distribué de grande ampleur qui a saturé son infrastructure. La direction veut une protection renforcée, une réponse assistée par AWS pendant les incidents et une protection contre les frais liés à l'absorption d'une attaque.**

**❓ Quelle combinaison d'actions répond à ces exigences ?**

- **A.** Associer une ACL web AWS WAF avec des règles rate-based et des groupes de règles managés aux ressources exposées.
- **B.** Créer une NACL refusant tout le trafic entrant lors des attaques.
- **C.** Remplacer l'Application Load Balancer par un Network Load Balancer.
- **D.** Souscrire à AWS Shield Advanced et l'associer aux ressources protégées (distribution CloudFront, Application Load Balancer, adresses Elastic IP).
- **E.** Désactiver CloudFront pour réduire la surface d'attaque.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c89)</sub>

---

<a id="q90"></a>

### Question 90

`Réponse unique`

**Une entreprise a activé la protection contre les erreurs applicatives sur une table Amazon DynamoDB critique. Un bogue déployé à 9 h 30 a écrasé plusieurs milliers d'éléments. L'équipe s'en aperçoit à 11 h 00 et veut retrouver l'état de la table juste avant l'incident.**

**❓ Quelle fonctionnalité permet cette restauration ?**

- **A.** DynamoDB Streams rejoué à l'envers sur la table de production.
- **B.** La restauration de la dernière sauvegarde à la demande, prise la semaine précédente.
- **C.** La restauration à un instant donné (point-in-time recovery) de DynamoDB, si elle a été activée sur la table, vers une nouvelle table.
- **D.** La promotion d'un réplica de table globale.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c90)</sub>

---

<a id="q91"></a>

### Question 91

`Réponse unique`

**Une équipe d'exploitation doit rechercher du texte libre dans des téraoctets de journaux applicatifs, construire des tableaux de bord interactifs et déclencher des alertes en quasi temps réel sur des motifs d'erreurs.**

**❓ Quelle solution est la plus adaptée ?**

- **A.** Amazon RDS for PostgreSQL avec des index texte.
- **B.** Amazon OpenSearch Service, alimenté en continu par Amazon Data Firehose, avec des tableaux de bord OpenSearch.
- **C.** Amazon Redshift avec des vues matérialisées.
- **D.** Amazon S3 avec des requêtes Athena planifiées une fois par jour.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c91)</sub>

---

<a id="q92"></a>

### Question 92

`Réponse unique`

**Une entreprise exécute une flotte importante d'instances EC2 pour des services web écrits en Java et en Go, ainsi que des bases Amazon RDS. Elle cherche à améliorer le rapport prix/performance sans changer d'architecture ni dégrader les performances.**

**❓ Quelle action est la plus pertinente ?**

- **A.** Migrer les instances EC2 et les instances RDS compatibles vers des types basés sur AWS Graviton, après validation des applications.
- **B.** Migrer toutes les charges vers des instances de la génération la plus ancienne encore disponible.
- **C.** Doubler la taille des instances pour réduire leur nombre.
- **D.** Activer la surveillance détaillée sur toutes les instances.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c92)</sub>

---

<a id="q93"></a>

### Question 93

`Réponse unique`

**Le compte « Sauvegarde » doit pouvoir restaurer des instantanés Amazon EBS chiffrés créés dans le compte « Production ». Les instantanés sont chiffrés avec une clé gérée par le client dans AWS KMS.**

**❓ Quelles conditions permettent cette restauration ?**

- **A.** Désactiver le chiffrement de l'instantané avant le partage.
- **B.** Partager l'instantané avec le compte Sauvegarde suffit, le chiffrement étant transparent.
- **C.** Copier la clé KMS dans le compte Sauvegarde.
- **D.** Partager l'instantané avec le compte Sauvegarde et autoriser ce compte dans la politique de la clé KMS, puis lui accorder les permissions IAM d'utilisation de la clé.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c93)</sub>

---

<a id="q94"></a>

### Question 94

`Réponse unique`

**Une entreprise doit relier 18 VPC répartis dans plusieurs comptes, ainsi que deux centres de données connectés par Direct Connect. Le maillage d'appairages de VPC devient impossible à administrer et certaines routes manquent.**

**❓ Quelle solution simplifie durablement cette topologie ?**

- **A.** Déployer AWS Transit Gateway comme point central de routage, y attacher les VPC et les passerelles Direct Connect, et partager la passerelle entre comptes avec AWS RAM.
- **B.** Créer une instance EC2 faisant office de routeur logiciel central.
- **C.** Créer un appairage de VPC entre chaque paire de VPC.
- **D.** Fusionner les 18 VPC en un seul VPC de très grande taille.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c94)</sub>

---

<a id="q95"></a>

### Question 95

`Réponse unique`

**Une application de commerce enregistre les paniers dans Amazon DynamoDB. Les développeurs observent des limitations (throttling) alors que la capacité provisionnée globale semble suffisante : quelques clients très actifs concentrent la majorité des requêtes sur les mêmes valeurs de clé.**

**❓ Quelle cause explique ce comportement et quelle correction s'impose ?**

- **A.** Le mode de cohérence forte est activé ; il faut passer en cohérence finale.
- **B.** La table manque d'index secondaires globaux ; il faut en créer un sur chaque attribut.
- **C.** La clé de partition a une cardinalité trop faible et crée des partitions « chaudes » ; il faut choisir une clé de partition à forte cardinalité ou ajouter un suffixe de répartition.
- **D.** La table doit être migrée vers Amazon RDS.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c95)</sub>

---

<a id="q96"></a>

### Question 96

`Réponses multiples — choisissez **deux** réponses`

**Une revue de coûts sur les bases de données montre : une instance Amazon RDS de production stable depuis deux ans et facturée à la demande, trois réplicas en lecture dont deux affichent moins de 3 % d'utilisation, et une base de développement en Multi-AZ.**

**❓ Quelle combinaison d'actions réduit le coût sans nuire à la production ?**

- **A.** Migrer la base de production vers Amazon DynamoDB.
- **B.** Supprimer les sauvegardes automatiques de la base de production.
- **C.** Supprimer les réplicas en lecture inutilisés et désactiver le Multi-AZ sur la base de développement.
- **D.** Passer la base de production en Single-AZ pour diviser son coût par deux.
- **E.** Souscrire des instances réservées RDS pour l'instance de production, dont la charge est stable et durable.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c96)</sub>

---

<a id="q97"></a>

### Question 97

`Réponse unique`

**Une entreprise veut permettre à ses développeurs de créer eux-mêmes des rôles IAM pour leurs applications, sans qu'ils puissent créer un rôle disposant de plus de droits qu'eux-mêmes ni s'octroyer des privilèges d'administration.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Attacher une SCP autorisant toutes les actions IAM dans le compte de développement.
- **B.** Exiger que les rôles créés par les développeurs se voient attacher une limite de permissions (permissions boundary) définie par l'équipe sécurité, et conditionner leur droit de création à l'usage de cette limite.
- **C.** Attacher aux développeurs une politique leur interdisant toute action IAM.
- **D.** Créer les rôles à l'avance et distribuer leurs clés d'accès.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c97)</sub>

---

<a id="q98"></a>

### Question 98

`Réponses multiples — choisissez **deux** réponses`

**Lors des pics de trafic, une application distribuée reçoit des erreurs de limitation (`ThrottlingException`, HTTP 429) de plusieurs API AWS et dépasse le quota de certaines ressources dans sa Région. Les échecs se propagent et provoquent des tempêtes de nouvelles tentatives.**

**❓ Quelle combinaison d'actions améliore la résilience de l'application ?**

- **A.** Demander une augmentation des quotas concernés via AWS Service Quotas et surveiller leur consommation avec CloudWatch.
- **B.** Supprimer la journalisation des erreurs pour réduire la charge.
- **C.** Implémenter des nouvelles tentatives avec temporisation exponentielle et jitter, ainsi qu'un mécanisme de disjoncteur côté client.
- **D.** Déplacer l'application vers une instance de plus grande taille.
- **E.** Relancer immédiatement chaque requête en échec, en boucle, jusqu'à obtenir une réponse.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c98)</sub>

---

<a id="q99"></a>

### Question 99

`Réponses multiples — choisissez **deux** réponses`

**Une application enregistre dans Amazon DynamoDB des commandes identifiées par `orderId`. De nouveaux besoins imposent de retrouver rapidement toutes les commandes d'un client par `customerId`, et toutes les commandes d'un statut donné pour une période. Les analyses actuelles reposent sur des opérations `Scan` de plus en plus lentes.**

**❓ Quelle combinaison d'actions améliore les performances de ces requêtes ?**

- **A.** Créer une seconde table dupliquée mise à jour par un traitement nocturne.
- **B.** Conserver les opérations `Scan` en augmentant fortement la capacité en lecture.
- **C.** Créer un index secondaire global sur `customerId` avec une clé de tri sur la date de commande.
- **D.** Activer la cohérence forte sur toutes les lectures.
- **E.** Créer un index secondaire global sur `statut` avec une clé de tri sur la date, en projetant uniquement les attributs nécessaires.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c99)</sub>

---

<a id="q100"></a>

### Question 100

`Réponse unique`

**Une entreprise centralise ses sous-réseaux applicatifs dans un compte réseau et souhaite que quatre comptes applicatifs y déploient leurs ressources, sans dupliquer les VPC et sans créer d'appairages.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Donner aux comptes applicatifs un rôle d'administration dans le compte réseau.
- **B.** Recréer les mêmes sous-réseaux dans chaque compte avec les mêmes plages CIDR.
- **C.** Partager les sous-réseaux du VPC avec les comptes applicatifs à l'aide d'AWS Resource Access Manager (VPC partagé).
- **D.** Créer un VPC par compte et les relier par appairage deux à deux.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c100)</sub>

---

<a id="q101"></a>

### Question 101

`Réponse unique`

**Un audit exige que les objets d'un compartiment Amazon S3 ne puissent être lus ou écrits que via des connexions chiffrées. L'équipe doit être certaine qu'aucun client ne peut y accéder en HTTP simple.**

**❓ Quelle solution répond à cette exigence ?**

- **A.** Ajouter à la politique du compartiment une instruction `Deny` sur toutes les actions S3 lorsque la condition `aws:SecureTransport` vaut `false`.
- **B.** Activer le chiffrement par défaut SSE-KMS sur le compartiment.
- **C.** Placer le compartiment derrière une distribution CloudFront avec une politique HTTPS uniquement.
- **D.** Activer S3 Block Public Access sur le compartiment.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c101)</sub>

---

<a id="q102"></a>

### Question 102

`Réponse unique`

**Une application interne connaît une charge parfaitement prévisible : le trafic augmente fortement chaque jour ouvré à 8 h et retombe à 19 h. Les mises à l'échelle réactives arrivent trop tard et les utilisateurs subissent des lenteurs pendant une quinzaine de minutes chaque matin.**

**❓ Quelle solution corrige ce comportement ?**

- **A.** Passer les instances en type plus grand et supprimer l'Auto Scaling.
- **B.** Réduire le seuil de la politique de mise à l'échelle sur le processeur à 20 %.
- **C.** Augmenter le délai de refroidissement du groupe Auto Scaling.
- **D.** Configurer une action de mise à l'échelle planifiée (scheduled scaling) sur le groupe Auto Scaling pour augmenter la capacité avant 8 h.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c102)</sub>

---

<a id="q103"></a>

### Question 103

`Réponse unique`

**Une entreprise migre des applications Windows qui accèdent à des partages de fichiers SMB, s'appuient sur Active Directory pour les permissions NTFS et utilisent le service de cliché instantané (VSS) pour les restaurations en libre-service.**

**❓ Quelle solution de stockage AWS répond à ces exigences ?**

- **A.** Amazon FSx for Windows File Server, joint au domaine Active Directory.
- **B.** Amazon S3 avec un point de terminaison de type Gateway.
- **C.** Amazon EFS avec des points d'accès.
- **D.** Des volumes Amazon EBS partagés en Multi-Attach.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c103)</sub>

---

<a id="q104"></a>

### Question 104

`Réponse unique`

**Une entreprise exécute des applications Microsoft SQL Server et Windows Server sur AWS et possède des licences achetées auprès de l'éditeur, éligibles au modèle « Bring Your Own License » qui exige une affinité matérielle et un décompte par cœur physique.**

**❓ Quelle solution permet d'utiliser ces licences existantes tout en maîtrisant leur conformité ?**

- **A.** Déployer les charges sur des Dedicated Hosts et suivre l'affectation des licences avec AWS License Manager.
- **B.** Utiliser des instances EC2 On-Demand avec licence incluse et suivre l'usage manuellement.
- **C.** Déployer les charges sur des instances Spot pour réduire le coût des licences.
- **D.** Migrer les charges vers AWS Fargate.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c104)</sub>

---

<a id="q105"></a>

### Question 105

`Réponse unique`

**Un groupe crée en moyenne trois nouveaux comptes AWS par mois pour ses équipes. Chaque compte doit être créé avec une configuration conforme : journalisation centralisée, garde-fous de sécurité, unité organisationnelle adaptée et accès fédéré, sans travail manuel répétitif.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Créer les comptes manuellement et appliquer une liste de vérification.
- **B.** Déployer AWS Control Tower pour créer une zone d'atterrissage (landing zone) et provisionner les comptes via Account Factory avec les garde-fous appliqués automatiquement.
- **C.** Utiliser AWS Config pour créer les comptes.
- **D.** Créer un compte unique avec des VPC séparés par équipe.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c105)</sub>

---

<a id="q106"></a>

### Question 106

`Réponse unique`

**Une entreprise doit conserver une copie de tous les objets d'un compartiment Amazon S3 dans une seconde Région, pour répondre à une exigence de conformité imposant une réplication en moins de 15 minutes pour 99,99 % des objets, avec des indicateurs de suivi.**

**❓ Quelle solution répond à cette exigence ?**

- **A.** Une copie planifiée par AWS DataSync toutes les heures.
- **B.** Une synchronisation quotidienne via la commande `aws s3 sync`.
- **C.** Une réplication interrégionale S3 avec le contrôle du temps de réplication (S3 Replication Time Control) activé et les métriques associées.
- **D.** Une distribution CloudFront avec plusieurs origines régionales.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c106)</sub>

---

<a id="q107"></a>

### Question 107

`Réponse unique`

**Un entrepôt de données auto-géré sur EC2 exécute chaque nuit des balayages séquentiels massifs sur des fichiers de plusieurs téraoctets. Le besoin porte sur un débit soutenu élevé, à faible coût par téraoctet, et non sur des entrées/sorties aléatoires.**

**❓ Quel type de volume Amazon EBS est le plus adapté ?**

- **A.** Un volume sc1 (HDD froid) pour un accès quotidien intensif.
- **B.** Un volume st1 (HDD à débit optimisé), conçu pour les charges séquentielles à fort débit.
- **C.** Un volume gp3 configuré au maximum d'IOPS.
- **D.** Un volume io2 avec IOPS provisionnées.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c107)</sub>

---

<a id="q108"></a>

### Question 108

`Réponses multiples — choisissez **deux** réponses`

**Le poste « sauvegardes » de la facture d'une entreprise a triplé en un an. L'analyse montre des instantanés EBS manuels jamais supprimés depuis trois ans et des sauvegardes AWS Backup conservées 10 ans dans le stockage chaud alors que seules les 35 derniers jours sont utilisées en exploitation.**

**❓ Quelle combinaison d'actions réduit le coût sans perdre la capacité de restauration exigée ?**

- **A.** Automatiser la création et surtout la suppression des instantanés EBS obsolètes avec Amazon Data Lifecycle Manager ou AWS Backup.
- **B.** Copier toutes les sauvegardes dans une seconde Région pour bénéficier de tarifs inférieurs.
- **C.** Configurer les plans AWS Backup pour basculer les points de restauration vers le stockage froid après 35 jours, tout en conservant la rétention de 10 ans.
- **D.** Supprimer tous les instantanés de plus de 35 jours, quelle que soit l'exigence de rétention.
- **E.** Désactiver les sauvegardes des bases de données de production.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c108)</sub>

---

<a id="q109"></a>

### Question 109

`Réponses multiples — choisissez **deux** réponses`

**Une entreprise veut garantir que les objets d'un compartiment Amazon S3 contenant des données sensibles ne soient accessibles que depuis ses instances situées dans un VPC précis, et jamais depuis Internet, même avec des identifiants IAM valides.**

**❓ Quelle combinaison d'actions répond à cette exigence ?**

- **A.** Activer le chiffrement SSE-S3 sur le compartiment.
- **B.** Ajouter à la politique du compartiment une condition `aws:SourceVpce` (ou `aws:SourceVpc`) refusant tout accès qui ne provient pas de ce point de terminaison.
- **C.** Créer une URL présignée à durée longue pour les utilisateurs autorisés.
- **D.** Activer S3 Transfer Acceleration sur le compartiment.
- **E.** Créer un point de terminaison VPC de type Gateway pour S3 et y attacher une politique de point de terminaison limitant l'accès au compartiment concerné.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c109)</sub>

---

<a id="q110"></a>

### Question 110

`Réponse unique`

**Une fonction AWS Lambda invoquée de façon asynchrone par des notifications Amazon S3 échoue parfois à cause d'un service tiers indisponible. Après les nouvelles tentatives automatiques, les événements sont perdus et personne n'en est informé.**

**❓ Quelle solution garantit qu'aucun événement ne disparaisse et permet un retraitement ultérieur ?**

- **A.** Augmenter le délai d'expiration de la fonction Lambda.
- **B.** Convertir les invocations asynchrones en invocations synchrones depuis S3.
- **C.** Configurer une destination en cas d'échec (ou une file de lettres mortes) pointant vers une file Amazon SQS, où les événements non traités sont conservés pour analyse et rejeu.
- **D.** Activer la concurrence réservée sur la fonction.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c110)</sub>

---

<a id="q111"></a>

### Question 111

`Réponses multiples — choisissez **deux** réponses`

**Un flux Amazon Kinesis Data Streams reçoit 12 Mo/s de données. Deux applications consommatrices se partagent la bande passante de lecture et accusent un retard croissant ; les producteurs reçoivent en outre des erreurs `ProvisionedThroughputExceededException`.**

**❓ Quelle combinaison d'actions résout ces problèmes ?**

- **A.** Regrouper les deux applications en un seul consommateur séquentiel.
- **B.** Augmenter le nombre de shards du flux pour accroître la capacité d'écriture et de lecture.
- **C.** Enregistrer les consommateurs en mode enhanced fan-out afin que chacun dispose de sa propre bande passante de lecture dédiée.
- **D.** Réduire la période de rétention du flux à 24 heures.
- **E.** Remplacer Kinesis par une file Amazon SQS standard.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c111)</sub>

---

<a id="q112"></a>

### Question 112

`Réponse unique`

**Une table Amazon DynamoDB stocke des sessions utilisateurs et des événements de suivi qui n'ont plus aucune valeur après 30 jours. La table atteint plusieurs téraoctets et son coût de stockage augmente en continu, alors que 95 % des éléments sont périmés.**

**❓ Quelle solution réduit le coût avec le moins d'effort opérationnel ?**

- **A.** Exécuter chaque nuit un balayage de la table et supprimer les éléments périmés par lots.
- **B.** Exporter la table vers S3 puis la recréer vide chaque trimestre.
- **C.** Activer la fonctionnalité TTL (Time To Live) sur un attribut d'expiration afin que DynamoDB supprime automatiquement les éléments périmés, sans consommer de capacité en écriture.
- **D.** Créer une nouvelle table chaque mois et supprimer l'ancienne.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c112)</sub>

---

<a id="q113"></a>

### Question 113

`Réponse unique`

**Une banque doit générer et stocker des clés cryptographiques dans des modules matériels dont elle a le contrôle exclusif, validés FIPS 140-2 niveau 3, avec la possibilité d'exécuter ses propres opérations cryptographiques et de conserver la maîtrise complète du matériel de clé.**

**❓ Quelle solution répond à cette exigence ?**

- **A.** AWS KMS avec des clés gérées par AWS.
- **B.** AWS Secrets Manager avec rotation activée.
- **C.** AWS CloudHSM, cluster de modules matériels dédiés dont le client contrôle les identifiants et le matériel de clé.
- **D.** Le chiffrement SSE-C sur Amazon S3.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c113)</sub>

---

<a id="q114"></a>

### Question 114

`Réponses multiples — choisissez **deux** réponses`

**Une équipe déploie une nouvelle version de son application sur un groupe Auto Scaling derrière un Application Load Balancer. Les mises à jour effectuées en modifiant les instances en place provoquent des dérives de configuration et des retours arrière difficiles.**

**❓ Quelle combinaison de pratiques rend les déploiements plus fiables ?**

- **A.** Désactiver les contrôles de santé pendant les déploiements pour éviter les remplacements.
- **B.** Construire une nouvelle AMI immuable pour chaque version, mettre à jour le modèle de lancement et déclencher un rafraîchissement d'instances (instance refresh) du groupe Auto Scaling.
- **C.** Réaliser un déploiement bleu/vert en créant un second groupe cible et en basculant le trafic de l'Application Load Balancer une fois les contrôles de santé validés.
- **D.** Augmenter la capacité maximale du groupe Auto Scaling pendant le déploiement, sans autre changement.
- **E.** Se connecter en SSH à chaque instance pour appliquer les correctifs manuellement.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c114)</sub>

---

<a id="q115"></a>

### Question 115

`Réponse unique`

**Un éditeur de logiciels veut exposer son API, hébergée dans son propre VPC, à plusieurs clients disposant de leur propre compte AWS. Le trafic ne doit jamais transiter par Internet, les plages d'adresses des clients ne doivent pas être connues de l'éditeur et aucun appairage de VPC ne doit être créé.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Créer un service de point de terminaison AWS PrivateLink devant un Network Load Balancer, et laisser chaque client créer un point de terminaison de type Interface dans son VPC.
- **B.** Créer une connexion Site-to-Site VPN avec chaque client.
- **C.** Créer un appairage de VPC avec chaque client.
- **D.** Exposer l'API via un Application Load Balancer public restreint par groupe de sécurité.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c115)</sub>

---

<a id="q116"></a>

### Question 116

`Réponse unique`

**Une entreprise héberge un site vitrine entièrement statique (HTML, CSS, JavaScript, images) sur deux instances EC2 derrière un Application Load Balancer, avec un groupe Auto Scaling. Le site ne comporte aucun traitement côté serveur mais reçoit des pics de trafic lors des campagnes marketing.**

**❓ Quelle solution réduit le coût et l'effort opérationnel tout en absorbant les pics ?**

- **A.** Déplacer le site vers AWS Fargate avec deux tâches permanentes.
- **B.** Réserver les instances EC2 pour 3 ans.
- **C.** Réduire la taille des instances EC2 et conserver l'Application Load Balancer.
- **D.** Héberger le site statique dans un compartiment Amazon S3 et le distribuer via Amazon CloudFront, puis supprimer les instances EC2 et l'Application Load Balancer.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c116)</sub>

---

<a id="q117"></a>

### Question 117

`Réponse unique`

**Une entreprise migre des serveurs d'applications Windows vers Amazon EC2. Ces serveurs doivent être joints à un domaine Active Directory, appliquer des stratégies de groupe et permettre aux utilisateurs de s'authentifier avec leurs comptes d'entreprise, sans que l'équipe administre elle-même des contrôleurs de domaine.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Des contrôleurs de domaine installés et maintenus sur des instances EC2.
- **B.** AWS IAM Identity Center avec des utilisateurs locaux.
- **C.** AWS Directory Service for Microsoft Active Directory (AWS Managed Microsoft AD) déployé sur deux zones de disponibilité.
- **D.** Amazon Cognito avec un groupe d'utilisateurs.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c117)</sub>

---

<a id="q118"></a>

### Question 118

`Réponse unique`

**Une entreprise doit garantir que les instantanés de ses volumes Amazon EBS sont créés toutes les 12 heures, conservés 30 jours, copiés automatiquement dans une seconde Région et supprimés à l'expiration, sans code à maintenir.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Créer les instantanés manuellement lors des fenêtres de maintenance.
- **B.** Écrire une fonction AWS Lambda planifiée qui crée, copie et supprime les instantanés.
- **C.** Activer le versioning sur les volumes EBS.
- **D.** Utiliser Amazon Data Lifecycle Manager (ou AWS Backup) avec une politique planifiée incluant la copie interrégionale et la rétention.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c118)</sub>

---

<a id="q119"></a>

### Question 119

`Réponse unique`

**Une entreprise doit migrer 80 To de fichiers depuis un serveur NFS sur site vers Amazon EFS, puis maintenir une synchronisation incrémentale quotidienne pendant la phase de transition. Elle veut un transfert accéléré, chiffré et vérifié, sans développer de scripts.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Copier les fichiers vers S3 avec la CLI, puis les recopier vers EFS.
- **B.** Utiliser `rsync` sur une instance EC2 via une connexion VPN.
- **C.** Commander un AWS Snowcone et répéter l'opération chaque jour.
- **D.** Déployer l'agent AWS DataSync sur site et créer des tâches de transfert planifiées vers Amazon EFS.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c119)</sub>

---

<a id="q120"></a>

### Question 120

`Réponse unique`

**Une entreprise veut que certaines opérations sensibles — suppression d'un compartiment, modification de politiques IAM, arrêt d'instances de production — ne soient possibles que si l'utilisateur s'est authentifié avec un second facteur.**

**❓ Quelle solution applique cette règle ?**

- **A.** Activer le MFA uniquement sur l'utilisateur racine du compte.
- **B.** Ajouter aux politiques IAM concernées une condition `aws:MultiFactorAuthPresent` égale à `true` pour ces actions.
- **C.** Créer un rôle distinct sans condition particulière pour ces opérations.
- **D.** Demander aux équipes d'utiliser le MFA lors de leur connexion à la console.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c120)</sub>

---

<a id="q121"></a>

### Question 121

`Réponse unique`

**Un compartiment Amazon S3 de plusieurs pétaoctets est utilisé par une douzaine d'équipes, chacune avec ses propres besoins d'accès. La politique de compartiment est devenue un document de plusieurs milliers de lignes, difficile à relire et à modifier sans risque.**

**❓ Quelle solution simplifie durablement la gestion de ces accès ?**

- **A.** Créer un compartiment par équipe et copier les données nécessaires.
- **B.** Donner un accès complet au compartiment à toutes les équipes et filtrer dans les applications.
- **C.** Créer un point d'accès S3 (S3 Access Point) par équipe, chacun avec sa propre politique et son nom DNS dédié.
- **D.** Remplacer la politique de compartiment par des ACL d'objets.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c121)</sub>

---

<a id="q122"></a>

### Question 122

`Réponse unique`

**Une équipe de développement veut déployer une application web Java classique sur AWS, avec équilibrage de charge, mise à l'échelle automatique, surveillance et déploiements progressifs, sans concevoir elle-même l'infrastructure ni écrire de modèles d'infrastructure.**

**❓ Quelle solution répond à ce besoin avec le moins d'effort ?**

- **A.** Déployer un cluster Amazon EKS autogéré.
- **B.** Installer l'application sur une instance EC2 unique de grande taille.
- **C.** Créer manuellement les instances EC2, l'Application Load Balancer et le groupe Auto Scaling.
- **D.** Déployer l'application avec AWS Elastic Beanstalk, qui provisionne et gère l'environnement complet à partir du code applicatif.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c122)</sub>

---

<a id="q123"></a>

### Question 123

`Réponse unique`

**Une distribution Amazon CloudFront affiche un taux de succès du cache de seulement 20 %. L'analyse montre que l'application ajoute des chaînes de requête de suivi marketing uniques à chaque URL, ainsi que des en-têtes variables, et que la plupart des réponses sont pourtant identiques.**

**❓ Quelle action améliore le taux de succès du cache ?**

- **A.** Ajouter des points de présence supplémentaires à la distribution.
- **B.** Désactiver la compression au bord.
- **C.** Réduire la durée de vie du cache à zéro pour garantir la fraîcheur.
- **D.** Configurer une politique de cache qui n'inclut dans la clé de cache que les paramètres de requête et les en-têtes réellement nécessaires, et définir des durées de vie appropriées.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c123)</sub>

---

<a id="q124"></a>

### Question 124

`Réponse unique`

**Une entreprise gère plusieurs centaines de compartiments Amazon S3 et ignore quelles données pourraient être déplacées vers des classes moins coûteuses. Elle veut une analyse chiffrée des profils d'accès et des recommandations avant de définir des règles de cycle de vie.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Déplacer immédiatement toutes les données vers S3 Glacier Deep Archive.
- **B.** Activer S3 Storage Lens et l'analyse des classes de stockage (Storage Class Analysis) pour identifier les données rarement consultées.
- **C.** Consulter la facture mensuelle détaillée par compartiment.
- **D.** Activer le versioning sur tous les compartiments.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c124)</sub>

---

<a id="q125"></a>

### Question 125

`Réponse unique`

**Un administrateur dispose d'une politique IAM lui accordant `s3:*` sur tous les compartiments, mais toutes ses tentatives d'accès à un compartiment précis échouent avec une erreur d'autorisation. Aucune erreur n'apparaît dans la configuration de son utilisateur.**

**❓ Quelle explication est la plus probable ?**

- **A.** Une instruction `Deny` explicite s'applique, par exemple via une politique de contrôle des services, une politique de compartiment ou une limite de permissions ; un refus explicite l'emporte toujours sur une autorisation.
- **B.** Le compartiment doit être rendu public pour être accessible.
- **C.** Les politiques IAM mettent plusieurs heures à se propager.
- **D.** Les politiques IAM ne s'appliquent pas à Amazon S3.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c125)</sub>

---

<a id="q126"></a>

### Question 126

`Réponse unique`

**Une entreprise doit déployer la même pile d'infrastructure (VPC, sous-réseaux, rôles, groupes de sécurité) de façon identique dans 25 comptes et 3 Régions, puis la mettre à jour de manière contrôlée.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Utiliser AWS Config pour créer les ressources manquantes.
- **B.** Copier une AMI dans chaque Région.
- **C.** Créer les ressources manuellement dans chaque compte en suivant une procédure écrite.
- **D.** Utiliser AWS CloudFormation StackSets pour déployer et mettre à jour la pile dans l'ensemble des comptes et Régions cibles depuis un compte d'administration.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c126)</sub>

---

<a id="q127"></a>

### Question 127

`Réponses multiples — choisissez **deux** réponses`

**Une application transfère et lit des objets de plusieurs gigaoctets dans Amazon S3. Les téléversements échouent parfois au bout de longues minutes et doivent être repris depuis le début, tandis que les téléchargements complets sont trop lents pour respecter les temps de traitement attendus.**

**❓ Quelle combinaison d'actions améliore les performances et la fiabilité ?**

- **A.** Utiliser des requêtes de plage d'octets (byte-range fetches) parallèles pour télécharger un même objet en plusieurs morceaux simultanés.
- **B.** Activer le versioning sur le compartiment pour accélérer les écritures.
- **C.** Utiliser les téléversements multipart, qui découpent l'objet en parties transférées en parallèle et permettent de ne reprendre que les parties échouées.
- **D.** Réduire la taille des objets en les divisant manuellement en milliers de petits fichiers distincts.
- **E.** Compresser tous les objets avant l'envoi et les décompresser à chaque lecture.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c127)</sub>

---

<a id="q128"></a>

### Question 128

`Réponses multiples — choisissez **deux** réponses`

**Une entreprise exécute une centaine de services conteneurisés sur AWS Fargate. La consommation est stable depuis un an, mais l'analyse montre que la plupart des tâches sont définies avec 4 vCPU et 8 Go de mémoire alors qu'elles n'en utilisent qu'un quart.**

**❓ Quelle combinaison d'actions réduit le coût ?**

- **A.** Migrer toutes les tâches vers des instances EC2 On-Demand.
- **B.** Souscrire un Compute Savings Plan couvrant la consommation Fargate de base.
- **C.** Désactiver la journalisation des conteneurs.
- **D.** Augmenter le nombre de tâches pour améliorer la disponibilité.
- **E.** Réduire les définitions de tâches aux valeurs de vCPU et de mémoire réellement nécessaires, en s'appuyant sur les métriques de Container Insights.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c128)</sub>

---

<a id="q129"></a>

### Question 129

`Réponses multiples — choisissez **deux** réponses`

**Une entreprise construit un lac de données dans Amazon S3, alimenté par plusieurs équipes et interrogé via Amazon Athena et Amazon Redshift Spectrum. Certaines colonnes contiennent des données personnelles auxquelles seules deux équipes doivent accéder, et toutes les données doivent être chiffrées avec des clés dont l'entreprise contrôle l'accès.**

**❓ Quelle combinaison d'actions répond à ces exigences ?**

- **A.** Copier les colonnes sensibles dans un compartiment séparé accessible à tous.
- **B.** Chiffrer les données avec SSE-KMS en utilisant des clés gérées par le client, dont la politique restreint l'usage aux rôles autorisés.
- **C.** Désactiver le chiffrement pour améliorer les performances des requêtes.
- **D.** Gérer les autorisations du lac de données avec AWS Lake Formation, en accordant des permissions au niveau des bases, des tables et des colonnes.
- **E.** Accorder à toutes les équipes un accès complet au catalogue AWS Glue.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c129)</sub>

---

<a id="q130"></a>

### Question 130

`Réponses multiples — choisissez **deux** réponses`

**Une plateforme de paiement consomme des messages depuis une file Amazon SQS. Elle doit continuer à fonctionner si une zone de disponibilité tombe, et ne jamais débiter deux fois un client même si un message est livré plusieurs fois.**

**❓ Quelle combinaison d'actions répond à ces exigences ?**

- **A.** Rendre le traitement idempotent, par exemple en enregistrant l'identifiant de transaction dans Amazon DynamoDB avec une écriture conditionnelle avant d'appliquer le débit.
- **B.** Déployer les consommateurs dans un groupe Auto Scaling réparti sur plusieurs zones de disponibilité.
- **C.** Traiter les messages directement depuis une instance EC2 unique protégée contre la terminaison.
- **D.** Réduire le nombre de consommateurs à un seul pour éviter les traitements concurrents.
- **E.** Désactiver les nouvelles tentatives de livraison de la file.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c130)</sub>

---

<a id="serie-131"></a>

## ⏱️ Série C — Questions 131 à 200

> **Chronomètre : 140 minutes.** Objectif : ≥ 56 bonnes réponses (80 %)
> Notez vos réponses sur une feuille séparée, sans consulter le corrigé.

---

<a id="q131"></a>

### Question 131

`Réponse unique`

**Une entreprise exploite un cluster Apache Kafka autogéré sur site pour ses flux d'événements. Elle veut migrer vers AWS sans modifier ses producteurs et consommateurs Kafka existants, et cesser d'administrer les courtiers, les correctifs et la haute disponibilité.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Amazon Managed Streaming for Apache Kafka (Amazon MSK), déployé sur plusieurs zones de disponibilité.
- **B.** Un cluster Kafka réinstallé sur des instances EC2.
- **C.** Amazon Data Firehose vers Amazon S3.
- **D.** Amazon SQS avec des files FIFO.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c131)</sub>

---

<a id="q132"></a>

### Question 132

`Réponse unique`

**Un groupe possède 30 comptes AWS gérés dans AWS Organizations. Chaque filiale achète ses propres instances réservées et certaines capacités restent inutilisées alors que d'autres comptes paient le tarif à la demande.**

**❓ Quelle solution améliore l'efficacité financière du groupe ?**

- **A.** Passer toutes les charges en instances Spot.
- **B.** Demander à chaque filiale d'acheter davantage d'instances réservées.
- **C.** Activer la facturation consolidée avec le partage des réductions (instances réservées et Savings Plans mutualisés entre les comptes de l'organisation) et piloter les achats de façon centralisée.
- **D.** Fusionner tous les comptes en un seul.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c132)</sub>

---

<a id="q133"></a>

### Question 133

`Réponse unique`

**Une application web hébergée sur des instances EC2 présente une vulnérabilité de type SSRF. L'équipe sécurité craint qu'un attaquant n'interroge le service de métadonnées de l'instance pour voler les identifiants temporaires du rôle IAM.**

**❓ Quelle mesure réduit le plus efficacement ce risque ?**

- **A.** Exiger IMDSv2 (sessions avec jeton) sur les instances et désactiver IMDSv1.
- **B.** Chiffrer le volume racine de l'instance.
- **C.** Supprimer le rôle IAM de l'instance et revenir à des clés d'accès dans le code.
- **D.** Bloquer l'adresse 169.254.169.254 dans le groupe de sécurité de l'instance.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c133)</sub>

---

<a id="q134"></a>

### Question 134

`Réponse unique`

**Une application interne, utilisée uniquement pendant les heures de bureau, doit être protégée contre un sinistre régional. Le métier accepte un RTO de 24 heures et un RPO de 24 heures, et souhaite la solution la moins coûteuse possible.**

**❓ Quelle stratégie de reprise après sinistre choisir ?**

- **A.** Une stratégie warm standby avec une pile réduite en fonctionnement permanent.
- **B.** Une stratégie de sauvegarde et restauration : sauvegardes quotidiennes avec AWS Backup copiées dans une seconde Région, et redéploiement de l'infrastructure par modèle CloudFormation en cas de sinistre.
- **C.** Une architecture multi-site actif-actif dans deux Régions.
- **D.** Une stratégie pilot light avec des réplicas de base de données actifs en permanence.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c134)</sub>

---

<a id="q135"></a>

### Question 135

`Réponse unique`

**Une entreprise doit exécuter chaque jour des dizaines de milliers de tâches de calcul indépendantes, de durées très variables, avec des dépendances entre certaines d'entre elles. Elle veut une planification automatique, une mise à l'échelle de la capacité et l'utilisation d'instances Spot lorsque c'est possible.**

**❓ Quelle solution est la plus adaptée ?**

- **A.** Une fonction AWS Lambda unique appelée en boucle.
- **B.** AWS Batch, avec ses files de tâches, ses environnements de calcul gérés et sa prise en charge des instances Spot.
- **C.** Un cluster Amazon EMR permanent.
- **D.** Un groupe Auto Scaling piloté par un script maison de planification.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c135)</sub>

---

<a id="q136"></a>

### Question 136

`Réponse unique`

**Un établissement de santé archive des images médicales rarement consultées : moins de 1 % des images sont relues chaque mois, mais lorsqu'un praticien en demande une, elle doit s'afficher en quelques millisecondes.**

**❓ Quelle classe de stockage Amazon S3 répond à ce besoin au meilleur coût ?**

- **A.** S3 Glacier Instant Retrieval, conçue pour les données archivées nécessitant un accès immédiat.
- **B.** S3 Glacier Flexible Retrieval.
- **C.** S3 Glacier Deep Archive.
- **D.** S3 Standard.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c136)</sub>

---

<a id="q137"></a>

### Question 137

`Réponse unique`

**Une application mobile doit permettre à ses utilisateurs authentifiés de téléverser directement leurs photos dans un compartiment Amazon S3, chacun n'ayant accès qu'à son propre préfixe. Aucune information d'identification AWS ne doit être intégrée dans l'application.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Utiliser un groupe d'identités Amazon Cognito (identity pool) pour échanger le jeton d'authentification contre des identifiants AWS temporaires associés à un rôle IAM dont la politique restreint l'accès au préfixe de l'utilisateur.
- **B.** Intégrer dans l'application les clés d'accès d'un utilisateur IAM disposant d'un accès complet au compartiment.
- **C.** Rendre le compartiment accessible en écriture publique.
- **D.** Créer un utilisateur IAM par utilisateur de l'application.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c137)</sub>

---

<a id="q138"></a>

### Question 138

`Réponse unique`

**Un système de fichiers Amazon EFS héberge les données d'une application critique. L'entreprise veut disposer d'une copie continuellement à jour dans une seconde Région pour un plan de reprise après sinistre, sans écrire de scripts de synchronisation.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Copier les fichiers chaque nuit avec `rsync` depuis une instance EC2.
- **B.** Activer le versioning sur le système de fichiers EFS.
- **C.** Monter le système de fichiers depuis des instances de la seconde Région.
- **D.** Activer la réplication EFS vers un système de fichiers de destination dans une autre Région.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c138)</sub>

---

<a id="q139"></a>

### Question 139

`Réponse unique`

**Une entreprise de services financiers doit détecter des schémas de fraude en explorant des relations complexes entre des millions de comptes, d'appareils et de transactions, avec des requêtes de parcours de graphe sur plusieurs niveaux de profondeur.**

**❓ Quel service de base de données est le plus adapté ?**

- **A.** Amazon Redshift.
- **B.** Amazon RDS for MySQL avec des jointures récursives.
- **C.** Amazon DynamoDB avec des index secondaires globaux.
- **D.** Amazon Neptune, base de données de graphes managée.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c139)</sub>

---

<a id="q140"></a>

### Question 140

`Réponse unique`

**Une organisation compte 60 comptes AWS. L'équipe sécurité doit garantir qu'une ACL web AWS WAF de base est associée à toutes les distributions CloudFront et à tous les Application Load Balancers existants et futurs, avec un contrôle centralisé de la conformité.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Utiliser AWS Firewall Manager pour définir une politique de sécurité appliquée automatiquement aux ressources de tous les comptes de l'organisation.
- **B.** Demander à chaque équipe d'associer manuellement l'ACL web à ses ressources.
- **C.** Attacher une SCP interdisant la création d'Application Load Balancers.
- **D.** Créer une règle AWS Config dans le compte de production uniquement.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c140)</sub>

---

<a id="q141"></a>

### Question 141

`Réponse unique`

**Des instances d'un sous-réseau privé ne parviennent plus à joindre un service partenaire. L'équipe réseau doit déterminer si le trafic sort réellement du VPC, quelles adresses et quels ports sont concernés, et si des paquets sont rejetés par les groupes de sécurité ou les NACL.**

**❓ Quelle solution fournit cette information ?**

- **A.** Activer Amazon GuardDuty et consulter ses résultats.
- **B.** Activer AWS CloudTrail sur la Région concernée.
- **C.** Activer les journaux d'accès de l'Application Load Balancer.
- **D.** Activer les journaux de flux VPC (VPC Flow Logs) sur le VPC ou les interfaces réseau concernées, et les analyser dans CloudWatch Logs ou Amazon Athena.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c141)</sub>

---

<a id="q142"></a>

### Question 142

`Réponse unique`

**Une application monolithique exposée par un Application Load Balancer est découpée en trois microservices : `/api/commandes`, `/api/clients` et `/api/stock`. Chaque service évolue et se dimensionne indépendamment, mais l'entreprise veut conserver un point d'entrée unique et un seul certificat TLS.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Déployer les trois microservices sur les mêmes instances derrière un groupe cible unique.
- **B.** Utiliser un Network Load Balancer avec un port par microservice.
- **C.** Créer un groupe cible par microservice et définir des règles de routage par chemin (path-based routing) sur l'écouteur de l'Application Load Balancer.
- **D.** Créer un Application Load Balancer par microservice avec un domaine différent.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c142)</sub>

---

<a id="q143"></a>

### Question 143

`Réponse unique`

**Une entreprise veut migrer une base de données Oracle sur site vers Amazon Aurora PostgreSQL. La migration doit convertir le schéma et le code procédural, puis répliquer les données en continu afin de limiter l'interruption lors de la bascule.**

**❓ Quelle combinaison de services est adaptée ?**

- **A.** AWS DataSync pour copier les fichiers de la base, puis un import manuel.
- **B.** AWS Snowball Edge pour transférer les fichiers de données Oracle.
- **C.** AWS Schema Conversion Tool pour convertir le schéma, puis AWS DMS avec réplication continue (CDC) pour migrer et synchroniser les données.
- **D.** Un instantané Amazon RDS restauré dans Aurora.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c143)</sub>

---

<a id="q144"></a>

### Question 144

`Réponse unique`

**Une entreprise sert son application via Amazon CloudFront. Ses utilisateurs se trouvent exclusivement en Europe et en Amérique du Nord, mais la distribution est configurée pour utiliser l'ensemble des points de présence mondiaux, ce qui augmente le coût de diffusion.**

**❓ Quelle solution réduit ce coût sans dégrader l'expérience des utilisateurs réels ?**

- **A.** Activer la journalisation standard sur la distribution.
- **B.** Désactiver CloudFront et servir le contenu depuis l'origine.
- **C.** Configurer la classe de prix (price class) de la distribution pour n'utiliser que les points de présence d'Europe et d'Amérique du Nord.
- **D.** Réduire la durée de vie du cache à 60 secondes.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c144)</sub>

---

<a id="q145"></a>

### Question 145

`Réponses multiples — choisissez **deux** réponses`

**Une entreprise doit donner à 800 télétravailleurs un accès aux applications internes hébergées dans des sous-réseaux privés. L'accès doit s'appuyer sur les identités du fournisseur d'identité de l'entreprise, être chiffré et limité aux seules applications autorisées à chaque groupe d'utilisateurs.**

**❓ Quelle combinaison d'actions répond à ces exigences ?**

- **A.** Ouvrir les applications sur Internet et filtrer par adresse IP publique des employés.
- **B.** Déployer un hôte bastion accessible en RDP depuis Internet.
- **C.** Définir des règles d'autorisation Client VPN par groupe d'utilisateurs, associées à des groupes de sécurité restreignant les destinations accessibles.
- **D.** Déployer AWS Client VPN avec une authentification fédérée SAML vers le fournisseur d'identité de l'entreprise.
- **E.** Créer un utilisateur IAM par télétravailleur avec des clés d'accès.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c145)</sub>

---

<a id="q146"></a>

### Question 146

`Réponses multiples — choisissez **deux** réponses`

**Après le déploiement d'une application dont l'initialisation prend environ quatre minutes, l'équipe constate deux problèmes : les nouvelles instances sont déclarées non saines et remplacées en boucle, et les utilisateurs reçoivent des erreurs lorsqu'une instance est retirée du service pendant un scale-in.**

**❓ Quelle combinaison d'actions corrige ces comportements ?**

- **A.** Désactiver les contrôles de santé du groupe cible.
- **B.** Passer les contrôles de santé du groupe Auto Scaling en type EC2 uniquement.
- **C.** Réduire à zéro le délai de désinscription pour accélérer les retraits.
- **D.** Augmenter la période de grâce des contrôles de santé du groupe Auto Scaling au-delà du temps d'initialisation de l'application.
- **E.** Configurer un délai de désinscription (deregistration delay / connection draining) sur le groupe cible afin de laisser les requêtes en cours se terminer.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c146)</sub>

---

<a id="q147"></a>

### Question 147

`Réponses multiples — choisissez **deux** réponses`

**Un cluster Amazon Redshift met plusieurs minutes à répondre à des requêtes qui joignent une très grande table de faits à une table de dimensions, avec un filtrage systématique sur une plage de dates. L'équipe constate un volume important de redistribution de données entre les nœuds.**

**❓ Quelle combinaison d'actions améliore les performances des requêtes ?**

- **A.** Définir une clé de tri sur la colonne de date utilisée dans les filtres.
- **B.** Supprimer toutes les contraintes de clés primaires.
- **C.** Désactiver la compression des colonnes.
- **D.** Définir une clé de distribution adaptée sur la colonne de jointure de la grande table, et distribuer la petite table en mode ALL.
- **E.** Convertir le cluster en base Amazon RDS for PostgreSQL.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c147)</sub>

---

<a id="q148"></a>

### Question 148

`Réponse unique`

**Une équipe analytique utilise un cluster Amazon Redshift provisionné, sollicité environ trois heures par jour ouvré et totalement inactif le reste du temps. Le cluster est facturé 24 h/24.**

**❓ Quelle solution réduit le coût avec le moins d'effort opérationnel ?**

- **A.** Utiliser Amazon Redshift Serverless, dont la capacité et la facturation suivent l'usage réel.
- **B.** Supprimer et recréer le cluster manuellement chaque jour.
- **C.** Réduire le nombre de nœuds du cluster de moitié.
- **D.** Migrer les données vers Amazon RDS.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c148)</sub>

---

<a id="q149"></a>

### Question 149

`Réponse unique`

**À la suite d'un incident, une entreprise doit pouvoir identifier précisément quels objets d'un compartiment Amazon S3 sensible ont été lus ou téléchargés, par quel principal et à quelle heure.**

**❓ Quelle solution fournit cette traçabilité ?**

- **A.** Consulter les métriques CloudWatch du compartiment.
- **B.** Activer les journaux de flux VPC.
- **C.** Activer les événements de données (data events) AWS CloudTrail pour ce compartiment, avec livraison vers un compartiment de journalisation dédié.
- **D.** Activer Amazon Macie sur le compartiment.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c149)</sub>

---

<a id="q150"></a>

### Question 150

`Réponse unique`

**Une entreprise doit migrer 120 serveurs physiques et virtuels depuis son centre de données vers Amazon EC2, avec un temps d'indisponibilité de quelques minutes seulement lors de la bascule, sans réinstaller les applications.**

**❓ Quelle solution est la plus adaptée ?**

- **A.** Utiliser AWS Application Migration Service, qui réplique en continu les serveurs sources vers AWS et permet une bascule rapide.
- **B.** Utiliser AWS DataSync pour copier les systèmes de fichiers des serveurs.
- **C.** Exporter les machines virtuelles sur disque et les importer avec AWS Snowball.
- **D.** Réinstaller manuellement chaque application sur de nouvelles instances EC2.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c150)</sub>

---

<a id="q151"></a>

### Question 151

`Réponse unique`

**Une application démarre des instances EC2 dont l'initialisation (chargement d'un jeu de données volumineux en mémoire) dure huit minutes. Lors des pics soudains, les nouvelles instances arrivent trop tard pour absorber la charge.**

**❓ Quelle solution réduit le délai de mise à disposition des nouvelles instances ?**

- **A.** Réduire la période de grâce des contrôles de santé.
- **B.** Configurer un pool d'instances préchauffées (warm pool) sur le groupe Auto Scaling, avec des instances déjà initialisées et arrêtées ou en veille.
- **C.** Augmenter le nombre maximal d'instances du groupe Auto Scaling.
- **D.** Utiliser des instances de plus grande taille pour accélérer l'initialisation.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c151)</sub>

---

<a id="q152"></a>

### Question 152

`Réponses multiples — choisissez **deux** réponses`

**Une entreprise exécute un traitement d'encodage média tolérant aux interruptions sur des instances EC2 en Auto Scaling. Elle veut réduire fortement le coût tout en limitant le risque d'interruption simultanée de toute la flotte.**

**❓ Quelle combinaison d'actions répond à ce besoin ?**

- **A.** Acheter des instances réservées pour la totalité de la capacité maximale.
- **B.** Restreindre le groupe à un seul type d'instance Spot afin de simplifier l'exploitation.
- **C.** Diversifier les types et les tailles d'instances éligibles et utiliser la stratégie d'allocation « capacity-optimized » pour les instances Spot.
- **D.** Configurer une politique d'instances mixtes sur le groupe Auto Scaling, combinant une part d'instances à la demande et une majorité d'instances Spot.
- **E.** Désactiver la mise à l'échelle automatique et fixer la capacité au maximum.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c152)</sub>

---

<a id="q153"></a>

### Question 153

`Réponse unique`

**Une entreprise doit appliquer les correctifs de sécurité du système d'exploitation à 500 instances EC2 Linux et Windows, selon des fenêtres de maintenance différentes par environnement, et produire un rapport de conformité pour l'audit.**

**❓ Quelle solution répond à ce besoin avec le moins d'effort opérationnel ?**

- **A.** Se connecter à chaque instance et appliquer les correctifs manuellement.
- **B.** Utiliser AWS Systems Manager Patch Manager avec des lignes de base de correctifs, des fenêtres de maintenance et les rapports de conformité associés.
- **C.** Activer Amazon Inspector, qui applique automatiquement les correctifs détectés.
- **D.** Recréer toutes les instances chaque mois à partir d'une nouvelle AMI construite à la main.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c153)</sub>

---

<a id="q154"></a>

### Question 154

`Réponse unique`

**Une entreprise doit déclencher plusieurs centaines de tâches planifiées (rapports, nettoyages, appels d'API) à des horaires précis, avec gestion des fuseaux horaires et des tentatives en cas d'échec, sans maintenir de serveur exécutant `cron`.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Utiliser Amazon EventBridge Scheduler, qui planifie des invocations vers des cibles AWS avec fuseaux horaires, fenêtres de flexibilité et politique de nouvelles tentatives.
- **B.** Créer une fonction Lambda qui interroge une table toutes les secondes.
- **C.** Utiliser AWS Batch pour toutes les tâches planifiées.
- **D.** Maintenir une instance EC2 dédiée avec un fichier `crontab`.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c154)</sub>

---

<a id="q155"></a>

### Question 155

`Réponse unique`

**Une instance EC2 exécutant un service de transfert de fichiers sature en permanence sa bande passante réseau, alors que le processeur et la mémoire restent peu utilisés. Le débit plafonne bien en dessous de ce que le stockage pourrait fournir.**

**❓ Quelle action corrige ce goulet d'étranglement ?**

- **A.** Ajouter un volume EBS io2 supplémentaire.
- **B.** Activer la surveillance détaillée CloudWatch.
- **C.** Placer l'instance dans un groupe de placement de type spread.
- **D.** Choisir un type et une taille d'instance offrant une bande passante réseau supérieure, avec le réseau amélioré (ENA) activé.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c155)</sub>

---

<a id="q156"></a>

### Question 156

`Réponse unique`

**Une PME doit relier son agence à AWS pour un trafic moyen de 50 Mbit/s, sans exigence de latence garantie. Le budget est serré et le raccordement doit être opérationnel en quelques jours.**

**❓ Quelle solution de connectivité est la plus appropriée ?**

- **A.** Une connexion AWS Site-to-Site VPN sur la liaison Internet existante, avec deux tunnels pour la redondance.
- **B.** Une connexion AWS Direct Connect dédiée de 1 Gbit/s.
- **C.** Deux connexions AWS Direct Connect dans deux emplacements différents.
- **D.** Un appairage de VPC avec le réseau de l'agence.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c156)</sub>

---

<a id="q157"></a>

### Question 157

`Réponse unique`

**Plusieurs conteneurs s'exécutent dans le même cluster Amazon ECS. Chaque service doit accéder uniquement à ses propres ressources AWS : une file SQS pour l'un, un compartiment S3 pour l'autre. Actuellement, tous utilisent le rôle de l'instance sous-jacente, qui cumule toutes les permissions.**

**❓ Quelle solution applique le principe du moindre privilège ?**

- **A.** Définir un rôle IAM de tâche (task role) distinct pour chaque définition de tâche, avec uniquement les permissions nécessaires au service concerné.
- **B.** Créer un cluster ECS par service.
- **C.** Restreindre les permissions du rôle d'exécution de tâche (task execution role).
- **D.** Stocker des clés d'accès différentes dans les variables d'environnement de chaque conteneur.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c157)</sub>

---

<a id="q158"></a>

### Question 158

`Réponse unique`

**Une architecture de microservices produit des latences intermittentes. Les équipes n'arrivent pas à déterminer quel service ou quel appel en aval provoque les ralentissements, ni comment une requête traverse l'ensemble de la chaîne.**

**❓ Quelle solution fournit cette visibilité ?**

- **A.** Activer la surveillance détaillée sur les instances EC2.
- **B.** Augmenter la rétention des journaux dans CloudWatch Logs.
- **C.** Instrumenter les services avec AWS X-Ray pour obtenir des traces distribuées et une carte des services avec les latences par segment.
- **D.** Activer les journaux de flux VPC sur tous les sous-réseaux.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c158)</sub>

---

<a id="q159"></a>

### Question 159

`Réponse unique`

**Une entreprise doit nettoyer, dédupliquer et convertir chaque nuit des fichiers CSV déposés dans Amazon S3 en fichiers Parquet partitionnés, puis cataloguer le résultat pour qu'il soit interrogeable. Elle ne veut gérer aucun cluster.**

**❓ Quelle solution est la plus adaptée ?**

- **A.** Une fonction AWS Lambda traitant l'ensemble des fichiers en une invocation.
- **B.** Un serveur ETL installé sur une instance EC2.
- **C.** Un cluster Amazon EMR permanent exécutant un script Spark.
- **D.** Une tâche AWS Glue (Spark serverless) planifiée, avec un crawler alimentant le catalogue de données AWS Glue.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c159)</sub>

---

<a id="q160"></a>

### Question 160

`Réponse unique`

**Une politique de sécurité impose le chiffrement de bout en bout : le trafic doit être chiffré entre les clients et l'Application Load Balancer, mais aussi entre l'Application Load Balancer et les instances backend.**

**❓ Quelle configuration répond à cette exigence ?**

- **A.** Utiliser un Network Load Balancer en mode TCP sans certificat.
- **B.** Activer le chiffrement des volumes EBS des instances backend.
- **C.** Configurer un écouteur HTTPS sur l'Application Load Balancer avec un certificat ACM, et configurer le groupe cible en HTTPS afin que la connexion vers les instances soit également chiffrée.
- **D.** Terminer le TLS sur l'Application Load Balancer et utiliser HTTP vers les instances, le trafic restant dans le VPC.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c160)</sub>

---

<a id="q161"></a>

### Question 161

`Réponse unique`

**Une entreprise veut détecter automatiquement les ressources non conformes à ses règles internes — volumes EBS non chiffrés, groupes de sécurité autorisant 0.0.0.0/0 sur le port 22 — et les corriger sans intervention humaine.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Interdire la création de groupes de sécurité par une SCP.
- **B.** Analyser les journaux CloudTrail chaque semaine et corriger manuellement.
- **C.** Activer Amazon GuardDuty et traiter ses résultats à la main.
- **D.** Déployer des règles AWS Config managées avec des actions de remédiation automatique s'appuyant sur AWS Systems Manager Automation.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c161)</sub>

---

<a id="q162"></a>

### Question 162

`Réponse unique`

**Une rubrique Amazon SNS diffuse tous les événements de commande à quatre files Amazon SQS. Trois consommateurs ne s'intéressent qu'à un sous-ensemble d'événements (par exemple les commandes supérieures à 500 €) mais reçoivent tout et rejettent 90 % des messages, ce qui gaspille des ressources.**

**❓ Quelle solution répond à ce besoin sans modifier les producteurs ?**

- **A.** Filtrer les messages dans le code de chaque consommateur.
- **B.** Créer une rubrique SNS par type d'événement.
- **C.** Appliquer des politiques de filtrage (filter policies) sur les abonnements SNS, en s'appuyant sur les attributs des messages.
- **D.** Remplacer SNS par une file SQS FIFO unique.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c162)</sub>

---

<a id="q163"></a>

### Question 163

`Réponse unique`

**Une entreprise migre un serveur de fichiers d'entreprise qui doit être accessible simultanément en NFS par des serveurs Linux et en SMB par des postes Windows, avec des fonctions de gestion avancées (instantanés, clonage, hiérarchisation automatique du stockage).**

**❓ Quelle solution répond à ces exigences ?**

- **A.** Amazon EFS avec des points d'accès distincts.
- **B.** Un volume Amazon EBS partagé entre les serveurs.
- **C.** Amazon S3 avec AWS Transfer Family.
- **D.** Amazon FSx for NetApp ONTAP, qui prend en charge NFS et SMB simultanément.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c163)</sub>

---

<a id="q164"></a>

### Question 164

`Réponse unique`

**La direction financière veut analyser finement les coûts AWS : coût par ressource, par étiquette et par heure, avec ses propres tableaux croisés et des requêtes SQL personnalisées portant sur plusieurs mois d'historique.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Utiliser uniquement le tableau de bord de facturation.
- **B.** Activer AWS Cost and Usage Report vers un compartiment Amazon S3, puis interroger les données avec Amazon Athena.
- **C.** Exporter les captures d'écran de Cost Explorer chaque mois.
- **D.** Activer AWS Budgets avec des alertes hebdomadaires.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c164)</sub>

---

<a id="q165"></a>

### Question 165

`Réponses multiples — choisissez **deux** réponses`

**Une base Amazon RDS for PostgreSQL contient des données réglementées. L'équipe sécurité exige que la base ne soit jamais joignable depuis Internet et que les applications s'y connectent sans mot de passe statique stocké dans leur configuration.**

**❓ Quelle combinaison d'actions répond à ces exigences ?**

- **A.** Créer un utilisateur PostgreSQL partagé par toutes les applications.
- **B.** Stocker le mot de passe de la base dans le code source chiffré du dépôt.
- **C.** Activer l'authentification IAM pour la base de données et faire générer par les applications un jeton d'authentification temporaire à partir de leur rôle IAM.
- **D.** Activer l'accès public de l'instance et restreindre par NACL.
- **E.** Déployer l'instance dans des sous-réseaux privés, sans accessibilité publique, avec un groupe de sécurité n'autorisant que le groupe de sécurité des serveurs applicatifs.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c165)</sub>

---

<a id="q166"></a>

### Question 166

`Réponse unique`

**Le trafic d'une application suit un motif hebdomadaire très régulier depuis deux ans : forte montée le lundi matin, creux le week-end. Les politiques réactives réagissent avec quelques minutes de retard à chaque montée, ce qui dégrade l'expérience.**

**❓ Quelle fonctionnalité d'Amazon EC2 Auto Scaling est la plus adaptée ?**

- **A.** La désactivation de la mise à l'échelle au profit d'une capacité fixe élevée.
- **B.** Une politique de suivi de cible sur le processeur, avec un seuil abaissé.
- **C.** Une politique de mise à l'échelle simple sur une alarme unique.
- **D.** La mise à l'échelle prédictive (predictive scaling), qui apprend l'historique et provisionne la capacité avant la montée de charge.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c166)</sub>

---

<a id="q167"></a>

### Question 167

`Réponse unique`

**Une base Amazon RDS for MySQL de production doit offrir un basculement en moins de 35 secondes et permettre en outre de servir du trafic de lecture depuis les instances de secours, sans passer par une architecture Aurora.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Une instance Single-AZ avec des instantanés fréquents.
- **B.** Un réplica en lecture unique dans une autre Région.
- **C.** Un déploiement RDS Multi-AZ avec cluster de base de données (Multi-AZ DB cluster), composé d'une instance d'écriture et de deux instances de secours lisibles.
- **D.** Un déploiement Multi-AZ classique avec une instance de secours non lisible.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c167)</sub>

---

<a id="q168"></a>

### Question 168

`Réponses multiples — choisissez **deux** réponses`

**Après un an d'exploitation, une table Amazon DynamoDB en mode à la demande présente une charge devenue stable et prévisible, avec des éléments volumineux contenant de nombreux attributs rarement lus, et plusieurs index secondaires globaux projetant tous les attributs.**

**❓ Quelle combinaison d'actions réduit le coût ?**

- **A.** Passer la table en mode de capacité provisionnée avec Auto Scaling, la charge étant désormais prévisible.
- **B.** Doubler la capacité provisionnée pour éviter toute limitation.
- **C.** Limiter les projections des index secondaires globaux aux seuls attributs réellement interrogés.
- **D.** Supprimer la restauration à un instant donné pour économiser du stockage.
- **E.** Remplacer les index secondaires globaux par des opérations `Scan`.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c168)</sub>

---

<a id="q169"></a>

### Question 169

`Réponse unique`

**Une entreprise répond à un appel d'offres et doit fournir à son client les rapports d'audit de conformité d'AWS (SOC 2, ISO 27001, PCI DSS) couvrant les services qu'elle utilise.**

**❓ Où obtenir ces documents ?**

- **A.** Dans AWS Artifact, qui met à disposition les rapports de conformité et les accords d'AWS.
- **B.** Dans AWS Security Hub.
- **C.** Dans AWS Config, section conformité.
- **D.** Auprès du support AWS, sur demande écrite au format papier.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c169)</sub>

---

<a id="q170"></a>

### Question 170

`Réponses multiples — choisissez **deux** réponses`

**Une API publique reçoit des rafales imprévisibles pouvant atteindre 50 000 requêtes par seconde. Les requêtes déclenchent un traitement de plusieurs secondes et une écriture dans une base relationnelle qui sature. L'entreprise veut absorber les rafales sans perdre de requête ni faire tomber la base.**

**❓ Quelle combinaison d'actions répond à ces exigences ?**

- **A.** Supprimer la limitation de débit (throttling) sur l'API pour laisser passer toutes les requêtes vers la base.
- **B.** Augmenter sans limite la concurrence de la fonction Lambda qui écrit dans la base.
- **C.** Intégrer Amazon API Gateway directement à une file Amazon SQS afin d'absorber les requêtes, puis les traiter de façon asynchrone.
- **D.** Configurer une concurrence réservée sur la fonction Lambda consommatrice afin de limiter le nombre de connexions simultanées vers la base.
- **E.** Traiter chaque requête de façon synchrone et retourner une erreur lorsque la base est saturée.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c170)</sub>

---

<a id="q171"></a>

### Question 171

`Réponse unique`

**Une API REST simple, servant uniquement de proxy vers des fonctions AWS Lambda, n'utilise ni plans d'utilisation, ni transformation de requête, ni validation avancée. L'équipe cherche à réduire la latence et le coût par requête.**

**❓ Quelle solution est la plus adaptée ?**

- **A.** Conserver l'API REST et activer la mise en cache maximale.
- **B.** Remplacer API Gateway par un Application Load Balancer devant les fonctions Lambda et gérer soi-même l'authentification.
- **C.** Exposer directement les URL de fonction Lambda sans passerelle ni contrôle.
- **D.** Utiliser une API HTTP d'Amazon API Gateway, moins coûteuse et à latence plus faible que l'API REST pour les intégrations simples.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c171)</sub>

---

<a id="q172"></a>

### Question 172

`Réponse unique`

**Une entreprise partage un compartiment Amazon S3 et une clé AWS KMS entre les comptes de son organisation. Elle veut garantir que seuls les principaux appartenant à son organisation AWS puissent y accéder, sans énumérer chaque identifiant de compte dans les politiques.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Créer un utilisateur IAM partagé entre tous les comptes.
- **B.** Rendre le compartiment public et se fier au chiffrement.
- **C.** Ajouter aux politiques de ressource une condition `aws:PrincipalOrgID` correspondant à l'identifiant de l'organisation.
- **D.** Lister chaque compte dans le champ `Principal` et mettre la politique à jour à chaque nouveau compte.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c172)</sub>

---

<a id="q173"></a>

### Question 173

`Réponse unique`

**Une application critique s'exécute dans des sous-réseaux privés répartis sur trois zones de disponibilité et accède à Internet pour télécharger des mises à jour. Une seule NAT gateway, déployée dans la première zone, dessert l'ensemble des sous-réseaux privés.**

**❓ Quelle modification améliore la résilience de cette architecture ?**

- **A.** Remplacer la NAT gateway par une instance NAT de très grande taille.
- **B.** Déployer une NAT gateway dans chaque zone de disponibilité et router chaque sous-réseau privé vers la NAT gateway de sa propre zone.
- **C.** Ajouter une seconde route vers la passerelle Internet dans les sous-réseaux privés.
- **D.** Placer la NAT gateway derrière un Network Load Balancer.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c173)</sub>

---

<a id="q174"></a>

### Question 174

`Réponse unique`

**Une entreprise doit restituer 30 To d'archives depuis S3 Glacier Flexible Retrieval dans le cadre d'un audit. Le délai accordé est de deux jours et le coût de restitution doit être le plus faible possible.**

**❓ Quelle option de restitution choisir ?**

- **A.** La restitution accélérée (Expedited), en 1 à 5 minutes.
- **B.** Copier les données vers S3 Standard avant restitution.
- **C.** La restitution en masse (Bulk), dont le délai est de 5 à 12 heures pour le coût le plus bas.
- **D.** La restitution standard, en 3 à 5 heures.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c174)</sub>

---

<a id="q175"></a>

### Question 175

`Réponses multiples — choisissez **deux** réponses`

**Un catalogue de produits est stocké dans Amazon RDS. Les mêmes fiches produits sont lues des milliers de fois par seconde et changent rarement. L'équipe met en place un cache Amazon ElastiCache et veut éviter à la fois la surcharge de la base et l'affichage de données obsolètes.**

**❓ Quelle combinaison de pratiques est appropriée ?**

- **A.** Mettre en cache l'intégralité de la base au démarrage, sans expiration.
- **B.** Mettre en œuvre le motif « cache-aside » (lazy loading) : lire d'abord le cache, interroger la base uniquement en cas d'absence, puis alimenter le cache.
- **C.** Désactiver le cache pendant les heures de pointe pour garantir la fraîcheur.
- **D.** Stocker les entrées du cache uniquement dans la mémoire locale de chaque instance applicative.
- **E.** Définir une durée de vie (TTL) sur les entrées du cache et invalider explicitement les clés concernées lors des mises à jour du catalogue.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c175)</sub>

---

<a id="q176"></a>

### Question 176

`Réponse unique`

**Une entreprise utilise Amazon GuardDuty, Amazon Inspector, Amazon Macie et AWS Config dans 25 comptes. Les équipes sécurité perdent du temps à consulter chaque console et veulent une vue unique, priorisée et normalisée des alertes, avec un suivi des normes de sécurité.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Activer Amazon Detective uniquement.
- **B.** Activer AWS Security Hub avec un compte administrateur délégué agrégeant les résultats de tous les comptes et Régions.
- **C.** Exporter les résultats de chaque service vers S3 et les analyser manuellement.
- **D.** Créer un tableau de bord CloudWatch par service.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c176)</sub>

---

<a id="q177"></a>

### Question 177

`Réponse unique`

**Une instance EC2 exécutant un service interne devient inaccessible lorsque le matériel sous-jacent tombe en panne. L'application ne peut pas être répartie sur plusieurs instances, mais l'entreprise veut qu'elle redémarre automatiquement sur un hôte sain en conservant son adresse IP privée et ses volumes EBS.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Activer la protection contre la terminaison.
- **B.** Créer un instantané quotidien de l'instance.
- **C.** Déplacer l'instance vers un groupe de placement en cluster.
- **D.** Configurer la récupération automatique de l'instance EC2 (auto recovery) via une action d'alarme CloudWatch sur les contrôles d'état système.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c177)</sub>

---

<a id="q178"></a>

### Question 178

`Réponse unique`

**Des clusters Amazon ECS situés dans des sous-réseaux privés téléchargent en continu des images de conteneurs depuis Amazon ECR et écrivent des artefacts dans Amazon S3. La facture montre plusieurs milliers d'euros par mois de frais de traitement de données sur les NAT gateways.**

**❓ Quelle solution réduit ce coût ?**

- **A.** Réduire la fréquence des déploiements de conteneurs.
- **B.** Créer des points de terminaison VPC de type Interface pour ECR (api et dkr) et CloudWatch Logs, ainsi qu'un point de terminaison de type Gateway pour S3, afin que ce trafic ne passe plus par les NAT gateways.
- **C.** Augmenter la taille des NAT gateways.
- **D.** Déplacer les tâches ECS dans des sous-réseaux publics avec des adresses IP publiques.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c178)</sub>

---

<a id="q179"></a>

### Question 179

`Réponse unique`

**Une direction métier veut construire elle-même des tableaux de bord interactifs sur des données stockées dans Amazon S3 et interrogées via Amazon Athena, avec des temps de réponse rapides pour des centaines d'utilisateurs et sans infrastructure à gérer.**

**❓ Quelle solution est la plus adaptée ?**

- **A.** Utiliser Amazon QuickSight avec son moteur en mémoire SPICE, connecté à Athena.
- **B.** Développer une application web de visualisation sur des instances EC2.
- **C.** Exporter les résultats dans des fichiers de tableur partagés.
- **D.** Installer un outil de BI open source sur un cluster Amazon EMR.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c179)</sub>

---

<a id="q180"></a>

### Question 180

`Réponse unique`

**Une entreprise réplique des objets Amazon S3 chiffrés entre l'Irlande et la Virginie du Nord, et veut que les données restent chiffrées avec le même matériel de clé dans les deux Régions, sans devoir déchiffrer puis rechiffrer avec une clé différente à chaque réplication.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Utiliser des clés multi-Régions AWS KMS (multi-Region keys), répliquées dans les deux Régions avec le même matériel de clé.
- **B.** Désactiver le chiffrement pendant la réplication.
- **C.** Créer une clé KMS indépendante dans chaque Région et accepter le rechiffrement.
- **D.** Utiliser SSE-C avec des clés fournies par l'application.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c180)</sub>

---

<a id="q181"></a>

### Question 181

`Réponse unique`

**Une entreprise déploie une application sur des instances Amazon EC2 avec une base Amazon RDS. Lors d'un audit, on lui demande de préciser ce dont elle reste responsable en matière de sécurité.**

**❓ Quelle affirmation décrit correctement le modèle de responsabilité partagée pour cette architecture ?**

- **A.** L'entreprise est responsable de la sécurité physique des centres de données AWS.
- **B.** L'entreprise est responsable des correctifs du système d'exploitation invité des instances EC2, de la configuration des groupes de sécurité et des données ; AWS est responsable de l'infrastructure physique et du correctif du moteur de base de données géré.
- **C.** AWS est responsable des correctifs du système d'exploitation invité et des règles de pare-feu applicatif de l'entreprise.
- **D.** AWS est responsable du chiffrement des données que l'entreprise choisit de stocker.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c181)</sub>

---

<a id="q182"></a>

### Question 182

`Réponse unique`

**Après une mise à jour applicative erronée, un cluster Amazon Aurora MySQL contient des données incorrectes écrites au cours des 20 dernières minutes. L'équipe veut revenir à l'état précédent en quelques minutes, sans restaurer un instantané complet ni créer un nouveau cluster.**

**❓ Quelle fonctionnalité répond à ce besoin ?**

- **A.** L'export du cluster vers Amazon S3 puis un import partiel.
- **B.** La suppression manuelle des lignes concernées.
- **C.** Aurora Backtrack, qui ramène le cluster à un point antérieur dans le temps sans restauration.
- **D.** La promotion d'un réplica en lecture.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c182)</sub>

---

<a id="q183"></a>

### Question 183

`Réponse unique`

**Une application exécutée sur EC2 utilise un volume Amazon EBS gp3 de 200 Go. Les mesures montrent que le volume plafonne à son débit de base alors que l'application aurait besoin de 750 Mo/s pour ses traitements séquentiels, sans avoir besoin de plus d'espace.**

**❓ Quelle action répond à ce besoin ?**

- **A.** Multiplier par cinq la taille du volume pour augmenter le débit de base.
- **B.** Augmenter directement le débit provisionné et les IOPS du volume gp3, indépendamment de sa taille.
- **C.** Convertir le volume en gp2 de très grande taille.
- **D.** Ajouter un second volume et laisser l'application choisir.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c183)</sub>

---

<a id="q184"></a>

### Question 184

`Réponse unique`

**Un cluster Amazon EMR traite chaque nuit des jeux de données volumineux. Le traitement peut redémarrer sans conséquence si une partie de la capacité disparaît, et l'entreprise veut réduire fortement le coût du cluster.**

**❓ Quelle configuration est la plus appropriée ?**

- **A.** Acheter des instances réservées de 3 ans pour l'ensemble du cluster.
- **B.** Exécuter les nœuds principaux (primary) et les nœuds core sur des instances à la demande, et les nœuds task sur des instances Spot.
- **C.** Exécuter l'ensemble du cluster, y compris le nœud primaire, sur des instances Spot.
- **D.** Exécuter tout le cluster sur des instances à la demande de grande taille.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c184)</sub>

---

<a id="q185"></a>

### Question 185

`Réponse unique`

**Une entreprise veut garantir qu'aucun objet non chiffré ne puisse être déposé dans un compartiment Amazon S3, même si un client oublie de préciser l'en-tête de chiffrement.**

**❓ Quelle solution répond à cette exigence ?**

- **A.** Activer S3 Block Public Access.
- **B.** Demander aux équipes de développement de toujours activer le chiffrement côté client.
- **C.** Activer le chiffrement par défaut du compartiment et ajouter une politique de compartiment refusant les requêtes `s3:PutObject` dont l'en-tête de chiffrement demandé n'est pas conforme.
- **D.** Chiffrer les objets a posteriori avec une tâche mensuelle.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c185)</sub>

---

<a id="q186"></a>

### Question 186

`Réponse unique`

**Une entreprise sauvegarde encore ses serveurs sur bandes physiques avec un logiciel de sauvegarde qui pilote une librairie de bandes. Elle veut supprimer les bandes et les envois hors site, sans remplacer son logiciel de sauvegarde ni modifier ses procédures.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Déployer AWS Storage Gateway en mode Tape Gateway, qui présente une librairie de bandes virtuelles au logiciel existant et archive les bandes dans S3 Glacier.
- **B.** Remplacer le logiciel de sauvegarde par AWS Backup.
- **C.** Copier les fichiers de sauvegarde vers Amazon S3 avec la CLI.
- **D.** Déployer AWS DataSync vers Amazon EFS.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c186)</sub>

---

<a id="q187"></a>

### Question 187

`Réponses multiples — choisissez **deux** réponses`

**Une application derrière un Application Load Balancer est déployée sur trois zones de disponibilité, mais avec un nombre d'instances différent par zone. Les équipes constatent que les instances de la zone la moins peuplée reçoivent beaucoup plus de requêtes que les autres, et que certaines instances lentes accumulent des requêtes en attente.**

**❓ Quelle combinaison d'actions améliore la répartition de la charge ?**

- **A.** Désactiver les contrôles de santé pour éviter de retirer des cibles.
- **B.** Utiliser l'algorithme de routage « least outstanding requests » sur le groupe cible pour éviter d'envoyer des requêtes aux cibles déjà surchargées.
- **C.** Activer les sessions persistantes sur toutes les cibles.
- **D.** Vérifier que l'équilibrage entre zones (cross-zone load balancing) est activé afin que le trafic soit réparti entre toutes les cibles saines, quelle que soit leur zone.
- **E.** Créer un Application Load Balancer par zone de disponibilité.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c187)</sub>

---

<a id="q188"></a>

### Question 188

`Réponse unique`

**Une entreprise chiffre plusieurs dizaines de millions d'objets Amazon S3 avec SSE-KMS. La facture AWS KMS explose en raison du nombre d'appels d'API générés par les lectures et écritures d'objets.**

**❓ Quelle solution réduit ce coût tout en conservant le chiffrement avec une clé gérée par le client ?**

- **A.** Désactiver le chiffrement sur les objets les moins sensibles.
- **B.** Créer une clé KMS distincte par objet.
- **C.** Passer tous les objets en SSE-C.
- **D.** Activer les clés de compartiment S3 (S3 Bucket Keys), qui réduisent fortement le nombre d'appels à AWS KMS.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c188)</sub>

---

<a id="q189"></a>

### Question 189

`Réponses multiples — choisissez **deux** réponses`

**Une nouvelle entreprise vient d'ouvrir son compte AWS. L'équipe sécurité veut appliquer immédiatement les bonnes pratiques concernant l'utilisateur racine du compte.**

**❓ Quelle combinaison d'actions est recommandée ?**

- **A.** Activer l'authentification multifacteur sur l'utilisateur racine, de préférence avec un dispositif matériel.
- **B.** Créer des clés d'accès racine et les stocker dans le gestionnaire de secrets de l'entreprise.
- **C.** Partager les identifiants racine entre les trois administrateurs pour garantir la continuité.
- **D.** Supprimer les clés d'accès de l'utilisateur racine et créer des rôles ou des identités fédérées pour les tâches d'administration quotidiennes.
- **E.** Utiliser l'utilisateur racine pour toutes les opérations d'infrastructure quotidiennes.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c189)</sub>

---

<a id="q190"></a>

### Question 190

`Réponse unique`

**Un traitement doit appliquer la même opération à 5 millions d'objets stockés dans Amazon S3, avec un suivi de progression, une reprise après échec partiel et une exécution parallèle contrôlée, sans écrire de code d'orchestration ni gérer de serveurs.**

**❓ Quelle solution est la plus adaptée ?**

- **A.** Créer une file SQS et y déposer manuellement 5 millions de messages depuis un poste de travail.
- **B.** Utiliser AWS Step Functions avec un état Map distribué, qui itère à grande échelle sur les objets S3 et invoque des fonctions Lambda en parallèle avec gestion des erreurs.
- **C.** Lancer un script Python sur une instance EC2 de grande taille.
- **D.** Écrire une fonction Lambda unique qui boucle sur tous les objets.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c190)</sub>

---

<a id="q191"></a>

### Question 191

`Réponse unique`

**Des serveurs situés dans le centre de données de l'entreprise doivent résoudre les noms DNS privés des ressources hébergées dans un VPC (zone hébergée privée Route 53), et les instances du VPC doivent résoudre les noms internes du centre de données. Une liaison Direct Connect est déjà en place.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Utiliser des instances EC2 exécutant un serveur DNS personnalisé dans chaque sous-réseau.
- **B.** Configurer des points de terminaison Route 53 Resolver entrants et sortants, avec des règles de transfert entre le VPC et les serveurs DNS sur site.
- **C.** Créer une zone hébergée publique contenant les noms internes.
- **D.** Copier manuellement les enregistrements DNS dans les fichiers `hosts` des serveurs.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c191)</sub>

---

<a id="q192"></a>

### Question 192

`Réponse unique`

**Après plusieurs alertes Amazon GuardDuty concernant une instance EC2 potentiellement compromise, l'équipe sécurité doit reconstituer la chronologie des activités : appels d'API réalisés, connexions réseau observées et comportement inhabituel du rôle IAM associé, sur plusieurs semaines.**

**❓ Quel service facilite cette investigation ?**

- **A.** AWS Trusted Advisor.
- **B.** Amazon Detective, qui agrège et corrèle automatiquement CloudTrail, les journaux de flux VPC et les résultats GuardDuty pour l'analyse d'incident.
- **C.** AWS Config, en consultant l'historique de configuration.
- **D.** Amazon CloudWatch Logs Insights sur les journaux applicatifs.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c192)</sub>

---

<a id="q193"></a>

### Question 193

`Réponse unique`

**Une application doit propager, de façon fiable et en quasi temps réel, chaque modification d'une table Amazon DynamoDB vers un moteur de recherche et vers un système d'audit, sans modifier le code d'écriture existant.**

**❓ Quelle solution répond à ce besoin ?**

- **A.** Interroger la table toutes les minutes avec des opérations `Scan`.
- **B.** Exporter la table vers Amazon S3 une fois par jour.
- **C.** Activer DynamoDB Streams sur la table et déclencher une fonction AWS Lambda qui alimente les systèmes cibles, avec gestion des erreurs et rejeu.
- **D.** Modifier chaque écriture applicative pour appeler les deux systèmes de façon synchrone.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c193)</sub>

---

<a id="q194"></a>

### Question 194

`Réponses multiples — choisissez **deux** réponses`

**Une entreprise hybride envoie chaque mois plusieurs centaines de téraoctets depuis AWS vers son centre de données et sert un volume important de contenu statique à ses clients sur Internet. Les frais de transfert de données représentent une part majeure de la facture.**

**❓ Quelle combinaison d'actions réduit ces coûts ?**

- **A.** Chiffrer tout le trafic sortant afin de le compresser.
- **B.** Augmenter la taille des instances EC2 émettrices pour accélérer les transferts.
- **C.** Déplacer les données vers une Région où le transfert sortant est gratuit.
- **D.** Acheminer le trafic récurrent vers le centre de données via AWS Direct Connect, dont le tarif de transfert de données sortant est inférieur à celui d'Internet.
- **E.** Servir le contenu statique via Amazon CloudFront afin de réduire le trafic sortant facturé depuis l'origine et de bénéficier de tarifs de diffusion plus avantageux.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c194)</sub>

---

<a id="q195"></a>

### Question 195

`Réponses multiples — choisissez **deux** réponses`

**Une entreprise utilise une connexion AWS Direct Connect de 1 Gbit/s qui sature régulièrement. Elle veut augmenter le débit disponible et éliminer le point de défaillance unique que représente cette liaison unique.**

**❓ Quelle combinaison d'actions répond à ces besoins ?**

- **A.** Agréger plusieurs connexions Direct Connect en un groupe d'agrégation de liens (LAG) pour additionner leur bande passante.
- **B.** Router tout le trafic supplémentaire via une NAT gateway.
- **C.** Remplacer Direct Connect par un appairage de VPC.
- **D.** Établir une seconde connexion Direct Connect dans un emplacement Direct Connect différent, et prévoir un VPN de secours.
- **E.** Réduire le trafic en désactivant le chiffrement des données.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D ☐ E · [Voir le corrigé →](#c195)</sub>

---

<a id="q196"></a>

### Question 196

`Réponse unique`

**Une entreprise soumise à plusieurs référentiels de conformité passe des semaines, à chaque audit, à collecter manuellement des preuves de contrôle dans ses comptes AWS.**

**❓ Quelle solution automatise cette collecte ?**

- **A.** AWS Systems Manager Inventory.
- **B.** AWS Audit Manager, qui collecte en continu les preuves et les associe à des cadres de conformité prédéfinis.
- **C.** AWS Cost Explorer.
- **D.** Amazon Macie.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c196)</sub>

---

<a id="q197"></a>

### Question 197

`Réponse unique`

**Une entreprise européenne lance une nouvelle application. Les données personnelles de ses clients doivent obligatoirement rester stockées dans l'Union européenne, et les utilisateurs se trouvent principalement en France et en Allemagne. L'équipe hésite sur l'emplacement de déploiement.**

**❓ Quel critère doit guider le choix, et quelle conclusion s'impose ?**

- **A.** Déployer dans une seule zone de disponibilité pour réduire le coût.
- **B.** Déployer dans une Région américaine et utiliser CloudFront pour la conformité.
- **C.** Choisir la Région la moins chère, quelle que soit sa localisation, et chiffrer les données.
- **D.** Sélectionner une Région AWS de l'Union européenne répondant à l'exigence de résidence des données, en privilégiant parmi celles-ci la plus proche des utilisateurs, puis déployer sur plusieurs zones de disponibilité.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c197)</sub>

---

<a id="q198"></a>

### Question 198

`Réponse unique`

**Une table Amazon DynamoDB conserve un historique de commandes de plusieurs téraoctets. Les données de plus de six mois sont interrogées moins d'une fois par mois mais doivent rester disponibles instantanément. Le coût de stockage devient le premier poste de dépense de la table.**

**❓ Quelle solution réduit ce coût ?**

- **A.** Supprimer les données de plus de six mois.
- **B.** Ajouter des index secondaires globaux pour accélérer les requêtes.
- **C.** Activer le mode de capacité à la demande sur la table.
- **D.** Utiliser la classe de table DynamoDB Standard-Infrequent Access pour les données peu consultées.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c198)</sub>

---

<a id="q199"></a>

### Question 199

`Réponse unique`

**Un traitement de conversion de documents dure entre 25 et 45 minutes par exécution, consomme 8 Go de mémoire et s'exécute une dizaine de fois par jour de façon irrégulière. L'équipe ne veut ni gérer de serveurs ni payer de capacité inutilisée.**

**❓ Quelle solution est la plus adaptée ?**

- **A.** Exécuter le traitement dans une tâche AWS Fargate déclenchée à la demande, facturée à la durée d'exécution.
- **B.** Maintenir une instance EC2 m5.2xlarge allumée en permanence.
- **C.** Déployer un cluster Amazon EKS sur EC2 dimensionné pour la charge maximale.
- **D.** Exécuter le traitement dans une fonction AWS Lambda avec 8 Go de mémoire.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c199)</sub>

---

<a id="q200"></a>

### Question 200

`Réponse unique`

**Une entreprise conçoit une nouvelle application web à trois niveaux traitant des données financières. Les exigences sont les suivantes : aucun composant applicatif ou base de données accessible depuis Internet, chiffrement des données au repos avec des clés dont l'entreprise contrôle la politique, protection contre les attaques web courantes, et accès administrateur sans port ouvert.**

**❓ Quelle architecture répond le mieux à l'ensemble de ces exigences ?**

- **A.** Instances applicatives et base de données dans des sous-réseaux publics avec des adresses IP publiques, protégées par des NACL restrictives et un bastion SSH.
- **B.** Application Load Balancer public protégé par AWS WAF dans les sous-réseaux publics ; instances applicatives et base Amazon RDS dans des sous-réseaux privés avec des groupes de sécurité référencés entre niveaux ; chiffrement SSE-KMS et RDS avec des clés gérées par le client ; administration via AWS Systems Manager Session Manager.
- **C.** Toutes les couches dans un seul sous-réseau public, avec AWS Shield Standard et des mots de passe stockés dans les variables d'environnement des instances.
- **D.** Application Load Balancer interne uniquement, base de données publique chiffrée avec SSE-S3, et accès administrateur par clés SSH partagées.

<sub>Ma réponse : ☐ A ☐ B ☐ C ☐ D · [Voir le corrigé →](#c200)</sub>

---

<a id="partie-5"></a>

# Partie 5 — Corrigé détaillé commenté

Chaque corrigé suit la même trame : **la bonne réponse en vert**, l'analyse qui la justifie, l'élimination des distracteurs, puis le **point clé** transposable à toutes les questions du même type.

Lisez les 200 corrigés, y compris ceux des questions réussies : la moitié de la valeur de cet examen blanc se trouve dans les blocs « À retenir ».

---

<a id="c1"></a>

### Corrigé — Question 1

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q1)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Créer un point de terminaison VPC de type Gateway pour Amazon S3 et ajouter la route correspondante dans les tables de routage des sous-réseaux privés.</span>

**Pourquoi cette réponse ?**

Le point de terminaison VPC de type Gateway pour Amazon S3 ajoute une route vers un préfixe géré dans la table de routage des sous-réseaux privés : le trafic vers S3 reste sur le réseau AWS, sans passerelle Internet ni NAT. Il est gratuit et ne facture aucun traitement de données.

**⚠️ Pourquoi pas les autres options ?**

La NAT gateway (A) fonctionnerait mais fait sortir le trafic vers le point de terminaison public de S3 et facture chaque gigaoctet traité. Le proxy (B) ajoute un composant à administrer et un point de défaillance. Le VPN (C) ne peut pas cibler un service public AWS de cette manière.

> 💡 **À retenir** — pour accéder à Amazon S3 ou DynamoDB depuis un VPC sans passer par Internet ni par une NAT gateway, utiliser un Gateway VPC Endpoint (gratuit). Pour les autres services, c'est un Interface Endpoint (AWS PrivateLink, facturé à l'heure et au Go).

---

<a id="c2"></a>

### Corrigé — Question 2

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q2)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Publier les commandes dans une file Amazon SQS et placer les instances de traitement dans un groupe Auto Scaling qui se dimensionne sur la profondeur de la file.</span>

**Pourquoi cette réponse ?**

Amazon SQS sert de tampon durable : les commandes sont conservées (jusqu'à 14 jours) même si la couche de traitement est saturée. Le groupe Auto Scaling piloté par la métrique `ApproximateNumberOfMessagesVisible` (ou `BacklogPerInstance`) ajoute des instances pendant le pic et les retire ensuite.

**⚠️ Pourquoi pas les autres options ?**

Agrandir les instances (A) ne supprime pas la perte au-delà d'un seuil et coûte cher en permanence. Les sessions persistantes (D) ne changent rien à la capacité de traitement. EBS (C) n'est pas partageable ainsi et introduit une latence d'une heure.

> 💡 **À retenir** — « pics de charge » + « aucune perte » = découplage par file SQS, avec mise à l'échelle sur la profondeur de la file, jamais sur le CPU seul.

---

<a id="c3"></a>

### Corrigé — Question 3

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q3)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Un système de fichiers Amazon EFS monté par toutes les instances, avec des cibles de montage dans chaque zone de disponibilité.</span>

**Pourquoi cette réponse ?**

Amazon EFS est un système de fichiers NFS entièrement managé, accessible simultanément par des milliers d'instances réparties sur plusieurs zones de disponibilité, et dont la capacité croît et décroît automatiquement.

**⚠️ Pourquoi pas les autres options ?**

EBS Multi-Attach (D) est limité aux volumes io1/io2, à une seule zone de disponibilité et à 16 instances, et exige un système de fichiers en cluster. S3 (C) est un stockage objet : il ne fournit pas de sémantique POSIX native. Le stockage d'instance (A) est éphémère et non partagé.

> 💡 **À retenir** — partage de fichiers POSIX entre plusieurs instances Linux et multi-AZ = Amazon EFS. Pour Windows/SMB = Amazon FSx for Windows File Server.

---

<a id="c4"></a>

### Corrigé — Question 4

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q4)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Créer dans le compte Production un rôle IAM approuvant le compte Analytique, autoriser les analystes à l'assumer via AWS STS et accorder à ce rôle un accès en lecture au compartiment.</span>

**Pourquoi cette réponse ?**

L'accès entre comptes se conçoit avec un rôle IAM : le compte Production crée un rôle dont la politique d'approbation désigne le compte Analytique, et les analystes obtiennent des identifiants temporaires via `sts:AssumeRole`. Aucun identifiant de longue durée n'est partagé et l'accès est révocable instantanément.

**⚠️ Pourquoi pas les autres options ?**

Les clés d'accès (A) sont des identifiants permanents à proscrire. Rendre le compartiment public (B) expose les données. La copie nocturne (C) duplique des données sensibles et crée une dérive.

> 💡 **À retenir** — accès entre comptes AWS = rôle IAM assumé via AWS STS. Ne jamais distribuer de clés d'accès IAM à long terme.

---

<a id="c5"></a>

### Corrigé — Question 5

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q5)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Appliquer une règle de cycle de vie qui déplace les objets vers S3 Glacier Deep Archive après 30 jours, puis les supprime après 7 ans.</span>

**Pourquoi cette réponse ?**

S3 Glacier Deep Archive est la classe de stockage la moins chère d'Amazon S3 ; sa restitution standard s'effectue en 12 heures environ, ce qui correspond exactement à l'exigence. Une règle de cycle de vie automatise la transition à 30 jours et l'expiration à 7 ans.

**⚠️ Pourquoi pas les autres options ?**

S3 Standard (D) coûte environ dix fois plus cher au stockage. S3 Standard-IA (C) reste bien plus onéreux sur 7 ans qu'une classe d'archive. One Zone-IA dans une autre Région (A) ajoute des coûts de réplication et réduit la durabilité face à la perte d'une zone.

> 💡 **À retenir** — délai de restitution acceptable de plusieurs heures + rétention longue = S3 Glacier Deep Archive via une règle de cycle de vie. Restitution en minutes = S3 Glacier Flexible Retrieval ou Glacier Instant Retrieval.

---

<a id="c6"></a>

### Corrigé — Question 6

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q6)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : A et D</strong></span>

- <span style="color:#1a7f37">**A.** Publier chaque événement dans une rubrique Amazon SNS à laquelle sont abonnées quatre files Amazon SQS, une par microservice.</span>
- <span style="color:#1a7f37">**D.** Associer une file de lettres mortes (DLQ) à chaque file SQS afin d'isoler les messages dont le traitement échoue de façon répétée.</span>

**Pourquoi cette réponse ?**

Le modèle « fan-out » SNS vers plusieurs files SQS donne à chaque microservice sa propre copie du message dans une file durable : un consommateur indisponible retrouve ses messages à son retour, sans impacter les autres. La file de lettres mortes isole les messages « empoisonnés » après un nombre défini d'échecs, ce qui évite de bloquer le traitement.

**⚠️ Pourquoi pas les autres options ?**

Les appels synchrones (E) couplent fortement les services et perdent l'événement en cas de panne. EBS (B) n'est pas un mécanisme de messagerie. Une file unique partagée (C) ne convient pas : chaque message n'est délivré qu'à un seul consommateur.

> 💡 **À retenir** — « plusieurs consommateurs indépendants du même événement » = SNS + SQS (fan-out). Un seul consommateur = SQS seule. Routage par règles = Amazon EventBridge.

---

<a id="c7"></a>

### Corrigé — Question 7

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q7)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Créer des réplicas en lecture Amazon RDS et diriger les requêtes de reporting vers leur point de terminaison.</span>

**Pourquoi cette réponse ?**

Les réplicas en lecture Amazon RDS déchargent l'instance principale du trafic de lecture. Il suffit de faire pointer les rapports vers le point de terminaison de lecture, sans toucher au chemin d'écriture.

**⚠️ Pourquoi pas les autres options ?**

En Multi-AZ (B), l'instance de secours n'est pas accessible en lecture pour RDS for MySQL classique : elle sert uniquement au basculement. DynamoDB (D) impose une réécriture complète du modèle et des requêtes. Plus d'IOPS (C) ne résout pas une saturation CPU.

> 💡 **À retenir** — Multi-AZ = disponibilité (basculement). Réplica en lecture = performance (répartition des lectures). Ne pas confondre les deux.

---

<a id="c8"></a>

### Corrigé — Question 8

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q8)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Stocker le secret dans AWS Secrets Manager, activer la rotation gérée pour Amazon RDS et faire récupérer le secret par l'application via un rôle IAM.</span>

**Pourquoi cette réponse ?**

AWS Secrets Manager chiffre le secret avec AWS KMS et propose une rotation gérée native pour Amazon RDS : il crée le nouveau mot de passe, le met à jour dans la base et dans le secret, sans interruption. L'application récupère le secret à l'exécution grâce au rôle IAM de l'instance.

**⚠️ Pourquoi pas les autres options ?**

Le fichier chiffré (D) et la variable d'environnement (B) laissent la rotation entièrement manuelle. Parameter Store (A) sait stocker un SecureString mais n'assure pas de rotation gérée : il faut écrire et maintenir la logique Lambda.

> 💡 **À retenir** — rotation automatique des identifiants de base de données = AWS Secrets Manager. Configuration non secrète ou secret sans rotation = Systems Manager Parameter Store (gratuit pour les paramètres standards).

---

<a id="c9"></a>

### Corrigé — Question 9

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q9)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Automatiser l'arrêt et le démarrage des instances hors des heures ouvrées, par exemple avec des règles Amazon EventBridge planifiées et AWS Systems Manager.</span>

**Pourquoi cette réponse ?**

Les environnements hors production n'ont pas besoin de fonctionner en dehors des heures ouvrées. Arrêter les instances de 20 h à 8 h et le week-end supprime environ 70 % des heures facturées ; l'automatisation par EventBridge Scheduler et Systems Manager (ou AWS Instance Scheduler) demande une configuration unique.

**⚠️ Pourquoi pas les autres options ?**

Les Reserved Instances (D) engagent sur 3 ans une capacité inutilisée les deux tiers du temps. Le Spot (B) impose de gérer les interruptions dans un environnement de développement interactif. Le redimensionnement (C) apporte un gain bien plus faible.

> 💡 **À retenir** — premier réflexe de réduction de coût sur du dev/test : éteindre ce qui ne sert pas (planification d'arrêt/démarrage), avant même de penser aux modèles d'achat.

---

<a id="c10"></a>

### Corrigé — Question 10

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q10)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Modifier l'instance de base de données pour activer le déploiement Multi-AZ.</span>

**Pourquoi cette réponse ?**

Le déploiement Multi-AZ d'Amazon RDS maintient une instance de secours répliquée de façon synchrone dans une autre zone de disponibilité. En cas de panne, RDS bascule automatiquement et fait pointer le même nom DNS vers la nouvelle instance principale : l'application n'est pas modifiée.

**⚠️ Pourquoi pas les autres options ?**

Le réplica en lecture (B) exige une promotion manuelle et une réplication asynchrone (risque de perte de données). Restaurer des instantanés (C) donne un RTO bien plus long. Un Network Load Balancer (D) ne gère pas la réplication d'une base de données.

> 💡 **À retenir** — « basculement automatique », « aucune modification applicative », « haute disponibilité de la base » = RDS Multi-AZ (le point de terminaison DNS reste identique).

---

<a id="c11"></a>

### Corrigé — Question 11

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q11)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Lancer les instances dans un groupe de placement en cluster (cluster placement group), au sein d'une même zone de disponibilité, avec des types d'instances prenant en charge Elastic Fabric Adapter.</span>

**Pourquoi cette réponse ?**

Le groupe de placement en cluster rassemble les instances sur un même segment réseau à faible latence et haut débit, condition indispensable pour les charges HPC fortement couplées. Elastic Fabric Adapter contourne le noyau pour les échanges MPI et réduit encore la latence.

**⚠️ Pourquoi pas les autres options ?**

Le spread placement group (C) répartit délibérément les instances pour la résilience, au détriment de la latence. Un load balancer (A) n'intervient pas dans les échanges inter-nœuds MPI. Global Accelerator (D) optimise le trafic des utilisateurs Internet, pas le trafic interne.

> 💡 **À retenir** — HPC / MPI / latence inter-nœuds minimale = cluster placement group (+ EFA). Résilience face aux pannes matérielles = spread placement group.

---

<a id="c12"></a>

### Corrigé — Question 12

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q12)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : A et B</strong></span>

- <span style="color:#1a7f37">**A.** Attacher une politique de contrôle des services (SCP) qui refuse les appels de désactivation de S3 Block Public Access et la mise en place de politiques publiques.</span>
- <span style="color:#1a7f37">**B.** Activer le paramètre S3 Block Public Access au niveau de chaque compte pour bloquer les ACL et les politiques publiques.</span>

**Pourquoi cette réponse ?**

S3 Block Public Access au niveau du compte neutralise toute ACL ou politique rendant un compartiment public, y compris pour les compartiments créés ultérieurement. La SCP empêche un administrateur de compte membre de désactiver ce garde-fou : c'est ce qui rend le contrôle réellement infranchissable dans l'organisation.

**⚠️ Pourquoi pas les autres options ?**

Le chiffrement (E) protège les données au repos mais n'empêche pas une exposition publique. GuardDuty (C) détecte, il ne bloque pas. Versioning et MFA Delete (D) protègent contre la suppression, pas contre la lecture publique.

> 💡 **À retenir** — garde-fou technique + SCP qui interdit de le désactiver = le duo gagnant dans AWS Organizations. Une SCP limite les permissions maximales, elle n'en accorde jamais.

---

<a id="c13"></a>

### Corrigé — Question 13

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q13)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Commander des équipements AWS Snowball Edge Storage Optimized, y copier les données sur site, puis les renvoyer à AWS pour importation dans S3.</span>

**Pourquoi cette réponse ?**

À 400 Mbit/s réellement disponibles, 500 To demanderaient plus de 100 jours de transfert. AWS Snowball Edge permet de copier les données localement et de les expédier physiquement : plusieurs équipements en parallèle tiennent le délai de deux semaines sans consommer la bande passante de production.

**⚠️ Pourquoi pas les autres options ?**

Multipart et Transfer Acceleration (D) et DataSync (A) restent limités par le lien Internet. La mise en service d'une connexion Direct Connect dédiée (C) prend généralement plusieurs semaines et n'apporte pas assez de débit ici.

> 💡 **À retenir** — volume important + bande passante insuffisante ou délai court = AWS Snow Family. Transferts récurrents en ligne vers S3/EFS/FSx = AWS DataSync.

---

<a id="c14"></a>

### Corrigé — Question 14

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q14)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Externaliser l'état des sessions dans un cluster Amazon ElastiCache for Redis partagé par les instances.</span>

**Pourquoi cette réponse ?**

Rendre les instances sans état (stateless) en externalisant les sessions dans un magasin partagé à faible latence — ElastiCache for Redis ou une table DynamoDB — permet à n'importe quelle instance de servir n'importe quel utilisateur, y compris après un remplacement.

**⚠️ Pourquoi pas les autres options ?**

Les sticky sessions (D) fixent l'utilisateur à une instance : quand celle-ci disparaît, la session est perdue malgré tout. Le cooldown (A) et la protection contre la terminaison (C) retardent le problème sans le résoudre et nuisent à l'élasticité.

> 💡 **À retenir** — Auto Scaling exige des instances sans état. L'état de session va dans ElastiCache ou DynamoDB, jamais sur le disque local d'une instance.

---

<a id="c15"></a>

### Corrigé — Question 15

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q15)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : B et E</strong></span>

- <span style="color:#1a7f37">**B.** Héberger les fichiers statiques (images, vidéos, CSS, JavaScript) dans Amazon S3 et les servir via une distribution Amazon CloudFront.</span>
- <span style="color:#1a7f37">**E.** Configurer l'Application Load Balancer comme origine d'une distribution CloudFront afin de mettre en cache et d'accélérer le contenu dynamique au plus près des utilisateurs.</span>

**Pourquoi cette réponse ?**

Amazon CloudFront distribue le contenu depuis des points de présence proches des utilisateurs : les objets statiques servis depuis S3 sont mis en cache au bord, et le contenu dynamique passant par CloudFront profite des connexions persistantes et du réseau dorsal AWS jusqu'à l'origine, ce qui réduit sensiblement la latence même sans mise en cache.

**⚠️ Pourquoi pas les autres options ?**

Agrandir les instances (D) ou ajouter un réplica local (A) ne change rien à la distance réseau. Les sessions persistantes (C) n'ont aucun effet sur la latence géographique.

> 💡 **À retenir** — « utilisateurs mondiaux » + « HTTP/HTTPS » = CloudFront. Pour du TCP/UDP non-HTTP ou un basculement régional rapide sur IP fixes = AWS Global Accelerator.

---

<a id="c16"></a>

### Corrigé — Question 16

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q16)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Créer un instantané de chaque volume, copier l'instantané en activant le chiffrement avec une clé KMS, créer un volume à partir de la copie chiffrée et le rattacher à l'instance.</span>

**Pourquoi cette réponse ?**

Un volume EBS existant ne peut pas être chiffré sur place. La procédure prise en charge consiste à créer un instantané, à le copier en activant le chiffrement avec la clé KMS choisie, puis à créer un nouveau volume à partir de cette copie et à l'attacher à l'instance.

**⚠️ Pourquoi pas les autres options ?**

Les options A et B décrivent des fonctionnalités inexistantes : le chiffrement par défaut de la Région ne s'applique qu'aux nouveaux volumes. Passer par S3 (D) est inutilement complexe et risqué.

> 💡 **À retenir** — chiffrer un volume EBS existant = instantané → copie chiffrée → nouveau volume. Activer le chiffrement par défaut EBS pour que tous les futurs volumes soient chiffrés automatiquement.

---

<a id="c17"></a>

### Corrigé — Question 17

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q17)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : B et E</strong></span>

- <span style="color:#1a7f37">**B.** Souscrire un Compute Savings Plan de 1 ou 3 ans couvrant la consommation de base de la production.</span>
- <span style="color:#1a7f37">**E.** Exécuter les traitements par lots sur des instances Spot, avec reprise automatique des tâches interrompues.</span>

**Pourquoi cette réponse ?**

Le Compute Savings Plan offre jusqu'à 66 % de remise sur une consommation de base engagée, tout en restant flexible sur la famille d'instances, la taille, la Région et même le service (EC2, Fargate, Lambda). Les instances Spot offrent jusqu'à 90 % de remise et conviennent parfaitement aux traitements par lots interruptibles.

**⚠️ Pourquoi pas les autres options ?**

Réserver des instances pour du batch (C) revient à payer une capacité inutilisée le jour. Faire tourner la production en Spot (D) l'expose à des interruptions à deux minutes de préavis. Les Dedicated Hosts (A) sont le modèle le plus coûteux, réservé aux contraintes de licence ou de conformité.

> 💡 **À retenir** — charge stable = Savings Plans ou Reserved Instances ; charge tolérante aux interruptions = Spot ; charge imprévisible et courte = On-Demand ou serverless.

---

<a id="c18"></a>

### Corrigé — Question 18

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q18)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Déployer une base de données globale Amazon Aurora Global Database avec un cluster secondaire en lecture dans la seconde Région, promouvable en cas de sinistre, et une infrastructure applicative réduite prête à monter en charge.</span>

**Pourquoi cette réponse ?**

Aurora Global Database réplique les données vers une Région secondaire avec un décalage typique inférieur à la seconde (RPO < 1 min) et permet de promouvoir le cluster secondaire en moins d'une minute (RTO < 15 min avec l'infrastructure applicative prête). C'est le modèle warm standby appliqué à Aurora.

**⚠️ Pourquoi pas les autres options ?**

Les instantanés nocturnes (D) donnent un RPO de 24 heures. La restauration à un instant donné dans la Région principale (B) ne protège pas d'un sinistre régional. Un export toutes les six heures (A) viole largement le RPO.

> 💡 **À retenir** — RPO de quelques secondes entre Régions sur Aurora = Aurora Global Database. Sur DynamoDB, l'équivalent est la table globale (Global Tables).

---

<a id="c19"></a>

### Corrigé — Question 19

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q19)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Utiliser AWS Systems Manager Session Manager avec l'agent SSM et un rôle d'instance, sans aucune règle entrante dans les groupes de sécurité, et journaliser les sessions dans Amazon S3 ou CloudWatch Logs.</span>

**Pourquoi cette réponse ?**

Session Manager ouvre une session sortante depuis l'agent SSM vers le service : aucun port entrant, aucune adresse IP publique et aucun bastion ne sont nécessaires. L'accès est autorisé par IAM, tracé dans AWS CloudTrail, et le contenu des sessions peut être journalisé dans S3 ou CloudWatch Logs.

**⚠️ Pourquoi pas les autres options ?**

Restreindre les IP (C) conserve un bastion à maintenir et un port exposé. Une NAT gateway (D) ne permet pas les connexions entrantes. Client VPN (A) ne supprime pas l'ouverture du port 22.

> 💡 **À retenir** — accès administrateur sans bastion, sans port ouvert et auditable = AWS Systems Manager Session Manager (avec un point de terminaison VPC si le sous-réseau est totalement privé).

---

<a id="c20"></a>

### Corrigé — Question 20

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q20)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Déployer un cluster Amazon DynamoDB Accelerator (DAX) devant la table et faire pointer l'application sur le point de terminaison DAX.</span>

**Pourquoi cette réponse ?**

Amazon DAX est un cache en mémoire spécifique à DynamoDB, entièrement managé et compatible avec l'API DynamoDB : il ramène les lectures répétées de la milliseconde à la microseconde sans modification du code d'accès, et absorbe les éléments « chauds ».

**⚠️ Pourquoi pas les autres options ?**

Le mode à la demande (B) traite la variation de capacité, pas la latence. Un index secondaire global (C) n'accélère pas une lecture par clé primaire. DynamoDB Streams (D) impose de développer et d'exploiter son propre cache.

> 💡 **À retenir** — cache pour DynamoDB = DAX (compatible API, microseconde). Cache générique applicatif ou de base relationnelle = Amazon ElastiCache.

---

<a id="c21"></a>

### Corrigé — Question 21

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q21)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Configurer un contrôle d'accès à l'origine (Origin Access Control) autorisant seulement CloudFront à lire le compartiment, et distribuer des URL signées CloudFront à durée de validité limitée.</span>

**Pourquoi cette réponse ?**

L'Origin Access Control (OAC) permet de garder le compartiment entièrement privé : seule la distribution CloudFront est autorisée à lire les objets. Les URL signées CloudFront ajoutent une autorisation individuelle avec date d'expiration, adaptée à un contenu payant.

**⚠️ Pourquoi pas les autres options ?**

Un compartiment public (A) n'offre aucun contrôle. Le filtrage par adresse IP (C) est impraticable pour des abonnés mobiles. Le chiffrement (D) ne gère pas l'autorisation d'accès et une clé partagée serait un contresens de sécurité.

> 💡 **À retenir** — contenu privé derrière CloudFront = OAC sur l'origine S3 + URL signées (un fichier, un utilisateur) ou cookies signés (plusieurs fichiers, une session).

---

<a id="c22"></a>

### Corrigé — Question 22

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q22)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Une file Amazon SQS FIFO avec un identifiant de groupe de messages correspondant au compte client et la déduplication activée.</span>

**Pourquoi cette réponse ?**

Les files SQS FIFO garantissent l'ordre de traitement à l'intérieur d'un même `MessageGroupId` et la remise « exactement une fois » grâce à la déduplication. Utiliser le compte client comme identifiant de groupe préserve l'ordre par client tout en autorisant le traitement parallèle entre clients.

**⚠️ Pourquoi pas les autres options ?**

SNS standard (D) ne garantit pas l'ordre. Une file standard (A) offre une remise « au moins une fois » et un ordre non garanti : le tri applicatif ne corrige pas les doublons. Firehose (B) sert à la livraison de flux, pas au traitement transactionnel ordonné.

> 💡 **À retenir** — « ordre strict » + « exactement une fois » = SQS FIFO. Le débit se parallélise via plusieurs identifiants de groupe de messages.

---

<a id="c23"></a>

### Corrigé — Question 23

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q23)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Ingérer les mesures dans Amazon Kinesis Data Streams, avec plusieurs consommateurs indépendants et une rétention configurée à 24 heures ou plus.</span>

**Pourquoi cette réponse ?**

Kinesis Data Streams conserve les enregistrements (24 heures par défaut, jusqu'à 365 jours) et autorise plusieurs consommateurs indépendants à lire le même flux, chacun avec sa propre position. La relecture après incident est donc native.

**⚠️ Pourquoi pas les autres options ?**

SQS (A) supprime le message dès qu'un consommateur le traite : les trois applications ne peuvent pas lire les mêmes données. Un traitement horaire depuis S3 (D) n'est pas du quasi temps réel. SNS (B) ne conserve pas les messages pour relecture.

> 💡 **À retenir** — quasi temps réel + plusieurs consommateurs + relecture = Kinesis Data Streams. Livraison simple vers S3/Redshift/OpenSearch sans code = Amazon Data Firehose.

---

<a id="c24"></a>

### Corrigé — Question 24

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q24)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Utiliser la classe S3 Intelligent-Tiering, qui déplace automatiquement chaque objet entre les paliers d'accès selon son utilisation réelle.</span>

**Pourquoi cette réponse ?**

S3 Intelligent-Tiering surveille les accès objet par objet et bascule automatiquement entre les paliers d'accès fréquent, occasionnel et archive, sans frais de restitution ni impact sur la disponibilité. C'est la classe conçue pour les profils d'accès inconnus ou changeants.

**⚠️ Pourquoi pas les autres options ?**

Standard-IA (A) facture des frais de récupération sur les objets consultés quotidiennement. Une transition uniforme (C) pénalise les objets restés actifs. L'analyse manuelle (D) est coûteuse en effort humain.

> 💡 **À retenir** — profil d'accès imprévisible = S3 Intelligent-Tiering. Profil connu et régulier = règles de cycle de vie classiques (moins chères, car sans frais de surveillance par objet).

---

<a id="c25"></a>

### Corrigé — Question 25

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q25)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Associer AWS WAF à l'Application Load Balancer avec les groupes de règles managés (SQLi, XSS) et une règle de type rate-based.</span>

**Pourquoi cette réponse ?**

AWS WAF s'associe directement à un Application Load Balancer, à CloudFront ou à API Gateway. Les groupes de règles managés par AWS couvrent les injections SQL et le XSS, et les règles rate-based limitent le nombre de requêtes par adresse IP sur une fenêtre glissante.

**⚠️ Pourquoi pas les autres options ?**

Les NACL (A) filtrent au niveau IP/port et ne comprennent pas le contenu HTTP ; elles sont inutilisables face à des IP changeantes. Inspector (B) recherche des vulnérabilités, il ne bloque pas le trafic. Les journaux de flux (C) analysent après coup.

> 💡 **À retenir** — attaques applicatives de couche 7 (SQLi, XSS, bots) = AWS WAF. Attaques volumétriques DDoS de couche 3/4 = AWS Shield (Advanced pour la protection renforcée et la garantie financière).

---

<a id="c26"></a>

### Corrigé — Question 26

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q26)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : C et D</strong></span>

- <span style="color:#1a7f37">**C.** Activer AWS Backup Vault Lock en mode conformité sur les coffres de sauvegarde.</span>
- <span style="color:#1a7f37">**D.** Utiliser AWS Backup avec un plan de sauvegarde appliqué par étiquettes, incluant une règle de copie interrégionale vers un coffre de sauvegarde secondaire.</span>

**Pourquoi cette réponse ?**

AWS Backup centralise la sauvegarde de nombreux services (EBS, RDS, EFS, DynamoDB, FSx…) avec des plans fondés sur les étiquettes et une copie interrégionale intégrée. Vault Lock en mode conformité rend la rétention immuable : personne, pas même l'utilisateur racine, ne peut supprimer une sauvegarde avant son échéance.

**⚠️ Pourquoi pas les autres options ?**

Les scripts Lambda (A) reproduisent une fonctionnalité managée et créent de la dette opérationnelle. Exporter vers S3 (B) ne s'applique pas aux instantanés RDS/EBS de cette façon. La « réplication interrégionale de volumes EBS » (E) n'existe pas.

> 💡 **À retenir** — sauvegarde centralisée multi-services et multi-comptes = AWS Backup. Immuabilité des sauvegardes (protection contre les rançongiciels) = Vault Lock en mode conformité.

---

<a id="c27"></a>

### Corrigé — Question 27

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q27)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Un volume io2 Block Express avec IOPS provisionnées.</span>

**Pourquoi cette réponse ?**

Les volumes io2 (et io2 Block Express) sont conçus pour les charges transactionnelles exigeantes : IOPS provisionnées jusqu'à 256 000, latence submillisecondaire constante et durabilité de 99,999 %, supérieure aux autres familles.

**⚠️ Pourquoi pas les autres options ?**

Les volumes st1 (A) et sc1 (C) sont des disques magnétiques orientés débit séquentiel, inadaptés aux entrées/sorties aléatoires d'une base. Un gp2 de 1 To (B) plafonne à 3 000 IOPS de base, très en deçà du besoin.

> 💡 **À retenir** — IOPS élevées et latence constante = io1/io2 (Provisioned IOPS). Usage général = gp3 (3 000 IOPS et 125 Mo/s inclus, ajustables indépendamment de la taille).

---

<a id="c28"></a>

### Corrigé — Question 28

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q28)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Migrer la tâche vers une fonction AWS Lambda déclenchée par événement, avec 512 Mo de mémoire.</span>

**Pourquoi cette réponse ?**

400 exécutions de 20 secondes représentent environ 2,2 heures de calcul par jour. Avec Lambda, seule la durée réellement consommée est facturée, contre deux instances allumées 24 h/24 : la réduction dépasse largement 90 %, sans serveur à administrer.

**⚠️ Pourquoi pas les autres options ?**

Réserver les instances (C) baisse le prix unitaire mais paie toujours du temps d'inactivité. ECS sur EC2 en continu (A) conserve le même défaut. Des instances plus petites (D) restent allumées en permanence.

> 💡 **À retenir** — charge événementielle, courte et intermittente = AWS Lambda. Charge continue et prévisible = EC2 avec Savings Plans. Conteneurs sans gestion de serveurs = AWS Fargate.

---

<a id="c29"></a>

### Corrigé — Question 29

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q29)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : A et D</strong></span>

- <span style="color:#1a7f37">**A.** Activer Amazon Macie pour découvrir et classer les données sensibles dans Amazon S3.</span>
- <span style="color:#1a7f37">**D.** Activer Amazon GuardDuty dans tous les comptes de l'organisation.</span>

**Pourquoi cette réponse ?**

Amazon GuardDuty analyse en continu CloudTrail, les journaux DNS, les journaux de flux VPC et l'activité EKS/S3 pour détecter les comportements malveillants. Amazon Macie utilise l'apprentissage automatique pour découvrir et classer les données sensibles (données personnelles, identifiants) dans Amazon S3.

**⚠️ Pourquoi pas les autres options ?**

Trusted Advisor (E) formule des recommandations de bonnes pratiques, sans détection de menaces. Shield Advanced (B) protège des attaques DDoS. AWS Artifact (C) donne accès aux rapports de conformité AWS.

> 💡 **À retenir** — GuardDuty = détection de menaces ; Macie = découverte de données sensibles dans S3 ; Inspector = vulnérabilités des instances, conteneurs et fonctions ; Security Hub = agrégation et posture globale.

---

<a id="c30"></a>

### Corrigé — Question 30

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q30)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Étendre le groupe Auto Scaling à au moins deux zones de disponibilité supplémentaires, activer ces zones sur l'Application Load Balancer et définir une capacité minimale répartie.</span>

**Pourquoi cette réponse ?**

Une architecture ne devient tolérante aux pannes que si elle répartit ses ressources sur plusieurs zones de disponibilité. Le groupe Auto Scaling remplace alors la capacité perdue dans les zones restantes et l'Application Load Balancer cesse d'y envoyer du trafic.

**⚠️ Pourquoi pas les autres options ?**

Doubler les instances dans la même zone (D) laisse le même point de défaillance. La protection contre le scale-in (B) et les AMI quotidiennes (C) n'évitent pas l'indisponibilité.

> 💡 **À retenir** — « hautement disponible » implique toujours au moins deux zones de disponibilité. Une ressource unique dans une seule zone est toujours une mauvaise réponse à l'examen.

---

<a id="c31"></a>

### Corrigé — Question 31

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q31)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Amazon FSx for Lustre lié au compartiment S3, qui présente les objets sous forme de fichiers et restitue les résultats vers S3.</span>

**Pourquoi cette réponse ?**

Amazon FSx for Lustre est le système de fichiers parallèle conçu pour le HPC et l'apprentissage automatique : débit de centaines de Go/s, latence submillisecondaire, et intégration native avec S3 (les objets apparaissent comme des fichiers, les résultats sont exportés vers le compartiment).

**⚠️ Pourquoi pas les autres options ?**

EFS (B) n'atteint pas ce niveau de débit pour ce type de charge. EBS (A) n'est pas partagé entre tous les nœuds. Storage Gateway (C) est une solution hybride destinée aux sites sur site.

> 💡 **À retenir** — HPC, apprentissage automatique, traitement massif de données liées à S3 = Amazon FSx for Lustre.

---

<a id="c32"></a>

### Corrigé — Question 32

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q32)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Convertir les volumes gp2 en gp3 et appliquer les recommandations de redimensionnement d'AWS Compute Optimizer.</span>

**Pourquoi cette réponse ?**

Les volumes gp3 coûtent environ 20 % de moins que les gp2 à capacité égale et permettent de régler IOPS et débit indépendamment de la taille ; la conversion se fait sans interruption. AWS Compute Optimizer analyse les métriques réelles et recommande des types d'instances mieux dimensionnés.

**⚠️ Pourquoi pas les autres options ?**

Passer en io2 (C) augmenterait fortement la facture. Le Spot (B) ne convient pas à des charges de production non interruptibles. Supprimer instantanés et surveillance (A) dégrade la reprise et la visibilité pour un gain marginal.

> 💡 **À retenir** — deux gains de coût quasi systématiques : migrer gp2 → gp3, et redimensionner les instances sous-utilisées à partir des recommandations de Compute Optimizer ou de Trusted Advisor.

---

<a id="c33"></a>

### Corrigé — Question 33

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q33)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Configurer le groupe de sécurité de la base pour autoriser le port de la base uniquement depuis l'identifiant du groupe de sécurité des serveurs applicatifs.</span>

**Pourquoi cette réponse ?**

Un groupe de sécurité peut référencer un autre groupe de sécurité comme source. L'autorisation suit alors automatiquement les instances, quelles que soient leurs adresses IP, y compris lorsque l'Auto Scaling en crée ou en supprime.

**⚠️ Pourquoi pas les autres options ?**

Une NACL sur le CIDR du VPC (D) autoriserait aussi la couche web. Ouvrir 0.0.0.0/0 (C) viole le principe du moindre privilège. Regrouper les niveaux dans un même sous-réseau (B) supprime la segmentation réseau.

> 💡 **À retenir** — entre niveaux d'une application, référencer l'identifiant du groupe de sécurité source plutôt qu'une plage d'adresses IP. Les groupes de sécurité sont avec état ; les NACL sont sans état et s'appliquent au sous-réseau.

---

<a id="c34"></a>

### Corrigé — Question 34

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q34)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Un service AWS Step Functions déclenché par une règle planifiée Amazon EventBridge, avec des états de nouvelle tentative et de capture d'erreurs.</span>

**Pourquoi cette réponse ?**

AWS Step Functions orchestre des workflows en décrivant les états, les branchements, les nouvelles tentatives avec temporisation exponentielle et la gestion des erreurs, avec une visualisation graphique de chaque exécution. EventBridge fournit le déclenchement planifié.

**⚠️ Pourquoi pas les autres options ?**

Une Lambda monolithique (B) se heurte à la limite de 15 minutes et concentre toute la logique d'erreur dans le code. Un cron sur EC2 (A) impose d'administrer un serveur. Un chaînage par SQS (D) fonctionne mais n'offre ni visibilité ni gestion déclarative des erreurs.

> 💡 **À retenir** — orchestration d'étapes avec conditions, reprises et suivi visuel = AWS Step Functions. Réaction à un événement isolé = EventBridge + Lambda.

---

<a id="c35"></a>

### Corrigé — Question 35

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q35)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : A et C</strong></span>

- <span style="color:#1a7f37">**A.** Placer Amazon RDS Proxy entre les fonctions Lambda et la base afin de mutualiser et de réutiliser les connexions.</span>
- <span style="color:#1a7f37">**C.** Migrer la base vers Amazon Aurora Serverless v2, dont la capacité s'ajuste finement selon la charge réelle.</span>

**Pourquoi cette réponse ?**

RDS Proxy mutualise un pool de connexions partagé par toutes les invocations Lambda : la base n'ouvre plus des milliers de connexions et cesse de saturer. Aurora Serverless v2 adapte la capacité par incréments fins et en quelques secondes, ce qui correspond à une charge nulle la nuit et intense quelques heures par jour.

**⚠️ Pourquoi pas les autres options ?**

Augmenter la concurrence (B) aggraverait le problème. Ouvrir/fermer à chaque invocation (D) est précisément la cause de la saturation. Un NLB (E) ne gère pas le pooling de connexions applicatives.

> 💡 **À retenir** — Lambda + base relationnelle = RDS Proxy (épuisement des connexions). Charge très variable ou intermittente sur une base relationnelle = Aurora Serverless v2.

---

<a id="c36"></a>

### Corrigé — Question 36

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q36)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Appliquer des étiquettes de répartition des coûts activées par département sur les ressources, analyser les dépenses par étiquette dans AWS Cost Explorer et créer un budget AWS Budgets avec alerte pour chaque département.</span>

**Pourquoi cette réponse ?**

Les étiquettes de répartition des coûts, une fois activées dans les préférences de facturation, permettent de ventiler la facture par département dans Cost Explorer. AWS Budgets déclenche ensuite des alertes lorsqu'un seuil de dépense (réelle ou prévisionnelle) est atteint.

**⚠️ Pourquoi pas les autres options ?**

Créer des comptes séparés (A) est une bonne pratique de gouvernance mais représente un projet lourd par rapport au besoin exprimé. Trusted Advisor (C) ne ventile pas par département. CloudTrail (D) trace les appels d'API, pas les coûts.

> 💡 **À retenir** — ventilation des coûts = étiquettes de répartition des coûts activées + Cost Explorer ; alerte de dépassement = AWS Budgets ; analyse détaillée ligne à ligne = AWS Cost and Usage Report interrogé avec Athena.

---

<a id="c37"></a>

### Corrigé — Question 37

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q37)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Configurer AWS IAM Identity Center avec Active Directory comme source d'identité et attribuer des jeux d'autorisations aux comptes de l'organisation.</span>

**Pourquoi cette réponse ?**

AWS IAM Identity Center se connecte à Active Directory (via AWS Directory Service ou une fédération SAML) et attribue des jeux d'autorisations aux comptes d'AWS Organizations. Les employés se connectent avec leurs identifiants d'entreprise, et la désactivation du compte AD révoque immédiatement tous les accès AWS.

**⚠️ Pourquoi pas les autres options ?**

Un utilisateur IAM par employé (B) ne passe pas à l'échelle et duplique la gestion des identités. Les clés partagées (C) suppriment toute traçabilité. Une politique d'approbation ouverte (A) est une faille majeure.

> 💡 **À retenir** — identités d'entreprise existantes + plusieurs comptes AWS = AWS IAM Identity Center avec fédération. Les utilisateurs IAM ne doivent plus être créés pour des humains.

---

<a id="c38"></a>

### Corrigé — Question 38

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q38)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Configurer des tables globales DynamoDB (Global Tables) avec un réplica dans chacune des trois Régions.</span>

**Pourquoi cette réponse ?**

Les tables globales DynamoDB répliquent les données de façon active-active entre plusieurs Régions : chaque Région accepte lectures et écritures avec une latence locale, et le service reste disponible si une Région tombe.

**⚠️ Pourquoi pas les autres options ?**

DynamoDB ne propose pas de « réplicas en lecture » (D). CloudFront (B) ne réduit pas la latence d'écriture vers une table unique. Une restauration horaire (C) ne fournit ni latence locale ni disponibilité continue.

> 💡 **À retenir** — écriture multi-Région à faible latence sur DynamoDB = Global Tables. Sur Aurora, l'équivalent en lecture est Aurora Global Database.

---

<a id="c39"></a>

### Corrigé — Question 39

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q39)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Interroger directement les fichiers avec Amazon Athena, en s'appuyant sur un catalogue AWS Glue, et convertir les données au format Parquet avec partitionnement.</span>

**Pourquoi cette réponse ?**

Amazon Athena interroge directement les fichiers présents dans S3, sans infrastructure à provisionner, et facture uniquement les données analysées. Convertir les journaux en Parquet et les partitionner réduit fortement le volume scanné, donc le coût et la durée des requêtes.

**⚠️ Pourquoi pas les autres options ?**

Redshift (B) et EMR (A) supposent un cluster permanent, coûteux pour quelques requêtes par semaine. RDS (C) n'est pas conçu pour analyser des téraoctets de fichiers journaux.

> 💡 **À retenir** — SQL ponctuel sur des données dans S3 = Athena (+ AWS Glue Data Catalog). Réduire le coût d'Athena = format colonnaire (Parquet/ORC), compression et partitionnement.

---

<a id="c40"></a>

### Corrigé — Question 40

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q40)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : D et E</strong></span>

- <span style="color:#1a7f37">**D.** Activer AWS Config dans chaque compte et Région, avec agrégation des données de configuration dans un compte d'audit.</span>
- <span style="color:#1a7f37">**E.** Créer un journal d'organisation AWS CloudTrail qui capture les événements de tous les comptes vers un compartiment S3 centralisé, avec la validation de l'intégrité des fichiers journaux activée.</span>

**Pourquoi cette réponse ?**

Un journal d'organisation CloudTrail capture les événements de tous les comptes, y compris ceux créés ensuite, vers un compartiment centralisé ; la validation d'intégrité produit des fichiers de résumé signés qui prouvent l'absence d'altération. AWS Config enregistre l'historique de configuration des ressources et permet de l'agréger dans un compte d'audit.

**⚠️ Pourquoi pas les autres options ?**

Les journaux de l'ALB (C), CloudWatch Logs Insights (A) et les journaux de flux VPC (B) apportent des informations utiles mais ne couvrent ni l'historique des appels d'API ni celui des configurations.

> 💡 **À retenir** — « qui a fait quoi » = AWS CloudTrail ; « à quoi ressemblait la ressource et qu'a-t-elle changé » = AWS Config. Pour l'inaltérabilité : validation d'intégrité CloudTrail + S3 Object Lock sur le compartiment.

---

<a id="c41"></a>

### Corrigé — Question 41

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q41)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Chiffrement SSE-KMS avec une clé gérée par le client dans AWS KMS, rotation automatique activée et politique de clé restrictive.</span>

**Pourquoi cette réponse ?**

Une clé gérée par le client (CMK) dans AWS KMS permet de définir une politique de clé précise, d'activer la rotation automatique annuelle du matériel cryptographique et de retrouver chaque appel `Decrypt` ou `GenerateDataKey` dans AWS CloudTrail.

**⚠️ Pourquoi pas les autres options ?**

SSE-S3 (D) ne donne aucun contrôle sur la politique ni de traçabilité par clé. SSE-C (B) impose de gérer et transmettre la clé à chaque requête. Une clé dans un fichier (C) est une mauvaise pratique de gestion de secrets.

> 💡 **À retenir** — exigence de contrôle de la politique de clé, de rotation et d'audit = SSE-KMS avec clé gérée par le client. SSE-S3 suffit quand seul le chiffrement au repos est demandé.

---

<a id="c42"></a>

### Corrigé — Question 42

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q42)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Configurer dans Amazon Route 53 un routage de basculement (failover) actif-passif avec des health checks sur les deux points de terminaison.</span>

**Pourquoi cette réponse ?**

Le routage de basculement de Route 53 associe un enregistrement principal et un enregistrement secondaire à des health checks. Si le point de terminaison principal est déclaré défaillant, Route 53 répond avec l'adresse du secondaire : le nom de domaine ne change pas et la bascule est automatique.

**⚠️ Pourquoi pas les autres options ?**

Le routage pondéré (A) envoie du trafic vers la Région secondaire en permanence. Un CNAME modifié à la main (C) impose une intervention humaine. Un Application Load Balancer (B) ne s'étend pas sur plusieurs Régions.

> 💡 **À retenir** — bascule automatique entre Régions au niveau DNS = Route 53 failover + health checks. Attention au TTL des enregistrements, qui conditionne la vitesse de bascule.

---

<a id="c43"></a>

### Corrigé — Question 43

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q43)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Créer un accélérateur AWS Global Accelerator avec les deux Network Load Balancers comme points de terminaison et des adresses IP statiques Anycast.</span>

**Pourquoi cette réponse ?**

AWS Global Accelerator fournit deux adresses IP statiques Anycast, achemine le trafic sur le réseau dorsal AWS depuis le point de présence le plus proche et bascule vers une autre Région en quelques secondes grâce à ses contrôles de santé. Il prend en charge TCP et UDP.

**⚠️ Pourquoi pas les autres options ?**

CloudFront (D) traite le trafic HTTP/HTTPS, pas l'UDP d'un jeu temps réel. Le routage par géolocalisation (C) dépend du DNS et de son TTL, donc bascule lentement. Direct Connect (B) est une liaison privée d'entreprise.

> 💡 **À retenir** — trafic non HTTP (TCP/UDP), adresses IP fixes et basculement régional rapide = AWS Global Accelerator. Contenu web mis en cache = CloudFront.

---

<a id="c44"></a>

### Corrigé — Question 44

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q44)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Servir les fichiers via une distribution Amazon CloudFront, dont le tarif de transfert sortant est inférieur à celui d'EC2 et qui sert les téléchargements répétés depuis son cache.</span>

**Pourquoi cette réponse ?**

CloudFront applique des tarifs de transfert sortant inférieurs à ceux d'EC2 ou de S3, ne facture pas le transfert entre l'origine AWS et les points de présence, et sert la majorité des téléchargements depuis son cache, ce qui réduit également la charge d'origine.

**⚠️ Pourquoi pas les autres options ?**

Plus d'instances (A) augmente le coût. Transfer Acceleration (D) optimise les téléversements et coûte plus cher. Glacier Instant Retrieval (C) réduit le coût de stockage, pas celui du transfert sortant, qui domine ici.

> 💡 **À retenir** — la sortie Internet est l'un des principaux postes de coût réseau ; la première réponse pour la réduire est CloudFront. Réduire le trafic interne : points de terminaison VPC et éviter les échanges entre zones de disponibilité.

---

<a id="c45"></a>

### Corrigé — Question 45

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q45)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Créer des points de terminaison VPC de type Interface (AWS PrivateLink) pour Secrets Manager et CloudWatch Logs dans les sous-réseaux privés.</span>

**Pourquoi cette réponse ?**

Les points de terminaison de type Interface (AWS PrivateLink) créent une interface réseau dans le sous-réseau privé, avec une adresse IP privée résolue par DNS privé : les appels aux API AWS restent sur le réseau AWS, sans passerelle Internet ni NAT.

**⚠️ Pourquoi pas les autres options ?**

Les points de terminaison de type Gateway (A) n'existent que pour S3 et DynamoDB. Une NAT instance (D) implique un accès Internet, contraire à l'exigence. L'appairage de VPC (B) ne s'applique pas aux services AWS publics.

> 💡 **À retenir** — S3 et DynamoDB = Gateway Endpoint (gratuit) ; tous les autres services AWS = Interface Endpoint via PrivateLink (facturé à l'heure et au Go), avec un groupe de sécurité à associer.

---

<a id="c46"></a>

### Corrigé — Question 46

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q46)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : B et C</strong></span>

- <span style="color:#1a7f37">**B.** Porter le délai d'invisibilité (visibility timeout) de la file au-delà de la durée maximale de traitement, ou l'étendre pendant le traitement.</span>
- <span style="color:#1a7f37">**C.** Configurer une file de lettres mortes avec une valeur `maxReceiveCount` adaptée pour retirer les messages en échec répété.</span>

**Pourquoi cette réponse ?**

Un message redevient visible et est redistribué si le délai d'invisibilité expire avant la fin du traitement : c'est la cause des doublons. Il faut donc l'aligner sur la durée réelle de traitement (ou appeler `ChangeMessageVisibility` pendant le traitement). La file de lettres mortes, associée à un `maxReceiveCount`, retire du circuit les messages qui échouent systématiquement.

**⚠️ Pourquoi pas les autres options ?**

Réduire le délai (E) aggraverait les doublons. FIFO (A) ne corrige pas un délai d'invisibilité trop court. Le sondage court (D) augmente les appels à vide et le coût.

> 💡 **À retenir** — doublons SQS = délai d'invisibilité trop court par rapport à la durée de traitement. Messages « empoisonnés » qui bouclent = file de lettres mortes.

---

<a id="c47"></a>

### Corrigé — Question 47

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q47)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : B et C</strong></span>

- <span style="color:#1a7f37">**B.** Activer la mise en cache des réponses au niveau de l'étape (stage) d'API Gateway pour les méthodes GET.</span>
- <span style="color:#1a7f37">**C.** Introduire un cluster Amazon ElastiCache pour Redis afin de mémoriser les résultats des requêtes coûteuses.</span>

**Pourquoi cette réponse ?**

Le cache d'API Gateway renvoie les réponses des GET répétés sans invoquer Lambda ni la base, avec un TTL configurable. ElastiCache pour Redis stocke les résultats des calculs coûteux et supprime la majorité des allers-retours vers RDS.

**⚠️ Pourquoi pas les autres options ?**

Allonger le délai d'expiration (E) ne réduit ni la charge ni la latence. Les journaux détaillés (A) ajoutent du coût sans gain de performance. Le WebSocket (D) ne répond pas au besoin de mise en cache de lectures.

> 💡 **À retenir** — lectures répétées identiques = mise en cache au plus près de l'appelant (CloudFront, cache API Gateway) puis en base (ElastiCache, DAX).

---

<a id="c48"></a>

### Corrigé — Question 48

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q48)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Le mode de capacité à la demande (on-demand), facturé à la requête.</span>

**Pourquoi cette réponse ?**

Le mode à la demande facture chaque lecture et chaque écriture, sans capacité à prévoir : il absorbe instantanément un passage de zéro à des dizaines de milliers de requêtes par seconde et ne coûte rien lorsque la table n'est pas sollicitée.

**⚠️ Pourquoi pas les autres options ?**

Une capacité provisionnée élevée (B) fait payer l'inactivité. L'Auto Scaling provisionné (D) réagit en quelques minutes, ce qui provoque des limitations (throttling) lors d'un pic soudain. La capacité réservée (A) suppose une consommation régulière connue.

> 💡 **À retenir** — trafic imprévisible ou nouveau service = DynamoDB à la demande. Trafic régulier et connu = mode provisionné avec Auto Scaling (jusqu'à 7 fois moins cher).

---

<a id="c49"></a>

### Corrigé — Question 49

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q49)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Activer S3 Object Lock en mode conformité (compliance) avec une période de rétention de cinq ans.</span>

**Pourquoi cette réponse ?**

En mode conformité, S3 Object Lock interdit toute suppression ou modification d'une version d'objet jusqu'à l'expiration de la rétention, et la rétention ne peut être ni raccourcie ni levée — même par l'utilisateur racine du compte.

**⚠️ Pourquoi pas les autres options ?**

En mode gouvernance (D), un principal disposant de la permission `s3:BypassGovernanceRetention` peut contourner le verrou. Une politique de compartiment (C) peut être modifiée par un administrateur. Glacier Deep Archive (B) est une classe de stockage, pas un mécanisme WORM.

> 💡 **À retenir** — WORM strict et opposable à un auditeur = Object Lock en mode conformité. Mode gouvernance = protection contre les erreurs, avec dérogation possible.

---

<a id="c50"></a>

### Corrigé — Question 50

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q50)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Un service Amazon ECS avec le type de lancement AWS Fargate, réparti sur plusieurs zones de disponibilité derrière un Application Load Balancer, avec Service Auto Scaling.</span>

**Pourquoi cette réponse ?**

AWS Fargate exécute les conteneurs sans instances EC2 à provisionner ni à patcher. Un service ECS réparti sur plusieurs sous-réseaux de zones différentes, enregistré auprès d'un Application Load Balancer et piloté par Service Auto Scaling, survit à la perte d'une zone et suit la charge.

**⚠️ Pourquoi pas les autres options ?**

Un cluster mono-zone (D) reste vulnérable. Des conteneurs lancés par données utilisateur (A) n'offrent ni ordonnancement ni reprise. Un EKS autogéré (B) fonctionne mais impose la gestion du plan de données.

> 💡 **À retenir** — conteneurs + « moins d'effort opérationnel » = Fargate. Besoin de contrôle fin de l'hôte, de GPU ou de licences = ECS/EKS sur EC2.

---

<a id="c51"></a>

### Corrigé — Question 51

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q51)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Amazon Redshift, entrepôt de données colonnaire massivement parallèle.</span>

**Pourquoi cette réponse ?**

Amazon Redshift est un entrepôt de données colonnaire à traitement massivement parallèle, conçu pour les requêtes analytiques complexes sur des pétaoctets et pour de nombreux utilisateurs simultanés d'outils de BI.

**⚠️ Pourquoi pas les autres options ?**

RDS (C) est un moteur transactionnel qui s'effondre sur ce volume analytique. DynamoDB (D) ne réalise pas d'agrégations ni de jointures complexes. Neptune (B) est une base de graphes.

> 💡 **À retenir** — OLTP = RDS/Aurora ; OLAP sur pétaoctets avec BI = Redshift ; requêtes ponctuelles sur des fichiers S3 = Athena.

---

<a id="c52"></a>

### Corrigé — Question 52

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q52)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Activer une politique de cycle de vie EFS qui bascule les fichiers non consultés depuis 30 jours vers la classe Infrequent Access.</span>

**Pourquoi cette réponse ?**

La gestion du cycle de vie EFS bascule automatiquement les fichiers non consultés depuis un délai configurable vers la classe Infrequent Access, jusqu'à 92 % moins chère, tout en les gardant immédiatement accessibles (des frais d'accès s'appliquent lors des lectures).

**⚠️ Pourquoi pas les autres options ?**

EFS One Zone (D) réduit le coût mais diminue la résilience pour l'ensemble des données. Archiver dans Glacier (A) supprime l'accès immédiat. Supprimer des fichiers (C) ne correspond pas à l'exigence de conservation.

> 💡 **À retenir** — EFS a ses propres paliers (Standard, Infrequent Access, Archive) pilotés par cycle de vie, exactement comme S3 : penser « tiering » sur tous les stockages, pas seulement sur S3.

---

<a id="c53"></a>

### Corrigé — Question 53

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q53)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : C et E</strong></span>

- <span style="color:#1a7f37">**C.** Attacher une SCP refusant explicitement les actions `cloudtrail:StopLogging` et `cloudtrail:DeleteTrail`.</span>
- <span style="color:#1a7f37">**E.** Attacher aux unités organisationnelles une politique de contrôle des services (SCP) refusant les appels d'API en dehors des Régions autorisées.</span>

**Pourquoi cette réponse ?**

Une SCP définit le plafond de permissions applicable à tous les principaux des comptes concernés, y compris à leurs administrateurs. Un refus sur les Régions non autorisées et un refus des actions d'arrêt ou de suppression de trail CloudTrail rendent ces règles réellement contraignantes.

**⚠️ Pourquoi pas les autres options ?**

Des politiques IAM (B) peuvent être modifiées par un administrateur local. AWS Config (D) et Trusted Advisor (A) détectent après coup mais n'empêchent rien.

> 💡 **À retenir** — empêcher une action, même pour un administrateur de compte = SCP dans AWS Organizations. Détecter et corriger a posteriori = AWS Config (avec remédiation automatique).

---

<a id="c54"></a>

### Corrigé — Question 54

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q54)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Effectuer une restauration à un instant donné (point-in-time recovery) vers une nouvelle instance, à un horodatage juste antérieur à 14 h 12, puis rediriger l'application.</span>

**Pourquoi cette réponse ?**

Les sauvegardes automatiques d'Amazon RDS conservent des journaux de transactions qui permettent une restauration à un instant donné avec une granularité de l'ordre de la seconde, dans la limite de la fenêtre de rétention. La restauration crée une nouvelle instance, ce qui préserve l'original le temps des vérifications.

**⚠️ Pourquoi pas les autres options ?**

Un instantané manuel (C) est plus ancien et perd davantage de données. Promouvoir un réplica (B) conserve la corruption, déjà répliquée. Rejouer les journaux binaires à la main (D) est risqué et non pris en charge de cette façon sur RDS.

> 💡 **À retenir** — « revenir juste avant l'incident » = restauration à un instant donné (PITR). Elle crée toujours une nouvelle instance, il faut donc rediriger l'application.

---

<a id="c55"></a>

### Corrigé — Question 55

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q55)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Activer S3 Transfer Acceleration sur le compartiment et faire pointer les clients sur le point de terminaison accéléré, en combinant avec des téléversements multipart.</span>

**Pourquoi cette réponse ?**

S3 Transfer Acceleration fait entrer le trafic par le point de présence CloudFront le plus proche de l'expéditeur, puis emprunte le réseau dorsal AWS jusqu'au compartiment. Combiné aux téléversements multipart, il accélère fortement les envois longue distance et rend les reprises sur erreur plus efficaces. Seul le point de terminaison change côté client.

**⚠️ Pourquoi pas les autres options ?**

Des compartiments régionaux (C) complexifient l'architecture. CloudFront (D) accélère la distribution, pas les téléversements vers un compartiment sans configuration spécifique. La compression (B) ne traite pas la cause.

> 💡 **À retenir** — téléversements longue distance vers un compartiment unique = S3 Transfer Acceleration + multipart. Fichiers > 100 Mo : toujours privilégier le multipart.

---

<a id="c56"></a>

### Corrigé — Question 56

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q56)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : B et D</strong></span>

- <span style="color:#1a7f37">**B.** Une règle qui abandonne et supprime les téléversements multipart incomplets après 7 jours.</span>
- <span style="color:#1a7f37">**D.** Une règle qui expire les versions non actuelles des objets après un nombre de jours défini.</span>

**Pourquoi cette réponse ?**

Les parties de téléversements multipart interrompus restent stockées et facturées bien qu'invisibles dans la liste des objets : une règle d'abandon les élimine. Avec le versioning, chaque écrasement conserve l'ancienne version, également facturée : une règle d'expiration des versions non actuelles borne cette accumulation.

**⚠️ Pourquoi pas les autres options ?**

Désactiver le versioning (E) supprime une protection et ne supprime pas les versions existantes. One Zone-IA immédiat (A) dégrade la durabilité et facture des frais de récupération. La réplication (C) augmenterait le coût.

> 💡 **À retenir** — deux causes classiques d'écart entre volume utile et volume facturé dans S3 : les versions non actuelles et les téléversements multipart incomplets. Prévoir les deux règles de cycle de vie dès la création du compartiment.

---

<a id="c57"></a>

### Corrigé — Question 57

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q57)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Demander un certificat public dans AWS Certificate Manager, l'associer à l'écouteur HTTPS de l'Application Load Balancer et valider le domaine par DNS pour bénéficier du renouvellement automatique.</span>

**Pourquoi cette réponse ?**

AWS Certificate Manager délivre gratuitement des certificats publics utilisables sur l'Application Load Balancer, CloudFront et API Gateway. Avec une validation DNS et l'enregistrement CNAME laissé en place, ACM renouvelle et déploie le certificat automatiquement.

**⚠️ Pourquoi pas les autres options ?**

Un certificat tiers installé à la main (B) impose un renouvellement manuel sur chaque instance. Un certificat auto-signé (C) déclenche des avertissements dans les navigateurs. CloudHSM (A) sert à gérer des clés cryptographiques, pas à émettre des certificats publics de confiance.

> 💡 **À retenir** — TLS public sur un service AWS intégré = ACM (gratuit, renouvellement automatique avec validation DNS). Le certificat doit se trouver dans us-east-1 pour CloudFront.

---

<a id="c58"></a>

### Corrigé — Question 58

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q58)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : A et D</strong></span>

- <span style="color:#1a7f37">**A.** Déplacer les fichiers de travail vers un système de fichiers Amazon EFS accessible depuis toutes les zones de disponibilité.</span>
- <span style="color:#1a7f37">**D.** Placer l'instance dans un groupe Auto Scaling de capacité minimale et maximale égale à 1, couvrant plusieurs zones de disponibilité, afin qu'une instance saine soit relancée automatiquement.</span>

**Pourquoi cette réponse ?**

Un groupe Auto Scaling dimensionné à une seule instance mais couvrant plusieurs zones relance automatiquement l'application dans une zone saine en cas de panne, sans aucune modification du code. Déplacer les fichiers de travail vers EFS évite que les données ne disparaissent avec l'instance et les rend accessibles depuis la nouvelle zone.

**⚠️ Pourquoi pas les autres options ?**

Une seconde instance active (B) est impossible puisque l'application ne supporte qu'une seule exécution. La protection contre la terminaison (C) n'aide pas lors d'une panne matérielle. Un dimensionnement plus généreux (E) ne traite pas la disponibilité.

> 💡 **À retenir** — application héritée non modifiable = ASG min=max=1 sur plusieurs zones (auto-réparation) + stockage partagé durable (EFS) pour les données locales.

---

<a id="c59"></a>

### Corrigé — Question 59

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q59)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Une famille optimisée pour la mémoire (par exemple R7g ou X2idn).</span>

**Pourquoi cette réponse ?**

Les familles optimisées pour la mémoire (R, X, z1d) offrent le meilleur rapport mémoire/vCPU et vont jusqu'à plusieurs téraoctets de RAM : c'est la famille adaptée aux bases en mémoire, aux caches et à l'analyse de grands jeux de données chargés en RAM.

**⚠️ Pourquoi pas les autres options ?**

Les familles de calcul (C) privilégient le processeur. Les familles de stockage (D) offrent des disques NVMe locaux rapides mais pas la RAM nécessaire. Un volume io2 (B) n'augmente pas la mémoire disponible.

> 💡 **À retenir** — C = calcul intensif ; R/X = mémoire ; I/D = stockage local ; M = usage général ; P/G = GPU. Identifier la ressource saturée avant de choisir la famille.

---

<a id="c60"></a>

### Corrigé — Question 60

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q60)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Utiliser un groupe d'utilisateurs Amazon Cognito pour l'inscription, la connexion fédérée et le MFA, puis autoriser les appels à l'API avec les jetons émis.</span>

**Pourquoi cette réponse ?**

Les groupes d'utilisateurs Amazon Cognito fournissent un service d'identité managé pour les applications : inscription, connexion, fédération avec des fournisseurs sociaux ou SAML, MFA, et émission de jetons JWT qu'API Gateway ou l'application peuvent valider.

**⚠️ Pourquoi pas les autres options ?**

Les utilisateurs IAM (B) sont destinés à l'accès aux ressources AWS, pas aux utilisateurs finaux d'une application, et sont soumis à des quotas. Un service maison (C) représente un coût de développement et un risque de sécurité importants. Directory Service (A) cible les identités d'entreprise.

> 💡 **À retenir** — identités des utilisateurs finaux d'une application = Amazon Cognito (User Pool pour l'authentification, Identity Pool pour obtenir des identifiants AWS temporaires). Identités des collaborateurs = IAM Identity Center.

---

<a id="c61"></a>

### Corrigé — Question 61

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q61)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Attacher un rôle IAM aux instances via un profil d'instance et supprimer les clés d'accès du fichier de configuration ; le SDK récupère alors des identifiants temporaires automatiquement.</span>

**Pourquoi cette réponse ?**

Un rôle IAM attaché via un profil d'instance fournit aux SDK des identifiants temporaires renouvelés automatiquement par le service de métadonnées. Aucune clé statique n'existe plus dans l'AMI ni sur le disque, et les permissions se modifient sans redéployer.

**⚠️ Pourquoi pas les autres options ?**

Chiffrer le fichier (D) laisse une clé secrète à distribuer. Faire tourner les clés (B) conserve le principe des identifiants de longue durée. Secrets Manager (A) est adapté aux secrets tiers, mais reste inutile pour les identifiants AWS d'une instance EC2.

> 💡 **À retenir** — aucune clé d'accès IAM sur une instance EC2, un conteneur ou une fonction Lambda : toujours un rôle IAM. C'est un réflexe systématique à l'examen.

---

<a id="c62"></a>

### Corrigé — Question 62

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q62)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Créer un groupe d'origines CloudFront associant le compartiment principal et un compartiment secondaire répliqué dans une autre Région, avec basculement sur codes d'erreur.</span>

**Pourquoi cette réponse ?**

Un groupe d'origines CloudFront définit une origine principale et une origine de secours ; CloudFront bascule automatiquement sur la seconde lorsqu'il reçoit certains codes d'erreur ou en cas de délai dépassé. Associé à la réplication interrégionale S3, il assure la continuité de service.

**⚠️ Pourquoi pas les autres options ?**

Un TTL plus long (A) ne couvre que les objets déjà en cache et pour une durée limitée. Une seconde distribution (D) implique de changer de nom de domaine. Le versioning (C) protège des suppressions, pas d'une indisponibilité régionale.

> 💡 **À retenir** — haute disponibilité de l'origine derrière CloudFront = groupe d'origines avec basculement (origin failover), alimenté par une réplication S3 ou une seconde infrastructure.

---

<a id="c63"></a>

### Corrigé — Question 63

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q63)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Déployer AWS Storage Gateway en mode File Gateway sur site : les fichiers sont stockés comme objets dans S3, avec un cache local des données consultées récemment.</span>

**Pourquoi cette réponse ?**

File Gateway expose un partage NFS ou SMB sur site, stocke les fichiers en tant qu'objets S3 et conserve en cache local les données récemment consultées : les applications sur site continuent d'utiliser leur protocole habituel avec une latence faible sur les données actives.

**⚠️ Pourquoi pas les autres options ?**

Un client FUSE (C) offre des performances et une fiabilité insuffisantes en production. EFS exposé sur Internet (B) est à proscrire. Snowball (D) réalise un transfert ponctuel mais laisse les applications sans accès aux fichiers.

> 💡 **À retenir** — accès hybride aux données dans le cloud avec protocole de fichiers et cache local = AWS Storage Gateway (File Gateway pour NFS/SMB, Volume Gateway pour iSCSI, Tape Gateway pour la sauvegarde sur bande virtuelle).

---

<a id="c64"></a>

### Corrigé — Question 64

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q64)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Activer l'option Requester Pays sur le compartiment, afin que le demandeur authentifié assume les frais de requête et de transfert.</span>

**Pourquoi cette réponse ?**

Avec Requester Pays, le demandeur — qui doit être authentifié auprès d'AWS et inclure l'en-tête approprié — supporte les frais de requête et de transfert des données téléchargées ; le propriétaire ne paie plus que le stockage.

**⚠️ Pourquoi pas les autres options ?**

Glacier (B) réduit le coût de stockage mais pas celui du transfert sortant. Une refacturation manuelle (C) est un travail administratif sans fin. Dupliquer les données par compte (A) multiplie les coûts de stockage.

> 💡 **À retenir** — partage de gros jeux de données publics à des consommateurs disposant d'un compte AWS = compartiment Requester Pays. Les demandes anonymes y sont impossibles.

---

<a id="c65"></a>

### Corrigé — Question 65

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q65)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Établir une connexion AWS Site-to-Site VPN au-dessus de la liaison Direct Connect (VPN over Direct Connect) afin de chiffrer le trafic avec IPsec.</span>

**Pourquoi cette réponse ?**

Une connexion Direct Connect est privée mais non chiffrée. Établir un tunnel IPsec Site-to-Site VPN au-dessus de la liaison — sur une interface virtuelle publique ou via une passerelle Direct Connect — apporte le chiffrement du trafic en transit tout en conservant le chemin dédié.

**⚠️ Pourquoi pas les autres options ?**

Le chiffrement EBS (C) porte sur les données au repos. L'appairage de VPC (A) ne concerne pas la connectivité avec un centre de données. Les journaux de flux (D) observent sans protéger.

> 💡 **À retenir** — Direct Connect = privé, prévisible, non chiffré par défaut. Exigence de chiffrement en transit = VPN IPsec au-dessus de Direct Connect (ou MACsec sur les ports compatibles).

---

<a id="c66"></a>

### Corrigé — Question 66

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q66)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Publier les événements sur un bus Amazon EventBridge et définir des règles de filtrage par motif d'événement, chacune pointant vers ses cibles.</span>

**Pourquoi cette réponse ?**

Amazon EventBridge est un bus d'événements avec filtrage déclaratif : chaque règle sélectionne des événements par motif et les envoie vers plus de vingt types de cibles, y compris des partenaires SaaS. Les producteurs publient sans connaître les consommateurs, et les règles évoluent indépendamment.

**⚠️ Pourquoi pas les autres options ?**

Un aiguilleur Lambda (D) est du code à maintenir. Une rubrique SNS par type (A) oblige à modifier les producteurs à chaque évolution. Un traitement horaire via S3 (B) n'est pas événementiel.

> 💡 **À retenir** — routage d'événements avec filtrage et cibles multiples = EventBridge. Diffusion simple à plusieurs abonnés = SNS. Tampon durable pour un consommateur = SQS.

---

<a id="c67"></a>

### Corrigé — Question 67

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q67)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Amazon Data Firehose avec conversion de format en Parquet et partitionnement dynamique vers Amazon S3.</span>

**Pourquoi cette réponse ?**

Amazon Data Firehose est entièrement managé : il met en tampon le flux, convertit les enregistrements en Parquet grâce au catalogue AWS Glue, applique un partitionnement dynamique et écrit dans S3, sans consommateur à développer ni à dimensionner.

**⚠️ Pourquoi pas les autres options ?**

Kinesis Data Streams (A) exige d'écrire et d'exploiter l'application consommatrice. SQS et Lambda (C) produiraient du JSON et beaucoup de code. DataSync (D) synchronise des fichiers existants, il n'ingère pas un flux.

> 💡 **À retenir** — flux → S3/Redshift/OpenSearch sans code, avec conversion et compression = Amazon Data Firehose. Traitement personnalisé, ordre et relecture = Kinesis Data Streams.

---

<a id="c68"></a>

### Corrigé — Question 68

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q68)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Exécuter les tâches sur Fargate Spot, avec relance automatique des tâches interrompues.</span>

**Pourquoi cette réponse ?**

Fargate Spot applique une remise pouvant atteindre 70 % sur la capacité inutilisée, avec un préavis d'interruption de deux minutes. Des tâches de rendu relançables sont le cas d'usage idéal.

**⚠️ Pourquoi pas les autres options ?**

Des instances plus grandes (C) augmentent le coût. Les Reserved Instances (B) ne s'appliquent pas à Fargate et supposent une consommation continue. Sous-dimensionner la mémoire (A) provoque des échecs de tâches.

> 💡 **À retenir** — tolérant aux interruptions = Spot, y compris sur les conteneurs (Fargate Spot, capacity providers ECS). Combiner Fargate Spot et Fargate à la demande dans une même stratégie de capacité est une bonne pratique.

---

<a id="c69"></a>

### Corrigé — Question 69

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q69)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Générer une URL présignée S3 valable quelques heures, autorisant uniquement l'opération de dépôt sur la clé attendue.</span>

**Pourquoi cette réponse ?**

Une URL présignée transporte les droits temporaires du signataire pour une opération précise (`PUT` sur une clé donnée) et une durée définie. Le partenaire n'a besoin ni de compte AWS ni d'identifiants, et le compartiment reste privé.

**⚠️ Pourquoi pas les autres options ?**

Un utilisateur IAM (B) crée des identifiants permanents à gérer. Un compartiment public en écriture (A) est une faille majeure. Une politique d'approbation ouverte à tous (D) équivaut à donner l'accès à n'importe qui.

> 💡 **À retenir** — accès temporaire et ciblé à un objet S3 pour un tiers sans compte AWS = URL présignée (durée maximale de 7 jours avec des identifiants de rôle : 36 heures).

---

<a id="c70"></a>

### Corrigé — Question 70

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q70)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Créer un groupe de réplication Redis multi-AZ avec réplicas et basculement automatique activé.</span>

**Pourquoi cette réponse ?**

Un groupe de réplication ElastiCache for Redis multi-AZ maintient un ou plusieurs réplicas dans d'autres zones de disponibilité et promeut automatiquement un réplica en cas de défaillance du nœud principal, généralement en moins d'une minute, sans changement de point de terminaison.

**⚠️ Pourquoi pas les autres options ?**

Un nœud plus grand (D) reste un point de défaillance unique. Memcached (B) ne propose ni réplication ni basculement automatique. Des instantanés horaires (A) donnent un RPO d'une heure et une restauration lente.

> 💡 **À retenir** — Redis = réplication, basculement automatique multi-AZ, persistance, structures de données riches. Memcached = cache simple, multithread, sans réplication.

---

<a id="c71"></a>

### Corrigé — Question 71

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q71)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Lancer un cluster Amazon EMR transitoire qui exécute les tâches Spark puis se termine automatiquement, en lisant et écrivant dans Amazon S3.</span>

**Pourquoi cette réponse ?**

Amazon EMR exécute nativement les tâches Spark existantes. Un cluster transitoire démarre, lit les données dans S3, écrit ses résultats et se termine automatiquement : l'entreprise ne paie que la durée du traitement, sans réécrire le code.

**⚠️ Pourquoi pas les autres options ?**

Lambda (C) est limité à 15 minutes et ne convient pas à un traitement Spark de 40 To. Un cluster permanent (D) facture les heures d'inactivité. RDS (A) n'est pas adapté à ce volume ni à ce type de traitement.

> 💡 **À retenir** — Spark, Hive ou Hadoop existants sur AWS = Amazon EMR, de préférence en cluster transitoire avec les données dans S3 (séparation du calcul et du stockage).

---

<a id="c72"></a>

### Corrigé — Question 72

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q72)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Définir une rétention de 14 jours sur les groupes de journaux et exporter en continu les journaux vers Amazon S3, avec transition vers une classe d'archive par règle de cycle de vie.</span>

**Pourquoi cette réponse ?**

CloudWatch Logs facture l'ingestion et le stockage ; une rétention illimitée est rarement justifiée. Fixer 14 jours dans CloudWatch et déverser les journaux vers S3 (puis vers Glacier via une règle de cycle de vie) réduit fortement le coût tout en conservant l'historique pour d'éventuelles enquêtes.

**⚠️ Pourquoi pas les autres options ?**

Supprimer les journaux (C) fait perdre l'historique. Réduire la verbosité (A) dégrade l'exploitabilité. OpenSearch (D) coûterait bien plus cher.

> 💡 **À retenir** — définir une rétention explicite sur chaque groupe de journaux CloudWatch — la valeur par défaut « Never expire » est un piège de coût classique. L'archivage long terme se fait dans S3.

---

<a id="c73"></a>

### Corrigé — Question 73

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q73)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : B et C</strong></span>

- <span style="color:#1a7f37">**B.** Activer MFA Delete sur le compartiment pour exiger une authentification multifacteur lors de la suppression définitive d'une version.</span>
- <span style="color:#1a7f37">**C.** Activer le versioning sur le compartiment afin de conserver les versions antérieures des objets.</span>

**Pourquoi cette réponse ?**

Le versioning conserve chaque version antérieure : une suppression crée un marqueur et l'objet reste récupérable. MFA Delete exige un code d'authentification multifacteur de l'utilisateur racine pour supprimer définitivement une version ou désactiver le versioning, ce qui bloque une suppression malveillante.

**⚠️ Pourquoi pas les autres options ?**

Le chiffrement (A) protège la confidentialité, pas la disponibilité. Les journaux d'accès (E) tracent sans empêcher. Une règle d'expiration (D) supprimerait des données.

> 💡 **À retenir** — protection contre la suppression dans S3 = versioning (+ MFA Delete). Protection réglementaire contre toute modification = Object Lock. Ne pas confondre les deux mécanismes.

---

<a id="c74"></a>

### Corrigé — Question 74

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q74)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Configurer le groupe Auto Scaling pour utiliser les contrôles de santé de l'Elastic Load Balancing (type de health check « ELB ») et définir une période de grâce adaptée au démarrage de l'application.</span>

**Pourquoi cette réponse ?**

Par défaut, un groupe Auto Scaling n'utilise que les contrôles de santé EC2, qui ne détectent que les défaillances de l'instance. En activant le type de contrôle ELB, le groupe se fie au health check applicatif du groupe cible : une instance déclarée non saine est remplacée. La période de grâce évite les remplacements pendant le démarrage.

**⚠️ Pourquoi pas les autres options ?**

Le cooldown (B), la surveillance détaillée (A) et une capacité minimale plus élevée (C) ne détectent pas une application plantée.

> 💡 **À retenir** — Auto Scaling + Load Balancer = toujours passer les contrôles de santé du groupe en type « ELB », sinon les pannes applicatives passent inaperçues.

---

<a id="c75"></a>

### Corrigé — Question 75

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q75)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Le routage basé sur la latence, avec un enregistrement par Région.</span>

**Pourquoi cette réponse ?**

Le routage basé sur la latence dirige chaque requête vers la Région offrant le meilleur temps d'aller-retour mesuré depuis le résolveur de l'utilisateur, indépendamment de la géographie administrative.

**⚠️ Pourquoi pas les autres options ?**

La géolocalisation (C) route selon le pays d'origine, ce qui n'est pas toujours la Région la plus rapide. Le routage pondéré (B) répartit arbitrairement. Le routage multivaleur (D) sert à distribuer plusieurs enregistrements sains, pas à optimiser la latence.

> 💡 **À retenir** — « meilleur temps de réponse » = routage par latence ; « conformité, contenu ou langue selon le pays » = routage par géolocalisation ; « pourcentage de trafic » = routage pondéré (déploiement progressif).

---

<a id="c76"></a>

### Corrigé — Question 76

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q76)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : A et E</strong></span>

- <span style="color:#1a7f37">**A.** Utiliser les recommandations d'optimisation d'AWS Trusted Advisor et d'AWS Compute Optimizer pour repérer les ressources inactives ou surdimensionnées.</span>
- <span style="color:#1a7f37">**E.** Mettre en place AWS Budgets avec alertes et des rapports Cost Explorer réguliers par étiquette et par équipe, afin de suivre les dérives.</span>

**Pourquoi cette réponse ?**

Trusted Advisor et Compute Optimizer identifient les ressources inactives, orphelines ou surdimensionnées à partir des métriques réelles. AWS Budgets et Cost Explorer, exploités par étiquette et par équipe, installent une boucle de suivi qui empêche la dérive de revenir.

**⚠️ Pourquoi pas les autres options ?**

Le Spot en production (C) introduit des interruptions non maîtrisées. Désactiver CloudTrail (D) supprime la traçabilité pour un gain dérisoire. Réserver des environnements temporaires (B) engage des dépenses sur des ressources vouées à disparaître.

> 💡 **À retenir** — l'optimisation des coûts est un cycle : mesurer (Cost Explorer, étiquettes), identifier (Trusted Advisor, Compute Optimizer), agir (arrêt, redimensionnement, modèle d'achat), contrôler (Budgets).

---

<a id="c77"></a>

### Corrigé — Question 77

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q77)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Ajouter une règle de refus (deny) pour cette plage dans la liste de contrôle d'accès réseau (NACL) associée au sous-réseau.</span>

**Pourquoi cette réponse ?**

Les listes de contrôle d'accès réseau s'appliquent au niveau du sous-réseau et acceptent des règles de refus explicites : c'est le seul mécanisme natif du VPC permettant de bloquer une plage d'adresses IP pour toutes les instances du sous-réseau.

**⚠️ Pourquoi pas les autres options ?**

Un groupe de sécurité (A) n'accepte que des règles d'autorisation : il ne sait pas refuser. Supprimer la route par défaut (B) couperait tout le trafic. Un point de terminaison VPC (C) ne filtre pas le trafic entrant depuis Internet.

> 💡 **À retenir** — groupe de sécurité = avec état, autorisations uniquement, au niveau de l'interface réseau. NACL = sans état, autorisations et refus, au niveau du sous-réseau. « Bloquer une IP » = NACL (ou AWS Network Firewall / WAF selon la couche).

---

<a id="c78"></a>

### Corrigé — Question 78

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q78)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : C et E</strong></span>

- <span style="color:#1a7f37">**C.** Copier automatiquement les instantanés chiffrés de la base vers la Région secondaire et y maintenir un réplica en lecture prêt à être promu.</span>
- <span style="color:#1a7f37">**E.** Conserver dans la Région secondaire les AMI et les modèles AWS CloudFormation permettant de déployer rapidement la couche applicative, sans instances en fonctionnement.</span>

**Pourquoi cette réponse ?**

La stratégie pilot light maintient allumé le strict minimum : la donnée est répliquée en continu (réplica en lecture promouvable et copies d'instantanés chiffrés dans la Région secondaire), tandis que la couche applicative existe seulement sous forme d'AMI et de modèles CloudFormation, déployables en une à deux heures.

**⚠️ Pourquoi pas les autres options ?**

Une pile complète en fonctionnement (A) correspond à du warm standby ou de l'actif-actif, plus coûteux que le budget autorisé. Une sauvegarde sur bande (D) ne tient pas le RPO. CloudFront (B) n'apporte rien pour la reprise après sinistre.

> 💡 **À retenir** — ordre croissant de coût et décroissant de RTO : Backup & Restore → Pilot Light → Warm Standby → Multi-site actif-actif. Le pilot light garde les données chaudes et le calcul froid.

---

<a id="c79"></a>

### Corrigé — Question 79

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q79)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : A et E</strong></span>

- <span style="color:#1a7f37">**A.** Augmenter la mémoire allouée à la fonction, ce qui augmente proportionnellement la puissance processeur attribuée.</span>
- <span style="color:#1a7f37">**E.** Activer la concurrence provisionnée (provisioned concurrency) pour maintenir des environnements d'exécution initialisés.</span>

**Pourquoi cette réponse ?**

Dans Lambda, la puissance processeur est proportionnelle à la mémoire allouée : augmenter la mémoire accélère un traitement limité par le CPU et réduit souvent le coût total, la durée diminuant davantage que le prix par milliseconde n'augmente. La concurrence provisionnée maintient des environnements initialisés et supprime les démarrages à froid sur le chemin synchrone.

**⚠️ Pourquoi pas les autres options ?**

Réduire la mémoire (D) aggraverait la latence. Un délai d'expiration plus long (C) ne rend rien plus rapide. Un VPC sans point de terminaison (B) ajouterait de la latence et des échecs d'accès.

> 💡 **À retenir** — dans Lambda, mémoire = processeur. Latence de démarrage à froid sur une API synchrone = concurrence provisionnée (ou SnapStart selon le runtime).

---

<a id="c80"></a>

### Corrigé — Question 80

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q80)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Amazon Inspector, avec analyse continue des instances EC2 et des images ECR.</span>

**Pourquoi cette réponse ?**

Amazon Inspector analyse en continu et automatiquement les instances EC2, les images de conteneurs dans Amazon ECR et les fonctions Lambda, en recherchant les vulnérabilités logicielles connues et les chemins d'accès réseau non intentionnels.

**⚠️ Pourquoi pas les autres options ?**

AWS Config (A) évalue la conformité des configurations, pas les CVE. GuardDuty (C) détecte des comportements malveillants. Security Hub (B) agrège les résultats d'autres services, dont Inspector, mais ne réalise pas l'analyse.

> 💡 **À retenir** — Inspector = vulnérabilités (CVE) et exposition réseau ; GuardDuty = menaces actives ; Macie = données sensibles ; Config = conformité de configuration ; Security Hub = tableau de bord consolidé.

---

<a id="c81"></a>

### Corrigé — Question 81

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q81)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Créer un instantané de l'instance, en réaliser une copie chiffrée avec une clé AWS KMS, restaurer une nouvelle instance à partir de cette copie et basculer l'application.</span>

**Pourquoi cette réponse ?**

Le chiffrement d'une instance Amazon RDS ne peut pas être activé après coup sur une base existante. La procédure prise en charge consiste à prendre un instantané, à le copier en activant le chiffrement avec une clé KMS, puis à restaurer une nouvelle instance depuis cette copie chiffrée.

**⚠️ Pourquoi pas les autres options ?**

Le chiffrement à la volée (C) n'existe pas. Un réplica en lecture (D) hérite du chiffrement de la source : il ne peut pas être chiffré si la source ne l'est pas. Chiffrer un compartiment (B) ne chiffre pas la base.

> 💡 **À retenir** — RDS comme EBS : on chiffre par instantané → copie chiffrée → restauration. Toujours activer le chiffrement dès la création pour éviter cette manipulation.

---

<a id="c82"></a>

### Corrigé — Question 82

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q82)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Faire pointer l'application sur le point de terminaison de cluster (writer endpoint) pour les écritures et sur le point de terminaison de lecteur (reader endpoint) pour les lectures.</span>

**Pourquoi cette réponse ?**

Aurora expose des points de terminaison gérés : le cluster endpoint pointe toujours vers l'instance d'écriture courante et suit automatiquement les basculements (généralement en moins de 30 secondes), tandis que le reader endpoint répartit les connexions de lecture entre les réplicas.

**⚠️ Pourquoi pas les autres options ?**

Une adresse IP figée (B) casse au premier basculement. Un Network Load Balancer (A) ignore quel nœud est en écriture. Un routage pondéré Route 53 (D) enverrait des écritures vers des réplicas en lecture.

> 💡 **À retenir** — avec Aurora, toujours utiliser les points de terminaison de cluster et de lecteur, jamais l'adresse d'une instance. Des points de terminaison personnalisés permettent d'isoler certaines charges.

---

<a id="c83"></a>

### Corrigé — Question 83

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q83)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Le stockage d'instance NVMe local (instance store) d'un type d'instance adapté, utilisé comme espace de travail éphémère.</span>

**Pourquoi cette réponse ?**

Le stockage d'instance NVMe local offre les IOPS et le débit les plus élevés, sans coût supplémentaire au-delà de celui de l'instance. Son caractère éphémère (les données disparaissent à l'arrêt de l'instance) est sans conséquence pour des fichiers temporaires régénérables.

**⚠️ Pourquoi pas les autres options ?**

Un io2 à 64 000 IOPS (B) est nettement plus coûteux pour des données jetables. EFS (A) ajoute une latence réseau. S3 (C) n'est pas un système de fichiers de travail à faible latence.

> 💡 **À retenir** — données temporaires, caches, espaces de travail (scratch) = instance store. Données à conserver = EBS ou S3. Le stockage d'instance est perdu à l'arrêt ou en cas de défaillance matérielle.

---

<a id="c84"></a>

### Corrigé — Question 84

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q84)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Placer les instances de traitement et leur réplica de lecture dans la même zone de disponibilité, en conservant plusieurs zones pour la couche réellement critique.</span>

**Pourquoi cette réponse ?**

Le trafic entre zones de disponibilité est facturé dans les deux sens. Rapprocher les consommateurs très bavards de leur source de données — par exemple en dédiant un réplica de lecture par zone et en y dirigeant les instances locales — supprime l'essentiel de ces frais, tout en conservant la répartition multi-zone là où la disponibilité l'exige.

**⚠️ Pourquoi pas les autres options ?**

Le chiffrement (B) n'a aucun effet sur le coût. Passer par une NAT gateway (A) ajoute des frais de traitement. Ajouter une Région (D) augmenterait le coût et la complexité.

> 💡 **À retenir** — trois postes de coût réseau à surveiller : sortie Internet (→ CloudFront), trafic entre zones de disponibilité (→ localité des données), et traitement NAT (→ points de terminaison VPC).

---

<a id="c85"></a>

### Corrigé — Question 85

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q85)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Déployer AWS Network Firewall dans le VPC avec des règles de filtrage par nom de domaine et journalisation des flux autorisés et bloqués.</span>

**Pourquoi cette réponse ?**

AWS Network Firewall est un pare-feu managé et évolutif déployé dans le VPC : il applique des règles avec état, y compris des listes d'autorisation de noms de domaine pour le trafic sortant, et journalise les flux autorisés et bloqués. Le contrôle est centralisé et peut être piloté par AWS Firewall Manager.

**⚠️ Pourquoi pas les autres options ?**

Les groupes de sécurité (B) et les NACL (C) filtrent par adresse IP, ce qui est inexploitable pour des domaines dont les adresses changent. Les points de terminaison VPC (A) ne couvrent que les services AWS.

> 💡 **À retenir** — filtrage sortant par nom de domaine et inspection avec état à l'échelle du VPC = AWS Network Firewall. Filtrage HTTP applicatif = AWS WAF. Filtrage de base par IP/port = groupes de sécurité et NACL.

---

<a id="c86"></a>

### Corrigé — Question 86

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q86)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Déployer Amazon MQ pour Apache ActiveMQ en mode actif/veille réparti sur deux zones de disponibilité.</span>

**Pourquoi cette réponse ?**

Amazon MQ propose des courtiers ActiveMQ et RabbitMQ managés, compatibles avec les protocoles standards (JMS, AMQP, MQTT, STOMP). En mode actif/veille sur deux zones, il offre la haute disponibilité sans changer une ligne du code de messagerie.

**⚠️ Pourquoi pas les autres options ?**

SQS (B) et SNS (A) sont des services propriétaires nécessitant une réécriture. Un courtier autogéré sur EC2 (D) reproduit toute la charge d'exploitation que la migration devait supprimer.

> 💡 **À retenir** — migration « lift and shift » d'une application utilisant un courtier standard = Amazon MQ. Nouvelle application cloud native = SQS/SNS/EventBridge.

---

<a id="c87"></a>

### Corrigé — Question 87

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q87)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Configurer Aurora Auto Scaling pour les réplicas en lecture, avec une cible d'utilisation, et faire pointer les lectures sur le point de terminaison de lecteur.</span>

**Pourquoi cette réponse ?**

Aurora Auto Scaling ajoute et retire des réplicas en lecture selon une métrique cible (utilisation processeur ou nombre de connexions). Les réplicas rejoignent automatiquement le point de terminaison de lecteur, ce qui rend l'ajustement transparent pour l'application.

**⚠️ Pourquoi pas les autres options ?**

Six réplicas permanents (A) font payer une capacité inutilisée la majeure partie du temps. Agrandir l'instance d'écriture (B) ne répartit pas les lectures. Le Multi-AZ (D) traite la disponibilité, pas la charge de lecture.

> 💡 **À retenir** — charge de lecture variable sur Aurora = Aurora Auto Scaling des réplicas + reader endpoint. Un cluster Aurora accepte jusqu'à 15 réplicas.

---

<a id="c88"></a>

### Corrigé — Question 88

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q88)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** S3 One Zone-IA, adaptée à des données reproductibles et peu consultées.</span>

**Pourquoi cette réponse ?**

S3 One Zone-IA coûte environ 20 % de moins que Standard-IA et convient précisément aux données reproductibles et peu consultées : en cas de perte de la zone de disponibilité, les vignettes sont régénérées depuis les originaux.

**⚠️ Pourquoi pas les autres options ?**

S3 Standard (C) est trop cher pour un accès mensuel. Glacier Deep Archive (D) imposerait des heures de restitution à chaque affichage. La réplication interrégionale (B) doublerait le coût.

> 💡 **À retenir** — données reproductibles et rarement consultées = S3 One Zone-IA. Ne jamais y placer l'unique copie de données irremplaçables.

---

<a id="c89"></a>

### Corrigé — Question 89

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q89)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : A et D</strong></span>

- <span style="color:#1a7f37">**A.** Associer une ACL web AWS WAF avec des règles rate-based et des groupes de règles managés aux ressources exposées.</span>
- <span style="color:#1a7f37">**D.** Souscrire à AWS Shield Advanced et l'associer aux ressources protégées (distribution CloudFront, Application Load Balancer, adresses Elastic IP).</span>

**Pourquoi cette réponse ?**

AWS Shield Advanced apporte la détection et l'atténuation renforcées des attaques de couche 3/4, l'accès à l'équipe de réponse aux incidents (SRT) et la protection financière contre la hausse de facturation provoquée par une attaque. AWS WAF traite les attaques de couche 7 et limite les débits par adresse IP ; il est inclus sans coût de règles supplémentaire pour les ressources protégées par Shield Advanced.

**⚠️ Pourquoi pas les autres options ?**

Un NLB (C) ne protège pas des attaques applicatives. Désactiver CloudFront (E) augmenterait l'exposition, CloudFront absorbant nativement une partie des attaques. Les NACL (B) ne passent pas à l'échelle d'une attaque distribuée.

> 💡 **À retenir** — DDoS volumétrique = Shield (Standard inclus, Advanced pour la réponse assistée et la protection des coûts) ; attaques applicatives = WAF ; les deux se combinent au bord du réseau avec CloudFront.

---

<a id="c90"></a>

### Corrigé — Question 90

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q90)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** La restauration à un instant donné (point-in-time recovery) de DynamoDB, si elle a été activée sur la table, vers une nouvelle table.</span>

**Pourquoi cette réponse ?**

La restauration à un instant donné de DynamoDB permet de revenir à n'importe quelle seconde des 35 derniers jours, à condition que la fonctionnalité ait été activée. La restauration crée une nouvelle table, ce qui préserve les données en place le temps de la vérification.

**⚠️ Pourquoi pas les autres options ?**

Rejouer un flux à l'envers (A) n'est pas une fonctionnalité de DynamoDB Streams. Une sauvegarde de la semaine précédente (B) perd sept jours de données. Une table globale (D) réplique aussi l'écrasement.

> 💡 **À retenir** — activer PITR sur toute table DynamoDB de production : c'est la seule protection contre une erreur applicative, et la réplication (Global Tables) propage les erreurs au lieu de les corriger.

---

<a id="c91"></a>

### Corrigé — Question 91

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q91)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Amazon OpenSearch Service, alimenté en continu par Amazon Data Firehose, avec des tableaux de bord OpenSearch.</span>

**Pourquoi cette réponse ?**

Amazon OpenSearch Service est conçu pour l'indexation et la recherche plein texte à grande échelle, avec des tableaux de bord interactifs et des alertes. Amazon Data Firehose l'alimente en continu sans code.

**⚠️ Pourquoi pas les autres options ?**

Redshift (C) vise l'analytique structurée, pas la recherche plein texte interactive. Athena une fois par jour (D) ne répond ni au temps réel ni à l'interactivité. RDS (A) ne passe pas à l'échelle sur des téraoctets de journaux.

> 💡 **À retenir** — recherche plein texte, tableaux de bord d'exploitation et alertes sur des journaux = OpenSearch Service. Requêtes SQL ponctuelles et économiques sur archives = Athena.

---

<a id="c92"></a>

### Corrigé — Question 92

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q92)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Migrer les instances EC2 et les instances RDS compatibles vers des types basés sur AWS Graviton, après validation des applications.</span>

**Pourquoi cette réponse ?**

Les instances basées sur AWS Graviton offrent jusqu'à 40 % de rapport prix/performance supplémentaire par rapport aux équivalents x86 pour de nombreuses charges, dont Java et Go qui se recompilent facilement. Amazon RDS et Aurora proposent également des classes Graviton, activables par simple modification d'instance.

**⚠️ Pourquoi pas les autres options ?**

Une génération plus ancienne (B) coûte plus cher à performance égale. La surveillance détaillée (D) est une dépense supplémentaire. Doubler la taille (C) ne change pas le prix par unité de performance.

> 💡 **À retenir** — optimisation de coût sans changement d'architecture : passer aux dernières générations et à Graviton, migrer gp2 vers gp3, et supprimer ce qui est inutilisé.

---

<a id="c93"></a>

### Corrigé — Question 93

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q93)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Partager l'instantané avec le compte Sauvegarde et autoriser ce compte dans la politique de la clé KMS, puis lui accorder les permissions IAM d'utilisation de la clé.</span>

**Pourquoi cette réponse ?**

Le partage d'un instantané chiffré exige deux autorisations complémentaires : le partage de l'instantané lui-même avec le compte cible, et l'autorisation d'utiliser la clé KMS — accordée dans la politique de la clé, puis relayée par une politique IAM dans le compte destinataire.

**⚠️ Pourquoi pas les autres options ?**

Le partage seul (B) échoue au déchiffrement. Une clé KMS ne se copie pas d'un compte à l'autre (C). Déchiffrer avant partage (A) contredit l'exigence de sécurité.

> 💡 **À retenir** — ressource chiffrée partagée entre comptes = partager la ressource **et** donner accès à la clé KMS. Un instantané chiffré avec la clé AWS gérée par défaut ne peut pas être partagé.

---

<a id="c94"></a>

### Corrigé — Question 94

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q94)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Déployer AWS Transit Gateway comme point central de routage, y attacher les VPC et les passerelles Direct Connect, et partager la passerelle entre comptes avec AWS RAM.</span>

**Pourquoi cette réponse ?**

AWS Transit Gateway agit comme un routeur régional : chaque VPC et chaque passerelle Direct Connect ne s'attache qu'une fois, et les tables de routage du Transit Gateway contrôlent la segmentation. AWS RAM permet de partager la passerelle avec les autres comptes de l'organisation.

**⚠️ Pourquoi pas les autres options ?**

Un maillage d'appairages (C) croît de façon quadratique et ne gère pas le routage transitif. Un routeur logiciel (B) devient un goulet d'étranglement et un point de défaillance. Fusionner les VPC (D) est un chantier majeur qui supprime l'isolation.

> 💡 **À retenir** — au-delà de quelques VPC, ou dès qu'il faut du routage transitif avec le réseau sur site, la réponse est AWS Transit Gateway. L'appairage de VPC n'est pas transitif.

---

<a id="c95"></a>

### Corrigé — Question 95

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q95)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** La clé de partition a une cardinalité trop faible et crée des partitions « chaudes » ; il faut choisir une clé de partition à forte cardinalité ou ajouter un suffixe de répartition.</span>

**Pourquoi cette réponse ?**

DynamoDB répartit la capacité entre les partitions à partir de la clé de partition. Une clé de faible cardinalité, ou dont quelques valeurs concentrent le trafic, sature une partition alors que la table dispose globalement de capacité : ce sont des partitions chaudes. Une clé à forte cardinalité, ou l'ajout d'un suffixe de répartition (write sharding), rétablit la distribution.

**⚠️ Pourquoi pas les autres options ?**

Les index secondaires (B) ne corrigent pas la distribution des écritures. La cohérence (A) n'est pas en cause. Migrer vers RDS (D) ne traite pas le problème de conception.

> 💡 **À retenir** — limitations DynamoDB malgré une capacité suffisante = clé de partition mal choisie. Concevoir la clé en fonction des motifs d'accès, avec la plus forte cardinalité possible.

---

<a id="c96"></a>

### Corrigé — Question 96

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q96)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : C et E</strong></span>

- <span style="color:#1a7f37">**C.** Supprimer les réplicas en lecture inutilisés et désactiver le Multi-AZ sur la base de développement.</span>
- <span style="color:#1a7f37">**E.** Souscrire des instances réservées RDS pour l'instance de production, dont la charge est stable et durable.</span>

**Pourquoi cette réponse ?**

Une charge de production stable depuis deux ans est le cas idéal des instances réservées RDS (jusqu'à 69 % de remise sur 3 ans). Supprimer des réplicas quasi inutilisés et retirer le Multi-AZ d'un environnement de développement — qui n'exige pas de continuité de service — élimine des dépenses sans effet sur la production.

**⚠️ Pourquoi pas les autres options ?**

Supprimer les sauvegardes (B) détruit la capacité de reprise. Migrer vers DynamoDB (A) est un projet de refonte, pas une optimisation. Passer la production en Single-AZ (D) sacrifie la disponibilité du service critique.

> 💡 **À retenir** — l'optimisation de coût ne doit jamais dégrader une exigence de production. Le Multi-AZ se justifie en production, rarement en développement.

---

<a id="c97"></a>

### Corrigé — Question 97

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q97)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Exiger que les rôles créés par les développeurs se voient attacher une limite de permissions (permissions boundary) définie par l'équipe sécurité, et conditionner leur droit de création à l'usage de cette limite.</span>

**Pourquoi cette réponse ?**

Une limite de permissions définit le plafond des droits effectifs d'une identité IAM. En conditionnant le droit `iam:CreateRole` à l'attachement d'une limite imposée (condition `iam:PermissionsBoundary`), l'équipe sécurité garantit qu'aucun rôle créé ne dépassera ce plafond : l'escalade de privilèges devient impossible.

**⚠️ Pourquoi pas les autres options ?**

Interdire IAM (C) bloque l'autonomie recherchée. Distribuer des clés (D) est une mauvaise pratique. Une SCP permissive (A) n'encadre rien.

> 💡 **À retenir** — déléguer la création de rôles sans risque d'escalade de privilèges = permissions boundary imposée par condition. Les droits effectifs sont l'intersection de la politique d'identité et de la limite.

---

<a id="c98"></a>

### Corrigé — Question 98

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q98)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : A et C</strong></span>

- <span style="color:#1a7f37">**A.** Demander une augmentation des quotas concernés via AWS Service Quotas et surveiller leur consommation avec CloudWatch.</span>
- <span style="color:#1a7f37">**C.** Implémenter des nouvelles tentatives avec temporisation exponentielle et jitter, ainsi qu'un mécanisme de disjoncteur côté client.</span>

**Pourquoi cette réponse ?**

La temporisation exponentielle avec jitter étale les nouvelles tentatives et évite l'effet de troupeau ; un disjoncteur arrête d'appeler une dépendance en échec le temps qu'elle se rétablisse. En parallèle, Service Quotas permet de demander l'augmentation des limites réellement atteintes et de suivre leur consommation dans CloudWatch.

**⚠️ Pourquoi pas les autres options ?**

Les relances immédiates en boucle (E) sont exactement ce qui provoque l'effondrement. Supprimer les journaux (B) aveugle l'exploitation. Une instance plus grande (D) ne change rien à une limitation côté service.

> 💡 **À retenir** — les quotas de service font partie de la conception résiliente : les connaître, les surveiller, les faire augmenter à l'avance (notamment pour un environnement de secours) et gérer les erreurs 429 avec backoff et jitter.

---

<a id="c99"></a>

### Corrigé — Question 99

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q99)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : C et E</strong></span>

- <span style="color:#1a7f37">**C.** Créer un index secondaire global sur `customerId` avec une clé de tri sur la date de commande.</span>
- <span style="color:#1a7f37">**E.** Créer un index secondaire global sur `statut` avec une clé de tri sur la date, en projetant uniquement les attributs nécessaires.</span>

**Pourquoi cette réponse ?**

Un index secondaire global permet d'interroger la table selon une autre clé de partition, ici `customerId` et `statut`, avec une clé de tri sur la date pour les requêtes par période. Projeter uniquement les attributs utiles réduit le coût de stockage et de lecture de l'index.

**⚠️ Pourquoi pas les autres options ?**

Les opérations `Scan` (B) lisent toute la table et coûtent de plus en plus cher. Une table dupliquée nocturne (A) introduit un décalage et de la complexité. La cohérence forte (D) n'est pas prise en charge sur les index secondaires globaux et n'améliore pas la performance.

> 💡 **À retenir** — dans DynamoDB, on ne « filtre » pas, on conçoit des index en fonction des requêtes : GSI pour une autre clé de partition, LSI (à la création uniquement) pour une autre clé de tri. `Scan` en production est presque toujours une mauvaise réponse.

---

<a id="c100"></a>

### Corrigé — Question 100

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q100)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Partager les sous-réseaux du VPC avec les comptes applicatifs à l'aide d'AWS Resource Access Manager (VPC partagé).</span>

**Pourquoi cette réponse ?**

Le VPC partagé (VPC sharing) via AWS Resource Access Manager permet à un compte propriétaire de partager des sous-réseaux avec d'autres comptes de la même organisation : ceux-ci y déploient leurs ressources tout en conservant leur isolation IAM, sans appairage ni duplication d'adressage.

**⚠️ Pourquoi pas les autres options ?**

Un VPC par compte avec appairages (D) reproduit la complexité à éviter. Donner un rôle d'administration (A) casse la séparation des responsabilités. Dupliquer les CIDR (B) empêcherait toute interconnexion ultérieure.

> 💡 **À retenir** — AWS RAM partage des ressources entre comptes (sous-réseaux, Transit Gateway, règles Route 53 Resolver, portefeuilles Service Catalog) sans réplication ni accès croisé aux comptes.

---

<a id="c101"></a>

### Corrigé — Question 101

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q101)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Ajouter à la politique du compartiment une instruction `Deny` sur toutes les actions S3 lorsque la condition `aws:SecureTransport` vaut `false`.</span>

**Pourquoi cette réponse ?**

Une instruction `Deny` conditionnée par `aws:SecureTransport: false` dans la politique du compartiment rejette toute requête arrivant en HTTP, quel que soit l'appelant. C'est le mécanisme recommandé pour imposer le chiffrement en transit sur S3.

**⚠️ Pourquoi pas les autres options ?**

Le chiffrement par défaut (B) protège les données au repos. Block Public Access (D) empêche l'exposition publique mais autorise toujours le HTTP pour un principal authentifié. CloudFront (C) ne protège pas l'accès direct au compartiment.

> 💡 **À retenir** — chiffrement en transit sur S3 = condition `aws:SecureTransport` dans la politique de compartiment. Chiffrement au repos = SSE-S3, SSE-KMS ou DSSE-KMS.

---

<a id="c102"></a>

### Corrigé — Question 102

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q102)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Configurer une action de mise à l'échelle planifiée (scheduled scaling) sur le groupe Auto Scaling pour augmenter la capacité avant 8 h.</span>

**Pourquoi cette réponse ?**

La mise à l'échelle planifiée ajoute de la capacité à une heure connue, avant l'arrivée du trafic. Elle traite exactement le décalage inhérent aux politiques réactives, qui doivent d'abord observer une métrique dépassée, puis démarrer et enregistrer des instances.

**⚠️ Pourquoi pas les autres options ?**

Abaisser le seuil (B) provoquerait des oscillations coûteuses toute la journée. Supprimer l'Auto Scaling (A) fait payer la pointe 24 h/24. Un cooldown plus long (C) ralentit encore la réaction.

> 💡 **À retenir** — charge prévisible à heure fixe = scheduled scaling ; charge variable non prévisible = target tracking ; combinaison des deux = cas réel le plus fréquent. Prévoir aussi le préchauffage des instances.

---

<a id="c103"></a>

### Corrigé — Question 103

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q103)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Amazon FSx for Windows File Server, joint au domaine Active Directory.</span>

**Pourquoi cette réponse ?**

Amazon FSx for Windows File Server fournit des partages SMB natifs, l'intégration à Active Directory pour les ACL NTFS, les quotas utilisateurs et les clichés instantanés permettant aux utilisateurs de restaurer leurs versions précédentes.

**⚠️ Pourquoi pas les autres options ?**

EFS (C) expose du NFS, sans support NTFS ni VSS. S3 (B) est un stockage objet. EBS Multi-Attach (D) ne fournit pas de partage de fichiers pour Windows.

> 💡 **À retenir** — Windows + SMB + Active Directory = FSx for Windows File Server. Linux + NFS = EFS. HPC = FSx for Lustre. NAS multiprotocole avec fonctions NetApp = FSx for NetApp ONTAP.

---

<a id="c104"></a>

### Corrigé — Question 104

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q104)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Déployer les charges sur des Dedicated Hosts et suivre l'affectation des licences avec AWS License Manager.</span>

**Pourquoi cette réponse ?**

Les Dedicated Hosts donnent la visibilité sur le matériel physique (sockets, cœurs) exigée par les licences liées au matériel, et AWS License Manager suit les affectations, applique des règles et empêche les dépassements.

**⚠️ Pourquoi pas les autres options ?**

Les instances avec licence incluse (B) font payer une licence en double. Le Spot (C) ne convient pas au modèle BYOL avec affinité matérielle. Fargate (D) n'expose aucun hôte physique.

> 💡 **À retenir** — BYOL avec contrainte matérielle = Dedicated Host (+ License Manager). Dedicated Instance = isolation matérielle sans visibilité ni affinité sur l'hôte.

---

<a id="c105"></a>

### Corrigé — Question 105

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q105)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Déployer AWS Control Tower pour créer une zone d'atterrissage (landing zone) et provisionner les comptes via Account Factory avec les garde-fous appliqués automatiquement.</span>

**Pourquoi cette réponse ?**

AWS Control Tower déploie une zone d'atterrissage conforme (AWS Organizations, journalisation centralisée CloudTrail et Config, comptes d'archivage et d'audit, IAM Identity Center) et provisionne de nouveaux comptes via Account Factory, avec les garde-fous préventifs et détectifs appliqués automatiquement.

**⚠️ Pourquoi pas les autres options ?**

La création manuelle (A) est source d'oublis. Un compte unique (D) supprime l'isolation des environnements. AWS Config (C) évalue la conformité mais ne crée pas de comptes.

> 💡 **À retenir** — gouvernance multi-comptes industrialisée = AWS Control Tower (au-dessus d'AWS Organizations). Garde-fous préventifs = SCP ; garde-fous détectifs = règles AWS Config.

---

<a id="c106"></a>

### Corrigé — Question 106

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q106)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Une réplication interrégionale S3 avec le contrôle du temps de réplication (S3 Replication Time Control) activé et les métriques associées.</span>

**Pourquoi cette réponse ?**

S3 Replication Time Control garantit contractuellement la réplication de 99,99 % des objets en moins de 15 minutes, avec des métriques CloudWatch et des notifications d'événements pour suivre les objets en retard.

**⚠️ Pourquoi pas les autres options ?**

Une synchronisation quotidienne (B) ou horaire (A) ne tient pas l'objectif de 15 minutes et n'offre aucun engagement. CloudFront (D) met en cache mais ne réplique pas les objets.

> 💡 **À retenir** — exigence contractuelle de délai de réplication S3 = S3 RTC. Réplication simple entre Régions (souveraineté, latence, reprise) = S3 Cross-Region Replication, sans engagement de délai.

---

<a id="c107"></a>

### Corrigé — Question 107

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q107)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Un volume st1 (HDD à débit optimisé), conçu pour les charges séquentielles à fort débit.</span>

**Pourquoi cette réponse ?**

Les volumes st1 sont des disques magnétiques optimisés pour le débit séquentiel (jusqu'à 500 Mo/s par volume), à un coût par téraoctet bien inférieur à celui des SSD : c'est le profil des balayages massifs d'un entrepôt de données ou de traitements de type big data.

**⚠️ Pourquoi pas les autres options ?**

gp3 (C) et io2 (D) sont des SSD, plus chers, dont l'avantage porte sur les entrées/sorties aléatoires. sc1 (A) est conçu pour des accès rares, pas pour une exploitation nocturne intensive.

> 💡 **À retenir** — accès séquentiel à fort débit et coût contenu = st1 ; accès rare et archivage sur volume = sc1 ; accès aléatoire = gp3 ou io2.

---

<a id="c108"></a>

### Corrigé — Question 108

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q108)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : A et C</strong></span>

- <span style="color:#1a7f37">**A.** Automatiser la création et surtout la suppression des instantanés EBS obsolètes avec Amazon Data Lifecycle Manager ou AWS Backup.</span>
- <span style="color:#1a7f37">**C.** Configurer les plans AWS Backup pour basculer les points de restauration vers le stockage froid après 35 jours, tout en conservant la rétention de 10 ans.</span>

**Pourquoi cette réponse ?**

AWS Backup permet un cycle de vie qui bascule les points de restauration vers le stockage froid après une période chaude, à un tarif très inférieur, tout en conservant la rétention réglementaire de 10 ans. Automatiser la suppression des instantanés obsolètes avec Data Lifecycle Manager élimine l'accumulation à la source.

**⚠️ Pourquoi pas les autres options ?**

Supprimer des sauvegardes exigées par la conformité (D) crée un risque juridique. Désactiver les sauvegardes de production (E) est inacceptable. La copie interrégionale (B) augmente le coût.

> 💡 **À retenir** — un instantané EBS ne se supprime pas tout seul : sans politique de cycle de vie, le coût des sauvegardes croît indéfiniment. Rétention longue = stockage froid d'AWS Backup.

---

<a id="c109"></a>

### Corrigé — Question 109

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q109)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : B et E</strong></span>

- <span style="color:#1a7f37">**B.** Ajouter à la politique du compartiment une condition `aws:SourceVpce` (ou `aws:SourceVpc`) refusant tout accès qui ne provient pas de ce point de terminaison.</span>
- <span style="color:#1a7f37">**E.** Créer un point de terminaison VPC de type Gateway pour S3 et y attacher une politique de point de terminaison limitant l'accès au compartiment concerné.</span>

**Pourquoi cette réponse ?**

La politique du point de terminaison VPC restreint ce qui peut être atteint à travers lui, tandis que la condition `aws:SourceVpce` dans la politique du compartiment garantit que les requêtes provenant d'ailleurs — Internet, autre VPC, identifiants volés — sont refusées. Les deux couches se complètent.

**⚠️ Pourquoi pas les autres options ?**

Le chiffrement (A) ne restreint pas la provenance. Une URL présignée de longue durée (C) crée un accès contournable. Transfer Acceleration (D) est une fonctionnalité de performance qui passe par Internet.

> 💡 **À retenir** — « accessible uniquement depuis mon VPC » = point de terminaison VPC + condition `aws:SourceVpce` (ou `aws:SourceVpc`) dans la politique de ressource. La politique de ressource est le point de contrôle décisif.

---

<a id="c110"></a>

### Corrigé — Question 110

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q110)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Configurer une destination en cas d'échec (ou une file de lettres mortes) pointant vers une file Amazon SQS, où les événements non traités sont conservés pour analyse et rejeu.</span>

**Pourquoi cette réponse ?**

Pour les invocations asynchrones, Lambda réessaie deux fois puis abandonne l'événement. Une destination en cas d'échec, ou une file de lettres mortes, capture l'événement complet avec le contexte de l'erreur : rien n'est perdu et le rejeu reste possible.

**⚠️ Pourquoi pas les autres options ?**

Un délai plus long (A) n'aide pas si la dépendance est indisponible. La concurrence réservée (D) limite le parallélisme. Les notifications S3 (B) ne peuvent pas être synchrones.

> 💡 **À retenir** — toute fonction Lambda asynchrone doit avoir une destination d'échec ou une DLQ. C'est le pendant de la file de lettres mortes SQS pour le monde événementiel.

---

<a id="c111"></a>

### Corrigé — Question 111

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q111)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : B et C</strong></span>

- <span style="color:#1a7f37">**B.** Augmenter le nombre de shards du flux pour accroître la capacité d'écriture et de lecture.</span>
- <span style="color:#1a7f37">**C.** Enregistrer les consommateurs en mode enhanced fan-out afin que chacun dispose de sa propre bande passante de lecture dédiée.</span>

**Pourquoi cette réponse ?**

Chaque shard accepte 1 Mo/s en écriture et 2 Mo/s en lecture partagés entre les consommateurs classiques : 12 Mo/s exigent au minimum 12 shards, sans quoi les producteurs sont limités. L'enhanced fan-out attribue à chaque consommateur 2 Mo/s dédiés par shard, avec une latence réduite, ce qui supprime la concurrence entre les deux applications.

**⚠️ Pourquoi pas les autres options ?**

Réduire la rétention (D) ne change pas le débit. Fusionner les consommateurs (A) dégrade l'architecture. SQS (E) ne permet ni la relecture ni la lecture parallèle du même flux par plusieurs consommateurs.

> 💡 **À retenir** — dimensionner Kinesis en shards à partir du débit (1 Mo/s ou 1 000 enregistrements/s en écriture par shard) et utiliser l'enhanced fan-out dès qu'il y a plusieurs consommateurs simultanés.

---

<a id="c112"></a>

### Corrigé — Question 112

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q112)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Activer la fonctionnalité TTL (Time To Live) sur un attribut d'expiration afin que DynamoDB supprime automatiquement les éléments périmés, sans consommer de capacité en écriture.</span>

**Pourquoi cette réponse ?**

Le TTL de DynamoDB supprime en arrière-plan les éléments dont l'horodatage d'expiration est dépassé, sans consommer de capacité en écriture ni générer de coût de suppression. C'est le mécanisme prévu pour les données à durée de vie limitée.

**⚠️ Pourquoi pas les autres options ?**

Un balayage nocturne (A) consomme énormément de capacité en lecture et en écriture. Créer des tables mensuelles (D) complexifie l'application. Un export trimestriel (B) laisse le stockage croître entre-temps.

> 💡 **À retenir** — données périssables dans DynamoDB (sessions, événements, caches) = activer le TTL. Les suppressions par TTL apparaissent dans DynamoDB Streams si un archivage est souhaité.

---

<a id="c113"></a>

### Corrigé — Question 113

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q113)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** AWS CloudHSM, cluster de modules matériels dédiés dont le client contrôle les identifiants et le matériel de clé.</span>

**Pourquoi cette réponse ?**

AWS CloudHSM fournit des modules matériels de sécurité dédiés, validés FIPS 140-2 niveau 3, dont le client détient les identifiants et le matériel de clé — AWS n'y a pas accès. Il permet aussi d'exécuter des opérations cryptographiques standard (PKCS#11, JCE, CNG).

**⚠️ Pourquoi pas les autres options ?**

KMS avec des clés gérées par AWS (A) est multi-tenant et ne donne pas la maîtrise du matériel. Secrets Manager (B) gère des secrets, pas des clés matérielles. SSE-C (D) laisse la gestion de la clé à la charge du client sans HSM.

> 💡 **À retenir** — exigence explicite de HSM dédié, FIPS 140-2 niveau 3 ou de contrôle exclusif du matériel de clé = CloudHSM. Dans tous les autres cas, KMS suffit et coûte beaucoup moins cher.

---

<a id="c114"></a>

### Corrigé — Question 114

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q114)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : B et C</strong></span>

- <span style="color:#1a7f37">**B.** Construire une nouvelle AMI immuable pour chaque version, mettre à jour le modèle de lancement et déclencher un rafraîchissement d'instances (instance refresh) du groupe Auto Scaling.</span>
- <span style="color:#1a7f37">**C.** Réaliser un déploiement bleu/vert en créant un second groupe cible et en basculant le trafic de l'Application Load Balancer une fois les contrôles de santé validés.</span>

**Pourquoi cette réponse ?**

L'infrastructure immuable consiste à ne jamais modifier une instance en service : une nouvelle AMI est construite pour chaque version et le rafraîchissement d'instances remplace progressivement le parc. Le déploiement bleu/vert par bascule de groupe cible permet un retour arrière immédiat en repointant l'écouteur.

**⚠️ Pourquoi pas les autres options ?**

Les correctifs manuels en SSH (E) sont la cause même de la dérive de configuration. Désactiver les contrôles de santé (A) masque les défaillances. Augmenter la capacité maximale (D) ne fiabilise rien à lui seul.

> 💡 **À retenir** — immuabilité + remplacement progressif + retour arrière rapide = base des déploiements résilients (instance refresh, bleu/vert, canari).

---

<a id="c115"></a>

### Corrigé — Question 115

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q115)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Créer un service de point de terminaison AWS PrivateLink devant un Network Load Balancer, et laisser chaque client créer un point de terminaison de type Interface dans son VPC.</span>

**Pourquoi cette réponse ?**

AWS PrivateLink permet d'exposer un service via un Network Load Balancer : chaque consommateur crée un point de terminaison de type Interface dans son propre VPC. Le trafic reste sur le réseau AWS, il est unidirectionnel, et aucune information de routage ou d'adressage n'est partagée entre les parties.

**⚠️ Pourquoi pas les autres options ?**

L'appairage (C) expose les plages d'adresses et ne passe pas à l'échelle. Un ALB public (D) traverse Internet. Un VPN par client (B) est lourd à exploiter.

> 💡 **À retenir** — exposer un service à d'autres VPC ou comptes sans appairage, sans chevauchement de CIDR et sans Internet = AWS PrivateLink (service de point de terminaison + NLB).

---

<a id="c116"></a>

### Corrigé — Question 116

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q116)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Héberger le site statique dans un compartiment Amazon S3 et le distribuer via Amazon CloudFront, puis supprimer les instances EC2 et l'Application Load Balancer.</span>

**Pourquoi cette réponse ?**

Un site statique dans S3 distribué par CloudFront supprime les serveurs, les correctifs et l'Application Load Balancer. Le coût devient proportionnel au stockage et au trafic, la mise à l'échelle est native et les pics marketing sont absorbés par le réseau de diffusion.

**⚠️ Pourquoi pas les autres options ?**

Des instances plus petites (C) et des instances réservées (B) conservent des serveurs à administrer pour un contenu statique. Fargate (A) ajoute de la complexité sans besoin de traitement serveur.

> 💡 **À retenir** — contenu 100 % statique = S3 + CloudFront (avec OAC). C'est le schéma le moins cher, le plus disponible et le plus simple à exploiter.

---

<a id="c117"></a>

### Corrigé — Question 117

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q117)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** AWS Directory Service for Microsoft Active Directory (AWS Managed Microsoft AD) déployé sur deux zones de disponibilité.</span>

**Pourquoi cette réponse ?**

AWS Managed Microsoft AD est un véritable Active Directory managé par AWS, déployé sur deux zones de disponibilité, prenant en charge la jonction de domaine, les stratégies de groupe et les relations d'approbation avec un annuaire sur site.

**⚠️ Pourquoi pas les autres options ?**

Cognito (D) gère les identités d'applications, pas les domaines Windows. Des contrôleurs sur EC2 (A) laissent l'exploitation à la charge de l'équipe. IAM Identity Center (B) ne joint pas des serveurs à un domaine.

> 💡 **À retenir** — jonction de domaine, GPO, applications dépendant de LDAP/Kerberos = AWS Managed Microsoft AD. Simple relais vers un AD existant sur site = AD Connector.

---

<a id="c118"></a>

### Corrigé — Question 118

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q118)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Utiliser Amazon Data Lifecycle Manager (ou AWS Backup) avec une politique planifiée incluant la copie interrégionale et la rétention.</span>

**Pourquoi cette réponse ?**

Amazon Data Lifecycle Manager (et AWS Backup) automatisent la création planifiée des instantanés, leur copie interrégionale, leur étiquetage et leur suppression à l'expiration, à partir d'une politique déclarative fondée sur les étiquettes.

**⚠️ Pourquoi pas les autres options ?**

Une fonction Lambda maison (B) reproduit une fonctionnalité gérée et devra être maintenue. Des instantanés manuels (A) sont oubliés. Le versioning (C) n'existe pas pour EBS.

> 💡 **À retenir** — planification, rétention et copie interrégionale des instantanés = Data Lifecycle Manager pour EBS, AWS Backup pour une approche multi-services et multi-comptes.

---

<a id="c119"></a>

### Corrigé — Question 119

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q119)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Déployer l'agent AWS DataSync sur site et créer des tâches de transfert planifiées vers Amazon EFS.</span>

**Pourquoi cette réponse ?**

AWS DataSync utilise un agent sur site et un protocole optimisé pour transférer des données jusqu'à dix fois plus vite que les outils standard, avec chiffrement en transit, vérification d'intégrité, planification et transferts incrémentiels vers EFS, FSx ou S3.

**⚠️ Pourquoi pas les autres options ?**

`rsync` sur EC2 (B) demande des scripts, de la surveillance et n'offre pas les mêmes performances. Le double transfert par S3 (A) est inutilement complexe. Un Snowcone quotidien (C) est inadapté à une synchronisation régulière.

> 💡 **À retenir** — transferts en ligne récurrents entre le sur-site et AWS (ou entre services de stockage AWS) = AWS DataSync. Transfert massif hors ligne unique = AWS Snow Family.

---

<a id="c120"></a>

### Corrigé — Question 120

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q120)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Ajouter aux politiques IAM concernées une condition `aws:MultiFactorAuthPresent` égale à `true` pour ces actions.</span>

**Pourquoi cette réponse ?**

La clé de condition `aws:MultiFactorAuthPresent` permet d'exiger, action par action, que la session ait été établie avec un second facteur. La règle est appliquée par le moteur d'autorisation IAM et ne dépend pas de la discipline des utilisateurs.

**⚠️ Pourquoi pas les autres options ?**

Le MFA sur l'utilisateur racine (A) est indispensable mais ne couvre pas les opérations quotidiennes. Une consigne (D) n'est pas un contrôle technique. Un rôle sans condition (C) n'apporte aucune garantie.

> 💡 **À retenir** — MFA obligatoire pour les opérations sensibles = condition IAM `aws:MultiFactorAuthPresent`. Les clés de condition globales (`aws:SourceIp`, `aws:PrincipalOrgID`, `aws:SecureTransport`…) sont un thème récurrent de l'examen.

---

<a id="c121"></a>

### Corrigé — Question 121

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q121)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Créer un point d'accès S3 (S3 Access Point) par équipe, chacun avec sa propre politique et son nom DNS dédié.</span>

**Pourquoi cette réponse ?**

Les points d'accès S3 donnent à chaque application ou équipe son propre point d'entrée nommé, avec une politique dédiée et limitée à son périmètre. La politique du compartiment reste simple et délègue le contrôle fin aux points d'accès, qui peuvent aussi être restreints à un VPC.

**⚠️ Pourquoi pas les autres options ?**

Dupliquer les données (A) multiplie le coût et la dérive. Les ACL d'objets (D) sont une méthode ancienne, désactivée par défaut. Un accès complet filtré côté application (B) viole le moindre privilège.

> 💡 **À retenir** — compartiment partagé par de nombreuses équipes = S3 Access Points (un point d'accès, une politique, un usage). Pour un accès multi-Régions, il existe les Multi-Region Access Points.

---

<a id="c122"></a>

### Corrigé — Question 122

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q122)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Déployer l'application avec AWS Elastic Beanstalk, qui provisionne et gère l'environnement complet à partir du code applicatif.</span>

**Pourquoi cette réponse ?**

AWS Elastic Beanstalk provisionne et gère automatiquement l'Application Load Balancer, le groupe Auto Scaling, les instances et la surveillance à partir du seul code applicatif, tout en laissant l'accès aux ressources sous-jacentes. Il prend en charge les déploiements progressifs et immuables.

**⚠️ Pourquoi pas les autres options ?**

La construction manuelle (C) demande la conception et l'exploitation complètes. EKS autogéré (A) ajoute une couche Kubernetes non demandée. Une instance unique (B) n'offre ni élasticité ni disponibilité.

> 💡 **À retenir** — application web classique à déployer vite, sans expertise infrastructure = Elastic Beanstalk. Contrôle fin et infrastructure décrite explicitement = CloudFormation.

---

<a id="c123"></a>

### Corrigé — Question 123

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q123)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Configurer une politique de cache qui n'inclut dans la clé de cache que les paramètres de requête et les en-têtes réellement nécessaires, et définir des durées de vie appropriées.</span>

**Pourquoi cette réponse ?**

La clé de cache détermine ce que CloudFront considère comme une réponse distincte. Inclure des paramètres de suivi uniques crée une entrée de cache par visiteur, d'où un taux de succès très faible. Une politique de cache qui ne retient que les éléments influençant réellement la réponse, avec un TTL adapté, augmente immédiatement le taux de succès.

**⚠️ Pourquoi pas les autres options ?**

Un TTL nul (C) supprimerait le cache. Désactiver la compression (B) dégrade les performances. Le nombre de points de présence (A) n'est pas configurable.

> 💡 **À retenir** — taux de succès faible sur CloudFront = clé de cache trop large (chaînes de requête, en-têtes, cookies inutiles). Régler la politique de cache avant toute autre optimisation.

---

<a id="c124"></a>

### Corrigé — Question 124

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q124)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Activer S3 Storage Lens et l'analyse des classes de stockage (Storage Class Analysis) pour identifier les données rarement consultées.</span>

**Pourquoi cette réponse ?**

S3 Storage Lens fournit une visibilité chiffrée de l'usage et de l'activité sur l'ensemble des compartiments, avec des recommandations. L'analyse des classes de stockage observe les profils d'accès et indique à partir de quel âge les objets peuvent être basculés vers une classe moins chère.

**⚠️ Pourquoi pas les autres options ?**

Le versioning (D) augmente le stockage. Une transition massive immédiate (A) rendrait inaccessibles des données actives. La facture (C) n'explique pas les profils d'accès.

> 💡 **À retenir** — mesurer avant d'optimiser. S3 Storage Lens et Storage Class Analysis servent à justifier et calibrer les règles de cycle de vie, plutôt que de les définir à l'aveugle.

---

<a id="c125"></a>

### Corrigé — Question 125

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q125)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Une instruction `Deny` explicite s'applique, par exemple via une politique de contrôle des services, une politique de compartiment ou une limite de permissions ; un refus explicite l'emporte toujours sur une autorisation.</span>

**Pourquoi cette réponse ?**

L'évaluation des politiques suit une règle simple : un `Deny` explicite l'emporte toujours, quelle que soit sa provenance — SCP, politique de compartiment, limite de permissions, politique de session ou politique d'identité. Une autorisation `s3:*` ne peut jamais le contourner.

**⚠️ Pourquoi pas les autres options ?**

La propagation (C) est de l'ordre de la seconde. Un compartiment n'a pas besoin d'être public (B) pour être accessible à un principal autorisé. Les politiques IAM s'appliquent bien à S3 (D).

> 💡 **À retenir** — ordre d'évaluation IAM : refus explicite > autorisation explicite > refus implicite (par défaut). Pour un accès entre comptes, l'autorisation doit exister des deux côtés.

---

<a id="c126"></a>

### Corrigé — Question 126

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q126)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Utiliser AWS CloudFormation StackSets pour déployer et mettre à jour la pile dans l'ensemble des comptes et Régions cibles depuis un compte d'administration.</span>

**Pourquoi cette réponse ?**

CloudFormation StackSets déploie une même pile dans un ensemble de comptes et de Régions à partir d'une opération unique, gère les mises à jour, les échecs partiels et l'ajout automatique des nouveaux comptes d'une unité organisationnelle.

**⚠️ Pourquoi pas les autres options ?**

Le déploiement manuel (C) est source de dérive. Copier une AMI (B) ne déploie pas une infrastructure. AWS Config (A) évalue la conformité, il ne provisionne pas de ressources.

> 💡 **À retenir** — infrastructure identique dans plusieurs comptes et Régions = CloudFormation StackSets, avec déploiement piloté par les unités organisationnelles d'AWS Organizations.

---

<a id="c127"></a>

### Corrigé — Question 127

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q127)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : A et C</strong></span>

- <span style="color:#1a7f37">**A.** Utiliser des requêtes de plage d'octets (byte-range fetches) parallèles pour télécharger un même objet en plusieurs morceaux simultanés.</span>
- <span style="color:#1a7f37">**C.** Utiliser les téléversements multipart, qui découpent l'objet en parties transférées en parallèle et permettent de ne reprendre que les parties échouées.</span>

**Pourquoi cette réponse ?**

Le téléversement multipart découpe l'objet en parties envoyées en parallèle : le débit augmente et une partie en échec est renvoyée seule, sans reprendre tout le transfert. Symétriquement, les requêtes de plage d'octets permettent de télécharger plusieurs segments d'un même objet simultanément.

**⚠️ Pourquoi pas les autres options ?**

La compression systématique (E) déplace le coût vers le processeur sans traiter la reprise. Diviser en milliers de petits fichiers (D) complexifie l'application. Le versioning (B) n'a aucun effet sur les performances.

> 💡 **À retenir** — objets > 100 Mo = multipart obligatoire dans la pratique (indispensable au-delà de 5 Go). Lecture rapide de gros objets = byte-range fetches parallèles. Prévoir une règle de cycle de vie pour les téléversements incomplets.

---

<a id="c128"></a>

### Corrigé — Question 128

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q128)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : B et E</strong></span>

- <span style="color:#1a7f37">**B.** Souscrire un Compute Savings Plan couvrant la consommation Fargate de base.</span>
- <span style="color:#1a7f37">**E.** Réduire les définitions de tâches aux valeurs de vCPU et de mémoire réellement nécessaires, en s'appuyant sur les métriques de Container Insights.</span>

**Pourquoi cette réponse ?**

Fargate facture le vCPU et la mémoire réservés par la définition de tâche, pas la consommation réelle : ramener ces valeurs au besoin observé réduit directement la facture, souvent de moitié ou plus. Un Compute Savings Plan s'applique également à Fargate et ajoute jusqu'à 50 % de remise sur la consommation de base stable.

**⚠️ Pourquoi pas les autres options ?**

Revenir à EC2 On-Demand (A) rétablit la gestion des serveurs. Ajouter des tâches (D) augmente le coût. Supprimer les journaux (C) nuit à l'exploitation pour un gain marginal.

> 💡 **À retenir** — sur Fargate, le dimensionnement des tâches est le premier levier de coût ; les Savings Plans couvrent EC2, Fargate et Lambda.

---

<a id="c129"></a>

### Corrigé — Question 129

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q129)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : B et D</strong></span>

- <span style="color:#1a7f37">**B.** Chiffrer les données avec SSE-KMS en utilisant des clés gérées par le client, dont la politique restreint l'usage aux rôles autorisés.</span>
- <span style="color:#1a7f37">**D.** Gérer les autorisations du lac de données avec AWS Lake Formation, en accordant des permissions au niveau des bases, des tables et des colonnes.</span>

**Pourquoi cette réponse ?**

AWS Lake Formation centralise les autorisations du lac de données au niveau des bases, des tables, des colonnes et des lignes, et ces permissions sont respectées par Athena, Redshift Spectrum, EMR et Glue. Le chiffrement SSE-KMS avec une clé gérée par le client garantit que même un accès direct aux objets S3 exige une autorisation sur la clé.

**⚠️ Pourquoi pas les autres options ?**

Copier les colonnes sensibles (A) et ouvrir le catalogue (E) élargissent l'exposition. Désactiver le chiffrement (C) contredit l'exigence.

> 💡 **À retenir** — contrôle d'accès fin sur un lac de données (colonnes, lignes) = AWS Lake Formation, plutôt que des politiques S3 par préfixe.

---

<a id="c130"></a>

### Corrigé — Question 130

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q130)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : A et B</strong></span>

- <span style="color:#1a7f37">**A.** Rendre le traitement idempotent, par exemple en enregistrant l'identifiant de transaction dans Amazon DynamoDB avec une écriture conditionnelle avant d'appliquer le débit.</span>
- <span style="color:#1a7f37">**B.** Déployer les consommateurs dans un groupe Auto Scaling réparti sur plusieurs zones de disponibilité.</span>

**Pourquoi cette réponse ?**

Répartir les consommateurs sur plusieurs zones de disponibilité garantit la poursuite du traitement en cas de panne de zone. L'idempotence, obtenue par une écriture conditionnelle sur l'identifiant de transaction dans DynamoDB, protège du double débit, car SQS standard garantit une livraison « au moins une fois ».

**⚠️ Pourquoi pas les autres options ?**

Un consommateur unique (D) crée un point de défaillance. Désactiver les nouvelles tentatives (E) provoquerait des pertes. Une instance unique protégée (C) reste vulnérable à une panne de zone.

> 💡 **À retenir** — dans un système distribué, les doublons sont inévitables : la bonne réponse est de rendre le traitement idempotent, pas d'essayer de supprimer les redistributions.

---

<a id="c131"></a>

### Corrigé — Question 131

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q131)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Amazon Managed Streaming for Apache Kafka (Amazon MSK), déployé sur plusieurs zones de disponibilité.</span>

**Pourquoi cette réponse ?**

Amazon MSK exécute Apache Kafka en version managée : les producteurs et consommateurs existants se connectent sans modification, tandis qu'AWS gère les courtiers, les correctifs, la réplication multi-AZ et la surveillance.

**⚠️ Pourquoi pas les autres options ?**

SQS FIFO (D) et Firehose (C) sont des services propriétaires qui imposeraient une réécriture. Réinstaller Kafka sur EC2 (B) conserve toute la charge d'exploitation.

> 💡 **À retenir** — compatibilité avec un moteur open source existant = service managé équivalent (MSK pour Kafka, Amazon MQ pour ActiveMQ/RabbitMQ, ElastiCache pour Redis/Memcached, DocumentDB pour MongoDB).

---

<a id="c132"></a>

### Corrigé — Question 132

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q132)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Activer la facturation consolidée avec le partage des réductions (instances réservées et Savings Plans mutualisés entre les comptes de l'organisation) et piloter les achats de façon centralisée.</span>

**Pourquoi cette réponse ?**

Dans AWS Organizations, la facturation consolidée mutualise l'usage : les instances réservées et les Savings Plans non utilisés dans un compte s'appliquent automatiquement à la consommation éligible des autres comptes, et les paliers de volume s'appliquent au total du groupe.

**⚠️ Pourquoi pas les autres options ?**

Acheter davantage de réservations décentralisées (B) aggrave le gaspillage. Fusionner les comptes (D) supprime l'isolation. Le Spot généralisé (A) ne convient pas à toutes les charges.

> 💡 **À retenir** — facturation consolidée = paliers de volume mutualisés + partage des réductions RI/Savings Plans (désactivable compte par compte). C'est un argument majeur en faveur d'AWS Organizations.

---

<a id="c133"></a>

### Corrigé — Question 133

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q133)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Exiger IMDSv2 (sessions avec jeton) sur les instances et désactiver IMDSv1.</span>

**Pourquoi cette réponse ?**

IMDSv2 impose l'obtention préalable d'un jeton par une requête `PUT`, avec une limite de sauts réseau. Les requêtes SSRF classiques, qui ne font qu'un `GET` sur l'URL de métadonnées, échouent alors : les identifiants du rôle ne peuvent plus être extraits.

**⚠️ Pourquoi pas les autres options ?**

Revenir à des clés statiques (C) aggrave le risque. Un groupe de sécurité (D) ne filtre pas le trafic vers l'adresse de métadonnées, locale à l'instance. Le chiffrement du disque (B) est sans rapport.

> 💡 **À retenir** — exiger IMDSv2 (et désactiver IMDSv1) sur toutes les instances est une bonne pratique de sécurité systématique, applicable via une SCP ou le modèle de lancement.

---

<a id="c134"></a>

### Corrigé — Question 134

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q134)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Une stratégie de sauvegarde et restauration : sauvegardes quotidiennes avec AWS Backup copiées dans une seconde Région, et redéploiement de l'infrastructure par modèle CloudFormation en cas de sinistre.</span>

**Pourquoi cette réponse ?**

Avec un RTO et un RPO de 24 heures, la stratégie de sauvegarde et restauration suffit : elle ne fait payer que le stockage des sauvegardes dans la Région secondaire, l'infrastructure n'étant recréée qu'en cas de sinistre à partir des modèles d'infrastructure.

**⚠️ Pourquoi pas les autres options ?**

L'actif-actif (C), le warm standby (A) et le pilot light (D) répondent à des objectifs plus exigeants et coûtent nettement plus cher que ce que le métier demande.

> 💡 **À retenir** — choisir la stratégie de reprise la moins coûteuse qui satisfait le RTO et le RPO exprimés. Surdimensionner la reprise est une erreur d'optimisation des coûts à l'examen comme en pratique.

---

<a id="c135"></a>

### Corrigé — Question 135

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q135)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** AWS Batch, avec ses files de tâches, ses environnements de calcul gérés et sa prise en charge des instances Spot.</span>

**Pourquoi cette réponse ?**

AWS Batch gère les files de tâches, les dépendances entre tâches, les nouvelles tentatives et le provisionnement automatique des environnements de calcul (EC2, Spot ou Fargate) selon la charge, sans planificateur à développer.

**⚠️ Pourquoi pas les autres options ?**

Un script maison (D) reproduit un service existant. Une Lambda en boucle (A) est limitée en durée et inadaptée. Un cluster EMR permanent (C) est conçu pour l'analytique distribuée et facture l'inactivité.

> 💡 **À retenir** — lots de tâches indépendantes à planifier et à dimensionner automatiquement = AWS Batch (avec Spot pour le coût). Traitement distribué Spark/Hadoop = EMR.

---

<a id="c136"></a>

### Corrigé — Question 136

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q136)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** S3 Glacier Instant Retrieval, conçue pour les données archivées nécessitant un accès immédiat.</span>

**Pourquoi cette réponse ?**

S3 Glacier Instant Retrieval offre un coût de stockage proche des classes d'archive tout en conservant un accès en millisecondes, exactement pour les données consultées quelques fois par an mais qui doivent s'afficher immédiatement.

**⚠️ Pourquoi pas les autres options ?**

S3 Standard (D) coûte beaucoup plus cher. Glacier Flexible Retrieval (B) impose des minutes à des heures. Deep Archive (C) demande jusqu'à 12 heures, incompatible avec une consultation clinique.

> 💡 **À retenir** — archivage avec accès immédiat = Glacier Instant Retrieval ; accès en minutes/heures = Glacier Flexible Retrieval ; accès en heures et coût minimal = Glacier Deep Archive.

---

<a id="c137"></a>

### Corrigé — Question 137

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q137)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Utiliser un groupe d'identités Amazon Cognito (identity pool) pour échanger le jeton d'authentification contre des identifiants AWS temporaires associés à un rôle IAM dont la politique restreint l'accès au préfixe de l'utilisateur.</span>

**Pourquoi cette réponse ?**

Un groupe d'identités Cognito échange le jeton émis par le fournisseur d'identité contre des identifiants AWS temporaires. La politique du rôle peut utiliser la variable `${cognito-identity.amazonaws.com:sub}` dans l'ARN des ressources pour cloisonner chaque utilisateur dans son propre préfixe S3.

**⚠️ Pourquoi pas les autres options ?**

Des clés intégrées (B) sont extractibles de l'application. Un compartiment public (C) est une faille. Un utilisateur IAM par utilisateur final (D) ne passe pas à l'échelle.

> 💡 **À retenir** — accès direct d'utilisateurs finaux à des ressources AWS = Cognito Identity Pool + rôle IAM avec des variables de politique pour l'isolation par utilisateur.

---

<a id="c138"></a>

### Corrigé — Question 138

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q138)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Activer la réplication EFS vers un système de fichiers de destination dans une autre Région.</span>

**Pourquoi cette réponse ?**

La réplication EFS crée et maintient automatiquement une copie en lecture seule du système de fichiers dans une autre Région, avec un RPO de l'ordre de la minute, sans agent ni script à exploiter.

**⚠️ Pourquoi pas les autres options ?**

Un montage à distance (C) n'est pas conçu pour une réplication interrégionale. `rsync` (A) impose scripts et surveillance, avec un RPO de 24 heures. Le versioning (B) n'existe pas dans EFS.

> 💡 **À retenir** — réplication managée interrégionale : S3 (CRR), EFS (EFS Replication), Aurora (Global Database), DynamoDB (Global Tables), RDS (réplica en lecture interrégional).

---

<a id="c139"></a>

### Corrigé — Question 139

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q139)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Amazon Neptune, base de données de graphes managée.</span>

**Pourquoi cette réponse ?**

Amazon Neptune est une base de données de graphes managée, optimisée pour les requêtes de parcours de relations (Gremlin, openCypher, SPARQL). La détection de fraude, les réseaux sociaux et les moteurs de recommandation en sont les cas d'usage typiques.

**⚠️ Pourquoi pas les autres options ?**

Redshift (A) est un entrepôt analytique. DynamoDB (C) n'exécute pas de parcours de graphe. Les jointures récursives sur MySQL (B) s'effondrent au-delà de quelques niveaux de profondeur.

> 💡 **À retenir** — utiliser la base adaptée au motif de données : relationnel = RDS/Aurora ; clé-valeur = DynamoDB ; graphe = Neptune ; documents = DocumentDB ; séries temporelles et colonnes larges = Keyspaces ; analytique = Redshift ; en mémoire = ElastiCache.

---

<a id="c140"></a>

### Corrigé — Question 140

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q140)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Utiliser AWS Firewall Manager pour définir une politique de sécurité appliquée automatiquement aux ressources de tous les comptes de l'organisation.</span>

**Pourquoi cette réponse ?**

AWS Firewall Manager applique de façon centralisée des politiques de sécurité (ACL web WAF, règles Shield Advanced, groupes de sécurité, Network Firewall) à toutes les ressources d'une organisation, y compris celles créées après coup, et signale les ressources non conformes.

**⚠️ Pourquoi pas les autres options ?**

L'association manuelle (B) laisse des trous. Une règle Config sur un seul compte (D) ne couvre pas l'organisation et ne corrige rien. Interdire les Application Load Balancers (C) bloquerait les équipes.

> 💡 **À retenir** — appliquer et maintenir des règles de sécurité réseau et WAF à l'échelle d'une organisation = AWS Firewall Manager (nécessite AWS Organizations et un compte administrateur délégué).

---

<a id="c141"></a>

### Corrigé — Question 141

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q141)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Activer les journaux de flux VPC (VPC Flow Logs) sur le VPC ou les interfaces réseau concernées, et les analyser dans CloudWatch Logs ou Amazon Athena.</span>

**Pourquoi cette réponse ?**

Les journaux de flux VPC enregistrent les métadonnées du trafic IP (adresses, ports, protocole, volume) et l'action appliquée — `ACCEPT` ou `REJECT` — au niveau du VPC, du sous-réseau ou de l'interface réseau. C'est l'outil de diagnostic des règles de filtrage.

**⚠️ Pourquoi pas les autres options ?**

CloudTrail (B) trace les appels d'API, pas les paquets. GuardDuty (A) signale des menaces, pas les rejets ordinaires. Les journaux de l'Application Load Balancer (C) ne couvrent pas le trafic sortant du sous-réseau.

> 💡 **À retenir** — diagnostic réseau dans un VPC = VPC Flow Logs (avec `REJECT` pour identifier un blocage par groupe de sécurité ou NACL). Diagnostic des permissions = CloudTrail.

---

<a id="c142"></a>

### Corrigé — Question 142

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q142)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Créer un groupe cible par microservice et définir des règles de routage par chemin (path-based routing) sur l'écouteur de l'Application Load Balancer.</span>

**Pourquoi cette réponse ?**

Le routage par chemin d'un Application Load Balancer dirige chaque préfixe d'URL vers un groupe cible distinct. Les microservices restent indépendants et se dimensionnent séparément, tout en partageant un point d'entrée, un nom de domaine et un certificat.

**⚠️ Pourquoi pas les autres options ?**

Un load balancer par service (D) multiplie les coûts et les noms de domaine. Un NLB par port (B) impose des URL peu pratiques et perd le routage applicatif. Un groupe cible unique (A) supprime l'indépendance recherchée.

> 💡 **À retenir** — ALB = couche 7, routage par chemin, par hôte, par en-tête ou par méthode ; NLB = couche 4, très haut débit, adresses IP statiques, TCP/UDP.

---

<a id="c143"></a>

### Corrigé — Question 143

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q143)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** AWS Schema Conversion Tool pour convertir le schéma, puis AWS DMS avec réplication continue (CDC) pour migrer et synchroniser les données.</span>

**Pourquoi cette réponse ?**

AWS SCT convertit le schéma et le code procédural entre moteurs différents (migration hétérogène), tandis qu'AWS DMS réalise la charge initiale puis répond en capture de données modifiées (CDC) pour garder la cible synchronisée jusqu'à la bascule, ce qui réduit l'indisponibilité à quelques minutes.

**⚠️ Pourquoi pas les autres options ?**

DataSync (A) transfère des fichiers, pas des structures de base. Un instantané RDS (D) ne fonctionne qu'entre moteurs compatibles. Snowball (B) ne convertit ni ne synchronise.

> 💡 **À retenir** — même moteur = migration homogène (instantané, réplication native, DMS). Moteur différent = SCT pour le schéma + DMS avec CDC pour les données.

---

<a id="c144"></a>

### Corrigé — Question 144

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q144)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Configurer la classe de prix (price class) de la distribution pour n'utiliser que les points de présence d'Europe et d'Amérique du Nord.</span>

**Pourquoi cette réponse ?**

Les classes de prix CloudFront permettent de limiter la distribution aux points de présence des zones géographiques où se trouvent réellement les utilisateurs, à un tarif inférieur. Les utilisateurs situés ailleurs restent servis, mais depuis un point de présence plus éloigné.

**⚠️ Pourquoi pas les autres options ?**

Supprimer CloudFront (B) augmenterait le coût de sortie et la latence. Un TTL court (D) multiplie les requêtes vers l'origine. La journalisation (A) ajoute un coût.

> 💡 **À retenir** — ajuster la classe de prix CloudFront à l'audience réelle est une optimisation de coût simple et sans effet sur les utilisateurs des Régions couvertes.

---

<a id="c145"></a>

### Corrigé — Question 145

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q145)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : C et D</strong></span>

- <span style="color:#1a7f37">**C.** Définir des règles d'autorisation Client VPN par groupe d'utilisateurs, associées à des groupes de sécurité restreignant les destinations accessibles.</span>
- <span style="color:#1a7f37">**D.** Déployer AWS Client VPN avec une authentification fédérée SAML vers le fournisseur d'identité de l'entreprise.</span>

**Pourquoi cette réponse ?**

AWS Client VPN est un service managé de VPN d'accès distant compatible OpenVPN, qui prend en charge l'authentification fédérée SAML : les employés se connectent avec leur identité d'entreprise et le trafic est chiffré. Les règles d'autorisation, associées à des groupes Active Directory ou SAML et à des groupes de sécurité, limitent les réseaux et applications atteignables par chaque groupe.

**⚠️ Pourquoi pas les autres options ?**

Exposer les applications sur Internet (A) et un bastion RDP public (B) élargissent la surface d'attaque. Des utilisateurs IAM avec clés (E) ne fournissent pas d'accès réseau.

> 💡 **À retenir** — accès distant d'utilisateurs à un VPC = AWS Client VPN (fédération + règles d'autorisation). Liaison permanente entre sites = Site-to-Site VPN ou Direct Connect.

---

<a id="c146"></a>

### Corrigé — Question 146

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q146)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : D et E</strong></span>

- <span style="color:#1a7f37">**D.** Augmenter la période de grâce des contrôles de santé du groupe Auto Scaling au-delà du temps d'initialisation de l'application.</span>
- <span style="color:#1a7f37">**E.** Configurer un délai de désinscription (deregistration delay / connection draining) sur le groupe cible afin de laisser les requêtes en cours se terminer.</span>

**Pourquoi cette réponse ?**

La période de grâce des contrôles de santé indique à l'Auto Scaling combien de temps ignorer l'état d'une instance après son lancement : trop courte, elle provoque des remplacements en boucle pendant l'initialisation. Le délai de désinscription permet aux requêtes en cours de se terminer avant que l'instance ne quitte le groupe cible, ce qui supprime les erreurs pendant le scale-in.

**⚠️ Pourquoi pas les autres options ?**

Désactiver les contrôles de santé (A) masque les pannes. Un délai de désinscription nul (C) coupe les requêtes en cours. Repasser en contrôles EC2 (B) ne détecterait plus les défaillances applicatives.

> 💡 **À retenir** — deux réglages à ajuster systématiquement sur un couple ASG + ALB : la période de grâce (alignée sur le temps de démarrage) et le délai de désinscription (aligné sur la durée des requêtes).

---

<a id="c147"></a>

### Corrigé — Question 147

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q147)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : A et D</strong></span>

- <span style="color:#1a7f37">**A.** Définir une clé de tri sur la colonne de date utilisée dans les filtres.</span>
- <span style="color:#1a7f37">**D.** Définir une clé de distribution adaptée sur la colonne de jointure de la grande table, et distribuer la petite table en mode ALL.</span>

**Pourquoi cette réponse ?**

Dans Redshift, la clé de distribution détermine la répartition des lignes entre les nœuds : distribuer les deux tables sur la colonne de jointure — ou répliquer la petite table avec le style `ALL` — supprime la redistribution coûteuse. La clé de tri sur la colonne de date permet d'éliminer des blocs entiers grâce aux métadonnées de zone map lors du filtrage.

**⚠️ Pourquoi pas les autres options ?**

Supprimer les contraintes (B) prive l'optimiseur d'informations. Migrer vers RDS (E) ne convient pas à l'analytique. Désactiver la compression (C) augmente les entrées/sorties.

> 💡 **À retenir** — performances Redshift = clé de distribution (limiter les échanges entre nœuds) + clé de tri (limiter les blocs lus) + compression. Ce sont les trois leviers de conception.

---

<a id="c148"></a>

### Corrigé — Question 148

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q148)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Utiliser Amazon Redshift Serverless, dont la capacité et la facturation suivent l'usage réel.</span>

**Pourquoi cette réponse ?**

Amazon Redshift Serverless provisionne automatiquement la capacité au lancement des requêtes et facture à l'usage ; l'entrepôt ne coûte rien pendant les 21 heures d'inactivité quotidienne, sans intervention d'exploitation.

**⚠️ Pourquoi pas les autres options ?**

Réduire les nœuds (C) laisse un cluster facturé en permanence. RDS (D) ne convient pas à l'analytique. Supprimer et recréer le cluster (B) est risqué et manuel.

> 💡 **À retenir** — usage intermittent = service serverless (Redshift Serverless, Aurora Serverless v2, Athena, Lambda, Fargate). Usage soutenu = ressources provisionnées avec engagement.

---

<a id="c149"></a>

### Corrigé — Question 149

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q149)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Activer les événements de données (data events) AWS CloudTrail pour ce compartiment, avec livraison vers un compartiment de journalisation dédié.</span>

**Pourquoi cette réponse ?**

Par défaut, CloudTrail n'enregistre que les événements de gestion. Les événements de données au niveau des objets S3 (`GetObject`, `PutObject`, `DeleteObject`) doivent être activés explicitement pour le compartiment ; ils tracent le principal, l'heure, l'adresse source et l'objet concerné.

**⚠️ Pourquoi pas les autres options ?**

Les journaux de flux (B) n'identifient pas les objets. Les métriques (A) sont agrégées. Macie (D) découvre des données sensibles, il ne journalise pas les accès.

> 💡 **À retenir** — traçabilité au niveau des objets S3 = événements de données CloudTrail (facturés) ou journaux d'accès au serveur S3. Les événements de gestion seuls ne suffisent pas.

---

<a id="c150"></a>

### Corrigé — Question 150

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q150)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Utiliser AWS Application Migration Service, qui réplique en continu les serveurs sources vers AWS et permet une bascule rapide.</span>

**Pourquoi cette réponse ?**

AWS Application Migration Service (MGN) installe un agent sur les serveurs sources et réplique les blocs en continu vers une zone de préproduction dans AWS. La bascule démarre des instances EC2 à partir de la dernière réplication, ce qui réduit l'indisponibilité à quelques minutes pour un « lift and shift » sans réinstallation.

**⚠️ Pourquoi pas les autres options ?**

La réinstallation manuelle (D) est longue et risquée sur 120 serveurs. L'export/import via Snowball (C) implique un gel prolongé des données. DataSync (B) copie des fichiers, pas des serveurs entiers.

> 💡 **À retenir** — rehost de serveurs vers EC2 avec bascule rapide = AWS Application Migration Service. Migration de bases avec conversion = DMS (+ SCT). Transfert de fichiers = DataSync.

---

<a id="c151"></a>

### Corrigé — Question 151

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q151)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Configurer un pool d'instances préchauffées (warm pool) sur le groupe Auto Scaling, avec des instances déjà initialisées et arrêtées ou en veille.</span>

**Pourquoi cette réponse ?**

Un pool d'instances préchauffées maintient des instances déjà initialisées, arrêtées ou en veille, prêtes à rejoindre le groupe Auto Scaling en quelques secondes. Le temps d'initialisation disparaît du chemin critique lors des pics.

**⚠️ Pourquoi pas les autres options ?**

Augmenter la capacité maximale (C) ne réduit pas le délai de démarrage. Réduire la période de grâce (A) provoquerait des remplacements prématurés. Une instance plus grande (D) n'accélère pas nécessairement le chargement des données.

> 💡 **À retenir** — temps d'initialisation long + pics soudains = warm pools (ou hibernation) sur le groupe Auto Scaling. La réduction du temps de démarrage passe aussi par une AMI préconstruite.

---

<a id="c152"></a>

### Corrigé — Question 152

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q152)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : C et D</strong></span>

- <span style="color:#1a7f37">**C.** Diversifier les types et les tailles d'instances éligibles et utiliser la stratégie d'allocation « capacity-optimized » pour les instances Spot.</span>
- <span style="color:#1a7f37">**D.** Configurer une politique d'instances mixtes sur le groupe Auto Scaling, combinant une part d'instances à la demande et une majorité d'instances Spot.</span>

**Pourquoi cette réponse ?**

Une politique d'instances mixtes permet de garantir une base à la demande tout en tirant l'essentiel de la capacité du Spot. Diversifier les types et tailles d'instances, avec la stratégie « capacity-optimized », place la capacité dans les pools les moins susceptibles d'être récupérés : le risque d'interruption simultanée de toute la flotte s'effondre.

**⚠️ Pourquoi pas les autres options ?**

Un type unique (B) concentre le risque sur un seul pool. Réserver la capacité maximale (A) et fixer la capacité au plafond (E) suppriment les économies recherchées.

> 💡 **À retenir** — Spot en production = diversification des pools + politique d'instances mixtes + gestion du signal d'interruption à deux minutes.

---

<a id="c153"></a>

### Corrigé — Question 153

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q153)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Utiliser AWS Systems Manager Patch Manager avec des lignes de base de correctifs, des fenêtres de maintenance et les rapports de conformité associés.</span>

**Pourquoi cette réponse ?**

Patch Manager définit des lignes de base par système d'exploitation et par environnement, applique les correctifs pendant des fenêtres de maintenance et produit des rapports de conformité exploitables pour l'audit, sur des instances EC2 comme sur des serveurs hybrides.

**⚠️ Pourquoi pas les autres options ?**

Le patching manuel (A) ne passe pas à l'échelle. Reconstruire les AMI à la main (D) est lourd, même si l'approche immuable reste valable si elle est automatisée. Inspector (C) détecte les vulnérabilités mais n'applique pas de correctifs.

> 💡 **À retenir** — Systems Manager est la boîte à outils d'exploitation : Patch Manager (correctifs), Session Manager (accès), Parameter Store (configuration), State Manager, Automation, Inventory.

---

<a id="c154"></a>

### Corrigé — Question 154

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q154)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Utiliser Amazon EventBridge Scheduler, qui planifie des invocations vers des cibles AWS avec fuseaux horaires, fenêtres de flexibilité et politique de nouvelles tentatives.</span>

**Pourquoi cette réponse ?**

EventBridge Scheduler gère des millions de planifications, avec des expressions cron ou de taux, la prise en charge des fuseaux horaires et de l'heure d'été, des fenêtres de flexibilité, des nouvelles tentatives et des files de lettres mortes, vers plus de 270 services cibles — sans aucun serveur.

**⚠️ Pourquoi pas les autres options ?**

Un `crontab` sur EC2 (D) impose un serveur à maintenir et un point de défaillance unique. Un sondage à la seconde (B) est coûteux. AWS Batch (C) est un ordonnanceur de tâches de calcul, pas un planificateur d'événements.

> 💡 **À retenir** — tâches planifiées sans serveur = EventBridge Scheduler (ou une règle EventBridge planifiée pour un cas simple).

---

<a id="c155"></a>

### Corrigé — Question 155

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q155)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Choisir un type et une taille d'instance offrant une bande passante réseau supérieure, avec le réseau amélioré (ENA) activé.</span>

**Pourquoi cette réponse ?**

La bande passante réseau d'une instance EC2 dépend de son type et de sa taille. Lorsque le réseau sature alors que les autres ressources sont libres, la réponse est de choisir une instance offrant plus de débit — éventuellement une taille avec bande passante garantie plutôt que « jusqu'à » — et d'activer le réseau amélioré ENA.

**⚠️ Pourquoi pas les autres options ?**

Un volume supplémentaire (A) n'augmente pas le débit réseau. La surveillance (B) ne fait qu'observer. Un groupe de placement spread (C) vise la résilience.

> 💡 **À retenir** — identifier la ressource saturée (processeur, mémoire, entrées/sorties disque, réseau) avant de redimensionner. Les petites tailles d'instance ont une bande passante en mode rafale, non garantie dans la durée.

---

<a id="c156"></a>

### Corrigé — Question 156

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q156)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Une connexion AWS Site-to-Site VPN sur la liaison Internet existante, avec deux tunnels pour la redondance.</span>

**Pourquoi cette réponse ?**

Un Site-to-Site VPN se met en service en quelques heures, coûte quelques dizaines de dollars par mois plus le transfert de données, et fournit deux tunnels IPsec redondants — largement suffisant pour 50 Mbit/s sans exigence de latence garantie.

**⚠️ Pourquoi pas les autres options ?**

Direct Connect (B) et une double liaison Direct Connect (C) impliquent des semaines de mise en service et un coût sans rapport avec le besoin. L'appairage de VPC (D) ne relie que des VPC entre eux.

> 💡 **À retenir** — VPN = rapide, économique, passe par Internet (latence variable). Direct Connect = coûteux, long à obtenir, bande passante et latence prévisibles. Les deux se combinent, le VPN servant de secours.

---

<a id="c157"></a>

### Corrigé — Question 157

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q157)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Définir un rôle IAM de tâche (task role) distinct pour chaque définition de tâche, avec uniquement les permissions nécessaires au service concerné.</span>

**Pourquoi cette réponse ?**

Le rôle IAM de tâche fournit à chaque conteneur ses propres identifiants temporaires, indépendamment du rôle de l'instance hôte. Chaque définition de tâche reçoit ainsi strictement les permissions de son service.

**⚠️ Pourquoi pas les autres options ?**

Un cluster par service (B) est une réponse coûteuse à un problème d'autorisation. Des clés d'accès en variables d'environnement (D) sont une mauvaise pratique. Le rôle d'exécution (C) sert à ECS pour extraire l'image et écrire les journaux, pas à l'application.

> 💡 **À retenir** — ECS/EKS = un rôle par tâche (task role sur ECS, IRSA ou Pod Identity sur EKS), jamais le rôle de l'instance partagé par tous les conteneurs.

---

<a id="c158"></a>

### Corrigé — Question 158

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q158)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Instrumenter les services avec AWS X-Ray pour obtenir des traces distribuées et une carte des services avec les latences par segment.</span>

**Pourquoi cette réponse ?**

AWS X-Ray collecte des traces distribuées : chaque requête est suivie de service en service, avec le temps passé dans chaque segment et sous-segment, et une carte des services met en évidence les dépendances lentes ou en erreur.

**⚠️ Pourquoi pas les autres options ?**

Une rétention de journaux plus longue (B) ne corrèle pas les appels. Les journaux de flux (D) restent au niveau réseau. La surveillance détaillée (A) fournit des métriques d'instance, pas le chemin d'une requête.

> 💡 **À retenir** — visibilité d'une requête à travers plusieurs services (« workload visibility ») = AWS X-Ray. Métriques et alarmes = CloudWatch. Traçabilité des appels d'API = CloudTrail.

---

<a id="c159"></a>

### Corrigé — Question 159

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q159)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Une tâche AWS Glue (Spark serverless) planifiée, avec un crawler alimentant le catalogue de données AWS Glue.</span>

**Pourquoi cette réponse ?**

AWS Glue exécute des tâches Spark sans serveur : la capacité est provisionnée pour la durée du traitement, les transformations écrivent en Parquet partitionné, et le crawler met à jour le catalogue de données utilisé ensuite par Athena ou Redshift Spectrum.

**⚠️ Pourquoi pas les autres options ?**

Un cluster EMR permanent (C) facture l'inactivité. Lambda (A) est limité en durée et en mémoire pour ce volume. Un serveur ETL (B) rétablit la gestion d'infrastructure.

> 💡 **À retenir** — ETL serverless planifié avec catalogage = AWS Glue. Traitement massif avec contrôle fin du cluster Spark = EMR. Requêtes SQL ponctuelles = Athena.

---

<a id="c160"></a>

### Corrigé — Question 160

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q160)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Configurer un écouteur HTTPS sur l'Application Load Balancer avec un certificat ACM, et configurer le groupe cible en HTTPS afin que la connexion vers les instances soit également chiffrée.</span>

**Pourquoi cette réponse ?**

Le chiffrement de bout en bout impose deux segments chiffrés : le client vers l'Application Load Balancer (écouteur HTTPS avec certificat ACM) et l'Application Load Balancer vers les cibles (protocole HTTPS sur le groupe cible). L'ALB déchiffre puis rechiffre vers les instances.

**⚠️ Pourquoi pas les autres options ?**

Le HTTP interne (D) laisse le second segment en clair, ce que la politique interdit. Un NLB en TCP (A) ne fournit pas de terminaison TLS gérée avec ACM sur ce schéma. Le chiffrement EBS (B) porte sur les données au repos.

> 💡 **À retenir** — « chiffrement de bout en bout » = HTTPS jusqu'aux cibles, pas seulement jusqu'au load balancer. Les certificats des instances backend peuvent être auto-signés, l'ALB ne les valide pas.

---

<a id="c161"></a>

### Corrigé — Question 161

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q161)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Déployer des règles AWS Config managées avec des actions de remédiation automatique s'appuyant sur AWS Systems Manager Automation.</span>

**Pourquoi cette réponse ?**

AWS Config évalue en continu la configuration des ressources par rapport à des règles managées ou personnalisées, et peut déclencher une remédiation automatique via Systems Manager Automation (chiffrer un volume, révoquer une règle de groupe de sécurité, activer une journalisation).

**⚠️ Pourquoi pas les autres options ?**

L'analyse manuelle des journaux (B) et le traitement à la main des résultats GuardDuty (C) ne corrigent rien automatiquement. Interdire la création de groupes de sécurité (A) bloquerait les équipes.

> 💡 **À retenir** — détection continue de conformité + correction automatique = AWS Config (règles + remédiation). Prévention pure = SCP ; détection de menaces = GuardDuty.

---

<a id="c162"></a>

### Corrigé — Question 162

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q162)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Appliquer des politiques de filtrage (filter policies) sur les abonnements SNS, en s'appuyant sur les attributs des messages.</span>

**Pourquoi cette réponse ?**

Les politiques de filtrage SNS évaluent les attributs (ou le corps) du message au niveau de chaque abonnement : seuls les messages correspondants sont livrés à la file concernée. Les producteurs et les consommateurs restent inchangés, et le coût de livraison inutile disparaît.

**⚠️ Pourquoi pas les autres options ?**

Une rubrique par type (B) impose de modifier les producteurs à chaque évolution. Filtrer côté consommateur (A) est exactement le gaspillage à supprimer. Une file FIFO unique (D) casse le modèle de diffusion.

> 💡 **À retenir** — filtrage à la source dans un modèle pub/sub = filter policies SNS (ou motifs d'événement EventBridge). Ne jamais livrer pour rejeter ensuite.

---

<a id="c163"></a>

### Corrigé — Question 163

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q163)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Amazon FSx for NetApp ONTAP, qui prend en charge NFS et SMB simultanément.</span>

**Pourquoi cette réponse ?**

Amazon FSx for NetApp ONTAP expose les mêmes données en NFS, SMB et iSCSI, avec les fonctions ONTAP : instantanés, clonage instantané, déduplication, compression et hiérarchisation automatique vers un palier de capacité moins coûteux.

**⚠️ Pourquoi pas les autres options ?**

EFS (A) ne parle que NFS. S3 avec Transfer Family (C) n'est pas un serveur de fichiers d'entreprise. EBS (B) n'est pas un partage multiprotocole.

> 💡 **À retenir** — accès multiprotocole simultané NFS + SMB avec fonctions NAS avancées = FSx for NetApp ONTAP. Windows seul = FSx for Windows ; Linux seul = EFS ; HPC = FSx for Lustre.

---

<a id="c164"></a>

### Corrigé — Question 164

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q164)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Activer AWS Cost and Usage Report vers un compartiment Amazon S3, puis interroger les données avec Amazon Athena.</span>

**Pourquoi cette réponse ?**

Le Cost and Usage Report est la source la plus détaillée : une ligne par ressource et par heure, avec les étiquettes, livrée dans S3. Interrogé avec Athena (et visualisé dans QuickSight), il autorise n'importe quelle analyse SQL sur l'historique.

**⚠️ Pourquoi pas les autres options ?**

Le tableau de bord de facturation (A) reste agrégé. Des captures d'écran (C) ne sont pas exploitables. AWS Budgets (D) alerte mais n'analyse pas.

> 💡 **À retenir** — granularité croissante : tableau de bord de facturation → Cost Explorer (analyse visuelle, prévisions) → Cost and Usage Report + Athena (détail horaire par ressource).

---

<a id="c165"></a>

### Corrigé — Question 165

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q165)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : C et E</strong></span>

- <span style="color:#1a7f37">**C.** Activer l'authentification IAM pour la base de données et faire générer par les applications un jeton d'authentification temporaire à partir de leur rôle IAM.</span>
- <span style="color:#1a7f37">**E.** Déployer l'instance dans des sous-réseaux privés, sans accessibilité publique, avec un groupe de sécurité n'autorisant que le groupe de sécurité des serveurs applicatifs.</span>

**Pourquoi cette réponse ?**

Une instance non publique dans des sous-réseaux privés, protégée par un groupe de sécurité qui référence celui des serveurs applicatifs, élimine toute exposition Internet. L'authentification IAM pour RDS remplace le mot de passe statique par un jeton temporaire de 15 minutes généré à partir du rôle IAM de l'application.

**⚠️ Pourquoi pas les autres options ?**

L'accès public filtré par NACL (D) reste une exposition. Un mot de passe dans le dépôt (B) est une fuite en puissance. Un compte partagé (A) supprime la traçabilité.

> 💡 **À retenir** — deux réflexes RDS : jamais d'accessibilité publique, et suppression des secrets statiques (authentification IAM ou rotation par Secrets Manager).

---

<a id="c166"></a>

### Corrigé — Question 166

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q166)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** La mise à l'échelle prédictive (predictive scaling), qui apprend l'historique et provisionne la capacité avant la montée de charge.</span>

**Pourquoi cette réponse ?**

La mise à l'échelle prédictive analyse jusqu'à 14 jours d'historique pour prévoir la charge et provisionne la capacité avant la montée, ce qui supprime le retard des politiques réactives sur les motifs récurrents. Elle se combine avec le suivi de cible pour l'imprévu.

**⚠️ Pourquoi pas les autres options ?**

Un seuil abaissé (B) déclenche des oscillations. Une politique simple (C) réagit encore plus tard. Une capacité fixe élevée (A) coûte cher le reste de la semaine.

> 💡 **À retenir** — motif récurrent appris automatiquement = predictive scaling ; horaire connu et fixe = scheduled scaling ; variation quelconque = target tracking.

---

<a id="c167"></a>

### Corrigé — Question 167

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q167)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Un déploiement RDS Multi-AZ avec cluster de base de données (Multi-AZ DB cluster), composé d'une instance d'écriture et de deux instances de secours lisibles.</span>

**Pourquoi cette réponse ?**

Le déploiement Multi-AZ avec cluster de base de données RDS comprend une instance d'écriture et deux instances de secours, réparties sur trois zones. La réplication semi-synchrone permet un basculement typiquement inférieur à 35 secondes, et les deux instances de secours acceptent du trafic de lecture.

**⚠️ Pourquoi pas les autres options ?**

Le Multi-AZ classique (D) offre un basculement de 60 à 120 secondes et une instance de secours non lisible. Un réplica interrégional (B) ne bascule pas automatiquement. Le Single-AZ (A) ne répond à aucune des exigences.

> 💡 **À retenir** — distinguer les trois options RDS : Single-AZ, Multi-AZ instance (secours non lisible), Multi-AZ DB cluster (deux secours lisibles, bascule plus rapide).

---

<a id="c168"></a>

### Corrigé — Question 168

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q168)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : A et C</strong></span>

- <span style="color:#1a7f37">**A.** Passer la table en mode de capacité provisionnée avec Auto Scaling, la charge étant désormais prévisible.</span>
- <span style="color:#1a7f37">**C.** Limiter les projections des index secondaires globaux aux seuls attributs réellement interrogés.</span>

**Pourquoi cette réponse ?**

Le mode à la demande coûte environ six à sept fois plus cher par requête que le mode provisionné : dès que la charge devient prévisible, le passage au mode provisionné avec Auto Scaling réduit fortement la facture. Limiter les projections des index secondaires globaux diminue le stockage dupliqué et les unités d'écriture consommées à chaque mise à jour.

**⚠️ Pourquoi pas les autres options ?**

Doubler la capacité (B) augmente le coût. Supprimer la restauration à un instant donné (D) sacrifie la protection des données pour un gain minime. Remplacer les index par des `Scan` (E) coûterait beaucoup plus cher.

> 💡 **À retenir** — chaque index secondaire global est une table supplémentaire, facturée en stockage et en écritures. Projeter uniquement ce qui est interrogé, et réévaluer régulièrement le mode de capacité.

---

<a id="c169"></a>

### Corrigé — Question 169

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q169)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Dans AWS Artifact, qui met à disposition les rapports de conformité et les accords d'AWS.</span>

**Pourquoi cette réponse ?**

AWS Artifact est le portail en libre-service qui met à disposition les rapports d'audit d'AWS (SOC, ISO, PCI DSS, HIPAA) ainsi que les accords tels que le BAA ou l'avenant relatif au traitement des données.

**⚠️ Pourquoi pas les autres options ?**

Security Hub (B) mesure la posture de sécurité du client. Le support (D) n'est pas le canal prévu. AWS Config (C) évalue la conformité des ressources du client, pas celle d'AWS.

> 💡 **À retenir** — dans le modèle de responsabilité partagée, la conformité « du » cloud se prouve avec AWS Artifact ; la conformité « dans » le cloud relève du client (Config, Security Hub, Audit Manager).

---

<a id="c170"></a>

### Corrigé — Question 170

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q170)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : C et D</strong></span>

- <span style="color:#1a7f37">**C.** Intégrer Amazon API Gateway directement à une file Amazon SQS afin d'absorber les requêtes, puis les traiter de façon asynchrone.</span>
- <span style="color:#1a7f37">**D.** Configurer une concurrence réservée sur la fonction Lambda consommatrice afin de limiter le nombre de connexions simultanées vers la base.</span>

**Pourquoi cette réponse ?**

L'intégration directe d'API Gateway avec SQS accepte les requêtes à très haut débit et les met en tampon durable, sans exécuter de code de réception. La concurrence réservée sur la fonction consommatrice plafonne le nombre d'exécutions simultanées, donc le nombre de connexions ouvertes vers la base : le tampon absorbe la rafale et la base reste protégée.

**⚠️ Pourquoi pas les autres options ?**

Une concurrence illimitée (B) et la suppression du throttling (A) reviennent à faire tomber la base. Le traitement synchrone avec erreurs (E) perd des requêtes.

> 💡 **À retenir** — protéger une ressource lente derrière une file, et utiliser la concurrence réservée de Lambda comme limiteur de débit vers les dépendances fragiles.

---

<a id="c171"></a>

### Corrigé — Question 171

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q171)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Utiliser une API HTTP d'Amazon API Gateway, moins coûteuse et à latence plus faible que l'API REST pour les intégrations simples.</span>

**Pourquoi cette réponse ?**

Les API HTTP d'API Gateway coûtent jusqu'à 71 % moins cher que les API REST et présentent une latence plus faible. Elles conviennent parfaitement à un proxy Lambda simple, avec autorisation JWT ou IAM, quand les fonctionnalités avancées des API REST ne sont pas nécessaires.

**⚠️ Pourquoi pas les autres options ?**

Conserver l'API REST (A) maintient le surcoût. Un ALB (B) impose de gérer soi-même l'authentification et les quotas. Exposer des URL de fonction sans passerelle (C) supprime tout contrôle centralisé.

> 💡 **À retenir** — API HTTP = moins cher, plus rapide, fonctionnalités essentielles. API REST = plans d'utilisation, clés d'API, cache, validation et transformations avancées. Choisir selon les fonctions réellement utilisées.

---

<a id="c172"></a>

### Corrigé — Question 172

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q172)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Ajouter aux politiques de ressource une condition `aws:PrincipalOrgID` correspondant à l'identifiant de l'organisation.</span>

**Pourquoi cette réponse ?**

La clé de condition globale `aws:PrincipalOrgID` compare l'organisation du principal appelant à celle attendue : tous les comptes présents et futurs de l'organisation sont autorisés, et aucun principal externe ne l'est, sans maintenance de liste.

**⚠️ Pourquoi pas les autres options ?**

L'énumération des comptes (D) devient vite ingérable. Un compartiment public (B) est une faille. Un utilisateur IAM partagé (A) supprime la traçabilité et multiplie les risques.

> 💡 **À retenir** — restreindre une politique de ressource au périmètre d'une organisation = `aws:PrincipalOrgID` (ou `aws:PrincipalOrgPaths` pour une unité organisationnelle précise).

---

<a id="c173"></a>

### Corrigé — Question 173

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q173)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Déployer une NAT gateway dans chaque zone de disponibilité et router chaque sous-réseau privé vers la NAT gateway de sa propre zone.</span>

**Pourquoi cette réponse ?**

Une NAT gateway est un service redondant à l'intérieur de sa zone de disponibilité, mais elle disparaît avec cette zone. Déployer une NAT gateway par zone, avec une table de routage propre à chaque sous-réseau privé, supprime ce point de défaillance et réduit en outre le trafic facturé entre zones.

**⚠️ Pourquoi pas les autres options ?**

Une instance NAT (A) est moins disponible et plus limitée. Un NLB devant une NAT gateway (D) n'est pas une configuration prise en charge. Une route vers la passerelle Internet (C) rendrait les sous-réseaux publics.

> 💡 **À retenir** — haute disponibilité de la sortie Internet = une NAT gateway par zone de disponibilité + routage local par zone. Le gain est double : résilience et réduction des frais inter-zones.

---

<a id="c174"></a>

### Corrigé — Question 174

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q174)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** La restitution en masse (Bulk), dont le délai est de 5 à 12 heures pour le coût le plus bas.</span>

**Pourquoi cette réponse ?**

Avec deux jours devant soi, la restitution en masse (Bulk) — de 5 à 12 heures pour Glacier Flexible Retrieval — respecte largement le délai tout en offrant le tarif de restitution le plus bas, particulièrement avantageux sur 30 To.

**⚠️ Pourquoi pas les autres options ?**

L'option accélérée (A) est la plus chère. La restitution standard (D) coûte davantage sans nécessité. Copier en amont vers S3 Standard (B) suppose déjà une restitution.

> 💡 **À retenir** — dans Glacier, choisir toujours le mode de restitution le plus lent compatible avec le délai exigé : Expedited (minutes) > Standard (heures) > Bulk (le moins cher).

---

<a id="c175"></a>

### Corrigé — Question 175

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q175)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : B et E</strong></span>

- <span style="color:#1a7f37">**B.** Mettre en œuvre le motif « cache-aside » (lazy loading) : lire d'abord le cache, interroger la base uniquement en cas d'absence, puis alimenter le cache.</span>
- <span style="color:#1a7f37">**E.** Définir une durée de vie (TTL) sur les entrées du cache et invalider explicitement les clés concernées lors des mises à jour du catalogue.</span>

**Pourquoi cette réponse ?**

Le cache-aside ne remplit le cache qu'avec les données réellement demandées, ce qui évite de charger inutilement l'ensemble du catalogue et supprime la majorité des lectures en base. Le TTL borne la fraîcheur, et l'invalidation explicite lors des mises à jour supprime les données obsolètes dès qu'elles changent.

**⚠️ Pourquoi pas les autres options ?**

Précharger sans expiration (A) garantit des données périmées. Désactiver le cache aux heures de pointe (C) reproduit la surcharge. Un cache local par instance (D) crée des incohérences entre instances.

> 💡 **À retenir** — stratégies de cache : lazy loading (cache-aside) pour ne stocker que l'utile, write-through pour une fraîcheur maximale, TTL et invalidation pour gérer l'obsolescence. Toujours prévoir une politique d'expiration.

---

<a id="c176"></a>

### Corrigé — Question 176

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q176)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Activer AWS Security Hub avec un compte administrateur délégué agrégeant les résultats de tous les comptes et Régions.</span>

**Pourquoi cette réponse ?**

AWS Security Hub normalise les résultats des services de sécurité AWS et des partenaires au format ASFF, les agrège entre comptes et Régions via un compte administrateur délégué, les priorise et mesure la conformité à des normes comme les bonnes pratiques fondamentales AWS ou le CIS.

**⚠️ Pourquoi pas les autres options ?**

Des tableaux CloudWatch (D) ne normalisent pas les alertes. L'analyse manuelle (C) ne passe pas à l'échelle. Detective (A) sert à l'investigation approfondie, pas à l'agrégation de posture.

> 💡 **À retenir** — Security Hub = point de consolidation de la sécurité multi-comptes ; GuardDuty, Inspector, Macie et Config sont ses sources ; Detective analyse ensuite la chronologie d'un incident.

---

<a id="c177"></a>

### Corrigé — Question 177

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q177)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Configurer la récupération automatique de l'instance EC2 (auto recovery) via une action d'alarme CloudWatch sur les contrôles d'état système.</span>

**Pourquoi cette réponse ?**

La récupération automatique redémarre l'instance sur un hôte physique sain lorsqu'un contrôle d'état système échoue, en conservant l'identifiant d'instance, l'adresse IP privée, les adresses Elastic IP et les volumes EBS attachés. La configuration se fait par une alarme CloudWatch avec action de récupération.

**⚠️ Pourquoi pas les autres options ?**

Un instantané quotidien (B) ne rétablit pas le service. La protection contre la terminaison (A) n'empêche pas une panne matérielle. Un groupe de placement (C) ne traite pas la reprise.

> 💡 **À retenir** — instance unique non répartissable = auto recovery (panne matérielle) ; l'ASG min=max=1 sur plusieurs zones couvre en plus la perte d'une zone de disponibilité.

---

<a id="c178"></a>

### Corrigé — Question 178

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q178)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Créer des points de terminaison VPC de type Interface pour ECR (api et dkr) et CloudWatch Logs, ainsi qu'un point de terminaison de type Gateway pour S3, afin que ce trafic ne passe plus par les NAT gateways.</span>

**Pourquoi cette réponse ?**

Chaque gigaoctet traversant une NAT gateway est facturé en plus du coût horaire. Les points de terminaison VPC détournent ce trafic vers le réseau AWS : le point de terminaison de type Gateway pour S3 est gratuit, et les points de terminaison Interface pour ECR et CloudWatch Logs coûtent bien moins cher que le traitement NAT sur ces volumes.

**⚠️ Pourquoi pas les autres options ?**

Il n'existe pas de « taille » de NAT gateway (C). Exposer les tâches en sous-réseau public (D) dégrade la sécurité. Réduire les déploiements (A) contraint les équipes.

> 💡 **À retenir** — trafic élevé vers des services AWS depuis des sous-réseaux privés = points de terminaison VPC, pour la sécurité comme pour le coût. Les images de conteneurs (ECR) et les journaux sont les gros consommateurs typiques.

---

<a id="c179"></a>

### Corrigé — Question 179

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q179)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Utiliser Amazon QuickSight avec son moteur en mémoire SPICE, connecté à Athena.</span>

**Pourquoi cette réponse ?**

Amazon QuickSight est un service de BI serverless facturé à l'usage ou par utilisateur. Son moteur SPICE conserve les jeux de données en mémoire, ce qui donne des tableaux de bord rapides sans solliciter Athena à chaque interaction, et les utilisateurs métier construisent eux-mêmes leurs analyses.

**⚠️ Pourquoi pas les autres options ?**

Une application maison (B) et un outil sur EMR (D) reviennent à exploiter une infrastructure. Des fichiers de tableur (C) ne fournissent ni interactivité ni fraîcheur.

> 💡 **À retenir** — visualisation managée sur des données AWS = Amazon QuickSight, avec SPICE pour les performances et la maîtrise du coût des requêtes.

---

<a id="c180"></a>

### Corrigé — Question 180

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q180)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Utiliser des clés multi-Régions AWS KMS (multi-Region keys), répliquées dans les deux Régions avec le même matériel de clé.</span>

**Pourquoi cette réponse ?**

Les clés multi-Régions KMS partagent le même identifiant de clé et le même matériel cryptographique dans plusieurs Régions. Un objet chiffré dans une Région peut être déchiffré par la réplique de la clé dans l'autre Région, ce qui simplifie la réplication interrégionale et les scénarios de reprise.

**⚠️ Pourquoi pas les autres options ?**

Des clés indépendantes (C) fonctionnent mais imposent un rechiffrement et compliquent la reprise. SSE-C (D) transfère la charge des clés à l'application. Désactiver le chiffrement (B) est exclu.

> 💡 **À retenir** — réplication interrégionale de données chiffrées = clés multi-Régions KMS. Par défaut, une clé KMS est régionale et ne peut pas être utilisée hors de sa Région.

---

<a id="c181"></a>

### Corrigé — Question 181

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q181)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** L'entreprise est responsable des correctifs du système d'exploitation invité des instances EC2, de la configuration des groupes de sécurité et des données ; AWS est responsable de l'infrastructure physique et du correctif du moteur de base de données géré.</span>

**Pourquoi cette réponse ?**

AWS assure la sécurité « du » cloud : matériel, installations, réseau physique, hyperviseur et, pour les services managés comme RDS, le système d'exploitation et le moteur de base de données. Le client assure la sécurité « dans » le cloud : correctifs du système invité sur EC2, configuration réseau (groupes de sécurité, NACL), gestion des identités, chiffrement et données.

Les options A, C et D inversent les responsabilités.

> 💡 **À retenir** — plus un service est managé, plus la part d'AWS augmente. Sur EC2, le client patche le système ; sur RDS, AWS patche le moteur ; sur Lambda ou S3, il ne reste au client que les données, les permissions et la configuration.

---

<a id="c182"></a>

### Corrigé — Question 182

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q182)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Aurora Backtrack, qui ramène le cluster à un point antérieur dans le temps sans restauration.</span>

**Pourquoi cette réponse ?**

Aurora Backtrack ramène le cluster à un instant antérieur en quelques minutes, sans restaurer d'instantané ni créer un nouveau cluster, en s'appuyant sur les enregistrements de modifications conservés selon la fenêtre configurée.

**⚠️ Pourquoi pas les autres options ?**

Supprimer les lignes à la main (B) est risqué et souvent impossible. Promouvoir un réplica (D) conserve les données erronées, déjà répliquées. Un export puis import partiel (A) prendrait beaucoup plus de temps.

> 💡 **À retenir** — Backtrack est propre à Aurora MySQL et doit être activé à l'avance. Pour les autres moteurs, la réponse à une erreur applicative reste la restauration à un instant donné vers une nouvelle instance.

---

<a id="c183"></a>

### Corrigé — Question 183

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q183)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Augmenter directement le débit provisionné et les IOPS du volume gp3, indépendamment de sa taille.</span>

**Pourquoi cette réponse ?**

Les volumes gp3 dissocient la capacité, les IOPS et le débit : on peut provisionner jusqu'à 16 000 IOPS et 1 000 Mo/s indépendamment de la taille, sans surpayer de l'espace inutilisé — c'est l'un des principaux avantages de gp3 sur gp2.

**⚠️ Pourquoi pas les autres options ?**

Agrandir le volume (A) est le comportement de gp2, coûteux ici. Revenir à gp2 (C) est un retour en arrière. Un second volume (D) complexifie l'application.

> 💡 **À retenir** — avec gp2, les performances dépendent de la taille ; avec gp3, elles se configurent séparément. C'est aussi pourquoi gp3 est presque toujours moins cher à performance égale.

---

<a id="c184"></a>

### Corrigé — Question 184

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q184)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Exécuter les nœuds principaux (primary) et les nœuds core sur des instances à la demande, et les nœuds task sur des instances Spot.</span>

**Pourquoi cette réponse ?**

Dans EMR, le nœud primaire et les nœuds core hébergent respectivement la coordination et HDFS : les perdre compromet le cluster. Les nœuds task ne stockent pas de données et sont donc les candidats idéaux aux instances Spot, avec des remises importantes et un impact limité en cas de récupération.

**⚠️ Pourquoi pas les autres options ?**

Tout le cluster en Spot (C) expose à la perte du nœud primaire. Le tout à la demande (D) est le plus coûteux. Des réservations de 3 ans (A) ne conviennent pas à un usage nocturne transitoire.

> 💡 **À retenir** — EMR = primaire et core en à la demande (ou réservé), task en Spot. Règle générale : le Spot pour ce qui est sans état et remplaçable.

---

<a id="c185"></a>

### Corrigé — Question 185

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q185)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Activer le chiffrement par défaut du compartiment et ajouter une politique de compartiment refusant les requêtes `s3:PutObject` dont l'en-tête de chiffrement demandé n'est pas conforme.</span>

**Pourquoi cette réponse ?**

Le chiffrement par défaut garantit que tout objet déposé est chiffré, y compris lorsque le client ne demande rien. Y ajouter une politique de compartiment refusant les dépôts dont l'en-tête `x-amz-server-side-encryption` ne correspond pas au chiffrement attendu rend l'exigence explicite et vérifiable, notamment lorsqu'une clé KMS précise est imposée.

**⚠️ Pourquoi pas les autres options ?**

Une consigne aux développeurs (B) n'est pas un contrôle. Block Public Access (A) traite l'exposition publique. Un chiffrement a posteriori (D) laisse une fenêtre d'exposition.

> 💡 **À retenir** — combiner chiffrement par défaut (filet de sécurité) et politique de refus conditionnelle (contrôle explicite) est le schéma recommandé pour imposer le chiffrement dans S3.

---

<a id="c186"></a>

### Corrigé — Question 186

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q186)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Déployer AWS Storage Gateway en mode Tape Gateway, qui présente une librairie de bandes virtuelles au logiciel existant et archive les bandes dans S3 Glacier.</span>

**Pourquoi cette réponse ?**

Tape Gateway présente une librairie de bandes virtuelles via iSCSI/VTL au logiciel de sauvegarde existant : les bandes virtuelles sont stockées dans S3 puis archivées dans S3 Glacier. Les procédures et le logiciel restent inchangés, les bandes physiques et les transports hors site disparaissent.

**⚠️ Pourquoi pas les autres options ?**

Une copie CLI (C) contourne le logiciel de sauvegarde. Remplacer le logiciel (B) est exactement ce que l'entreprise veut éviter. DataSync vers EFS (D) ne s'intègre pas à une librairie de bandes.

> 💡 **À retenir** — Storage Gateway a trois modes : File (NFS/SMB vers S3), Volume (iSCSI en blocs), Tape (VTL vers Glacier). Le mode Tape est la réponse aux sauvegardes sur bande héritées.

---

<a id="c187"></a>

### Corrigé — Question 187

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q187)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : B et D</strong></span>

- <span style="color:#1a7f37">**B.** Utiliser l'algorithme de routage « least outstanding requests » sur le groupe cible pour éviter d'envoyer des requêtes aux cibles déjà surchargées.</span>
- <span style="color:#1a7f37">**D.** Vérifier que l'équilibrage entre zones (cross-zone load balancing) est activé afin que le trafic soit réparti entre toutes les cibles saines, quelle que soit leur zone.</span>

**Pourquoi cette réponse ?**

Sans équilibrage entre zones, le load balancer répartit d'abord le trafic également entre les zones, puis entre les cibles de chaque zone : une zone contenant peu d'instances les surcharge. L'activer répartit sur l'ensemble des cibles saines. L'algorithme « least outstanding requests » envoie ensuite chaque requête à la cible ayant le moins de requêtes en cours, ce qui protège les instances lentes.

**⚠️ Pourquoi pas les autres options ?**

Désactiver les contrôles de santé (A) enverrait du trafic à des cibles défaillantes. Les sessions persistantes (C) aggravent le déséquilibre. Un load balancer par zone (E) supprime la répartition globale.

> 💡 **À retenir** — l'équilibrage entre zones est activé par défaut sur l'Application Load Balancer, mais désactivé par défaut sur le Network Load Balancer — un piège classique en cas de déséquilibre de capacité entre zones.

---

<a id="c188"></a>

### Corrigé — Question 188

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q188)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Activer les clés de compartiment S3 (S3 Bucket Keys), qui réduisent fortement le nombre d'appels à AWS KMS.</span>

**Pourquoi cette réponse ?**

Les clés de compartiment S3 créent une clé de niveau compartiment, dérivée de la clé KMS, utilisée pour chiffrer les objets pendant une durée limitée. Le nombre d'appels à KMS chute d'environ 99 %, ainsi que le coût associé, sans changer le modèle de sécurité ni la clé gérée par le client.

**⚠️ Pourquoi pas les autres options ?**

SSE-C (C) transfère la gestion des clés à l'application. Renoncer au chiffrement (A) est exclu. Une clé par objet (B) multiplierait les coûts et l'administration.

> 💡 **À retenir** — SSE-KMS sur de très gros volumes d'objets = activer les S3 Bucket Keys. C'est une optimisation de coût sans contrepartie de sécurité.

---

<a id="c189"></a>

### Corrigé — Question 189

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q189)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : A et D</strong></span>

- <span style="color:#1a7f37">**A.** Activer l'authentification multifacteur sur l'utilisateur racine, de préférence avec un dispositif matériel.</span>
- <span style="color:#1a7f37">**D.** Supprimer les clés d'accès de l'utilisateur racine et créer des rôles ou des identités fédérées pour les tâches d'administration quotidiennes.</span>

**Pourquoi cette réponse ?**

L'utilisateur racine doit être protégé par une authentification multifacteur, idéalement matérielle, et ne servir qu'aux quelques tâches qui l'exigent. Ses clés d'accès doivent être supprimées : l'administration quotidienne passe par des rôles IAM ou des identités fédérées, traçables et révocables.

**⚠️ Pourquoi pas les autres options ?**

Partager les identifiants racine (C), l'utiliser au quotidien (E) ou créer des clés d'accès racine (B) sont trois anti-modèles majeurs.

> 💡 **À retenir** — premières actions sur un compte AWS : MFA sur le racine, suppression de ses clés d'accès, création d'accès administratifs fédérés, activation de CloudTrail et des alertes de facturation.

---

<a id="c190"></a>

### Corrigé — Question 190

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q190)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Utiliser AWS Step Functions avec un état Map distribué, qui itère à grande échelle sur les objets S3 et invoque des fonctions Lambda en parallèle avec gestion des erreurs.</span>

**Pourquoi cette réponse ?**

L'état Map distribué de Step Functions itère sur des millions d'éléments — y compris la liste des objets d'un compartiment S3 —, exécute jusqu'à 10 000 traitements enfants en parallèle, gère les tolérances d'échec, les nouvelles tentatives et fournit un suivi détaillé, sans serveur.

**⚠️ Pourquoi pas les autres options ?**

Une Lambda unique en boucle (D) se heurte à la limite de 15 minutes. Un script sur EC2 (C) impose une machine et une reprise maison. Le dépôt manuel de messages (A) n'est pas réaliste.

> 💡 **À retenir** — traitement parallèle massif et supervisé sans code d'orchestration = Step Functions Distributed Map. Pour des traitements longs et nombreux avec dépendances = AWS Batch.

---

<a id="c191"></a>

### Corrigé — Question 191

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q191)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Configurer des points de terminaison Route 53 Resolver entrants et sortants, avec des règles de transfert entre le VPC et les serveurs DNS sur site.</span>

**Pourquoi cette réponse ?**

Les points de terminaison Route 53 Resolver entrants permettent aux serveurs sur site d'interroger le résolveur du VPC (donc les zones hébergées privées), tandis que les points de terminaison sortants, associés à des règles de transfert, envoient les requêtes de certains domaines vers les serveurs DNS du centre de données. La résolution devient bidirectionnelle sur la liaison Direct Connect.

**⚠️ Pourquoi pas les autres options ?**

Une zone publique (C) exposerait des noms internes. Des fichiers `hosts` (D) sont ingérables. Des serveurs DNS maison (A) ajoutent une infrastructure à exploiter.

> 💡 **À retenir** — DNS hybride = Route 53 Resolver, point de terminaison entrant (du site vers AWS) et point de terminaison sortant + règles (d'AWS vers le site).

---

<a id="c192"></a>

### Corrigé — Question 192

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q192)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Amazon Detective, qui agrège et corrèle automatiquement CloudTrail, les journaux de flux VPC et les résultats GuardDuty pour l'analyse d'incident.</span>

**Pourquoi cette réponse ?**

Amazon Detective ingère automatiquement CloudTrail, les journaux de flux VPC et les résultats GuardDuty, construit un graphe de comportements et présente des visualisations chronologiques permettant de répondre rapidement au « que s'est-il passé ? » sur plusieurs semaines.

**⚠️ Pourquoi pas les autres options ?**

Trusted Advisor (A) formule des recommandations. AWS Config (C) montre les changements de configuration, pas le comportement réseau ni les appels d'API corrélés. CloudWatch Logs Insights (D) ne couvre que les journaux fournis.

> 💡 **À retenir** — GuardDuty détecte, Security Hub consolide, Detective investigue. Trois rôles complémentaires dans la chaîne de réponse aux incidents.

---

<a id="c193"></a>

### Corrigé — Question 193

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q193)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : C</strong></span>

- <span style="color:#1a7f37">**C.** Activer DynamoDB Streams sur la table et déclencher une fonction AWS Lambda qui alimente les systèmes cibles, avec gestion des erreurs et rejeu.</span>

**Pourquoi cette réponse ?**

DynamoDB Streams publie, dans l'ordre et de façon durable, chaque modification d'élément. Une fonction Lambda déclenchée par le flux propage les changements vers le moteur de recherche et le système d'audit, avec nouvelles tentatives, fenêtre de rejeu de 24 heures et destination d'échec.

**⚠️ Pourquoi pas les autres options ?**

Des `Scan` périodiques (A) sont coûteux et manquent les modifications intermédiaires. Des appels synchrones (D) couplent l'écriture aux systèmes en aval. Un export quotidien (B) n'est pas du quasi temps réel.

> 💡 **À retenir** — propager les changements d'une table DynamoDB = DynamoDB Streams + Lambda. C'est le socle des architectures pilotées par les événements autour de DynamoDB.

---

<a id="c194"></a>

### Corrigé — Question 194

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q194)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : D et E</strong></span>

- <span style="color:#1a7f37">**D.** Acheminer le trafic récurrent vers le centre de données via AWS Direct Connect, dont le tarif de transfert de données sortant est inférieur à celui d'Internet.</span>
- <span style="color:#1a7f37">**E.** Servir le contenu statique via Amazon CloudFront afin de réduire le trafic sortant facturé depuis l'origine et de bénéficier de tarifs de diffusion plus avantageux.</span>

**Pourquoi cette réponse ?**

Le transfert de données sortant via Direct Connect bénéficie d'un tarif nettement inférieur à celui de la sortie Internet, ce qui devient déterminant sur plusieurs centaines de téraoctets mensuels. CloudFront réduit de son côté le trafic servi directement depuis l'origine et applique des tarifs de diffusion plus avantageux, avec des remises contractuelles possibles.

**⚠️ Pourquoi pas les autres options ?**

Des instances plus grandes (B) ne changent pas le prix au gigaoctet. Le chiffrement ne compresse pas (A). Aucune Région n'offre un transfert sortant gratuit vers Internet (C).

> 💡 **À retenir** — le coût du transfert se traite à la source : moins de sortie (cache CloudFront), un chemin moins cher (Direct Connect), et pas de trajets inutiles (points de terminaison VPC, localité des données).

---

<a id="c195"></a>

### Corrigé — Question 195

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q195)</sub>

<span style="color:#1a7f37"><strong>✅ Réponses correctes : A et D</strong></span>

- <span style="color:#1a7f37">**A.** Agréger plusieurs connexions Direct Connect en un groupe d'agrégation de liens (LAG) pour additionner leur bande passante.</span>
- <span style="color:#1a7f37">**D.** Établir une seconde connexion Direct Connect dans un emplacement Direct Connect différent, et prévoir un VPN de secours.</span>

**Pourquoi cette réponse ?**

Un LAG agrège plusieurs connexions Direct Connect de même débit sur un même emplacement et présente une bande passante cumulée gérée comme une seule connexion logique. Pour supprimer le point de défaillance unique, il faut en outre une seconde connexion dans un autre emplacement Direct Connect, complétée par un VPN de secours pour les scénarios dégradés.

**⚠️ Pourquoi pas les autres options ?**

Désactiver le chiffrement (E) ne libère pas de bande passante significative et dégrade la sécurité. L'appairage de VPC (C) et la NAT gateway (B) ne concernent pas la connectivité avec le centre de données.

> 💡 **À retenir** — résilience Direct Connect = plusieurs connexions, sur plusieurs emplacements et plusieurs routeurs, avec un VPN en repli. Débit = LAG ou connexion de capacité supérieure.

---

<a id="c196"></a>

### Corrigé — Question 196

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q196)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** AWS Audit Manager, qui collecte en continu les preuves et les associe à des cadres de conformité prédéfinis.</span>

**Pourquoi cette réponse ?**

AWS Audit Manager collecte automatiquement et en continu les preuves (configurations, appels d'API, résultats de conformité), les associe aux contrôles de cadres prédéfinis (RGPD, PCI DSS, ISO, HIPAA) ou personnalisés, et produit des rapports d'audit prêts à être remis.

**⚠️ Pourquoi pas les autres options ?**

Cost Explorer (C) concerne les coûts. Macie (D) découvre des données sensibles. Systems Manager Inventory (A) recense les logiciels installés, sans cadre de conformité.

> 💡 **À retenir** — Artifact = preuves de conformité d'AWS ; Audit Manager = collecte automatisée des preuves du client ; Config = conformité technique continue des ressources.

---

<a id="c197"></a>

### Corrigé — Question 197

<sub>Domaine 2 — Concevoir des architectures résilientes · [Revenir à l'énoncé ↑](#q197)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Sélectionner une Région AWS de l'Union européenne répondant à l'exigence de résidence des données, en privilégiant parmi celles-ci la plus proche des utilisateurs, puis déployer sur plusieurs zones de disponibilité.</span>

**Pourquoi cette réponse ?**

La résidence des données est une contrainte réglementaire non négociable : elle restreint d'abord l'ensemble des Régions possibles. Parmi les Régions conformes, on choisit ensuite la plus proche des utilisateurs pour la latence, puis on déploie sur plusieurs zones de disponibilité pour la disponibilité.

**⚠️ Pourquoi pas les autres options ?**

Le coût seul (C) ne peut pas primer sur une obligation légale. Une zone unique (A) sacrifie la disponibilité. Une Région américaine avec CloudFront (B) ne satisfait pas l'exigence de résidence, CloudFront ne déplaçant pas le stockage.

> 💡 **À retenir** — ordre de sélection d'une Région : conformité et résidence des données → latence pour les utilisateurs → disponibilité des services nécessaires → coût.

---

<a id="c198"></a>

### Corrigé — Question 198

<sub>Domaine 4 — Concevoir des architectures à coûts optimisés · [Revenir à l'énoncé ↑](#q198)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : D</strong></span>

- <span style="color:#1a7f37">**D.** Utiliser la classe de table DynamoDB Standard-Infrequent Access pour les données peu consultées.</span>

**Pourquoi cette réponse ?**

La classe de table DynamoDB Standard-IA réduit le coût de stockage d'environ 60 % en échange d'un coût de lecture et d'écriture plus élevé : c'est exactement le profil de données volumineuses rarement consultées mais devant rester disponibles immédiatement.

**⚠️ Pourquoi pas les autres options ?**

Le mode à la demande (C) agit sur le débit, pas sur le stockage. Supprimer les données (A) contredit l'exigence de disponibilité. Des index supplémentaires (B) augmenteraient encore le stockage.

> 💡 **À retenir** — DynamoDB propose deux classes de table — Standard et Standard-IA. Lorsque le stockage domine la facture devant le débit, la classe Standard-IA est la bonne réponse.

---

<a id="c199"></a>

### Corrigé — Question 199

<sub>Domaine 3 — Concevoir des architectures performantes · [Revenir à l'énoncé ↑](#q199)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : A</strong></span>

- <span style="color:#1a7f37">**A.** Exécuter le traitement dans une tâche AWS Fargate déclenchée à la demande, facturée à la durée d'exécution.</span>

**Pourquoi cette réponse ?**

AWS Lambda est limité à 15 minutes d'exécution : un traitement de 25 à 45 minutes est donc exclu. Une tâche Fargate déclenchée à la demande s'exécute sans serveur à gérer, avec la mémoire et le processeur souhaités, et n'est facturée que pendant sa durée d'exécution.

**⚠️ Pourquoi pas les autres options ?**

Lambda (D) échouerait par dépassement de délai. Une instance permanente (B) fait payer 24 h/24 pour quelques heures d'usage. Un cluster EKS dimensionné au maximum (C) est coûteux et lourd à exploiter.

> 💡 **À retenir** — durée d'exécution > 15 minutes = Fargate, ECS/EKS ou AWS Batch, pas Lambda. Vérifier systématiquement les limites de Lambda : 15 minutes, 10 Go de mémoire, 10 Go de stockage éphémère, 6 Mo de charge utile synchrone.

---

<a id="c200"></a>

### Corrigé — Question 200

<sub>Domaine 1 — Concevoir des architectures sécurisées · [Revenir à l'énoncé ↑](#q200)</sub>

<span style="color:#1a7f37"><strong>✅ Réponse correcte : B</strong></span>

- <span style="color:#1a7f37">**B.** Application Load Balancer public protégé par AWS WAF dans les sous-réseaux publics ; instances applicatives et base Amazon RDS dans des sous-réseaux privés avec des groupes de sécurité référencés entre niveaux ; chiffrement SSE-KMS et RDS avec des clés gérées par le client ; administration via AWS Systems Manager Session Manager.</span>

**Pourquoi cette réponse ?**

Cette architecture applique toutes les exigences : seul l'Application Load Balancer est exposé, protégé par AWS WAF ; les couches applicative et base restent dans des sous-réseaux privés, avec des groupes de sécurité qui se référencent entre eux plutôt que des plages d'adresses ; le chiffrement s'appuie sur des clés KMS gérées par le client, dont la politique est maîtrisée ; l'administration passe par Session Manager, sans port entrant ni bastion.

**⚠️ Pourquoi pas les autres options ?**

L'option A expose la base et conserve un bastion SSH. L'option C supprime toute segmentation et stocke des secrets en clair. L'option D rend la base publique et partage des clés SSH.

---

> 💡 **À retenir** — le schéma de référence d'une architecture sécurisée à l'examen : exposition minimale au bord (ALB/CloudFront + WAF), ressources en sous-réseaux privés, groupes de sécurité référencés entre niveaux, chiffrement KMS géré par le client, accès administrateur par Session Manager, journalisation CloudTrail et Config.

---

<a id="partie-6"></a>

# Partie 6 — Annexes

## Annexe A — Grille de score par domaine

Reportez ici votre nombre de bonnes réponses après chaque série. **Tout domaine sous 70 % doit être retravaillé** avec la fiche de réflexes correspondante ([partie 3](#partie-3)) avant de réserver l'examen.

| Domaine | Questions | Bonnes réponses | Score | Verdict |
|---|---|---|---|---|
| **Domaine 1** — Concevoir des architectures sécurisées | 60 | ____ | ____ % | ☐ Acquis ☐ À revoir |
| **Domaine 2** — Concevoir des architectures résilientes | 52 | ____ | ____ % | ☐ Acquis ☐ À revoir |
| **Domaine 3** — Concevoir des architectures performantes | 48 | ____ | ____ % | ☐ Acquis ☐ À revoir |
| **Domaine 4** — Concevoir des architectures à coûts optimisés | 40 | ____ | ____ % | ☐ Acquis ☐ À revoir |
| **Total** | **200** | **____** | **____ %** | Seuil visé : **≥ 80 %** |

> 💡 **À retenir** — L'examen réel se joue à 720/1000, soit environ 72 %. Viser **80 % à l'entraînement** offre la marge nécessaire pour absorber le stress et les formulations inédites du jour J.

---

## Annexe B — Répartition des questions par domaine

Cette annexe est volontairement placée à la fin afin de ne donner aucun indice pendant l'entraînement. Utilisez-la pour cibler vos révisions après correction.

### Domaine 1 — Concevoir des architectures sécurisées (30 % · 60 questions)

> 1, 4, 8, 12, 16, 19, 21, 25, 29, 33, 37, 40, 41, 45, 49, 53, 57, 60, 61, 65, 69, 73, 77, 80, 81, 85, 89, 93, 97, 100, 101, 105, 109, 113, 117, 120, 121, 125, 129, 133, 137, 140, 141, 145, 149, 153, 157, 160, 161, 165, 169, 172, 176, 180, 181, 185, 189, 192, 196, 200

**Fiches de révision associées :** [Fiche 4 — Sécurité et identité](#fiche-4--sécurité-et-identité)

### Domaine 2 — Concevoir des architectures résilientes (26 % · 52 questions)

> 2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62, 66, 70, 74, 78, 82, 86, 87, 90, 98, 102, 106, 110, 114, 118, 122, 126, 130, 134, 138, 142, 146, 150, 154, 158, 162, 166, 167, 170, 173, 177, 182, 186, 187, 190, 193, 197

**Fiches de révision associées :** [Fiche 2 — Bases de données](#fiche-2--bases-de-données) · [Fiche 5 — Calcul, conteneurs et intégration](#fiche-5--calcul-conteneurs-et-intégration)

### Domaine 3 — Concevoir des architectures performantes (24 % · 48 questions)

> 3, 7, 11, 15, 20, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59, 63, 67, 71, 75, 79, 83, 91, 94, 95, 99, 103, 107, 111, 115, 119, 123, 127, 131, 135, 139, 143, 147, 151, 155, 159, 163, 171, 175, 179, 183, 191, 195, 199

**Fiches de révision associées :** [Fiche 1 — Stockage](#fiche-1--stockage-s3-ebs-efs-fsx) · [Fiche 3 — Réseau et diffusion de contenu](#fiche-3--réseau-et-diffusion-de-contenu)

### Domaine 4 — Concevoir des architectures à coûts optimisés (20 % · 40 questions)

> 5, 9, 13, 17, 24, 28, 32, 36, 44, 48, 52, 56, 64, 68, 72, 76, 84, 88, 92, 96, 104, 108, 112, 116, 124, 128, 132, 136, 144, 148, 152, 156, 164, 168, 174, 178, 184, 188, 194, 198

**Fiches de révision associées :** [Fiche 6 — Optimisation des coûts](#fiche-6--optimisation-des-coûts)

---

## Annexe C — Plan de révision en quatre semaines

| Semaine | Travail | Livrable |
|---|---|---|
| **1** | Parties 1 à 3 : format de l'examen, stratégie, six fiches de réflexes. Restituez chaque fiche de mémoire, colonne de droite masquée. | Les 6 fiches sues à 90 % |
| **2** | Série A chronométrée (questions 1 à 65), puis correction active intégrale. | Grille de score série A |
| **3** | Série B chronométrée (questions 66 à 130) + relecture des « À retenir » ratés en semaine 2. | Grille de score série B |
| **4** | Série C chronométrée (questions 131 à 200), puis relecture de **tous** les blocs « À retenir » et des fiches des domaines faibles. | Score global ≥ 80 % |

> ⚠️ **Ne réservez l'examen qu'après avoir dépassé 80 % sur une série jamais vue.** Refaire une série déjà corrigée mesure votre mémoire, pas votre compétence.

---

## Annexe D — Check-list du jour J

- ☐ Pièce d'identité en cours de validité (nom identique à l'inscription)
- ☐ Arrivée 30 minutes avant l'heure — ou test système effectué la veille en cas de surveillance en ligne
- ☐ Accommodation **ESL +30** demandée en amont si le français est votre langue de travail
- ☐ Stratégie des trois passes en tête : 75 min / 40 min / 15 min
- ☐ Réflexe d'ouverture : **lire la dernière phrase de l'énoncé en premier**
- ☐ Règle absolue : **aucune question laissée sans réponse**

---

<sub>Manuel d'entraînement SAA-C03 — 200 questions originales, corrigé commenté, fiches de réflexes. Construit à partir du guide officiel de l'examen AWS Certified Solutions Architect – Associate (SAA-C03) et de la documentation AWS.</sub>
