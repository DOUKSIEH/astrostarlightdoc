---
title: Signer ses commits Git avec une clé GPG
description: Pourquoi et comment signer ses commits Git avec GPG pour garantir l’intégrité et l’identité de l’auteur.
authors: [douksieh]
tags: [ngrok]
image: https://i.imgur.com/mErPwqL.png
hide_table_of_contents: false
---

## 🎯 Pourquoi signer ses commits Git avec GPG ?

Signer un commit Git avec une clé **GPG** permet de garantir deux choses fondamentales :

1. **L’identité de l’auteur**
2. **L’intégrité du code**

Sur GitHub, un commit signé affiche le badge **✅ Verified**.

:::info
Un commit signé prouve cryptographiquement que **toi seul** (détenteur de la clé privée)
as pu produire ce commit et que son contenu n’a pas été modifié.
:::

---

## 🔐 Quels problèmes cela résout ?

Sans signature :
- l’identité Git peut être usurpée
- l’historique n’est pas vérifiable
- aucune preuve forte d’authenticité

Avec une signature GPG :
- chaque commit est **lié à une clé cryptographique**
- GitHub peut vérifier l’auteur
- l’historique devient **fiable et traçable**

:::tip
La signature des commits est une **bonne pratique sécurité**
très répandue en DevOps, Open Source et en environnement entreprise.
:::

---

## 🧠 GPG : principe de fonctionnement

GPG repose sur la **cryptographie asymétrique** :
- 🔑 une **clé privée** (reste sur ta machine)
- 🌐 une **clé publique** (partagée avec GitHub)

:::note
Git utilise la clé privée pour **signer** le commit.
GitHub utilise la clé publique pour **vérifier** la signature.
:::

---

## 🛠️ Étape 1 — Vérifier si une clé GPG existe déjà
:::note
Cette commande liste les clés privées GPG présentes sur la machine :

```bash
gpg --list-secret-keys --keyid-format=long

```
Sans clé privée, il est impossible de signer un commit.

**Résultats possibles :**
- aucune sortie → aucune clé → il faut en créer une
- une entrée `sec` apparaît → une clé existe déjà
:::

---
## 🔑 Étape 2 — Créer une clé GPG
:::note
Cette commande lance l’assistant interactif de génération de clé GPG :
```bash
gpg --full-generate-key

```
:::

**Choix recommandés :**

- Type : RSA and RSA

- Taille : 3072 ou 4096

- Expiration : 1y

- Nom : ton nom

- Email : exactement le même que sur GitHub

- Commentaire : optionnel

- ajoute ensuite une **passphrase** (obligatoire).

:::caution
Si l’email associé à la clé GPG **ne correspond pas exactement**
à l’email utilisé sur GitHub,  
le commit sera bien **signé localement**,
mais **GitHub ne pourra pas le vérifier** → le badge **Verified** n’apparaîtra pas.
:::

--- 
## 🆔 Étape 3 — Identifier la clé GPG (KEYID)

```bash
gpg --list-secret-keys --keyid-format=long

```
**_Exemples :_** 
> sec   rsa3072/ABCDEF1234567890 2026-01-29 [SC]

:::note
Le **KEYID** identifie de manière unique la clé GPG.
Git en a besoin pour savoir **quelle clé utiliser** pour signer.
:::

---
## ⚙️ Étape 4 — Configurer Git pour utiliser la clé GPG

```bash
git config user.signingkey ABCDEF1234567890

```
:::note
Cette commande indique à Git
quelle clé GPG utiliser pour signer les commits.
:::

```bash
git config commit.gpgsign true

```
:::tip
Activer la signature automatique évite les oublis
et garantit que **tous les commits** sont signés.
:::

--- 
## 🖥️ Étape 5 — Correctif indispensable en SSH ou VM
```bash
export GPG_TTY=$(tty)

```
:::caution
En SSH ou sur une machine virtuelle,GPG ne sait pas toujours sur quel terminal
demander la passphrase. Cette variable corrige ce problème.
:::

## ✍️ Étape 6 — Signer un commit

```bash
git commit -S -m "Mon commit signé"


```

> L’option `-S` force explicitement la signature GPG,
même si la signature automatique n’est pas activée.

---

## 🔍 Étape 7 — Vérifier la signature

```bash
git log --show-signature -1

```
:::tip
Toujours vérifier la signature avant un push,
en particulier lors d’un premier commit.
:::

---

## 🌐 Étape 8 — Ajouter la clé publique sur GitHub
```bash
gpg --armor --export ABCDEF1234567890

```
> Cette commande exporte la **clé publique** au format texte à fournir à GitHub
  pour permettre la vérification des commits.

---

**✅ Résultat final :**

- Commits signés 🔐

- Badge Verified sur GitHub

- Historique Git fiable et auditable

- Bonne pratique sécurité adoptée 🚀
