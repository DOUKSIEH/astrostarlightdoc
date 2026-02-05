---
title: "Guide de Commandes Talos Linux"
description: "Aide-mémoire des commandes talosctl pour la gestion du cluster, des nœuds et de la configuration."
created: "2026-01-31"
updated: "2026-02-05"
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
sudo curl -sL https://talos.dev/install | sh

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

Avant d'appliquer la config, vérifiez le nom du disque cible (ex: `/dev/sda` ou `/dev/nvme0n1`).

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
Répétez l'opération pour chaque worker en utilisant le fichier `worker.yaml` généré précédemment.
:::

```bash
WORKER_IP="192.168.1.115"
WORKER1_IP="192.168.1.119"

# Application de la config worker
talosctl apply-config --insecure --nodes $WORKER_IP --file worker.yaml
talosctl apply-config --insecure --nodes $WORKER1_IP --file worker.yaml
```

---

## 🚀 Initialiser votre cluster Etcd

:::tip
Une fois le démarrage du Control Plane terminé, procédez à l'amorçage (bootstrap) du cluster etcd en lançant la commande suivante :
:::

```bash
talosctl bootstrap --nodes $CONTROL_PLANE_IP --talosconfig=./talosconfig
```

:::note
**Important :** Cette commande doit être exécutée une seule fois sur l'un des nœuds du Control Plane. Si votre cluster en comporte plusieurs, choisissez-en un arbitrairement.
:::

---

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

# Tester la connexion
kubectl get nodes
```

---

## 🌐 Accès au Cluster à distance (Tunneling)

:::tip[Pédagogie]
Comme Talos n'a pas de SSH, si votre cluster est hébergé sur un réseau privé (ex: Proxmox à la maison ou Cloud), vous devez créer un tunnel sécurisé pour que vos outils locaux (`talosctl` et `kubectl`) puissent joindre les APIs.
:::

### 1. Création du tunnel SSH

Exécutez cette commande depuis votre machine locale pour rediriger les ports nécessaires :

```bash
# Tunnel pour l'API Talos (50000) et l'API Kubernetes (6443)
ssh -L 50000:$CONTROL_PLANE_IP:50000 -L 6443:$CONTROL_PLANE_IP:6443 user@votre-serveur-rebond
```

### 2. Configuration pour Talosctl

Une fois le tunnel ouvert, vous devez dire à `talosctl` de passer par votre propre machine (127.0.0.1) pour atteindre le nœud :

```bash
# On définit l'endpoint sur localhost (entrée du tunnel)
talosctl config endpoint 127.0.0.1

# On définit le node sur l'IP réelle du nœud cible
talosctl config node $CONTROL_PLANE_IP
```

### 3. Configuration pour Kubectl

Avant de modifier l'adresse, vérifiez le nom exact de votre cluster enregistré dans votre configuration locale :

```bash
# Lister les clusters connus par votre kubectl
kubectl config get-clusters
```

Une fois le nom identifié (ex: `talos-proxmox-cluster`), modifiez l'adresse du serveur pour qu'elle pointe vers l'entrée de votre tunnel local :

```bash
# Modifier l'adresse du serveur vers localhost
kubectl config set-cluster talos-proxmox-cluster --server=https://127.0.0.1:6443
```

:::note[Pourquoi localhost ?] 
En réglant le serveur sur 127.0.0.1, vous forcez `kubectl` à envoyer les requêtes dans votre tunnel SSH ouvert précédemment. Votre ordinateur local sert alors de relais vers l'API Kubernetes distante. 
:::

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
La commande `patch` modifie la configuration active d'un nœud en temps réel. Elle est idéale pour des changements rapides comme l'ajout d'un label, la modification d'un disque d'installation ou l'ajustement des paramètres réseau.
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
talosctl patch machineconfig -n $WORKER_IP --patch '{"machine":{"install":{"extensions":[{"image":"ghcr.io/siderolabs/qemu-guest-agent:latest"}]}}}'
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
# Afficher la configuration active
talosctl get machineconfig -o yaml

# Vérifier un paramètre spécifique
talosctl get machineconfig -o jsonpath='{.spec.machine.network.nameservers}'
```

---

## 💡 Différence importante : patch vs apply-config

