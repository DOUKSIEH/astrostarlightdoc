---
title: "Kubernetes - CloudNativePG"
description: "Explication du Blocage Kubernetes - CloudNativePG et local-path-provisioner"
created: "2026-02-03"
updated: "2026-02-04"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"
# hide_table_of_contents: false
---


# Explication du Blocage Kubernetes - CloudNativePG et local-path-provisioner

## 🔴 Le Problème Initial

Vous aviez un pod PostgreSQL bloqué en état `Pending` et le PersistentVolumeClaim (PVC) était également bloqué en `Pending`.

```
odoo-db-1-initdb   Pending   0/3 nodes available: pod has unbound immediate PersistentVolumeClaims
```

## 🔍 Cause Racine #1 : volumeBindingMode: Immediate

### Qu'est-ce que volumeBindingMode ?

Le `volumeBindingMode` dans une StorageClass définit **QUAND** le volume est créé :

#### Mode "Immediate" (votre configuration initiale) ❌
```
1. PVC créé → Provisioner essaie IMMÉDIATEMENT de créer le volume
2. PROBLÈME : Le provisioner local-path a besoin de savoir SUR QUEL NŒUD créer le volume
3. MAIS : Le pod n'est pas encore schedulé, donc pas de nœud connu
4. ERREUR : "configuration error, no node was specified"
5. RÉSULTAT : Cercle vicieux - pas de volume → pas de pod, pas de pod → pas de nœud
```

#### Mode "WaitForFirstConsumer" (la solution) ✅
```
1. PVC créé → Reste en Pending (normal)
2. Pod créé → Scheduler choisit un nœud (ex: talos-worker1)
3. Le provisioner SAIT maintenant sur quel nœud créer le volume
4. Volume créé sur le bon nœud
5. PVC devient Bound
6. Pod démarre
```

:::note[**Analogie simple 🎯**]

**Immediate** = Commander une pizza AVANT de savoir où vous serez
- Le livreur ne sait pas où livrer → échec

**WaitForFirstConsumer** = Commander une pizza APRÈS avoir choisi votre emplacement
- Le livreur sait où livrer → succès
:::

## 🔍 Cause Racine #2 : PodSecurity Policies

### Le Deuxième Blocage

Même après avoir corrigé le `volumeBindingMode`, une nouvelle erreur est apparue :

:::danger
pods "helper-pod-create-..." is forbidden: 
violates PodSecurity "baseline:latest": hostPath volumes (volume "data")
:::

### Explication

Le `local-path-provisioner` fonctionne en 2 étapes :
1. Il crée un **pod helper temporaire** sur le nœud cible
2. Ce pod helper crée le répertoire de stockage sur le disque du nœud

**PROBLÈME** : Les PodSecurity policies de Kubernetes empêchaient ce pod helper de :
- Utiliser des volumes `hostPath` (accéder au disque du nœud)
- S'exécuter avec les privilèges nécessaires

:::note[**Analogie simple 🎯**]

C'est comme avoir un ouvrier (helper pod) qui doit créer un placard dans votre maison :
- **Avant** : Le gardien de sécurité (PodSecurity) lui interdit d'entrer avec ses outils
- **Après** : On donne l'autorisation au gardien de laisser passer cet ouvrier spécifique
:::

## ✅ Les Solutions Appliquées

### Solution 1 : Modification de la StorageClass

```yaml
# AVANT (ne fonctionnait pas)
volumeBindingMode: Immediate

# APRÈS (fonctionne)
volumeBindingMode: WaitForFirstConsumer
```

**Commande utilisée :**
```bash
kubectl delete storageclass local-path
kubectl apply -f local-path-storageclass.yaml
```

### Solution 2 : Ajustement des PodSecurity

```bash
kubectl label namespace local-path-storage pod-security.kubernetes.io/enforce=privileged --overwrite
kubectl label namespace local-path-storage pod-security.kubernetes.io/audit=privileged --overwrite
kubectl label namespace local-path-storage pod-security.kubernetes.io/warn=privileged --overwrite
```

#### 🔐 Comprendre les PodSecurity Standards

Kubernetes utilise 3 niveaux de sécurité pour les pods :

**1. `privileged` (le moins restrictif)** 🔓
- Permet tout, y compris les opérations privilégiées
- Accès aux volumes hostPath
- Capacités système avancées
- Utilisé pour les composants d'infrastructure

**2. `baseline` (moyennement restrictif)** 🔒
- Empêche les escalades de privilèges connues
- Bloque les volumes hostPath
- C'était le niveau par défaut qui bloquait notre provisioner

**3. `restricted` (le plus restrictif)** 🔐
- Suit les meilleures pratiques de sécurité
- Pour les applications utilisateur normales

#### 📋 Les 3 Modes de PodSecurity

