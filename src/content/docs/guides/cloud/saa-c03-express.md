---
title: "AWS SAA-C03 — Guide de révision express"
description: >- 
    Guide de révision pédagogique de la certification AWS Certified Solutions Architect – Associate (SAA-C03) : 
    quel service choisir, pourquoi celui-ci, pourquoi pas les autres.
created: "2026-10-04"
# updated: "2026-09-03"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---


Ce guide est la version web, retravaillée et enrichie, de la fiche **« AWS SAA-C03 — Révision express »** en 10 pages. Chaque service y est expliqué simplement, comparé à ses voisins et relié aux mots de l'énoncé qui doivent le faire surgir le jour de l'examen. Il s'adresse autant à la personne qui découvre AWS qu'à celle qui l'utilise déjà et veut fiabiliser ses réflexes.

Un seul fil conducteur guide toute la page, celui de chaque question d'architecture du SAA-C03 :

> **Quel service AWS choisir ? Pourquoi celui-ci ? Pourquoi pas les autres ?**

:::tip[📥 Deux façons de réviser]
- 📖 **Version web enrichie** — vous y êtes : explications, analogies, comparaisons, mini-scénarios et fiche ultra-rapide.
- 📄 **Fiche PDF originale (10 pages)** — à conserver, imprimer ou relire hors connexion.

<!-- <a href="/downloads/SERVICE_AWS_SAAC03_2026_Revision_10_Pages.pdf" download="SERVICE_AWS_SAAC03_2026_Revision_10_Pages.pdf">📥 <strong>Télécharger la fiche PDF</strong> · SERVICE_AWS_SAAC03_2026_Revision_10.pdf</a> -->
👉 [**Télécharger la fiche de révision AWS SAA-C03 — PDF**](/documents/aws/SERVICE_AWS_SAAC03_2026_Revision_Express.pdf)
:::

## Comment lire ce guide

Chaque service suit la même grille, construite pour répondre aux trois questions du fil conducteur :

**🔍 À quoi sert-il ?** → **✅ Quand le choisir ?** → **❌ Quand ne pas le choisir ?** → **⚠️ Piège fréquent** → **🎯 Réflexe examen**

| Repère | Signification |
|---|---|
| 🔴 **Niveau 1** | Indispensable : service central, fiche complète. |
| 🟠 **Niveau 2** | Comparaison : distracteur fréquent, fiche courte. |
| 🔵 **Niveau 3** | Reconnaissance : une ligne suffit. |
| `D1` `D2` `D3` `D4` | Domaine principal du service (pondérations en section 1). |

| Encadré | Ce qu'il contient |
|---|---|
| 💡 **À retenir** | L'idée essentielle à garder en tête. |
| ⚠️ **Piège d'examen** | La confusion que les distracteurs exploitent. |
| 🎯 **Réflexe SAA-C03** | L'association « indice de l'énoncé → service ». |
| 📌 **Exemple** | Une analogie ou un cas concret. |
| 🔄 **Comparaison** | Des services voisins mis côte à côte. |

:::note[📌 Avant de commencer]
Les chiffres et quotas cités reprennent ceux de la fiche source. AWS fait régulièrement évoluer ses services et leurs noms : en cas de doute, la documentation AWS et le guide officiel de l'examen font foi. Les mini-scénarios de la section 11 sont des exercices originaux, et non des questions d'examen.
:::

## 1 · 🗺️ Vue d'ensemble du SAA-C03

### L'examen en un coup d'œil

| Élément | Valeur |
|---|---|
| Questions | **65** — 50 notées et 15 non notées, impossibles à distinguer |
| Durée | **130 minutes**, soit 2 minutes par question |
| Seuil de réussite | **720 / 1000** (score étalonné) |
| Formats | **réponse unique** (1 bonne réponse sur 4) ou **multiple** (2 sur 5) |

### Les quatre domaines et leurs pondérations

```text
 D1  Sécurité       ██████████████████████████████  30 %
 D2  Résilience     ██████████████████████████      26 %
 D3  Performance    ████████████████████████        24 %
 D4  Coûts          ████████████████████            20 %
```

| Domaine | Poids | Ce qu'il évalue | Services phares |
|---|---|---|---|
| `D1` Architectures **sécurisées** | **30 %** | identité, chiffrement, réseau privé, protection, détection | IAM, KMS, endpoints VPC, WAF, GuardDuty |
| `D2` Architectures **résilientes** | **26 %** | Multi-AZ, découplage, scaling, reprise après sinistre | ELB, Auto Scaling, SQS, RDS Multi-AZ, Route 53 |
| `D3` Architectures **performantes** | **24 %** | stockage, cache, bases de données, réseau, analytics | EBS, ElastiCache, CloudFront, DynamoDB, Kinesis |
| `D4` Architectures **à coûts optimisés** | **20 %** | modèles d'achat, classes S3, rightsizing, transfert de données | Savings Plans, Spot, S3 Lifecycle, Compute Optimizer |

:::tip[💡 À retenir]
Sécurité et résilience pèsent ensemble **56 %** de l'examen. Une réponse rapide ou économique qui laisse un point unique de défaillance, ou qui expose une donnée, est presque toujours un distracteur.
:::

### Les services indispensables par domaine

| Domaine | Services de niveau 1 |
|---|---|
| `D1` Sécurité | IAM · IAM Identity Center · Cognito · Organizations (SCP) · KMS · Secrets Manager · ACM · WAF · VPC · Gateway et Interface Endpoints · NAT Gateway · Site-to-Site VPN · API Gateway · GuardDuty · CloudTrail · Config · Systems Manager |
| `D2` Résilience | ELB · Auto Scaling · ECS · SQS · SNS · EventBridge · Step Functions · RDS · Aurora · Route 53 · Transit Gateway · AWS Backup · EFS · S3 · DMS · CloudFormation · CloudWatch |
| `D3` Performance | EC2 · Lambda · Fargate · EBS · FSx · DynamoDB · ElastiCache · CloudFront · Direct Connect · Kinesis Data Streams · Data Firehose · Athena · Glue · Redshift · DataSync |
| `D4` Coûts | Savings Plans · S3 Glacier et classes de stockage · Cost Explorer — et, en niveau 2 : Budgets, Compute Optimizer, Data Exports, Spot |

### L'architecture de référence

La plupart des scénarios du SAA-C03 sont des variations autour de cette architecture web en couches. Savoir quel service occupe chaque couche, et pourquoi, permet déjà d'éliminer une bonne partie des distracteurs.

```text
  Utilisateurs : web · mobile · partenaires
              │
              ▼
  ┌────────────────────────┐
  │ Route 53               │  DNS · routage · bascule (failover)
  └───────────┬────────────┘
              ▼
  ┌────────────────────────┐
  │ CloudFront + WAF       │  cache HTTP mondial · filtrage L7 · Shield
  └───────────┬────────────┘
              ▼
  ┌────────────────────────┐
  │ ALB / API Gateway      │  répartition multi-AZ · API · authentification
  └───────────┬────────────┘
              ▼
  ┌────────────────────────┐
  │ EC2 · ECS · EKS ·      │  calcul · Auto Scaling sur au moins 2 AZ
  │ Lambda                 │
  └───────────┬────────────┘
              ├──► SQS · SNS · EventBridge    découplage · diffusion · événements
              ├──► RDS · Aurora · DynamoDB    transactions · clé-valeur (+ cache)
              └──► Amazon S3                  objets · data lake · fichiers statiques
                   (S3 peut aussi servir directement d'origine à CloudFront)
```

:::tip[💡 À retenir]
Chaque couche répond à un verbe : **nommer** (Route 53), **rapprocher et filtrer** (CloudFront + WAF), **répartir** (ALB), **calculer** (EC2, conteneurs, Lambda), **découpler** (SQS, SNS, EventBridge), **persister** (RDS, DynamoDB, S3).
:::

### La méthode de réponse en 6 étapes

Lisez **la dernière phrase de l'énoncé en premier** : c'est elle qui fixe le critère de choix.

```text
 1. Besoin ──► 2. Contrainte ──► 3. Service AWS ──► 4. Comparaison ──► 5. Piège ──► 6. Réflexe
```

| Étape | Question à se poser |
|---|---|
| **1. Besoin** | Que doit faire l'architecture ? Stocker, découpler, relier, protéger, migrer… |
| **2. Contrainte** | Quel mot impose la décision ? Coût, effort d'exploitation, RPO/RTO, protocole, OS, Région, conformité. |
| **3. Service AWS** | Quel service satisfait le besoin **et** la contrainte ? |
| **4. Comparaison** | Pourquoi pas les services voisins ? |
| **5. Piège** | Quel distracteur est « presque juste » mais viole une seule exigence ? |
| **6. Réflexe** | Quelle association « indice → service » ai-je mémorisée ? |

:::note[📌 Exemple : la méthode appliquée]
*Une entreprise doit conserver des journaux d'audit pendant 7 ans au coût le plus bas possible. Ils ne sont presque jamais consultés et un délai de 48 heures est acceptable.*

1. **Besoin** : archiver des objets sur le long terme.
2. **Contrainte** : *le moins cher*, délai de 48 h toléré.
3. **Service** : S3 Glacier Deep Archive.
4. **Comparaison** : Glacier Flexible Retrieval est plus rapide mais plus cher ; Standard-IA vise un accès immédiat.
5. **Piège** : choisir Glacier Instant Retrieval parce qu'il « reste rapide » — la rapidité n'était pas demandée.
6. **Réflexe** : archive la moins chère → **Deep Archive**.
:::

### Décoder l'énoncé : les expressions qui décident

| Expression de l'énoncé | Ce que l'examen attend | Exemple de bonne réponse | Distracteur typique |
|---|---|---|---|
| **LEAST operational overhead** | le service managé ou serverless qui satisfait tout : ni script, ni cron, ni serveur à gérer | S3 Lifecycle, EventBridge Scheduler, Fargate | un script cron sur une instance EC2 |
| **MOST cost-effective** | la solution la moins chère qui respecte **toutes** les contraintes | Spot pour un batch interruptible | une option moins chère qui viole une contrainte (One Zone-IA pour des données non recréables) |
| **highly available** | au moins 2 AZ, aucun point unique de défaillance | ASG multi-AZ + ALB + RDS Multi-AZ | une seule instance, même très puissante |
| **fault tolerant** | aucune interruption perceptible : redondance active | capacité suffisante même après la perte d'une AZ | une solution qui redémarre après la panne |
| **decouple / asynchronous** | SQS, SNS, EventBridge | une file SQS entre deux couches | des appels synchrones directs entre services |
| **without Internet / privately** | endpoints VPC, PrivateLink, Direct Connect | Gateway Endpoint pour S3 | une NAT Gateway ou une IP publique |
| **minimal changes** | même moteur, même protocole : lift-and-shift | MGN, DMS sans changement de moteur, Amazon MQ | une réécriture complète en serverless |
| **RPO / RTO** | données perdues et durée d'arrêt tolérées → stratégie DR | Pilot Light, Warm Standby… | un actif-actif multi-Région quand un RTO de plusieurs heures suffit |

:::caution[⚠️ Piège d'examen : highly available ≠ fault tolerant]
Une architecture **hautement disponible** peut subir une courte bascule (un RDS Multi-AZ bascule en une à deux minutes environ). Une architecture **tolérante aux pannes** absorbe la panne sans interruption perceptible, généralement en gardant assez de capacité active dans chaque AZ pour encaisser la perte de l'une d'elles.
:::

### Les trois confusions qui coûtent le plus de points

:::danger[⚠️ Trois confusions à ne jamais commettre]
1. **Multi-AZ = disponibilité** ≠ **Read Replica = lectures** → détaillé en section 4.
2. **Sauvegarde ≠ haute disponibilité ≠ reprise après sinistre** → détaillé en section 8.
3. **Gateway Endpoint** (S3 et DynamoDB uniquement) ≠ **Interface Endpoint** (les autres API AWS) → détaillé en section 6.
:::

## 2 · ⚙️ Calcul et conteneurs

> **Question clé :** quel niveau de gestion suis-je prêt à assumer ? Serveur (EC2) → conteneur (ECS/EKS, Fargate) → fonction (Lambda).

:::note[📌 Analogie : se loger]
- **EC2**, c'est **votre maison** : liberté totale, mais la toiture et la plomberie sont pour vous (OS, correctifs, capacité).
- **ECS ou EKS sur EC2**, c'est **un immeuble que vous gérez** : les conteneurs sont les appartements, mais l'immeuble reste à entretenir.
- **Fargate**, c'est **une résidence services** : vous occupez l'appartement, le gestionnaire s'occupe du bâtiment.
- **Lambda**, c'est **une chambre d'hôtel louée à la minute** : vous ne payez que lorsque vous l'occupez, et le séjour est limité à 15 minutes.
:::

```text
 PLUS DE CONTRÔLE                                                 MOINS D'EXPLOITATION
 ◄───────────────────────────────────────────────────────────────────────────────────►
  EC2                ECS / EKS sur EC2      Fargate                Lambda
  serveur complet    conteneurs + hôtes     conteneurs sans hôte   fonction ≤ 15 min
  OS à votre charge  hôtes à votre charge   AWS gère la capacité   AWS gère tout
```

### Quel service de calcul choisir ?

| Besoin | Service AWS | Pourquoi ? | Piège / distracteur |
|---|---|---|---|
| Contrôle de l'OS, GPU, licence liée au matériel | **EC2** | accès complet à l'OS et au type de matériel | Lambda : pas d'OS, 15 min maximum |
| Code court déclenché par un événement | **Lambda** | aucun serveur, facturé à l'usage | EC2 : serveurs à gérer et à payer en continu |
| Conteneurs sur AWS, simplement | **ECS** | orchestrateur natif, peu de concepts | EKS : complexité Kubernetes inutile |
| Conteneurs sans gérer d'hôtes | **Fargate** | AWS fournit et dimensionne la capacité | ECS sur EC2 : instances à corriger et dimensionner |
| Kubernetes exigé ou portabilité | **EKS** | Kubernetes managé, outils standards | ECS : ce n'est pas Kubernetes |
| Jobs par lots, files de travaux | **AWS Batch** | planifie et dimensionne les jobs | Lambda pour des jobs de plus de 15 min |
| Charge variable | **Auto Scaling + ELB** | scaling horizontal sur plusieurs AZ | une instance plus grande (scaling vertical) |

### Amazon EC2

`D3` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Une machine virtuelle : vous contrôlez l'OS, les logiciels installés et le type de matériel.
- **✅ Quand le choisir ?** OS ou logiciel spécifique, application historique déplacée telle quelle (*lift-and-shift*), GPU, licence liée au matériel.
- **❌ Quand ne pas le choisir ?** Code court sur événement → Lambda ; conteneurs sans gestion d'hôtes → Fargate.
- **⚠️ Piège fréquent :** une instance vit dans **une seule AZ**. Pas de haute disponibilité sans Auto Scaling Group multi-AZ et ELB.
- **🎯 Réflexe examen :** « contrôle de l'OS » → **EC2**
- **🔑 Mots-clés :** `instance type` · `AMI` · `user data` · `placement group` · `Spot` · `Dedicated Host`

#### 🔄 Les trois placement groups

| Placement group | Principe | Cas d'usage |
|---|---|---|
| **Cluster** | instances regroupées au plus près, dans une AZ | HPC, latence réseau minimale (+ EFA) |
| **Spread** | chaque instance sur un matériel distinct | quelques instances critiques à isoler des pannes matérielles |
| **Partition** | groupes d'instances sur des racks isolés | Hadoop, Kafka, Cassandra |

### AWS Lambda

`D3` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Exécuter du code en réponse à un événement, sans serveur, facturé à la requête et à la durée.
- **✅ Quand le choisir ?** Traitement court déclenché par S3, SQS, API Gateway, EventBridge ou DynamoDB Streams.
- **❌ Quand ne pas le choisir ?** Plus de 15 minutes ou OS à contrôler → ECS/Fargate ou EC2 ; enchaînement d'étapes avec état → Step Functions.
- **⚠️ Piège fréquent :** la mémoire allouée détermine aussi le CPU. Démarrage à froid gênant → concurrence provisionnée **ou** SnapStart (pas les deux sur la même version). Trop de connexions vers la base → RDS Proxy.
- **🎯 Réflexe examen :** événement + court + sans serveur → **Lambda**
- **🔑 Mots-clés :** `event-driven` · `serverless` · `15 minutes` · `concurrency` · `SnapStart`

### Amazon EC2 Auto Scaling

`D2` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Ajuster le nombre d'instances à la charge et remplacer automatiquement les instances défaillantes.
- **✅ Quand le choisir ?** Charge variable ; capacité minimale à garantir, répartie sur plusieurs AZ.
- **❌ Quand ne pas le choisir ?** Application qui conserve un état local (sessions sur disque) → externaliser d'abord l'état ; traitement court et événementiel → Lambda.
- **⚠️ Piège fréquent :** activer le **health check ELB** (sinon l'ASG ne voit que l'état de l'instance, pas celui de l'application). Stocker les sessions hors instance (ElastiCache, DynamoDB). Pour des workers SQS, scaler sur le **backlog par instance**, pas sur le CPU.
- **🎯 Réflexe examen :** pics + haute disponibilité → **ASG multi-AZ derrière un ELB**
- **🔑 Mots-clés :** `target tracking` · `scheduled` · `predictive` · `ELB health check` · `warm pool`

| Politique de scaling | Quand l'utiliser |
|---|---|
| **Target tracking** | maintenir une métrique cible (CPU à 50 %, requêtes par cible…) |
| **Step / simple** | réagir par paliers à une alarme CloudWatch |
| **Scheduled** | pic prévisible à heure fixe (ouverture des soldes, début de journée) |
| **Predictive** | cycles récurrents appris sur l'historique |
| **Warm pool** | instances pré-initialisées quand le démarrage est long |

### Elastic Load Balancing — ALB · NLB · GWLB

`D2` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Répartir le trafic vers des cibles saines, réparties dans plusieurs AZ.
- **✅ Quand le choisir ?** Devant toute flotte d'instances, de conteneurs ou de fonctions qui doit être hautement disponible.
- **❌ Quand ne pas le choisir ?** Besoin d'accélération mondiale avec IP anycast → Global Accelerator (éventuellement devant l'ELB) ; simple cache de contenu → CloudFront.
- **⚠️ Piège fréquent :** **WAF s'attache à l'ALB, pas au NLB.** IP fixes exigées → NLB, ou Global Accelerator devant un ALB.
- **🎯 Réflexe examen :** chemin / hôte → **ALB** · TCP/UDP → **NLB** · appliances de sécurité → **GWLB**