| Caractéristique | talosctl patch | talosctl apply-config |
|:---:|:---|:---|
| **Usage** | Modifications ciblées et rapides (ex: changer un DNS). | Remplacement complet ou initialisation du nœud. |
| **Fichier source** | Petit fragment YAML ou JSON (quelques lignes). | Fichier `controlplane.yaml` ou `worker.yaml` complet. |
| **Précision** | Ne modifie que les champs spécifiés (fusion). | Écrase la configuration actuelle par le nouveau fichier. |
| **Risque** | Faible : ne touche pas au reste de la config. | Élevé : peut effacer des réglages non présents dans le fichier. |
| **Rapidité** | Très rapide pour les ajustements "à la volée". | Idéal pour le déploiement initial (Bootstrap). |

---

## 📂 Gestion du Système et Maintenance

### Logs et Debugging

```bash
# Voir les logs d'un service spécifique (ex: kubelet)
talosctl logs kubelet

# Voir les logs du kernel (dmesg)
talosctl dmesg

# Vérifier l'état des services internes
talosctl service

# Logs en temps réel (follow)
talosctl logs kubelet -f

# Logs avec filtre par gravité
talosctl logs kubelet --tail 100
```

### Opérations sur les Nœuds

```bash
# Redémarrer un nœud
talosctl reboot

# Redémarrer avec délai
talosctl reboot --timeout 5m

# Éteindre un nœud
talosctl shutdown

# Éteindre avec force
talosctl shutdown --force

# Réinitialiser un nœud (Wipe total des données)
# ⚠️ Attention : Cette commande est irréversible
talosctl reset

# Reset gracieux (garde certaines configs réseau)
talosctl reset --graceful --reboot
```

---

## 💾 Gestion du Stockage et Disques

```bash
# Lister les disques disponibles sur le nœud
talosctl get disks

# Voir les détails d'un disque spécifique
talosctl get disks sda -o yaml

# Voir l'utilisation des disques et partitions
talosctl list /system

# Vérifier les montages actifs
talosctl get mounts
```

---

## 🛡️ Mise à jour (Upgrade)

:::tip
Talos permet de mettre à jour l'OS sans SSH, via l'API.
:::

### Upgrade standard

```bash
# Mettre à jour vers une version spécifique
talosctl upgrade --image ghcr.io/siderolabs/talos:v1.8.0

# Upgrade avec préservation des données
talosctl upgrade --image ghcr.io/siderolabs/talos:v1.8.0 --preserve

# Vérifier la version après upgrade
talosctl version
```

### Upgrade avec stratégie

```bash
# Upgrade d'un control plane (un par un)
talosctl upgrade --nodes $CONTROL_PLANE_IP --image ghcr.io/siderolabs/talos:v1.8.0 --wait

# Upgrade de tous les workers
talosctl upgrade --nodes $WORKER_IP,$WORKER1_IP --image ghcr.io/siderolabs/talos:v1.8.0
```

:::warning
Lors de l'upgrade d'un cluster multi-nœuds, mettez à jour les control planes un par un, puis les workers. Ne jamais upgrader tous les control planes simultanément.
:::

---

## 🔍 Vérification des Ressources Kubernetes

:::note
**Important :** `talosctl` gère l'infrastructure Talos OS, pas directement les ressources Kubernetes. Pour interroger Kubernetes, vous devez utiliser `kubectl`.
:::

### Récupérer le kubeconfig

```bash
# Depuis le nœud control plane
talosctl kubeconfig --nodes $CONTROL_PLANE_IP --force

# Ou vers un fichier spécifique
talosctl kubeconfig ./kubeconfig
export KUBECONFIG=$(pwd)/kubeconfig

# Fusionner avec votre kubeconfig existant
talosctl kubeconfig --merge
```

### Vérifier les ressources Kubernetes avec kubectl

```bash
# Vérifier les nœuds du cluster
kubectl get nodes

# Vérifier avec détails étendus
kubectl get nodes -o wide

# Vérifier tous les pods
kubectl get pods -A

# Vérifier les pods système
kubectl get pods -n kube-system

# État détaillé d'un nœud
kubectl describe node <node-name>

# Vérifier les services
kubectl get services -A

# Vérifier les déploiements
kubectl get deployments -A

# Vérifier les namespaces
kubectl get namespaces
```

### Ressources Talos disponibles avec talosctl

Pour vérifier l'état de votre infrastructure Talos :

```bash
# Membres du cluster Talos
talosctl get members

# Services système Talos
talosctl get services

# Santé du cluster
talosctl health

# Santé avec détails
talosctl health --verbose

# Dashboard interactif
talosctl dashboard

# Lister toutes les ressources Talos disponibles
talosctl get

# Ressources réseau
talosctl get addresses
talosctl get routes
talosctl get links

# Ressources système
talosctl get nodename
talosctl get time
```

:::tip[Astuce]
Utilisez `talosctl get` sans arguments pour voir la liste complète des types de ressources Talos disponibles.
:::

