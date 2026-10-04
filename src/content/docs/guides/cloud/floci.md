---
title: "📘 Floci pour AWS : émuler AWS en local pour développer et tester"
description:  >-
    Guide pratique pour apprendre et tester les services AWS localement avec Floci, 
    Docker, AWS CLI, Terraform/OpenTofu et Python, sans compte AWS ni facturation.
#"De l’ordonnancement à l’Automation API, Jobs as Code, CI/CD, MFT, sécurité, supervision et troubleshooting"
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

Floci est un émulateur AWS local, libre (licence MIT) et gratuit. Il expose sur votre machine, à l'adresse `http://localhost:4566`, des API compatibles avec celles d'AWS **pour les opérations prises en charge**. AWS CLI, SDK, Terraform et OpenTofu peuvent les appeler sans compte AWS ni jeton d'abonnement Floci, avec des identifiants fictifs. La compatibilité d'API ne garantit pas un comportement identique à AWS. [Source : présentation Floci](https://floci.io/floci/).

Ce guide part de zéro. Il vous emmène pas à pas du premier `docker run` jusqu'à un pipeline CI/CD qui déploie une infrastructure Terraform et exécute des tests Python contre un « AWS de poche ».

:::note[Version de référence et niveau de vérification]
**Références vérifiées le 1er octobre 2026.** Floci **2.1.0**, publiée le 15 septembre 2026, est la dernière release affichée sur [GitHub à cette date](https://github.com/floci-io/floci/releases/tag/2.1.0). Vérifiez toujours les [releases](https://github.com/floci-io/floci/releases) avant de reproduire les commandes ; une mise à jour doit être volontaire.

Les exemples ont été contrôlés dans les sources officielles, notamment dans les fichiers du **tag 2.1.0** lorsque la documentation courante a évolué. Les contrôles statiques réalisés et leurs versions figurent en fin de guide. **Les laboratoires n'ont pas été exécutés contre Floci lors de cet audit : Docker et l'AWS CLI v2 ne sont pas disponibles sur le poste de vérification.** Les sorties indiquées sont donc des résultats attendus, pas un compte rendu d'exécution.
:::

## Ce que vous allez apprendre

À la fin de ce guide, vous saurez :

- expliquer ce qu'est Floci, ce qu'est un émulateur AWS et en quoi il diffère du vrai AWS ;
- installer les prérequis et lancer Floci avec Docker et Docker Compose ;
- configurer l'AWS CLI pour viser Floci, et vérifier que vous ne visez **pas** le vrai AWS ;
- manipuler S3, DynamoDB, SQS, SSM, IAM, Lambda et EC2 en local ;
- déployer une infrastructure avec Terraform ou OpenTofu, sans rien créer dans le cloud ;
- écrire une application Python (boto3) dont la cible est choisie explicitement et qui refuse une bascule accidentelle vers AWS ;
- choisir un mode de persistance des données adapté à votre usage ;
- écrire des tests d'intégration automatisés et les exécuter en CI/CD ;
- diagnostiquer les erreurs fréquentes ;
- comprendre les limites et les risques de sécurité d'un émulateur local ;
- savoir quand utiliser Floci et quand passer sur un vrai compte AWS.

## Parcours pédagogique

Le guide suit une difficulté croissante. Chaque niveau s'appuie sur le précédent.

| Niveau | Thème | Contenu |
| --- | --- | --- |
| 1 — Découverte | Premiers pas | Concepts, architecture, prérequis, Docker, AWS CLI, laboratoire S3 |
| 2 — Services AWS | Données et code | Laboratoire DynamoDB, SDK Python (boto3), mini-application S3 + DynamoDB |
| 3 — Infrastructure as Code | Terraform / OpenTofu | Premier déploiement, mini-projet multi-services |
| 4 — Compute | Calcul | EC2 local, Lambda en Python, découverte d'ECS, EKS et RDS |
| 5 — DevOps | Automatisation | Persistance, tests automatisés avec pytest, pipeline CI/CD |
| 6 — Avancé | Recul critique | Sécurité, limites, comparaisons, dépannage, bonnes pratiques |

## Table des matières

Commencez par le [parcours de 10 minutes](#je-veux-tester-floci-en-10-minutes), puis choisissez votre niveau : **🟢 Débutant**, **🟠 Intermédiaire**, **🔴 Avancé**. Starlight fournit aussi une navigation automatique par partie et par chapitre.

| Partie | Chapitres | Niveau |
| --- | --- | --- |
| [I — Découvrir Floci](#partie-i--découvrir-floci) | 1 à 6 : concepts, Docker, Compose, AWS CLI | 🟢 |
| [II — Manipuler AWS localement](#partie-ii--manipuler-aws-localement) | 7 et 8 : S3 et DynamoDB | 🟢 |
| [III — Développer avec les SDK](#partie-iii--développer-avec-les-sdk) | 9 et 10 : boto3 et application de documents | 🟠 |
| [IV — Infrastructure as Code](#partie-iv--infrastructure-as-code) | 11 et 12 : Terraform/OpenTofu, SQS, SSM, état | 🟠 |
| [V — Compute et services avancés](#partie-v--compute-et-services-avancés) | 13 à 16 : EC2, Lambda, ECS, EKS, RDS, couverture | 🔴 |
| [VI — Tests et CI/CD](#partie-vi--tests-et-cicd) | 17 à 19 : persistance, pytest, pipelines | 🟠 |
| [VII — Sécurité et limites](#partie-vii--sécurité-et-limites) | 20 à 29 : DevSecOps, limites, comparaisons, dépannage, ressources | Tous niveaux |

## Je veux tester Floci en 10 minutes

**Objectif :** créer un bucket S3 et une table DynamoDB, constater leur présence, puis nettoyer. **Prérequis :** Docker démarré, AWS CLI v2 et Bash (WSL2 sous Windows). Travaillez dans un terminal réservé au laboratoire. Le premier téléchargement peut dépasser dix minutes.

```bash
mkdir -p ~/lab-floci && cd ~/lab-floci
docker run -d --name floci -p 127.0.0.1:4566:4566 floci/floci:2.1.0

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_PAGER=""
unset AWS_SESSION_TOKEN AWS_SECURITY_TOKEN

# Cet argument explicite prime sur les endpoints configurés ailleurs.
aws_floci() {
  command aws --endpoint-url http://localhost:4566 --region us-east-1 "$@"
}

# Attendre la réponse STS (maximum 30 tentatives).
COMPTE=""
for i in {1..30}; do
  if COMPTE=$(aws_floci sts get-caller-identity \
      --query Account --output text --cli-connect-timeout 2 --cli-read-timeout 2); then
    break
  fi
  sleep 2
done
test "$COMPTE" = "000000000000" || { echo "Cible inattendue ou indisponible" >&2; exit 1; }

aws_floci s3 mb s3://floci-rapide
aws_floci dynamodb create-table --table-name floci-rapide \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH --billing-mode PAY_PER_REQUEST
aws_floci dynamodb wait table-exists --table-name floci-rapide

aws_floci s3 ls
aws_floci dynamodb describe-table --table-name floci-rapide \
  --query 'Table.TableStatus' --output text

# Nettoyage des ressources de ce parcours uniquement.
aws_floci s3 rb s3://floci-rapide
aws_floci dynamodb delete-table --table-name floci-rapide
aws_floci dynamodb wait table-not-exists --table-name floci-rapide
```

**Explication :** `-p` publie l'API en local ; les variables donnent la région et des clés fictives ; `aws_floci` impose l'endpoint pour chaque commande. Un bucket contient des objets ; une table contient des éléments identifiés ici par `id`.

**Résultat attendu :** `floci-rapide` figure dans la liste S3 et la table est `ACTIVE`. **Vérification du nettoyage :** relancez `aws_floci s3 ls` et `aws_floci dynamodb list-tables` : les deux ressources ont disparu. **Erreur fréquente :** le nom de conteneur `floci` existe déjà ; utilisez le conteneur existant après vérification au lieu d'en lancer un second. Vous pouvez le conserver pour la suite ; `docker stop floci` puis `docker rm floci` termine ce parcours si vous vous arrêtez ici.

---

## Partie I — Découvrir Floci

### 1. Qu'est-ce que Floci ?

#### Une définition simple

Floci est un programme qui **se fait passer pour AWS**. Il tourne dans un conteneur Docker sur votre poste et répond aux requêtes envoyées par les outils AWS en imitant les réponses du vrai service : « bucket créé », « table active », « fonction invoquée », etc.

Concrètement, quand vous tapez `aws s3 mb s3://mon-bucket`, l'AWS CLI envoie une requête HTTP. Normalement, cette requête part vers les serveurs d'Amazon. Avec Floci, vous redirigez cette requête vers `http://localhost:4566` : c'est Floci qui la reçoit, enregistre le bucket **dans son état local** (en mémoire ou sur disque selon la configuration) et renvoie une réponse au format exact qu'attend l'AWS CLI.

Le projet se décrit comme un émulateur AWS local pour le développement, les tests et la CI. Ce guide couvre uniquement sa variante AWS. [Source : dépôt officiel](https://github.com/floci-io/floci).

#### Une analogie

> **AWS réel**, c'est un immense datacenter que vous louez à distance : tout y est réel, puissant, mais chaque ressource se paie et chaque erreur peut coûter cher.
>
> **Floci**, c'est une **maquette de ce datacenter posée sur votre bureau** : les mêmes boutons, les mêmes panneaux, les mêmes procédures, mais en modèle réduit. Vous pouvez tout démonter, tout casser et tout recommencer, gratuitement, autant de fois que vous voulez.

Comme une maquette, Floci est excellent pour **apprendre les gestes** et **vérifier vos plans**. Mais on ne fait pas voler une maquette d'avion avec des passagers : la validation finale se fait toujours sur le vrai AWS.

#### À quoi sert Floci ?

| Usage | Exemple concret |
| --- | --- |
| Développement | Coder une application qui lit et écrit dans S3 sans compte AWS |
| Tests | Lancer des tests d'intégration qui créent des tables DynamoDB jetables |
| Prototypage | Essayer SQS + Lambda en dix minutes pour valider une idée |
| Infrastructure as Code | Vérifier qu'un module Terraform s'applique et se détruit proprement |
| CI/CD | Exécuter tous les tests AWS d'un projet à chaque `git push`, sans secret cloud |
| Formation | Préparer une certification AWS en manipulant les services sans risque financier |
| Expérimentation | Comprendre le comportement d'une API avant de l'utiliser en vrai |

#### Quels problèmes cela résout-il ?

Développer directement contre le vrai AWS pose plusieurs problèmes :

- **le coût** : chaque ressource oubliée peut générer une facture ;
- **l'accès** : il faut un compte, des identifiants, parfois des autorisations de l'équipe sécurité ;
- **la lenteur** : chaque appel traverse Internet, et certaines ressources mettent plusieurs minutes à se créer ;
- **le partage** : plusieurs développeurs sur le même compte se marchent sur les pieds (noms de buckets, tables partagées) ;
- **le risque** : une commande mal ciblée peut toucher un environnement réel.

Un émulateur local raccourcit la création des ressources et facilite les tests jetables sans compte cloud. Son isolation dépend toutefois des ports publiés, des volumes et de l'accès au moteur Docker ; les services qui téléchargent et lancent des conteneurs prennent davantage de temps.

#### Est-ce réellement AWS ?

**Non.** Floci est une **imitation compatible**, pas AWS. Il reproduit le *contrat* des API (les requêtes acceptées, le format des réponses, les codes d'erreur) avec un niveau de fidélité variable selon les services. Pour certains services complexes (Lambda, RDS, EC2, ECS, EKS…), Floci va plus loin qu'une simple imitation : il démarre de **vrais conteneurs Docker** (un vrai PostgreSQL, un vrai runtime Lambda, un vrai cluster k3s). Mais même dans ce cas, l'infrastructure sous-jacente n'a rien à voir avec celle d'AWS.

#### Peut-il remplacer complètement AWS ?

**Non, et ce n'est pas son objectif.** Floci accélère la boucle « j'écris du code → je teste → je corrige ». Il ne reproduit pas fidèlement :

- l'intégralité d'IAM et de ses subtilités d'évaluation de politiques ;
- les quotas et limites de service réels ;
- le réseau AWS (VPC, routage, latence, haute disponibilité multi-AZ) ;
- les performances réelles ;
- les fonctionnalités avancées ou récentes de chaque API.

:::caution[À retenir dès maintenant]
Un test qui passe sur Floci valide **le scénario testé contre cette version de l'émulateur**. Il ne prouve pas que votre application fonctionnera à l'identique en production. Gardez toujours une étape de validation sur un vrai compte AWS (idéalement un compte de test isolé) avant la mise en production.
:::

---

### 2. Architecture

#### Vue d'ensemble

```text
AWS CLI / SDK / Terraform / Tests
                |
        API HTTP compatible
                v
     http://localhost:4566
                |
      Floci dans un conteneur
       |                 |
       v                 v
   API + état       socket Docker
   local (*)        (facultatif)
                         |
                         v
                 conteneurs annexes
                 EC2, Lambda, RDS...

(*) memory / persistent / hybrid / wal
```

#### Le rôle de chaque brique

| Brique | Rôle |
| --- | --- |
| **AWS CLI** | Outil en ligne de commande officiel d'AWS. Il traduit une commande comme `aws s3 ls` en requête HTTP signée vers un endpoint. |
| **SDK AWS** | Bibliothèques (boto3 pour Python, SDK Java, Node.js, Go…) qui font la même chose depuis le code d'une application. |
| **Terraform / OpenTofu** | Outils d'Infrastructure as Code : vous décrivez l'infrastructure dans des fichiers, l'outil appelle les API AWS pour la créer. |
| **Endpoint local** | L'adresse `http://localhost:4566` : c'est le « faux AWS ». Tous les services y répondent sur le même port. |
| **Floci** | Le programme qui reçoit les requêtes, les interprète service par service et renvoie des réponses au format AWS. |
| **Docker** | Fait tourner Floci lui-même, et, si vous lui en donnez l'accès, les conteneurs « réels » des services d'exécution (Lambda, EC2, RDS…). |
| **Services émulés** | Les implémentations locales de S3, DynamoDB, Lambda, etc. |

#### Deux familles de services

Floci utilise deux stratégies, et cette distinction sera importante tout au long du guide :

```text
API et état traités dans Floci
  S3, DynamoDB, SQS, SNS, IAM, STS, SSM, KMS,
  Secrets Manager, CloudWatch, Step Functions,
  EventBridge, CloudFormation...
  -> pas de socket Docker pour ces exemples

Floci pilote de vrais conteneurs
  Lambda -> runtime Lambda officiel
  EC2    -> conteneur Linux par instance
  RDS    -> PostgreSQL / MySQL / MariaDB
  ECS    -> conteneurs de vos tâches
  EKS    -> cluster k3s
  -> socket Docker requis pour ce mode d'exécution
```

:::tip[Pourquoi c'est important]
Pour les niveaux 1 à 3 (S3, DynamoDB, SDK, Terraform), Floci n'a besoin d'aucun accès particulier : un simple conteneur suffit. L'accès au socket Docker, qui a des implications de sécurité sérieuses, ne devient nécessaire qu'au niveau 4 (EC2, Lambda…).
:::

---

### 3. Prérequis

#### Les outils

| Outil | Rôle dans ce guide | Vérification | Version conseillée |
| --- | --- | --- | --- |
| **Docker** | Exécuter Floci (et les services « Docker réel ») | `docker --version` | Version récente de Docker Engine ou Docker Desktop |
| **Docker Compose** | Décrire Floci et sa configuration dans un fichier | `docker compose version` | Compose v2 (commande `docker compose`, sans tiret) |
| **AWS CLI v2** | Piloter les services émulés en ligne de commande | `aws --version` | Version 2 récente (la v1 n'est pas couverte ici) |
| **Git** | Versionner vos fichiers de laboratoire | `git --version` | Toute version récente |
| **Terraform** ou **OpenTofu** | Infrastructure as Code (niveau 3) | `terraform version` / `tofu version` | Terraform 1.10+ ou OpenTofu 1.10+ pour les fichiers de ce guide ; contrôle statique avec Terraform 1.14.2 |
| **Python 3** | SDK boto3 et tests (niveaux 2 et 5) | `python3 --version` | Python 3 récent (3.10 ou plus conseillé) |
| **Éditeur** | Écrire le code et les fichiers | — | VS Code ou tout éditeur de votre choix |
| **Terminal** | Lancer les commandes | — | Bash/Zsh sous Linux ou macOS ; WSL2 sous Windows |

Vérifiez votre poste en une fois :

```bash
docker --version
docker compose version
aws --version
git --version
terraform version   # ou : tofu version
python3 --version
```

**Ce que vous devez observer :** chaque commande affiche un numéro de version, sans message `command not found`. Pour Docker, vérifiez aussi que le démon tourne :

```bash
docker info --format '{{.ServerVersion}}'
```

Si cette commande renvoie une erreur du type `Cannot connect to the Docker daemon`, démarrez Docker Desktop (macOS/Windows) ou le service Docker (`sudo systemctl start docker` sous Linux).

:::note[Utilisateurs Windows]
Les exemples de ce guide utilisent la syntaxe Bash (`export`, `\` en fin de ligne, guillemets simples). Le plus simple est de travailler dans **WSL2** (Ubuntu) avec Docker Desktop configuré pour WSL2. En PowerShell natif, remplacez `export VAR=valeur` par `$env:VAR = "valeur"`, les `\` de fin de ligne par des accents graves `` ` ``, et préférez passer le JSON des commandes via des fichiers (`file://item.json`) pour éviter les problèmes d'échappement.
:::

#### Un dossier de travail

Créez un dossier dédié pour tous les laboratoires :

```bash
mkdir -p ~/lab-floci && cd ~/lab-floci
mkdir -p scripts infra tests
git init
```

---

### 4. Démarrer Floci avec Docker

#### Lancer le conteneur

**Objectif :** démarrer l'API locale. **Prérequis :** Docker actif, port 4566 libre. Si vous avez suivi le parcours rapide, le conteneur existe déjà : passez directement aux vérifications.

```bash
docker run -d \
  --name floci \
  -p 127.0.0.1:4566:4566 \
  floci/floci:2.1.0
```

Décomposons chaque élément :

| Élément | Signification |
| --- | --- |
| `docker run` | Crée un nouveau conteneur à partir d'une image et le démarre. |
| `-d` | Mode *detached* : le conteneur tourne en arrière-plan et vous rend la main. |
| `--name floci` | Donne un nom fixe au conteneur, pour le désigner facilement (`docker logs floci`, `docker stop floci`). |
| `-p 127.0.0.1:4566:4566` | Publie le port 4566 du conteneur sur le port 4566 de votre machine, **uniquement sur l'interface locale** (`127.0.0.1`). |
| `floci/floci` | Le nom de l'image officielle sur Docker Hub (dépôt `floci`, image `floci`). |
| `:2.1.0` | Le **tag** : la version exacte de Floci. |

:::caution[Pourquoi 127.0.0.1 et pas simplement 4566:4566 ?]
La documentation officielle utilise souvent `-p 4566:4566`, qui publie le port sur **toutes** les interfaces réseau de votre machine. Sur un réseau partagé (Wi-Fi d'entreprise, coworking), n'importe qui pourrait alors envoyer des requêtes à votre émulateur. Avec `127.0.0.1:`, seul votre poste y a accès. Cela devient critique dès que Floci a accès au socket Docker (voir la section Sécurité).
:::

#### Vérifier que Floci fonctionne

**1. Le conteneur tourne-t-il ?**

```bash
docker ps --filter name=floci
```

Vous devez voir une ligne avec l'image `floci/floci:2.1.0`, le statut `Up …` et le port `127.0.0.1:4566->4566/tcp`.

**2. Que disent les journaux ?**

```bash
docker logs floci
```

Floci est compilé en binaire natif : il démarre en une fraction de seconde. Les journaux doivent indiquer l'écoute sur le port 4566 et se terminer par une ligne `Ready.` (une ligne de compatibilité conservée pour les outils qui attendaient ce signal avec LocalStack).

**3. L'API répond-elle ?**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4566/_localstack/health
```

Le résultat attendu est `200`. Floci sert cet endpoint de santé hérité de LocalStack pour faciliter les migrations ; il est pratique pour les scripts d'attente.

#### Épingler la version : tag ou empreinte

Les Quick Starts officiels utilisent souvent `latest` pour un essai rapide. **Ce guide recommande un tag fixe en CI et pour un laboratoire reproductible** : `latest` est un tag flottant et son contenu peut changer. Un tag ne constitue pas, à lui seul, une garantie d'immuabilité. Un pipeline qui fonctionnait hier peut casser demain.

Floci publie plusieurs familles de tags :

| Tag | Usage |
| --- | --- |
| `x.y.z` (ex. `2.1.0`) | Version stable épinglée : **recommandé** pour un environnement reproductible |
| `x.y.z-compat` | Même version, avec l'AWS CLI et boto3 intégrés à l'image (utile pour des scripts d'initialisation) |
| `x.y.z-baseline` | Variante ARM64 pour processeurs plus anciens (ex. Raspberry Pi 4) |
| `latest`, `latest-compat` | Dernière version stable (pratique pour un essai rapide, pas pour la CI) |
| `nightly`, `nightly-mmddyyyy` | Construction quotidienne de la branche principale (tests de correctifs) |

Un tag peut, en théorie, être republié pour pointer vers une autre image. Pour une reproductibilité totale (sécurité de la chaîne d'approvisionnement), épinglez par **empreinte** (*digest* SHA-256), qui identifie le contenu exact de l'image :

```bash
docker pull floci/floci:2.1.0
docker image inspect --format '{{index .RepoDigests 0}}' floci/floci:2.1.0
```

La commande affiche une valeur de la forme `floci/floci@sha256:…`. Utilisez-la ensuite telle quelle :

```bash
FLOCI_IMAGE=$(docker image inspect --format '{{index .RepoDigests 0}}' floci/floci:2.1.0)
test -n "$FLOCI_IMAGE"
# Après avoir arrêté et supprimé le conteneur précédent :
docker run -d --name floci -p 127.0.0.1:4566:4566 "$FLOCI_IMAGE"
```

:::tip[Bonne pratique]
Relevez l'empreinte **vous-même** à partir d'une image que vous avez vérifiée, et versionnez-la dans votre dépôt (Compose, pipeline). Ne copiez jamais une empreinte trouvée dans un article sans la contrôler : elle peut correspondre à une autre version, ou être fausse.
:::

#### Arrêter, redémarrer, supprimer

```bash
docker stop floci      # arrête le conteneur (l'état en mémoire est perdu par défaut)
docker start floci     # le redémarre
docker rm -f floci     # le supprime (arrêt forcé si nécessaire)
```

Par défaut, Floci garde ses données **en mémoire** : un arrêt efface tout. C'est voulu pour les tests. La section 17 explique comment conserver l'état.

:::note[Alternative pratique : la CLI Floci]
La CLI officielle peut piloter le cycle de vie de l'émulateur. Consultez les instructions d'installation accessibles depuis le [site officiel](https://floci.io/aws/#quickstart) et l'aide de la version installée avant d'en utiliser les sous-commandes. Elle reste **facultative** : tous les laboratoires de ce guide utilisent directement Docker. Une CLI et le serveur Floci peuvent avoir des versions différentes.
:::

---

### 5. Docker Compose commenté

Docker Compose décrit la configuration d'un ou plusieurs conteneurs dans un fichier YAML versionnable. C'est plus lisible qu'une longue commande `docker run`, et toute l'équipe partage la même configuration.

#### Version minimale

```yaml title="docker-compose.yml"
services:
  floci:                              # nom du service dans Compose
    image: floci/floci:2.1.0          # image et version épinglée
    container_name: floci             # nom fixe du conteneur
    ports:
      - "127.0.0.1:4566:4566"         # API AWS émulée, accessible uniquement en local
```

```bash
docker compose up -d     # crée et démarre le service en arrière-plan
docker compose ps        # affiche l'état du service
docker compose logs -f   # suit les journaux (Ctrl+C pour quitter)
docker compose down      # arrête et supprime le conteneur
```

**Vérification :** `docker compose ps` affiche le service `floci` à l'état `running`, et `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4566/_localstack/health` renvoie `200`.

#### Version avancée

Cette version ajoute la persistance, l'accès au socket Docker (pour EC2, Lambda, etc.) et quelques réglages utiles. Chaque ligne est commentée.

```yaml title="docker-compose.yml"
services:
  floci:
    # Version épinglée. Pour une reproductibilité totale, remplacez par
    # floci/floci@sha256:<empreinte> (voir section 4).
    image: floci/floci:2.1.0

    # Nom fixe : permet "docker logs floci", "docker exec floci ...".
    container_name: floci

    ports:
      # API AWS émulée. 127.0.0.1 = jamais exposée sur le réseau local.
      - "127.0.0.1:4566:4566"

    volumes:
      # Dossier de persistance : l'état de Floci est écrit dans ./data
      # sur votre machine, et survit aux redémarrages du conteneur.
      - ./data:/app/data

      # Socket Docker : permet à Floci de lancer de vrais conteneurs
      # (Lambda, EC2, ECS, EKS, RDS...). Donne un contrôle total sur
      # Docker de l'hôte : à retirer si vous n'en avez pas besoin.
      - /var/run/docker.sock:/var/run/docker.sock

    environment:
      # Facultatif : décommenter seulement si les permissions du socket
      # empêchent le fonctionnement après vérification des journaux.
      # FLOCI_RUN_AS_ROOT: "true"

      # Mode de stockage : lectures en RAM, vidage disque asynchrone.
      FLOCI_STORAGE_MODE: hybrid

      # Chemin de persistance DANS le conteneur : doit correspondre
      # au point de montage du volume ci-dessus.
      FLOCI_STORAGE_PERSISTENT_PATH: /app/data

      # Région par défaut utilisée dans les ARN et les réponses.
      FLOCI_DEFAULT_REGION: us-east-1

      # Console web (http://localhost:4566/_floci/ui) : son port n'écoute
      # que sur l'interface locale.
      FLOCI_SERVICES_UI_BIND_ADDRESS: 127.0.0.1

      # À décommenter si d'AUTRES conteneurs Compose (votre application)
      # appellent Floci : les URL renvoyées (ex. QueueUrl SQS) utiliseront
      # alors le nom "floci" au lieu de "localhost".
      # FLOCI_HOSTNAME: floci

    # Pas de redémarrage automatique : c'est un environnement de laboratoire.
    restart: "no"
```

:::caution[Socket Docker et identité du processus]
L'entrypoint de **2.1.0** démarre avec les permissions nécessaires, adapte le groupe du socket, puis exécute Floci avec l'UID `1001`. `user: root` seul ne désactive pas cette baisse de privilèges. Si l'accès échoue malgré le réglage automatique, la documentation prévoit `FLOCI_RUN_AS_ROOT: "true"`. Activez cette option uniquement après diagnostic. L'accès au socket demeure puissant même avec un processus non-root. [Configuration documentée](https://floci.io/floci/configuration/docker/) et [entrypoint 2.1.0](https://github.com/floci-io/floci/blob/2.1.0/docker/entrypoint.sh).
:::

Ajoutez `data/`, `.venv/`, `kubeconfig-floci`, `*.tfstate*`, `.terraform/` et les fichiers de laboratoire contenant des identifiants à votre `.gitignore`. Les permissions d'un bind mount `./data` dépendent de l'hôte ; un volume nommé évite une partie de ces difficultés.

#### Et le healthcheck ?

Docker Compose permet de déclarer un `healthcheck`, mais celui-ci exécute une commande **à l'intérieur** du conteneur (souvent `curl` ou `wget`). L'image standard documentée ne contient pas curl ; un healthcheck qui en dépend ne convient donc pas à cette image. Plutôt que d'en inventer un, attendez la disponibilité de Floci **depuis l'extérieur**, avec un petit script réutilisable en local comme en CI :

```bash title="scripts/wait-for-floci.sh"
#!/usr/bin/env bash
# Attend que Floci réponde (30 essais, environ 90 secondes maximum).
set -euo pipefail

ENDPOINT="${AWS_ENDPOINT_URL:-http://localhost:4566}"
case "$ENDPOINT" in
  http://localhost:4566|http://127.0.0.1:4566|http://floci:4566) ;;
  *) echo "Endpoint de laboratoire refusé : $ENDPOINT" >&2; exit 1 ;;
esac

for i in $(seq 1 30); do
  if curl -fsS --connect-timeout 1 --max-time 1 -o /dev/null "${ENDPOINT}/_localstack/health"; then
    echo "Floci est prêt sur ${ENDPOINT}"
    exit 0
  fi
  echo "Attente de Floci (${i}/30)..."
  sleep 2
done

echo "Floci ne répond pas sur ${ENDPOINT}" >&2
exit 1
```

```bash
chmod +x scripts/wait-for-floci.sh
docker compose up -d && ./scripts/wait-for-floci.sh
```

**Résultat attendu :** `Floci est prêt sur http://localhost:4566`.

---

### 6. Configurer l'AWS CLI

#### Rediriger l'AWS CLI vers Floci

**Objectif :** configurer un terminal de laboratoire et contrôler sa cible. **Prérequis :** AWS CLI v2, Floci démarré. Les quatre variables ci-dessous suivent la [configuration officielle Floci](https://floci.io/floci/getting-started/aws-setup/).

```bash
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_PAGER=""
export AWS_EC2_METADATA_DISABLED=true
unset AWS_SESSION_TOKEN AWS_SECURITY_TOKEN AWS_ROLE_ARN AWS_WEB_IDENTITY_TOKEN_FILE
unset AWS_IGNORE_CONFIGURED_ENDPOINT_URLS
```

| Variable | Rôle |
| --- | --- |
| `AWS_ENDPOINT_URL` | Endpoint global utilisé par l'AWS CLI et les SDK qui prennent en charge ce réglage. |
| `AWS_DEFAULT_REGION` | Région du laboratoire : `us-east-1` simplifie notamment `CreateBucket`. |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Clés **fictives** pour signer les requêtes SigV4 ; aucune clé AWS réelle n'est nécessaire. |
| `AWS_EC2_METADATA_DISABLED` | Évite une recherche d'identifiants via le service de métadonnées EC2. |

Ces exports concernent ce terminal. Pour les répéter, enregistrez-les dans `scripts/floci-env.sh` puis utilisez `source scripts/floci-env.sh` ; un nouveau terminal ne les hérite pas nécessairement. Ce script ne doit contenir que des valeurs fictives.

:::caution[Un endpoint global peut être remplacé]
Une variable telle que `AWS_ENDPOINT_URL_S3`, une configuration par service, ou `AWS_IGNORE_CONFIGURED_ENDPOINT_URLS=true` peut modifier le routage. STS ne vérifie que sa propre cible. **L'option `--endpoint-url` de l'AWS CLI a priorité** : utilisez-la pour lever toute ambiguïté. Les priorités des SDK et du provider se vérifient séparément. [Référence AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-endpoints.html).
:::

#### Profil nommé : séparer credentials, région et endpoint

Ajoutez uniquement ces sections aux fichiers existants ; ne remplacez pas les autres profils.

```ini title="~/.aws/credentials"
[floci]
aws_access_key_id = test
aws_secret_access_key = test
```

```ini title="~/.aws/config"
[profile floci]
region = us-east-1
output = json
```

Le fichier `credentials` contient les clés ; `config` contient ici la région et le format de sortie. **Le profil seul ne redirige pas les appels.** Utilisez l'endpoint explicitement :

```bash
aws --profile floci --endpoint-url http://localhost:4566 s3 ls
# Ou, pour une session :
export AWS_PROFILE=floci
export AWS_ENDPOINT_URL=http://localhost:4566
```

AWS documente aussi `endpoint_url = http://localhost:4566` dans `[profile floci]` pour les versions compatibles. Ce guide garde la méthode montrée par Floci (`AWS_ENDPOINT_URL` ou `--endpoint-url`) comme chemin principal ; vérifiez le support et les priorités de votre version avant de compter sur le paramètre du profil.

#### Cinq niveaux de garde-fous

| Niveau | Contrôle | Limite à comprendre |
| --- | --- | --- |
| 1 | `test` / `test`, sans jeton de session hérité | AWS réel refuse normalement ces clés, mais une requête peut malgré tout quitter le poste. |
| 2 | Endpoint Floci explicite | Le réglage global peut être remplacé par un réglage plus prioritaire. |
| 3 | Profil nommé `floci` | Le nom du profil décrit une intention, pas une preuve du routage. |
| 4 | `aws sts get-caller-identity` et comparaison du compte | Cette requête vérifie STS ; elle ne prouve pas que S3 et les autres clients ont le même endpoint. |
| 5 | Refus automatique dans le SDK, les tests et la CI | Contrôler l'URL **avant** tout appel, puis l'identité avant toute écriture. |

Pour les commandes locales, cette fonction combine l'endpoint imposé et des clés fictives :

```bash
aws_floci() {
  AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test AWS_SESSION_TOKEN="" \
    command aws --endpoint-url http://localhost:4566 --region us-east-1 "$@"
}
aws_floci sts get-caller-identity
COMPTE=$(aws_floci sts get-caller-identity --query Account --output text)
test "$COMPTE" = "000000000000" || { echo "Compte inattendu : arrêt" >&2; exit 1; }
```

**Résultat attendu :** `Account` vaut `000000000000` dans la configuration de ce guide. Une réponse telle que `123456789012` impose l'arrêt et une vérification de l'endpoint et des identifiants. Floci permet aussi un compte personnalisé (`FLOCI_DEFAULT_ACCOUNT_ID`) ou une isolation multi-comptes avec des clés de 12 chiffres : **un compte différent ne suffit donc pas, à lui seul, à identifier AWS réel**. [Référence multi-comptes](https://floci.io/floci/configuration/multi-account/).

:::danger[Une variable absente peut changer la cible]
Sans endpoint local effectif, les outils résolvent leurs endpoints AWS habituels. Si des identifiants réels sont disponibles, une commande peut créer ou modifier des ressources cloud. Les exemples `aws …` qui suivent supposent le terminal configuré ci-dessus ; vous pouvez remplacer `aws` par `aws_floci` dans les laboratoires exécutés depuis l'hôte. En CI, l'endpoint doit être adapté au réseau du job.
:::

**Nettoyage de session :** fermez le terminal réservé au laboratoire. Si vous le réutilisez, retirez les variables fictives et `AWS_ENDPOINT_URL` seulement après la fin des exercices ; cette opération peut réactiver vos profils AWS habituels.

---

## Partie II — Manipuler AWS localement

### 7. Laboratoire S3

**Objectif :** créer un bucket, y déposer des fichiers, les lister, les télécharger, puis tout supprimer. **Prérequis :** Docker et Floci démarrés, terminal configuré et cible contrôlée au chapitre 6.

#### Les notions

- **Amazon S3** (*Simple Storage Service*) est un service de stockage d'**objets** : des fichiers de toute taille, accompagnés de métadonnées.
- Un **bucket** est un conteneur d'objets. Pour les buckets généralistes dans l'espace de noms global partagé, AWS impose l'unicité au sein d'une **partition AWS** (par exemple `aws` ou `aws-cn`). Sur Floci, la portée est celle de l'émulation et de sa configuration multi-comptes ; ce test ne valide pas la disponibilité d'un nom sur AWS.
- Une **clé** est le nom complet d'un objet dans le bucket, par exemple `archives/2026/rapport.pdf`. Il n'y a pas de vrais dossiers : les `/` font partie de la clé, et les outils les affichent comme des dossiers.

Une analogie : le bucket est une armoire, l'objet est un document, et sa clé est son étiquette complète.

:::tip[Concept AWS à retenir — S3]
S3 stocke des objets, pas un système de fichiers POSIX. Un préfixe comme `archives/` aide à organiser les clés ; il ne crée pas un dossier doté de permissions propres. [Notions AWS](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingBucket.html).
:::

#### Étape 1 — Créer un bucket

```bash
aws s3 mb s3://demo-bucket
```

- **Que fait-elle ?** `mb` (*make bucket*) crée le bucket `demo-bucket`.
- **Pourquoi ?** Tout objet S3 doit être rangé dans un bucket.
- **Vérification :** la sortie affiche `make_bucket: demo-bucket`, et `aws s3 ls` liste le bucket.

Les noms de bucket doivent respecter les règles AWS : minuscules, chiffres, points et tirets, entre 3 et 63 caractères.

#### Étape 2 — Déposer un fichier

```bash
echo "Bonjour Floci" > test.txt
aws s3 cp test.txt s3://demo-bucket/
```

- **Que fait-elle ?** Crée un fichier local, puis le téléverse (*upload*) dans le bucket sous la clé `test.txt`.
- **Pourquoi ?** C'est l'opération de base de toute application qui stocke des fichiers.
- **Vérification :** la sortie affiche `upload: ./test.txt to s3://demo-bucket/test.txt`.

Ajoutez un second objet avec un « chemin » :

```bash
aws s3 cp test.txt s3://demo-bucket/archives/2026/test.txt
```

#### Étape 3 — Lister le contenu

```bash
aws s3 ls s3://demo-bucket/
aws s3 ls s3://demo-bucket/ --recursive
```

- **Que fait-elle ?** La première commande liste le premier niveau (le fichier et le préfixe `archives/`) ; la seconde liste toutes les clés.
- **Pourquoi ?** Pour constater que les « dossiers » ne sont que des préfixes de clés.
- **Vérification :** `test.txt` apparaît avec une taille de **14 octets** (13 caractères plus le saut de ligne), et la version récursive affiche aussi `archives/2026/test.txt`.

#### Étape 4 — Télécharger et comparer

```bash
aws s3 cp s3://demo-bucket/test.txt telecharge.txt
diff test.txt telecharge.txt && echo "Fichiers identiques"
```

- **Que fait-elle ?** Télécharge l'objet dans un nouveau fichier, puis compare les deux.
- **Pourquoi ?** Pour prouver que l'aller-retour conserve le contenu à l'octet près.
- **Vérification :** `Fichiers identiques` s'affiche.

#### Étape 5 — Inspecter les métadonnées

```bash
aws s3api head-object --bucket demo-bucket --key test.txt
```

- **Que fait-elle ?** `s3api` donne accès aux appels d'API bruts. `head-object` lit les métadonnées d'un objet sans télécharger son contenu.
- **Pourquoi ?** Les commandes `aws s3` sont des raccourcis de haut niveau ; `aws s3api` correspond exactement aux opérations de l'API S3, celles qu'utilisent les SDK.
- **Vérification :** la réponse JSON contient notamment `ContentLength: 14` et un `ETag`.

#### Étape 6 — Nettoyer

```bash
aws s3 rm s3://demo-bucket/test.txt
aws s3 rb s3://demo-bucket --force
aws s3 ls
```

- **Que fait-elle ?** `rm` supprime un objet ; `rb --force` (*remove bucket*) vide le bucket puis le supprime.
- **Pourquoi ?** Un bucket doit être vide pour être supprimé ; `--force` s'en charge.
- **Vérification :** `aws s3 ls` ne liste plus `demo-bucket`.

:::tip[Ce que vous venez de faire]
Vous avez testé des opérations S3 courantes contre Floci. Les mêmes outils peuvent appeler AWS pour les opérations correspondantes, mais les noms, permissions, endpoints et comportements doivent y être validés. Les téléchargements d'images et de dépendances utilisent Internet.
:::

---

### 8. Laboratoire DynamoDB

**Objectif :** créer une table, y insérer des éléments, les lire, les modifier et les supprimer. **Prérequis :** Floci actif, terminal AWS configuré et compte local vérifié.

Analogie : dans un catalogue, la clé de partition est la référence du produit ; elle permet de retrouver directement sa fiche.

:::tip[Concept AWS à retenir — DynamoDB]
Dans une table à clé simple, la partition key identifie un élément. Avec une clé composée, c'est le couple partition key + sort key qui doit être unique. Les attributs déclarés à la création concernent les clés de la table et des index. [Clés DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html).
:::

#### Les notions

- **NoSQL** désigne les bases de données qui ne reposent pas sur des tables relationnelles à schéma fixe (comme PostgreSQL). Elles privilégient la flexibilité et la montée en charge.
- **Amazon DynamoDB** est la base NoSQL clé-valeur et document d'AWS.
- Une **table** regroupe des éléments. Contrairement à SQL, seule la **clé** est imposée à la création ; les autres attributs peuvent varier d'un élément à l'autre.
- Un **item** (élément) est l'équivalent d'une ligne : un ensemble d'attributs.
- La **partition key** (clé de partition) est l'attribut qui identifie un élément de façon unique (dans une table à clé simple). DynamoDB s'en sert pour répartir les données.
- Chaque valeur est accompagnée de son **type** : `S` (chaîne), `N` (nombre, transmis sous forme de chaîne dans le JSON), `BOOL`, `L` (liste), `M` (map)…

#### Étape 1 — Créer la table

```bash
aws dynamodb create-table \
  --table-name demo-produits \
  --attribute-definitions AttributeName=produitId,AttributeType=S \
  --key-schema AttributeName=produitId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

| Option | Signification |
| --- | --- |
| `--table-name` | Nom de la table. |
| `--attribute-definitions` | Déclare les attributs utilisés dans la clé, avec leur type (`S` = chaîne). |
| `--key-schema … KeyType=HASH` | Définit `produitId` comme clé de partition (`HASH` est le nom technique de la clé de partition). |
| `--billing-mode PAY_PER_REQUEST` | Facturation « à la demande » sur AWS : pas de capacité à provisionner. Sur Floci, rien n'est facturé, mais l'option rend la commande valide telle quelle sur AWS. |

**Vérification :**

```bash
aws dynamodb wait table-exists --table-name demo-produits
aws dynamodb describe-table --table-name demo-produits --query 'Table.TableStatus'
```

La commande `wait` rend la main quand la table existe, et la seconde affiche `"ACTIVE"`.

#### Étape 2 — Insérer des éléments

```bash
aws dynamodb put-item \
  --table-name demo-produits \
  --item '{"produitId": {"S": "P001"}, "nom": {"S": "Clavier"}, "prix": {"N": "49.90"}, "stock": {"N": "12"}}'

aws dynamodb put-item \
  --table-name demo-produits \
  --item '{"produitId": {"S": "P002"}, "nom": {"S": "Souris"}, "prix": {"N": "19.90"}, "stock": {"N": "30"}, "sansFil": {"BOOL": true}}'
```

- **Que fait-elle ?** `put-item` écrit un élément complet (et remplace un élément existant de même clé).
- **Pourquoi ?** Remarquez que le second élément possède un attribut `sansFil` absent du premier : c'est la flexibilité du NoSQL.
- **Vérification :** aucune sortie signifie succès. Comptez les éléments :

```bash
aws dynamodb scan --table-name demo-produits --select COUNT
```

Le champ `Count` vaut `2`.

#### Étape 3 — Lire un élément par sa clé

```bash
aws dynamodb get-item \
  --table-name demo-produits \
  --key '{"produitId": {"S": "P001"}}'
```

- **Que fait-elle ?** Lit directement l'élément dont la clé vaut `P001`.
- **Pourquoi ?** C'est l'accès le plus rapide et le moins coûteux sur DynamoDB : lecture par clé, sans parcourir la table.
- **Vérification :** la réponse contient `"nom": {"S": "Clavier"}`.

:::note[`get-item` contre `scan`]
`scan` parcourt **toute** la table : acceptable sur deux éléments, très coûteux sur des millions (sur AWS, il consomme de la capacité pour chaque élément lu). En production, on privilégie `get-item` et `query` (lecture par clé). Floci ne reproduit pas ces coûts : un scan « gratuit » en local peut cacher un problème de performance réel.
:::

#### Étape 4 — Modifier un élément

```bash
aws dynamodb update-item \
  --table-name demo-produits \
  --key '{"produitId": {"S": "P001"}}' \
  --update-expression "SET #stock = #stock - :q" \
  --expression-attribute-names '{"#stock": "stock"}' \
  --expression-attribute-values '{":q": {"N": "1"}}' \
  --return-values UPDATED_NEW
```

- **Que fait-elle ?** Décrémente le stock de 1 directement dans la base, sans relire l'élément.
- **Pourquoi ?** Une mise à jour atomique évite les conflits quand plusieurs clients modifient la même valeur.
- **Vérification :** la réponse affiche `"stock": {"N": "11"}`.

#### Étape 5 — Supprimer un élément, puis la table

```bash
aws dynamodb delete-item \
  --table-name demo-produits \
  --key '{"produitId": {"S": "P002"}}'

aws dynamodb delete-table --table-name demo-produits
aws dynamodb wait table-not-exists --table-name demo-produits
aws dynamodb list-tables
```

**Vérification :** `list-tables` ne contient plus `demo-produits`.

:::tip[JSON et PowerShell]
Sous PowerShell, l'échappement des guillemets dans `--item '…'` est délicat. Placez le JSON dans un fichier `item.json` et utilisez `--item file://item.json` : cette syntaxe fonctionne partout.
:::

---

## Partie III — Développer avec les SDK

### 9. SDK Python (boto3)

L'AWS CLI sert à explorer ; dans une application, on utilise un **SDK**. Pour Python, c'est **boto3**.

#### Préparer l'environnement Python

```bash
cd ~/lab-floci
python3 -m venv .venv
source .venv/bin/activate          # Windows PowerShell : .venv\Scripts\Activate.ps1
python -m pip install boto3
python -c "import boto3; print(boto3.__version__)"
```

- **Que fait-elle ?** Crée un environnement virtuel isolé, l'active, installe boto3 et affiche sa version.
- **Pourquoi ?** Un environnement virtuel évite de mélanger les dépendances de vos différents projets.
- **Vérification :** un numéro de version s'affiche.

#### Premier script : tout en dur (pour comprendre)

```python title="s3_hello.py"
import boto3

s3 = boto3.client(
    "s3",
    endpoint_url="http://localhost:4566",
    region_name="us-east-1",
    aws_access_key_id="test",
    aws_secret_access_key="test",
)

s3.create_bucket(Bucket="sdk-demo")
s3.put_object(Bucket="sdk-demo", Key="hello.txt", Body=b"Bonjour depuis boto3")

reponse = s3.list_buckets()
print([bucket["Name"] for bucket in reponse["Buckets"]])
```

| Paramètre | Rôle |
| --- | --- |
| `"s3"` | Le service ciblé. On créerait `"dynamodb"`, `"sqs"`… de la même façon. |
| `endpoint_url` | L'adresse du service. Il choisit la destination réseau ; identifiants, sécurité, région et comportement des services doivent aussi correspondre à l'environnement. |
| `region_name` | La région utilisée pour signer les requêtes et construire les ARN. |
| `aws_access_key_id` / `aws_secret_access_key` | Les identifiants (fictifs ici) utilisés pour signer les requêtes. |

```bash
python s3_hello.py
```

**Vérification :** la liste affichée contient `sdk-demo`, et `aws s3 ls s3://sdk-demo/` montre `hello.txt`. **Nettoyage :** `aws s3 rb s3://sdk-demo --force`. **Erreur fréquente :** relancer le script sans nettoyer un bucket préexistant ; les exemples suivants traitent explicitement le cycle de vie.

:::danger[À ne jamais faire dans un vrai projet]
Écrire des identifiants dans le code est une mauvaise pratique : ils finissent dans Git, dans des captures d'écran, dans des journaux. Ce premier script n'existe que pour rendre chaque paramètre visible. Ne reproduisez jamais ce schéma avec des clés réelles.
:::

#### Deuxième version : une cible explicite, locale par défaut

**Objectif :** réutiliser une fabrique de clients dans l'application et les tests. **Prérequis :** environnement Python activé, boto3 installé. Analogie : cette fabrique est l'aiguillage de tous les appels AWS ; perdre une variable ne doit pas déplacer silencieusement les trains vers le cloud.

Contrairement à une bascule fondée uniquement sur l'absence d'endpoint, cette version **refuse de démarrer sans endpoint local en mode Floci**. Un mode AWS existe pour une adaptation ultérieure, mais doit être choisi explicitement. Les valeurs autorisées couvrent l'hôte et les services CI de ce guide ; un endpoint distant de confiance demanderait une configuration distincte et revue.

```python title="aws_clients.py"
"""Clients boto3 : cible Floci obligatoire par défaut."""
import os
from urllib.parse import urlsplit

import boto3
from botocore.config import Config

LOCAL_ENDPOINTS = {
    "http://localhost:4566",
    "http://127.0.0.1:4566",
    "http://floci:4566",
}


def local_endpoint() -> str:
    endpoint = os.environ.get("AWS_ENDPOINT_URL", "").rstrip("/")
    if endpoint not in LOCAL_ENDPOINTS:
        raise RuntimeError("Endpoint Floci absent ou non autorisé : arrêt avant tout appel")
    url = urlsplit(endpoint)
    if url.username or url.password or url.query or url.fragment:
        raise RuntimeError("Endpoint de laboratoire invalide")
    return endpoint


def make_client(service: str):
    target = os.environ.get("APP_AWS_TARGET", "floci")
    if target == "floci":
        config = Config(
            connect_timeout=2, read_timeout=5,
            retries={"mode": "standard", "total_max_attempts": 1},
            s3={"addressing_style": "path"},
        )
        return boto3.client(
            service,
            endpoint_url=local_endpoint(),
            region_name=os.environ.get("AWS_DEFAULT_REGION", "us-east-1"),
            aws_access_key_id="test", aws_secret_access_key="test",
            aws_session_token="", config=config,
        )
    if target == "aws":
        # Refuser une configuration hybride implicite.
        if any(k.startswith("AWS_ENDPOINT_URL") for k in os.environ):
            raise RuntimeError("Retirer les endpoints locaux pour la cible AWS explicite")
        return boto3.client(service)  # chaîne de credentials standard, aucune clé codée en dur
    raise RuntimeError("APP_AWS_TARGET doit valoir floci ou aws")


def assert_floci_target() -> None:
    if os.environ.get("APP_AWS_TARGET", "floci") != "floci":
        raise RuntimeError("Ce laboratoire exige la cible Floci")
    account = make_client("sts").get_caller_identity()["Account"]
    if account != "000000000000":
        raise RuntimeError(f"Compte inattendu : {account}")
```

```python title="inventaire.py"
from aws_clients import assert_floci_target, make_client

assert_floci_target()
print("Compte local vérifié : 000000000000")
print("Buckets :", [b["Name"] for b in make_client("s3").list_buckets().get("Buckets", [])])
print("Tables :", make_client("dynamodb").list_tables()["TableNames"])
```

```bash
python inventaire.py
# Le terminal doit toujours avoir AWS_ENDPOINT_URL=http://localhost:4566.
```

**Résultat attendu :** le compte local puis les ressources existantes s'affichent. **Vérification du garde-fou :** `(unset AWS_ENDPOINT_URL; python inventaire.py)` doit échouer **avant une requête réseau**. Les parenthèses isolent ce test dans un sous-shell et conservent la variable du terminal principal. **Nettoyage :** ce script ne crée aucune ressource.

:::note[Adressage S3 path-style]
La forme `http://localhost:4566/bucket/cle` évite la dépendance au DNS de `bucket.localhost`. Ce réglage est appliqué aux clients locaux. Pour AWS, la fabrique laisse le SDK utiliser sa configuration normale. [Configuration boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/configuration.html).
:::

---

### 10. Mini-application Python S3 + DynamoDB

Assemblons les briques dans une petite application réaliste : un **gestionnaire de documents**. Les fichiers sont stockés dans S3 ; leurs métadonnées (nom, taille, empreinte SHA-256, date) dans DynamoDB.

```text
                 python docstore.py upload rapport.pdf
                                 |
                                 v
                   +---------------------------+
                   |   Application Python      |
                   |   (boto3 + aws_clients)   |
                   +------+-------------+------+
                          |             |
             fichier      |             |   métadonnées
                          v             v
              +-------------+     +----------------+
              |     S3      |     |    DynamoDB    |
              | docstore-   |     | docstore-      |
              | documents   |     | metadata       |
              +-------------+     +----------------+
                          \             /
                           \           /
                    Floci : cible contrôlée par aws_clients.py
                 endpoint absent = exécution refusée
```

#### Le code

Placez ce fichier à côté de `aws_clients.py` (section 9).

```python title="docstore.py"
"""docstore : mini-application, fichiers dans S3, métadonnées dans DynamoDB.

Usage :
    python docstore.py init
    python docstore.py upload <fichier>
    python docstore.py list
    python docstore.py get <document_id> [destination]
"""
from __future__ import annotations

import argparse
import hashlib
import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

from botocore.exceptions import ClientError

from aws_clients import assert_floci_target, make_client

BUCKET = os.environ.get("DOCSTORE_BUCKET", "docstore-documents")
TABLE = os.environ.get("DOCSTORE_TABLE", "docstore-metadata")


def init_resources(bucket: str = BUCKET, table: str = TABLE, s3=None, ddb=None) -> None:
    """Crée le bucket et la table s'ils n'existent pas encore (idempotent)."""
    s3 = s3 or make_client("s3")
    ddb = ddb or make_client("dynamodb")

    # Ne pas recréer un bucket existant : us-east-1 a des particularités AWS.
    try:
        s3.head_bucket(Bucket=bucket)
    except ClientError as exc:
        if exc.response["Error"]["Code"] not in {"404", "NoSuchBucket", "NotFound"}:
            raise  # Ne pas confondre accès refusé et ressource absente.
        params = {"Bucket": bucket}
        region = s3.meta.region_name
        if region and region != "us-east-1":
            params["CreateBucketConfiguration"] = {"LocationConstraint": region}
        s3.create_bucket(**params)

    try:
        ddb.create_table(
            TableName=table,
            AttributeDefinitions=[{"AttributeName": "documentId", "AttributeType": "S"}],
            KeySchema=[{"AttributeName": "documentId", "KeyType": "HASH"}],
            BillingMode="PAY_PER_REQUEST",
        )
    except ClientError as exc:
        if exc.response["Error"]["Code"] != "ResourceInUseException":
            raise
    ddb.get_waiter("table_exists").wait(TableName=table)


def upload_document(path: Path, bucket: str = BUCKET, table: str = TABLE,
                    s3=None, ddb=None) -> str:
    """Envoie un fichier dans S3, enregistre ses métadonnées, renvoie son identifiant."""
    s3 = s3 or make_client("s3")
    ddb = ddb or make_client("dynamodb")

    contenu = path.read_bytes()
    document_id = str(uuid.uuid4())
    cle = f"documents/{document_id}/{path.name}"

    s3.put_object(Bucket=bucket, Key=cle, Body=contenu)
    ddb.put_item(
        TableName=table,
        Item={
            "documentId": {"S": document_id},
            "nomFichier": {"S": path.name},
            "cleS3": {"S": cle},
            "taille": {"N": str(len(contenu))},
            "sha256": {"S": hashlib.sha256(contenu).hexdigest()},
            "dateEnvoi": {"S": datetime.now(timezone.utc).isoformat()},
        },
    )
    return document_id


def list_documents(table: str = TABLE, ddb=None) -> list[dict]:
    """Liste les métadonnées de tous les documents (scan paginé)."""
    ddb = ddb or make_client("dynamodb")
    documents = []
    for page in ddb.get_paginator("scan").paginate(TableName=table):
        for item in page.get("Items", []):
            documents.append({
                "documentId": item["documentId"]["S"],
                "nomFichier": item["nomFichier"]["S"],
                "taille": int(item["taille"]["N"]),
                "dateEnvoi": item["dateEnvoi"]["S"],
            })
    return sorted(documents, key=lambda doc: doc["dateEnvoi"])


def get_document(document_id: str, bucket: str = BUCKET, table: str = TABLE,
                 s3=None, ddb=None) -> tuple[str, bytes]:
    """Récupère un document et vérifie son intégrité (SHA-256)."""
    s3 = s3 or make_client("s3")
    ddb = ddb or make_client("dynamodb")

    item = ddb.get_item(TableName=table, Key={"documentId": {"S": document_id}}, ConsistentRead=True).get("Item")
    if item is None:
        raise KeyError(f"Document inconnu : {document_id}")

    contenu = s3.get_object(Bucket=bucket, Key=item["cleS3"]["S"])["Body"].read()
    if hashlib.sha256(contenu).hexdigest() != item["sha256"]["S"]:
        raise ValueError(f"Intégrité compromise pour {document_id}")
    return item["nomFichier"]["S"], contenu


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Gestionnaire de documents S3 + DynamoDB")
    commandes = parser.add_subparsers(dest="commande", required=True)
    commandes.add_parser("init", help="crée le bucket et la table")
    p_upload = commandes.add_parser("upload", help="envoie un fichier")
    p_upload.add_argument("fichier", type=Path)
    commandes.add_parser("list", help="liste les documents")
    p_get = commandes.add_parser("get", help="télécharge un document")
    p_get.add_argument("document_id")
    p_get.add_argument("destination", nargs="?", type=Path)
    args = parser.parse_args(argv)
    assert_floci_target()  # avant toute création, lecture ou écriture de ce laboratoire

    if args.commande == "init":
        init_resources()
        print(f"Ressources prêtes : bucket={BUCKET}, table={TABLE}")
    elif args.commande == "upload":
        print(upload_document(args.fichier))
    elif args.commande == "list":
        for doc in list_documents():
            print(f"{doc['documentId']}  {doc['taille']:>8} o  {doc['dateEnvoi']}  {doc['nomFichier']}")
    elif args.commande == "get":
        nom, contenu = get_document(args.document_id)
        destination = args.destination or Path(nom)
        destination.write_bytes(contenu)
        print(f"Document écrit dans {destination}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

Points de conception à remarquer :

- **Aucune référence à Floci** dans le code métier : seul `aws_clients.py` lit l'environnement.
- Les fonctions acceptent `bucket`, `table`, `s3` et `ddb` en paramètres : c'est ce qui permettra de les tester avec des ressources jetables (section 18).
- `init_resources` évite de recréer les ressources existantes ; elle ne vérifie pas que leur schéma est celui attendu. Une erreur de permissions est propagée.
- S3 et DynamoDB ne forment pas une transaction commune : un échec DynamoDB après le dépôt S3 peut laisser un objet orphelin. Une application de production doit prévoir compensation, reprise et observabilité ; ce laboratoire garde ce risque visible.
- L'empreinte SHA-256 permet de détecter une altération du fichier entre l'envoi et la lecture.

#### Utilisation

```bash
python docstore.py init
echo "Facture n°42 - contenu de démonstration" > facture-42.txt
DOCUMENT_ID=$(python docstore.py upload facture-42.txt)
echo "$DOCUMENT_ID"
python docstore.py list
```

**Ce que vous devez observer :**

1. `init` affiche `Ressources prêtes : bucket=docstore-documents, table=docstore-metadata` ;
2. `upload` affiche un identifiant (UUID) ;
3. `list` affiche une ligne avec cet identifiant, la taille, la date et le nom du fichier.

Récupérez le document avec l'identifiant conservé à l'étape précédente :

```bash
python docstore.py get "$DOCUMENT_ID" copie.txt
diff facture-42.txt copie.txt && echo "Aller-retour OK"
```

**Vérification croisée avec l'AWS CLI :**

```bash
aws s3 ls s3://docstore-documents/ --recursive
aws dynamodb scan --table-name docstore-metadata --select COUNT
```

#### Nettoyer et préparer une adaptation à AWS

**Nettoyage du laboratoire :**

```bash
aws s3 rb s3://docstore-documents --force
aws dynamodb delete-table --table-name docstore-metadata
aws dynamodb wait table-not-exists --table-name docstore-metadata
```

**Vérification :** le bucket et la table ne sont plus listés. **Erreur fréquente :** un schéma de table incompatible préexiste ; l'initialisation ne le transforme pas automatiquement.

La fabrique prévoit `APP_AWS_TARGET=aws` pour une adaptation explicite, mais la commande principale de **ce laboratoire** exige Floci. Pour un déploiement réel, adaptez cette politique, vérifiez le compte autorisé avant les écritures et utilisez une configuration séparée : nom de bucket disponible, IAM minimal, rôle ou SSO, région, chiffrement et tests AWS. Le retrait d'une variable ne suffit plus à activer le cloud.

---

## Partie IV — Infrastructure as Code

### 11. Terraform / OpenTofu avec Floci

#### Les notions

- **Infrastructure as Code (IaC)** : décrire l'infrastructure dans des fichiers texte versionnés, plutôt que de la créer à la main.
- **Terraform** (HashiCorp) et **OpenTofu** (fork open source sous l'égide de la Linux Foundation) lisent ces fichiers (langage HCL) et appellent les API du fournisseur pour créer, modifier ou détruire les ressources.
- Un **provider** est le plugin qui sait parler à une plateforme. Ici : `hashicorp/aws`.
- L'**état** (*state*, fichier `terraform.tfstate`) mémorise ce que Terraform a créé, pour calculer les différences au prochain passage.

Le principe avec Floci tient en une phrase :

> Terraform ne doit pas appeler AWS réel, mais l'endpoint local de Floci.

On l'obtient en configurant le provider AWS : identifiants fictifs, désactivation des vérifications qui interrogeraient le vrai AWS, et surtout un bloc `endpoints` qui redirige **chaque service utilisé** vers `http://localhost:4566`.

#### Structure du projet

```text
infra/
├── versions.tf     # versions de Terraform et du provider
├── variables.tf    # paramètres (région, endpoint, préfixe)
├── provider.tf     # configuration du provider AWS vers Floci
├── main.tf         # les ressources
└── outputs.tf      # les valeurs affichées après déploiement
```

```hcl title="infra/versions.tf"
terraform {
  # Socle commun choisi pour les fichiers de ce guide.
  required_version = ">= 1.10.0, < 2.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "= 6.67.0"
    }
  }
}
```

```hcl title="infra/variables.tf"
variable "region" {
  description = "Région AWS utilisée par le provider."
  type        = string
  default     = "us-east-1"
}

variable "aws_endpoint" {
  description = "Adresse de l'émulateur Floci."
  type        = string
  default     = "http://localhost:4566"

  validation {
    condition = contains([
      "http://localhost:4566", "http://127.0.0.1:4566", "http://floci:4566"
    ], var.aws_endpoint)
    error_message = "Utilisez uniquement un endpoint de laboratoire autorisé."
  }
}

variable "projet" {
  description = "Préfixe appliqué aux noms des ressources."
  type        = string
  default     = "docstore"
}
```

```hcl title="infra/provider.tf"
provider "aws" {
  region = var.region

  # Identifiants fictifs : Floci accepte toute valeur non vide.
  access_key = "test"
  secret_key = "test"

  # Options documentées pour l'émulation : désactivent des vérifications
  # d'initialisation. Elles ne redirigent PAS les API des ressources.
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  # URL S3 de la forme http://localhost:4566/bucket au lieu de http://bucket.localhost:4566
  s3_use_path_style = true

  # Chaque service utilisé DOIT être redirigé vers Floci.
  endpoints {
    sts      = var.aws_endpoint
    iam      = var.aws_endpoint
    s3       = var.aws_endpoint
    dynamodb = var.aws_endpoint
  }
}
```

```hcl title="infra/main.tf"
resource "aws_s3_bucket" "documents" {
  bucket = "${var.projet}-documents"

  # Laboratoire : autorise la destruction d'un bucket non vide.
  # À proscrire sur des données réelles.
  force_destroy = true
}

resource "aws_dynamodb_table" "metadata" {
  name         = "${var.projet}-metadata"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "documentId"

  attribute {
    name = "documentId"
    type = "S"
  }
}
```

```hcl title="infra/outputs.tf"
output "bucket_documents" {
  description = "Nom du bucket des documents."
  value       = aws_s3_bucket.documents.bucket
}

output "table_metadata" {
  description = "Nom de la table des métadonnées."
  value       = aws_dynamodb_table.metadata.name
}
```

Le provider **6.67.0**, publié le 30 septembre 2026, est épinglé pour cet audit ; ce n'est pas une promesse de compatibilité avec tous les services Floci. La documentation Floci utilise la contrainte plus large `~> 6.0`. Le fichier `.terraform.lock.hcl` complète l'épinglage avec les empreintes des paquets. [Release du provider](https://github.com/hashicorp/terraform-provider-aws/releases/tag/v6.67.0) et [configuration Floci](https://floci.io/floci/getting-started/terraform/).

**Objectif :** créer deux ressources par IaC. **Prérequis :** Terraform ou OpenTofu selon le tableau initial, terminal local vérifié, dossier `infra/`.

Les noms par défaut (`docstore-documents`, `docstore-metadata`) correspondent à ceux de l'application de la section 10 : Terraform va créer l'infrastructure de l'application.

:::danger[Le bloc `endpoints` est obligatoire pour chaque service]
Si un service manque dans `endpoints`, sa cible peut être résolue par d'autres réglages (environnement, profil) ou par l'endpoint AWS normal. **N'utilisez pas cette résolution implicite comme garde-fou.** Avec les identifiants fictifs `test`, l'opération échouera (`InvalidClientTokenId` ou équivalent) : c'est un garde-fou appréciable. Mais si vous remplacez un jour ces identifiants par des variables qui en contiennent de réels, l'erreur pourrait devenir une création effective dans le cloud.
:::

#### Le cycle de vie Terraform

Vérifiez d'abord `aws sts get-caller-identity` et l'endpoint de chaque service du provider. Si les ressources de la section 10 existent encore, supprimez les ressources créées par l'application, pour que Terraform puisse les créer lui-même :

```bash
aws s3 rb s3://docstore-documents --force
aws dynamodb delete-table --table-name docstore-metadata
aws dynamodb wait table-not-exists --table-name docstore-metadata
```

Puis, depuis le dossier `infra/` :

```bash
cd infra
terraform init
```

- **Que fait-elle ?** Télécharge le provider AWS et prépare le dossier de travail (`.terraform/`, fichier de verrouillage `.terraform.lock.hcl`).
- **Pourquoi ?** Terraform ne peut rien faire sans son provider.
- **Vérification :** `Terraform has been successfully initialized!`

```bash
terraform fmt
terraform validate
```

- **Que font-elles ?** `fmt` normalise la mise en forme des fichiers ; `validate` vérifie la syntaxe et la cohérence interne, sans appeler d'API.
- **Pourquoi ?** Détecter les erreurs au plus tôt, avant tout appel réseau.
- **Vérification :** `Success! The configuration is valid.`

```bash
terraform plan
```

- **Que fait-elle ?** Compare la configuration à l'état actuel et affiche ce qui **serait** fait, sans rien modifier.
- **Pourquoi ?** Relire le plan avant d'agir est un réflexe essentiel, en local comme en production.
- **Vérification :** `Plan: 2 to add, 0 to change, 0 to destroy.`

```bash
terraform apply
```

- **Que fait-elle ?** Affiche le plan, demande confirmation (tapez `yes`), puis crée les ressources en appelant Floci.
- **Pourquoi ?** C'est l'étape qui matérialise l'infrastructure.
- **Vérification :** `Apply complete! Resources: 2 added, 0 changed, 0 destroyed.`, suivi des deux outputs.

Vérifiez côté Floci avec l'AWS CLI, et côté Terraform avec son état :

```bash
aws s3 ls                      # docstore-documents apparaît
aws dynamodb list-tables       # docstore-metadata apparaît
terraform state list           # aws_dynamodb_table.metadata, aws_s3_bucket.documents
terraform output
```

L'application de la section 10 peut désormais utiliser cette infrastructure sans `init` :

```bash
cd ..
DOCUMENT_ID=$(python docstore.py upload facture-42.txt)
echo "$DOCUMENT_ID"
python docstore.py list
cd infra
```

Enfin, détruisez tout :

```bash
terraform destroy
```

- **Que fait-elle ?** Supprime toutes les ressources gérées par cette configuration (confirmation `yes`).
- **Pourquoi ?** En CI comme en laboratoire, on termine toujours par un environnement propre.
- **Vérification :** `Destroy complete! Resources: 2 destroyed.`, puis `aws s3 ls` et `aws dynamodb list-tables` ne listent plus les ressources.

#### Et avec OpenTofu ?

Les fichiers principaux utilisent un sous-ensemble HCL commun à Terraform et OpenTofu. Avec OpenTofu **1.10+**, remplacez `terraform` par `tofu`. Le provider est téléchargé depuis le registre utilisé par l'outil ; vérifiez ses empreintes. La syntaxe d'un backend ou une fonctionnalité propre à l'outil doit être vérifiée séparément. **OpenTofu n'a pas été exécuté lors de cet audit.**

```bash
tofu init
tofu plan
tofu apply
tofu destroy
```

:::tip[Que versionner ?]
Versionnez les fichiers `.tf` et le fichier de verrouillage `.terraform.lock.hcl` (il fige les versions exactes du provider). N'ajoutez **jamais** `.terraform/` ni `terraform.tfstate*` à Git : ajoutez-les au `.gitignore`. Un fichier d'état peut contenir des données sensibles dans un vrai projet.
:::

---

### 12. Mini-projet Terraform multi-services

**Objectif :** ajouter versioning S3, SQS + DLQ et paramètres SSM à l'infrastructure précédente. **Prérequis :** fichiers du chapitre 11, provider local configuré, état cohérent avec Floci. Après le nettoyage du chapitre 11, le plan initial porte sur sept ressources ; si les deux ressources existent déjà, cinq ajouts sont attendus.

On enrichit l'infrastructure de l'application avec trois éléments supplémentaires :

```text
Terraform (infra/)
  +-- S3 : documents + versioning
  +-- DynamoDB : métadonnées
  +-- SQS : événements -> DLQ
  +-- SSM : noms des ressources
```

- le **versioning** du bucket (conserver les versions précédentes d'un objet) ;
- une **file SQS** pour publier des événements « document reçu », avec une **file de lettres mortes** (DLQ) qui récupère les messages en échec ;
- des **paramètres SSM** qui publient les noms des ressources, pour que d'autres applications les découvrent sans les coder en dur.

#### Étape 1 — Déclarer les nouveaux services dans le provider

```hcl title="infra/provider.tf (extrait modifié)"
endpoints {
  sts      = var.aws_endpoint
  iam      = var.aws_endpoint
  s3       = var.aws_endpoint
  dynamodb = var.aws_endpoint
  sqs      = var.aws_endpoint
  ssm      = var.aws_endpoint
}
```

C'est l'étape qu'on oublie le plus souvent : **nouveau service = nouvelle ligne `endpoints`**.

#### Étape 2 — Ajouter les ressources

```hcl title="infra/main.tf (ajouts)"
# Conserver l'historique des versions des objets.
resource "aws_s3_bucket_versioning" "documents" {
  bucket = aws_s3_bucket.documents.id

  versioning_configuration {
    status = "Enabled"
  }
}

# File de lettres mortes : reçoit les messages traités sans succès.
resource "aws_sqs_queue" "evenements_dlq" {
  name                      = "${var.projet}-evenements-dlq"
  message_retention_seconds = 1209600 # 14 jours
}

# File principale des événements "document reçu".
resource "aws_sqs_queue" "evenements" {
  name                       = "${var.projet}-evenements"
  visibility_timeout_seconds = 30

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.evenements_dlq.arn
    maxReceiveCount     = 3
  })
}

# Publication des noms de ressources pour les autres applications.
resource "aws_ssm_parameter" "bucket" {
  name  = "/${var.projet}/config/bucket"
  type  = "String"
  value = aws_s3_bucket.documents.bucket
}

resource "aws_ssm_parameter" "table" {
  name  = "/${var.projet}/config/table"
  type  = "String"
  value = aws_dynamodb_table.metadata.name
}
```

```hcl title="infra/outputs.tf (ajout)"
output "file_evenements_url" {
  description = "URL de la file SQS des événements."
  value       = aws_sqs_queue.evenements.url
}
```

#### Étape 3 — Déployer et vérifier

```bash
terraform fmt && terraform validate
terraform plan        # 7 ajouts depuis un état vide ; 5 si les 2 ressources existent.
terraform apply
```

Vérifiez chaque élément avec l'AWS CLI :

```bash
# Versioning du bucket : doit afficher "Status": "Enabled"
aws s3api get-bucket-versioning --bucket docstore-documents

# File SQS principale et sa politique de redirection vers la DLQ
QUEUE_URL=$(aws sqs get-queue-url --queue-name docstore-evenements --query QueueUrl --output text)
aws sqs get-queue-attributes --queue-url "$QUEUE_URL" --attribute-names RedrivePolicy

# Paramètres SSM publiés
aws ssm get-parameters-by-path --path /docstore/ --recursive \
  --query 'Parameters[].[Name,Value]' --output table
```

Faites circuler un message pour valider la file :

```bash
aws sqs send-message --queue-url "$QUEUE_URL" --message-body '{"evenement":"document-recu","id":"demo"}'
RECEIPT=$(aws sqs receive-message --queue-url "$QUEUE_URL" \
  --max-number-of-messages 1 --wait-time-seconds 5 \
  --query 'Messages[0].ReceiptHandle' --output text)
test "$RECEIPT" != "None" && test -n "$RECEIPT"
aws sqs delete-message --queue-url "$QUEUE_URL" --receipt-handle "$RECEIPT"
```

**Vérification :** `receive-message` donne un reçu, puis `delete-message` acquitte le message. Une réception ne supprime pas le message : sans acquittement, il redevient visible après le visibility timeout.

:::tip[Concept AWS à retenir — SQS, DLQ et SSM]
SQS standard peut livrer un message plusieurs fois : le consommateur doit être idempotent. Une DLQ isole les messages reçus trop de fois sans succès ; ici `maxReceiveCount=3`, mais ce court exercice ne vérifie pas la redirection. SSM Parameter Store centralise une configuration ; `String` ne représente pas un secret chiffré `SecureString`. [SQS/DLQ](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html) et [Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html).
:::

#### Étape 4 — Expérimenter sans risque

C'est ici que Floci montre tout son intérêt : vous pouvez tester des modifications structurantes sans conséquence.

```bash
# Que se passe-t-il si on change le préfixe ? (lecture seule)
terraform plan -var='projet=docstore-dev'
```

Le plan annonce le remplacement de plusieurs ressources (`must be replaced`), car le nom d'un bucket ou d'une table ne peut pas être modifié en place. Sur un vrai compte, ce type de plan mérite une lecture très attentive : remplacer une table, c'est perdre ses données.

Terminez par :

```bash
terraform destroy
```

#### Optionnel — état distant et verrouillage : distinguer les versions

**Objectif :** comprendre qu'un backend stocke le *state*, tandis que le provider crée les ressources. Analogie : le provider est l'ouvrier, le backend garde son registre de travaux. Leurs endpoints sont configurés **séparément**. Le backend local reste le choix principal du guide.

**Prérequis :** mode persistant opérationnel (chapitre 17), environnement jetable et sauvegarde du state. Stocker le state dans un Floci en mode `memory` peut le faire disparaître au prochain arrêt. Le backend ne protège pas les données métier et ne doit pas dépendre du bucket géré par le même state.

| Outil / mécanisme | Situation vérifiée au 1er octobre 2026 |
| --- | --- |
| Terraform S3 + `use_lockfile=true` | Verrou natif S3 disponible depuis Terraform 1.10 ; mécanisme moderne documenté par HashiCorp. |
| Terraform + `dynamodb_table` | Verrouillage DynamoDB déprécié dans la documentation actuelle. |
| OpenTofu S3 | La documentation actuelle décrit aussi `use_lockfile` et le verrouillage DynamoDB ; vérifier la version utilisée. |
| Floci 2.1.0 | La documentation Floci montre un backend S3 avec verrouillage DynamoDB, utilisé dans sa suite de compatibilité. La concurrence du verrou S3 natif n'a pas été testée ici. |

Sources : [backend Terraform](https://developer.hashicorp.com/terraform/language/backend/s3), [verrou S3 introduit en 1.10](https://github.com/hashicorp/terraform/releases/tag/v1.10.0), [backend OpenTofu](https://opentofu.org/docs/language/settings/backends/s3/) et [exemple Floci](https://floci.io/floci/getting-started/terraform/).

L'exemple suivant conserve le **mécanisme documenté par Floci**, tout en utilisant la syntaxe moderne `endpoints`. Il sert à comprendre un backend et une configuration historique ; ne le prenez pas comme recommandation d'architecture AWS nouvelle.

```bash
aws s3api create-bucket --bucket tfstate
aws s3api put-bucket-versioning --bucket tfstate \
  --versioning-configuration Status=Enabled
aws dynamodb create-table --table-name tflock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH --billing-mode PAY_PER_REQUEST
aws dynamodb wait table-exists --table-name tflock
```

```hcl title="infra/backend.tf"
terraform {
  backend "s3" {
    bucket = "tfstate"
    key    = "lab/terraform.tfstate"
    region = "us-east-1"

    endpoints = {
      s3       = "http://localhost:4566"
      dynamodb = "http://localhost:4566"
      sts      = "http://localhost:4566"
      iam      = "http://localhost:4566"
    }
    dynamodb_table = "tflock" # historique ; déprécié dans Terraform actuel

    access_key                  = "test"
    secret_key                  = "test"
    skip_credentials_validation = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_metadata_api_check     = true
    use_path_style              = true
  }
}
```

```bash
# Si un state local existe déjà, migrer et relire les questions de confirmation :
terraform init -migrate-state
terraform plan
aws s3api list-object-versions --bucket tfstate --prefix lab/
```

**Résultat attendu :** le state est stocké sous `lab/terraform.tfstate` et le plan reste cohérent. Pour une configuration neuve sans state à migrer, `terraform init` suffit. `-reconfigure` oublie la configuration précédente ; **il ne migre pas le state** et ne remplace pas `-migrate-state`.

Pour expérimenter le verrou natif, remplacez `dynamodb_table` par `use_lockfile = true` dans un **projet jetable distinct**. Sa syntaxe est documentée par les outils ; sa sûreté contre deux écritures concurrentes nécessite une vérification comportementale de Floci (création conditionnelle du verrou, refus du concurrent, libération après erreur). Ne désactivez pas le verrou avec `-lock=false` pour masquer un échec.

**Nettoyage :** détruisez les ressources métier avant de supprimer leur state. Pour revenir au backend local, retirez `backend.tf` de la configuration puis exécutez `terraform init -migrate-state` et vérifiez le state local. Supprimez ensuite la table `tflock` et, si vous le souhaitez, le bucket de state. **Un bucket versionné doit être vidé de toutes ses versions et de ses delete markers : `aws s3 rb --force` seul ne suffit pas.** Inspectez d'abord `list-object-versions`, puis supprimez chaque version avec `delete-object --version-id` avant `delete-bucket`. Conservez une copie du state tant que les ressources existent.

---

## Partie V — Compute et services avancés

### 13. EC2 en local

**Objectif :** lancer un conteneur via l'API EC2, vérifier UserData, observer les états puis terminer l'instance. **Prérequis :** Docker, images téléchargeables, terminal local vérifié ; lecture préalable de l'avertissement sur le socket. **Référence :** [EC2 dans le tag 2.1.0](https://github.com/floci-io/floci/blob/2.1.0/docs/services/ec2.md).

#### EC2 sur AWS et EC2 sur Floci

Sur AWS, une instance EC2 est une **machine virtuelle** : un hyperviseur lui attribue des processeurs, de la mémoire et un disque construit à partir d'une **AMI** (*Amazon Machine Image*).

Floci ne crée pas de machine virtuelle. Pour chaque instance, l'appel `RunInstances` démarre un **vrai conteneur Docker** Linux, maintenu en vie en arrière-plan. Les transitions d'état EC2 correspondent à des opérations Docker :

| État EC2 | Opération Docker réalisée par Floci |
| --- | --- |
| `pending` → `running` | Création et démarrage du conteneur |
| `running` → `stopping` → `stopped` | `docker stop` |
| `stopped` → `pending` → `running` | `docker start` |
| `running` → `shutting-down` → `terminated` | `docker rm -f` |
| Redémarrage | `docker restart` |

L'AMI est traduite en image Docker grâce à un catalogue. Quelques correspondances :

| AMI (alias acceptés par Floci) | Image Docker utilisée |
| --- | --- |
| `ami-amazonlinux2023` | `public.ecr.aws/amazonlinux/amazonlinux:2023` |
| `ami-amazonlinux2` | `public.ecr.aws/amazonlinux/amazonlinux:2` |
| `ami-ubuntu2204` | `public.ecr.aws/docker/library/ubuntu:22.04` |
| `ami-ubuntu2404` | `public.ecr.aws/docker/library/ubuntu:24.04` |
| `ami-debian12` | `public.ecr.aws/docker/library/debian:12` |
| Toute AMI inconnue (y compris un vrai identifiant AWS) | Image par défaut `amazonlinux:2023` |

Floci injecte aussi la clé SSH déclarée, exécute le script **UserData** au démarrage et fournit un service de métadonnées **IMDS** (v1 et v2) à l'adresse habituelle `169.254.169.254`. Les limites CPU et mémoire du conteneur suivent le type d'instance demandé.

#### Prérequis : donner à Floci l'accès au socket Docker

Pour créer des conteneurs, Floci doit pouvoir parler au moteur Docker de votre machine, via son socket `/var/run/docker.sock`. Sans cet accès, une instance ne peut pas passer à l'état `running`.

:::danger[Monter le socket Docker, c'est donner les clés de la machine]
Un processus qui accède à `/var/run/docker.sock` peut lancer n'importe quel conteneur, y compris un conteneur privilégié qui monte le système de fichiers de l'hôte : c'est l'équivalent d'un accès **root** sur votre machine. Combiné à un port 4566 exposé sur le réseau, cela permettrait à un tiers d'exécuter du code chez vous (une instance EC2 avec un UserData malveillant suffit). N'activez le socket que lorsque vous en avez besoin, gardez `127.0.0.1` dans la publication du port, et réservez cette configuration à un poste de développement ou à un runner CI éphémère.
:::

Recréez Floci avec l'accès au socket (en mode `memory` par défaut, les ressources créées dans les sections précédentes sont perdues : c'est sans conséquence pour la suite) :

```bash
docker rm -f floci
docker run -d \
  --name floci \
  -p 127.0.0.1:4566:4566 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  floci/floci:2.1.0
```

| Nouvelle option | Rôle |
| --- | --- |
| `-v /var/run/docker.sock:/var/run/docker.sock` | Monte le socket Docker de l'hôte dans le conteneur Floci : Floci peut piloter Docker. |
| `FLOCI_RUN_AS_ROOT=true` (option à ajouter avec `-e` si nécessaire) | Empêche la baisse de privilèges de l'entrypoint quand le socket reste inaccessible ; ne pas l'activer par défaut. |

Avec Docker Compose, utilisez la version avancée du chapitre 5. **Choisissez un seul mode de lancement** : si Compose gère déjà Floci, modifiez son fichier et utilisez `docker compose up -d`, au lieu de recréer un conteneur à la main. Attendez ensuite Floci avec `bash scripts/wait-for-floci.sh`.

:::tip[Tester Terraform sans socket : le mode « mock »]
Si vous voulez seulement valider des modules Terraform qui créent des instances, sans exécuter de conteneurs, la variable `FLOCI_SERVICES_EC2_MOCK=true` fait passer les instances directement à leur état final sans Docker. Vous gagnez en vitesse et vous évitez de monter le socket ; vous perdez l'exécution réelle (UserData, IMDS, SSH).
:::

#### Étape 1 — Préparer un script UserData

```bash title="userdata.sh"
#!/bin/bash
echo "UserData exécuté le $(date -u)" > /tmp/userdata-ok.txt
```

:::tip[Concept AWS à retenir — EC2 UserData]
Une AMI décrit l'image de démarrage ; UserData configure l'instance au démarrage, par exemple via cloud-init sur une AMI Linux adaptée. Ne placez pas de secrets dans ce script. Floci exécute son adaptation dans un conteneur, sans reproduire une VM, son noyau ou tout le comportement cloud-init. [UserData sur AWS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html).
:::

Le **UserData** de ce laboratoire est un script de démarrage. Sur AWS, on l'utilise pour installer des paquets ou configurer une application ; ici, il laisse une trace vérifiable.

#### Étape 2 — Lancer l'instance

```bash
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id ami-amazonlinux2023 \
  --instance-type t3.micro \
  --count 1 \
  --user-data file://userdata.sh \
  --query 'Instances[0].InstanceId' \
  --output text)
echo "$INSTANCE_ID"
```

- **Que fait-elle ?** Demande une instance `t3.micro` basée sur Amazon Linux 2023, avec le script UserData ; la sortie est filtrée pour ne garder que l'identifiant.
- **Pourquoi ?** `RunInstances` est l'appel fondamental d'EC2. L'AWS CLI encode automatiquement le UserData en base64, comme l'exige l'API.
- **Vérification :** un identifiant de la forme `i-…` s'affiche.

#### Étape 3 — Attendre l'état `running`

```bash
aws ec2 wait instance-running --instance-ids "$INSTANCE_ID"
aws ec2 describe-instances --instance-ids "$INSTANCE_ID" \
  --query 'Reservations[].Instances[].[InstanceId,State.Name,InstanceType,PrivateIpAddress]' \
  --output table
```

Le passage à `running` n'est pas instantané, surtout la première fois : Docker doit télécharger l'image Amazon Linux. La commande `wait` interroge l'API jusqu'à ce que l'état soit atteint.

**Vérification :** le tableau affiche l'instance à l'état `running`.

#### Étape 4 — Observer le conteneur

```bash
docker ps --format 'table {{.ID}}\t{{.Image}}\t{{.Names}}\t{{.Status}}'
CID=$(docker ps --filter "label=io.floci.service=ec2" \
  --filter "label=io.floci.resource-id=$INSTANCE_ID" --format '{{.ID}}')
test -n "$CID" || { echo "Conteneur de l'instance introuvable" >&2; exit 1; }
echo "$CID"
```

Vous voyez maintenant, à côté du conteneur `floci`, le conteneur qui « est » votre instance.

#### Étape 5 — Vérifier UserData et IMDS depuis l'intérieur

```bash
docker exec "$CID" cat /tmp/userdata-ok.txt
```

**Vérification :** la ligne `UserData exécuté le …` doit apparaître. L'état `running` ne garantit pas que UserData a terminé : si le fichier manque, attendez puis relisez les journaux du conteneur ciblé par son label ; ne choisissez pas arbitrairement le premier conteneur Linux.

Interrogez ensuite le service de métadonnées avec le protocole IMDSv2 (jeton de session, puis requête) :

```bash
docker exec "$CID" sh -c '
  command -v curl >/dev/null || { echo "curl absent de cette image" >&2; exit 1; }
  TOKEN=$(curl -fsS --connect-timeout 2 --max-time 5 -X PUT http://169.254.169.254/latest/api/token \
    -H "x-aws-ec2-metadata-token-ttl-seconds: 300")
  curl -fsS --connect-timeout 2 --max-time 5 -H "x-aws-ec2-metadata-token: $TOKEN" \
    http://169.254.169.254/latest/meta-data/instance-id
  echo'
```

**Vérification :** l'identifiant `i-…` de votre instance s'affiche. Le protocole illustre la lecture des métadonnées. Sur AWS, les credentials temporaires IMDS nécessitent un rôle associé via un instance profile ; lire `instance-id` ne teste pas ce mécanisme. **Erreur fréquente :** `curl` manque dans une image minimale ; ce sous-exercice IMDS exige un client HTTP dans l'image et ne doit pas être considéré comme vérifié sur toutes les images.

#### Étape 6 — Cycle de vie

```bash
aws ec2 stop-instances --instance-ids "$INSTANCE_ID"
aws ec2 wait instance-stopped --instance-ids "$INSTANCE_ID"
docker ps -a --filter "id=$CID" --format '{{.Status}}'     # Exited (...)

aws ec2 start-instances --instance-ids "$INSTANCE_ID"
aws ec2 wait instance-running --instance-ids "$INSTANCE_ID"

aws ec2 terminate-instances --instance-ids "$INSTANCE_ID"
aws ec2 wait instance-terminated --instance-ids "$INSTANCE_ID"
```

**Vérification :** après `terminate`, le conteneur a disparu de `docker ps -a`. Comme sur AWS, l'instance terminée reste visible dans `describe-instances` pendant environ une heure.

:::note[Et SSH ?]
Si vous lancez l'instance avec `--key-name`, Floci copie la clé publique dans `/root/.ssh/authorized_keys`, tente de démarrer `sshd` s'il est présent dans l'image, et publie le port 22 sur un port de l'hôte (plage 2200–2299 par défaut). Les images de base comme Amazon Linux ne contiennent pas forcément de serveur SSH : pour un laboratoire, `docker exec` est la méthode la plus simple.
:::

#### EC2 avec Terraform

Ajoutez la ligne `ec2` au bloc `endpoints` existant du provider. L'extrait ci-dessous reprend la configuration de base ; conservez aussi `sqs` et `ssm` si vous utilisez encore le mini-projet multi-services :

```hcl title="infra/provider.tf (extrait)"
endpoints {
  ec2      = var.aws_endpoint
  sts      = var.aws_endpoint
  iam      = var.aws_endpoint
  s3       = var.aws_endpoint
  dynamodb = var.aws_endpoint
}
```

Floci crée par défaut un VPC, trois sous-réseaux, un groupe de sécurité et une passerelle Internet « par défaut » dans chaque région, pour que Terraform et l'AWS CLI fonctionnent sans préparation. Validez vos ressources `aws_instance` sur votre version de Floci avant d'en faire un test de référence.

---

### 14. Lambda en Python

#### Les notions

**AWS Lambda** exécute du code sans serveur à gérer : vous fournissez une fonction, AWS l'exécute à chaque événement (appel direct, message SQS, requête HTTP…) et facture à l'usage.

Floci exécute vos fonctions dans de **vrais conteneurs Docker**, à partir des images de runtime officielles publiées par AWS. Le comportement est donc très proche de l'environnement Lambda réel (variables d'environnement, modèle d'invocation, conteneurs « chauds » réutilisés entre deux appels), même si l'isolation diffère : AWS utilise des micro-VM Firecracker.

```text
   lambda_function.py
          |
          |  zip
          v
   function.zip  --- create-function --->  Floci (API Lambda)
                                               |
                     invoke                    |  1er appel : téléchargement
                                               |  de l'image runtime Python
                                               v
                          Conteneur Docker "floci-hello-floci-..."
                          (runtime Python officiel AWS)
                                               |
                 réponse JSON  <---------------+----> journaux (docker logs)
```

**Objectif :** créer un rôle, déployer une fonction Python, l'invoquer, observer les journaux puis nettoyer. **Prérequis :** Floci avec accès Docker, terminal local vérifié, Python pour produire le ZIP. [Lambda dans Floci 2.1.0](https://github.com/floci-io/floci/blob/2.1.0/docs/services/lambda.md).

#### Étape 1 — Créer un rôle d'exécution

Toute fonction Lambda s'exécute avec un **rôle IAM**. Le rôle contient deux aspects distincts : une **politique de confiance** indique qui peut l'endosser ; des **politiques de permissions** indiquent ce qu'il peut faire. Le laboratoire crée la confiance seulement. Sur AWS, il faut aussi les permissions nécessaires, notamment pour CloudWatch Logs. [Rôle d'exécution Lambda](https://docs.aws.amazon.com/lambda/latest/dg/lambda-intro-execution-role.html).

```json title="trust-lambda.json"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "lambda.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

```bash
aws iam create-role \
  --role-name lambda-lab-role \
  --assume-role-policy-document file://trust-lambda.json \
  --query 'Role.Arn' --output text
```

- **Que fait-elle ?** Crée le rôle `lambda-lab-role` et le rend « endossable » par le service Lambda (politique de confiance).
- **Pourquoi ?** Quand le rôle existe dans Floci, la fonction reçoit des **identifiants temporaires de ce rôle**. Sans rôle connu, Floci se rabat sur ses propres variables d'environnement, ce qui peut être dangereux (voir l'encadré ci-dessous).
- **Vérification :** l'ARN `arn:aws:iam::000000000000:role/lambda-lab-role` s'affiche.

:::danger[Fuite possible d'identifiants réels vers vos fonctions]
D'après la documentation Floci, pour une fonction dont le rôle est **inconnu**, Floci transmet au conteneur Lambda ses propres variables `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` et `AWS_SESSION_TOKEN` s'il en possède. Si des identifiants AWS **réels sont injectés dans l'environnement du processus Floci**, ils peuvent se retrouver dans ces fonctions. Docker ne transmet pas automatiquement les variables du terminal : le risque apparaît notamment avec `-e`, `env_file`, une interpolation Compose ou un lancement natif. Créez toujours le rôle d'exécution dans Floci, et ne lancez jamais Floci depuis un environnement contenant des clés réelles.
:::

#### Étape 2 — Écrire la fonction

```python title="lambda_function.py"
import json
import os
import platform


def lambda_handler(event, context):
    nom = event.get("name", "Floci")
    # Tout ce qui est écrit sur la sortie standard part dans les journaux.
    print(f"Événement reçu : {json.dumps(event)}")
    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": f"Bonjour {nom} !",
            "fonction": context.function_name,
            "python": platform.python_version(),
            "region": os.environ.get("AWS_REGION", "inconnue"),
        }),
    }
```

- `event` contient les données d'entrée de l'invocation ;
- `context` fournit des informations sur l'exécution (nom de la fonction, temps restant…) ;
- la valeur renvoyée est la réponse de l'invocation.

#### Étape 3 — Empaqueter

```bash
zip function.zip lambda_function.py
# Sans l'outil zip :  python3 -m zipfile -c function.zip lambda_function.py
```

**Vérification :** `unzip -l function.zip` (ou `python3 -m zipfile -l function.zip`) liste `lambda_function.py` **à la racine** de l'archive. Un fichier placé dans un sous-dossier provoquerait une erreur « module introuvable » à l'invocation.

#### Étape 4 — Créer la fonction

```bash
aws lambda create-function \
  --function-name hello-floci \
  --runtime python3.13 \
  --role arn:aws:iam::000000000000:role/lambda-lab-role \
  --handler lambda_function.lambda_handler \
  --zip-file fileb://function.zip
```

| Option | Signification |
| --- | --- |
| `--function-name` | Nom de la fonction. |
| `--runtime python3.13` | Environnement d'exécution. Tout runtime disposant d'une image officielle AWS fonctionne (`python3.13`, `nodejs22.x`, `java21`…). |
| `--role` | ARN du rôle d'exécution créé à l'étape 1. |
| `--handler` | Point d'entrée, sous la forme `fichier.fonction` : ici `lambda_function.lambda_handler`. |
| `--zip-file fileb://…` | Le paquet de code. `fileb://` indique un fichier binaire local. |

**Vérification :**

```bash
aws lambda get-function-configuration --function-name hello-floci \
  --query '[FunctionName,Runtime,Handler]' --output table
```

#### Étape 5 — Invoquer

```bash
aws lambda invoke \
  --function-name hello-floci \
  --cli-binary-format raw-in-base64-out \
  --payload '{"name": "DevOps"}' \
  --cli-read-timeout 300 \
  reponse.json

cat reponse.json
```

| Option | Signification |
| --- | --- |
| `--cli-binary-format raw-in-base64-out` | Permet de passer le `--payload` en JSON lisible (l'AWS CLI v2 attend sinon du base64). |
| `--payload` | L'événement transmis à la fonction (le paramètre `event`). |
| `--cli-read-timeout 300` | Laisse jusqu'à 5 minutes au premier appel, le temps que Docker télécharge l'image du runtime. |
| `reponse.json` | Fichier dans lequel la réponse de la fonction est écrite. |

**Vérification :** `StatusCode: 200` indique le succès de l'appel d'invocation synchrone, **pas nécessairement celui du code**. Contrôlez aussi l'absence de `FunctionError` et le contenu de `reponse.json` (`body` est ici une chaîne JSON). La réponse métier doit contenir `Bonjour DevOps !`. [Sémantique Invoke](https://docs.aws.amazon.com/lambda/latest/api/API_Invoke.html).

Le premier appel est lent (téléchargement de l'image, démarrage à froid) ; relancez la commande : la réponse est quasi immédiate, car Floci réutilise le conteneur « chaud ».

Une invocation **asynchrone** (la fonction s'exécute en arrière-plan) renvoie le code `202` :

```bash
aws lambda invoke \
  --function-name hello-floci \
  --invocation-type Event \
  --cli-binary-format raw-in-base64-out \
  --payload '{"name": "async"}' \
  /dev/null
```

#### Étape 6 — Consulter les journaux

Les conteneurs peuvent être retrouvés par leurs labels `io.floci.service=lambda` et `io.floci.resource-id=hello-floci`, sans dépendre de leur ordre de création. Leur préfixe de nom est configurable ; le schéma par défaut est `floci-<fonction>-<identifiant>`. Les messages `print()` de votre fonction apparaissent dans les journaux de ce conteneur :

```bash
docker ps --filter "label=io.floci.service=lambda" \
  --filter "label=io.floci.resource-id=hello-floci" --format '{{.ID}}  {{.Names}}  {{.Image}}'
LAMBDA_CID=$(docker ps --filter 'label=io.floci.service=lambda' \
  --filter 'label=io.floci.resource-id=hello-floci' --format '{{.ID}}' | head -n 1)
test -n "$LAMBDA_CID"
docker logs "$LAMBDA_CID"
```

**Vérification :** vous retrouvez la ligne `Événement reçu : {"name": "DevOps"}`.

Un conteneur inactif est arrêté au bout de 300 secondes par défaut ; s'il a disparu, relancez une invocation avant de consulter les journaux.

:::caution[CloudWatch Logs]
Sur AWS, les journaux d'une fonction sont envoyés dans le groupe CloudWatch Logs `/aws/lambda/<nom>`. Floci renvoie bien ce nom de groupe dans la configuration de la fonction, mais sa documentation ne garantit pas que la sortie des invocations y soit publiée. Vérifiez sur votre version avec `aws logs describe-log-groups --log-group-name-prefix /aws/lambda/` ; si le groupe n'apparaît pas ou reste vide, `docker logs` est la source de référence.
:::

#### Étape 7 — Mettre à jour le code

Modifiez le message dans `lambda_function.py` (par exemple `f"Salut {nom} !"`), puis :

```bash
python3 -m zipfile -c function.zip lambda_function.py
aws lambda update-function-code --function-name hello-floci --zip-file fileb://function.zip
aws lambda invoke --function-name hello-floci \
  --cli-binary-format raw-in-base64-out --payload '{"name": "DevOps"}' reponse.json
cat reponse.json
```

**Vérification :** la réponse contient le nouveau message.

#### Étape 8 — Nettoyer

```bash
aws lambda delete-function --function-name hello-floci
aws iam delete-role --role-name lambda-lab-role
aws lambda list-functions --query 'Functions[].FunctionName'
```

**Vérification du nettoyage :** `hello-floci` ne figure plus dans la liste et son conteneur d'exécution n'est plus actif.

:::note[Pour aller plus loin]
Floci prend aussi en charge les déclencheurs (*event source mappings*) depuis SQS, Kinesis et DynamoDB Streams, les versions, les alias, les URL de fonction et un rechargement à chaud du code pendant le développement. Certaines opérations ne sont pas implémentées (concurrence provisionnée, `InvokeWithResponseStream`, application des signatures de code) : consultez la page Lambda de la documentation Floci avant de bâtir un scénario dessus.
:::

---

### 15. Découverte d'ECS, EKS et RDS

**Objectif :** distinguer API de contrôle, données locales et exécution réelle. **Prérequis communs :** Floci 2.1.0 avec socket Docker, terminal de laboratoire, ressources uniques et réseau Docker de confiance. Ces scénarios avancés sont vérifiés dans les références, **sans exécution lors de l'audit**. Un mode `mock` conserve des métadonnées sans lancer le service correspondant ; un état `RUNNING` ou `ACTIVE` en mock ne prouve donc aucune exécution.

#### Amazon ECS — définition de tâche et tâche réelle

Sur AWS, une définition de tâche est la recette des conteneurs ; la tâche est une exécution de cette recette ; un service maintient un nombre souhaité de tâches. Floci peut accepter les paramètres `FARGATE` tout en exécutant la tâche avec **Docker sur l'hôte** : ce n'est pas l'infrastructure Fargate d'AWS. Les règles de placement et le réseau doivent être validés séparément. [Référence ECS 2.1.0](https://github.com/floci-io/floci/blob/2.1.0/docs/services/ecs.md).

```bash
aws ecs create-cluster --cluster-name lab-ecs
TASK_DEF=$(aws ecs register-task-definition --family lab-web \
  --network-mode awsvpc --requires-compatibilities FARGATE \
  --cpu 256 --memory 512 \
  --container-definitions '[{"name":"web","image":"nginx:alpine","essential":true,"portMappings":[{"containerPort":80,"protocol":"tcp"}]}]' \
  --query 'taskDefinition.taskDefinitionArn' --output text)
SUBNET=$(aws ec2 describe-subnets --query 'Subnets[0].SubnetId' --output text)
test -n "$SUBNET" && test "$SUBNET" != "None"
aws ecs run-task --cluster lab-ecs --task-definition "$TASK_DEF" \
  --launch-type FARGATE --count 1 \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNET]}" > ecs-run.json
cat ecs-run.json
TASK_ARN=$(python3 -c 'import json; r=json.load(open("ecs-run.json")); assert not r.get("failures"), r; print(r["tasks"][0]["taskArn"])')
aws ecs wait tasks-running --cluster lab-ecs --tasks "$TASK_ARN"
aws ecs describe-tasks --cluster lab-ecs --tasks "$TASK_ARN" \
  --query 'tasks[0].[lastStatus,containers[0].name]' --output table
docker ps --filter "label=io.floci.service=ecs"

# Nettoyage de la tâche, de la définition et du cluster.
aws ecs stop-task --cluster lab-ecs --task "$TASK_ARN"
aws ecs wait tasks-stopped --cluster lab-ecs --tasks "$TASK_ARN"
aws ecs deregister-task-definition --task-definition "$TASK_DEF"
aws ecs delete-cluster --cluster lab-ecs
```

**Explication :** le subnet est découvert dans Floci, sans identifiant inventé. `failures` doit être vide : `RunTask` peut retourner des échecs dans une réponse HTTP réussie. **Résultat attendu :** tâche `RUNNING`, conteneur nginx visible, puis tâche `STOPPED` après nettoyage. **Erreur fréquente :** attendre un serveur sur `localhost:8081` sans publication effective du port ; le réseau `awsvpc` ne garantit pas ce mapping sur l'hôte. Inspectez `docker ps` et la configuration réseau avant un test HTTP. `nginx:alpine` est volontairement un exemple de tag flottant : relevez son digest pour figer un laboratoire ou la CI. `FLOCI_SERVICES_ECS_MOCK=true` évite Docker, mais ne lance pas nginx.

#### Amazon EKS — k3s et credentials locaux dédiés

Sur AWS, EKS fournit un plan de contrôle Kubernetes géré. Floci lance un **k3s mono-nœud dans un conteneur privilégié** ; les groupes de nœuds et profils Fargate de 2.1.0 sont des métadonnées. Cette version ne couvre notamment pas les access entries ni les add-ons. La documentation courante peut décrire des opérations apparues après le tag utilisé. [Référence EKS 2.1.0](https://github.com/floci-io/floci/blob/2.1.0/docs/services/eks.md).

**Prérequis supplémentaires :** `kubectl`, ressources CPU/RAM suffisantes, réseau de confiance. Le webhook EKS de Floci **refuse `test/test` et `floci/floci`** : créez une clé dans son IAM local. Elle reste fictive pour AWS. Les exemples suivants supposent l'enforcement IAM désactivé, comme dans la configuration initiale.

Pour figer l'image k3s choisie, téléchargez-la et relevez son digest ; définissez ensuite `FLOCI_SERVICES_EKS_DEFAULT_IMAGE` dans le service Floci avec la valeur obtenue, puis recréez Floci et attendez sa disponibilité. Préservez les données utiles avant cette recréation.

```bash
docker pull rancher/k3s:latest
docker image inspect --format '{{index .RepoDigests 0}}' rancher/k3s:latest
```

```json title="trust-eks.json"
{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"eks.amazonaws.com"},"Action":"sts:AssumeRole"}]}
```

```bash
aws iam create-role --role-name lab-eks-role \
  --assume-role-policy-document file://trust-eks.json
aws iam create-user --user-name lab-eks-user
read -r EKS_ACCESS_KEY EKS_SECRET_KEY < <(aws iam create-access-key \
  --user-name lab-eks-user \
  --query 'AccessKey.[AccessKeyId,SecretAccessKey]' --output text)

# Configuration simplifiée spécifique à Floci ; AWS réel exige des subnets adaptés.
aws eks create-cluster --name lab-eks \
  --role-arn arn:aws:iam::000000000000:role/lab-eks-role \
  --resources-vpc-config '{"subnetIds":[],"securityGroupIds":[]}'
aws eks wait cluster-active --name lab-eks
aws eks describe-cluster --name lab-eks --query 'cluster.[status,endpoint]' --output table

# Les credentials doivent aussi être présents quand kubectl appelle "aws eks get-token".
(
  export AWS_ACCESS_KEY_ID="$EKS_ACCESS_KEY"
  export AWS_SECRET_ACCESS_KEY="$EKS_SECRET_KEY"
  unset AWS_SESSION_TOKEN
  aws eks update-kubeconfig --name lab-eks --kubeconfig "$PWD/kubeconfig-floci"
  kubectl --kubeconfig "$PWD/kubeconfig-floci" get nodes
)

# Nettoyage ; le kubeconfig habituel de l'utilisateur n'a pas été modifié.
aws eks delete-cluster --name lab-eks
aws eks wait cluster-deleted --name lab-eks
aws iam delete-access-key --user-name lab-eks-user --access-key-id "$EKS_ACCESS_KEY"
aws iam delete-user --user-name lab-eks-user
aws iam delete-role --role-name lab-eks-role
unset EKS_ACCESS_KEY EKS_SECRET_KEY
rm -f kubeconfig-floci
```

**Résultat attendu :** cluster `ACTIVE`, un nœud k3s visible, puis cluster supprimé. **Vérification :** consultez aussi `docker ps --filter label=io.floci.service=eks`. **Erreur fréquente :** `401` avec les clés publiques de démonstration, ou endpoint Kubernetes inaccessible depuis le terminal. Le port k3s est publié directement par son conteneur ; `127.0.0.1:4566:4566` ne limite pas automatiquement ses ports annexes. Inspectez les bindings et le pare-feu. Le mode `FLOCI_SERVICES_EKS_MOCK=true` n'offre aucune API Kubernetes réelle.

Commandes AWS CLI de référence : [get-token](https://docs.aws.amazon.com/cli/latest/reference/eks/get-token.html) et [update-kubeconfig](https://docs.aws.amazon.com/cli/latest/reference/eks/update-kubeconfig.html).

#### Amazon RDS — API de contrôle et vraie requête SQL

RDS gère les bases relationnelles sur AWS. Floci pilote un moteur en conteneur et un proxy TCP. Tester `CreateDBInstance` valide le plan de contrôle ; tester `SELECT 1` valide aussi l'accès au moteur. Une connexion réussie ne prouve ni Multi-AZ ni la durabilité d'AWS. [Référence RDS](https://floci.io/floci/services/rds/).

**Prérequis supplémentaires :** client `psql` ; ajoutez `"127.0.0.1:7001-7099:7001-7099"` aux `ports` du service Floci dans Compose puis recréez-le **avant** la création de la base. Cette plage publie le proxy RDS ; les conteneurs EKS, eux, publient directement leurs ports.

```bash
aws rds create-db-instance --db-instance-identifier lab-postgres \
  --engine postgres --db-instance-class db.t3.micro \
  --master-username labadmin --master-user-password 'MotDePasseDeLabo-2026' \
  --allocated-storage 20 --db-name labdb
aws rds wait db-instance-available --db-instance-identifier lab-postgres
aws rds describe-db-instances --db-instance-identifier lab-postgres \
  --query 'DBInstances[0].[DBInstanceStatus,Endpoint.Address,Endpoint.Port]' --output table
DB_PORT=$(aws rds describe-db-instances --db-instance-identifier lab-postgres \
  --query 'DBInstances[0].Endpoint.Port' --output text)
# Depuis l'hôte, le proxy a été publié sur l'interface locale.
psql "host=127.0.0.1 port=$DB_PORT user=labadmin dbname=labdb" -W -c 'SELECT 1;'

aws rds delete-db-instance --db-instance-identifier lab-postgres --skip-final-snapshot
aws rds wait db-instance-deleted --db-instance-identifier lab-postgres
```

**Résultat attendu :** `SELECT 1` renvoie `1`. Saisissez le mot de passe de laboratoire lorsque `psql` le demande. **Erreur fréquente :** un statut `available` ne suffit pas à prouver que le proxy et le moteur sont joignables ; vérifiez le port publié, les journaux et la requête SQL. **Nettoyage :** la base doit disparaître de `describe-db-instances`. Selon le mode de persistance, son volume Docker peut être conservé : inspectez les volumes du laboratoire avant de supprimer uniquement ceux devenus inutiles. Ce mot de passe figure dans l'historique de commande ; n'utilisez ce schéma qu'avec des données fictives et une base jetable.

---

### 16. Tableau des services

Floci émule un **large catalogue de services AWS**. Aucun nombre figé n'est utilisé ici : la matrice canonique distingue parfois plusieurs plans ou API d'un même service, et son contenu évolue. Le tableau ci-dessous sélectionne ceux qui sont les plus utiles pour apprendre, en indiquant leur mode d'exécution. La liste complète, avec le détail des opérations prises en charge, se trouve dans la [vue d'ensemble des services](https://floci.io/floci/services/).

| Service | Catégorie | Exécution dans Floci | Socket Docker | Exemple de test | Niveau du guide |
| --- | --- | --- | --- | --- | --- |
| [S3](https://floci.io/floci/services/s3/) | Stockage objet | En processus | Non | Bucket, objets, versioning | Débutant |
| [DynamoDB (+ Streams)](https://floci.io/floci/services/dynamodb/) | Base NoSQL | En processus | Non | Table, items, requêtes | Débutant |
| [SQS](https://floci.io/floci/services/sqs/) | Files de messages | En processus | Non | Envoi/réception, DLQ | Débutant |
| [SSM Parameter Store](https://floci.io/floci/services/ssm/) | Configuration | En processus | Non | `put-parameter` / `get-parameter` | Débutant |
| Secrets Manager | Secrets | En processus | Non | Création et lecture d'un secret | Débutant |
| SNS | Publication/abonnement | En processus | Non | Topic avec abonnement SQS | Intermédiaire |
| [IAM](https://floci.io/floci/services/iam/) / [STS](https://floci.io/floci/services/sts/) | Identité | En processus | Non | Rôles, `get-caller-identity` | Intermédiaire |
| KMS | Chiffrement | En processus | Non | `encrypt` / `decrypt` | Intermédiaire |
| CloudWatch Logs / Metrics | Observabilité | En processus | Non | Groupes de journaux, métriques | Intermédiaire |
| EventBridge, Step Functions | Événements, orchestration | En processus | Non | Règle, machine à états | Intermédiaire |
| API Gateway (REST, v2) | API | En processus | Pour les intégrations Lambda | API vers Lambda | Intermédiaire |
| CloudFormation | IaC native AWS | En processus | Selon les ressources | Pile simple | Intermédiaire |
| Lambda | Serverless | Docker réel | Oui | Fonction Python | Intermédiaire |
| EC2 | Calcul | Docker réel (conteneur par instance) | Oui | Instance, UserData, IMDS | Intermédiaire |
| ECS | Conteneurs | Docker réel | Oui | Tâche nginx | Avancé |
| EKS | Kubernetes | Docker réel (k3s) | Oui | Cluster + `kubectl` | Avancé |
| RDS | Bases relationnelles | Docker réel (PostgreSQL, MySQL, MariaDB) | Oui | Instance PostgreSQL | Avancé |
| ElastiCache | Cache | Docker réel (Valkey) | Oui | Cluster Redis/Valkey | Avancé |
| Athena (+ Glue) | Analytique | Conteneur annexe DuckDB | Oui | Requête SQL sur S3 | Avancé |
| Bedrock Runtime, Textract, Transcribe | IA | Réponses factices (*stubs*) | Non | Vérifier le câblage d'un appel | Découverte |

:::caution[« Pris en charge » ne veut pas dire « identique »]
Certains services sont volontairement des **bouchons** : Bedrock Runtime renvoie des réponses factices, Textract et Transcribe simulent des traitements sans réellement analyser documents ou audio. Ils servent à tester le câblage de votre code, pas le résultat. Vérifiez toujours, service par service, ce que la documentation Floci annonce avant d'en dépendre.
:::

---

## Partie VI — Tests et CI/CD

### 17. Persistance des données

#### Deux philosophies

**Tests jetables.** Chaque démarrage de Floci repart d'un état vide ; tout disparaît à l'arrêt. C'est le comportement par défaut, idéal pour la CI : aucun test ne dépend des restes d'un test précédent, et les résultats sont reproductibles.

**Environnement de développement persistant.** Vous voulez retrouver vos buckets, tables et paramètres après un redémarrage du poste. Floci écrit alors son état sur disque.

**Objectif :** vérifier qu'un bucket survit à un redémarrage. **Prérequis :** Docker, terminal local configuré, ressources précédentes nettoyées et script d'attente du chapitre 5. [Modes de stockage](https://floci.io/floci/configuration/storage/).

#### Les modes de stockage

Le mode se choisit avec la variable `FLOCI_STORAGE_MODE` ; le répertoire de stockage avec `FLOCI_STORAGE_PERSISTENT_PATH` (par défaut `./data`, relatif au conteneur).

| Mode | Comportement documenté | Usage |
| --- | --- | --- |
| `memory` (image publiée par défaut) | État en RAM ; perdu à l'arrêt | Tests jetables |
| `persistent` | Écritures synchrones ; certains magasins utilisent un journal | Développement avec état conservé |
| `hybrid` | Lectures en RAM, vidage disque asynchrone, intervalle configurable selon le service | Développement local |
| `wal` | Journal d'écriture anticipée avec compaction | Scénarios avec beaucoup d'écritures |

Ces modes décrivent une stratégie d'écriture, **pas des niveaux garantis de durabilité**. Le vidage hybride peut perdre les dernières mutations lors d'un arrêt brutal ; les intervalles diffèrent selon les services. Le mode de l'image publiée est `memory`, même si certaines valeurs par défaut du code ou des pages de service mentionnent `hybrid`.

La persistance concerne l'état des services gérés par Floci (buckets, tables, files, paramètres…). Pour les services exécutés dans des conteneurs (bases RDS, par exemple), consultez la documentation du service concerné. Floci permet aussi de régler le mode de stockage service par service.

#### Mettre en place la persistance

Avec Docker, un **volume nommé** est la solution la plus simple : Docker gère l'emplacement et les permissions.

```bash
docker rm -f floci
docker run -d \
  --name floci \
  -p 127.0.0.1:4566:4566 \
  -v floci-data:/app/data \
  -e FLOCI_STORAGE_MODE=hybrid \
  -e FLOCI_STORAGE_PERSISTENT_PATH=/app/data \
  floci/floci:2.1.0
```

| Option | Rôle |
| --- | --- |
| `-v floci-data:/app/data` | Crée (si besoin) le volume Docker `floci-data` et le monte sur `/app/data` dans le conteneur. |
| `-e FLOCI_STORAGE_MODE=hybrid` | Active le mode hybride. |
| `-e FLOCI_STORAGE_PERSISTENT_PATH=/app/data` | Indique à Floci d'écrire son état dans le volume. |

Avec Docker Compose, la version avancée de la section 5 fait la même chose avec un dossier `./data` du projet.

#### Vérifier que la persistance fonctionne

```bash
aws s3 mb s3://persistance-test
sleep 6                          # marge pour ce test S3 ; ne garantit pas tous les flushs
docker restart floci
./scripts/wait-for-floci.sh
aws s3api head-bucket --bucket persistance-test
```

**Résultat attendu :** `head-bucket` réussit après le redémarrage. **Vérification et nettoyage :** `aws s3 rb s3://persistance-test`, puis `aws s3 ls`. Refaites éventuellement l'expérience dans un conteneur `memory` distinct : le bucket doit disparaître après son arrêt. Ce scénario ne teste ni coupure brutale ni récupération d'un moteur RDS.

#### Repartir de zéro

```bash
docker rm -f floci
docker volume rm floci-data
```

:::caution[État Floci et volumes de moteurs]
Le volume `/app/data` conserve l'état de l'émulateur ; RDS et d'autres moteurs peuvent utiliser des volumes Docker distincts. Supprimer le conteneur Floci ne supprime pas nécessairement ces volumes. La documentation distingue suppression en mode `memory` et conservation en modes persistants, contrôlable avec `FLOCI_STORAGE_PRUNE_VOLUMES_ON_DELETE`. Ne lancez pas de nettoyage Docker global sur une machine qui héberge d'autres projets.
:::

---

### 18. Tests automatisés

**Objectif :** vérifier l'aller-retour des documents, leur liste, une clé inconnue et la détection d'altération. **Prérequis :** fichiers Python des chapitres 9 et 10, Floci actif et endpoint local défini.

#### Tester une application AWS sans compte AWS

Les tests d'intégration vérifient que votre code fonctionne **réellement** avec les services dont il dépend. Contre le vrai AWS, ils sont lents, coûteux, nécessitent des secrets et laissent parfois des ressources orphelines. Contre Floci :

- chaque test crée ses propres ressources, isolées par un nom unique ;
- aucun identifiant réel n'est nécessaire ;
- l'exécution est rapide et gratuite ;
- les fixtures tentent de détruire les ressources à la fin, y compris après un échec de test ; un arrêt brutal du processus peut empêcher ce nettoyage ;
- le SDK fait de **vrais appels HTTP** : on teste aussi la sérialisation des requêtes, les codes d'erreur et la pagination, ce que ne permettent pas des simulations purement en mémoire.

#### Structure du projet

```text
lab-floci/
├── aws_clients.py        # section 9
├── docstore.py           # section 10
├── requirements.txt
├── pytest.ini
├── scripts/
│   └── wait-for-floci.sh # section 5
├── infra/                # sections 11 et 12
└── tests/
    ├── conftest.py
    └── test_docstore.py
```

```text title="requirements.txt"
boto3==1.43.107
pytest==9.1.1
```

Ces versions ont servi aux contrôles statiques de cet audit sous Python 3.12.14 ; les tests d'intégration contre Floci restent à exécuter. En projet réel, verrouillez aussi les dépendances transitives (fichier de contraintes, `pip-tools`, `uv lock`…) pour des exécutions reproductibles.

```ini title="pytest.ini"
[pytest]
pythonpath = .
testpaths = tests
```

#### Les fixtures

Une **fixture** pytest prépare ce dont un test a besoin, puis nettoie après lui (code placé après `yield`).

```python title="tests/conftest.py"
"""Fixtures pytest : clients AWS pointés vers Floci et ressources jetables."""
import os
import time
import uuid

import boto3
import pytest
from botocore.config import Config
from botocore.exceptions import (ClientError, ConnectionClosedError, EndpointConnectionError,
                                 ConnectTimeoutError, ReadTimeoutError)

import docstore

# Les tests visent TOUJOURS un endpoint local : même si AWS_ENDPOINT_URL est
# absent, on ne retombe jamais sur le vrai AWS.
ENDPOINT = os.environ.get("AWS_ENDPOINT_URL") or "http://localhost:4566"
REGION = os.environ.get("AWS_DEFAULT_REGION", "us-east-1")
COMPTE_ATTENDU = "000000000000"

# Refus avant tout appel HTTP, même avec une variable mal configurée.
if ENDPOINT not in {"http://localhost:4566", "http://127.0.0.1:4566", "http://floci:4566"}:
    raise RuntimeError("Endpoint de test non autorisé")


def _client(service: str):
    # Identifiants fictifs imposés : des clés réelles présentes dans
    # l'environnement ne seront jamais utilisées par les tests.
    return boto3.client(
        service,
        endpoint_url=ENDPOINT,
        region_name=REGION,
        aws_access_key_id="test",
        aws_secret_access_key="test", aws_session_token="",
        config=Config(connect_timeout=1, read_timeout=1,
                      retries={"mode": "standard", "total_max_attempts": 1},
                      s3={"addressing_style": "path"}),
    )


@pytest.fixture(scope="session", autouse=True)
def floci_pret():
    """Attend l'émulateur avec des appels courts et vérifie le compte."""
    sts = _client("sts")
    deadline = time.monotonic() + 60
    while time.monotonic() < deadline:
        try:
            compte = sts.get_caller_identity()["Account"]
            break
        except (EndpointConnectionError, ConnectionClosedError,
                ConnectTimeoutError, ReadTimeoutError):
            time.sleep(1)
    else:
        pytest.exit(f"Émulateur injoignable sur {ENDPOINT}", returncode=2)

    if compte != COMPTE_ATTENDU:
        pytest.exit(f"Compte inattendu ({compte}) : arrêt par sécurité", returncode=2)



@pytest.fixture
def s3():
    return _client("s3")


@pytest.fixture
def ddb():
    return _client("dynamodb")


@pytest.fixture
def ressources(s3, ddb):
    """Bucket et table uniques pour chaque test, détruits ensuite."""
    suffixe = uuid.uuid4().hex[:8]
    bucket, table = f"test-docs-{suffixe}", f"test-meta-{suffixe}"
    try:
        docstore.init_resources(bucket=bucket, table=table, s3=s3, ddb=ddb)
        yield bucket, table
    finally:
        # Le finally couvre aussi une initialisation partiellement échouée.
        try:
            try:
                for page in s3.get_paginator("list_objects_v2").paginate(Bucket=bucket):
                    for objet in page.get("Contents", []):
                        s3.delete_object(Bucket=bucket, Key=objet["Key"])
                s3.delete_bucket(Bucket=bucket)
            except ClientError as exc:
                if exc.response["Error"]["Code"] not in {"NoSuchBucket", "404"}:
                    raise
        finally:
            try:
                ddb.delete_table(TableName=table)
                ddb.get_waiter("table_not_exists").wait(TableName=table)
            except ClientError as exc:
                if exc.response["Error"]["Code"] != "ResourceNotFoundException":
                    raise

```

#### Les tests

```python title="tests/test_docstore.py"
"""Tests d'intégration de docstore contre Floci."""
import pytest

import docstore


def test_aller_retour_document(tmp_path, ressources, s3, ddb):
    bucket, table = ressources
    fichier = tmp_path / "rapport.txt"
    fichier.write_text("contenu de test", encoding="utf-8")

    doc_id = docstore.upload_document(fichier, bucket=bucket, table=table, s3=s3, ddb=ddb)
    nom, contenu = docstore.get_document(doc_id, bucket=bucket, table=table, s3=s3, ddb=ddb)

    assert nom == "rapport.txt"
    assert contenu == "contenu de test".encode("utf-8")


def test_liste_documents(tmp_path, ressources, s3, ddb):
    bucket, table = ressources
    for i in range(3):
        fichier = tmp_path / f"doc-{i}.txt"
        fichier.write_text(f"document {i}", encoding="utf-8")
        docstore.upload_document(fichier, bucket=bucket, table=table, s3=s3, ddb=ddb)

    documents = docstore.list_documents(table=table, ddb=ddb)

    assert len(documents) == 3
    assert {doc["nomFichier"] for doc in documents} == {"doc-0.txt", "doc-1.txt", "doc-2.txt"}


def test_document_inconnu(ressources, s3, ddb):
    bucket, table = ressources
    with pytest.raises(KeyError):
        docstore.get_document("inexistant", bucket=bucket, table=table, s3=s3, ddb=ddb)


def test_detection_alteration(tmp_path, ressources, s3, ddb):
    bucket, table = ressources
    fichier = tmp_path / "contrat.txt"
    fichier.write_text("version originale", encoding="utf-8")
    doc_id = docstore.upload_document(fichier, bucket=bucket, table=table, s3=s3, ddb=ddb)

    # Altération directe de l'objet dans S3, en contournant l'application
    item = ddb.get_item(TableName=table, Key={"documentId": {"S": doc_id}})["Item"]
    s3.put_object(Bucket=bucket, Key=item["cleS3"]["S"], Body=b"version modifiee")

    with pytest.raises(ValueError):
        docstore.get_document(doc_id, bucket=bucket, table=table, s3=s3, ddb=ddb)
```

#### Exécution

```bash
python -m pip install -r requirements.txt
pytest -v
```

**Résultat attendu après exécution contre Floci :** `4 passed`. **Les quatre tests d'intégration ne sont pas annoncés comme exécutés lors de cet audit.** Les noms uniques évitent de toucher les ressources Terraform ; ces fixtures désactivent le versioning des buckets en ne l'activant pas. Un test de bucket versionné demanderait le nettoyage des versions et delete markers. Vérifiez ensuite qu'aucune ressource de test ne subsiste :

```bash
aws s3 ls | grep test-docs- || echo "Aucun bucket de test restant"
aws dynamodb list-tables --query 'TableNames[?starts_with(@, `test-meta-`)]'
```

Le dernier test mérite une attention particulière : il vérifie qu'une **altération** du fichier stocké est détectée. C'est un test de sécurité, exécuté à chaque modification du code, sans aucun accès au cloud.

:::tip[Alternative : un Floci par session de tests avec Testcontainers]
Floci documente plusieurs intégrations Testcontainers qui démarrent automatiquement un conteneur Floci isolé pour vos tests ; consultez leur [état courant](https://floci.io/floci/testcontainers/). En Python : `python -m pip install testcontainers-floci`, puis `from floci import FlociContainer` et `with FlociContainer() as floci: …`, le conteneur fournissant son endpoint, sa région et ses identifiants (`get_endpoint()`, `get_region()`, `get_access_key()`, `get_secret_key()`). Vous évitez ainsi tout conflit de port ou d'état partagé entre projets.
:::

---

### 19. Intégration CI/CD

#### Le pipeline type

```text
git push
  -> démarrer Floci et attendre
  -> contrôler endpoint + compte
  -> init / validate / apply
  -> tests d'intégration
  -> tenter destroy même après erreur
  -> consulter les journaux
```

**Objectif :** appliquer l'IaC locale puis exécuter les tests à chaque modification. **Prérequis :** fichiers et dossiers des chapitres précédents, repository CI ; backend local recommandé. **Vérification :** lire les journaux d'attente, d'identité, d'apply, des tests et du nettoyage. **Les workflows sont contrôlés statiquement ; aucune exécution sur un runner CI n'a été réalisée ici.**

#### GitHub Actions (exemple complet)

```yaml title=".github/workflows/tests-aws-local.yml"
name: Tests AWS en local (Floci)

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

jobs:
  integration:
    runs-on: ubuntu-24.04
    timeout-minutes: 15

    # Floci tourne comme "service" à côté du job, sur le même hôte.
    services:
      floci:
        image: floci/floci:2.1.0
        ports:
          - "127.0.0.1:4566:4566"

    # Identifiants fictifs : aucun secret n'est nécessaire.
    env:
      AWS_ENDPOINT_URL: http://localhost:4566
      AWS_DEFAULT_REGION: us-east-1
      AWS_ACCESS_KEY_ID: test
      AWS_SECRET_ACCESS_KEY: test
      AWS_SESSION_TOKEN: ""
      AWS_IGNORE_CONFIGURED_ENDPOINT_URLS: "false"
      AWS_EC2_METADATA_DISABLED: "true"
      AWS_PAGER: ""
      TF_VAR_aws_endpoint: http://localhost:4566

    steps:
      - name: Récupérer le code
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1

      - name: Installer Python
        uses: actions/setup-python@5fda3b95a4ea91299a34e894583c3862153e4b97 # v7.0.0
        with:
          python-version: "3.12"

      - name: Installer Terraform
        uses: hashicorp/setup-terraform@dfe3c3f87815947d99a8997f908cb6525fc44e9e # v4.0.1
        with:
          terraform_version: "1.14.2"
          terraform_wrapper: false

      - name: Installer les dépendances Python
        run: python -m pip install -r requirements.txt

      - name: Vérifier les outils
        run: |
          aws --version
          terraform version
          python --version

      - name: Attendre Floci
        run: bash scripts/wait-for-floci.sh

      - name: Garde-fou, vérifier la cible
        run: |
          COMPTE=$(aws --endpoint-url "$AWS_ENDPOINT_URL" sts get-caller-identity --query Account --output text)
          echo "Compte ciblé : $COMPTE"
          test "$COMPTE" = "000000000000"

      - name: Déployer l'infrastructure
        id: infra
        working-directory: infra
        run: |
          terraform init -input=false
          terraform validate
          terraform apply -auto-approve -input=false

      - name: Vérifier l'infrastructure
        run: |
          aws s3api head-bucket --bucket docstore-documents
          aws dynamodb describe-table --table-name docstore-metadata --query 'Table.TableStatus'

      - name: Tests d'intégration
        run: pytest -v

      - name: Détruire l'infrastructure
        if: ${{ always() && steps.infra.outcome != 'skipped' }}
        working-directory: infra
        run: terraform destroy -auto-approve -input=false
```

Quelques points à noter :

- Aucun secret AWS réel n'est transmis et les credentials sont fictifs. Cela évite une authentification AWS valide ; **ce n'est pas une isolation réseau**. Une URL mal configurée peut encore entraîner une requête externe.
- Le service Floci n'a **pas** accès au socket Docker : ce pipeline couvre S3, DynamoDB, SQS, SSM… mais pas Lambda ni EC2. Pour ces services, utilisez un runner dédié et éphémère, en mesurant le risque (section 21).
- Le nettoyage est demandé même après un échec d'apply ou de test, si l'étape IaC a commencé. Une annulation brutale du runner ou un démon arrêté peut empêcher ce nettoyage : le runner éphémère et les journaux restent nécessaires.
- Si vous avez ajouté le backend distant optionnel (`backend.tf`, section 12), créez le bucket et la table de verrouillage avant `terraform init`, ou retirez ce fichier pour la CI.

:::tip[Versions CI vérifiées]
Les SHA ci-dessus ont été résolus depuis les tags officiels le 1er octobre 2026 : [checkout v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1), [setup-python v7.0.0](https://github.com/actions/setup-python/releases/tag/v7.0.0), [setup-terraform v4.0.1](https://github.com/hashicorp/setup-terraform/releases/tag/v4.0.1). Terraform 1.14.2 est la version du contrôle statique de cet audit, pas une affirmation de « dernière version ». Les runners autohébergés doivent satisfaire les prérequis de ces actions. Épinglez aussi les dépendances Python et les images pour une CI reproductible.
:::

#### Variante GitLab CI

Sur GitLab, le service est joignable par son alias (`floci`), pas par `localhost`. On positionne `FLOCI_HOSTNAME` pour que les URL renvoyées par Floci (comme les `QueueUrl` SQS) utilisent ce nom, et `TF_VAR_aws_endpoint` pour que Terraform vise le bon hôte.

```yaml title=".gitlab-ci.yml"
stages: [infra, test]

variables:
  AWS_ENDPOINT_URL: "http://floci:4566"
  AWS_DEFAULT_REGION: "us-east-1"
  AWS_ACCESS_KEY_ID: "test"
  AWS_SECRET_ACCESS_KEY: "test"
  FLOCI_HOSTNAME: "floci"
  AWS_SESSION_TOKEN: ""
  AWS_EC2_METADATA_DISABLED: "true"
  TF_VAR_aws_endpoint: "http://floci:4566"

.floci:
  services:
    - name: floci/floci:2.1.0
      alias: floci

infra:
  stage: infra
  extends: .floci
  image:
    name: hashicorp/terraform:1.14.2
    entrypoint: [""]
  variables:
    TF_VAR_aws_endpoint: "http://floci:4566"
  script:
    - cd infra
    - terraform init -input=false
    - terraform validate
    - |
      for i in $(seq 1 30); do
        if terraform plan -input=false -out=local.plan; then break; fi
        test "$i" -lt 30 || exit 1
        sleep 2
      done
    - terraform apply -input=false local.plan
  after_script:
    - cd "$CI_PROJECT_DIR/infra"
    - terraform destroy -auto-approve -input=false

integration:
  stage: test
  extends: .floci
  image: python:3.12-slim
  script:
    - python -m pip install -r requirements.txt
    - pytest -v
```

Chaque job démarre son propre Floci : **le job de tests ne teste pas l'infrastructure créée par le job IaC**. Ce pipeline sépare une validation du cycle IaC et les tests applicatifs avec ressources jetables. Pour tester ensemble l'IaC et l'application, placez les étapes dans un même job, comme dans l'exemple GitHub. `after_script` tente le nettoyage après échec, mais son propre échec ne fait pas nécessairement échouer le job GitLab ; contrôlez ses journaux. La fixture `floci_pret` de `conftest.py` attend la disponibilité de l'émulateur, ce qui évite d'installer `curl` dans l'image Python.

#### Variante Jenkins

```groovy title="Jenkinsfile"
pipeline {
  agent { label 'floci-lab' }
  options { disableConcurrentBuilds() }

  environment {
    AWS_ENDPOINT_URL      = 'http://localhost:4566'
    AWS_DEFAULT_REGION    = 'us-east-1'
    AWS_ACCESS_KEY_ID     = 'test'
    AWS_SECRET_ACCESS_KEY = 'test'
    AWS_SESSION_TOKEN     = ''
    TF_VAR_aws_endpoint    = 'http://localhost:4566'
  }

  stages {
    stage('Démarrer Floci') {
      steps {
        sh 'docker run -d --rm --name floci-${BUILD_NUMBER} -p 127.0.0.1:4566:4566 floci/floci:2.1.0'
        sh 'bash scripts/wait-for-floci.sh'
        sh 'test "$(aws --endpoint-url http://localhost:4566 sts get-caller-identity --query Account --output text)" = "000000000000"'
      }
    }
    stage('Infrastructure') {
      steps {
        dir('infra') {
          sh 'terraform init -input=false && terraform apply -auto-approve -input=false'
        }
      }
    }
    stage('Tests') {
      steps {
        sh 'python3 -m venv .venv && .venv/bin/python -m pip install -r requirements.txt && .venv/bin/python -m pytest -v'
      }
    }
  }

  post {
    always {
      script {
        try {
          dir('infra') { sh 'terraform destroy -auto-approve -input=false' }
        } finally {
          sh 'docker rm -f floci-${BUILD_NUMBER} || true'
        }
      }
    }
  }
}
```

Le label `floci-lab` doit désigner un agent provisionné avec Docker, AWS CLI v2, Terraform, Python et curl. `disableConcurrentBuilds()` sérialise ce pipeline ; il n'isole pas les autres jobs de l'agent. Sur un agent Jenkins partagé, deux jobs simultanés se disputeraient le port 4566 : limitez l'agent à un exécuteur, ou publiez un port dynamique et transmettez-le via `AWS_ENDPOINT_URL`.

---

## Partie VII — Sécurité et limites

### 20. Floci, DevOps et DevSecOps

#### Ce que Floci apporte à une démarche DevOps

| Usage | Bénéfice |
| --- | --- |
| Tester Terraform / OpenTofu | Valider `plan`, `apply` et `destroy` à chaque modification d'un module, sans compte |
| Tester du code AWS | Tests d'intégration rapides avec de vrais appels SDK |
| Valider des pipelines | Mettre au point un pipeline CI/CD sans consommer de ressources cloud |
| Réaliser des POC | Assembler S3, SQS, Lambda et DynamoDB en quelques minutes pour valider une idée |
| Tests d'intégration | Isoler chaque test avec ses propres ressources jetables |
| Développer sans identifiants de production | Les développeurs n'ont besoin d'aucune clé AWS pour travailler |
| Réduire l'exposition des secrets | Aucun secret cloud dans la CI de premier niveau : rien à voler, rien à faire fuiter |

#### Tester des contrôles d'accès plus tôt

Par défaut, Floci est permissif : n'importe quel appel est accepté. Pour rapprocher le comportement d'un environnement contrôlé, il propose des contrôles optionnels, par exemple :

- `FLOCI_SERVICES_IAM_ENFORCEMENT_ENABLED=true` : active l'évaluation des politiques des identités connues avant les handlers ; ce contrôle dépasse le seul `AssumeRole`, avec des contournements de compatibilité documentés (notamment les clés publiques `test/test`) ;
- `FLOCI_SERVICES_S3_ENFORCE_AUTH=true` : S3 applique les accès publics/privés et rejette les clés d'accès signées inconnues.

Activez ces contrôles dans un scénario distinct avec une identité créée dans l'IAM de Floci : un test utilisant `test/test` ne démontre pas l'évaluation de ses permissions. [Règles et limites du tag 2.1.0](https://github.com/floci-io/floci/blob/2.1.0/docs/services/iam.md). Mais l'évaluation IAM de Floci reste une émulation, avec des limites documentées : validez toujours vos politiques sur AWS (simulateur de politiques IAM, IAM Access Analyzer) avant la production.

#### Local ne veut pas dire sécurisé

:::caution[local ≠ sécurisé automatiquement]
Un émulateur local réduit certains risques (pas de facture, pas de secret cloud), mais en introduit d'autres :

- un port 4566 exposé sur le réseau donne à des tiers un accès à votre émulateur ;
- le socket Docker monté donne à Floci un contrôle équivalent à root sur votre machine ;
- des images non épinglées peuvent changer sans prévenir (chaîne d'approvisionnement) ;
- des identifiants réels présents dans l'environnement peuvent être transmis à des conteneurs ;
- un test qui passe en local peut masquer un défaut de permissions IAM qui n'apparaîtra que sur AWS.

La section suivante détaille chacun de ces points.
:::

---

### 21. Sécurité

#### Les identifiants fictifs

Floci n'a besoin d'aucune clé réelle : utilisez toujours des valeurs comme `test` / `test`. Ce choix a un avantage de sécurité concret : si une commande partait par erreur vers le vrai AWS, elle échouerait faute d'identifiants valides.

#### Les clés AWS réelles

:::danger[Gardez les clés réelles loin de l'émulateur]
- N'injectez aucune clé AWS réelle dans le processus Floci (`-e`, `env_file`, interpolation Compose ou lancement natif). Pour une fonction Lambda dont le rôle est inconnu, ces variables peuvent être transmises au conteneur de la fonction ; Docker ne transmet pas spontanément tout l'environnement du terminal.
- N'activez le montage de votre dossier `~/.aws` dans les conteneurs Lambda (option `FLOCI_SERVICES_LAMBDA_AWS_CONFIG_PATH`, prévue pour des tests hybrides local/cloud) que si vous en mesurez précisément les conséquences.
- Un terminal sans `AWS_ENDPOINT_URL` mais avec un profil réel par défaut enverra vos commandes vers AWS : préférez un profil nommé `floci` et vérifiez la cible avec `aws sts get-caller-identity`.
:::

#### Le socket Docker

Monter `/var/run/docker.sock` dans un conteneur revient à lui donner le contrôle du moteur Docker de l'hôte, donc un pouvoir équivalent à **root** : il peut lancer un conteneur privilégié, monter `/` de l'hôte, lire n'importe quel fichier. Certaines fonctionnalités de Floci s'appuient d'ailleurs sur des conteneurs privilégiés (par exemple l'attachement de volumes EBS sous forme de vrais périphériques blocs).

Mesures recommandées :

- ne montez le socket **que si** vous utilisez des services Docker-réels (Lambda, EC2, ECS, EKS, RDS…) ;
- réservez cette configuration à un poste de développement personnel ou à un runner CI **éphémère** (détruit après chaque job) ;
- n'exposez jamais le port 4566 au-delà de `127.0.0.1` lorsque le socket est monté ;
- alternatives documentées : modes `mock` EC2/ECS/EKS pour le contrôle API sans exécution ; exécuteur Kubernetes Lambda (droits RBAC et cluster requis) ; [configuration Podman rootless](https://floci.io/floci/configuration/docker/). Ces alternatives ont leurs propres contraintes et ne garantissent pas la compatibilité de tous les laboratoires.

#### L'exécution en root

Dans l'image 2.1.0, l'entrypoint adapte le groupe du socket puis baisse normalement les privilèges. `-u root` ou `user: root` ne suffit pas à empêcher cette étape. L'option documentée `FLOCI_RUN_AS_ROOT=true` maintient le processus en root si nécessaire ; elle ne doit pas être activée systématiquement. Aucun UID ne retire les pouvoirs donnés par un socket Docker accessible. [Entrypoint épinglé](https://github.com/floci-io/floci/blob/2.1.0/docker/entrypoint.sh).

#### Le réseau local

Plusieurs ports peuvent être publiés sur votre machine :

| Port(s) | Usage | Recommandation |
| --- | --- | --- |
| 4566 | API AWS émulée | Toujours `127.0.0.1:4566:4566` |
| 4500 | Console web (`http://localhost:4566/_floci/ui`), conteneur annexe démarré à la demande | `FLOCI_SERVICES_UI_BIND_ADDRESS=127.0.0.1` (sinon publié sur toutes les interfaces) |
| 6500–6599 | API Kubernetes des conteneurs k3s | Inspecter les bindings directement créés par Docker ; pare-feu et réseau de confiance |
| 2200–2299 | SSH des instances EC2 | Pare-feu de l'hôte, réseau de confiance uniquement |
| 30000–30999 | Ports applicatifs EC2 ouverts par les groupes de sécurité | Idem |
| 6379–6399, 7001–7099 | Proxys ElastiCache et RDS (si publiés) | Liaison sur `127.0.0.1` dans Compose |

Limiter le port principal ne limite pas les ports publiés par les conteneurs annexes. [Référence des ports](https://floci.io/floci/configuration/ports/).

Par défaut, les groupes de sécurité EC2 ne sont **pas** appliqués comme un pare-feu : à l'intérieur du réseau Docker, les conteneurs se joignent librement.

#### Les images Docker et la chaîne d'approvisionnement

- **Épinglez Floci** par version (`2.1.0`), et idéalement par empreinte `@sha256:…` que vous avez relevée vous-même.
- **Épinglez les images annexes.** Plusieurs images lancées par Floci utilisent par défaut des tags flottants (`rancher/k3s:latest` pour EKS, `redpandadata/redpanda:latest` pour MSK, `floci/floci-ui:latest` pour la console). Fixez-les avec les variables prévues (`FLOCI_SERVICES_EKS_DEFAULT_IMAGE`, `FLOCI_SERVICES_MSK_DEFAULT_IMAGE`, `FLOCI_SERVICES_UI_IMAGE`…).
- **Utilisez l'image officielle** `floci/floci` : l'ancienne image `hectorvent/floci` ne reçoit plus de mises à jour.
- **Analysez les images** avec un scanner de vulnérabilités (Trivy, Grype…) dans votre pipeline.
- **Mettez à jour délibérément** : un outil comme Renovate ou Dependabot propose les nouvelles versions par *pull request*, que vous relisez avant de fusionner. Consultez le `CHANGELOG.md` du projet.
- **Lisez les scripts d'installation** avant de les exécuter (`curl … | sh`).

#### Synthèse

| Risque | Mesure |
| --- | --- |
| Commandes envoyées au vrai AWS par erreur | Profil `floci`, garde-fou `aws sts get-caller-identity`, identifiants fictifs dans les tests |
| Fuite d'identifiants réels vers les conteneurs | Jamais de clés réelles dans l'environnement de Floci, rôles d'exécution créés dans Floci |
| Prise de contrôle de l'hôte via le socket Docker | Socket uniquement si nécessaire, environnements éphémères, alternatives sans socket |
| Accès à l'émulateur depuis le réseau | Publication sur `127.0.0.1`, console liée à `127.0.0.1` |
| Image modifiée ou vulnérable | Épinglage par version et empreinte, scan, mises à jour relues |
| Fausse confiance dans les tests | Validation finale sur un vrai compte AWS de test |

---

### 22. Limites de l'émulation

#### Une fidélité qui varie selon les API

Floci couvre un très grand nombre de services, mais la profondeur d'implémentation varie. Quelques exemples tirés de sa propre documentation :

- **Lambda** : la concurrence provisionnée, `InvokeWithResponseStream` et l'application des signatures de code ne sont pas implémentées ;
- **CloudWatch Logs** : les filtres d'abonnement sont enregistrés mais les événements ne sont pas transférés vers leur destination ; Logs Insights n'accepte qu'un sous-ensemble du langage de requête ;
- **CloudWatch Metrics** : les alarmes fondées sur des expressions mathématiques sont stockées mais pas évaluées ;
- **Application Auto Scaling** : les politiques sont enregistrées mais inertes ;
- **AWS FIS** : les expériences sont simulées au niveau du plan de contrôle, sans injection réelle de pannes ;
- **Bedrock Runtime, Textract, Transcribe** : réponses factices ;
- **EC2** : des conteneurs, pas des machines virtuelles (pas de noyau dédié) ; les groupes de sécurité ne filtrent pas le trafic par défaut ;
- **IAM** : évaluation optionnelle et partielle des politiques ;
- **Quotas** : valeurs statiques généreuses, sans rapport avec les limites réelles de votre compte.

#### Ce que ce laboratoire ne valide pas

- les performances, la latence et la variabilité d'un réseau réel ;
- la haute disponibilité multi-AZ et les pannes réelles ;
- la cohérence à terme (*eventual consistency*) de certains services distribués ;
- la facturation réelle (les coûts que Floci peut synthétiser sont indicatifs) ;
- les nouveautés AWS annoncées après la dernière version de l'émulateur.

#### Un projet jeune

Les releases montrent une évolution soutenue de Floci, mais un rythme observé ne garantit pas les dates des prochaines versions. C'est une force (corrections rapides, couverture croissante) et un point de vigilance : un comportement peut changer d'une version à l'autre. Épinglez vos versions, lisez le changelog avant de monter de version, et validez chaque service sur vos propres scénarios avant d'en faire une brique critique de votre CI.

#### Ce que Floci ne vous apprend pas à lui seul

Pour préparer une certification ou une architecture AWS, distinguez **apprendre une API** et **comprendre un service managé distribué**. Floci peut enregistrer ou émuler certaines API des domaines ci-dessous ; leur présence ne valide pas les propriétés d'AWS :

- évaluation IAM complexe, Organizations, SCP et gouvernance multi-comptes réelle ;
- conception VPC, routage Transit Gateway, connectivité Direct Connect et chemins réseau effectifs ;
- latence, disponibilité Multi-AZ, reprise après sinistre et résilience aux pannes ;
- quotas propres au compte, coûts et facturation ;
- exploitation de services managés à grande échelle.

Les encadrés « Concept AWS à retenir » donnent des repères utiles à une préparation AWS (notamment SAA-C03 ou DVA-C02), sans garantir la couverture d'un examen. Vérifiez le [guide d'examen actuel](https://aws.amazon.com/certification/) et complétez ces exercices par de la pratique sur un compte AWS de test.

#### Quand utiliser Floci, quand utiliser AWS ?

| Situation | Choix conseillé |
| --- | --- |
| Apprendre les gestes d'une API, compléter une préparation AWS | Floci, puis pratique AWS |
| Développement quotidien, boucle code/test rapide | Floci |
| Tests d'intégration en CI à chaque commit | Floci |
| Mise au point d'un module Terraform | Floci, puis validation sur AWS |
| Politiques IAM, permissions fines, SCP | AWS (compte de test) |
| Performance, montée en charge, latence | AWS |
| Réseau (VPC, peering, endpoints privés), haute disponibilité | AWS |
| Validation finale avant mise en production | AWS, toujours |

---

### 23. Floci ou AWS réel ?

| Critère | Floci | AWS réel |
| --- | --- | --- |
| Coût d'apprentissage | Gratuit, local | Facturation possible (offre gratuite limitée) |
| Compte et identifiants | Aucun compte cloud ; credentials fictifs pour les outils | Compte AWS et identifiants requis |
| Connexion Internet | Non requise une fois les images téléchargées | Requise |
| Création des ressources | Rapide ; téléchargement et démarrage de conteneurs parfois nécessaires | De quelques secondes à plusieurs minutes |
| Réinitialisation | Simple pour l'état en mémoire ; volumes annexes à gérer | Suppression ressource par ressource |
| Fidélité des API | Variable selon l'opération et la version ; à mesurer sur ses scénarios | Référence |
| IAM complet | Émulation partielle, optionnelle | Complet |
| Latence réelle | Non | Oui |
| Quotas AWS | Non représentatifs | Réels |
| Réseau et haute disponibilité | Modélisés, pas reproduits | Réels |
| Sécurité et conformité | Dépend de votre poste | Services et certifications AWS |
| Tests automatisés | Excellent usage | Validation finale |
| Production | Non | Oui |

---

### 24. Floci, LocalStack et autres alternatives

#### Comparaison datée et neutre

**Vérifié le 1er octobre 2026.** LocalStack a annoncé en décembre 2025, puis actualisé en mars 2026, une distribution AWS unifiée nécessitant un compte et un jeton. Les anciennes images Community épinglées restent un cas distinct. L'annonce indique l'arrêt des mises à jour régulières de cette ancienne distribution ; ne décrivez pas tout le produit LocalStack comme abandonné. [Annonce officielle](https://blog.localstack.cloud/the-road-ahead-for-localstack/).

| Critère | Floci | LocalStack pour AWS actuel |
| --- | --- | --- |
| Licence / distribution | Projet MIT, image accessible sans compte Floci | Distribution soumise aux conditions actuelles ; code historique Community sous Apache 2.0 |
| Authentification produit | Aucun jeton d'abonnement | Compte et jeton requis |
| Offre gratuite | Projet gratuit | Offre Hobby pour un usage non commercial ; offres et programmes spécifiques à consulter |
| CI | Pas de jeton Floci | Jeton requis ; CI selon les conditions de l'offre et la politique Fair Use |
| Couverture | Vérifier la matrice et les opérations utiles | Vérifier les services et fonctionnalités inclus dans l'offre choisie |
| Choix | Valider ses scénarios, contraintes Docker et besoins de support | Même démarche, en ajoutant les conditions d'usage et l'authentification |

Sources complémentaires : [installation et authentification](https://docs.localstack.cloud/aws/getting-started/installation/), [offres et conditions CI](https://www.localstack.cloud/pricing), [dépôt et licence historiques](https://github.com/localstack/localstack). Les informations de prix et d'éligibilité sont volatiles ; consultez ces sources au moment de choisir. L'état d'archivage du dépôt n'est pas déduit d'une annonce : vérifiez directement sa bannière et son README.

Floci reprend plusieurs conventions utiles à une migration : port 4566, endpoint de santé `/_localstack/health`, scripts d'initialisation et variantes `-compat` avec AWS CLI/boto3. **La compatibilité d'un projet se teste** : ce n'est pas une promesse de remplacement universel. [Migration documentée](https://floci.io/floci/getting-started/migrate-from-localstack/).

#### Les autres alternatives

| Outil | Nature | Quand le choisir |
| --- | --- | --- |
| **Moto** | Bibliothèque Python qui simule les API AWS en mémoire (avec un mode serveur) | Tests unitaires Python rapides, sans conteneur |
| **DynamoDB Local** | Version locale officielle de DynamoDB, publiée par AWS | Projet qui n'utilise que DynamoDB |
| **AWS SAM CLI** | Outil officiel AWS (`sam local invoke`, `sam local start-api`) | Développement de fonctions Lambda et d'API serverless |
| **Testcontainers** | Bibliothèque qui démarre des conteneurs depuis les tests (dont Floci ou LocalStack) | Isoler un émulateur par suite de tests |

Ces outils ne s'excluent pas : un projet peut combiner Moto pour les tests unitaires, Floci pour les tests d'intégration et un compte AWS de test pour la validation finale.

---

### 25. Dépannage

| Symptôme | Cause probable | Vérification | Correction |
| --- | --- | --- | --- |
| `Could not connect to the endpoint URL` / `Connection refused` | Conteneur arrêté ou port non publié | `docker ps --filter name=floci` | `docker start floci` ; vérifier `-p 127.0.0.1:4566:4566` |
| `Unable to locate credentials` | Aucun identifiant défini | `printf '%s\n' "$AWS_ENDPOINT_URL"` | Exporter `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` (valeurs fictives) |
| `InvalidClientTokenId` ou un compte inattendu s'affiche | Endpoint ou identité différents de ceux du laboratoire ; AWS réel est une possibilité | `aws sts get-caller-identity` ; `printf '%s\n' "$AWS_ENDPOINT_URL"` | Vérifier les priorités, utiliser `--profile floci --endpoint-url http://localhost:4566` |
| Terraform contacte AWS / erreur d'identifiants | Service absent du bloc `endpoints` | Relire `provider.tf` | Ajouter le service dans `endpoints { … }` |
| `port is already allocated` sur 4566 | Un autre émulateur (ex. LocalStack) tourne déjà | `docker ps --format '{{.Names}} {{.Ports}}'` | Arrêter l'autre conteneur |
| Instance EC2 qui ne passe pas en `running` | Socket Docker non monté | `docker inspect floci --format '{{json .Mounts}}'` | Monter `/var/run/docker.sock` (section 13) |
| `permission denied` sur `/var/run/docker.sock` dans les journaux | L'utilisateur du conteneur n'a pas accès au socket | `docker logs floci` | Vérifier l'entrypoint et le socket ; `FLOCI_RUN_AS_ROOT=true` seulement si nécessaire (chapitres 5 et 21) |
| Premier appel Lambda en *timeout* | Téléchargement de l'image runtime | `docker images` | `--cli-read-timeout 300`, ou télécharger l'image au préalable |
| Lambda : `connect ECONNREFUSED <ip>:12000` | Le conteneur de la fonction ne joint pas l'API Runtime de Floci (réseaux atypiques, Podman rootless) | Journaux de Floci et du conteneur Lambda | Définir `FLOCI_SERVICES_LAMBDA_DOCKER_HOST_OVERRIDE` |
| Lambda : `module introuvable` | Fichier non placé à la racine du zip ou handler erroné | `unzip -l function.zip` | Re-zipper à la racine ; vérifier `--handler fichier.fonction` |
| URL SQS en `localhost` inutilisable depuis un autre conteneur | `FLOCI_HOSTNAME` non défini | `aws sqs get-queue-url …` | `FLOCI_HOSTNAME=<nom du service Compose>` |
| Erreurs DNS ou de bucket avec un SDK | Adressage S3 *virtual-hosted* | Message d'erreur du SDK | Forcer le *path-style* (section 9) |
| Données perdues après redémarrage | Mode `memory` (défaut) | `docker inspect floci --format '{{json .Config.Env}}'` | `FLOCI_STORAGE_MODE=hybrid` + volume (section 17) |
| Une opération répond « non implémentée » ou 404 | API non couverte par cette version | Vue d'ensemble des services Floci | Mettre à jour Floci (version épinglée) ou adapter le scénario |
| Image incompatible sur un ARM64 ancien (ex. Raspberry Pi 4) | Processeur sans les extensions attendues | `uname -m` | Utiliser le tag `x.y.z-baseline` |

---

### 26. Commandes de diagnostic

```bash
docker ps --filter name=floci
docker logs -f floci
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4566/_localstack/health
printf 'Endpoint : %s\nRégion : %s\nProfil : %s\n' \
  "${AWS_ENDPOINT_URL:-absent}" "${AWS_DEFAULT_REGION:-absente}" "${AWS_PROFILE:-non défini}"
# Ne jamais afficher AWS_SECRET_ACCESS_KEY ni AWS_SESSION_TOKEN dans les journaux.
aws sts get-caller-identity
aws s3 ls
aws dynamodb list-tables
terraform state list
docker ps --filter "name=floci-"
docker stats --no-stream floci
```

| Commande | Ce qu'elle permet de vérifier |
| --- | --- |
| `docker ps --filter name=floci` | Le conteneur Floci existe, tourne, et publie le bon port. |
| `docker logs -f floci` | Le démarrage s'est bien passé ; les erreurs de Floci en direct (Ctrl+C pour quitter). |
| `curl … /_localstack/health` | L'API répond (code `200`). |
| `printf …` | La cible, la région et le profil ; les secrets ne sont pas affichés. |
| `aws sts get-caller-identity` | Compte attendu `000000000000` pour ce guide ; tout écart impose une vérification, sans conclure seulement à partir du numéro. |
| `aws s3 ls` | S3 répond et liste les buckets existants. |
| `aws dynamodb list-tables` | DynamoDB répond et liste les tables. |
| `terraform state list` | Les ressources que Terraform pense gérer (à comparer avec ce qui existe dans Floci). |
| `docker ps --filter "name=floci-"` | Les conteneurs annexes lancés par Floci (fonctions Lambda, console…). |
| `docker stats --no-stream floci` | La consommation CPU et mémoire de Floci. |

Inspectez d'abord les messages du conteneur et la cible effective. Si vous utilisez une CLI Floci, consultez l'aide de sa version pour les fonctions de diagnostic disponibles.

---

### 27. Bonnes pratiques

#### À faire

- **Épingler les versions** : Floci (`2.1.0`, voire `@sha256:…`), provider Terraform, dépendances Python, actions CI, images annexes.
- **Versionner** le fichier Docker Compose, les fichiers Terraform et le fichier `.terraform.lock.hcl`.
- **Utiliser des identifiants fictifs** et un profil AWS dédié (`floci`).
- **Vérifier la cible** avec `aws sts get-caller-identity` en début de session et dans chaque pipeline.
- **Automatiser la création et la destruction** des ressources (fixtures pytest, `terraform destroy` en `if: always()`).
- **Utiliser des environnements jetables en CI** (mode `memory`, un Floci par job).
- **Isoler les tests** avec des noms de ressources uniques.
- **Publier les ports sur `127.0.0.1`** uniquement.
- **Lire le changelog** avant chaque montée de version de Floci.
- **Tester ensuite sur AWS réel**, sur un compte de test isolé, avant toute mise en production.

#### À éviter

- Utiliser `latest` dans un environnement censé être reproductible.
- Utiliser de vraies clés AWS sans nécessité, ou lancer Floci depuis un environnement qui en contient.
- Considérer l'émulateur comme identique à AWS.
- Utiliser un comportement observé sur Floci comme preuve absolue du comportement d'AWS.
- Monter le socket Docker sans en comprendre le risque, ou sur une machine partagée.
- Exposer le port 4566 (ou la console) sur le réseau.
- Versionner le dossier de données de Floci ou les fichiers d'état Terraform.
- Coder en dur l'endpoint ou les identifiants dans le code applicatif.

---

### 28. Aide-mémoire

```bash
# Démarrage
docker run -d --name floci -p 127.0.0.1:4566:4566 floci/floci:2.1.0
docker compose up -d && ./scripts/wait-for-floci.sh

# Environnement AWS
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
aws sts get-caller-identity            # doit afficher 000000000000

# S3
aws s3 mb s3://mon-bucket
aws s3 cp fichier.txt s3://mon-bucket/
aws s3 ls s3://mon-bucket/ --recursive
aws s3 rb s3://mon-bucket --force

# DynamoDB
aws dynamodb list-tables
aws dynamodb scan --table-name ma-table --select COUNT

# Lambda
aws lambda list-functions --query 'Functions[].FunctionName'
aws lambda invoke --function-name ma-fonction \
  --cli-binary-format raw-in-base64-out --payload '{}' sortie.json

# EC2
aws ec2 describe-instances \
  --query 'Reservations[].Instances[].[InstanceId,State.Name]' --output table

# Terraform / OpenTofu
terraform init && terraform plan && terraform apply
terraform state list
terraform destroy

# Diagnostic et nettoyage
docker logs -f floci
docker ps --filter "name=floci-"
docker rm -f floci
docker volume rm floci-data            # si vous utilisez la persistance
```

---

### 29. Conclusion et ressources officielles

Floci permet de **raccourcir la boucle d'apprentissage et de développement AWS** en apportant un environnement local compatible avec les outils habituels (AWS CLI, SDK, Terraform, OpenTofu et Docker). Vous pouvez créer, casser et recréer des architectures complètes en quelques secondes, sans compte, sans facture et sans secret cloud, puis automatiser ces vérifications dans vos pipelines.

**Développer localement → automatiser → tester → valider ensuite sur AWS réel.** Gardez à l'esprit qu'une émulation ne remplace pas cette validation finale : IAM, quotas, réseau, performances et fonctionnalités avancées ne se vérifient vraiment que dans le cloud.

La meilleure façon de progresser maintenant est de pratiquer : reprenez chaque laboratoire, modifiez-le, cassez-le volontairement, et observez ce qui se passe. Puis ajoutez un service que ce guide n'a pas couvert (SNS, Step Functions, API Gateway…) en suivant la même démarche : comprendre le service sur AWS, lire ce que Floci en émule, tester, vérifier.

#### Ressources officielles

**Floci**

- Présentation AWS et démarrage rapide : [floci.io/aws](https://floci.io/aws/#quickstart)
- Services pris en charge : [floci.io/aws/#services](https://floci.io/aws/#services) et [vue d'ensemble détaillée](https://floci.io/floci/services/)
- Documentation : [floci.io/floci](https://floci.io/floci/)
- Dépôt GitHub : [github.com/floci-io/floci](https://github.com/floci-io/floci)
- Versions publiées : [github.com/floci-io/floci/releases](https://github.com/floci-io/floci/releases)
- Terraform avec Floci : [floci.io/floci/getting-started/terraform](https://floci.io/floci/getting-started/terraform/)
- Docker Compose : [floci.io/floci/configuration/docker-compose](https://floci.io/floci/configuration/docker-compose/)
- Modes de stockage : [floci.io/floci/configuration/storage](https://floci.io/floci/configuration/storage/)
- Migration depuis LocalStack : [floci.io/floci/getting-started/migrate-from-localstack](https://floci.io/floci/getting-started/migrate-from-localstack/)
- Testcontainers : [floci.io/floci/testcontainers](https://floci.io/floci/testcontainers/)

**Écosystème**

- Annonce de LocalStack sur l'évolution de sa distribution : [blog.localstack.cloud/the-road-ahead-for-localstack](https://blog.localstack.cloud/the-road-ahead-for-localstack/)
- Documentation de l'AWS CLI : [docs.aws.amazon.com/cli](https://docs.aws.amazon.com/cli/)
- Provider Terraform AWS : [registry.terraform.io/providers/hashicorp/aws](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- Documentation boto3 : [boto3.amazonaws.com](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)

#### Traçabilité de la vérification — 1er octobre 2026

| Domaine | Référence prioritaire | Ce qui a été contrôlé |
| --- | --- | --- |
| Version Floci | [Release 2.1.0](https://github.com/floci-io/floci/releases/tag/2.1.0) | Tag, date, statut de dernière release à la date de l'audit |
| Support API | [Matrice canonique](https://floci.io/floci/services/) et [docs au tag 2.1.0](https://github.com/floci-io/floci/tree/2.1.0/docs/services) | Services utilisés, opérations, différences entre version stable et docs courantes |
| CLI / SDK | [Setup Floci](https://floci.io/floci/getting-started/aws-setup/), [endpoints AWS](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-endpoints.html) | Clés fictives, profil, priorité des endpoints, région |
| Docker | [Compose](https://floci.io/floci/configuration/docker-compose/), [entrypoint 2.1.0](https://github.com/floci-io/floci/blob/2.1.0/docker/entrypoint.sh) | Publication locale, socket, baisse de privilèges, persistance |
| IaC | [Provider 6.67.0](https://github.com/hashicorp/terraform-provider-aws/releases/tag/v6.67.0), [Terraform S3](https://developer.hashicorp.com/terraform/language/backend/s3), [OpenTofu S3](https://opentofu.org/docs/language/settings/backends/s3/) | Endpoints séparés provider/backend, options skip, verrouillage et migration |
| IAM / compute | [IAM](https://github.com/floci-io/floci/blob/2.1.0/docs/services/iam.md), [EC2](https://github.com/floci-io/floci/blob/2.1.0/docs/services/ec2.md), [Lambda](https://github.com/floci-io/floci/blob/2.1.0/docs/services/lambda.md), [ECS](https://github.com/floci-io/floci/blob/2.1.0/docs/services/ecs.md), [EKS](https://github.com/floci-io/floci/blob/2.1.0/docs/services/eks.md) | Exécution en conteneur, limites, credentials, labels de découverte |
| LocalStack | [Annonce](https://blog.localstack.cloud/the-road-ahead-for-localstack/), [offres](https://www.localstack.cloud/pricing) | Distribution actuelle, jeton, usage gratuit non commercial et conditions CI |
| Starlight | [Contenu Markdown](https://starlight.astro.build/guides/authoring-content/), [frontmatter](https://starlight.astro.build/reference/frontmatter/) | Hiérarchie, callouts, métadonnées, blocs et liens internes |

**Validation locale de cet audit :** compilation réussie dans un projet minimal Astro **7.3.5** / Starlight **0.42.4** ; 82 blocs Bash contrôlés avec `bash -n`, 7 blocs Python analysés sous **Python 3.12.14**, 4 blocs YAML et 2 blocs JSON parsés ; 10 extraits HCL formatés ; projets Terraform de base et multi-services validés avec **Terraform 1.14.2** et le provider AWS **6.67.0**. Le backend a été analysé avec `init -backend=false` puis `validate`, sans connexion au stockage. 54 noms d’opérations AWS ont été comparés aux modèles **boto3/botocore 1.43.107** ; ce contrôle ne prouve ni le support Floci ni le comportement de leurs options. Quatre contrôles sans réseau vérifient les refus d’endpoint absent/externe, le remplacement des credentials hérités et le refus d’un compte inattendu. Les laboratoires Floci, OpenTofu, le verrou S3 concurrent et les trois plateformes CI restent non exécutés. Le fichier Markdown est autonome ; sa compilation dans un projet Starlight minimal ne vérifie pas les extensions ou réglages propres au portfolio.
