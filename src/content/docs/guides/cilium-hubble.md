---
title: "Guide de Commandes Talos Linux"
description: "Aide-mémoire des commandes talosctl pour la gestion du cluster, des nœuds et de la configuration."
created: "2026-02-01"
updated: "2026-02-02"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"
# hide_table_of_contents: false
---

# 📘 Guide Complet : Observabilité et Sécurité Réseau avec Cilium & Hubble
:::tip
Ce document explique les concepts fondamentaux de Cilium et Hubble, détaille leur installation et fournit les procédures de configuration pour une intégration complète avec Prometheus.
:::

## 🧠  Comprendre Cilium et Hubble (Pédagogie)

### 1.Pourquoi Cilium ?

Dans un cluster Kubernetes classique, le réseau est géré par kube-proxy via des règles iptables. Cependant, avec des centaines de services, ces règles deviennent massives, lentes et difficiles à maintenir.

Cilium révolutionne cela en utilisant **eBPF (Extended Berkeley Packet Filter)**, une technologie du noyau Linux qui permet d'insérer des programmes de filtrage directement dans le chemin réseau du noyau.

- **Performance :** Traitement des paquets ultra-rapide sans passer par les lourdes tables iptables.

- **Identité :** Cilium ne raisonne pas par adresses IP (qui changent tout le temps), mais par identités de sécurité basées sur les labels des Pods.

- **Sécurité L7 :** Contrairement aux pare-feu classiques, Cilium peut filtrer le trafic au niveau applicatif (ex: autoriser un `GET` mais bloquer un `DELETE` en HTTP).

### 2. 🔭 Le rôle de Hubble

Si Cilium est le "moteur" (le plan de données), Hubble est le "tableau de bord". Hubble utilise les données collectées par Cilium pour offrir :

- **Visibilité en temps réel :** Voir qui parle à qui instantanément.

- **Métriques de performance :** Temps de réponse (latence) des requêtes, taux d'erreur HTTP, etc.

- **Cartographie réseau :** Génération automatique d'une carte des flux entre vos microservices.

### 3. 🤝 Le duo Cilium & Envoy (Le Muscle et le Cerveau)

Bien que Cilium soit ultra-rapide grâce à eBPF, il a parfois besoin d'un "expert linguistique" pour comprendre les protocoles complexes. C'est là qu'intervient Envoy Proxy.

- **Cilium (eBPF) :**  C'est le douanier au niveau de la route. Il vérifie très vite les plaques d'immatriculation (IP/Ports).

- **Envoy :**  C'est l'inspecteur au guichet. Il ouvre les paquets pour lire le contenu (HTTP, gRPC, Kafka).


Pourquoi est-ce important ? C'est grâce à l'intégration d'Envoy que Cilium peut :

- **Sécuriser au niveau L7 :** Autoriser un `GET` mais bloquer un `POST`.

- **Enrichir Hubble :** Afficher les codes d'erreurs HTTP (404, 500) et les temps de réponse précis des APIs.

- **Réduire la complexité :** Cilium gère Envoy de manière transparente, souvent sans avoir besoin d'installer des "sidecars" lourds dans chaque Pod.

---

## ⚙️ Installation de la Stack
### 1. Installation du CLI Cilium
Avant de lancer l'installation Helm, tu dois installer l'outil de ligne de commande cilium sur ta machine de gestion.

```bash
# 1. Définir la version souhaitée
CILIUM_CLI_VERSION=$(curl -s https://raw.githubusercontent.com/cilium/cilium-cli/main/stable.txt)
CLI_ARCH=amd64
if [ "$(uname -m)" = "aarch64" ]; then CLI_ARCH=arm64; fi

# 2. Télécharger et extraire le binaire
curl -L --fail --remote-name-all https://github.com/cilium/cilium-cli/releases/download/${CILIUM_CLI_VERSION}/cilium-linux-${CLI_ARCH}.tar.gz{,.sha256sum}
sha256sum --check cilium-linux-${CLI_ARCH}.tar.gz.sha256sum
sudo tar xzvfC cilium-linux-${CLI_ARCH}.tar.gz /usr/local/bin
rm cilium-linux-${CLI_ARCH}.tar.gz{,.sha256sum}

# 3. Vérification 
cilium version
cilium status  # À utiliser pour contrôler un cluster déjà déployé
cilium status --wait  # Attend que tous les composants Cilium soient opérationnels (Idéal pour l'automatisation (CI/CD))

```
:::tip 
Pourquoi ce binaire est indispensable ? Même si tu installes Cilium via Helm, ce binaire te permet de lancer la commande magique : `cilium status --wait` Elle vérifie que tout le réseau du cluster est prêt, que les certificats sont valides et que les agents communiquent bien entre eux. 
:::
```

### 2. Cilium & Hubble
L'installation via Helm active l'exposition des métriques et le moteur de visualisation Hubble.

```bash
helm upgrade --install cilium cilium/cilium \
  --namespace kube-system \
  --version 1.16.5 \
  --set prometheus.enabled=true \
  --set operator.prometheus.enabled=true \
  --set hubble.enabled=true \
  --set hubble.metrics.enabled="{dns,drop,tcp,flow,port-distribution,icmp,http}" \
  --set hubble.relay.enabled=true \
  --set hubble.ui.enabled=true