---

## 🔐 Gestion des Secrets et Certificats

```bash
# Générer de nouveaux secrets
talosctl gen secrets

# Générer un nouveau talosconfig
talosctl gen config --with-secrets secrets.yaml my-cluster https://$CONTROL_PLANE_IP:6443

# Voir les certificats du cluster
talosctl get certificatestatuses

# Rotation des certificats Kubernetes
talosctl rotate-ca --nodes $CONTROL_PLANE_IP
```

---

## 🌐 Gestion du Réseau

```bash
# Voir les interfaces réseau
talosctl get addresses

# Voir les routes
talosctl get routes

# Vérifier la résolution DNS
talosctl get resolvers

# Tester la connectivité réseau
talosctl read /proc/net/route

# Voir les tables ARP
talosctl get arpentries
```

---

## 🧪 Commandes de Diagnostic Avancées

```bash
# Exécuter une commande shell (mode maintenance)
talosctl read /proc/cpuinfo
talosctl read /proc/meminfo

# Vérifier les processus en cours
talosctl processes

# Monitorer les ressources système
talosctl stats

# Logs kubelet (dernières 5 lignes)
talosctl logs kubelet --tail 5

# Logs etcd (dernières 5 lignes)
talosctl logs etcd --tail 5

# Logs containerd (dernières 5 lignes)
talosctl logs containerd --tail 5

# Logs apid (API Talos)
talosctl logs apid --tail 5

# Logs trustd (gestion des certificats)
talosctl logs trustd --tail 5

# Capturer les événements du kernel
talosctl events

# Vérifier la configuration réseau détaillée
talosctl netstat

# Générer un support bundle (debugging)
talosctl support
```

---

## 🔄 Gestion d'Etcd (Control Plane uniquement)

```bash
# Vérifier l'état d'etcd
talosctl etcd status

# Voir les membres d'etcd
talosctl etcd members

# Supprimer un membre défectueux
talosctl etcd remove-member <member-id>

# Promouvoir un learner en membre votant
talosctl etcd promote-member <member-id>

# Défragmenter etcd
talosctl etcd defrag

# Snapshot d'etcd
talosctl etcd snapshot /var/lib/etcd.backup
```

---

## 🧰 Manipulation de Fichiers

```bash
# Lire un fichier
talosctl read /etc/os-release

# Lister un répertoire
talosctl list /var/log

# Copier un fichier depuis le nœud
talosctl copy /var/log/kern.log ./kern.log

# Copier un fichier vers le nœud (limité, via patchs généralement)
# Utiliser plutôt les ConfigMaps ou les patchs de configuration
```

---

## 🧠 Astuces et Troubleshooting

### Mode Maintenance

Si un nœud ne rejoint pas le cluster, vérifiez les services bloqués :

```bash
# Vérifier l'état des services
talosctl service

# Redémarrer un service spécifique
talosctl service kubelet restart

# Vérifier les logs kubelet
talosctl logs kubelet --tail 50

# Vérifier les logs etcd (sur control-plane)
talosctl logs etcd --tail 100

# Vérifier les logs containerd
talosctl logs containerd -f
```

:::warning
Si `etcd` est en erreur sur un control-plane, le cluster ne sera pas "Ready". Vérifiez les logs pour identifier la cause.
:::

### Vérification de la connectivité réseau

```bash
# Vérifier les interfaces réseau
talosctl get addresses

# Vérifier les routes
talosctl get routes

# Tester la résolution DNS
talosctl get resolvers

# Ping depuis le nœud Talos
talosctl read /proc/sys/net/ipv4/ip_forward

# Vérifier la connectivité vers l'API Kubernetes
talosctl read /proc/net/tcp
```

### Problèmes courants et solutions

#### 1. Nœud bloqué en "NotReady"

```bash
# Vérifier le statut kubelet
talosctl service kubelet status

# Redémarrer kubelet
talosctl service kubelet restart

# Vérifier les logs
talosctl logs kubelet --tail 100
```

#### 2. Etcd ne démarre pas

```bash
# Vérifier les membres etcd
talosctl etcd members

# Vérifier les logs etcd
talosctl logs etcd

# Si un membre est défectueux, le supprimer
talosctl etcd remove-member <member-id>
```

#### 3. Configuration réseau incorrecte

```bash
# Patcher la configuration DNS
talosctl patch machineconfig -n $NODE_IP --patch '{"machine":{"network":{"nameservers":["8.8.8.8","1.1.1.1"]}}}'

# Redémarrer le nœud pour appliquer
talosctl reboot -n $NODE_IP
```