#### 🔄 ALB vs NLB vs GWLB

| Critère | ALB | NLB | GWLB |
|---|---|---|---|
| Couche | 7 : HTTP, HTTPS | 4 : TCP, UDP, TLS | 3 : paquets IP |
| Routage | chemin, hôte, en-têtes, WebSocket | très haut débit, latence ultra-faible | vers des appliances tierces |
| IP statique par AZ | non | **oui** | — |
| AWS WAF | **oui** | non | non |
| Particularités | cibles Lambda, authentification | exposition via **PrivateLink** | pare-feu, IDS/IPS virtuels |

### Amazon ECS

`D2` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** L'orchestrateur de conteneurs natif d'AWS : il lance et maintient des tâches et des services.
- **✅ Quand le choisir ?** Conteneurs sans besoin Kubernetes ; lancement sur EC2 ou sur Fargate.
- **❌ Quand ne pas le choisir ?** Kubernetes, ses outils ou la portabilité sont exigés → EKS.
- **⚠️ Piège fréquent :** le **rôle de tâche** donne les permissions de l'application ; le **rôle d'exécution** permet à ECS de tirer l'image ECR, d'écrire les logs et de lire les secrets.
- **🎯 Réflexe examen :** conteneurs sur AWS, simplement → **ECS**

### AWS Fargate

`D3` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Exécuter des conteneurs ECS ou EKS sans gérer d'instances.
- **✅ Quand le choisir ?** Conteneurs avec un minimum d'exploitation : pas d'hôte à corriger ni à dimensionner.
- **❌ Quand ne pas le choisir ?** GPU, accès à l'hôte, démons spécifiques → type de lancement EC2.
- **⚠️ Piège fréquent :** moins d'exploitation ne veut pas dire moins cher. Fargate Spot convient aux tâches interruptibles.
- **🎯 Réflexe examen :** conteneurs sans gérer de serveurs → **Fargate**

### Amazon EKS

`D2` · 🟠 Niveau 2

- **🔍 À quoi sert-il ?** Kubernetes managé : AWS gère le plan de contrôle.
- **✅ Quand le choisir ?** L'énoncé mentionne Kubernetes, des outils Kubernetes existants ou la portabilité.
- **❌ Quand ne pas le choisir ?** Aucun besoin Kubernetes → ECS, plus simple.
- **⚠️ Piège fréquent :** choisir EKS « parce que c'est plus puissant » sans que Kubernetes soit demandé.
- **🎯 Réflexe examen :** « Kubernetes » dans l'énoncé → **EKS**

### 🔵 Niveau 3 — à reconnaître en une ligne

| Service | En une ligne |
|---|---|
| **AWS Batch** | jobs par lots managés : files de travaux, planification et dimensionnement automatiques |
| **Elastic Beanstalk** | déployer une application web sans gérer l'infrastructure ; les ressources sont créées dans votre compte |
| **Lightsail** | serveur privé virtuel simple, à prix fixe |
| **Amazon ECR** | registre d'images de conteneurs |
| **AWS Outposts** | infrastructure AWS installée sur site : latence locale, résidence des données |
| **AWS Wavelength** | calcul en bordure des réseaux 5G |

:::caution[⚠️ Pièges calcul]
- **Dedicated Hosts** (serveur physique entier, licences par socket ou par cœur) ≠ **Dedicated Instances** (matériel isolé, sans visibilité sur les sockets).
- **Instance store** = stockage éphémère, perdu à l'arrêt ; **hibernation** = RAM sauvegardée, redémarrage rapide.
- **Lambda dans un VPC** n'a pas d'IP publique : sa sortie Internet passe par une **NAT Gateway**.
- Le **scaling vertical** (instance plus grande) implique une interruption et un plafond : l'examen préfère le **scaling horizontal**.
:::

### 🧩 Patterns à reconnaître

```text
 API serverless     API Gateway ──► Lambda ──► DynamoDB
 Web classique      ALB ──► Auto Scaling Group multi-AZ (EC2) ──► RDS Multi-AZ
 HPC couplé         placement group Cluster (+ EFA)
 Traitement batch   AWS Batch ou Auto Scaling sur instances Spot
```

## 3 · 💾 Stockage

> **Question clé :** comment l'application accède-t-elle aux données ? Par API (objet), comme un disque (bloc), ou comme un dossier partagé (fichier NFS ou SMB) ? Ensuite seulement : disponibilité, performance, coût.

:::note[📌 Analogie : ranger ses affaires]
- **S3** est un **entrepôt de colis étiquetés** : on dépose et on reprend un colis entier grâce à son étiquette (la clé) ; on ne modifie pas une page à l'intérieur du colis.
- **EBS** est le **disque dur interne d'un ordinateur** : rapide, mais branché sur une seule machine, dans une seule pièce (une AZ).
- **EFS** est le **lecteur réseau partagé de l'open space** Linux : tout le monde lit et écrit dans les mêmes dossiers.
- **FSx for Windows** est le **serveur de fichiers Windows de l'entreprise**, avec ses partages SMB et ses droits Active Directory.
:::

```text
 Comment l'application accède-t-elle aux données ?
 │
 ├── par API / HTTP (objets) ............... Amazon S3
 ├── comme un disque d'instance (bloc) ..... Amazon EBS        (1 AZ)
 ├── dossier partagé Linux (NFS) ........... Amazon EFS        (multi-AZ)
 ├── dossier partagé Windows (SMB, AD) ..... FSx for Windows File Server
 ├── calcul parallèle, HPC ................. FSx for Lustre    (lié à S3)
 └── depuis le site, avec cache local ...... AWS Storage Gateway
```

### Quel stockage choisir ?

| Besoin | Service AWS | Pourquoi ? | Piège / distracteur |
|---|---|---|---|
| Objets, data lake, fichiers statiques | **S3** | accès par API, durabilité, coût | ce n'est ni un disque ni un partage NFS |
| Disque bloc d'une instance EC2 | **EBS** | faible latence, attaché à l'instance | lié à une seule AZ |
| Fichiers partagés Linux (NFS), multi-AZ | **EFS** | élastique, montable par de nombreuses instances | pas pour Windows |
| Windows, SMB, Active Directory | **FSx for Windows File Server** | SMB natif, intégration AD | EFS = NFS pour Linux |
| HPC, calcul parallèle, données dans S3 | **FSx for Lustre** | débit parallèle très élevé, lien avec S3 | EFS : débit moindre |
| Sur site ↔ cloud avec cache local | **Storage Gateway** | accès hybride durable | DataSync = transfert, pas de cache |
| Sauvegarde centralisée multi-services | **AWS Backup** | politiques, rétention, copies inter-Régions | snapshots manuels ou scripts |
| PRA de serveurs, réplication continue | **AWS DRS** | RPO en secondes, RTO en minutes | AWS Backup : restauration plus lente |

### Amazon S3

`D2` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Un stockage **objet** illimité, conçu pour une durabilité de 99,999999999 % (« onze neuf »), accessible par API et HTTP.
- **✅ Quand le choisir ?** Fichiers statiques, data lake, sauvegardes, logs, origine CloudFront (protégée par OAC).
- **❌ Quand ne pas le choisir ?** Système de fichiers partagé → EFS ou FSx ; disque d'instance → EBS.
- **⚠️ Piège fréquent :** One Zone-IA = **une seule AZ**. Le **versioning** protège des écrasements mais n'est pas une sauvegarde immuable → **Object Lock**. La réplication CRR/SRR **exige le versioning**.
- **🎯 Réflexe examen :** objets + durabilité + coût → **S3**, puis choisir **la bonne classe**
- **🔑 Mots-clés :** `bucket policy` · `versioning` · `lifecycle` · `Object Lock` · `Block Public Access` · `presigned URL`

#### Les classes de stockage S3

| Classe | Pour quel usage ? | Délai d'accès | Durée min. facturée | À surveiller |
|---|---|---|---|---|
| **Standard** | accès fréquent | millisecondes | — | le plus cher au Go stocké |
| **Intelligent-Tiering** | accès **imprévisible** | millisecondes (paliers à accès instantané) | — | petits frais de surveillance par objet |
| **Standard-IA** | accès rare, lecture immédiate | millisecondes + frais de récupération | 30 jours | coûteux si les données sont lues souvent |
| **One Zone-IA** | accès rare, données **recréables** | millisecondes, **une seule AZ** | 30 jours | perte si l'AZ est détruite |
| **Glacier Instant Retrieval** | archive lue environ une fois par trimestre | millisecondes | 90 jours | frais de récupération élevés |
| **Glacier Flexible Retrieval** | archive, délai accepté | de 1-5 min à 12 h | 90 jours | restaurer avant de lire |
| **Glacier Deep Archive** | archive longue, **la moins chère** | jusqu'à 12 h (bulk : jusqu'à 48 h) | 180 jours | aucun accès rapide possible |

```text
 CHAUD ◄────────────────────────────────────────────────────────────────────► FROID
 Standard ──► Standard-IA ──► Glacier Instant ──► Glacier Flexible ──► Deep Archive
   ms           ms, 30 j        ms, 90 j            min à h, 90 j        h, 180 j

 Lifecycle      : descend les objets selon des règles de date (usage prévisible)
 Int.-Tiering   : déplace les objets selon l'usage réellement observé (imprévisible)
```

:::note[📌 Analogie : du salon au garde-meubles]
**Standard** est le salon : tout est à portée de main. **Standard-IA** est le placard, rarement ouvert mais accessible tout de suite. **Glacier Instant Retrieval** est la cave. **Glacier Flexible Retrieval** est le grenier : il faut sortir l'échelle, de quelques minutes à quelques heures. **Deep Archive** est le garde-meubles à l'autre bout de la ville : le moins cher, mais comptez une demi-journée. **Lifecycle** est le déménageur qui y descend les cartons au fil du temps.
:::

:::tip[🎯 Réflexe SAA-C03]
- Accès **imprévisible** → **Intelligent-Tiering**.
- Accès **prévisible** qui décroît avec le temps → règles **Lifecycle**.
- Archive lue en **millisecondes** → **Glacier Instant Retrieval**.
- Archive **la moins chère**, délai de 12 à 48 h accepté → **Deep Archive**.
:::

#### 🔐 S3 : sécurité et accès

- **Block Public Access** activé au niveau du compte.
- **Bucket policy** avec conditions : `aws:SecureTransport` pour imposer HTTPS, `aws:SourceVpce` pour n'autoriser qu'un endpoint VPC.
- **ACL désactivées** grâce à Object Ownership (le propriétaire du bucket possède tous les objets).
- **Presigned URL** : accès temporaire à un objet, sans identifiants AWS.
- **OAC** (Origin Access Control) : seul CloudFront peut lire le bucket d'origine.
- **SSE-KMS** : contrôler et auditer l'usage des clés de chiffrement.
- **Access Points** : déléguer l'accès par application ou par équipe.

#### 🛡️ S3 : protéger les données contre la suppression

| Mécanisme | Protège contre | À savoir |
|---|---|---|
| **Versioning** | écrasement, suppression accidentelle | les versions précédentes restent restaurables ; prérequis à la réplication |
| **MFA Delete** | suppression par un compte compromis | un code MFA est exigé pour supprimer définitivement une version |
| **Object Lock — Governance** | suppression par la plupart des utilisateurs | contournable avec une permission spéciale |
| **Object Lock — Compliance** | suppression par **quiconque**, compte root compris | WORM strict jusqu'à la fin de la rétention |

#### ⚡ S3 : performance et transfert

- **Multipart upload** pour les gros objets : parallélisme et reprise en cas d'erreur.
- **Transfer Acceleration** pour des clients éloignés de la Région du bucket.
- **Lectures par plages d'octets** (byte-range fetches) pour paralléliser les téléchargements.
- **Répartir les requêtes sur plusieurs préfixes** : les limites de débit s'appliquent par préfixe (environ 3 500 écritures et 5 500 lectures par seconde).
- **S3 Express One Zone** : latence de quelques millisecondes, mais **une seule AZ**.
- **DataSync** pour migrer des fichiers vers S3.

### Amazon EBS

`D3` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Un volume bloc attaché à une instance EC2, dans une AZ.
- **✅ Quand le choisir ?** Disque système ou disque de données d'une instance, base de données installée sur EC2.
- **❌ Quand ne pas le choisir ?** Fichiers partagés entre instances de plusieurs AZ → EFS ; stockage d'objets → S3.
- **⚠️ Piège fréquent :** changer d'AZ = **snapshot puis nouveau volume**. Multi-Attach : uniquement io1/io2, dans la **même AZ**. L'**instance store** est éphémère.
- **🎯 Réflexe examen :** disque d'une instance → **EBS gp3**