Chaque namespace peut avoir 3 modes différents pour appliquer ces standards :

**1. `enforce`** (application stricte)
```bash
pod-security.kubernetes.io/enforce=privileged
```
- **Ce que ça fait** : BLOQUE la création de pods qui ne respectent pas le niveau
- **Dans notre cas** : Permet au helper pod d'utiliser hostPath et de démarrer
- **Effet** : Les pods non conformes sont REJETÉS

**2. `audit`** (journalisation)
```bash
pod-security.kubernetes.io/audit=privileged
```
- **Ce que ça fait** : ENREGISTRE les violations dans les logs d'audit Kubernetes
- **Dans notre cas** : Permet de tracer les pods qui nécessitent des privilèges
- **Effet** : Les pods démarrent, mais les violations sont LOGGÉES

**3. `warn`** (avertissement)
```bash
pod-security.kubernetes.io/warn=privileged
```
- **Ce que ça fait** : AFFICHE un avertissement à l'utilisateur
- **Dans notre cas** : Informe que des privilèges élevés sont utilisés
- **Effet** : Les pods démarrent, mais un AVERTISSEMENT est affiché

#### 🎯 Pourquoi les 3 sont nécessaires ?

```
┌─────────────────────────────────────────────────────────────┐
│ Sans ces labels (défaut = baseline)                         │
├─────────────────────────────────────────────────────────────┤
│ enforce=baseline  → ❌ BLOQUE le helper pod                 │
│ audit=baseline    → 📝 Logue la tentative                   │
│ warn=baseline     → ⚠️  Affiche un warning                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Avec nos labels (privileged)                                │
├─────────────────────────────────────────────────────────────┤
│ enforce=privileged → ✅ AUTORISE le helper pod              │
│ audit=privileged   → 📝 Logue mais n'alerte pas             │
│ warn=privileged    → ✔️  Pas d'avertissement                │
└─────────────────────────────────────────────────────────────┘
```

#### 🔍 Pourquoi le Helper Pod a besoin de "privileged" ?

Le helper pod du local-path-provisioner doit :

1. **Monter un volume hostPath**
   ```yaml
   volumes:
   - name: data
     hostPath:
       path: /var/mnt/local-path-provisioner  # Accès au disque du nœud
   ```
   → Bloqué par `baseline` car hostPath peut exposer des données sensibles

2. **Créer des répertoires avec les bonnes permissions**
   ```bash
   mkdir -m 0777 -p /var/mnt/local-path-provisioner/pvc-xxxxx
   ```
   → Nécessite des privilèges système

3. **S'exécuter en tant que root** (parfois)
   → Pour gérer les permissions correctement

#### ⚠️ Pourquoi c'est sécurisé dans notre cas ?

**Question** : N'est-ce pas dangereux de mettre `privileged` ?

**Réponse** : C'est acceptable ici car :

1. **Scope limité** : Seulement le namespace `local-path-storage`
2. **Composant d'infrastructure** : Le provisioner est un composant système de confiance
3. **Pas d'accès utilisateur** : Les utilisateurs ne créent pas de pods dans ce namespace
4. **Alternative inexistante** : Le provisioner NE PEUT PAS fonctionner sans ces privilèges

#### 📊 Analogie avec le Monde Réel

Imaginez un immeuble avec 3 niveaux de sécurité :

```
🏢 Namespace = Étage de l'immeuble
👷 Helper Pod = Ouvrier de maintenance

Niveau "restricted" (étage résidentiel)
├─ ❌ Ouvrier ne peut pas entrer
└─ 👨‍👩‍👧 Seulement les résidents

Niveau "baseline" (étage commercial)
├─ ❌ Ouvrier ne peut pas accéder aux systèmes
└─ 🏪 Accès limité pour les commerces

Niveau "privileged" (local technique)
├─ ✅ Ouvrier peut accéder aux systèmes
├─ 🔧 Peut modifier l'infrastructure
└─ ⚙️ Nécessaire pour la maintenance
```

Le namespace `local-path-storage` est comme le **local technique** : il DOIT avoir des privilèges élevés pour faire son travail d'infrastructure.

#### 🔒 Bonne Pratique de Sécurité

```bash
# ✅ BON : Privilèges seulement pour le namespace système
kubectl label namespace local-path-storage pod-security.kubernetes.io/enforce=privileged

# ❌ MAUVAIS : Ne JAMAIS faire ça sur un namespace applicatif
kubectl label namespace odoo-v19 pod-security.kubernetes.io/enforce=privileged  # NON !
```

**Règle d'or** : 
- Namespaces système (kube-system, local-path-storage) → `privileged` OK ✅
- Namespaces applicatifs (odoo-v19, production) → `baseline` ou `restricted` ✅

#### 🧪 Vérification après Application

Pour vérifier que les labels sont bien appliqués :