#### 4. Disque plein

```bash
# Vérifier l'utilisation des disques
talosctl list /var

# Nettoyer les images containerd inutilisées
talosctl service containerd restart
```

### Réinitialisation partielle

Si vous devez réinitialiser uniquement les données Kubernetes sans toucher à Talos :

```bash
# Reset gracieux en gardant les configurations réseau
talosctl reset --graceful --reboot

# Reset complet (wipe total)
talosctl reset --reboot --system-labels-to-wipe STATE --system-labels-to-wipe EPHEMERAL
```

---

## 📊 Monitoring et Métriques

```bash
# Dashboard en temps réel
talosctl dashboard

# Statistiques système
talosctl stats

# Utilisation CPU/Mémoire
talosctl read /proc/stat
talosctl read /proc/meminfo

# Événements système
talosctl events

# Logs de tous les services
talosctl logs
```

---

## 🔧 Variables d'Environnement Utiles

```bash
# Configuration permanente du contexte Talos
export TALOSCONFIG="$HOME/.talos/config"

# Configuration permanente de kubectl
export KUBECONFIG="$HOME/.kube/config"

# Définir un nœud par défaut
export TALOS_NODE="192.168.1.160"

# Utiliser ces variables
talosctl version
kubectl get nodes
```

### Ajouter au profil shell

```bash
# Ajouter au ~/.bashrc ou ~/.zshrc
echo 'export TALOSCONFIG="$HOME/.talos/config"' >> ~/.bashrc
echo 'export KUBECONFIG="$HOME/.kube/config"' >> ~/.bashrc
source ~/.bashrc
```

---

## 🚀 Automatisation avec Scripts

### Script de vérification de santé

```bash
#!/bin/bash
# health-check.sh

NODES=("192.168.1.160" "192.168.1.115" "192.168.1.119")

for node in "${NODES[@]}"; do
    echo "=== Checking node: $node ==="
    talosctl health --nodes $node
    echo ""
done

kubectl get nodes
kubectl get pods -A | grep -v Running
```

### Script de sauvegarde etcd

```bash
#!/bin/bash
# backup-etcd.sh

BACKUP_DIR="/backup/etcd"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
CONTROL_PLANE="192.168.1.160"

mkdir -p $BACKUP_DIR
talosctl -n $CONTROL_PLANE etcd snapshot $BACKUP_DIR/etcd-snapshot-$TIMESTAMP.db

echo "Backup saved to: $BACKUP_DIR/etcd-snapshot-$TIMESTAMP.db"
```

---

## 📚 Ressources utiles