| Type | Profil | Cas d'usage |
|---|---|---|
| **gp3** (SSD) | **par défaut** : IOPS et débit réglables indépendamment de la taille | la plupart des charges, disques système |
| **io2** (SSD) | IOPS très élevées, latence constante | bases de données critiques |
| **st1** (HDD) | débit séquentiel élevé | big data, logs, traitements séquentiels |
| **sc1** (HDD) | données froides, le moins cher | données rarement lues |

Les snapshots EBS sont **incrémentaux**, stockés de façon durable et **copiables entre Régions**. Les volumes HDD (st1, sc1) ne peuvent pas servir de volume de démarrage.

### Amazon EFS

`D2` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Un système de fichiers NFS partagé et élastique pour Linux.
- **✅ Quand le choisir ?** Plusieurs instances, réparties dans plusieurs AZ, lisent et écrivent les mêmes fichiers.
- **❌ Quand ne pas le choisir ?** Windows ou SMB → FSx for Windows ; HPC → FSx for Lustre.
- **⚠️ Piège fréquent :** deux modes, **Regional** (multi-AZ) ou **One Zone**. Pour le coût : classes Standard, IA et Archive pilotées par une politique lifecycle.
- **🎯 Réflexe examen :** fichiers Linux partagés → **EFS**

### Amazon FSx

`D3` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Des systèmes de fichiers tiers entièrement managés.
- **✅ Quand le choisir ?** Protocole ou système de fichiers spécifique : SMB/AD, HPC, NetApp, ZFS.
- **❌ Quand ne pas le choisir ?** Simple partage NFS Linux → EFS ; stockage d'objets → S3.
- **⚠️ Piège fréquent :** répondre EFS dès que l'énoncé parle de « partage de fichiers », alors qu'il mentionne Windows, SMB ou Active Directory.
- **🎯 Réflexe examen :** SMB / AD → **FSx for Windows** · HPC → **FSx for Lustre**

| Variante | Protocoles | Cas d'usage |
|---|---|---|
| **FSx for Windows File Server** | SMB, Active Directory | partages de fichiers Windows |
| **FSx for Lustre** | Lustre, lié à S3 | HPC, machine learning, calcul parallèle |
| **FSx for NetApp ONTAP** | NFS + SMB + iSCSI | migration NetApp, environnements multiprotocoles |
| **FSx for OpenZFS** | NFS | migration de systèmes ZFS |

### AWS Storage Gateway

`D3` · 🟠 Niveau 2

- **🔍 À quoi sert-il ?** Relier durablement le stockage sur site au stockage AWS, avec un cache local.
- **✅ Quand le choisir ?** Architecture hybride qui dure : les serveurs sur site continuent d'utiliser NFS, SMB, iSCSI ou des bandes.
- **❌ Quand ne pas le choisir ?** Migration ponctuelle de fichiers → **DataSync**.
- **⚠️ Piège fréquent :** confondre « accès hybride permanent » (Storage Gateway) et « transfert unique » (DataSync).
- **🎯 Réflexe examen :** hybride + cache local → **Storage Gateway**

| Type | Interface sur site | Données dans AWS |
|---|---|---|
| **File Gateway** | NFS / SMB | objets S3 |
| **Volume Gateway** | iSCSI | volumes avec snapshots EBS |
| **Tape Gateway** | bandothèque virtuelle | bandes virtuelles dans S3 Glacier |

### 🔄 Comparaison : S3 vs EBS vs EFS vs FSx

| Critère | S3 | EBS | EFS | FSx for Windows |
|---|---|---|---|---|
| Type | objet | bloc | fichier (NFS) | fichier (SMB) |
| Accès | API HTTP(S) | une instance (Multi-Attach : io1/io2) | de nombreuses instances Linux | clients Windows |
| Portée | Région (One Zone-IA et Express One Zone : 1 AZ) | **1 AZ** | multi-AZ (ou One Zone) | Multi-AZ ou Single-AZ |
| Analogie | entrepôt de colis | disque interne | lecteur réseau partagé | serveur de fichiers d'entreprise |
| Cas typique | site statique, data lake, sauvegardes | disque système, base sur EC2 | contenu web partagé, répertoires utilisateurs | partages départementaux, applications Windows |

