---
title: "🔐 Sécurité de la Supply Chain Logicielle"
description: " Guide: De la Théorie à la Pratique"
created: "2026-05-02"
# updated: "2026-04-28"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"

---
<!-- 
# 🔐 Sécurité de la Supply Chain Logicielle
## Documentation Complète — De la Théorie à la Pratique -->

> **À qui s'adresse ce document ?**  
> Développeurs, équipes DevOps, responsables sécurité, architectes, managers techniques. Chaque section est conçue pour être lisible sans prérequis, avec des approfondissements pour les profils techniques.

---

## Table des matières

1. [Qu'est-ce que la Supply Chain logicielle ?](#1-quest-ce-que-la-supply-chain-logicielle)
2. [Architecture globale](#2-architecture-globale)
3. [Concepts fondamentaux](#3-concepts-fondamentaux)
4. [Cas d'usage concrets](#4-cas-dusage-concrets)
5. [Bonnes pratiques](#5-bonnes-pratiques)
6. [Analyse des vulnérabilités des outils de scan CI/CD](#6-analyse-des-vulnérabilités-des-outils-de-scan-cicd)
7. [Trivy — L'outil star et ses failles réelles](#7-trivy--loutil-star-et-ses-failles-réelles)
8. [Grype — Alternative fiable et stratégies de migration](#8-grype--alternative-fiable-et-stratégies-de-migration)
9. [Approche de test avant mise en production](#9-approche-de-test-avant-mise-en-production)
10. [Recommandations avancées de sécurité](#10-recommandations-avancées-de-sécurité)
11. [Scénario complet — Gestion de crise de A à Z](#11-scénario-complet--gestion-de-crise-de-a-à-z)
12. [Qui scanne le scanner ?](#12-qui-scanne-le-scanner-)
13. [Glossaire](#13-glossaire)

---

## 1. Qu'est-ce que la Supply Chain logicielle ?

### L'analogie du supermarché

Imaginez que vous achetez un yaourt au supermarché. Ce yaourt n'a pas été créé en une seule étape : des agriculteurs ont élevé des vaches, des usines ont transformé le lait, des camions l'ont transporté, des distributeurs l'ont stocké, et le supermarché l'a mis en rayon. Si une contamination survient à n'importe quelle étape de cette chaîne, c'est votre yaourt qui est affecté — même si le supermarché est irréprochable.

**La supply chain logicielle fonctionne exactement de la même façon.** Votre application repose sur des dizaines (parfois des centaines) de composants fournis par des tiers : bibliothèques open source, frameworks, outils de build, images Docker, pipelines CI/CD, plugins d'IDE, services cloud… Chacun de ces maillons est un point d'entrée potentiel pour un attaquant.

### Pourquoi c'est un sujet critique aujourd'hui ?

L'attaque **SolarWinds** (2020) a marqué un tournant : en compromettant le système de build d'un éditeur de logiciels, des attaquants ont réussi à infecter des milliers d'organisations à travers le monde — dont des agences gouvernementales américaines — sans jamais toucher directement leurs systèmes. La porte d'entrée était un outil que tout le monde utilisait en confiance.

Depuis, les attaques sur la supply chain logicielle ont explosé. Selon les données de 2026, les incidents liés à des dépendances compromises représentent plus de 60 % des vecteurs d'intrusion dans les entreprises numériques.

---

## 2. Architecture globale

### La chaîne de confiance, étape par étape

```
[Développeur]
     │
     ▼
[Code source] ──── Bibliothèques open source (npm, PyPI, Maven...)
     │                       │
     ▼                       ▼
[Dépôt Git] ────── Workflows CI/CD (GitHub Actions, GitLab CI...)
     │                       │
     ▼                       ▼
[Pipeline de build] ─── Outils de scan (Trivy, Grype, Semgrep...)
     │                       │
     ▼                       ▼
[Image/Artefact] ────── Registres (Docker Hub, Artifactory...)
     │
     ▼
[Déploiement] ──────── Infrastructure (K8s, cloud providers...)
     │
     ▼
[Production] ◄───────── Monitoring & Runtime Security
```

### Les 4 zones de risque majeures

**Zone 1 — Le code et ses dépendances**
Tout ce que vous écrivez et tout ce que vous importez. Une seule bibliothèque malveillante dans vos 200 dépendances peut compromettre toute votre application.

**Zone 2 — Le système de build**
Les outils qui transforment votre code en produit livrable. Si un attaquant modifie votre pipeline CI/CD, il peut insérer du code malveillant dans l'artefact final — et personne ne le verra dans le code source.

**Zone 3 — La distribution**
Les registres d'images (Docker Hub), les gestionnaires de paquets (npm, PyPI) et les CDN. Un paquet légitime peut être remplacé par une version compromise.

**Zone 4 — Les outils de sécurité eux-mêmes**
C'est le paradoxe central : **les outils censés vous protéger peuvent eux-mêmes être compromis**. Les événements Trivy de 2026 (détaillés plus loin) l'ont démontré de façon spectaculaire.

---

## 3. Concepts fondamentaux

### 3.1 SBOM — Software Bill of Materials

**C'est quoi ?** Un SBOM est l'inventaire exhaustif de tous les composants d'un logiciel : bibliothèques, frameworks, versions, licences, origines. Pensez à la liste d'ingrédients sur un emballage alimentaire, mais pour votre application.

**Pourquoi c'est important ?**
- Quand une vulnérabilité est découverte (par exemple, une faille dans OpenSSL), vous savez immédiatement si vous êtes concerné et où.
- Certaines réglementations (notamment aux États-Unis avec l'executive order sur la cybersécurité) rendent le SBOM obligatoire pour les logiciels vendus aux agences gouvernementales.

**Les deux formats standards :**

| Format | Créé par | Points forts |
|--------|----------|--------------|
| **SPDX** | Linux Foundation | Standard ISO/IEC 5962, très utilisé en entreprise |
| **CycloneDX** | OWASP | Orienté sécurité, supporte les SBOM de services et matériels |

**Exemple concret de génération avec Syft :**
```bash
# Générer un SBOM au format CycloneDX pour une image Docker
syft my-app:latest -o cyclonedx-json > sbom.json

# Générer un SBOM pour un répertoire de code source
syft dir:./mon-projet -o spdx-json > sbom-source.json
```

### 3.2 CVE — Common Vulnerabilities and Exposures

**C'est quoi ?** Un identifiant unique pour chaque vulnérabilité connue. Par exemple, `CVE-2021-44228` désigne la fameuse faille Log4Shell. Ces identifiants permettent à tous les outils et équipes de parler de la même vulnérabilité sans ambiguïté.

**La chaîne CVE :**
```
Chercheur découvre une faille
        │
        ▼
Signalement au CVE Program (MITRE)
        │
        ▼
Attribution d'un identifiant CVE-XXXX-XXXXX
        │
        ▼
Publication dans la NVD (National Vulnerability Database)
        │
        ▼
Mise à jour des bases de données des scanners (Trivy, Grype...)
        │
        ▼
Votre pipeline détecte la faille lors du prochain scan
```

### 3.3 SCA — Software Composition Analysis

**C'est quoi ?** L'analyse automatisée des dépendances de votre code pour détecter les vulnérabilités connues, les problèmes de licence et les composants obsolètes. C'est la brique fondamentale de la sécurité des dépendances.

Outils populaires : Trivy, Grype, Snyk, Dependabot, OWASP Dependency-Check.

### 3.4 Signature et attestation des artefacts

**Le principe :** Signer cryptographiquement chaque composant produit (image Docker, binaire, SBOM) permet à quiconque de vérifier :
- Que l'artefact provient bien de qui prétend l'avoir produit.
- Qu'il n'a pas été modifié depuis sa création.

**Les outils :**

`Cosign` (de Sigstore) est aujourd'hui le standard de facto pour signer des images de conteneurs :
```bash
# Signer une image
cosign sign --key cosign.key mon-registre.io/mon-app:v1.2.3

# Vérifier la signature
cosign verify --key cosign.pub mon-registre.io/mon-app:v1.2.3
```

`Sigstore` propose même une signature sans gestion de clés privées grâce à l'identité OIDC (OpenID Connect), ce qui simplifie considérablement le déploiement.

### 3.5 SLSA — Supply chain Levels for Software Artifacts

**Prononcé "salsa"**, SLSA est un framework développé par Google qui définit 4 niveaux de maturité dans la sécurisation de votre chaîne de production logicielle.

| Niveau | Ce qui est requis | Exemple |
|--------|------------------|---------|
| **SLSA 1** | Build automatisé, SBOM généré | CI/CD basique qui génère un SBOM |
| **SLSA 2** | Provenance générée, dépôt Git versionné | GitHub Actions avec provenance |
| **SLSA 3** | Build hermétique, provenance vérifiable | Builds isolés et reproductibles |
| **SLSA 4** | 2 revues humaines, builds reproductibles | Processus enterprise mature |

### 3.6 Politique de confiance (Trust Policy)

Une politique qui définit explicitement ce que votre organisation considère comme "digne de confiance" :
- Seules les images signées par votre registre interne sont déployables.
- Toute image avec une CVE critique bloque le pipeline.
- Seules certaines versions d'une dépendance sont autorisées.

Ces politiques peuvent être appliquées par des outils comme **OPA (Open Policy Agent)**, **Kyverno** (pour Kubernetes), ou **Cosign** pour la vérification de signatures.

---

## 4. Cas d'usage concrets

### Cas 1 — L'attaque SolarWinds (2020) : le scénario fondateur

**Contexte :** SolarWinds est un éditeur de logiciels de gestion réseau utilisé par des milliers d'entreprises et d'agences gouvernementales. Son produit Orion était installé dans plus de 30 000 organisations.

**Déroulement :**
Des attaquants (ultérieurement attribués aux services russes SVR) ont réussi à accéder au système de build de SolarWinds. Pendant environ neuf mois, à chaque mise à jour légitime d'Orion, une backdoor nommée SUNBURST était automatiquement insérée dans le binaire compilé. Le code source était propre ; la contamination se produisait pendant la compilation.

**Impact :** Environ 18 000 organisations ont installé la mise à jour compromise, dont le département du Trésor américain, le Pentagone et Microsoft.

**Leçon clé :** La confiance dans un éditeur reconnu ne protège pas si son système de build est compromis. Il faut vérifier les artefacts, pas seulement les sources.

---

### Cas 2 — Log4Shell (CVE-2021-44228) : la bombe à retardement dans les dépendances

**Contexte :** Log4j est une bibliothèque Java de journalisation utilisée par des millions d'applications dans le monde. En décembre 2021, une vulnérabilité critique est découverte permettant l'exécution de code à distance via un simple message de log.

**Le problème supply chain :** Énormément d'équipes ne savaient même pas qu'elles utilisaient Log4j, car cette bibliothèque était une dépendance transitive — une dépendance de leurs dépendances.

**Leçon clé :** Sans SBOM et sans scan automatique des dépendances transitives, il est impossible de savoir en quelques heures si vous êtes exposé. Les organisations avec des SBOM à jour ont identifié leur exposition en minutes ; les autres ont mis des semaines.

---

### Cas 3 — event-stream (npm, 2018) : le mainteneur piégé

**Contexte :** Un développeur cède la maintenance d'un paquet npm populaire (`event-stream`, 2 millions de téléchargements/semaine) à un inconnu. Ce nouveau mainteneur insère discrètement une dépendance malveillante ciblant spécifiquement des portefeuilles Bitcoin.

**Leçon clé :** La confiance dans un paquet populaire peut être trahie par un changement de mainteneur. Il faut surveiller les changements de propriétaire dans vos dépendances critiques.

---

### Cas 4 — L'attaque hackerbot-claw contre Trivy (2026) : quand le scanner est la cible

C'est l'événement le plus récent et le plus pédagogique sur le thème "qui scanne le scanner ?".

**Contexte :** En février 2026, un bot autonome baptisé `hackerbot-claw`, propulsé par un modèle d'IA, a conduit une campagne systématique ciblant des dépôts GitHub de projets open source majeurs.

**Cibles et résultats :**

| Cible | Étoiles GitHub | Technique | Résultat |
|-------|---------------|-----------|---------- |
| aquasecurity/trivy | 25 000+ | Vol de PAT via `pull_request_target` | Compromis total : 178 releases supprimées, extension VS Code malveillante publiée |
| avelino/awesome-go | 140 000+ | Fonction Go `init()` empoisonnée | RCE confirmé, token GitHub exfiltré |
| microsoft/ai-discovery-agent | N/A | Injection via nom de branche | RCE probable |
| DataDog/datadog-iac-scanner | N/A | Injection via nom de fichier | RCE probable |

**La deuxième compromission de Trivy (mars 2026) :**

Trois semaines après le premier incident, l'attaquant a frappé à nouveau. La version v0.69.4 de Trivy publiée sur GitHub contenait un binaire malveillant se connectant à un domaine de commande et contrôle (C2) avec une typo subtile : `scan.aquasecurtiy.org` (au lieu de `aquasecurity.org`). Les GitHub Actions `trivy-action` et `setup-trivy` ont également été compromises pendant plusieurs heures, injectant un voleur de secrets capable de :
- Lire la mémoire du processus Runner de GitHub Actions via `/proc/<pid>/mem`
- Collecter les clés SSH, credentials AWS/GCP/Azure, secrets Kubernetes, wallets crypto (Solana, Bitcoin, Ethereum)
- Chiffrer les données volées avec RSA-4096 et les exfiltrer vers le C2
- En cas d'échec de l'exfiltration directe, créer un dépôt public `tpcp-docs` sur le compte victime et y uploader les secrets comme release asset

**Leçon clé :** Même l'outil de sécurité peut être la menace. Un pipeline qui repose sur un seul scanner non vérifié et épinglé par tag seulement (et non par hash SHA) est vulnérable.

---

## 5. Bonnes pratiques

### 5.1 Versionner et épingler précisément les dépendances

Mauvaise pratique :
```yaml
# .github/workflows/scan.yml
- uses: aquasecurity/trivy-action@main  # DANGEREUX : "main" peut changer à tout moment
```

Bonne pratique :
```yaml
# Épingler par hash SHA immuable — le tag peut être réécrit, le hash non
- uses: aquasecurity/trivy-action@6e7b7d1fd3e4fef0c5fa8cce1229c54b2c9bd0d8
```

Pour vos dépendances applicatives, utilisez des fichiers de lock (`package-lock.json`, `Pipfile.lock`, `go.sum`) et ne les ignorez jamais dans votre `.gitignore`.

### 5.2 Activer les scans de sécurité dans le pipeline CI/CD

Exemple de pipeline GitLab CI intégrant un scan Grype :
```yaml
scan-vulnerabilities:
  stage: security
  image: alpine:3.19
  script:
    - apk add --no-cache curl
    # Télécharger Grype avec vérification du checksum
    - curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b /usr/local/bin v0.80.0
    - grype dir:. --fail-on high -o json > grype-report.json
  artifacts:
    paths:
      - grype-report.json
    reports:
      junit: grype-report.json
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
```

### 5.3 Générer et signer les SBOM systématiquement

```bash
# Dans le pipeline, après le build de l'image
syft my-app:$CI_COMMIT_SHA -o cyclonedx-json > sbom.json

# Signer le SBOM
cosign attest --predicate sbom.json --type cyclonedx my-registry.io/my-app:$CI_COMMIT_SHA

# Signer l'image elle-même
cosign sign my-registry.io/my-app:$CI_COMMIT_SHA
```

### 5.4 Utiliser plusieurs scanners en parallèle (défense en profondeur)

Ne jamais se reposer sur un seul outil. Les bases de données de vulnérabilités diffèrent et se complètent :

```yaml
parallel-scans:
  parallel:
    matrix:
      - SCANNER: [grype, trivy, osv-scanner]
  script:
    - run-scanner $SCANNER my-app:latest
```

### 5.5 Appliquer le principe de moindre privilège aux pipelines

- Les tokens CI/CD ne doivent avoir que les droits nécessaires.
- Utilisez des tokens éphémères (OIDC) plutôt que des secrets statiques longue durée.
- Séparez les environnements (staging, production) avec des permissions différentes.

### 5.6 Surveiller les alertes Dependabot / Renovate

Configurez des mises à jour automatiques de dépendances avec des revues obligatoires pour les mises à jour majeures. Dependabot et Renovate ouvrent des PR automatiquement quand une vulnérabilité est détectée dans vos dépendances.

### 5.7 Auditer régulièrement vos GitHub Actions tierces

```bash
# poutine : scanner multi-plateforme pour les workflows CI/CD
docker run --rm ghcr.io/boostsecurityio/poutine:latest analyze_repo \
  --repo votre-org/votre-depot \
  --token $GITHUB_TOKEN
```

### 5.8 Mettre en place une politique de blocage en cas de vulnérabilité critique

```yaml
# Exemple avec Trivy : bloquer le pipeline si CVE critique ou haute
trivy image --exit-code 1 --severity CRITICAL,HIGH my-app:latest
```

---

## 6. Analyse des vulnérabilités des outils de scan CI/CD

### Le paradoxe du gardien

Un outil de sécurité est, par définition, un composant privilégié dans votre pipeline. Il a accès à votre code, à vos artefacts, parfois à vos secrets et à votre infrastructure. Si ce composant est compromis, l'attaquant dispose d'un accès de premier ordre.

Les vecteurs d'attaque contre les scanners eux-mêmes incluent :

**1. Compromission du dépôt source (upstream)**
L'attaquant obtient un accès au dépôt GitHub de l'outil (vol de token, phishing du mainteneur, exploitation de workflows) et publie une version malveillante.

**2. Attaque sur la chaîne de publication (release pipeline)**
Le système de build automatique de l'outil est compromis. Le code source est sain, mais le binaire publié ne l'est pas (comme SolarWinds).

**3. Typosquatting du domaine ou du paquet**
Un domaine ou paquet quasi-identique (`aquasecurtiy.org` au lieu de `aquasecurity.org`) est utilisé pour distribuer une version malveillante.

**4. Compromission des GitHub Actions associées**
L'action officielle qui installe ou exécute le scanner est modifiée pour injecter un payload malveillant.

**5. Manipulation des bases de données de vulnérabilités**
Un attaquant sophistiqué pourrait théoriquement manipuler les sources de données CVE utilisées par le scanner pour masquer des vulnérabilités (supprimer des entrées) ou créer du bruit (faux positifs massifs).

### Tableau de risque des principaux scanners

| Outil | Vecteur de risque principal | Incidents connus | Mitigation |
|-------|---------------------------|-----------------|------------|
| **Trivy** | GitHub Action compromise, releases malveillantes | Oui (2026, 2x) | Épingler par SHA, utiliser registre local |
| **Grype** | Compromission upstream hypothétique | Non confirmé | Vérification de checksum, miroir interne |
| **Snyk CLI** | Token d'API exposé, dépendance npm | Incidents mineurs | OIDC, rotation de tokens |
| **OWASP Dep-Check** | Dépendances Java transitives | Aucun majeur | Build hermétique |
| **Semgrep** | Règles communautaires malveillantes | Aucun majeur | Audit des rulesets utilisés |

---

## 7. Trivy — L'outil star et ses failles réelles

### Présentation de Trivy

Trivy (par Aqua Security) est le scanner de sécurité open source le plus utilisé dans les pipelines CI/CD modernes. Il scanne images Docker, code source, dépendances, fichiers de configuration IaC, et génère des SBOM. Avec plus de 25 000 étoiles sur GitHub, il est devenu un standard de facto.

### Les incidents de 2026 : chronologie détaillée

#### Incident 1 — Campagne hackerbot-claw (28 février 2026)

Un bot IA autonome a exploité un workflow `pull_request_target` mal configuré dans le dépôt `aquasecurity/trivy`. Ce type de workflow est dangereux car il s'exécute avec les permissions du dépôt cible (pas du fork), donnant accès aux secrets.

Le bot a soumis une pull request conçue pour déclencher ce workflow et exfiltrer le Personal Access Token (PAT) de la CI. Avec ce token, l'attaquant a :
- Privatisé le dépôt Trivy
- Supprimé les 178 releases entre v0.27.0 et v0.69.1
- Publié une extension VS Code malveillante sur le marketplace Open VSX

#### Incident 2 — Compromission de la release v0.69.4 (19 mars 2026)

Trois semaines après l'incident initial, la remédiation étant incomplète, l'attaquant a frappé à nouveau avec une sophistication accrue :

La release v0.69.4 a été publiée automatiquement par le bot de release (`aqua-bot`) avec des binaires contenant un C2 hardcodé. Les images Docker `aquasec/trivy:0.69.5` et `aquasec/trivy:0.69.6` ont également été confirmées compromises.

La GitHub Action `trivy-action` (tous les tags de 0.0.1 à 0.34.2) a été modifiée pour injecter un voleur de credentials dans `entrypoint.sh`. Le payload ajoutait 105 lignes à un fichier qui n'en contenait que 2 à l'origine, avec :
- Lecture de la mémoire du processus Runner via `/proc/<pid>/mem`
- Un script Python encodé en base64 extrayant tous les secrets marqués `isSecret: true`
- Chiffrement RSA-4096 + AES-256-CBC des données volées
- Exfiltration vers `scan.aquasecurtiy.org` (typosquat)

Pour dissimuler l'attaque, des dizaines de bots spam ont inondé les discussions GitHub avec de faux commentaires d'éloge, enterrant les alertes de la communauté.

#### Détection et réponse

L'outil **Harden-Runner** de StepSecurity, utilisé gratuitement par plus de 12 000 dépôts publics, a détecté les connexions sortantes anormales vers le domaine C2 et a alerté les projets affectés. Cette détection a été cruciale pour accélérer la réponse.

**Versions saines recommandées après l'incident :** Trivy v0.70.0+ (à vérifier) ou utiliser `v0.2.6` de `setup-trivy`.

### Mitigation immédiate post-incident Trivy

```yaml
# Avant (vulnérable — tag modifiable)
- uses: aquasecurity/trivy-action@0.34.2

# Après (sécurisé — hash immuable de la version propre)
- uses: aquasecurity/trivy-action@a20de5420d57c4102486cdd9349b532bf4b671e4

# Ou mieux : utiliser Grype comme alternative pendant la période de crise
- name: Scan with Grype
  run: |
    GRYPE_VERSION="v0.80.0"
    EXPECTED_SHA256="<sha256-known-good>"
    curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh \
      | sha256sum --check <(echo "$EXPECTED_SHA256  -")
    sh -s -- -b /usr/local/bin $GRYPE_VERSION
    grype dir:. --fail-on critical
```

---

## 8. Grype — Alternative fiable et stratégies de migration

### Présentation de Grype

Grype est développé par Anchore, une société spécialisée dans la sécurité des conteneurs. Il s'agit d'un scanner de vulnérabilités open source qui se distingue par :
- Une architecture modulaire (couplé à **Syft** pour la génération de SBOM)
- Un support de nombreux formats d'entrée (images Docker, SBOM CycloneDX/SPDX, répertoires, archives)
- Une base de données de vulnérabilités maintenue indépendamment (`grypedb`)
- Une licence Apache 2.0 permettant une utilisation commerciale libre

### Trivy vs Grype — Comparaison technique

| Critère | Trivy | Grype |
|---------|-------|-------|
| Langages supportés | Très large (Go, Java, Python, Ruby, PHP, .NET, Rust, Elixir...) | Large (Go, Java, Python, Ruby, PHP, .NET, C/C++) |
| Sources CVE | GitHub Advisory, NVD, distro-specific, OSV | Anchore DB (NVD, GitHub Advisory, RHSA, DSA...) |
| Génération SBOM | Oui (natif) | Via Syft (outil complémentaire) |
| Scan IaC | Oui | Non |
| Scan secrets | Oui | Non |
| Performance | Rapide | Très rapide |
| Incidents de sécurité | 2 incidents majeurs en 2026 | Aucun confirmé à ce jour |
| GitHub Stars | ~25 000 | ~9 000 |
| Mode hors-ligne | Oui | Oui |

### Mise en place de Grype comme scanner primaire ou de secours

#### Installation et vérification de l'intégrité

```bash
# Méthode recommandée : installation avec vérification de checksum
VERSION="v0.80.0"
OS="linux"
ARCH="amd64"

# Téléchargement
curl -sSfL "https://github.com/anchore/grype/releases/download/${VERSION}/grype_${VERSION:1}_${OS}_${ARCH}.tar.gz" \
  -o grype.tar.gz

# Télécharger les checksums signés
curl -sSfL "https://github.com/anchore/grype/releases/download/${VERSION}/grype_${VERSION:1}_checksums.txt" \
  -o checksums.txt

# Vérification
sha256sum --check checksums.txt --ignore-missing

# Installation
tar -xzf grype.tar.gz grype
sudo mv grype /usr/local/bin/
```

#### Usage de base

```bash
# Scanner une image Docker
grype my-app:latest

# Scanner un répertoire
grype dir:./mon-projet

# Scanner un SBOM existant
grype sbom:./sbom.json

# Bloquer sur CRITICAL et HIGH, sortie JSON
grype my-app:latest --fail-on high -o json > rapport.json

# Utiliser la base de données en mode hors-ligne (après mise à jour préalable)
grype db update
grype --only-fixed my-app:latest
```

#### Intégration dans un pipeline GitHub Actions sécurisé

```yaml
name: Security Scan

on:
  push:
    branches: [main]
  pull_request:

jobs:
  vulnerability-scan:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      contents: read

    steps:
      - name: Checkout
        uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # SHA épinglé

      - name: Build image
        run: docker build -t my-app:${{ github.sha }} .

      - name: Generate SBOM with Syft
        run: |
          curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh \
            | sh -s -- -b /usr/local/bin v1.4.0
          syft my-app:${{ github.sha }} -o cyclonedx-json > sbom.json

      - name: Scan with Grype
        run: |
          curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh \
            | sh -s -- -b /usr/local/bin v0.80.0
          grype sbom:sbom.json --fail-on critical -o sarif > results.sarif

      - name: Upload SARIF to GitHub Security
        uses: github/codeql-action/upload-sarif@1b1aada464948af03b950897e5eb522f475603f2
        with:
          sarif_file: results.sarif
```

### Stratégie de miroir interne (résilience maximale)

En cas de compromission d'un outil en amont, avoir un miroir interne vous permet de continuer à opérer de façon autonome :

```bash
# Mettre en place un miroir de la base de données Grype
# (à faire régulièrement dans un job planifié)
grype db update
cp -r ~/.cache/grype /opt/grype-db-mirror/$(date +%Y%m%d)

# Utiliser le miroir dans le pipeline
export GRYPE_DB_CACHE_DIR=/opt/grype-db-mirror/20260501
grype my-app:latest
```

### Mise en place d'une solution alternative en cas de compromission de Grype

Si Grype venait lui-même à être compromis, voici la stratégie de fallback en couches :

**Couche 1 — OSV-Scanner (Google)**
```bash
# Scanner basé sur la base de données OSV (Open Source Vulnerabilities)
osv-scanner scan --sbom sbom.json
```

**Couche 2 — OWASP Dependency-Check**
```bash
dependency-check --project "mon-app" --scan ./mon-projet --out ./rapport
```

**Couche 3 — Analyse manuelle du SBOM contre NVD/OSV**
```bash
# Script Python simple pour croiser le SBOM avec l'API OSV
python3 check-sbom-osv.py sbom.json
```

**Règle d'or :** Ne jamais dépendre d'un seul outil. Un pipeline de sécurité mature utilise au minimum deux scanners aux sources de données différentes.

---

## 9. Approche de test avant mise en production

### 9.1 Stratégie de validation des outils de sécurité eux-mêmes

Avant de basculer vers un nouvel outil (ou après une mise à jour), il faut le valider systématiquement. C'est le principe du "tester le testeur".

#### Vérification de l'intégrité du binaire

```bash
# 1. Télécharger le binaire et sa somme de contrôle officielle
# 2. Vérifier la signature cosign si disponible
cosign verify-blob \
  --certificate grype_linux_amd64.tar.gz.pem \
  --signature grype_linux_amd64.tar.gz.sig \
  --certificate-identity "https://github.com/anchore/grype/.github/workflows/release.yaml@refs/tags/v0.80.0" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com" \
  grype_linux_amd64.tar.gz
```

#### Tests sur des vulnérabilités connues (golden tests)

Avant de déployer un scanner en production, validez qu'il détecte correctement des CVE connues :

```bash
# Image de test contenant des vulnérabilités délibérées
docker pull ghcr.io/anchore/test_images/vulnerabilities-alpine:latest

# Le scanner doit détecter au moins ces CVE connues
EXPECTED_CVE="CVE-2019-8457"
grype ghcr.io/anchore/test_images/vulnerabilities-alpine:latest -o json \
  | jq '.matches[].vulnerability.id' | grep -q "$EXPECTED_CVE"
echo "Test CVE $EXPECTED_CVE : $?"

# Tester également les faux positifs : votre image "propre" ne doit pas déclencher d'alertes
grype ma-base-image-propre:latest --fail-on critical
```

#### Test de comportement réseau (détection d'exfiltration)

Avant de faire confiance à un scanner, vérifiez qu'il ne fait pas de connexions sortantes inattendues :

```bash
# Exécuter le scanner dans un réseau isolé et journaliser le trafic
docker run --network none \
  -v $(pwd)/projet:/scan \
  grype:latest \
  dir:/scan \
  -o json > results.json

# Si le scan réussit en mode sans réseau, c'est rassurant
# Si le scan échoue (connexion refusée), investiguer pourquoi il nécessite internet
```

### 9.2 Environnement de staging dédié à la sécurité

```
[Développeur]
     │
     ▼
[PR / Merge Request]
     │
     ▼
[Pipeline Staging] ← Tous les scanners avec règles strictes
     │              ← Tests fonctionnels complets
     │              ← Vérification des signatures
     │              ← Comparaison des rapports entre outils
     ▼
[Validation Humaine pour les PRs sensibles]
     │
     ▼
[Pipeline Production] ← Scanners + contrôle de politique (OPA/Kyverno)
```

### 9.3 Canary deployment pour les outils de sécurité

Lors du passage d'un scanner v1 à v2 (ou d'un outil A à un outil B) :

1. **Phase 1 (1 semaine)** — Faire tourner les deux en parallèle, comparer les résultats.
2. **Phase 2 (1 semaine)** — Le nouveau scanner bloque, l'ancien surveille. Analyser les divergences.
3. **Phase 3** — Basculement complet avec rollback automatique si taux d'erreur anormal.

```yaml
# Exemple : double scan en parallèle pendant la période de migration
parallel-security-scan:
  parallel:
    matrix:
      - SCANNER: [grype-v0-79, grype-v0-80]
  script:
    - run-scanner.sh $SCANNER ./mon-image:latest
  allow_failure:
    - SCANNER: grype-v0-80  # Nouveau scanner en mode observation uniquement
```

### 9.4 Politique de mise à jour des scanners

| Situation | Action recommandée |
|-----------|-------------------|
| Mise à jour mineure (patch) | Mise à jour automatique après vérification du checksum |
| Mise à jour majeure | Test en staging pendant 1 semaine avant production |
| Alerte de sécurité sur le scanner | Gel immédiat, passage sur le scanner alternatif, investigation |
| Nouveau mainteneur du projet | Audit approfondi avant toute mise à jour |

---

## 10. Recommandations avancées de sécurité

### 10.1 Hardening des runners CI/CD

Les runners (machines qui exécutent vos pipelines) sont des cibles de choix. Recommandations :

```yaml
# GitHub Actions : restreindre les permissions par défaut
permissions:
  contents: read  # Lecture seule par défaut
  # Ne donner que ce qui est nécessaire step par step

# Utiliser des runners éphémères (destroyed after each job)
runs-on: ubuntu-latest  # Préférer les runners éphémères fournis par GitHub
# Pour self-hosted, configurer l'auto-destroy après chaque job
```

**Harden-Runner** (StepSecurity) : outil gratuit pour les dépôts publics qui surveille le trafic réseau de vos runners et bloque les connexions sortantes non autorisées. C'est lui qui a détecté l'attaque Trivy de 2026 en temps réel.

### 10.2 Politique de réseau sortant (allowlist)

```yaml
# Avec Harden-Runner : définir une liste d'autorisations réseau
- name: Harden runner
  uses: step-security/harden-runner@eb238132834751a4db4043c8af7f4c6d1d4e2c57
  with:
    egress-policy: block
    allowed-endpoints: |
      api.github.com:443
      ghcr.io:443
      registry.npmjs.org:443
      pypi.org:443
      # Tout le reste est bloqué — si votre scanner tente de joindre un domaine inconnu, l'alerte se déclenche
```

### 10.3 Vérification de la provenance des artefacts (SLSA)

```bash
# Vérifier la provenance SLSA d'un artefact
slsa-verifier verify-artifact \
  --provenance-path provenance.json \
  --source-uri github.com/mon-org/mon-app \
  mon-app-v1.2.3.tar.gz
```

### 10.4 Politique de sécurité Kubernetes (admission control)

```yaml
# Kyverno : refuser tout déploiement d'image non signée
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-image-signature
spec:
  validationFailureAction: Enforce
  rules:
    - name: verify-cosign-signature
      match:
        resources:
          kinds: [Pod]
      verifyImages:
        - imageReferences: ["*"]
          attestors:
            - entries:
                - keyless:
                    subject: "https://github.com/mon-org/mon-app/.github/workflows/release.yaml@refs/tags/*"
                    issuer: "https://token.actions.githubusercontent.com"
```

### 10.5 Gestion des secrets dans le pipeline

- **Jamais** de secrets en dur dans le code ou les Dockerfiles.
- Utiliser des variables de CI/CD marquées comme "masked" et "protected".
- Préférer les tokens OIDC éphémères aux clés statiques (GitHub Actions → AWS, GCP, Azure sans secret stocké).
- Effectuer des rotations régulières et auditer les accès.

```yaml
# OIDC token pour accéder à AWS sans secret statique
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@010d0da01d0b5a38af31e9c3470dbfdabdecca3a
  with:
    role-to-assume: arn:aws:iam::ACCOUNT:role/GitHubActionsRole
    aws-region: eu-west-1
    # Pas de AWS_ACCESS_KEY_ID ni AWS_SECRET_ACCESS_KEY nécessaires !
```

### 10.6 Surveillance des changements dans vos dépendances

```bash
# Renovate Bot : configurer des alertes sur les changements de mainteneur
# .github/renovate.json
{
  "packageRules": [
    {
      "matchManagers": ["npm"],
      "reviewers": ["security-team"],
      "labels": ["security-review"],
      "minimumReleaseAge": "3 days"  // Ne pas mettre à jour immédiatement une nouvelle version
    }
  ]
}
```

### 10.7 Threat Modeling de votre pipeline CI/CD

Appliquer la méthode STRIDE à votre pipeline :

| Menace STRIDE | Exemple concret dans un pipeline | Mitigation |
|--------------|----------------------------------|------------|
| **S**poofing | Faux commit "from trusted maintainer" | Vérification GPG des commits |
| **T**ampering | Modification du binaire après build | Signature des artefacts (cosign) |
| **R**epudiation | "Je n'ai pas poussé ce commit" | Logs immuables (Git, audit trails) |
| **I**nformation disclosure | Secrets dans les logs CI | Masquage des variables, rotation |
| **D**enial of Service | Pipeline surchargé, pas de scan | Timeouts, fallback scanner |
| **E**levation of privilege | Token CI avec droits admin | Principe de moindre privilège |

---

## 11. Scénario complet — Gestion de crise de A à Z

### Cas pratique : votre scanner Grype est compromis

Voici un scénario détaillé de bout en bout, de la détection à l'amélioration continue.

---

### Phase 1 — DÉTECTION (Heure 0 à +2h)

#### Signaux d'alerte à surveiller

**Signaux automatiques :**
- Alerte réseau : le scanner tente de joindre un domaine non répertorié dans votre allowlist.
- Alerte checksum : le hash SHA256 du binaire ne correspond plus à la valeur de référence.
- Alerte de performance : le scan prend 10x plus longtemps qu'habituellement (signe d'activité malveillante en arrière-plan).
- Alerte CVE : une vulnérabilité publiée concerne votre version du scanner.

**Signaux humains :**
- Annonce de l'équipe Anchore sur GitHub Discussions ou mailing list.
- Article dans les flux de veille sécurité (CERT-FR, GitHub Security Advisories).
- Signalement dans les communautés (Slack DevSecOps, Twitter/X, Reddit r/netsec).

#### Actions immédiates

```bash
# 1. Vérifier le hash du binaire actuel vs. la version officielle attendue
sha256sum /usr/local/bin/grype
# Comparer avec https://github.com/anchore/grype/releases/download/vX.Y.Z/grype_checksums.txt

# 2. Vérifier les connexions réseau actives du process
lsof -i -p $(pgrep grype)
# ou
ss -tulnp | grep grype

# 3. Vérifier les dernières activités suspectes dans les logs CI
grep -i "grype\|scan" /var/log/pipeline.log | tail -200
```

---

### Phase 2 — CONFINEMENT (Heure +2h à +4h)

**Objectif : arrêter la propagation immédiatement, sans paniquer.**

#### Actions de confinement

1. **Geler tous les pipelines** qui utilisent Grype.
   ```bash
   # GitLab : désactiver le runner compromis
   gitlab-runner stop
   
   # GitHub Actions : désactiver les workflows via l'API
   gh api repos/MON-ORG/MON-REPO/actions/workflows/scan.yml/disable -X PUT
   ```

2. **Basculer sur le scanner de secours** (Trivy si sain, OSV-Scanner, etc.).
   ```yaml
   # Modifier temporairement le pipeline pour utiliser OSV-Scanner
   - name: Fallback scan with OSV-Scanner
     run: |
       docker run --rm -v $(pwd):/scan \
         ghcr.io/google/osv-scanner:latest \
         --recursive /scan
   ```

3. **Révoquer tous les tokens** qui ont pu être exposés.
   ```bash
   # Lister les tokens actifs et les révoquer
   # AWS
   aws iam list-access-keys --user-name ci-pipeline-user
   aws iam delete-access-key --user-name ci-pipeline-user --access-key-id AKIAXXXXXXXX
   
   # GitHub tokens : aller dans Settings > Developer settings > Personal access tokens
   ```

4. **Isoler les runners** potentiellement compromis du réseau de production.

---

### Phase 3 — ANALYSE (Heure +4h à +24h)

**Objectif : comprendre ce qui s'est passé et évaluer l'impact réel.**

#### Investigation forensique

```bash
# Analyser les logs réseau pendant la période suspecte
tcpdump -r pipeline-capture.pcap -n 'host grype-binary-or-c2-domain'

# Vérifier les fichiers modifiés récemment sur les runners
find /home/runner -newer /tmp/reference-date -type f -ls

# Examiner l'historique des commandes
cat ~/.bash_history | grep -E "curl|wget|nc|python|perl"

# Vérifier les clés SSH ajoutées récemment
ls -la ~/.ssh/
cat ~/.ssh/authorized_keys
```

#### Questions clés à répondre

- Quelle version exacte du scanner était utilisée et depuis quand ?
- Quels pipelines ont utilisé ce scanner pendant la fenêtre de compromission ?
- Quels secrets étaient accessibles dans ces environnements ?
- Y a-t-il des traces d'exfiltration dans les logs réseau ?
- Des artefacts produits pendant cette période sont-ils potentiellement compromis ?

#### Évaluation de l'impact

Construire une matrice d'impact :

| Environnement | Dernière utilisation | Secrets exposés | Artefacts produits | Action requise |
|---------------|---------------------|-----------------|-------------------|----------------|
| Production | 2026-04-15 14:32 | DB_PASSWORD, AWS_KEY | mon-app:v2.1 | Rotation + re-scan |
| Staging | 2026-04-15 09:11 | TEST_KEY | mon-app:v2.1-staging | Re-scan |
| Dev | 2026-04-14 17:45 | Aucun critique | Non déployé | Surveiller |

---

### Phase 4 — REMÉDIATION (Heure +24h à +72h)

**Objectif : nettoyer, reconstruire proprement et rétablir la confiance.**

#### Actions de remédiation

1. **Rotation de tous les secrets** potentiellement exposés.
2. **Révocation des certificats** et re-signature de tous les artefacts produits pendant la période compromise.
3. **Re-build complet** de toutes les images potentiellement affectées depuis une source propre et vérifiée.
4. **Re-déploiement** avec les nouvelles images.

```bash
# Re-scanner toutes les images avec le scanner de remplacement validé
for image in $(docker images --format "{{.Repository}}:{{.Tag}}" | grep mon-org); do
  grype-safe $image --fail-on critical
done

# Re-signer toutes les images propres
for image in $(cat clean-images.txt); do
  cosign sign --key cosign.key $image
done
```

5. **Installer une version vérifiée** du scanner original ou basculer définitivement sur l'alternative.

```bash
# Vérification complète avant réinstallation
GRYPE_VERSION="v0.81.0"  # Version post-incident
curl -sSfL "https://github.com/anchore/grype/releases/download/${GRYPE_VERSION}/grype_${GRYPE_VERSION:1}_linux_amd64.tar.gz" \
  -o grype.tar.gz

# Vérifier la signature cosign
cosign verify-blob \
  --certificate "https://github.com/anchore/grype/releases/download/${GRYPE_VERSION}/grype_linux_amd64.tar.gz.pem" \
  --signature "https://github.com/anchore/grype/releases/download/${GRYPE_VERSION}/grype_linux_amd64.tar.gz.sig" \
  --certificate-identity "https://github.com/anchore/grype/.github/workflows/release.yaml@refs/tags/${GRYPE_VERSION}" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com" \
  grype.tar.gz

echo "Vérification réussie : installation en cours"
tar -xzf grype.tar.gz grype && sudo mv grype /usr/local/bin/
```

---

### Phase 5 — COMMUNICATION (En parallèle)

**Objectif : informer les bonnes personnes au bon moment.**

#### Arbre de communication

```
[Détection J0 H0]
      │
      ├── IMMÉDIAT (< 1h)
      │   ├── Équipe sécurité
      │   ├── Tech Lead / CTO
      │   └── Canal Slack #incident-security
      │
      ├── COURT TERME (< 4h)
      │   ├── Direction métier (si impact business)
      │   ├── Équipes Dev affectées
      │   └── DPO (si données personnelles potentiellement exposées)
      │
      └── MOYEN TERME (< 24h)
          ├── Clients (si impact sur leurs données)
          ├── CNIL / Autorités (si obligation réglementaire)
          └── Communication publique (si incident public)
```

**Template de message d'alerte interne :**

```
[INCIDENT SÉCURITÉ - SEVERITY P1]
Date/Heure : 2026-04-15 16:30 UTC
Composant affecté : Scanner Grype (versions X.Y.Z)
Statut : En cours d'investigation

Impact potentiel :
- Pipelines CI/CD utilisés entre [H-12] et [H0]
- Environnements : [liste]

Actions en cours :
- [16:30] Gel des pipelines CI/CD
- [16:45] Bascule sur scanner de secours
- [17:00] Investigation forensique lancée

Prochain update : 19:00 UTC
Contact : #incident-security / security@mon-org.com
```

---

### Phase 6 — REPRISE (Heure +72h à +1 semaine)

**Objectif : rétablir les opérations normales en toute sécurité.**

#### Checklist de reprise

- [ ] Tous les secrets exposés ont été rotés et révoqués.
- [ ] Tous les artefacts potentiellement compromis ont été re-buildés et re-signés.
- [ ] Le scanner de remplacement est validé (checksum, signature, tests fonctionnels).
- [ ] Les pipelines sont rétablis avec le nouveau scanner.
- [ ] La surveillance réseau est active sur tous les runners.
- [ ] Un scan complet de l'environnement de production a été effectué.
- [ ] Les équipes ont été informées du rétablissement.

---

### Phase 7 — AMÉLIORATION CONTINUE (Après la crise)

**Objectif : tirer les leçons et renforcer les défenses.**

#### Post-mortem (dans les 72h après l'incident)

Organiser une réunion post-mortem en mode "blameless" (sans chercher de coupable) pour analyser :

1. **Chronologie précise** : reconstituer chaque événement avec des timestamps.
2. **Facteurs contributifs** : qu'est-ce qui a permis cet incident ? (Manque de validation des checksums ? Absence de scanner de secours ? Pas de monitoring réseau des runners ?)
3. **Ce qui a bien fonctionné** : quelles détections ont été efficaces ?
4. **Actions correctives** : avec propriétaire et deadline.

#### Actions d'amélioration structurelles

Après un incident, renforcer systématiquement :

**Résilience :**
- Mettre en place un second scanner (différent éditeur, différentes sources CVE).
- Créer et maintenir un miroir interne des binaires validés.
- Documenter et tester le runbook de basculement vers le scanner de secours.

**Détection :**
- Déployer Harden-Runner sur tous les repositories CI/CD.
- Configurer des alertes sur les checksums des outils critiques.
- Mettre en place des alertes sur les nouvelles releases des dépendances critiques.

**Prévention :**
- Épingler TOUS les outils CI/CD par hash SHA (jamais par tag ou @latest).
- Implémenter la vérification de signature cosign dans le pipeline.
- Tester régulièrement le plan de réponse aux incidents (exercice "fire drill").

---

## 12. Qui scanne le scanner ?

C'est la question fondamentale que pose ce document. Voici la réponse architecturale complète.

### Le problème de la confiance circulaire

Si votre seul outil de sécurité est compromis, vous avez un angle mort total. L'attaque contre Trivy en 2026 l'a démontré parfaitement : pendant 12 heures, des milliers de pipelines ont exécuté un outil censé les protéger, qui en réalité volait leurs secrets.

### La solution : la défense en profondeur appliquée aux outils de sécurité

```
Niveau 1 : Vérification de l'intégrité des outils (checksum + cosign)
     │
     ▼
Niveau 2 : Double scanner (sources CVE différentes)
     │
     ▼
Niveau 3 : Surveillance réseau des runners (Harden-Runner)
     │
     ▼
Niveau 4 : Miroir interne des outils validés
     │
     ▼
Niveau 5 : Veille active sur les outils eux-mêmes (GitHub Advisory, CERT-FR)
     │
     ▼
Niveau 6 : Tests réguliers du plan de basculement
```

### Le principe ultime : Zero Trust pour les outils de sécurité

Appliquez à vos outils de sécurité le même niveau de méfiance que vous appliquez à du code tiers non vérifié :

1. **Ne faites jamais confiance au nom d'un outil, faites confiance à son hash.**
2. **Un outil de sécurité doit pouvoir fonctionner sans connexion internet** (mode hors-ligne avec base de données locale).
3. **Tout comportement réseau inattendu d'un scanner est une alerte critique.**
4. **Aucun scanner unique ne doit être un point de défaillance unique.**
5. **Les mises à jour des outils de sécurité doivent passer par le même processus de validation que votre propre code.**

---

## 13. Glossaire

| Terme | Définition |
|-------|-----------|
| **SBOM** | Software Bill of Materials — inventaire exhaustif des composants logiciels |
| **CVE** | Common Vulnerabilities and Exposures — identifiant unique d'une vulnérabilité |
| **SCA** | Software Composition Analysis — analyse automatisée des dépendances |
| **SLSA** | Supply chain Levels for Software Artifacts — framework de maturité |
| **Cosign** | Outil de signature cryptographique d'images de conteneurs (Sigstore) |
| **Syft** | Générateur de SBOM par Anchore |
| **Grype** | Scanner de vulnérabilités open source par Anchore |
| **Trivy** | Scanner de sécurité multi-cibles par Aqua Security |
| **OIDC** | OpenID Connect — protocole d'authentification pour tokens éphémères |
| **CI/CD** | Continuous Integration / Continuous Deployment — pipeline d'automatisation |
| **C2** | Command & Control — serveur contrôlé par un attaquant |
| **PAT** | Personal Access Token — jeton d'authentification GitHub |
| **STRIDE** | Spoofing, Tampering, Repudiation, Information Disclosure, DoS, Elevation of Privilege — méthode de modélisation des menaces |
| **Typosquatting** | Enregistrement d'un domaine/paquet similaire à un domaine légitime (ex: `aquasecurtiy.org`) |
| **RCE** | Remote Code Execution — exécution de code à distance |
| **IaC** | Infrastructure as Code — infrastructure définie en code (Terraform, Helm...) |
| **OPA** | Open Policy Agent — moteur de politique universel |
| **Kyverno** | Moteur de politique pour Kubernetes |

---

## Références et ressources

- **ANSSI — Guide S-SDLC et DevSecOps** : Étude de marché publiée par l'agence française de cybersécurité sur les pratiques DevSecOps
- **Stephane Robert's DevSecOps Blog** : https://blog.stephane-robert.info/docs/securiser/
- **StepSecurity — Analyse de la compromission Trivy 2026** : https://www.stepsecurity.io/blog/trivy-compromised-a-second-time---malicious-v0-69-4-release
- **Getplumber.io — CI/CD Governance après hackerbot-claw** : https://getplumber.io/blog/hackerbot-claw-cicd-governance
- **Anchore Grype (GitHub)** : https://github.com/anchore/grype
- **SLSA Framework** : https://slsa.dev
- **Sigstore / Cosign** : https://sigstore.dev
- **OSV — Open Source Vulnerabilities** : https://osv.dev
- **OWASP Top 10 CI/CD Security Risks** : https://owasp.org/www-project-top-10-ci-cd-security-risks/
- **NIST SSDF — Secure Software Development Framework** : https://csrc.nist.gov/Projects/ssdf
- **CycloneDX SBOM Specification** : https://cyclonedx.org
- **Harden-Runner (StepSecurity)** : https://github.com/step-security/harden-runner
- **poutine — CI/CD security scanner** : https://github.com/boostsecurityio/poutine
- **zizmor — Static analysis for GitHub Actions** : https://github.com/woodruffw/zizmor

---

*Document rédigé en mai 2026. Les incidents décrits (hackerbot-claw, compromission Trivy) sont des événements réels survenus en février et mars 2026. Les recommandations sont à jour à la date de publication.*