```
:::note
Explication :

- `prometheus.enabled=true` : Demande aux agents Cilium d'ouvrir un port pour que Prometheus puisse lire leurs statistiques internes.

- `hubble.enabled=true` : Active la fonction d'observabilité.

- `hubble.metrics.enabled` : Liste les capteurs que Hubble doit activer (ex: surveiller les erreurs DNS, les paquets jetés/drop, etc.).

- `hubble.relay.enabled` : Installe le "serveur central" qui récolte les données de tous les nœuds pour les centraliser.

- `hubble.ui.enabled` : Installe l'interface graphique pour voir les flux réseau.
:::

### 2. Installation de la Stack Prometheus 🔥

```bash
helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false \
  --set prometheus.prometheusSpec.podMonitorSelectorNilUsesHelmValues=false

```
:::note
Cette commande installe le "cerveau" du monitoring. Elle déploie l'Operator Prometheus, qui surveille le cluster à la recherche de cibles à analyser. Sans lui, nous devrions configurer manuellement chaque adresse IP à surveiller.

Pourquoi  ? 

- `--set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false`
- `--set prometheus.prometheusSpec.podMonitorSelectorNilUsesHelmValues=false` 

**🎯 Ces deux paramètres disent à Prometheus:**

Découvre et scrape TOUS les ServiceMonitors et PodMonitors dans le cluster, pas seulement ceux installés par ce chart Helm.

:::

**Par exemple :** 


**Vous dites à Prometheus :**

✅ **"Découvre et scrape TOUS les ServiceMonitors et PodMonitors, peu importe qui les a créés"**

Cela permet à Prometheus de collecter :
- ✅ Métriques Cilium
- ✅ Métriques de vos applications custom
- ✅ Métriques de n'importe quel système que vous ajouterez plus tard


**🔍 Démonstration visuelle**

**Avec `serviceMonitorSelectorNilUsesHelmValues=true` (défaut)** 
```bash
┌──────────────────────────────────────┐
│  Prometheus                          │
│                                      │
│  Scrape uniquement :                 │
│  ✅ kube-state-metrics              │
│  ✅ node-exporter                   │
│  ✅ prometheus-operator             │
│                                      │
│  Ignore :                            │
│  ❌ Cilium ServiceMonitor           │
│  ❌ Vos ServiceMonitors custom      │
└──────────────────────────────────────┘
```

**Avec `serviceMonitorSelectorNilUsesHelmValues=false`**
```bash
┌──────────────────────────────────────┐
│  Prometheus                          │
│                                      │
│  Scrape TOUT :                       │
│  ✅ kube-state-metrics              │
│  ✅ node-exporter                   │
│  ✅ prometheus-operator             │
│  ✅ Cilium ServiceMonitor           │
│  ✅ Tous vos ServiceMonitors        │
│  ✅ Future services avec métriques  │
└──────────────────────────────────────┘
```

---

## 📊 Configuration du Scraping (Metrics)

### 1. Création du Service Headless (`hubble-metrics-svc.yaml`)

```yaml

apiVersion: v1
kind: Service
metadata:
  name: hubble-metrics
  namespace: kube-system
  labels:
    k8s-app: hubble
spec:
  type: ClusterIP
  clusterIP: None
  selector:
    k8s-app: cilium
  ports:
  - name: hubble-metrics
    port: 9965
    targetPort: 9965

