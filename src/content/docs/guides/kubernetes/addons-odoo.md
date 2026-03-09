---
title: "Infrastructure - Kubernetes/Odoo-CNPG"
description: "Guide pédagogique complet pour déployer une infrastructure moderne avec Odoo 19 + PostgreSQL HA & ngrok avec K8S"
created: "2026-02-04"
#updated: "2026-02-02"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"

---

# 📦 Guide Complet : Déploiement d'Addons Odoo 19 sur Kubernetes

> Installer, gérer et dépanner les modules Odoo dans un environnement containerisé

---

## 📚 Table des Matières

1. [Concepts fondamentaux](#1-concepts-fondamentaux)
2. [Architecture du déploiement](#2-architecture-du-déploiement)
3. [Prérequis et préparation](#3-prérequis-et-préparation)
4. [Méthode 1 : Installation via fichier ZIP](#4-méthode-1--installation-via-fichier-zip)
5. [Méthode 2 : Installation via Git](#5-méthode-2--installation-via-git)
6. [Méthode 3 : Image Docker personnalisée](#6-méthode-3--image-docker-personnalisée)
7. [Activation et configuration](#7-activation-et-configuration)
8. [Dépannage des problèmes courants](#8-dépannage-des-problèmes-courants)
9. [Bonnes pratiques production](#9-bonnes-pratiques-production)
10. [Automatisation avec GitOps](#10-automatisation-avec-gitops)

---

## 1. Concepts fondamentaux

### 🎓 Qu'est-ce qu'un addon Odoo ?

Un **addon** (ou module) Odoo est un package Python qui étend les fonctionnalités d'Odoo. Il contient :

```
mon_addon/
├── __init__.py          # Point d'entrée Python
├── __manifest__.py      # Métadonnées du module (nom, version, dépendances)
├── models/              # Modèles de données (logique métier)
│   ├── __init__.py
│   └── mon_modele.py
├── views/               # Interfaces utilisateur (XML)
│   └── vues.xml
├── security/            # Permissions et règles d'accès
│   └── ir.model.access.csv
├── data/                # Données par défaut
│   └── donnees.xml
└── static/              # Assets web (CSS, JS, images)
    └── description/
        └── icon.png
```

### 🗂️ Où Odoo cherche les addons ?

Odoo scanne plusieurs répertoires au démarrage :

```
┌─────────────────────────────────────────────────────────────┐
│  Ordre de priorité (du plus prioritaire au moins)           │
├─────────────────────────────────────────────────────────────┤
│  1. /mnt/extra-addons     ← VOS modules personnalisés      │
│  2. /var/lib/odoo/addons  ← Modules installés via pip      │
│  3. /usr/lib/python3/...  ← Modules Odoo officiels (base)  │
└─────────────────────────────────────────────────────────────┘
```

Dans Kubernetes, on utilise **principalement** `/mnt/extra-addons` car :
- ✅ Séparé du code Odoo officiel
- ✅ Persistant via PersistentVolume
- ✅ Partagé entre tous les pods Odoo

### 🔐 Pourquoi les permissions sont critiques ?

Odoo s'exécute avec l'**utilisateur ID 101** (nommé `odoo`). Si les fichiers dans `/mnt/extra-addons` appartiennent à `root` (UID 0), Odoo ne peut pas les lire :

```
❌ Mauvaises permissions :
drwxr-xr-x root  root  mon_addon/

✅ Bonnes permissions :
drwxr-xr-x 101   101   mon_addon/
```

### 🐧 Pourquoi tar.gz et pas zip ?

| Format | Préserve les permissions Unix | Compatible Kubernetes |
|--------|-------------------------------|----------------------|
| `.zip` | ❌ Non | ⚠️ Partiel |
| `.tar.gz` | ✅ Oui | ✅ Complet |

Le format ZIP ne stocke pas les bits de permission Unix (755, 644, etc.), ce qui peut casser les scripts exécutables.

---

## 2. Architecture du déploiement

### 🏗️ Vue d'ensemble

```
┌────────────────────────────────────────────────────────────────┐
│                   ÉTAPE 1 : ACQUISITION                         │
│  ┌──────────────┐                                              │
│  │  Odoo Apps   │  Téléchargement du module                    │
│  │  Store       │  (ex: base_accounting_kit.zip)               │
│  └──────┬───────┘                                              │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────┐                                              │
│  │  PC Local    │  Stockage temporaire                         │
│  │  (Windows)   │  C:\Users\...\Downloads\                     │
│  └──────┬───────┘                                              │
└─────────┼──────────────────────────────────────────────────────┘
          │
          │ scp (transfert SSH)
          ▼
┌────────────────────────────────────────────────────────────────┐
│                  ÉTAPE 2 : PRÉPARATION                          │
│  ┌──────────────┐                                              │
│  │  VM Vagrant  │  Transformation + Vérification               │
│  │  (Rebond)    │  ~/odoo-platform/kubernetes/apps/            │
│  └──────┬───────┘                                              │
│         │                                                       │
│         ├─ unzip → extraction                                  │
│         ├─ tar czf → compression .tar.gz                       │
│         └─ tar tvzf → vérification contenu                     │
└─────────┼──────────────────────────────────────────────────────┘
          │
          │ kubectl cp (copie vers pod)
          ▼
┌────────────────────────────────────────────────────────────────┐
│                  ÉTAPE 3 : INJECTION                            │
│  ┌──────────────────────────────────────────────────┐          │
│  │  Pod Odoo (Kubernetes)                           │          │
│  │  ┌────────────────────────────────────────┐      │          │
│  │  │  /mnt/extra-addons (PersistentVolume) │      │          │
│  │  │  ├── base_accounting_kit/              │      │          │
│  │  │  │   ├── __init__.py                   │      │          │
│  │  │  │   ├── __manifest__.py               │      │          │
│  │  │  │   └── ...                           │      │          │
│  │  │  └── autre_addon/                      │      │          │
│  │  └────────────────────────────────────────┘      │          │
│  │                                                   │          │
│  │  Propriétaire : 101:101 (odoo:odoo)              │          │
│  │  Permissions : 755 (dossiers), 644 (fichiers)    │          │
│  └──────────────────────────────────────────────────┘          │
└─────────┼──────────────────────────────────────────────────────┘
          │
          │ Redémarrage pod
          ▼
┌────────────────────────────────────────────────────────────────┐
│                 ÉTAPE 4 : ACTIVATION                            │
│  ┌──────────────────────────────────────────────────┐          │
│  │  Interface Odoo                                  │          │
│  │  1. Mode développeur activé                      │          │
│  │  2. Mise à jour liste des applications           │          │
│  │  3. Recherche + Installation du module           │          │
│  └──────────────────────────────────────────────────┘          │
└────────────────────────────────────────────────────────────────┘
```

### 🔄 Cycle de vie d'un addon dans K8s

```
Téléchargement (ZIP)
        ↓
Extraction + Compression (tar.gz)
        ↓
Transfert vers Pod K8s
        ↓
Extraction dans /mnt/extra-addons
        ↓
Correction permissions (chown 101:101)
        ↓
Redémarrage Pod (scan addons)
        ↓
Mise à jour liste modules (UI Odoo)
        ↓
Installation module
        ↓
✅ Module actif
```

---

## 3. Prérequis et préparation

### ✅ Vérifications initiales

#### 3.1 - Vérifier que le cluster fonctionne

```bash
# Vérifier que les pods Odoo sont Running
kubectl get pods -n odoo-v19 -l app=odoo

# Résultat attendu :
# NAME                    READY   STATUS    RESTARTS   AGE
# odoo-7d8f9c6b5d-abc12   1/1     Running   0          5h
# odoo-7d8f9c6b5d-def34   1/1     Running   0          5h
# odoo-7d8f9c6b5d-ghi56   1/1     Running   0          5h
```

#### 3.2 - Vérifier le PersistentVolume pour les addons

```bash
# Lister les PVCs
kubectl get pvc -n odoo-v19

# Résultat attendu :
# NAME              STATUS   VOLUME       CAPACITY   STORAGECLASS
# odoo-addons-pvc   Bound    pvc-xxx...   10Gi       ceph-rbd
```

Si le PVC n'existe pas, créez-le :

```yaml
# odoo-addons-pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: odoo-addons-pvc
  namespace: odoo-v19
spec:
  accessModes:
    - ReadWriteMany  # Partagé entre tous les pods Odoo
  storageClassName: cephfs  # Ou votre StorageClass RWX
  resources:
    requests:
      storage: 10Gi
```

```bash
kubectl apply -f odoo-addons-pvc.yaml
```

#### 3.3 - Vérifier que le volume est monté

```bash
# Entrer dans un pod Odoo
POD_NAME=$(kubectl get pods -n odoo-v19 -l app=odoo -o jsonpath='{.items[0].metadata.name}')

kubectl exec -it -n odoo-v19 $POD_NAME -- bash

# Dans le pod :
ls -la /mnt/extra-addons

# Résultat attendu :
# drwxr-xr-x 2 101 101 4096 Jan 15 10:00 .
# drwxr-xr-x 3 root root 4096 Jan 15 09:00 ..
```
:::note
Si le dossier n'existe pas, il faut modifier le Deployment Odoo pour monter le volume.
:::

### 📦 Structure de répertoires recommandée

Sur votre **VM Vagrant** (ou machine de travail) :

```bash
# Créer la structure
mkdir -p ~/odoo-platform/kubernetes/apps/odoo/addons/{accounting,hr,sales,custom}

# Structure finale :
~/odoo-platform/kubernetes/apps/odoo/
└── addons/
    ├── accounting/          # Modules comptabilité
    │   └── base_accounting_kit.zip
    ├── hr/                  # Modules RH
    ├── sales/               # Modules ventes
    └── custom/              # Développements maison
```

---

## 4. Méthode 1 : Installation via fichier ZIP

> Cette méthode est la plus courante pour les modules téléchargés depuis l'Odoo Apps Store.

### 📥 Étape 1 : Téléchargement du module

1. Aller sur **https://apps.odoo.com/**
2. Rechercher le module (exemple : "Base Accounting Kit")
3. Télécharger le fichier ZIP
4. Sauvegarder dans `C:\Users\VotreNom\Downloads\base_accounting_kit.zip`

### 🚀 Étape 2 : Transfert vers la VM Vagrant

Depuis **Windows PowerShell** :

```powershell
# Définir les variables pour plus de clarté
$MODULE_NAME = "base_accounting_kit.zip"
$LOCAL_PATH = "$env:USERPROFILE\Downloads\$MODULE_NAME"
$REMOTE_PATH = "odoo@vagrant-vm:~/odoo-platform/kubernetes/apps/odoo/addons/accounting/"

# Transférer le fichier via SCP
scp $LOCAL_PATH $REMOTE_PATH

# Vérifier le transfert
ssh odoo@vagrant-vm "ls -lh ~/odoo-platform/kubernetes/apps/odoo/addons/accounting/"
```

:::note
**Alternative avec WinSCP** (interface graphique) :
1. Ouvrir WinSCP
2. Se connecter à `vagrant-vm`
3. Glisser-déposer le fichier ZIP
:::

### 🔧 Étape 3 : Préparation dans Vagrant

Connexion à la VM :

```bash
# Depuis Windows
ssh odoo@vagrant-vm

# Naviguer vers le répertoire
cd ~/odoo-platform/kubernetes/apps/odoo/addons/accounting/
```

#### 3.1 - Extraction du ZIP

```bash
# Extraire le contenu
unzip base_accounting_kit.zip

# Vérifier l'extraction
ls -la

# Résultat attendu :
# drwxr-xr-x vagrant vagrant 4096 base_accounting_kit/
# -rw-r--r-- vagrant vagrant 2.5M base_accounting_kit.zip
```

#### 3.2 - Vérification de la structure

```bash
# Entrer dans le module
cd base_accounting_kit

# Vérifier les fichiers obligatoires
ls -la

# ✅ Fichiers essentiels à vérifier :
# -rw-r--r-- __init__.py       ← Point d'entrée Python
# -rw-r--r-- __manifest__.py   ← Métadonnées du module

# Afficher les métadonnées
cat __manifest__.py | head -20
```

**Exemple de `__manifest__.py` :**

```python
{
    'name': 'Base Accounting Kit',
    'version': '19.0.1.0.0',
    'category': 'Accounting',
    'summary': 'Full featured Accounting Kit for Odoo',
    'depends': ['account', 'base'],
    'data': [
        'security/ir.model.access.csv',
        'views/account_views.xml',
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
}
```

**Points à vérifier** :
- ✅ `'version': '19.0...'` → Compatible Odoo 19
- ✅ `'depends': [...]` → Dépendances listées
- ✅ `'installable': True` → Module installable

#### 3.3 - Création de l'archive tar.gz

Pourquoi tar.gz ? Pour **préserver les permissions Unix** que ZIP ignore.

```bash
# Revenir au dossier parent
cd ..

# Créer l'archive tar.gz
# --exclude="*.zip" : Exclut le fichier ZIP original
# -c : Créer
# -z : Compresser (gzip)
# -f : Fichier de sortie
# -C : Change de répertoire avant d'archiver
tar --exclude="*.zip" -czf modules_accounting.tar.gz -C . base_accounting_kit

# Vérifier l'archive créée
ls -lh modules_accounting.tar.gz

# Résultat attendu :
# -rw-r--r-- vagrant vagrant 2.3M modules_accounting.tar.gz
```

#### 3.4 - Vérification du contenu de l'archive

```bash
# Lister le contenu sans extraire
tar -tvzf modules_accounting.tar.gz | head -20

# Résultat attendu :
# drwxr-xr-x vagrant/vagrant   0 base_accounting_kit/
# -rw-r--r-- vagrant/vagrant 123 base_accounting_kit/__init__.py
# -rw-r--r-- vagrant/vagrant 456 base_accounting_kit/__manifest__.py
# drwxr-xr-x vagrant/vagrant   0 base_accounting_kit/models/
# -rw-r--r-- vagrant/vagrant 789 base_accounting_kit/models/__init__.py
```

**Points à vérifier** :
- ✅ Chemins relatifs (pas de `/` au début)
- ✅ Permissions correctes (755 pour dossiers, 644 pour fichiers)
- ✅ Structure cohérente

### 📦 Étape 4 : Injection dans Kubernetes

#### 4.1 - Récupérer le nom du pod Odoo

```bash
# Méthode automatique (récupère le 1er pod)
POD_NAME=$(kubectl get pods -n odoo-v19 -l app=odoo -o jsonpath='{.items[0].metadata.name}')

# Afficher le nom
echo "Pod cible : $POD_NAME"

# Résultat : Pod cible : odoo-7d8f9c6b5d-abc12
```

**Méthode manuelle** (si plusieurs pods) :

```bash
# Lister tous les pods Odoo
kubectl get pods -n odoo-v19 -l app=odoo

# Choisir un pod et définir manuellement
POD_NAME="odoo-7d8f9c6b5d-abc12"
```

#### 4.2 - Copie de l'archive vers le pod

```bash
# Copier l'archive tar.gz dans le pod
kubectl cp modules_accounting.tar.gz odoo-v19/$POD_NAME:/mnt/extra-addons/

# ⏱️ Cette opération peut prendre 10-30 secondes selon la taille
```

**Vérification immédiate** :

```bash
# Vérifier que le fichier est bien présent
kubectl exec -n odoo-v19 $POD_NAME -- ls -lh /mnt/extra-addons/

# Résultat attendu :
# -rw-r--r-- 1 root root 2.3M modules_accounting.tar.gz
```

#### 4.3 - Extraction AVEC correction des permissions

⚠️ **C'EST ICI QUE L'ERREUR SURVIENT SOUVENT !**

**Commande INCORRECTE** (produit l'erreur) :

```bash
# ❌ NE PAS FAIRE CECI :
kubectl exec -n odoo-v19 $POD_NAME -- tar -xzf /mnt/extra-addons/modules_accounting.tar.gz -C /mnt/extra-addons/

# ❌ Erreur obtenue :
# tar: .: Cannot utime: Operation not permitted
# tar: .: Cannot change mode to rwxr-xr-x: Operation not permitted
```

:::tip[**Pourquoi cette erreur ?**]

```
┌────────────────────────────────────────────────────────────┐
│  Le problème : Point de montage Kubernetes                  │
├────────────────────────────────────────────────────────────┤
│  /mnt/extra-addons est un PersistentVolume monté           │
│  La racine (.) de ce volume appartient au système          │
│  tar essaie de modifier les métadonnées de cette racine    │
│  Kubernetes REFUSE (protection du point de montage)        │
└────────────────────────────────────────────────────────────┘
```
:::
**Commande CORRECTE** (avec `--no-overwrite-dir`) :

```bash
# ✅ BONNE MÉTHODE : Extraction + Correction permissions en une seule commande
kubectl exec -n odoo-v19 $POD_NAME -- bash -c "
    cd /mnt/extra-addons && \
    tar -xzf modules_accounting.tar.gz --no-overwrite-dir && \
    rm modules_accounting.tar.gz && \
    chown -R 101:101 /mnt/extra-addons/base_accounting_kit
"

# 📝 Explication des options :
# --no-overwrite-dir : N'essaie PAS de modifier le dossier parent
# chown -R 101:101   : Change le propriétaire en odoo (UID 101, GID 101)
# rm                 : Supprime l'archive (ménage)
```

**Décomposition pédagogique** de la commande :

```bash
# 1. Aller dans le dossier des addons
cd /mnt/extra-addons

# 2. Extraire l'archive SANS modifier le point de montage
tar -xzf modules_accounting.tar.gz --no-overwrite-dir

# 3. Supprimer l'archive (libérer de l'espace)
rm modules_accounting.tar.gz

# 4. Donner la propriété à l'utilisateur odoo (101)
chown -R 101:101 /mnt/extra-addons/base_accounting_kit
```

**Option `--no-overwrite-dir` expliquée** :

| Sans l'option | Avec l'option |
|---------------|---------------|
| tar essaie de mettre à jour les timestamps du dossier `.` | tar ignore le dossier `.` et extrait juste le contenu |
| tar essaie de changer les permissions de `.` | tar ne touche pas aux permissions de `.` |
| ❌ Erreur sur les points de montage K8s | ✅ Fonctionne toujours |

#### 4.4 - Vérification finale

```bash
# Vérifier la présence du module
kubectl exec -n odoo-v19 $POD_NAME -- ls -la /mnt/extra-addons/

# ✅ Résultat attendu :
# drwxr-xr-x  3 101  101  4096 Jan 15 10:30 .
# drwxr-xr-x  3 root root 4096 Jan 15 10:00 ..
# drwxr-xr-x  5 101  101  4096 Jan 15 10:30 base_accounting_kit

# ⚠️ Points critiques à vérifier :
# 1. Propriétaire = 101 (odoo), PAS root
# 2. Permissions = 755 pour les dossiers
```

**Vérification approfondie** :

```bash
# Vérifier les fichiers Python essentiels
kubectl exec -n odoo-v19 $POD_NAME -- ls -la /mnt/extra-addons/base_accounting_kit/

# ✅ Doit contenir au minimum :
# -rw-r--r-- 101 101  __init__.py
# -rw-r--r-- 101 101  __manifest__.py
```

### 🔄 Étape 5 : Redémarrage des pods

**Pourquoi redémarrer ?**

Odoo scanne le répertoire `/mnt/extra-addons` **au démarrage uniquement**. Pour qu'il détecte les nouveaux modules, il faut :
- Soit redémarrer les pods
- Soit attendre un redémarrage naturel

```bash
# Méthode 1 : Redémarrage gracieux (recommandé)
kubectl rollout restart deployment/odoo -n odoo-v19

# 🕐 Observation du rollout :
# Kubernetes va recréer les pods un par un
# Pas de downtime si vous avez plusieurs replicas
```

**Suivre le redémarrage** :

```bash
# Observer le rollout en temps réel
kubectl rollout status deployment/odoo -n odoo-v19

# Résultat attendu :
# Waiting for deployment "odoo" rollout to finish: 1 out of 3 new replicas have been updated...
# Waiting for deployment "odoo" rollout to finish: 2 out of 3 new replicas have been updated...
# deployment "odoo" successfully rolled out
```

**Vérifier les nouveaux pods** :

```bash
# Lister les pods (nouveaux = AGE récent)
kubectl get pods -n odoo-v19 -l app=odoo

# Résultat attendu :
# NAME                    READY   STATUS    RESTARTS   AGE
# odoo-7d8f9c6b5d-xyz01   1/1     Running   0          30s  ← Nouveau
# odoo-7d8f9c6b5d-xyz02   1/1     Running   0          45s  ← Nouveau
# odoo-7d8f9c6b5d-xyz03   1/1     Running   0          60s  ← Nouveau
```

**Vérifier les logs du nouveau pod** :

```bash
# Récupérer le nom d'un nouveau pod
NEW_POD=$(kubectl get pods -n odoo-v19 -l app=odoo --sort-by=.metadata.creationTimestamp -o jsonpath='{.items[-1].metadata.name}')

# Voir les logs de démarrage
kubectl logs -n odoo-v19 $NEW_POD | grep -i addon

# ✅ Rechercher une ligne comme :
# INFO ? odoo.modules.loading: Modules loaded.
# INFO ? odoo.addons.base_accounting_kit: Module base_accounting_kit loaded
```

---

## 5. Méthode 2 : Installation via Git

*Pour les modules open-source hébergés sur GitHub/GitLab*

### 📂 Cas d'usage

Cette méthode est idéale pour :
- ✅ Modules open-source sur GitHub
- ✅ Modules en développement actif (mises à jour fréquentes)
- ✅ Projets collaboratifs

### 🚀 Procédure complète

#### Étape 1 : Cloner le dépôt localement

Sur votre **VM Vagrant** :

```bash
# Se placer dans le bon répertoire
cd ~/odoo-platform/kubernetes/apps/odoo/addons/custom/

# Cloner le module
git clone https://github.com/OCA/account-financial-reporting.git

# Résultat :
# Cloning into 'account-financial-reporting'...
# remote: Enumerating objects: 1234, done.
# ...
```

#### Étape 2 : Vérifier la compatibilité

```bash
# Entrer dans le dépôt
cd account-financial-reporting

# Lister les branches (chercher la branche 19.0)
git branch -a

# ✅ Rechercher : remotes/origin/19.0

# Changer de branche si nécessaire
git checkout 19.0

# Vérifier le contenu
ls -la

# Résultat : plusieurs modules dans ce dépôt
# account_financial_report/
# account_tax_balance/
# mis_builder/
```

#### Étape 3 : Sélectionner un module spécifique

Contrairement à un téléchargement Apps Store, un dépôt Git peut contenir **plusieurs modules**.

```bash
# Copier uniquement le module voulu
cp -r account_financial_report ../account_financial_report_standalone

# Retourner au dossier parent
cd ..

# Créer l'archive
tar -czf account_financial_report.tar.gz account_financial_report_standalone
```

#### Étape 4 : Injection dans K8s

```bash
# Récupérer le pod
POD_NAME=$(kubectl get pods -n odoo-v19 -l app=odoo -o jsonpath='{.items[0].metadata.name}')

# Copier
kubectl cp account_financial_report.tar.gz odoo-v19/$POD_NAME:/mnt/extra-addons/

# Extraire et corriger
kubectl exec -n odoo-v19 $POD_NAME -- bash -c "
    cd /mnt/extra-addons && \
    tar -xzf account_financial_report.tar.gz --no-overwrite-dir && \
    mv account_financial_report_standalone account_financial_report && \
    rm account_financial_report.tar.gz && \
    chown -R 101:101 account_financial_report
"

# Redémarrer
kubectl rollout restart deployment/odoo -n odoo-v19
```

---

## 6. Comparaison des deux méthodes principales d'installation

### 🎯 Vue d'ensemble des méthodes

Il existe **deux approches fondamentales** pour déployer des addons Odoo dans Kubernetes. Chacune a ses avantages, inconvénients et cas d'usage spécifiques.

```
┌────────────────────────────────────────────────────────────────────┐
│                    MÉTHODE 1 : InitContainer                        │
│  Addons intégrés dans l'image ou téléchargés au démarrage du pod  │
└────────────────────────────────────────────────────────────────────┘
                                vs
┌────────────────────────────────────────────────────────────────────┐
│              MÉTHODE 2 : Copie manuelle avec kubectl cp            │
│  Addons copiés manuellement dans un volume partagé persistant     │
└────────────────────────────────────────────────────────────────────┘
```

### 📦 MÉTHODE 1 : InitContainer (Automatisée)

#### 🏗️ Principe

Les addons sont **automatiquement** installés à chaque démarrage du pod via un **InitContainer** qui s'exécute **avant** le container Odoo principal.

#### 📋 Implémentation complète

**Étape 1 : Héberger les archives des addons**

Vous devez rendre vos archives `.tar.gz` accessibles via HTTP/HTTPS. Options possibles :

```bash
# Option A : Serveur HTTP simple (développement)
python3 -m http.server 8080 --directory ~/odoo-addons/

# Option B : Nginx dans Kubernetes
# Option C : Stockage S3/MinIO
# Option D : Registry d'artifacts (Nexus, Artifactory)
```

**Étape 2 : Créer une ConfigMap avec la liste des addons**

```yaml
# odoo-addons-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: odoo-addons-list
  namespace: odoo-v19
data:
  # Format : nom_addon==version
  addons.txt: |
    base_accounting_kit==1.1.0
    account_financial_report==2.0.0
    mis_builder==3.1.0
  
  # URL du serveur hébergeant les archives
  server.txt: |
    https://addons.example.com
```

Appliquer :

```bash
kubectl apply -f odoo-addons-configmap.yaml
```

**Étape 3 : Modifier le Deployment Odoo**

```yaml
# odoo-deployment-initcontainer.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: odoo
  namespace: odoo-v19
spec:
  replicas: 3
  selector:
    matchLabels:
      app: odoo
  template:
    metadata:
      labels:
        app: odoo
    spec:
      # ═════════════════════════════════════════════════════════
      # INITCONTAINER : Installation automatique des addons
      # ═════════════════════════════════════════════════════════
      initContainers:
      - name: install-addons
        image: alpine:3.19
        command:
        - /bin/sh
        - -c
        - |
          set -e  # Arrêter en cas d'erreur
          
          echo "🚀 Démarrage installation addons..."
          
          # Installer curl et tar
          apk add --no-cache curl tar
          
          # Lire l'URL du serveur
          SERVER=$(cat /config/server.txt)
          echo "📡 Serveur : $SERVER"
          
          # Lire et installer chaque addon
          while IFS='==' read -r addon version; do
            # Ignorer les lignes vides et commentaires
            [[ -z "$addon" || "$addon" =~ ^# ]] && continue
            
            echo "📦 Installation de $addon version $version..."
            
            # Télécharger l'archive
            if ! curl -fL -o /tmp/$addon.tar.gz "$SERVER/$addon-$version.tar.gz"; then
              echo "❌ Erreur : Impossible de télécharger $addon-$version"
              exit 1
            fi
            
            # Vérifier que l'archive n'est pas vide
            if [ ! -s /tmp/$addon.tar.gz ]; then
              echo "❌ Erreur : Archive vide pour $addon-$version"
              exit 1
            fi
            
            # Extraire dans /mnt/extra-addons
            echo "📂 Extraction de $addon..."
            tar -xzf /tmp/$addon.tar.gz -C /mnt/extra-addons/ --no-overwrite-dir
            
            # Nettoyer
            rm /tmp/$addon.tar.gz
            
            echo "✅ $addon installé avec succès"
          done < /config/addons.txt
          
          # Corriger les permissions (CRITIQUE)
          echo "🔐 Correction des permissions..."
          chown -R 101:101 /mnt/extra-addons/
          chmod -R 755 /mnt/extra-addons/
          
          echo "🎉 Tous les addons sont installés !"
          
          # Lister les addons installés
          ls -la /mnt/extra-addons/
        
        volumeMounts:
        - name: extra-addons
          mountPath: /mnt/extra-addons
        - name: addons-config
          mountPath: /config
      
      # ═════════════════════════════════════════════════════════
      # CONTAINER PRINCIPAL : Odoo
      # ═════════════════════════════════════════════════════════
      containers:
      - name: odoo
        image: odoo:19.0
        args:
          - "--"
          - "-d"
          - "app"
          - "-i"
          - "base"
          - "--data-dir"
          - "/var/lib/odoo"
        
        securityContext:
          allowPrivilegeEscalation: false
          runAsUser: 101
          capabilities:
            drop: ["ALL"]
        
        env:
          - name: HOST
            value: "odoo-db-rw"
          - name: USER
            value: "app"
          - name: PASSWORD
            valueFrom:
              secretKeyRef:
                name: odoo-db-app
                key: password
          - name: HOME
            value: "/var/lib/odoo"
          - name: XDG_DATA_HOME
            value: "/var/lib/odoo/.local/share"
          - name: XDG_CONFIG_HOME
            value: "/var/lib/odoo/.config"
        
        ports:
        - containerPort: 8069
          name: http
        
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
        
        volumeMounts:
        - name: odoo-data
          mountPath: /var/lib/odoo
        - name: extra-addons
          mountPath: /mnt/extra-addons
          readOnly: true  # Lecture seule car addons déjà installés
      
      volumes:
      - name: odoo-data
        persistentVolumeClaim:
          claimName: odoo-data-pvc
      - name: extra-addons
        emptyDir: {}  # Volume temporaire recréé à chaque pod
      - name: addons-config
        configMap:
          name: odoo-addons-list
```

**Étape 4 : Déployer**

```bash
# Appliquer le nouveau Deployment
kubectl apply -f odoo-deployment-initcontainer.yaml

# Suivre le démarrage
kubectl get pods -n odoo-v19 -w

# Observer les logs de l'InitContainer
POD_NAME=$(kubectl get pods -n odoo-v19 -l app=odoo -o jsonpath='{.items[0].metadata.name}')
kubectl logs -n odoo-v19 $POD_NAME -c install-addons

# Résultat attendu :
# 🚀 Démarrage installation addons...
# 📡 Serveur : https://addons.example.com
# 📦 Installation de base_accounting_kit version 1.1.0...
# 📂 Extraction de base_accounting_kit...
# ✅ base_accounting_kit installé avec succès
# 🔐 Correction des permissions...
# 🎉 Tous les addons sont installés !
```

#### ✅ Avantages de la méthode InitContainer

| Avantage | Explication | Impact |
|----------|-------------|--------|
| **🤖 Automatisation complète** | Pas d'intervention manuelle | ⭐⭐⭐⭐⭐ |
| **🔄 Reproductibilité** | Chaque pod obtient exactement les mêmes addons | ⭐⭐⭐⭐⭐ |
| **📦 Gestion centralisée** | ConfigMap unique pour tous les addons | ⭐⭐⭐⭐⭐ |
| **🚀 GitOps compatible** | S'intègre parfaitement avec ArgoCD/FluxCD | ⭐⭐⭐⭐⭐ |
| **🔁 Rollback facile** | Modifier la ConfigMap et redéployer | ⭐⭐⭐⭐ |
| **📈 Scaling transparent** | Nouveaux pods = addons auto-installés | ⭐⭐⭐⭐⭐ |
| **🧹 Pas de PVC nécessaire** | emptyDir suffit (économie de stockage) | ⭐⭐⭐⭐ |

#### ❌ Inconvénients de la méthode InitContainer

| Inconvénient | Explication | Impact |
|--------------|-------------|--------|
| **⏱️ Temps de démarrage** | Téléchargement à chaque création de pod (+30s-2min) | ⭐⭐⭐ |
| **🌐 Dépendance réseau** | Besoin d'accès au serveur d'addons | ⭐⭐⭐ |
| **🏗️ Infrastructure requise** | Serveur HTTP/S3 pour héberger les archives | ⭐⭐⭐ |
| **🔧 Complexité initiale** | Configuration plus complexe | ⭐⭐ |
| **💾 Bande passante** | Téléchargement répété si scaling fréquent | ⭐⭐ |

---

### 🛠️ MÉTHODE 2 : Copie manuelle kubectl cp (Classique)

#### 🏗️ Principe

Les addons sont copiés **manuellement** dans un **PersistentVolume** partagé entre tous les pods Odoo.

#### 📋 Implémentation complète

**Étape 1 : Créer le PersistentVolumeClaim**

```yaml
# odoo-addons-pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: odoo-addons-pvc
  namespace: odoo-v19
spec:
  accessModes:
    - ReadWriteMany  # CRITIQUE : Tous les pods doivent pouvoir lire
  storageClassName: cephfs  # Ou nfs, longhorn, etc. (doit supporter RWX)
  resources:
    requests:
      storage: 10Gi
```

```bash
kubectl apply -f odoo-addons-pvc.yaml

# Vérifier
kubectl get pvc -n odoo-v19
# STATUS doit être "Bound"
```

**Étape 2 : Modifier le Deployment Odoo**

```yaml
# odoo-deployment-manual.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: odoo
  namespace: odoo-v19
spec:
  replicas: 3
  selector:
    matchLabels:
      app: odoo
  template:
    metadata:
      labels:
        app: odoo
    spec:
      securityContext:
        fsGroup: 101
      
      containers:
      - name: odoo
        image: odoo:19.0
        # ... (reste de la config identique)
        
        volumeMounts:
        - name: odoo-data
          mountPath: /var/lib/odoo
        - name: extra-addons
          mountPath: /mnt/extra-addons
          readOnly: false  # Les pods peuvent lire ET écrire
      
      volumes:
      - name: odoo-data
        emptyDir: {}
      - name: extra-addons
        persistentVolumeClaim:
          claimName: odoo-addons-pvc  # ← Volume partagé
```

```bash
kubectl apply -f odoo-deployment-manual.yaml
```

**Étape 3 : Préparation de l'archive (sur VM Vagrant)**

```bash
# 1. Se connecter à la VM Vagrant
ssh odoo@vagrant-vm

# 2. Naviguer vers le répertoire des addons
cd ~/odoo-platform/kubernetes/apps/odoo/addons/accounting/

# 3. Extraire le ZIP téléchargé
unzip base_accounting_kit.zip

# 4. Créer l'archive tar.gz
tar --exclude="*.zip" -czf modules_accounting.tar.gz -C . base_accounting_kit

# 5. Vérifier le contenu
tar -tvzf modules_accounting.tar.gz | head -10

# Résultat attendu :
# drwxr-xr-x vagrant/vagrant   0 base_accounting_kit/
# -rw-r--r-- vagrant/vagrant 123 base_accounting_kit/__init__.py
# -rw-r--r-- vagrant/vagrant 456 base_accounting_kit/__manifest__.py
```

**Étape 4 : Copie vers Kubernetes**

```bash
# 1. Récupérer le nom d'un pod Odoo
POD_NAME=$(kubectl get pods -n odoo-v19 -l app=odoo -o jsonpath='{.items[0].metadata.name}')

echo "Pod cible : $POD_NAME"

# 2. Copier l'archive dans le pod
kubectl cp modules_accounting.tar.gz odoo-v19/$POD_NAME:/mnt/extra-addons/

# ⏱️ Attendre la fin de la copie (10-30 secondes)

# 3. Vérifier que le fichier est présent
kubectl exec -n odoo-v19 $POD_NAME -- ls -lh /mnt/extra-addons/

# Résultat attendu :
# -rw-r--r-- 1 root root 2.3M modules_accounting.tar.gz
```

**Étape 5 : Extraction avec correction des permissions**

⚠️ **COMMANDE CRITIQUE** - Ne pas oublier `--no-overwrite-dir`

```bash
# Extraction + Correction permissions + Nettoyage (tout en une commande)
kubectl exec -n odoo-v19 $POD_NAME -- bash -c "
    cd /mnt/extra-addons && \
    tar -xzf modules_accounting.tar.gz --no-overwrite-dir && \
    rm modules_accounting.tar.gz && \
    chown -R 101:101 /mnt/extra-addons/base_accounting_kit && \
    chmod -R 755 /mnt/extra-addons/base_accounting_kit
"

# Vérification finale
kubectl exec -n odoo-v19 $POD_NAME -- ls -la /mnt/extra-addons/

# ✅ Résultat attendu :
# drwxr-xr-x  3 101  101  4096 base_accounting_kit
#             ^^^  ^^^  ← DOIT être 101, PAS root
```

**Décomposition de la commande d'extraction** :

```bash
# 1. Se placer dans le bon répertoire
cd /mnt/extra-addons

# 2. Extraire l'archive SANS modifier le point de montage
tar -xzf modules_accounting.tar.gz --no-overwrite-dir
# --no-overwrite-dir = NE PAS essayer de modifier le dossier parent

# 3. Supprimer l'archive (libérer de l'espace)
rm modules_accounting.tar.gz

# 4. Donner la propriété à l'utilisateur odoo (UID 101, GID 101)
chown -R 101:101 /mnt/extra-addons/base_accounting_kit

# 5. Fixer les permissions (755 = rwxr-xr-x)
chmod -R 755 /mnt/extra-addons/base_accounting_kit
```

**Étape 6 : Redémarrage des pods**

```bash
# Redémarrage gracieux (rolling restart)
kubectl rollout restart deployment/odoo -n odoo-v19

# Suivre le rollout
kubectl rollout status deployment/odoo -n odoo-v19

# Résultat attendu :
# Waiting for deployment "odoo" rollout to finish: 1 out of 3 new replicas...
# Waiting for deployment "odoo" rollout to finish: 2 out of 3 new replicas...
# deployment "odoo" successfully rolled out

# Vérifier les nouveaux pods
kubectl get pods -n odoo-v19 -l app=odoo

# Les pods doivent avoir un AGE récent (< 2 minutes)
```

**Étape 7 : Vérification dans les logs**

```bash
# Récupérer un nouveau pod
NEW_POD=$(kubectl get pods -n odoo-v19 -l app=odoo --sort-by=.metadata.creationTimestamp -o jsonpath='{.items[-1].metadata.name}')

# Voir les logs de démarrage
kubectl logs -n odoo-v19 $NEW_POD | grep -i "addon\|module"

# ✅ Rechercher des lignes comme :
# INFO odoo.modules.loading: Modules loaded.
# INFO odoo.addons.base_accounting_kit: Module loaded
```

#### ✅ Avantages de la méthode kubectl cp

| Avantage | Explication | Impact |
|----------|-------------|--------|
| **⚡ Rapidité d'exécution** | Pas de téléchargement au démarrage des pods | ⭐⭐⭐⭐⭐ |
| **🔌 Indépendance réseau** | Pas besoin de serveur d'addons externe | ⭐⭐⭐⭐⭐ |
| **🎯 Simplicité conceptuelle** | Facile à comprendre pour les débutants | ⭐⭐⭐⭐ |
| **🛠️ Flexibilité** | Ajout/suppression d'addons à la volée | ⭐⭐⭐⭐ |
| **💾 Pas de re-téléchargement** | Archive copiée une seule fois | ⭐⭐⭐⭐ |
| **🔍 Débogage facile** | Inspection directe des fichiers dans le PVC | ⭐⭐⭐⭐ |

#### ❌ Inconvénients de la méthode kubectl cp

| Inconvénient | Explication | Impact |
|--------------|-------------|--------|
| **👨‍💻 Intervention manuelle** | Chaque addon nécessite une copie manuelle | ⭐⭐⭐⭐ |
| **📦 Gestion du PVC** | Besoin d'un PVC ReadWriteMany (coûteux) | ⭐⭐⭐ |
| **🚫 Pas GitOps-friendly** | Difficile d'automatiser avec ArgoCD | ⭐⭐⭐⭐ |
| **🔄 Rollback complexe** | Pas de versioning automatique | ⭐⭐⭐ |
| **⚠️ Risque d'incohérence** | Si oubli de copier dans tous les environnements | ⭐⭐⭐ |
| **💽 Consommation stockage** | PVC doit rester actif en permanence | ⭐⭐ |

---

### 📊 Tableau comparatif détaillé

| Critère | InitContainer | kubectl cp | Gagnant |
|---------|---------------|------------|---------|
| **Complexité initiale** | ⭐⭐⭐ Moyenne | ⭐ Faible | kubectl cp |
| **Temps de démarrage pod** | ⭐⭐ Lent (+1-2min) | ⭐⭐⭐⭐⭐ Rapide | kubectl cp |
| **Automatisation** | ⭐⭐⭐⭐⭐ Totale | ⭐ Manuelle | InitContainer |
| **GitOps** | ⭐⭐⭐⭐⭐ Parfait | ⭐⭐ Difficile | InitContainer |
| **Reproductibilité** | ⭐⭐⭐⭐⭐ Garantie | ⭐⭐⭐ Bonne | InitContainer |
| **Coût stockage** | ⭐⭐⭐⭐⭐ emptyDir (gratuit) | ⭐⭐⭐ PVC RWX (coûteux) | InitContainer |
| **Flexibilité** | ⭐⭐⭐ Moyenne | ⭐⭐⭐⭐⭐ Très flexible | kubectl cp |
| **Débogage** | ⭐⭐⭐ Moyen | ⭐⭐⭐⭐⭐ Facile | kubectl cp |
| **Scalabilité** | ⭐⭐⭐⭐⭐ Automatique | ⭐⭐⭐⭐ Bonne | InitContainer |
| **Dépendances externes** | ⭐⭐ Serveur requis | ⭐⭐⭐⭐⭐ Aucune | kubectl cp |

---

### 🎯 Préconisations par cas d'usage

#### ✅ Utilisez InitContainer si :

```
✓ Vous avez un pipeline CI/CD mature
✓ Vous utilisez GitOps (ArgoCD, FluxCD)
✓ Vous déployez dans plusieurs environnements (dev, staging, prod)
✓ Vous avez >5 addons à gérer
✓ Vous faites du scaling automatique (HPA)
✓ Vous voulez une infrastructure "immutable"
✓ Vous avez accès à un serveur HTTP/S3/Nexus
```

**Exemple d'organisation** :
```
Production Enterprise avec :
├─ 3 environnements (dev, staging, prod)
├─ 15+ addons personnalisés
├─ Déploiement automatisé avec ArgoCD
├─ Scaling automatique selon la charge
└─ Équipe DevOps structurée
```

#### ✅ Utilisez kubectl cp si :

```
✓ Vous êtes en phase de test/développement
✓ Vous avez <5 addons à gérer
✓ Vous n'avez pas encore de CI/CD
✓ Vous voulez tester rapidement un nouveau module
✓ Vous avez besoin de déboguer fréquemment
✓ Vous préférez la simplicité à l'automatisation
✓ Vous n'avez pas de serveur d'artifacts
```

**Exemple d'organisation** :
```
PME ou startup avec :
├─ 1-2 environnements
├─ 3-5 addons
├─ Déploiement manuel ou scripts bash
├─ Scaling manuel
└─ Petite équipe technique
```

---

### 🔄 Migration d'une méthode à l'autre

#### De kubectl cp → InitContainer

**Étape 1 : Héberger vos addons**

```bash
# Sur votre VM Vagrant, créer un serveur HTTP simple
cd ~/odoo-platform/kubernetes/apps/odoo/addons/
python3 -m http.server 8080

# Ou utiliser nginx :
kubectl create configmap nginx-addons-config --from-file=.
kubectl create deployment nginx-addons --image=nginx
kubectl expose deployment nginx-addons --port=80 --target-port=80
```

**Étape 2 : Créer la ConfigMap**

```bash
# Lister vos addons actuels
kubectl exec -n odoo-v19 $POD_NAME -- ls /mnt/extra-addons/

# Créer la ConfigMap
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: odoo-addons-list
  namespace: odoo-v19
data:
  addons.txt: |
    base_accounting_kit==1.1.0
    account_financial_report==2.0.0
  server.txt: |
    http://nginx-addons.odoo-v19.svc.cluster.local
EOF
```

**Étape 3 : Basculer le Deployment**

```bash
# Sauvegarder l'ancien
kubectl get deployment odoo -n odoo-v19 -o yaml > odoo-deployment-backup.yaml

# Appliquer le nouveau avec InitContainer
kubectl apply -f odoo-deployment-initcontainer.yaml
```

#### De InitContainer → kubectl cp

**Étape 1 : Créer le PVC**

```bash
kubectl apply -f odoo-addons-pvc.yaml
```

**Étape 2 : Copier les addons existants**

```bash
# Récupérer un pod avec InitContainer
POD_NAME=$(kubectl get pods -n odoo-v19 -l app=odoo -o jsonpath='{.items[0].metadata.name}')

# Créer une archive des addons actuels
kubectl exec -n odoo-v19 $POD_NAME -- tar -czf /tmp/current-addons.tar.gz -C /mnt/extra-addons .

# Télécharger l'archive
kubectl cp odoo-v19/$POD_NAME:/tmp/current-addons.tar.gz ./current-addons.tar.gz
```

**Étape 3 : Basculer et réinjecter**

```bash
# Appliquer le nouveau Deployment
kubectl apply -f odoo-deployment-manual.yaml

# Attendre que les pods redémarrent
kubectl rollout status deployment/odoo -n odoo-v19

# Copier les addons
NEW_POD=$(kubectl get pods -n odoo-v19 -l app=odoo -o jsonpath='{.items[0].metadata.name}')
kubectl cp current-addons.tar.gz odoo-v19/$NEW_POD:/mnt/extra-addons/
kubectl exec -n odoo-v19 $NEW_POD -- tar -xzf /mnt/extra-addons/current-addons.tar.gz -C /mnt/extra-addons/ --no-overwrite-dir
```

---

### 🎓 Recommandation finale

**Pour la production** :
```
┌────────────────────────────────────────────────────────┐
│  🏆 MÉTHODE RECOMMANDÉE : InitContainer                │
├────────────────────────────────────────────────────────┤
│  Raisons :                                             │
│  ✅ Infrastructure as Code (IaC)                       │
│  ✅ Reproductibilité garantie                          │
│  ✅ GitOps-friendly (versionning dans Git)             │
│  ✅ Scaling automatique sans intervention              │
│  ✅ Rollback simple (git revert)                       │
│  ✅ Audit trail complet                                │
└────────────────────────────────────────────────────────┘
```

**Pour le développement/test** :
```
┌────────────────────────────────────────────────────────┐
│  🛠️ MÉTHODE RECOMMANDÉE : kubectl cp                  │
├────────────────────────────────────────────────────────┤
│  Raisons :                                             │
│  ✅ Rapidité d'itération                               │
│  ✅ Simplicité pour tester                             │
│  ✅ Pas d'infrastructure additionnelle                 │
│  ✅ Débogage facile                                    │
│  ✅ Flexibilité maximale                               │
└────────────────────────────────────────────────────────┘
```

---

## 7. Méthode 3 : Image Docker personnalisée

*Pour inclure les addons directement dans l'image Docker (production avancée)*

### 🎯 Avantages

- ✅ **Immutabilité** : Les addons font partie de l'image
- ✅ **Déploiement rapide** : Pas de copie manuelle
- ✅ **Versioning** : Une image = une version précise
- ✅ **Rollback facile** : Retour à une image antérieure

### 📦 Création du Dockerfile

Créez `Dockerfile.custom` :

```dockerfile
# Partir de l'image officielle Odoo 19
FROM odoo:19.0

# Metadata
LABEL maintainer="votre-email@example.com"
LABEL version="19.0-custom-1.0"

# Passer en root pour installer des dépendances (si nécessaire)
USER root

# Installer des dépendances système (exemple)
RUN apt-get update && apt-get install -y \
    python3-dev \
    libxml2-dev \
    libxslt1-dev \
    && rm -rf /var/lib/apt/lists/*

# Copier les modules personnalisés
COPY ./addons/base_accounting_kit /mnt/extra-addons/base_accounting_kit
COPY ./addons/account_financial_report /mnt/extra-addons/account_financial_report

# Installer des dépendances Python additionnelles (si nécessaire)
COPY requirements.txt /tmp/
RUN pip3 install --no-cache-dir -r /tmp/requirements.txt

# Corriger les permissions
RUN chown -R odoo:odoo /mnt/extra-addons

# Repasser en utilisateur odoo
USER odoo

# Point d'entrée (hérité de l'image de base)
# CMD ["odoo"]
```

### 🏗️ Construction de l'image

```bash
# Structure du projet :
odoo-custom/
├── Dockerfile.custom
├── requirements.txt      # Dépendances Python additionnelles
└── addons/
    ├── base_accounting_kit/
    └── account_financial_report/

# Construire l'image
docker build -t my-registry.com/odoo-custom:19.0-v1 -f Dockerfile.custom .

# Pousser vers un registry
docker push my-registry.com/odoo-custom:19.0-v1
```

### 📝 Mise à jour du Deployment K8s

Modifiez `odoo-deployment.yaml` :

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: odoo
  namespace: odoo-v19
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: odoo
        image: my-registry.com/odoo-custom:19.0-v1  # ← Image personnalisée
        # ... reste de la config
```

Appliquer :

```bash
kubectl apply -f odoo-deployment.yaml

# Ou si l'image est la seule chose qui change :
kubectl set image deployment/odoo odoo=my-registry.com/odoo-custom:19.0-v1 -n odoo-v19
```

---

## 7. Activation et configuration

### 🔧 Étape 1 : Activer le mode développeur

**Via l'interface Odoo** :

1. Se connecter en tant qu'administrateur
2. Aller dans **Paramètres** (icône ⚙️)
3. Tout en bas : **Activer le mode développeur**

**Via l'URL** (plus rapide) :

```
https://votre-odoo.com/web?debug=1
```

**Vérification** :
- Un 🐞 (bug) apparaît en haut à droite
- Le menu affiche plus d'options techniques

### 🔄 Étape 2 : Mettre à jour la liste des applications

**Pourquoi ?**

Odoo cache la liste des modules. Après avoir ajouté un addon, il faut rafraîchir ce cache.

**Procédure** :

1. Aller dans **Applications**
2. Cliquer sur l'icône **⋮** (trois points) en haut à droite
3. Sélectionner **Mettre à jour la liste des applications**
4. Confirmer

**Résultat attendu** :
```
Mise à jour de la liste des modules...
X nouveaux modules trouvés.
```

### ✅ Étape 3 : Installer le module

1. Dans **Applications**, utiliser la barre de recherche
2. Taper le nom du module (ex: "base accounting kit")
3. Cliquer sur **Installer**

**Suivi de l'installation** :

```bash
# Suivre les logs en temps réel
kubectl logs -f -n odoo-v19 deployment/odoo

# Rechercher les lignes d'installation
# INFO ? odoo.modules.loading: loading 1 modules...
# INFO ? odoo.modules.loading: 1 modules loaded in 0.50s
# INFO ? odoo.modules.registry: module base_accounting_kit: creating or updating database tables
```

**Installation réussie** :
- Le bouton **Installer** devient **Désinstaller**
- Le module apparaît dans le menu principal

### ⚙️ Étape 4 : Configuration initiale (si nécessaire)

Certains modules nécessitent une configuration après installation.

**Exemple pour Base Accounting Kit** :

1. Aller dans **Facturation/Comptabilité → Configuration**
2. Configurer le plan comptable
3. Définir les journaux comptables
4. Configurer les taxes

---

## 8. Dépannage des problèmes courants

### ❌ Problème 1 : "Module not found in addons paths"

**Symptôme** :
```
Le module 'base_accounting_kit' n'apparaît pas dans la liste des applications
```

**Causes possibles** :

| Cause | Vérification | Solution |
|-------|-------------|----------|
| Module pas dans `/mnt/extra-addons` | `kubectl exec ... -- ls /mnt/extra-addons` | Répéter l'injection |
| Mauvaises permissions | `ls -la` doit afficher `101 101` | `chown -R 101:101` |
| Pod pas redémarré | Vérifier AGE des pods | `kubectl rollout restart` |
| `__manifest__.py` absent | Vérifier la structure | Réextraire correctement |

**Diagnostic détaillé** :

```bash
# 1. Vérifier la présence
POD_NAME=$(kubectl get pods -n odoo-v19 -l app=odoo -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n odoo-v19 $POD_NAME -- ls -la /mnt/extra-addons/

# 2. Vérifier __manifest__.py
kubectl exec -n odoo-v19 $POD_NAME -- cat /mnt/extra-addons/base_accounting_kit/__manifest__.py

# 3. Vérifier les logs Odoo au démarrage
kubectl logs -n odoo-v19 $POD_NAME | grep -i "addon\|module"

# 4. Forcer le scan des addons
kubectl exec -n odoo-v19 $POD_NAME -- odoo --addons-path=/mnt/extra-addons,/usr/lib/python3/dist-packages/odoo/addons --list-addons
```

### ❌ Problème 2 : "Operation not permitted" lors de l'extraction

**Symptôme** :
```
tar: .: Cannot utime: Operation not permitted
tar: .: Cannot change mode to rwxr-xr-x: Operation not permitted
```

**Cause** :
Tentative de modifier les métadonnées du point de montage Kubernetes.

**Solution** :
Ajouter `--no-overwrite-dir` à la commande tar :

```bash
# ❌ INCORRECT
tar -xzf archive.tar.gz -C /mnt/extra-addons/

# ✅ CORRECT
tar -xzf archive.tar.gz -C /mnt/extra-addons/ --no-overwrite-dir
```

### ❌ Problème 3 : "Permission denied" dans les logs Odoo

**Symptôme** :
```
PermissionError: [Errno 13] Permission denied: '/mnt/extra-addons/base_accounting_kit/__init__.py'
```

**Cause** :
Les fichiers appartiennent à `root` au lieu de `101` (odoo).

**Solution** :

```bash
# Vérifier les propriétaires
kubectl exec -n odoo-v19 $POD_NAME -- ls -la /mnt/extra-addons/

# Si propriétaire = root, corriger :
kubectl exec -n odoo-v19 $POD_NAME -- chown -R 101:101 /mnt/extra-addons/

# Redémarrer les pods
kubectl rollout restart deployment/odoo -n odoo-v19
```

### ❌ Problème 4 : Dépendances manquantes

**Symptôme** :
```
Module 'base_accounting_kit' depends on unmet dependencies: account_invoicing, l10n_generic_coa
```

**Solution** :

```bash
# 1. Vérifier le __manifest__.py
kubectl exec -n odoo-v19 $POD_NAME -- cat /mnt/extra-addons/base_accounting_kit/__manifest__.py | grep depends

# Résultat exemple :
# 'depends': ['account', 'account_invoicing', 'l10n_generic_coa'],

# 2. Installer les dépendances manquantes
# Aller dans l'interface Odoo → Applications
# Rechercher et installer chaque dépendance listée
```

**Dépendances système manquantes** :

Si le module nécessite des bibliothèques Python :

```bash
# Entrer dans le pod
kubectl exec -it -n odoo-v19 $POD_NAME -- bash

# Installer la dépendance
pip3 install nom-du-package

# ⚠️ Cette installation est TEMPORAIRE (perdue au redémarrage)
# Pour une solution permanente, utiliser une image Docker personnalisée
```

### ❌ Problème 5 : Module installé mais non fonctionnel

**Symptôme** :
```
Le module s'installe mais les menus n'apparaissent pas
```

**Causes possibles** :

1. **Cache navigateur** :
   ```bash
   # Vider le cache du navigateur
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (Mac)
   ```

2. **Permissions sur les vues** :
   ```bash
   # Vérifier les groupes d'accès dans Odoo
   Paramètres → Utilisateurs & Entreprises → Groupes
   ```

3. **Erreur Python silencieuse** :
   ```bash
   # Vérifier les logs
   kubectl logs -n odoo-v19 $POD_NAME | grep -i error
   ```

---

## 9. Bonnes pratiques production

### 🔒 1. Gestion des versions

**Stratégie de versioning des addons** :

```bash
# Structure recommandée :
/mnt/extra-addons/
├── base_accounting_kit-1.0.0/     # Version spécifique
├── base_accounting_kit-1.1.0/     # Nouvelle version
└── base_accounting_kit -> base_accounting_kit-1.1.0  # Lien symbolique
```

**Avantages** :
- ✅ Rollback facile (changer le lien symbolique)
- ✅ Tests A/B possibles
- ✅ Historique des versions

**Mise en œuvre** :

```bash
# Déployer une nouvelle version
kubectl exec -n odoo-v19 $POD_NAME -- bash -c "
    cd /mnt/extra-addons && \
    # Extraire la nouvelle version
    tar -xzf base_accounting_kit-1.1.0.tar.gz --no-overwrite-dir && \
    # Supprimer l'ancien lien
    rm base_accounting_kit && \
    # Créer le nouveau lien
    ln -s base_accounting_kit-1.1.0 base_accounting_kit && \
    chown -R 101:101 base_accounting_kit-1.1.0
"

# Redémarrer
kubectl rollout restart deployment/odoo -n odoo-v19
```

**Rollback** :

```bash
# Revenir à la version précédente
kubectl exec -n odoo-v19 $POD_NAME -- bash -c "
    cd /mnt/extra-addons && \
    rm base_accounting_kit && \
    ln -s base_accounting_kit-1.0.0 base_accounting_kit
"

kubectl rollout restart deployment/odoo -n odoo-v19
```

### 📦 2. Sauvegarde des addons

**Script de backup** :

```bash
#!/bin/bash
# backup-odoo-addons.sh

NAMESPACE="odoo-v19"
POD_NAME=$(kubectl get pods -n $NAMESPACE -l app=odoo -o jsonpath='{.items[0].metadata.name}')
BACKUP_DIR="./backups/addons"
DATE=$(date +%Y%m%d-%H%M%S)

# Créer le répertoire de backup
mkdir -p $BACKUP_DIR

# Créer l'archive depuis le pod
kubectl exec -n $NAMESPACE $POD_NAME -- tar -czf /tmp/addons-backup.tar.gz -C /mnt/extra-addons .

# Télécharger l'archive
kubectl cp $NAMESPACE/$POD_NAME:/tmp/addons-backup.tar.gz $BACKUP_DIR/addons-$DATE.tar.gz

# Nettoyer le pod
kubectl exec -n $NAMESPACE $POD_NAME -- rm /tmp/addons-backup.tar.gz

echo "✅ Backup saved: $BACKUP_DIR/addons-$DATE.tar.gz"
```

**Automatisation avec CronJob K8s** :

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: odoo-addons-backup
  namespace: odoo-v19
spec:
  schedule: "0 2 * * *"  # Tous les jours à 2h du matin
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: bitnami/kubectl:latest
            command:
            - /bin/bash
            - -c
            - |
              POD=$(kubectl get pods -n odoo-v19 -l app=odoo -o jsonpath='{.items[0].metadata.name}')
              kubectl exec -n odoo-v19 $POD -- tar -czf /tmp/backup.tar.gz -C /mnt/extra-addons .
              # Copier vers S3, NFS, etc.
          restartPolicy: OnFailure
```

### 🧪 3. Tests avant déploiement

**Environnement de staging** :

```bash
# Créer un namespace de staging
kubectl create namespace odoo-staging

# Déployer Odoo staging (même config que prod)
kubectl apply -f odoo-deployment-staging.yaml -n odoo-staging

# Tester le nouveau module en staging d'abord
# ... installation et tests ...

# Si OK, déployer en prod
```

### 🔐 4. Sécurité des addons

**Scanner les modules téléchargés** :

```bash
# Vérifier qu'il n'y a pas de code malveillant
grep -r "eval\|exec\|__import__" base_accounting_kit/

# Scanner avec Bandit (sécurité Python)
pip3 install bandit
bandit -r base_accounting_kit/
```

**Vérifier la provenance** :
- ✅ Apps Store officiel Odoo (apps.odoo.com)
- ✅ OCA (Odoo Community Association) sur GitHub
- ⚠️ Sources tierces → vérifier le code

---

## 10. Automatisation avec GitOps

### 🔄 Architecture GitOps

```
┌────────────────────────────────────────────────────────────┐
│  Git Repository (Source de vérité)                         │
│  odoo-k8s-config/                                          │
│  ├── addons/                                               │
│  │   ├── base_accounting_kit.tar.gz                        │
│  │   └── account_financial_report.tar.gz                   │
│  └── manifests/                                            │
│      └── odoo-addons-configmap.yaml                        │
└────────────────┬───────────────────────────────────────────┘
                 │
                 │ git push
                 ▼
┌────────────────────────────────────────────────────────────┐
│  ArgoCD / FluxCD                                           │
│  Détecte les changements dans Git                          │
└────────────────┬───────────────────────────────────────────┘
                 │
                 │ kubectl apply
                 ▼
┌────────────────────────────────────────────────────────────┐
│  Cluster Kubernetes                                        │
│  Les addons sont déployés automatiquement                  │
└────────────────────────────────────────────────────────────┘
```

### 📝 ConfigMap pour les addons

```yaml
# odoo-addons-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: odoo-addons-list
  namespace: odoo-v19
data:
  addons.txt: |
    base_accounting_kit==1.1.0
    account_financial_report==2.0.0
    mis_builder==3.1.0
```

### 🚀 InitContainer pour installer les addons

Modifiez le Deployment Odoo :

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: odoo
  namespace: odoo-v19
spec:
  template:
    spec:
      # InitContainer pour télécharger/installer les addons
      initContainers:
      - name: install-addons
        image: alpine:latest
        command:
        - /bin/sh
        - -c
        - |
          apk add --no-cache curl tar
          
          # Lire la liste des addons depuis la ConfigMap
          while IFS='==' read -r addon version; do
            echo "Installing $addon version $version..."
            curl -L -o /tmp/$addon.tar.gz \
              "https://your-registry.com/addons/$addon-$version.tar.gz"
            tar -xzf /tmp/$addon.tar.gz -C /mnt/extra-addons/ --no-overwrite-dir
            rm /tmp/$addon.tar.gz
          done < /config/addons.txt
          
          # Corriger les permissions
          chown -R 101:101 /mnt/extra-addons/
        volumeMounts:
        - name: extra-addons
          mountPath: /mnt/extra-addons
        - name: addons-config
          mountPath: /config
      
      containers:
      - name: odoo
        # ... reste de la config
      
      volumes:
      - name: extra-addons
        persistentVolumeClaim:
          claimName: odoo-addons-pvc
      - name: addons-config
        configMap:
          name: odoo-addons-list
```

**Flux de déploiement** :

1. Développeur pousse un nouveau `.tar.gz` dans Git
2. ArgoCD détecte le changement
3. La ConfigMap est mise à jour
4. Le Deployment est recréé
5. L'initContainer télécharge et installe les addons
6. Odoo démarre avec les nouveaux modules

---

## 📊 Tableau récapitulatif des méthodes

| Critère | ZIP Manuel | Git Clone | Image Docker | GitOps |
|---------|-----------|-----------|--------------|--------|
| **Complexité** | ⭐ Simple | ⭐⭐ Moyenne | ⭐⭐⭐ Avancée | ⭐⭐⭐⭐ Experte |
| **Temps déploiement** | 5-10 min | 5-10 min | 20-30 min | 5 min (après setup) |
| **Mises à jour** | Manuel | `git pull` | Rebuild image | Automatique |
| **Rollback** | Difficile | `git checkout` | Tag image | `git revert` |
| **Production** | ⚠️ Non recommandé | ✅ OK | ✅ Recommandé | ✅ Best practice |
| **Multi-environnements** | ❌ Difficile | ⚠️ Moyen | ✅ Facile | ✅ Très facile |

---

## ✅ Checklist de validation finale

### Avant l'installation

- [ ] Vérifier la compatibilité Odoo 19 (`__manifest__.py`)
- [ ] Vérifier les dépendances du module
- [ ] Lire la documentation du module
- [ ] Tester en environnement de développement d'abord

### Pendant l'installation

- [ ] Archive tar.gz créée correctement
- [ ] Fichiers copiés dans `/mnt/extra-addons`
- [ ] Permissions fixées à `101:101`
- [ ] Pods redémarrés
- [ ] Logs vérifiés (pas d'erreurs)

### Après l'installation

- [ ] Module visible dans la liste des applications
- [ ] Installation réussie
- [ ] Fonctionnalités testées
- [ ] Aucune erreur dans les logs
- [ ] Documentation utilisateur mise à jour

---

## 🎓 Résumé pédagogique

### Ce que vous avez appris

1. **Comprendre l'architecture des addons Odoo** dans Kubernetes
2. **Maîtriser les 3 méthodes de déploiement** (ZIP, Git, Docker)
3. **Résoudre les problèmes de permissions** (`chown 101:101`)
4. **Utiliser `--no-overwrite-dir`** pour éviter les erreurs tar
5. **Automatiser avec GitOps** pour la production

### Commandes essentielles à retenir

```bash
# Récupérer le nom du pod
POD_NAME=$(kubectl get pods -n odoo-v19 -l app=odoo -o jsonpath='{.items[0].metadata.name}')

# Copier un fichier vers le pod
kubectl cp fichier.tar.gz odoo-v19/$POD_NAME:/mnt/extra-addons/

# Extraire CORRECTEMENT (sans erreur)
kubectl exec -n odoo-v19 $POD_NAME -- tar -xzf /path/file.tar.gz -C /destination/ --no-overwrite-dir

# Corriger les permissions
kubectl exec -n odoo-v19 $POD_NAME -- chown -R 101:101 /mnt/extra-addons/

# Redémarrer les pods
kubectl rollout restart deployment/odoo -n odoo-v19

# Suivre les logs
kubectl logs -f -n odoo-v19 deployment/odoo
```

### Points critiques à ne jamais oublier

1. ⚠️ **Toujours** utiliser `--no-overwrite-dir` avec tar dans K8s
2. ⚠️ **Toujours** vérifier les permissions (`101:101`)
3. ⚠️ **Toujours** redémarrer les pods après ajout d'addon
4. ⚠️ **Toujours** tester en staging avant la production
5. ⚠️ **Toujours** sauvegarder avant une modification

---

> **Félicitations ! Vous maîtrisez maintenant le déploiement d'addons Odoo sur Kubernetes ! 🎉**
