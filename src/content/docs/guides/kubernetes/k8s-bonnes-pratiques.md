---
title: "Kubernetes: sécurité, résilience et certification"
description: "Architecture, résilience et bonnes pratiques pour maîtriser Kubernetes et etcd."
created: "2026-10-22"
# updated: "2026-02-08"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"

---

**Kubernetes et etcd — guide complet · Édition du 16 octobre 2026 · Laboratoire Kubernetes 1.35.8 / etcd 3.6.6 · Parcours principal CKA**

<!-- Guide refondu à partir de `kubernetes-etcd-complet_2.md`. Les originaux sont conservés. Ce document peut se lire seul ; les fichiers complets nécessaires aux ateliers se trouvent dans le dossier associé. Tous les chemins de commandes sont relatifs à sa racine. Les schémas sont des SVG intégrés directement dans ce fichier (aucune image externe), adaptés aux thèmes clair et sombre de Starlight.

**Validation : relu et contrôlé statiquement ; ateliers et pannes non exécutés sur un cluster pendant la rédaction.** Les sources sont associées aux chapitres, les corrections à la fin et les résultats réellement obtenus dans le rapport de validation. -->

Ce guide vous apprend à **expliquer, construire, sécuriser et dépanner** un cluster Kubernetes, puis à **prouver** qu'il sait reprendre après une panne. Chaque chapitre part d'un besoin concret, montre le mécanisme, le met en pratique sur un laboratoire et indique comment vérifier le résultat.

:::tip[Un incident en cours ?]
Allez directement au [tableau de dépannage express](#depannage-express) : il relie chaque symptôme au scénario de diagnostic correspondant.
:::

## Sommaire navigable

- [1. Lire, choisir un parcours et connaître les limites](#chapitre-01)
- [2. Prérequis : ce qu'il faut savoir et comment se remettre à niveau](#chapitre-02)
- [3. Construire et remettre à zéro les laboratoires](#chapitre-03)
- [4. Architecture, réconciliation et parcours d'une requête](#chapitre-04)
- [5. Objets, labels, namespaces et gestion déclarative](#chapitre-05)
- [6. Pods : processus, probes et arrêt maîtrisé](#chapitre-06)
- [7. Workloads : choisir le bon contrôleur](#chapitre-07)
- [8. Ressources, placement et autoscaling](#chapitre-08)
- [9. Réseau des Pods, Services, DNS et NetworkPolicies](#chapitre-09)
- [10. ConfigMaps, Secrets et configuration vivante](#chapitre-10)
- [11. Stockage : volumes, PVC, topologie et données répliquées](#chapitre-11)
- [12. HTTP, Ingress, Gateway API et TLS](#chapitre-12)
- [13. Résilience : répliques, mise à jour et perturbations](#chapitre-13)
- [14. Reproductibilité : fichiers, Git, Kustomize et Helm](#chapitre-14)
- [15. Sécuriser les accès, les workloads et la chaîne logicielle](#chapitre-15)
- [16. Administrer les nœuds, certificats et versions](#chapitre-16)
- [17. Observer avant d'intervenir : métriques, logs, traces et alertes](#chapitre-17)
- [18. Industrialiser sans masquer Kubernetes](#chapitre-18)
- [19. etcd, Raft et reprise du control plane](#chapitre-19)
- [20. Reprise applicative : sauvegarder autre chose qu'etcd](#chapitre-20)
- [21. Diagnostiquer : dix-sept scénarios expliqués](#chapitre-21)
- [22. Préparer la CKA par la pratique](#chapitre-22)
- [23. Glossaire et repères de choix](#chapitre-23)
- [24. Audit initial, changements et statut des validations](#chapitre-24)

---

<a id="chapitre-01"></a>

## 1. Lire, choisir un parcours et connaître les limites

**En bref.** Kubernetes orchestre des conteneurs ; etcd conserve les objets de son API. Le fil conducteur du guide est un petit serveur **nginx non privilégié**, complété par des exercices de placement, de stockage et d'administration. La certification visée est la **CKA** (*Certified Kubernetes Administrator*) ; la CKAD (développement applicatif) et la CKS (sécurité) sont traitées à part, au chapitre 22.

### 1.1 Trois niveaux, un même raisonnement

| Niveau | Lire et faire | Vous saurez |
|---|---|---|
| **Découvrir** | Chapitres 1 à 7, schémas, encadrés, test de positionnement | Expliquer un Pod, le rôle de l'API et une réconciliation |
| **Pratiquer** | Laboratoire kind, chapitres 8 à 15, ateliers A01 à A12 | Déployer, prouver un accès autorisé et un refus, réparer un incident |
| **Approfondir** | VM kubeadm, chapitres 16 à 21, ateliers A13 à A16, examens blancs | Entretenir les nœuds, restaurer etcd, documenter les limites, préparer la CKA |

Chaque sujet important répond à quatre questions : **à quoi cela sert, comment cela fonctionne, comment l'utiliser, comment vérifier le résultat**. Quatre analogies reviennent : le **thermostat** (boucles de contrôle), le **registre partagé** (etcd), les **badges** (RBAC) et la **réserve de capacité** (disponibilité). Elles aident à comprendre ; aucune ne garantit un temps de reprise ou une sécurité absolue.

### 1.2 Conventions de lecture

| Repère | Signification |
|---|---|
| Titre d'un bloc de commandes | **Où** exécuter le bloc : poste d'administration, VM précise, compte root… |
| `kind-formation` / `formation-vm` | Contexte kubectl du laboratoire kind / du laboratoire VM kubeadm. Il est toujours écrit explicitement. |
| `MAJUSCULES` (`CLE_REELLE`, `NOM_RELEVE`…) | Paramètre à remplacer par **votre** valeur ; ne jamais le copier tel quel. |
| Chemins relatifs | Ils partent de la racine du dossier associé `refonte-kubernetes-etcd/`. |
| « Résultat attendu » | Critère à observer sur votre laboratoire, pas un résultat déjà mesuré. |
| `set -e` / `set -Eeuo pipefail` en tête de bloc | Le bloc s'arrête à la première erreur. Collé dans un terminal **interactif**, il fermerait la session en cas d'erreur : exécutez-le plutôt comme script (`bash fichier.sh`) ou dans un sous-shell `bash`. |
| Encadrés | **Note** : contexte · **Astuce** : à retenir · **Attention** : risque · **Danger** : action destructive. |

### 1.3 Versions clés du laboratoire

| Composant | Version retenue |
|---|---|
| Kubernetes (kind et kubeadm) | **v1.35.8** — gel pédagogique, pas forcément le dernier patch de la branche |
| etcd | Image kubeadm **3.6.6-0** ; clients `etcdctl` / `etcdutl` **3.6.6** |
| kind / kubectl / Helm | **v0.33.0** / **v1.35.8** (Kustomize intégré v5.7.1) / **v4.2.3** |
| Runtime des VM | containerd **2.2.9**, runc **1.3.6**, plugins CNI **1.9.0** |
| Réseau des Pods | Calico **v3.33.0** (manifeste legacy) |
| Système des VM | Ubuntu Server **24.04 LTS**, **amd64**, cgroup v2 |
| Examens annoncés | CKA et CKAD : Kubernetes **1.37** ; CKS : **1.35** (détails au chapitre 22) |

Les versions gelées servent à **reconstruire un exercice**, pas à éviter les mises à jour de sécurité. Pour tout autre usage : lire les avis de sécurité des projets, scanner les images, choisir des patchs corrigés, mettre à jour le verrou dans une branche et rejouer les validations. Le runtime inclus dans l'image kind est distinct de celui des VM ; relevez sa version avec `docker exec formation-control-plane containerd --version` sur le poste d'administration.

<details>
<summary>Référentiel technique complet au 16 octobre 2026 (versions, portée, réserves)</summary>

| Élément | Version retenue et portée | Vérification / réserve |
|---|---|---|
| Kubernetes du laboratoire | **v1.35.8** kind et kubeadm | Gel pédagogique explicite ; ce patch n'est pas présenté comme le plus récent de sa branche |
| Couverture | Commandes et manifests ciblent **1.35** Linux ; concepts communs à 1.35–1.37 | Les procédures ne sont pas certifiées par exécution sur 1.36/1.37 |
| Examen annoncé | CKA/CKAD **1.37**, CKS **1.35** | Pages LF consultées ; programmes, différences et nouvelle vérification avant inscription : chapitre 22 |
| kind | **v0.33.0** | Image node 1.35.8 et digest publiés ensemble dans la release |
| kubectl | **v1.35.8**, Kustomize intégré **v5.7.1** | Version du binaire réellement utilisé pour les rendus statiques |
| kubeadm, kubelet | **1.35.8-1.1** paquets Debian | Vérifier leur présence avec `apt-cache madison`, arrêt si indisponibles |
| etcd / outils | Image kubeadm **3.6.6-0** ; `etcdctl`/`etcdutl` **3.6.6** | Correspondance vérifiée dans le code kubeadm v1.35.8 |
| Runtime VM | containerd **2.2.9**, runc **1.3.6**, plugins CNI **1.9.0** | Procédure fournie, téléchargement/intégration VM non exécutés ici |
| CNI applicatif | Calico **v3.33.0**, manifeste legacy `calico.yaml`, dataplane par défaut | Documentation annonçant K8s 1.35 compatible ; vérifier le refus effectif au chapitre 9 |
| Images applicatives | nginx-unprivileged **1.29.3-alpine**, curl **8.16.0**, BusyBox **1.37.0** | Images d'exercice gelées, digests réels dans `images.lock.json` ; analyse CVE non exécutée |
| Helm | **v4.2.3** | Chart local rendu et linté ; ne pas confondre version du chart et de l'application |
| Métriques optionnelles | Metrics Server **v0.9.0**, API `metrics.k8s.io/v1beta1` | Atelier TLS explicite du chapitre 8 ; installation réelle non exécutée |
| Exposition optionnelle | Envoy Gateway **v1.9.2**, Gateway API branche **1.6** du bundle | Matrice officielle 1.9 : K8s 1.33–1.36 ; aucune validation 1.37 déduite |
| OS VM / processeur | Ubuntu Server **24.04 LTS**, **amd64**, cgroup v2 | ARM64 : images multiarch possibles, script VM amd64 volontairement refusé |

</details>

<details>
<summary>État des fonctionnalités et compatibilités utilisées</summary>

| Fonction / API | État pour le laboratoire 1.35 | Conséquence |
|---|---|---|
| Deployment/StatefulSet/DaemonSet `apps/v1`, Job/CronJob `batch/v1`, PDB `policy/v1`, HPA `autoscaling/v2` | Stables | Versions utilisées dans les fichiers |
| Pod Security Admission (PSA) et profil Restricted | Stables ; version du profil figée 1.35 | Les namespaces portent les six labels enforce/audit/warn et leurs versions |
| Sidecar natif `initContainers[].restartPolicy: Always` | Stable depuis 1.33 | Ne pas le confondre avec un simple second conteneur |
| Rotation du certificat serveur kubelet | `RotateKubeletServerCertificate` bêta, activé par défaut en 1.35 | L'atelier métriques active `serverTLSBootstrap` ; approbation manuelle des CSR après contrôle des identités et SAN |
| `ReadWriteOncePod` | Stable depuis 1.29, volumes CSI uniquement et composants compatibles | Le provisionneur local kind ne démontre pas RWOP |
| StatefulSet PVC retention | Stable depuis 1.32 | Valeurs Retain explicites ; contrôler aussi la reclaimPolicy du PV |
| Endpoints historiques | Dépréciés depuis 1.33 | Utiliser EndpointSlices ; un Service n'exige pas une IP unique par application |
| Ingress API `networking.k8s.io/v1` | Stable, fonctionnalités figées | L'API demeure ; le contrôleur communautaire Ingress NGINX est retiré de maintenance depuis mars 2026 |
| Gateway/HTTPRoute `gateway.networking.k8s.io/v1` | CRD externes, canal standard, pas API native intégrée | Installer le bundle et une implémentation compatible |
| PodSecurityPolicy, dockershim, plugins de stockage in-tree anciens | Retirés / migrés selon le composant | PSA remplace PSP ; containerd/CRI, CSI pour les nouveaux exemples |
| Calico native v3 CRDs avec MutatingAdmissionPolicy | Sur 1.35 : dépend du feature gate bêta correspondant | **Pas utilisé** : parcours legacy sans activer de gate expérimental |

</details>

**Compatibilité des versions (*version skew*).** kubectl est supporté à une version mineure près de l'API Server. Le kubelet ne doit pas être plus récent que l'API Server ; il peut être plus ancien dans les limites officielles. Le guide garde le même mineur partout. Avant une montée de version, surtout avec plusieurs API Servers, relisez la politique. Une extension a sa propre matrice, même si son YAML est accepté.

:::caution[Portée de validation]
Les étapes de lecture, les vérifications documentaires et la validation statique sont consignées dans `validations/rapport-validation.md`. **Aucun cluster ni scénario de panne n'a été exécuté pendant cette refonte.** Les sorties des chapitres sont illustratives et les résultats attendus des ateliers sont des critères à mesurer. Un YAML valide ne prouve ni le fonctionnement, ni l'isolation, ni la résilience.
:::

**Références vérifiées le 16/10/2026 :** [releases Kubernetes](https://kubernetes.io/releases/), [kind 0.33](https://github.com/kubernetes-sigs/kind/releases/tag/v0.33.0), [politique de version skew](https://kubernetes.io/releases/version-skew-policy/), [versions etcd kubeadm 1.35.8](https://github.com/kubernetes/kubernetes/blob/v1.35.8/cmd/kubeadm/app/constants/constants.go), [compatibilité Calico](https://docs.tigera.io/calico/latest/getting-started/kubernetes/requirements), [matrice Envoy Gateway](https://gateway.envoyproxy.io/news/releases/matrix/).

<a id="chapitre-02"></a>

## 2. Prérequis : ce qu'il faut savoir et comment se remettre à niveau

**En bref.** Kubernetes s'appuie sur Linux, le réseau et YAML. Si ces bases manquent, les erreurs de cluster deviennent indéchiffrables. Ce chapitre liste le minimum et propose un auto-test rapide.

### 2.1 Linux et terminal

Un processus possède un **UID** (*User Identifier*), des fichiers ouverts, un code de sortie et reçoit des signaux : `SIGTERM` demande l'arrêt, `SIGKILL` le force. Le code de sortie 137 peut correspondre à un `SIGKILL` ; à lui seul, il ne prouve pas un manque de mémoire. Avant de travailler sur les VM, il faut savoir lire des permissions `rwx`, un propriétaire et un groupe, utiliser `sudo`, et trouver un service systemd et son journal.

```bash title="Terminal Ubuntu de préparation · aucun cluster nécessaire"
id
pwd
ls -ld .
df -h
free -h
ip -br address
ip route
ss -lnt
systemctl status ssh --no-pager
```

| Commande | Ce qu'elle montre | Ce qu'elle ne prouve pas |
|---|---|---|
| `id` | Votre UID et vos groupes | Vos droits sur un fichier précis |
| `df -h` | L'espace des systèmes de fichiers | La mémoire disponible |
| `free -h` | La mémoire et le swap | La pression mémoire d'un conteneur |
| `ip -br address`, `ip route` | Les adresses des interfaces et les routes | Qu'un service distant répond |
| `ss -lnt` | Les ports TCP en écoute | Que le pare-feu les laisse passer |
| `systemctl status ssh` | L'état du service et ses dernières lignes de journal | Que la configuration est correcte |

Un code retour 0 indique seulement le succès **de cette commande**. Les scripts Bash du guide utilisent `set -Eeuo pipefail` pour s'arrêter à la première erreur, y compris dans un pipeline ; cela n'annule pas les changements déjà faits.

**Sous Windows**, les blocs `bash` s'exécutent dans Ubuntu/WSL2 ou sur les VM indiquées, jamais directement dans PowerShell ; les blocs `powershell` concernent uniquement le poste Windows. WSL2 doit accéder au même moteur Docker que kind. Gardez le projet dans le système de fichiers Linux de WSL : les permissions y sont fiables.

### 2.2 Réseau et conteneurs

- Une **adresse IP** identifie une interface ; un **port** identifie un point d'écoute.
- **TCP** établit une connexion ; **UDP** non. **DNS** traduit un nom en adresses.
- **HTTP** est un protocole applicatif ; **TLS** chiffre et authentifie la communication grâce aux certificats et aux autorités de confiance.
- Un `ping` réussi ne teste pas HTTP, et un refus TCP n'est pas un échec de résolution DNS.

Un **conteneur** est un processus isolé par le noyau, pas une machine virtuelle. Son **image OCI** (*Open Container Initiative*) contient un système de fichiers et des métadonnées. Un **tag** peut être déplacé ; un **digest** identifie un contenu précis. Une image construite avec Docker fonctionne avec un runtime **CRI** (*Container Runtime Interface*) comme containerd : le retrait de dockershim n'a pas rendu les images Docker inutilisables.

### 2.3 YAML, stockage et unités

YAML distingue chaîne, booléen, entier, liste et dictionnaire (*mapping*). Indentez avec deux espaces, jamais avec des tabulations ; `---` sépare deux documents. Citez les chaînes qui ressemblent à un booléen quand l'API attend du texte, par exemple une variable d'environnement `"true"`.

```yaml title="Illustration · types YAML (rien n'est appliqué au cluster)"
nom: "atelier"
actif: true
replicas: 3
ports: [80, 8080]
options:
  couleur: bleu
```

| Notation | Sens |
|---|---|
| `cpu: 100m` | 0,1 CPU |
| `memory: 128Mi` | 128 mébioctets (2²⁰ octets), pas 128 mégaoctets décimaux |

Un disque est attaché à une machine ; un système de fichiers y organise les fichiers ; un **volume** Kubernetes rend un emplacement accessible à un Pod. **Persister n'est ni répliquer ni sauvegarder.** Avant le stockage avancé, sachez monter un système de fichiers et distinguer capacité, **IOPS** (opérations d'entrée/sortie par seconde) et latence. Le glossaire (chapitre 23) et les ateliers A01 et A09 renforcent ces bases.

:::tip[Auto-test]
Pouvez-vous expliquer la sortie de `id`, une route IP, un port en écoute, un code HTTP 404 et une erreur d'indentation YAML ? Si non, commencez par le laboratoire léger. N'apprenez pas les commandes Linux de base en même temps que les procédures etcd.
:::

**Références :** [CRI](https://v1-35.docs.kubernetes.io/docs/concepts/architecture/cri/), [ressources des conteneurs](https://v1-35.docs.kubernetes.io/docs/concepts/configuration/manage-resources-containers/), [installation WSL](https://learn.microsoft.com/windows/wsl/install), [Docker Desktop WSL2](https://docs.docker.com/desktop/features/wsl/).

<a id="chapitre-03"></a>

## 3. Construire et remettre à zéro les laboratoires

**En bref.** Deux laboratoires complémentaires : **kind** pour apprendre vite les objets Kubernetes, des **VM kubeadm** pour l'administration réelle (noyau, systemd, PKI, etcd). Ce chapitre les construit, les vérifie et explique comment repartir de zéro.

<div class="not-content kd-figure" style="margin:1.5rem 0">
<svg xmlns="http://www.w3.org/2000/svg" class="kd" style="max-width:100%;height:auto;display:block" data-pagefind-ignore width="520" height="590" viewBox="0 0 520 590" role="img" aria-labelledby="kd35-t kd35-d">
<title id="kd35-t">Deux laboratoires, deux usages</title>
<desc id="kd35-d">Le laboratoire kind tourne dans Docker sur le poste d'administration avec trois nœuds conteneurs. Le laboratoire VM kubeadm utilise le réseau privé 192.168.56.0/24 : lb en .10, cp1 en .11, cp2 et cp3 en .12 et .13 pour l'extension HA, w1 et w2 en .21 et .22.</desc>
<style>
svg.kd text{font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;fill:#111827}
svg.kd .bg{fill:#f7f8fb;stroke:#d5dbe5;stroke-width:1.5}
svg.kd .ttl{font-size:19px;font-weight:700}
svg.kd .tb{font-size:17px;font-weight:700}
svg.kd .tb15{font-size:16px;font-weight:700}
svg.kd .t{font-size:16px}
svg.kd .s{font-size:15px;fill:#374151}
svg.kd .ok{fill:#166534;font-weight:700}
svg.kd .bad{fill:#b91c1c;font-weight:700}
svg.kd .k-blue{fill:#e8eefc;stroke:#2f5bd3}
svg.kd .k-teal{fill:#e1f3ef;stroke:#0f766e}
svg.kd .k-violet{fill:#efe9fd;stroke:#6d28d9}
svg.kd .k-amber{fill:#fdf3e1;stroke:#b45309}
svg.kd .k-red{fill:#fdeaea;stroke:#b91c1c}
svg.kd .k-green{fill:#e6f5ea;stroke:#15803d}
svg.kd .k-gray{fill:#ffffff;stroke:#8b97a8}
svg.kd .k-panel{fill:#eef1f6;stroke:#c3cbd8}
svg.kd .dash{stroke-dasharray:6 5}
svg.kd .ln{stroke:#4b5563;stroke-width:2;fill:none}
svg.kd .ln-ok{stroke:#15803d}
svg.kd .ln-bad{stroke:#b91c1c}
svg.kd .life{stroke:#8b97a8;stroke-width:1.5;stroke-dasharray:4 5;fill:none}
svg.kd .ah{fill:#4b5563}
svg.kd .ah-ok{fill:#15803d}
svg.kd .ah-bad{fill:#b91c1c}
svg.kd .bdg{fill:#2f5bd3}
svg.kd .bdg-t{fill:#ffffff;font-size:13px;font-weight:700}
:root[data-theme='dark'] svg.kd text{fill:#f3f4f6}
:root[data-theme='dark'] svg.kd .bg{fill:#111827;stroke:#374151}
:root[data-theme='dark'] svg.kd .s{fill:#d1d5db}
:root[data-theme='dark'] svg.kd .ok{fill:#86efac}
:root[data-theme='dark'] svg.kd .bad{fill:#fca5a5}
:root[data-theme='dark'] svg.kd .k-blue{fill:#1b2a4d;stroke:#8fb1ff}
:root[data-theme='dark'] svg.kd .k-teal{fill:#0f302c;stroke:#5eead4}
:root[data-theme='dark'] svg.kd .k-violet{fill:#2a1f4d;stroke:#c4b5fd}
:root[data-theme='dark'] svg.kd .k-amber{fill:#3a2a10;stroke:#fcd34d}
:root[data-theme='dark'] svg.kd .k-red{fill:#3d1717;stroke:#fca5a5}
:root[data-theme='dark'] svg.kd .k-green{fill:#12321d;stroke:#86efac}
:root[data-theme='dark'] svg.kd .k-gray{fill:#1f2937;stroke:#6b7280}
:root[data-theme='dark'] svg.kd .k-panel{fill:#172030;stroke:#334155}
:root[data-theme='dark'] svg.kd .ln{stroke:#cbd5e1}
:root[data-theme='dark'] svg.kd .ln-ok{stroke:#86efac}
:root[data-theme='dark'] svg.kd .ln-bad{stroke:#fca5a5}
:root[data-theme='dark'] svg.kd .life{stroke:#6b7280}
:root[data-theme='dark'] svg.kd .ah{fill:#cbd5e1}
:root[data-theme='dark'] svg.kd .ah-ok{fill:#86efac}
:root[data-theme='dark'] svg.kd .ah-bad{fill:#fca5a5}
:root[data-theme='dark'] svg.kd .bdg{fill:#8fb1ff}
:root[data-theme='dark'] svg.kd .bdg-t{fill:#0b1220}
@media (prefers-color-scheme:dark){
:root:not([data-theme]) svg.kd text{fill:#f3f4f6}
:root:not([data-theme]) svg.kd .bg{fill:#111827;stroke:#374151}
:root:not([data-theme]) svg.kd .s{fill:#d1d5db}
:root:not([data-theme]) svg.kd .ok{fill:#86efac}
:root:not([data-theme]) svg.kd .bad{fill:#fca5a5}
:root:not([data-theme]) svg.kd .k-blue{fill:#1b2a4d;stroke:#8fb1ff}
:root:not([data-theme]) svg.kd .k-teal{fill:#0f302c;stroke:#5eead4}
:root:not([data-theme]) svg.kd .k-violet{fill:#2a1f4d;stroke:#c4b5fd}
:root:not([data-theme]) svg.kd .k-amber{fill:#3a2a10;stroke:#fcd34d}
:root:not([data-theme]) svg.kd .k-red{fill:#3d1717;stroke:#fca5a5}
:root:not([data-theme]) svg.kd .k-green{fill:#12321d;stroke:#86efac}
:root:not([data-theme]) svg.kd .k-gray{fill:#1f2937;stroke:#6b7280}
:root:not([data-theme]) svg.kd .k-panel{fill:#172030;stroke:#334155}
:root:not([data-theme]) svg.kd .ln{stroke:#cbd5e1}
:root:not([data-theme]) svg.kd .ln-ok{stroke:#86efac}
:root:not([data-theme]) svg.kd .ln-bad{stroke:#fca5a5}
:root:not([data-theme]) svg.kd .life{stroke:#6b7280}
:root:not([data-theme]) svg.kd .ah{fill:#cbd5e1}
:root:not([data-theme]) svg.kd .ah-ok{fill:#86efac}
:root:not([data-theme]) svg.kd .ah-bad{fill:#fca5a5}
:root:not([data-theme]) svg.kd .bdg{fill:#8fb1ff}
:root:not([data-theme]) svg.kd .bdg-t{fill:#0b1220}
}
</style>
<defs>
<marker id="kd35-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah"/></marker>
<marker id="kd35-a-ok" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah-ok"/></marker>
<marker id="kd35-a-bad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah-bad"/></marker>
</defs>
<rect x="1" y="1" width="518" height="588" rx="14" class="bg"/>
<text x="20" y="34" class="ttl">Deux laboratoires, deux usages</text>
<rect x="16" y="52" width="488" height="196" rx="12" class="k-panel" stroke-width="1.6"/>
<text x="32" y="80" class="tb" text-anchor="start">Laboratoire kind</text>
<text x="32" y="101" class="s" text-anchor="start">Docker sur le poste · contexte kind-formation</text>
<rect x="32" y="118" width="140" height="62" rx="10" class="k-teal" stroke-width="1.6"/>
<text x="102.0" y="143.6" class="s" text-anchor="middle">formation-</text>
<text x="102.0" y="163.3" class="tb15" text-anchor="middle">control-plane</text>
<rect x="184" y="118" width="140" height="62" rx="10" class="k-teal" stroke-width="1.6"/>
<text x="254.0" y="143.6" class="s" text-anchor="middle">formation-</text>
<text x="254.0" y="163.3" class="tb15" text-anchor="middle">worker</text>
<rect x="336" y="118" width="140" height="62" rx="10" class="k-teal" stroke-width="1.6"/>
<text x="406.0" y="143.6" class="s" text-anchor="middle">formation-</text>
<text x="406.0" y="163.3" class="tb15" text-anchor="middle">worker2</text>
<text x="32" y="206" class="s" text-anchor="start">Objets, réseau, stockage local, ateliers A01–A12.</text>
<text x="32" y="226" class="s" text-anchor="start">Recréation rapide ; les nœuds partagent le même hôte.</text>
<rect x="16" y="264" width="488" height="306" rx="12" class="k-panel" stroke-width="1.6"/>
<text x="32" y="292" class="tb" text-anchor="start">Laboratoire VM kubeadm</text>
<text x="32" y="313" class="s" text-anchor="start">Réseau privé 192.168.56.0/24 · ateliers A13–A16</text>
<rect x="170" y="328" width="180" height="54" rx="10" class="k-amber" stroke-width="1.6"/>
<text x="260.0" y="350.3" class="tb15" text-anchor="middle">lb · .10</text>
<text x="260.0" y="369.6" class="s" text-anchor="middle">HAProxy → API 6443</text>
<path d="M260,382 L102,414" class="ln" marker-end="url(#kd35-a)"/>
<rect x="32" y="414" width="140" height="56" rx="10" class="k-blue" stroke-width="1.6"/>
<text x="102.0" y="437.3" class="tb15" text-anchor="middle">cp1 · .11</text>
<text x="102.0" y="456.6" class="s" text-anchor="middle">etcd + API</text>
<path d="M260,382 L254,414" class="ln" marker-end="url(#kd35-a)"/>
<rect x="184" y="414" width="140" height="56" rx="10" class="k-blue dash" stroke-width="1.6"/>
<text x="254.0" y="437.3" class="tb15" text-anchor="middle">cp2 · .12</text>
<text x="254.0" y="456.6" class="s" text-anchor="middle">extension HA</text>
<path d="M260,382 L406,414" class="ln" marker-end="url(#kd35-a)"/>
<rect x="336" y="414" width="140" height="56" rx="10" class="k-blue dash" stroke-width="1.6"/>
<text x="406.0" y="437.3" class="tb15" text-anchor="middle">cp3 · .13</text>
<text x="406.0" y="456.6" class="s" text-anchor="middle">extension HA</text>
<rect x="108" y="488" width="140" height="56" rx="10" class="k-teal" stroke-width="1.6"/>
<text x="178.0" y="511.3" class="tb15" text-anchor="middle">w1 · .21</text>
<text x="178.0" y="530.6" class="s" text-anchor="middle">workloads</text>
<rect x="272" y="488" width="140" height="56" rx="10" class="k-teal" stroke-width="1.6"/>
<text x="342.0" y="511.3" class="tb15" text-anchor="middle">w2 · .22</text>
<text x="342.0" y="530.6" class="s" text-anchor="middle">workloads</text>
<text x="32" y="562" class="s" text-anchor="start">Pointillés : membres facultatifs de l'extension HA.</text>
</svg>
</div>

### 3.1 Choisir et dimensionner

**kind** (*Kubernetes IN Docker*) exécute de vrais composants Kubernetes dans des conteneurs qui jouent le rôle de nœuds. Il se reconstruit rapidement, avec des images de nœud publiées par digest. Limite : les nœuds partagent l'hôte, donc perdre un conteneur kind ne simule pas toute la diversité des pannes matérielles.

Les **VM kubeadm** donnent accès au noyau, à systemd, au runtime et aux fichiers du control plane. Elles sont indispensables aux exercices d'administration.

| Laboratoire | Ressources à réserver | Ce qu'il permet |
|---|---|---|
| kind standard : 1 CP + 2 workers | 4 vCPU disponibles, 8 GiB de RAM pour le moteur Docker, 20 GiB libres | Objets, NetworkPolicies, rollouts, placement sur 2 workers ; 3 réplicas ne sont pas 3 domaines matériels |
| kind allégé : 1 CP | 2 vCPU, 4 GiB de RAM, 12 GiB libres | Objets, droits, NetworkPolicies, stockage local ; pas de perte de nœud ni de répartition |
| VM de base : cp1, w1, w2, lb | CP 2 vCPU / 3 GiB / 25 GiB ; chaque worker 2 vCPU / 2 GiB / 20 GiB ; LB 1 vCPU / 512 MiB / 8 GiB | kubeadm, maintenance des workers, reprise etcd à un membre ; 16 GiB de RAM hôte recommandés |
| Extension HA : cp1, cp2, cp3, w1, w2, lb | Trois CP identiques ; 24 GiB de RAM hôte conseillés | Quorum etcd à 3, perte d'un membre, API multiréplicas ; le LB unique reste un point de panne |

*CP = control plane ; LB = load balancer (répartiteur de charge).*

Ces tailles sont des points de départ pédagogiques, pas un dimensionnement de production. Points à vérifier avant de commencer :

- la capacité **réellement allouée** à WSL/Docker (celle du PC n'est pas automatiquement disponible dans le moteur) ;
- un accès Internet sortant HTTPS pour les images, les paquets et DNS ;
- les ports etcd 2379/2380 ne sont **jamais** exposés à Internet ;
- un compte et un laboratoire dédiés : Docker et l'accès à son socket donnent des pouvoirs importants sur le poste.

### 3.2 Préparer le poste d'administration

Sous Windows 11, installez WSL2 et Ubuntu selon les prérequis Microsoft, puis Docker Desktop avec l'intégration de cette distribution ; redémarrez quand l'installation le demande. Docker Engine dans une VM Ubuntu dédiée est une alternative officielle. Consignez les versions **réellement installées** de Docker et de l'hyperviseur : ce guide ne les fixe pas.

```powershell title="Poste Windows · PowerShell administrateur (si WSL est absent)"
wsl --install -d Ubuntu-24.04
# Après installation et redémarrage : ouvrir le terminal Ubuntu.
```

```bash title="Poste d'administration Ubuntu/WSL2 · racine de refonte-kubernetes-etcd"
# Docker Desktop/Engine doit déjà être installé et son moteur Linux démarré.
docker version
docker info --format '{{.OSType}} / {{.Architecture}} / cgroup {{.CgroupVersion}}'
# Attendu : linux, architecture native compatible, cgroup v2 ; sinon corriger avant kind.
sudo apt-get update
sudo apt-get install -y ca-certificates curl python3 python3-venv git jq age openssl
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements-validation.txt
bash scripts/install-admin-tools.sh
export PATH="$PWD/outillage/bin:$PATH"
kind version
kubectl version --client
helm version --short
```

**Résultat attendu :** `docker info` affiche `linux / … / cgroup 2` ; `kind`, `kubectl` et `helm` affichent les versions du tableau précédent.

Les scripts installent uniquement des outils locaux dans `outillage/` et vérifient leurs sommes de contrôle depuis les distributions officielles. Ce contrôle détecte un téléchargement corrompu, mais pas un serveur de publication compromis : la signature du projet, la conservation des artefacts approuvés et la revue des mises à jour le complètent.

### 3.3 Démarrer kind avec un réseau qui applique les politiques

Le fichier `configurations/kind.yaml` crée 3 nœuds, désactive le CNI par défaut et fixe les plages **CIDR** (*Classless Inter-Domain Routing*, notation d'une plage d'adresses) : Pods `10.244.0.0/16`, Services `10.96.0.0/12`.

**Avant le lancement**, vérifiez depuis le poste, avec `ip route` et `docker network inspect bridge`, que ces plages ne recouvrent ni votre LAN, ni un VPN, ni les réseaux Docker/VM. En cas de recouvrement, modifiez les configurations kind **et** kubeadm, et gardez ce changement dans Git.

```bash title="Poste d'administration · dossier associé, venv activé"
bash scripts/lab-up.sh
# OU sur petit poste, au lieu de la commande précédente :
# bash scripts/lab-up.sh --leger
kubectl --context kind-formation cluster-info
kubectl --context kind-formation get nodes -o wide
kubectl --context kind-formation -n kube-system get pods -o wide
kubectl --context kind-formation -n atelier get deploy,svc
bash scripts/test-network.sh
```

**Ce que fait `lab-up.sh` :**

1. Il refuse un cluster `formation` déjà présent, pour ne pas mélanger deux installations réseau.
2. Il crée le cluster, télécharge le manifeste **Calico 3.33.0 legacy** et l'applique côté serveur.
3. Il attend que les nœuds soient Ready — **après** l'installation du CNI : sans réseau, l'état NotReady est normal et transitoire.
4. Il conserve `vendor/calico.yaml` et son empreinte SHA-256 : enregistrez ces deux fichiers dans le dépôt de formation.

Une reconstruction réutilise le fichier approuvé : `sha256sum --check vendor/calico.yaml.sha256`, puis application du même contenu. Si le script échoue après la création du cluster, relevez les logs, supprimez ce seul cluster et recommencez : ce n'est pas une transaction qui annule toutes les étapes.

:::note[Pourquoi le manifeste legacy de Calico ?]
Il utilise les CRD historiques `crd.projectcalico.org/v1`, sans activer `MutatingAdmissionPolicy`. Le mode « native v3 » de Calico 3.33 a d'autres prérequis sur Kubernetes 1.35 : le substituer mécaniquement serait incorrect. Sur kubeadm, Calico détecte le PodCIDR ; contrôlez l'IPPool et ses CIDR avant de poursuivre.
:::

**L'application de l'atelier.** Le serveur web expose `/`, `/healthz` et `/ready`. Ses fichiers temporaires sont dans `/tmp` ; seuls ses volumes prévus sont inscriptibles. `test-network.sh` modifie uniquement trois politiques nommées du namespace `atelier`. Il exige d'abord une **baseline** HTTP fonctionnelle : sans elle, impossible d'affirmer que le filtrage fonctionne. Le test laisse les politiques en place.

```bash title="Poste d'administration · nettoyage réseau, contrôles, puis destruction"
kubectl --context kind-formation -n atelier delete -f manifests/network/
bash scripts/lab-check.sh
# DESTRUCTIF : cluster kind formation et tous ses volumes, aucun autre cluster.
# Préserver preuves et données à garder AVANT. Reprise : lab-up.sh avec le même verrou.
CONFIRMER_DESTRUCTION_LAB=formation bash scripts/lab-down.sh
```

:::danger[Remise à zéro de kind]
`lab-down.sh` détruit le cluster `formation` **et tous ses volumes**. Sauvegardez d'abord les preuves et données à conserver. Pour reconstruire : `lab-up.sh` avec le même verrou.
:::

### 3.4 Préparer les VM depuis zéro

**Étape 1 — Créer les VM.** Utilisez des VM Ubuntu Server 24.04 amd64 créées depuis un ISO officiel dont le SHA-256 correspond au fichier signé `SHA256SUMS` du miroir Ubuntu. Consignez ISO, version, empreinte et configuration de l'hyperviseur dans `validations/inventaire-lab.md`. Pour chaque VM :

- les ressources du tableau 3.1 et un disque système ;
- une carte **NAT** pour les paquets et une carte **privée host-only** pour les échanges entre VM ;
- OpenSSH, un utilisateur `formation` avec sudo et une clé SSH dédiée, l'heure synchronisée.

Le disque des control planes doit avoir une latence régulière : un disque hôte saturé rend les expériences etcd trompeuses.

| Nom / hostname | Adresse privée | Usage |
|---|---|---|
| lb | 192.168.56.10 | HAProxy TCP vers les API Servers |
| cp1 | 192.168.56.11 | Control plane et etcd local |
| cp2 / cp3 | 192.168.56.12 / .13 | Extension HA uniquement |
| w1 / w2 | 192.168.56.21 / .22 | Workloads |

**Étape 2 — Configurer le réseau privé.** La carte privée ne doit pas porter de route par défaut concurrente. Sur VirtualBox, les noms habituels sont `enp0s3` (NAT) et `enp0s8` (privé) : **vérifiez-les avec `ip -br a`**. Le fichier ci-dessous est complet pour cp1 avec ces interfaces ; adaptez-le avant de l'enregistrer. Gardez l'accès console de l'hyperviseur et testez avec `sudo netplan try` avant `apply`.

```yaml title="VM cp1 · /etc/netplan/60-atelier.yaml (jamais sur le poste Windows)"
network:
  version: 2
  ethernets:
    enp0s3:
      dhcp4: true
    enp0s8:
      dhcp4: false
      addresses: [192.168.56.11/24]
```

Sur w1, w2, cp2, cp3 et lb, changez uniquement l'adresse et le hostname selon l'inventaire.

**Étape 3 — Résoudre le nom de l'API.** Sur toutes les VM **et** sur le poste d'administration qui doit joindre ce réseau, ajoutez à `/etc/hosts` la ligne `192.168.56.10 api.k8s.test`. Vérifiez avec `getent hosts api.k8s.test`, `ip route` et une connexion depuis le poste. Sous WSL2, un routage privé Windows vers le réseau des VM peut être nécessaire ; à défaut, exécutez kubectl depuis une VM d'administration de ce réseau. N'utilisez jamais une adresse d'API non couverte par le certificat.

**Étape 4 — Ouvrir uniquement les flux nécessaires.**

| Port | Protocole | Source → destination | Rôle |
|---|---|---|---|
| 6443 | TCP | Poste / LB → control planes | API Kubernetes |
| 2379-2380 | TCP | **Entre control planes uniquement** | Clients et pairs etcd |
| 10250 | TCP | Control planes → nœuds | API du kubelet |
| 179 / IP-in-IP (protocole 4) | TCP / IP | Entre nœuds | Calico par défaut (BGP, IPIP) |
| 4789 | UDP | Entre nœuds | Seulement si Calico est configuré en VXLAN |
| 10257 / 10259 | TCP | Local au control plane | controller-manager / scheduler |
| 53, 443 | UDP-TCP / TCP | Nœuds → Internet | DNS et téléchargements sortants |
| 30000-32767 | TCP/UDP | Clients → nœuds | NodePort, seulement si un exercice le demande |

Ne désactivez pas tous les pare-feu par commodité ; relevez les règles dans l'inventaire.

**Étape 5 — Préparer chaque nœud Kubernetes.** Copiez le dossier de formation vers les VM depuis le poste, par exemple `scp -r refonte-kubernetes-etcd formation@192.168.56.11:~/`, puis :

```bash title="CHAQUE VM cp/worker Ubuntu 24.04 neuve · jamais lb ni l'hôte"
cd ~/refonte-kubernetes-etcd
sudo env CONFIRMER_VM_LAB=oui bash scripts/prepare-node.sh
stat -fc %T /sys/fs/cgroup
sudo systemctl status containerd --no-pager
sudo crictl info
sudo swapon --show
```

**Résultat attendu :** `cgroup2fs`, containerd actif, `crictl info` répond, aucun swap listé. Le kubelet peut redémarrer en boucle tant que `kubeadm init/join` n'a pas écrit sa configuration : c'est normal.

<details>
<summary>Ce que fait exactement <code>prepare-node.sh</code> (et pourquoi)</summary>

- Il est **volontairement limité à une VM neuve** et refuse un nœud déjà joint ; pour remettre à zéro, recréez la VM.
- Il installe containerd 2.2.9, runc 1.3.6, les plugins CNI 1.9.0 amont et `crictl` 1.35.0, avec le cgroup driver systemd des deux côtés, et gèle les paquets Kubernetes.
- `crictl` est installé explicitement (SHA-256 repris de la publication officielle) pour ne pas dépendre silencieusement de la version APT.
- Les plugins CNI amont sont extraits **après** les paquets Kubernetes, pour qu'une dépendance `kubernetes-cni` ne les écrase pas immédiatement. Une mise à niveau future de ce paquet peut les remplacer : vérifiez-les lors des mises à niveau.
- Il contrôle le hostname et la présence de l'IP privée de l'inventaire, puis écrit `KUBELET_EXTRA_ARGS="--node-ip=IP_PRIVEE"` dans `/etc/default/kubelet` — **sur cp1 comme sur les workers et les autres CP**.

Pourquoi `--node-ip` ? `advertiseAddress` de l'API Server ne fixe pas l'InternalIP du kubelet. Sans cette valeur, le kubelet pourrait publier l'adresse NAT. Gardez-la cohérente avec l'inventaire. Si votre dépôt d'administration utilise des fichiers join par nœud, préférez `nodeRegistration.kubeletExtraArgs`, sans cumuler deux valeurs contradictoires.

L'intégration réelle de ces binaires et de l'image Ubuntu n'a pas été exécutée lors de la rédaction.

</details>

**Étape 6 — Configurer le répartiteur (VM lb).** Installez HAProxy avec `sudo apt-get install haproxy`, copiez `configurations/haproxy.cfg` dans `/etc/haproxy/haproxy.cfg`, validez avec `sudo haproxy -c -f /etc/haproxy/haproxy.cfg`, puis `sudo systemctl restart haproxy`. Consignez la version du paquet et l'état des backends. Le contrôle TCP est pédagogique : il ne remplace ni un contrôle `/readyz` authentifié, ni une paire de load balancers.

### 3.5 Initialiser cp1, installer le réseau et joindre les workers

**À quoi sert cette étape :** créer le premier control plane, installer Calico adapté aux deux cartes réseau, puis préparer la jonction des workers.

```bash title="VM cp1 · dossier associé, sudo"
sudo kubeadm config validate --config configurations/kubeadm.yaml
sudo kubeadm config images list --config configurations/kubeadm.yaml
sudo kubeadm init --config configurations/kubeadm.yaml
mkdir -p "$HOME/.kube"
sudo install -m 0600 -o "$USER" -g "$(id -gn)" /etc/kubernetes/admin.conf "$HOME/.kube/config"
kubectl config rename-context kubernetes-admin@formation-vm formation-vm
# Compte administrateur d'amorçage : nécessaire aux objets cluster ici, pas à l'application.
mkdir -p vendor
curl -fL https://raw.githubusercontent.com/projectcalico/calico/v3.33.0/manifests/calico.yaml -o vendor/calico-vm-upstream.yaml
# Adapter AVANT application : pool de Pods et choix de l'interface privée multi-NIC.
python3 - <<'PY'
from pathlib import Path
import yaml
documents = list(yaml.safe_load_all(Path('vendor/calico-vm-upstream.yaml').read_text()))
matches = [d for d in documents if d and d.get('kind') == 'DaemonSet'
           and d.get('metadata', {}).get('name') == 'calico-node']
assert len(matches) == 1, 'DaemonSet calico-node absent ou ambigu'
container = next(c for c in matches[0]['spec']['template']['spec']['containers']
                 if c['name'] == 'calico-node')
updates = {'IP_AUTODETECTION_METHOD': 'kubernetes-internal-ip',
           'CALICO_IPV4POOL_CIDR': '10.244.0.0/16'}
env = container.setdefault('env', [])
env[:] = [item for item in env if item['name'] not in updates]
env.extend({'name': key, 'value': value} for key, value in updates.items())
Path('vendor/calico-vm.yaml').write_text(yaml.safe_dump_all(documents, sort_keys=False))
PY
sha256sum vendor/calico-vm-upstream.yaml vendor/calico-vm.yaml > vendor/calico-vm.sha256
# Relire et conserver ces trois fichiers dans Git AVANT leur réutilisation.
kubectl --context formation-vm apply --server-side -f vendor/calico-vm.yaml
kubectl --context formation-vm -n kube-system rollout status ds/calico-node --timeout=300s
kubectl --context formation-vm get ippools.crd.projectcalico.org -o wide
sudo kubeadm token create --ttl 30m --print-join-command
```

**Rôle des options importantes :**

- `kubeadm config validate` et `images list` vérifient la configuration avant toute modification du système.
- Le script Python modifie **uniquement** le DaemonSet `calico-node` : `IP_AUTODETECTION_METHOD=kubernetes-internal-ip` force Calico à reprendre l'InternalIP du kubelet (carte privée) au lieu de la carte NAT ; `CALICO_IPV4POOL_CIDR` aligne le pool sur `10.244.0.0/16`. Changer cette variable après la création du pool ne migre pas un pool existant.
- `--ttl 30m` limite la durée de vie du token de jonction.

**Joindre chaque worker.** La sortie de `token create` est une commande **secrète et temporaire**.

1. Vérifiez `/etc/default/kubelet` sur le worker : w1 doit porter `--node-ip=192.168.56.21`, w2 `--node-ip=192.168.56.22`. **`--node-ip` est un flag du kubelet, pas une option de `kubeadm join`** ; `prepare-node.sh` l'a déjà enregistré.
2. Exécutez avec `sudo` la commande imprimée telle quelle — adresse `api.k8s.test:6443`, token et hash de CA exacts — en ajoutant `--cri-socket=unix:///run/containerd/containerd.sock` pour expliciter le runtime.
3. N'inventez jamais le hash et n'utilisez pas `--discovery-token-unsafe-skip-ca-verification`.
4. Retirez ensuite les tokens inutiles : `sudo kubeadm token list`, puis `sudo kubeadm token delete ID` (ID lu dans cette sortie, jamais celui d'un autre environnement).

```bash title="VM cp1 · après les jonctions des workers"
kubectl --context formation-vm get nodes -o wide
kubectl --context formation-vm -n kube-system get pods -o wide
kubectl --context formation-vm get --raw='/readyz?verbose'
kubectl --context formation-vm get storageclass
```

**Résultat attendu :** nœuds Ready avec des **InternalIP privées** (192.168.56.x), pods Calico prêts, `/readyz?verbose` qui se termine par `readyz check passed`, pool Calico en `10.244.0.0/16`.

:::caution[Pas de StorageClass par défaut sur les VM]
Sans provisionneur CSI installé, kubeadm ne fournit **pas** la StorageClass `standard` de kind. N'appliquez pas ici le StatefulSet de stockage : l'atelier stockage de base s'exécute dans kind ; un CSI sur VM est une extension distincte.
:::

**Accès depuis le poste.** Copiez via SSH le kubeconfig de cp1 dans `.secrets/admin-vm.kubeconfig` (permissions 0600), puis définissez `KUBECONFIG_VM="$PWD/.secrets/admin-vm.kubeconfig"`. Le contexte enregistré est `formation-vm`. Ce fichier est un accès administrateur : protégez-le comme une clé.

### 3.6 Extension HA et remise à zéro des VM

**Ajouter cp2 puis cp3 (extension HA).**

1. Sur cp1 : `sudo kubeadm init phase upload-certs --upload-certs` fournit une **clé de certificats** sensible et temporaire ; `sudo kubeadm token create --ttl 30m --print-join-command` fournit la commande de découverte.
2. Sur cp2 puis cp3 préparés, exécutez la commande join exacte en ajoutant : `--control-plane --certificate-key CLE_REELLE --apiserver-advertise-address=IP_PRIVEE_DE_CE_CP --cri-socket=unix:///run/containerd/containerd.sock`. `CLE_REELLE` et `IP_PRIVEE_DE_CE_CP` sont des paramètres à remplacer : IP `.12` sur cp2, `.13` sur cp3.
3. Vérifiez aussi leur `--node-ip` local, distinct de l'adresse publiée par l'API. Noms, IP et certificats doivent rester cohérents.
4. Ajoutez chaque backend HAProxy **seulement quand son API est prête**.
5. Vérifiez trois membres etcd et trois CP Ready (chapitre 19). Les clés d'upload expirent et ne doivent jamais être commitées.

:::danger[Laboratoire destructif — démonter une VM cp/worker]
1. Sauvegarder ce qui doit survivre.
2. Drainer puis supprimer son objet Node depuis une API saine.
3. Exécuter `sudo kubeadm reset -f` sur **cette VM uniquement**.
4. Détruire puis recréer la VM dans l'hyperviseur.

`reset` n'efface ni toutes les règles réseau, ni les configurations CNI, ni les kubeconfigs : le seul retour à zéro garanti est la **recréation depuis l'image connue**. Pour un control plane, vérifiez d'abord le quorum et ne supprimez jamais plusieurs membres en même temps. Reprise complète : VM neuves, préparation, init, CNI, join, restauration éventuelle des données sauvegardées.
:::

**Sources vérifiées le 16/10/2026 :** [kind démarrage](https://kind.sigs.k8s.io/docs/user/quick-start/), [installation Calico legacy](https://docs.tigera.io/calico/latest/getting-started/kubernetes/self-managed-onprem/onpremises), [installation kubeadm 1.35](https://v1-35.docs.kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/), [runtime/cgroups](https://v1-35.docs.kubernetes.io/docs/setup/production-environment/container-runtimes/), [création du cluster](https://v1-35.docs.kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/), [HA kubeadm](https://v1-35.docs.kubernetes.io/docs/setup/production-environment/tools/kubeadm/high-availability/), [ports Kubernetes](https://kubernetes.io/docs/reference/networking/ports-and-protocols/), [containerd 2.2.9](https://github.com/containerd/containerd/releases/tag/v2.2.9), [runc 1.3.6](https://github.com/opencontainers/runc/releases/tag/v1.3.6), [plugins CNI 1.9.0](https://github.com/containernetworking/plugins/releases/tag/v1.9.0).

Sources des corrections multi-NIC et de l'outillage : [surcharge locale kubelet et ordre des arguments](https://v1-35.docs.kubernetes.io/docs/setup/production-environment/tools/kubeadm/kubelet-integration/), [flag kubelet node-ip](https://v1-35.docs.kubernetes.io/docs/reference/command-line-tools-reference/kubelet/), [autodétection Calico](https://docs.tigera.io/calico/latest/networking/ipam/ip-autodetection), [publication cri-tools 1.35.0 et SHA-256 Linux amd64](https://github.com/kubernetes-sigs/cri-tools/releases/tag/v1.35.0). Ces contrôles sont documentaires et statiques ; aucun init/join ni routage inter-VM n'a été exécuté.


<a id="chapitre-04"></a>

## 4. Architecture, réconciliation et parcours d'une requête

**En bref.** Lancer un processus ne suffit pas : un serveur s'arrête, une image change, une dépendance disparaît. Kubernetes fournit une **API** (*Application Programming Interface*), un stockage des objets (etcd), des **contrôleurs** et des **agents de nœud** qui rapprochent en permanence l'état observé de l'état souhaité. Il n'invente pas ce qui manque : sans ressources, sans réseau ou sans image accessible, la réconciliation reste bloquée.

### 4.1 Le plan de contrôle : tout passe par l'API

<div class="not-content kd-figure" style="margin:1.5rem 0">
<svg xmlns="http://www.w3.org/2000/svg" class="kd" style="max-width:100%;height:auto;display:block" data-pagefind-ignore width="520" height="470" viewBox="0 0 520 470" role="img" aria-labelledby="kd36-t kd36-d">
<title id="kd36-t">Plan de contrôle : tout passe par l'API</title>
<desc id="kd36-d">Le poste d'administration envoie ses requêtes à kube-apiserver en HTTPS sur le port 6443. Seul kube-apiserver lit et écrit dans etcd, en mTLS sur le port 2379. Controller Manager, Scheduler et les kubelets observent l'API et y écrivent leurs décisions.</desc>
<style>
svg.kd text{font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;fill:#111827}
svg.kd .bg{fill:#f7f8fb;stroke:#d5dbe5;stroke-width:1.5}
svg.kd .ttl{font-size:19px;font-weight:700}
svg.kd .tb{font-size:17px;font-weight:700}
svg.kd .tb15{font-size:16px;font-weight:700}
svg.kd .t{font-size:16px}
svg.kd .s{font-size:15px;fill:#374151}
svg.kd .ok{fill:#166534;font-weight:700}
svg.kd .bad{fill:#b91c1c;font-weight:700}
svg.kd .k-blue{fill:#e8eefc;stroke:#2f5bd3}
svg.kd .k-teal{fill:#e1f3ef;stroke:#0f766e}
svg.kd .k-violet{fill:#efe9fd;stroke:#6d28d9}
svg.kd .k-amber{fill:#fdf3e1;stroke:#b45309}
svg.kd .k-red{fill:#fdeaea;stroke:#b91c1c}
svg.kd .k-green{fill:#e6f5ea;stroke:#15803d}
svg.kd .k-gray{fill:#ffffff;stroke:#8b97a8}
svg.kd .k-panel{fill:#eef1f6;stroke:#c3cbd8}
svg.kd .dash{stroke-dasharray:6 5}
svg.kd .ln{stroke:#4b5563;stroke-width:2;fill:none}
svg.kd .ln-ok{stroke:#15803d}
svg.kd .ln-bad{stroke:#b91c1c}
svg.kd .life{stroke:#8b97a8;stroke-width:1.5;stroke-dasharray:4 5;fill:none}
svg.kd .ah{fill:#4b5563}
svg.kd .ah-ok{fill:#15803d}
svg.kd .ah-bad{fill:#b91c1c}
svg.kd .bdg{fill:#2f5bd3}
svg.kd .bdg-t{fill:#ffffff;font-size:13px;font-weight:700}
:root[data-theme='dark'] svg.kd text{fill:#f3f4f6}
:root[data-theme='dark'] svg.kd .bg{fill:#111827;stroke:#374151}
:root[data-theme='dark'] svg.kd .s{fill:#d1d5db}
:root[data-theme='dark'] svg.kd .ok{fill:#86efac}
:root[data-theme='dark'] svg.kd .bad{fill:#fca5a5}
:root[data-theme='dark'] svg.kd .k-blue{fill:#1b2a4d;stroke:#8fb1ff}
:root[data-theme='dark'] svg.kd .k-teal{fill:#0f302c;stroke:#5eead4}
:root[data-theme='dark'] svg.kd .k-violet{fill:#2a1f4d;stroke:#c4b5fd}
:root[data-theme='dark'] svg.kd .k-amber{fill:#3a2a10;stroke:#fcd34d}
:root[data-theme='dark'] svg.kd .k-red{fill:#3d1717;stroke:#fca5a5}
:root[data-theme='dark'] svg.kd .k-green{fill:#12321d;stroke:#86efac}
:root[data-theme='dark'] svg.kd .k-gray{fill:#1f2937;stroke:#6b7280}
:root[data-theme='dark'] svg.kd .k-panel{fill:#172030;stroke:#334155}
:root[data-theme='dark'] svg.kd .ln{stroke:#cbd5e1}
:root[data-theme='dark'] svg.kd .ln-ok{stroke:#86efac}
:root[data-theme='dark'] svg.kd .ln-bad{stroke:#fca5a5}
:root[data-theme='dark'] svg.kd .life{stroke:#6b7280}
:root[data-theme='dark'] svg.kd .ah{fill:#cbd5e1}
:root[data-theme='dark'] svg.kd .ah-ok{fill:#86efac}
:root[data-theme='dark'] svg.kd .ah-bad{fill:#fca5a5}
:root[data-theme='dark'] svg.kd .bdg{fill:#8fb1ff}
:root[data-theme='dark'] svg.kd .bdg-t{fill:#0b1220}
@media (prefers-color-scheme:dark){
:root:not([data-theme]) svg.kd text{fill:#f3f4f6}
:root:not([data-theme]) svg.kd .bg{fill:#111827;stroke:#374151}
:root:not([data-theme]) svg.kd .s{fill:#d1d5db}
:root:not([data-theme]) svg.kd .ok{fill:#86efac}
:root:not([data-theme]) svg.kd .bad{fill:#fca5a5}
:root:not([data-theme]) svg.kd .k-blue{fill:#1b2a4d;stroke:#8fb1ff}
:root:not([data-theme]) svg.kd .k-teal{fill:#0f302c;stroke:#5eead4}
:root:not([data-theme]) svg.kd .k-violet{fill:#2a1f4d;stroke:#c4b5fd}
:root:not([data-theme]) svg.kd .k-amber{fill:#3a2a10;stroke:#fcd34d}
:root:not([data-theme]) svg.kd .k-red{fill:#3d1717;stroke:#fca5a5}
:root:not([data-theme]) svg.kd .k-green{fill:#12321d;stroke:#86efac}
:root:not([data-theme]) svg.kd .k-gray{fill:#1f2937;stroke:#6b7280}
:root:not([data-theme]) svg.kd .k-panel{fill:#172030;stroke:#334155}
:root:not([data-theme]) svg.kd .ln{stroke:#cbd5e1}
:root:not([data-theme]) svg.kd .ln-ok{stroke:#86efac}
:root:not([data-theme]) svg.kd .ln-bad{stroke:#fca5a5}
:root:not([data-theme]) svg.kd .life{stroke:#6b7280}
:root:not([data-theme]) svg.kd .ah{fill:#cbd5e1}
:root:not([data-theme]) svg.kd .ah-ok{fill:#86efac}
:root:not([data-theme]) svg.kd .ah-bad{fill:#fca5a5}
:root:not([data-theme]) svg.kd .bdg{fill:#8fb1ff}
:root:not([data-theme]) svg.kd .bdg-t{fill:#0b1220}
}
</style>
<defs>
<marker id="kd36-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah"/></marker>
<marker id="kd36-a-ok" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah-ok"/></marker>
<marker id="kd36-a-bad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah-bad"/></marker>
</defs>
<rect x="1" y="1" width="518" height="468" rx="14" class="bg"/>
<text x="20" y="34" class="ttl">Plan de contrôle : tout passe par l'API</text>
<rect x="20" y="58" width="225" height="64" rx="10" class="k-gray" stroke-width="1.6"/>
<text x="132.5" y="85.3" class="tb15" text-anchor="middle">Poste d'administration</text>
<text x="132.5" y="104.6" class="s" text-anchor="middle">kubectl · CI · GitOps</text>
<path d="M285,65 a107.5,9 0 0 1 215,0 v52 a107.5,9 0 0 1 -215,0 z" class="k-violet" stroke-width="1.6"/>
<path d="M285,65 a107.5,9 0 0 0 215,0" class="k-violet" fill="none" stroke-width="1.6" style="fill:none"/>
<text x="392.5" y="95.5" class="tb" text-anchor="middle">etcd</text>
<text x="392.5" y="115.1" class="s" text-anchor="middle">objets API persistés</text>
<rect x="60" y="176" width="400" height="70" rx="10" class="k-blue" stroke-width="1.6"/>
<text x="260.0" y="206.5" class="tb" text-anchor="middle">kube-apiserver</text>
<text x="260.0" y="226.1" class="s" text-anchor="middle">authentifie · autorise · admet · valide</text>
<path d="M132,122 L132,174" class="ln" marker-end="url(#kd36-a)"/>
<text x="142" y="154" class="s" text-anchor="start">HTTPS 6443</text>
<path d="M392,174 L392,128" class="ln" marker-end="url(#kd36-a)"/>
<text x="402" y="156" class="s" text-anchor="start">mTLS 2379</text>
<rect x="20" y="310" width="155" height="74" rx="10" class="k-teal" stroke-width="1.6"/>
<text x="97.5" y="332.3" class="tb15" text-anchor="middle">Controller</text>
<text x="97.5" y="352.3" class="tb15" text-anchor="middle">Manager</text>
<text x="97.5" y="371.6" class="s" text-anchor="middle">réconcilie</text>
<rect x="183" y="310" width="155" height="74" rx="10" class="k-teal" stroke-width="1.6"/>
<text x="260.5" y="342.3" class="tb15" text-anchor="middle">Scheduler</text>
<text x="260.5" y="361.6" class="s" text-anchor="middle">affecte les Pods</text>
<rect x="346" y="310" width="155" height="74" rx="10" class="k-teal" stroke-width="1.6"/>
<text x="423.5" y="342.3" class="tb15" text-anchor="middle">kubelet × N</text>
<text x="423.5" y="361.6" class="s" text-anchor="middle">exécute les Pods</text>
<path d="M97,249 L97,307" class="ln" marker-start="url(#kd36-a)" marker-end="url(#kd36-a)"/>
<path d="M260,249 L260,307" class="ln" marker-start="url(#kd36-a)" marker-end="url(#kd36-a)"/>
<path d="M423,249 L423,307" class="ln" marker-start="url(#kd36-a)" marker-end="url(#kd36-a)"/>
<text x="270" y="283" class="s" text-anchor="start">watch / écritures</text>
<text x="20" y="420" class="t" text-anchor="start">Seul kube-apiserver accède directement à etcd.</text>
<text x="20" y="444" class="s" text-anchor="start">Les autres composants observent l'API et y écrivent.</text>
</svg>
</div>

L'API Server est le **point de passage unique** : il contrôle chaque requête, puis enregistre l'objet dans etcd. Les autres composants ne lisent jamais etcd directement ; ils **observent** l'API (*watch*) et y **écrivent** leurs décisions.

### 4.2 Sur chaque nœud : kubelet, runtime et plugins

<div class="not-content kd-figure" style="margin:1.5rem 0">
<svg xmlns="http://www.w3.org/2000/svg" class="kd" style="max-width:100%;height:auto;display:block" data-pagefind-ignore width="520" height="560" viewBox="0 0 520 560" role="img" aria-labelledby="kd37-t kd37-d">
<title id="kd37-t">Sur chaque nœud : kubelet, CRI, CNI, CSI</title>
<desc id="kd37-d">kube-apiserver transmet au kubelet les Pods affectés au nœud ; le kubelet publie leur statut. Le kubelet pilote containerd et runc via l'interface CRI pour tirer les images et créer les conteneurs. Le plugin CNI fournit l'IP, les routes et l'application des politiques réseau ; le pilote CSI fournit les volumes montés dans le Pod.</desc>
<style>
svg.kd text{font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;fill:#111827}
svg.kd .bg{fill:#f7f8fb;stroke:#d5dbe5;stroke-width:1.5}
svg.kd .ttl{font-size:19px;font-weight:700}
svg.kd .tb{font-size:17px;font-weight:700}
svg.kd .tb15{font-size:16px;font-weight:700}
svg.kd .t{font-size:16px}
svg.kd .s{font-size:15px;fill:#374151}
svg.kd .ok{fill:#166534;font-weight:700}
svg.kd .bad{fill:#b91c1c;font-weight:700}
svg.kd .k-blue{fill:#e8eefc;stroke:#2f5bd3}
svg.kd .k-teal{fill:#e1f3ef;stroke:#0f766e}
svg.kd .k-violet{fill:#efe9fd;stroke:#6d28d9}
svg.kd .k-amber{fill:#fdf3e1;stroke:#b45309}
svg.kd .k-red{fill:#fdeaea;stroke:#b91c1c}
svg.kd .k-green{fill:#e6f5ea;stroke:#15803d}
svg.kd .k-gray{fill:#ffffff;stroke:#8b97a8}
svg.kd .k-panel{fill:#eef1f6;stroke:#c3cbd8}
svg.kd .dash{stroke-dasharray:6 5}
svg.kd .ln{stroke:#4b5563;stroke-width:2;fill:none}
svg.kd .ln-ok{stroke:#15803d}
svg.kd .ln-bad{stroke:#b91c1c}
svg.kd .life{stroke:#8b97a8;stroke-width:1.5;stroke-dasharray:4 5;fill:none}
svg.kd .ah{fill:#4b5563}
svg.kd .ah-ok{fill:#15803d}
svg.kd .ah-bad{fill:#b91c1c}
svg.kd .bdg{fill:#2f5bd3}
svg.kd .bdg-t{fill:#ffffff;font-size:13px;font-weight:700}
:root[data-theme='dark'] svg.kd text{fill:#f3f4f6}
:root[data-theme='dark'] svg.kd .bg{fill:#111827;stroke:#374151}
:root[data-theme='dark'] svg.kd .s{fill:#d1d5db}
:root[data-theme='dark'] svg.kd .ok{fill:#86efac}
:root[data-theme='dark'] svg.kd .bad{fill:#fca5a5}
:root[data-theme='dark'] svg.kd .k-blue{fill:#1b2a4d;stroke:#8fb1ff}
:root[data-theme='dark'] svg.kd .k-teal{fill:#0f302c;stroke:#5eead4}
:root[data-theme='dark'] svg.kd .k-violet{fill:#2a1f4d;stroke:#c4b5fd}
:root[data-theme='dark'] svg.kd .k-amber{fill:#3a2a10;stroke:#fcd34d}
:root[data-theme='dark'] svg.kd .k-red{fill:#3d1717;stroke:#fca5a5}
:root[data-theme='dark'] svg.kd .k-green{fill:#12321d;stroke:#86efac}
:root[data-theme='dark'] svg.kd .k-gray{fill:#1f2937;stroke:#6b7280}
:root[data-theme='dark'] svg.kd .k-panel{fill:#172030;stroke:#334155}
:root[data-theme='dark'] svg.kd .ln{stroke:#cbd5e1}
:root[data-theme='dark'] svg.kd .ln-ok{stroke:#86efac}
:root[data-theme='dark'] svg.kd .ln-bad{stroke:#fca5a5}
:root[data-theme='dark'] svg.kd .life{stroke:#6b7280}
:root[data-theme='dark'] svg.kd .ah{fill:#cbd5e1}
:root[data-theme='dark'] svg.kd .ah-ok{fill:#86efac}
:root[data-theme='dark'] svg.kd .ah-bad{fill:#fca5a5}
:root[data-theme='dark'] svg.kd .bdg{fill:#8fb1ff}
:root[data-theme='dark'] svg.kd .bdg-t{fill:#0b1220}
@media (prefers-color-scheme:dark){
:root:not([data-theme]) svg.kd text{fill:#f3f4f6}
:root:not([data-theme]) svg.kd .bg{fill:#111827;stroke:#374151}
:root:not([data-theme]) svg.kd .s{fill:#d1d5db}
:root:not([data-theme]) svg.kd .ok{fill:#86efac}
:root:not([data-theme]) svg.kd .bad{fill:#fca5a5}
:root:not([data-theme]) svg.kd .k-blue{fill:#1b2a4d;stroke:#8fb1ff}
:root:not([data-theme]) svg.kd .k-teal{fill:#0f302c;stroke:#5eead4}
:root:not([data-theme]) svg.kd .k-violet{fill:#2a1f4d;stroke:#c4b5fd}
:root:not([data-theme]) svg.kd .k-amber{fill:#3a2a10;stroke:#fcd34d}
:root:not([data-theme]) svg.kd .k-red{fill:#3d1717;stroke:#fca5a5}
:root:not([data-theme]) svg.kd .k-green{fill:#12321d;stroke:#86efac}
:root:not([data-theme]) svg.kd .k-gray{fill:#1f2937;stroke:#6b7280}
:root:not([data-theme]) svg.kd .k-panel{fill:#172030;stroke:#334155}
:root:not([data-theme]) svg.kd .ln{stroke:#cbd5e1}
:root:not([data-theme]) svg.kd .ln-ok{stroke:#86efac}
:root:not([data-theme]) svg.kd .ln-bad{stroke:#fca5a5}
:root:not([data-theme]) svg.kd .life{stroke:#6b7280}
:root:not([data-theme]) svg.kd .ah{fill:#cbd5e1}
:root:not([data-theme]) svg.kd .ah-ok{fill:#86efac}
:root:not([data-theme]) svg.kd .ah-bad{fill:#fca5a5}
:root:not([data-theme]) svg.kd .bdg{fill:#8fb1ff}
:root:not([data-theme]) svg.kd .bdg-t{fill:#0b1220}
}
</style>
<defs>
<marker id="kd37-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah"/></marker>
<marker id="kd37-a-ok" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah-ok"/></marker>
<marker id="kd37-a-bad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah-bad"/></marker>
</defs>
<rect x="1" y="1" width="518" height="558" rx="14" class="bg"/>
<text x="20" y="34" class="ttl">Sur chaque nœud : kubelet, CRI, CNI, CSI</text>
<rect x="160" y="54" width="200" height="44" rx="10" class="k-blue" stroke-width="1.6"/>
<text x="260.0" y="80.8" class="tb15" text-anchor="middle">kube-apiserver</text>
<path d="M260,100 L260,148" class="ln" marker-start="url(#kd37-a)" marker-end="url(#kd37-a)"/>
<text x="272" y="129" class="s" text-anchor="start">Pods affectés ↓ · statut ↑</text>
<rect x="140" y="150" width="240" height="58" rx="10" class="k-teal" stroke-width="1.6"/>
<text x="260.0" y="174.5" class="tb" text-anchor="middle">kubelet</text>
<text x="260.0" y="194.1" class="s" text-anchor="middle">agent du nœud</text>
<path d="M260,210 L260,256" class="ln" marker-end="url(#kd37-a)"/>
<text x="272" y="238" class="s" text-anchor="start">CRI (gRPC)</text>
<rect x="100" y="258" width="320" height="58" rx="10" class="k-teal" stroke-width="1.6"/>
<text x="260.0" y="282.5" class="tb" text-anchor="middle">containerd + runc</text>
<text x="260.0" y="302.1" class="s" text-anchor="middle">tire l'image, crée les conteneurs</text>
<path d="M260,318 L260,362" class="ln" marker-end="url(#kd37-a)"/>
<rect x="170" y="364" width="180" height="112" rx="12" class="k-gray" stroke-width="1.6"/>
<text x="260" y="388" class="tb" text-anchor="middle">Pod</text>
<text x="260" y="407" class="s" text-anchor="middle">IP et volumes partagés</text>
<rect x="182" y="420" width="76" height="42" rx="10" class="k-green" stroke-width="1.6"/>
<text x="220.0" y="445.8" class="tb15" text-anchor="middle">app</text>
<rect x="264" y="420" width="76" height="42" rx="10" class="k-green dash" stroke-width="1.6"/>
<text x="302.0" y="445.8" class="t" text-anchor="middle">sidecar</text>
<rect x="10" y="382" width="120" height="76" rx="10" class="k-amber" stroke-width="1.6"/>
<text x="70.0" y="406.0" class="tb" text-anchor="middle">CNI</text>
<text x="70.0" y="425.6" class="s" text-anchor="middle">IP, routes,</text>
<text x="70.0" y="444.6" class="s" text-anchor="middle">politiques</text>
<rect x="390" y="382" width="120" height="76" rx="10" class="k-violet" stroke-width="1.6"/>
<text x="450.0" y="406.0" class="tb" text-anchor="middle">CSI</text>
<text x="450.0" y="425.6" class="s" text-anchor="middle">volumes</text>
<text x="450.0" y="444.6" class="s" text-anchor="middle">montés</text>
<path d="M130,420 L168,420" class="ln" marker-end="url(#kd37-a)"/>
<path d="M390,420 L352,420" class="ln" marker-end="url(#kd37-a)"/>
<text x="20" y="508" class="s" text-anchor="start">Avec kubeadm, le kubelet lance aussi les static Pods</text>
<text x="20" y="528" class="s" text-anchor="start">décrits dans /etc/kubernetes/manifests.</text>
</svg>
</div>

Le kubelet ne crée pas lui-même les conteneurs : il délègue au runtime via l'interface **CRI**. Le réseau du Pod vient du plugin **CNI** (*Container Network Interface*) et ses volumes persistants du pilote **CSI** (*Container Storage Interface*).

| Composant | Travail réel | Limite à connaître |
|---|---|---|
| kube-apiserver | Authentifie, autorise, admet, valide et expose l'API ; persiste via etcd | Un `apply` accepté ne signifie pas que les Pods tournent |
| etcd | Base distribuée des objets persistés et de leurs révisions | Ne stocke ni les images, ni les fichiers des PVC, ni tous les logs |
| kube-scheduler | Filtre puis classe les nœuds pour les Pods non assignés ; enregistre leur affectation | Ne lance pas les conteneurs ; ne déplace pas un Pod déjà affecté |
| kube-controller-manager | Contrôleurs Deployment, ReplicaSet, Node, Job, EndpointSlice… | Boucles asynchrones, avec reprises et délais variables |
| kubelet | Observe les Pods affectés à son nœud, gère les conteneurs via CRI, publie leur état | Isolé de l'API, il peut garder ses conteneurs sans réconciliation globale |
| Runtime (containerd) | Tire les images et crée les conteneurs/processus | Dépend du disque, du noyau et de sa configuration |
| CNI | Connecte les Pods au réseau ; applique les politiques selon le plugin | L'objet NetworkPolicy seul ne filtre aucun paquet |
| CSI | Relie Kubernetes aux systèmes de stockage | Une StorageClass sans pilote ne crée aucun disque |
| kube-proxy ou équivalent CNI | Implémente le routage des Services selon le mode choisi | Le Service est une abstraction ; pas de processus proxy par Service |

### 4.3 La boucle de réconciliation : un thermostat… avec des limites

<div class="not-content kd-figure" style="margin:1.5rem 0">
<svg xmlns="http://www.w3.org/2000/svg" class="kd" style="max-width:100%;height:auto;display:block" data-pagefind-ignore width="520" height="476" viewBox="0 0 520 476" role="img" aria-labelledby="kd38-t kd38-d">
<title id="kd38-t">Boucle de réconciliation</title>
<desc id="kd38-d">Un contrôleur observe les objets par watch et cache local, compare l'état souhaité (spec) à l'état observé (status), puis agit via l'API. La boucle recommence à chaque événement. Analogie : un thermostat qui chauffe quand la mesure est sous la consigne ; limite : le contrôleur peut travailler avec un léger retard.</desc>
<style>
svg.kd text{font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;fill:#111827}
svg.kd .bg{fill:#f7f8fb;stroke:#d5dbe5;stroke-width:1.5}
svg.kd .ttl{font-size:19px;font-weight:700}
svg.kd .tb{font-size:17px;font-weight:700}
svg.kd .tb15{font-size:16px;font-weight:700}
svg.kd .t{font-size:16px}
svg.kd .s{font-size:15px;fill:#374151}
svg.kd .ok{fill:#166534;font-weight:700}
svg.kd .bad{fill:#b91c1c;font-weight:700}
svg.kd .k-blue{fill:#e8eefc;stroke:#2f5bd3}
svg.kd .k-teal{fill:#e1f3ef;stroke:#0f766e}
svg.kd .k-violet{fill:#efe9fd;stroke:#6d28d9}
svg.kd .k-amber{fill:#fdf3e1;stroke:#b45309}
svg.kd .k-red{fill:#fdeaea;stroke:#b91c1c}
svg.kd .k-green{fill:#e6f5ea;stroke:#15803d}
svg.kd .k-gray{fill:#ffffff;stroke:#8b97a8}
svg.kd .k-panel{fill:#eef1f6;stroke:#c3cbd8}
svg.kd .dash{stroke-dasharray:6 5}
svg.kd .ln{stroke:#4b5563;stroke-width:2;fill:none}
svg.kd .ln-ok{stroke:#15803d}
svg.kd .ln-bad{stroke:#b91c1c}
svg.kd .life{stroke:#8b97a8;stroke-width:1.5;stroke-dasharray:4 5;fill:none}
svg.kd .ah{fill:#4b5563}
svg.kd .ah-ok{fill:#15803d}
svg.kd .ah-bad{fill:#b91c1c}
svg.kd .bdg{fill:#2f5bd3}
svg.kd .bdg-t{fill:#ffffff;font-size:13px;font-weight:700}
:root[data-theme='dark'] svg.kd text{fill:#f3f4f6}
:root[data-theme='dark'] svg.kd .bg{fill:#111827;stroke:#374151}
:root[data-theme='dark'] svg.kd .s{fill:#d1d5db}
:root[data-theme='dark'] svg.kd .ok{fill:#86efac}
:root[data-theme='dark'] svg.kd .bad{fill:#fca5a5}
:root[data-theme='dark'] svg.kd .k-blue{fill:#1b2a4d;stroke:#8fb1ff}
:root[data-theme='dark'] svg.kd .k-teal{fill:#0f302c;stroke:#5eead4}
:root[data-theme='dark'] svg.kd .k-violet{fill:#2a1f4d;stroke:#c4b5fd}
:root[data-theme='dark'] svg.kd .k-amber{fill:#3a2a10;stroke:#fcd34d}
:root[data-theme='dark'] svg.kd .k-red{fill:#3d1717;stroke:#fca5a5}
:root[data-theme='dark'] svg.kd .k-green{fill:#12321d;stroke:#86efac}
:root[data-theme='dark'] svg.kd .k-gray{fill:#1f2937;stroke:#6b7280}
:root[data-theme='dark'] svg.kd .k-panel{fill:#172030;stroke:#334155}
:root[data-theme='dark'] svg.kd .ln{stroke:#cbd5e1}
:root[data-theme='dark'] svg.kd .ln-ok{stroke:#86efac}
:root[data-theme='dark'] svg.kd .ln-bad{stroke:#fca5a5}
:root[data-theme='dark'] svg.kd .life{stroke:#6b7280}
:root[data-theme='dark'] svg.kd .ah{fill:#cbd5e1}
:root[data-theme='dark'] svg.kd .ah-ok{fill:#86efac}
:root[data-theme='dark'] svg.kd .ah-bad{fill:#fca5a5}
:root[data-theme='dark'] svg.kd .bdg{fill:#8fb1ff}
:root[data-theme='dark'] svg.kd .bdg-t{fill:#0b1220}
@media (prefers-color-scheme:dark){
:root:not([data-theme]) svg.kd text{fill:#f3f4f6}
:root:not([data-theme]) svg.kd .bg{fill:#111827;stroke:#374151}
:root:not([data-theme]) svg.kd .s{fill:#d1d5db}
:root:not([data-theme]) svg.kd .ok{fill:#86efac}
:root:not([data-theme]) svg.kd .bad{fill:#fca5a5}
:root:not([data-theme]) svg.kd .k-blue{fill:#1b2a4d;stroke:#8fb1ff}
:root:not([data-theme]) svg.kd .k-teal{fill:#0f302c;stroke:#5eead4}
:root:not([data-theme]) svg.kd .k-violet{fill:#2a1f4d;stroke:#c4b5fd}
:root:not([data-theme]) svg.kd .k-amber{fill:#3a2a10;stroke:#fcd34d}
:root:not([data-theme]) svg.kd .k-red{fill:#3d1717;stroke:#fca5a5}
:root:not([data-theme]) svg.kd .k-green{fill:#12321d;stroke:#86efac}
:root:not([data-theme]) svg.kd .k-gray{fill:#1f2937;stroke:#6b7280}
:root:not([data-theme]) svg.kd .k-panel{fill:#172030;stroke:#334155}
:root:not([data-theme]) svg.kd .ln{stroke:#cbd5e1}
:root:not([data-theme]) svg.kd .ln-ok{stroke:#86efac}
:root:not([data-theme]) svg.kd .ln-bad{stroke:#fca5a5}
:root:not([data-theme]) svg.kd .life{stroke:#6b7280}
:root:not([data-theme]) svg.kd .ah{fill:#cbd5e1}
:root:not([data-theme]) svg.kd .ah-ok{fill:#86efac}
:root:not([data-theme]) svg.kd .ah-bad{fill:#fca5a5}
:root:not([data-theme]) svg.kd .bdg{fill:#8fb1ff}
:root:not([data-theme]) svg.kd .bdg-t{fill:#0b1220}
}
</style>
<defs>
<marker id="kd38-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah"/></marker>
<marker id="kd38-a-ok" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah-ok"/></marker>
<marker id="kd38-a-bad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah-bad"/></marker>
</defs>
<rect x="1" y="1" width="518" height="474" rx="14" class="bg"/>
<text x="20" y="34" class="ttl">Boucle de réconciliation</text>
<rect x="20" y="58" width="400" height="64" rx="10" class="k-blue" stroke-width="1.6"/>
<circle cx="44" cy="90.0" r="11" class="bdg"/>
<text x="44" y="94.6" class="bdg-t" text-anchor="middle">1</text>
<text x="66" y="85.5" class="tb" text-anchor="start">Observer</text>
<text x="66" y="105.1" class="s" text-anchor="start">watch des objets, cache local</text>
<rect x="20" y="162" width="400" height="64" rx="10" class="k-amber" stroke-width="1.6"/>
<circle cx="44" cy="194.0" r="11" class="bdg"/>
<text x="44" y="198.6" class="bdg-t" text-anchor="middle">2</text>
<text x="66" y="189.5" class="tb" text-anchor="start">Comparer</text>
<text x="66" y="209.1" class="s" text-anchor="start">souhaité (spec) ≠ observé (status) ?</text>
<rect x="20" y="266" width="400" height="64" rx="10" class="k-green" stroke-width="1.6"/>
<circle cx="44" cy="298.0" r="11" class="bdg"/>
<text x="44" y="302.6" class="bdg-t" text-anchor="middle">3</text>
<text x="66" y="293.5" class="tb" text-anchor="start">Agir via l'API</text>
<text x="66" y="313.1" class="s" text-anchor="start">créer, supprimer ou mettre à jour</text>
<path d="M220,124 L220,160" class="ln" marker-end="url(#kd38-a)"/>
<path d="M220,228 L220,264" class="ln" marker-end="url(#kd38-a)"/>
<path d="M422,298 L466,298 L466,90 L424,90" class="ln" marker-end="url(#kd38-a)"/>
<text x="490" y="194" class="s" text-anchor="middle" transform="rotate(-90 490 194)">à chaque événement</text>
<rect x="20" y="356" width="480" height="100" rx="10" class="k-gray" stroke-width="1.6"/>
<text x="34" y="382.3" class="tb15" text-anchor="start">Analogie : le thermostat</text>
<text x="34" y="401.6" class="s" text-anchor="start">Consigne 20 °C, mesure 18 °C : il chauffe.</text>
<text x="34" y="420.6" class="s" text-anchor="start">Limite : un contrôleur lit un cache et réagit</text>
<text x="34" y="439.6" class="s" text-anchor="start">à des événements, parfois avec retard.</text>
</svg>
</div>

Un thermostat compare une consigne à une mesure, puis agit. Un contrôleur fait de même entre `spec` (souhaité) et `status` (observé), mais il travaille avec des **événements**, un **cache**, une file de travail, des nouvelles tentatives et des resynchronisations. Il ne relit pas etcd toutes les deux secondes, et ses observations peuvent être momentanément périmées. Le système devient **cohérent à terme**, à condition que les dépendances soient disponibles.

Un objet possède des `metadata` (identité), un `spec` (intention) et souvent un `status` publié par le composant responsable. Le `status` n'est pas une consigne : l'éditer ne « rend » pas une application Ready.

### 4.4 Parcours d'un `kubectl apply`, étape par étape

Ce qui se passe quand vous appliquez le Deployment `web` à trois répliques :

| # | Composant | Action | Ce que vous pouvez observer |
|---|---|---|---|
| 1 | kubectl → API Server | Envoie le Deployment `web` (`replicas: 3`) | `kubectl apply` répond `created` ou `configured` |
| 2 | API Server | Authentifie, autorise, admet, valide, puis enregistre dans etcd | L'objet existe : `get deploy web` |
| 3 | Contrôleur Deployment | Crée le ReplicaSet correspondant au template de Pod | `get rs -l app=web` |
| 4 | Contrôleur ReplicaSet | Crée les Pods manquants | `get pods` : Pods en `Pending` |
| 5 | Scheduler | Affecte chaque Pod à un nœud compatible | Colonne `NODE` de `get pods -o wide` |
| 6 | kubelet | Lance les conteneurs via le runtime, puis publie conditions et états | `READY 1/1`, événements du Pod |

Chaque contrôleur passe **par l'API** ; aucun n'écrit directement dans les fichiers d'etcd. L'étape 1 peut réussir alors que l'étape 5 échoue (pas de nœud compatible) : d'où l'importance de vérifier jusqu'au bout.

### 4.5 Pratiquer et vérifier

```bash title="Poste d'administration · cluster kind du chapitre 3"
kubectl --context kind-formation -n atelier get deploy web -o yaml
kubectl --context kind-formation -n atelier get rs -l app=web
kubectl --context kind-formation -n atelier get pods -l app=web -o wide
kubectl --context kind-formation -n atelier get pods -l app=web -o jsonpath='{range .items[*]}{.metadata.name}{" -> "}{.metadata.ownerReferences[0].kind}{"/"}{.metadata.ownerReferences[0].name}{"\n"}{end}'
```

**Résultat attendu :** chaque ligne de la dernière commande affiche `NOM_DU_POD -> ReplicaSet/web-…`. Le ReplicaSet référence à son tour le Deployment : c'est la chaîne de propriété **Deployment → ReplicaSet → Pod**.

**Vérifier :** trois Pods présents ne prouvent pas trois Pods prêts. Contrôlez la colonne `READY`, les conditions et les EndpointSlices.

**Exercice (A02).** Supprimez un seul Pod de laboratoire, observez le nouvel UID et la chaîne de contrôle ; gardez les événements horodatés.

:::caution[Erreur fréquente : « le Pod a été recréé »]
Un crash ou un OOM fait **redémarrer le conteneur dans le même Pod** (même UID), sous l'action du kubelet. Le ReplicaSet crée un **autre** Pod seulement quand le nombre de Pods actifs devient insuffisant, par exemple après une suppression. Une panne de nœud implique détection, éviction éventuelle, contrôleur, capacité et stockage disponibles : les Pods ne « déménagent » pas avec leur UID.
:::

**Sources :** [composants](https://v1-35.docs.kubernetes.io/docs/concepts/overview/components/), [contrôleurs](https://v1-35.docs.kubernetes.io/docs/concepts/architecture/controller/), [ReplicaSet](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/controllers/replicaset/), [cycle des Pods](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/).

<a id="chapitre-05"></a>

## 5. Objets, labels, namespaces et gestion déclarative

**En bref.** Tout ce que Kubernetes gère est un **objet** décrit en YAML. Les **labels** permettent de sélectionner des groupes d'objets ; les **namespaces** délimitent des périmètres de noms et de droits. Bien les comprendre évite deux erreurs coûteuses : agir sur le mauvais cluster et supprimer le mauvais groupe.

### 5.1 Identifier et sélectionner

| Notion | Rôle | Point d'attention |
|---|---|---|
| Nom | Étiquette lisible, unique par type et namespace | Un même nom peut désigner deux objets successifs |
| UID (*Unique Identifier*) | Distingue deux « incarnations » d'un même nom | Un Pod remplacé a un nouvel UID |
| Label | Information structurée utilisée par les **selectors** | Deux applications qui réutilisent `app: web` reçoivent le même trafic |
| Annotation | Métadonnée libre, non utilisée pour sélectionner | — |

Le selector d'un Service fonctionne comme une **adresse de groupe** : il choisit les Pods étiquetés, quel que soit leur contrôleur.

Un **namespace** est un périmètre de noms, de nombreux droits et de quotas — **pas une frontière de sécurité complète**. Les Nodes, PV, StorageClasses et ClusterRoles sont des objets globaux. Pour isoler une équipe, combinez namespaces, RBAC, PSA, NetworkPolicies, quotas, politique d'admission, voire des clusters séparés.

### 5.2 Pratiquer sans ambiguïté de contexte

```bash title="Poste d'administration"
kubectl config get-contexts
kubectl --context kind-formation -n atelier get deploy,rs,pods,svc,cm
kubectl --context kind-formation api-resources --namespaced=true
kubectl --context kind-formation explain deployment.spec.strategy
kubectl --context kind-formation -n atelier get pods --show-labels
```

**À retenir de ces commandes :**

- Lisez `config get-contexts` **avant toute opération** : l'astérisque indique le contexte courant. Le guide écrit toujours `--context` et `-n` explicitement.
- `kubectl get all` ne montre pas « tout » : Secrets, RBAC, quotas, PVC et NetworkPolicies doivent être demandés explicitement.
- `kubectl explain` interroge **votre** serveur : il évite d'utiliser un champ absent de sa version.

**Anatomie d'un manifeste.** Les cinq ressources de base sont dans `manifests/base/`. `apiVersion` désigne le groupe et la version de l'API, `kind` le type, `metadata` l'identité, `spec` les paramètres. Une **CRD** (*Custom Resource Definition*) ajoute un nouveau type ; elle n'installe pas le contrôleur qui le réconcilie.

### 5.3 Approfondir : propriété et source de vérité

| Champ | Utilité | À ne pas faire |
|---|---|---|
| `ownerReferences` | Supprimer automatiquement les objets dépendants (*garbage collection*) | — |
| `finalizers` | Retarder une suppression le temps d'un nettoyage | Les retirer aveuglément : ressources externes ou disques abandonnés |
| `resourceVersion` | Concurrence optimiste et watches | L'interpréter comme une horloge : c'est une valeur opaque |
| `generation` / `observedGeneration` | Vérifier que le contrôleur a traité la dernière version du `spec` | — |

Le YAML stocké dans **Git** est la source déclarative durable. L'API conserve l'état souhaité actif ; sans réconciliateur GitOps, elle ne relit pas le dépôt. Le chapitre 14 montre comment ramener une modification urgente dans Git. Ne modifiez pas directement un ReplicaSet géré par un Deployment : le contrôleur parent annulera votre changement.

:::tip[À retenir]
Avant toute suppression par selector, exécutez un `get` avec **le même selector**, et vérifiez le contexte et le namespace.
:::

**Sources :** [objets](https://v1-35.docs.kubernetes.io/docs/concepts/overview/working-with-objects/), [labels/selectors](https://v1-35.docs.kubernetes.io/docs/concepts/overview/working-with-objects/labels/), [namespaces](https://v1-35.docs.kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/), [garbage collection](https://v1-35.docs.kubernetes.io/docs/concepts/architecture/garbage-collection/).

<a id="chapitre-06"></a>

## 6. Pods : processus, probes et arrêt maîtrisé

**En bref.** Le Pod est la plus petite unité planifiée par Kubernetes. Comprendre ce que ses conteneurs partagent, comment les **probes** décident de son trafic et de ses redémarrages, et comment il s'arrête, c'est éviter la majorité des incidents applicatifs.

### 6.1 Ce qu'est un Pod

Comme des colocataires partageant une adresse, les conteneurs d'un Pod partagent **le réseau et l'IP**, et accèdent aux mêmes volumes **s'ils les montent**. Ils n'ont pas automatiquement le même système de fichiers racine ni un espace de processus commun. Deux conteneurs du même Pod ne peuvent pas écouter sur le même couple IP/port.

| Élément | Comportement | Usage |
|---|---|---|
| Conteneur principal | Exécute le service ou la tâche | nginx du laboratoire |
| Init container classique | Doit se terminer avec succès avant le suivant et avant les conteneurs principaux | Préparer des fichiers ; toute attente doit être bornée |
| Sidecar natif | Init container avec `restartPolicy: Always` : il reste actif | Proxy ou agent lié au cycle du Pod, avec une sémantique adaptée aux Jobs |
| Conteneur éphémère | Ajouté à un Pod existant pour le diagnostic | Débogage avec droits contrôlés ; pas un redéploiement durable |

**Logs.** Le pattern historique « un sidecar fait `tail` du même fichier » échoue si le fichier n'existe pas encore. Pour le nginx du guide, les logs vont sur stdout/stderr et sont collectés au niveau de la plateforme : aucun sidecar de logs n'est requis pour débuter. Un sidecar n'apporte à lui seul ni collecte centrale, ni rotation, ni rétention.

### 6.2 Le Pod du laboratoire

Le fichier `manifests/base/deployment-web.yaml` est complet et inclut le template de Pod. Ses choix de sécurité :

- UID 101, port 8080, aucun montage du jeton ServiceAccount ;
- capabilities retirées, seccomp `RuntimeDefault`, système de fichiers racine en lecture seule ;
- `command: [nginx]` évite les scripts d'entrée qui voudraient modifier `/etc` ;
- le PID et les fichiers temporaires de cette image *unprivileged* sont sous `/tmp`, monté en `emptyDir` ;
- la configuration et le HTML sont deux projections distinctes de la ConfigMap `web-config`.

### 6.3 Les trois probes : trois questions différentes

| Probe | Question posée | En cas d'échec | Limite de l'exemple |
|---|---|---|---|
| `startupProbe` `/healthz` | Le démarrage est-il assez avancé pour accepter HTTP ? | Redémarrage du conteneur après le budget d'échecs ; bloque les deux autres probes tant qu'elle n'a pas réussi | 30 essais × 2 s : un budget approximatif, pas un délai garanti |
| `readinessProbe` `/ready` | Ce Pod doit-il recevoir du **nouveau** trafic du Service ? | Condition Ready à faux, endpoint marqué non prêt — **sans redémarrage** | La route renvoie 200 ; elle ne vérifie aucune base externe |
| `livenessProbe` `/healthz` | Le processus est-il bloqué au point de devoir redémarrer ? | Redémarrage du conteneur après le seuil | Ne doit pas échouer à cause d'une dépendance distante |

Les trois routes sont définies dans `configmap-web.yaml` : un nginx standard n'offre pas `/ready` de lui-même. Une readiness qui dépend d'une base peut être pertinente, mais si elle échoue sur **toutes** les répliques en même temps, elle retire tous les endpoints. La liveness doit rester **locale**, sinon une panne externe déclenche une cascade de redémarrages.

```bash title="Poste d'administration · la requête s'exécute dans le Pod client"
kubectl --context kind-formation -n atelier exec deploy/client -- curl -fsS http://web/healthz
kubectl --context kind-formation -n atelier exec deploy/client -- curl -fsS http://web/ready
kubectl --context kind-formation -n atelier get pods -l app=web
kubectl --context kind-formation -n atelier describe deploy web
```

**Résultat attendu :** `alive`, puis `ready`, et trois répliques disponibles après `minReadySeconds`. Ces sorties ne valident pas l'arrêt gracieux : le chapitre 13 mesure le trafic pendant une perturbation.

**Si une probe échoue :** conservez les événements et `lastState`, comparez chemin, port et configuration, puis corrigez **la plus petite différence**. N'allongez pas les délais pour masquer un 404 permanent.

### 6.4 États et arrêt du Pod

| Ce que vous voyez | Ce que c'est |
|---|---|
| `Pending`, `Running`, `Succeeded`, `Failed`, `Unknown` | Les cinq **phases** du Pod |
| `Running` | Au moins un conteneur tourne — **pas** forcément Ready |
| `CrashLoopBackOff`, `ImagePullBackOff` | Raisons liées à l'état d'un **conteneur**, pas des phases |

Un Pod isolé peut redémarrer son conteneur selon sa `restartPolicy` ; s'il est supprimé, aucun contrôleur ne le recrée. Dans un Deployment, `restartPolicy: Always` s'applique aux conteneurs classiques.

**Arrêt normal.** Le délai de grâce couvre les hooks et l'arrêt :

1. le Pod est marqué en terminaison et retiré progressivement des endpoints ;
2. le hook `preStop` attend 5 s pour laisser ce retrait se propager, puis envoie `nginx -s quit` ;
3. le délai de grâce de 30 s doit couvrir les requêtes en cours et le hook ;
4. au-delà, un arrêt forcé reste possible.

Un `sleep` choisi sans mesure ne prouve pas un drainage complet ; testez spécifiquement les connexions longues.

:::note[Pour aller plus loin]
Remplacer un point de santé synthétique par un point applicatif suppose de définir ce qui rend l'application **utile**. Une réponse HTTP 200 de la page d'accueil peut masquer un service métier hors d'usage.
:::

**Sources :** [Pods](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/pods/), [cycle et terminaison](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/), [probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/), [sidecars](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/), [image nginx unprivileged](https://github.com/nginx/docker-nginx-unprivileged).

<a id="chapitre-07"></a>

## 7. Workloads : choisir le bon contrôleur

**En bref.** On ne crée presque jamais un Pod seul : on choisit un **contrôleur** adapté au besoin. Chaque contrôleur assure certaines choses ; le reste (réplication des données, idempotence…) reste à concevoir.

### 7.1 Comparer avant de déployer

| Besoin | Objet | Ce qu'il assure | Ce qu'il faut encore concevoir |
|---|---|---|---|
| Service interchangeable, sans état local | Deployment → ReplicaSet | Nombre de répliques et stratégie de remplacement | Capacité, état externalisé, santé, compatibilité des versions |
| Identité et stockage par instance | StatefulSet | Noms ordinaux, PVC par instance, ordre par défaut | Réplication, quorum, promotion, sauvegarde applicatives |
| Un agent par nœud éligible | DaemonSet | Un Pod sur chaque nœud sélectionné et toléré | Accès hôte justifiés, RBAC, sécurité de la collecte |
| Travail qui se termine | Job | Suivi des réussites et des tentatives | Idempotence et doublons |
| Travail planifié | CronJob | Création de Jobs selon un calendrier | Exécution « au moins une fois », surveillance |

### 7.2 Deployment et ReplicaSet

Le Deployment de base gère **trois répliques** et garde jusqu'à cinq anciennes révisions de ReplicaSet. Seul un changement du **template de Pod** crée une nouvelle révision ; modifier le nombre de répliques n'en crée pas. Un ReplicaSet seul maintient un effectif, sans orchestrer les mises à jour. Le chapitre 13 détaille `maxSurge`, `maxUnavailable` et le retour arrière.

```bash title="Poste d'administration · impératif pour apprendre, puis retour à Git (§14)"
kubectl --context kind-formation -n atelier scale deploy web --replicas=4
kubectl --context kind-formation -n atelier rollout status deploy/web --timeout=180s
kubectl --context kind-formation -n atelier get deploy,rs,pods -l app=web
# Retour à l'intention versionnée : trois répliques.
kubectl --context kind-formation apply -k manifests/overlays/lab
```

**Résultat attendu :** 4 Pods prêts après le `scale`, **sans nouveau ReplicaSet** ; puis retour à 3 après `apply -k`.

### 7.3 StatefulSet : identité stable, pas réplication

L'exemple `manifests/storage/statefulset.yaml` utilise BusyBox et deux PVC pour étudier **l'identité et la persistance**, sans prétendre fabriquer une base répliquée :

- `registre-0` et `registre-1` écrivent leur hostname **chacun dans son propre volume** ; les données ne sont pas échangées ;
- ils n'écoutent pas sur 8080 : le port du Service headless sert à étudier DNS, pas à promettre un serveur HTTP ;
- au chapitre 11, supprimer un Pod puis relire son fichier prouve la persistance sur son volume, **pas la réplication**.

Pour MySQL, plusieurs instances initialisées avec le même mot de passe ne forment pas un groupe répliqué. Il faut configurer identifiants, rôle primaire/répliques, réplication, routage des écritures, prévention des doubles primaires et promotion. Un Operator adapté peut automatiser une partie de ces opérations, après vérification de ses garanties.

### 7.4 DaemonSet, Job et CronJob

- **DaemonSet** (`manifests/workloads/daemonset.yaml`) : un processus neutre sur chaque worker éligible, sans `hostNetwork`, `hostPID` ni `hostPath`. Le taint du control plane le rend normalement inéligible : « un Pod par nœud » doit toujours préciser sélection et tolérances. Un exporteur de métriques hôte demande un namespace d'exception contrôlé (§15 et §17).
- **Job indexé** (`job.yaml`) : `completionMode: Indexed`, quatre index, deux Pods en parallèle, tentatives limitées, échéance et nettoyage TTL. Sans `Indexed`, l'annotation d'index n'existe pas. Une migration doit être idempotente et coordonnée avec la base : deux exécutions peuvent se chevaucher malgré les paramètres Kubernetes.
- **CronJob** (`cronjob.yaml`) : `timeZone: Etc/UTC`, `concurrencyPolicy: Forbid`, échéances et historique. `Forbid` n'empêche pas un Job **créé manuellement** de chevaucher un autre ; la planification ne garantit pas une exécution « exactement une fois ». L'ancien `pg_dump` non vérifié est remplacé par une tâche neutre ; une vraie sauvegarde est traitée au chapitre 20.

```bash title="Poste d'administration · exemples complémentaires verrouillés"
kubectl --context kind-formation apply -k manifests/overlays/complements
kubectl --context kind-formation -n atelier wait job/lot --for=condition=Complete --timeout=150s
kubectl --context kind-formation -n atelier logs job/lot --all-pods=true
kubectl --context kind-formation -n atelier get ds,sts,pvc,cronjob
kubectl --context kind-formation -n atelier create job horloge-manuel --from=cronjob/horloge
kubectl --context kind-formation -n atelier logs job/horloge-manuel --follow
```

**Résultat attendu :** `job.batch/lot condition met`, les logs des Pods du Job, le DaemonSet avec un Pod par worker éligible, les PVC du StatefulSet en `Bound`, puis la sortie du Job manuel.

**Nettoyage (poste d'administration) :** supprimez le Job manuel, puis `kubectl --context kind-formation delete -k manifests/overlays/complements`. Les PVC du StatefulSet sont en **Retain** et restent présents : inventoriez-les et ne les supprimez qu'après l'atelier stockage et la vérification de leur contenu.

**Sources :** [Deployment](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/controllers/deployment/), [StatefulSet](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/controllers/statefulset/), [application stateful répliquée](https://kubernetes.io/docs/tasks/run-application/run-replicated-stateful-application/), [DaemonSet](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/controllers/daemonset/), [Jobs](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/controllers/job/), [CronJobs](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/).


<a id="chapitre-08"></a>

## 8. Ressources, placement et autoscaling

**En bref.** Le scheduler place les Pods selon leurs **réservations** (*requests*), pas selon leur consommation réelle. Bien régler requests, limites et contraintes de placement, c'est éviter des Pods `Pending`, des arrêts OOM et une fausse redondance.

### 8.1 Réserver n'est pas mesurer

Comme une réservation de places, une **request** sert à décider où un Pod peut être accueilli ; elle ne mesure pas sa consommation instantanée. Une **limite CPU** peut ralentir le conteneur (*throttling*) ; une **limite mémoire** peut déclencher un arrêt **OOM** (*Out Of Memory*). L'**allocatable** d'un nœud est inférieur à sa capacité matérielle, car le système et Kubernetes ont eux-mêmes besoin de ressources.

| Paramètre | Effet | Preuve utile |
|---|---|---|
| requests CPU/mémoire | Base du scheduling et de certains calculs HPA | `describe node`, `describe pod`, ressources du template |
| limits CPU | Plafond d'exécution CPU (mécanismes du noyau) | Throttling et latence applicative, pas seulement la moyenne CPU |
| limits mémoire | Plafond ; arrêt OOM possible | `lastState.reason`, événements, mesures mémoire |
| ephemeral-storage | Stockage temporaire, logs, et leurs limites | Condition DiskPressure, espace et inodes, évictions |
| ResourceQuota | Budget cumulé d'un namespace | `describe quota`, refus à l'admission |
| LimitRange | Valeurs par défaut et bornes dans un namespace | Lire le Pod **admis**, pas seulement le YAML d'entrée |

**Classes QoS** (*Quality of Service*) : Guaranteed, Burstable, BestEffort. Dans le cas usuel, `requests = limits` pour le CPU **et** la mémoire de chaque conteneur donne Guaranteed. Guaranteed ne garantit ni l'absence d'éviction, ni la haute disponibilité. Les Pods du fil rouge sont **Burstable** : leurs réservations et leurs plafonds diffèrent.

### 8.2 Pratiquer les budgets

```bash title="Poste d'administration · atelier déjà déployé"
kubectl --context kind-formation -n atelier apply -f manifests/resources/quota.yaml
kubectl --context kind-formation -n atelier describe resourcequota budget
kubectl --context kind-formation -n atelier describe limitrange defauts
kubectl --context kind-formation describe node formation-worker
```

**Interpréter :** dans `describe node`, comparez **Allocated resources** (requests déjà réservées) à **Allocatable**. Un nœud peu chargé peut refuser un Pod si ses requests sont déjà engagées. Le quota fixe une limite d'équipe ; il ne crée aucun nœud.

**Nettoyage :** `kubectl --context kind-formation -n atelier delete -f manifests/resources/quota.yaml` depuis le poste, pour reprendre les exercices hors budget.

### 8.3 Placement et domaines de panne

| Mécanisme | Effet |
|---|---|
| `nodeSelector` | Impose des labels de nœud |
| Affinité / anti-affinité | Exprime des préférences ou contraintes ; peut séparer des Pods similaires |
| Taint + toleration | Le taint repousse les Pods ; la toleration **autorise** un placement sans le forcer |
| `topologySpreadConstraints` | Répartit les Pods selon une clé (`kubernetes.io/hostname`, `topology.kubernetes.io/zone`) |

Le template `web` utilise `maxSkew: 1` avec `ScheduleAnyway` : c'est une **préférence** de répartition, pas une interdiction de regrouper. Avec `DoNotSchedule`, une répartition stricte peut laisser des Pods `Pending` si les domaines ou ressources requis disparaissent — ce qui peut être préférable à une fausse redondance. Attention : une étiquette de zone posée sur des nœuds du même PC ne crée pas une zone indépendante.

```bash title="Poste d'administration · étiquette de LAB, pas un domaine physique"
kubectl --context kind-formation label node formation-worker disque=ssd-lab --overwrite
kubectl --context kind-formation get nodes --show-labels
kubectl --context kind-formation -n atelier get pods -l app=web -o wide
# Nettoyage label.
kubectl --context kind-formation label node formation-worker disque-
```

L'atelier A06 ajoute puis retire une contrainte de placement ; le diagnostic d'un Pod `Pending` s'appuie sur les événements `FailedScheduling`. Ne résolvez pas une saturation en supprimant toutes les requests : vous masqueriez le risque de surréservation (*overcommit*).

### 8.4 HPA et dépendance à metrics-server

Le **HPA** (*Horizontal Pod Autoscaler*) ajuste le nombre de Pods selon une métrique. Il ne fournit pas de capacité aux nœuds et ne configure pas la réplication d'une base. Le manifeste `manifests/resources/hpa.yaml` utilise l'API stable `autoscaling/v2` : CPU à 70 % **de la request**, minimum 3 et maximum 6 répliques, stabilisation de la descente sur 180 s.

**Prérequis :** l'API `metrics.k8s.io` servie par un metrics-server compatible et joignable. Sans elle, la cible affiche `<unknown>` : ce n'est pas une preuve d'autoscaling.

```bash title="Poste d'administration · lecture avant d'activer le HPA (optionnel)"
kubectl --context kind-formation get apiservice v1beta1.metrics.k8s.io
kubectl --context kind-formation top nodes
kubectl --context kind-formation top pods -n atelier
# Seulement si métriques opérationnelles :
kubectl --context kind-formation -n atelier apply -f manifests/resources/hpa.yaml
kubectl --context kind-formation -n atelier describe hpa web
```

L'installation optionnelle de Metrics Server, avec vérification TLS de bout en bout, est détaillée en [§8.5](#metrics-server). Pour revenir à une gestion sans HPA : supprimez `hpa web`, puis réappliquez la base pour fixer à nouveau 3 répliques. En GitOps, laissez le HPA posséder le nombre de répliques : un `apply` régulier de `replicas` le combattrait.

:::tip[À retenir]
Un objectif de disponibilité est impossible si la dernière machine survivante ne peut pas accueillir les charges déplacées **et** le surplus de la mise à jour.
:::

**Sources :** [requests/limits](https://v1-35.docs.kubernetes.io/docs/concepts/configuration/manage-resources-containers/), [QoS](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/pods/pod-qos/), [placement](https://v1-35.docs.kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/), [topology spread](https://v1-35.docs.kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/), [taints](https://v1-35.docs.kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/), [HPA](https://v1-35.docs.kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/), [metrics-server](https://github.com/kubernetes-sigs/metrics-server).

<a id="metrics-server"></a>

### 8.5 Complément optionnel : Metrics Server et HPA avec TLS vérifié

**À quoi ça sert.** Metrics Server fournit les métriques instantanées utilisées par le HPA et `kubectl top` (pas d'historique). Ce parcours avancé prépare A06 et A12 sur **kind-formation 1.35.8** ; il ne fait pas partie du premier démarrage.

**Version retenue : 0.9.0**, compatible avec Kubernetes 1.34+ selon la matrice officielle et incluant des correctifs de sécurité. Le manifeste amont, son SHA-256 publié et vérifié, et l'image résolue en digest sont conservés dans `vendor/metrics-server/`. Vérification documentaire et statique le **16 octobre 2026 ; procédure non exécutée en cluster**. [Programme et compatibilités](https://github.com/kubernetes-sigs/metrics-server), [release 0.9.0](https://github.com/kubernetes-sigs/metrics-server/releases/tag/v0.9.0).

**Comment ça fonctionne : deux connexions, deux garanties.**

| Connexion | Ce qui est vérifié |
|---|---|
| Metrics Server → kubelet | Certificat serveur du kubelet signé par la CA Kubernetes, avec les IP des nœuds dans ses SAN |
| API Server → Metrics Server | Certificat signé par une **CA dédiée au seul laboratoire** |

Le rendu final n'utilise ni la clé privée de la CA Kubernetes, ni `--kubelet-insecure-tls`, ni `insecureSkipTLSVerify: true`.

**Prérequis :** Bash Linux/WSL, Docker, kind, kubectl, Python 3 et PyYAML, OpenSSL 3 ; cluster sain avec au moins 200 Mi de mémoire réservable en plus.

**Étape 1 — Préparer les kubelets, un à la fois.** `serverTLSBootstrap` dépend de `RotateKubeletServerCertificate`, **bêta et activé par défaut en 1.35** ; si ce gate est désactivé, revoyez le périmètre. Le script vérifie le nom, le label Docker et la version du nœud, sauvegarde sa configuration, active `serverTLSBootstrap` dans son fichier et dans le ConfigMap partagé, puis redémarre **ce seul** kubelet. Il refuse une configuration TLS explicite inattendue. Répétez la séquence complète pour chaque nœud listé ; n'automatisez pas l'approbation dans une boucle. [TLS bootstrap 1.35](https://v1-35.docs.kubernetes.io/docs/reference/access-authn-authz/kubelet-tls-bootstrapping/), [feature gates 1.35](https://v1-35.docs.kubernetes.io/docs/reference/command-line-tools-reference/feature-gates/).

```bash title="Poste d'administration · racine du dossier associé"
kind get nodes --name formation
NODE=formation-control-plane
CONFIRMER_KIND_METRICS=formation bash scripts-metrics/enable-serving-bootstrap.sh "$NODE"
kubectl --context kind-formation get csr
read -r -p 'Nom exact de la CSR kubelet-serving de ce nœud : ' CSR
python3 scripts-metrics/inspect-csr.py "$CSR" "$NODE"
docker inspect "$NODE" --format '{{json .NetworkSettings.Networks}}'
```

**Contrôle humain obligatoire avant d'approuver** : demandeur `system:node:NODE`, groupe `system:nodes`, signer `kubernetes.io/kubelet-serving`, usages serveur, sujet, et **tous** les SAN comparés aux adresses du Node et du conteneur Docker. Le helper fait des contrôles préalables mais n'approuve rien. Une incohérence impose d'arrêter la procédure, pas d'assouplir TLS.

```bash title="Poste d'administration · seulement après inspection de CETTE CSR"
kubectl --context kind-formation certificate approve "$CSR"
kubectl --context kind-formation wait --for=jsonpath='{.status.certificate}' "csr/$CSR" --timeout=60s
kubectl --context kind-formation get csr "$CSR" -o jsonpath='{.status.certificate}' | base64 --decode > ".secrets/metrics-server/csr/$CSR.crt"
test -s ".secrets/metrics-server/csr/$CSR.crt"
openssl x509 -in ".secrets/metrics-server/csr/$CSR.crt" -noout -subject -issuer -ext subjectAltName
kubectl --context kind-formation -n kube-system get cm kube-root-ca.crt -o jsonpath='{.data.ca\.crt}' > .secrets/metrics-server/cluster-ca.crt
NODE_IP=$(kubectl --context kind-formation get node "$NODE" -o jsonpath='{.status.addresses[?(@.type=="InternalIP")].address}')
openssl verify -CAfile .secrets/metrics-server/cluster-ca.crt -verify_ip "$NODE_IP" ".secrets/metrics-server/csr/$CSR.crt"
kubectl --context kind-formation wait --for=condition=Ready "node/$NODE" --timeout=180s
```

**Résultat attendu :** `openssl verify` répond `OK` pour l'IP du nœud, puis le nœud est Ready. Si le fichier de certificat est vide, consultez le signer et les journaux, puis relisez cette CSR. Passez ensuite à `formation-worker`, puis `formation-worker2` s'ils existent, avec la même inspection explicite. Chaque renouvellement demandera une nouvelle approbation : ce mécanisme manuel n'est pas une politique d'exploitation durable. [Certificats de serveur kubelet](https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/#kubelet-serving-certs).

**Étape 2 — Établir le TLS du serveur de métriques.** Le script génère dans `.secrets/metrics-server` une CA locale valable 30 jours et un certificat serveur de 14 jours couvrant les deux noms DNS du Service ; il vérifie ces noms et refuse d'écraser des clés existantes. Le *renderer* conserve les droits amont, ajoute le montage d'un Secret lisible par UID/GID 1000, utilise les InternalIP et la CA publique du ServiceAccount pour vérifier les kubelets, puis injecte la CA dédiée dans l'APIService.

```bash title="Poste d'administration · les clés générées restent hors Git"
(cd vendor/metrics-server && sha256sum --check components.sha256)
# Résolution à refaire seulement lors d'une mise à jour approuvée du verrou :
# python3 scripts-metrics/resolve-image.py
bash scripts-metrics/prepare-tls.sh
python3 scripts-metrics/render-secure.py
kubectl --context kind-formation -n kube-system create secret tls metrics-server-tls --cert=.secrets/metrics-server/tls.crt --key=.secrets/metrics-server/tls.key --dry-run=client -o yaml | kubectl --context kind-formation -n kube-system apply -f -
kubectl --context kind-formation apply --dry-run=server -f .secrets/metrics-server/components-tls.yaml
kubectl --context kind-formation apply -f .secrets/metrics-server/components-tls.yaml
kubectl --context kind-formation -n kube-system rollout status deploy/metrics-server --timeout=180s
kubectl --context kind-formation wait --for=condition=Available apiservice/v1beta1.metrics.k8s.io --timeout=180s
```

**Étape 3 — Vérifier, puis pratiquer le HPA.** Attendez plusieurs collectes, puis comparez métriques brutes, `top` et conditions du HPA. Sans charge, un HPA reste à son minimum : sa présence ne prouve pas une montée en répliques.

```bash title="Poste d'administration"
kubectl --context kind-formation get --raw /apis/metrics.k8s.io/v1beta1/nodes
kubectl --context kind-formation top nodes
kubectl --context kind-formation -n atelier top pods
kubectl --context kind-formation -n atelier apply -f manifests/resources/hpa.yaml
kubectl --context kind-formation -n atelier describe hpa web
kubectl --context kind-formation -n kube-system logs deploy/metrics-server --tail=100
```

**En cas d'échec**, distinguez : absence de signature, SAN/IP incorrect, mauvaise CA, délégation d'authentification, APIService indisponible, flux TCP 10250 bloqué. Inspectez `describe apiservice` et les journaux du kubelet ; ne désactivez jamais TLS. Lors d'un renouvellement, gardez le Secret et le `caBundle` cohérents, puis refaites tous les contrôles.

**Nettoyage :** supprimez le HPA, réappliquez l'overlay web, supprimez le rendu Metrics Server et son Secret. Les kubelets gardent leurs certificats signés ; la remise à zéro complète est la reconstruction du seul cluster kind `formation` depuis ses sources connues.

<a id="chapitre-09"></a>

## 9. Réseau des Pods, Services, DNS et NetworkPolicies

**En bref.** Les Pods changent d'adresse ; le **Service** offre une identité réseau stable. Les **NetworkPolicies** filtrent ensuite le trafic — à condition que le plugin réseau les applique et qu'on le prouve par un refus réel.

### 9.1 Comprendre le chemin d'une requête

<div class="not-content kd-figure" style="margin:1.5rem 0">
<svg xmlns="http://www.w3.org/2000/svg" class="kd" style="max-width:100%;height:auto;display:block" data-pagefind-ignore width="520" height="512" viewBox="0 0 520 512" role="img" aria-labelledby="kd39-t kd39-d">
<title id="kd39-t">Du nom DNS au Pod prêt</title>
<desc id="kd39-d">Le Pod client résout le nom web auprès de CoreDNS, se connecte à la ClusterIP du Service web sur le port 80, puis le dataplane choisit une adresse publiée dans l'EndpointSlice. Seuls les Pods Ready sur le port 8080 reçoivent du trafic ; un Pod non prêt est exclu.</desc>
<style>
svg.kd text{font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;fill:#111827}
svg.kd .bg{fill:#f7f8fb;stroke:#d5dbe5;stroke-width:1.5}
svg.kd .ttl{font-size:19px;font-weight:700}
svg.kd .tb{font-size:17px;font-weight:700}
svg.kd .tb15{font-size:16px;font-weight:700}
svg.kd .t{font-size:16px}
svg.kd .s{font-size:15px;fill:#374151}
svg.kd .ok{fill:#166534;font-weight:700}
svg.kd .bad{fill:#b91c1c;font-weight:700}
svg.kd .k-blue{fill:#e8eefc;stroke:#2f5bd3}
svg.kd .k-teal{fill:#e1f3ef;stroke:#0f766e}
svg.kd .k-violet{fill:#efe9fd;stroke:#6d28d9}
svg.kd .k-amber{fill:#fdf3e1;stroke:#b45309}
svg.kd .k-red{fill:#fdeaea;stroke:#b91c1c}
svg.kd .k-green{fill:#e6f5ea;stroke:#15803d}
svg.kd .k-gray{fill:#ffffff;stroke:#8b97a8}
svg.kd .k-panel{fill:#eef1f6;stroke:#c3cbd8}
svg.kd .dash{stroke-dasharray:6 5}
svg.kd .ln{stroke:#4b5563;stroke-width:2;fill:none}
svg.kd .ln-ok{stroke:#15803d}
svg.kd .ln-bad{stroke:#b91c1c}
svg.kd .life{stroke:#8b97a8;stroke-width:1.5;stroke-dasharray:4 5;fill:none}
svg.kd .ah{fill:#4b5563}
svg.kd .ah-ok{fill:#15803d}
svg.kd .ah-bad{fill:#b91c1c}
svg.kd .bdg{fill:#2f5bd3}
svg.kd .bdg-t{fill:#ffffff;font-size:13px;font-weight:700}
:root[data-theme='dark'] svg.kd text{fill:#f3f4f6}
:root[data-theme='dark'] svg.kd .bg{fill:#111827;stroke:#374151}
:root[data-theme='dark'] svg.kd .s{fill:#d1d5db}
:root[data-theme='dark'] svg.kd .ok{fill:#86efac}
:root[data-theme='dark'] svg.kd .bad{fill:#fca5a5}
:root[data-theme='dark'] svg.kd .k-blue{fill:#1b2a4d;stroke:#8fb1ff}
:root[data-theme='dark'] svg.kd .k-teal{fill:#0f302c;stroke:#5eead4}
:root[data-theme='dark'] svg.kd .k-violet{fill:#2a1f4d;stroke:#c4b5fd}
:root[data-theme='dark'] svg.kd .k-amber{fill:#3a2a10;stroke:#fcd34d}
:root[data-theme='dark'] svg.kd .k-red{fill:#3d1717;stroke:#fca5a5}
:root[data-theme='dark'] svg.kd .k-green{fill:#12321d;stroke:#86efac}
:root[data-theme='dark'] svg.kd .k-gray{fill:#1f2937;stroke:#6b7280}
:root[data-theme='dark'] svg.kd .k-panel{fill:#172030;stroke:#334155}
:root[data-theme='dark'] svg.kd .ln{stroke:#cbd5e1}
:root[data-theme='dark'] svg.kd .ln-ok{stroke:#86efac}
:root[data-theme='dark'] svg.kd .ln-bad{stroke:#fca5a5}
:root[data-theme='dark'] svg.kd .life{stroke:#6b7280}
:root[data-theme='dark'] svg.kd .ah{fill:#cbd5e1}
:root[data-theme='dark'] svg.kd .ah-ok{fill:#86efac}
:root[data-theme='dark'] svg.kd .ah-bad{fill:#fca5a5}
:root[data-theme='dark'] svg.kd .bdg{fill:#8fb1ff}
:root[data-theme='dark'] svg.kd .bdg-t{fill:#0b1220}
@media (prefers-color-scheme:dark){
:root:not([data-theme]) svg.kd text{fill:#f3f4f6}
:root:not([data-theme]) svg.kd .bg{fill:#111827;stroke:#374151}
:root:not([data-theme]) svg.kd .s{fill:#d1d5db}
:root:not([data-theme]) svg.kd .ok{fill:#86efac}
:root:not([data-theme]) svg.kd .bad{fill:#fca5a5}
:root:not([data-theme]) svg.kd .k-blue{fill:#1b2a4d;stroke:#8fb1ff}
:root:not([data-theme]) svg.kd .k-teal{fill:#0f302c;stroke:#5eead4}
:root:not([data-theme]) svg.kd .k-violet{fill:#2a1f4d;stroke:#c4b5fd}
:root:not([data-theme]) svg.kd .k-amber{fill:#3a2a10;stroke:#fcd34d}
:root:not([data-theme]) svg.kd .k-red{fill:#3d1717;stroke:#fca5a5}
:root:not([data-theme]) svg.kd .k-green{fill:#12321d;stroke:#86efac}
:root:not([data-theme]) svg.kd .k-gray{fill:#1f2937;stroke:#6b7280}
:root:not([data-theme]) svg.kd .k-panel{fill:#172030;stroke:#334155}
:root:not([data-theme]) svg.kd .ln{stroke:#cbd5e1}
:root:not([data-theme]) svg.kd .ln-ok{stroke:#86efac}
:root:not([data-theme]) svg.kd .ln-bad{stroke:#fca5a5}
:root:not([data-theme]) svg.kd .life{stroke:#6b7280}
:root:not([data-theme]) svg.kd .ah{fill:#cbd5e1}
:root:not([data-theme]) svg.kd .ah-ok{fill:#86efac}
:root:not([data-theme]) svg.kd .ah-bad{fill:#fca5a5}
:root:not([data-theme]) svg.kd .bdg{fill:#8fb1ff}
:root:not([data-theme]) svg.kd .bdg-t{fill:#0b1220}
}
</style>
<defs>
<marker id="kd39-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah"/></marker>
<marker id="kd39-a-ok" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah-ok"/></marker>
<marker id="kd39-a-bad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah-bad"/></marker>
</defs>
<rect x="1" y="1" width="518" height="510" rx="14" class="bg"/>
<text x="20" y="34" class="ttl">Du nom DNS au Pod prêt</text>
<rect x="20" y="56" width="220" height="56" rx="10" class="k-gray" stroke-width="1.6"/>
<text x="130.0" y="79.3" class="tb15" text-anchor="middle">Pod client</text>
<text x="130.0" y="98.6" class="s" text-anchor="middle">curl http://web/</text>
<rect x="300" y="56" width="200" height="56" rx="10" class="k-amber" stroke-width="1.6"/>
<text x="400.0" y="79.3" class="tb15" text-anchor="middle">CoreDNS</text>
<text x="400.0" y="98.6" class="s" text-anchor="middle">kube-system</text>
<path d="M242,84 L298,84" class="ln" marker-start="url(#kd39-a)" marker-end="url(#kd39-a)"/>
<circle cx="270" cy="68" r="11" class="bdg"/>
<text x="270" y="72.6" class="bdg-t" text-anchor="middle">1</text>
<path d="M130,114 L130,170" class="ln" marker-end="url(#kd39-a)"/>
<circle cx="108" cy="142" r="11" class="bdg"/>
<text x="108" y="146.6" class="bdg-t" text-anchor="middle">2</text>
<text x="144" y="147" class="s" text-anchor="start">connexion ClusterIP:80</text>
<rect x="20" y="172" width="480" height="58" rx="10" class="k-blue" stroke-width="1.6"/>
<text x="260.0" y="196.3" class="tb15" text-anchor="middle">Service web · ClusterIP · port 80</text>
<text x="260.0" y="215.6" class="s" text-anchor="middle">selector app=web → targetPort http (8080)</text>
<path d="M260,232 L260,282" class="ln" marker-end="url(#kd39-a)"/>
<circle cx="238" cy="257" r="11" class="bdg"/>
<text x="238" y="261.6" class="bdg-t" text-anchor="middle">3</text>
<text x="274" y="262" class="s" text-anchor="start">dataplane du Service</text>
<rect x="20" y="284" width="480" height="58" rx="10" class="k-violet" stroke-width="1.6"/>
<text x="260.0" y="308.3" class="tb15" text-anchor="middle">EndpointSlice web</text>
<text x="260.0" y="327.6" class="s" text-anchor="middle">adresses des Pods + condition Ready</text>
<path d="M95,344 L95,394" class="ln" marker-end="url(#kd39-a)"/>
<path d="M260,344 L260,394" class="ln" marker-end="url(#kd39-a)"/>
<path d="M425,344 L425,394" class="ln ln-bad dash" marker-end="url(#kd39-a-bad)"/>
<rect x="20" y="396" width="150" height="58" rx="10" class="k-green" stroke-width="1.6"/>
<text x="95.0" y="420.3" class="tb15" text-anchor="middle">Pod web A</text>
<text x="95.0" y="439.6" class="s" text-anchor="middle">Ready · :8080</text>
<rect x="185" y="396" width="150" height="58" rx="10" class="k-green" stroke-width="1.6"/>
<text x="260.0" y="420.3" class="tb15" text-anchor="middle">Pod web B</text>
<text x="260.0" y="439.6" class="s" text-anchor="middle">Ready · :8080</text>
<rect x="350" y="396" width="150" height="58" rx="10" class="k-red dash" stroke-width="1.6"/>
<text x="425.0" y="420.3" class="tb15" text-anchor="middle">Pod web C</text>
<text x="425.0" y="439.6" class="s" text-anchor="middle">non Ready : exclu</text>
<text x="20" y="488" class="s" text-anchor="start">① résolution DNS  ② connexion  ③ choix d'un endpoint prêt</text>
</svg>
</div>

1. Le client résout le nom `web` grâce à **CoreDNS**.
2. Il se connecte à la **ClusterIP** du Service, port 80.
3. Le **dataplane** (kube-proxy ou le CNI) choisit une adresse publiée dans l'**EndpointSlice** — uniquement parmi les Pods prêts — et traduit le port 80 vers le `targetPort` 8080.

Le selector du Service associe des Pods ; le contrôleur EndpointSlice publie leurs adresses et conditions. Une ClusterIP n'est pas forcément une interface réseau à laquelle faire un `ping`. Un **redémarrage de conteneur** peut garder l'IP du Pod ; un **remplacement de Pod** en donne généralement une autre.

| Type de Service | Usage / prérequis | Limite |
|---|---|---|
| ClusterIP | Accès interne au réseau du cluster | Ni frontière cryptographique, ni pare-feu |
| NodePort | Port sur chaque nœud, plage par défaut 30000–32767 | Dépend des routes, règles hôte, `externalTrafficPolicy` ; dans kind, le nœud est un conteneur |
| LoadBalancer | Implémentation externe (cloud ou composant local) | Sans implémentation, `EXTERNAL-IP` reste `Pending` |
| Headless (`clusterIP: None`) | DNS des endpoints, utile aux identités StatefulSet | Pas d'IP virtuelle ; le client choisit ses endpoints |
| ExternalName | Alias DNS (CNAME) | Ni proxy réseau, ni selector de Pods |

Un Service peut exposer **plusieurs ports** : l'équation « 1 Service = 1 port = 1 LoadBalancer public » est fausse. Le nom court `web` est cherché dans le namespace du client ; depuis un autre namespace, utilisez `web.atelier.svc.cluster.local`. Le suffixe `cluster.local` est celui de ce laboratoire, pas une constante universelle.

### 9.2 Pratiquer avant de filtrer

```bash title="Poste d'administration · exec lance curl dans le conteneur client"
kubectl --context kind-formation -n atelier get svc web -o yaml
kubectl --context kind-formation -n atelier get endpointslices -l kubernetes.io/service-name=web -o yaml
kubectl --context kind-formation -n atelier get pods -l app=web -o wide --show-labels
kubectl --context kind-formation -n atelier exec deploy/client -- curl -fsS --max-time 5 http://web/
kubectl --context kind-formation -n kube-system get svc kube-dns
kubectl --context kind-formation -n kube-system get pods -l k8s-app=kube-dns --show-labels
```

**Vérifier la cohérence** : Service port 80 → `targetPort: http` → port nommé `http` (8080) du conteneur → labels des Pods → conditions des endpoints.

Une EndpointSlice vide peut venir d'un selector faux, de Pods absents ou pas encore publiés, ou d'un Service sans selector. Des endpoints non prêts renvoient à la readiness. Ne concluez pas « DNS cassé » si HTTP échoue **après** une résolution réussie.

### 9.3 Isoler progressivement et prouver l'efficacité

**Comment fonctionnent les NetworkPolicies :**

- elles s'appliquent aux Pods sélectionnés, en entrée (*ingress*), en sortie (*egress*) ou les deux ;
- elles sont **additives** : leurs autorisations s'additionnent, sans ordre de priorité comme un pare-feu ;
- un flux entre deux Pods isolés doit être autorisé **en sortie de la source et en entrée de la destination** ;
- une règle « tout autoriser » annule de fait la restriction des autres pour les mêmes Pods et directions.

| Étape / fichier | Intention | Observation exigée |
|---|---|---|
| Baseline, sans les 3 règles | Deux clients atteignent web par IP | HTTP réussi depuis `client` **et** `interdit` |
| `00-deny.yaml` | Isoler tous les Pods `atelier` en entrée et en sortie | La même connexion TCP par IP expire ; éviter DNS pour ce premier test |
| `10-dns.yaml` | Autoriser UDP **et** TCP 53 vers les Pods CoreDNS de `kube-system` | Les labels du DNS doivent correspondre ; un timeout HTTP seul ne prouve pas la résolution |
| `20-web.yaml` | `client` → web 8080 en sortie, et web ← `client` 8080 en entrée | HTTP par nom réussi pour `client` ; par IP en échec pour `interdit` |

```bash title="Poste d'administration · namespace atelier de kind-formation uniquement"
bash scripts/test-network.sh
kubectl --context kind-formation -n atelier get networkpolicy
kubectl --context kind-formation -n kube-system get ds calico-node
```

**Lire les codes de sortie de curl :**

| Code | Signification | Conclusion possible |
|---|---|---|
| 0 | Succès | Flux autorisé et service fonctionnel |
| 28 | Délai dépassé | Blocage **ou** DNS lent : ne prouve pas à lui seul que DNS fonctionne |
| 6 | Nom non résolu | Problème DNS : à investiguer |
| 7 | Connexion refusée ou impossible | Dans ce laboratoire, un blocage par politique se traduit par un délai dépassé (28) : à investiguer |
| 22 | Réponse HTTP ≥ 400 (avec `-f`) | Le serveur répond : à investiguer |
| 126 | Commande non exécutable | Problème dans le conteneur : à investiguer |

La **preuve finale** associe trois observations : baseline réussie, requête HTTP **réussie par nom** depuis `client`, refus par IP depuis `interdit`. Les 5 secondes de convergence du script sont une temporisation de laboratoire : si le dataplane converge plus lentement, conservez les observations et refaites un contrôle borné avant de diagnostiquer. En cas d'échec, les règles déjà appliquées restent en place : listez-les, puis utilisez le nettoyage explicite.

**Limites à connaître.** Le trafic des probes provenant du nœud n'est pas un test d'isolation entre Pods. Les politiques standard ne filtrent pas les chemins HTTP et ne chiffrent rien. NodeLocalDNS, `hostNetwork`, SNAT et les Services peuvent changer l'endroit où un flux est observé : adaptez les règles à **l'architecture observée**, sans ouvrir arbitrairement `0.0.0.0/0`.

**Exposition optionnelle.** Un contrôleur HTTP a besoin d'une autorisation d'entrée dédiée, depuis son namespace vers web 8080 ; le client de test n'est pas ce contrôleur. Le chapitre 12 fournit cette règle séparément.

**Retour à l'état initial (poste d'administration) :** `kubectl --context kind-formation -n atelier delete -f manifests/network/`, puis `bash scripts/lab-check.sh`. Seules les règles de ce dossier sont supprimées.

:::caution[Le test a échoué si la baseline passe encore]
Si la connexion réussit toujours après le refus par défaut, l'atelier est **en échec**, même si l'API a accepté les objets. Vérifiez que le CNI est installé et effectif, les sélecteurs, les règles additionnelles et le chemin réel du trafic.
:::

**Sources :** [modèle réseau](https://v1-35.docs.kubernetes.io/docs/concepts/cluster-administration/networking/), [Services](https://v1-35.docs.kubernetes.io/docs/concepts/services-networking/service/), [EndpointSlices](https://v1-35.docs.kubernetes.io/docs/concepts/services-networking/endpoint-slices/), [DNS](https://v1-35.docs.kubernetes.io/docs/concepts/services-networking/dns-pod-service/), [NetworkPolicy](https://v1-35.docs.kubernetes.io/docs/concepts/services-networking/network-policies/), [Calico quickstart](https://docs.tigera.io/calico/latest/getting-started/kubernetes/quickstart).

<a id="chapitre-10"></a>

## 10. ConfigMaps, Secrets et configuration vivante

**En bref.** Une **ConfigMap** distribue du texte non secret ; un **Secret** porte une donnée sensible avec des droits et usages particuliers. Le mode d'injection décide si une modification est prise en compte sans redémarrage.

:::caution[Base64 n'est pas du chiffrement]
Le champ `data` d'un Secret est encodé en base64 : n'importe qui peut le décoder. Le chapitre 15 traite séparément le chiffrement dans Git, l'injection, le chiffrement au repos, la protection des clés et les sauvegardes.
:::

### 10.1 Comment une modification arrive dans le conteneur

| Mode de consommation | Prise en compte d'une modification | Risque / vérification |
|---|---|---|
| Variable `env` / `envFrom` | Fixée **au démarrage** du conteneur | Recréer les Pods ; vérifier la variable sans afficher de secret |
| Volume ConfigMap/Secret | Projection mise à jour de façon **asynchrone** | L'application doit relire le fichier ou recharger sa configuration |
| Montage `subPath` | **Aucune** mise à jour automatique | Redémarrage ou recréation nécessaire |
| Objet immuable / versionné | Nouvel objet, puis nouveau template | Historique clair ; nettoyer les anciennes versions |

La ConfigMap du fil rouge contient `default.conf` et `index.html`. Modifier la réponse de `/ready` demande un rechargement de nginx ou un nouveau Pod : l'arrivée du nouveau fichier n'oblige pas nginx à relire sa configuration. Pour un changement durable, utilisez un nouveau nom ou une empreinte de configuration dans le template, ou un redéploiement explicite dont la cause est tracée.

```bash title="Poste d'administration · après modification du fichier ConfigMap dans Git"
kubectl --context kind-formation -n atelier diff -f manifests/base/configmap-web.yaml
kubectl --context kind-formation -n atelier apply -f manifests/base/configmap-web.yaml
kubectl --context kind-formation -n atelier rollout restart deploy/web
kubectl --context kind-formation -n atelier rollout status deploy/web --timeout=180s
kubectl --context kind-formation -n atelier exec deploy/client -- curl -fsS http://web/
```

**Interpréter :** `kubectl diff` renvoie le code **1** quand il trouve une différence — ce n'est pas une erreur. Lisez le contenu avant `apply`. `rollout restart` modifie une annotation du template de Pod : un outil GitOps doit comprendre ou réconcilier cette action.

**Résultat attendu :** le rollout se termine et `curl` affiche le nouveau contenu.

### 10.2 Atelier : un secret sans valeur dans Git

```bash title="Poste d'administration Ubuntu/WSL2 · hors enregistrement de session publique"
umask 077
mkdir -p .secrets
read -r -s -p 'Mot de passe fictif du laboratoire : ' LAB_PASS
printf '\n'
printf '%s' "$LAB_PASS" > .secrets/password
unset LAB_PASS
kubectl --context kind-formation -n atelier create secret generic exercice-secret --from-file=password=.secrets/password
kubectl --context kind-formation -n atelier get secret exercice-secret
```

**Rôle des commandes :** `umask 077` rend les fichiers créés lisibles par vous seul ; `read -s` masque la saisie ; `--from-file` évite que la valeur apparaisse dans l'historique ou la liste des processus.

**Résultat attendu :** le Secret `exercice-secret` apparaît avec `DATA 1`.

**Règles de sécurité :**

- ne copiez jamais la valeur ou le YAML décodé dans un ticket ;
- ce Secret fictif est à supprimer après A04 : `kubectl --context kind-formation -n atelier delete secret exercice-secret` ;
- le fichier local n'est pas une sauvegarde chiffrée : supprimez-le selon la politique du poste et ne le commitez jamais ;
- quiconque peut **créer des Pods** dans un namespace peut souvent monter ses Secrets, même sans le droit `get secrets` : ce droit est donc sensible.

Le montage d'un Secret, son mode de fichier et l'utilisateur non-root se vérifient ensemble : un fichier `0400` appartenant à root n'est pas lisible par l'UID 101. Le chapitre 15 détaille contrôles et rotation ; A04 propose un exercice corrigé sans donnée réelle.

:::caution[Erreur fréquente]
Remplacer une valeur par sa forme base64 avant de la commiter ne la protège pas. Un outil de chiffrement Git ne protège pas automatiquement etcd, le kubeconfig ni les sauvegardes.
:::

**Sources :** [ConfigMap](https://v1-35.docs.kubernetes.io/docs/concepts/configuration/configmap/), [Secrets](https://v1-35.docs.kubernetes.io/docs/concepts/configuration/secret/), [bonnes pratiques](https://v1-35.docs.kubernetes.io/docs/concepts/security/secrets-good-practices/), [volumes projetés](https://v1-35.docs.kubernetes.io/docs/concepts/storage/projected-volumes/).

<a id="chapitre-11"></a>

## 11. Stockage : volumes, PVC, topologie et données répliquées

**En bref.** Le stockage Kubernetes sépare **la demande** (PVC) de **la fourniture** (PV, StorageClass, pilote CSI). Persister, répliquer, être hautement disponible et sauvegarder sont quatre propriétés différentes, qui se testent séparément.

### 11.1 Durée de vie des volumes

| Volume | Durée de vie | Point d'attention |
|---|---|---|
| `emptyDir` | Survit au redémarrage d'un conteneur, **disparaît avec le Pod** | Sur le disque du nœud par défaut ; `medium: Memory` consomme de la mémoire |
| `hostPath` | Lié au nœud | Expose un chemin de l'hôte : risque d'accès aux données du nœud ; pas le stockage applicatif par défaut |
| PVC → PV | Indépendante du Pod | Dépend du pilote, de la topologie et de la politique de récupération |

<div class="not-content kd-figure" style="margin:1.5rem 0">
<svg xmlns="http://www.w3.org/2000/svg" class="kd" style="max-width:100%;height:auto;display:block" data-pagefind-ignore width="520" height="520" viewBox="0 0 520 520" role="img" aria-labelledby="kd40-t kd40-d">
<title id="kd40-t">Pod, PVC, PV : qui demande, qui fournit</title>
<desc id="kd40-d">Le Pod référence un PersistentVolumeClaim par claimName. Le PVC, objet du namespace, demande une taille, un mode d'accès et une classe. Il se lie à un PersistentVolume, objet du cluster, qui représente le volume réel sur un disque ou un stockage externe. La StorageClass et son provisionneur CSI créent le PV à la demande.</desc>
<style>
svg.kd text{font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;fill:#111827}
svg.kd .bg{fill:#f7f8fb;stroke:#d5dbe5;stroke-width:1.5}
svg.kd .ttl{font-size:19px;font-weight:700}
svg.kd .tb{font-size:17px;font-weight:700}
svg.kd .tb15{font-size:16px;font-weight:700}
svg.kd .t{font-size:16px}
svg.kd .s{font-size:15px;fill:#374151}
svg.kd .ok{fill:#166534;font-weight:700}
svg.kd .bad{fill:#b91c1c;font-weight:700}
svg.kd .k-blue{fill:#e8eefc;stroke:#2f5bd3}
svg.kd .k-teal{fill:#e1f3ef;stroke:#0f766e}
svg.kd .k-violet{fill:#efe9fd;stroke:#6d28d9}
svg.kd .k-amber{fill:#fdf3e1;stroke:#b45309}
svg.kd .k-red{fill:#fdeaea;stroke:#b91c1c}
svg.kd .k-green{fill:#e6f5ea;stroke:#15803d}
svg.kd .k-gray{fill:#ffffff;stroke:#8b97a8}
svg.kd .k-panel{fill:#eef1f6;stroke:#c3cbd8}
svg.kd .dash{stroke-dasharray:6 5}
svg.kd .ln{stroke:#4b5563;stroke-width:2;fill:none}
svg.kd .ln-ok{stroke:#15803d}
svg.kd .ln-bad{stroke:#b91c1c}
svg.kd .life{stroke:#8b97a8;stroke-width:1.5;stroke-dasharray:4 5;fill:none}
svg.kd .ah{fill:#4b5563}
svg.kd .ah-ok{fill:#15803d}
svg.kd .ah-bad{fill:#b91c1c}
svg.kd .bdg{fill:#2f5bd3}
svg.kd .bdg-t{fill:#ffffff;font-size:13px;font-weight:700}
:root[data-theme='dark'] svg.kd text{fill:#f3f4f6}
:root[data-theme='dark'] svg.kd .bg{fill:#111827;stroke:#374151}
:root[data-theme='dark'] svg.kd .s{fill:#d1d5db}
:root[data-theme='dark'] svg.kd .ok{fill:#86efac}
:root[data-theme='dark'] svg.kd .bad{fill:#fca5a5}
:root[data-theme='dark'] svg.kd .k-blue{fill:#1b2a4d;stroke:#8fb1ff}
:root[data-theme='dark'] svg.kd .k-teal{fill:#0f302c;stroke:#5eead4}
:root[data-theme='dark'] svg.kd .k-violet{fill:#2a1f4d;stroke:#c4b5fd}
:root[data-theme='dark'] svg.kd .k-amber{fill:#3a2a10;stroke:#fcd34d}
:root[data-theme='dark'] svg.kd .k-red{fill:#3d1717;stroke:#fca5a5}
:root[data-theme='dark'] svg.kd .k-green{fill:#12321d;stroke:#86efac}
:root[data-theme='dark'] svg.kd .k-gray{fill:#1f2937;stroke:#6b7280}
:root[data-theme='dark'] svg.kd .k-panel{fill:#172030;stroke:#334155}
:root[data-theme='dark'] svg.kd .ln{stroke:#cbd5e1}
:root[data-theme='dark'] svg.kd .ln-ok{stroke:#86efac}
:root[data-theme='dark'] svg.kd .ln-bad{stroke:#fca5a5}
:root[data-theme='dark'] svg.kd .life{stroke:#6b7280}
:root[data-theme='dark'] svg.kd .ah{fill:#cbd5e1}
:root[data-theme='dark'] svg.kd .ah-ok{fill:#86efac}
:root[data-theme='dark'] svg.kd .ah-bad{fill:#fca5a5}
:root[data-theme='dark'] svg.kd .bdg{fill:#8fb1ff}
:root[data-theme='dark'] svg.kd .bdg-t{fill:#0b1220}
@media (prefers-color-scheme:dark){
:root:not([data-theme]) svg.kd text{fill:#f3f4f6}
:root:not([data-theme]) svg.kd .bg{fill:#111827;stroke:#374151}
:root:not([data-theme]) svg.kd .s{fill:#d1d5db}
:root:not([data-theme]) svg.kd .ok{fill:#86efac}
:root:not([data-theme]) svg.kd .bad{fill:#fca5a5}
:root:not([data-theme]) svg.kd .k-blue{fill:#1b2a4d;stroke:#8fb1ff}
:root:not([data-theme]) svg.kd .k-teal{fill:#0f302c;stroke:#5eead4}
:root:not([data-theme]) svg.kd .k-violet{fill:#2a1f4d;stroke:#c4b5fd}
:root:not([data-theme]) svg.kd .k-amber{fill:#3a2a10;stroke:#fcd34d}
:root:not([data-theme]) svg.kd .k-red{fill:#3d1717;stroke:#fca5a5}
:root:not([data-theme]) svg.kd .k-green{fill:#12321d;stroke:#86efac}
:root:not([data-theme]) svg.kd .k-gray{fill:#1f2937;stroke:#6b7280}
:root:not([data-theme]) svg.kd .k-panel{fill:#172030;stroke:#334155}
:root:not([data-theme]) svg.kd .ln{stroke:#cbd5e1}
:root:not([data-theme]) svg.kd .ln-ok{stroke:#86efac}
:root:not([data-theme]) svg.kd .ln-bad{stroke:#fca5a5}
:root:not([data-theme]) svg.kd .life{stroke:#6b7280}
:root:not([data-theme]) svg.kd .ah{fill:#cbd5e1}
:root:not([data-theme]) svg.kd .ah-ok{fill:#86efac}
:root:not([data-theme]) svg.kd .ah-bad{fill:#fca5a5}
:root:not([data-theme]) svg.kd .bdg{fill:#8fb1ff}
:root:not([data-theme]) svg.kd .bdg-t{fill:#0b1220}
}
</style>
<defs>
<marker id="kd40-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah"/></marker>
<marker id="kd40-a-ok" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah-ok"/></marker>
<marker id="kd40-a-bad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah-bad"/></marker>
</defs>
<rect x="1" y="1" width="518" height="518" rx="14" class="bg"/>
<text x="20" y="34" class="ttl">Pod, PVC, PV : qui demande, qui fournit</text>
<rect x="20" y="56" width="280" height="56" rx="10" class="k-gray" stroke-width="1.6"/>
<text x="160.0" y="79.3" class="tb15" text-anchor="middle">Pod registre-0</text>
<text x="160.0" y="98.6" class="s" text-anchor="middle">volume → claimName</text>
<path d="M160,114 L160,158" class="ln" marker-end="url(#kd40-a)"/>
<text x="172" y="141" class="s" text-anchor="start">référence</text>
<rect x="20" y="160" width="280" height="62" rx="10" class="k-blue" stroke-width="1.6"/>
<text x="160.0" y="186.3" class="tb15" text-anchor="middle">PVC data-registre-0</text>
<text x="160.0" y="205.6" class="s" text-anchor="middle">demande : taille, mode, classe</text>
<path d="M160,224 L160,268" class="ln" marker-end="url(#kd40-a)"/>
<text x="172" y="251" class="s" text-anchor="start">liaison : Bound</text>
<rect x="20" y="270" width="280" height="62" rx="10" class="k-violet" stroke-width="1.6"/>
<text x="160.0" y="296.3" class="tb15" text-anchor="middle">PV</text>
<text x="160.0" y="315.6" class="s" text-anchor="middle">volume réel (objet du cluster)</text>
<path d="M160,334 L160,378" class="ln" marker-end="url(#kd40-a)"/>
<path d="M40,389 a120.0,9 0 0 1 240,0 v54 a120.0,9 0 0 1 -240,0 z" class="k-gray" stroke-width="1.6"/>
<path d="M40,389 a120.0,9 0 0 0 240,0" class="k-gray" fill="none" stroke-width="1.6" style="fill:none"/>
<text x="160.0" y="420.3" class="tb15" text-anchor="middle">Disque / stockage</text>
<text x="160.0" y="439.6" class="s" text-anchor="middle">local, baie, cloud</text>
<rect x="330" y="244" width="170" height="116" rx="10" class="k-amber" stroke-width="1.6"/>
<text x="415.0" y="278.3" class="tb15" text-anchor="middle">StorageClass</text>
<text x="415.0" y="297.6" class="s" text-anchor="middle">provisionneur</text>
<text x="415.0" y="316.6" class="s" text-anchor="middle">(pilote CSI)</text>
<text x="415.0" y="335.6" class="s" text-anchor="middle">crée le PV</text>
<path d="M302,191 L415,191 L415,242" class="ln dash" marker-end="url(#kd40-a)"/>
<text x="310" y="183" class="s" text-anchor="start">storageClassName</text>
<path d="M328,301 L302,301" class="ln" marker-end="url(#kd40-a)"/>
<text x="20" y="482" class="s" text-anchor="start">Le PVC exprime un besoin. Sans pilote, une</text>
<text x="20" y="502" class="s" text-anchor="start">StorageClass ne crée aucun disque.</text>
</svg>
</div>

Un **PersistentVolumeClaim** (PVC) exprime un besoin ; un **PersistentVolume** (PV) représente un volume réel. La **StorageClass** indique notamment le provisionneur, les paramètres et le mode de liaison :

- `WaitForFirstConsumer` attend que le Pod soit placé, pour respecter la topologie du disque : un PVC `Pending` avant le premier consommateur est donc **normal** ;
- `Immediate` peut choisir une topologie incompatible avec le futur Pod.

| Mode d'accès | Sens | Ce qu'il ne garantit pas |
|---|---|---|
| ReadWriteOnce (RWO) | Lecture/écriture par **un seul nœud** | Plusieurs Pods de ce nœud peuvent y accéder : ce n'est pas l'exclusivité d'un Pod |
| ReadOnlyMany (ROX) | Lecture par plusieurs nœuds | Dépend du pilote ; vérifier aussi droits et montages `readOnly` |
| ReadWriteMany (RWX) | Lecture/écriture par plusieurs nœuds | Ne rend pas une base de données sûre avec plusieurs écrivains |
| ReadWriteOncePod (RWOP) | Lecture/écriture par **un seul Pod** du cluster | CSI et sidecars compatibles requis ; pas démontrable avec tous les pilotes locaux |

### 11.2 Pratiquer dans kind, avec les limites du stockage local

kind installe une StorageClass `standard` de type *local-path*. Vérifiez-la au lieu de supposer sa présence : ce n'est pas un CSI de baie hautement disponible. Le StatefulSet complet est dans `manifests/storage/statefulset.yaml`, rendu avec les digests dans l'overlay `complements`.

```bash title="Poste d'administration · cluster kind uniquement"
kubectl --context kind-formation get storageclass standard -o yaml
kubectl --context kind-formation apply -k manifests/overlays/complements
kubectl --context kind-formation -n atelier rollout status statefulset/registre --timeout=180s
kubectl --context kind-formation -n atelier get pvc
kubectl --context kind-formation get pv
kubectl --context kind-formation -n atelier exec registre-0 -- cat /data/identite
# Incident volontaire réversible : seul Pod registre-0, son PVC est conservé.
kubectl --context kind-formation -n atelier delete pod registre-0
kubectl --context kind-formation -n atelier rollout status statefulset/registre --timeout=180s
kubectl --context kind-formation -n atelier exec registre-0 -- cat /data/identite
```

**Résultat attendu :** le fichier contient toujours `registre-0` après le remplacement du Pod. C'est une preuve de **persistance**.

**Pour aller plus loin :** écrivez une valeur différente dans chaque PVC, redémarrez l'un des Pods et constatez que les deux volumes **ne se synchronisent pas** — il n'y a pas de réplication.

**Limites :** ne déduisez pas de cette expérience une reprise sur un autre nœud. Les PV locaux ont une affinité de nœud et disparaissent avec le disque du nœud kind supprimé. Si un `Permission denied` apparaît, vérifiez `fsGroup` avec `id` et `ls -ld /data` depuis le conteneur.

### 11.3 Rétention, extension, snapshots et CSI

**Rétention.** La politique PVC du StatefulSet est `Retain` lors d'un scale down ou de sa suppression. La **reclaimPolicy du PV** est un mécanisme séparé : si elle vaut `Delete`, supprimer le PVC peut supprimer le volume sous-jacent.

:::danger[Supprimer les PVC du laboratoire]
Avant nettoyage : décrire PVC et PV, vérifier les données et la sauvegarde, puis supprimer **seulement** les claims identifiés `data-registre-0` et `data-registre-1`. L'opération détruit ces données ; reconstruire avec le même manifeste crée des volumes vides.
:::

**Extension.** `allowVolumeExpansion: true` ne suffit pas : le pilote et le système de fichiers doivent la supporter. Agrandissez la demande du PVC, observez ses conditions, puis contrôlez la taille montée. On ne réduit pas un volume en diminuant le YAML.

**Snapshots.** Un VolumeSnapshot CSI requiert les CRD, un snapshot-controller et un pilote compatible. Une image instantanée de disque n'est pas forcément cohérente pour les transactions d'une base : mettez l'application en pause (*quiesce*) ou utilisez son mécanisme de sauvegarde.

**Cloud.** L'ancien `provisioner: kubernetes.io/aws-ebs` n'est plus un exemple à recopier. Le pilote CSI EBS utilise `ebs.csi.aws.com`, nécessite son installation, des droits IAM et les bonnes zones de disponibilité ; ses paramètres de classe, de chiffrement et de clés sont propres au fournisseur. Ce guide ne les présente pas comme un atelier exécuté. Talos, k3d et les clusters managés ne sont pas couverts par des procédures d'administration transposées.

| Propriété | Question de validation indépendante |
|---|---|
| Persistance | Après remplacement du Pod, le même fichier est-il relu ? |
| Réplication | Une écriture est-elle transmise à une autre instance, avec quel retard ? |
| Haute disponibilité | Une instance perdue est-elle remplacée ou promue sans double primaire, et quels clients reprennent ? |
| Sauvegarde | Peut-on reconstruire les données après suppression ou corruption, dans les objectifs RPO/RTO ? |

:::tip[À retenir]
Une réplication copie aussi une erreur ou une suppression. Une sauvegarde stockée sur le même disque ne couvre pas la perte de ce disque. Le chapitre 20 construit une reprise applicative, distincte de la reprise etcd.
:::

**Sources :** [volumes](https://v1-35.docs.kubernetes.io/docs/concepts/storage/volumes/), [PV/PVC et modes](https://v1-35.docs.kubernetes.io/docs/concepts/storage/persistent-volumes/), [StorageClasses](https://v1-35.docs.kubernetes.io/docs/concepts/storage/storage-classes/), [snapshots](https://v1-35.docs.kubernetes.io/docs/concepts/storage/volume-snapshots/), [CSI EBS](https://github.com/kubernetes-sigs/aws-ebs-csi-driver), [local-path](https://github.com/rancher/local-path-provisioner).


<a id="chapitre-12"></a>

## 12. HTTP, Ingress, Gateway API et TLS

**En bref.** Un Service expose du réseau ; un **reverse proxy HTTP** choisit en plus l'application selon le nom d'hôte, le chemin et les règles TLS. Kubernetes décrit cette configuration avec **Ingress** ou **Gateway API**, mais il faut toujours installer un **contrôleur** qui l'applique. Ce chapitre est optionnel : il n'est pas nécessaire aux premiers ateliers.

### 12.1 Choisir une architecture

- **Ingress** décrit des règles HTTP simples ; il ne fait rien sans contrôleur.
- **Gateway API** sépare les responsabilités : **GatewayClass** (l'implémentation), **Gateway** (les points d'entrée), **HTTPRoute** (le routage). Elle s'installe par CRD ; elle n'est pas fournie avec le control plane.

:::note[Ingress NGINX communautaire : retiré, pas l'API Ingress]
Le contrôleur **communautaire** Ingress NGINX n'est plus maintenu depuis mars 2026. L'API Ingress reste disponible, et les autres produits contenant le nom « NGINX » ne sont pas concernés. Le guide ne réinstalle pas `controller-v1.9.4` : il utilise **Envoy Gateway 1.9.2** pour Gateway API (§12.2 à 12.5) et **Traefik** pour Ingress (§12.6).
:::

| Ressource | Responsable habituel | À vérifier |
|---|---|---|
| GatewayClass `eg` | Administrateur plateforme | `Accepted`, et `controllerName` correspondant au contrôleur installé |
| Gateway `web` | Équipe plateforme | Listeners, certificats, `Accepted`, `Programmed`, événements |
| HTTPRoute `web` | Équipe application | Parents, `Accepted`, `ResolvedRefs`, Service et port du backend |
| Ingress | Équipe application, avec une IngressClass autorisée | Contrôleur présent, règles prises en compte, événements, test HTTP/TLS |

### 12.2 Installer le complément Envoy Gateway

**Prérequis :** cluster `kind-formation` sain, Helm 4.2.3, mémoire supplémentaire disponible. La matrice officielle couvre Kubernetes 1.35 pour Envoy Gateway 1.9 ; ne l'étendez pas à 1.37 par analogie. Les CRD sont installées par le chart : ne mélangez pas plusieurs bundles Gateway API de versions différentes.

```bash title="Poste d'administration · Helm 4.2.3 et kind-formation"
mkdir -p vendor/envoy
helm pull oci://docker.io/envoyproxy/gateway-helm --version v1.9.2 --destination vendor/envoy
# Nom effectivement produit et vérifié : gateway-helm-v1.9.2.tgz.
# Sur l'archive livrée : vérifier le hash conservé, sans l'écraser.
(cd vendor/envoy && sha256sum --check chart.sha256)
helm show chart vendor/envoy/gateway-helm-v1.9.2.tgz
python3 vendor/envoy/resolve-controller.py
helm lint vendor/envoy/gateway-helm-v1.9.2.tgz -f vendor/envoy/controller-image-lock.yaml
helm template eg vendor/envoy/gateway-helm-v1.9.2.tgz --namespace envoy-gateway-system --kube-version 1.35.8 --include-crds -f vendor/envoy/controller-image-lock.yaml > vendor/envoy/rendered.yaml
# Lire CRD, RBAC, securityContexts et images AVANT installation ; conserver le rendu approuvé.
helm --kube-context kind-formation upgrade --install eg vendor/envoy/gateway-helm-v1.9.2.tgz --namespace envoy-gateway-system --create-namespace -f vendor/envoy/controller-image-lock.yaml --wait --timeout 5m
kubectl --context kind-formation -n envoy-gateway-system get pods
kubectl --context kind-formation apply -f manifests/exposition/gateway.yaml
kubectl --context kind-formation -n atelier apply -f manifests/exposition/allow-controllers.yaml
kubectl --context kind-formation -n atelier get gateway,httproute -o yaml
```

**Rôle des étapes :** vérifier l'archive (`sha256sum --check`), verrouiller l'image du contrôleur (`resolve-controller.py`), **relire le rendu** avant d'installer, installer avec les mêmes valeurs, puis appliquer la Gateway, la route et l'autorisation réseau des contrôleurs.

**Résultat attendu :** Pods du contrôleur prêts ; Gateway `Accepted` et `Programmed` ; HTTPRoute `Accepted` et `ResolvedRefs`.

<details>
<summary>Ce qui a été vérifié, et ce que le verrou ne couvre pas</summary>

L'archive, son hash et le rendu ont été réellement obtenus le **16 octobre 2026** : le chart conserve bien le `v` dans son nom. `helm lint` réussit avec un avertissement sur le préfixe `v` de la version amont (pas strictement SemVer 2) ; le rendu pour Kubernetes 1.35.8 avec CRD réussit. Les éléments exacts, le nombre d'objets et les limites figurent dans `vendor/envoy/rapport-source.json`. Une reconstruction approuvée réutilise l'archive et les verrous conservés ; relancer leur résolution est une mise à jour à réviser.

Le verrou de base `images.lock.json` ne couvre que les trois images du fil rouge. Le script fourni (Python 3/PyYAML) vérifie le digest de l'image Envoy Gateway et le fixe via `global.images.envoyGateway.image`, pour le contrôleur et son Job certgen. Il **ne verrouille pas** les images du dataplane créées dynamiquement, ni l'image ratelimit déclarée dans la configuration du contrôleur. Pour industrialiser, inventoriez aussi ces images, résolvez leurs digests, puis fixez les paramètres supportés par le chart et `EnvoyProxy`.

Le complément reste **non installé et non testé en laboratoire ici**. La présence des CRD dans le YAML ne démontre pas leur admission effective.

</details>

### 12.3 Tester HTTP sans fournisseur de LoadBalancer

Dans kind, l'IP externe du Service LoadBalancer peut rester `Pending`. Pour apprendre HTTP sans ajouter de fournisseur, identifiez le **Service dataplane** par ses labels, puis faites un port-forward sur **ce Service** — jamais sur le port d'administration du contrôleur.

```bash title="Poste d'administration · terminal 1 (lister avant de choisir)"
kubectl --context kind-formation -n envoy-gateway-system get svc --show-labels
ENVOY_SERVICE=$(kubectl --context kind-formation -n envoy-gateway-system get svc -l gateway.envoyproxy.io/owning-gateway-name=web,gateway.envoyproxy.io/owning-gateway-namespace=atelier -o jsonpath='{.items[0].metadata.name}')
test -n "$ENVOY_SERVICE"
kubectl --context kind-formation -n envoy-gateway-system port-forward "svc/$ENVOY_SERVICE" 8080:80 --address 127.0.0.1
# Où : poste administration, terminal 2, après listener HTTP prêt.
curl --fail --resolve web.k8s.test:8080:127.0.0.1 http://web.k8s.test:8080/
```

**Rôle des options :** `--address 127.0.0.1` limite l'écoute au poste ; `--resolve` envoie `web.k8s.test` vers 127.0.0.1 sans modifier `/etc/hosts`, avec le bon en-tête `Host`.

**Résultat attendu :** la page d'accueil du web, sans erreur `curl`. Si `test -n` échoue, n'utilisez pas la variable : relisez `get svc --show-labels` et les logs du contrôleur.

L'autorisation fournie (`allow-controllers.yaml`) ouvre web 8080 aux namespaces dédiés `envoy-gateway-system` et `traefik`. C'est une **confiance explicite** envers ces namespaces : pour une plateforme partagée, ajoutez un `podSelector` vérifié. Si le dataplane tourne dans un autre namespace, adaptez la règle après observation. Aucune ouverture globale n'est nécessaire.

### 12.4 TLS avec un certificat de laboratoire réellement vérifié

**Ce qui rend un certificat valide pour un client :** il couvre le nom demandé dans ses **SAN** (*Subject Alternative Name*), il est dans sa période de validité, et il est signé par une autorité que le client accepte. Un Secret `kubernetes.io/tls` contient le certificat **et la clé privée** ; l'API ne vérifie pas qu'ils conviennent à votre route. Le test utilise un certificat autosigné local de courte durée, jamais une PKI de production.

```bash title="Poste d'administration Ubuntu/WSL2 · OpenSSL 3 installé"
umask 077
mkdir -p .secrets
openssl req -x509 -newkey rsa:3072 -sha256 -nodes -days 7 \
  -keyout .secrets/web.key -out .secrets/web.crt \
  -subj '/CN=web.k8s.test' -addext 'subjectAltName=DNS:web.k8s.test'
kubectl --context kind-formation -n atelier create secret tls web-tls --cert=.secrets/web.crt --key=.secrets/web.key
kubectl --context kind-formation -n atelier apply -f manifests/exposition/gateway-tls.yaml
kubectl --context kind-formation -n atelier get gateway web -o yaml
# Où : poste administration, terminal 1 : arrêter le port-forward HTTP avec Ctrl+C.
# Après programmation du listener HTTPS, vérifier que le Service dataplane offre bien 443.
kubectl --context kind-formation -n envoy-gateway-system get "svc/$ENVOY_SERVICE" -o jsonpath='{.spec.ports[*].port}{"\n"}'
# Reprendre le port-forward seulement lorsque les ports 80 et 443 sont présents.
kubectl --context kind-formation -n envoy-gateway-system port-forward "svc/$ENVOY_SERVICE" 8080:80 8443:443 --address 127.0.0.1
# Où : poste administration, terminal 2, nouveau port-forward actif.
curl --fail --cacert .secrets/web.crt --resolve web.k8s.test:8443:127.0.0.1 https://web.k8s.test:8443/
openssl s_client -connect 127.0.0.1:8443 -servername web.k8s.test -CAfile .secrets/web.crt -verify_hostname web.k8s.test -verify_return_error </dev/null
```

**Résultat attendu :** les ports `80 443` apparaissent ; `curl` réussit **avec** vérification (`--cacert`) ; `openssl s_client` affiche `Verify return code: 0 (ok)`.

**Vérifier aussi les refus :** un nom faux et un client sans cette confiance doivent rejeter le certificat (voir le [scénario 10](#scenario-10)). `curl -k` ne constitue **jamais** une réussite TLS.

**Limites :** le listener 443 ne force pas la redirection HTTP → HTTPS (exercice supplémentaire). Pour un domaine public, un gestionnaire de certificats ACME doit disposer du DNS et de la preuve de contrôle du domaine ; aucune annotation ne crée un « faux » émetteur Let's Encrypt. L'atelier A11 étudie cert-manager avec une PKI de laboratoire.

### 12.5 Nettoyer le parcours Envoy Gateway

Depuis le poste d'administration :

1. arrêtez le port-forward ;
2. supprimez `gateway.yaml`, `gateway-tls.yaml` et `allow-controllers.yaml` avec `kubectl delete -f` (pour la Gateway répétée : `--ignore-not-found`) ;
3. supprimez le Secret `web-tls` quand l'atelier Traefik est terminé ;
4. retirez le contrôleur : `helm --kube-context kind-formation uninstall eg -n envoy-gateway-system`.

Des CRD partagées peuvent rester : inventoriez leurs consommateurs avant toute suppression, et ne retirez jamais des CRD utilisées ailleurs.

**Sources :** [retrait Ingress NGINX](https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/), [Ingress](https://v1-35.docs.kubernetes.io/docs/concepts/services-networking/ingress/), [Gateway API](https://gateway-api.sigs.k8s.io/docs/concepts/api-overview/), [installation Envoy 1.9](https://gateway.envoyproxy.io/v1.9/install/install-helm/), [matrice](https://gateway.envoyproxy.io/news/releases/matrix/), [HTTPRoute](https://github.com/kubernetes-sigs/gateway-api/blob/main/site/content/en/reference/api-types/httproute.md), [TLS Gateway](https://gateway-api.sigs.k8s.io/guides/tls/).

<a id="ingress-traefik"></a>

### 12.6 Parcours Ingress concret avec Traefik, optionnel

**À quoi ça sert.** Montrer que l'API Ingress reste utilisable avec un contrôleur maintenu. Ce parcours est **indépendant d'Envoy Gateway**.

| Choix | Valeur |
|---|---|
| Versions | Traefik Proxy **v3.7.15**, chart **41.7.1**, Helm **4.2.3**, Kubernetes de laboratoire **1.35.8** |
| Providers | Seul le provider Kubernetes Ingress est activé ; providers CRD Traefik et Gateway désactivés |
| Exposition | Service ClusterIP ; accès pédagogique par port-forward lié à localhost |
| Sécurité | Dashboard et API non sécurisée désactivés ; classe `traefik` non définie par défaut |
| Périmètre | Observation limitée aux objets du namespace `atelier` |

**Prérequis :** laboratoire léger sain, outils du chapitre 3, Python 3 et PyYAML, fichiers de valeurs fournis, et le certificat de test avec SAN `web.k8s.test` (`.secrets/web.crt` et `.secrets/web.key`) créé au §12.4. Aucun domaine public ni service ACME n'est requis. Ne commitez pas ces fichiers privés.

**Droits du contrôleur.** Le RBAC du chart est désactivé : `manifests/exposition/traefik-rbac.yaml` accorde la lecture des objets backend, y compris les Secrets TLS, **dans `atelier`** ; seuls les nœuds et IngressClasses sont lus à l'échelle du cluster. Le contrôleur a besoin d'un jeton API : la désactivation du montage automatique appliquée au workload web ne vaut pas pour lui. Relisez ces droits avant installation.

<details>
<summary>Ce qui a été vérifié le 16 octobre 2026</summary>

Téléchargement du chart, SHA-256 comparé à l'index officiel, digest de l'image vérifié contre le contenu du manifest du registre, schéma des valeurs Helm et rendu pour Kubernetes 1.35.8 : réussis. **Installation et requêtes HTTP/TLS non exécutées dans un cluster.** Le chart annonce Kubernetes `>=1.25.0-0` et une image par défaut 3.7.14 ; son annotation de version maximale porte encore 3.7.14. La 3.7.15, publiée le 15 octobre, corrige notamment des vulnérabilités ; le guide sélectionne ce patch, accepté au rendu, sans affirmer que cette combinaison a été testée par ses auteurs. [Chart officiel 41.7.1](https://github.com/traefik/traefik-helm-chart/releases/tag/v41.7.1), [release Proxy 3.7.15](https://github.com/traefik/traefik/releases/tag/v3.7.15), [valeurs versionnées](https://github.com/traefik/traefik-helm-chart/blob/v41.7.1/traefik/values.yaml).

</details>

**Étape 1 — Vérifier et rendre le chart.**

```bash title="Poste d'administration · Bash Linux/WSL, racine du dossier associé"
# L'archive officielle est livrée. Pour la télécharger à nouveau :
curl -fL https://traefik.github.io/charts/traefik/traefik-41.7.1.tgz -o helm/traefik/traefik-41.7.1.tgz
(cd helm/traefik && sha256sum --check chart.sha256)
python3 scripts-certification/lock-traefik.py
helm lint helm/traefik/traefik-41.7.1.tgz -f configurations/traefik-values.yaml -f configurations/traefik-image-lock.yaml
helm template traefik helm/traefik/traefik-41.7.1.tgz --namespace traefik --kube-version 1.35.8 --skip-crds -f configurations/traefik-values.yaml -f configurations/traefik-image-lock.yaml > helm/traefik/rendu-lock.yaml
```

Une reconstruction depuis une version connue réutilise ses verrous approuvés ; relancer leur résolution constitue une mise à jour à revoir. Le SHA-256 de l'index identifie l'archive, sans remplacer la vérification d'une signature de l'éditeur. **Avant d'installer :** inspectez les changements du rendu, vérifiez que les images utilisent `@sha256:` et appliquez les contrôles statiques du chapitre 14. Un rendu Helm ne prouve pas que l'Ingress répond.

**Étape 2 — Installer et créer l'Ingress.**

```bash title="Poste d'administration · installation optionnelle dans kind-formation"
kubectl --context kind-formation create namespace traefik --dry-run=client -o yaml | kubectl --context kind-formation apply -f -
kubectl --context kind-formation label namespace traefik pod-security.kubernetes.io/enforce=restricted pod-security.kubernetes.io/enforce-version=v1.35 --overwrite
kubectl --context kind-formation apply --dry-run=server -f manifests/exposition/traefik-rbac.yaml
kubectl --context kind-formation apply -f manifests/exposition/traefik-rbac.yaml
helm --kube-context kind-formation install traefik helm/traefik/traefik-41.7.1.tgz --namespace traefik --skip-crds -f configurations/traefik-values.yaml -f configurations/traefik-image-lock.yaml --wait --timeout 5m
kubectl --context kind-formation -n traefik rollout status deployment/traefik --timeout=180s
kubectl --context kind-formation get ingressclass traefik
test -s .secrets/web.crt && test -s .secrets/web.key
kubectl --context kind-formation -n atelier create secret tls web-tls --cert=.secrets/web.crt --key=.secrets/web.key --dry-run=client -o yaml | kubectl --context kind-formation -n atelier apply -f -
kubectl --context kind-formation -n atelier apply --dry-run=server -f manifests/exposition/ingress.yaml
kubectl --context kind-formation -n atelier apply -f manifests/exposition/ingress.yaml
# Si les politiques de l'atelier A08 sont actives, ouverture ingress nécessaire :
kubectl --context kind-formation -n atelier apply -f manifests/exposition/allow-controllers.yaml
```

**Résultat attendu :** rollout `traefik` terminé, IngressClass `traefik` présente, Ingress accepté par le dry-run puis créé.

**Portée de `allow-controllers.yaml` :** il ouvre web, sur le seul port applicatif, aux namespaces dédiés Traefik et Envoy Gateway, et fait donc confiance à **tous** leurs Pods. Réservez l'administration de ces namespaces aux gestionnaires des contrôleurs. Sans politiques d'isolation préalables, cette règle seule n'isole rien : vérifiez le socle de politiques et les tests A08.

**Étape 3 — Tester HTTP et TLS.**

```bash title="Poste d'administration · terminal 1 (laisser actif pendant les contrôles)"
kubectl --context kind-formation -n traefik port-forward --address 127.0.0.1 service/traefik 8080:80 8443:443
```

```bash title="Poste d'administration · terminal 2, même dossier"
curl -fsS -H 'Host: web.k8s.test' http://127.0.0.1:8080/
curl -fsS --cacert .secrets/web.crt --resolve web.k8s.test:8443:127.0.0.1 https://web.k8s.test:8443/
kubectl --context kind-formation -n atelier get ingress web-traefik -o yaml
kubectl --context kind-formation -n atelier get endpointslices -l kubernetes.io/service-name=web
kubectl --context kind-formation -n traefik logs deployment/traefik --tail=100
```

**Interpréter :**

- Le second `curl` vérifie TLS avec le nom attendu et une confiance fournie explicitement ; n'ajoutez pas `-k` pour masquer une erreur.
- Un en-tête `Host` erroné doit donner **l'absence de route**, généralement un 404 — à distinguer d'un backend indisponible.
- Un champ `ADDRESS` vide est possible avec ClusterIP et publication désactivée : seul le test HTTP/TLS fait foi.
- Une panne du Pod cible coupe le port-forward ; ce chemin local ne mesure pas la disponibilité d'un LoadBalancer de production.

**Nettoyage (poste d'administration) :**

1. arrêtez le port-forward avec `Ctrl+C` ;
2. `kubectl --context kind-formation -n atelier delete ingress web-traefik` ;
3. `helm --kube-context kind-formation uninstall traefik -n traefik` ;
4. `kubectl --context kind-formation delete -f manifests/exposition/traefik-rbac.yaml`.

Supprimez `allow-controllers.yaml` du cluster seulement si Envoy Gateway ne l'utilise plus, et le Secret `web-tls` seulement si aucun autre exercice n'en dépend. L'IngressClass gérée par Helm doit disparaître avec la release : contrôlez-le. Conservez chart, verrous, résultats et limites dans le journal ; la destruction de `kind-formation` remet tout le laboratoire à zéro.

<a id="chapitre-13"></a>

## 13. Résilience : répliques, mise à jour et perturbations

**En bref.** Trois serveurs dans la même salle peuvent tomber ensemble. De même, trois Pods n'offrent pas trois domaines de panne s'ils partagent le même nœud, le même hyperviseur ou le même stockage. La résilience se **construit** (capacité, répartition, readiness, budgets) et se **mesure** pendant une perturbation.

### 13.1 Construire un budget de disponibilité

Pensez **réserve de capacité** : il faut des places libres **avant** l'incident, des endpoints prêts et des clients capables de reprendre leurs connexions.

| Mécanisme | Aide à | Ne couvre pas seul |
|---|---|---|
| Répliques | Garder d'autres instances utiles | Données partagées, capacité, domaines de panne |
| Readiness | Retirer une instance non prête des endpoints | Connexions déjà établies, logique métier |
| Startup / liveness | Démarrage lent, blocage local | Panne d'une dépendance externe |
| Répartition topologique | Éviter une concentration | Défaillance de tous les domaines sous-jacents |
| RollingUpdate | Contrôler le remplacement des Pods | Retour arrière métier, compatibilité des schémas |
| PDB | Freiner certaines évictions **volontaires** | Pannes matérielles, suppression directe, pilotage d'un rollout |

Le template `web` choisit `maxSurge: 1`, `maxUnavailable: 0`, `minReadySeconds: 5` et `progressDeadlineSeconds: 180`. Concrètement :

- avec trois répliques, prévoyez la capacité réservée d'**une quatrième**, voire plus si des Pods restent en terminaison ;
- une valeur en pourcentage est arrondie selon les règles du Deployment : ne la lisez pas comme un nombre absolu ;
- le délai de progression crée une **condition d'échec à examiner** ; il ne déclenche pas de retour arrière automatique.

### 13.2 Mise à jour mesurable et retour arrière

**Avant un rollout**, capturez la version ou le digest courant, l'état des 3 réplicas, leur répartition et le taux d'erreur. Le test doit changer le **template de Pod** (ici une annotation d'exercice), pas une configuration active incompatible avec les deux versions.

```bash title="Poste d'administration · terminal 1 (la mesure tourne dans le client du cluster)"
mkdir -p evidence
kubectl --context kind-formation -n atelier exec deploy/client -- sh -c \
  'i=0; while [ "$i" -lt 120 ]; do date -u +%FT%TZ; curl -sS --max-time 2 -o /dev/null -w "http=%{http_code} duree=%{time_total}\n" http://web/ || echo ERREUR; i=$((i+1)); sleep 1; done' \
  > evidence/rollout-http.txt
# Où : poste administration, terminal 2, après démarrage de la mesure.
kubectl --context kind-formation -n atelier rollout history deploy/web
kubectl --context kind-formation -n atelier patch deploy web --type merge -p '{"spec":{"template":{"metadata":{"annotations":{"formation/iteration":"2"}}}}}'
kubectl --context kind-formation -n atelier rollout status deploy/web --timeout=210s
kubectl --context kind-formation -n atelier get pods -l app=web -o wide
```

**Ce que mesure le terminal 1 :** 120 requêtes, une par seconde, avec code HTTP et durée, ou `ERREUR`.

**Analyser :** comptez requêtes, erreurs et latences, et comparez avant / pendant / après. Une fréquence de 1 s et un délai de 2 s ne détectent pas toutes les coupures courtes. Précisez le périmètre : requêtes HTTP courtes via le Service, ni TLS externe ni sessions longues.

**Si le rollout échoue :** conservez logs et événements, comparez le dernier template, puis corrigez ou revenez en arrière avec `kubectl --context kind-formation -n atelier rollout undo deploy/web`. Attendez la fin, vérifiez le trafic, puis **reportez le retour dans Git** : sinon, la source erronée reproduira l'incident au prochain `apply`.

:::caution[Un rollback ne restaure pas les données]
`rollout undo` restaure le template du Deployment, pas les migrations de base, les valeurs de Secret ou le contenu du disque.
:::

### 13.3 PDB, cordon, drain et capacité restante

Un **PDB** (*PodDisruptionBudget*) limite les évictions qui passent par l'API d'éviction. `manifests/availability/pdb-web.yaml` exige `minAvailable: 2`. Il ne protège pas contre un arrêt matériel, une partition réseau, la suppression directe d'un Pod ni le rolling update. Les indisponibilités existantes consomment son budget et peuvent bloquer une maintenance : c'est une **information à traiter**, pas un obstacle à forcer.

```bash title="Poste d'administration · LAB kind 3 nœuds uniquement, pas la variante allégée"
kubectl --context kind-formation -n atelier apply -f manifests/availability/pdb-web.yaml
kubectl --context kind-formation -n atelier get pdb web
kubectl --context kind-formation cordon formation-worker
kubectl --context kind-formation drain formation-worker --ignore-daemonsets --timeout=180s
# Si refus pour emptyDir : lire les données temporaires concernées AVANT l'option suivante.
# LAB uniquement, perte explicite des emptyDir des Pods évacués sur ce worker :
# kubectl --context kind-formation drain formation-worker --ignore-daemonsets --delete-emptydir-data --timeout=180s
kubectl --context kind-formation -n atelier get pods -o wide
kubectl --context kind-formation uncordon formation-worker
```

| Commande | Effet | Ce qu'elle ne fait pas |
|---|---|---|
| `cordon` | Empêche les nouvelles affectations classiques | Ne retire pas les Pods existants |
| `drain` | Évince les Pods admissibles en respectant les PDB | Ne gère pas les DaemonSets (`--ignore-daemonsets`) |
| `uncordon` | Rend le nœud de nouveau planifiable | Ne rééquilibre pas les Pods déjà déplacés |

**Résultat attendu :** les Pods web quittent `formation-worker` sans jamais descendre sous 2 Pods disponibles, puis le nœud redevient planifiable.

Sur le dernier worker, un blocage peut venir du PDB, de l'affinité ou d'un manque de capacité. N'utilisez pas `--disable-eviction` et ne supprimez pas le PDB pour « faire passer » l'exercice. Après un drain interrompu, faites toujours un inventaire et un `uncordon` du worker concerné.

### 13.4 Trois scénarios de panne à ne pas confondre

1. **Perte de Pod.** Depuis le poste, listez avec `kubectl --context kind-formation -n atelier get pods -l app=web`, notez l'UID d'un Pod et supprimez **ce seul** Pod. Attendez son remplacement ; comparez UID, nombre de Pods Ready et requêtes HTTP. Correction : aucune si le template est sain et la capacité disponible.
2. **Perte de nœud (VM uniquement).** Avec w1/w2 et une API saine, lancez la mesure depuis un client situé sur w2, notez les Pods de w1, puis arrêtez **w1 dans l'hyperviseur**. Observez la condition Ready du nœud, ses taints, les événements et les nouveaux Pods sur w2 ; n'annoncez pas de délai fixe. Redémarrez w1, vérifiez IP, réseau, runtime, nœud Ready et l'absence de double écrivain. Avec un volume local, la reprise ailleurs peut être impossible : ne forcez pas la suppression d'un Pod de StatefulSet avant d'avoir isolé (*fencing*) l'ancien nœud.
3. **Perte d'une dépendance applicative.** Couper le Service d'une dépendance montre que trois frontends ne suppriment pas une dépendance unique. L'atelier complet est au [§13.5](#atelier-dependance).

**Fiche à remplir pour chaque scénario :** hypothèse de panne, version, heure d'injection, preuve avant, preuve pendant, action de retour, dernière requête en erreur, retour stabilisé, données éventuellement perdues. Ne la remplissez qu'**après exécution**. Pour la perte de nœud, les délais résultent des Leases, de la détection, des tolérances d'éviction, du scheduling et de l'attachement du stockage ; arrêter seulement le kubelet ne représente pas toutes les pannes matérielles.

:::tip[À retenir]
« Aucune erreur observée sur 120 requêtes courtes dans ce laboratoire » est une conclusion limitée et vérifiable. « Sans aucune interruption » exige des hypothèses et des mesures bien plus fortes.
:::

**Sources :** [rollout Deployment](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/controllers/deployment/), [perturbations et PDB](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/pods/disruptions/), [drain](https://v1-35.docs.kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/), [arrêt des Pods](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination), [Nodes](https://v1-35.docs.kubernetes.io/docs/concepts/architecture/nodes/).

<a id="atelier-dependance"></a>

### 13.5 Atelier : une dépendance perdue, un processus vivant, un service dégradé

**À quoi ça sert.** Montrer qu'un frontend peut rester « vivant » et « prêt » tout en échouant à servir une fonction qui dépend d'un autre service — et donc la limite des probes locales.

**Ce que déploie `manifests/resilience/dependance.yaml`** dans le namespace isolé `resilience` : un frontend nginx, son backend `dependance` et un client curl. Les images sont fixées par digest ; les Pods respectent PSA Restricted v1.35, s'exécutent sans root et n'écrivent que dans un `emptyDir` monté sur `/tmp`.

**Prérequis :** `kind-formation` démarré, Calico opérationnel et politiques effectivement appliquées, CoreDNS disponible, droits de déploiement et d'exécution dans ce namespace, `kubectl` et `jq` sur le poste Linux/WSL2. L'injection est **réversible** : elle modifie uniquement le selector du Service `dependance`, sans effacer de Pod ni de donnée.

```bash title="Poste d'administration Linux/WSL2 · racine du dossier associé"
bash scripts/test-dependency.sh
```

**Déroulement du script :**

1. **Baseline** : déploiement, attente des Deployments, puis exigence d'un HTTP 200 sur `/api`. Les NetworkPolicies autorisent DNS, client → frontend et frontend → backend ; un test par IP doit prouver que client → backend est **refusé** (sinon, une panne réseau générale pourrait passer pour une politique efficace).
2. **Injection** : le selector du backend est remplacé par un label sans Pod. Une fois les EndpointSlices vides, `/healthz` et `/ready` restent à **200**, alors que `/api` renvoie **502**.
3. **Retour** : le selector original et l'UID du Service, sauvegardés au départ, sont remis en place ; le test final exige `/api` à 200 et l'égalité du selector.

**Interpréter le 502 :** pour rendre le contrat pédagogique explicite, la configuration nginx convertit aussi les erreurs upstream 503/504 en 502. Ce code seul n'identifie donc pas la cause : examinez le selector, les EndpointSlices et le journal du proxy. Les [directives proxy nginx](https://nginx.org/en/docs/http/ngx_http_proxy_module.html) décrivent ce traitement.

**Robustesse du retour.** Un `trap` tente la remise en place après une erreur ou une interruption habituelle. Une coupure électrique ou un `SIGKILL` peut l'empêcher : le patch exact et sa commande de reprise restent dans `validations/dependance/`. Horodatages, latences, événements et journaux y sont conservés ; ce seront des preuves **observées uniquement après exécution**, laquelle n'a pas été réalisée pendant la rédaction.

**Leçon :** les probes locales ne voient pas la panne de la dépendance — mais inclure systématiquement chaque dépendance dans la readiness n'est pas une bonne règle non plus : une mauvaise décision peut amplifier une panne.

**Nettoyage :** après inspection des preuves, `kubectl --context kind-formation delete namespace resilience` depuis le poste. Tous les objets de l'atelier sont supprimés ; le script permet de les reconstruire.

<a id="chapitre-14"></a>

## 14. Reproductibilité : fichiers, Git, Kustomize et Helm

**En bref.** Reproduire un laboratoire demande plus qu'une suite de commandes : il faut conserver les intentions, les dépendances, les paramètres, les versions, les **digests** et les observations. Git permet de reconstruire une configuration connue ; il ne restaure pas les disques et ne rend pas les tags d'images immuables.

### 14.1 Une version connue du laboratoire

```text title="Arborescence du dossier associé"
refonte-kubernetes-etcd/
├── kubernetes-etcd-guide-complet-securite-resilience-certification.md
├── originaux/                       # copies intègres, jamais écrasées
├── configurations/                  # kind, kubeadm, HAProxy, valeurs contrôleurs
├── manifests/
│   ├── base/                        # namespace, nginx, Service, ConfigMap, clients
│   ├── overlays/lab/                # références des images par digest
│   ├── overlays/complements/        # Jobs, CronJob, DS et stockage avec digests
│   ├── network/                     # progression deny → DNS → web
│   ├── availability/                # PDB
│   ├── resources/                   # quotas, LimitRange, HPA optionnel
│   ├── storage/                     # Service headless et StatefulSet
│   ├── exposition/                  # Gateway, Ingress et autorisations dédiées
│   └── resilience/                  # dépendance et isolation de l'exercice
├── helm/                            # chart local, charts optionnels contrôlés
├── scripts/                         # installation, rendu, contrôles et lab
├── scripts-etcd/                    # outils clients et sauvegarde protégée
├── scripts-certification/           # verrouillage des extensions d'atelier
├── exercices/                       # énoncés sans corrections
├── corriges/                        # réponses et preuves attendues
├── references/                      # programmes officiels consultés
├── validations/                     # rapports, limites et inventaire à compléter
├── images.lock.json                 # digests résolus depuis le registre
├── versions.env                     # versions et contexte explicites
└── .secrets/                        # local uniquement, ignoré Git
```

La reproduction bit à bit d'une **image construite** exige en plus un contexte de build, un compilateur et des entrées déterministes.

### 14.2 Initialiser Git et reconstruire une révision

Le dossier livré n'initialise pas de dépôt par surprise. Après lecture des `.gitignore` et des fichiers à inclure :

```bash title="Poste d'administration · racine du dossier associé"
git init
git status --short
git add .
git diff --cached --stat
# Relire le contenu et s'assurer qu'aucun kubeconfig, token ou clé privée n'est indexé.
git commit -m 'Guide Kubernetes et etcd : laboratoire de référence'
git tag formation-2026-10-16
git rev-parse HEAD
```

**Résultat attendu :** `git diff --cached --stat` ne liste **aucun** fichier de `.secrets/`, kubeconfig ou clé ; `rev-parse` affiche le hash du commit.

Consignez ce hash réel dans l'inventaire. **Pour reconstruire :** clonez l'URL réelle de votre dépôt (paramètre à fournir), faites un checkout du tag ou du commit enregistré, installez les prérequis, puis lancez `lab-up`. Ne relancez pas `lock-images.py` pour reconstruire une version connue : réutilisez le verrou commité. Mettre à jour un verrou est une modification délibérée, à relire et valider.

### 14.3 Résoudre et vérifier les digests

`scripts/lock-images.py` interroge Docker Hub pour les trois tags fixés, calcule le SHA-256 du manifeste reçu et le compare à l'en-tête `Docker-Content-Digest`. Il écrit `images.lock.json` et les overlays ; ses jetons anonymes ne sont pas enregistrés. Les digests du livrable ont été réellement résolus le 16/10/2026. Ils peuvent désigner un **index multiarchitecture** : contrôlez l'architecture choisie par les nœuds, puis relevez les `imageID` effectifs des conteneurs.

```bash title="Poste d'administration · seulement pour mettre à jour le verrou, puis inspection"
python3 scripts/lock-images.py
git diff -- images.lock.json manifests/overlays/
# Où : poste administration, inspection après déploiement.
kubectl --context kind-formation -n atelier get pods -l app=web -o jsonpath='{range .items[*]}{.metadata.name}{" "}{.status.containerStatuses[0].imageID}{"\n"}{end}'
```

**Résultat attendu :** chaque Pod affiche un `imageID` en `…@sha256:…` cohérent avec le verrou.

Un digest garantit un **contenu immuable**, pas un contenu digne de confiance ou sans vulnérabilité. Approuver une image implique scan, provenance, signatures si disponibles et décision sur les risques (§15). Les workloads optionnels cert-manager et Traefik ont leurs propres verrous. Les scripts n'inventent pas de signature pour un éditeur qui n'en publie pas.

### 14.4 Kustomize et séparation des environnements

- La **base** garde les objets lisibles.
- L'overlay **lab** remplace les références d'images par des digests, sans copier tous les manifests.
- L'overlay **complements** référence les **répertoires** `workloads/` et `storage/` munis de leur kustomization : des fichiers individuels situés au-dessus pourraient être bloqués par le *load restrictor*. Le guide garde ce contrôle, sans ajouter de `LoadRestrictionsNone` silencieux.

**Pour un deuxième environnement**, créez un autre overlay avec un namespace et des paramètres explicites ; attention aux noms globaux, aux PVC, aux hostnames et aux labels de sécurité. Le namespace `atelier` est écrit en dur dans la base : un overlay qui le change doit aussi rendre cohérents la ressource Namespace et les règles entre namespaces. Un simple changement de `replicas` ne fait pas une « production ».

```bash title="Poste d'administration · rendu local, sans requête au serveur"
kubectl kustomize manifests/overlays/lab > validations/rendered-lab.yaml
kubectl kustomize manifests/overlays/complements > validations/rendered-complements.yaml
```

### 14.5 Helm : paramètres et historique d'une release

Helm **rend** un chart puis gère une **release** ; il ne surveille pas la disponibilité de l'application. Le chart local `helm/web` montre un package paramétré dont le schéma de valeurs **refuse un digest vide**. Il est volontairement indépendant de la base Kustomize : un même objet ne doit pas être géré par deux sources.

```bash title="Poste d'administration · Python du venv et Helm 4.2.3"
NGINX_DIGEST=$(python3 -c 'import json; print(next(x["digest"] for x in json.load(open("images.lock.json"))["images"] if x["name"]=="nginxinc/nginx-unprivileged"))')
helm lint helm/web --set-string image.digest="$NGINX_DIGEST"
helm template revision helm/web --namespace helm-atelier --kube-version 1.35.8 --set-string image.digest="$NGINX_DIGEST" > validations/rendered-helm.yaml
kubectl --context kind-formation create namespace helm-atelier
kubectl --context kind-formation label namespace helm-atelier pod-security.kubernetes.io/enforce=restricted pod-security.kubernetes.io/enforce-version=v1.35
helm --kube-context kind-formation upgrade --install revision helm/web --namespace helm-atelier --set-string image.digest="$NGINX_DIGEST" --wait --timeout 180s
helm --kube-context kind-formation history revision --namespace helm-atelier
kubectl --context kind-formation -n helm-atelier get deploy,svc,pods
```

**Vérifier :** testez HTTP via un port-forward local du Service `revision-web` avant de déclarer l'application fonctionnelle.

**Nettoyage :** `helm --kube-context kind-formation uninstall revision -n helm-atelier`, puis supprimez le namespace `helm-atelier` seulement s'il est vide et sans donnée à garder.

**Limites :** `helm rollback` restaure une révision de release, pas les données. Les Secrets internes des releases Helm peuvent contenir des valeurs sensibles : RBAC et chiffrement au repos restent nécessaires.

### 14.6 Réconcilier une modification manuelle

Une correction urgente `kubectl scale` modifie l'API, pas le dépôt :

- si l'intention durable reste **3** répliques, réappliquez l'overlay après validation ;
- si **4** répliques sont nécessaires, modifiez le YAML, contrôlez le diff, commitez et déployez cette intention.

Attention : réappliquer l'ancien YAML peut **ne pas retirer** un champ ajouté manuellement. Il faut alors un patch de retour exact, ou une réconciliation qui possède ce champ. Les injections du catalogue de diagnostic sauvegardent les objets avant modification pour cette raison.

Avec **Server-Side Apply**, `managedFields` indique quel gestionnaire possède chaque champ. Un conflit révèle un chevauchement d'autorité : n'ajoutez pas `--force-conflicts` par réflexe. Le *field manager* et la source de vérité doivent être explicites.

### 14.7 Une chaîne de validation à plusieurs preuves

Chaque étape prouve quelque chose — et laisse une question ouverte pour la suivante.

| Étape | Outil / commande | Ce qui est démontré | Ce qui reste à prouver |
|---|---|---|---|
| Syntaxe | Python/PyYAML, `bash -n` | Fichiers lisibles, syntaxe acceptable | Sens des champs, fonctionnement |
| Schéma natif | `scripts/validate-static.py`, OpenAPI officiel 1.35.8 | Types et champs conformes au schéma, exclusions consignées | Admission, CRD externes |
| Rendu | `kubectl kustomize`, `helm lint/template` | Paramètres transformés en objets, aucune dépendance masquée | Acceptation réelle par le cluster |
| Comparaison | `kubectl diff` | Changements proposés sur la cible | Décision de les appliquer |
| API | `apply --dry-run=server --validate=strict` | Schéma et admission du serveur réel | Scheduling, téléchargement d'image, volumes, trafic |
| Fonctionnement | rollout, curl, données | Service utile dans les conditions testées | Isolation, incidents |
| Sécurité | permissions oui/non, NetworkPolicies baseline/refus/autorisation | Contrôles effectifs sur ces chemins | Autres vecteurs, changements futurs |
| Résilience | scénarios et reprise chronométrée | Résultat pour la panne injectée | Garanties au-delà des hypothèses |

**En pratique (poste d'administration) :** `python3 scripts/validate-static.py`, puis `bash scripts/validate-api.sh`. Une erreur de schéma ou d'admission bloque l'étape suivante. Les `dry-run` n'ont pas été lancés pendant la rédaction, faute de serveur de laboratoire. Une CI peut appeler ces mêmes scripts et conserver les rapports ; ses identifiants doivent être limités à la cible et absents des logs.

**Sources :** [Kustomize](https://kubectl.docs.kubernetes.io/references/kustomize/), [Helm template](https://helm.sh/docs/helm/helm_template/), [Helm valeurs](https://helm.sh/docs/topics/charts/), [Server-Side Apply](https://v1-35.docs.kubernetes.io/docs/reference/using-api/server-side-apply/), [dry-run API](https://v1-35.docs.kubernetes.io/docs/reference/using-api/api-concepts/#dry-run), [images](https://v1-35.docs.kubernetes.io/docs/concepts/containers/images/).


<a id="chapitre-15"></a>

## 15. Sécuriser les accès, les workloads et la chaîne logicielle

**En bref.** La sécurité Kubernetes repose sur plusieurs **frontières de confiance** indépendantes : qui peut appeler l'API, ce qu'il peut faire, ce que les Pods ont le droit d'exécuter, comment les secrets sont protégés et d'où viennent les images. Chaque contrôle se démontre par **un cas autorisé et un cas refusé**.

**Parcours :** découvrir les frontières (§15.1) ; pratiquer RBAC et l'admission (§15.2 à 15.4) ; approfondir secrets, audit et images (§15.5 à 15.9). **Référence :** Kubernetes 1.35.8, Linux, règles PSS `v1.35`, sources vérifiées le 16 octobre 2026. Les exemples sont proposés pour le laboratoire, sans revendication d'exécution réelle.

### 15.1 Trois contrôles différents pour une requête

<div class="not-content kd-figure" style="margin:1.5rem 0">
<svg xmlns="http://www.w3.org/2000/svg" class="kd" style="max-width:100%;height:auto;display:block" data-pagefind-ignore width="520" height="566" viewBox="0 0 520 566" role="img" aria-labelledby="kd41-t kd41-d">
<title id="kd41-t">Le parcours d'une requête dans l'API</title>
<desc id="kd41-d">Une requête passe successivement par l'authentification (échec : 401 Unauthorized), l'autorisation RBAC (échec : 403 Forbidden), l'admission mutante qui peut compléter l'objet, la validation et l'admission validante comme Pod Security qui peuvent refuser, puis la persistance dans etcd.</desc>
<style>
svg.kd text{font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;fill:#111827}
svg.kd .bg{fill:#f7f8fb;stroke:#d5dbe5;stroke-width:1.5}
svg.kd .ttl{font-size:19px;font-weight:700}
svg.kd .tb{font-size:17px;font-weight:700}
svg.kd .tb15{font-size:16px;font-weight:700}
svg.kd .t{font-size:16px}
svg.kd .s{font-size:15px;fill:#374151}
svg.kd .ok{fill:#166534;font-weight:700}
svg.kd .bad{fill:#b91c1c;font-weight:700}
svg.kd .k-blue{fill:#e8eefc;stroke:#2f5bd3}
svg.kd .k-teal{fill:#e1f3ef;stroke:#0f766e}
svg.kd .k-violet{fill:#efe9fd;stroke:#6d28d9}
svg.kd .k-amber{fill:#fdf3e1;stroke:#b45309}
svg.kd .k-red{fill:#fdeaea;stroke:#b91c1c}
svg.kd .k-green{fill:#e6f5ea;stroke:#15803d}
svg.kd .k-gray{fill:#ffffff;stroke:#8b97a8}
svg.kd .k-panel{fill:#eef1f6;stroke:#c3cbd8}
svg.kd .dash{stroke-dasharray:6 5}
svg.kd .ln{stroke:#4b5563;stroke-width:2;fill:none}
svg.kd .ln-ok{stroke:#15803d}
svg.kd .ln-bad{stroke:#b91c1c}
svg.kd .life{stroke:#8b97a8;stroke-width:1.5;stroke-dasharray:4 5;fill:none}
svg.kd .ah{fill:#4b5563}
svg.kd .ah-ok{fill:#15803d}
svg.kd .ah-bad{fill:#b91c1c}
svg.kd .bdg{fill:#2f5bd3}
svg.kd .bdg-t{fill:#ffffff;font-size:13px;font-weight:700}
:root[data-theme='dark'] svg.kd text{fill:#f3f4f6}
:root[data-theme='dark'] svg.kd .bg{fill:#111827;stroke:#374151}
:root[data-theme='dark'] svg.kd .s{fill:#d1d5db}
:root[data-theme='dark'] svg.kd .ok{fill:#86efac}
:root[data-theme='dark'] svg.kd .bad{fill:#fca5a5}
:root[data-theme='dark'] svg.kd .k-blue{fill:#1b2a4d;stroke:#8fb1ff}
:root[data-theme='dark'] svg.kd .k-teal{fill:#0f302c;stroke:#5eead4}
:root[data-theme='dark'] svg.kd .k-violet{fill:#2a1f4d;stroke:#c4b5fd}
:root[data-theme='dark'] svg.kd .k-amber{fill:#3a2a10;stroke:#fcd34d}
:root[data-theme='dark'] svg.kd .k-red{fill:#3d1717;stroke:#fca5a5}
:root[data-theme='dark'] svg.kd .k-green{fill:#12321d;stroke:#86efac}
:root[data-theme='dark'] svg.kd .k-gray{fill:#1f2937;stroke:#6b7280}
:root[data-theme='dark'] svg.kd .k-panel{fill:#172030;stroke:#334155}
:root[data-theme='dark'] svg.kd .ln{stroke:#cbd5e1}
:root[data-theme='dark'] svg.kd .ln-ok{stroke:#86efac}
:root[data-theme='dark'] svg.kd .ln-bad{stroke:#fca5a5}
:root[data-theme='dark'] svg.kd .life{stroke:#6b7280}
:root[data-theme='dark'] svg.kd .ah{fill:#cbd5e1}
:root[data-theme='dark'] svg.kd .ah-ok{fill:#86efac}
:root[data-theme='dark'] svg.kd .ah-bad{fill:#fca5a5}
:root[data-theme='dark'] svg.kd .bdg{fill:#8fb1ff}
:root[data-theme='dark'] svg.kd .bdg-t{fill:#0b1220}
@media (prefers-color-scheme:dark){
:root:not([data-theme]) svg.kd text{fill:#f3f4f6}
:root:not([data-theme]) svg.kd .bg{fill:#111827;stroke:#374151}
:root:not([data-theme]) svg.kd .s{fill:#d1d5db}
:root:not([data-theme]) svg.kd .ok{fill:#86efac}
:root:not([data-theme]) svg.kd .bad{fill:#fca5a5}
:root:not([data-theme]) svg.kd .k-blue{fill:#1b2a4d;stroke:#8fb1ff}
:root:not([data-theme]) svg.kd .k-teal{fill:#0f302c;stroke:#5eead4}
:root:not([data-theme]) svg.kd .k-violet{fill:#2a1f4d;stroke:#c4b5fd}
:root:not([data-theme]) svg.kd .k-amber{fill:#3a2a10;stroke:#fcd34d}
:root:not([data-theme]) svg.kd .k-red{fill:#3d1717;stroke:#fca5a5}
:root:not([data-theme]) svg.kd .k-green{fill:#12321d;stroke:#86efac}
:root:not([data-theme]) svg.kd .k-gray{fill:#1f2937;stroke:#6b7280}
:root:not([data-theme]) svg.kd .k-panel{fill:#172030;stroke:#334155}
:root:not([data-theme]) svg.kd .ln{stroke:#cbd5e1}
:root:not([data-theme]) svg.kd .ln-ok{stroke:#86efac}
:root:not([data-theme]) svg.kd .ln-bad{stroke:#fca5a5}
:root:not([data-theme]) svg.kd .life{stroke:#6b7280}
:root:not([data-theme]) svg.kd .ah{fill:#cbd5e1}
:root:not([data-theme]) svg.kd .ah-ok{fill:#86efac}
:root:not([data-theme]) svg.kd .ah-bad{fill:#fca5a5}
:root:not([data-theme]) svg.kd .bdg{fill:#8fb1ff}
:root:not([data-theme]) svg.kd .bdg-t{fill:#0b1220}
}
</style>
<defs>
<marker id="kd41-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah"/></marker>
<marker id="kd41-a-ok" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah-ok"/></marker>
<marker id="kd41-a-bad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah-bad"/></marker>
</defs>
<rect x="1" y="1" width="518" height="564" rx="14" class="bg"/>
<text x="20" y="34" class="ttl">Le parcours d'une requête dans l'API</text>
<rect x="20" y="56" width="480" height="70" rx="10" class="k-blue" stroke-width="1.6"/>
<circle cx="44" cy="91" r="11" class="bdg"/>
<text x="44" y="95.6" class="bdg-t" text-anchor="middle">1</text>
<text x="66" y="86" class="tb" text-anchor="start">Authentification</text>
<text x="66" y="108" class="s" text-anchor="start"><tspan class="s">Qui envoie la requête ? </tspan><tspan class="bad">Échec : 401</tspan></text>
<path d="M260,128 L260,150" class="ln" marker-end="url(#kd41-a)"/>
<rect x="20" y="152" width="480" height="70" rx="10" class="k-blue" stroke-width="1.6"/>
<circle cx="44" cy="187" r="11" class="bdg"/>
<text x="44" y="191.6" class="bdg-t" text-anchor="middle">2</text>
<text x="66" y="182" class="tb" text-anchor="start">Autorisation (RBAC)</text>
<text x="66" y="204" class="s" text-anchor="start"><tspan class="s">A-t-elle le droit ? </tspan><tspan class="bad">Échec : 403</tspan></text>
<path d="M260,224 L260,246" class="ln" marker-end="url(#kd41-a)"/>
<rect x="20" y="248" width="480" height="70" rx="10" class="k-amber" stroke-width="1.6"/>
<circle cx="44" cy="283" r="11" class="bdg"/>
<text x="44" y="287.6" class="bdg-t" text-anchor="middle">3</text>
<text x="66" y="278" class="tb" text-anchor="start">Admission mutante</text>
<text x="66" y="300" class="s" text-anchor="start"><tspan class="s">Faut-il compléter l'objet ? </tspan><tspan class="s">Ex. : défauts</tspan></text>
<path d="M260,320 L260,342" class="ln" marker-end="url(#kd41-a)"/>
<rect x="20" y="344" width="480" height="70" rx="10" class="k-amber" stroke-width="1.6"/>
<circle cx="44" cy="379" r="11" class="bdg"/>
<text x="44" y="383.6" class="bdg-t" text-anchor="middle">4</text>
<text x="66" y="374" class="tb" text-anchor="start">Validation et admission validante</text>
<text x="66" y="396" class="s" text-anchor="start"><tspan class="s">Est-ce conforme ? </tspan><tspan class="bad">Ex. : refus PSA</tspan></text>
<path d="M260,416 L260,438" class="ln" marker-end="url(#kd41-a)"/>
<rect x="20" y="440" width="480" height="70" rx="10" class="k-violet" stroke-width="1.6"/>
<circle cx="44" cy="475" r="11" class="bdg"/>
<text x="44" y="479.6" class="bdg-t" text-anchor="middle">5</text>
<text x="66" y="470" class="tb" text-anchor="start">Persistance dans etcd</text>
<text x="66" y="492" class="s" text-anchor="start"><tspan class="s">Objet enregistré, visible des contrôleurs</tspan></text>
<text x="20" y="544" class="s" text-anchor="start">Une permission RBAC ne garantit pas l'admission du manifeste.</text>
</svg>
</div>

| Contrôle | Question posée | Échec typique |
|---|---|---|
| **Authentification** | Quelle identité présente la requête ? | `401 Unauthorized` |
| **Autorisation** (RBAC) | Cette identité peut-elle faire cette action sur cette ressource ? | `403 Forbidden` |
| **Admission** | La modification autorisée est-elle acceptable ? (ex. : un Pod qui demande trop de privilèges) | Refus explicite, par exemple de Pod Security |

Conséquences : une authentification réussie ne donne pas tous les droits, et une permission RBAC ne garantit pas que le manifeste sera admis. Documentation : [authentification](https://v1-35.docs.kubernetes.io/docs/reference/access-authn-authz/authentication/), [autorisation](https://v1-35.docs.kubernetes.io/docs/reference/access-authn-authz/authorization/), [admission](https://v1-35.docs.kubernetes.io/docs/reference/access-authn-authz/admission-controllers/).

**Analogie :** le badge identifie une personne, la liste d'accès lui ouvre certaines salles, puis le règlement vérifie l'objet qu'elle veut introduire. Limite : le cluster applique des règles à chaque requête, il ne juge pas les intentions.

**Le kubeconfig** contient ou référence l'adresse de l'API, son autorité de certification et un moyen d'authentification. Sur le poste Linux/WSL :

- protégez le fichier par des permissions restrictives ; séparez identités ordinaires et accès de secours ;
- inspectez tout kubeconfig inconnu : il peut contenir un plugin `exec` qui lance un programme ;
- ne contournez jamais TLS avec `--insecure-skip-tls-verify` ;
- un contexte explicite évite les erreurs de cible, mais **ne constitue pas** un contrôle de permission.

Voir [l'organisation des accès par kubeconfig](https://v1-35.docs.kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/).

### 15.2 RBAC : donner une capacité vérifiable

**RBAC** (*Role-Based Access Control*) accorde des permissions à des identités par l'intermédiaire de rôles.

| Objet | Portée |
|---|---|
| `Role` | Permissions dans **un** namespace |
| `ClusterRole` | Règles réutilisables, ou portant sur des ressources du cluster |
| `RoleBinding` | Accorde un Role — ou un ClusterRole — **dans son namespace** |
| `ClusterRoleBinding` | Accorde un ClusterRole à l'échelle du cluster |

Les permissions **s'additionnent** : un rôle restrictif ne retire pas une permission reçue ailleurs. Le nom `alice` dans un binding ne crée aucun compte utilisateur. Voir [Using RBAC Authorization](https://kubernetes.io/docs/reference/access-authn-authz/rbac/).

**Atelier RBAC — objectif :** une identité technique `auditeur` peut lire les Pods et leurs logs, mais ni supprimer de Pod, ni lire les Secrets. Enregistrez le document complet ci-dessous dans `manifests/security/rbac-auditeur.yaml`, à la racine du dossier associé. L'administrateur doit déjà pouvoir créer ces objets ; le workload `web` n'a pas besoin de ce rôle.

```yaml title="manifests/security/rbac-auditeur.yaml"
apiVersion: v1
kind: ServiceAccount
metadata:
  name: auditeur
  namespace: atelier
automountServiceAccountToken: false
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: lecture-pods
  namespace: atelier
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list", "watch"]
  - apiGroups: [""]
    resources: ["pods/log"]
    verbs: ["get"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: auditeur-lecture-pods
  namespace: atelier
subjects:
  - kind: ServiceAccount
    name: auditeur
    namespace: atelier
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: lecture-pods
```

`apiGroups: [""]` désigne le groupe d'API « cœur », celui des Pods.

```bash title="Poste d'administration · kubectl et jq installés"
kubectl --context kind-formation -n atelier apply -f manifests/security/rbac-auditeur.yaml
kubectl --context kind-formation -n atelier auth can-i list pods --as=system:serviceaccount:atelier:auditeur
kubectl --context kind-formation -n atelier auth can-i get pods/log --as=system:serviceaccount:atelier:auditeur
kubectl --context kind-formation -n atelier auth can-i delete pods --as=system:serviceaccount:atelier:auditeur
kubectl --context kind-formation -n atelier auth can-i get secrets --as=system:serviceaccount:atelier:auditeur
kubectl --context kind-formation -n atelier get pods --as=system:serviceaccount:atelier:auditeur
kubectl --context kind-formation -n atelier get secrets --as=system:serviceaccount:atelier:auditeur
```

**Résultat attendu :** `yes`, `yes`, `no`, `no`, puis une liste de Pods et un refus `Forbidden`. Ce sont des attentes, pas un compte rendu de test.

**Vérifier correctement :** `--as` exige que **votre** identité ait le droit d'impersonation ; il teste l'autorisation effective de l'identité simulée, pas l'authenticité d'un jeton. Si un test négatif répond `yes`, inspectez les bindings existants avant de conclure.

:::caution[Erreur fréquente : les chemins d'accès indirects]
Autoriser `create pods` permet souvent de monter des Secrets et d'utiliser d'autres ServiceAccounts du même namespace. Le moindre privilège porte aussi sur les sous-ressources (`exec`) et les verbes `bind`, `escalate` et `impersonate`. Évitez les jokers `*` et réexaminez les droits à chaque ajout d'API. Voir les [bonnes pratiques RBAC](https://v1-35.docs.kubernetes.io/docs/concepts/security/rbac-good-practices/).
:::

**Exercice.** Permettre à `auditeur` de lire **uniquement** le ConfigMap `web-config`, sans pouvoir lister tous les ConfigMaps. Indices : quel est l'API group du ConfigMap ? Que fait `resourceNames` ? Testez `get` sur deux noms, puis `list`.

<details>
<summary>Corrigé expliqué</summary>

Ajoutez au Role la règle `apiGroups: [""]`, `resources: ["configmaps"]`, `resourceNames: ["web-config"]`, `verbs: ["get"]`, et gardez le manifeste complet comme source déclarative.

Vérifiez avec `kubectl --context kind-formation -n atelier auth can-i get configmap/web-config --as=system:serviceaccount:atelier:auditeur`, puis le même test pour `configmap/autre`, puis pour `list configmaps`. Attendus : `yes`, `no`, `no`. Si le nom du ConfigMap de l'application diffère, utilisez celui de `manifests/base/configmap-web.yaml`.

</details>

### 15.3 ServiceAccounts et jetons : réduire l'exposition

Un Pod n'a pas besoin de jeton pour recevoir un ConfigMap ou un Secret monté par le kubelet : le Deployment `web` utilise donc `automountServiceAccountToken: false`.

Quand une application appelle réellement l'API :

- donnez-lui un **ServiceAccount dédié** et un **jeton projeté**, avec audience et durée adaptées ;
- le kubelet renouvelle les jetons projetés : l'application doit **relire le fichier** ;
- évitez les anciens Secrets de jetons à longue durée de vie ;
- `kubectl create token` utilise l'API TokenRequest ; la durée demandée n'est pas forcément celle accordée ;
- n'affichez jamais un jeton dans un corrigé et ne le placez jamais dans Git.

Un jeton volé donne les permissions de son identité tant qu'il est accepté. TLS protège le transport, RBAC limite l'action, une durée courte et la protection des fichiers réduisent l'exposition : aucun ne remplace les autres.

**Vérifier :** absence du montage du jeton dans les Pods `web` et dans leur template, sans jamais afficher de jeton. Voir [Service Accounts](https://v1-35.docs.kubernetes.io/docs/concepts/security/service-accounts/).

### 15.4 Pod Security : un socle, puis les besoins de l'application

Les **Pod Security Standards** (PSS) définissent trois profils : `Privileged`, `Baseline` et `Restricted`. **Pod Security Admission** (PSA) est le contrôleur intégré qui les applique selon des **labels de namespace**, en trois modes : `enforce` (refuse), `audit` (journalise), `warn` (avertit).

**Migrer un namespace :** commencez en `warn` et `audit`, inventoriez les violations, puis activez `enforce`. Les labels n'expulsent pas les Pods existants : testez aussi leur recréation. Le laboratoire fixe `enforce-version: v1.35` pour que la politique n'évolue pas implicitement avec le cluster. Voir [Pod Security Admission](https://v1-35.docs.kubernetes.io/docs/concepts/security/pod-security-admission/).

Dans le laboratoire, la déclaration du namespace porte déjà ces labels. Ces commandes permettent une vérification explicite ; ce n'est pas une migration de production :

```bash title="Poste d'administration"
kubectl --context kind-formation -n atelier get namespace atelier --show-labels
kubectl --context kind-formation -n atelier label namespace atelier pod-security.kubernetes.io/enforce=restricted pod-security.kubernetes.io/enforce-version=v1.35 pod-security.kubernetes.io/warn=restricted pod-security.kubernetes.io/warn-version=v1.35 pod-security.kubernetes.io/audit=restricted pod-security.kubernetes.io/audit-version=v1.35 --overwrite
```

| Contrôle Linux retenu | Relation au profil Restricted | Effet et limite |
|---|---|---|
| `runAsNonRoot: true` et UID 101 | Non-root requis ; UID 101 choisi pour l'image nginx retenue | N'accorde pas automatiquement les droits sur les volumes |
| `allowPrivilegeEscalation: false` | Requis | Empêche l'acquisition de privilèges supplémentaires |
| `capabilities.drop: [ALL]` | Requis ; seul `NET_BIND_SERVICE` peut être ajouté | nginx écoute sur 8080 et n'en a pas besoin |
| `seccompProfile.type: RuntimeDefault` | Profil explicite requis (ou `Localhost` approprié) | Filtre les appels système ; ne garantit pas l'absence de vulnérabilité |
| `readOnlyRootFilesystem: true` | Durcissement supplémentaire | Les chemins d'écriture doivent recevoir un volume adapté |
| `automountServiceAccountToken: false` | Durcissement supplémentaire | Retire le jeton inutile de ce workload |

Ce tableau résume les choix du guide ; le profil comporte d'autres restrictions (namespaces hôte, volumes, conteneurs privilégiés…). La référence normative reste [PSS v1.35](https://v1-35.docs.kubernetes.io/docs/concepts/security/pod-security-standards/).

**Le workload `web`** (`manifests/base/deployment-web.yaml`) associe l'image nginx non privilégiée à UID/GID 101, `fsGroup: 101`, `/tmp` sur `emptyDir` et le port 8080. La configuration nginx et le HTML sont montés en lecture seule. Deux précisions :

- `fsGroup` peut faciliter l'accès aux volumes selon leur type et leur pilote ; il ne change pas universellement le propriétaire de tous les fichiers ;
- `readOnlyRootFilesystem` protège la couche racine, pas les volumes montés en écriture.

Vérifiez points d'écriture, démarrage et configuration avec l'image exacte. Voir [securityContext](https://v1-35.docs.kubernetes.io/docs/tasks/configure-pod-container/security-context/).

**Test positif puis négatif.** Le second document est une copie temporaire du template fonctionnel dont seul le privilège est dégradé ; il n'est jamais créé (`--dry-run=server`).

```bash title="Poste d'administration"
kubectl --context kind-formation -n atelier apply --dry-run=server -k manifests/overlays/lab
kubectl --context kind-formation -n atelier get deployment web -o json | jq '{apiVersion:"v1",kind:"Pod",metadata:{name:"test-psa-refuse",namespace:"atelier"},spec:.spec.template.spec} | .spec.containers[0].securityContext.privileged=true' | kubectl --context kind-formation -n atelier create --dry-run=server -f -
kubectl --context kind-formation -n atelier exec deployment/web -c app -- id
kubectl --context kind-formation -n atelier exec deployment/web -c app -- sh -c 'touch /etc/test-interdit'
kubectl --context kind-formation -n atelier exec deployment/web -c app -- sh -c 'touch /tmp/test-autorise && rm /tmp/test-autorise'
```

**Résultat attendu :**

1. le manifeste conforme est validé ;
2. le Pod privilégié est **refusé** par PSA ;
3. `id` affiche l'UID 101 ;
4. l'écriture dans `/etc` **échoue** (système de fichiers en lecture seule) ;
5. l'écriture dans `/tmp` réussit.

Le dry-run vérifie l'admission ; les commandes `exec` vérifient le conteneur réellement démarré. Certains agents système ont besoin d'exceptions : placez-les dans des namespaces administrés séparément, avec propriétaire, justification, durée et contrôle compensatoire. Assouplir tout `atelier` pour dépanner nginx supprimerait la preuve recherchée.

### 15.5 Secrets : quatre problèmes à traiter séparément

| Question | Mesure | Preuve attendue |
|---|---|---|
| Le secret est-il conservé dans Git ? | Valeur externe, ou document chiffré avec gestion de clés | Historique et CI sans valeur lisible ; déchiffrement limité aux identités autorisées |
| Comment arrive-t-il à l'application ? | Volume ciblé, permissions minimales, ou variable si le logiciel l'impose | Seul le conteneur prévu reçoit les clés nécessaires |
| Comment l'API le stocke-t-elle ? | Chiffrement au repos des ressources choisies | Lecture API correcte ; contenu brut chiffré dans etcd |
| Comment est-il remplacé ? | Rotation coordonnée du fournisseur, du cluster et de l'application | Nouvelle valeur utilisée, ancienne révoquée, reprise testée |

**Dans Git.** Un Secret commité reste un secret publié, même encodé en base64. Après une fuite : **révoquez et remplacez la valeur d'abord**, nettoyez l'historique ensuite. Un gestionnaire externe ou un opérateur ne règle pas seul les droits de lecture dans le cluster : quiconque peut créer des Pods montant un Secret peut souvent en obtenir le contenu. Voir les [bonnes pratiques Secrets](https://v1-35.docs.kubernetes.io/docs/concepts/security/secrets-good-practices/).

**Pour un essai jetable,** un fichier local protégé peut alimenter `kubectl create secret generic --from-file`. Ce fichier ne doit jamais entrer dans le dépôt ; une entrée `.gitignore` ne retire pas un fichier **déjà suivi**. `--from-literal` expose plus facilement la valeur dans l'historique du shell et la liste des processus. Ne demandez jamais de coller un vrai mot de passe dans une capture de terminal.

**Mise à jour.** Une variable d'environnement est lue au démarrage : remplacer le Secret ne la change pas dans un processus existant. Un volume Secret est mis à jour avec un délai ; un montage `subPath` ne l'est jamais. L'application doit relire le fichier. Avec `immutable: true`, chaque version est une nouvelle ressource. Le contrôle consiste à vérifier une authentification réelle, **sans imprimer la valeur**. Voir [Secrets](https://kubernetes.io/docs/concepts/configuration/secret/).

**Chiffrement au repos.**

- Chaque API Server doit avoir une configuration cohérente et les clés nécessaires à la lecture.
- L'activer **ne réécrit pas** les objets déjà stockés.
- Rotation : ajouter la nouvelle clé en tête, garder les anciennes pour la lecture, réécrire les ressources couvertes, vérifier, puis retirer les anciennes.
- **KMS v2** délègue la protection des clés à un fournisseur compatible.
- Protégez aussi snapshots et sauvegardes de clés : restaurer etcd sans les clés peut rendre les Secrets illisibles.

Cette modification du control plane appartient au laboratoire kubeadm (§15.9) et suit la procédure officielle de [chiffrement au repos](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/).

### 15.6 Audit : garder la preuve sans recopier les secrets

Un **journal d'audit** associe identité, action, objet, moment et réponse de l'API. Pour un premier laboratoire kubeadm, une politique minimale complète, à enregistrer comme `/etc/kubernetes/audit-policy.yaml` sur chaque API Server, est :

```yaml title="Politique d'audit minimale (niveau Metadata)"
apiVersion: audit.k8s.io/v1
kind: Policy
rules:
  - level: Metadata
```

Le niveau `Metadata` enregistre **qui, quoi, quand et le code de réponse**, sans le corps des requêtes : aucun secret n'est recopié.

Le fichier seul n'active rien. Il doit être monté dans le static Pod de l'API Server, avec un volume de sortie pour `--audit-log-path` et des options de rotation. Sauvegardez le manifeste statique **hors** du répertoire surveillé avant modification, et contrôlez chaque API Server l'un après l'autre. Sur un service managé, utilisez les réglages d'audit de l'opérateur. Voir [Auditing](https://v1-35.docs.kubernetes.io/docs/tasks/debug/debug-cluster/audit/).

**Valider :** produisez une lecture autorisée puis la lecture de Secret refusée du test RBAC, et retrouvez les deux événements avec leurs codes. N'activez pas `RequestResponse` sur les Secrets. Prévoyez une destination protégée, une rétention, un contrôle d'accès et une alerte si la collecte s'arrête. Le journal prouve ce que l'API a reçu ; il ne décrit pas ce qui se passe dans un conteneur.

### 15.7 Chaîne logicielle : du code à l'exécution

| Élément | Ce qu'il apporte |
|---|---|
| Digest | Fixe un contenu |
| Signature | Rattache ce contenu à une identité de confiance |
| **SBOM** (*Software Bill of Materials*) | Inventorie les composants ([SPDX](https://spdx.dev/use/specifications/)) |
| Provenance | Documente la construction ([SLSA](https://slsa.dev/spec/v1.1/provenance)) |

Aucun de ces éléments ne garantit, seul, qu'une application est sûre.

| Étape | Contrôle concret | Test d'efficacité |
|---|---|---|
| Construction | Dépendances verrouillées, analyse de vulnérabilités, SBOM attachée au digest, environnement de build identifié | Une dépendance interdite fait échouer la CI ; artefacts retrouvés par digest |
| Publication | Registre approuvé, signature et provenance conservées | Signature valide seulement pour l'identité et l'émetteur prévus |
| Déploiement | Référence par digest ; politique d'admission vérifiant les garanties choisies | Image conforme admise ; image non signée ou mauvais émetteur refusée |
| Exécution | Non-root, isolation réseau, détection des processus et connexions anormaux | Une simulation bénigne déclenche une alerte exploitable |

**Exercice optionnel : vérifier une signature avec Cosign.** Installez Cosign et consignez sa version. Utilisez une image que votre organisation a **réellement signée** ; la référence et les identités attendues se fournissent explicitement, elles ne se déduisent pas de l'image.

```bash title="Poste d'administration · exercice optionnel sur votre registre de formation"
set -e
read -r -p 'Référence image complète avec @sha256: : ' IMAGE_SIGNEE
read -r -p 'Identité de signature attendue : ' IDENTITE_SIGNEUR
read -r -p 'Émetteur OIDC attendu : ' EMETTEUR_OIDC
test -n "$IMAGE_SIGNEE" && test -n "$IDENTITE_SIGNEUR" && test -n "$EMETTEUR_OIDC"
cosign version
cosign verify --certificate-identity "$IDENTITE_SIGNEUR" --certificate-oidc-issuer "$EMETTEUR_OIDC" "$IMAGE_SIGNEE"
```

**Résultat attendu :** `cosign verify` confirme la signature pour cette identité et cet émetteur ; avec une mauvaise identité, il échoue et `set -e` arrête le script.

Vérifiez aussi le sujet de la provenance et le digest de la SBOM. Une vérification locale n'active **aucune** politique sur le cluster : Kubernetes de base ne vérifie pas les signatures des images. Un contrôleur d'admission de signature demande un atelier dédié, avec version, politique et tests de panne. Voir [Cosign Verify](https://docs.sigstore.dev/cosign/verifying/verify/).

**Exceptions.** Une exception contient le digest exact, le risque accepté, un responsable, une échéance et les conditions de retrait ; testez le refus quand elle expire. Les détections à l'exécution complètent la prévention et alimentent une procédure de réponse : les installer ne prouve pas leur efficacité. La [checklist officielle de sécurité](https://v1-35.docs.kubernetes.io/docs/concepts/security/security-checklist/) aide à relier chaque contrôle à une frontière de confiance.

:::tip[À retenir]
Un contrôle de sécurité se démontre par **un cas autorisé et un cas refusé**. Conservez la commande, le contexte, la version, le résultat et les limites ; n'appelez « testé » que ce qui a été exécuté et observé.
:::

### 15.8 Atelier optionnel kubeadm : activer et vérifier l'audit

**Objectif :** prouver qui a demandé une opération à l'API, et la réponse obtenue.

**Environnement exclusif :** VM kubeadm du chapitre 3, Kubernetes 1.35.8, `cp1` seul ou `cp1/cp2/cp3`, console de secours, snapshot etcd récent et accès à ses clés. L'atelier **redémarre l'API Server** : avec un seul control plane, l'API sera brièvement indisponible (les applications déjà lancées continuent).

**Prérequis :** Python 3 et PyYAML **sur les VM** (`sudo apt-get install python3-yaml` sur Ubuntu) ; dossier associé copié sur chaque control plane ; shell root placé dedans. L'audit (§15.8) et le chiffrement (§15.9) sont indépendants : n'activez pas le chiffrement pour tester l'audit.

Le script `scripts-security/patch-apiserver.py` exige le nom d'hôte et son IP du laboratoire. Il refuse les doublons YAML, les flags contradictoires et les collisions de montage, et préserve les autres champs du manifeste (en pouvant reformater son YAML).

**Étape 1 — Créer la politique et activer l'audit sur cp1.**

```bash title="cp1 · root"
set -euo pipefail
umask 077
install -d -m 0700 /etc/kubernetes/formation-security
cat > /etc/kubernetes/formation-security/audit-policy.yaml <<'YAML'
apiVersion: audit.k8s.io/v1
kind: Policy
rules:
  - level: Metadata
YAML
export CONFIRMER_CP_LAB=cp1
python3 scripts-security/patch-apiserver.py --audit
python3 scripts-security/patch-apiserver.py --audit --apply
```

**Ce qui se passe :** le premier appel vérifie et **décrit** le changement ; le second sauvegarde l'ancien manifeste dans `/var/lib/k8s-formation/controlplane-backups/cp1/DATE/`, puis le remplace de façon atomique. **Notez le chemin affiché** : il servira au retour arrière. Aucun backup ne reste dans `/etc/kubernetes/manifests`.

Montages ajoutés : la politique en lecture seule et le répertoire d'audit en écriture. Rotation : `maxage=10` jours, `maxsize=100` (unité du flag de l'API Server), `maxbackup=3` — un budget pédagogique, pas une politique de rétention ; une archive externe protégée reste nécessaire.

**En HA**, créez la même politique sur cp2 puis cp3 et exécutez avec `CONFIRMER_CP_LAB=cp2`, puis `cp3` — **un hôte à la fois**, après avoir vérifié la santé du précédent.

**Étape 2 — Vérifier chaque API et produire un accès autorisé et un accès refusé.** Utilisez le kubeconfig VM du chapitre 3, pas celui de kind.

```bash title="Poste d'administration · kubeconfig VM"
: "${KUBECONFIG_VM:?Chemin du kubeconfig VM requis}"
# Variante unique ; en HA : API_IPS=(192.168.56.11 192.168.56.12 192.168.56.13)
API_IPS=(192.168.56.11)
for ip in "${API_IPS[@]}"; do
  kubectl --kubeconfig="$KUBECONFIG_VM" --context formation-vm -n atelier --server="https://$ip:6443" get --raw='/readyz?verbose' --request-timeout=5s
done
kubectl --kubeconfig="$KUBECONFIG_VM" --context formation-vm -n atelier create namespace atelier --dry-run=client -o yaml | kubectl --kubeconfig="$KUBECONFIG_VM" --context formation-vm -n atelier apply -f -
kubectl --kubeconfig="$KUBECONFIG_VM" --context formation-vm -n atelier --server=https://192.168.56.11:6443 get secrets -o name
if kubectl --kubeconfig="$KUBECONFIG_VM" --context formation-vm -n atelier --server=https://192.168.56.11:6443 get secrets --as=system:serviceaccount:atelier:default; then
  echo 'Refus RBAC attendu absent : inspecter les bindings.' >&2; exit 1
fi
```

**Étape 3 — Lire seulement les métadonnées utiles.**

```bash title="cp1 · root"
jq -c 'select(.stage=="ResponseComplete" and .objectRef.namespace=="atelier" and .objectRef.resource=="secrets") | {verb,code:.responseStatus.code}' /var/log/kubernetes/formation-audit/audit.log
```

**Résultat attendu (non observé ici) :** API saine ; un événement autorisé `200` et un événement refusé `403`.

**En cas de problème :** si l'API ne revient pas, passez par la console, `crictl` et les logs du conteneur.

**Retour arrière :** utilisez le backup exact noté à l'étape 1 : `python3 scripts-security/patch-apiserver.py --restore-audit CHEMIN_DU_BACKUP --apply` (remplacez explicitement le chemin). Le script refuse la restauration si une différence **hors audit** existe — par exemple si le chiffrement a été activé depuis. Conservez les traces avant nettoyage et revérifiez chaque API.

### 15.9 Atelier optionnel kubeadm : chiffrer un Secret et préparer le retour

**Besoin :** une lecture brute d'etcd ne doit pas révéler la valeur d'un Secret. TLS, RBAC et chiffrement au repos protègent trois frontières différentes.

:::caution[aescbc : pour comprendre, pas pour la production]
Le fournisseur `aescbc` sert ici à comprendre le mécanisme local. La documentation le classe comme faible et mentionne un risque de *padding oracle*. Une architecture d'exploitation doit évaluer KMS v2, sa disponibilité et sa gestion des clés. Voir [Encrypting Confidential Data at Rest](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/) et [KMS](https://v1-35.docs.kubernetes.io/docs/tasks/administer-cluster/kms-provider/).
:::

**Comment fonctionne la transition.** Trois fichiers de configuration partagent **la même clé** ; seul l'ordre des fournisseurs change. Le **premier** fournisseur de la liste sert à écrire ; tous servent à lire.

| Fichier | Ordre des fournisseurs | Effet |
|---|---|---|
| `encryption-read.yaml` | `identity`, puis `aescbc` | Écrit encore en clair ; sait déjà lire le chiffré |
| `encryption-write.yaml` | `aescbc`, puis `identity` | Écrit chiffré ; lit encore les anciennes valeurs en clair |
| `encryption-decrypt.yaml` | `identity`, puis `aescbc` | Retour : réécrit en clair, garde la clé pour lire |

**Étape 1 — Préparer un Secret fictif**, indépendamment de l'atelier audit :

```bash title="Poste d'administration · kubeconfig VM"
set -euo pipefail
: "${KUBECONFIG_VM:?Chemin du kubeconfig VM du chapitre 3 requis}"
API_IPS=(192.168.56.11) # En HA : ajouter 192.168.56.12 et 192.168.56.13.
kubectl --kubeconfig="$KUBECONFIG_VM" --context formation-vm -n atelier create namespace atelier --dry-run=client -o yaml | kubectl --kubeconfig="$KUBECONFIG_VM" --context formation-vm -n atelier apply -f -
kubectl --kubeconfig="$KUBECONFIG_VM" --context formation-vm -n atelier create secret generic secret-demo --from-literal=exemple=valeur-fictive --dry-run=client -o yaml | kubectl --kubeconfig="$KUBECONFIG_VM" --context formation-vm -n atelier apply -f -
```

**Étape 2 — Générer une seule fois la clé (32 octets aléatoires) et les trois fichiers.** Ils restent hors dépôt ; n'affichez jamais leur contenu.

```bash title="cp1 · root"
umask 077
install -d -m 0700 /etc/kubernetes/formation-security
python3 - <<'PY'
from pathlib import Path
import base64, secrets, yaml
directory = Path('/etc/kubernetes/formation-security')
names = ['encryption-read.yaml', 'encryption-write.yaml', 'encryption-decrypt.yaml']
if any((directory / name).exists() for name in names):
    raise SystemExit('Configuration déjà présente : ne pas régénérer une clé.')
aes = {'aescbc': {'keys': [{'name': 'lab-k1', 'secret': base64.b64encode(secrets.token_bytes(32)).decode()}]}}
for name in names:
    providers = [aes, {'identity': {}}] if name == 'encryption-write.yaml' else [{'identity': {}}, aes]
    doc = {'apiVersion': 'apiserver.config.k8s.io/v1', 'kind': 'EncryptionConfiguration',
           'resources': [{'resources': ['secrets'], 'providers': providers}]}
    with (directory / name).open('x', encoding='utf-8') as stream:
        yaml.safe_dump(doc, stream, sort_keys=False)
    (directory / name).chmod(0o600)
PY
sha256sum /etc/kubernetes/formation-security/encryption-*.yaml
```

**En HA,** transférez ces fichiers **identiques** par le canal d'administration chiffré vers le même répertoire root (`0700`) de cp2 et cp3, fichiers en `0600`, puis comparez les empreintes sur les trois hôtes. Ne générez pas une nouvelle clé par nœud. Sauvegardez configuration et clé hors cluster, protégées et associées aux snapshots etcd.

**Étape 3 — Activer en deux tours, sur chaque control plane** (avec son `CONFIRMER_CP_LAB` exact) :

1. **Premier tour (lecture)** : `python3 scripts-security/patch-apiserver.py --encryption-config /etc/kubernetes/formation-security/encryption-read.yaml --apply`. Vérifiez **directement chaque API** avec la boucle de l'atelier précédent avant de poursuivre.
2. **Second tour (écriture)** : répétez avec `encryption-write.yaml`, puis revérifiez chaque API.

Le changement de source du montage modifie le static Pod et déclenche son redémarrage.

**Étape 4 — Réécrire uniquement le Secret de démonstration** (aucune réécriture de masse de Secrets de production) :

```bash title="Poste d'administration · kubeconfig VM"
kubectl --kubeconfig="$KUBECONFIG_VM" --context formation-vm -n atelier get secret secret-demo -o json | kubectl --kubeconfig="$KUBECONFIG_VM" --context formation-vm -n atelier replace -f -
for ip in "${API_IPS[@]}"; do
  kubectl --kubeconfig="$KUBECONFIG_VM" --context formation-vm -n atelier --server="https://$ip:6443" get secret secret-demo -o name
done
```

**Étape 5 — Prouver le chiffrement dans etcd, sans imprimer la valeur.**

```bash title="cp1 · root"
set -euo pipefail
source scripts-etcd/etcd-env.sh
etcdctl get /registry/secrets/atelier/secret-demo --write-out=json | python3 -c 'import sys,json,base64; kv=json.load(sys.stdin)["kvs"]; assert len(kv)==1; value=base64.b64decode(kv[0]["value"]); assert value.startswith(b"k8s:enc:aescbc:v1:"); print("Préfixe chiffré attendu présent ; contenu masqué")'
```

**Résultat attendu (non observé) :** le message « Préfixe chiffré attendu présent », et une lecture API réussie sur chaque membre. Une configuration activée ne réécrit pas les anciennes ressources ; pour tourner une clé, gardez les anciennes en lecture, rendez la nouvelle lisible **partout** avant de l'utiliser pour écrire, puis réécrivez et vérifiez avant tout retrait.

:::danger[Retour arrière : ne restaurez pas aveuglément l'ancien manifeste]
Dès le second tour, des Secrets système modifiés peuvent aussi être chiffrés. Restaurer l'ancien manifeste les rendrait **illisibles**.

1. Activez d'abord `encryption-decrypt.yaml` sur **toutes** les API : `identity` écrit en clair, les clés restent disponibles pour lire.
2. Une désactivation complète exige ensuite d'inventorier et de réécrire **tous les Secrets de tous les namespaces**, de traiter les conflits et de prouver qu'aucune valeur sous `/registry/secrets/` ne commence par `k8s:enc:`. Le seul Secret de démonstration ne suffit pas.
3. Ne retirez flag, montage ou clés qu'après ces preuves ; sinon, conservez le fournisseur de lecture et les clés.

Les anciens snapshots peuvent encore dépendre des anciennes clés : ne détruisez pas leur sauvegarde. La [procédure officielle de déchiffrement](https://v1-35.docs.kubernetes.io/docs/tasks/administer-cluster/decrypt-data/) encadre ce retour ; une reprise après perte de clés exige une sauvegarde **et** ses clés.
:::


<a id="chapitre-16"></a>

## 16. Administrer les nœuds, certificats et versions

**En bref.** Administrer, c'est modifier le **support** des applications : nœuds, certificats, versions. Chaque changement suit un contrat simple — cible, état actuel, objectif, critères d'arrêt, preuves avant/après et retour possible — et se fait **un nœud à la fois**.

### 16.1 Contrat d'exploitation et inventaire

Avant un changement, identifiez : la cible, la version actuelle, le propriétaire, l'objectif, les critères d'arrêt, les preuves avant/après et le retour possible.

:::note[Static Pods : deux pièges]
Le laboratoire kubeadm possède des **static Pods** décrits dans `/etc/kubernetes/manifests`, que le kubelet surveille directement.
- Arrêter le service kubelet **n'arrête pas nécessairement** les conteneurs déjà lancés.
- Ne déposez jamais une copie `.bak` dans ce répertoire : elle pourrait être interprétée comme un manifeste actif.
:::

```bash title="Poste d'administration (kubeconfig VM du chapitre 3), puis chaque VM de nœud"
export KUBECONFIG_VM="$PWD/.secrets/admin-vm.kubeconfig"
kubectl --kubeconfig "$KUBECONFIG_VM" --context formation-vm get nodes -o wide
kubectl --kubeconfig "$KUBECONFIG_VM" --context formation-vm get --raw='/readyz?verbose'
kubectl --kubeconfig "$KUBECONFIG_VM" --context formation-vm -n kube-system get pods -o wide
# Où : chaque VM de nœud, lecture avec sudo selon les fichiers.
kubeadm version -o short
kubelet --version
containerd --version
sudo crictl version
sudo systemctl status kubelet containerd --no-pager
sudo journalctl -u kubelet --since '-15 min' --no-pager
```

**Compléter l'inventaire avec :** OS, noyau, cgroup driver, versions CNI/CSI, labels et IP, montages, espace et inodes disponibles. Gardez kubeconfigs et **PKI** (*Public Key Infrastructure*) hors de Git en clair. `admin.conf` sert à l'amorçage et à l'administration ; les applications du guide n'y ont pas accès.

### 16.2 Ajouter ou retirer un worker

**Ajouter un worker :**

1. créer la VM avec une identité et une IP uniques ;
2. appliquer la préparation du chapitre 3 (§3.4) ;
3. créer un token court depuis cp1 ;
4. joindre avec le **hash de CA réel** et le **socket CRI** (§3.5) ;
5. attendre Ready, puis tester un Pod et le réseau.

Une inscription réussie ne prouve pas qu'un volume CSI peut être monté sur ce nœud : faites le contrôle propre au pilote.

**Retirer w1 :** depuis le poste, observez ses Pods et le budget restant, faites `cordon` puis `drain` (chapitre 13), supprimez l'objet Node **après** l'évacuation, puis réinitialisez ou recréez la VM.

:::caution[Worker perdu : isoler avant de réutiliser ses volumes]
Si un worker est perdu, assurez-vous qu'il est **réellement éteint ou isolé** (*fencing*) avant de laisser un autre nœud écrire sur le même volume. Sinon, un ancien écrivain toujours vivant dans une partition réseau pourrait corrompre les données.
:::

```bash title="Poste d'administration · kubeconfig VM, LAB uniquement (lire la liste avant le drain)"
kubectl --kubeconfig "$KUBECONFIG_VM" --context formation-vm get pods -A --field-selector spec.nodeName=w1 -o wide
kubectl --kubeconfig "$KUBECONFIG_VM" --context formation-vm cordon w1
kubectl --kubeconfig "$KUBECONFIG_VM" --context formation-vm drain w1 --ignore-daemonsets --timeout=180s
# En maintenance temporaire : après réparation et validation, revenir avec :
kubectl --kubeconfig "$KUBECONFIG_VM" --context formation-vm uncordon w1
```

**Suppression définitive :** après un drain réussi, `delete node w1` cible uniquement ce worker ; puis, **sur w1 uniquement**, `sudo kubeadm reset -f`, et destruction de la VM. Un drain bloqué ne justifie pas de forcer : cherchez d'abord un PDB, un `emptyDir`, un Pod sans contrôleur ou un manque de capacité.

### 16.3 Certificats : anticiper l'expiration

| Élément | Rôle |
|---|---|
| Certificat de l'API | Porte les **SAN** de l'endpoint (noms et IP acceptés) |
| CA | Définit la confiance |
| Certificat client | Identifie un sujet (utilisateur, composant) |

Un token expiré, un certificat expiré et une horloge décalée sont trois problèmes **différents**.

**Vérifier :** sur **chaque control plane** kubeadm, `sudo kubeadm certs check-expiration` affiche l'état des certificats gérés par kubeadm. Les certificats du kubelet ont leur propre rotation ; une CA externe a sa propre procédure, que kubeadm ne remplace pas.

**Renouveler (LAB uniquement, pour étudier) :**

1. conserver une sauvegarde chiffrée de la PKI ; confirmer heure, CA et SAN ;
2. `sudo kubeadm certs renew all` sur **un** control plane ;
3. faire recharger les composants : déplacer **un seul** manifeste hors du répertoire surveillé, attendre sa disparition dans `crictl`, le remettre, vérifier l'API ;
4. passer au control plane suivant. Ne jamais interrompre plusieurs etcd en même temps (le chapitre 19 détaille cette attente pour etcd).

Mettez à jour les copies de kubeconfigs dont les identifiants embarqués ont changé, sans diffuser ceux d'un administrateur à d'autres comptes.

**Contrôle final :** expiration relue, certificat présenté sur 6443 avec le SAN attendu, `/readyz`, permissions du compte de test, logs sans erreur TLS, composants et workloads stables.

**Retour en cas de problème :** une PKI cassée se répare en restaurant de façon **cohérente** ses fichiers et kubeconfigs depuis la sauvegarde — jamais en désactivant TLS. Ne distribuez pas `--insecure-skip-tls-verify` comme correctif.

### 16.4 Mise à niveau : ordre, prérequis et retour réaliste

**Prérequis avant toute mise à niveau :**

- une sauvegarde etcd vérifiée **et** une procédure de restauration **essayée** ;
- les sauvegardes applicatives, les fichiers de configuration et la PKI ;
- la compatibilité CNI, CSI, CRD et admission ; les API retirées dans la version cible ;
- assez de capacité pour drainer chaque nœud.

Les modules de validation restent liés à leur version : après la mise à niveau, le schéma 1.35.8 du livrable ne prouve pas la conformité à la cible.

**Exercice de planification complet : 1.35.8 → 1.36.4, un seul mineur à la fois.** Cette cible est un patch existant utilisé pour l'apprentissage, pas une recommandation : en exploitation, choisissez un patch corrigé et supporté au moment du changement. **Ne passez pas directement de 1.35 à 1.37.** Relevez avec `kubeadm upgrade plan` les images etcd et CoreDNS et les différences prévues ; si etcd change, ne gardez pas aveuglément les versions des outils de reprise.

| Ordre | Où | Action |
|---|---|---|
| 1 | cp1 | Mettre à niveau le paquet kubeadm, `upgrade plan`, puis `upgrade apply` |
| 2 | cp2, puis cp3 | Paquet kubeadm à la même version, puis `kubeadm upgrade node` |
| 3 | Chaque nœud, CP puis workers, un par un | Drain, kubelet et kubectl, redémarrage, Ready, uncordon |
| 4 | Poste d'administration | kubectl client, contrôles globaux |

**Étape 1 — Sur cp1**, après précontrôles et sauvegardes du laboratoire :

```bash title="VM cp1 LAB · sudo (modifie le dépôt et le paquet kubeadm seulement)"
sudo apt-mark unhold kubeadm
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.36/deb/Release.key | sudo gpg --dearmor --yes -o /etc/apt/keyrings/kubernetes.gpg
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes.gpg] https://pkgs.k8s.io/core:/stable:/v1.36/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list >/dev/null
sudo apt-get update
apt-cache madison kubeadm
sudo apt-get install -y kubeadm=1.36.4-1.1
sudo apt-mark hold kubeadm
sudo kubeadm upgrade plan v1.36.4
# POINT D'ARRÊT : examiner le plan, les préchecks et les versions d'etcd avant de poursuivre.
sudo kubeadm upgrade apply v1.36.4
```

**Rôle des commandes :** `apt-mark unhold/hold` lève puis remet le gel du paquet ; les deux lignes de dépôt passent au canal `v1.36` signé ; `apt-cache madison` confirme que la version cible existe ; `upgrade plan` est le **point d'arrêt** pour relire le plan.

`upgrade apply` modifie le control plane : avec un seul CP, l'API peut être interrompue ; en HA, retirez temporairement ce backend du répartiteur si nécessaire et vérifiez les autres endpoints.

**Étape 2 — Sur cp2 puis cp3**, après passage du dépôt et du paquet kubeadm à la même version : `sudo kubeadm upgrade node`, un CP à la fois. N'exécutez **pas** `upgrade apply` sur chacun.

**Étape 3 — Chaque nœud, un par un.** Drainez depuis le poste (sur un CP, static Pods et DaemonSets sont traités à part). Sur un worker, mettez d'abord à niveau kubeadm et lancez `sudo kubeadm upgrade node`, puis le kubelet :

```bash title="VM actuellement drainée · dépôt 1.36 configuré comme ci-dessus"
sudo apt-mark unhold kubelet kubectl
sudo apt-get install -y kubelet=1.36.4-1.1 kubectl=1.36.4-1.1
sudo apt-mark hold kubelet kubectl
sudo systemctl daemon-reload
sudo systemctl restart kubelet
kubelet --version
```

Depuis le poste : attendez ce nœud Ready, vérifiez ses logs et le réseau, puis `uncordon` avant de passer au suivant.

**Étape 4 — Contrôles globaux.** Mettez à jour le kubectl du poste dans les limites du *skew*. Comparez versions, `/readyz`, quorum et état etcd, CNI/CSI, DNS, admission, workloads et PVC, tests de sécurité et accès utilisateurs.

:::danger[En cas d'incident : pas de « rollback » par apt]
Arrêtez la progression, conservez les preuves et traitez la panne précise. Rétrograder un cluster n'est pas un simple `apt install` de l'ancien kubelet, et Kubernetes ne propose pas de rollback universel supporté. Le retour connu du laboratoire : **reconstruire à la version précédente, puis restaurer des sauvegardes cohérentes** selon des procédures essayées — et mesurer ce RTO. Un snapshot de VM simultané de plusieurs CP, sans cohérence applicative, ne remplace pas une sauvegarde etcd.
:::

**Sources vérifiées le 16/10/2026 :** [administration kubeadm](https://v1-35.docs.kubernetes.io/docs/tasks/administer-cluster/kubeadm/), [rotation/renouvellement des certificats](https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/), [montée 1.35 → 1.36](https://v1-36.docs.kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/), [skew](https://kubernetes.io/releases/version-skew-policy/), [reset](https://v1-35.docs.kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-reset/).

<a id="chapitre-17"></a>

## 17. Observer avant d'intervenir : métriques, logs, traces et alertes

**En bref.** Chaque signal répond à une question précise. Choisir le bon signal — et le collecter **avant** de redémarrer quoi que ce soit — fait la différence entre un diagnostic et une supposition.

### 17.1 Une preuve répond à une question

| Signal | Ce qu'il décrit | Limite |
|---|---|---|
| Métriques | Des mesures dans le temps | Une moyenne masque les pointes |
| Logs | Des événements applicatifs ou système | Ils disparaissent avec le Pod s'ils ne sont pas collectés |
| Traces | Le parcours d'un appel à travers les services | Nécessitent instrumentation et propagation de contexte |
| Events Kubernetes | Les décisions du système (scheduling, pull, probes…) | Rétention courte |
| Audit API | « Qui a demandé quoi », selon sa politique | Ne dit pas pourquoi une base répond lentement |

Corrélez horodatages et identités avant de conclure.

| Question | Signal | Limite |
|---|---|---|
| L'application est-elle utile ? | Taux de succès et latence des requêtes utilisateur | Un Pod Running n'est pas une réponse utilisateur |
| Pourquoi redémarre-t-elle ? | `lastState`, logs `--previous`, events, mémoire | Un exit 137 seul ne prouve pas un OOM |
| La capacité manque-t-elle ? | Allocatable/requests, CPU, mémoire, disque/inodes, conditions de pression | Une moyenne peut masquer une pointe ou du throttling |
| Où part le temps d'un appel ? | Trace distribuée et corrélation des logs | Instrumentation nécessaire |
| Le contrôle d'accès a-t-il fonctionné ? | Test `can-i`, requête réelle, audit | Une règle RBAC écrite n'est pas une preuve positive **et** négative |
| etcd est-il dégradé ? | Leader, latences WAL/backend, quotas, propositions en attente | Une métrique isolée ne désigne pas le disque comme cause certaine |

### 17.2 Une collecte minimale utilisable

```bash title="Poste d'administration (preuves applicatives, sans Secrets), puis VM worker en incident"
mkdir -p evidence
kubectl --context kind-formation -n atelier get pods -o wide > evidence/pods.txt
kubectl --context kind-formation -n atelier get events --sort-by=.metadata.creationTimestamp > evidence/events.txt
kubectl --context kind-formation -n atelier logs deploy/web --all-pods=true --prefix --tail=200 > evidence/web.log
# Où : VM worker en incident, lecture seulement.
sudo journalctl -u kubelet -u containerd --since '-20 min' --no-pager
df -h
df -i
sudo crictl ps -a
```

**Résultat attendu :** trois fichiers dans `evidence/` côté poste ; côté worker, les journaux récents, l'espace **et les inodes**, et tous les conteneurs, y compris arrêtés (`-a`).

**Où sont les logs ?** Avec un runtime CRI, typiquement sous `/var/log/pods` et via les liens `/var/log/containers`. Le chemin Docker `/var/lib/docker/containers` ne s'applique pas automatiquement à containerd. Le nginx du fil rouge écrit sur stdout/stderr : centralisez ces flux dans un backend avec accès contrôlé, rétention, chiffrement et alerte si la collecte s'arrête. Supprimer ou redémarrer avant la capture fait perdre la meilleure preuve.

**Outils de métriques :**

- `kubectl top` utilise metrics-server : métriques de ressources limitées, sans historique ;
- **Prometheus** collecte des séries temporelles ; **kube-state-metrics** reflète l'état des objets ; **node-exporter** mesure l'hôte ;
- les traces **OpenTelemetry** demandent une instrumentation et un collecteur.

Leurs accès et exceptions hôte se conçoivent séparément : pas de DaemonSet `hostPID`/`hostNetwork` « par défaut » dans un namespace Restricted. Aucun de ces composants n'est requis pour comprendre le premier Service.

### 17.3 Définir SLI/SLO et des alertes actionnables

- Un **SLI** (*Service Level Indicator*) est une mesure, par exemple la part de requêtes HTTP réussies.
- Un **SLO** (*Service Level Objective*) est une cible sur cette mesure, sur une fenêtre de temps.

**Exercice (pas un engagement) :** pour ce laboratoire, proposez 99 % de requêtes synthétiques réussies sur 10 minutes et une latence p95 < 250 ms à charge définie. Relevez la charge, le nombre de requêtes, les exclusions et la granularité. Le nombre de Pods Ready est un indicateur de capacité, pas ce SLI.

**Une alerte utile indique :** le service, la gravité, la durée, la preuve et le **premier geste sûr**. Pour etcd, `scripts-etcd/etcd-alerts.yaml` définit les règles ; le chapitre 19 explique les seuils. Les ratios doivent avoir des labels compatibles et les histogrammes être agrégés correctement : évitez un quantile calculé sur des buckets de membres différents sans `sum by (le,instance)`. Aucun seuil du guide n'est une norme de production.

:::note[Pour aller plus loin]
Un exercice d'incident se termine par une chronologie, une cause soutenue par des preuves, le changement minimal, sa vérification et une prévention mesurable. « Redémarrage réussi » sans explication ne clôt pas une analyse de cause.
:::

**Sources :** [observabilité](https://kubernetes.io/docs/concepts/cluster-administration/observability/), [architecture des logs](https://kubernetes.io/docs/concepts/cluster-administration/logging/), [logs système](https://kubernetes.io/docs/concepts/cluster-administration/system-logs/), [Prometheus](https://prometheus.io/docs/introduction/overview/), [histogrammes](https://prometheus.io/docs/practices/histograms/), [OpenTelemetry Kubernetes](https://opentelemetry.io/docs/platforms/kubernetes/).

<a id="chapitre-18"></a>

## 18. Industrialiser sans masquer Kubernetes

**En bref.** CRD, Operators, CI/CD et GitOps automatisent ce que les chapitres précédents font à la main. Ils ne suppriment aucun des contrôles : ils les exécutent plus souvent, avec leurs propres identités, permissions et pannes possibles.

### 18.1 CRD, contrôleur et Operator

| Élément | Rôle | Sans l'élément suivant… |
|---|---|---|
| CRD | Ajoute un schéma (un nouveau type) à l'API | …les objets sont stockés mais rien ne se passe |
| Contrôleur | Réagit aux objets de ce type | — |
| Operator | Contrôleur qui applique une connaissance d'exploitation (souvent via des CRD) | — |

Un Operator de base de données peut gérer réplication et sauvegardes **selon son contrat** ; son nom seul ne prouve ni la haute disponibilité ni une restauration fiable.

L'atelier A11 installe, en option, cert-manager 1.21.2 : il observe une ressource Certificate, son statut et le Secret produit. Le chart est fourni, ses images verrouillées, et sa compatibilité distinguée du programme d'examen. C'est un exemple concret de réconciliation étendue — pas une nécessité pour les certificats autosignés initiaux.

### 18.2 De Git à la cible

<div class="not-content kd-figure" style="margin:1.5rem 0">
<svg xmlns="http://www.w3.org/2000/svg" class="kd" style="max-width:100%;height:auto;display:block" data-pagefind-ignore width="520" height="530" viewBox="0 0 520 530" role="img" aria-labelledby="kd42-t kd42-d">
<title id="kd42-t">De Git à la cible : une boucle vérifiée</title>
<desc id="kd42-d">Sept étapes : commit et revue ; syntaxe, schémas et rendus ; images analysées, SBOM et signature ; diff et validation API en dry-run ; application sur une cible explicite ; tests fonctionnels, d'accès et de résilience ; observations et retour documenté, qui alimentent le commit suivant.</desc>
<style>
svg.kd text{font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;fill:#111827}
svg.kd .bg{fill:#f7f8fb;stroke:#d5dbe5;stroke-width:1.5}
svg.kd .ttl{font-size:19px;font-weight:700}
svg.kd .tb{font-size:17px;font-weight:700}
svg.kd .tb15{font-size:16px;font-weight:700}
svg.kd .t{font-size:16px}
svg.kd .s{font-size:15px;fill:#374151}
svg.kd .ok{fill:#166534;font-weight:700}
svg.kd .bad{fill:#b91c1c;font-weight:700}
svg.kd .k-blue{fill:#e8eefc;stroke:#2f5bd3}
svg.kd .k-teal{fill:#e1f3ef;stroke:#0f766e}
svg.kd .k-violet{fill:#efe9fd;stroke:#6d28d9}
svg.kd .k-amber{fill:#fdf3e1;stroke:#b45309}
svg.kd .k-red{fill:#fdeaea;stroke:#b91c1c}
svg.kd .k-green{fill:#e6f5ea;stroke:#15803d}
svg.kd .k-gray{fill:#ffffff;stroke:#8b97a8}
svg.kd .k-panel{fill:#eef1f6;stroke:#c3cbd8}
svg.kd .dash{stroke-dasharray:6 5}
svg.kd .ln{stroke:#4b5563;stroke-width:2;fill:none}
svg.kd .ln-ok{stroke:#15803d}
svg.kd .ln-bad{stroke:#b91c1c}
svg.kd .life{stroke:#8b97a8;stroke-width:1.5;stroke-dasharray:4 5;fill:none}
svg.kd .ah{fill:#4b5563}
svg.kd .ah-ok{fill:#15803d}
svg.kd .ah-bad{fill:#b91c1c}
svg.kd .bdg{fill:#2f5bd3}
svg.kd .bdg-t{fill:#ffffff;font-size:13px;font-weight:700}
:root[data-theme='dark'] svg.kd text{fill:#f3f4f6}
:root[data-theme='dark'] svg.kd .bg{fill:#111827;stroke:#374151}
:root[data-theme='dark'] svg.kd .s{fill:#d1d5db}
:root[data-theme='dark'] svg.kd .ok{fill:#86efac}
:root[data-theme='dark'] svg.kd .bad{fill:#fca5a5}
:root[data-theme='dark'] svg.kd .k-blue{fill:#1b2a4d;stroke:#8fb1ff}
:root[data-theme='dark'] svg.kd .k-teal{fill:#0f302c;stroke:#5eead4}
:root[data-theme='dark'] svg.kd .k-violet{fill:#2a1f4d;stroke:#c4b5fd}
:root[data-theme='dark'] svg.kd .k-amber{fill:#3a2a10;stroke:#fcd34d}
:root[data-theme='dark'] svg.kd .k-red{fill:#3d1717;stroke:#fca5a5}
:root[data-theme='dark'] svg.kd .k-green{fill:#12321d;stroke:#86efac}
:root[data-theme='dark'] svg.kd .k-gray{fill:#1f2937;stroke:#6b7280}
:root[data-theme='dark'] svg.kd .k-panel{fill:#172030;stroke:#334155}
:root[data-theme='dark'] svg.kd .ln{stroke:#cbd5e1}
:root[data-theme='dark'] svg.kd .ln-ok{stroke:#86efac}
:root[data-theme='dark'] svg.kd .ln-bad{stroke:#fca5a5}
:root[data-theme='dark'] svg.kd .life{stroke:#6b7280}
:root[data-theme='dark'] svg.kd .ah{fill:#cbd5e1}
:root[data-theme='dark'] svg.kd .ah-ok{fill:#86efac}
:root[data-theme='dark'] svg.kd .ah-bad{fill:#fca5a5}
:root[data-theme='dark'] svg.kd .bdg{fill:#8fb1ff}
:root[data-theme='dark'] svg.kd .bdg-t{fill:#0b1220}
@media (prefers-color-scheme:dark){
:root:not([data-theme]) svg.kd text{fill:#f3f4f6}
:root:not([data-theme]) svg.kd .bg{fill:#111827;stroke:#374151}
:root:not([data-theme]) svg.kd .s{fill:#d1d5db}
:root:not([data-theme]) svg.kd .ok{fill:#86efac}
:root:not([data-theme]) svg.kd .bad{fill:#fca5a5}
:root:not([data-theme]) svg.kd .k-blue{fill:#1b2a4d;stroke:#8fb1ff}
:root:not([data-theme]) svg.kd .k-teal{fill:#0f302c;stroke:#5eead4}
:root:not([data-theme]) svg.kd .k-violet{fill:#2a1f4d;stroke:#c4b5fd}
:root:not([data-theme]) svg.kd .k-amber{fill:#3a2a10;stroke:#fcd34d}
:root:not([data-theme]) svg.kd .k-red{fill:#3d1717;stroke:#fca5a5}
:root:not([data-theme]) svg.kd .k-green{fill:#12321d;stroke:#86efac}
:root:not([data-theme]) svg.kd .k-gray{fill:#1f2937;stroke:#6b7280}
:root:not([data-theme]) svg.kd .k-panel{fill:#172030;stroke:#334155}
:root:not([data-theme]) svg.kd .ln{stroke:#cbd5e1}
:root:not([data-theme]) svg.kd .ln-ok{stroke:#86efac}
:root:not([data-theme]) svg.kd .ln-bad{stroke:#fca5a5}
:root:not([data-theme]) svg.kd .life{stroke:#6b7280}
:root:not([data-theme]) svg.kd .ah{fill:#cbd5e1}
:root:not([data-theme]) svg.kd .ah-ok{fill:#86efac}
:root:not([data-theme]) svg.kd .ah-bad{fill:#fca5a5}
:root:not([data-theme]) svg.kd .bdg{fill:#8fb1ff}
:root:not([data-theme]) svg.kd .bdg-t{fill:#0b1220}
}
</style>
<defs>
<marker id="kd42-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah"/></marker>
<marker id="kd42-a-ok" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah-ok"/></marker>
<marker id="kd42-a-bad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah-bad"/></marker>
</defs>
<rect x="1" y="1" width="518" height="528" rx="14" class="bg"/>
<text x="20" y="34" class="ttl">De Git à la cible : une boucle vérifiée</text>
<rect x="20" y="56" width="410" height="48" rx="10" class="k-blue" stroke-width="1.6"/>
<circle cx="44" cy="80.0" r="11" class="bdg"/>
<text x="44" y="84.6" class="bdg-t" text-anchor="middle">1</text>
<text x="66" y="84.8" class="tb15" text-anchor="start">Commit et revue</text>
<path d="M225,106 L225,120" class="ln" marker-end="url(#kd42-a)"/>
<rect x="20" y="122" width="410" height="48" rx="10" class="k-blue" stroke-width="1.6"/>
<circle cx="44" cy="146.0" r="11" class="bdg"/>
<text x="44" y="150.6" class="bdg-t" text-anchor="middle">2</text>
<text x="66" y="150.8" class="tb15" text-anchor="start">Syntaxe, schémas, rendus</text>
<path d="M225,172 L225,186" class="ln" marker-end="url(#kd42-a)"/>
<rect x="20" y="188" width="410" height="48" rx="10" class="k-amber" stroke-width="1.6"/>
<circle cx="44" cy="212.0" r="11" class="bdg"/>
<text x="44" y="216.6" class="bdg-t" text-anchor="middle">3</text>
<text x="66" y="216.8" class="tb15" text-anchor="start">Images : scan, SBOM, signature</text>
<path d="M225,238 L225,252" class="ln" marker-end="url(#kd42-a)"/>
<rect x="20" y="254" width="410" height="48" rx="10" class="k-amber" stroke-width="1.6"/>
<circle cx="44" cy="278.0" r="11" class="bdg"/>
<text x="44" y="282.6" class="bdg-t" text-anchor="middle">4</text>
<text x="66" y="282.8" class="tb15" text-anchor="start">Diff et validation API (dry-run)</text>
<path d="M225,304 L225,318" class="ln" marker-end="url(#kd42-a)"/>
<rect x="20" y="320" width="410" height="48" rx="10" class="k-green" stroke-width="1.6"/>
<circle cx="44" cy="344.0" r="11" class="bdg"/>
<text x="44" y="348.6" class="bdg-t" text-anchor="middle">5</text>
<text x="66" y="348.8" class="tb15" text-anchor="start">Application sur une cible explicite</text>
<path d="M225,370 L225,384" class="ln" marker-end="url(#kd42-a)"/>
<rect x="20" y="386" width="410" height="48" rx="10" class="k-green" stroke-width="1.6"/>
<circle cx="44" cy="410.0" r="11" class="bdg"/>
<text x="44" y="414.6" class="bdg-t" text-anchor="middle">6</text>
<text x="66" y="414.8" class="tb15" text-anchor="start">Tests : fonction, accès, résilience</text>
<path d="M225,436 L225,450" class="ln" marker-end="url(#kd42-a)"/>
<rect x="20" y="452" width="410" height="48" rx="10" class="k-violet" stroke-width="1.6"/>
<circle cx="44" cy="476.0" r="11" class="bdg"/>
<text x="44" y="480.6" class="bdg-t" text-anchor="middle">7</text>
<text x="66" y="480.8" class="tb15" text-anchor="start">Observations et retour documenté</text>
<path d="M432,476 L474,476 L474,80 L434,80" class="ln" marker-end="url(#kd42-a)"/>
<text x="496" y="278" class="s" text-anchor="middle" transform="rotate(-90 496 278)">amélioration suivante</text>
</svg>
</div>

- La **CI** (*Continuous Integration*) valide les propositions.
- La **CD** (*Continuous Delivery/Deployment*) prépare ou applique les changements selon l'organisation.
- Un **réconciliateur GitOps** (une implémentation Flux ou Argo CD choisie et versionnée) compare en continu Git et la cible. Il a besoin de ses propres permissions, d'identifiants pour le dépôt et le registre, d'une politique de synchronisation et d'une procédure de **suspension pendant une urgence**.

N'utilisez pas un kubeconfig cluster-admin dans tous les jobs pour simplifier la CI.

**Étapes minimales pour ce dossier :**

1. checkout du commit réel ;
2. installation des outils gelés ;
3. validation statique ;
4. rendu et diff sur un contexte explicite ;
5. test API avec un compte autorisé ;
6. application de la source approuvée ;
7. contrôles HTTP, RBAC et NetworkPolicies, puis collecte des résultats.

Le script `validate-api.sh` s'arrête **avant** l'application réelle. L'environnement de CI ne doit pas pouvoir écrire en production simplement parce qu'un namespace de test porte le même nom.

### 18.3 Construction, déploiement, exécution : trois contrôles distincts

| Moment | Risque principal | Contrôle |
|---|---|---|
| Construction | Dépendances, image de base, outils de build | Figer et vérifier les entrées ; produire SBOM et provenance ; scanner puis traiter les défauts |
| Déploiement | Image ou configuration non approuvée | Admission vérifiant registre/digest, signature/identité, contexte de sécurité. Son indisponibilité (mode *fail-open* ou *fail-closed*) a une conséquence opérationnelle |
| Exécution | Comportement ou accès inattendu | Observer, répondre en conservant les preuves |

Le chapitre 15 relie ces mesures aux menaces et aux tests. Toute exception porte un responsable, une justification, une durée, un périmètre et un test de retrait. Ne désactivez pas globalement l'admission pour l'incident d'une seule image. La checklist officielle de sécurité structure une revue, sans remplacer les résultats de contrôle.

### 18.4 Les compléments à apprendre au bon moment

| Complément | L'apprendre quand | Prérequis à vérifier |
|---|---|---|
| Helm / Kustomize | Plusieurs déploiements ou paramètres | Rendu lisible, propriété des objets, verrous |
| Gateway / Ingress | Exposer HTTP/TLS | Implémentation compatible, routes, certificats, politiques réseau |
| CSI / snapshots | Volume dynamique ou reprise de disque | Pilote, attachements, topologie, droits cloud, cohérence des données |
| Metrics / Prometheus / traces | Établir une performance ou un SLO | Budget de ressources, collecte sécurisée, rétention |
| GitOps | Réconcilier depuis Git | Identités limitées, image et commit approuvés, gestion des urgences |
| Operator | Automatiser une exploitation spécialisée | Contrat de réplication/sauvegarde, compatibilité, plan de désinstallation |

**Sources :** [custom resources](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/), [pattern Operator](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/), [OpenGitOps](https://opengitops.dev/), [checklist sécurité](https://kubernetes.io/docs/concepts/security/security-checklist/), [cert-manager installation](https://cert-manager.io/docs/installation/helm/).


<a id="chapitre-19"></a>

## 19. etcd, Raft et reprise du control plane

**En bref.** etcd est le **registre** de l'état Kubernetes. Il reste disponible tant qu'une **majorité** de ses membres communique. Ce chapitre explique ce qu'il contient, comment il décide (Raft, quorum), comment le sauvegarder et comment le restaurer — en distinguant la réparation d'un membre et la restauration complète.

| Parcours | Sections | Vous saurez |
|---|---|---|
| Découvrir | [§19.1 à 19.4](#etcd-comprendre) | Ce que contient etcd, comment Raft engage une écriture, calculer un quorum |
| Pratiquer | [§19.5 à 19.7](#etcd-preuves) | Recueillir des preuves, sauvegarder, vérifier une sauvegarde, gérer les certificats |
| Approfondir | [§19.8 à 19.12](#etcd-maintenance) | Maintenance, remplacement d'un membre, restauration à un ou trois membres |

Les opérations de reprise exigent les prérequis Linux, TLS, stockage et static Pods. Elles se font **sur le laboratoire kubeadm**, jamais par transposition automatique sur kind ou sur un service managé.

:::note[Versions et validation]
Références vérifiées le **16 octobre 2026**. Laboratoire : Kubernetes/kubeadm **1.35.8**, image etcd kubeadm **3.6.6-0**, clients `etcdctl` et `etcdutl` **3.6.6**, Ubuntu 24.04 LTS amd64, containerd. Le suffixe `-0` désigne le paquet d'image Kubernetes ; le serveur annonce normalement `3.6.6`. Ce couplage est confirmé par les [constantes du tag Kubernetes v1.35.8](https://raw.githubusercontent.com/kubernetes/kubernetes/v1.35.8/cmd/kubeadm/app/constants/constants.go) ; ce n'est ni la dernière version d'etcd, ni la version de l'examen. Les scripts livrés ont passé les contrôles statiques du registre de validation. **Aucun cluster n'a été démarré pour rédiger ce guide : résultats et chronométrages restent à renseigner.**
:::

<a id="etcd-comprendre"></a>

### 19.1 Un registre de l'état Kubernetes

etcd est un magasin distribué de paires **clé/valeur**. Kubernetes y conserve les objets de son API : Deployments, Pods, Services, Secrets, règles RBAC, métadonnées et états rapportés par les composants. L'API Server arbitre tous les accès : ni un kubelet ni une application ne doit écrire directement dans l'espace Kubernetes d'etcd. Les objets y sont encodés, parfois chiffrés : parcourir etcd ne remplace pas `kubectl`.

**Analogie : un registre partagé.** On y inscrit « trois serveurs web sont demandés » et les observations déclarées. Le registre n'exécute pas les serveurs, et ce n'est pas une télémétrie instantanée : une observation peut avoir du retard.

| Dans le périmètre d'etcd | Hors de ce périmètre |
|---|---|
| Objets Kubernetes et leurs statuts persistés | Contenu des PersistentVolumes, tables MySQL, objets S3 |
| Secrets Kubernetes, éventuellement chiffrés par l'API Server | Clés externes du fournisseur KMS, clés de déchiffrement absentes du snapshot |
| Références des PVC et du CSI | Fichiers réellement stockés par le pilote CSI |
| Configuration logique du cluster | Binaires, images, système des nœuds, configuration locale de kubeadm |

Une sauvegarde complète coordonne donc **état Kubernetes, données métier et moyens de reconstruire les nœuds**. Restaurer un PVC dans etcd ne recrée pas un disque supprimé ; restaurer un ancien Secret alors qu'une base utilise un mot de passe plus récent peut casser l'application. Documentez l'ordre de reprise des dépendances et les points de cohérence applicatifs.

:::tip[À retenir : panne d'etcd ≠ tout est perdu]
Une panne d'etcd bloque les **changements fiables** du control plane. Les Pods existants peuvent continuer à fonctionner, avec leur réseau déjà configuré, tant que leurs dépendances restent disponibles. En revanche, le remplacement d'un Pod perdu et les changements de configuration ne sont plus assurés. L'effet exact dépend de la durée de la panne, des caches et de la topologie. Voir [Kubernetes : exploitation d'etcd](https://v1-35.docs.kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/) et [etcd : modes de panne](https://etcd.io/docs/v3.6/op-guide/failures/).
:::

### 19.2 Raft : un journal répliqué, pas un vote sur le contenu

Le protocole **Raft** coordonne des serveurs qui suivent le protocole (non *byzantins*). Il organise leur **journal d'opérations** et l'application déterministe des opérations validées. Il ne juge pas si une modification est raisonnable : un effacement autorisé se réplique aussi bien qu'une bonne configuration.

| Terme | Signification |
|---|---|
| Leader | Membre qui pilote la réplication ; un follower peut recevoir une requête et la faire traiter par le leader |
| Follower | Membre qui reçoit et persiste les entrées du leader |
| Candidate | État temporaire pendant une élection |
| Heartbeat | Message de maintien de présence du leader |
| Term | Époque logique d'élection (pas une heure) |

Un membre ne donne **qu'un vote par term**, et seulement à un candidat dont le journal est au moins aussi à jour que le sien : il ne vote pas pour le premier candidat visible.

<div class="not-content kd-figure" style="margin:1.5rem 0">
<svg xmlns="http://www.w3.org/2000/svg" class="kd" style="max-width:100%;height:auto;display:block" data-pagefind-ignore width="520" height="548" viewBox="0 0 520 548" role="img" aria-labelledby="kd43-t kd43-d">
<title id="kd43-t">Raft : une écriture validée par la majorité</title>
<desc id="kd43-d">L'API Server envoie une écriture au leader etcd, qui l'ajoute à son journal local et la réplique aux deux followers. Dès que le follower 1 a persisté l'entrée, le leader dispose de 2 copies sur 3 : il engage (commit) l'écriture, l'applique et répond à l'API Server. Le follower 2 rattrape ensuite le journal.</desc>
<style>
svg.kd text{font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;fill:#111827}
svg.kd .bg{fill:#f7f8fb;stroke:#d5dbe5;stroke-width:1.5}
svg.kd .ttl{font-size:19px;font-weight:700}
svg.kd .tb{font-size:17px;font-weight:700}
svg.kd .tb15{font-size:16px;font-weight:700}
svg.kd .t{font-size:16px}
svg.kd .s{font-size:15px;fill:#374151}
svg.kd .ok{fill:#166534;font-weight:700}
svg.kd .bad{fill:#b91c1c;font-weight:700}
svg.kd .k-blue{fill:#e8eefc;stroke:#2f5bd3}
svg.kd .k-teal{fill:#e1f3ef;stroke:#0f766e}
svg.kd .k-violet{fill:#efe9fd;stroke:#6d28d9}
svg.kd .k-amber{fill:#fdf3e1;stroke:#b45309}
svg.kd .k-red{fill:#fdeaea;stroke:#b91c1c}
svg.kd .k-green{fill:#e6f5ea;stroke:#15803d}
svg.kd .k-gray{fill:#ffffff;stroke:#8b97a8}
svg.kd .k-panel{fill:#eef1f6;stroke:#c3cbd8}
svg.kd .dash{stroke-dasharray:6 5}
svg.kd .ln{stroke:#4b5563;stroke-width:2;fill:none}
svg.kd .ln-ok{stroke:#15803d}
svg.kd .ln-bad{stroke:#b91c1c}
svg.kd .life{stroke:#8b97a8;stroke-width:1.5;stroke-dasharray:4 5;fill:none}
svg.kd .ah{fill:#4b5563}
svg.kd .ah-ok{fill:#15803d}
svg.kd .ah-bad{fill:#b91c1c}
svg.kd .bdg{fill:#2f5bd3}
svg.kd .bdg-t{fill:#ffffff;font-size:13px;font-weight:700}
:root[data-theme='dark'] svg.kd text{fill:#f3f4f6}
:root[data-theme='dark'] svg.kd .bg{fill:#111827;stroke:#374151}
:root[data-theme='dark'] svg.kd .s{fill:#d1d5db}
:root[data-theme='dark'] svg.kd .ok{fill:#86efac}
:root[data-theme='dark'] svg.kd .bad{fill:#fca5a5}
:root[data-theme='dark'] svg.kd .k-blue{fill:#1b2a4d;stroke:#8fb1ff}
:root[data-theme='dark'] svg.kd .k-teal{fill:#0f302c;stroke:#5eead4}
:root[data-theme='dark'] svg.kd .k-violet{fill:#2a1f4d;stroke:#c4b5fd}
:root[data-theme='dark'] svg.kd .k-amber{fill:#3a2a10;stroke:#fcd34d}
:root[data-theme='dark'] svg.kd .k-red{fill:#3d1717;stroke:#fca5a5}
:root[data-theme='dark'] svg.kd .k-green{fill:#12321d;stroke:#86efac}
:root[data-theme='dark'] svg.kd .k-gray{fill:#1f2937;stroke:#6b7280}
:root[data-theme='dark'] svg.kd .k-panel{fill:#172030;stroke:#334155}
:root[data-theme='dark'] svg.kd .ln{stroke:#cbd5e1}
:root[data-theme='dark'] svg.kd .ln-ok{stroke:#86efac}
:root[data-theme='dark'] svg.kd .ln-bad{stroke:#fca5a5}
:root[data-theme='dark'] svg.kd .life{stroke:#6b7280}
:root[data-theme='dark'] svg.kd .ah{fill:#cbd5e1}
:root[data-theme='dark'] svg.kd .ah-ok{fill:#86efac}
:root[data-theme='dark'] svg.kd .ah-bad{fill:#fca5a5}
:root[data-theme='dark'] svg.kd .bdg{fill:#8fb1ff}
:root[data-theme='dark'] svg.kd .bdg-t{fill:#0b1220}
@media (prefers-color-scheme:dark){
:root:not([data-theme]) svg.kd text{fill:#f3f4f6}
:root:not([data-theme]) svg.kd .bg{fill:#111827;stroke:#374151}
:root:not([data-theme]) svg.kd .s{fill:#d1d5db}
:root:not([data-theme]) svg.kd .ok{fill:#86efac}
:root:not([data-theme]) svg.kd .bad{fill:#fca5a5}
:root:not([data-theme]) svg.kd .k-blue{fill:#1b2a4d;stroke:#8fb1ff}
:root:not([data-theme]) svg.kd .k-teal{fill:#0f302c;stroke:#5eead4}
:root:not([data-theme]) svg.kd .k-violet{fill:#2a1f4d;stroke:#c4b5fd}
:root:not([data-theme]) svg.kd .k-amber{fill:#3a2a10;stroke:#fcd34d}
:root:not([data-theme]) svg.kd .k-red{fill:#3d1717;stroke:#fca5a5}
:root:not([data-theme]) svg.kd .k-green{fill:#12321d;stroke:#86efac}
:root:not([data-theme]) svg.kd .k-gray{fill:#1f2937;stroke:#6b7280}
:root:not([data-theme]) svg.kd .k-panel{fill:#172030;stroke:#334155}
:root:not([data-theme]) svg.kd .ln{stroke:#cbd5e1}
:root:not([data-theme]) svg.kd .ln-ok{stroke:#86efac}
:root:not([data-theme]) svg.kd .ln-bad{stroke:#fca5a5}
:root:not([data-theme]) svg.kd .life{stroke:#6b7280}
:root:not([data-theme]) svg.kd .ah{fill:#cbd5e1}
:root:not([data-theme]) svg.kd .ah-ok{fill:#86efac}
:root:not([data-theme]) svg.kd .ah-bad{fill:#fca5a5}
:root:not([data-theme]) svg.kd .bdg{fill:#8fb1ff}
:root:not([data-theme]) svg.kd .bdg-t{fill:#0b1220}
}
</style>
<defs>
<marker id="kd43-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah"/></marker>
<marker id="kd43-a-ok" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah-ok"/></marker>
<marker id="kd43-a-bad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah-bad"/></marker>
</defs>
<rect x="1" y="1" width="518" height="546" rx="14" class="bg"/>
<text x="20" y="34" class="ttl">Raft : une écriture validée par la majorité</text>
<rect x="8" y="54" width="112" height="40" rx="10" class="k-teal" stroke-width="1.6"/>
<text x="64.0" y="78.8" class="tb15" text-anchor="middle">API Server</text>
<path d="M64,96 V476" class="life"/>
<rect x="134" y="54" width="112" height="40" rx="10" class="k-blue" stroke-width="1.6"/>
<text x="190.0" y="78.8" class="tb15" text-anchor="middle">Leader</text>
<path d="M190,96 V476" class="life"/>
<rect x="260" y="54" width="112" height="40" rx="10" class="k-gray" stroke-width="1.6"/>
<text x="316.0" y="78.8" class="tb15" text-anchor="middle">Follower 1</text>
<path d="M316,96 V476" class="life"/>
<rect x="386" y="54" width="112" height="40" rx="10" class="k-gray" stroke-width="1.6"/>
<text x="442.0" y="78.8" class="tb15" text-anchor="middle">Follower 2</text>
<path d="M442,96 V476" class="life"/>
<path d="M64,136 L186,136" class="ln" marker-end="url(#kd43-a)"/>
<circle cx="90" cy="121" r="11" class="bdg"/>
<text x="90" y="125.6" class="bdg-t" text-anchor="middle">1</text>
<text x="106" y="126" class="s" text-anchor="start">écriture</text>
<rect x="130" y="156" width="120" height="46" rx="10" class="k-amber" stroke-width="1.6"/>
<text x="190.0" y="174.1" class="s" text-anchor="middle">ajoute au</text>
<text x="190.0" y="193.1" class="s" text-anchor="middle">journal local</text>
<circle cx="116" cy="179" r="11" class="bdg"/>
<text x="116" y="183.6" class="bdg-t" text-anchor="middle">2</text>
<path d="M190,236 L312,236" class="ln" marker-end="url(#kd43-a)"/>
<circle cx="216" cy="221" r="11" class="bdg"/>
<text x="216" y="225.6" class="bdg-t" text-anchor="middle">3</text>
<text x="232" y="226" class="s" text-anchor="start">entrée</text>
<path d="M190,270 L438,270" class="ln" marker-end="url(#kd43-a)"/>
<circle cx="216" cy="255" r="11" class="bdg"/>
<text x="216" y="259.6" class="bdg-t" text-anchor="middle">3</text>
<text x="232" y="260" class="s" text-anchor="start">entrée</text>
<path d="M316,310 L194,310" class="ln ln-ok dash" marker-end="url(#kd43-a-ok)"/>
<circle cx="216" cy="295" r="11" class="bdg"/>
<text x="216" y="299.6" class="bdg-t" text-anchor="middle">4</text>
<text x="232" y="300" class="s" text-anchor="start">persistée</text>
<rect x="130" y="330" width="120" height="46" rx="10" class="k-green" stroke-width="1.6"/>
<text x="190.0" y="348.3" class="tb15" text-anchor="middle">2/3 copies</text>
<text x="190.0" y="367.6" class="s" text-anchor="middle">→ commit</text>
<circle cx="116" cy="353" r="11" class="bdg"/>
<text x="116" y="357.6" class="bdg-t" text-anchor="middle">5</text>
<path d="M190,410 L68,410" class="ln dash" marker-end="url(#kd43-a)"/>
<circle cx="90" cy="395" r="11" class="bdg"/>
<text x="90" y="399.6" class="bdg-t" text-anchor="middle">6</text>
<text x="106" y="400" class="s" text-anchor="start">résultat</text>
<path d="M190,452 L438,452" class="ln dash" marker-end="url(#kd43-a)"/>
<circle cx="216" cy="437" r="11" class="bdg"/>
<text x="216" y="441.6" class="bdg-t" text-anchor="middle">7</text>
<text x="232" y="442" class="s" text-anchor="start">rattrapage</text>
<text x="20" y="506" class="s" text-anchor="start">Le leader compte sa propre copie : avec 3 votants,</text>
<text x="20" y="526" class="s" text-anchor="start">2 copies persistées forment la majorité.</text>
</svg>
</div>

**Lecture du schéma :**

1. l'API Server envoie une écriture au leader ;
2. le leader l'ajoute à son journal local ;
3. il la réplique aux followers ;
4. le follower 1 confirme qu'il l'a persistée ;
5. le leader compte sa propre copie : **2 copies sur 3 = majorité**, il engage (*commit*) et applique l'écriture ;
6. il répond à l'API Server ;
7. le follower 2 rattrape le journal ensuite.

**Ce que cela implique :**

- une écriture **acquittée** appartient à l'état engagé : tout nouveau leader éligible la conserve ;
- une entrée présente seulement sur un ancien leader, sans engagement, peut disparaître après une élection ;
- la réponse au client peut être perdue alors que l'opération a été engagée : **un délai dépassé ne prouve pas l'absence d'écriture**. Concevez les reprises de requêtes avec transactions et idempotence.

Détails dans [l'article original Raft](https://raft.github.io/raft.pdf).

<details>
<summary>Approfondir : révisions MVCC, watches et types de lecture</summary>

etcd distingue l'ordre du journal Raft et la **révision MVCC** (*Multi-Version Concurrency Control*) de son espace clé/valeur. Une transaction qui modifie plusieurs clés peut leur attribuer la même révision. Le *Raft index*, le *term*, la révision etcd et le `resourceVersion` Kubernetes ne sont **pas** des compteurs interchangeables : traitez `resourceVersion` comme une valeur opaque et utilisez l'API Kubernetes pour ses watches.

etcd conserve les versions successives des clés jusqu'à leur **compaction**. Une **watch** reçoit les événements à partir d'une révision ; si celle-ci n'est plus disponible, le client doit reconstruire sa vue. Une lecture **linearizable** respecte un ordre cohérent avec les opérations achevées ; une lecture **serializable** locale peut renvoyer une valeur ancienne. Une réponse locale ne prouve donc pas qu'un quorum fonctionne. Sources : [modèle de données](https://etcd.io/docs/v3.6/learning/data_model/), [garanties de l'API](https://etcd.io/docs/v3.6/learning/api_guarantees/).

</details>

### 19.3 Quorum, partitions et domaines de panne

Pour **N membres votants**, le quorum vaut `floor(N/2) + 1`. Les membres *learners* ne votent pas tant qu'ils ne sont pas promus.

| Votants | Majorité | Pannes simultanées tolérées | Conséquence pratique |
|---:|---:|---:|---|
| 1 | 1 | 0 | Laboratoire léger ; toute maintenance arrête etcd |
| 2 | 2 | 0 | Deux copies, mais **aucune** tolérance à une panne |
| 3 | 2 | 1 | Choix HA courant ; maintenance d'un seul membre à la fois |
| 4 | 3 | 1 | Aucune panne supplémentaire tolérée par rapport à trois |
| 5 | 3 | 2 | Coût et trafic accrus ; choix à justifier |
| 7 | 4 | 3 | Pas automatiquement une meilleure disponibilité globale |

<div class="not-content kd-figure" style="margin:1.5rem 0">
<svg xmlns="http://www.w3.org/2000/svg" class="kd" style="max-width:100%;height:auto;display:block" data-pagefind-ignore width="520" height="584" viewBox="0 0 520 584" role="img" aria-labelledby="kd44-t kd44-d">
<title id="kd44-t">Quorum de 3 membres : la majorité décide</title>
<desc id="kd44-d">Trois cas. Trois membres connectés : majorité de 2 sur 3, écritures possibles. Partition 2 + 1 : le groupe de deux membres garde la majorité et peut écrire, le membre isolé ne peut rien engager. Partition 1 + 1 + 1 : aucun groupe n'a de majorité, les écritures sont bloquées.</desc>
<style>
svg.kd text{font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;fill:#111827}
svg.kd .bg{fill:#f7f8fb;stroke:#d5dbe5;stroke-width:1.5}
svg.kd .ttl{font-size:19px;font-weight:700}
svg.kd .tb{font-size:17px;font-weight:700}
svg.kd .tb15{font-size:16px;font-weight:700}
svg.kd .t{font-size:16px}
svg.kd .s{font-size:15px;fill:#374151}
svg.kd .ok{fill:#166534;font-weight:700}
svg.kd .bad{fill:#b91c1c;font-weight:700}
svg.kd .k-blue{fill:#e8eefc;stroke:#2f5bd3}
svg.kd .k-teal{fill:#e1f3ef;stroke:#0f766e}
svg.kd .k-violet{fill:#efe9fd;stroke:#6d28d9}
svg.kd .k-amber{fill:#fdf3e1;stroke:#b45309}
svg.kd .k-red{fill:#fdeaea;stroke:#b91c1c}
svg.kd .k-green{fill:#e6f5ea;stroke:#15803d}
svg.kd .k-gray{fill:#ffffff;stroke:#8b97a8}
svg.kd .k-panel{fill:#eef1f6;stroke:#c3cbd8}
svg.kd .dash{stroke-dasharray:6 5}
svg.kd .ln{stroke:#4b5563;stroke-width:2;fill:none}
svg.kd .ln-ok{stroke:#15803d}
svg.kd .ln-bad{stroke:#b91c1c}
svg.kd .life{stroke:#8b97a8;stroke-width:1.5;stroke-dasharray:4 5;fill:none}
svg.kd .ah{fill:#4b5563}
svg.kd .ah-ok{fill:#15803d}
svg.kd .ah-bad{fill:#b91c1c}
svg.kd .bdg{fill:#2f5bd3}
svg.kd .bdg-t{fill:#ffffff;font-size:13px;font-weight:700}
:root[data-theme='dark'] svg.kd text{fill:#f3f4f6}
:root[data-theme='dark'] svg.kd .bg{fill:#111827;stroke:#374151}
:root[data-theme='dark'] svg.kd .s{fill:#d1d5db}
:root[data-theme='dark'] svg.kd .ok{fill:#86efac}
:root[data-theme='dark'] svg.kd .bad{fill:#fca5a5}
:root[data-theme='dark'] svg.kd .k-blue{fill:#1b2a4d;stroke:#8fb1ff}
:root[data-theme='dark'] svg.kd .k-teal{fill:#0f302c;stroke:#5eead4}
:root[data-theme='dark'] svg.kd .k-violet{fill:#2a1f4d;stroke:#c4b5fd}
:root[data-theme='dark'] svg.kd .k-amber{fill:#3a2a10;stroke:#fcd34d}
:root[data-theme='dark'] svg.kd .k-red{fill:#3d1717;stroke:#fca5a5}
:root[data-theme='dark'] svg.kd .k-green{fill:#12321d;stroke:#86efac}
:root[data-theme='dark'] svg.kd .k-gray{fill:#1f2937;stroke:#6b7280}
:root[data-theme='dark'] svg.kd .k-panel{fill:#172030;stroke:#334155}
:root[data-theme='dark'] svg.kd .ln{stroke:#cbd5e1}
:root[data-theme='dark'] svg.kd .ln-ok{stroke:#86efac}
:root[data-theme='dark'] svg.kd .ln-bad{stroke:#fca5a5}
:root[data-theme='dark'] svg.kd .life{stroke:#6b7280}
:root[data-theme='dark'] svg.kd .ah{fill:#cbd5e1}
:root[data-theme='dark'] svg.kd .ah-ok{fill:#86efac}
:root[data-theme='dark'] svg.kd .ah-bad{fill:#fca5a5}
:root[data-theme='dark'] svg.kd .bdg{fill:#8fb1ff}
:root[data-theme='dark'] svg.kd .bdg-t{fill:#0b1220}
@media (prefers-color-scheme:dark){
:root:not([data-theme]) svg.kd text{fill:#f3f4f6}
:root:not([data-theme]) svg.kd .bg{fill:#111827;stroke:#374151}
:root:not([data-theme]) svg.kd .s{fill:#d1d5db}
:root:not([data-theme]) svg.kd .ok{fill:#86efac}
:root:not([data-theme]) svg.kd .bad{fill:#fca5a5}
:root:not([data-theme]) svg.kd .k-blue{fill:#1b2a4d;stroke:#8fb1ff}
:root:not([data-theme]) svg.kd .k-teal{fill:#0f302c;stroke:#5eead4}
:root:not([data-theme]) svg.kd .k-violet{fill:#2a1f4d;stroke:#c4b5fd}
:root:not([data-theme]) svg.kd .k-amber{fill:#3a2a10;stroke:#fcd34d}
:root:not([data-theme]) svg.kd .k-red{fill:#3d1717;stroke:#fca5a5}
:root:not([data-theme]) svg.kd .k-green{fill:#12321d;stroke:#86efac}
:root:not([data-theme]) svg.kd .k-gray{fill:#1f2937;stroke:#6b7280}
:root:not([data-theme]) svg.kd .k-panel{fill:#172030;stroke:#334155}
:root:not([data-theme]) svg.kd .ln{stroke:#cbd5e1}
:root:not([data-theme]) svg.kd .ln-ok{stroke:#86efac}
:root:not([data-theme]) svg.kd .ln-bad{stroke:#fca5a5}
:root:not([data-theme]) svg.kd .life{stroke:#6b7280}
:root:not([data-theme]) svg.kd .ah{fill:#cbd5e1}
:root:not([data-theme]) svg.kd .ah-ok{fill:#86efac}
:root:not([data-theme]) svg.kd .ah-bad{fill:#fca5a5}
:root:not([data-theme]) svg.kd .bdg{fill:#8fb1ff}
:root:not([data-theme]) svg.kd .bdg-t{fill:#0b1220}
}
</style>
<defs>
<marker id="kd44-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah"/></marker>
<marker id="kd44-a-ok" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah-ok"/></marker>
<marker id="kd44-a-bad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah-bad"/></marker>
</defs>
<rect x="1" y="1" width="518" height="582" rx="14" class="bg"/>
<text x="20" y="34" class="ttl">Quorum de 3 membres : la majorité décide</text>
<rect x="16" y="56" width="488" height="144" rx="12" class="k-panel" stroke-width="1.6"/>
<text x="32" y="113.8" class="tb15" text-anchor="start">3 membres connectés</text>
<text x="32" y="133.1" class="s" text-anchor="start">majorité 2/3 atteinte</text>
<text x="32" y="152.1" class="ok" text-anchor="start">✓ écritures possibles</text>
<rect x="16" y="212" width="488" height="144" rx="12" class="k-panel" stroke-width="1.6"/>
<text x="32" y="260.3" class="tb15" text-anchor="start">Partition 2 + 1</text>
<text x="32" y="279.6" class="s" text-anchor="start">cp1 + cp2 : majorité</text>
<text x="32" y="298.6" class="ok" text-anchor="start">✓ ce groupe écrit</text>
<text x="32" y="317.6" class="bad" text-anchor="start">✗ cp3 isolé : rien engagé</text>
<rect x="16" y="368" width="488" height="144" rx="12" class="k-panel" stroke-width="1.6"/>
<text x="32" y="416.3" class="tb15" text-anchor="start">Partition 1 + 1 + 1</text>
<text x="32" y="435.6" class="s" text-anchor="start">aucun groupe n'a 2 voix</text>
<text x="32" y="454.6" class="bad" text-anchor="start">✗ écritures bloquées</text>
<text x="32" y="473.6" class="s" text-anchor="start">réparer le réseau d'abord</text>
<path d="M322,98 L446,98" class="ln"/>
<path d="M446,98 L384,160" class="ln"/>
<path d="M384,160 L322,98" class="ln"/>
<circle cx="322" cy="98" r="24" class="k-blue" stroke-width="1.6"/>
<text x="322" y="103" class="tb15" text-anchor="middle">cp1</text>
<circle cx="446" cy="98" r="24" class="k-blue" stroke-width="1.6"/>
<text x="446" y="103" class="tb15" text-anchor="middle">cp2</text>
<circle cx="384" cy="160" r="24" class="k-blue" stroke-width="1.6"/>
<text x="384" y="165" class="tb15" text-anchor="middle">cp3</text>
<path d="M322,254 L446,254" class="ln"/>
<path d="M296,284 H476" class="ln ln-bad dash"/>
<circle cx="322" cy="254" r="24" class="k-blue" stroke-width="1.6"/>
<text x="322" y="259" class="tb15" text-anchor="middle">cp1</text>
<circle cx="446" cy="254" r="24" class="k-blue" stroke-width="1.6"/>
<text x="446" y="259" class="tb15" text-anchor="middle">cp2</text>
<circle cx="384" cy="316" r="24" class="k-red" stroke-width="1.6"/>
<text x="384" y="321" class="tb15" text-anchor="middle">cp3</text>
<path d="M384,380 V436 M384,436 L296,464 M384,436 L472,464" class="ln ln-bad dash"/>
<circle cx="322" cy="410" r="24" class="k-red" stroke-width="1.6"/>
<text x="322" y="415" class="tb15" text-anchor="middle">cp1</text>
<circle cx="446" cy="410" r="24" class="k-red" stroke-width="1.6"/>
<text x="446" y="415" class="tb15" text-anchor="middle">cp2</text>
<circle cx="384" cy="472" r="24" class="k-red" stroke-width="1.6"/>
<text x="384" y="477" class="tb15" text-anchor="middle">cp3</text>
<text x="20" y="542" class="s" text-anchor="start">Quorum = floor(N/2) + 1 membres votants.</text>
<text x="20" y="562" class="s" text-anchor="start">3 VM sur un même portable = un seul domaine de panne.</text>
</svg>
</div>

**Partitions réseau.** On ne compte pas des câbles coupés, mais des groupes capables de communiquer. Dans une partition `2 + 1`, les deux votants connectés continuent si un leader valide est élu ; le membre isolé ne peut engager aucune écriture. Dans une partition `1 + 1 + 1`, aucun groupe n'a de majorité. Comme deux majorités ont toujours un membre en commun, deux groupes séparés ne peuvent pas engager de décisions contradictoires.

**Domaines de panne.** Trois VM sur le même portable forment trois membres, mais **un seul domaine de panne physique**. En exploitation, comparez les risques hôte, disque, alimentation, zone et réseau ; répartissez les membres sans ignorer la latence nécessaire aux échanges. Cinq membres ne corrigent ni un stockage partagé défaillant ni une configuration TLS cassée partout. La [FAQ officielle etcd](https://etcd.io/docs/v3.6/faq/) explique le choix d'un nombre impair.

**Élections et délais.** Après la perte du leader, une nouvelle élection peut interrompre les écritures. Les durées de « 150 ms » ou « 500 ms » du document initial ne sont pas des garanties. Les valeurs par défaut documentées sont `--heartbeat-interval=100` et `--election-timeout=1000`, **en millisecondes**. Mesurez le temps aller-retour, la latence disque et la contention CPU avant tout réglage, et gardez des paramètres cohérents entre membres. Le [guide de réglage](https://etcd.io/docs/v3.6/tuning/) l'explique : une recette copiée d'un autre réseau provoque des élections inutiles ou une détection trop lente.

### 19.4 Topologie retenue et protection des flux

Le laboratoire utilise **etcd empilé** (*stacked etcd*) : chaque control plane kubeadm héberge un static Pod etcd.

- **Variante légère :** `cp1` seul, `192.168.56.11`.
- **Extension HA :** `cp1`, `cp2`, `cp3`, adresses `.11`, `.12`, `.13`.

<div class="not-content kd-figure" style="margin:1.5rem 0">
<svg xmlns="http://www.w3.org/2000/svg" class="kd" style="max-width:100%;height:auto;display:block" data-pagefind-ignore width="520" height="536" viewBox="0 0 520 536" role="img" aria-labelledby="kd45-t kd45-d">
<title id="kd45-t">etcd empilé : trois control planes</title>
<desc id="kd45-d">Le poste d'administration joint l'API via le répartiteur lb 192.168.56.10:6443. Le répartiteur envoie vers les API Servers de cp1, cp2 et cp3. Chaque API Server parle à l'etcd local sur 2379 ; les trois membres etcd échangent entre eux en mTLS sur 2380. L'adresse du répartiteur n'est pas un endpoint etcd.</desc>
<style>
svg.kd text{font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;fill:#111827}
svg.kd .bg{fill:#f7f8fb;stroke:#d5dbe5;stroke-width:1.5}
svg.kd .ttl{font-size:19px;font-weight:700}
svg.kd .tb{font-size:17px;font-weight:700}
svg.kd .tb15{font-size:16px;font-weight:700}
svg.kd .t{font-size:16px}
svg.kd .s{font-size:15px;fill:#374151}
svg.kd .ok{fill:#166534;font-weight:700}
svg.kd .bad{fill:#b91c1c;font-weight:700}
svg.kd .k-blue{fill:#e8eefc;stroke:#2f5bd3}
svg.kd .k-teal{fill:#e1f3ef;stroke:#0f766e}
svg.kd .k-violet{fill:#efe9fd;stroke:#6d28d9}
svg.kd .k-amber{fill:#fdf3e1;stroke:#b45309}
svg.kd .k-red{fill:#fdeaea;stroke:#b91c1c}
svg.kd .k-green{fill:#e6f5ea;stroke:#15803d}
svg.kd .k-gray{fill:#ffffff;stroke:#8b97a8}
svg.kd .k-panel{fill:#eef1f6;stroke:#c3cbd8}
svg.kd .dash{stroke-dasharray:6 5}
svg.kd .ln{stroke:#4b5563;stroke-width:2;fill:none}
svg.kd .ln-ok{stroke:#15803d}
svg.kd .ln-bad{stroke:#b91c1c}
svg.kd .life{stroke:#8b97a8;stroke-width:1.5;stroke-dasharray:4 5;fill:none}
svg.kd .ah{fill:#4b5563}
svg.kd .ah-ok{fill:#15803d}
svg.kd .ah-bad{fill:#b91c1c}
svg.kd .bdg{fill:#2f5bd3}
svg.kd .bdg-t{fill:#ffffff;font-size:13px;font-weight:700}
:root[data-theme='dark'] svg.kd text{fill:#f3f4f6}
:root[data-theme='dark'] svg.kd .bg{fill:#111827;stroke:#374151}
:root[data-theme='dark'] svg.kd .s{fill:#d1d5db}
:root[data-theme='dark'] svg.kd .ok{fill:#86efac}
:root[data-theme='dark'] svg.kd .bad{fill:#fca5a5}
:root[data-theme='dark'] svg.kd .k-blue{fill:#1b2a4d;stroke:#8fb1ff}
:root[data-theme='dark'] svg.kd .k-teal{fill:#0f302c;stroke:#5eead4}
:root[data-theme='dark'] svg.kd .k-violet{fill:#2a1f4d;stroke:#c4b5fd}
:root[data-theme='dark'] svg.kd .k-amber{fill:#3a2a10;stroke:#fcd34d}
:root[data-theme='dark'] svg.kd .k-red{fill:#3d1717;stroke:#fca5a5}
:root[data-theme='dark'] svg.kd .k-green{fill:#12321d;stroke:#86efac}
:root[data-theme='dark'] svg.kd .k-gray{fill:#1f2937;stroke:#6b7280}
:root[data-theme='dark'] svg.kd .k-panel{fill:#172030;stroke:#334155}
:root[data-theme='dark'] svg.kd .ln{stroke:#cbd5e1}
:root[data-theme='dark'] svg.kd .ln-ok{stroke:#86efac}
:root[data-theme='dark'] svg.kd .ln-bad{stroke:#fca5a5}
:root[data-theme='dark'] svg.kd .life{stroke:#6b7280}
:root[data-theme='dark'] svg.kd .ah{fill:#cbd5e1}
:root[data-theme='dark'] svg.kd .ah-ok{fill:#86efac}
:root[data-theme='dark'] svg.kd .ah-bad{fill:#fca5a5}
:root[data-theme='dark'] svg.kd .bdg{fill:#8fb1ff}
:root[data-theme='dark'] svg.kd .bdg-t{fill:#0b1220}
@media (prefers-color-scheme:dark){
:root:not([data-theme]) svg.kd text{fill:#f3f4f6}
:root:not([data-theme]) svg.kd .bg{fill:#111827;stroke:#374151}
:root:not([data-theme]) svg.kd .s{fill:#d1d5db}
:root:not([data-theme]) svg.kd .ok{fill:#86efac}
:root:not([data-theme]) svg.kd .bad{fill:#fca5a5}
:root:not([data-theme]) svg.kd .k-blue{fill:#1b2a4d;stroke:#8fb1ff}
:root:not([data-theme]) svg.kd .k-teal{fill:#0f302c;stroke:#5eead4}
:root:not([data-theme]) svg.kd .k-violet{fill:#2a1f4d;stroke:#c4b5fd}
:root:not([data-theme]) svg.kd .k-amber{fill:#3a2a10;stroke:#fcd34d}
:root:not([data-theme]) svg.kd .k-red{fill:#3d1717;stroke:#fca5a5}
:root:not([data-theme]) svg.kd .k-green{fill:#12321d;stroke:#86efac}
:root:not([data-theme]) svg.kd .k-gray{fill:#1f2937;stroke:#6b7280}
:root:not([data-theme]) svg.kd .k-panel{fill:#172030;stroke:#334155}
:root:not([data-theme]) svg.kd .ln{stroke:#cbd5e1}
:root:not([data-theme]) svg.kd .ln-ok{stroke:#86efac}
:root:not([data-theme]) svg.kd .ln-bad{stroke:#fca5a5}
:root:not([data-theme]) svg.kd .life{stroke:#6b7280}
:root:not([data-theme]) svg.kd .ah{fill:#cbd5e1}
:root:not([data-theme]) svg.kd .ah-ok{fill:#86efac}
:root:not([data-theme]) svg.kd .ah-bad{fill:#fca5a5}
:root:not([data-theme]) svg.kd .bdg{fill:#8fb1ff}
:root:not([data-theme]) svg.kd .bdg-t{fill:#0b1220}
}
</style>
<defs>
<marker id="kd45-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah"/></marker>
<marker id="kd45-a-ok" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah-ok"/></marker>
<marker id="kd45-a-bad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah-bad"/></marker>
</defs>
<rect x="1" y="1" width="518" height="534" rx="14" class="bg"/>
<text x="20" y="34" class="ttl">etcd empilé : trois control planes</text>
<rect x="140" y="54" width="240" height="44" rx="10" class="k-gray" stroke-width="1.6"/>
<text x="260.0" y="80.8" class="t" text-anchor="middle">Poste d'administration</text>
<path d="M260,100 L260,134" class="ln" marker-end="url(#kd45-a)"/>
<rect x="110" y="136" width="300" height="56" rx="10" class="k-amber" stroke-width="1.6"/>
<text x="260.0" y="159.3" class="tb15" text-anchor="middle">lb · HAProxy TCP</text>
<text x="260.0" y="178.6" class="s" text-anchor="middle">192.168.56.10:6443 — API seulement</text>
<path d="M260,194 L90,224" class="ln" marker-end="url(#kd45-a)"/>
<rect x="15" y="226" width="150" height="196" rx="12" class="k-panel" stroke-width="1.6"/>
<text x="90" y="250" class="tb15" text-anchor="middle">cp1 · .11</text>
<rect x="29" y="262" width="122" height="44" rx="10" class="k-blue" stroke-width="1.6"/>
<text x="90.0" y="288.8" class="tb15" text-anchor="middle">API Server</text>
<path d="M90,308 L90,336" class="ln" marker-end="url(#kd45-a)"/>
<text x="99" y="327" class="s" text-anchor="start">2379</text>
<path d="M39,347 a51.0,9 0 0 1 102,0 v48 a51.0,9 0 0 1 -102,0 z" class="k-violet" stroke-width="1.6"/>
<path d="M39,347 a51.0,9 0 0 0 102,0" class="k-violet" fill="none" stroke-width="1.6" style="fill:none"/>
<text x="90.0" y="375.3" class="tb15" text-anchor="middle">etcd</text>
<text x="90.0" y="394.6" class="s" text-anchor="middle">membre</text>
<path d="M260,194 L260,224" class="ln" marker-end="url(#kd45-a)"/>
<rect x="185" y="226" width="150" height="196" rx="12" class="k-panel" stroke-width="1.6"/>
<text x="260" y="250" class="tb15" text-anchor="middle">cp2 · .12</text>
<rect x="199" y="262" width="122" height="44" rx="10" class="k-blue" stroke-width="1.6"/>
<text x="260.0" y="288.8" class="tb15" text-anchor="middle">API Server</text>
<path d="M260,308 L260,336" class="ln" marker-end="url(#kd45-a)"/>
<text x="269" y="327" class="s" text-anchor="start">2379</text>
<path d="M209,347 a51.0,9 0 0 1 102,0 v48 a51.0,9 0 0 1 -102,0 z" class="k-violet" stroke-width="1.6"/>
<path d="M209,347 a51.0,9 0 0 0 102,0" class="k-violet" fill="none" stroke-width="1.6" style="fill:none"/>
<text x="260.0" y="375.3" class="tb15" text-anchor="middle">etcd</text>
<text x="260.0" y="394.6" class="s" text-anchor="middle">membre</text>
<path d="M260,194 L430,224" class="ln" marker-end="url(#kd45-a)"/>
<rect x="355" y="226" width="150" height="196" rx="12" class="k-panel" stroke-width="1.6"/>
<text x="430" y="250" class="tb15" text-anchor="middle">cp3 · .13</text>
<rect x="369" y="262" width="122" height="44" rx="10" class="k-blue" stroke-width="1.6"/>
<text x="430.0" y="288.8" class="tb15" text-anchor="middle">API Server</text>
<path d="M430,308 L430,336" class="ln" marker-end="url(#kd45-a)"/>
<text x="439" y="327" class="s" text-anchor="start">2379</text>
<path d="M379,347 a51.0,9 0 0 1 102,0 v48 a51.0,9 0 0 1 -102,0 z" class="k-violet" stroke-width="1.6"/>
<path d="M379,347 a51.0,9 0 0 0 102,0" class="k-violet" fill="none" stroke-width="1.6" style="fill:none"/>
<text x="430.0" y="375.3" class="tb15" text-anchor="middle">etcd</text>
<text x="430.0" y="394.6" class="s" text-anchor="middle">membre</text>
<path d="M128,376 L207,376" class="ln" marker-start="url(#kd45-a)" marker-end="url(#kd45-a)"/>
<path d="M298,376 L377,376" class="ln" marker-start="url(#kd45-a)" marker-end="url(#kd45-a)"/>
<path d="M90,406 L90,444 L430,444 L430,406" class="ln" marker-start="url(#kd45-a)" marker-end="url(#kd45-a)"/>
<text x="260" y="466" class="s" text-anchor="middle">peers etcd : mTLS 2380</text>
<text x="20" y="498" class="s" text-anchor="start">192.168.56.10 répartit l'API (6443) ;</text>
<text x="20" y="518" class="s" text-anchor="start">ce n'est pas un endpoint etcd (2379/2380).</text>
</svg>
</div>

Le répartiteur de l'API Kubernetes utilise `192.168.56.10:6443` ; cette adresse **n'est pas un endpoint etcd**.

Une topologie **etcd externe** sépare les hôtes etcd des hôtes API Server : elle réduit le couplage des pannes, au prix de machines, certificats et procédures supplémentaires. Les restaurations ci-dessous couvrent **uniquement la topologie empilée, à identités et adresses conservées**. Un service managé relève des procédures du fournisseur. Voir [les topologies HA kubeadm](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/ha-topology/).

| Flux | Accès à autoriser | Vérification |
|---|---|---|
| TCP 2379, clients etcd | API Servers et administrations identifiées | TLS client authentifié ; accès refusé sans certificat |
| TCP 2380, pairs etcd | Membres etcd entre eux | Certificats pairs et SAN correspondant aux noms et adresses |
| Métriques | Collecteur explicitement autorisé | Endpoint réellement configuré ; pare-feu, et TLS si exposé sur le réseau |
| Stockage de sauvegarde | Source de sauvegarde et opérateurs de reprise | Droits distincts, chiffrement, disponibilité hors cluster |

**mTLS** (*mutual Transport Layer Security*) : serveur **et** client présentent un certificat.

| Fichier | Identité |
|---|---|
| `server.crt` | Le serveur etcd |
| `peer.crt` | Les échanges entre membres |
| `apiserver-etcd-client.crt` | L'API Server, client d'etcd |
| `healthcheck-client.crt` | Le client local utilisé ici pour l'administration |

Les clés privées ne vont ni dans Git ni dans un ticket. Attention : dans une installation kubeadm habituelle, sans RBAC etcd dédié, **posséder un certificat client accepté donne des pouvoirs très étendus**, et le RBAC Kubernetes ne filtre pas une connexion directe à etcd. Voir [la sécurité du transport etcd](https://etcd.io/docs/v3.6/op-guide/security/).

<a id="etcd-preuves"></a>

### 19.5 Préparer les outils et recueillir des preuves

**Où :** shell Bash **root** de chaque control plane du laboratoire kubeadm, après copie du dossier associé dans `/root/refonte-kubernetes-etcd`. Les dépendances s'installent **dans les VM**, pas sur Windows.

```bash title="Chaque control plane · root"
cd /root/refonte-kubernetes-etcd
apt-get update
apt-get install -y ca-certificates curl jq age python3-yaml
bash scripts-etcd/install-tools.sh
source scripts-etcd/etcd-env.sh
etcdctl version
etcdutl version
kubeadm version -o short
crictl info >/dev/null
etcdctl --write-out=table endpoint status
etcdctl --write-out=table member list
etcdctl endpoint health --cluster
etcdctl alarm list
```

**Ce que fait `install-tools.sh` :** il fixe la version `3.6.6`, récupère le SHA-256 publié dans les métadonnées de l'asset GitHub officiel, le compare **avant** extraction et n'installe que les deux clients. Si l'asset n'expose pas d'empreinte, il s'arrête : trouvez alors une empreinte publiée vérifiable selon la politique de votre organisation. Ce contrôle utilise le même fournisseur que le téléchargement : il ne remplace pas une vérification indépendante de provenance. Conservez le JSON de publication et la liste des paquets installés avec les preuves. Source : [publication officielle etcd 3.6.6](https://github.com/etcd-io/etcd/releases/tag/v3.6.6).

| Outil | Usage |
|---|---|
| `etcdctl` | Dialogue avec un serveur etcd vivant |
| `etcdutl` | Travaille hors ligne sur les fichiers : snapshot, restauration |

N'utilisez pas l'ancienne forme `etcdctl snapshot restore`. `ETCDCTL_API=3` n'est plus nécessaire ; `etcd-env.sh` configure explicitement endpoints, certificats et délais.

| Commande | Ce qu'elle montre |
|---|---|
| `member list` | Identité, URLs et statut *learner* de chaque membre |
| `endpoint status` | Version, ID, leader et compteurs Raft |
| `endpoint health` | Qu'une requête de santé aboutit |
| `alarm list` | Les alarmes, notamment de quota (`NOSPACE`) |

**Résultat attendu (HA saine) :** trois membres `started`, un leader commun, trois endpoints `is healthy`, aucune alarme. Un test ponctuel ne prouve ni la santé du disque demain, ni la capacité à reprendre. Les IDs et révisions doivent venir de **votre** sortie. Référence : [etcdctl 3.6.6](https://raw.githubusercontent.com/etcd-io/etcd/v3.6.6/etcdctl/README.md).

**Avant toute correction, conservez les preuves :**

```bash title="Control plane concerné · root"
umask 077
EVIDENCE="/root/etcd-evidence-$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -m 0700 "$EVIDENCE"
etcdctl --write-out=json endpoint status --cluster > "$EVIDENCE/status.json" 2>&1 || true
etcdctl --write-out=json member list > "$EVIDENCE/members.json" 2>&1 || true
etcdctl alarm list > "$EVIDENCE/alarms.txt" 2>&1 || true
crictl ps -a > "$EVIDENCE/containers.txt"
ETCD_ID=$(crictl ps --name etcd -q | head -n 1)
if [[ -n $ETCD_ID ]]; then crictl logs "$ETCD_ID" > "$EVIDENCE/etcd.log" 2>&1; fi
journalctl -u kubelet --since '-30 min' > "$EVIDENCE/kubelet.log"
df -h /var/lib/etcd > "$EVIDENCE/space.txt"
df -i /var/lib/etcd > "$EVIDENCE/inodes.txt"
cp /etc/kubernetes/manifests/etcd.yaml "$EVIDENCE/etcd.yaml"
```

Les `|| true` conservent les **erreurs** de diagnostic dans les fichiers au lieu d'interrompre la collecte. Ne les recopiez jamais dans une sauvegarde ou une restauration, dont l'échec doit arrêter le script. Ces preuves sont sensibles même sans clé privée : noms d'objets, réseaux et erreurs révèlent l'architecture.

<a id="etcd-sauvegarde"></a>

### 19.6 Sauvegarder : fichier valide, copie disponible, restauration prouvée

| Objectif | Définition |
|---|---|
| **RPO** (*Recovery Point Objective*) | Perte de données maximale visée, exprimée en durée |
| **RTO** (*Recovery Time Objective*) | Délai visé pour rendre le service de nouveau utilisable |

Une sauvegarde horaire ne garantit pas un RPO d'une heure si le dernier transfert échoue depuis trois jours.

**Politique pédagogique proposée (à adapter) :** un snapshot par heure ; 48 points horaires, 14 quotidiens, 8 hebdomadaires ; au moins une copie indépendante avec rétention immuable et un compte de suppression distinct.

**Le stockage de sauvegarde** du laboratoire est un montage **hors cluster** `/mnt/etcd-backups`, disponible même si toutes les VM Kubernetes sont arrêtées. Sa mise en place dépend de votre infrastructure : **ne créez pas un simple dossier de ce nom en pensant obtenir une sauvegarde externe**. Identifiez l'hôte de stockage, son système de fichiers, ses droits et sa capacité avec `findmnt /mnt/etcd-backups`. Une VM de stockage hébergée sur le même disque physique ne protège pas contre la perte de ce disque.

**Pourquoi `etcdctl snapshot save` ?** Un snapshot cohérent s'obtient depuis **un seul** endpoint vivant : inutile de copier le fichier de chaque membre. Une copie brute de `member/snap/db` à chaud peut omettre des écritures encore dans le **WAL** (*Write-Ahead Log*). `snapshot status` donne révision, empreinte et taille ; seule une **restauration isolée** prouve la récupérabilité. Voir [la sauvegarde et la reprise etcd](https://etcd.io/docs/v3.6/op-guide/recovery/).

**Étape 1 — Créer la clé de chiffrement `age`, hors cluster.**

```bash title="Poste d'administration Linux sécurisé · hors cluster"
umask 077
mkdir -p "$HOME/etcd-recovery-keys"
age-keygen -o "$HOME/etcd-recovery-keys/identity.txt"
age-keygen -y "$HOME/etcd-recovery-keys/identity.txt" > "$HOME/etcd-recovery-keys/recipients.txt"
```

Conservez la clé privée (`identity.txt`) dans le coffre de reprise et vérifiez qu'un **second opérateur** autorisé peut y accéder. Copiez **uniquement** `recipients.txt` (clé publique) vers `/root/etcd-backup-recipients.txt` sur cp1. La disponibilité de la clé de déchiffrement fait partie du RTO.

**Étape 2 — Déclencher une sauvegarde.**

```bash title="cp1 · root"
cd /root/refonte-kubernetes-etcd
findmnt /mnt/etcd-backups
BACKUP_MOUNT=/mnt/etcd-backups \
AGE_RECIPIENT_FILE=/root/etcd-backup-recipients.txt \
  bash scripts-etcd/backup-etcd.sh
```

**Ce que fait `backup-etcd.sh` :**

1. il verrouille les exécutions concurrentes et refuse un montage absent ;
2. il prend le snapshot et produit ses métadonnées ;
3. il chiffre une archive, puis la publie de façon atomique ;
4. il ne supprime **aucune** ancienne sauvegarde : la rétention est une tâche séparée, après confirmation de la nouvelle copie.

Le snapshot en clair n'existe que temporairement dans un dossier root ; le supprimer ne garantit pas son effacement physique sur SSD (un volume temporaire chiffré renforce la protection). La copie immuable doit être réalisée et prouvée par le stockage retenu : le script ne la simule pas.

**Étape 3 — Automatiser**, après un premier succès manuel, avec ce fichier `/etc/cron.d/etcd-backup` sur cp1 :

```text title="/etc/cron.d/etcd-backup (cp1)"
17 * * * * root BACKUP_MOUNT=/mnt/etcd-backups AGE_RECIPIENT_FILE=/root/etcd-backup-recipients.txt /bin/bash /root/refonte-kubernetes-etcd/scripts-etcd/backup-etcd.sh >>/var/log/etcd-backup.log 2>&1
```

Fichier en `root:root`, mode `0644`, avec rotation du journal. Surveillez le **dernier succès vérifié**, pas la seule présence du cron. Seuil initial proposé : alerte si aucune sauvegarde complète depuis 90 minutes (choix pédagogique pour une fréquence horaire).

**Étape 4 — Vérifier une sauvegarde** sur une **machine de reprise Linux isolée**, avec `age` et `etcdutl` 3.6.6. `BACKUP_DIR` (dossier complet sauvegardé) et `AGE_IDENTITY` sont des paramètres de votre environnement :

```bash title="Machine de reprise isolée"
: "${BACKUP_DIR:?Chemin du dossier de sauvegarde sélectionné}"
: "${AGE_IDENTITY:?Chemin de la clé age autorisée}"
umask 077
RECOVER=$(mktemp -d /var/tmp/etcd-verify.XXXXXXXX)
(cd "$BACKUP_DIR" && sha256sum --check --strict SHA256SUMS)
age --decrypt --identity "$AGE_IDENTITY" "$BACKUP_DIR/backup.tar.age" \
  | tar -xf - -C "$RECOVER"
etcdutl --write-out=table snapshot status "$RECOVER/snapshot.db"
etcdutl snapshot restore "$RECOVER/snapshot.db" --data-dir "$RECOVER/restore-check" \
  --bump-revision 1000000000 --mark-compacted
printf 'Vérification hors ligne dans %s\n' "$RECOVER"
```

**Résultat attendu :** empreintes `OK`, tableau `snapshot status` (hash, révision, nombre de clés, taille), restauration hors ligne sans erreur.

**Précautions :** ne démarrez jamais ce répertoire sur le réseau du cluster d'origine ; n'extrayez pas en root une archive reçue d'un tiers ; après consignation, effacez le dossier temporaire affiché selon la politique de données sensibles. Ce test ne mesure pas encore le RTO Kubernetes et ne valide pas le contenu métier.

### 19.7 Certificats et disponibilité des moyens de reprise

```bash title="Chaque control plane · root"
kubeadm certs check-expiration
openssl x509 -in /etc/kubernetes/pki/etcd/server.crt -noout -subject -issuer -dates -ext subjectAltName
openssl x509 -in /etc/kubernetes/pki/etcd/peer.crt -noout -subject -issuer -dates -ext subjectAltName
openssl verify -CAfile /etc/kubernetes/pki/etcd/ca.crt /etc/kubernetes/pki/etcd/peer.crt
```

**Interpréter :** une chaîne valide ne suffit pas ; vérifiez aussi SAN, dates, horloge et rôles client/serveur. Un certificat expiré n'est **pas** une corruption de base : ne réinitialisez jamais les données pour corriger une identité TLS.

**Renouveler (CA locale kubeadm).** Après une sauvegarde chiffrée des fichiers et une vérification des dates, sur **un control plane à la fois** :

```bash title="Un control plane à la fois · root"
kubeadm certs renew etcd-server
kubeadm certs renew etcd-peer
kubeadm certs renew etcd-healthcheck-client
kubeadm certs renew apiserver-etcd-client
kubeadm certs check-expiration
```

Puis redémarrez les static Pods concernés : retirez leur manifeste du dossier surveillé, attendez l'arrêt constaté par `crictl`, remettez le manifeste, et recontrôlez etcd avant le nœud suivant. Avec un seul membre, l'interruption est inévitable. `kubectl delete pod` **n'est pas** une méthode fiable pour redémarrer un static Pod. Une CA externe ou une rotation de CA ont leurs propres procédures. Référence : [gestion des certificats kubeadm](https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/).

**Le dossier de reprise** doit aussi conserver, chiffrés et accessibles hors cluster : configuration kubeadm, manifests des static Pods, PKI nécessaire, configuration de chiffrement de l'API et **clés historiques** encore utiles, sauvegardes applicatives, inventaire des versions. Un snapshot contenant des Secrets chiffrés ne contient pas les clés pour les lire. Testez la récupération de ces éléments **sans dépendre** d'un coffre (par exemple un Pod Vault) hébergé dans le cluster à restaurer.

<a id="etcd-maintenance"></a>

### 19.8 Disques, compaction, défragmentation et alertes

etcd attend une **persistance rapide** de son journal. La capacité libre ne mesure pas la latence des synchronisations disque. Surveillez capacité, inodes, erreurs du système de fichiers, latence, files d'attente, contention CPU et échanges entre membres. Un disque dédié, ou bien isolé, évite qu'une collecte de logs monopolise le stockage du consensus. Les [recommandations matérielles etcd](https://etcd.io/docs/v3.6/op-guide/hardware/) sont des repères à confronter à votre charge.

| Opération | Effet | À savoir |
|---|---|---|
| **Compaction** | Supprime l'accès aux anciennes révisions ; l'espace devient réutilisable **dans** la base | L'API Server compacte déjà périodiquement (`--etcd-compaction-interval`) |
| **Défragmentation** | Réorganise la base d'un membre et rend l'espace au système de fichiers | Bloque lectures et écritures **de ce membre** pendant l'opération |
| **Snapshot** | Produit une copie de reprise | Ne libère aucun espace |

Inspectez la configuration de l'API Server avant d'ajouter une seconde politique de compaction. Une rétention d'historique trop courte force les clients lents à refaire des listes complètes. Ne « compactez pas toutes les semaines » sans préciser la fenêtre historique, le rythme d'écriture et le besoin des watches. Voir la [référence de l'API Server](https://kubernetes.io/docs/reference/command-line-tools-reference/kube-apiserver/) et [la maintenance etcd](https://etcd.io/docs/v3.6/op-guide/maintenance/).

**Atelier de maintenance — prérequis :** laboratoire **HA sain**, sauvegarde réussie, fenêtre annoncée ; jamais pendant qu'un autre membre est indisponible.

**Étape 1 — Compacter** en gardant 10 000 révisions (valeur d'exercice, sans conversion artificielle en heures) :

```bash title="cp1 · root"
source /root/refonte-kubernetes-etcd/scripts-etcd/etcd-env.sh
etcdctl endpoint health --cluster
etcdctl --write-out=table endpoint status --cluster
REV=$(etcdctl --write-out=json endpoint status | jq -er '.[0].Status.header.revision')
KEEP=10000
if (( REV > KEEP )); then
  etcdctl compact "$((REV - KEEP))"
fi
```

**Étape 2 — Défragmenter un follower.** Relevez le leader dans `endpoint status`, puis choisissez **un follower**. `FOLLOWER_ENDPOINT` doit être son URL exacte ; la commande refuse une valeur absente :

```bash title="cp1 · root"
: "${FOLLOWER_ENDPOINT:?URL du follower choisi après endpoint status}"
ETCDCTL_COMMAND_TIMEOUT=5m etcdctl --endpoints="$FOLLOWER_ENDPOINT" defrag
etcdctl endpoint health --cluster
etcdctl --write-out=table endpoint status --cluster
```

**Étape 3 — Continuer séquentiellement :** l'autre follower après rétablissement, puis le leader dans la fenêtre prévue (éventuellement après un transfert de leadership planifié). Jamais de défragmentations concurrentes par SSH. Sur un membre unique, toute défragmentation en ligne suspend le service : mesurez cette interruption. Gardez assez d'espace temporaire et un snapshot récent ; un système de fichiers saturé demande d'abord de récupérer de la capacité **sans effacer les données d'etcd**.

**Résultat attendu :** après chaque étape, tous les endpoints sains, et la taille de la base (`DB SIZE`) du membre défragmenté réduite.

**Alarme `NOSPACE` — procédure :**

1. chercher la cause : révisions historiques, objets volumineux, fuite de ressources, quota trop faible, disque réellement plein ;
2. sauvegarder ;
3. corriger la source **via l'API Kubernetes** ;
4. compacter si pertinent, puis défragmenter séquentiellement ;
5. vérifier taille réelle et quota ;
6. seulement alors : `etcdctl alarm disarm`.

:::danger[Ne supprimez jamais de clés /registry à la main]
Supprimer des clés `/registry` pour « faire de la place » peut corrompre l'état logique de Kubernetes. Le quota n'est pas une réservation disque : l'augmenter sans capacité ni analyse masque le problème.
:::

**Alertes.** La FAQ propose des repères : p99 des synchronisations WAL < 10 ms et p99 des commits backend < 25 ms. Ce ne sont pas des objectifs universels. Les durées d'alerte du laboratoire sont des **points de départ** à ajuster après observation ; la [FAQ de performance](https://etcd.io/docs/v3.6/faq/) et les [métriques officielles](https://etcd.io/docs/v3.6/metrics/) justifient noms et repères.

Le fichier `scripts-etcd/etcd-alerts.yaml` contient les règles complètes et suppose que Prometheus collecte chaque membre avec `job="etcd"`. Le kubeadm du laboratoire peut exposer les métriques **uniquement sur l'interface loopback** : un Prometheus central n'y accède pas. Prévoyez un collecteur local autorisé, ou une exposition dédiée protégée — jamais un port non authentifié ouvert sur toutes les interfaces pour faire taire l'erreur de collecte. Vérifiez `/targets`, la présence des métriques, puis `promtool check rules scripts-etcd/etcd-alerts.yaml`. Un fichier de règles n'installe ni le collecteur ni l'envoi des notifications. Voir [la surveillance d'etcd](https://etcd.io/docs/v3.6/op-guide/monitoring/).

<a id="etcd-membre-perdu"></a>

### 19.9 Un membre perdu, quorum encore disponible

| Étape | Contenu |
|---|---|
| **Symptôme** | Un endpoint ne répond plus ; les deux autres répondent |
| **Analogie** | Un greffier est absent, mais deux copies du registre restent joignables |
| **Causes possibles** | Panne temporaire, disque détruit, certificat expiré, réseau, saturation |
| **Preuves** | `member list`, santé des deux autres, logs, métriques disque, TLS du membre défaillant |
| **Correction minimale** | Réparer le réseau ou le certificat, ou redémarrer **le même** membre avec **son répertoire intact** s'il n'est pas corrompu : il rattrape le journal |

**Ne retirez pas un membre à chaque délai dépassé.** Une suppression est un changement de composition (*membership*) engagé par le quorum ; un membre supprimé ne doit **jamais** revenir avec son ancien répertoire. Si le disque est définitivement perdu : isolez l'ancien hôte, notez son ID depuis `member list`, préservez les preuves et préparez le remplacement. Les changements se font **un par un**. Les [reconfigurations etcd](https://etcd.io/docs/v3.6/op-guide/runtime-configuration/) et le [mécanisme learner](https://etcd.io/docs/v3.6/learning/design-learner/) expliquent pourquoi ajouter directement un votant indisponible peut compromettre la majorité.

**Remplacer cp3 perdu** (topologie empilée kubeadm, extension HA uniquement). On remplace par un **nouveau control plane reconstruit**, plutôt qu'en mélangeant un `member add` manuel et `kubeadm join`.

1. **Sur cp1 :** obtenir un snapshot récent et prouver que cp1 et cp2 sont sains. Retirer cp3 du répartiteur API et l'éteindre ou l'isoler hors bande : son retour spontané ne doit pas créer de concurrence.
2. **Sur cp1 :** recopier l'ID hexadécimal de cp3 depuis `etcdctl --write-out=table member list`, en vérifiant le nom **et** la peer URL. Retirer uniquement cet ID :

```bash title="cp1 · root (après identification et isolation de cp3)"
source /root/refonte-kubernetes-etcd/scripts-etcd/etcd-env.sh
: "${FAILED_MEMBER_ID:?ID hexadécimal de cp3 vérifié dans member list}"
etcdctl member remove "$FAILED_MEMBER_ID"
etcdctl --write-out=table member list
etcdctl endpoint health --cluster
```

3. **Depuis le poste (contexte kubeadm) :** après conservation de son diagnostic, supprimer l'ancien objet Node : `kubectl delete node cp3`. Reconstruire sa VM selon le chapitre 3, avec `192.168.56.13`, le nom `cp3`, et **sans réutiliser l'ancien `/var/lib/etcd`** (l'ancien disque reste isolé pour expertise).
4. **Sur cp1 :** `kubeadm init phase upload-certs --upload-certs`, puis `kubeadm token create --print-join-command`. Ces sorties sont des **secrets temporaires** : transmettez-les au seul opérateur autorisé, jamais dans Git. Complétez la commande générée avec `--control-plane --certificate-key` et la clé affichée, puis exécutez-la sur le nouveau cp3.
5. **Vérifier :** `member list`, `endpoint health --cluster`, `kubectl get nodes -o wide` et l'état des static Pods. cp3 doit avoir une **nouvelle identité etcd**, les adresses attendues, et aucun *learner* oublié. Réintégrez son API dans le répartiteur seulement quand elle est prête.

**Si le retrait ou la jonction échoue,** conservez les deux membres sains et n'en redémarrez aucun pendant le remplacement : le cluster ne tolère plus de nouvelle panne. Si l'ancien cp3 était en réalité sain, ne le reconnectez pas avec son répertoire après sa suppression : reconstruisez-le. Pour un etcd **externe**, suivez une procédure dédiée : `member add --learner`, démarrage avec la configuration retournée, synchronisation, puis `member promote`.

### 19.10 Quorum perdu : décider avant de restaurer

**Commencez par réparer.** Un seul endpoint sain sur trois ne peut pas autoriser le retrait des deux autres. Réparez l'infrastructure pour retrouver deux membres **originaux cohérents** si c'est encore possible : une panne réseau n'est pas une perte définitive des données. Gelez les changements, sauvegardez les logs et annoncez l'indisponibilité du control plane.

**Si les autres membres sont définitivement perdus,** choisissez un snapshot validé et une topologie cible. Restaurer un snapshot crée un **nouveau cluster logique** :

- les IDs du cluster et des membres changent ;
- tous les membres restaurés partent du **même fichier snapshot**, du même ensemble de pairs et du même jeton de restauration ;
- aucun ancien membre ne doit démarrer sur son ancien répertoire pendant l'opération.

Le raccourci `--force-new-cluster` n'est pas retenu : utilisé avec d'anciens membres vivants, il présente un risque explicite selon [la documentation de reprise](https://etcd.io/docs/v3.6/op-guide/recovery/).

**Révisions et caches.** Un snapshot peut être plus ancien que la dernière révision connue d'un contrôleur ; après restauration, son cache pourrait croire n'avoir rien manqué. Deux options traitent ce risque, et le guide les utilise **ensemble** :

| Option | Effet |
|---|---|
| `--bump-revision` | Avance la révision logique au-delà de toute révision déjà vue |
| `--mark-compacted` | Invalide l'historique restauré : les watches concernées se resynchronisent |

Elles ne recréent pas les données écrites après le snapshot. Le laboratoire utilise un saut de `1 000 000 000`, à condition que la croissance depuis le snapshot soit inférieure. Calculez une borne prudente — `débit maximal de révisions/s × âge maximal en secondes + marge` — et documentez la mesure. Elles ne dispensent pas d'arrêter puis de redémarrer les consommateurs Kubernetes et de vérifier leur réconciliation.

<a id="etcd-restauration"></a>

### 19.11 Restaurer kubeadm : procédures à un et à trois membres

:::danger[Laboratoire de reprise uniquement]
Cette opération arrête tous les control planes concernés et remplace leur état Kubernetes par celui du snapshot. Les écritures postérieures peuvent être perdues ; les données des volumes ne reviennent pas dans le temps. Réservez-la aux VM identifiées, avec accès console hors API et sauvegardes des données métier. Aucun `kubeadm reset` ni effacement de disque n'est nécessaire.
:::

**Hypothèses obligatoires :** noms et IP inchangés ; `/var/lib/etcd` monté directement dans le static Pod ; pas de WAL séparé, ni de lien symbolique ou de montage dédié sur ce répertoire ; fichiers kubeadm conservés ; PKI et clés de chiffrement disponibles ; snapshot de la branche etcd 3.6 vérifié, outils 3.6.6. Une migration de PKI ou d'adresses est un autre chantier. Les scripts refusent certains écarts, mais une assertion réussie ne remplace pas la compréhension de ces hypothèses.

**Vue d'ensemble :**

| Étape | Où | Action | Barrière avant l'étape suivante |
|---|---|---|---|
| A | Machine sûre, puis chaque cible | Préparer le même `snapshot.db` partout ; asserter le manifeste | Empreintes identiques sur tous les hôtes |
| B | Chaque cible | Définir les variables de la topologie (1 **ou** 3 membres) | Mêmes `INITIAL_CLUSTER`, `RECOVERY_TOKEN`, `BUMP` partout |
| C | Chaque cible | Sortir les 4 manifests, constater l'arrêt des conteneurs | **HA : les trois hôtes confirment l'arrêt** |
| D | Chaque cible | Restaurer hors ligne vers un nouveau répertoire, puis basculer | Ancien répertoire conservé |
| E | Chaque cible | Aligner le manifeste etcd, démarrer etcd seul | N membres sains, un leader, aucune alarme |
| F | Chaque cible, puis poste | Redémarrer l'API et les contrôleurs, vérifier le service | Marqueur, Secret, DNS, volumes, transactions |

**Étape A — Préparer la reprise, avant l'arrêt.** Sur une machine sûre, déchiffrez l'archive comme au §19.6. Transférez **le même** `snapshot.db` vers `/root/etcd-restore-input/snapshot.db` sur chaque control plane cible via SSH vérifié : créez le dossier avec `install -d -m 0700 /root/etcd-restore-input` et utilisez un transfert réservé à root, ou à un opérateur pouvant faire `sudo install -m 0600`. Relevez `sha256sum` sur tous les hôtes et comparez. Transférer l'archive chiffrée et déchiffrer sur place évite d'exposer le snapshot sur le réseau ou le disque.

Avant l'arrêt, lancez l'assertion sur chaque cible, avec ses deux arguments exacts :

```bash title="cp1 · root (sur cp2/cp3 : leur nom et leur IP)"
cd /root/refonte-kubernetes-etcd
python3 scripts-etcd/assert-etcd-manifest.py cp1 192.168.56.11
etcdutl --write-out=table snapshot status /root/etcd-restore-input/snapshot.db
sha256sum /root/etcd-restore-input/snapshot.db
stat -c 'owner=%u:%g mode=%a' /var/lib/etcd
```

Choisissez un **`RUN_ID` identique partout** (par exemple `reprise-lab-01`) et ne le réutilisez pas pour un second essai. Les blocs suivants s'exécutent dans **le même shell Bash root** de chaque cible, pour conserver les variables ; après une nouvelle connexion, redéfinissez-les.

**Étape B — Choisir exactement la topologie.** Exécutez **un seul** des deux blocs.

```bash title="Variante UN membre · exclusivement sur cp1"
export RUN_ID=reprise-lab-01
export NODE_NAME=cp1 NODE_IP=192.168.56.11
export INITIAL_CLUSTER='cp1=https://192.168.56.11:2380'
export RECOVERY_TOKEN="k8s-lab-${RUN_ID}"
export BUMP=1000000000
```

```bash title="Variante TROIS membres · sur chacun des hôtes cp1, cp2 et cp3"
export RUN_ID=reprise-lab-01
export NODE_NAME="$(hostname -s)"
case "$NODE_NAME" in
  cp1) export NODE_IP=192.168.56.11 ;;
  cp2) export NODE_IP=192.168.56.12 ;;
  cp3) export NODE_IP=192.168.56.13 ;;
  *) printf 'Hôte non prévu : %s\n' "$NODE_NAME" >&2; exit 1 ;;
esac
export INITIAL_CLUSTER='cp1=https://192.168.56.11:2380,cp2=https://192.168.56.12:2380,cp3=https://192.168.56.13:2380'
export RECOVERY_TOKEN="k8s-lab-${RUN_ID}"
export BUMP=1000000000
```

**Étape C — Arrêter les consommateurs, puis etcd, sur toutes les cibles.** Ne déplacez pas tout le dossier `/etc/kubernetes/manifests` et n'y déposez pas de `.bak` : le kubelet pourrait interpréter des fichiers supplémentaires. Déplacez **les quatre fichiers nommés** vers un dossier extérieur, puis constatez l'arrêt :

```bash title="Chaque control plane cible · root (le kubelet reste en service)"
set -Eeuo pipefail
umask 077
[[ $RUN_ID =~ ^[A-Za-z0-9-]+$ ]]
[[ $(hostname -s) == "$NODE_NAME" ]]
ip -o -4 addr show | grep -F " ${NODE_IP}/" >/dev/null
[[ ! -L /var/lib/etcd && $(readlink -f /var/lib/etcd) == /var/lib/etcd ]]
if mountpoint -q /var/lib/etcd; then
  echo 'Répertoire monté séparément : procédure à adapter.' >&2; exit 1
fi
export RECOVERY_DIR="/root/etcd-recovery-${RUN_ID}"
[[ ! -e $RECOVERY_DIR ]]
mkdir -m 0700 "$RECOVERY_DIR"
mkdir -m 0700 "$RECOVERY_DIR/manifests"
stat -c '%u:%g' /var/lib/etcd > "$RECOVERY_DIR/data-owner.txt"
for component in kube-apiserver kube-controller-manager kube-scheduler etcd; do
  mv "/etc/kubernetes/manifests/${component}.yaml" "$RECOVERY_DIR/manifests/"
done
for attempt in {1..60}; do
  running=$(crictl ps -o json | jq '[.containers[] | select(.metadata.name | test("^(etcd|kube-apiserver|kube-controller-manager|kube-scheduler)$"))] | length')
  [[ $running == 0 ]] && break
  sleep 2
done
[[ $running == 0 ]] || { echo 'Conteneurs encore actifs : arrêter la procédure.' >&2; exit 1; }
```

**Ce que vérifie ce bloc avant d'agir :** un `RUN_ID` valide, le bon hostname, l'IP attendue sur l'hôte, un `/var/lib/etcd` qui n'est ni un lien ni un montage séparé, et un dossier de reprise neuf. Le propriétaire du répertoire est noté pour l'étape D.

:::caution[Barrière de coordination HA]
Ne continuez que lorsque **les trois hôtes** ont confirmé l'absence de ces conteneurs, et gardez les anciens membres hors du réseau. La boucle attend au plus environ deux minutes ; sa réussite repose sur l'observation des conteneurs, pas sur un délai supposé.
:::

**Étape D — Restaurer hors ligne, une identité par hôte.** `INITIAL_CLUSTER`, `RECOVERY_TOKEN`, `BUMP` et l'empreinte du snapshot sont identiques entre membres ; `NODE_NAME` et `NODE_IP` sont propres à chacun.

```bash title="Chaque control plane cible · root, après la barrière précédente"
export STAGED_DIR="/var/lib/etcd-restored-${RUN_ID}"
[[ ! -e $STAGED_DIR && ! -e /var/lib/etcd-before-${RUN_ID} ]]
etcdutl snapshot restore /root/etcd-restore-input/snapshot.db \
  --name "$NODE_NAME" \
  --data-dir "$STAGED_DIR" \
  --initial-cluster "$INITIAL_CLUSTER" \
  --initial-cluster-token "$RECOVERY_TOKEN" \
  --initial-advertise-peer-urls "https://${NODE_IP}:2380" \
  --bump-revision "$BUMP" \
  --mark-compacted
chown -R "$(cat "$RECOVERY_DIR/data-owner.txt")" "$STAGED_DIR"
chmod 0700 "$STAGED_DIR"
mv /var/lib/etcd "/var/lib/etcd-before-${RUN_ID}"
mv "$STAGED_DIR" /var/lib/etcd
```

La restauration vérifie le hash du snapshot produit par `snapshot save` : ne contournez jamais une erreur avec `--skip-hash-check`. L'ancien répertoire est **conservé** sous `/var/lib/etcd-before-RUN_ID`. Aucun compte Unix `etcd` n'est supposé : le propriétaire est celui observé avant l'arrêt. SELinux, ACL ou durcissements additionnels demandent leurs propres contrôles ; la procédure cible un Ubuntu standard.

**Étape E — Aligner le manifeste conservé, puis démarrer etcd seul.** La restauration a déjà inscrit la composition du cluster dans les données ; aligner les options de démarrage rend la configuration lisible et évite de garder une liste incomplète de pairs. Le script ne modifie **que deux options** du conteneur etcd ; ports, certificats, montages et probes kubeadm restent ceux vérifiés à l'étape A.

```bash title="Chaque control plane cible · root"
python3 - <<'PY'
import os, pathlib, yaml
p = pathlib.Path(os.environ['RECOVERY_DIR']) / 'manifests' / 'etcd.yaml'
doc = yaml.safe_load(p.read_text())
c = doc['spec']['containers'][0]
updates = {
    '--initial-cluster': os.environ['INITIAL_CLUSTER'],
    '--initial-cluster-token': os.environ['RECOVERY_TOKEN'],
}
for field in ('command', 'args'):
    if field in c:
        c[field] = [a for a in c[field] if a.split('=', 1)[0] not in updates]
c.setdefault('command', []).extend(f'{k}={v}' for k, v in updates.items())
p.write_text(yaml.safe_dump(doc, sort_keys=False))
PY
mv "$RECOVERY_DIR/manifests/etcd.yaml" /etc/kubernetes/manifests/etcd.yaml
source /root/refonte-kubernetes-etcd/scripts-etcd/etcd-env.sh
```

En HA, démarrez les **trois** membres dans cette phase : n'attendez pas que cp1 seul obtienne une majorité (impossible). Dès que deux membres restaurés communiquent, les contrôles progressent. Avec un seul membre, cp1 est son propre quorum.

```bash title="Chaque cible · root (répéter après le démarrage des autres cibles HA)"
crictl ps --name etcd
etcdctl --write-out=table member list
etcdctl --write-out=table endpoint status --cluster
etcdctl endpoint health --cluster
etcdctl alarm list
```

**Résultat attendu :** les **N membres attendus**, tous sains, un leader commun, aucun learner imprévu, aucune alarme, et une révision au moins égale à celle du snapshot **plus le bump**. Les IDs diffèrent des anciens : comparez la nouvelle composition à l'inventaire.

| Symptôme | Piste |
|---|---|
| Erreur TLS | Certificats et horloges |
| *cluster ID mismatch* | Un ancien membre encore présent, ou des paramètres/snapshots différents entre hôtes |

Ne démarrez pas les API Servers tant que ces points ne sont pas expliqués.

**Étape F — Redémarrer les consommateurs, puis vérifier le service.** Sur chaque cible :

```bash title="Chaque control plane cible · root"
for component in kube-apiserver kube-controller-manager kube-scheduler; do
  mv "$RECOVERY_DIR/manifests/${component}.yaml" /etc/kubernetes/manifests/
done
```

Puis, après reconnexion à l'API :

```bash title="Poste d'administration · contexte kubeadm"
kubectl config current-context
kubectl get --raw='/readyz?verbose'
kubectl get nodes -o wide
kubectl get pods -A -o wide
kubectl get events -A --sort-by=.metadata.creationTimestamp
kubectl -n reprise-lab get configmap marqueur -o yaml
```

**Vérifier au-delà de l'API :** le marqueur de l'atelier (§19.12), la lecture d'un Secret de test autorisé (déchiffrement), DNS, Services, volumes et transactions métier. Une API prête ne prouve pas une base applicative cohérente. Les contrôleurs peuvent supprimer ou recréer des objets parce que l'état restauré diffère de la réalité des nœuds : observez les événements avant de corriger.

<details>
<summary>Échec : revenir à une situation maîtrisée</summary>

**Tant que les API Servers n'ont pas repris les écritures,** un essai peut être annulé :

1. retirer les manifests etcd restaurés et constater l'arrêt sur **toutes** les cibles ;
2. conserver les répertoires restaurés sous un nouveau nom, pour expertise ;
3. remettre l'**ensemble cohérent** des anciens répertoires et manifests — seulement si l'ancien cluster peut retrouver son quorum.

Ne mélangez **jamais** un ancien répertoire et deux répertoires restaurés. Si l'ancien quorum était définitivement perdu, revenir à ces répertoires ne rend pas le service : conservez les preuves et recommencez la restauration avec un autre `RUN_ID` après correction.

**Après la reprise des écritures,** tout retour à un ancien état est **une nouvelle reprise avec perte potentielle**, pas un rollback transparent. Des snapshots des VM arrêtées, pris avant l'atelier et cohérents pour toutes les VM, offrent un retour de laboratoire indépendant.

</details>

### 19.12 Atelier de reprise mesurée et exercices corrigés

**Objectif :** démontrer qu'un objet présent au snapshot revient, qu'une modification postérieure est perdue, que les watches se resynchronisent et que l'application réelle fonctionne.

**Environnement :** kubeadm à un membre, puis extension à trois membres ; accès console, stockage hors cluster et clé de déchiffrement vérifiés. **Contraintes :** aucun effacement manuel de `/registry`, aucun `--force-new-cluster`, aucun mélange de snapshots. Préservez inventaire et logs avant l'injection.

**Énoncé.**

1. Créez un namespace `reprise-lab` et un ConfigMap `marqueur` avec `phase=avant`.
2. Sauvegardez.
3. Modifiez `phase=apres` ; notez l'heure UTC et la révision observée.
4. Simulez une perte définitive de quorum en retirant les manifests etcd du laboratoire, puis restaurez le snapshot choisi avec la topologie initiale.
5. Vérifiez la valeur du marqueur, les membres, les révisions, l'API et une application avec volume.
6. Mesurez le délai entre la déclaration de l'incident et la vérification applicative ; nettoyez le namespace après conservation des preuves.
7. En HA, réalisez séparément une panne **temporaire** d'un seul membre, pour comparer rattrapage et restauration.

**Indices progressifs.** 1 : commencez par `member list` et une vérification de sauvegarde hors ligne. 2 : le snapshot ne contient pas les changements faits après sa création. 3 : suivez les étapes A à F avec un `RUN_ID` commun et une barrière après l'arrêt. 4 : ne confondez pas révision avancée artificiellement et données récupérées.

<details>
<summary>Correction expliquée — à ouvrir après l'essai</summary>

**Poste d'administration, contexte kubeadm :**

```bash title="Poste d'administration · contexte kubeadm"
kubectl create namespace reprise-lab
kubectl -n reprise-lab create configmap marqueur --from-literal=phase=avant
date -u +%FT%TZ
kubectl -n reprise-lab get configmap marqueur -o yaml
```

Prenez la sauvegarde du §19.6 depuis cp1 ; relevez son dossier exact, son heure et sa révision. Puis, depuis le poste :

```bash title="Poste d'administration · contexte kubeadm"
kubectl -n reprise-lab patch configmap marqueur --type merge -p '{"data":{"phase":"apres"}}'
date -u +%FT%TZ
kubectl -n reprise-lab get configmap marqueur -o jsonpath='{.data.phase}{"\n"}'
```

Après sauvegarde des preuves, exécutez les étapes A à F (elles isolent et remplacent les données sans les effacer). Le résultat **attendu, non observé lors de la rédaction**, est `phase=avant` après restauration. Vérifiez ensuite qu'une nouvelle écriture API fonctionne :

```bash title="Poste d'administration · contexte kubeadm"
kubectl -n reprise-lab patch configmap marqueur --type merge -p '{"data":{"phase":"reprise-verifiee"}}'
kubectl -n reprise-lab get configmap marqueur -o jsonpath='{.data.phase}{"\n"}'
kubectl delete namespace reprise-lab
```

**Panne d'un seul membre HA :** déplacez uniquement le manifeste etcd de cp3 vers un dossier de maintenance extérieur, constatez deux membres sains et la continuité des changements API, puis remettez le manifeste **sans changer son répertoire** et vérifiez le rattrapage. Cette procédure réversible ne détruit aucun disque : elle ne démontre donc pas le remplacement d'un membre définitivement perdu.

</details>

| Champ du compte rendu | Objectif pédagogique | Résultat de cette rédaction |
|---|---|---|
| RPO visé | ≤ 1 h si chaque sauvegarde horaire est complète et récupérable | Non mesuré ; dépend des transferts et des échecs |
| RTO visé, un membre | ≤ 30 min, accès, versions et clé déjà prêts | Non mesuré ; objectif, aucune garantie |
| RTO visé, HA | ≤ 60 min, coordination des trois hôtes incluse | Non mesuré ; objectif, aucune garantie |
| Début de l'incident / fin de vérification | Horodatages UTC et durée réelle | À renseigner au laboratoire |
| Données perdues | Identifier précisément les changements après le snapshot | Marqueur `apres` attendu perdu ; données métier à tester |
| État de sécurité | TLS, Secrets déchiffrables, clés accessibles hors cluster | Non testé en exécution |
| Reproductibilité | Versions, SHA du snapshot, composition, commandes, erreurs | Procédure documentée ; exécution à consigner |

**Questions de compréhension :** pourquoi deux membres ne tolèrent-ils aucune panne ? Pourquoi une lecture locale ne prouve-t-elle pas le quorum ? Quelle différence entre réparer un membre intact et restaurer tous les membres ? Pourquoi le *revision bump* ne réduit-il pas le RPO ? Pourquoi un snapshot peut-il être lisible et pourtant inutilisable pour reprendre l'application ?

**Pour aller plus loin :** restauration sur un réseau isolé avec identités et adresses nouvelles, perte d'une zone physique, vérification automatisée des sauvegardes sans exposer la clé de déchiffrement à la source, audit des temps et responsabilités par un second opérateur. Ce sont des approfondissements d'exploitation, pas une promesse de sujets d'examen.

### 19.13 Références et limite de validation

Les liens sont associés aux sections pour distinguer les règles des projets et les choix du laboratoire. Références principales versionnées : [etcd 3.6 — reprise](https://etcd.io/docs/v3.6/op-guide/recovery/), [maintenance](https://etcd.io/docs/v3.6/op-guide/maintenance/), [reconfiguration](https://etcd.io/docs/v3.6/op-guide/runtime-configuration/), [configuration](https://etcd.io/docs/v3.6/op-guide/configuration/), [transport TLS](https://etcd.io/docs/v3.6/op-guide/security/), [garanties API](https://etcd.io/docs/v3.6/learning/api_guarantees/). Pour Kubernetes : [topologie kubeadm](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/ha-topology/), [certificats](https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/) et [exploitation d'etcd dans Kubernetes 1.35](https://v1-35.docs.kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/). Vérification documentaire : 16 octobre 2026. Les pages non versionnées peuvent évoluer ; le tag du code kubeadm fixe le couplage exact retenu.

| Niveau | Ce qu'il signifie |
|---|---|
| **Relu** | Explication et cohérence des commandes vérifiées |
| **Validé statiquement** | Annoncé seulement pour les fichiers et outils cités dans le registre associé |
| **Testé en laboratoire** | Exige sorties, versions, horodatages, résultats et écarts du scénario exécuté — aucune ligne de ce chapitre ne remplace ces preuves |


<a id="chapitre-20"></a>

## 20. Reprise applicative : sauvegarder autre chose qu'etcd

**En bref.** Un snapshot etcd peut retrouver l'objet PVC d'une base sans retrouver **un seul octet** de ses tables. Une reprise complète inventorie donc les objets déclaratifs, les données des volumes et des services externes, les clés de chiffrement, les identités, les images et les dépendances.

### 20.1 Besoin, objectifs et périmètre

| Propriété | Ce qu'elle garantit |
|---|---|
| Persistance | La donnée survit au Pod |
| Réplication | La donnée est copiée ailleurs (erreurs comprises) |
| Sauvegarde | Un état **récupérable** existe après perte ou corruption |

Ces propriétés se testent séparément. Pour l'atelier ci-dessous, les objectifs pédagogiques sont **RPO ≤ 15 minutes** et **RTO ≤ 20 minutes** (RPO : perte de données maximale visée ; RTO : durée maximale de reprise visée). Inscrivez les mesures réellement obtenues, pas « atteint » par anticipation : une copie réussie ne vaut pas une restauration démontrée.

### 20.2 Atelier : un fichier persistant, une copie hors cluster

**Prérequis :** StatefulSet `registre` du chapitre 11 Ready dans kind ; image BusyBox verrouillée (avec `tar` et `sha256sum`) ; `age` installé **sur le poste d'administration** (paquet de votre distribution ou release officielle approuvée ; consignez `age --version`) ; espace libre et droits restreints. L'atelier illustre des **fichiers stables**, pas une sauvegarde cohérente d'une base en pleine transaction.

```bash title="Poste d'administration Linux/WSL2 · racine du dossier associé"
# Les commandes kubectl exec agissent uniquement sur registre-0 du laboratoire.
set -Eeuo pipefail
umask 077
mkdir -p .secrets sauvegardes-app validations/reprise-app
age --version
test -e .secrets/app-age.key || age-keygen -o .secrets/app-age.key
RECIPIENT=$(age-keygen -y .secrets/app-age.key)
kubectl --context kind-formation -n atelier exec registre-0 -- sh -c 'printf "version-avant\n" > /data/temoin'
kubectl --context kind-formation -n atelier exec registre-0 -- sha256sum /data/temoin > validations/reprise-app/temoin.sha256
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
ARCHIVE="$PWD/sauvegardes-app/registre-0-$STAMP.tar.age"
kubectl --context kind-formation -n atelier exec registre-0 -- tar -C /data -cf - . | age -r "$RECIPIENT" -o "$ARCHIVE"
sha256sum "$ARCHIVE" > "$ARCHIVE.sha256"
# Vérifier déchiffrement et contenu sans écrire de données déchiffrées sur le poste.
age -d -i .secrets/app-age.key "$ARCHIVE" | tar -tf - > validations/reprise-app/contenu.txt
sha256sum --check "$ARCHIVE.sha256"
```

**Ce qui se passe :** un fichier témoin `version-avant` est écrit et son empreinte notée ; le contenu de `/data` est archivé **en flux** (`tar` dans le Pod), chiffré par `age` à la volée, puis vérifié : liste du contenu après déchiffrement en mémoire, puis empreinte de l'archive.

**Résultat attendu :** `contenu.txt` liste `./temoin` et les autres fichiers ; `sha256sum --check` affiche `OK`.

**Limites de l'emplacement :** l'archive est sur le **poste**, hors du cluster kind — mais la perte du poste peut encore la détruire. Copiez le fichier chiffré et son empreinte vers un stockage distant dont le compte et la rétention sont séparés (le livrable n'invente pas de coffre distant). La clé `age` doit rester récupérable hors du cluster, **séparée** des archives : ne la placez pas dans le même bucket que les sauvegardes.

### 20.3 Restaurer et prouver le contenu

La manipulation suivante remplace les fichiers du **seul volume de `registre-0`** de ce laboratoire. Conservez l'archive précédente et vérifiez contexte, Pod et chemin ; aucun autre PVC ne doit être visé.

```bash title="Poste d'administration · même shell (ARCHIVE défini ci-dessus)"
# Injection réversible : modifier le témoin après sauvegarde.
kubectl --context kind-formation -n atelier exec registre-0 -- sh -c 'printf "version-apres\n" > /data/temoin'
date -u +%FT%TZ > validations/reprise-app/debut-restauration.txt
# Restauration destructive pour les fichiers de CE volume : archive vérifiée uniquement.
age -d -i .secrets/app-age.key "$ARCHIVE" | kubectl --context kind-formation -n atelier exec -i registre-0 -- tar -C /data -xf -
kubectl --context kind-formation -n atelier exec registre-0 -- sha256sum /data/temoin > validations/reprise-app/temoin-restaure.sha256
diff -u validations/reprise-app/temoin.sha256 validations/reprise-app/temoin-restaure.sha256
date -u +%FT%TZ > validations/reprise-app/fin-restauration.txt
kubectl --context kind-formation -n atelier exec registre-0 -- cat /data/temoin
```

**Résultat attendu :** `diff` n'affiche rien (empreintes identiques) et le témoin contient `version-avant`. Les deux horodatages donnent la durée de restauration.

:::caution[Limites de cette restauration]
`tar -x` superpose les fichiers mais **ne supprime pas** ceux ajoutés depuis la sauvegarde. Après une corruption, restaurez dans un **nouveau volume vide**, pas dans un volume encore servi en écriture. Pour une vraie base : outil de dump/backup compatible, mise en pause (*quiesce*) ou mécanisme cohérent, journaux de transactions pour une reprise à un instant précis, puis contrôle métier. Restaurez d'abord dans un environnement isolé avant d'y diriger les clients ; testez migrations, identifiants et clés.
:::

### 20.4 Rétention, intégrité et exercice périodique

**Exemple de départ :** 4 copies horaires, 7 journalières et 4 hebdomadaires, à adapter au RPO, au volume et à la menace.

**Que surveiller ?** L'âge du dernier fichier n'est pas l'âge de la dernière sauvegarde **restaurable**. Surveillez : absence de copie attendue, taille anormale, échec de déchiffrement et résultat des essais de restauration. Une empreinte détecte une altération, pas une suppression malveillante si le même compte peut effacer toutes les copies : prévoyez immuabilité/versioning et des permissions adaptées.

| Élément du compte rendu | À renseigner après exécution |
|---|---|
| Versions et commit | Cluster, outils, application, images, source Git |
| Copie de référence | Identifiant, date, emplacement hors cluster, empreinte |
| RPO observé | Dernière écriture restaurée et écritures absentes |
| RTO observé | Du début d'indisponibilité aux données et service vérifiés |
| Limites | Volume local, fichiers stables, pas de base transactionnelle dans ce test |
| Prévention | Fréquence, droits, rétention et prochain exercice décidés |

**Nettoyage :** conservez les preuves et la copie de référence selon la rétention ; supprimez témoins et PVC uniquement après l'exercice. Les archives étant chiffrées, **ne supprimez pas la clé** tant que des sauvegardes doivent rester lisibles. Pour un exercice complet, combinez et chronométrez la reprise etcd (chapitre 19) et la reprise applicative (chapitre 20).

**Sources :** [sauvegarde Kubernetes/etcd](https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/), [snapshots CSI](https://kubernetes.io/docs/concepts/storage/volume-snapshots/), [age](https://age-encryption.org/), [réplication applicative](https://kubernetes.io/docs/tasks/run-application/run-replicated-stateful-application/).

<a id="chapitre-21"></a>

## 21. Diagnostiquer : dix-sept scénarios expliqués

**En bref.** Chaque scénario suit la même progression : **symptôme → vérifications → interprétation → correction minimale → contrôle final**, puis prévention. Les injections sont réversibles et limitées au laboratoire `kind-formation`, namespace `atelier` ; les scénarios d'hôte précisent leur laboratoire kubeadm. Sources vérifiées le 16 octobre 2026 ; commandes et résultats attendus relus, sans exécution du laboratoire pendant cette refonte.

<a id="depannage-express"></a>

### Dépannage express : du symptôme au scénario

| Symptôme → scénario | Première vérification |
|---|---|
| [1 · Pod bloqué en `Pending`](#scenario-01) | `describe pod` : événement `FailedScheduling` |
| [2 · `CrashLoopBackOff`](#scenario-02) | `logs --previous`, `lastState` |
| [3 · `OOMKilled`, code 137](#scenario-03) | `lastState.terminated`, limites mémoire |
| [4 · `ErrImagePull` / `ImagePullBackOff`](#scenario-04) | Événements du Pod |
| [5 · Running mais pas Ready, événements `Unhealthy`](#scenario-05) | `describe pod`, EndpointSlices |
| [6 · `Forbidden`, `Permission denied`](#scenario-06) | `auth can-i`, `exec … id` |
| [7 · `Could not resolve host`](#scenario-07) | `curl` par nom complet, puis par IP |
| [8 · Le Pod répond, pas le Service](#scenario-08) | Selector et EndpointSlices |
| [9 · 404, 502, 503 à l'entrée HTTP](#scenario-09) | Port-forward du Service, statut des routes |
| [10 · Erreur de certificat](#scenario-10) | `openssl s_client`, `curl --cacert` |
| [11 · Flux bloqué à tort, ou pas bloqué](#scenario-11) | Politiques, test `client` / `interdit` |
| [12 · PVC `Pending`](#scenario-12) | `describe pvc`, `get storageclass` |
| [13 · `FailedMount`, `ContainerCreating` prolongé](#scenario-13) | `describe pod` |
| [14 · Nœud `NotReady`](#scenario-14) | `describe node`, Lease |
| [15 · Lenteur, évictions, `DiskPressure`](#scenario-15) | `top`, `describe node` |
| [16 · `kubectl` expire, connexion refusée](#scenario-16) | `/readyz`, `/livez` |
| [17 · Écritures lentes, `NOSPACE`, leader instable](#scenario-17) | `etcdctl endpoint status` |

<a id="methode-diagnostic"></a>

### 21.1 Une méthode qui conserve les preuves

<div class="not-content kd-figure" style="margin:1.5rem 0">
<svg xmlns="http://www.w3.org/2000/svg" class="kd" style="max-width:100%;height:auto;display:block" data-pagefind-ignore width="520" height="500" viewBox="0 0 520 500" role="img" aria-labelledby="kd46-t kd46-d">
<title id="kd46-t">Méthode de diagnostic en 5 temps</title>
<desc id="kd46-d">Cinq étapes : noter le symptôme (heure, contexte, périmètre, dernier changement) ; collecter events, logs et describe avant d'agir ; interpréter avec une hypothèse et deux preuves concordantes ; appliquer une correction minimale et réversible ; contrôler le service réel et conserver un test négatif. En cas d'échec, revenir aux vérifications avec une nouvelle hypothèse.</desc>
<style>
svg.kd text{font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;fill:#111827}
svg.kd .bg{fill:#f7f8fb;stroke:#d5dbe5;stroke-width:1.5}
svg.kd .ttl{font-size:19px;font-weight:700}
svg.kd .tb{font-size:17px;font-weight:700}
svg.kd .tb15{font-size:16px;font-weight:700}
svg.kd .t{font-size:16px}
svg.kd .s{font-size:15px;fill:#374151}
svg.kd .ok{fill:#166534;font-weight:700}
svg.kd .bad{fill:#b91c1c;font-weight:700}
svg.kd .k-blue{fill:#e8eefc;stroke:#2f5bd3}
svg.kd .k-teal{fill:#e1f3ef;stroke:#0f766e}
svg.kd .k-violet{fill:#efe9fd;stroke:#6d28d9}
svg.kd .k-amber{fill:#fdf3e1;stroke:#b45309}
svg.kd .k-red{fill:#fdeaea;stroke:#b91c1c}
svg.kd .k-green{fill:#e6f5ea;stroke:#15803d}
svg.kd .k-gray{fill:#ffffff;stroke:#8b97a8}
svg.kd .k-panel{fill:#eef1f6;stroke:#c3cbd8}
svg.kd .dash{stroke-dasharray:6 5}
svg.kd .ln{stroke:#4b5563;stroke-width:2;fill:none}
svg.kd .ln-ok{stroke:#15803d}
svg.kd .ln-bad{stroke:#b91c1c}
svg.kd .life{stroke:#8b97a8;stroke-width:1.5;stroke-dasharray:4 5;fill:none}
svg.kd .ah{fill:#4b5563}
svg.kd .ah-ok{fill:#15803d}
svg.kd .ah-bad{fill:#b91c1c}
svg.kd .bdg{fill:#2f5bd3}
svg.kd .bdg-t{fill:#ffffff;font-size:13px;font-weight:700}
:root[data-theme='dark'] svg.kd text{fill:#f3f4f6}
:root[data-theme='dark'] svg.kd .bg{fill:#111827;stroke:#374151}
:root[data-theme='dark'] svg.kd .s{fill:#d1d5db}
:root[data-theme='dark'] svg.kd .ok{fill:#86efac}
:root[data-theme='dark'] svg.kd .bad{fill:#fca5a5}
:root[data-theme='dark'] svg.kd .k-blue{fill:#1b2a4d;stroke:#8fb1ff}
:root[data-theme='dark'] svg.kd .k-teal{fill:#0f302c;stroke:#5eead4}
:root[data-theme='dark'] svg.kd .k-violet{fill:#2a1f4d;stroke:#c4b5fd}
:root[data-theme='dark'] svg.kd .k-amber{fill:#3a2a10;stroke:#fcd34d}
:root[data-theme='dark'] svg.kd .k-red{fill:#3d1717;stroke:#fca5a5}
:root[data-theme='dark'] svg.kd .k-green{fill:#12321d;stroke:#86efac}
:root[data-theme='dark'] svg.kd .k-gray{fill:#1f2937;stroke:#6b7280}
:root[data-theme='dark'] svg.kd .k-panel{fill:#172030;stroke:#334155}
:root[data-theme='dark'] svg.kd .ln{stroke:#cbd5e1}
:root[data-theme='dark'] svg.kd .ln-ok{stroke:#86efac}
:root[data-theme='dark'] svg.kd .ln-bad{stroke:#fca5a5}
:root[data-theme='dark'] svg.kd .life{stroke:#6b7280}
:root[data-theme='dark'] svg.kd .ah{fill:#cbd5e1}
:root[data-theme='dark'] svg.kd .ah-ok{fill:#86efac}
:root[data-theme='dark'] svg.kd .ah-bad{fill:#fca5a5}
:root[data-theme='dark'] svg.kd .bdg{fill:#8fb1ff}
:root[data-theme='dark'] svg.kd .bdg-t{fill:#0b1220}
@media (prefers-color-scheme:dark){
:root:not([data-theme]) svg.kd text{fill:#f3f4f6}
:root:not([data-theme]) svg.kd .bg{fill:#111827;stroke:#374151}
:root:not([data-theme]) svg.kd .s{fill:#d1d5db}
:root:not([data-theme]) svg.kd .ok{fill:#86efac}
:root:not([data-theme]) svg.kd .bad{fill:#fca5a5}
:root:not([data-theme]) svg.kd .k-blue{fill:#1b2a4d;stroke:#8fb1ff}
:root:not([data-theme]) svg.kd .k-teal{fill:#0f302c;stroke:#5eead4}
:root:not([data-theme]) svg.kd .k-violet{fill:#2a1f4d;stroke:#c4b5fd}
:root:not([data-theme]) svg.kd .k-amber{fill:#3a2a10;stroke:#fcd34d}
:root:not([data-theme]) svg.kd .k-red{fill:#3d1717;stroke:#fca5a5}
:root:not([data-theme]) svg.kd .k-green{fill:#12321d;stroke:#86efac}
:root:not([data-theme]) svg.kd .k-gray{fill:#1f2937;stroke:#6b7280}
:root:not([data-theme]) svg.kd .k-panel{fill:#172030;stroke:#334155}
:root:not([data-theme]) svg.kd .ln{stroke:#cbd5e1}
:root:not([data-theme]) svg.kd .ln-ok{stroke:#86efac}
:root:not([data-theme]) svg.kd .ln-bad{stroke:#fca5a5}
:root:not([data-theme]) svg.kd .life{stroke:#6b7280}
:root:not([data-theme]) svg.kd .ah{fill:#cbd5e1}
:root:not([data-theme]) svg.kd .ah-ok{fill:#86efac}
:root:not([data-theme]) svg.kd .ah-bad{fill:#fca5a5}
:root:not([data-theme]) svg.kd .bdg{fill:#8fb1ff}
:root:not([data-theme]) svg.kd .bdg-t{fill:#0b1220}
}
</style>
<defs>
<marker id="kd46-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah"/></marker>
<marker id="kd46-a-ok" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah-ok"/></marker>
<marker id="kd46-a-bad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ah-bad"/></marker>
</defs>
<rect x="1" y="1" width="518" height="498" rx="14" class="bg"/>
<text x="20" y="34" class="ttl">Méthode de diagnostic en 5 temps</text>
<rect x="20" y="56" width="410" height="60" rx="10" class="k-blue" stroke-width="1.6"/>
<circle cx="44" cy="86.0" r="11" class="bdg"/>
<text x="44" y="90.6" class="bdg-t" text-anchor="middle">1</text>
<text x="66" y="81.3" class="tb15" text-anchor="start">Symptôme</text>
<text x="66" y="100.6" class="s" text-anchor="start">heure, contexte, périmètre, changement</text>
<path d="M225,118 L225,132" class="ln" marker-end="url(#kd46-a)"/>
<rect x="20" y="134" width="410" height="60" rx="10" class="k-blue" stroke-width="1.6"/>
<circle cx="44" cy="164.0" r="11" class="bdg"/>
<text x="44" y="168.6" class="bdg-t" text-anchor="middle">2</text>
<text x="66" y="159.3" class="tb15" text-anchor="start">Vérifications</text>
<text x="66" y="178.6" class="s" text-anchor="start">events, logs, describe : avant d'agir</text>
<path d="M225,196 L225,210" class="ln" marker-end="url(#kd46-a)"/>
<rect x="20" y="212" width="410" height="60" rx="10" class="k-amber" stroke-width="1.6"/>
<circle cx="44" cy="242.0" r="11" class="bdg"/>
<text x="44" y="246.6" class="bdg-t" text-anchor="middle">3</text>
<text x="66" y="237.3" class="tb15" text-anchor="start">Interprétation</text>
<text x="66" y="256.6" class="s" text-anchor="start">une hypothèse, deux preuves concordantes</text>
<path d="M225,274 L225,288" class="ln" marker-end="url(#kd46-a)"/>
<rect x="20" y="290" width="410" height="60" rx="10" class="k-amber" stroke-width="1.6"/>
<circle cx="44" cy="320.0" r="11" class="bdg"/>
<text x="44" y="324.6" class="bdg-t" text-anchor="middle">4</text>
<text x="66" y="315.3" class="tb15" text-anchor="start">Correction minimale</text>
<text x="66" y="334.6" class="s" text-anchor="start">un seul changement, réversible</text>
<path d="M225,352 L225,366" class="ln" marker-end="url(#kd46-a)"/>
<rect x="20" y="368" width="410" height="60" rx="10" class="k-green" stroke-width="1.6"/>
<circle cx="44" cy="398.0" r="11" class="bdg"/>
<text x="44" y="402.6" class="bdg-t" text-anchor="middle">5</text>
<text x="66" y="393.3" class="tb15" text-anchor="start">Contrôle final</text>
<text x="66" y="412.6" class="s" text-anchor="start">service réel OK + test négatif</text>
<path d="M432,398 L474,398 L474,164 L434,164" class="ln ln-bad dash" marker-end="url(#kd46-a-bad)"/>
<text x="496" y="281" class="s" text-anchor="middle" transform="rotate(-90 496 281)">échec : nouvelle hypothèse</text>
<text x="20" y="464" class="s" text-anchor="start">Conserver les preuves : un redémarrage efface</text>
<text x="20" y="484" class="s" text-anchor="start">souvent l'indice le plus utile.</text>
</svg>
</div>

**Avant toute suppression,** notez l'heure, le contexte, les dernières modifications, les personnes affectées et le périmètre : un conteneur, un Pod, un nœud ou tout le cluster. Un redémarrage peut effacer un indice ou déplacer le problème. Les Events sont temporaires ; les logs de l'instance précédente ne sont pas une archive durable. Voir [Troubleshooting Applications](https://kubernetes.io/docs/tasks/debug/debug-application/).

**Où et avec quoi :** toutes les commandes Bash de ce chapitre s'exécutent depuis le **poste d'administration Linux/WSL**, à la racine du dossier associé, sauf mention d'un hôte ou d'un conteneur. Prérequis : `kubectl`, `jq`, laboratoire de base fonctionnel, clients `client` et `interdit`, permission de diagnostic. `kubectl top` exige une API de métriques opérationnelle.

:::note[Dossier des preuves d'incident]
Les preuves vont dans `validation/incidents`, **distinct** du dossier `validations/` versionné : elles peuvent contenir des paramètres sensibles. Gardez-les hors de tout dépôt public.
:::

**Étape 1 — Sauvegarder une seule fois l'état sain**, avant la série d'incidents :

```bash title="Poste d'administration · une seule fois, depuis l'état sain"
mkdir -p validation/incidents
kubectl --context kind-formation -n atelier get deployment web -o json | jq '[{op:"replace",path:"/spec/template",value:.spec.template}]' > validation/incidents/retour-template-web.json
kubectl --context kind-formation -n atelier get service web -o json | jq '[{op:"replace",path:"/spec/ports",value:.spec.ports},{op:"replace",path:"/spec/selector",value:.spec.selector}]' > validation/incidents/retour-service-web.json
kubectl --context kind-formation -n atelier get pods -l app=web -o wide
kubectl --context kind-formation -n atelier get events --sort-by=.metadata.creationTimestamp > validation/incidents/events-avant.txt
```

Ces fichiers sont des **patchs JSON de restauration** : ils remplacent exactement le template du Deployment et les ports/selector du Service. Ne les écrasez jamais avec un état dégradé, et ne réalisez qu'**un incident à la fois**. (Une simple réapplication du manifeste peut laisser un champ ajouté manuellement si son gestionnaire ne le possédait pas.)

**Étape 2 — Cibler le Pod en défaut.** Les exemples choisissent le Pod le plus récent du Deployment. **Refaites cette affectation après chaque changement de template** : un ancien nom de Pod devient vite trompeur.

```bash title="Poste d'administration · « Réaffecter POD » renvoie à ce bloc"
POD=$(kubectl --context kind-formation -n atelier get pods -l app=web -o json | jq -r '.items | sort_by(.metadata.creationTimestamp) | last | .metadata.name')
test -n "$POD" && test "$POD" != null
kubectl --context kind-formation -n atelier describe pod "$POD" > validation/incidents/pod-courant.txt
kubectl --context kind-formation -n atelier logs "$POD" -c app --timestamps --tail=200
kubectl --context kind-formation -n atelier logs "$POD" -c app --previous --timestamps --tail=200
```

L'absence de logs « précédents » est normale si le conteneur n'a jamais démarré ou jamais redémarré.

**Étape 3 — Revenir à l'état sain** après un incident sur le template ou le Service :

```bash title="Poste d'administration · retour à l'état sain"
kubectl --context kind-formation -n atelier patch deployment web --type=json --patch-file=validation/incidents/retour-template-web.json
kubectl --context kind-formation -n atelier patch service web --type=json --patch-file=validation/incidents/retour-service-web.json
kubectl --context kind-formation -n atelier rollout status deployment/web --timeout=180s
kubectl --context kind-formation -n atelier exec deployment/client -- curl -fsS --max-time 5 http://web/
kubectl --context kind-formation -n atelier diff -k manifests/overlays/lab
```

**Résultat attendu :** rollout terminé, réponse HTTP, et un `diff` vide (code 0) ou des différences comprises. Un code 1 de `kubectl diff` signale une différence ; une erreur de connexion signifie autre chose. Comprenez les différences avant de réconcilier avec Git. Les politiques réseau doivent être dans l'état de référence du chapitre 9 avant les tests HTTP. Aucune sortie présentée ici n'est une mesure réellement observée.

<a id="scenario-01"></a>

### 21.2 Scénario 1 — Pod Pending

**Symptôme.** Le Pod reste en phase `Pending` ; l'application n'est pas accessible. *Analogie : une réservation est enregistrée, mais aucune salle compatible n'est encore attribuée.*

**Causes possibles.** Requests excessives, `nodeSelector` impossible, taint sans toleration, contraintes topologiques, PVC indisponible ; si le nœud est déjà attribué, téléchargement ou création du conteneur encore en cours.

**Injection et vérifications.** On ajoute un critère qu'aucun nœud du laboratoire ne satisfait :

```bash title="Poste d'administration"
kubectl --context kind-formation -n atelier patch deployment web --type=merge -p '{"spec":{"template":{"spec":{"nodeSelector":{"formation.invalid/absent":"oui"}}}}}'
kubectl --context kind-formation -n atelier get pods -l app=web -o wide
# Réaffecter POD avec la commande de 21.1.
kubectl --context kind-formation -n atelier describe pod "$POD"
kubectl --context kind-formation -n atelier get pod "$POD" -o jsonpath='{.spec.nodeName}{"\n"}{.status.conditions}{"\n"}'
```

**Interpréter.** `nodeName` vide, condition `PodScheduled=False` avec la raison `Unschedulable`, et des Events qui décrivent le selector incompatible confirment l'injection. `Pending` seul n'indique pas la cause.

**Corriger.** Restaurer le template (§21.1). En incident réel : corriger la contrainte erronée ou fournir la capacité requise.

**Contrôle final.** Nouveau Pod affecté à un nœud, `Ready=True`, rollout et HTTP réussis.

**Prévenir.** Valider contraintes et capacité avant le déploiement. Référence : [Debug Pods](https://v1-35.docs.kubernetes.io/docs/tasks/debug/debug-application/debug-pods/).

<a id="scenario-02"></a>

### 21.3 Scénario 2 — CrashLoopBackOff

**Symptôme.** Le conteneur démarre puis s'arrête en boucle ; la colonne `STATUS` affiche `CrashLoopBackOff`. Ce terme désigne l'**attente avant une nouvelle tentative**, pas une phase du Pod. *Analogie : un employé ouvre son guichet, constate une configuration impossible et repart.*

**Causes possibles.** Commande erronée, configuration invalide, dépendance indisponible, droits sur un fichier, arrêt provoqué par une probe.

**Injection et vérifications.**

```bash title="Poste d'administration"
# Injection : sortie applicative volontaire avec code 2.
kubectl --context kind-formation -n atelier patch deployment web --type=strategic -p '{"spec":{"template":{"spec":{"containers":[{"name":"app","command":["sh","-c","echo incident-volontaire >&2; exit 2"]}]}}}}'
# Réaffecter POD puis conserver les preuves avant correction.
kubectl --context kind-formation -n atelier logs "$POD" -c app --previous
kubectl --context kind-formation -n atelier get pod "$POD" -o jsonpath='{.status.containerStatuses[?(@.name=="app")].lastState}{"\n"}'
kubectl --context kind-formation -n atelier describe pod "$POD"
```

**Interpréter.** Le message `incident-volontaire` dans les logs précédents et le code de sortie 2 dans `lastState` concordent avec la commande injectée. Un code 1 ne désigne pas une cause universelle.

**Corriger.** Restaurer le template ; en situation réelle, traiter la configuration ou la dépendance **réellement démontrée**.

**Contrôle final.** Compteur de redémarrages stable pendant une période d'observation, réponse HTTP correcte.

**Prévenir.** Tester la commande et le démarrage avec l'image finale ; conserver les logs hors du Pod. Voir [cycle de vie des Pods](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/).

<a id="scenario-03"></a>

### 21.4 Scénario 3 — OOMKilled

**Symptôme.** Dernier état terminé avec `reason: OOMKilled`, redémarrages ou disparition du processus sous charge. *Analogie : une armoire dépasse son quota d'espace ; on interrompt le processus pour récupérer de la mémoire.*

**Causes possibles.** Limite trop basse, fuite mémoire, pic de requêtes, cache non borné, pression mémoire du nœud.

**Vérifications.**

```bash title="Poste d'administration"
kubectl --context kind-formation -n atelier get pod "$POD" -o jsonpath='{.status.containerStatuses[?(@.name=="app")].lastState.terminated}{"\n"}'
kubectl --context kind-formation -n atelier get deployment web -o jsonpath='{.spec.template.spec.containers[?(@.name=="app")].resources}{"\n"}'
kubectl --context kind-formation -n atelier top pod "$POD" --containers
kubectl --context kind-formation -n atelier describe pod "$POD"
```

**Interpréter.** `exitCode: 137` peut résulter d'un `SIGKILL` pour d'autres raisons : il ne prouve pas, seul, un manque de mémoire. Le pic qui a précédé l'arrêt peut ne pas apparaître dans une métrique échantillonnée après le redémarrage.

**Injection optionnelle (laboratoire seulement).** Abaisser temporairement request **et** limite mémoire à `1Mi` : `kubectl --context kind-formation -n atelier set resources deployment/web -c app --requests=memory=1Mi --limits=memory=1Mi`. Selon le runtime et les règles du namespace, vous obtiendrez peut-être un refus ou une erreur de création : ne les appelez ni OOM ni réussite.

**Corriger.** Restaurer le template pour l'essai ; en production, dimensionner sur preuves et corriger la consommation.

**Contrôle final.** Charge représentative, mémoire mesurée, aucun nouvel arrêt — sans prétendre qu'une limite plus haute corrige une fuite.

**Prévenir.** Tests mémoire, alertes, réserve sur le nœud. Source : [ressources mémoire](https://v1-35.docs.kubernetes.io/docs/tasks/configure-pod-container/assign-memory-resource/).

<a id="scenario-04"></a>

### 21.5 Scénario 4 — ImagePullBackOff

**Symptôme.** Le conteneur attend ; Events `ErrImagePull` puis `ImagePullBackOff`. *Analogie : le magasin ne peut pas livrer la référence commandée.*

**Causes possibles.** Image inexistante, digest erroné, accès refusé, certificat du registre, proxy, DNS, architecture non couverte, limite de débit du registre.

**Injection et vérifications.**

```bash title="Poste d'administration"
# Injection : référence de test volontairement inexistante.
kubectl --context kind-formation -n atelier set image deployment/web app=registry.invalid/formation/image-inexistante:incident
kubectl --context kind-formation -n atelier get pods -l app=web
# Réaffecter POD.
kubectl --context kind-formation -n atelier describe pod "$POD"
kubectl --context kind-formation -n atelier get pod "$POD" -o jsonpath='{.spec.imagePullSecrets}{"\n"}{.status.containerStatuses}{"\n"}'
```

**Interpréter.**

| Message du registre | Piste |
|---|---|
| Erreur DNS sur `registry.invalid` | Correspond à l'injection |
| `401` | Identifiants (`imagePullSecrets`) |
| `manifest unknown` | Référence (nom, tag, digest) |

Le téléchargement passe par **le nœud et son runtime** : une résolution DNS réussie depuis un Pod ne prouve pas celle du runtime.

**Corriger.** Restaurer le template. Pour un registre privé, corriger le Secret référencé, dans le même namespace, sans publier ses valeurs.

**Contrôle final.** Digest réellement exécuté dans `imageID`, readiness et HTTP.

**Prévenir.** Vérifier disponibilité, plateforme et authentification avant le rollout ; verrouiller le digest. Source : [Images](https://v1-35.docs.kubernetes.io/docs/concepts/containers/images/).

<a id="scenario-05"></a>

### 21.6 Scénario 5 — Probes défaillantes

**Symptôme.** Application démarrée mais non prête, ou redémarrages périodiques avec des Events `Unhealthy`. *Analogie : le contrôle de santé frappe à une porte qui n'existe pas.*

**Causes possibles.** Chemin, port ou protocole incorrects ; budget de démarrage insuffisant ; probe trop sensible ; application ou dépendance réellement dégradée.

**Injection et vérifications.**

```bash title="Poste d'administration"
# Injection : seule la readiness vise un chemin absent.
kubectl --context kind-formation -n atelier patch deployment web --type=strategic -p '{"spec":{"template":{"spec":{"containers":[{"name":"app","readinessProbe":{"httpGet":{"path":"/inexistant-formation","port":8080}}}]}}}}'
# Réaffecter POD.
kubectl --context kind-formation -n atelier describe pod "$POD"
kubectl --context kind-formation -n atelier get endpointslices -l kubernetes.io/service-name=web -o yaml
kubectl --context kind-formation -n atelier logs "$POD" -c app --tail=100
```

**Interpréter.**

| Probe en échec | Conséquence |
|---|---|
| Readiness | Pod retiré des destinations prêtes, **sans redémarrage** |
| Startup ou liveness (au seuil) | Redémarrage du conteneur ; la startup retarde les deux autres jusqu'à son succès |

Un HTTP 404 prouve qu'un serveur répond, pas que la probe est adaptée.

**Corriger.** Restaurer `/ready` du manifeste sain, puis adapter les budgets à des mesures.

**Contrôle final.** `Ready=True`, endpoint prêt, aucun nouvel événement `Unhealthy`.

**Prévenir.** Tester les endpoints de santé ; éviter une liveness dépendant d'un service externe instable. Source : [probes](https://v1-35.docs.kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/).

<a id="scenario-06"></a>

### 21.7 Scénario 6 — Permissions refusées

**Symptôme.** `Forbidden` sur une requête API, `Permission denied` dans l'application, ou refus d'admission. *Analogie : un badge valide n'ouvre pas toutes les portes.*

**Causes possibles.** Mauvais ServiceAccount, RBAC insuffisant, UID/GID incompatibles avec un volume, racine en lecture seule, profil PSA ou autre politique.

**Injection et vérifications.** Aucun droit n'est modifié : on exerce l'action interdite.

```bash title="Poste d'administration"
# Injection réversible sans changer les droits : exercer l'action interdite.
kubectl --context kind-formation -n atelier get secrets --as=system:serviceaccount:atelier:auditeur
kubectl --context kind-formation -n atelier auth can-i get secrets --as=system:serviceaccount:atelier:auditeur
kubectl --context kind-formation -n atelier get deployment web -o jsonpath='{.spec.template.spec.serviceAccountName}{"\n"}{.spec.template.spec.securityContext}{"\n"}'
kubectl --context kind-formation -n atelier exec deployment/web -c app -- id
```

**Interpréter.** Un `403 Forbidden` est un refus d'**autorisation** ; une erreur Linux sur un fichier relève d'une autre frontière. Lisez le message complet et la ressource nommée. Un refus PSA peut toucher le Pod créé par un contrôleur alors que le Deployment, lui, a été accepté.

**Corriger.** Ici, rien : le refus attendu démontre le contrôle. Pour un besoin légitime, ajoutez seulement la règle nécessaire, ou corrigez le point d'écriture.

**Contrôle final.** Tests oui/non du chapitre 15 et fonctionnement applicatif.

**Prévenir.** Matrice identité / action / ressource ; exceptions tracées. Source : [RBAC good practices](https://v1-35.docs.kubernetes.io/docs/concepts/security/rbac-good-practices/).

<a id="scenario-07"></a>

### 21.8 Scénario 7 — DNS ne résout pas

**Symptôme.** `curl` affiche « Could not resolve host », ou la résolution expire. *Analogie : l'annuaire ne trouve pas le destinataire — cela ne prouve pas que sa porte est fermée.*

**Causes possibles.** Nom ou namespace erroné, CoreDNS indisponible, `dnsPolicy` incorrecte, flux vers DNS bloqué, domaine de recherche ou DNS externe défaillant.

**Vérifications** (test négatif, sans changement d'infrastructure) :

```bash title="Poste d'administration"
# Test négatif : aucun changement d'infrastructure.
kubectl --context kind-formation -n atelier exec deployment/client -- curl -v --max-time 5 http://service-absent.atelier.svc.cluster.local/
kubectl --context kind-formation -n atelier exec deployment/client -- cat /etc/resolv.conf
kubectl --context kind-formation -n atelier exec deployment/client -- curl -fsS --max-time 5 http://web.atelier.svc.cluster.local/
SERVICE_IP=$(kubectl --context kind-formation -n atelier get service web -o jsonpath='{.spec.clusterIP}')
kubectl --context kind-formation -n atelier exec deployment/client -- curl -fsS --max-time 5 "http://$SERVICE_IP/"
```

**Interpréter.**

| Nom complet (FQDN) | Par IP | Conclusion |
|---|---|---|
| OK | OK | Le nom testé était faux |
| Échec | OK | Piste DNS |
| Échec | Échec | Continuer le diagnostic réseau (scénarios 8 et 11) |

**Corriger.** Corriger le nom pour ce test ; sinon, examiner les Pods et logs CoreDNS dans `kube-system`, et les autorisations UDP **et** TCP 53 selon l'architecture.

**Contrôle final.** Résolution, puis réponse applicative depuis le même client.

**Prévenir.** Tests DNS internes et externes, surveillance de CoreDNS. Source : [Debugging DNS Resolution](https://v1-35.docs.kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/).

<a id="scenario-08"></a>

### 21.9 Scénario 8 — Service inaccessible

**Symptôme.** Le Pod répond directement, mais `http://web/` échoue. *Analogie : le standard téléphonique a une liste de destinataires erronée.*

**Causes possibles.** Selector incorrect, Pods non prêts, mauvais `targetPort`, dataplane du Service, politique réseau, processus qui écoute ailleurs.

**Injection et vérifications.**

```bash title="Poste d'administration"
# Injection : remplacer le selector du Service.
kubectl --context kind-formation -n atelier patch service web --type=merge -p '{"spec":{"selector":{"app":"web-inexistant"}}}'
kubectl --context kind-formation -n atelier get service web -o yaml
kubectl --context kind-formation -n atelier get pods -l app=web --show-labels
kubectl --context kind-formation -n atelier get endpointslices -l kubernetes.io/service-name=web -o yaml
kubectl --context kind-formation -n atelier exec deployment/client -- curl -v --max-time 5 http://web/
```

**Interpréter.** Le selector injecté ne correspond à aucun Pod : l'EndpointSlice ne contient aucune adresse. En général, l'absence d'endpoint prêt peut aussi venir de la readiness ou d'une terminaison ; un Service **sans** selector n'est pas forcément mal configuré. Inspectez adresses, conditions et ports des EndpointSlices.

**Corriger.** Restaurer le Service avec le patch sauvegardé (§21.1).

**Contrôle final.** Destinations prêtes, requête par le Service réussie.

**Prévenir.** Tester selector, readiness et port réel en CI et après déploiement. Source : [Debug Services](https://v1-35.docs.kubernetes.io/docs/tasks/debug/debug-application/debug-service/).

<a id="scenario-09"></a>

### 21.10 Scénario 9 — Exposition HTTP incorrecte

**Symptôme.** Le Service interne répond, mais l'URL externe retourne 404, 502/503 ou expire. *Analogie : le bâtiment est ouvert, mais l'accueil envoie au mauvais étage.*

**Causes possibles.** Host ou chemin incorrect, route non attachée, contrôleur absent, backend erroné, listener non publié, mauvaise adresse locale.

**Vérifications.**

```bash title="Poste d'administration · terminal 1 (port-forward), puis terminal 2"
# Depuis le poste : isoler le Service par port-forward dans un premier terminal.
kubectl --context kind-formation -n atelier port-forward service/web 8088:80
# Second terminal du même poste : test positif et négatif réversibles.
curl -v --max-time 5 http://127.0.0.1:8088/
curl -v --max-time 5 http://127.0.0.1:8088/chemin-absent-formation
kubectl --context kind-formation -n atelier get gateway,httproute
kubectl --context kind-formation -n atelier describe httproute web
```

**Interpréter.** Le port-forward **contourne** la route et plusieurs chemins réseau : son succès isole le Service, il ne prouve pas l'accès externe. Le 404 volontaire vient de nginx, pas d'une panne du contrôleur. Les ressources Gateway API exigent leurs CRD et un contrôleur : sans l'atelier du chapitre 12, les deux dernières commandes ne s'appliquent pas.

**Corriger.** La règle, le Host ou le backend démontré erroné, dans son manifeste complet.

**Contrôle final.** URL réelle depuis l'extérieur, Host prévu, statut de route accepté, réponse attendue. Fermez le port-forward avec `Ctrl+C`.

**Prévenir.** Test d'entrée complet après chaque changement. Source : [Gateway API troubleshooting](https://gateway-api.sigs.k8s.io/reference/api-types/httproute/).

<a id="scenario-10"></a>

### 21.11 Scénario 10 — TLS invalide

**Symptôme.** Le client refuse le certificat avant toute réponse HTTP. *Analogie : l'interlocuteur présente un badge expiré, ou au nom de quelqu'un d'autre.*

**Causes possibles.** Certificat expiré, **SAN** (*Subject Alternative Name*) incorrect, chaîne incomplète, autorité non reconnue, horloge fausse, mauvais **SNI** (*Server Name Indication*).

**Vérifications** (seulement après l'atelier TLS local du §12.4, listener publié sur 8443) :

```bash title="Poste d'administration · après l'atelier TLS local (port 8443)"
openssl s_client -connect 127.0.0.1:8443 -servername web.k8s.test -showcerts </dev/null
curl --resolve web.k8s.test:8443:127.0.0.1 --cacert .secrets/web.crt -v https://web.k8s.test:8443/
# Test négatif : même IP, autre nom non inclus dans le certificat.
curl --resolve nom-invalide.k8s.test:8443:127.0.0.1 --cacert .secrets/web.crt -v https://nom-invalide.k8s.test:8443/
```

**Interpréter.** `openssl s_client` montre la négociation et la chaîne ; sans options de vérification, un handshake réussi ne prouve pas la validité du nom. Le second `curl` doit réussir, le troisième **refuser** l'identité erronée : conservez sa sortie. Ici, le certificat autosigné `.secrets/web.crt` (SAN `web.k8s.test`) sert explicitement d'ancre de confiance locale, et le Secret `web-tls` du namespace `atelier` alimente le listener HTTPS.

**Corriger.** Fournir certificat, chaîne et nom corrects ; rétablir l'horloge si nécessaire.

**Contrôle final.** `curl` réussit **avec** vérification TLS active, et le test négatif échoue toujours.

**Prévenir.** Alertes d'expiration et renouvellement testé. Références : [TLS Gateway API](https://gateway-api.sigs.k8s.io/guides/user-guides/tls/), [curl TLS](https://curl.se/docs/sslcerts.html).

<a id="scenario-11"></a>

### 21.12 Scénario 11 — NetworkPolicy bloque ou ne bloque pas

**Symptôme.** Un flux autorisé expire, ou un flux supposé interdit réussit. *Analogie : deux portes successives doivent autoriser le passage — la sortie de la source et l'entrée de la destination.*

**Causes possibles.** Mauvais labels, port 80 confondu avec 8080, DNS bloqué, règle additive oubliée, CNI qui n'applique pas les politiques.

**Vérifications.**

```bash title="Poste d'administration"
kubectl --context kind-formation -n atelier get networkpolicy
kubectl --context kind-formation -n atelier get pods --show-labels
kubectl --context kind-formation -n atelier describe networkpolicy
kubectl --context kind-formation -n atelier exec deployment/client -- curl -fsS --max-time 5 http://web/
kubectl --context kind-formation -n atelier exec deployment/interdit -- curl -fsS --max-time 5 http://web/
```

**Interpréter.** Le client autorisé doit réussir **et** le client interdit échouer : un objet créé ne valide pas le contrôle. Les règles sont additives : une règle large peut autoriser ce qu'une autre n'autorise pas. Un échec par nom peut concerner DNS avant HTTP (code curl 6 contre 28, voir chapitre 9).

**Injection.** Rejouez dans l'ordre `00-deny.yaml`, `10-dns.yaml`, puis `20-web.yaml` du dossier `manifests/network`, en observant entre chaque étape.

**Corriger.** Rétablir les trois documents de référence.

**Contrôle final.** Matrice source / destination / port, DNS testé séparément, avant/après, nouvelles connexions.

**Prévenir.** Tests positifs et négatifs automatisés avec le CNI réellement retenu. Source : [Network Policies](https://v1-35.docs.kubernetes.io/docs/concepts/services-networking/network-policies/).

<a id="scenario-12"></a>

### 21.13 Scénario 12 — PVC bloqué

**Symptôme.** `PersistentVolumeClaim` en `Pending` ; le Pod consommateur n'est pas disponible. *Analogie : la réservation d'un casier existe, mais aucun casier compatible n'est attribué.*

**Causes possibles.** StorageClass absente, provisionneur indisponible, capacité, topologie, mode d'accès, attente du premier consommateur.

**Injection et vérifications** (objet jetable, aucun volume métier) :

```bash title="Poste d'administration"
# Injection indépendante : aucun volume métier n'est utilisé.
kubectl --context kind-formation -n atelier apply -f - <<'YAML'
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-incident
  namespace: atelier
spec:
  accessModes: [ReadWriteOnce]
  storageClassName: formation-classe-inexistante
  resources:
    requests:
      storage: 64Mi
YAML
kubectl --context kind-formation -n atelier describe pvc pvc-incident
kubectl --context kind-formation -n atelier get storageclass
```

**Interpréter.** La classe volontairement absente explique ce PVC. Avec `WaitForFirstConsumer`, un PVC `Pending` sans consommateur peut être **normal**. `ReadWriteOnce` signifie un nœud, pas un Pod unique ; le volume et le CSI déterminent les possibilités réelles.

**Corriger.** Supprimer seulement l'objet jetable : `kubectl --context kind-formation -n atelier delete pvc pvc-incident`. Un PVC existant ne change pas librement de classe : planifiez une migration de données.

**Contrôle final.** Dans l'atelier stockage sain : PVC `Bound`, lecture et écriture depuis le consommateur.

**Prévenir.** Tester le provisionneur, la topologie et la restauration. Source : [Persistent Volumes](https://v1-35.docs.kubernetes.io/docs/concepts/storage/persistent-volumes/).

<a id="scenario-13"></a>

### 21.14 Scénario 13 — Erreur de montage

**Symptôme.** Pod attribué à un nœud mais bloqué à la création ; Event `FailedMount` ou `FailedAttachVolume`. *Analogie : le casier est réservé, mais sa clé ou son raccordement manque.*

**Causes possibles.** Secret ou ConfigMap absent, clé inexistante, CSI défaillant, volume déjà attaché ailleurs, permissions, système de fichiers.

**Injection et vérifications.**

```bash title="Poste d'administration"
# Injection : ajouter un volume ConfigMap inexistant au workload web.
kubectl --context kind-formation -n atelier patch deployment web --type=strategic -p '{"spec":{"template":{"spec":{"volumes":[{"name":"incident-absent","configMap":{"name":"config-absente-formation"}}],"containers":[{"name":"app","volumeMounts":[{"name":"incident-absent","mountPath":"/incident","readOnly":true}]}]}}}}'
# Réaffecter POD.
kubectl --context kind-formation -n atelier describe pod "$POD"
kubectl --context kind-formation -n atelier get configmap config-absente-formation
kubectl --context kind-formation -n atelier get pod "$POD" -o jsonpath='{.spec.nodeName}{"\n"}{.spec.volumes}{"\n"}'
```

**Interpréter.** Un nœud **attribué** et un ConfigMap nommément introuvable distinguent cet incident d'un défaut de scheduling (scénario 1). Avec un CSI, les événements du contrôleur et du nœud peuvent être nécessaires ; ne supprimez pas le PVC pour résoudre un montage.

**Corriger.** Restaurer le template ; en situation réelle, corriger la référence ou créer la configuration légitime.

**Contrôle final.** Volume monté, application démarrée, HTTP et accès au fichier nécessaires.

**Prévenir.** Vérifier références, droits et ordre de création avant le rollout. Source : [Volumes](https://v1-35.docs.kubernetes.io/docs/concepts/storage/volumes/).

<a id="scenario-14"></a>

### 21.15 Scénario 14 — Nœud NotReady

**Symptôme.** `Ready=False` ou `Ready=Unknown` ; nouvelles affectations perturbées. *Analogie : le responsable d'un atelier ne répond plus à l'accueil — cela n'identifie pas encore la panne des machines.*

**Causes possibles.** Kubelet arrêté, rupture réseau vers l'API, runtime ou CNI dégradé, certificat, pression de ressources.

**Vérifications.**

```bash title="Poste d'administration · worker du laboratoire kind choisi explicitement"
WORKER=$(kubectl --context kind-formation -n atelier get nodes -l '!node-role.kubernetes.io/control-plane' -o json | jq -r '.items | sort_by(.metadata.name) | first | .metadata.name')
test -n "$WORKER" && test "$WORKER" != null
kubectl --context kind-formation -n atelier describe node "$WORKER"
kubectl --context kind-formation -n kube-node-lease get lease "$WORKER" -o yaml
```

**Interpréter.** Conditions du nœud, renouvellement du **Lease** (`renewTime`) et journaux du kubelet se recoupent. Un nœud déclaré non prêt peut encore exécuter des processus.

**Injection (VM kubeadm uniquement).** Sur un worker jetable identifié et accessible par console : `sudo systemctl stop kubelet`, puis collecte ; remise en état sur **le même worker** avec `sudo systemctl start kubelet`. N'utilisez pas ces commandes sur le poste Windows, et ne supposez pas que le nom d'un nœud kind est celui d'une VM.

**Corriger.** Rétablir le composant ou le lien démontré en défaut ; lire `sudo journalctl -u kubelet --since '-10 min'` sur l'hôte.

**Contrôle final.** Lease renouvelé, `Ready=True`, Pods et requêtes rétablis.

**Prévenir.** Supervision de l'hôte, du réseau, des certificats et de la capacité. Source : [Monitor Node Health](https://v1-35.docs.kubernetes.io/docs/tasks/debug/debug-cluster/monitor-node-health/).

<a id="scenario-15"></a>

### 21.16 Scénario 15 — Saturation CPU, mémoire ou disque

**Symptôme.** Latence, throttling, scheduling impossible, évictions ou pression disque. *Analogie : ajouter des guichets n'aide pas si tout le bâtiment manque de courant ou d'espace.*

**Causes possibles.** Requests sous-évaluées, limites CPU trop serrées, logs non bornés, fuite mémoire, images ou stockage éphémère qui saturent le nœud.

**Vérifications** (`$WORKER` défini au scénario 14) :

```bash title="Poste d'administration"
kubectl --context kind-formation -n atelier top nodes
kubectl --context kind-formation -n atelier top pods --containers
kubectl --context kind-formation -n atelier describe node "$WORKER"
kubectl --context kind-formation -n atelier get events --sort-by=.metadata.creationTimestamp
kubectl --context kind-formation -n atelier get resourcequota,limitrange
```

**Interpréter.** Le scheduling compare requests et capacité allouable, pas l'usage instantané. Une limite CPU peut provoquer du throttling ; une limite mémoire, un arrêt. `DiskPressure` impose de vérifier aussi les **inodes**. Si Metrics Server est absent, `top` est indisponible — la charge n'est pas nulle pour autant.

**Exercice réversible.** Étudiez un pic de charge avec un générateur **borné** et les limites définies dans l'atelier résilience. Ne remplissez jamais le disque de l'hôte partagé pour reproduire ce scénario.

**Corriger.** Arrêter le générateur ou la source de logs, puis corriger dimensionnement ou rétention sur preuves.

**Contrôle final.** Latence, usage et conditions stabilisés, sans nouvelle éviction.

**Prévenir.** Réserves système, quotas, alertes, rotation des logs et tests de charge. Sources : [CPU](https://v1-35.docs.kubernetes.io/docs/tasks/configure-pod-container/assign-cpu-resource/), [node-pressure eviction](https://v1-35.docs.kubernetes.io/docs/concepts/scheduling-eviction/node-pressure-eviction/).

<a id="scenario-16"></a>

### 21.17 Scénario 16 — API ou control plane indisponible

**Symptôme.** `kubectl` expire, connexion refusée, erreur TLS ou réponses 5xx ; les applications déjà démarrées peuvent continuer à servir. *Analogie : le standard central est injoignable, mais certains ateliers poursuivent leur travail.*

**Causes possibles.** Mauvais endpoint côté client, réseau, équilibrage, certificat, API Server arrêté, etcd indisponible.

**Vérifications** (la dernière commande simule une panne **côté client** uniquement) :

```bash title="Poste d'administration"
kubectl --context kind-formation -n atelier config view --minify
kubectl --context kind-formation -n atelier get --raw='/readyz?verbose' --request-timeout=5s
kubectl --context kind-formation -n atelier get --raw='/livez?verbose' --request-timeout=5s
# Simulation côté client : aucun changement du cluster ou kubeconfig.
kubectl --context kind-formation -n atelier --server=https://127.0.0.1:1 get pods --request-timeout=3s
```

**Interpréter.**

| Réponse | Signification |
|---|---|
| `401` / `403` | L'API répond : problème d'accès, pas de disponibilité |
| Délai dépassé | N'identifie pas le composant en panne |
| Connexion refusée sur `127.0.0.1:1` | Seulement la destination client inaccessible (simulation) |

`/livez` et `/readyz` portent sur **l'instance contactée** et exigent des permissions. Derrière un répartiteur, le défaut d'un membre peut être masqué.

**Corriger.** Pour la simulation : corriger le client. Pour un incident kubeadm : passer par la **console** du control plane, `sudo crictl ps -a`, puis les logs du conteneur concerné avec son identifiant relevé — l'API défaillante ne peut pas être votre seul outil.

**Contrôle final.** Santé par instance, accès via l'adresse normale, lecture **et** modification jetable réussies.

**Prévenir.** Supervision externe, certificats, redondance, accès console. Sources : [Troubleshooting Clusters](https://v1-35.docs.kubernetes.io/docs/tasks/debug/debug-cluster/), [crictl](https://v1-35.docs.kubernetes.io/docs/tasks/debug/debug-cluster/crictl/).

<a id="scenario-17"></a>

### 21.18 Scénario 17 — etcd lent, sans quorum ou en alarme

**Symptôme.** Écritures API lentes ou refusées, erreurs etcd, changements fréquents de leader, alarme `NOSPACE`. *Analogie : le registre partagé n'obtient plus assez de signatures, ou manque de place pour inscrire une décision.*

**Causes possibles.** Disque lent ou plein, latence entre membres, perte de majorité, certificat, quota du backend, arrêt d'un membre.

**Vérifications.** Sur le control plane du laboratoire kubeadm, depuis la copie locale du dossier associé, avec un compte autorisé. `etcd-env.sh` cible le membre kubeadm local ; adaptez endpoints et certificats pour toute autre topologie. `etcdctl` lit directement les variables `ETCDCTL_*` :

```bash title="Control plane kubeadm · root, dossier associé"
source scripts-etcd/etcd-env.sh
: "${ETCDCTL_ENDPOINTS:?Endpoints HTTPS réels requis}"
: "${ETCDCTL_CACERT:?CA réelle requise}"
: "${ETCDCTL_CERT:?Certificat client réel requis}"
: "${ETCDCTL_KEY:?Clé client réelle requise}"
etcdctl endpoint status -w table
etcdctl endpoint health
etcdctl alarm list
```

**Interpréter.** Un membre inaccessible ne prouve pas une perte de quorum : comptez la majorité de la configuration effective et recoupez avec les autres membres (§19.3). Une connexion TCP ne prouve pas la capacité à traiter une proposition. `NOSPACE` peut subsister après une suppression logique, car compaction et défragmentation ont des rôles distincts (§19.8).

**Corriger.**

| Situation | Procédure |
|---|---|
| Un membre perdu, quorum conservé | Remplacement d'un membre ([§19.9](#etcd-membre-perdu)) |
| Quorum non récupérable | Restauration dédiée ([§19.11](#etcd-restauration)) |
| `NOSPACE` | Diagnostic de l'espace et maintenance (§19.8) avant acquittement |

Jamais de `force-new-cluster`, de suppression de répertoire ni de restauration improvisée.

**Contrôle final.** Membres attendus, leader, endpoints sains, aucune alarme, opérations API réelles.

**Prévenir.** Sauvegardes hors cluster, tests de restauration, métriques disque et alertes. L'injection de perte d'un membre appartient à l'atelier etcd isolé, avec sa procédure de retour ; ne l'ajoutez pas au laboratoire applicatif. Sources : [etcd 3.6 failure modes](https://etcd.io/docs/v3.6/op-guide/failures/), [maintenance](https://etcd.io/docs/v3.6/op-guide/maintenance/).

### 21.19 Exercice de synthèse et corrigé

**Objectif :** diagnostiquer une indisponibilité sans toucher aux contrôles de sécurité.

**Environnement :** laboratoire léger sain, patchs de retour du §21.1, accès au dossier de manifests.

**Énoncé :** un formateur choisit **une seule** injection parmi les scénarios 1, 2, 4, 5, 8 ou 13. Vous devez retrouver la cause, fournir **deux preuves concordantes**, corriger et démontrer le retour du service.

**Contraintes :** pas de suppression de namespace, pas de droits supplémentaires, conservation des Events et des états précédents.

**Indices progressifs :** comparer état souhaité et observé ; identifier le premier composant qui échoue ; vérifier la couche immédiatement en amont et en aval.

<details>
<summary>Corrigé expliqué</summary>

| Premier constat | Piste |
|---|---|
| Pod non affecté à un nœud | Scheduling (scénario 1) |
| Conteneur jamais créé | Téléchargement d'image (4) ou montage (13) |
| Conteneur qui se termine | Logs et dernier état (2) |
| Pod qui tourne mais pas prêt | Probes (5) |
| Pods sains, Service vide | Selector et endpoints (8) |

Ces indices **orientent** ; les messages et les manifests **confirment**. Restaurez uniquement le template ou le Service concerné, attendez le rollout, testez HTTP depuis `client`, et vérifiez que `interdit` reste refusé si les politiques du chapitre 9 sont actives. Écrivez ensuite la cause, l'effet, la correction et la prévention dans le journal d'incident. La preuve attendue comprend les résultats observés et leur heure, pas seulement la liste des commandes.

</details>


<a id="certification"></a>
<a id="chapitre-22"></a>

## 22. Préparer la CKA par la pratique

**En bref.** Lire ce guide prépare les **explications** ; administrer, vérifier puis réparer un laboratoire prépare les **gestes**. Ce chapitre relie les objectifs officiels de la CKA aux chapitres et aux ateliers, propose un test de positionnement, un plan de travail, 16 ateliers, deux examens blancs originaux et leurs corrigés. Aucun résultat de certification n'est garanti.

### 22.1 Référentiel vérifié et limites du parcours

La **Certified Kubernetes Administrator (CKA)** est le parcours principal ; les exercices de développement (CKAD) et de spécialisation sécurité (CKS) restent séparés (§22.6).

**Vérification documentaire du 16 octobre 2026 :**

- les pages Linux Foundation, ouvertes directement, annoncent Kubernetes **1.37 pour CKA et CKAD**, **1.35 pour CKS** (un extrait de moteur de recherche indiquant encore 1.35 pour la CKA n'a pas été retenu) ;
- les programmes CNCF disponibles se nomment `CKA_Curriculum_v1.37.pdf`, `CKAD_Curriculum_v1.37.pdf` et `CKS_Curriculum v1.34.pdf`.

Version du programme, version de l'environnement d'examen et version du laboratoire sont **trois informations différentes**. Sources : [instructions CKA/CKAD](https://docs.linuxfoundation.org/tc-docs/certification/tips-cka-and-ckad), [FAQ](https://docs.linuxfoundation.org/tc-docs/certification/faq-cka-ckad-cks), [programmes CNCF](https://github.com/cncf/curriculum).

:::caution[Laboratoire 1.35 ≠ environnement d'examen 1.37]
Le laboratoire principal reste en Kubernetes **1.35.8** : il ne démontre pas la compatibilité avec l'environnement CKA 1.37. Avant l'examen, reconstruisez un **laboratoire distinct** sur la version annoncée, vérifiez les API et reprenez les ateliers. Ne montez pas le laboratoire 1.35 directement en 1.37 : kubeadm impose les versions intermédiaires et les compatibilités des extensions.
:::

| Domaine CKA 1.37 | Poids | Priorité d'entraînement |
|---|---:|---|
| Architecture, installation et configuration | 25 % | kubeadm, cycle de vie, RBAC, extensions |
| Workloads et placement | 15 % | Déploiement, ressources, autoscaling |
| Services et réseau | 20 % | DNS, Services, politiques, exposition |
| Stockage | 10 % | PV/PVC, classes, modes, rétention |
| Diagnostic | 30 % | Preuves, correction minimale, vérification |

Ces poids viennent du [programme officiel CKA](https://github.com/cncf/curriculum/blob/master/CKA_Curriculum_v1.37.pdf), publié par la CNCF sous CC BY 4.0. La matrice suivante en reformule les **27 objectifs** ; ce n'est pas une banque de sujets. La reprise etcd, la restauration des données métier et les SLO sont des approfondissements d'exploitation : le programme actuel ne nomme pas explicitement de tâche de sauvegarde/restauration etcd. Leur utilité opérationnelle justifie leur présence, sans prétendre prédire les questions.

### 22.2 Matrice exhaustive des objectifs CKA

Chaque atelier A01 à A16 a un énoncé autonome ([§22.7](#enonces), aussi dans `exercices/enonces.md` du dossier associé) et un corrigé séparé ([§22.8](#corriges), aussi dans `corriges/corriges.md`). Un objectif associé à plusieurs chapitres se travaille dans chacun ; « couvert » signifie documenté, pas exécuté ni acquis.

| Objectif officiel, reformulé en français | Chapitre(s) du guide | Atelier | Compétence vérifiée |
|---|---|---|---|
| Gérer les autorisations RBAC | 15 Sécurité | A05 | Une identité lit les Pods et ne lit pas les Secrets |
| Préparer l'infrastructure de cluster | 2 Prérequis ; 3 Laboratoires ; 16 Administration | A13 | Runtime, réseau, horloge et ressources vérifiés |
| Créer et gérer un cluster avec kubeadm | 3 Laboratoires ; 16 Administration | A13 | Initialiser un control plane et joindre un worker |
| Gérer le cycle de vie du cluster | 16 Administration | A14 | Préparer une mise à niveau et vérifier les nœuds |
| Mettre en place un control plane hautement disponible | 4 Architecture ; 16 Administration ; 19 etcd | A16 | Décrire et tester endpoint, quorum et panne d'un membre |
| Installer des composants avec Helm et Kustomize | 14 Gestion déclarative ; 18 Industrialisation | A11 | Rendre, inspecter et installer une version choisie |
| Comprendre les interfaces d'extension CNI, CSI, CRI | 4 Architecture ; 9 Réseau ; 11 Stockage ; 16 Administration | A09, A13 | Relier une panne au bon contrat et à son implémentation |
| Comprendre les CRD et installer/configurer des Operators | 16 Administration ; 18 Industrialisation | A11 | Distinguer CRD, ressource personnalisée et contrôleur |
| Réaliser des déploiements, mises à jour et retours arrière | 7 Workloads ; 13 Résilience | A03 | Modifier puis restaurer une révision vérifiée |
| Configurer les applications avec ConfigMaps et Secrets | 10 Configuration | A04 | Injecter une valeur et expliquer son actualisation |
| Configurer l'autoscaling des workloads | 8 Placement ; 17 Observabilité | A06 | HPA avec métriques et requests cohérentes |
| Construire des déploiements robustes autoréparables | 6 Pods ; 7 Workloads ; 13 Résilience | A02, A03 | Séparer redémarrage, remplacement et disponibilité |
| Configurer admission et placement des Pods | 8 Placement ; 15 Sécurité | A06 | Expliquer Pending et corriger la contrainte nécessaire |
| Comprendre les communications entre Pods | 9 Réseau | A07 | Tester IP, port, DNS et chemin réseau séparément |
| Définir et appliquer des NetworkPolicies | 9 Réseau ; 15 Sécurité | A08 | Prouver flux autorisé et refusé avec un CNI compatible |
| Utiliser ClusterIP, NodePort, LoadBalancer et endpoints | 9 Réseau | A07, A10 | Vérifier sélection, EndpointSlices et mécanisme d'exposition |
| Gérer le trafic entrant avec Gateway API | 12 Exposition HTTP/TLS | A10 | Vérifier Gateway et HTTPRoute, conditions et réponse HTTP |
| Utiliser contrôleurs et objets Ingress | 12 Exposition HTTP/TLS | A10 | Lier classe, règle, contrôleur et backend |
| Comprendre et utiliser CoreDNS | 9 Réseau | A07 | Distinguer nom erroné, DNS et filtrage réseau |
| Mettre en œuvre classes et provisionnement dynamique | 11 Stockage | A09 | Relier StorageClass, provisioner, PVC et volume |
| Configurer volumes, modes d'accès et récupération | 11 Stockage ; 20 Reprise applicative | A09 | Justifier RWO/RWOP et Retain/Delete |
| Gérer PV et PVC | 11 Stockage | A09 | Monter un PVC puis vérifier la persistance |
| Diagnostiquer clusters et nœuds | 16 Administration ; 21 Diagnostic | A12, A14 | Distinguer pression, kubelet et connectivité |
| Diagnostiquer les composants du cluster | 17 Observabilité ; 19 etcd ; 21 Diagnostic | A12, A15 | Croiser journaux, certificats et santé du control plane |
| Surveiller ressources du cluster et applications | 17 Observabilité | A06, A12 | Expliquer une métrique avec son périmètre et ses limites |
| Gérer et interpréter les sorties des conteneurs | 6 Pods ; 17 Observabilité ; 21 Diagnostic | A12 | Lire flux courants/précédents avant correction |
| Diagnostiquer Services et réseau | 9 Réseau ; 12 Exposition ; 21 Diagnostic | A07, A08, A10 | Isoler DNS, endpoints, ports, politiques et HTTP/TLS |

### 22.3 Test de positionnement pratique

**Durée indicative :** 45 minutes sur le laboratoire léger reconstruit ; documentation autorisée. **Notation par tâche :** 0 si non réalisée, 1 si réalisée avec aide, 2 si réalisée **et expliquée** sans corrigé. Consignez les preuves, pas seulement une autoévaluation.

1. Retrouver contexte, namespace, version du serveur et nœuds, sans modifier le cluster.
2. Décrire le chemin Deployment → ReplicaSet → Pod ; montrer une ownerReference réelle.
3. Appliquer le workload web et expliquer ses requests, limites et probes.
4. Expliquer pourquoi un Service dont le selector est erroné ne répond pas.
5. Accorder à un ServiceAccount la lecture des Pods et prouver le refus de lire les Secrets.
6. Expliquer un PVC `Pending` à partir de ses événements et de sa StorageClass.
7. Corriger un Pod `Pending` sans supprimer arbitrairement toutes les contraintes.
8. Montrer où chercher les journaux d'un conteneur qui a redémarré.
9. Calculer le quorum de trois, puis de cinq membres etcd ; citer une donnée absente d'etcd.
10. Décrire une maintenance de worker avec PDB, capacité, drain et retour en service.

| Score sur 20 | Suite conseillée |
|---|---|
| 0 à 7 | Reprendre les prérequis et A01–A05 |
| 8 à 14 | Pratiquer A06–A12 et refaire les tâches faibles |
| 15 à 20 | Entreprendre A13–A16, puis les examens blancs |

Ces seuils organisent le travail ; ils ne prédisent pas une note CKA. Éléments de réponse : [§22.8](#reponses-positionnement).

### 22.4 Plan adaptable et fiches de révision

**Une séance utile :** 15 minutes de rappel, 40 à 60 minutes de manipulation, 15 minutes de diagnostic et de compte rendu. Refaites l'atelier quelques jours plus tard, depuis un état propre, en changeant noms ou contraintes. Si les prérequis Linux ou réseau bloquent, réduisez le nombre de sujets par séance — jamais les contrôles.

| Étape | Parcours débutant (≈ 8 semaines) | Parcours administrateur (≈ 4 semaines) | Critère de passage |
|---|---|---|---|
| Fondations | Semaines 1–2 : chapitres 2–7, A01–A04 | Semaine 1 : test, puis lacunes | Expliquer et reconstruire le workload |
| Services et sécurité | Semaines 3–4 : A05–A09 | Semaine 2 : A05–A12 | Prouver flux et droits, positifs et négatifs |
| Administration | Semaines 5–6 : A10–A16 | Semaine 3 : A13–A16 | Documenter maintenance et reprise |
| Consolidation | Semaines 7–8 : laboratoire à la version de l'examen, deux blancs | Semaine 4 : même exigence | Corriger ses erreurs sur un nouveau scénario |

**Fiches de révision**

| Fiche | L'essentiel |
|---|---|
| **Contexte** | Relire hôte, contexte, namespace et nom de fichier avant chaque mutation. Un alias rapide ne remplace pas le contexte demandé. Lire `kubectl explain` et les schémas de la version cible. |
| **Déploiement** | Distinguer image, commande, configuration, ressources, placement, admission, readiness et liveness. Une disponibilité se mesure par une requête réelle ; `Running` ne suffit pas. Préserver les journaux avant suppression. |
| **Réseau** | Tester dans l'ordre : processus/port, IP du Pod, EndpointSlice, Service, nom DNS, politique, contrôleur HTTP/TLS. Un LoadBalancer exige une implémentation ; une HTTPRoute, des CRD et un contrôleur. Sans test négatif, une politique n'est pas démontrée. |
| **Stockage** | Décrire provisioner, liaison, mode d'accès, topologie, politique de rétention et sauvegarde métier. RWO signifie un nœud ; `replicas: 3` ne crée aucune réplication applicative. |
| **Administration** | Vérifier matrice de versions, santé et sauvegarde avant maintenance. Distinguer panne d'un membre etcd, perte de quorum et restauration d'un nouveau cluster logique. RPO = perte de données tolérée ; RTO = durée cible, à mesurer. |

**À expliquer à voix haute :** qui redémarre un conteneur ? Pourquoi une readiness peut-elle retirer un endpoint sans redémarrer le Pod ? Pourquoi un drain peut-il attendre ? Une RoleBinding peut-elle limiter une ClusterRole à un namespace ? Pourquoi un snapshot etcd ne contient-il pas une base métier stockée sur un PVC ? Pourquoi les caches Kubernetes comptent-ils lors d'une restauration ?

### 22.5 Conditions d'examen et entraînement chronométré

**Format décrit par les pages LF consultées :** épreuve CKA pratique sous Linux, deux heures, 15 à 20 tâches ; seuil de réussite annoncé par la FAQ : 66 %. C'est un instantané documentaire : relisez les pages et la checklist du candidat avant la réservation et à l'approche de l'épreuve. [Instructions](https://docs.linuxfoundation.org/tc-docs/certification/tips-cka-and-ckad), [FAQ](https://docs.linuxfoundation.org/tc-docs/certification/faq-cka-ckad-cks).

**Environnement :** chaque tâche demande de rejoindre par SSH l'hôte indiqué, puis de revenir à `base` ; les SSH imbriqués ne sont pas pris en charge. Ne redémarrez pas `base`. Entraînez-vous à identifier l'hôte et à travailler dans un terminal Linux, même si votre poste est sous Windows. La checklist technique et les règles de surveillance se vérifient dans le portail officiel.

**Ressources autorisées pour la CKA :** documentation et blog Kubernetes, documentation Helm, documentation Gateway API, et les références fournies dans chaque tâche, consultées dans l'environnement prévu. La recherche interne de la documentation Kubernetes est autorisée, pas ses résultats externes ; documents installés et paquets de distribution sont aussi mentionnés. La page officielle fait autorité. **Ce guide, les corrigés, un assistant et un moteur de recherche externe n'en font pas partie.** [Ressources autorisées](https://docs.linuxfoundation.org/tc-docs/certification/certification-resources-allowed).

**Pour chaque examen blanc :** lisez toutes les tâches, réservez du temps aux contrôles, signalez une dépendance absente au lieu de simuler un résultat, puis notez la cause de chaque erreur et le temps passé. Les deux blancs sont **originaux**, conçus pour ce guide : ils ne reproduisent aucune question divulguée et ne préjugent ni du nombre ni de la difficulté des tâches réelles.

### 22.6 Compléments CKAD et CKS, distincts de la CKA

**CKAD.** Le [programme CNCF 1.37](https://github.com/cncf/curriculum/blob/master/CKAD_Curriculum_v1.37.pdf) répartit les domaines ainsi : conception et construction 20 %, déploiement 20 %, observabilité et maintenance 15 %, environnement/configuration/sécurité 25 %, Services et réseau 20 %. À approfondir : construction d'images, patterns multiconteneurs, volumes éphémères, stratégies canary et blue-green, Jobs/CronJobs, dépréciations d'API. A01–A12 fournissent une base commune, pas une couverture complète. L'environnement annoncé est 1.37 ; les procédures kubeadm ne sont pas le cœur du parcours développeur.

**CKS.** La [fiche LF](https://training.linuxfoundation.org/certification/certified-kubernetes-security-specialist/) et le [PDF CNCF nommé 1.34](https://github.com/cncf/curriculum/blob/master/CKS_Curriculum%20v1.34.pdf) concordent : mise en place 15 %, durcissement du cluster 15 %, durcissement du système 10 %, vulnérabilités des microservices 20 %, chaîne logicielle 20 %, surveillance/journaux/sécurité d'exécution 20 %. La [page README CKS](https://github.com/cncf/curriculum/tree/master/cks) affiche au contraire 10 % pour la mise en place et 15 % pour le système : **divergence non résolue**, à recontrôler avant de planifier. FAQ et fiche LF annoncent un environnement **1.35** ; ne renommez pas arbitrairement le PDF « 1.35 ».

La CKS exige d'avoir **réussi la CKA** selon la FAQ LF. Le chapitre 15 prépare RBAC, admission, secrets et sécurité des Pods ; complétez avec CIS, durcissement Linux, sandbox, chiffrement entre Pods, SBOM, signatures et provenance, analyse d'images, audit et détection à l'exécution. Le guide ne prétend pas couvrir tous ces outils ni les avoir testés. La liste de ressources autorisées CKS diffère de celle de la CKA. [FAQ et prérequis](https://docs.linuxfoundation.org/tc-docs/certification/faq-cka-ckad-cks), [ressources par examen](https://docs.linuxfoundation.org/tc-docs/certification/certification-resources-allowed).

:::tip[À retenir]
La preuve d'acquisition est une action **expliquée, vérifiée et reproductible**. Conservez le manifeste final, les contrôles et une courte analyse d'incident ; ne recopiez jamais de jetons ni de Secrets dans votre carnet d'apprentissage.
:::

<a id="enonces"></a>

### 22.7 Énoncés des ateliers et examens blancs

Cette section permet l'entraînement autonome. Les solutions sont au [§22.8](#corriges) (et dans `corriges/corriges.md`) : ne les ouvrez pas pendant un blanc. Les questions sont originales. Aucun atelier n'a été exécuté dans l'environnement de rédaction : notez vos propres résultats, versions et limites.

#### Contrat commun

| Élément | Valeur |
|---|---|
| Dossier | Racine `refonte-kubernetes-etcd` |
| Terminal | **Bash du poste d'administration Linux/WSL** pour les commandes applicatives |
| Cible applicative | Contexte **`kind-formation`**, namespace **`atelier`**, **`Deployment/web`**, conteneur **`app`**, Service **`web`** (port 80 → 8080) |
| Commandes d'hôte | Indiquent explicitement **control plane** ou **worker**, avec SSH et sudo du laboratoire kubeadm |

Les deux environnements ne sont pas interchangeables.

**Avant A01–A12 :** reconstruisez le laboratoire léger (chapitre 3), résolvez les images en digests et appliquez l'overlay `manifests/overlays/lab` (chapitre 14). Dépendances particulières : A08 exige Calico fonctionnel et ses tests préalables ; A06, Metrics Server pour la partie HPA ; A09, la StorageClass du laboratoire ; A10, les contrôleurs du chapitre 12 ; A11 ajoute un composant optionnel. Si une dépendance manque, préparez-la ou consignez « non exécuté ».

**Après chaque atelier :** exportez uniquement les manifests non sensibles, conservez preuves et diagnostic, puis réappliquez l'overlay connu. Supprimez séparément les objets ajoutés : `apply` ne supprime pas les objets absents du dépôt. Les ateliers sensibles A13–A16 sont réservés aux VM jetables du chapitre 3 ; conservez les points de restauration prévus. Ne réutilisez jamais un kubeconfig de production.

#### A01 — Se repérer et déployer (20 min)

- **Objectif :** identifier précisément la cible et utiliser le déclaratif.
- **Environnement :** laboratoire léger sain.
- **Énoncé :** relever versions et nœuds, déployer le web du guide, identifier ses contrôleurs et obtenir une réponse HTTP.
- **Contraintes :** contexte explicite ; aucune permission supplémentaire ; conserver les digests.
- **Indices :** 1. lire la configuration de kubectl ; 2. examiner les ownerReferences et les EndpointSlices.
- **Contrôles à livrer :** contexte, namespace, rollout terminé, réponse HTTP, explication du chemin requête → Pod.
- **Remise en état :** garder la base saine pour A02. → [Corrigé A01](#corrige-a01)

#### A02 — Redémarrage et remplacement (20 min)

- **Objectif :** observer la réconciliation.
- **Environnement :** A01, trois réplicas prêts.
- **Énoncé :** relever UID et compteur de redémarrages ; supprimer un seul Pod web ; observer le remplacement et la continuité HTTP. Comparer, sur le principe, avec l'arrêt du processus d'un conteneur.
- **Contraintes :** ne pas supprimer le Deployment ; ne promettre aucun délai fixe ; garder une trace horodatée.
- **Indices :** 1. observer **avant** d'agir ; 2. comparer UID et ownerReferences.
- **Contrôles :** nouveaux UID, nombre final de Pods, requêtes réussies et échouées.
- **Remise en état :** attendre le retour des trois réplicas. → [Corrigé A02](#corrige-a02)

#### A03 — Réparer une mise à jour (30 min)

- **Objectif :** diagnostiquer une readiness et revenir à une révision saine.
- **Environnement :** A01.
- **Énoncé :** injecter une readiness HTTP sur `/absent-atelier`, observer les nouveaux Pods non prêts, puis restaurer le service et réconcilier Git.
- **Contraintes :** conserver logs et événements ; ne pas modifier l'image ; distinguer readiness et liveness ; ne pas effacer l'historique pour masquer l'incident.
- **Indices :** 1. inspecter les événements du nouveau Pod ; 2. comparer les révisions.
- **Contrôles :** ancienne et nouvelle révision, raison de l'échec, `/ready` ou endpoint réel du manifeste sain, retour HTTP.
- **Remise en état :** réappliquer la source saine. → [Corrigé A03](#corrige-a03)

#### A04 — Configurer sans divulguer (25 min)

- **Objectif :** distinguer configuration, secret et mise à jour.
- **Environnement :** A01.
- **Énoncé :** modifier `index.html` du ConfigMap web, expliquer la propagation du montage, créer un Secret contenant exclusivement une donnée factice et l'injecter dans un Pod de démonstration.
- **Contraintes :** aucune valeur sensible dans Git ni dans le compte rendu ; aucun droit cluster-admin ajouté.
- **Indices :** 1. comparer volume et variable d'environnement ; 2. vérifier `subPath`.
- **Contrôles :** page modifiée, présence de la variable **sans afficher sa valeur**, explication d'un éventuel redémarrage.
- **Remise en état :** supprimer le Secret et le Pod de démonstration, restaurer le ConfigMap. → [Corrigé A04](#corrige-a04)

#### A05 — Badges d'accès RBAC (25 min)

- **Objectif :** appliquer le moindre privilège.
- **Environnement :** laboratoire léger ; identité d'administration autorisée à créer Role/RoleBinding et à faire de l'impersonation.
- **Énoncé :** donner à `ServiceAccount/lecteur` le droit de lire, lister et observer les Pods d'`atelier`.
- **Contraintes :** aucun droit sur les Secrets, aucun droit dans un autre namespace, aucun rôle global accordé par commodité.
- **Indices :** 1. vérifier le groupe API des Pods ; 2. tester les verbes autorisés **et** refusés.
- **Contrôles :** trois réponses positives pertinentes et au moins deux négatives.
- **Remise en état :** supprimer seulement les trois objets créés. → [Corrigé A05](#corrige-a05)

#### A06 — Placement et autoscaling (35 min)

- **Objectif :** expliquer un Pending, puis un HPA.
- **Environnement :** léger, Metrics Server pour le HPA.
- **Énoncé :** imposer au web une sélection de nœud sur un label inexistant ; préserver les preuves, puis corriger la contrainte. Configurer ensuite un HPA de 2 à 4 réplicas, cible CPU 60 %.
- **Contraintes :** ne pas supprimer les taints système ; requests CPU explicites ; ne pas affirmer d'autoscaling sans métriques.
- **Indices :** 1. lire les événements de scheduling ; 2. examiner les conditions du HPA.
- **Contrôles :** raison du Pending, placement rétabli, métrique disponible ou limite consignée.
- **Remise en état :** supprimer le HPA, rétablir l'overlay. → [Corrigé A06](#corrige-a06)

#### A07 — Service et DNS en panne (30 min)

- **Objectif :** isoler sélection, ports et résolution.
- **Environnement :** léger, avec les clients du guide.
- **Énoncé :** remplacer temporairement le selector du Service web par `app: introuvable`, constater l'échec depuis un client, puis corriger en conservant la ClusterIP et le port 80. Tester séparément le nom DNS et l'accès HTTP.
- **Contraintes :** ne pas redéployer les Pods sains ; aucune adresse IP codée en dur.
- **Indices :** 1. comparer labels et selectors ; 2. lire EndpointSlices et configuration DNS.
- **Contrôles :** DNS répond, endpoints prêts, HTTP fonctionne.
- **Remise en état :** Service conforme au fichier source. → [Corrigé A07](#corrige-a07)

#### A08 — Isolation réseau prouvée (35 min)

- **Objectif :** démontrer l'application des politiques.
- **Environnement :** léger, Calico, deux clients distingués par leurs labels.
- **Énoncé :** partir d'un accès autorisé pour les deux ; appliquer le refus par défaut, puis DNS, puis le seul flux client autorisé → web.
- **Contraintes :** limiter les flux aux ports utiles ; protéger DNS en UDP et TCP ; ne pas désactiver les politiques pour réussir le test.
- **Indices :** 1. lire la combinaison namespaceSelector/podSelector ; 2. une ouverture additive ne retire aucune permission existante.
- **Contrôles :** accès initial, refus après isolation, DNS et client autorisé positifs, client non autorisé négatif.
- **Remise en état :** supprimer uniquement les politiques de cet atelier. → [Corrigé A08](#corrige-a08)

#### A09 — Persistance et modes d'accès (35 min)

- **Objectif :** distinguer persistance et sauvegarde.
- **Environnement :** léger, StorageClass fonctionnelle.
- **Énoncé :** créer un PVC de 256 Mi, le monter dans un Pod, écrire un marqueur, remplacer le Pod, puis relire le marqueur. Comparer RWO et RWOP ; identifier le provisioner réellement présent et la politique de récupération.
- **Contraintes :** aucun PV métier ; ne pas supprimer le PVC avant le contrôle ; ne pas appeler « CSI » un provisioner local qui ne l'est pas.
- **Indices :** 1. lire `volumeBindingMode` et les événements ; 2. distinguer Pod et nœud.
- **Contrôles :** liaison, relecture, limites en cas de perte du nœud.
- **Remise en état :** supprimer le Pod, puis le PVC jetable en acceptant sa perte. → [Corrigé A09](#corrige-a09)

#### A10 — Exposition HTTP : API et contrôleur (40 min)

- **Objectif :** relier objets, contrôleur et trafic.
- **Environnement :** parcours optionnel du chapitre 12 préparé et versionné.
- **Énoncé :** exposer web avec Gateway/HTTPRoute ; lire les conditions de statut et tester avec le Host attendu. Faire séparément le parcours Ingress Traefik 41.7.1 / Proxy 3.7.15, avec sa classe non définie par défaut et son TLS local. Comparer avec NodePort et expliquer le prérequis d'un LoadBalancer.
- **Contraintes :** ne pas réinstaller l'Ingress NGINX retiré ; aucun DNS ni certificat public ; contrôleurs distincts.
- **Indices :** 1. une CRD n'est pas un contrôleur ; 2. lire `Accepted`, `Programmed` et `ResolvedRefs`.
- **Contrôles :** HTTP/TLS réels, statuts, classe, backend correct.
- **Remise en état :** retirer routes et exposition de test. → [Corrigé A10](#corrige-a10)

#### A11 — Helm, Kustomize et Operator (45 min)

- **Objectif :** étendre l'API et constater la réconciliation.
- **Environnement :** léger jetable, Helm 4.2.3, accès au registre OCI ; cert-manager v1.21.2 optionnel.
- **Énoncé :** rendre un overlay Kustomize, inspecter puis installer le chart versionné cert-manager ; créer un Issuer SelfSigned local et un Certificate `atelier.local`. Expliquer **qui** génère le Secret TLS.
- **Contraintes :** ni ACME ni clé de production ; inspecter permissions, webhooks et images ; verrouiller les images du rendu avant application.
- **Indices :** 1. une CRD décrit un type ; 2. le contrôleur agit sur ses instances.
- **Contrôles :** CRD `Established`, contrôleurs prêts, Certificate `Ready` et Secret de type TLS, sans afficher sa clé.
- **Remise en état :** supprimer les instances, puis désinstaller proprement. → [Corrigé A11](#corrige-a11)

#### A12 — Diagnostic avec preuves (35 min)

- **Objectif :** diagnostiquer sans redémarrage aveugle.
- **Environnement :** A01, Metrics Server pour les métriques.
- **Énoncé :** provoquer un ImagePullBackOff avec un tag volontairement inexistant ; collecter état, événements, logs disponibles et métriques ; restaurer la référence d'image verrouillée. Examiner aussi un ancien conteneur redémarré s'il existe.
- **Contraintes :** ne pas inventer de logs pour un conteneur jamais démarré ; ne pas conclure à un OOM sur le seul code 137.
- **Indices :** 1. examiner `waiting`, `terminated` et `lastState` ; 2. le registre peut être indisponible indépendamment du tag.
- **Contrôles :** preuve de la cause, correction minimale, rollout et HTTP.
- **Remise en état :** source connue et saine. → [Corrigé A12](#corrige-a12)

#### A13 — Construire avec kubeadm (60–120 min)

- **Objectif :** installer un cluster et expliquer CRI et CNI.
- **Environnement :** VM neuves du chapitre 3, accès SSH/sudo, version 1.35.8 ; aucun cluster préexistant.
- **Énoncé :** exécuter les précontrôles, initialiser le control plane, installer le réseau, puis joindre un worker (§3.4 et 3.5 ; ajout de worker au §16.2).
- **Contraintes :** chaque commande sur le bon hôte ; tokens jamais publiés ; contrôle du hash de CA ; aucun `reset` d'un hôte existant.
- **Indices :** 1. distinguer runtime et CNI ; 2. interpréter NotReady avant et après le CNI.
- **Contrôles :** versions, nœuds Ready, CoreDNS, Pod inter-nœuds et HTTP.
- **Remise en état :** destruction des seules VM jetables, par l'hyperviseur. → [Corrigé A13](#corrige-a13)

#### A14 — Maintenir sans retirer toute capacité (45 min)

- **Objectif :** pratiquer une éviction maîtrisée et préparer le cycle de vie.
- **Environnement :** kubeadm, au moins deux workers avec capacité libre, web avec PDB.
- **Énoncé :** sauvegarder, relever les placements, `cordon`/`drain` d'un worker, vérifier HTTP, puis `uncordon`. Préparer un plan de mise à niveau mineure avec les versions des paquets et du CNI.
- **Contraintes :** aucun contournement du PDB ; aucun saut de version mineure ; ne pas exécuter une cible non choisie et vérifiée.
- **Indices :** 1. une éviction bloquée peut être correcte ; 2. vérifier DaemonSets et données `emptyDir`.
- **Contrôles :** événements, disponibilité mesurée, worker Ready et planifiable, plan motivé.
- **Remise en état :** worker et placements sains. → [Corrigé A14](#corrige-a14)

#### A15 — Reprendre etcd (60–120 min)

- **Objectif :** exécuter une reprise mesurée, avec des révisions cohérentes.
- **Environnement :** **clone jetable kubeadm à un seul control plane**, procédure complète du chapitre 19, sauvegarde hors VM.
- **Énoncé :** créer un objet témoin, sauvegarder, créer un second objet après le snapshot, simuler la perte, puis restaurer.
- **Contraintes :** arrêter les consommateurs prévus ; ne pas généraliser cette procédure à trois membres ; protéger certificats et snapshot ; inclure *revision bump* et *mark-compacted*.
- **Indices :** 1. relever les chemins réels du manifeste etcd ; 2. un nouveau cluster logique exige des identités cohérentes.
- **Contrôles :** empreinte du fichier, santé, témoin d'avant présent, objet d'après absent, nouvel objet créé, RPO/RTO mesurés.
- **Remise en état :** conserver les preuves, puis détruire le clone — pas la sauvegarde de référence. → [Corrigé A15](#corrige-a15)

#### A16 — Tester un control plane à trois membres (60–120 min)

- **Objectif :** vérifier la tolérance à une panne sans confondre les couches.
- **Environnement :** topologie optionnelle à trois control planes, etcd empilé, endpoint partagé (§3.6).
- **Énoncé :** construire la topologie, relever membres et leader, interrompre **une seule** VM control plane, puis créer et lire un objet via l'endpoint partagé. Rétablir la VM.
- **Contraintes :** ne jamais arrêter deux membres ; disposer d'une sauvegarde et des consoles des VM ; aucune partition réseau improvisée.
- **Indices :** 1. calculer la majorité ; 2. tester séparément le répartiteur et l'API.
- **Contrôles :** quorum restant, API utilisable, retour et synchronisation du membre.
- **Limite :** un répartiteur unique reste un point de panne.
- **Remise en état :** trois membres sains. → [Corrigé A16](#corrige-a16)

#### Examen blanc 1 — Application et diagnostic (90 min, 100 points)

**Environnement :** laboratoire léger vierge, dépendances A01–A12 préparées ; contexte `kind-formation`, namespace `blanc-app` à créer. Mêmes images verrouillées et contrôleurs que le guide ; adaptez les manifests pour isoler le namespace. **Contraintes :** ne pas ouvrir les corrigés ; rester dans les ressources autorisées CKA ; consigner les validations ; supprimer ce namespace à la fin, en acceptant la perte des données de test. **Indice unique :** un statut d'objet ne remplace pas une requête réelle.

| # | Tâche | Points |
|---:|---|---:|
| 1 | Déployer trois réplicas web non-root, avec requests/limits, probes et Service port 80 | 20 |
| 2 | Donner à `lecteur` la lecture seule des Pods ; prouver le refus des Secrets et des écritures | 15 |
| 3 | Réparer un Service dont le selector a été altéré par le formateur, sans recréer le workload | 15 |
| 4 | Appliquer refus par défaut, DNS et seul client autorisé ; démontrer le refus d'un second client | 20 |
| 5 | Écrire puis relire un marqueur sur PVC après remplacement du Pod | 10 |
| 6 | Exposer par HTTPRoute ; vérifier les conditions et le Host | 10 |
| 7 | Diagnostic argumenté d'un échec d'image, avec le manifeste final corrigé | 10 |

Chaque tâche est notée sur le résultat **vérifié** ; au plus la moitié des points si la configuration est cohérente sans preuve de fonctionnement. Une permission excessive invalide la tâche RBAC ; une politique non appliquée invalide la démonstration de sécurité. Injections et grille détaillée : [corrigé des blancs](#corrige-blancs).

#### Examen blanc 2 — Administration et reprise (120 min, 100 points)

**Environnement :** VM kubeadm déjà initialisées, deux workers, clone à un seul control plane séparé pour etcd ; snapshots et versions consignés. **Contraintes :** commandes sur l'hôte prescrit, aucune action sur un autre cluster, aucune valeur secrète dans le rapport. **Indice unique :** préserver les preuves avant de corriger. La suppression finale concerne uniquement les VM et objets identifiés du blanc.

| # | Tâche | Points |
|---:|---|---:|
| 1 | Joindre un worker neuf après vérification du runtime, du réseau, du token et de la CA | 15 |
| 2 | Installer/configurer l'Operator d'A11, attendre un Certificate local prêt et identifier les ressources créées | 15 |
| 3 | Préparer et réaliser une maintenance avec drain/PDB et mesure HTTP ; remettre le worker en service | 20 |
| 4 | Diagnostiquer une panne kubelet injectée sur un seul worker ; conserver journal et état, puis corriger | 20 |
| 5 | Produire un plan de mise à niveau valide : ordre des composants, sauvegarde, compatibilités, contrôles | 10 |
| 6 | Sur le clone séparé, restaurer un snapshot etcd avec les contrôles d'A15 et mesurer RPO/RTO | 20 |

Le snapshot remis au jury est une preuve **protégée**, jamais un fichier à publier. Une restauration sans contrôle des témoins ni création d'un nouvel objet n'obtient pas les points de reprise. Reprenez ensuite les tâches échouées avec une variante ; ne déduisez pas une réussite CKA du seul score local.

<a id="corriges"></a>

### 22.8 Corrigés expliqués

:::caution[Entraînez-vous d'abord avec les énoncés seuls]
Chaque corrigé est replié : ouvrez-le **après** votre essai. Les commandes sont des procédures à exécuter, **pas des résultats observés** ; aucun atelier n'a été testé en cluster lors de la rédaction. Un corrigé n'est réussi que si ses contrôles réels passent.
:::

#### Préparation commune des corrigés applicatifs

**Poste d'administration, Bash Linux/WSL, racine `refonte-kubernetes-etcd`.** A01–A12 ciblent exclusivement le laboratoire léger. Ce bloc charge les références d'images réellement résolues (si `images.lock.json` manque, suivez d'abord le chapitre 14) et définit deux raccourcis :

- `k` : kubectl sur `kind-formation`, namespace `atelier` ;
- `http_web` : requête HTTP vers web depuis le Pod `client`.

Les clients `Deployment/client` et `Deployment/interdit` sont ceux de l'overlay.

```bash title="Poste d'administration · définitions communes, dans chaque nouveau terminal"
set -Eeuo pipefail
k() { kubectl --context kind-formation -n atelier "$@"; }
WEB_IMAGE=$(python3 -c 'import json; print(next(x["reference"] for x in json.load(open("images.lock.json"))["images"] if x["name"]=="nginxinc/nginx-unprivileged"))')
BUSYBOX_IMAGE=$(python3 -c 'import json; print(next(x["reference"] for x in json.load(open("images.lock.json"))["images"] if x["name"]=="busybox"))')
http_web() { k exec deploy/client -- curl -fsS --connect-timeout 2 --max-time 5 http://web/; }
```

En saisie interactive, `set -Eeuo pipefail` fermerait le terminal à la première commande en échec : omettez cette ligne si vous tapez les commandes à la main, ou exécutez chaque corrigé comme script.

Un code retour 0 de `curl` **et** le contenu attendu constituent la preuve HTTP. Un délai dépassé ne prouve un filtrage que si le service fonctionne depuis le client autorisé et qu'un accès de référence avait réussi. Nettoyez les objets supplémentaires de chaque atelier avant de réappliquer la base : un HPA ou une NetworkPolicy oublié fausserait le suivant.

<a id="corrige-a01"></a>

<details>
<summary>A01 — Corrigé : cible, contrôleurs et HTTP</summary>

**Poste d'administration.** Lire la cible avant toute mutation, puis appliquer le rendu verrouillé.

```bash title="Poste d'administration · fonction k"
kubectl config get-contexts kind-formation
k version
k get nodes -o wide
k apply -k manifests/overlays/lab
k rollout status deploy/web --timeout=180s
k get deploy,rs,pod,svc,endpointslice -o wide
k get pods -l app=web -o jsonpath='{range .items[*]}{.metadata.name}{" "}{.metadata.ownerReferences[0].kind}{"/"}{.metadata.ownerReferences[0].name}{"\n"}{end}'
http_web
```

**Explication :** le Pod appartient à un ReplicaSet, qui appartient au Deployment. Le Service sélectionne les **Pods**, pas le Deployment. Le control plane matérialise l'état souhaité ; le kubelet exécute les conteneurs. Un rollout terminé ne remplace pas le test HTTP.

</details>

<a id="corrige-a02"></a>

<details>
<summary>A02 — Corrigé : comparer les identités</summary>

**Poste d'administration.** Dans un second terminal, observez `k get pods -l app=web -w` (redéfinissez-y la fonction `k`). Dans le premier :

```bash title="Poste d'administration · fonction k"
k get pods -l app=web -o wide
k get pods -l app=web -o json > /tmp/a02-avant.json
POD=$(k get pods -l app=web -o jsonpath='{.items[0].metadata.name}')
for i in $(seq 1 30); do date -u +%FT%TZ; http_web || true; sleep 1; done > /tmp/a02-http.txt &
OBSERVER_PID=$!
k delete pod "$POD" --wait=false
wait "$OBSERVER_PID"
k rollout status deploy/web --timeout=180s
k get pods -l app=web -o json > /tmp/a02-apres.json
k get pods -l app=web -o custom-columns=NAME:.metadata.name,UID:.metadata.uid,RESTARTS:.status.containerStatuses[0].restartCount
```

**Explication :** le contrôleur remplace le Pod supprimé par un **nouvel UID** ; le délai dépend notamment du scheduling, de l'image et des probes. Si un processus meurt dans un Pod existant, le kubelet redémarre le conteneur selon `restartPolicy`, **sans nouveau Pod** : le compteur de redémarrages augmente, l'UID reste identique. Ce test observe une suppression de Pod ; ce n'est ni une simulation d'OOM ni une preuve de disponibilité pour toute panne.

</details>

<a id="corrige-a03"></a>

<details>
<summary>A03 — Corrigé : readiness et retour à l'état sain</summary>

**Poste d'administration.** Injection uniquement sur le web de laboratoire :

```bash title="Poste d'administration · fonction k"
k patch deployment web --type strategic -p '{"spec":{"template":{"spec":{"containers":[{"name":"app","readinessProbe":{"httpGet":{"path":"/absent-atelier","port":"http"}}}]}}}}'
k rollout status deploy/web --timeout=45s || true
k get pods -l app=web
k get events --sort-by=.metadata.creationTimestamp
k rollout history deploy/web
```

Identifiez un Pod de la nouvelle révision, puis `k describe pod NOM_RELEVE` et `k logs NOM_RELEVE -c app` (`NOM_RELEVE` : nom observé). Des 404 de readiness avec un processus actif distinguent ce cas d'un crash ; la liveness `/healthz` reste saine. `maxUnavailable: 0` et une capacité suffisante permettent de garder les anciens Pods prêts — ce n'est pas une garantie universelle.

```bash title="Poste d'administration · fonction k"
k rollout undo deployment/web
k rollout status deployment/web --timeout=180s
http_web
k apply -k manifests/overlays/lab
k rollout status deployment/web --timeout=180s
```

**Explication :** le retour arrière agit sur le template du Pod, pas sur l'état externe de l'application. Ici, le dépôt était déjà sain : le réappliquer élimine la dérive. Si Git contenait la faute, il faudrait aussi corriger le fichier et revoir son diff.

</details>

<a id="corrige-a04"></a>

<details>
<summary>A04 — Corrigé : configuration et Secret factice</summary>

**Poste d'administration.** Modifiez uniquement `data.index.html` dans `manifests/base/configmap-web.yaml`, en conservant les endpoints `/ready` et `/healthz` de `default.conf` ; revoyez le diff, puis appliquez l'overlay. Le montage du guide n'utilise pas `subPath` : la projection finit par se mettre à jour. Observez HTTP jusqu'à voir le nouveau contenu, sans inventer de délai garanti. Une modification de la configuration nginx exige de vérifier son rechargement ; une page statique lue sur disque ne suit pas les mêmes règles.

```bash title="Poste d'administration · fonction k"
k apply -k manifests/overlays/lab
http_web
k create secret generic factice --from-literal=FACTICE=demonstration-sans-valeur-reelle
k set env deployment/web --from=secret/factice
k rollout status deployment/web --timeout=180s
k exec deploy/web -c app -- sh -c 'test -n "$FACTICE"'
```

**Explication :** le dernier test vérifie la **présence** de la variable sans afficher sa valeur. Une variable d'environnement ne change pas dans un processus déjà lancé si le Secret est modifié. L'encodage base64 de l'objet n'est pas du chiffrement.

**Nettoyage :** `k set env deployment/web FACTICE-`, attendre le rollout, puis `k delete secret factice`. Restaurez le fichier ConfigMap à son contenu connu, revoyez le diff et réappliquez l'overlay.

</details>

<a id="corrige-a05"></a>

<details>
<summary>A05 — Corrigé : droits positifs et négatifs</summary>

**Poste d'administration.** L'identité de test existe dans le namespace ; le Role ne porte que sur les Pods du groupe API « cœur » (nom vide).

```bash title="Poste d'administration · fonction k"
k create serviceaccount lecteur
k create role lire-pods --verb=get,list,watch --resource=pods
k create rolebinding lecteur-pods --role=lire-pods --serviceaccount=atelier:lecteur
IDENTITE=system:serviceaccount:atelier:lecteur
k auth can-i get pods --as="$IDENTITE"
k auth can-i list pods --as="$IDENTITE"
k auth can-i watch pods --as="$IDENTITE"
k auth can-i get secrets --as="$IDENTITE" || true
k auth can-i delete pods --as="$IDENTITE" || true
kubectl --context kind-formation -n default auth can-i list pods --as="$IDENTITE" || true
```

**Attendus :** `yes` pour les trois premiers, `no` pour les trois derniers. `|| true` laisse continuer les tests négatifs, dont le code de sortie est non nul ; il ne transforme pas un refus manquant en réussite. Une erreur d'impersonation signifie que **votre** identité n'est pas autorisée à faire le test : ne contournez pas cela en donnant des droits au ServiceAccount.

**Nettoyage :** `k delete rolebinding lecteur-pods`, `k delete role lire-pods`, `k delete serviceaccount lecteur`.

</details>

<a id="corrige-a06"></a>

<details>
<summary>A06 — Corrigé : contrainte impossible et métriques</summary>

**Poste d'administration.** Injection, collecte, correction, puis HPA :

```bash title="Poste d'administration · fonction k"
k patch deploy web --type merge -p '{"spec":{"template":{"spec":{"nodeSelector":{"formation.invalid/zone":"absente"}}}}}'
k get pods -l app=web
k get events --sort-by=.metadata.creationTimestamp
k patch deploy web --type merge -p '{"spec":{"template":{"spec":{"nodeSelector":null}}}}'
k rollout status deploy/web --timeout=180s
k top pods -l app=web
k autoscale deployment web --min=2 --max=4 --cpu=60%
k describe hpa web
```

**Explication :** le scheduler ne trouve aucun nœud portant ce label ; retirer cette seule contrainte fictive est la correction minimale. Requests CPU **et** API de métriques sont nécessaires au calcul du pourcentage. Sans charge, un HPA reste à son minimum : sa présence ne prouve pas une montée en charge. Ici, l'objectif est de configurer et d'interpréter les conditions ; un test de charge supplémentaire mesurerait métrique, réplicas, stabilisation et redescente.

**Nettoyage :** `k delete hpa web`, puis réappliquer l'overlay, qui redevient responsable du nombre fixe de réplicas.

</details>

<a id="corrige-a07"></a>

<details>
<summary>A07 — Corrigé : sélection avant redémarrage</summary>

**Poste d'administration.** Après l'injection, DNS peut résoudre le Service alors qu'aucun endpoint prêt n'existe.

```bash title="Poste d'administration · fonction k"
k patch service web --type merge -p '{"spec":{"selector":{"app":"introuvable"}}}'
k get service web -o yaml
k get pods --show-labels
k get endpointslices -l kubernetes.io/service-name=web -o yaml
k exec deploy/client -- cat /etc/resolv.conf
k exec deploy/client -- curl -v --connect-timeout 2 --max-time 5 http://web.atelier.svc.cluster.local/ || true
k apply -f manifests/base/service-web.yaml
k get endpointslices -l kubernetes.io/service-name=web -o yaml
http_web
```

**Explication :** corriger le selector rétablit le lien vers les Pods `app=web`. Le Service (port 80) redirige vers le port nommé `http`, déclaré 8080 dans le conteneur. Des endpoints absents peuvent aussi venir d'une readiness en échec : ne concluez pas au selector sans lire les deux côtés.

</details>

<a id="corrige-a08"></a>

<details>
<summary>A08 — Corrigé : preuve d'application des NetworkPolicies</summary>

**Poste d'administration.** Vérifiez que Calico est sain et que `client` et `interdit` sont prêts, puis lancez le scénario fourni :

```bash title="Poste d'administration · fonction k"
k rollout status deploy/client --timeout=180s
k rollout status deploy/interdit --timeout=180s
bash scripts/test-network.sh
k get networkpolicies -o yaml
```

**Ce que teste le script :** la référence sans politique, le refus par IP après isolation, la résolution DNS, puis HTTP depuis le seul client autorisé et le refus depuis l'autre. Il attend un **délai dépassé** pour le refus ; un code curl 6 signale un défaut de résolution et invalide la preuve DNS. N'adaptez la sélection des Pods CoreDNS qu'après inspection, si votre implémentation DNS diffère. Une autorisation par labels suppose que les utilisateurs ne puissent pas s'attribuer ces labels hors de leur périmètre.

**Nettoyage :** `k delete -f manifests/network/`, puis vérifier le retour à la référence ouverte (état pédagogique avant l'atelier suivant, pas une recommandation de production).

</details>

<a id="corrige-a09"></a>

<details>
<summary>A09 — Corrigé : écrire et relire un volume</summary>

**Poste d'administration, laboratoire kind.** La classe `standard` est celle du provisionnement local ; vérifiez son existence avant l'application. Le YAML ci-dessous est le fichier complet `exercices/a09-volume.yaml`, créé par ce bloc Bash ; l'image vient du verrou chargé en préparation.

```bash title="Poste d'administration · fonction k et BUSYBOX_IMAGE"
kubectl --context kind-formation get storageclass standard -o yaml
cat > exercices/a09-volume.yaml <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: donnees-atelier
  namespace: atelier
spec:
  accessModes: [ReadWriteOnce]
  storageClassName: standard
  resources:
    requests:
      storage: 256Mi
---
apiVersion: v1
kind: Pod
metadata:
  name: lecteur-volume
  namespace: atelier
spec:
  automountServiceAccountToken: false
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    runAsGroup: 1000
    fsGroup: 1000
    seccompProfile:
      type: RuntimeDefault
  containers:
    - name: outil
      image: ${BUSYBOX_IMAGE}
      command: [sh, -c, 'sleep 3600']
      securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities:
          drop: [ALL]
      resources:
        requests: {cpu: 10m, memory: 16Mi}
        limits: {cpu: 100m, memory: 32Mi}
      volumeMounts:
        - {name: donnees, mountPath: /donnees}
  volumes:
    - name: donnees
      persistentVolumeClaim:
        claimName: donnees-atelier
EOF
k apply -f exercices/a09-volume.yaml
k wait --for=condition=Ready pod/lecteur-volume --timeout=180s
k exec lecteur-volume -- sh -c 'printf "marqueur-a09\n" > /donnees/temoin'
k get pvc donnees-atelier -o wide
k delete pod lecteur-volume
k apply -f exercices/a09-volume.yaml
k wait --for=condition=Ready pod/lecteur-volume --timeout=180s
k exec lecteur-volume -- cat /donnees/temoin
```

**Résultat attendu :** `marqueur-a09` relu par le nouveau Pod.

**Explication :** si le Pod échoue sur les permissions, inspectez événements et provisioner ; ne passez pas root par commodité. Le comportement de `fsGroup` dépend du volume et du pilote. RWO limite l'écriture à **un nœud**, pas à un Pod ; RWOP limite à un Pod et exige un pilote CSI et des versions compatibles. Le stockage local de kind n'offre ni réplication ni reprise après destruction du nœud.

**Nettoyage :** `k delete pod lecteur-volume`, puis `k delete pvc donnees-atelier` — la politique `Delete` peut détruire le volume. [Volumes et modes d'accès](https://kubernetes.io/docs/concepts/storage/persistent-volumes/).

</details>

<a id="corrige-a10"></a>

<details>
<summary>A10 — Corrigé : exposition et plan de données</summary>

**Poste d'administration.** Reprenez les fichiers complets et l'installation optionnelle du chapitre 12 : Envoy Gateway v1.9.2 pour Gateway API, puis le [parcours Ingress Traefik](#ingress-traefik) (chart 41.7.1, image 3.7.15 résolue en digest). N'attendez pas d'Envoy Gateway qu'il interprète un objet Ingress. Avant `apply`, lisez `kubectl --context kind-formation api-resources`, `kubectl --context kind-formation get gatewayclass` et `kubectl --context kind-formation get ingressclass`.

```bash title="Poste d'administration · fonction k"
k get gateway,httproute -o yaml
k get service web
k get endpointslices -l kubernetes.io/service-name=web
k get ingress -o yaml
```

**À contrôler :** Gateway `Accepted`/`Programmed`, HTTPRoute `Accepted`/`ResolvedRefs`, génération observée et `backendRefs`, puis testez le plan de données avec `curl -H 'Host: web.k8s.test' URL_RELEVEE` — `URL_RELEVEE` étant l'adresse réellement allouée ou le port-forward du chapitre 12, pas un texte à copier.

| Mode d'exposition | À vérifier |
|---|---|
| Ingress | Classe, hostname, chemin, port du Service, journaux du contrôleur |
| NodePort | Port ouvert, adresse de nœud joignable, mapping Docker éventuel |
| LoadBalancer | Une implémentation (cloud, locale ou tunnel) est nécessaire |

Un statut accepté sans réponse HTTP ne prouve pas le fonctionnement du plan de données. **Nettoyage :** uniquement les routes et Services d'exposition créés ; conservez le Service web de base.

</details>

<a id="corrige-a11"></a>

<details>
<summary>A11 — Corrigé : l'Operator agit sur une ressource personnalisée</summary>

**Poste d'administration, cluster léger jetable uniquement.** Option additionnelle : cert-manager v1.21.2, Helm 4.2.3, Python 3/PyYAML, accès OCI à Quay. La matrice cert-manager 1.21 annonce Kubernetes 1.33–1.36 ; la compatibilité 1.37 n'est pas vérifiée ici. Le composant crée des CRD, des permissions globales et des webhooks : inspectez le rendu avant installation et installez-le **une seule fois**. [Compatibilités](https://cert-manager.io/docs/releases/), [installation officielle](https://cert-manager.io/docs/installation/helm/).

```bash title="Poste d'administration · rendu et verrouillage"
kubectl --context kind-formation kustomize manifests/overlays/lab > /tmp/a11-overlay.yaml
mkdir -p exercices/a11-cert-manager
helm pull oci://quay.io/jetstack/charts/cert-manager --version v1.21.2 --destination exercices/a11-cert-manager
sha256sum exercices/a11-cert-manager/cert-manager-v1.21.2.tgz
python3 scripts-certification/lock-cert-manager.py
helm template cert-manager exercices/a11-cert-manager/cert-manager-v1.21.2.tgz --namespace cert-manager -f exercices/a11-cert-manager/values-lock.yaml > exercices/a11-cert-manager/rendu-lock.yaml
```

Inspectez chart et rendu ; documentez empreinte, permissions et images. L'archive livrée possède un `chart.sha256` à vérifier depuis son dossier (`sha256sum --check chart.sha256`) : il identifie l'archive reçue, sans valoir vérification de signature. Le script fourni résout et vérifie les **cinq** images Quay (contrôleur, webhook, cainjector, startupapicheck, acmesolver — y compris la référence passée en argument au contrôleur) et écrit `values-lock.yaml` et `images-lock.json`. Digests et rendu ont été réellement vérifiés lors de la rédaction, **sans installer l'Operator** : cela ne prouve ni le fonctionnement des webhooks ni l'émission d'un certificat.

Après revue du diff et validation API des ressources disponibles, installez avec les mêmes valeurs verrouillées :

```bash title="Poste d'administration · installation"
helm --kube-context kind-formation install cert-manager exercices/a11-cert-manager/cert-manager-v1.21.2.tgz --namespace cert-manager --create-namespace -f exercices/a11-cert-manager/values-lock.yaml --wait --timeout 5m
kubectl --context kind-formation wait --for=condition=Established crd/certificates.cert-manager.io --timeout=60s
kubectl --context kind-formation -n cert-manager get deployments,pods
```

La validation API **avant** installation ne peut pas accepter de ressources cert-manager tant que leurs CRD et webhooks ne sont pas prêts : faites-la séparément. N'appliquez pas aussi le rendu avec kubectl : un seul gestionnaire pour ces ressources. Le fichier fourni `exercices/a11-certificat.yaml` est complet :

```yaml title="exercices/a11-certificat.yaml"
apiVersion: cert-manager.io/v1
kind: Issuer
metadata:
  name: local-selfsigned
  namespace: atelier
spec:
  selfSigned: {}
---
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: atelier-local
  namespace: atelier
spec:
  secretName: atelier-local-tls
  dnsNames: [atelier.local]
  issuerRef:
    name: local-selfsigned
    kind: Issuer
```

```bash title="Poste d'administration · fonction k"
k apply -f exercices/a11-certificat.yaml
k wait --for=condition=Ready certificate/atelier-local --timeout=180s
k get issuer,certificate,certificaterequest
k get secret atelier-local-tls -o jsonpath='{.type}{"\n"}'
```

**Résultat attendu :** Certificate `Ready` et un Secret de type `kubernetes.io/tls`.

**Explication :** la CRD seule ne crée pas le certificat ; c'est le **contrôleur** qui réconcilie le Certificate et génère la clé et le Secret TLS. Un certificat autosigné n'est pas approuvé automatiquement par un navigateur.

**Nettoyage :** `k delete -f exercices/a11-certificat.yaml`, `k delete secret atelier-local-tls --ignore-not-found`, puis `helm --kube-context kind-formation uninstall cert-manager -n cert-manager`. Helm conserve normalement ces CRD pour éviter de perdre toutes leurs instances : ne les supprimez pas globalement par automatisme. La remise à zéro la plus nette reste la destruction du cluster jetable.

</details>

<a id="corrige-a12"></a>

<details>
<summary>A12 — Corrigé : erreur d'image, logs et métriques</summary>

**Poste d'administration.** Injection réversible :

```bash title="Poste d'administration · fonction k"
k set image deployment/web app=nginxinc/nginx-unprivileged:atelier-tag-inexistant
k get pods -l app=web -o wide
k get events --sort-by=.metadata.creationTimestamp
k get pods -l app=web -o json > /tmp/a12-preuves.json
k top nodes
k top pods -l app=web
```

**Explication :** le nouveau conteneur n'a peut-être **jamais démarré** : il n'a alors aucun log applicatif. Consultez `state.waiting.reason`, le message du registre et les événements ; vérifiez nom, tag, authentification et réseau avant de conclure. Pour un conteneur déjà redémarré, choisissez son Pod puis `k logs NOM_RELEVE -c app --previous` (le précédent peut avoir disparu). Un code 137 peut venir d'un SIGKILL et n'établit pas seul un OOMKilled. L'absence de métriques est une limite à consigner, pas une consommation nulle.

```bash title="Poste d'administration · fonction k et WEB_IMAGE"
k set image deployment/web app="$WEB_IMAGE"
k rollout status deployment/web --timeout=180s
http_web
k apply -k manifests/overlays/lab
```

</details>

#### Préparation des corrigés kubeadm A13–A16

Le poste d'administration utilise le kubeconfig protégé exporté depuis le laboratoire VM ; il ne cible jamais kind. Adaptez ce chemin seulement si le chapitre 3 l'a défini autrement. Sur chaque VM, vérifiez le hostname avant `sudo`. Les noms `cp1` et `w1` désignent les VM ainsi nommées dans l'inventaire du laboratoire.

```bash title="Poste d'administration Linux/WSL · racine du dossier associé (définit kv)"
export KUBECONFIG_VM="$PWD/.secrets/admin-vm.kubeconfig"
test -f "$KUBECONFIG_VM"
kv() { kubectl --kubeconfig "$KUBECONFIG_VM" --context formation-vm "$@"; }
kv cluster-info
kv get nodes -o wide
```

<a id="corrige-a13"></a>

<details>
<summary>A13 — Corrigé : kubeadm et contrats d'extension</summary>

Exécutez la procédure complète des **§3.4 et 3.5** depuis des VM neuves : préparation OS/runtime sur **tous les nœuds**, `kubeadm init` sur **cp1**, installation du CNI, puis commande de jonction sur le **worker** (l'ajout d'un worker supplémentaire est au §16.2). IP, CIDR et noms viennent de l'inventaire ; une commande de jonction générée pour un autre cluster est incorrecte.

| Où | Quoi |
|---|---|
| Chaque VM, avant installation | `hostnamectl`, `ip route`, `timedatectl`, `sudo systemctl status containerd`, puis les contrôles de cgroup, runtime et swap du §3.4 |
| cp1, après initialisation | `sudo kubeadm token create --print-join-command` : commande sensible, à exécuter sur le seul worker visé et à ne pas joindre au rapport |
| Worker | Appliquer cette commande avec son hash de CA ; ne pas désactiver sa vérification |

```bash title="Poste d'administration · après join et CNI (fonction kv)"
kv get nodes -o wide
kv -n kube-system get pods -o wide
kv -n kube-system rollout status deployment/coredns --timeout=180s
kv get node w1 -o jsonpath='{.status.nodeInfo.containerRuntimeVersion}{"\n"}'
```

**Explication :** l'interface **CRI** relie le kubelet au runtime ; le **CNI** configure le réseau des Pods ; le **CSI** concerne le stockage et n'est pas installé par kubeadm. Avant le CNI, `NotReady` et CoreDNS en attente sont attendus ; après, lisez les preuves si ces états persistent. Ajoutez le test applicatif inter-nœuds du chapitre 9. La validation est incomplète si elle s'arrête à un `kubeadm init` sans erreur.

</details>

<a id="corrige-a14"></a>

<details>
<summary>A14 — Corrigé : drain, capacité et cycle de vie</summary>

**Poste d'administration VM.** Préparez le workload web (trois réplicas répartis) et le PDB du chapitre 13 dans le cluster VM. Vérifiez capacité et placements avant de drainer `w1` ; testez HTTP par le chemin réellement configuré dans ce cluster, pas par un port-forward vers un Pod que l'on évince.

```bash title="Poste d'administration · fonction kv"
kv -n atelier get pods -o wide
kv -n atelier get pdb
kv cordon w1
kv drain w1 --ignore-daemonsets --timeout=180s
kv -n atelier get pods -o wide
kv get node w1
kv uncordon w1
kv wait --for=condition=Ready node/w1 --timeout=180s
```

**Explication :** un drain bloqué par un PDB ou un `emptyDir` appelle une analyse. N'ajoutez pas `--disable-eviction`, `--force` ni `--delete-emptydir-data` pour faire disparaître le problème : déterminez d'abord le propriétaire, la capacité restante et l'acceptation de la perte. Les PDB régulent certaines perturbations volontaires ; ils ne pilotent pas le rolling update et n'empêchent pas une panne matérielle.

**Plan de version :** comparez versions kubeadm/kubelet/kubectl, CNI/CSI, API et notes de version de la cible. Sur **cp1**, `sudo kubeadm upgrade plan` évalue l'état après préparation du paquet kubeadm cible (§16.4). Consignez l'ordre — control planes puis workers — et les validations avant/après ; la cible mineure doit être choisie et compatible. Le blanc demande un **plan**, pas l'exécution d'une mise à niveau non préparée. [Maintenance d'un nœud](https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/), [mise à niveau kubeadm](https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/).

</details>

<a id="corrige-a15"></a>

<details>
<summary>A15 — Corrigé : restauration distincte d'un simple remplacement</summary>

**Clone à un seul control plane, jetable, uniquement.** Créez deux témoins depuis le **poste d'administration du clone**, avec son kubeconfig et son contexte explicitement identifiés ; les commandes `kv` ne conviennent que si elles pointent vers ce clone. N'écrasez pas le kubeconfig du laboratoire sain.

1. **Avant le snapshot :** créer `ConfigMap/temoin-avant` avec une donnée factice ; relever date UTC, révision et UID ; prendre le snapshot via `scripts-etcd/backup-etcd.sh` sur le **control plane du clone**, avec l'environnement et les certificats de sa procédure.
2. **Copier** le snapshot et son empreinte hors VM, sur un stockage protégé ; vérifier l'intégrité ; puis créer `ConfigMap/temoin-apres` et noter l'heure. Cette différence matérialise la fenêtre de perte, sans toucher aux données métier.
3. **Exécuter intégralement** la restauration à un membre du chapitre 19 (§19.11, étapes A à F) : arrêt des consommateurs, sauvegarde des anciens manifests et données, `etcdutl snapshot status`, restauration vers un nouveau répertoire avec identités et adresses vérifiées, options `--bump-revision` et `--mark-compacted`, bascule contrôlée du manifeste, reprise dans l'ordre documenté.
4. **Contrôler :** depuis le control plane, santé, statut, membre et journaux avec les endpoints/TLS réels ; depuis le poste du clone, `/readyz`, les nœuds et les deux témoins, puis créer et supprimer un nouvel objet.

**Résultat attendu :** `temoin-avant` présent, `temoin-apres` absent, nouvelle écriture possible ; une API simplement accessible ne suffit pas.

**Explication :** paramètres sensibles et valeur du bump sont ceux du runbook versionné ; n'inventez pas de valeur universelle. La restauration crée un nouveau cluster logique ; les watches et caches peuvent garder des révisions antérieures : bump et marquage compacté traitent ce risque s'ils sont utilisés conformément à la documentation. Notez le RPO observé (horodatages du snapshot et des écritures perdues) et le RTO mesuré (du début d'indisponibilité aux critères de reprise satisfaits). Le snapshot ne restaure ni les données d'un PVC ni les certificats absents de la procédure. [Reprise etcd 3.6](https://etcd.io/docs/v3.6/op-guide/recovery/).

</details>

<a id="corrige-a16"></a>

<details>
<summary>A16 — Corrigé : tolérer une panne avec trois membres</summary>

Construisez la topologie du **chapitre 3** avec les jonctions de control planes du **§3.6**, puis relevez la santé etcd depuis un **control plane sain** avec les certificats et endpoints du chapitre 19. Trois membres exigent deux voix ; la panne d'un seul en laisse deux. Le nombre de serveurs API ne suffit pas à connaître le quorum etcd.

| Où | Action |
|---|---|
| Console de l'hyperviseur | Arrêter proprement **une seule** VM control plane identifiée (sauvegarde et console disponibles) |
| Poste d'administration VM | Vérifier via l'endpoint partagé que `kv get nodes` répond ; créer, lire et supprimer un ConfigMap factice |
| Control plane survivant | Relever leader, membres accessibles et journaux ; ne pas retirer de la composition le membre temporairement arrêté |
| Hyperviseur | Redémarrer la VM |
| Poste d'administration | `kv wait --for=condition=Ready node/cp1 --timeout=180s` si cp1 était le nœud arrêté, puis reprendre les contrôles etcd sur tous les endpoints |

**Explication :** le nom de nœud doit correspondre à la VM effectivement arrêtée. Une API joignable avant l'incident ne garantit pas le basculement du répartiteur : testez sa configuration et sa santé. Un répartiteur unique reste un point de panne : l'atelier démontre une panne de control plane, pas une haute disponibilité complète. Mesurez les erreurs HTTP et le temps d'indisponibilité réels. Ne provoquez pas de perte de quorum en prolongement improvisé.

</details>

<a id="reponses-positionnement"></a>

#### Réponses au positionnement et questions de compréhension

<details>
<summary>Afficher les réponses</summary>

Les preuves attendues pour les tâches 1 à 10 du test de positionnement correspondent, dans l'ordre, à A01, A02, A03, A07, A05, A09, A06, A12, A15 et A14.

- **Quorum :** deux sur trois, trois sur cinq ; les données métier sur PVC ne sont généralement **pas** dans etcd.
- Le **kubelet** redémarre un conteneur ; un **contrôleur** peut remplacer un Pod.
- La **readiness** retire le Pod des endpoints prêts, sans obligation de redémarrage.
- Un **drain** peut attendre pour respecter un PDB ou signaler des données locales.
- Une **RoleBinding** peut référencer une ClusterRole tout en limitant son effet au namespace de la liaison ; une ClusterRoleBinding a une portée différente.
- Les **caches et watches** expliquent le traitement des révisions lors d'une restauration.

</details>

<a id="corrige-blancs"></a>

#### Corriger les deux examens blancs

<details>
<summary>Afficher la préparation et la grille des examens blancs</summary>

**Préparation du blanc 1 par le formateur, après création du Service :** sur le **poste d'administration**, exécuter `kubectl --context kind-formation -n blanc-app patch service web --type merge -p '{"spec":{"selector":{"app":"erreur-blanc"}}}'`. Pour l'incident d'image, utiliser le tag fictif d'A12, uniquement dans `blanc-app`. En entraînement solo, lisez l'injection puis attendez avant de diagnostiquer : le résultat mesure alors surtout la méthode, pas la découverte d'une cause inconnue.

| Blanc 1 | Corrigé de référence | Preuve indispensable |
|---|---|---|
| Déploiement, 20 points | A01/A03, manifests adaptés à `blanc-app` | 3 réplicas prêts, paramètres exigés, HTTP ; 5 points par groupe |
| RBAC, 15 points | A05 adapté au namespace | Lecture autorisée 5, refus Secrets 5, refus écriture 5 |
| Service, 15 points | A07 | Cause démontrée 5, correction minimale 5, HTTP 5 |
| Politiques, 20 points | A08, selectors adaptés | Référence 5, refus 5, DNS 5, flux sélectif 5 |
| PVC, 10 points | A09 | Liaison 3, marqueur relu après remplacement 5, limites 2 |
| HTTPRoute, 10 points | A10 et chapitre 12 | Statuts 4, réponse avec le bon Host 6 |
| Image, 10 points | A12 | Preuves 4, restauration du digest 3, contrôle final 3 |

**Préparation du blanc 2 :** A13, A14 et A15 utilisent des VM et un clone distincts. Pour la panne kubelet, le formateur exécute sur **le seul worker de test** `sudo systemctl stop kubelet`, note l'heure et attend que l'état du nœud change, sans arrêter le runtime (les Pods existants peuvent continuer un temps). Le candidat doit examiner `sudo systemctl status kubelet` et `sudo journalctl -u kubelet -n 100 --no-pager` sur ce worker, corriger avec `sudo systemctl start kubelet`, puis vérifier Ready et le fonctionnement applicatif depuis le poste VM. Ce scénario n'efface aucune configuration.

| Blanc 2 | Corrigé de référence | Répartition des points |
|---|---|---|
| Jonction worker, 15 | A13 | Précontrôles 5, jonction sûre 5, Ready et réseau 5 |
| Operator, 15 | A11, kubeconfig VM explicitement substitué | Rendu/permissions 5, installation 5, Certificate/Secret vérifiés 5 |
| Maintenance, 20 | A14 | Capacité/PDB 5, éviction 5, mesure HTTP 5, retour sain 5 |
| Kubelet, 20 | Injection décrite ci-dessus | Preuves 8, correction minimale 6, retour Ready/HTTP 6 |
| Plan de mise à niveau, 10 | A14 et chapitre 16 | Cible/compatibilités 3, ordre 3, sauvegarde/contrôles 4 |
| Reprise sur clone, 20 | A15 et chapitre 19 | Snapshot protégé 4, restauration cohérente 6, témoins/nouvelle écriture 6, RPO/RTO 4 |

Les corrigés de référence sont des **méthodes**, pas des commandes universelles : namespace, contexte ou hôte changent dans un blanc. Corrigez les fichiers finaux et le journal d'apprentissage, puis supprimez uniquement les environnements jetables du blanc. Un score local mesure cette séance et ses dépendances ; le statut de certification dépend exclusivement de l'examen officiel.

</details>


<a id="chapitre-23"></a>

## 23. Glossaire et repères de choix

**En bref.** Les définitions courtes des termes et acronymes du guide, puis un tableau pour choisir rapidement le bon objet Kubernetes.

| Terme | Définition utile |
|---|---|
| Admission | Contrôle des demandes de modification après autorisation, avant persistance |
| API / API Server | Interface de programmation / serveur qui expose les ressources et contrôles Kubernetes |
| CKA / CKAD / CKS | Certifications Kubernetes administrateur / développeur / sécurité |
| CNI / CRI / CSI | Interfaces d'extension réseau / runtime / stockage |
| ConfigMap | Configuration non sensible distribuée comme objet API |
| Control plane | Composants qui gèrent l'état global, les décisions et l'API |
| Contrôleur / réconciliation | Boucle qui compare intentions et observations, puis agit pour réduire l'écart |
| CRD / Operator | Définition de ressource personnalisée / contrôleur appliquant une logique d'exploitation |
| DaemonSet | Contrôleur d'un Pod par nœud éligible |
| Deployment / ReplicaSet | Gestion des versions et du remplacement / gestion d'un effectif de Pods |
| Digest / tag | Identifiant du contenu / nom de version déplaçable dans un registre |
| DNS / FQDN | Système de noms / nom pleinement qualifié (ex. `web.atelier.svc.cluster.local`) |
| EndpointSlice | Adresses, ports et conditions publiés pour les endpoints d'un Service |
| etcd / Raft | Base clé-valeur distribuée / algorithme de consensus sur un journal répliqué |
| Éviction / drain | Retrait d'un Pod via l'API d'éviction / évacuation d'un nœud |
| GitOps | Réconciliation d'intentions déclaratives versionnées depuis une source gérée |
| HA | *High Availability*, haute disponibilité fondée sur des domaines de panne et des capacités définis |
| HPA | *Horizontal Pod Autoscaler*, ajuste l'effectif selon des métriques |
| Ingress / Gateway API | API de routage HTTP / famille d'API d'exposition aux responsabilités séparées |
| Job / CronJob | Travail fini suivi / création planifiée de Jobs |
| Kubeconfig | Configuration de connexion, de confiance et d'identité du client ; fichier sensible |
| kubelet | Agent de nœud qui fait exécuter par le runtime les Pods affectés au nœud |
| Namespace | Périmètre de noms et de nombreuses politiques, pas une isolation complète |
| NetworkPolicy | Autorisations réseau additives pour les Pods sélectionnés ; implémentation CNI requise |
| OOMKilled | Raison signalant un arrêt pour mémoire ; à recouper avec limites, pression et journaux |
| PDB | *PodDisruptionBudget*, limite certaines perturbations volontaires via l'éviction |
| PKI / TLS / mTLS | Infrastructure de clés publiques / transport sécurisé / authentification TLS mutuelle |
| Pod | Unité planifiée ; ses conteneurs partagent le réseau et les volumes qu'ils montent |
| Probe startup / readiness / liveness | Contrôle du démarrage / de l'aptitude à recevoir du trafic / du besoin de redémarrer |
| PSA / PSS | *Pod Security Admission* / *Pod Security Standards* |
| PV / PVC / StorageClass | Volume du cluster / demande de volume du namespace / classe de provisionnement |
| QoS / requests / limits | Classe de service / réservations pour le scheduling / plafonds de ressources |
| Quorum | Majorité des membres votants nécessaire à la progression du consensus |
| RBAC | Contrôle d'accès par rôles ; les autorisations s'additionnent |
| Révision / watch | Version logique des mutations etcd / suivi des changements de l'API |
| RPO / RTO | Objectif de perte maximale de données / objectif de durée maximale de reprise |
| SBOM / provenance | Inventaire des composants / description vérifiable de leur construction |
| Secret / ServiceAccount | Objet de donnée sensible / identité technique d'accès à l'API |
| Service | Identité réseau et exposition d'un groupe d'endpoints (ou d'une autre destination définie) |
| SLI / SLO | Indicateur mesuré / objectif sur cet indicateur et une fenêtre de temps |
| StatefulSet | Contrôleur d'identités stables, avec stockage associé par instance |
| Taint / toleration | Marque qui repousse les Pods / permission de tolérer cette marque |
| WAL / MVCC | *Write-Ahead Log*, journal durable / *Multi-Version Concurrency Control*, historique des versions |

**Choisir rapidement**

| Besoin | Objet adapté | À vérifier (chapitre) |
|---|---|---|
| Service interchangeable | Deployment | Capacité, santé (7, 13) |
| Identité ou volume par instance | StatefulSet, avec une logique applicative | Réplication, sauvegarde (7, 11) |
| Agent sur chaque nœud | DaemonSet | Sélection, tolérances, privilèges (7, 15) |
| Travail qui se termine | Job | Idempotence (7) |
| Travail planifié | CronJob | Chevauchements, surveillance (7) |
| Configuration | ConfigMap | Mode d'injection, rechargement (10) |
| Valeur sensible | Secret protégé | Git, chiffrement, droits (10, 15) |
| Disque | PVC + pilote adapté | Mode d'accès, topologie (11) |
| Permissions | Role + RoleBinding | Tests positifs et négatifs (15) |
| Trafic minimal | NetworkPolicy **effectivement testée** | Baseline, refus, DNS (9) |

Vérifiez toujours le besoin métier et les limites au chapitre correspondant.

<a id="chapitre-24"></a>

## 24. Audit initial, changements et statut des validations

**En bref.** Cette annexe de référence trace ce qui a été corrigé par rapport au guide initial, et distingue clairement ce qui a été **relu**, **validé statiquement** ou **testé en laboratoire**.

### 24.1 Traçabilité des corrections

Les quinze chapitres initiaux ont été audités ; les corrections sont intégrées au guide et les thèmes utiles conservés et approfondis. Codes : **C** correction, **A** ajout, **P** choix pédagogique. La dernière colonne indique la méthode de contrôle ; les opérations réellement exécutées sont distinguées au §24.2.

<details>
<summary>Tableau détaillé des corrections (37 lignes)</summary>

| Section initiale | Problème identifié | Correction apportée | Source utilisée | Méthode de validation |
|---|---|---|---|---|
| Introduction | Docker seul comme prérequis, environnement non reconstruit, versions implicites | A/P : rappels, parcours, laboratoires distincts et versions (§1–3) | [kind](https://kind.sigs.k8s.io/docs/user/quick-start/), [kubeadm](https://v1-35.docs.kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/) | Inventaire ; construction complète à exécuter |
| 1.2 Architecture | « Tout l'état » dans etcd ; apply présenté comme une chaîne synchrone | C : objets API persistés, données métier séparées, contrôleurs asynchrones (§4/19/20) | [Composants](https://v1-35.docs.kubernetes.io/docs/concepts/overview/components/) | Objets, status et ownerReferences |
| 1.3 Runtime | « Docker retiré » peut être compris comme retrait des images Docker | C : retrait de dockershim ; OCI et CRI expliqués (§2/4) | [CRI](https://v1-35.docs.kubernetes.io/docs/concepts/architecture/cri/) | Inventaire runtime et imageID |
| 1.4–1.5 Réconciliation | Garanties absolues, fréquence universelle, Pods présentés comme déplacés | C : watch, caches, retries et remplacement avec nouvel UID sous conditions (§4) | [Contrôleurs](https://v1-35.docs.kubernetes.io/docs/concepts/architecture/controller/) | UID, conditions et événements |
| 1.5 Endpoints | Contrôleur historique et notion de santé trop simple | C : EndpointSlices et conditions ; dépréciation Endpoints (§4/9) | [EndpointSlices](https://v1-35.docs.kubernetes.io/docs/concepts/services-networking/endpoint-slices/) | Comparaison selectors, adresses et readiness |
| 1.6 Crash/OOM | Création immédiate d'un nouveau Pod et délai de deux secondes garantis | C : redémarrage du conteneur par kubelet distinct du remplacement par ReplicaSet (§4/6/21) | [Cycle du Pod](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/) | UID, restartCount et lastState avant/après |
| 2.1–2.3 etcd/Raft | Perte totale suggérée, temporisations et tolérance réseau absolues | C/A : journal, élections, quorum, partitions et domaines de panne (§19) | [etcd FAQ](https://etcd.io/docs/v3.6/faq/) | Calculs de quorum ; lectures/écritures à tester |
| 3.1–3.2 Pods | Partages implicites et ressources décrites comme garanties | C : réseau, montages, requests et limites distingués (§6/8) | [Pods](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/pods/), [Ressources](https://v1-35.docs.kubernetes.io/docs/concepts/configuration/manage-resources-containers/) | Schéma puis identité, montages et placement |
| 3.3 Sidecar | `tail` peut précéder le fichier ; aucune collecte centrale fournie | C/P : stdout/CRI, sidecar natif et pipeline optionnel séparés (§6/17) | [Logs](https://kubernetes.io/docs/concepts/cluster-administration/logging/), [Sidecars](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/) | Conservation des logs après perte du Pod |
| 3.4 Probes | Chemins absents de l'image nginx standard | C : endpoints définis dans la ConfigMap ; budgets et dépendances explicités (§6/13) | [Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) | Schéma, HTTP puis injection réversible |
| 3.5 Cycle du Pod | Confusion phases, états et raisons affichées | C : Running/Ready distincts ; code 137 insuffisant pour prouver un OOM (§6/21) | [Cycle du Pod](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/) | Croiser lastState, événements, logs et mesures |
| 4.1–4.2 Deployment | Pod seul décrit comme toujours perdu au crash ; image ancienne privilégiée | C : restartPolicy ; fil nginx non-root, rootfs RO et digest (§6/7/15) | [Pods](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/pods/), [Image nginx](https://github.com/nginx/docker-nginx-unprivileged) | id, probes et écritures permises/refusées |
| 4.3 HPA | Métriques, requests et capacité non documentées | C : autoscaling/v2, metrics-server et propriété de replicas (§8) | [HPA](https://v1-35.docs.kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) | Conditions et variation observée, pas `<unknown>` |
| 4.4 Mise à jour | Absence d'interruption annoncée sans mesure | C/A : capacité, budgets, arrêt gracieux et mesure de trafic (§13) | [Deployment](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/controllers/deployment/) | HTTP avant/pendant/après et limites du test |
| 4.5 Rollback | Historique implicite ; retour des données non distingué | C : annotation, template et données/configuration séparés (§13/14/20) | [Deployment](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/controllers/deployment/) | Révision, template et service vérifiés |
| 5.1 IP du Pod | Toute relance supposée changer l'IP | C : redémarrage du conteneur et remplacement du Pod distincts (§9) | [Cycle du Pod](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/) | UID/IP avant et après |
| 5.2–5.5 Services | LB implicite, headless incomplet, un port supposé par Service | C/A : objets complets, dépendances LB et plusieurs ports (§7/9/11) | [Services](https://v1-35.docs.kubernetes.io/docs/concepts/services-networking/service/) | DNS, HTTP, selectors et targetPort |
| 5 Réseau | NetworkPolicies absentes | A : refus par défaut, DNS, flux nécessaires et preuve CNI (§9/13) | [NetworkPolicy](https://v1-35.docs.kubernetes.io/docs/concepts/services-networking/network-policies/) | Baseline, refus et accès autorisé réels |
| 6.1 ConfigMap | Projection du fichier confondue avec relecture applicative | C : env, volume, subPath, reload et redéploiement (§10) | [ConfigMap](https://v1-35.docs.kubernetes.io/docs/concepts/configuration/configmap/) | Fichier et comportement après changement |
| 6.2 Secrets | Valeurs dans les commandes ; protection réduite à un outil externe | C/A : Git, injection, chiffrement au repos, clés et rotation (§10/15/19) | [Secrets](https://v1-35.docs.kubernetes.io/docs/concepts/security/secrets-good-practices/) | Droits, renouvellement et preuve etcd sans divulgation |
| 7 Namespaces | Isolation surestimée, `get all` trompeur | C/A : frontières, RBAC/NP/PSA, quotas et LimitRange (§5/8/15) | [Namespaces](https://v1-35.docs.kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) | Inventaire explicite et refus contrôlés |
| 8 StatefulSet MySQL | Trois bases non répliquées, prérequis manquants | C/P : identité/PVC séparés de la réplication ; exercice de fichiers complet (§7/11) | [Application répliquée](https://kubernetes.io/docs/tasks/run-application/run-replicated-stateful-application/) | Données distinctes par PVC, aucune réplication présumée |
| 9.1–9.2 DaemonSet | Tous nœuds supposés éligibles ; accès hôte non justifiés | C/A : DS neutre puis exceptions système contrôlées (§7/15/17) | [DaemonSet](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/controllers/daemonset/) | Éligibilité, compte et privilèges |
| 9.3 Fluentd | SA/RBAC/backend absents, chemin Docker avec runtime implicite | C/P : pipeline CRI et stockage des logs explicités (§17) | [Architecture logs](https://kubernetes.io/docs/concepts/cluster-administration/logging/) | Collecte effective après perte à tester |
| 10.1 Job | Image/script/base inconnus, idempotence non traitée | C/P : Job complet borné ; migration réelle dépendante du métier (§7) | [Job](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/controllers/job/) | Complete, logs et délais |
| 10.2 Lot indexé | Annotation d'index sans `completionMode: Indexed` ; commande non parallèle | C : Job Indexed, quatre index et deux exécutions parallèles (§7) | [Jobs](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/controllers/job/) | Index, completions et doublons expliqués |
| 10.3 CronJob backup | Authentification incomplète, erreurs masquées, stockage local et fuseau implicite | C/P : tâche UTC neutre ; sauvegarde/reprise distinctes (§7/20) | [CronJob](https://v1-35.docs.kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/) | Échecs visibles et restauration vérifiée |
| 11.1 emptyDir | RAM/disque et durée de vie imprécis | C : durée du Pod, survie au redémarrage du conteneur, `Memory` explicite (§11) | [Volumes](https://v1-35.docs.kubernetes.io/docs/concepts/storage/volumes/) | Comparaison des deux cycles de vie |
| 11.2 RWO | Limité à un Pod dans le commentaire ; MySQL incomplet | C : un nœud ; RWOP/CSI distingués ; exemple fonctionnel (§11) | [PV/modes](https://v1-35.docs.kubernetes.io/docs/concepts/storage/persistent-volumes/) | Écriture/relecture et topologie |
| 11.3 EBS | Ancien provisionneur in-tree, CSI/IAM/zones omis | C : pilote CSI et dépendances cloud explicites (§11) | [EBS CSI](https://github.com/kubernetes-sigs/aws-ebs-csi-driver) | Pilote, identité et provisionnement à tester |
| 12 Ingress | Contrôleur retiré et vieux patch ; Issuer/backends non fournis | C/A : API distincte du contrôleur, Envoy/Traefik versionnés et TLS local (§12) | [Retrait Ingress NGINX](https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/) | Rendus puis HTTP/TLS positifs et négatifs |
| 13 RBAC/sécurité | Identités, portée, jetons et workloads peu approfondis | C/A : auditeur, moindre privilège, Restricted, audit et supply chain (§15) | [RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/), [PSS](https://v1-35.docs.kubernetes.io/docs/concepts/security/pod-security-standards/) | Schéma, permissions, admission et exécution |
| 14 Diagnostic | Contextes implicites, conclusions automatiques, ligne debug avec continuation invalide | C/A : 17 scénarios en huit étapes, preuves et corrections réversibles (§21) | [Debug](https://kubernetes.io/docs/tasks/debug/debug-application/) | Syntaxe puis injections à exécuter |
| 15.1 Sauvegarde etcd | Glob ambigu, certificat client mélangé, cron fragile et rétention avant copie | C/A : outils 3.6.6, fichier exact, chiffrement, verrou et copie hors cluster (§19) | [Recovery](https://etcd.io/docs/v3.6/op-guide/recovery/) | Fichier, déchiffrement et reprise du cluster |
| 15.2 Restauration | Tous CP annoncés mais exemple à un membre ; propriétaire et révisions ignorés | C/A : topologies séparées, identités, bump et invalidation des watches (§19) | [Recovery 3.6](https://etcd.io/docs/v3.6/op-guide/recovery/) | Runbook relu ; reprise complète non exécutée |
| 15.3 Maintenance | Compaction actuelle et défragmentation sans budget de disponibilité | C : rétention des watches, opérations séparées et séquentielles (§19) | [Maintenance](https://etcd.io/docs/v3.6/op-guide/maintenance/) | Révisions, tailles et santé avant/après |
| 15.4–15.5 Alertes | Seuils universels, histogrammes et garanties HA excessives | C/A : seuils initiaux à adapter, labels, absence de métriques et domaines (§19) | [Métriques etcd](https://etcd.io/docs/v3.6/metrics/), [Histogrammes](https://prometheus.io/docs/practices/histograms/) | YAML ; promtool et alertes réelles non exécutés |
| Récapitulatif | Pas de préparation structurée ni trace des versions | A : matrice des 27 objectifs CKA, 16 ateliers, 2 blancs originaux, glossaire et rapports (§22–24) | [CNCF](https://github.com/cncf/curriculum), [Instructions LF](https://docs.linuxfoundation.org/tc-docs/certification/tips-cka-and-ckad) | PDF officiels consultés ; pratique à réaliser |

</details>

Les audits `audit-etcd.md` et `audit-securite-diagnostic.md` du dossier associé approfondissent les points sensibles ; le journal `JOURNAL-DES-CHANGEMENTS.md` distingue corrections, ajouts et décisions de périmètre.

### 24.2 Trois états de validation

| État | Définition | Statut de cette édition |
|---|---|---|
| **Relu** | Vérification technique et pédagogique, sources et cohérence | Effectuée ; réserves explicites dans les chapitres |
| **Validé statiquement** | Syntaxe, schéma natif, rendus, intégrité des fichiers et liens | Effectuée sur les périmètres détaillés au rapport |
| **Testé en laboratoire** | Exécution sur un cluster identifié, preuves conservées | **Non exécuté** pendant cette refonte |

Le rapport `validations/rapport-validation.md` donne les versions utilisées, les exclusions, les résultats et les étapes non réalisées. Rappels : une CRD syntaxiquement correcte ne prouve pas le fonctionnement de son contrôleur ; une restauration locale n'est pas une reprise complète ; une permission autorisée sans cas refusé ne prouve pas le contrôle.

### 24.3 Critères d'acceptation à réaliser

Vous maîtrisez le parcours quand vous savez, **sur votre laboratoire** :

- [ ] reconstruire depuis un commit connu ;
- [ ] expliquer la chaîne Deployment → ReplicaSet → Pod ;
- [ ] vérifier les probes ;
- [ ] prouver droits et filtrage réseau, avec un cas autorisé et un cas refusé ;
- [ ] retrouver les fichiers persistants, et distinguer réplication et sauvegarde ;
- [ ] mesurer un rollout ;
- [ ] réparer un incident en conservant ses preuves ;
- [ ] restaurer etcd avec les bonnes identités et révisions ;
- [ ] restaurer les données métier ;
- [ ] renseigner RPO, RTO et limites.

La lecture seule ne valide pas ces compétences et ne garantit pas la réussite à l'examen.

### 24.4 Révision éditoriale du 22 octobre 2026

Cette révision porte sur la **présentation**, sans changer les commandes, versions ni procédures techniques :

- les huit diagrammes Mermaid, non rendus par le site, sont remplacés par douze schémas SVG intégrés directement dans la page (aucun fichier d'image séparé ; thèmes clair et sombre ; lisibles sur téléphone) et par des tableaux d'étapes ;
- les explications sont réécrites pour aller à l'essentiel, avec une progression « à quoi ça sert, comment ça marche, comment l'utiliser, comment vérifier » ;
- chaque bloc de commandes indique où l'exécuter ; les résultats attendus et les points de contrôle sont explicités ;
- un tableau de [dépannage express](#depannage-express), des ancres stables par scénario et des corrigés repliables facilitent la consultation rapide ;
- les liens vers des fichiers externes au site sont remplacés par des renvois internes, et les renvois de chapitres de A13/A16 sont corrigés (§3.4 à 3.6).