```
:::note
Un service standard envoie le trafic vers un seul Pod à la fois (Load Balancer). Ici, `clusterIP: None` (Headless) permet à Prometheus de voir tous les agents Cilium individuellement. C'est comme si on donnait à Prometheus la liste d'appel de tous les élèves de la classe plutôt que de ne parler qu'au délégué.
:::

### 2.Création du ServiceMonitor (`hubble-sm.yaml`)

```yaml

apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: cilium-hubble
  namespace: kube-system
  labels:
    release: kube-prometheus-stack
spec:
  selector:
    matchLabels:
      k8s-app: hubble
  endpoints:
  - port: hubble-metrics
    interval: 30s

```
:::note
Le ServiceMonitor est une consigne donnée à Prometheus. On lui dit : "Cherche tous les services qui portent l'étiquette k8s-app: hubble et va lire leurs données toutes les 30 secondes". Le label release: kube-prometheus-stack est crucial car il permet à Prometheus de savoir que ce moniteur lui appartient.
:::

---
## 🛠️ Accès et Diagnostic

### 1. Contrôle la disponibilité du port 3000 pour le service Grafana.

```bash 
# Voir ce qui utilise le port 3000
sudo lsof -i :3000

# Ou avec netstat
sudo netstat -tlnp | grep :3000

# Ou avec ss
sudo ss -tlnp | grep :3000


#Vous verrez quelque chose comme :

COMMAND   PID   USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
node      1234  user   21u  IPv4  12345      0t0  TCP *:3000 (LISTEN)
```

### 2. Utiliser un port spécifique pour tous les services

Pour avoir tous vos services sur des ports faciles à retenir :
```bash 
# Grafana sur 3001 si le port 3000 est déjà utilisé
# Grafana sur 0.0.0.0:3001
kubectl port-forward -n monitoring svc/kube-prometheus-stack-grafana 3001:80 --address 0.0.0.0 > /dev/null 2>&1 &

# Prometheus sur 0.0.0.0:9090
kubectl port-forward -n monitoring svc/kube-prometheus-stack-prometheus 9090:9090 --address 0.0.0.0 > /dev/null 2>&1 &

# Hubble UI sur 0.0.0.0:12000
kubectl port-forward -n kube-system svc/hubble-ui 12000:80 --address 0.0.0.0 > /dev/null 2>&1 &

# Alertmanager sur 0.0.0.0:9093
kubectl port-forward -n monitoring svc/kube-prometheus-stack-alertmanager 9093:9093 --address 0.0.0.0 > /dev/null 2>&1 &

echo "✅ Tous les port-forwards sont actifs et accessibles depuis le réseau !"
echo ""
echo "Grafana:      http://$(hostname -I | awk '{print $1}'):3001"
echo "Prometheus:   http://$(hostname -I | awk '{print $1}'):9090"
echo "Hubble UI:    http://$(hostname -I | awk '{print $1}'):12000"
echo "Alertmanager: http://$(hostname -I | awk '{print $1}'):9093"

```
:::note 
**🔓 Récupérer le mot de passe Grafana**
```bash
kubectl get secret -n monitoring kube-prometheus-stack-grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
```
:::

**💡 Tableau récapitulatif :**


| Service            |  URL                    | 
| :---               | :---                    | 
| **Grafana**        |  http://127.0.0.1:3001  | 
| **Prometheus**     |  http://127.0.0.1:9090  |
| **Hubble UI**      |  http://127.0.0.1:12000 |
| **Alertmanager**   |  http://127.0.0.1:9093  |

### 3. Diagnostic des Endpoints et Redémarrage de stabilisation

```bash

kubectl get endpoints hubble-metrics -n kube-system

#Vous verrez quelque chose comme :
NAME             ENDPOINTS                                                 AGE
hubble-metrics   192.168.1.115:9965,192.168.1.119:9965,192.168.1.53:9965   7h34m
```
:::note
C'est la première commande de vérification. Si tu vois des adresses IP dans la colonne ENDPOINTS, cela signifie que ton service a bien trouvé les agents Cilium. Si c'est vide, Prometheus ne recevra jamais de données.
:::

```bash

kubectl rollout restart deployment hubble-relay hubble-ui -n kube-system

```
> Hubble Relay va rafraîchir ses connexions gRPC et ses certificats de sécurité avec les agents Cilium.