:::danger[⚠️ Piège d'examen : EBS ≠ EFS ≠ S3]
- **EBS** = bloc, **une** instance (sauf Multi-Attach), **une** AZ.
- **EFS** = fichiers NFS **partagés**, **multi-AZ**.
- **S3** = objets par API, **pas** un système de fichiers POSIX.
:::

## 4 · 🗄️ Bases de données et cache

> **Question clé :** quel est le modèle d'accès ? Transactions SQL avec jointures, accès par clé à très grande échelle, analytique, ou lectures répétées à mettre en cache ?

:::note[📌 Analogie : quatre façons de ranger l'information]
- **RDS / Aurora** : un **classeur de fiches reliées entre elles** (clients, commandes, factures) que l'on croise par des jointures.
- **DynamoDB** : une **consigne automatique à casiers numérotés** — instantanée si vous connaissez le numéro (la clé), très lente s'il faut ouvrir tous les casiers pour trouver un parapluie (un *Scan*).
- **ElastiCache / DAX** : le **post-it collé sur l'écran**, avec les réponses les plus demandées à portée de main.
- **Redshift** : la **salle d'archives des analystes**, faite pour résumer des millions de lignes, pas pour enregistrer une commande.
:::

```text
 Quel est le modèle d'accès ?
 │
 ├── transactions SQL, jointures ........... RDS   (MySQL/PostgreSQL critique → Aurora)
 ├── accès par clé, très grande échelle .... DynamoDB   (cache dédié → DAX)
 ├── analytique, BI, OLAP .................. Redshift
 ├── lectures répétées, sessions ........... ElastiCache
 ├── documents compatibles MongoDB ......... DocumentDB
 ├── graphe : relations, fraude ............ Neptune
 └── Cassandra (CQL) ....................... Keyspaces
```

### 🔄 Le piège n° 1 : Multi-AZ ou Read Replica ?

```text
  MULTI-AZ  →  disponibilité                 READ REPLICA  →  lectures

  ┌───────────┐  synchrone  ┌───────────┐    ┌───────────┐  asynchrone  ┌───────────┐
  │ Primaire  │────────────►│ Standby   │    │ Primaire  │─────────────►│ Réplica   │
  │ AZ-a      │             │ AZ-b      │    │ écritures │              │ lectures  │
  └───────────┘             └───────────┘    └───────────┘              └───────────┘
   même endpoint DNS, bascule automatique     endpoint distinct, promotion manuelle
```

| Critère | Multi-AZ (instance DB classique) | Read Replica |
|---|---|---|
| **Objectif** | **disponibilité** : bascule automatique | **lectures** : décharger la base principale |
| **Réplication** | **synchrone** vers un standby | **asynchrone** (retard possible) |
| **Lisible ?** | non (standby) ; oui avec un *Multi-AZ DB cluster* | oui, via un endpoint distinct |
| **En cas de panne** | bascule automatique, **même endpoint DNS** | **promotion manuelle** |
| **Portée** | une autre AZ, même Région | même AZ, autre AZ ou **autre Région** |
| **Analogie** | le **copilote** : il ne pilote pas, mais reprend les commandes si le pilote fait un malaise | des **guichets supplémentaires** : ils renseignent le public mais ne prennent aucune décision (pas d'écriture) |

:::tip[🎯 Réflexe SAA-C03]
« survivre à la panne d'une AZ » → **Multi-AZ** · « trop de lectures » → **Read Replica** (ou cache) · « PRA relationnel dans une autre Région, à moindre coût » → **Read Replica inter-Région** (promotion manuelle).
:::

### Quelle base de données choisir ?

| Besoin | Service AWS | Pourquoi ? | Piège / distracteur |
|---|---|---|---|
| Relationnel général, moteurs commerciaux inclus | **RDS** | SQL managé : sauvegardes, correctifs, Multi-AZ | DynamoDB : pas de jointures |
| Relationnel critique MySQL/PostgreSQL | **Aurora** | stockage 6 copies sur 3 AZ, 15 réplicas | RDS classique : moins de réplicas, bascule plus lente |
| NoSQL clé-valeur, ms, serverless | **DynamoDB** | latence constante à toute échelle | RDS : scaling vertical |
| Data warehouse, OLAP | **Redshift** | stockage en colonnes, requêtes analytiques | RDS : conçu pour l'OLTP |
| Cache générique, sessions | **ElastiCache** | mémoire, latence inférieure à la milliseconde | Read Replica : reste une base sur disque |
| Cache devant DynamoDB | **DAX** | microsecondes, API DynamoDB compatible | ElastiCache : code d'intégration à écrire |
| Documents compatibles MongoDB | **DocumentDB** | API MongoDB | DynamoDB : autre API |
| Graphe : relations, fraude, recommandations | **Neptune** | requêtes de parcours de graphe | RDS : jointures en cascade |
| Cassandra (CQL) | **Keyspaces** | Cassandra managé, serverless | DynamoDB : autre API |
| Trop de connexions Lambda → RDS | **RDS Proxy** | mutualise les connexions | une instance de base plus grande |

### Amazon RDS

`D2` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Une base relationnelle managée : MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, Db2.
- **✅ Quand le choisir ?** Application transactionnelle (OLTP) relationnelle, sans administrer le serveur ; moteur commercial imposé.
- **❌ Quand ne pas le choisir ?** Contrôle de l'OS ou du moteur → base sur EC2 ; analytique lourde → Redshift ; accès par clé à très grande échelle → DynamoDB.
- **⚠️ Piège fréquent :** chiffrer une base existante = **snapshot → copie chiffrée → restauration**. Sauvegardes automatiques et **PITR jusqu'à 35 jours**.
- **🎯 Réflexe examen :** relationnel managé → **RDS**
- **🔑 Mots-clés :** `Multi-AZ` · `read replica` · `automated backups` · `PITR` · `RDS Proxy`

### Amazon Aurora

`D2` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Un moteur relationnel compatible MySQL et PostgreSQL, dont le stockage est répliqué en **6 copies sur 3 AZ**.
- **✅ Quand le choisir ?** Relationnel critique ; jusqu'à **15 réplicas**, à la fois lecteurs et cibles de bascule. **Global Database** pour la lecture mondiale et le PRA régional (RPO d'environ 1 s, RTO inférieur à 1 min). **Serverless v2** pour une charge variable ou intermittente.
- **❌ Quand ne pas le choisir ?** Moteur commercial (Oracle, SQL Server, Db2) → RDS ; modèle clé-valeur → DynamoDB.
- **⚠️ Piège fréquent :** Global Database n'est **pas multi-writer** : les écritures restent dans la Région principale.
- **🎯 Réflexe examen :** MySQL/PostgreSQL critique + scaling → **Aurora**
- **🔑 Mots-clés :** `Aurora Replicas` · `Global Database` · `Serverless v2` · `reader endpoint`

### Amazon DynamoDB

`D3` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Une base NoSQL clé-valeur et document, serverless, avec une latence de quelques millisecondes à toute échelle.
- **✅ Quand le choisir ?** Paniers, sessions, catalogues, IoT : accès par clé, trafic élevé ou imprévisible.
- **❌ Quand ne pas le choisir ?** Jointures et SQL relationnel → Aurora ou RDS ; analytique ad hoc → Redshift ou Athena.
- **⚠️ Piège fréquent :** utiliser **Query** (sur la clé ou un index), pas **Scan**. Une mauvaise clé de partition crée une **partition chaude**. Trafic imprévisible → **on-demand** ; trafic prévisible → **provisionné + auto scaling**.
- **🎯 Réflexe examen :** clé-valeur + échelle + serverless → **DynamoDB**
- **🔑 Mots-clés :** `partition key` · `GSI` · `on-demand` · `Streams` · `TTL` · `Global Tables`

:::tip[💡 À retenir : les options DynamoDB]
**Global Tables** : multi-Région et multi-écriture · **PITR** : restauration à la seconde près · **Streams** → Lambda : réagir aux modifications · **TTL** : expiration automatique des éléments, sans coût d'écriture.
:::

### Amazon ElastiCache

`D3` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Un cache en mémoire managé : Valkey, Redis OSS ou Memcached.
- **✅ Quand le choisir ?** Lectures répétées sur une base, sessions utilisateurs, classements, compteurs.
- **❌ Quand ne pas le choisir ?** Base principale durable → RDS ou DynamoDB ; cache devant DynamoDB sans modifier le code → DAX.
- **⚠️ Piège fréquent :** une **stratégie** est à choisir (lazy loading, write-through, TTL) et l'**invalidation** à prévoir. Ce n'est pas la base de référence.
- **🎯 Réflexe examen :** cache générique / sessions → **ElastiCache**

| Moteur | Points forts | Limites |
|---|---|---|
| **Valkey / Redis OSS** | réplication, Multi-AZ, persistance, structures riches (classements, compteurs) | plus de paramètres à maîtriser |
| **Memcached** | simple, multithread | ni réplication ni persistance |

### DynamoDB Accelerator (DAX)

`D3` · 🟠 Niveau 2

- **🔍 À quoi sert-il ?** Un cache en mémoire placé devant DynamoDB, avec des réponses en microsecondes et la même API.
- **✅ Quand le choisir ?** Lectures répétées, éventuellement cohérentes, sur des tables DynamoDB.
- **❌ Quand ne pas le choisir ?** Charge dominée par les écritures ; cache générique pour d'autres bases → ElastiCache.
- **⚠️ Piège fréquent :** DAX **n'accélère pas les écritures**.
- **🎯 Réflexe examen :** cache DynamoDB → **DAX**

### Amazon RDS Proxy

`D2` · 🟠 Niveau 2

- **🔍 À quoi sert-il ?** Un pool de connexions managé entre l'application et RDS ou Aurora.
- **✅ Quand le choisir ?** Nombreuses fonctions Lambda ouvrant chacune des connexions ; réduction du temps de bascule perçu par l'application.
- **❌ Quand ne pas le choisir ?** Problème de lectures trop nombreuses → Read Replica ou cache.
- **⚠️ Piège fréquent :** agrandir l'instance de base pour « absorber » des connexions.
- **🎯 Réflexe examen :** connexions Lambda → RDS → **RDS Proxy**

### 🔄 Comparaison : ElastiCache vs DAX vs Read Replica

| Critère | ElastiCache | DAX | Read Replica |
|---|---|---|---|
| Nature | cache mémoire générique | cache mémoire dédié à DynamoDB | copie de la base de données |
| Latence | inférieure à la milliseconde | microsecondes | millisecondes |
| Impact sur le code | logique de cache à écrire | minimal : API DynamoDB compatible | nouvel endpoint de lecture |
| Usage type | sessions, classements, résultats de requêtes | lectures répétées sur DynamoDB | décharger les lectures SQL, rapports |

:::caution[⚠️ Pièges bases de données]
- Le **standby Multi-AZ** d'une instance classique **n'est pas lisible**.
- **Réplication ≠ sauvegarde** : une corruption logique est répliquée → restauration **PITR**.
- **Global Database** : lecture mondiale, mais écritures dans une seule Région.
- **DynamoDB Scan** sur une grande table = lent et coûteux → **Query** ou **index secondaire global (GSI)**.
:::

## 5 · 📨 Intégration : messagerie et découplage

> **Question clé :** que doivent faire les consommateurs ? Traiter chacun une tâche (**file**), recevoir tous une copie (**diffusion**), réagir selon des règles (**événements**), suivre des étapes (**workflow**) ou relire un flux (**streaming**) ?

:::note[📌 Analogie : six façons de faire passer un message]
- **SQS** est la **file d'attente à tickets d'un guichet** : chaque ticket est traité par un seul guichetier, à son rythme.
- **SNS** est un **mégaphone** : tout le monde entend en même temps, mais rien n'est enregistré.
- **SNS + SQS** = le mégaphone **plus un répondeur par service** : chacun reçoit sa copie et la traite quand il peut.
- **EventBridge** est un **centre de tri postal** : chaque courrier est routé selon son contenu, grâce à des règles.
- **Step Functions** est une **recette de cuisine** : des étapes, des conditions, des reprises en cas d'échec.
- **Kinesis Data Streams** est un **enregistrement vidéo** : plusieurs spectateurs le regardent, chacun à sa position, et peuvent revenir en arrière.
:::

### Quel service d'intégration choisir ?

| Besoin des consommateurs | Service AWS | Pourquoi ? (mots de l'énoncé) | Piège / distracteur |
|---|---|---|---|
| Traiter chacun une tâche, à son rythme | **SQS** | tampon entre producteur et consommateurs · `decouple` `queue` `buffer` | SNS seul : ne stocke rien |
| Traiter dans l'ordre, sans doublon | **SQS FIFO** | ordre par groupe, déduplication · `order` `exactly-once processing` | SQS Standard : ordre non garanti |
| Recevoir tous une copie | **SNS + SQS** | diffusion durable, une file par consommateur · `fan-out` | SQS seul : un seul consommateur par message |
| Réagir selon des règles sur l'événement | **EventBridge** | filtrage sur le contenu, sources AWS et SaaS · `routing rules` `SaaS events` | SNS : filtrage plus limité, pas d'intégrations SaaS |
| Déclencher à heure fixe | **EventBridge Scheduler** | planification managée · `schedule` `cron` | cron sur une instance EC2 |
| Enchaîner des étapes avec état | **Step Functions** | branches, reprises, attentes · `workflow` `states` `retries` | des Lambda qui s'appellent en chaîne |
| Relire un flux, plusieurs lecteurs | **Kinesis Data Streams** | rétention et relecture · `replay` `stream` `real-time` | SQS : message supprimé après traitement |
| Livrer un flux vers S3 ou Redshift | **Data Firehose** | livraison managée, sans code · `deliver` `near real-time` | Kinesis Data Streams : code consommateur à écrire |
| Garder ActiveMQ ou RabbitMQ | **Amazon MQ** | protocoles standards conservés · `JMS` `AMQP` `MQTT` | SQS : réécriture de l'application |
| Kafka existant | **Amazon MSK** | Apache Kafka managé ou serverless · `Kafka` | Kinesis : autre API |

```text
                              ┌──► SQS « facturation » ──► Lambda
 Commande ──► Topic SNS ──────┼──► SQS « stock »       ──► workers ECS
                              └──► SQS « e-mails »     ──► Lambda + SES

 Fan-out durable : chaque service reçoit sa copie et la consomme à son rythme.
```

### Amazon SQS

`D2` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Une file de messages managée qui découple les producteurs des consommateurs.
- **✅ Quand le choisir ?** Traitement asynchrone, absorption des pics : les workers scalent sur la taille de la file (backlog).
- **❌ Quand ne pas le choisir ?** Chaque application doit recevoir une copie → SNS + SQS ; relire l'historique → Kinesis.
- **⚠️ Piège fréquent :** le **visibility timeout** doit être supérieur ou égal à la durée du traitement, sinon le message réapparaît et est traité deux fois. Une **DLQ** (dead-letter queue) isole les messages en échec répété.
- **🎯 Réflexe examen :** decouple + process later → **SQS**
- **🔑 Mots-clés :** `queue` · `decouple` · `buffer` · `backlog` · `DLQ` · `visibility timeout`

| Critère | SQS Standard | SQS FIFO |
|---|---|---|
| Livraison | **au moins une fois** : doublons possibles | traitement **exactement une fois** |
| Ordre | non garanti | garanti par `MessageGroupId` |
| Débit | quasi illimité | élevé mais plafonné |
| Déduplication | à gérer côté consommateur (idempotence) | fenêtre de **5 minutes** |

:::tip[💡 À retenir : les réglages SQS]
Rétention **4 jours** par défaut, **14 jours** au maximum · visibility timeout **12 h** au maximum · **long polling** jusqu'à 20 s pour réduire les appels vides et le coût.
:::

### Amazon SNS

`D2` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Un service pub/sub qui pousse un message vers plusieurs abonnés.
- **✅ Quand le choisir ?** Notifier plusieurs systèmes à la fois : files SQS, fonctions Lambda, endpoints HTTP, e-mail, SMS.
- **❌ Quand ne pas le choisir ?** Traitement différé ou à son rythme → abonner une file SQS ; routage riche sur le contenu ou événements SaaS → EventBridge.
- **⚠️ Piège fréquent :** SNS **ne conserve pas** les messages pour plus tard : une file SQS par consommateur. Les **filter policies** routent selon les attributs du message.
- **🎯 Réflexe examen :** fan-out durable → **SNS + SQS**
- **🔑 Mots-clés :** `topic` · `fan-out` · `subscription` · `filter policy` · `FIFO topic`

### Amazon EventBridge

`D2` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Un bus d'événements qui route chaque événement selon des règles appliquées à son contenu.
- **✅ Quand le choisir ?** Événements AWS, SaaS ou applicatifs vers de nombreuses cibles ; microservices faiblement couplés ; planification avec EventBridge Scheduler.
- **❌ Quand ne pas le choisir ?** Flux massif relu par plusieurs lecteurs → Kinesis ; simple file de travaux → SQS.
- **⚠️ Piège fréquent :** le **replay** n'est possible que si une **archive existait avant** les événements à rejouer.
- **🎯 Réflexe examen :** routing rules / SaaS → **EventBridge**
- **🔑 Mots-clés :** `event bus` · `rule` · `event pattern` · `Scheduler` · `Pipes` · `archive/replay`

### AWS Step Functions

`D2` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Orchestrer un workflow avec état : étapes, branches, reprises, attentes, compensation.
- **✅ Quand le choisir ?** Processus en plusieurs étapes (commande, validation, paiement, expédition), traitement avec gestion d'erreurs.
- **❌ Quand ne pas le choisir ?** Simple découplage entre deux composants → SQS ; diffusion d'un événement → SNS ou EventBridge.
- **⚠️ Piège fréquent :** faire s'appeler des fonctions Lambda en chaîne au lieu d'**orchestrer** avec Step Functions.
- **🎯 Réflexe examen :** workflow / étapes / états → **Step Functions**

| Type | Durée maximale | Sémantique | Usage |
|---|---|---|---|
| **Standard** | jusqu'à **1 an** | exactement une fois | processus métier longs, auditables |
| **Express** | **5 minutes** | au moins une fois | gros volumes d'événements courts |

### Amazon Kinesis Data Streams

`D3` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Un flux de données temps réel, partitionné, relisible par plusieurs consommateurs.
- **✅ Quand le choisir ?** Clickstream, télémétrie, logs en temps réel lus par plusieurs applications ; besoin de relecture.
- **❌ Quand ne pas le choisir ?** Simple livraison vers S3, Redshift ou OpenSearch → Data Firehose ; Kafka existant → MSK.
- **⚠️ Piège fréquent :** rétention de **24 h** par défaut (jusqu'à **365 jours**). L'ordre est garanti **par clé de partition**. Modes on-demand ou provisionné (shards).
- **🎯 Réflexe examen :** stream + replay + plusieurs lecteurs → **Kinesis Data Streams**
- **🔑 Mots-clés :** `shard` · `partition key` · `replay` · `enhanced fan-out` · `retention`

### Amazon API Gateway

`D1` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Publier, sécuriser et protéger des API REST, HTTP ou WebSocket devant Lambda, des conteneurs ou d'autres services.
- **✅ Quand le choisir ?** API serverless ; authentification (Cognito, autorisateur Lambda, IAM) ; limitation de débit (throttling), quotas et clés d'API.
- **❌ Quand ne pas le choisir ?** Simple répartition de charge HTTP devant des instances ou des conteneurs → ALB.
- **⚠️ Piège fréquent :** oublier que le **throttling** et la protection **WAF** se configurent sur API Gateway lui-même, sans code supplémentaire.
- **🎯 Réflexe examen :** API serverless → **API Gateway + Lambda**

### Amazon MQ · Amazon MSK

`D2` · 🟠 Niveau 2

- **🔍 À quoi servent-ils ?** **MQ** : broker ActiveMQ ou RabbitMQ managé. **MSK** : Apache Kafka managé ou serverless.
- **✅ Quand les choisir ?** Migrer une application qui utilise déjà JMS, AMQP, MQTT ou Kafka, **sans la réécrire**.
- **❌ Quand ne pas les choisir ?** Aucun protocole imposé → SQS/SNS (file) ou Kinesis (flux).
- **⚠️ Piège fréquent :** choisir MQ pour un nouveau projet « parce que c'est une file ».
- **🎯 Réflexe examen :** protocole de messagerie existant → **Amazon MQ** · Kafka → **MSK**

### 🔄 Comparaison : SQS vs SNS vs EventBridge vs Kinesis

| Critère | SQS | SNS | EventBridge | Kinesis Data Streams |
|---|---|---|---|---|
| Modèle | file (le consommateur tire) | pub/sub (le service pousse) | bus d'événements + règles | flux partitionné |
| Qui reçoit un message ? | **un seul** consommateur | **tous** les abonnés | les cibles dont la règle correspond | **plusieurs** lecteurs, chacun à sa position |
| Conserve les messages ? | oui : 4 j (14 j max) | **non** | non, sauf archive | oui : 24 h à 365 j |
| Relecture | non | non | oui, si archive préalable | **oui** |
| Filtrage | — | filter policy | event pattern sur le contenu | — |
| Analogie | guichet à tickets | mégaphone | centre de tri | enregistrement vidéo |

### 🔵 Niveau 3 — à reconnaître en une ligne

| Service | En une ligne |
|---|---|
| **AppFlow** | échanges de données entre applications SaaS et AWS, sans code |
| **AppSync** | API GraphQL managée |
| **SES** | envoi d'e-mails transactionnels ou marketing |

### 🧩 Patterns à reconnaître

```text
 Pic d'écritures          SQS + workers + Auto Scaling sur le backlog
 Fichier déposé dans S3   notification ──► SQS ou EventBridge ──► Lambda
 Commande multi-étapes    Step Functions (avec étapes de compensation)
 Microservices découplés  EventBridge (règles) ou SNS + SQS (fan-out)
```

:::caution[⚠️ Pièges messagerie]
- **SQS n'est pas une diffusion** : un message est traité par un seul consommateur.
- **SNS pousse sans stocker** : pour traiter plus tard ou à son rythme, abonner une file SQS.
- **Kinesis n'est pas une file de travaux** : chaque lecteur suit sa propre position dans le flux.
- **Message traité deux fois ?** Visibility timeout trop court, ou consommateur non idempotent.
:::

## 6 · 🌐 Réseau et diffusion

> **Question clé :** quel chemin suit le paquet ? **Source → routes → contrôles → destination.** Puis : s'agit-il d'un accès **privé**, **hybride** ou **mondial** ?

:::note[📌 Analogie : un campus d'entreprise]
- Le **VPC** est votre **campus privé** ; chaque **sous-réseau** est un bâtiment, construit dans une seule AZ.
- Les **tables de routage** sont les **panneaux de direction**.
- L'**Internet Gateway** est la **grande porte d'entrée** du campus.
- La **NAT Gateway** est la **boîte aux lettres de départ** : on peut envoyer du courrier vers l'extérieur, mais personne n'entre par là.
- Le **Security Group** est le **vigile devant chaque bureau** : il se souvient de qui est sorti et le laisse revenir (*stateful*).
- La **Network ACL** est la **barrière à l'entrée du bâtiment** : elle contrôle chaque passage, dans les deux sens, sans mémoire (*stateless*).
:::

### Amazon VPC

`D1` · 🔴 Niveau 1

```text
 Région · VPC 10.0.0.0/16
 ┌────────────────────────────────────────────────────────────────┐
 │  AZ-a                            AZ-b                          │
 │  ┌──────────────────────────┐    ┌──────────────────────────┐  │
 │  │ Sous-réseau PUBLIC       │    │ Sous-réseau PUBLIC       │  │
 │  │ ALB · NAT Gateway        │    │ ALB · NAT Gateway        │  │
 │  └──────────────────────────┘    └──────────────────────────┘  │
 │  ┌──────────────────────────┐    ┌──────────────────────────┐  │
 │  │ Sous-réseau PRIVÉ        │    │ Sous-réseau PRIVÉ        │  │
 │  │ EC2 / ECS · RDS primaire │    │ EC2 / ECS · RDS standby  │  │
 │  └──────────────────────────┘    └──────────────────────────┘  │
 └─────────────┬──────────────────────────────────────────────────┘
               │
       Internet Gateway ◄──► Internet

 Sous-réseau public : route 0.0.0.0/0 → Internet Gateway
 Sous-réseau privé  : route 0.0.0.0/0 → NAT Gateway de la même AZ
```

- **🔍 À quoi sert-il ?** Un réseau privé isolé : sous-réseaux (une AZ chacun), tables de routage, passerelles.
- **✅ Quand le choisir ?** Toujours : c'est le socle de toute architecture. L'enjeu est de bien le découper (public / privé, au moins 2 AZ).
- **❌ À éviter :** placer bases de données et serveurs applicatifs dans un sous-réseau public.
- **⚠️ Piège fréquent :** un sous-réseau est **public** uniquement s'il a une route vers l'Internet Gateway. La **NAT Gateway** se place dans un sous-réseau **public**, **une par AZ** pour la haute disponibilité (un mode régional existe également) et ne laisse passer que le trafic **sortant**. Sortie IPv6 uniquement → **egress-only Internet Gateway**. Les **Flow Logs** journalisent le trafic accepté et rejeté.
- **🎯 Réflexe examen :** adressage → routes → contrôles → destination, sur **au moins 2 AZ**
- **🔑 Mots-clés :** `CIDR` · `subnet` · `route table` · `Internet Gateway` · `NAT Gateway` · `Flow Logs`

### 🔄 Comparaison : Security Group vs Network ACL

| Critère | Security Group | Network ACL |
|---|---|---|
| Niveau | interface réseau (instance) | sous-réseau |
| État | **avec état** : le trafic retour est autorisé automatiquement | **sans état** : il faut des règles pour le retour |
| Règles | **autoriser uniquement** | autoriser **et refuser**, évaluées par numéro |
| Usage type | référencer le Security Group d'un autre tiers (l'ALB → les instances) | bloquer une IP ou une plage d'adresses |
| Analogie | vigile devant chaque bureau | barrière à l'entrée du bâtiment |

:::tip[🎯 Réflexe SAA-C03]
« Bloquer une adresse IP malveillante » → **NACL** (ou **WAF** si le trafic est HTTP). Un Security Group ne sait pas **refuser**.
:::

### 🔄 Accès privé : quel endpoint ?

| Critère | Gateway Endpoint | Interface Endpoint | PrivateLink (endpoint service) |
|---|---|---|---|
| Services | **S3 et DynamoDB uniquement** | la plupart des API AWS (SQS, KMS, Secrets Manager…), y compris S3 et DynamoDB | **votre propre service** |
| Mécanisme | une entrée dans la **table de routage** | une **ENI** avec IP privée + DNS privé | un NLB côté fournisseur, un Interface Endpoint côté client |
| Coût | **gratuit** | payant (à l'heure et au Go) | payant |
| Utilisable depuis le site ou un VPC appairé | **non** | oui | oui |
| Réflexe | S3 privé, sans NAT | API AWS privée | exposer un service à d'autres VPC ou comptes |

:::danger[⚠️ Piège d'examen : Gateway ≠ Interface Endpoint]
Le **Gateway Endpoint** ne concerne que **S3 et DynamoDB**, dans la **même Région**, et n'est **pas** joignable depuis le site ou un VPC appairé : dans ces cas, il faut un **Interface Endpoint**. Gratuit, il permet aussi de **supprimer des frais de NAT Gateway** pour le trafic vers S3.
:::

### Hybride et interconnexion

| Besoin | Service AWS | À retenir |
|---|---|---|
| Relier 2 VPC | **VPC Peering** | 1 à 1, **non transitif**, CIDR sans chevauchement |
| Nombreux VPC + sites | **Transit Gateway** | hub **transitif**, tables de routage |
| Utilisateur distant | **Client VPN** | accès OpenVPN au VPC |
| Datacenter, mise en place rapide | **Site-to-Site VPN** | IPsec sur Internet, débit limité par tunnel |
| Datacenter, débit stable et prévisible | **Direct Connect** | lien privé dédié ; plusieurs semaines de mise en service ; **non chiffré** par défaut (VPN sur DX ou MACsec) |
| Résilience du lien dédié | **2 Direct Connect** ou **DX + VPN** | dans des emplacements distincts |
| Partager des sous-réseaux entre comptes | **RAM** | VPC sharing |

```text
 VPC PEERING : 1 à 1, non transitif       TRANSIT GATEWAY : hub transitif

   A ◄────► B ◄────► C                       A     B     C     Site
                                             │     │     │      │
   A ne joint PAS C en passant par B         └─────┴──┬──┴──────┘
   → maillage complet : n × (n − 1) / 2               │
     connexions à gérer                        Transit Gateway
```

### AWS Transit Gateway

`D2` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Un routeur central régional qui relie de nombreux VPC et réseaux sur site.
- **✅ Quand le choisir ?** Des dizaines de VPC, plusieurs comptes, des VPN ou Direct Connect à mutualiser ; routage transitif.
- **❌ Quand ne pas le choisir ?** Deux VPC seulement → VPC Peering, plus simple et sans coût de traitement.
- **⚠️ Piège fréquent :** tenter de résoudre un problème de transitivité avec plus de peerings.
- **🎯 Réflexe examen :** nombreux VPC + sites → **Transit Gateway**

### AWS Direct Connect

`D3` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Un lien réseau privé dédié entre votre site et AWS.
- **✅ Quand le choisir ?** Débit élevé, stable et prévisible ; gros volumes sortants (transfert moins coûteux qu'Internet).
- **❌ Quand ne pas le choisir ?** Besoin immédiat → Site-to-Site VPN (opérationnel en quelques heures).
- **⚠️ Piège fréquent :** **non chiffré** par défaut ; mise en service **longue** → VPN en attendant ou en secours ; **un seul lien = point unique de défaillance**.
- **🎯 Réflexe examen :** débit dédié et stable → **Direct Connect**
- **🔑 Mots-clés :** `dedicated connection` · `hosted connection` · `private VIF` · `transit VIF` · `Direct Connect Gateway`

### 🔄 Diffusion mondiale : CloudFront vs Global Accelerator vs Route 53

:::note[📌 Analogie : livrer le monde entier]
**CloudFront** est un **réseau de supérettes de proximité** qui gardent en rayon les produits les plus demandés (cache). **Global Accelerator** est une **autoroute privée avec deux entrées fixes** (IP anycast) qui vous mène au bon entrepôt sans rien stocker en route. **Route 53** est l'**annuaire et le GPS** : il donne l'adresse, mais ne transporte rien.
:::

| Critère | CloudFront | Global Accelerator | Route 53 |
|---|---|---|---|
| Rôle | CDN : cache HTTP(S) en périphérie | accélération réseau via le backbone AWS | DNS : résolution et routage |
| Protocoles | HTTP, HTTPS, WebSocket | **TCP, UDP** | DNS |
| Mise en cache | **oui** | **non** | non |
| IP statiques | non | **2 IP anycast** | — |
| Bascule | entre origines | régionale, **rapide** (pas de cache DNS) | sur health check, dépend du TTL DNS |
| Ce qu'il ne fait pas | pas d'IP anycast statiques pour TCP/UDP | aucune mise en cache | ne restaure ni données ni calcul |
| Réflexe | HTTP + cache mondial | TCP/UDP + IP fixes + bascule rapide | DNS, latence, géolocalisation, failover |

### Amazon CloudFront

`D3` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Un CDN qui met en cache le contenu HTTP(S), statique ou dynamique, au plus près des utilisateurs.
- **✅ Quand le choisir ?** Utilisateurs dispersés dans le monde, contenu statique ou API à accélérer, réduction des coûts de sortie de l'origine.
- **❌ Quand ne pas le choisir ?** Trafic TCP/UDP non HTTP ou IP fixes exigées → Global Accelerator.
- **⚠️ Piège fréquent :** origine S3 protégée par **OAC** ; certificat ACM obligatoirement en **us-east-1** ; **signed URL** pour un fichier, **signed cookies** pour plusieurs.
- **🎯 Réflexe examen :** HTTP + cache mondial → **CloudFront**
- **🔑 Mots-clés :** `edge location` · `OAC` · `signed URL` · `signed cookies` · `geo restriction`

### AWS Global Accelerator

`D3` · 🟠 Niveau 2

- **🔍 À quoi sert-il ?** Fournir deux IP anycast statiques et faire entrer le trafic sur le réseau AWS au point le plus proche de l'utilisateur.
- **✅ Quand le choisir ?** Jeux, VoIP, IoT en TCP/UDP ; IP fixes à mettre en liste blanche ; bascule régionale rapide.
- **❌ Quand ne pas le choisir ?** Contenu HTTP à mettre en cache → CloudFront.
- **⚠️ Piège fréquent :** croire que Global Accelerator met en cache comme CloudFront.
- **🎯 Réflexe examen :** TCP/UDP mondial + IP statiques → **Global Accelerator**

### Amazon Route 53

`D2` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Le DNS managé d'AWS : résolution de noms, health checks et politiques de routage.
- **✅ Quand le choisir ?** Router selon la latence, la géographie ou un poids ; bascule DNS actif-passif.
- **❌ Quand ne pas le choisir ?** Restaurer des données ou démarrer une infrastructure de secours : Route 53 ne fait que **diriger** le trafic.
- **⚠️ Piège fréquent :** pour l'**apex du domaine** (exemple.com) vers un ALB, utiliser un **enregistrement alias**, pas un CNAME.
- **🎯 Réflexe examen :** DNS / failover → **Route 53**

| Politique de routage | Usage |
|---|---|
| **Simple** | une ressource, sans logique particulière |
| **Weighted** | répartition par poids : tests A/B, migration progressive |
| **Latency** | meilleur temps de réponse pour l'utilisateur |
| **Failover** | actif-passif avec health check |
| **Geolocation** | selon le pays ou le continent : conformité, contenu localisé |
| **Geoproximity** | selon la distance, avec un biais pour déplacer le trafic |
| **Multivalue** | plusieurs IP saines renvoyées |

:::caution[⚠️ Pièges réseau]
- **Peering non transitif** : A–B et B–C ne relient pas A et C → **Transit Gateway**.
- **Gateway Endpoint** : S3 et DynamoDB seulement, dans la même Région.
- **NAT Gateway zonale** : une par AZ, sinon toute la sortie Internet dépend d'une seule AZ.
- Un **Security Group** n'a pas de règle de refus : bloquer une IP → **NACL** ou **WAF**.
- **CloudFront** met en cache ; **Global Accelerator** fournit des IP anycast, sans cache.
- **Apex du domaine** vers un ALB : enregistrement **alias** Route 53, pas un CNAME.
:::

## 7 · 🔐 Sécurité, identité et conformité

> **Question clé :** le besoin relève-t-il de l'**identité** (qui ?), du **chiffrement** (protéger la donnée), de la **protection** (bloquer une attaque) ou de la **détection** (voir et prouver) ? `D1` représente **30 %** de l'examen.

:::note[📌 Analogie : un immeuble de bureaux sécurisé]
- **Identité** = les **badges** : qui entre, et dans quelles pièces (IAM, IAM Identity Center, Cognito).
- **Chiffrement** = le **coffre-fort** et ses clés (KMS, Secrets Manager, CloudHSM).
- **Protection** = les **portiques et les vigiles** à l'entrée (WAF, Shield, Network Firewall).
- **Détection et audit** = les **caméras et le registre des visites** (GuardDuty, CloudTrail, Config).
:::

### Les services par famille

| Famille | Service | Rôle en une ligne |
|---|---|---|
| 🪪 Identité | **IAM** | permissions AWS : utilisateurs, rôles, politiques |
| 🪪 Identité | **IAM Identity Center** | employés, authentification unique (SSO) sur plusieurs comptes |
| 🪪 Identité | **Cognito** | clients web/mobile : user pool = connexion ; identity pool = accès AWS temporaire |
| 🪪 Identité | **Organizations + SCP** | garde-fous multi-comptes |
| 🪪 Identité | **Directory Service** | Active Directory managé, ou AD Connector vers l'AD existant |
| 🔑 Chiffrement | **KMS** | clés, chiffrement d'enveloppe, audit par CloudTrail |
| 🔑 Chiffrement | **Secrets Manager** | mots de passe et secrets, avec rotation automatique |
| 🔑 Chiffrement | **Parameter Store** | configuration et SecureString, sans rotation native |
| 🔑 Chiffrement | **CloudHSM** | HSM dédié, contrôle exclusif des clés |
| 🔑 Chiffrement | **ACM** | certificats TLS publics gratuits, renouvelés automatiquement |
| 🛡️ Protection | **WAF** | injection SQL, XSS, limitation de débit, filtrage géographique (couche 7) |
| 🛡️ Protection | **Shield** | DDoS : Standard gratuit (L3/L4) ; Advanced : L7, équipe de réponse, protection des coûts |
| 🛡️ Protection | **Network Firewall** | inspection du trafic du VPC, filtrage de domaines |
| 🛡️ Protection | **Firewall Manager** | règles WAF, Security Groups et Shield sur toute l'organisation |
| 🔎 Détection | **GuardDuty** | menaces actives (analyse CloudTrail, VPC Flow Logs, DNS) |
| 🔎 Détection | **Inspector** | vulnérabilités (CVE) sur EC2, ECR, Lambda |
| 🔎 Détection | **Macie** | données sensibles (PII) dans S3 |
| 🔎 Détection | **Detective** | investigation, recherche de la cause racine |
| 🔎 Détection | **Security Hub** | vue centralisée et conformité (CSPM) |

### Quel service de sécurité choisir ?

| Besoin | Service AWS | Pourquoi ? | Piège / distracteur |
|---|---|---|---|
| Une application (EC2, Lambda, ECS) appelle AWS | **rôle IAM** | identifiants temporaires, renouvelés automatiquement | clés d'accès dans le code ou la configuration |
| Employés, SSO sur plusieurs comptes | **IAM Identity Center** | identité centrale, fédération avec l'annuaire d'entreprise | un utilisateur IAM par compte ; Cognito |
| Clients d'une application web/mobile | **Cognito** | inscription, connexion, MFA, fédération sociale | IAM Identity Center (réservé aux employés) |
| Garde-fous sur tous les comptes | **Organizations + SCP** | plafond de permissions imposé | croire qu'une SCP **accorde** des droits |
| Mot de passe de base + rotation | **Secrets Manager** | rotation native (intégrée à RDS) | Parameter Store : pas de rotation native |
| Clés de chiffrement des services AWS | **KMS** | intégré à S3, EBS, RDS…, audit CloudTrail | CloudHSM sans exigence de HSM dédié |
| HSM dédié, contrôle exclusif des clés | **CloudHSM** | matériel mono-locataire sous votre contrôle | KMS : service partagé géré par AWS |
| Certificats TLS publics | **ACM** | gratuits, renouvelés automatiquement | certificat pour CloudFront créé hors us-east-1 |
| Injection SQL, XSS, limitation de débit | **WAF** | inspecte le contenu HTTP | Security Group : ne voit pas le contenu |
| Attaque DDoS | **Shield** | Standard automatique ; Advanced pour L7 et protection des coûts | WAF seul |
| Accès shell sans SSH ni bastion | **Systems Manager Session Manager** | accès audité, sans port entrant | bastion avec le port 22 ouvert |

### AWS IAM

`D1` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Définir **qui** peut faire **quoi**, sur **quelles** ressources AWS.
- **✅ Quand le choisir ?** Toujours, selon le principe du **moindre privilège**. EC2, Lambda ou ECS qui accèdent à AWS → **rôle**, jamais de clés d'accès dans le code. Accès inter-comptes → rôle + *trust policy*.
- **❌ Quand ne pas le choisir ?** Authentifier les clients d'une application → Cognito ; SSO des employés sur de nombreux comptes → IAM Identity Center.
- **⚠️ Piège fréquent :** un **refus explicite l'emporte** sur toute autorisation. Une **SCP** est un plafond : elle n'accorde rien. Une **permissions boundary** plafonne une identité.
- **🎯 Réflexe examen :** application qui appelle AWS → **rôle IAM**
- **🔑 Mots-clés :** `role` · `policy` · `least privilege` · `SCP` · `permissions boundary` · `AssumeRole`

```text
 Évaluation simplifiée d'une requête API

 Refus explicite quelque part ? ─────────────────── oui ──► REFUSÉ
        │ non
        ▼
 SCP et permissions boundary autorisent ? ───────── non ──► REFUSÉ
        │ oui
        ▼
 Une politique (identité ou ressource) autorise ? ─ non ──► REFUSÉ (refus implicite)
        │ oui
        ▼
     AUTORISÉ
```

### AWS Organizations et SCP

`D1` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Regrouper les comptes AWS, centraliser la facturation et imposer des garde-fous par **SCP** (Service Control Policies).
- **✅ Quand le choisir ?** Interdire une action sur tous les comptes d'une unité organisationnelle (désactiver CloudTrail, utiliser une Région non autorisée…).
- **❌ Quand ne pas le choisir ?** Donner une permission à quelqu'un → politique IAM.
- **⚠️ Piège fréquent :** une SCP **n'accorde jamais** de droit ; elle **limite** ce que les politiques IAM peuvent accorder.
- **🎯 Réflexe examen :** garde-fous multi-comptes → **SCP**

### Amazon Cognito

`D1` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Authentifier les utilisateurs d'une application web ou mobile.
- **✅ Quand le choisir ?** **User pool** : inscription, connexion, MFA, fédération sociale ou SAML, jetons JWT. **Identity pool** : identifiants AWS temporaires (par exemple pour envoyer directement une photo dans S3).
- **❌ Quand ne pas le choisir ?** Employés et accès multi-comptes → IAM Identity Center.
- **⚠️ Piège fréquent :** confondre *user pool* (qui êtes-vous ?) et *identity pool* (quels droits AWS temporaires recevez-vous ?).
- **🎯 Réflexe examen :** clients d'une application → **Cognito**

### AWS KMS

`D1` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Créer et contrôler les clés de chiffrement utilisées par les services AWS.
- **✅ Quand le choisir ?** Chiffrement au repos de S3, EBS, RDS, DynamoDB… avec contrôle d'accès aux clés et audit de chaque usage.
- **❌ Quand ne pas le choisir ?** HSM dédié imposé par la conformité → CloudHSM ; stockage d'un mot de passe → Secrets Manager.
- **⚠️ Piège fréquent :** partage entre comptes → **clé gérée par le client** (une clé gérée par AWS n'est pas partageable). L'accès dépend de la **key policy** et d'IAM. **Clé supprimée = données perdues** (suppression après 7 à 30 jours d'attente).
- **🎯 Réflexe examen :** clés cryptographiques → **KMS** ; HSM imposé → **CloudHSM**
- **🔑 Mots-clés :** `customer managed key` · `key policy` · `envelope encryption` · `rotation` · `multi-Region key`

#### 🔐 Chiffrement : quelle option ?

| Option | Qui gère la clé ? | Quand la choisir ? |
|---|---|---|
| **SSE-S3** | S3 (**par défaut**) | chiffrement au repos sans exigence particulière |
| **SSE-KMS** | KMS | contrôler l'accès à la clé et auditer chaque usage |
| **DSSE-KMS** | KMS, double couche | exigence réglementaire de double chiffrement |
| **SSE-C** | le client, fournie à chaque requête | le client garde ses clés hors d'AWS |
| **Chiffrement côté client** | le client | AWS ne doit jamais voir les données en clair |
| **En transit** | ACM (TLS) | HTTPS ; à imposer sur S3 avec `aws:SecureTransport` |

### AWS Secrets Manager

`D1` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Stocker des secrets (mots de passe, clés d'API) et les **faire tourner automatiquement**.
- **✅ Quand le choisir ?** Identifiants de base de données à renouveler sans intervention ; secrets répliqués dans plusieurs Régions.
- **❌ Quand ne pas le choisir ?** Simple paramètre de configuration, sans rotation → Parameter Store (moins cher).
- **⚠️ Piège fréquent :** répondre Parameter Store alors que l'énoncé exige une **rotation automatique**.
- **🎯 Réflexe examen :** mot de passe + rotation → **Secrets Manager**

| Critère | Secrets Manager | Parameter Store |
|---|---|---|
| Usage | secrets : mots de passe, clés d'API | configuration, secrets simples |
| Rotation | **native** (intégrée à RDS, ou via Lambda) | non native |
| Multi-Région | réplication de secrets | non |
| Coût | par secret et par appel | niveau standard gratuit |

### AWS WAF · AWS Shield

`D1` · 🔴 Niveau 1

- **🔍 À quoi servent-ils ?** **WAF** filtre les requêtes web malveillantes (couche 7). **Shield** protège contre les attaques DDoS.
- **✅ Quand les choisir ?** WAF sur CloudFront, ALB, API Gateway, AppSync ou Cognito : règles managées, règles basées sur le débit (*rate-based*), listes d'IP. **Shield Advanced** pour le DDoS applicatif, l'équipe de réponse AWS et la protection des coûts.
- **❌ Quand ne pas les choisir ?** Filtrer du trafic non HTTP dans le VPC → Network Firewall ou NACL.
- **⚠️ Piège fréquent :** un **Security Group ne voit pas une injection SQL**. Bloquer une IP → NACL ou WAF.
- **🎯 Réflexe examen :** SQLi / XSS → **WAF** · DDoS → **Shield**

### AWS Systems Manager

`D1` · 🟠 Niveau 2

- **🔍 À quoi sert-il ?** Gérer une flotte d'instances : accès shell sans SSH (**Session Manager**), correctifs (**Patch Manager**), exécution de commandes, paramètres (**Parameter Store**).
- **✅ Quand le choisir ?** Supprimer les bastions et le port 22 ; automatiser correctifs et remédiations.
- **❌ Quand ne pas le choisir ?** Rotation de secrets → Secrets Manager.
- **🎯 Réflexe examen :** accès aux instances sans SSH ni bastion → **Session Manager**

### 🔄 Détection et audit : qui fait quoi ?

| Besoin | Service | Analogie |
|---|---|---|
| Menace active, compte compromis | **GuardDuty** | l'alarme anti-intrusion |
| Vulnérabilité logicielle (CVE) | **Inspector** | le contrôle technique |
| Données personnelles (PII) dans S3 | **Macie** | le détecteur de documents confidentiels |
| Investigation, cause racine | **Detective** | l'enquêteur |
| Vue centralisée, conformité | **Security Hub** | le tableau de bord du responsable sécurité |
| Qui a appelé quelle API, quand | **CloudTrail** | le registre des visites |
| Historique et conformité de la configuration | **AWS Config** | l'album photo de l'état du bâtiment au fil du temps |
| Métriques, logs, alarmes | **CloudWatch** | les jauges et alarmes du tableau de bord |

:::danger[⚠️ Piège d'examen : CloudTrail ≠ Config ≠ CloudWatch]
**CloudTrail** répond à « **qui** a fait **quoi** ? » (appels d'API). **Config** répond à « **à quoi ressemblait** la ressource et est-elle **conforme** ? ». **CloudWatch** répond à « **comment se porte** le système ? » (métriques, logs, alarmes).
:::

### 🏢 Gouvernance multi-comptes

**Organizations + SCP** pour les garde-fous · **Control Tower** pour une landing zone avec garde-fous prêts à l'emploi · **IAM Identity Center** pour l'accès des employés · **RAM** pour partager des ressources · **trail CloudTrail d'organisation** · **agrégateur Config** · **administrateur délégué** pour GuardDuty et Security Hub.

:::caution[⚠️ Pièges sécurité]
- **GuardDuty détecte, mais ne corrige pas** : remédier avec EventBridge + Lambda ou Systems Manager.
- **Ressource existante non chiffrée** : snapshot ou copie chiffrée, puis restauration.
- **HTTPS obligatoire sur S3** : condition `aws:SecureTransport` dans la bucket policy.
- **Clé KMS gérée par AWS** : non partageable entre comptes → clé gérée par le client.
- **Cognito** pour les clients, **IAM Identity Center** pour les employés.
:::

## 8 · 🛟 Résilience et reprise après sinistre

> **Question clé :** quels **RPO** et **RTO** sont exigés ? Quelle est la stratégie **la moins chère** qui les respecte ? `D2` représente **26 %** de l'examen.

### 🔄 Le comparatif à maîtriser : sauvegarde ≠ haute disponibilité ≠ reprise après sinistre

| Critère | Sauvegarde | Haute disponibilité | Reprise après sinistre (DR) |
|---|---|---|---|
| **Protège contre** | erreur humaine, suppression, corruption, rançongiciel | panne d'une instance ou d'une **AZ** | perte d'une **Région** entière |
| **Principe** | revenir à un **point passé** | **continuer** malgré la panne | **redémarrer ailleurs** selon le RPO et le RTO |
| **Services** | AWS Backup, snapshots, PITR, versioning S3 | Multi-AZ, ASG + ELB, Aurora | réplication inter-Région, AWS DRS, Route 53 failover |
| **Ne fait pas** | ne maintient pas le service en ligne | ne protège pas d'une corruption (elle est répliquée) | ne remplace pas la sauvegarde |
| **Analogie** | la **photocopie** des documents rangée au coffre | le **copilote** dans le cockpit | l'**avion de secours** dans un autre aéroport |

:::danger[⚠️ Pièges majeurs]
- **Sauvegarder ≠ maintenir un service disponible.**
- **Réplication ≠ sauvegarde** : une corruption ou une suppression est répliquée aussitôt → PITR, versioning, AWS Backup.
- **Multi-AZ protège d'une panne d'AZ, pas d'une panne régionale.**
:::

### ⏱️ RPO et RTO

```text
      dernier point          incident          service
      récupérable                              rétabli
            │                    │                 │
  ──────────●────────────────────╳─────────────────●──────►  temps
            ◄─────── RPO ───────►◄────── RTO ──────►
             données qu'on        durée d'arrêt
             accepte de perdre    acceptable
```

- **RPO** (*Recovery Point Objective*) : combien de **données** peut-on perdre ? Il fixe la **fréquence** des sauvegardes ou de la réplication.
- **RTO** (*Recovery Time Objective*) : combien de **temps** le service peut-il rester arrêté ? Il fixe le niveau de **préparation** de l'environnement de secours.

:::tip[💡 À retenir]
Plus le RPO et le RTO sont courts, plus la stratégie est chère. L'examen attend presque toujours **la stratégie la moins coûteuse qui respecte les deux objectifs**, pas la plus robuste.
:::

### ♻️ Quatre stratégies, de la moins chère à la plus rapide

| Stratégie | Coût | RTO / RPO | Région de secours | Mise en œuvre type |
|---|---|---|---|---|
| **Backup & Restore** | faible | heures | sauvegardes + infrastructure as code | AWS Backup (copies inter-Régions) + CloudFormation |
| **Pilot Light** | faible à moyen | dizaines de minutes | données répliquées, calcul éteint | réplica de base, AMI prêtes, instances à démarrer |
| **Warm Standby** | moyen à élevé | minutes | pile complète réduite, active | ASG réduit, agrandi à la bascule + Route 53 failover |
| **Multi-site actif-actif** | élevé | quasi nul | trafic réel dans 2 Régions | Aurora Global Database, DynamoDB Global Tables |

```text
 coût ▲
      │                                          ● Multi-site actif-actif
      │                             ● Warm Standby
      │                ● Pilot Light
      │   ● Backup & Restore
      └──────────────────────────────────────────────────────────►
                                           RTO / RPO de plus en plus courts
```

:::note[📌 Analogie : la maison de secours]
- **Backup & Restore** : les plans et les matériaux sont stockés ailleurs ; après l'incendie, on **reconstruit** la maison.
- **Pilot Light** : la **veilleuse de la chaudière** brûle en permanence (les données sont répliquées) ; on rallume le brûleur (le calcul) au besoin.
- **Warm Standby** : une **résidence secondaire meublée**, chauffage au minimum ; il suffit de monter le thermostat.
- **Multi-site actif-actif** : **deux maisons habitées** en permanence.
:::

### Services de résilience

| Service | Rôle en résilience / DR | À retenir |
|---|---|---|
| **AWS Backup** | sauvegardes centralisées, copies inter-Régions et inter-comptes, Vault Lock | tester les restaurations |
| **AWS DRS** | réplication continue de serveurs, lancement sur EC2 après sinistre | RPO en secondes, RTO en minutes ; MGN = migration |
| **Route 53 failover** | bascule DNS actif-passif sur health check | ne restaure pas les données |
| **Aurora Global Database** | relationnel multi-Région | RPO d'environ 1 s, RTO inférieur à 1 min |
| **DynamoDB Global Tables** | NoSQL multi-Région, multi-écriture | le dernier écrivain gagne (mode par défaut) |
| **S3 CRR** | copie des objets entre Régions | versioning requis ; RTC : délai garanti de 15 min |
| **RDS Read Replica inter-Région** | PRA relationnel économique | promotion manuelle |
| **CloudFormation** | recréer une pile à l'identique dans une autre Région | base des stratégies Backup & Restore et Pilot Light |
| **CloudWatch** | métriques, logs, alarmes | déclenche Auto Scaling, notifications et remédiations |

### AWS Backup

`D2` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Définir des politiques de sauvegarde centralisées, multi-services et multi-comptes.
- **✅ Quand le choisir ?** Sauvegarder EC2, EBS, RDS, DynamoDB, EFS, FSx… avec une rétention commune, des copies inter-Régions et une protection contre la suppression (**Vault Lock**).
- **❌ Quand ne pas le choisir ?** Maintenir le service en ligne pendant une panne → Multi-AZ, Auto Scaling.
- **⚠️ Piège fréquent :** AWS Backup **n'assure pas la haute disponibilité**. La fréquence doit être **inférieure ou égale au RPO**, et la durée de restauration testée **inférieure ou égale au RTO**.
- **🎯 Réflexe examen :** sauvegarde centralisée + rétention → **AWS Backup**
- **🔑 Mots-clés :** `backup plan` · `backup vault` · `Vault Lock` · `cross-Region copy` · `restore testing`

### AWS Elastic Disaster Recovery (DRS)

`D2` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Répliquer en continu des serveurs (sur site ou EC2) et les relancer sur EC2 après un sinistre.
- **✅ Quand le choisir ?** PRA de serveurs avec un RPO en secondes et un RTO en minutes, sans refonte de l'application.
- **❌ Quand ne pas le choisir ?** Migration définitive → **MGN** ; bases managées → Multi-AZ, Aurora Global Database.
- **⚠️ Piège fréquent :** confondre **DRS** (reprise après sinistre) et **MGN** (migration).
- **🎯 Réflexe examen :** PRA de serveurs → **AWS DRS**

### ✅ Haute disponibilité : la checklist Multi-AZ

- Auto Scaling sur **au moins 2 AZ** derrière un **ELB**.
- **RDS Multi-AZ** ou **Aurora**.
- **S3, DynamoDB et EFS Regional** sont multi-AZ par nature.
- **Une NAT Gateway par AZ.**
- **SQS** entre les couches pour absorber les pics et les pannes temporaires.
- Instances **sans état** : sessions dans ElastiCache ou DynamoDB.
- **Health checks** Route 53 et ELB.

### 🎯 De l'énoncé à la réponse

| Indice de l'énoncé | Réponse attendue |
|---|---|
| RPO 24 h, RTO 48 h, budget minimal | **Backup & Restore** : AWS Backup avec copies inter-Régions + IaC |
| RTO de quelques heures, données déjà répliquées, calcul éteint | **Pilot Light** |
| RTO de quelques minutes, coût maîtrisé | **Warm Standby** + Route 53 failover |
| Aucune interruption, utilisateurs sur plusieurs continents | **Actif-actif multi-Région** (Aurora Global Database, DynamoDB Global Tables) |
| Serveurs sur site : RPO en secondes, RTO en minutes | **AWS DRS** |
| Suppression accidentelle d'objets S3 | **Versioning** (+ MFA Delete ou Object Lock) |
| Corruption logique d'une base | **Restauration PITR** : la réplication propagerait l'erreur |

## 9 · 📊 Analytics et migration

> **Question clé :** quel est le **verbe** de l'énoncé ? **Interroger**, **transformer**, **livrer**, **visualiser**, **migrer** ? Ces services servent souvent de distracteurs : on les reconnaît à leur verbe.

### Analytics

```text
 INGÉRER              STOCKER            CATALOGUER           INTERROGER / VISUALISER
 Kinesis Data   ──►   Amazon S3    ──►   AWS Glue       ──►   Athena (SQL ad hoc)
 Streams              data lake          Data Catalog         Redshift (BI, OLAP)
 Data Firehose                           Lake Formation       EMR (Spark, Hadoop)
                                         (droits fins)        QuickSight (tableaux de bord)
```

| Besoin | Service AWS | Pourquoi ? | Piège / distracteur |
|---|---|---|---|
| SQL ad hoc directement sur S3 | **Athena** | serverless, facturé au volume scanné | Redshift : entrepôt à charger et à dimensionner |
| ETL serverless, catalogue de données | **Glue** | crawlers → Data Catalog ; jobs Spark | EMR : cluster à gérer |
| Data warehouse, BI en SQL | **Redshift** | OLAP en colonnes ; Spectrum interroge S3 ; mode Serverless | RDS : conçu pour l'OLTP |
| Spark ou Hadoop | **EMR** | frameworks big data managés ; Spot pour les nœuds de tâche | Glue, si l'énoncé exige le contrôle du cluster |
| Flux temps réel + relecture | **Kinesis Data Streams** | shards, plusieurs lecteurs | Firehose : pas de relecture |
| Livrer un flux vers S3, Redshift, OpenSearch | **Data Firehose** | quasi temps réel, sans code | Kinesis Data Streams : code à écrire |
| Tableaux de bord BI | **QuickSight** (Quick Sight) | visualisation serverless | Athena seul : pas de visualisation |
| Recherche plein texte, analyse de logs | **OpenSearch Service** | index plein texte | Athena : pas de recherche plein texte |
| Gouvernance du data lake | **Lake Formation** | droits fins sur les lignes et les colonnes | bucket policies seules |

### Amazon Athena

`D3` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Exécuter du SQL serverless directement sur des fichiers stockés dans S3, facturé au volume scanné.
- **✅ Quand le choisir ?** Requêtes ponctuelles sur des logs ou un data lake, sans infrastructure à gérer.
- **❌ Quand ne pas le choisir ?** BI intensive et récurrente sur des données structurées → Redshift.
- **⚠️ Piège fréquent :** pour réduire le coût et la durée : format **Parquet ou ORC**, **partitions**, **compression**. Les objets en Glacier Flexible Retrieval ou Deep Archive doivent d'abord être **restaurés**.
- **🎯 Réflexe examen :** SQL sur S3 sans infrastructure → **Athena**

### Amazon Data Firehose

`D3` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Livrer un flux de données vers S3, Redshift, OpenSearch ou un endpoint HTTP, sans code.
- **✅ Quand le choisir ?** Charger en continu des logs ou des événements dans un data lake, avec transformation et compression optionnelles.
- **❌ Quand ne pas le choisir ?** Relecture ou consommateurs multiples → Kinesis Data Streams.
- **⚠️ Piège fréquent :** Firehose met en **tampon** : c'est du **quasi temps réel**, sans relecture.
- **🎯 Réflexe examen :** flux → S3 sans code → **Data Firehose**

### AWS Glue · Amazon Redshift

`D3` · 🔴 Niveau 1

- **🔍 À quoi servent-ils ?** **Glue** découvre et catalogue les données (crawlers, Data Catalog) et les transforme (jobs ETL Spark). **Redshift** est l'entrepôt de données SQL pour l'analytique.
- **✅ Quand les choisir ?** Glue : préparer et cataloguer un data lake sans serveur. Redshift : tableaux de bord et rapports BI sur de gros volumes structurés.
- **❌ Quand ne pas les choisir ?** Transactions applicatives → RDS ou Aurora ; requête ponctuelle sur S3 → Athena.
- **⚠️ Piège fréquent :** choisir Redshift pour une application transactionnelle, ou RDS pour un entrepôt analytique.
- **🎯 Réflexe examen :** ETL serverless → **Glue** · data warehouse → **Redshift**

### 🔄 Kinesis Data Streams vs Data Firehose

| Critère | Kinesis Data Streams | Data Firehose |
|---|---|---|
| Latence | **temps réel** | **quasi temps réel** (tampon) |
| Relecture | **oui** (24 h à 365 j) | non |
| Consommateurs | plusieurs, code à écrire (Lambda, applications) | aucun code : livraison gérée |
| Destination | vos applications | S3, Redshift, OpenSearch, HTTP… |
| Capacité | shards (provisionné) ou on-demand | automatique |
| Mots de l'énoncé | `real-time` · `replay` · `multiple consumers` | `deliver` · `load into S3` · `near real-time` |

:::tip[💡 À retenir]
Les deux se combinent : **Kinesis Data Streams** pour que plusieurs applications lisent le flux en temps réel, et **Data Firehose** branché dessus pour archiver ce même flux dans S3.
:::

### Migration

:::note[📌 Analogie : déménager une entreprise]
- **MGN** déménage les **meubles tels quels** (serveurs → EC2).
- **DMS** **transvase le contenu d'une cuve** pendant qu'elle reste en service (réplication continue, CDC).
- **SCT** **traduit la notice** dans une autre langue (changement de moteur de base).
- **DataSync** est le **camion de déménagement** : un transfert planifié, en ligne.
- **Storage Gateway** est le **garde-meubles** avec une petite étagère conservée chez vous (cache local).
- **Snow Family** est le **conteneur physique** expédié par transporteur quand la route (le réseau) est trop lente.
:::

| Besoin | Service AWS | Pourquoi ? | Piège / distracteur |
|---|---|---|---|
| Serveur → EC2 (lift-and-shift) | **MGN** | réplication puis bascule, sans refonte | DRS : c'est la reprise après sinistre |
| Base, faible interruption | **DMS** (CDC) | réplication continue pendant la migration | export / import avec arrêt prolongé |
| Changement de moteur | **SCT** (ou DMS Schema Conversion) + **DMS** | conversion du schéma, puis des données | DMS seul : ne convertit pas le schéma |
| Fichiers ou NAS, en ligne | **DataSync** | transfert planifié, vérifié, accéléré | Storage Gateway : hybride permanent |
| SFTP imposé par des partenaires | **Transfer Family** | SFTP/FTPS managé vers S3 ou EFS | serveur SFTP sur EC2 |
| Hybride durable | **Storage Gateway** | cache local, protocoles standards | DataSync : transfert ponctuel |
| Très gros volume, réseau trop lent | **Snow Family** (offre restreinte) | transfert physique hors ligne | DataSync sur un lien saturé |
| PRA de serveurs | **AWS DRS** | réplication continue, relance sur EC2 | MGN : migration définitive |

:::caution[⚠️ Pièges migration]
- **MGN = migrer** · **DRS = reprise après sinistre**.
- **DataSync** = transfert en ligne planifié · **Snow Family** = hors ligne, si le réseau est trop lent.
- **Même moteur** → DMS seul · **moteur différent** → SCT (ou DMS Schema Conversion) + DMS.
- **Transfer Family** dès que des partenaires imposent SFTP ou FTPS.
:::

### 🔵 Niveau 3 — à reconnaître en une ligne

| Service | En une ligne |
|---|---|
| **Data Exchange** | abonnement à des jeux de données tiers |
| **Application Discovery Service** | inventaire des serveurs et dépendances avant une migration |
| **OpenSearch Service** | recherche plein texte et analyse de logs |
| **Lake Formation** | gouvernance et droits fins sur un data lake |

## 10 · 💰 Optimisation des coûts

> **Question clé :** quelle est la solution **la moins chère** qui respecte **toutes** les contraintes ? `D4` représente **20 %** de l'examen, mais la notion de coût apparaît dans presque toutes les questions.

:::note[📌 Analogie : se déplacer en ville]
- **On-Demand** : le **taxi au compteur** — aucun engagement, le tarif le plus élevé.
- **Savings Plans** : l'**abonnement de transport** — un engagement de dépense, valable sur plusieurs lignes.
- **Reserved Instances** : la **location longue durée d'un modèle précis**.
- **Spot** : la **place de dernière minute sur un vol** — jusqu'à −90 %, mais on peut vous débarquer avec 2 minutes de préavis.
- **Dedicated Host** : **louer l'avion entier**, pour des raisons de licence ou de conformité.
:::

### Quel modèle d'achat choisir ?

```text
 La charge peut-elle être interrompue sans dommage ?
 ├── oui ──────────────────────────────────────► Spot (jusqu'à −90 %)
 └── non ──► Est-elle stable sur 1 à 3 ans ?
             ├── oui ──► Savings Plans (Compute SP = le plus flexible)
             │           ou Reserved Instances (RDS, ElastiCache, Redshift…)
             └── non ──► On-Demand

 Licence par socket ou par cœur ? ─────────────► Dedicated Hosts
 Capacité garantie dans une AZ précise ? ──────► Capacity Reservations
```

| Besoin | Modèle d'achat | Pourquoi ? | Piège / distracteur |
|---|---|---|---|
| Court terme, imprévisible | **On-Demand** | aucun engagement | Savings Plans sur une charge qui va disparaître |
| Consommation stable sur 1 ou 3 ans | **Savings Plans** | remise contre engagement de dépense horaire | croire qu'ils réservent de la capacité |
| Type d'instance fixe ; RDS, ElastiCache, Redshift | **Reserved Instances** | remise sur une configuration précise | Spot pour une base de données |
| Charge interruptible (batch, CI, big data) | **Spot** | jusqu'à −90 %, préavis de 2 min | Spot pour une charge critique non interruptible |
| Licences par socket ou par cœur, conformité | **Dedicated Hosts** | visibilité sur le serveur physique | Dedicated Instances : pas de visibilité sur les sockets |
| Capacité garantie dans une AZ | **Capacity Reservations** | réservation de capacité, sans engagement de durée | Savings Plans ou RI régionales : pas de capacité réservée |

### AWS Savings Plans

`D4` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** S'engager sur une dépense horaire pendant 1 ou 3 ans, en échange d'une remise.
- **✅ Quand le choisir ?** Usage stable et durable : la base de consommation qui tourne en permanence.
- **❌ Quand ne pas le choisir ?** Charge temporaire ou en forte décroissance → On-Demand ; charge interruptible → Spot.
- **⚠️ Piège fréquent :** **dimensionner d'abord** (Compute Optimizer), **s'engager ensuite** sur la base stable. Un Savings Plan **ne réserve pas de capacité**.
- **🎯 Réflexe examen :** usage stable et durable → **Savings Plans**

| Type | Couverture | Remise |
|---|---|---|
| **Compute Savings Plans** | EC2 (toutes familles, toutes Régions), Fargate, Lambda | bonne, flexibilité maximale |
| **EC2 Instance Savings Plans** | une famille d'instances dans une Région | plus forte, moins de flexibilité |

### Instances Spot

`D4` · 🔴 Niveau 1

- **🔍 À quoi sert-il ?** Utiliser la capacité EC2 inutilisée, jusqu'à −90 %, reprise par AWS avec un préavis de 2 minutes.
- **✅ Quand le choisir ?** Batch, intégration continue, big data, conteneurs sans état, nœuds de tâche EMR.
- **❌ Quand ne pas le choisir ?** Base de données, charge non interruptible, capacité minimale critique → On-Demand ou Savings Plans.
- **⚠️ Piège fréquent :** **diversifier** les types d'instances et les AZ (stratégie *price-capacity-optimized*) et prévoir des **points de reprise** (checkpoints).
- **🎯 Réflexe examen :** tolérant aux interruptions → **Spot**

### Outils et leviers de coût

| Outil | À quoi sert-il ? |
|---|---|
| **Cost Explorer** | comprendre et prévoir les dépenses |
| **Budgets** | alerter, voire déclencher une action, quand un seuil est dépassé |
| **Data Exports (CUR)** | export détaillé de la facturation, à analyser avec Athena |
| **Compute Optimizer** | recommandations de dimensionnement (rightsizing) |
| **Trusted Advisor** | recommandations sur les coûts, la sécurité et les quotas |
| **Cost Anomaly Detection** | détection des dérives de dépenses |
| **Tags de répartition des coûts** | coût par équipe, projet ou environnement |

| Levier | Effet |
|---|---|
| **S3 Lifecycle / Intelligent-Tiering** | faire descendre les données froides vers des classes moins chères |
| **gp2 → gp3** | même performance de base, coût de stockage réduit, IOPS et débit réglables |
| **Graviton** (ARM) | meilleur rapport prix/performance pour les charges compatibles |
| **Gateway Endpoint au lieu de la NAT Gateway** | supprimer les frais de traitement NAT pour le trafic vers S3 et DynamoDB |
| **CloudFront** | réduire les coûts de sortie de données depuis l'origine |
| **Arrêt du hors-production** | éteindre les environnements de test la nuit et le week-end |

:::caution[⚠️ Pièges coûts]
- **Savings Plans et RI régionales ne réservent pas de capacité** → Capacity Reservations si la capacité doit être garantie.
- Le **transfert de données entre AZ est payant**.
- **Fargate** réduit l'exploitation, pas forcément la facture.
- Les **durées minimales de stockage** S3 (30, 90, 180 jours) sont facturées même si l'objet est supprimé avant.
- **MOST cost-effective** ne veut jamais dire « le moins cher tout court » : la solution doit respecter **toutes** les contraintes.
:::

### 🔵 Niveau 3 — à reconnaître en une ligne

| Service | En une ligne |
|---|---|
| **Trusted Advisor** | recommandations sur les coûts, la sécurité et les quotas |
| **Cost Anomaly Detection** | alerte sur les dérives de dépenses inhabituelles |

## 11 · 🧪 Entraînement : mini-scénarios d'architecture

Ces scénarios sont des **exercices originaux** construits sur le modèle des questions d'architecture : un contexte, des contraintes, un critère de choix. Appliquez la méthode en 6 étapes, formulez votre réponse, **puis** dépliez l'analyse.

### Scénario 1 — Les commandes du vendredi soir

Une boutique en ligne reçoit des pics de commandes le vendredi soir. Le service de facturation, plus lent, ralentit tout le site et des commandes sont parfois perdues. L'équipe veut **découpler** les deux services **sans perdre de commande**, avec le **moins d'exploitation possible**.

<details>
<summary><strong>🎯 Voir l'analyse</strong></summary>

**Réponse :** placer une **file SQS** entre le site et la facturation ; les workers de facturation consomment la file et scalent sur le **backlog par instance** ; une **DLQ** isole les commandes en échec répété.

**Pourquoi :** SQS conserve les messages jusqu'à leur traitement et absorbe le pic ; chaque commande est traitée par un seul worker.

**Pourquoi pas les autres :**
- **SNS seul** : il pousse sans stocker ; si la facturation est indisponible, le message est perdu.
- **Une instance de facturation plus grande** : scaling vertical, plafond et point unique de défaillance.
- **Kinesis Data Streams** : conçu pour des flux relus par plusieurs lecteurs, pas pour une file de travaux.

</details>

### Scénario 2 — La base qui croule sous les lectures

Une application d'actualités utilise RDS for PostgreSQL. 90 % des requêtes sont des lectures et la base sature aux heures de pointe. Par ailleurs, l'application doit **survivre à la panne d'une AZ**.

<details>
<summary><strong>🎯 Voir l'analyse</strong></summary>

**Réponse :** activer **Multi-AZ** pour la disponibilité **et** ajouter des **Read Replicas** (ou un cache **ElastiCache**) pour les lectures. Une migration vers **Aurora PostgreSQL**, avec ses réplicas qui servent à la fois de lecteurs et de cibles de bascule, répond aussi aux deux besoins.

**Pourquoi :** deux besoins distincts, deux mécanismes distincts : Multi-AZ = disponibilité, Read Replica = lectures.

**Pourquoi pas les autres :**
- **Multi-AZ seul** : le standby d'une instance classique n'est pas lisible.
- **Read Replicas seules** : la promotion est manuelle, pas de bascule automatique.
- **DynamoDB** : migration lourde et perte du modèle relationnel, sans nécessité.

</details>

### Scénario 3 — La facture NAT qui explose

Des instances EC2 situées dans des sous-réseaux privés téléchargent chaque jour plusieurs centaines de Go depuis S3, dans la même Région. Le trafic passe par une NAT Gateway dont le coût explose, et la sécurité exige que ce trafic **ne transite pas par Internet**.

<details>
<summary><strong>🎯 Voir l'analyse</strong></summary>

**Réponse :** créer un **Gateway Endpoint S3** et l'associer aux tables de routage des sous-réseaux privés.

**Pourquoi :** il est **gratuit**, garde le trafic sur le réseau AWS et supprime les frais de traitement de la NAT Gateway.

**Pourquoi pas les autres :**
- **Interface Endpoint S3** : fonctionne, mais il est payant ; inutile ici puisque l'accès se fait depuis le VPC lui-même.
- **NAT Gateway plus grande** : ne réduit pas le coût et le trafic continue de sortir vers Internet.
- **Direct Connect** : relie un datacenter à AWS, sans rapport avec le besoin.

</details>

### Scénario 4 — Les archives réglementaires intouchables

Un organisme financier doit conserver des relevés pendant **7 ans**. Ils ne doivent **jamais** pouvoir être modifiés ni supprimés, **même par un administrateur**. Ils sont rarement consultés et un délai de **12 heures** est acceptable. Le coût doit être **minimal**.

<details>
<summary><strong>🎯 Voir l'analyse</strong></summary>

**Réponse :** S3 avec **Object Lock en mode Compliance** (rétention de 7 ans) et une règle **Lifecycle** vers **Glacier Deep Archive**.

**Pourquoi :** le mode Compliance interdit toute suppression, compte root compris ; Deep Archive est la classe la moins chère, avec une restauration en 12 h maximum.

**Pourquoi pas les autres :**
- **Object Lock Governance** : contournable avec une permission spéciale.
- **Versioning seul** : un administrateur peut supprimer les versions.
- **Glacier Instant Retrieval** : accès en millisecondes inutile, donc plus cher.

</details>

### Scénario 5 — Le PRA en 10 minutes

Une application critique repose sur une base MySQL. La direction exige un **RTO de 10 minutes** et un **RPO de quelques secondes** en cas de perte de la Région, avec un **budget maîtrisé**.

<details>
<summary><strong>🎯 Voir l'analyse</strong></summary>

**Réponse :** **Warm Standby** : **Aurora Global Database** (RPO d'environ 1 s), un Auto Scaling Group réduit mais actif dans la Région de secours, agrandi lors de la bascule, et **Route 53 failover**.

**Pourquoi :** c'est la stratégie la moins chère qui respecte un RTO de quelques minutes et un RPO de quelques secondes.

**Pourquoi pas les autres :**
- **Backup & Restore** : RTO de plusieurs heures.
- **Pilot Light** : RTO de l'ordre de plusieurs dizaines de minutes, trop juste.
- **Actif-actif multi-Région** : respecte les objectifs, mais coûte plus cher que nécessaire.
- **RDS Multi-AZ** : protège d'une panne d'AZ, pas de la perte d'une Région.

</details>

### Scénario 6 — Le serveur de fichiers Windows

Une entreprise migre son serveur de fichiers Windows. Les utilisateurs accèdent aux partages en **SMB** et les droits reposent sur **Active Directory**. Le service doit être hautement disponible.

<details>
<summary><strong>🎯 Voir l'analyse</strong></summary>

**Réponse :** **Amazon FSx for Windows File Server** en déploiement **Multi-AZ**, intégré à Active Directory ; **DataSync** pour migrer les fichiers.

**Pourquoi :** SMB natif et intégration AD, sans changement pour les utilisateurs.

**Pourquoi pas les autres :**
- **EFS** : NFS pour Linux, pas SMB.
- **S3** : stockage objet, pas un partage de fichiers.
- **Storage Gateway** : pertinent pour un hybride durable, pas pour une migration complète.

</details>

### Scénario 7 — Le jeu multijoueur mondial

Un studio publie un jeu multijoueur en **UDP**. Les joueurs sont répartis sur plusieurs continents. Les opérateurs partenaires exigent **deux adresses IP fixes** à mettre en liste blanche, et la bascule entre Régions doit être **rapide**.

<details>
<summary><strong>🎯 Voir l'analyse</strong></summary>

**Réponse :** **AWS Global Accelerator** devant des **NLB** déployés dans plusieurs Régions.

**Pourquoi :** deux IP anycast statiques, prise en charge de TCP/UDP, routage par le réseau AWS et bascule régionale sans dépendre du cache DNS.

**Pourquoi pas les autres :**
- **CloudFront** : conçu pour HTTP(S) et la mise en cache.
- **Route 53 latency routing** : pas d'IP fixes, bascule soumise au TTL DNS.
- **ALB** : couche 7 uniquement, pas d'UDP.

</details>

### Scénario 8 — L'application mobile qui envoie des photos

Une application mobile grand public permet aux utilisateurs de se connecter avec leur compte Google ou Apple, puis d'envoyer des photos **directement dans S3**, sans passer par un serveur applicatif.

<details>
<summary><strong>🎯 Voir l'analyse</strong></summary>

**Réponse :** **Cognito user pool** (fédération sociale) pour l'authentification, et **Cognito identity pool** pour obtenir des **identifiants AWS temporaires** limités au préfixe S3 de l'utilisateur. Variante : un backend qui génère des **presigned URL**.

**Pourquoi :** Cognito est fait pour les **clients** d'une application ; les identifiants temporaires évitent toute clé permanente dans l'application.

**Pourquoi pas les autres :**
- **Utilisateurs IAM** : ingérables à grande échelle et contraires aux bonnes pratiques.
- **IAM Identity Center** : réservé aux employés.
- **Clés d'accès intégrées à l'application** : faille de sécurité majeure.

</details>

### Scénario 9 — Le clickstream à relire

Un site génère un flux continu de clics. **Deux équipes** doivent lire ce flux **en temps réel**, chacune à son rythme, et pouvoir **relire les 3 derniers jours**. Une copie doit aussi être **archivée dans S3**.

<details>
<summary><strong>🎯 Voir l'analyse</strong></summary>

**Réponse :** **Kinesis Data Streams** avec une rétention étendue à au moins 3 jours ; chaque équipe consomme le flux ; **Data Firehose**, branché sur le même flux, l'archive dans S3.

**Pourquoi :** Kinesis conserve le flux, permet la relecture et plusieurs consommateurs indépendants.

**Pourquoi pas les autres :**
- **SQS** : chaque message est traité par un seul consommateur puis supprimé.
- **Data Firehose seul** : ni relecture ni lecteurs multiples.
- **SNS** : aucune conservation des messages.

</details>

### Scénario 10 — Le rendu vidéo nocturne

Un studio lance chaque nuit des milliers de tâches de rendu vidéo de 30 à 90 minutes. Les tâches peuvent être **relancées sans dommage** grâce à des points de reprise. L'objectif est le **coût le plus bas**.

<details>
<summary><strong>🎯 Voir l'analyse</strong></summary>

**Réponse :** des **instances Spot** diversifiées (plusieurs types, plusieurs AZ), orchestrées par **AWS Batch** ou un Auto Scaling Group mixte.

**Pourquoi :** la charge est interruptible et ponctuelle : Spot offre jusqu'à −90 %.

**Pourquoi pas les autres :**
- **Lambda** : limité à 15 minutes par exécution.
- **Savings Plans** : supposent un usage stable et continu, pas des tâches nocturnes.
- **On-Demand** : fonctionne, mais beaucoup plus cher.

</details>

## 12 · ⚡ Fiche ultra-rapide — la veille et le matin de l'examen

**73 associations** « indice de l'énoncé → service attendu », à relire juste avant l'examen. Gardez en tête qu'**une contrainte supplémentaire peut toujours changer la réponse**.

### ⚙️ Calcul

| Indice de l'énoncé | Service |
|---|---|
| contrôle de l'OS, GPU | **EC2** |
| code événementiel court | **Lambda** |
| conteneurs, simplement | **ECS** |
| Kubernetes | **EKS** |
| conteneurs sans hôtes | **Fargate** |
| charge variable | **Auto Scaling + ELB** |
| routage par chemin / hôte HTTP | **ALB** |
| TCP/UDP, IP fixe | **NLB** |

### 💾 Stockage

| Indice de l'énoncé | Service |
|---|---|
| objets, data lake | **S3** |
| accès imprévisible | **S3 Intelligent-Tiering** |
| archive lue en millisecondes | **Glacier Instant Retrieval** |
| archive la moins chère | **Glacier Deep Archive** |
| WORM strict | **S3 Object Lock Compliance** |
| disque d'une instance | **EBS gp3** |
| fichiers Linux partagés | **EFS** |
| Windows, SMB | **FSx for Windows** |
| HPC | **FSx for Lustre** |

### 🗄️ Bases de données

| Indice de l'énoncé | Service |
|---|---|
| relationnel | **RDS** |
| MySQL/PostgreSQL critique | **Aurora** |
| disponibilité RDS | **Multi-AZ** |
| lectures RDS | **Read Replica** |
| clé-valeur à l'échelle | **DynamoDB** |
| cache générique | **ElastiCache** |
| cache DynamoDB | **DAX** |
| data warehouse | **Redshift** |
| connexions Lambda → RDS | **RDS Proxy** |

### 📨 Intégration

| Indice de l'énoncé | Service |
|---|---|
| découplage | **SQS** |
| ordre + dédoublonnage | **SQS FIFO** |
| fan-out durable | **SNS + SQS** |
| règles d'événements | **EventBridge** |
| workflow multi-étapes | **Step Functions** |
| relecture d'un flux (replay) | **Kinesis Data Streams** |
| flux → S3 sans code | **Data Firehose** |
| Kafka | **MSK** |

### 🌐 Réseau

| Indice de l'énoncé | Service |
|---|---|
| CDN HTTP | **CloudFront** |
| TCP/UDP mondial | **Global Accelerator** |
| DNS, failover | **Route 53** |
| nombreux VPC | **Transit Gateway** |
| S3 en privé sans NAT | **Gateway Endpoint** |
| API AWS en privé | **Interface Endpoint** |
| débit dédié et stable | **Direct Connect** |
| tunnel rapide à mettre en place | **Site-to-Site VPN** |
| bloquer une IP | **NACL** |

### 🔐 Sécurité

| Indice de l'énoncé | Service |
|---|---|
| application → AWS | **rôle IAM** |
| employés, multi-comptes | **IAM Identity Center** |
| clients d'une application | **Cognito** |
| garde-fous multi-comptes | **SCP** |
| mot de passe + rotation | **Secrets Manager** |
| clés cryptographiques | **KMS** |
| menace | **GuardDuty** |
| CVE | **Inspector** |
| PII dans S3 | **Macie** |
| investigation | **Detective** |
| SQLi / XSS | **WAF** |
| DDoS | **Shield** |
| audit des appels d'API | **CloudTrail** |
| état / configuration | **AWS Config** |
| métriques / alarmes | **CloudWatch** |

### 🛟 Résilience, migration et analytics

| Indice de l'énoncé | Service |
|---|---|
| sauvegarde centralisée | **AWS Backup** |
| RPO/RTO de serveurs | **AWS DRS** |
| PRA relationnel mondial | **Aurora Global Database** |
| NoSQL multi-Région | **DynamoDB Global Tables** |
| fichiers sur site → AWS | **DataSync** |
| base, faible interruption | **DMS** |
| lift-and-shift de serveurs | **MGN** |
| SQL sur S3 | **Athena** |
| ETL serverless | **Glue** |

### 💰 Coûts

| Indice de l'énoncé | Service |
|---|---|
| usage stable | **Savings Plans** |
| interruptible | **Spot** |
| rightsizing | **Compute Optimizer** |
| analyser la facture | **Cost Explorer** |
| alerter sur un seuil | **Budgets** |
| stockage froid | **S3 Lifecycle** |

### ⚠️ Les douze pièges finaux

| # | Ne pas confondre | À retenir |
|---|---|---|
| 1 | Multi-AZ et Read Replica | Multi-AZ = **disponibilité** ; Read Replica = **lectures** |
| 2 | Sauvegarde, HA et DR | trois besoins, trois solutions différentes |
| 3 | Gateway et Interface Endpoint | Gateway : **S3 et DynamoDB seulement** |
| 4 | Peering et Transit Gateway | le peering est **non transitif** |
| 5 | SQS Standard et FIFO | Standard : **doublons possibles** → idempotence |
| 6 | SNS et SNS + SQS | SNS seul ne permet pas de traitement différé |
| 7 | Lambda et calcul long | Lambda : **15 minutes maximum** |
| 8 | CloudFront et Global Accelerator | CloudFront met en cache ; Global Accelerator **non** |
| 9 | Clé KMS gérée par AWS et par le client | la clé gérée par AWS **n'est pas partageable** entre comptes |
| 10 | Savings Plans et réservation de capacité | les Savings Plans **ne réservent pas** de capacité |
| 11 | Stockage multi-AZ et mono-AZ | **One Zone-IA et EBS** : une seule AZ |
| 12 | CloudTrail et Config | CloudTrail = **qui, quelle API** ; Config = **état des ressources** |

### ⏱️ Chiffres à connaître

| Service | Chiffres clés |
|---|---|
| **Examen** | 65 questions · 130 min · 720 / 1000 |
| **Lambda** | 15 min maximum par exécution |
| **SQS** | rétention 4 j par défaut (14 j max) · visibility timeout 12 h max · long polling 20 s max · déduplication FIFO 5 min |
| **Kinesis Data Streams** | rétention de 24 h à 365 j |
| **Step Functions** | Standard : jusqu'à 1 an · Express : 5 min |
| **Spot** | préavis de 2 min · jusqu'à −90 % |
| **RDS** | sauvegardes automatiques et PITR jusqu'à 35 j |
| **Aurora** | 6 copies sur 3 AZ · 15 réplicas · Global Database : RPO d'environ 1 s, RTO inférieur à 1 min |
| **S3** | RTC : 15 min · durée minimale : 30 j (IA), 90 j (Glacier Instant et Flexible), 180 j (Deep Archive) |
| **KMS** | suppression d'une clé après 7 à 30 j d'attente |
| **CloudTrail** | 90 j d'historique d'événements sans trail |
| **ACM pour CloudFront** | certificat dans **us-east-1** |

### ✅ Avant de valider une réponse

1. **Toutes les contraintes** sont-elles respectées : protocole, OS, RPO/RTO, Région, conformité ?
2. Le **superlatif** est-il satisfait : coût, effort d'exploitation, disponibilité, performance ?
3. Reste-t-il un **point unique de défaillance** ?
4. Un **service managé** ferait-il la même chose avec moins d'exploitation ?
5. Le distracteur « **presque juste** » viole-t-il une seule exigence ?

:::tip[📥 Réviser hors connexion]
Pour une dernière relecture sur papier ou sans connexion, téléchargez la fiche originale de 10 pages :

<!-- <a href="/downloads/SERVICE_AWS_SAAC03_2026_Revision_10_Pages.pdf" download="SERVICE_AWS_SAAC03_2026_Revision_10_Pages.pdf">📥 <strong>Télécharger la fiche PDF</strong> · SERVICE_AWS_SAAC03_2026_Revision_10_Pages.pdf</a> -->
👉 [**Télécharger la fiche de révision AWS SAA-C03 — PDF**](/documents/aws/SERVICE_AWS_SAAC03_2026_Revision_Express.pdf)
:::

> **Le fil conducteur, une dernière fois :** pour chaque question, demandez-vous **quel service choisir**, **pourquoi celui-ci** et **pourquoi pas les autres**. Si vous savez répondre aux trois, vous avez trouvé la bonne réponse.
