---
title: "SBOM — Comprendre et exploiter le Software Bill of Materials"
description: "Guide pédagogique complet pour Comprendre et exploiter le Software Bill of Materials"
created: "2026-03-13"
#updated: "2026-02-02"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"

---

# 📦 SBOM — Comprendre et exploiter le Software Bill of Materials

> **À qui s'adresse ce guide ?**
> Ce document s'adresse à un public hétérogène : développeurs, ops, managers techniques, responsables sécurité. Les notions sont introduites progressivement, avec des analogies et des exemples concrets. Aucun prérequis avancé n'est nécessaire pour commencer.

---

## Table des matières

1. [Le problème concret : que s'est-il passé avec Trivy ?](#1-le-problème-concret--que-sest-il-passé-avec-trivy-)
2. [Qu'est-ce qu'un SBOM ?](#2-quest-ce-quun-sbom-)
3. [Pourquoi le SBOM est-il incontournable ?](#3-pourquoi-le-sbom-est-il-incontournable-)
4. [Les formats standardisés : SPDX vs CycloneDX](#4-les-formats-standardisés--spdx-vs-cyclonedx)
5. [Les outils pour générer un SBOM](#5-les-outils-pour-générer-un-sbom)
6. [Cas pratique : réagir à une CVE avec un SBOM](#6-cas-pratique--réagir-à-une-cve-avec-un-sbom)
7. [Réduire le bruit : SBOM + VEX](#7-réduire-le-bruit--sbom--vex)
8. [Distribuer et signer un SBOM](#8-distribuer-et-signer-un-sbom)
9. [Checklist et bonnes pratiques](#9-checklist-et-bonnes-pratiques)
10. [Ressources utiles](#10-ressources-utiles)

---

## 1. Le problème concret : que s'est-il passé avec Trivy ?

Avant de parler de SBOM, partons d'un cas réel qui illustre pourquoi tout cela est vital.

### 🎯 Trivy : quand l'outil de sécurité devient lui-même une cible

**Trivy** est l'un des scanners de vulnérabilités open-source les plus utilisés au monde : plus de 32 000 étoiles sur GitHub, plus de 100 millions de téléchargements par an. Des milliers d'équipes s'en servent quotidiennement pour vérifier la sécurité de leurs images Docker et de leurs dépendances.

**Le 1er mars 2026**, des ingénieurs découvrent quelque chose d'inhabituel en essayant de mettre à jour Trivy : l'installation échoue avec une erreur 404. En vérifiant directement sur GitHub… le dépôt est **complètement vide**.

> *"Ce que je pensais être un bug s'est révélé être l'une des attaques supply chain les plus marquantes de 2026."*
> — Stéphane Robert, blog.stephane-robert.info

### 🤖 Un bot IA autonome comme attaquant

L'enquête menée par StepSecurity révèle que l'attaque est orchestrée par **`hackerbot-claw`**, un compte GitHub se décrivant lui-même comme un *"autonomous security research agent powered by claude-opus-4.5"*.

Entre le **21 et le 28 février 2026**, ce bot a :
- Scanné automatiquement **47 000+ dépôts** publics
- Ciblé **7 projets majeurs** (Microsoft, DataDog, Trivy, CNCF…)
- Obtenu une exécution de code sur **au moins 4 cibles**

#### Comment l'attaque a-t-elle fonctionné sur Trivy ?

Trivy avait un workflow GitHub Actions appelé `apidiff.yaml` qui utilisait le déclencheur `pull_request_target`. Cette configuration est une **faille bien connue**, surnommée "Pwn Request" :

```
┌──────────────────────────────────────────────────────────────┐
│                    Le piège "Pwn Request"                     │
├──────────────────────────────────────────────────────────────┤
│  1. L'attaquant ouvre une Pull Request depuis un fork        │
│  2. Le workflow se déclenche automatiquement                 │
│  3. PROBLÈME : le workflow s'exécute avec les permissions    │
│     du dépôt CIBLE (pas du fork), mais execute le CODE      │
│     de l'attaquant                                           │
│  4. Le code malveillant peut accéder aux secrets du dépôt   │
└──────────────────────────────────────────────────────────────┘
```

**Chronologie précise de l'attaque :**

| Date | Événement |
|------|-----------|
| 20 fév. 2026 | Création du compte `hackerbot-claw` |
| 27 fév. 2026 à 00h18 UTC | PR #10252 ouverte puis fermée immédiatement → le workflow se déclenche quand même |
| 27-28 fév. 2026 | Le bot exfiltre un **Personal Access Token (PAT)** vers `recv.hackmoltrepeat.com` |
| 28 fév. 2026 à 03h47 UTC | Prise de contrôle totale du dépôt |
| 1er mars 2026 | Suppression massive des releases v0.27.0 à v0.69.1 |
| 1er mars 2026 | Publication d'une **extension VS Code malveillante** sur OpenVSX |

#### Quel était l'impact concret ?

L'extension VS Code malveillante (versions 1.8.12 et 1.8.13) contenait du code qui, à l'ouverture d'un projet, **instruisait les assistants IA locaux** (Claude, Codex, Gemini, GitHub Copilot CLI…) pour :
1. Scanner les fichiers de credentials, tokens et données sensibles
2. Générer un rapport dans un fichier `REPORT.MD`
3. Pousser ce rapport vers un dépôt GitHub nommé `posture-report-trivy`

**Qui était affecté ?**

| Mode d'installation | Impacté ? |
|---|---|
| Via image Docker | ✅ Non affecté |
| Via gestionnaire de paquets (apt, brew…) | ✅ Non affecté |
| Via binaire GitHub Releases | ⚠️ CI/CD cassées |
| Via extension VS Code sur OpenVSX | 🔴 Données potentiellement exfiltrées |

### 🔧 La réponse d'Aqua Security

- Restauration du dépôt depuis une copie propre
- Publication d'une version `v0.69.2` de remplacement
- Correction du workflow vulnérable via la PR #10259
- Publication de `v0.69.3` avec un **SBOM (`bom.json`)** et une **attestation Sigstore**
- Révocation du token compromis

> **La leçon clé :** Un outil de sécurité censé scanner les vulnérabilités des autres… était lui-même vulnérable. Et sans SBOM, personne ne pouvait facilement savoir qui utilisait quelle version de Trivy.

---

## 2. Qu'est-ce qu'un SBOM ?

### L'analogie de la liste d'ingrédients

Imaginez que vous achetez un plat cuisiné au supermarché. Sur l'emballage, vous trouvez la **liste des ingrédients** : farine, œufs, sel, conservateurs E330, colorants… Grâce à cette liste :
- Vous savez ce que vous mangez
- Si un ingrédient est rappelé (contamination), le fabricant peut vous prévenir
- Les personnes allergiques peuvent vérifier en un coup d'œil

Un **SBOM (Software Bill of Materials)** c'est exactement ça, mais pour un logiciel. C'est la **liste exhaustive de tous les composants** qui constituent une application ou une image Docker.

### Ce que contient un SBOM

```
Application "mon-app:1.2.0"
├── openssl 3.0.2            ← Bibliothèque cryptographique
│   └── [hash: sha256:abc...] ← Empreinte pour vérifier l'intégrité
├── log4j-core 2.14.1        ← Attention : version vulnérable !
│   ├── [CVE: CVE-2021-44228]
│   └── [license: Apache-2.0]
├── nginx 1.24.0             ← Serveur web
│   └── [purl: pkg:deb/nginx@1.24.0]  ← Identifiant universel
└── libxml2 2.9.12
    └── [note: non utilisé par notre code]  ← Info précieuse pour VEX
```

Un SBOM contient concrètement :

- **Le nom et la version** de chaque composant
- **Un identifiant stable** : le `purl` (Package URL), une façon universelle d'identifier un paquet, ex : `pkg:npm/lodash@4.17.21` ou `pkg:docker/nginx@1.24.0`
- **Les relations** : dépendance directe ou transitive (une dépendance d'une dépendance)
- **La licence** : MIT, GPL, Apache-2.0…
- **Un hash** : une empreinte numérique qui garantit que le fichier n'a pas été modifié

> **Dépendance transitive** : Si votre application utilise la bibliothèque A, et que A utilise la bibliothèque B, alors B est une dépendance *transitive*. Sans SBOM, B est souvent invisible — c'est pourtant là que se cachent beaucoup de vulnérabilités.

---

## 3. Pourquoi le SBOM est-il incontournable ?

### Le scénario cauchemar sans SBOM

C'est un mardi matin. Une CVE critique vient d'être publiée : **Log4Shell** (CVE-2021-44228). La vulnérabilité permet à n'importe qui d'exécuter du code à distance sur votre serveur. Le score CVSS est de **10/10** — le maximum.

Votre téléphone sonne. Votre CISO vous pose la question :

> **"Est-ce qu'on utilise Log4j ? On est exposés ?"**

Sans SBOM, voici ce qui se passe :

```
Étape 1 : Fouiller manuellement chaque dépôt de code
├── Chercher dans package.json (Node.js)
├── Chercher dans pom.xml (Java/Maven)
├── Chercher dans requirements.txt (Python)
└── ... et toutes les images Docker en production

Étape 2 : Interroger chaque équipe
├── "Est-ce que votre service utilise Java ?"
├── "Quelle version de Log4j ?"
└── "Êtes-vous sûrs de ne rien avoir oublié ?"

Étape 3 : Espérer n'avoir rien oublié
└── Résultat : 2-3 jours de travail chaotique
    pendant que la faille reste exploitable
```

### Le scénario idéal avec un SBOM

Même question, même mardi matin. Mais cette fois, chaque artefact de production possède son SBOM.

```bash
# Rechercher log4j dans tous les SBOM en quelques secondes
for sbom in *.cdx.json; do
  if jq -e '.components[] | select(.name=="log4j-core")' "$sbom" > /dev/null 2>&1; then
    echo "⚠️  $sbom contient log4j-core"
  fi
done
```

Résultat en moins d'une minute :
```
⚠️  api-gateway:2.1.0.cdx.json contient log4j-core
⚠️  reporting-service:1.3.2.cdx.json contient log4j-core
✅  frontend:4.0.1.cdx.json : pas de log4j
✅  auth-service:3.2.0.cdx.json : pas de log4j
```

Vous savez exactement quoi patcher, où, et dans quelle version.

### Le cas Trivy : ce que le SBOM aurait permis

Si toutes les équipes avaient disposé d'un SBOM de leur installation de Trivy, lors de l'attaque du 1er mars 2026, elles auraient pu :

1. **Identifier immédiatement** quelles versions de Trivy étaient déployées dans leurs pipelines
2. **Savoir si elles étaient vulnérables** (versions entre 0.27.0 et 0.69.1)
3. **Prioriser la remédiation** selon l'exposition : CI/CD critique vs environnement de développement

Sans SBOM → des heures à interroger manuellement chaque équipe. Avec SBOM → une requête, une réponse.

---

## 4. Les formats standardisés : SPDX vs CycloneDX

Un SBOM est un fichier texte structuré (JSON ou XML). Deux formats font référence.

### CycloneDX (par OWASP)

**Créé par** : OWASP (Open Web Application Security Project)
**Version actuelle** : 1.6 (2024)
**Point fort** : Conçu dès le départ pour la **sécurité** et la gestion des vulnérabilités
**Support VEX** : Natif depuis la version 1.4

```json
// Extrait d'un SBOM CycloneDX
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.7",
  "metadata": {
    "component": {
      "name": "mon-app",
      "version": "1.2.0",
      "type": "application"
    }
  },
  "components": [
    {
      "type": "library",
      "name": "log4j-core",
      "version": "2.14.1",
      "purl": "pkg:maven/org.apache.logging.log4j/log4j-core@2.14.1",
      "licenses": [{ "license": { "id": "Apache-2.0" } }],
      "hashes": [{ "alg": "SHA-256", "content": "abc123..." }]
    }
  ]
}
```

### SPDX (par la Linux Foundation)

**Créé par** : Linux Foundation, standardisé ISO (ISO/IEC 5962)
**Version actuelle** : 3.0 (2024)
**Point fort** : Conçu pour la **conformité légale** et la gestion des licences
**Adopté par** : NTIA (gouvernement américain), réglementation européenne

```json
// Extrait d'un SBOM SPDX
{
  "spdxVersion": "SPDX-3.1",
  "dataLicense": "CC0-1.0",
  "SPDXID": "SPDXRef-DOCUMENT",
  "name": "mon-app-1.2.0",
  "packages": [
    {
      "SPDXID": "SPDXRef-log4j-core",
      "name": "log4j-core",
      "versionInfo": "2.14.1",
      "licenseConcluded": "Apache-2.0",
      "externalRefs": [{
        "referenceCategory": "PACKAGE-MANAGER",
        "referenceType": "purl",
        "referenceLocator": "pkg:maven/org.apache.logging.log4j/log4j-core@2.14.1"
      }]
    }
  ]
}
```

### Tableau comparatif

| Critère | CycloneDX (OWASP) | SPDX (Linux Foundation) |
|---|---|---|
| **Focus principal** | Sécurité, supply chain | Licences, conformité légale |
| **Norme ISO** | Non | Oui (ISO/IEC 5962) |
| **Support VEX natif** | Oui (depuis 1.4) | Oui (depuis 3.0) |
| **Verbosité** | Concis | Plus verbeux |
| **Adoption DevSecOps** | Très large | En croissance |
| **Idéal pour** | Détection de vulnérabilités | Audits de licences, conformité |

> **💡 Recommandation :** Générez les deux formats quand c'est possible. CycloneDX pour vos équipes sécurité, SPDX pour vos obligations légales et vos clients.

---

## 5. Les outils pour générer un SBOM

### Vue d'ensemble

| Outil | Éditeur | Ce qu'il fait bien | Formats |
|---|---|---|---|
| **Syft** | Anchore | Images Docker, archives, filesystem. Très rapide. | CycloneDX, SPDX |
| **Trivy** | Aqua Security | Scanner de vulnérabilités **et** génération SBOM. Tout-en-un. | CycloneDX, SPDX |
| **cdxgen** | OWASP/CycloneDX | Officiel CycloneDX, excellent support multi-langages (Java, Node, Python, Go…) | CycloneDX |
| **spdx-sbom-generator** | SPDX Project | Officiel SPDX, focus conformité licences | SPDX |

### Exemple avec Syft (le plus simple à démarrer)

```bash
# Installer Syft
curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh

# Générer un SBOM pour une image Docker
syft nginx:latest -o cyclonedx-json > sbom-nginx.cdx.json
syft nginx:latest -o spdx-json > sbom-nginx.spdx.json

# Générer un SBOM pour le répertoire courant (projet local)
syft . -o cyclonedx-json > sbom-monprojet.cdx.json
```

### Exemple avec Trivy (scanner + SBOM)

Trivy combine deux fonctions : il scanne les vulnérabilités **ET** génère le SBOM. C'est souvent le plus pratique en CI/CD.

```bash
# Générer un SBOM pour une image Docker
trivy image --format cyclonedx nginx:latest > sbom.cdx.json

# Scanner un SBOM existant pour détecter des vulnérabilités
trivy sbom sbom.cdx.json

# Résultat typique :
# nginx:latest (debian 12.5)
# =============================
# Total: 12 (HIGH: 3, MEDIUM: 9)
#
# ┌──────────────┬────────────────┬──────────┬──────────────────┐
# │   Library    │ Vulnerability  │ Severity │ Installed Version│
# ├──────────────┼────────────────┼──────────┼──────────────────┤
# │ openssl      │ CVE-2024-xxxx  │ HIGH     │ 3.0.2-0+deb11u2  │
# └──────────────┴────────────────┴──────────┴──────────────────┘
```

> **⚠️ Note post-incident Trivy :** Suite à l'attaque de mars 2026, vérifiez toujours l'intégrité du binaire Trivy avant de l'utiliser. Depuis la v0.69.3, Aqua publie un SBOM (`bom.json`) et une attestation Sigstore avec chaque release.

---

## 6. Cas pratique : réagir à une CVE avec un SBOM

### Le contexte

Une nouvelle CVE est annoncée. Votre équipe sécurité vous demande de vérifier si vos applications sont exposées. Vous avez généré un SBOM pour chacune de vos images Docker en production. Voici comment procéder.

### Étape 1 — Identifier les artefacts impactés

```bash
# Rechercher un composant vulnérable dans tous vos SBOM CycloneDX
for sbom in *.cdx.json; do
  if jq -e '.components[] | select(.name=="log4j-core")' "$sbom" > /dev/null 2>&1; then
    echo "⚠️  Potentiellement impacté : $sbom"
  else
    echo "✅  $sbom : log4j-core absent"
  fi
done
```

**Explication ligne par ligne :**
- `for sbom in *.cdx.json` → on parcourt tous les fichiers SBOM
- `jq -e '.components[] | select(.name=="log4j-core")'` → on cherche le composant `log4j-core` dans la liste
- Si trouvé → alerte, sinon → confirmation d'absence

### Étape 2 — Vérifier les versions exactes

Trouver le composant ne suffit pas : peut-être que votre version est déjà patchée.

```bash
# Lister les versions exactes de log4j-core dans chaque SBOM
for sbom in *.cdx.json; do
  jq -r --arg file "$sbom" '
    .components[]
    | select(.name=="log4j-core")
    | "\($file): \(.name) \(.version) — purl: \(.purl)"
  ' "$sbom" 2>/dev/null
done
```

**Résultat exemple :**
```
api-gateway:2.1.0.cdx.json: log4j-core 2.14.1 — purl: pkg:maven/.../log4j-core@2.14.1
reporting-service:1.3.2.cdx.json: log4j-core 2.17.1 — purl: pkg:maven/.../log4j-core@2.17.1
```

- `api-gateway` utilise la version **2.14.1** → vulnérable à Log4Shell
- `reporting-service` utilise la version **2.17.1** → version patchée ✅

### Étape 3 — Application au cas Trivy

```bash
# Chercher Trivy dans vos pipelines CI/CD
for sbom in ci-pipeline-*.cdx.json; do
  jq -r --arg file "$sbom" '
    .components[]
    | select(.name=="trivy")
    | "\($file): trivy \(.version)"
  ' "$sbom" 2>/dev/null
done

# Résultat :
# ci-pipeline-backend.cdx.json: trivy 0.68.0   ← ⚠️ dans la plage compromise
# ci-pipeline-frontend.cdx.json: trivy 0.69.3  ← ✅ version saine
```

### Étape 4 — Prioriser la remédiation

Tous les composants vulnérables ne sont pas égaux. Voici une grille de priorisation simple :

```
Score de risque = Criticité CVE × Exposition × Effort de correction

Exemple :
┌─────────────────────┬──────────┬───────────┬──────────┬──────────────┐
│ Service             │ CVE Score│ Exposition│ En prod? │ Priorité     │
├─────────────────────┼──────────┼───────────┼──────────┼──────────────┤
│ api-gateway         │ 10/10    │ Publique  │ Oui      │ 🔴 URGENT    │
│ reporting-service   │ 10/10    │ Interne   │ Oui      │ 🟠 Élevée    │
│ tool-dev-interne    │ 10/10    │ Aucune    │ Non      │ 🟡 Normale   │
└─────────────────────┴──────────┴───────────┴──────────┴──────────────┘
```

---

## 7. Réduire le bruit : SBOM + VEX

### Le problème des faux positifs

Les scanners de vulnérabilités sont parfois trop zélés. Exemple typique : votre image Docker contient `libxml2` (une bibliothèque de parsing XML), car elle est incluse dans l'image de base Ubuntu. Un scanner remonte une CVE dessus.

Mais votre application n'a **jamais** de fichiers XML à parser. Le code vulnérable de `libxml2` n'est **jamais exécuté**. Est-ce une vraie alerte ? Non. Mais sans information complémentaire, vos équipes vont perdre du temps à investiguer.

C'est là qu'intervient le **VEX (Vulnerability Exploitability eXchange)**.

### Qu'est-ce que le VEX ?

Le VEX est un document qui accompagne le SBOM et précise, pour chaque vulnérabilité connue : **est-ce qu'elle est réellement exploitable dans notre contexte ?**

Les 4 statuts possibles :

| Statut | Signification |
|---|---|
| `not_affected` | Le composant est présent mais la vulnérabilité n'est pas exploitable |
| `affected` | La vulnérabilité est exploitable → action requise |
| `fixed` | La vulnérabilité a été corrigée dans cette version |
| `under_investigation` | L'analyse est en cours |

### Exemple concret de document VEX

```json
{
  "document": {
    "category": "vex",
    "title": "VEX pour mon-app:1.2.0",
    "tracking": {
      "id": "VEX-2024-001",
      "status": "final",
      "version": "1"
    }
  },
  "statements": [
    {
      "vulnerability": {
        "name": "CVE-2024-1234",
        "description": "Vulnérabilité dans libxml2 affectant le parsing XML"
      },
      "products": ["pkg:oci/mon-app@1.2.0"],
      "status": "not_affected",
      "justification": "vulnerable_code_not_in_execute_path",
      "impact_statement": "libxml2 est présent dans l'image de base Ubuntu mais notre application n'utilise aucune fonction de parsing XML. Le code vulnérable n'est jamais exécuté."
    },
    {
      "vulnerability": {
        "name": "CVE-2024-5678"
      },
      "products": ["pkg:oci/mon-app@1.2.0"],
      "status": "fixed",
      "impact_statement": "Corrigé dans la version 1.2.0 via mise à jour de la dépendance openssl vers 3.0.8"
    }
  ]
}
```

### Application au cas Trivy

Suite à l'incident, Aqua Security aurait pu émettre un VEX indiquant :

```json
{
  "statements": [
    {
      "vulnerability": { "name": "CVE-2026-28353" },
      "products": ["pkg:github/aquasecurity/trivy@0.69.2"],
      "status": "fixed",
      "impact_statement": "Workflow vulnérable supprimé (PR #10259), token compromis révoqué, code source non altéré."
    },
    {
      "vulnerability": { "name": "CVE-2026-28353" },
      "products": ["pkg:github/aquasecurity/trivy@0.69.3"],
      "status": "not_affected",
      "justification": "inline_mitigations_already_exist"
    }
  ]
}
```

Les équipes utilisant Trivy savent immédiatement quelle version est safe, sans avoir à investiguer elles-mêmes.

---

## 8. Distribuer et signer un SBOM

### Pourquoi c'est important

Générer un SBOM sans le distribuer correctement, c'est comme écrire une liste d'ingrédients et la garder dans un tiroir. Pour être utile, le SBOM doit être :

- **Accessible** : les équipes sécurité, les clients, les auditeurs doivent pouvoir le récupérer sans demander à quelqu'un
- **Associé à l'artefact** : chaque SBOM doit clairement correspondre à une version précise
- **Vérifiable** : personne ne doit pouvoir modifier le SBOM sans que ça se voit

### Les 3 stratégies de distribution

#### Stratégie 1 — Fichier attaché en CI/CD ou sur S3

La plus simple. Le SBOM est généré en CI/CD et stocké à côté de l'artefact.

```yaml
# Extrait d'une GitHub Action
- name: Générer le SBOM
  run: |
    trivy image --format cyclonedx mon-image:${{ github.sha }} > sbom.cdx.json

- name: Uploader le SBOM comme artifact CI
  uses: actions/upload-artifact@v4
  with:
    name: sbom-${{ github.sha }}
    path: sbom.cdx.json
```

**Avantages :** Simple à mettre en place
**Inconvénients :** Dissocié de l'image, risque de désynchronisation

#### Stratégie 2 — SBOM attaché à l'image OCI (recommandé)

Le SBOM est stocké dans le même registre Docker que l'image, lié à elle par un mécanisme standard OCI.

```bash
# Attacher le SBOM à l'image avec cosign
cosign attach sbom --sbom sbom.spdx mon-registry/mon-image:1.0.0

# Vérifier que le SBOM est bien attaché
cosign download sbom mon-registry/mon-image:1.0.0
```

**Avantages :** Co-localisé avec l'image, jamais désynchronisé
**Inconvénients :** Nécessite des outils compatibles OCI

#### Stratégie 3 — Attestation signée (niveau avancé)

Le SBOM est signé cryptographiquement pour garantir son authenticité et son intégrité. C'est ce qu'Aqua Security a mis en place à partir de Trivy v0.69.3 suite à l'incident.

```bash
# Signer et attester le SBOM avec Sigstore/cosign
cosign attest --predicate sbom.cdx.json --type cyclonedx \
  mon-registry/mon-image:1.0.0

# Vérifier l'attestation (qui a signé ce SBOM ? quand ?)
cosign verify-attestation --type cyclonedx \
  mon-registry/mon-image:1.0.0
```

**Avantages :** Intégrité garantie cryptographiquement, traçabilité totale
**Inconvénients :** Setup plus complexe (gestion des clés ou Sigstore keyless)

### Tableau récapitulatif

| Stratégie | Niveau | Avantages | Inconvénients |
|---|---|---|---|
| Fichier CI/S3 | ⭐ Débutant | Simple, rapide à mettre en place | Risque de désynchronisation |
| OCI attach | ⭐⭐ Intermédiaire | Co-localisé, toujours synchronisé | Outils OCI requis |
| Attestation signée | ⭐⭐⭐ Avancé | Intégrité cryptographique | Setup complexe |

---

## 9. Checklist et bonnes pratiques

### ✅ La checklist minimale pour démarrer

```
□ 1. Générer un SBOM à chaque build (image, binaire, release)
     └── Outil : Syft ou Trivy
     └── Format : CycloneDX JSON (+ SPDX JSON si possible)

□ 2. Scanner automatiquement en CI/CD
     └── Outil : Trivy ou Grype
     └── Bloquer le build si vulnérabilité CRITICAL non justifiée

□ 3. Distribuer le SBOM avec l'artefact
     └── Minimum : artifact CI/CD
     └── Mieux : OCI attach
     └── Idéal : attestation signée

□ 4. Centraliser dans un outil de gestion
     └── Outil recommandé : Dependency-Track (OWASP, open-source)
     └── Permet : tableau de bord, alertes sur nouvelles CVE, historique

□ 5. Documenter les faux positifs avec VEX
     └── Réduire le bruit pour vos équipes
     └── Prouver aux clients/auditeurs votre analyse de risque

□ 6. Surveiller les nouvelles CVE sur vos composants existants
     └── Un SBOM d'hier peut devenir vulnérable demain
```

### 🛡️ Leçons de l'attaque Trivy pour sécuriser vos GitHub Actions

L'incident Trivy expose des failles de configuration CI/CD très répandues. Voici comment s'en prémunir :

#### 1. Auditez vos workflows `pull_request_target`

Ce déclencheur est dangereux si le workflow checkout le code du fork :

```yaml
# ❌ DANGEREUX — exécute le code de l'attaquant avec vos permissions
on:
  pull_request_target:
jobs:
  build:
    steps:
      - uses: actions/checkout@v4  # checkout du fork = code attaquant !
```

```yaml
# ✅ SÉCURISÉ — si checkout nécessaire, isolez les permissions
on:
  pull_request_target:
jobs:
  build:
    permissions:
      contents: read  # Moindre privilège
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.sha }}
```

#### 2. Échappez toujours les expressions `${{ }}`

```yaml
# ❌ INJECTION possible
- run: echo "Branche: ${{ github.event.pull_request.head.ref }}"

# ✅ Passage par variable d'environnement
- env:
    BRANCH_NAME: ${{ github.event.pull_request.head.ref }}
  run: echo "Branche: $BRANCH_NAME"
```

#### 3. Appliquez le principe du moindre privilège

```yaml
# ✅ Toujours expliciter les permissions, restrictives par défaut
permissions:
  contents: read          # Lecture seule par défaut
  # pull-requests: write  # Uniquement si nécessaire
  # packages: write       # Uniquement pour publier
```

#### 4. Épinglez vos actions par hash, pas par tag

```yaml
# ❌ Un tag peut être déplacé (comme dans l'attaque xygeni-action)
- uses: actions/checkout@v4

# ✅ Un hash est immuable
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2
```

#### 5. Surveillez le trafic réseau sortant de vos runners

Des outils comme **Harden-Runner** (StepSecurity) peuvent détecter et bloquer les appels vers des domaines non autorisés — exactement ce que `hackerbot-claw` utilisait pour exfiltrer les tokens vers `recv.hackmoltrepeat.com`.

```yaml
# Ajouter en début de job pour monitorer les appels réseau
- uses: step-security/harden-runner@v2
  with:
    egress-policy: audit  # ou 'block' en mode strict
    allowed-endpoints: >
      github.com:443
      registry-1.docker.io:443
```

### 📊 Centraliser avec Dependency-Track

Pour les organisations gérant plusieurs dizaines d'applications, un tableau de bord centralisé est indispensable.

**Dependency-Track** (OWASP, open-source) permet de :
- Importer tous vos SBOM en un seul endroit
- Être alerté automatiquement quand une nouvelle CVE affecte un composant que vous utilisez
- Suivre l'évolution de votre posture de sécurité dans le temps
- Générer des rapports pour les audits

```bash
# Envoyer un SBOM à Dependency-Track via son API
curl -X POST \
  -H "X-Api-Key: votre-clé-api" \
  -F "bom=@sbom.cdx.json" \
  "https://votre-dependency-track/api/v1/bom"
```

---

## 10. Ressources utiles

### Standards et spécifications

- [CycloneDX — Spécification officielle](https://cyclonedx.org/specification/overview/)
- [SPDX — Spécification v2.3](https://spdx.github.io/spdx-spec/v2.3/)
- [OWASP CycloneDX — Guide autoritatif du SBOM (PDF)](https://cyclonedx.org/guides/)

### Outils

- [Syft](https://github.com/anchore/syft) — Générateur de SBOM universel
- [Trivy](https://github.com/aquasecurity/trivy) — Scanner de vulnérabilités + SBOM
- [Grype](https://github.com/anchore/grype) — Scanner de vulnérabilités (consomme les SBOM Syft)
- [Dependency-Track](https://dependencytrack.org/) — Tableau de bord centralisé SBOM
- [cosign / Sigstore](https://github.com/sigstore/cosign) — Signature et attestation

### Documentation de l'incident Trivy

- [Discussion officielle Trivy — Incident 2026-03-01](https://github.com/aquasecurity/trivy/discussions/10265)
- [Analyse StepSecurity — hackerbot-claw](https://www.stepsecurity.io/blog/hackerbot-claw-github-actions-exploitation)
- [Blog Stéphane Robert — Trivy dépôt vidé](https://blog.stephane-robert.info/post/trivy-depot-github-vide/)
- [Socket — Extension VS Code compromise](https://socket.dev/)

### Réglementation

- [NTIA — Minimum Elements for a SBOM](https://www.ntia.gov/report/2021/minimum-elements-software-bill-materials-sbom)
- [Cyber Resilience Act (UE)](https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act) — Entrée en vigueur progressive 2024-2027

---

## Récapitulatif en une image

```
VOTRE LOGICIEL
      │
      ▼
┌─────────────────┐
│   SBOM généré   │ ← Syft, Trivy, cdxgen
│  à chaque build │
└────────┬────────┘
         │
         ├──────────────────────────────────┐
         ▼                                  ▼
┌─────────────────┐                ┌─────────────────┐
│  Scanner CVE    │                │   Distribuer    │
│  Trivy / Grype  │                │  OCI + Sigstore │
└────────┬────────┘                └─────────────────┘
         │
         ▼
┌─────────────────┐
│  Faux positif ? │
│  → Émettre VEX  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Dependency-    │
│  Track (dashbd) │
│  + alertes CVE  │
└─────────────────┘
```

> **En résumé :** Un SBOM seul ne suffit pas. C'est toute la chaîne — génération, scan, qualification (VEX), distribution signée, surveillance continue — qui transforme un inventaire statique en véritable outil de résilience face aux attaques supply chain.
