---
title: "Guide de Commandes Talos Linux"
description: "Aide-mémoire des commandes talosctl pour la gestion du cluster, des nœuds et de la configuration."
created: "2026-01-31"
# updated: "2026-01-31"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"
# hide_table_of_contents: false
---

# 🛠️ Guide de Commandes Talos Linux

> Talos est un OS immuable et "API-managed". Toute l'interaction se fait via l'outil **`talosctl`**.


## 📥 Installation de l'outil CLI
:::tip
Avant de configurer le cluster, vous devez installer **`talosctl`** sur votre machine d'administration (Vagrant, Laptop, etc.).
:::

```bash
# Téléchargement et installation automatique
sudo curl -sL [https://talos.dev/install](https://talos.dev/install) | sh

# Vérification de l'installation
talosctl version
```
---

## 🚀 Initialisation du Cluster (Bootstrap)
:::tip
Cette procédure permet de générer les configurations et d'initialiser les nœuds Control Plane et Workers.
:::

### 1. Génération des fichiers de configuration
Préparez l'adresse IP de votre futur nœud de contrôle.

```bash
CONTROL_PLANE_IP="192.168.1.160"

# Génération des secrets et des YAML de configuration (Controlplane, Worker, Talosconfig)
talosctl gen config talos-proxmox-cluster https://$CONTROL_PLANE_IP:6443 --output-dir talos
```

### 2. Identification des disques
Avant d'appliquer la config, vérifiez le nom du disque cible (ex: /dev/sda ou /dev/nvme0n1).

```bash
talosctl get disks --insecure --nodes $CONTROL_PLANE_IP

```
### 3. Déploiement du Control Plane
Appliquez la configuration initiale au premier nœud.

```bash
cd talos/
talosctl apply-config --insecure --nodes $CONTROL_PLANE_IP --file controlplane.yaml

```
### 4. Configuration du client local
Une fois le nœud initialisé, configurez votre client pour communiquer avec l'API Talos.

```bash
export TALOSCONFIG="./talosconfig"
talosctl config endpoint $CONTROL_PLANE_IP
talosctl config node $CONTROL_PLANE_IP

```

---
## 🏗️ Ajout des Nœuds Workers
:::tip 
Répétez l'opération pour chaque worker en utilisant le fichier worker.yaml généré précédemment.
:::

```bash
WORKER_IP="192.168.1.115"
WORKER1_IP="192.168.1.119"

# Application de la config worker
talosctl apply-config --insecure --nodes $WORKER_IP --file worker.yaml
talosctl apply-config --insecure --nodes $WORKER1_IP --file worker.yaml
```
## 🚀 Initialiser votre cluster Etcd
:::tip
Une fois le démarrage du Control Plane terminé, procédez à l'amorçage (bootstrap) du cluster etcd en lançant la commande suivante :
:::
```bash

talosctl bootstrap --nodes $CONTROL_PLANE_IP --talosconfig=./talosconfig

```
:::note

**Important :** 
Cette commande doit être exécutée une seule fois sur l'un des nœuds du Control Plane. Si votre cluster en comporte plusieurs, choisissez-en un arbitrairement.

:::
## 🔧 Configuration de base (Context & Kubeconfig)


Avant toute opération, assurez-vous que votre environnement pointe vers les bons nœuds.

```bash
# Définir les nœuds cibles (IPs)
talosctl config endpoint $CONTROL_PLANE_IP
talosctl config node $CONTROL_PLANE_IP

# Récupérer le kubeconfig pour kubectl
talosctl kubeconfig .

# Informer kubectl d'utiliser ce fichier
export KUBECONFIG=$(pwd)/kubeconfig

# Tester à nouveau
kubectl get nodes
```

---

## 🛰️ État du Cluster et des Nœuds
### Informations générales

```bash
# Vérifier la version de Talos (Client et Serveur)
talosctl version

# Voir l'état de santé général du cluster
talosctl health

# Lister les conteneurs système tournant sur le nœud (Talos runtime)
talosctl containers -k

```
### Dashboard temps réel

```bash

# Lancer le dashboard interactif (similaire à 'top' pour Talos)
talosctl dashboard

```
---

## ⚙️ Gestion de la Configuration
:::note
Talos utilise des fichiers YAML pour définir l'état de la machine.
:::

```bash

# Récupérer la configuration actuelle d'un nœud
talosctl get machineconfig

# Appliquer une nouvelle configuration
talosctl apply-config --file new-config.yaml

# Appliquer avec un redémarrage immédiat
talosctl apply-config --file config.yaml --mode reboot

```

---
## ⚡ Application directe : talosctl patch
:::note 
La commande patch modifie la configuration active d'un nœud en temps réel. Elle est idéale pour des changements rapides comme l'ajout d'un label, la modification d'un disque d'installation ou l'ajustement des paramètres réseau.
:::

