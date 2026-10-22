---
title: "Scan des images : bascule contrôlée de Trivy vers Syft et Grype"
description: "Préparez un scan de secours: SBOM avec Syft, analyse des vulnérabilités avec Grype, validation des résultats et retour à Trivy."
created: "2026-10-22"
# updated: "2026-02-08"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"

---

Préparer le secours avant l'incident : comprendre les outils, contrôler la même image, qualifier les résultats et autoriser uniquement les déploiements accompagnés de preuves fiables.

**Révision pédagogique : 22 octobre 2026.** Référence technique et sources de qualification : **16 octobre 2026**. Candidats conservés : **Trivy 0.76.0 · Syft 1.54.1 · Grype 0.120.1**.

Ce fichier est autonome : les vues se lisent directement en Markdown et les scripts complets sont dans l'[annexe intégrée](#section-22). Il ne demande aucun composant MDX, plugin Mermaid ou fichier d'image supplémentaire. Les [instructions Starlight](#integration-starlight) indiquent les derniers contrôles à réaliser sur votre VM.

<details>
<summary><strong>Sommaire complet — 22 chapitres</strong></summary>

1. [Lire ce guide et connaître son niveau de validation](#section-01)
2. [Comprendre les incidents Trivy de mars 2026](#section-02)
3. [Comprendre les trois outils et leur périmètre](#section-03)
4. [Architecture, responsabilités et intégration FacturaDJ](#section-04)
5. [Installer et préparer les scanners sous Debian/Ubuntu](#section-05)
6. [Parcours progressif sur une même image immuable](#section-06)
7. [SBOM : formats, métadonnées et réévaluation](#section-07)
8. [Politique de décision commune et contrat des preuves](#section-08)
9. [Mettre le support en pratique et l'intégrer à Azure DevOps](#section-09)
10. [Codes natifs et qualification des différences](#section-10)
11. [Protéger les outils de sécurité et toute la chaîne logicielle](#section-11)
12. [Réponse à une suspicion de compromission](#section-12)
13. [Atelier de bascule : protocole réversible](#section-13)
14. [Runbook de bascule contrôlée vers Syft + Grype](#section-14)
15. [Runbook de retour à Trivy](#section-15)
16. [Maintenance préparatoire, historique et Mattermost](#section-16)
17. [Dépannage opérationnel](#section-17)
18. [Exercices avec correction](#section-18)
19. [Glossaire et critères de recette](#section-19)
20. [Références d'intégration et limites de validation](#section-20)
21. [Références et suivi documentaire](#section-21)
22. [Annexes — scripts et configurations complets](#section-22)

</details>

<a id="section-01"></a>

## 1. Lire ce guide et connaître son niveau de validation

**But : disposer d'un second chemin de contrôle prêt avant l'incident.** Si Trivy devient indisponible ou perd la confiance de l'équipe, Syft + Grype peut prendre le relais sur le périmètre qualifié. Le déploiement reste bloqué si aucun contrôle fiable ne subsiste.

La bascule ressemble à l'ouverture d'un **second poste de contrôle**. Elle conserve les règles d'acceptation et les preuves demandées.

### Choisir son parcours

| Votre besoin | Lire en priorité |
|---|---|
| Découvrir les notions | [Outils](#section-03), puis [architecture](#section-04) |
| Réaliser un premier essai | [Installation](#section-05), [même image de bout en bout](#section-06), [lecture du SBOM](#section-07) |
| Préparer la CI et la décision | [Politique](#section-08), [Azure DevOps](#section-09), [qualification](#section-10) |
| Basculer pendant un incident | [Runbook de bascule](#section-14) ; en cas de compromission, commencer par la [réponse à incident](#section-12) |
| Revenir au nominal ou dépanner | [Retour à Trivy](#section-15), [dépannage](#section-17) |
| Copier un script complet | [Annexe intégrée](#section-22) |

### Les repères utiles avant de commencer

- **Image** : le colis logiciel à examiner. Son **digest**, une empreinte de contenu SHA-256, fixe l'objet analysé ; un tag peut changer.
- **SBOM**, *Software Bill of Materials* : la liste des composants observés dans le colis. [Syft et Grype](#section-03) séparent inventaire et recherche de vulnérabilités.
- **CI**, intégration continue : construction et tests. **CD**, livraison ou déploiement continu : étapes conduisant à la livraison.
- **GitOps** : le cluster applique l'état déclaré dans Git. Une **MR**, *Merge Request*, propose une modification avant sa revue et sa fusion.
- **CLI** : interface en ligne de commande. **API** : interface de programmation. **DB** : base de données. **JSON** et **YAML** : formats de données structurées.
- **OCI**, *Open Container Initiative* : standards des images et registres. **CVE** : identifiant de vulnérabilité ; **GHSA** : avis de sécurité GitHub.

FacturaDJ conserve GitHub comme référence source, Azure DevOps pour la CI, Harbor pour les images et GitLab pour les manifests GitOps. Après approbation et fusion de la MR, Argo CD sur Talos/Proxmox doit déployer via WireGuard vers `k3d-nexora`, dans `facturadj-preprod`. L'export sélectif GitHub → GitLab est annoncé comme existant et doit être préservé. L'[architecture](#section-04) distingue ces informations fournies de la cible à vérifier.

### Ce qui est préparé et ce qui reste à valider

| Contrôle | Portée et statut |
|---|---|
| Sources et versions | Recherche technique du **16 octobre 2026**, conservée dans cette révision pédagogique ; aucune mise à jour des versions supposée |
| Logique de décision | **25 tests unitaires réussis** lors de la livraison initiale : outils simulés, aucune détection réelle mesurée |
| Scripts et exemples | Scripts complets intégrés ; contrôles de syntaxe et de cohérence décrits dans le bilan de révision |
| Linux et signatures | Installations, vérifications cryptographiques réelles et compatibilité des scans **à exécuter** sur une VM saine |
| Infrastructure | Harbor, Azure DevOps, GitLab, Argo CD et WireGuard **non testés sur votre installation** |
| Affichage Starlight | Projet distant inaccessible : build du site, navigation et affichage sur votre VM **à contrôler** |

Les configurations sont des **candidats à qualifier**. Les empreintes à renseigner, autorisations désactivées et profils vides bloquent volontairement une utilisation prématurée. Les sorties attendues ne sont jamais présentées comme des mesures de FacturaDJ.

> **Attention — outil compromis.** Changer de scanner ne répare pas un agent exposé. Préserver les preuves, traiter les secrets accessibles et reconstruire l'environnement si nécessaire : voir la [réponse à incident](#section-12).

Ce fichier contient les procédures, les scripts, les configurations et les tests. Les chemins `continuite-scan-support/...` désignent les fichiers à **recréer depuis l'annexe sur la VM de travail** ; aucun paquet supplémentaire n'est nécessaire pour obtenir leur contenu.

<a id="section-02"></a>

## 2. Comprendre les incidents Trivy de mars 2026

Les incidents de mars 2026 montrent pourquoi le scanner doit lui aussi faire l'objet de contrôles. Il faut d'abord identifier la nature du problème : la réponse dépend de ce qui a perdu sa fiabilité.

| Situation | Ce qu'elle signifie | Réponse à préparer |
|---|---|---|
| Vulnérabilité logicielle | Une faiblesse du programme peut être exploitée. | Évaluer l'exposition et qualifier une version corrigée ou un secours. |
| Compromission de la distribution | Un attaquant agit sur la fabrication, la publication ou les références des artefacts. | Interdire le composant suspect avant son exécution et examiner l'environnement exposé. |
| Indisponibilité technique | Une base, une connexion ou un autre service nécessaire ne répond plus. | Diagnostiquer l'erreur et utiliser le secours autorisé, s'il reste fiable. |

Une bascule ne répond donc pas, à elle seule, à une compromission. Les faits ci-dessous proviennent des communications officielles consultées le **16 octobre 2026**.

### Ce que les communications officielles établissent

**L'annonce du 20 mars.** La discussion **#10425** décrit l'attaque du **19 mars** comme une suite de l'incident divulgué le **1er mars**. Des identifiants avaient été exfiltrés. Le confinement initial était incomplet et la rotation des accès n'avait pas été atomique. Les mainteneurs signalent aussi l'interruption temporaire des constructions des bases, puis leur rétablissement. Cette indisponibilité est une conséquence opérationnelle de l'incident. [Annonce officielle #10425](https://github.com/aquasecurity/trivy/discussions/10425).

**Le bilan du 30 mars.** La discussion **#10462** situe l'accès initial au **27 février**, via un workflow vulnérable utilisant `pull_request_target`. Pour le **1er mars**, elle rapporte la suppression de releases et la prise de contrôle du dépôt : celui-ci a été renommé et rendu privé, tandis qu'un dépôt public vide le remplaçait. Une exfiltration a persisté pendant la remédiation.

Le bilan mentionne aussi une extension VS Code malveillante sur OpenVSX, retirée le 1er mars. L'inventaire d'exposition doit donc inclure les postes de développement. Les mesures annoncées comprennent une révocation globale des accès avant leur renouvellement, le durcissement des workflows et des attestations de provenance. Ces mesures ne garantissent pas l'innocuité de tout artefact ultérieur. [Bilan officiel #10462](https://github.com/aquasecurity/trivy/discussions/10462).

**L'avis technique.** Publié le **21 mars**, puis enrichi, **GHSA-69fq-xp46-6x23** précise les composants concernés. Les fenêtres ci-dessous reprennent ses heures **UTC**, parfois approximatives. Conserver également les horodatages UTC dans les journaux d'investigation.

| Composant | Périmètre historique signalé | Fenêtre indiquée en UTC |
|---|---|---|
| Trivy | Binaire et images `0.69.4`, également accessibles via `latest` | 19 mars, 18:22 à environ 21:42 |
| `trivy-action` | Tags antérieurs à `0.35.0` détournés ; cas transitifs à vérifier dans l'avis | 19 mars, environ 17:43 au 20 mars, environ 05:40 |
| `setup-trivy` | Sept tags remplacés ; `0.2.6` ensuite recréé avec un contenu sain | 19 mars, environ 17:43 à 21:44 |
| Images Docker Hub | `0.69.5` et `0.69.6`, sans releases GitHub correspondantes | 22 mars, 15:43 au 23 mars, environ 01:40 |

L'avis associe **CVE-2026-33634** à du code malveillant embarqué. Il faut examiner les dépendances transitives des références épinglées et rechercher les artefacts retirés qui subsisteraient dans les caches. Pour les indicateurs, les empreintes et les cas d'exposition détaillés, consulter l'avis à jour. [Avis officiel GHSA-69fq-xp46-6x23](https://github.com/aquasecurity/trivy/security/advisories/GHSA-69fq-xp46-6x23).

**Les consignes d'Aqua.** La page fournie porte le titre « Update: Ongoing Investigation and Continued Remediation » et la date du **1er avril 2026**. Elle conserve plus bas le billet initial du **22 mars**. Aqua demande de traiter comme exposés les secrets accessibles aux pipelines si une version compromise a pu être exécutée, puis de les renouveler. Le code hostile pouvait s'exécuter avant ou parallèlement au scan légitime. Un rapport apparemment normal n'écarte donc pas la compromission. [Communication officielle Aqua](https://www.aquasec.com/blog/trivy-supply-chain-attack-what-you-need-to-know/).

> **Attention — versions historiques.** Les versions `0.69.2` et `0.69.3`, citées comme épargnées par cet incident, ne constituent pas une recommandation d'installation pour octobre. À chaque qualification, vérifier les avis applicables à la version candidate, à son usage et aux correctifs disponibles dans le [registre officiel des avis Trivy](https://github.com/aquasecurity/trivy/security/advisories/).

**Limite de la recherche :** la discussion initiale `#10265`, consacrée au 1er mars, n'a pas pu être lue. La synthèse de cette date repose sur le bilan officiel ultérieur. Les annonces immédiates, l'avis technique et le bilan ont des dates et des niveaux de détail différents.

### Ce que FacturaDJ doit en tirer

Les mesures suivantes sont **proposées par ce guide**. Elles restent à implémenter et à tester.

1. **Prévoir un arrêt avant exécution.** Distinguer la perte de confiance de la panne. L'interdiction doit couvrir le téléchargement, l'initialisation et l'exécution du composant suspect.
2. **Préparer un secours indépendant.** Utiliser un pool reconstruit depuis une image approuvée, un cache contrôlé et des identifiants réémis après évaluation de l'exposition.
3. **Recenser tous les usages de Trivy.** Inclure le binaire CI, les images d'agents, les scripts, les actions GitHub, les extensions des postes, le scanner Harbor et les mises à jour des bases. Vérifier qu'aucun autre usage ne reste actif ou bloquant après la bascule.
4. **Préserver les preuves.** Distinguer téléchargement et exécution, puis environnement exposé et environnement simplement similaire. Effectuer cette analyse avant le nettoyage.
5. **Conserver un verrou de déploiement.** Bloquer les promotions et les modifications GitOps sans contrôle fiable. Une synchronisation Argo CD réussie ne démontre pas la conformité de l'image.

<a id="section-03"></a>

## 3. Comprendre les trois outils et leur périmètre

Un **SBOM** (*Software Bill of Materials*, nomenclature logicielle) est la liste des composants observés dans une image. Il ressemble à une liste d’ingrédients. Il aide à savoir quels logiciels contrôler et à retrouver les images concernées par une nouvelle alerte.

Le parcours se lit ainsi :

1. **Syft inventorie le colis.** Il identifie les composants et leurs versions.
2. **Grype contrôle les ingrédients.** Il compare cet inventaire aux avis de vulnérabilité de sa base.
3. **La politique décide.** Elle accepte ou rejette l’image selon les critères approuvés.

**Trivy** réunit l’inventaire et l’analyse dans un même parcours. Il propose aussi d’autres contrôles. La bascule vers Syft + Grype ouvre un second poste de contrôle ; elle conserve les critères d’acceptation.

> **Attention** — Un ingrédient peut manquer dans l’inventaire. Une version peut être inconnue. Des binaires statiques ou des dépendances copiées à la main peuvent échapper aux catalogues. L’absence de détection ne prouve donc pas l’innocuité de l’image.

Une alerte ne suffit pas non plus à établir qu’une vulnérabilité est exploitable dans l’application. Il faut examiner son contexte. Le SBOM reste stable pour un artefact et une méthode d’inventaire donnés. Les alertes et les correctifs, eux, évoluent.

### Versions candidates et niveau de validation

Les sources ont été consultées le **16 octobre 2026**. Les versions ci-dessous sont fixées pour préparer la qualification. Elles ne décrivent pas les versions observées de FacturaDJ. Leur présence dans ce guide ne vaut pas approbation de confiance par l’organisation.

| Outil | Version candidate | Publication officielle vérifiée |
|---|---|---|
| Trivy | `0.76.0` | 14/10/2026 — [release v0.76.0](https://github.com/aquasecurity/trivy/releases/tag/v0.76.0) |
| Syft | `1.54.1` | 06/10/2026 — [release v1.54.1](https://github.com/anchore/syft/releases/tag/v1.54.1) |
| Grype | `0.120.1` | 06/10/2026 — [release v0.120.1](https://github.com/anchore/grype/releases/tag/v0.120.1) |

Les distributions offrent les preuves suivantes :

- **Trivy** : sommes de contrôle, bundles Sigstore des artefacts et signature des images documentée.
- **Syft et Grype** : fichier de sommes de contrôle signé et bundle `checksums.txt.sigstore.json`.

Un *bundle* regroupe du matériel de vérification de signature. La section installation explique comment l’utiliser. Les pages indiquent des releases immuables : leur remplacement est plus difficile. Cela ne valide ni le code ni les identifiants ayant servi à le publier.

| Niveau de validation | État au 16/10/2026 |
|---|---|
| Lecture documentaire | Releases, formats, gestion des retours et métadonnées des versions fixées examinés |
| Validation réelle | Téléchargement et signatures des binaires, exécution Linux, images représentatives, Harbor et mesures CI/CD restent à tester |

Les sorties présentées dans la suite sont des **résultats attendus**. Elles ne sont pas des mesures réalisées pour FacturaDJ. Avant de réutiliser une version dite « connue saine », revoir ses avis de sécurité, ses dépendances et sa compatibilité avec les bases actuelles.

### Comparer les fonctions et les images analysées

| Critère | Trivy `0.76.0` | Syft `1.54.1` + Grype `0.120.1` |
|---|---|---|
| Rôle | Inventaire, analyse et contrôles supplémentaires | Syft inventorie ; Grype recherche les vulnérabilités |
| Images | Registre, moteur local, archives Docker et répertoire OCI | Registre, Docker/Podman et autres sources ; archives Docker/OCI et répertoires OCI |
| Paquets système | Détection liée aux distributions et à leurs avis | Catalogue Syft ; correspondances Grype liées à la distribution |
| Python/Django | Dépendances installées reconnues par les analyseurs | Catalogues Python, métadonnées d’installation et correspondances aux avis |
| JavaScript/Astro | Analyseurs de dépendances applicatives | Catalogues JavaScript/npm et autres formats pris en charge |
| Autres écosystèmes | Java, Go, .NET, Ruby, Rust, PHP, etc., selon les analyseurs | Nombreux écosystèmes inventoriés ; couverture des avis Grype à vérifier séparément |

Pour comparer utilement les deux chemins, vérifier ces points :

- **Image** : même manifeste enfant, même plateforme et mêmes fichiers. Un manifeste décrit l’image distribuée ; la section 6 explique comment le figer.
- **Paquets système** : distributions Debian/Ubuntu, Alpine ou RPM et bases réellement utilisées.
- **Python** : packages `pip`, roues (*wheels*), environnement virtuel, versions et paquets système liés.
- **JavaScript** : dépendances présentes dans l’image finale. Le résultat du build peut ne plus contenir les sources ni `node_modules`.
- **Autres composants** : un paquet inventorié par Syft n’est pas nécessairement couvert par une source d’avis Grype.

### Comparer les contrôles et les rapports

| Critère | Trivy `0.76.0` | Syft `1.54.1` + Grype `0.120.1` |
|---|---|---|
| Secrets | Fonction disponible, selon la configuration | Aucune équivalence fournie par ce duo |
| Mauvaises configurations | Contrôles de fichiers et d’infrastructure | Aucune équivalence fournie par ce duo |
| Licences | Collecte et contrôles, selon les options | Syft collecte des informations ; Grype ne remplace pas une politique de licence |
| Rapports | Table, JSON, SARIF, modèles et sorties SBOM selon la commande | Syft : JSON natif, SPDX, CycloneDX. Grype : JSON, table, SARIF, CycloneDX et modèles selon la version |

**Action à préparer** : attribuer un contrôle dédié aux secrets, aux configurations d’infrastructure et à Kubernetes, puis aux licences. Une licence inconnue n’est pas une licence autorisée. Pour la décision automatisée, utiliser le JSON natif, valider sa structure et conserver le rapport brut.

Les formats SPDX et CycloneDX sont détaillés en section 7. SARIF est un format d’échange de résultats d’analyse. La présence d’un format de rapport ne démontre pas une couverture équivalente.

### Comparer l’exploitation et la maintenance

| Critère | Trivy `0.76.0` | Syft `1.54.1` + Grype `0.120.1` |
|---|---|---|
| Hors ligne | Base de vulnérabilités, éventuelle Java DB, règles et image disponibles localement | Syft inventorie localement sans base de vulnérabilités ; Grype a besoin de sa DB locale |
| Base de vulnérabilités | Agrégation Aqua de sources éditeurs et communautaires | Agrégation Anchore ; fournisseurs et dates présents dans le rapport |
| Cache | Cache d’analyse distinct de la DB et des règles | Cache image/inventaire éventuel, DB Grype et métadonnées d’import distincts |
| CI/CD | Interface en ligne de commande ; intégrations à inventorier | Deux interfaces en ligne de commande ; SBOM archivable et réanalysable |
| Performance | À mesurer sur le jeu de qualification | Coût initial Syft + Grype ; la réanalyse d’un SBOM évite un nouvel inventaire |
| Maintenance | Binaire, image, DB, règles et éventuelles actions | Deux binaires/images, catalogues, schémas SBOM et DB |

La **DB** (*database*) est la base de données utilisée pour les avis. La **CI/CD** désigne ici la chaîne d’intégration et de livraison/déploiement continus.

Pour l’exploitation, contrôler l’accès au registre, la confiance, la fraîcheur et la complétude. Conserver l’origine et la date de construction des bases, ainsi que la fraîcheur de leurs flux amont. Un cache provenant d’un environnement suspect exige un traitement de réponse à incident avant toute réutilisation.

Aucune supériorité de performance chiffrée n’est établie ici. Mesurer les caches froids et chauds avec la même politique. Maintenir le secours et exercer son activation avant incident. Les deux chemins doivent respecter la même autorisation de promotion vers le déploiement.

Sources de couverture : [Trivy](https://trivy.dev/latest/docs/), [Syft au tag retenu](https://github.com/anchore/syft/blob/v1.54.1/README.md), [cibles Grype](https://oss.anchore.com/docs/guides/vulnerability/scan-targets/), [écosystèmes Grype](https://oss.anchore.com/docs/guides/vulnerability/ecosystems/) et [sources des avis Grype](https://oss.anchore.com/docs/reference/grype/data-sources/). Ces listes décrivent des capacités. Le dossier de qualification doit démontrer la couverture utile à FacturaDJ.

> **À retenir** — Le secours couvre les vulnérabilités des composants des images qualifiées. Indiquer aussi qui assure les secrets, les mauvaises configurations et les licences quand Trivy est désactivé. Si un contrôle indispensable n’a pas de remplaçant fiable, la promotion reste bloquée.

<a id="section-04"></a>

## 4. Architecture, responsabilités et intégration FacturaDJ

### Situer l'existant et la cible

Cette architecture est une **cible à implémenter et à qualifier**. L'infrastructure n'a pas été inspectée pendant la rédaction. L'export sélectif GitHub → GitLab et l'instance Argo CD de Talos/Proxmox sont des existants déclarés par l'utilisateur ; les autres fonctions décrites restent à vérifier.

| Élément | Rôle et état retenu | À vérifier avant activation |
|---|---|---|
| GitHub | Référence source à préserver | Dépôt, commit, protections et identités |
| Azure DevOps | CI à conserver ; configuration inconnue | Pipelines, agents, isolation et ressources protégées |
| Harbor | Registre à conserver ; politiques inconnues | Version, scanners, seuils de pull et comptes robots |
| Export GitHub → GitLab | Export sélectif existant déclaré | Fichiers exportés, sens du flux et propriété des modifications |
| GitLab | Manifests GitOps ; approbation puis fusion d'une MR attendues | Branche suivie, chemins, édition et approbations obligatoires |
| Argo CD sur Talos/Proxmox | Instance existante déclarée | Application, AppProject et accès au cluster distant |
| WireGuard | Réseau prévu entre Talos et le VPS | Routes depuis le contrôleur Argo, retour réseau et pare-feu |
| k3d-nexora sur VPS | Cluster de destination prescrit | API distante, certificats et accès des nœuds à Harbor |
| facturadj-preprod | Namespace de destination prescrit | Existence, droits, imagePullSecrets et quotas |

Une **Merge Request (MR)** propose une modification GitLab avant fusion. Avec **GitOps**, Argo CD rapproche le cluster de l'état décrit dans Git. Le **RBAC** est le contrôle d'accès par rôles ; la **CA**, l'autorité de certification ; les **SAN**, les noms ou adresses couverts par un certificat TLS.

### Socle commun : stocker, contrôler, autoriser

1. Le build produit une image à partir d'un commit approuvé et la stocke dans une **quarantaine privée** Harbor. Le digest identifie le manifeste analysé.
2. Un agent sain exécute le mode de scan approuvé. Il consomme les outils et bases déjà qualifiés ; les contrôles secrets, configurations et licences restent nécessaires.
3. Le contrôle de décision, appelé *gate*, évalue le rapport, sa couverture, sa fraîcheur et ses preuves. Seul `PASS` autorise la promotion du digest. Les autres états bloquent la suite.
4. Un rôle distinct rend l'image déployable, puis propose son digest dans une MR GitOps. L'approbation et la fusion précèdent le déploiement.

**Stocker ne signifie pas autoriser.** Les identités des nœuds et d'Argo ne doivent pas pouvoir lire la quarantaine. Le scanner la lit sans droit de promotion, de modification GitOps ou de déploiement.

Le wrapper fourni traite un manifeste de registre par digest, pour une plateforme qualifiée. Avec une image multiplateforme, qualifier chaque manifeste enfant déployable. Après copie, vérifier le digest final : une conversion de manifeste peut le changer. Dans ce cas, produire les preuves sur ce nouveau sujet avant de l'autoriser.

### Chemin nominal avec Trivy

1. L'agent CI sain lit l'image Harbor par digest.
2. Trivy analyse ses vulnérabilités avec un snapshot de base frais et vérifié, approvisionné séparément depuis les sources approuvées.
3. Le rapport JSON et l'inventaire rejoignent les preuves des contrôles annexes.
4. La politique commune produit la décision. Archiver les preuves, puis promouvoir le même digest uniquement après `PASS`.

Le scanner intégré à Harbor, s'il est activé, constitue un autre service. Sa qualification et ses règles de pull doivent être contrôlées séparément du scan CI.

### Chemin de secours avec Syft et Grype

1. Sur l'agent de secours sain, Syft inventorie **la même image par digest** : il ouvre le colis et établit sa liste d'ingrédients, le SBOM.
2. Grype compare cet inventaire aux alertes connues dans une base fraîche et approuvée. L'approvisionnement de la base reste distinct du scan.
3. Archiver le SBOM et le rapport avec le commit, le build, le digest, les versions et la base consommée.
4. Appliquer la même politique et les mêmes contrôles annexes. `PASS` permet la promotion et la MR ; les autres états bloquent.

Un SBOM archivé peut être réexaminé avec une nouvelle base. Cela produit une **nouvelle décision**, sans modifier le contexte historique de l'ancien rapport.

> **À retenir** — La bascule ouvre un second poste de contrôle. Elle conserve la décision de sécurité et la traçabilité.

### FacturaDJ : responsabilités de chaque outil

La chaîne de décision demandée reste **GitHub → Azure DevOps → Harbor → GitLab → Argo CD → k3d-nexora**.

| Étape | Responsable | Résultat attendu |
|---|---|---|
| Source et export | GitHub | Commit de référence ; export sélectif préservé |
| Construction et scan | Azure DevOps | Build isolé, image en quarantaine et preuves de scan |
| Stockage et promotion | Harbor | Digest rendu déployable par un rôle distinct après `PASS` |
| Changement souhaité | GitLab | MR avec digest final et preuves, approuvée puis fusionnée |
| Réconciliation | Argo CD sur Talos/Proxmox | Lecture de la révision fusionnée et appel de l'API du VPS |
| Exécution | k3d-nexora | Déploiement dans `facturadj-preprod` ; pull Harbor par les nœuds |

Les flux réseau suivent ces responsabilités : Git transporte le code et les manifests ; OCI transporte les images ; le stockage d'artefacts conserve les preuves ; l'API Kubernetes reçoit les opérations de déploiement. **Argo n'envoie pas l'image au VPS** : les nœuds la téléchargent depuis Harbor avec leur propre identité.

L'export existant doit conserver son périmètre sélectif et préserver les digests approuvés par MR. Après inventaire des chemins réels, choisir un modèle :

1. L'export gère les manifests applicatifs ; une surcharge propre à GitLab porte le digest de déploiement.
2. L'export produit une branche de proposition, soumise à MR avant d'atteindre la branche suivie par Argo.

Documenter le propriétaire de chaque fichier. **Vérification :** deux exports successifs doivent préserver une promotion fusionnée, sans écraser son digest ni pousser directement une modification déployable.

### Inventorier toutes les invocations Trivy

Rechercher dans les dépôts et dans les consoles d'administration. Une mention documentaire ne prouve pas une exécution ; une recherche vide ne prouve pas son absence.

| Surface | Points à relever | Action si Trivy devient suspect |
|---|---|---|
| Azure YAML, templates, scripts | Commandes, extensions, images, endpoints et commit du template utilisé | Interdire les invocations avant les nouveaux jobs |
| Agents et conteneurs de scan | Digests, binaires, bootstrap et caches embarqués | Retirer les agents exposés et reconstruire depuis un environnement sain |
| Harbor | Scanner système/projet, adaptateurs, scan sur push, planifications et files | Suspendre les jobs concernés avant tout push |
| GitHub Actions | Actions Trivy, setup, workflows réutilisables ou planifiés | Suspendre les workflows concernés |
| GitLab et déploiement | Pipelines, promotion, hooks et admission | Remplacer par un chemin qualifié ou bloquer la fonction |
| Postes et administration | Cron, tâches système, scripts et miroirs | Identifier les propriétaires et interdire les copies concernées |

Depuis une copie de dépôt de confiance, commencer par cette recherche en lecture seule. `rg` est ripgrep ; s'il manque, l'installer par le mécanisme local approuvé.

```bash
: "${REPO_ROOT:?Chemin réel du dépôt à inventorier requis}"
rg -n --hidden --glob '!.git/**' --glob '!continuite-scan-support/**' \
  '(trivy|aquasecurity|trivy-action|with-trivy)' "$REPO_ROOT"
```


Compléter les résultats avec les configurations hors dépôt. Exporter les seuls paramètres nécessaires, sans secrets. Chaque propriétaire consigne l'état de sa surface : désactivée, remplacée et qualifiée, ou bloquée.

### Du scan à la MR : preuves et séparation des droits

1. **Build.** Partir du commit GitHub vérifié, des dépendances verrouillées et d'une base approuvée. Produire le digest de quarantaine et l'identifiant du build avec les seuls droits de lecture source et d'écriture de quarantaine.
2. **Scan.** Lire ce digest avec les outils, bases et profils approuvés. Produire le rapport complet, le SBOM pour Grype, la décision et leurs empreintes. L'agent ne détient aucun accès GitOps ou Kubernetes.
3. **Promotion.** Vérifier `PASS`, l'intégrité, la concordance image/build, les dates et la confiance actuelle. Le rôle de promotion lit la quarantaine et écrit seulement dans le périmètre déployable ; conserver son reçu et le digest final.
4. **MR.** Proposer le digest final dans la branche réelle de déploiement, avec commit/build, liens et empreintes des preuves, politique et exceptions. Le bot peut proposer, sans push direct ni fusion non approuvée.
5. **Fusion.** Revalider les preuves et leur expiration, puis exiger l'approbateur habilité. Conserver le commit de fusion. Si les preuves expirent pendant l'attente, laisser la MR bloquée ; tout changement de digest demande une nouvelle revue.
6. **Déploiement.** Argo lit ce commit et agit seulement sur la destination autorisée. Vérifier la révision Argo et l'imageID dans le bon namespace.

Un `PASS` modifiable dans le checkout applicatif ne suffit pas. La promotion exige des preuves reçues par un canal authentifié, immuables ou signées par une identité indépendante. Une empreinte détecte un changement par rapport à une valeur de confiance ; elle ne prouve pas seule l'origine du fichier.

### Protéger le choix du scanner dans Azure DevOps

`SCANNER_MODE=trivy|grype` est une conception à implémenter. Le mode et le pool sain proviennent d'une configuration administrée par sécurité et exploitation, avec identifiant de décision, approbateur, date et expiration. Vérifier la confiance **avant toute invocation**, y compris `--version`. Si Trivy est suspect, `trivy_allowed=false` doit être effectif avant le démarrage.

Protéger le template et les ressources réellement consommées par les jobs :

1. Imposer un template approuvé avec `extends` et un contrôle **Required template** sur la ressource sensible.
2. Gérer approbations et checks hors YAML, notamment pour accéder au rôle de promotion.
3. Restreindre les droits de modification/lancement, les remplacements à la mise en file et les variables écrites par les jobs. `readonly` et une liste de valeurs ne remplacent pas ces droits.
4. Tester sur le tenant installé qu'une définition ou un mode non autorisé ne peut pas utiliser la ressource.

Sources : [approbations et checks](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/approvals?view=azure-devops), [templates de sécurité](https://learn.microsoft.com/en-us/azure/devops/pipelines/security/templates?view=azure-devops), [variables et paramètres](https://learn.microsoft.com/en-us/azure/devops/pipelines/security/inputs?view=azure-devops).

| Situation | Décision | Suite autorisée |
|---|---|---|
| Scan conforme, outil fiable | `0` | Continuer avec ce résultat |
| Vulnérabilité bloquante | `10` | Corriger ou faire examiner une exception ; aucun second avis automatique |
| Erreur technique autorisée | `20` | Arrêter le run ; décider d'un nouveau run de secours |
| Outil ou environnement suspect | `30` | Interdire l'exécution, confiner et repartir d'un environnement sain |
| Aucun chemin fiable | Blocage | Aucune promotion |

Le wrapper ne contient **aucun repli automatique**. Une automatisation future devra reconnaître des causes techniques précises, exclure les rejets de sécurité et les suspicions, puis lancer un nouveau job de secours préqualifié en conservant la trace de l'échec. Un code non nul générique ne suffit pas à décider.

### Harbor : distinguer le scan CI du scan intégré

L'intégration d'un scanner Harbor passe par un **adaptateur HTTP** : déclaration des capacités, lancement puis récupération du rapport. Un JSON Grype produit par Azure ne remplit pas automatiquement ce contrat. Identifier et qualifier l'adaptateur éventuel avec la version Harbor installée. Sources : [spécification des adaptateurs](https://github.com/goharbor/pluggable-scanner-spec), [scans Harbor](https://goharbor.io/docs/main/administration/vulnerability-scanning/).

| Plan de contrôle | Ce qu'il fait | Prérequis |
|---|---|---|
| CI et promotion | Politique commune sur le rapport, preuves et accès à la quarantaine | Gate fiable, canal de preuves protégé, rôle de promotion séparé |
| Harbor | Scan intégré et restriction des pulls selon le seuil configuré | Scanner/adaptateur fiables et comportement testé sur un projet laboratoire |

Si l'adaptateur Trivy est suspect, suspendre ses déclencheurs et examiner les jobs déjà en file **avant le push**. Maintenir le blocage tant qu'un contrôle requis n'est pas assuré par un chemin approuvé. La promotion CI et la restriction des pulls Harbor se complètent ; elles doivent toutes deux être qualifiées.

Tester séparément les images rejetées, non scannées, avec scan en erreur ou rapport ancien. Avec un index multiplateforme, Harbor applique le contrôle au manifeste enfant téléchargé. Sources : [configuration des projets](https://goharbor.io/docs/main/working-with-projects/project-configuration/), [deployment security](https://goharbor.io/docs/main/administration/vulnerability-scanning/deployment-security/).

> **Attention** — L'option « Prevent vulnerable images from running » agit sur le téléchargement. Elle ne retire pas une image du cache d'un nœud et n'arrête pas les pods existants. Prévoir séparément l'admission sur preuve et la réévaluation des images déployées. [Images Kubernetes](https://kubernetes.io/docs/concepts/containers/images/).

Séparer les robots de build, scan, promotion et pull des nœuds. Tester que l'identité du VPS ne lit aucune copie de quarantaine, y compris via un autre dépôt. [Comptes robots Harbor](https://goharbor.io/docs/main/working-with-projects/project-configuration/create-robot-accounts/).

### GitLab : prouver que l'approbation est obligatoire

Argo suit uniquement la branche/révision autorisée. Interdire explicitement le push direct vers cette branche aux contributeurs et au bot de proposition, puis examiner les règles qui se superposent. Une case de droits vide ne garantit pas l'interdiction. [Branches protégées GitLab](https://docs.gitlab.com/user/project/repository/branches/protected/).

Les règles d'approbation obligatoires de la documentation consultée relèvent de Premium/Ultimate ; l'édition FacturaDJ reste inconnue. Vérifier avec une MR de laboratoire que la fusion sans approbation est refusée, puis qu'un nouveau commit exige la revue prévue. Un bouton ou un commentaire d'approbation ne suffit pas.

Sans capacité native adaptée, maintenir le blocage ou qualifier un service indépendant qui vérifie l'approbation et détient seul le droit de fusion. Ce service reste à développer et auditer. [Règles d'approbation GitLab](https://docs.gitlab.com/user/project/merge_requests/approvals/rules/).

### Réseau : Argo sur Talos, application sur le VPS

| Flux | Origine et destination | Contrôle nécessaire |
|---|---|---|
| Manifests | Argo → dépôt GitLab | Lecture limitée, révision autorisée et TLS/clé hôte validés |
| Déploiement | Pod du contrôleur Argo sur Talos → API k3d du VPS via WireGuard | Routes aller/retour, port publié, pare-feu, certificat et RBAC |
| Images | Nœuds du VPS → Harbor | Accès au périmètre déployable avec leur identité de pull |

La connexion du poste d'administration au VPS ne prouve pas celle du contrôleur. Déterminer l'URL réelle de l'API, le port publié, la CA et les SAN. Une adresse `127.0.0.1` du VPS ou un nom Docker privé n'est pas une destination distante utilisable depuis Talos. `https://kubernetes.default.svc` y désigne le cluster Talos. Garder la validation TLS active. Les `AllowedIPs`, routes retour et règles réseau dépendent de l'installation. [WireGuard](https://www.wireguard.com/quickstart/).

Enregistrer le cluster distant avec des permissions Kubernetes limitées à `facturadj-preprod`. L'AppProject autorise seulement le dépôt GitLab et cette destination. Précréer le namespace si Argo n'a pas le droit de créer des ressources cluster. Les champs `namespaces`, `clusterResources` et TLS du secret Argo complètent le RBAC. [Configuration déclarative Argo](https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/), [AppProjects](https://argo-cd.readthedocs.io/en/stable/user-guide/projects/).

Vérifier les effets de `argocd cluster add` avant de l'utiliser avec un contexte administrateur : sa procédure peut créer des droits larges. Préparer l'identité de namespace et tester ses permissions ; garder le kubeconfig administrateur hors des preuves. [Ajout de cluster](https://argo-cd.readthedocs.io/en/stable/user-guide/commands/argocd_cluster_add/), [démarrage officiel](https://github.com/argoproj/argo-cd/blob/master/docs/getting_started.md).

**Vérification depuis un poste de confiance.** Renseigner les contextes réels Talos/VPS, le namespace Argo et l'application de test. Les commandes observent la destination et l'état, sans modifier le cluster.

```bash
# Précondition : kubectl et argocd installés et authentifiés par l'administrateur.
: "${TALOS_CONTEXT:?Contexte Talos requis}"
: "${VPS_CONTEXT:?Contexte VPS requis}"
: "${ARGO_NS:?Namespace réel Argo requis}"
: "${ARGO_APP:?Application de test requise}"

# Vérifie l'existence de la destination et l'accès du poste, pas celui du pod Argo.
kubectl --context "$VPS_CONTEXT" get namespace facturadj-preprod
kubectl --context "$VPS_CONTEXT" get --raw=/version

# Observe l'enregistrement et la destination connue d'Argo sans modifier l'état.
argocd cluster list
argocd app get "$ARGO_APP" -o json > argo-before.json
python3 - <<'PY'
import json
a = json.load(open("argo-before.json", encoding="utf-8"))
print("Destination :", a["spec"]["destination"])
print("Révision observée :", a.get("status", {}).get("sync", {}).get("revision"))
print("État synchronisation :", a.get("status", {}).get("sync", {}).get("status"))
PY

# Observe les pods du contrôleur et leur journal, sans lire les secrets.
kubectl --context "$TALOS_CONTEXT" -n "$ARGO_NS" get pods \
  -l app.kubernetes.io/name=argocd-application-controller -o wide
```


**Attendu :** l'API du VPS répond, Argo connaît cette destination dans `facturadj-preprod`, sans erreur TLS/RBAC. Si seul le poste réussit, diagnostiquer le réseau du contrôleur avec l'outillage déjà approuvé. Tester séparément le pull Harbor des nœuds ; ne pas installer un outil de dépannage non vérifié pendant l'incident.

Activer la synchronisation automatique après les tests d'approbation. La **fusion** déclenche le nouvel état souhaité. Qualifier séparément `prune`, `selfHeal` et les retries ; leur activation n'est pas présumée. Restaurer durablement une image par une nouvelle MR portant un digest encore approuvé. [Synchronisation automatique Argo](https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/).

<a id="section-05"></a>

## 5. Installer et préparer les scanners sous Debian/Ubuntu

Ce chapitre prépare les outils **avant l’incident**. Exécuter les commandes dans la VM distante Debian/Ubuntu de qualification, depuis le terminal connecté à cette VM. Cette station doit être saine, distincte des agents soupçonnés et dépourvue d’identifiants de déploiement.

Les scripts et configurations cités sont intégralement inclus dans l’**annexe 22**. Avant une commande qui utilise `continuite-scan-support/...`, recréer ce chemin sur la VM avec le contenu de l’annexe. Aucun fichier de support séparé n’est nécessaire pour disposer de leur source.

### Préparer une station d’approvisionnement saine

La station d’approvisionnement télécharge, vérifie et met en réserve les outils. L’agent de secours utilisera ensuite les artefacts approuvés.

**Prérequis** :

- Bash, `curl`, `tar`, `sha256sum`, `awk` et `jq`.
- Certificats des autorités de certification (**CA**) à jour.
- **Cosign 3.x déjà approuvé**, pour vérifier les signatures.
- Docker et Skopeo uniquement pour les exercices sur les images.

Enregistrer la version exacte, l’origine, l’empreinte (*hash*) et les preuves de Cosign dans le registre d’outillage. La procédure ci-dessous ne télécharge pas son propre vérificateur. Un Cosign plus ancien n’est pas implicitement compatible avec les bundles de signature.

Pour les utilitaires système, utiliser les dépôts et le mécanisme de mise à jour approuvés. En laboratoire, la préparation usuelle est :

```bash
sudo apt-get update
sudo apt-get install --no-install-recommends ca-certificates curl tar coreutils gawk jq
cosign version                 # Conserver la version exacte et sa provenance approuvée.
uname -srm                     # Vérifier Linux et l’architecture.
dpkg-query -W ca-certificates curl tar coreutils gawk jq
```

**Vérification** : les commandes affichent les versions installées, Linux et l’architecture. Conserver ces informations avec la recette de la VM. Relever aussi les versions et le mode d’installation de Docker et Skopeo lorsqu’ils sont utilisés.

Cette préparation apt ne suffit pas à reproduire un agent : les paquets dépendent du dépôt du jour. Pour la CI, construire une image interne depuis une base approuvée par **digest**, c’est-à-dire par empreinte du contenu. Enregistrer les versions des paquets ou utiliser un dépôt figé (*snapshot*). Ne pas lancer ces mises à jour automatiquement à chaque pipeline.

### Installer les trois versions avec vérification obligatoire

**But** : conserver les archives, leurs preuves et les binaires versionnés. L’installation crée un verrou candidat ; elle n’active pas une configuration de production.

Après approbation des versions et du vérificateur, recréer `install-tools.sh` depuis l’annexe 22, puis lancer :

```bash
export TOOL_ROOT="$PWD/outillage-candidat"
bash continuite-scan-support/scripts/install-tools.sh
# Après revue des preuves et approbation des candidats :
export PATH="$TOOL_ROOT/bin:$PATH"
trivy --version
syft version
grype version
python3 -m json.tool "$TOOL_ROOT/tools.lock.candidate.json"
```

**Résultat attendu, non exécuté ici** :

- Les vérifications Cosign réussissent et leurs journaux sont conservés.
- Les empreintes des archives Anchore correspondent aux sommes de contrôle signées.
- Les versions affichées sont exactement `0.76.0`, `1.54.1` et `0.120.1`.

Les binaires se trouvent sous `TOOL_ROOT/<outil>/<version>/<outil>`. Les liens de `bin/` permettent les commandes courtes du tutoriel. `tools.lock.candidate.json` contient les véritables empreintes des binaires. Faire approuver ce verrou avant son provisionnement en CI.

**En cas d’échec** : conserver les preuves et expliquer l’écart. Garder la vérification et la version choisie pendant le diagnostic. L’architecture détectée, amd64 ou arm64, reste à qualifier pour l’agent concerné.

Les identités attendues proviennent des [installateurs Syft](https://github.com/anchore/syft/blob/v1.54.1/install.sh) et [Grype](https://github.com/anchore/grype/blob/v0.120.1/install.sh), ainsi que de la [documentation Trivy taguée](https://github.com/aquasecurity/trivy/blob/v0.76.0/docs/getting-started/signature-verification.md).

Cosign 3.x désigne ici une famille compatible candidate, pas une version exacte observée sur cette VM. La recette finale doit aussi fixer Cosign, Python, Docker/Skopeo/kubectl s’ils sont utilisés, la distribution, les paquets et les CA. Qualifier ensuite cet ensemble.

### Comprendre les preuves avant d’approuver

| Preuve | Apport | Limite |
|---|---|---|
| Hash SHA256 | Les octets correspondent à l’empreinte attendue | L’empreinte récupérée avec le fichier peut elle-même provenir d’une source compromise |
| Signature et identité attendue | L’identité signataire a signé ces octets ; les contrôles cryptographiques et de transparence sont vérifiés | Le compte ou le workflow pouvait être compromis ; le logiciel peut rester dangereux |
| Attestation de provenance | Décrit la fabrication, ses sources et son environnement | Ne prouve ni l’innocuité des sources ni l’indépendance du constructeur vis-à-vis de l’incident |
| Digest d’image approuvé | Fixe l’objet distribué et évite une substitution de tag | Ne prouve pas que cet objet mérite la confiance |

Un *workflow* est la procédure automatisée qui fabrique ou publie l’artefact. Avant approbation, examiner les avis de sécurité, les sources et le workflow pertinents. Vérifier l’identité du constructeur, la date et le contexte de signature.

Une attestation doit correspondre au bon artefact et satisfaire la politique de confiance. Sa présence dans la release ne constitue pas une preuve indépendante des binaires. Les digests utilisés dans la procédure doivent toujours provenir d’artefacts réels.

### Utiliser des conteneurs de scanner par digest

**Où** : d’abord sur la station d’approvisionnement, puis sur l’agent de qualification. Les tags versionnés servent à trouver un candidat. La CI exécute ensuite son **digest approuvé**.

Les configurations de release mentionnent notamment `aquasec/trivy:0.76.0`, `anchore/syft:v1.54.1` et `anchore/grype:v0.120.1`. Confirmer leur disponibilité lors de l’approvisionnement. Les variables du bloc suivant doivent déjà contenir les références approuvées du registre d’outillage.

```bash
# Valeurs provenant du registre d’outillage protégé après qualification.
: "${TRIVY_IMAGE:?référence approuvée aquasec/trivy@sha256:... requise}"
: "${SYFT_IMAGE:?référence approuvée anchore/syft@sha256:... requise}"
: "${GRYPE_IMAGE:?référence approuvée anchore/grype@sha256:... requise}"
for ref in "$TRIVY_IMAGE" "$SYFT_IMAGE" "$GRYPE_IMAGE"; do
  [[ "$ref" =~ @sha256:[0-9a-f]{64}$ ]] || exit 30
done
# Cette vérification concerne l’image Trivy effectivement retenue.
cosign verify "$TRIVY_IMAGE" \
  --certificate-identity 'https://github.com/aquasecurity/trivy/.github/workflows/reusable-release.yaml@refs/tags/v0.76.0' \
  --certificate-oidc-issuer 'https://token.actions.githubusercontent.com' \
  > trivy-image-verification.json
docker run --rm --network none --read-only --cap-drop ALL \
  --security-opt no-new-privileges "$TRIVY_IMAGE" --version
docker run --rm --network none --read-only --cap-drop ALL \
  --security-opt no-new-privileges "$SYFT_IMAGE" version
docker run --rm --network none --read-only --cap-drop ALL \
  --security-opt no-new-privileges "$GRYPE_IMAGE" version
```

**Vérification** : la signature porte sur l’image Trivy retenue, puis chaque conteneur affiche sa version avec le réseau coupé. Ces résultats sont attendus ; ils n’ont pas été testés ici.

> **Attention** — Vérifier une archive Syft/Grype ne valide pas automatiquement l’image de conteneur du même outil. Aucune signature amont de ces images n’a été vérifiée ici.

Pour le socle proposé, construire des images internes depuis les binaires vérifiés et une base approuvée par digest. Conserver la recette et les preuves de fabrication. Signer dans une étape isolée, puis figer le digest après qualification. Si une image amont signée est effectivement disponible, vérifier l’identité exacte correspondant à sa fabrication.

#### Construire une image interne de scanner

Cette recette s’applique à l’un des trois binaires statiques **après vérification de ses dépendances**. Le contexte de build contient le binaire vérifié sous le nom `scanner`. Fournir un digest réel approuvé pour la base.

```dockerfile
# Frontend Dockerfile fourni par le builder approuvé et consigné.
ARG APPROVED_BASE
FROM ${APPROVED_BASE}
# Le contexte contient uniquement le binaire préalablement vérifié.
COPY --chmod=0555 scanner /usr/local/bin/scanner
USER 65532:65532
ENTRYPOINT ["/usr/local/bin/scanner"]
```

```bash
: "${APPROVED_BASE:?base interne approuvée par digest requise}"
[[ "$APPROVED_BASE" =~ @sha256:[0-9a-f]{64}$ ]] || exit 30
# Dans un contexte de build dédié, copier le binaire vérifié sous le nom scanner.
# TAG_INTERNE sert à publier le candidat ; retenir ensuite le digest résultant, jamais ce tag en CI.
: "${TAG_INTERNE:?tag du candidat dans le registre outillage requis}"
docker build --build-arg "APPROVED_BASE=$APPROVED_BASE" -t "$TAG_INTERNE" .
```

**À qualifier** : certificats CA, répertoire temporaire écrivable, droits de l’utilisateur non privilégié et chemin de DB. Monter seulement l’archive image et les données nécessaires au scan.

Le socket Docker donne accès au démon, le service qui pilote les conteneurs. Ses capacités peuvent être proches de celles d’un administrateur. Le montage `:ro` du socket ne rend pas les appels au démon inoffensifs. Utiliser l’archive quand elle suffit au parcours.

### Préparer les bases, leur fraîcheur et les caches

Lancer l’approvisionnement des bases dans un job distinct du scan. Ce job actualise les données, contrôle les métadonnées et calcule les empreintes. Il publie ensuite un snapshot protégé, dont le scanner reçoit une copie locale vérifiée.

**Avant de continuer** : le cache de secours doit provenir d’un environnement sain. La bascule doit rester possible sans réutiliser le cache Trivy de l’agent ayant déclenché l’incident.

| Élément | Emplacement ou commande | Contrôle à conserver |
|---|---|---|
| DB Trivy | `$TRIVY_CACHE_DIR/db/trivy.db` et `db/metadata.json` | Empreinte de chaque fichier ; date `UpdatedAt` ; schéma `Version` |
| Java DB Trivy | Répertoire `java-db`, si le périmètre l’exige | Même approvisionnement et mêmes contrôles ; maintien obligatoire si Java est requis |
| Règles Trivy | Bundle de contrôles pour secrets, configurations ou licences | Version et confiance propres à ce bundle |
| DB Grype | `$GRYPE_DB_CACHE_DIR/6/vulnerability.db` | `grype db status -o json` : `valid`, `schemaVersion`, `built`, `path`, `from` |
| Import Grype | `$GRYPE_DB_CACHE_DIR/6/import.json` | `digest`, `source`, `client_version` ; compléter par SHA256 et approbation externe |

<details>
<summary>Lire les champs de date et les empreintes des bases</summary>

Le fichier Trivy utilise **`Version`, `NextUpdate`, `UpdatedAt`, `DownloadedAt`**, avec majuscules. `DownloadedAt` date le transfert local. Il ne mesure pas l’âge des avis.

Grype utilise **`built`** pour la construction de sa base. Le champ `built_at` du manifeste interne est une convention de ce projet. Dans `import.json`, `digest` utilise `xxh64` : cette valeur n’est pas une empreinte cryptographique de confiance.

Sources : [métadonnées Trivy DB utilisées par Trivy 0.76.0](https://github.com/aquasecurity/trivy-db/blob/cbebf2ecd6df/pkg/metadata/metadata.go), [statut Grype](https://github.com/anchore/grype/blob/v0.120.1/grype/vulnerability/provider.go) et [import Grype](https://github.com/anchore/grype/blob/v0.120.1/grype/db/v6/import_metadata.go).

</details>

#### Acquérir un candidat et figer sa référence

**Où** : station saine, après approbation du verrou d’outils. Recréer `prepare-bases.sh` et la configuration de politique depuis l’annexe 22.

Le bloc résout un candidat Trivy DB une seule fois. Il calcule le digest des octets du manifeste reçu. Faire examiner l’origine, le manifeste et ce digest **avant la suite du bloc**.

```bash
# Sur la station saine, après installation puis approbation du verrou d'outils.
: "${TOOLS_LOCK_JSON:?chemin absolu du verrou approuvé requis}"
: "${TRIVY_DB_CANDIDATE:?repository OCI officiel ou miroir approuvé, tag de schéma explicite requis}"
# Résoudre une seule fois l'objet candidat ; l'approbation de l'origine reste distincte.
skopeo inspect --raw "docker://$TRIVY_DB_CANDIDATE" > trivy-db-manifest.candidate.json
TRIVY_DB_DIGEST="sha256:$(sha256sum trivy-db-manifest.candidate.json | awk '{print $1}')"
TRIVY_DB_SOURCE="${TRIVY_DB_CANDIDATE%:*}@$TRIVY_DB_DIGEST"
# Faire examiner ce manifeste, son origine et le digest avant la suite.
export TOOLS_LOCK_JSON TRIVY_DB_SOURCE
export DB_ROOT="$PWD/bases-candidates-$(date -u +%Y%m%dT%H%M%S)"
export POLICY_JSON="$PWD/continuite-scan-support/config/policy.json"
bash continuite-scan-support/scripts/prepare-bases.sh
python3 -m json.tool "$DB_ROOT/evidence/trivy-db.candidate.json"
python3 -m json.tool "$DB_ROOT/evidence/grype-db.candidate.json"
```

Pour ce profil, le tag de schéma Trivy DB documenté est `:2`. Fournir dans `TRIVY_DB_CANDIDATE` le dépôt approuvé avec un tag explicite, sans `@`. Retirer ce tag et ajouter le hash fixe le manifeste reçu. Si le registre renvoie un index, examiner sa résolution et sa compatibilité avec le lecteur OCI de DB avant approbation.

Le script utilise uniquement cette référence Trivy DB par digest. Pour Grype, il consigne la source `from` et la date `built` obtenues. Vérifier cette provenance avant de rendre le snapshot accessible au scanner.

**Activation** : la création d’un candidat ne le rend pas actif. Monter les caches qualifiés à leurs chemins définitifs. Provisionner les manifestes revus sous `db-trivy.json` et `db-grype.json`. Un déplacement exige de nouveaux snapshots. Ce script ne prépare pas Java DB ; l’étendre et le qualifier si Java entre dans le périmètre.

**Résultat attendu** : les DB existent, leur statut est valide et leurs dates respectent la politique. Contrôler aussi l’horloge de l’agent. Une date trop éloignée dans le futur est une erreur.

Les seuils proposés sont **24 heures pour la construction de la base** et **24 heures pour la validité du rapport**. Ce sont des choix à approuver. Ils ne décrivent pas les valeurs observées de l’existant.

#### Garder les contrôles en mode hors ligne

Le défaut Grype documenté et confirmé dans le code est une base de moins de **120 heures**. Il est plus permissif que la proposition du guide. Le profil suivant conserve la validation d’âge et d’intégrité :

```yaml
# grype.yaml — candidat à qualifier pour Grype 0.120.1
check-for-app-update: false
db:
  auto-update: false
  validate-age: true
  max-allowed-built-age: 24h
  validate-by-hash-on-start: true
  require-update-check: false
```

Pour Trivy, utiliser une copie saine du cache et les options `--skip-db-update --skip-java-db-update --offline-scan`. Contrôler la fraîcheur **avant le scan**. Confirmer ces options dans `trivy image --help` de la version installée.

`--offline-scan` évite certaines recherches réseau ; cette option seule ne désactive pas les mises à jour de base. Pour Grype, utiliser `GRYPE_DB_AUTO_UPDATE=false` et `GRYPE_CHECK_FOR_APP_UPDATE=false`. Le scan d’un SBOM n’exige alors pas de télécharger à nouveau l’image.

Un miroir est une copie administrée d’une source. Avant réutilisation, vérifier son origine, les dates amont, le transfert, les empreintes, le schéma et l’approbation. Effectuer ces contrôles après restauration et avant chaque scan. Approvisionner régulièrement les deux chemins : une DB de secours vieille de plusieurs semaines ne permet pas une bascule fiable.

### Effectuer le même parcours en conteneurs

Le script `scan-containers.sh`, intégralement fourni dans l’annexe 22, exécute ce parcours :

1. Trivy analyse le répertoire OCI.
2. Syft inventorie le même contenu.
3. Grype analyse le SBOM produit.

Les images de scanners sont approuvées par digest et préchargées par le Docker de l’hôte. `--pull=never` interdit un téléchargement implicite. Dans les conteneurs, le réseau est coupé, le système de fichiers et les bases sont en lecture seule. L’utilisateur est non privilégié et aucun socket Docker n’est monté.

**Avant le lancement** : terminer le parcours OCI du chapitre suivant. Vérifier les blobs et la présence d’un seul manifeste dans l’index. Qualifier Docker, ses options et la recette des scanners sur Linux.

```bash
# Après le parcours OCI du chapitre suivant : un index à un seul manifeste et blobs vérifiés.
export OCI_LAYOUT_DIR="$LAB/oci-layout"
export CONTAINER_RESULTS="$LAB/resultats-conteneurs"
export TRIVY_IMAGE SYFT_IMAGE GRYPE_IMAGE TRIVY_CACHE_DIR GRYPE_DB_CACHE_DIR MANIFEST_DIGEST
bash continuite-scan-support/scripts/scan-containers.sh
```

**Résultat attendu, non testé ici** : `trivy.json`, `sbom.syft.json`, `grype.json` et les journaux sont créés dans le nouveau dossier. Les variables reprennent celles du tutoriel et du registre d’outillage ; les chemins sont absolus.

**En cas d’échec** : corriger les permissions, les CA, la DB, l’image de scanner ou ses montages de laboratoire. Conserver l’isolation : pas de `--privileged`, de socket Docker monté ou de TLS désactivé.

Ces rapports bruts servent à l’apprentissage. L’autorisation de promotion passe ensuite par le gate, c’est-à-dire le contrôle bloquant, avec preuve du sujet analysé et contrôles annexes. Le script attend un index OCI à une entrée ; Syft n’y reçoit pas de sélecteur pour un index arbitraire.

<a id="section-06"></a>

## 6. Parcours progressif sur une même image immuable

Ce parcours suit une seule image dans la **même session Bash de la VM distante**. Il permet de comprendre chaque étape avant d’utiliser le contrôle bloquant de la CI.

1. Figer l’image et vérifier son identité.
2. Obtenir le rapport nominal Trivy.
3. Produire un SBOM avec Syft.
4. Analyser ce SBOM avec Grype.
5. Comparer avec le scan direct, puis les sources locale, OCI et Harbor.

**Prérequis** : Skopeo, `jq`, les trois binaires approuvés et Docker pour l’exercice local. Les bases sont déjà préparées et validées. `TRIVY_CACHE_DIR` et `GRYPE_DB_CACHE_DIR` doivent pointer vers leurs copies approuvées. Utiliser le profil `grype.yaml` fourni au chapitre précédent. Les scripts et configurations complets restent disponibles dans l’annexe 22.

> **Attention** — Exécuter les deux chemins ensemble uniquement lorsque les deux sont fiables. Les rapports du tutoriel servent à apprendre et à comparer. L’autorisation de déploiement exige ensuite la politique commune et les preuves prévues dans la suite du guide.

### Choisir et figer l’image de laboratoire

Un **tag** est un nom qui peut désigner un autre contenu plus tard. Un **digest** est l’empreinte du contenu. Un index multiarche peut référencer plusieurs images, une par plateforme. Le **manifeste enfant** décrit ici une seule image `linux/amd64`.

**Action** : renseigner `DEMO_REPOSITORY` et `DEMO_TAG` avec une image de démonstration approuvée dans un registre accessible. Une image de base ou une image de test FacturaDJ convient. Le tag sert seulement à trouver le candidat ; les scans utilisent ensuite sa référence figée.

Le bloc crée un nouveau dossier `$LAB`, sélectionne une seule plateforme, puis vérifie les empreintes du manifeste et de sa configuration. Aucun digest d’un environnement non consulté n’est fourni.

```bash
set -Eeuo pipefail
umask 077
: "${DEMO_REPOSITORY:?dépôt de démo approuvé requis, sans tag}"
: "${DEMO_TAG:?tag candidat à résoudre une fois requis}"
LAB="$(mktemp -d "$PWD/atelier-image.XXXXXX")"
export LAB
skopeo inspect --raw "docker://$DEMO_REPOSITORY:$DEMO_TAG" > "$LAB/candidate.json"
if jq -e '.manifests | type == "array"' "$LAB/candidate.json" >/dev/null; then
  MANIFEST_DIGEST="$(jq -er '
    [.manifests[] | select(.platform.os=="linux" and .platform.architecture=="amd64")]
    | if length==1 then .[0].digest else error("plateforme absente ou ambiguë") end
  ' "$LAB/candidate.json")"
else
  MANIFEST_DIGEST="sha256:$(sha256sum "$LAB/candidate.json" | awk '{print $1}')"
fi
[[ "$MANIFEST_DIGEST" =~ ^sha256:[0-9a-f]{64}$ ]] || exit 20
IMAGE_REF="$DEMO_REPOSITORY@$MANIFEST_DIGEST"
export IMAGE_REF MANIFEST_DIGEST
skopeo inspect --raw "docker://$IMAGE_REF" > "$LAB/manifest.json"
test "sha256:$(sha256sum "$LAB/manifest.json" | awk '{print $1}')" = "$MANIFEST_DIGEST"
jq -e 'has("config") and (.layers | type=="array") and (has("manifests") | not)' \
  "$LAB/manifest.json" >/dev/null
skopeo inspect --raw --config "docker://$IMAGE_REF" > "$LAB/config.json"
CONFIG_DIGEST="$(jq -er '.config.digest' "$LAB/manifest.json")"
test "sha256:$(sha256sum "$LAB/config.json" | awk '{print $1}')" = "$CONFIG_DIGEST"
jq -e '.os=="linux" and .architecture=="amd64"' "$LAB/config.json" >/dev/null
printf '%s\n' "$IMAGE_REF" > "$LAB/image-ref.txt"
printf '%s\n' "$CONFIG_DIGEST" > "$LAB/config-digest.txt"
```

**Vérification attendue** : `image-ref.txt` contient une référence réelle `dépôt@sha256:…`. Les empreintes du manifeste et de la configuration correspondent aux valeurs annoncées. Une absence ou une ambiguïté arrête le parcours.

Ce tutoriel fixe `linux/amd64`. Pour un parc arm64, qualifier un parcours avec cette autre plateforme explicite et conserver ses résultats séparément.

<details>
<summary>Pourquoi ne pas utiliser seulement le champ Digest de Skopeo ?</summary>

Le champ `Digest` ordinaire désigne l’objet de tête. Il peut s’agir d’un index, et non du manifeste enfant. L’option `--override-arch` ne suffit donc pas à prouver l’identité du manifeste enfant analysé. Le bloc le sélectionne explicitement, puis contrôle ses octets. [Skopeo inspect](https://github.com/containers/skopeo/blob/main/docs/skopeo-inspect.1.md)

</details>

### Étape 1 — Analyser avec Trivy

**But** : obtenir le rapport nominal sans masquer les vulnérabilités sans correctif. Lancer le bloc dans le même laboratoire, après vérification de la confiance et de la fraîcheur des bases.

Trivy lit la référence du registre. Les commandes `jq` vérifient ensuite la structure du rapport et affichent les métadonnées de l’artefact.

```bash
trivy image --image-src remote --platform linux/amd64 \
  --cache-dir "$TRIVY_CACHE_DIR" --scanners vuln \
  --skip-db-update --skip-java-db-update --offline-scan \
  --format json --output "$LAB/trivy.json" "$IMAGE_REF"
jq -e '.SchemaVersion and (.Results | type=="array")' "$LAB/trivy.json" >/dev/null
jq '{ArtifactName, ArtifactType, Metadata}' "$LAB/trivy.json"
```

**Résultat attendu** : `$LAB/trivy.json` existe et ses métadonnées décrivent l’image demandée. Le code `0` signifie ici que le traitement s’est terminé. Ce bloc ne fixe aucun seuil natif de rejet : il peut renvoyer `0` malgré des vulnérabilités critiques. La décision de sécurité doit donc lire le rapport.

### Étape 2 — Produire la liste d’ingrédients avec Syft

**But** : séparer l’inventaire du contrôle des alertes. Une même invocation produit le JSON natif Syft et deux formats d’échange, CycloneDX et SPDX. La section 7 explique leur rôle.

Le contrôle `jq` vérifie le générateur, sa version, le schéma, le digest du sujet et la présence de composants. Le résumé conserve ces éléments et la distribution détectée.

```bash
syft scan "registry:$IMAGE_REF" --platform linux/amd64 --scope squashed \
  -o "syft-json=$LAB/sbom.syft.json" \
  -o "cyclonedx-json@1.6=$LAB/sbom.cdx-1.6.json" \
  -o "spdx-json@2.3=$LAB/sbom.spdx-2.3.json"
# Contrôle documentaire de la version et du sujet : à compléter par la qualification des paquets.
jq -e --arg digest "$MANIFEST_DIGEST" '
  .descriptor.name=="syft" and .descriptor.version=="1.54.1"
  and .schema.version=="16.1.11"
  and .source.type=="image"
  and .source.metadata.manifestDigest==$digest
  and (.artifacts | type=="array" and length>0)
' "$LAB/sbom.syft.json" >/dev/null
jq '{source, distro, descriptor, schema, packages: (.artifacts|length)}' \
  "$LAB/sbom.syft.json" > "$LAB/sbom-summary.json"
```

**Vérification attendue** : les trois SBOM proviennent du même inventaire. `$LAB/sbom-summary.json` décrit le sujet, le générateur, la distribution et le nombre de composants.

`--scope squashed` inventorie le système de fichiers final visible. Les secrets ou les paquets supprimés dans d’anciennes couches constituent un autre périmètre. Maintenir leur inspection séparément si la politique l’exige.

La quantité de composants ne suffit pas à valider l’inventaire. Une image minimale peut en contenir peu. Pour FacturaDJ, vérifier des **sentinelles** : des composants dont la présence et la version sont connues dans le jeu testé.

Dans le backend, examiner les dépendances Python attendues. Dans le frontend, examiner celles réellement distribuées. Si les dépendances npm de construction ont disparu de l’image finale, contrôler aussi leur environnement de build. Leur absence dans cette image ne démontre pas leur sécurité.

### Étape 3 — Contrôler les ingrédients avec Grype

**But** : comparer le SBOM aux alertes de la DB déjà validée. Le bloc empêche la mise à jour automatique de Grype et produit un rapport JSON.

```bash
GRYPE_DB_AUTO_UPDATE=false GRYPE_CHECK_FOR_APP_UPDATE=false \
  grype -c grype.yaml "sbom:$LAB/sbom.syft.json" \
  -o json > "$LAB/grype-sbom.json"
jq -e '(.matches | type=="array") and .descriptor.db.status.valid==true' \
  "$LAB/grype-sbom.json" >/dev/null
```

**Vérification attendue** : le rapport contient les correspondances de vulnérabilités et un statut de DB valide. Sans `--fail-on`, le retour natif ne décide pas de l’acceptabilité de l’image. Appliquer ensuite la politique commune.

Conserver aussi la sortie d’erreur, appelée **stderr**. Une distribution inconnue ou des métadonnées incomplètes peuvent produire des avertissements malgré un retour `0`. Examiner ces avertissements avant de qualifier la couverture.

### Étape 4 — Comparer au scan direct de l’image

**But** : vérifier ce que change le passage par un SBOM. Grype inventorie cette fois directement l’image du registre. Les dernières commandes extraient les informations de DB des deux rapports et les comparent.

```bash
GRYPE_DB_AUTO_UPDATE=false GRYPE_CHECK_FOR_APP_UPDATE=false \
  grype -c grype.yaml "registry:$IMAGE_REF" --platform linux/amd64 \
  -o json > "$LAB/grype-direct.json"
# Les deux rapports doivent utiliser la même DB figée.
jq '.descriptor.db' "$LAB/grype-sbom.json" > "$LAB/db-sbom.json"
jq '.descriptor.db' "$LAB/grype-direct.json" > "$LAB/db-direct.json"
diff -u "$LAB/db-sbom.json" "$LAB/db-direct.json"
```

**Vérification attendue** : les deux rapports utilisent la même DB figée. Examiner ensuite les composants, les alertes et les décisions selon la méthode de la section 10. Un nombre total identique ne démontre pas l’équivalence.

Grype `0.120.1` embarque Syft `1.54.1`. Cela ne garantit pas des configurations identiques. Pour Python/Node, vérifier les catalogues sélectionnés, les exclusions et les chemins.

<details>
<summary>Comprendre un écart lié aux composants Go</summary>

Le scan direct de Grype active notamment la capture des symboles Go et élimine certaines entrées sans version. Un SBOM Syft par défaut peut donc donner un résultat différent. Pour Go, aligner le paramétrage après lecture de `syft config`, puis tester sa conservation dans les formats d’échange. Garder tout réglage non vérifié hors du profil commun. [Source Grype taguée](https://github.com/anchore/grype/blob/v0.120.1/cmd/grype/cli/commands/root.go)

</details>

### Images locales : vérifier le contenu chargé dans Docker

**But** : analyser localement le contenu de la même image. Le bloc télécharge la référence figée, contrôle son identifiant de configuration, puis compare les **DiffIDs**, les empreintes des couches décompressées dans leur ordre.

Une fois cette correspondance établie, les trois outils lisent l’image locale à partir de son identifiant immuable.

```bash
docker pull --platform linux/amd64 "$IMAGE_REF"
LOCAL_IMAGE_ID="$(docker image inspect --format '{{.Id}}' "$IMAGE_REF")"
test "$LOCAL_IMAGE_ID" = "$CONFIG_DIGEST"
docker image inspect "$LOCAL_IMAGE_ID" > "$LAB/docker-inspect.json"
# Comparer les DiffIDs (couches décompressées), dans le même ordre.
jq -c '.[0].RootFS.Layers' "$LAB/docker-inspect.json" > "$LAB/docker-diffids.json"
jq -c '.rootfs.diff_ids' "$LAB/config.json" > "$LAB/manifest-diffids.json"
diff -u "$LAB/manifest-diffids.json" "$LAB/docker-diffids.json"
trivy image --image-src docker --scanners vuln --cache-dir "$TRIVY_CACHE_DIR" \
  --skip-db-update --skip-java-db-update --offline-scan \
  --format json --output "$LAB/trivy-local.json" "$LOCAL_IMAGE_ID"
syft scan "docker:$LOCAL_IMAGE_ID" --scope squashed -o "syft-json=$LAB/sbom-local.json"
GRYPE_DB_AUTO_UPDATE=false GRYPE_CHECK_FOR_APP_UPDATE=false \
  grype -c grype.yaml "docker:$LOCAL_IMAGE_ID" -o json > "$LAB/grype-local.json"
```

**Vérification attendue** : l’identifiant local correspond à `$CONFIG_DIGEST`, et les listes de DiffIDs sont identiques. Au moindre écart, arrêter la comparaison.

`LOCAL_IMAGE_ID` est le digest de la **configuration**, pas celui du manifeste OCI. Le démon Docker peut représenter l’emballage du manifeste autrement. Cet exercice relie la configuration et les couches décompressées au manifeste figé. Pour vérifier strictement le manifeste distribué, utiliser le parcours registre ou OCI. Un tag local de même nom ne suffit pas.

### Archives OCI : conserver le manifeste et vérifier les blobs

**OCI** signifie *Open Container Initiative*. Le format OCI organise l’image autour d’un manifeste et de fichiers de contenu, les **blobs**.

**But** : analyser une copie transportable de l’image, tout en conservant son digest. Le bloc crée l’archive avec Skopeo. Syft et Grype la lisent directement. Pour Trivy `0.76.0`, il extrait ensuite le répertoire OCI depuis cette archive créée sur la station.

**Avant l’extraction** : utiliser uniquement cette archive contrôlée. Une archive tierce non vérifiée ne doit pas être extraite par ce parcours.

```bash
# Créer l’archive depuis le manifeste enfant déjà figé.
skopeo copy --preserve-digests --digestfile "$LAB/oci-digest.txt" \
  "docker://$IMAGE_REF" "oci-archive:$LAB/image.oci.tar:demo"
test "$(cat "$LAB/oci-digest.txt")" = "$MANIFEST_DIGEST"
sha256sum "$LAB/image.oci.tar" > "$LAB/image.oci.tar.sha256"
syft scan "oci-archive:$LAB/image.oci.tar" --scope squashed \
  -o "syft-json=$LAB/sbom-oci.json"
GRYPE_DB_AUTO_UPDATE=false GRYPE_CHECK_FOR_APP_UPDATE=false \
  grype -c grype.yaml "oci-archive:$LAB/image.oci.tar" \
  -o json > "$LAB/grype-oci.json"

# Trivy 0.76.0 lit un répertoire OCI ; ne pas supposer que le tar OCI est un Docker tar.
# L’archive vient de Skopeo sur cette station ; ne pas extraire un tar tiers non contrôlé.
mkdir "$LAB/oci-layout"
tar --extract --file "$LAB/image.oci.tar" --directory "$LAB/oci-layout" --no-same-owner
jq -e --arg digest "$MANIFEST_DIGEST" '
  (.manifests|length)==1 and .manifests[0].digest==$digest
' "$LAB/oci-layout/index.json" >/dev/null
test "sha256:$(sha256sum "$LAB/oci-layout/blobs/sha256/${MANIFEST_DIGEST#sha256:}" | awk '{print $1}')" \
  = "$MANIFEST_DIGEST"
# Vérifier le nom cryptographique de chaque blob SHA256.
while IFS= read -r -d '' blob; do
  test "$(sha256sum "$blob" | awk '{print $1}')" = "${blob##*/}"
done < <(find "$LAB/oci-layout/blobs/sha256" -type f -print0)
trivy image --input "$LAB/oci-layout@$MANIFEST_DIGEST" --scanners vuln \
  --cache-dir "$TRIVY_CACHE_DIR" --skip-db-update --skip-java-db-update --offline-scan \
  --format json --output "$LAB/trivy-oci.json"
```

**Vérification attendue** : le digest copié correspond au manifeste figé. L’index OCI contient une seule entrée, portant ce digest. Chaque blob SHA256 porte le nom correspondant à son contenu. Les outils produisent ensuite leurs rapports sur cet artefact.

**Si `--preserve-digests` échoue** : conserver l’échec. Choisir un artefact OCI compatible ou approuver l’artefact converti avec son propre digest. Une conversion qui change le manifeste exige une nouvelle identité dans les preuves.

Trivy peut choisir le premier manifeste si la référence du répertoire n’est pas explicite. Le bloc exige donc un index à une entrée et utilise `@digest`. [Skopeo copy](https://github.com/containers/skopeo/blob/main/docs/skopeo-copy.1.md), [lecteur OCI Trivy 0.76.0](https://github.com/aquasecurity/trivy/blob/v0.76.0/pkg/fanal/image/oci.go)

### Harbor privé : lire l’artefact avec des droits limités

**Où** : laboratoire, puis agent de scan dédié. Le compte robot dispose uniquement du droit de téléchargement (*pull*) dans le dépôt de quarantaine concerné.

**Avant de lancer** : injecter le mot de passe par secret CI ou saisie interactive. Garder `set -x` désactivé et aucun secret réel dans la commande. Fournir une référence Harbor réelle par digest.

Le bloc crée une configuration d’authentification temporaire, se connecte à Harbor et réalise les scans. Syft et Grype utilisent la configuration Docker dans ce profil. La dernière commande ferme la session du registre.

```bash
: "${HARBOR_HOST:?hôte réel requis}"
: "${HARBOR_ROBOT_USER:?compte robot lecture requis}"
: "${HARBOR_ROBOT_PASSWORD:?secret injecté requis}"
: "${HARBOR_IMAGE_REF:?référence réelle Harbor par digest requise}"
[[ "$HARBOR_IMAGE_REF" =~ @sha256:[0-9a-f]{64}$ ]] || exit 20
DOCKER_CONFIG="$(mktemp -d "$LAB/registry-auth.XXXXXX")"
export DOCKER_CONFIG
printf '%s' "$HARBOR_ROBOT_PASSWORD" | \
  docker --config "$DOCKER_CONFIG" login "$HARBOR_HOST" \
    --username "$HARBOR_ROBOT_USER" --password-stdin
unset HARBOR_ROBOT_PASSWORD
# Syft et Grype utilisent la configuration d’authentification Docker dans ce profil.
syft scan "registry:$HARBOR_IMAGE_REF" --platform linux/amd64 --scope squashed \
  -o "syft-json=$LAB/sbom-harbor.json"
GRYPE_DB_AUTO_UPDATE=false GRYPE_CHECK_FOR_APP_UPDATE=false \
  grype -c grype.yaml "sbom:$LAB/sbom-harbor.json" -o json > "$LAB/grype-harbor.json"
trivy image --image-src remote --platform linux/amd64 --scanners vuln \
  --cache-dir "$TRIVY_CACHE_DIR" --skip-db-update --skip-java-db-update --offline-scan \
  --format json --output "$LAB/trivy-harbor.json" "$HARBOR_IMAGE_REF"
docker --config "$DOCKER_CONFIG" logout "$HARBOR_HOST"
```

**Vérification attendue** : les rapports décrivent le digest Harbor demandé. Pour une copie de la même image de démonstration, le manifeste enfant, la configuration et les couches correspondent également à l’original.

Pour effectuer ce transfert, exiger `skopeo copy --preserve-digests`, puis vérifier le manifeste à destination. Les tags peuvent différer. Un push local assorti d’un tag identique ne démontre pas la conservation du manifeste.

Skopeo possède son propre fichier d’authentification. Utiliser `--authfile` et `skopeo login --password-stdin` pour ce chemin ; les utilitaires ne partagent pas nécessairement les mêmes emplacements.

**TLS** protège la connexion au registre et vérifie son certificat. Installer l’autorité de certification interne dans la confiance du système et des images de scanner. Corriger un certificat ou sa chaîne de confiance au lieu de désactiver cette vérification.

**Nettoyage** : vérifier que le dossier d’authentification est bien sous `$LAB`, puis le supprimer. Ne pas archiver ses identifiants avec les preuves du scan.

<a id="section-07"></a>

## 7. SBOM : formats, métadonnées et réévaluation

Le SBOM est la liste d’ingrédients de l’image. Son **format** détermine comment cette liste est écrite et échangée. Sa **qualité** dépend des composants et des métadonnées réellement observés. Un document lisible peut rester incomplet.

Le parcours recommandé est simple : conserver le JSON natif pour l’analyse, produire les formats d’échange utiles, puis qualifier ce que chaque lecteur retrouve. **JSON** est le format textuel structuré utilisé par les fichiers de ce chapitre.

### Distinguer format disponible et compatibilité testée

Les versions restent celles fixées et documentées au **16 octobre 2026**. Les contrôles ci-dessous reposent sur la lecture des sources. Aucun essai réel de compatibilité n’a été réalisé ici.

| Format et version retenue | Contrôle documentaire | Validation à effectuer |
|---|---|---|
| Syft JSON — schéma `16.1.11`, Syft `1.54.1` | Encodeur natif présent ; Grype `0.120.1` utilise Syft `1.54.1` pour le décodage | Exécuter sur le jeu représentatif ; format proposé pour le socle |
| CycloneDX JSON — `1.6`, avec `cyclonedx-json@1.6` | Encodeur et décodeur présents ; défaut de cette release : `1.7` | Comparer les métadonnées et les décisions, au-delà de l’acceptation du fichier |
| SPDX JSON — `2.3`, avec `spdx-json@2.3` | Encodeur et décodeur présents ; défaut : `2.3` | Vérifier distribution, références externes, versions et pertes de conversion |
| Autres variantes | Plusieurs versions et sérialisations existent | Hors socle et non qualifiées ; aucune compatibilité implicite |

Le **JSON natif Syft** conserve le plus de données propres à ses catalogues. **SPDX** (*Software Package Data Exchange*) facilite les échanges de composants et de licences. **CycloneDX** sert aux échanges de sécurité et peut transporter d’autres informations, dont des vulnérabilités.

Ces formats standardisés ne garantissent pas que chaque producteur et chaque lecteur conserve les mêmes détails. Archiver le natif en plus du format d’échange. Examiner les pertes éventuelles lors d’une conversion.

<details>
<summary>Retrouver les contrôles dans les sources fixées</summary>

La lecture du code n’est ni un essai d’interopérabilité ni une preuve d’exhaustivité. Les références examinées sont : [schéma Syft](https://github.com/anchore/syft/blob/v1.54.1/internal/constants.go), [versions CycloneDX](https://github.com/anchore/syft/blob/v1.54.1/syft/format/internal/cyclonedxutil/versions.go), [versions SPDX](https://github.com/anchore/syft/blob/v1.54.1/syft/format/internal/spdxutil/versions.go), [décodage SBOM Grype](https://github.com/anchore/grype/blob/v0.120.1/grype/pkg/syft_sbom_provider.go) et [dépendance Syft de Grype](https://github.com/anchore/grype/blob/v0.120.1/go.mod).

</details>

#### Tester les deux formats d’échange

**Où** : dans la même session de laboratoire de la VM distante, après le parcours de la section 6. Les fichiers SBOM existent déjà dans `$LAB`.

**But** : vérifier la lecture de CycloneDX et de SPDX par Grype. Garder la **même copie de DB**, la même politique et les mêmes versions pendant les deux analyses.

```bash
for variant in cdx-1.6 spdx-2.3; do
  GRYPE_DB_AUTO_UPDATE=false GRYPE_CHECK_FOR_APP_UPDATE=false \
    grype -c grype.yaml "sbom:$LAB/sbom.$variant.json" \
    -o json > "$LAB/grype-$variant.json"
done
```

**Vérification** : conserver les codes de retour, stderr et les rapports. Comparer les composants par écosystème, leurs identifiants, les correspondances de vulnérabilités et les décisions. Vérifier aussi que le lecteur retrouve la distribution et les versions. Un fichier accepté par le parseur n’établit pas cette couverture.

### Vérifier les métadonnées nécessaires

Les **métadonnées** sont les informations qui donnent un sens aux composants inventoriés. Elles permettent notamment de relier l’inventaire à l’image et de chercher les avis applicables.

| Donnée | Utilité | Si elle manque |
|---|---|---|
| Sujet : manifeste, configuration et plateforme | Relier l’inventaire à l’image distribuée | Le rapport ne peut pas servir de preuve pour cette image |
| Nom, version et écosystème | Rechercher les avis du bon composant | Alertes manquées, entrées abandonnées ou correspondances trop larges |
| Distribution et version | Utiliser les avis et correctifs de l’éditeur | Comparaisons erronées et correctifs rétroportés ignorés |
| PURL, origine et paquet source | Distinguer fournisseur et variantes | Homonymes, alias ou mauvaises correspondances |
| Emplacement, couche et dépendances | Comprendre la présence du composant | Qualification et correction plus difficiles |
| Générateur, version, configuration et exclusions | Reproduire l’inventaire | Couverture inconnue ou résultats incomparables |
| Hash du SBOM et preuve du sujet | Détecter un remplacement | Risque d’utiliser l’inventaire d’une autre image |

Une **PURL** (*Package URL*) est une référence structurée de paquet. La distribution et le paquet source aident aussi à interpréter les correctifs **rétroportés** : un éditeur peut corriger un paquet tout en conservant une version amont apparemment ancienne.

Pour Django/Python, contrôler les noms normalisés, les versions et les métadonnées d’installation. `requirements.txt` seul ne décrit pas nécessairement le contenu installé. Pour Astro/Node, distinguer dépendances de construction, dépendances embarquées et fichiers statiques produits. L’inventaire de l’image finale ne couvre pas toujours l’environnement de construction.

### Lire une alerte et comprendre son correctif

Une ligne de rapport relie ces informations :

1. Le composant et sa version installée.
2. L’identifiant de l’avis, par exemple CVE ou GHSA.
3. La source et la sévérité de l’avis.
4. L’existence ou l’absence de correctif connu dans les données utilisées.

**CVE** (*Common Vulnerabilities and Exposures*) et **GHSA** (*GitHub Security Advisory*) sont deux systèmes d’identification d’avis. Garder les identifiants originaux pendant la comparaison.

`FixedVersion` vide dans Trivy ou `fix.versions: []` dans Grype indique qu’aucun correctif n’est renseigné. La vulnérabilité reste à traiter selon la politique. Comparer les versions de distribution avec les règles de leur éditeur pour prendre en compte les rétroportages.

**Action** : créer des vues de lecture séparées. Le bloc suivant extrait les champs utiles sans modifier les rapports JSON bruts.

```bash
# Vue de lecture du rapport Trivy, sans modifier le rapport original.
jq -r '.Results[]? as $r | $r.Vulnerabilities[]? |
  [$r.Target, .PkgName, .InstalledVersion, .VulnerabilityID,
   .Severity, (.FixedVersion // ""), (.DataSource.ID // "")] | @tsv' \
  "$LAB/trivy.json" > "$LAB/trivy-findings.tsv"
# Vue de lecture Grype, incluant source/namespace et type de correspondance.
jq -r '.matches[]? |
  [.artifact.name, .artifact.version, .artifact.type, .vulnerability.id,
   .vulnerability.severity, (.vulnerability.fix.versions // [] | join(",")),
   .vulnerability.namespace, (.matchDetails | map(.type) | unique | join(","))] | @tsv' \
  "$LAB/grype-sbom.json" > "$LAB/grype-findings.tsv"
```

**Vérification** : les fichiers TSV présentent les composants, versions, avis, sévérités et correctifs. TSV signifie valeurs séparées par tabulation. La vue Grype ajoute le namespace, c’est-à-dire l’espace de nom de la source, et le type de correspondance. Revenir au JSON brut pour toute analyse plus détaillée.

#### Documenter une exception

Un faux positif supposé exige une analyse : identifier exactement le composant, consulter l’avis éditeur et justifier son applicabilité. Faire approuver la conclusion.

Une exception doit contenir un sujet et une vulnérabilité précis, un motif, un propriétaire, un approbateur et une date d’expiration. Un motif général comme « Grype est plus bruyant » ne suffit pas.

Le **VEX** (*Vulnerability Exploitability eXchange*) exprime un statut d’exploitabilité. Vérifier et approuver ce statut selon la même politique avant de s’en servir pour écarter une alerte. Sa présence seule ne justifie pas cette décision.

### Archiver l’inventaire et le réexaminer

Le SBOM peut être conservé et analysé à nouveau lorsqu’une base approuvée plus récente devient disponible. Cela permet de chercher de nouvelles alertes sans refaire l’inventaire de l’image.

**Preuves à garder ensemble** :

- SBOM natif, formats d’échange éventuels et empreintes.
- Commit source, identifiant de build, digest d’image et plateforme.
- Versions et configurations des outils.
- Rapport brut et identité du snapshot de DB.
- Politique et exceptions utilisées.

Le stockage de preuve doit résister à l’écriture par le scanner. Les scripts et configurations complets utiles à ce parcours figurent dans l’annexe 22.

**Action** : calculer les empreintes des SBOM. Lors d’un réexamen, restaurer leur preuve de sujet et vérifier ces empreintes avant de relancer Grype. Le cache doit alors pointer vers une nouvelle copie de DB approuvée et suffisamment fraîche.

```bash
sha256sum "$LAB/sbom.syft.json" "$LAB/sbom.cdx-1.6.json" "$LAB/sbom.spdx-2.3.json" \
  > "$LAB/sbom.sha256"
# Plus tard : restaurer la preuve de sujet et vérifier les hashes AVANT de scanner.
sha256sum --check "$LAB/sbom.sha256"
# Le cache Grype pointe alors vers une nouvelle copie approuvée et suffisamment fraîche.
GRYPE_DB_AUTO_UPDATE=false GRYPE_CHECK_FOR_APP_UPDATE=false \
  grype -c grype.yaml "sbom:$LAB/sbom.syft.json" \
  -o json > "$LAB/grype-reevaluation.json"
```

**Vérification** : le nouveau rapport reçoit une nouvelle date et un nouveau contexte de DB. Conserver aussi l’ancien pour expliquer l’évolution de la décision.

> **À retenir** — La réanalyse découvre de nouvelles alertes sur les composants déjà inventoriés. Elle ne retrouve pas un composant omis à l’origine.

Si un catalogueur corrigé améliore la couverture, régénérer aussi le SBOM. Si son constructeur est suspect, sa signature seule ne rétablit pas la confiance. Régénérer depuis un artefact validé ou reconstruire selon la procédure de réponse à incident.

<a id="section-08"></a>

## 8. Politique de décision commune et contrat des preuves

**La politique décide ; le scanner fournit les observations.** Les deux chemins appliquent les mêmes exigences sur une image précise. Un résultat technique terminé ne suffit pas à autoriser sa promotion.

### Règles proposées à faire approuver

Ces valeurs constituent une proposition de conception. Elles ne décrivent pas des réglages déjà actifs dans FacturaDJ.

| Point contrôlé | Règle commune | Réglage ou preuve |
|---|---|---|
| Sévérité | Bloquer **High** et **Critical**, même sans correctif | `block_severities` ; aucun filtre `--ignore-unfixed` ou `--only-fixed` |
| Sévérité inconnue | Bloquer jusqu'à qualification | `reject_unknown_severity: true` |
| Base de vulnérabilités | Construction datant de **24 h au maximum** | `max_db_age_hours: 24` ; date amont, pas date de téléchargement |
| Rapport et contrôles annexes | Validité maximale de **24 h** | Revalidation avant promotion et livraison ; confiance toujours valide |
| Exception | Approbation nominative, périmètre exact et échéance | Durée maximale proposée : **7 jours** ; catalogue actuel protégé |
| Image | Manifeste enfant et plateforme qualifiés | Référence réelle `registre/projet/image@sha256:DIGEST_RÉEL` |
| Inventaire | Distribution/version et composants attendus présents | Profil qualifié par image finale |
| Autres contrôles | Secrets, configurations et licences maintenus | Reçus indépendants liés au digest, au build et au commit |
| Confiance | Agent et outils autorisés avant exécution | Décision approuvée non expirée, vérifiée avant tout lancement |

Deux scanners peuvent donner la même sévérité à partir de sources différentes. La règle commune ne prouve donc pas leur équivalence : [qualifier les écarts](#section-10) par composant, version et avis.

Une base construite récemment peut aussi contenir un flux amont retardé. Surveiller les fournisseurs utiles au périmètre, en plus de l'âge du fichier de base.

### Lire les quatre décisions

Voici le parcours, sans moteur de diagrammes :

1. **Avant d'exécuter** : vérifier l'autorisation de l'outil et de l'agent. Un refus donne `UNTRUSTED`.
2. **Pendant la collecte** : vérifier base, identité de l'image, inventaire et rapport. Une preuve absente, périmée ou inexploitable donne `ERROR`.
3. **Appliquer la politique** : une vulnérabilité bloquante non couverte par une exception valide donne `REJECT`.
4. **Autoriser l'étape suivante** : seules des preuves complètes et conformes donnent `PASS`.
5. **Avant de promouvoir** : recontrôler intégrité, fraîcheur, confiance et exceptions. Un ancien `PASS` peut perdre sa validité.

| Décision et code du wrapper | Signification | Action |
|---|---|---|
| **PASS — 0** | Contrôle exploitable et conforme | Continuer vers la promotion contrôlée ; aucun déploiement direct |
| **REJECT — 10** | Politique de sécurité non satisfaite | Bloquer ; corriger ou instruire une exception |
| **ERROR — 20** | Échec technique ou preuve invalide | Bloquer ; diagnostiquer avant un nouveau run |
| **UNTRUSTED — 30** | Outil ou environnement non autorisé | Empêcher l'exécution ; suivre le runbook de confiance |

Ces codes appartiennent à `gate.py`. Les [codes natifs de Trivy et Grype](#section-10) sont différents. Dans ce wrapper, une empreinte de base incohérente produit `ERROR`. Si l'enquête établit une suspicion de compromission, révoquer aussi la confiance pour obtenir `UNTRUSTED` avant toute nouvelle exécution.

> **Erreur fréquente — chercher un résultat favorable.** Un rejet de sécurité ne déclenche jamais un autre scanner. Un scan absent, incomplet ou en erreur ne devient jamais conforme par défaut.

Le wrapper appelle les outils sans seuil natif de rejet, exige un retour natif `0`, valide le rapport puis décide. Aucun `|| true` ou `continueOnError` n'autorise la promotion. Si l'agent est interrompu avant d'écrire la décision, l'absence de `PASS` reste bloquante.

### Protéger les fichiers qui portent la décision

Les configurations sont provisionnées **hors du checkout applicatif**, en lecture seule pour le scanner. `SECURITY_CONFIG_DIR` désigne ce dossier ; `/etc/scan-continuity` est un exemple proposé, pas un chemin observé.

| Fichier | Rôle | Contrôle à garder |
|---|---|---|
| `tools.lock.json` | Versions, chemins absolus et empreintes des binaires | Approuver l'origine avant de fixer les hashes ; contrôle avant et après scan |
| `trust.json` | Autorisations des outils et de l'agent | Décision, approbateur, dates et révocation ; un booléen ne détecte pas une attaque |
| `db-trivy.json`, `db-grype.json` | Provenance, date amont et empreintes des DB | Snapshot créé sur poste sain et revu ; nouveau snapshot si les chemins changent |
| `profile.json` | Distribution/version et composants témoins | Calibration sur l'image finale ; différences de représentation explicitement qualifiées |
| `exceptions.json` | Dérogations précises et temporaires | Catalogue protégé, vide par défaut ; jamais modifié par le scanner |
| `controls.json` | Résultats des contrôles annexes | Producteur autorisé, liens de preuves réels et sujet exact |

**Écrire `PASS` à la main dans `controls.json` ne réalise aucun contrôle.** L'exemple contient `NOT_RUN`. Tant que les adaptateurs vers vos contrôles réels ne sont pas implémentés et qualifiés, le parcours reste bloqué.

Les développeurs applicatifs ne doivent pouvoir remplacer ni ces fichiers ni leurs valeurs lors de la mise en file. Le provisionnement et les protections nécessaires sont à mettre en œuvre dans l'[intégration Azure](#section-09).

### Calibrer l'inventaire sans promettre l'exhaustivité

Le profil de référence vise des images Linux Django/Python et Astro/Node.js dont les paquets sont identifiables.

- Renseigner `os_versions` avec les versions réellement observées, qualifiées et autorisées. Les listes sont vides dans les exemples pour bloquer une validation prématurée.
- Vérifier des types de paquets, des composants témoins et un minimum calibré. Ces sentinelles détectent une régression grossière ; elles ne prouvent pas un inventaire complet.
- Distinguer l'image finale de l'environnement de build. Un frontend Astro exporté en fichiers statiques peut ne plus embarquer Astro ou npm ; contrôler aussi les dépendances de construction à l'étape appropriée.
- Qualifier séparément les images `scratch`, Windows, sans distribution ou contenant des binaires opaques. Un inventaire vide ne doit être accepté qu'avec une méthode adaptée et approuvée.
- Examiner les distributions en **EOL**, *End Of Life* ou fin de support. Le wrapper ne contient pas leur calendrier de maintenance.

### Documenter et révoquer une exception

Une exception porte sur **un digest, un paquet, une version, un avis et sa source**. Elle comporte un ticket, un responsable, un approbateur, une justification et des dates. Voici uniquement le schéma à compléter avec des données réelles :

```json
{
  "image_digest": "A_RENSEIGNER_DIGEST_REEL",
  "package": "NOM_REEL",
  "version": "VERSION_REELLE",
  "id": "IDENTIFIANT_REEL",
  "namespace": "SOURCE_EXACTE_DU_RAPPORT",
  "issue": "URL_TICKET_APPROUVE",
  "owner": "RESPONSABLE",
  "approved_by": "APPROBATEUR",
  "reason": "JUSTIFICATION_ET_MESURES_COMPENSATOIRES",
  "approved_at": "DATE_ISO_UTC_REELLE",
  "expires_at": "DATE_ISO_UTC_REELLE"
}
```

Le code refuse une exception incomplète, expirée ou trop longue. Il applique les correspondances exactes et compare le catalogue actuel lors de la promotion : une révocation invalide les preuves antérieures.

Les alias CVE/GHSA nécessitent une revue explicite. Une déclaration **VEX**, *Vulnerability Exploitability eXchange*, décrit l'applicabilité d'une vulnérabilité ; son auteur, son sujet et sa justification doivent être évalués. Sa présence ou sa signature ne vaut pas autorisation générale.

### Relier les preuves à la bonne image

Un nouveau dossier est créé pour chaque exécution. Il conserve configurations, rapport brut, données normalisées, décision horodatée, journaux et empreintes dans `evidence.json`. En mode Grype, il contient aussi le SBOM natif. En mode Trivy, `--list-all-pkgs` conserve l'inventaire dans le rapport.

| Producteur | Champ à examiner | Vérification du parcours |
|---|---|---|
| Syft | `source.metadata.manifestDigest` | Digest du manifeste enfant demandé |
| Grype `0.120.1` | `source.type` et `source.target` | Image attendue, ou chemin exact du SBOM contrôlé avant et après analyse |
| Trivy | `Metadata.RepoDigests` | Référence exacte de l'image examinée |

Les résultats ignorés ou modifiés en amont sont refusés dans ce parcours. Leur prise en compte demande une qualification dédiée. Un SBOM Syft produit en parallèle ne prouve pas automatiquement le sujet d'un rapport Trivy : conserver chaque lien de provenance.

> **À retenir — empreinte et authenticité.** Un hash détecte une modification si son manifeste vient d'un canal fiable. Un attaquant pouvant remplacer les fichiers **et** leurs hashes peut recalculer l'ensemble.

Le socle utilise un stockage d'artefacts Azure protégé, les permissions et des agents séparés. Une preuve destinée à circuler entre systèmes peut être signée ou attestée par un job distinct ; vérifier alors son sujet et l'identité attendue. Le scanner ne reçoit pas la clé de signature. Le wrapper ne simule pas cette protection.

<details>
<summary>Référence technique : formats JSON et caches</summary>

Trivy utilise `--cache-backend memory` pour éviter un cache d'analyse `fanal.db` dans le snapshot de base figé. Les snapshots fournis couvrent Python/Node et les paquets système. Si Java ou une autre base auxiliaire devient nécessaire, étendre préparation, empreintes et tests de fraîcheur avant qualification.

`--offline-scan` limite les recherches complémentaires ; un scan d'image distante a toujours besoin d'accéder au registre.

Sources taguées consultées le 16 octobre 2026 : [métadonnées Syft](https://github.com/anchore/syft/blob/v1.54.1/syft/source/image_metadata.go), [source du rapport Grype](https://github.com/anchore/grype/blob/v0.120.1/grype/presenter/models/source.go), [rapport Trivy](https://github.com/aquasecurity/trivy/blob/v0.76.0/pkg/types/report.go), [cache Trivy](https://github.com/aquasecurity/trivy/blob/v0.76.0/pkg/cache/client.go). Les exécutions Linux restent à qualifier.

</details>

<a id="section-09"></a>

## 9. Mettre le support en pratique et l'intégrer à Azure DevOps

### Préparer la VM et les entrées du scan

**But :** analyser un candidat déjà construit sans donner au scanner les droits de publication ou de déploiement.

**Où :** VM Linux saine, puis agent Azure de qualification. Reconstituer l'arborescence `continuite-scan-support` à partir des fichiers complets de l'annexe 22 dans votre répertoire de travail. Les commandes ci-dessous utilisent cette arborescence locale ; aucun pack externe n'est requis.

Prévoir Python 3.11 ou plus, Bash, les outils approuvés, les bases qualifiées et un accès Harbor en lecture. Python valide les JSON et les décisions ; Bash fournit le point d'entrée d'exploitation.

1. **Outils.** Exécuter l'approvisionnement de l'annexe, relever les empreintes des binaires installés et inscrire leurs chemins absolus dans `tools.lock.json`. Faire approuver ce verrou : les chemins d'exemple ne correspondent pas automatiquement à `TOOL_ROOT`.
2. **Bases.** Utiliser `prepare-bases.sh`, vérifier source, fraîcheur et empreintes, puis monter les caches dédiés en lecture seule. Écarter les caches d'agents suspects. Trivy conserve son cache d'analyse en mémoire.
3. **Couverture.** Calibrer un profil par image finale, le placer dans `profile.json` et faire approuver distributions/versions et composants attendus. Pour les images de base, créer un profil qui n'impose pas Django ou Node.
4. **Contrôles annexes.** Les jobs fiables de secrets, configurations et licences produisent un `controls.json` authentifié, avec les liens vers leurs preuves. Leur remplacement doit être indépendant de Trivy si nécessaire.
5. **Confiance.** Faire provisionner la décision temporaire `trust.json` par le mécanisme protégé. L'agent de scan ne modifie pas lui-même ces autorisations.

**Action :** invoquer le mode approuvé depuis le répertoire de travail. Le chemin de sortie doit être nouveau pour conserver une preuve propre à chaque run.

```bash
set -euo pipefail
umask 077
: "${IMAGE_REF:?référence Harbor immuable réelle requise}"
: "${SECURITY_CONFIG_DIR:?configuration protégée requise}"
: "${CONTROLS_JSON:?reçu réel des contrôles requis}"
: "${SCANNER_MODE:?choix protégé trivy ou grype requis}"
# RUN_DIR doit être un nouveau chemin ; le wrapper refuse d'écraser les preuves existantes.
RUN_DIR="$PWD/preuves-$(date -u +%Y%m%dT%H%M%S)-$SCANNER_MODE"
bash continuite-scan-support/scripts/scan.sh \
  --mode "$SCANNER_MODE" --image "$IMAGE_REF" --out "$RUN_DIR" \
  --tools "$SECURITY_CONFIG_DIR/tools.lock.json" --trust "$SECURITY_CONFIG_DIR/trust.json" \
  --db "$SECURITY_CONFIG_DIR/db-$SCANNER_MODE.json" --policy "$SECURITY_CONFIG_DIR/policy.json" \
  --exceptions "$SECURITY_CONFIG_DIR/exceptions.json" --profile "$SECURITY_CONFIG_DIR/profile.json" \
  --controls "$CONTROLS_JSON"
python3 -m json.tool "$RUN_DIR/decision.json"
```


**Vérification attendue, non mesurée ici :** `decision.json` et un code `0`, `10`, `20` ou `30`. Avec `set -e`, un code non nul arrête le parcours ; lire alors la décision et le journal. Le helper d'atelier permet de capturer explicitement un rejet attendu. Ne pas réutiliser le dossier ni transformer l'erreur en succès.

### Qualifier un candidat dans Azure DevOps

Le fichier complet `pipelines/azure-pipelines.scan.example.yml` de l'annexe 22 enchaîne **scan puis revalidation** d'une image déjà en quarantaine. Il s'intègre à votre build existant ; ses noms de groupes, pools et environment sont des choix à créer ou adapter.

#### Authentifier le build producteur

Le builder autorisé publie `candidate-security-input`, contenant `controls.json`. Réserver la publication de ces reçus à des étapes protégées qui n'exécutent pas du code applicatif arbitraire avec ces droits. Les lockfiles, tests et autres contrôles du build restent nécessaires.

Avant le téléchargement, le pipeline interroge l'API Azure pour vérifier définition autorisée, dépôt, branche, statut `completed` et résultat `succeeded`. Il compare ensuite build, commit et digest du reçu. **DownloadPipelineArtifact en mode `specific` ne garantit pas seule l'identité du producteur.** Le token de lecture Build est présent dans ce précontrôle, puis absent du processus scanner. Vérifier aussi la sûreté de la définition autorisée. Sources : [API Builds — Get](https://learn.microsoft.com/en-us/rest/api/azure/devops/build/builds/get?view=azure-devops-rest-7.1), [implémentation du téléchargement](https://github.com/microsoft/azure-pipelines-agent/blob/master/src/Agent.Plugins/PipelineArtifact/PipelineArtifactPluginV2.cs).

#### Protéger le mode, les pools et le template

Créer le groupe protégé avec `SCANNER_MODE`, `SCANNER_POOL`, `PROMOTION_POOL`, `CANDIDATE_PIPELINE_ID`, `CANDIDATE_REPOSITORY_ID`, `CANDIDATE_SOURCE_REF` et `SECURITY_CONFIG_DIR`. Restreindre leur remplacement à la mise en file et l'accès aux pools. Une bascule approuvée sélectionne **le mode et le pool sain** ; la base suit ce mode sous contrôle de confiance.

Pour la production, imposer le template `extends` approuvé, le contrôle **Required template** sur les ressources sensibles, les checks/approbations hors YAML et la protection du dépôt de sécurité. Un `include` ou une liste `values` ne suffit pas.

`Bash@3`, `DownloadPipelineArtifact@2` et `PublishPipelineArtifact@1` fixent une version majeure de tâche Azure. Ils ne figent pas les octets comme un digest d'image ou un SHA d'action GitHub. Consigner les versions mineures réellement exécutées et approuver les mises à jour des agents/extensions : cette distribution appartient à la frontière de confiance Azure.

#### Vérifier indépendamment avant promotion

Le second stage dépend du succès du premier. Sur un pool distinct et un environment protégé, il recharge les preuves du **run courant**, puis revalide digest, intégrité, dates, confiance, politique et exceptions actuelles.

La publication des preuves utilise `always()` pour conserver aussi les rejets et erreurs. Si leur dossier manque ou si leur publication échoue, le job reste en échec. Cela n'autorise jamais la promotion.

**Raccords à réaliser dans vos définitions protégées :** acquisition du candidat depuis le build existant, contrôles réels, promotion Harbor, signature/attestation éventuelle, MR et checks GitLab/Argo. Les scripts suivants servent à ces raccords ; rien n'a été activé dans votre infrastructure.

### Promouvoir le digest dans Harbor

**Où :** agent de promotion sain, distinct du scanner, avec Skopeo approuvé et sa version exacte consignée. Il utilise deux fichiers d'authentification temporaires : lecture de quarantaine et écriture du projet déployable. Le scanner ne dispose pas de ces droits.

**Action :** revalider les preuves puis copier l'image vers le dépôt de destination avec un tag explicite de traçabilité.

```bash
# Variables réelles fournies par le job protégé, aucune valeur d'identifiant inventée ici.
: "${IMAGE_REF:?image de quarantaine scannée requise}"
: "${DEST_REPO:?repository Harbor déployable réel requis}"
: "${PROMOTION_TAG:?tag explicite de traçabilité requis}"
: "${RUN_DIR:?dossier de preuves authentifié requis}"
: "${SECURITY_CONFIG_DIR:?configuration protégée requise}"
export SOURCE_AUTH_FILE DEST_AUTH_FILE   # Fichiers d'auth Skopeo temporaires déjà provisionnés.
DEST_IMAGE="$(bash continuite-scan-support/scripts/promote.sh \
  "$IMAGE_REF" "$DEST_REPO:$PROMOTION_TAG" "$RUN_DIR" \
  "$SECURITY_CONFIG_DIR/trust.json" "$SECURITY_CONFIG_DIR/policy.json" \
  "$SECURITY_CONFIG_DIR/exceptions.json")"
printf 'Référence immuable à proposer : %s\n' "$DEST_IMAGE"
```


**Vérification :** `--preserve-digests` interdit une conversion silencieuse et le script compare le digest de destination. Les logs vont sur stderr ; stdout fournit seulement la référence immuable finale à reporter dans GitOps. Le tag sert au transfert et à la trace, pas au déploiement.

La promotion réussie ne fusionne aucune MR. Les workloads restent privés d'accès à la quarantaine. Qualifier séparément l'adaptateur Harbor et les règles de pull, y compris quand son scanner intégré est indisponible.

### Proposer la MR GitOps

**Préparer :** un checkout GitLab dédié et propre, une identité Git configurée, une clé hôte SSH approuvée et des droits d'écriture limités. Le token API concerne ce seul projet et ce seul job. Garder hors du job GitOps les secrets de signature et le kubeconfig Argo.

**Action :** proposer le digest final dans le manifest réel de déploiement.

```bash
: "${GITOPS_WORKTREE:?checkout GitLab dédié requis}"
: "${GITOPS_BASE_BRANCH:?branche réelle suivie par Argo requise}"
: "${GITOPS_MANIFEST:?chemin réel relatif au checkout requis}"
: "${WORKLOAD_NAME:?nom réel du Deployment requis}"
: "${CONTAINER_NAME:?nom réel du conteneur requis}"
: "${GITLAB_URL:?URL HTTPS GitLab réelle requise}"
: "${GITLAB_PROJECT_ID:?ID réel du projet requis}"
: "${GITLAB_TOKEN:?secret propre au job GitOps requis}"
export GITLAB_TOKEN
python3 continuite-scan-support/scripts/gitops-mr.py \
  --worktree "$GITOPS_WORKTREE" --base-branch "$GITOPS_BASE_BRANCH" \
  --manifest "$GITOPS_MANIFEST" --workload "$WORKLOAD_NAME" --container "$CONTAINER_NAME" \
  --source-image "$IMAGE_REF" --image "$DEST_IMAGE" \
  --gitlab-url "$GITLAB_URL" --project-id "$GITLAB_PROJECT_ID" \
  --out "$RUN_DIR" --trust "$SECURITY_CONFIG_DIR/trust.json" \
  --policy "$SECURITY_CONFIG_DIR/policy.json" --exceptions "$SECURITY_CONFIG_DIR/exceptions.json"
```


**Vérification :** le script revalide les preuves et le digest source/destination, exige un unique `Deployment` au namespace explicite `facturadj-preprod`, modifie le conteneur nommé avec `kubectl set image --local`, puis crée une branche et une MR. Il s'arrête avant fusion et synchronisation Argo.

La réécriture locale peut modifier le format et les commentaires YAML : relire le diff. Helm, Kustomize, les fichiers multidocuments et les autres workloads nécessitent un adaptateur distinct. Pour un fichier issu de l'export sélectif GitHub → GitLab, résoudre sa propriété et tester le non-écrasement avant d'utiliser le helper. Garder la vérification de clé hôte SSH active.

Si le push réussit puis l'API MR échoue, conserver le nom de la branche et rechercher une MR existante avant reprise. Ne pas forcer la branche suivie par Argo.

**Avant fusion :** un check protégé lié au SHA courant de la MR doit revalider preuves, approbations et fraîcheur. Si le rapport expire, demander un nouveau scan et la nouvelle approbation requise. L'admission doit aussi refuser les digests hors politique. Le script de MR n'installe pas ces contrôles serveur ; sans ce raccord, le parcours automatisé de production reste non qualifié. Sources : [API MR GitLab](https://docs.gitlab.com/api/merge_requests/), [kubectl set image](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_set/kubectl_set_image/).

### Commencer par une bascule manuelle

Pour la première mise en œuvre, sécurité et exploitation approuvent la sélection `SCANNER_MODE=trivy|grype` avec identifiant de décision. Le build applicatif et ses auteurs ne peuvent pas la changer librement. Aucun mode `auto` ni repli implicite n'est fourni.

Une automatisation ultérieure devra reconnaître une erreur technique précise, exclure un rejet de sécurité et confirmer la confiance des deux environnements. Elle lancera un nouveau job sur le pool de secours, conservera l'erreur initiale et exigera les mêmes contrôles. Un timeout ne prouve pas l'absence de compromis. Une alerte de confiance peut interdire Trivy **avant le bootstrap**, sans l'exécuter pour voir s'il échoue.

<a id="section-10"></a>

## 10. Codes natifs et qualification des différences

Un code de retour décrit le résultat d’une commande. Il faut le traduire dans la politique du pipeline avant d’autoriser une image.

Trois questions restent distinctes : le traitement a-t-il terminé, l’image satisfait-elle la politique et l’outil était-il autorisé à s’exécuter ? Un retour `0` ne répond pas à ces trois questions à lui seul.

### Lire les codes natifs des scanners

Les valeurs ci-dessous sont documentées et contrôlées dans les sources fixées. Elles n’ont pas été mesurées ici par lancement des binaires. La recette de laboratoire devra confirmer les branches utilisées.

| Profil de commande | Retour | Sens et traitement |
|---|---|---|
| Trivy sans `--exit-code` de rejet | `0` après traitement | Scan terminé, même avec des vulnérabilités. Valider le rapport, puis appliquer la politique |
| Trivy avec `--severity HIGH,CRITICAL --exit-code 10` | `10` si résultats au seuil | Seuil atteint ; le code `10` est choisi explicitement. Classer `REJECT` |
| Trivy en erreur technique | Non zéro, habituellement `1` ; à capturer réellement | Erreur d’exécution, de téléchargement ou de décodage. Classer `ERROR` |
| Syft pendant l’inventaire | `0` en réussite ; non zéro en erreur | Valider le sujet et le contenu. Toute erreur de production bloque |
| Grype sans `--fail-on` | `0` en réussite | Traitement terminé, avec ou sans correspondances. Valider puis appliquer la politique |
| Grype avec `--fail-on high` | **`2`** | Vulnérabilité au seuil ou au-dessus. Classer `REJECT` |
| Grype, autre erreur que le seuil | **`1`** | Erreur technique de scan. Classer `ERROR` |

Un rejet de sécurité ne déclenche pas un second scanner pour chercher un accord. Un code technique ne prouve ni un rejet de sécurité ni une perte de confiance. Conserver les sorties et diagnostiquer l’événement.

Les commandes de maintenance et le superviseur ont d’autres codes :

| Commande | Retour | Usage |
|---|---|---|
| Grype `db check` | `0`, ou **`100`** si une nouvelle DB est disponible | Vérifie la disponibilité d’une mise à jour ; ce n’est pas un résultat de scan |
| `timeout` GNU autour du scan | `124` après dépassement | Le superviseur a interrompu le traitement. Classer `ERROR` et écarter le JSON partiel |

Le code Grype `2` / `100` / `1` est défini dans la [CLI Grype 0.120.1](https://github.com/anchore/grype/blob/v0.120.1/cmd/grype/cli/cli.go). La documentation générale de DB indique encore `1` pour une mise à jour disponible. Retenir la source correspondant à la version fixée et confirmer en laboratoire.

Pour Trivy, consulter la [décision de sortie](https://github.com/aquasecurity/trivy/blob/v0.76.0/pkg/commands/operation/operation.go) et le [programme principal](https://github.com/aquasecurity/trivy/blob/v0.76.0/cmd/trivy/main.go). Ces références restent celles du dossier documentaire du 16/10/2026. Aucun de ces codes ne peut être présenté comme réellement mesuré avant l’atelier.

#### Traduire ces codes dans le contrôle bloquant

Le wrapper, le programme qui encadre les scanners dans l’annexe 22, utilise ses propres états. Il classe en erreur un code natif inattendu, un rapport absent ou un rapport incomplet.

Une **perte de confiance** concerne l’autorisation préalable de l’outil ou de son environnement. Cet état doit empêcher l’exécution. Il ne faut donc pas attendre le retour d’un outil suspect pour décider de l’interdire.

### Qualifier les écarts entre Trivy et Grype

**Quand** : avant un incident, lorsque les deux chemins sont autorisés. **But** : démontrer la couverture du secours dans le périmètre testé.

Le jeu minimal contient le backend Django/Python, le frontend Astro/Node et leurs images de base. Ajouter des images dont des dépendances ont une présence et une version connues. Couvrir aussi les plateformes et les méthodes d’emballage effectivement utilisées. Un seul essai Alpine ne démontre pas l’équivalence pour FacturaDJ.

Procéder dans cet ordre :

1. **Figer le contexte.** Conserver le manifeste enfant, la plateforme, les configurations, les versions, les DB et la politique. Relever l’horloge et les ressources de l’agent.

2. **Comparer les inventaires.** Examiner type, nom normalisé, version, PURL, paquet source, distribution et emplacement. Recenser les composants attendus absents et les versions inconnues.

3. **Rapprocher les avis.** Comparer par composant et par alias CVE/GHSA. Garder les identifiants originaux. Des avis de noms différents peuvent viser la même vulnérabilité.

4. **Comparer les sources et leurs dates.** Examiner l’avis éditeur, le namespace Grype, `DataSource` Trivy, les données amont et le support de la distribution. Les deux DB n’ont pas de numéro de version commun.

5. **Comparer les décisions.** Utiliser la même politique pour la sévérité, le correctif et l’exception approuvée. Analyser tout écart qui change une décision bloquante.

6. **Expliquer et classer chaque écart.** Un écart bloquant inexpliqué empêche de déclarer le périmètre qualifié.

Une version système peut inclure une **epoch** et une **révision**, des éléments de versionnement propres au paquet. Les conserver lors de la comparaison. De même, ne pas fusionner automatiquement deux lignes d’avis si elles concernent des composants différents.

Pour classer les écarts, utiliser des causes concrètes : composant absent, mauvaise identification ou version, alias, source, retard de DB, correctif rétroporté, configuration, faux positif confirmé, faux négatif confirmé ou cause encore inconnue.

#### Comparer le scan Grype direct au scan de SBOM

**Où** : dans le laboratoire de la VM distante, après les deux scans de la section 6. **Action** : extraire une clé d’examen qui conserve les champs décisifs, puis comparer les fichiers.

Le tri rend la comparaison plus lisible. Il ne corrige ni les alertes ni les métadonnées.

```bash
for method in sbom direct; do
  jq -S '[.matches[]? | {
    package: .artifact.name, version: .artifact.version, type: .artifact.type,
    purl: .artifact.purl, locations: .artifact.locations,
    id: .vulnerability.id, namespace: .vulnerability.namespace,
    severity: .vulnerability.severity, fix: .vulnerability.fix,
    related: .relatedVulnerabilities, details: .matchDetails
  }] | sort_by(.type,.package,.version,.id,.namespace)' \
    "$LAB/grype-$method.json" > "$LAB/compare-$method.json"
done
diff -u "$LAB/compare-sbom.json" "$LAB/compare-direct.json" \
  > "$LAB/ecarts-sbom-direct.diff" || comparison_status=$?
# diff=1 signifie différences à examiner ; diff>1 signifie erreur de comparaison.
if [[ "${comparison_status:-0}" -gt 1 ]]; then exit 20; fi
```

Lire le retour de `diff` ainsi :

- **`0`** : les champs extraits sont identiques pour cet essai.
- **`1`** : des différences sont à examiner dans le fichier créé.
- **Supérieur à `1`** : la comparaison a rencontré une erreur ; le bloc arrête le parcours.

**Vérification complémentaire** : contrôler les composants témoins et le contenu attendu. Même `diff=0` ne démontre pas l’absence commune de faux négatifs. Inventorier aussi les exceptions natives et les suppressions Grype. Toute ligne masquée par une règle doit rester expliquée.

### Mesurer sans inventer les performances

Mesurer chaque étape séparément pour savoir où se situe le délai : téléchargement de l’image, actualisation et validation des DB, inventaire Syft, analyse Grype, politique, promotion et GitOps.

Pour chaque image, réaliser au moins trois essais sur un agent identique. Tester les caches froids puis chauds. Enregistrer processeur, mémoire et réseau. Conserver les durées brutes et la médiane. Un quantile élevé nécessite davantage d’essais pour être représentatif.

**Action** : le bloc suivant mesure une étape Syft déjà autorisée. Il exige `/usr/bin/time` sur la VM. Le fichier obtenu conserve la durée, la mémoire maximale et le code de sortie de cette exécution.

```bash
# Exemple de mesure d’une étape déjà autorisée, avec /usr/bin/time installé.
/usr/bin/time -f 'elapsed_seconds=%e\nmax_rss_kb=%M\nexit=%x' \
  -o "$LAB/mesure-syft.txt" \
  syft scan "registry:$IMAGE_REF" --platform linux/amd64 --scope squashed \
    -o "syft-json=$LAB/sbom-mesure.json"
```

**Vérification** : renseigner le compte rendu avec les valeurs réellement observées. Garder les conditions de l’essai et les éventuels échecs. Ce guide n’en fournit aucune mesure fictive.

Les objectifs proposés, à approuver avant l’exercice, sont :

- Activer le secours préparé en moins de **15 minutes**.
- Conserver la couverture des contrôles requis.
- N’autoriser aucun déploiement sur `ERROR`, `REJECT` ou outil non fiable.

Le **temps de bascule** commence à la décision consignée et s’arrête à la première exécution complète du secours autorisé. Le **délai total** comprend toutes les étapes du pipeline et les approbations. Relever aussi les blocages restants dans Harbor, l’export GitHub→GitLab et Argo CD.

### Exercice corrigé : base fraîche et inventaire incomplet

**Situation illustrative** : Grype renvoie `0`. La DB a deux heures et le rapport contient zéro vulnérabilité. Le SBOM ne contient pourtant pas la dépendance Django attendue. Peut-on autoriser l’image ?

**Correction** : non. La fraîcheur et la réussite technique ne démontrent pas la couverture. Classer l’analyse comme incomplète. Vérifier l’image et ses métadonnées Python, corriger le catalogue ou l’emballage, puis refaire la qualification. Lancer Trivy uniquement pour obtenir une réponse favorable contournerait ce diagnostic.

### Références pédagogiques et limites

Le [guide de Stéphane Robert sur les scans d’images](https://blog.stephane-robert.info/docs/conteneurs/orchestrateurs/kubernetes/securiser/image-scanning/) a été consulté le **16/10/2026**. Il introduit les avis, les correctifs et le parcours SBOM/Grype. Ses chiffres d’exemple ne mesurent pas ce guide et ne démontrent pas une équivalence générale de couverture.

Le [guide SBOM fourni par l’utilisateur](https://devsecops-portfolio.netlify.app/guides/security/sbom) a fait l’objet de tentatives de consultation le **16/10/2026**, avec et sans slash final. Son contenu était inaccessible par l’outil utilisé. Aucune affirmation technique ne lui est attribuée. Le vérifier lors de la revue documentaire, en conservant les sources officielles taguées comme références techniques.

### Mesurer les codes natifs avant la recette

Le script complet `probe-native-exits.py` est fourni dans l’**annexe 22**. Il n’a pas été exécuté ici. Sur la VM de laboratoire, il mesure les retours et conserve stdout, stderr et les durées dans un nouveau dossier. `stdout` est la sortie normale de la commande ; `stderr` porte ses messages d’erreur ou de diagnostic.

**Préparation** : choisir une image de rejet dont chaque outil confirme un niveau HIGH/CRITICAL avec les bases du jour. Les deux chemins doivent être fiables. Recréer le script depuis l’annexe avant la commande suivante. La sonde ne déploie rien et ne sert pas à chercher un résultat favorable.

```bash
: "${REJECT_IMAGE_REF:?digest reel image de rejet de laboratoire requis}"
python3 continuite-scan-support/scripts/probe-native-exits.py \
  --reject-image "$REJECT_IMAGE_REF" --out "$LAB/codes-natifs" \
  --tools "$SECURITY_CONFIG_DIR/tools.lock.json" --trust "$SECURITY_CONFIG_DIR/trust.json" \
  --db-trivy "$SECURITY_CONFIG_DIR/db-trivy.json" --db-grype "$SECURITY_CONFIG_DIR/db-grype.json" \
  --policy "$SECURITY_CONFIG_DIR/policy.json"
```

**Attendu, non mesuré ici** :

| Cas sondé | Retour attendu |
|---|---|
| Traitement Trivy, Syft ou Grype | `0` |
| Seuil Trivy choisi explicitement | `10` |
| Seuil Grype | `2` |
| JSON tronqué soumis à Grype | `1` |
| Maintenance `grype db check` | `0` ou `100`, selon l’état amont |

Tout code inattendu fait échouer cette recette. Si la DB est à jour, `db check` peut n’observer que `0` : la branche `100` reste alors non testée.

Un arrêt brutal ou un dépassement de délai peut interrompre la sonde et laisser un rapport partiel. Conserver cet échec et compléter la recette avant approbation. Un fichier partiel n’est pas une preuve de scan réussi.

<a id="section-11"></a>

## 11. Protéger les outils de sécurité et toute la chaîne logicielle

Cette section décrit un **socle proposé**, puis des améliorations avancées. Elle ne suppose pas que ces dispositifs soient déjà actifs dans FacturaDJ.

### Savoir ce que chaque preuve démontre

Avant d'approuver un artefact, poser les cinq questions suivantes.

1. **Les octets sont-ils ceux qui ont été approuvés ?** Comparer leur SHA-256 ou leur digest OCI à une valeur conservée dans un dossier d'approbation indépendant. Cette comparaison vérifie l'intégrité. Une empreinte fournie avec le binaire par une source compromise peut confirmer le mauvais fichier.
2. **Qui l'a signé ?** Vérifier la signature avec l'identité de certificat et l'émetteur attendus, ou avec une clé approuvée. Une signature valide ne suffit pas à exclure une clé volée, un workflow hostile ou un artefact vulnérable.
3. **Comment a-t-il été fabriqué ?** Vérifier la provenance, le code source, les instructions de construction et l'identité du constructeur. Une attestation émise par un constructeur compromis peut être trompeuse. La provenance ne remplace pas l'audit du code.
4. **Quel contenu a été inventorié ?** Relier le SBOM au digest de l'image. Conserver la version de Syft et les paramètres de collecte. Un paquet absent de l'inventaire peut échapper au contrôle.
5. **Quelle décision était justifiée à cet instant ?** Conserver le rapport, la date de la base, la politique, les exceptions et l'approbation. Une décision ancienne ne couvre pas les alertes publiées ensuite.

Avec **Cosign**, contraindre la vérification à l'identité attendue. Une vérification acceptant n'importe quelle identité est trop large pour la politique de ce guide. Approuver ces règles avant le téléchargement des outils. [Vérification officielle Sigstore](https://docs.sigstore.dev/cosign/verifying/verify/).

La provenance **SLSA** (*Supply-chain Levels for Software Artifacts*) décrit le contexte de construction. Le guide propose de la relier au digest et au workflow exacts attendus. [Spécification SLSA provenance](https://slsa.dev/spec/v1.1/provenance).

L'analogie de la liste d'ingrédients garde ici ses limites : Syft décrit le colis et Grype rapproche son contenu des alertes connues. Signer la liste permet d'identifier son auteur. Cela ne prouve ni qu'elle soit exhaustive, ni que la fabrication ait été saine.

### Verrouiller les entrées de construction

**But :** pouvoir reconstruire avec des entrées identifiées et réexaminer toute modification.

Avant l'exercice :

- Conserver les fichiers de verrouillage Python et Node effectivement utilisés par FacturaDJ. Vérifier les empreintes et la provenance lorsque les gestionnaires le permettent. Documenter les scripts d'installation et les dépendances transitives.
- Choisir des images de base approuvées. Fixer leur digest et enregistrer leur architecture. Faire revoir et requalifier chaque changement de digest.
- Fixer aussi les images des scanners et des agents par digest. Conserver binaires, signatures, attestations, identités attendues et décisions dans un dépôt d'artefacts contrôlé.
- Épingler les actions et workflows GitHub de l'export sélectif à un commit complet vérifié. Examiner leurs dépendances et leurs téléchargements : un commit fixe peut encore récupérer un binaire sous un tag mutable.
- Faire revoir les changements de pipeline, de politique, de scripts et de gestion des artefacts comme les changements de code sensibles.

**Contrôle :** chaque entrée utilisée doit être identifiable dans le dossier de construction. Employer les gestionnaires réellement présents dans le projet ; ne pas déduire leur existence des exemples du guide.

GitHub documente le verrouillage des dépendances de workflows, l'épinglage à un SHA complet, l'audit du code tiers et les risques d'un checkout non fiable dans un contexte privilégié. Ces recommandations concernent les workflows GitHub encore utilisés ; **Azure DevOps reste la CI principale** de FacturaDJ. [Recommandations officielles GitHub](https://docs.github.com/en/actions/reference/security/secure-use).

### Séparer les identités

**But :** limiter ce qu'un composant compromis pourrait atteindre. Prévoir un accès distinct pour chaque étape.

| Étape proposée | Droit nécessaire | Limite à maintenir |
|---|---|---|
| Construction | Lire GitHub et les dépendances ; écrire l'image de travail | Aucun accès administrateur Harbor, kubeconfig, clé WireGuard ou secret de signature |
| Publication en quarantaine | Écrire dans le périmètre Harbor isolé | Aucun droit d'écriture dans le dépôt autorisé au déploiement |
| Inventaire et scan | Lire le digest et les bases ; écrire les rapports | Aucun droit d'écriture GitLab, accès Argo CD ou secret de déploiement/signature |
| Promotion | Lire la décision validée ; copier le digest approuvé | Aucun droit d'administration du registre ou de contournement de la politique |
| Signature | Signer après vérification indépendante des preuves | Aucune exécution du scanner ou du code applicatif avec la clé disponible |
| Proposition GitOps | Créer une MR sur les manifests exportés autorisés | Aucune approbation ou fusion de sa propre MR ; GitHub reste la référence |
| Déploiement | Argo CD lit GitLab et accède au cluster distant | Aucun droit de construction ou accès aux secrets CI |

**Contrôle :** vérifier les permissions effectives de chaque identité. Le nom du compte ou du rôle ne suffit pas à établir ses droits.

### Isoler l'agent et ses accès réseau

Exécuter le scanner sur un agent dédié ou éphémère. Ne lui monter ni le répertoire personnel complet, ni le kubeconfig, ni le coffre de signature. Éviter le socket Docker hôte lorsqu'un scan de registre ou d'archive suffit. Un conteneur disposant de ce socket, du mode privilégié ou de volumes sensibles peut accéder à l'hôte.

Pour les agents Azure DevOps auto-hébergés, séparer les pools et employer des comptes peu privilégiés. Microsoft indique qu'un agent hébergé fournit une machine propre par exécution. Son accès au Harbor privé de FacturaDJ reste cependant à définir et à tester. [Sécurité des agents Azure Pipelines](https://learn.microsoft.com/en-us/azure/devops/pipelines/security/misc?view=azure-devops).

Appliquer ensuite les restrictions réseau proposées :

- Autoriser le registre et les sources de bases validées, ou leurs miroirs internes approuvés.
- Écarter les routes utiles vers les API de déploiement.
- Tester les besoins DNS, TLS et proxy avec les règles sortantes actives.
- Injecter les identifiants de registre en lecture seule pour la durée du scan, puis les retirer.
- Vérifier que les journaux ne contiennent ni jeton, ni URL de webhook, ni fichier Docker d'authentification.

Une liste de destinations autorisées réduit les sorties possibles. Elle ne garantit pas l'innocuité de ces destinations.

### Relier commit, image, inventaire et décision

**But :** retrouver la construction et le contrôle qui justifient un digest déployé.

Pour chaque exécution, enregistrer les valeurs réelles dans un manifeste de preuves.

| Élément | Données à conserver |
|---|---|
| Source | URL GitHub et commit complet |
| Construction | Identifiant Azure DevOps, version du pipeline, identité du constructeur, début et fin UTC |
| Image | Référence Harbor par digest et plateforme analysée |
| Inventaire | SHA-256 du SBOM, format, version Syft, périmètre, nombre de composants |
| Analyse | SHA-256 du rapport, version du scanner, identité/date de la base, paramètres |
| Décision | Version de politique, état, exception et expiration éventuelles, approbateur |
| Promotion et GitOps | Digest confirmé après promotion, MR approuvée, commit GitLab fusionné |
| Déploiement | Révision Argo CD, namespace, référence effective de l'image, état de santé observé |

**Contrôle :** suivre les relations entre ces éléments. Le digest d'un manifeste OCI multiarchitecture diffère de celui du manifeste d'une plateforme. Conserver les deux et leur relation lorsqu'ils existent. Un tag seul ne permet pas cette traçabilité.

Un manifeste JSON local relie les fichiers, mais peut être modifié avec eux. Déposer les preuves dans un stockage à accès restreint, journalisé et doté d'une rétention protégée.

Une amélioration avancée consiste à signer une attestation de décision liée au digest, avec une identité séparée. La signature du build renseigne sur la fabrication. L'attestation de décision renseigne sur le contrôle de sécurité effectué.

### Protéger la promotion, puis l'admission Kubernetes

Le **socle indispensable proposé** repose sur le circuit GitOps :

1. Exiger un dossier de scan conforme et encore valable avant la fusion d'une MR changeant le digest.
2. Empêcher le compte de proposition d'approuver ou de fusionner sa propre MR.
3. Déployer le digest approuvé avec une identité Argo CD limitée aux opérations nécessaires.
4. Protéger la branche et les chemins de manifests GitOps, tout en conservant l'export sélectif GitHub → GitLab.

L'**amélioration avancée à qualifier** est un contrôle d'admission sur **k3d-nexora**. Il doit refuser une image sans signature ou sans attestation de décision approuvée. Un contrôleur installé sur le cluster Talos/Proxmox d'Argo CD ne protégerait pas les admissions du cluster distant.

Avant activation, vérifier les versions Kubernetes, les droits, l'accès au registre, le fonctionnement hors ligne et la réaction à une panne. L'admission intervient avant la persistance des requêtes admises et complète le contrôle GitOps. [Admission Kubernetes](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/).

Sigstore Policy Controller permet des règles sur signatures et attestations, avec sélection des namespaces. Son installation dans FacturaDJ n'est pas présumée. Le qualifier d'abord en laboratoire, puis en observation si ce mode est disponible, avant le refus effectif. Préparer un chemin de récupération administré. [Documentation officielle Policy Controller](https://docs.sigstore.dev/policy-controller/overview/).

**Contrôle :** tester le refus lorsque la preuve ou son vérificateur est indisponible. Prévoir aussi une réévaluation distincte des digests déjà déployés : l'admission ne réexamine pas rétroactivement les Pods en cours d'exécution. Toute remédiation suit une décision tracée et, si nécessaire, un nouveau déploiement.

<a id="section-12"></a>

## 12. Réponse à une suspicion de compromission

Ce **runbook proposé** traite une suspicion de compromission du scanner ou de son environnement. Une simple CVE dans l'image applicative ne déclenche pas cette procédure.

### Contenir, préserver, puis rétablir

Suivre l'ordre ci-dessous. Les responsables sont des rôles à attribuer dans le dossier d'exploitation.

1. **Ouvrir l'incident — responsable incident.**

   **But :** fixer un point de départ commun. Ouvrir un identifiant d'incident et enregistrer l'avis, sa date et le périmètre connu.

   **Contrôle :** conserver le ticket initial horodaté en UTC et une copie des sources utilisées.

2. **Arrêter les usages suspects — exploitation CI.**

   **But :** empêcher une nouvelle exposition. Interdire le scanner avant son initialisation, son téléchargement ou son exécution. Suspendre les promotions et propositions de déploiement concernées.

   **Contrôle :** conserver la configuration appliquée et la liste des exécutions bloquées.

3. **Confiner les agents — exploitation infrastructure.**

   **But :** réduire les communications de l'environnement suspect. Retirer les agents de leurs pools et confiner leurs accès. Préserver un accès d'investigation contrôlé.

   **Contrôle :** consigner les agents concernés, les règles de confinement et les snapshots, lorsqu'ils sont adaptés.

4. **Préserver les preuves — sécurité.**

   **But :** permettre l'investigation avant nettoyage. Conserver les journaux, caches, fichiers d'agent et métadonnées des artefacts avant leur suppression.

   **Contrôle :** dresser l'inventaire des preuves avec leurs empreintes, leur gardien et leur lieu de stockage.

5. **Déterminer l'exposition — sécurité et propriétaires des services.**

   **But :** connaître les accès à révoquer et les services à examiner. Identifier les outils exécutés et tous les secrets accessibles. Inclure ceux présents hors des variables explicitement injectées dans le job.

   **Contrôle :** établir une matrice reliant exposition, identité et période.

6. **Révoquer, puis renouveler les accès — propriétaires des secrets.**

   **But :** retirer les accès exposés sans les rendre au composant compromis. Révoquer les identifiants concernés, puis les réémettre depuis un environnement sain.

   **Contrôle :** conserver le journal de révocation et de rotation. Vérifier que les anciens accès sont refusés.

7. **Examiner les artefacts — équipe build.**

   **But :** empêcher l'usage d'une sortie suspecte. Mettre en quarantaine les artefacts produits, signés ou promus pendant la période concernée. Examiner leurs dépendances et leurs sorties.

   **Contrôle :** conserver la liste des digests et la décision prise pour chacun.

8. **Reconstruire le chemin de secours — exploitation CI.**

   **But :** reprendre depuis une base approuvée. Reconstruire les agents, puis rétablir le secours indépendant et ses identifiants limités.

   **Contrôle :** conserver les preuves de reconstruction et les résultats de vérification du secours.

9. **Autoriser la reprise — sécurité et exploitation.**

   **But :** limiter la reprise aux artefacts reconstruits ou réévalués et conformes.

   **Contrôle :** obtenir une décision nominative indiquant le périmètre, l'expiration et les liens vers les preuves.

### Étendre l'analyse aux accès réellement disponibles

Si le scanner a pu lire une clé WireGuard, un kubeconfig, un jeton Argo CD ou une clé de signature, examiner les services accessibles avec cette identité. La rotation du seul jeton Harbor ne couvre pas les autres accès. Ne pas recopier les anciennes configurations d'un agent suspect dans le nouveau pool sans vérification.

Les enquêteurs peuvent rechercher les indicateurs de l'avis officiel dans les journaux DNS et les communications sortantes. L'absence d'un indicateur particulier ne démontre pas l'absence de compromission.

Retirer un artefact des usages opérationnels n'oblige pas à détruire les preuves. Conserver, si nécessaire, une copie en lecture seule, à accès limité et interdite d'exécution. Dans Mattermost, partager l'état et les liens autorisés ; ne pas publier de secrets ou d'artefacts potentiellement hostiles.

### Réévaluer les images déjà déployées

1. **Retrouver les digests.** Inventorier les images réellement présentes dans `facturadj-preprod`. Les relier à leur build et à leur dossier de preuves. Conserver les révisions GitLab et Argo CD.
2. **Déterminer ce qui a été touché.** Une image seulement scannée par l'environnement compromis perd au minimum une preuve fiable. Une image construite, signée ou publiée par cet environnement peut être affectée elle-même.
3. **Réévaluer les vulnérabilités connues.** Rescanner depuis le secours sain. Ce contrôle ne suffit pas à détecter une porte dérobée introduite pendant la construction.
4. **Reconstruire si la fabrication n'est plus fiable.** Partir d'entrées vérifiées dans un environnement sain. Requalifier et promouvoir l'image, puis proposer le changement GitOps par le circuit habituel d'approbation.
5. **Gérer un retrait urgent.** Suivre le runbook d'incident de l'application. Employer un digest de retour encore approuvé : son ancienneté ne suffit pas à établir sa sûreté.

<a id="section-13"></a>

## 13. Atelier de bascule : protocole réversible

### Organiser l'exercice et mesurer son résultat

**Statut : ces scénarios d'intégration n'ont pas été exécutés pendant la rédaction.** Ils nécessitent une infrastructure de laboratoire, les outils approuvés et une configuration réelle. Les tests unitaires emploient des exécutables témoins inoffensifs : ils vérifient la logique du gate, pas la détection réelle ni les intégrations externes.

Commencer sur une application et un projet Harbor isolés. Rejouer ensuite dans `facturadj-preprod` pendant une fenêtre approuvée. Avant toute mutation, relever digest déployé, révision GitOps, état Argo et réglages Harbor. Les pannes simulées restent locales au test : ne pas couper globalement Harbor, WireGuard ou Argo.

| Mesure | Objectif proposé | Début et fin à relever |
|---|---|---|
| Décision | 15 min | Déclencheur → autorisation de bascule |
| Activation | 15 min | Décision approuvée → premier contrôle de secours valide |
| Bascule globale | 30 min | Déclencheur → premier contrôle de secours valide |

Ces objectifs sont à accepter ou ajuster ; ce ne sont ni des mesures ni des garanties. Mesurer aussi le pipeline complet jusqu'au déploiement, avec l'attente des approbations séparée. Conserver les dates UTC du déclencheur, de l'autorisation, du nouveau run, du scan, de la promotion, de l'approbation, de la fusion et de la réconciliation.

Critères de sécurité : aucun digest rejeté rendu déployable ; aucune fusion/déploiement avant approbation ; aucune invocation de Trivy lorsqu'il est interdit. Un temps de mock ne mesure pas la performance des scanners.

### Préparer la VM Linux et les fonctions communes

**Où :** agent de laboratoire Debian/Ubuntu sain, préparé selon le chapitre d'installation. Reconstituer les scripts, configurations et tests de l'annexe 22 sous `continuite-scan-support`. `REPO_ROOT` est le **répertoire parent qui contient `continuite-scan-support`**, jamais ce sous-dossier lui-même. Depuis ce répertoire parent, `export REPO_ROOT="$PWD"` fixe le bon chemin ; aucun pack externe n'est nécessaire.

**But :** modifier seulement des copies de configuration et conserver une preuve par cas. Renseigner `CFG_SOURCE` avec la configuration approuvée, extérieure au checkout applicatif, et `CONTROLS_SOURCE` avec le reçu réel des contrôles annexes du même digest/build. Utiliser une image attendue conforme, sauf pour le scénario 4, à mener dans une session distincte.

```bash
set -euo pipefail
umask 077
: "${REPO_ROOT:?Chemin du dépôt contenant continuite-scan-support requis}"
: "${CFG_SOURCE:?Répertoire de configuration approuvée requis}"
: "${CONTROLS_SOURCE:?JSON des contrôles auxiliaires requis}"
: "${IMAGE_REF:?Référence Harbor par digest mono-plateforme requise}"
SCAN="$REPO_ROOT/continuite-scan-support/scripts/scan.sh"
test -f "$SCAN"
test -f "$CONTROLS_SOURCE"
LAB_ROOT="$(mktemp -d -t scan-bascule.XXXXXXXX)"
export LAB_ROOT IMAGE_REF
mkdir -p "$LAB_ROOT/baseline" "$LAB_ROOT/results"
for filename in tools.lock.json trust.json db-trivy.json db-grype.json \
                policy.json exceptions.json profile.json; do
  test -f "$CFG_SOURCE/$filename"
  cp -- "$CFG_SOURCE/$filename" "$LAB_ROOT/baseline/$filename"
done
cp -- "$CONTROLS_SOURCE" "$LAB_ROOT/controls.json"
date -u +%FT%TZ > "$LAB_ROOT/start.utc"

# Chaque cas repart d'une copie neuve ; aucune configuration de production ne change.
new_case() {
  CASE_NAME="$1"
  CASE_CFG="$LAB_ROOT/$CASE_NAME-config"
  mkdir -- "$CASE_CFG"
  cp -- "$LAB_ROOT/baseline/"*.json "$CASE_CFG/"
}

# Attend une décision normalisée ; ne traite jamais une commande absente comme réussie.
scan_case() {
  local mode="$1" expected="$2" actual=0
  local out="$LAB_ROOT/results/$CASE_NAME-$mode"
  date -u +%FT%TZ > "$LAB_ROOT/results/$CASE_NAME-$mode-start.utc"
  if bash "$SCAN" --mode "$mode" --image "$IMAGE_REF" --out "$out" \
      --tools "$CASE_CFG/tools.lock.json" --trust "$CASE_CFG/trust.json" \
      --db "$CASE_CFG/db-$mode.json" --policy "$CASE_CFG/policy.json" \
      --exceptions "$CASE_CFG/exceptions.json" --profile "$CASE_CFG/profile.json" \
      --controls "$LAB_ROOT/controls.json" \
      > "$LAB_ROOT/results/$CASE_NAME-$mode.log" 2>&1; then
    actual=0
  else
    actual=$?
  fi
  date -u +%FT%TZ > "$LAB_ROOT/results/$CASE_NAME-$mode-end.utc"
  printf 'attendu=%s observé=%s\n' "$expected" "$actual" \
    > "$LAB_ROOT/results/$CASE_NAME-$mode-exit.txt"
  cat "$LAB_ROOT/results/$CASE_NAME-$mode-exit.txt"
  test "$actual" -eq "$expected"
  test -s "$out/decision.json"
  python3 -m json.tool "$out/decision.json"
}
```


`new_case` repart d'une copie neuve ; `scan_case` conserve journaux/dates, compare le code reçu au code attendu et affiche la décision. Son succès signifie **test conforme à l'attendu**, y compris s'il attend un refus ; il n'autorise pas une publication.

Vérifier d'abord la baseline. Si elle échoue, corriger ses prérequis sans affaiblir les règles. Les caches approuvés restent en lecture seule ; un scénario qui modifierait un cache doit en utiliser une copie dédiée.

Pour contrôler la logique locale, exécuter les tests reconstruits depuis l'annexe :

```bash
python3 -m unittest discover -s "$REPO_ROOT/continuite-scan-support/tests" -v
```


Conserver sortie, révision des scripts et environnement Python. Ces fixtures ne publient aucune image et n'accèdent pas à Kubernetes.

### Scénario 1 — Qualifier le nominal et le secours

**Préparation.** Choisir un digest attendu conforme, avec contrôles annexes valides. Les deux chemins doivent être fiables. Répéter l'exercice pour Django/Python, Astro/Node.js et les paquets des images de base ; interdire ce double scan pour tout outil suspect.

**Commandes.** Exécuter les deux chemins sur la même référence :

```bash
new_case nominal
scan_case trivy 0
scan_case grype 0
```


**Attendu.** Deux décisions complètes sur le même digest et la même plateforme, sous la même politique. Le double scan qualifie le secours ; la production utilisera le mode approuvé. `PASS` reste compatible avec des vulnérabilités sous le seuil ou des exceptions valides.

**Preuves.** Versions/empreintes des outils, dates/bases, profil, SBOM, rapports et décisions. Comparer les écarts par paquet, version, identifiant et source. Expliquer les composants absents et décisions différentes ; l'égalité des totaux de CVE ne démontre pas la couverture.

**Nettoyage.** Conserver la référence et ses preuves, retirer les seuls identifiants temporaires. Recommencer la préparation dans un dossier distinct pour chaque digest ; le scan ne modifie pas l'image.

### Scénario 2 — Interrompre le nominal par un timeout

**Préparation.** Qualifier d'abord le secours et son accès à l'image. Utiliser un run sans droit de promotion. La limite très courte ci-dessous interrompt l'invocation sans modifier les outils, caches ou réseaux partagés.

**Commande de simulation.**

```bash
new_case timeout
timeout_rc=0
timeout --signal=TERM --kill-after=5s 0.001s \
  bash "$SCAN" --mode trivy --image "$IMAGE_REF" \
    --out "$LAB_ROOT/results/timeout-superviseur" \
    --tools "$CASE_CFG/tools.lock.json" --trust "$CASE_CFG/trust.json" \
    --db "$CASE_CFG/db-trivy.json" --policy "$CASE_CFG/policy.json" \
    --exceptions "$CASE_CFG/exceptions.json" --profile "$CASE_CFG/profile.json" \
    --controls "$LAB_ROOT/controls.json" \
  > "$LAB_ROOT/results/timeout-superviseur.log" 2>&1 || timeout_rc=$?
printf 'Code du superviseur : %s\n' "$timeout_rc"
test "$timeout_rc" -eq 124 || test "$timeout_rc" -eq 137
```


**Attendu.** `124` ou `137` vient du superviseur GNU `timeout`/de la terminaison, pas de Trivy ni du contrat `0/10/20/30`. L'interruption peut laisser `decision.json` absent : le pipeline reste en erreur, sans promotion, MR ou nouveau déploiement.

Après décision tracée et contrôle de confiance, lancer un **nouveau run** Grype sur l'agent de secours préparé. Si cet agent est distinct, y rejouer la préparation commune pour disposer des fonctions, configurations et fichiers nécessaires :

```bash
# Après approbation et dans la session de l'agent de secours de laboratoire :
new_case secours-apres-timeout
scan_case grype 0
```


**Preuves.** Code du superviseur, run initial en échec, absence de succès exploitable, décision de bascule, nouveau rapport Grype et état Harbor/GitLab/Argo.

**Nettoyage.** Aucune configuration persistante à restaurer. Fermer les MR d'exercice ou restaurer par GitOps si le parcours complet a été joué.

### Scénario 3 — Interdire Trivy avant toute exécution

**Préparation.** Simuler une décision d'interdiction dans la seule copie de confiance. Aucun composant malveillant n'est utilisé. Pour l'intégration, prévoir un pool sain, des caches distincts et des identifiants de laboratoire.

**Commandes.** Interdire Trivy puis tester le secours :

```bash
new_case confiance-trivy
python3 - "$CASE_CFG/trust.json" <<'PY'
import json, pathlib, sys
p = pathlib.Path(sys.argv[1]); data = json.loads(p.read_text())
data["trivy_allowed"] = False
p.write_text(json.dumps(data, indent=2) + "\n")
PY
scan_case trivy 30
scan_case grype 0
```


**Attendu.** Trivy retourne `30` (`UNTRUSTED`) avant toute invocation, y compris `--version`. L'instrumentation de l'agent ou les témoins des tests doivent prouver zéro exécution. Grype passe seulement si son outil, son agent, sa base et ses accès restent fiables.

Simuler ensuite la perte de confiance dans l'environnement :

```bash
new_case confiance-agent
python3 - "$CASE_CFG/trust.json" <<'PY'
import json, pathlib, sys
p = pathlib.Path(sys.argv[1]); data = json.loads(p.read_text())
data["environment_trusted"] = False
p.write_text(json.dumps(data, indent=2) + "\n")
PY
scan_case grype 30
```


Grype doit alors être interdit aussi, avec `30`.

**Preuves.** Décision d'interdiction, absence d'invocation, identité du pool sain, inventaire des accès exposables et suspension des usages Trivy résiduels, dont Harbor.

**Nettoyage.** Archiver puis retirer les seules copies d'exercice. En incident réel, suivre le runbook de retour ; remettre un booléen à vrai ne rétablit pas la confiance.

### Scénario 4 — Bloquer une image non conforme

**Préparation.** Dans une session distincte, choisir une image de laboratoire dont un paquet/vulnérabilité bloquant a été identifié avec la base du jour, sans l'exposer publiquement. Rejouer la préparation commune avec son `IMAGE_REF` et son `CONTROLS_SOURCE`, afin de copier le reçu correspondant. Les autres scénarios conservent leur baseline conforme.

Une base évolutive peut changer le résultat d'un digest. Sans image de rejet connue, noter ce scénario comme **à préparer** ; une fixture teste seulement la décision.

**Commandes.**

```bash
# IMAGE_REF et contrôles auxiliaires doivent désigner l'image de rejet de laboratoire.
new_case rejet-image
scan_case trivy 10
```


**Attendu.** `10` (`REJECT`), sans invocation automatique de Syft/Grype, promotion ou MR. Corriger les paquets ou l'image de base, reconstruire, puis contrôler le nouveau digest. Toute exception exige justification, approbation, périmètre et échéance.

**Preuves.** Composant/version/CVE/source/sévérité, correctif présent ou absent, décision, absence de repli et état GitOps inchangé.

**Nettoyage.** Après archivage, retirer les références de test selon la rétention locale. Conserver les règles de sécurité et fermer cette session.

### Scénario 5 — Refuser une base ancienne ou absente

**Préparation.** Reprendre la baseline conforme. Modifier seulement la date du manifeste de base copié ; les fichiers de cache ne changent pas. Le test porte sur le contrôle de fraîcheur.

**Commandes.**

```bash
new_case base-ancienne
python3 - "$CASE_CFG/db-grype.json" <<'PY'
import json, pathlib, sys
p = pathlib.Path(sys.argv[1]); data = json.loads(p.read_text())
data["built_at"] = "2000-01-01T00:00:00Z"
p.write_text(json.dumps(data, indent=2) + "\n")
PY
scan_case grype 20

new_case base-absente
mv -- "$CASE_CFG/db-grype.json" "$CASE_CFG/db-grype.json.saved"
scan_case grype 20
```


**Attendu.** `20` (`ERROR`) dans les deux cas, sans promotion. La présence d'un cache ne transforme pas l'absence de preuve en succès. Une empreinte altérée ou une origine suspecte relève de la perte de confiance selon le contrôle concerné.

**Preuves.** Date/source de base, erreur du gate et absence de changement en aval.

**Nettoyage.** Garder les copies comme simulation puis repartir de la baseline. En exploitation, importer une base récente approuvée et établir son vrai manifeste ; ne jamais changer seulement `built_at`.

### Scénario 6 — Refuser un SBOM inexploitable ou altéré

**Préparation.** Conserver un SBOM Syft JSON réellement produit pour l'image, puis créer des copies invalides. Elles restent réservées au laboratoire.

**Commandes de simulation.**

```bash
: "${SBOM_SOURCE:?Chemin du SBOM Syft JSON réel requis}"
mkdir -- "$LAB_ROOT/sbom-invalides"
cp -- "$SBOM_SOURCE" "$LAB_ROOT/sbom-invalides/original.syft.json"
python3 - "$LAB_ROOT/sbom-invalides" <<'PY'
import json, pathlib, sys
d = pathlib.Path(sys.argv[1]); source = json.loads((d / "original.syft.json").read_text())
empty = dict(source); empty["artifacts"] = []
(d / "vide.syft.json").write_text(json.dumps(empty))
(d / "tronque.syft.json").write_text('{"artifacts": [')
wrong = dict(source); wrong["source"] = {"type": "image", "target": "sujet-de-test-invalide"}
(d / "mauvais-sujet.syft.json").write_text(json.dumps(wrong))
PY
```


Analyser la copie tronquée avec le binaire Grype déjà vérifié et autorisé. Pour attribuer l'échec au JSON, vérifier d'abord qu'un **SBOM valide** est analysable dans le même environnement. Un simple code non nul pourrait sinon provenir d'une base absente.

Préparer un répertoire sans configuration applicative et utiliser le cache du snapshot approuvé. Le premier scan doit réussir avant de poursuivre :

```bash
: "${GRYPE_BIN:?Chemin absolu du Grype approuve requis}"
export GRYPE_DB_CACHE_DIR="$(python3 - "$CFG_SOURCE/db-grype.json" <<'PY'
import json, sys
with open(sys.argv[1], encoding="utf-8") as stream:
    print(json.load(stream)["cache_dir"])
PY
)"
export GRYPE_CHECK_FOR_APP_UPDATE=false
export GRYPE_DB_VALIDATE_AGE=true
export GRYPE_DB_MAX_ALLOWED_BUILT_AGE=24h
DIAG_START_DIR="$PWD"
mkdir -- "$LAB_ROOT/grype-diagnostic"
printf '{}\n' > "$LAB_ROOT/grype-diagnostic/.grype.yaml"
cd -- "$LAB_ROOT/grype-diagnostic"
GRYPE_DB_AUTO_UPDATE=false "$GRYPE_BIN" --config .grype.yaml \
  "sbom:$SBOM_SOURCE" -o json \
  > "$LAB_ROOT/results/grype-sbom-valide.json" \
  2> "$LAB_ROOT/results/grype-sbom-valide.log"
```

La commande suivante retrouve la configuration vide dans ce même répertoire. Il s'agit d'un diagnostic, pas d'une décision de déploiement :

```bash
: "${GRYPE_BIN:?Chemin du Grype approuvé et vérifié requis}"
native_rc=0
GRYPE_DB_AUTO_UPDATE=false "$GRYPE_BIN" \
  "sbom:$LAB_ROOT/sbom-invalides/tronque.syft.json" -o json \
  > "$LAB_ROOT/results/grype-sbom-tronque.json" \
  2> "$LAB_ROOT/results/grype-sbom-tronque.log" || native_rc=$?
printf 'Code natif observé sur JSON tronqué : %s\n' "$native_rc"
test "$native_rc" -ne 0
```

Revenir ensuite au répertoire de travail :

```bash
cd -- "$DIAG_START_DIR"
```

**Interpréter le refus :** lire `grype-sbom-tronque.log` et confirmer une erreur de lecture ou de décodage du SBOM. Une erreur de base, de certificat ou de permission ne valide pas ce scénario ; la corriger puis recommencer dans un nouveau dossier. Les réglages de diagnostic ci-dessus utilisent la limite proposée de 24 h ; les adapter explicitement si la politique approuvée change.

**Attendu à la génération.** JSON tronqué : code natif non nul. SBOM vide ou mauvais sujet : échec du contrôle de couverture ou de liaison au digest dans les tests. Un scanner peut accepter un inventaire vide sans trouver de vulnérabilité ; le profil doit le refuser. Le wrapper reste `image → Syft → SBOM → Grype`, sans ajout d'un import SBOM qui contournerait ces contrôles.

Vérifier aussi la détection d'une altération **après** scan, avant promotion :

```bash
new_case sbom-integrite
scan_case grype 0
RUN_DIR="$LAB_ROOT/results/sbom-integrite-grype"
cp -- "$RUN_DIR/sbom.syft.json" "$LAB_ROOT/sbom-invalides/avant-alteration.syft.json"
cp -- "$LAB_ROOT/sbom-invalides/vide.syft.json" "$RUN_DIR/sbom.syft.json"
verify_rc=0
python3 "$REPO_ROOT/continuite-scan-support/scripts/gate.py" verify \
  --image "$IMAGE_REF" --out "$RUN_DIR" \
  --trust "$CASE_CFG/trust.json" --policy "$CASE_CFG/policy.json" \
  --exceptions "$CASE_CFG/exceptions.json" \
  > "$LAB_ROOT/results/sbom-integrite-verify.log" 2>&1 || verify_rc=$?
printf 'Validation après altération : %s\n' "$verify_rc"
test "$verify_rc" -eq 20
```


**Attendu après altération.** Le vérificateur retourne `20` pour empreinte différente. Cela complète les tests de validité/couverture dès génération. Appeler `gate.py verify` sur les preuves reçues avant toute mutation Harbor ou GitLab.

Pour la liaison au sujet, rechercher le digest de manifeste dans les métadonnées du format qualifié : le premier SHA rencontré peut être celui de configuration.

**Preuves.** Empreintes de l'original et des copies, erreur de parsing, refus du profil/de la liaison au sujet et journal de vérification d'intégrité.

**Nettoyage.** Archiver les fichiers sous une mention « invalide — laboratoire », sans les associer à une image déployable.

### Scénario 7 — Constater qu'aucun secours fiable n'est disponible

**Préparation.** Dans les copies, interdire Trivy et désigner un chemin Grype absent. Le contrôle d'intégrité doit refuser tout remplacement arbitraire.

**Commandes.**

```bash
new_case secours-absent
python3 - "$CASE_CFG/trust.json" "$CASE_CFG/tools.lock.json" "$LAB_ROOT" <<'PY'
import json, pathlib, sys
t = pathlib.Path(sys.argv[1]); trust = json.loads(t.read_text())
trust["trivy_allowed"] = False; t.write_text(json.dumps(trust, indent=2) + "\n")
p = pathlib.Path(sys.argv[2]); tools = json.loads(p.read_text())
tools["tools"]["grype"]["path"] = str(pathlib.Path(sys.argv[3]) / "grype-absent")
p.write_text(json.dumps(tools, indent=2) + "\n")
PY
scan_case grype 30
```


**Attendu.** `30` (`UNTRUSTED`) avant exécution : aucun chemin fiable, donc aucun nouveau déploiement. Une panne pendant l'exécution d'un outil approuvé relèverait de `20`. Rejouer dans un nouveau cas en visant `syft` pour tester l'autre dépendance.

**Preuves.** Artefact absent, refus préalable et absence de promotion, MR ou nouveau digest déployé.

**Nettoyage.** Aucune installation n'a changé. Repartir d'une configuration approuvée complète.

### Scénario 8 — Vérifier Harbor, GitLab et Argo ensemble

**Préparation commune.** Après qualification du scan, utiliser un projet Harbor et une application de laboratoire. Sauvegarder les réglages et employer les interfaces/API de la **version installée**. Définir les références de test par digests réels. Pour les pulls, prévoir un `DOCKER_CONFIG` neuf avec la seule identité testée.

#### 8.1 Refuser la lecture de quarantaine aux nœuds

**Commande :** depuis un client isolé avec l'identité de pull des nœuds, lancer `docker pull "$QUARANTINE_REF"`.

**Attendu et preuve :** refus d'accès ; conserver code et journal sans secrets. **Nettoyage :** `docker logout "$HARBOR_HOST"`, puis retirer la configuration Docker temporaire.

#### 8.2 Tester les restrictions de pull Harbor

**Préparer et agir :** disposer d'un scanner intégré fiable, d'une image rejetée et d'une non scannée. Activer le seuil seulement sur le projet laboratoire, scanner, puis tester `docker pull "$REJECTED_REF"` et `docker pull "$UNSCANNED_REF"`.

**Attendu et preuve :** rejet de l'image non conforme ; consigner exactement le comportement de l'image non scannée. Une autorisation inattendue bloque la qualification. Le client doit joindre réellement Harbor : son cache local ne prouve pas une restriction réseau.

**Nettoyage :** restaurer les réglages sauvegardés ; conserver les preuves, retirer les credentials. Ne pas effacer les caches des nœuds en service.

#### 8.3 Simuler l'échec du scanner intégré

**Préparer et agir :** rendre indisponible le seul adaptateur de laboratoire, déclencher un scan dans l'interface et tenter le pull avec l'identité de test.

**Attendu et preuve :** état d'erreur observé ; CI/promotion bloquée même si Harbor accepte le pull. **Nettoyage :** rétablir l'adaptateur, lancer un scan sain et vérifier son état.

#### 8.4 Refuser la promotion sans décision conforme

**Préparer et agir :** fournir successivement une décision `REJECT`, `ERROR` ou `UNTRUSTED` au pipeline de laboratoire raccordé au contrat de promotion.

**Attendu et preuve :** rôle de publication inaccessible, aucune MR et aucun nouveau digest déployable. **Nettoyage :** fermer toute proposition accidentelle et corriger le gate avant reprise.

#### 8.5 Refuser une fusion sans approbation

**Préparer et agir :** proposer un digest conforme avec preuve valide, puis tenter la fusion de la MR sans approbation avec l'identité testée.

**Attendu et preuve :** fusion impossible et révision Argo inchangée. Un simple statut « non approuvé » sans refus ne suffit pas. **Nettoyage :** fermer la MR ou poursuivre le cas approuvé.

#### 8.6 Déployer seulement après fusion approuvée

**Préparer et agir :** confirmer digest final et validité des preuves. L'approbateur habilité approuve, le mainteneur fusionne, puis observer Argo.

**Attendu et preuve :** réconciliation après fusion, via WireGuard, vers `facturadj-preprod` sur le VPS. **Nettoyage :** ouvrir une nouvelle MR pour restaurer le digest antérieur encore approuvé.

#### 8.7 Refuser des preuves expirées pendant l'attente

**Préparer et agir :** laisser la MR conforme non fusionnée jusqu'à expiration, ou utiliser l'horloge contrôlée d'un validateur de laboratoire. Relancer la validation promotion/fusion sans changer l'horloge de la plateforme partagée.

**Attendu et preuve :** fusion ou déploiement bloqué jusqu'au nouveau contrôle valide ; aucun changement silencieux du digest après approbation. **Nettoyage :** joindre les preuves du nouveau run et refaire approuver.

#### Observer la révision et les images exécutées

Avant fusion, relever l'état initial. Après fusion, collecter révision Argo, manifests et imageID des pods :

```bash
: "${ARGO_APP:?Application réelle de test requise}"
: "${VPS_CONTEXT:?Contexte réel du VPS requis}"
argocd app get "$ARGO_APP" -o json > "$LAB_ROOT/results/argo-after.json"
kubectl --context "$VPS_CONTEXT" -n facturadj-preprod get deployments -o json \
  > "$LAB_ROOT/results/deployments-after.json"
kubectl --context "$VPS_CONTEXT" -n facturadj-preprod get pods -o json \
  > "$LAB_ROOT/results/pods-after.json"
python3 - "$LAB_ROOT/results/pods-after.json" <<'PY'
import json, sys
pods = json.load(open(sys.argv[1], encoding="utf-8"))
for p in pods["items"]:
    status = p.get("status", {})
    for s in status.get("initContainerStatuses", []) + status.get("containerStatuses", []):
        print(p["metadata"]["name"], s["name"], s.get("image"), s.get("imageID"))
PY
```


**Contrôle final :** attendre `Synced` et la santé attendue, puis vérifier rollout et réponse applicative. Une synchronisation Git réussie ne prouve pas le fonctionnement de l'application. Rapprocher l'imageID, dont le format dépend du runtime, du manifeste de plateforme déployé.

### Scénario 9 — Revenir à Trivy et restaurer le laboratoire

**Préparation.** Appliquer le runbook de retour : communication d'incident examinée, version validée, agents sains, caches réévalués, secrets traités et corpus rejoué. Conserver l'ancienne décision et les résultats du secours. Une copie de confiance créée pour l'exercice ne vaut pas approbation de retour.

**Commandes.** Provisionner la nouvelle configuration approuvée et rejouer la préparation commune avec sa `CFG_SOURCE`, puis :

```bash
new_case retour-trivy
scan_case trivy 0
scan_case grype 0
```


**Attendu.** Pas de régression inexpliquée sur le corpus qualifié ; même politique et preuves conservées. Autoriser le nominal par une décision tracée et clôturer le mode de crise. Maintenir le secours prêt à l'emploi.

Pour restaurer l'application, proposer une MR avec le digest précédent **encore approuvé et non révoqué**. Refaire le scan si le rapport a expiré ; approuver, fusionner et observer Argo/pods. Un `kubectl set image` isolé ne restaure pas Git et peut être annulé par Argo.

**Preuves.** Décision de retour, comparaison du corpus, MR/commit de restauration, révision Argo et digest observé.

**Nettoyage.** Fermer les branches temporaires, révoquer les robots d'exercice, restaurer les réglages et archiver les preuves sans secrets. Après rétention, supprimer seulement le répertoire temporaire créé et vérifié pour cet atelier.

<a id="section-14"></a>

## 14. Runbook de bascule contrôlée vers Syft + Grype

### Attribuer les rôles et qualifier le déclencheur

Nommer dans le dossier d'exploitation le **pilote d'incident**, l'**opérateur CI**, l'**approbateur sécurité**, l'**administrateur Harbor** et le **responsable GitOps**. Ces rôles sont proposés ; aucun compte existant n'est présumé.

Avant de changer de scanner, classer l'événement.

| Déclencheur | Décision | Condition à vérifier |
|---|---|---|
| Erreur technique autorisée : binaire ou miroir indisponible, délai externe dépassé | Bascule manuelle ou automatisme expressément autorisé | L'agent et ses accès restent de confiance. |
| Base trop ancienne | Refuser le résultat hors politique | Le secours dispose d'une base conforme et d'un périmètre qualifié. |
| Distribution ou agent suspect | Interdire Trivy avant exécution ; approuver la bascule manuelle | Le pool est sain, les preuves sont préservées et les accès ont été traités. |
| Vulnérabilité applicative bloquante | Maintenir le rejet de sécurité | Aucun changement de scanner ne contourne ce résultat. |
| Aucun chemin fiable | Bloquer promotion et déploiement | Le contrôle doit être rétabli avant la reprise. |

### Protéger le choix du scanner

`SCANNER_MODE=trivy|grype` est une **conception à implémenter**. Conserver cette valeur dans une ressource protégée ou un template contrôlé. Limiter les droits de modification et refuser toute valeur inconnue. Une variable librement remplaçable lors de la mise en file du pipeline ne suffit pas.

Prévoir aussi une interdiction indépendante, par exemple `TRIVY_ALLOWED=false`. L'évaluer **avant** l'installation et l'exécution de Trivy. Les templates et les restrictions du pool doivent empêcher un contributeur de lever cette interdiction par un simple changement de variable.

**Contrôle :** conserver l'audit de la modification et sa révision. Vérifier que l'interdiction reste effective même si `SCANNER_MODE` change.

### Exécuter la bascule manuelle

1. **Identifier et horodater.**

   Ouvrir le ticket et classer l'événement. Joindre le message d'erreur ou l'avis. Relever l'heure de première décision.

   **Contrôle :** la cause est documentée. Un code non nul n'est pas assimilé automatiquement à une panne.

2. **Geler la promotion concernée.**

   Arrêter les nouvelles propositions GitOps dépourvues de preuve valide. L'image peut rester dans Harbor en quarantaine si cette zone ne sert pas au déploiement et si ses droits ont été vérifiés.

   **Contrôle :** aucune image sans décision valable ne progresse vers le déploiement.

3. **Vérifier le secours.**

   Contrôler les versions, digests et signatures approuvés de Syft et Grype. Vérifier l'identité du pool, la fraîcheur de la base et l'accès en lecture au digest Harbor. Confirmer la politique et les contrôles séparés des secrets, configurations et licences.

   **Contrôle :** les dépendances du secours sont opérationnelles avant son activation.

4. **Vérifier tous les autres usages de Trivy.**

   Examiner la CI, l'initialisation des agents, les scripts, les images d'agents, le scanner Harbor et les intégrations GitHub éventuelles. Rechercher une politique Harbor qui bloque le téléchargement en l'absence de scan intégré.

   **Contrôle :** aucun usage Trivy actif ou verrou résiduel n'a été oublié. Un rapport Grype en CI ne remplace pas automatiquement le rapport Harbor.

5. **Approuver le changement.**

   L'approbateur sécurité et l'opérateur consignent la raison, le périmètre, le mode, les exclusions et la date de revue. En cas de suspicion, ils confirment l'indépendance du pool et le traitement des secrets.

   **Contrôle :** l'approbation est liée au ticket et précède l'activation.

6. **Activer `grype`.**

   Modifier la ressource protégée. Enregistrer la révision et l'audit. Si Trivy est suspect, maintenir son interdiction indépendamment du mode sélectionné.

   **Contrôle :** le chemin exécuté correspond à la décision approuvée.

7. **Contrôler le même digest.**

   Produire le SBOM avec Syft et vérifier son lien à l'image. L'analyser avec Grype, puis appliquer la politique commune. Archiver les rapports bruts et la décision.

   **Contrôle :** une erreur, un rapport absent ou un inventaire incomplet bloque la suite.

8. **Vérifier Harbor et GitOps.**

   Confirmer le digest promu, les droits Harbor et le maintien des autres contrôles. Vérifier la MR GitLab, puis la révision synchronisée par Argo CD depuis Talos/Proxmox vers `k3d-nexora`, via WireGuard.

   **Contrôle :** le digest déployé suit le circuit d'approbation prévu.

9. **Autoriser la reprise.**

   Le pilote consigne les preuves, le périmètre autorisé et les blocages résiduels. Un premier succès technique ne suffit pas si la chaîne de confiance reste incertaine.

   **Contrôle :** la reprise repose sur une décision explicite et des preuves fiables.

10. **Communiquer et mesurer.**

    Publier dans Mattermost le mode actif et l'état des déploiements, avec un lien vers le ticket. Calculer le délai de bascule à partir des horodatages.

    **Contrôle :** distinguer les durées réellement observées des objectifs proposés.

### Borner une éventuelle automatisation

Commencer par la procédure manuelle. N'activer un automatisme qu'après un exercice démontrant la bonne classification des erreurs et le maintien des contrôles.

Définir une liste fermée de causes techniques autorisées. Borner les délais et le nombre de tentatives. Conserver une trace structurée de la cause et du changement de mode.

Exclure explicitement le rejet de sécurité, la signature invalide, la perte de confiance, le SBOM invalide, le mauvais digest et toute erreur inconnue.

> **Erreurs fréquentes.** Relancer Grype après un rejet Trivy pour obtenir moins de CVE ; utiliser le même agent suspect ; retirer le scanner Harbor sans vérifier sa politique ; fusionner sans dossier de décision ; réutiliser un cache au seul motif qu'il est interne.

<a id="section-15"></a>

## 15. Runbook de retour à Trivy

Le retour à Trivy est une opération planifiée et approuvée. Le chemin Syft + Grype reste disponible et entretenu après ce retour.

### Préparer et qualifier le retour

1. **Revoir l'incident.**

   Relire les avis officiels, la cause, le périmètre et les mesures de rétablissement. Vérifier qu'aucune contrainte d'investigation ne s'oppose au retour.

   **Contrôle :** ticket mis à jour et approbation sécurité.

2. **Qualifier une version exacte.**

   Examiner tous les avis applicables à la date du retour. Fixer l'artefact candidat. Vérifier son origine, sa signature ou sa provenance, avec l'identité attendue.

   **Contrôle :** dossier d'approbation de cette version précise.

3. **Préparer un agent sain.**

   Reconstruire l'agent s'il a été exposé. Ne pas reprendre d'ancienne image ou de fichier secret sans vérification.

   **Contrôle :** révision de l'image d'agent et journal de reconstruction.

4. **Traiter les caches et les miroirs.**

   Préserver une copie d'investigation si nécessaire. Réacquérir les binaires et les bases depuis une source validée. Vérifier les miroirs avant réutilisation.

   **Contrôle :** inventaire des objets réutilisés et justification de leur confiance.

5. **Effectuer le double scan de non-régression.**

   Utiliser des images représentatives de Django/Python, Astro/Node.js et des images de base. Les deux chemins doivent être jugés fiables. Comparer le même digest avec la même politique.

   **Contrôle :** écarts de paquets, vulnérabilités et décisions qualifiés ; formats et codes de retour vérifiés.

6. **Tester le circuit complet en préproduction.**

   Vérifier Harbor, la promotion, la MR GitLab et Argo CD. Maintenir les contrôles qui ne relèvent pas des vulnérabilités.

   **Contrôle :** compte rendu de test et preuve du refus d'une image non conforme.

### Approuver, puis réactiver

7. **Faire approuver le retour.**

   La sécurité et l'exploitation acceptent le périmètre, la date et les conditions de surveillance.

   **Contrôle :** décision nominative et révision de la configuration.

8. **Réactiver la version validée.**

   Lever son interdiction, sélectionner `trivy` et surveiller le premier pipeline.

   **Contrôle :** rapport et déploiement liés au digest approuvé.

Tant que la distribution ou l'environnement Trivy reste suspect, ne pas le réactiver pour réaliser le double scan. Si la qualification échoue, conserver `grype` lorsqu'il reste fiable. Si aucun chemin fiable ne subsiste, maintenir le blocage des déploiements.

Conserver les anciennes preuves pour la traçabilité. Elles ne redeviennent pas, de ce seul fait, des décisions de sécurité actuelles.

<a id="section-16"></a>

## 16. Maintenance préparatoire, historique et Mattermost

### Entretenir le secours avant d'en avoir besoin

Les fréquences suivantes sont des **objectifs proposés à approuver**. Elles ne décrivent pas une planification déjà installée.

| Fréquence proposée | Vérifier | Conserver ou décider |
|---|---|---|
| À chaque exécution | Artefacts approuvés, base fraîche, digest exact, politique courante | Manifeste de preuves ; refus en cas d'écart |
| Chaque semaine | Avis de sécurité des scanners, outils SBOM, agents et bibliothèques de vérification | Ticket de revue ; incident si la confiance est perdue |
| Chaque mois | Versions candidates, miroirs et caches, droits des robots, accès au registre et base du secours | Qualification sur le corpus, puis approbation du nouveau verrouillage |
| Chaque trimestre | Bascule et retour en préproduction, avec Harbor, GitLab et Argo CD | Compte rendu, durées mesurées, actions correctives |
| Après un changement majeur | Scanner, SBOM, OS des images, politique, registre, agent ou intégration | Requalification ciblée ; exercice complet si la décision est affectée |

Ne pas mettre à jour automatiquement un outil de secours sans validation. Un chemin non entretenu peut devenir inutilisable à cause d'une base périmée, d'un jeton expiré ou d'un format devenu incompatible.

### Tenir l'historique des incidents et décisions

Pour chaque événement, conserver :

- l'identifiant, la source officielle et les heures UTC ;
- les responsables, versions et digests concernés ;
- la portée des secrets exposés et les liens vers les preuves ;
- les décisions de bascule et de retour, puis leur suivi.

Protéger les pièces sensibles. Dans Mattermost, publier un état synthétique et des liens autorisés.

Faire approuver une durée de rétention. Un minimum de **90 jours** pour les preuves ordinaires est proposé ici, avec gel de leur suppression pendant un incident. Adapter cette valeur aux contraintes de l'organisation.

### Préparer les notifications Mattermost

**But :** informer l'équipe sans exposer le secret de notification au scanner.

Mattermost accepte un POST HTTP avec un objet JSON contenant `text`. L'URL du webhook est un secret. Le résultat normal est une réponse HTTP 200 avec `ok`. Activer les webhooks et limiter leur portée au canal d'exploitation choisi. [Documentation officielle Mattermost](https://docs.mattermost.com/integrations-guide/incoming-webhooks).

**Où exécuter la commande :** dans le répertoire de travail du job de notification, sur la VM ou l'agent Linux sain prévu pour ce rôle. Ce job est séparé du scanner.

**Prérequis :** Bash, Python 3 et `curl`. Injecter les cinq variables requises par le script, dont `MM_WEBHOOK_URL`, uniquement dans ce job. Le message doit se limiter à l'identifiant de l'incident, au mode, à l'état et à un lien de ticket sans secret.

Le script complet `notify-mattermost.sh` figure dans l'annexe intégrée au présent document. Après l'avoir mis en place au chemin indiqué, l'appeler ainsi :

```bash
bash continuite-scan-support/scripts/notify-mattermost.sh
```

**Contrôle attendu, illustratif :** `Notification Mattermost confirmée.` Si la notification échoue, noter cet échec dans le ticket et utiliser le canal de communication de secours défini par l'équipe. Cet échec ne modifie jamais la décision de sécurité.

La syntaxe du bloc a été contrôlée avec `bash -n` le **16 octobre 2026**. Le script n'a pas été exécuté contre une instance Mattermost et aucun webhook n'a été créé.

### Fiche réflexe de bascule

Conserver cette fiche avec les contacts d'exploitation. Elle rappelle l'ordre des actions ; les runbooks précédents en précisent les contrôles.

```text
1. Ouvrir un ticket et classer : panne / rejet sécurité / perte de confiance.
2. Si suspicion : interdire Trivy AVANT bootstrap/exécution et isoler les agents.
3. Suspendre les promotions et MR sans preuve fiable ; préserver les éléments.
4. Vérifier secours sain, artefacts approuvés, accès Harbor et base fraîche.
5. Vérifier tous les autres usages Trivy et le verrou éventuel du scanner Harbor.
6. Obtenir l'approbation tracée ; sélectionner grype dans la ressource protégée.
7. Scanner le digest exact ; valider SBOM, rapport, politique et autres contrôles.
8. Promouvoir uniquement si conforme ; MR approuvée/fusionnée, puis sync Argo CD.
9. Contrôler le digest réellement déployé ; annoncer état et limites dans Mattermost.
10. Mesurer, archiver ; si aucun contrôle fiable n'existe, maintenir le blocage.
```

### Modèle de compte rendu d'exercice ou d'incident

Copier et compléter le modèle ci-dessous dans le dossier d'exploitation. Les mentions « non mesuré » et « non testé » restent en place tant qu'aucune observation ne permet de les remplacer. Le modèle et la fiche sont inclus dans ce document ; aucune annexe externe n'est nécessaire pour les retrouver.

<details>
<summary>Ouvrir le modèle complet à copier</summary>

```markdown
# Compte rendu — [identifiant]

## Contexte et responsabilités

- Nature : exercice / incident réel
- Pilote, opérateur, approbateur : [à renseigner]
- Date et fenêtre UTC : [à renseigner]
- Périmètre : laboratoire / facturadj-preprod / autre [préciser]
- Sources, avis et révisions des procédures : [liens et date]
- Versions, digests et identités des outils/agents : [preuves]
- Images testées, digests OCI et plateforme : [preuves]
- Politique, exceptions et dates d'expiration : [preuves]
- Simulation autorisée : [méthode sans artefact malveillant]

## Mesures

### Détection → décision

- Début UTC : [à renseigner]
- Fin UTC : [à renseigner]
- Durée observée : non mesuré
- Objectif proposé : à approuver
- Écart : [à renseigner]

### Décision → secours opérationnel

- Début UTC : [à renseigner]
- Fin UTC : [à renseigner]
- Durée observée : non mesuré
- Objectif proposé : à approuver
- Écart : [à renseigner]

### Pipeline complet nominal

- Début UTC : [à renseigner]
- Fin UTC : [à renseigner]
- Durée observée : non mesuré
- Objectif proposé : à approuver
- Écart : [à renseigner]

### Pipeline complet en secours

- Début UTC : [à renseigner]
- Fin UTC : [à renseigner]
- Durée observée : non mesuré
- Objectif proposé : à approuver
- Écart : [à renseigner]

### Retour qualifié à Trivy

- Début UTC : [à renseigner]
- Fin UTC : [à renseigner]
- Durée observée : non mesuré
- Objectif proposé : à approuver
- Écart : [à renseigner]

## Scénarios

### Trivy indisponible

- Attendu : secours contrôlé
- Observé : non testé
- Preuve : [lien]
- Conforme ? [à renseigner]

### Distribution suspecte

- Attendu : aucune exécution Trivy
- Observé : non testé
- Preuve : [lien]
- Conforme ? [à renseigner]

### Image non conforme

- Attendu : aucune promotion/MR de déploiement
- Observé : non testé
- Preuve : [lien]
- Conforme ? [à renseigner]

### Base ancienne / SBOM invalide

- Attendu : blocage explicite
- Observé : non testé
- Preuve : [lien]
- Conforme ? [à renseigner]

### Harbor

- Attendu : pull/promotion selon droits approuvés
- Observé : non testé
- Preuve : [lien]
- Conforme ? [à renseigner]

### GitLab

- Attendu : approbation et fusion obligatoires
- Observé : non testé
- Preuve : [lien]
- Conforme ? [à renseigner]

### Argo CD distant

- Attendu : digest approuvé, bon namespace
- Observé : non testé
- Preuve : [lien]
- Conforme ? [à renseigner]

### Aucun scanner fiable

- Attendu : déploiement bloqué
- Observé : non testé
- Preuve : [lien]
- Conforme ? [à renseigner]

### Retour à Trivy

- Attendu : qualification et approbation
- Observé : non testé
- Preuve : [lien]
- Conforme ? [à renseigner]

## Décisions et suivi

- Écarts Trivy/Grype par composant et décision : [annexe]
- Secrets potentiellement exposés : [lien restreint ; aucun secret ici]
- Blocages résiduels : [liste]
- Nettoyage et restauration de configuration : [preuves]
- Décision finale et durée de validité : [approbation]
- Actions correctives, responsable et échéance : [liste]
```

</details>

<a id="section-17"></a>

## 17. Dépannage opérationnel

Après chaque correction, produire un nouveau contrôle valide. Conserver la décision et le journal en échec. Ne pas remplacer le diagnostic par `|| true`, TLS désactivé, un tag mutable ou une décision forcée à `PASS`.

### Symptôme : Harbor répond `401` ou `403`

- **Vérifications :** confirmer l'hôte, tester `docker login` avec le secret injecté via stdin ou saisi interactivement, puis consulter les droits du robot et l'audit. Ne pas afficher le secret.
- **Interprétation :** robot expiré, mauvais projet/hôte ou credentials provenant d'un autre agent.
- **Correction :** renouveler le secret dans le gestionnaire et rétablir les seuls droits nécessaires depuis un agent sain.
- **Contrôle :** le scanner lit le digest ; l'identité des nœuds ne peut pas lire la quarantaine.

### Symptôme : certificat Harbor inconnu

- **Vérifications :** contrôler horloge, DNS et chaîne avec `openssl s_client -connect "$HARBOR_HOST:443" -servername "$HARBOR_HOST" -showcerts </dev/null`. Comparer l'empreinte à une source d'administration fiable.
- **Interprétation :** CA interne absente de l'agent ou du conteneur, chaîne incomplète ou nom incorrect.
- **Correction :** installer la CA approuvée dans chaque environnement concerné ou corriger certificat/chaîne.
- **Contrôle :** la connexion du scanner réussit avec validation active, sans `-k` ni option insecure.

### Symptôme : base Trivy ou Grype indisponible

- **Vérifications :** lire le journal de mise à jour et le manifeste approuvé ; contrôler DNS, proxy, sortie réseau, source, fraîcheur, schéma et empreintes.
- **Interprétation :** accès coupé, miroir arrêté ou base incompatible avec la version de l'outil.
- **Correction :** rétablir l'accès ou importer un snapshot approuvé compatible. Garder le blocage si sa fraîcheur reste insuffisante.
- **Contrôle :** le nouveau scan identifie la base réellement consommée et produit une décision complète.

### Symptôme : base annoncée fraîche mais refusée

- **Vérifications :** comparer UTC, `cache_dir`, `built_at` et empreintes aux fichiers réels.
- **Interprétation :** un téléchargement récent peut contenir une base ancienne ; l'horloge ou le cache peut aussi différer du manifeste.
- **Correction :** corriger l'horloge ou établir le manifeste depuis la base réellement approuvée. Ne pas changer sa date pour passer le gate.
- **Contrôle :** date sous la limite, source documentée et empreintes exactes.

### Symptôme : délai de scan dépassé

- **Vérifications :** séparer temps de pull, catalogage et analyse ; examiner CPU/mémoire, verrou de cache et code du superviseur `timeout`.
- **Interprétation :** image volumineuse, réseau lent, ressources insuffisantes, verrou ou délai mal dimensionné.
- **Correction :** corriger la cause et dimensionner à partir des mesures. Une bascule exige une cause technique autorisée.
- **Contrôle :** nouveau run borné et complet ; aucun rapport partiel utilisé comme succès.

### Symptôme : permission refusée sur le cache ou la sortie

- **Vérifications :** exécuter `id`, `df -h` et `ls -ld "$CACHE_DIR" "$RUN_DIR"` sur l'agent ; inspecter les montages.
- **Interprétation :** UID/propriétaire inadapté, volume en lecture seule ou disque plein.
- **Correction :** créer les seuls répertoires nécessaires avec le bon propriétaire. Séparer mise à jour de base et lecture scanner ; éviter `chmod 777`.
- **Contrôle :** le scanner lit la base approuvée et écrit les preuves sans accès aux secrets de déploiement.

### Symptôme : SBOM non reconnu

- **Vérifications :** contrôler type, taille, JSON parseable, version Syft et format exporté ; lire stderr Grype.
- **Interprétation :** fichier texte/compressé, export tronqué ou schéma non qualifié.
- **Correction :** conserver l'original et régénérer depuis la même image au format qualifié.
- **Contrôle :** Grype accepte l'inventaire, les composants attendus sont présents et le digest concorde.

### Symptôme : aucune vulnérabilité alors que le résultat surprend

- **Vérifications :** comparer le profil au catalogue : paquets, métadonnées OS, purl, versions et catalogers ; examiner les erreurs et filtres.
- **Interprétation :** inventaire vide/incomplet, écosystème absent ou distribution inconnue peut masquer la couverture attendue.
- **Correction :** corriger le catalogue/profil dans le périmètre qualifié et faire examiner l'écart.
- **Contrôle :** inventaire exploitable et limites explicites. Le nombre zéro seul n'autorise pas le déploiement.

### Symptôme : Trivy et Grype affichent des totaux différents

- **Vérifications :** comparer `(écosystème, paquet, version, identifiant, source)`, périmètre et exclusions.
- **Interprétation :** sources/alias, versions normalisées, avis fournisseur, date de base ou doublons diffèrent.
- **Correction :** qualifier les écarts qui changent la décision ; corriger la configuration ou documenter une limite approuvée.
- **Contrôle :** décisions cohérentes ou divergence justifiée, sans choisir le résultat favorable pour contourner un rejet.

### Symptôme : Harbor exécute encore Trivy après bascule CI

- **Vérifications :** inventorier scanners de projet/système, déclencheurs sur push, planifications et files ; contrôler versions et agents.
- **Interprétation :** le mode CI ne gouverne pas le service de scan intégré Harbor.
- **Correction :** suspendre les invocations suspectes avant exécution ; utiliser un adaptateur qualifié ou garder le blocage.
- **Contrôle :** aucune invocation résiduelle ; test d'image de laboratoire et restrictions de pull conformes.

### Symptôme : `PASS` en CI, mais Harbor refuse le pull

- **Vérifications :** comparer digest, scanner intégré, état/âge de son rapport, allowlist et seuil du projet.
- **Interprétation :** politique Harbor différente ou rapport intégré absent ; le résultat CI n'est pas automatiquement celui du registre.
- **Correction :** rendre les politiques cohérentes et terminer un scan intégré fiable, sans élargir les seuils sous pression.
- **Contrôle :** preuve CI valide et pull réel attendu depuis le VPS.

### Symptôme : une MR peut fusionner sans approbation

- **Vérifications :** relever édition GitLab, règles effectives, droits de push et identité de test ; tenter une fusion sans approbation.
- **Interprétation :** fonctionnalité indisponible, règle optionnelle, accès direct ou règle superposée plus permissive.
- **Correction :** configurer protections/approbations obligatoires compatibles ou qualifier un service de fusion indépendant.
- **Contrôle :** fusion refusée sans approbation ; nouveau commit soumis à la revue prévue par la politique.

### Symptôme : Argo ne joint pas le VPS

- **Vérifications :** comparer accès du poste et du contrôleur, état du cluster Argo et logs ; utiliser `wg show` sur les pairs administrés sans exporter les clés.
- **Interprétation :** endpoint localhost, port API k3d non publié, route WireGuard/retour, DNS ou pare-feu incorrect.
- **Correction :** publier l'API sur l'interface/port approuvés et corriger les routes et ACL minimales.
- **Contrôle :** le contrôleur joint l'API et synchronise réellement le seul namespace prévu.

### Symptôme : Argo refuse TLS ou une opération Kubernetes

- **Vérifications :** lire l'erreur, examiner destination et CA ; tester `kubectl auth can-i` avec l'identité Argo et un kubeconfig restreint.
- **Interprétation :** SAN manquant pour l'URL WireGuard, mauvaise CA, token expiré, RBAC ou AppProject insuffisant.
- **Correction :** corriger certificat/CA ou le droit minimal ; renouveler l'identité sans copier le kubeconfig administrateur.
- **Contrôle :** ressources autorisées accessibles et accès hors namespace refusé.

### Symptôme : Argo revient à l'ancienne image après un export

- **Vérifications :** comparer commits d'export, MR, arborescence des manifests et révision suivie par Argo.
- **Interprétation :** l'export sélectif écrase la surcharge GitLab ou Argo suit une autre référence.
- **Correction :** fixer la propriété des fichiers ou faire passer l'export par MR ; restaurer le digest approuvé dans Git.
- **Contrôle :** deux exports successifs préservent la promotion et Argo suit le commit fusionné prévu.

### Symptôme : une image suspecte tourne malgré le blocage Harbor

- **Vérifications :** inventorier images/imageID des workloads, nœuds et révisions ; les rapprocher des digests révoqués.
- **Interprétation :** un pod existant ou une image en cache peut continuer à fonctionner ; le blocage des pulls ne remplace pas une réponse à incident.
- **Correction :** décider du confinement/remplacement, reconstruire depuis une source saine et promouvoir le nouveau digest.
- **Contrôle :** digest sain observé et scans réévalués. Le seul statut Harbor ne prouve pas la remédiation du cluster.

<a id="section-18"></a>

## 18. Exercices avec correction

Ces situations vérifient les décisions importantes. Cherchez d'abord votre réponse, puis ouvrez la correction.

### 1. Grype est conforme, mais Harbor utilise encore un Trivy suspect

**Peut-on conserver le scan sur push actif dans Harbor ?**

<details>
<summary>Voir la correction</summary>

Non. Empêcher l'exécution suspecte avant tout lancement, même si le résultat CI est conforme. Un JSON Grype produit en CI n'implémente pas l'API d'adaptateur Harbor. Remplacer ce chemin par une intégration préqualifiée ou maintenir le blocage. La quarantaine ne justifie pas l'exécution d'un outil interdit.

</details>

### 2. Trivy rejette un paquet Python, Grype ne trouve rien

**Le pipeline peut-il choisir le résultat Grype pour livrer ?**

<details>
<summary>Voir la correction</summary>

Non. Le mode est approuvé avant l'analyse ; un rejet n'est pas une panne. Si les deux outils restent fiables, comparer paquet, version, avis, source et base pendant une qualification distincte. Corriger l'image ou instruire une exception précise et limitée dans le temps.

</details>

### 3. Une MR est fusionnée deux jours après son approbation

**Son rapport, valable 24 h, suffit-il encore ?**

<details>
<summary>Voir la correction</summary>

Non. Réexaminer le digest avec une base assez récente, produire de nouvelles preuves et refaire les approbations requises. Le SBOM peut encore décrire le même colis, mais les alertes ont évolué. Un contrôle de fraîcheur doit protéger la fusion et la promotion.

</details>

### 4. Le VPS répond depuis le poste administrateur, mais Argo échoue

**Quel chemin réseau faut-il vérifier ?**

<details>
<summary>Voir la correction</summary>

Celui du contrôleur Argo sur Talos : endpoint API distant, routes depuis ses pods, retour réseau, WireGuard, port exposé, DNS et certificats. Un accès depuis le poste ne prouve pas cet accès. Conserver la destination VPS et la vérification TLS.

</details>

### 5. Après promotion, le digest change mais les couches semblent identiques

**Peut-on réutiliser l'ancienne autorisation ?**

<details>
<summary>Voir la correction</summary>

Pas automatiquement. Examiner la conversion éventuelle du manifeste, établir le digest final et requalifier les preuves sur ce sujet avant la MR. Une ressemblance des fichiers n'établit pas le lien cryptographique demandé.

</details>

### 6. Harbor refuse les nouveaux pulls, mais un pod continue à fonctionner

**Cela prouve-t-il une panne du contrôle ?**

<details>
<summary>Voir la correction</summary>

Non. Une restriction de téléchargement n'arrête pas un conteneur déjà démarré et ne supprime pas son image locale. Examiner l'`imageID` du pod, puis décider remplacement ou confinement. Compléter ce contrôle par l'admission et la réévaluation des digests déployés.

</details>

<a id="section-19"></a>

## 19. Glossaire et critères de recette

### Retrouver un terme

| Terme | Sens pratique |
|---|---|
| SBOM | Inventaire des composants observés, avec l'image source et la méthode de collecte |
| OCI | *Open Container Initiative* : standards des images et des registres |
| Digest | Empreinte d'un objet ; index, manifeste enfant, configuration et archive sont des objets distincts |
| CVE / GHSA | Identifiants d'avis de sécurité ; conserver les identifiants et leurs alias |
| CPE | *Common Platform Enumeration* : identification de produits, parfois ambiguë |
| PURL | *Package URL* : identification structurée d'un paquet et de son écosystème |
| SPDX / CycloneDX | Formats de nomenclature ; conserver la version précise du format |
| SARIF | Format d'échange de résultats d'analyse, *Static Analysis Results Interchange Format* |
| JSON / YAML | Formats structurés ; un document valide n'est pas forcément complet ou authentique |
| CLI / API | Interface en ligne de commande / interface de programmation |
| TLS / CA / SAN | Transport sécurisé / autorité de certification / noms et adresses admis par un certificat |
| OIDC | *OpenID Connect* : protocole d'identité utilisé notamment par les signatures Sigstore éphémères |
| CI / CD | Intégration continue / livraison ou déploiement continu |
| GitOps / MR | Réconciliation depuis Git / proposition de fusion soumise à revue |
| VPS / RBAC | Serveur privé virtuel / contrôle d'accès par rôles |
| SLSA / provenance | Cadre *Supply-chain Levels for Software Artifacts* / informations vérifiables sur la fabrication |
| VEX / EOL | Déclaration d'applicabilité d'une vulnérabilité / fin de support |
| RTO | Objectif de délai de rétablissement ; à distinguer du temps observé |
| RACI | Répartition opérateur, responsable de décision, personnes consultées et informées |

### Déclarer le secours prêt : preuves de recette

La recette consiste à **démontrer le fonctionnement sur votre installation**. Cocher chaque point seulement après collecte de la preuve correspondante.

- [ ] **Outils disponibles** : versions, origines et empreintes approuvées ; artefacts déjà présents sur un pool sain.
- [ ] **Images représentatives** : parcours Linux exécuté sur les digests réels Django/Python, Astro/Node.js et images de base ; formats et codes natifs observés conservés.
- [ ] **Couverture qualifiée** : comparaison par paquet, version, avis et source ; écarts expliqués ou limites compensées et approuvées.
- [ ] **Contrôles maintenus** : secrets, configurations et licences couverts ; aucun usage actif ou bloquant de Trivy oublié.
- [ ] **Refus démontrés** : rejet, erreur, perte de confiance, base ancienne, SBOM invalide et secours absent n'autorisent aucune promotion.
- [ ] **Harbor vérifié** : quarantaine inaccessible aux nœuds, promotion contrôlée, comportement des pulls et du scanner intégré effectivement testé.
- [ ] **GitLab protégé** : fusion impossible sans approbation et preuves actuelles ; export sélectif sans écrasement ni contournement.
- [ ] **Argo distant testé** : contrôleur Talos → API VPS par WireGuard ; namespace et digest attendus réellement observés dans `k3d-nexora`.
- [ ] **Bascule et retour exécutés** : temps mesurés, compte rendu approuvé, nettoyage vérifié et actions restantes attribuées.

**État de cette livraison : documentation et implémentation de référence préparées.** Les tests unitaires locaux n'établissent pas une qualification en préproduction ou en production.

<a id="section-20"></a>

## 20. Références d'intégration et limites de validation

Consultation documentaire : **16 octobre 2026**. Les liens `main`, `stable` et Microsoft/GitLab en ligne décrivent une documentation évolutive ; ils ne fixent pas la version installée. Avant activation, relever les versions réelles, ouvrir la documentation de chaque release et conserver l'extrait ou le commit de documentation utilisé. Les observations opérationnelles des scénarios restent **à réaliser**.

| Référence officielle | Usage dans ce chapitre |
|---|---|
| [Harbor : vulnérabilité et scanners](https://goharbor.io/docs/main/administration/vulnerability-scanning/) | Distinction scanner intégré / résultat CI |
| [Harbor : configuration d'un projet](https://goharbor.io/docs/main/working-with-projects/project-configuration/) | Scan sur push et seuil de restriction des pulls |
| [Harbor : deployment security](https://goharbor.io/docs/main/administration/vulnerability-scanning/deployment-security/) | Restriction de pull et index multiplateforme |
| [Harbor : spécification des adaptateurs](https://github.com/goharbor/pluggable-scanner-spec) | Contrat de l'intégration d'un scanner |
| [Harbor : robots de projet](https://goharbor.io/docs/main/working-with-projects/project-configuration/create-robot-accounts/) | Identités à portée limitée |
| [Azure : checks et approbations](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/approvals?view=azure-devops) | Protection des ressources hors YAML |
| [Azure : templates de sécurité](https://learn.microsoft.com/en-us/azure/devops/pipelines/security/templates?view=azure-devops) | `extends` et required template |
| [Azure : variables et paramètres](https://learn.microsoft.com/en-us/azure/devops/pipelines/security/inputs?view=azure-devops) | Limitation des modifications et de la mise en file |
| [GitLab : branches protégées](https://docs.gitlab.com/user/project/repository/branches/protected/) | Interdiction de push direct et fusion contrôlée |
| [GitLab : règles d'approbation](https://docs.gitlab.com/user/project/merge_requests/approvals/rules/) | Capacité d'approbation selon édition |
| [Argo : configuration déclarative](https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/) | Clusters externes, TLS, scope namespace |
| [Argo : projets](https://argo-cd.readthedocs.io/en/stable/user-guide/projects/) | Dépôts et destinations autorisés |
| [Argo : ajout de cluster](https://argo-cd.readthedocs.io/en/stable/user-guide/commands/argocd_cluster_add/) | Paramètres à vérifier sur la version réelle |
| [Argo : démarrage officiel](https://github.com/argoproj/argo-cd/blob/master/docs/getting_started.md) | Effet des privilèges par défaut d'enregistrement |
| [Argo : synchronisation automatique](https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/) | Réconciliation après fusion et restauration GitOps |
| [WireGuard : quick start](https://www.wireguard.com/quickstart/) | Transport, routage et diagnostic |
| [Kubernetes : images](https://kubernetes.io/docs/concepts/containers/images/) | Digests, pull et effets des caches |

<a id="section-21"></a>

## 21. Références et suivi documentaire

**Référence technique de cette édition : 16 octobre 2026.** La révision du 22 octobre améliore la présentation ; elle ne met pas automatiquement à jour les candidats ni leur qualification. Les liens tagués fixent les formats et les codes examinés. Les liens `latest`, `main` ou `stable` sont évolutifs : vérifier leur adéquation à vos versions avant activation.

### Sources de départ et incidents

| Source | Utilité et limite |
|---|---|
| [Stéphane Robert — scanner les images](https://blog.stephane-robert.info/docs/conteneurs/orchestrateurs/kubernetes/securiser/image-scanning/) | Introduction pédagogique ; ses chiffres d'exemple ne sont pas des mesures de FacturaDJ |
| [Guide SBOM fourni](https://devsecops-portfolio.netlify.app/guides/security/sbom/) | Consultation tentée le 16 octobre, contenu non accessible à l'outil de recherche ; aucune affirmation attribuée à ce texte |
| [Annonce Trivy #10425](https://github.com/aquasecurity/trivy/discussions/10425) | Annonce du 20 mars sur les événements du 19 ; compléter par l'avis et le bilan |
| [Avis GHSA-69fq-xp46-6x23](https://github.com/aquasecurity/trivy/security/advisories/GHSA-69fq-xp46-6x23) | Périmètre historique et indicateurs ; consulter sa révision actuelle |
| [Bilan #10462](https://github.com/aquasecurity/trivy/discussions/10462) et [Aqua — investigation et remédiation](https://www.aquasec.com/blog/trivy-supply-chain-attack-what-you-need-to-know/) | Chronologie, exposition des secrets et réponse à incident |

### Versions, preuves et intégrations

| Source | Utilité et limite |
|---|---|
| [Trivy 0.76.0](https://github.com/aquasecurity/trivy/releases/tag/v0.76.0), [Syft 1.54.1](https://github.com/anchore/syft/releases/tag/v1.54.1), [Grype 0.120.1](https://github.com/anchore/grype/releases/tag/v0.120.1) | Candidats documentaires fixés pour une qualification Linux |
| [Avis Trivy](https://github.com/aquasecurity/trivy/security/advisories), [avis Syft](https://github.com/anchore/syft/security/advisories), [avis Grype](https://github.com/anchore/grype/security/advisories) | Revue avant réutilisation ; la présence d'une release ne garantit pas l'absence d'avis |
| [Trivy — documentation](https://trivy.dev/latest/docs/) et [Anchore OSS](https://oss.anchore.com/docs/) | Couverture, formats et bases ; vérifier le code tagué en cas de divergence |
| [Cosign — vérification](https://docs.sigstore.dev/cosign/verifying/verify/) et [SLSA — provenance](https://slsa.dev/spec/v1.1/provenance) | Identité, sujet et fabrication ; une preuve n'établit pas l'innocuité |
| [Azure — checks](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/approvals?view=azure-devops), [Harbor](https://goharbor.io/docs/), [GitLab — approbations](https://docs.gitlab.com/user/project/merge_requests/approvals/), [Argo CD](https://argo-cd.readthedocs.io/en/stable/) | Capacités à confronter à la version, à l'édition et aux réglages réels |

Les références précises restent placées près des procédures concernées. Les politiques et seuils proposés par ce guide ne sont pas des politiques attribuées aux éditeurs.

<details>
<summary>Revue ciblée des avis Trivy de juin 2026</summary>

La revue initiale a examiné les avis suivants :

| Avis | Correctif indiqué |
|---|---|
| [Traversée de chemins](https://github.com/aquasecurity/trivy/security/advisories/GHSA-mcj4-mphf-j9ff) | `0.71.1` |
| [Plugins](https://github.com/aquasecurity/trivy/security/advisories/GHSA-8rc5-4fr6-64pw) | `0.72.0` |
| [Helm](https://github.com/aquasecurity/trivy/security/advisories/GHSA-q3fv-x8vg-qqm4) | `0.71.0` |

Le candidat `0.76.0` se situe au-delà de ces correctifs. Cette vérification ciblée ne remplace pas une revue complète des avis et du périmètre avant activation.

</details>

<a id="integration-starlight"></a>

### Intégration du fichier dans votre site Starlight

1. Copier **ce seul fichier `.md`** à l'emplacement de la page existante, dans le dossier de contenu déjà utilisé par votre site. Conserver son chemin pour garder l'URL de la page.
2. Le front matter fournit le titre, la description et un sommaire limité aux grands chapitres. Aucun import MDX, image externe, composant personnalisé ou plugin Mermaid n'est nécessaire.
3. Lancer la commande de build habituelle du projet sur la VM. Vérifier ensuite le sommaire, les liens d'ancres, les tableaux et les volets dépliables.
4. Contrôler une largeur téléphone et une largeur ordinateur, en thèmes clair et sombre. Les vues utilisent le texte et les couleurs du site ; elles ne dépendent pas d'une palette d'image imposée.

L'original ne contenait pas de front matter. Les ancres explicites `section-01` à `section-22` sont conservées. Si votre copie distante possède des champs supplémentaires, les garder lors du remplacement du contenu.

La syntaxe utilisée est documentée par Starlight : [écriture en Markdown](https://starlight.astro.build/guides/authoring-content/) et [référence du front matter](https://starlight.astro.build/reference/frontmatter/), consultées le **22 octobre 2026**. Cette vérification documentaire ne remplace pas le build de votre projet distant.

### Bilan de la révision pédagogique

- Les cinq diagrammes Mermaid sont remplacés par des étapes et des tableaux directement lisibles.
- Les parcours découverte, pratique et exploitation pointent vers les chapitres utiles.
- Les procédures relient objectif, paramètres, commande et vérification ; les pièges restent placés près de l'action.
- Les matrices sont découpées et le dépannage se lit symptôme par symptôme.
- Les scripts, configurations et tests complets sont inclus dans des annexes dépliables ; les exercices proposent une correction à ouvrir.
- Les commandes et les références techniques utiles sont conservées. Les contrôles de cette révision sont indiqués dans l'annexe ; aucun scan réel ou test d'infrastructure supplémentaire n'est revendiqué.

<a id="section-22"></a>

## 22. Annexes — scripts et configurations complets

**Cette annexe contient tous les fichiers nécessaires aux exemples du guide.** Rien n'est à récupérer dans un autre paquet de documentation. Ouvrir le volet du fichier utile, puis copier son bloc complet à l'emplacement indiqué sur la VM de travail.

### Reconstituer les fichiers sur la VM de travail

Dans un répertoire de laboratoire sain, créer l'arborescence :

```bash
mkdir -p continuite-scan-support/{scripts,config,pipelines,tests}
```

Enregistrer les blocs en **UTF-8 sans BOM, fins de ligne LF**. La commande `bash scripts/nom.sh` n'exige pas de bit exécutable. Les scripts Python du contrôle utilisent la bibliothèque standard ; Python **3.11 ou plus** est requis. Les outils externes propres à l'installation, au registre et à GitOps restent ceux des prérequis de chaque chapitre.

Choisir le profil d'exemple correspondant à l'image finale puis créer `config/profile.json`. Par exemple, pour le backend :

```bash
cp continuite-scan-support/config/profile-django.example.json \
  continuite-scan-support/config/profile.json
```

Qualifier ensuite les valeurs, notamment les distributions et versions réellement observées. En exploitation, les configurations approuvées sont provisionnées hors du checkout applicatif. Les exemples `A_RENSEIGNER`, `NOT_RUN`, autorisations fausses et listes vides bloquent une autorisation prématurée : ne pas les remplacer par un succès fictif.

### Retrouver le bon fichier

| Fichier à ouvrir | Utilité |
|---|---|
| [gate.py](#fichier-gate-py) | Contrôler les preuves, scanner et appliquer la politique commune |
| [gitops-mr.py](#fichier-gitops-mr-py) | Créer une proposition GitLab sans la fusionner |
| [install-tools.sh](#fichier-install-tools-sh) | Installer les candidats versionnés avec vérification de signature |
| [notify-mattermost.sh](#fichier-notify-mattermost-sh) | Notifier depuis un job séparé du scanner |
| [prepare-bases.sh](#fichier-prepare-bases-sh) | Préparer les bases et leurs snapshots candidats sur poste sain |
| [probe-native-exits.py](#fichier-probe-native-exits-py) | Mesurer les codes natifs en laboratoire |
| [promote.sh](#fichier-promote-sh) | Copier le digest conforme vers le projet Harbor autorisé |
| [scan-containers.sh](#fichier-scan-containers-sh) | Réaliser le parcours pédagogique en conteneurs isolés |
| [scan.sh](#fichier-scan-sh) | Lancer le contrôle commun depuis Bash |
| [snapshot-db.py](#fichier-snapshot-db-py) | Calculer les empreintes du contenu de la base |
| [controls.example.json](#fichier-controls-example-json) | Décrire les résultats réels des contrôles annexes |
| [exceptions.json](#fichier-exceptions-json) | Définir le catalogue d’exceptions, vide par défaut |
| [policy.json](#fichier-policy-json) | Fixer les seuils et les durées proposés |
| [profile-astro.example.json](#fichier-profile-astro-example-json) | Calibrer la couverture attendue d’une image frontend |
| [profile-django.example.json](#fichier-profile-django-example-json) | Calibrer la couverture attendue d’une image backend |
| [tools.lock.json](#fichier-tools-lock-json) | Fixer les versions, chemins et empreintes approuvées |
| [trust.json](#fichier-trust-json) | Exprimer l’autorisation protégée des outils et de l’agent |
| [azure-pipelines.scan.example.yml](#fichier-azure-pipelines-scan-example-yml) | Scanner puis revalider un candidat déjà construit |
| [test_gate.py](#fichier-test-gate-py) | Vérifier le contrat local sur 25 cas simulés |

### Vérifier la logique sans contacter l'infrastructure

Après avoir recréé les scripts, les configurations d'exemple et le fichier de tests :

```bash
python3 -m unittest discover -s continuite-scan-support/tests -v
```

**Attendu : 25 tests réussis.** Ils simulent les outils et utilisent des données synthétiques ; aucun véritable scanner, registre, compte GitLab ou cluster n'est contacté. Ils vérifient les refus et les décisions du wrapper, sans mesurer la qualité de détection ni la sécurité de l'installation réelle.

### Résumé des vérifications de cette révision

Contrôles de la révision du **22 octobre 2026** :

| Vérification | Résultat et limite |
|---|---|
| Navigation et références | 22 ancres de chapitres conservées ; liens internes résolus et 76 liens techniques initiaux conservés |
| Autonomie du fichier | 19 fichiers complets extraits de cette annexe et comparés aux sources ; aucun diagramme Mermaid ni image à charger |
| Syntaxe | Front matter, Python, JSON et YAML vérifiés ; 52 blocs Bash contrôlés avec `bash -n`, sans exécuter leurs opérations |
| Contrat de décision | **25 tests réussis après extraction depuis le Markdown** ; scanners simulés, aucun accès à l'infrastructure |
| Présentation locale | Aperçu HTML générique contrôlé à 1 280 px et 390 px, en clair et sombre ; volets ouvrables et aucun débordement horizontal de la page |
| Projet distant et scans réels | **Non exécutés** : cet aperçu ne compile pas votre Starlight et ne qualifie pas les outils Linux ou FacturaDJ |

Les tableaux ont au plus trois colonnes. Les longs blocs de code gardent leur défilement propre ; leur contenu reste intégral. La [vérification sur la VM](#integration-starlight) demeure nécessaire avant publication.

### Fichiers complets

<a id="fichier-gate-py"></a>

<details>
<summary><strong>DETAILS DES FICHIERS</strong></summary>
<details>
<summary><strong>gate.py</strong> — Contrôler les preuves, scanner et appliquer la politique commune</summary>

**Chemin à créer :** `continuite-scan-support/scripts/gate.py`

```python
#!/usr/bin/env python3
"""Contrôle bloquant de référence, Python >=3.11, bibliothèque standard seulement.
Codes du contrat local : 0 PASS, 10 REJECT, 20 ERROR, 30 UNTRUSTED.
L'authenticité des configurations dépend de leur provisionnement protégé.
"""
import argparse
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile

NOW = lambda: datetime.now(timezone.utc)
CODES = {"PASS": 0, "REJECT": 10, "ERROR": 20, "UNTRUSTED": 30}
VERSIONS = {"trivy": "0.76.0", "syft": "1.54.1", "grype": "0.120.1"}
HEX = re.compile(r"^[0-9a-f]{64}$")
IMAGE = re.compile(r"^[a-z0-9][a-z0-9./:_-]*@sha256:[0-9a-f]{64}$")


class GateError(Exception):
    def __init__(self, message, status="ERROR"):
        super().__init__(message)
        self.status = status


def need(condition, message, status="ERROR"):
    if not condition:
        raise GateError(message, status)


def read(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def write(path, value):
    Path(path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def sha(path):
    h = hashlib.sha256()
    with Path(path).open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def stamp(value):
    dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    need(dt.tzinfo is not None, "Horodatage sans fuseau")
    return dt.astimezone(timezone.utc)


def fresh(value, hours, label):
    age = (NOW() - stamp(value)).total_seconds()
    need(-300 <= age <= float(hours) * 3600, f"{label} périmé ou horloge incohérente")


def trust_check(trust, mode):
    need(trust.get("environment_trusted") is True, "Environnement non fiable", "UNTRUSTED")
    need(trust.get(mode + "_allowed") is True, f"{mode} interdit avant exécution", "UNTRUSTED")
    need(all(trust.get(k) for k in ("decision_id", "approved_by", "approved_at", "expires_at")),
         "Décision de confiance incomplète", "UNTRUSTED")
    need(stamp(trust["approved_at"]) <= NOW() < stamp(trust["expires_at"]),
         "Décision de confiance expirée ou future", "UNTRUSTED")


def db_check(db, mode, policy):
    need(db.get("mode") == mode, "Snapshot de base pour un autre scanner")
    fresh(db["built_at"], policy["max_db_age_hours"], "Base")
    need(db.get("source") and db.get("files"), "Provenance ou fichiers de base absents")
    root = Path(db["cache_dir"]).resolve(strict=True)
    need(root.is_dir(), "Cache de base absent")
    declared = {Path(x["path"]).resolve() for x in db["files"]}
    actual = {p.resolve() for p in root.rglob("*.db")}
    need(actual and actual.issubset(declared), "Un fichier DB réel manque au snapshot")
    for item in db["files"]:
        p = Path(item["path"]).resolve(strict=True)
        need(p.is_relative_to(root), "Fichier DB hors cache approuvé")
        need(HEX.fullmatch(item["sha256"]) and sha(p) == item["sha256"], "Base modifiée depuis qualification")
    # Les snapshots doivent couvrir tous les fichiers DB, pas seulement leur metadata.
    need(any(Path(x["path"]).suffix == ".db" for x in db["files"]), "Fichier .db absent du snapshot")
    if mode == "trivy":
        metadata = root / "db" / "metadata.json"
        need(metadata.resolve() in declared, "Metadata Trivy non couverte par empreinte")
        need(stamp(read(metadata)["UpdatedAt"]) == stamp(db["built_at"]), "Date réelle Trivy différente du snapshot")


def tool_check(lock, name):
    tool = lock["tools"][name]
    need(tool.get("version") == VERSIONS[name], f"Version {name} non qualifiée", "UNTRUSTED")
    path = Path(tool["path"])
    need(path.is_absolute() and path.is_file(), f"Binaire {name} absent", "UNTRUSTED")
    need(HEX.fullmatch(tool["sha256"]) and sha(path) == tool["sha256"],
         f"Empreinte {name} non approuvée", "UNTRUSTED")
    return str(path.resolve())


def invoke(argv, cwd, env, out, label, timeout):
    try:
        p = subprocess.run(argv, cwd=cwd, env=env, text=True, encoding="utf-8",
                           errors="replace", capture_output=True, timeout=timeout, check=False)
    except subprocess.TimeoutExpired as e:
        raise GateError(f"Délai dépassé : {label}") from e
    # Pas de journalisation de argv ni des variables d'environnement : elles peuvent contenir des secrets.
    with (out / "scan.log").open("a", encoding="utf-8") as f:
        f.write(f"[{label}] returncode={p.returncode}\n{p.stderr}\n")
    need(p.returncode == 0, f"Erreur native {label} ({p.returncode}) ; aucun secours implicite")
    return p.stdout


def controls_check(controls, image, policy):
    need(controls.get("image_ref") == image, "Contrôles annexes associés à une autre image")
    need(controls.get("build_id") and controls.get("source_commit"), "Lien build/commit absent")
    fresh(controls["checked_at"], policy["max_report_age_hours"], "Contrôles annexes")
    for name in ("secrets", "misconfig", "licenses"):
        item = controls.get(name, {})
        need(item.get("status") == "PASS" and item.get("evidence_uri") and item.get("control_version"),
             f"Contrôle {name} absent, non conforme ou sans preuve")


def inventory_check(packages, os_id, os_version, profile):
    need(packages and len(packages) >= int(profile["min_packages"]), "Inventaire vide ou insuffisant")
    need(os_id in profile["os_ids"], "Distribution absente ou hors profil qualifié")
    need(os_version and os_version in profile["os_versions"].get(os_id, []),
         "Version de distribution absente ou hors profil qualifié")
    kinds = Counter(x["type"] for x in packages)
    for kind in profile["required_types"]:
        need(kinds[kind] > 0, f"Écosystème obligatoire absent : {kind}")
    names = {x["name"].lower() for x in packages}
    for name in profile["required_packages"]:
        need(name.lower() in names, f"Composant témoin absent : {name}")
    need(all(x["name"] and x["version"] for x in packages), "Composant sans nom ou version")


def sbom_check(sbom, image, profile):
    source = sbom.get("source", {})
    need(source.get("type") == "image", "SBOM ne décrivant pas une image")
    need(source.get("metadata", {}).get("manifestDigest") == image.split("@", 1)[1],
         "Digest SBOM différent du manifeste demandé (utiliser un manifeste mono-plateforme)")
    packages = [{"name": p.get("name", ""), "version": p.get("version", ""),
                 "type": p.get("type", ""), "purl": p.get("purl", "")} for p in sbom.get("artifacts", [])]
    inventory_check(packages, sbom.get("distro", {}).get("id"), sbom.get("distro", {}).get("versionID"), profile)
    return packages


def normalize_trivy(report, image, profile):
    need(report.get("SchemaVersion") == 2, "Schéma Trivy inattendu")
    meta = report.get("Metadata", {})
    need(image in meta.get("RepoDigests", []), "Référence image absente du rapport Trivy")
    results = report.get("Results")
    need(isinstance(results, list) and results, "Résultats Trivy absents")
    mapping = {"debian": "deb", "ubuntu": "deb", "alpine": "apk", "redhat": "rpm",
               "python-pkg": "python", "node-pkg": "npm", "npm": "npm"}
    packages, findings = [], []
    for r in results:
        need(not r.get("IgnoredVulnerabilities"), "Vulnérabilités masquées en amont")
        need(not r.get("ExperimentalModifiedFindings"), "Résultats Trivy modifiés : qualification manuelle requise")
        for p in r.get("Packages", []):
            packages.append({"name": p.get("Name", ""), "version": p.get("Version", ""),
                             "type": mapping.get(r.get("Type"), r.get("Type", "")),
                             "purl": p.get("Identifier", {}).get("PURL", "")})
        for v in r.get("Vulnerabilities", []):
            findings.append({"package": v.get("PkgName", ""), "version": v.get("InstalledVersion", ""),
                             "id": v.get("VulnerabilityID", ""), "severity": v.get("Severity", "Unknown").title(),
                             "namespace": v.get("DataSource", {}).get("ID", r.get("Type", "")),
                             "fixed": v.get("FixedVersion", ""), "purl": v.get("PkgIdentifier", {}).get("PURL", ""),
                             "source": v.get("PrimaryURL", "")})
    inventory_check(packages, meta.get("OS", {}).get("Family"), meta.get("OS", {}).get("Name"), profile)
    return packages, findings


def normalize_grype(report, image, packages, db, sbom_path):
    need(isinstance(report.get("matches"), list), "Rapport Grype incomplet")
    need(not report.get("ignoredMatches"), "Résultats Grype ignorés : qualification manuelle nécessaire")
    source = report.get("source", {})
    if source.get("type") == "image":
        need(isinstance(source.get("target"), dict) and source["target"].get("manifestDigest") == image.split("@", 1)[1],
             "Digest source du rapport Grype différent")
    elif source.get("type") == "sbom-file":
        need(isinstance(source.get("target"), str) and Path(source["target"]).resolve() == Path(sbom_path).resolve(),
             "Rapport Grype lié à un autre fichier SBOM")
    else:
        raise GateError("Type de source Grype hors contrat")
    status = report.get("descriptor", {}).get("db", {}).get("status", {})
    need(status.get("built") and stamp(status["built"]) == stamp(db["built_at"]),
         "Base réelle du scan différente du snapshot")
    known = {(p["name"], p["version"]) for p in packages}
    findings = []
    for m in report["matches"]:
        p, v = m["artifact"], m["vulnerability"]
        need((p["name"], p["version"]) in known, "Match hors inventaire SBOM")
        findings.append({"package": p["name"], "version": p["version"], "id": v["id"],
                         "severity": v.get("severity", "Unknown").title(), "namespace": v.get("namespace", ""),
                         "fixed": ",".join(v.get("fix", {}).get("versions", [])),
                         "purl": p.get("purl", ""), "source": v.get("dataSource", "")})
    return findings


def evaluate(findings, image, policy, exceptions):
    blocked, accepted = [], []
    for item in exceptions:
        required = ("image_digest", "package", "version", "id", "namespace", "issue", "owner",
                    "approved_by", "reason", "approved_at", "expires_at")
        need(all(item.get(k) for k in required), "Exception non documentée")
        duration = (stamp(item["expires_at"]) - stamp(item["approved_at"])).total_seconds()
        need(0 < duration <= policy["max_exception_days"] * 86400, "Durée d'exception excessive")
    for f in findings:
        need(all(f.get(k) for k in ("package", "version", "id", "namespace")), "Résultat non exploitable")
        severity = f["severity"]
        unknown = severity not in ("Negligible", "Low", "Medium", "High", "Critical")
        reject = severity in policy["block_severities"] or (unknown and policy["reject_unknown_severity"])
        if not reject:
            continue
        valid = [e for e in exceptions if e["image_digest"] == image.split("@", 1)[1]
                 and all(e[k] == f[k] for k in ("package", "version", "id", "namespace"))
                 and stamp(e["approved_at"]) <= NOW() < stamp(e["expires_at"])]
        if valid:
            accepted.append({"finding": f, "exception": valid[0]})
        else:
            blocked.append(f)  # Absence de correctif ne retire pas un blocage.
    return blocked, accepted


def scan(args):
    out = Path(args.out).resolve()
    out.mkdir(parents=True, exist_ok=False)  # Aucune réutilisation de preuves d'un précédent run.
    decision = {"schema": 1, "image_ref": args.image, "mode": args.mode,
                "started_at": NOW().isoformat(), "status": "ERROR"}
    try:
        need(IMAGE.fullmatch(args.image), "Une référence registre@sha256 réelle est obligatoire")
        policy, trust, lock, db = map(read, (args.policy, args.trust, args.tools, args.db))
        trust_check(trust, args.mode)  # Avant hash/version/exécution de l'outil.
        db_check(db, args.mode, policy)
        controls, profile, exceptions = map(read, (args.controls, args.profile, args.exceptions))
        controls_check(controls, args.image, policy)
        bins = {name: tool_check(lock, name) for name in (["trivy"] if args.mode == "trivy" else ["syft", "grype"])}
        for label in ("policy", "trust", "tools", "db", "controls", "profile", "exceptions"):
            write(out / (label + ".json"), read(getattr(args, label)))
        # Un répertoire propre neutralise les .trivyignore/.syft.yaml/.grype.yaml du dépôt applicatif.
        with tempfile.TemporaryDirectory(prefix="scan-clean-") as tmp:
            env = {k: os.environ[k] for k in ("PATH", "SYSTEMROOT", "SSL_CERT_FILE", "SSL_CERT_DIR", "DOCKER_CONFIG") if k in os.environ}
            env.update({"HOME": tmp, "XDG_CONFIG_HOME": tmp, "SYFT_CHECK_FOR_APP_UPDATE": "false",
                        "GRYPE_CHECK_FOR_APP_UPDATE": "false", "GRYPE_DB_AUTO_UPDATE": "false",
                        "GRYPE_DB_REQUIRE_UPDATE_CHECK": "false", "GRYPE_DB_VALIDATE_AGE": "true",
                        "GRYPE_DB_MAX_ALLOWED_BUILT_AGE": str(policy["max_db_age_hours"]) + "h",
                        "GRYPE_DB_CACHE_DIR": db["cache_dir"]})
            config = Path(tmp) / "empty.yaml"
            config.write_text("{}\n", encoding="utf-8")
            ignore = Path(tmp) / "ignore"
            ignore.write_text("", encoding="utf-8")
            timeout = policy["scan_timeout_seconds"]
            if args.mode == "trivy":
                argv = [bins["trivy"], "image", "--config", str(config), "--cache-dir", db["cache_dir"], "--cache-backend", "memory",
                        "--skip-db-update", "--skip-java-db-update", "--offline-scan", "--skip-version-check", "--disable-telemetry", "--scanners", "vuln",
                        "--list-all-pkgs", "--image-src", "remote", "--ignorefile", str(ignore), "--format", "json", "--exit-code", "0", args.image]
                raw = invoke(argv, tmp, env, out, "trivy", timeout)
                (out / "report.json").write_text(raw, encoding="utf-8")
                packages, findings = normalize_trivy(json.loads(raw), args.image, profile)
            else:
                argv = [bins["syft"], "scan", "registry:" + args.image, "--config", str(config),
                        "--scope", "squashed", "-o", "syft-json"]
                raw = invoke(argv, tmp, env, out, "syft", timeout)
                sbom = out / "sbom.syft.json"
                sbom.write_text(raw, encoding="utf-8")
                packages = sbom_check(json.loads(raw), args.image, profile)
                sbom_hash = sha(sbom)
                raw = invoke([bins["grype"], "sbom:" + str(sbom), "--config", str(config), "-o", "json"],
                             tmp, env, out, "grype", timeout)
                (out / "report.json").write_text(raw, encoding="utf-8")
                need(sha(sbom) == sbom_hash, "SBOM modifié pendant analyse Grype")
                findings = normalize_grype(json.loads(raw), args.image, packages, db, sbom)
        db_check(db, args.mode, policy)  # Le cache ne doit pas avoir changé pendant l'analyse.
        trust_check(read(args.trust), args.mode)
        for name in bins:
            tool_check(lock, name)
        blocked, accepted = evaluate(findings, args.image, policy, exceptions)
        write(out / "normalized.json", {"packages": packages, "findings": findings,
                                         "blocked": blocked, "exceptions_used": accepted})
        decision.update(status="REJECT" if blocked else "PASS", blocked_count=len(blocked),
                        package_count=len(packages), db_built_at=db["built_at"],
                        decision_id=trust["decision_id"], build_id=controls["build_id"],
                        source_commit=controls["source_commit"])
    except GateError as e:
        decision.update(status=e.status, reason=str(e))
    except (OSError, ValueError, KeyError, TypeError) as e:
        decision.update(status="ERROR", reason=f"Preuve ou configuration invalide : {type(e).__name__}: {e}")
    decision["finished_at"] = NOW().isoformat()
    write(out / "decision.json", decision)
    evidence = {p.name: sha(p) for p in sorted(out.iterdir()) if p.is_file()}
    write(out / "evidence.json", evidence)
    print(json.dumps({k: decision[k] for k in ("status", "image_ref", "mode")}, ensure_ascii=False))
    return CODES[decision["status"]]


def verify(args):
    """À exécuter sur agent de promotion séparé ; dossier artifact Azure protégé.
    Le manifeste d'empreintes n'est pas une signature : authentifier son transport.
    """
    try:
        out, policy, trust = Path(args.out), read(args.policy), read(args.trust)
        evidence = read(out / "evidence.json")
        required = {"decision.json", "normalized.json", "report.json", "policy.json", "trust.json",
                    "tools.json", "db.json", "controls.json", "profile.json", "exceptions.json"}
        need(required.issubset(evidence), "Preuves obligatoires manquantes")
        for name, digest in evidence.items():
            need(Path(name).name == name and name != "evidence.json", "Chemin de preuve interdit")
            need(sha(out / name) == digest, "Preuve modifiée : " + name)
        d = read(out / "decision.json")
        need(d["image_ref"] == args.image and IMAGE.fullmatch(args.image), "Mauvaise image à promouvoir")
        trust_check(trust, d["mode"])
        need(d["decision_id"] == trust["decision_id"], "Décision de confiance renouvelée : revalider les preuves", "UNTRUSTED")
        need(d["status"] == "PASS", "Décision non conforme", "REJECT" if d["status"] == "REJECT" else "ERROR")
        need(sha(out / "policy.json") == sha(args.policy), "Politique modifiée : refaire un scan")
        need(sha(out / "exceptions.json") == sha(args.exceptions), "Exceptions modifiées ou révoquées : refaire la décision")
        fresh(d["finished_at"], policy["max_report_age_hours"], "Rapport")
        fresh(d["db_built_at"], policy["max_db_age_hours"], "Base au moment de promouvoir")
        controls_check(read(out / "controls.json"), args.image, policy)
        # Recalcul de la décision à partir des données normalisées conservées.
        normalized = read(out / "normalized.json")
        blocked, _ = evaluate(normalized["findings"], args.image, policy, read(args.exceptions))
        need(not blocked, "Exception expirée ou rejet recalculé", "REJECT")
        print("PASS : preuves intègres dans leur canal de confiance, décision actuelle")
        return 0
    except GateError as e:
        print(f"{e.status}: {e}", file=sys.stderr)
        return CODES[e.status]
    except (OSError, ValueError, KeyError, TypeError) as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 20


def main():
    os.umask(0o077)
    p = argparse.ArgumentParser(description=__doc__)
    sub = p.add_subparsers(dest="command", required=True)
    s = sub.add_parser("scan")
    s.add_argument("--mode", choices=("trivy", "grype"), required=True)
    for name in ("image", "out", "tools", "trust", "db", "policy", "exceptions", "profile", "controls"):
        s.add_argument("--" + name, required=True)
    v = sub.add_parser("verify")
    for name in ("image", "out", "trust", "policy", "exceptions"):
        v.add_argument("--" + name, required=True)
    args = p.parse_args()
    try:
        return scan(args) if args.command == "scan" else verify(args)
    except OSError as e:
        print(f"ERROR: impossible de créer le dossier de preuves : {e}", file=sys.stderr)
        return 20


if __name__ == "__main__":
    sys.exit(main())
```

</details>

<a id="fichier-gitops-mr-py"></a>

<details>
<summary><strong>gitops-mr.py</strong> — Créer une proposition GitLab sans la fusionner</summary>

**Chemin à créer :** `continuite-scan-support/scripts/gitops-mr.py`

```python
#!/usr/bin/env python3
"""Proposer une MR GitLab sur un checkout propre, jamais la fusionner.
Git utilise une identité SSH dédiée ; GITLAB_TOKEN n'est présent que dans ce job.
kubectl --local ne contacte pas le cluster. Une seule ressource Deployment par fichier.
"""
import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import subprocess
import sys
import urllib.parse
import urllib.request

import gate

p = argparse.ArgumentParser(description=__doc__)
for key in ("worktree", "base-branch", "manifest", "workload", "container", "image", "source-image",
            "gitlab-url", "project-id", "out", "trust", "policy", "exceptions"):
    p.add_argument("--" + key, required=True)
a = p.parse_args()
os.umask(0o077)
try:
    gate.need(gate.IMAGE.fullmatch(a.image), "Image de destination non immuable")
    gate.need(gate.IMAGE.fullmatch(a.source_image), "Image source non immuable")
    gate.need(a.image.split("@")[1] == a.source_image.split("@")[1], "Digest modifié pendant promotion")
    proof_args = argparse.Namespace(image=a.source_image, out=a.out, trust=a.trust, policy=a.policy, exceptions=a.exceptions)
    gate.need(gate.verify(proof_args) == 0, "Preuve de scan refusée")
    repo = Path(a.worktree).resolve(strict=True)
    manifest = (repo / a.manifest).resolve(strict=True)
    gate.need(manifest.is_relative_to(repo), "Manifest hors checkout GitOps")
    def run(argv):
        return subprocess.run(argv, cwd=repo, text=True, encoding="utf-8", capture_output=True, check=True).stdout
    gate.need(not run(["git", "status", "--porcelain"]).strip(), "Checkout GitOps non propre")
    # Origine GitLab : un checkout dédié n'est pas l'export source GitHub.
    origin = run(["git", "remote", "get-url", "origin"]).strip()
    host = urllib.parse.urlparse(a.gitlab_url).hostname
    gate.need(host and (origin.startswith("git@" + host + ":") or origin.startswith("https://" + host + "/")
                        or origin.startswith("ssh://git@" + host + "/")), "Origin différente du GitLab indiqué")
    gate.need(a.gitlab_url.startswith("https://"), "GitLab doit utiliser HTTPS avec certificat valide")
    run(["git", "check-ref-format", "--branch", a.base_branch])
    run(["git", "fetch", "origin", a.base_branch])
    branch = "scan-promotion/" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
    print("Branche de proposition : " + branch, file=sys.stderr)
    run(["git", "switch", "-c", branch, "origin/" + a.base_branch])
    obj = json.loads(run(["kubectl", "set", "image", "--local", "-f", str(manifest),
                          a.container + "=" + a.image, "-o", "json"]))
    gate.need(obj.get("kind") == "Deployment" and obj["metadata"]["name"] == a.workload,
              "Le fichier doit contenir le seul Deployment attendu")
    gate.need(obj["metadata"].get("namespace") == "facturadj-preprod", "Namespace inattendu ou implicite")
    containers = obj["spec"]["template"]["spec"]["containers"]
    gate.need(sum(c["name"] == a.container for c in containers) == 1, "Conteneur attendu absent ou ambigu")
    content = run(["kubectl", "set", "image", "--local", "-f", str(manifest),
                   a.container + "=" + a.image, "-o", "yaml"])
    manifest.write_text(content, encoding="utf-8")
    run(["git", "add", "--", a.manifest])
    gate.need(run(["git", "diff", "--cached", "--name-only"]).strip() == a.manifest,
              "La modification ne doit toucher que le manifest demandé")
    run(["git", "commit", "-m", "Promote approved image digest"])
    run(["git", "push", "--set-upstream", "origin", branch])
    d = gate.read(Path(a.out) / "decision.json")
    description = ("Image contrôlée : `" + a.image + "`\n\nDécision : " + d["decision_id"] +
                   "\nBuild : " + str(d["build_id"]) + "\nCommit source : " + d["source_commit"] +
                   "\nMode de scan : " + d["mode"] +
                   "\n\nJoindre le lien vers les preuves Azure protégées avant approbation.\n"
                   "Cette MR doit rester soumise aux approbations et vérifications du projet.")
    body = json.dumps({"source_branch": branch, "target_branch": a.base_branch,
                       "title": "Promote approved image digest", "description": description,
                       "remove_source_branch": True}).encode()
    token = os.environ["GITLAB_TOKEN"]
    project = urllib.parse.quote(a.project_id, safe="")
    req = urllib.request.Request(a.gitlab_url.rstrip("/") + "/api/v4/projects/" + project + "/merge_requests",
                                 data=body, headers={"PRIVATE-TOKEN": token, "Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=30) as response:
        result = json.load(response)
    print(result["web_url"])
except (gate.GateError, OSError, ValueError, KeyError, subprocess.CalledProcessError) as e:
    # Une branche déjà poussée peut subsister si l'API MR échoue ; la reprendre, ne pas forcer.
    print(f"ERROR: MR non confirmée : {type(e).__name__}: {e}", file=sys.stderr)
    sys.exit(20)
```

</details>

<a id="fichier-install-tools-sh"></a>

<details>
<summary><strong>install-tools.sh</strong> — Installer les candidats versionnés avec vérification de signature</summary>

**Chemin à créer :** `continuite-scan-support/scripts/install-tools.sh`

```bash
#!/usr/bin/env bash
# Debian/Ubuntu Linux amd64 ou arm64. Prérequis : Bash, curl, tar, awk,
# sha256sum, jq et Cosign 3.x approvisionné et validé indépendamment.
# Les signatures valident une identité, pas l'innocuité de la fabrication.
# À lancer seulement depuis une station saine après revue des versions/sources.
# Usage : TOOL_ROOT=/chemin/absolu/scan-tools bash scripts/install-tools.sh
# Produit tools.lock.candidate.json : sa promotion en configuration active
# exige la revue et l'approbation organisationnelles, sans copie automatique.
set -Eeuo pipefail
umask 077

for utility in cosign curl tar sha256sum awk jq install readlink; do
  command -v "$utility" >/dev/null || { printf 'Prérequis absent : %s\n' "$utility" >&2; exit 20; }
done
[[ "$(uname -s)" == Linux ]] || { printf 'Linux requis\n' >&2; exit 20; }
case "$(uname -m)" in
  x86_64) ARCH=amd64; TRIVY_ARCH=64bit ;;
  aarch64|arm64) ARCH=arm64; TRIVY_ARCH=ARM64 ;;
  *) printf 'Architecture non qualifiée\n' >&2; exit 20 ;;
esac
TOOL_ROOT="${TOOL_ROOT:-$PWD/outillage-candidat}"
[[ "$TOOL_ROOT" == /* ]] || { printf 'TOOL_ROOT doit être absolu\n' >&2; exit 20; }
mkdir -p "$TOOL_ROOT/artifacts" "$TOOL_ROOT/bin"
TOOL_ROOT="$(readlink -f "$TOOL_ROOT")"
cosign version > "$TOOL_ROOT/artifacts/cosign-version.txt"

fetch() {
  curl --fail --show-error --silent --location \
    --proto '=https' --proto-redir '=https' --tlsv1.2 --retry 2 --connect-timeout 20 \
    --max-time 300 --output "$2" "$1"
}

install_checked_binary() {
  local source="$1" destination="$2"
  [[ -f "$source" && ! -L "$source" ]] || { printf 'Binaire extrait non régulier\n' >&2; exit 30; }
  mkdir -p "$(dirname "$destination")"
  if [[ -e "$destination" || -L "$destination" ]]; then
    [[ -f "$destination" && ! -L "$destination" ]] || exit 30
    [[ "$(sha256sum "$source" | awk '{print $1}')" == "$(sha256sum "$destination" | awk '{print $1}')" ]] || {
      printf 'Un fichier existant diffère ; aucune écriture automatique : %s\n' "$destination" >&2
      exit 30
    }
  else
    install -m 0755 "$source" "$destination"
  fi
}

install_anchore() (
  set -Eeuo pipefail
  tool="$1"; version="$2"
  folder="$TOOL_ROOT/artifacts/$tool-$version-$ARCH"
  mkdir -p "$folder"
  cd "$folder"
  archive="${tool}_${version}_linux_${ARCH}.tar.gz"
  checksums="${tool}_${version}_checksums.txt"
  base="https://github.com/anchore/$tool/releases/download/v$version"
  fetch "$base/$archive" "$archive"
  fetch "$base/$checksums" "$checksums"
  fetch "$base/$checksums.sigstore.json" "$checksums.sigstore.json"
  # L'identité exacte est celle de l'installateur officiel au tag retenu.
  cosign verify-blob "$checksums" \
    --bundle "$checksums.sigstore.json" \
    --certificate-identity "https://github.com/anchore/$tool/.github/workflows/release.yaml@refs/heads/main" \
    --certificate-oidc-issuer 'https://token.actions.githubusercontent.com' \
    > signature-verification.log 2>&1
  # Pas de --ignore-missing : notre archive doit être présente une seule fois.
  awk -v f="$archive" '$2==f { print; n++ } END { if(n!=1) exit 1 }' \
    "$checksums" > selected.sha256
  sha256sum --check selected.sha256
  extracted="$(mktemp -d "$folder/extracted.XXXXXX")"
  tar --extract --gzip --file "$archive" --directory "$extracted" \
    --no-same-owner "$tool"
  install_checked_binary "$extracted/$tool" "$TOOL_ROOT/$tool/$version/$tool"
  sha256sum "$TOOL_ROOT/$tool/$version/$tool" > installed.sha256
)

install_trivy() (
  set -Eeuo pipefail
  version=0.76.0
  folder="$TOOL_ROOT/artifacts/trivy-$version-$ARCH"
  mkdir -p "$folder"
  cd "$folder"
  archive="trivy_${version}_Linux-${TRIVY_ARCH}.tar.gz"
  base="https://github.com/aquasecurity/trivy/releases/download/v$version"
  fetch "$base/$archive" "$archive"
  fetch "$base/$archive.sigstore.json" "$archive.sigstore.json"
  cosign verify-blob "$archive" --bundle "$archive.sigstore.json" \
    --certificate-identity "https://github.com/aquasecurity/trivy/.github/workflows/reusable-release.yaml@refs/tags/v$version" \
    --certificate-oidc-issuer 'https://token.actions.githubusercontent.com' \
    > signature-verification.log 2>&1
  extracted="$(mktemp -d "$folder/extracted.XXXXXX")"
  tar --extract --gzip --file "$archive" --directory "$extracted" \
    --no-same-owner trivy
  install_checked_binary "$extracted/trivy" "$TOOL_ROOT/trivy/$version/trivy"
  sha256sum "$archive" "$TOOL_ROOT/trivy/$version/trivy" > installed.sha256
)

install_anchore syft 1.54.1
install_anchore grype 0.120.1
install_trivy
# Vérifications fonctionnelles candidates après la revue de confiance préalable.
"$TOOL_ROOT/trivy/0.76.0/trivy" --version > "$TOOL_ROOT/artifacts/trivy-version.txt"
"$TOOL_ROOT/syft/1.54.1/syft" version > "$TOOL_ROOT/artifacts/syft-version.txt"
"$TOOL_ROOT/grype/0.120.1/grype" version > "$TOOL_ROOT/artifacts/grype-version.txt"
for entry in trivy:0.76.0 syft:1.54.1 grype:0.120.1; do
  tool="${entry%%:*}"; version="${entry#*:}"
  awk -v v="$version" '$1=="Version:" && $2==v { n++ } END { if(n!=1) exit 1 }' \
    "$TOOL_ROOT/artifacts/$tool-version.txt" || { printf 'Version exécutée inattendue : %s\n' "$tool" >&2; exit 30; }
  cat "$TOOL_ROOT/artifacts/$tool-version.txt"
done

for entry in trivy:0.76.0 syft:1.54.1 grype:0.120.1; do
  tool="${entry%%:*}"; version="${entry#*:}"
  expected="../$tool/$version/$tool"
  if [[ -L "$TOOL_ROOT/bin/$tool" ]]; then
    [[ "$(readlink "$TOOL_ROOT/bin/$tool")" == "$expected" ]] || {
      printf 'Lien existant vers une autre version ; revue requise : %s\n' "$tool" >&2; exit 30;
    }
  elif [[ -e "$TOOL_ROOT/bin/$tool" ]]; then
    printf 'Commande existante conservée : %s\n' "$tool" >&2; exit 30
  else
    ln -s "$expected" "$TOOL_ROOT/bin/$tool"
  fi
done

# Les hashes sont calculés sur les octets installés, jamais inventés.
jq -n --arg platform "linux/$ARCH" --arg root "$TOOL_ROOT" \
  --arg trivy "$(sha256sum "$TOOL_ROOT/trivy/0.76.0/trivy" | awk '{print $1}')" \
  --arg syft "$(sha256sum "$TOOL_ROOT/syft/1.54.1/syft" | awk '{print $1}')" \
  --arg grype "$(sha256sum "$TOOL_ROOT/grype/0.120.1/grype" | awk '{print $1}')" '
  {schema:1, platform:$platform, tools:{
    trivy:{version:"0.76.0",path:($root+"/trivy/0.76.0/trivy"),sha256:$trivy},
    syft:{version:"1.54.1",path:($root+"/syft/1.54.1/syft"),sha256:$syft},
    grype:{version:"0.120.1",path:($root+"/grype/0.120.1/grype"),sha256:$grype}}}' \
  > "$TOOL_ROOT/tools.lock.candidate.json"
printf 'Candidat créé : %s/tools.lock.candidate.json\n' "$TOOL_ROOT"
printf 'Après approbation, ajouter au PATH : %s/bin\n' "$TOOL_ROOT"
printf 'Conserver les preuves ; aucun verrou de production n’a été modifié.\n'
```

</details>

<a id="fichier-notify-mattermost-sh"></a>

<details>
<summary><strong>notify-mattermost.sh</strong> — Notifier depuis un job séparé du scanner</summary>

**Chemin à créer :** `continuite-scan-support/scripts/notify-mattermost.sh`

```bash
#!/usr/bin/env bash
# notify-mattermost.sh — exemple de notification à intégrer après validation.
# Ne pas activer set -x : l'URL de webhook est un secret.
set -euo pipefail
: "${MM_WEBHOOK_URL:?Webhook manquant dans le job de notification}"
: "${INCIDENT_ID:?Identifiant incident requis}"
: "${SCANNER_MODE:?Mode requis}"
: "${DEPLOYMENT_STATE:?État des déploiements requis}"
: "${INCIDENT_TICKET_URL:?Lien ticket requis}"
[[ "$MM_WEBHOOK_URL" == https://* ]] || { echo 'Webhook HTTPS requis' >&2; exit 1; }
case "$SCANNER_MODE" in trivy|grype) ;; *) echo 'Mode inconnu' >&2; exit 1 ;; esac
export INCIDENT_ID SCANNER_MODE DEPLOYMENT_STATE INCIDENT_TICKET_URL
tmp_dir=$(mktemp -d)
trap 'rm -rf -- "$tmp_dir"' EXIT
chmod 700 "$tmp_dir"
# Python assure l'échappement JSON ; aucune construction de JSON par concaténation.
python3 - "$tmp_dir/payload.json" <<'PY'
import json, os, sys
text = (
    f"Incident {os.environ['INCIDENT_ID']} | "
    f"scanner={os.environ['SCANNER_MODE']} | "
    f"déploiements={os.environ['DEPLOYMENT_STATE']}\n"
    f"Décision et preuves : {os.environ['INCIDENT_TICKET_URL']}"
)
with open(sys.argv[1], 'w', encoding='utf-8') as stream:
    json.dump({'text': text}, stream, ensure_ascii=False)
PY
# L'URL est passée à curl dans un fichier privé pour éviter son affichage dans ps.
# Refuser guillemets et caractères de contrôle pour préserver la syntaxe du fichier.
case "$MM_WEBHOOK_URL" in *\"*|*$'\n'*|*$'\r'*|*\\*) echo 'URL invalide' >&2; exit 1 ;; esac
printf 'url = "%s"\n' "$MM_WEBHOOK_URL" > "$tmp_dir/curl.conf"
chmod 600 "$tmp_dir/curl.conf" "$tmp_dir/payload.json"
http_code=$(curl --silent --show-error --connect-timeout 10 --max-time 30 \
  --config "$tmp_dir/curl.conf" --request POST \
  --header 'Content-Type: application/json' \
  --data-binary "@$tmp_dir/payload.json" \
  --output "$tmp_dir/response" --write-out '%{http_code}')
if [[ "$http_code" != 200 || "$(cat "$tmp_dir/response")" != ok ]]; then
  echo "Notification non confirmée (HTTP $http_code) ; utiliser le canal de secours prévu." >&2
  exit 1
fi
echo 'Notification Mattermost confirmée.'
```

</details>

<a id="fichier-prepare-bases-sh"></a>

<details>
<summary><strong>prepare-bases.sh</strong> — Préparer les bases et leurs snapshots candidats sur poste sain</summary>

**Chemin à créer :** `continuite-scan-support/scripts/prepare-bases.sh`

```bash
#!/usr/bin/env bash
# Approvisionner les DB sur une station saine AVANT un incident.
# Ce script ne prouve pas l'authenticité amont des DB : la revue d'origine,
# de dates, de transport et de confiance reste obligatoire avant activation.
# Usage : TOOLS_LOCK_JSON=/config/protegee/tools.lock.json \
#   TRIVY_DB_SOURCE=registre/base-trivy@sha256:DIGEST_REEL_APPROUVE \
#   DB_ROOT=/cache/absolu/snapshot-unique bash scripts/prepare-bases.sh
# Prérequis : outils déjà approuvés, Python >=3.11, jq, sha256sum, Bash.
# DB_ROOT est nouveau, absolu et définitif : les snapshots stockent ses chemins.
# Périmètre de ce profil : Python/Node et paquets système ; Java DB non préparée.
set -Eeuo pipefail
umask 077
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
SUPPORT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd -P)"
: "${TOOLS_LOCK_JSON:?verrou d’outils approuvé et protégé requis}"
: "${DB_ROOT:?nouveau dossier absolu de cache requis}"
: "${TRIVY_DB_SOURCE:?référence OCI de base Trivy approuvée par digest requise}"
[[ "$TRIVY_DB_SOURCE" =~ @sha256:[0-9a-f]{64}$ ]] || exit 30
POLICY_JSON="${POLICY_JSON:-$SUPPORT_DIR/config/policy.json}"
PYTHON_BIN="${PYTHON_BIN:-python3}"
for utility in jq sha256sum awk env; do command -v "$utility" >/dev/null || exit 20; done
command -v "$PYTHON_BIN" >/dev/null || exit 20
[[ "$DB_ROOT" == /* && "$TOOLS_LOCK_JSON" == /* && "$POLICY_JSON" == /* ]] || {
  printf 'Chemins absolus requis\n' >&2; exit 20;
}
[[ ! -e "$DB_ROOT" && ! -L "$DB_ROOT" ]] || {
  printf 'Le dossier DB_ROOT doit être nouveau ; cache existant conservé\n' >&2; exit 20;
}

checked_tool() {
  local name="$1" version="$2" path expected
  [[ "$(jq -er --arg t "$name" '.tools[$t].version' "$TOOLS_LOCK_JSON")" == "$version" ]] || exit 30
  path="$(jq -er --arg t "$name" '.tools[$t].path' "$TOOLS_LOCK_JSON")"
  expected="$(jq -er --arg t "$name" '.tools[$t].sha256' "$TOOLS_LOCK_JSON")"
  [[ "$path" == /* && -f "$path" && "$expected" =~ ^[0-9a-f]{64}$ ]] || exit 30
  [[ "$(sha256sum "$path" | awk '{print $1}')" == "$expected" ]] || {
    printf 'Binaire différent du verrou approuvé : %s\n' "$name" >&2; exit 30;
  }
  printf '%s\n' "$path"
}
TRIVY_BIN="$(checked_tool trivy 0.76.0)"
GRYPE_BIN="$(checked_tool grype 0.120.1)"
MAX_AGE_HOURS="$(jq -er '.max_db_age_hours | select(type=="number" and .>0)' "$POLICY_JSON")"
mkdir -p "$DB_ROOT/trivy" "$DB_ROOT/grype" "$DB_ROOT/evidence" "$DB_ROOT/home"
printf '{}\n' > "$DB_ROOT/evidence/empty.yaml"
# Neutraliser les variables TRIVY_*/GRYPE_* héritées et fichiers de dépôt.
# Conserver uniquement la confiance TLS et l'authentification registre requises.
CLEAN_ENV=(env -i "PATH=$PATH" "HOME=$DB_ROOT/home" "XDG_CONFIG_HOME=$DB_ROOT/home")
[[ -z "${SSL_CERT_FILE:-}" ]] || CLEAN_ENV+=("SSL_CERT_FILE=$SSL_CERT_FILE")
[[ -z "${SSL_CERT_DIR:-}" ]] || CLEAN_ENV+=("SSL_CERT_DIR=$SSL_CERT_DIR")
[[ -z "${DOCKER_CONFIG:-}" ]] || CLEAN_ENV+=("DOCKER_CONFIG=$DOCKER_CONFIG")

cd "$DB_ROOT/home"
"${CLEAN_ENV[@]}" "$TRIVY_BIN" image --config "$DB_ROOT/evidence/empty.yaml" \
  --cache-dir "$DB_ROOT/trivy" --db-repository "$TRIVY_DB_SOURCE" \
  --download-db-only --skip-version-check --disable-telemetry \
  > "$DB_ROOT/evidence/trivy-update.stdout" 2> "$DB_ROOT/evidence/trivy-update.stderr"
"${CLEAN_ENV[@]}" "GRYPE_DB_CACHE_DIR=$DB_ROOT/grype" \
  "GRYPE_DB_AUTO_UPDATE=true" "GRYPE_CHECK_FOR_APP_UPDATE=false" \
  "GRYPE_DB_VALIDATE_AGE=true" "GRYPE_DB_MAX_ALLOWED_BUILT_AGE=${MAX_AGE_HOURS}h" \
  "$GRYPE_BIN" db update --config "$DB_ROOT/evidence/empty.yaml" \
  > "$DB_ROOT/evidence/grype-update.stdout" 2> "$DB_ROOT/evidence/grype-update.stderr"
"${CLEAN_ENV[@]}" "GRYPE_DB_CACHE_DIR=$DB_ROOT/grype" \
  "GRYPE_DB_AUTO_UPDATE=false" "GRYPE_CHECK_FOR_APP_UPDATE=false" \
  "GRYPE_DB_VALIDATE_AGE=true" "GRYPE_DB_MAX_ALLOWED_BUILT_AGE=${MAX_AGE_HOURS}h" \
  "$GRYPE_BIN" db status --config "$DB_ROOT/evidence/empty.yaml" -o json \
  > "$DB_ROOT/evidence/grype-db-status.json" 2> "$DB_ROOT/evidence/grype-status.stderr"

# L'âge est celui de la base amont, jamais la date de téléchargement local.
"$PYTHON_BIN" - "$DB_ROOT" "$MAX_AGE_HOURS" <<'PY'
from datetime import datetime, timezone
import json
from pathlib import Path
import sys
root = Path(sys.argv[1])
max_seconds = float(sys.argv[2]) * 3600
trivy = json.loads((root / "trivy/db/metadata.json").read_text())
grype = json.loads((root / "evidence/grype-db-status.json").read_text())
if grype.get("valid") is not True or grype.get("error"):
    raise SystemExit("DB Grype invalide")
for label, value in (("Trivy", trivy["UpdatedAt"]), ("Grype", grype["built"])):
    built = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if built.tzinfo is None:
        raise SystemExit(f"Horodatage {label} sans fuseau")
    age = (datetime.now(timezone.utc) - built).total_seconds()
    if not -300 <= age <= max_seconds:
        raise SystemExit(f"DB {label} périmée ou horloge incohérente")
PY

# Les sources et leurs dates restent à examiner avant d'approuver ces candidats.
GRYPE_SOURCE="$(jq -er '.from | select(type=="string" and length>0)' "$DB_ROOT/evidence/grype-db-status.json")"
"$PYTHON_BIN" "$SCRIPT_DIR/snapshot-db.py" --mode trivy \
  --cache-dir "$DB_ROOT/trivy" --source "$TRIVY_DB_SOURCE" \
  --out "$DB_ROOT/evidence/trivy-db.candidate.json"
"$PYTHON_BIN" "$SCRIPT_DIR/snapshot-db.py" --mode grype \
  --cache-dir "$DB_ROOT/grype" --source "$GRYPE_SOURCE" \
  --status "$DB_ROOT/evidence/grype-db-status.json" \
  --out "$DB_ROOT/evidence/grype-db.candidate.json"
printf 'Snapshots candidats : %s/evidence\n' "$DB_ROOT"
printf 'Revoir origine, fraîcheur, empreintes, logs et droits avant activation.\n'
printf 'Garder les chemins absolus ; aucune configuration CI active modifiée.\n'
```

</details>

<a id="fichier-probe-native-exits-py"></a>

<details>
<summary><strong>probe-native-exits.py</strong> — Mesurer les codes natifs en laboratoire</summary>

**Chemin à créer :** `continuite-scan-support/scripts/probe-native-exits.py`

```python
#!/usr/bin/env python3
"""Mesurer les codes natifs sur Linux, seulement quand les deux chemins sont fiables.
L'image fournie doit avoir un HIGH/CRITICAL confirmé par CHAQUE outil avec les DB du jour.
N'autorise aucune promotion. Sortie : codes-observes.json + stdout/stderr par cas.
"""
import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import subprocess
import tempfile
import time

import gate

p = argparse.ArgumentParser(description=__doc__)
for name in ("reject-image", "out", "tools", "trust", "db-trivy", "db-grype", "policy"):
    p.add_argument("--" + name, required=True)
a = p.parse_args()
os.umask(0o077)
gate.need(gate.IMAGE.fullmatch(a.reject_image), "Image de rejet réelle par digest requise")
out = Path(a.out).resolve()
out.mkdir(parents=True, exist_ok=False)
trust, tools, policy = gate.read(a.trust), gate.read(a.tools), gate.read(a.policy)
for mode in ("trivy", "grype"):
    gate.trust_check(trust, mode)
dt, dg = gate.read(a.db_trivy), gate.read(a.db_grype)
gate.db_check(dt, "trivy", policy)
gate.db_check(dg, "grype", policy)
bins = {name: gate.tool_check(tools, name) for name in ("trivy", "syft", "grype")}
observed = []
with tempfile.TemporaryDirectory(prefix="probe-native-") as tmp:
    env = {k: os.environ[k] for k in ("PATH", "DOCKER_CONFIG", "SSL_CERT_FILE", "SSL_CERT_DIR") if k in os.environ}
    env.update(HOME=tmp, XDG_CONFIG_HOME=tmp, SYFT_CHECK_FOR_APP_UPDATE="false",
               GRYPE_CHECK_FOR_APP_UPDATE="false", GRYPE_DB_AUTO_UPDATE="false", GRYPE_DB_CACHE_DIR=dg["cache_dir"],
               GRYPE_DB_VALIDATE_AGE="true", GRYPE_DB_MAX_ALLOWED_BUILT_AGE=str(policy["max_db_age_hours"]) + "h")
    cfg = Path(tmp) / "empty.yaml"
    cfg.write_text("{}\n")
    ignore = Path(tmp) / "empty.ignore"
    ignore.write_text("")
    bad = Path(tmp) / "truncated.json"
    bad.write_text('{"artifacts": [')
    trivy = [bins["trivy"], "image", "--config", str(cfg), "--cache-dir", dt["cache_dir"],
             "--cache-backend", "memory", "--image-src", "remote", "--ignorefile", str(ignore),
             "--skip-db-update", "--skip-java-db-update", "--offline-scan", "--scanners", "vuln",
             "--skip-version-check", "--disable-telemetry", "--format", "json"]
    grype = [bins["grype"], "--config", str(cfg), "-o", "json"]
    cases = [
        ("trivy-completion", trivy + ["--exit-code", "0", a.reject_image], [0]),
        ("trivy-threshold", trivy + ["--severity", "HIGH,CRITICAL", "--exit-code", "10", a.reject_image], [10]),
        ("syft-completion", [bins["syft"], "scan", "registry:" + a.reject_image, "--config", str(cfg), "-o", "syft-json"], [0]),
        ("grype-completion", grype + ["registry:" + a.reject_image], [0]),
        ("grype-threshold", grype + ["--fail-on", "high", "registry:" + a.reject_image], [2]),
        ("grype-invalid-sbom", grype + ["sbom:" + str(bad)], [1]),
        ("grype-db-check", [bins["grype"], "db", "check", "--config", str(cfg)], [0, 100]),
    ]
    for label, argv, expected in cases:
        started = time.monotonic()
        result = subprocess.run(argv, cwd=tmp, env=env, capture_output=True,
                                text=True, encoding="utf-8", errors="replace", timeout=policy["scan_timeout_seconds"])
        (out / (label + ".stdout")).write_text(result.stdout, encoding="utf-8")
        (out / (label + ".stderr")).write_text(result.stderr, encoding="utf-8")
        observed.append({"case": label, "returncode": result.returncode, "expected": expected,
                         "matches_expectation": result.returncode in expected,
                         "elapsed_seconds": time.monotonic() - started})
        gate.write(out / "codes-observes.json", {"measured_at": datetime.now(timezone.utc).isoformat(),
                   "image_ref": a.reject_image, "versions": gate.VERSIONS, "cases": observed})
gate.db_check(dt, "trivy", policy)
gate.db_check(dg, "grype", policy)
print(json.dumps(observed, indent=2))
raise SystemExit(0 if all(x["matches_expectation"] for x in observed) else 20)
```

</details>

<a id="fichier-promote-sh"></a>

<details>
<summary><strong>promote.sh</strong> — Copier le digest conforme vers le projet Harbor autorisé</summary>

**Chemin à créer :** `continuite-scan-support/scripts/promote.sh`

```bash
#!/usr/bin/env bash
# Promotion explicite depuis un agent sain distinct du scanner. Skopeo préinstallé approuvé.
# Le canal de réception du dossier de preuves doit être authentifié (artifact Azure protégé).
set -euo pipefail
umask 077
if [[ $# -ne 6 ]]; then
  echo 'Usage: promote.sh SOURCE@sha256:... DEST_REPO:TAG DOSSIER_PREUVES TRUST_JSON POLICY_JSON EXCEPTIONS_JSON' >&2
  exit 20
fi
SOURCE_REF="$1"; DEST_REF="$2"; EVIDENCE_DIR="$3"; TRUST_FILE="$4"; POLICY_FILE="$5"; EXCEPTIONS_FILE="$6"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
python3 "$SCRIPT_DIR/gate.py" verify --image "$SOURCE_REF" --out "$EVIDENCE_DIR" \
  --trust "$TRUST_FILE" --policy "$POLICY_FILE" --exceptions "$EXCEPTIONS_FILE" >&2
[[ "$SOURCE_REF" =~ @sha256:[0-9a-f]{64}$ ]] || exit 20
[[ "$DEST_REF" =~ ^[a-z0-9][a-z0-9./:_-]*:[A-Za-z0-9_][A-Za-z0-9_.-]*$ ]] || exit 20
[[ "${DEST_REF##*/}" == *:* && "${DEST_REF##*:}" != latest ]] || exit 20
# Les deux droits Harbor sont différents ; les fichiers d'auth restent hors des preuves.
: "${SOURCE_AUTH_FILE:?fichier auth lecture quarantaine requis}"
: "${DEST_AUTH_FILE:?fichier auth publication projet approuvé requis}"
skopeo copy --preserve-digests --src-authfile "$SOURCE_AUTH_FILE" --dest-authfile "$DEST_AUTH_FILE" \
  "docker://$SOURCE_REF" "docker://$DEST_REF" >&2
SOURCE_DIGEST="${SOURCE_REF##*@}"
DEST_DIGEST="$(skopeo inspect --authfile "$DEST_AUTH_FILE" --format '{{.Digest}}' "docker://$DEST_REF")"
[[ "$DEST_DIGEST" == "$SOURCE_DIGEST" ]] || { echo 'Digest modifié pendant promotion' >&2; exit 20; }
# Écrire la référence à reporter DANS UNE MR GitOps. Ne jamais déployer par le tag de destination.
printf '%s@%s\n' "${DEST_REF%:*}" "$DEST_DIGEST"
```

</details>

<a id="fichier-scan-containers-sh"></a>

<details>
<summary><strong>scan-containers.sh</strong> — Réaliser le parcours pédagogique en conteneurs isolés</summary>

**Chemin à créer :** `continuite-scan-support/scripts/scan-containers.sh`

```bash
#!/usr/bin/env bash
# Tutoriel Linux sans réseau DANS les conteneurs ; aucun socket Docker n'y est monté.
# Exiger préalablement confiance, signatures, hashes, fraîcheur DB et images locales.
# Résultats bruts pédagogiques : ce script NE DÉCIDE PAS de la promotion.
set -euo pipefail
umask 077
: "${TRIVY_IMAGE:?référence d’image de scanner approuvée par digest requise}"
: "${SYFT_IMAGE:?référence d’image de scanner approuvée par digest requise}"
: "${GRYPE_IMAGE:?référence d’image de scanner approuvée par digest requise}"
: "${TRIVY_CACHE_DIR:?cache sain absolu requis}"
: "${GRYPE_DB_CACHE_DIR:?cache sain absolu requis}"
: "${OCI_LAYOUT_DIR:?répertoire OCI réel vérifié requis}"
: "${MANIFEST_DIGEST:?digest enfant réel requis}"
: "${CONTAINER_RESULTS:?nouveau dossier absolu requis}"
for ref in "$TRIVY_IMAGE" "$SYFT_IMAGE" "$GRYPE_IMAGE"; do
  [[ "$ref" =~ @sha256:[0-9a-f]{64}$ ]] || exit 30
done
[[ "$MANIFEST_DIGEST" =~ ^sha256:[0-9a-f]{64}$ ]] || exit 20
for folder in "$TRIVY_CACHE_DIR" "$GRYPE_DB_CACHE_DIR" "$OCI_LAYOUT_DIR"; do
  [[ "$folder" == /* && -d "$folder" ]] || exit 20
done
[[ "$CONTAINER_RESULTS" == /* && ! -e "$CONTAINER_RESULTS" ]] || exit 20
mkdir -- "$CONTAINER_RESULTS"
COMMON=(--rm --pull=never --network none --read-only --cap-drop ALL
  --security-opt no-new-privileges --user "$(id -u):$(id -g)"
  --tmpfs /tmp:rw,noexec,nosuid,nodev,size=512m -e HOME=/tmp)
docker run "${COMMON[@]}" \
  --mount "type=bind,src=$TRIVY_CACHE_DIR,dst=/cache,readonly" \
  --mount "type=bind,src=$OCI_LAYOUT_DIR,dst=/image,readonly" \
  "$TRIVY_IMAGE" image --input "/image@$MANIFEST_DIGEST" --cache-dir /cache \
  --cache-backend memory --skip-db-update --skip-java-db-update --offline-scan \
  --skip-version-check --disable-telemetry --scanners vuln --format json --exit-code 0 \
  > "$CONTAINER_RESULTS/trivy.json" 2> "$CONTAINER_RESULTS/trivy.log"
docker run "${COMMON[@]}" -e SYFT_CHECK_FOR_APP_UPDATE=false \
  --mount "type=bind,src=$OCI_LAYOUT_DIR,dst=/image,readonly" \
  "$SYFT_IMAGE" scan oci-dir:/image --scope squashed -o syft-json \
  > "$CONTAINER_RESULTS/sbom.syft.json" 2> "$CONTAINER_RESULTS/syft.log"
docker run "${COMMON[@]}" -e GRYPE_DB_AUTO_UPDATE=false -e GRYPE_CHECK_FOR_APP_UPDATE=false \
  -e GRYPE_DB_CACHE_DIR=/db -e GRYPE_DB_VALIDATE_AGE=true -e GRYPE_DB_MAX_ALLOWED_BUILT_AGE=24h \
  --mount "type=bind,src=$GRYPE_DB_CACHE_DIR,dst=/db,readonly" \
  --mount "type=bind,src=$CONTAINER_RESULTS,dst=/evidence,readonly" \
  "$GRYPE_IMAGE" sbom:/evidence/sbom.syft.json -o json \
  > "$CONTAINER_RESULTS/grype.json" 2> "$CONTAINER_RESULTS/grype.log"
printf 'Rapports bruts dans %s ; valider sujet, inventaire et politique avant décision.\n' "$CONTAINER_RESULTS"
```

</details>

<a id="fichier-scan-sh"></a>

<details>
<summary><strong>scan.sh</strong> — Lancer le contrôle commun depuis Bash</summary>

**Chemin à créer :** `continuite-scan-support/scripts/scan.sh`

```bash
#!/usr/bin/env bash
# Exécuter sur un agent Linux sain ; les configurations sont hors du dépôt applicatif.
set -euo pipefail
umask 077
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
exec python3 "$SCRIPT_DIR/gate.py" scan "$@"
```

</details>

<a id="fichier-snapshot-db-py"></a>

<details>
<summary><strong>snapshot-db.py</strong> — Calculer les empreintes du contenu de la base</summary>

**Chemin à créer :** `continuite-scan-support/scripts/snapshot-db.py`

```python
#!/usr/bin/env python3
"""Capturer une DB déjà acquise sur un poste sain. Ne prouve pas son authenticité.
Usage : snapshot-db.py --mode trivy|grype --cache-dir ABS --source URL --out JSON
Pour Grype fournir --status fichier issu de `grype db status -o json`.
"""
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path

p = argparse.ArgumentParser(description=__doc__)
p.add_argument("--mode", choices=("trivy", "grype"), required=True)
for name in ("cache-dir", "source", "out"):
    p.add_argument("--" + name, required=True)
p.add_argument("--status")
a = p.parse_args()
root = Path(a.cache_dir).resolve(strict=True)
if a.mode == "trivy":
    database_root = root / "db"
    metadata = json.loads((database_root / "metadata.json").read_text(encoding="utf-8"))
    built = metadata["UpdatedAt"]
else:
    if not a.status:
        p.error("--status est obligatoire pour Grype")
    status = json.loads(Path(a.status).read_text(encoding="utf-8"))
    if status.get("error") or not status.get("valid"):
        p.error("DB Grype non valide")
    built = status["built"]
    db_path = Path(status["path"]).resolve(strict=True)
    if not db_path.is_relative_to(root):
        p.error("DB hors du cache indiqué")
    database_root = db_path.parent
files = []
for file in sorted(database_root.rglob("*")):
    if file.is_symlink():
        p.error("Un snapshot ne doit pas contenir de lien symbolique")
    if file.is_file():
        h = hashlib.sha256()
        with file.open("rb") as f:
            for block in iter(lambda: f.read(1024 * 1024), b""):
                h.update(block)
        files.append({"path": str(file.resolve()), "sha256": h.hexdigest()})
if not any(Path(item["path"]).suffix == ".db" for item in files):
    p.error("Aucun fichier .db")
result = {"schema": 1, "mode": a.mode, "built_at": built, "cache_dir": str(root),
          "source": a.source, "captured_at": datetime.now(timezone.utc).isoformat(), "files": files}
Path(a.out).write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Snapshot créé ; vérifier provenance, date, exhaustivité et approbation avant usage CI.")
```

</details>

<a id="fichier-controls-example-json"></a>

<details>
<summary><strong>controls.example.json</strong> — Décrire les résultats réels des contrôles annexes</summary>

**Chemin à créer :** `continuite-scan-support/config/controls.example.json`

```json
{
  "schema": 1,
  "image_ref": "A_RENSEIGNER_REGISTRE_REPO@sha256:DIGEST_REEL",
  "build_id": "A_RENSEIGNER",
  "source_commit": "A_RENSEIGNER_COMMIT_VERIFIE",
  "checked_at": "2000-01-01T00:00:00Z",
  "secrets": {"status": "NOT_RUN", "control_version": "A_RENSEIGNER", "evidence_uri": "A_RENSEIGNER"},
  "misconfig": {"status": "NOT_RUN", "control_version": "A_RENSEIGNER", "evidence_uri": "A_RENSEIGNER"},
  "licenses": {"status": "NOT_RUN", "control_version": "A_RENSEIGNER", "evidence_uri": "A_RENSEIGNER"}
}
```

</details>

<a id="fichier-exceptions-json"></a>

<details>
<summary><strong>exceptions.json</strong> — Définir le catalogue d’exceptions, vide par défaut</summary>

**Chemin à créer :** `continuite-scan-support/config/exceptions.json`

```json
[]
```

</details>

<a id="fichier-policy-json"></a>

<details>
<summary><strong>policy.json</strong> — Fixer les seuils et les durées proposés</summary>

**Chemin à créer :** `continuite-scan-support/config/policy.json`

```json
{
  "schema": 1,
  "block_severities": ["High", "Critical"],
  "reject_unknown_severity": true,
  "max_db_age_hours": 24,
  "max_report_age_hours": 24,
  "max_exception_days": 7,
  "scan_timeout_seconds": 600
}
```

</details>

<a id="fichier-profile-astro-example-json"></a>

<details>
<summary><strong>profile-astro.example.json</strong> — Calibrer la couverture attendue d’une image frontend</summary>

**Chemin à créer :** `continuite-scan-support/config/profile-astro.example.json`

```json
{
  "schema": 1,
  "description": "Profil pédagogique Debian/Ubuntu + Astro livré dans image ; adapter runtime statique",
  "os_ids": ["debian", "ubuntu"],
  "os_versions": {"debian": [], "ubuntu": []},
  "min_packages": 10,
  "required_types": ["deb", "npm"],
  "required_packages": ["astro"]
}
```

</details>

<a id="fichier-profile-django-example-json"></a>

<details>
<summary><strong>profile-django.example.json</strong> — Calibrer la couverture attendue d’une image backend</summary>

**Chemin à créer :** `continuite-scan-support/config/profile-django.example.json`

```json
{
  "schema": 1,
  "description": "Profil pédagogique Debian/Ubuntu + Django ; qualifier sur votre image réelle",
  "os_ids": ["debian", "ubuntu"],
  "os_versions": {"debian": [], "ubuntu": []},
  "min_packages": 10,
  "required_types": ["deb", "python"],
  "required_packages": ["Django"]
}
```

</details>

<a id="fichier-tools-lock-json"></a>

<details>
<summary><strong>tools.lock.json</strong> — Fixer les versions, chemins et empreintes approuvées</summary>

**Chemin à créer :** `continuite-scan-support/config/tools.lock.json`

```json
{
  "schema": 1,
  "platform": "linux/amd64",
  "tools": {
    "trivy": {"version": "0.76.0", "path": "/opt/scan-tools/trivy/0.76.0/trivy", "sha256": "A_RENSEIGNER_APRES_VERIFICATION_ORIGINE"},
    "syft": {"version": "1.54.1", "path": "/opt/scan-tools/syft/1.54.1/syft", "sha256": "A_RENSEIGNER_APRES_VERIFICATION_ORIGINE"},
    "grype": {"version": "0.120.1", "path": "/opt/scan-tools/grype/0.120.1/grype", "sha256": "A_RENSEIGNER_APRES_VERIFICATION_ORIGINE"}
  }
}
```

</details>

<a id="fichier-trust-json"></a>

<details>
<summary><strong>trust.json</strong> — Exprimer l’autorisation protégée des outils et de l’agent</summary>

**Chemin à créer :** `continuite-scan-support/config/trust.json`

```json
{
  "schema": 1,
  "environment_trusted": false,
  "trivy_allowed": false,
  "grype_allowed": false,
  "decision_id": "A_RENSEIGNER_APRES_APPROBATION",
  "approved_by": "A_RENSEIGNER",
  "approved_at": "2000-01-01T00:00:00Z",
  "expires_at": "2000-01-02T00:00:00Z"
}
```

</details>

<a id="fichier-azure-pipelines-scan-example-yml"></a>

<details>
<summary><strong>azure-pipelines.scan.example.yml</strong> — Scanner puis revalider un candidat déjà construit</summary>

**Chemin à créer :** `continuite-scan-support/pipelines/azure-pipelines.scan.example.yml`

```yaml
# Modèle de qualification d'une image DÉJÀ construite en quarantaine.
# À placer dans un dépôt de sécurité protégé. Aucun déploiement n'est déclenché ici.
# Les noms de ressources ci-dessous sont des choix proposés à créer/adapter.
trigger: none
pr: none
parameters:
- name: candidateBuildId
  type: string
  default: ''
- name: imageRef
  type: string
  default: ''
variables:
- group: scan-continuity-protected
# Groupe protégé : SCANNER_MODE, SCANNER_POOL, PROMOTION_POOL,
# CANDIDATE_PIPELINE_ID (pipeline builder autorisé), SECURITY_CONFIG_DIR.
# Ajouter CANDIDATE_REPOSITORY_ID et CANDIDATE_SOURCE_REF (valeurs réellement autorisées).
# Interdire les remplacements à la mise en file et les modifications par l'application.
stages:
- stage: Scan
  displayName: Contrôle de vulnérabilités et preuves annexes
  jobs:
  - job: SecurityGate
    pool:
      name: $(SCANNER_POOL)
    workspace:
      clean: all
    steps:
    - checkout: self
      clean: true
      persistCredentials: false
    - task: Bash@3
      displayName: Authentifier le run producteur avant de télécharger ses preuves
      inputs:
        targetType: inline
        script: |
          set -euo pipefail
          umask 077
          python3 - <<'PY'
          import json, os, urllib.parse, urllib.request
          from pathlib import Path
          build_id = os.environ['CANDIDATE_BUILD_ID']
          if not build_id.isdigit():
              raise SystemExit('Build ID numérique obligatoire')
          url = (os.environ['COLLECTION_URI'].rstrip('/') + '/' +
                 urllib.parse.quote(os.environ['PROJECT_ID'], safe='') +
                 '/_apis/build/builds/' + build_id + '?api-version=7.1')
          req = urllib.request.Request(url, headers={'Authorization': 'Bearer ' + os.environ['AZURE_READ_TOKEN']})
          with urllib.request.urlopen(req, timeout=30) as r:
              build = json.load(r)
          expected = (str(build['definition']['id']) == os.environ['ALLOWED_PIPELINE_ID']
                      and str(build['repository']['id']) == os.environ['ALLOWED_REPOSITORY_ID']
                      and build['sourceBranch'] == os.environ['ALLOWED_SOURCE_REF']
                      and build['status'] == 'completed' and build['result'] == 'succeeded')
          if not expected:
              raise SystemExit('Producteur, source, branche ou résultat non autorisé')
          Path(os.environ['BUILD_METADATA']).write_text(json.dumps(build), encoding='utf-8')
          PY
      env:
        CANDIDATE_BUILD_ID: ${{ parameters.candidateBuildId }}
        COLLECTION_URI: $(System.CollectionUri)
        PROJECT_ID: $(System.TeamProjectId)
        ALLOWED_PIPELINE_ID: $(CANDIDATE_PIPELINE_ID)
        ALLOWED_REPOSITORY_ID: $(CANDIDATE_REPOSITORY_ID)
        ALLOWED_SOURCE_REF: $(CANDIDATE_SOURCE_REF)
        BUILD_METADATA: $(Pipeline.Workspace)/approved-build.json
        # Lecture Build uniquement ; ce token n'est PAS transmis à l'étape de scan.
        AZURE_READ_TOKEN: $(System.AccessToken)
    - task: DownloadPipelineArtifact@2
      displayName: Recevoir les preuves du build autorisé
      inputs:
        buildType: specific
        project: $(System.TeamProject)
        definition: $(CANDIDATE_PIPELINE_ID)
        buildVersionToDownload: specific
        pipelineId: ${{ parameters.candidateBuildId }}
        artifactName: candidate-security-input
        targetPath: $(Pipeline.Workspace)/candidate-input
    - task: Bash@3
      name: ScanGate
      displayName: Scanner dans un environnement sain avec configuration protégée
      inputs:
        targetType: inline
        script: |
          set -euo pipefail
          umask 077
          case "$SCANNER_MODE" in trivy|grype) ;; *) exit 30 ;; esac
          # Vérifier le lien vers le build avant de transmettre aux outils sans token Azure.
          python3 - <<'PY'
          import json, os
          from pathlib import Path
          c = json.loads((Path(os.environ['INPUT_DIR']) / 'controls.json').read_text())
          b = json.loads(Path(os.environ['BUILD_METADATA']).read_text())
          if (str(c['build_id']) != os.environ['CANDIDATE_BUILD_ID'] or
              c['image_ref'] != os.environ['IMAGE_REF'] or c['source_commit'] != b['sourceVersion']):
              raise SystemExit('Preuves différentes du build/commit/digest approuvés')
          PY
          # Pas de continueOnError, || true, ni réexécution avec l'autre scanner.
          bash continuite-scan-support/scripts/scan.sh \
            --mode "$SCANNER_MODE" --image "$IMAGE_REF" --out "$EVIDENCE_DIR" \
            --tools "$SECURITY_CONFIG_DIR/tools.lock.json" \
            --trust "$SECURITY_CONFIG_DIR/trust.json" \
            --db "$SECURITY_CONFIG_DIR/db-$SCANNER_MODE.json" \
            --policy "$SECURITY_CONFIG_DIR/policy.json" \
            --exceptions "$SECURITY_CONFIG_DIR/exceptions.json" \
            --profile "$SECURITY_CONFIG_DIR/profile.json" \
            --controls "$INPUT_DIR/controls.json"
      env:
        SCANNER_MODE: $(SCANNER_MODE)
        SECURITY_CONFIG_DIR: $(SECURITY_CONFIG_DIR)
        IMAGE_REF: ${{ parameters.imageRef }}
        CANDIDATE_BUILD_ID: ${{ parameters.candidateBuildId }}
        BUILD_METADATA: $(Pipeline.Workspace)/approved-build.json
        INPUT_DIR: $(Pipeline.Workspace)/candidate-input
        EVIDENCE_DIR: $(Pipeline.Workspace)/scan-evidence
        # Ce fichier ne donne qu'un droit de lecture sur le projet Harbor de quarantaine.
        DOCKER_CONFIG: /run/scan-registry-auth
    - task: PublishPipelineArtifact@1
      displayName: Conserver aussi les rejets et erreurs
      condition: always()
      inputs:
        targetPath: $(Pipeline.Workspace)/scan-evidence
        artifact: scan-evidence
- stage: VerifyForPromotion
  dependsOn: Scan
  condition: succeeded()
  displayName: Vérification indépendante avant toute promotion
  jobs:
  - deployment: VerifyProofs
    pool:
      name: $(PROMOTION_POOL)
    # Créer cette ressource avec approbations/checks HORS YAML ; adapter son nom.
    environment: scan-continuity-promotion
    strategy:
      runOnce:
        deploy:
          steps:
          - checkout: self
            clean: true
            persistCredentials: false
          - download: current
            artifact: scan-evidence
          - task: Bash@3
            displayName: Revalider fraîcheur, confiance, digest et preuves
            inputs:
              targetType: inline
              script: |
                set -euo pipefail
                python3 continuite-scan-support/scripts/gate.py verify \
                  --image "$IMAGE_REF" --out "$EVIDENCE_DIR" \
                  --trust "$SECURITY_CONFIG_DIR/trust.json" \
                  --policy "$SECURITY_CONFIG_DIR/policy.json" \
                  --exceptions "$SECURITY_CONFIG_DIR/exceptions.json"
            env:
              IMAGE_REF: ${{ parameters.imageRef }}
              EVIDENCE_DIR: $(Pipeline.Workspace)/scan-evidence
              SECURITY_CONFIG_DIR: $(SECURITY_CONFIG_DIR)
          # Raccord explicite : promotion Harbor puis MR GitLab via jobs protégés existants.
          # Le présent modèle s'arrête à la preuve vérifiée ; aucune permission de publication.
```

</details>

<a id="fichier-test-gate-py"></a>

<details>
<summary><strong>test_gate.py</strong> — Vérifier le contrat local sur 25 cas simulés</summary>

**Chemin à créer :** `continuite-scan-support/tests/test_gate.py`

```python
"""Tests de sûreté du contrat local ; aucun vrai scanner ni registre contacté.
Les digests des fixtures sont des SHA256 calculés sur des données synthétiques.
"""
import argparse
from datetime import timedelta
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("gate", ROOT / "scripts" / "gate.py")
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)


class GateTests(unittest.TestCase):
    def setUp(self):
        # Rester dans l'espace de travail autorisé, y compris sous Windows sandboxé.
        test_root = ROOT / ".test-work"
        test_root.mkdir(exist_ok=True)
        self.tmp = tempfile.TemporaryDirectory(dir=test_root)
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.image = "harbor.invalid/lab/demo@sha256:" + hashlib.sha256(b"fixture-not-an-oci-image").hexdigest()
        now = gate.NOW()
        self.built = now.isoformat()
        self.trust = {"environment_trusted": True, "trivy_allowed": True, "grype_allowed": True,
                      "decision_id": "LAB-ONLY", "approved_by": "fixture",
                      "approved_at": (now - timedelta(hours=1)).isoformat(),
                      "expires_at": (now + timedelta(hours=1)).isoformat()}
        self.policy = gate.read(ROOT / "config" / "policy.json")
        self.profile = {"min_packages": 1, "os_ids": ["debian"], "os_versions": {"debian": ["fixture"]},
                        "required_types": ["python"], "required_packages": ["Django"]}
        self.controls = {"image_ref": self.image, "build_id": "lab-build", "source_commit": "lab-only",
                         "checked_at": self.built}
        for name in ("secrets", "misconfig", "licenses"):
            self.controls[name] = {"status": "PASS", "control_version": "fixture", "evidence_uri": "urn:lab:fixture"}
        self.lock = {"tools": {}}
        for name, version in gate.VERSIONS.items():
            tool = self.root / name
            tool.write_bytes(("fixture-" + name).encode())
            self.lock["tools"][name] = {"path": str(tool), "sha256": gate.sha(tool), "version": version}
        cache = self.root / "cache"
        (cache / "db").mkdir(parents=True)
        binary = cache / "db" / "fixture.db"
        binary.write_bytes(b"fixture-db")
        meta = cache / "db" / "metadata.json"
        gate.write(meta, {"UpdatedAt": self.built})
        self.db = {"mode": "grype", "built_at": self.built, "cache_dir": str(cache), "source": "urn:lab:db",
                   "files": [{"path": str(p), "sha256": gate.sha(p)} for p in (binary, meta)]}
        self.sbom = {"source": {"type": "image", "metadata": {"manifestDigest": self.image.split("@")[1]}},
                     "distro": {"id": "debian", "versionID": "fixture"}, "artifacts": [{"name": "Django", "version": "fixture", "type": "python"}]}
        # Grype utilise source.target ; Syft utilise source.metadata (sources taguées).
        self.report = {"source": {"type": "image", "target": self.sbom["source"]["metadata"]}, "descriptor": {"db": {"status": {"built": self.built}}},
                       "matches": [], "ignoredMatches": []}
        self.trivy = {"SchemaVersion": 2, "Metadata": {"RepoDigests": [self.image], "OS": {"Family": "debian", "Name": "fixture"}},
                      "Results": [{"Type": "python-pkg", "Packages": [{"Name": "Django", "Version": "fixture"}],
                                   "Vulnerabilities": []}]}
        self.exceptions = []
        self.mode = "grype"

    def args(self):
        values = {"tools": self.lock, "trust": self.trust, "db": self.db, "policy": self.policy,
                  "controls": self.controls, "profile": self.profile, "exceptions": self.exceptions}
        result = {"image": self.image, "mode": self.mode, "out": str(self.root / "out")}
        for name, value in values.items():
            path = self.root / (name + ".json")
            gate.write(path, value)
            result[name] = str(path)
        return argparse.Namespace(**result)

    def run_scan(self, rc=0, exception=None):
        args = self.args()
        calls = []
        def fake(argv, **kwargs):
            calls.append(Path(argv[0]).name)
            if exception:
                raise exception
            payload = self.sbom if calls[-1] == "syft" else self.trivy if calls[-1] == "trivy" else self.report
            return subprocess.CompletedProcess(argv, rc, json.dumps(payload), "fixture log")
        with patch.object(gate.subprocess, "run", side_effect=fake), patch.object(gate.tempfile, "tempdir", str(self.root)):
            code = gate.scan(args)
        return code, calls, args

    def high(self):
        self.report["matches"] = [{"artifact": {"name": "Django", "version": "fixture"},
                                   "vulnerability": {"id": "LAB-ADVISORY", "namespace": "lab:python",
                                                     "severity": "High", "fix": {"versions": []}}}]

    def test_pass_grype_then_verify(self):
        code, calls, a = self.run_scan()
        self.assertEqual(code, 0)
        self.assertEqual(calls, ["syft", "grype"])
        self.assertEqual(gate.verify(a), 0)

    def test_pass_trivy_no_grype_execution(self):
        self.mode = "trivy"
        self.db["mode"] = "trivy"
        code, calls, _ = self.run_scan()
        self.assertEqual((code, calls), (0, ["trivy"]))

    def test_rejected_unfixed_high_never_falls_back(self):
        self.high()
        code, calls, _ = self.run_scan()
        self.assertEqual(code, 10)
        self.assertEqual(calls, ["syft", "grype"])

    def test_trust_denied_before_any_execution(self):
        self.trust["grype_allowed"] = False
        code, calls, _ = self.run_scan()
        self.assertEqual((code, calls), (30, []))

    def test_tool_modified_before_execution(self):
        Path(self.lock["tools"]["syft"]["path"]).write_bytes(b"changed harmless fixture")
        code, calls, _ = self.run_scan()
        self.assertEqual((code, calls), (30, []))

    def test_stale_db_before_execution(self):
        self.db["built_at"] = "2000-01-01T00:00:00Z"
        code, calls, _ = self.run_scan()
        self.assertEqual((code, calls), (20, []))

    def test_modified_db_before_execution(self):
        Path(self.db["files"][0]["path"]).write_bytes(b"changed db")
        code, calls, _ = self.run_scan()
        self.assertEqual((code, calls), (20, []))

    def test_missing_control_before_execution(self):
        self.controls["secrets"]["status"] = "NOT_RUN"
        code, calls, _ = self.run_scan()
        self.assertEqual((code, calls), (20, []))

    def test_wrong_sbom_digest_blocks_before_grype(self):
        self.sbom["source"]["metadata"]["manifestDigest"] = "sha256:" + hashlib.sha256(b"other").hexdigest()
        code, calls, _ = self.run_scan()
        self.assertEqual((code, calls), (20, ["syft"]))

    def test_empty_sbom_blocks_before_grype(self):
        self.sbom["artifacts"] = []
        code, calls, _ = self.run_scan()
        self.assertEqual((code, calls), (20, ["syft"]))

    def test_incomplete_sbom_blocks_before_grype(self):
        self.profile["required_types"] = ["python", "npm"]
        code, calls, _ = self.run_scan()
        self.assertEqual((code, calls), (20, ["syft"]))

    def test_missing_os_version_blocks(self):
        del self.sbom["distro"]["versionID"]
        code, calls, _ = self.run_scan()
        self.assertEqual((code, calls), (20, ["syft"]))

    def test_trivy_modified_finding_blocks(self):
        self.mode = "trivy"
        self.db["mode"] = "trivy"
        self.trivy["Results"][0]["ExperimentalModifiedFindings"] = [{"fixture": True}]
        code, calls, _ = self.run_scan()
        self.assertEqual((code, calls), (20, ["trivy"]))

    def test_native_error_never_falls_back(self):
        code, calls, _ = self.run_scan(rc=1)
        self.assertEqual((code, calls), (20, ["syft"]))

    def test_timeout_blocks(self):
        code, calls, _ = self.run_scan(exception=subprocess.TimeoutExpired("syft", 1))
        self.assertEqual((code, calls), (20, ["syft"]))

    def test_report_missing_matches_is_error(self):
        del self.report["matches"]
        code, _, _ = self.run_scan()
        self.assertEqual(code, 20)

    def test_wrong_real_db_built_is_error(self):
        self.report["descriptor"]["db"]["status"]["built"] = "2000-01-01T00:00:00Z"
        code, _, _ = self.run_scan()
        self.assertEqual(code, 20)

    def test_wrong_report_source_is_error(self):
        self.report["source"] = {"type": "directory", "target": "fixture"}
        code, _, _ = self.run_scan()
        self.assertEqual(code, 20)

    def test_sbom_file_source_matches_exact_path(self):
        self.report["source"] = {"type": "sbom-file", "target": str(self.root / "out" / "sbom.syft.json")}
        code, _, _ = self.run_scan()
        self.assertEqual(code, 0)

    def test_unknown_severity_rejects(self):
        self.high()
        self.report["matches"][0]["vulnerability"]["severity"] = "Unknown"
        code, _, _ = self.run_scan()
        self.assertEqual(code, 10)

    def test_expired_exception_rejects(self):
        self.high()
        now = gate.NOW()
        self.exceptions = [{"image_digest": self.image.split("@")[1], "package": "Django", "version": "fixture",
                            "id": "LAB-ADVISORY", "namespace": "lab:python", "issue": "LAB-1", "owner": "lab",
                            "approved_by": "lab", "reason": "fixture", "approved_at": (now - timedelta(days=2)).isoformat(),
                            "expires_at": (now - timedelta(days=1)).isoformat()}]
        code, _, _ = self.run_scan()
        self.assertEqual(code, 10)

    def test_report_tampered_after_scan(self):
        _, _, a = self.run_scan()
        (Path(a.out) / "report.json").write_text("{}", encoding="utf-8")
        self.assertEqual(gate.verify(a), 20)

    def test_revoked_trust_before_promotion(self):
        _, _, a = self.run_scan()
        self.trust["grype_allowed"] = False
        gate.write(a.trust, self.trust)
        self.assertEqual(gate.verify(a), 30)

    def test_changed_exceptions_before_promotion(self):
        _, _, a = self.run_scan()
        gate.write(a.exceptions, [{"revoked_catalog": True}])
        self.assertEqual(gate.verify(a), 20)

    def test_invalid_image_cannot_pass(self):
        self.image = "harbor.invalid/lab/demo:latest"
        code, calls, _ = self.run_scan()
        self.assertEqual((code, calls), (20, []))


if __name__ == "__main__":
    unittest.main()
```

</details>

</details>
