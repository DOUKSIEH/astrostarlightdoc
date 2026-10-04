---
title: "📘 FacturaDJ — Guide d’Architecture, d’Industrialisation et d’Exploitation DevSecOps & GitOps"
description:  >-
  De la construction des images à la préproduction : Packer, Docker, Harbor, GitHub, GitLab, Kubernetes, Argo CD, sécurité, résilience et runbooks opérationnels.
#"De l’ordonnancement à l’Automation API, Jobs as Code, CI/CD, MFT, sécurité, supervision et troubleshooting"
created: "2026-09-15"
# updated: "2026-09-03"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"
---

:::note

**Guide d’apprentissage • Documentation d’architecture • Manuel d’exploitation • Runbook DevOps, DevSecOps et GitOps**

Ce document constitue le référentiel technique et opérationnel de **FacturaDJ**. Il présente de manière structurée et pédagogique l’ensemble du cycle de vie de la plateforme : compréhension de l’architecture, construction et sécurisation des images, préparation des livraisons, déploiement en préproduction, exploitation, supervision, diagnostic, sauvegarde, restauration et rollback.

Il couvre notamment l’utilisation de **Packer, Docker, Harbor, GitHub, GitLab, Kubernetes et Argo CD**, ainsi que les bonnes pratiques de **CI/CD, GitOps, sécurité, traçabilité, résilience et exploitation opérationnelle**.

L’objectif est de disposer d’un **manuel de référence unique**, permettant de comprendre le fonctionnement du système, préparer une livraison, déployer une nouvelle version, exploiter l’infrastructure, diagnostiquer un incident et restaurer le service de manière maîtrisée et reproductible.

:::

<!-- :::note
**Guide d'apprentissage • Documentation d'architecture • Manuel d'exploitation • Runbook DevOps, DevSecOps et GitOps**.

De la construction des images à la préproduction : Packer, Docker, Harbor, GitHub, GitLab, Kubernetes, Argo CD, sécurité, résilience et runbooks opérationnels.
:::
Comprendre le système, préparer une livraison, déployer, exploiter, diagnostiquer et restaurer : ce manuel rassemble le parcours de référence de FacturaDJ dans un fichier Markdown unique. -->

| Repère | Valeur |
|---|---|
| Édition | **3.0 — révision pédagogique et opérationnelle** |
| Date | 14 septembre 2026 |
| Format de référence | Markdown UTF-8 ; aucun PDF nécessaire à la lecture |
| Fichier recommandé | `infra/docs/FACTURADJ-MANUEL-REFERENCE-COMPLET.md` |
| Base de rédaction | Document joint `FACTURADJ-INFRASTRUCTURE-COMPLETE.md`, édition 2.0 |
| Vérification complémentaire | Lecture ciblée des scripts, manifests et paramètres de la copie locale FacturaDJ ; références officielles en Annexe K |
| Périmètre actif des fichiers | Packer/Docker → Harbor → GitLab GitOps → Argo CD manuel → k3d PREPROD |
| Évolution de cette édition | Clarification des niveaux de preuve, traçabilité, runbooks de migration/restauration, cas pratiques, bootstrap de laboratoire et maintenance documentaire |
| État des serveurs | À vérifier par l'opérateur ; aucun déploiement exécuté pour cette rédaction |

<a id="le-manuel-en-une-page"></a>

## Le manuel en une page

Si vous ne lisez qu'une seule page, que ce soit celle-ci. Elle contient le modèle mental dont tout le reste découle.

**Ce que fait FacturaDJ.** Une plateforme SaaS de facturation pour des clients à Djibouti. Deux programmes (un frontend Astro qui rend les pages, un backend Django qui porte l'API et le métier) et deux services de données (PostgreSQL pour les données comptables, Redis pour les compteurs anti-abus).

**Ce que fait l'infrastructure.** Transformer un commit relu en un service qui tourne, sans jamais perdre la trace de ce qui a été déployé ni la possibilité de revenir en arrière.

```text
   CODE                 ARTEFACT                   PLAN                    RÉALITÉ
   ────                 ────────                   ────                    ───────
  GitHub   ──porte──►  Packer + Docker  ──porte──►  Harbor   ──porte──►  dépôt GitOps  ──porte──►  k3d
  (revue)              (construction)              (registry)             (Merge Request)         (Argo CD)
     │                       │                         │                        │                     │
   un SHA              deux images                deux digests            un commit             des Pods
                       du même SHA                sha256:…                approuvé              en service
```

**Les cinq idées à ne jamais perdre de vue.**

| # | Idée | Conséquence concrète |
|---|---|---|
| 1 | **Une release relie code, images et configuration** | Le SHA source relie code, tags et Job ; les digests identifient les images ; un autre commit identifie le plan GitOps. Ces identités doivent être cohérentes |
| 2 | **On construit une fois, on promeut le digest** | L'image validée en préproduction est **octet pour octet** celle qui partira en production. Ce qui change entre environnements est injecté au démarrage, jamais reconstruit |
| 3 | **Le digest, pas le tag** | Un tag est une étiquette que l'on peut recoller ailleurs ; un digest est l'empreinte du contenu. FacturaDJ déploie par digest |
| 4 | **Git est le plan, le cluster est le terrain** | Les ressources gérées par Argo CD évoluent par Git ; bootstrap, secrets et interventions d'urgence suivent des procédures dédiées. Les écarts doivent être expliqués |
| 5 | **Chaque étape sensible passe par une décision humaine** | Le parcours comprend des décisions humaines D1 à D8, définies dans le cadre de référence. Les contrôles CI peuvent être automatiques |

**Pourquoi tant de précautions.** FacturaDJ manipule des **données comptables**. Une facture perdue ou une numérotation réinitialisée compromet l'intégrité du métier et peut avoir des conséquences comptables ou juridiques. Cette phrase explique à elle seule la sauvegarde avant migration, les portes humaines, le refus du repli silencieux sur SQLite et le contrôle de la table de numérotation après chaque restauration.

**Ce que la préproduction n'est pas.** Elle n'est **pas hautement disponible** : un seul VPS, un réplica par application, une instance PostgreSQL, aucune pile de supervision. C'est un choix assumé pour un environnement de recette, documenté au [chapitre 15](#chapitre-15). Ne jamais présenter la PREPROD comme une production.

<a id="demarrage-rapide--les-30-premieres-minutes"></a>

## Démarrage rapide : les 30 premières minutes

Vous venez d'arriver sur le projet et vous voulez être utile aujourd'hui, pas la semaine prochaine. Voici l'ordre le plus rentable.

| Minute | Faites ceci | Vous en tirez |
|---|---|---|
| 0 → 5 | Relisez [Le manuel en une page](#le-manuel-en-une-page) ci-dessus | Le modèle mental complet |
| 5 → 10 | Lisez [1.5 Ce qui est actif et ce qui ne l'est pas](#section-1-5) | Vous cesserez de confondre l'étude OKD d'août et la cible k3d de septembre — c'est la première source d'erreur du projet |
| 10 → 15 | Parcourez [2.1 Vue d'ensemble](#section-2-1) et [2.6 Carte du dépôt](#section-2-6) | Où se trouve chaque fichier, et lesquels ne doivent **jamais** être exécutés |
| 15 → 20 | Lisez [1.4 Le principe directeur : des portes humaines](#section-1-4) | Pourquoi rien ne se déclenche tout seul ici |
| 20 → 25 | Survolez la [checklist de release](#section-21-1) du chapitre 21 | La forme concrète d'une livraison, de bout en bout |
| 25 → 30 | Ouvrez l'[Annexe F](#annexe-f) | Ce qui bloque encore aujourd'hui, par priorité |

> **Attention** — Ce premier parcours est consacré à la lecture. La première commande que vous exécuterez sur ce projet devrait être une commande de lecture, dans le contexte de [17.2 Avant de commencer](#section-17-2).

<a id="comment-utiliser-ce-manuel"></a>

## Comment utiliser ce manuel

<a id="quatre-usages-un-seul-document"></a>

### Quatre usages, un seul document

Ce manuel est délibérément unique : un seul fichier, une seule vérité, un seul endroit à mettre à jour. Il se lit de quatre façons différentes.

| Usage | Vous cherchez | Entrez par |
|---|---|---|
| **Cours** | Comprendre une technologie que vous ne connaissez pas encore | Les chapitres dans l'ordre. Chaque notion est expliquée **avant** d'être utilisée |
| **Documentation d'architecture** | Savoir comment le système est bâti et pourquoi | Chapitres [2](#chapitre-02), [3](#chapitre-03), [9](#chapitre-09), [10](#chapitre-10), [11](#chapitre-11), [15](#chapitre-15) |
| **Documentation d'exploitation** | Savoir ce qui tourne, où, avec quels réglages | Chapitres [12](#chapitre-12), [13](#chapitre-13), [14](#chapitre-14), [16](#chapitre-16), plus les [annexes B](#annexe-b) et [C](#annexe-c) |
| **Runbook** | Exécuter une intervention avec ses préconditions, contrôles et possibilités de repli | Chapitres [17](#chapitre-17), [18](#chapitre-18), [19](#chapitre-19), [20](#chapitre-20), [21](#chapitre-21) et l'[Annexe G](#annexe-g) |

<a id="parcours-dapprentissage-guides"></a>

### Parcours d'apprentissage guidés

Trois parcours, selon le temps dont vous disposez. Les durées sont des durées de **lecture attentive**, sans exécution.

**Parcours A — Découverte (environ 2 h 30).** Pour comprendre le système sans encore y toucher.

```text
 1. Introduction (6 min) ─► 2. Architecture (10 min) ─► 3. Environnements (5 min)
        │
        ▼
 5. Images Docker (14 min) ─► 4. Packer (16 min) ─► 7. Harbor (7 min)
        │
        ▼
 9. Kubernetes et k3d (16 min) ─► 10. GitOps et Argo CD (9 min) ─► 11. Réseau (12 min)
        │
        ▼
 15. HA et résilience (10 min) ─► 21.1 Checklist de release (5 min)
```

**Parcours B — Premier déploiement (environ 3 h, puis la procédure).** Pour livrer une release accompagné, puis seul.

```text
 Parcours A ─► 6. GitHub et GitLab (7 min) ─► 8. CI/CD (13 min)
        │
        ▼
 13.5 Migrations (10 min) ─► 19.1 à 19.4 Sauvegarder (15 min)
        │
        ▼
 17. Procédure pas à pas (40 min de lecture, une demi-journée d'exécution accompagnée)
        │
        ▼
 18. Rollback (5 min) ─► 20. Dépannage (15 min)
```

**Parcours C — Exploitation quotidienne (environ 1 h).** Pour prendre l'astreinte.

```text
 21. Runbook (6 min) ─► 20. Dépannage par symptômes (15 min) ─► 16. Observabilité (6 min)
        │
        ▼
 19. Sauvegarde et PRA (12 min) ─► 18. Rollback (5 min) ─► 14.3 Rotation des secrets (5 min)
        │
        ▼
 Annexe G — Index des commandes ─► Annexe F — Points restant à valider
```

<a id="par-profil"></a>

### Par profil

| Votre profil | Parcours conseillé |
|---|---|
| Vous découvrez DevOps ou Kubernetes | Parcours A intégralement, puis le [glossaire](#annexe-a) comme compagnon de lecture |
| Développeur frontend ou backend | Chapitres 2, 3, 5 (images), 13 (PostgreSQL et migrations), 16 (sondes) et 20 (dépannage) |
| Administrateur système | Chapitres 2, 9, 11, 12, 13, 14, 19 et 20 |
| Ingénieur cloud | Chapitres 2, 7, 9 à 12, 15 et 22 |
| DevOps ou SRE | Tout, en insistant sur 8, 10, 17, 18, 20 et 21 |
| Vous reprenez le projet après plusieurs mois | [1.5](#section-1-5), [2.6](#section-2-6), chapitre 17, puis [Annexe D](#annexe-d) et [Annexe F](#annexe-f) |

<a id="une-documentation-deux-generations"></a>

### Une documentation, deux générations

Les documents sources ont été écrits à deux moments, pour deux architectures différentes. Les confondre est la principale source d'erreur.

| | Étude d'août 2026 | Implémentation de septembre 2026 |
|---|---|---|
| **Statut** | Architecture cible de production, **non implémentée** | **Architecture active**, préparée pour la PREPROD |
| **Orchestrateur** | OKD (OpenShift communautaire) sur Hetzner Cloud | k3s dans k3d, sur un VPS unique |
| **Golden Images** | Snapshots de machines Fedora CoreOS et Rocky Linux | Deux images Docker applicatives construites par Packer |
| **Registry** | GitHub Container Registry (`ghcr.io`) | Harbor privé (`harbor.nexora-djibouti.fr`) |
| **CI/CD** | GitHub Actions automatique, Argo CD en auto-sync | GitHub pour les contrôles, GitLab à portes manuelles, Argo CD en sync manuel |
| **Base de données** | CloudNativePG, 2 instances synchrones | PostgreSQL 17 en StatefulSet, 1 instance |
| **Outils de commande** | `oc`, `hcloud`, `tofu`, `openshift-install` | `packer`, `docker`, `kubectl`, `argocd`, `k3d` |

Règles de lecture appliquées dans tout le manuel :

- Les commandes des chapitres 4 à 21 visent **la cible active**.
- Les encadrés et sections intitulés **Cible PROD** décrivent l'étude d'août : ils expliquent des choix d'avenir mais **ne doivent pas être exécutés** sur la PREPROD k3d.
- Le chapitre 22 regroupe ce qui relève exclusivement de la future production.

> **Attention** — Ne jamais reprendre une commande `oc`, `hcloud`, `tofu`, `openshift-install` ou une référence `ghcr.io/OWNER/...` pour dépanner la PREPROD k3d. Ces commandes appartiennent à l'étude OKD.

<a id="comment-un-chapitre-est-construit"></a>

### Comment un chapitre est construit

Les 22 chapitres suivent une structure commune, complétée dans cette édition par un cas d'application. Repérer cette structure, c'est savoir où regarder sans lire tout le chapitre.

```text
 ## N. Titre du chapitre
 │
 ├── « En une phrase »            ce que le chapitre dit, en une ligne
 ├── « Ce que vous saurez faire » 3 à 5 objectifs d'apprentissage vérifiables
 ├── Prérequis · Durée · Nature   avant de lire, combien de temps, quel usage
 │
 ├── N.1, N.2, N.3 …              le contenu : notions, puis mise en œuvre FacturaDJ,
 │                                puis commandes de vérification
 │
 └── #### Synthèse du chapitre N
     ├── « À retenir »            les points qui survivent à l'oubli du reste
     ├── « Les pièges classiques » l'erreur, pourquoi on la commet, le bon réflexe
     ├── « Vérifiez votre compréhension »  3 questions, réponses juste en dessous
     └── « Où aller ensuite »     la suite logique de la lecture
```

Les questions d'auto-évaluation ne sont pas décoratives : si vous ne savez pas y répondre, relisez la section indiquée entre parenthèses avant de passer au chapitre suivant.

<a id="conventions"></a>

### Conventions

**Étiquettes des commandes.** Chaque bloc de commandes commence par un commentaire qui annonce sa nature. Lisez cette étiquette **avant** la commande : elle dit ce que vous risquez.

| Étiquette | Signification | Réversible ? |
|---|---|---|
| `# LECTURE` / `# VALIDATION` | N'altère rien. Certains outils téléchargent néanmoins une base ou un plugin (signalé) | Sans objet |
| `# MODIFICATION LOCALE` | Écrit des fichiers, des conteneurs ou des images sur la machine courante | Oui, en supprimant les fichiers produits |
| `# MODIFICATION DISTANTE` | Écrit sur un service distant : Git, Harbor, copie SCP | Parfois seulement : un tag immuable poussé dans Harbor ne se réécrit pas |
| `# DÉPLOIEMENT` | Modifie le cluster Kubernetes, la base de données ou déclenche une synchronisation Argo CD | Par retour arrière explicite, jamais automatiquement |

**Encadrés.**

> **Note** — Précision utile.

> **Attention** — Risque d'erreur, de perte de données ou de faille.

> **Analogie** — Image concrète pour comprendre une notion.

> **À valider** — Point non vérifiable depuis les sources, à confirmer sur l'infrastructure réelle. Tous sont recensés en [Annexe F](#annexe-f).

> **Cible PROD** — Élément de l'architecture de production étudiée, non implémenté.

> **En une phrase** — Résumé d'ouverture d'un chapitre.

> **À retenir** — Point de synthèse qui survit à l'oubli du reste.

**Valeurs à remplacer.** Les manifests contiennent volontairement des sentinelles : `example.invalid`, `RENSEIGNER`, `sha256:000…000`, `UNPROMOTED`. Le contrôle `check_static.py --release` vérifie certains fichiers et digests ; il faut aussi examiner le rendu Kustomize et vérifier qu'aucune image `UNPROMOTED` n'y subsiste. Dans le texte, `<valeur>` désigne une valeur à fournir.

**Variables shell récurrentes.** Elles sont définies une fois dans la procédure du chapitre 17 et réutilisées partout :

| Variable | Contenu | Exemple de forme |
|---|---|---|
| `SOURCE_REV` | SHA Git complet du commit applicatif approuvé (40 caractères hexadécimaux) | `3f2c…e91a` |
| `TAG` | Tag des images, toujours dérivé du SHA | `sha-3f2c…e91a` |
| `PYTHON_IMAGE` | Image de base Python fixée par digest | `python:3.12-slim-bookworm@sha256:<64 hex>` |
| `NODE_IMAGE` | Image de base Node fixée par digest | `node:22-bookworm-slim@sha256:<64 hex>` |
| `POSTGRES_IMAGE`, `REDIS_IMAGE` | Images PostgreSQL et Redis fixées par digest | `postgres:17-bookworm@sha256:<64 hex>` |
| `KUBE_CONTEXT` | Contexte kubectl de la PREPROD | `k3d-<nom-du-cluster>` |

**La règle d'or.** Exécuter un bloc, lire le résultat, décider du bloc suivant. Ne jamais lancer ce manuel comme un script.

> **Attention** — Trois raccourcis sont interdits dans tout le manuel, quelle que soit l'urgence : ajouter `|| true` pour faire passer un contrôle qui échoue, ajouter `--force` ou `--prune` pour débloquer une synchronisation, ajouter `insecure-registries` pour contourner un problème de certificat. Chacun de ces trois gestes transforme un incident visible en incident silencieux.

<a id="cadre-de-reference-et-niveau-de-preuve"></a>

## Cadre de référence et niveau de preuve

<a id="ce-que-cette-edition-etablit"></a>

### Ce que cette édition établit

Ce manuel réunit quatre usages : **apprendre**, **comprendre les choix d'architecture**, **administrer les services** et **exécuter une intervention contrôlée**. Les explications précèdent les commandes. Les procédures désignent un point d'entrée, un résultat observable et une condition d'arrêt.

Cette édition est une révision du document transmis, datée du **14 septembre 2026**. Les chemins, scripts de livraison, manifests k3d, sondes et réglages de conteneurs ont été recoupés avec la copie locale du projet. La présence d'un fichier décrit une capacité préparée ; elle ne prouve pas son déploiement.

**Limite de vérification :** aucune connexion aux serveurs FacturaDJ, à Harbor, à GitLab ou au cluster n'a été effectuée pour rédiger cette édition. Aucun build, push, changement de secret, migration ou déploiement n'a été lancé. Les résultats de commandes présentés sont des **résultats attendus**, sauf lorsqu'une observation locale est explicitement indiquée.

| Mention | Sens précis | Preuve permettant de changer de statut |
|---|---|---|
| **Implémenté dans le dépôt** | Le fichier ou le comportement est présent dans la copie examinée | Chemin du fichier et revue du code |
| **Cible active PREPROD** | Parcours retenu par les fichiers actuels : Packer, Docker, Harbor, GitLab, Argo CD, k3d | Inventaire réel puis release réussie |
| **À valider sur l'environnement** | Le document ne dispose pas de preuve de fonctionnement sur les serveurs | Sortie datée d'un contrôle, identité de l'environnement, opérateur |
| **Proposé** | Recommandation ajoutée au manuel, encore à adopter et à tester | Décision documentée, implémentation et validation |
| **Étude PROD / archive** | Conception historique conservée pour préparer une décision | Nouvelle étude tenant compte des versions, coûts et besoins retenus |

Dans les chapitres hérités, les mots **actif**, **actuel** et **PREPROD** désignent donc la cible des fichiers, et non une attestation de mise en service.

<a id="les-trois-identifiants-dune-release"></a>

### Les trois identifiants d'une release

Le terme « version » est trop imprécis pour une intervention. Une livraison se décrit par trois identifiants distincts.

| Identifiant | Ce qu'il identifie | Où le lire |
|---|---|---|
| `SOURCE_REV` | Commit du **code applicatif** approuvé | Clone applicatif, labels OCI, reçus |
| Digests frontend et backend | Contenu des **images publiées** | `release/digests.json`, Harbor, manifests |
| `GITOPS_REV` | Commit du **plan de déploiement** approuvé | Clone GitOps, MR fusionnée, état Argo CD |

`SOURCE_REV` et `GITOPS_REV` appartiennent à deux dépôts et n'ont normalement pas la même valeur. Un changement de domaine peut changer le commit GitOps sans changer les images. Une nouvelle image peut conserver les mêmes réglages d'environnement.

~~~text
Commit applicatif A
    └── construction ──► image frontend F + image backend B
                              └── promotion ──► commit GitOps G
                                                   └── sync ──► cluster
Journal de release = A + F + B + G + date + contrôles + décision
~~~

**Exemple raisonné.** La facture ne s'imprime plus après une livraison. Le commit A permet de retrouver le code et les tests. Le digest B permet de reprendre exactement le backend livré. Le commit G permet de retrouver les paramètres et les deux images de cette livraison. Aucun de ces identifiants ne remplace les deux autres.

<a id="la-chaine-de-decisions-sans-ambiguite"></a>

### La chaîne de décisions, sans ambiguïté

Le document d'origine utilisait plusieurs listes différentes de « cinq portes ». Cette édition distingue les décisions et les contrôles qui les accompagnent.

| Repère | Décision humaine | Éléments à examiner avant de poursuivre |
|---|---|---|
| D1 | Approuver le code dans GitHub | Revue, tests et audits ; commit résultant identifié |
| D2 | Transférer ce commit vers le miroir GitLab | SHA source et référence distante attendus |
| D3 | Construire les deux images | Checkout propre, lock Python, bases par digest |
| D4 | Analyser et accepter les résultats de scan | Archives exactes, rapports, SBOM, absence de vulnérabilité bloquante |
| D5 | Publier dans Harbor | Tests réussis, empreintes concordantes, droit de publication |
| D6 | Approuver la promotion GitOps | Deux digests, configuration, Job de migration, MR relue |
| D7 | Autoriser et exécuter la migration si nécessaire | Compatibilité, accès maîtrisé, sauvegarde restaurable |
| D8 | Synchroniser puis accepter la livraison | Commit GitOps exact, état du cluster, vérifications fonctionnelles |

D7 et D8 ne s'exécutent pas toujours dans cet ordre : un **bootstrap** doit d'abord créer les dépendances ; une **mise à jour** suit le plan de migration de [17.13](#section-17-13). Les contrôles CI peuvent démarrer automatiquement. Les actions de livraison restent déclenchées manuellement dans les fichiers examinés.

<a id="lire-et-executer-les-exemples"></a>

### Lire et exécuter les exemples

Les commandes `bash` visent **Linux/Bash**, principalement la VM DEV ou la machine d'administration. Les blocs `powershell` visent le poste Windows. Les blocs `yaml`, `hcl`, `json` et `sql` expliquent des fichiers ou des requêtes : ce ne sont pas des scripts Bash.

| Avant un bloc | Question à résoudre |
|---|---|
| Machine | VM de construction, VPS, machine d'administration ou poste Windows ? |
| Répertoire | Clone applicatif ou clone GitOps ? Le fichier existe-t-il ici ? |
| Identité | Quel compte, contexte Kubernetes et serveur Argo CD ? |
| Effet | Lecture, création locale, publication, modification du cluster ou des données ? |
| Préconditions | Variables définies, droits présents, fichiers contrôlés, fenêtre d'intervention ouverte ? |
| Sortie | Quel résultat autorise la suite ? Quel résultat impose l'arrêt ? |

Les valeurs `example.invalid`, `RENSEIGNER`, `UNPROMOTED` et les digests nuls sont des **sentinelles de préparation**. Elles doivent être remplacées dans les fichiers réellement promus. Les occurrences pédagogiques dans ce manuel sont intentionnelles.

Dans Bash, `commande > fichier` écrit le résultat **sur la machine qui lance la commande**. Avec `kubectl exec ... > sauvegarde.dump`, le programme tourne dans le Pod mais le fichier est créé localement. Une redirection crée parfois un fichier vide même si la commande échoue : l'existence du fichier ne prouve pas la réussite.

Un échec termine la procédure en cours. Dans un script préparé, `set -euo pipefail` aide à détecter les erreurs ; dans une session interactive, contrôler chaque résultat reste indispensable. Les commandes de comparaison ont parfois un code spécifique pour « différence trouvée » : voir [10.8](#section-10-8).

**Fichiers de confiance.** Les exemples exécutables ci-dessous supposent un clone et des scripts relus. Lire ce manuel n'accorde pas une autorisation permanente d'intervenir sur n'importe quel environnement.

<a id="contrat-commun-des-runbooks"></a>

### Contrat commun des runbooks

Une intervention n'est terminée que lorsque ces sept éléments sont renseignés.

1. **But** : résultat recherché et environnement concerné.
2. **Déclencheur** : release, alerte, incident ou exercice programmé.
3. **Préconditions** : accès, versions, sauvegardes et dépendances.
4. **Action** : étapes unitaires, exécutées dans l'ordre choisi.
5. **Preuve** : résultat attendu comparé au résultat obtenu.
6. **Arrêt et repli** : décision si le contrôle échoue.
7. **Clôture** : validation fonctionnelle, état GitOps et journal d'intervention.

Les changements de base demandent une distinction supplémentaire : **annuler du code**, **corriger un schéma** et **restaurer des données** sont trois opérations différentes.

<a id="table-des-matieres"></a>

## Table des matières

<!-- TOC:START — maintenir avec les titres du document -->

- **[Le manuel en une page](#le-manuel-en-une-page)**

- **[Démarrage rapide : les 30 premières minutes](#demarrage-rapide--les-30-premieres-minutes)**

- **[Comment utiliser ce manuel](#comment-utiliser-ce-manuel)**
  - [Quatre usages, un seul document](#quatre-usages-un-seul-document)
  - [Parcours d'apprentissage guidés](#parcours-dapprentissage-guides)
  - [Par profil](#par-profil)
  - [Une documentation, deux générations](#une-documentation-deux-generations)
  - [Comment un chapitre est construit](#comment-un-chapitre-est-construit)
  - [Conventions](#conventions)

- **[Cadre de référence et niveau de preuve](#cadre-de-reference-et-niveau-de-preuve)**
  - [Ce que cette édition établit](#ce-que-cette-edition-etablit)
  - [Les trois identifiants d'une release](#les-trois-identifiants-dune-release)
  - [La chaîne de décisions, sans ambiguïté](#la-chaine-de-decisions-sans-ambiguite)
  - [Lire et exécuter les exemples](#lire-et-executer-les-exemples)
  - [Contrat commun des runbooks](#contrat-commun-des-runbooks)

- **[1. Introduction](#chapitre-01)**
  - [1.1 FacturaDJ en quelques mots](#section-1-1)
  - [1.2 Les objectifs de l'infrastructure](#section-1-2)
  - [1.3 Les principes, expliqués simplement](#section-1-3)
  - [1.4 Le principe directeur : des portes humaines](#section-1-4)
  - [1.5 Ce qui est actif et ce qui ne l'est pas](#section-1-5)

- **[2. Architecture générale](#chapitre-02)**
  - [2.1 Vue d'ensemble](#section-2-1)
  - [2.2 Les composants et leur rôle](#section-2-2)
  - [2.3 Comment les composants communiquent](#section-2-3)
  - [2.4 Le modèle BFF : pourquoi Django n'est pas exposé](#section-2-4)
  - [2.5 Machines, accès et rôles](#section-2-5)
  - [2.6 Carte du dépôt](#section-2-6)

- **[3. Environnements](#chapitre-03)**
  - [3.1 Trois environnements, trois rôles](#section-3-1)
  - [3.2 La même image, une configuration différente](#section-3-2)
  - [3.3 Le chemin de promotion](#section-3-3)
  - [3.4 Règles de données entre environnements](#section-3-4)

- **[4. Golden Images avec Packer](#chapitre-04)**
  - [4.1 Qu'est-ce qu'une Golden Image ?](#section-4-1)
  - [4.2 Trois notions à ne pas confondre](#section-4-2)
  - [4.3 OCI en deux minutes](#section-4-3)
  - [4.4 Pourquoi Packer, et ce qu'il fait ici](#section-4-4)
  - [4.5 Anatomie d'un template Packer HCL](#section-4-5)
  - [4.6 Les builders : pourquoi `null`](#section-4-6)
  - [4.7 Le provisioner `shell-local` et le script de construction](#section-4-7)
  - [4.8 Les post-processors `artifice` et `manifest`](#section-4-8)
  - [4.9 Versionnement et traçabilité](#section-4-9)
  - [4.10 Sécurité et reproductibilité de la construction](#section-4-10)
  - [4.11 Utiliser Packer : quand et comment](#section-4-11)
  - [4.12 Les anciennes Golden Images de machines](#section-4-12)

- **[5. Images applicatives Docker](#chapitre-05)**
  - [5.1 Docker en huit notions](#section-5-1)
  - [5.2 De l'image de base jusqu'à Harbor](#section-5-2)
  - [5.3 Le contexte de construction et `.dockerignore`](#section-5-3)
  - [5.4 Verrouiller les dépendances](#section-5-4)
  - [5.5 Choisir les images de base par digest](#section-5-5)
  - [5.6 L'image backend Django](#section-5-6)
  - [5.7 L'image frontend Astro SSR](#section-5-7)
  - [5.8 Le contrat des sondes de santé](#section-5-8)
  - [5.9 Le durcissement des conteneurs](#section-5-9)
  - [5.10 Tester localement avec Docker Compose](#section-5-10)
  - [5.11 Contrôles avant publication](#section-5-11)

- **[6. GitHub et GitLab](#chapitre-06)**
  - [6.1 Rappels Git indispensables](#section-6-1)
  - [6.2 Le rôle de chaque plateforme](#section-6-2)
  - [6.3 Branches, Pull Requests et Merge Requests](#section-6-3)
  - [6.4 Le transfert validé GitHub → GitLab](#section-6-4)
  - [6.5 Tokens, droits et sécurité des dépôts](#section-6-5)
  - [6.6 La validation humaine : qui décide quoi](#section-6-6)

- **[7. Harbor](#chapitre-07)**
  - [7.1 Qu'est-ce qu'une registry ?](#section-7-1)
  - [7.2 Projet, repositories, tags et digests](#section-7-2)
  - [7.3 Les comptes robots](#section-7-3)
  - [7.4 Scans, SBOM et signature](#section-7-4)
  - [7.5 Immutabilité, rétention et quotas](#section-7-5)
  - [7.6 Publier dans Harbor](#section-7-6)
  - [7.7 Le reçu des digests](#section-7-7)
  - [7.8 Consommer les images depuis k3d](#section-7-8)
  - [7.9 Erreurs fréquentes](#section-7-9)

- **[8. CI/CD](#chapitre-08)**
  - [8.1 CI et CD : deux métiers différents](#section-8-1)
  - [8.2 Le pipeline de bout en bout](#section-8-2)
  - [8.3 GitHub Actions : les contrôles DEV](#section-8-3)
  - [8.4 GitLab CI : le pipeline PREPROD](#section-8-4)
  - [8.5 Le script `images.sh`](#section-8-5)
  - [8.6 La validation statique `check_static.py`](#section-8-6)
  - [8.7 La proposition GitOps `prepare_gitops.py`](#section-8-7)
  - [8.8 Deux parcours possibles, un seul par release](#section-8-8)
  - [8.9 Évolutions CI/CD envisagées](#section-8-9)

- **[9. Kubernetes et k3d](#chapitre-09)**
  - [9.1 Pourquoi un orchestrateur ?](#section-9-1)
  - [9.2 k3s et k3d](#section-9-2)
  - [9.3 Les objets Kubernetes, pas à pas](#section-9-3)
  - [9.4 Kustomize](#section-9-4)
  - [9.5 Le Deployment backend commenté](#section-9-5)
  - [9.6 Ressources et budgets Kubernetes](#section-9-6)
  - [9.7 kubectl : les commandes de base](#section-9-7)
  - [9.8 Préparer un cluster neuf et son bootstrap](#section-9-8)

- **[10. GitOps et Argo CD](#chapitre-10)**
  - [10.1 GitOps : Git comme plan officiel](#section-10-1)
  - [10.2 État souhaité et état réel](#section-10-2)
  - [10.3 Argo CD : AppProject et Application](#section-10-3)
  - [10.4 Lire les statuts Argo CD](#section-10-4)
  - [10.5 La politique FacturaDJ : synchronisation manuelle](#section-10-5)
  - [10.6 Ressources gérées et non gérées par Argo CD](#section-10-6)
  - [10.7 Anciennes Applications et synchronisation automatique résiduelle](#section-10-7)
  - [10.8 Les commandes Argo CD](#section-10-8)
  - [10.9 Sync, drift et rollback : ce qu'il faut retenir](#section-10-9)

- **[11. Réseau, DNS et TLS](#chapitre-11)**
  - [11.1 Le chemin d'une requête](#section-11-1)
  - [11.2 Le DNS](#section-11-2)
  - [11.3 Traefik et l'Ingress](#section-11-3)
  - [11.4 HTTPS et TLS](#section-11-4)
  - [11.5 Certificats : installation et renouvellement](#section-11-5)
  - [11.6 Les flux réseau autorisés dans le cluster](#section-11-6)
  - [11.7 En-têtes de sécurité HTTP](#section-11-7)
  - [11.8 Cible PROD : domaine public et protection du nom](#section-11-8)
  - [11.9 Vérifications réseau](#section-11-9)

- **[12. Stockage](#chapitre-12)**
  - [12.1 Trois familles de stockage](#section-12-1)
  - [12.2 PREPROD : les volumes local-path](#section-12-2)
  - [12.3 Cible PROD : le stockage objet](#section-12-3)

- **[13. PostgreSQL](#chapitre-13)**
  - [13.1 PostgreSQL, et pourquoi pas SQLite](#section-13-1)
  - [13.2 PREPROD : un StatefulSet PostgreSQL 17](#section-13-2)
  - [13.3 Accès et secrets](#section-13-3)
  - [13.4 Django et les connexions](#section-13-4)
  - [13.5 Les migrations de schéma](#section-13-5)
  - [13.6 Sauvegarder et restaurer en PREPROD](#section-13-6)
  - [13.7 Droits et rôles](#section-13-7)
  - [13.8 Cible PROD : choisir l'exploitation de PostgreSQL](#section-13-8)
  - [13.9 Commandes d'exploitation PREPROD](#section-13-9)

- **[14. Sécurité (DevSecOps)](#chapitre-14)**
  - [14.1 La défense en profondeur](#section-14-1)
  - [14.2 Les mécanismes, un par un](#section-14-2)
  - [14.3 Rotation des secrets](#section-14-3)
  - [14.4 Audit et journalisation](#section-14-4)

- **[15. Haute disponibilité et résilience](#chapitre-15)**
  - [15.1 Cinq notions différentes](#section-15-1)
  - [15.2 L'état réel de la PREPROD : pas de haute disponibilité](#section-15-2)
  - [15.3 Les mécanismes de résilience actifs](#section-15-3)
  - [15.4 Matrice des pannes en PREPROD](#section-15-4)
  - [15.5 Cible PROD : ce qui est réellement nécessaire](#section-15-5)
  - [15.6 Ce qui n'est pas protégé, même en production](#section-15-6)
  - [15.7 Tests de panne](#section-15-7)

- **[16. Observabilité](#chapitre-16)**
  - [16.1 Surveiller, observer, alerter](#section-16-1)
  - [16.2 Health checks et sondes Kubernetes](#section-16-2)
  - [16.3 Ce qui est disponible en PREPROD](#section-16-3)
  - [16.4 Cible PROD : métriques, journaux et alertes](#section-16-4)

- **[17. Déploiement PREPROD : procédure pas à pas](#chapitre-17)**
  - [17.1 Vue d'ensemble](#section-17-1)
  - [17.2 Avant de commencer](#section-17-2)
  - [17.3 Phase 0 — Copier et vérifier la livraison](#section-17-3)
  - [17.4 Phase 1 — Vérifier Git et les outils](#section-17-4)
  - [17.5 Phase 2 — Vérifier et figer les versions](#section-17-5)
  - [17.6 Phase 3 — Construire les images](#section-17-6)
  - [17.7 Phase 4 — Tester](#section-17-7)
  - [17.8 Phase 5 — Scanner](#section-17-8)
  - [17.9 Phase 6 — Publier dans Harbor](#section-17-9)
  - [17.10 Phase 7 — Modifier GitOps](#section-17-10)
  - [17.11 Bootstrap du cluster (premier déploiement uniquement)](#section-17-11)
  - [17.12 Phase 8 — Contrôler Argo CD](#section-17-12)
  - [17.13 Phase 9 — Synchroniser et migrer](#section-17-13)
  - [17.14 Phase 10 — Vérifier l'application](#section-17-14)
  - [17.15 Le parcours GitLab (alternative aux phases 3 à 6)](#section-17-15)
  - [17.16 Release suivante : ce qui change](#section-17-16)

- **[18. Rollback](#chapitre-18)**
  - [18.1 Ce qu'un rollback fait, et ce qu'il ne fait pas](#section-18-1)
  - [18.2 Le rollback GitOps](#section-18-2)
  - [18.3 Décider du type de retour](#section-18-3)
  - [18.4 Procédure de rollback GitOps](#section-18-4)
  - [18.5 Le rollback d'urgence](#section-18-5)
  - [18.6 Les migrations et le retour arrière](#section-18-6)

- **[19. Sauvegarde et PRA](#chapitre-19)**
  - [19.1 RPO et RTO](#section-19-1)
  - [19.2 Quoi sauvegarder](#section-19-2)
  - [19.3 Où, à quelle fréquence, combien de temps](#section-19-3)
  - [19.4 Sauvegarder](#section-19-4)
  - [19.5 Restaurer](#section-19-5)
  - [19.6 Tester la restauration](#section-19-6)
  - [19.7 Scénarios de catastrophe](#section-19-7)
  - [19.8 Cible PROD : archivage continu et restauration à un instant donné](#section-19-8)

- **[20. Dépannage par symptômes](#chapitre-20)**
  - [20.1 La méthode : de l'extérieur vers l'intérieur](#section-20-1)
  - [20.2 Les réflexes](#section-20-2)
  - [20.3 Fiches par symptôme](#section-20-3)
  - [20.4 Tableau récapitulatif](#section-20-4)

- **[21. Runbook opérationnel](#chapitre-21)**
  - [21.1 Checklist de release PREPROD](#section-21-1)
  - [21.2 Checklist de rollback](#section-21-2)
  - [21.3 Checklist d'incident : les 15 premières minutes](#section-21-3)
  - [21.4 Tâches périodiques](#section-21-4)
  - [21.5 Aide-mémoire des commandes](#section-21-5)
  - [21.6 Journal de release](#section-21-6)

- **[22. Trajectoire vers la production](#chapitre-22)**
  - [22.1 Statut de ce chapitre](#section-22-1)
  - [22.2 Ce que la production devra ajouter](#section-22-2)
  - [22.3 Choisir l'orchestrateur de production](#section-22-3)
  - [22.4 Hébergeurs et budgets](#section-22-4)
  - [22.5 Infrastructure as Code pour la production](#section-22-5)
  - [22.6 Golden Images de machines de l'étude OKD](#section-22-6)
  - [22.7 Spécificités OKD si cette voie est retenue](#section-22-7)
  - [22.8 Plan de mise en œuvre de la production (étude d'août)](#section-22-8)

- **[Annexe A — Glossaire](#annexe-a)**

- **[Annexe B — Variables et paramètres](#annexe-b)**

- **[Annexe C — Noms de référence](#annexe-c)**

- **[Annexe D — Registre des incohérences et arbitrages](#annexe-d)**

- **[Annexe E — Correspondance avec les documents sources](#annexe-e)**

- **[Annexe F — Points restant à valider](#annexe-f)**

- **[Annexe G — Index des commandes par tâche](#annexe-g)**
  - [G.1 Comprendre où j'en suis](#g1-comprendre-ou-jen-suis)
  - [G.2 Construire et vérifier une release](#g2-construire-et-verifier-une-release)
  - [G.3 Publier et promouvoir](#g3-publier-et-promouvoir)
  - [G.4 Déployer, migrer, revenir en arrière](#g4-deployer-migrer-revenir-en-arriere)
  - [G.5 Données, secrets et certificats](#g5-donnees-secrets-et-certificats)
  - [G.6 Vérifier la sécurité et le réseau](#g6-verifier-la-securite-et-le-reseau)

- **[Annexe H — Fiches de progression](#annexe-h)**
  - [H.1 Palier 1 — Je comprends le système (parcours A)](#h1-palier-1--je-comprends-le-systeme-parcours-a)
  - [H.2 Palier 2 — Je sais livrer (parcours B)](#h2-palier-2--je-sais-livrer-parcours-b)
  - [H.3 Palier 3 — Je sais exploiter (parcours C)](#h3-palier-3--je-sais-exploiter-parcours-c)
  - [H.4 Grille d'auto-évaluation](#h4-grille-dauto-evaluation)

- **[Annexe I — Maintenir le manuel et les décisions](#annexe-i)**
  - [I.1 Responsabilités documentaires](#i1-responsabilites-documentaires)
  - [I.2 Règles d'édition](#i2-regles-dedition)
  - [I.3 Modèle de décision d'architecture](#i3-modele-de-decision-darchitecture)
  - [I.4 Inventaire réel de l'environnement](#i4-inventaire-reel-de-lenvironnement)
  - [I.5 Modèle de journal d'incident](#i5-modele-de-journal-dincident)
  - [I.6 Définition de « terminé »](#i6-definition-de--termine-)
  - [I.7 Journal de cette révision](#i7-journal-de-cette-revision)

- **[Annexe J — Ateliers pratiques et corrigés](#annexe-j)**
  - [J.1 Atelier — Expliquer une requête de bout en bout](#j1-atelier--expliquer-une-requete-de-bout-en-bout)
  - [J.2 Atelier — Reconstituer la traçabilité](#j2-atelier--reconstituer-la-tracabilite)
  - [J.3 Atelier — Diagnostiquer un HTTP 503](#j3-atelier--diagnostiquer-un-http-503)
  - [J.4 Atelier — Préparer une migration](#j4-atelier--preparer-une-migration)
  - [J.5 Atelier — Prouver une restauration](#j5-atelier--prouver-une-restauration)
  - [J.6 Atelier — Choisir un retour arrière](#j6-atelier--choisir-un-retour-arriere)
  - [J.7 Atelier — Revoir une proposition GitOps](#j7-atelier--revoir-une-proposition-gitops)
  - [J.8 Barème d'autonomie](#j8-bareme-dautonomie)

- **[Annexe K — Références officielles et vérification technique](#annexe-k)**
  - [K.1 Sources du projet](#k1-sources-du-projet)
  - [K.2 Références externes consultées](#k2-references-externes-consultees)
  - [K.3 Portée des valeurs historiques](#k3-portee-des-valeurs-historiques)

<!-- TOC:END -->

<!-- PARTIE: Partie I — Comprendre -->

<a id="chapitre-01"></a>

## 1. Introduction

> **En une phrase** — FacturaDJ traite des données commerciales et comptables ; l'infrastructure doit préserver leur intégrité et rendre chaque livraison explicable.

**Ce que vous saurez faire à la fin de ce chapitre**

1. Nommer les quatre composants de l'application et dire lequel parle à lequel.
2. Expliquer les conséquences métier d'une perte de facture et les protections techniques associées.
3. Distinguer DevOps, DevSecOps, IaC, GitOps, infrastructure immuable et reproductibilité.
4. Situer les décisions humaines de livraison de la chaîne.
5. Dire, devant un fichier ou une commande, s'il relève de la cible active ou de l'étude archivée.

**Prérequis** — aucun · **Lecture** — 6 min · **Nature** — cours d'ouverture

<a id="section-1-1"></a>

### 1.1 FacturaDJ en quelques mots

FacturaDJ est une plateforme SaaS de gestion commerciale et de facturation : clients, catalogue, devis, commandes, livraisons, factures, paiements, recouvrement, trésorerie et comptabilité. Elle manipule des **données comptables** : une facture perdue ou une numérotation réinitialisée est un incident d'intégrité métier, susceptible d'avoir des conséquences comptables ou juridiques. Cette contrainte explique beaucoup de choix de ce manuel.

L'application est composée de deux programmes et de deux services de données :

| Composant | Technologie | Rôle |
|---|---|---|
| **Frontend** | Astro en rendu serveur (SSR), Node.js 22 | Produit les pages HTML, gère la session de l'utilisateur, appelle l'API |
| **Backend** | Django 5.2 et Django REST Framework, Python 3.12 | Porte la logique métier et l'API, accède aux données |
| **PostgreSQL 17** | Base relationnelle | Stocke les données commerciales et comptables |
| **Redis 7** | Cache en mémoire | Partage les compteurs anti-abus (throttling) entre processus |

```text
Navigateur ──HTTPS──► Frontend Astro SSR ──HTTP interne──► Backend Django DRF
                                                                   │
                                                          ┌────────┴────────┐
                                                          ▼                 ▼
                                                     PostgreSQL           Redis
```

Le navigateur ne parle **jamais** directement au backend. Ce modèle s'appelle *Backend For Frontend* (BFF) ; il est détaillé en [2.4](#section-2-4).

<a id="section-1-2"></a>

### 1.2 Les objectifs de l'infrastructure

| Objectif | Traduction concrète pour FacturaDJ |
|---|---|
| **Reproductible** | Les entrées de construction sont fixées et tracées ; l'identité bit à bit d'une reconstruction n'est pas garantie |
| **Traçable** | Chaque image en service se relie à un SHA Git, une base, un lock, un rapport de scan, un digest Harbor et un commit GitOps |
| **Sûre par défaut** | Conteneurs non root, système de fichiers en lecture seule, réseau fermé par défaut, secrets hors de Git, backend non exposé |
| **Contrôlée** | Une décision humaine explicite avant chaque étape sensible : construction, publication, promotion, synchronisation |
| **Réversible** | Un retour applicatif passe par un commit GitOps relu, sous réserve d'images conservées et de compatibilité du schéma |
| **Évolutive** | L'image validée en préproduction est exactement celle qui partira en production |
| **Protectrice des données** | Sauvegarde avant migration, restauration testée, contrôle de la numérotation des factures |

<a id="section-1-3"></a>

### 1.3 Les principes, expliqués simplement

<a id="devops"></a>

#### DevOps

DevOps rapproche ceux qui **développent** le logiciel et ceux qui l'**exploitent**. Au lieu de « jeter le code par-dessus le mur » à une équipe d'exploitation, on automatise et on standardise le chemin qui mène du code au service en production, et chacun en partage la responsabilité.

Pour FacturaDJ, cela se traduit par des Dockerfiles, des templates Packer, des manifests Kubernetes et des pipelines versionnés dans le même dépôt que le code.

<a id="devsecops"></a>

#### DevSecOps

DevSecOps ajoute la **sécurité à chaque étape** plutôt qu'en fin de projet. Plus un défaut est détecté tôt, moins il coûte.

> **Analogie** — Un constructeur automobile qui contrôle chaque pièce sur la chaîne de montage, au lieu d'inspecter uniquement la voiture finie sur le parking.

Exemples dans FacturaDJ : dépendances verrouillées avec empreintes, audits de dépendances en CI, lint des Dockerfiles, scan des images avant publication, SBOM, réseau fermé par défaut dans Kubernetes.

<a id="infrastructure-as-code-iac"></a>

#### Infrastructure as Code (IaC)

L'infrastructure est **décrite dans des fichiers texte versionnés** plutôt que configurée à la main. Ces fichiers se relisent en revue, se comparent, se restaurent.

> **Analogie** — Une recette de cuisine écrite, précise et datée, par opposition à un plat préparé « de mémoire » que personne ne sait refaire à l'identique.

| Ce qui est décrit | Fichier |
|---|---|
| Construction des images | `infra/packer/*.pkr.hcl`, `infra/docker/*/Dockerfile` |
| Ressources Kubernetes | `infra/k8s/k3d/*.yaml`, `infra/k8s/overlays/preprod/kustomization.yaml` |
| Déploiement GitOps | `infra/argocd/facturadj-preprod.yaml` |
| Pipelines | `.github/workflows/*.yml`, `.gitlab-ci.yml` |

<a id="gitops"></a>

#### GitOps

GitOps pousse l'IaC un cran plus loin : **Git devient la source de vérité** de ce qui doit tourner dans le cluster. Un agent, Argo CD, compare en permanence le contenu de Git à la réalité du cluster et signale les écarts. Voir le [chapitre 10](#chapitre-10).

<a id="infrastructure-immuable"></a>

#### Infrastructure immuable

On ne modifie pas un conteneur en service : on **reconstruit** une nouvelle image et on **remplace** l'ancien conteneur.

> **Analogie** — On ne répare pas une cartouche d'imprimante vide : on la remplace par une cartouche neuve, identique au modèle.

<a id="reproductibilite"></a>

#### Reproductibilité

La construction vise un résultat fonctionnel reproductible. FacturaDJ réduit les variations en fixant ses principales entrées : le commit (SHA), les images de base (digest), les dépendances Python (lock avec empreintes) et Node (`package-lock.json`).

<a id="securite-et-resilience"></a>

#### Sécurité et résilience

La **sécurité** repose sur la défense en profondeur et le moindre privilège ([chapitre 14](#chapitre-14)). La **résilience** est la capacité à encaisser une panne et à s'en remettre ; elle ne se confond ni avec la haute disponibilité, ni avec la sauvegarde ([chapitre 15](#chapitre-15)).

<a id="section-1-4"></a>

### 1.4 Le principe directeur : des portes humaines

L'infrastructure active de FacturaDJ applique une règle simple : **rien n'est construit, publié ou déployé sans une décision humaine explicite.** Chaque crochet ci-dessous représente une porte :

```text
 commit ─► [revue PR] ─► [transfert GitLab] ─► [build] ─► [scan] ─► [push Harbor]
                                                                          │
                                                                          ▼
 application ◄── [sync Argo CD] ◄── [MR GitOps approuvée] ◄── proposition GitOps
```

Pourquoi ce choix, alors que l'étude d'août proposait une chaîne entièrement automatique ?

- La plateforme est jeune et manipule des données comptables.
- L'équipe d'exploitation est réduite : chaque étape doit être comprise avant d'être automatisée.
- Une automatisation mal maîtrisée propage une erreur plus vite qu'un humain.
- Les portes manuelles sont un point de départ ; l'automatisation viendra étape par étape, quand chaque étape sera fiable.

> **Attention** — Dans ce contexte, le déploiement **reste sous contrôle manuel** tant que cette décision n'a pas été révisée explicitement. Aucune procédure de ce manuel n'autorise l'activation de la synchronisation automatique d'Argo CD.

> **Attention** — Dans GitLab, `when: manual` rend un job déclenchable à la main, mais **ne restreint pas qui peut le déclencher**. L'autorisation vient des *environnements protégés* et des droits sur le projet (voir [6.5](#section-6-5)).

<a id="section-1-5"></a>

### 1.5 Ce qui est actif et ce qui ne l'est pas

| Domaine | Actif (PREPROD k3d) | Archivé ou cible PROD (non implémenté) |
|---|---|---|
| Images | `infra/docker/{backend,frontend}/Dockerfile` pilotés par `infra/packer/{backend,frontend}.pkr.hcl` | Recettes FCOS, Rocky et Debian, entièrement commentées |
| Registry | Harbor `harbor.nexora-djibouti.fr/facturadj` | GHCR `ghcr.io/OWNER/...` |
| Kubernetes | `infra/k8s/k3d`, `infra/k8s/overlays/preprod`, `infra/k8s/operations` | `infra/k8s/base`, `infra/k8s/overlays/prod`, `infra/k8s/cert-manager` (OKD) |
| Argo CD | `infra/argocd/facturadj-preprod.yaml`, namespace `argocd` | `infra/argocd/application.yaml` (vidé), namespace `openshift-gitops` |
| CI | `.github/workflows/dev.yml`, `packer.yml`, `.gitlab-ci.yml` | Chaîne GitHub automatique avec Cosign, SonarQube, commit GitOps automatique |
| Infrastructure | VPS existant, k3d | `infra/terraform` (Hetzner), `infra/butane`, `infra/packer/ansible` |
| Base de données | StatefulSet `facturadj-postgres` | CloudNativePG `facturadj-db` |
| Secrets | Fichiers hors dépôt + `kubectl create secret` | Vault/OpenBao + External Secrets, ou Sealed Secrets |
| Certificats | Secret `facturadj-tls` créé à la main | cert-manager et Let's Encrypt |
<a id="mise-en-pratique--chapitre-1"></a>

### Mise en pratique — chapitre 1

**Relier un choix technique à un besoin métier.** Une facture doit rester retrouvable après une panne. PostgreSQL conserve les enregistrements ; le volume conserve les fichiers ; une sauvegarde externe protège de la perte du VPS. Le premier exercice consiste à nommer la donnée à protéger avant de choisir l'outil. **Contrôle :** citer la sauvegarde et son dernier test, pas seulement le nom du serveur.

<a id="synthese-du-chapitre-1"></a>

#### Synthèse du chapitre 1

**À retenir**

- Deux programmes (Astro SSR, Django DRF) et deux services de données (PostgreSQL, Redis). Le navigateur ne parle **jamais** directement au backend.
- Les données sont comptables : la perte d'une facture ou une numérotation qui repart à zéro engage la responsabilité de l'entreprise, pas seulement celle de l'exploitant.
- Sept objectifs : reproductible, traçable, sûr par défaut, contrôlé, réversible, évolutif, protecteur des données. Chaque chapitre de ce manuel sert au moins l'un d'eux.
- Les décisions de livraison D1 à D8 sont décrites dans le cadre de référence. Les contrôles automatiques ne remplacent pas la revue et la décision de déploiement.
- Le tableau [1.5](#section-1-5) est votre garde-fou permanent contre la confusion des deux générations de documentation.

**Les pièges classiques**

| Le piège | Pourquoi on tombe dedans | Le bon réflexe |
|---|---|---|
| Exécuter une commande de l'étude OKD sur la PREPROD | Les deux architectures coexistent dans le dépôt et se ressemblent | `oc`, `hcloud`, `tofu`, `ghcr.io` : c'est l'étude d'août. Vérifier [1.5](#section-1-5) |
| Croire que `when: manual` restreint **qui** peut déclencher un job | Le mot « manual » évoque un contrôle d'accès | `when: manual` rend le job déclenchable ; l'autorisation vient des environnements protégés ([6.5](#section-6-5)) |
| Considérer les portes humaines comme une lenteur à supprimer | L'automatisation totale paraît plus moderne | Elles sont un point de départ assumé. Les lever est une décision de gouvernance, pas un réglage technique |

**Vérifiez votre compréhension**

1. Pourquoi le navigateur ne s'adresse-t-il jamais directement à Django ? *(→ [1.1](#section-1-1), [2.4](#section-2-4))*
2. Citez trois des décisions humaines de livraison de la chaîne. *(→ [1.4](#section-1-4))*
3. Vous trouvez une commande contenant `ghcr.io/OWNER/facturadj-backend`. Est-elle exécutable sur la PREPROD ? *(→ [1.5](#section-1-5))*

> **Réponses** — **1.** Parce que le frontend Astro joue le rôle de *Backend For Frontend* : il gère la session, appelle l'API en HTTP interne et n'expose jamais Django publiquement. **2.** Parmi : revue de la Pull Request, transfert du SHA vers GitLab, décision de construction, publication dans Harbor, fusion de la Merge Request GitOps, synchronisation Argo CD. **3.** Non. GHCR appartient à l'étude d'août ; la cible active publie dans le Harbor privé `harbor.nexora-djibouti.fr/facturadj`.

**Où aller ensuite** — Le [chapitre 2](#chapitre-02) déroule le chemin complet, du commit jusqu'au Pod, et donne la carte du dépôt.

<a id="chapitre-02"></a>

## 2. Architecture générale

> **En une phrase** — L'architecture relie deux applications, leurs données et une chaîne de livraison ; chaque composant a un rôle et des accès précis.

**Ce que vous saurez faire à la fin de ce chapitre**

1. Redessiner de mémoire le chemin complet d'une release, de la Pull Request à la synchronisation.
2. Dire quel composant parle à quel autre, avec quel protocole.
3. Expliquer le modèle BFF et ce qu'il protège.
4. Savoir sur quelle machine exécuter une commande donnée.
5. Ouvrir le dépôt et dire d'un fichier s'il est actif, compatible ou archivé.

**Prérequis** — [chapitre 1](#chapitre-01) · **Lecture** — 10 min · **Nature** — documentation d'architecture, à relire avant chaque release

<a id="section-2-1"></a>

### 2.1 Vue d'ensemble

Le schéma suivant montre le chemin complet, du développeur jusqu'à l'application en préproduction. Les chapitres suivants zooment sur chaque étage.

```text
                    ARCHITECTURE GLOBALE FACTURADJ (cible active)

  Développeur
      │  commit, Pull Request
      ▼
  GitHub (DEV) ── contrôles : lint, tests PostgreSQL, audits, build Astro
      │  SHA fusionné sur main
      ▼
  Validation humaine (Admin DevOps)
      │  git push <SHA>:main
      ▼
  GitLab, miroir applicatif (PREPROD)
      │  construction décidée
      ▼
  Packer ──► Docker BuildKit ──┬──► image frontend (Astro SSR)
      │                        └──► image backend (Django DRF)
      │  tests locaux, scan Trivy, SBOM
      ▼
  Harbor (registry privée) : frontend@sha256:…  backend@sha256:…
      │  reçu des deux digests
      ▼
  GitLab, dépôt GitOps distinct ── Merge Request approuvée
      │  état souhaité
      ▼
   Argo CD ── diff ──► synchronisation MANUELLE
      │
      ▼
  k3d / Kubernetes (VPS, namespace facturadj-preprod)
      │
      ▼
  Traefik (HTTPS) ──► Frontend Astro ──► Backend Django ──┬──► PostgreSQL 17
                                                          └──► Redis 7
```

<a id="section-2-2"></a>

### 2.2 Les composants et leur rôle

| Composant | Rôle en une phrase | Où il s'exécute | Analogie | Détails |
|---|---|---|---|---|
| **Frontend Astro SSR** | Rend les pages côté serveur et appelle l'API | Pod k3d, port 4321 | Le guichet d'accueil | [Ch. 5](#chapitre-05) |
| **Backend Django DRF** | Logique métier et API privée | Pod k3d, port 8000 | L'arrière-boutique | [Ch. 5](#chapitre-05) |
| **PostgreSQL 17** | Données commerciales et comptables | StatefulSet k3d, volume 20 Gi | Le coffre des registres | [Ch. 13](#chapitre-13) |
| **Redis 7** | Cache partagé des compteurs anti-abus | Deployment k3d, sans persistance | Le tableau blanc commun | [Ch. 13](#chapitre-13) |
| **GitHub** | Code source, Pull Requests, contrôles DEV | Service en ligne | L'atelier | [Ch. 6](#chapitre-06) |
| **GitLab** | Miroir du code approuvé, dépôt GitOps, pipeline PREPROD | Instance GitLab et runner Debian dédié | Le bureau des validations | [Ch. 6](#chapitre-06), [8](#chapitre-08) |
| **Packer 1.15.3** | Point d'entrée unique de construction des deux images | VM DEV ou runner GitLab | L'usine | [Ch. 4](#chapitre-04) |
| **Docker et BuildKit** | Exécute les Dockerfiles multi-étapes | VM DEV ou runner GitLab | La chaîne de montage | [Ch. 5](#chapitre-05) |
| **Trivy, Hadolint** | Scan de vulnérabilités, SBOM, lint des Dockerfiles | VM DEV ou runner GitLab | Le contrôle qualité | [Ch. 14](#chapitre-14) |
| **Harbor** | Registry privée des images versionnées | `harbor.nexora-djibouti.fr` | L'entrepôt sécurisé | [Ch. 7](#chapitre-07) |
| **Kubernetes (k3s dans k3d)** | Démarre, surveille et relie les conteneurs | VPS `nexora-vps` | Le chef d'orchestre | [Ch. 9](#chapitre-09) |
| **Argo CD** | Compare Git et le cluster, synchronise sur demande | Namespace `argocd` | L'inspecteur de conformité | [Ch. 10](#chapitre-10) |
| **Traefik** | Point d'entrée HTTP(S) du cluster, terminaison TLS | Intégré à k3s (`kube-system`) | Le portier | [Ch. 11](#chapitre-11) |
| **DNS et TLS** | Nom public et chiffrement du trafic | Zone DNS, Secret `facturadj-tls` | L'annuaire et l'enveloppe scellée | [Ch. 11](#chapitre-11) |
| **Stockage** | Volumes persistants sur le disque du nœud | StorageClass `local-path` | Le casier sur place | [Ch. 12](#chapitre-12) |
| **Observabilité** | Sondes, journaux, événements ; métriques et alertes en cible | Kubernetes, puis Prometheus et Loki | Le tableau de bord | [Ch. 16](#chapitre-16) |

<a id="section-2-3"></a>

### 2.3 Comment les composants communiquent

L'architecture se comprend mieux en quatre flux successifs.

**Flux 1 — Développement.** Le code est écrit et vérifié côté GitHub.

```text
                     DÉVELOPPEMENT

Développeur
    │
    ▼
GitHub DEV
    │
    ├── Pull Request
    ├── Tests (Django sur PostgreSQL, build Astro)
    ├── Lint (ruff)
    └── Scans (pip-audit, bandit, npm audit)
    │
    ▼
Validation Admin DevOps
    │
    ▼
GitLab PREPROD (miroir applicatif)
```

**Flux 2 — Construction.** Le code approuvé devient deux images publiées.

```text
                        BUILD

GitLab (ou VM DEV)
   │
   ▼
Packer ──► Docker BuildKit
   │
   ├──────────────┐
   ▼              ▼
Frontend       Backend
   │              │
   └──────┬───────┘
          ▼
  tests + scan Trivy
          │
          ▼
        Harbor
```

**Flux 3 — GitOps.** Les digests publiés sont promus par une Merge Request, puis appliqués sur décision.

```text
                    GITOPS

GitLab GitOps
     │
     ▼
   Argo CD
     │
     ▼
    k3d
     │
 ┌───┴────┐
 ▼        ▼
Astro   Django
```

**Flux 4 — Requête d'un utilisateur.** Détaillé au [chapitre 11](#chapitre-11).

```text
Utilisateur ──► DNS ──► VPS ──► Traefik ──► Service frontend ──► Pod Astro
                                                                     │
                                                                     ▼
                                             Service backend ──► Pod Django
                                                                     │
                                                          ┌──────────┴──────────┐
                                                          ▼                     ▼
                                                     PostgreSQL               Redis
```

**Matrice des communications autorisées.**

| Source | Destination | Protocole | Authentification | Détails |
|---|---|---|---|---|
| Développeur | GitHub | HTTPS ou SSH Git | Compte personnel, revue de PR | [Ch. 6](#chapitre-06) |
| Admin DevOps | GitLab miroir | Git | Compte administrateur, URL sans jeton | [6.4](#section-6-4) |
| VM DEV ou runner | Harbor | HTTPS 443 | Robot de publication | [Ch. 7](#chapitre-07) |
| Argo CD | GitLab GitOps | HTTPS ou SSH | Accès en lecture seule | [Ch. 10](#chapitre-10) |
| Cluster k3d | Harbor | HTTPS 443 | Robot de lecture, Secret `harbor-pull` | [Ch. 7](#chapitre-07) |
| Navigateur | Traefik | HTTPS 443 | Session applicative | [Ch. 11](#chapitre-11) |
| Traefik | Frontend | HTTP 4321 | NetworkPolicy `ingress-traefik` | [11.6](#section-11-6) |
| Frontend | Backend | HTTP 8000 | JWT applicatif, NetworkPolicy | [11.6](#section-11-6) |
| Backend | PostgreSQL, Redis | TCP 5432, 6379 | Mot de passe PostgreSQL ; Redis sans mot de passe | [Ch. 13](#chapitre-13) |
| Tous les Pods | DNS du cluster | UDP et TCP 53 | NetworkPolicy `dns` | [11.6](#section-11-6) |

Et ce qui n'existe **jamais** :

- La CI (GitHub ou GitLab) n'a aucun accès au cluster Kubernetes, au VPS ou à Argo CD.
- Internet ne peut joindre ni le backend, ni PostgreSQL, ni Redis.
- Les Pods n'ont aucune sortie vers Internet en PREPROD : l'envoi de courriels et le stockage S3 sont désactivés.

<a id="section-2-4"></a>

### 2.4 Le modèle BFF : pourquoi Django n'est pas exposé

Dans le modèle *Backend For Frontend*, seul le frontend Astro est publié. Le backend Django n'a ni Ingress, ni adresse publique. Un attaquant ne peut atteindre l'API qu'en compromettant d'abord le frontend.

Conséquences :

- l'interface d'administration Django et la documentation Swagger ne sont pas accessibles depuis Internet ; elles sont de plus conditionnées à `DEBUG`, et `DEBUG` est **refusé** par l'image backend ;
- le trafic Astro → Django reste en HTTP à l'intérieur du cluster, protégé par les NetworkPolicies ; le chiffrement TLS s'arrête à Traefik ;
- les cookies de session sont gérés par Astro, qui vérifie l'origine des requêtes POST en production (`checkOrigin`).

> **À retenir** — Cet avantage n'existe que si personne n'ajoute un Ingress vers le backend. Toute demande d'exposition directe de Django doit être refusée et redirigée vers un besoin fonctionnel côté frontend.

<a id="section-2-5"></a>

### 2.5 Machines, accès et rôles

| Machine | Alias SSH | Rôle | Ce qui s'y exécute |
|---|---|---|---|
| Poste Windows | — | Édition des fichiers, copies SCP | Copie de travail `C:\Users\douks\Documents\Formation\FACTURADJ\facturaDJ`. Son dossier `.git` est inexploitable : les opérations Git se font sur la VM DEV |
| VM DEV (Debian, Vagrant) | `odoo` | Clone Git de référence, construction et tests des images | Git, Packer, Docker et Buildx, Docker Compose, Trivy, Hadolint, Python 3 et PyYAML. Chemin retenu : `~/FACTURADJ/facturaDJ` |
| VPS PREPROD | `nexora-vps` | Cluster k3d de préproduction | k3d, k3s, Traefik, Argo CD, kubectl |
| Harbor | — | Registry privée | `https://harbor.nexora-djibouti.fr`, projet `facturadj` |
| Runner GitLab | — | Exécution du pipeline PREPROD | Runner *shell* Debian dédié et protégé, tag `facturadj-preprod` |
| Machine d'administration | — | Détient le clone GitOps et le kubeconfig PREPROD | Peut être le VPS lui-même après un clone manuel |

> **Note** — La démonstration historique tourne encore sur les VM `odoo` (backend en service systemd) et `rancher` (frontend en `astro dev`), exposées par des tunnels ngrok et adossées à SQLite. Cet environnement de démonstration est **hors** de la chaîne industrialisée décrite ici.

> **À valider** — Le chemin `~/FACTURADJ/facturaDJ` du clone DEV n'a jamais été vérifié par connexion. Le confirmer avec `ssh odoo 'cd ~/FACTURADJ/facturaDJ && pwd && git status --short'` avant toute copie.

<a id="section-2-6"></a>

### 2.6 Carte du dépôt

Les fichiers d'infrastructure se répartissent entre actifs, compatibles et archivés. Un fichier **archivé** est conservé pour mémoire et ne doit pas être exécuté.

```text
facturaDJ/
├── .github/workflows/
│   ├── dev.yml                   ACTIF    contrôles DEV (= infra/ci/github-actions-app.yml)
│   └── packer.yml                ACTIF    syntaxe Packer (= infra/ci/github-actions-packer.yml)
├── .gitlab-ci.yml                ACTIF    pipeline PREPROD à portes manuelles
├── .dockerignore                 ACTIF    liste blanche du contexte Docker
├── .gitattributes                ACTIF    fins de ligne LF pour .sh, .pkr.hcl, Dockerfile, YAML
├── backend/
│   ├── requirements-container.in ACTIF    dépendances de l'image (psycopg, gunicorn, redis)
│   ├── requirements.lock         À CRÉER  lock Linux/Python 3.12 avec empreintes
│   └── config/
│       ├── container_settings.py ACTIF    réglages imposés dans l'image
│       ├── ci_settings.py        ACTIF    tests sur PostgreSQL en CI
│       └── health.py             ACTIF    sondes /healthz/ et /readyz/
├── frontend/src/pages/
│   ├── healthz.ts                ACTIF    sonde de vivacité Astro
│   └── readyz.ts                 ACTIF    sonde d'aptitude Astro
└── infra/
    ├── argocd/
    │   ├── facturadj-preprod.yaml   ACTIF    AppProject et Application, sans auto-sync
    │   └── application.yaml         INACTIF  ancien manifeste OKD vidé
    ├── ci/
    │   ├── check_static.py          ACTIF    validation statique
    │   ├── images.sh                ACTIF    build | bundle | scan | push
    │   ├── prepare_gitops.py        ACTIF    proposition GitOps à partir du reçu
    │   └── github-actions-*.yml     ACTIF    modèles des workflows GitHub
    ├── docker/
    │   ├── backend/Dockerfile       ACTIF
    │   ├── frontend/Dockerfile      ACTIF
    │   ├── entrypoint-backend.sh    ACTIF
    │   ├── compose.smoke.yaml       ACTIF    test local jetable
    │   ├── Dockerfile.backend       COMPAT   copie identique, ancien chemin
    │   ├── Dockerfile.frontend      COMPAT   copie identique, ancien chemin
    │   └── .dockerignore            RÉFÉRENCE  le fichier lu est celui de la racine
    ├── k8s/
    │   ├── k3d/                     ACTIF    ressources PREPROD
    │   ├── overlays/preprod/        ACTIF    namespace et digests
    │   ├── operations/              ACTIF    namespace et Job de migration, hors Argo CD
    │   ├── base/                    ARCHIVÉ  cible OKD
    │   ├── overlays/prod/           ARCHIVÉ  cible OKD
    │   └── cert-manager/            ARCHIVÉ  cible OKD
    ├── packer/
    │   ├── frontend.pkr.hcl         ACTIF
    │   ├── backend.pkr.hcl          ACTIF
    │   ├── variables.pkr.hcl        ACTIF
    │   ├── locals.pkr.hcl           ACTIF
    │   ├── versions.pkr.hcl         ACTIF
    │   ├── scripts/build-app-image.sh   ACTIF
    │   ├── fcos-okd.pkr.hcl         INACTIF  entièrement commenté
    │   ├── bastion-rocky.pkr.hcl    INACTIF  entièrement commenté
    │   ├── debian.pkr.hcl           INACTIF  entièrement commenté
    │   └── archives/, ansible/, tests/, files/, scripts/00..99-*.sh   ARCHIVÉ
    ├── butane/                      ARCHIVÉ  cible OKD
    ├── terraform/                   ARCHIVÉ  cible Hetzner
    ├── patches/README.md            HISTORIQUE  correctifs applicatifs, en grande partie intégrés
    └── docs/                        documents sources et ce manuel
```

> **Note** — Packer charge **tous** les fichiers `*.pkr.hcl` d'un dossier. C'est pourquoi les anciennes recettes sont entièrement commentées plutôt que simplement ignorées ; `check_static.py` vérifie qu'aucune ligne active n'y subsiste.
<a id="mise-en-pratique--chapitre-2"></a>

### Mise en pratique — chapitre 2

**Séparer les flux de service et de livraison.** Un utilisateur qui consulte une facture ne passe ni par GitHub ni par Packer. Ces outils servent à fabriquer et livrer l'application. Sa requête passe par Traefik, Astro, Django et les données. **Exercice :** dessiner ces deux chemins avec des couleurs différentes et identifier les accès d'administration séparément.

<a id="synthese-du-chapitre-2"></a>

#### Synthèse du chapitre 2

**À retenir**

- Le chemin est toujours le même : GitHub (revue) → GitLab miroir (transfert d'un SHA) → Packer et Docker (construction) → Harbor (publication) → GitLab GitOps (promotion) → Argo CD (synchronisation).
- Trois machines, trois rôles : la **VM DEV** construit, le **VPS** héberge le cluster k3d, la **machine d'administration** porte le clone GitOps, le kubeconfig et la CLI `argocd`.
- Le modèle BFF n'est pas un détail d'organisation : c'est ce qui permet de ne jamais exposer Django ni la base sur Internet.
- La carte du dépôt classe chaque fichier en **ACTIF**, **COMPAT**, **INACTIF**, **ARCHIVÉ** ou **HISTORIQUE**. Un fichier archivé est de la documentation, pas une procédure.

**Les pièges classiques**

| Le piège | Pourquoi on tombe dedans | Le bon réflexe |
|---|---|---|
| Appliquer `infra/k8s/base` ou `infra/k8s/overlays/prod` | Les noms suggèrent une base commune et une production réelle | Ce sont des reliquats de l'étude OKD. La PREPROD utilise `infra/k8s/k3d` et `overlays/preprod` |
| Renommer une ancienne recette Packer au lieu de la commenter | On croit qu'un fichier non référencé est ignoré | Packer charge **tous** les `*.pkr.hcl` du dossier. D'où le commentaire intégral, vérifié par `check_static.py` |
| Lancer une commande depuis la mauvaise machine | Les trois machines ont le même dépôt | Se demander avant chaque bloc : construction (VM DEV), cluster (VPS ou machine d'administration), GitOps (machine d'administration) |
| Modifier `infra/docker/Dockerfile.backend` en croyant modifier l'image | Le chemin paraît légitime | C'est une copie **COMPAT** de l'ancien chemin ; la source est `infra/docker/backend/Dockerfile`, et `check_static.py` vérifie que les deux restent identiques |

**Vérifiez votre compréhension**

1. Sur quelle machine lance-t-on `packer build`, et pourquoi pas ailleurs ? *(→ [2.5](#section-2-5), [4.6](#section-4-6))*
2. Pourquoi les anciennes recettes Packer sont-elles entièrement commentées plutôt que supprimées ou renommées ? *(→ [2.6](#section-2-6))*
3. Que signifie l'étiquette **COMPAT** dans la carte du dépôt ? *(→ [2.6](#section-2-6))*

> **Réponses** — **1.** Sur la VM DEV (ou le runner GitLab), parce que le builder `null` n'alloue aucune ressource : le provisioner `shell-local` s'exécute sur la machine qui lance la commande, où Docker et Buildx doivent être installés. **2.** Parce que Packer charge tous les fichiers `*.pkr.hcl` d'un dossier : un fichier présent mais non commenté serait évalué. Les supprimer ferait perdre la mémoire de l'étude. **3.** Une copie strictement identique conservée à un ancien chemin, pour ne pas casser des références existantes.

**Où aller ensuite** — Le [chapitre 3](#chapitre-03) précise ce qui distingue DEV, PREPROD et PROD, et ce qui reste rigoureusement identique entre elles.

<a id="chapitre-03"></a>

## 3. Environnements

> **En une phrase** — Les environnements séparent les usages, données et secrets ; la promotion conserve les images validées.

**Ce que vous saurez faire à la fin de ce chapitre**

1. Distinguer DEV, PREPROD et PROD sur huit critères, dont les données et l'exposition.
2. Expliquer le principe « construire une fois, promouvoir partout » et ce qu'il interdit.
3. Dire où est défini chaque paramètre variable, et pourquoi il varie.
4. Énoncer les règles de circulation des données entre environnements.

**Prérequis** — [chapitres 1](#chapitre-01) et [2](#chapitre-02) · **Lecture** — 5 min · **Nature** — architecture et règles d'exploitation

<a id="section-3-1"></a>

### 3.1 Trois environnements, trois rôles

Un **environnement** est une instance complète de l'application, avec sa configuration, ses données et son niveau d'exigence.

| | DEV | PREPROD | PROD (éventuelle) |
|---|---|---|---|
| **Rôle** | Développer et vérifier vite | Valider une release dans des conditions proches de la production | Servir les clients |
| **Où** | Poste Windows, VM `odoo`, GitHub | VPS `nexora-vps`, cluster k3d, namespace `facturadj-preprod` | À décider, voir [chapitre 22](#chapitre-22) |
| **Version du code** | Branches `feature/*`, Pull Requests | SHA approuvé, transféré sur GitLab | Même digest que la PREPROD validée |
| **Base de données** | SQLite (démonstration), PostgreSQL éphémère en CI | PostgreSQL 17, une instance | PostgreSQL hautement disponible |
| **Données** | Fictives, jeu de démonstration possible | Comptes de recette ; jamais de jeu de démonstration, jamais de copie DEV | Réelles |
| **Déploiement** | Manuel | Argo CD, synchronisation manuelle | GitOps et approbation |
| **Disponibilité** | Aucune garantie | Aucune garantie de haute disponibilité | Objectifs RPO et RTO contractualisés |
| **Exposition** | Tunnels ngrok (démonstration) | HTTPS via Traefik, accès public fermé jusqu'à validation | Domaine public, protection WAF |
| **Secrets** | Valeurs de développement | Fichiers hors dépôt, robots Harbor dédiés | Coffre-fort, rotation, audit |

<a id="section-3-2"></a>

### 3.2 La même image, une configuration différente

Le principe **« construire une fois, promouvoir partout »** interdit de reconstruire une image par environnement. Ce qui change est injecté **au démarrage** du conteneur :

| Paramètre | Où il est défini en PREPROD | Pourquoi il varie |
|---|---|---|
| Nom de domaine public | `infra/k8s/k3d/ingress.yaml` | Chaque environnement a son adresse |
| `PUBLIC_FRONTEND_URL`, `CSRF_TRUSTED_ORIGINS` | ConfigMap `facturadj-config` | Suivent le domaine |
| `DJANGO_ALLOWED_HOSTS` | ConfigMap `facturadj-config` | Noms internes du cluster |
| `DATABASE_URL`, `DJANGO_SECRET_KEY` | Secret `facturadj-backend` | Secrets propres à l'environnement |
| `API_URL` | Variable du Deployment frontend | Adresse interne du backend |
| Nombre de réplicas, ressources | Deployments | Dimensionnement |
| `USE_S3`, `EMAIL_BACKEND` | ConfigMap `facturadj-config` | Services externes activés ou non |

Aucun fichier `.env` n'entre dans une image, et le frontend lit `API_URL` à l'exécution : l'artefact validé en PREPROD est **octet pour octet** celui qui partira en production.

<a id="section-3-3"></a>

### 3.3 Le chemin de promotion

```text
 feature/* ──PR──► main GitHub ──SHA approuvé──► main GitLab (miroir)
                                                        │
                                                        ▼
                                       images sha-<SHA> publiées dans Harbor
                                                        │
                                                        ▼
                                   MR promote/sha-<SHA> dans GitLab GitOps
                                                        │
                                                        ▼
                                          Argo CD, sync manuel ──► PREPROD
                                                        │
                                                        ▼
                               (plus tard) même digest ──► PROD après validation
```

<a id="section-3-4"></a>

### 3.4 Règles de données entre environnements

- Aucune base DEV n'est copiée en PREPROD. Le test local utilise des volumes dédiés et jetables.
- La commande `seed_demo` n'est **jamais** exécutée en préproduction.
- Les comptes de démonstration historiques, dont les identifiants sont connus, doivent être supprimés avant toute ouverture d'un environnement à des utilisateurs.
- Les journaux applicatifs peuvent contenir des données personnelles ou comptables : ils se lisent sur place et ne se publient pas sans examen.
- Les secrets de test (smoke) sont générés aléatoirement et ne servent qu'au test local.
<a id="mise-en-pratique--chapitre-3"></a>

### Mise en pratique — chapitre 3

**Promouvoir la même image.** Une image frontend a été validée avec un domaine de recette. Pour un autre environnement, changer le domaine et l'adresse d'API à l'exécution sans reconstruire l'image. **Contrôle :** son digest reste identique, tandis que le commit de configuration change. Les données et secrets appartiennent toujours à l'environnement destinataire.

<a id="synthese-du-chapitre-3"></a>

#### Synthèse du chapitre 3

**À retenir**

- L'artefact validé en PREPROD est **octet pour octet** celui qui partira en production. C'est ce qui donne un sens à la validation.
- Aucun fichier `.env` n'entre dans une image. Le frontend lit `API_URL` **à l'exécution**, pas à la compilation.
- Ce qui varie est rangé à trois endroits : la ConfigMap `facturadj-config` (non secret), le Secret `facturadj-backend` (secret), les Deployments (dimensionnement et adresse interne).
- Les données ne remontent jamais : aucune base DEV en PREPROD, aucun `seed_demo` en préproduction, aucun compte de démonstration laissé en place avant ouverture à des utilisateurs.

**Les pièges classiques**

| Le piège | Pourquoi on tombe dedans | Le bon réflexe |
|---|---|---|
| Reconstruire l'image « pour la PREPROD » avec d'autres variables | C'est l'habitude des chaînes classiques | Une reconstruction produit un autre digest : ce qui tourne n'est plus ce qui a été validé |
| Copier la base DEV en PREPROD pour « avoir des données » | Cela va plus vite que de créer un jeu de recette | Les données DEV contiennent des comptes de démonstration et des identifiants connus. Utiliser des comptes de recette |
| Coller des journaux de PREPROD dans un ticket | On veut de l'aide rapidement | Ils peuvent contenir des données personnelles ou comptables : les lire sur place, les examiner avant tout partage |

**Vérifiez votre compréhension**

1. Où est définie `API_URL`, et pourquoi ne pas la figer dans l'image ? *(→ [3.2](#section-3-2))*
2. Citez deux règles de circulation des données entre environnements. *(→ [3.4](#section-3-4))*
3. Quelle garantie perd-on si l'on reconstruit l'image entre la PREPROD et la PROD ? *(→ [3.2](#section-3-2), [3.3](#section-3-3))*

> **Réponses** — **1.** Dans une variable d'environnement du Deployment frontend, lue à l'exécution : figer l'adresse du backend dans l'image obligerait à construire une image par environnement. **2.** Parmi : aucune base DEV copiée en PREPROD, `seed_demo` jamais exécuté en préproduction, comptes de démonstration supprimés avant toute ouverture, journaux examinés avant partage, secrets de test aléatoires et limités au test local. **3.** On perd la certitude que le code testé est celui qui tourne : le digest change, et la validation ne porte plus sur l'artefact déployé.

**Où aller ensuite** — La Partie II commence par le [chapitre 4](#chapitre-04). Si Docker vous est inconnu, lisez d'abord [5.1 Docker en huit notions](#section-5-1).

<!-- PARTIE: Partie II — Construire -->

<a id="chapitre-04"></a>

## 4. Golden Images avec Packer

> **En une phrase** — Packer organise la construction des images applicatives, en confiant leur fabrication aux Dockerfiles.

**Ce que vous saurez faire à la fin de ce chapitre**

1. Distinguer les trois sens du mot « Golden Image » et employer le bon terme.
2. Expliquer pourquoi le builder retenu est `null` et ce que cela implique pour la machine qui construit.
3. Lire un template HCL : `packer`, `variable`, `locals`, `source`, `build`, `provisioner`, `post-processor`.
4. Énumérer ce que Packer **ne fait pas** ici : pas de VM, pas de SSH, pas d'authentification, pas de publication, pas de déploiement.
5. Enchaîner `packer fmt`, `packer validate`, `packer inspect`, puis `packer build` en connaissant les effets de chacun.

**Prérequis** — [chapitre 2](#chapitre-02) ; les notions Docker de [5.1](#section-5-1) si elles ne vous sont pas familières · **Lecture** — 16 min · **Nature** — cours puis référence technique

<a id="section-4-1"></a>

### 4.1 Qu'est-ce qu'une Golden Image ?

Une **Golden Image** (image de référence) est un modèle préparé une fois, testé, versionné, à partir duquel on crée toutes les instances identiques d'un système. Personne ne vient ensuite configurer les instances à la main : si quelque chose doit changer, on fabrique une nouvelle version de l'image.

> **Analogie — l'usine** — Packer peut être comparé à une usine qui fabrique toujours le même produit à partir d'un plan précis.

```text
Configuration Packer (HCL)
        =
Plan de fabrication

Scripts appelés par Packer
        =
Instructions d'assemblage

Golden Image
        =
Produit final standardisé, numéroté

Nouvelle version
        =
Nouveau lot : on ne répare pas un produit déjà livré
```

Bénéfices attendus :

- **cohérence** : toutes les instances démarrent à l'identique ;
- **vitesse** : l'installation est faite une fois, au moment de la construction ;
- **sécurité** : l'image est durcie, testée et scannée avant d'être utilisée ;
- **traçabilité** : chaque instance sait de quelle version elle provient ;
- **retour arrière** : l'ancienne version reste disponible.

<a id="section-4-2"></a>

### 4.2 Trois notions à ne pas confondre

Le terme « Golden Image » recouvre plusieurs réalités. Les documents sources l'utilisent dans deux sens différents, d'où ce tableau.

| | Golden Image de machine | Golden Container Image (image de base) | Image applicative |
|---|---|---|---|
| **Contient** | Système complet : noyau, services, agents | Système minimal et un runtime (Python 3.12, Node 22) | Image de base, dépendances verrouillées et code FacturaDJ |
| **Format** | Snapshot de fournisseur, QCOW2, AMI | OCI | OCI |
| **Démarre** | Une machine virtuelle | Jamais seule : elle sert de fondation | Un conteneur, donc un Pod Kubernetes |
| **Exemple FacturaDJ** | Fedora CoreOS et Rocky Linux de l'étude OKD (archivé) | `python:3.12-slim-bookworm@sha256:…`, `node:22-bookworm-slim@sha256:…` | `harbor.nexora-djibouti.fr/facturadj/backend:sha-<SHA>` |
| **Qui la fabrique** | Packer, avec un builder de machine | L'éditeur amont (images officielles Docker) ; FacturaDJ la **sélectionne** par digest | Packer, qui pilote Docker BuildKit |
| **Rythme** | Mensuel ou sur correctif | À chaque correctif de sécurité amont | À chaque release |

> **Note — terminologie** — Dans les sources de septembre, « Golden Images Docker » désigne les **deux images applicatives** frontend et backend construites par Packer. Elles jouent bien le rôle de Golden Image au niveau applicatif : un artefact unique, testé, scanné, immuable, promu tel quel. Pour éviter toute ambiguïté, ce manuel parle d'**image de base** pour la fondation choisie par digest, et d'**image applicative** pour ce que FacturaDJ construit.

```text
  Golden Container Image (image de base approuvée, fixée par digest)
  python:3.12-slim-bookworm@sha256:…      node:22-bookworm-slim@sha256:…
                 │                                   │
                 ▼                                   ▼
        + backend/requirements.lock         + frontend/package-lock.json
        + code backend/                     + code frontend/ compilé par Astro
                 │                                   │
                 ▼                                   ▼
  Image applicative backend            Image applicative frontend
  facturadj/backend:sha-<SHA>          facturadj/frontend:sha-<SHA>
                 │                                   │
                 └─────────────────┬─────────────────┘
                                   ▼
                                Harbor
```

<a id="section-4-3"></a>

### 4.3 OCI en deux minutes

**OCI** (*Open Container Initiative*) est l'ensemble de standards ouverts qui décrit les conteneurs :

- **image-spec** : le format d'une image ;
- **distribution-spec** : l'API d'une registry pour pousser et tirer des images ;
- **runtime-spec** : la façon d'exécuter un conteneur.

Grâce à ces standards, une image construite par Docker sur la VM DEV est stockée par Harbor et exécutée par containerd dans k3s, sans conversion.

```text
Image OCI
├── manifeste (JSON)      son empreinte sha256 est le DIGEST de l'image
├── configuration (JSON)  USER, EXPOSE, ENTRYPOINT, labels org.opencontainers.image.*
└── couches (layers)      archives de fichiers empilées, chacune identifiée par sha256
```

Les Dockerfiles FacturaDJ posent trois labels OCI standard. Le label `revision` est contrôlé avant la publication (`images.sh push` refuse une image dont la révision ne correspond pas au commit approuvé).

| Label | Valeur |
|---|---|
| `org.opencontainers.image.title` | `facturadj-backend` ou `facturadj-frontend` |
| `org.opencontainers.image.version` | `$TAG`, par exemple `sha-3f2c…` |
| `org.opencontainers.image.revision` | `$SOURCE_REV`, le SHA Git complet |

<a id="section-4-4"></a>

### 4.4 Pourquoi Packer, et ce qu'il fait ici

**Packer** est un outil de HashiCorp qui fabrique des images à partir d'un fichier de configuration écrit en HCL. Il est surtout connu pour produire des images de machines virtuelles, mais son modèle est générique : une *source* (où construire), des *provisioners* (quoi exécuter), des *post-processors* (que faire du résultat).

Dans FacturaDJ, Packer est le **point d'entrée unique** de construction des deux images applicatives. Il ne remplace pas Docker : il l'orchestre.

| Ce que Packer apporte | Concrètement |
|---|---|
| Une seule commande pour les deux images | `packer build -parallel-builds=1 .` |
| Des validations avant toute construction | SHA de 40 caractères, images de base fixées par digest |
| Aucune duplication de recette | Les Dockerfiles multi-étapes restent la seule description des images |
| Des artefacts déclarés | Archives `.tar`, empreintes `.sha256`, métadonnées `.image.json` |
| Un manifeste de traçabilité | `manifest-frontend.json` et `manifest-backend.json` |
| Un outil commun avec la future production | Les Golden Images de machines d'une PROD seraient aussi faites avec Packer |

Et ce que Packer **ne fait pas** dans cette cible :

- il ne démarre aucune machine virtuelle et n'ouvre aucune connexion SSH ;
- il ne s'authentifie pas auprès de Harbor et ne pousse aucune image ;
- il ne déploie rien.

> **Note** — Un outil comme `docker buildx bake` pourrait orchestrer les mêmes constructions. Le choix de Packer vise l'uniformité des validations et de la traçabilité, et prépare la fabrication d'images de machines si la production en a besoin.

<a id="section-4-5"></a>

### 4.5 Anatomie d'un template Packer HCL

HCL (*HashiCorp Configuration Language*) est un langage déclaratif lisible. Un template Packer est composé de blocs :

| Bloc | Rôle | Fichier FacturaDJ |
|---|---|---|
| `packer {}` | Version de Packer et plugins requis | `versions.pkr.hcl` |
| `variable` | Paramètre d'entrée, avec type et validation | `variables.pkr.hcl` |
| `locals` | Valeurs calculées, réutilisables | `locals.pkr.hcl` |
| `source` | Le *builder* : où et comment construire | `frontend.pkr.hcl`, `backend.pkr.hcl` |
| `build` | Assemble une source, des provisioners et des post-processors | `frontend.pkr.hcl`, `backend.pkr.hcl` |
| `provisioner` | Action exécutée pendant la construction | `shell-local` |
| `post-processor` | Action exécutée sur le résultat | `artifice`, `manifest` |

<a id="section-4-5-1"></a>

#### 4.5.1 La version de Packer

```hcl
# infra/packer/versions.pkr.hcl
# Packer orchestre Docker/BuildKit ; aucun plugin QEMU ou accès SSH.
# null, shell-local, artifice et manifest sont intégrés à Packer :
# « packer init » n'a donc aucun plugin externe à télécharger.
packer {
  required_version = ">= 1.15.3, < 2.0.0"
}
```

<a id="section-4-5-2"></a>

#### 4.5.2 Les variables et leurs validations

Les variables lisent l'environnement shell (`env("...")`) et **refusent** toute valeur imprécise. C'est la première barrière de reproductibilité.

```hcl
# infra/packer/variables.pkr.hcl — variables non secrètes
variable "source_revision" {
  type    = string
  default = env("SOURCE_REV")            # SHA du commit approuvé
  validation {
    # Exactement 40 caractères hexadécimaux : pas de branche, pas de SHA abrégé.
    condition     = can(regex("^[0-9a-f]{40}$", var.source_revision))
    error_message = "SOURCE_REV doit être le SHA Git complet approuvé."
  }
}
variable "python_image" {
  type    = string
  default = env("PYTHON_IMAGE")
  validation {
    # Python 3.12 obligatoire ET fixé par digest sha256 : un tag seul est refusé.
    condition     = can(regex("^python:3\\.12[^ @]*@sha256:[0-9a-f]{64}$", var.python_image))
    error_message = "PYTHON_IMAGE doit fixer Python 3.12 par digest."
  }
}
variable "node_image" {
  type    = string
  default = env("NODE_IMAGE")
  validation {
    condition     = can(regex("^node:22[^ @]*@sha256:[0-9a-f]{64}$", var.node_image))
    error_message = "NODE_IMAGE doit fixer Node 22 par digest."
  }
}
```

> **Note** — Les deux variables de base sont validées pour **tout** le dossier, même lorsqu'on ne construit qu'un composant avec `-only`. Il faut donc toujours exporter `PYTHON_IMAGE` et `NODE_IMAGE`.

<a id="section-4-5-3"></a>

#### 4.5.3 Les valeurs calculées

```hcl
# infra/packer/locals.pkr.hcl
locals {
  repo_root = abspath("${path.root}/../..")          # racine du dépôt, calculée depuis infra/packer
  tag       = "sha-${var.source_revision}"           # le tag est TOUJOURS dérivé du SHA
  registry  = "harbor.nexora-djibouti.fr/facturadj"  # nom de publication prévu
}
```

<a id="section-4-5-4"></a>

#### 4.5.4 Le template du frontend, commenté

Le template backend est symétrique ; seules changent les valeurs indiquées dans le tableau qui suit.

```hcl
# infra/packer/frontend.pkr.hcl
# Packer pilote le Dockerfile multi-stage existant, sans reconstruire sa logique.

source "null" "frontend" {          # builder « null » : aucune machine n'est créée
  communicator = "none"             # aucune connexion SSH ou WinRM
}

build {
  name    = "frontend"              # nom complet de la cible : frontend.null.frontend
  sources = ["source.null.frontend"]

  provisioner "shell-local" {       # exécuté sur la machine qui lance packer build
    environment_vars = [
      "REPO_ROOT=${local.repo_root}",
      "COMPONENT=frontend",
      "SOURCE_REV=${var.source_revision}",
      "TAG=${local.tag}",
      "BASE_IMAGE=${var.node_image}",
    ]
    inline = ["bash \"$REPO_ROOT/infra/packer/scripts/build-app-image.sh\""]
  }

  # Les exports Docker et leurs métadonnées deviennent des artefacts Packer.
  # Aucun post-processor docker-push : la publication est séparée, après tests et scan.
  post-processors {
    post-processor "artifice" {     # déclare les fichiers produits comme artefacts
      files = [
        "${local.repo_root}/release/frontend.tar",
        "${local.repo_root}/release/frontend.image.json",
        "${local.repo_root}/release/frontend.sha256",
      ]
    }
    post-processor "manifest" {     # écrit un reçu JSON de la construction
      output = "${path.root}/manifest-frontend.json"
      custom_data = {
        image_ref       = "${local.registry}/frontend:${local.tag}"
        source_revision = var.source_revision
        base_image      = var.node_image
        platform        = "linux/amd64"
      }
    }
  }
}
```

| Élément | Frontend | Backend |
|---|---|---|
| Cible Packer | `frontend.null.frontend` | `backend.null.backend` |
| `COMPONENT` | `frontend` | `backend` |
| `BASE_IMAGE` | `var.node_image` | `var.python_image` |
| Artefacts | `release/frontend.{tar,image.json,sha256}` | `release/backend.{tar,image.json,sha256}` |
| Manifeste | `infra/packer/manifest-frontend.json` | `infra/packer/manifest-backend.json` |
| Port de l'image | 4321 | 8000 |

<a id="section-4-6"></a>

### 4.6 Les builders : pourquoi `null`

Le **builder** (bloc `source`) répond à la question « où construire ? ».

| Builder | Construit | Utilisé par FacturaDJ |
|---|---|---|
| `hcloud` | Un snapshot de VM chez Hetzner | Étude OKD, archivé |
| `qemu` | Une image disque QCOW2 locale | Ancienne proposition Debian, archivée |
| `docker` | Une image par *commit* d'un conteneur provisionné | Non : cela dupliquerait la recette des Dockerfiles |
| `null` | Rien : il sert de support aux provisioners | **Oui** |

Avec `null` et `communicator = "none"`, Packer n'alloue aucune ressource : le provisioner `shell-local` s'exécute directement sur la machine qui lance `packer build` (la VM DEV ou le runner GitLab), où Docker et Buildx doivent donc être installés.

Le nom d'une cible suit la forme `<nom du build>.<type de source>.<nom de la source>` : c'est la valeur à passer à l'option `-only`.

<a id="section-4-7"></a>

### 4.7 Le provisioner `shell-local` et le script de construction

Le provisioner appelle `infra/packer/scripts/build-app-image.sh`. Ce script contient tous les garde-fous de la construction.

```bash
#!/bin/bash
# infra/packer/scripts/build-app-image.sh
# Exécuté par Packer SUR LA VM DEV uniquement quand vous lancez packer build.
# Construit un composant et exporte ses octets ; aucune publication/authentification.
set -euo pipefail                       # arrêt à la première erreur ou variable absente

: "${REPO_ROOT:?Racine du depot requise}"
: "${COMPONENT:?Composant requis}"
: "${SOURCE_REV:?SHA source requis}"
: "${TAG:?Tag requis}"
: "${BASE_IMAGE:?Base par digest requise}"
[[ "$SOURCE_REV" =~ ^[0-9a-f]{40}$ ]]   # SHA complet
[[ "$TAG" == "sha-$SOURCE_REV" ]]       # le tag correspond au SHA

case "$COMPONENT" in
  frontend)
    [[ "$BASE_IMAGE" =~ ^node:22[^@\ ]*@sha256:[0-9a-f]{64}$ ]]
    base_arg=NODE_IMAGE ;;
  backend)
    [[ "$BASE_IMAGE" =~ ^python:3\.12[^@\ ]*@sha256:[0-9a-f]{64}$ ]]
    base_arg=PYTHON_IMAGE ;;
  *) echo "Composant inconnu" >&2; exit 2 ;;
esac

cd "$REPO_ROOT"
test "$(git rev-parse HEAD)" = "$SOURCE_REV"   # on construit bien le commit annoncé
test -z "$(git status --porcelain)"            # aucun fichier modifié non commité
if [ "$COMPONENT" = backend ]; then
  test -s backend/requirements.lock            # le lock Python doit exister
fi

mkdir -p release
image="harbor.nexora-djibouti.fr/facturadj/$COMPONENT:$TAG"

# --load : l'image reste dans le Docker local pour être inspectée et testée avant tout push.
docker buildx build --load --platform linux/amd64 \
  -f "infra/docker/$COMPONENT/Dockerfile" \
  --build-arg "$base_arg=$BASE_IMAGE" \
  --build-arg VERSION="$TAG" --build-arg VCS_REF="$SOURCE_REV" \
  --iidfile "release/$COMPONENT.iid" -t "$image" .

docker save -o "release/$COMPONENT.tar" "$image"            # octets exacts qui seront scannés
(cd release && sha256sum "$COMPONENT.tar" > "$COMPONENT.sha256")

# L'identifiant local Docker n'est PAS encore un digest de registry Harbor.
# Suite du script : écriture de release/$COMPONENT.image.json (composant, SHA, tag,
# image de base, plateforme, identifiant local de l'image).
```

<a id="section-4-8"></a>

### 4.8 Les post-processors `artifice` et `manifest`

- **`artifice`** remplace l'artefact « vide » du builder `null` par la liste des fichiers réellement produits. Packer sait ainsi ce qu'il a fabriqué.
- **`manifest`** écrit un fichier JSON qui récapitule la construction (horodatage, artefacts, données personnalisées : référence d'image, SHA, image de base, plateforme).

Aucun post-processor ne pousse, ne signe ou ne déploie. La publication est une étape distincte, décidée après les tests et le scan.

<a id="section-4-9"></a>

### 4.9 Versionnement et traçabilité

Chaque maillon de la chaîne pointe vers le précédent. Si l'un manque, la release n'est pas promouvable.

```text
SHA Git approuvé (SOURCE_REV)
  │
  ├── tag des images ................ sha-<SHA complet>
  ├── label OCI revision ............ <SHA complet>
  ├── image de base ................. python/node @sha256:<digest approuvé>
  ├── dépendances ................... requirements.lock (empreintes), package-lock.json
  │
  ▼
Exports locaux : release/<composant>.tar, .sha256, .image.json, manifest Packer
  │
  ▼
Rapports : release/<composant>.trivy.json, release/<composant>.sbom.json
  │
  ▼
Publication Harbor ─► release/digests.json (les DEUX digests du même SHA)
  │
  ▼
Commit GitOps promote/sha-<SHA> ─► révision synchronisée par Argo CD
```

> **Attention** — L'**identifiant local** d'une image (`docker image inspect --format '{{.Id}}'`) n'est pas son **digest de registry**. Dans ce workflow, la référence de registry utilisée pour la promotion est relevée après le push ; l'identifiant local de configuration ne la remplace pas.

Les tags `sha-<SHA>` suffisent. Un tag de version `vX.Y.Z` peut être ajouté, à condition d'être immuable dans Harbor et de pointer vers les mêmes images. La promotion utilise toujours les digests, jamais `latest`.

Une construction partielle (un seul composant) **ne suffit pas** à promouvoir une release : frontend et backend forment une paire issue du même commit.

<a id="section-4-10"></a>

### 4.10 Sécurité et reproductibilité de la construction

| Mesure | Risque évité |
|---|---|
| Arbre Git propre et `HEAD` égal au SHA annoncé | Construire du code non relu ou différent de celui validé |
| Images de base fixées par digest | Une base qui change silencieusement sous le même tag |
| `requirements.lock` avec empreintes, `--require-hashes --only-binary=:all:` | Dépendance substituée ou compilée depuis une source inconnue |
| `npm ci` sur `package-lock.json` | Résolution de versions différente d'une construction à l'autre |
| Liste blanche `.dockerignore` | Fichiers `.env`, clés, bases SQLite ou venv copiés dans l'image |
| Aucun secret en `ARG` ou `ENV` | Secret lisible dans l'historique de l'image |
| `--load` sans push | Publication d'une image non testée |
| Fins de ligne LF forcées (`.gitattributes`) | Scripts cassés par des retours chariot Windows |
| `-parallel-builds=1` | Deux constructions concurrentes sur le même daemon Docker, journaux entremêlés |

> **Note** — La reproductibilité obtenue est **fonctionnelle** : mêmes sources, mêmes versions, même comportement. Elle n'est pas « bit à bit », car des horodatages entrent dans les couches. C'est pourquoi on promeut le digest d'une image construite une fois, au lieu de reconstruire.


> **Portée de la reproductibilité.** Le verrouillage des dépendances et des images réduit les variations ; il ne démontre pas l'égalité bit à bit de deux builds. Les horodatages et certains traitements de construction peuvent varier. Le principe opérationnel reste donc : construire, valider et conserver les mêmes images par digest lors de leur promotion. [Docker : constructions reproductibles](https://docs.docker.com/build/ci/github-actions/reproducible-builds/).

<a id="section-4-11"></a>

### 4.11 Utiliser Packer : quand et comment

`packer build` intervient **après** la fusion du code et la génération du lock, et **avant** les tests locaux, le scan et la publication.

```text
PR fusionnée ─► lock commité ─► SOURCE_REV/TAG ─► packer validate ─► packer build
                                                                         │
                                                                         ▼
                                      images.sh bundle ─► tests ─► scan ─► push
```

**Valider sans construire.**

```bash
cd ~/FACTURADJ/facturaDJ/infra/packer
# LECTURE / VALIDATION : aucun plugin externe déclaré pour init
packer version          # doit afficher 1.15.3 ou plus récent, en version 1.x
packer init .           # rien à télécharger : composants intégrés
packer fmt -check .     # échoue si un fichier HCL est mal formaté
packer validate .       # vérifie la syntaxe ET les validations des variables
packer inspect .        # liste les variables, les builds, provisioners et post-processors
```

Résultat attendu de `packer validate .` :

```text
The configuration is valid.
```

`packer inspect .` doit faire apparaître **deux** builds, `frontend` et `backend`, chacun avec la source `null`, le provisioner `shell-local` et les post-processors `artifice` et `manifest`.

**Construire.** À lancer uniquement après la validation, sur décision explicite :

```bash
# MODIFICATION LOCALE : construit les DEUX images Docker, sans push
packer build -parallel-builds=1 .
```

Pour un composant isolé, utiliser l'une de ces commandes **à la place** du build global :

```bash
packer build -only='frontend.null.frontend' .
packer build -only='backend.null.backend' .
```

**Sorties produites.**

```text
facturaDJ/
├── release/
│   ├── frontend.tar            image exportée (docker save)
│   ├── frontend.sha256         empreinte de l'archive
│   ├── frontend.image.json     composant, SHA, tag, base, plateforme, identifiant local
│   ├── frontend.iid            identifiant local Docker
│   ├── backend.tar
│   ├── backend.sha256
│   ├── backend.image.json
│   └── backend.iid
└── infra/packer/
    ├── manifest-frontend.json  reçu Packer
    └── manifest-backend.json
```

La suite (contrôle de la paire, tests, scan, publication) est décrite pas à pas au [chapitre 17](#chapitre-17).

<a id="section-4-12"></a>

### 4.12 Les anciennes Golden Images de machines

L'étude d'août prévoyait deux chaînes Packer pour une production OKD sur Hetzner : des snapshots **Fedora CoreOS** pour les nœuds du cluster (configurés par Ignition et durcis par MachineConfig) et des images **Rocky Linux 9** durcies CIS par Ansible pour les machines de service (bastion, répartiteur, sauvegarde).

Ces recettes sont **inactives** (`fcos-okd.pkr.hcl`, `bastion-rocky.pkr.hcl` et `debian.pkr.hcl` sont entièrement commentés). Plusieurs principes restent valables pour toute future image de machine et sont développés en [22.6](#section-22-6) :

- ne jamais figer dans une image un certificat à courte durée de vie ;
- supprimer les clés d'hôte SSH et vider `machine-id` en fin de construction ;
- exécuter des tests (Goss) **pendant** la construction : un échec empêche la publication ;
- ne pas redémarrer automatiquement une machine après correctif ;
- reconstruire régulièrement et promouvoir par étiquette ;
- renouveler les nœuds un par un.

> **Obsolète** — Les en-têtes de `fcos-okd.pkr.hcl` et `bastion-rocky.pkr.hcl` affirment encore que « la cible active de ce dossier est Debian QEMU ». C'est faux depuis le 12/09/2026 : la cible active est Docker frontend et backend. Voir [Annexe D](#annexe-d).
<a id="mise-en-pratique--chapitre-4"></a>

### Mise en pratique — chapitre 4

**Lire une construction Packer.** Le template ne décrit pas une VM ; il choisit une source null, puis appelle un script local. Le script lance le Dockerfile ; les post-processors enregistrent les exports. **Exercice :** retrouver ces trois éléments dans le template et nommer le fichier produit par chacun. Une validation HCL réussie n'a pas exécuté la construction.

<a id="synthese-du-chapitre-4"></a>

#### Synthèse du chapitre 4

**À retenir**

- **Golden Image de machine**, **image de base** et **image applicative** sont trois choses différentes. FacturaDJ ne fabrique aujourd'hui que la troisième, et **sélectionne** la deuxième par digest.
- Le builder `null` avec `communicator = "none"` signifie : Packer n'alloue rien, tout se passe sur la machine qui lance la commande. Docker et Buildx doivent donc y être installés.
- Packer valide avant de construire : SHA de 40 caractères, images de base fixées par digest. Ces validations portent sur **tout** le dossier, même avec `-only`.
- Ce que produit une construction : deux archives `.tar`, leurs empreintes, deux `.image.json`, deux manifestes. La référence de registry destinée à GitOps est recueillie par ce workflow après la publication.
- Une construction partielle ne suffit jamais : frontend et backend forment une **paire** issue du même commit.

**Les pièges classiques**

| Le piège | Pourquoi on tombe dedans | Le bon réflexe |
|---|---|---|
| Croire que `packer build` publie l'image | Beaucoup de chaînes construisent et poussent d'un seul geste | Packer ne s'authentifie nulle part. La publication est une étape distincte, après tests et scan ([17.9](#section-17-9)) |
| Confondre l'identifiant local d'image et le digest de registry | Les deux ressemblent à `sha256:…` | `docker image inspect --format '{{.Id}}'` donne un identifiant local ; le digest déployé provient de `RepoDigests`, après le push |
| Utiliser `-only` sans exporter les deux images de base | On ne construit qu'un composant, on ne pense qu'à sa base | `PYTHON_IMAGE` **et** `NODE_IMAGE` sont validées pour tout le dossier : les deux doivent être exportées |
| Lancer deux constructions en parallèle | Cela paraît plus rapide | `-parallel-builds=1` est volontaire : deux constructions concurrentes sur le même daemon Docker entremêlent les journaux |

**Vérifiez votre compréhension**

1. Pourquoi le builder `null` plutôt que le builder `docker` ? *(→ [4.6](#section-4-6))*
2. Après un `packer build` réussi, disposez-vous du digest à inscrire dans le dépôt GitOps ? *(→ [4.9](#section-4-9))*
3. Que font respectivement les post-processors `artifice` et `manifest` ? *(→ [4.8](#section-4-8))*

> **Réponses** — **1.** Le builder `docker` construirait une image en provisionnant un conteneur, ce qui dupliquerait la recette déjà écrite dans les Dockerfiles multi-étapes. Le builder `null` sert simplement de support au provisioner `shell-local`, qui pilote le Dockerfile existant. **2.** Non. Vous disposez d'un identifiant local et d'archives ; le workflow relève le digest de registry après `docker push`, et il est consigné dans `release/digests.json`. **3.** `artifice` remplace l'artefact vide du builder `null` par la liste des fichiers réellement produits ; `manifest` écrit un JSON récapitulatif (horodatage, artefacts, référence d'image, SHA, image de base, plateforme).

**Où aller ensuite** — Le [chapitre 5](#chapitre-05) ouvre les deux Dockerfiles que Packer pilote, ligne par ligne.

<a id="chapitre-05"></a>

## 5. Images applicatives Docker

> **En une phrase** — Les deux images séparent fabrication et exécution ; leurs dépendances, paramètres et sondes forment un contrat de livraison.

**Ce que vous saurez faire à la fin de ce chapitre**

1. Définir les huit notions Docker indispensables sans hésiter.
2. Expliquer le fonctionnement en liste blanche du `.dockerignore` et dire lequel est réellement lu.
3. Lire les Dockerfiles backend et frontend et justifier chaque garde-fou.
4. Énoncer le contrat des sondes `/healthz/` et `/readyz/`.
5. Monter un test local jetable avec Docker Compose et interpréter ses quatre sondes.

**Prérequis** — [chapitre 4](#chapitre-04) · **Lecture** — 14 min · **Nature** — cours puis référence technique

<a id="section-5-1"></a>

### 5.1 Docker en huit notions

| Notion | Définition | Analogie |
|---|---|---|
| **Dockerfile** | Recette textuelle qui décrit comment fabriquer une image | La fiche recette |
| **Image** | Paquet figé contenant un système minimal, un runtime, des dépendances et le code | Un plat préparé et scellé |
| **Conteneur** | Instance en cours d'exécution d'une image, isolée du reste | Le plat servi à table |
| **Couche** | Chaque instruction du Dockerfile ajoute une couche de fichiers | Un étage de gâteau |
| **Multi-étapes** | Plusieurs `FROM` : on compile dans une étape, on ne garde que le résultat | La cuisine séparée de la salle |
| **Contexte de build** | Fichiers envoyés au moteur pour la construction | Les ingrédients posés sur le plan de travail |
| **BuildKit / Buildx** | Moteur de construction moderne de Docker et sa commande | Le four professionnel |
| **Registry** | Serveur qui stocke et distribue les images | L'entrepôt |

<a id="section-5-2"></a>

### 5.2 De l'image de base jusqu'à Harbor

```text
Golden Container Image (python / node, fixée par digest)
          │
          ▼
Dockerfiles multi-étapes (dépendances verrouillées + code)
          │  piloté par Packer, exécuté par BuildKit
          ▼
Image applicative locale (tag sha-<SHA>, --load)
          │  docker save + sha256
          ▼
Tests smoke ─► Hadolint ─► Trivy + SBOM
          │
          ▼
Harbor (digest sha256 définitif)
```

<a id="section-5-3"></a>

### 5.3 Le contexte de construction et `.dockerignore`

Les deux Dockerfiles utilisent **le même contexte : la racine du dépôt**. C'est ce qui permet au backend de copier `infra/docker/entrypoint-backend.sh`.

Le fichier `.dockerignore` de la racine fonctionne en **liste blanche** : tout est exclu, puis seuls les dossiers utiles sont réintroduits, et les fichiers sensibles sont à nouveau exclus.

```text
# .dockerignore (extrait commenté)
**                    # 1. tout exclure
!backend/             # 2. réintroduire les sources utiles
!backend/**
!frontend/
!frontend/**
!infra/
!infra/docker/
!infra/docker/**
# 3. Ré-exclure les fichiers sensibles ; commentaire sur une ligne séparée.
**/.env
**/.env.*
**/*.key
**/*.pem
**/.ssh
**/*.sqlite*
**/.venv
**/node_modules
**/media
```

> **Note** — Dans cette recette, le fichier pris en compte est le `.dockerignore` de la racine du contexte. Docker permet aussi des fichiers d'exclusion propres à un Dockerfile, qui ont priorité lorsqu'ils existent. `infra/docker/.dockerignore` est ici une copie de référence. [Documentation Docker](https://docs.docker.com/build/concepts/context/).

<a id="section-5-4"></a>

### 5.4 Verrouiller les dépendances

**Python.** Le fichier `backend/requirements.txt` contient des plages de versions (par exemple `django>=5.2,<6.0`). Une plage ne garantit pas la reproductibilité : il faut un **lock** qui fige chaque version et son empreinte.

`backend/requirements-container.in` ajoute les dépendances propres à l'image : `psycopg[binary]`, `gunicorn` et `redis`. Le lock se génère **sous Linux, avec le même Python 3.12 que l'image** :

```bash
# MODIFICATION LOCALE : téléchargements et création du lock, par vous
# PYTHON_IMAGE = python:3.12-slim-bookworm@sha256:<digest approuvé>
cd ~/FACTURADJ/facturaDJ
docker run --rm --user "$(id -u):$(id -g)" -e HOME=/tmp \
  -v "$PWD/backend:/src" -w /src "$PYTHON_IMAGE" \
  sh -ec 'python -m venv /tmp/lockenv
    /tmp/lockenv/bin/pip install pip==24.0 pip-tools==7.4.1
    /tmp/lockenv/bin/pip-compile --generate-hashes \
      --output-file=requirements.lock requirements-container.in'
```

| Élément | Explication |
|---|---|
| `docker run ... "$PYTHON_IMAGE"` | Résout les dépendances dans le même système et le même Python que l'image finale |
| `--user "$(id -u):$(id -g)"` | Le fichier créé appartient à votre utilisateur, pas à root |
| `pip-compile --generate-hashes` | Écrit chaque version exacte avec son empreinte sha256 |

Relire les versions et les empreintes, scanner, puis ajouter le lock dans une Pull Request GitHub.

> **Attention** — Ne jamais générer le lock depuis le venv Windows du poste : il a été observé avec Django 6, incompatible avec la contrainte `django>=5.2,<6.0`, et sur un autre système d'exploitation.

> **À valider** — `backend/requirements.lock` est **absent** de la copie de travail. Son absence bloque volontairement la construction Docker, la CI GitHub et le pipeline GitLab. Aucun lock n'a été inventé.

**Node.** Le frontend conserve son `package-lock.json` et s'installe avec `npm ci`, qui respecte strictement le lock. L'adaptateur `@astrojs/node` doit figurer dans `dependencies` (et non `devDependencies`), sinon `npm prune --omit=dev` le supprimerait et le serveur ne démarrerait pas. `check_static.py` le vérifie.

<a id="section-5-5"></a>

### 5.5 Choisir les images de base par digest

Un **tag** (`python:3.12-slim-bookworm`) peut être déplacé par l'éditeur vers une nouvelle image. Un **digest** (`@sha256:…`) désigne un contenu précis et immuable.

```bash
cd ~/FACTURADJ/facturaDJ
# LECTURE registry, sans build ni push
docker buildx imagetools inspect python:3.12-slim-bookworm
docker buildx imagetools inspect node:22-bookworm-slim
read -r -p 'Base Python complète, python:3.12-...@sha256:... : ' PYTHON_IMAGE
read -r -p 'Base Node complète, node:22-...@sha256:... : ' NODE_IMAGE
export PYTHON_IMAGE NODE_IMAGE
```

Extrait attendu de `imagetools inspect` (valeurs illustratives) :

```text
Name:      docker.io/library/python:3.12-slim-bookworm
MediaType: application/vnd.oci.image.index.v1+json
Digest:    sha256:<64 caractères hexadécimaux>
```

Le digest de l'**index** (multi-plateforme) est celui à retenir : BuildKit sélectionne ensuite `linux/amd64`.

Politique de mise à jour : une nouvelle base (correctif de sécurité) donne lieu à une nouvelle release complète — nouveau commit si nécessaire, nouvelle construction, nouveaux tests et nouveau scan. On n'écrase jamais un tag déjà publié.

> **Note** — Les valeurs par défaut des `ARG` dans les Dockerfiles (`python:3.12-slim-bookworm`, `node:22-bookworm-slim`) servent au développement. Les scripts de livraison refusent une base non fixée par digest.

<a id="section-5-6"></a>

### 5.6 L'image backend Django

```dockerfile
# syntax=docker/dockerfile:1.7
# infra/docker/backend/Dockerfile — contexte : racine FacturaDJ.
ARG PYTHON_IMAGE=python:3.12-slim-bookworm     # remplacé par la base approuvée (digest)

# ---------- Étape 1 : dépendances ----------
FROM ${PYTHON_IMAGE} AS dependencies
ENV PIP_NO_CACHE_DIR=1 PIP_DISABLE_PIP_VERSION_CHECK=1
WORKDIR /build
COPY backend/requirements.lock ./requirements.lock
RUN python -m venv /opt/venv \
 && /opt/venv/bin/pip install --require-hashes --only-binary=:all: -r requirements.lock \
 && /opt/venv/bin/pip check                   # dépendances cohérentes entre elles

# ---------- Étape 2 : exécution ----------
FROM ${PYTHON_IMAGE} AS runtime
ARG VERSION=dev
ARG VCS_REF=unknown
LABEL org.opencontainers.image.title="facturadj-backend" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${VCS_REF}"
ENV PATH="/opt/venv/bin:$PATH" PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 \
    DJANGO_SETTINGS_MODULE=config.container_settings HOME=/app
WORKDIR /app
COPY --from=dependencies /opt/venv /opt/venv  # seul le venv est repris, pas les outils de build
COPY backend/ /app/
COPY --chmod=0555 infra/docker/entrypoint-backend.sh /usr/local/bin/entrypoint.sh
# collectstatic au build, avec une clé aléatoire jetable (jamais en ARG/ENV) et sans accès DB.
RUN DJANGO_SETTINGS_MODULE=config.settings \
    DJANGO_SECRET_KEY="$(python -c 'import secrets; print(secrets.token_urlsafe(64))')" \
    DJANGO_DEBUG=0 python manage.py collectstatic --noinput \
 && mkdir -p /app/media \
 && chown 10001:10001 /app/media \
 && chmod -R a+rX /app
USER 10001:10001                                # utilisateur non root
EXPOSE 8000
HEALTHCHECK --interval=20s --timeout=4s --start-period=30s --retries=3 \
 CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/healthz/',timeout=3)"
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", \
     "--workers", "2", "--threads", "2", "--worker-tmp-dir", "/tmp", \
     "--access-logfile", "-", "--error-logfile", "-", "--timeout", "60"]
```

| Choix | Pourquoi |
|---|---|
| `collectstatic` pendant la construction | Les fichiers statiques sont figés dans l'image : le système de fichiers peut être en lecture seule et tous les Pods servent les mêmes fichiers |
| Clé secrète aléatoire pour `collectstatic` | Aucune clé réelle ni valeur connue ne reste dans l'historique de l'image |
| `DJANGO_SETTINGS_MODULE=config.container_settings` | Réglages durcis imposés à l'exécution (voir ci-dessous) |
| Gunicorn 2 workers × 2 threads, `--worker-tmp-dir /tmp` | Profil modeste adapté à la PREPROD ; `/tmp` est un volume en mémoire, seul endroit inscriptible |
| Journaux sur `-` (sortie standard) | Kubernetes et Docker collectent la sortie standard |
| `HEALTHCHECK` | Utilisé par Docker Compose ; Kubernetes utilise ses propres sondes |

**Le point d'entrée** refuse de démarrer une image mal configurée, et ne lance **jamais** de migration :

```sh
#!/bin/sh
# infra/docker/entrypoint-backend.sh
# Aucune migration, collecte ou seed au démarrage. exec transmet SIGTERM à PID 1.
set -eu
: "${DJANGO_SECRET_KEY:?DJANGO_SECRET_KEY obligatoire}"
: "${DJANGO_ALLOWED_HOSTS:?DJANGO_ALLOWED_HOSTS obligatoire}"
: "${DATABASE_URL:?DATABASE_URL PostgreSQL obligatoire}"
: "${REDIS_URL:?REDIS_URL obligatoire}"
test "${DJANGO_DEBUG:-0}" = 0 || { echo "DEBUG interdit" >&2; exit 1; }
exec "$@"      # gunicorn remplace le shell et reçoit directement les signaux d'arrêt
```

**Les réglages imposés par l'image** (`backend/config/container_settings.py`) :

```python
from .settings import *  # noqa: F403,F401   — part des réglages du projet

# Refuser un repli silencieux sur SQLite, qui écrirait sur un disque éphémère.
if not os.environ.get("DATABASE_URL", "").startswith(("postgres://", "postgresql://")):
    raise ImproperlyConfigured("L'image exige DATABASE_URL PostgreSQL.")
# Redis obligatoire : sans cache partagé, le quota anti-force-brute serait compté par processus.
if not os.environ.get("REDIS_URL", "").startswith(("redis://", "rediss://")):
    raise ImproperlyConfigured("L'image exige REDIS_URL pour partager les quotas.")
if DEBUG:
    raise ImproperlyConfigured("DEBUG interdit dans les images.")

CACHES = {"default": {"BACKEND": "django.core.cache.backends.redis.RedisCache",
                      "LOCATION": os.environ["REDIS_URL"],
                      "OPTIONS": {"socket_connect_timeout": 2, "socket_timeout": 2}}}
DATABASES["default"]["OPTIONS"]["connect_timeout"] = 3
CSRF_TRUSTED_ORIGINS = [v.strip() for v in os.getenv("CSRF_TRUSTED_ORIGINS", "").split(",")
                        if v.strip()]
# TLS se termine à l'Ingress Astro ; le backend est privé et joint en HTTP.
SECURE_REDIRECT_EXEMPT = [r"^healthz/$", r"^readyz/$"]
MEDIA_ROOT = os.getenv("MEDIA_ROOT", "/app/media")
```

<a id="section-5-7"></a>

### 5.7 L'image frontend Astro SSR

```dockerfile
# syntax=docker/dockerfile:1.7
# infra/docker/frontend/Dockerfile — contexte : racine FacturaDJ, identique au backend.
ARG NODE_IMAGE=node:22-bookworm-slim

# ---------- Étape 1 : compilation ----------
FROM ${NODE_IMAGE} AS build
WORKDIR /build
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --fund=false          # installation stricte selon le lock
COPY frontend/ ./
# Aucune variable d'API ni fichier .env au build : l'image est la même pour tous les environnements.
RUN NODE_ENV=production npm run build \
 && npm prune --omit=dev --ignore-scripts \
 && npm cache clean --force

# ---------- Étape 2 : exécution ----------
FROM ${NODE_IMAGE} AS runtime
ARG VERSION=dev
ARG VCS_REF=unknown
LABEL org.opencontainers.image.title="facturadj-frontend" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${VCS_REF}"
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4321 HOME=/tmp
WORKDIR /app
# Fichiers possédés par root : l'utilisateur 10001 peut les lire, pas les modifier.
COPY --from=build --chown=root:root /build/dist ./dist
COPY --from=build --chown=root:root /build/node_modules ./node_modules
COPY --from=build --chown=root:root /build/package.json ./package.json
USER 10001:10001
EXPOSE 4321
HEALTHCHECK --interval=20s --timeout=4s --start-period=20s --retries=3 \
 CMD node -e "fetch('http://127.0.0.1:4321/healthz',{signal:AbortSignal.timeout(3000)}).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "./dist/server/entry.mjs"]
```

Points importants :

- **`API_URL` est lue à l'exécution** par `frontend/src/lib/api.ts`, dans l'ordre : `process.env.API_URL`, puis `PUBLIC_API_URL`, puis une valeur locale. En k3d, `API_URL=http://facturadj-backend:8000`.
- **Protection CSRF native d'Astro** : `security.checkOrigin` vaut `true` lorsque `NODE_ENV=production`, ce qui est le cas dans l'image. Les POST de connexion doivent donc être testés en HTTPS, derrière un proxy qui transmet l'hôte public.
- **Cookies `Secure`** : un test de connexion en HTTP sur l'adresse IP distante ne peut pas réussir. Tester via HTTPS ou sur `localhost`.

> **À valider** — `frontend/astro.config.mjs` contient encore `allowedHosts: true`, réglage hérité des tunnels ngrok. Vérifier s'il influence le serveur de production ou seulement le serveur de développement, et le restreindre au domaine réel.

<a id="section-5-8"></a>

### 5.8 Le contrat des sondes de santé

Les deux applications exposent deux adresses de santé, sans authentification et sans détail d'infrastructure dans la réponse.

| Sonde | Répond `200` quand… | Répond `503` quand… | Utilisée pour |
|---|---|---|---|
| Django `/healthz/` | Le processus répond, indépendamment de la base et du cache | Jamais volontairement | Vivacité (liveness) et démarrage |
| Django `/readyz/` | PostgreSQL répond à `SELECT 1` **et** Redis répond | PostgreSQL ou Redis est indisponible | Aptitude (readiness) |
| Astro `/healthz` | Le serveur Node répond | Jamais volontairement | Vivacité et démarrage |
| Astro `/readyz` | Django `/readyz/` répond `200` | La chaîne Astro → Django → données est rompue | Aptitude |

Réponses : `{"status": "ok"}` ou `{"status": "unavailable"}`.

```text
Kubernetes ──readiness──► Astro /readyz ──► Django /readyz/ ──┬──► PostgreSQL SELECT 1
                                                             └──► Redis GET
```

Conséquence importante : si PostgreSQL **ou** Redis tombe, les deux Pods deviennent « non prêts », Traefik n'a plus de destination et répond `503`. C'est voulu : un `503` franc vaut mieux que des pages en erreur aléatoire. Les Pods ne sont **pas** redémarrés, car la vivacité ne dépend pas des données.

> **Attention** — Ne jamais tester la base dans une sonde de **vivacité**. Une base simplement lente ferait redémarrer tous les Pods en même temps, transformant un ralentissement en panne totale.

<a id="section-5-9"></a>

### 5.9 Le durcissement des conteneurs

| Mesure | Dockerfile | Compose smoke | k3d | Ce que cela empêche |
|---|---|---|---|---|
| Utilisateur non root UID/GID 10001 | `USER 10001:10001` | `user: "10001:10001"` | `runAsNonRoot`, `runAsUser: 10001` | Un processus compromis agit avec des droits minimaux |
| Système de fichiers en lecture seule | — | `read_only: true` | `readOnlyRootFilesystem: true` | Écrire un binaire ou modifier le code |
| Répertoires inscriptibles limités | — | `tmpfs` sur `/tmp` et `/app/media` | `emptyDir` sur `/tmp`, PVC sur `/app/media` | Remplir le disque du nœud |
| Capabilities Linux retirées | — | `cap_drop: [ALL]` | `capabilities.drop: [ALL]` | Opérations réseau ou système privilégiées |
| Pas d'escalade de privilèges | — | `no-new-privileges:true` | `allowPrivilegeEscalation: false` | Gagner des droits via un binaire setuid |
| Profil seccomp | — | Défaut Docker | `seccompProfile: RuntimeDefault` | Appels système dangereux |
| Pas de jeton Kubernetes | — | — | `automountServiceAccountToken: false` | Utiliser l'API Kubernetes depuis un Pod compromis |
| `DEBUG` refusé | Point d'entrée et réglages | Idem | Idem | Exposer des traces d'erreur complètes |

<a id="section-5-10"></a>

### 5.10 Tester localement avec Docker Compose

Avant toute publication, les deux images sont démarrées ensemble sur la VM DEV avec une base et un cache **de test**, grâce à `infra/docker/compose.smoke.yaml`.

```yaml
# infra/docker/compose.smoke.yaml — MODIFICATION LOCALE à l'initiative de l'opérateur.
name: facturadj-smoke
services:
  db:
    image: ${POSTGRES_IMAGE:?Fournir postgres:17-bookworm@sha256...}   # base fixée par digest
    environment:
      POSTGRES_DB: facturadj
      POSTGRES_USER: facturadj
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password    # mot de passe lu dans un fichier
    secrets: [db_password]
    volumes: [pgdata:/var/lib/postgresql/data]            # volume dédié au smoke
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U facturadj -d facturadj"]
  redis:
    image: ${REDIS_IMAGE:?Fournir redis:7-bookworm@sha256...}
    command: ["redis-server", "--save", "", "--appendonly", "no"]   # aucune persistance
  backend:
    image: harbor.nexora-djibouti.fr/facturadj/backend:${TAG:?Fournir TAG}
    env_file: ["${SMOKE_ENV_FILE:?Fichier externe backend-smoke.env}"]  # secrets hors dépôt
    ports: ["127.0.0.1:8000:8000"]      # accessible uniquement depuis la VM elle-même
    read_only: true
    user: "10001:10001"
    cap_drop: [ALL]
    security_opt: ["no-new-privileges:true"]
    tmpfs: ["/tmp:uid=10001,gid=10001,mode=1770", "/app/media:uid=10001,gid=10001,mode=0770"]
    depends_on:
      db: {condition: service_healthy}
      redis: {condition: service_healthy}
  frontend:
    image: harbor.nexora-djibouti.fr/facturadj/frontend:${TAG:?Fournir TAG}
    environment:
      API_URL: http://backend:8000
    ports: ["127.0.0.1:4321:4321"]
    read_only: true
    user: "10001:10001"
    cap_drop: [ALL]
    security_opt: ["no-new-privileges:true"]
    tmpfs: ["/tmp:uid=10001,gid=10001,mode=1770"]
    depends_on:
      backend: {condition: service_healthy}
secrets:
  db_password:
    file: ${SMOKE_DB_PASSWORD_FILE:?Fichier externe db-password}
volumes:
  pgdata:
```

La syntaxe `${VARIABLE:?message}` fait échouer Compose avec un message clair si la variable manque. La procédure complète (création des secrets jetables, migration de la base de test, contrôles) est détaillée en [17.7](#section-17-7).

> **Attention** — Un administrateur Docker peut lire les variables d'un conteneur. Ne jamais partager la sortie complète de `docker inspect` ou de `docker compose config` : les commandes de ce manuel n'affichent que l'utilisateur, les ports et l'état de santé.

<a id="section-5-11"></a>

### 5.11 Contrôles avant publication

- [ ] Les deux images portent le même tag `sha-<SOURCE_REV>` et le label `revision` correspondant.
- [ ] L'utilisateur est `10001:10001` et les ports exposés sont 8000 et 4321.
- [ ] L'historique de l'image ne contient aucune valeur secrète.
- [ ] Les quatre sondes répondent `200` dans le test Compose.
- [ ] L'image backend refuse `DJANGO_DEBUG=1`.
- [ ] Les tests Django passent dans un conteneur jetable de l'image.
- [ ] Hadolint et Trivy ne signalent aucun défaut bloquant.

Contrôle rapide du refus de `DEBUG`, avec des valeurs factices (aucune connexion n'est tentée, le point d'entrée s'arrête avant) :

```bash
# LECTURE : l'image doit refuser de démarrer
docker run --rm \
  -e DJANGO_DEBUG=1 -e DJANGO_SECRET_KEY=factice -e DJANGO_ALLOWED_HOSTS=localhost \
  -e DATABASE_URL=postgresql://factice@db/factice -e REDIS_URL=redis://redis:6379/0 \
  "harbor.nexora-djibouti.fr/facturadj/backend:$TAG" true
echo "code de sortie : $?"
```

Résultat attendu :

```text
DEBUG interdit
code de sortie : 1
```

Contrôle de l'absence de secret dans l'historique :

```bash
# LECTURE
docker history --no-trunc "harbor.nexora-djibouti.fr/facturadj/backend:$TAG" \
  | grep -iE 'password|token|secret'
```

Seule la ligne `collectstatic` doit apparaître : elle contient le **texte** `DJANGO_SECRET_KEY="$(python -c ...)"`, c'est-à-dire la commande qui génère une clé jetable, et non une valeur.
<a id="mise-en-pratique--chapitre-5"></a>

### Mise en pratique — chapitre 5

**Distinguer build et runtime.** Le backend peut produire ses fichiers statiques pendant le build sans se connecter à la base de recette. Au démarrage, il exige en revanche PostgreSQL, Redis et une configuration non DEBUG. **Contrôle :** classer chaque variable en entrée de construction, configuration d'exécution ou secret ; justifier pourquoi elle appartient à cette catégorie.

<a id="synthese-du-chapitre-5"></a>

#### Synthèse du chapitre 5

**À retenir**

- Les deux images partagent **le même contexte** : la racine du dépôt. C'est ce qui permet au backend de copier `infra/docker/entrypoint-backend.sh`.
- Le `.dockerignore` fonctionne en **liste blanche** : tout est exclu, puis seuls les dossiers utiles sont réintroduits, puis les fichiers sensibles sont réexclus. Docker ne lit que celui de la racine du contexte.
- Aucun secret en `ARG` ni en `ENV` : ce qui passe par là reste lisible dans l'historique de l'image.
- L'image **refuse de démarrer** dans trois cas : configuration invalide, repli silencieux sur SQLite, absence de Redis. Ce refus est une fonctionnalité, pas une panne.
- `collectstatic` se fait **au build**, avec une clé jetable et sans accès à la base. Aucune migration, aucune collecte, aucun *seed* au démarrage.

**Les pièges classiques**

| Le piège | Pourquoi on tombe dedans | Le bon réflexe |
|---|---|---|
| Modifier `infra/docker/.dockerignore` | Le chemin est cohérent avec les Dockerfiles | Seul le `.dockerignore` de la **racine du contexte** est lu ; celui d'`infra/docker` est une copie de référence |
| Ajouter une variable d'API au build du frontend | On veut « configurer » l'image | L'image doit rester identique pour tous les environnements : `API_URL` est lue à l'exécution |
| Compter sur l'instruction `HEALTHCHECK` en production | Elle figure dans les Dockerfiles | Kubernetes l'**ignore** et n'utilise que ses propres sondes ([16.2](#section-16-2)). `HEALTHCHECK` sert à Docker et à Compose |
| Contourner le refus de démarrer sans Redis | Le service semble pouvoir s'en passer | Sans cache partagé, le quota anti-force-brute serait compté par processus : la protection disparaîtrait silencieusement |

**Vérifiez votre compréhension**

1. Quel fichier `.dockerignore` est réellement pris en compte lors de la construction ? *(→ [5.3](#section-5-3))*
2. Pourquoi l'image backend refuse-t-elle de démarrer si Redis est absent ? *(→ [5.6](#section-5-6))*
3. Kubernetes utilise-t-il l'instruction `HEALTHCHECK` du Dockerfile ? *(→ [5.8](#section-5-8), [16.2](#section-16-2))*

> **Réponses** — **1.** Celui situé à la racine du contexte de construction, c'est-à-dire à la racine du dépôt. **2.** Parce que le quota anti-force-brute s'appuie sur un cache partagé : sans Redis, chaque processus Gunicorn compterait séparément et la limite serait multipliée par le nombre de workers. **3.** Non. Kubernetes n'utilise que `startupProbe`, `livenessProbe` et `readinessProbe`.

**Où aller ensuite** — Le [chapitre 6](#chapitre-06) explique d'où vient le SHA que Packer exige, et comment il franchit la première porte.

<!-- PARTIE: Partie III — Livrer -->

<a id="chapitre-06"></a>

## 6. GitHub et GitLab

> **En une phrase** — GitHub porte la revue du code ; GitLab conserve le code approuvé et, dans un autre dépôt, le plan de déploiement.

**Ce que vous saurez faire à la fin de ce chapitre**

1. Réviser les notions Git indispensables : branche, commit, SHA, Pull Request, Merge Request.
2. Dire ce que chaque plateforme fait — et surtout ce qu'elle ne fait pas.
3. Exécuter le transfert validé GitHub → GitLab et vérifier que les deux SHA coïncident.
4. Expliquer pourquoi aucun token ne doit apparaître dans une URL ni dans un historique de shell.
5. Identifier qui décide de quoi à chaque étape.

**Prérequis** — [chapitre 2](#chapitre-02) · **Lecture** — 7 min · **Nature** — procédure et gouvernance

<a id="section-6-1"></a>

### 6.1 Rappels Git indispensables

| Notion | Définition |
|---|---|
| **Dépôt** | Historique complet d'un projet |
| **Commit** | Instantané des fichiers, identifié par un **SHA** : empreinte de 40 caractères hexadécimaux qui change si un seul octet change |
| **Branche** | Pointeur mobile vers un commit (`main`, `feature/...`) |
| **Tag** | Pointeur fixe vers un commit, souvent une version (`v1.2.0`) |
| **Remote** | Copie distante d'un dépôt (`origin` sur GitHub, le miroir GitLab…) |

Le SHA est au cœur de la traçabilité de FacturaDJ : c'est lui qui est approuvé, transféré, construit et étiqueté.

<a id="section-6-2"></a>

### 6.2 Le rôle de chaque plateforme

```text
GitHub
=
DEV : on écrit, on propose, on vérifie

GitLab
=
PREPROD : on reçoit ce qui est approuvé, on construit, on promeut
```

FacturaDJ utilise **trois dépôts** :

| Dépôt | Plateforme | Contenu | Qui écrit | Qui lit |
|---|---|---|---|---|
| **Applicatif** | GitHub | Code backend et frontend, Dockerfiles, templates Packer, modèles Kubernetes | Développeurs, par Pull Request | Tous |
| **Miroir applicatif** | GitLab | Les mêmes commits, uniquement ceux approuvés | Admin DevOps, par push d'un SHA approuvé | Runner PREPROD |
| **GitOps** | GitLab (projet distinct) | Manifests PREPROD avec digests promus, Application Argo CD | Admin DevOps, par Merge Request | Argo CD, en lecture seule |

Pourquoi un dépôt GitOps **séparé** du code ?

- **Historique lisible** : « ce qui tourne en PREPROD » se lit dans un historique dédié, sans le bruit des commits de code.
- **Pas de boucle** : un commit de promotion ne relance pas la CI applicative.
- **Cloisonnement** : un accès au dépôt de code ne donne pas le pouvoir de modifier ce qui est déployé, et Argo CD n'a besoin de lire que le dépôt GitOps.

> **Attention** — Ne jamais écrire une promotion dans le miroir applicatif, et ne jamais configurer de synchronisation retour de GitLab vers GitHub.

<a id="section-6-3"></a>

### 6.3 Branches, Pull Requests et Merge Requests

Une **Pull Request** (GitHub) et une **Merge Request** (GitLab) désignent la même chose : une demande d'intégration d'une branche dans une autre, accompagnée d'une revue et de contrôles automatiques.

| Branche | Dépôt | Usage |
|---|---|---|
| `main` | Tous | Branche protégée : ce qui est approuvé |
| `feature/*` | GitHub | Développement ; contrôles CI à chaque push |
| `infra/*` | GitHub | Évolutions d'infrastructure (par exemple `infra/packer-docker-apps`) |
| `promote/sha-<SHA>` | GitOps | Proposition de promotion d'une release |
| `rollback/<horodatage>` | GitOps | Proposition de retour arrière |

Protections à configurer selon le rôle du dépôt :

| Dépôt | Protection de `main` |
|---|---|
| GitHub applicatif | PR relue, contrôles CI obligatoires, aucun push direct ordinaire |
| GitLab GitOps | MR relue, validation des manifests, aucun push direct ordinaire |
| GitLab miroir | Transfert direct limité à l'identité autorisée pour copier le SHA GitHub exact ; aucun développement indépendant |

Dans les trois dépôts, interdire les réécritures forcées et la suppression de `main`. La revue du code du miroir est celle du commit GitHub approuvé ; créer un nouveau commit de fusion dans le miroir romprait l'identité du SHA transféré.

<a id="section-6-4"></a>

### 6.4 Le transfert validé GitHub → GitLab

Le « mirroring » retenu est un **transfert manuel des références approuvées**, à sens unique :

```text
GitHub main (PR fusionnée, contrôles verts)
  │
  │  vérification du SHA par l'Admin DevOps
  ▼
git push <SHA approuvé>:refs/heads/main
  │
  ▼
GitLab miroir main (même SHA) ──► pipeline PREPROD disponible
```

> **Analogie** — Le miroir GitLab est un coffre dont seul l'Admin DevOps détient la clé. Il n'y dépose que des documents déjà signés, et vérifie leur empreinte avant et après le dépôt.

Procédure, depuis le clone DEV :

```bash
# LECTURE / VALIDATION ; aucune URL avec token
git remote -v
read -r -p 'URL GitLab du miroir applicatif : ' GITLAB_MIRROR_URL
read -r -p 'SHA GitHub approuvé, 40 caractères : ' APPROVED_SHA
git fetch origin main
test "$(git rev-parse origin/main)" = "$APPROVED_SHA"   # le SHA approuvé est bien le main GitHub
git show --stat "$APPROVED_SHA"                          # relire ce qui va partir
git ls-remote "$GITLAB_MIRROR_URL" refs/heads/main       # état actuel du miroir

# MODIFICATION DISTANTE, après votre revue
git push "$GITLAB_MIRROR_URL" "$APPROVED_SHA:refs/heads/main"

# LECTURE : le SHA doit être identique des deux côtés
git ls-remote "$GITLAB_MIRROR_URL" refs/heads/main
```

Résultat attendu de la dernière commande :

```text
<SHA approuvé, identique à APPROVED_SHA>	refs/heads/main
```

Un **tag approuvé** se transfère séparément, après vérification de sa cible :

```bash
# MODIFICATION DISTANTE
git push "$GITLAB_MIRROR_URL" "refs/tags/$RELEASE_TAG:refs/tags/$RELEASE_TAG"
```

> **Attention** — Ne jamais ajouter `--mirror` ou `--force` pour contourner une divergence. Une divergence signale que le miroir contient un commit inattendu : l'analyser avant toute action.

Si `git push` est refusé en « non fast-forward », le miroir contient un commit absent de GitHub : **arrêter** et comprendre d'où il vient.

> **Note** — Un *pull mirror* configuré dans GitLab depuis GitHub est une option future, selon l'offre GitLab et sans miroir inverse. Il n'est pas activé.

<a id="section-6-5"></a>

### 6.5 Tokens, droits et sécurité des dépôts

| Règle | Pourquoi |
|---|---|
| Jamais de jeton dans une URL Git (`https://user:token@...`) | Il se retrouve dans `.git/config`, l'historique du shell et la liste des processus |
| GitHub Actions : `permissions: contents: read`, `persist-credentials: false` | La CI DEV ne peut rien écrire et ne conserve aucun identifiant |
| Aucun secret Harbor, cluster ou VPS dans GitHub | La CI DEV ne publie ni ne déploie rien ; `check_static.py` interdit `docker login`, `packer build`, `git push` et `argocd app sync` dans ses workflows |
| Variables GitLab **protégées** : `PYTHON_IMAGE`, `NODE_IMAGE`, `HARBOR_USERNAME`, `HARBOR_PASSWORD_FILE` (type *File*) | Exposées uniquement aux pipelines de branches protégées |
| Aucun identifiant VPS, Kubernetes ou Argo CD dans GitLab | La CI ne touche jamais le cluster |
| Environnements GitLab **protégés** : `image-build`, `image-scan`, `harbor-publication`, `preprod-proposal`, réservés aux Admin DevOps | `when: manual` seul n'est pas un contrôle d'autorisation |
| Runner *shell* Debian **dédié et protégé**, tag `facturadj-preprod` | L'accès au daemon Docker équivaut à un accès root sur la machine : aucun job non fiable ne doit y tourner |
| Argo CD : accès **lecture seule** au dépôt GitOps (clé de déploiement) | Une compromission d'Argo CD ne permet pas de réécrire l'état souhaité |
| Actions GitHub épinglées par SHA complet (à faire) | Une action référencée par un tag mobile peut changer sans prévenir |

> **Note** — Si l'offre GitLab ne permet pas les environnements protégés, restreindre l'accès au projet et au runner aux seuls administrateurs.

**Recommandation** (issue de l'étude cible) : installer un crochet `pre-commit` gitleaks pour bloquer un secret avant même le commit.

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.21.2
    hooks: [{id: gitleaks}]
```

<a id="section-6-6"></a>

### 6.6 La validation humaine : qui décide quoi

| Décision | Qui | Où | Trace |
|---|---|---|---|
| Fusion du code | Admin DevOps (revue) | PR GitHub | Historique de la PR |
| Transfert vers GitLab | Admin DevOps | Clone DEV | SHA identique dans GitHub et GitLab |
| Construction des images | Admin DevOps | `packer build` ou job `build_images` | Manifestes Packer, journal du job |
| Publication dans Harbor | Admin DevOps, après tests et scan | `images.sh push` ou job `push_harbor` | `release/digests.json`, journal d'audit Harbor |
| Promotion GitOps | Admin DevOps (approbation MR) | MR `promote/sha-<SHA>` | Historique du dépôt GitOps |
| Synchronisation | Admin DevOps | `argocd app sync` | `argocd app history` |
| Migration de base | Admin DevOps, après sauvegarde | Job `facturadj-migrate-<sha12>` | Journal du Job, fichier de sauvegarde |
<a id="mise-en-pratique--chapitre-6"></a>

### Mise en pratique — chapitre 6

**Transférer un commit sans le transformer.** Le miroir applicatif doit contenir le même SHA que le commit approuvé sur GitHub. Le dépôt GitOps produit, lui, un nouveau commit contenant les digests. **Exercice :** comparer les identités des deux opérations et expliquer pourquoi créer un commit supplémentaire dans le miroir ne constitue plus le même transfert.

<a id="synthese-du-chapitre-6"></a>

#### Synthèse du chapitre 6

**À retenir**

- GitHub porte le développement, la revue, les tests et la compilation Astro de contrôle. Les workflows ne construisent ni ne publient les images de release et ne détiennent pas les accès au cluster.
- GitLab porte deux projets **distincts** : le miroir applicatif (le code approuvé) et le dépôt GitOps (l'état souhaité du cluster). Ne jamais les confondre.
- Le transfert est un `git push <SHA>:main` : on pousse un commit identifié, puis on **vérifie que le SHA est identique des deux côtés**.
- La protection de branche et la revue sont complémentaires : l'une empêche l'écriture directe, l'autre garantit qu'un humain a lu le changement.

**Les pièges classiques**

| Le piège | Pourquoi on tombe dedans | Le bon réflexe |
|---|---|---|
| Pousser une branche entière vers le miroir | C'est le geste Git habituel | On transfère un SHA approuvé, pas un historique en cours. `git push <SHA>:main` |
| Glisser un token dans l'URL du remote | C'est le moyen le plus rapide de s'authentifier | Le token se retrouve dans `.git/config`, dans l'historique du shell et dans les journaux. Utiliser les mécanismes d'authentification prévus |
| Oublier de comparer les SHA après le push | Le push a « réussi », donc tout va bien | Un miroir décalé fait construire un autre code que celui relu. La comparaison est une porte, pas une formalité |

**Vérifiez votre compréhension**

1. Que transfère-t-on exactement de GitHub vers GitLab, et comment le vérifie-t-on ? *(→ [6.4](#section-6-4))*
2. Pourquoi ne jamais faire figurer un token dans une URL Git ? *(→ [6.5](#section-6-5))*
3. Les deux projets GitLab servent-ils au même usage ? *(→ [6.2](#section-6-2))*

> **Réponses** — **1.** Un SHA approuvé, poussé avec `git push <SHA>:main`, puis contrôlé : le SHA doit être identique côté GitHub et côté GitLab. **2.** Parce qu'il persiste dans la configuration du dépôt, dans l'historique du shell et dans les journaux, et qu'il survit à la rotation des personnes. **3.** Non : le miroir applicatif contient le code approuvé, le dépôt GitOps contient l'état souhaité du cluster. Ils ont des droits et des rythmes différents.

**Où aller ensuite** — Le [chapitre 7](#chapitre-07) décrit l'entrepôt où les images construites deviennent des artefacts scellés.

<a id="chapitre-07"></a>

## 7. Harbor

> **En une phrase** — Harbor conserve et distribue les images ; digests, droits et rétention permettent de choisir une version et de la retrouver.

**Ce que vous saurez faire à la fin de ce chapitre**

1. Définir registry, projet, repository, tag et digest, et écrire une référence d'image complète.
2. Expliquer pourquoi FacturaDJ déploie par digest et jamais par tag.
3. Distinguer les deux comptes robots, leurs droits et le stockage de leurs secrets.
4. Énoncer les politiques d'immutabilité, de rétention et de quota, et ce qu'elles protègent.
5. Diagnostiquer les erreurs `x509`, `401`, `403` et un refus de push sur tag existant.

**Prérequis** — [chapitre 5](#chapitre-05) · **Lecture** — 7 min · **Nature** — architecture et exploitation

<a id="section-7-1"></a>

### 7.1 Qu'est-ce qu'une registry ?

Une **registry** est un serveur qui stocke et distribue des images de conteneurs selon le standard OCI. Kubernetes y télécharge (*pull*) les images à exécuter ; la chaîne de construction y dépose (*push*) les nouvelles versions.

**Harbor** est une registry libre, projet de la CNCF, qui ajoute à ce stockage des fonctions d'entreprise : projets privés, comptes robots, scan de vulnérabilités, politiques d'immutabilité et de rétention, quotas, journal d'audit.

> **Analogie** — Harbor joue le rôle d'un entrepôt sécurisé qui contient les différentes versions des images de l'application. Chaque carton porte une étiquette (le tag) et une empreinte vérifiable (le digest). Seuls les livreurs habilités déposent, seuls les transporteurs autorisés retirent.

```text
Docker build (piloté par Packer)
  │
  ▼
Image
  │
  ▼
Harbor : projet privé facturadj
     │
     ├── frontend:sha-3f2c…   (release du 12/09)
     ├── frontend:sha-9a41…   (release précédente)
     ├── backend:sha-3f2c…
     └── backend:sha-9a41…
```

Pourquoi une registry **privée** plutôt qu'une registry publique ou GHCR (retenu dans l'étude d'août) ?

- les images contiennent le code métier ;
- l'hébergement et les politiques (immutabilité, rétention, scan) restent maîtrisés ;
- le cluster s'authentifie avec un robot en lecture seule, distinct de celui qui publie.

<a id="section-7-2"></a>

### 7.2 Projet, repositories, tags et digests

| Élément | Valeur FacturaDJ | Rôle |
|---|---|---|
| Registry | `harbor.nexora-djibouti.fr` | Le serveur |
| Projet | `facturadj` (privé) | Espace de droits, de quotas et de politiques |
| Repositories | `facturadj/frontend`, `facturadj/backend` | Une famille d'images |
| Tag | `sha-<SHA complet>` (et éventuellement `vX.Y.Z`) | Nom lisible d'une version |
| Digest | `sha256:<64 hex>` | Identité cryptographique du contenu |

Une référence complète se lit ainsi :

```text
harbor.nexora-djibouti.fr/facturadj/backend:sha-3f2c…e91a
└─────── registry ──────┘ └─projet┘ └repo─┘ └─── tag ───┘

harbor.nexora-djibouti.fr/facturadj/backend@sha256:9b1e…
                                            └─ digest ─┘
```

> **Analogie — tag et digest** — Le **tag** est une étiquette collée sur un carton : on peut la décoller et la recoller sur un autre carton. Le **digest** est l'empreinte digitale du contenu : si un seul octet change, l'empreinte change.

C'est pourquoi FacturaDJ **déploie par digest** : ce qui a été testé et scanné est exactement ce qui tourne.

<a id="section-7-3"></a>

### 7.3 Les comptes robots

Un **compte robot** est un compte technique limité à un projet et à des permissions précises. Harbor impose d'accorder *Pull* pour accorder *Push*.

| Robot | Permissions | Utilisé par | Stockage du secret |
|---|---|---|---|
| **Publication** | Pull Repository + Push Repository, sans suppression ni administration | VM DEV ou runner GitLab | Fichier `~/nexora-secrets/harbor/robot-password` (mode 600) ou variable GitLab protégée de type *File* |
| **Lecture k3d** | Pull Repository uniquement | Cluster k3d | Secret Kubernetes `harbor-pull` dans `facturadj-preprod` |

Règles :

- ne jamais utiliser le compte administrateur Harbor en CI ;
- prévoir une date d'expiration et une rotation des deux robots ;
- les noms de robots contiennent un `$` (`robot$facturadj+publication`) : les saisir avec `read`, jamais en clair dans une commande où le shell l'interpréterait.

<a id="section-7-4"></a>

### 7.4 Scans, SBOM et signature

| Fonction | État actuel | Détail |
|---|---|---|
| **Scan avant publication** | Actif | `images.sh scan` analyse avec Trivy l'archive exacte qui sera poussée ; `HIGH` ou `CRITICAL` bloque ([8.5](#section-8-5)) |
| **Scan dans Harbor** | À configurer | Activer le scanner intégré (Trivy) et le *scan on push*, en seconde ligne |
| **Blocage des images vulnérables** | À configurer | Politique de projet « empêcher le pull des images vulnérables » au-delà d'un seuil |
| **SBOM** | Actif, conservé hors Harbor | `release/<composant>.sbom.json` au format CycloneDX, produit par Trivy |
| **Signature** | **Non implémentée** | Cible : Cosign par digest et politique de vérification ([14.2.8](#section-14-2-8)) |

Un **SBOM** (*Software Bill of Materials*) est l'inventaire des composants détectés dans une image. Il permet de répondre en quelques secondes à la question « suis-je touché par cette nouvelle vulnérabilité ? » sans rescanner toutes les images.

<a id="section-7-5"></a>

### 7.5 Immutabilité, rétention et quotas

| Politique | Réglage recommandé | Pourquoi |
|---|---|---|
| **Immutabilité des tags** | Règles sur `sha-*` et `v*` | Un tag publié ne peut plus être réécrit : un nouveau contenu exige un nouveau commit, donc un nouveau tag |
| **Rétention** | Conserver au minimum les N dernières `sha-*` (par exemple 10) et tous les `v*` | Libérer l'espace sans perdre les versions de retour arrière |
| **Quota** | Plafond par projet | Éviter qu'une boucle de publication remplisse le disque |

> **Attention** — Harbor ne connaît pas le dépôt GitOps. Avant toute purge, vérifier dans l'historique GitOps qu'aucune version encore susceptible d'un retour arrière n'est concernée.

> **À valider** — Ces politiques sont à configurer dans l'interface Harbor **avant** la première publication. Leur présence n'est vérifiable que sur l'instance réelle.

<a id="section-7-6"></a>

### 7.6 Publier dans Harbor

La méthode recommandée est `bash infra/ci/images.sh push`, qui ajoute des contrôles que `docker push` seul ne fait pas. Le détail est donné en [8.5](#section-8-5) et la procédure en [17.9](#section-17-9).

Pour comprendre ce qui se passe, voici la variante manuelle :

```bash
# MODIFICATION LOCALE : fichier créé préalablement par vous
chmod 600 ~/nexora-secrets/harbor/robot-password
read -r -p 'Nom exact du robot de publication : ' HARBOR_USERNAME
export HARBOR_USERNAME
export HARBOR_PASSWORD_FILE="$HOME/nexora-secrets/harbor/robot-password"

# MODIFICATION : authentification sans secret dans les arguments de la commande
cat "$HARBOR_PASSWORD_FILE" | docker login harbor.nexora-djibouti.fr \
  --username "$HARBOR_USERNAME" --password-stdin

# MODIFICATION DISTANTE, après tests et scans
docker push "harbor.nexora-djibouti.fr/facturadj/frontend:$TAG"
docker push "harbor.nexora-djibouti.fr/facturadj/backend:$TAG"

# LECTURE : digests obtenus
docker image inspect --format '{{json .RepoDigests}}' "harbor.nexora-djibouti.fr/facturadj/backend:$TAG"
docker image inspect --format '{{json .RepoDigests}}' "harbor.nexora-djibouti.fr/facturadj/frontend:$TAG"
```

| Élément | Explication |
|---|---|
| `--password-stdin` | Le mot de passe ne figure ni dans les arguments, ni dans l'historique du shell |
| `docker push ...:$TAG` | Envoie les couches manquantes et le manifeste ; Harbor calcule le digest |
| `RepoDigests` | Liste `registry/repo@sha256:...` connue après le push |

> **Attention** — La variante manuelle laisse l'identifiant dans `~/.docker/config.json` et ne vérifie ni les archives scannées ni le label de révision. Préférer `images.sh push`, qui utilise une configuration Docker éphémère supprimée à la fin.

<a id="section-7-7"></a>

### 7.7 Le reçu des digests

La publication produit `release/digests.json`, qui lie **les deux digests** au même commit. Ce fichier alimente la proposition GitOps.

```json
{
  "source_revision": "<SHA complet>",
  "tag": "sha-<SHA complet>",
  "backend": "harbor.nexora-djibouti.fr/facturadj/backend@sha256:<64 hex>",
  "frontend": "harbor.nexora-djibouti.fr/facturadj/frontend@sha256:<64 hex>"
}
```

<a id="section-7-8"></a>

### 7.8 Consommer les images depuis k3d

Le cluster tire les images grâce au Secret `harbor-pull` (type `kubernetes.io/dockerconfigjson`), référencé par `imagePullSecrets` dans chaque Deployment et dans le Job de migration. Il contient **uniquement le robot de lecture**. Sa création est décrite en [17.11](#section-17-11).

<a id="section-7-9"></a>

### 7.9 Erreurs fréquentes

| Symptôme | Cause probable | Action |
|---|---|---|
| `x509: certificate signed by unknown authority` | Certificat Harbor invalide ou CA absente | Réparer le certificat ou installer la CA. **Jamais** `insecure-registries` |
| `401 Unauthorized` | Nom du robot erroné (le `$`), secret expiré | Vérifier le nom exact et la date d'expiration |
| `403 Forbidden` | Robot sans droit sur ce projet ou cette action | Vérifier les permissions du robot |
| Push refusé sur un tag existant | Règle d'immutabilité | Normal : un nouveau contenu exige un nouveau commit et un nouveau tag |
| `Digest registry ambigu ou absent` | Plusieurs ou aucun `RepoDigests` pour ce préfixe | Arrêter ; vérifier l'image locale et le push |
<a id="mise-en-pratique--chapitre-7"></a>

### Mise en pratique — chapitre 7

**Préserver une image de retour.** Une nouvelle release fonctionne, mais une purge Harbor supprime l'image précédente. Le journal Git conserve sa référence ; il ne contient pas ses octets. **Contrôle :** avant de nettoyer Harbor, inventorier les digests en service et ceux nécessaires au repli. Une politique de rétention doit préserver la durée de retour décidée.

<a id="synthese-du-chapitre-7"></a>

#### Synthèse du chapitre 7

**À retenir**

- Un **tag** est une étiquette que l'on peut recoller ailleurs ; un **digest** est l'empreinte du contenu. Ce qui est testé et scanné n'est identifié de façon sûre que par son digest.
- Deux robots, deux périmètres : publication (Pull + Push, sur la VM DEV ou le runner) et lecture (Pull seul, dans le cluster via le Secret `harbor-pull`). Jamais le compte administrateur en CI.
- Les noms de robots contiennent un `$` : les saisir avec `read`, jamais en clair dans une commande où le shell l'interpréterait.
- L'**immutabilité** des tags transforme une erreur en obstacle visible : un nouveau contenu exige un nouveau commit, donc un nouveau tag.
- Le **SBOM** permet de répondre à « suis-je touché par cette vulnérabilité ? » sans rescanner toutes les images. Il est conservé hors Harbor, dans `release/`.

**Les pièges classiques**

| Le piège | Pourquoi on tombe dedans | Le bon réflexe |
|---|---|---|
| Ajouter `insecure-registries` pour dépasser une erreur `x509` | Cela débloque immédiatement | On désactive la vérification du certificat pour **toutes** les images. Réparer le certificat ou installer la CA |
| Purger d'anciens tags pour libérer de l'espace | Le quota est atteint | Harbor ignore le dépôt GitOps : vérifier d'abord qu'aucune version encore susceptible d'un retour arrière n'est concernée |
| S'étonner d'un push refusé sur un tag existant | Le message ressemble à une erreur | C'est la règle d'immutabilité qui fonctionne. Produire un nouveau commit |
| Utiliser le compte administrateur dans la CI | C'est le seul compte dont on a le mot de passe sous la main | Un compte admin en CI donne les droits de suppression et d'administration à un pipeline |

**Vérifiez votre compréhension**

1. Quelle est la différence pratique entre un tag et un digest ? *(→ [7.2](#section-7-2))*
2. Pourquoi deux comptes robots plutôt qu'un seul ? *(→ [7.3](#section-7-3))*
3. Un `docker push` est refusé sur un tag déjà présent : que faire ? *(→ [7.5](#section-7-5), [7.9](#section-7-9))*

> **Réponses** — **1.** Le tag est un nom lisible réaffectable ; le digest est l'identité cryptographique du contenu : un seul octet différent change le digest. **2.** Pour que le cluster, s'il était compromis, ne puisse pas publier d'images : il ne dispose que d'un droit de lecture. **3.** Rien à forcer : c'est la règle d'immutabilité. Un nouveau contenu exige un nouveau commit, donc un nouveau tag `sha-<SHA>`.

**Où aller ensuite** — Le [chapitre 8](#chapitre-08) montre comment les chapitres 4 à 7 s'enchaînent en pipelines, et où sont placées les portes.

<a id="chapitre-08"></a>

## 8. CI/CD

> **En une phrase** — La CI vérifie les changements ; la livraison avance par étapes explicites avec des archives et des reçus contrôlés.

**Ce que vous saurez faire à la fin de ce chapitre**

1. Distinguer intégration continue et déploiement continu, et dire lequel est automatique ici.
2. Lire les deux workflows GitHub et le pipeline GitLab, et dire ce que chacun s'interdit.
3. Expliquer les quatre sous-commandes d'`images.sh` et le rôle de `scanned.sha256`.
4. Énumérer ce que `check_static.py` refuse, et la différence entre ses deux modes.
5. Produire une proposition GitOps avec `prepare_gitops.py` et savoir ce qu'elle n'est pas.

**Prérequis** — [chapitres 4](#chapitre-04) à [7](#chapitre-07) · **Lecture** — 13 min · **Nature** — architecture puis procédure

<a id="section-8-1"></a>

### 8.1 CI et CD : deux métiers différents

```text
CI
=
Construire et vérifier

CD
=
Promouvoir et déployer
```

- L'**intégration continue** (CI) répond à la question : « ce commit est-il sain ? ». Elle compile, teste, analyse, construit les artefacts.
- La **livraison / le déploiement continus** (CD) répond à la question : « comment cet artefact validé arrive-t-il dans un environnement ? ». Elle promeut une version et l'applique.

> **Analogie** — La CI est le contrôle qualité en sortie d'usine : chaque produit est testé et étiqueté. La CD est la logistique : choisir quel lot part vers quel magasin, et le mettre en rayon.

| | CI | CD |
|---|---|---|
| **Chez FacturaDJ** | GitHub Actions (contrôles DEV), jobs GitLab `validate`, `build_images`, `scan_images` | Jobs GitLab `push_harbor`, `propose_gitops`, MR GitOps, Argo CD |
| **Produit** | Verdict, images locales, rapports, SBOM | Images publiées, commit GitOps, application synchronisée |
| **Automatique ?** | Contrôles : oui. Construction : sur décision | Toujours sur décision |

<a id="section-8-2"></a>

### 8.2 Le pipeline de bout en bout

```text
Code
 │
 ▼
Lint ..................... ruff, packer fmt, hadolint, bash -n        GitHub + GitLab
 │
 ▼
Tests .................... Django sur PostgreSQL, build Astro          GitHub (+ GitLab)
 │
 ▼
Security scan ............ pip-audit, bandit, npm audit, check_static  GitHub + GitLab
 │
 ▼
Build .................... Packer ─► BuildKit (2 images)              [manuel] GitLab ou DEV
 │
 ▼
Scan image ............... Trivy HIGH/CRITICAL + SBOM                  [manuel] GitLab ou DEV
 │
 ▼
Harbor ................... push + reçu des digests                    [manuel] GitLab ou DEV
 │
 ▼
GitOps ................... proposition, MR approuvée                   [manuel] GitLab
 │
 ▼
Argo CD .................. diff, puis sync                             [manuel] administration
```

<a id="section-8-3"></a>

### 8.3 GitHub Actions : les contrôles DEV

**GitHub Actions** exécute des *workflows* décrits en YAML dans `.github/workflows/`. Un workflow contient des *jobs*, chacun composé d'*étapes* (*steps*), exécutés sur des machines éphémères (*runners*).

FacturaDJ en a deux : ils testent et peuvent compiler le frontend, mais **ne construisent pas les images de release, ne les publient pas et ne déploient pas**.

```yaml
# .github/workflows/dev.yml (identique à infra/ci/github-actions-app.yml)
name: FacturaDJ DEV - controles seulement
"on":
  pull_request:
    branches: [main]                 # chaque PR vers main
  push:
    branches: ["feature/**", main]   # chaque push sur une branche de travail
  workflow_dispatch:                 # lancement manuel possible
permissions:
  contents: read                     # le workflow ne peut rien écrire
jobs:
  statique:                          # validation des fichiers d'infrastructure
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
        with: {persist-credentials: false}
      - uses: actions/setup-python@v5
        with: {python-version: "3.12"}
      - run: python -m pip install PyYAML==6.0.2 ruff==0.11.13
      - run: python infra/ci/check_static.py
      - run: ruff check --select E9,F63,F7,F82 backend    # erreurs de syntaxe et noms indéfinis
      - run: bash -n infra/ci/images.sh
  backend:                           # tests Django sur un vrai PostgreSQL
    runs-on: ubuntu-24.04
    services:
      postgres:
        image: postgres:17-bookworm
        env:
          POSTGRES_DB: facturadj
          POSTGRES_USER: facturadj
          POSTGRES_PASSWORD: ci-disposable   # valeur jetable du service CI, aucun compte réel
        ports: ["5432:5432"]
        options: --health-cmd "pg_isready -U facturadj" --health-interval 5s --health-retries 20
    steps:
      - uses: actions/checkout@v4
        with: {persist-credentials: false}
      - uses: actions/setup-python@v5
        with: {python-version: "3.12"}
      - name: Dépendances vérifiées
        run: |
          test -s backend/requirements.lock
          python -m pip install --require-hashes -r backend/requirements.lock
          python -m pip install pip-audit==2.9.0 bandit==1.8.3
      - name: Tests PostgreSQL
        working-directory: backend
        env:
          DATABASE_URL: postgres://facturadj:ci-disposable@localhost:5432/facturadj
        run: python manage.py test --settings=config.ci_settings --verbosity 2
      - run: pip-audit -r backend/requirements.lock --strict       # vulnérabilités connues
      - run: bandit -r backend/apps backend/config -ll --exclude backend/config/test_health.py,backend/config/test_settings.py
  frontend:                          # compilation Astro et audit npm
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
        with: {persist-credentials: false}
      - uses: actions/setup-node@v4
        with: {node-version: "22", cache: npm, cache-dependency-path: frontend/package-lock.json}
      - working-directory: frontend
        run: |
          npm ci
          node --check astro.config.mjs
          npm run build
          npm audit --omit=dev --audit-level=high
# Aucun credential Harbor/GitLab/cluster, aucune promotion depuis GitHub.
```

Le second workflow, `.github/workflows/packer.yml`, se déclenche sur les PR qui modifient `infra/packer/**` : il installe Packer 1.15.3 et exécute `packer fmt -check -diff .`, `packer validate -syntax-only .` et `bash -n scripts/build-app-image.sh`. La validation complète, avec les vraies variables, se fait sur la VM DEV ou dans GitLab.

> **Note** — Les fichiers `infra/ci/github-actions-app.yml` et `infra/ci/github-actions-packer.yml` sont des copies strictement identiques des workflows actifs, gardées comme modèles. Toute modification doit être reportée dans les deux.

<a id="section-8-4"></a>

### 8.4 GitLab CI : le pipeline PREPROD

**GitLab CI** lit `.gitlab-ci.yml` à la racine du dépôt. Un pipeline est composé d'étapes (*stages*) exécutées dans l'ordre ; chaque étape contient des *jobs*, exécutés par un *runner*.

```yaml
# .gitlab-ci.yml — commenté
workflow:
  rules:
    - if: '$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH'   # pipeline sur main (après transfert du SHA)
    - if: '$CI_PIPELINE_SOURCE == "web"'              # ou lancé depuis l'interface
    - when: never                                     # jamais ailleurs
stages: [validate, build, scan, publish, propose]
default:
  tags: [facturadj-preprod]      # uniquement le runner shell dédié et protégé
  interruptible: false
  timeout: 30m

validate:                        # AUTOMATIQUE : contrôles sans effet de bord
  stage: validate
  script:
    - python3 infra/ci/check_static.py
    - bash -n infra/ci/images.sh
    - bash -n infra/packer/scripts/build-app-image.sh
    - packer fmt -check infra/packer
    - packer validate -syntax-only infra/packer
    - hadolint infra/docker/backend/Dockerfile infra/docker/frontend/Dockerfile
    - test -s backend/requirements.lock
    - python3.12 -m venv /tmp/facturadj-ci-$CI_JOB_ID
    - /tmp/facturadj-ci-$CI_JOB_ID/bin/pip install --require-hashes -r backend/requirements.lock
    - cd backend
    # Tests sans base partagée sur le runner ; les tests PostgreSQL sont faits côté GitHub.
    - /tmp/facturadj-ci-$CI_JOB_ID/bin/python manage.py test --settings=config.test_settings --verbosity 2
  after_script:
    - python3 -c "import shutil,os; shutil.rmtree('/tmp/facturadj-ci-'+os.environ['CI_JOB_ID'], ignore_errors=True)"

build_images:                    # PORTE MANUELLE : Packer construit les deux images
  stage: build
  needs: [validate]
  when: manual
  allow_failure: false           # le pipeline reste bloqué tant que ce job n'a pas réussi
  environment: {name: image-build}
  script:
    - export TAG="sha-$CI_COMMIT_SHA" SOURCE_REV="$CI_COMMIT_SHA"
    - bash infra/ci/images.sh build
  artifacts:
    paths: [release/]
    expire_in: 1 day             # archives volumineuses : reconstruire si elles ont expiré

scan_images:                     # PORTE MANUELLE : Trivy + SBOM sur les archives exactes
  stage: scan
  needs: [{job: build_images, artifacts: true}]
  when: manual
  allow_failure: false
  environment: {name: image-scan}
  script:
    - export TAG="sha-$CI_COMMIT_SHA" SOURCE_REV="$CI_COMMIT_SHA"
    - bash infra/ci/images.sh scan
  artifacts:
    paths: [release/]
    expire_in: 1 day

push_harbor:                     # PORTE MANUELLE : publication et reçu des digests
  stage: publish
  needs: [{job: scan_images, artifacts: true}]
  when: manual
  allow_failure: false
  environment: {name: harbor-publication}
  resource_group: harbor-publication   # une seule publication à la fois
  script:
    - export TAG="sha-$CI_COMMIT_SHA" SOURCE_REV="$CI_COMMIT_SHA"
    - bash infra/ci/images.sh push
  artifacts:
    paths: [release/digests.json]
    expire_in: 7 days

propose_gitops:                  # PORTE MANUELLE : produit un ARTEFACT, jamais un commit
  stage: propose
  needs: [{job: push_harbor, artifacts: true}]
  when: manual
  allow_failure: false
  environment: {name: preprod-proposal}
  script:
    - python3 infra/ci/prepare_gitops.py --receipt release/digests.json --output release/gitops
  artifacts:
    paths: [release/gitops/]
    expire_in: 7 days
# La proposition est un artefact à relire. Aucun git push ou sync dans ce pipeline.
```

| Mot-clé | Signification |
|---|---|
| `needs` | Ordre et transmission des artefacts entre jobs |
| `when: manual` | Le job attend un clic |
| `allow_failure: false` | Un job manuel non exécuté ou en échec bloque la suite |
| `environment` | Rattache le job à un environnement, que l'on peut **protéger** |
| `resource_group` | Empêche deux exécutions simultanées |
| `artifacts.expire_in` | Durée de conservation des fichiers produits |

Outils attendus sur le runner, en versions figées : Python 3.12 et PyYAML, Packer 1.15.3, Docker et Buildx, Trivy, Hadolint.

<a id="section-8-5"></a>

### 8.5 Le script `images.sh`

`infra/ci/images.sh` découpe la chaîne en quatre sous-commandes. **Une invocation = une étape** : `build` n'appelle jamais `scan` ni `push`.

| Sous-commande | Préconditions vérifiées | Actions | Sorties |
|---|---|---|---|
| `build` | `TAG` = `sha-$SOURCE_REV`, SHA de 40 caractères | `packer validate`, `packer build -parallel-builds=1`, puis `bundle` | Images locales, archives et reçus Packer |
| `bundle` | Empreintes des deux archives ; les deux `.image.json` portent le même SHA et le même tag | Écrit `release/source-revision` et `release/images.sha256` | Paire d'archives cohérente |
| `scan` | `source-revision` = SHA courant ; `images.sha256` vérifié | `trivy image --input release/<c>.tar --severity HIGH,CRITICAL --exit-code 1`, SBOM CycloneDX | `<c>.trivy.json`, `<c>.sbom.json`, `scanned.sha256` |
| `push` | `HARBOR_USERNAME`, `HARBOR_PASSWORD_FILE` ; archives identiques à celles scannées (`cmp`) | Configuration Docker éphémère, `docker login --password-stdin`, `docker load`, contrôle du label `revision`, `docker push` | `release/digests.json` |

Le point clé de sécurité est le fichier `scanned.sha256` : il n'est écrit **qu'après** un scan réussi, et `push` refuse de publier des archives dont l'empreinte diffère. Ce contrôle détecte une divergence dans le workflow prévu. Il ne remplace ni les droits d'accès, ni la protection du runner, ni une attestation signée.

```bash
# Extrait commenté de la sous-commande push
cmp release/images.sha256 release/scanned.sha256     # les archives sont celles qui ont été scannées
(cd release && sha256sum -c scanned.sha256)           # et elles n'ont pas été modifiées depuis
task_docker_config=$(mktemp -d)                       # identifiants Docker temporaires
export DOCKER_CONFIG="$task_docker_config"
trap 'rm -rf -- "$task_docker_config"' EXIT           # supprimés quoi qu'il arrive
cat "$HARBOR_PASSWORD_FILE" | docker login harbor.nexora-djibouti.fr \
  --username "$HARBOR_USERNAME" --password-stdin
for component in backend frontend; do
  docker load -i "release/$component.tar"
  actual=$(docker image inspect --format \
    '{{index .Config.Labels "org.opencontainers.image.revision"}}' "$REGISTRY/$component:$TAG")
  test "$actual" = "$SOURCE_REV"                      # l'image vient bien du commit approuvé
  docker push "$REGISTRY/$component:$TAG"
done
```

> **Attention** — Le scan actif **n'ignore pas** les vulnérabilités sans correctif disponible (pas d'option `--ignore-unfixed`). L'étude d'août recommandait l'inverse. Cette divergence est une décision à prendre ([Annexe F](#annexe-f)) ; en attendant, la règle stricte s'applique et ne doit pas être contournée par `|| true`.

<a id="section-8-6"></a>

### 8.6 La validation statique `check_static.py`

`infra/ci/check_static.py` est un contrôle **en lecture seule**, sans accès réseau ni sous-processus. Il tourne dans GitHub, dans GitLab et à la main.

| Famille | Ce qui est vérifié |
|---|---|
| Syntaxe | Tous les YAML de `infra/`, des workflows et de `.gitlab-ci.yml` ; syntaxe Python de `backend/config` |
| Frontend | `package.json` cohérent avec `package-lock.json` ; `@astrojs/node` présent en dépendance d'exécution |
| Argo CD | Aucune `Application` avec `automated`, aucun `finalizer` destructeur |
| GitLab | `build_images`, `scan_images`, `push_harbor`, `propose_gitops` sont `when: manual` et `allow_failure: false` |
| GitHub | Aucun `docker/login-action`, `docker/build-push-action`, `packer build`, `git push`, `argocd app sync` dans les workflows |
| Kustomize | Graphe de `overlays/preprod` résolu ; aucun objet `Route`, `SecurityContextConstraints`, `Cluster` (CNPG), `ExternalSecret` ni `Secret` |
| Dockerfiles | Deux `FROM` (multi-étapes), `USER 10001:10001`, `HEALTHCHECK` ; anciens chemins `Dockerfile.backend` et `Dockerfile.frontend` identiques |
| `.dockerignore` | Exclusion de `.env`, `.env.*`, `*.key`, `*.sqlite*`, `.venv` |
| Packer | Anciennes recettes entièrement commentées ; cibles `null` avec `communicator = "none"`, `artifice` et appel de `build-app-image.sh` ; aucun plugin QEMU |
| Scripts | Aucun retour chariot Windows dans `infra/packer/scripts/*.sh` |

Deux modes :

```bash
# LECTURE — mode préparation : les valeurs à renseigner sont tolérées
python3 infra/ci/check_static.py

# LECTURE — mode release : refuse example.invalid, RENSEIGNER, sha256:000…, lock absent
python3 infra/ci/check_static.py --release --gitops-root release/gitops
```

Résultat attendu en mode préparation :

```text
OK : <n> YAML, syntaxe Python/JSON, graphe k3d, CI manuelle, Docker et archives Packer.
Mode préparation : les valeurs à renseigner et le lock Python ne sont pas validés pour déploiement.
```

> **Note** — Lors de la préparation du 12/09/2026, ces contrôles et `packer fmt`, `validate` et `inspect` ont été exécutés avec des valeurs fictives (Packer 1.15.3 téléchargé et vérifié par empreinte). **Aucune image n'a été construite** et aucun provisioner n'a tourné. Une validation statique ne prouve pas qu'une construction réussira.


> **Périmètre du contrôle statique.** Le mode `--release` vérifie la présence du lock, certaines sentinelles dans cinq fichiers et le format des digests de l'overlay. Il ne prouve pas l'existence des images dans Harbor, la validité du certificat, la santé du cluster ni l'absence de toutes les sentinelles dans chaque ressource. Le graphe analysé par le script utilise aussi des fichiers du dépôt applicatif. Toujours relire le rendu complet de la proposition et contrôler le Job séparément.

<a id="section-8-7"></a>

### 8.7 La proposition GitOps `prepare_gitops.py`

`infra/ci/prepare_gitops.py` transforme le reçu des digests en une **proposition locale** de dépôt GitOps. Il n'effectue ni commit, ni push, ni `kubectl apply`.

Ce qu'il fait :

1. vérifie le reçu : SHA de 40 caractères, tag égal à `sha-<SHA>`, deux digests Harbor valides et non nuls ;
2. copie `infra/k8s/k3d`, `infra/k8s/overlays/preprod`, `infra/k8s/operations` et `infra/argocd` depuis la source ;
3. inscrit les digests backend et frontend dans `overlays/preprod/kustomization.yaml` ;
4. renomme le Job de migration en `facturadj-migrate-<12 premiers caractères du SHA>` et lui donne le digest backend ;
5. écrit `receipt.json` dans la proposition.

Garde-fous : le dossier de sortie ne doit pas exister et doit rester hors de `infra/`.

| Situation | Commande | Source des paramètres |
|---|---|---|
| Première promotion | `python3 infra/ci/prepare_gitops.py --receipt release/digests.json --output release/gitops` | Modèles du dépôt applicatif, avec valeurs factices à remplacer |
| Promotions suivantes | `python3 infra/ci/prepare_gitops.py --base "$GITOPS_DIR" --receipt release/digests.json --output "release/gitops-$TAG"` | Dépôt GitOps existant : domaine, digests PostgreSQL et Redis, stockage déjà validés |

<a id="section-8-8"></a>

### 8.8 Deux parcours possibles, un seul par release

| | Parcours A : VM DEV | Parcours B : pipeline GitLab |
|---|---|---|
| **Construction** | `packer build` puis `images.sh bundle` | Job `build_images` |
| **Tests smoke** | Docker Compose sur la VM DEV | À faire sur la VM DEV avec les images publiées, ou avant publication selon votre organisation |
| **Scan** | `images.sh scan` | Job `scan_images` |
| **Publication** | `images.sh push` | Job `push_harbor` |
| **Proposition GitOps** | `prepare_gitops.py` à la main | Job `propose_gitops`, artefact à télécharger |
| **Quand le choisir** | Mise au point, première release | Releases courantes, traçabilité dans GitLab |

> **Attention** — Ne jamais lancer les deux parcours pour la même release : deux constructions du même commit peuvent produire des digests différents, et les tags immuables de Harbor refuseraient la seconde publication.

<a id="section-8-9"></a>

### 8.9 Évolutions CI/CD envisagées

> **Cible PROD** — Les éléments suivants proviennent de l'étude d'août. Ils ne sont pas implémentés et sont listés pour préparer la suite.

| Évolution | Outil proposé | Intérêt | Condition |
|---|---|---|---|
| Qualité et dette | SonarQube, portail qualité bloquant | Couverture, duplications, code smells | Serveur SonarQube disponible |
| Mises à jour de dépendances | Renovate (PR automatiques) | Correctifs de sécurité appliqués rapidement | Politique de fusion définie |
| Signature d'images | Cosign | Garantir que l'image déployée est celle construite | Gestion des clés ou OIDC |
| Test dynamique | ZAP baseline, non bloquant | Détecter des défauts d'en-têtes et d'exposition | PREPROD accessible au scanner |
| Cache de construction | Cache BuildKit partagé | Constructions plus rapides | Stockage du cache maîtrisé |
| Détection de secrets | gitleaks en pre-commit et en CI | Bloquer une fuite avant le push | — |

Configuration Renovate proposée (à adapter à GitLab ou GitHub) :

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:recommended", ":dependencyDashboard"],
  "timezone": "Africa/Djibouti",
  "schedule": ["before 6am on monday"],
  "packageRules": [
    {
      "description": "Correctifs : fusion automatique si les tests passent",
      "matchUpdateTypes": ["patch"],
      "matchCurrentVersion": "!/^0/",
      "automerge": true
    },
    {
      "description": "Django : jamais automatique, une version peut casser des migrations",
      "matchPackageNames": ["django"],
      "automerge": false,
      "labels": ["revue-obligatoire"]
    }
  ],
  "vulnerabilityAlerts": {"labels": ["securite"], "automerge": false}
}
```

> **Note** — La fusion automatique proposée par Renovate entre en tension avec la règle des portes humaines ([1.4](#section-1-4)). Elle ne concerne que le dépôt de code et reste à arbitrer.
<a id="mise-en-pratique--chapitre-8"></a>

### Mise en pratique — chapitre 8

**Détecter une archive modifiée après scan.** Après le scan, une nouvelle construction remplace frontend.tar. Le contrôle d'empreinte du push doit refuser cette divergence. **Exercice de lecture :** suivre bundle, scan et push dans images.sh. Expliquer pourquoi une personne contrôlant à la fois les archives et les fichiers d'empreintes n'est pas neutralisée par ce mécanisme seul.

<a id="synthese-du-chapitre-8"></a>

#### Synthèse du chapitre 8

**À retenir**

- La CI répond à « ce commit est-il sain ? » ; la CD à « comment cet artefact arrive-t-il dans un environnement ? ». Chez FacturaDJ, les **contrôles** sont automatiques, la **construction** et tout le reste sont sur décision.
- Les workflows GitHub examinés ne déclarent pas d'identifiant Harbor, GitLab ou cluster ; `check_static.py` recherche plusieurs actions sensibles interdites. Ce contrôle textuel ne constitue pas une analyse complète de toutes les commandes possibles.
- **Une invocation = une étape.** `images.sh build` n'appelle jamais `scan` ni `push`.
- `scanned.sha256` n'est écrit qu'après un scan réussi, et `push` refuse des archives dont l'empreinte diffère : le script refuse une divergence. Cette garantie dépend de l'intégrité du runner, des scripts et des fichiers de preuve.
- `prepare_gitops.py` produit une **proposition locale** à relire. Il ne commite pas, ne pousse pas, n'applique rien.

**Les pièges classiques**

| Le piège | Pourquoi on tombe dedans | Le bon réflexe |
|---|---|---|
| Lancer le parcours VM DEV **et** le pipeline GitLab pour la même release | On veut « comparer » ou rattraper un échec | Deux constructions du même commit donnent deux digests différents ; l'immutabilité Harbor refusera la seconde publication. Un seul parcours par release |
| Neutraliser un scan en échec avec `\|\| true` | Le blocage paraît disproportionné | Le scan actif ne tolère pas `HIGH` ni `CRITICAL`, y compris sans correctif disponible. C'est un arbitrage ouvert ([Annexe F](#annexe-f)), pas une option de commande |
| Conclure d'un `check_static.py` vert que la construction réussira | Le contrôle est exhaustif et rassurant | Une validation statique ne lit que des fichiers : elle ne prouve pas qu'un build aboutira |
| Modifier un workflow sans reporter dans `infra/ci` | Les copies sont invisibles depuis `.github` | `infra/ci/github-actions-*.yml` sont des copies strictement identiques : toute modification doit être reportée des deux côtés |

**Vérifiez votre compréhension**

1. À quoi sert précisément le fichier `scanned.sha256` ? *(→ [8.5](#section-8-5))*
2. Pourquoi un seul parcours de construction par release ? *(→ [8.8](#section-8-8))*
3. Que fait `prepare_gitops.py`, et quelles sont ses trois abstentions ? *(→ [8.7](#section-8-7))*

> **Réponses** — **1.** Il enregistre l'empreinte des archives au moment du scan réussi ; `push` compare les archives à publier à cette empreinte et refuse toute divergence. **2.** Parce que deux constructions du même commit peuvent produire des digests différents : la seconde publication serait refusée par l'immutabilité des tags, et la traçabilité deviendrait ambiguë. **3.** Il vérifie le reçu, copie les manifests, inscrit les digests, renomme le Job de migration et écrit `receipt.json`. Il ne commite pas, ne pousse pas et n'applique rien au cluster.

**Où aller ensuite** — La Partie IV commence par le [chapitre 9](#chapitre-09) : où ces images vont réellement tourner.

<!-- PARTIE: Partie IV — Exécuter -->

<a id="chapitre-09"></a>

## 9. Kubernetes et k3d

> **En une phrase** — Kubernetes maintient des ressources déclarées ; le déploiement k3d monohôte de recette en fixe les limites.

**Ce que vous saurez faire à la fin de ce chapitre**

1. Expliquer ce qu'un orchestrateur apporte par rapport à des conteneurs lancés à la main.
2. Distinguer k3s et k3d, et en déduire les limites de la PREPROD.
3. Nommer et situer les objets : Namespace, Pod, Deployment, ReplicaSet, StatefulSet, Service, Ingress, ConfigMap, Secret, PVC.
4. Lire un Deployment de bout en bout, y compris `securityContext` et sondes.
5. Poser des `requests` et des `limits` cohérentes, et lire la capacité réellement disponible.

**Prérequis** — [chapitres 3](#chapitre-03) et [5](#chapitre-05) · **Lecture** — 16 min · **Nature** — cours puis référence d'architecture

<a id="section-9-1"></a>

### 9.1 Pourquoi un orchestrateur ?

Docker peut redémarrer des conteneurs avec une politique adaptée. Kubernetes ajoute une gestion déclarative coordonnée : placement, remplacement des Pods, découverte des services et mises à jour à l'échelle du cluster.

**Kubernetes** inverse la logique. On lui **décrit l'état souhaité** (« je veux un backend en version X, joignable sous tel nom, avec tant de mémoire ») et il travaille en permanence pour que la réalité corresponde à cette description : il démarre, redémarre, remplace et relie les conteneurs.

> **Analogie — le port de commerce** — Le cluster est un port. Les nœuds sont les quais. Les Pods sont les emplacements où l'on pose des conteneurs. Le Deployment est un contrat : « gardez toujours un conteneur de ce modèle en service ». Le Service est un numéro de guichet fixe, même quand le conteneur change de quai. L'Ingress est le portail d'entrée du port. La capitainerie (le plan de contrôle) vérifie sans cesse que tout est conforme aux contrats.

<a id="section-9-2"></a>

### 9.2 k3s et k3d

- **k3s** est une distribution Kubernetes légère et certifiée, publiée par SUSE (Rancher). Un seul binaire embarque ce qu'il faut pour démarrer : containerd, CoreDNS, **Traefik** comme contrôleur Ingress, **local-path-provisioner** pour les volumes, metrics-server, un répartiteur de charge simple et un contrôleur de NetworkPolicy.
- **k3d** exécute k3s **dans des conteneurs Docker**. Chaque « nœud » Kubernetes est un conteneur, et un conteneur `serverlb` sert de répartiteur pour publier les ports vers l'hôte.

```text
VPS nexora-vps (Docker)
│
├── conteneur k3d-<cluster>-serverlb ── ports publiés vers l'hôte (443, 80, API)
│
└── conteneur k3d-<cluster>-server-0 ── k3s : API, containerd, Traefik, CoreDNS,
                                         local-path, metrics-server
                                         │
                                         └── Pods FacturaDJ (namespace facturadj-preprod)
```

Conséquences pour FacturaDJ :

| Fait | Conséquence |
|---|---|
| Tous les nœuds sont des conteneurs sur **un seul VPS** | Aucune haute disponibilité : la perte du VPS arrête tout |
| Les volumes `local-path` résident sur le disque du nœud | Ils doivent être sauvegardés ; ils ne suivent pas un Pod vers une autre machine |
| Traefik et les NetworkPolicies sont fournis par k3s | Pas d'installation séparée, mais des versions liées à celle de k3s |
| Les manifests sont du Kubernetes standard | Ils resteront valables sur un k3s multi-nœuds ou un autre cluster conforme |

> **À valider** — Le nom du cluster, les versions de k3d, k3s, Traefik et Argo CD, les ports publiés par `serverlb` et l'activation du contrôleur de NetworkPolicy (actif par défaut dans k3s, sauf option `--disable-network-policy`) ne figurent dans aucune source. Les relever avec les commandes de [17.11](#section-17-11) et les consigner.

<a id="section-9-3"></a>

### 9.3 Les objets Kubernetes, pas à pas

Chaque objet est présenté avec sa définition, une analogie et son usage dans FacturaDJ.

<a id="cluster-et-nœuds"></a>

#### Cluster et nœuds

Un **cluster** est l'ensemble des machines gérées par un même plan de contrôle. Un **nœud** est une machine (ici, un conteneur k3d) qui exécute des Pods.

```bash
# LECTURE
kubectl --context "$KUBE_CONTEXT" get nodes -o wide
```

```text
NAME                    STATUS   ROLES                  AGE   VERSION
k3d-<cluster>-server-0  Ready    control-plane,master   30d   v1.xx.x+k3s1
```

<a id="namespace"></a>

#### Namespace

Un **namespace** organise les ressources et sert de périmètre aux droits, quotas et politiques réseau. Il n'isole pas, à lui seul, le trafic ou les droits : ces protections doivent être configurées.

> **Analogie** — Un étage réservé dans un immeuble de bureaux : on y range ses affaires sans les mélanger avec celles des autres étages.

FacturaDJ utilise `facturadj-preprod`, créé **hors GitOps** avec les labels Pod Security :

```yaml
# infra/k8s/operations/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: facturadj-preprod
  labels:
    pod-security.kubernetes.io/enforce: restricted   # refuse les Pods non conformes
    pod-security.kubernetes.io/audit: restricted     # journalise les écarts
    pod-security.kubernetes.io/warn: restricted      # avertit à la création
```

<a id="pod"></a>

#### Pod

Le **Pod** est la plus petite unité exécutable : un ou plusieurs conteneurs qui partagent une adresse IP et des volumes. Un Pod est éphémère : ses conteneurs peuvent redémarrer, et un contrôleur peut remplacer le Pod s'il disparaît.

> **Analogie** — Une chambre d'hôtel occupée : on n'y emménage pas pour toujours, et l'hôtel peut vous installer dans une chambre identique à tout moment.

<a id="deployment-et-replicaset"></a>

#### Deployment et ReplicaSet

Un **Deployment** maintient un nombre voulu de Pods identiques et gère leurs mises à jour. Il s'appuie sur des **ReplicaSets**, un par version du modèle de Pod.

FacturaDJ en a trois : `facturadj-backend`, `facturadj-frontend`, `facturadj-redis`. Les deux applications utilisent :

- `replicas: 1` ;
- `strategy: Recreate` : l'ancien Pod est arrêté **avant** le démarrage du nouveau, d'où une courte interruption à chaque mise à jour, acceptable en PREPROD. La production utiliserait `RollingUpdate` ([15.5](#section-15-5)).

<a id="statefulset"></a>

#### StatefulSet

Un **StatefulSet** gère des Pods qui ont besoin d'une **identité stable** et de leur propre volume : nom fixe (`facturadj-postgres-0`), volume créé à partir d'un modèle (`volumeClaimTemplates`) et conservé d'un redémarrage à l'autre. C'est l'objet utilisé pour PostgreSQL.

<a id="service"></a>

#### Service

Un **Service** donne un **nom DNS et une adresse stables** à un groupe de Pods sélectionnés par leurs labels, et répartit le trafic entre eux.

> **Analogie** — Le numéro du standard d'une entreprise : on appelle toujours le même numéro, quel que soit le collègue qui décroche.

| Service | Sélecteur | Port | Nom DNS interne |
|---|---|---|---|
| `facturadj-frontend` | `app: facturadj-frontend` | 4321 | `facturadj-frontend.facturadj-preprod.svc.cluster.local` |
| `facturadj-backend` | `app: facturadj-backend` | 8000 | `facturadj-backend.facturadj-preprod.svc.cluster.local` |
| `facturadj-postgres` | `app: facturadj-postgres` | 5432 | `facturadj-postgres.facturadj-preprod.svc.cluster.local` |
| `facturadj-redis` | `app: facturadj-redis` | 6379 | `facturadj-redis.facturadj-preprod.svc.cluster.local` |

Dans un même namespace, le nom court suffit : `http://facturadj-backend:8000`.

<a id="ingress"></a>

#### Ingress

Un **Ingress** décrit comment le trafic HTTP(S) extérieur atteint un Service : nom de domaine, chemin, certificat. Il est appliqué par un **contrôleur Ingress**, ici Traefik. Seul le frontend a un Ingress. Voir [11.3](#section-11-3).

<a id="configmap"></a>

#### ConfigMap

Une **ConfigMap** stocke une configuration **non secrète** injectée dans les conteneurs.

```yaml
# infra/k8s/k3d/config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: facturadj-config
data:
  DJANGO_DEBUG: '0'
  DJANGO_ALLOWED_HOSTS: localhost,127.0.0.1,facturadj-backend,facturadj-backend.facturadj-preprod.svc.cluster.local
  SECURE_SSL_REDIRECT: '0'                                        # TLS terminé par Traefik
  PUBLIC_FRONTEND_URL: https://preprod.facturadj.example.invalid  # À REMPLACER
  CSRF_TRUSTED_ORIGINS: https://preprod.facturadj.example.invalid # À REMPLACER
  REDIS_URL: redis://facturadj-redis:6379/0
  USE_S3: '0'                                                     # médias sur volume local
  EMAIL_BACKEND: django.core.mail.backends.console.EmailBackend   # aucun envoi réel
```

<a id="secret"></a>

#### Secret

Un **Secret** stocke une donnée sensible. Attention : la représentation YAML de ses valeurs utilise **base64**, ce qui n'est pas un chiffrement ; le chiffrement au repos dépend de la configuration du cluster. Quiconque peut lire les Secrets du namespace peut lire les mots de passe.

| Secret | Contenu | Consommé par |
|---|---|---|
| `facturadj-backend` | `DJANGO_SECRET_KEY`, `DATABASE_URL` | Backend, Job de migration |
| `facturadj-postgres` | `POSTGRES_PASSWORD` | PostgreSQL |
| `facturadj-tls` | Certificat et clé TLS | Ingress (Traefik) |
| `harbor-pull` | Identifiants du robot Harbor en lecture | kubelet, pour tirer les images |

Aucun de ces Secrets n'est dans Git : ils sont créés à la main à partir de fichiers protégés ([17.11](#section-17-11)).

<a id="persistentvolumeclaim-persistentvolume-et-storageclass"></a>

#### PersistentVolumeClaim, PersistentVolume et StorageClass

- Une **StorageClass** décrit un type de stockage (`local-path`).
- Un **PersistentVolumeClaim** (PVC) est une **demande** de volume : taille et mode d'accès.
- Un **PersistentVolume** (PV) est le volume réel, créé automatiquement pour satisfaire la demande.

> **Analogie** — Le PVC est le bon de réservation d'un casier ; le PV est le casier attribué ; la StorageClass est le type de casier proposé par le vestiaire.

| PVC | Taille | Monté par | Contenu |
|---|---|---|---|
| `data-facturadj-postgres-0` | 20 Gi | PostgreSQL | Fichiers de la base |
| `facturadj-media` | 5 Gi | Backend, sur `/app/media` | Fichiers téléversés et générés |

Détails et risques en [12.2](#section-12-2).

<a id="networkpolicy"></a>

#### NetworkPolicy

Une **NetworkPolicy** est un pare-feu entre Pods, décrit par labels. FacturaDJ commence par **tout interdire** (`default-deny`), puis ouvre uniquement les flux nécessaires. Voir [11.6](#section-11-6).

> **Analogie** — Un badge d'accès : par défaut aucune porte ne s'ouvre, puis on programme le badge porte par porte.

<a id="serviceaccount"></a>

#### ServiceAccount

Un **ServiceAccount** est l'identité d'un Pod auprès de l'API Kubernetes. Les applications FacturaDJ n'ont **aucun** besoin de parler à cette API : elles utilisent le compte par défaut avec `automountServiceAccountToken: false`, si bien qu'aucun jeton n'est présent dans les conteneurs.

<a id="job"></a>

#### Job

Un **Job** exécute une tâche jusqu'à son terme, puis s'arrête. La migration de base est un Job lancé à la main ([13.5](#section-13-5)).

<a id="securitycontext-et-pod-security-admission"></a>

#### securityContext et Pod Security Admission

Le **securityContext** fixe les droits d'un Pod et de ses conteneurs (utilisateur, système de fichiers, capabilities, seccomp). **Pod Security Admission** vérifie, à la création, que ces réglages respectent le niveau exigé par le namespace : `restricted` pour FacturaDJ.

<a id="recapitulatif"></a>

#### Récapitulatif

| Objet | Ressources FacturaDJ PREPROD | Fichier |
|---|---|---|
| Namespace | `facturadj-preprod` | `operations/namespace.yaml` |
| Deployment | `facturadj-backend`, `facturadj-frontend`, `facturadj-redis` | `k3d/applications.yaml`, `k3d/data.yaml` |
| StatefulSet | `facturadj-postgres` | `k3d/data.yaml` |
| Service | `facturadj-backend`, `facturadj-frontend`, `facturadj-postgres`, `facturadj-redis` | `k3d/applications.yaml`, `k3d/data.yaml` |
| Ingress | `facturadj` | `k3d/ingress.yaml` |
| ConfigMap | `facturadj-config` | `k3d/config.yaml` |
| PVC | `facturadj-media`, `data-facturadj-postgres-0` | `k3d/media.yaml`, `k3d/data.yaml` |
| NetworkPolicy | `default-deny`, `dns`, `allow-frontend-backend`, `egress-frontend-backend`, `allow-backend-postgres`, `egress-backend-postgres`, `allow-backend-redis`, `egress-backend-redis`, `ingress-traefik` | `k3d/networkpolicies.yaml` |
| Job | `facturadj-migrate-<sha12>` | `operations/migrate.yaml` |
| Secret | `facturadj-backend`, `facturadj-postgres`, `facturadj-tls`, `harbor-pull` | Hors dépôt |

<a id="section-9-4"></a>

### 9.4 Kustomize

**Kustomize** assemble et adapte des fichiers YAML **sans moteur de templates** : les manifests restent du YAML Kubernetes lisible et valide. Il est intégré à `kubectl` (`kubectl kustomize`) et à Argo CD.

Il fonctionne par **couches** : une base (les ressources) et un *overlay* qui la modifie pour un environnement.

```text
infra/k8s/k3d/kustomization.yaml             base : liste des ressources
        ▲
        │ resources: ../../k3d
        │
infra/k8s/overlays/preprod/kustomization.yaml   overlay : namespace + images par digest
```

```yaml
# infra/k8s/overlays/preprod/kustomization.yaml
# Cible k3d indépendante de l'ancienne base OKD.
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: facturadj-preprod          # appliqué à toutes les ressources
resources:
  - ../../k3d
# Les valeurs nulles interdisent une publication utilisable avant promotion.
images:                               # remplace tag par digest dans tous les conteneurs
  - name: harbor.nexora-djibouti.fr/facturadj/backend
    digest: sha256:0000000000000000000000000000000000000000000000000000000000000000
  - name: harbor.nexora-djibouti.fr/facturadj/frontend
    digest: sha256:0000000000000000000000000000000000000000000000000000000000000000
  - name: postgres
    newName: postgres
    digest: sha256:0000000000000000000000000000000000000000000000000000000000000000
  - name: redis
    newName: redis
    digest: sha256:0000000000000000000000000000000000000000000000000000000000000000
```

Les images applicatives des manifests portent le tag `UNPROMOTED` : tant que l'overlay n'a pas reçu de vrais digests, rien de déployable n'existe. `prepare_gitops.py` inscrit les digests backend et frontend ; ceux de PostgreSQL et Redis sont renseignés à la main lors de la première promotion.

Rendu local, pour relire ce qu'Argo CD appliquera :

```bash
# VALIDATION LOCALE : écrit seulement le rendu
kustomize build release/gitops/infra/k8s/overlays/preprod > release/preprod.rendered.yaml
# ou, sans installer kustomize :
kubectl kustomize release/gitops/infra/k8s/overlays/preprod > release/preprod.rendered.yaml
```

> **Note** — Helm, autre outil courant, est volontairement réservé aux composants tiers. Pour deux applications, une couche de templates n'apporterait que de la complexité.

<a id="section-9-5"></a>

### 9.5 Le Deployment backend commenté

Le frontend suit la même structure (port 4321, sondes sans barre finale, variable `API_URL`, pas de volume média).

```yaml
# infra/k8s/k3d/applications.yaml — Deployment backend
apiVersion: apps/v1
kind: Deployment
metadata:
  name: facturadj-backend
spec:
  replicas: 1
  strategy:
    type: Recreate                        # arrêt puis démarrage : courte coupure en PREPROD
  selector:
    matchLabels: {app: facturadj-backend}
  template:
    metadata:
      labels: {app: facturadj-backend}    # label utilisé par le Service et les NetworkPolicies
    spec:
      automountServiceAccountToken: false # aucun jeton d'API Kubernetes dans le Pod
      securityContext:
        runAsNonRoot: true
        runAsUser: 10001                  # identique à USER dans le Dockerfile
        runAsGroup: 10001
        fsGroup: 10001                    # les volumes montés appartiennent au groupe 10001
        seccompProfile: {type: RuntimeDefault}
      imagePullSecrets:
      - name: harbor-pull                 # robot Harbor en lecture seule
      containers:
      - name: backend
        image: harbor.nexora-djibouti.fr/facturadj/backend:UNPROMOTED   # remplacé par le digest
        ports:
        - {name: http, containerPort: 8000}
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities: {drop: [ALL]}
        resources:
          requests: {cpu: 100m, memory: 128Mi}   # réservé pour la planification
          limits: {cpu: '1', memory: 512Mi}      # plafond ; au-delà de 512 Mi : OOMKilled
        livenessProbe:                    # le processus vit-il ? (jamais la base)
          httpGet:
            path: /healthz/
            port: http
            httpHeaders: [{name: Host, value: localhost}]   # hôte présent dans ALLOWED_HOSTS
          timeoutSeconds: 4
          periodSeconds: 10
          failureThreshold: 3
        readinessProbe:                   # peut-il recevoir du trafic ? (base + cache)
          httpGet:
            path: /readyz/
            port: http
            httpHeaders: [{name: Host, value: localhost}]
          timeoutSeconds: 4
          periodSeconds: 10
          failureThreshold: 3
        startupProbe:                     # laisse jusqu'à 30 × 10 s pour démarrer
          httpGet:
            path: /healthz/
            port: http
            httpHeaders: [{name: Host, value: localhost}]
          timeoutSeconds: 4
          periodSeconds: 10
          failureThreshold: 30
        volumeMounts:
        - {name: tmp, mountPath: /tmp}          # seul répertoire temporaire inscriptible
        - {name: media, mountPath: /app/media}  # fichiers téléversés
        envFrom:
        - configMapRef: {name: facturadj-config}
        - secretRef: {name: facturadj-backend}
      volumes:
      - name: tmp
        emptyDir: {sizeLimit: 128Mi}
      - name: media
        persistentVolumeClaim: {claimName: facturadj-media}
```

> **Note** — Le fichier réel utilise une ancre YAML (`matchLabels: &id001` puis `labels: *id001`) pour garantir que le sélecteur et les labels du modèle sont identiques. L'extrait ci-dessus l'écrit en toutes lettres pour la lisibilité.

Pourquoi l'en-tête `Host: localhost` dans les sondes ? Le kubelet interroge le Pod par son adresse IP. Sans cet en-tête, Django recevrait cette IP comme nom d'hôte, absente de `DJANGO_ALLOWED_HOSTS`, et répondrait `400`, ce qui ferait échouer la sonde.

<a id="section-9-6"></a>

### 9.6 Ressources et budgets Kubernetes

Chaque conteneur déclare deux valeurs par ressource :

- **requests** : ce qui est **réservé**. Le planificateur ne place un Pod que sur un nœud qui dispose de cette réserve.
- **limits** : le **plafond**. Au-delà, le CPU est ralenti ; la mémoire, elle, provoque l'arrêt brutal du conteneur (`OOMKilled`).

> **Analogie** — La *request* est la table réservée au restaurant ; la *limit* est le nombre maximal de places que le groupe peut occuper s'il reste de la place.

| Règle | Pourquoi |
|---|---|
| CPU : request basse, limit plus haute | Le CPU est **compressible** : un dépassement ralentit sans tuer |
| Mémoire : request réaliste, limit proche | La mémoire **n'est pas compressible** : un dépassement tue le conteneur ; un grand écart trompe le planificateur |
| Toujours déclarer des requests | Sans elles, le planificateur place les Pods à l'aveugle |

**Budget actuel de la PREPROD** (tous les conteneurs ont les mêmes valeurs) :

| Conteneur | Requests | Limits |
|---|---|---|
| backend | 100m CPU / 128 Mi | 1 CPU / 512 Mi |
| frontend | 100m CPU / 128 Mi | 1 CPU / 512 Mi |
| postgres | 100m CPU / 128 Mi | 1 CPU / 512 Mi |
| redis | 100m CPU / 128 Mi | 1 CPU / 512 Mi |
| **Total FacturaDJ** | **400m CPU / 512 Mi** | **4 CPU / 2 Gi** |

À ce budget s'ajoutent k3s, Traefik, CoreDNS, metrics-server, Argo CD et le Job de migration pendant son exécution. Vérifier la capacité réelle :

```bash
# LECTURE : capacité allouable et réservations par nœud
kubectl --context "$KUBE_CONTEXT" describe node | sed -n '/Allocatable/,/Events/p'
# LECTURE : consommation réelle (metrics-server)
kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod top pods
```

> **À valider** — La limite de 512 Mi déclarée pour PostgreSQL doit être validée avec les données et charges de recette. Surveiller `kubectl top` et les événements `OOMKilled` lors des tests de charge ou des rapports volumineux (balance âgée, exports), et ajuster si nécessaire.

> **Cible PROD** — L'étude d'août proposait : backend 200m/512 Mi → 1 CPU/1 Gi ; frontend 100m/256 Mi → 500m/512 Mi ; Redis 50m/128 Mi → 300m/256 Mi ; PostgreSQL 500m/2 Gi → 2 CPU/4 Gi. Sous une limite de 512 Mi, positionner `NODE_OPTIONS=--max-old-space-size=384` sur le frontend pour que Node déclenche son ramasse-miettes avant l'OOMKill.

<a id="section-9-7"></a>

### 9.7 kubectl : les commandes de base

`kubectl` est le client en ligne de commande de Kubernetes. **Toujours** préciser le contexte (le cluster) et le namespace : une commande exécutée sur le mauvais cluster est l'une des erreurs les plus graves.

```bash
# LECTURE : lister les contextes disponibles et choisir celui de la PREPROD
kubectl config get-contexts
read -r -p 'Contexte Kubernetes PREPROD exact : ' KUBE_CONTEXT
export KUBE_CONTEXT
```

**État des Pods de FacturaDJ.** Cette commande vérifie l'état des Pods dans le namespace de préproduction.

```bash
kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod get pods
```

Exemple de résultat attendu :

```text
NAME                                  READY   STATUS      RESTARTS   AGE
facturadj-backend-7c9f6d8b5-x2k4p     1/1     Running     0          12m
facturadj-frontend-5d8c7b9f4-q7m2n    1/1     Running     0          12m
facturadj-postgres-0                  1/1     Running     0          3d
facturadj-redis-6b9d5c7f8-h4j6k       1/1     Running     0          3d
facturadj-migrate-3f2c1a9b7d4e-8kq2w  0/1     Completed   0          15m
```

| Colonne | Lecture |
|---|---|
| `READY 1/1` | Conteneurs prêts / total. `0/1` en `Running` signifie : démarré mais pas prêt (sonde d'aptitude en échec) |
| `STATUS` | `Running`, `Pending`, `CrashLoopBackOff`, `ImagePullBackOff`, `Completed`… voir [chapitre 20](#chapitre-20) |
| `RESTARTS` | Un nombre qui augmente signale des redémarrages répétés |

**Autres commandes essentielles.**

| Besoin | Commande |
|---|---|
| Vue d'ensemble | `kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod get pods,svc,ingress,pvc` |
| Détail et événements d'un Pod | `kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod describe pod <nom>` |
| Journaux | `kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod logs deploy/facturadj-backend --tail=100` |
| Journaux du conteneur précédent (après un crash) | `kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod logs <pod> --previous` |
| Événements récents | `kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod get events --sort-by=.lastTimestamp` |
| Suivi d'une mise à jour | `kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod rollout status deploy/facturadj-backend` |
| Commande dans un conteneur | `kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod exec deploy/facturadj-backend -- id` |
| Consommation | `kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod top pods` |

> **Attention** — `kubectl edit`, `kubectl scale`, `kubectl set image` ou `kubectl delete` sur une ressource gérée par Argo CD créent un **écart** avec Git (drift). Réserver ces commandes au dépannage, puis réaligner Git ([10.2](#section-10-2)).
<a id="section-9-8"></a>

### 9.8 Préparer un cluster neuf et son bootstrap

Les manifests applicatifs **ne créent pas le VPS, Docker, k3d ni Argo CD**. Ils supposent ce socle disponible. Cette section complète le parcours pour un nouvel environnement de recette ou un exercice de reconstruction.

> **Proposé — à adapter et à tester.** Le dépôt ne contient pas la recette de création exacte du cluster existant. Ne pas utiliser cet exemple pour remplacer ce cluster. Dans `infra/k8s/k3d/config.yaml`, le mot « config » désigne une **ConfigMap applicative**, pas un fichier de configuration de `k3d cluster create`.

<a id="section-9-8-1"></a>

#### 9.8.1 Préparer la machine

| Élément | Validation attendue avant création |
|---|---|
| Système Linux maintenu | Version et politique de correctifs consignées |
| Accès administrateur | Compte nominatif, accès SSH et méthode de secours |
| Docker | Client et daemon répondent ; espace suffisant pour images et volumes |
| Outils | Versions approuvées de k3d, kubectl, Argo CD ; Git et Python/PyYAML |
| Réseau | DNS et téléchargement des images accessibles depuis les nœuds |
| Ports hôte | Ports choisis libres ; API limitée à la boucle locale |
| Stockage | Dossier réservé au nouveau cluster, distinct de tout volume existant |
| Version k3s | Image approuvée, référence consignée et compatibilité vérifiée |
| Reprise | Sauvegardes vérifiées avant toute action sur un hôte déjà utilisé |

Installer les outils selon leurs distributions officielles, avec versions et empreintes contrôlées ; ne pas improviser une mise à niveau pendant une restauration. L'installation de l'hyperviseur, du fournisseur cloud ou du système d'exploitation dépend du socle choisi.

<a id="section-9-8-2"></a>

#### 9.8.2 Créer un cluster d'exercice isolé

**Machine :** hôte Linux Docker. **Effet :** création de conteneurs et volumes. Les ports ci-dessous sont des exemples locaux pour un **nouveau laboratoire**, sans ouverture Internet.

~~~bash
# LECTURE / PARAMÈTRES : choisir un NOM INÉDIT et une image k3s approuvée
docker version
k3d version
k3d cluster list
read -r -p 'Nom du nouveau cluster de laboratoire : ' LAB_CLUSTER
read -r -p 'Référence k3s approuvée, version fixée : ' K3S_IMAGE
LAB_STORAGE="$HOME/facturadj-lab/$LAB_CLUSTER/storage"
LAB_KUBECONFIG="$HOME/facturadj-lab/$LAB_CLUSTER/kubeconfig"

# MODIFICATION LOCALE : nouvelle infrastructure de laboratoire
(
  set -euo pipefail
  [[ "$LAB_CLUSTER" =~ ^[a-z][a-z0-9-]+$ ]]
  [[ "$K3S_IMAGE" == rancher/k3s:* ]]
  [[ "$K3S_IMAGE" != *latest* ]]
  test ! -e "$HOME/facturadj-lab/$LAB_CLUSTER"
  umask 077
  mkdir -p "$LAB_STORAGE"
  k3d cluster create "$LAB_CLUSTER" \
    --image "$K3S_IMAGE" \
    --servers 1 --agents 0 \
    --api-port "127.0.0.1:6445" \
    --port "127.0.0.1:9443:443@loadbalancer" \
    --volume "$LAB_STORAGE:/var/lib/rancher/k3s/storage@server:0" \
    --kubeconfig-update-default=false \
    --kubeconfig-switch-context=false
  k3d kubeconfig get "$LAB_CLUSTER" > "$LAB_KUBECONFIG"
  chmod 600 "$LAB_KUBECONFIG"
)
~~~

**Attendu :** nouveau cluster créé, kubeconfig distinct, API sur `127.0.0.1:6445` et façade HTTPS sur `127.0.0.1:9443`. Ces adresses sont locales à l'hôte Docker ; une administration distante demande un tunnel ou un chemin réseau contrôlé.

Le dossier monté rend explicite l'emplacement des données `local-path` sur l'hôte. Il ne fournit ni réplication ni sauvegarde. Consigner également les volumes Docker créés par k3d et tester la reconstruction avant de conclure à la persistance. [Référence k3d : options de création](https://k3d.io/stable/usage/commands/k3d_cluster_create/).

~~~bash
# LECTURE : contrôles du nouveau laboratoire
kubectl --kubeconfig "$LAB_KUBECONFIG" get nodes -o wide
kubectl --kubeconfig "$LAB_KUBECONFIG" -n kube-system get pods,svc
kubectl --kubeconfig "$LAB_KUBECONFIG" get storageclass
docker ps --format 'table {{.Names}}\t{{.Ports}}'
~~~

**Arrêt :** nœud non prêt, Traefik absent, stockage manquant, ports exposés différemment du plan ou réseau non fonctionnel.

<a id="section-9-8-3"></a>

#### 9.8.3 Installer Argo CD à partir d'une version fixée

**Prérequis :** laboratoire vérifié, version Argo CD compatible et approuvée. **Effet :** création de ressources Kubernetes, dont des CRD et des droits au niveau du cluster. Les droits limités de l'AppProject FacturaDJ ne suffisent pas à installer Argo CD.

~~~bash
# TÉLÉCHARGEMENT LOCAL : choisir la version, sans appliquer une URL mouvante
read -r -p 'Version Argo CD approuvée, forme vX.Y.Z : ' ARGOCD_VERSION
(
  set -euo pipefail
  [[ "$ARGOCD_VERSION" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]
  test ! -e "$HOME/facturadj-lab/$LAB_CLUSTER/argocd-install.yaml"
  curl --fail --location \
    "https://raw.githubusercontent.com/argoproj/argo-cd/$ARGOCD_VERSION/manifests/install.yaml" \
    --output "$HOME/facturadj-lab/$LAB_CLUSTER/argocd-install.yaml"
)
~~~

Relire le manifest et comparer son origine/version à la publication approuvée. Calculer puis conserver son empreinte pour la traçabilité ; cette empreinte calculée localement ne prouve pas, à elle seule, l'authenticité du téléchargement.

~~~bash
# DÉPLOIEMENT : après revue du manifest, sur le laboratoire seulement
kubectl --kubeconfig "$LAB_KUBECONFIG" create namespace argocd
kubectl --kubeconfig "$LAB_KUBECONFIG" -n argocd apply \
  -f "$HOME/facturadj-lab/$LAB_CLUSTER/argocd-install.yaml"

# LECTURE
kubectl --kubeconfig "$LAB_KUBECONFIG" -n argocd get pods
kubectl --kubeconfig "$LAB_KUBECONFIG" -n argocd \
  rollout status deploy/argocd-server --timeout=300s
~~~

Suivre ensuite l'initialisation de l'accès administrateur et son remplacement par les accès retenus. Le mot de passe initial est un secret ; le consulter uniquement dans la session d'administration prévue et ne pas le joindre au journal. L'installation standard ne configure pas encore le dépôt GitOps ni les droits FacturaDJ. [Référence Argo CD : démarrage](https://argo-cd.readthedocs.io/en/stable/getting_started/).

<a id="section-9-8-4"></a>

#### 9.8.4 Passer du socle à l'application

1. Vérifier l'ensemble des composants Argo CD, pas seulement son serveur.
2. Définir le contexte du nouveau cluster et conserver son kubeconfig hors Git.
3. Préparer un dépôt GitOps et des secrets **propres à cet environnement**.
4. Adapter le domaine, le port public éventuel et les origines CSRF au laboratoire.
5. Suivre [17.11](#section-17-11), puis le scénario A de [17.13](#section-17-13).
6. Valider les NetworkPolicies, la persistance et la restauration avant de considérer le socle exploitable.

Pour un déploiement sur VPS exposé, les ports, certificats, DNS et règles de pare-feu doivent faire l'objet d'un plan propre à ce VPS. L'exemple local n'est pas une recette de publication Internet.

<a id="mise-en-pratique--chapitre-9"></a>

### Mise en pratique — chapitre 9

**Comprendre un Pod Pending.** Un Pod peut attendre une réservation CPU, un volume ou le téléchargement de son image. Le seul mot Pending ne choisit pas la cause. **Contrôle :** lire describe et les événements, puis associer le message à un objet précis : nœud, PVC, Secret de téléchargement ou configuration. Recréer le Pod sans diagnostic ne résout pas cette dépendance.

<a id="synthese-du-chapitre-9"></a>

#### Synthèse du chapitre 9

**À retenir**

- **k3s** est une distribution Kubernetes légère qui embarque Traefik, CoreDNS, `local-path-provisioner`, metrics-server et un contrôleur de NetworkPolicy. **k3d** exécute k3s dans des conteneurs Docker.
- Conséquence directe : tous les « nœuds » sont sur **un seul VPS**. Aucune haute disponibilité, et les volumes `local-path` ne suivent pas un Pod ailleurs.
- Les manifests restent du Kubernetes standard : ils resteront valables sur un k3s multi-nœuds ou un autre cluster conforme.
- `strategy: Recreate` sur les deux applications : l'ancien Pod est arrêté **avant** le démarrage du nouveau, d'où une courte coupure à chaque mise à jour. Acceptable en recette, pas en production.
- Le Namespace `facturadj-preprod` porte les labels Pod Security en mode `restricted` et est créé **hors GitOps**.

**Les pièges classiques**

| Le piège | Pourquoi on tombe dedans | Le bon réflexe |
|---|---|---|
| Lancer une commande sans `--context` | On travaille depuis une machine qui voit plusieurs clusters | Toujours `kubectl --context "$KUBE_CONTEXT"`, et vérifier avec `kubectl config current-context` |
| Présenter la PREPROD comme résiliente parce qu'elle est « sous Kubernetes » | Kubernetes évoque la haute disponibilité | Un cluster mononœud n'a aucune redondance matérielle. Voir [15.2](#section-15-2) |
| Attendre une mise à jour sans coupure | C'est le comportement par défaut ailleurs | `Recreate` coupe volontairement. `RollingUpdate` est réservé à la cible PROD ([15.5](#section-15-5)) |
| Confondre Service et Ingress | Les deux « exposent » quelque chose | Le Service donne un nom et une adresse **internes** ; l'Ingress décrit l'entrée **externe** en HTTP(S). Seul le frontend a un Ingress |

**Vérifiez votre compréhension**

1. Quelle est la différence entre k3s et k3d, et laquelle des deux impose la limite de disponibilité ? *(→ [9.2](#section-9-2))*
2. Que fait `strategy: Recreate`, et quelle est sa conséquence visible pour un utilisateur ? *(→ [9.3](#section-9-3))*
3. Quel objet donne à PostgreSQL un nom stable et son propre volume ? *(→ [9.3](#section-9-3))*

> **Réponses** — **1.** k3s est la distribution Kubernetes ; k3d l'exécute dans des conteneurs Docker. C'est le déploiement k3d sur un VPS unique qui supprime toute redondance, pas k3s en lui-même. **2.** L'ancien Pod est arrêté avant que le nouveau démarre : l'utilisateur voit une courte interruption à chaque mise à jour. **3.** Un StatefulSet, avec un nom fixe (`facturadj-postgres-0`) et un volume créé par `volumeClaimTemplates`.

**Où aller ensuite** — Le [chapitre 10](#chapitre-10) explique qui décide de ce que contient ce cluster, et comment.

<a id="chapitre-10"></a>

## 10. GitOps et Argo CD

> **En une phrase** — Argo CD compare Git au cluster ; la configuration FacturaDJ attend une décision humaine pour appliquer les changements.

**Ce que vous saurez faire à la fin de ce chapitre**

1. Énoncer les quatre principes de GitOps et dire lequel FacturaDJ applique différemment.
2. Distinguer état souhaité et état réel, et reconnaître les deux origines d'un *drift*.
3. Lire séparément le statut de synchronisation et le statut de santé, et interpréter leurs combinaisons.
4. Justifier chaque ligne de la politique FacturaDJ : pas d'`automated`, pas de `selfHeal`, pas de `prune`, pas de hook.
5. Dire quelles ressources Argo CD gère et lesquelles restent volontairement hors de sa portée.

**Prérequis** — [chapitre 9](#chapitre-09) · **Lecture** — 9 min · **Nature** — architecture et exploitation

<a id="section-10-1"></a>

### 10.1 GitOps : Git comme plan officiel

**GitOps** est une méthode d'exploitation où l'état souhaité de l'infrastructure est **entièrement décrit dans Git**, et où un agent compare en continu ce plan avec la réalité.

> **Analogie — le plan officiel** — Git représente le plan cadastral officiel. Argo CD est le géomètre qui compare le terrain au plan et signale chaque différence. Personne ne construit sans modifier d'abord le plan, et le plan garde la mémoire de chaque modification.

```text
Git
 │
 │ état souhaité
 ▼
Argo CD
 │
 │ comparaison
 ▼
Kubernetes
 │
 ▼
État réel
```

Les quatre principes de GitOps :

1. **Déclaratif** : on décrit le résultat voulu, pas la suite de commandes.
2. **Versionné et immuable** : Git conserve chaque version et son auteur.
3. **Tiré, pas poussé** : c'est l'agent dans le cluster qui lit Git ; la CI n'a pas besoin d'accès au cluster.
4. **Réconcilié** : l'agent détecte les écarts. Chez FacturaDJ, il les **signale** et attend une décision.

<a id="section-10-2"></a>

### 10.2 État souhaité et état réel

| | Desired State (état souhaité) | Actual State (état réel) |
|---|---|---|
| **Où** | Dépôt GitOps, branche `main`, chemin `infra/k8s/overlays/preprod` | Cluster k3d, namespace `facturadj-preprod` |
| **Qui le modifie** | Une MR approuvée | Une synchronisation Argo CD… ou une intervention manuelle |
| **Exemple** | Backend `@sha256:9b1e…` | Pod backend exécutant `@sha256:4c7a…` |

Un **drift** (dérive) est un écart entre les deux. Il apparaît dans deux cas :

- **Git a changé** (MR fusionnée) : le cluster est en retard, c'est **normal** et attendu avant la synchronisation ;
- **le cluster a changé** hors Git (`kubectl edit`, `scale`, `rollout undo`) : c'est une intervention non tracée, à régulariser.

<a id="section-10-3"></a>

### 10.3 Argo CD : AppProject et Application

**Argo CD** est un contrôleur GitOps pour Kubernetes, projet de la CNCF. Il s'installe dans le cluster (namespace `argocd`) et offre une interface web et une CLI `argocd`.

- Un **AppProject** est un **garde-fou** : il limite les dépôts sources, les clusters et namespaces de destination, et les types de ressources autorisés.
- Une **Application** relie **un dépôt, un chemin et une révision** à **un cluster et un namespace**.

```yaml
# infra/argocd/facturadj-preprod.yaml
# Renseigner le dépôt GitLab GitOps dans LES DEUX champs avant bootstrap.
# Aucun finalizer destructeur, aucune synchronisation automatique.
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: facturadj
  namespace: argocd
spec:
  sourceRepos:
    - https://gitlab.example.invalid/RENSEIGNER/facturadj-gitops.git  # SEUL dépôt autorisé
  destinations:
    - server: https://kubernetes.default.svc     # le cluster où tourne Argo CD
      namespace: facturadj-preprod               # SEUL namespace autorisé
  clusterResourceWhitelist: []                   # aucune ressource de niveau cluster
  namespaceResourceWhitelist:                    # uniquement ces types de ressources
    - {group: "", kind: Service}
    - {group: "", kind: ConfigMap}
    - {group: "", kind: PersistentVolumeClaim}
    - {group: apps, kind: Deployment}
    - {group: apps, kind: StatefulSet}
    - {group: networking.k8s.io, kind: Ingress}
    - {group: networking.k8s.io, kind: NetworkPolicy}
---
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: facturadj-preprod
  namespace: argocd
  # pas de « finalizers » : supprimer l'Application ne supprime pas les ressources déployées
spec:
  project: facturadj
  source:
    repoURL: https://gitlab.example.invalid/RENSEIGNER/facturadj-gitops.git
    targetRevision: main                         # Argo CD suit la branche main du dépôt GitOps
    path: infra/k8s/overlays/preprod
  destination:
    server: https://kubernetes.default.svc
    namespace: facturadj-preprod
  syncPolicy:                                    # AUCUNE section « automated »
    syncOptions:
      - CreateNamespace=false                    # le namespace est créé hors GitOps
  revisionHistoryLimit: 10                       # historique conservé pour le retour arrière
```

La liste blanche de l'AppProject exclut volontairement `Namespace`, `Secret` et `Job` : ces objets restent hors de portée d'Argo CD.

<a id="section-10-4"></a>

### 10.4 Lire les statuts Argo CD

Argo CD affiche **deux statuts indépendants**.

**Statut de synchronisation** : Git et le cluster sont-ils identiques ?

| Statut | Signification | Action FacturaDJ |
|---|---|---|
| `Synced` | Le cluster correspond à la révision Git | Rien |
| `OutOfSync` | Au moins une ressource diffère de Git | Lire le diff, puis décider |
| `Unknown` | Argo CD ne parvient pas à comparer (dépôt inaccessible, rendu impossible) | Dépannage ([20.3.9](#section-20-3-9)) |

**Statut de santé** : les ressources fonctionnent-elles ?

| Statut | Signification |
|---|---|
| `Healthy` | Les ressources sont opérationnelles (Pods prêts, etc.) |
| `Progressing` | Mise à jour ou démarrage en cours |
| `Degraded` | Échec : Pod en erreur, délai de déploiement dépassé |
| `Suspended` | Ressource volontairement suspendue |
| `Missing` | La ressource décrite dans Git n'existe pas dans le cluster |
| `Unknown` | Santé non évaluable |

Combinaisons typiques :

| Sync | Santé | Interprétation |
|---|---|---|
| `OutOfSync` | `Healthy` | Une MR a été fusionnée ; l'ancienne version tourne correctement. **État normal avant la décision de synchroniser** |
| `Synced` | `Progressing` | Synchronisation faite, nouveaux Pods en démarrage |
| `Synced` | `Degraded` | La nouvelle version ne démarre pas : voir le [chapitre 20](#chapitre-20), envisager un retour arrière |
| `OutOfSync` | `Missing` | Premier déploiement pas encore synchronisé |

<a id="section-10-5"></a>

### 10.5 La politique FacturaDJ : synchronisation manuelle

| Règle | Mise en œuvre | Raison |
|---|---|---|
| Pas de synchronisation automatique | Aucune section `automated` (vérifié par `check_static.py`) | Chaque déploiement est une décision humaine |
| Pas d'auto-réparation (`selfHeal`) | Découle de la règle précédente | Un écart manuel reste visible au lieu d'être effacé en silence |
| Pas de suppression automatique (`prune`) | Ne pas utiliser `--prune` par défaut | Supprimer un PVC supprime les données |
| Pas de hook de migration | Job de migration hors Kustomization | Une migration se décide après sauvegarde, jamais en effet de bord |
| Pas de finalizer destructeur | Aucun `resources-finalizer.argocd.argoproj.io` | Supprimer l'Application ne doit rien détruire |
| Namespace et Secrets hors GitOps | `CreateNamespace=false`, liste blanche | Aucun secret dans Git |
| La CI n'a aucun accès au cluster | Aucun kubeconfig ni jeton Argo CD en CI | Un jeton CI volé ne peut pas déployer |
| Accès Git en lecture seule | Clé de déploiement GitLab | Argo CD ne peut pas modifier l'état souhaité |

> **Attention** — Rappel : dans le contexte actuel, le déploiement **reste sous contrôle manuel**. Un `OutOfSync` après une fusion de MR n'est **pas** une anomalie : il attend votre décision. Aucune étape de ce manuel n'autorise l'ajout de `automated`.

<a id="section-10-6"></a>

### 10.6 Ressources gérées et non gérées par Argo CD

| Géré par Argo CD (dépôt GitOps) | Hors Argo CD | Pourquoi hors Argo CD |
|---|---|---|
| Deployments, StatefulSet, Services | Namespace `facturadj-preprod` | Porte les labels de sécurité ; créé une fois |
| ConfigMap `facturadj-config` | Secrets | Aucun secret dans Git |
| PVC `facturadj-media` | Job de migration | Exécution décidée après sauvegarde |
| Ingress, NetworkPolicies | AppProject et Application | Appliqués au bootstrap par `kubectl apply` |

<a id="section-10-7"></a>

### 10.7 Anciennes Applications et synchronisation automatique résiduelle

L'étude OKD prévoyait une Application en auto-sync dans `openshift-gitops`. Le fichier `infra/argocd/application.yaml` a été vidé, mais **modifier un fichier local ne change pas une Application déjà présente dans un cluster**.

Avant le bootstrap, examiner :

- les Applications existantes (`argocd app list`) ;
- les **ApplicationSets** et les Applications « parentes » (*app-of-apps*) : elles pourraient recréer une Application en auto-sync.

```bash
# LECTURE dans le contexte Argo CD voulu
argocd app get facturadj-preprod -o yaml
# MODIFICATION seulement si un ancien auto-sync existe
argocd app set facturadj-preprod --sync-policy none
# LECTURE
argocd app get facturadj-preprod -o yaml
```

Si l'auto-sync réapparaît, corriger aussi la source du parent (ApplicationSet ou app-of-apps), avec revue humaine.

<a id="section-10-8"></a>

### 10.8 Les commandes Argo CD

| Commande | Nature | Effet |
|---|---|---|
| `argocd context` | Lecture | Affiche le serveur Argo CD visé par la CLI |
| `argocd app list` | Lecture | Liste les Applications, leur statut de synchronisation et de santé |
| `argocd app get facturadj-preprod` | Lecture | Détail : dépôt, révision, politique, statuts, ressources |
| `argocd app diff facturadj-preprod` | Lecture | Différences entre Git et le cluster |
| `argocd app sync facturadj-preprod` | **Déploiement** | Applique la révision Git |
| `argocd app wait facturadj-preprod --sync --health --timeout 300` | Lecture | Attend synchronisation et santé |
| `argocd app history facturadj-preprod` | Lecture | Historique des synchronisations |
| `argocd app set facturadj-preprod --sync-policy none` | Modification | Retire une synchronisation automatique |

Exemple de sortie de `argocd app get` après la fusion d'une MR :

```text
Name:               argocd/facturadj-preprod
Project:            facturadj
Server:             https://kubernetes.default.svc
Namespace:          facturadj-preprod
Repo:               https://gitlab.<domaine>/<groupe>/facturadj-gitops.git
Target:             main
Path:               infra/k8s/overlays/preprod
Sync Policy:        Manual
Sync Status:        OutOfSync from main (a1b2c3d)
Health Status:      Healthy
```

> **Note** — `argocd app diff` renvoie un **code de sortie non nul lorsqu'il existe une différence**. Une erreur peut également produire un code non nul : lire la sortie et distinguer différence attendue et échec, sans masquer le résultat avec `|| true`.

> **Attention** — Ne pas ajouter `--prune` par défaut à `argocd app sync`. Les suppressions de ressources, surtout de PVC, se planifient séparément.

<a id="section-10-9"></a>

### 10.9 Sync, drift et rollback : ce qu'il faut retenir

| Action | Effet dans Git | Effet dans le cluster | Recommandée ? |
|---|---|---|---|
| MR fusionnée puis `argocd app sync` | Nouvelle révision | Nouvelle version appliquée | **Oui** : voie normale |
| `git revert` du commit de promotion, MR, puis sync | Révision annulée, historique conservé | Ancienne version rétablie | **Oui** : retour arrière normal ([chapitre 18](#chapitre-18)) |
| `argocd app rollback` | Aucun | Ancienne révision appliquée, Git ne correspond plus | Non, sauf urgence suivie d'un revert Git |
| `kubectl rollout undo` | Aucun | Ancien ReplicaSet rétabli, application `OutOfSync` | Urgence seulement, puis revert Git |
| `kubectl edit` ou `scale` | Aucun | Drift non tracé | Dépannage seulement, puis réalignement |
<a id="mise-en-pratique--chapitre-10"></a>

### Mise en pratique — chapitre 10

**Interpréter deux statuts indépendants.** OutOfSync avec Healthy peut signifier qu'une promotion attend sa décision manuelle. Synced avec Degraded signifie que le plan a été appliqué mais qu'une ressource ne fonctionne pas. **Exercice :** écrire une action de diagnostic pour chacun ; ne pas utiliser une synchronisation comme remède universel à Degraded.

<a id="synthese-du-chapitre-10"></a>

#### Synthèse du chapitre 10

**À retenir**

- Les quatre principes : déclaratif, versionné et immuable, **tiré** et non poussé, réconcilié. FacturaDJ applique le quatrième en mode signalement : l'agent détecte, l'humain décide.
- Un `OutOfSync` après une Merge Request fusionnée est **l'état normal** : le cluster attend votre décision. Un `OutOfSync` provoqué par un `kubectl edit` est au contraire une intervention à régulariser.
- Deux statuts **indépendants** : synchronisation (Git ≟ cluster) et santé (les ressources fonctionnent-elles). La combinaison `Synced` + `Degraded` signifie que la nouvelle version ne démarre pas.
- L'AppProject est un garde-fou : sa liste blanche exclut volontairement `Namespace`, `Secret` et `Job`.
- La CI n'a **aucun** accès au cluster, et Argo CD n'a qu'un accès **en lecture** à Git. Un jeton de CI volé ne permet pas de déployer.

**Les pièges classiques**

| Le piège | Pourquoi on tombe dedans | Le bon réflexe |
|---|---|---|
| Traiter un `OutOfSync` comme un incident | Le mot évoque une dérive anormale | Après une MR fusionnée, c'est l'état attendu. Lire le diff, puis décider |
| Ajouter `--prune` à `argocd app sync` | Cela « nettoie » les ressources orphelines | La suppression d'un PVC supprime les données. Les suppressions se planifient séparément |
| Masquer le code de sortie d'`argocd app diff` | Il renvoie un code non nul dès qu'il existe une différence | Ce code **est** l'information. Lire la différence, ne pas la neutraliser |
| Croire qu'avoir vidé `infra/argocd/application.yaml` supprime l'ancienne Application | Le fichier est local et vide | Modifier un fichier ne change pas un objet déjà présent dans un cluster. Examiner `argocd app list`, les ApplicationSets et les applications parentes |

**Vérifiez votre compréhension**

1. Une MR de promotion vient d'être fusionnée : Argo CD affiche `OutOfSync` et `Healthy`. Faut-il intervenir en urgence ? *(→ [10.4](#section-10-4))*
2. Pourquoi le Namespace et les Secrets sont-ils exclus de la gestion Argo CD ? *(→ [10.6](#section-10-6))*
3. Quel risque précis fait éviter `--prune` par défaut ? *(→ [10.8](#section-10-8))*

> **Réponses** — **1.** Non : c'est l'état normal avant la décision de synchroniser. L'ancienne version tourne correctement ; il faut lire le diff, vérifier qu'il ne contient que les changements attendus, puis décider. **2.** Le Namespace porte les labels de sécurité et est créé une fois au bootstrap ; les Secrets ne doivent jamais figurer dans Git. **3.** La suppression de ressources jugées orphelines, en particulier un PVC, ce qui détruirait les données.

**Où aller ensuite** — Le [chapitre 11](#chapitre-11) suit une requête depuis le navigateur jusqu'au Pod.

<a id="chapitre-11"></a>

## 11. Réseau, DNS et TLS

> **En une phrase** — DNS, TLS, Ingress, Services et politiques réseau définissent des couches distinctes du chemin d'une requête.

**Ce que vous saurez faire à la fin de ce chapitre**

1. Décrire le chemin complet d'une requête, du navigateur au Pod, en nommant chaque relais.
2. Expliquer le rôle du DNS et ce qui doit être créé avant toute exposition.
3. Lire un Ingress Traefik et savoir où se termine le chiffrement.
4. Installer, contrôler et faire tourner un certificat sans supprimer le Secret existant.
5. Énumérer les flux réseau autorisés et vérifier, commande à l'appui, que les autres sont bloqués.

**Prérequis** — [chapitre 9](#chapitre-09) · **Lecture** — 12 min · **Nature** — architecture et exploitation

<a id="section-11-1"></a>

### 11.1 Le chemin d'une requête

Vue simplifiée :

```text
Utilisateur
 │
 ▼
DNS
 │
 ▼
VPS
 │
 ▼
Traefik
 │
 ▼
Service Kubernetes
 │
 ▼
Pod
```

Vue détaillée pour FacturaDJ :

```text
Navigateur : https://preprod.<domaine>/login
 │
 │ 1. DNS : preprod.<domaine> → adresse IP du VPS
 ▼
VPS nexora-vps, port 443
 │
 │ 2. le conteneur k3d serverlb transmet la connexion au cluster
 ▼
Traefik (kube-system) : déchiffrement TLS avec le Secret facturadj-tls
 │
 │ 3. Ingress facturadj : hôte preprod.<domaine>, chemin / → Service facturadj-frontend:4321
 ▼
Service facturadj-frontend ──► Pod Astro   (NetworkPolicy ingress-traefik)
 │
 │ 4. rendu SSR : appel HTTP http://facturadj-backend:8000/api/...
 ▼
Service facturadj-backend ──► Pod Django ──► PostgreSQL / Redis
```

<a id="section-11-2"></a>

### 11.2 Le DNS

Le **DNS** (*Domain Name System*) traduit un nom lisible en adresse IP.

> **Analogie** — L'annuaire téléphonique d'Internet : on cherche un nom, on obtient un numéro.

| Enregistrement | Rôle | Exemple |
|---|---|---|
| `A` / `AAAA` | Nom → adresse IPv4 / IPv6 | `preprod.<domaine>` → IP du VPS |
| `CNAME` | Nom → autre nom | `www` → domaine principal |
| `TXT` | Texte : SPF, DMARC, vérifications | `v=spf1 ... -all` |
| `CAA` | Autorités habilitées à émettre des certificats | `letsencrypt.org` |

Le **TTL** (durée de vie) indique combien de temps un résolveur garde une réponse en cache. Avant une bascule, on l'abaisse pour que le changement se propage vite.

Il existe aussi un DNS **interne** au cluster (CoreDNS), qui résout les noms de Services : `facturadj-backend` ou `facturadj-backend.facturadj-preprod.svc.cluster.local`.

> **À valider** — Le nom de domaine de la PREPROD n'est pas encore choisi : les manifests utilisent `preprod.facturadj.example.invalid`. Le remplacer dans `infra/k8s/k3d/ingress.yaml` (hôte et bloc `tls`) et dans `infra/k8s/k3d/config.yaml` (`PUBLIC_FRONTEND_URL`, `CSRF_TRUSTED_ORIGINS`), dans le dépôt GitOps.

<a id="section-11-3"></a>

### 11.3 Traefik et l'Ingress

**Traefik** est un reverse proxy : il reçoit les connexions de l'extérieur et les distribue aux bons Services selon des règles. Dans k3s, il est installé d'office et joue le rôle de **contrôleur Ingress**.

> **Analogie** — Le portier d'un immeuble : il vérifie l'adresse demandée et conduit le visiteur au bon étage. Il ne laisse entrer que par la porte principale.

```yaml
# infra/k8s/k3d/ingress.yaml — Certificat et DNS fournis manuellement avant exposition.
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: facturadj
  annotations:
    traefik.ingress.kubernetes.io/router.entrypoints: websecure   # port 443 uniquement
    traefik.ingress.kubernetes.io/router.tls: "true"             # TLS obligatoire
spec:
  ingressClassName: traefik
  tls:
  - hosts:
    - preprod.facturadj.example.invalid     # À REMPLACER
    secretName: facturadj-tls               # certificat créé hors dépôt
  rules:
  - host: preprod.facturadj.example.invalid # À REMPLACER
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: facturadj-frontend        # SEUL service exposé
            port:
              number: 4321
```

<a id="section-11-4"></a>

### 11.4 HTTPS et TLS

**TLS** (*Transport Layer Security*) chiffre la communication et prouve l'identité du serveur. **HTTPS** est simplement HTTP transporté dans TLS.

> **Analogie** — Une lettre dans une enveloppe scellée, remise par un facteur qui présente une carte d'identité officielle. Le **certificat** est cette carte ; l'**autorité de certification** (CA) est la préfecture qui l'a délivrée.

```text
HTTPS
  │
  ▼
TLS
  │
  ▼
Traefik
```

Déroulé simplifié d'une connexion :

1. le navigateur annonce le nom demandé (SNI) ;
2. Traefik présente le certificat correspondant, extrait du Secret `facturadj-tls` ;
3. le navigateur vérifie la signature de la CA, le nom et la date de validité ;
4. une clé de session est négociée ; tout le trafic est ensuite chiffré.

**Où s'arrête le chiffrement ?** Le TLS est *terminé* par Traefik. À l'intérieur du cluster, Traefik → Astro et Astro → Django circulent en HTTP, sur un réseau privé filtré par les NetworkPolicies. Conséquences dans la configuration :

| Réglage | Valeur PREPROD | Raison |
|---|---|---|
| `SECURE_SSL_REDIRECT` | `0` | Django est joint en HTTP interne ; une redirection provoquerait des boucles et des `301` sur les sondes |
| `SECURE_REDIRECT_EXEMPT` | `healthz/`, `readyz/` | Protège les sondes si la redirection était un jour réactivée |
| `CSRF_TRUSTED_ORIGINS` | `https://<domaine PREPROD>` | Django compare l'en-tête `Origin` à cette liste derrière un proxy TLS |
| `checkOrigin` Astro | Actif en production | Refuse les POST dont l'origine ne correspond pas à l'hôte |
| Cookies `Secure` | Actifs | Le navigateur ne les envoie qu'en HTTPS |

> **Attention** — Ne jamais désactiver TLS globalement ni `checkOrigin` pour « faire marcher » une connexion. Un `301` ou un `403` sur un POST se corrige en rétablissant les en-têtes de proxy et l'origine de confiance ([20.3.12](#section-20-3-12)).

<a id="section-11-5"></a>

### 11.5 Certificats : installation et renouvellement

**État actuel.** Le certificat PREPROD est fourni **à la main** : les fichiers `tls.crt` et `tls.key` sont conservés hors dépôt (`~/nexora-secrets/facturadj/`), puis chargés dans le Secret `facturadj-tls` au bootstrap ([17.11](#section-17-11)).

Avant de charger un certificat, vérifier qu'il couvre le bon nom, qu'il est valide et qu'il correspond à la clé :

```bash
# LECTURE : nom, émetteur, dates de validité
openssl x509 -in ~/nexora-secrets/facturadj/tls.crt -noout -subject -issuer -dates -ext subjectAltName
# LECTURE : les deux empreintes doivent être identiques (certificat et clé appariés)
openssl x509 -in ~/nexora-secrets/facturadj/tls.crt -noout -pubkey | sha256sum
openssl pkey -in ~/nexora-secrets/facturadj/tls.key -pubout | sha256sum
```

**Renouvellement manuel.** Un certificat a une durée de vie limitée (90 jours chez Let's Encrypt). Sans automatisation, l'expiration **coupe l'accès** : les navigateurs refusent la connexion. Le renouvellement se planifie :

```bash
# DÉPLOIEMENT : rotation planifiée du certificat, sans supprimer le Secret existant
kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod create secret tls facturadj-tls \
  --cert="$HOME/nexora-secrets/facturadj/tls.crt" \
  --key="$HOME/nexora-secrets/facturadj/tls.key" \
  --dry-run=client -o yaml \
  | kubectl --context "$KUBE_CONTEXT" apply -f -
```

`--dry-run=client -o yaml | kubectl apply` génère le Secret localement puis le met à jour en place. Traefik surveille les Secrets et recharge le certificat sans redémarrage.

Contrôle depuis l'extérieur :

```bash
# LECTURE : certificat réellement présenté par Traefik
echo | openssl s_client -connect preprod.<domaine>:443 -servername preprod.<domaine> 2>/dev/null \
  | openssl x509 -noout -issuer -dates
```

> **À valider** — Aucune automatisation du renouvellement n'est en place. Mettre en place une alerte d'expiration (J-30 et J-14) et choisir une automatisation : **cert-manager** avec Let's Encrypt, ou le résolveur ACME intégré à Traefik.

> **Cible PROD** — Exemple d'émetteur cert-manager en défi HTTP-01 via Traefik. Toujours commencer par l'environnement *staging* de Let's Encrypt, dont les quotas sont larges ; la production limite les échecs répétés. Si l'émetteur est géré par Argo CD, la liste blanche de l'AppProject devra autoriser les ressources `cert-manager.io`.

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-staging
spec:
  acme:
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    email: <adresse d'exploitation relevée>
    privateKeySecretRef:
      name: letsencrypt-staging-account
    solvers:
      - http01:
          ingress:
            ingressClassName: traefik
```

L'Ingress reçoit alors l'annotation `cert-manager.io/cluster-issuer: letsencrypt-staging`, et cert-manager renouvelle le certificat automatiquement avant son expiration. Pour un certificat générique (`*.domaine`), le défi **DNS-01** est obligatoire.

<a id="section-11-6"></a>

### 11.6 Les flux réseau autorisés dans le cluster

Le fichier `infra/k8s/k3d/networkpolicies.yaml` applique le principe du **refus par défaut** : la politique `default-deny` sélectionne tous les Pods et bloque toutes les entrées et sorties. Chaque flux nécessaire est ensuite ouvert **des deux côtés** : une règle de sortie sur la source et une règle d'entrée sur la destination.

```text
Traefik (kube-system)
        │ TCP 4321       ingress-traefik
        ▼
facturadj-frontend
        │ TCP 8000       egress-frontend-backend + allow-frontend-backend
        ▼
facturadj-backend
        │
        ├──► facturadj-postgres   TCP 5432   egress-backend-postgres + allow-backend-postgres
        └──► facturadj-redis      TCP 6379   egress-backend-redis + allow-backend-redis

Tous les Pods ──► CoreDNS (kube-system)   UDP et TCP 53   dns
Tout le reste : refusé, en entrée comme en sortie (default-deny)
```

| Politique | S'applique à | Autorise |
|---|---|---|
| `default-deny` | Tous les Pods | Rien (entrées et sorties bloquées) |
| `dns` | Tous les Pods | Sortie vers `kube-dns` en UDP et TCP 53 |
| `ingress-traefik` | Frontend | Entrée depuis les Pods Traefik de `kube-system` sur 4321 |
| `egress-frontend-backend` | Frontend | Sortie vers le backend sur 8000 |
| `allow-frontend-backend` | Backend | Entrée depuis le frontend sur 8000 |
| `egress-backend-postgres` / `allow-backend-postgres` | Backend / PostgreSQL | Backend → PostgreSQL sur 5432 |
| `egress-backend-redis` / `allow-backend-redis` | Backend / Redis | Backend → Redis sur 6379 |

Conséquences à connaître :

- les Pods n'ont **aucune sortie Internet** : pas d'envoi de courriel, pas de S3. Ajouter une sortie exige une nouvelle politique revue ;
- le Job de migration porte le label `app: facturadj-backend` pour hériter des accès à PostgreSQL (voir la réserve en [13.5](#section-13-5)) ;
- la règle `ingress-traefik` dépend du label `app.kubernetes.io/name: traefik` des Pods Traefik : si ce label diffère dans votre version de k3s, le frontend devient injoignable.

> **Attention** — Un YAML valide ne prouve pas que les politiques sont **appliquées**. Il faut un contrôleur de NetworkPolicy actif, et le vérifier par des tests réels.

**Tests de filtrage.** Les images contiennent Node et Python, qui suffisent pour tester sans ajouter d'outil.

```bash
# LECTURE : frontend → backend, AUTORISÉ. Attendu : 200
kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod exec deploy/facturadj-frontend -- \
  node -e "fetch('http://facturadj-backend:8000/healthz/').then(r=>console.log(r.status))"

# LECTURE : frontend → Redis, INTERDIT. Attendu : « bloqué »
kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod exec deploy/facturadj-frontend -- \
  node -e "const s=require('net').connect({host:'facturadj-redis',port:6379,timeout:3000});
s.on('connect',()=>{console.log('OUVERT : anomalie');process.exit(1)});
s.on('timeout',()=>{console.log('bloqué');process.exit(0)});
s.on('error',e=>{console.log('bloqué',e.code);process.exit(0)})"

# LECTURE : backend → PostgreSQL, AUTORISÉ. Attendu : ok
kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod exec deploy/facturadj-backend -- \
  python -c "import socket; socket.create_connection(('facturadj-postgres', 5432), 3); print('ok')"

# LECTURE : backend → Internet, INTERDIT. Attendu : TimeoutError
kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod exec deploy/facturadj-backend -- \
  python -c "import socket; socket.create_connection(('1.1.1.1', 443), 3); print('OUVERT : anomalie')"
```

<a id="section-11-7"></a>

### 11.7 En-têtes de sécurité HTTP

Certains en-têtes renforcent la sécurité côté navigateur : `Strict-Transport-Security` (HSTS), `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.

Le backend Django sait émettre HSTS, mais ses réponses sont lues par Astro et non par le navigateur. Vérifier ce que reçoit réellement le navigateur :

```bash
# LECTURE
curl -sI "https://preprod.<domaine>/login" | grep -iE 'strict-transport|x-frame|x-content|referrer'
```

> **À valider** — Si les en-têtes manquent, les ajouter au niveau de Traefik par un *Middleware*. Exemple à adapter ; l'AppProject devra alors autoriser le type `traefik.io/Middleware`.

```yaml
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: facturadj-security-headers
spec:
  headers:
    stsSeconds: 31536000             # activer seulement quand HTTPS est certain : irréversible côté navigateurs
    stsIncludeSubdomains: true
    contentTypeNosniff: true
    frameDeny: true
    referrerPolicy: strict-origin-when-cross-origin
    permissionsPolicy: "geolocation=(), microphone=(), camera=()"
```

À référencer dans l'Ingress par l'annotation `traefik.ingress.kubernetes.io/router.middlewares: facturadj-preprod-facturadj-security-headers@kubernetescrd`.

Une **politique CSP** (*Content-Security-Policy*) est aussi recommandée. L'application utilise un script en ligne (thème sombre injecté par le middleware Astro) : une CSP sans `'unsafe-inline'` le casserait. La solution propre est un *nonce* par requête.

<a id="section-11-8"></a>

### 11.8 Cible PROD : domaine public et protection du nom

> **Cible PROD** — Synthèse de l'étude d'août, à réexaminer au moment de l'ouverture publique.

**Sortir de ngrok.** Les tunnels historiques servent à la démonstration. L'exploitation doit disposer d'un domaine maîtrisé, d'un plan TLS et d'un accès administré répondant aux besoins du service.

**Achat et sécurisation du domaine.**

| Point | Recommandation |
|---|---|
| Registrar | Cloudflare Registrar (prix coûtant, DNS intégré) ; alternatives : Gandi, OVH |
| Verrouillage du transfert | Activé : empêche le détournement du domaine |
| Renouvellement automatique | Activé : un domaine expiré coupe site, courriels et certificats |
| MFA sur le compte du registrar | Obligatoire : qui contrôle le domaine contrôle les certificats |
| DNSSEC | Activé |

**Réglages Cloudflare** si le proxy est utilisé :

| Réglage | Valeur | Motif |
|---|---|---|
| Mode SSL/TLS | **Full (strict)** | « Flexible » laisse le trafic en clair vers l'origine ; « Full » accepte un certificat invalide |
| TLS minimum | 1.2 | 1.0 et 1.1 sont obsolètes |
| Always Use HTTPS | Activé | — |
| WAF managé, Bot Fight Mode | Activés | Filtrage des attaques courantes et du bruit automatisé |
| Cache | **Contourné sur `/app/*`** | Des pages personnalisées mises en cache seraient servies à d'autres clients |

> **Attention** — La règle de cache est critique : une page `/app/dashboard` servie depuis le cache à un autre utilisateur est une fuite de données. Vérifier que `curl -sI https://<domaine>/app/dashboard | grep -i cf-cache-status` renvoie `DYNAMIC` ou `BYPASS`, jamais `HIT`.

**Protection du domaine de messagerie** : sur une plateforme de facturation, l'absence de SPF et DMARC permet à n'importe qui d'envoyer une fausse facture au nom du domaine.

| Enregistrement | Valeur type | Effet |
|---|---|---|
| SPF | `v=spf1 include:<fournisseur> -all` | Seuls les serveurs déclarés peuvent envoyer |
| DMARC | `p=reject` | Les messages usurpés sont rejetés |
| CAA | `0 issue "letsencrypt.org"` | Seule l'autorité choisie peut émettre un certificat |

<a id="section-11-9"></a>

### 11.9 Vérifications réseau

```bash
# LECTURE : résolution DNS
dig +short preprod.<domaine>
dig +short CAA <domaine>
dig +short TXT _dmarc.<domaine>

# LECTURE : réponse HTTPS et redirection HTTP
curl -sI "https://preprod.<domaine>/login" | head -5
curl -s -o /dev/null -w '%{http_code}\n' "http://preprod.<domaine>/"

# LECTURE : certificat présenté
echo | openssl s_client -connect preprod.<domaine>:443 -servername preprod.<domaine> 2>/dev/null \
  | openssl x509 -noout -issuer -dates

# LECTURE : Ingress et Traefik côté cluster
kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod get ingress facturadj
kubectl --context "$KUBE_CONTEXT" -n kube-system get pods -l app.kubernetes.io/name=traefik
```

> **À valider** — L'Ingress n'écoute que sur l'entrée `websecure` (443). Vérifier le comportement sur le port 80 : redirection vers HTTPS ou absence de réponse, selon la configuration de Traefik dans votre k3s.

Contrôles externes recommandés avant toute ouverture : SSL Labs (viser A ou A+), securityheaders.com (viser A), internet.nl (TLS, DNSSEC, IPv6).
<a id="mise-en-pratique--chapitre-11"></a>

### Mise en pratique — chapitre 11

**Suivre une erreur HTTPS.** Un certificat valide prouve une partie de la connexion à la façade, pas l'accès à PostgreSQL. Après DNS et TLS, vérifier Ingress, Service, endpoints et readiness. **Contrôle :** attribuer chaque erreur à sa couche avant de toucher aux paramètres CSRF, qui ne corrigent ni un certificat expiré ni une absence de Pod prêt.

<a id="synthese-du-chapitre-11"></a>

#### Synthèse du chapitre 11

**À retenir**

- Le TLS se **termine à l'Ingress** : à l'intérieur du cluster, le frontend joint le backend en HTTP, sur un réseau fermé par défaut.
- Le certificat et l'entrée DNS sont fournis **manuellement** avant toute exposition. Le renouvellement est manuel lui aussi : c'est un risque identifié, à automatiser ([Annexe F](#annexe-f)).
- Les flux autorisés se résument à peu de choses : frontend → backend, backend → PostgreSQL, backend → Redis. Le reste est refusé, y compris toute sortie du backend vers Internet.
- Les vérifications réseau se font de l'extérieur vers l'intérieur : résolution DNS, réponse HTTPS, certificat présenté, puis Ingress et Traefik côté cluster.

**Les pièges classiques**

| Le piège | Pourquoi on tombe dedans | Le bon réflexe |
|---|---|---|
| Laisser expirer le certificat | Rien ne prévient : il n'existe pas encore d'alerte | Contrôler l'échéance dans les tâches périodiques ([21.4](#section-21-4)) et prévoir une alerte à J-30 et J-14 |
| Supposer les NetworkPolicies appliquées | Elles figurent dans les manifests | Le contrôleur peut être désactivé (`--disable-network-policy`). Le vérifier par des tests de flux ([11.6](#section-11-6)) |
| Exposer le backend « pour tester l'API » | C'est plus simple que de passer par le frontend | Le modèle BFF perd tout son sens, et l'API se retrouve joignable sans la session du frontend |
| Remplacer le Secret TLS en le supprimant d'abord | C'est le réflexe naturel | Faire une rotation en place : supprimer d'abord laisse le service sans certificat |

**Vérifiez votre compréhension**

1. Où se termine le chiffrement TLS, et en quoi le backend est-il joint ensuite ? *(→ [11.1](#section-11-1), [11.3](#section-11-3))*
2. Le frontend est-il autorisé à joindre Redis ? *(→ [11.6](#section-11-6))*
3. Que doit-il se passer si le backend tente de sortir sur Internet en PREPROD ? *(→ [11.6](#section-11-6))*

> **Réponses** — **1.** À l'Ingress, géré par Traefik ; le backend est ensuite joint en HTTP interne, sur un réseau cloisonné. **2.** Non : ce flux est interdit par les NetworkPolicies ; seul le backend accède à Redis. **3.** La connexion doit échouer par dépassement de délai (`TimeoutError`) : aucune sortie n'est autorisée en PREPROD.

**Où aller ensuite** — Le [chapitre 12](#chapitre-12) traite de ce qui doit survivre au redémarrage d'un Pod.

<a id="chapitre-12"></a>

## 12. Stockage

> **En une phrase** — Les volumes conservent les données au-delà d'un Pod ; leur protection dépend du stockage réel et des sauvegardes.

**Ce que vous saurez faire à la fin de ce chapitre**

1. Distinguer stockage éphémère, stockage bloc persistant et stockage objet, et choisir le bon pour un usage donné.
2. Expliquer le fonctionnement et les limites de `local-path` sur un cluster mononœud.
3. Localiser physiquement un volume sur le VPS et en vérifier l'état et la taille.
4. Décrire ce que le stockage objet apporterait, et ce que sa mise en place exigerait.

**Prérequis** — [chapitre 9](#chapitre-09) · **Lecture** — 6 min · **Nature** — architecture et exploitation

<a id="section-12-1"></a>

### 12.1 Trois familles de stockage

| Famille | Exemple FacturaDJ | Durée de vie | Analogie |
|---|---|---|---|
| **Éphémère** | `emptyDir` sur `/tmp`, `tmpfs` en Compose | Disparaît avec le Pod | Un post-it |
| **Bloc persistant (PVC)** | Données PostgreSQL, médias en PREPROD | Survit aux redémarrages, lié à un nœud | Un casier personnel sur place |
| **Objet (S3)** | Cible PROD pour les documents | Indépendante du cluster | Un entrepôt externe avec un bon de retrait |

<a id="section-12-2"></a>

### 12.2 PREPROD : les volumes local-path

La StorageClass `local-path` de k3s crée chaque volume **dans un dossier du nœud** qui héberge le Pod.

| Volume | PVC | Taille | Mode | Contenu | Sauvegarde |
|---|---|---|---|---|---|
| Base de données | `data-facturadj-postgres-0` | 20 Gi | `ReadWriteOnce` | Fichiers PostgreSQL (`PGDATA=/var/lib/postgresql/data/pgdata`) | `pg_dump` ([13.6](#section-13-6)) |
| Médias | `facturadj-media` | 5 Gi | `ReadWriteOnce` | Fichiers téléversés et générés, montés sur `/app/media` | Archive `tar` ([19.4](#section-19-4)) |
| Temporaire | `emptyDir` | 128 Mi | — | Fichiers temporaires | Aucune |

Caractéristiques de `local-path` à connaître :

- **aucune réplication** : une panne du disque perd les données ;
- le volume est **attaché au nœud** : sur un cluster multi-nœuds, le Pod ne pourrait pas redémarrer ailleurs ;
- la politique de récupération par défaut est `Delete` : **supprimer le PVC supprime les données**.

```bash
# LECTURE : volumes, état, taille et classe
kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod get pvc
kubectl --context "$KUBE_CONTEXT" get pv
# LECTURE : emplacement physique d'un volume
kubectl --context "$KUBE_CONTEXT" get pv <nom-du-pv> -o jsonpath='{.spec.hostPath.path}{.spec.local.path}{"\n"}'
```

Exemple de résultat attendu :

```text
NAME                        STATUS   VOLUME          CAPACITY   ACCESS MODES   STORAGECLASS
data-facturadj-postgres-0   Bound    pvc-3b1c…       20Gi       RWO            local-path
facturadj-media             Bound    pvc-8e4f…       5Gi        RWO            local-path
```

> **Attention** — Avec k3d, le « disque du nœud » se trouve dans le conteneur Docker du nœud. **Supprimer le cluster k3d peut détruire les données**, selon les volumes Docker et montages hôte réellement configurés. Ne jamais recréer le cluster sans sauvegarde vérifiée.

> **À valider** — Relever l'emplacement réel des volumes sur le VPS et l'espace disque disponible (`df -h` sur le VPS, `docker system df`). Un disque plein arrête PostgreSQL.

> **Note** — Un PVC `local-path` reste en `Pending` tant qu'aucun Pod ne l'utilise : la StorageClass attend le premier consommateur (`WaitForFirstConsumer`) pour choisir le nœud. Ce n'est pas une erreur.

<a id="section-12-3"></a>

### 12.3 Cible PROD : le stockage objet

> **Cible PROD** — Synthèse de l'étude d'août sur le stockage des documents.

**Pourquoi un stockage objet est indispensable en production.** Avec plusieurs Pods backend :

- un PDF téléversé sur un Pod serait invisible depuis les autres ;
- un volume `ReadWriteOnce` ne peut pas être monté par plusieurs Pods répartis sur plusieurs nœuds ;
- un volume `ReadWriteMany` (NFS, CephFS) coûte cher et reste un point de défaillance.

L'application est **déjà prête** : `USE_S3=1` bascule le stockage par défaut de Django sur `django-storages` (S3). Aucun code à écrire, seulement des variables à définir.

**Comparatif des offres** (tarifs indicatifs début 2026, 100 Go et trafic) :

| Solution | Coût mensuel | Sortie réseau | Exploitation | Verdict |
|---|---|---|---|---|
| **Cloudflare R2** | ~1,35 € | Gratuite | Nulle | **Recommandé pour les documents** : le téléchargement de PDF est le trafic dominant |
| Scaleway Object Storage | ~2 € (75 Go gratuits) | 75 Go gratuits puis ~0,01 €/Go | Nulle | Très bon, données en France ; **recommandé pour les sauvegardes** |
| OVH Object Storage | ~1 € | ~0,01 €/Go | Nulle | Correct |
| AWS S3 | ~2,30 € | 0,09 €/Go | Nulle | Sortie chère |
| MinIO dans le cluster | ~15 € (volumes, CPU) | Interne | Élevée | Non au lancement |
| Backblaze B2 | ~0,55 € | Gratuite jusqu'à 3× le volume | Nulle | Le moins cher, écosystème moins mature |

Deux fournisseurs distincts pour les documents et les sauvegardes : si l'un est compromis ou suspendu, l'autre reste intact.

**Configuration.**

```bash
USE_S3=1
S3_ENDPOINT_URL=https://<compte>.r2.cloudflarestorage.com
S3_BUCKET=facturadj-documents
S3_REGION=auto                 # R2 n'a pas de région
S3_ACCESS_KEY=<via un Secret, jamais dans Git>
S3_SECRET_KEY=<via un Secret, jamais dans Git>
```

`AWS_QUERYSTRING_AUTH = True` est déjà positionné dans `settings.py` : les liens générés sont **présignés et temporaires** (3600 s par défaut). Pour un aperçu de facture, `AWS_QUERYSTRING_EXPIRE = 900` réduit la fenêtre à 15 minutes.

Le **bucket doit être privé** :

```bash
# LECTURE : aucune politique publique attendue
aws s3api get-bucket-policy --bucket facturadj-documents \
  --endpoint-url https://<compte>.r2.cloudflarestorage.com      # attendu : NoSuchBucketPolicy
curl -sI https://<compte>.r2.cloudflarestorage.com/facturadj-documents/test.pdf   # attendu : 401 ou 403
```

**Organisation et cycle de vie.**

```text
facturadj-documents/
├── factures/2026/08/FAC-2026-0142.pdf
├── devis/2026/08/DEV-2026-0087.pdf
├── livraisons/2026/08/BL-2026-0034.pdf
├── justificatifs/clients/142/kbis.pdf
└── exports/2026-08-23/balance-agee.xlsx
```

| Préfixe | Règle | Motif |
|---|---|---|
| `exports/` | Suppression après 30 jours | Regénérables à la demande |
| `factures/`, `devis/`, `justificatifs/` | Conservation illimitée | Obligation comptable, pièces probantes |
| Tous | Versionnement activé | Une suppression accidentelle reste récupérable |

```bash
# MODIFICATION DISTANTE : règle de cycle de vie sur exports/
aws s3api put-bucket-lifecycle-configuration --bucket facturadj-documents \
  --endpoint-url https://<compte>.r2.cloudflarestorage.com \
  --lifecycle-configuration '{"Rules":[{"ID":"purge-exports","Status":"Enabled",
    "Filter":{"Prefix":"exports/"},"Expiration":{"Days":30}}]}'
```

**Chemin de téléchargement.** Les routes d'export Astro relaient le fichier : navigateur → Astro → Django → stockage. Acceptable pour des PDF de quelques centaines de kilo-octets, et le contrôle d'accès reste entièrement côté Django. Si des fichiers lourds apparaissent, Django pourra renvoyer une redirection vers une URL présignée, pour que le navigateur télécharge directement depuis le stockage.

**Sauvegarde du stockage objet.** Le versionnement protège de la suppression accidentelle, pas de la perte du compte. Une réplication hebdomadaire vers un second fournisseur est prévue :

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: replication-documents
spec:
  schedule: "0 2 * * 0"                  # dimanche 02h00
  timeZone: "Africa/Djibouti"
  concurrencyPolicy: Forbid
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          automountServiceAccountToken: false
          securityContext: {runAsNonRoot: true, seccompProfile: {type: RuntimeDefault}}
          containers:
            - name: rclone
              image: rclone/rclone:1.68      # à fixer par digest
              args: ["sync", "r2:facturadj-documents", "scw:facturadj-documents-secours",
                     "--transfers", "8", "--checksum", "--stats", "1m"]
              envFrom: [{secretRef: {name: facturadj-replication-s3}}]
              resources:
                requests: {cpu: 100m, memory: 256Mi}
                limits: {cpu: 500m, memory: 512Mi}
              securityContext:
                allowPrivilegeEscalation: false
                readOnlyRootFilesystem: true
                capabilities: {drop: ["ALL"]}
              volumeMounts: [{name: tmp, mountPath: /tmp}]
          volumes: [{name: tmp, emptyDir: {sizeLimit: 128Mi}}]
```

`--checksum` compare le contenu plutôt que la date : seuls les objets réellement différents sont transférés.

**Passage de la PREPROD au stockage objet.** Il faudrait : `USE_S3=1` et les variables S3 dans la ConfigMap et un Secret, une NetworkPolicy de sortie HTTPS vers le fournisseur, la mise à jour de la liste blanche Argo CD si de nouveaux types de ressources apparaissent, puis la vérification suivante :

```bash
# LECTURE : le backend utilise-t-il bien S3 ? Attendu : S3Storage
kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod exec deploy/facturadj-backend -- python -c "
import django; django.setup()
from django.core.files.storage import default_storage
print(default_storage.__class__.__name__)"
```
<a id="mise-en-pratique--chapitre-12"></a>

### Mise en pratique — chapitre 12

**Distinguer persistance et sauvegarde.** Le redémarrage d'un Pod peut retrouver son PVC ; la perte du disque hôte peut perdre ce même contenu. **Exercice :** relever le PVC, le PV et son montage réel, puis montrer où se trouve la copie externe. Le nom local-path ne dit pas si un montage Docker protège du retrait du conteneur nœud.

<a id="synthese-du-chapitre-12"></a>

#### Synthèse du chapitre 12

**À retenir**

- Un système de fichiers de conteneur est **éphémère par construction**. Les images tournent d'ailleurs en lecture seule : ce n'est pas une contrainte, c'est le modèle.
- En PREPROD, les volumes `local-path` résident sur le disque du nœud. Ils ne suivent pas un Pod vers une autre machine, et leur sauvegarde est de votre ressort.
- Les médias applicatifs sont sur PVC en préproduction : ils entrent donc dans le périmètre de sauvegarde ([19.2](#section-19-2)).
- Le stockage objet est une **cible**, pas un acquis. Tant que `USE_S3` n'est pas activé et validé, ne pas raisonner comme s'il l'était.

**Les pièges classiques**

| Le piège | Pourquoi on tombe dedans | Le bon réflexe |
|---|---|---|
| Croire qu'un PVC est une sauvegarde | Le mot « persistant » rassure | Persistant signifie « survit au Pod », pas « survit au VPS ». La sauvegarde est un dispositif distinct |
| Écrire dans le conteneur pour dépanner | Le shell est ouvert, c'est tentant | Le système de fichiers est en lecture seule ; la modification serait perdue au prochain Pod et invisible dans Git |
| Dimensionner un volume au plus juste | On veut économiser le disque du VPS | Une restauration de test consomme de l'espace sur le **même** volume. Vérifier la place avant ([13.6](#section-13-6)) |

**Vérifiez votre compréhension**

1. Quelles sont les trois familles de stockage, et laquelle est utilisée pour les médias en PREPROD ? *(→ [12.1](#section-12-1), [12.2](#section-12-2))*
2. Un volume `local-path` protège-t-il contre la perte du VPS ? *(→ [12.2](#section-12-2))*
3. Que changerait l'activation du stockage objet pour la sauvegarde des médias ? *(→ [12.3](#section-12-3))*

> **Réponses** — **1.** Éphémère, bloc persistant, objet. Les médias utilisent un PVC en stockage bloc persistant (`local-path`). **2.** Non : le volume est un répertoire sur le disque du nœud, lui-même sur le VPS. Sa perte emporte le volume. **3.** Les médias sortiraient du volume local : la sauvegarde porterait alors sur le bucket, avec ses propres règles de cycle de vie, et non plus sur une archive produite dans le Pod.

**Où aller ensuite** — Le [chapitre 13](#chapitre-13) traite du stockage le plus critique du projet : les données comptables.

<a id="chapitre-13"></a>

## 13. PostgreSQL

> **En une phrase** — PostgreSQL conserve le métier ; migrations, droits, sauvegardes et restauration doivent être traités ensemble.

**Ce que vous saurez faire à la fin de ce chapitre**

1. Expliquer pourquoi SQLite est refusé, et pourquoi ce refus est inscrit dans l'image.
2. Lire le StatefulSet PostgreSQL 17 et dire où vivent ses données.
3. Appliquer les quatre règles de migration et concevoir une migration compatible *expand/contract*.
4. Produire une sauvegarde, **vérifier qu'elle est lisible**, et la restaurer dans une base isolée.
5. Contrôler après restauration que la numérotation des factures n'est pas repartie à zéro.

**Prérequis** — [chapitres 9](#chapitre-09) et [12](#chapitre-12) · **Lecture** — 14 min · **Nature** — architecture, exploitation et procédure

<a id="section-13-1"></a>

### 13.1 PostgreSQL, et pourquoi pas SQLite

**PostgreSQL** est une base de données relationnelle libre, robuste et transactionnelle. Ses transactions permettent de rendre atomiques les opérations regroupées par l'application ; elle gère les accès concurrents et fournit les outils de sauvegarde et de réplication. La cohérence d'une facture dépend aussi des transactions et contraintes du code.

La démonstration historique tourne encore sur **SQLite** : `settings.py` y retombe si `DATABASE_URL` est absent. SQLite est un simple fichier, sans serveur, adapté au développement mais pas à un service multi-processus :

- `select_for_update()` et les verrous consultatifs sont sans effet : seules les contraintes d'unicité protègent réellement la numérotation ;
- plusieurs Pods ne peuvent pas partager un fichier SQLite ;
- la sauvegarde se résume à copier un fichier en cours d'écriture.

C'est pourquoi l'image backend **refuse** toute autre base que PostgreSQL (`container_settings.py`).

> **À valider** — La migration des **données réelles** de SQLite vers PostgreSQL n'est pas faite. La procédure (export, import, contrôle des totaux et des séquences) est décrite dans `infra/patches/README.md` §7 et doit être répétée en PREPROD avant toute production.

<a id="section-13-2"></a>

### 13.2 PREPROD : un StatefulSet PostgreSQL 17

```yaml
# infra/k8s/k3d/data.yaml — PREPROD mononœud : stockage local-path, aucune garantie HA.
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: facturadj-postgres
spec:
  serviceName: facturadj-postgres
  replicas: 1                                  # une seule instance
  selector:
    matchLabels: {app: facturadj-postgres}
  template:
    metadata:
      labels: {app: facturadj-postgres}
    spec:
      automountServiceAccountToken: false
      securityContext:
        runAsNonRoot: true
        runAsUser: 999                         # utilisateur postgres de l'image officielle
        runAsGroup: 999
        fsGroup: 999                           # le volume appartient au groupe 999
        seccompProfile: {type: RuntimeDefault}
      containers:
      - name: postgres
        image: postgres:17-bookworm            # remplacé par le digest dans l'overlay
        ports:
        - {name: postgres, containerPort: 5432}
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true         # seuls les volumes sont inscriptibles
          capabilities: {drop: [ALL]}
        resources:
          requests: {cpu: 100m, memory: 128Mi}
          limits: {cpu: '1', memory: 512Mi}
        env:
        - {name: POSTGRES_DB, value: facturadj}
        - {name: POSTGRES_USER, value: facturadj}
        - name: PGDATA
          value: /var/lib/postgresql/data/pgdata   # sous-dossier : la racine du volume n'est pas vide
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef: {name: facturadj-postgres, key: POSTGRES_PASSWORD}
        volumeMounts:
        - {name: data, mountPath: /var/lib/postgresql/data}
        - {name: run, mountPath: /var/run/postgresql}     # socket local
        - {name: tmp, mountPath: /tmp}
        readinessProbe:
          exec:
            command: [pg_isready, -U, facturadj, -d, facturadj]
          periodSeconds: 5
      volumes:
      - {name: run, emptyDir: {}}
      - {name: tmp, emptyDir: {}}
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: [ReadWriteOnce]
      storageClassName: local-path
      resources:
        requests:
          storage: 20Gi
```

| Point | Explication |
|---|---|
| `PGDATA` dans un sous-dossier | La racine d'un volume peut contenir des fichiers système ; `initdb` exige un dossier vide |
| `readOnlyRootFilesystem` avec `emptyDir` sur `/var/run/postgresql` et `/tmp` | PostgreSQL n'écrit que là où c'est prévu |
| Sonde `pg_isready` | Le Pod n'est déclaré prêt que lorsque la base accepte les connexions |
| Pas de sonde de vivacité | Un redémarrage automatique d'une base en cours de récupération serait plus dangereux qu'utile |
| Service `ClusterIP` sans Ingress | La base n'est jamais exposée hors du cluster ; seul le backend y accède (NetworkPolicy) |

> **Note** — Les images `postgres` et `redis` sont tirées depuis Docker Hub (fixées par digest dans l'overlay), sans `imagePullSecrets`. Le VPS doit donc joindre Docker Hub, qui applique des quotas de téléchargement anonymes. Un projet *proxy cache* dans Harbor peut servir de relais.

<a id="section-13-3"></a>

### 13.3 Accès et secrets

Le mot de passe de la base apparaît à **deux** endroits, qui doivent rester cohérents :

| Secret | Clé | Contenu |
|---|---|---|
| `facturadj-postgres` | `POSTGRES_PASSWORD` | Le mot de passe, lu par l'image PostgreSQL **à la première initialisation** |
| `facturadj-backend` | `DATABASE_URL` | `postgresql://facturadj:<mot de passe URL-encodé>@facturadj-postgres:5432/facturadj` |

> **Attention** — `POSTGRES_PASSWORD` n'est lu qu'à la création de la base. Modifier ensuite le Secret **ne change pas** le mot de passe dans PostgreSQL : il faut exécuter `ALTER ROLE` puis mettre à jour les deux Secrets de façon coordonnée.

Création des fichiers secrets **sans jamais afficher les valeurs** (ajout de ce manuel, à exécuter sur la machine d'administration) :

```bash
# MODIFICATION LOCALE : fichiers secrets hors dépôt, droits 600, jamais écrasés
python3 - <<'PY'
import os, secrets, urllib.parse
from pathlib import Path
os.umask(0o077)
folder = Path.home() / "nexora-secrets/facturadj"
folder.mkdir(parents=True, exist_ok=True)
password = secrets.token_hex(32)
with (folder / "postgres-password").open("x") as f:
    f.write(password)                      # SANS retour à la ligne final
lines = [
    "DJANGO_SECRET_KEY=" + secrets.token_urlsafe(64),
    "DATABASE_URL=postgresql://facturadj:" + urllib.parse.quote(password, safe="")
    + "@facturadj-postgres:5432/facturadj",
]
with (folder / "backend-preprod.env").open("x") as f:
    f.write("\n".join(lines) + "\n")
print("Fichiers créés dans", folder)
PY
```

> **Attention — piège du retour à la ligne** — `kubectl create secret --from-file` copie le fichier **octet pour octet**. Un fichier écrit avec `echo` ou `print` se termine par un retour à la ligne, qui ferait partie du mot de passe PostgreSQL mais pas de `DATABASE_URL` : l'authentification échouerait. Le script ci-dessus écrit le mot de passe sans retour à la ligne.

<a id="section-13-4"></a>

### 13.4 Django et les connexions

| Réglage | Valeur | Effet |
|---|---|---|
| `conn_max_age=600` (`settings.py`) | 10 minutes | Une connexion est réutilisée au lieu d'être rouverte à chaque requête |
| `connect_timeout=3` (`container_settings.py`) | 3 secondes | Une base injoignable échoue vite au lieu de bloquer les workers |
| Gunicorn | 2 workers × 2 threads | Au plus quelques connexions par Pod, loin de la limite par défaut de PostgreSQL (100) |

Après un redémarrage de PostgreSQL, les connexions persistantes pointent vers un serveur disparu : Django détecte l'erreur et rouvre une connexion. Quelques requêtes peuvent échouer pendant le redémarrage.

> **Cible PROD** — Au-delà d'une vingtaine de Pods backend, intercaler un *pooler* de connexions (PgBouncer).

<a id="section-13-5"></a>

### 13.5 Les migrations de schéma

Une **migration** Django modifie le schéma de la base (tables, colonnes, index). Règles FacturaDJ :

- **jamais au démarrage** du conteneur : l'entrypoint n'exécute aucune migration ;
- **jamais en hook Argo CD** : la migration est un Job **hors Kustomization**, appliqué à la main ;
- **toujours après une sauvegarde exploitable** ;
- **toujours avec le digest backend de la release** : `prepare_gitops.py` inscrit ce digest dans le Job.

```yaml
# infra/k8s/operations/migrate.yaml (tel que produit par prepare_gitops.py)
# Hors Kustomization et sans hook : uniquement sur décision manuelle après sauvegarde.
apiVersion: batch/v1
kind: Job
metadata:
  name: facturadj-migrate-<12 premiers caractères du SHA>   # un Job par release
  namespace: facturadj-preprod
spec:
  backoffLimit: 0                 # aucune nouvelle tentative automatique
  activeDeadlineSeconds: 600      # abandon après 10 minutes
  ttlSecondsAfterFinished: 86400  # nettoyage après 24 h
  template:
    metadata:
      labels:
        app: facturadj-backend    # hérite des NetworkPolicies du backend (voir réserve)
    spec:
      restartPolicy: Never
      automountServiceAccountToken: false
      securityContext:
        runAsNonRoot: true
        runAsUser: 10001
        runAsGroup: 10001
        fsGroup: 10001
        seccompProfile: {type: RuntimeDefault}
      imagePullSecrets:
      - name: harbor-pull
      containers:
      - name: migrate
        image: harbor.nexora-djibouti.fr/facturadj/backend@sha256:<digest de la release>
        command: [python, manage.py, migrate, --noinput]
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities: {drop: [ALL]}
        envFrom:
        - configMapRef: {name: facturadj-config}
        - secretRef: {name: facturadj-backend}
        resources:
          requests: {cpu: 100m, memory: 128Mi}
          limits: {cpu: '1', memory: 512Mi}
        volumeMounts:
        - {name: tmp, mountPath: /tmp}
      volumes:
      - name: tmp
        emptyDir: {}
```

> **À valider — séparation du Job et du Service.** Le Job et le backend partagent `app: facturadj-backend`, alors que ce label sert à la fois aux NetworkPolicies et au sélecteur du Service. Cette ambiguïté doit être supprimée. La création d'un endpoint HTTP exploitable dépend notamment du port nommé `http`, absent du Job : on ne peut donc pas déduire des seules étiquettes qu'il reçoit effectivement du trafic. Prévoir un label de migration distinct avec les autorisations réseau adaptées, et vérifier les EndpointSlices. Le runbook actuel maintient l'accès fermé pendant la migration.

**Migrations compatibles : la stratégie expand/contract.** Revenir à l'ancien code ne défait **jamais** une migration. Toute migration doit donc rester compatible avec la version **précédente** du code.

| Release | Schéma | Code |
|---|---|---|
| N (expand) | Ajouter la nouvelle colonne, nullable | Écrit l'ancienne **et** la nouvelle colonne |
| N+1 | Remplir la nouvelle colonne, ajouter les contraintes | Lit la nouvelle colonne |
| N+2 (contract) | Supprimer l'ancienne colonne | N'utilise plus l'ancienne |

Supprimer ou renommer une colonne dans la même livraison qu'un changement de code est **incompatible** : cela exige une fenêtre d'arrêt planifiée.

<a id="section-13-6"></a>

### 13.6 Sauvegarder et restaurer en PREPROD

Cette section est la **procédure de référence pour PostgreSQL**. Le chapitre 19 complète la sauvegarde avec les médias, les secrets, les images et le dépôt GitOps.

**Objectif :** obtenir une archive exploitable, démontrer sa restauration et savoir l'utiliser sans effacer prématurément la base existante. Les commandes supposent PostgreSQL 17, le Pod `facturadj-postgres-0` et le rôle `facturadj` décrits dans le dépôt. Les adapter si l'inventaire réel diffère.

<a id="section-13-6-1"></a>

#### 13.6.1 Préparer le contexte et le fichier

**Machine :** administration, terminal Bash. **Effet :** lecture du cluster et création d'un dossier local confidentiel.

~~~bash
# LECTURE / PRÉPARATION LOCALE
: "${KUBE_CONTEXT:?Définir le contexte PREPROD vérifié}"
K=(kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod)
"${K[@]}" get pod facturadj-postgres-0
"${K[@]}" exec facturadj-postgres-0 -- pg_isready -U facturadj -d facturadj
"${K[@]}" exec facturadj-postgres-0 -- df -h /var/lib/postgresql/data

umask 077
BACKUP_DIR="$HOME/nexora-backups/facturadj"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DUMP="$BACKUP_DIR/facturadj-$STAMP.dump"
mkdir -p "$BACKUP_DIR"
df -h "$BACKUP_DIR"
~~~

**Attendu :** PostgreSQL accepte les connexions ; l'espace local permet le dump et le volume PostgreSQL permet une seconde base. La taille de l'archive compressée ne correspond pas à l'espace nécessaire à la restauration.

**Arrêt :** contexte inconnu, base inaccessible, rôle différent non documenté ou espace insuffisant.

<a id="section-13-6-2"></a>

#### 13.6.2 Produire le dump et vérifier son catalogue

~~~bash
# SAUVEGARDE : fichier .partial tant que les contrôles n'ont pas réussi
(
  set -euo pipefail
  umask 077
  test ! -e "$DUMP"
  test ! -e "$DUMP.partial"
  "${K[@]}" exec facturadj-postgres-0 -- \
    pg_dump -U facturadj -d facturadj -Fc > "$DUMP.partial"
  test -s "$DUMP.partial"
  "${K[@]}" exec -i facturadj-postgres-0 -- \
    pg_restore --list < "$DUMP.partial" > "$DUMP.list"
  test -s "$DUMP.list"
  mv -- "$DUMP.partial" "$DUMP"
  sha256sum "$DUMP" > "$DUMP.sha256"
)
~~~

**Explication.** `-Fc` produit une archive au format personnalisé. Un fichier `.partial` signale une sauvegarde inachevée. Le renommage final intervient après réussite du dump et lecture de son catalogue.

**Attendu :** code 0 et présence des fichiers `.dump`, `.dump.list` et `.dump.sha256`. Lire le catalogue avec `sed -n '1,20p' "$DUMP.list"`.

`pg_restore --list` lit la table des matières ; il **ne vérifie pas la restauration de toutes les données**. Le dump représente un instant cohérent de la base, sans synchroniser les fichiers médias. [Référence PostgreSQL : sauvegarde logique](https://www.postgresql.org/docs/17/backup-dump.html).

**Avant migration :** conserver aussi les digests et le commit GitOps en service. La sauvegarde doit être liée à la release qu'elle permet de rétablir.

<a id="section-13-6-3"></a>

#### 13.6.3 Restaurer dans une base isolée

**Effet :** création d'une seconde base sur la même instance. Ce test consomme les ressources du même hébergement. Pour une base volumineuse, privilégier une instance de restauration séparée.

~~~bash
# MODIFICATION DB DE TEST : nom unique ; aucune suppression préalable
TEST_DB="facturadj_restore_$(date -u +%Y%m%d%H%M%S)"
(
  set -euo pipefail
  sha256sum -c "$DUMP.sha256"
  "${K[@]}" exec facturadj-postgres-0 -- \
    createdb -U facturadj -T template0 "$TEST_DB"
  "${K[@]}" exec -i facturadj-postgres-0 -- \
    pg_restore -U facturadj -d "$TEST_DB" \
      --no-owner --exit-on-error --single-transaction < "$DUMP"
)
~~~

`--no-owner` attribue les objets au rôle qui restaure : vérifier que cela correspond à la politique de droits. `--single-transaction` évite une restauration SQL partielle en cas d'erreur ; le dimensionnement doit permettre cette transaction. [Référence PostgreSQL : options de restauration](https://www.postgresql.org/docs/17/app-pgrestore.html).

~~~bash
# LECTURE : contrôles sur la base RESTAURÉE
"${K[@]}" exec facturadj-postgres-0 -- \
  psql -X -U facturadj -d "$TEST_DB" -v ON_ERROR_STOP=1 -c \
  "SELECT 'factures' AS objet, count(*) FROM sales_facture
   UNION ALL SELECT 'clients', count(*) FROM crm_client
   UNION ALL SELECT 'ecritures', count(*) FROM accounting_ecriturecomptable;"

"${K[@]}" exec facturadj-postgres-0 -- \
  psql -X -U facturadj -d "$TEST_DB" -v ON_ERROR_STOP=1 -c \
  "SELECT * FROM core_sequencenumerotation;"

"${K[@]}" exec facturadj-postgres-0 -- \
  psql -X -U facturadj -d "$TEST_DB" -v ON_ERROR_STOP=1 -c \
  "SELECT app, name, applied FROM django_migrations ORDER BY applied DESC LIMIT 20;"
~~~

Ces tables correspondent aux modèles examinés. Une base neuve, avant sa première migration, peut ne pas les contenir : le préciser dans le compte rendu.

**Critères de réussite :**

- restauration terminée sans erreur, tables et migrations attendues présentes ;
- comptages comparés aux repères relevés au moment de la sauvegarde ;
- dernières factures, totaux et séquences examinés avec le référent métier ;
- création d'un document fictif testée sur une application de restauration isolée, sans collision de numérotation ;
- durée et espace consommé consignés.

Un comptage identique ne prouve pas l'intégrité comptable. Les séquences PostgreSQL et la table `core_sequencenumerotation` remplissent des rôles différents : le test métier doit couvrir les deux.

**Nettoyage facultatif, après validation du compte rendu :**

~~~bash
# SUPPRESSION CIBLÉE : uniquement la base temporaire de cet exercice
(
  set -euo pipefail
  [[ "$TEST_DB" =~ ^facturadj_restore_[0-9]{14}$ ]]
  "${K[@]}" exec facturadj-postgres-0 -- dropdb -U facturadj "$TEST_DB"
)
~~~

Conserver cette base si elle doit servir au scénario de reprise suivant.

<a id="section-13-6-4"></a>

#### 13.6.4 Rétablir le service après un incident de données

**Déclencheur :** corruption, suppression accidentelle ou migration dont la réparation a été écartée. **Décision attendue :** point de restauration accepté, perte de données évaluée, fenêtre d'arrêt ouverte.

La méthode privilégie une **nouvelle base restaurée**, puis une bascule de noms, en conservant l'ancienne base pour analyse. `pg_restore --clean` ne supprime que les objets visés par l'archive : ce n'est pas une remise à zéro universelle.

1. Fermer l'accès par un pare-feu ou un dispositif de maintenance vérifié. Un changement DNS seul ne ferme pas les accès déjà résolus.
2. Geler les synchronisations, arrêter les applications et tout traitement capable d'écrire.
3. Relever les connexions restantes et comprendre leur origine.
4. Restaurer et contrôler la base selon 13.6.3 ; vérifier que l'espace permet cette coexistence.
5. Préparer le code, le schéma et les médias compatibles avec le point restauré.
6. Basculer, redémarrer, contrôler puis rouvrir.

~~~bash
# DÉPLOIEMENT : arrêt des applications ; dérive GitOps temporaire
"${K[@]}" scale deploy/facturadj-frontend deploy/facturadj-backend --replicas=0
"${K[@]}" get pods,jobs

# LECTURE : examiner les sessions des bases avant la bascule
"${K[@]}" exec facturadj-postgres-0 -- \
  psql -X -U facturadj -d postgres -v ON_ERROR_STOP=1 -c \
  "SELECT datname, usename, application_name, state
   FROM pg_stat_activity WHERE datname LIKE 'facturadj%';"
~~~

**Attendre la disparition des Pods applicatifs.** Tout Job de migration ou traitement externe doit être terminé ou arrêté selon sa procédure. PostgreSQL reste en service.

**Arrêt :** une session applicative persiste, la restauration n'a pas été validée, ou le couple code/schéma compatible reste inconnu.

Après arrêt des clients, `TEST_DB` doit désigner la base restaurée **conservée**, et non une base déjà supprimée.

~~~bash
# MODIFICATION DB : bascule conservant la base précédente
QUARANTINE_DB="facturadj_quarantine_$(date -u +%Y%m%d%H%M%S)"
(
  set -euo pipefail
  [[ "$TEST_DB" =~ ^facturadj_restore_[0-9]{14}$ ]]
  [[ "$QUARANTINE_DB" =~ ^facturadj_quarantine_[0-9]{14}$ ]]
  "${K[@]}" exec -i facturadj-postgres-0 -- \
    psql -X -U facturadj -d postgres -v ON_ERROR_STOP=1 \
      -v recovered="$TEST_DB" -v previous="$QUARANTINE_DB" <<'SQL'
ALTER DATABASE facturadj ALLOW_CONNECTIONS false;
ALTER DATABASE :"recovered" ALLOW_CONNECTIONS false;
ALTER DATABASE facturadj RENAME TO :"previous";
ALTER DATABASE :"recovered" RENAME TO facturadj;
ALTER DATABASE facturadj ALLOW_CONNECTIONS true;
SQL
)
~~~

**En cas d'arrêt intermédiaire :** lire l'état des bases depuis `postgres` avant de reprendre. Si l'ancienne a déjà été renommée, décider de terminer la bascule ou de lui redonner son nom initial ; ne pas rejouer aveuglément le bloc. Les connexions déjà ouvertes ne sont pas fermées par `ALLOW_CONNECTIONS false` : d'où le contrôle préalable.

Vérifier le propriétaire, les extensions, les droits `CONNECT` et les réglages propres à la base restaurée. Faire exécuter `ANALYZE` par l'administrateur, puis contrôler les migrations et parcours métier.

**Remise en service :** suivre [18.4](#section-18-4) avec une révision GitOps approuvée compatible. La dernière version de `main` n'est pas nécessairement cette version. La base en quarantaine reste inaccessible aux applications jusqu'à une décision de conservation ou suppression.

**Clôture :** consigner la sauvegarde, son empreinte, le point de reprise, la perte estimée, les contrôles et le temps réel de rétablissement.

<a id="section-13-7"></a>

### 13.7 Droits et rôles

> **À valider** — Dans l'image PostgreSQL officielle, l'utilisateur créé par `POSTGRES_USER` est **superutilisateur**. En PREPROD, l'application se connecte donc avec un rôle tout-puissant : une injection SQL réussie pourrait lire des fichiers du serveur ou créer des rôles. Recommandation : créer un rôle applicatif sans privilège, propriétaire de la base, et réserver le superutilisateur à l'administration.

Bonnes pratiques de droits, issues de l'étude cible :

```sql
-- Le schéma public n'est plus ouvert en écriture à tous les rôles
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE, CREATE ON SCHEMA public TO facturadj;

-- Rôle en lecture seule pour les rapports ou un outil décisionnel
CREATE ROLE lecteur_rapports LOGIN PASSWORD :'motdepasse';
GRANT CONNECT ON DATABASE facturadj TO lecteur_rapports;
GRANT USAGE ON SCHEMA public TO lecteur_rapports;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO lecteur_rapports;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO lecteur_rapports;
```

Journaliser les connexions (`log_connections`, `log_disconnections`) est une exigence d'audit pertinente pour des données comptables.

<a id="section-13-8"></a>

### 13.8 Cible PROD : choisir l'exploitation de PostgreSQL

> **Cible PROD** — Synthèse de l'étude d'août.

| | A. StatefulSet « à la main » | B. CloudNativePG (opérateur) | C. PostgreSQL managé |
|---|---|---|---|
| **Bascule en cas de panne** | Manuelle | Automatique (20 à 40 s) | Contractuelle |
| **Sauvegarde** | `pg_dump` planifié : RPO de 24 h pour un dump quotidien | WAL continu vers S3 et base complète planifiée : RPO ~5 min | Automatique |
| **Restauration à un instant donné (PITR)** | Non, sans archivage WAL fait main | Oui, à la seconde | Oui, via la console |
| **Maintenance** | Élevée | Faible : l'opérateur gère bascules et sauvegardes | Nulle |
| **Coût indicatif** | Volume seul (~4 €/mois) | Volumes et ressources (~15 à 25 €/mois pour 2 instances) | 90 à 250 €/mois selon l'offre |
| **Pertinence** | PREPROD uniquement | **Recommandé en production** | Si personne n'assure d'astreinte |

Le facteur décisif est humain : **qui intervient la nuit si la base tombe ?** Sans astreinte, le managé vaut son surcoût ; avec une astreinte, CloudNativePG fait aussi bien pour une fraction du prix.

| Profil | Choix | Garanties |
|---|---|---|
| Économique | CloudNativePG, 1 instance, WAL vers S3 | Pas de HA, RPO ~5 min |
| Production | CloudNativePG, 2 instances synchrones | RPO nul sur perte de nœud, bascule automatique |
| HA avancée | CloudNativePG, 3 instances, ou managé | RPO nul, RTO de quelques dizaines de secondes |

**Réglages proposés et leur raison :**

```yaml
shared_buffers: 512MB           # ~25 % de la mémoire allouée à PostgreSQL
effective_cache_size: 1536MB    # indique au planificateur la taille du cache du système
work_mem: 8MB                   # s'applique PAR tri et PAR connexion : ne pas gonfler
random_page_cost: 1.1           # disques NVMe : lecture aléatoire ≈ séquentielle
log_min_duration_statement: 500 # trace les requêtes de plus de 500 ms
wal_compression: on             # moins de WAL à archiver
```

Le piège classique est `work_mem` : avec 200 connexions, 64 Mo pourraient théoriquement réclamer 12 Go. Ne l'augmenter que si `EXPLAIN ANALYZE` montre `external merge` sur les rapports comptables. Un **volume WAL séparé** évite que les écritures séquentielles du journal et les accès aléatoires aux données se gênent.

**Exploitation avec CloudNativePG** (extension `kubectl cnpg`) :

```bash
kubectl cnpg status facturadj-db -n facturadj-prod                      # état, réplication, archivage
kubectl cnpg backup facturadj-db -n facturadj-prod                      # sauvegarde immédiate
kubectl cnpg promote facturadj-db facturadj-db-2 -n facturadj-prod      # bascule contrôlée
kubectl cnpg psql facturadj-db -n facturadj-prod                        # console psql sur le primaire
```

Une montée de version **majeure** (17 vers 18) ne se fait pas en place : nouveau cluster, puis `pg_dump`/`pg_restore` ou réplication logique, puis bascule de `DATABASE_URL`, testée d'abord en PREPROD.

<a id="section-13-9"></a>

### 13.9 Commandes d'exploitation PREPROD

```bash
K=(kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod)

# LECTURE : la base accepte-t-elle les connexions ?
"${K[@]}" exec facturadj-postgres-0 -- pg_isready -U facturadj -d facturadj
# attendu : /var/run/postgresql:5432 - accepting connections

# LECTURE : taille de la base
"${K[@]}" exec facturadj-postgres-0 -- psql -U facturadj -d facturadj -c \
  "SELECT pg_size_pretty(pg_database_size('facturadj'));"

# LECTURE : connexions actives
"${K[@]}" exec facturadj-postgres-0 -- psql -U facturadj -d facturadj -c \
  "SELECT usename, application_name, state, count(*) FROM pg_stat_activity GROUP BY 1,2,3;"

# LECTURE : état des migrations appliquées (dernières lignes)
"${K[@]}" exec facturadj-postgres-0 -- psql -U facturadj -d facturadj -c \
  "SELECT app, name, applied FROM django_migrations ORDER BY applied DESC LIMIT 10;"

# LECTURE : journaux PostgreSQL
"${K[@]}" logs facturadj-postgres-0 --tail=100

# LECTURE : espace du volume
"${K[@]}" exec facturadj-postgres-0 -- df -h /var/lib/postgresql/data
```
<a id="mise-en-pratique--chapitre-13"></a>

### Mise en pratique — chapitre 13

**Vérifier une numérotation restaurée.** Après restauration, la table des factures peut être présente alors que les prochains numéros ne sont pas cohérents avec les documents existants. **Contrôle :** examiner les compteurs métier et tester un document fictif sur une cible isolée. Un test SELECT 1 ne donne aucune information sur cette propriété.

<a id="synthese-du-chapitre-13"></a>

#### Synthèse du chapitre 13

**À retenir**

- Les quatre règles de migration : **jamais** au démarrage du conteneur, **jamais** en hook Argo CD, **toujours** après une sauvegarde exploitable, **toujours** avec le digest backend de la release.
- Revenir à l'ancien code ne défait **jamais** une migration. Toute migration doit rester compatible avec la version précédente du code : c'est la stratégie *expand / contract*, étalée sur trois releases.
- Une sauvegarde jamais restaurée n'est pas une preuve de capacité de reprise. Le test de restauration se fait dans une base temporaire, jamais sur `facturadj`.
- Le contrôle de la table de numérotation n'est pas un détail : une numérotation qui repart à 1 après restauration est un incident comptable.
- Une sauvegarde conservée uniquement sur le VPS ne protège pas de la perte du VPS.

**Les pièges classiques**

| Le piège | Pourquoi on tombe dedans | Le bon réflexe |
|---|---|---|
| Supprimer et renommer une colonne dans la même livraison qu'un changement de code | C'est le geste naturel du développeur | C'est incompatible avec tout retour arrière : cela exige une fenêtre d'arrêt planifiée. Préférer *expand / contract* |
| Considérer un `pg_dump` réussi comme une sauvegarde valide | La commande n'a rien affiché d'anormal | Vérifier avec `pg_restore --list` : un fichier vide ou illisible se découvre le jour de la restauration, sinon |
| Restaurer directement dans `facturadj` pour « tester » | On veut voir si cela fonctionne | Le test se fait dans une base temporaire, supprimée ensuite. La base de production de recette n'est pas un banc d'essai |
| Oublier que l'utilisateur applicatif est superutilisateur | L'image officielle le crée ainsi | Risque documenté ([13.7](#section-13-7)) : une injection SQL réussie irait bien au-delà des données. Créer un rôle applicatif non privilégié |

**Vérifiez votre compréhension**

1. Pourquoi une migration ne doit-elle jamais s'exécuter au démarrage du conteneur ? *(→ [13.5](#section-13-5))*
2. Décrivez la stratégie *expand / contract* sur trois releases. *(→ [13.5](#section-13-5))*
3. Quel contrôle post-restauration est spécifique à une application de facturation ? *(→ [13.6](#section-13-6))*

> **Réponses** — **1.** Parce qu'elle deviendrait un effet de bord : elle s'exécuterait sans décision, sans sauvegarde préalable, et potentiellement plusieurs fois en parallèle si plusieurs Pods démarrent. **2.** Release N : ajouter la nouvelle colonne nullable, le code écrit l'ancienne et la nouvelle. Release N+1 : remplir la colonne, ajouter les contraintes, le code lit la nouvelle. Release N+2 : supprimer l'ancienne colonne. **3.** Vérifier que la table de numérotation n'est pas repartie à zéro : une numérotation incohérente est un incident d'intégrité métier à traiter avec le responsable comptable.

**Où aller ensuite** — Le [chapitre 14](#chapitre-14) reprend l'ensemble des couches de protection, une par une.

<!-- PARTIE: Partie V — Protéger -->

<a id="chapitre-14"></a>

## 14. Sécurité (DevSecOps)

> **En une phrase** — La sécurité s'applique aux images, identités, secrets et communications ; chaque protection nécessite une vérification concrète.

**Ce que vous saurez faire à la fin de ce chapitre**

1. Expliquer la défense en profondeur et nommer les couches, de l'extérieur vers l'intérieur.
2. Pour chaque mécanisme : dire contre quoi il protège, où il est mis en œuvre, comment le vérifier.
3. Distinguer ce qui est actif de ce qui reste à faire (signature d'images, coffre-fort, rôle PostgreSQL non privilégié).
4. Faire tourner un secret en sachant à quel moment il est réellement pris en compte.
5. Dire ce que l'audit permet de reconstituer, et ce qu'il ne permet pas.

**Prérequis** — [chapitres 5](#chapitre-05), [9](#chapitre-09) et [11](#chapitre-11) · **Lecture** — 16 min · **Nature** — architecture, exploitation et vérification

<a id="section-14-1"></a>

### 14.1 La défense en profondeur

Aucune protection n'est suffisante seule. La **défense en profondeur** empile des couches indépendantes : pour atteindre les données, un attaquant doit les franchir toutes.

> **Analogie** — Un château fort : fossé, pont-levis, remparts, cour intérieure, donjon, coffre. Chaque obstacle ralentit, et la chute de l'un n'ouvre pas les autres.

**Couches d'exécution de la PREPROD, de l'extérieur vers l'intérieur :**

```text
Internet
 └─ DNS + certificat TLS valide (HTTPS uniquement)
     └─ Traefik : seul point d'entrée, Ingress du frontend uniquement
         └─ NetworkPolicy : refus par défaut, flux nommés
             └─ Pod Security « restricted » : non-root, seccomp, sans escalade
                 └─ Conteneur durci : UID 10001, rootfs RO, capabilities retirées, sans jeton
                     └─ Astro (checkOrigin, cookies Secure) ─► Django (JWT, rôles, quotas Redis)
                         └─ PostgreSQL et Redis privés, jamais exposés
```

**Couches de la chaîne d'approvisionnement logicielle :**

```text
Git protégé ─► CI DEV sans secret ─► construction contrôlée (SHA, digests, lock)
                                                    │
                                                    ▼
sync manuel ◄─ MR GitOps approuvée ◄─ Harbor privé (robots) ◄─ scan bloquant + SBOM
```

> **Cible PROD** — L'étude d'août ajoute en façade un WAF et une limitation de débit (Cloudflare), un répartiteur limité au port 443 et une limitation de débit au niveau du routeur, en plus du quota applicatif de Django.

<a id="section-14-2"></a>

### 14.2 Les mécanismes, un par un

Chaque fiche suit le même raisonnement :

```text
Risque
   ↓
Protection
   ↓
Mise en œuvre
   ↓
Vérification
```

Dans ce chapitre, `K` désigne `kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod` :

```bash
K=(kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod)
```

<a id="section-14-2-1"></a>

#### 14.2.1 Durcissement des images et des Pods

**Risque** — Un attaquant qui exploite une faille applicative obtient un shell dans le conteneur, puis modifie le code, installe un outil ou tente de s'évader vers le nœud.

**Protection** — Moindre privilège : utilisateur non root, système de fichiers en lecture seule, aucune capability, aucune escalade, profil seccomp, image minimale multi-étapes sans outils de compilation.

**Mise en œuvre** — Dockerfiles ([5.6](#section-5-6), [5.7](#section-5-7)), `securityContext` des manifests ([9.5](#section-9-5)), `DEBUG` refusé par l'image.

**Vérification**

```bash
# LECTURE : identité du processus. Attendu : uid=10001 gid=10001
"${K[@]}" exec deploy/facturadj-backend -- id
# LECTURE : écriture interdite. Attendu : « Read-only file system »
"${K[@]}" exec deploy/facturadj-backend -- sh -c 'touch /app/test-ecriture'
# LECTURE : aucun jeton Kubernetes monté. Attendu : « No such file or directory »
"${K[@]}" exec deploy/facturadj-backend -- ls /var/run/secrets/kubernetes.io/serviceaccount
```

<a id="section-14-2-2"></a>

#### 14.2.2 Secrets

**Risque** — Un mot de passe ou une clé fuit par Git, par une couche d'image, par un journal, par les arguments d'une commande ou par la sortie de `docker inspect`.

**Protection** — Aucun secret dans le dépôt, les images, les URL, les arguments ou les journaux. Fichiers protégés hors dépôt, injection à l'exécution.

**Mise en œuvre**

| Où | Pratique |
|---|---|
| Stockage | `~/nexora-secrets/...`, droits 600, jamais dans le dépôt |
| Transmission | `--password-stdin`, `--from-file`, `--from-env-file`, variables GitLab de type *File* |
| Images | Liste blanche `.dockerignore`, aucun `ARG`/`ENV` secret, clé jetable pour `collectstatic` |
| Construction | Configuration Docker éphémère dans `images.sh push` |
| Kubernetes | Secrets créés à la main ; le namespace ne doit être accessible qu'aux administrateurs |
| Documentation | Aucune valeur réelle dans ce manuel, dans une MR ou dans un ticket |

> **Attention** — Le champ `data` des Secrets utilise base64, qui ne chiffre pas les valeurs. Le chiffrement au repos est un réglage distinct à vérifier. Toute personne qui peut exécuter `kubectl get secret -o yaml` dans le namespace lit les mots de passe. Protéger le kubeconfig comme un mot de passe administrateur.

> **Attention** — Les anciens fichiers hors parcours actif, notamment `docker-compose.yml` à la racine, contiennent des **valeurs de démonstration**. Ils ne servent ni au smoke ni à la PREPROD. Un scan du dépôt complet les signalera : ne pas affirmer que le dépôt est exempt de secrets.

**Vérification**

```bash
# LECTURE : noms des Secrets uniquement, jamais leur contenu
"${K[@]}" get secrets
# LECTURE : aucun fichier sensible suivi par Git
git ls-files | grep -iE '\.env$|\.env\.|\.key$|\.pem$|id_rsa|id_ed25519|\.sqlite' || echo "aucun"
# LECTURE : sur le nœud k3d, chiffrement des Secrets au repos (à valider)
docker exec k3d-<cluster>-server-0 k3s secrets-encrypt status
```

> **Cible PROD** — Coffre-fort Vault ou OpenBao avec External Secrets Operator (authentification par identité du Pod, rotation centralisée), ou Sealed Secrets (fichiers chiffrés versionnables, déchiffrés uniquement par le contrôleur du cluster). Dans ce second cas, le piège est de commiter le YAML **avant** de le chiffrer : gitleaks en pre-commit le bloque.

<a id="section-14-2-3"></a>

#### 14.2.3 RBAC et ServiceAccounts

**Risque** — Un Pod compromis utilise un jeton Kubernetes pour lister les Secrets ou créer des Pods ; un opérateur dispose de droits excessifs et commet une erreur irréversible.

**Protection** — **RBAC** (*Role-Based Access Control*) : chaque identité ne reçoit que les verbes nécessaires sur les ressources nécessaires. Les applications n'ont aucun jeton.

**Mise en œuvre** — `automountServiceAccountToken: false` sur tous les Pods ; aucun Role ni RoleBinding pour les applications ; accès humains par un kubeconfig réservé à la machine d'administration.

**Vérification**

```bash
# LECTURE : le compte de service par défaut ne peut pas lire les Secrets. Attendu : no
kubectl --context "$KUBE_CONTEXT" auth can-i get secrets -n facturadj-preprod \
  --as=system:serviceaccount:facturadj-preprod:default
# LECTURE : droits de l'identité courante
kubectl --context "$KUBE_CONTEXT" auth can-i --list -n facturadj-preprod
```

> **À valider** — Le kubeconfig PREPROD est vraisemblablement administrateur du cluster. L'étude d'août proposait deux rôles humains : **lecture** (sans accès aux Secrets) et **exploitation** (redéploiement, sans suppression de namespace ni modification des NetworkPolicies). À créer si plusieurs personnes interviennent.

<a id="section-14-2-4"></a>

#### 14.2.4 NetworkPolicy

**Risque** — Mouvement latéral : un Pod compromis joint PostgreSQL directement, ou exfiltre des données vers Internet ou vers le service de métadonnées du fournisseur.

**Protection** — Refus par défaut en entrée et en sortie, puis ouverture flux par flux.

**Mise en œuvre** — `infra/k8s/k3d/networkpolicies.yaml`, détaillé en [11.6](#section-11-6). Aucune sortie Internet.

**Vérification** — Les quatre tests de [11.6](#section-11-6) : deux flux autorisés doivent réussir, deux flux interdits doivent échouer.

> **Cible PROD** — Si une sortie Internet devient nécessaire (S3 en 443, SMTP en 587), la limiter aux ports utiles et exclure les plages privées et `169.254.0.0/16`, qui héberge le service de métadonnées des fournisseurs cloud, vecteur classique de vol d'identifiants par SSRF :

```yaml
egress:
- to:
  - ipBlock:
      cidr: 0.0.0.0/0
      except: [10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16]
  ports: [{protocol: TCP, port: 443}, {protocol: TCP, port: 587}]
```

<a id="section-14-2-5"></a>

#### 14.2.5 Pod Security Admission

**Risque** — Un manifest modifié, par erreur ou malveillance, demande un conteneur privilégié, un accès au réseau de l'hôte ou l'exécution en root.

**Protection** — Le contrôleur d'admission refuse tout Pod qui ne respecte pas le profil **restricted**.

**Mise en œuvre** — Labels `pod-security.kubernetes.io/enforce|audit|warn: restricted` sur le namespace ([9.3](#section-9-3)).

**Vérification**

```bash
# LECTURE : essai à blanc côté serveur d'un Pod privilégié. Attendu : refus « violates PodSecurity »
kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod run pss-test --image=busybox \
  --dry-run=server \
  --overrides='{"apiVersion":"v1","spec":{"containers":[{"name":"pss-test","image":"busybox","securityContext":{"privileged":true}}]}}'
```

```text
Error from server (Forbidden): pods "pss-test" is forbidden:
violates PodSecurity "restricted:latest": privileged (container "pss-test" must not set ...
```

<a id="section-14-2-6"></a>

#### 14.2.6 Scan des images et de la configuration

**Risque** — Une bibliothèque ou un paquet système embarqué contient une vulnérabilité connue ; un Dockerfile ou un manifest comporte une mauvaise pratique.

**Protection** — Analyse statique avant publication, **bloquante**.

**Mise en œuvre**

| Outil | Cible | Commande | Bloquant |
|---|---|---|---|
| Hadolint | Dockerfiles | `hadolint infra/docker/backend/Dockerfile infra/docker/frontend/Dockerfile` | Oui |
| Trivy config | Dockerfiles et manifests | `trivy config infra/docker` ; `trivy config infra/k8s/k3d` | À l'examen |
| Trivy image | Archives exactes à publier | `bash infra/ci/images.sh scan` | Oui, `HIGH` et `CRITICAL` |
| pip-audit, npm audit | Dépendances | CI GitHub | Oui |
| bandit | Code Python | CI GitHub | Oui (niveau moyen et plus) |
| Checkov (optionnel) | Manifests | `checkov -d infra/k8s/k3d --framework kubernetes` | À l'examen |

Trivy télécharge sa base de vulnérabilités et écrit un cache : prévoir l'accès réseau sur la machine de scan.

**Vérification** — `release/<composant>.trivy.json` existe, `release/scanned.sha256` a été écrit, et le job ou la commande s'est terminé avec le code 0.

**Traitement d'une vulnérabilité bloquante** : mettre à jour l'image de base (nouveau digest) ou la dépendance (nouveau lock, par PR), reconstruire, retester, rescanner. Ne jamais ajouter `|| true`. Une exception assumée se documente dans un fichier `.trivyignore` avec justification et date de réexamen.

> **Cible PROD — délais de correction proposés**

| Gravité | Délai | Sinon |
|---|---|---|
| CRITICAL exploitable | 48 h | Livraison en urgence |
| HIGH | 7 jours | PR de mise à jour prioritaire |
| MEDIUM | Prochaine version mineure | — |
| LOW | Revue trimestrielle | — |

<a id="section-14-2-7"></a>

#### 14.2.7 SBOM

**Risque** — Une nouvelle vulnérabilité est publiée ; impossible de savoir rapidement quelles releases sont concernées.

**Protection** — Conserver la nomenclature logicielle de chaque release.

**Mise en œuvre** — `images.sh scan` produit `release/backend.sbom.json` et `release/frontend.sbom.json` au format CycloneDX. Les archiver avec les autres reçus de la release ([19.2](#section-19-2)).

**Vérification**

```bash
# LECTURE : réanalyser une release passée à partir de son SBOM, sans l'image
trivy sbom release/backend.sbom.json
```

<a id="section-14-2-8"></a>

#### 14.2.8 Signature des images

**Risque** — Une image est remplacée dans la registry, ou une image non construite par la chaîne officielle est déployée.

**Protection** — Signer cryptographiquement chaque image par son digest et vérifier la signature avant déploiement.

**Mise en œuvre** — **Non implémentée.** Cible proposée : Cosign, signature stockée dans Harbor à côté de l'image, puis politique de vérification (Harbor ou contrôleur d'admission).

```bash
# Cible : signature et vérification par digest
cosign sign --key cosign.key harbor.nexora-djibouti.fr/facturadj/backend@sha256:<digest>
cosign verify --key cosign.pub harbor.nexora-djibouti.fr/facturadj/backend@sha256:<digest>
```

**Vérification dans le parcours actuel** — À défaut de signature, la traçabilité repose sur le reçu `digests.json`, les protections Harbor et le contrôle du label `revision`. Ces contrôles ne prouvent pas cryptographiquement l'identité du producteur.

<a id="section-14-2-9"></a>

#### 14.2.9 TLS

**Risque** — Interception ou modification du trafic, vol de cookies de session, usurpation du site.

**Protection** — HTTPS uniquement, certificat valide, cookies `Secure`, HSTS émis vers le navigateur.

**Mise en œuvre** — Ingress `websecure` avec le Secret `facturadj-tls` ([11.3](#section-11-3)) ; Harbor en TLS valide, jamais en `insecure-registries`.

**Vérification** — Commandes `openssl s_client` et `curl -sI` de [11.9](#section-11-9) ; date d'expiration relevée et alerte programmée.

<a id="section-14-2-10"></a>

#### 14.2.10 Harbor

**Risque** — Publication d'une image non approuvée, suppression d'une version nécessaire au retour arrière, identifiant de publication volé.

**Protection** — Projet privé, robots séparés et limités, immutabilité, rétention maîtrisée, audit.

**Mise en œuvre** — [Chapitre 7](#chapitre-07). Robot de publication : Pull + Push ; robot k3d : Pull seul ; expiration et rotation ; jamais le compte administrateur en CI.

**Vérification** — Dans l'interface Harbor : règles d'immutabilité `sha-*` et `v*` présentes, robots et dates d'expiration, journal d'audit des derniers push.

<a id="section-14-2-11"></a>

#### 14.2.11 Git et chaîne d'approvisionnement

**Risque** — Code non relu fusionné, historique réécrit, action GitHub tierce compromise, SHA substitué lors du transfert vers GitLab.

**Protection** — Branches protégées, revue obligatoire, transfert à sens unique d'un SHA vérifié, actions épinglées.

**Mise en œuvre** — [6.3](#section-6-3) à [6.5](#section-6-5).

**Vérification**

```bash
# LECTURE : le miroir GitLab contient exactement le SHA approuvé
git ls-remote "$GITLAB_MIRROR_URL" refs/heads/main
# LECTURE : actions GitHub non épinglées par SHA (à corriger)
grep -nE 'uses: [^@]+@v[0-9]' .github/workflows/*.yml
```

<a id="section-14-2-12"></a>

#### 14.2.12 CI/CD

**Risque** — Un job non fiable s'exécute sur le runner qui détient les identifiants Harbor ; un utilisateur non autorisé déclenche une publication ; la CI est utilisée comme porte d'entrée vers le cluster.

**Protection** — Runner dédié et protégé, environnements protégés, aucune clé de cluster en CI, artefacts à durée de vie courte.

**Mise en œuvre** — [8.4](#section-8-4) et [6.5](#section-6-5).

**Vérification** — Dans GitLab : environnements `image-build`, `image-scan`, `harbor-publication`, `preprod-proposal` protégés ; runner marqué *protected* et limité au tag `facturadj-preprod` ; variables protégées ; `check_static.py` vert.

<a id="section-14-2-13"></a>

#### 14.2.13 Kubernetes : API et hôte

**Risque** — L'API Kubernetes ou un port interne est joignable depuis Internet ; le VPS expose plus que nécessaire.

**Protection** — Seuls SSH et HTTPS (et HTTP si la redirection est souhaitée) sont joignables sur le VPS.

**Mise en œuvre et vérification**

```bash
# LECTURE sur le VPS : ports publiés par les conteneurs k3d
docker ps --format 'table {{.Names}}\t{{.Ports}}'
# LECTURE sur le VPS : ports en écoute
sudo ss -tlnp
```

> **À valider** — Selon les options de création du cluster, k3d peut publier le port de l'API Kubernetes (6443) sur toutes les interfaces. Vérifier dans la sortie de `docker ps` et restreindre à `127.0.0.1` ou filtrer au pare-feu. Attention : les ports publiés par Docker contournent les règles UFW habituelles ; filtrer au niveau du fournisseur ou de la chaîne `DOCKER-USER`.

<a id="section-14-2-14"></a>

#### 14.2.14 Application Django et Astro

**Risque** — Force brute sur la connexion, CSRF, injection SQL, XSS, exposition d'informations de débogage.

**Protection et mise en œuvre**

| Mesure | État | Source |
|---|---|---|
| JWT d'accès de 30 minutes | En place | `settings.py` (`ACCESS_TOKEN_LIFETIME`) |
| Quota de connexion `8/min`, traitements lourds `6/min` | En place, partagé par Redis | `settings.py`, `container_settings.py` |
| HSTS 1 an avec preload, cookies de session `Secure` | En place côté Django | `settings.py` |
| `CSRF_TRUSTED_ORIGINS` configurable | En place | `container_settings.py` |
| `checkOrigin` Astro en production | En place | `astro.config.mjs` |
| `DEBUG` interdit dans les images | En place | Point d'entrée et `container_settings.py` |
| Clé secrète sans valeur de repli hors DEBUG, Swagger et médias conditionnés à DEBUG, permissions par rôle par défaut | Relevé par l'analyse du 23/08 | `settings.py`, `urls.py` |
| Politique CSP avec nonce | À faire | [11.7](#section-11-7) |

> **Incohérence corrigée** — L'analyse du 23/08 signalait trois manques : `CSRF_TRUSTED_ORIGINS` absent, cache non partagé (quota compté par processus) et `checkOrigin: false`. Les trois sont corrigés dans la cible active.

**Vérification**

```bash
# LECTURE : requêtes SQL brutes à relire en revue
grep -rn "\.raw(\|\.extra(\|RawSQL\|cursor.execute" backend/apps/
# LECTURE : HTML injecté sans échappement côté Astro
grep -rn "set:html" frontend/src/
# LECTURE : quota de connexion. Attendu : des 429 après la 8e tentative
for i in $(seq 1 12); do
  curl -s -o /dev/null -w "%{http_code} " -X POST "https://preprod.<domaine>/login" \
    -d "username=inexistant&password=faux"
done; echo
```

> **Note** — Le code de retour exact du test de quota dépend de la manière dont Astro relaie la réponse de Django. L'essentiel est d'observer un changement de comportement après la 8e tentative dans la minute.

<a id="section-14-2-15"></a>

#### 14.2.15 PostgreSQL et Redis

**Risque** — Accès direct à la base, rôle applicatif trop puissant, Redis sans authentification utilisé par un Pod malveillant.

**Protection** — Services privés, NetworkPolicies limitées au backend, rôle applicatif sans privilège (à faire), aucun Pod non fiable dans le namespace.

**Mise en œuvre** — [13.2](#section-13-2), [13.7](#section-13-7), [11.6](#section-11-6).

**Vérification** — Tests de [11.6](#section-11-6) ; `"${K[@]}" get svc` ne montre aucun Service de type `NodePort` ou `LoadBalancer`.

> **Attention** — Redis n'a pas de mot de passe. C'est acceptable **uniquement** parce qu'il est privé et joignable par le seul backend, et parce qu'aucun utilisateur non fiable ne peut créer de Pod dans ce namespace.

<a id="section-14-3"></a>

### 14.3 Rotation des secrets

| Secret | Fréquence proposée | Procédure résumée | Effet de bord |
|---|---|---|---|
| `DJANGO_SECRET_KEY` | 12 mois ou incident | Nouveau fichier `backend-preprod.env`, mise à jour du Secret, redémarrage du backend | Peut invalider sessions, liens ou jetons ; vérifier les clés utilisées |
| Mot de passe PostgreSQL | 6 mois ou incident | `ALTER ROLE` dans PostgreSQL, puis mise à jour coordonnée des Secrets `facturadj-postgres` et `facturadj-backend` | Courte indisponibilité du backend |
| Robot Harbor de publication | À expiration | Nouveau secret dans Harbor, mise à jour du fichier ou de la variable GitLab | Aucun |
| Robot Harbor k3d | À expiration | Nouveau `config.json`, mise à jour du Secret `harbor-pull` | Aucun si fait avant expiration |
| Certificat TLS | Avant expiration | [11.5](#section-11-5) | Aucun |
| Accès Argo CD au dépôt GitOps | 12 mois | Nouvelle clé de déploiement, révocation de l'ancienne | Aucun |

Méthode générique de mise à jour d'un Secret, sans le supprimer :

```bash
# DÉPLOIEMENT : mise à jour en place à partir d'un fichier protégé
kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod create secret generic facturadj-backend \
  --from-env-file="$HOME/nexora-secrets/facturadj/backend-preprod.env" \
  --dry-run=client -o yaml | kubectl --context "$KUBE_CONTEXT" apply -f -
# DÉPLOIEMENT : les variables d'environnement ne sont relues qu'au démarrage du Pod
kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod rollout restart deploy/facturadj-backend
```

> **Note** — `rollout restart` ajoute une annotation au modèle de Pod : Argo CD affichera `OutOfSync` sur ce Deployment. Une synchronisation ultérieure retirera l'annotation et peut provoquer un autre redémarrage. Avec `Recreate` et un seul réplica, anticiper une nouvelle interruption.


<a id="section-14-3-1"></a>

#### 14.3.1 Rotation PostgreSQL : trois états à coordonner

Le mot de passe existe à trois endroits : le rôle PostgreSQL réellement enregistré, le Secret d'initialisation `facturadj-postgres` et `DATABASE_URL` dans le Secret applicatif. Changer un seul de ces éléments crée une incohérence.

1. Préparer les nouveaux fichiers protégés et une fenêtre de maintenance.
2. Vérifier un accès d'administration permettant de réparer une erreur de configuration.
3. Changer le mot de passe du rôle côté PostgreSQL depuis une session protégée, par exemple avec la commande interactive `\password facturadj` de `psql` ; ne pas saisir la valeur en argument shell.
4. Mettre à jour les deux fichiers de référence et les deux Secrets en place.
5. Redémarrer le backend et vérifier une nouvelle connexion authentifiée, puis le parcours utilisateur.
6. Sauvegarder la nouvelle version des secrets et clore l'intervention.

`POSTGRES_PASSWORD` sert à l'initialisation de l'image officielle ; modifier cette variable ne change pas le mot de passe d'une base déjà initialisée. [Image PostgreSQL officielle](https://hub.docker.com/_/postgres).

**Arrêt :** l'accès d'administration n'est pas confirmé ou l'ancien et le nouveau mot de passe ne peuvent pas être gérés de façon coordonnée. Ne pas redémarrer PostgreSQL en pensant forcer une réinitialisation du rôle.

<a id="section-14-3-2"></a>

#### 14.3.2 Rotation des autres secrets

- **Django/JWT :** vérifier quelles signatures utilisent `DJANGO_SECRET_KEY` et l'éventuelle clé JWT dédiée. Une rotation peut invalider des sessions, liens ou jetons ; tester le comportement réel et prévoir la reconnexion.
- **Harbor pull :** tester un nouveau téléchargement d'image ; un Pod déjà démarré ne prouve pas que le nouveau robot fonctionne.
- **Argo CD/Git :** vérifier une lecture du dépôt après remplacement de la clé, puis révoquer l'ancienne.
- **TLS :** vérifier le certificat réellement présenté par la façade ; la mise à jour du Secret seule ne prouve pas son chargement.

Le champ `data` d'un Secret utilise base64 ; le chiffrement au repos, les droits RBAC et la protection des sauvegardes sont des mécanismes distincts. [Kubernetes : Secrets](https://kubernetes.io/docs/concepts/configuration/secret/).

<a id="section-14-4"></a>

### 14.4 Audit et journalisation

| Quoi | PREPROD aujourd'hui | Cible PROD | Rétention cible |
|---|---|---|---|
| Accès API | Journaux Gunicorn sur la sortie standard (`kubectl logs`) | Loki | 30 j en ligne, 1 an en archive |
| Connexions refusées | Journaux applicatifs | Loki et alertes | Idem |
| Accès à la base | Non configuré | `log_connections` | 30 j |
| Actions sur le cluster | Non configuré | Journal d'audit Kubernetes | 30 j |
| Publications d'images | Journal d'audit Harbor | Idem | Selon Harbor |
| Modifications d'infrastructure | Historique Git et MR | Idem | Illimitée |
| Déploiements | `argocd app history` | Idem | 10 révisions par Application |

La traçabilité des accès contribue à l'analyse des incidents de facturation. La durée d'un an citée par l'étude est une proposition technique, à confronter aux besoins métier et aux règles applicables.
<a id="mise-en-pratique--chapitre-14"></a>

### Mise en pratique — chapitre 14

**Faire tourner un mot de passe PostgreSQL.** Modifier POSTGRES_PASSWORD dans Kubernetes ne modifie pas le rôle d'une base déjà initialisée. Il faut coordonner le changement côté PostgreSQL, les fichiers protégés et DATABASE_URL, puis les connexions applicatives. **Contrôle :** tester une nouvelle connexion authentifiée ; pg_isready seul n'est pas une preuve de validité du nouveau mot de passe.

<a id="synthese-du-chapitre-14"></a>

#### Synthèse du chapitre 14

**À retenir**

- Chaque fiche suit le même raisonnement : **risque → protection → mise en œuvre → vérification**. La vérification est la partie qui compte : un mécanisme non vérifié est une intention, pas une protection.
- Le moindre privilège s'applique partout : utilisateur `10001`, système de fichiers en lecture seule, aucune capability, aucun jeton Kubernetes monté, robots Harbor séparés, accès Git en lecture seule pour Argo CD.
- Aucun secret dans Git, dans une image, dans une URL, dans les arguments d'une commande ni dans un journal. Les fichiers de secrets vivent hors dépôt, en mode `600`.
- Une variable d'environnement n'est relue **qu'au démarrage du Pod** : mettre à jour un Secret ne suffit pas, il faut redémarrer.
- Deux manques connus et assumés : la signature des images n'est pas implémentée, et Redis tourne sans mot de passe (risque encadré par les NetworkPolicies).

**Les pièges classiques**

| Le piège | Pourquoi on tombe dedans | Le bon réflexe |
|---|---|---|
| Mettre à jour un Secret et croire l'application à jour | La commande a réussi | Les variables d'environnement ne sont relues qu'au démarrage du Pod ([14.3](#section-14-3)) |
| Afficher un Secret « juste pour vérifier » | On veut être sûr de sa valeur | Lister les **noms** suffit. Une valeur affichée se retrouve dans l'historique du shell et parfois dans un enregistrement de session |
| Considérer la sécurité comme acquise parce que les manifests la décrivent | Les fichiers sont exhaustifs | Chaque fiche donne une commande de vérification. Les exécuter, et consigner les résultats |
| Croire que la lecture seule empêche tout | Le conteneur refuse d'écrire | Elle ne protège ni contre une injection SQL, ni contre une fuite de secret, ni contre un compte compromis. D'où les autres couches |

**Vérifiez votre compréhension**

1. Vous venez de changer le mot de passe de la base dans le Secret. L'application l'utilise-t-elle déjà ? *(→ [14.3](#section-14-3))*
2. Quelle commande vérifie qu'aucun jeton Kubernetes n'est monté dans un Pod, et quel résultat attendez-vous ? *(→ [14.2](#section-14-2))*
3. Citez deux protections encore absentes aujourd'hui, et ce qui les compense. *(→ [14.2](#section-14-2), [Annexe F](#annexe-f))*

> **Réponses** — **1.** Non : les variables d'environnement sont lues au démarrage du Pod. Il faut redémarrer pour que la nouvelle valeur soit prise en compte. **2.** Une lecture du chemin du jeton de compte de service dans le conteneur ; le résultat attendu est « No such file or directory ». **3.** Parmi : la signature des images (compensée par le contrôle du label `revision` et le déploiement par digest), le mot de passe Redis (compensé par les NetworkPolicies et l'absence d'exposition), le rôle PostgreSQL non privilégié (non compensé : c'est un risque ouvert), le coffre-fort de secrets (compensé par des fichiers hors dépôt en mode `600`).

**Où aller ensuite** — Le [chapitre 15](#chapitre-15) sépare cinq notions que l'on confond presque toujours.

<a id="chapitre-15"></a>

## 15. Haute disponibilité et résilience

> **En une phrase** — Disponibilité, redondance et reprise couvrent des pannes différentes ; la PREPROD doit être évaluée avec ses limites réelles.

**Ce que vous saurez faire à la fin de ce chapitre**

1. Distinguer les cinq notions et dire, pour chacune, ce qu'elle ne protège pas.
2. Décrire sans complaisance l'état réel de la PREPROD et ce qu'elle apporte malgré tout.
3. Lire la matrice des pannes et savoir quelle action vous incombe pour chaque ligne.
4. Dire ce qu'une production devrait réellement ajouter, et ce qui serait du luxe.
5. Exécuter un test de panne et comparer le résultat à l'attendu.

**Prérequis** — [chapitres 9](#chapitre-09) et [13](#chapitre-13) · **Lecture** — 10 min · **Nature** — architecture et exploitation

<a id="section-15-1"></a>

### 15.1 Cinq notions différentes

Ces cinq notions sont souvent confondues. Elles répondent à des questions différentes et protègent contre des risques différents.

| Notion | Question posée | Protège contre | Ne protège **pas** contre | Mesure | Analogie |
|---|---|---|---|---|---|
| **Haute disponibilité** | Le service continue-t-il pendant une panne ? | Perte d'un Pod, d'un nœud | Suppression de données, bogue, erreur humaine | Disponibilité (%) | Un avion bimoteur qui vole avec un moteur |
| **Résilience** | Le système encaisse-t-il et se rétablit-il seul ? | Pannes partielles, lenteurs, redémarrages | Catastrophe, perte de données | Temps de rétablissement | Un roseau qui plie puis se redresse |
| **Sauvegarde** | Ai-je une copie exploitable des données ? | Perte, corruption, suppression, rançongiciel | L'interruption de service elle-même | RPO | La photocopie des registres rangée au coffre |
| **PRA** | Comment reconstruire tout le service ailleurs ? | Perte du serveur, du site, du fournisseur | Rien, s'il n'a jamais été testé | RTO | Le plan d'évacuation, avec exercices |
| **Rollback** | Comment revenir à la version précédente ? | Release défectueuse | Données modifiées par une migration | Durée du retour | La touche « Annuler » |

```text
                 Incident
                    │
     ┌──────────────┼───────────────┐
     ▼              ▼               ▼
  Panne          Mauvaise        Données
  technique      release         perdues
     │              │               │
     ▼              ▼               ▼
  HA et          Rollback        Sauvegarde
  résilience                     et PRA
```

> **À retenir** — La réplication d'une base réplique fidèlement… une suppression accidentelle. La haute disponibilité ne remplace jamais la sauvegarde.

<a id="section-15-2"></a>

### 15.2 L'état réel de la PREPROD : pas de haute disponibilité

Il faut le dire clairement : la PREPROD **n'est pas hautement disponible**, et c'est un choix acceptable pour un environnement de recette.

| Élément | Situation | Conséquence |
|---|---|---|
| Serveur | Un seul VPS | Sa perte arrête tout |
| Nœuds | Conteneurs k3d sur ce même VPS | Pas de redondance matérielle |
| Applications | 1 réplica, stratégie `Recreate` | Courte coupure à chaque mise à jour et à chaque redémarrage |
| PostgreSQL | 1 instance, volume local | Pas de bascule ; restauration depuis `pg_dump` |
| Redis | 1 instance, sans persistance | Perte des compteurs de quota au redémarrage (sans gravité) |
| Sauvegardes | Manuelles | RPO égal à l'âge de la dernière sauvegarde |

Ce que la PREPROD apporte malgré tout : redémarrage automatique des conteneurs défaillants, retrait du trafic des Pods non prêts, isolation réseau, et surtout **reconstruction reproductible** à partir de Git, de Harbor et des sauvegardes.

<a id="section-15-3"></a>

### 15.3 Les mécanismes de résilience actifs

| Mécanisme | Effet |
|---|---|
| Sonde de vivacité | Un processus bloqué est redémarré automatiquement |
| Sonde d'aptitude | Un Pod qui ne peut pas servir est retiré du Service sans être tué |
| Sonde de démarrage | Un démarrage lent n'est pas confondu avec un blocage |
| Délais courts (`connect_timeout=3`, sockets Redis 2 s, Gunicorn 60 s) | Une dépendance lente ne bloque pas indéfiniment les workers |
| Refus de démarrer si la configuration est invalide | Une erreur de configuration est visible immédiatement (fail fast) |
| Requests et limits | Un conteneur gourmand ne prive pas les autres |
| Politique de redémarrage des conteneurs | Un crash est suivi d'un redémarrage avec délai croissant |

<a id="section-15-4"></a>

### 15.4 Matrice des pannes en PREPROD

| Panne | Ce que voit l'utilisateur | Rétablissement | Action de l'exploitant |
|---|---|---|---|
| Crash du backend | `503` quelques secondes | Redémarrage automatique | Lire `logs --previous` si répété |
| Crash du frontend | `503` quelques secondes | Redémarrage automatique | Idem |
| Redis indisponible | `503` : les deux sondes d'aptitude échouent | Redémarrage automatique de Redis | Vérifier le Pod Redis |
| PostgreSQL indisponible | `503` | Redémarrage si le processus s'arrête | Vérifier journaux, disque, volume ([20.3.10](#section-20-3-10)) |
| Disque du VPS plein | Erreurs puis arrêt de PostgreSQL | Aucun automatique | Libérer de l'espace, vérifier la base |
| Harbor indisponible | Rien tant que les Pods tournent | — | Un Pod recréé sur un nœud sans l'image en cache échouera en `ImagePullBackOff` |
| GitLab indisponible | Rien | — | Aucun déploiement possible |
| Argo CD indisponible | Rien : Argo CD n'est pas sur le chemin des requêtes | — | Aucun déploiement possible |
| Certificat expiré | Le navigateur bloque l'accès | Aucun automatique | Renouveler ([11.5](#section-11-5)) |
| Release défectueuse | Erreurs fonctionnelles ou `503` | — | [Rollback](#chapitre-18) |
| Suppression de données | Données manquantes | — | [Restauration](#chapitre-19) |
| Perte du VPS | Service arrêté | — | [PRA](#section-19-7) |

> **Incohérence corrigée** — L'étude d'août indiquait qu'en cas de perte de Redis « l'application sert sans cache » grâce à `IGNORE_EXCEPTIONS`. Ce n'est **pas** le cas dans la cible active : `container_settings.py` utilise le cache Redis natif de Django sans cette option, et la sonde `/readyz/` teste Redis. Une panne de Redis rend donc le service indisponible (`503`) jusqu'à son retour.

<a id="section-15-5"></a>

### 15.5 Cible PROD : ce qui est réellement nécessaire

> **Cible PROD** — Synthèse de l'étude d'août, adaptée à Kubernetes standard (`kubectl` au lieu de `oc`). Principe retenu : **protéger contre la perte d'un Pod et d'un nœud, pas contre la perte d'un centre de données** ; ce dernier cas relève du PRA.

| Dispositif | Nécessaire ? | Motif |
|---|---|---|
| 3 réplicas frontend et backend | Oui | Prévoir plusieurs réplicas et valider le comportement de mise à jour sous charge |
| PodDisruptionBudget | Oui | Sans lui, la vidange d'un nœud peut emporter tous les Pods |
| Répartition sur les nœuds (topology spread, anti-affinité) | Oui, en `ScheduleAnyway` | En `DoNotSchedule` sur 2 nœuds, un Pod resterait en `Pending` |
| Autoscaling horizontal (HPA) | Oui | Absorbe les pics de fin de mois (facturation) |
| RollingUpdate `maxUnavailable: 0` | Oui | Zéro interruption pendant une livraison |
| Réplication PostgreSQL | Oui | Une base unique est un point de défaillance unique |
| Réplication synchrone | Si RPO nul exigé | Environ 15 % de latence en écriture |
| Stockage répliqué (Ceph) | Non | Coûteux ; l'archivage WAL vers S3 protège déjà les données |
| Multi-régions, multi-clusters actif/actif | Non | Complexité et coût sans commune mesure avec le besoin |
| Service mesh | Non | Deux services : les NetworkPolicies suffisent |

**Mise à jour sans interruption :**

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate: {maxSurge: 1, maxUnavailable: 0}   # un nouveau Pod prêt AVANT de retirer un ancien
template:
  spec:
    terminationGracePeriodSeconds: 45                # > graceful-timeout de Gunicorn (30 s)
    containers:
    - lifecycle:
        preStop:
          exec: {command: ["sleep", "5"]}            # laisse le temps au routeur de retirer le Pod
```

Sans le `preStop`, un Pod peut encore recevoir du trafic pendant les millisecondes où son retrait n'est pas propagé : d'où des `502` à chaque livraison.

**Répartition, protection et autoscaling :**

```yaml
topologySpreadConstraints:
  - maxSkew: 1
    topologyKey: kubernetes.io/hostname
    whenUnsatisfiable: ScheduleAnyway     # mieux vaut un Pod mal placé qu'un Pod absent
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: facturadj-backend
spec:
  minAvailable: 2                         # jamais moins de 2 Pods pendant une vidange volontaire
  selector:
    matchLabels: {app: facturadj-backend}
---
# HPA : 3 à 8 réplicas, CPU 70 %, mémoire 80 %
# montée : fenêtre 30 s, +2 Pods par minute ; descente : fenêtre 300 s, -1 Pod toutes les 2 minutes
```

`minReplicas: 3` et non 2 : avec `minAvailable: 2`, deux réplicas bloqueraient toute vidange de nœud. La fenêtre de descente longue évite le yo-yo des Pods sur une charge en dents de scie. Le HPA sur le CPU ne voit pas la saturation d'entrées-sorties : si les exports deviennent le goulot, passer à une métrique personnalisée.

**Ce qui casse, et ce qui l'absorbe en production :**

| Panne | Sans dispositif | Avec le dispositif |
|---|---|---|
| Un Pod backend meurt | Un tiers des requêtes en erreur | Retiré par la sonde d'aptitude, recréé : invisible |
| Un nœud tombe | Perte de ses Pods | Les autres nœuds ont déjà des réplicas |
| Livraison défectueuse | Coupure | Les nouveaux Pods ne reçoivent du trafic qu'une fois prêts |
| Base primaire perdue | Arrêt | Bascule automatique vers le réplica (~30 s) |
| Pic de charge | Latence, délais dépassés | HPA de 3 à 8 Pods |
| Perte du cluster entier | Arrêt total | Restauration : RTO 2 à 4 h, RPO ~5 min |

<a id="section-15-6"></a>

### 15.6 Ce qui n'est pas protégé, même en production

1. **La perte de la région du fournisseur** : traitée par restauration hors site, pas par redondance permanente.
2. **La suppression logique de données** (un utilisateur supprime 200 factures) : la réplication la reproduit ; seule la restauration à un instant donné la rattrape. C'est le cas le plus fréquent en pratique.
3. **La compromission d'un compte administrateur** : traitée par le RBAC, l'audit et l'authentification forte, pas par la haute disponibilité.
4. **Un bogue applicatif qui corrompt des données** : seuls les tests et la restauration protègent.

<a id="section-15-7"></a>

### 15.7 Tests de panne

Un mécanisme jamais testé n'est pas une garantie. Tests adaptés à la PREPROD, avec le résultat **attendu** en l'état actuel (sans haute disponibilité) :

```bash
K=(kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod)
URL="https://preprod.<domaine>/login"

# Mesure en continu dans un second terminal
while true; do curl -s -o /dev/null -w '%{http_code}\n' "$URL"; sleep 0.5; done

# 1. DÉPLOIEMENT : perte du Pod backend. Attendu : quelques 503, puis retour à 200
"${K[@]}" delete pod -l app=facturadj-backend --wait=false

# 2. DÉPLOIEMENT : perte de Redis. Attendu : 503 tant que Redis est absent
"${K[@]}" scale deploy/facturadj-redis --replicas=0
"${K[@]}" scale deploy/facturadj-redis --replicas=1
#    Argo CD signale l'écart pendant le test ; vérifier ensuite que l'application est Synced

# 3. DÉPLOIEMENT : redémarrage de PostgreSQL. Attendu : 503 puis retour ; aucune donnée perdue
"${K[@]}" delete pod facturadj-postgres-0 --wait=false
```

> **Cible PROD** — Tests trimestriels en préproduction et bascule de base annuelle en production, en fenêtre planifiée : perte d'un Pod (attendu : uniquement des `200`), vidange de nœud (`kubectl cordon` puis `kubectl drain --ignore-daemonsets --delete-emptydir-data`, le PDB doit être respecté), bascule de base (moins de 60 s d'erreurs), montée en charge (le HPA monte à 5 ou 6 Pods, p95 sous 1,5 s), perte de Redis.
<a id="mise-en-pratique--chapitre-15"></a>

### Mise en pratique — chapitre 15

**Mesurer la perte d'un hôte.** Trois Pods placés dans un même VPS partagent la même panne d'hébergement. **Exercice :** construire la matrice Pod, nœud, disque et site ; indiquer pour chaque ligne si la réponse est redémarrage, bascule ou restauration. Un RTO doit correspondre au scénario mesuré.

<a id="synthese-du-chapitre-15"></a>

#### Synthèse du chapitre 15

**À retenir**

- La réplication d'une base réplique fidèlement… une suppression accidentelle. **La haute disponibilité ne remplace jamais la sauvegarde.**
- La PREPROD **n'est pas hautement disponible** et n'a pas vocation à l'être : un VPS, un réplica, une instance PostgreSQL, des sauvegardes manuelles.
- Ce qu'elle apporte quand même : redémarrage automatique, retrait du trafic des Pods non prêts, isolation réseau, et surtout **reconstruction reproductible** depuis Git, Harbor et les sauvegardes.
- Correction importante par rapport à l'étude d'août : une panne de Redis rend le service **indisponible** (`503`), car `/readyz/` teste Redis et le cache n'est pas configuré en mode tolérant.
- En production, le cas le plus fréquent n'est pas la panne matérielle mais la **suppression logique de données** : seule une restauration à un instant donné la rattrape.

**Les pièges classiques**

| Le piège | Pourquoi on tombe dedans | Le bon réflexe |
|---|---|---|
| Annoncer la PREPROD comme « résiliente » | Kubernetes et les sondes donnent cette impression | Elle redémarre ce qui tombe, mais ne survit pas à la perte du VPS. Le dire explicitement aux utilisateurs de recette |
| Croire que Redis est optionnel | C'est « juste un cache » | Ici, `/readyz/` en dépend : sans Redis, l'application répond `503` |
| Dimensionner une production à 2 réplicas | Deux semble suffire pour une mise à jour sans coupure | Avec `minAvailable: 2` dans le PDB, deux réplicas bloqueraient toute vidange de nœud. D'où `minReplicas: 3` |
| Considérer un mécanisme de résilience comme acquis | Il est décrit dans les manifests | Un mécanisme jamais testé n'est pas une garantie. Les tests de [15.7](#section-15-7) prennent quelques minutes |

**Vérifiez votre compréhension**

1. Quelle notion protège contre une suppression accidentelle de données, et laquelle n'y peut rien ? *(→ [15.1](#section-15-1))*
2. Que voit un utilisateur si le Pod Redis disparaît ? *(→ [15.4](#section-15-4))*
3. Pourquoi trois réplicas plutôt que deux dans la cible de production ? *(→ [15.5](#section-15-5))*

> **Réponses** — **1.** La sauvegarde (et, en production, la restauration à un instant donné). La haute disponibilité n'y peut rien : elle réplique la suppression. **2.** Des erreurs `503` : les deux sondes d'aptitude échouent tant que Redis est absent. **3.** Parce qu'un PodDisruptionBudget exigeant deux Pods disponibles bloquerait toute vidange de nœud si l'on n'en a que deux.

**Où aller ensuite** — Le [chapitre 16](#chapitre-16) explique comment voir ce qui se passe, avec les moyens réellement disponibles aujourd'hui.

<a id="chapitre-16"></a>

## 16. Observabilité

> **En une phrase** — Les sondes montrent une partie de l'état du système ; métriques, journaux et tests métier complètent le diagnostic.

**Ce que vous saurez faire à la fin de ce chapitre**

1. Distinguer surveillance, observabilité et alerte.
2. Expliquer les trois sondes Kubernetes et la règle qui les sépare.
3. Obtenir, sans pile de supervision, l'état, les événements, les journaux et la consommation.
4. Mettre en place la supervision minimale recommandée, à coût nul ou presque.
5. Décrire la cible : métriques, journaux structurés, sept alertes et une sonde externe.

**Prérequis** — [chapitres 5](#chapitre-05) et [9](#chapitre-09) · **Lecture** — 6 min · **Nature** — exploitation

<a id="section-16-1"></a>

### 16.1 Surveiller, observer, alerter

**L'observabilité** est la capacité à comprendre l'état interne d'un système à partir de ce qu'il émet.

> **Analogie — le tableau de bord d'une voiture** — Les **métriques** sont les jauges (vitesse, température) ; les **journaux** sont le carnet de bord détaillé ; les **alertes** sont les voyants qui s'allument ; les **sondes de santé** sont le contrôle automatique au démarrage ; la **supervision externe** est le dépanneur qui remarque que la voiture n'est plus sur la route.

| Signal | Question | Exemple FacturaDJ |
|---|---|---|
| **Métriques** | Combien ? À quelle vitesse ? | Latence p95, taux de 5xx, CPU, mémoire |
| **Journaux (logs)** | Que s'est-il passé exactement ? | Ligne d'accès Gunicorn, trace d'exception |
| **Traces** | Où le temps est-il passé dans la chaîne ? | Astro → Django → PostgreSQL (non prévu au lancement) |
| **Événements Kubernetes** | Que fait le cluster ? | `Pulled`, `Killing`, `BackOff`, `FailedScheduling` |
| **Alertes** | Faut-il intervenir maintenant ? | Aucune facture créée depuis 6 h en journée ouvrée |

<a id="section-16-2"></a>

### 16.2 Health checks et sondes Kubernetes

Kubernetes interroge chaque conteneur par trois sondes aux rôles distincts :

| Sonde | Question | Adresse FacturaDJ | Réglage PREPROD | Effet d'un échec |
|---|---|---|---|---|
| **startupProbe** | A-t-il fini de démarrer ? | `/healthz` | Toutes les 10 s, jusqu'à 30 échecs (5 min) | Redémarrage si le délai est dépassé ; les autres sondes attendent |
| **livenessProbe** | Le processus est-il vivant ? | `/healthz` | Toutes les 10 s, 3 échecs, délai 4 s | **Redémarrage** du conteneur |
| **readinessProbe** | Peut-il recevoir du trafic ? | `/readyz` | Toutes les 10 s, 3 échecs, délai 4 s | **Retrait du Service**, sans redémarrage |

```text
Démarrage du conteneur
        │
        ▼
startupProbe /healthz ── plus de 30 échecs ──► conteneur redémarré
        │ réussite
        ▼
livenessProbe /healthz  (toutes les 10 s) ── 3 échecs ──► conteneur redémarré
readinessProbe /readyz  (toutes les 10 s) ── 3 échecs ──► retiré du Service
```

Le contrat des adresses est décrit en [5.8](#section-5-8). La règle d'or : **la base de données appartient à la sonde d'aptitude, jamais à la sonde de vivacité.**

> **Note** — L'instruction `HEALTHCHECK` des Dockerfiles est utilisée par Docker et Docker Compose (smoke), mais **ignorée par Kubernetes**, qui n'utilise que ses propres sondes.

PostgreSQL et Redis ont leurs propres sondes : `pg_isready` pour l'aptitude de PostgreSQL, `redis-cli ping` pour l'aptitude et la vivacité de Redis.

<a id="section-16-3"></a>

### 16.3 Ce qui est disponible en PREPROD

La PREPROD ne dispose pas encore de pile de supervision. Les informations s'obtiennent avec les outils du cluster :

```bash
K=(kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod)

# LECTURE : état, aptitude et redémarrages
"${K[@]}" get pods
# LECTURE : événements récents (échecs de sonde, téléchargements, OOMKilled)
"${K[@]}" get events --sort-by=.lastTimestamp | tail -30
# LECTURE : journaux applicatifs (accès Gunicorn, erreurs)
"${K[@]}" logs deploy/facturadj-backend --tail=200
"${K[@]}" logs deploy/facturadj-frontend --tail=200
# LECTURE : consommation CPU et mémoire (metrics-server de k3s)
"${K[@]}" top pods
# LECTURE : journaux de Traefik (erreurs de routage, certificats)
kubectl --context "$KUBE_CONTEXT" -n kube-system logs deploy/traefik --tail=100
# LECTURE : état GitOps
argocd app get facturadj-preprod
# LECTURE depuis l'extérieur : sondes publiques du frontend
curl --fail "https://preprod.<domaine>/healthz"
curl --fail "https://preprod.<domaine>/readyz"
```

Supervision minimale recommandée dès maintenant, à faible coût :

- une **sonde externe** (par exemple UptimeRobot, offre gratuite) sur `/login` et `/readyz` du frontend ;
- une **alerte d'expiration du certificat** à J-30 et J-14 ;
- un contrôle régulier de l'**espace disque** du VPS et de l'âge de la **dernière sauvegarde**.

> **Attention** — Les journaux applicatifs peuvent contenir des données personnelles ou comptables. Les lire sur place ; ne pas les coller dans un ticket ou une messagerie sans les avoir examinés.

<a id="section-16-4"></a>

### 16.4 Cible PROD : métriques, journaux et alertes

> **Cible PROD** — Synthèse de l'étude d'août. L'étude s'appuyait sur le Prometheus intégré d'OpenShift ; sur un Kubernetes standard, l'équivalent est la pile *kube-prometheus-stack* (Prometheus, Alertmanager, Grafana).

**Métriques.** Le paquet `django-prometheus` (correctif §5 de `infra/patches/README.md`, non appliqué) exposerait la latence par vue, le nombre de requêtes SQL et les codes de réponse. Tableaux de bord Grafana proposés : 15661 (Kubernetes), 9628 (PostgreSQL), 17658 (Django), puis un tableau **métier** : factures créées par jour, montant encaissé, délai moyen de règlement.

**Journaux.** Loki plutôt qu'ELK/OpenSearch : beaucoup moins de ressources, indexation par étiquettes. La collecte se fait par Promtail ou par son successeur Grafana Alloy. Rien à changer dans l'application, qui écrit déjà sur la sortie standard. Amélioration recommandée : des journaux structurés en JSON.

```python
# settings.py — LOGGING, formateur JSON (paquet python-json-logger)
"formatters": {
    "json": {
        "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
        "format": "%(asctime)s %(levelname)s %(name)s %(message)s %(pathname)s %(lineno)d",
    },
},
"handlers": {"console": {"class": "logging.StreamHandler", "formatter": "json"}},
```

**Sept alertes, pas trente :**

| Alerte | Gravité |
|---|---|
| Frontend ou backend sous 2 Pods disponibles | Critique |
| Plus de 2 % de réponses 5xx | Critique |
| Latence p95 au-dessus de 1,5 s | Avertissement |
| Réplica PostgreSQL en retard de plus de 30 s | Avertissement |
| Aucune sauvegarde réussie depuis 48 h | Critique |
| Volume rempli à plus de 85 % | Avertissement |
| **Aucune facture créée depuis 6 h en journée ouvrée** | Avertissement |

La dernière est la plus précieuse : elle détecte une panne **fonctionnelle** qu'aucune métrique technique ne voit (les Pods sont sains, tout répond `200`, mais plus personne ne peut facturer).

**Routage des alertes** (Alertmanager, extrait) :

```yaml
route:
  group_by: [alertname, namespace]
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 12h
  receiver: courriel-exploitation
  routes:
    - matchers: [severity="critical"]
      receiver: urgence
      repeat_interval: 1h
receivers:
  - name: courriel-exploitation
    email_configs:
      - to: <adresse d'exploitation relevée>
        smarthost: <serveur SMTP>:587
        auth_password: <depuis le coffre-fort, jamais en clair>
  - name: urgence
    email_configs: [{to: <adresse d'astreinte>}]
inhibit_rules:
  # si le frontend entier est indisponible, ne pas alerter sur chaque symptôme secondaire
  - source_matchers: [alertname="FacturaDJFrontendIndisponible"]
    target_matchers: [severity="warning"]
    equal: [namespace]
```

**Supervision externe.** Prometheus tourne **dans** le cluster : si le cluster tombe, il ne prévient personne. Une sonde externe reste indispensable (UptimeRobot au lancement, Better Stack pour l'astreinte, ou les contrôles de santé Cloudflare).

**Suivi des erreurs applicatives.** Sentry est recommandé : une trace d'exception avec son contexte vaut mieux qu'une fouille dans les journaux. Régler `send_default_pii=False` : aucune donnée client dans les rapports. Le traçage distribué (OpenTelemetry) ne devient utile qu'à partir de cinq ou six services en cascade.

**Les signaux prioritaires :**

| Signal | Métrique | Seuil |
|---|---|---|
| Latence | p95 des requêtes | < 1,5 s |
| Trafic | Requêtes par seconde | Référence de dimensionnement |
| Erreurs | Taux de 5xx | < 1 % |
| Saturation | CPU et mémoire par rapport aux limites | < 80 % |
| **Métier** | Factures créées par heure | Selon l'activité habituelle |
<a id="mise-en-pratique--chapitre-16"></a>

### Mise en pratique — chapitre 16

**Passer d'une sonde à une preuve utilisateur.** Les quatre sondes sont vertes, mais un rôle commercial ne peut plus consulter ses commandes. La plateforme est joignable ; le service métier est dégradé. **Contrôle :** associer aux sondes un parcours synthétique ou un test de recette, avec des données et un compte réservés à cet usage.

<a id="synthese-du-chapitre-16"></a>

#### Synthèse du chapitre 16

**À retenir**

- La règle d'or des sondes : **la base de données appartient à la sonde d'aptitude, jamais à la sonde de vivacité.** Sinon une base lente fait redémarrer en boucle des conteneurs parfaitement sains.
- `startupProbe` protège un démarrage lent, `livenessProbe` redémarre un processus bloqué, `readinessProbe` retire du trafic sans tuer.
- La PREPROD n'a pas de pile de supervision. `kubectl get`, `describe`, `logs`, `top` et les journaux de Traefik couvrent l'essentiel.
- Trois mesures immédiates et peu coûteuses : une sonde externe, une alerte d'expiration de certificat à J-30 et J-14, un contrôle de l'espace disque et de l'âge de la dernière sauvegarde.
- L'alerte la plus précieuse de la cible n'est pas technique : « aucune facture créée depuis 6 h en journée ouvrée » détecte une panne fonctionnelle que tous les indicateurs verts masquent.

**Les pièges classiques**

| Le piège | Pourquoi on tombe dedans | Le bon réflexe |
|---|---|---|
| Mettre la base dans la sonde de vivacité | Cela paraît plus « complet » | Une base momentanément lente déclencherait des redémarrages en cascade |
| Coller des journaux dans un ticket | On veut de l'aide | Ils peuvent contenir des données personnelles ou comptables : les examiner avant tout partage |
| Installer une pile de supervision dans le cluster et s'estimer couvert | C'est le réflexe standard | Prometheus tourne **dans** le cluster : si le cluster tombe, il ne prévient personne. Une sonde externe reste indispensable |
| Multiplier les alertes | On veut tout voir | Sept alertes lues valent mieux que trente ignorées |

**Vérifiez votre compréhension**

1. Quelle sonde retire un Pod du trafic sans le redémarrer ? *(→ [16.2](#section-16-2))*
2. Pourquoi la base ne doit-elle pas figurer dans la sonde de vivacité ? *(→ [16.2](#section-16-2))*
3. Quelles trois mesures de supervision peut-on mettre en place dès aujourd'hui, sans budget ? *(→ [16.3](#section-16-3))*

> **Réponses** — **1.** La sonde d'aptitude (`readinessProbe`). **2.** Parce qu'une base lente ferait redémarrer des conteneurs sains, aggravant la charge et prolongeant l'incident. **3.** Une sonde externe sur `/login` et `/readyz` du frontend, une alerte d'expiration du certificat à J-30 et J-14, un contrôle régulier de l'espace disque du VPS et de l'âge de la dernière sauvegarde.

**Où aller ensuite** — La Partie VI s'ouvre sur le [chapitre 17](#chapitre-17) : la procédure complète, phase par phase.

<!-- PARTIE: Partie VI — Opérer -->

<a id="chapitre-17"></a>

## 17. Déploiement PREPROD : procédure pas à pas

> **En une phrase** — Une livraison suit des étapes vérifiables, avec un ordre de migration choisi selon l'état de l'environnement.

**Ce que vous saurez faire à la fin de ce chapitre**

1. Vérifier que tous les prérequis sont réunis avant de commencer quoi que ce soit.
2. Dérouler les phases 0 à 10 en comprenant, à chaque bloc, ce que vous modifiez et où.
3. Reconnaître une porte (« **Arrêt** ») et vous y arrêter réellement.
4. Choisir entre le parcours VM DEV et le parcours GitLab, et vous y tenir pour toute la release.
5. Effectuer un premier déploiement (bootstrap) sans confondre ses étapes avec celles d'une release courante.

**Prérequis** — [chapitres 4](#chapitre-04) à [14](#chapitre-14) · **Lecture** — 40 min, puis une demi-journée d'exécution accompagnée · **Nature** — runbook

> **Attention** — Ce chapitre fournit des commandes ; aucune n'a été exécutée pour vous. **Lisez-le entièrement une première fois sans rien lancer**, puis relisez-le en exécutant, bloc par bloc. Chaque bloc se lit, s'exécute, se contrôle, et seulement ensuite on décide du suivant.

<a id="section-17-1"></a>

### 17.1 Vue d'ensemble

**Ce chapitre fournit des commandes ; aucune n'a été exécutée pour vous.** Exécuter un bloc, contrôler le résultat, puis décider du suivant.

```text
 Phase 0   Copier et vérifier la livraison        Windows ─► VM DEV
 Phase 1   Vérifier Git et les outils             VM DEV
 Phase 2   Vérifier et figer les versions         VM DEV + GitHub (PR)
 Phase 3   Construire les images                  VM DEV (Packer)
 Phase 4   Tester                                 VM DEV (Docker Compose)
 Phase 5   Scanner                                VM DEV (Hadolint, Trivy)
 Phase 6   Publier dans Harbor                    VM DEV ─► Harbor
 Phase 7   Modifier GitOps                        VM DEV ─► GitLab (miroir + GitOps)
 ───────   Bootstrap du cluster (1re fois)        Machine d'administration ─► k3d
 Phase 8   Contrôler Argo CD                      Machine d'administration
 Phase 9   Synchroniser et migrer                 Machine d'administration
 Phase 10  Vérifier l'application                 Machine d'administration + navigateur
```

Chaque étape est décrite selon le même modèle : **OBJECTIF**, **COMMANDE**, **EXPLICATION**, **RÉSULTAT ATTENDU**, **VÉRIFICATION**, **ERREUR POSSIBLE**.

<a id="section-17-2"></a>

### 17.2 Avant de commencer

**Prérequis.**

| Où | Ce qui doit exister | Référence |
|---|---|---|
| VM DEV `odoo` | Clone Git réel, Packer 1.15.3, Docker avec Buildx et Compose, Trivy, Hadolint, Python 3 et PyYAML, accès à Docker Hub et Harbor | [2.5](#section-2-5) |
| Harbor | Projet privé `facturadj`, robots de publication et de lecture, règles d'immutabilité | [Chapitre 7](#chapitre-07) |
| GitHub | Branche `main` protégée, workflows `dev.yml` et `packer.yml` | [Chapitre 6](#chapitre-06) |
| GitLab | Projet miroir applicatif, projet GitOps distinct, protections ; runner si parcours GitLab | [6.5](#section-6-5) |
| VPS `nexora-vps` | Cluster k3d avec Traefik, `local-path`, contrôleur NetworkPolicy, Argo CD | [9.2](#section-9-2) |
| Machine d'administration | Clone GitOps, kubeconfig PREPROD, CLI `argocd` authentifiée | [2.5](#section-2-5) |
| Hors dépôt | Fichiers secrets, certificat TLS, mots de passe des robots | [17.11](#section-17-11) |
| DNS | Nom de la PREPROD pointant vers le VPS | [11.2](#section-11-2) |

**Règles.**

- Tout arrêt signalé (« **Arrêt** ») est une porte : ne pas continuer si le contrôle échoue.
- Un seul parcours de construction par release : VM DEV **ou** pipeline GitLab ([8.8](#section-8-8)).
- Ne jamais ajouter `|| true`, `--force`, `--prune` ou `insecure-registries` pour avancer.
- Ne jamais afficher, coller ou commiter un secret.

> **Note** — La copie locale examinée n'est pas reconnue comme un clone Git exploitable. Aucun SHA source fiable n'y a été établi. Effectuer les opérations de livraison dans un clone applicatif authentifié et vérifié, comme celui prévu sur la VM DEV.

<a id="section-17-3"></a>

### 17.3 Phase 0 — Copier et vérifier la livraison

<a id="etape-01--verifier-le-clone-dev-avant-la-copie"></a>

#### Étape 0.1 — Vérifier le clone DEV avant la copie

**OBJECTIF** — S'assurer que le chemin cible est un vrai clone et repérer les modifications locales qu'une copie écraserait.

**COMMANDE**

```powershell
Set-Location -LiteralPath 'C:\Users\douks\Documents\Formation\FACTURADJ\facturaDJ'
# LECTURE DISTANTE : vérifier le clone et les changements DEV avant copie
ssh odoo 'cd ~/FACTURADJ/facturaDJ && pwd && git status --short'
```

**EXPLICATION** — `ssh odoo '...'` exécute la commande sur la VM DEV sans ouvrir de session interactive. `git status --short` liste les fichiers modifiés ou non suivis.

**RÉSULTAT ATTENDU** — Le chemin `/home/<utilisateur>/FACTURADJ/facturaDJ`, puis une liste vide ou uniquement des modifications connues.

**VÉRIFICATION** — Aucune modification inattendue. Sinon, les sauvegarder ou les commiter avant de poursuivre.

**ERREUR POSSIBLE** — `No such file or directory` ou `not a git repository` : le chemin du clone est différent. Adapter le chemin dans toutes les commandes ; ne jamais inventer de remote ni de SHA.

<a id="etape-02--copier-les-fichiers-depuis-windows"></a>

#### Étape 0.2 — Copier les fichiers depuis Windows

**OBJECTIF** — Transférer les fichiers de la livraison vers le clone DEV.

**COMMANDE** — La liste exacte et **chaque commande SCP**, création des dossiers parents comprise, figurent dans les documents sources conservés : `infra/docs/00-livraison.md` (livraison cumulée) et `infra/docs/12-livraison-packer-docker.md` (correction Packer Docker seule). Modèle :

```powershell
# MODIFICATION DISTANTE : dossiers parents (extrait)
ssh odoo 'mkdir -p ~/FACTURADJ/facturaDJ/infra/packer/scripts ~/FACTURADJ/facturaDJ/infra/k8s/k3d'
# MODIFICATION DISTANTE : copie fichier par fichier (modèle)
scp "./infra/packer/backend.pkr.hcl" "odoo:~/FACTURADJ/facturaDJ/infra/packer/backend.pkr.hcl"
```

**EXPLICATION** — Une copie ciblée, fichier par fichier, évite d'embarquer par erreur des secrets, un venv, des bases SQLite ou des médias.

**RÉSULTAT ATTENDU** — Chaque `scp` se termine sans erreur.

**VÉRIFICATION** — Étape 0.3.

**ERREUR POSSIBLE** — `scp: dest open ... No such file or directory` : le dossier parent n'existe pas, relancer le `mkdir -p`. Attention : `scp` **écrase** le fichier distant de même nom.

> **Note** — Si la livraison cumulée n'a jamais été copiée, utiliser la liste complète de `00-livraison.md`, pas seulement celle de la correction.

<a id="etape-03--controler-la-copie"></a>

#### Étape 0.3 — Contrôler la copie

**OBJECTIF** — Prouver que les fichiers copiés sont intacts et que la structure est valide.

**COMMANDE**

```powershell
ssh odoo
```

```bash
# LECTURE / VALIDATION
cd ~/FACTURADJ/facturaDJ
git rev-parse --show-toplevel
git status --short
git diff --check
sha256sum -c infra/docs/livraison.sha256
python3 infra/ci/check_static.py
bash -n infra/ci/images.sh
bash -n infra/packer/scripts/build-app-image.sh
```

**EXPLICATION** — `sha256sum -c` recalcule l'empreinte de chaque fichier livré et la compare à la liste. `git diff --check` détecte les espaces parasites. `bash -n` vérifie la syntaxe d'un script sans l'exécuter.

**RÉSULTAT ATTENDU** — Chaque ligne de `sha256sum -c` se termine par `OK` (ou `Réussi` selon la langue du système) ; `check_static.py` affiche `OK : ...` suivi du message du mode préparation ; `bash -n` n'affiche rien.

**VÉRIFICATION** — Aucune ligne `FAILED` ou `ÉCHEC`.

**ERREUR POSSIBLE**

| Message | Cause | Action |
|---|---|---|
| `FAILED` sur un fichier | Copie incomplète ou fichier personnalisé | Recopier ; les empreintes se vérifient **avant** toute personnalisation |
| `bad interpreter: /bin/bash^M` | Retours chariot Windows | Recopier le script en LF ; `.gitattributes` impose LF |
| `ModuleNotFoundError: No module named 'yaml'` | PyYAML absent | `sudo apt-get install python3-yaml` |

**Arrêt : empreintes, chemins et contrôles doivent être corrects.**

<a id="section-17-4"></a>

### 17.4 Phase 1 — Vérifier Git et les outils

<a id="etape-11--verifier-letat-git"></a>

#### Étape 1.1 — Vérifier l'état Git

**OBJECTIF** — Travailler dans le bon dépôt, sur la bonne branche, avec le bon remote.

**COMMANDE**

```bash
# LECTURE
cd ~/FACTURADJ/facturaDJ
git remote -v
git branch --show-current
git status --short
git log --oneline -5
```

**EXPLICATION** — `git remote -v` montre l'URL de `origin` (GitHub), qui ne doit contenir aucun jeton.

**RÉSULTAT ATTENDU** — `origin` pointe vers le dépôt GitHub de FacturaDJ ; la branche et l'historique sont ceux attendus.

**VÉRIFICATION** — Aucune URL de la forme `https://utilisateur:jeton@...`.

**ERREUR POSSIBLE** — Jeton présent dans l'URL : le retirer (`git remote set-url origin <url sans jeton>`) et révoquer ce jeton.

<a id="etape-12--verifier-les-outils"></a>

#### Étape 1.2 — Vérifier les outils

**OBJECTIF** — Confirmer la présence et la version des outils, sans rien installer automatiquement.

**COMMANDE**

```bash
# LECTURE / VALIDATION
cat /etc/os-release
uname -m
packer version
docker version
docker buildx version
docker compose version
trivy --version
hadolint --version
python3 -c 'import yaml; print(yaml.__version__)'
```

**EXPLICATION** — Les images ciblent `linux/amd64` : l'architecture de la VM doit être `x86_64`, sinon la construction passe par une émulation lente.

**RÉSULTAT ATTENDU** — Debian ; `x86_64` ; `Packer v1.15.3` (ou plus récent en 1.x) ; Docker, Buildx et Compose répondent ; Trivy et Hadolint affichent leur version ; PyYAML affiche une version.

**VÉRIFICATION** — Consigner les versions dans le journal de release ([21.6](#section-21-6)).

**ERREUR POSSIBLE** — Outil absent : l'installer **manuellement**, en version approuvée pour la VM. Ne pas mettre à niveau Docker ou Packer « au passage ».

<a id="section-17-5"></a>

### 17.5 Phase 2 — Vérifier et figer les versions

<a id="etape-21--choisir-les-images-de-base-par-digest"></a>

#### Étape 2.1 — Choisir les images de base par digest

**OBJECTIF** — Figer les quatre images tierces : Python, Node, PostgreSQL et Redis.

**COMMANDE**

```bash
cd ~/FACTURADJ/facturaDJ
# LECTURE registry, sans build ni push
docker buildx imagetools inspect python:3.12-slim-bookworm
docker buildx imagetools inspect node:22-bookworm-slim
docker buildx imagetools inspect postgres:17-bookworm
docker buildx imagetools inspect redis:7-bookworm
read -r -p 'Référence Python complète, tag@sha256:... : ' PYTHON_IMAGE
read -r -p 'Référence Node complète, tag@sha256:... : ' NODE_IMAGE
read -r -p 'Référence PostgreSQL complète, tag@sha256:... : ' POSTGRES_IMAGE
read -r -p 'Référence Redis complète, tag@sha256:... : ' REDIS_IMAGE
export PYTHON_IMAGE NODE_IMAGE POSTGRES_IMAGE REDIS_IMAGE
```

**EXPLICATION** — `imagetools inspect` lit le digest de l'index multi-plateforme sans rien télécharger d'autre. `read -r -p` évite toute interprétation des caractères saisis.

**RÉSULTAT ATTENDU** — Quatre références de la forme `python:3.12-slim-bookworm@sha256:<64 hex>`.

**VÉRIFICATION**

```bash
# LECTURE : les formats doivent correspondre, sinon Packer refusera
printf '%s\n' "$PYTHON_IMAGE" "$NODE_IMAGE" "$POSTGRES_IMAGE" "$REDIS_IMAGE" \
  | grep -cE '@sha256:[0-9a-f]{64}$'     # attendu : 4
```

**ERREUR POSSIBLE** — `toomanyrequests` : quota anonyme de Docker Hub atteint ; attendre ou s'authentifier. Conserver les références approuvées : elles seront reportées dans le dépôt GitOps (PostgreSQL et Redis) et dans le journal de release.

<a id="etape-22--generer-le-lock-python"></a>

#### Étape 2.2 — Générer le lock Python

**OBJECTIF** — Produire `backend/requirements.lock` sous Linux, avec Python 3.12 et les empreintes.

**COMMANDE** — Celle de [5.4](#section-5-4).

**EXPLICATION** — Voir [5.4](#section-5-4). Sans ce fichier, la construction, la CI GitHub et le pipeline GitLab échouent volontairement.

**RÉSULTAT ATTENDU** — Un fichier `backend/requirements.lock` où chaque dépendance porte une version exacte et au moins une ligne `--hash=sha256:...`.

**VÉRIFICATION**

```bash
# LECTURE
grep -c -- '--hash=sha256:' backend/requirements.lock
grep -iE '^(django|psycopg|gunicorn|redis)==' backend/requirements.lock
```

**ERREUR POSSIBLE** — Conflit de résolution : corriger les contraintes dans `requirements*.in` par une PR, jamais en éditant le lock à la main.

<a id="etape-23--commiter-sur-une-branche-et-ouvrir-la-pull-request"></a>

#### Étape 2.3 — Commiter sur une branche et ouvrir la Pull Request

**OBJECTIF** — Faire relire et valider par GitHub la livraison et le lock.

**COMMANDE**

```bash
# MODIFICATION LOCALE après revue
git switch -c infra/packer-docker-apps
python3 - <<'PY'
import json, subprocess
from pathlib import Path
inventory = json.loads(Path("infra/docs/livraison.json").read_text())
paths = inventory["created"] + inventory["modified"] + ["backend/requirements.lock"]
subprocess.run(["git", "add", "--", *paths], check=True)
PY
git diff --cached --check
git diff --cached --stat
git commit -m "infra: Golden Images Docker frontend et backend avec Packer"
# MODIFICATION DISTANTE à votre initiative, puis PR GitHub
git push -u origin infra/packer-docker-apps
```

**EXPLICATION** — Le script ajoute **uniquement** les fichiers listés dans l'inventaire de la livraison, plus le lock : rien d'autre n'est commité par accident.

**RÉSULTAT ATTENDU** — Un commit sur la branche, poussé ; une PR ouverte vers `main` ; les workflows `dev.yml` (et `packer.yml`) démarrent.

**VÉRIFICATION** — Tous les contrôles GitHub sont verts ; revue approuvée par un Admin DevOps.

**ERREUR POSSIBLE** — `pathspec did not match` : un fichier de l'inventaire est absent, revenir à l'étape 0.3. Pour une release ordinaire, utiliser une branche de travail classique au lieu de ce script propre à la livraison initiale.

<a id="etape-24--definir-le-commit-approuve"></a>

#### Étape 2.4 — Définir le commit approuvé

**OBJECTIF** — Après fusion, fixer `SOURCE_REV` et `TAG` sur le commit exact de `main`.

**COMMANDE**

```bash
# MODIFICATION LOCALE
git switch main
git pull --ff-only origin main
# LECTURE et variables
test -z "$(git status --porcelain)"
export SOURCE_REV="$(git rev-parse HEAD)"
export TAG="sha-$SOURCE_REV"
echo "$TAG"
```

**EXPLICATION** — `--ff-only` refuse toute fusion locale implicite. `test -z "$(git status --porcelain)"` échoue si l'arbre n'est pas propre.

**RÉSULTAT ATTENDU** — `sha-` suivi de 40 caractères hexadécimaux.

**VÉRIFICATION** — Le SHA affiché est celui du commit de fusion visible sur GitHub.

**ERREUR POSSIBLE** — `Not possible to fast-forward` : la branche locale a divergé ; analyser, ne pas forcer.

<a id="section-17-6"></a>

### 17.6 Phase 3 — Construire les images

<a id="etape-31--valider-packer"></a>

#### Étape 3.1 — Valider Packer

**OBJECTIF** — Vérifier template et variables **sans rien construire**.

**COMMANDE**

```bash
cd ~/FACTURADJ/facturaDJ/infra/packer
# LECTURE / VALIDATION : aucun plugin externe déclaré
packer version
packer init .
packer fmt -check .
packer validate .
packer inspect .
```

**EXPLICATION** — Voir [4.11](#section-4-11).

**RÉSULTAT ATTENDU** — `The configuration is valid.` ; `inspect` montre les cibles `frontend.null.frontend` et `backend.null.backend`.

**VÉRIFICATION** — Aucune autre cible (les anciennes recettes doivent rester inactives).

**ERREUR POSSIBLE**

| Message | Cause | Action |
|---|---|---|
| `SOURCE_REV doit être le SHA Git complet approuvé.` | Variable absente ou abrégée | Refaire l'étape 2.4 dans ce terminal |
| `PYTHON_IMAGE doit fixer Python 3.12 par digest.` | Référence sans digest | Refaire l'étape 2.1 |
| Cibles en double ou inattendues | Ancienne recette réactivée | Vérifier que `fcos-okd`, `bastion-rocky` et `debian` sont entièrement commentés |

**Arrêt : valider les deux cibles avant de construire.**

<a id="etape-32--construire-les-deux-images"></a>

#### Étape 3.2 — Construire les deux images

**OBJECTIF** — Produire les deux images applicatives et leurs archives.

**COMMANDE**

```bash
# MODIFICATION LOCALE uniquement, à votre initiative
cd ~/FACTURADJ/facturaDJ/infra/packer
packer build -parallel-builds=1 .
```

**EXPLICATION** — Packer appelle `build-app-image.sh` pour chaque composant, qui lance `docker buildx build --load`, exporte l'image et écrit ses métadonnées. Aucun login, aucun push. Pour un composant isolé, `packer build -only='frontend.null.frontend' .` ou `-only='backend.null.backend'`, **à la place** du build global.

**RÉSULTAT ATTENDU** — La sortie se termine par `Build 'frontend' finished` et `Build 'backend' finished`, suivis de la liste des artefacts.

**VÉRIFICATION** — Étape 3.3.

**ERREUR POSSIBLE**

| Symptôme | Cause | Action |
|---|---|---|
| Le script s'arrête sans message après `git status` | Arbre Git non propre | Commiter ou annuler les modifications ; ne jamais construire un checkout modifié |
| `test -s backend/requirements.lock` échoue | Lock absent | Étape 2.2 |
| `failed to read dockerfile` | Mauvaise racine | Le script calcule la racine depuis le template : lancer Packer depuis `infra/packer` |
| `unknown command: docker buildx` | Buildx absent | Installer Buildx manuellement, vérifier sa version |
| Erreur de `npm ci` | `package-lock.json` incohérent | Corriger dans une PR |

<a id="etape-33--controler-la-paire-darchives"></a>

#### Étape 3.3 — Contrôler la paire d'archives

**OBJECTIF** — Prouver que les deux exports sont complets et issus du même commit.

**COMMANDE**

```bash
cd ~/FACTURADJ/facturaDJ
# MODIFICATION LOCALE des reçus : vérifie que les exports sont du même commit
bash infra/ci/images.sh bundle
# LECTURE
(cd release && sha256sum -c images.sha256)
cat release/frontend.image.json
cat release/backend.image.json
cat infra/packer/manifest-frontend.json
cat infra/packer/manifest-backend.json
docker image inspect --format '{{.Id}} {{.Config.User}}' "harbor.nexora-djibouti.fr/facturadj/frontend:$TAG"
docker image inspect --format '{{.Id}} {{.Config.User}}' "harbor.nexora-djibouti.fr/facturadj/backend:$TAG"
```

**EXPLICATION** — `bundle` vérifie les empreintes de chaque archive et refuse deux exports de SHA ou de tags différents.

**RÉSULTAT ATTENDU** — `backend.tar: OK` et `frontend.tar: OK` ; les deux `.image.json` affichent le même `source_revision` ; l'utilisateur des deux images est `10001:10001`.

**VÉRIFICATION** — L'identifiant affiché est un identifiant **local**, pas encore un digest Harbor.

**ERREUR POSSIBLE** — `Exports de versions differentes` : une archive provient d'une construction antérieure ; reconstruire les deux composants. Une construction partielle ou échouée ne doit jamais être publiée.

<a id="section-17-7"></a>

### 17.7 Phase 4 — Tester

<a id="etape-41--creer-les-secrets-de-test-jetables"></a>

#### Étape 4.1 — Créer les secrets de test jetables

**OBJECTIF** — Disposer de secrets aléatoires pour le test local, sans toucher aux secrets réels.

**COMMANDE**

```bash
# MODIFICATION LOCALE ; aucun secret dans l'historique
python3 - <<'PY'
import os, secrets
from pathlib import Path
os.umask(0o077)
folder = Path.home() / "nexora-secrets/facturadj-smoke"
folder.mkdir(parents=True, exist_ok=True)
password = secrets.token_hex(32)
with (folder / "db-password").open("x") as f:
    f.write(password)
lines = [
    "DJANGO_SECRET_KEY=" + secrets.token_urlsafe(64),
    "DJANGO_DEBUG=0",
    "DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,backend",
    "DATABASE_URL=postgresql://facturadj:" + password + "@db:5432/facturadj",
    "REDIS_URL=redis://redis:6379/0",
    "SECURE_SSL_REDIRECT=0",
    "PUBLIC_FRONTEND_URL=http://localhost:4321",
]
with (folder / "backend-smoke.env").open("x") as f:
    f.write("\n".join(lines) + "\n")
PY
export SMOKE_ENV_FILE="$HOME/nexora-secrets/facturadj-smoke/backend-smoke.env"
export SMOKE_DB_PASSWORD_FILE="$HOME/nexora-secrets/facturadj-smoke/db-password"
```

**EXPLICATION** — `os.umask(0o077)` crée des fichiers lisibles par vous seul ; `open("x")` refuse d'écraser un fichier existant. Le mot de passe hexadécimal ne nécessite pas d'encodage dans l'URL.

**RÉSULTAT ATTENDU** — Aucune sortie ; deux fichiers créés avec les droits `-rw-------`.

**VÉRIFICATION** — `ls -l ~/nexora-secrets/facturadj-smoke/`

**ERREUR POSSIBLE** — `FileExistsError` : des secrets de smoke existent déjà ; les réutiliser (exporter les deux variables) ou les supprimer volontairement.

<a id="etape-42--inspecter-les-images"></a>

#### Étape 4.2 — Inspecter les images

**OBJECTIF** — Contrôler utilisateur, ports, santé et historique, sans afficher de variables sensibles.

**COMMANDE**

```bash
# LECTURE, sans afficher les variables secrètes
docker images
for component in frontend backend; do
  image="harbor.nexora-djibouti.fr/facturadj/$component:$TAG"
  docker image inspect --format 'user={{.Config.User}} ports={{json .Config.ExposedPorts}} health={{json .Config.Healthcheck}}' "$image"
  docker history --no-trunc "$image"
done
docker compose -f infra/docker/compose.smoke.yaml config --quiet
```

**EXPLICATION** — `config --quiet` valide la composition et la présence des variables sans afficher la configuration développée, qui contiendrait les secrets.

**RÉSULTAT ATTENDU** — `user=10001:10001`, ports `8000/tcp` et `4321/tcp`, un healthcheck défini ; `config --quiet` ne renvoie rien.

**VÉRIFICATION** — L'historique ne contient aucune valeur secrète ([5.11](#section-5-11)).

**ERREUR POSSIBLE** — `required variable POSTGRES_IMAGE is missing a value` : exporter la variable manquante (étape 2.1 ou 4.1).

<a id="etape-43--demarrer-lenvironnement-de-test"></a>

#### Étape 4.3 — Démarrer l'environnement de test

**OBJECTIF** — Lancer base et cache de test, créer le schéma, puis démarrer les deux applications.

**COMMANDE**

```bash
# MODIFICATION LOCALE : base/cache de TEST distincts
docker compose -f infra/docker/compose.smoke.yaml up -d --wait db redis
# MODIFICATION DB de TEST explicite, jamais dans l'entrypoint
docker compose -f infra/docker/compose.smoke.yaml run --rm backend python manage.py migrate --noinput
# MODIFICATION LOCALE : démarrer les deux images
docker compose -f infra/docker/compose.smoke.yaml up -d --wait backend frontend
```

**EXPLICATION** — `--wait` attend l'état *healthy* des services. La migration est lancée explicitement dans un conteneur jetable de l'image backend, exactement comme le Job de migration le fera dans le cluster.

**RÉSULTAT ATTENDU** — Les services passent à `Healthy` ; la migration affiche une suite de `Applying ... OK`.

**VÉRIFICATION** — `docker compose -f infra/docker/compose.smoke.yaml ps`

**ERREUR POSSIBLE** — Le backend ne devient pas sain : lire ses journaux (étape 4.4). `ImproperlyConfigured` : variable absente ou mal formée dans `backend-smoke.env`.

<a id="etape-44--controler-sondes-identite-et-journaux"></a>

#### Étape 4.4 — Contrôler sondes, identité et journaux

**OBJECTIF** — Vérifier le comportement réel des deux images ensemble.

**COMMANDE**

```bash
# LECTURE / VALIDATION
docker compose -f infra/docker/compose.smoke.yaml ps
curl --fail http://127.0.0.1:8000/healthz/
curl --fail http://127.0.0.1:8000/readyz/
curl --fail http://127.0.0.1:4321/healthz
curl --fail http://127.0.0.1:4321/readyz
curl --fail --output /dev/null http://127.0.0.1:4321/login
docker compose -f infra/docker/compose.smoke.yaml exec -T backend id
docker compose -f infra/docker/compose.smoke.yaml exec -T frontend id
docker compose -f infra/docker/compose.smoke.yaml logs --tail=100 backend frontend
```

**EXPLICATION** — `curl --fail` renvoie une erreur si le code HTTP est supérieur ou égal à 400.

**RÉSULTAT ATTENDU** — Quatre réponses `{"status": "ok"}` ; `/login` répond sans erreur ; `uid=10001 gid=10001` pour les deux conteneurs ; journaux sans trace d'exception.

**VÉRIFICATION** — Tester ensuite manuellement une connexion en HTTPS ou via `localhost` : sur HTTP avec l'adresse IP distante, les cookies `Secure` empêchent la connexion.

**ERREUR POSSIBLE** — `400` sur les sondes backend : `DisallowedHost`, compléter `DJANGO_ALLOWED_HOSTS`. Les journaux peuvent contenir des données : les lire localement, ne pas les publier.

<a id="etape-45--executer-les-tests-django-dans-limage"></a>

#### Étape 4.5 — Exécuter les tests Django dans l'image

**OBJECTIF** — Prouver que le code **tel qu'emballé** passe ses tests.

**COMMANDE**

```bash
# VALIDATION avec base SQLite mémoire, sans données métier
docker run --rm --read-only --tmpfs /tmp:uid=10001,gid=10001,mode=1770 \
  --entrypoint python \
  "harbor.nexora-djibouti.fr/facturadj/backend:$TAG" \
  manage.py test --settings=config.test_settings --verbosity 2
```

**EXPLICATION** — `--entrypoint python` contourne le point d'entrée (qui exige PostgreSQL et Redis) ; `config.test_settings` utilise une base en mémoire.

**RÉSULTAT ATTENDU** — `OK` en fin de sortie.

**VÉRIFICATION** — Aucun test en échec ni en erreur.

**ERREUR POSSIBLE** — Échec de test : corriger dans une PR, reconstruire, retester. Ne jamais publier une image dont les tests échouent.

<a id="etape-46--arreter-le-test"></a>

#### Étape 4.6 — Arrêter le test

**OBJECTIF** — Libérer les ressources en conservant la base de test.

**COMMANDE**

```bash
# MODIFICATION LOCALE : arrêter le smoke, conserver son volume PostgreSQL
docker compose -f infra/docker/compose.smoke.yaml down
```

**EXPLICATION** — Sans `--volumes`, le volume `pgdata` est conservé.

**RÉSULTAT ATTENDU** — Conteneurs et réseau supprimés.

**VÉRIFICATION** — `docker compose -f infra/docker/compose.smoke.yaml ps` ne liste plus rien.

**ERREUR POSSIBLE** — Ne pas ajouter `--volumes` sans avoir décidé de supprimer la base de test.

<a id="section-17-8"></a>

### 17.8 Phase 5 — Scanner

<a id="etape-51--analyser-dockerfiles-et-manifests"></a>

#### Étape 5.1 — Analyser Dockerfiles et manifests

**OBJECTIF** — Détecter les mauvaises pratiques de construction et de configuration.

**COMMANDE**

```bash
# LECTURE / ANALYSE (Trivy peut télécharger sa base et écrire ses rapports)
hadolint infra/docker/backend/Dockerfile infra/docker/frontend/Dockerfile
trivy config infra/docker
trivy config infra/k8s/k3d
```

**EXPLICATION** — Hadolint applique les bonnes pratiques Dockerfile ; `trivy config` signale les erreurs de configuration.

**RÉSULTAT ATTENDU** — Hadolint sans erreur ; Trivy sans défaut `HIGH` ou `CRITICAL` non expliqué.

**VÉRIFICATION** — Examiner chaque alerte plutôt que désactiver des règles globalement.

**ERREUR POSSIBLE** — Base de vulnérabilités non téléchargeable : vérifier l'accès réseau de la VM.

<a id="etape-52--scanner-les-archives-a-publier"></a>

#### Étape 5.2 — Scanner les archives à publier

**OBJECTIF** — Analyser les octets exacts qui partiront dans Harbor et produire les SBOM.

**COMMANDE**

```bash
# LECTURE optionnelle : scan des images locales
trivy image --severity HIGH,CRITICAL --exit-code 1 "harbor.nexora-djibouti.fr/facturadj/frontend:$TAG"
trivy image --severity HIGH,CRITICAL --exit-code 1 "harbor.nexora-djibouti.fr/facturadj/backend:$TAG"
# ANALYSE des archives exactes destinées à publication + SBOM + checksums
bash infra/ci/images.sh scan
```

**EXPLICATION** — `images.sh scan` vérifie d'abord les empreintes des archives, puis écrit `scanned.sha256` **uniquement** si les deux scans réussissent.

**RÉSULTAT ATTENDU** — Code de sortie 0 ; fichiers `release/{backend,frontend}.{trivy,sbom}.json` et `release/scanned.sha256` présents.

**VÉRIFICATION** — `ls -l release/*.trivy.json release/*.sbom.json release/scanned.sha256`

**ERREUR POSSIBLE** — Vulnérabilité `HIGH` ou `CRITICAL` : **arrêt**. Mettre à jour la base (digest) ou la dépendance (lock), puis refaire construction, tests et scan. Ne jamais ajouter `|| true` ni ignorer toutes les vulnérabilités.

**Arrêt : tout échec interdit de continuer vers Harbor.**

<a id="section-17-9"></a>

### 17.9 Phase 6 — Publier dans Harbor

<a id="etape-61--preparer-les-identifiants-de-publication"></a>

#### Étape 6.1 — Préparer les identifiants de publication

**OBJECTIF** — Rendre disponibles le nom et le secret du robot de publication, sans les exposer.

**COMMANDE**

```bash
# MODIFICATION LOCALE : protéger le fichier que vous avez renseigné
chmod 600 ~/nexora-secrets/harbor/robot-password
read -r -p 'Nom exact du robot de publication : ' HARBOR_USERNAME
export HARBOR_USERNAME
export HARBOR_PASSWORD_FILE="$HOME/nexora-secrets/harbor/robot-password"
```

**EXPLICATION** — Le fichier du mot de passe a été créé au préalable par vous. Le nom du robot contient un `$` : `read` évite son interprétation par le shell.

**RÉSULTAT ATTENDU** — Aucune sortie.

**VÉRIFICATION** — Dans Harbor : projet `facturadj` privé, robot de publication valide (non expiré), règles d'immutabilité `sha-*` et `v*` en place.

**ERREUR POSSIBLE** — Fichier absent : le créer avec un éditeur, jamais avec `echo "motdepasse" >` qui laisse le secret dans l'historique du shell.

<a id="etape-62--publier-les-deux-images"></a>

#### Étape 6.2 — Publier les deux images

**OBJECTIF** — Pousser la paire d'images scannée et obtenir le reçu des deux digests.

**COMMANDE**

```bash
# MODIFICATION DISTANTE, commande explicitement choisie par vous
bash infra/ci/images.sh push
# LECTURE
cat release/digests.json
```

**EXPLICATION** — Voir [8.5](#section-8-5) : contrôle des archives scannées, identifiants éphémères, contrôle du label de révision, push, reçu.

**RÉSULTAT ATTENDU** — Deux `docker push` réussis ; `digests.json` contient `source_revision`, `tag`, `backend` et `frontend` avec leurs `@sha256:`.

**VÉRIFICATION** — Dans l'interface Harbor, les tags `sha-<SHA>` des deux repositories affichent les **mêmes digests** que le reçu.

**ERREUR POSSIBLE** — Voir [7.9](#section-7-9). `cmp` en échec : les archives ont changé depuis le scan, refaire le scan.

**Variante manuelle** — Si vous avez utilisé les deux `docker push` directs de [7.6](#section-7-6) à la place de `images.sh push`, générer le reçu ainsi :

```bash
# MODIFICATION LOCALE du reçu ; docker inspect est en lecture
python3 - <<'PY'
import json, os, subprocess
from pathlib import Path
r = {"source_revision": os.environ["SOURCE_REV"], "tag": os.environ["TAG"]}
for component in ("frontend", "backend"):
    prefix = "harbor.nexora-djibouti.fr/facturadj/" + component
    refs = json.loads(subprocess.check_output([
        "docker", "image", "inspect", "--format", "{{json .RepoDigests}}",
        prefix + ":" + r["tag"]], text=True))
    refs = [x for x in refs if x.startswith(prefix + "@")]
    if len(refs) != 1:
        raise SystemExit("Digest absent/ambigu : " + component)
    r[component] = refs[0]
Path("release/digests.json").write_text(json.dumps(r, indent=2) + "\n")
PY
```

<a id="section-17-10"></a>

### 17.10 Phase 7 — Modifier GitOps

<a id="etape-71--transferer-le-sha-approuve-vers-gitlab"></a>

#### Étape 7.1 — Transférer le SHA approuvé vers GitLab

**OBJECTIF** — Garder dans le miroir GitLab exactement le commit construit et publié.

**COMMANDE** — Celles de [6.4](#section-6-4), avec `APPROVED_SHA` égal à `SOURCE_REV`.

**EXPLICATION** — Le miroir conserve la trace du code promu. Si vous utilisez déjà cette release construite à la main, **ne pas relancer** les jobs de construction GitLab.

**RÉSULTAT ATTENDU** — `git ls-remote` affiche le même SHA dans GitLab.

**VÉRIFICATION** — Le job `validate` du pipeline GitLab passe.

**ERREUR POSSIBLE** — Push refusé en « non fast-forward » : **arrêter**, le miroir contient un commit inattendu.

<a id="etape-72--preparer-le-clone-gitops"></a>

#### Étape 7.2 — Préparer le clone GitOps

**OBJECTIF** — Disposer d'un clone du dépôt GitOps distinct, en écriture pour l'administrateur.

**COMMANDE**

```bash
# MODIFICATION LOCALE : nouveau clone ; URL sans secret en ligne
read -r -p 'URL du dépôt GitLab GitOps distinct : ' GITOPS_URL
export GITOPS_DIR="$HOME/FACTURADJ/facturadj-gitops"
git clone "$GITOPS_URL" "$GITOPS_DIR"
```

**EXPLICATION** — Pour les releases suivantes, le clone existe déjà : `git -C "$GITOPS_DIR" switch main && git -C "$GITOPS_DIR" pull --ff-only`.

**RÉSULTAT ATTENDU** — Le dossier `~/FACTURADJ/facturadj-gitops` est créé.

**VÉRIFICATION** — `git -C "$GITOPS_DIR" log --oneline -3`

**ERREUR POSSIBLE** — Authentification refusée : configurer une clé SSH ou un gestionnaire d'identifiants ; ne jamais placer un jeton dans l'URL.

<a id="etape-73--generer-la-proposition"></a>

#### Étape 7.3 — Générer la proposition

**OBJECTIF** — Produire la proposition de manifests avec les nouveaux digests.

**COMMANDE**

```bash
cd ~/FACTURADJ/facturaDJ
# MODIFICATION LOCALE — PREMIÈRE promotion : à partir des modèles du dépôt
python3 infra/ci/prepare_gitops.py \
  --receipt release/digests.json --output release/gitops
```

Pour une **release suivante**, à la place de la commande précédente :

```bash
# MODIFICATION LOCALE — promotions suivantes : à partir des paramètres déjà validés
python3 infra/ci/prepare_gitops.py --base "$GITOPS_DIR" \
  --receipt release/digests.json --output "release/gitops-$TAG"
```

**EXPLICATION** — Voir [8.7](#section-8-7).

**RÉSULTAT ATTENDU** — `Proposition locale écrite. Relire les différences dans le dépôt GitOps existant.`

**VÉRIFICATION** — `cat release/gitops/receipt.json` (ou `release/gitops-$TAG/receipt.json`).

**ERREUR POSSIBLE** — `Le dossier de sortie existe déjà` : choisir un nouveau dossier. `Digest invalide` : `digests.json` incomplet, revenir à l'étape 6.2.

<a id="etape-74--renseigner-les-parametres-premiere-promotion"></a>

#### Étape 7.4 — Renseigner les paramètres (première promotion)

**OBJECTIF** — Remplacer toutes les valeurs factices, sans toucher aux digests applicatifs.

**COMMANDE**

```bash
# MODIFICATION LOCALE : supprimer TOUS les paramètres factices
nano release/gitops/infra/argocd/facturadj-preprod.yaml
nano release/gitops/infra/k8s/k3d/config.yaml
nano release/gitops/infra/k8s/k3d/ingress.yaml
nano release/gitops/infra/k8s/overlays/preprod/kustomization.yaml
```

**EXPLICATION**

| Fichier | À renseigner |
|---|---|
| `argocd/facturadj-preprod.yaml` | L'URL du dépôt GitOps dans **les deux champs** : `sourceRepos` de l'AppProject et `repoURL` de l'Application |
| `k8s/k3d/config.yaml` | `PUBLIC_FRONTEND_URL` et `CSRF_TRUSTED_ORIGINS` avec le domaine HTTPS de la PREPROD |
| `k8s/k3d/ingress.yaml` | Le domaine dans `tls.hosts` et dans `rules.host` |
| `k8s/overlays/preprod/kustomization.yaml` | Les digests PostgreSQL et Redis choisis à l'étape 2.1 ; **ne pas modifier** ceux du backend et du frontend |

Adapter si nécessaire la taille des volumes et les ressources. Le backend reste privé en HTTP (`SECURE_SSL_REDIRECT=0`) ; seul l'Ingress Astro termine TLS. Ne jamais exposer Django directement.

**RÉSULTAT ATTENDU** — Plus aucune occurrence de `example.invalid`, `RENSEIGNER` ou `sha256:000…`.

**VÉRIFICATION** — Étape 7.5.

**ERREUR POSSIBLE** — Format d'URL différent entre l'AppProject et l'Application (HTTPS d'un côté, SSH de l'autre) : Argo CD refusera la source.

<a id="etape-75--valider-la-proposition"></a>

#### Étape 7.5 — Valider la proposition

**OBJECTIF** — Refuser toute proposition incomplète et relire le rendu final.

**COMMANDE**

```bash
# VALIDATION LOCALE ; kustomize écrit seulement le rendu, à votre initiative
python3 infra/ci/check_static.py --release --gitops-root release/gitops
kustomize build release/gitops/infra/k8s/overlays/preprod > release/preprod.rendered.yaml
# LECTURE
less release/preprod.rendered.yaml
```

**EXPLICATION** — Le mode `--release` refuse les valeurs factices et le lock absent. Le rendu montre exactement ce qu'Argo CD appliquera.

**RÉSULTAT ATTENDU** — `check_static.py` affiche `OK` sans le message du mode préparation ; le rendu contient les images `@sha256:` réelles et le namespace `facturadj-preprod` partout.

**VÉRIFICATION**

```bash
# LECTURE : aucune image sans digest dans le rendu. Attendu : aucune ligne
grep -nE 'image: ' release/preprod.rendered.yaml | grep -v '@sha256:'
```

**ERREUR POSSIBLE** — `Paramètres de livraison incomplets : <fichier>` : revenir à l'étape 7.4.

<a id="etape-76--proposer-la-promotion-par-merge-request"></a>

#### Étape 7.6 — Proposer la promotion par Merge Request

**OBJECTIF** — Soumettre la promotion à revue, sans jamais pousser directement sur `main`.

**COMMANDE**

```bash
# MODIFICATION LOCALE après revue ; copie ciblée de la proposition
read -r -p 'Dossier de proposition validé (release/gitops ou release/gitops-$TAG) : ' PROPOSAL_DIR
PROPOSAL_DIR="$(realpath "$PROPOSAL_DIR")"
test -s "$PROPOSAL_DIR/receipt.json"
test -z "$(git -C "$GITOPS_DIR" status --porcelain)"
cd "$GITOPS_DIR"
git switch -c "promote/$TAG"
cp -a "$PROPOSAL_DIR/infra" "$GITOPS_DIR/"
cp "$PROPOSAL_DIR/receipt.json" "$GITOPS_DIR/receipt.json"
git add -- infra/k8s/k3d infra/k8s/overlays/preprod infra/k8s/operations infra/argocd receipt.json
git diff --cached --check
git diff --cached
git commit -m "preprod: promotion $TAG"
# MODIFICATION DISTANTE : soumettre la MR, ne pas pousser main directement
git push -u origin "promote/$TAG"
```

**EXPLICATION** — Choisir le dossier réellement généré et validé, notamment `release/gitops-$TAG` pour une release suivante. Le reçu `receipt.json` est copié et versionné avec la proposition ; il permet les contrôles d'identité du Job en 17.13. Relancer `check_static.py --release --gitops-root` sur le dossier choisi avant cette copie.

**RÉSULTAT ATTENDU** — Branche `promote/sha-<SHA>` poussée ; MR ouverte dans GitLab ; le diff montre uniquement les digests (et, la première fois, les paramètres).

**VÉRIFICATION** — MR approuvée et fusionnée par un Admin DevOps. Argo CD suit `main` : l'Application passera `OutOfSync`.

**ERREUR POSSIBLE** — Diff inattendu (domaine, ressources modifiés) : la proposition a été générée depuis les modèles au lieu du dépôt existant ; régénérer avec `--base`.

<a id="section-17-11"></a>

### 17.11 Bootstrap du cluster (premier déploiement uniquement)

> **Attention** — Cette section ne s'exécute **qu'une fois**, si le namespace, les Secrets et l'Application n'existent pas. Aucune commande de création d'un nouveau cluster n'est fournie : la cible attend un cluster k3d **existant**.

<a id="etape-b1--inspecter-le-cluster-existant"></a>

#### Étape B.1 — Inspecter le cluster existant

**OBJECTIF** — Identifier le cluster, son contexte et les composants attendus.

**COMMANDE**

```bash
# CONNEXION MANUELLE, depuis une machine possédant cet alias
ssh nexora-vps
# LECTURE sur le VPS
k3d version
k3d cluster list
kubectl config get-contexts
read -r -p 'Nom exact du cluster k3d PREPROD : ' K3D_CLUSTER
export KUBE_CONTEXT="k3d-$K3D_CLUSTER"
kubectl --context "$KUBE_CONTEXT" get nodes -o wide
kubectl --context "$KUBE_CONTEXT" get storageclass
kubectl --context "$KUBE_CONTEXT" -n kube-system get pods --show-labels
kubectl --context "$KUBE_CONTEXT" -n argocd get pods
```

**EXPLICATION** — k3d nomme ses contextes `k3d-<nom du cluster>`.

**RÉSULTAT ATTENDU** — Nœuds `Ready` ; StorageClass `local-path` ; Pods `traefik` (avec le label `app.kubernetes.io/name=traefik`) et `coredns` en `Running` ; Pods Argo CD en `Running`.

**VÉRIFICATION** — Consigner les versions de k3d, k3s, Traefik et Argo CD.

**ERREUR POSSIBLE** — Composant absent : l'installer **séparément**, dans une version choisie et revue, avant de poursuivre. Les manifests applicatifs n'installent ni k3d, ni Traefik, ni Argo CD.

<a id="etape-b2--preparer-la-machine-dadministration"></a>

#### Étape B.2 — Préparer la machine d'administration

**OBJECTIF** — Travailler depuis le clone GitOps approuvé et le bon contexte.

**COMMANDE**

```bash
# LECTURE : dans le clone GitOps approuvé de la machine d'administration
cd "$GITOPS_DIR"
git switch main
git pull --ff-only origin main
kubectl config get-contexts
read -r -p 'Contexte Kubernetes PREPROD exact : ' KUBE_CONTEXT
export KUBE_CONTEXT
kubectl --context "$KUBE_CONTEXT" get nodes -o wide
```

**EXPLICATION** — La machine d'administration détient le clone GitOps **et** le kubeconfig PREPROD. Ce peut être le VPS après un clone manuel ; la VM DEV n'a pas nécessairement ce kubeconfig.

**RÉSULTAT ATTENDU** — `main` à jour contenant la promotion fusionnée ; nœuds visibles.

**VÉRIFICATION** — `git log --oneline -1` montre le commit de promotion.

**ERREUR POSSIBLE** — Mauvais contexte : **arrêter** ; ne jamais appliquer sur un autre cluster.

<a id="etape-b3--creer-le-namespace"></a>

#### Étape B.3 — Créer le namespace

**OBJECTIF** — Créer `facturadj-preprod` avec le niveau Pod Security `restricted`.

**COMMANDE**

```bash
# DÉPLOIEMENT bootstrap du namespace seulement
kubectl --context "$KUBE_CONTEXT" apply -f infra/k8s/operations/namespace.yaml
```

**EXPLICATION** — Le namespace est hors GitOps : il porte des labels de sécurité et les Secrets qu'Argo CD ne gère pas.

**RÉSULTAT ATTENDU** — `namespace/facturadj-preprod created`

**VÉRIFICATION** — `kubectl --context "$KUBE_CONTEXT" get ns facturadj-preprod --show-labels`

**ERREUR POSSIBLE** — `AlreadyExists` n'apparaît pas avec `apply` ; si le namespace existait, vérifier que ses labels sont bien ceux attendus.

<a id="etape-b4--preparer-les-fichiers-secrets-hors-depot"></a>

#### Étape B.4 — Préparer les fichiers secrets hors dépôt

**OBJECTIF** — Disposer de tous les fichiers nécessaires, protégés, sans jamais afficher les valeurs.

**COMMANDE** — Pour `postgres-password` et `backend-preprod.env`, le script de [13.3](#section-13-3). Placer en outre dans `~/nexora-secrets/facturadj/` le certificat `tls.crt` et sa clé `tls.key` ([11.5](#section-11-5)), et dans `~/nexora-secrets/harbor/robot-pull-password` le secret du robot Harbor en lecture.

**EXPLICATION** — `DATABASE_URL` pointe vers `facturadj-postgres:5432/facturadj`, utilisateur `facturadj`, avec le mot de passe URL-encodé ; aucun mot de passe réel ne doit apparaître dans cette documentation.

**RÉSULTAT ATTENDU** — Fichiers présents, droits `600`.

**VÉRIFICATION** — `ls -l ~/nexora-secrets/facturadj/ ~/nexora-secrets/harbor/`

**ERREUR POSSIBLE** — Mot de passe PostgreSQL écrit avec un retour à la ligne final : authentification refusée plus tard ([13.3](#section-13-3)).

<a id="etape-b5--creer-les-secrets-applicatifs"></a>

#### Étape B.5 — Créer les Secrets applicatifs

**OBJECTIF** — Créer les Secrets du backend, de PostgreSQL et du certificat.

**COMMANDE**

```bash
# DÉPLOIEMENT : première création, depuis fichiers protégés hors dépôt
kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod create secret generic facturadj-backend \
  --from-env-file="$HOME/nexora-secrets/facturadj/backend-preprod.env"
kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod create secret generic facturadj-postgres \
  --from-file=POSTGRES_PASSWORD="$HOME/nexora-secrets/facturadj/postgres-password"
kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod create secret tls facturadj-tls \
  --cert="$HOME/nexora-secrets/facturadj/tls.crt" \
  --key="$HOME/nexora-secrets/facturadj/tls.key"
```

**EXPLICATION** — `--from-env-file` crée une clé par ligne `CLÉ=valeur` ; `--from-file=CLÉ=fichier` copie le contenu exact du fichier.

**RÉSULTAT ATTENDU** — Trois lignes `secret/... created`.

**VÉRIFICATION** — `kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod get secrets` (noms uniquement).

**ERREUR POSSIBLE** — `AlreadyExists` : le Secret existe déjà. Ne **pas** le supprimer pour contourner l'erreur ; une rotation se planifie explicitement ([14.3](#section-14-3)).

<a id="etape-b6--creer-le-secret-de-telechargement-harbor"></a>

#### Étape B.6 — Créer le Secret de téléchargement Harbor

**OBJECTIF** — Permettre au cluster de tirer les images avec le robot en **lecture seule**.

**COMMANDE**

```bash
# MODIFICATION : config Docker distincte avec ROBOT PULL uniquement
umask 077
mkdir -p ~/nexora-secrets/harbor-pull-config
read -r -p 'Nom du robot Harbor lecture seule : ' HARBOR_PULL_USERNAME
cat ~/nexora-secrets/harbor/robot-pull-password | \
  docker --config "$HOME/nexora-secrets/harbor-pull-config" login \
    harbor.nexora-djibouti.fr --username "$HARBOR_PULL_USERNAME" --password-stdin
# DÉPLOIEMENT : pas de secret en argument de commande
kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod create secret generic harbor-pull \
  --type=kubernetes.io/dockerconfigjson \
  --from-file=.dockerconfigjson="$HOME/nexora-secrets/harbor-pull-config/config.json"
```

**EXPLICATION** — `docker --config <dossier>` écrit les identifiants dans un dossier dédié, séparé de votre configuration Docker habituelle et de celle du robot de publication. Le fichier `config.json` obtenu devient le contenu du Secret.

**RÉSULTAT ATTENDU** — `Login Succeeded`, puis `secret/harbor-pull created`.

**VÉRIFICATION** — `kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod get secret harbor-pull -o jsonpath='{.type}'` affiche `kubernetes.io/dockerconfigjson`.

**ERREUR POSSIBLE** — `config.json` sans identifiants (`credsStore` utilisé par un assistant d'identifiants) : le Secret serait inutilisable ; vérifier que le fichier contient une entrée `auths` pour `harbor.nexora-djibouti.fr`, sans afficher sa valeur.

<a id="etape-b7--donner-a-argo-cd-un-acces-en-lecture-au-depot-gitops"></a>

#### Étape B.7 — Donner à Argo CD un accès en lecture au dépôt GitOps

**OBJECTIF** — Permettre à Argo CD de lire le dépôt GitOps, sans pouvoir y écrire.

**COMMANDE** — Dans GitLab, créer une **clé de déploiement** en lecture seule sur le projet GitOps. Puis, soit dans l'interface Argo CD (*Settings > Repositories*), soit en CLI :

```bash
# MODIFICATION : enregistrement du dépôt dans Argo CD avec une clé en lecture seule
argocd repo add git@<hôte-gitlab>:<groupe>/facturadj-gitops.git \
  --ssh-private-key-path "$HOME/nexora-secrets/argocd/gitops-deploy-key"
```

**EXPLICATION** — Argo CD conserve la clé privée dans son propre Secret. L'URL enregistrée doit correspondre **exactement** à `repoURL` et `sourceRepos` du manifest (même schéma SSH ou HTTPS).

**RÉSULTAT ATTENDU** — `Repository 'git@...' added`

**VÉRIFICATION** — `argocd repo list` affiche le dépôt avec l'état `Successful`.

**ERREUR POSSIBLE** — `authentication required` : clé non autorisée sur le projet, ou URL différente de celle du manifest.

<a id="etape-b8--verifier-labsence-dancienne-synchronisation-automatique"></a>

#### Étape B.8 — Vérifier l'absence d'ancienne synchronisation automatique

**OBJECTIF** — S'assurer qu'aucune Application ou ApplicationSet existante ne rétablira un auto-sync.

**COMMANDE**

```bash
# LECTURE : examiner d'éventuels parents/anciennes Applications avant remplacement
argocd context
argocd app list
```

**EXPLICATION** — `argocd context` confirme le serveur Argo CD visé par la CLI. Voir [10.7](#section-10-7).

**RÉSULTAT ATTENDU** — Le bon serveur ; aucune Application FacturaDJ en auto-sync.

**VÉRIFICATION** — Pour toute Application FacturaDJ existante, `argocd app get <nom> -o yaml` ne contient pas `automated`.

**ERREUR POSSIBLE** — Auto-sync présent : appliquer [10.7](#section-10-7) **avant** de continuer.

<a id="etape-b9--creer-lappproject-et-lapplication"></a>

#### Étape B.9 — Créer l'AppProject et l'Application

**OBJECTIF** — Déclarer l'Application `facturadj-preprod`, sans synchronisation automatique.

**COMMANDE**

```bash
# DÉPLOIEMENT de configuration seulement : app SANS automated
kubectl --context "$KUBE_CONTEXT" apply -f infra/argocd/facturadj-preprod.yaml
# LECTURE : contrôler le serveur, le dépôt, la révision et l'absence d'automated
argocd app get facturadj-preprod -o yaml
argocd app diff facturadj-preprod
```

**EXPLICATION** — Créer l'Application ne déploie rien : elle compare Git et le cluster, puis attend.

**RÉSULTAT ATTENDU** — `appproject.argoproj.io/facturadj created` et `application.argoproj.io/facturadj-preprod created` ; statut `OutOfSync` et santé `Missing`.

**VÉRIFICATION** — `spec.syncPolicy` ne contient que `syncOptions: [CreateNamespace=false]`.

**ERREUR POSSIBLE** — `ComparisonError` ou `repository not accessible` : revenir à l'étape B.7.

<a id="section-17-12"></a>

### 17.12 Phase 8 — Contrôler Argo CD

<a id="etape-81--lire-letat-de-lapplication"></a>

#### Étape 8.1 — Lire l'état de l'Application

**OBJECTIF** — Vérifier qu'Argo CD compare la bonne révision, avec la bonne politique.

**COMMANDE**

```bash
# LECTURE dans le contexte Argo CD approuvé
argocd app get facturadj-preprod
```

**EXPLICATION** — Voir [10.4](#section-10-4).

**RÉSULTAT ATTENDU** — `Sync Policy: Manual` ; `Sync Status: OutOfSync from main (<commit de promotion>)` ; `Health Status: Healthy` (ou `Missing` au premier déploiement).

**VÉRIFICATION** — Le commit indiqué est celui de la MR fusionnée.

**ERREUR POSSIBLE** — Révision ancienne : Argo CD n'a pas encore rafraîchi ; `argocd app get facturadj-preprod --refresh`.

<a id="etape-82--lire-le-diff"></a>

#### Étape 8.2 — Lire le diff

**OBJECTIF** — Comprendre exactement ce que la synchronisation va changer.

**COMMANDE**

```bash
# LECTURE
argocd app diff facturadj-preprod
```

**EXPLICATION** — Un code non nul peut signaler une différence ou une erreur. Lire la sortie et la documentation de la version installée ; une erreur de transport ou d'authentification impose l'arrêt.

**RÉSULTAT ATTENDU** — Pour une release courante : uniquement les lignes `image:` du backend et du frontend (nouveaux digests). Au premier déploiement : toutes les ressources.

**VÉRIFICATION** — Aucune suppression inattendue, aucun changement de PVC, aucun changement de domaine non prévu.

**ERREUR POSSIBLE** — Différence inexpliquée : **ne pas synchroniser** ; rechercher un drift manuel ([10.2](#section-10-2)).

<a id="section-17-13"></a>

### 17.13 Phase 9 — Synchroniser et migrer

**Objectif :** appliquer la release approuvée dans un ordre compatible avec les données. Cette procédure distingue le premier déploiement, la livraison sans changement de schéma et la livraison avec migration.

**Préconditions communes :** MR GitOps fusionnée et relue, digests disponibles, variables et accès vérifiés, plan de repli identifié. Pour une base utilisée, sauvegarde et médias cohérents selon le chapitre 19.

<a id="etape-91--figer-la-revision-gitops-et-choisir-le-scenario"></a>

#### Étape 9.1 — Figer la révision GitOps et choisir le scénario

~~~bash
# LECTURE : dans le clone GitOps approuvé
cd "$GITOPS_DIR"
: "${KUBE_CONTEXT:?Contexte PREPROD requis}"
: "${SOURCE_REV:?SHA applicatif de la release requis}"
K=(kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod)

git status --short
git log -1 --format='%H %s'
read -r -p 'SHA complet de la MR GitOps fusionnée et approuvée : ' GITOPS_REV
export GITOPS_REV
(
  set -euo pipefail
  [[ "$GITOPS_REV" =~ ^[0-9a-f]{40}$ ]]
  test -z "$(git status --porcelain)"
  test "$(git rev-parse HEAD)" = "$GITOPS_REV"
)
argocd app get facturadj-preprod --refresh
argocd app diff facturadj-preprod --revision "$GITOPS_REV"
~~~

**Attendu :** le clone correspond au commit approuvé, et le diff porte sur ce même commit. Lire la sortie de `diff` même si son code signale des différences. Une erreur réseau ou d'authentification n'est pas une différence acceptable.

`--revision` choisit explicitement la version à synchroniser. Cela évite qu'une nouvelle fusion dans `main` remplace le plan relu entre la vérification et l'action. [Référence Argo CD : synchronisation](https://argo-cd.readthedocs.io/en/stable/user-guide/commands/argocd_app_sync/).

| Scénario | Ordre retenu | Ouverture publique |
|---|---|---|
| **A — Première installation** | Fermer l'accès → créer les dépendances et applications → attendre PostgreSQL/Redis → migrer → tester | Après les tests métier |
| **B — Base existante, aucun changement de schéma** | Examiner la release → synchroniser les deux images → tester | Coupure liée à `Recreate` à prévoir |
| **C — Base existante, migration nécessaire** | Fermer l'accès → sauvegarder et valider → arrêter les applications → migrer → synchroniser → tester | Après les tests métier |
| **D — Migration complexe ou incompatible** | Plan spécifique revu et testé : transformation de données, étapes intermédiaires et reprise | Selon la fenêtre planifiée |

Le scénario C est la procédure conservatrice proposée pour la PREPROD mononœud. Une migration compatible peut être effectuée autrement après validation d'un plan spécifique. La compatibilité ne doit jamais être déduite du seul succès du smoke test.

**Arrêt :** scénario indéterminé, changement de schéma non expliqué, sauvegarde non exploitable ou diff inattendu. Ne pas poursuivre en espérant que les sondes détecteront le problème.

<a id="etape-92--preparer-les-services-et-proteger-les-donnees"></a>

#### Étape 9.2 — Préparer les services et protéger les données

**Scénario A uniquement**, accès fermé par un contrôle effectif du pare-feu ou de la façade :

~~~bash
# DÉPLOIEMENT INITIAL : aucun schéma métier n'est encore garanti
argocd app sync facturadj-preprod --revision "$GITOPS_REV" --async

# LECTURE : vérifier les dépendances, sans attendre les tests métier
"${K[@]}" rollout status statefulset/facturadj-postgres --timeout=300s
"${K[@]}" rollout status deploy/facturadj-redis --timeout=300s
"${K[@]}" exec facturadj-postgres-0 -- pg_isready -U facturadj -d facturadj
argocd app get facturadj-preprod
~~~

`--async` rend la main après la demande de synchronisation ; ce n'est pas un succès de déploiement. Vérifier dans Argo CD que les ressources nécessaires sont créées et qu'aucune opération n'a échoué avant de lancer la migration.

Les sondes `/readyz` peuvent être vertes avant la création des tables. Elles testent l'accès aux dépendances, pas le schéma métier.

**Scénario C**, accès fermé et absence d'autres opérateurs en cours de synchronisation :

1. Sauvegarder PostgreSQL suivant [13.6](#section-13-6).
2. Sauvegarder les médias si une reprise complète doit les retrouver au même point.
3. Vérifier le catalogue, les empreintes et la preuve de restauration ; conserver les reçus de la version précédente.
4. Arrêter les applications seulement après la capture des fichiers médias depuis le backend.

~~~bash
# DÉPLOIEMENT : maintenance temporaire, visible dans Argo CD
"${K[@]}" scale deploy/facturadj-frontend deploy/facturadj-backend --replicas=0
"${K[@]}" get pods,jobs
~~~

**Attendu :** aucun Pod applicatif encore actif et aucun traitement concurrent écrivant en base. PostgreSQL et Redis restent disponibles. L'état `OutOfSync` pendant cette maintenance est attendu.

**Scénario B :** passer à 9.4. **Scénario D :** appliquer le plan spécifique adopté ; le présent bloc ne remplace pas sa préparation.

<a id="etape-93--verifier-et-executer-le-job-de-migration"></a>

#### Étape 9.3 — Vérifier et exécuter le Job de migration

**Machine :** administration. **Répertoire :** clone GitOps au commit `GITOPS_REV`. **Effet :** modification du schéma et, selon les migrations, des données.

~~~bash
# VALIDATION LOCALE : identité, environnement et image du Job
python3 - <<'PY'
import json
import os
import yaml
from pathlib import Path

receipt = json.loads(Path("receipt.json").read_text())
job = yaml.safe_load(Path("infra/k8s/operations/migrate.yaml").read_text())
revision = os.environ["SOURCE_REV"]
assert receipt["source_revision"] == revision, "Reçu applicatif incohérent"
assert receipt["tag"] == "sha-" + revision, "Tag incohérent"
assert job["metadata"]["namespace"] == "facturadj-preprod", "Mauvais namespace"
assert job["metadata"]["name"] == "facturadj-migrate-" + revision[:12], "Mauvais Job"
container = job["spec"]["template"]["spec"]["containers"][0]
assert container["image"] == receipt["backend"], "Digest du Job incohérent"
assert container["command"] == ["python", "manage.py", "migrate", "--noinput"]
print("Job, reçu et release concordants.")
PY

MIGRATION_JOB="$(python3 -c 'import yaml; print(yaml.safe_load(open("infra/k8s/operations/migrate.yaml"))["metadata"]["name"])')"
"${K[@]}" get jobs
~~~

**Avant création :** si un Job du même nom existe, lire son état et ses journaux. Un Job terminé n'est pas relancé par un nouvel `apply`. Un échec exige un diagnostic ; ne pas supprimer puis recréer le Job pour masquer cet échec.

~~~bash
# DÉPLOIEMENT / MODIFICATION DB : seulement si le Job n'existe pas encore
"${K[@]}" create -f infra/k8s/operations/migrate.yaml

# LECTURE : succès explicite et journaux
"${K[@]}" wait --for=condition=complete "job/$MIGRATION_JOB" --timeout=600s
"${K[@]}" logs "job/$MIGRATION_JOB"
~~~

**Attendu :** condition `Complete` et migrations en succès. Conserver les journaux avant le nettoyage automatique du Job, prévu après 24 heures.

**Arrêt :** Job `Failed`, délai dépassé, erreur SQL ou incohérence du reçu. Un délai dépassé ne prouve pas que la base est inchangée. Examiner le Job, les migrations appliquées et les éventuelles opérations non transactionnelles avant toute nouvelle tentative.

Le label du Job est partagé avec le backend dans le modèle actuel. L'accès reste fermé pendant cette étape ; la séparation des sélecteurs et des NetworkPolicies demeure une amélioration à implémenter.

<a id="etape-94--appliquer-les-applications-et-controler-la-release"></a>

#### Étape 9.4 — Appliquer les applications et contrôler la release

Pour B et C, synchroniser maintenant. Pour A, vérifier d'abord que l'opération initiale est terminée ; ne pas lancer une deuxième synchronisation concurrente.

~~~bash
# DÉPLOIEMENT : scénarios B et C, après les contrôles préalables
argocd app sync facturadj-preprod --revision "$GITOPS_REV"

# LECTURE : tous scénarios, après migration éventuelle
argocd app wait facturadj-preprod --sync --health --timeout 300
"${K[@]}" rollout status deploy/facturadj-backend --timeout=300s
"${K[@]}" rollout status deploy/facturadj-frontend --timeout=300s
argocd app get facturadj-preprod -o json
~~~

**Vérifier :** `status.sync.revision` correspond à `GITOPS_REV` et les deux Deployments utilisent les digests approuvés. Si `main` a avancé, analyser le nouvel `OutOfSync` ; ne pas synchroniser cette autre release pour obtenir artificiellement un statut vert.

`Synced` et `Healthy` ne clôturent pas la livraison. Effectuer [17.14](#section-17-14), notamment connexion HTTPS et parcours métier sur des données de recette, puis documenter la décision de réouverture.

**Retour prévu :** [chapitre 18](#chapitre-18) pour le code ; [13.6](#section-13-6) pour les données. Le choix dépend du schéma effectivement atteint.

<a id="section-17-14"></a>

### 17.14 Phase 10 — Vérifier l'application

<a id="etape-101--verifier-les-ressources-kubernetes"></a>

#### Étape 10.1 — Vérifier les ressources Kubernetes

**OBJECTIF** — Contrôler Pods, Services, Ingress, volumes et événements.

**COMMANDE**

```bash
# LECTURE
kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod get pods,svc,ingress,pvc
kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod get events --sort-by=.lastTimestamp
```

**EXPLICATION** — Les événements révèlent les échecs de sonde, de téléchargement ou de planification.

**RÉSULTAT ATTENDU** — Quatre Pods `Running` et `1/1` ; Job de migration `Completed` ; PVC `Bound` ; Ingress avec l'hôte PREPROD.

**VÉRIFICATION** — `RESTARTS` à 0 ou stable.

**ERREUR POSSIBLE** — Voir [chapitre 20](#chapitre-20).

<a id="etape-102--verifier-lacces-https"></a>

#### Étape 10.2 — Vérifier l'accès HTTPS

**OBJECTIF** — Contrôler la chaîne complète DNS → TLS → Traefik → Astro → Django → données.

**COMMANDE**

```bash
# LECTURE
read -r -p 'Origine HTTPS publique approuvée (sans slash final) : ' PREPROD_ORIGIN
curl --fail "$PREPROD_ORIGIN/healthz"
curl --fail "$PREPROD_ORIGIN/readyz"
curl --fail --output /dev/null "$PREPROD_ORIGIN/login"
```

**EXPLICATION** — `/readyz` du frontend traverse toute la chaîne jusqu'à PostgreSQL et Redis.

**RÉSULTAT ATTENDU** — `{"status": "ok"}` deux fois ; `/login` sans erreur.

**VÉRIFICATION** — Certificat présenté valide ([11.9](#section-11-9)).

**ERREUR POSSIBLE** — Timeout, `404`, `503`, erreur TLS : [chapitre 20](#chapitre-20).

<a id="etape-103--tester-le-fonctionnel"></a>

#### Étape 10.3 — Tester le fonctionnel

**OBJECTIF** — Prouver que l'application fonctionne, pas seulement l'infrastructure.

**COMMANDE** — Aucune : tests manuels dans le navigateur, avec des **comptes PREPROD**.

**EXPLICATION** — Parcours minimal : connexion, création d'un client, devis, conversion en commande, facture, téléchargement du PDF, téléversement puis lecture d'un média.

**RÉSULTAT ATTENDU** — Parcours complet sans erreur ; numérotation des documents cohérente.

**VÉRIFICATION** — Journaux backend sans exception pendant le parcours.

**ERREUR POSSIBLE** — Ne **jamais** exécuter `seed_demo` en préproduction pour « avoir des données ». L'infrastructure verte ne prouve pas que l'application marche.

<a id="etape-104--consigner-la-release-et-decider-de-louverture"></a>

#### Étape 10.4 — Consigner la release et décider de l'ouverture

**OBJECTIF** — Garder la trace de ce qui a été déployé, et décider explicitement de l'ouverture d'accès.

**COMMANDE** — Compléter le journal de release ([21.6](#section-21-6)) et archiver les reçus :

```bash
# MODIFICATION LOCALE : archive des reçus de la release, hors dépôt
umask 077
mkdir -p "$HOME/nexora-backups/facturadj/releases/$TAG"
cp -a ~/FACTURADJ/facturaDJ/release/digests.json ~/FACTURADJ/facturaDJ/release/*.trivy.json \
  ~/FACTURADJ/facturaDJ/release/*.sbom.json ~/FACTURADJ/facturaDJ/release/*.image.json \
  "$HOME/nexora-backups/facturadj/releases/$TAG/"
```

**EXPLICATION** — Ces reçus permettent de répondre plus tard à « qu'est-ce qui tournait, et était-ce vulnérable ? ».

**RÉSULTAT ATTENDU** — Dossier de release complet.

**VÉRIFICATION** — Journal rempli : SHA, digests, commit GitOps, date, résultat des tests, décision.

**ERREUR POSSIBLE** — **Aucune étape de ce parcours n'autorise une future synchronisation automatique.**

<a id="section-17-15"></a>

### 17.15 Le parcours GitLab (alternative aux phases 3 à 6)

Pour une release courante, les phases 3, 5 et 6 peuvent être exécutées par le pipeline GitLab au lieu de la VM DEV.

```text
SHA approuvé poussé sur GitLab main (étape 7.1)
  │
  ▼
validate ............ automatique
  │
  ▼
build_images ........ [clic] Packer → release/*.tar (artefact 1 jour)
  │
  ▼
scan_images ......... [clic] Trivy + SBOM → scanned.sha256
  │
  ▼
push_harbor ......... [clic] publication → release/digests.json (7 jours)
  │
  ▼
propose_gitops ...... [clic] artefact release/gitops/ (7 jours)
  │
  ▼
Télécharger l'artefact, puis reprendre à l'étape 7.4 (ou 7.5 pour une release suivante)
```

Points d'attention :

- les archives d'images expirent après **un jour** : si elles manquent, reconstruire et rescanner ;
- le job `propose_gitops` part des **modèles** du dépôt applicatif : pour une release suivante, il est souvent plus simple de régénérer localement avec `--base "$GITOPS_DIR"` à partir du `digests.json` téléchargé ;
- le test smoke (phase 4) reste à organiser : avant publication sur la VM DEV, ou après publication en tirant les images depuis Harbor ;
- ne jamais mélanger avec une construction manuelle du même commit.

<a id="section-17-16"></a>

### 17.16 Release suivante : ce qui change

| Étape | Première release | Release suivante |
|---|---|---|
| 0 | Livraison complète copiée | Inutile si le code arrive par Git |
| 2.3 | Script basé sur `livraison.json` | Branche et PR classiques |
| 7.2 | Clone GitOps à créer | `git pull --ff-only` du clone existant |
| 7.3 | `prepare_gitops.py --output release/gitops` | `prepare_gitops.py --base "$GITOPS_DIR" --output "release/gitops-$TAG"` |
| 7.4 | Tous les paramètres à renseigner | Rien, sauf changement voulu |
| 17.11 | Bootstrap complet | Ignoré |
| 9 | Sync, puis migration | Sauvegarde, migration compatible, puis sync |
<a id="mise-en-pratique--chapitre-17"></a>

### Mise en pratique — chapitre 17

**Préparer une livraison avant la fenêtre d'arrêt.** Construire, tester, scanner et préparer la MR sont des étapes à terminer avant l'interruption de recette. La fenêtre sert aux opérations qui dépendent de l'état réel des données et du cluster. **Contrôle :** disposer du commit exact, du plan de migration, de la sauvegarde et du plan de repli avant de commencer.

<a id="synthese-du-chapitre-17"></a>

#### Synthèse du chapitre 17

**À retenir**

- Le rythme est invariable : **objectif → commande → explication → résultat attendu → vérification → erreur possible**. Sauter la vérification revient à ne pas avoir fait l'étape.
- Un seul parcours de construction par release : VM DEV **ou** pipeline GitLab, jamais les deux.
- Les portes d'arrêt sont réelles. Si un contrôle échoue, on corrige la cause : on ne contourne pas avec `\|\| true`, `--force`, `--prune` ni `insecure-registries`.
- Le bootstrap ne se fait **qu'une fois** : namespace, secrets, `harbor-pull`, certificat, enregistrement du dépôt dans Argo CD, AppProject et Application. Une release courante n'y touche pas.
- La release se termine par un archivage : reçus, rapports de scan, SBOM, et une ligne dans le [journal de release](#section-21-6).

**Les pièges classiques**

| Le piège | Pourquoi on tombe dedans | Le bon réflexe |
|---|---|---|
| Enchaîner les blocs sans lire les sorties | La procédure paraît linéaire | C'est un enchaînement de décisions, pas un script. Chaque sortie conditionne la suite |
| Refaire une construction après un échec de publication | On veut « repartir propre » | La nouvelle construction produira un autre digest, et l'immutabilité refusera le tag. Diagnostiquer d'abord l'échec de publication |
| Lancer la migration avant la sauvegarde | La sauvegarde prend du temps | La règle est absolue : pas de migration sans sauvegarde **vérifiée lisible** ([13.6](#section-13-6)) |
| Refaire les étapes de bootstrap à chaque release | Elles figurent dans le même chapitre | Le bootstrap est isolé en [17.11](#section-17-11). Une release courante commence en phase 0 et ignore cette section |

**Vérifiez votre compréhension**

1. Quelles sont les six rubriques de chaque étape ? *(→ [17.1](#section-17-1))*
2. Que faites-vous si la comparaison des archives à l'étape de publication échoue ? *(→ [17.9](#section-17-9), [8.5](#section-8-5))*
3. Quelles étapes ne s'exécutent qu'au premier déploiement ? *(→ [17.11](#section-17-11), [17.16](#section-17-16))*

> **Réponses** — **1.** Objectif, commande, explication, résultat attendu, vérification, erreur possible. **2.** On s'arrête : les archives ne sont pas celles qui ont été scannées. On identifie pourquoi elles ont changé avant toute publication ; on ne force jamais le push. **3.** Celles du bootstrap : création du namespace, des Secrets, du Secret `harbor-pull`, du certificat TLS, enregistrement du dépôt GitOps dans Argo CD, application de l'AppProject et de l'Application.

**Où aller ensuite** — Le [chapitre 18](#chapitre-18) traite du cas où la release que vous venez de déployer se révèle défectueuse.

<a id="chapitre-18"></a>

## 18. Rollback

> **En une phrase** — Un rollback rétablit une version applicative compatible ; il ne défait pas automatiquement le schéma ou les données.

**Ce que vous saurez faire à la fin de ce chapitre**

1. Dire précisément ce qu'un rollback fait, et ce qu'il ne fait pas.
2. Exécuter un retour arrière GitOps par `git revert`, en conservant l'historique.
3. Choisir entre retour arrière applicatif, restauration de données et correction en avant.
4. Employer le retour arrière d'urgence en connaissant sa dette : un écart hors Git à régulariser.
5. Anticiper, dès l'écriture d'une migration, la possibilité d'un retour arrière.

**Prérequis** — [chapitres 10](#chapitre-10), [13](#chapitre-13) et [17](#chapitre-17) · **Lecture** — 5 min · **Nature** — runbook

<a id="section-18-1"></a>

### 18.1 Ce qu'un rollback fait, et ce qu'il ne fait pas

Un **rollback** (retour arrière) rétablit la **version précédente du code et de la configuration**. Il ne rétablit pas les données.

| Élément | Rétabli par un rollback GitOps ? |
|---|---|
| Images backend et frontend | **Oui** : anciens digests |
| ConfigMap, Ingress, NetworkPolicies décrits dans GitOps | **Oui** |
| Schéma de la base | **Non** : une migration n'est jamais défaite par le retour du code |
| Données de la base | **Non** : restauration nécessaire ([chapitre 19](#chapitre-19)) |
| Médias | **Non** |
| Secrets | **Non** : hors GitOps |

À conserver pour qu'un retour soit possible : SHA source, les deux digests, commit GitOps, lock, SBOM, rapports Trivy, version du schéma, sauvegardes, et les **anciennes images dans Harbor** (attention à la rétention).

<a id="section-18-2"></a>

### 18.2 Le rollback GitOps

```text
Nouvelle version
      │
      ▼
Incident
      │
      ▼
git revert (commit de promotion)
      │
      ▼
MR approuvée
      │
      ▼
Argo CD : diff puis sync
      │
      ▼
Ancienne version
```

> **Analogie** — `git revert` n'efface pas l'erreur de l'historique : il écrit une nouvelle page qui annule la précédente. L'historique reste complet et lisible.

<a id="section-18-3"></a>

### 18.3 Décider du type de retour

```text
Incident après une release
         │
         ▼
La release a-t-elle exécuté une migration ?
         │
     ┌───┴─────────────┐
    NON               OUI
     │                 │
     │                 ▼
     │     Le schéma reste-t-il compatible avec l'ancien code ?
     │                 │
     │         ┌───────┴───────┐
     │        OUI             NON
     │         │               │
     ▼         ▼               ▼
  Rollback GitOps          Arrêt planifié, restauration testée
  (18.4)                   en base isolée, puis bascule décidée
```

> **Attention** — Ne jamais lancer aveuglément une migration **inverse** (`migrate <app> <migration précédente>`). Elle peut détruire des colonnes et leurs données.

<a id="section-18-4"></a>

### 18.4 Procédure de rollback GitOps

<a id="etape-r1--identifier-le-commit-a-annuler"></a>

#### Étape R.1 — Identifier le commit à annuler

**OBJECTIF** — Retrouver le commit de promotion fautif et la version stable précédente.

**COMMANDE**

```bash
# LECTURE dans le dépôt GitOps
cd "$GITOPS_DIR"
git switch main
git pull --ff-only origin main
git log --oneline -10
argocd app history facturadj-preprod
```

**EXPLICATION** — `argocd app history` associe chaque synchronisation à une révision Git.

**RÉSULTAT ATTENDU** — Le commit `preprod: promotion sha-<SHA fautif>` en tête, et la révision précédente dans l'historique Argo CD.

**VÉRIFICATION** — Les digests de la version précédente existent toujours dans Harbor.

**ERREUR POSSIBLE** — Images précédentes purgées par la rétention : le retour exige de reconstruire l'ancien commit, avec de **nouveaux** digests.

<a id="etape-r2--preparer-le-revert"></a>

#### Étape R.2 — Préparer le revert

**OBJECTIF** — Créer un commit qui rétablit les deux anciens digests.

**COMMANDE**

```bash
# MODIFICATION LOCALE
read -r -p 'Commit GitOps de promotion à annuler : ' PROMOTION_COMMIT
git switch -c "rollback/$(date -u +%Y%m%d-%H%M%S)"
# Vérifier le type du commit ; pour un merge commit, choisir son parent principal après revue.
git revert "$PROMOTION_COMMIT"
git diff HEAD~1 HEAD
# MODIFICATION DISTANTE, après revue : push de la branche puis MR
git push -u origin HEAD
```

**EXPLICATION** — Le revert restaure `kustomization.yaml` et `migrate.yaml` tels qu'ils étaient avant la promotion.

**RÉSULTAT ATTENDU** — Le diff restaure les digests et paramètres prévus, ainsi que le reçu. Ne pas exécuter le Job restauré par simple retour du fichier : le schéma courant doit d'abord être vérifié.

**VÉRIFICATION** — Revue et approbation de la MR, puis fusion.

**ERREUR POSSIBLE** — Conflit de revert : une autre modification a suivi la promotion ; résoudre en revue, ne pas forcer.

<a id="etape-r3--appliquer-le-retour"></a>

#### Étape R.3 — Appliquer le retour

**OBJECTIF** — Synchroniser la révision annulée, sur décision.

**COMMANDE**

```bash
# LECTURE
read -r -p 'SHA GitOps complet approuvé après fusion du rollback : ' GITOPS_REV
export GITOPS_REV
[[ "$GITOPS_REV" =~ ^[0-9a-f]{40}$ ]]
argocd app diff facturadj-preprod --revision "$GITOPS_REV"
# DÉPLOIEMENT décidé par vous
argocd app sync facturadj-preprod --revision "$GITOPS_REV"
# LECTURE
argocd app wait facturadj-preprod --sync --health --timeout 300
```

**EXPLICATION** — Le diff doit montrer le retour aux anciens digests.

**RÉSULTAT ATTENDU** — `Synced` et `Healthy` ; Pods sur les anciens digests.

**VÉRIFICATION** — Phase 10 du [chapitre 17](#chapitre-17) ; consigner le rollback dans le journal.

**ERREUR POSSIBLE** — Erreurs de base après retour : le schéma n'est pas compatible avec l'ancien code ; basculer sur la branche « NON » de [18.3](#section-18-3).

<a id="section-18-5"></a>

### 18.5 Le rollback d'urgence

Si l'incident est grave et que la MR de revert ne peut pas être fusionnée immédiatement :

```bash
# DÉPLOIEMENT D'URGENCE : revient au ReplicaSet précédent, HORS Git
kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod rollout undo deploy/facturadj-backend
kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod rollout undo deploy/facturadj-frontend
kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod rollout status deploy/facturadj-backend
```

Conséquences :

- Argo CD affiche `OutOfSync` : le cluster ne correspond plus à Git ;
- avec la stratégie `Recreate` et un seul réplica, le retour provoque une courte coupure ;
- **toute synchronisation ultérieure réappliquera la version fautive** tant que le revert Git n'est pas fusionné.

`argocd app rollback facturadj-preprod <id>` a le même défaut : il applique une ancienne révision sans modifier Git. Ces deux commandes servent uniquement à **gagner du temps** ; le revert Git ([18.4](#section-18-4)) doit suivre immédiatement.

> **Note** — Dans une configuration avec auto-réparation (`selfHeal`), comme dans l'étude d'août, Argo CD annulerait lui-même un `rollout undo` en quelques minutes. Ce n'est pas le cas en PREPROD, où l'écart reste visible jusqu'à la décision suivante.

<a id="section-18-6"></a>

### 18.6 Les migrations et le retour arrière

La règle qui rend le rollback possible : **toute migration doit rester compatible avec le code précédent** (stratégie expand/contract, [13.5](#section-13-5)).

| Type de changement | Compatible avec l'ancien code ? | Rollback par revert |
|---|---|---|
| Ajout d'une table ou d'une colonne nullable | Oui | Possible |
| Ajout d'un index | Oui | Possible |
| Ajout d'une colonne `NOT NULL` sans valeur par défaut | Non | Arrêt planifié |
| Renommage ou suppression de colonne | Non | Arrêt planifié |
| Modification du type d'une colonne | Souvent non | Arrêt planifié |

Avant toute migration : `pg_dump -Fc`, sauvegarde du volume des médias, et test de restauration dans une base isolée. Une sauvegarde qui n'existe que sur le VPS ne protège pas de sa perte : prévoir une copie externe chiffrée.
<a id="mise-en-pratique--chapitre-18"></a>

### Mise en pratique — chapitre 18

**Décider entre rollback et restauration.** Une régression de code sans perte de données appelle d'abord un retour applicatif compatible. Une suppression de factures ne se répare pas en revenant à l'ancien conteneur. **Exercice :** identifier ce qui a changé : image, configuration, schéma ou données ; choisir ensuite le runbook correspondant.

<a id="synthese-du-chapitre-18"></a>

#### Synthèse du chapitre 18

**À retenir**

- Un rollback ramène **le code et la configuration**, jamais les données. Une migration exécutée reste exécutée.
- La voie normale est un `git revert` du commit de promotion, dans une branche `rollback/...`, relue et fusionnée par Merge Request, puis synchronisée. L'historique est conservé : on sait qu'il y a eu un incident.
- Le retour arrière d'urgence (`rollout undo`) agit **hors Git**. Comme il n'y a pas de `selfHeal`, l'écart reste visible : il faut ensuite fusionner le revert pour réaligner le plan et le terrain.
- Le retour arrière n'est possible que si les anciens digests sont toujours dans Harbor : la politique de rétention et la procédure de rollback se pensent ensemble.

**Les pièges classiques**

| Le piège | Pourquoi on tombe dedans | Le bon réflexe |
|---|---|---|
| Croire qu'un rollback répare des données corrompues | Le service redevient fonctionnel | Il ne restaure rien. Les données relèvent du [chapitre 19](#chapitre-19) |
| Utiliser `rollout undo` et s'arrêter là | L'incident est résolu, on passe à autre chose | L'état réel diffère de Git. Sans régularisation, la prochaine synchronisation ramènera la version défectueuse |
| Réécrire l'historique GitOps plutôt que le *revert* | Cela semble plus « propre » | On perd la trace de l'incident, et la Merge Request de retour n'est plus relisible |
| Lancer le rollback sans qualifier l'incident | L'urgence pousse à agir | Conserver journaux et événements **avant** toute action corrective : ils disparaissent avec les Pods |

**Vérifiez votre compréhension**

1. Un rollback annule-t-il une migration de schéma ? *(→ [18.1](#section-18-1), [18.6](#section-18-6))*
2. Après un `rollout undo` d'urgence, que reste-t-il à faire ? *(→ [18.5](#section-18-5))*
3. Quelle condition externe doit être remplie pour qu'un rollback soit possible ? *(→ [18.3](#section-18-3), [7.5](#section-7-5))*

> **Réponses** — **1.** Non. Le schéma reste dans son nouvel état ; c'est pourquoi toute migration doit rester compatible avec le code précédent. **2.** Fusionner le `git revert` correspondant pour réaligner Git et le cluster, puis compléter le journal de release. **3.** Les anciens digests doivent toujours être présents dans Harbor : la politique de rétention doit conserver assez de versions.

**Où aller ensuite** — Le [chapitre 19](#chapitre-19) traite du seul filet qui protège réellement les données.

<a id="chapitre-19"></a>

## 19. Sauvegarde et PRA

> **En une phrase** — La reprise exige un ensemble de sauvegardes cohérent, récupérable hors de l'hôte et restauré avec succès.

**Ce que vous saurez faire à la fin de ce chapitre**

1. Définir RPO et RTO, et donner les valeurs réelles de la PREPROD aujourd'hui.
2. Lister ce qui doit être sauvegardé — et ce qui ne le doit pas, parce qu'il est reconstructible.
3. Produire une sauvegarde complète : base, médias, historique GitOps, empreintes, chiffrement, copie externe.
4. Restaurer, puis vérifier la cohérence de ce qui a été restauré.
5. Dérouler un scénario de catastrophe de bout en bout.

**Prérequis** — [chapitres 12](#chapitre-12) et [13](#chapitre-13) · **Lecture** — 12 min · **Nature** — runbook

<a id="section-19-1"></a>

### 19.1 RPO et RTO

Deux indicateurs fixent les objectifs de toute stratégie de reprise :

- **RPO** (*Recovery Point Objective*) : la quantité maximale de données que l'on accepte de perdre, exprimée en temps. Une sauvegarde quotidienne donne un RPO de 24 heures.
- **RTO** (*Recovery Time Objective*) : la durée maximale d'interruption acceptable avant le retour du service.

> **Analogie** — Le RPO répond à « combien de pages du registre puis-je perdre ? » ; le RTO à « combien de temps la boutique peut-elle rester fermée ? ».

```text
 dernière sauvegarde      incident                 service rétabli
     │                       │                         │
─────●───────────────────────X─────────────────────────●──────► temps
     └──────── RPO ─────────┘ └───────── RTO ──────────┘
     données perdues          service interrompu
```

Un **PRA** (plan de reprise d'activité, *Disaster Recovery Plan*) décrit comment remettre le service en marche après un sinistre majeur, dans les délais du RTO et avec une perte limitée au RPO.

> **À retenir** — Ces objectifs ne valent que si la restauration est **testée**. Une sauvegarde jamais restaurée n'est pas une preuve de capacité de reprise.

<a id="section-19-2"></a>

### 19.2 Quoi sauvegarder

| Objet | Contenu | Méthode | Criticité |
|---|---|---|---|
| **Base PostgreSQL** | Toutes les données métier | `pg_dump -Fc` ([13.6](#section-13-6)) | Critique |
| **Médias** | Fichiers téléversés et générés (PVC `facturadj-media`) | Archive `tar` depuis le Pod backend | Élevée |
| **Dépôt GitOps** | État souhaité du cluster, historique des promotions | GitLab + clone d'administration + `git bundle` | Élevée |
| **Code source** | Application et infrastructure | GitHub et miroir GitLab | Élevée (déjà doublé) |
| **Images** | Versions déployables | Harbor, avec rétention maîtrisée | Moyenne : reconstructibles depuis un SHA, avec de nouveaux digests |
| **Reçus de release** | `digests.json`, rapports Trivy, SBOM, `.image.json` | Archive par release ([17.14](#section-17-14)) | Moyenne |
| **Secrets** | Fichiers de `~/nexora-secrets` | Copie chiffrée hors ligne ou gestionnaire de secrets | Critique |
| **Description du cluster** | Versions de k3d, k3s, Traefik, Argo CD ; options de création du cluster | Journal d'exploitation | Élevée pour le PRA |

Ce qui n'est **pas** sauvegardé, volontairement : Redis (cache reconstitué au démarrage), les volumes `emptyDir`, les journaux de la PREPROD.

<a id="section-19-3"></a>

### 19.3 Où, à quelle fréquence, combien de temps

**La règle 3-2-1** : au moins **3** copies des données, sur **2** supports différents, dont **1** hors du site.

| Objet | Fréquence proposée | Rétention proposée | Emplacements |
|---|---|---|---|
| Base PostgreSQL | Avant chaque migration ; quotidienne une fois des données de recette réelles présentes | 14 jours glissants + une par release | VPS (`~/nexora-backups`) + copie externe chiffrée |
| Médias | Avant chaque release qui les concerne ; hebdomadaire | 4 semaines | Idem |
| Dépôt GitOps | À chaque promotion (`git bundle`) | Illimitée | GitLab + clone + bundle externe |
| Reçus de release | À chaque release | Illimitée | Archive externe |
| Secrets | À chaque création ou rotation | Versions en vigueur et précédente | Hors ligne, chiffré |

> **À valider** — Aucune sauvegarde n'est automatisée en PREPROD, et aucun emplacement externe n'est désigné dans les sources. Choisir l'hôte ou le stockage de sauvegarde, la fréquence et la rétention, puis automatiser (tâche planifiée sur la machine d'administration) et superviser l'âge de la dernière sauvegarde réussie.

**Chiffrement et cloisonnement.**

- Chiffrer toute copie qui quitte le VPS.
- Utiliser, pour l'emplacement de sauvegarde, des **identifiants distincts** de ceux de l'application : un attaquant qui compromet l'application ne doit pas pouvoir effacer les sauvegardes.
- En production, activer le versionnement et le **verrouillage d'objet** (*object lock*) sur le stockage de sauvegarde : une copie ne peut pas être supprimée avant sa date de rétention, même par un administrateur.

<a id="section-19-4"></a>

### 19.4 Sauvegarder

**But :** constituer un ensemble de reprise cohérent et vérifié. La base, les médias, le code et la configuration doivent pouvoir être remis en service ensemble.

**Préconditions :** machine d'administration de confiance, place disponible, `KUBE_CONTEXT` et `GITOPS_DIR` vérifiés, destination externe désignée. Définir une fenêtre sans écritures si la cohérence base/médias l'exige ; arrêter les tâches de fond qui modifient les documents. Laisser le Pod backend disponible le temps de lire son volume.

1. Exécuter [13.6.1 et 13.6.2](#section-13-6), puis garder `BACKUP_DIR`, `STAMP`, `DUMP` et le tableau Bash `K` dans ce terminal.
2. Capturer les médias et l'historique GitOps.
3. Contrôler les archives, chiffrer et copier hors de l'hôte.
4. Tester une restauration et consigner les preuves.

~~~bash
# SAUVEGARDE : médias et historique GitOps ; aucun fichier existant écrasé
(
  set -euo pipefail
  umask 077
  : "${BACKUP_DIR:?Exécuter au préalable 13.6}"
  : "${STAMP:?Horodatage de la sauvegarde requis}"
  : "${GITOPS_DIR:?Clone GitOps vérifié requis}"
  test "$(git -C "$GITOPS_DIR" rev-parse --is-shallow-repository)" = false
  test ! -e "$BACKUP_DIR/media-$STAMP.tar.gz"
  test ! -e "$BACKUP_DIR/media-$STAMP.tar.gz.partial"
  "${K[@]}" exec deploy/facturadj-backend -- \
    tar czf - -C /app/media . > "$BACKUP_DIR/media-$STAMP.tar.gz.partial"
  tar tzf "$BACKUP_DIR/media-$STAMP.tar.gz.partial" \
    > "$BACKUP_DIR/media-$STAMP.list"
  mv -- "$BACKUP_DIR/media-$STAMP.tar.gz.partial" "$BACKUP_DIR/media-$STAMP.tar.gz"
  test ! -e "$BACKUP_DIR/gitops-$STAMP.bundle"
  git -C "$GITOPS_DIR" bundle create "$BACKUP_DIR/gitops-$STAMP.bundle" --all
  git -C "$GITOPS_DIR" bundle verify "$BACKUP_DIR/gitops-$STAMP.bundle"
  (
    cd "$BACKUP_DIR"
    sha256sum "facturadj-$STAMP.dump" "media-$STAMP.tar.gz" \
      "gitops-$STAMP.bundle" > "sauvegarde-$STAMP.sha256"
    sha256sum -c "sauvegarde-$STAMP.sha256"
  )
)
~~~

**Attendu :** tous les contrôles réussissent. Le catalogue `tar` peut ne contenir que le dossier racine si les médias sont vides. Le bundle contient les références présentes dans le clone ; il ne remplace pas la sauvegarde des images Harbor, des secrets ou des fichiers non suivis par Git.

**Compléments au dossier de reprise :** inventaire des rôles et droits PostgreSQL, paramètres non présents dans le dump, extensions, images par digest, reçus de release, versions du cluster et procédure de récupération des secrets. `pg_dump` ne sauvegarde pas les rôles globaux ; documenter leur recréation ou conserver un export administratif adapté et protégé.

**Chiffrer puis transférer** :

~~~bash
# MODIFICATION LOCALE : GPG demande la phrase de passe dans le terminal
(
  set -euo pipefail
  for f in "facturadj-$STAMP.dump" "media-$STAMP.tar.gz" "gitops-$STAMP.bundle"; do
    test ! -e "$BACKUP_DIR/$f.gpg"
    gpg --symmetric --cipher-algo AES256 \
      --output "$BACKUP_DIR/$f.gpg" "$BACKUP_DIR/$f"
  done
  (
    cd "$BACKUP_DIR"
    sha256sum "facturadj-$STAMP.dump.gpg" "media-$STAMP.tar.gz.gpg" \
      "gitops-$STAMP.bundle.gpg" > "chiffres-$STAMP.sha256"
  )
)
~~~

~~~bash
# COPIE EXTERNE : destination complète de type alias-ssh:chemin-de-sauvegarde/
read -r -p 'Destination externe de sauvegarde validée : ' BACKUP_DEST
scp "$BACKUP_DIR/facturadj-$STAMP.dump.gpg" \
    "$BACKUP_DIR/media-$STAMP.tar.gz.gpg" \
    "$BACKUP_DIR/gitops-$STAMP.bundle.gpg" \
    "$BACKUP_DIR/sauvegarde-$STAMP.sha256" \
    "$BACKUP_DIR/chiffres-$STAMP.sha256" "$BACKUP_DEST"
~~~

**Vérification distante :** recalculer les empreintes des fichiers chiffrés sur la destination, puis tester régulièrement le téléchargement et le déchiffrement. Une sortie `scp` réussie ne prouve pas la restaurabilité.

**Clôture :** inscrire la sauvegarde dans le registre, indiquer son instant de cohérence, son lieu externe et le dernier test de restauration. Garder la clé de déchiffrement dans un emplacement de confiance distinct des archives.

<a id="section-19-5"></a>

### 19.5 Restaurer

**Précondition :** incident qualifié ou exercice planifié, sauvegarde choisie, perte acceptable déterminée, environnement de destination identifié. Pour un exercice, toute modification vise une cible isolée.

<a id="section-19-5-1"></a>

#### 19.5.1 Récupérer et vérifier l'ensemble

Copier les trois fichiers chiffrés et leurs deux manifestes d'empreintes dans un **nouveau dossier local protégé**. Définir `BACKUP_DIR` sur ce dossier et `STAMP` sur l'horodatage de la sauvegarde choisie.

~~~bash
# RESTAURATION LOCALE : déchiffrer TOUS les fichiers avant le contrôle global
(
  set -euo pipefail
  umask 077
  : "${BACKUP_DIR:?Dossier local de restauration requis}"
  : "${STAMP:?Horodatage de la sauvegarde choisie requis}"
  cd "$BACKUP_DIR"
  sha256sum -c "chiffres-$STAMP.sha256"
  for f in "facturadj-$STAMP.dump" "media-$STAMP.tar.gz" "gitops-$STAMP.bundle"; do
    test ! -e "$f"
    gpg --decrypt --output "$f" "$f.gpg"
  done
  sha256sum -c "sauvegarde-$STAMP.sha256"
)
~~~

**Attendu :** tous les fichiers déchiffrés et toutes les empreintes valides. Ne pas déchiffrer uniquement le dump puis contrôler un manifeste qui référence aussi les médias et le bundle.

<a id="section-19-5-2"></a>

#### 19.5.2 Récupérer la configuration et les images

Cloner le bundle dans un dossier neuf, puis choisir la révision GitOps compatible avec la sauvegarde.

~~~bash
# MODIFICATION LOCALE : exemple de nouveau dossier de reconstruction
git clone "$BACKUP_DIR/gitops-$STAMP.bundle" facturadj-gitops-restaure
git -C facturadj-gitops-restaure log --oneline -10
~~~

Vérifier les digests dans Harbor et restaurer les accès au dépôt et à la registry. Une ancienne image supprimée ne peut pas être considérée comme récupérée par une simple reconstruction du même SHA : il faut les octets archivés ou une nouvelle release validée.

<a id="section-19-5-3"></a>

#### 19.5.3 Restaurer la base et les médias

- **Base :** utiliser [13.6.3](#section-13-6-3) pour l'exercice ou [13.6.4](#section-13-6-4) pour la reprise.
- **Médias :** restaurer d'abord dans un **volume vide de récupération** monté par un Pod prévu à cet effet. Le modèle ci-dessous suppose ce Pod créé, avec les mêmes UID/GID et droits de volume que le backend.
- **Secrets :** récupérer les valeurs correspondant à l'environnement et vérifier leur validité auprès des services concernés.

**Créer la cible média de récupération, si elle n'existe pas.** L'exemple suivant vise un cluster k3d de recette : nouveau PVC de 5 Gi, Pod temporaire sans serveur HTTP ni identifiants applicatifs. Prévoir davantage d'espace si nécessaire.

~~~bash
# PRÉPARATION LOCALE : noms uniques et image backend approuvée
RECOVERY_SUFFIX="$(date -u +%Y%m%d%H%M%S)"
RECOVERY_PVC="facturadj-media-restore-$RECOVERY_SUFFIX"
RECOVERY_POD="facturadj-media-restore-$RECOVERY_SUFFIX"
RECOVERY_MANIFEST="$BACKUP_DIR/media-recovery-$RECOVERY_SUFFIX.yaml"
read -r -p 'Image backend complète, par digest, pour la récupération : ' RECOVERY_IMAGE
export RECOVERY_PVC RECOVERY_POD RECOVERY_IMAGE RECOVERY_MANIFEST

python3 - <<'PY'
import os
import re
from pathlib import Path
import yaml

image = os.environ["RECOVERY_IMAGE"]
if not re.fullmatch(r"harbor\.nexora-djibouti\.fr/facturadj/backend@sha256:[0-9a-f]{64}", image):
    raise SystemExit("Référence backend par digest requise")
pvc_name, pod_name = os.environ["RECOVERY_PVC"], os.environ["RECOVERY_POD"]
pvc = {
    "apiVersion": "v1", "kind": "PersistentVolumeClaim",
    "metadata": {"name": pvc_name, "namespace": "facturadj-preprod"},
    "spec": {"accessModes": ["ReadWriteOnce"], "storageClassName": "local-path",
             "resources": {"requests": {"storage": "5Gi"}}},
}
pod = {
    "apiVersion": "v1", "kind": "Pod",
    "metadata": {"name": pod_name, "namespace": "facturadj-preprod",
                 "labels": {"app": "facturadj-media-recovery"}},
    "spec": {
        "restartPolicy": "Never", "automountServiceAccountToken": False,
        "securityContext": {"runAsNonRoot": True, "runAsUser": 10001,
                            "runAsGroup": 10001, "fsGroup": 10001,
                            "seccompProfile": {"type": "RuntimeDefault"}},
        "imagePullSecrets": [{"name": "harbor-pull"}],
        "containers": [{
            "name": "recovery", "image": image,
            "command": ["python", "-c", "import time; time.sleep(7200)"],
            "securityContext": {"allowPrivilegeEscalation": False,
                                "readOnlyRootFilesystem": True,
                                "capabilities": {"drop": ["ALL"]}},
            "resources": {"requests": {"cpu": "100m", "memory": "128Mi"},
                          "limits": {"cpu": "1", "memory": "512Mi"}},
            "volumeMounts": [{"name": "media", "mountPath": "/app/media"}],
        }],
        "volumes": [{"name": "media", "persistentVolumeClaim": {"claimName": pvc_name}}],
    },
}
with Path(os.environ["RECOVERY_MANIFEST"]).open("x", encoding="utf8") as output:
    yaml.safe_dump_all([pvc, pod], output, sort_keys=False)
print("Manifest de récupération créé ; le relire avant application.")
PY
~~~

Après revue du manifest et de la cible :

~~~bash
# DÉPLOIEMENT DE RÉCUPÉRATION : objets neufs, hors Application Argo CD
"${K[@]}" create -f "$RECOVERY_MANIFEST"
"${K[@]}" wait --for=condition=Ready "pod/$RECOVERY_POD" --timeout=300s
"${K[@]}" exec "$RECOVERY_POD" -- python -c \
  'from pathlib import Path; assert not any(Path("/app/media").iterdir()), "Volume non vide"'
~~~

**Attendu :** nouveau volume vide et Pod prêt. Le processus temporaire s'arrête après deux heures ; ne pas lancer l'extraction si le temps disponible est insuffisant.

Après extraction et validation, une reprise complète doit **raccorder le backend au volume restauré** : proposer dans GitOps le PVC conservé, l'ajouter aux ressources Kustomize et modifier `claimName` dans le Deployment backend. Relire le rendu et les règles d'affinité du stockage local, puis supprimer uniquement le Pod de récupération avant de remettre le backend en service. Conserver l'ancien PVC pour analyse et reprise. Pour un exercice, ne pas modifier la référence du backend en service.

~~~bash
# MODIFICATION DU VOLUME DE RÉCUPÉRATION : Pod et volume dédiés, accès public fermé
read -r -p 'Nom du Pod de récupération montant le volume média vide : ' RECOVERY_POD
tar tzf "$BACKUP_DIR/media-$STAMP.tar.gz"
"${K[@]}" exec -i "$RECOVERY_POD" -- \
  tar xzf - -C /app/media < "$BACKUP_DIR/media-$STAMP.tar.gz"
"${K[@]}" exec "$RECOVERY_POD" -- du -sh /app/media
~~~

**Avant extraction :** contrôler les chemins de l'archive et le montage exact du Pod. Ne pas extraire dans le volume utilisé par des applications encore actives. Une extraction par-dessus des fichiers existants conserve les fichiers absents de l'archive et peut produire un état incohérent.

La création et le raccordement se préparent selon le modèle ci-dessous ; le volume réel et les contraintes de placement doivent être vérifiés.

<a id="section-19-5-4"></a>

#### 19.5.4 Vérifier avant réouverture

**Validation technique :** bonne révision, bons digests, bonnes bases et volumes ; migrations cohérentes, sondes correctes, absence d'erreurs dans les journaux.

**Validation métier :** connexion, lecture de clients et factures, totaux, téléchargement de pièces, accès par rôle et création de documents fictifs dans le cadre de l'exercice. Vérifier la correspondance entre références documentaires en base et fichiers restaurés.

**Clôture :** noter le RPO réellement subi et le RTO mesuré. Rouvrir seulement après décision documentée. Conserver les données précédentes en quarantaine jusqu'à la fin de l'analyse.

<a id="section-19-6"></a>

### 19.6 Tester la restauration

| Test | Fréquence proposée | Où | Critère de réussite |
|---|---|---|---|
| Restauration du dump dans une base isolée | Mensuelle | PREPROD | Comptages cohérents, numérotation intacte ([13.6](#section-13-6)) |
| Restauration des médias | Trimestrielle | PREPROD | Fichiers accessibles depuis l'application |
| Reconstruction complète de la PREPROD depuis Git, Harbor et les sauvegardes | Semestrielle | Cluster jetable | Application fonctionnelle dans le RTO visé |
| Déchiffrement d'une copie externe | Trimestrielle | Machine d'administration | Fichiers lisibles, empreintes valides |

**Journal de bord** à tenir dans le dépôt GitOps (par exemple `dr/journal.md`) :

| Date | Test | Résultat | Durée constatée | Correctif |
|---|---|---|---|---|
| AAAA-MM-JJ | Restauration isolée | OK / Échec | … min | … |

Les échecs consignés valent plus que les succès : ce sont eux qui transforment un plan théorique en capacité réelle. La reconstruction complète est le test que l'on saute le plus volontiers, et précisément celui qui prouve que l'infrastructure est reproductible.

<a id="section-19-7"></a>

### 19.7 Scénarios de catastrophe

<a id="scenario-1--suppression-accidentelle-de-donnees"></a>

#### Scénario 1 — Suppression accidentelle de données

*Un utilisateur supprime des factures.* Aucune redondance ne protège : il faut une sauvegarde antérieure.

1. Identifier l'heure de l'incident et la dernière sauvegarde antérieure.
2. Restaurer cette sauvegarde dans une **base isolée** (`facturadj_restore_test`), jamais à la place de la base en service.
3. Extraire les lignes manquantes et les réinjecter après validation fonctionnelle.
4. RPO effectif : âge de la sauvegarde. Aucune interruption de service.

<a id="scenario-2--migration-ratee"></a>

#### Scénario 2 — Migration ratée

1. Arrêter la promotion ; lire les journaux du Job ([20.3.11](#section-20-3-11)).
2. Si l'ancien code reste compatible : [rollback GitOps](#section-18-4).
3. Sinon : fermer l'accès, restaurer la sauvegarde **pré-migration** ([13.6](#section-13-6)), revenir à l'ancienne release, puis corriger la migration dans une nouvelle release.

<a id="scenario-3--perte-ou-corruption-du-volume-postgresql"></a>

#### Scénario 3 — Perte ou corruption du volume PostgreSQL

1. Constater : Pod `facturadj-postgres-0` en erreur, journaux signalant des fichiers corrompus ou un volume absent.
2. Fermer l'accès public.
3. Si le volume est irrécupérable : supprimer **délibérément** le PVC `data-facturadj-postgres-0` après avoir conservé toute trace utile, laisser le StatefulSet recréer une base vide, puis restaurer le dernier dump.
4. Restaurer les médias si le même disque est touché.
5. RPO : dernière sauvegarde. RTO : de l'ordre de l'heure.

<a id="scenario-4--perte-du-vps"></a>

#### Scénario 4 — Perte du VPS

1. Provisionner un nouveau serveur ; installer Docker, k3d et Argo CD **dans les versions consignées**.
2. Recréer le cluster avec les **mêmes options** (ports publiés, désactivations éventuelles) : ces options doivent être documentées dès aujourd'hui.
3. Bootstrap ([17.11](#section-17-11)) : namespace, Secrets reconstitués depuis la copie chiffrée, `harbor-pull`, accès GitOps, Application.
4. Synchroniser : PostgreSQL démarre vide.
5. Restaurer la base et les médias depuis la copie **externe**.
6. Mettre à jour le DNS (TTL abaissé à l'avance si possible) ; vérifier ([17.14](#section-17-14)).
7. RPO : dernière copie externe. RTO : quelques heures, si les versions et options sont documentées.

<a id="scenario-5--compromission"></a>

#### Scénario 5 — Compromission

1. **Isoler** : couper l'accès public sans détruire les preuves.
2. **Conserver les traces** avant toute remise en service : événements, journaux, description des ressources, journal d'audit Harbor et GitLab.
3. **Reconstruire un environnement neuf** : ne jamais réutiliser un serveur compromis.
4. Restaurer la base à un état **antérieur** à la compromission.
5. **Faire tourner tous les secrets**, sans exception : Django, PostgreSQL, robots Harbor, accès GitOps, certificats, jetons GitLab et GitHub.
6. Reconstruire les images à partir d'un commit Git **vérifié**.

Les identifiants de sauvegarde distincts et les copies hors ligne rendent ce scénario survivable.

<a id="scenario-6--perte-de-harbor"></a>

#### Scénario 6 — Perte de Harbor

- Les Pods en service continuent de tourner tant qu'ils ne sont pas recréés sur un nœud sans les images en cache.
- Reconstruire les images depuis le SHA de la release en service : les digests seront **nouveaux**, d'où une nouvelle promotion GitOps.
- Recréer projet, robots et politiques ; mettre à jour `harbor-pull`.

<a id="scenario-7--perte-de-gitlab"></a>

#### Scénario 7 — Perte de GitLab

- Aucun déploiement possible ; le service en place n'est pas affecté.
- Recréer le dépôt GitOps à partir du clone d'administration ou du `git bundle`.
- Mettre à jour `repoURL` et `sourceRepos` dans le manifest Argo CD et l'accès du dépôt (`argocd repo add`).

<a id="section-19-8"></a>

### 19.8 Cible PROD : archivage continu et restauration à un instant donné

> **Cible PROD** — Synthèse de l'étude d'août, adaptée à Kubernetes standard.

**Objectifs par profil :**

| Profil | RPO | RTO |
|---|---|---|
| Économique | ~5 min (WAL) ; 24 h en cas de perte totale du site | 2 à 4 h |
| Production | **0** sur perte de nœud ; ~5 min sur perte de site | 1 à 2 h |
| HA avancée | 0 | 15 à 30 min |

**Ce qui serait sauvegardé :**

| Objet | Méthode | Fréquence | Rétention | Hors cluster |
|---|---|---|---|---|
| PostgreSQL | CloudNativePG : WAL continu et sauvegarde complète | Continu ; quotidien | 30 j | Oui, S3 d'un autre fournisseur |
| Documents | Versionnement et réplication rclone | Continu ; hebdomadaire | Illimitée | Oui, second fournisseur |
| Manifests | Dépôt GitOps | Chaque commit | Illimitée | Oui |
| Secrets | Export chiffré du coffre | Quotidien | 30 j | Oui, hors ligne |
| Images | Registry | Chaque livraison | 90 j | Oui |

**Deux mécanismes complémentaires pour PostgreSQL :**

- l'**archivage WAL continu** envoie chaque segment du journal de transactions vers S3 dès sa clôture : c'est ce qui donne le RPO d'environ 5 minutes et permet la **restauration à un instant donné** (PITR) ;
- la **sauvegarde complète quotidienne** accélère la restauration en évitant de rejouer 30 jours de WAL.

**Restauration à un instant donné, à côté de la production :**

```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata: {name: facturadj-pitr, namespace: facturadj-prod}
spec:
  instances: 1
  storage: {size: 50Gi}
  bootstrap:
    recovery:
      source: facturadj-db
      recoveryTarget: {targetTime: "2026-08-23 09:10:00+03"}   # AVANT l'incident
  externalClusters:
    - name: facturadj-db
      barmanObjectStore:
        destinationPath: s3://facturadj-backups/postgres
        endpointURL: https://s3.fr-par.scw.cloud
        s3Credentials:
          accessKeyId: {name: facturadj-backup-s3, key: ACCESS_KEY_ID}
          secretAccessKey: {name: facturadj-backup-s3, key: SECRET_ACCESS_KEY}
```

La base restaurée est créée **à côté** de la production, jamais à sa place : on en extrait les lignes manquantes. La production continue de tourner pendant l'opération (RTO de 20 à 40 min).

**Alerte indispensable** : aucune sauvegarde réussie depuis 48 h. Sans elle, une sauvegarde silencieusement cassée se découvre le jour de la restauration.

**Tests proposés** : PITR d'une table chaque mois en préproduction, restauration complète chaque trimestre, reconstruction complète chaque semestre sur un cluster jetable (application accessible en moins de 4 h), bascule de base chaque trimestre en fenêtre planifiée (moins de 60 s d'erreurs). Chaque test contrôle aussi la table `core_sequencenumerotation`.
<a id="mise-en-pratique--chapitre-19"></a>

### Mise en pratique — chapitre 19

**Mesurer le RPO et le RTO.** Exemple fictif : dernier point récupérable à 10 h 00, incident à 10 h 30, service validé à 11 h 15. La perte potentielle couvre 30 minutes ; le rétablissement dure 45 minutes depuis l'incident. **Contrôle :** utiliser les horodatages réels, préciser le début de mesure et comparer aux objectifs approuvés.

<a id="synthese-du-chapitre-19"></a>

#### Synthèse du chapitre 19

**À retenir**

- **RPO** = quantité de données que l'on accepte de perdre ; **RTO** = temps que l'on accepte d'être arrêté. En PREPROD, le RPO est l'âge de la dernière sauvegarde manuelle.
- Quatre objets à sauvegarder : la base, les médias, l'historique du dépôt GitOps (en *bundle*), et les empreintes qui prouvent l'intégrité de l'ensemble.
- Une sauvegarde qui ne quitte pas le VPS ne protège pas de la perte du VPS. La copie externe est chiffrée, et la phrase de passe n'est jamais passée en argument de commande.
- Le test de restauration est une tâche **périodique**, pas un exercice ponctuel : il figure dans les tâches mensuelles ([21.4](#section-21-4)).
- Les images n'ont pas besoin d'être sauvegardées tant que Harbor les conserve — mais la politique de rétention doit être cohérente avec cette hypothèse.

**Les pièges classiques**

| Le piège | Pourquoi on tombe dedans | Le bon réflexe |
|---|---|---|
| Sauvegarder sans jamais restaurer | La sauvegarde « réussit » chaque fois | Restaurer mensuellement dans une base isolée, et contrôler la numérotation |
| Laisser la sauvegarde sur le VPS | C'est là qu'elle est produite | Copier vers un emplacement externe chiffré. Sinon, un seul incident emporte les données **et** leur copie |
| Passer la phrase de passe en argument | C'est plus rapide qu'une saisie interactive | Elle apparaîtrait dans l'historique du shell et dans la liste des processus |
| Oublier le dépôt GitOps | On ne pense qu'aux données | Sans lui, on sait quoi restaurer mais plus **comment** redéployer. Le *bundle* Git tient dans un fichier |

**Vérifiez votre compréhension**

1. Quelle est la différence entre RPO et RTO, et lequel dépend de la fréquence des sauvegardes ? *(→ [19.1](#section-19-1))*
2. Pourquoi sauvegarder l'historique du dépôt GitOps ? *(→ [19.2](#section-19-2), [19.4](#section-19-4))*
3. À quelle fréquence faut-il tester une restauration, et où ? *(→ [19.6](#section-19-6), [21.4](#section-21-4))*

> **Réponses** — **1.** Le RPO mesure la perte de données acceptable, le RTO la durée d'interruption acceptable. C'est le RPO qui dépend de la fréquence des sauvegardes. **2.** Parce qu'il contient l'état souhaité du cluster : sans lui, on possède les données mais plus la description de l'infrastructure à reconstruire. **3.** Mensuellement, dans une base isolée temporaire, jamais dans `facturadj`.

**Où aller ensuite** — Le [chapitre 20](#chapitre-20) part du symptôme observé plutôt que de la cause supposée.

<a id="chapitre-20"></a>

## 20. Dépannage par symptômes

> **En une phrase** — Le dépannage progresse par couches et hypothèses vérifiées, en conservant les preuves avant d'intervenir.

**Ce que vous saurez faire à la fin de ce chapitre**

1. Appliquer la méthode de l'extérieur vers l'intérieur : DNS, TLS, Ingress, Service, Pod, journaux, dépendances.
2. Adopter les réflexes de base avant toute investigation, à commencer par la vérification du contexte.
3. Utiliser les fiches par symptôme sans les lire toutes.
4. Conserver les preuves avant toute action corrective.
5. Décider entre correction, retour arrière et restauration.

**Prérequis** — [chapitres 9](#chapitre-09) à [16](#chapitre-16) · **Lecture** — 15 min · **Nature** — runbook et référence

<a id="section-20-1"></a>

### 20.1 La méthode : de l'extérieur vers l'intérieur

Suivre le chemin de la requête, couche par couche, et s'arrêter à la première couche en défaut.

```text
L'application ne répond pas
    │
    ▼
Vérifier DNS
    │
    ▼
Vérifier Traefik
    │
    ▼
Vérifier Service
    │
    ▼
Vérifier Pods
    │
    ▼
Vérifier logs
```

<a id="section-20-2"></a>

### 20.2 Les réflexes

- **Toujours préciser le contexte et le namespace.** Une commande sur le mauvais cluster aggrave l'incident.
- **Lire avant d'agir** : `describe`, événements, journaux. Les événements disent presque toujours pourquoi.
- **Ne pas redémarrer à l'aveugle** : un redémarrage efface les journaux du conteneur et masque la cause.
- **Ne jamais supprimer un Secret, un PVC ou le namespace pour « repartir propre ».**
- **Conserver les traces** d'un incident avant de le corriger.
- **Ne pas reprendre une commande de l'étude OKD** (`oc`, `hcloud`, `tofu`) pour dépanner la PREPROD k3d.
- **Toute correction manuelle dans le cluster est suivie d'un réalignement dans Git.**

Dans ce chapitre :

```bash
K=(kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod)
DOMAINE="preprod.<domaine>"
```

<a id="section-20-3"></a>

### 20.3 Fiches par symptôme

<a id="section-20-3-1"></a>

#### 20.3.1 L'application ne répond pas

**Symptôme** — Le navigateur tourne sans fin ou affiche « délai dépassé ».

```bash
# 1. DNS : le nom pointe-t-il vers le VPS ?
dig +short "$DOMAINE"
# 2. VPS et Traefik : le port 443 répond-il ?
curl -svo /dev/null "https://$DOMAINE/healthz" 2>&1 | grep -E 'Connected|SSL|HTTP/'
kubectl --context "$KUBE_CONTEXT" -n kube-system get pods -l app.kubernetes.io/name=traefik
# 3. Service : a-t-il des destinations prêtes ?
"${K[@]}" get endpointslices -l kubernetes.io/service-name=facturadj-frontend
# 4. Pods
"${K[@]}" get pods
# 5. Journaux
"${K[@]}" logs deploy/facturadj-frontend --tail=100
```

| Constat | Cause probable | Action |
|---|---|---|
| `dig` ne renvoie rien ou une autre IP | DNS absent ou erroné | Corriger l'enregistrement, attendre le TTL |
| Pas de `Connected` | VPS éteint, pare-feu, port non publié par k3d | Vérifier le VPS, `docker ps` (ports du `serverlb`) |
| Traefik absent ou en erreur | Problème k3s | `kubectl -n kube-system describe pod ...` |
| Aucune destination dans l'EndpointSlice | Pods non prêts | [20.3.7](#section-20-3-7) |

<a id="section-20-3-2"></a>

#### 20.3.2 Erreur 404 ou 503 renvoyée par Traefik

**Symptôme** — Page `404 page not found` ou `503 Service Unavailable` très courte, sans mise en forme applicative.

| Code | Signification côté Traefik | Causes fréquentes |
|---|---|---|
| **404** | Aucune règle ne correspond à la requête | Hôte de l'Ingress différent du nom appelé, Ingress absent, accès en HTTP alors que l'Ingress n'écoute qu'en `websecure`, `ingressClassName` erroné |
| **503** | La règle existe mais aucune destination n'est prête | Pods frontend non prêts, souvent parce que Django, PostgreSQL ou Redis est indisponible |

```bash
"${K[@]}" get ingress facturadj -o jsonpath='{.spec.rules[*].host}{"\n"}'
"${K[@]}" describe ingress facturadj
"${K[@]}" get endpointslices -l kubernetes.io/service-name=facturadj-frontend
kubectl --context "$KUBE_CONTEXT" -n kube-system logs deploy/traefik --tail=50
```

**Correction** — 404 : aligner l'hôte de l'Ingress (dans Git) sur le nom réellement utilisé. 503 : suivre la chaîne des sondes ([20.3.7](#section-20-3-7)).

<a id="section-20-3-3"></a>

#### 20.3.3 Erreur TLS ou certificat

**Symptôme** — Avertissement de sécurité du navigateur, `curl: (60) SSL certificate problem`.

```bash
echo | openssl s_client -connect "$DOMAINE:443" -servername "$DOMAINE" 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates
"${K[@]}" get secret facturadj-tls -o jsonpath='{.type}{"\n"}'
kubectl --context "$KUBE_CONTEXT" -n kube-system logs deploy/traefik --tail=100 | grep -i -E 'tls|certif'
```

| Constat | Cause | Action |
|---|---|---|
| Sujet « TRAEFIK DEFAULT CERT » | Secret `facturadj-tls` absent, invalide, ou hôte non couvert par le bloc `tls` | Vérifier le Secret et l'Ingress |
| `notAfter` dépassé | Certificat expiré | Renouveler ([11.5](#section-11-5)) |
| Nom différent | Certificat émis pour un autre domaine | Émettre le bon certificat |
| Chaîne incomplète | Certificat intermédiaire manquant dans `tls.crt` | Concaténer le certificat et la chaîne |

<a id="section-20-3-4"></a>

#### 20.3.4 ImagePullBackOff ou ErrImagePull

**Symptôme** — Pod en `ImagePullBackOff`.

```bash
"${K[@]}" describe pod <pod> | sed -n '/Events/,$p'
"${K[@]}" get secret harbor-pull -o jsonpath='{.type}{"\n"}'
"${K[@]}" get deploy facturadj-backend -o jsonpath='{.spec.template.spec.containers[0].image}{"\n"}'
```

| Message dans les événements | Cause | Action |
|---|---|---|
| `401 Unauthorized` | Secret `harbor-pull` absent du namespace, robot expiré | Recréer le Secret avec le robot de lecture ([17.11](#section-17-11)) |
| `403 Forbidden` | Robot sans droit sur le projet | Vérifier les permissions dans Harbor |
| `not found` / `manifest unknown` | Digest inexistant : faute de frappe, image purgée | Comparer au reçu `digests.json` ; vérifier la rétention |
| `x509: certificate` | Certificat Harbor non reconnu par le nœud | Réparer le certificat ou la CA ; jamais de registry non sécurisée |
| `toomanyrequests` (PostgreSQL, Redis) | Quota Docker Hub | Attendre, s'authentifier ou utiliser un proxy cache Harbor |

<a id="section-20-3-5"></a>

#### 20.3.5 CrashLoopBackOff

**Symptôme** — Pod qui redémarre en boucle, `RESTARTS` qui augmente.

```bash
"${K[@]}" logs <pod> --previous --tail=100
"${K[@]}" describe pod <pod> | grep -A5 'Last State'
```

| Journal ou état | Cause | Action |
|---|---|---|
| `DJANGO_SECRET_KEY obligatoire` (ou autre variable) | Variable absente du Secret ou de la ConfigMap | Vérifier la présence des clés sans publier leurs valeurs |
| `ImproperlyConfigured: L'image exige DATABASE_URL PostgreSQL.` | `DATABASE_URL` absente ou ne commençant pas par `postgres://` ou `postgresql://` | Corriger le Secret |
| `ImproperlyConfigured: L'image exige REDIS_URL ...` | `REDIS_URL` absente | Corriger la ConfigMap |
| `DEBUG interdit` | `DJANGO_DEBUG` différent de `0` | Remettre `0` |
| `Reason: OOMKilled` | Limite mémoire dépassée | Examiner la charge ; ajuster la limite dans Git |
| `Read-only file system` | L'application écrit hors `/tmp` ou `/app/media` | Corriger le code ou ajouter un volume dédié, jamais désactiver la lecture seule |
| `Cannot find package '@astrojs/node'` | Adaptateur élagué en dépendance de développement | Le placer dans `dependencies`, reconstruire |

<a id="section-20-3-6"></a>

#### 20.3.6 Pod en Pending

**Symptôme** — Pod bloqué en `Pending`.

```bash
"${K[@]}" describe pod <pod> | sed -n '/Events/,$p'
"${K[@]}" get pvc
"${K[@]}" describe pvc <pvc>
kubectl --context "$KUBE_CONTEXT" -n kube-system logs deploy/local-path-provisioner --tail=50
kubectl --context "$KUBE_CONTEXT" describe node | grep -A8 'Allocated resources'
```

| Événement | Cause | Action |
|---|---|---|
| `FailedScheduling ... Insufficient memory` (ou `cpu`) | Requests supérieures à la capacité libre | Libérer des ressources ou ajuster les requests |
| `waiting for first consumer` | Normal pour `local-path` tant que le Pod n'est pas planifié | Regarder la cause de planification du Pod |
| PVC en `Pending` avec erreur du provisioner | `local-path-provisioner` en échec, disque plein | Journaux du provisioner, espace disque du VPS |
| Aucun Pod créé, événement `FailedCreate` sur le ReplicaSet | Refus Pod Security | `"${K[@]}" describe rs <replicaset>` ; corriger le `securityContext` |

<a id="section-20-3-7"></a>

#### 20.3.7 Pod Running mais pas prêt

**Symptôme** — `READY 0/1`, événement `Readiness probe failed: HTTP probe failed with statuscode: 503`.

La chaîne des sondes est : Astro `/readyz` → Django `/readyz/` → PostgreSQL et Redis. Remonter la chaîne :

```bash
# Frontend non prêt : le backend est-il prêt ?
"${K[@]}" get pods -l app=facturadj-backend
# Backend non prêt : sa sonde d'aptitude répond-elle depuis l'intérieur ?
"${K[@]}" exec deploy/facturadj-backend -- python -c \
  "import urllib.request; print(urllib.request.urlopen('http://127.0.0.1:8000/readyz/', timeout=3).status)"
# Dépendances
"${K[@]}" get pods -l app=facturadj-postgres
"${K[@]}" get pods -l app=facturadj-redis
"${K[@]}" exec deploy/facturadj-backend -- python -c \
  "import socket; [socket.create_connection((h, p), 3) for h, p in (('facturadj-postgres', 5432), ('facturadj-redis', 6379))]; print('ok')"
```

| Constat | Cause | Action |
|---|---|---|
| `HTTP Error 503` sur `/readyz/` | PostgreSQL ou Redis injoignable | Vérifier leurs Pods ; [20.3.10](#section-20-3-10) |
| `HTTP Error 400` | `DisallowedHost` : l'en-tête `Host` des sondes n'est pas autorisé | Vérifier `DJANGO_ALLOWED_HOSTS` et l'en-tête `Host: localhost` des sondes |
| `TimeoutError` vers PostgreSQL ou Redis | NetworkPolicy ou DNS | Vérifier les politiques et le DNS du cluster ([11.6](#section-11-6)) |
| Frontend seul non prêt, backend prêt | `API_URL` erronée ou flux frontend → backend bloqué | Test frontend → backend de [11.6](#section-11-6) |

> **Attention** — Éviter le redémarrage aveugle : un Pod non prêt n'est pas un Pod cassé, c'est souvent une dépendance qui l'est.

<a id="section-20-3-8"></a>

#### 20.3.8 Harbor inaccessible, 401 ou 403

**Symptôme** — Échec de `docker login`, de `docker push` ou du téléchargement d'images.

```bash
curl -sI https://harbor.nexora-djibouti.fr/api/v2.0/ping
echo | openssl s_client -connect harbor.nexora-djibouti.fr:443 -servername harbor.nexora-djibouti.fr 2>/dev/null \
  | openssl x509 -noout -dates -issuer
```

| Constat | Cause | Action |
|---|---|---|
| Aucune réponse | Harbor arrêté, DNS, réseau | Vérifier le service Harbor et le DNS |
| Erreur de certificat | Certificat expiré ou CA absente | Réparer ; **jamais** `insecure-registries` |
| `401` | Nom du robot (avec `$`) mal saisi, robot expiré | Ressaisir avec `read`, vérifier l'expiration |
| `403` | Robot sans permission sur le projet ou l'action | Permissions du robot |
| Push refusé sur un tag existant | Tag immuable | Normal : nouveau commit, nouveau tag |

<a id="section-20-3-9"></a>

#### 20.3.9 Argo CD OutOfSync, Degraded ou Missing

| Statut | Normal ? | Diagnostic | Action |
|---|---|---|---|
| `OutOfSync` après fusion d'une MR | **Oui** | `argocd app diff facturadj-preprod` | Lire le diff, décider de la synchronisation |
| `OutOfSync` sans MR récente | Non : drift | Diff sur des champs modifiés à la main (`replicas`, annotation `restartedAt`, image) | Réaligner : synchroniser, ou reporter le changement dans Git par MR |
| La synchronisation automatique revient | Non | ApplicationSet ou Application parente | Corriger la source du parent ([10.7](#section-10-7)) |
| `Unknown` / `ComparisonError` | Non | `argocd app get facturadj-preprod` (conditions), `argocd repo list` | Accès au dépôt, URL, erreur de rendu Kustomize |
| `Missing` | Au premier déploiement | Ressources jamais créées | Synchroniser |
| `Degraded` | Non | `"${K[@]}" get pods`, événements | Fiches 20.3.4 à 20.3.7 ; envisager le [rollback](#chapitre-18) |
| `... is not permitted in project facturadj` | Non | Type de ressource hors liste blanche | Retirer la ressource ou faire évoluer l'AppProject par revue |

<a id="section-20-3-10"></a>

#### 20.3.10 PostgreSQL inaccessible

```bash
"${K[@]}" get pods -l app=facturadj-postgres
"${K[@]}" logs facturadj-postgres-0 --tail=100
"${K[@]}" exec facturadj-postgres-0 -- pg_isready -U facturadj -d facturadj
"${K[@]}" exec facturadj-postgres-0 -- df -h /var/lib/postgresql/data
```

| Journal ou constat | Cause | Action |
|---|---|---|
| `permission denied` sur le dossier de données | UID/GID ou `fsGroup` différent de 999, `PGDATA` à la racine du volume | Vérifier le `securityContext` et `PGDATA=/var/lib/postgresql/data/pgdata` |
| `No space left on device` | Volume ou disque du VPS plein | Libérer de l'espace ; ne rien supprimer dans le dossier de données |
| `password authentication failed` | Mot de passe du Secret différent de celui de la base, retour à la ligne final, `DATABASE_URL` mal encodée | [13.3](#section-13-3) ; rappel : `POSTGRES_PASSWORD` n'est lu qu'à l'initialisation |
| `role "facturadj" does not exist` | Volume initialisé avec une autre configuration | Vérifier l'historique du volume avant toute action |
| `database files are incompatible with server` | Version majeure de l'image changée | Revenir à la version d'origine ; une montée majeure exige dump et restauration |
| Connexion refusée ou délai dépassé depuis le backend | NetworkPolicy, nom de Service | Tests de [11.6](#section-11-6) |

<a id="section-20-3-11"></a>

#### 20.3.11 Migration échouée

```bash
"${K[@]}" get jobs
"${K[@]}" describe job "$MIGRATION_JOB" | sed -n '/Events/,$p'
"${K[@]}" logs "job/$MIGRATION_JOB"
"${K[@]}" exec facturadj-postgres-0 -- psql -U facturadj -d facturadj -c \
  "SELECT app, name, applied FROM django_migrations ORDER BY applied DESC LIMIT 10;"
```

| Constat | Cause | Action |
|---|---|---|
| Erreur SQL dans les journaux | Migration incompatible avec les données | **Arrêter la promotion** ; corriger dans une nouvelle release |
| `DeadlineExceeded` | Migration plus longue que 10 minutes | Analyser (verrous, volume) ; planifier une fenêtre |
| `ImagePullBackOff` sur le Job | Voir [20.3.4](#section-20-3-4) | — |
| `AlreadyExists` à l'application du Job | Un Job du même SHA existe (tentative précédente) | Lire ses journaux, puis le supprimer **délibérément** avant de relancer |

La plupart des migrations Django sur PostgreSQL sont transactionnelles : une migration en échec est en général annulée entièrement. Vérifier néanmoins `django_migrations` ; en cas de doute, restaurer la sauvegarde pré-migration ([13.6](#section-13-6)). **Ne jamais lancer de migration inverse à l'aveugle.**

<a id="section-20-3-12"></a>

#### 20.3.12 Erreurs Django 400, 301, 403 ou 500

| Code | Cause habituelle | Diagnostic | Correction |
|---|---|---|---|
| **400** | `DisallowedHost` : nom d'hôte absent de `DJANGO_ALLOWED_HOSTS` | Journaux backend `Invalid HTTP_HOST header` | Ajouter le nom interne exact ; `localhost` pour les sondes |
| **301** | `SECURE_SSL_REDIRECT` actif derrière un TLS terminé en amont, ou `X-Forwarded-Proto` absent | Tester avec `-H "X-Forwarded-Proto: https"` | `SECURE_SSL_REDIRECT=0` en cluster ; corriger le proxy, ne pas désactiver TLS globalement |
| **403** sur un POST | CSRF : origine non approuvée, hôte public non transmis, test en HTTP | En-têtes `Origin`, `Host`, `X-Forwarded-*` | `CSRF_TRUSTED_ORIGINS` avec le domaine HTTPS ; tester en HTTPS de confiance |
| **500** | Exception applicative | `"${K[@]}" logs deploy/facturadj-backend --tail=200` | Corriger dans une release ; **jamais** activer `DEBUG` |

<a id="section-20-3-13"></a>

#### 20.3.13 Échecs de construction

| Symptôme | Contrôle et action |
|---|---|
| `not a git repository` | Utiliser le vrai clone DEV ; ne pas inventer de remote ni de SHA |
| `scp: ... No such file or directory` | Créer les dossiers parents listés dans `00-livraison.md` ; vérifier l'alias `odoo` |
| `bad interpreter: /bin/bash^M` | Recopier les scripts en LF ; respecter `.gitattributes` |
| Cibles Packer en double | Les recettes OS doivent rester entièrement commentées ; seules `frontend` et `backend` sont construites |
| `SOURCE_REV doit être le SHA Git complet approuvé.` | Fournir le SHA complet ([17.5](#section-17-5)) |
| Script arrêté sur `git status --porcelain` | Checkout modifié : relire, commiter les fichiers attendus |
| `requirements.lock` absent | Génération sous Linux avec Python 3.12, revue, commit ([5.4](#section-5-4)) |
| Astro ne compile pas ou ne démarre pas | Vérifier Node 22, `package-lock.json` et l'adaptateur en `dependencies` |
| Dockerfile introuvable | Lancer Packer depuis `infra/packer` : le script calcule la racine depuis le template |
| `docker buildx` inconnu | Installer Buildx manuellement ; vérifier sa version |

<a id="section-20-3-14"></a>

#### 20.3.14 Scan bloquant ou digest incohérent

| Symptôme | Action |
|---|---|
| Trivy `HIGH` ou `CRITICAL` | Mettre à jour la base (digest) ou la dépendance (lock), reconstruire, retester, rescanner |
| `cmp: release/images.sha256 release/scanned.sha256 differ` | Les archives ont changé depuis le scan : rescanner |
| `Exports de versions differentes` | Reconstruire les deux composants du même commit |
| `Digest registry ambigu ou absent` | Arrêter ; vérifier l'image locale, le tag et le push |
| Digest de `digests.json` différent de Harbor | **Arrêter la promotion** ; vérifier le reçu et l'immutabilité du tag |

<a id="section-20-4"></a>

### 20.4 Tableau récapitulatif

| Symptôme | Premier contrôle | Fiche |
|---|---|---|
| Aucune réponse | `dig`, `curl -sv`, Pods Traefik | [20.3.1](#section-20-3-1) |
| 404 ou 503 courts | Hôte de l'Ingress, EndpointSlice | [20.3.2](#section-20-3-2) |
| Erreur de certificat | `openssl s_client` | [20.3.3](#section-20-3-3) |
| `ImagePullBackOff` | Événements du Pod, `harbor-pull`, digest | [20.3.4](#section-20-3-4) |
| `CrashLoopBackOff` | `logs --previous`, `Last State` | [20.3.5](#section-20-3-5) |
| `Pending` | Événements, PVC, capacité du nœud | [20.3.6](#section-20-3-6) |
| `0/1` en `Running` | Chaîne des sondes | [20.3.7](#section-20-3-7) |
| Harbor 401 ou 403 | Nom du robot, expiration, permissions | [20.3.8](#section-20-3-8) |
| `OutOfSync` inattendu, auto-sync qui revient | Diff, parent ApplicationSet | [20.3.9](#section-20-3-9) |
| PostgreSQL `permission denied`, authentification | Journaux, `securityContext`, Secrets | [20.3.10](#section-20-3-10) |
| Migration en échec | Journaux du Job, `django_migrations` | [20.3.11](#section-20-3-11) |
| Django 400, 301, 403 | `ALLOWED_HOSTS`, proxy, origine | [20.3.12](#section-20-3-12) |
| Construction en échec | Git, lock, CRLF, Buildx | [20.3.13](#section-20-3-13) |
| Scan ou digest | Rapports Trivy, reçu | [20.3.14](#section-20-3-14) |
<a id="mise-en-pratique--chapitre-20"></a>

### Mise en pratique — chapitre 20

**Tester une hypothèse unique.** Le frontend est inaccessible : si la résolution DNS est fausse, lire les logs Django ne résout pas la première anomalie. **Méthode :** observation, hypothèse, contrôle ciblé, résultat, puis nouvelle décision. Conserver les preuves avant toute action qui efface ou remplace un Pod.

<a id="synthese-du-chapitre-20"></a>

#### Synthèse du chapitre 20

**À retenir**

- L'ordre du diagnostic ne change jamais : **DNS → port 443 et Traefik → Ingress → Service et destinations → Pods → journaux → dépendances**. Toute investigation qui commence par les journaux applicatifs fait perdre du temps.
- Le tout premier réflexe est de vérifier le contexte : `kubectl config current-context`. Un diagnostic mené sur le mauvais cluster est pire qu'un diagnostic absent.
- Les preuves disparaissent avec les Pods. Journaux et événements se collectent **avant** la correction, jamais après.
- Un frontend non prêt vient souvent d'un backend non prêt, lui-même souvent dû à PostgreSQL ou Redis. Remonter la chaîne de dépendances plutôt que traiter le symptôme visible.
- `kubectl logs --previous` est indispensable après un redémarrage : les journaux du conteneur mort ne sont plus accessibles autrement.

**Les pièges classiques**

| Le piège | Pourquoi on tombe dedans | Le bon réflexe |
|---|---|---|
| Commencer par les journaux applicatifs | C'est là qu'on espère la réponse | Si le DNS ou le certificat est en cause, aucun journal applicatif ne le dira |
| Redémarrer un Pod « pour voir » | C'est rapide et souvent efficace | Cela détruit les preuves. Collecter d'abord événements et journaux |
| Traiter un `503` du frontend comme un problème de frontend | Le symptôme est là | Les sondes d'aptitude dépendent du backend, qui dépend de PostgreSQL et de Redis |
| Corriger dans le cluster et ne rien reporter dans Git | L'incident est clos | L'écart persistera et la prochaine synchronisation le supprimera. Réaligner Git après résolution |

**Vérifiez votre compréhension**

1. Dans quel ordre vérifie-t-on les couches lorsqu'un site ne répond plus ? *(→ [20.1](#section-20-1), [20.3](#section-20-3))*
2. Un Pod a redémarré : comment lire les journaux de l'instance précédente ? *(→ [20.2](#section-20-2))*
3. Que faut-il faire **avant** toute action corrective ? *(→ [20.2](#section-20-2), [21.3](#section-21-3))*

> **Réponses** — **1.** DNS, puis réponse du port 443 et Traefik, puis Ingress, puis Service et ses destinations, puis Pods, puis journaux, puis dépendances. **2.** Avec `kubectl logs --previous` sur le Pod concerné. **3.** Conserver les journaux et les événements, et noter l'heure et le symptôme exact : ces éléments disparaissent avec les Pods.

**Où aller ensuite** — Le [chapitre 21](#chapitre-21) condense tout ce qui précède en listes à cocher.

<a id="chapitre-21"></a>

## 21. Runbook opérationnel

> **En une phrase** — Les checklists, contrôles périodiques et journaux rendent les interventions répétables et transmissibles.

**Ce que vous saurez faire à la fin de ce chapitre**

1. Dérouler une release complète en cochant chaque contrôle, de la préparation à l'archivage.
2. Dérouler un retour arrière sans rien oublier, y compris la régularisation de Git.
3. Tenir les quinze premières minutes d'un incident sans improviser.
4. Savoir ce qui doit être fait chaque jour, chaque semaine, chaque mois.
5. Tenir un journal de release exploitable des mois plus tard.

**Prérequis** — [chapitres 17](#chapitre-17) à [20](#chapitre-20) · **Lecture** — 6 min · **Nature** — runbook pur, à imprimer ou garder ouvert

<a id="section-21-1"></a>

### 21.1 Checklist de release PREPROD

**AVANT DÉPLOIEMENT**

- [ ] PR fusionnée, contrôles GitHub verts
- [ ] Arbre Git propre, `SOURCE_REV` et `TAG` définis sur le commit fusionné
- [ ] Images de base fixées par digest et consignées
- [ ] `backend/requirements.lock` présent et relu
- [ ] Plan de sauvegarde et de repli prêt ; catalogue lisible et preuve de restauration disponible pour les données utilisées
- [ ] Parcours choisi : VM DEV **ou** GitLab

**BUILD**

- [ ] `packer validate .` : configuration valide
- [ ] Frontend construit
- [ ] Backend construit
- [ ] `images.sh bundle` : paire d'archives cohérente

**TESTS**

- [ ] Quatre sondes à `200` dans le test Compose
- [ ] UID `10001` pour les deux conteneurs
- [ ] Tests Django réussis dans l'image
- [ ] Refus de `DEBUG` vérifié

**SCAN**

- [ ] Hadolint et `trivy config` examinés
- [ ] `images.sh scan` réussi, `scanned.sha256` présent
- [ ] SBOM produits

**HARBOR**

- [ ] Images présentes avec le tag `sha-<SHA>`
- [ ] Digests identiques à `release/digests.json`
- [ ] Scans Harbor corrects (si activés)

**GITOPS**

- [ ] SHA transféré sur le miroir GitLab
- [ ] Proposition générée (avec `--base` pour une release suivante)
- [ ] `check_static.py --release` réussi, rendu Kustomize relu
- [ ] MR `promote/sha-<SHA>` approuvée et fusionnée

**ARGO CD**

- [ ] Application en `OutOfSync` sur le bon commit, politique `Manual`
- [ ] Diff vérifié : uniquement les changements attendus
- [ ] `GITOPS_REV` exact et reçu `receipt.json` vérifiés
- [ ] Scénario A, B, C ou D choisi selon 17.13 ; état et ordre compris
- [ ] Sauvegarde cohérente réalisée avant modification des données, si applicable
- [ ] Migration éventuelle terminée, journaux conservés, puis ordre de synchronisation respecté
- [ ] Synchronisation de la révision approuvée et validation métier réalisées

**APRÈS DÉPLOIEMENT**

- [ ] `Synced` et `Healthy`
- [ ] Pods `Running` et prêts, sans redémarrages nouveaux inexpliqués
- [ ] API répond (`/readyz` du frontend)
- [ ] Frontend répond (`/login`)
- [ ] Parcours fonctionnel manuel réussi
- [ ] Journaux corrects, sans exception
- [ ] Consommation CPU et mémoire correcte (`kubectl top`)
- [ ] Reçus archivés, journal de release complété

<a id="section-21-2"></a>

### 21.2 Checklist de rollback

- [ ] Incident qualifié et daté ; traces conservées
- [ ] Migration exécutée par la release ? Schéma compatible avec l'ancien code ?
- [ ] Anciens digests toujours présents dans Harbor
- [ ] Branche `rollback/...` avec `git revert` du commit de promotion
- [ ] MR relue, approuvée, fusionnée
- [ ] `argocd app diff` montre le retour aux anciens digests
- [ ] Synchronisation décidée et effectuée
- [ ] Vérifications de la phase 10
- [ ] Si `rollout undo` d'urgence : revert Git fusionné ensuite
- [ ] Journal de release complété

<a id="section-21-3"></a>

### 21.3 Checklist d'incident : les 15 premières minutes

- [ ] Constater : quel symptôme, depuis quand, pour qui ?
- [ ] Vérifier le contexte : `kubectl config current-context`
- [ ] Vue d'ensemble : `argocd app get facturadj-preprod`, `"${K[@]}" get pods`, événements
- [ ] Une release ou une modification récente ? (`argocd app history`, historique GitOps)
- [ ] Suivre la méthode de l'extérieur vers l'intérieur ([20.1](#section-20-1))
- [ ] Conserver journaux et événements **avant** toute action corrective
- [ ] Décider : correction, rollback ou restauration
- [ ] Informer les utilisateurs de recette si l'indisponibilité se prolonge
- [ ] Après résolution : réaligner Git, consigner la cause et le correctif

<a id="section-21-4"></a>

### 21.4 Tâches périodiques

| Rythme | PREPROD (active) | PROD (cible) |
|---|---|---|
| Quotidien | Consulter la sonde externe ; âge de la dernière sauvegarde | Lecture des alertes, contrôle des sauvegardes |
| Hebdomadaire | Espace disque du VPS ; statut Argo CD ; alertes de sécurité des dépendances | PR de mise à jour, tableau des vulnérabilités |
| Mensuel | Restauration isolée du dump ; expiration des certificats et des robots Harbor | Test PITR, revue des coûts |
| Trimestriel | Restauration des médias ; déchiffrement d'une copie externe ; tests de panne ; revue des accès | Tests de panne, revue des accès, rotation des clés S3 |
| Semestriel | Reconstruction complète de la PREPROD sur un cluster jetable | Reconstruction complète, rotation des secrets |
| Annuel | Rotation de `DJANGO_SECRET_KEY` ; revue de ce manuel | Montée de version majeure de l'orchestrateur, revue d'architecture |

<a id="section-21-5"></a>

### 21.5 Aide-mémoire des commandes

**Git et transfert**

| Action | Commande |
|---|---|
| Commit approuvé | `export SOURCE_REV="$(git rev-parse HEAD)"; export TAG="sha-$SOURCE_REV"` |
| Transfert vers GitLab | `git push "$GITLAB_MIRROR_URL" "$APPROVED_SHA:refs/heads/main"` |
| Contrôle du miroir | `git ls-remote "$GITLAB_MIRROR_URL" refs/heads/main` |

**Construction et publication**

| Action | Commande |
|---|---|
| Valider Packer | `cd infra/packer && packer init . && packer fmt -check . && packer validate .` |
| Construire | `packer build -parallel-builds=1 .` |
| Contrôler la paire | `bash infra/ci/images.sh bundle` |
| Scanner | `bash infra/ci/images.sh scan` |
| Publier | `bash infra/ci/images.sh push` |
| Proposition GitOps | `python3 infra/ci/prepare_gitops.py --base "$GITOPS_DIR" --receipt release/digests.json --output "release/gitops-$TAG"` |
| Contrôle release | `python3 infra/ci/check_static.py --release --gitops-root release/gitops-$TAG` |

**Kubernetes** (`K=(kubectl --context "$KUBE_CONTEXT" -n facturadj-preprod)`)

| Action | Commande |
|---|---|
| Vue d'ensemble | `"${K[@]}" get pods,svc,ingress,pvc` |
| Événements | `"${K[@]}" get events --sort-by=.lastTimestamp` |
| Journaux | `"${K[@]}" logs deploy/facturadj-backend --tail=100` |
| Crash précédent | `"${K[@]}" logs <pod> --previous` |
| Détail | `"${K[@]}" describe pod <pod>` |
| Consommation | `"${K[@]}" top pods` |

**Argo CD**

| Action | Commande |
|---|---|
| État | `argocd app get facturadj-preprod` |
| Différences | `argocd app diff facturadj-preprod` |
| Synchroniser | `argocd app sync facturadj-preprod` |
| Attendre | `argocd app wait facturadj-preprod --sync --health --timeout 300` |
| Historique | `argocd app history facturadj-preprod` |

**PostgreSQL**

| Action | Commande |
|---|---|
| Disponibilité | `"${K[@]}" exec facturadj-postgres-0 -- pg_isready -U facturadj -d facturadj` |
| Sauvegarde | `"${K[@]}" exec facturadj-postgres-0 -- pg_dump -U facturadj -d facturadj -Fc > fichier.dump` |
| Contrôle | `"${K[@]}" exec -i facturadj-postgres-0 -- pg_restore --list < fichier.dump` |
| Console | `"${K[@]}" exec -it facturadj-postgres-0 -- psql -U facturadj -d facturadj` |

<a id="section-21-6"></a>

### 21.6 Journal de release

À tenir pour chaque release, par exemple dans le dépôt GitOps (`releases/journal.md`) :

| Champ | Valeur |
|---|---|
| Date et heure (UTC) | |
| Opérateur | |
| SHA source (`SOURCE_REV`) | |
| Tag | `sha-…` |
| Bases (`PYTHON_IMAGE`, `NODE_IMAGE`, `POSTGRES_IMAGE`, `REDIS_IMAGE`) | |
| Versions des outils (Packer, Docker, Trivy) | |
| Parcours | VM DEV / GitLab |
| Digest backend | `sha256:…` |
| Digest frontend | `sha256:…` |
| Résultat du scan | Aucun `HIGH`/`CRITICAL` / exception documentée |
| MR GitOps et commit de promotion | |
| Sauvegarde pré-migration | Nom du fichier et empreinte |
| Job de migration | `facturadj-migrate-…` : résultat |
| Synchronisation | Heure, résultat |
| Vérifications fonctionnelles | OK / réserves |
| Décision d'ouverture d'accès | |
| Incidents et rollback | |
<a id="mise-en-pratique--chapitre-21"></a>

### Mise en pratique — chapitre 21

**Transformer une checklist en preuve.** Une case « sauvegarde OK » est ambiguë. Une ligne contenant l'archive, son empreinte, son lieu externe et la date du test est vérifiable. **Exercice :** remplacer trois cases vagues par des résultats mesurables dans un journal d'intervention de recette.

<a id="synthese-du-chapitre-21"></a>

#### Synthèse du chapitre 21

**À retenir**

- Une checklist ne remplace pas la compréhension : elle protège contre l'oubli, pas contre l'erreur de jugement. Les chapitres 17 à 20 restent la référence en cas de doute.
- La release se coche en huit blocs : avant déploiement, build, tests, scan, Harbor, GitOps, Argo CD, après déploiement. Aucun bloc n'est facultatif.
- Les quinze premières minutes d'un incident ont un ordre : constater, vérifier le contexte, prendre une vue d'ensemble, chercher un changement récent, remonter les couches, **conserver les preuves**, décider, informer.
- Les tâches périodiques sont la partie la plus facile à laisser glisser, et la plus coûteuse à rattraper : certificat expiré, sauvegarde jamais testée, disque plein.
- Le journal de release est ce qui permettra, dans six mois, de relier un comportement étrange à une livraison précise.

**Les pièges classiques**

| Le piège | Pourquoi on tombe dedans | Le bon réflexe |
|---|---|---|
| Cocher sans vérifier | La liste avance plus vite | Chaque case correspond à un contrôle réel ; une case cochée à tort se paie deux étapes plus loin |
| Négliger les tâches mensuelles | Rien ne casse le jour où on les saute | Le certificat et la sauvegarde non testée sont les deux incidents les plus prévisibles du projet |
| Ne remplir le journal de release qu'en cas de problème | Une release réussie semble sans histoire | Le journal sert surtout à comparer : sans les releases normales, les anormales ne ressortent pas |

**Vérifiez votre compréhension**

1. Quelles sont les huit sections de la checklist de release ? *(→ [21.1](#section-21-1))*
2. Quel est le deuxième geste de la checklist d'incident, et pourquoi si tôt ? *(→ [21.3](#section-21-3))*
3. Quelles tâches sont mensuelles en PREPROD ? *(→ [21.4](#section-21-4))*

> **Réponses** — **1.** Avant déploiement, build, tests, scan, Harbor, GitOps, Argo CD, après déploiement. **2.** Vérifier le contexte `kubectl` : agir sur le mauvais cluster transformerait un incident en second incident. **3.** La restauration isolée du dump, et le contrôle de l'expiration des certificats et des comptes robots Harbor.

**Où aller ensuite** — Le [chapitre 22](#chapitre-22) prend de la hauteur : ce qu'il resterait à faire pour une vraie production.

<!-- PARTIE: Partie VII — Préparer la production -->

<a id="chapitre-22"></a>

## 22. Trajectoire vers la production

> **En une phrase** — La production reste un projet à décider, dimensionner et valider à partir de besoins mesurés.

**Ce que vous saurez faire à la fin de ce chapitre**

1. Énumérer ce qu'une production devrait ajouter à la préproduction actuelle.
2. Comparer les orchestrateurs candidats sur des critères assumés, pas sur la mode.
3. Situer les ordres de grandeur d'hébergement et de budget.
4. Dire ce que l'Infrastructure as Code apporterait au-delà de ce qui existe déjà.
5. Réutiliser les principes des Golden Images de machines si cette voie est retenue.

**Prérequis** — l'ensemble des chapitres précédents · **Lecture** — 16 min · **Nature** — étude et aide à la décision

> **Cible PROD** — Tout ce chapitre relève de l'étude d'août 2026. Aucune commande ne doit être exécutée sur la PREPROD k3d.

<a id="section-22-1"></a>

### 22.1 Statut de ce chapitre

> **Cible PROD** — Tout ce chapitre décrit l'**étude d'architecture de production** rédigée le 23/08/2026 (et, pour Packer, le 10/08/2026). Elle n'est **pas implémentée**. Elle repose sur OKD (OpenShift communautaire) chez Hetzner Cloud, ce qui diffère de la PREPROD k3d. Les commandes `oc`, `hcloud`, `tofu` et `openshift-install` qui y figurent ne s'appliquent **jamais** à la PREPROD.

Les fichiers correspondants sont conservés dans le dépôt : `infra/k8s/base`, `infra/k8s/overlays/prod`, `infra/k8s/cert-manager`, `infra/terraform`, `infra/butane`, `infra/packer/ansible`, `infra/packer/tests`, et les recettes Packer commentées.

<a id="section-22-2"></a>

### 22.2 Ce que la production devra ajouter

| Domaine | PREPROD actuelle | Exigence de production |
|---|---|---|
| Disponibilité | 1 VPS, 1 réplica, `Recreate` | Plusieurs nœuds, 3 réplicas, RollingUpdate, PDB, HPA ([15.5](#section-15-5)) |
| Base de données | StatefulSet unique, `pg_dump` manuel | CloudNativePG répliqué, WAL continu, PITR ([13.8](#section-13-8)) |
| Documents | PVC `local-path` | Stockage objet S3 ([12.3](#section-12-3)) |
| Certificats | Secret manuel | cert-manager, renouvellement automatique ([11.5](#section-11-5)) |
| Secrets | Fichiers et `kubectl create secret` | Coffre-fort ou Sealed Secrets, rotation ([14.2.2](#section-14-2-2)) |
| Observabilité | `kubectl`, sonde externe | Prometheus, Loki, alertes, Sentry ([16.4](#section-16-4)) |
| Façade | Traefik | WAF, limitation de débit, protection du domaine ([11.8](#section-11-8)) |
| Chaîne logicielle | Scan et SBOM | Signature des images, mises à jour automatisées ([8.9](#section-8-9)) |
| Accès humains | kubeconfig administrateur | RBAC par rôle, authentification forte, audit |
| Sauvegardes | Manuelles | Automatisées, supervisées, hors site, testées ([19.8](#section-19-8)) |
| Données | SQLite en démonstration | Migration des données réelles vers PostgreSQL, contrôlée |

<a id="section-22-3"></a>

### 22.3 Choisir l'orchestrateur de production

L'étude d'août ne comparait qu'une seule option d'orchestrateur, OKD. Or la PREPROD a été construite sur k3s. Le choix reste **à décider** ; voici les éléments de comparaison.

| Critère | k3s multi-nœuds | OKD (étude d'août) |
|---|---|---|
| Continuité avec la PREPROD | Totale : mêmes manifests, Traefik, NetworkPolicies | Adaptations : Routes ou Ingress, SCC, UID arbitraire ([22.7](#section-22-7)) |
| Haute disponibilité du plan de contrôle | 3 serveurs avec etcd intégré | 3 masters |
| Empreinte | Faible | Élevée (opérateurs, monitoring intégré) |
| Fonctions intégrées | Minimales, à compléter (monitoring, cert-manager) | Nombreuses : monitoring, registry, console, opérateurs |
| Complexité d'installation et de mise à jour | Faible | Élevée (UPI sur Hetzner, DNS `api-int`, bootstrap) |
| Compétences requises | Kubernetes standard | Kubernetes et spécificités OpenShift |

> **À valider** — Arbitrer entre ces deux voies (ou un Kubernetes managé) avant d'engager les travaux de production. Les chapitres 13 à 16 restent valables dans les deux cas.

<a id="section-22-4"></a>

### 22.4 Hébergeurs et budgets

> **Note** — Tarifs indicatifs hors taxes, ordres de grandeur constatés début 2026, à revalider avant tout engagement. Ces chiffres, écarts, noms d'offres et performances n'ont pas été revérifiés dans cette édition ; ils ne constituent pas une recommandation d'achat actuelle.

**Comparatif des fournisseurs** (étude d'août) :

| Fournisseur | Machine 4 vCPU / 16 Go | Trafic sortant | Points forts | Verdict de l'étude |
|---|---|---|---|---|
| **Hetzner Cloud** | ~24 € (CPU dédiés) | 20 To inclus par serveur | Prix, NVMe, trafic inclus | **Retenu** (région `fsn1`) |
| Scaleway | ~70 € | Payant au-delà d'un quota | Hébergement en France | Environ 2,5 × Hetzner ; pertinent si la souveraineté est un argument commercial |
| OVHcloud | ~65 € | Sortie gratuite (Public Cloud) | Support francophone, présence en Afrique | Environ 2,5 × Hetzner |
| DigitalOcean, Vultr, Exoscale | ~84 à 96 € | Quota puis payant | Interfaces soignées | Sans avantage technique |
| AWS, Azure, GCP | 900 à 1 100 €/mois pour le cluster | 0,09 €/Go | Fiabilité, services managés | Hors budget, sauf exigence contractuelle |

Le trafic inclus est l'argument décisif : une plateforme de facturation génère du téléchargement de PDF. L'étude supposait une latence Djibouti ↔ Falkenstein de 120 à 160 ms. Cette hypothèse et son acceptabilité doivent être mesurées sur les parcours réels.

**Trois architectures chiffrées :**

| | Économique | Production (scénario de l'étude) | HA avancée |
|---|---|---|---|
| Coût mensuel | ~92 € | ~228 € (208 € sans Cloudflare Pro) | ~940 € |
| Plan de contrôle | 3 nœuds compacts (portent aussi l'application) | 3 dédiés | 3 dédiés |
| Workers | 0 | 2 | 4 + 2 nœuds d'infrastructure |
| Réplicas applicatifs | 2 à 3 | 3 à 8 | 3 à 15 |
| PostgreSQL | 1 instance | 2 synchrones | 3 instances |
| RPO | ~5 min | 0 (nœud) / ~5 min (site) | 0 |
| RTO | ~30 min | ~1 min | ~30 s |
| Perte d'un nœud | Dégradé | Transparent | Transparent |
| Préproduction | Namespace | Namespace | Cluster dédié |
| Utilisateurs simultanés | ~50 | ~500 | ~5 000 |

Détail de l'architecture **Production** :

| Poste | Détail | €/mois |
|---|---|---|
| 3 × CCX23 (4 vCPU / 16 Go) | Plan de contrôle | 73,50 |
| 2 × CCX33 (8 vCPU / 32 Go) | Workers | 98,00 |
| 1 × CX22 | Bastion | 3,80 |
| 2 × LB11 | Répartiteurs API et applications | 10,80 |
| Volumes 200 Go | PostgreSQL × 2 et WAL | 8,80 |
| Snapshots | Catalogue d'images | 3,00 |
| Sauvegardes VM | Bastion | 0,80 |
| Cloudflare R2, 200 Go | Documents | 3,00 |
| Scaleway Object, 200 Go | Sauvegardes | 2,50 |
| Storage Box BX11, 1 To | Troisième copie hors fournisseur | 3,90 |
| Domaine et Cloudflare Pro | WAF avancé (facultatif) | 20,00 |
| **Total** | | **≈ 228 €** |

**Trajectoire proposée :**

1. **Mois 1 et 2** — Architecture économique : migration SQLite → PostgreSQL, sortie de ngrok, chaîne CI/CD, GitOps.
2. **Mois 3** — Passage en architecture Production dès les premiers clients payants : ajout de 2 workers, PostgreSQL à 2 instances.
3. **Ensuite** — Un worker supplémentaire quand les nœuds dépassent durablement 70 % de CPU. L'architecture HA avancée n'arrive que sur exigence contractuelle.

**Hypothèse comparative historique** : l'étude estimait une solution sur 2 VM avec PostgreSQL managé à environ 60 €/mois et une journée de déploiement. Ni le tarif ni le délai ne sont validés ici. Le surcoût d'un cluster achète l'autoréparation, les mises à jour sans coupure, l'autoscaling, le GitOps avec retour arrière, l'isolation réseau fine, la supervision intégrée et la reconstruction complète depuis le code. Il se justifie si l'objectif est d'industrialiser la plateforme, pas s'il s'agit seulement de la mettre en ligne.

<a id="section-22-5"></a>

### 22.5 Infrastructure as Code pour la production

| Outil | Périmètre | Fichiers | Pourquoi |
|---|---|---|---|
| Packer | Images de machines | `infra/packer/` | Images multi-fournisseurs reproductibles |
| OpenTofu ou Terraform | Réseau, VM, répartiteurs, DNS, volumes | `infra/terraform/` | État déclaratif, plan relu avant application |
| Ansible | Durcissement **pendant** la construction Packer, jamais en production | `infra/packer/ansible/` | Les machines ne sont pas corrigées à chaud : on reconstruit l'image |
| Kustomize | Manifests de l'application | `infra/k8s/` | YAML lisible et validable, sans templates |
| Helm | Composants tiers uniquement | — | cert-manager, External Secrets, Loki : charts officiels maintenus |
| Argo CD | Déploiement dans le cluster | `infra/argocd/` | Git comme source de vérité |

**Ce qui ne doit jamais être dans le code :**

| Élément | Où il vit |
|---|---|
| Valeurs des secrets | Coffre-fort |
| Jetons de fournisseur | Variables d'environnement de la CI ou de l'opérateur |
| État Terraform | Stockage S3 chiffré et versionné |
| Clés privées des certificats | Générées dans le cluster, jamais exportées |
| Données de la base | Sauvegardes |

**Crochets pre-commit proposés** : gitleaks, formatage et validation Terraform, rendu Kustomize.

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.21.2
    hooks: [{id: gitleaks}]
  - repo: https://github.com/antonbabenko/pre-commit-terraform
    rev: v1.96.2
    hooks: [{id: terraform_fmt}, {id: terraform_validate}, {id: terraform_tflint}]
  - repo: local
    hooks:
      - id: kustomize-build
        name: kustomize build
        entry: bash -c 'kustomize build infra/k8s/overlays/preprod > /dev/null'
        language: system
        pass_filenames: false
```

> **Incohérence corrigée** — La version d'origine rendait `infra/k8s/overlays/prod`, overlay OKD archivé. Le crochet ci-dessus vise l'overlay actif.

**Ordre de reconstruction complète selon l'étude OKD** (environ 2 heures depuis un compte vide) : images Packer (30 à 45 min) → infrastructure OpenTofu (10 min) → installation du cluster (45 min) → opérateurs : CloudNativePG, cert-manager, External Secrets (10 min) → application par Argo CD (5 min). C'est la définition opérationnelle de « reproductible ».

<a id="section-22-6"></a>

### 22.6 Golden Images de machines de l'étude OKD

> **Obsolète pour la cible active** — Recettes entièrement commentées. Conservé pour mémoire technique.

**Le point clé.** Les nœuds OKD tournent sur **Fedora CoreOS**, un système **immuable** : `/usr` est en lecture seule, les paquets s'installent de façon transactionnelle (`rpm-ostree`) et toute la configuration passe par **Ignition** au premier démarrage. On ne durcit donc pas un nœud OKD avec un playbook Ansible lancé par Packer : le Machine Config Operator réécrirait la configuration. D'où deux chaînes distinctes :

| Chaîne | Machines | Outil de configuration | Fichiers |
|---|---|---|---|
| **A — nœuds du cluster** | masters, workers, bootstrap (FCOS) | Butane → Ignition → MachineConfig | `fcos-okd.pkr.hcl`, `infra/butane/` |
| **B — machines de service** | bastion, répartiteur, hôte de sauvegarde (Rocky Linux 9) | Ansible et rôle CIS | `bastion-rocky.pkr.hcl`, `infra/packer/ansible/` |

**Chaîne A.** Hetzner ne propose pas FCOS : Packer écrit l'image brute sur le disque en mode secours, injecte un **pointeur Ignition** et crée un snapshot versionné. Pourquoi un pointeur et non la configuration complète ? Les fichiers `.ign` générés par `openshift-install` contiennent des certificats valables **24 heures** : les figer dans une image la rendrait inutilisable le lendemain. Le pointeur, lui, reste stable :

```json
{
  "ignition": {
    "version": "3.4.0",
    "config": { "merge": [{ "source": "http://10.10.0.10:8080/worker.ign" }] }
  }
}
```

```bash
# ARCHIVE OKD — ne pas exécuter sur la PREPROD
cd infra/packer
export HCLOUD_TOKEN="…"          # jamais dans un fichier du dépôt
packer init .
packer validate -var 'image_version=1.0.0' .
packer build -only='fcos-master.hcloud.fcos' -var 'image_version=1.0.0' .
packer build -only='fcos-worker.hcloud.fcos' -var 'image_version=1.0.0' .
hcloud image list -l projet=facturadj -o columns=id,description,labels
```

Durcissement des nœuds par MachineConfig :

```bash
# ARCHIVE OKD
butane --pretty --strict butane/99-worker-durcissement.bu -o /tmp/99-worker.ign
# ... encapsulation dans un objet MachineConfig « 99-worker-durcissement », puis :
oc apply -f /tmp/99-worker-durcissement.yaml
oc get mcp worker -w        # les nœuds redémarrent un par un, en respectant les PDB
```

Piège : un durcissement CIS générique casse le cluster. Sur un nœud Kubernetes, `net.ipv4.ip_forward = 1` et `net.bridge.bridge-nf-call-iptables = 1` doivent rester actifs, et SELinux en mode `enforcing` avec la politique `targeted`.

**Chaîne B.** `bastion-rocky.pkr.hcl` enchaîne mises à jour de sécurité, rôle `ansible-lockdown/RHEL9-CIS` niveau 1, configuration projet, **tests Goss**, nettoyage et snapshot étiqueté.

| Exigence | Mise en œuvre |
|---|---|
| SSH | Clés uniquement, pas de root, 3 tentatives, algorithmes modernes |
| Services inutiles | Désinstallés (telnet, ftp, samba, cups, snmp, nfs…) |
| Journaux | journald persistant, 2 Go max, rétention 90 j |
| Noyau | ASLR, `kptr_restrict`, `ptrace_scope`, core dumps interdits |
| SELinux et pare-feu | `enforcing`, firewalld en zone `drop`, SSH seul ouvert |
| Audit | auditd verrouillé (`-e 2`) et AIDE |
| Correctifs automatiques | `dnf-automatic` en mode sécurité, **sans redémarrage automatique** |
| Tests | Goss pendant la construction : un échec empêche la publication |

Détails qui comptent :

- **nettoyage final** : `rm -f /etc/ssh/ssh_host_*` et `truncate -s 0 /etc/machine-id`, sinon toutes les machines partagent la même clé d'hôte ;
- **core dumps interdits** : un vidage mémoire de Gunicorn contiendrait jetons et identifiants en clair ;
- **pas de redémarrage automatique** : un redémarrage non drainé coupe des connexions en cours.

**Chaîne complète et renouvellement.** Validation (`packer fmt`, `validate`, checkov, ansible-lint) → construction avec Goss → scan Trivy → snapshot étiqueté → promotion manuelle par l'étiquette `statut=courante` → OpenTofu sélectionne l'image par étiquette. Reconstruction hebdomadaire planifiée (une image de plus de 30 jours est réputée périmée) ; retour arrière en déplaçant l'étiquette. Les nœuds se renouvellent **un par un** :

```bash
# ARCHIVE OKD
cd infra/terraform && tofu apply -var 'image_worker=okd-worker-…-v1.1.0'
oc adm cordon okd-worker-1
oc adm drain okd-worker-1 --ignore-daemonsets --delete-emptydir-data --timeout=600s
oc delete node okd-worker-1
```

<a id="section-22-7"></a>

### 22.7 Spécificités OKD si cette voie est retenue

| Sujet | Particularité OKD | Conséquence |
|---|---|---|
| **UID arbitraire** | La SCC `restricted-v2` attribue à chaque Pod un UID aléatoire du groupe 0 | Images : `chgrp -R 0 /app && chmod -R g=u /app` ; `securityContext` : **ne jamais fixer `runAsUser`** (l'inverse de la PREPROD k3d) |
| `getpwuid()` | L'UID n'existe pas dans `/etc/passwd` | L'entrypoint ajoute une ligne à `/etc/passwd` (rendu inscriptible par le groupe) |
| **SCC** | Toute demande de SCC élargie est un défaut d'image | Vérifier l'annotation `openshift.io/scc` : `restricted-v2` |
| **Exposition** | Routes OpenShift (HAProxy) | `insecureEdgeTerminationPolicy: Redirect` ; en-têtes via annotations de Route |
| **DNS** | `api`, `api-int` et `*.apps` obligatoires | Oublier `api-int` bloque l'installation au bootstrap ; ne pas proxifier `api` ni `*.apps` chez Cloudflare |
| **GitOps** | Opérateur OpenShift GitOps | Namespace `openshift-gitops` au lieu de `argocd` |
| **Monitoring** | Prometheus intégré | Activer `enableUserWorkload` pour les namespaces applicatifs |
| **Installation** | UPI (`platform: none`) chez Hetzner | Répartiteurs et DNS à fournir ; serveur HTTP des `.ign` sur le bastion ; suppression de la machine bootstrap après installation |

<a id="section-22-8"></a>

### 22.8 Plan de mise en œuvre de la production (étude d'août)

Durée estimée : **3 à 5 jours ouvrés** pour un premier passage. Chaque étape se termine par un contrôle ; si le contrôle échoue, ne pas passer à la suivante.

| Étapes | Contenu | Contrôle clé |
|---|---|---|
| 0 | Préalables applicatifs : correctifs de `infra/patches/README.md` (§1 à §4 et §6 intégrés dans la cible active ; **§5 métriques et §7 migration des données restent à faire**) | Tests sur PostgreSQL, `check --deploy` sans avertissement |
| 1 | Compte fournisseur, MFA, jeton dans un coffre, clé SSH dédiée | `hcloud server list` répond |
| 2 | Domaine : achat, verrouillage, renouvellement automatique, MFA, DNSSEC | `dig NS` renvoie les serveurs attendus |
| 3 | Dépôts Git, protections, pre-commit | Un faux secret est refusé par gitleaks |
| 4 à 6 | Golden Images de machines | Images étiquetées, Goss en succès |
| 7 | Infrastructure OpenTofu | Plan relu, bastion accessible, SELinux `Enforcing` |
| 8 | Installation du cluster | Tous les nœuds `Ready`, aucun opérateur `Degraded` |
| 9 et 10 | Réseau et stockage (CSI) | Un PVC de test passe `Bound` |
| 11 et 12 | DNS et cert-manager (staging d'abord) | Certificats `READY=True` |
| 13 | Registry et secret de téléchargement | — |
| 14 | Opérateur PostgreSQL | `Continuous Archiving: OK` |
| 15 | Images applicatives | Scan sans vulnérabilité bloquante |
| 16 à 19 | Secrets, déploiement, exposition | Migrations OK, `/login` en 200, HTTP → 301 |
| 20 et 21 | Autoscaling et HA | HPA avec des pourcentages, PDB présents, Pods répartis |
| 22 et 23 | Supervision et journaux | Cible visible dans Prometheus, alerte de test reçue |
| 24 | Sauvegardes | Restauration réelle réussie, pas seulement une sauvegarde |
| 25 | GitOps | Application synchronisée |
| 26 | Chaîne CI/CD | Chaîne de bout en bout validée |
| 27 | Tests de sécurité | API non joignable de l'extérieur, isolation réseau, quota, en-têtes |
| 28 | Tests de charge | p95 < 1,5 s, erreurs < 0,5 %, aucun OOMKill |
| 29 | Tests de panne | Les scénarios de [15.7](#section-15-7) |
| 30 | Validation de la restauration | RTO mesuré inférieur à l'objectif |
| 31 | Mise en production | Checklist finale ci-dessous |

> **Incohérence corrigée** — L'étude prévoyait, à l'étape 25, un « contrôle de l'autoréparation » (réduire les réplicas et constater leur retour automatique) et, à l'étape 26, un déploiement GitHub entièrement automatique vers la préproduction. Ces deux contrôles contredisent la politique de synchronisation manuelle en vigueur ; ils sont retirés tant que cette politique n'est pas révisée.

**Checklist de mise en production :**

- [ ] Tests de sécurité, de charge, de panne et de restauration passés et consignés
- [ ] Sonde externe active ; alertes reçues sur une adresse réellement relevée
- [ ] Migration des données réelles effectuée et vérifiée (totaux, séquences de numérotation)
- [ ] Comptes de démonstration supprimés
- [ ] `DEBUG=0` confirmé
- [ ] Sauvegarde restaurée avec succès au moins une fois
- [ ] Procédure de retour arrière écrite et testée
- [ ] Contact d'astreinte défini
- [ ] TTL DNS abaissé 24 h avant la bascule ; surveillance rapprochée pendant 24 h
- [ ] Tunnels ngrok arrêtés après validation ; anciennes VM conservées une à deux semaines en secours
<a id="mise-en-pratique--chapitre-22"></a>

### Mise en pratique — chapitre 22

**Décider de la production sur des mesures.** Les coûts et architectures de l'étude donnent des pistes, pas une capacité déjà démontrée. **Exercice :** définir disponibilité, volume de données, budget d'exploitation et compétences disponibles avant de choisir l'orchestrateur. Associer chaque exigence à un test et à un responsable.

<a id="synthese-du-chapitre-22"></a>

#### Synthèse du chapitre 22

**À retenir**

- Aucune mise en service des solutions de ce chapitre n'est attestée par cette édition. Ce chapitre est un dossier de décision ; ses exemples historiques doivent être revalidés.
- Le facteur décisif de la plupart des choix n'est pas technique mais **humain** : qui intervient la nuit ? Sans astreinte, un service managé vaut son surcoût ; avec une équipe compétente et des procédures éprouvées, un opérateur Kubernetes peut être une option. Comparer le coût total, y compris l'exploitation et la reprise.
- Les principes des Golden Images de machines restent valables même si l'orchestrateur change : pas de certificat à courte durée de vie dans une image, suppression des clés d'hôte SSH, tests pendant la construction, pas de redémarrage automatique, renouvellement des nœuds un par un.
- L'étape suivante n'est pas d'ajouter des outils, mais de **fermer les points bloquants** de l'[Annexe F](#annexe-f).

**Les pièges classiques**

| Le piège | Pourquoi on tombe dedans | Le bon réflexe |
|---|---|---|
| Reprendre une commande de ce chapitre sur la PREPROD | Elle est dans le même manuel | Tout ce chapitre vise une architecture non implémentée. Les commandes `oc`, `hcloud`, `tofu` n'ont pas de sens sur k3d |
| Choisir l'orchestrateur avant d'avoir décidé de l'astreinte | La question technique paraît première | Le modèle d'exploitation détermine le choix, pas l'inverse |
| Traiter ce chapitre comme une feuille de route validée | Il est structuré comme un plan | C'est une synthèse d'étude. Les arbitrages sont recensés en [Annexe D](#annexe-d) et restent ouverts |

**Vérifiez votre compréhension**

1. Quel critère détermine réellement le choix entre StatefulSet, opérateur et service managé pour PostgreSQL ? *(→ [13.8](#section-13-8), [22.3](#section-22-3))*
2. Citez trois principes de Golden Image de machine qui survivent au changement d'orchestrateur. *(→ [22.6](#section-22-6))*
3. Quelle est la première chose à faire avant d'envisager la production ? *(→ [Annexe F](#annexe-f))*

> **Réponses** — **1.** La disponibilité d'une astreinte humaine : c'est elle qui rend acceptable une bascule manuelle ou impose l'automatisation. **2.** Parmi : ne jamais figer un certificat à courte durée de vie dans une image, supprimer les clés d'hôte SSH et vider `machine-id`, exécuter les tests pendant la construction, ne pas redémarrer automatiquement après correctif, renouveler les nœuds un par un. **3.** Fermer les points **bloquants** de l'Annexe F, à commencer par le lock des dépendances, le domaine et le certificat, les protections GitLab et la configuration de Harbor.

**Où aller ensuite** — Les annexes : le [glossaire](#annexe-a) pour les termes, l'[Annexe G](#annexe-g) pour retrouver une commande, l'[Annexe H](#annexe-h) pour suivre votre progression.

<!-- PARTIE: Annexes -->

<a id="annexe-a"></a>

## Annexe A — Glossaire

| Terme | Définition |
|---|---|
| **AppProject** | Objet Argo CD qui limite les dépôts, destinations et types de ressources autorisés pour des Applications |
| **Application (Argo CD)** | Objet qui relie un dépôt, un chemin et une révision Git à un cluster et un namespace |
| **Argo CD** | Contrôleur GitOps qui compare Git au cluster et synchronise sur demande |
| **Artefact** | Fichier produit par une construction (archive d'image, rapport, SBOM) |
| **BFF (Backend For Frontend)** | Architecture où seul le frontend est exposé et appelle le backend en interne |
| **BuildKit / Buildx** | Moteur de construction moderne de Docker et sa commande en ligne |
| **CD (livraison / déploiement continus)** | Promotion et déploiement d'un artefact validé dans un environnement |
| **CI (intégration continue)** | Construction et vérification automatiques de chaque changement |
| **CI/CD** | Chaîne complète qui mène du code vérifié au service déployé |
| **Cluster** | Ensemble de nœuds gérés par un même plan de contrôle Kubernetes |
| **ConfigMap** | Objet Kubernetes de configuration non secrète |
| **Conteneur** | Processus isolé exécuté à partir d'une image |
| **Contexte kubectl** | Association d'un cluster, d'un utilisateur et d'un namespace par défaut |
| **CRLF / LF** | Fins de ligne Windows / Unix ; CRLF casse les scripts shell |
| **CSRF** | Attaque qui fait exécuter une requête à l'insu d'un utilisateur authentifié |
| **CVE** | Identifiant public d'une vulnérabilité connue |
| **Degraded** | Statut de santé Argo CD : au moins une ressource est en échec |
| **Deployment** | Objet Kubernetes qui maintient un nombre de Pods identiques et gère leurs mises à jour |
| **Digest** | Empreinte `sha256` du contenu d'une image ; immuable |
| **DNS** | Système qui traduit un nom en adresse IP |
| **Docker** | Outil de construction et d'exécution de conteneurs |
| **Dockerfile** | Recette de construction d'une image |
| **Drift (dérive)** | Écart entre l'état décrit dans Git et l'état réel du cluster |
| **emptyDir** | Volume temporaire d'un Pod, effacé avec lui |
| **Expand/contract** | Stratégie de migration en plusieurs releases qui préserve la compatibilité avec le code précédent |
| **GitHub** | Plateforme Git utilisée pour le développement et les contrôles DEV |
| **GitLab** | Plateforme Git utilisée pour le miroir approuvé, le pipeline PREPROD et le dépôt GitOps |
| **GitOps** | Méthode où Git décrit l'état souhaité et un agent compare cet état à la réalité |
| **Golden Container Image** | Image de base de référence (système minimal et runtime), choisie par digest |
| **Golden Image** | Image de référence testée et versionnée à partir de laquelle on crée des instances identiques |
| **Harbor** | Registry d'images privée, avec robots, scan, immutabilité et rétention |
| **HCL** | Langage de configuration de HashiCorp, utilisé par Packer et Terraform |
| **Healthy** | Statut de santé Argo CD : ressources opérationnelles |
| **HPA** | Autoscaler horizontal qui ajuste le nombre de Pods selon la charge |
| **HSTS** | En-tête qui impose au navigateur l'usage exclusif de HTTPS |
| **IaC (Infrastructure as Code)** | Description de l'infrastructure dans des fichiers versionnés |
| **Image applicative** | Image contenant l'application FacturaDJ, construite sur une image de base |
| **Immutable Infrastructure** | Principe selon lequel on remplace un composant au lieu de le modifier en place |
| **Ingress** | Règle Kubernetes d'accès HTTP(S) externe vers un Service |
| **Job** | Objet Kubernetes qui exécute une tâche jusqu'à son terme |
| **k3d** | Outil qui exécute k3s dans des conteneurs Docker |
| **k3s** | Distribution Kubernetes légère et certifiée |
| **Kustomize** | Outil d'assemblage et d'adaptation de manifests YAML sans templates |
| **Liveness probe** | Sonde de vivacité ; son échec redémarre le conteneur |
| **Lock (fichier de verrouillage)** | Liste figée des versions exactes et empreintes des dépendances |
| **Merge Request (MR)** | Demande d'intégration dans GitLab, équivalent de la Pull Request |
| **Migration** | Modification versionnée du schéma de la base |
| **Multi-étapes (multi-stage)** | Dockerfile à plusieurs `FROM` : seule l'étape finale est conservée |
| **Namespace** | Espace de noms qui cloisonne des ressources Kubernetes |
| **NetworkPolicy** | Règle de filtrage réseau entre Pods |
| **Nœud** | Machine (ou conteneur k3d) qui exécute des Pods |
| **OCI** | Standards ouverts du format d'image, de la distribution et de l'exécution des conteneurs |
| **OOMKilled** | Arrêt d'un conteneur pour dépassement de sa limite mémoire |
| **OutOfSync** | Statut Argo CD : le cluster diffère de Git |
| **Packer** | Outil de fabrication d'images à partir d'un template HCL |
| **PDB (PodDisruptionBudget)** | Nombre minimal de Pods à préserver pendant une interruption volontaire |
| **PITR** | Restauration d'une base à un instant précis grâce à l'archivage des journaux de transactions |
| **Pod** | Plus petite unité exécutable de Kubernetes : un ou plusieurs conteneurs |
| **Pod Security Admission** | Contrôle qui refuse les Pods non conformes au niveau de sécurité du namespace |
| **Post-processor** | Étape Packer exécutée sur le résultat d'une construction |
| **PostgreSQL** | Base de données relationnelle transactionnelle |
| **PRA** | Plan de reprise d'activité après sinistre majeur |
| **Provisioner** | Étape Packer exécutée pendant la construction |
| **Pull Request (PR)** | Demande d'intégration dans GitHub, avec revue et contrôles |
| **PVC (PersistentVolumeClaim)** | Demande de volume persistant |
| **RBAC** | Contrôle d'accès fondé sur des rôles |
| **Readiness probe** | Sonde d'aptitude ; son échec retire le Pod du Service |
| **Redis** | Base clé-valeur en mémoire, utilisée comme cache partagé |
| **Registry** | Serveur qui stocke et distribue des images |
| **Release** | Version livrable identifiée par un SHA et une paire de digests |
| **Robot account** | Compte technique Harbor limité à un projet et à des permissions |
| **Rollback** | Retour à la version précédente du code et de la configuration |
| **RollingUpdate** | Mise à jour progressive qui remplace les Pods un par un |
| **RPO** | Perte de données maximale acceptable, exprimée en temps |
| **RTO** | Durée d'interruption maximale acceptable |
| **SBOM** | Nomenclature exhaustive des composants logiciels d'une image |
| **Secret** | Objet Kubernetes de donnée sensible (encodé, non chiffré) |
| **Service** | Nom et adresse stables devant un groupe de Pods |
| **ServiceAccount** | Identité d'un Pod auprès de l'API Kubernetes |
| **SHA** | Empreinte de 40 caractères identifiant un commit Git |
| **Smoke test** | Test rapide de bon démarrage d'un ensemble |
| **StatefulSet** | Objet Kubernetes pour des Pods à identité et volume stables |
| **StorageClass** | Type de stockage proposé par un cluster |
| **Sync** | Application par Argo CD de l'état décrit dans Git |
| **Tag** | Nom lisible et déplaçable d'une image |
| **TLS** | Protocole de chiffrement et d'authentification du trafic |
| **Traefik** | Reverse proxy et contrôleur Ingress intégré à k3s |
| **Trivy** | Scanner de vulnérabilités et de configurations, générateur de SBOM |

<a id="annexe-b"></a>

## Annexe B — Variables et paramètres

**Variables shell des procédures**

| Variable | Contenu | Défini à |
|---|---|---|
| `SOURCE_REV` | SHA complet du commit approuvé | Étape 2.4 |
| `TAG` | `sha-$SOURCE_REV` | Étape 2.4 |
| `PYTHON_IMAGE`, `NODE_IMAGE` | Bases applicatives par digest | Étape 2.1 |
| `POSTGRES_IMAGE`, `REDIS_IMAGE` | Images de données par digest | Étape 2.1 |
| `SMOKE_ENV_FILE`, `SMOKE_DB_PASSWORD_FILE` | Secrets jetables du test local | Étape 4.1 |
| `HARBOR_USERNAME`, `HARBOR_PASSWORD_FILE` | Robot de publication | Étape 6.1 |
| `GITLAB_MIRROR_URL`, `APPROVED_SHA` | Miroir applicatif et SHA à transférer | [6.4](#section-6-4) |
| `GITOPS_URL`, `GITOPS_DIR` | Dépôt GitOps et son clone | Étape 7.2 |
| `K3D_CLUSTER`, `KUBE_CONTEXT` | Cluster et contexte PREPROD | Étapes B.1 et B.2 |
| `HARBOR_PULL_USERNAME` | Robot de lecture | Étape B.6 |
| `MIGRATION_JOB` | Nom du Job de migration de la release | Étape 9.3 |
| `PREPROD_ORIGIN` | Origine HTTPS publique | Étape 10.2 |

**Variables de l'application**

| Variable | Composant | Source en PREPROD | Rôle |
|---|---|---|---|
| `DJANGO_SECRET_KEY` | Backend | Secret `facturadj-backend` | Clé cryptographique Django |
| `DATABASE_URL` | Backend | Secret `facturadj-backend` | Connexion PostgreSQL (obligatoire) |
| `DJANGO_DEBUG` | Backend | ConfigMap (`0`) | Doit valoir `0`, sinon refus de démarrer |
| `DJANGO_ALLOWED_HOSTS` | Backend | ConfigMap | Noms d'hôte acceptés |
| `REDIS_URL` | Backend | ConfigMap | Cache partagé (obligatoire) |
| `SECURE_SSL_REDIRECT` | Backend | ConfigMap (`0`) | Redirection HTTPS désactivée derrière Traefik |
| `PUBLIC_FRONTEND_URL` | Backend | ConfigMap | Adresse publique du frontend |
| `CSRF_TRUSTED_ORIGINS` | Backend | ConfigMap | Origines HTTPS de confiance |
| `USE_S3` | Backend | ConfigMap (`0`) | Stockage objet activé ou non |
| `EMAIL_BACKEND` | Backend | ConfigMap | Console : aucun envoi réel |
| `MEDIA_ROOT` | Backend | Défaut de l'image (`/app/media`) | Dossier des médias |
| `S3_ENDPOINT_URL`, `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` | Backend | Non utilisés en PREPROD | Stockage objet (cible PROD) |
| `API_URL` | Frontend | Deployment (`http://facturadj-backend:8000`) | Adresse interne du backend |
| `PUBLIC_API_URL` | Frontend | Non utilisée | Repli de `API_URL` |

**Valeurs factices à remplacer avant une release**

| Valeur | Fichiers |
|---|---|
| `preprod.facturadj.example.invalid` | `infra/k8s/k3d/ingress.yaml`, `infra/k8s/k3d/config.yaml` |
| `https://gitlab.example.invalid/RENSEIGNER/facturadj-gitops.git` | `infra/argocd/facturadj-preprod.yaml` (deux occurrences) |
| `sha256:0000…0000` | `infra/k8s/overlays/preprod/kustomization.yaml`, `infra/k8s/operations/migrate.yaml` |
| `UNPROMOTED` | `infra/k8s/k3d/applications.yaml` (remplacé par le digest via Kustomize) |

<a id="annexe-c"></a>

## Annexe C — Noms de référence

Les sources emploient parfois plusieurs noms pour la même chose. Voici les noms **faisant foi** pour la cible active.

| Objet | Nom de référence | Noms rencontrés dans les sources, à ne plus utiliser |
|---|---|---|
| Namespace PREPROD | `facturadj-preprod` | `facturadj-prod` (étude OKD), `facturadj` |
| Namespace Argo CD | `argocd` | `openshift-gitops` |
| Application Argo CD | `facturadj-preprod` | `facturadj` (étude OKD) |
| AppProject | `facturadj` | — |
| Image backend | `harbor.nexora-djibouti.fr/facturadj/backend` | `ghcr.io/OWNER/facturadj-backend` |
| Image frontend | `harbor.nexora-djibouti.fr/facturadj/frontend` | `ghcr.io/OWNER/facturadj-frontend` |
| Tag d'image | `sha-<SHA complet>` | `1.0.0` (SemVer), `latest` |
| Dockerfile backend | `infra/docker/backend/Dockerfile` | `infra/docker/Dockerfile.backend` (copie identique) |
| Dockerfile frontend | `infra/docker/frontend/Dockerfile` (contexte : racine) | `infra/docker/Dockerfile.frontend` avec contexte `frontend/` |
| Base de données | StatefulSet et Service `facturadj-postgres` | `facturadj-db` (CloudNativePG) |
| Cache | Deployment et Service `facturadj-redis` | StatefulSet `facturadj-redis` (étude OKD) |
| Secret applicatif | `facturadj-backend` | `facturadj-backend-secrets` |
| Secret de téléchargement | `harbor-pull` | `ghcr-pull` |
| Secret TLS | `facturadj-tls` | Certificats cert-manager `app-facturadj` |
| Job de migration | `facturadj-migrate-<sha12>` | `facturadj-migrate` (modèle), Job PreSync |
| Manifest Argo CD | `infra/argocd/facturadj-preprod.yaml` | `infra/argocd/application.yaml` (vidé) |
| Overlay | `infra/k8s/overlays/preprod` | `infra/k8s/overlays/prod` (OKD) |
| Table de numérotation | `core_sequencenumerotation` | `core_sequence` |
| Environnements GitLab | `image-build`, `image-scan`, `harbor-publication`, `preprod-proposal` | `production`, `images-infra` (GitHub, étude) |
| Tag du runner | `facturadj-preprod` | — |
| VM DEV | alias SSH `odoo`, clone `~/FACTURADJ/facturaDJ` | — |
| VPS PREPROD | alias SSH `nexora-vps` | — |

<a id="annexe-d"></a>

## Annexe D — Registre des incohérences et arbitrages

| N° | Sujet | Constat dans les sources | Arbitrage dans ce manuel |
|---|---|---|---|
| 1 | Architecture de référence | Deux architectures (OKD/Hetzner du 23/08, k3d/Harbor du 12/09) présentées chacune comme la cible | k3d/Harbor/Packer-Docker = **active** ; OKD = cible PROD non implémentée ([1.5](#section-1-5), [22](#chapitre-22)) |
| 2 | Numérotation des documents | Numéros 02 à 12 en double ; titres internes « 14. », « 15. », « 9–10. », « 11–13. » ; `01-architecture.md` titré « Golden Images Docker » | Structure unique en 22 chapitres |
| 3 | Rôle de Packer | `02-golden-images-packer.md` : snapshots FCOS et Rocky ; `02-packer-golden-image.md` : images Docker | Images Docker actives ([4](#chapitre-04)) ; machines en archive ([22.6](#section-22-6)) |
| 4 | Commandes Packer | `-only='fcos-master.hcloud.fcos'`, `bastion.hcloud.bastion`, `-var image_version` sur recettes commentées | Obsolètes pour la PREPROD, conservées en archive |
| 5 | En-têtes des recettes archivées | `fcos-okd.pkr.hcl` et `bastion-rocky.pkr.hcl` : « cible active Debian QEMU » | Signalé comme faux ; fichiers sources non modifiés ([4.12](#section-4-12)) |
| 6 | Registry | GHCR, tags SemVer | Harbor, tags `sha-<SHA>`, déploiement par digest |
| 7 | Chemins et contexte des Dockerfiles | `Dockerfile.frontend` construit avec le contexte `frontend/` | `infra/docker/<composant>/Dockerfile`, contexte racine ; anciens fichiers identiques |
| 8 | Utilisateur des conteneurs | `USER 1001`, groupe 0, « ne jamais fixer `runAsUser` » | Propre à OpenShift ; k3d fixe UID/GID 10001 ([5.9](#section-5-9), [22.7](#section-22-7)) |
| 9 | Images de base | `python:3.12-slim`, `node:22-alpine` par tag | `python:3.12-slim-bookworm`, `node:22-bookworm-slim` par digest |
| 10 | Gunicorn | 3 workers `gthread` et `tini` | 2 workers × 2 threads, `exec` dans l'entrypoint |
| 11 | Réponse des sondes | `{"statut": "ok"}` | `{"status": "ok"}` (code réel) |
| 12 | Réglages des sondes | Démarrage 30 × 2 s, aptitude toutes les 5 s | Valeurs des manifests k3d : 30 × 10 s, 10 s |
| 13 | Défauts applicatifs | `checkOrigin: false`, `CSRF_TRUSTED_ORIGINS` absent, cache non partagé | Corrigés dans la cible active ([14.2.14](#section-14-2-14)) |
| 14 | Perte de Redis | « L'application sert sans cache » (`IGNORE_EXCEPTIONS`) | Faux en cible active : `503` ([15.4](#section-15-4)) |
| 15 | Mot de passe Redis | Secret `facturadj-redis-auth` | Redis sans mot de passe, risque encadré ([14.2.15](#section-14-2-15)) |
| 16 | Chaîne CI/CD | GitHub construit, signe, pousse et commit GitOps automatiquement | GitHub contrôle ; GitLab à portes manuelles ([8](#chapitre-08)) |
| 17 | Synchronisation Argo CD | Auto-sync, `selfHeal`, hook PreSync de migration ; test d'autoréparation | Synchronisation manuelle, pas de hook ; test retiré ([10.5](#section-10-5)) |
| 18 | Namespace Argo CD et manifest | `openshift-gitops`, `infra/argocd/application.yaml` | `argocd`, `infra/argocd/facturadj-preprod.yaml` |
| 19 | Namespace applicatif | Exemples en `facturadj-prod` ; exemple du besoin en `-n facturadj` | `facturadj-preprod` |
| 20 | Stratégie de mise à jour | RollingUpdate, 3 réplicas, HPA, PDB | `Recreate`, 1 réplica en PREPROD ; HA en cible ([15.5](#section-15-5)) |
| 21 | Ressources | Valeurs différenciées par composant | Valeurs uniformes des manifests k3d ; limite PostgreSQL à valider ([9.6](#section-9-6)) |
| 22 | PostgreSQL | CloudNativePG, 2 instances synchrones, rôle non superutilisateur | StatefulSet unique ; utilisateur de l'image superutilisateur, risque signalé ([13.7](#section-13-7)) |
| 23 | Table de numérotation | `core_sequence` dans le script de test | `core_sequencenumerotation` (modèle `SequenceNumerotation`) |
| 24 | Médias | « Aucune donnée dans les PVC applicatifs », S3 obligatoire | Médias sur PVC en PREPROD, donc sauvegardés ([12.2](#section-12-2)) |
| 25 | Sorties réseau | S3 (443) et SMTP (587) autorisés | Aucune sortie en PREPROD |
| 26 | Secrets | Vault/OpenBao et External Secrets, ou Sealed Secrets | Fichiers hors dépôt et `kubectl create secret` ; coffre en cible |
| 27 | Certificats | cert-manager, renouvellement automatique | Secret manuel ; renouvellement manuel signalé comme risque ([11.5](#section-11-5)) |
| 28 | Domaine et exposition | `app.facturadj.com`, Route OpenShift | Domaine à renseigner, Ingress Traefik |
| 29 | Vulnérabilités sans correctif | `--ignore-unfixed` recommandé | Scan actif strict ; décision à prendre ([8.5](#section-8-5)) |
| 30 | SBOM et signature | Syft (SPDX) et Cosign présentés comme en place | Trivy (CycloneDX) ; signature non implémentée ([14.2.8](#section-14-2-8)) |
| 31 | Outils qualité | SonarQube, Renovate, ZAP présentés comme en place | Non implémentés ([8.9](#section-8-9)) |
| 32 | Workflows GitHub | Copie vers `app.yml` et `images-infra.yml`, secrets `HCLOUD_TOKEN`, `GITOPS_TOKEN` | Workflows `dev.yml` et `packer.yml`, sans secret ; doublons identiques dans `infra/ci` |
| 33 | Ordre des étapes PREPROD | Digests PostgreSQL/Redis « choisis à l'étape 6 » alors qu'ils le sont à l'étape 4 | Corrigé : étape 2.1 |
| 34 | Connexion Harbor | Login manuel à l'étape 9 alors que `images.sh push` s'authentifie lui-même | Login manuel réservé à la variante `docker push` ([17.9](#section-17-9)) |
| 35 | Correctifs applicatifs | `infra/patches/README.md` présenté comme entièrement « à appliquer » | §1 à §4 et §6 intégrés ; §5 et §7 restent à faire |
| 36 | Deux livraisons | `00-livraison.md` (60 créés, 19 modifiés) et `12-livraison-packer-docker.md` (6 créés, 23 modifiés) | Cumulée et correction ; `livraison.sha256` couvre la cumulée |
| 37 | Validation statique | Résultats du 12/09 présentés comme un état | Note historique ([8.6](#section-8-6)) |
| 38 | Retour arrière d'urgence | « `rollout undo` sera annulé par `selfHeal` » | Pas de `selfHeal` en PREPROD : écart visible jusqu'au revert ([18.5](#section-18-5)) |
| 39 | Export de la configuration du cluster | CronJob fondé sur une image OpenShift en tag `latest` | Non repris : Git reste la source de vérité |
| 40 | Crochet pre-commit Kustomize | Rendu de l'overlay `prod` archivé | Remplacé par l'overlay `preprod` ([22.5](#section-22-5)) |
| 41 | Label du Job de migration | Label `app: facturadj-backend`, sélectionné aussi par le Service | Nouveau constat, signalé ([13.5](#section-13-5)) |
| 42 | Identités d'une release | Confusion possible entre SHA source et commit GitOps | Distinction `SOURCE_REV`, digests et `GITOPS_REV` dans le cadre de référence |
| 43 | Garanties du scan | Le checksum présenté comme une attestation inviolable | Contrôle de cohérence dans une chaîne de confiance, pas une signature |
| 44 | Sauvegardes | Catalogue lisible assimilé à une restauration vérifiée | Restauration isolée et validation métier explicites |
| 45 | Déploiement | Ordre de migration variable, branche `main` mouvante | Scénarios A à D et synchronisation sur commit approuvé |
| 46 | Reçu GitOps | Reçu généré mais non copié dans la procédure initiale | `receipt.json` versionné avec la promotion |
| 47 | Maintenance | Responsables et preuves documentaires implicites | Registre d'environnement, ADR, journal d'incident et critères de clôture |

<a id="annexe-e"></a>

## Annexe E — Correspondance avec les documents sources

| Document source | Date | Génération | Statut | Contenu repris dans |
|---|---|---|---|---|
| `00-livraison.md` | 12/09 | Active | Procédure de copie conservée comme référence | [17.3](#section-17-3), [Annexe D](#annexe-d) |
| `01-architecture.md` | 12/09 | Active | Fusionné | [1](#chapitre-01), [2](#chapitre-02), [4.9](#section-4-9) |
| `02-golden-images-packer.md` | 10/08 | Étude OKD | Archivé | [4.12](#section-4-12), [22.6](#section-22-6) |
| `02-packer-golden-image.md` | 12/09 | Active | Fusionné | [4](#chapitre-04), [17.6](#section-17-6) |
| `03-docker-images.md` | 12/09 | Active | Fusionné | [5](#chapitre-05) |
| `03-images-applicatives.md` | 23/08 | Étude OKD | Fusionné (principes) et archivé (spécificités OpenShift) | [5](#chapitre-05), [9.6](#section-9-6), [16.2](#section-16-2), [22.7](#section-22-7) |
| `04-github-gitlab-mirroring.md` | 12/09 | Active | Fusionné | [6](#chapitre-06), [8.4](#section-8-4) |
| `04-securite.md` | 23/08 | Étude OKD | Fusionné et adapté | [14](#chapitre-14), [13.7](#section-13-7) |
| `05-ha-resilience.md` | 23/08 | Étude OKD | Fusionné et adapté | [15](#chapitre-15) |
| `05-harbor.md` | 12/09 | Active | Fusionné | [7](#chapitre-07) |
| `06-gitops-argocd.md` | 12/09 | Active | Fusionné | [10](#chapitre-10) |
| `06-postgresql.md` | 23/08 | Étude OKD | Fusionné et adapté | [13](#chapitre-13) |
| `07-deploiement-preprod.md` | 12/09 | Active | Restructuré en procédure | [17](#chapitre-17) |
| `07-stockage-objet.md` | 23/08 | Étude OKD | Cible PROD | [12.3](#section-12-3) |
| `08-dns-tls.md` | 23/08 | Étude OKD | Fusionné et adapté | [11](#chapitre-11) |
| `08-rollback.md` | 12/09 | Active | Fusionné | [18](#chapitre-18) |
| `09-sauvegarde-dr.md` | 23/08 | Étude OKD | Fusionné et adapté | [19](#chapitre-19) |
| `09-securite.md` | 12/09 | Active | Fusionné | [14](#chapitre-14) |
| `10-hebergeurs-budgets.md` | 23/08 | Étude OKD | Cible PROD | [22.4](#section-22-4) |
| `10-troubleshooting.md` | 12/09 | Active | Fusionné et étendu | [20](#chapitre-20) |
| `11-iac-cicd-observabilite.md` | 23/08 | Étude OKD | Fusionné et adapté | [8.9](#section-8-9), [16.4](#section-16-4), [22.5](#section-22-5) |
| `11-validation-statique.md` | 12/09 | Active | Fusionné | [8.6](#section-8-6) |
| `12-livraison-packer-docker.md` | 12/09 | Active | Référence de copie conservée | [17.3](#section-17-3) |
| `12-runbook.md` | 23/08 | Étude OKD | Cible PROD | [22.8](#section-22-8), [21](#chapitre-21) |
| `livraison.json`, `12-livraison-packer-docker.json`, `livraison.sha256` | 12/09 | Active | Inventaires et empreintes, non fusionnés | [17.3](#section-17-3), [17.5](#section-17-5) |

<a id="annexe-f"></a>

## Annexe F — Points restant à valider

| N° | Point | Où | Priorité |
|---|---|---|---|
| 1 | Générer, relire et commiter `backend/requirements.lock` | [5.4](#section-5-4) | Bloquant |
| 2 | Confirmer le chemin du clone DEV (`~/FACTURADJ/facturaDJ`) | [2.5](#section-2-5) | Bloquant |
| 3 | Choisir le domaine PREPROD, créer le DNS, obtenir le certificat | [11.2](#section-11-2), [11.5](#section-11-5) | Bloquant |
| 4 | Renseigner les URL GitLab, configurer protections, environnements protégés et runner | [6.5](#section-6-5) | Bloquant |
| 5 | Configurer Harbor : projet, robots, immutabilité, rétention, scan, quotas | [7.5](#section-7-5) | Bloquant |
| 6 | Relever nom du cluster, versions k3d/k3s/Traefik/Argo CD, options de création et ports publiés | [9.2](#section-9-2) | Élevée |
| 7 | Vérifier l'application effective des NetworkPolicies et le label Traefik | [11.6](#section-11-6) | Élevée |
| 8 | Vérifier que l'API Kubernetes n'est pas exposée publiquement | [14.2.13](#section-14-2-13) | Élevée |
| 9 | Décider de la politique pour les vulnérabilités sans correctif | [8.5](#section-8-5) | Élevée |
| 10 | Séparer les labels du Job et du Service ; jusque-là, préparer une maintenance vérifiée | [13.5](#section-13-5) | Élevée |
| 11 | Désigner l'emplacement externe des sauvegardes, automatiser et superviser | [19.3](#section-19-3) | Élevée |
| 12 | Automatiser le renouvellement des certificats et alerter avant expiration | [11.5](#section-11-5) | Élevée |
| 13 | Créer un rôle PostgreSQL applicatif non superutilisateur | [13.7](#section-13-7) | Moyenne |
| 14 | Valider la limite mémoire de PostgreSQL sous charge | [9.6](#section-9-6) | Moyenne |
| 15 | Vérifier HSTS et en-têtes côté navigateur ; comportement du port 80 ; CSP | [11.7](#section-11-7), [11.9](#section-11-9) | Moyenne |
| 16 | Restreindre `allowedHosts: true` dans `astro.config.mjs` | [5.7](#section-5-7) | Moyenne |
| 17 | Vérifier le chiffrement des Secrets au repos dans k3s | [14.2.2](#section-14-2-2) | Moyenne |
| 18 | Épingler les actions GitHub par SHA complet | [6.5](#section-6-5) | Moyenne |
| 19 | Mettre en place une sonde externe et le suivi de l'espace disque | [16.3](#section-16-3) | Moyenne |
| 20 | Prévoir un proxy cache Harbor pour Docker Hub | [13.2](#section-13-2) | Faible |
| 21 | Organiser le test smoke dans le parcours GitLab | [17.15](#section-17-15) | Avant publication |
| 22 | Définir des rôles RBAC humains si plusieurs intervenants | [14.2.3](#section-14-2-3) | Faible |
| 23 | Mettre en place la signature des images | [14.2.8](#section-14-2-8) | Faible (PREPROD), élevée (PROD) |
| 24 | Corriger les en-têtes obsolètes des recettes Packer archivées | [4.12](#section-4-12) | Faible |
| 25 | Arbitrer la fusion automatique Renovate au regard des portes humaines | [8.9](#section-8-9) | Faible |
| 26 | Migrer les données réelles SQLite → PostgreSQL ; appliquer le correctif métriques | [13.1](#section-13-1), [16.4](#section-16-4) | Avant PROD |
| 27 | Supprimer les comptes de démonstration avant toute ouverture | [3.4](#section-3-4) | Avant ouverture |
| 28 | Choisir l'orchestrateur et l'hébergeur de production | [22.3](#section-22-3) | Avant PROD |
| 29 | Vérifier la recette réelle de création k3d et ses montages persistants | [9.8](#section-9-8) | Avant reconstruction |
| 30 | Versionner le reçu avec chaque proposition et consigner `GITOPS_REV` | [17.13](#section-17-13) | Avant déploiement |
| 31 | Désigner responsables, remplaçants et preuves de validation | [Annexe I](#annexe-i) | Avant exploitation autonome |

<a id="annexe-g"></a>

## Annexe G — Index des commandes par tâche

Cette annexe répond à une seule question : **« je veux faire ceci, où est-ce expliqué ? »** Elle ne remplace pas les chapitres : les commandes y figurent avec leur contexte, leurs préconditions et leur résultat attendu. Ne jamais copier une commande depuis cet index sans avoir lu la section indiquée.

La colonne **Nature** reprend les étiquettes de la [section Conventions](#conventions).

<a id="g1-comprendre-ou-jen-suis"></a>

### G.1 Comprendre où j'en suis

| Je veux… | Nature | Voir |
|---|---|---|
| Savoir sur quel cluster je travaille | LECTURE | [20.2](#section-20-2), [9.7](#section-9-7) |
| Lister les nœuds et leur version | LECTURE | [9.3](#section-9-3) |
| Voir l'état des Pods, leur aptitude et leurs redémarrages | LECTURE | [16.3](#section-16-3) |
| Voir les événements récents (sondes, téléchargements, `OOMKilled`) | LECTURE | [16.3](#section-16-3) |
| Lire les journaux applicatifs, y compris ceux d'un conteneur mort | LECTURE | [16.3](#section-16-3), [20.2](#section-20-2) |
| Connaître la consommation CPU et mémoire | LECTURE | [16.3](#section-16-3), [9.6](#section-9-6) |
| Connaître la capacité allouable et les réservations | LECTURE | [9.6](#section-9-6) |
| Savoir si Git et le cluster concordent | LECTURE | [10.8](#section-10-8) |
| Voir le détail d'une Application Argo CD | LECTURE | [10.4](#section-10-4), [10.8](#section-10-8) |
| Voir l'historique des synchronisations | LECTURE | [10.8](#section-10-8) |

<a id="g2-construire-et-verifier-une-release"></a>

### G.2 Construire et vérifier une release

| Je veux… | Nature | Voir |
|---|---|---|
| Vérifier que le dépôt est propre et sur le bon SHA | LECTURE | [17.4](#section-17-4) |
| Relever le digest d'une image de base | LECTURE | [5.5](#section-5-5), [17.5](#section-17-5) |
| Générer `backend/requirements.lock` | MODIFICATION LOCALE | [5.4](#section-5-4) |
| Contrôler la mise en forme et la validité des templates Packer | VALIDATION | [4.11](#section-4-11) |
| Vérifier que Packer déclare bien deux builds | LECTURE | [4.11](#section-4-11) |
| Construire les deux images | MODIFICATION LOCALE | [4.11](#section-4-11), [17.6](#section-17-6) |
| Construire un seul composant | MODIFICATION LOCALE | [4.11](#section-4-11) |
| Vérifier que les deux archives forment une paire cohérente | MODIFICATION LOCALE | [8.5](#section-8-5), [17.6](#section-17-6) |
| Lancer le test local complet (quatre sondes) | MODIFICATION LOCALE | [5.10](#section-5-10), [17.7](#section-17-7) |
| Vérifier que l'image refuse de démarrer en `DEBUG` | LECTURE | [5.11](#section-5-11) |
| Scanner les archives et produire les SBOM | ANALYSE | [8.5](#section-8-5), [17.8](#section-17-8) |
| Lancer la validation statique complète | LECTURE | [8.6](#section-8-6) |

<a id="g3-publier-et-promouvoir"></a>

### G.3 Publier et promouvoir

| Je veux… | Nature | Voir |
|---|---|---|
| Transférer un SHA approuvé vers le miroir GitLab | MODIFICATION DISTANTE | [6.4](#section-6-4) |
| Vérifier que le SHA est identique des deux côtés | LECTURE | [6.4](#section-6-4) |
| Publier les images dans Harbor | MODIFICATION DISTANTE | [7.6](#section-7-6), [17.9](#section-17-9) |
| Relever les digests publiés | LECTURE | [7.7](#section-7-7) |
| Produire une proposition GitOps | MODIFICATION LOCALE | [8.7](#section-8-7), [17.10](#section-17-10) |
| Vérifier le rendu Kustomize avant la Merge Request | VALIDATION LOCALE | [9.4](#section-9-4), [17.10](#section-17-10) |
| Vérifier qu'aucune image sans digest ne subsiste | LECTURE | [17.10](#section-17-10) |
| Soumettre la Merge Request de promotion | MODIFICATION DISTANTE | [17.10](#section-17-10) |

<a id="g4-deployer-migrer-revenir-en-arriere"></a>

### G.4 Déployer, migrer, revenir en arrière

| Je veux… | Nature | Voir |
|---|---|---|
| Lire la différence entre Git et le cluster avant de décider | LECTURE | [10.8](#section-10-8), [17.12](#section-17-12) |
| Synchroniser l'application | DÉPLOIEMENT | [10.8](#section-10-8), [17.13](#section-17-13) |
| Attendre que la synchronisation et la santé soient acquises | LECTURE | [10.8](#section-10-8) |
| Sauvegarder avant migration | LECTURE / SAUVEGARDE | [13.6](#section-13-6), [17.13](#section-17-13) |
| Appliquer le Job de migration | DÉPLOIEMENT / MODIFICATION DB | [13.5](#section-13-5), [17.13](#section-17-13) |
| Vérifier l'application après déploiement | LECTURE | [17.14](#section-17-14) |
| Revenir à la version précédente par Git | MODIFICATION puis DÉPLOIEMENT | [18.4](#section-18-4) |
| Revenir en arrière en urgence, hors Git | DÉPLOIEMENT D'URGENCE | [18.5](#section-18-5) |
| Retirer une synchronisation automatique résiduelle | MODIFICATION | [10.7](#section-10-7) |

<a id="g5-donnees-secrets-et-certificats"></a>

### G.5 Données, secrets et certificats

| Je veux… | Nature | Voir |
|---|---|---|
| Vérifier que la base accepte les connexions | LECTURE | [13.9](#section-13-9) |
| Connaître la taille de la base et les connexions actives | LECTURE | [13.9](#section-13-9) |
| Voir l'état des migrations appliquées | LECTURE | [13.9](#section-13-9) |
| Produire une sauvegarde de la base | LECTURE / SAUVEGARDE | [13.6](#section-13-6), [19.4](#section-19-4) |
| Vérifier qu'une sauvegarde est lisible | LECTURE | [13.6](#section-13-6) |
| Tester une restauration dans une base isolée | MODIFICATION DB de test | [13.6](#section-13-6), [19.6](#section-19-6) |
| Restaurer complètement la base de préproduction | DÉPLOIEMENT / MODIFICATION DB | [13.6](#section-13-6), [19.5](#section-19-5) |
| Sauvegarder les médias et l'historique GitOps | LECTURE / MODIFICATION LOCALE | [19.4](#section-19-4) |
| Créer les Secrets applicatifs au bootstrap | DÉPLOIEMENT | [17.11](#section-17-11) |
| Faire tourner un secret | DÉPLOIEMENT | [14.3](#section-14-3) |
| Lister les Secrets sans afficher leur contenu | LECTURE | [14.2](#section-14-2) |
| Contrôler la validité d'un certificat | LECTURE | [11.5](#section-11-5) |
| Faire tourner le certificat TLS sans coupure | DÉPLOIEMENT | [11.5](#section-11-5) |

<a id="g6-verifier-la-securite-et-le-reseau"></a>

### G.6 Vérifier la sécurité et le réseau

| Je veux… | Nature | Voir |
|---|---|---|
| Vérifier l'identité du processus dans un conteneur | LECTURE | [14.2](#section-14-2) |
| Vérifier que le système de fichiers est en lecture seule | LECTURE | [14.2](#section-14-2) |
| Vérifier qu'aucun jeton Kubernetes n'est monté | LECTURE | [14.2](#section-14-2) |
| Vérifier qu'un Pod privilégié serait refusé | LECTURE | [14.2](#section-14-2) |
| Tester les flux autorisés et interdits | LECTURE | [11.6](#section-11-6) |
| Contrôler les en-têtes de sécurité HTTP | LECTURE | [11.7](#section-11-7) |
| Vérifier la résolution DNS et le certificat présenté | LECTURE | [11.9](#section-11-9) |
| Vérifier les ports publiés par k3d sur le VPS | LECTURE | [14.2](#section-14-2) |
| Provoquer une panne et observer le rétablissement | DÉPLOIEMENT | [15.7](#section-15-7) |

---

<a id="annexe-h"></a>

## Annexe H — Fiches de progression

Ces fiches servent à suivre son apprentissage, seul ou avec un tuteur. Une case ne se coche pas après avoir **lu** une section, mais après avoir su **expliquer** ou **faire** ce qu'elle décrit.

<a id="h1-palier-1--je-comprends-le-systeme-parcours-a"></a>

### H.1 Palier 1 — Je comprends le système (parcours A)

- [ ] Je redessine de mémoire le chemin d'une release, du commit au Pod, avec les décisions de livraison
- [ ] Je nomme les quatre composants de l'application et je dis lequel parle à lequel
- [ ] J'explique pourquoi le navigateur n'atteint jamais Django
- [ ] Devant un fichier du dépôt, je dis s'il est actif, compatible ou archivé
- [ ] Je distingue une commande de l'étude OKD d'une commande de la cible active
- [ ] J'explique la différence entre un tag et un digest, et pourquoi FacturaDJ déploie par digest
- [ ] J'explique ce que Packer fait et ce qu'il ne fait pas
- [ ] Je distingue k3s et k3d, et j'en déduis les limites de la préproduction
- [ ] J'interprète les quatre combinaisons courantes de statuts Argo CD
- [ ] Je cite les cinq notions du chapitre 15 et ce que chacune ne protège pas

**Validation du palier** — Présenter l'architecture à quelqu'un qui ne connaît pas le projet, en quinze minutes, sans le manuel sous les yeux.

<a id="h2-palier-2--je-sais-livrer-parcours-b"></a>

### H.2 Palier 2 — Je sais livrer (parcours B)

- [ ] Je vérifie tous les prérequis de [17.2](#section-17-2) sans en oublier
- [ ] Je choisis un parcours de construction et je sais pourquoi je ne dois pas changer en cours de route
- [ ] Je construis les deux images et je contrôle la cohérence de la paire
- [ ] Je lance le test local et j'interprète les quatre sondes
- [ ] Je lis un rapport de scan et je sais ce qui bloque la publication
- [ ] J'explique le rôle de `scanned.sha256` dans mes propres mots
- [ ] Je produis une proposition GitOps et je la relis ligne à ligne
- [ ] Je reconnais un `OutOfSync` normal et un `OutOfSync` anormal
- [ ] Je sauvegarde, je vérifie que la sauvegarde est lisible, puis seulement je migre
- [ ] Je complète le journal de release

**Validation du palier** — Dérouler une release complète accompagné, puis une seconde seul avec relecture des sorties par un tiers.

<a id="h3-palier-3--je-sais-exploiter-parcours-c"></a>

### H.3 Palier 3 — Je sais exploiter (parcours C)

- [ ] Je tiens les quinze premières minutes d'un incident dans l'ordre, sans improviser
- [ ] Je remonte les couches de l'extérieur vers l'intérieur sans commencer par les journaux
- [ ] Je collecte les preuves avant toute action corrective
- [ ] Je décide entre correction, retour arrière et restauration, et je sais justifier mon choix
- [ ] J'effectue un retour arrière GitOps complet, y compris la régularisation après urgence
- [ ] Je restaure une sauvegarde dans une base isolée et je contrôle la numérotation
- [ ] Je fais tourner un secret et je sais à quel moment il est réellement pris en compte
- [ ] Je fais tourner un certificat sans interruption de service
- [ ] J'exécute les tâches périodiques quotidiennes, hebdomadaires et mensuelles
- [ ] Je sais dire ce qui, aujourd'hui, n'est **pas** protégé

**Validation du palier** — Réaliser un test de panne de [15.7](#section-15-7) et un test de restauration de [19.6](#section-19-6), et en rédiger le compte rendu.

<a id="h4-grille-dauto-evaluation"></a>

### H.4 Grille d'auto-évaluation

Pour chaque domaine, situez-vous honnêtement. Le but n'est pas d'atteindre le niveau 3 partout, mais de savoir où vous en êtes avant de prendre une responsabilité.

| Niveau | Ce que cela signifie |
|---|---|
| **0 — Inconnu** | Je ne sais pas de quoi il s'agit |
| **1 — Notion** | Je comprends quand on m'en parle, je ne saurais pas agir |
| **2 — Accompagné** | Je sais faire en suivant la procédure, avec quelqu'un pour relire |
| **3 — Autonome** | Je sais faire seul, et je sais quand m'arrêter et demander |

| Domaine | Chapitres | Niveau visé pour livrer | Niveau visé pour l'astreinte |
|---|---|---|---|
| Architecture générale | [1](#chapitre-01) à [3](#chapitre-03) | 3 | 3 |
| Construction des images | [4](#chapitre-04), [5](#chapitre-05) | 2 | 1 |
| Registry et chaîne CI/CD | [6](#chapitre-06) à [8](#chapitre-08) | 2 | 1 |
| Kubernetes et GitOps | [9](#chapitre-09), [10](#chapitre-10) | 2 | 3 |
| Réseau, TLS, stockage | [11](#chapitre-11), [12](#chapitre-12) | 1 | 2 |
| Base de données et migrations | [13](#chapitre-13) | 2 | 3 |
| Sécurité | [14](#chapitre-14) | 1 | 2 |
| Résilience et observabilité | [15](#chapitre-15), [16](#chapitre-16) | 1 | 3 |
| Déploiement | [17](#chapitre-17) | 3 | 2 |
| Rollback, sauvegarde, dépannage | [18](#chapitre-18) à [20](#chapitre-20) | 2 | 3 |

> **Note** — L'architecture générale exige le niveau 3 dans les deux colonnes. La base de données exige au minimum un accompagnement pour la livraison et le niveau 3 pour l'astreinte, compte tenu de l'impact d'une intervention sur les données.

---

<a id="annexe-i"></a>

## Annexe I — Maintenir le manuel et les décisions

<a id="i1-responsabilites-documentaires"></a>

### I.1 Responsabilités documentaires

Un manuel de référence n'est utile que si chaque changement d'infrastructure laisse une trace au bon endroit. Le fichier Markdown reste le point d'entrée ; les manifests et scripts restent les sources exécutables.

| Responsabilité | Travail attendu | Quand |
|---|---|---|
| Responsable du manuel | Revoir structure, renvois, statut des recommandations et journal des changements | À chaque release d'infrastructure |
| Référent applicatif | Vérifier sondes, dépendances, variables, migrations et tests métier | À chaque évolution de contrat applicatif |
| Référent exploitation | Tester les commandes sur la cible désignée, consigner résultats et limites | Lors d'un exercice ou d'une intervention |
| Référent sécurité | Revoir accès, secrets, exceptions de scan et durée de validité | À chaque changement et revue périodique |
| Référent métier | Valider reprise des données, séquences et parcours de facturation | Avant ouverture et après restauration |

Ces fonctions peuvent être assurées par plusieurs personnes ou par une équipe réduite. Les noms, remplaçants et canaux de contact appartiennent au registre d'exploitation réel ; ils ne sont pas inventés dans cette édition.

<a id="i2-regles-dedition"></a>

### I.2 Règles d'édition

1. Modifier le chapitre de référence avant de créer un nouveau document autonome.
2. Distinguer définition générale, configuration FacturaDJ et procédure opérateur.
3. Réserver les exemples commentés à l'explication ; toujours nommer le fichier exécutable réel.
4. Pour une commande, préciser machine, dossier, variables, effet et résultat attendu.
5. Remplacer les références périmées et relire les annexes concernées.
6. Ne jamais transformer un résultat attendu en résultat observé sans preuve datée.
7. Conserver les décisions abandonnées en archive, avec leur statut et leur date.
8. Mettre à jour une checklist par renvoi à la procédure de référence plutôt que dupliquer un long script.
9. Vérifier les liens internes, les blocs de code et les tableaux avant livraison.
10. Associer toute évolution majeure à une décision d'architecture.

**Exemple de maintenance.** Si le port backend passe de 8000 à un autre port, vérifier le Dockerfile, Gunicorn, le Deployment, le Service, les sondes, `API_URL`, les NetworkPolicies, le smoke, les tests réseau, l'annexe des paramètres et les schémas. Corriger une seule ligne du manuel ne suffit pas.

<a id="i3-modele-de-decision-darchitecture"></a>

### I.3 Modèle de décision d'architecture

Copier ce modèle dans le registre d'architecture du projet ; compléter les champs sans secrets.

~~~text
Identifiant : ADR-AAAA-NNN
Titre : [Décision en une phrase]
Statut : proposé / accepté / remplacé
Date :
Responsable et relecteur :

Contexte :
- Besoin concret et contraintes.
- État actuel et problème observé.

Options :
- Option A : bénéfices, coûts, limites.
- Option B : bénéfices, coûts, limites.

Décision :
- Option retenue et justification.
- Périmètre : DEV / PREPROD / PROD.
- Conséquences pour l'exploitation, la sécurité et la reprise.

Validation :
- Exercice ou tests à réaliser.
- Critères de réussite et résultat obtenu.

Déploiement et repli :
- Ordre des étapes.
- Compatibilité des données et retour possible.

Documentation à mettre à jour :
- Chapitres, tableaux, commandes et annexes.

Réexamen :
- Date ou événement déclencheur.
~~~

<a id="i4-inventaire-reel-de-lenvironnement"></a>

### I.4 Inventaire réel de l'environnement

Compléter ce tableau lors de la première prise en main. Une cellule vide est une information manquante, pas une valeur implicite.

| Champ | Valeur relevée | Date / preuve |
|---|---|---|
| Environnement et propriétaire | | |
| Alias SSH et hôte réel | | |
| Système, CPU, mémoire, disque | | |
| Versions Docker / k3d / k3s | | |
| Nom du cluster / contexte | | |
| Endpoint API et interfaces d'écoute | | |
| Versions Traefik / Argo CD | | |
| Domaine, DNS A/AAAA et TTL | | |
| Certificat : émetteur, noms, échéance | | |
| URL du miroir GitLab | | |
| URL du dépôt GitOps | | |
| Registry et projet Harbor | | |
| Identités de publication et de téléchargement | Noms seulement | |
| StorageClass / reclaimPolicy / mounts hôte | | |
| Capacité et consommation des volumes | | |
| Destination externe de sauvegarde | | |
| Dernière restauration réussie | | |
| RPO / RTO approuvés | | |
| Sonde externe / canal d'alerte | | |
| Responsable de l'intervention / remplaçant | | |

**Lieu des secrets :** noter le nom du gestionnaire ou le chemin protégé, jamais leur contenu.

<a id="i5-modele-de-journal-dincident"></a>

### I.5 Modèle de journal d'incident

~~~text
Incident : INC-AAAA-NNN
Début constaté (UTC) :
Environnement :
Responsable :
Impact : utilisateurs touchés, fonctions indisponibles, données concernées
Gravité : selon la grille de l'équipe

Chronologie :
- Heure : observation, commande de diagnostic, résultat.
- Heure : décision, action, vérification.

État initial :
- SOURCE_REV :
- Digests frontend / backend :
- Commit GitOps :
- Dernière sauvegarde connue :

Hypothèses :
- Hypothèse :
- Preuve qui la confirme ou l'écarte :

Résolution :
- Correction, rollback ou restauration :
- Motif de ce choix :
- Résultat technique :
- Résultat métier :
- Révision finale et conformité GitOps :

Données :
- Point de reprise :
- Perte évaluée :
- RPO / RTO observés :

Suivi :
- Cause établie :
- Facteurs contributifs :
- Action préventive, responsable et échéance :
- Chapitres du manuel corrigés :
~~~

<a id="i6-definition-de--termine-"></a>

### I.6 Définition de « terminé »

**Release terminée :** images et révision identifiées, scan accepté, migration éventuelle réussie, tests techniques et métier passés, accès décidé, journal complété et reçus archivés.

**Incident terminé :** service rétabli, impact compris, données contrôlées, dérive GitOps résolue ou explicitement suivie, mesure préventive assignée.

**Restauration validée :** ensemble récupéré depuis son emplacement externe, déchiffré, restauré, vérifié sur le plan métier et chronométré. Une archive simplement créée n'atteint pas ce niveau.

**Modification du manuel terminée :** liens et code relus, exemples cohérents avec les fichiers, statut des faits mis à jour et changements consignés.

<a id="i7-journal-de-cette-revision"></a>

### I.7 Journal de cette révision

| Domaine | Amélioration de l'édition 3.0 |
|---|---|
| Lecture | Cadre de preuve, contexte d'exécution et contrat commun des runbooks |
| Architecture | Distinction entre SHA applicatif, digests et commit GitOps |
| Gouvernance | Chaîne D1 à D8 cohérente ; protection spécifique du miroir |
| Technique | Limites des checksums, du SBOM, des sondes et de la reproductibilité |
| Déploiement | Scénarios de bootstrap et de mise à jour ; synchronisation sur révision explicite |
| Données | Dump contrôlé, restauration isolée, reprise avec base précédente conservée |
| Sauvegardes | Cohérence base/médias, chiffrement complet, contrôle de l'ensemble restauré |
| Exploitation | Précisions sur secrets, stockage, disponibilité et repli |
| Transmission | Cas d'application, ateliers corrigés, inventaire et modèles de suivi |
| Références | Sources officielles pour les points techniques vérifiés |

Ces corrections concernent **la documentation**. Les recommandations signalées comme à implémenter n'ont pas modifié le code ni l'infrastructure.

<a id="annexe-j"></a>

## Annexe J — Ateliers pratiques et corrigés

<a id="j1-atelier--expliquer-une-requete-de-bout-en-bout"></a>

### J.1 Atelier — Expliquer une requête de bout en bout

**Objectif :** comprendre les dépendances sans lancer de commande.

**Situation.** Un utilisateur ouvre une facture depuis le navigateur. Représenter le DNS public, la terminaison TLS, Astro, Django, PostgreSQL et le stockage du document. Ajouter Redis uniquement là où il intervient dans le fonctionnement applicatif.

**Travail attendu :**

1. Tracer les requêtes dans leur ordre.
2. Indiquer quels flux sont publics et quels flux restent internes.
3. Donner un contrôle permettant de vérifier chaque frontière.
4. Expliquer pourquoi le succès de `/healthz` ne valide pas l'impression d'une facture.

**Corrigé.** Le navigateur rejoint la façade HTTPS ; Traefik route vers Astro ; le serveur Astro appelle Django via le Service interne ; Django lit les données et traite le document. Redis sert aux compteurs partagés et est une dépendance de la readiness. L'impression dépend aussi des données, des permissions et du fichier. La vivacité vérifie que le processus répond ; elle ne teste pas ce parcours métier.

**Preuve d'acquisition :** expliquer cette chaîne à un collègue sans confondre port public et port interne.

<a id="j2-atelier--reconstituer-la-tracabilite"></a>

### J.2 Atelier — Reconstituer la traçabilité

**Objectif :** retrouver ce qui a été construit, publié et déployé.

**Matériel :** un dossier de reçus de release sans secrets, le clone GitOps et un accès en lecture au cluster de recette.

**Travail attendu :**

1. Retrouver `SOURCE_REV` dans `digests.json` et dans les métadonnées d'images.
2. Comparer les références frontend/backend à celles de l'overlay.
3. Comparer le digest du Job au digest backend.
4. Lire la révision observée par Argo CD.
5. Vérifier les références des images réellement déclarées dans les Deployments.

**Corrigé.** Le SHA source doit être cohérent dans la paire et le reçu. Le commit GitOps est différent mais doit contenir ces mêmes références. Un digest différent signale une autre image, même si son tag est identique. `Synced` ne prouve pas que l'image correspond à la release voulue si le mauvais commit a été approuvé.

**Preuve d'acquisition :** compléter un journal de release avec ses quatre identités A, F, B et G.

<a id="j3-atelier--diagnostiquer-un-http-503"></a>

### J.3 Atelier — Diagnostiquer un HTTP 503

**Objectif :** poser une hypothèse à partir de preuves.

**Situation simulée :** les deux `healthz` répondent ; le backend `readyz` répond 503 ; PostgreSQL accepte une connexion ; Redis n'a pas de Pod prêt.

**Questions :**

1. Quel composant examiner en premier ?
2. Pourquoi ne pas redémarrer tous les Pods ?
3. Quelle vérification confirme la réparation ?

**Corrigé.** Examiner Redis : état, événements, logs et ressources. Les processus applicatifs répondent déjà ; leur redémarrage ne répare pas la dépendance indisponible. Confirmer ensuite Redis prêt, readiness backend puis frontend à 200, et enfin une opération métier de recette.

**Variante.** Si Redis répond mais que le frontend ne peut pas joindre Django, examiner le Service, ses sélecteurs et les règles réseau, sans conclure à une panne PostgreSQL.

<a id="j4-atelier--preparer-une-migration"></a>

### J.4 Atelier — Préparer une migration

**Objectif :** décider de l'ordre de livraison avant d'agir.

**Situation.** Une nouvelle version ajoute un champ nullable, puis prévoit sa généralisation dans une release ultérieure.

**Travail attendu :**

1. Identifier les versions de code compatibles avec le schéma intermédiaire.
2. Distinguer migration de schéma et remplissage des données.
3. Préparer le point de retour et la fermeture des accès.
4. Choisir le scénario de 17.13.
5. Définir les contrôles métier après migration.

**Corrigé.** L'ajout nullable facilite la coexistence mais ne garantit pas toute la compatibilité. Vérifier les lectures, écritures et contraintes des deux versions. Sauvegarder les données avant transformation ; exécuter la migration avec le digest de la nouvelle release ; conserver une ancienne version uniquement si elle fonctionne avec le schéma atteint.

**Preuve d'acquisition :** produire un plan que quelqu'un d'autre peut relire et exécuter.

<a id="j5-atelier--prouver-une-restauration"></a>

### J.5 Atelier — Prouver une restauration

**Objectif :** distinguer archive lisible et reprise réelle.

**Matériel :** sauvegarde chiffrée d'un jeu de recette, clé récupérée par le canal prévu et cible isolée.

**Travail attendu :**

1. Télécharger les fichiers depuis l'emplacement externe.
2. Vérifier les empreintes chiffrées, déchiffrer et vérifier les empreintes originales.
3. Restaurer la base dans un nom neuf.
4. Restaurer les médias sur un volume vide.
5. Vérifier des factures connues, leurs montants et leurs documents.
6. Tester un nouveau document fictif et la numérotation.
7. Mesurer durée et espace utilisés.

**Corrigé.** La preuve est le fonctionnement de l'ensemble restauré. Un catalogue `pg_restore --list`, une taille non nulle ou des empreintes valides ne remplacent pas les contrôles applicatifs. Si les documents téléchargés ne correspondent plus aux références en base, la sauvegarde n'était pas cohérente ou la restauration est incomplète.

**Preuve d'acquisition :** compte rendu avec RPO/RTO observés et décision de validité.

<a id="j6-atelier--choisir-un-retour-arriere"></a>

### J.6 Atelier — Choisir un retour arrière

**Situation A :** CSS cassé, aucune migration.  
**Situation B :** nouvel endpoint en échec, migration additive compatible.  
**Situation C :** suppression erronée de données, images inchangées.  
**Situation D :** colonne supprimée, ancien code dépendant de cette colonne.

| Situation | Première voie à examiner | Vérification déterminante |
|---|---|---|
| A | Rollback de la paire d'images par GitOps | Anciennes images disponibles et tests fonctionnels |
| B | Rollback applicatif si compatibilité confirmée | Ancien code compatible avec le schéma actuel |
| C | Restauration ou réparation ciblée des données | Point de reprise, données à préserver, validation métier |
| D | Correction en avant ou reprise planifiée | Schéma atteint, sauvegarde et perte acceptable |

**Corrigé transversal :** `git revert` n'annule pas les écritures SQL déjà réalisées. Une restauration globale peut perdre des écritures valides intervenues depuis la sauvegarde ; elle se décide selon l'impact.

<a id="j7-atelier--revoir-une-proposition-gitops"></a>

### J.7 Atelier — Revoir une proposition GitOps

**Objectif :** détecter une promotion qui remet involontairement les valeurs de préparation.

**Situation.** Les nouveaux digests sont corrects, mais le domaine revient à `example.invalid` et les paramètres de stockage diffèrent.

**Corrigé.** La proposition a probablement été générée depuis les modèles plutôt que depuis le clone GitOps existant. Utiliser `prepare_gitops.py --base`, relire tous les changements et conserver les réglages approuvés. Un reçu correct ne valide pas la configuration.

**Preuve d'acquisition :** expliquer chaque ligne du diff avant la MR.

<a id="j8-bareme-dautonomie"></a>

### J.8 Barème d'autonomie

| Niveau | Capacité démontrée |
|---|---|
| Découverte | Expliquer les composants et le chemin d'une release |
| Pratique accompagnée | Exécuter un runbook, lire ses résultats, reconnaître un arrêt |
| Autonomie en recette | Livrer et revenir en arrière avec preuves et journal |
| Exploitation | Diagnostiquer, restaurer, mesurer la reprise et maintenir la documentation |

Le passage à un niveau se valide sur un exercice ou une intervention observée, pas sur le temps passé à lire.

<a id="annexe-k"></a>

## Annexe K — Références officielles et vérification technique

<a id="k1-sources-du-projet"></a>

### K.1 Sources du projet

Le document transmis constitue la base de cette édition. Les éléments suivants ont été consultés pour vérifier les contrats techniques les plus sensibles :

| Source locale | Point vérifié |
|---|---|
| `infra/README.md` | Cible Packer/Docker, séparation des archives OS/OKD |
| `infra/packer/variables.pkr.hcl` | Formats des variables source et images de base |
| `infra/docker/backend/Dockerfile` et `frontend/Dockerfile` | Étapes de construction, UID, paramètres de démarrage |
| `infra/ci/images.sh` | Étapes séparées, empreintes, scan, publication et reçu |
| `infra/ci/prepare_gitops.py` | Proposition locale et conservation via `--base` |
| `infra/ci/check_static.py` | Portée exacte des contrôles statiques |
| `.gitlab-ci.yml` | Jobs manuels, protections attendues, durée des artefacts |
| `infra/argocd/facturadj-preprod.yaml` | Périmètre Argo CD et absence d'automated |
| `infra/k8s/k3d/*.yaml` | Ressources, labels, flux, stockage et configuration |
| `infra/k8s/operations/migrate.yaml` | Job hors GitOps et paramètres de migration |
| `backend/config/health.py` et `container_settings.py` | Contrat des sondes et exigences PostgreSQL/Redis |
| `frontend/src/pages/readyz.ts` | Readiness transitant par le backend |
| Modèles `core`, `sales` et `accounting` | Noms des tables de vérification |
| `backend/requirements.lock` | Absence constatée dans la copie locale examinée |

Ce recoupement ne constitue pas un audit exhaustif de l'application ni une recette des serveurs.

<a id="k2-references-externes-consultees"></a>

### K.2 Références externes consultées

Consultation : **14 septembre 2026**. Les pages `stable` évoluent ; lors d'une modification du manuel, vérifier les options dans la documentation correspondant à la version réellement installée.

| Sujet | Référence officielle |
|---|---|
| Synchroniser une révision précise | [Argo CD — app sync](https://argo-cd.readthedocs.io/en/stable/user-guide/commands/argocd_app_sync/) |
| Interpréter les différences | [Argo CD — app diff](https://argo-cd.readthedocs.io/en/stable/user-guide/commands/argocd_app_diff/) |
| Installer Argo CD | [Argo CD — Getting Started](https://argo-cd.readthedocs.io/en/stable/getting_started/) |
| Dump cohérent et périmètre des sauvegardes | [PostgreSQL 17 — SQL Dump](https://www.postgresql.org/docs/17/backup-dump.html) |
| Options et limites de restauration | [PostgreSQL 17 — pg_restore](https://www.postgresql.org/docs/17/app-pgrestore.html) |
| Initialisation du rôle et des données | [Docker Official Image — PostgreSQL](https://hub.docker.com/_/postgres) |
| Contexte et fichiers d'exclusion | [Docker — Build context](https://docs.docker.com/build/concepts/context/) |
| Reproductibilité et horodatage | [Docker — Reproducible builds](https://docs.docker.com/build/ci/github-actions/reproducible-builds/) |
| Secrets, accès et stockage | [Kubernetes — Secrets](https://kubernetes.io/docs/concepts/configuration/secret/) |
| Configuration de k3d | [k3d — Config files](https://k3d.io/stable/usage/configfile/) |
| Création de cluster | [k3d — cluster create](https://k3d.io/stable/usage/commands/k3d_cluster_create/) |

<a id="k3-portee-des-valeurs-historiques"></a>

### K.3 Portée des valeurs historiques

Les budgets, capacités, latences et durées issus de l'étude d'août sont conservés comme **hypothèses historiques**. Ils ne constituent ni un devis actuel, ni un test de charge, ni un engagement de disponibilité. La décision de production exige des tarifs à jour et des mesures sur le système retenu.

Les contraintes de conservation et d'intégrité comptable doivent être précisées avec les responsables métier et les conseils compétents. Le manuel décrit les moyens techniques ; il ne fixe pas les obligations juridiques applicables.

---

*Fin du manuel de référence. Maintenir ce fichier avec les changements de l'application et de l'infrastructure ; conserver une preuve datée pour toute capacité déclarée opérationnelle.*