### 1. Syntaxe de base
Vous devez cibler un nœud **(`-n`)** et fournir le patch soit via un fichier, soit directement en JSON/YAML.

```bash

# Via un fichier local
talosctl patch machineconfig -n $NODE_IP --patch @mon-patch.yaml

# Via une chaîne de caractères (JSON inline)
talosctl patch machineconfig -n $NODE_IP --patch '{"machine":{"install":{"disk":"/dev/sda"}}}'

```

### 2. Exemples concrets d'application directe
:::tip  
Modification à chaud avec talosctl patch
:::

#### A. Activer le QEMU Guest Agent (Spécifique Proxmox)
Si vous avez oublié de l'activer lors du bootstrap, vous pouvez le patcher directement :

```bash

talosctl patch machineconfig -n $WORKER_IP --patch '{"machine":{"network":{"nameservers":["1.1.1.1","8.8.8.8"]}}}'

```

#### B. Modifier les serveurs DNS d'un nœud
```bash

talosctl patch machineconfig -n $WORKER_IP --patch '{"machine":{"network":{"nameservers":["1.1.1.1","8.8.8.8"]}}}'

```

#### C. Ajouter des "Extra Mounts" pour le stockage
```bash

talosctl patch machineconfig -n $WORKER_IP --patch '{"machine":{"kubelet":{"extraMounts":[{"hostPath":"/var/lib/longhorn","mountPath":"/var/lib/longhorn","readonly":false}]}}}'

```

---
### 3. Les modes d'application (`--mode`)
Par défaut, Talos essaie d'appliquer le patch sans redémarrer. Cependant, certains changements (comme les arguments noyau) nécessitent un reboot.

- **`--mode no-reboot` (défaut) :** Applique ce qui est possible immédiatement.

- **`--mode reboot` :** Applique la config et redémarre le nœud proprement.

- **`--mode staged` :** La config est enregistrée mais ne sera appliquée qu'au prochain redémarrage manuel.

```bash

# Exemple avec reboot forcé pour prise en compte immédiate
talosctl patch machineconfig -n $NODE_IP --patch @config.yaml --mode reboot

```
---
### 4. Vérifier le résultat du Patch
Pour confirmer que votre modification a été fusionnée correctement dans la configuration **"running"** :

```bash

# Exemple avec reboot forcé pour prise en compte immédiate
talosctl patch machineconfig -n $NODE_IP --patch @config.yaml --mode reboot

```
---
## 💡 Différence importante : patch vs apply-config


| Caractéristique |  Talosctl Patch  | Talosctl Apply config  |
| :---:           | :---            | :---                   |
| **Usage** | Modifications ciblées et rapides (ex: changer un DNS). | Remplacement complet ou initialisation du nœud. |
| **Fichier source** | Petit fragment YAML ou JSON (quelques lignes). | Fichier `controlplane.yaml` ou `worker.yaml` complet. |
| **Précision** | Ne modifie que les champs spécifiés (fusion). | Écrase la configuration actuelle par le nouveau fichier. |
| **Risque** | Faible : ne touche pas au reste de la config. | Élevé : peut effacer des réglages non présents dans le fichier. |
| **Rapidité** | Très rapide pour les ajustements "à la volée". | Idéal pour le déploiement initial (Bootstrap). |

## 📂 Gestion du Système et Maintenance
### Logs et Debugging

```bash
# Voir les logs d'un service spécifique (ex: kubelet)
talosctl logs kubelet

# Voir les logs du kernel (dmesg)
talosctl dmesg

# Vérifier l'état des services internes
talosctl services
```

### Opérations sur les Nœuds
```bash
# Redémarrer un nœud
talosctl reboot

# Éteindre un nœud
talosctl shutdown

# Réinitialiser un nœud (Wipe total des données)
# Attention : Cette commande est irréversible
talosctl reset
```

## 💾 Gestion du Stockage et Disques
```bash
# Lister les disques disponibles sur le nœud
talosctl disks

# Voir l'utilisation des disques et partitions
talosctl list mounts
```

## 🛡️ Mise à jour (Upgrade)
:::tip
Talos permet de mettre à jour l'OS sans SSH, via l'API.
:::

```bash
# Mettre à jour l'image de l'OS
# Exemple : talosctl upgrade --image ghcr.io/siderolabs/talos:v1.5.0
talosctl upgrade --image <URL_IMAGE>
```

## 🧠 Astuces et Troubleshooting
:::note 
Mode Maintenance Si un nœud ne rejoint pas le cluster, vérifiez les services bloqués : talosctl services Si etcd est en erreur sur un control-plane, le cluster ne sera pas "Ready". 
:::

### Vérifier les ressources Kubernetes via Talos
Même sans `kubectl`, Talos peut lister certaines ressources K8s via son API :

```bash
talosctl get pods
talosctl get nodes
```