- **Documentation officielle :** [https://www.talos.dev](https://www.talos.dev)
- **Référence API :** [https://www.talos.dev/latest/reference/api/](https://www.talos.dev/latest/reference/api/)
- **Configuration de référence :** [https://www.talos.dev/latest/reference/configuration/](https://www.talos.dev/latest/reference/configuration/)
- **GitHub :** [https://github.com/siderolabs/talos](https://github.com/siderolabs/talos)
- **Community Slack :** [Kubernetes Slack #talos](https://kubernetes.slack.com)
- **Forum de discussion :** [https://github.com/siderolabs/talos/discussions](https://github.com/siderolabs/talos/discussions)

---

## 🎓 Bonnes Pratiques

### 1. Gestion des configurations

- Toujours versionner vos fichiers de configuration (Git)
- Utiliser `talosctl patch` pour les petits changements
- Utiliser `talosctl apply-config` pour les reconfigurations complètes
- Tester les changements sur un nœud worker avant les control planes

### 2. Sécurité

- Protéger le fichier `talosconfig` (contient les clés d'accès)
- Restreindre l'accès à l'API Talos (port 50000)
- Utiliser des certificats distincts par environnement (dev/prod)
- Rotation régulière des certificats

### 3. Maintenance

- Faire des snapshots etcd réguliers
- Monitorer l'espace disque des nœuds
- Upgrade progressif (un control plane à la fois)
- Tester les upgrades en environnement de staging d'abord

### 4. Haute disponibilité

- Minimum 3 control planes pour la production
- Distribuer les nœuds sur différentes zones de disponibilité
- Utiliser un load balancer pour l'API Kubernetes
- Sauvegardes automatiques d'etcd

---

## 🎯 Checklist de Déploiement

### Phase 1 : Préparation
- [ ] Installer `talosctl` sur la machine d'administration
- [ ] Préparer les IPs des nœuds (control plane + workers)
- [ ] Vérifier la connectivité réseau
- [ ] Identifier les disques cibles sur chaque nœud

### Phase 2 : Bootstrap Control Plane
- [ ] Générer les configurations (`talosctl gen config`)
- [ ] Appliquer la config au premier control plane
- [ ] Configurer le client local (`talosctl config`)
- [ ] Bootstrap etcd (`talosctl bootstrap`)
- [ ] Vérifier la santé (`talosctl health`)

### Phase 3 : Ajout des Workers
- [ ] Appliquer la config worker sur chaque nœud
- [ ] Vérifier que les workers rejoignent le cluster
- [ ] Récupérer le kubeconfig (`talosctl kubeconfig`)
- [ ] Vérifier avec kubectl (`kubectl get nodes`)

### Phase 4 : Configuration Post-Déploiement
- [ ] Installer un CNI (Cilium, Calico, etc.)
- [ ] Installer un CSI pour le stockage
- [ ] Configurer les DNS
- [ ] Mettre en place le monitoring
- [ ] Configurer les backups etcd

### Phase 5 : Validation
- [ ] Tous les nœuds sont "Ready"
- [ ] Tous les pods système sont "Running"
- [ ] Les services réseau fonctionnent
- [ ] Le stockage est opérationnel
- [ ] Les métriques sont collectées

---

## ⚠️ Commandes Dangereuses (À utiliser avec précaution)

```bash
# ❌ DANGER : Reset complet d'un nœud (perte de toutes les données)
talosctl reset --reboot

# ❌ DANGER : Suppression forcée d'un membre etcd
talosctl etcd remove-member <member-id>

# ❌ DANGER : Upgrade sans vérification
talosctl upgrade --image <image> --force

# ⚠️ ATTENTION : Rotation des certificats CA (impact sur tout le cluster)
talosctl rotate-ca
```

:::danger
Ces commandes peuvent causer des interruptions de service ou des pertes de données. Utilisez-les uniquement si vous comprenez parfaitement leurs implications.
:::

---

## 🎪 Commandes Avancées pour Experts

### Manipulation du système de fichiers

```bash
# Monter un volume en lecture seule
talosctl list /dev

# Inspecter les partitions
talosctl read /proc/partitions

# Vérifier les montages actifs
talosctl read /proc/mounts
```

### Debugging réseau avancé

```bash
# Capturer le trafic réseau (tcpdump-like)
talosctl pcap

# Vérifier les connexions actives
talosctl read /proc/net/tcp

# Analyser les tables iptables
talosctl read /proc/net/ip_tables_names
```

### Interaction avec containerd

```bash
# Lister les containers actifs
talosctl containers

# Lister les images
talosctl images

# Nettoyer les images non utilisées
talosctl service containerd restart
```

---

## 📖 Glossaire

| Terme | Définition |
|:------|:-----------|
| **Talos** | Système d'exploitation Linux immuable conçu pour Kubernetes |
| **talosctl** | Outil CLI pour gérer les nœuds Talos |
| **kubectl** | Outil CLI pour gérer les ressources Kubernetes |
| **Control Plane** | Nœud qui héberge les composants de contrôle Kubernetes (API server, scheduler, controller-manager) |
| **Worker** | Nœud qui exécute les charges de travail (pods) |
| **etcd** | Base de données distribuée utilisée par Kubernetes pour stocker l'état du cluster |
| **Bootstrap** | Processus d'initialisation du premier nœud control plane |
| **machineconfig** | Configuration complète d'un nœud Talos au format YAML |
| **Patch** | Modification partielle d'une configuration |
| **Kubeconfig** | Fichier de configuration pour kubectl contenant les credentials d'accès au cluster |

---

:::tip[Rappel important]
**Talos = Infrastructure OS** → Utilisez `talosctl`  
**Kubernetes = Applications/Workloads** → Utilisez `kubectl`

Les deux outils sont complémentaires et nécessaires pour gérer un cluster Talos/Kubernetes complet.
:::

---

## 📝 Notes de Version

### v2.0 (2026-02-05)
- ✅ Correction de la section "Vérification des ressources Kubernetes"
- ✅ Ajout de sections avancées (Etcd, Certificats, Réseau)
- ✅ Amélioration du troubleshooting
- ✅ Ajout de scripts d'automatisation
- ✅ Checklist de déploiement complète
- ✅ Glossaire et bonnes pratiques

### v1.0 (2026-01-31)
- 🎉 Version initiale du guide

---

**Auteur :** Douksieh IH - DevOps Engineer  
**Dernière mise à jour :** 05 février 2026  
**License :** CC BY-SA 4.0
