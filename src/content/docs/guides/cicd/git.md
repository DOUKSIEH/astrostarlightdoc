---
title: "📚 Documentation Complète Git & Git Flow"
description: "📘 Documentation Ansible — Du débutant à la maîtrise"
created: "2026-04-28"
# updated: "2026-04-28"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"

---

<!-- # 📚 Documentation Complète Git & Git Flow -->

> Guide pédagogique : du débutant à l'avancé, avec cas pratiques et bonnes pratiques pour le travail en équipe (GitHub / GitLab / Azure DevOps)

---

## 📑 Table des matières

1. [Introduction : qu'est-ce que Git ?](#1-introduction--quest-ce-que-git-)
2. [Concepts fondamentaux](#2-concepts-fondamentaux)
3. [Installation et configuration](#3-installation-et-configuration)
4. [Commandes de base](#4-commandes-de-base-niveau-débutant)
5. [Travailler avec les branches](#5-travailler-avec-les-branches)
6. [Travailler avec un dépôt distant](#6-travailler-avec-un-dépôt-distant-remote)
7. [Commandes intermédiaires](#7-commandes-intermédiaires)
8. [Commandes avancées](#8-commandes-avancées)
9. [Git Flow : modèles de branching](#9-git-flow--modèles-de-branching)
10. [Workflow en équipe (GitHub / GitLab / Azure DevOps)](#10-workflow-en-équipe)
11. [Résolution de conflits](#11-résolution-de-conflits)
12. [Récupération et sauvetage](#12-récupération-et-sauvetage)
13. [Bonnes pratiques](#13-bonnes-pratiques)
14. [Cas pratiques complets](#14-cas-pratiques-complets)
15. [Antisèche (Cheat Sheet)](#15-antisèche-cheat-sheet)
16. [Glossaire](#16-glossaire)

---

## 1. Introduction : qu'est-ce que Git ?

**Git** est un **système de contrôle de version distribué** (DVCS) créé par Linus Torvalds en 2005 (le créateur de Linux). Il permet de :

- 📝 Suivre l'historique des modifications d'un projet (qui a changé quoi, quand, pourquoi)
- 👥 Collaborer à plusieurs sur un même code source sans s'écraser mutuellement
- 🔀 Gérer plusieurs versions parallèles d'un projet (branches)
- 🔙 Revenir à une version antérieure en cas d'erreur
- 🛡️ Sauvegarder le code de manière distribuée

### Différence Git vs GitHub/GitLab/Azure DevOps

| Concept | Description |
|---------|-------------|
| **Git** | L'outil en ligne de commande installé sur votre machine |
| **GitHub** | Plateforme web hébergeant des dépôts Git (rachetée par Microsoft) |
| **GitLab** | Plateforme web concurrente, souvent auto-hébergeable |
| **Azure DevOps** | Suite Microsoft incluant Azure Repos (équivalent GitHub) |
| **Bitbucket** | Plateforme d'Atlassian, intégrée à Jira |

> 💡 **Analogie** : Git est comme Microsoft Word, GitHub/GitLab sont comme OneDrive/Google Drive — ils stockent vos documents en ligne et permettent le partage.

---

## 2. Concepts fondamentaux

### Les 3 zones de Git

Comprendre ces trois zones est **essentiel** pour maîtriser Git :

```
┌────────────────┐    git add     ┌────────────────┐    git commit    ┌────────────────┐
│                │  ───────────►  │                │  ─────────────►  │                │
│  Working Dir   │                │  Staging Area  │                  │   Repository   │
│  (vos fichiers)│  ◄───────────  │    (Index)     │  ◄─────────────  │   (.git/)      │
│                │   git restore  │                │   git reset      │                │
└────────────────┘                └────────────────┘                  └────────────────┘
```

1. **Working Directory** (répertoire de travail) : vos fichiers tels que vous les voyez/éditez
2. **Staging Area** (zone d'index / "préparée") : les modifications sélectionnées pour le prochain commit
3. **Repository** (.git/) : l'historique permanent des commits

### Le commit : la brique de base

Un **commit** est un **instantané (snapshot)** de votre projet à un moment donné. Chaque commit a :
- Un identifiant unique (hash SHA-1, ex: `a3f5b2c...`)
- Un auteur et une date
- Un message descriptif
- Un (ou plusieurs) parent(s)

### La branche

Une **branche** est simplement un **pointeur mobile vers un commit**. Cela permet de développer plusieurs fonctionnalités en parallèle sans interférence.

```
        A───B───C  ← main
             \
              D───E  ← feature/login
```

### HEAD

`HEAD` est un pointeur spécial qui indique **où vous êtes actuellement** dans l'historique (généralement sur le dernier commit de la branche courante).

---

## 3. Installation et configuration

### Installation

**Linux (Debian/Ubuntu) :**
```bash
sudo apt update && sudo apt install git
```

**macOS :**
```bash
brew install git
# ou via Xcode Command Line Tools
xcode-select --install
```

**Windows :**
Télécharger depuis [git-scm.com](https://git-scm.com)

**Vérifier l'installation :**
```bash
git --version
```

### Configuration initiale (à faire UNE FOIS)

```bash
# Identité (apparaîtra dans chaque commit)
git config --global user.name "Jean Dupont"
git config --global user.email "jean.dupont@exemple.com"

# Éditeur par défaut (pour les messages de commit)
git config --global core.editor "code --wait"  # VS Code
# ou "nano", "vim", etc.

# Branche par défaut nommée "main" (au lieu de "master")
git config --global init.defaultBranch main

# Affichage en couleur
git config --global color.ui auto

# Comportement du pull (rebase recommandé pour un historique propre)
git config --global pull.rebase false  # merge (défaut)
# ou true pour rebase

# Fin de ligne (important en équipe multi-OS)
# Sur Windows :
git config --global core.autocrlf true
# Sur macOS/Linux :
git config --global core.autocrlf input
```

**Voir toute la configuration :**
```bash
git config --list
git config --global --list
```

### Authentification (HTTPS vs SSH)

**SSH (recommandé pour un usage régulier) :**
```bash
# Générer une clé SSH
ssh-keygen -t ed25519 -C "votre.email@exemple.com"

# Afficher la clé publique à copier sur GitHub/GitLab/Azure DevOps
cat ~/.ssh/id_ed25519.pub
```

Puis ajouter cette clé dans **Settings → SSH Keys** de votre plateforme.

---

## 4. Commandes de base (niveau débutant)

### Initialiser un dépôt

```bash
# Créer un nouveau dépôt local
git init

# Cloner un dépôt existant depuis un serveur distant
git clone https://github.com/utilisateur/projet.git
git clone git@github.com:utilisateur/projet.git  # via SSH
git clone https://github.com/user/projet.git mon-dossier  # dans un dossier spécifique
```

### Vérifier l'état du dépôt

```bash
# Voir l'état des fichiers (modifié, staged, non suivi...)
git status

# Version compacte
git status -s
```

**Codes de statut** :
- `??` : fichier non suivi (untracked)
- `M` : modifié (modified)
- `A` : ajouté (added/staged)
- `D` : supprimé (deleted)
- `R` : renommé (renamed)

### Ajouter des fichiers (staging)

```bash
# Ajouter un fichier spécifique
git add fichier.txt

# Ajouter plusieurs fichiers
git add fichier1.txt fichier2.txt

# Ajouter tous les fichiers modifiés du dossier courant
git add .

# Ajouter tous les fichiers modifiés du projet entier
git add -A
git add --all

# Mode interactif (choisir hunk par hunk)
git add -p  # ou --patch
```

> 💡 **Astuce** : `git add -p` est excellent pour ne committer que des morceaux ciblés d'un fichier modifié.

### Créer un commit

```bash
# Commit avec ouverture de l'éditeur
git commit

# Commit avec message en ligne
git commit -m "Ajouter la page de connexion"

# Commit avec message détaillé (titre + description)
git commit -m "Ajouter la page de connexion" -m "Implémente le formulaire avec validation côté client et appel API."

# Ajouter ET committer les fichiers déjà suivis (raccourci)
git commit -am "Corriger le bug d'affichage du header"

# Modifier le dernier commit (message ou contenu)
git commit --amend
git commit --amend --no-edit  # garder le même message
```

### Voir l'historique

```bash
# Historique complet
git log

# Format compact (une ligne par commit)
git log --oneline

# Avec graphique des branches
git log --oneline --graph --all --decorate

# Voir les modifications de chaque commit
git log -p

# Limiter le nombre de commits
git log -5  # les 5 derniers

# Filtrer par auteur
git log --author="Jean"

# Filtrer par message
git log --grep="bug"

# Filtrer par date
git log --since="2 weeks ago" --until="yesterday"

# Voir les commits affectant un fichier
git log -- chemin/vers/fichier.js
```

> 💡 **Alias utile** à ajouter dans `.gitconfig` :
> ```bash
> git config --global alias.lg "log --oneline --graph --all --decorate"
> ```
> Puis : `git lg`

### Voir les différences

```bash
# Différences non staged (working dir vs staging)
git diff

# Différences staged (staging vs dernier commit)
git diff --staged
git diff --cached  # synonyme

# Différences entre deux commits
git diff abc1234 def5678

# Différences entre branches
git diff main..feature/login

# Différences sur un fichier précis
git diff -- fichier.txt
```

### Le fichier .gitignore

Pour exclure des fichiers du suivi Git, créez un fichier `.gitignore` à la racine :

```gitignore
# Commentaire
node_modules/
*.log
.env
.env.local
dist/
build/
.DS_Store
*.swp

# Ignorer tout sauf...
*.txt
!important.txt

# Ignorer dans tout sous-dossier
**/temp/
```

> 💡 [gitignore.io](https://www.toptal.com/developers/gitignore) génère des `.gitignore` adaptés à votre stack (Node, Python, Java, etc.).

---

## 5. Travailler avec les branches

Les branches sont le **cœur de la puissance de Git**. Elles permettent à plusieurs personnes (ou à vous-même sur plusieurs sujets) de travailler en parallèle.

### Lister, créer, basculer

```bash
# Lister les branches locales
git branch

# Lister TOUTES les branches (locales + distantes)
git branch -a

# Lister avec dernier commit
git branch -v

# Créer une nouvelle branche (sans s'y déplacer)
git branch feature/login

# Créer ET basculer dessus (méthode classique)
git checkout -b feature/login

# Créer ET basculer (méthode moderne, recommandée)
git switch -c feature/login

# Basculer sur une branche existante
git switch main
git checkout main  # ancienne syntaxe

# Renommer la branche courante
git branch -m nouveau-nom

# Supprimer une branche (déjà fusionnée)
git branch -d feature/login

# Forcer la suppression (même non fusionnée — DANGER)
git branch -D feature/login
```

> 💡 `git switch` et `git restore` (introduits en Git 2.23) clarifient les rôles de l'ancien `git checkout` qui faisait trop de choses à la fois.

### Fusionner des branches (merge)

```bash
# Se placer sur la branche de DESTINATION
git switch main

# Fusionner une branche dans la branche courante
git merge feature/login
```

**Types de merge :**

1. **Fast-forward** : si `main` n'a pas avancé depuis la création de la branche, Git "avance" simplement le pointeur.
   ```
   Avant :  A───B  ← main
                \
                 C───D  ← feature
   
   Après :  A───B───C───D  ← main, feature
   ```

2. **Three-way merge** : si les deux branches ont divergé, Git crée un **commit de fusion**.
   ```
   Avant :  A───B───E  ← main
                \
                 C───D  ← feature
   
   Après :  A───B───E───M  ← main
                \     /
                 C───D  ← feature
   ```

```bash
# Forcer la création d'un commit de merge même en fast-forward
git merge --no-ff feature/login

# Annuler un merge en cours (en cas de conflit)
git merge --abort
```

### Le rebase (alternative au merge)

Le **rebase** "rejoue" vos commits par-dessus une autre branche. Résultat : un historique **linéaire**.

```bash
# Sur la branche feature
git switch feature/login
git rebase main
```

```
Avant :  A───B───E  ← main
              \
               C───D  ← feature

Après :  A───B───E───C'───D'  ← feature
                  ↑
                  main
```

> ⚠️ **Règle d'or du rebase** : **NE JAMAIS rebaser des commits déjà poussés et partagés** sur le serveur. Cela réécrit l'historique et casse le travail des autres.

**Rebase interactif** (très puissant pour nettoyer ses commits avant de les pousser) :
```bash
git rebase -i HEAD~5  # rejoue les 5 derniers commits
```

Vous pouvez alors :
- `pick` : garder le commit
- `reword` : modifier le message
- `edit` : modifier le contenu
- `squash` : fusionner avec le précédent (garde les messages)
- `fixup` : fusionner avec le précédent (jette le message)
- `drop` : supprimer le commit
- réordonner les lignes

---

## 6. Travailler avec un dépôt distant (remote)

### Gérer les remotes

```bash
# Voir les remotes configurés
git remote -v

# Ajouter un remote
git remote add origin git@github.com:user/projet.git

# Renommer un remote
git remote rename origin upstream

# Supprimer un remote
git remote remove origin

# Changer l'URL
git remote set-url origin https://nouveau-url.git
```

> 💡 Par convention, `origin` désigne votre fork/votre remote principal, et `upstream` le dépôt original (utile pour les contributions open source).

### Récupérer les changements

```bash
# Télécharger SANS fusionner (juste mettre à jour les refs)
git fetch
git fetch origin
git fetch --all  # tous les remotes

# Télécharger ET fusionner dans la branche courante
git pull
git pull origin main

# Pull avec rebase au lieu de merge (historique plus propre)
git pull --rebase
```

> 💡 **Bonne pratique** : `git fetch` puis `git log origin/main..main` pour voir ce qui va être intégré, AVANT de merger ou rebaser.

### Pousser les changements

```bash
# Pousser la branche courante vers son remote tracking
git push

# Première poussée d'une nouvelle branche (établit le tracking)
git push -u origin feature/login
git push --set-upstream origin feature/login

# Pousser toutes les branches
git push --all

# Pousser les tags
git push --tags

# Forcer la poussée (DANGEREUX — réécrit l'historique distant)
git push --force
git push --force-with-lease  # version plus sûre, recommandée
```

> ⚠️ **`--force` peut effacer le travail des autres**. Utilisez **toujours** `--force-with-lease`, qui refuse si quelqu'un a poussé entre-temps.

### Supprimer une branche distante

```bash
git push origin --delete feature/login
# ou
git push origin :feature/login
```

---

## 7. Commandes intermédiaires

### Stash : mettre de côté temporairement

Quand vous devez **changer de branche** mais avez du travail en cours non committé :

```bash
# Sauvegarder le travail en cours
git stash
git stash push -m "WIP: refonte du header"

# Lister les stashes
git stash list

# Récupérer le dernier stash (et le supprimer de la pile)
git stash pop

# Récupérer sans supprimer
git stash apply
git stash apply stash@{2}

# Voir le contenu d'un stash
git stash show -p stash@{0}

# Supprimer un stash
git stash drop stash@{0}

# Tout supprimer
git stash clear

# Inclure les fichiers non suivis
git stash -u
```

### Tags : marquer des versions

```bash
# Tag léger (juste un pointeur)
git tag v1.0.0

# Tag annoté (avec message, recommandé pour les releases)
git tag -a v1.0.0 -m "Version 1.0.0 — première release stable"

# Tag sur un commit précis
git tag -a v0.9.0 abc1234 -m "Beta"

# Lister les tags
git tag
git tag -l "v1.*"

# Voir les détails d'un tag
git show v1.0.0

# Pousser un tag
git push origin v1.0.0
git push --tags  # tous les tags

# Supprimer un tag
git tag -d v1.0.0  # local
git push origin --delete v1.0.0  # distant
```

### Annuler des modifications

```bash
# Annuler les modifs non staged d'un fichier (revenir au dernier commit)
git restore fichier.txt
git checkout -- fichier.txt  # ancienne syntaxe

# Annuler tout
git restore .

# Sortir un fichier du staging (le dé-stager) sans perdre les modifs
git restore --staged fichier.txt
git reset HEAD fichier.txt  # ancienne syntaxe
```

### Reset : annuler des commits

```bash
# Annule le commit, GARDE les modifs en staging
git reset --soft HEAD~1

# Annule le commit, GARDE les modifs en working dir (défaut)
git reset --mixed HEAD~1
git reset HEAD~1

# Annule le commit, JETTE les modifs (DANGEREUX)
git reset --hard HEAD~1

# Reset à un commit précis
git reset --hard abc1234
```

| Mode | Working Dir | Staging | Commits |
|------|-------------|---------|---------|
| `--soft` | Conservé | Conservé | Annulé |
| `--mixed` (défaut) | Conservé | Vidé | Annulé |
| `--hard` | Écrasé | Écrasé | Annulé |

### Revert : annuler proprement (sans réécrire l'historique)

```bash
# Crée un NOUVEAU commit qui inverse les changements d'un commit précédent
git revert abc1234
```

> 💡 **`reset` vs `revert`** :
> - `reset` réécrit l'historique → **uniquement en local** sur des commits non poussés
> - `revert` ajoute un commit inverse → **sûr en équipe**, peut être poussé

### Cherry-pick : prendre un commit ailleurs

```bash
# Appliquer un commit précis sur la branche courante
git cherry-pick abc1234

# Plusieurs commits
git cherry-pick abc1234 def5678

# Une plage
git cherry-pick abc1234..def5678

# Sans créer de commit (juste mettre les modifs en staging)
git cherry-pick -n abc1234
```

**Cas d'usage typique** : un hotfix critique a été fait sur `main`, vous voulez le reporter sur une branche `release/2.0`.

---

## 8. Commandes avancées

### Reflog : le filet de sécurité

`git reflog` enregistre **tous les déplacements de HEAD** localement (même après un `reset --hard`). Permet de récupérer du travail "perdu".

```bash
git reflog
# Exemple de sortie :
# abc1234 HEAD@{0}: reset: moving to HEAD~3
# def5678 HEAD@{1}: commit: ajouter feature X
# ...

# Récupérer un état perdu
git reset --hard HEAD@{1}
```

> 💡 Le reflog est conservé ~90 jours par défaut. C'est votre **dernière chance** de récupérer un travail.

### Bisect : trouver le commit qui a introduit un bug

```bash
# Démarrer une recherche dichotomique
git bisect start
git bisect bad                # le commit actuel est cassé
git bisect good v1.0.0        # cette version fonctionnait

# Git checkout un commit au milieu — vous testez puis :
git bisect good   # ou : git bisect bad

# ... répéter jusqu'à ce que Git identifie le commit fautif

git bisect reset  # revenir à la normale
```

### Worktree : plusieurs branches en parallèle

Permet d'avoir plusieurs branches checkoutées simultanément dans des dossiers différents.

```bash
# Ajouter un worktree
git worktree add ../projet-hotfix hotfix/urgent

# Lister
git worktree list

# Supprimer
git worktree remove ../projet-hotfix
```

### Submodules : inclure un autre dépôt

```bash
# Ajouter un submodule
git submodule add https://github.com/user/lib.git libs/lib

# Cloner un projet avec ses submodules
git clone --recurse-submodules https://github.com/user/projet.git

# Mettre à jour les submodules
git submodule update --init --recursive

# Pull avec submodules
git pull --recurse-submodules
```

### Hooks : automatisation locale

Les hooks sont des scripts dans `.git/hooks/` exécutés à certains moments. Exemples :
- `pre-commit` : avant chaque commit (lint, tests…)
- `commit-msg` : valider le format du message
- `pre-push` : avant un push

```bash
# Exemple de pre-commit qui lance ESLint
#!/bin/sh
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Lint a échoué, commit annulé."
  exit 1
fi
```

> 💡 **Husky** (Node.js) est l'outil standard pour gérer les hooks dans un projet partagé.

### Blame : qui a écrit cette ligne ?

```bash
git blame fichier.js
git blame -L 10,20 fichier.js  # lignes 10 à 20
```

### Reset incrémental (annuler partiellement)

```bash
# Mode interactif pour dé-stager des morceaux
git reset -p
git restore -p
```

---

## 9. Git Flow : modèles de branching

Un **workflow** (ou modèle de branching) est une convention de l'équipe sur **comment utiliser les branches**. Il y en a plusieurs.

### 9.1 Git Flow classique (Vincent Driessen, 2010)

Modèle riche, adapté aux projets avec **versions planifiées** (logiciels packagés, applis mobiles).

**Branches permanentes :**
- `main` (ou `master`) : le code en **production**
- `develop` : la branche d'**intégration** des fonctionnalités

**Branches temporaires :**
- `feature/*` : nouvelles fonctionnalités (créées depuis `develop`, fusionnées dans `develop`)
- `release/*` : préparation d'une version (créée depuis `develop`, fusionnée dans `main` + `develop`)
- `hotfix/*` : correctifs urgents en prod (créée depuis `main`, fusionnée dans `main` + `develop`)

```
main      ────●─────────────●─────●────●  (tags : v1.0, v1.1, v1.1.1)
               \           /     /    /
release         \    ●────●     /    /
                 \  /          /    /
develop  ────●───●●──●───●───●────●
              \ / \   \ /
feature        ●   ●   ●
```

**Commandes (avec l'extension git-flow) :**
```bash
# Initialiser
git flow init

# Démarrer une feature
git flow feature start ma-feature
# ... travailler ...
git flow feature finish ma-feature  # merge dans develop et supprime la branche

# Release
git flow release start 1.2.0
git flow release finish 1.2.0  # merge dans main + develop, crée le tag

# Hotfix
git flow hotfix start 1.2.1
git flow hotfix finish 1.2.1
```

✅ **Avantages** : structure claire, séparation prod/dev nette
❌ **Inconvénients** : lourd, peu adapté au déploiement continu

### 9.2 GitHub Flow (simple, déploiement continu)

**Une seule branche permanente : `main`** (toujours déployable).

1. Créer une branche depuis `main` (`feature/...`, `fix/...`)
2. Faire ses commits
3. Ouvrir une **Pull Request**
4. Review + CI
5. Merge dans `main` → déploiement automatique
6. Supprimer la branche

```
main  ────●─────●─────●─────●  (déployé en continu)
           \         /     /
            ●───●───●     /
                        /
            ●─────●────●
```

✅ **Avantages** : simple, rapide, parfait pour le SaaS et le CI/CD
❌ **Inconvénients** : peu adapté aux releases versionnées

### 9.3 GitLab Flow

Compromis entre les deux. Ajoute des **branches d'environnement** :
- `main` (développement)
- `pre-production` ou `staging`
- `production`

Le code remonte de `main` → `staging` → `production` via des merges.

### 9.4 Trunk-Based Development

Variante extrême du GitHub Flow : tout le monde commite sur `main` (avec branches très courtes < 1 jour). Nécessite **feature flags** et une **CI très robuste**. Utilisé par Google, Facebook…

### Quel modèle choisir ?

| Contexte | Modèle recommandé |
|----------|-------------------|
| SaaS web, déploiement continu | **GitHub Flow** |
| Application avec versions (mobile, desktop) | **Git Flow** |
| Plusieurs environnements (staging, prod) | **GitLab Flow** |
| Équipe expérimentée, CI mature | **Trunk-Based** |

---

## 10. Workflow en équipe

### 10.1 Le cycle classique d'une fonctionnalité

```bash
# 1. Se mettre à jour
git switch main
git pull

# 2. Créer une branche descriptive
git switch -c feature/JIRA-123-ajout-paiement-stripe

# 3. Travailler, faire des commits atomiques
git add .
git commit -m "feat(payment): intégrer le SDK Stripe"
git commit -m "feat(payment): ajouter le formulaire de paiement"
git commit -m "test(payment): ajouter tests unitaires du checkout"

# 4. Se synchroniser régulièrement avec main (éviter le big-bang merge)
git fetch origin
git rebase origin/main
# ou : git merge origin/main

# 5. Pousser
git push -u origin feature/JIRA-123-ajout-paiement-stripe

# 6. Ouvrir une Pull Request / Merge Request sur la plateforme
# 7. Demander une review, corriger, repousser
# 8. Une fois mergée : nettoyer
git switch main
git pull
git branch -d feature/JIRA-123-ajout-paiement-stripe
```

### 10.2 Pull Request / Merge Request

| Plateforme | Terme |
|------------|-------|
| GitHub | **Pull Request (PR)** |
| GitLab | **Merge Request (MR)** |
| Azure DevOps | **Pull Request (PR)** |
| Bitbucket | **Pull Request (PR)** |

Une PR/MR est une **demande d'intégration** qui :
- Affiche les diffs
- Permet la **revue de code** (commentaires ligne par ligne)
- Lance la **CI/CD** (tests, lint, build)
- Trace les discussions et décisions

**Bonne PR** :
- Petite (< 400 lignes idéalement)
- Une seule responsabilité
- Description claire (contexte, choix techniques, captures d'écran si UI)
- Lien vers le ticket Jira/Issue
- Tests inclus
- Auto-review avant de demander celle des autres

### 10.3 Stratégies de merge en PR

Sur GitHub/GitLab, trois options de fusion :

1. **Merge commit** : crée un commit de merge → garde l'historique fidèle (toutes les branches visibles)
2. **Squash and merge** : combine tous les commits de la branche en UN seul commit → historique propre sur `main`
3. **Rebase and merge** : applique les commits un par un sur `main` → historique linéaire

> 💡 **Recommandation équipe** : **Squash & merge** pour la plupart des features (1 PR = 1 commit dans `main`). Cela rend `git log` lisible et facilite les `revert`.

### 10.4 Spécificités par plateforme

**GitHub :**
- Issues, Projects, Actions (CI/CD)
- `CODEOWNERS` pour exiger une review d'experts d'un fichier
- Branch protection rules (interdire les push directs sur `main`, exiger N approbations)

**GitLab :**
- CI/CD intégré natif (`.gitlab-ci.yml`)
- Approval rules, Push rules
- Issues, Epics, Iterations

**Azure DevOps :**
- Boards (kanban), Pipelines (CI/CD)
- Policies sur les branches (build validation, reviewers obligatoires)
- Intégration native avec Microsoft 365

**Configurations communes recommandées sur `main` :**
- ❌ Interdire le push direct
- ✅ Exiger une PR
- ✅ Exiger 1 ou 2 approbations
- ✅ Exiger que la CI passe
- ✅ Exiger que la branche soit à jour avant merge

### 10.5 Convention de nommage des branches

Format recommandé : `<type>/<ticket>-<description-courte>`

```
feature/JIRA-123-ajout-paiement
fix/JIRA-456-bug-affichage-mobile
hotfix/JIRA-789-fuite-memoire
chore/maj-dependances
docs/ajout-readme
refactor/extraction-service-auth
```

### 10.6 Convention de messages de commit (Conventional Commits)

Format : `<type>(<scope>): <description>`

**Types courants :**
- `feat` : nouvelle fonctionnalité
- `fix` : correction de bug
- `docs` : documentation uniquement
- `style` : formatage, sans changement de logique
- `refactor` : refactoring sans changement de comportement
- `test` : ajout/modif de tests
- `chore` : tâches de maintenance (deps, config…)
- `perf` : amélioration de performance
- `ci` : configuration CI/CD

**Exemples :**
```
feat(auth): ajouter la connexion via Google OAuth
fix(api): corriger le timeout sur /users/list
docs(readme): ajouter section installation
refactor(payment): extraire la logique Stripe dans un service
chore(deps): bump react de 18.2 à 18.3
```

> 💡 Cette convention permet de **générer automatiquement** un CHANGELOG et de déterminer la prochaine version (avec [semantic-release](https://semantic-release.gitbook.io/)).

---

## 11. Résolution de conflits

Un **conflit** survient quand Git ne peut pas fusionner automatiquement deux versions d'une même portion de fichier.

### Détecter un conflit

Lors d'un `merge`, `rebase`, `cherry-pick`… Git vous indiquera :

```
Auto-merging fichier.txt
CONFLICT (content): Merge conflict in fichier.txt
Automatic merge failed; fix conflicts and then commit the result.
```

### Marqueurs de conflit

Dans le fichier en conflit :
```
<<<<<<< HEAD
Code de la branche courante (où je suis)
=======
Code de l'autre branche (que je merge)
>>>>>>> feature/login
```

### Résoudre

1. **Ouvrir le fichier**, choisir le bon contenu (ou combiner les deux)
2. **Supprimer les marqueurs** `<<<<<<<`, `=======`, `>>>>>>>`
3. `git add fichier.txt` pour marquer comme résolu
4. Continuer :
   - Si merge : `git commit`
   - Si rebase : `git rebase --continue`
   - Si cherry-pick : `git cherry-pick --continue`

### Annuler en cas de doute

```bash
git merge --abort
git rebase --abort
git cherry-pick --abort
```

### Outils visuels

```bash
# Lancer un mergetool configuré
git mergetool

# Configurer VS Code comme mergetool
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd 'code --wait $MERGED'
```

VS Code, IntelliJ, Sublime Merge, Beyond Compare, Meld… ont d'excellents éditeurs 3-way.

### Bonne pratique anti-conflits

- **Petites branches** courtes vivant peu de temps
- **Synchronisation fréquente** avec `main` (`git pull --rebase` quotidien)
- **Communication** : prévenez l'équipe quand vous touchez à un fichier "chaud"
- **Conventions de formatage** (Prettier, ESLint, EditorConfig) pour éviter les conflits cosmétiques

---

## 12. Récupération et sauvetage

### "J'ai supprimé une branche par erreur !"

```bash
# Trouver le dernier commit de la branche
git reflog
# Recréer la branche
git branch ma-branche-perdue abc1234
```

### "J'ai fait un reset --hard et perdu mon travail !"

```bash
git reflog
# Identifier l'état d'avant le reset
git reset --hard HEAD@{1}
```

### "J'ai committé sur la mauvaise branche !"

```bash
# Sur la mauvaise branche
git log  # noter le hash du commit
git reset --hard HEAD~1  # retirer le commit (LOCAL uniquement)

# Aller sur la bonne branche
git switch bonne-branche
git cherry-pick abc1234
```

### "J'ai inclus un fichier sensible (mot de passe, clé API) dans un commit !"

```bash
# Si pas encore poussé : amender le dernier commit
git rm --cached fichier-sensible.env
echo "fichier-sensible.env" >> .gitignore
git add .gitignore
git commit --amend

# Si déjà poussé : utiliser git-filter-repo (moderne) ou BFG Repo-Cleaner
# (ATTENTION : réécrit l'historique, à coordonner avec l'équipe)
```

⚠️ **Si un secret a été poussé** : considérez-le comme **compromis**, faites-le **rouler immédiatement** (régénérer la clé, changer le mot de passe), même après nettoyage de l'historique.

### "Mon `git pull` a tout cassé !"

```bash
git reflog
git reset --hard HEAD@{1}  # avant le pull
```

### "Je veux abandonner toutes mes modifs locales"

```bash
git restore .                # fichiers non staged
git restore --staged .       # dé-stager
git clean -fd                # supprimer les fichiers non suivis
git reset --hard HEAD        # tout reset au dernier commit
```

---

## 13. Bonnes pratiques

### 13.1 Commits

✅ **À faire :**
- Commits **atomiques** : un commit = une seule chose logique
- Messages **clairs et impératifs** : "Add login form" pas "Added" ni "I added"
- Suivre une **convention** (Conventional Commits)
- Committer souvent (mais pousser propre)

❌ **À éviter :**
- "wip", "fix", "test", "asdf" comme messages
- Commits monstres mélangeant 5 features
- Committer du code commenté ou des `console.log`/`print` de debug
- Committer des fichiers générés (`node_modules/`, `dist/`, `.env`…)

### 13.2 Branches

- **Nommage cohérent** (cf. section 10.5)
- **Durée de vie courte** (idéalement < 1 semaine)
- **Une branche = une feature/un fix**
- **Supprimer** les branches mergées

### 13.3 Pull Requests

- **Petites** (< 400 lignes de diff hors tests/lock files)
- **Description complète** : contexte, solution, alternatives écartées, captures
- **Lien vers le ticket**
- **Auto-review** avant de la demander
- **Répondre aux commentaires**, ne pas les ignorer
- **Tests** inclus
- **Squash** des commits "fix typo", "wip" avant merge

### 13.4 Sécurité

- ❌ **Jamais** de secrets dans Git (utilisez `.env` + `.gitignore`, ou des coffres : Vault, AWS Secrets Manager, GitHub Secrets)
- ✅ Utilisez `git-secrets` ou `gitleaks` en pre-commit pour bloquer les fuites
- ✅ Activez la **2FA** sur GitHub/GitLab/Azure DevOps
- ✅ Utilisez des **clés SSH** ou des **tokens à scope limité** (jamais le mot de passe)
- ✅ Activez la **signature GPG/SSH** des commits pour l'authenticité

### 13.5 En équipe

- 📋 **Définissez le workflow** (Git Flow ? GitHub Flow ?) et documentez-le
- 🧹 **Protégez `main`** (branch protection rules)
- 📅 **Synchronisez-vous** avec `main` au moins 1x/jour
- 💬 **Communiquez** sur les changements structurants
- 🔍 **Faites des reviews** sérieuses (mais bienveillantes)
- 📚 **Tenez un CHANGELOG**
- 🏷️ **Versionnez** avec des tags (SemVer : MAJEUR.MINEUR.PATCH)

### 13.6 Performance

- Utilisez `.gitignore` rigoureusement (les gros dossiers ralentissent tout)
- Pour les gros fichiers binaires : **Git LFS** (Large File Storage)
- `git gc` périodiquement (généralement automatique)
- Clonage shallow pour CI : `git clone --depth=1`

---

## 14. Cas pratiques complets

### Cas 1 : Démarrer un nouveau projet et le pousser sur GitHub

```bash
# Créer le projet localement
mkdir mon-projet && cd mon-projet
git init

# Créer un README et un .gitignore
echo "# Mon Projet" > README.md
echo "node_modules/" > .gitignore

# Premier commit
git add .
git commit -m "chore: initial commit"

# Renommer la branche en main (si nécessaire)
git branch -M main

# Créer le dépôt vide sur GitHub via l'interface, puis :
git remote add origin git@github.com:user/mon-projet.git
git push -u origin main
```

### Cas 2 : Contribuer à un projet open source (fork workflow)

```bash
# 1. Forker le projet sur GitHub (via l'UI)

# 2. Cloner SON fork
git clone git@github.com:moi/projet.git
cd projet

# 3. Ajouter le dépôt original comme upstream
git remote add upstream git@github.com:original/projet.git

# 4. Créer une branche de feature
git switch -c fix/typo-readme

# 5. Faire les changements + commits
git add . && git commit -m "docs: corriger une typo dans le README"

# 6. Pousser sur SON fork
git push -u origin fix/typo-readme

# 7. Ouvrir une PR sur GitHub depuis son fork vers le repo original

# Plus tard, garder son fork à jour :
git switch main
git fetch upstream
git merge upstream/main
git push origin main
```

### Cas 3 : Hotfix urgent en production

Contexte : un bug critique en prod, vous travaillez avec Git Flow.

```bash
# 1. Partir de main (= production)
git switch main
git pull

# 2. Créer la branche hotfix
git switch -c hotfix/1.2.1-fix-paiement

# 3. Corriger
# ... edit ...
git add .
git commit -m "fix(payment): corriger l'erreur 500 sur le checkout"

# 4. Pousser et ouvrir une PR vers main
git push -u origin hotfix/1.2.1-fix-paiement

# 5. Une fois mergé sur main : tagger
git switch main
git pull
git tag -a v1.2.1 -m "Hotfix paiement"
git push origin v1.2.1

# 6. Reporter le fix sur develop
git switch develop
git pull
git merge main
git push
```

### Cas 4 : Nettoyer ses commits avant de pousser

Vous avez 8 commits "wip" sur votre branche, vous voulez les présenter proprement.

```bash
git log --oneline
# abc1234 (HEAD -> feature) wip
# def5678 wip 2
# ...
# 1234567 (main) base

# Rebase interactif des 8 derniers
git rebase -i HEAD~8

# Dans l'éditeur, garder le 1er en "pick", passer les autres en "squash" ou "fixup"
# Sauvegarder, puis rédiger un message propre

# Pousser (force-with-lease car on a réécrit l'historique LOCAL)
git push --force-with-lease
```

### Cas 5 : Récupérer un fichier d'une autre branche sans la merger

```bash
# Récupérer un fichier depuis main sans changer de branche
git checkout main -- chemin/vers/fichier.js
# ou (syntaxe moderne)
git restore --source=main -- chemin/vers/fichier.js

git status  # le fichier est staged, prêt à committer
```

### Cas 6 : Trouver le commit qui a introduit un bug avec git bisect

```bash
# Le bug est présent aujourd'hui mais pas dans la version v2.0.0
git bisect start
git bisect bad HEAD
git bisect good v2.0.0

# Git vous place sur un commit du milieu
# Lancez vos tests :
npm test  # ou test manuel
# Selon le résultat :
git bisect good   # le bug n'est PAS là
# OU
git bisect bad    # le bug EST là

# Répétez. Git converge en log2(N) étapes.
# Une fois identifié :
# abc1234 is the first bad commit

git bisect reset
git show abc1234  # examiner le commit fautif
```

### Cas 7 : Gérer une branche qui a divergé fortement de main

```bash
# Sur ma branche feature qui a 3 mois de retard
git switch feature/grosse-feature
git fetch origin

# Option 1 : Rebase (historique propre, mais conflits commit par commit)
git rebase origin/main
# Résoudre conflits, git add, git rebase --continue, ad lib
git push --force-with-lease

# Option 2 : Merge (un gros conflit à résoudre, mais une seule fois)
git merge origin/main
# Résoudre, commit, push
```

> 💡 Pour les **petites branches**, préférez le rebase. Pour les **grosses branches partagées**, préférez le merge.

---

## 15. Antisèche (Cheat Sheet)

### Les essentielles du quotidien

```bash
git status                       # état du dépôt
git add .                        # stager tous les changements
git commit -m "message"          # committer
git push                         # pousser
git pull                         # tirer
git switch -c feature/x          # créer + basculer sur une branche
git switch main                  # changer de branche
git log --oneline --graph --all  # historique visuel
git diff                         # voir les modifs
git stash                        # mettre de côté
git stash pop                    # récupérer
```

### Annulations

| Je veux... | Commande |
|------------|----------|
| Annuler les modifs d'un fichier | `git restore fichier` |
| Dé-stager un fichier | `git restore --staged fichier` |
| Modifier le dernier commit | `git commit --amend` |
| Annuler le dernier commit (garder modifs) | `git reset --soft HEAD~1` |
| Annuler le dernier commit (jeter modifs) | `git reset --hard HEAD~1` |
| Annuler un commit poussé (proprement) | `git revert <hash>` |
| Récupérer un état perdu | `git reflog` puis `git reset --hard HEAD@{n}` |

### Branches

| Action | Commande |
|--------|----------|
| Lister | `git branch -a` |
| Créer + switcher | `git switch -c nom` |
| Renommer la courante | `git branch -m nouveau-nom` |
| Supprimer locale (sûr) | `git branch -d nom` |
| Supprimer locale (force) | `git branch -D nom` |
| Supprimer distante | `git push origin --delete nom` |
| Suivre une branche distante | `git switch --track origin/nom` |

### Synchronisation

| Action | Commande |
|--------|----------|
| Cloner | `git clone <url>` |
| Récupérer sans merger | `git fetch` |
| Récupérer + merger | `git pull` |
| Récupérer + rebaser | `git pull --rebase` |
| Première poussée | `git push -u origin <branche>` |
| Force safe | `git push --force-with-lease` |

---

## 16. Glossaire

| Terme | Définition |
|-------|-----------|
| **Repository (repo)** | Le dépôt = le projet versionné (dossier `.git/`) |
| **Working Directory** | Vos fichiers tels que vous les voyez |
| **Staging Area / Index** | Zone tampon des modifs préparées pour le prochain commit |
| **Commit** | Instantané du projet à un instant T |
| **Branch** | Pointeur mobile vers un commit |
| **HEAD** | Pointeur indiquant où vous êtes actuellement |
| **Remote** | Dépôt distant (sur GitHub/GitLab/etc.) |
| **Origin** | Nom par défaut du remote principal |
| **Upstream** | Souvent : le dépôt original d'un fork |
| **Fork** | Copie personnelle d'un dépôt sur la plateforme |
| **Clone** | Copie locale d'un dépôt distant |
| **Fetch** | Télécharger les changements distants sans les fusionner |
| **Pull** | Fetch + merge (ou rebase) |
| **Push** | Envoyer ses commits sur le remote |
| **Merge** | Fusionner deux branches (crée parfois un commit de merge) |
| **Rebase** | Rejouer ses commits sur une autre base |
| **Conflict** | Modifs incompatibles à résoudre manuellement |
| **Stash** | Mise de côté temporaire de modifs non committées |
| **Tag** | Étiquette nommée sur un commit (souvent une version) |
| **Pull/Merge Request** | Demande d'intégration de branche, avec review |
| **CI/CD** | Intégration / Déploiement Continus (tests + déploiement auto) |
| **Hotfix** | Correctif urgent en production |
| **Cherry-pick** | Appliquer un commit précis sur une autre branche |
| **Reflog** | Journal local de tous les déplacements de HEAD |
| **HEAD~n** | Le n-ième ancêtre du commit courant |
| **HEAD^** | Le parent du commit courant (= HEAD~1) |
| **Detached HEAD** | État où HEAD pointe sur un commit, pas une branche |
| **Fast-forward** | Merge qui consiste juste à avancer un pointeur |
| **Squash** | Combiner plusieurs commits en un seul |

---

## 🎓 Pour aller plus loin

- 📖 **Pro Git** (gratuit, en français) : https://git-scm.com/book/fr/v2
- 🎮 **Learn Git Branching** (interactif) : https://learngitbranching.js.org/?locale=fr_FR
- 🔍 **Oh Shit, Git!?!** (sauvetages) : https://ohshitgit.com/fr
- 📑 **Conventional Commits** : https://www.conventionalcommits.org/fr/
- 🔧 **Git Flow Atlassian** : https://www.atlassian.com/fr/git/tutorials/comparing-workflows
- 🛡️ **GitHub Docs** : https://docs.github.com/fr
- 🛡️ **GitLab Docs** : https://docs.gitlab.com/
- 🛡️ **Azure DevOps Docs** : https://learn.microsoft.com/fr-fr/azure/devops/

---

> 💡 **Le conseil final** : Git semble complexe au début, mais sa logique devient évidente avec la pratique. **N'ayez pas peur de tester** dans un dépôt jouet — avec `git reflog`, presque rien n'est définitivement perdu. Et quand vous galérez, le réflexe est : `git status` → `git log --oneline --graph --all` → `git reflog`. Ces trois commandes vous diront toujours **où vous êtes** et **comment revenir en arrière**.

**Bon code, et bons commits ! 🚀**
