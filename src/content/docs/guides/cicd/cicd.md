---
title: "CI/CD DevSecOps : Guide pratique GitLab et Azure DevOps"
description: "Comprendre, construire, sécuriser et exploiter un pipeline CI/CD, avec ITIL et CALM/CALMS."
created: "2026-10-22"
# updated: "2026-02-08"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"

---
<a id="guide-cicd-devsecops--gitlab-et-azure-devops"></a>

Ce guide conduit d’un dépôt Git à une image testée, puis à sa promotion contrôlée en préproduction. Choisir **GitLab CI/CD** ou **Azure DevOps** : les deux parcours utilisent la même application et les mêmes règles de qualité. **ITIL 5** fournit le cadre de gestion des produits et services ; les rappels utiles d’**ITIL 4** rendent ses notions plus faciles à aborder. **CALMS** guide la collaboration, l’automatisation et l’amélioration du travail quotidien.

**Mise à jour du 22 octobre 2026 :** **ITIL 5 reste le cadre du document**. La lecture du portfolio sur ITIL 4 et CALMS enrichit les explications et les exemples. Les versions d’outils et les 40 tests techniques restent datés du **20 octobre 2026** ; ils n’ont pas été réexécutés pour cette révision pédagogique.

<a id="utiliser-ce-document-unique"></a>

## Comment utiliser ce document

Tout est intégré dans ce fichier : explications, étapes de fonctionnement, commandes, configurations complètes, exercices et bilan de validation. Pour pratiquer, créer les fichiers de l’[annexe du code](#code-integral) dans un dépôt de laboratoire. Le nom indiqué au-dessus de chaque bloc donne son chemin.

| Votre objectif | Commencer ici | Vérifier votre progression |
|---|---|---|
| Découvrir la chaîne | [Fondamentaux](#fondamentaux), puis [laboratoire](#laboratoire) | Expliquer commit, job, image, rapport et environnement |
| Construire un pipeline | [GitLab](#gitlab) ou [Azure DevOps](#azure) | Lancer un premier test et retrouver sa preuve |
| Sécuriser la promotion | [Contrôles et préproduction](#controles), puis [ITIL 5 et CALMS](#itil-calm) | Refuser une candidate incomplète et autoriser le même digest |
| Résoudre une panne | [Fiches de dépannage](#72-fiches-de-dépannage) | Corriger la cause et réussir le contrôle final |
| Approfondir ou adapter | [Sources et versions](#sources), puis [code complet](#code-integral) | Refaire les contrôles dans votre environnement |

> **Cadre du laboratoire :** les commandes Bash s’exécutent dans Linux. Le démon Docker donne des droits importants sur sa VM ; réserver l’exécution aux révisions approuvées et isoler les contributions non fiables. Le [bilan technique](#validation-livrable) précise ce qui a réellement été testé.

<a id="sommaire"></a>

## Accéder aux chapitres
<details>
<summary><strong>Sommaire complet — chapitres</strong></summary>

1. [Fondamentaux et progression](#fondamentaux)
2. [ITIL 5, apports d’ITIL 4 et CALMS](#itil-calm)
3. [Laboratoire, moteur et application](#laboratoire)
4. [Parcours GitLab CI/CD](#gitlab)
5. [Parcours Azure DevOps](#azure)
6. [Contrôles, preuves et promotion](#controles)
7. [Exploitation, dépannage et exercices](#exploitation)
8. [Sources, versions et limites](#sources)
9. [Annexe : code intégral et templates](#code-integral)
10. [Bilan des essais techniques du 20 octobre](#validation-livrable)
<!-- 11. [Intégration dans Starlight et révision du 22 octobre](#integration-starlight) -->

</details>
<a id="fondamentaux"></a>

## 1. Comprendre la chaîne et préparer son apprentissage

> Repère de lecture : **D** = découverte, **P** = pratique, **A** = administration. Les exemples Bash utilisent cet interpréteur de commandes dans une machine virtuelle (VM) Linux Debian ou Ubuntu, depuis la racine du dépôt. Windows permet de lire le guide et d'éditer les fichiers ; exécuter les exemples Bash dans Linux, car PowerShell utilise une autre syntaxe.

### 1.1. Public, finalité et compétences observables

Ce parcours apprend à maîtriser la chaîne CI/CD : intégration continue, puis livraison ou déploiement continus. Il s'adresse aux développeurs, administrateurs, spécialistes qualité, responsables techniques et personnes en formation, dont les équipes DevOps (développement et exploitation), DevSecOps (sécurité intégrée) et SRE (Site Reliability Engineering, ingénierie de fiabilité).

L'autonomie attendue consiste à installer et expliquer la chaîne, retrouver ses preuves, diagnostiquer un échec et adapter ses contrôles sans les affaiblir. Le pipeline est sa procédure automatisée, organisée en tâches ou jobs. Un runner GitLab ou un agent Azure exécute ces tâches. Le commit identifie une révision Git ; le digest, le contenu d'un livrable.

Une version est qualifiée quand les contrôles requis ont porté sur les bons éléments et produit des résultats exploitables. Le statut vert de l'interface ne suffit pas : il faut pouvoir relier la décision aux preuves. L'approbation humaine porte ensuite sur cette version précise et sa cible de déploiement.

| Niveau | À savoir réaliser sans aide | Preuve d'acquisition |
|---|---|---|
| D : comprendre | Dessiner dépôt → exécution → image → test → décision ; distinguer CI, livraison et déploiement continus | Schéma expliqué à un collègue ; vocabulaire du §1.10 maîtrisé |
| P : construire | Modifier un test, exécuter un pipeline, retrouver son rapport et son image | Commit, identifiant du pipeline, rapport et digest concordants |
| P : qualifier | Reproduire un échec volontaire et expliquer pourquoi la promotion s'arrête | Rapport d'échec conservé et absence de promotion |
| A : administrer | Enregistrer un runner ou un agent, limiter son périmètre et diagnostiquer un job en attente | Premier job, compte de service identifié, permissions vérifiées |
| A : gérer les environnements | Déployer une candidate identique en test et préproduction, puis revenir à la version précédente | Digests avant/après, tests de santé, décision et résultat du retour arrière |
| A : améliorer | Mesurer une attente, proposer une modification et vérifier son effet | Comparaison de distributions avant/après et absence de dégradation de fiabilité |

#### Itinéraires conseillés

- **Découverte** : lire ce chapitre, réaliser les rappels, puis choisir GitLab ou Azure. Terminer par les exercices 1 à 4 du chapitre d'exploitation.
- **Pratique** : étudier l'architecture et la qualification, renseigner les paramètres, puis exécuter le parcours complet et démontrer un blocage volontaire.
- **Administration / sécurité** : étudier les périmètres de confiance, les permissions et les contrôles configurés hors des fichiers de pipeline. Réaliser les procédures d'exploitation, les exercices de panne et les promotions.

Chaque plateforme propose un parcours autonome avec la même application et les mêmes scripts de contrôle. Choisir l'une des deux suffit ; leur installation simultanée n'est pas un prérequis.

### 1.2. Pourquoi l'intégration continue est utile

L'intégration continue réduit le délai entre une modification et la découverte d'un défaut. Sans vérification commune régulière, les incompatibilités s'accumulent et leur origine devient difficile à retrouver. Les installations manuelles ajoutent un écart possible entre la procédure écrite et les opérations réellement effectuées.

La méthode consiste à intégrer fréquemment de petits changements et à exécuter des vérifications reproductibles. L'automatisation couvre ensuite la construction des livrables, leur livraison et les contrôles de sécurité. À chaque étape, elle doit fournir un retour rapide, une preuve conservée et une opération répétable.

| Notion | Définition dans ce guide | Exemple |
|---|---|---|
| Intégration continue, CI | Déclencher automatiquement des contrôles pour chaque changement proposé ou intégré | Tests et analyse statique sur une demande de fusion : Merge Request (MR) GitLab ou Pull Request (PR) Azure |
| Livraison continue, continuous delivery | Préparer une candidate qualifiée, déployable sur décision explicite | Image identifiée par digest, prête pour la préproduction après approbation |
| Déploiement continu, continuous deployment | Déployer automatiquement une candidate satisfaisant la politique dans la cible définie | Service à faible risque dont le passage en production n'attend pas de décision manuelle |

Ce guide réalise une **livraison continue avec promotion contrôlée en préproduction**. La promotion autorise le passage d'une candidate identifiée vers un environnement de confiance supérieur. La production et le déploiement continu restent à concevoir selon le service. Préciser le sens de « CD » évite de confondre livraison prête à déployer et déploiement automatique.

Le pipeline forme un graphe de dépendances : chaque job reçoit des entrées et produit des sorties. Une dépendance impose qu'un résultat ou une validation soit disponible avant de poursuivre ; les jobs indépendants peuvent s'exécuter en parallèle. Les droits définissent qui peut modifier cette procédure et accéder aux ressources qu'elle utilise.

### 1.3. L'analogie de la chaîne de fabrication

La chaîne ressemble à un atelier qui fabrique un objet à partir d'un plan identifié. Des postes contrôlent la matière, la fabrication et le comportement avant l'expédition. En cas de défaut, la fiche de lot relie le produit au plan et aux contrôles pour retrouver l'origine du problème.

Dans la chaîne logicielle, une image OCI (Open Container Initiative, format d'image de conteneur) représente le produit emballé. La SBOM (Software Bill of Materials) en inventorie les composants. Le tableau précise ce que cette analogie aide à comprendre et ses limites.

| Atelier | Composant CI/CD | Limite de l'analogie |
|---|---|---|
| Plan de fabrication numéroté | Commit Git | Le commit identifie le code ; il n'identifie pas à lui seul tous les outils ou bases de vulnérabilités |
| Ordre de fabrication | Exécution du pipeline | Un nouveau lancement peut produire des résultats différents si les entrées externes ont changé |
| Poste de travail | Job exécuté par un runner ou agent | Le job est du code ; un contributeur qui le modifie peut tenter d'utiliser ses accès |
| Machine de l'atelier | VM et moteur Docker | Un conteneur partage le noyau de son hôte ; l'isolation doit être évaluée |
| Produit emballé | Image OCI identifiée par digest | Un tag lisible est une étiquette qui peut changer de cible |
| Entrepôt | Registre OCI | Ses droits d'écriture et de suppression influencent la conservation des versions |
| Banc d'essai | Environnement d'intégration / test | Il faut vérifier que les essais portent sur le produit attendu |
| Fiche de lot | Rapports, SBOM et manifeste de candidate | Des preuves modifiables par une personne non autorisée ne constituent pas une chaîne de confiance |
| Autorisation d'expédition | Décision de promotion | Le niveau de validation dépend du risque, des données et du service |

La sécurité concerne tous les postes : dépôt, calcul, dépendances, preuves et déploiement. Réserver l'analyse de sécurité à la fin laisserait sans contrôle les accès et les transformations qui précèdent.

### 1.4. Rappels indispensables et diagnostic des prérequis

Vérifier ces prérequis avant d'installer les composants. Les commandes ci-dessous lisent l'état du système ; une erreur demande ensuite une correction adaptée, qu'elles n'appliquent pas automatiquement.

#### D — Linux : fichiers, processus, permissions et codes de sortie

Le compte qui exécute un programme détermine ses accès aux fichiers, sockets et services. Le runner ou l'agent doit pouvoir lire le dépôt, écrire dans son espace de travail et lancer les outils autorisés. Le code de sortie indique ensuite le résultat : `0` signifie une réussite selon le programme ; tout autre code doit être interprété.

```bash
# Où suis-je, et sous quelle identité ?
pwd
id

# Version du système et capacité disponible.
cat /etc/os-release
uname -m
df -h
free -h

# Vérifier la présence des outils avant d'essayer un pipeline.
command -v bash git curl python3 docker
bash --version
git --version
python3 --version
docker version

# Lire un fichier : ne jamais afficher les fichiers contenant les secrets.
ls -l ci/run.sh
bash -n ci/run.sh  # analyse la syntaxe, sans exécuter le script
```

Lire chaque diagnostic selon sa portée. `command -v` fournit le chemin d'un programme accessible dans `PATH`, la liste des répertoires de recherche. `docker version` doit montrer un client et un serveur pour confirmer que le démon, le service Docker, est joignable. `bash -n` vérifie uniquement la syntaxe du script, sans contrôler ses outils ni son fonctionnement.

Devant « permission denied », relever la ressource refusée, le compte effectif et le propriétaire. Corriger le compte ou le droit minimal prévu par l'installation, puis répéter la commande. `chmod 777` ou l'usage systématique de `sudo` élargissent les accès sans résoudre ce diagnostic.

Les scripts activent `set -Eeuo pipefail` pour rendre plusieurs erreurs visibles. Les codes attendus des scanners demandent néanmoins un traitement explicite. L'exemple suivant conserve le statut du contrôle jusqu'à la publication de son rapport :

```bash
# Exemple pédagogique : conserver le statut d'un programme sans le masquer.
set +e
programme_de_controle >rapport.txt 2>&1
statut=$?
set -e
printf 'Code du contrôle : %s\n' "$statut"
# Publier ici le rapport avec le mécanisme de la plateforme, puis :
exit "$statut"
```

`programme_de_controle` est un nom illustratif, sans commande à installer. Un script complet distingue anomalie détectée, outil indisponible et rapport illisible. Ajouter `|| true` sans traiter ces cas ferait passer un échec pour une réussite.

#### D — Git : identifier exactement le code contrôlé

Git distingue la révision enregistrée, la copie de travail et l'index, qui sélectionne les changements du prochain commit. Examiner ces états avant de comparer le poste à la CI. Le [livre officiel Git](https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository) détaille leur fonctionnement.

```bash
# Lecture seule : repérer les changements locaux et la révision contrôlée.
git status --short
git diff
git diff --staged
git log -1 --format='%H %s'
git rev-parse HEAD
```

Le diagnostic doit fournir un identifiant de commit complet et un état de travail connu. La CI récupère normalement une révision du serveur : les modifications restées sur le poste en sont absentes. Pour une MR/PR, vérifier aussi les métadonnées, car la plateforme peut tester une révision de fusion synthétique.

Utiliser des branches courtes, des revues et une branche principale protégée. Un tag Git nomme une révision ; ses droits et sa protection se configurent séparément. Ne jamais pousser de clé, y compris pour une démonstration.

#### D — Docker : image, conteneur, réseau et volume

Une image fournit le système de fichiers et les métadonnées du lancement ; un conteneur en est une exécution, avec sa propre mémoire et sa couche inscriptible. Le registre stocke les images. Un volume conserve des données selon un cycle de vie distinct : supprimer un conteneur ne remplace donc pas une sauvegarde.

```bash
# Diagnostic non destructif du moteur et des ressources courantes.
docker info
docker image ls
docker container ls --all
docker network ls
docker system df
```

Dans ce scénario, le runner ou l'agent pilote le démon Docker de sa VM dédiée et lance les outils dans des conteneurs. Cet accès exige une forte confiance : le [modèle de sécurité Docker](https://docs.docker.com/engine/security/) indique que le socket peut donner un pouvoir équivalent à celui de `root`, le superutilisateur de l'hôte.

Exclure de cette VM et de ses secrets les jobs issus de forks non fiables, c'est-à-dire de copies du dépôt hors du périmètre approuvé. Exécuter l'application avec un utilisateur non privilégié limite cette application ; cela ne retire pas les privilèges du job qui construit l'image.

#### D — YAML : structure et contenu à ne pas confondre

YAML est un format de données qui décrit des listes, des objets et des valeurs avec une indentation en espaces. La [spécification YAML](https://yaml.org/spec/1.2.2/) définit cette structure ; GitLab et Azure donnent leur sens aux clés du pipeline.

```yaml
# Exemple de structure, pas un pipeline complet.
variables:
  ENVIRONMENT_NAME: "test" # les guillemets rendent le type explicite

steps:
  - bash: |               # bloc multiligne transmis à Bash
      printf '%s\n' "Bonjour"
      python3 --version
    displayName: "Vérifier Python"
```

Cet exemple utilise les clés Azure Pipelines `steps` et `displayName` ; GitLab emploie notamment `script`. La plateforme traite d'abord le YAML et ses substitutions, puis le shell interprète les lignes. Le moment d'évaluation d'une variable dépend donc de sa syntaxe.

Un linter, outil de vérification statique, détecte les erreurs de structure ; le validateur de la plateforme vérifie aussi ses clés. Placer une chaîne contenant `: ` entre guillemets ou dans un bloc évite de la confondre avec une paire clé-valeur.

#### D — Réseau : raisonner depuis le bon espace

Diagnostiquer le réseau dans l'ordre de ses couches. Une URL (Uniform Resource Locator) précise protocole, nom, port et chemin. Le DNS (Domain Name System) résout le nom en adresse ; TCP (Transmission Control Protocol) établit la connexion ; TLS (Transport Layer Security) vérifie notamment l'identité du serveur et chiffre le transport. HTTP (Hypertext Transfer Protocol) fournit ensuite le statut et le contenu. Cet ordre permet de distinguer un certificat refusé d'une panne de l'application.

```bash
# Depuis la VM : remplacer le nom par l'hôte réel de la plateforme.
getent hosts gitlab.com
curl --connect-timeout 5 --max-time 15 --head https://gitlab.com

# Services en écoute dans l'espace réseau courant de la VM.
ss -lnt
```

Dans un conteneur, `localhost` désigne ce conteneur. L'application et ZAP, l'analyseur de sécurité web utilisé ici, rejoignent un réseau Docker de test et se contactent par leurs noms sur ce réseau. La documentation décrit cette [mise en réseau](https://docs.docker.com/engine/network/).

Publier un port sur toutes les interfaces de la VM élargit l'accès ; ne pas le faire par commodité. Pour certains tests, une réponse HTTP `200` est nécessaire : contrôler aussi le contenu et l'identité de l'application.

Configurer le proxy d'entreprise pour le service système et, si nécessaire, ses conteneurs. Installer l'autorité de certification attendue dans chaque composant concerné. `curl -k` désactive une vérification TLS ; il ne rétablit pas la confiance dans le certificat.

### 1.5. Architecture et frontières de confiance

**Objectif :** distinguer le code, le calcul, les preuves, le registre et la cible, puis attribuer à chacun ses propres accès.

| Composant | Action ou accès | Résultat attendu |
|---|---|---|
| Dépôt et plateforme CI/CD | Protéger les modifications et planifier les jobs | Code et contexte identifiés |
| VM Linux de calcul | Exécuter runner ou agent, Docker, outils et tests | Image et preuves produites dans le périmètre prévu |
| Stockage des artefacts | Conserver rapports, SBOM et manifestes | Preuves retrouvables pour cette exécution |
| Registre OCI | Autoriser le push CI et les pulls nécessaires | Image référencée par un digest immuable |
| VM de préproduction distincte | Exécuter le digest approuvé et vérifier la santé | État déployé observé et consigné |
| Identités séparées | Limiter l’accès registre CI au job, la clé SSH à la promotion et le pull cible à la lecture | Aucun secret de préproduction accessible au code non fiable |

**Lecture :** un transfert de données n’accorde aucun droit ; les accès au calcul, aux preuves, au registre et à la cible se configurent séparément.

Chaque ligne distingue un flux et ses autorisations. Dépôt, stockage des rapports et registre remplissent des fonctions différentes, même s’ils sont proposés par la même plateforme.

| Lieu réel | Ce qui s'y exécute dans le scénario | Ce qui doit être protégé |
|---|---|---|
| Plateforme CI/CD | Planification, conditions, conservation des traces, contrôle des ressources | YAML, branches, templates, règles d'approbation, droits des administrateurs |
| VM Linux dédiée | Service runner/agent, shell du job, client et démon Docker | Compte de service, disque, certificats, réseau, correctifs, socket Docker |
| Conteneurs des outils | Lint, scanners, génération de rapports selon les montages autorisés | Entrées, versions, répertoires montés, droits de sortie et accès réseau |
| Environnement de test | Image candidate, base SQLite et jeu de données jetables | Identité de la candidate, réseau isolé, durée de vie, collecte des logs |
| VM de préproduction distincte | Exécution de l'image approuvée par digest | Identité SSH, registre en lecture, configuration cible, données et procédure de rétablissement |

Le mode d'exécution détermine les accès réels du job. Un exécuteur Shell GitLab n'applique pas `image` et `services` comme un exécuteur Docker : les scripts de ce guide lancent eux-mêmes les conteneurs des outils. Dans Azure, un job hôte et un job de conteneur ont également des accès différents. Les chapitres de plateforme détaillent ces configurations.

Le démon d'une VM persistante conserve un état entre les jobs. Une VM par périmètre de confiance, une concurrence bornée et des noms de ressources uniques limitent les collisions. Ces précautions ne suffisent pas pour du code hostile.

Les contributions non fiables nécessitent des exécuteurs éphémères isolés, sans accès de déploiement. Les changements approuvés sont ensuite qualifiés dans un périmètre distinct.

### 1.6. Contrat de l'application pédagogique

L'application pédagogique est un petit service HTTP Python avec SQLite, fourni par la bibliothèque standard, et Jinja2 pour le rendu. Elle reste facile à lire tout en apportant une dépendance réelle à inventorier et analyser. Elle expose `/`, `/health` et `/api/items`, avec une base SQLite temporaire et des données de test.

Le service n'a pas d'authentification applicative. Les identifiants du registre et de SSH (Secure Shell, accès distant sécurisé) servent à l'infrastructure ; ils ne représentent pas des comptes utilisateurs du service.

Les tests vérifient le délai de réponse, le statut, le contenu et le traitement des entrées prévues. Ils contrôlent aussi que le processus du conteneur ne s'exécute pas sous l'identifiant utilisateur (UID) 0. Un endpoint de santé, ou point d'accès de diagnostic, ne démontre pas à lui seul que toutes les fonctions marchent.

| Famille | Question posée | Exemple de preuve | Limite principale |
|---|---|---|---|
| Test unitaire | Une fonction produit-elle le résultat attendu ? | Assertions (vérifications automatisées) et couverture du code exécuté | L'intégration réelle peut encore échouer |
| Intégration | Les composants échangent-ils correctement ? | Requête HTTP et accès aux données de test | Le contexte de préproduction peut différer |
| Fonctionnel | Le scénario utilisateur respecte-t-il le contrat ? | Parcours d'interface de programmation (API) avec état attendu | Les scénarios non écrits restent inconnus |
| SAST, Static Application Security Testing | L'analyse statique du code relève-t-elle des motifs dangereux ? | Rapport avec fichier et règle | Résultat dépendant du langage et des règles |
| SCA, Software Composition Analysis | L'analyse des composants relève-t-elle des vulnérabilités recensées ? | Rapport de dépendances et base utilisée | Absence de dépendance externe ≠ absence de risque dans Python ou le système d'exploitation (OS) |
| IaC, Infrastructure as Code | La configuration d'infrastructure décrite par du code enfreint-elle une règle ? | Rapport Checkov avec chemins | Seuls les formats et ressources couverts sont analysés |
| Image | Que contient l'image réellement produite ? | Rapport Trivy et SBOM | La fraîcheur de la base change le résultat |
| DAST, Dynamic Application Security Testing | Que voit l'analyse dynamique sur le service démarré ? | Rapport ZAP et cible vérifiée | Baseline : exploration limitée et analyse passive |

Le [baseline ZAP](https://www.zaproxy.org/docs/docker/baseline-scan/) explore le service et l'analyse passivement. Il ne remplace ni un scan actif ni des tests de logique métier. Ici, il examine des routes publiques et ne prouve rien sur une session authentifiée.

Pour couvrir des fonctions protégées, définir avant le scan un contexte autorisé, une authentification, des utilisateurs et une politique. Conserver aussi une preuve que le scanner a bien accédé aux routes protégées.

Pour un autre langage, remplacer le linter, les tests, le moteur SAST et l'inventaire SCA par des outils adaptés, tout en conservant les contrats de rapports, d'image unique et de décision. Une base ou une file de messages supplémentaire demande aussi des données de test, une attente de disponibilité et un nettoyage propres au service.

### 1.7. Environnements : configuration, données et durée de vie

Un environnement réunit une destination, une configuration, des droits, des données et une version identifiables. Une variable `ENV=test` ne crée pas à elle seule ce contexte d'exécution.

| Environnement | Rôle et configuration | Données et accès | Création, passage et suppression |
|---|---|---|---|
| Développement | Boucle rapide sur le poste ou une VM personnelle | Données synthétiques ; accès personnels limités | Création à la demande ; aucune promotion fondée sur un état local non commité |
| Intégration | Vérifier l'assemblage des changements et composants | Compte et schéma dédiés, pas de données de production | Souvent créé par branche ou pipeline ; suppression à la fin ou à expiration |
| Test de qualification | Contrôler la candidate construite avec des règles explicites | Jeu déterministe, secrets de test séparés, réseau scanner autorisé | Recréé pour la candidate ; logs et preuves sauvegardés avant nettoyage |
| Préproduction | Valider l'exploitation dans un contexte proche de la cible | Identités dédiées ; données synthétiques ou anonymisées contrôlées | Promotion du digest qualifié, autorisation explicite, historique et retour arrière |

La démonstration réunit intégration et qualification dans un environnement temporaire pour limiter le matériel, tout en gardant leurs responsabilités distinctes. Avec des dépendances complexes, l'équipe peut séparer les environnements et prévoir deux décisions successives.

Versionner la configuration non sensible et injecter les secrets à l'exécution. Chaque secret a un propriétaire, une durée de vie et un périmètre d'environnement. Il ne doit entrer ni dans une image, ni dans un rapport, une capture ou un cache, le stockage réutilisé pour accélérer les jobs.

Avant la promotion, contrôler les prérequis de la cible : accès au registre, port disponible, paramètres, capacité, compatibilité des données et tests après déploiement.

Identifier les ressources temporaires par le pipeline/job et par des labels, leurs étiquettes techniques. Compléter le nettoyage normal par une recherche périodique des ressources périmées. Ce rattrapage reste nécessaire si l'arrêt brutal d'une VM empêche l'exécution du nettoyage prévu.

### 1.8. De la construction à la version approuvée

**Objectif :** comprendre les quatre jobs et la décision qui sépare une candidate qualifiée d’un déploiement autorisé.

1. Identifier le commit, l’exécution et les paramètres avant le premier contrôle.
2. Exécuter `quality`, puis `build`, puis `qualify` ; chaque job exige la réussite du précédent et récupère ses preuves.
3. Examiner la candidate complète et obtenir l’autorisation adaptée au risque avant `promote`.
4. Promouvoir le même digest, vérifier la cible et conserver le résultat ; en cas d’échec, appliquer la procédure de retour arrière compatible avec les données.

**Lecture :** la réussite technique de `qualify` prépare la décision ; elle ne donne pas à elle seule l’autorisation d’exécuter `promote`.

Ces étapes décrivent les dépendances logiques. Les contrôles indépendants peuvent fonctionner en parallèle, mais la décision attend tous les résultats qu'elle exige. Conserver également les rapports d'échec et leur statut réel.

| Terme | Sens opérationnel |
|---|---|
| Build | Opération qui transforme les sources en livrable ; il peut échouer |
| Artefact de pipeline | Fichier conservé et transmis explicitement par la plateforme, par exemple un rapport |
| Cache | Accélérateur réutilisable, facultatif et potentiellement absent ; il n'est pas une preuve de qualification |
| Archive d'image | Export de l'image transmis comme fichier pour une démonstration ; taille et import à gérer |
| Image OCI du registre | Objet que les environnements récupèrent ; le digest identifie le contenu à déployer |
| Candidate | Livrable identifié proposé aux contrôles, sans présumer de leur réussite |
| Release candidate | Candidate dont les contrôles prescrits ont réussi et qui est proposée à une décision de livraison |
| Release | Version déclarée disponible selon la politique de l'organisation, avec notes et preuves |
| Déploiement | Installation ou démarrage d'une version dans un environnement |
| Promotion | Autorisation et passage d'une candidate identifiée vers un contexte de confiance supérieur |
| SBOM | Inventaire structuré des composants du livrable ; ce n'est pas une déclaration d'absence de vulnérabilité |

Publier une image dans un registre restreint de candidates peut précéder sa qualification ; cette publication ne vaut pas approbation. La préproduction doit recevoir le digest qualifié. Retaguer `latest` ou reconstruire pendant la promotion romprait le lien avec les contrôles : toute reconstruction, même du même commit, crée une candidate à analyser et tester.

Le digest désigne le contenu ; une signature y ajoute une affirmation d'identité vérifiable selon une politique de confiance. L'inscrire dans un fichier JSON (JavaScript Object Notation, format de données structurées) ne protège pas à lui seul les pipelines, les preuves, le registre ou les droits de promotion.

### 1.9. Lire un échec et choisir sa prochaine action

Pour comprendre un échec, retrouver le premier contrôle en défaut, sa commande et son code de sortie. Relever ses entrées : commit, image, politique, versions des outils et base de vulnérabilités. Ces éléments permettent de séparer un défaut du produit d'une panne du contrôle.

| État | Exemple | Décision attendue |
|---|---|---|
| Anomalie détectée | Test échoué, vulnérabilité au-dessus du seuil | Corriger le produit ou présenter une exception explicitement recevable |
| Erreur technique | Scanner ne démarre pas, base inaccessible | Rétablir le contrôle puis le relancer ; aucune validation par défaut |
| Rapport absent / invalide | Fichier vide ou JSON illisible | Bloquer la qualification, vérifier la génération et le transfert |
| Non applicable | Format sans IaC, justification vérifiée | Enregistrer la portée et la justification ; ne pas le présenter comme analysé |
| Exception acceptée | Risque résiduel limité, propriétaire et échéance | Appliquer uniquement le périmètre autorisé et conserver la décision |

Relancer n'est utile qu'avec une cause comprise ou une hypothèse à vérifier. Suivre un test instable au lieu de répéter jusqu'au vert, ce qui masquerait l'incertitude. Le chapitre d'exploitation fournit les procédures de diagnostic et les exercices de panne.

### 1.10. Glossaire rapide

| Mot | Définition accessible |
|---|---|
| Runner GitLab | Programme qui reçoit les jobs GitLab et fait exécuter leurs instructions |
| Agent Azure Pipelines | Programme qui reçoit un job d'un pool Azure et exécute ses étapes |
| Exécuteur | Mode choisi pour lancer les jobs d'un runner, par exemple Shell ou Docker |
| Pool | Groupe d'agents utilisables selon leurs capacités et les permissions accordées |
| Job | Unité de travail confiée à une ressource d'exécution |
| Stage | Regroupement logique de jobs dont le sens précis dépend de la plateforme |
| Step / task | Étape ou composant d'un job Azure ; une task peut réunir plusieurs actions |
| Dépendance | Relation qui impose un résultat ou un ordre entre des éléments |
| Template | Modèle réutilisable et versionné de jobs, d'étapes ou de paramètres |
| Secret | Valeur dont la divulgation donne un accès ou compromet la confidentialité |
| Variable | Valeur transmise à une configuration ou à un processus, pas forcément secrète |
| Moindre privilège | Accès strictement nécessaires, limités au périmètre et à la durée utiles |
| Preuve | Résultat conservé avec sa cible, son origine, son contexte et son statut |
| Gate / critère de passage | Règle qui autorise ou bloque l'étape suivante |
| Idempotence | Répétition prévue d'une opération sans incohérence ni doublon |
| Rollback / retour arrière | Rétablissement d'une version connue, avec traitement séparé des données si nécessaire |
| SLO, Service Level Objective | Objectif de niveau de service défini par un indicateur et une période |

### 1.11. Autoévaluation avant le parcours technique

1. Expliquer pourquoi un test réussi sur le poste ne prouve pas que la CI teste le même code.
2. Montrer où tournent le shell du job, le scanner, le démon Docker et l'application.
3. Dire quelle URL le scanner doit employer si l'application est dans un autre conteneur.
4. Retrouver le commit, l'exécution et l'image correspondant à un rapport.
5. Expliquer pourquoi un rapport absent bloque une promotion et pourquoi un cache ne le remplace pas.
6. Distinguer une publication de candidate et une autorisation de préproduction.
7. Identifier qui dispose des accès au démon Docker et qui peut modifier le pipeline.

Les §§1.4 à 1.9 permettent de vérifier les réponses. Refaire le diagnostic encore incertain avant d'enregistrer un runner ou un agent.

<a id="itil-calm"></a>

<a id="2-piloter-la-chaîne-avec-itil-version-5-et-calmcalms"></a>

## 2. ITIL 5, apports d’ITIL 4 et CALMS

### 2.1. Référentiel vérifié et portée des recommandations

**Vérification documentaire : 22 octobre 2026. ITIL 5 reste le cadre de référence de ce document.** PeopleCert présente officiellement [ITIL Foundation (Version 5)](https://www.peoplecert.org/browse-certifications/it-governance-and-service-management/ITIL-1/itil-5-foundation-version-50-4154), consacré à la gestion des produits et services numériques, à la création de valeur, à leur cycle de vie et à l'amélioration continue.

Le [guide pratique ITIL 4 et CALMS du portfolio fourni](https://devsecops-portfolio.netlify.app/guides/devsecops/itil/) a été téléchargé et lu intégralement. Il enrichit ici la pédagogie : comprendre un besoin, relier les décisions aux preuves du pipeline et faire travailler les équipes ensemble.

Les rappels sur le **SVS, les sept principes, les quatre dimensions, les six activités et les 34 pratiques sont présentés dans leur périmètre ITIL 4**. La [présentation officielle ITIL 4 Foundation de PeopleCert](https://www.peoplecert.org/browse-certifications/it-governance-and-service-management/ITIL-1/itil-4-foundation-2565) et les sources associées servent à les vérifier. Ces repères aident à comprendre le cas concret ; ils ne constituent pas une description des nouveautés d'ITIL 5 ou une équivalence entre versions.

La [FAQ officielle PeopleCert](https://www.peoplecert.org/help-and-support/faq-itil) précise qu'ITIL 5 reprend des concepts éprouvés d'ITIL 4, dont le système de valeur et les principes directeurs. Cette continuité justifie leur intérêt pédagogique ; le cadre du document reste ITIL 5.

**CALMS** apporte cinq angles de lecture du travail d'équipe : **Culture, Automation, Lean, Measurement, Sharing**.

Les responsabilités, seuils, délais et procédures sont **une adaptation locale à cette chaîne CI/CD**, à adopter selon le risque de l'organisation. Les outils, la fréquence de déploiement et les modalités d'approbation relèvent de ces choix locaux. Ce chapitre ne démontre pas une conformité exhaustive à ITIL 5.

#### 2.1.1. Rappel ITIL 4 : service, valeur et système de valeur

Le fil rouge est le service `catalogue-demo`. Son API `/api/items` fournit la liste des articles à une interface. Le besoin utile est de permettre à une personne de consulter un catalogue correct et disponible. Le build, l'image et le rapport de tests sont des moyens pour y parvenir.

Un **output** est un livrable produit : par exemple, une image OCI et son manifeste de preuves. Un **outcome** est un résultat rendu possible pour un utilisateur : consulter les bons articles après la modification. Un pipeline vert démontre des contrôles réussis dans un périmètre précis ; il ne prouve pas, à lui seul, que l'utilisateur obtient ce résultat.

La **valeur** dépend du besoin, des bénéfices, des coûts et des risques perçus par les parties prenantes. L'équipe et le responsable du service doivent donc préciser ensemble ce que signifie « le catalogue fonctionne ». Ils peuvent retenir un scénario de consultation, une disponibilité attendue et des contraintes de sécurité.

Dans ITIL 4, le **système de valeur des services**, ou **SVS** (*Service Value System*), est la vue d'ensemble qui relie la demande ou une opportunité à cette valeur. Il réunit cinq composants complémentaires :

| Composant du SVS | Rôle dans `catalogue-demo` |
|---|---|
| Principes directeurs | Guider les choix, par exemple commencer par observer les tests existants |
| Gouvernance | Définir qui accepte un risque et qui peut autoriser la cible |
| Chaîne de valeur des services | Combiner les activités nécessaires pour répondre au besoin |
| Pratiques | Mobiliser les personnes, méthodes, informations et outils utiles aux changements, tests ou incidents |
| Amélioration continue | Vérifier les résultats et corriger ce qui freine ou fragilise le service |

#### 2.1.2. Les sept principes directeurs ITIL 4 dans une décision concrète

Les principes servent à choisir une action adaptée au contexte. Voici leur traduction pédagogique pour une modification de `/api/items` ; les actions et preuves proposées sont locales.

| Principe ITIL 4 | Action dans le scénario | Preuve à examiner |
|---|---|---|
| Se concentrer sur la valeur | Définir la consultation attendue avant de modifier l'API | Critère d'acceptation et test fonctionnel |
| Commencer là où vous êtes | Examiner le pipeline et les incidents existants | Mesure initiale et liste des contrôles déjà utiles |
| Progresser par itérations avec des retours | Livrer une modification limitée et observer son effet | Diff revu et résultat après déploiement |
| Collaborer et promouvoir la visibilité | Associer application, plateforme, sécurité et service à la décision | Propriétaires connus, revue et rapports accessibles |
| Penser et travailler de façon globale | Vérifier API, données, image, réseau et reprise ensemble | Compatibilités et dépendances documentées |
| Rester simple et pratique | Garder les informations nécessaires à la décision | Fiche courte avec cible, risque, preuves et retour prévu |
| Optimiser et automatiser | Comprendre un contrôle, puis rendre son exécution répétable | Script versionné et rapport exploitable |

Avant d'automatiser une approbation, définir le risque évalué, le décideur et les preuves nécessaires.

#### 2.1.3. Rappel ITIL 4 : les six activités de la chaîne de valeur

La chaîne de valeur est un modèle d'activités que l'organisation combine selon la demande. **Ses six activités ne sont pas six phases rigides à reproduire dans l'ordre des jobs.** Une même activité peut intervenir plusieurs fois, notamment lors d'un retour utilisateur ou d'un incident. La [présentation du compte officiel ITIL sur la chaîne de valeur](https://www.linkedin.com/posts/itilofficial_itil-4-the-service-value-chain-activity-7316408745637388288-TcmG) souligne cette utilisation flexible.

| Activité ITIL 4 | Question simple | Application à la chaîne CI/CD |
|---|---|---|
| Planifier (*Plan*) | Quel besoin, quelle direction et quelles contraintes ? | Définir le périmètre de `/api/items`, les risques et les critères de passage |
| Améliorer (*Improve*) | Que faut-il rendre plus utile ou plus fiable ? | Corriger un test instable, puis mesurer son effet |
| Impliquer les parties prenantes (*Engage*) | Comprend-on le besoin et les retours ? | Clarifier la réponse attendue avec le responsable du service et informer lors d'un incident |
| Concevoir et assurer la transition (*Design and transition*) | Comment préparer un service utilisable et soutenable ? | Prévoir tests, compatibilité des données, déploiement et reprise |
| Obtenir ou construire (*Obtain/build*) | Quels composants faut-il rendre disponibles ? | Développer le code et construire une image identifiée par digest |
| Fournir et soutenir (*Deliver and support*) | Comment faire fonctionner le service au quotidien ? | Déployer, observer `/api/items`, aider au diagnostic et rétablir le service |

#### 2.1.4. Appliquer le cadre ITIL 5 au pipeline

[ITIL 5](https://www.peoplecert.org/browse-certifications/it-governance-and-service-management/ITIL-1/itil-5-foundation-version-50-4154) considère ensemble produits et services numériques. Pour `catalogue-demo`, le produit rassemble le code, les configurations et les fonctions du catalogue ; l'image construite en est un composant livrable. Le service est l'API réellement utilisée, avec ses accès, son exploitation et son soutien aux utilisateurs.

Suivre le cycle de vie signifie relier le besoin de consultation à la conception, aux tests, au déploiement, puis à l'exploitation et à l'amélioration. Dans ce cas, conserver le critère d'acceptation de `/api/items` jusqu'à sa vérification sur la cible. Le pipeline contribue à cette continuité ; le responsable du service organise aussi l'observation et la réponse aux retours.

La valeur se vérifie dans l'usage : l'utilisateur retrouve-t-il les bons articles, dans des conditions acceptables ? Un pipeline vert apporte des preuves techniques. Le test de consultation et les retours des utilisateurs complètent ces preuves pour évaluer l'expérience. Ce parcours est l'application locale du cadre au laboratoire.

### 2.2. Une même décision, plusieurs dimensions

Les quatre dimensions d'ITIL 4 sont utilisées ici comme grille de lecture pédagogique. Elles s'appliquent ensemble : un bon scanner ne remplace pas un propriétaire du risque, et un rôle nommé ne remplace pas une preuve technique.

Prenons une modification de `/api/items` : elle est revue, testée et construite une seule fois. Les analyses et essais portent sur l'image identifiée par digest ; les preuves accompagnent l'autorisation de préproduction. Si le service se dégrade, l'équipe doit retrouver le changement, rétablir une version compatible et en étudier la cause.

| Dimension ITIL 4 | Question à résoudre pour ce changement | Choix du scénario |
|---|---|---|
| Organisations et personnes | Qui corrige le défaut et qui accepte le risque résiduel ? | Propriétaires nommés pour application, plateforme, sécurité et service |
| Information et technologie | Comment savoir quelle image a été testée ? | Commit, identifiant d'exécution, digest, rapports et manifeste liés |
| Partenaires et fournisseurs | Que se passe-t-il si le registre ou le fournisseur CI est indisponible ? | Délais bornés, reprise documentée, aucune validation par absence de résultat |
| Flux de valeur et processus | Où l'équipe attend-elle et quelle attente est utile ? | Contrôles rapides en amont, parallélisation des contrôles indépendants, autorisation proportionnée |

La [présentation PeopleCert des guides de pratiques ITIL 4](https://www.peoplecert.org/news-and-announcements/itil-practice-guides-a-hidden-gem) confirme que les pratiques considèrent ces quatre dimensions. Une pratique réunit compétences, informations et moyens techniques pour atteindre un objectif.

### 2.3. Responsabilités et séparation des pouvoirs

La responsabilité partagée associe les équipes à la résolution des problèmes, avec un rôle identifiable pour chaque décision. Elle ne donne pas les mêmes droits à tous. Le laboratoire permet de cumuler les rôles ; un service réel détermine leur séparation selon son risque et ses obligations.

| Action | Responsable de réalisation | Autorité de décision | Contribution / preuve |
|---|---|---|---|
| Définir le comportement et les tests | Équipe applicative | Responsable produit / service | Critères d'acceptation et tests significatifs |
| Administrer VM, runner / agent et réseau | Équipe plateforme | Responsable plateforme | Inventaire, correctifs, isolement et capacité |
| Définir les règles de sécurité | Équipe sécurité avec les développeurs | Propriétaire du risque concerné | Politique versionnée, seuils et traitement des faux positifs |
| Modifier un template partagé | Mainteneur désigné | Relecteur indépendant selon le risque | Diff, tests du template, version diffusée |
| Qualifier la candidate | Pipeline protégé | Politique approuvée par le service | Résultats complets pour un commit et un digest |
| Autoriser la préproduction | Approbateur désigné | Propriétaire de l'environnement / changement | Identité, date, cible, digest et référence de changement |
| Exécuter le déploiement | Identité technique limitée | Autorisation de ressource | Journal, digest réellement démarré et tests après déploiement |
| Accepter une exception | Propriétaire du risque | Autorité explicitement habilitée | Motif, portée, échéance et mesures compensatoires |
| Rétablir le service | Équipe de réponse désignée | Responsable de l'incident | Chronologie, décision et résultat vérifié |

L'identité du pipeline ne doit pas pouvoir changer ses approbations ou ses droits d'environnement. Protéger également les comptes administrateurs capables de contourner les contrôles et conserver leurs actions dans les journaux d'audit disponibles. Vérifier les réglages de la plateforme en complément du YAML.

### 2.4. Changements standardisés, normaux et urgents

Classer le changement selon **son risque réel et sa cible**. Une petite modification des droits peut être plus risquée qu'un grand changement documentaire. La notion ITIL 4 de *Change enablement*, traduite ici par maîtrise des changements, aide à comprendre le choix local : évaluer et autoriser les changements de façon adaptée.

Le modèle proposé distingue trois classes. L'urgence accélère une décision de rétablissement ou de réduction de risque, sans transformer une preuve absente en réussite.

| Classe du guide | Conditions et autorisation | Application CI/CD |
|---|---|---|
| Standardisé | Scénario répétable, risque faible, mode opératoire et limites préautorisés | Contrôles automatiques obligatoires ; déploiement automatisable si le modèle autorise cette cible |
| Normal | Changement nécessitant une appréciation propre au contexte | Revue et approbation par l'autorité prévue ; évaluation des données, compatibilités et retour arrière |
| Urgent | Réponse à un incident ou risque nécessitant une décision accélérée | Identité habilitée, périmètre limité, preuves disponibles, déploiement surveillé et réexamen après intervention |

Un **CAB** (*Change Advisory Board*, comité consultatif des changements) peut éclairer une décision complexe. Il n'est pas obligatoire pour chaque changement. L'organisation choisit une autorité adaptée : un modèle préautorisé pour un changement standardisé, un approbateur désigné ou plusieurs compétences lorsque le risque le justifie.

Réexaminer un changement standardisé après un incident, une évolution de périmètre ou à sa date de revue. Si ses conditions ne sont plus satisfaites, refaire une analyse adaptée. Ici, le **job de promotion exige une autorisation explicite** ; automatiser un modèle préautorisé demande une décision de gouvernance supplémentaire.

#### Fiche de changement directement réutilisable

```yaml
# Exemple organisationnel : fiche de décision, pas fichier de pipeline.
change_id: "CHG-2026-0042"
service: "catalogue-demo"
class: "normal"
owner: "responsable-service"
purpose: "Valider la nouvelle réponse de /api/items en préproduction"
scope:
  environment: "preproduction"
  source_sha: "<commit complet>"
  run_id: "<identifiant du pipeline>"
  image_ref: "<registre/projet/image@sha256:empreinte>"
risk:
  impact: "Interruption temporaire du service de démonstration"
  data_compatibility: "Données synthétiques recréées ; aucun jeu réel"
  checks: "<lien du paquet de preuves et de la politique>"
decision:
  approver: "<identité habilitée>"
  approved_at: "<date UTC>"
  window: "<fenêtre convenue>"
recovery:
  previous_candidate: "<référence du paquet approuvé précédent>"
  expected_recovery_minutes: 10
  verification: "Santé, digest et scénario fonctionnel"
```

Remplacer les valeurs entre chevrons et renseigner la date en temps universel coordonné (UTC). La fiche soutient la décision ; le contrôle technique vérifie aussi les permissions et le paquet de preuves. Les dix minutes sont un objectif local à tester, sans garantie de rétablissement.

### 2.5. Correspondance entre pratiques de service et pipeline

Comme repère pédagogique, ITIL 4 comprend **34 pratiques**, ainsi que le rappelle la [présentation PeopleCert des guides de pratiques](https://www.peoplecert.org/news-and-announcements/itil-practice-guides-a-hidden-gem). Ce nombre se rapporte à ITIL 4. Le laboratoire en utilise les apports utiles ; il n'est pas nécessaire d'installer 34 outils ou de créer 34 étapes pour démarrer.

Distinguer quatre notions évite de mal interpréter un pipeline vert :

| Notion | Sens dans le scénario |
|---|---|
| Release | Version ou ensemble de fonctionnalités rendu disponible à l'utilisation ; l'image seule n'établit pas cette décision |
| Déploiement | Installation d'une version dans une cible, ici la préproduction ; la disponibilité d'une fonctionnalité peut être décidée séparément |
| Incident | Interruption ou dégradation non planifiée du service ; la priorité est de rétablir un fonctionnement acceptable |
| Problème | Cause réelle ou potentielle d'un ou plusieurs incidents ; son traitement vise à réduire leur répétition ou leur impact |

Ainsi, rétablir `/api/items` avec la version précédente peut résoudre l'incident sans encore avoir expliqué le défaut. L'analyse du problème peut ensuite conduire à corriger un cache ou à ajouter un test de compatibilité.

| Pratique mobilisée | Mise en œuvre dans le guide | Preuve utile et limite |
|---|---|---|
| Maîtrise des changements | Branche protégée, revue, critères de passage et décision sur un digest | Historique de revue et d'autorisation ; les droits hors YAML restent à contrôler |
| Validation et tests du service | Tests unitaires, fonctionnels, disponibilité et contrôles sécurité | Rapports, cibles et versions ; les scénarios absents ne sont pas validés |
| Gestion des releases | Candidate qualifiée, notes, politique et décision de disponibilité | Manifeste et liens ; publier une image seule ne déclare pas une release |
| Gestion des déploiements | Script reproductible, concurrence limitée, contrôle de santé | Digest réellement exécuté et statut ; une commande SSH réussie ne suffit pas |
| Gestion des configurations | Paramètres versionnés, inventaire des cibles et versions | Configuration non sensible et lien vers le coffre ; ne pas recopier les secrets |
| Gestion des incidents | Fiches de diagnostic, journal d'incident, retour arrière | Chronologie et rétablissement observé ; l'analyse de cause peut venir après |
| Gestion des problèmes | Analyse des pannes récurrentes et action sur leur cause | Ticket de cause, correction et vérification ; examiner le système avant de conclure « erreur humaine » |
| Gestion des connaissances | Guide, templates et retours d'expérience partagés | Version documentaire, propriétaire et date de revue |
| Amélioration continue | Mesures du flux, hypothèse d'amélioration et revue d'effet | Comparaison avant/après et effets sur fiabilité et sécurité |

Une CMDB (*Configuration Management Database*, base de gestion des configurations) ou un inventaire peut relier l'environnement, l'application, son propriétaire, l'image et les dépendances. Conserver les logs dans leurs outils sources. Les identifiants relient registre, CI et outil de changement sans dupliquer toutes leurs informations.

Pour exprimer la qualité attendue, un **SLI** désigne une mesure, par exemple la part de consultations de `/api/items` réussies ; un **SLO** fixe la cible de cette mesure et sa période ; un **SLA** formalise les engagements convenus avec le client. Les objectifs de reprise **RTO** (durée visée) et **RPO** (perte de données acceptable exprimée en temps) doivent être précisés si le service conserve des données. Ces objectifs viennent du besoin du service.

### 2.6. Traçabilité : une preuve doit désigner sa cible

La traçabilité répond après la fin du job : « Quelle version a été déployée, qui l'a autorisée et sur quelles preuves ? »

**Objectif :** pouvoir démontrer quel code a produit l’image testée, quelles preuves ont été examinées et quelle version a atteint la cible.

| Composant | Action | Résultat traçable |
|---|---|---|
| Commit et revue | Identifier le code accepté | Révision exacte et contexte de revue |
| Exécution | Fixer l’identifiant et les paramètres | Contexte de production des preuves |
| Image OCI | Conserver le digest issu du push et contrôler l’image correspondante | Identité immuable du livrable |
| Rapports et SBOM | Conserver contrôles, tests fonctionnels, DAST et empreintes | Preuves rattachées au commit, au run et à l’image |
| Candidate | Réunir et vérifier les preuves requises | Manifeste complet et daté |
| Décision | Identifier auteur, cible, date et candidate approuvée | Autorisation portant sur une version précise |
| Déploiement et historique | Observer le digest et les contrôles de santé | Résultat utilisable pour incident ou retour arrière |

**Lecture :** un tag lisible ou un statut vert isolé ne remplace pas le lien vérifiable entre commit, exécution, digest, preuves, décision et état déployé.

Le paquet de preuves relie le commit et l'exécution au digest, à la politique et aux rapports. Ses empreintes détectent des incohérences, mais un acteur disposant de tous les accès pourrait le réécrire.

Restreindre les écritures et relier les preuves aux journaux de la plateforme. Pour des besoins élevés, prévoir des signatures ou attestations vérifiables avec une identité protégée.

Conserver les rapports d'échec avec leur statut et fixer une rétention adaptée au service. Rapports temporaires, candidates approuvées et historiques peuvent avoir des durées distinctes. Avant un retour arrière, vérifier que le paquet précédent et son image existent encore : la procédure dépend de leur conservation.

#### États de décision obligatoires

| État | Interprétation | Promotion |
|---|---|---|
| Réussi | Outil exécuté, rapport valide, cible correcte et politique satisfaite | Possible si tous les autres contrôles requis sont satisfaits |
| Anomalie | Produit ou configuration hors critère | Bloquée, sauf exception autorisée pour cette règle et ce périmètre |
| Erreur d'exécution | Le contrôle n'a pas pu conclure | Bloquée jusqu'à exécution exploitable |
| Preuve absente / incohérente | Résultat manquant, corrompu ou lié à une autre candidate | Bloquée |
| Non applicable | Périmètre absent, décision documentée et acceptée par la politique | Possible seulement si cette non-applicabilité est recevable |
| Exception active | Risque accepté explicitement et échéance valide | Possible dans ses limites, sans convertir tous les résultats en réussite |

Chaque état indique ce que le contrôle a réellement établi. Une panne d'outil reste un échec technique, même sans alerte. Abaisser un seuil ou ajouter `allow_failure` change la politique : protéger cette modification comme un changement d'accès.

### 2.7. Gérer les exceptions sans créer une désactivation permanente

Distinguer le faux positif démontré, la non-applicabilité et le risque réel accepté. Conserver l'analyse et limiter l'exception à l'occurrence examinée : une exclusion globale masquerait aussi les futures occurrences non approuvées.

Une exception précise l'identifiant, le motif, la règle et la ressource, le service et l'environnement. Elle nomme le propriétaire du risque et l'approbateur habilité, avec dates d'effet et d'expiration, mesure compensatoire, correction suivie et conditions de réexamen. Elle ne dispense pas automatiquement d'un contrôle défaillant ou d'un rapport absent.

```yaml
# Exemple d'enregistrement à adapter au mécanisme effectivement implémenté.
exception_id: "SEC-EX-0042"
control: "image-vulnerabilities"
finding: "<identifiant exact>"
resource: "<paquet et version ou chemin précis>"
image_digest: "sha256:<empreinte complète>"
reason: "<raison vérifiable et impact évalué>"
owner: "<propriétaire du risque>"
approved_by: "<autorité habilitée>"
valid_from: "2026-10-20T08:00:00Z"
expires_at: "2026-10-27T08:00:00Z"
compensating_controls: "<restriction vérifiée>"
remediation: "<ticket et date visée>"
review_on: "Nouvelle exploitabilité, changement de composant ou expiration"
```

**Ce fichier ne crée pas de contournement dans les scripts fournis.** Il décrit le contrat de gouvernance à implémenter et valider pour le contrôle concerné. En attendant, corriger l'anomalie et relancer la qualification.

Ne pas simuler une approbation avec `|| true`, la suppression d'un rapport ou une baisse de seuil. Toute exception expirée ou liée à une autre empreinte doit être réexaminée.

<a id="28-calmcalms-dans-le-travail-quotidien"></a>

### 2.8. Les cinq piliers CALMS dans le travail quotidien

CALMS est une grille de lecture de l'équipe et de son travail. Chaque pilier doit se traduire par un comportement observable. Acheter un outil de CI ne suffit pas à créer une responsabilité partagée ou un partage des connaissances.

| Pilier et définition simple | Action et outil possible dans `catalogue-demo` | Preuve ou effet à vérifier |
|---|---|---|
| **Culture** : poursuivre un objectif commun, collaborer et assumer les décisions | Revue commune application, plateforme et sécurité ; ticket avec un propriétaire et un suppléant | Chacun connaît le résultat attendu et le contact pour traiter un échec |
| **Automation** : rendre les tâches répétées exécutables de façon cohérente | Scripts versionnés, tests et scanners dans le pipeline ; déploiement du digest autorisé | Même entrée et mêmes critères ; journaux et rapports conservés |
| **Lean** : réduire les attentes, les reprises et le travail sans valeur | Petits changements, revue rapide, contrôles indépendants parallélisés après mesure | Délai de retour réduit sans détérioration de la qualité des preuves |
| **Measurement** : observer pour décider puis vérifier l'effet d'une action | Durée et attente des jobs dans la CI ; disponibilité et erreurs de l'API dans l'observabilité | Mesure définie avec unité, source, période et contexte |
| **Sharing** : rendre l'expérience réutilisable par les autres | Template partagé, runbook versionné, compte rendu d'incident accessible | Un second membre peut reproduire le diagnostic ou la reprise |

Par exemple, après une panne du registre, l'équipe partage la cause, une vérification sans secret et la correction dans la fiche d'exploitation. Un autre membre confirme alors le rétablissement sans demander le jeton d'accès du premier intervenant.

Avant de paralléliser deux contrôles, examiner leurs dépendances et leurs ressources. Deux tâches indépendantes peuvent donner un retour plus tôt ; si elles saturent le même disque ou la même mémoire, leur exécution simultanée peut ralentir le flux. Mesurer permet de choisir.

### 2.9. Boucle d'amélioration utilisable en équipe

#### Cas pratique : du code de `/api/items` à l'amélioration

**Situation pédagogique locale :** l'équipe modifie la réponse de l'API du catalogue. La cible est la préproduction du laboratoire. Elle conserve les critères du guide, notamment la couverture de **85 %** et la fraîcheur des preuves de **72 heures**. Ce sont des choix locaux, à distinguer des principes ITIL 4 et CALMS.

| Étape | Décision et action | Repères ITIL 4 et piliers CALMS mobilisés | Preuve conservée |
|---|---|---|---|
| 1. Clarifier le besoin | Préciser la liste attendue et le comportement à préserver | Valeur, implication des parties prenantes ; Culture | Critère d'acceptation de `/api/items` |
| 2. Modifier et relire le code | Faire un changement limité ; vérifier sécurité et compatibilité | Développement, conception ; Culture et Lean | Commit, revue et tests ajoutés |
| 3. Tester et qualifier | Construire l'image une fois et exécuter les contrôles requis sur les bonnes cibles | Validation et tests ; Automation | Digest, rapports et manifeste ; échec conservé s'il survient |
| 4. Approuver la candidate | Classer le changement, vérifier les preuves et le retour prévu ; autoriser la cible | Maîtrise des changements et gouvernance ; Culture et Measurement | Décideur, date, cible et digest approuvé |
| 5. Déployer et observer | Déployer ce digest, puis vérifier santé et consultation du catalogue | Déploiements, fourniture et soutien ; Automation et Measurement | Digest exécuté et résultat des contrôles après déploiement |
| 6. Traiter une dégradation | Si la consultation échoue, ouvrir un incident, coordonner et rétablir une version compatible | Incidents ; Culture, Automation et Sharing | Chronologie, décision de reprise et consultation redevenue correcte |
| 7. Chercher la cause | Examiner pourquoi les tests n'ont pas détecté le défaut ; suivre la cause et la correction | Problèmes et connaissances ; Culture et Sharing | Analyse sans recherche de coupable, ticket et test reproduisant le défaut |
| 8. Vérifier l'amélioration | Qualifier le correctif et confirmer qu'il prévient la répétition sans allonger inutilement le flux | Amélioration continue ; Lean et Measurement | Résultat du test, mesure avant/après et runbook mis à jour |

Ces étapes constituent un exercice local. Conserver l'étiquette « préproduction » pour ses observations, selon les règles du chapitre d'exploitation.

#### Conduire une amélioration après ce cas

1. **Fixer le résultat attendu** : réduire le délai de retour d'un changement simple en conservant les contrôles obligatoires.
2. **Mesurer le départ** : relever attente et durée sur une période adaptée, en gardant les échecs dans l'observation.
3. **Choisir une contrainte** : runner indisponible, test instable ou approbation sans suppléant.
4. **Formuler une hypothèse** : « Un cache à clé déterministe réduira les téléchargements sans modifier les résultats des tests ».
5. **Modifier de façon réversible** : préciser le propriétaire, le périmètre et les conditions de retour.
6. **Comparer les effets** : observer délai, taux d'échec et qualité des preuves, y compris les effets indésirables.
7. **Partager et réévaluer** : conserver ou corriger le changement et mettre à jour son modèle si nécessaire.

Le chapitre d'exploitation sépare les performances du pipeline des résultats de livraison du service. Le nombre de déploiements sert à observer le flux ; il ne classe pas les individus et ne mesure pas à lui seul la satisfaction du besoin utilisateur.

### 2.10. Questions de revue avant de déclarer la chaîne maîtrisée

- Qui peut changer un seuil, un template et une approbation d'environnement ? Les traces de ces changements sont-elles conservées ?
- La candidate approuvée correspond-elle au digest testé, et le digest réellement exécuté est-il vérifié après déploiement ?
- Qui décide pour un changement normal et pour une urgence ? Le suppléant est-il connu ?
- Les rapports sont-ils compréhensibles et accessibles aux personnes qui doivent décider ?
- Une exception a-t-elle une portée exacte, une échéance, un propriétaire et une correction suivie ?
- Peut-on rétablir une version avec les données actuelles, dans le délai annoncé et avec les preuves encore disponibles ?
- Quelle amélioration récente a été vérifiée par une mesure et partagée avec l'équipe ?

Pour chaque réponse négative, désigner un propriétaire, expliciter le risque et choisir une correction proportionnée. Une réunion supplémentaire est utile si elle aide à prendre cette décision.

#### Exercice court et correction

**Exercice.** Le scan de l'image du catalogue ne produit aucun rapport. Les autres tests sont verts. L'approbateur connaît le développeur et veut déployer. Peut-il considérer le scan comme réussi ? Citer un principe parmi les rappels ITIL 4, deux piliers CALMS et la prochaine action attendue. Puis expliquer la différence entre rétablir l'API et traiter la cause du défaut.

**Correction.** Un rapport absent ne démontre pas un contrôle réussi : la promotion reste bloquée selon la politique du guide. « Collaborer et promouvoir la visibilité » conduit à rendre l'échec visible et à nommer son responsable. **Automation** permet de relancer un contrôle exploitable ; **Sharing** rend le diagnostic et la solution réutilisables. **Measurement** peut aussi suivre la fréquence de ces pannes d'outil.

Corriger l'exécution, produire le rapport pour la bonne image, puis réexaminer la candidate. Si le service est déjà dégradé, la gestion d'incident vise d'abord son rétablissement vérifié ; la gestion des problèmes recherche et traite les causes pour réduire la répétition. Une exception éventuelle suit le contrat de la section 2.7 et le mécanisme réellement implémenté.

<a id="laboratoire"></a>

## 3. Préparer le laboratoire et comprendre l'application

### 3.1. Contrat de ce laboratoire

Ce laboratoire utilise une VM Linux amd64 d'exécution, un registre OCI privé et une seconde VM de préproduction. Choisir GitLab ou Azure DevOps : les deux parcours réalisent les mêmes contrôles sur la même application.

Les commandes Linux s'exécutent dans Bash. Windows permet ici de rédiger et vérifier le code Python ; l'installation du runner ou de l'agent se fait sur la VM.

| Élément | Choix | Pourquoi et vérification |
|---|---|---|
| Distribution | Ubuntu 24.04 LTS (support de longue durée) ou Debian 12 amd64 (x86 64 bits) | Référence commune aux agents vérifiés ; `cat /etc/os-release; uname -m` |
| Ressources initiales | 4 processeurs virtuels (vCPU), 8 Gio de mémoire vive (RAM), 50 Gio de disque, 1 job lourd simultané | Départ de laboratoire à mesurer ; Checkov/ZAP et les archives sont volumineux |
| Shell et utilitaires | Bash, Git, Python ≥ 3.9, curl, autorités de certification (CA), client OpenSSH, coreutils | Pilotage des conteneurs et validation locale des preuves |
| Docker | Engine depuis le dépôt officiel, interface en ligne de commande (CLI), Buildx | Client et démon de même famille stable ; relever `docker version` et `docker buildx version` |
| Réseau | Sortie HTTPS 443 vers CI, registres, index Python (PyPI) et bases SCA/CVE ; DNS et heure fiables | Téléchargement des dépendances et des vulnérabilités référencées par identifiant CVE (Common Vulnerabilities and Exposures) |
| Préproduction | SSH 22 limité à l'agent de promotion ; HTTP 8080 lié à loopback, l'interface locale | Pas d'exposition publique automatique ; ajouter un proxy TLS interne pour l'accès de l'équipe |

L'accès au démon Docker donne un pouvoir comparable à `root` sur la VM. Ce modèle exige donc une VM dédiée et des révisions approuvées. Un runner de MR utilise une autre VM, éphémère et sans secrets ; monter le socket hôte dans un conteneur de job ne renforce pas cette frontière.

### 3.2. Installer Docker depuis une source officielle

Le moteur Docker lance les conteneurs à la demande de son client. Il sert ici à construire et tester la candidate, puis à exécuter les outils.

Préparer une VM neuve ou inventoriée avec `sudo` et l'accès réseau. Examiner les paquets concurrents avant la procédure officielle de désinstallation : ne pas supprimer sans inventaire un Docker qui héberge déjà des services.

Exécuter ces commandes sur Ubuntu ou Debian. Le script lit la distribution dans `/etc/os-release` et demande de choisir une version exacte du paquet avant l'installation :

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git python3 openssh-client
. /etc/os-release
case "$ID" in ubuntu|debian) ;; *) echo 'Distribution à adapter'; exit 1;; esac
sudo install -m 0755 -d /etc/apt/keyrings
# Une clé dans un fichier dédié limite le dépôt auquel elle s'applique.
sudo curl -fsSL "https://download.docker.com/linux/$ID/gpg" -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
arch=$(dpkg --print-architecture)
codename=${UBUNTU_CODENAME:-$VERSION_CODENAME}
printf 'Types: deb\nURIs: https://download.docker.com/linux/%s\nSuites: %s\nComponents: stable\nArchitectures: %s\nSigned-By: /etc/apt/keyrings/docker.asc\n' \
  "$ID" "$codename" "$arch" | sudo tee /etc/apt/sources.list.d/docker.sources
sudo apt-get update
apt-cache madison docker-ce
# Copier une version EXACTE issue de cette liste, compatible avec votre distribution.
DOCKER_VERSION='REMPLACER_PAR_VERSION_APT'
sudo apt-get install -y "docker-ce=$DOCKER_VERSION" "docker-ce-cli=$DOCKER_VERSION" \
  containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo docker version
sudo docker run --rm hello-world
```

Les métadonnées signées d'APT, le gestionnaire de paquets, vérifient l'intégrité des paquets. Contrôler aussi la provenance de la clé selon la politique de l'organisation. Une signature refusée doit être corrigée sans ajouter `trusted=yes`. Sources : [Ubuntu](https://docs.docker.com/engine/install/ubuntu/) et [Debian](https://docs.docker.com/engine/install/debian/).

L'installation est vérifiée quand le client et le serveur répondent, puis que le conteneur de vérification termine. Si le socket renvoie `permission denied`, vérifier le compte dédié. Pour ce laboratoire, son accès au groupe Docker s'accorde avec `sudo usermod -aG docker gitlab-runner` ou `sudo usermod -aG docker azp`, après acceptation du privilège équivalent à root. Redémarrer ensuite sa session ou son service.

Contrôler l'accès avec `sudo -u gitlab-runner -H docker info` ou `sudo -u azp -H docker info`. Pour une erreur DNS/TLS, corriger les CA, le proxy ou le réseau sans basculer vers un registre non sécurisé.

### 3.3. Où s'exécute chaque chose ?

| Emplacement | Processus | Durée et accès |
|---|---|---|
| VM CI | service Runner/Agent, Bash, Python de validation, Docker/BuildKit | Persistant ; espace disque et mises à jour administrés |
| Conteneur Python outil | Ruff, pytest, couverture, Bandit, pip-audit, yamllint | Un job qualité ; dépôt monté, aucun secret transmis à la commande qualité |
| Autres conteneurs outils | Gitleaks, Hadolint, Checkov, Trivy, Dockle | Un contrôle ; archives d'image montées sans socket pour Trivy et Dockle |
| Réseau Docker éphémère | application, client HTTP, ZAP | Un seul job `qualify`, alias `application`, aucun port hôte publié |
| VM préproduction | conteneur `catalogue-preprod` | Persistant ; digest approuvé, registre en lecture seule, compte de déploiement distinct |

Dans le modèle Shell retenu, Docker est un service système de la VM ; le script crée le test explicitement sans `services:` CI. Le Docker executor GitLab exige un moteur séparé ou l'accès à un socket. Ajouter `image:` ne suffit donc pas à rendre les scripts hôte compatibles avec ce mode.

**Objectif :** localiser l’orchestration, les outils, le test et la cible avant d’exécuter les commandes du laboratoire.

1. La plateforme planifie ; le runner ou l’agent exécute le job sur une VM Linux de calcul dédiée.
2. Le shell utilise le démon Docker de cette VM pour lancer les outils et un réseau de test unique contenant l’application et ZAP.
3. Les artefacts CI conservent les preuves ; le registre conserve l’image ; une autre VM reçoit ensuite le digest approuvé.

**Lecture :** la présence des conteneurs sur la VM ne crée pas une frontière suffisante pour du code hostile ; le calcul non fiable exige un environnement isolé distinct.

Les analyses statiques précèdent la publication technique. L’image du registre reste une candidate jusqu’aux tests dynamiques et à la qualification complète ; sa présence ne vaut pas autorisation de promotion.

### 3.4. Choisir le moteur de construction

| Option | Fonctionnement | Usage et limite |
|---|---|---|
| BuildKit via Docker hôte | `docker build` utilise le moteur installé | Choix retenu pour sa lisibilité ; VM réservée aux révisions fiables |
| BuildKit/rootless | Démon et construction sans compte root hôte | Privilèges réduits ; configurer les espaces de noms utilisateurs (user namespaces), le stockage et le réseau, puis vérifier la compatibilité des scans |
| Docker-in-Docker (DinD) | Démon dans un service du job | État du démon séparé, souvent en mode privilégié ; protection insuffisante contre du code hostile |
| Socket hôte monté dans un job | Client du job connecté au démon hôte | Mise en place simple, mais pouvoir sur tous les conteneurs et l'hôte ; exclure les dépôts non fiables |

Une variante DinD demande des versions client/serveur compatibles, TLS, des certificats partagés en volume et un alias DNS du service. Les paramètres illustratifs sont `DOCKER_HOST=tcp://docker:2376`, `DOCKER_TLS_VERIFY=1` et `DOCKER_CERT_PATH=$DOCKER_TLS_CERTDIR/client` ; ils supposent les certificats et un runner privilégié dédié déjà configurés.

Le parcours final utilise le démon hôte, sans ces variables. Références : [BuildKit](https://docs.docker.com/build/buildkit/), [rootless](https://docs.docker.com/engine/security/rootless/), [privilèges et socket](https://docs.docker.com/engine/security/).

### 3.5. Application de démonstration et tests locaux

L'application associe le serveur HTTP standard de Python, SQLite et Jinja2. L'installation reste légère, avec du code pour le SAST et des dépendances réelles pour la SCA. `http.server` convient à ce laboratoire ; pour exposer le service, le remplacer par une pile HTTP de production maintenue avec TLS, authentification, limites de débit et surveillance adaptées.

| Route | Contrat | Ce que le test prouve |
|---|---|---|
| `/health` | 200, `status=ok`, `revision=<commit>` et requête SQLite réussie | Révision attendue et accès à la base |
| `/api/items` | Article fictif `{id:1,name:article-demo}` | Accès aux données et comportement déterministe |
| `/` | HTML rendu par Jinja, révision et lien API | Rendu, échappement et en-têtes |
| route inconnue | 404 JSON | Absence de succès trompeur pour toutes les URLs |

Le service crée sa base SQLite dans `/tmp` à chaque démarrage, avec une insertion idempotente. Sans compte utilisateur, le périmètre reste public et interne. Les tests locaux utilisent un environnement Python isolé, appelé environnement virtuel ou venv.

Pour une application avec connexion, prévoir des comptes synthétiques, un contexte ZAP authentifié et une assertion prouvant l'accès à une route protégée. Ce laboratoire ne valide pas l'authentification.

```bash
# Dans le dépôt reconstitué depuis l'annexe, sur un poste de travail ou une VM Linux.
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements-dev.txt
python -m pytest --cov=app --cov-report=term --cov-fail-under=85
# Les tests utilisent une vraie socket loopback et une base temporaire par cas.
DATABASE_PATH=/tmp/catalogue-local.sqlite APP_REVISION=local python -m app.service
# Dans un autre terminal :
curl --fail http://127.0.0.1:8080/health
```

Vérifier que les tests réussissent et que la réponse HTTP respecte le contrat. Si une dépendance manque, examiner PyPI, le proxy, les CA et l'environnement virtuel. Si le port est occupé, le confirmer avec `ss -ltnp`, puis utiliser `PORT=8081`.

Relancer les tests et l'endpoint après correction. Conserver leurs assertions : les neutraliser supprimerait la preuve recherchée.

La couverture mesure le traitement HTTP, le rendu et les données ; elle exclut `main()`, l'enveloppe qui lance le serveur et gère les signaux. Les tests d'image vérifient en complément le démarrage réel, la disponibilité et l'utilisateur effectif. Le pourcentage seul ne mesure pas la qualité des tests.

### 3.6. Dockerfile, archive et identifiant immuable

Le Dockerfile, fichier de construction de l'image, comporte deux étapes avec la même base. Les wheels, paquets Python prêts à installer, vont sous `/opt/deps` ; seules ces dépendances et `app/` passent dans l'image d'exécution. Les couches ne reçoivent ni outils de test ni jetons de registre.

Le `.dockerignore` limite les fichiers autorisés et exclut rapports, Git et secrets. L'UID 10001, le port 8080, le lancement en forme exec sans shell intermédiaire, le HEALTHCHECK de santé et les limites au démarrage complètent la configuration. Les fichiers figurent intégralement dans l'annexe.

Le **tag** est une étiquette modifiable ; le **digest** identifie le contenu du manifeste OCI, qui décrit l'image. L'ID local de configuration Docker est un autre identifiant : après publication, lire `RepoDigests` pour récupérer le digest du registre.

Le scénario se limite à `linux/amd64`, ce qui évite la confusion entre index multiarchitecture et manifeste d'une plateforme. Référence : [digests d'images](https://docs.docker.com/reference/cli/docker/image/pull/).

```bash
# Première méthode pédagogique : transfert par archive, sans registre.
docker build -t catalogue:exercice .
docker save catalogue:exercice -o catalogue.tar
sha256sum catalogue.tar > catalogue.tar.sha256
# Sur la machine suivante, transférer les deux fichiers via un canal approuvé.
sha256sum -c catalogue.tar.sha256
docker load -i catalogue.tar
docker image inspect catalogue:exercice
```

L'empreinte SHA256 vérifie l'intégrité de l'archive, sans identifier un manifeste OCI ni authentifier son auteur. Dans le pipeline final, l'archive est scannée avant publication ; `evidence/image.env` conserve ensuite `IMAGE_REF=registre/projet/image@sha256:...`. Les jobs suivants récupèrent cette référence précise. Reconstruire l'image, même du même commit, crée une nouvelle candidate.

### 3.7. Verrouiller les outils avant le premier pipeline

```bash
bash ci/lock-images.sh
cat ci/images.lock.env
# Revoir les origines et les versions dans une MR dédiée.
git add -f ci/images.lock.env
git commit -m 'Verrouiller les images des outils CI'
```

`ci/images.env` fournit les tags de départ ; le script les résout en digests dans `ci/images.lock.env`. Ce fichier de verrouillage doit être relu et versionné avant le premier pipeline complet, qui refuse de démarrer sans lui. Aucun digest fictif n'est fourni. Renouveler ensuite ces références par changement contrôlé.

Pip épingle les dépendances applicatives et les outils principaux, mais résout encore les dépendances transitives de l'outillage, celles requises indirectement. Avant un usage réglementé, produire un verrou complet avec empreintes dans un environnement Linux propre et l'intégrer aux mises à jour. Rescanner aussi les images verrouillées : leur contenu immuable peut rester vulnérable.

### 3.8. Amorcer le dépôt et dérouler le premier essai

```bash
git init -b main
git add .
git commit -m 'Socle pédagogique CI/CD'
# Configurer remote et pousser dans le projet GitLab ou Azure préparé au chapitre choisi.
# Puis verrouiller les images comme ci-dessus et configurer les variables plateforme.
export SOURCE_SHA=$(git rev-parse HEAD) RUN_ID=exercice-001
bash ci/run.sh quality
export IMAGE_REPOSITORY=registry.example.net/formation/catalogue
export REGISTRY_HOST=registry.example.net REGISTRY_USER=compte-ci
read -rsp 'Jeton registre : ' REGISTRY_PASSWORD; echo
export REGISTRY_PASSWORD
bash ci/run.sh build
bash ci/run.sh qualify
unset REGISTRY_PASSWORD
```

Utiliser le même répertoire pendant l'essai local pour garder `reports/` et `evidence/`. La CI transfère explicitement ces fichiers entre jobs. Une interruption conserve les rapports déjà produits et le statut d'échec.

Lancer `promote` seulement après avoir préparé la cible et pris la décision de changement décrite au chapitre suivant.

<a id="gitlab"></a>

## 4. Parcours GitLab CI/CD : du dépôt à la préproduction

Retour au [guide principal](#fondamentaux).

### 4.1. Résultat visé et progression

Ce parcours construit une image OCI (Open Container Initiative), la qualifie par son digest — son empreinte immuable — puis autorise son déploiement en préproduction. Il utilise le dépôt de démonstration et les scripts communs. Avant de commencer, suivre les prérequis Linux, Git, Docker, YAML et réseau du guide principal : Docker et BuildKit doivent déjà fonctionner sur la VM.

| Niveau | Travail | Preuve attendue |
|---|---|---|
| Découverte | Installer Runner, lancer `premier-job` | Identité Linux et versions visibles dans le journal |
| Pratique | Exécuter `quality`, corriger un échec | Rapports de tests, couverture et contrôles disponibles |
| Autonomie | Construire, qualifier et promouvoir | Même digest dans le registre, la candidate et la cible |
| Exploitation | Restreindre les droits, entretenir, revenir en arrière | Autorisation de changement et compte rendu de rétablissement |

**Périmètre :** VM Linux amd64 sous Ubuntu 24.04 LTS ou Debian 12, runner Shell dédié, registre GitLab activé et préproduction sur une autre VM. Les références approuvées utilisent `trusted-shell` ; les MR (merge requests, demandes de fusion) utilisent une VM jetable distincte, sans secret de préproduction.

Le runner Shell accède au démon Docker de son hôte. Le groupe `docker` lui donne des droits équivalents à root : cette VM doit rester réservée au code de confiance.

**Référence documentaire : 20 octobre 2026.** Les exemples n'ont pas été exécutés sur GitLab.com ou une instance cliente. Choisir une version de Runner disponible et approuvée pour votre instance, relever sa version exacte, puis réaliser la recette finale ; la syntaxe présentée ne certifie pas toutes les versions.

### 4.2. Architecture, responsabilités et frontières

GitLab planifie les jobs à partir du YAML, leur fournit les variables autorisées et conserve leurs résultats. Runner récupère et exécute un job ; son **exécuteur** détermine où les commandes tournent. Un **artefact** est un fichier conservé pour consultation ou transmission au job suivant.

**Objectif :** séparer la validation d’une Merge Request du pipeline autorisé à construire, qualifier et promouvoir une image.

| Composant | Action ou accès | Résultat |
|---|---|---|
| MR et `isolated-quality` | Qualité seule sur une VM distincte et jetable | Retour de contrôle sans accès à la préproduction |
| Branche protégée et `trusted-shell` | Exécuter la chaîne réservée au code revu | Construction et qualification autorisées |
| Docker de la VM | Lancer outils, application et ZAP sur un réseau temporaire | Tests réels de la candidate |
| Registre OCI restreint | Push avec l’identité du job puis pull par digest | Image unique pour test et cible |
| Artefacts GitLab | Conserver rapports et manifestes, même après un contrôle en échec | Preuves du même pipeline ; l’échec reste visible |
| Job `promote` protégé | Après autorisation, revérifier la candidate et déployer sous verrou | Changement de préproduction contrôlé |
| VM de préproduction | Recevoir la commande SSH et tirer l’image avec sa propre identité de lecture | Digest approuvé exécuté et santé vérifiée |

**Lecture :** les tags de runner orientent les jobs ; la séparation des VM, les restrictions des runners et les protections des ressources doivent empêcher une MR d’atteindre le périmètre de confiance.

| Emplacement | Exécution réelle dans ce laboratoire |
|---|---|
| Serveur GitLab / GitLab.com | Dépôt, orchestration, droits, interface des rapports, artefacts |
| VM Runner | Service Runner, Bash, Git, Python, client Docker, client SSH |
| Conteneurs lancés par les scripts | Analyseurs et dépendances de test, avec montages limités aux besoins des outils |
| Démon Docker de la VM | Construction, images, réseaux et conteneurs temporaires |
| Réseau Docker de qualification | Application et scanner ZAP ; pas de service `services:` GitLab dans ce parcours Shell |
| VM de préproduction | Image déjà qualifiée, données dédiées, configuration et compte de lecture du registre |

La VM Runner et le serveur GitLab ont des responsabilités distinctes. Sur GitLab.com, GitLab exploite le service SaaS (logiciel en ligne), et vous administrez votre Runner autohébergé. Avec une instance autohébergée, votre équipe assure aussi TLS, sauvegardes, stockage des artefacts, registre, mises à jour et disponibilité du serveur.

### 4.3. Préparer le projet et ses droits

1. Créer un projet privé et y pousser les fichiers reconstitués depuis l’annexe à la racine du dépôt. Ne pas conserver un niveau de dossier supplémentaire au-dessus de `.gitlab-ci.yml`.
2. Activer le registre du projet. Vérifier que **Deploy > Container Registry**, ou son équivalent dans l'interface de votre version, est accessible.
3. Protéger la branche par défaut (`main` dans le laboratoire), interdire les push directs ordinaires et fusionner par MR relue. Protéger aussi les tags de publication si vous en créez.
4. Exiger un pipeline MR réussi avant fusion. Revoir spécifiquement `.gitlab-ci.yml`, `ci/`, `config/`, le Dockerfile et les fichiers de dépendances. Une modification d'un script exécuté est une modification des pouvoirs du pipeline.
5. Créer deux runners de projet : `trusted-shell`, **Protected**, et `isolated-quality`, réservé aux VM jetables sans accès à la préproduction. Désactiver **Run untagged jobs** et limiter leur rattachement à ce projet.
6. Désactiver l'accès des pipelines MR aux variables et runners protégés dans les réglages CI/CD. Ne pas exécuter dans le projet parent un pipeline provenant d'un fork inconnu. Le contributeur peut utiliser ses propres ressources ; l'intégration dans le projet de confiance passe par revue.
7. Limiter les personnes pouvant fournir des variables à l'exécution manuelle ou planifiée. Une variable capable de remplacer un tag, une cible ou un outil change le comportement du pipeline.

Les tags sélectionnent un runner ; les droits, références protégées et VM isolées contrôlent l'accès. Vérifier les conditions d'accès des MR dans [Merge request pipelines](https://docs.gitlab.com/ci/pipelines/merge_request_pipelines/) et les réglages des runners dans [Configuring runners](https://docs.gitlab.com/ci/runners/configure_runners/).

La VM de qualité conserve l'identité minimale du job et du runner, même sans secret métier. Exclure les jetons personnels, clés de préproduction, caches du pool de confiance et routes vers les systèmes internes sensibles. Après un job non fiable, détruire puis recréer la VM depuis une image propre.

Le provisionnement automatique n'est pas fourni. Sans cette isolation, laisser les MR en attente ou utiliser une plateforme d'exécution éphémère adaptée.

### 4.4. Installer Runner sur la VM

#### Prérequis et contrôle réseau

Exécuter cette installation dans **Bash sur la VM Linux**, avec un compte administrateur. Les jobs Docker utiliseront ensuite le compte de service `gitlab-runner`.

```bash
# Paquets système nécessaires à l'administration et aux scripts du laboratoire.
sudo apt-get update
sudo apt-get install -y ca-certificates curl git jq python3 openssh-client

# Adapter à l'instance ; cette URL n'est pas celle du projet.
export GITLAB_URL='https://gitlab.com'
curl --fail --silent --show-error --head "$GITLAB_URL"
docker version
docker buildx version
getent hosts gitlab.com
timedatectl status
```

**Attendu :** HTTPS sans erreur de certificat, client et serveur Docker accessibles, heure synchronisée. Autoriser en sortie DNS et HTTPS vers GitLab, le registre, les dépendances, les images d'outils et les bases de vulnérabilités ; réserver SSH au trajet VM de confiance → préproduction.

Runner interroge GitLab en HTTPS et ne nécessite aucun port entrant pour cet usage. En cas de proxy ou de certificat interne, configurer les autorités approuvées sans désactiver TLS.

#### Installer depuis le dépôt officiel

```bash
# Télécharger avant d'exécuter, puis lire le script de configuration APT.
curl --fail --show-error --location \
  'https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh' \
  --output gitlab-runner-repository.sh
less gitlab-runner-repository.sh
sudo bash gitlab-runner-repository.sh

# APT doit accepter les signatures des métadonnées ; arrêter en cas d'erreur.
sudo apt-get update
apt-cache madison gitlab-runner
apt-cache madison gitlab-runner-helper-images

# Saisir une version exacte présente dans les deux listes et approuvée pour l'instance.
read -r -p 'Version APT exacte retenue, suffixe inclus : ' RUNNER_APT_VERSION
test -n "$RUNNER_APT_VERSION"
sudo apt-get install -y \
  "gitlab-runner=$RUNNER_APT_VERSION" \
  "gitlab-runner-helper-images=$RUNNER_APT_VERSION"

gitlab-runner --version
dpkg-query -W gitlab-runner gitlab-runner-helper-images
```

Le script configure le dépôt APT et sa clé de métadonnées ; `--fail` refuse les erreurs HTTP et `--location` suit la redirection officielle. Choisir une version exacte, suffixe inclus, commune aux paquets Runner et helper, puis archiver les sorties de versions. Procédure : [Install GitLab Runner using the official GitLab repositories](https://docs.gitlab.com/runner/install/linux-repository/).

**Signature de paquet à revalider :** le 20 octobre 2026, cette page indiquait encore une clé expirant le 28 avril 2026. Elle ne constitue donc pas ici une garantie actuelle.

Distinguer la signature APT des métadonnées de la vérification individuelle d'un `.deb`. Si cette dernière est exigée, obtenir auprès de GitLab une clé et une procédure valides avant l'installation ; arrêter en cas d'erreur de signature, sans `--allow-unauthenticated` ni désactivation des vérifications.

#### Créer et enregistrer le runner

Créer le runner de projet dans **Settings > CI/CD > Runners** : tag `trusted-shell`, protection activée, jobs sans tag refusés. Relever son jeton d'authentification `glrt-`, utilisé pour l'enregistrement ci-dessous.

```bash
# Mode interactif : éviter de copier le jeton dans l'historique de commandes.
sudo gitlab-runner register
# URL : https://gitlab.com ou URL racine de votre instance.
# Token : jeton d'authentification glrt- remis lors de la création.
# Description : lab-trusted-shell-01.
# Executor : shell.

# Le groupe docker donne le contrôle du démon, donc de cette VM dédiée.
sudo usermod -aG docker gitlab-runner
sudo systemctl restart gitlab-runner
sudo systemctl enable --now gitlab-runner

# Vérifier en prenant l'identité qui exécutera les jobs.
sudo -u gitlab-runner -H bash -lc 'id; docker version; python3 --version; git --version'
sudo gitlab-runner verify
sudo systemctl is-active gitlab-runner
```

Régler tags, périmètre et protection dans GitLab. Le jeton d'authentification `glrt-` remplace les anciens jetons d'enregistrement dépréciés ; il ne s'agit ni d'un jeton utilisateur ni d'un jeton de job. Garder tout jeton réel hors des fichiers versionnés. Voir [Registering runners](https://docs.gitlab.com/runner/register/).

**Attendu :** `verify` confirme la communication avec GitLab, le service est `active`, le runner est en ligne et le compte de service accède à Docker. Le premier pipeline vérifiera aussi l'exécution réelle, les artefacts et le réseau, que `verify` ne teste pas.

#### Comprendre `config.toml`

`/etc/gitlab-runner/config.toml` conserve l'identité créée à l'enregistrement. Garder ses champs et son jeton générés ; adapter seulement les réglages utiles. L'extrait suivant utilise un faux jeton :

```toml
concurrent = 1             # Maximum total de jobs exécutés par ce processus Runner.
check_interval = 3        # Interrogation de la file ; ne remplace pas la capacité CPU.
shutdown_timeout = 30

[[runners]]
  name = "lab-trusted-shell-01"
  url = "https://gitlab.com"
  token = "glrt-REMPLACER-PAR-LE-JETON-DEJA-GENERE"
  executor = "shell"
  shell = "bash"
  limit = 1               # Une seule exécution simultanée sur cette VM de lab.
  request_concurrency = 1 # Requêtes simultanées de récupération, pas jobs simultanés.
```

Cet extrait sert de repère : ne pas remplacer tout `config.toml`. Réserver sa lecture à root et protéger ses sauvegardes.

Commencer avec 1 job simultané, puis mesurer mémoire et attente avant d'augmenter `concurrent`. Une VM de 4 vCPU et 8 Go est un point de départ, sans garantie pour tous les analyseurs. Voir la distinction entre `concurrent`, `limit` et `request_concurrency` dans [Advanced configuration](https://docs.gitlab.com/runner/configuration/advanced-configuration/).

```bash
sudo chmod 600 /etc/gitlab-runner/config.toml
sudo systemctl restart gitlab-runner
sudo journalctl -u gitlab-runner --since '10 minutes ago' --no-pager
```

Après modification, redémarrer le service puis lancer un job court. En cas d'erreur TOML, restaurer une sauvegarde protégée et refaire ces contrôles. Ne pas publier `config.toml` intégral ni les journaux de débogage.

#### Variante exécuteur Docker et limites

L'exécuteur Shell lance les commandes sur l'hôte : `image:` et `services:` n'y créent aucun conteneur de job. Les scripts du laboratoire lancent eux-mêmes les conteneurs ; ajouter `image: python:...` ne change pas cette exécution. Voir [The Shell executor](https://docs.gitlab.com/runner/executors/shell/).

Un runner distinct enregistré avec l'exécuteur **Docker** utilise en revanche `image:` pour le conteneur du job et `services:` pour ses services associés. Premier exercice avec une image approuvée de votre registre :

```yaml
# Sur un runner Docker distinct, sans accès au socket Docker de l'hôte.
variables:
  PYTHON_JOB_IMAGE: "registry.example.net/approved/python:3.12"
test-sans-demon:
  tags: [docker-unprivileged]
  image: "$PYTHON_JOB_IMAGE"
  script:
    - python --version
    - python -m compileall -q app tests
```

Configurer ce runner avec `privileged = false` et sans montage de `/var/run/docker.sock`. Cette séparation du système de fichiers ne fournit pas le démon nécessaire aux scripts complets.

Monter le socket redonne le contrôle de l'hôte ; Docker-in-Docker privilégié exige aussi une forte confiance dans le code. Passer tout le laboratoire de Shell à Docker demanderait d'adapter montages, construction et tests. Voir [Docker executor](https://docs.gitlab.com/runner/executors/docker/).

### 4.5. Variables, jetons et paramètres

Créer les variables dans **Settings > CI/CD > Variables**. Le type **File** fournit le chemin d'un fichier temporaire, attendu par les scripts SSH.

Déclarer les variables SSH sensibles **Protected**, avec la portée `preproduction` ; activer Masked/Hidden lorsque leur format le permet. Le masquage limite l'affichage dans les journaux, pas les accès. Voir [CI/CD variables](https://docs.gitlab.com/ci/variables/).

Avant le premier pipeline, adapter le dépôt OCI, les identités de registre et la cible SSH. Le tableau précise ensuite les valeurs par défaut et la portée de chaque paramètre.

<details>
<summary>Référence — tous les paramètres et leur emplacement</summary>

| Paramètre | Type / défaut | Obligatoire | Emplacement et sensibilité |
|---|---|---|---|
| `TRUSTED_RUNNER_TAG` | chaîne, `trusted-shell` | oui | YAML, non secret ; runner protégé correspondant |
| `QUALITY_RUNNER_TAG` | chaîne, `trusted-shell` | oui | YAML ; règle MR remplace par `isolated-quality` |
| `GIT_DEPTH` | chaîne, `0` | oui pour historique complet | YAML, non secret ; consommation réseau à mesurer |
| `JOB_TIMEOUT` | durée, `45m` | oui | YAML, non secret ; plafond global du projet aussi à vérifier |
| `REPORT_RETENTION` | durée, `30 days` | oui | YAML, non secret ; politique de conservation à adapter |
| `REGISTRY_HOST` | hôte sans `https://`, défaut `CI_REGISTRY` | oui pour build/qualify | variable projet si registre externe, non secret |
| `IMAGE_REPOSITORY` | chemin sans tag/digest, défaut `CI_REGISTRY_IMAGE` | oui | variable projet si registre externe, non secret |
| `REGISTRY_USER` | chaîne, défaut `CI_REGISTRY_USER` | oui pour registre privé | projet si externe ; identité technique limitée au dépôt |
| `REGISTRY_PASSWORD` | secret, défaut `CI_REGISTRY_PASSWORD` | oui pour registre privé | externe : Protected, Masked/Hidden si possible ; expiration et rotation |
| `PREPROD_HOST` | nom DNS / IP, sans défaut | oui pour promote | variable projet Protected, portée `preproduction` |
| `PREPROD_USER` | compte SSH, sans défaut | oui pour promote | même portée ; compte dédié au déploiement |
| `PREPROD_SSH_KEY` | **File**, clé privée, sans défaut | oui pour promote | Protected, portée `preproduction`, sensible |
| `PREPROD_KNOWN_HOSTS` | **File**, clés d'hôtes vérifiées, sans défaut | oui pour promote | Protected, portée `preproduction` ; intégrité essentielle |
| `PREPROD_URL` | URL HTTP(S), sans défaut | oui pour lien environnement | variable projet, URL publique dans GitLab ; sans identifiant |
| `SOURCE_SHA` | chaîne, `CI_COMMIT_SHA` | injecté par le job | ne pas saisir manuellement ; provenance du code |
| `RUN_ID` | chaîne, `CI_PIPELINE_ID` | injecté par le job | ne pas saisir manuellement ; corrélation des preuves |

</details>

Les fichiers communs du chapitre des contrôles définissent les politiques des analyseurs. Toutes les variantes YAML gardent ces contrôles obligatoires ; relire les changements de templates et de politiques comme du code applicatif.

| Variable GitLab | Utilité dans ce parcours |
|---|---|
| `CI_COMMIT_SHA` | Révision exacte, labels d'image et preuves |
| `CI_COMMIT_REF_SLUG` | Nom simplifié utilisable pour un nom de ressource ; pas une identité immuable |
| `CI_DEFAULT_BRANCH` | Rend les règles indépendantes du nom `main` |
| `CI_PIPELINE_ID` / `CI_JOB_ID` | Identité du parcours / d'une tentative de job ; ne pas les confondre |
| `CI_REGISTRY` / `CI_REGISTRY_IMAGE` | Adresse du registre / chemin OCI du projet |
| `CI_REGISTRY_USER` / `CI_REGISTRY_PASSWORD` | Authentification du job au registre du projet |
| `CI_JOB_TOKEN` | Identité temporaire du job, pour des ressources GitLab autorisées |

`CI_REGISTRY_PASSWORD` est le jeton du job et expire avec lui : ne pas l'utiliser comme identifiant durable de préproduction. La disponibilité des variables est précisée dans [Predefined CI/CD variables](https://docs.gitlab.com/ci/variables/predefined_variables/).

`CI_JOB_TOKEN` fournit une identité temporaire aux API GitLab autorisées. Ses droits dépendent de l'utilisateur déclencheur ; l'accès à un autre projet dépend notamment de l'allowlist de ce projet. Ne pas l'afficher, l'archiver ou le transmettre à l'application testée. Voir [CI/CD job token](https://docs.gitlab.com/ci/jobs/ci_job_token/).

La cible doit pouvoir tirer l'image après la fin du pipeline : y installer un **deploy token de projet** limité à `read_registry`, avec expiration et rotation prévues, sans `write_registry`. Voir [Deploy tokens](https://docs.gitlab.com/user/project/deploy_tokens/).

Chaque jeton a son usage : `glrt-` authentifie Runner ; un PAT (personal access token, jeton personnel) agit avec les droits et scopes de son utilisateur ; un deploy token sert aux opérations techniques limitées.

### 4.6. Lire le pipeline sans mémoriser le YAML

[`.gitlab-ci.yml`](#fichier-gitlab-ci-yml) enchaîne les contrôles de code, la construction, la qualification dynamique et l'autorisation humaine. Le script commun détaille chaque contrôle ; une séparation en jobs supplémentaires se décide après mesure.

| Mot-clé | Lecture concrète |
|---|---|
| `stages` / `stage` | Phases de la chaîne / phase d'un job |
| Nom de job | Unité exécutée par un runner, avec statut et journal propres |
| `script` | Commandes dont les codes de sortie décident de la réussite |
| `before_script` | Préparation dans le même shell que `script` : identités et dossiers |
| `after_script` | Shell séparé de finalisation ; pas un mécanisme fiable pour décider du succès |
| `image` / `services` | Conteneur et services des exécuteurs compatibles ; absents du parcours Shell |
| `tags` | Sélection d'un runner qui possède tous les tags demandés |
| `rules` | Existence et mode d'exécution d'un job ; première règle correspondante appliquée |
| `allow_failure` | Autorise éventuellement un échec ; absent ou `false` pour les contrôles obligatoires |
| `retry` | Répétition ciblée ; ici un problème système de runner seulement, jamais une vulnérabilité |
| `timeout` | Borne d'exécution ; plus courte pour le changement distant |
| `interruptible` | Signale les jobs qui peuvent être annulés dans une politique d'annulation |
| `environment` | Identifie le déploiement préproduction et son historique dans GitLab |

Les codes de sortie doivent garder les anomalies bloquantes : `|| true`, `allow_failure: true` ou un mode purement informatif peuvent rendre vert un contrôle défaillant. Les templates fournis n'emploient pas ces contournements pour les contrôles obligatoires. Référence : [CI/CD YAML syntax reference](https://docs.gitlab.com/ci/yaml/).

`workflow: rules` détermine si le pipeline existe. Une MR crée seulement `quality` ; un push, lancement web ou planning sur la branche par défaut **protégée** crée le parcours complet. Les tags et branches de travail sans MR ne déclenchent rien.

Ouvrir une MR pour valider une branche ; planifier la branche par défaut pour rechercher de nouvelles vulnérabilités. Ces règles évitent le doublon push/MR. Voir [workflow keyword](https://docs.gitlab.com/ci/yaml/workflow/).

`needs` relie les jobs et leurs artefacts : `build` attend `quality`, `qualify` attend `build`, puis `promote` attend `qualify`. Sans dépendance, des jobs peuvent tourner en parallèle si des runners sont disponibles.

`dependencies` limite les téléchargements d'artefacts dans un modèle par stages ; ne pas le combiner à `needs` dans le même job. Voir [Make jobs start earlier with needs](https://docs.gitlab.com/ci/yaml/needs/).

Les **artefacts** conservent et transfèrent `reports/` et `evidence/`. `when: always` demande leur publication après un échec ordinaire sans rendre le job vert ; perte de VM, annulation forcée ou timeout peuvent toutefois empêcher la collecte.

Traiter tout rapport manquant. L'expiration prévue est de 30 jours ; vérifier aussi la conservation des artefacts du dernier pipeline réussi dans GitLab. Voir [Job artifacts](https://docs.gitlab.com/ci/jobs/job_artifacts/).

Le **cache** accélère les téléchargements, mais peut manquer, vieillir ou être contaminé. Le laboratoire transmet ses candidates par artefacts et n'en a pas besoin.

Si vous en ajoutez un, séparer MR et branches protégées, inclure empreintes des dépendances et versions d'outils dans sa clé, et exclure toute preuve faisant autorité. Voir [Caching in GitLab CI/CD](https://docs.gitlab.com/ci/caching/).

### 4.7. Exécuter les trois versions fournies

#### Amorcer le verrou des images

Le verrou fixe les images d'outils et l'image de base par digest. Sur un poste Linux de confiance avec Docker et accès aux registres, lire `ci/images.env`, lancer le script, relire le résultat puis le versionner avec le Dockerfile. Le pipeline refuse l'absence de verrou pour éviter de résoudre silencieusement de nouvelles images à chaque job.

```bash
bash ci/lock-images.sh
cat ci/images.lock.env
git diff -- ci/images.env ci/images.lock.env
git add ci/images.lock.env
git commit -m 'Verrouiller les images du laboratoire par digest'
```

Le verrou appartient au code revu ; son actualisation déclenche une nouvelle qualification. Les preuves, elles, se transmettent entre jobs. Pour disposer du réseau Docker attendu, préparer la VM Linux du guide avant de poursuivre depuis un poste Windows.

#### Première version pédagogique

Dans le dépôt privé protégé du laboratoire, copier [l'exemple débutant](#fichier-exemples-gitlab-debutant-yml) à la racine sous `.gitlab-ci.yml`, le relire, le committer puis le pousser. Il affiche identité et outils, puis exécute tous les contrôles de `quality`, sans publier d'image :

```bash
cp exemples/gitlab-debutant.yml .gitlab-ci.yml
git add .gitlab-ci.yml
git commit -m 'Décrire le premier pipeline GitLab'
git push
```

L'administrateur amorce la branche protégée selon sa procédure ; les modifications suivantes passent par MR. Attendre un job vert. S'il reste `pending`, vérifier tag, protection de la référence et état du runner avant de toucher à l'installation.

#### Version complète

Pour la livraison, remplacer l'exemple pédagogique par le `.gitlab-ci.yml` complet de l'annexe et le conserver dans Git. Il contient les quatre jobs suivants :

| Job | Entrée | Traitement | Sortie faisant autorité |
|---|---|---|---|
| `quality` | Code et configuration du commit | Lints, secrets, tests, couverture, SAST, SCA, IaC | `evidence/quality.json` et rapports |
| `build` | Qualité acceptée du même commit | Construction, contrôles d'image, SBOM, publication technique | `evidence/image.env`, rapports d'image et SBOM |
| `qualify` | Image OCI par digest et preuves de build | Pull, environnement temporaire, disponibilité, HTTP, fonctionnel et ZAP baseline, nettoyage | `evidence/candidate.json` et rapports dynamiques |
| `promote` | Candidate acceptée et autorisation humaine | SSH vers la préproduction, déploiement de ce digest, vérification | Preuves de déploiement et historique de l'environnement |

Chaque job reçoit explicitement `reports/` et `evidence/`. Le socle lit `image.env` et vérifie ses identités ; ne pas l'exécuter avec `source evidence/image.env`.

Les scans gardent leur vrai code de sortie. Un contrôle qui ne démarre pas reste un échec technique, même sans vulnérabilité signalée.

Le build publie une **candidate technique** dans le registre restreint. `qualify` teste son digest, puis `promote` déploie ce même digest après autorisation. Toute reconstruction du Dockerfile produit une nouvelle candidate à qualifier, même au même commit.

`qualify` crée puis supprime le réseau et l'application de test dans **un seul job**. Les noms incluent l'identité du run ; les `trap` collectent les journaux et nettoient après succès ou échec ordinaire. Aucun job suivant ne doit dépendre de cet état local ; une VM perdue exige un nettoyage d'exploitation.

#### Version modulaire

Remplacer le YAML principal par [l'exemple modulaire](#fichier-exemples-gitlab-modulaire-yml) pour conserver contrôles et dépendances. Il inclut [base.yml](#fichier-ci-gitlab-base-yml), [quality.yml](#fichier-ci-gitlab-quality-yml) et [delivery.yml](#fichier-ci-gitlab-delivery-yml), liés au même commit du projet.

`include` charge des fichiers ; `extends` reprend le job caché `.lab-job`. Les tables fusionnent, mais les listes `script` ou `rules` sont remplacées : une surcharge peut supprimer un contrôle.

Pour un template interprojet, protéger son dépôt et fixer `ref` à un commit revu. Voir [Use CI/CD configuration from other files](https://docs.gitlab.com/ci/yaml/includes/).

Toute modification de politique exige revue et exception documentée : propriétaire, motif, périmètre, échéance et réexamen. Aucun paramètre `SKIP_SECURITY` n'est fourni.

### 4.8. Autoriser la promotion et protéger la cible

L'autorisation de préproduction se règle hors YAML, sur l'environnement `preproduction`. Les **protected environments** et **deployment approvals** consultés nécessitent **Premium/Ultimate**. En Free, le job manuel existe, mais son bouton seul n'impose pas d'approbation indépendante. Voir [Protected environments](https://docs.gitlab.com/ci/environments/protected_environments/) et [Deployment approvals](https://docs.gitlab.com/ci/environments/deployment_approvals/).

En laboratoire Free, le responsable consigne sa décision dans le dossier de changement avant de lancer le job. Pour imposer techniquement une séparation des rôles, isoler le déploiement dans un projet restreint ou employer un orchestrateur doté de ce contrôle ; le YAML fourni ne suffit pas seul.

Avant `promote`, l'approbateur examine commit relu, rapports complets, pipeline attendu, digest, fraîcheur, exceptions valides, cible disponible et image de retour arrière validée. Rattacher la décision au pipeline et au digest ; refuser les preuves ou bases de vulnérabilités devenues trop anciennes selon la politique d'équipe.

`when: manual` avec `allow_failure: false` bloque la livraison jusqu'à décision. `resource_group: preproduction` sérialise les déploiements de ce projet, mais pas ceux d'autres projets ni les actions SSH d'un administrateur.

Tous les chemins de changement doivent partager un verrou sur la cible et empêcher le passage tardif d'un ancien pipeline après un plus récent. Voir [Resource group](https://docs.gitlab.com/ci/resource_groups/).

Préparer la cible et sa commande restreinte selon le guide commun, installer son identité de lecture du registre, puis renseigner les variables File. Vérifier la clé d'hôte par un canal administrateur indépendant : `ssh-keyscan` seul ne prouve pas l'identité d'une cible inconnue.

La clé CI doit autoriser uniquement la commande de déploiement prévue. Vérifier les restrictions réellement installées sur la cible.

### 4.9. Retour arrière contrôlé

Le retour arrière déploie le digest `repo@sha256:...` d'une **ancienne candidate validée**, avec ses preuves et identifiants d'origine récupérés par le canal approuvé. Il constitue un nouveau changement. Vérifier d'abord migrations de données, contrats d'API et configuration : revenir à l'image peut être insuffisant ou impossible.

Identifier l'incident, autoriser le retour, suspendre les changements concurrents et obtenir le verrou de la cible. Sur un poste de confiance doté des accès SSH restreints, préparer un checkout propre de l'ancien commit : `ci/run.sh` refuse si `HEAD` diffère de `SOURCE_SHA`.

Importer les dossiers **complets** `reports/` et `evidence/` du même paquet, dont `evidence/image.env` ; un `candidate.json` externe seul ne suffit pas. Les variables `PREPROD_SSH_KEY` et `PREPROD_KNOWN_HOSTS` désignent ici des chemins locaux protégés :

```bash
# Choisir les valeurs dans la preuve de l'ancienne candidate, pas dans le pipeline courant.
export SOURCE_SHA='SHA_GIT_DE_LA_CANDIDATE_VALIDEE'
export RUN_ID='ID_PIPELINE_DE_LA_CANDIDATE_VALIDEE'
export ROLLBACK_IMAGE_REF='registry.example.net/equipe/demo@sha256:DIGEST_VALIDE'
export ROLLBACK_EVIDENCE='evidence/candidate.json'
export PREPROD_HOST='preprod.example.net'
export PREPROD_USER='deploy'
export PREPROD_SSH_KEY='/chemin/protege/deploy_ed25519'
export PREPROD_KNOWN_HOSTS='/chemin/protege/known_hosts'
bash ci/run.sh rollback
```

Remplacer les valeurs en majuscules par celles de l'ancienne candidate. Le script doit refuser tout digest ou preuve incohérent ; les preuves sont limitées à **72 heures**. Au-delà, requalifier puis réapprouver l'image sans modifier l'horodatage JSON.

Le paquet doit inclure les rapports référencés. Les empreintes détectent les incohérences, mais la confiance repose aussi sur le canal d'archivage et, si exigée, sa signature.

Après déploiement, relever le digest actif, vérifier santé et fonctions métier, joindre les preuves à l'incident, puis reprendre les changements. Ouvrir une analyse de problème si nécessaire.

### 4.10. Entretenir Runner et diagnostiquer

Pour mettre à jour Runner, le mettre en pause et laisser finir les jobs, puis sauvegarder sa configuration protégée. Dans la fenêtre de changement, installer le nouveau couple de paquets avec les commandes APT précédentes, relever les versions avant/après et relancer le service.

Avant de rouvrir le trafic, rejouer le premier job puis la qualification. Examiner le nettoyage automatique des images et préserver la recette ; ne jamais purger un démon partagé pendant une exécution.

```bash
# Inventaire non destructif avant entretien.
sudo systemctl status gitlab-runner --no-pager
sudo gitlab-runner list
docker system df
df -h
sudo journalctl -u gitlab-runner --since '1 hour ago' --no-pager

# Après pause et drainage, retirer CE manager local par son nom.
sudo gitlab-runner unregister --name 'lab-trusted-shell-01'
sudo gitlab-runner list
```

Le désenregistrement local ne supprime pas toujours l'objet GitLab : son effet dépend du mode de création. Avec le workflow moderne, vérifier puis supprimer aussi l'objet runner et son jeton s'ils ne servent plus. Voir [GitLab Runner commands](https://docs.gitlab.com/runner/commands/).

En cas de compromission, révoquer immédiatement le jeton, reconstruire la VM suspecte et examiner les autres secrets auxquels elle avait accès.

| Symptôme | Causes possibles | Diagnostic | Correction | Vérification |
|---|---|---|---|---|
| Runner hors ligne | Service arrêté, DNS, certificat, jeton révoqué | `systemctl status`, `journalctl`, `gitlab-runner verify`, `curl --head` | Réparer réseau/CA, renouveler identité si nécessaire, redémarrer | `verify` puis premier job |
| Job `pending` | Mauvais tag, runner protégé, capacité occupée | Lire tags du job et du runner, référence et file | Corriger rattachement et protection ; ajouter capacité après mesure | Job affecté au pool attendu |
| `permission denied` Docker | Groupe non repris par service, socket incorrect | `sudo -u gitlab-runner -H id`, `docker version` sous cette identité | Ajouter groupe seulement sur VM dédiée et redémarrer le service | Client ET serveur Docker visibles |
| `unauthorized` registre | Registre désactivé, mauvais chemin, jeton expiré | Vérifier les variables sans afficher le mot de passe et les droits du projet | Utiliser identité du job pour ce registre ou jeton externe limité | Nouveau build/pull authentifié |
| Artefact absent | Échec précoce, mauvais chemin, expiration, timeout | Journal d'upload, onglet artefacts, `needs` | Corriger le chemin ou l'outil ; relancer le contrôle, ne pas inventer la preuve | Fichier lisible et décision encore bloquante si absent |
| Application non joignable par ZAP | Mauvais réseau, port ou délai de disponibilité | Journaux application, inspection du réseau du job et test HTTP | Corriger nom DNS interne, port et démarrage ; garder le même périmètre | Tests HTTP puis rapport ZAP sur URL attendue |
| Promotion SSH refusée | Mauvaise clé, fichier mal formé, clé d'hôte différente, commande restreinte | Erreur SSH, journal cible via administrateur, portée des variables | Revalider identité de cible et compte ; corriger commande autorisée | Promotion sur cible et digest attendus |
| Scanner en erreur | Téléchargement DB, quota, options incompatibles, mémoire | Rapport outil, code de sortie et métriques de VM | Corriger disponibilité/version/ressources ; ne pas baisser le seuil pour contourner | Outil terminé, rapport complet et résultat explicite |

### 4.11. Recette et preuves de compétence

Valider le YAML dans **Build > Pipeline editor > Validate**, puis simuler la branche par défaut pour contrôler notamment les interactions `rules`/`needs`. Cette simulation ne lance ni Docker ni SSH : réaliser ensuite les essais ci-dessous. Voir [Validate GitLab CI/CD configuration](https://docs.gitlab.com/ci/yaml/lint/).

| Essai | Résultat attendu | Preuve à conserver |
|---|---|---|
| Commit de départ sur branche protégée | `quality`, `build`, `qualify` verts ; `promote` attend | URL pipeline, SHA, candidate et digest |
| MR depuis branche non protégée | Seulement qualité, sur pool isolé ; aucun secret préprod | Graphe et identité du runner |
| Erreur volontaire de test dans un dépôt de formation | `quality` rouge, aucun build ni promote | JUnit et journal ; ne pas introduire un vrai secret |
| Artefact de qualité retiré dans un essai local | Build refusé | Code de sortie et message de preuve absente |
| Digest volontairement incohérent dans un essai local | Qualification/promotion refusée | Message de rejet et absence de changement distant |
| Candidate saine approuvée | Déploiement du digest testé | Identité de décision, historique environnement, santé |
| Deux demandes de promotion simultanées | Attente sur même ressource, pas de mutation concurrente | Ordre de passage et journal de verrouillage |
| Retour à une candidate approuvée | Ancien digest actif, fonctions vérifiées | Rapport de retour arrière, références de l'incident |
| Annulation pendant qualification | Nettoyage normal ou résidus identifiés et traités | Inventaire Docker avant/après |
| YAML modulaire | Même graphe et mêmes décisions que la version complète | Validation GitLab et essai contrôlé |

**À recetter sur vos machines :** enregistrement Runner, droits réels, fonctions Premium/Ultimate, téléchargements, construction OCI, scans et déploiement SSH. La revue locale et la documentation ne prouvent pas ces résultats ; ne les déclarer exécutés que si le rapport global les confirme.

**Appliquer ITIL 5 et CALMS à ce pipeline.** Les rappels d’ITIL 4 du [chapitre 2](#itil-calm) aident à lire les décisions derrière les jobs. `quality` vérifie le code et conserve ses rapports ; `build` construit l’image et son digest ; `qualify` teste ce digest et produit `evidence/candidate.json` ; `promote` déploie la candidate autorisée en préproduction. La gestion des configurations permet de retrouver ce qui a été testé ; la maîtrise du changement précise qui peut l’autoriser.

**Exemple à reproduire :** avant `promote`, relier le dossier de changement à la MR, au commit, à l’URL du pipeline, au digest et aux rapports. Y inscrire le risque, la catégorie du changement, le décideur, sa décision datée et le plan de rétablissement. Après le déploiement, ajouter le résultat constaté. Le pipeline fournit les preuves ; l’équipe tient ce dossier et vérifie les permissions réelles. Un bouton manuel ne démontre pas à lui seul une séparation des rôles.

Les cinq piliers CALMS deviennent observables : la revue partagée montre la **Culture** ; les quatre jobs, l’**Automation** ; une attente mesurée puis réduite, **Lean** ; les durées et échecs observés, **Measurement** ; les rapports et le runbook accessibles, **Sharing**. Ces mesures concernent le laboratoire et la préproduction ; le [chapitre 7](#exploitation) distingue leur portée de celle des mesures DORA de production.

Pour l’administration, une mise à jour répétitive de Runner peut devenir un changement standard après qualification de sa procédure. Une ouverture de droits ou une nouvelle architecture demande une évaluation adaptée au risque.

<a id="azure"></a>

<a id="parcours-azure-devops--de-la-vm-à-une-préproduction-contrôlée"></a>

## 5. Parcours Azure DevOps : de la VM à la préproduction

Ce parcours construit, qualifie puis déploie une image par digest (empreinte immuable) dans une préproduction contrôlée. Il cible Azure DevOps **Services**, avec une VM Linux amd64 pour l'agent et une autre pour la préproduction. Le pipeline [azure-pipelines.yml](#fichier-azure-pipelines-yml) utilise les scripts et règles applicatives communs au parcours GitLab.

**Référence de rédaction : 20 octobre 2026.** Les adaptations Azure DevOps Server figurent en fin de chapitre.

Pour débuter, suivre les sections 5.1 à 5.8 puis les exercices de validation. Pour administrer la chaîne, consulter installation, contrôles hors YAML et fiches d'exploitation. Les templates (modèles YAML réutilisables) sous `ci/azure/` constituent la référence exécutable.

<a id="sommaire-1"></a>

### Naviguer dans le parcours Azure

1. [Architecture et vocabulaire](#1-architecture-et-vocabulaire)
2. [Préparer le projet et ses protections](#2-préparer-le-projet-et-ses-protections)
3. [Installer un agent Linux](#3-installer-un-agent-linux)
4. [Configurer variables, secrets et préproduction](#4-configurer-variables-secrets-et-préproduction)
5. [Lire la syntaxe Azure Pipelines](#5-lire-la-syntaxe-azure-pipelines)
6. [Comprendre le pipeline complet](#6-comprendre-le-pipeline-complet)
7. [Réutiliser les templates](#7-réutiliser-les-templates)
8. [Faire un premier passage et prouver les blocages](#8-faire-un-premier-passage-et-prouver-les-blocages)
9. [Exploiter, diagnostiquer et améliorer](#9-exploiter-diagnostiquer-et-améliorer)
10. [Adapter à Azure DevOps Server](#10-adapter-à-azure-devops-server)
11. [Sources et limites de validation](#11-sources-et-limites-de-validation)

<a id="1-architecture-et-vocabulaire"></a>

### 5.1. Architecture et vocabulaire

Azure Pipelines planifie les opérations ; l'agent les exécute. L'organisation administre les projets, chaque projet regroupe dépôts, pipelines et permissions. La préproduction exige à la fois des contrôles techniques réussis et une autorisation sur les ressources.

| Élément | Définition pratique | Exemple dans ce dépôt |
|---|---|---|
| Organisation | Périmètre Azure DevOps regroupant projets et administration | `https://dev.azure.com/mon-organisation` |
| Projet | Espace de travail et de permissions d'une équipe | `Formation-DevSecOps` |
| Dépôt | Historique Git du code et de l'automatisation | Application, Dockerfile, scripts et YAML |
| Pipeline | Définition versionnée, puis ses exécutions | `azure-pipelines.yml` et run `Build.BuildId` |
| Pool | File d'agents autorisés à recevoir certains jobs | `CI-Linux-Trusted` |
| Agent | Processus qui reçoit un job et en exécute les étapes | Service Linux du compte `azagent` |
| Stage | Ensemble logique avec dépendances et contrôles d'accès | `Quality`, `Build`, `Qualify`, `Preproduction` |
| Job | Unité affectée à un agent | `Qualify` possède son environnement de test éphémère |
| Step / task | Commande ou composant versionné dans un job | `bash`, `PublishTestResults@2` |
| Connexion de service | Ressource d'authentification vers un système externe | Alternative possible pour ACR, Azure ou SSH |
| Environnement | Ressource Azure d'historique et de contrôle de déploiement | `preproduction` |
| Pipeline Artifact | Fichiers conservés pour une exécution | `qualify-reports`, `qualify-evidence` |
| Azure Artifacts | Service de dépôts de paquets, avec ses feeds | NuGet, npm ou Python ; non utilisé ici |
| Registre OCI (Open Container Initiative) | Stockage des images identifiées par nom et digest | `registry.example.net/equipe/demo@sha256:…` |

Un agent par VM dédiée évite de partager l'hôte avec une application ou un autre projet. La VM reste persistante : mémoire, disque et démon Docker peuvent conserver des traces entre jobs. Les fichiers utiles passent donc par des artefacts explicites, car le job suivant peut recevoir un autre agent. [Référence Microsoft sur les agents](https://learn.microsoft.com/en-us/azure/devops/pipelines/agents/agents?view=azure-devops).

**Objectif :** distinguer l’orchestration Azure, l’exécution sur agent et les contrôles de préproduction configurés hors du YAML.

| Composant | Action ou accès | Résultat |
|---|---|---|
| Dépôt et Azure Pipelines | Identifier code/SHA et planifier les stages | Exécution du code revu sur `main` protégé |
| Pool et agent Linux dédié | Affecter le job autorisé puis exécuter Bash et Docker sur la VM | Calcul réservé au code de confiance |
| Jobs `Quality`, `Build`, `Qualify` | Contrôler le code, construire une image, puis la tester avec HTTP et ZAP | Candidate complète issue du même run |
| Registre OCI privé | Conserver l’image et permettre ses pulls exacts | Digest partagé par test et préproduction |
| Pipeline Artifacts | Publier puis télécharger rapports et manifestes identifiés par run | Transfert explicite des preuves entre jobs |
| Environment `preproduction` | Appliquer hors YAML approbation, Branch control et verrou | Accès au déploiement contrôlé par la ressource |
| Stage `Preproduction` et VM cible | Déployer par SSH vérifié ; pull cible avec une identité de lecture | Même digest exécuté et état observé |

**Lecture :** l’Environment est une ressource logique de contrôle ; l’application tourne sur la VM distante, sans agent de déploiement installé sur cette cible dans ce scénario.

Bash et le client Docker tournent sur la VM ; les scripts lancent les conteneurs d'analyse et de test, sans propriété `container:` ni Docker-in-Docker. L'environnement Azure `preproduction` est une ressource logique de contrôle et d'historique. Le déploiement utilise SSH, sans agent installé sur la cible.

**Pool réservé au code de confiance :** le compte `azagent`, membre de `docker`, peut obtenir des droits équivalents à root sur sa VM. La capacité `DockerTrusted=true` et les contrôles après checkout ne bloquent pas du code hostile.

N'y exécuter que les contributions relues sur `main`. Les PR (pull requests, demandes de fusion) non fiables nécessitent un autre pool éphémère, sans secret, avec sa propre politique.

<a id="2-préparer-le-projet-et-ses-protections"></a>

### 5.2. Préparer le projet et ses protections

<a id="21-créer-les-ressources-dans-un-ordre-reproductible"></a>

#### 5.2.1. Créer les ressources dans un ordre reproductible

1. Créer un projet privé et un dépôt Azure Repos, ou raccorder un dépôt GitHub autorisé. Créer dans le dépôt les fichiers de l’annexe du code dans le dépôt et conserver les fins de ligne LF pour Bash.
2. Créer la branche `main`. Exiger une PR, un relecteur indépendant adapté au risque, la résolution des discussions et l'interdiction des pushes directs usuels. Protéger aussi `ci/`, le Dockerfile, les règles des analyseurs et les templates.
3. Dans **Organization settings → Agent pools**, créer `CI-Linux-Trusted`, puis autoriser son utilisation au projet voulu. Sous **Pipeline permissions**, autoriser individuellement le pipeline ; éviter l'accès ouvert à tous les pipelines.
4. Créer les groupes de variables et fichiers sécurisés de la section 5.4. Précréer **Pipelines → Environments → preproduction** et ses contrôles avant le premier lancement complet.
5. Dans **Pipelines → New pipeline**, choisir le dépôt puis **Existing Azure Pipelines YAML file**, branche `main`, chemin `/azure-pipelines.yml`. Enregistrer. La première exécution peut attendre l'autorisation explicite de chaque ressource ; l'administrateur examine son identité avant de l'accorder.
6. Restreindre **Edit pipeline**, **Queue builds**, les permissions sur les ressources protégées et les dérogations aux politiques de branche. Activer la limitation du jeton de job au projet et la protection d'accès aux dépôts YAML dans les réglages Pipelines.

Limiter chaque ressource au pipeline et aux personnes nécessaires. Une modification du YAML dans une branche libre ne doit pas donner accès au pool, aux secrets ou à l'environnement protégés. [Sécurité des ressources Azure Pipelines](https://learn.microsoft.com/en-us/azure/devops/pipelines/security/resources?view=azure-devops).

<a id="22-azure-repos-et-github--deux-mécanismes-de-pr"></a>

#### 5.2.2. Azure Repos et GitHub : deux mécanismes de PR

| Dépôt | Déclenchement après merge | Validation de PR avant merge |
|---|---|---|
| Azure Repos Git | `trigger.branches.include: [main]` | **Repos → Branches → main → Branch policies → Build validation** ; rattacher un pipeline de validation isolé |
| GitHub | `trigger` sur `main` avec intégration Azure Pipelines autorisée | Un pipeline distinct peut avoir `pr: { branches: { include: [main] } }` ; rendre son statut obligatoire dans les règles GitHub |

Avec Azure Repos, la validation de PR se configure dans les **branch policies**, pas avec `pr:`. Avec GitHub, limiter l'application ou la connexion au dépôt requis et vérifier les réglages des forks.

Une validation de PR peut tester un commit de fusion : son SHA diffère alors du dernier commit source. [Azure Repos et PR](https://learn.microsoft.com/en-us/azure/devops/pipelines/repos/azure-repos-git?view=azure-devops), [intégration GitHub](https://learn.microsoft.com/en-us/azure/devops/pipelines/repos/github?view=azure-devops).

Le pipeline de livraison fourni utilise `pr: none` et accepte seulement les raisons CI et manuelle sur `main`. Le YAML pédagogique est lui aussi réservé au code de confiance.

Comme un auteur peut modifier le YAML de sa branche, configurer **Branch control** sur les ressources protégées : seulement `refs/heads/main`, branche protégée exigée, état inconnu refusé. Vérifier aussi les déclencheurs réellement appliqués dans l'interface.

Le pipeline PR distinct doit utiliser une VM jetable, des droits limités au dépôt et aucun accès au registre privé, à la préproduction ou au réseau interne.

<a id="23-préparer-le-flux-réseau"></a>

#### 5.2.3. Préparer le flux réseau

L'agent contacte Azure DevOps en sortie ; aucun port entrant « Azure agent » n'est nécessaire. Prévoir DNS, heure synchronisée et HTTPS vers organisation, téléchargements, artefacts, registres et bases de vulnérabilités, puis SSH vers la seule préproduction.

Les destinations dépendent de l'organisation et de la région : maintenir le pare-feu à partir de la [liste Microsoft des URL et connexions](https://learn.microsoft.com/en-us/azure/devops/organizations/security/allow-list-ip-url?view=azure-devops).

```bash
# Sur la future VM agent : vérifier la route TLS avant l'installation.
getent ahosts dev.azure.com
curl --head --fail --show-error https://dev.azure.com/
timedatectl status
```

**Attendu :** DNS résolu, réponse acceptée par `curl`, heure synchronisée. Si un proxy intercepte TLS, installer l'autorité d'entreprise approuvée dans le système et, si nécessaire, Docker. Refaire `curl` puis un pull d'image d'analyse, sans désactiver la validation TLS.

<a id="3-installer-un-agent-linux"></a>

### 5.3. Installer un agent Linux

<a id="31-choisir-une-version-réellement-prise-en-charge"></a>

#### 5.3.1. Choisir une version réellement prise en charge

Le choix documenté au **20 octobre 2026** est l'agent **5.280.0**, publication stable du 14 octobre 2026. La version **5.281.0**, présentée comme préversion, n'est pas retenue.

La page Linux décrit encore 4.x/.NET 8, mais la page v4 annonce la fin des nouvelles versions et recommande **5.x/.NET 10**. La matrice v5 inclut Debian 12 et Ubuntu 24.04 en x64. Sources : [Linux](https://learn.microsoft.com/en-us/azure/devops/pipelines/agents/linux-agent?view=azure-devops), [transition v4](https://learn.microsoft.com/en-us/azure/devops/pipelines/agents/v4-agent?view=azure-devops), [matrice v5](https://learn.microsoft.com/en-us/azure/devops/pipelines/agents/v5-agent?view=azure-devops), [release stable et empreintes](https://github.com/microsoft/azure-pipelines-agent/releases/tag/v5.280.0).

Le runtime embarqué par l'agent est indépendant du langage applicatif. La publication de couverture exige un autre prérequis .NET, préparé par `UseDotNet@2`.

Avant une mise à jour, vérifier distribution, architecture et tâches. Pour Server, valider la matrice de votre version et de ses correctifs avant de remplacer l'agent livré.

| Élément | Choix de démonstration | Vérification locale |
|---|---|---|
| OS agent | Ubuntu 24.04 LTS ou Debian 12 | `. /etc/os-release; printf '%s %s\n' "$ID" "$VERSION_ID"` |
| Architecture | x86_64 / amd64 | `uname -m; dpkg --print-architecture` |
| Agent | Linux x64 `5.280.0` | `./bin/Agent.Listener --version` |
| Exécution | systemd, compte `azagent`, un agent par VM | `sudo ./svc.sh status` |
| Construction | Docker Engine de l'hôte et CLI/buildx | `docker version; docker buildx version` |
| Outils hôte | Bash, Git, curl, Python 3, OpenSSH client | `bash --version; git --version; python3 --version; ssh -V` |
| Capacité de départ | 4 vCPU, 8 Gio RAM, 60 Gio SSD libres | Recommandation de laboratoire à mesurer sous charge |

<a id="32-préparer-la-vm-et-le-compte"></a>

#### 5.3.2. Préparer la VM et le compte

Pour ces opérations d’installation, ouvrir d’abord un shell administrateur avec `sudo -i`. Les passages par `sudo -iu azagent` ouvrent ensuite la session du compte de service ; `exit` ramène au shell root. Ce contexte permet de traverser ses répertoires privés lors de l’installation du service et de la maintenance. Quitter le shell root après ces opérations.

Le compte de service `azagent` possède les fichiers et exécute les jobs avec une identité distincte de l'administrateur. Avant sa création, disposer d'un OS compatible, d'un accès administratif ponctuel, de Docker installé selon le chapitre commun et du pool déjà créé.

```bash
# Administrateur de la VM : outils hôte utilisés par le socle commun.
sudo apt-get update
sudo apt-get install -y ca-certificates curl git jq tar gzip \
  openssh-client python3 python3-venv

# Pas de mot de passe interactif pour ce compte ; répertoire non public.
sudo adduser --disabled-password --gecos '' --home /srv/azagent azagent
sudo chmod 0750 /srv/azagent

# Seulement sur cette VM dédiée au code de confiance.
# Le groupe docker équivaut à un accès privilégié à l'hôte.
sudo usermod -aG docker azagent
sudo -iu azagent
```

`sudo -iu azagent` ouvre le shell du compte de service et recharge ses groupes. Vérifier que `id` affiche `docker` et que `docker info` joint le démon sans sudo. En cas d'erreur de socket, corriger les groupes puis redémarrer le service ; ne pas ouvrir le socket avec `chmod 666`.

<a id="33-télécharger-avec-contrôle-dintégrité"></a>

#### 5.3.3. Télécharger avec contrôle d'intégrité

Télécharger depuis le shell `azagent` ouvert précédemment. L'empreinte fournie correspond uniquement à l'archive **vsts-agent Linux x64 5.280.0**, pas à `pipelines-agent`, ARM64 ou une autre version :

```bash
umask 077
mkdir -p /srv/azagent/agent
cd /srv/azagent/agent

AGENT_VERSION=5.280.0
AGENT_ARCHIVE="vsts-agent-linux-x64-${AGENT_VERSION}.tar.gz"
AGENT_SHA256=f0daf1ce526af0b5eebf420249d21689de10faf00ffb0f19851626eb4352d791
curl --fail --show-error --location --proto '=https' --tlsv1.2 \
  "https://download.agent.dev.azure.com/agent/${AGENT_VERSION}/${AGENT_ARCHIVE}" \
  --output "$AGENT_ARCHIVE"

printf '%s  %s\n' "$AGENT_SHA256" "$AGENT_ARCHIVE" | sha256sum --check --strict -
# Décompresser UNIQUEMENT si la commande précédente a affiché OK.
tar -xzf "$AGENT_ARCHIVE"
./bin/Agent.Listener --version
```

**Attendu :** empreinte `OK`, puis version `5.280.0`. Une somme différente ou une page HTML de proxy impose l'arrêt : supprimer uniquement l'archive concernée, faire vérifier URL, proxy et empreinte source, puis retélécharger et refaire `sha256sum --check`.

Ne jamais remplacer l'empreinte attendue par celle du fichier douteux. Source : [release Microsoft v5.280.0](https://github.com/microsoft/azure-pipelines-agent/releases/tag/v5.280.0).

Exécuter `tar` seulement après le succès du contrôle d'empreinte. Pour automatiser le bloc, commencer le script par `set -euo pipefail` afin d'arrêter sur erreur.

<a id="34-dépendances-et-enregistrement"></a>

#### 5.3.4. Dépendances et enregistrement

L'installateur de dépendances prépare les paquets système de l'agent. Avant de l'exécuter comme administrateur, lire le script inclus dans l'archive vérifiée et contrôler les dépôts qu'il contacte.

```bash
# Dans le shell azagent : lire, puis revenir au compte administrateur.
less /srv/azagent/agent/bin/installdependencies.sh
exit

# Administrateur : le script doit provenir de l'archive dont l'empreinte a été validée.
sudo /srv/azagent/agent/bin/installdependencies.sh

# Revenir au compte non root ; config.sh ne s'exécute pas en root.
sudo -iu azagent
cd /srv/azagent/agent
./config.sh
```

Pour `./config.sh`, préparer : URL `https://dev.azure.com/ORGANISATION`, authentification PAT, pool `CI-Linux-Trusted`, nom `ci-linux-01` et dossier `_work`.

Le PAT (personal access token, jeton personnel) d'inscription doit être court, limité à **Agent Pools: Read & manage** et appartenir à une personne autorisée à administrer ce pool. Le saisir dans l'invite masquée, hors historique, YAML et dépôt.

Ce PAT inscrit l'agent ; il ne publie pas les images OCI. Le compte Linux de service n'a pas besoin du rôle administrateur du pool. [Enregistrement avec un PAT](https://learn.microsoft.com/en-us/azure/devops/pipelines/agents/personal-access-token-agent-registration?view=azure-devops).

**Attendu :** agent enregistré et visible dans le pool. En cas de `401/403` ou de pool introuvable, vérifier URL d'organisation, nom du pool, scope et droit d'inscription avec le propriétaire du PAT. Corriger le minimum nécessaire, puis relancer `./config.sh` si l'inscription n'a pas abouti.

Protéger `.credentials*`, `.agent`, `_diag` et `_work` ; ne pas les publier comme rapports ni élargir le jeton de build à toute l'organisation.

<a id="35-installer-le-service-et-déclarer-les-capacités"></a>

#### 5.3.5. Installer le service et déclarer les capacités

```bash
# Quitter le shell azagent et revenir à l'administrateur.
exit
cd /srv/azagent/agent
sudo ./svc.sh install azagent
sudo ./svc.sh start
sudo ./svc.sh status

# Vérification des outils sous l'identité d'exécution, sans lancer le job en root.
sudo -u azagent -H bash -c 'id; docker info; git --version; python3 --version'
```

Après validation de Docker et de l'affectation de la VM, ajouter `DockerTrusted=true` dans **Agent pools → CI-Linux-Trusted → Agents → ci-linux-01 → Capabilities**. Le YAML exige `Agent.OS -equals Linux` et `DockerTrusted -equals true`.

Une capacité est une déclaration, pas une permission ni un test du démon. Vérifier version de l'agent, état **Online** et accès Docker réel. [Capacités et exigences](https://learn.microsoft.com/en-us/azure/devops/pipelines/agents/agents?view=azure-devops).

Lancer manuellement le [premier pipeline pédagogique](#fichier-exemples-azure-debutant-yml) sur `main`. Son SHA, ses contrôles Docker et ses tests sans secret vérifient les outils et le réseau des jobs, au-delà du seul enregistrement.

<a id="36-maintenance-et-retrait"></a>

#### 5.3.6. Maintenance et retrait

Tester d'abord la mise à jour sur un agent de validation. Pour l'appliquer, rendre l'agent indisponible dans le pool, laisser finir le job, relever version et durées habituelles, puis suivre la procédure approuvée par le propriétaire du service.

Avant remise en exploitation, rejouer pipeline pédagogique, téléchargements d'artefacts et qualification. Maintenir séparément VM, Docker, bases de vulnérabilités et tâches.

```bash
cd /srv/azagent/agent
sudo ./svc.sh stop
# Après changement de PATH/outillage, actualiser l'environnement du compte :
sudo -u azagent -H ./env.sh
sudo ./svc.sh start
sudo ./svc.sh status
```

Pour retirer l'agent, le désactiver dans le pool et attendre la fin du job. Arrêter et désinstaller le service, puis désenregistrer sous `azagent` avec les commandes suivantes. Conserver seulement les journaux nécessaires, révoquer les accès machine et traiter les secrets locaux selon la procédure de retrait de VM.

```bash
cd /srv/azagent/agent
sudo ./svc.sh stop
sudo ./svc.sh uninstall
sudo -iu azagent
cd /srv/azagent/agent
./config.sh remove
```

**Attendu :** service absent et agent retiré du pool. Si deux VM partagent un nom après clonage, retirer l'ancien enregistrement puis inscrire chaque VM avec un nom propre ; ne pas cloner les credentials. Vérifier qu'une seule identité attend les jobs. [Gestion du service Linux](https://learn.microsoft.com/en-us/azure/devops/pipelines/agents/linux-agent?view=azure-devops).

<a id="4-configurer-variables-secrets-et-préproduction"></a>

### 5.4. Configurer variables, secrets et préproduction

<a id="41-inventaire-des-paramètres-de-plateforme"></a>

#### 5.4.1. Inventaire des paramètres de plateforme

Créer trois groupes dans **Pipelines → Library → Variable groups** et les autoriser pour ce pipeline. `cicd-config` reste sans secret ; `cicd-registry` est chargé seulement dans `Build` et `Qualify` ; `cicd-preproduction` est réservé au dernier stage.

| Paramètre | Type / valeur initiale | Obligatoire | Emplacement et portée | Sensibilité |
|---|---|---|---|---|
| `IMAGE_REPOSITORY` | Chaîne sans tag : `registry.example.net/equipe/demo` | Oui pour la chaîne complète | Groupe `cicd-config`, global | Interne |
| `REGISTRY_HOST` | Chaîne hôte[:port] : `registry.example.net` ; aucun schéma HTTPS | Oui pour build/qualification | Groupe `cicd-config`, global | Interne |
| `REGISTRY_USER` | Chaîne compte robot de publication | Oui | Groupe `cicd-registry`, stages image | Identité technique |
| `REGISTRY_PASSWORD` | Secret à droit pull/push sur ce seul dépôt | Oui | Groupe `cicd-registry`, champ secret | Secret |
| `PREPROD_HOST` | Nom DNS stable de la VM cible | Oui | Groupe `cicd-preproduction`, dernier stage | Interne |
| `PREPROD_USER` | Chaîne `deploy`, à créer sur la cible | Oui | Groupe `cicd-preproduction` | Identité technique |
| `preproduction_ed25519` | Nom de fichier sécurisé : clé privée SSH dédiée | Oui | Library → Secure files, téléchargement dernier stage | Secret |
| `preproduction_known_hosts` | Nom de fichier sécurisé : clés d'hôte validées | Oui | Library → Secure files, dernier stage | Intégrité critique |
| `CI-Linux-Trusted` | Nom du pool ; paramètre `agentPool` dans l'exemple modulaire | Oui | YAML / permissions du pool | Non secret |
| `DockerTrusted` | Capacité chaîne `true` | Oui | Agent → Capabilities, administrateur | Non secret |
| `preproduction` | Nom de l'environnement | Oui | YAML et ressource Azure protégée | Non secret |
| Dossier du projet | Racine du checkout | Oui | Bash par défaut dans `Build.SourcesDirectory` | Non secret |
| Délais jobs | Nombres : 40/50/30/20 minutes | Valeurs fournies | YAML des quatre stages | Non secret |
| Délai d'annulation | Nombre : 5 minutes | Valeur fournie | `cancelTimeoutInMinutes` des jobs | Non secret |
| Rétention | Politique proposée : 30 jours pour runs ordinaires, conservation dédiée des versions déployées | À définir | Project settings → Pipelines → Settings et politique de conservation | Rapports potentiellement sensibles |

Le socle commun fixe contrôles applicatifs, versions d'images et délais de disponibilité. Les quatre appels restent `bash ci/run.sh quality|build|qualify|promote`. Pour changer langage ou tests, modifier et faire relire scripts et critères, sans injecter une commande arbitraire par paramètre Azure.

Injecter chaque secret par `env:` dans la seule étape utile. Éviter `set -x` et l'affichage de `env` ; le masquage ne protège pas contre un script malveillant. Séparer les administrateurs de groupes, fichiers et pool des simples contributeurs. [Variables et secrets Azure](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/variables?view=azure-devops).

<a id="42-créer-la-préproduction-ssh"></a>

#### 5.4.2. Créer la préproduction SSH

La VM de préproduction doit exécuter une procédure de déploiement restreinte. Installer Docker et les outils requis par [le script distant](#fichier-ci-deploy-remote-sh), puis [ops/preproduction.sh](#fichier-ops-preproduction-sh) comme procédure root revue `/usr/local/sbin/cicd-preproduction`.

Le compte SSH `deploy` reste hors du groupe Docker. Son sudoers n'autorise que cette procédure et ses paramètres validés, sans droit de modifier script ni politiques. Provisionner le mot de passe registre **lecture seule** sous l'identité effective de la procédure root ; le garder hors agent et artefacts. Le chapitre d'exploitation commun détaille les permissions.

Générer la clé SSH sur une station d'administration approuvée, installer la clé publique sur la cible et importer la privée dans les Secure files Azure. Pour `preproduction_known_hosts`, obtenir les clés d'hôte auprès de l'administrateur et comparer leurs empreintes par un canal indépendant.

`ssh-keyscan` collecte une clé annoncée sans l'authentifier. Le fichier doit contenir le nom exact de `PREPROD_HOST` et, si les scripts sont adaptés à un port non standard, la forme `[hôte]:port`.

```bash
# Exemple de contrôle d'empreinte sur la CONSOLE administrateur de la cible.
sudo ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub

# Contrôle depuis un poste d'administration avec les fichiers approuvés.
ssh -o BatchMode=yes -o StrictHostKeyChecking=yes \
  -o UserKnownHostsFile=./preproduction_known_hosts \
  -i ./preproduction_ed25519 deploy@preprod.example.net \
  'id; sudo -n -l'
```

**Attendu :** connexion sans saisie, identité `deploy` et seule commande sudo prévue. Le diagnostic Docker relève de l'administrateur cible.

Si `Host key verification failed` apparaît, confirmer toute reconstruction avec cet administrateur, comparer l'empreinte puis mettre à jour le fichier sécurisé. Refaire le même SSH strict, sans `StrictHostKeyChecking=no`.

`DownloadSecureFile@1` fournit `secureFilePath`, utilisé comme chemin `PREPROD_SSH_KEY` ou `PREPROD_KNOWN_HOSTS`. La tâche prépare les fichiers dès le début du stage et Azure les supprime en fin de job : la placer uniquement dans le stage de déploiement approuvé. [Fichiers sécurisés](https://learn.microsoft.com/en-us/azure/devops/pipelines/library/secure-files?view=azure-devops), [tâche de téléchargement](https://learn.microsoft.com/en-us/azure/devops/pipelines/tasks/reference/download-secure-file-v1?view=azure-pipelines).

Ce scénario utilise un robot de registre et des fichiers SSH dédiés. Si vous adoptez des tâches exigeant une connexion de service Azure ou Docker, limiter celle-ci au périmètre utile et l'autoriser par pipeline ; préférer une identité fédérée au secret permanent lorsque le service le permet.

<a id="43-installer-les-contrôles-hors-yaml"></a>

#### 5.4.3. Installer les contrôles hors YAML

Les contrôles d'accès au déploiement se règlent dans **Pipelines → Environments → preproduction → Approvals and checks** :

1. **Branch control** : seulement `refs/heads/main`, protection de branche exigée, comportement de refus si l'état est inconnu.
2. **Approvals** : groupe responsable de la préproduction, délai de décision adapté à l'équipe, auto-approbation du demandeur désactivée si la séparation des rôles l'exige. Le décideur examine SHA, digest, résultats et changement lié.
3. **Exclusive lock** : empêcher deux déploiements simultanés vers cette cible. Le YAML utilise `lockBehavior: sequential` : chaque run accepté attend son tour.
4. **Pipeline permissions** : autoriser seulement la définition de livraison et, si elle existe, la procédure de retour arrière contrôlée.

Le propriétaire définit les **Approvals and checks hors YAML** : `environment: preproduction` seul ne crée aucune approbation. Utiliser le verrou de la ressource commune pour coordonner toutes les définitions visant la cible ; un verrou propre à un stage ne le remplace pas. [Approbations, Branch control et verrou](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/approvals?view=azure-devops), [schéma stage et lockBehavior](https://learn.microsoft.com/en-us/azure/devops/pipelines/yaml-schema/stages-stage?view=azure-pipelines).

Appliquer aussi restrictions de branche et permissions au pool, aux groupes secrets et aux fichiers sécurisés. Vérifier qui peut contourner les checks et tracer toute dérogation. L'approbateur doit examiner les preuves avant sa décision.

Le laboratoire conserve une décision humaine traçable pour la préproduction. Une équipe peut ensuite préautoriser des changements répétitifs à risque connu, après qualification de leur procédure. Les pratiques ITIL et les piliers CALMS de la section exploitation relient cette décision aux résultats et aux responsabilités.

<a id="5-lire-la-syntaxe-azure-pipelines"></a>

### 5.5. Lire la syntaxe Azure Pipelines

<a id="51-structure-et-exécution"></a>

#### 5.5.1. Structure et exécution

| Construction | Rôle | Lecture dans le fichier fourni |
|---|---|---|
| `trigger` | Déclenchements CI par branche/chemin | Push sur `main`, `batch: true` regroupe l'attente pendant un run |
| `pr` | Déclenchement PR pour les fournisseurs compatibles | `none` dans la définition de livraison |
| `pool` + `demands` | Choix d'un agent admissible | Linux et capacité Docker de confiance |
| `stages` / `jobs` / `steps` | Organisation du travail | Stage logique → job affecté → commandes successives |
| `bash` | Script exécuté avec Bash sur l'agent | Appel du socle commun |
| `script` | Script avec shell par défaut de l'agent | Possible, mais Bash est explicite pour ce scénario Linux |
| `task: Nom@majeure` | Composant Azure versionné | `PublishTestResults@2` publie le JUnit |
| `dependsOn` | Dépendance logique | `Qualify` attend `Build` |
| `condition` | Autorisation d'exécuter selon l'état | `succeeded()` empêche la progression sur échec |
| `deployment` | Job de déploiement lié à un environnement | `Promote` et historique `preproduction` |
| `isSkippable: false` | Interdit le saut manuel du stage sur Services compatible | Quatre étapes obligatoires |
| `workspace.clean: all` | Efface les restes du workspace de l'agent avant le job | Évite une preuve récupérée d'un ancien run |
| `checkout.clean: true` | Nettoie la copie du dépôt | Ne remplace pas le nettoyage du démon Docker |
| `fetchDepth: 0` | Historique Git complet | Analyse des secrets sur le périmètre Git prévu |
| `persistCredentials: false` | Ne laisse pas le jeton de checkout dans la configuration Git | Les scripts n'ont pas besoin de pousser dans le dépôt |

`dependsOn` ordonne les jobs, sans transférer leurs fichiers. Une `condition` personnalisée remplace le défaut : garder `succeeded()`, par exemple `and(succeeded(), eq(...))`, pour bloquer après échec ou annulation. Réserver `always()` aux diagnostics. [Conditions et annulation](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/conditions?view=azure-devops).

<a id="52-variables-et-trois-moments-dévaluation"></a>

#### 5.5.2. Variables et trois moments d'évaluation

| Syntaxe | Moment / contexte | Usage sûr dans ce dépôt |
|---|---|---|
| `${{ parameters.agentPool }}` | Compilation des templates, avant les jobs | Nom de pool typé, non secret |
| `$(Build.BuildId)` | Macro résolue pour la tâche | Valeur passée par `env: RUN_ID` |
| `$[eq(variables['Build.SourceBranch'], 'refs/heads/main')]` | Expression à l'exécution | Calcul d'une variable ou lecture de sortie dépendante |
| `$RUN_ID` | Expansion par Bash dans le processus | Accès à la variable déjà injectée dans l'environnement |

Les paramètres typés structurent le pipeline ; les variables Azure sont des chaînes. Les secrets ne doivent pas devenir des paramètres, car ceux-ci entrent dans le plan compilé. Passer les valeurs à Bash par `env:` plutôt que coller des macros utilisateur dans le script. [Expressions](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/expressions?view=azure-devops), [variables](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/variables?view=azure-devops).

| Variable prédéfinie | Signification | Limite |
|---|---|---|
| `Build.SourceVersion` | SHA effectivement récupéré pour le build | Pour une PR, peut être un commit de fusion |
| `Build.BuildId` | Identifiant numérique de l'exécution | Ce n'est pas une version métier |
| `Build.SourceBranch` | Référence complète, par exemple `refs/heads/main` | Comparer la référence complète |
| `Build.SourcesDirectory` | Racine locale des sources du scénario à dépôt unique | Les chemins changent avec plusieurs checkouts |
| `Pipeline.Workspace` | Répertoire de travail du pipeline sur l'agent | N'est pas un stockage persistant entre agents |
| `System.AccessToken` | Jeton de job Azure, autorisations liées à l'identité Build Service | Ne remplace ni le PAT d'inscription, ni le secret du registre |

Le pipeline ne transmet pas `System.AccessToken` aux scripts. Pour un futur appel d'API Azure, limiter les droits de Build Service au projet et injecter le jeton dans la seule étape concernée. [Variables prédéfinies](https://learn.microsoft.com/en-us/azure/devops/pipelines/build/variables?view=azure-devops).

Une variable de sortie transmet une petite valeur calculée grâce à une étape nommée et `isOutput=true`. Les rapports, eux, restent des artefacts. Exemple indépendant du pipeline livré :

```yaml
# Exemple de mécanisme, indépendant du pipeline livré.
jobs:
- job: Producer
  steps:
  - bash: echo '##vso[task.setvariable variable=label;isOutput=true]candidate'
    name: meta
- job: Consumer
  dependsOn: Producer
  variables:
    received: $[ dependencies.Producer.outputs['meta.label'] ]
  steps:
  - bash: printf '%s\n' "$RECEIVED"
    env:
      RECEIVED: $(received)
```

<a id="6-comprendre-le-pipeline-complet"></a>

### 5.6. Comprendre le pipeline complet

<a id="61-contrat-des-quatre-stages"></a>

#### 5.6.1. Contrat des quatre stages

| Stage | Entrées explicites | Action commune | Sorties et résultat autorisant la suite |
|---|---|---|---|
| `Quality` | Checkout du SHA, identifiant de run | `bash ci/run.sh quality` | Rapports et `evidence/quality.json` valides ; contrôles obligatoires réussis |
| `Build` | Artefacts `quality-reports` et `quality-evidence` du même run | `bash ci/run.sh build` | Image construite, contrôles image/SBOM, push ; `image.env` avec digest et provenance |
| `Qualify` | `build-reports`, `build-evidence`, accès registre | `bash ci/run.sh qualify` | Pull du digest, tests HTTP et fonctionnels, ZAP baseline ; `candidate.json` seulement sur succès |
| `Preproduction` | `qualify-reports`, `qualify-evidence`, checks ressources satisfaits | `bash ci/run.sh promote` | Déploiement de ce digest, vérification et preuve conservée |

Chaque stage télécharge les rapports dans `reports/` à la racine des sources et les manifestes dans `incoming-*`, puis les copie dans `evidence/`. Ce transfert cumulatif garde les rapports de qualité jusqu'à la promotion et permet de recalculer leurs empreintes. Les noms d'artefacts sont distincts par stage.

```yaml
# Extrait réel : dependsOn seul ne remettrait pas ces fichiers dans le dépôt.
- task: DownloadPipelineArtifact@2
  inputs:
    buildType: current
    artifactName: build-reports
    targetPath: $(Build.SourcesDirectory)/reports
- task: DownloadPipelineArtifact@2
  inputs:
    buildType: current
    artifactName: build-evidence
    targetPath: $(Pipeline.Workspace)/incoming-build
- bash: |
    set -euo pipefail
    test -s "$INCOMING/image.env"
    cp -a "$INCOMING/." evidence/
  env:
    INCOMING: $(Pipeline.Workspace)/incoming-build
```

`buildType: current` impose les artefacts du run courant. Autre commit ou run, rapport absent, empreinte différente ou fichier vide : la chaîne de preuves doit être refusée. Le socle distingue aussi panne d'outil et anomalie de sécurité.

Protéger les droits d'écriture sur dépôt et artefacts. Les manifestes tracent les opérations dans ce périmètre de confiance ; ils n'apportent pas de signature indépendante contre un administrateur compromis.

<a id="62-image-environnement-de-test-et-candidate"></a>

#### 5.6.2. Image, environnement de test et candidate

Le build pousse une **candidate technique** dans le registre restreint et inscrit son digest `repository@sha256:…` dans `evidence/image.env`. Un tag mutable ne prouve pas cette identité.

Le job suivant se réauthentifie, car il peut utiliser un autre agent. Il tire ce digest, lance l'application dans un réseau Docker unique, puis exécute tests et ZAP avant nettoyage.

Tout le test éphémère reste dans **un appel** `ci/run.sh qualify` : lancement, attente bornée, assertions HTTP, vérification utilisateur, journaux et `trap` de nettoyage. Un scanner sur une autre VM ne résoudrait pas le nom privé du conteneur.

Les noms uniques permettent la concurrence. Une VM perdue ou un SIGKILL peut empêcher le nettoyage : repérer les ressources orphelines par labels et âge avant leur suppression ciblée.

Le DAST (test de sécurité dynamique) utilise ici une baseline ZAP sur l'application de démonstration et son périmètre autorisé. Pour tester une application authentifiée, prévoir comptes, données et contexte dédiés, puis prouver le parcours des pages protégées. Le rapport HTML seul ne démontre pas cette couverture ; préparer tout scan actif sur un environnement adapté.

`candidate.json` atteste que ce digest a été qualifié dans ce run. L'approbation porte sur cette candidate et la promotion déploie son image sans reconstruire le Dockerfile. Toute reconstruction exige une nouvelle qualification.

<a id="63-rapports-statut-et-conservation"></a>

#### 5.6.3. Rapports, statut et conservation

`PublishTestResults@2` publie `reports/unit.xml` et échoue si tests, fichier JUnit ou publication sont défaillants. La couverture publie `reports/coverage.xml` au format Cobertura ; les tests du socle appliquent le seuil.

`UseDotNet@2` installe le kit de développement (SDK) 8.x nécessaire au publieur, avec son patch résolu dans les journaux. Ce SDK est distinct du runtime .NET 10 de l'agent : valider la migration du publieur avant la fin de support .NET 8, le **10 novembre 2026**. [Publication JUnit](https://learn.microsoft.com/en-us/azure/devops/pipelines/tasks/reference/publish-test-results-v2?view=azure-pipelines), [publication de couverture](https://learn.microsoft.com/en-us/azure/devops/pipelines/tasks/reference/publish-code-coverage-results-v2?view=azure-pipelines), [UseDotNet](https://learn.microsoft.com/en-us/azure/devops/pipelines/tasks/reference/use-dotnet-v2?view=azure-pipelines), [cycle de support .NET](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core).

`condition: always()` conserve les diagnostics après échec sans effacer celui-ci ; aucun contrôle obligatoire n'utilise `continueOnError`. Les dossiers sont créés avant les analyses pour publier les résultats partiels. Une perte d'agent ou un job jamais démarré peut toutefois empêcher la collecte.

Conserver les runs déployés, rapports et SBOM (inventaire des composants logiciels) selon une politique plus longue que celle des runs ordinaires. Supprimer un run peut supprimer ses artefacts : exporter les preuves durables par un canal contrôlé, avec leurs empreintes.

Un cache peut être évincé et ne remplace ni `quality.json`, ni `candidate.json`, ni la SBOM. [Cycle des Pipeline Artifacts](https://learn.microsoft.com/en-us/azure/devops/pipelines/artifacts/pipeline-artifacts?view=azure-devops).

<a id="64-version-complète-et-version-pédagogique"></a>

#### 5.6.4. Version complète et version pédagogique

Après configuration des ressources, fournir [azure-pipelines.yml](#fichier-azure-pipelines-yml) tel quel à Azure pour exécuter les quatre stages. Commencer avec [azure-debutant.yml](#fichier-exemples-azure-debutant-yml) pour découvrir `checkout`, Bash, échec réel et récupération des rapports. Cet exemple s'arrête à la qualité et ne qualifie aucune release.

<a id="7-réutiliser-les-templates"></a>

### 5.7. Réutiliser les templates

Pour essayer les templates, créer une deuxième définition pointant vers `/exemples/azure-modulaire.yml`. Choisir ensuite une seule définition de livraison par défaut pour chaque commit. Conserver les chemins relatifs ou les adapter avec la structure du dépôt.

| Fichier | Responsabilité |
|---|---|
| `ci/azure/prepare.steps.yml` | Checkout propre, historique complet, répertoires de sortie |
| `ci/azure/restore.steps.yml` | Téléchargement des rapports et manifestes d'un stage précédent du même run |
| `ci/azure/publish.steps.yml` | Deux publications `always()` à noms distincts |
| `ci/azure/quality.stage.yml` | Qualité et publication tests/couverture |
| `ci/azure/image.stage.yml` | Job commun aux actions image `build` et `qualify` |
| `ci/azure/preproduction.stage.yml` | Déploiement avec environnement, clés et verrou |

| Paramètre template | Type | Défaut / valeurs admises | Caractère obligatoire et usage |
|---|---|---|---|
| `agentPool` | string | `CI-Linux-Trusted` | Valeur fournie dans l'exemple racine ; peut viser un autre pool explicitement autorisé |
| `action` | string | `build` ou `qualify` | Requis par `image.stage.yml` ; aucune désactivation de contrôle |
| `stageName` | string | `Build` ou `Qualify` | Requis ; unique dans le pipeline |
| `dependsOn` | string | `Quality` ou `Build` | Requis ; conserver l'ordre du scénario |
| `incoming` | string | `quality` ou `build` | Requis ; artefacts du stage source |
| `requiredFile` | string | `quality.json`, `image.env` ou `candidate.json` selon le consommateur | Requis ; le socle vérifie également le contenu |
| `timeoutMinutes` | number | `50` ; qualification configurée à `30` | Facultatif dans le template, explicite dans l'exemple |
| `from` | string | `quality`, `build` ou `qualify` | Requis dans `restore.steps.yml` |
| `prefix` | string | Aucun | Requis dans `publish.steps.yml`, noms d'artefacts uniques |

Ces paramètres sont non secrets. Conserver les ensembles pris en charge : `build/Build/Quality/quality/quality.json` et `qualify/Qualify/Build/build/image.env`. Le template de promotion attend la qualification correspondante ; le socle vérifie seuils, digest et preuves.

Les templates mutualisent les scripts, mais les droits restent déterminants. Maintenir leur revue et, pour plusieurs équipes, les placer dans un dépôt gouverné avec une révision maîtrisée et un check **Required template** sur les ressources. Tester cette adaptation comme une nouvelle version de la procédure de changement.

<a id="8-faire-un-premier-passage-et-prouver-les-blocages"></a>

### 5.8. Faire un premier passage et prouver les blocages

<a id="81-passage-nominal"></a>

#### 5.8.1. Passage nominal

1. Sur la VM agent, valider les versions/outils et verrouiller les images d'outils selon le socle commun. Committer ce verrou dans `main` via une PR revue.
2. Lancer l'exemple pédagogique sur `main`. Retrouver son SHA, le statut et les deux artefacts. Corriger tout prérequis manquant avant d'introduire les secrets de livraison.
3. Lancer le pipeline complet sur `main`. Contrôler les groupes autorisés et le SHA de checkout. Après `Quality`, télécharger `quality-reports` et ouvrir les résultats unitaires.
4. Après `Build`, vérifier le dépôt OCI, le digest et la SBOM ; après `Qualify`, vérifier la cible et les URL effectivement parcourues par ZAP ainsi que `candidate.json`.
5. Vérifier que `Preproduction` attend les checks configurés. Le responsable examine les preuves, approuve, puis contrôle l'historique et le résultat HTTP distant.
6. Sur la cible, comparer le digest/image en exécution avec la candidate ; consulter aussi les journaux et le fonctionnement attendu. Conserver le run utilisé comme référence de retour arrière.

La recette doit prouver les blocages autant que le passage nominal.

<a id="82-exercices-déchec-sans-neutraliser-les-règles"></a>

#### 5.8.2. Exercices d'échec sans neutraliser les règles

| Épreuve contrôlée dans un projet de formation | Résultat exigé | Vérification après correction |
|---|---|---|
| Une assertion unitaire volontairement fausse | `Quality` rouge, étapes suivantes non exécutées ; rapport consultable | Corriger l'assertion, nouveau run vert |
| Un rapport d'entrée manquant dans une copie locale de validation | Consommateur en échec, aucune candidate produite | Restaurer le vrai artefact, vérification de son empreinte |
| Un mot de passe registre volontairement invalide | Build ou pull en erreur d'authentification ; aucune promotion | Corriger le secret, refaire le run ; ne pas réutiliser une preuve fabriquée |
| Refuser l'approbation préproduction | Aucun accès de déploiement à la cible | Nouveau passage approuvé avec justification |
| Deux candidates approuvées au même moment | Déploiements séquentiels sous le verrou commun | Historique sans chevauchement sur la cible |
| Annuler pendant le test éphémère | Pas de promotion ; nettoyage ou anomalie orpheline détectable | Inspection ciblée des conteneurs/réseaux du run |
| Demander manuellement une branche libre | Ressources protégées refusées, aucun secret disponible | Lancement sur `main` protégé accepté |

Tester la détection avec une fixture explicitement factice conforme à la règle, jamais un vrai secret. Réserver les failles volontaires au périmètre de formation.

<a id="83-retour-arrière"></a>

#### 5.8.3. Retour arrière

Le rollback redéploie une **ancienne image qualifiée par digest** et constitue un nouveau changement traçable. Pour `bash ci/run.sh rollback`, suivre le chapitre d'exploitation commun : choisir la version, récupérer `reports/` et `evidence/`, vérifier intégrité et compatibilité des données. Toute définition Azure automatisant ce retour doit partager l'environnement protégé et son verrou.

Le script exige le digest approuvé `ROLLBACK_IMAGE_REF`, `ROLLBACK_EVIDENCE=evidence/candidate.json`, `IMAGE_REPOSITORY`, les quatre paramètres SSH et les anciens `SOURCE_SHA` / `RUN_ID`. Le checkout doit correspondre à ce `SOURCE_SHA`.

Les preuves expirent après **72 heures** ; requalifier une version plus ancienne, sans abaisser ce contrôle. Tracer séparément l'identifiant du nouvel incident/changement et celui de l'ancienne qualification.

Un opérateur autorisé choisit l'ancien run, le rattache à l'incident/changement et vérifie le rétablissement ; le pipeline fourni ne le sélectionne pas automatiquement. Ne pas déplacer le tag courant pour revenir en arrière. Vérifier les migrations : restaurer l'image ne restaure pas les données et peut être incompatible avec leur nouveau schéma.

<a id="9-exploiter-diagnostiquer-et-améliorer"></a>

### 5.9. Exploiter, diagnostiquer et améliorer

<a id="91-fiches-dincident"></a>

#### 5.9.1. Fiches d'incident

| Symptôme | Causes possibles | Diagnostic | Correction | Vérification |
|---|---|---|---|---|
| Agent Offline | Service arrêté, horloge, proxy, certificat, mise à jour incompatible | `sudo ./svc.sh status`, journaux `_diag/Agent_*.log`, DNS/TLS, version OS | Rétablir service/TLS ou VM compatible, nouvelle inscription seulement si nécessaire | Agent Online puis exemple pédagogique |
| Job reste en queue | Aucune capacité conforme, aucun slot disponible, agent désactivé | Pool, `demands`, capacités, disponibilité des parallel jobs de l'organisation | Corriger affectation/capacité ou dimensionner la capacité autorisée | Job affecté au pool et durée d'attente normale |
| Docker permission denied | Groupe absent de la session de service | `sudo -u azagent -H id`, permissions `/var/run/docker.sock`, `docker info` | Ajouter le compte au groupe prévu puis redémarrer le service | `docker info` sous azagent sans sudo |
| Build sans Docker joignable | Démon arrêté, erreur disque | `systemctl status docker`, `df -h`, `docker system df` | Rétablir service, nettoyage ciblé des ressources identifiées | Version client/serveur et petit build de démonstration |
| Variable vide ou littéral `$(REGISTRY_PASSWORD)` | Groupe non autorisé, faute de nom, secret non mappé | Examiner noms et autorisations, sans afficher valeurs | Corriger groupe et `env:` | Login réussi, secret absent des journaux |
| Registre 401/403 | Robot révoqué, portée insuffisante, hôte incorrect | Distinguer login/pull/push, lire erreur du job, vérifier nom dépôt | Renouveler le secret minimal ou corriger le dépôt | Build puis pull par digest depuis un autre job |
| Artefact absent | Stage amont échoué, nom erroné, ancien run supprimé | Résumé des artefacts du run et tâche de publication | Corriger production/nom/rétention, relancer une chaîne complète | Hashes rapports validés, candidate du même run |
| Application non joignable dans Qualify | Crash, mauvais port, réseau Docker, readiness dépassée | Journaux conservés du conteneur, rapport HTTP, réseau/nom du run | Corriger démarrage/port ou délai justifié | Tests HTTP et ZAP sur le bon service |
| ZAP en erreur | Cible incorrecte, image scanner indisponible, timeout ou droits d'écriture | Code de retour exact, rapport, journaux et URLs visitées | Corriger outil/réseau ou application ; conserver le blocage | Scan terminé et critères respectés |
| Stage attend une approbation | Attente normale ou ressource autorisée sans décideur disponible | Vue checks, approbateurs et deadline | Décision par le responsable prévu ou correction administrative tracée | Check satisfait puis début réel du stage |
| Échec SSH | Clé/compte faux, clé hôte différente, réseau | `ssh` strict et journaux cible sans exposer la clé | Corriger permissions, identité ou known_hosts après validation | Commande de diagnostic puis déploiement HTTP réussi |
| Espace disque saturé | Images, caches et logs persistants | `df -h`, `docker system df`, taille de `_work` et `_diag` | Nettoyage ciblé hors jobs actifs, rotation et quota | Nouveau run complet et capacité disque rétablie |

Pour diagnostiquer un incident, activer temporairement `System.Debug=true`, limiter l'accès aux exports puis revenir au niveau normal : les journaux peuvent contenir des données internes. Une perte d'agent est une panne d'exécution, sans conclusion sur la sécurité de l'application.

<a id="92-pratiques-de-service-et-calms-au-quotidien"></a>

#### 5.9.2. Pratiques de service et CALMS au quotidien

| Pratique | Preuve ou action concrète dans Azure | Amélioration recherchée |
|---|---|---|
| Maîtrise des changements | PR, modèle approuvé, SHA/digest, décision de check | Changement proportionné au risque |
| Validation et tests du service | Résultats unitaires, fonctionnels, DAST, contrôle après déploiement | Réduire les régressions observables |
| Déploiement et gestion des versions | Candidate immutable, historique d'environnement, rollback vérifié | Reproduire et restaurer une version connue |
| Gestion des configurations | Inventaire agents/OS/outils, image par digest, groupes et droits suivis | Expliquer quel composant a changé |
| Incidents et problèmes | Run fautif lié à l'incident, cause documentée, correction et vérification | Éviter les échecs récurrents |
| Amélioration continue | Mesures par stage et revue des temps d'attente | Réduire le travail manuel et les files inutiles |

CALMS relie cinq piliers : **Culture**, examen partagé des blocages par développement, sécurité et exploitation ; **Automation**, décisions appuyées sur les rapports ; **Lean**, premiers contrôles rapides, `batch` et attentes bornées ; **Measurement**, suivi des attentes, durées, échecs techniques ou qualité, tests instables et délai de correction ; **Sharing**, templates, fiches d'incident et exceptions partagés.

**Exemple à reproduire :** les stages `Quality`, `Build` et `Qualify` transmettent les preuves du run courant ; `Preproduction` déploie le digest qualifié après les contrôles de ressources configurés. Dans le Work Item ou le dossier de changement réellement suivi par l’équipe, relier PR, commit, URL du run, `candidate.json`, digest, rapports et plan de rétablissement. Ajouter le risque, le décideur, sa décision datée et le résultat de préproduction. Le YAML de ce guide ne crée pas automatiquement ce dossier.

Cette démarche applique le cadre ITIL 5 avec les rappels utiles d’ITIL 4 : comprendre le service, attribuer les responsabilités, valider le changement et vérifier son effet. Les piliers CALMS invitent ensuite à partager ce résultat et à améliorer une difficulté observée. Si l’autorisation attend longtemps, mesurer cette attente et clarifier son motif avant de modifier les ressources.

Avant d'ajouter des agents, distinguer manque de slots autorisés, manque de VM et attente d'approbation. Un agent traite un job à la fois ; plusieurs processus sur une VM ne garantissent pas plus de capacité utile. Un cache d'outils doit conserver les versions qualifiées et ne remplace pas les rapports.

<a id="10-adapter-à-azure-devops-server"></a>

### 5.10. Adapter à Azure DevOps Server

Le pipeline fourni cible Services. Pour Server, traiter la conversion comme une adaptation de compatibilité à tester sur la version exacte du serveur et ses correctifs.

| Sujet | Services fourni | Adaptation Server |
|---|---|---|
| Agents | Agent 5.280.0 retenu selon matrice v5 | Vérifier version supportée/livrée par le Server et son OS ; ne pas supposer v5 admis partout |
| Exécution hébergée | Pool autohébergé choisi ; autres offres disponibles selon compte | Agents Microsoft hébergés indisponibles ; préparer ses propres VM |
| Artefacts fichiers | `PublishPipelineArtifact@1` / `DownloadPipelineArtifact@2` | Pipeline Artifacts non pris en charge sur Server ; utiliser Build Artifacts |
| Syntaxe récente | `isSkippable: false`, checks et verrous Services actuels | Vérifier schéma disponible ; ne pas enlever une protection sans équivalent de ressource/permission |
| Approbations | Ressources → Approvals and checks | Vérifier disponibilité de chaque check dans la version ciblée |
| Tests/couverture | Tâches v2 fournies par Services | Vérifier tâches et prérequis installés, ainsi que support des pièces jointes |

Sur Server, remplacer publication **et tous les téléchargements** de Pipeline Artifacts par Build Artifacts. Conserver le contrat : `reports/` à la racine, manifestes dans `evidence/`, même run, noms distincts et absence bloquante. Les raccourcis `publish:` et `download:` ne réalisent pas cette conversion. [La tâche PublishPipelineArtifact précise sa limitation à Services](https://learn.microsoft.com/en-us/azure/devops/pipelines/tasks/reference/publish-pipeline-artifact-v1?view=azure-pipelines).

Exemple de remplacement d'une publication Pipeline Artifact par Build Artifact :

```yaml
- task: PublishBuildArtifacts@1
  condition: always()
  inputs:
    PathtoPublish: $(Build.SourcesDirectory)/reports
    ArtifactName: quality-reports
    publishLocation: Container
```

Pour télécharger, utiliser `DownloadBuildArtifacts@0` si la version Server ciblée le fournit : `buildType: current`, `downloadType: single`, `artifactName: quality-reports`, puis un `downloadPath` temporaire. Vérifier la structure produite et copier le **contenu** du dossier artefact vers `reports/` ; répéter pour `evidence/`. Déclarer la conversion validée seulement après exécution sur le Server cible.

<a id="11-sources-et-limites-de-validation"></a>

### 5.11. Sources et limites de validation

**Consultation des sources : 20 octobre 2026.** Le contenu technique Microsoft était lisible malgré certains bandeaux d'authentification. Le choix v5 repose sur la documentation de version et les releases officielles ; la divergence avec la page Linux générale reste signalée.

**Validation distante encore requise :** aucun agent Linux, service Azure, registre ou cible de préproduction n'a été installé ou fourni dans cette session Windows. Faire compiler le YAML par Azure, puis tester autorisations, contrôles, installation, scans et déploiements sur la cible. Une analyse YAML locale ne prouve pas ces opérations.

Pour adapter le parcours, consulter aussi [PublishBuildArtifacts@1](https://learn.microsoft.com/en-us/azure/devops/pipelines/tasks/reference/publish-build-artifacts-v1?view=azure-pipelines), [DownloadBuildArtifacts@0](https://learn.microsoft.com/en-us/azure/devops/pipelines/tasks/reference/download-build-artifacts-v0?view=azure-pipelines) et les [jobs de déploiement](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/deployment-jobs?view=azure-devops).

<a id="controles"></a>

## 6. Contrôles, preuves, paramètres et promotion

### 6.1. Politique exécutable

La promotion exige des contrôles réussis sur trois cibles :

- **Le code** : tous les tests passent, la couverture atteint au moins **85 %**, les lints sont satisfaits et aucun secret, résultat SAST bloquant ou avis SCA connu ne reste ouvert.
- **L’image** : aucune vulnérabilité HIGH/CRITICAL et aucune alerte Dockle WARN ou supérieure.
- **Le service lancé** : tests fonctionnels réussis et aucun WARN/FAIL ZAP.

Ces seuils sont une politique pédagogique stricte, pas une règle universelle ITIL. Une base récente peut encore échouer : traiter le résultat ou faire accepter une exception précise.

Une **porte de validation** autorise la suite seulement si les résultats et leurs preuves sont valides. Elle vérifie les codes de retour, les rapports et leurs empreintes, le commit, l’exécution, le digest et une qualification datant de moins de **72 h**.

`COV_MIN` peut relever le seuil ; il ne peut pas abaisser le minimum effectif de 85 %. Les contrôles obligatoires n’ont pas d’interrupteur `SKIP_SECURITY`. Vérifier aussi l’accès aux bases de vulnérabilités et la compatibilité des outils.

### 6.2. Matrice des contrôles

Retrouver ci-dessous le contrôle à examiner. Les critères bloquants de la politique restent obligatoires, même lorsque le tableau est replié.

<details>
<summary>Référence — outils, prérequis, rapports et critères de blocage</summary>

| Contrôle / cible | Outil et prérequis | Placement / preuve | Blocage et correction typique |
|---|---|---|---|
| Lint Python | Ruff, sources `app tests ci` | quality / code-lint.json | Tout diagnostic ; supprimer import inutilisé ou corriger le code |
| YAML | yamllint, fichiers pipeline/templates/config | quality / yaml-lint.log | Erreurs syntaxe/style définies ; corriger indentation ; ne valide pas le schéma CI |
| Bash | `bash -n`, scripts ci/ops | quality / shell-lint.log | Syntaxe invalide ; corriger guillemets/blocs ; ajouter ShellCheck en durcissement |
| Dockerfile | Hadolint | quality / dockerfile.json | Warning et au-dessus ; fixer base et usages RUN ; règles documentées dans config |
| Secrets Git | Gitleaks, clone complet | quality / secrets.json expurgé | Code 10 détection ; révoquer/rotater AVANT nettoyage de l'historique |
| Tests et couverture | pytest, pytest-cov, Jinja2 | quality / unit.xml, coverage.xml/json | Test en échec ou couverture < seuil ; ajouter assertion significative |
| SAST code Python | Bandit 1.9.4, AST compatible | quality / sast.json | Résultat non nul ou analyse vide/erreurs ; supprimer SQL interpolé, usage dangereux |
| SCA dépendances Python | pip-audit et API d'avis accessible | quality / sca.json | Toute vulnérabilité connue ; mettre à jour requirements et retester |
| IaC Dockerfile | Checkov, 3 règles explicites | quality / iac.json | CKV_DOCKER_2/3/5 ; ajouter santé, USER et éviter un update seul dans RUN |
| CVE image OS + paquets | Trivy, archive, base CVE accessible | build / image-vulnerabilities.json | HIGH/CRITICAL, y compris non corrigées ; base/deps plus récentes ou traitement risque |
| Pratiques image | Dockle, archive | build / image-practices.json | WARN ou FATAL ; USER, cache/permissions et secrets de couches |
| Inventaire logiciel | Trivy CycloneDX | build / sbom.cdx.json | Rapport absent/vide ; analyser la vraie archive, conserver lien digest |
| Intégration/fonctionnel | Python client HTTP, réseau Docker | qualify / http-functional.json | Mauvaise révision, santé, données ou HTML ; corriger app/config |
| Utilisateur effectif | `docker exec ... id -u` | qualify / runtime-user.log | UID différent de 10001 ; corriger USER ou lancement |
| DAST public | ZAP baseline, application disponible | qualify / zap.json/html/visited.json | Codes 1, 2, 3 ou timeout ; corriger alerte ou incident outil ; périmètre visité requis |
| Audit hôte Docker | Docker Bench, administrateur et révision revue | Maintenance / journal indépendant | WARN examinés avec contexte ; pas une porte fondée sur le seul code shell |

</details>

**Périmètre IaC.** Checkov examine ici trois règles du Dockerfile. Le laboratoire ne déploie ni Kubernetes ni Terraform. Pour une infrastructure réelle, adapter par exemple `checkov --directory infra --framework terraform kubernetes`, choisir les politiques pertinentes et vérifier que des ressources ont réellement été analysées. Trois règles Dockerfile ne constituent pas un audit complet de l’infrastructure.

### 6.3. Lire les commandes et les rapports

Pour retrouver une commande complète, ouvrir les scripts [`ci/run.sh`](#fichier-ci-run-sh) et [`ci/python-quality.sh`](#fichier-ci-python-quality-sh). Ils conservent les vrais codes de retour. Les commandes suivantes permettent de reproduire les principaux contrôles dans un environnement Python déjà préparé.

```bash
# Outils Python déjà installés dans le venv, à exécuter depuis la racine.
ruff check app tests ci --output-format json --output-file reports/code-lint.json
pytest --junitxml=reports/unit.xml --cov=app --cov-report=xml:reports/coverage.xml --cov-fail-under=85
bandit -r app -f json -o reports/sast.json
pip-audit -r requirements.txt --no-deps --disable-pip --strict --format json --output reports/sca.json --progress-spinner off
# Le code de sortie et les erreurs de parsing restent bloquants.
python3 ci/evidence.py verify evidence/quality.json
python3 ci/evidence.py verify-candidate evidence/candidate.json
```

| Option | Signification |
|---|---|
| `-r` Bandit | Descente récursive dans le code applicatif, sans mélanger les assertions des tests |
| `-r` pip-audit | Fichier de dépendances à résoudre et analyser, pas tous les paquets de la machine |
| `--no-deps --disable-pip --strict` | Audit direct de la fermeture runtime déjà complètement épinglée ; le gate exige chaque nom/version attendu. Pour une autre application, générer d'abord cette fermeture complète, transitives comprises |
| `--input` Trivy/Dockle | Analyser l'archive produite par `docker save`, sans socket hôte |
| `--scanners vuln` | Limiter cette analyse Trivy aux vulnérabilités ; Gitleaks et Checkov couvrent d'autres axes |
| `--exit-code 10` | Valeur dédiée aux détections pour les outils qui l'acceptent ; les erreurs techniques restent non nulles |
| `--severity HIGH,CRITICAL` | Seuil image ; les LOW/MEDIUM doivent faire l'objet d'un suivi séparé |
| `--format cyclonedx` | Inventaire standard ; ne signifie ni absence de vulnérabilité ni attestation signée |
| ZAP `-m 1` / `-T 5` | Durée spider en minutes / borne interne d'attente ; timeout externe limite tout le processus |
| ZAP `-J` / `-r` | Rapports JSON analysable / HTML pour lecture humaine |

**Lire un rapport.** Les sorties ci-dessous sont des exemples de lecture, pas des scans de votre infrastructure :

- Ruff ou Gitleaks : `[]` indique qu’aucun résultat n’a été trouvé selon leurs règles.
- Bandit : attendre `errors: []`, un nombre de lignes analysées supérieur à zéro et `results: []`.
- Trivy : une ligne `HIGH ... CVE-...` demande un traitement.

Une liste vide peut aussi cacher un périmètre vide. La porte vérifie donc les tests JUnit, la couverture, l’analyse SAST effective, l’inventaire SCA attendu et une SBOM contenant des composants.

Ruff produit notamment texte, JSON et JUnit ; Bandit JSON, texte, HTML et XML ; pip-audit JSON/CycloneDX ; Hadolint texte/JSON/SARIF selon version ; Gitleaks JSON/CSV/SARIF/JUnit ; Checkov JSON/SARIF/JUnit/CycloneDX ; Trivy JSON/SARIF/CycloneDX/SPDX et templates ; Dockle JSON/texte ; ZAP HTML/JSON/XML et formats de rapport via ses extensions. Choisir un format accepté par le consommateur : une sortie Bandit JSON générique n'est pas un rapport GitLab SAST au seul motif qu'elle est en JSON.

**Choisir les outils par cible.** Hadolint examine les instructions du Dockerfile ; Dockle inspecte l’image construite. Bandit repère certains motifs dangereux dans le code Python. pip-audit analyse les dépendances déclarées ; Trivy couvre aussi des paquets du système d’exploitation.

La SCA dépend des avis connus et ne prouve pas l’exploitabilité. La SBOM décrit des composants sans les déclarer sûrs. ZAP n’analyse que la surface parcourue. Ces résultats complètent une revue du code et du contexte métier.

Les suppressions Bandit B104/B108 concernent uniquement l’écoute réseau interne du conteneur et le fichier temporaire de données synthétiques. Le code explique ces choix ; ils n’autorisent pas à stocker des secrets sous `/tmp`. Les exceptions générales restent vides et ne désactivent aucun contrôle.

Sources primaires pour options et formats : [Ruff](https://docs.astral.sh/ruff/), [pytest](https://docs.pytest.org/en/stable/), [coverage](https://coverage.readthedocs.io/), [Bandit](https://bandit.readthedocs.io/en/latest/), [pip-audit](https://github.com/pypa/pip-audit), [Hadolint](https://github.com/hadolint/hadolint), [Gitleaks](https://github.com/gitleaks/gitleaks), [Checkov CLI](https://www.checkov.io/2.Basics/CLI%20Command%20Reference.html), [Trivy CLI](https://trivy.dev/docs/latest/references/configuration/cli/trivy_image/), [Dockle](https://github.com/goodwithtech/dockle).

### 6.4. DAST, cible réelle et nettoyage

Le job `qualify` teste l’image déjà construite :

1. Vérifier la preuve de build et tirer l’image par digest.
2. Créer un réseau unique et lancer l’application sans publier de port sur l’hôte.
3. Attendre `/health` jusqu’à `READY_TIMEOUT`, puis vérifier la révision, les données, le HTML et l’UID.
4. Lancer ZAP sur ce même réseau, conserver ses rapports et supprimer les ressources temporaires.

**Baseline ZAP** explore le site puis applique des analyses passives. Il ne lance pas un scan actif d’injections. Le hook fourni fait visiter `/`, `/health` et `/api/items`, puis conserve les URL de la session. La porte exige ces trois routes ; le test HTTP précédent établit la révision attendue sur le même réseau. Références : [baseline](https://www.zaproxy.org/docs/docker/baseline-scan/) et [hooks](https://www.zaproxy.org/docs/docker/scan-hooks/).

**Interpréter le code ZAP :** `0` = réussite ; `1` = FAIL ; `2` = WARN sans FAIL ; `3` = erreur d’exécution. Le socle bloque tout code non nul, y compris un timeout. Il n’utilise pas `-I` pour accepter les WARN.

Les règles et le hook sont montés en lecture seule. ZAP conserve son utilisateur ; `docker cp` récupère les rapports sans ouvrir les permissions du dépôt à tout le monde.

`-z "-silent"` conserve les extensions installées dans l’image verrouillée pendant le scan. Une mise à jour des règles passe par un nouveau verrou et une recette. L’audit SCA compare aussi chaque nom et version au fichier runtime complet : un rapport vide est refusé, même avec un code `0`.

Pour un **scan actif** avec `zap-full-scan.py`, utiliser une cible de test autorisée, isolée et alimentée en données jetables. Pour une application authentifiée, fournir un contexte sans secret versionné, injecter un compte temporaire et prouver qu’une route protégée a été atteinte. Modifier l’URL ne suffit pas à autoriser un scan de production.

Le `trap` collecte les logs et retire application, scanner et réseau après succès, échec, TERM ou INT. Il ne peut pas agir après SIGKILL ou une panne de la VM.

Pour rattraper ces interruptions, drainer le runner puis utiliser `ops/cleanup-stale.sh` sur les seules ressources de démonstration étiquetées. Surveiller aussi archives, volumes et espace disque. Les rapports ne servent jamais de cache.

### 6.5. Preuves et exceptions

| État | Exemple | Décision |
|---|---|---|
| Anomalie | CVE HIGH détectée, test KO | Bloquer, ouvrir correction, réexécuter |
| Erreur technique | Base CVE inaccessible, binaire incompatible | Bloquer, corriger outil/réseau, aucun verdict sécurité positif |
| Rapport absent/invalide | Job non exécuté, JSON tronqué | Bloquer ; conserver journaux pour diagnostic |
| Non applicable | Pas de manifeste Terraform dans cette démo | Déclarer le périmètre ; ne pas annoncer contrôle réussi sur ressource inexistante |
| Exception acceptée | Faux positif lié à une règle et un composant précis | Document de risque revu avec échéance, puis modification limitée des règles et tests négatifs |

Une exception identifie la règle ou la CVE, la cible et sa version, le motif, le propriétaire, l’approbateur, le ticket, l’expiration, les mesures compensatoires et le réexamen.

`config/exceptions.json` reste vide : le script refuse une liste non vide tant que son traitement précis n’a pas été développé et revu. Protéger les politiques et templates par la revue de leurs propriétaires ; une modification applicative ne doit pas remplacer librement sa porte de promotion.

Suivre trois preuves cumulatives :

- `quality.json` relie les rapports au commit et à l’exécution.
- `build.json` ajoute les contrôles d’image et le digest.
- `candidate.json` ajoute tests dynamiques, URL visitées et date.

Leurs empreintes détectent un mauvais transfert ou une altération. Elles ne constituent pas une signature contre un acteur capable de réécrire preuves et pipeline. Pour une assurance supérieure, prévoir une attestation signée, une vérification au déploiement, un stockage immuable et une SBOM liée au digest.

### 6.6. Préparer la cible de préproduction

**Sur la VM de préproduction :** préparer Docker, Python 3, sudo, OpenSSH serveur et util-linux (`flock`). Limiter SSH à l’exécuteur de promotion. Le compte `deploy` n’appartient pas au groupe Docker. Installer la procédure depuis une révision approuvée et adapter le dépôt OCI autorisé avant de poursuivre.

```bash
sudo useradd --create-home --shell /bin/bash deploy
sudo install -d -m 0700 /etc/cicd-demo /etc/cicd-demo/docker
printf '%s\n' 'registry.example.net/formation/catalogue' | sudo tee /etc/cicd-demo/repository
sudo chmod 0600 /etc/cicd-demo/repository
sudo install -o root -g root -m 0755 ops/preproduction.sh /usr/local/sbin/cicd-preproduction
# Fichier sudoers root-owned, édité/validé avec visudo.
sudo visudo -f /etc/sudoers.d/cicd-demo
# Contenu unique :
# deploy ALL=(root) NOPASSWD: /usr/local/sbin/cicd-preproduction *
sudo chmod 0440 /etc/sudoers.d/cicd-demo
sudo visudo -cf /etc/sudoers.d/cicd-demo
```

La règle sudo permet d’appeler une seule procédure root. Son joker reste limité par le script : exactement **deux arguments**, un dépôt autorisé, un digest valide et le SHA de révision. Le compte `deploy` ne doit pouvoir modifier ni le script ni `/etc/cicd-demo/`. Un durcissement supplémentaire peut imposer une commande SSH forcée et interdire les redirections de connexion.

Configurer un jeton registre **lecture seule** durable et renouvelable sur la cible, sans transmettre le mot de passe de build :

```bash
read -rsp 'Jeton lecture registre : ' PULL_TOKEN; echo
printf '%s' "$PULL_TOKEN" | sudo docker --config /etc/cicd-demo/docker login \
  registry.example.net -u preproduction-reader --password-stdin
unset PULL_TOKEN
sudo chmod -R go-rwx /etc/cicd-demo/docker
```

Sans gestionnaire d’identifiants, `config.json` peut conserver un jeton encodé, sans chiffrement. Protéger le répertoire root en 0700, ses sauvegardes et la rotation du jeton. Utiliser un gestionnaire de secrets lorsqu’il est disponible.

Installer la clé publique dans `/home/deploy/.ssh/authorized_keys` : propriétaire `deploy`, répertoire en 0700 et fichier en 0600. Conserver la clé privée dédiée dans une variable File GitLab protégée à portée préproduction, ou un Secure File Azure contrôlé.

Vérifier l’empreinte du serveur sur sa console avec `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub`, puis la comparer par un canal indépendant. `known_hosts` doit contenir cette identité vérifiée ; `ssh-keyscan` seul n’authentifie pas le serveur.

### 6.7. Promouvoir, vérifier et revenir en arrière

Après approbation et verrouillage de la cible, `bash ci/run.sh promote` revérifie la candidate. SSH utilise `StrictHostKeyChecking=yes` et appelle la procédure root installée. Celle-ci tire le digest, prend le verrou `flock`, remplace l’instance et contrôle santé, révision, données et UID. Le reçu est écrit dans `/var/lib/cicd-demo/deployment.json` ; le pipeline conserve `reports/preproduction.log`.

**Limite de disponibilité :** le remplacement provoque une courte interruption. Si la nouvelle instance échoue, le script tente de relancer l’ancienne et garde un statut d’échec. Vérifier aussi ce rétablissement. Pour un service sans interruption, concevoir un basculement blue/green avec proxy et validation du trafic réel.

```bash
# Sur la cible après une promotion :
sudo docker inspect catalogue-preprod --format '{{.Config.Image}}'
sudo docker exec catalogue-preprod id -u
curl --fail http://127.0.0.1:8080/health
sudo cat /var/lib/cicd-demo/deployment.json
```

Pour revenir à une version antérieure :

1. Sélectionner une image déjà qualifiée et faire approuver le changement.
2. Récupérer ensemble `evidence/` et `reports/` depuis le canal de confiance ; utiliser le checkout, `SOURCE_SHA` et `RUN_ID` d’origine.
3. Renseigner `ROLLBACK_IMAGE_REF` et `ROLLBACK_EVIDENCE`, puis appeler `bash ci/run.sh rollback`.
4. Contrôler la santé, le digest et le comportement après l’action.

Au-delà de **72 h**, requalifier la candidate sans modifier sa date à la main. Ce retour approuvé est distinct du rétablissement local tenté après l’échec d’un déploiement.

La démonstration recrée des données SQLite jetables. Avec une vraie base, préparer des migrations compatibles, une sauvegarde testée et une restauration approuvée. Revenir à une image ne rétrograde pas le schéma et ne répare pas une perte de données.

### 6.8. Paramètres et adaptation à une autre application

| Paramètre | Type / défaut | Obligatoire / emplacement | Sensibilité et règles |
|---|---|---|---|
| SOURCE_SHA | SHA40/64 ; HEAD local | Export job, automatique par plateforme | Non secret ; doit égaler checkout |
| RUN_ID | chaîne sûre ; local | ID pipeline/build | Non secret ; distingue deux exécutions |
| IMAGE_REPOSITORY | dépôt OCI sans tag ; aucun | Build/qualify ; Azure cicd-config, GitLab registre projet | Non secret ; fixe aussi allowlist cible |
| REGISTRY_HOST | DNS[:port] ; GitLab CI_REGISTRY sinon aucun | build/qualify | Non secret ; TLS obligatoire |
| REGISTRY_USER | chaîne ; utilisateur CI GitLab sinon aucun | build/qualify, groupe cicd-registry | Identifiant, portée dépôt |
| REGISTRY_PASSWORD | jeton ; job token GitLab sinon aucun | Secret masqué, build/qualify seulement | Secret ; push CI, pull cible séparé |
| COV_MIN | entier ; 85 | Environnement du script quality | Minimum effectif 85 ; augmenter permis |
| READY_TIMEOUT | secondes ; 60 | Environnement qualify | Bornes à adapter à démarrage mesuré |
| SCAN_TIMEOUT | secondes ; 600 | build/qualify | Total externe ZAP ; Trivy borne interne |
| PYTHON_BASE et *_IMAGE | références par digest | ci/images.lock.env | Aucun secret, fichier revu versionné |
| TRUSTED_RUNNER_TAG | chaîne ; trusted-shell | GitLab variables | Runner protégé, dédié |
| QUALITY_RUNNER_TAG | chaîne ; trusted-shell | GitLab ; MR isolated-quality | VM MR distincte sans secret |
| Pool / demands | CI-Linux-Trusted / Linux + DockerTrusted | Azure YAML/templates | Autorisation de pool hors YAML |
| REPORT_RETENTION | durée ; 30 days | GitLab variables ; Azure politique projet | Définir rétention evidence équivalente et droits lecture |
| PREPROD_HOST/USER | DNS / deploy | Variables préproduction | Non secrets ; formats stricts |
| PREPROD_SSH_KEY | chemin fichier ; aucun | Variable File / DownloadSecureFile | Privée protégée, jamais artifact |
| PREPROD_KNOWN_HOSTS | chemin fichier ; aucun | File / Secure File | Intégrité critique, empreinte validée |
| PREPROD_URL | URL descriptive | GitLab environment, optionnelle | UI ; n'est pas la cible DAST |
| ROLLBACK_IMAGE_REF | OCI digest ; aucun | Procédure de retour arrière | Doit égaler preuve ancienne |
| ROLLBACK_EVIDENCE | chemin candidate ; aucun | Procédure de retour arrière | Paquet approuvé complet |

Pour adapter le socle, commencer par le dépôt OCI, les identités et la cible de préproduction. Mapper explicitement les variables Azure dans `env:` ; ne pas supposer qu’une variable existe dans le script.

Le DAST vise uniquement `http://application:8080`. Modifier ensemble alias, port, probe et hook sous revue. Pour Java, Node ou Go, remplacer code, outils et formats attendus dans `python-quality.sh`, puis tester les refus. Une commande shell libre passée en paramètre pourrait contourner la porte.

### 6.9. Docker Bench : audit dédié de l'hôte

Docker Bench audite l’hôte, le démon, les permissions et les paramètres de conteneurs. Il exige des accès administrateur : l’exécuter dans une maintenance autorisée, d’abord sur une VM pilote. Il ne fait pas partie des jobs applicatifs.

`ops/docker-bench.sh` exige root et un `BENCH_COMMIT` complet relu. Il conserve sources et journaux pour examiner chaque WARN/NOTE dans son contexte. Référence : [dépôt Docker Bench officiel](https://github.com/docker/docker-bench-security).

```bash
# Remplacer par un SHA complet vérifié dans le dépôt officiel et relu.
sudo BENCH_COMMIT=SHA40_VALIDE bash ops/docker-bench.sh
# Après durcissement : réexécuter la même révision, comparer résultats et tests Docker.
```

Un code `0` de Docker Bench ne certifie pas la conformité. Conserver inventaire, version Docker, commit d’audit, constats, décisions et preuves après correction. Évaluer l’impact d’un durcissement sur le service et dater toute acceptation de risque.

<a id="exploitation"></a>

## 7. Exploiter, diagnostiquer et démontrer la maîtrise du parcours

> **Avant de commencer :** travailler dans la VM Linux de laboratoire, depuis le dépôt. Le bilan intégré distingue les tests locaux déjà réalisés des essais GitLab, Azure, Docker et SSH à effectuer sur vos cibles.

### 7.1. Démarrer un diagnostic avec des faits

Avant une relance, relever plateforme, projet, pipeline, job, heure UTC, commit, action, premier message d’erreur et code de sortie. Pour une candidate, ajouter digest, exécution d’origine et cible. Ces éléments permettent de comparer deux essais sans copier les variables qui pourraient contenir des secrets.

```bash
# Diagnostic local non destructif, sans afficher les valeurs secrètes.
date -u +'%Y-%m-%dT%H:%M:%SZ'
id
git rev-parse HEAD
git status --short
docker version
docker system df
df -h

# Lire les statuts sans exécuter le contenu des artefacts.
python3 - <<'PY'
import json
from pathlib import Path
for path in sorted(Path("reports").glob("status-*.json")):
    print(path)
    for control, result in json.loads(path.read_text()).items():
        print(control, result["status"], result["exit_code"], result["report"])
PY
```

Le script liste les contrôles enregistrés. Une ligne absente ne vaut pas réussite : le job a pu s’arrêter avant la production du statut. Comparer le journal et la commande au périmètre exigé dans `ci/evidence.py`.

Retrouver d’abord tests et couverture dans `reports/unit.xml`, `reports/coverage.xml` et `.json`, puis les rapports d’outils et `reports/status-*.json`. Les preuves cumulatives sont dans `evidence/quality.json`, `build.json`, `image.env` et `candidate.json`. Utiliser le parseur fourni ; `source` ou `eval` exécuteraient le contenu d’un artefact téléchargé.

### 7.2. Fiches de dépannage

#### Fiche 1 — Runner GitLab indisponible

**Symptôme.** job en attente, aucun runner actif ou runner affiché hors ligne.

**Vérifications.** comparer les tags du job et du runner, son périmètre et son état dans GitLab. Sur la VM :

```bash
sudo systemctl status gitlab-runner --no-pager
sudo journalctl -u gitlab-runner --since '30 minutes ago' --no-pager
sudo gitlab-runner verify
```

**Interprétation.** service arrêté, jeton révoqué, mauvaise URL, problème DNS/TLS/proxy, runner suspendu, tags incompatibles, périmètre protégé inaccessible à la branche.

**Correction.** rétablir la connectivité ou le service, remplacer un jeton compromis par la procédure d'enregistrement, ou corriger les tags autorisés. Un runner protégé n'a pas à être ouvert à une branche non fiable pour débloquer un test. Ne pas publier `config.toml`, qui contient des informations sensibles.

**Contrôle final.** `verify` et état en ligne, puis exécution d'un petit job dans le même périmètre. Une connexion réussie au serveur ne prouve pas la présence de Docker ou des analyseurs : vérifier aussi le premier job réel.

#### Fiche 2 — Agent Azure hors ligne

**Symptôme.** aucun agent en ligne dans le pool demandé.

**Vérifications.** contrôler pool et statut dans Azure DevOps, puis, depuis le répertoire d'installation réel :

```bash
sudo ./svc.sh status
# Journaux _diag : examiner localement, puis expurger avant partage.
ls -lt _diag
```

**Interprétation.** service arrêté, agent désactivé, inscription invalide, réseau sortant refusé, proxy ou autorité TLS absents du service, permissions sur le dossier de l'agent.

**Correction.** appliquer la configuration réseau prévue au service, corriger ses droits ou refaire une inscription révoquée. Le secret utilisé pour enregistrer l'agent n'est pas une autorisation générale à donner au code du pipeline. Installer une nouvelle instance d'agent dans son propre répertoire, pas par-dessus un dossier en cours d'utilisation.

**Contrôle final.** agent en ligne dans le bon pool et exécution du premier pipeline. Après modification du `PATH` ou des capacités système, redémarrer le service de manière contrôlée et vérifier les capacités annoncées.

#### Fiche 3 — Job en file malgré une ressource en ligne

**Symptôme.** attente prolongée sans journal d'exécution.

**Vérifications.** lire le message de planification dans l'interface. Distinguer attente de capacité, attente d'approbation et dépendance non terminée. Vérifier `needs` ou `dependsOn`, la concurrence et l'accès aux ressources.

**Interprétation.** tags GitLab, exigences Azure non satisfaites, droits du pool, concurrence maximale atteinte, quota de jobs parallèles, verrou de déploiement, approbation ou ressource non autorisée.

**Correction.** ajuster uniquement le sélecteur incorrect, libérer une exécution bloquée selon la procédure ou dimensionner la capacité. Pour un verrou de préproduction, vérifier qu'aucun déploiement n'est encore actif avant d'intervenir. Une approbation attendue reste une décision de l'approbateur habilité.

**Contrôle final.** une seule exécution de test dans le bon pool/runner, avec début du job et identité attendue. Mesurer l'attente sur plusieurs exécutions avant de conclure que la capacité est suffisante.

#### Fiche 4 — Permission refusée sur le dépôt ou les rapports

**Symptôme.** `Permission denied`, rapport impossible à créer, fichiers appartenant à `root` après un conteneur d'outil.

**Vérifications.** sous l'identité du job, exécuter `id`, `ls -ld . reports evidence`, `df -h` et vérifier les montages dans la commande de l'outil. Lire les droits du chemin concerné, sans afficher les fichiers de secrets.

**Interprétation.** UID/GID du conteneur différent, montage en lecture seule, espace de travail réutilisé par un autre compte, droits de traversée d'un parent, répertoire plein.

**Correction.** rétablir la propriété du seul espace prévu sous contrôle administrateur ; configurer l'UID du conteneur quand l'outil le permet. Certains outils, comme ZAP, ont besoin de leur utilisateur et de leur `HOME` : la collecte peut alors passer par `docker cp`. Ne pas rendre tout le dépôt inscriptible par tous.

**Contrôle final.** recréer un rapport dans le job avec les droits attendus, puis vérifier le contrôle concerné et le transfert d'artefacts.

#### Fiche 5 — Démon Docker inaccessible

**Symptôme.** client présent mais `Cannot connect to the Docker daemon` ou accès refusé au socket.

**Vérifications.** `docker version`, `id`, `ls -l /var/run/docker.sock`, puis `sudo systemctl status docker --no-pager`. Vérifier le contexte sans publier un éventuel secret de connexion.

**Interprétation.** service arrêté, compte non autorisé, groupe ajouté après le démarrage du service runner/agent, mauvais `DOCKER_HOST`, contexte Docker différent ou socket absent.

**Correction.** utiliser le démon et l'identité prévus dans l'architecture, puis redémarrer le service runner/agent si l'appartenance de groupe a changé. Cet accès est très privilégié : il doit rester limité à la VM dédiée et au code approuvé. L'ajout au groupe `docker` ne constitue pas un traitement anodin.

**Contrôle final.** `docker info` sous le compte réel du job, puis petit job du projet. Le succès d'une commande sous `root` ne valide pas celui du compte de service.

#### Fiche 6 — Registre : authentification, autorisation ou image absente

**Symptôme.** `unauthorized`, `denied`, `manifest unknown`, certificat refusé ou échec de push/pull.

**Vérifications.** distinguer le code HTTP et l'action, vérifier le nom OCI dans le paramétrage et la durée de vie du jeton. Examiner les journaux de push/pull expurgés. Lister l'image et le digest côté registre avec un compte habilité. Le compte de préproduction doit disposer de lecture sur ce même dépôt.

**Interprétation.** secret expiré, mauvais hôte ou dépôt, droit de push manquant, jeton lié à un job terminé, image non publiée, nettoyage de rétention, architecture non disponible, autorité TLS inconnue.

**Correction.** renouveler l'identité selon le besoin exact, corriger le chemin, restaurer une candidate disponible ou en construire et qualifier une nouvelle. Configurer l'autorité de confiance ; ne pas passer le registre en mode non sécurisé pour faire disparaître une erreur de certificat.

**Contrôle final.** connexion et pull de **la référence par digest** sous l'identité concernée. Ne jamais saisir un mot de passe dans une ligne de commande ou le journal ; utiliser l'injection de secret et `--password-stdin` comme dans le script commun.

#### Fiche 7 — Artefact absent, modifié ou lié à une autre exécution

**Symptôme.** `Rapport manquant ou modifié`, `Preuve non valide`, fichier `image.env` absent ou candidate incomplète.

**Vérifications.** retrouver l'exécution d'origine et ses fichiers ; comparer `SOURCE_SHA` et `RUN_ID` à l'identité du manifeste. Le vérificateur requiert ces valeurs dans l'environnement :

```bash
# Définir SOURCE_SHA et RUN_ID avec les métadonnées réelles du pipeline.
# Ne pas inventer de nouvelles valeurs pour « faire passer » une preuve.
python3 ci/evidence.py verify-candidate evidence/candidate.json
```

**Interprétation.** publication réservée au succès, dépendance de téléchargement incorrecte, mauvaise racine d'artefact, rétention dépassée, mélange de deux pipelines, fichier altéré, étape précédente réellement échouée.

**Correction.** corriger les liens d'artefacts et republier depuis une exécution de confiance. Si le rapport est corrompu ou n'a jamais existé, refaire le contrôle nécessaire et la qualification. Pour une ancienne candidate, restaurer ensemble le paquet `evidence/` et `reports/`, puis utiliser le commit et l'identifiant d'origine.

**Contrôle final.** vérificateur réussi avec le paquet intact, correspondance du digest et absence de rapport repris d'une autre exécution. L'expiration de fraîcheur, fixée à 72 heures dans ce socle, impose une requalification ; ne pas changer l'horodatage à la main.

#### Fiche 8 — Application non joignable ou mauvaise candidate

**Symptôme.** attente de disponibilité expirée, connexion refusée, mauvaise révision, statut HTTP ou contenu inattendu.

**Vérifications.** consulter `reports/application.log`, `reports/http-functional.log`, les identifiants de ressources et `docker container ls --all`. Pendant une exécution de diagnostic autorisée, contrôler le réseau et le conteneur concernés ; ne pas lancer un scan vers une URL externe choisie au hasard.

**Interprétation.** processus arrêté, port incorrect, nom DNS absent, scanner hors du réseau, `localhost` employé depuis le mauvais conteneur, permissions sur SQLite, mauvaise image, service pas encore prêt.

**Correction.** rétablir l'écoute prévue, le réseau ou la configuration de données ; s'assurer que l'image provient de `evidence/image.env` et non d'un tag flottant. Augmenter `READY_TIMEOUT` seulement si le délai observé est normal et compatible avec le service. La valeur de référence est 60 secondes.

**Contrôle final.** le probe doit valider `/health` avec la révision attendue, `/api/items` avec le jeu exact et `/` avec le contenu prévu. Une page d'erreur d'un proxy ou un autre service répondant `200` ne suffit pas.

#### Fiche 9 — Scanner en erreur ou base de vulnérabilités indisponible

**Symptôme.** code non nul sans résultat de vulnérabilité exploitable, timeout, rapport vide, téléchargement de base refusé.

**Vérifications.** lire le code brut et `reports/<controle>.log`, vérifier le verrou d'images, l'espace disque et l'accès aux sources de données. Distinguer le code choisi pour une anomalie de celui d'une erreur technique. Les politiques de sortie varient selon l'outil.

**Interprétation.** réseau/proxy, quota fournisseur, mémoire, version incompatible, image d'outil invalide, mauvais montage ou format de commande, base absente/périmée.

**Correction.** corriger le problème technique, mettre à jour la base selon la politique et relancer. Si un fonctionnement hors ligne est autorisé, définir à l'avance la fraîcheur maximale et la preuve de la base utilisée. Le guide ne considère pas l'absence de données de vulnérabilités comme une validation.

**Contrôle final.** rapport valide portant sur la bonne cible, statut enregistré et décision de qualification cohérente. Un code `0` sans rapport n'autorise pas la suite.

#### Fiche 10 — DAST ZAP en échec

**Symptôme.** baseline avec alerte, code non nul, absence de site dans le rapport ou timeout.

**Vérifications.** lire `reports/dast.log`, `reports/zap/zap.json`, le rapport HTML et le résultat fonctionnel préalable. Vérifier le site, les chemins et la révision du service testé. Dans le [baseline officiel ZAP](https://www.zaproxy.org/docs/docker/baseline-scan/), les codes documentés distinguent réussite, alerte FAIL, alerte WARN et erreur d'exécution ; conserver le code brut au lieu de le convertir en réussite.

**Interprétation.** anomalie HTTP, application non explorée, réseau incorrect, endpoint en panne, politique d'alertes non satisfaite, ZAP interrompu avant publication.

**Correction.** corriger les en-têtes ou comportements en cause, rétablir l'accès et relancer sur l'environnement prévu. Une dérogation nécessite la décision et le mécanisme effectivement autorisés. Un scan actif doit faire l'objet d'un périmètre de test autorisé distinct.

**Contrôle final.** rapport présent avec site attendu, contrôle conforme à la politique, et logs de disponibilité cohérents. Cette démonstration ne fournit pas de preuve d'analyse de fonctions authentifiées : l'application n'en possède pas.

#### Fiche 11 — Déploiement ou retour arrière de préproduction refusé

**Symptôme.** attente d'approbation, référence non admise, SSH refusé, empreinte d'hôte incorrecte, pull refusé ou santé en échec.

**Vérifications.** vérifier l'identité qui décide, la cible, le digest et les preuves avant d'examiner SSH. Contrôler l'empreinte d'hôte par un canal fiable et les journaux expurgés de promotion. Le compte distant doit déjà disposer de l'accès registre en lecture prévu.

**Interprétation.** branche non protégée, autorisation d'environnement absente, candidate expirée, paquet incohérent, clé de déploiement incorrecte, cible modifiée, registre non accessible depuis la cible, port ou ressources indisponibles.

**Correction.** rétablir les droits exacts et la configuration de cible ; une nouvelle empreinte SSH exige une vérification, pas une désactivation de la vérification. Requalifier une candidate périmée. Si la version déployée échoue, appliquer la procédure de retour compatible avec les données et prévenir les personnes concernées selon le processus du service.

**Contrôle final.** vérifier sur la cible le digest réellement exécuté, la révision HTTP et le scénario fonctionnel. Conserver le résultat même si la correction consiste à revenir à la version précédente.

#### Fiche 12 — Disque plein ou ressources temporaires orphelines

**Symptôme.** `No space left on device`, création de réseau impossible, conteneurs arrêtés persistants ou saturation disque.

**Vérifications.** `df -h`, `df -i`, `docker system df` et inventaire ciblé :

```bash
# Lecture seule : lister seulement les ressources de cette démonstration.
docker container ls --all --filter label=cicd.demo=true
docker network ls --filter label=cicd.demo=true
```

**Interprétation.** caches et images accumulés, logs sans rotation, annulation brutale, plusieurs jobs concurrents, rétention excessive.

**Correction.** sauvegarder les preuves utiles, identifier le propriétaire et l'âge, puis supprimer uniquement les ressources périmées du laboratoire après vérification d'absence de job actif. Configurer la rotation des logs et une capacité adaptée. `docker system prune -a --volumes` est trop large pour être une procédure d'entretien partagé ; il peut supprimer des données nécessaires.

**Contrôle final.** espace suffisant, aucun objet du job terminé restant au-delà de sa durée de vie et pipeline suivant sans collision. Une interruption brutale de l'hôte exige un mécanisme périodique de rattrapage, même si un `trap` existe.

### 7.3. Entretien des runners et agents persistants

Administrer les exécuteurs commence par un inventaire : OS, architecture, versions, projets autorisés, mode d’exécution, capacité, réseau, certificats et date de revue. Le socle cible Linux `amd64` ; vérifier images et scripts avant de changer d’architecture.

| Fréquence proposée | Opération | Vérification / preuve |
|---|---|---|
| À chaque job | Noms uniques, délais maximums, nettoyage et rapports | Absence de collision, statut réel et preuves liées à l'exécution |
| Chaque jour ouvré | État des ressources, espace disque, files et erreurs récurrentes | Alertes utiles, propriétaire et action sur la cause |
| Chaque semaine | Échecs instables, ressources orphelines, fraîcheur des données de scan | Liste des anomalies et décisions d'amélioration |
| Selon le calendrier de correctifs | OS, Docker, runner/agent et outils | Fenêtre, sauvegarde de configuration, version avant/après, premier pipeline |
| À la rotation ou au départ d'une personne | Secrets, clés, droits de projet et d'environnement | Ancien accès révoqué, nouveau validé et journaux examinés |
| À chaque évolution du template | Validation sur scénario représentatif et erreur volontaire | Résultat attendu, absence de désactivation silencieuse, version diffusée |
| Périodiquement selon le risque | Exercice de retour arrière et revue des changements standardisés | Délai réel, données compatibles et preuves encore disponibles |

**Avant la maintenance :** drainer l’exécuteur, c’est-à-dire bloquer les nouveaux jobs et laisser finir ceux en cours. Noter les versions et appliquer une opération à la fois.

**Avant de rouvrir :** vérifier service, réseau, capacités et pipeline de recette. Ne pas mettre dans un cache partagé un espace contenant secrets ou preuves de candidate.

Pour renouveler un secret : créer sa nouvelle valeur, l’injecter dans le coffre ou la variable prévue, vérifier son usage puis révoquer l’ancienne. En cas de fuite, révoquer rapidement et examiner les journaux. Masquer une valeur dans les logs ne l’efface ni du dépôt ni des anciennes images.

### 7.4. Mesurer le pipeline pour l'améliorer

Comparer des exécutions comparables : même type de pipeline, période définie et heures UTC. Séparer l’attente des machines, l’attente d’approbation et le temps de calcul. Relier chaque relance à son essai initial.

| Indicateur interne | Définition et unité | Collecte | Lecture et action |
|---|---|---|---|
| Attente de job | Début réel moins instant où le job devient exécutable, en secondes | Métadonnées CI et file de ressources | Médiane et P95 ; vérifier capacité, sélecteurs et quotas |
| Attente d'approbation | Décision moins disponibilité de la candidate, en minutes | Événements d'environnement / changement | Vérifier suppléance, clarté des preuves et modèle d'autorisation |
| Durée de pipeline | Fin moins début, en minutes, séparée par résultat | API / historique de la plateforme | Observer le chemin critique ; une moyenne seule masque les longs cas |
| Taux d'échec technique | Exécutions échouées pour infrastructure/outils ÷ exécutions terminées, en % | Catégorie de cause issue du diagnostic | Suivre fiabilité de la chaîne séparément des défauts détectés |
| Taux de défaut détecté | Exécutions bloquées par anomalie produit ÷ exécutions contrôlées, en % | Statuts de contrôle et tickets | Une hausse peut refléter une meilleure détection ; examiner les causes |
| Test instable | Test échouant puis réussissant avec code et contexte équivalents, en nombre et % | JUnit, relances, historique de test | Isoler la cause ; suivre les quarantaines sans masquer leur dette |
| Délai de correction | Correction validée moins ouverture du défaut, en heures/jours | Tickets et première exécution validée | Segmenter par sévérité et propriétaire ; ne pas mesurer seulement fermeture administrative |
| Fiabilité préproduction | Déploiements satisfaisant les vérifications après déploiement ÷ déploiements tentés, en % | Logs de déploiement et probes | Relier les échecs à version, configuration et données |
| Efficacité du cache | Accès utiles / accès totaux et durée gagnée, en % / secondes | Logs et essais comparables | Conserver seulement si bénéfice et résultats identiques |
| Nettoyage effectif | Ressources temporaires restantes après échéance, en nombre | Inventaire par label et âge | Corriger les chemins d'annulation et dimensionner les ressources |

**Exemple.** Sur 20 pipelines terminés, 3 échouent à cause d’un outil et 2 révèlent un défaut de l’application. L’échec technique vaut `3 / 20 = 15 %` ; le total échoué vaut `25 %`. Ces taux répondent à deux questions différentes. Préciser aussi le traitement des annulations ; une mesure absente n’est pas zéro.

Observer la médiane et le P95, le délai sous lequel se terminent 95 % des exécutions. Vérifier le volume et la stabilité de la population avant d’attribuer un gain à une modification. Ces mesures servent l’amélioration de l’équipe.

#### Métriques de livraison DORA : périmètre distinct

La [référence officielle DORA](https://dora.dev/guides/dora-metrics/), mise à jour le 5 janvier 2026 et consultée le 20 octobre 2026, décrit désormais cinq mesures. Ce tableau en paraphrase la définition ; les sources de collecte sont des propositions locales.

<details>
<summary>Approfondir — les cinq mesures DORA et leur collecte</summary>

| Mesure DORA | Définition abrégée / unité | Collecte proposée |
|---|---|---|
| Change lead time | Délai commit → production, heures ou jours | Git et événement de production |
| Deployment frequency | Fréquence des déploiements, par période | Historique de production |
| Failed deployment recovery time | Temps de rétablissement d'un déploiement échoué nécessitant une intervention, minutes | Événement de déploiement et incident |
| Change fail rate | Part des déploiements exigeant une intervention immédiate, % | Historique relié aux incidents / correctifs |
| Deployment rework rate | Part des déploiements non planifiés provoqués par un incident de production, % | Déploiements et motif de changement |

</details>

Ces mesures s'interprètent ensemble, par service et dans la durée. Un laboratoire qui s'arrête en préproduction ne produit pas de mesures DORA de production. Il peut mesurer des indicateurs analogues explicitement nommés « préproduction ». Ne pas rebaptiser le délai d'un job ou la durée de tous les incidents « DORA MTTR ».

### 7.5. Exercices progressifs avec corrections

Réaliser les injections dans une **copie de laboratoire** ou une branche dédiée, sans secrets réels et sans droits de préproduction. Ne pas publier une anomalie volontaire sur la branche principale. Pour chaque exercice : conserver l'état initial, le changement, le résultat en échec et le résultat après correction. Les exemples n'ont pas été exécutés dans les comptes SaaS du lecteur.

#### Exercice 1 — Lire le graphe et les identités, niveau D

**But :** retrouver pourquoi le job de qualification dépend de l'image et des preuves de build.

**Manipulation :** ouvrir le YAML choisi, trouver `quality`, `build`, `qualify` et le déploiement. Identifier le mécanisme d'artefacts, puis lire `evidence/candidate.json` après un pipeline réussi. Dessiner les relations entre commit, exécution, rapport, image et environnement.

**Résultat attendu :** aucun job de promotion ne reconstruit l'image ; les rapports sont récupérés depuis les bonnes dépendances.

**Correction :** le pipeline transmet des preuves et une référence d'image. La récupération du code par le job suivant ne transmet pas automatiquement les fichiers produits. Une variable de digest sans le paquet correspondant ne suffit pas à la qualification.

#### Exercice 2 — Déclencher un vrai échec de test, niveau P

**Prérequis :** dépendances Python de développement installées dans un environnement virtuel selon le guide applicatif. Le fichier temporaire doit rester dans la copie de laboratoire.

```bash
# Créer un test explicite, sans secret et sans modification de l'application.
cat > tests/test_injection_pedagogique.py <<'PY'
def test_blocage_pedagogique():
    assert False, "Injection pédagogique : ce test doit bloquer"
PY

# La commande doit échouer ; examiner aussi la trace JUnit en CI.
python3 -m pytest tests/test_injection_pedagogique.py -q
```

**Résultat attendu :** un test échoué. Dans une exécution CI de la branche de laboratoire, `quality` échoue, les preuves de diagnostic sont publiées et aucune candidate qualifiée n'est produite.

**Correction :** supprimer uniquement le test d'injection après observation, ou le remplacer par une assertion vraie correspondant à un comportement utile. Relancer le vrai ensemble de tests, puis la CI. Désactiver la commande de test ou ajouter un succès forcé ne valide pas l'exercice.

#### Exercice 3 — Un contrôle obligatoire ne se désactive pas avec un seuil bas, niveau P

**Manipulation :** dans la copie de laboratoire configurée pour les outils, lancer :

```bash
COV_MIN=0 bash ci/run.sh quality
```

**Résultat attendu :** le minimum de politique reste 85 %. Le succès de cette commande sur une application déjà bien couverte ne démontre pas le mécanisme ; lire la règle et ajouter temporairement du comportement applicatif non couvert dans la branche de laboratoire pour observer le blocage, sans modifier les contrôles. Une baisse de couverture réelle doit être mesurée dans `coverage.xml`.

**Correction :** écrire les tests du comportement ajouté, ou retirer cette modification d'exercice. Le paramètre permet d'exiger davantage ; il ne réduit pas le plancher de politique. Vérifier la couverture mesurée et la décision finale, pas seulement la valeur d'une variable.

#### Exercice 4 — Rapport manquant ou altéré, niveau P

**Prérequis :** copie intacte d'un paquet issu d'un `build` réussi ; `SOURCE_SHA` et `RUN_ID` correspondent à son origine.

```bash
# Le sous-shell restaure le seul fichier modifié, même après l'échec attendu.
(
  sauvegarde_exercice=$(mktemp)
  cp reports/sbom.cdx.json "$sauvegarde_exercice"
  trap 'cp "$sauvegarde_exercice" reports/sbom.cdx.json; rm -f "$sauvegarde_exercice"' EXIT
  printf '\n' >> reports/sbom.cdx.json
  python3 ci/evidence.py verify evidence/build.json
)
```

**Résultat attendu :** refus pour empreinte de rapport modifiée, même si le JSON reste syntaxiquement lisible. Le vérificateur doit refuser l'absence du fichier de la même façon.

**Correction :** restaurer le paquet intact de sa source de confiance ou refaire le contrôle, puis refaire la qualification prévue. Le sous-shell restaure ici le fichier pour la démonstration ; il ne démontre pas à lui seul la confiance dans son origine.

#### Exercice 5 — Mauvaise révision HTTP, niveau P

**Prérequis :** service de démonstration démarré localement à l'URL indiquée ci-dessous, dans le laboratoire uniquement. Adapter le port au lancement réellement effectué.

```bash
# La révision fictive ne doit pas être acceptée.
python3 tests/http_probe.py http://127.0.0.1:8080 revision-incorrecte 3
```

**Résultat attendu :** erreur « Application indisponible ou mauvaise révision » dans un délai borné, même si `/health` renvoie HTTP 200.

**Correction :** pointer sur la bonne image et fournir la révision complète attendue par le service. Dans la CI, la cible utilise le nom `application` sur le réseau de qualification ; `127.0.0.1` dans un conteneur scanner ne désigne pas l'application voisine.

#### Exercice 6 — Runner ou agent sans sélection compatible, niveau A

**Manipulation :** dans un YAML de laboratoire, demander un tag GitLab absent ou une exigence Azure inexistante. Ne pas modifier le runner/agent partagé. Observer le message de planification, puis annuler ce job pour libérer la file.

**Résultat attendu :** attente sans exécution ; aucun rapport de test n'est créé. Un job en attente ne correspond pas à une application en échec.

**Correction :** remettre le sélecteur du runner/pool configuré et exécuter un job. Relever l'attente avant correction et le succès après. Il n'est pas nécessaire de donner plus de permissions à l'agent.

#### Exercice 7 — Refus d'accès au registre, niveau A

**Manipulation :** dans une copie de pipeline sans promotion, utiliser une identité de laboratoire dépourvue de droit de push sur un dépôt de test. Ne pas employer de mauvais mots de passe répétés contre un compte réel. Exécuter le parcours jusqu'au premier accès nécessitant ce droit.

**Résultat attendu :** build analysé localement possible, publication refusée, aucune candidate complète ni promotion. Le rapport doit désigner une erreur d'autorisation, pas une vulnérabilité.

**Correction :** attribuer le seul droit requis au compte de laboratoire ou choisir son dépôt autorisé ; refaire le pipeline complet pour produire des preuves cohérentes. Vérifier ensuite qu'un compte de préproduction en lecture ne peut pas pousser une image.

#### Exercice 8 — Interpréter un baseline et ses limites, niveau P/A

**Manipulation :** retrouver dans le rapport ZAP l'URL du service, les alertes et les chemins. Comparer avec les trois routes testées par le probe et les logs applicatifs. Ajouter ensuite dans une branche de laboratoire une modification d'en-tête HTTP qui enfreint une règle applicable, sans changer la politique.

**Résultat attendu :** le rapport reflète la cible et l'alerte ; la décision correspond au code réel et à la politique. Si aucune règle du baseline ne couvre l'injection choisie, expliquer cette limite au lieu de déclarer un succès de sécurité.

**Correction :** rétablir l'en-tête et la qualification. Répondre explicitement : « Ce baseline public n'a pas testé d'authentification ». Pour un service authentifié différent, concevoir puis vérifier un contexte d'accès autorisé ; ne pas inférer la couverture des routes protégées depuis celle des routes publiques.

#### Exercice 9 — Promotion du même digest et retour arrière, niveau A

**Prérequis :** cible de préproduction de laboratoire préparée, identité autorisée, approbation explicite, paquet qualifié frais et configuration documentée. Cet exercice modifie la cible : le réaliser seulement dans le périmètre convenu.

1. Noter la version actuelle, son digest et le paquet de preuves approuvé qui permettra le rétablissement.
2. Autoriser la nouvelle candidate selon les contrôles de la plateforme ; lancer le job `promote` prévu, sans reconstruire l'image.
3. Vérifier sur la cible digest, révision, santé et comportement ; conserver `reports/preproduction.log` avec la décision.
4. Pour le retour arrière, restaurer le paquet `evidence/` **et** `reports/` de la version précédente, ainsi que son commit et son `RUN_ID` d'origine. Fournir `ROLLBACK_IMAGE_REF` et `ROLLBACK_EVIDENCE` pointant vers son `candidate.json` approuvé.
5. Lancer le job `rollback` selon son autorisation propre, puis contrôler digest, santé et fonction. Conserver le motif et le résultat.

**Résultat attendu :** chaque version déployée correspond au digest de son paquet vérifié. Un paquet périmé de plus de 72 heures est refusé : requalifier avant usage dans ce socle. La nouvelle décision de retour arrière doit être traçable même si les preuves applicatives viennent d'une exécution antérieure.

**Correction :** si le digest diffère, arrêter la décision et résoudre l'incohérence. Si les données ne sont plus compatibles, appliquer une procédure de restauration ou un correctif en avant prévu à l'avance. Le retour à une ancienne image n'annule pas une migration irréversible ; la démonstration SQLite jetable ne valide pas une procédure de données de production.

#### Exercice 10 — Exception et incident, niveau A

**Manipulation :** rédiger une fiche d'exception pour une anomalie d'exercice avec motif, règle, ressource, propriétaire, approbateur, échéance et correction. Dans le socle, `config/exceptions.json` reste vide pour le parcours normal : une liste non vide est refusée tant que son traitement n'est pas implémenté et revu. Rédiger ensuite une chronologie d'incident à partir de l'un des échecs précédents.

**Résultat attendu :** la fiche organisationnelle ne change pas le résultat technique. L'incident distingue symptôme, impact, diagnostic, décision de rétablissement, résultat et action de prévention.

**Correction :** corriger l'anomalie ou développer un mécanisme d'exception précisément limité, protégé et testé, sous la politique adoptée par l'équipe. Un fichier ajouté, un commentaire ou une approbation orale ne remplace pas le contrôle technique.

### 7.6. Recette de fin de parcours

Réaliser cette recette séparément pour GitLab et Azure si les deux parcours sont déclarés opérationnels. Pour chaque critère, joindre une preuve réelle, sa date et son propriétaire.

| Critère | Preuve à joindre | Résultat réel / date / propriétaire |
|---|---|---|
| VM compatible et identité de service | OS, architecture, versions et droits effectifs | À renseigner |
| Runner / agent enregistré et isolé | Périmètre, premier job et journaux expurgés | À renseigner |
| Projet et ressources protégés | Règles de branche, droits, templates et approbations hors YAML | À renseigner |
| Qualité et sécurité exécutées | Rapports non vides, tests réels, statuts et politique | À renseigner |
| Anomalie volontaire bloquante | Échec d'exercice et absence de promotion | À renseigner |
| Image identifiée et testée | Commit, exécution, digest, SBOM, tests et DAST | À renseigner |
| Données et nettoyage reproductibles | Jeu synthétique et inventaire avant/après | À renseigner |
| Promotion autorisée du même digest | Décision et vérifications de préproduction | À renseigner |
| Retour arrière démontré | Paquet précédent, délai réel et résultat fonctionnel | À renseigner |
| Adaptation à un autre projet | Analyseurs adaptés, paramètres, tests et revue de politique | À renseigner |
| Entretien et amélioration prévus | Propriétaire, prochaine revue et mesure de départ | À renseigner |

Renseigner la grille à partir des résultats observés. Justifier tout critère non applicable. La recette est exploitable lorsqu’un collègue peut relire les preuves, expliquer la décision et refaire la procédure.

<a id="sources"></a>

## 8. Sources, versions retenues et limites de validation

Retour au [guide principal](#fondamentaux).

### 8.1. Date, méthode et sens du mot « vérifié »

**Dates de lecture :** 20 octobre 2026 pour les versions et syntaxes des outils ; **22 octobre 2026 pour le portfolio ITIL 4/CALMS et les sources de gouvernance revérifiées**, fuseau Europe/Paris. Le portfolio est une ressource pédagogique ; PeopleCert décrit le référentiel ITIL et DORA définit ses métriques. Les choix de mise en œuvre restent ceux de ce laboratoire. Conserver dans votre recette les versions et preuves réellement utilisées.

Trois niveaux sont distingués dans ce guide :

| Niveau | Ce qui est établi | Ce qui n'en découle pas |
|---|---|---|
| Vérification documentaire | Une information est décrite dans une source accessible et identifiée ; son rôle de référence officielle ou de support pédagogique est précisé | Le binaire ou le service a été exécuté dans ce laboratoire |
| Vérification locale | Une commande ou un test a réellement été exécuté sur le poste de rédaction | La même commande est validée dans une VM Linux ou un service SaaS |
| Recette cible | Le lecteur exécute le parcours sur ses VM, son registre et sa plateforme, puis archive les preuves | Une compatibilité universelle ou une absence de vulnérabilité future |

Les numéros ci-dessous sont des **versions retenues pour le scénario**, sans affirmation générale qu'il s'agit des dernières versions disponibles. Une release officielle ne suffit pas à établir qu'une image OCI homonyme est accessible sur votre réseau ou contient exactement le binaire attendu : le pull, le digest et la commande de version font partie de la recette.

### 8.2. Matrice des plateformes et composants d'exécution

| Composant | Référence retenue | Source primaire consultée | Vérification cible nécessaire |
|---|---|---|---|
| VM Linux | Ubuntu 24.04 LTS ou Debian 12, amd64 | [Docker Ubuntu](https://docs.docker.com/engine/install/ubuntu/), [Docker Debian](https://docs.docker.com/engine/install/debian/), [agent Azure v5](https://learn.microsoft.com/en-us/azure/devops/pipelines/agents/v5-agent?view=azure-devops) | Correctifs OS, architecture, réseau, CA, espace et mémoire |
| Docker Engine / CLI | Version exacte du dépôt APT officiel sélectionnée pendant la préparation | [Installation Ubuntu](https://docs.docker.com/engine/install/ubuntu/), [installation Debian](https://docs.docker.com/engine/install/debian/) | Archiver `docker version`, version Buildx/BuildKit et paquets installés |
| GitLab | GitLab.com ou instance compatible avec le YAML et ses fonctionnalités | [Référence YAML](https://docs.gitlab.com/ci/yaml/) | Version serveur, offre, droits de projet et validation GitLab |
| GitLab Runner | Couple `gitlab-runner` / `gitlab-runner-helper-images` de même version APT, choisi pour l'instance | [Dépôt officiel](https://docs.gitlab.com/runner/install/linux-repository/), [enregistrement](https://docs.gitlab.com/runner/register/) | Relever version exacte, service, accès Docker et premier job |
| Exécuteur GitLab | Shell Bash, VM dédiée au code approuvé | [Shell executor](https://docs.gitlab.com/runner/executors/shell/) | Protection du runner et séparation réelle des MR non fiables |
| Agent Azure Pipelines | Linux x64 **5.280.0**, pour le parcours Services | [Release Microsoft](https://github.com/microsoft/azure-pipelines-agent/releases/tag/v5.280.0), [matrice v5](https://learn.microsoft.com/en-us/azure/devops/pipelines/agents/v5-agent?view=azure-devops) | SHA-256 du paquet, dépendances, service et version exposée par le pool |
| Azure DevOps Server | Version d'agent admise par la version et les correctifs du serveur | [Compatibilité de l'agent v5](https://learn.microsoft.com/en-us/azure/devops/pipelines/agents/v5-agent?view=azure-devops) | Adapter tâches et artefacts ; ne pas déduire la prise en charge de Services |

La page générale [Linux Azure agent](https://learn.microsoft.com/en-us/azure/devops/pipelines/agents/linux-agent?view=azure-devops) décrit encore la génération 4.x/.NET 8, alors que la [page v5](https://learn.microsoft.com/en-us/azure/devops/pipelines/agents/v5-agent?view=azure-devops) décrit .NET 10 et cite Debian 12 et Ubuntu 24.04. Le parcours tient compte de cette différence de mise à jour documentaire. Le runtime de l'agent est autonome ; il ne choisit pas la version Python de l'application et ne remplace pas les prérequis propres aux tâches de publication de couverture.

La [release 5.280.0](https://github.com/microsoft/azure-pipelines-agent/releases/tag/v5.280.0) publie les empreintes des archives. Pour `vsts-agent-linux-x64-5.280.0.tar.gz`, l'empreinte reprise dans le parcours est `f0daf1ce526af0b5eebf420249d21689de10faf00ffb0f19851626eb4352d791`. Un autre nom de paquet, même avec le même numéro d'agent, possède une autre empreinte.

La documentation d'installation Runner affichait encore une date d'expiration de clé de paquet au **28 avril 2026**. Le guide ne présente pas cette clé comme valide au 20 octobre. Les signatures des métadonnées APT et la signature individuelle d'un `.deb` sont des mécanismes différents ; une politique imposant cette dernière exige une source de clé encore valide. Une erreur de signature ne justifie pas sa désactivation.

### 8.3. Images d'outils et image de base

Les valeurs du tableau correspondent à [ci/images.env](#fichier-ci-images-env). Elles amorcent [ci/lock-images.sh](#fichier-ci-lock-images-sh), qui résout des références OCI par digest. Les jobs refusent volontairement l'absence de `ci/images.lock.env`. Ce verrou n'a pas été généré sur le poste de rédaction, où Docker est absent.

| Variable | Tag de départ | Source primaire de version ou d'image | État réel |
|---|---|---|---|
| `PYTHON_BASE` | `python:3.13-slim-bookworm` | [Catalogue des images Python officielles](https://github.com/docker-library/official-images/blob/master/library/python) | Alias de version mineure et distribution ; patch réel à relever après pull |
| `TRIVY_IMAGE` | `aquasec/trivy:0.76.0` | [Release Trivy v0.76.0](https://github.com/aquasecurity/trivy/releases/tag/v0.76.0) | Release documentée ; pull et scans non exécutés ici |
| `GITLEAKS_IMAGE` | `ghcr.io/gitleaks/gitleaks:v8.30.1` | [Release Gitleaks v8.30.1](https://github.com/gitleaks/gitleaks/releases/tag/v8.30.1) | Version et CLI documentés ; scanner conteneur non exécuté |
| `HADOLINT_IMAGE` | `hadolint/hadolint:2.15.1` | [Release Hadolint v2.15.1](https://github.com/hadolint/hadolint/releases/tag/v2.15.1) | Version et Dockerfile officiel consultés ; scan non exécuté |
| `DOCKLE_IMAGE` | `goodwithtech/dockle:v0.4.15` | [Release Dockle v0.4.15](https://github.com/goodwithtech/dockle/releases/tag/v0.4.15) | CLI de ce tag consulté ; analyse d'archive non exécutée |
| `CHECKOV_IMAGE` | `bridgecrew/checkov:3.3.29` | [Release Checkov 3.3.29](https://github.com/bridgecrewio/checkov/releases/tag/3.3.29) | Release et référence CLI consultées ; scan conteneur non exécuté |
| `ZAP_IMAGE` | `ghcr.io/zaproxy/zaproxy:stable` | [Téléchargements et images ZAP](https://www.zaproxy.org/download/) | Alias mutable à remplacer par digest ; version interne à relever |

Le site ZAP consulté présente **2.17.0**, et documente l'image `ghcr.io/zaproxy/zaproxy:stable`. Cela ne constitue pas une mesure de la version exacte contenue dans le tag `stable` au moment de votre pull. Ne pas écrire dans une preuve « ZAP 2.17.0 exécuté » sans l'avoir relevé dans l'image retenue.

Les API de tags Docker Hub interrogées avec l'outil web n'ont pas été accessibles pendant cette rédaction. Les releases citées ont été consultées, mais l'existence et l'accessibilité effectives de tous les manifestes OCI doivent être confirmées par `ci/lock-images.sh` sur la VM. Aucun digest fictif n'est livré comme résultat d'un pull.

```bash
# Dans le dépôt sur le poste de préparation Linux : accès réseau et Docker requis.
bash ci/lock-images.sh
cat ci/images.lock.env

# Conserver également les versions observées et la configuration non sensible.
docker version
docker buildx version
git --version
python3 --version
```

Relire puis versionner le verrou avant le premier pipeline. Un digest identifie le contenu ; il ne prouve pas à lui seul sa provenance approuvée ou sa sécurité. L'origine du registre, la revue du changement et les contrôles de l'image restent nécessaires. Une mise à jour des tags de départ et du verrou est un changement à qualifier.

### 8.4. Dépendances Python explicitement épinglées

Les fichiers [requirements.txt](#fichier-requirements-txt) et [requirements-dev.txt](#fichier-requirements-dev-txt) constituent la référence exécutable. Les pages de paquets ci-dessous confirment les versions choisies ; elles ne garantissent pas l'absence de vulnérabilités aujourd'hui ou demain.

| Paquet | Version retenue | Usage | Source primaire |
|---|---|---|---|
| Jinja2 | 3.1.6 | Rendu HTML applicatif | [Publication PyPI](https://pypi.org/project/Jinja2/3.1.6/) |
| MarkupSafe | 3.0.3 | Échappement, dépendance de Jinja2 | [Publication PyPI](https://pypi.org/project/MarkupSafe/3.0.3/) |
| pytest | 8.4.2 | Assertions et rapports JUnit | [Publication PyPI](https://pypi.org/project/pytest/8.4.2/) |
| pytest-cov | 6.3.0 | Collecte et export de couverture | [Publication PyPI](https://pypi.org/project/pytest-cov/6.3.0/) |
| Ruff | 0.13.3 | Lint Python | [Publication PyPI](https://pypi.org/project/ruff/0.13.3/) |
| Bandit | 1.9.4 | SAST adapté aux AST Python utilisés | [Publication PyPI](https://pypi.org/project/bandit/1.9.4/) |
| pip-audit | 2.9.0 | Vulnérabilités des dépendances Python | [Publication PyPI](https://pypi.org/project/pip-audit/2.9.0/) |
| yamllint | 1.37.1 | Syntaxe et style des configurations YAML | [Publication PyPI](https://pypi.org/project/yamllint/1.37.1/) |
| PyYAML | 6.0.3 | Analyse syntaxique YAML locale | [Publication PyPI](https://pypi.org/project/PyYAML/6.0.3/) |

Les dépendances de développement transitives ne sont pas toutes figées par empreinte dans ce socle. Une reproductibilité plus stricte nécessite un verrou complet avec hashes, une politique d'index et sa mise à jour contrôlée. Le conteneur Python est verrouillé par digest, mais cela ne fige pas automatiquement les paquets que pip télécharge ensuite.

Le poste de rédaction utilise **Python 3.14.0 sous Windows** ; l'image cible reste Python **3.13 sur Debian Bookworm**. Les essais locaux réduisent le risque d'erreurs applicatives ; les essais dans l'image cible restent obligatoires. La version de Bandit réellement exécutée doit être relevée avec le même interpréteur que celui du scan ; un paquet installé dans un autre dossier ne constitue pas une preuve de la version active.

### 8.5. Points de syntaxe et de comportement contrôlés

| Sujet | Vérification et conséquence dans le code | Source primaire |
|---|---|---|
| Hadolint Docker | L'image 2.15.1 définit un `CMD`, pas un `ENTRYPOINT` ; le script fournit `hadolint` explicitement et capture son JSON stdout dans le fichier prévu | [Dockerfile du tag v2.15.1](https://raw.githubusercontent.com/hadolint/hadolint/v2.15.1/docker/Dockerfile) |
| Checkov sortie | `--output-file-path` désigne normalement un dossier ; le socle capture directement stdout JSON pour obtenir exactement `reports/iac.json` | [Référence CLI](https://www.checkov.io/2.Basics/CLI%20Command%20Reference.html) |
| Checkov règles | `CKV_DOCKER_2` : HEALTHCHECK ; `CKV_DOCKER_3` : USER ; `CKV_DOCKER_5` : absence d'update isolé dans une instruction RUN. La préférence COPY/ADD correspond à `CKV_DOCKER_4` | [Index Dockerfile](https://www.checkov.io/5.Policy%20Index/dockerfile.html) |
| Checkov erreur de parsing | `CKV_PARSE_ERROR_FAIL=true` conserve le blocage pour les erreurs de lecture ; la porte contrôle aussi les résultats et les IDs attendus | [Code officiel des résultats](https://github.com/bridgecrewio/checkov/blob/main/checkov/common/output/report.py) |
| Dockle | `--input` accepte une archive Docker ; `--exit-code 10 --exit-level WARN` bloque les alertes WARN/FATAL ; `--format json --output` conserve le rapport | [CLI du tag v0.4.15](https://raw.githubusercontent.com/goodwithtech/dockle/v0.4.15/pkg/app.go) |
| Gitleaks | Mode `git`, historique disponible, options `--all HEAD` ; miroir temporaire pour les worktrees dont `.git` est un fichier pointant hors du montage | [Git CLI v8.30.1](https://github.com/gitleaks/gitleaks/blob/v8.30.1/sources/git.go) |
| Trivy image | Analyse d'archive, sévérités explicites, code non nul et export CycloneDX sont des paramètres distincts ; la SBOM ne vaut pas verdict de vulnérabilité | [CLI image](https://trivy.dev/docs/latest/references/configuration/cli/trivy_image/) |
| ZAP baseline | Codes 0/1/2/3 conservés ; baseline reste une exploration et analyse passive, distincte d'un scan actif | [Baseline](https://www.zaproxy.org/docs/docker/baseline-scan/) |
| Hooks ZAP | `zap_started(zap, target)` envoie les requêtes du scénario ; `zap_pre_shutdown(zap)` exporte les URL de la session | [Scan hooks](https://www.zaproxy.org/docs/docker/scan-hooks/) |
| GitLab jetons | Jeton Runner `glrt-` distinct du jeton de job ; `CI_JOB_TOKEN` et le mot de passe registre associé expirent avec le job | [Runner](https://docs.gitlab.com/runner/register/), [job token](https://docs.gitlab.com/ci/jobs/ci_job_token/) |
| GitLab approbation | Les environnements protégés et leurs approbations exigent Premium/Ultimate ; un job manuel seul ne démontre pas une approbation indépendante | [Protected environments](https://docs.gitlab.com/ci/environments/protected_environments/), [approvals](https://docs.gitlab.com/ci/environments/deployment_approvals/) |
| Azure approbation | Les Approvals and checks appartiennent aux ressources, hors du YAML | [Microsoft Approvals and checks](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/approvals?view=azure-devops) |

Les corrections de redirection de rapports conservent le code de sortie de l'outil. Un fichier vide ou absent ne devient pas un rapport sans anomalie. Les chemins, noms de fichiers et formats font partie du contrat entre le scanner, le stockage d'artefacts et la porte de promotion.

<a id="86-sources-de-gouvernance-et-documents-indisponibles"></a>

### 8.6. Sources ITIL 5, apports d’ITIL 4 et CALMS

**ITIL 5 demeure le cadre du document.** La page officielle [ITIL Foundation (Version 5)](https://www.peoplecert.org/browse-certifications/it-governance-and-service-management/ITIL-1/itil-5-foundation-version-50-4154), revue le 22 octobre 2026, présente la gestion des produits et services sur leur cycle de vie. La [FAQ PeopleCert](https://www.peoplecert.org/help-and-support/faq-itil) confirme la continuité avec des concepts éprouvés d’ITIL 4. Les rappels d’ITIL 4 ci-dessous servent à comprendre et à appliquer les notions utiles au pipeline ; ils ne constituent pas une correspondance exhaustive entre les éditions.

Le [Guide pratique des frameworks ITIL 4 et CALMS du portfolio](https://devsecops-portfolio.netlify.app/guides/devsecops/itil/) a été **consulté intégralement le 22 octobre 2026**. La lecture couvre ses concepts ITIL 4, les cinq piliers CALMS, leur comparaison, les exemples sectoriels, le cas croisé et le glossaire. Le chapitre 2 en sélectionne les explications utiles, identifie leur édition et les applique au pipeline du catalogue.

Les rappels ont été recoupés avec [PeopleCert ITIL 4 Foundation](https://www.peoplecert.org/browse-certifications/it-governance-and-service-management/ITIL-1/itil-4-foundation-2565). Le descriptif des [guides de pratiques ITIL 4](https://www.peoplecert.org/news-and-announcements/itil-practice-guides-a-hidden-gem) précise leur organisation ; la [référence DORA](https://dora.dev/guides/dora-metrics/) précise le périmètre et les cinq mesures actuelles. Les publications sous licence ne sont pas reproduites : les procédures proposées sont une adaptation au laboratoire, pas une certification de conformité.

**Ce qui est repris :** partir d’une notion simple, donner un exemple, relier ITIL à CALMS et terminer par une application observable. Le catalogue sert de fil rouge : besoin utilisateur, changement, tests, autorisation, déploiement, incident et amélioration.

**Ce qui est précisé pour éviter les confusions :**

| Point du portfolio | Lecture retenue pour ce guide | Application au pipeline |
|---|---|---|
| La page présente ITIL 4 et évoque une prochaine version | La documentation officielle décrit déjà ITIL 5 à la date de cette révision | Conserver ITIL 5 comme cadre et nommer les rappels empruntés à ITIL 4 |
| ITIL et CALMS se complètent | Les décisions de service et la façon de travailler se renforcent ; aucun cadre ne fixe une cadence universelle | Adapter contrôles, responsabilités et délais au service |
| Le CAB apparaît dans des exemples | Un comité consultatif de changements peut conseiller l’autorité de changement ; il n’est pas obligatoire pour chaque livraison | Un modèle standard peut être préautorisé ; le socle conserve l’autorisation de préproduction prévue |
| Scénarios et gains sectoriels | La page les présente comme exemples ; aucune étude indépendante associée ne permet ici d’attester leurs chiffres | Les traiter comme illustrations, jamais comme objectifs garantis ou seuils ITIL |
| Automatisation | Elle réduit les manipulations répétitives mais peut reproduire une erreur de configuration | Vérifier les refus, le résultat déployé et le nettoyage |
| Mesures de livraison | La référence DORA actuelle présente cinq mesures et définit notamment le délai commit → production | Nommer explicitement les mesures du laboratoire « préproduction » |
| Couverture et seuils de sécurité | Les valeurs d’un exemple ne sont pas des minima du référentiel | Conserver la couverture minimale de 85 % et la fraîcheur de 72 h du socle jusqu’à une modification de politique approuvée |

Les deux anciens Markdown mentionnés dans le cahier initial restent absents ; leur contenu n’est donc pas audité. Cette limite concerne ces deux pièces, pas le portfolio désormais lu. La revue ci-dessous porte sur les risques techniques et pédagogiques du guide fourni.

| Élément à conserver | Risque à corriger ou à expliquer | Traitement dans le livrable |
|---|---|---|
| Progression Linux, Git, Docker et YAML | Commandes sans prérequis ni résultat attendu | Rappels, parcours de lecture et exercices |
| Deux parcours équivalents | Confondre Runner GitLab et agent Azure | Installations et droits propres à chaque plateforme |
| Contrôles avant préproduction | Succès forcé avec `allow_failure`, `continueOnError` ou `|| true` | Codes réels, rapports exigés et promotion bloquante |
| Templates réutilisables | Seuil ou contrôle désactivé sans revue | Sources protégées et politique versionnée |
| Images identifiables | Tag modifié ou reconstruction après tests | Digest de l’image effectivement construite et testée |
| DAST automatisé | Mauvaise cible ou baseline présenté comme scan actif | Tests HTTP et preuve des URL visitées |
| Audit Docker | Utiliser Docker Bench comme un simple linter de code | Procédure d’hôte séparée et privilèges explicités |
| ITIL 5, rappels d’ITIL 4 et CALMS | Théorie séparée des opérations ou confusion entre éditions | Questions simples, édition identifiée, cas suivi et preuves propres à chaque job |

### 8.7. Bilan des exécutions locales

Le [bilan de validation](#validation-livrable) est intégré à ce document. Les chemins `validations/` cités identifient les résultats obtenus pendant la rédaction ; ils ne désignent pas des pièces jointes nécessaires à la lecture. Les essais du poste de rédaction ne sont pas réutilisables comme preuves de votre candidate OCI.

| Vérification locale réalisée | Observation | Limite |
|---|---|---|
| Lecture syntaxique des YAML | Fichiers chargés par le parseur local, lint effectué | Ni compilation Azure, ni CI Lint GitLab distant |
| Équivalence GitLab complet/modulaire | Fusion des trois templates égale au YAML complet lors du contrôle | La plateforme doit encore appliquer `extends` et `rules` dans son contexte |
| Ruff et syntaxe Python | Vérifications locales effectuées | Dépend de la version réellement importée et du périmètre analysé |
| Bandit 1.9.4 avec Python 3.14.0 | Scan local réussi, `errors: []`, 74 lignes analysées et deux suppressions explicites B104/B108 | Les deux choix de laboratoire commentés restent à réévaluer pour une application réelle |
| Tests applicatifs | **5 tests réussis**, réponses santé/catalogue/HTML, route inconnue et échappement | Ne couvre pas les dépendances réseau ou le conteneur Docker |
| Couverture | **100 % des 46 instructions retenues**, 23 lignes exclues | `main` et le lancement par point d'entrée sont exclus ; ce n'est pas 100 % de tous les chemins d'exploitation |
| SCA pip-audit | Deux paquets runtime réellement présents au rapport, aucun avis connu détecté lors de l'exécution locale | `--no-deps --disable-pip --strict` sur fermeture complète ; verdict valable à la date du scan et pour ces versions seulement |
| Rapports | JUnit, couverture XML/JSON et SAST locaux conservés | Leur présence ne remplace pas les rapports d'un pipeline cible |
| Syntaxe Bash | `bash -n` passé sur les scripts contrôlés | Les commandes n'ont pas été exécutées sur Linux |
| Historique Git pour Gitleaks | Copie locale source → worktree détaché → miroir autonome testée | Gitleaks conteneur n'a pas été lancé |

Les essais de refus d'une preuve manquante, d'un mauvais commit, d'un rapport modifié ou d'une candidate incomplète sont décrits dans la recette. Leur état final doit être lu dans le compte rendu global des validations ; ne pas confondre un exercice proposé et un essai exécuté.

### 8.8. Ce qui reste à recetter dans l'environnement cible

Les actions suivantes **n'ont pas été exécutées** pendant cette rédaction : installation des VM Linux et des paquets APT, enregistrement Runner ou agent, compilation réelle des pipelines dans les services, pull des images d'outils, génération du verrou de digests, construction et publication OCI, scans conteneurisés, scan ZAP en réseau Docker, Docker Bench sur un hôte, SSH et déploiement en préproduction.

Avant utilisation opérationnelle, compléter le dossier de recette avec :

1. Versions effectives OS, Runner/agent, Docker, outils et dépendances, avec les références de leurs sources.
2. Verrou des images revu, identités de registre et inventaire des ressources d'exécution autorisées.
3. Résultats de compilation YAML des plateformes et tests des restrictions de branche, pool et environnement.
4. Pipeline sain et défauts volontaires démontrant les blocages, avec rapports conservés après échec.
5. Correspondance du commit, de l'exécution et du digest entre build, qualification et préproduction.
6. Contrôle DAST du périmètre attendu et preuve de nettoyage après succès, échec et annulation.
7. Autorisation de changement, vérifications après déploiement et retour arrière éprouvé sur des données compatibles.
8. Procédure de mise à jour et de rotation des identités, responsabilités, rétention et objectifs de rétablissement.

Les bases de vulnérabilités changent indépendamment des images d'outils. Une qualification a donc une date et une politique : le même digest peut nécessiter un réexamen après un nouvel avis. La porte de ce laboratoire impose une fraîcheur de candidate de 72 heures ; cette valeur est une politique de démonstration à revoir formellement selon le service.

Enfin, une empreinte de rapport n'est pas une signature d'approbation. Le socle suppose des droits de dépôt, de templates, d'artefacts et de déploiement protégés. Pour des exigences de provenance plus élevées, compléter avec signatures ou attestations vérifiables, sans appeler « preuve signée » le seul JSON généré par le script.

<a id="code-integral"></a>

## 9. Annexe — Code intégral

Tout le code est intégré ci-dessous. Pour reproduire le laboratoire, créer un dépôt vide, puis copier chaque bloc dans le fichier indiqué par son titre, en créant les répertoires nécessaires. Exécuter ensuite les commandes depuis la racine de ce dépôt. Les variantes `exemples/*-modulaire.yml` remplacent le fichier racine de leur plateforme ; elles ne s'ajoutent pas à lui.

### Index du code intégré

- [`.dockerignore`](#fichier-dockerignore)
- [`.gitattributes`](#fichier-gitattributes)
- [`.gitignore`](#fichier-gitignore)
- [`.gitlab-ci.yml`](#fichier-gitlab-ci-yml)
- [`.yamllint.yml`](#fichier-yamllint-yml)
- [`app/__init__.py`](#fichier-app-init-py)
- [`app/service.py`](#fichier-app-service-py)
- [`azure-pipelines.yml`](#fichier-azure-pipelines-yml)
- [`ci/azure/image.stage.yml`](#fichier-ci-azure-image-stage-yml)
- [`ci/azure/prepare.steps.yml`](#fichier-ci-azure-prepare-steps-yml)
- [`ci/azure/preproduction.stage.yml`](#fichier-ci-azure-preproduction-stage-yml)
- [`ci/azure/publish.steps.yml`](#fichier-ci-azure-publish-steps-yml)
- [`ci/azure/quality.stage.yml`](#fichier-ci-azure-quality-stage-yml)
- [`ci/azure/restore.steps.yml`](#fichier-ci-azure-restore-steps-yml)
- [`ci/deploy-remote.sh`](#fichier-ci-deploy-remote-sh)
- [`ci/evidence.py`](#fichier-ci-evidence-py)
- [`ci/gitlab/base.yml`](#fichier-ci-gitlab-base-yml)
- [`ci/gitlab/delivery.yml`](#fichier-ci-gitlab-delivery-yml)
- [`ci/gitlab/quality.yml`](#fichier-ci-gitlab-quality-yml)
- [`ci/images.env`](#fichier-ci-images-env)
- [`ci/lock-images.sh`](#fichier-ci-lock-images-sh)
- [`ci/python-quality.sh`](#fichier-ci-python-quality-sh)
- [`ci/run.sh`](#fichier-ci-run-sh)
- [`ci/zap_hooks.py`](#fichier-ci-zap-hooks-py)
- [`config/exceptions.json`](#fichier-config-exceptions-json)
- [`config/hadolint.yaml`](#fichier-config-hadolint-yaml)
- [`config/test.compose.yml`](#fichier-config-test-compose-yml)
- [`config/zap-rules.tsv`](#fichier-config-zap-rules-tsv)
- [`Dockerfile`](#fichier-dockerfile)
- [`exemples/azure-debutant.yml`](#fichier-exemples-azure-debutant-yml)
- [`exemples/azure-modulaire.yml`](#fichier-exemples-azure-modulaire-yml)
- [`exemples/gitlab-debutant.yml`](#fichier-exemples-gitlab-debutant-yml)
- [`exemples/gitlab-modulaire.yml`](#fichier-exemples-gitlab-modulaire-yml)
- [`ops/cleanup-stale.sh`](#fichier-ops-cleanup-stale-sh)
- [`ops/docker-bench.sh`](#fichier-ops-docker-bench-sh)
- [`ops/preproduction.sh`](#fichier-ops-preproduction-sh)
- [`parametres.exemple.env`](#fichier-parametres-exemple-env)
- [`pyproject.toml`](#fichier-pyproject-toml)
- [`requirements-dev.txt`](#fichier-requirements-dev-txt)
- [`requirements.txt`](#fichier-requirements-txt)
- [`tests/http_probe.py`](#fichier-tests-http-probe-py)
- [`tests/test_evidence.py`](#fichier-tests-test-evidence-py)
- [`tests/test_service.py`](#fichier-tests-test-service-py)

### Fichier `.dockerignore`

<details>
<summary>Afficher le fichier complet</summary>

````text
**
!app/
!app/**
!requirements.txt
!Dockerfile
app/**/__pycache__/
````

</details>

### Fichier `.gitattributes`

<details>
<summary>Afficher le fichier complet</summary>

````text
*.sh text eol=lf
*.py text eol=lf
*.yml text eol=lf
*.yaml text eol=lf
*.env text eol=lf
Dockerfile text eol=lf
````

</details>

### Fichier `.gitignore`

<details>
<summary>Afficher le fichier complet</summary>

````text
.venv*/
.validation*/
__pycache__/
*.pyc
.pytest_cache/
.ruff_cache/
.coverage
reports/
evidence/
.ci-tmp-*/
*.sqlite
*.tar
ci/images.lock.env
parametres.local.env
````

</details>

<a id="fichier-gitlab-ci-yml"></a>

### Fichier `.gitlab-ci.yml`

<details>
<summary>Afficher le fichier complet</summary>

````yaml
# Pipeline complet : exécuteur Shell Linux, VM dédiée aux révisions approuvées.
# Réglages GitLab indispensables : chapitre GitLab de ce document (runners, branches, secrets,
# environnement protégé et approbations). Les rules ne remplacent pas ces droits.
workflow:
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
    - if: '$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH && $CI_COMMIT_REF_PROTECTED == "true" && $CI_PIPELINE_SOURCE =~ /^(push|web|schedule)$/'
    - when: never

stages: [quality, build, qualify, promote]

variables:
  GIT_STRATEGY: clone
  GIT_DEPTH: "0"  # Le contrôle des secrets inspecte l'historique disponible.
  TRUSTED_RUNNER_TAG: trusted-shell
  QUALITY_RUNNER_TAG: trusted-shell
  REPORT_RETENTION: "30 days"
  JOB_TIMEOUT: "45m"

.lab-job:
  tags: ["$TRUSTED_RUNNER_TAG"]
  timeout: "$JOB_TIMEOUT"
  interruptible: true
  retry:
    max: 1
    when: [runner_system_failure]
  before_script:
    - export SOURCE_SHA="$CI_COMMIT_SHA"
    - export RUN_ID="$CI_PIPELINE_ID"
    - mkdir -p reports evidence
  artifacts:
    when: always  # Le job reste rouge si un contrôle obligatoire échoue.
    access: developer
    expire_in: "$REPORT_RETENTION"
    paths: [reports/, evidence/]

quality:
  extends: .lab-job
  stage: quality
  tags: ["$QUALITY_RUNNER_TAG"]
  rules:
    # Ce runner doit vivre sur une VM jetable distincte, sans secret de préprod.
    # Les scripts utilisent Docker : son démon donne aussi le contrôle de cette VM.
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
      variables:
        QUALITY_RUNNER_TAG: isolated-quality
    - if: '$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH && $CI_COMMIT_REF_PROTECTED == "true"'
  script:
    - bash ci/run.sh quality
  artifacts:
    reports:
      junit: reports/unit.xml
      coverage_report:
        coverage_format: cobertura
        path: reports/coverage.xml

build:
  extends: .lab-job
  stage: build
  rules:
    - if: '$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH && $CI_COMMIT_REF_PROTECTED == "true"'
  needs:
    - job: quality
      artifacts: true
  script:
    - export REGISTRY_HOST="${REGISTRY_HOST:-$CI_REGISTRY}"
    - export IMAGE_REPOSITORY="${IMAGE_REPOSITORY:-$CI_REGISTRY_IMAGE}"
    - export REGISTRY_USER="${REGISTRY_USER:-$CI_REGISTRY_USER}"
    - export REGISTRY_PASSWORD="${REGISTRY_PASSWORD:-$CI_REGISTRY_PASSWORD}"
    - bash ci/run.sh build

qualify:
  extends: .lab-job
  stage: qualify
  rules:
    - if: '$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH && $CI_COMMIT_REF_PROTECTED == "true"'
  needs:
    - job: build
      artifacts: true
  script:
    - export REGISTRY_HOST="${REGISTRY_HOST:-$CI_REGISTRY}"
    - export IMAGE_REPOSITORY="${IMAGE_REPOSITORY:-$CI_REGISTRY_IMAGE}"
    - export REGISTRY_USER="${REGISTRY_USER:-$CI_REGISTRY_USER}"
    - export REGISTRY_PASSWORD="${REGISTRY_PASSWORD:-$CI_REGISTRY_PASSWORD}"
    # Tests HTTP et ZAP sur un réseau temporaire, supprimé par trap dans ce job.
    - bash ci/run.sh qualify

promote:
  extends: .lab-job
  stage: promote
  timeout: 10m
  interruptible: false
  retry: 0  # Aucune répétition implicite d'un changement distant.
  rules:
    - if: '$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH && $CI_COMMIT_REF_PROTECTED == "true"'
      when: manual
      allow_failure: false
  needs:
    - job: qualify
      artifacts: true
  resource_group: preproduction  # Même verrou pour TOUS les changements préprod.
  environment:
    name: preproduction
    url: "$PREPROD_URL"
    deployment_tier: staging
  script:
    # Les variables SSH de type File sont injectées seulement à cette étape.
    - bash ci/run.sh promote
````

</details>

<a id="fichier-yamllint-yml"></a>

### Fichier `.yamllint.yml`

<details>
<summary>Afficher le fichier complet</summary>

````yaml
extends: default
rules:
  document-start: disable
  line-length: disable
  truthy:
    allowed-values: ['true', 'false']
    check-keys: false
  comments-indentation: disable
  indentation:
    spaces: 2
    indent-sequences: whatever
````

</details>

<a id="fichier-app-init-py"></a>

### Fichier `app/__init__.py`

<details>
<summary>Afficher le fichier complet</summary>

````python
"""Application pédagogique CI/CD."""
````

</details>

<a id="fichier-app-service-py"></a>

### Fichier `app/service.py`

<details>
<summary>Afficher le fichier complet</summary>

````python
"""Service de catalogue fictif. HTTP interne uniquement; TLS au proxy en usage réel."""

import json
import os
import signal
import sqlite3
import threading
from contextlib import closing
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

from jinja2 import Environment

PAGE = Environment(autoescape=True).from_string(
    '<!doctype html><html lang="fr"><meta charset="utf-8">'
    '<title>Catalogue CI/CD</title><h1>Catalogue CI/CD</h1>'
    '<p>Révision {{ revision }}</p><a href="/api/items">Articles de test</a></html>'
)


def initialize_database(path):
    """Jeu de données déterministe, sans donnée personnelle ni secret."""
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with closing(sqlite3.connect(path)) as connection, connection:
        connection.execute("CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, name TEXT)")
        connection.execute("INSERT OR IGNORE INTO items VALUES (?, ?)", (1, "article-demo"))


def make_handler(database, revision):
    class Handler(BaseHTTPRequestHandler):
        server_version = "Demo"
        sys_version = ""

        def do_GET(self):  # noqa: N802 -- API imposée par BaseHTTPRequestHandler
            path = urlsplit(self.path).path
            if path == "/health":
                with closing(sqlite3.connect(database)) as connection:
                    connection.execute("SELECT 1").fetchone()
                self.respond(200, {"status": "ok", "revision": revision})
            elif path == "/api/items":
                with closing(sqlite3.connect(database)) as connection:
                    rows = connection.execute("SELECT id, name FROM items ORDER BY id").fetchall()
                self.respond(200, {"items": [{"id": row[0], "name": row[1]} for row in rows]})
            elif path == "/":
                self.respond(200, PAGE.render(revision=revision), "text/html; charset=utf-8")
            else:
                self.respond(404, {"error": "not_found"})

        def respond(self, status, body, content_type="application/json"):
            payload = (json.dumps(body) if isinstance(body, dict) else body).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(payload)))
            self.send_header("X-Content-Type-Options", "nosniff")
            self.send_header(
                "Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'"
            )
            self.send_header("X-Frame-Options", "DENY")
            self.send_header("Referrer-Policy", "no-referrer")
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(payload)

    return Handler


def main():
    # Fichier éphémère dans le tmpfs du conteneur, jamais utilisé pour des secrets.
    database = os.environ.get("DATABASE_PATH", "/tmp/catalogue.sqlite")  # nosec B108
    initialize_database(database)
    # Interface conteneur privée; aucune publication Internet dans le laboratoire.
    address = os.environ.get("BIND_ADDRESS", "0.0.0.0")  # nosec B104
    server = ThreadingHTTPServer(
        (address, int(os.environ.get("PORT", "8080"))),
        make_handler(database, os.environ.get("APP_REVISION", "local")),
    )

    def stop(_signum, _frame):
        # shutdown doit être appelé hors du thread serve_forever pour éviter un blocage.
        threading.Thread(target=server.shutdown, daemon=True).start()

    signal.signal(signal.SIGTERM, stop)
    signal.signal(signal.SIGINT, stop)
    try:
        server.serve_forever(poll_interval=0.2)
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
````

</details>

<a id="fichier-azure-pipelines-yml"></a>

### Fichier `azure-pipelines.yml`

<details>
<summary>Afficher le fichier complet</summary>

````yaml
# Azure DevOps Services. Installer les contrôles de ressources décrits dans le chapitre Azure DevOps de ce document.
# Un changement du YAML ne doit pas donner accès au pool ou aux secrets depuis une branche libre.
trigger:
  batch: true
  branches:
    include: [main]
pr: none

variables:
- group: cicd-config

pool:
  name: CI-Linux-Trusted
  demands:
  - Agent.OS -equals Linux
  - DockerTrusted -equals true

stages:
- stage: Quality
  isSkippable: false
  displayName: Qualité du code et sécurité des sources
  condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'), in(variables['Build.Reason'], 'IndividualCI', 'BatchedCI', 'Manual'))
  jobs:
  - job: Quality
    timeoutInMinutes: 40
    cancelTimeoutInMinutes: 5
    workspace:
      clean: all
    steps:
    - checkout: self
      clean: true
      fetchDepth: 0
      persistCredentials: false
    - bash: mkdir -p reports evidence
      displayName: Préparer les répertoires de preuve
    - bash: bash ci/run.sh quality
      displayName: Lint, secrets, tests, couverture, SAST, SCA et IaC
      env:
        SOURCE_SHA: $(Build.SourceVersion)
        RUN_ID: $(Build.BuildId)
    - task: PublishTestResults@2
      condition: always()
      inputs:
        testResultsFormat: JUnit
        testResultsFiles: reports/unit.xml
        failTaskOnFailedTests: true
        failTaskOnMissingResultsFile: true
        failTaskOnFailureToPublishResults: true
    - task: UseDotNet@2
      displayName: Préparer le SDK requis pour publier la couverture
      condition: always()
      inputs:
        packageType: sdk
        version: 8.x
    - task: PublishCodeCoverageResults@2
      condition: always()
      inputs:
        summaryFileLocation: $(Build.SourcesDirectory)/reports/coverage.xml
        pathToSources: $(Build.SourcesDirectory)
        failIfCoverageEmpty: true
    - task: PublishPipelineArtifact@1
      condition: always()
      inputs:
        targetPath: $(Build.SourcesDirectory)/reports
        artifact: quality-reports
    - task: PublishPipelineArtifact@1
      condition: always()
      inputs:
        targetPath: $(Build.SourcesDirectory)/evidence
        artifact: quality-evidence

- stage: Build
  isSkippable: false
  displayName: Construire et contrôler une image candidate
  dependsOn: Quality
  condition: succeeded()
  variables:
  - group: cicd-registry
  jobs:
  - job: Build
    timeoutInMinutes: 50
    cancelTimeoutInMinutes: 5
    workspace:
      clean: all
    steps:
    - checkout: self
      clean: true
      fetchDepth: 0
      persistCredentials: false
    - bash: mkdir -p reports evidence
    - task: DownloadPipelineArtifact@2
      inputs:
        buildType: current
        artifactName: quality-reports
        targetPath: $(Build.SourcesDirectory)/reports
    - task: DownloadPipelineArtifact@2
      inputs:
        buildType: current
        artifactName: quality-evidence
        targetPath: $(Pipeline.Workspace)/incoming-quality
    - bash: |
        set -euo pipefail
        test -s "$INCOMING/quality.json"
        cp -a "$INCOMING/." evidence/
      displayName: Restaurer la preuve qualité dans le dépôt
      env:
        INCOMING: $(Pipeline.Workspace)/incoming-quality
    - bash: bash ci/run.sh build
      displayName: Build, Trivy, Dockle, SBOM et publication OCI
      env:
        SOURCE_SHA: $(Build.SourceVersion)
        RUN_ID: $(Build.BuildId)
        IMAGE_REPOSITORY: $(IMAGE_REPOSITORY)
        REGISTRY_HOST: $(REGISTRY_HOST)
        REGISTRY_USER: $(REGISTRY_USER)
        REGISTRY_PASSWORD: $(REGISTRY_PASSWORD)
    - task: PublishPipelineArtifact@1
      condition: always()
      inputs:
        targetPath: $(Build.SourcesDirectory)/reports
        artifact: build-reports
    - task: PublishPipelineArtifact@1
      condition: always()
      inputs:
        targetPath: $(Build.SourcesDirectory)/evidence
        artifact: build-evidence

- stage: Qualify
  isSkippable: false
  displayName: Tester la même image et qualifier la candidate
  dependsOn: Build
  condition: succeeded()
  variables:
  - group: cicd-registry
  jobs:
  - job: Qualify
    timeoutInMinutes: 30
    cancelTimeoutInMinutes: 5
    workspace:
      clean: all
    steps:
    - checkout: self
      clean: true
      fetchDepth: 0
      persistCredentials: false
    - bash: mkdir -p reports evidence
    - task: DownloadPipelineArtifact@2
      inputs:
        buildType: current
        artifactName: build-reports
        targetPath: $(Build.SourcesDirectory)/reports
    - task: DownloadPipelineArtifact@2
      inputs:
        buildType: current
        artifactName: build-evidence
        targetPath: $(Pipeline.Workspace)/incoming-build
    - bash: |
        set -euo pipefail
        test -s "$INCOMING/image.env"
        cp -a "$INCOMING/." evidence/
      displayName: Restaurer l'identité immuable et les preuves
      env:
        INCOMING: $(Pipeline.Workspace)/incoming-build
    # Le script conserve lancement, tests HTTP, ZAP et trap de nettoyage dans ce même job.
    - bash: bash ci/run.sh qualify
      displayName: Tests éphémères, DAST baseline et décision de qualification
      env:
        SOURCE_SHA: $(Build.SourceVersion)
        RUN_ID: $(Build.BuildId)
        IMAGE_REPOSITORY: $(IMAGE_REPOSITORY)
        REGISTRY_HOST: $(REGISTRY_HOST)
        REGISTRY_USER: $(REGISTRY_USER)
        REGISTRY_PASSWORD: $(REGISTRY_PASSWORD)
    - task: PublishPipelineArtifact@1
      condition: always()
      inputs:
        targetPath: $(Build.SourcesDirectory)/reports
        artifact: qualify-reports
    - task: PublishPipelineArtifact@1
      condition: always()
      inputs:
        targetPath: $(Build.SourcesDirectory)/evidence
        artifact: qualify-evidence

- stage: Preproduction
  isSkippable: false
  displayName: Promouvoir la candidate approuvée
  dependsOn: Qualify
  condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
  # Activer aussi le contrôle Exclusive lock sur l'environnement, hors YAML.
  lockBehavior: sequential
  variables:
  - group: cicd-preproduction
  jobs:
  - deployment: Promote
    displayName: Déployer et vérifier la préproduction distante
    timeoutInMinutes: 20
    cancelTimeoutInMinutes: 5
    workspace:
      clean: all
    # Précréer cette ressource et ses approbations ; son nom seul ne protège rien.
    environment: preproduction
    strategy:
      runOnce:
        deploy:
          steps:
          - checkout: self
            clean: true
            fetchDepth: 0
            persistCredentials: false
          - download: none
          - bash: mkdir -p reports evidence
          - task: DownloadPipelineArtifact@2
            inputs:
              buildType: current
              artifactName: qualify-reports
              targetPath: $(Build.SourcesDirectory)/reports
          - task: DownloadPipelineArtifact@2
            inputs:
              buildType: current
              artifactName: qualify-evidence
              targetPath: $(Pipeline.Workspace)/incoming-qualify
          - bash: |
              set -euo pipefail
              test -s "$INCOMING/candidate.json"
              cp -a "$INCOMING/." evidence/
            displayName: Restaurer la candidate qualifiée du même run
            env:
              INCOMING: $(Pipeline.Workspace)/incoming-qualify
          - task: DownloadSecureFile@1
            name: sshKey
            inputs:
              secureFile: preproduction_ed25519
          - task: DownloadSecureFile@1
            name: knownHosts
            inputs:
              secureFile: preproduction_known_hosts
          - bash: |
              set -euo pipefail
              chmod 600 "$PREPROD_SSH_KEY" "$PREPROD_KNOWN_HOSTS"
              bash ci/run.sh promote
            displayName: Promotion SSH par digest et vérification HTTP
            env:
              SOURCE_SHA: $(Build.SourceVersion)
              RUN_ID: $(Build.BuildId)
              IMAGE_REPOSITORY: $(IMAGE_REPOSITORY)
              PREPROD_HOST: $(PREPROD_HOST)
              PREPROD_USER: $(PREPROD_USER)
              PREPROD_SSH_KEY: $(sshKey.secureFilePath)
              PREPROD_KNOWN_HOSTS: $(knownHosts.secureFilePath)
          - task: PublishPipelineArtifact@1
            condition: always()
            inputs:
              targetPath: $(Build.SourcesDirectory)/reports
              artifact: preproduction-reports
          - task: PublishPipelineArtifact@1
            condition: always()
            inputs:
              targetPath: $(Build.SourcesDirectory)/evidence
              artifact: preproduction-evidence
````

</details>

<a id="fichier-ci-azure-image-stage-yml"></a>

### Fichier `ci/azure/image.stage.yml`

<details>
<summary>Afficher le fichier complet</summary>

````yaml
# Contrôles obligatoires : aucune option pour les désactiver.
parameters:
- name: action
  type: string
  values: [build, qualify]
- name: stageName
  type: string
  values: [Build, Qualify]
- name: dependsOn
  type: string
  values: [Quality, Build]
- name: incoming
  type: string
  values: [quality, build]
- name: requiredFile
  type: string
- name: timeoutMinutes
  type: number
  default: 50

stages:
- stage: ${{ parameters.stageName }}
  isSkippable: false
  dependsOn: ${{ parameters.dependsOn }}
  condition: succeeded()
  variables:
  - group: cicd-registry
  jobs:
  - job: ${{ parameters.stageName }}
    timeoutInMinutes: ${{ parameters.timeoutMinutes }}
    cancelTimeoutInMinutes: 5
    workspace:
      clean: all
    steps:
    - template: prepare.steps.yml
    - template: restore.steps.yml
      parameters:
        from: ${{ parameters.incoming }}
        requiredFile: ${{ parameters.requiredFile }}
    - bash: bash ci/run.sh "$ACTION"
      displayName: ${{ parameters.stageName }} de l'image candidate
      env:
        ACTION: ${{ parameters.action }}
        SOURCE_SHA: $(Build.SourceVersion)
        RUN_ID: $(Build.BuildId)
        IMAGE_REPOSITORY: $(IMAGE_REPOSITORY)
        REGISTRY_HOST: $(REGISTRY_HOST)
        REGISTRY_USER: $(REGISTRY_USER)
        REGISTRY_PASSWORD: $(REGISTRY_PASSWORD)
    - template: publish.steps.yml
      parameters:
        prefix: ${{ parameters.action }}
````

</details>

<a id="fichier-ci-azure-prepare-steps-yml"></a>

### Fichier `ci/azure/prepare.steps.yml`

<details>
<summary>Afficher le fichier complet</summary>

````yaml
# Usage interne : chaque job démarre propre, sans hypothèse de réutilisation de VM.
steps:
- checkout: self
  clean: true
  fetchDepth: 0
  persistCredentials: false
- bash: mkdir -p reports evidence
  displayName: Préparer les répertoires de preuve
````

</details>

<a id="fichier-ci-azure-preproduction-stage-yml"></a>

### Fichier `ci/azure/preproduction.stage.yml`

<details>
<summary>Afficher le fichier complet</summary>

````yaml
stages:
- stage: Preproduction
  isSkippable: false
  dependsOn: Qualify
  condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
  lockBehavior: sequential
  variables:
  - group: cicd-preproduction
  jobs:
  - deployment: Promote
    timeoutInMinutes: 20
    cancelTimeoutInMinutes: 5
    workspace:
      clean: all
    environment: preproduction
    strategy:
      runOnce:
        deploy:
          steps:
          - template: prepare.steps.yml
          - download: none
          - template: restore.steps.yml
            parameters:
              from: qualify
              requiredFile: candidate.json
          - task: DownloadSecureFile@1
            name: sshKey
            inputs:
              secureFile: preproduction_ed25519
          - task: DownloadSecureFile@1
            name: knownHosts
            inputs:
              secureFile: preproduction_known_hosts
          - bash: |
              set -euo pipefail
              chmod 600 "$PREPROD_SSH_KEY" "$PREPROD_KNOWN_HOSTS"
              bash ci/run.sh promote
            displayName: Promouvoir le digest qualifié en SSH
            env:
              SOURCE_SHA: $(Build.SourceVersion)
              RUN_ID: $(Build.BuildId)
              IMAGE_REPOSITORY: $(IMAGE_REPOSITORY)
              PREPROD_HOST: $(PREPROD_HOST)
              PREPROD_USER: $(PREPROD_USER)
              PREPROD_SSH_KEY: $(sshKey.secureFilePath)
              PREPROD_KNOWN_HOSTS: $(knownHosts.secureFilePath)
          - template: publish.steps.yml
            parameters:
              prefix: preproduction
````

</details>

<a id="fichier-ci-azure-publish-steps-yml"></a>

### Fichier `ci/azure/publish.steps.yml`

<details>
<summary>Afficher le fichier complet</summary>

````yaml
parameters:
- name: prefix
  type: string

steps:
- task: PublishPipelineArtifact@1
  condition: always()
  inputs:
    targetPath: $(Build.SourcesDirectory)/reports
    artifact: ${{ parameters.prefix }}-reports
- task: PublishPipelineArtifact@1
  condition: always()
  inputs:
    targetPath: $(Build.SourcesDirectory)/evidence
    artifact: ${{ parameters.prefix }}-evidence
````

</details>

<a id="fichier-ci-azure-quality-stage-yml"></a>

### Fichier `ci/azure/quality.stage.yml`

<details>
<summary>Afficher le fichier complet</summary>

````yaml
stages:
- stage: Quality
  isSkippable: false
  displayName: Qualité du code et sécurité des sources
  condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'), in(variables['Build.Reason'], 'IndividualCI', 'BatchedCI', 'Manual'))
  jobs:
  - job: Quality
    timeoutInMinutes: 40
    cancelTimeoutInMinutes: 5
    workspace:
      clean: all
    steps:
    - template: prepare.steps.yml
    - bash: bash ci/run.sh quality
      displayName: Lint, secrets, tests, couverture, SAST, SCA et IaC
      env:
        SOURCE_SHA: $(Build.SourceVersion)
        RUN_ID: $(Build.BuildId)
    - task: PublishTestResults@2
      condition: always()
      inputs:
        testResultsFormat: JUnit
        testResultsFiles: reports/unit.xml
        failTaskOnFailedTests: true
        failTaskOnMissingResultsFile: true
        failTaskOnFailureToPublishResults: true
    - task: UseDotNet@2
      displayName: Préparer le SDK requis pour publier la couverture
      condition: always()
      inputs:
        packageType: sdk
        version: 8.x
    - task: PublishCodeCoverageResults@2
      condition: always()
      inputs:
        summaryFileLocation: $(Build.SourcesDirectory)/reports/coverage.xml
        pathToSources: $(Build.SourcesDirectory)
        failIfCoverageEmpty: true
    - template: publish.steps.yml
      parameters:
        prefix: quality
````

</details>

<a id="fichier-ci-azure-restore-steps-yml"></a>

### Fichier `ci/azure/restore.steps.yml`

<details>
<summary>Afficher le fichier complet</summary>

````yaml
parameters:
- name: from
  type: string
  values: [quality, build, qualify]
- name: requiredFile
  type: string

steps:
- task: DownloadPipelineArtifact@2
  inputs:
    buildType: current
    artifactName: ${{ parameters.from }}-reports
    targetPath: $(Build.SourcesDirectory)/reports
- task: DownloadPipelineArtifact@2
  inputs:
    buildType: current
    artifactName: ${{ parameters.from }}-evidence
    targetPath: $(Pipeline.Workspace)/incoming-${{ parameters.from }}
- bash: |
    set -euo pipefail
    test -s "$INCOMING/$REQUIRED_FILE"
    cp -a "$INCOMING/." evidence/
  displayName: Restaurer les preuves dans evidence à la racine du dépôt
  env:
    INCOMING: $(Pipeline.Workspace)/incoming-${{ parameters.from }}
    REQUIRED_FILE: ${{ parameters.requiredFile }}
````

</details>

<a id="fichier-ci-deploy-remote-sh"></a>

### Fichier `ci/deploy-remote.sh`

<details>
<summary>Afficher le fichier complet</summary>

````bash
#!/usr/bin/env bash
# Client de déploiement: le compte distant ne peut appeler que la procédure root revue.
set -Eeuo pipefail
image=${1:?repo@sha256 requis}; revision=${2:?commit requis}
: "${PREPROD_HOST:?}" "${PREPROD_USER:?}" "${PREPROD_SSH_KEY:?fichier}" "${PREPROD_KNOWN_HOSTS:?fichier}"
[[ "$image" =~ ^[a-z0-9][a-z0-9._:/-]*@sha256:[a-f0-9]{64}$ ]] || exit 2
[[ "$revision" =~ ^([a-f0-9]{40}|[a-f0-9]{64})$ ]] || exit 2
[[ "$PREPROD_HOST" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]*$ && "$PREPROD_USER" =~ ^[a-z_][a-z0-9_-]*$ ]] || exit 2
[[ -s "$PREPROD_SSH_KEY" && -s "$PREPROD_KNOWN_HOSTS" ]] || exit 2
chmod 600 "$PREPROD_SSH_KEY"
ssh -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=yes \
  -o "UserKnownHostsFile=$PREPROD_KNOWN_HOSTS" -i "$PREPROD_SSH_KEY" \
  "$PREPROD_USER@$PREPROD_HOST" \
  "sudo -n /usr/local/sbin/cicd-preproduction '$image' '$revision'"
````

</details>

<a id="fichier-ci-evidence-py"></a>

### Fichier `ci/evidence.py`

<details>
<summary>Afficher le fichier complet</summary>

````python
"""Portes de qualification: codes réels, rapports présents, commit et digest cohérents.

Ces fichiers sont des preuves techniques, pas une signature cryptographique: protéger
le dépôt, les templates, les artefacts et l'approbation demeure indispensable.
"""

import datetime as dt
import hashlib
import json
import os
import re
import sys
from pathlib import Path

REQUIRED = {
    "quality": {"python-environment", "code-lint", "yaml-lint", "unit", "sast", "sca",
                "shell-lint", "dockerfile", "secrets", "iac", "python-suite"},
    "build": {"image-vulnerabilities", "image-practices", "sbom"},
    "qualify": {"http-functional", "runtime-user", "dast"},
}


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def write(path, data):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def load(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def identity():
    sha, run = os.environ["SOURCE_SHA"], os.environ["RUN_ID"]
    if not re.fullmatch(r"[a-f0-9]{40}|[a-f0-9]{64}", sha):
        raise ValueError("SOURCE_SHA doit identifier un commit Git complet")
    if not re.fullmatch(r"[A-Za-z0-9_.-]{1,100}", run):
        raise ValueError("RUN_ID non sûr")
    return {"source_sha": sha, "run_id": run}


def image_env(path="evidence/image.env"):
    values = {}
    for line in Path(path).read_text(encoding="utf-8").splitlines():
        key, value = line.split("=", 1)
        if key not in {"IMAGE_REF", "IMAGE_DIGEST", "SOURCE_SHA"} or key in values:
            raise ValueError("image.env invalide")
        values[key] = value
    if set(values) != {"IMAGE_REF", "IMAGE_DIGEST", "SOURCE_SHA"}:
        raise ValueError("image.env incomplet")
    ref = values["IMAGE_REF"]
    if not re.fullmatch(r"[a-z0-9][a-z0-9._:/-]*@sha256:[a-f0-9]{64}", ref):
        raise ValueError("Référence OCI immuable invalide")
    if values["SOURCE_SHA"] != identity()["source_sha"]:
        raise ValueError("Mauvais commit dans image.env")
    if ref.split("@", 1)[1] != values["IMAGE_DIGEST"]:
        raise ValueError("Digest incohérent")
    repository = os.environ.get("IMAGE_REPOSITORY")
    if repository and ref.split("@", 1)[0] != repository:
        raise ValueError("Dépôt OCI inattendu")
    return values


def record(stage, name, report, rc):
    target = Path(f"reports/status-{stage}.json")
    values = load(target) if target.exists() else {}
    path = Path(report)
    present = path.is_file() and path.stat().st_size > 0
    values[name] = {"exit_code": int(rc), "report": path.as_posix(),
                    "sha256": digest(path) if present else None,
                    "status": "passed" if int(rc) == 0 and present else "failed",
                    "reason": "report-absent-or-empty" if not present else "tool-exit-code"}
    write(target, values)


def verify(document):
    if document.get("identity") != identity() or document.get("status") != "passed":
        raise ValueError("Preuve non valide pour ce commit et cette exécution")
    stages = document["stages"]
    if "quality" not in stages or not set(stages).issubset(REQUIRED):
        raise ValueError("Chaîne de preuves sans qualité ou étape inconnue")
    if "qualify" in stages and "build" not in stages:
        raise ValueError("Qualification sans construction")
    required_extra = {"reports/coverage.xml", "reports/coverage.json"}
    if "build" in stages:
        required_extra.add("reports/scanned-image-id.txt")
        if not document.get("image_ref") or not document.get("scanned_image_id"):
            raise ValueError("Identité image analysée/publiée absente")
    if not required_extra.issubset(document.get("additional_reports", {})):
        raise ValueError("Preuves additionnelles obligatoires absentes")
    for stage, controls in stages.items():
        if not REQUIRED[stage].issubset(controls):
            raise ValueError(f"Contrôles manquants: {stage}")
        for name, item in controls.items():
            path = Path(item["report"])
            if path.is_absolute() or ".." in path.parts or path.parts[0] != "reports":
                raise ValueError("Chemin de rapport hors reports/")
            if item["status"] != "passed" or item["exit_code"] != 0:
                raise ValueError(f"Contrôle en échec: {name}")
            if not path.is_file() or digest(path) != item["sha256"]:
                raise ValueError(f"Rapport manquant ou modifié: {name}")
    if "image_ref" in document and document["image_ref"] != image_env()["IMAGE_REF"]:
        raise ValueError("Image différente de la candidate")
    for report, expected in document.get("additional_reports", {}).items():
        path = Path(report)
        if path.is_absolute() or ".." in path.parts or path.parts[0] != "reports":
            raise ValueError("Chemin additionnel invalide")
        if not path.is_file() or digest(path) != expected:
            raise ValueError(f"Preuve additionnelle absente/modifiée: {report}")
    return document


def finish(stage):
    predecessors = {"quality": None, "build": "quality", "qualify": "build"}
    previous = predecessors[stage]
    document = verify(load(f"evidence/{previous}.json")) if previous else {
        "identity": identity(), "stages": {}, "status": "passed"}
    controls = load(f"reports/status-{stage}.json")
    document["stages"][stage] = controls
    document["created_utc"] = dt.datetime.now(dt.timezone.utc).isoformat()
    if stage != "quality":
        document["image_ref"] = image_env()["IMAGE_REF"]
    # Parser plusieurs formats: un JSON vide ou un XML tronqué ne vaut pas preuve.
    if stage == "quality":
        import xml.etree.ElementTree as ET

        tests = ET.parse("reports/unit.xml").getroot()
        if not list(tests.iter("testcase")):
            raise ValueError("JUnit sans test")
        coverage = ET.parse("reports/coverage.xml").getroot()
        if float(coverage.attrib["line-rate"]) * 100 < max(85, int(os.getenv("COV_MIN", "85"))):
            raise ValueError("Couverture sous le minimum")
        for path in ["code-lint.json", "sast.json", "sca.json", "secrets.json", "iac.json"]:
            load("reports/" + path)
        iac = load("reports/iac.json")
        checks = iac.get("results", {})
        found = {item["check_id"] for item in checks.get("passed_checks", [])}
        if not {"CKV_DOCKER_2", "CKV_DOCKER_3", "CKV_DOCKER_5"}.issubset(found):
            raise ValueError("Périmètre IaC incomplet")
        if any(checks.get(key) for key in ["failed_checks", "skipped_checks", "parsing_errors"]):
            raise ValueError("IaC échoué, ignoré ou non analysable")
        document["additional_reports"] = {
            "reports/coverage.xml": digest("reports/coverage.xml"),
            "reports/coverage.json": digest("reports/coverage.json")}
        sast = load("reports/sast.json")
        if sast.get("errors") or sast.get("metrics", {}).get("_totals", {}).get("loc", 0) < 1:
            raise ValueError("SAST incomplet ou analyseur incompatible")
        expected = {}
        for line in Path("requirements.txt").read_text(encoding="utf-8").splitlines():
            if not line.strip() or line.lstrip().startswith("#"):
                continue
            match = re.fullmatch(r"([A-Za-z0-9_.-]+)==([^\s;]+)", line.strip())
            if not match:
                raise ValueError("SCA exige un lock runtime complet et épinglé")
            expected[re.sub(r"[-_.]+", "-", match[1]).lower()] = match[2]
        dependencies = load("reports/sca.json").get("dependencies", [])
        actual = {re.sub(r"[-_.]+", "-", item["name"]).lower(): item.get("version")
                  for item in dependencies}
        if not expected or actual != expected:
            raise ValueError("SCA vide ou périmètre/versions incomplets")
        if any(item.get("skip_reason") or item.get("vulns") for item in dependencies):
            raise ValueError("SCA vulnérable ou paquet non analysé")
    if stage == "build":
        document["scanned_image_id"] = Path("reports/scanned-image-id.txt").read_text().strip()
        if not re.fullmatch(r"sha256:[a-f0-9]{64}", document["scanned_image_id"]):
            raise ValueError("Identité image analysée absente")
        document.setdefault("additional_reports", {})["reports/scanned-image-id.txt"] = digest(
            "reports/scanned-image-id.txt")
        load("reports/image-vulnerabilities.json")
        load("reports/image-practices.json")
        sbom = load("reports/sbom.cdx.json")
        if sbom.get("bomFormat") != "CycloneDX" or not sbom.get("components"):
            raise ValueError("SBOM vide ou format inattendu")
    if stage == "qualify":
        zap = load("reports/zap/zap.json")
        if not zap.get("site"):
            raise ValueError("ZAP sans site analysé")
        visited = load("reports/zap/visited.json")
        if not {"http://application:8080/", "http://application:8080/health",
                "http://application:8080/api/items"}.issubset(visited):
            raise ValueError("ZAP n'a pas visité le périmètre attendu")
        document["dast_visited_sha256"] = digest("reports/zap/visited.json")
    verify(document)
    write(f"evidence/{stage}.json", document)
    if stage == "qualify":
        write("evidence/candidate.json", document)


def main():
    action, *args = sys.argv[1:]
    if action == "record":
        record(*args)
    elif action == "finish":
        finish(*args)
    elif action in {"verify", "verify-candidate"}:
        document = verify(load(args[0]))
        if action == "verify-candidate":
            if set(document["stages"]) != set(REQUIRED):
                raise ValueError("Candidate incomplète")
            if digest("reports/zap/visited.json") != document.get("dast_visited_sha256"):
                raise ValueError("Preuve périmètre DAST absente/modifiée")
            created = dt.datetime.fromisoformat(document["created_utc"])
            age = (dt.datetime.now(dt.timezone.utc) - created).total_seconds()
            if not 0 <= age <= 72 * 3600:
                raise ValueError("Candidate expirée (72 heures): requalifier")
    elif action == "image":
        print(image_env()["IMAGE_REF"])
    else:
        raise ValueError("Action inconnue")


if __name__ == "__main__":
    main()
````

</details>

<a id="fichier-ci-gitlab-base-yml"></a>

### Fichier `ci/gitlab/base.yml`

<details>
<summary>Afficher le fichier complet</summary>

````yaml
# Socle commun de la variante modulaire ; mêmes contrats que .gitlab-ci.yml.
workflow:
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
    - if: '$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH && $CI_COMMIT_REF_PROTECTED == "true" && $CI_PIPELINE_SOURCE =~ /^(push|web|schedule)$/'
    - when: never

stages: [quality, build, qualify, promote]

variables:
  GIT_STRATEGY: clone
  GIT_DEPTH: "0"
  TRUSTED_RUNNER_TAG: trusted-shell
  QUALITY_RUNNER_TAG: trusted-shell
  REPORT_RETENTION: "30 days"
  JOB_TIMEOUT: "45m"

.lab-job:
  tags: ["$TRUSTED_RUNNER_TAG"]
  timeout: "$JOB_TIMEOUT"
  interruptible: true
  retry:
    max: 1
    when: [runner_system_failure]
  before_script:
    - export SOURCE_SHA="$CI_COMMIT_SHA"
    - export RUN_ID="$CI_PIPELINE_ID"
    - mkdir -p reports evidence
  artifacts:
    when: always
    access: developer
    expire_in: "$REPORT_RETENTION"
    paths: [reports/, evidence/]
````

</details>

<a id="fichier-ci-gitlab-delivery-yml"></a>

### Fichier `ci/gitlab/delivery.yml`

<details>
<summary>Afficher le fichier complet</summary>

````yaml
build:
  extends: .lab-job
  stage: build
  rules:
    - if: '$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH && $CI_COMMIT_REF_PROTECTED == "true"'
  needs:
    - job: quality
      artifacts: true
  script:
    - export REGISTRY_HOST="${REGISTRY_HOST:-$CI_REGISTRY}"
    - export IMAGE_REPOSITORY="${IMAGE_REPOSITORY:-$CI_REGISTRY_IMAGE}"
    - export REGISTRY_USER="${REGISTRY_USER:-$CI_REGISTRY_USER}"
    - export REGISTRY_PASSWORD="${REGISTRY_PASSWORD:-$CI_REGISTRY_PASSWORD}"
    - bash ci/run.sh build

qualify:
  extends: .lab-job
  stage: qualify
  rules:
    - if: '$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH && $CI_COMMIT_REF_PROTECTED == "true"'
  needs:
    - job: build
      artifacts: true
  script:
    - export REGISTRY_HOST="${REGISTRY_HOST:-$CI_REGISTRY}"
    - export IMAGE_REPOSITORY="${IMAGE_REPOSITORY:-$CI_REGISTRY_IMAGE}"
    - export REGISTRY_USER="${REGISTRY_USER:-$CI_REGISTRY_USER}"
    - export REGISTRY_PASSWORD="${REGISTRY_PASSWORD:-$CI_REGISTRY_PASSWORD}"
    - bash ci/run.sh qualify

promote:
  extends: .lab-job
  stage: promote
  timeout: 10m
  interruptible: false
  retry: 0
  rules:
    - if: '$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH && $CI_COMMIT_REF_PROTECTED == "true"'
      when: manual
      allow_failure: false
  needs:
    - job: qualify
      artifacts: true
  resource_group: preproduction
  environment:
    name: preproduction
    url: "$PREPROD_URL"
    deployment_tier: staging
  script:
    - bash ci/run.sh promote
````

</details>

<a id="fichier-ci-gitlab-quality-yml"></a>

### Fichier `ci/gitlab/quality.yml`

<details>
<summary>Afficher le fichier complet</summary>

````yaml
quality:
  extends: .lab-job
  stage: quality
  tags: ["$QUALITY_RUNNER_TAG"]
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
      variables:
        QUALITY_RUNNER_TAG: isolated-quality
    - if: '$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH && $CI_COMMIT_REF_PROTECTED == "true"'
  script:
    - bash ci/run.sh quality
  artifacts:
    reports:
      junit: reports/unit.xml
      coverage_report:
        coverage_format: cobertura
        path: reports/coverage.xml
````

</details>

<a id="fichier-ci-images-env"></a>

### Fichier `ci/images.env`

<details>
<summary>Afficher le fichier complet</summary>

````text
# Tags de départ vérifiés dans les sources officielles, pas des identifiants immuables.
# bash ci/lock-images.sh génère le verrou par digest, à revoir puis versionner.
PYTHON_BASE=python:3.13-slim-bookworm
TRIVY_IMAGE=aquasec/trivy:0.76.0
GITLEAKS_IMAGE=ghcr.io/gitleaks/gitleaks:v8.30.1
HADOLINT_IMAGE=hadolint/hadolint:2.15.1
DOCKLE_IMAGE=goodwithtech/dockle:v0.4.15
CHECKOV_IMAGE=bridgecrew/checkov:3.3.29
ZAP_IMAGE=ghcr.io/zaproxy/zaproxy:stable
````

</details>

<a id="fichier-ci-lock-images-sh"></a>

### Fichier `ci/lock-images.sh`

<details>
<summary>Afficher le fichier complet</summary>

````bash
#!/usr/bin/env bash
# À exécuter sur le poste de préparation Linux; ne modifie aucun service distant.
set -Eeuo pipefail
cd "$(dirname "$0")/.."
tmp=$(mktemp)
trap 'rm -f "$tmp"' EXIT
while IFS='=' read -r key tag; do
  [[ "$key" =~ ^[A-Z_]+$ ]] || continue
  docker pull --platform linux/amd64 "$tag" >&2
  ref=$(docker image inspect "$tag" --format '{{index .RepoDigests 0}}')
  [[ "$ref" =~ @sha256:[0-9a-f]{64}$ ]] || { echo "Digest absent pour $key" >&2; exit 1; }
  printf '%s=%s\n' "$key" "$ref" >> "$tmp"
done < ci/images.env
mv "$tmp" ci/images.lock.env
echo 'Verrou créé: revoir origines/versions, puis git add -f ci/images.lock.env.'
````

</details>

<a id="fichier-ci-python-quality-sh"></a>

### Fichier `ci/python-quality.sh`

<details>
<summary>Afficher le fichier complet</summary>

````bash
#!/usr/bin/env bash
# Exécuté dans l'image Python verrouillée, utilisateur identique au propriétaire workspace.
set -uo pipefail
export HOME=/tmp
python -m venv /tmp/quality-venv || exit
export PATH="/tmp/quality-venv/bin:$PATH"
python -m pip install --disable-pip-version-check -r requirements-dev.txt > reports/python-install.log 2>&1
install_rc=$?
python ci/evidence.py record quality python-environment reports/python-install.log "$install_rc"
if (( install_rc != 0 )); then exit "$install_rc"; fi
failed=0
check() {
  local name=$1 report=$2
  shift 2
  rm -f -- "$report"
  "$@" > "reports/$name.log" 2>&1
  local rc=$?
  # Les outils silencieux réussis gardent une preuve lisible (pas de faux rapport scanner).
  if [[ "$report" == "reports/$name.log" && ! -s "$report" ]]; then printf 'exit_code=%s\n' "$rc" > "$report"; fi
  python ci/evidence.py record quality "$name" "$report" "$rc"
  (( rc == 0 )) || failed=1
}
check code-lint reports/code-lint.json ruff check app tests ci --output-format json --output-file reports/code-lint.json
check yaml-lint reports/yaml-lint.log yamllint -c .yamllint.yml .gitlab-ci.yml azure-pipelines.yml ci config exemples
check unit reports/unit.xml pytest --junitxml=reports/unit.xml --cov=app --cov-report=xml:reports/coverage.xml --cov-report=json:reports/coverage.json --cov-report=term --cov-fail-under="${COV_MIN:-85}"
check sast reports/sast.json bandit -r app -f json -o reports/sast.json
# requirements.txt contient la fermeture runtime complète et épinglée (2 paquets).
# Éviter une résolution pip vide; la porte compare aussi noms et versions attendus.
check sca reports/sca.json pip-audit -r requirements.txt --no-deps --disable-pip --strict --format json --output reports/sca.json --progress-spinner off
exit "$failed"
````

</details>

<a id="fichier-ci-run-sh"></a>

### Fichier `ci/run.sh`

<details>
<summary>Afficher le fichier complet</summary>

````bash
#!/usr/bin/env bash
# Point d'entrée partagé: aucun eval ni source sur les artefacts téléchargés.
set -Eeuo pipefail
cd "$(dirname "$0")/.."
umask 077
stage=${1:?Usage: bash ci/run.sh quality|build|qualify|promote|rollback}
export SOURCE_SHA=${SOURCE_SHA:-$(git rev-parse HEAD)} RUN_ID=${RUN_ID:-local}
[[ "$(git rev-parse HEAD)" == "$SOURCE_SHA" ]] || { echo 'Commit checkout différent de SOURCE_SHA' >&2; exit 2; }
python3 -c 'import sys; assert sys.version_info >= (3, 9)'
mkdir -p reports evidence
tmp=$(mktemp -d "$PWD/.ci-tmp-XXXXXXXX")
export DOCKER_CONFIG="$tmp/docker"
mkdir -p "$DOCKER_CONFIG"
network= container= zap_name=
cleanup() {
  local rc=$?
  trap - EXIT
  [[ -z "$zap_name" ]] || docker rm -f "$zap_name" >/dev/null 2>&1 || true
  if [[ -n "$container" ]]; then
    docker logs "$container" > reports/application.log 2>&1 || true
    docker rm -f "$container" >/dev/null 2>&1 || true
  fi
  # Suivre aussi tous les conteneurs outils, y compris après annulation de leur CLI.
  while read -r resource; do
    [[ -z "$resource" ]] || docker rm -f "$resource" >/dev/null 2>&1 || true
  done < <(docker ps -aq --filter "label=cicd.job=${tmp##*/}" 2>/dev/null || true)
  [[ -z "$network" ]] || docker network rm "$network" >/dev/null 2>&1 || true
  rm -rf -- "$tmp"  # chemin créé par mktemp sous le workspace, jamais un chemin utilisateur
  exit "$rc"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

if [[ "$stage" != promote && "$stage" != rollback ]]; then
  [[ -f ci/images.lock.env ]] || { echo 'Exécuter bash ci/lock-images.sh puis versionner le verrou.' >&2; exit 2; }
  # Fichier source de confiance revu dans Git, jamais téléchargé comme artefact.
  source ci/images.lock.env
  for key in PYTHON_BASE TRIVY_IMAGE GITLEAKS_IMAGE HADOLINT_IMAGE DOCKLE_IMAGE CHECKOV_IMAGE ZAP_IMAGE; do
    [[ "${!key}" =~ @sha256:[a-f0-9]{64}$ ]] || { echo "Verrou invalide: $key" >&2; exit 2; }
  done
  docker info > reports/docker-info.log
fi

control() {
  local name=$1 report=$2
  shift 2
  local rc=0
  rm -f -- "$report"
  "$@" > "reports/$name.log" 2>&1 || rc=$?
  if [[ "$report" == "reports/$name.log" && ! -s "$report" ]]; then printf 'exit_code=%s\n' "$rc" > "$report"; fi
  python3 ci/evidence.py record "$stage" "$name" "$report" "$rc"
  echo "$name: exit=$rc (voir $report et reports/$name.log)"
}
tool() {
  docker run --rm --label cicd.demo=true --label "cicd.job=${tmp##*/}" --user "$(id -u):$(id -g)" -e HOME=/tmp -v "$PWD:/work" -w /work "$@"
}
json_stdout() {
  local report=$1
  shift
  # JSON seul dans le rapport; stderr reste dans le journal et le code est conservé.
  "$@" > "$report"
}
scan_git_secrets() {
  # Un worktree possède un fichier .git pointant hors de /work. Un miroir autonome
  # permet de scanner le même historique sans monter les métadonnées Git de l'hôte.
  git clone --mirror --no-hardlinks "$PWD" "$tmp/secrets.git" || return
  git -C "$tmp/secrets.git" cat-file -e "$SOURCE_SHA^{commit}" || return
  tool -v "$tmp/secrets.git:/scan/source.git:ro" "$GITLEAKS_IMAGE" \
    git /scan/source.git --log-opts='--all HEAD' --redact --exit-code 10 \
    --report-format json --report-path /work/reports/secrets.json
}
login() {
  : "${REGISTRY_HOST:?}" "${REGISTRY_USER:?}" "${REGISTRY_PASSWORD:?}"
  printf '%s' "$REGISTRY_PASSWORD" | docker login "$REGISTRY_HOST" -u "$REGISTRY_USER" --password-stdin
}

case "$stage" in
  quality)
    rm -f reports/status-quality.json evidence/quality.json
    # Aucun skip automatique: une exception enregistrée réclame une implémentation revue.
    python3 -c 'import json; assert not json.load(open("config/exceptions.json"))["exceptions"], "Exceptions à intégrer explicitement dans les règles après revue"'
    control python-suite reports/python-suite.log tool -e COV_MIN="${COV_MIN:-85}" "$PYTHON_BASE" bash ci/python-quality.sh
    # Syntaxe Bash vérifiée sans exécuter les scripts d'installation.
    control shell-lint reports/shell-lint.log bash -c 'for f in ci/*.sh ops/*.sh; do bash -n "$f" || exit; done; echo "Syntaxe Bash valide"'
    # Cette image a un CMD (pas d'ENTRYPOINT) : fournir le binaire explicitement.
    control dockerfile reports/dockerfile.json json_stdout reports/dockerfile.json tool "$HADOLINT_IMAGE" hadolint --config config/hadolint.yaml --format json Dockerfile
    [[ -d .git ]] || git rev-parse --git-dir >/dev/null
    control secrets reports/secrets.json scan_git_secrets
    # Trois règles explicites: HEALTHCHECK, USER, pas d'update isolé dans un RUN.
    # --output-file-path désigne normalement un dossier. Capturer stdout évite
    # d'attendre un fichier que Checkov aurait nommé results_json.json ailleurs.
    control iac reports/iac.json json_stdout reports/iac.json tool --entrypoint checkov -e CKV_PARSE_ERROR_FAIL=true "$CHECKOV_IMAGE" --file Dockerfile --framework dockerfile --check CKV_DOCKER_2,CKV_DOCKER_3,CKV_DOCKER_5 --compact --quiet --output json --skip-download
    python3 ci/evidence.py finish quality
    ;;
  build)
    : "${IMAGE_REPOSITORY:?Nom OCI sans tag}"
    python3 ci/evidence.py verify evidence/quality.json
    rm -f reports/status-build.json evidence/build.json evidence/image.env
    local_tag="${IMAGE_REPOSITORY}:ci-${SOURCE_SHA:0:12}-${RUN_ID}"
    docker build --pull --platform linux/amd64 --build-arg "PYTHON_BASE=$PYTHON_BASE" --build-arg "SOURCE_SHA=$SOURCE_SHA" --iidfile reports/scanned-image-id.txt --tag "$local_tag" . > reports/build.log 2>&1
    scanned_id=$(cat reports/scanned-image-id.txt)
    docker image save "$scanned_id" -o "$tmp/image.tar"
    # Archive en lecture seule: ces scanners n'ont pas besoin du socket Docker.
    control image-vulnerabilities reports/image-vulnerabilities.json tool -v "$tmp:/scan:ro" "$TRIVY_IMAGE" image --input /scan/image.tar --scanners vuln --severity HIGH,CRITICAL --exit-code 10 --format json --output /work/reports/image-vulnerabilities.json --timeout "${SCAN_TIMEOUT:-600}s"
    control image-practices reports/image-practices.json tool -v "$tmp:/scan:ro" "$DOCKLE_IMAGE" --input /scan/image.tar --exit-code 10 --exit-level WARN --format json --output /work/reports/image-practices.json
    control sbom reports/sbom.cdx.json tool -v "$tmp:/scan:ro" "$TRIVY_IMAGE" image --input /scan/image.tar --format cyclonedx --output /work/reports/sbom.cdx.json
    # Vérification contrôles avant publication; le digest registre n'existe pas encore.
    python3 -c 'import json; s=json.load(open("reports/status-build.json")); assert len(s)==3 and all(x["status"]=="passed" for x in s.values()), "Analyse image bloquante"'
    login
    docker push "$local_tag" > reports/push.log 2>&1
    # Retenir le digest de CE push, jamais résoudre à nouveau un tag modifiable.
    pushed_digest=$(python3 -c 'import pathlib,re; values=re.findall(r"digest: (sha256:[a-f0-9]{64})",pathlib.Path("reports/push.log").read_text()); assert values; print(values[-1])')
    ref="$IMAGE_REPOSITORY@$pushed_digest"
    docker pull --platform linux/amd64 "$ref" >> reports/push.log 2>&1
    [[ "$(docker image inspect "$ref" --format '{{.Id}}')" == "$scanned_id" ]] || { echo 'Image publiée différente de l’image analysée' >&2; exit 2; }
    [[ "$ref" == "$IMAGE_REPOSITORY"@sha256:* ]] || { echo 'Digest registre inattendu' >&2; exit 2; }
    printf 'IMAGE_REF=%s\nIMAGE_DIGEST=%s\nSOURCE_SHA=%s\n' "$ref" "${ref#*@}" "$SOURCE_SHA" > evidence/image.env
    python3 ci/evidence.py finish build
    ;;
  qualify)
    python3 ci/evidence.py verify evidence/build.json
    rm -f reports/status-qualify.json evidence/qualify.json evidence/candidate.json
    image=$(python3 ci/evidence.py image)
    login
    docker pull --platform linux/amd64 "$image" > reports/pull.log 2>&1
    # mktemp assure l'unicité même pour deux jobs de la même exécution.
    suffix=${tmp##*/}
    network="qual-${suffix}"; container="app-${suffix}"
    docker network create --label cicd.demo=true "$network" >/dev/null
    docker run -d --name "$container" --label cicd.demo=true --network "$network" --network-alias application --read-only --tmpfs /tmp:rw,noexec,nosuid,size=32m --cap-drop ALL --security-opt no-new-privileges --pids-limit 128 --memory 256m --cpus 1 "$image" > reports/container-id.txt
    control http-functional reports/http-functional.json json_stdout reports/http-functional.json tool --network "$network" "$PYTHON_BASE" python tests/http_probe.py http://application:8080 "$SOURCE_SHA" "${READY_TIMEOUT:-60}"
    control runtime-user reports/runtime-user.log bash -c 'uid=$(docker exec "$1" id -u); echo "uid=$uid"; test "$uid" = 10001' _ "$container"
    mkdir -p reports/zap
    # L'image ZAP conserve son UID et son HOME: copier les preuves via docker cp.
    zap_name="zap-${suffix}"
    zap_rc=0
    # hooks/règles en lecture seule; rapports écrits par l'UID natif de ZAP.
    timeout "${SCAN_TIMEOUT:-600}" docker run --name "$zap_name" --label cicd.demo=true --network "$network" \
      -v "$PWD/ci/zap_hooks.py:/tmp/zap_hooks.py:ro" \
      -v "$PWD/config/zap-rules.tsv:/tmp/zap-rules.tsv:ro" \
      "$ZAP_IMAGE" bash -c 'mkdir -p /zap/wrk && exec zap-baseline.py -t http://application:8080 -m 1 -T 5 -z "-silent" --hook=/tmp/zap_hooks.py -c /tmp/zap-rules.tsv -J zap.json -r zap.html' > reports/dast.log 2>&1 || zap_rc=$?
    docker cp "$zap_name:/zap/wrk/zap.json" reports/zap/zap.json 2>> reports/dast.log || true
    docker cp "$zap_name:/zap/wrk/zap.html" reports/zap/zap.html 2>> reports/dast.log || true
    docker cp "$zap_name:/zap/wrk/visited.json" reports/zap/visited.json 2>> reports/dast.log || true
    docker rm -f "$zap_name" >/dev/null 2>&1 || true
    # 0 succès; 1 FAIL; 2 WARN; 3 exécution en erreur. Aucune conversion en succès.
    python3 ci/evidence.py record qualify dast reports/zap/zap.json "$zap_rc"
    python3 ci/evidence.py finish qualify
    ;;
  promote)
    python3 ci/evidence.py verify-candidate evidence/candidate.json
    image=$(python3 ci/evidence.py image)
    bash ci/deploy-remote.sh "$image" "$SOURCE_SHA" | tee reports/preproduction.log
    ;;
  rollback)
    : "${ROLLBACK_IMAGE_REF:?Digest déjà approuvé}" "${ROLLBACK_EVIDENCE:?Paquet ancien approuvé requis}"
    # Importer aussi image.env et les rapports de la même version dans evidence/ et reports/.
    # La limite de fraîcheur de 72h impose une requalification des anciennes images.
    python3 ci/evidence.py verify-candidate "$ROLLBACK_EVIDENCE"
    [[ "$(python3 ci/evidence.py image)" == "$ROLLBACK_IMAGE_REF" ]] || exit 2
    bash ci/deploy-remote.sh "$ROLLBACK_IMAGE_REF" "$SOURCE_SHA" | tee reports/rollback.log
    ;;
  *) echo 'Action inconnue' >&2; exit 2 ;;
esac
````

</details>

<a id="fichier-ci-zap-hooks-py"></a>

### Fichier `ci/zap_hooks.py`

<details>
<summary>Afficher le fichier complet</summary>

````python
"""Preuve de la surface réellement visitée dans la session ZAP."""

import json
from pathlib import Path


def zap_started(zap, target):
    # Requêtes à travers ZAP: alimentent ses analyses passives, sans scan actif.
    for path in ["/", "/health", "/api/items"]:
        zap.urlopen(target.rstrip("/") + path)


def zap_pre_shutdown(zap):
    Path("/zap/wrk/visited.json").write_text(json.dumps(zap.core.urls()), encoding="utf-8")
````

</details>

<a id="fichier-config-exceptions-json"></a>

### Fichier `config/exceptions.json`

<details>
<summary>Afficher le fichier complet</summary>

````json
{
  "schema": 1,
  "exceptions": []
}
````

</details>

<a id="fichier-config-hadolint-yaml"></a>

### Fichier `config/hadolint.yaml`

<details>
<summary>Afficher le fichier complet</summary>

````yaml
failure-threshold: warning
# Tags versions autorisés au lint; le script CI exige les digests via images.lock.env.
trustedRegistries:
  - docker.io
  - ghcr.io
````

</details>

<a id="fichier-config-test-compose-yml"></a>

### Fichier `config/test.compose.yml`

<details>
<summary>Afficher le fichier complet</summary>

````yaml
# Variante manuelle de test. Le pipeline final utilise un réseau unique créé par run.sh.
services:
  application:
    image: ${IMAGE_REF:?Fournir une référence OCI par digest}
    user: "10001:10001"
    read_only: true
    tmpfs:
      - /tmp:rw,noexec,nosuid,size=32m
    cap_drop: [ALL]
    security_opt: [no-new-privileges:true]
    pids_limit: 128
    mem_limit: 256m
    cpus: 1.0
    ports:
      - "127.0.0.1:18080:8080"
````

</details>

<a id="fichier-config-zap-rules-tsv"></a>

### Fichier `config/zap-rules.tsv`

<details>
<summary>Afficher le fichier complet</summary>

````text
# Les alertes nouvelles sont WARN; run.sh conserve et bloque le code 2 (WARN).
# Aucune règle ignorée. Exception seulement via revue et expiration documentées.
````

</details>

### Fichier `Dockerfile`

<details>
<summary>Afficher le fichier complet</summary>

````dockerfile
# syntax=docker/dockerfile:1
# PYTHON_BASE doit être verrouillé par digest dans ci/images.lock.env avant la CI.
ARG PYTHON_BASE=python:3.13-slim-bookworm
FROM ${PYTHON_BASE} AS dependencies
WORKDIR /build
COPY requirements.txt ./
# Aucun compilateur nécessaire: uniquement wheels (échec si plateforme sans wheel).
RUN python -m pip install --no-cache-dir --only-binary=:all: --target=/opt/deps -r requirements.txt

FROM ${PYTHON_BASE} AS runtime
ARG SOURCE_SHA=local
LABEL org.opencontainers.image.title="catalogue-cicd" \
      org.opencontainers.image.revision="${SOURCE_SHA}"
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=/opt/deps \
    PORT=8080 DATABASE_PATH=/tmp/catalogue.sqlite APP_REVISION=${SOURCE_SHA}
WORKDIR /app
COPY --from=dependencies /opt/deps /opt/deps
COPY --chown=10001:10001 app/ ./app/
# UID numérique stable: indépendant de /etc/passwd, port non privilégié.
USER 10001:10001
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
    CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/health', timeout=2)"]
# Forme exec: Python reçoit SIGTERM et termine proprement.
CMD ["python", "-m", "app.service"]
````

</details>

<a id="fichier-exemples-azure-debutant-yml"></a>

### Fichier `exemples/azure-debutant.yml`

<details>
<summary>Afficher le fichier complet</summary>

````yaml
# Étape pédagogique manuelle, sans secret et réservée à un dépôt de confiance.
# Ce fichier n'est PAS la chaîne complète de qualification et de promotion.
trigger: none
pr: none
pool:
  name: CI-Linux-Trusted
  demands:
  - Agent.OS -equals Linux
  - DockerTrusted -equals true
jobs:
- job: PremierControle
  timeoutInMinutes: 40
  cancelTimeoutInMinutes: 5
  condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'), eq(variables['Build.Reason'], 'Manual'))
  workspace:
    clean: all
  steps:
  - checkout: self
    clean: true
    fetchDepth: 0
    persistCredentials: false
  - bash: |
      set -euo pipefail
      mkdir -p reports evidence
      printf 'Commit traité : %s\n' "$SOURCE_SHA"
      docker version
      bash ci/run.sh quality
    displayName: Découvrir un vrai contrôle qualité
    env:
      SOURCE_SHA: $(Build.SourceVersion)
      RUN_ID: $(Build.BuildId)
  - task: PublishPipelineArtifact@1
    condition: always()
    inputs:
      targetPath: $(Build.SourcesDirectory)/reports
      artifact: introduction-reports
  - task: PublishPipelineArtifact@1
    condition: always()
    inputs:
      targetPath: $(Build.SourcesDirectory)/evidence
      artifact: introduction-evidence
````

</details>

<a id="fichier-exemples-azure-modulaire-yml"></a>

### Fichier `exemples/azure-modulaire.yml`

<details>
<summary>Afficher le fichier complet</summary>

````yaml
# Créer un pipeline séparé pointant vers CE fichier, sans déplacer les chemins relatifs.
trigger:
  batch: true
  branches:
    include: [main]
pr: none

parameters:
- name: agentPool
  type: string
  default: CI-Linux-Trusted

variables:
- group: cicd-config

pool:
  name: ${{ parameters.agentPool }}
  demands:
  - Agent.OS -equals Linux
  - DockerTrusted -equals true

stages:
- template: ../ci/azure/quality.stage.yml
- template: ../ci/azure/image.stage.yml
  parameters:
    action: build
    stageName: Build
    dependsOn: Quality
    incoming: quality
    requiredFile: quality.json
    timeoutMinutes: 50
- template: ../ci/azure/image.stage.yml
  parameters:
    action: qualify
    stageName: Qualify
    dependsOn: Build
    incoming: build
    requiredFile: image.env
    timeoutMinutes: 30
- template: ../ci/azure/preproduction.stage.yml
````

</details>

<a id="fichier-exemples-gitlab-debutant-yml"></a>

### Fichier `exemples/gitlab-debutant.yml`

<details>
<summary>Afficher le fichier complet</summary>

````yaml
# Première marche : syntaxe GitLab et exécution Docker sans publication d'image.
# Copier à la racine du dépôt sous .gitlab-ci.yml pour cet exercice seulement.
workflow:
  rules:
    - if: '$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH && $CI_COMMIT_REF_PROTECTED == "true"'
    - when: never

stages: [decouverte, quality]

default:
  tags: [trusted-shell]

premier-job:
  stage: decouverte
  timeout: 5m
  script:
    - whoami
    - git --version
    - docker version
    - python3 --version
    - printf '%s\n' "$CI_COMMIT_SHA"

qualite:
  stage: quality
  timeout: 45m
  script:
    - export SOURCE_SHA="$CI_COMMIT_SHA"
    - export RUN_ID="$CI_PIPELINE_ID"
    - bash ci/run.sh quality
  artifacts:
    when: always
    access: developer
    expire_in: 7 days
    paths: [reports/, evidence/]
    reports:
      junit: reports/unit.xml
      coverage_report:
        coverage_format: cobertura
        path: reports/coverage.xml
````

</details>

<a id="fichier-exemples-gitlab-modulaire-yml"></a>

### Fichier `exemples/gitlab-modulaire.yml`

<details>
<summary>Afficher le fichier complet</summary>

````yaml
# Remplacer .gitlab-ci.yml par CE fichier pour activer la variante modulaire.
# Les fichiers inclus restent dans le même dépôt et au même commit.
include:
  - local: /ci/gitlab/base.yml
  - local: /ci/gitlab/quality.yml
  - local: /ci/gitlab/delivery.yml
````

</details>

<a id="fichier-ops-cleanup-stale-sh"></a>

### Fichier `ops/cleanup-stale.sh`

<details>
<summary>Afficher le fichier complet</summary>

````bash
#!/usr/bin/env bash
# Filet de sécurité après SIGKILL/perte VM: uniquement ressources lab étiquetées et âgées.
# Exécuter en maintenance, runner drainé; jamais sur une VM partagée avec des jobs actifs.
set -Eeuo pipefail
[[ "${RUNNER_DRAINED:-}" == yes ]] || { echo 'Drainer le runner puis RUNNER_DRAINED=yes' >&2; exit 2; }
threshold=$(date -d '24 hours ago' +%s)
while read -r resource; do
  [[ -n "$resource" ]] || continue
  created=$(docker inspect --format '{{.Created}}' "$resource")
  if (( $(date -d "$created" +%s) < threshold )); then docker rm -f "$resource"; fi
done < <(docker ps -aq --filter label=cicd.demo=true)
# Ne retirer que les réseaux étiquetés vides, après arrêt de tous les jobs du runner.
while read -r resource; do
  [[ -n "$resource" ]] || continue
  docker network rm "$resource" || true
done < <(docker network ls -q --filter label=cicd.demo=true)
````

</details>

<a id="fichier-ops-docker-bench-sh"></a>

### Fichier `ops/docker-bench.sh`

<details>
<summary>Afficher le fichier complet</summary>

````bash
#!/usr/bin/env bash
# Audit administrateur de l'hôte. Jamais exécuté par le pipeline applicatif.
set -Eeuo pipefail
: "${BENCH_COMMIT:?SHA Git complet revu du dépôt officiel requis}"
[[ "$BENCH_COMMIT" =~ ^[a-f0-9]{40}$ && $EUID -eq 0 ]] || exit 2
audit_dir=$(mktemp -d /var/tmp/docker-bench-XXXXXXXX)
chmod 700 "$audit_dir"
git -C "$audit_dir" init -q
git -C "$audit_dir" remote add origin https://github.com/docker/docker-bench-security.git
git -C "$audit_dir" fetch --depth 1 origin "$BENCH_COMMIT"
git -C "$audit_dir" checkout --detach FETCH_HEAD
[[ "$(git -C "$audit_dir" rev-parse HEAD)" == "$BENCH_COMMIT" ]]
echo "Sources dans $audit_dir; audit root de cet hôte, pas une analyse d'image."
# Lire le code à cette révision avant cette exécution sur une VM pilote.
cd "$audit_dir"
rc=0
bash docker-bench-security.sh -l "$audit_dir/audit.log" || rc=$?
printf 'Code outil=%s; lire WARN/NOTE, un code 0 ne signifie pas conformité.\n' "$rc"
echo "Conserver logs + commit + inventaire hôte + actions dans dossier changement."
exit "$rc"
````

</details>

<a id="fichier-ops-preproduction-sh"></a>

### Fichier `ops/preproduction.sh`

<details>
<summary>Afficher le fichier complet</summary>

````bash
#!/usr/bin/env bash
# Installer root: /usr/local/sbin/cicd-preproduction, root:root 0755.
set -Eeuo pipefail
[[ $EUID -eq 0 ]] || { echo 'Compte root requis via règle sudo limitée' >&2; exit 2; }
image=${1:?image requise}; revision=${2:?commit requis}
[[ $# -eq 2 ]] || exit 2
allowed=$(cat /etc/cicd-demo/repository)
[[ "$image" =~ ^[a-z0-9][a-z0-9._:/-]*@sha256:[a-f0-9]{64}$ ]] || exit 2
[[ "${image%@*}" == "$allowed" ]] || { echo 'Dépôt non autorisé' >&2; exit 2; }
[[ "$revision" =~ ^([a-f0-9]{40}|[a-f0-9]{64})$ ]] || exit 2
exec 9>/run/lock/cicd-demo.lock
flock -w 300 9
export DOCKER_CONFIG=/etc/cicd-demo/docker
docker pull --platform linux/amd64 "$image"
old= old_id= committed=0 new_attempted=0
restore() {
  local rc=$?
  trap - EXIT ERR INT TERM HUP
  if (( committed == 0 )); then
    # Comparer les identités évite de supprimer l'ancienne instance si rename a échoué.
    current_id=$(docker container inspect catalogue-preprod --format '{{.Id}}' 2>/dev/null || true)
    if [[ -n "$old_id" && "$current_id" == "$old_id" ]]; then
      docker start catalogue-preprod >/dev/null || echo 'ÉCHEC de rétablissement ancien service' >&2
    else
      if (( new_attempted )); then
        docker logs catalogue-preprod >&2 || true
        docker rm -f catalogue-preprod >/dev/null 2>&1 || true
      fi
      previous_id=$(docker container inspect catalogue-previous --format '{{.Id}}' 2>/dev/null || true)
      if [[ -n "$old_id" && "$previous_id" == "$old_id" ]]; then
        if docker rename catalogue-previous catalogue-preprod && docker start catalogue-preprod >/dev/null; then
          echo "Ancienne instance relancée: $old" >&2
        else
          echo 'ÉCHEC de rétablissement: intervention immédiate requise' >&2
        fi
      fi
    fi
    (( rc != 0 )) || rc=1
  fi
  exit "$rc"
}
# Installés avant toute mutation du service, y compris stop et rename.
trap restore EXIT
trap 'exit 130' INT
trap 'exit 143' TERM HUP
if docker container inspect catalogue-preprod >/dev/null 2>&1; then
  old=$(docker container inspect catalogue-preprod --format '{{.Config.Image}}')
  old_id=$(docker container inspect catalogue-preprod --format '{{.Id}}')
  docker rm -f catalogue-previous >/dev/null 2>&1 || true
  docker stop -t 15 catalogue-preprod >/dev/null
  docker rename catalogue-preprod catalogue-previous
fi
new_attempted=1
docker run -d --name catalogue-preprod --restart unless-stopped \
  --label cicd.role=preproduction --read-only --tmpfs /tmp:rw,noexec,nosuid,size=32m \
  --cap-drop ALL --security-opt no-new-privileges --pids-limit 128 --memory 256m --cpus 1 \
  -p 127.0.0.1:8080:8080 "$image" >/dev/null
ready=0
for ((attempt=0; attempt<30; attempt++)); do
  if docker exec catalogue-preprod python -c \
    'import json,sys,urllib.request; d=json.load(urllib.request.urlopen("http://127.0.0.1:8080/health",timeout=2)); assert d=={"status":"ok","revision":sys.argv[1]}' "$revision" >/dev/null 2>&1; then
    ready=1; break
  fi
  sleep 2
done
[[ "$ready" == 1 ]]  # Échec déclenche restore et reste un échec du pipeline.
docker exec catalogue-preprod python -c \
  'import json,urllib.request; d=json.load(urllib.request.urlopen("http://127.0.0.1:8080/api/items",timeout=2)); assert d=={"items":[{"id":1,"name":"article-demo"}]}'
[[ "$(docker exec catalogue-preprod id -u)" == 10001 ]]
observed=$(docker container inspect catalogue-preprod --format '{{.Config.Image}}')
[[ "$observed" == "$image" ]]
mkdir -p /var/lib/cicd-demo
IMAGE="$image" REVISION="$revision" PREVIOUS="$old" python3 - <<'PY'
import datetime, json, os
receipt = {"image_ref": os.environ["IMAGE"], "revision": os.environ["REVISION"],
           "previous_image_ref": os.environ["PREVIOUS"], "status": "deployed",
           "utc": datetime.datetime.now(datetime.timezone.utc).isoformat()}
with open('/var/lib/cicd-demo/deployment.json', 'w') as output:
    json.dump(receipt, output, indent=2)
print(json.dumps(receipt))
PY
committed=1
````

</details>

<a id="fichier-parametres-exemple-env"></a>

### Fichier `parametres.exemple.env`

<details>
<summary>Afficher le fichier complet</summary>

````text
# Valeurs non sensibles à adapter; ne jamais enregistrer le fichier local rempli avec secrets.
IMAGE_REPOSITORY=registry.example.net/formation/catalogue
REGISTRY_HOST=registry.example.net
REGISTRY_USER=compte-ci
# REGISTRY_PASSWORD est injecté par la plateforme ou read -s, pas écrit ici.
COV_MIN=85
READY_TIMEOUT=60
SCAN_TIMEOUT=600
PREPROD_HOST=preproduction.example.net
PREPROD_USER=deploy
PREPROD_URL=https://preproduction.example.net
# PREPROD_SSH_KEY et PREPROD_KNOWN_HOSTS sont des chemins de fichiers gérés par la CI.
````

</details>

<a id="fichier-pyproject-toml"></a>

### Fichier `pyproject.toml`

<details>
<summary>Afficher le fichier complet</summary>

````toml
[tool.pytest.ini_options]
testpaths = ["tests"]
pythonpath = ["."]

[tool.ruff]
line-length = 100
target-version = "py313"

[tool.ruff.lint]
select = ["E", "F", "I"]

[tool.coverage.run]
source = ["app"]
omit = ["app/__init__.py"]

[tool.coverage.report]
exclude_also = ["if __name__ == .__main__.:", "def main\\("]
````

</details>

<a id="fichier-requirements-dev-txt"></a>

### Fichier `requirements-dev.txt`

<details>
<summary>Afficher le fichier complet</summary>

````text
-r requirements.txt
pytest==8.4.2
pytest-cov==6.3.0
ruff==0.13.3
bandit==1.9.4
pip-audit==2.9.0
yamllint==1.37.1
PyYAML==6.0.3
````

</details>

<a id="fichier-requirements-txt"></a>

### Fichier `requirements.txt`

<details>
<summary>Afficher le fichier complet</summary>

````text
# Runtime complet: Jinja2 et sa dépendance transitive; SCA réel sur ce fichier.
Jinja2==3.1.6
MarkupSafe==3.0.3
````

</details>

<a id="fichier-tests-http-probe-py"></a>

### Fichier `tests/http_probe.py`

<details>
<summary>Afficher le fichier complet</summary>

````python
"""Test fonctionnel de l'image, exécuté sur le réseau Docker de qualification."""

import json
import sys
import time
from urllib.error import URLError
from urllib.request import urlopen


def probe(base, revision, timeout=60):
    deadline = time.monotonic() + timeout
    while True:
        try:
            with urlopen(base + "/health", timeout=2) as response:
                health = json.load(response)
            if health == {"status": "ok", "revision": revision}:
                break
        except (URLError, TimeoutError, ConnectionError):
            pass
        if time.monotonic() >= deadline:
            raise RuntimeError("Application indisponible ou mauvaise révision")
        time.sleep(1)
    with urlopen(base + "/api/items", timeout=3) as response:
        assert response.status == 200
        assert json.load(response) == {"items": [{"id": 1, "name": "article-demo"}]}
    with urlopen(base + "/", timeout=3) as response:
        assert revision in response.read().decode()
    print(json.dumps({"status": "passed", "target": base, "revision": revision,
                      "paths": ["/health", "/api/items", "/"]}))


if __name__ == "__main__":
    probe(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 60)
````

</details>

<a id="fichier-tests-test-evidence-py"></a>

### Fichier `tests/test_evidence.py`

<details>
<summary>Afficher le fichier complet</summary>

````python
"""Les portes refusent une candidate incomplète, altérée ou hors de son identité."""

import datetime as dt
import json
import sys
from pathlib import Path

import pytest

from ci import evidence

SOURCE_SHA = "a" * 40
RUN_ID = "pipeline-42"
REPOSITORY = "registry.example.test/formation/catalogue"
IMAGE_DIGEST = "sha256:" + "b" * 64
IMAGE_REF = REPOSITORY + "@" + IMAGE_DIGEST


def write_report(path, content):
    """Créer une vraie sortie lisible, sans service, scanner ni accès réseau."""
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    if isinstance(content, (dict, list)):
        target.write_text(json.dumps(content), encoding="utf-8")
    else:
        target.write_text(content, encoding="utf-8")


@pytest.fixture
def candidate(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    monkeypatch.setenv("SOURCE_SHA", SOURCE_SHA)
    monkeypatch.setenv("RUN_ID", RUN_ID)
    monkeypatch.setenv("IMAGE_REPOSITORY", REPOSITORY)
    monkeypatch.setenv("COV_MIN", "85")
    write_report("requirements.txt", "Jinja2==3.1.6\nMarkupSafe==3.0.3\n")
    write_report(
        "evidence/image.env",
        f"IMAGE_REF={IMAGE_REF}\nIMAGE_DIGEST={IMAGE_DIGEST}\nSOURCE_SHA={SOURCE_SHA}\n",
    )
    write_report("reports/coverage.xml", '<coverage line-rate="0.90"/>')
    write_report("reports/coverage.json", {"totals": {"percent_covered": 90}})
    write_report("reports/scanned-image-id.txt", "sha256:" + "e" * 64 + "\n")
    visited = [
        "http://application:8080/",
        "http://application:8080/health",
        "http://application:8080/api/items",
    ]
    write_report("reports/zap/visited.json", visited)
    outputs = {
        "code-lint": ("reports/code-lint.json", []),
        "unit": (
            "reports/unit.xml",
            '<testsuites><testsuite tests="1"><testcase name="health"/></testsuite>'
            "</testsuites>",
        ),
        "sast": (
            "reports/sast.json",
            {"errors": [], "results": [], "metrics": {"_totals": {"loc": 12}}},
        ),
        "sca": (
            "reports/sca.json",
            {
                "dependencies": [
                    {"name": "jinja2", "version": "3.1.6", "vulns": []},
                    {"name": "markupsafe", "version": "3.0.3", "vulns": []},
                ],
                "fixes": [],
            },
        ),
        "dockerfile": ("reports/dockerfile.json", []),
        "secrets": ("reports/secrets.json", []),
        "iac": (
            "reports/iac.json",
            {
                "results": {
                    "passed_checks": [
                        {"check_id": "CKV_DOCKER_2"},
                        {"check_id": "CKV_DOCKER_3"},
                        {"check_id": "CKV_DOCKER_5"},
                    ],
                    "failed_checks": [],
                    "skipped_checks": [],
                    "parsing_errors": [],
                }
            },
        ),
        "image-vulnerabilities": (
            "reports/image-vulnerabilities.json",
            {"ArtifactName": IMAGE_REF, "Results": []},
        ),
        "image-practices": ("reports/image-practices.json", {"details": []}),
        "sbom": (
            "reports/sbom.cdx.json",
            {
                "bomFormat": "CycloneDX",
                "specVersion": "1.6",
                "components": [{"type": "library", "name": "Jinja2", "version": "3.1.6"}],
            },
        ),
        "http-functional": (
            "reports/http-functional.json",
            {"status": "passed", "revision": SOURCE_SHA, "target": "http://application:8080"},
        ),
        "dast": (
            "reports/zap/zap.json",
            {"site": [{"@name": "http://application:8080", "alerts": []}]},
        ),
    }
    for stage in ("quality", "build", "qualify"):
        for name in sorted(evidence.REQUIRED[stage]):
            path, content = outputs.get(name, (f"reports/{name}.log", "exit_code=0\n"))
            write_report(path, content)
            evidence.record(stage, name, path, 0)
        evidence.finish(stage)
    return evidence.load("evidence/candidate.json")


def run_candidate_gate(document, monkeypatch):
    # Un autre nom vérifie que le contrat est choisi par l'action, pas le suffixe.
    path = "evidence/proof-to-promote.json"
    write_report(path, document)
    monkeypatch.setattr(sys, "argv", ["evidence.py", "verify-candidate", path])
    evidence.main()


def test_complete_fresh_candidate_can_be_promoted(candidate, monkeypatch):
    run_candidate_gate(candidate, monkeypatch)


@pytest.mark.parametrize("change", ["missing", "modified"])
def test_report_must_remain_present_and_unchanged(candidate, change):
    report = Path("reports/sbom.cdx.json")
    if change == "missing":
        report.unlink()
    else:
        report.write_text(report.read_text(encoding="utf-8") + "\n", encoding="utf-8")
    with pytest.raises(ValueError):
        evidence.verify(candidate)


@pytest.mark.parametrize("variable,value", [("SOURCE_SHA", "c" * 40), ("RUN_ID", "other-run")])
def test_evidence_cannot_be_reused_for_another_commit_or_run(
    candidate, monkeypatch, variable, value
):
    monkeypatch.setenv(variable, value)
    with pytest.raises(ValueError):
        evidence.verify(candidate)


@pytest.mark.parametrize(
    "stage,control", [("quality", "unit"), ("build", "sbom"), ("qualify", "dast")]
)
def test_mandatory_control_cannot_be_omitted(candidate, stage, control):
    candidate["stages"][stage].pop(control)
    with pytest.raises(ValueError):
        evidence.verify(candidate)


def test_nonzero_tool_exit_cannot_be_relabelled_as_success(candidate):
    candidate["stages"]["build"]["image-vulnerabilities"]["exit_code"] = 10
    with pytest.raises(ValueError):
        evidence.verify(candidate)


def test_failed_control_cannot_be_accepted_even_with_zero_exit_code(candidate):
    candidate["stages"]["quality"]["unit"]["status"] = "failed"
    with pytest.raises(ValueError):
        evidence.verify(candidate)


def test_report_path_cannot_escape_the_reports_directory(candidate):
    candidate["stages"]["quality"]["unit"]["report"] = "reports/../outside.xml"
    with pytest.raises(ValueError):
        evidence.verify(candidate)


@pytest.mark.parametrize(
    "content",
    [
        f"IMAGE_REF={REPOSITORY}:latest\nIMAGE_DIGEST={IMAGE_DIGEST}\nSOURCE_SHA={SOURCE_SHA}\n",
        f"IMAGE_REF={IMAGE_REF}\nIMAGE_DIGEST=sha256:{'c' * 64}\nSOURCE_SHA={SOURCE_SHA}\n",
        f"IMAGE_REF={IMAGE_REF}\nIMAGE_DIGEST={IMAGE_DIGEST}\n",
        f"IMAGE_REF={IMAGE_REF}\nIMAGE_DIGEST={IMAGE_DIGEST}\nSOURCE_SHA={'d' * 40}\n",
        (
            f"IMAGE_REF={IMAGE_REF}\nIMAGE_REF={IMAGE_REF}\n"
            f"IMAGE_DIGEST={IMAGE_DIGEST}\nSOURCE_SHA={SOURCE_SHA}\n"
        ),
        (
            f"IMAGE_REF={IMAGE_REF}\nIMAGE_DIGEST={IMAGE_DIGEST}\n"
            f"SOURCE_SHA={SOURCE_SHA}\nEXTRA_COMMAND=touch marker\n"
        ),
        (
            f"IMAGE_REF={IMAGE_REF}$(touch marker)\nIMAGE_DIGEST={IMAGE_DIGEST}\n"
            f"SOURCE_SHA={SOURCE_SHA}\n"
        ),
    ],
    ids=[
        "mutable-tag", "digest-mismatch", "missing-key", "wrong-commit", "duplicate", "extra",
        "shell",
    ],
)
def test_image_metadata_is_parsed_as_restricted_data(candidate, content):
    write_report("evidence/image.env", content)
    with pytest.raises(ValueError):
        evidence.image_env()
    assert not Path("marker").exists()


def test_another_valid_image_cannot_replace_the_qualified_one(candidate):
    other_digest = "sha256:" + "c" * 64
    write_report(
        "evidence/image.env",
        f"IMAGE_REF={REPOSITORY}@{other_digest}\n"
        f"IMAGE_DIGEST={other_digest}\nSOURCE_SHA={SOURCE_SHA}\n",
    )
    with pytest.raises(ValueError):
        evidence.verify(candidate)


def test_image_from_an_unexpected_repository_is_rejected(candidate, monkeypatch):
    monkeypatch.setenv("IMAGE_REPOSITORY", "registry.example.test/another/project")
    with pytest.raises(ValueError):
        evidence.image_env()


def test_candidate_requires_all_qualification_stages(candidate, monkeypatch):
    candidate["stages"].pop("qualify")
    with pytest.raises(ValueError):
        run_candidate_gate(candidate, monkeypatch)


@pytest.mark.parametrize("age_hours", [73, -1], ids=["expired", "future"])
def test_candidate_must_be_fresh_and_not_dated_in_the_future(candidate, monkeypatch, age_hours):
    created = dt.datetime.now(dt.timezone.utc) - dt.timedelta(hours=age_hours)
    candidate["created_utc"] = created.isoformat()
    with pytest.raises(ValueError):
        run_candidate_gate(candidate, monkeypatch)


@pytest.mark.parametrize(
    "path",
    ["reports/coverage.xml", "reports/coverage.json", "reports/zap/visited.json"],
)
@pytest.mark.parametrize("change", ["missing", "modified"])
def test_supplemental_proofs_are_required_and_bound_to_the_candidate(
    candidate, monkeypatch, path, change
):
    report = Path(path)
    if change == "missing":
        report.unlink()
    else:
        report.write_text(report.read_text(encoding="utf-8") + "\n", encoding="utf-8")
    with pytest.raises((ValueError, FileNotFoundError)):
        run_candidate_gate(candidate, monkeypatch)


def test_lower_environment_threshold_cannot_weaken_the_coverage_policy(candidate, monkeypatch):
    monkeypatch.setenv("COV_MIN", "0")
    write_report("reports/coverage.xml", '<coverage line-rate="0.84"/>')
    with pytest.raises(ValueError):
        evidence.finish("quality")


@pytest.mark.parametrize(
    "anomaly", ["empty", "missing-dependency", "wrong-version", "skipped", "vulnerability"]
)
def test_sca_success_exit_requires_complete_clean_pinned_inventory(candidate, anomaly):
    report = evidence.load("reports/sca.json")
    dependencies = report["dependencies"]
    if anomaly == "empty":
        dependencies.clear()
    elif anomaly == "missing-dependency":
        dependencies.pop()
    elif anomaly == "wrong-version":
        dependencies[0]["version"] = "0.0.0"
    elif anomaly == "skipped":
        dependencies[0]["skip_reason"] = "Paquet non analysé pendant cet exercice"
    else:
        dependencies[0]["vulns"] = [{"id": "TEST-ONLY-001", "fix_versions": []}]
    write_report("reports/sca.json", report)
    # Même un outil qui annonce exit 0 doit fournir l'inventaire réellement attendu.
    evidence.record("quality", "sca", "reports/sca.json", 0)
    with pytest.raises(ValueError):
        evidence.finish("quality")
````

</details>

<a id="fichier-tests-test-service-py"></a>

### Fichier `tests/test_service.py`

<details>
<summary>Afficher le fichier complet</summary>

````python
"""Vrais échanges HTTP, base indépendante par test, pas de service externe."""

import json
import threading
from http.server import ThreadingHTTPServer
from urllib.error import HTTPError
from urllib.request import urlopen

import pytest

from app.service import initialize_database, make_handler


@pytest.fixture
def service(tmp_path):
    database = str(tmp_path / "test.sqlite")
    initialize_database(database)
    initialize_database(database)  # Initialisation idempotente: pas de doublon.
    server = ThreadingHTTPServer(("127.0.0.1", 0), make_handler(database, "test-revision"))
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    yield f"http://127.0.0.1:{server.server_port}"
    server.shutdown()
    server.server_close()
    thread.join(timeout=5)


def test_health_proves_revision_and_database(service):
    with urlopen(service + "/health", timeout=3) as response:
        assert response.status == 200
        assert json.load(response) == {"status": "ok", "revision": "test-revision"}


def test_catalogue_is_deterministic(service):
    with urlopen(service + "/api/items", timeout=3) as response:
        assert json.load(response) == {"items": [{"id": 1, "name": "article-demo"}]}


def test_html_and_security_headers(service):
    with urlopen(service + "/", timeout=3) as response:
        assert "test-revision" in response.read().decode()
        assert response.headers["X-Content-Type-Options"] == "nosniff"
        assert "frame-ancestors 'none'" in response.headers["Content-Security-Policy"]


def test_unknown_path_fails(service):
    with pytest.raises(HTTPError) as error:
        urlopen(service + "/unknown", timeout=3)
    assert error.value.code == 404


def test_template_escapes_untrusted_revision(tmp_path):
    handler = make_handler(str(tmp_path / "unused.sqlite"), "unused")
    assert handler.server_version == "Demo"
    from app.service import PAGE

    assert "&lt;script&gt;" in PAGE.render(revision="<script>")
````

</details>

<a id="validation-livrable"></a>

## 10. Validation du livrable

### Rapport de validation — 20 octobre 2026

Les exemples intégrés à ce document ont été rédigés et vérifiés sous Windows avec Python **3.14.0**. Les exemples d'exécution CI ciblent **Linux amd64** avec une base Python **3.13** verrouillée par digest. Cette différence est explicite : les résultats locaux démontrent le comportement du code Python sur ce poste, pas sa recette complète sur les VM cibles.

| Vérification exécutée | Résultat et preuve | Limite |
|---|---|---|
| Tests HTTP applicatifs | **5 réussis** ; santé/révision, données SQLite, rendu/en-têtes, 404, échappement | Boucle locale réelle, pas une exécution de l'image Docker |
| Tests des portes de qualification | **35 réussis** ; absent/altéré, mauvais commit/run, contrôle manquant, image invalide, candidate incomplète/périmée, couverture sous minimum et inventaire SCA faux | Rapports minimaux synthétiques dans des répertoires isolés ; pas des scans conteneurisés |
| Total pytest | **40 réussis**, zéro échec ; `validations/unit.xml` | pytest 8.4.2 et pytest-cov 6.3.0 |
| Couverture applicative | **100 % des 46 instructions retenues** ; `validations/coverage.xml` et `.json` | 23 lignes exclues, dont lancement/signal `main()` ; les scripts d'exploitation ne sont pas couverts par cette mesure |
| Lint Python | Ruff 0.13.3, réussi sur `app tests ci` | Règles E/F/I du projet |
| Lint YAML | yamllint 1.37.1, réussi sur pipelines/templates/config/exemples | Une syntaxe YAML valide ne prouve pas un schéma GitLab/Azure valide |
| SAST | Bandit **1.9.4**, `errors: []`, `results: []`, 74 lignes analysées ; `validations/sast.json` | Deux suppressions B104/B108 ciblées, motivées dans le code ; ne remplace pas une revue de sécurité |
| SCA applicatif | pip-audit 2.9.0 : Jinja2 3.1.6 et MarkupSafe 3.0.3 réellement présents, zéro avis connu détecté ; `validations/sca.json` | Bases d'avis à la date du scan ; fermeture runtime de deux paquets, pas toutes les transitives de l'outillage |
| Syntaxe Bash | `bash -n` réussi sur tous les `ci/*.sh` et `ops/*.sh` | Bash Git Windows, sans exécution des commandes Docker/SSH/APT |
| Historique Git | Cas worktree détaché copié dans miroir autonome avec commit présent | Vérification du transfert Git, scanner Gitleaks non exécuté |
| Cohérence du document et de ses exemples | UTF-8, YAML strict sans doublons, liens locaux/ancres/fences, équivalence des variantes monolithiques et templates | Validateur borné aux formes livrées ; détails dans `validations/bundle-check.json` |

Les résultats résumés ici sont identifiés comme **validations du livrable**. Ils ne sont pas placés dans `reports/` ni `evidence/`, et ne peuvent pas servir à promouvoir une image dans vos pipelines. Les essais d'échec initiaux liés au bac à sable local ont été corrigés ou réexécutés dans le contexte adéquat ; le tableau ci-dessus correspond aux résultats finaux.

#### Corrections issues de la vérification

Les rapports JSON Hadolint/Checkov sont capturés depuis leur vraie sortie, les codes d'erreur sont conservés et un ancien rapport ne peut pas être réutilisé silencieusement. La porte exige un SAST effectivement analysé, les règles IaC prévues, une SBOM non vide et toutes les dépendances SCA attendues. L'inventaire SCA vide initialement obtenu avec la résolution pip a conduit à auditer la fermeture complète et à ajouter cinq tests de refus dédiés.

La chaîne lie l'ID local analysé au digest du push puis vérifie l'ID après pull de ce digest, sans résoudre de nouveau le tag mutable. La couverture et les URLs de la session ZAP entrent dans les empreintes. Les conteneurs outils sont étiquetés pour le nettoyage. La procédure préproduction installe ses traitements de rétablissement avant la première mutation et les déclenche aussi sur les interruptions usuelles ; cette logique doit encore être éprouvée contre de vrais incidents Docker/SSH.

#### Vérifié dans les documentations officielles

Le chapitre 8 distingue les sources ITIL 5, les rappels d’ITIL 4 et CALMS et le portfolio lus le 22 octobre des vérifications d’outillage du 20 octobre : enregistrement Runner, exécuteurs, variables et droits, agent Azure 5.280.0, approbations hors YAML, compatibilité OS, commandes et formats. Une lecture documentaire ne prouve pas qu’une image OCI ou une plateforme a été exécutée.

#### Non exécuté et à recetter sur les cibles

Aucun moteur Docker n'est disponible sur le poste de rédaction. Aucune VM Linux, instance GitLab, organisation Azure, identité registre ni cible SSH n'a été fournie. Ne sont donc pas validés par une exécution réelle : installation APT et services, enregistrement Runner/Agent, compilation distante des YAML, pull des outils et génération du verrou, build/push de l'image, Hadolint/Gitleaks/Checkov/Trivy/Dockle conteneurisés, DAST ZAP, Docker Bench, approbations effectives, déploiement SSH, concurrence distante et retour arrière sur VM.

La recette du chapitre 7 doit démontrer le cas sain, les refus et le nettoyage après succès, échec et annulation. Créer le verrou `ci/images.lock.env` depuis les registres, puis le revoir et le versionner. Le portfolio ITIL 4/CALMS a été lu le 22 octobre et intégré au guide ; seules les deux anciennes pièces Markdown non fournies restent hors de l’analyse.

#### Reproduire les vérifications

Sous Linux, dans un venv activé ayant reçu `requirements-dev.txt` :

```bash
mkdir -p validations
python -m pytest --junitxml=validations/unit.xml --cov=app \
  --cov-report=xml:validations/coverage.xml --cov-report=json:validations/coverage.json \
  --cov-report=term --cov-fail-under=85
python -m ruff check app tests ci
python -m yamllint -c .yamllint.yml .gitlab-ci.yml azure-pipelines.yml ci config exemples
python -m bandit -r app -f json -o validations/sast.json
python -m pip_audit -r requirements.txt --no-deps --disable-pip --strict \
  --format json --output validations/sca.json --progress-spinner off
for script in ci/*.sh ops/*.sh; do bash -n "$script" || exit; done
```

Les tests HTTP ont besoin d'une socket loopback autorisée. Si les répertoires temporaires système sont restreints, fournir un `--basetemp` neuf sous le workspace. Exécuter chaque commande en conservant son code de retour ; les contrôles en parallèle ne doivent pas masquer l'échec d'une commande antérieure.

### Correspondance avec le cahier des charges

| Exigence / compétence | Où apprendre et réutiliser | Vérification cible à obtenir |
|---|---|---|
| Préparer VM Debian/Ubuntu | Chapitre 3 ; procédures officielles Docker | Versions, DNS/TLS, compte dédié et premier conteneur |
| Installer/enregistrer Runner | Chapitre 4, config.toml commenté | Runner en ligne, premier job, journaux et désenregistrement |
| Installer/enregistrer agent Azure | Chapitre 5, agent 5.280.0 avec SHA256 | Agent en ligne, capacité DockerTrusted, service et suppression |
| Concevoir et comprendre pipeline | Chapitres 1, 4 et 5 ; exemples débutants | Déclencheurs, DAG, scopes secrets et artefacts expliqués par le lecteur |
| Configurer permissions des projets | Chapitres 4/5 et 6 | Branche/pool/registre/environnement protégés ; tentative non autorisée refusée |
| Exécuter chaque pipeline complet | YAML racine + ci/run.sh + app/tests | Quality → Build → Qualify → Preproduction ; même image par digest |
| Retrouver et interpréter rapports | Chapitre 6 et annexe code | Rapports UI et fichiers, erreurs d'outil distinctes des findings |
| Bloquer une erreur volontaire | Exercices corrigés chapitre 7 ; tests/test_evidence.py | Test KO, secret factice, rapport supprimé/altéré, candidate périmée : porte rouge |
| Déployer environnement test | ci/run.sh qualify ; config/test.compose.yml manuel | Base synthétique, nom unique, réseau privé, timeout et suppression |
| Effectuer tests/DAST réels | tests/http_probe.py ; ci/zap_hooks.py | Révision, HTTP, UID et trois URLs visitées par la session ZAP |
| Qualifier puis promouvoir candidate | Chapitres 2 et 6 ; evidence.py | Approbation et verrou extérieurs au YAML ; preuves du même run |
| Vérifier et revenir en arrière | ops/preproduction.sh ; ci/run.sh rollback | Reçu et état observé ; test échec contrôlé et restauration vérifiée |
| Adapter les templates | ci/gitlab et ci/azure ; tableau paramètres | Autre dépôt/langage, outils et rapports adaptés sans contrôle silencieusement désactivé |
| Administrer/sécuriser/optimiser | Chapitre 7 ; ops/cleanup-stale.sh, docker-bench.sh | Rotation, maintenance, disque, files d'attente et mesures d'amélioration |
| ITIL 5, apports d’ITIL 4 et CALMS | Chapitre 2 et exemples décision/preuve | Responsables, risque, changement standard/normal/urgence, mesure et partage |
| Sources et analyse critique | Chapitre 8 | Sources officielles, versions, documents absents et limites consignés |

Cette matrice décrit des critères de recette. Elle ne transforme pas une vérification documentaire ou un test simulé local en une exécution réussie sur GitLab, Azure ou une VM distante. Le bilan de validation ci-dessus précise les preuves disponibles.

<!-- <a id="integration-starlight"></a>

## Intégrer ce fichier dans Astro Starlight

Placer ce `.md` à la place de la page existante dans `src/content/docs/`, en gardant son chemin pour conserver son URL. Le fichier d’origine n’avait pas de front matter : cette version ajoute le titre requis, une description et un sommaire limité aux grands chapitres. Si votre VM ajoute déjà des métadonnées de page — par exemple `slug` ou `sidebar` — conserver ces valeurs en les fusionnant avec ce front matter.

Les six anciens Mermaid sont remplacés par des tableaux de flux et des étapes numérotées. Ils s’affichent en Markdown standard et restent lisibles en thème clair ou sombre avec les couleurs du site. Les longues références et les fichiers complets utilisent les éléments HTML natifs `details` et `summary`, reconnus dans les pages `.md` Starlight. Les liens du sommaire et les anciens liens de titres sont conservés par des ancres internes.

Après transfert sur la VM, lancer la commande de construction habituelle du projet. Ouvrir la page à environ **360 px** puis sur un écran de bureau ; vérifier navigation, tableaux, ouverture des blocs de code, thème clair et thème sombre. La configuration et le thème de votre projet distant déterminent son rendu final.

Sources officielles consultées pour cette intégration le **22 octobre 2026** : [contenu Markdown, images, titres et blocs dépliables](https://starlight.astro.build/guides/authoring-content/) et [front matter et sommaire](https://starlight.astro.build/reference/frontmatter/).

### Principales améliorations de cette révision

- ITIL 5 reste le cadre du document ; le portfolio ITIL 4/CALMS est désormais lu et utilisé pour enrichir les explications : quatre dimensions, sept principes et exemple complet du catalogue.
- Les principes sont reliés aux jobs, aux décisions et aux preuves ; les chiffres illustratifs du portfolio ne deviennent pas des exigences du laboratoire.
- Six représentations natives remplacent les diagrammes qui demandaient un moteur Mermaid.
- Les explications annoncent leur utilité, puis rapprochent la manipulation de son résultat attendu.
- Les parcours découverte, pratique et administration restent distincts ; le chapitre Azure adopte la numérotation 5.x.
- Les douze fiches de dépannage suivent le même ordre : symptôme, vérifications, interprétation, correction et contrôle final.
- Les 43 fichiers de code restent complets dans l’annexe ; les blocs dépliables évitent de les parcourir pour trouver une procédure.
- Les matrices de référence restent accessibles près de leur sujet ; les commandes, seuils et protections sont conservés.

### Vérifications de cette révision documentaire

Les contrôles locaux portent sur l’UTF-8, le front matter, les ancres et liens internes, les tableaux, les listes et les blocs dépliables. Les exemples exécutables sont comparés à la version précédente pour vérifier leur intégrité. Le document ne contient aucun lien vers un fichier d’image ou une pièce jointe nécessaire à sa lecture.

Résultat local : **93 blocs de code inchangés**, **43 fichiers complets intégrés**, **toutes les ancres antérieures préservées**, aucun identifiant HTML dupliqué et aucun lien interne manquant. Un lecteur Markdown a reconnu les tableaux, listes et blocs dépliables dans le HTML généré ; ce contrôle ne reproduit pas le thème de votre site.

Le projet Starlight se trouve dans votre VM distante : sa construction et son affichage réel n’ont pas été vérifiés ici. Les **40 tests** et analyses décrits dans le bilan technique datent du **20 octobre 2026** ; ils n’ont pas été relancés pour cette révision pédagogique et documentaire. Le déploiement et les scans sur vos cibles restent soumis à leur propre recette. -->