```bash
# Voir tous les labels du namespace
kubectl get namespace local-path-storage --show-labels

# Ou de manière plus lisible
kubectl describe namespace local-path-storage | grep pod-security
```

Vous devriez voir :
```
pod-security.kubernetes.io/audit=privileged
pod-security.kubernetes.io/enforce=privileged
pod-security.kubernetes.io/warn=privileged
```

#### 📝 Résumé des Commandes

| Commande | Mode | Effet |
|----------|------|-------|
| `enforce=privileged` | Application | ✅ Autorise le pod à démarrer |
| `audit=privileged` | Journal | 📝 Enregistre l'activité sans alerter |
| `warn=privileged` | Avertissement | ✔️ Pas de warning dans kubectl |

Sans ces 3 labels, le helper pod était **bloqué** et ne pouvait pas créer les volumes, même si tout le reste était correct.

### Solution 3 : Recréation du Cluster

```bash
# Le cluster était dans un état "unrecoverable"
kubectl delete cluster odoo-db -n odoo-v19
kubectl apply -f odoo-db-cluster.yaml
```

## 📊 Le Flux de Travail Correct

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Création du Cluster CloudNativePG                        │
│    kubectl apply -f odoo-db-cluster.yaml                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. CloudNativePG crée un PVC                                │
│    NAME: odoo-db-1                                          │
│    STATUS: Pending (waiting for first consumer)            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. CloudNativePG crée un Pod                                │
│    NAME: odoo-db-1-initdb-xxxxx                             │
│    STATUS: Pending (waiting for volume)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Le Scheduler choisit un nœud                             │
│    NOMINATED NODE: talos-worker1                            │
│    (mais pas encore assigné)                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Le local-path-provisioner voit :                         │
│    - Un PVC en attente                                      │
│    - Un nœud cible (talos-worker1)                          │
│    → Il crée un helper pod sur talos-worker1                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Le helper pod crée le répertoire                         │
│    PATH: /var/mnt/local-path-provisioner/pvc-xxxxx          │
│    (grâce aux permissions PodSecurity privileged)           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Le provisioner crée le PersistentVolume (PV)            │
│    VOLUME: pvc-889c9a7a-967a-451a-965a-b07dd9d40c42        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. Le PVC devient Bound                                     │
│    STATUS: Bound                                            │
│    VOLUME: pvc-889c9a7a-...                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. Le Pod est assigné et démarre                            │
│    NODE: talos-worker1                                      │
│    STATUS: Running                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 10. PostgreSQL s'initialise et le cluster devient healthy  │
│     INSTANCES: 2                                            │
│     READY: 2                                                │
│     STATUS: Cluster in healthy state                        │
└─────────────────────────────────────────────────────────────┘
```

## 🎓 Leçons Apprises

### 1. Pour le local-path-provisioner
- ✅ Toujours utiliser `volumeBindingMode: WaitForFirstConsumer`
- ✅ Le namespace doit avoir les permissions PodSecurity appropriées

### 2. Pour CloudNativePG
- ⚠️ Un cluster en état "unrecoverable" doit être recréé complètement
- ⚠️ Ne jamais supprimer manuellement les PVCs d'un cluster existant

### 3. Pour Talos Linux
- Le provisioner fonctionne bien sur Talos
- Utiliser le chemin `/var/mnt/local-path-provisioner` pour le stockage

## 🔧 Configuration Finale qui Fonctionne

### StorageClass
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: local-path
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: rancher.io/local-path
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer  # ← La clé !
```

### Namespace local-path-storage
```bash
# Labels nécessaires
pod-security.kubernetes.io/enforce=privileged
pod-security.kubernetes.io/audit=privileged
pod-security.kubernetes.io/warn=privileged
```

### CloudNativePG Cluster
```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: odoo-db
  namespace: odoo-v19
spec:
  instances: 2
  storage:
    storageClass: local-path  # ← Référence la StorageClass
    size: 5Gi
```

## ✨ Résultat Final

```bash
$ kubectl get cluster -n odoo-v19
NAME      AGE     INSTANCES   READY   STATUS                     PRIMARY
odoo-db   6m56s   2           2       Cluster in healthy state   odoo-db-1

$ kubectl get pods -n odoo-v19
NAME        READY   STATUS    RESTARTS   AGE
odoo-db-1   1/1     Running   0          54s
odoo-db-2   1/1     Running   0          21s

$ kubectl get pvc -n odoo-v19
NAME        STATUS   VOLUME                                     CAPACITY
odoo-db-1   Bound    pvc-889c9a7a-967a-451a-965a-b07dd9d40c42   5Gi
odoo-db-2   Bound    pvc-7b8c3d9e-123f-456g-789h-012i3j4k5l6m   5Gi
```

**✅ Cluster PostgreSQL opérationnel avec haute disponibilité !**
