---
title:  Des API à Control-M Automation API
description: >-
  Documentation pédagogique et progressive : des fondamentaux des API
  jusqu'à l'automatisation de l'administration Control-M 9.0.22 en Python.
created: "2026-09-10"
# updated: "2026-09-03"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"


---


# Des API à Control-M Automation API

> Documentation complète, pédagogique et progressive. Aucune connaissance
>
> préalable des API REST n'est requise.

## Sommaire
- [Des API à Control-M Automation API](#des-api-à-control-m-automation-api)

### PARTIE I — Comprendre les API

- [Comprendre ce qu'est une API](#comprendre-ce-quest-une-api)
- [HTTP et HTTPS](#http-et-https)
- [Anatomie d'une requête HTTP](#anatomie-dune-requête-http)
- [Réponse HTTP et codes de statut](#réponse-http-et-codes-de-statut)
- [Comprendre et manipuler le JSON](#comprendre-et-manipuler-le-json)

### PARTIE II — Environnement de travail

- [Installer Python et VS Code](#installer-python-et-vs-code)
- [Créer un projet et un environnement virtuel](#créer-un-projet-et-un-environnement-virtuel)

### PARTIE III — Postman et curl

- [Postman](#postman)
- [curl](#curl)

### PARTIE IV — Première API réelle

- [Première API réelle — l'API Adresse](#première-api-réelle-lapi-adresse)

### PARTIE V — Python et requests

- [Maîtriser requests](#maîtriser-requests)
- [Gérer les erreurs et les relances](#gérer-les-erreurs-et-les-relances)
- [Construire un client API réutilisable](#construire-un-client-api-réutilisable)

### PARTIE VI — Authentification et sécurité

- [Authentification](#authentification)
- [TLS et certificats](#tls-et-certificats)
- [Protéger les secrets](#protéger-les-secrets)

### PARTIE VII — Control-M

- [Découvrir Control-M](#découvrir-control-m)
- [PostgreSQL dans l'architecture Control-M](#postgresql-dans-larchitecture-control-m)
- [Control-M Automation API](#control-m-automation-api)
- [Tester Control-M avec Postman](#tester-control-m-avec-postman)
- [ControlMClient — le client Python](#controlmclient-le-client-python)
- [Créer et déployer un premier job](#créer-et-déployer-un-premier-job)
- [Créer une chaîne de jobs](#créer-une-chaîne-de-jobs)

### PARTIE VIII — Administration par API

- [Automatiser l'administration Control-M](#automatiser-ladministration-control-m)
- [La boîte à outils de scripts](#la-boîte-à-outils-de-scripts)

### PARTIE IX — Troubleshooting

- [Arbres de diagnostic](#arbres-de-diagnostic)
- [Le rapport quotidien d'exploitation](#le-rapport-quotidien-dexploitation)

### PARTIE X — Industrialisation

- [Administration as Code et Git](#administration-as-code-et-git)
- [CI/CD](#cicd)

### PARTIE XI — Projet final

- [Le projet final](#le-projet-final)
- [Tester le code Python](#tester-le-code-python)

### PARTIE XII — Exercices

- [Exercices — niveau débutant](#exercices-niveau-débutant)
- [Exercices — niveau intermédiaire](#exercices-niveau-intermédiaire)
- [Exercices — niveau avancé Control-M](#exercices-niveau-avancé-control-m)

### ANNEXES

- [Référence des endpoints](#référence-des-endpoints)
- [Conventions de schématisation](#conventions-de-schématisation)

# Des API à Control-M Automation API

*Parcours complet, du premier appel HTTP jusqu'à l'automatisation industrielle de l'administration Control-M en Python.*

Cette documentation part de zéro : elle ne suppose aucune connaissance des API REST. Elle se termine par une boîte à outils Python réellement utilisable pour exploiter, administrer et diagnostiquer un environnement **Control-M 9.0.22 self-hosted**.

## À qui s'adresse ce document

Débutant complet en API, administrateur système, administrateur Control-M, exploitant, ingénieur de production, ingénieur DevOps, développeur Python, ingénieur d'intégration, ou toute personne préparant un entretien technique sur ces sujets.

## Le fil conducteur

```text
Comprendre ce qu'est une API
        │
        ▼
Comprendre HTTP / HTTPS
        │
        ▼
Comprendre requêtes et réponses
        │
        ▼
Comprendre JSON
        │
        ▼
Tester une API publique
        │
        ▼
Postman  ──►  curl  ──►  Python
        │
        ▼
Maîtriser requests
        │
        ▼
Authentification, TLS, secrets
        │
        ▼
Gestion des erreurs
        │
        ▼
Construire un client API Python
        │
        ▼
Découvrir Control-M
        │
        ▼
Control-M Automation API
        │
        ▼
Tester Control-M avec Postman
        │
        ▼
Interagir avec Control-M en Python
        │
        ▼
Créer des jobs, créer des chaînes
        │
        ▼
Administrer Control-M par API
        │
        ▼
Automatiser les diagnostics
        │
        ▼
Git / Jobs as Code
        │
        ▼
CI/CD
        │
        ▼
Administration industrialisée
```

| Étape | Ce que vous saurez faire à la fin |
| ----- | -------------------------------- |
| Fondamentaux | Lire une doc d'API, construire une requête, interpréter une réponse |
| Environnement | Installer Python, VS Code, un venv, structurer un projet |
| Outils | Tester n'importe quelle API avec Postman et `curl` |
| Python | Écrire du code `requests` robuste : timeouts, erreurs, sessions |
| Sécurité | Gérer tokens, TLS, secrets hors du code |
| Control-M | Reproduire par API ce que vous faites dans Control-M Web |
| Industrialisation | Versionner les jobs, déployer via CI/CD, produire un rapport quotidien |

## Comment lire cette documentation

Chaque notion importante suit la même structure : définition, analogie, raison d'être, fonctionnement, exemple minimal, exemple réel, test Postman, commande `curl`, code Python commenté, résultat attendu, erreurs possibles, troubleshooting, bonne pratique, exercice.

Vous pouvez sauter les rubriques que vous maîtrisez déjà. La progression reste cohérente si vous démarrez directement à la partie Control-M, à condition d'être à l'aise avec `requests`.

:::caution[Règle de vérification]
Aucun endpoint, aucune sous-commande `ctm`, aucune propriété JSON n'est inventé dans ce document. Tout ce qui est présenté provient de la documentation BMC de l'Automation API. Lorsqu'un élément dépend de votre version ou de votre fix pack, la page l'indique explicitement et vous renvoie au Swagger de votre instance : `https://<votre-endpoint>:8443/automation-api`.
:::


---

# PARTIE I — Comprendre les API


## Comprendre ce qu'est une API

*Définition, analogie, architecture client / serveur et vocabulaire de base des API REST.*

### Définition

Une **API** (*Application Programming Interface*) est un point d'entrée qui permet à un programme de demander quelque chose à un autre programme, sans connaître son fonctionnement interne.

Une **Web API** est une API accessible par le réseau, via HTTP.

Une **API REST** est une Web API qui respecte un style d'architecture : on manipule des **ressources** identifiées par des URL, avec un petit nombre de verbes standards (GET, POST, PUT, PATCH, DELETE).

### Analogie

```text
Restaurant                    API

Client                        Application cliente
   │                                 │
   ▼                                 ▼
Serveur                        Requête HTTP
   │                                 │
   ▼                                 ▼
Cuisine                        API / Backend
   │                                 │
   ▼                                 ▼
Préparation                    Traitement
   │                                 │
   ▼                                 ▼
Serveur                        Réponse HTTP
   │                                 │
   ▼                                 ▼
Client                         Application
```

Vous ne rentrez pas en cuisine. Vous lisez une carte (la documentation), vous passez une commande dans un format attendu (la requête), et vous recevez un plat ou une explication de refus (la réponse).

**Limites de l'analogie.** Un serveur de restaurant garde en mémoire votre table et votre commande. Une API REST, elle, est en principe *sans état* : chaque requête doit contenir tout ce qui est nécessaire pour être traitée, y compris l'authentification. C'est pour cela que vous renverrez votre token à chaque appel, et pas seulement au premier.

### Pourquoi les API existent

- Pour **automatiser** ce qu'un humain ferait à la main dans une interface graphique.
- Pour **intégrer** des applications entre elles sans partager leurs bases de données.
- Pour **découpler** : le client et le serveur peuvent évoluer séparément tant que le contrat est respecté.
- Pour **tracer** : chaque appel est authentifié et auditable.

C'est exactement ce qui rend Control-M Automation API intéressante : tout ce qu'un administrateur fait dans Control-M Web, un script peut le faire de façon reproductible, versionnable et planifiable.

### Architecture d'une API simple

```text
┌─────────────────────┐
│ Client              │
│                     │
│ Python / Postman    │
└──────────┬──────────┘
           │
           │ HTTPS
           ▼
┌─────────────────────┐
│ API REST            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Backend             │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Base de données     │
└─────────────────────┘
```

| Élément | Rôle |
| ------- | ---- |
| Client | Émet la requête : navigateur, Postman, `curl`, script Python, pipeline CI |
| API REST | Expose les opérations disponibles, valide les entrées, authentifie l'appelant |
| Backend | Contient la logique métier réelle |
| Base de données | Stocke et restitue les informations |

Le chemin de l'information, étape par étape : le client construit une requête HTTP et l'envoie en HTTPS ; l'API vérifie l'authentification et la validité des paramètres ; elle délègue le traitement au backend ; le backend lit ou écrit en base ; la réponse remonte en sens inverse, sous forme d'un statut HTTP accompagné le plus souvent d'un corps JSON.

### Communication client / API

```text
┌──────────────┐       Requête HTTP        ┌───────────────┐
│              │ ────────────────────────► │               │
│    Client    │                           │   API REST    │
│              │ ◄──────────────────────── │               │
└──────────────┘       Réponse HTTP        └───────┬───────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │ Backend /       │
                                          │ Base de données │
                                          └─────────────────┘
```

```text
Client
  = Postman, navigateur, curl, application Python...

Requête
  = GET, POST, PUT, PATCH, DELETE...

API REST
  = point d'entrée permettant au client de communiquer
    avec l'application.

Backend
  = logique applicative.

Base de données
  = stockage des informations.

Réponse
  = statut HTTP + headers + données, souvent en JSON.
```

### Vocabulaire indispensable

| Terme | Signification |
| ----- | ------------- |
| Client | Le programme qui appelle |
| Serveur | La machine qui héberge l'API |
| Frontend | L'interface visible par l'utilisateur |
| Backend | La partie qui traite et stocke |
| Protocole | Les règles d'échange (ici HTTP / HTTPS) |
| Ressource | Un objet manipulable : un job, un agent, un utilisateur |
| Endpoint | L'URL complète qui expose une opération sur une ressource |
| Route / path | La partie chemin de l'URL, par exemple `/run/jobs/status` |
| Requête | Ce que le client envoie |
| Réponse | Ce que le serveur renvoie : statut + headers + corps |
| JSON | Format d'échange de données, lisible et structuré |
| XML | Format plus ancien, encore présent dans des systèmes hérités |

:::note[Ressource ou endpoint ?]
La ressource est le concept (« un job »). L'endpoint est l'adresse concrète qui permet d'agir dessus (`GET /run/job/{jobId}/status`). Une même ressource peut être exposée par plusieurs endpoints.
:::

### Lire une documentation d'API

Toute documentation d'API sérieuse vous donne, pour chaque opération, les mêmes six informations. Prenez l'habitude de les chercher dans cet ordre :

```text
1. Méthode HTTP      → GET, POST, PUT, PATCH, DELETE
2. Chemin            → /run/job/{jobId}/hold
3. Authentification  → header attendu, type de token
4. Entrées           → path parameters, query parameters, body
5. Sorties           → format de la réponse, champs renvoyés
6. Codes HTTP        → succès attendus et erreurs possibles
```

Si l'une de ces six informations manque, ne devinez pas : cherchez dans le Swagger de l'instance. C'est vrai pour n'importe quelle API, et c'est une règle absolue pour Control-M.

### Bonne pratique

Avant d'écrire la moindre ligne de Python, reproduisez toujours l'appel dans Postman ou avec `curl`. Vous saurez ainsi si un échec vient de votre code ou de l'API elle-même. Ce réflexe fait gagner un temps considérable en production.

### Exercice

Sans écrire de code, décrivez sur papier ce que devrait contenir la requête permettant de « récupérer la liste des jobs en échec ». Précisez la méthode, l'idée du chemin, ce qui devrait passer en paramètre, et ce que vous attendez en réponse. Vous comparerez votre réponse au chapitre Control-M.

## HTTP et HTTPS

*Méthodes HTTP, idempotence, différence entre HTTP et HTTPS.*

### Définition

**HTTP** (*HyperText Transfer Protocol*) est le protocole qui définit comment un client formule une demande et comment un serveur y répond. **HTTPS** est le même protocole, transporté dans un tunnel chiffré TLS.

### Les méthodes HTTP

| Méthode | Signification |
| ------- | ------------- |
| GET | Consulter |
| POST | Créer, ou déclencher une action |
| PUT | Remplacer |
| PATCH | Modifier partiellement |
| DELETE | Supprimer |

#### Ce que chaque méthode implique

**GET** ne doit jamais modifier l'état du serveur. Un GET peut être rejoué, mis en cache, relancé automatiquement sans risque.

**POST** crée une ressource ou déclenche un traitement. Rejouer un POST peut créer deux fois la même chose. Dans Control-M, la plupart des actions d'exploitation (`hold`, `free`, `rerun`, `kill`, `order`) sont des POST : ce sont des ordres, pas des lectures.

**PUT** remplace intégralement une ressource. Si vous omettez un champ, il est perdu.

**PATCH** ne modifie que les champs fournis.

**DELETE** supprime.

#### Idempotence

Une opération est **idempotente** si l'exécuter une fois ou dix fois produit le même état final.

```text
GET     → idempotent
PUT     → idempotent
DELETE  → idempotent
PATCH   → dépend de l'implémentation
POST    → généralement NON idempotent
```

Cette notion n'est pas académique : elle détermine ce que vous avez le droit de rejouer automatiquement en cas d'erreur réseau. Relancer un GET après un timeout est sans danger. Relancer un `POST /run/order` après un timeout peut ordonnancer deux fois le même Folder.

:::caution
Avant d'implémenter un retry automatique, demandez-vous toujours : « si la requête a en réalité abouti côté serveur mais que la réponse s'est perdue, que se passe-t-il si je la rejoue ? »
:::

### Ressource, paramètre, représentation, statut

- **Ressource** : l'objet manipulé. Un job, un agent, un event.
- **Paramètre** : ce qui précise la demande. Soit dans le chemin, soit dans la query string, soit dans le corps.
- **Représentation** : la forme sous laquelle la ressource circule. Presque toujours du JSON aujourd'hui.
- **Statut** : le code numérique qui résume l'issue de la requête.

### HTTP contre HTTPS

```text
HTTP
Client ──────────────────────────────► Serveur
        données en clair
        lisibles et modifiables
        par tout équipement traversé


HTTPS
Client ══════════════════════════════► Serveur
        tunnel TLS
        chiffré, intègre,
        identité du serveur vérifiée
```

HTTPS apporte trois garanties distinctes qu'il faut savoir nommer séparément :

| Garantie | Ce qu'elle empêche |
| -------- | ------------------ |
| Confidentialité | Qu'un tiers lise votre token ou vos données |
| Intégrité | Qu'un tiers modifie la requête ou la réponse en transit |
| Authenticité | Que vous parliez à un serveur qui se fait passer pour le vôtre |

La troisième est celle qu'on sacrifie sans y penser en désactivant la vérification du certificat. Elle est traitée en détail dans le chapitre TLS.

### Un échange complet

```text
Utilisateur
    │
    ▼
Script Python
    │
    │  GET /api/users/42
    │  Authorization: Bearer TOKEN
    ▼
API REST
    │
    ▼
Vérification du token
    │
    ├── Token invalide ──────────► HTTP 401
    │
    └── Token valide
            │
            ▼
       Traitement
            │
            ▼
     Base de données
            │
            ▼
       Réponse JSON
            │
            ▼
        HTTP 200
```

| Étape | Ce qui se passe |
| ----- | --------------- |
| Script Python | Construit la requête et l'envoie |
| Vérification du token | L'API décide si l'appelant est authentifié et autorisé |
| Traitement | La logique métier s'exécute |
| Base de données | Les données sont lues ou écrites |
| Réponse | Statut, headers et corps repartent vers le client |

Retenez que l'authentification est vérifiée **avant** le traitement. Un 401 ne dit rien sur la validité de votre requête : il dit seulement qu'on ne vous a pas laissé entrer.

### Erreurs fréquentes

| Symptôme | Cause fréquente |
| -------- | --------------- |
| `ConnectionError` | Mauvais hôte, mauvais port, pare-feu, service arrêté |
| Réponse HTML au lieu de JSON | Vous avez tapé une URL d'interface web, pas un endpoint d'API |
| 405 Method Not Allowed | Bon chemin, mauvaise méthode : GET là où POST est attendu |
| Timeout sans message | Aucun timeout défini côté client, la requête attend indéfiniment |

### Bonne pratique

En production, n'utilisez jamais HTTP en clair pour transporter un token. Un token intercepté est un accès complet à votre ordonnanceur.

### Exercice

Pour chacune de ces opérations, indiquez la méthode HTTP attendue et si elle est idempotente : consulter le statut d'un job ; mettre un job en Hold ; supprimer un event ; relancer un job.

## Anatomie d'une requête HTTP

*Méthode, path, headers, query parameters, path parameters et body.*

### Une requête complète

```http
GET /api/users/42 HTTP/1.1
Host: api.exemple.fr
Authorization: Bearer TOKEN
Accept: application/json
```

| Élément | Rôle |
| ------- | ---- |
| `GET` | La méthode : l'action demandée |
| `/api/users/42` | Le path : la ressource visée |
| `HTTP/1.1` | La version du protocole |
| `Host` | Le serveur visé |
| `Authorization` | Le header d'authentification |
| `Accept` | Le format de réponse souhaité |

L'ensemble « schéma + host + path + query string » forme l'**endpoint** :

```text
https://api.exemple.fr/api/users/42?verbose=true
└─┬──┘ └──────┬──────┘└─────┬─────┘└─────┬─────┘
schéma      host          path      query string
```

### Les headers

Un header est une paire `Nom: valeur` qui accompagne la requête sans faire partie des données.

| Header | Usage |
| ------ | ----- |
| `Authorization` | Transporte le token (`Bearer <token>`) |
| `x-api-key` | Transporte une clé d'API (format utilisé par Control-M pour les API tokens) |
| `Content-Type` | Décrit le format de ce que **vous envoyez** |
| `Accept` | Décrit le format que vous **souhaitez recevoir** |

:::caution
`Content-Type` et `Accept` sont souvent confondus. `Content-Type: application/json` signifie « mon corps de requête est du JSON ». Si vous envoyez un corps JSON sans ce header, beaucoup d'API répondent **415 Unsupported Media Type**.
:::

### Query parameters

Ils filtrent ou paramètrent une consultation. Ils se placent après le `?`, séparés par des `&`.

```text
GET /search?q=Paris&limit=10
```

```text
q=Paris
limit=10
```

Ils sont facultatifs par nature : l'endpoint reste valide sans eux, avec des valeurs par défaut.

Exemple réel côté Control-M, pour ne récupérer que les jobs terminés en erreur :

```text
GET /run/jobs/status?status=Ended%20Not%20OK&limit=1000
```

Notez `%20` : les espaces doivent être encodés dans une URL. En Python, `requests` le fait pour vous dès que vous passez par `params=`.

### Path parameters

Ils identifient **quelle** ressource précise est visée. Ils font partie du chemin.

```text
GET /users/42
```

```text
42 = identifiant utilisateur
```

Ils ne sont jamais facultatifs : sans eux, le chemin ne désigne rien.

```text
Path parameter                Query parameter
──────────────                ───────────────
identifie une ressource       filtre une collection
obligatoire                   optionnel
/run/job/controlm:00fhb/log   /run/jobs/status?limit=50
```

### Le body

Le corps transporte les données envoyées lors d'une création ou d'une action paramétrée.

```json
{
  "name": "Alice",
  "email": "alice@example.com"
}
```

Trois éléments vont toujours ensemble : la méthode (POST, PUT, PATCH), le header `Content-Type: application/json` et le corps JSON lui-même.

Un GET ne porte pas de corps. Si vous avez besoin de filtrer une lecture, cela passe par la query string.

### Test avec Postman

Créez une requête GET, saisissez l'URL, ajoutez vos paramètres dans l'onglet **Params**, vos headers dans l'onglet **Headers**, puis cliquez sur **Send**. Postman construit l'URL encodée pour vous et l'affiche en haut de la fenêtre : c'est un excellent moyen de vérifier votre encodage.

### Test avec curl

```bash
curl -H "Accept: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     "https://api.exemple.fr/api/users/42"
```

### Exemple Python

```python
import requests

response = requests.get(
    "https://api.exemple.fr/api/users/42",
    headers={
        "Accept": "application/json",
        "Authorization": f"Bearer {token}",
    },
    # params construit la query string et gère l'encodage à notre place,
    # ce qui évite les erreurs sur les espaces et les caractères accentués.
    params={"verbose": "true"},
    timeout=10,
)
```

### Erreurs fréquentes

| Erreur | Cause |
| ------ | ----- |
| 401 | Header d'authentification absent, mal orthographié, ou token expiré |
| 404 | Path parameter inexistant, ou faute de frappe dans le chemin |
| 415 | Corps JSON envoyé sans `Content-Type: application/json` |
| 400 | Paramètre attendu manquant ou mal formé |

### Bonne pratique

Ne concaténez jamais vos paramètres à la main dans une f-string. Passez toujours par `params=` : l'encodage des espaces, des accents et des caractères spéciaux est une source d'erreurs difficile à diagnostiquer.

### Exercice

Écrivez la requête `curl` permettant de rechercher les jobs dont le nom commence par `FIN` et dont le statut est `Ended Not OK`, en supposant un endpoint `/run/jobs/status` et un token en `x-api-key`. Vérifiez ensuite votre encodage dans Postman.

## Réponse HTTP et codes de statut

*Structure d'une réponse, familles de codes, et lecture des erreurs.*

### Anatomie d'une réponse

```text
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "id": 42,
  "name": "Alice"
}
```

Une réponse se lit toujours dans cet ordre :

```text
1. Statut    → l'appel a-t-il abouti ?
2. Headers   → sous quelle forme sont les données ?
3. Body      → les données elles-mêmes
```

Beaucoup de bugs viennent de l'inversion de cet ordre : on parse le corps avant d'avoir regardé le statut. Un corps peut très bien contenir un message d'erreur JSON parfaitement valide.

### Les familles de codes

```text
2xx → succès
3xx → redirection
4xx → problème côté client
5xx → problème côté serveur
```

Cette distinction commande votre stratégie de traitement : un 4xx signifie que **votre requête** doit changer ; un 5xx signifie que votre requête était peut-être correcte et que le problème est ailleurs.

### Codes à connaître

| Code | Signification |
| ---- | ------------- |
| 200 | OK |
| 201 | Created |
| 202 | Accepted |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 405 | Method Not Allowed |
| 409 | Conflict |
| 415 | Unsupported Media Type |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 502 | Bad Gateway |
| 503 | Service Unavailable |
| 504 | Gateway Timeout |

#### Les distinctions qui comptent

**401 contre 403.** 401 signifie « je ne sais pas qui vous êtes » : token absent, invalide ou expiré. 403 signifie « je sais qui vous êtes, et vous n'avez pas le droit ». Sur Control-M, un 403 renvoie donc vers les autorisations du rôle de votre utilisateur, pas vers votre token.

**400 contre 422.** 400 signale une requête malformée (JSON invalide, paramètre manquant). 422 signale une requête bien formée mais métier-invalide.

**202 contre 200.** 202 signifie que la demande est acceptée mais pas terminée. C'est le cas de plusieurs opérations Control-M asynchrones qui renvoient un identifiant à interroger ensuite.

**429.** L'API vous demande de ralentir. Respectez le header `Retry-After` s'il est présent.

### Comportement de Control-M Automation API

L'Automation API renvoie **200** en cas de succès. En cas d'échec, les codes documentés par BMC sont les suivants :

| Code | Signification côté Control-M |
| ---- | ---------------------------- |
| 400 | Erreurs dans les données de la requête |
| 403 | L'utilisateur n'est pas autorisé pour cette action ou cette ressource |
| 404 | L'élément demandé est introuvable |
| 405 | Méthode REST non reconnue |
| 500 | Erreur interne du serveur |
| 503 | Service indisponible après un redémarrage du serveur |

En cas d'erreur, le corps renvoyé contient un tableau `errors`, dont chaque entrée suit ce format :

```json
{
  "message": "texte de l'erreur",
  "id": 0,
  "item": "élément concerné",
  "file": "fichier",
  "line": 0,
  "col": 0
}
```

Les champs `file`, `line` et `col` sont particulièrement utiles lors d'un `build` ou d'un `deploy` : ils pointent la ligne exacte du fichier JSON de définition qui pose problème.

:::tip
Le 503 « service indisponible après redémarrage » est spécifiquement mentionné par BMC. Si vous automatisez un déploiement juste après un redémarrage de l'Enterprise Manager, prévoyez une phase d'attente avec retry plutôt que d'échouer immédiatement.
:::

### Lire une erreur méthodiquement

```text
RÉPONSE INATTENDUE
       │
       ▼
Quel est le code ?
       │
   ┌───┴────────────────┐
   │                    │
  4xx                  5xx
   │                    │
   ▼                    ▼
Ma requête           Le serveur
est en cause         est en cause
   │                    │
   ├── 401 → token      ├── 500 → logs serveur
   ├── 403 → droits     ├── 502 → reverse proxy
   ├── 404 → chemin     ├── 503 → service arrêté
   ├── 405 → méthode    └── 504 → timeout amont
   ├── 415 → Content-Type
   └── 400 → payload
```

### Exemple Python

```python
response = requests.get(url, headers=headers, timeout=10)

# On regarde TOUJOURS le statut avant de toucher au corps :
# un corps parfaitement parsable peut décrire une erreur.
if response.status_code == 200:
    data = response.json()
else:
    # Le corps d'erreur reste souvent du JSON exploitable,
    # mais pas toujours : on se protège du cas contraire.
    try:
        detail = response.json()
    except ValueError:
        detail = response.text
    print(f"Échec {response.status_code} : {detail}")
```

### Bonne pratique

Journalisez systématiquement le code de statut avec l'URL appelée. Sans cela, un incident de production se diagnostique à l'aveugle. Ne journalisez jamais le token qui accompagnait l'appel.

### Exercice

Vous appelez un endpoint Control-M et recevez un 403. Listez dans l'ordre les trois vérifications à mener. Faites de même pour un 404 et pour un 503.

## Comprendre et manipuler le JSON

*Types, objets imbriqués, listes et parcours en Python.*

### Définition

**JSON** (*JavaScript Object Notation*) est un format texte de représentation de données structurées. C'est le format d'échange dominant des API REST, et celui utilisé par Control-M pour définir les jobs (*Jobs as Code*).

### Les types de base

```json
{
  "name": "Alice",
  "age": 30,
  "active": true
}
```

| Type JSON | Exemple | Équivalent Python |
| --------- | ------- | ----------------- |
| string | `"Alice"` | `str` |
| integer | `30` | `int` |
| float | `1.5` | `float` |
| boolean | `true` / `false` | `True` / `False` |
| null | `null` | `None` |
| objet | `{ ... }` | `dict` |
| tableau | `[ ... ]` | `list` |

:::caution
En JSON, les booléens s'écrivent en minuscules (`true`, `false`) et les chaînes utilisent obligatoirement des guillemets doubles. `True` ou `'Alice'` sont du Python, pas du JSON. C'est la cause numéro un des erreurs 400 lors des premiers POST.
:::

### Objets imbriqués

```json
{
  "user": {
    "name": "Alice",
    "address": {
      "city": "Paris"
    }
  }
}
```

En Python, on descend niveau par niveau :

```python
ville = data["user"]["address"]["city"]
```

Cette écriture lève une `KeyError` dès qu'un niveau manque. Pour des données venant d'une API, préférez :

```python
# .get() renvoie une valeur par défaut au lieu de lever une exception :
# indispensable quand un champ est optionnel selon la version de l'API.
ville = data.get("user", {}).get("address", {}).get("city")
```

### Listes

```json
{
  "users": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ]
}
```

```python
for user in data["users"]:
    print(user["id"], user["name"])
```

Une liste peut être vide. Une API qui ne trouve aucun résultat renvoie souvent `[]` avec un code 200, et non un 404. Votre code doit distinguer « aucun résultat » de « erreur ».

### Cas réel : une réponse Control-M

La réponse de `run jobs:status::get` a la forme suivante pour chaque job :

```json
{
  "jobId": "LocalControlM:00008",
  "folderId": "LocalControlM:00007",
  "numberOfRuns": 0,
  "name": "job1",
  "folder": "SanityCommandOk",
  "type": "Command",
  "status": "Wait Condition",
  "held": true,
  "deleted": false,
  "cyclic": "false",
  "startTime": "20231126065554",
  "endTime": "20231126065555",
  "orderDate": "231125",
  "ctm": "LocalControlM",
  "host": "",
  "application": "OsApp",
  "outputURI": "Job did not run, it has no output",
  "logURI": "http://localhost:32080/run/job/LocalControlM:00008/log"
}
```

Deux observations à retenir dès maintenant.

D'abord, `held` est un booléen JSON alors que `cyclic` est une chaîne `"false"`. Ce genre d'hétérogénéité existe dans les API réelles ; ne supposez jamais un type, vérifiez-le sur votre instance.

Ensuite, `outputURI` contient parfois un message en clair (« Job did not run… ») plutôt qu'une URL. Un code qui ferait `requests.get(job["outputURI"])` sans contrôle échouerait de façon obscure.

```python
output_uri = job.get("outputURI", "")

# L'API renvoie ici soit une URL, soit une phrase explicative.
# On ne tente l'appel que si c'est réellement une URL.
if output_uri.startswith("http"):
    ...
```

### Parcourir et filtrer

```python
# Extraire les noms des jobs en échec d'une liste de statuts.
en_echec = [
    job["name"]
    for job in reponse
    if job.get("status") == "Ended Not OK"
]
```

### Test avec curl

```bash
curl -s "https://api.exemple.fr/users" | python -m json.tool
```

`python -m json.tool` reformate le JSON pour le rendre lisible. C'est le moyen le plus simple d'inspecter une réponse depuis un terminal, sans installer d'outil supplémentaire.

### Erreurs fréquentes

| Erreur | Cause |
| ------ | ----- |
| `json.decoder.JSONDecodeError` | La réponse n'est pas du JSON : page HTML d'erreur, réponse vide, ou contenu `text/plain` |
| `KeyError` | Champ absent, souvent parce qu'il est optionnel |
| `TypeError: string indices must be integers` | Vous traitez une chaîne comme un dictionnaire |

Le premier cas mérite une attention particulière avec Control-M : les endpoints de log et d'output renvoient du `text/plain` en cas de succès, et du JSON uniquement en cas d'erreur. Appeler `.json()` sur un log valide échouera.

### Bonne pratique

Utilisez `.get()` avec une valeur par défaut pour tout champ dont vous n'avez pas la garantie de présence dans votre version. Cela rend votre code résistant aux différences entre fix packs.

### Exercice

À partir de la réponse Control-M ci-dessus, écrivez la fonction Python qui renvoie, pour une liste de jobs, un dictionnaire `{statut: nombre de jobs}`. Gérez le cas où le champ `status` est absent.


---

# PARTIE II — Environnement de travail


## Installer Python et VS Code

*Installation, vérification de version, configuration de VS Code de A à Z.*

### Installer Python

Téléchargez Python depuis [python.org](https://www.python.org/downloads/). Prenez une version 3.10 ou supérieure.

Sur Windows, cochez impérativement **Add Python to PATH** dans le premier écran de l'installeur. Sans cela, la commande `python` restera introuvable dans le terminal.

Sur Linux, Python 3 est en général déjà présent. Sur Debian ou Ubuntu, installez les compléments nécessaires :

```bash
sudo apt install python3 python3-venv python3-pip
```

### Vérifier l'installation

```bash
python --version
```

Si la commande échoue, essayez :

```bash
python3 --version
```

```text
python   → sur Windows, et sur les systèmes où un alias existe
python3  → sur la plupart des distributions Linux et sur macOS
```

Sur les systèmes où les deux existent, `python` peut pointer vers une version 2 obsolète. Dans le doute, utilisez `python3` explicitement.

#### pip

`pip` est le gestionnaire de paquets de Python. Il installe les bibliothèques externes.

```bash
python -m pip --version
```

L'écriture `python -m pip` est préférable à `pip` seul : elle garantit que vous installez dans l'interpréteur que vous croyez utiliser. C'est particulièrement important quand plusieurs versions de Python cohabitent.

### Installer VS Code

Téléchargez VS Code depuis [code.visualstudio.com](https://code.visualstudio.com/).

#### Premier lancement

Au premier démarrage, VS Code vous propose une visite guidée. Vous pouvez la fermer.

#### Ouvrir un dossier de projet

VS Code fonctionne par dossier, pas par fichier isolé. **Fichier → Ouvrir le dossier**, puis sélectionnez le dossier de votre projet. Tout ce que vous ferez ensuite (terminal, interpréteur, debug) sera relatif à ce dossier.

#### Le terminal intégré

Ouvrez-le avec **Terminal → Nouveau terminal**, ou le raccourci `Ctrl+ù` sur clavier français, `Ctrl+ö` selon la disposition. Le terminal démarre directement dans le dossier du projet.

#### Extensions à installer

Ouvrez le panneau **Extensions** (icône en forme de carrés dans la barre latérale) et installez :

| Extension | Utilité |
| --------- | ------- |
| Python (Microsoft) | Coloration, autocomplétion, exécution, debug |
| Pylance | Analyse de types et navigation dans le code |
| Even Better TOML | Confort pour `pyproject.toml` |

#### Choisir l'interpréteur

C'est l'étape que les débutants oublient le plus souvent, et qui produit l'erreur « `ModuleNotFoundError: No module named 'requests'` » alors que le paquet vient d'être installé.

Appuyez sur `Ctrl+Shift+P`, tapez **Python: Select Interpreter**, et choisissez celui qui se trouve dans le dossier `.venv` de votre projet.

```text
INTERPRÉTEUR MAL SÉLECTIONNÉ
              │
              ▼
pip install requests  ──► installe dans l'environnement A
              │
              ▼
VS Code exécute        ──► avec l'interpréteur B
              │
              ▼
       ModuleNotFoundError
```

#### Le debug

Placez un point d'arrêt en cliquant à gauche d'un numéro de ligne, puis lancez **Exécuter → Démarrer le débogage** (`F5`). Vous pourrez inspecter le contenu réel des variables — notamment le JSON renvoyé par une API, ce qui vaut mieux que d'enchaîner les `print()`.

### Bonne pratique

Un projet, un dossier, un environnement virtuel, un interpréteur sélectionné. Cette discipline évite la majorité des problèmes d'environnement que vous rencontrerez ensuite.

### Exercice

Créez un dossier vide, ouvrez-le dans VS Code, ouvrez le terminal intégré, et vérifiez que `python --version` et `python -m pip --version` répondent tous les deux.

## Créer un projet et un environnement virtuel

*Structure de projet, venv, dépendances et arborescence pédagogique.*

### Créer le projet

```bash
mkdir api-learning
cd api-learning
```

### L'environnement virtuel

#### Pourquoi

Sans environnement virtuel, tous vos projets partagent les mêmes bibliothèques, dans les mêmes versions. Un projet qui a besoin de `requests` 2.28 et un autre de `requests` 2.31 entrent en conflit. Un `venv` isole chaque projet dans son propre dossier de dépendances.

#### Linux et macOS

```bash
python3 -m venv .venv
source .venv/bin/activate
```

#### Windows

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

:::note
Sur Windows, PowerShell peut refuser d'exécuter le script d'activation. Autorisez-le pour l'utilisateur courant :
`Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`
:::

Une fois l'environnement activé, votre invite de commande est préfixée par `(.venv)`. C'est le seul signe visible que vous travaillez dans le bon environnement.

### Installer les dépendances

```bash
python -m pip install --upgrade pip
pip install requests python-dotenv
```

| Paquet | Rôle |
| ------ | ---- |
| `requests` | Bibliothèque HTTP de référence en Python. Elle gère les sessions, les headers, l'encodage des paramètres et le TLS |
| `python-dotenv` | Charge les variables d'un fichier `.env` dans l'environnement, pour garder les secrets hors du code |

Figez ensuite vos versions :

```bash
pip freeze > requirements.txt
```

### Arborescence pédagogique

```text
api-learning/
│
├── src/
│   ├── main.py
│   ├── client.py
│   └── config.py
│
├── tests/
│
├── .env
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```

| Fichier | Rôle |
| ------- | ---- |
| `src/main.py` | Point d'entrée : ce que vous exécutez |
| `src/client.py` | Le client API réutilisable : toute la logique HTTP y est centralisée |
| `src/config.py` | Lecture de la configuration et des variables d'environnement |
| `tests/` | Tests unitaires, avec mocks des réponses HTTP |
| `.env` | Vos secrets réels. **Jamais versionné** |
| `.env.example` | Le même fichier sans les valeurs, versionné, qui documente les variables attendues |
| `.gitignore` | Liste des fichiers exclus de Git |
| `requirements.txt` | Dépendances figées, pour reproduire l'environnement à l'identique |
| `README.md` | Installation, usage, prérequis |

### Le .gitignore minimal

```gitignore
.venv/
__pycache__/
*.pyc
.env
*.log
```

:::danger
`.env` doit figurer dans `.gitignore` **avant** votre premier commit. Un secret poussé une fois dans un dépôt y reste, même après suppression : il faut alors le révoquer, pas seulement l'effacer.
:::

### Vérification

```bash
python -c "import requests; print(requests.__version__)"
```

Si cette commande échoue alors que l'installation a réussi, votre environnement n'est pas activé, ou VS Code utilise un autre interpréteur.

### Bonne pratique

Créez `.env.example` en même temps que `.env`. Un collègue qui clone le dépôt doit pouvoir savoir quelles variables renseigner sans vous le demander.

### Exercice

Créez le projet complet ci-dessus, activez le venv, installez les deux dépendances, générez `requirements.txt` et vérifiez avec `git status` que `.env` n'apparaît pas dans les fichiers suivis.


---

# PARTIE III — Postman et curl


## Postman

*Installation, concepts, variables d'environnement et organisation des collections.*

### Pourquoi Postman avant Python

Postman sépare deux questions qui se confondent facilement : « ma requête est-elle correcte ? » et « mon code est-il correct ? ». Quand un appel fonctionne dans Postman mais pas dans votre script, vous savez que le problème est dans le code. Quand il échoue dans les deux, le problème est dans la requête ou dans l'API.

### Installation

Téléchargez Postman depuis [postman.com/downloads](https://www.postman.com/downloads/). L'application de bureau est préférable à la version web : elle peut appeler des instances internes non exposées sur Internet, ce qui est le cas de la plupart des Control-M.

### Les concepts

| Concept | Définition |
| ------- | ---------- |
| Workspace | Espace de travail regroupant plusieurs collections |
| Collection | Ensemble organisé de requêtes, généralement une API |
| Request | Une requête unitaire : méthode, URL, headers, body |
| Environment | Jeu de variables : une par instance (DEV, PREPROD, PROD) |
| Variable | Valeur réutilisable, notée `{{nom}}` |
| Headers | Onglet des en-têtes de la requête |
| Params | Onglet des query parameters |
| Authorization | Onglet dédié à l'authentification |
| Body | Corps de la requête pour POST, PUT, PATCH |
| Tests | Script exécuté après la réponse, en JavaScript |

### Les variables

C'est le mécanisme qui rend une collection réutilisable sur plusieurs environnements.

```text
base_url
token
username
password
```

Elles s'utilisent ainsi :

```text
{{base_url}}/api/users
```

```text
ENVIRONNEMENT « DEV »              ENVIRONNEMENT « PROD »
─────────────────────              ──────────────────────
base_url = https://dev:8443/...    base_url = https://prod:8443/...
username = dev_user                username = prod_user

                    │
                    ▼
        La même requête {{base_url}}/api/users
        s'exécute sur l'un ou l'autre selon
        l'environnement sélectionné en haut à droite.
```

:::caution
Postman distingue **Initial value** et **Current value**. La première est partagée si vous exportez ou synchronisez la collection ; la seconde reste locale. Mettez vos mots de passe et vos tokens en **Current value** uniquement, et de type **secret**.
:::

### Automatiser la récupération du token

Dans l'onglet **Tests** d'une requête de login, ce script enregistre le token dans la variable d'environnement, pour que toutes les requêtes suivantes l'utilisent sans copier-coller :

```javascript
// Enregistre le token renvoyé par le login dans l'environnement,
// afin que les requêtes suivantes puissent utiliser {{token}}.
if (pm.response.code === 200) {
    const data = pm.response.json();
    pm.environment.set("token", data.token);
}
```

### Organiser une collection

```text
Control-M
│
├── Authentication
├── Jobs
├── Folders
├── Events
├── Resources
├── Agents
├── Servers
├── Deploy
└── Administration
```

Cette organisation reflète les services de l'Automation API. Elle permet de retrouver une requête sans la chercher, et sert de documentation vivante à votre équipe.

### Le flux d'authentification

```text
Postman
   │
   ▼
POST Login
   │
   ▼
Token
   │
   ▼
Variable {{token}}
   │
   ▼
Requêtes suivantes
```

### Bonne pratique

Ne partagez jamais un export de collection contenant des valeurs de production. Exportez la collection, exportez un environnement **vide** en modèle, et laissez chacun renseigner ses propres identifiants.

### Exercice

Créez un workspace, une collection nommée `Formation API`, un environnement `DEV` avec la variable `base_url`, et une requête GET utilisant `{{base_url}}`.

## curl

*Les options utiles au quotidien pour tester une API depuis un terminal.*

### Pourquoi curl

`curl` est présent sur presque tous les serveurs. Quand vous diagnostiquez un incident depuis une machine de production sans interface graphique, c'est souvent le seul outil disponible. C'est aussi le format dans lequel la documentation BMC exprime tous ses exemples REST.

### Un appel minimal

```bash
curl "https://api-adresse.data.gouv.fr/search/?q=8+bd+du+port&limit=1"
```

### Les options à connaître

| Option | Effet |
| ------ | ----- |
| `-X POST` | Impose la méthode HTTP |
| `-H "Nom: valeur"` | Ajoute un header |
| `-d '...'` | Envoie un corps de requête |
| `-F "champ=@fichier"` | Envoie un fichier en multipart |
| `-i` | Affiche les headers de réponse en plus du corps |
| `-s` | Mode silencieux : masque la barre de progression |
| `-o fichier` | Écrit la réponse dans un fichier |
| `-w "%{http_code}"` | Affiche le code de statut |
| `-k` | **Désactive la vérification du certificat TLS** |

### Exemple avec authentification

```bash
endpoint="https://controlm.exemple.local:8443/automation-api"
token="..."

curl -H "Authorization: Bearer $token" \
     -H "Accept: application/json" \
     "$endpoint/config/servers"
```

### Envoyer du JSON

```bash
curl -X POST \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $token" \
     -d '{"username":"user","password":"secret"}' \
     "$endpoint/session/login"
```

:::danger
Cette commande place le mot de passe dans l'historique du shell et dans la table des processus, où d'autres utilisateurs de la machine peuvent le lire avec `ps`. Pour un usage réel, passez par un fichier :
`curl -d "@credentials.json" ...`
:::

### Lire la réponse confortablement

```bash
curl -s "$endpoint/config/servers" -H "x-api-key: $token" | python -m json.tool
```

### Le cas particulier de -k

`-k` désactive la vérification du certificat du serveur. La documentation BMC le mentionne parce que l'Automation API est livrée avec un certificat auto-signé.

```text
AVEC -k                          SANS -k
───────                          ───────
Chiffrement       ✔              Chiffrement       ✔
Intégrité         ✔              Intégrité         ✔
Identité serveur  ✘              Identité serveur  ✔
```

`-k` conserve donc le chiffrement mais abandonne la garantie de parler au bon serveur. C'est acceptable pour un test ponctuel sur un poste de travail. Ce n'est pas acceptable pour un script d'exploitation : la bonne réponse est d'installer le certificat de votre autorité interne et de le référencer avec `--cacert`.

```bash
curl --cacert /etc/ssl/certs/ca-interne.pem \
     -H "x-api-key: $token" "$endpoint/config/servers"
```

### Diagnostiquer avec curl

```text
APPEL QUI ÉCHOUE
       │
       ▼
curl -i -s -w "\n%{http_code}\n" ...
       │
       ├── Aucune réponse ──────► réseau, port, service arrêté
       │
       ├── Code 401 ────────────► token
       │
       ├── Code 403 ────────────► autorisations du rôle
       │
       ├── Réponse HTML ────────► mauvaise URL, portail web au lieu de l'API
       │
       └── Code 200 ────────────► l'API va bien : le problème est dans votre code
```

### Bonne pratique

Quand vous ouvrez un ticket auprès d'un éditeur ou d'une équipe interne, joignez la commande `curl` reproductible, **sans le token**. C'est l'information la plus utile que vous puissiez fournir.

### Exercice

Reproduisez avec `curl` un appel que vous avez déjà réussi dans Postman, en affichant le code HTTP et en formatant la sortie JSON.


---

# PARTIE IV — Première API réelle


## Première API réelle — l'API Adresse

*Rechercher une adresse française, en Postman, en curl et en Python.*

### Pourquoi cette API

Avant d'attaquer une API professionnelle protégée par un token, il faut réussir un appel de bout en bout sur une API publique, sans authentification. L'**API Adresse** (Base Adresse Nationale, service public français) est idéale : elle est gratuite, ouverte, documentée, et renvoie du JSON structuré.

Vous y apprendrez tout ce qui servira ensuite pour Control-M : construire une URL, passer des paramètres, lire un statut, parcourir une réponse imbriquée.

### Le principe

```text
Utilisateur
     │
     ▼
Adresse recherchée
     │
     ▼
API territoriale
     │
     ▼
Réponse JSON
     │
     ├── adresse
     ├── commune
     ├── code postal
     ├── latitude
     └── longitude
```

### L'endpoint

```text
Méthode : GET
Base    : https://api-adresse.data.gouv.fr
Chemin  : /search/
```

| Paramètre | Rôle | Obligatoire |
| --------- | ---- | ----------- |
| `q` | Le texte recherché | oui |
| `limit` | Nombre maximum de résultats | non |
| `postcode` | Filtre sur le code postal | non |
| `type` | Filtre sur le type : `housenumber`, `street`, `municipality` | non |

### Test avec Postman

1. Nouvelle requête, méthode **GET**.
2. URL : `https://api-adresse.data.gouv.fr/search/`
3. Onglet **Params** : ajoutez `q` = `8 boulevard du Port` et `limit` = `1`.
4. **Send**.
5. Observez en haut à droite le **Status 200 OK**, le temps de réponse et la taille.

Regardez l'URL reconstruite par Postman : les espaces ont été encodés. C'est exactement ce que `requests` fera pour vous.

### Test avec curl

```bash
curl -s "https://api-adresse.data.gouv.fr/search/?q=8%20boulevard%20du%20Port&limit=1" \
  | python -m json.tool
```

### La réponse

Le format est du GeoJSON : une collection de *features*, chacune ayant des `properties` et une `geometry`.

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [2.290084, 49.897442]
      },
      "properties": {
        "label": "8 Boulevard du Port 80000 Amiens",
        "postcode": "80000",
        "city": "Amiens",
        "score": 0.49
      }
    }
  ]
}
```

:::caution
Dans GeoJSON, `coordinates` est un tableau **[longitude, latitude]**, dans cet ordre. C'est l'inverse de l'habitude française « latitude, longitude ». Une carte affichée au milieu de l'océan vient presque toujours de là.
:::

### Premier programme Python

```python
import requests

url = "https://api-adresse.data.gouv.fr/search/"

response = requests.get(
    url,
    params={"q": "8 boulevard du Port", "limit": 1},
    timeout=10,
)

print(response.status_code)
print(response.json())
```

#### Explication du code

| Ligne | Rôle |
| ----- | ---- |
| `import requests` | Charge la bibliothèque HTTP |
| `params=` | Construit la query string et encode les espaces |
| `timeout=10` | Empêche le script de rester bloqué indéfiniment |
| `response.status_code` | Le code HTTP, à vérifier avant tout |
| `response.json()` | Convertit le corps JSON en structures Python |

### Version exploitable

```python
import requests

def rechercher_adresse(texte: str) -> dict | None:
    """Renvoie la première adresse trouvée, ou None si aucun résultat."""
    response = requests.get(
        "https://api-adresse.data.gouv.fr/search/",
        params={"q": texte, "limit": 1},
        timeout=10,
    )
    # Lève une exception si le code est >= 400 : sans cela, une erreur
    # passerait inaperçue et la suite du code manipulerait des données absentes.
    response.raise_for_status()

    features = response.json().get("features", [])
    # Une recherche sans résultat renvoie 200 avec une liste vide :
    # « aucun résultat » n'est pas une erreur HTTP.
    if not features:
        return None

    feature = features[0]
    longitude, latitude = feature["geometry"]["coordinates"]

    return {
        "label": feature["properties"]["label"],
        "commune": feature["properties"]["city"],
        "code_postal": feature["properties"]["postcode"],
        "latitude": latitude,
        "longitude": longitude,
    }


if __name__ == "__main__":
    resultat = rechercher_adresse("8 boulevard du Port")
    print(resultat if resultat else "Aucune adresse trouvée")
```

#### Résultat attendu

```text
{'label': '8 Boulevard du Port 80000 Amiens', 'commune': 'Amiens',
 'code_postal': '80000', 'latitude': 49.897442, 'longitude': 2.290084}
```

### Erreurs possibles

| Erreur | Cause | Correction |
| ------ | ----- | ---------- |
| `ConnectionError` | Pas de réseau, ou proxy d'entreprise non configuré | Définir `HTTPS_PROXY` |
| `Timeout` | Réseau lent ou service saturé | Augmenter le timeout, prévoir un retry |
| `IndexError` | `features` est vide et vous accédez à `[0]` | Tester la liste avant d'y accéder |
| `JSONDecodeError` | Réponse non JSON, souvent une page d'erreur du proxy | Afficher `response.text` pour voir le contenu réel |

### Troubleshooting derrière un proxy

```text
ConnectionError
       │
       ▼
Le poste a-t-il accès à Internet ?
       │
   ┌───┴────┐
   │        │
  NON      OUI
   │        │
   ▼        ▼
Proxy    Le domaine est-il autorisé ?
requis         │
   │      ┌────┴────┐
   ▼      │         │
export   NON       OUI
HTTPS_    │         │
PROXY     ▼         ▼
      Demander   Vérifier
      ouverture  l'URL exacte
```

```bash
export HTTPS_PROXY="http://proxy.exemple.fr:3128"
```

### Bonne pratique

Séparez toujours la fonction qui appelle l'API de celle qui affiche le résultat. C'est ce qui permettra ensuite de tester la première sans réseau, avec un mock.

### Exercice

1. Modifiez `rechercher_adresse` pour accepter un paramètre `code_postal` optionnel, transmis à l'API.
2. Faites une fonction qui prend une liste d'adresses et renvoie celles qui n'ont pas été trouvées.
3. Reproduisez l'appel dans Postman, puis avec `curl`, et vérifiez que les trois donnent le même résultat.


---

# PARTIE V — Python et requests


## Maîtriser requests

*GET, POST, PUT, PATCH, DELETE, analyse de la réponse et Session HTTP.*

### GET

```python
requests.get(
    url,
    params={"status": "Ended Not OK"},
    headers={"Accept": "application/json"},
    timeout=10,
    verify="/etc/pki/ca-trust/ctm-ca.pem",
)
```

| Argument | Rôle |
| -------- | ---- |
| `params=` | Query string, encodée automatiquement |
| `headers=` | En-têtes, dont l'authentification |
| `timeout=` | Délai maximum. Obligatoire en production |
| `verify=` | Vérification TLS : `True`, ou chemin d'un bundle CA |

### POST

```python
requests.post(
    url,
    json={"username": user, "password": mot_de_passe},
    headers={"Accept": "application/json"},
    timeout=10,
)
```

La différence entre `json=` et `data=` est une source d'erreurs constante :

| Argument | Ce qu'il envoie | Content-Type |
| -------- | --------------- | ------------ |
| `json=` | Sérialise le dictionnaire en JSON | `application/json`, ajouté automatiquement |
| `data=` avec un dict | Encode en formulaire | `application/x-www-form-urlencoded` |
| `data=` avec une str | Envoie la chaîne telle quelle | Aucun, à fournir soi-même |
| `files=` | Envoi multipart | `multipart/form-data`, automatique |

:::tip
Si une API attend du JSON et répond **415**, vous avez presque certainement utilisé `data=` avec un dictionnaire. Utilisez `json=`.
:::

L'envoi de fichier `files=` sert directement pour Control-M : le déploiement de définitions de jobs se fait en multipart.

```python
# [Python] déploiement d'un fichier de définitions Control-M
with open("jobs.json", "rb") as fichier:
    requests.post(
        f"{endpoint}/deploy",
        files={"definitionsFile": ("jobs.json", fichier, "application/json")},
        headers={"x-api-key": token},
        timeout=120,
    )
```

### PUT

PUT remplace la ressource entière.

```python
response = requests.put(
    f"{base}/users/42",
    json={"name": "Alice", "email": "alice@example.com", "active": True},
    timeout=10,
)
```

Si vous omettez `active`, il sera perdu ou remis à sa valeur par défaut. Pour modifier un seul champ, utilisez PATCH.

### PATCH

```python
response = requests.patch(
    f"{base}/users/42",
    json={"email": "nouvelle@example.com"},
    timeout=10,
)
```

### DELETE

```python
response = requests.delete(f"{base}/users/42", timeout=10)
```

Un DELETE réussi renvoie souvent **204 No Content** : le corps est vide. Appeler `.json()` sur cette réponse lève une exception. Vérifiez le statut plutôt que le corps.

### Analyser la réponse

```python
response.status_code   # int : 200, 401, 503...
response.headers       # dict-like, insensible à la casse
response.text          # str : le corps brut
response.json()        # objet Python, si le corps est du JSON
response.content       # bytes : pour un fichier binaire
response.elapsed       # timedelta : durée de l'échange
```

`response.headers["Content-Type"]` mérite un réflexe particulier. Les endpoints Control-M de log et d'output renvoient du `text/plain` en cas de succès et du `application/json` en cas d'erreur :

```python
# [Python] récupération d'un output de job Control-M
if response.headers.get("Content-Type", "").startswith("application/json"):
    # C'est une erreur structurée.
    raise RuntimeError(response.json())
contenu = response.text
```

### La Session HTTP

```python
session = requests.Session()
```

C'est le passage obligé dès que vous enchaînez plusieurs appels sur la même API.

| Avantage | Ce que cela change |
| -------- | ------------------ |
| Réutilisation des connexions | La négociation TCP et TLS n'est faite qu'une fois. Sur 500 appels, le gain est considérable |
| Headers communs | Le token est défini une seule fois, pas à chaque appel |
| Authentification persistante | Cookies et état conservés |
| Configuration centralisée | `verify` et adaptateurs définis au même endroit |

```python
import requests

session = requests.Session()

# On réutilise une Session afin de conserver les headers
# et de bénéficier de la réutilisation des connexions HTTP.
session.headers.update({
    "x-api-key": token,
    "Accept": "application/json",
})
# Le bundle CA est défini une fois pour toutes les requêtes de la session.
session.verify = "/etc/pki/ca-trust/ctm-ca.pem"

jobs = session.get(f"{endpoint}/run/jobs/status", params={"limit": 500}, timeout=30)
agents = session.get(f"{endpoint}/config/server/controlm/agents", timeout=30)
```

:::caution
`timeout` n'est **pas** un attribut de `Session`. Le définir avec `session.timeout = 30` ne produit aucune erreur et n'a aucun effet : vos requêtes resteront sans timeout. Il faut le passer à chaque appel, ou encapsuler la session dans une classe qui l'ajoute — c'est l'une des raisons d'être du client réutilisable présenté plus loin.
:::

#### Fermer proprement

```python
with requests.Session() as session:
    ...
# La session est fermée automatiquement à la sortie du bloc.
```

### Le cycle complet d'un échange

```text
[1] LOGIN
      │
      │ POST /session/login
      ▼
    TOKEN
      │
      ▼
[2] GET JOBS
      │
      │ Authorization: Bearer <token>
      ▼
   LISTE JOBS
      │
      ▼
[3] GET OUTPUT
      │
      ▼
   OUTPUT JOB
      │
      ▼
[4] LOGOUT
```

Ce schéma est celui que vous implémenterez pour Control-M. Comprendre l'enchaînement avant d'écrire le code évite de traiter chaque appel comme un cas isolé.

### Bonne pratique

Une session par client, un timeout par appel, un `verify` explicite. Ces trois règles couvrent la majorité des incidents de production liés au HTTP.

### Exercice

Reprenez la fonction `rechercher_adresse` du chapitre précédent et transformez-la pour qu'elle accepte une `Session` en paramètre. Comparez le temps total de 20 recherches avec et sans session.

## Gérer les erreurs et les relances

*Timeouts, raise_for_status, exceptions requests, stratégie de retry et backoff.*

### Le timeout

```python
requests.get(url)
```

Cet appel est une mauvaise pratique en production. Sans timeout, `requests` attend indéfiniment. Un serveur qui accepte la connexion TCP mais ne répond jamais fige votre script pour toujours.

Dans un contexte Control-M, la conséquence est double : le script est bloqué, et le job Control-M qui l'a lancé reste en `Executing` sans fin, jusqu'à intervention manuelle.

```python
requests.get(url, timeout=10)
```

#### Timeout de connexion et timeout de lecture

```python
# (connexion, lecture) : 5 s pour établir la connexion,
# 30 s pour recevoir la réponse une fois la connexion établie.
requests.get(url, timeout=(5, 30))
```

Cette distinction est utile quand une API est jointe rapidement mais met du temps à répondre : un export de définitions Control-M peut demander plusieurs dizaines de secondes.

| Type d'appel | Timeout raisonnable |
| ------------ | ------------------- |
| Login, ping, statut unitaire | `(5, 15)` |
| Liste de jobs volumineuse | `(5, 60)` |
| Déploiement, export complet | `(5, 300)` |

### raise_for_status

```python
response.raise_for_status()
```

Cette méthode lève une `HTTPError` si le code est supérieur ou égal à 400, et ne fait rien sinon.

Sans elle, un 403 ne provoque aucune erreur visible : `response.json()` renverra le message d'erreur, votre boucle ne trouvera aucun job, et votre script affichera tranquillement « 0 job en échec ». C'est le pire scénario possible pour une supervision : un échec silencieux qui ressemble à un succès.

### Les exceptions de requests

```python
import requests

try:
    response = requests.get(url, timeout=10)
    response.raise_for_status()

except requests.exceptions.Timeout:
    print("Timeout")

except requests.exceptions.ConnectionError:
    print("Impossible de joindre le serveur")

except requests.exceptions.HTTPError as exc:
    print(f"Erreur HTTP : {exc}")

except requests.exceptions.RequestException as exc:
    print(f"Erreur API : {exc}")
```

| Exception | Signification | Réaction |
| --------- | ------------- | -------- |
| `Timeout` | Aucune réponse dans le délai | Retry envisageable |
| `ConnectionError` | DNS, port, pare-feu, service arrêté | Retry court, puis alerte |
| `TooManyRedirects` | Boucle de redirection | Corriger l'URL |
| `SSLError` | Certificat non validé | Corriger le bundle CA, jamais `verify=False` |
| `HTTPError` | Code >= 400 | Dépend du code |
| `RequestException` | Classe mère de toutes les précédentes | Filet de sécurité |

L'ordre compte : `RequestException` doit être capturée en dernier, sinon elle intercepte tout.

:::caution
`response.json()` lève `ValueError` (ou `json.JSONDecodeError`), qui n'hérite **pas** de `RequestException`. Un bloc `except requests.exceptions.RequestException` ne l'attrapera pas.
:::

### Quand relancer

```text
HTTP 503
   │
   ▼
Retry possible


HTTP 401
   │
   ▼
Ne pas retry indéfiniment
   │
   ▼
Corriger authentification
```

| Situation | Retry ? | Pourquoi |
| --------- | ------- | -------- |
| `Timeout` sur un GET | Oui | Lecture idempotente |
| `Timeout` sur un POST d'action | Prudence | L'action a peut-être abouti |
| `ConnectionError` | Oui, quelques essais | Souvent transitoire |
| 429 Too Many Requests | Oui, après `Retry-After` | L'API demande d'attendre |
| 500, 502, 503, 504 | Oui | Erreurs serveur généralement passagères |
| 400, 404, 405, 415, 422 | Non | Rejouer produira la même erreur |
| 401 | Non en boucle | Un token expiré se renouvelle, il ne se rejoue pas |
| 403 | Non | Les droits ne changeront pas d'eux-mêmes |

:::danger
Relancer un 401 en boucle peut verrouiller le compte applicatif au bout de quelques tentatives. Sur un compte de service Control-M, cela transforme un incident mineur en interruption d'exploitation.
:::

### Le backoff exponentiel

Relancer immédiatement un service en difficulté aggrave la situation. Il faut espacer les tentatives.

```text
Tentative 1 ──► échec ──► attendre 1 s
Tentative 2 ──► échec ──► attendre 2 s
Tentative 3 ──► échec ──► attendre 4 s
Tentative 4 ──► échec ──► abandonner et alerter
```

```python
import random
import time

import requests

CODES_RETRYABLES = {429, 500, 502, 503, 504}


def appeler_avec_retry(session, methode, url, essais=4, **kwargs):
    """Rejoue l'appel sur les erreurs transitoires, avec attente croissante."""
    for tentative in range(1, essais + 1):
        try:
            response = session.request(methode, url, **kwargs)
            if response.status_code not in CODES_RETRYABLES:
                return response
            motif = f"HTTP {response.status_code}"
        except (requests.exceptions.Timeout,
                requests.exceptions.ConnectionError) as exc:
            motif = type(exc).__name__

        if tentative == essais:
            raise RuntimeError(f"Échec après {essais} tentatives : {motif}")

        # Attente exponentielle, plus un aléa : si dix scripts échouent
        # en même temps, ils ne repartiront pas tous à la même seconde.
        attente = 2 ** (tentative - 1) + random.uniform(0, 0.5)
        time.sleep(attente)
```

Le terme aléatoire s'appelle le *jitter*. Sans lui, un incident réseau déclenche une vague de reconnexions simultanées qui empêche le service de se rétablir.

#### Respecter Retry-After

```python
# Le serveur indique lui-même combien de temps attendre :
# le respecter vaut mieux que d'appliquer notre propre délai.
if response.status_code == 429:
    attente = float(response.headers.get("Retry-After", 5))
    time.sleep(attente)
```

### Arbre de décision

```text
APPEL EN ÉCHEC
       │
       ▼
Exception ou code HTTP ?
       │
   ┌───┴─────────────────┐
   │                     │
Exception            Code HTTP
   │                     │
   ├── Timeout           ├── 4xx
   │      │              │    │
   │      ▼              │    ├── 401 → renouveler le token, une fois
   │  Idempotent ?       │    ├── 403 → arrêter, vérifier les droits
   │      │              │    ├── 404 → arrêter, vérifier le chemin
   │  ┌───┴───┐          │    └── 429 → attendre Retry-After
   │ OUI     NON         │
   │  │       │          └── 5xx → backoff, puis alerte
   │  ▼       ▼
   │ Retry  Vérifier l'état
   │        avant de rejouer
   │
   └── ConnectionError → retry court, puis alerte réseau
```

### Bonne pratique

Loguez chaque tentative avec l'URL, le code obtenu et le numéro d'essai. Un retry silencieux masque une dégradation progressive de l'infrastructure jusqu'au jour où il ne suffit plus.

### Exercice

Écrivez un décorateur `@avec_retry(essais=3)` applicable à n'importe quelle fonction faisant un appel HTTP. Vérifiez qu'il ne rejoue pas les codes 4xx autres que 429.

## Construire un client API réutilisable

*D'une version minimale à une classe de production, avec session, timeout, TLS, erreurs typées et logs.*

### Pourquoi une classe

Après une dizaine de scripts, le même code se répète : construire l'URL, ajouter le token, poser un timeout, vérifier le statut, parser le JSON. Chaque copie diverge légèrement. Le jour où l'authentification change, il faut modifier vingt fichiers.

Un client encapsule ces décisions une fois pour toutes.

```text
SANS CLIENT                      AVEC CLIENT
───────────                      ───────────
script1.py  ┐                    script1.py ┐
script2.py  ├─ chacun refait     script2.py ├─► ApiClient ─► API
script3.py  │  headers, timeout, script3.py ┘   (un seul
script4.py  ┘  erreurs, TLS      script4.py      endroit)
```

### Version simple

```python
class ApiClient:

    def __init__(self, base_url):
        self.base_url = base_url

    def get(self, endpoint):
        ...

    def post(self, endpoint, payload):
        ...
```

Suffisante pour comprendre l'idée, insuffisante en production : ni session, ni timeout, ni gestion d'erreurs.

### Version avancée

Voici la structure que vous retrouverez ensuite pour Control-M.

#### Les exceptions typées

```python
class ApiError(Exception):
    """Erreur générique du client."""


class ApiAuthError(ApiError):
    """401 — authentification invalide ou expirée."""


class ApiForbidden(ApiError):
    """403 — authentifié mais non autorisé."""


class ApiNotFound(ApiError):
    """404 — ressource inexistante."""


class ApiServerError(ApiError):
    """5xx — problème côté serveur, potentiellement transitoire."""
```

Pourquoi ne pas se contenter de `HTTPError` ? Parce que l'appelant doit pouvoir réagir différemment selon le cas, sans inspecter un code numérique à chaque endroit :

```python
try:
    jobs = client.get_jobs(status="Ended Not OK")
except ApiAuthError:
    client.renouveler_token()          # récupérable
except ApiForbidden:
    logger.error("Rôle insuffisant")   # non récupérable, alerte
except ApiServerError:
    ...                                # retry légitime
```

#### La configuration

```python
import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Config:
    base_url: str
    token: str
    ca_bundle: str | None = None
    timeout: tuple[int, int] = (5, 30)

    @classmethod
    def depuis_environnement(cls) -> "Config":
        """Construit la configuration depuis les variables d'environnement.

        Échouer ici, au démarrage, produit un message clair. Échouer plus tard,
        au premier appel HTTP, produit un 401 difficile à interpréter.
        """
        try:
            return cls(
                base_url=os.environ["API_BASE_URL"].rstrip("/"),
                token=os.environ["API_TOKEN"],
                ca_bundle=os.getenv("API_CA_BUNDLE"),
            )
        except KeyError as exc:
            raise SystemExit(f"Variable d'environnement manquante : {exc}")
```

`frozen=True` rend la configuration immuable : personne ne modifiera l'URL de production en cours d'exécution.

Le `.rstrip("/")` évite les URL en `//` quand on concatène ensuite un chemin.

#### Le client

```python
import logging

import requests

logger = logging.getLogger(__name__)


class ApiClient:
    """Client HTTP réutilisable : session, timeout, TLS et erreurs typées."""

    def __init__(self, config: Config) -> None:
        self.config = config

        # On réutilise une Session afin de conserver les headers
        # et de bénéficier de la réutilisation des connexions HTTP.
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {config.token}",
            "Accept": "application/json",
        })
        # verify est défini une fois : aucun appel ne pourra l'oublier.
        self.session.verify = config.ca_bundle or True

    # -- Cycle de vie ------------------------------------------------------

    def __enter__(self) -> "ApiClient":
        return self

    def __exit__(self, *_exc) -> None:
        self.session.close()

    # -- Appel bas niveau --------------------------------------------------

    def _appeler(self, methode: str, chemin: str, **kwargs):
        url = f"{self.config.base_url}{chemin}"

        # timeout n'est pas un attribut de Session : il doit être passé
        # à chaque appel. C'est justement le rôle de cette méthode.
        kwargs.setdefault("timeout", self.config.timeout)

        logger.debug("%s %s", methode, url)
        try:
            response = self.session.request(methode, url, **kwargs)
        except requests.exceptions.Timeout as exc:
            raise ApiError(f"Timeout sur {methode} {chemin}") from exc
        except requests.exceptions.SSLError as exc:
            raise ApiError(f"Erreur TLS sur {chemin} : {exc}") from exc
        except requests.exceptions.ConnectionError as exc:
            raise ApiError(f"Serveur injoignable : {exc}") from exc

        self._verifier(response, chemin)
        return response

    @staticmethod
    def _verifier(response: requests.Response, chemin: str) -> None:
        """Traduit un code HTTP en exception métier."""
        if response.status_code < 400:
            return

        # Le corps d'erreur est souvent du JSON, mais pas toujours :
        # une page HTML de proxy ferait échouer .json().
        try:
            detail = response.json()
        except ValueError:
            detail = response.text[:500]

        message = f"{response.status_code} sur {chemin} : {detail}"

        if response.status_code == 401:
            raise ApiAuthError(message)
        if response.status_code == 403:
            raise ApiForbidden(message)
        if response.status_code == 404:
            raise ApiNotFound(message)
        if response.status_code >= 500:
            raise ApiServerError(message)
        raise ApiError(message)

    # -- Verbes ------------------------------------------------------------

    def get(self, chemin: str, **params):
        return self._appeler("GET", chemin, params=params or None).json()

    def post(self, chemin: str, corps: dict | None = None, **kwargs):
        return self._appeler("POST", chemin, json=corps, **kwargs).json()

    def delete(self, chemin: str):
        response = self._appeler("DELETE", chemin)
        # Un DELETE réussi renvoie souvent 204 sans corps :
        # appeler .json() lèverait une exception.
        return response.json() if response.content else None
```

#### Utilisation

```python
with ApiClient(Config.depuis_environnement()) as client:
    utilisateurs = client.get("/users", limit=50)
```

Le `with` garantit la fermeture de la session, y compris en cas d'exception.

### Ce que cette structure apporte

| Élément | Bénéfice |
| ------- | -------- |
| Session | Connexions réutilisées, headers centralisés |
| Timeout par défaut | Impossible de l'oublier |
| `verify` centralisé | Impossible de désactiver TLS par inadvertance |
| Exceptions typées | L'appelant réagit selon la nature de l'erreur |
| Logging | Traçabilité sans exposer le token |
| Configuration externe | Aucun secret dans le code |
| Context manager | Nettoyage garanti |

### Exigences de qualité du code

Le code produit dans cette documentation respecte les règles suivantes :

- fonctions courtes, une responsabilité par fonction ;
- typage lorsqu'il clarifie l'intention ;
- docstrings sur les éléments publics ;
- exceptions traitées explicitement, jamais avalées par un `except: pass` ;
- timeouts systématiques ;
- sessions HTTP ;
- logs utiles, sans secret ;
- configuration et secrets hors du code ;
- vérification TLS active.

#### Les commentaires expliquent le « pourquoi »

Bon exemple :

```python
# On réutilise une Session afin de conserver les headers
# et de bénéficier de la réutilisation des connexions HTTP.
self.session = requests.Session()
```

À éviter :

```python
# Crée une session
self.session = requests.Session()
```

Le second commentaire répète ce que le code dit déjà. Le premier explique une décision que le lecteur ne peut pas deviner.

### Exercice

Ajoutez à `ApiClient` une méthode `iter_pages(chemin, taille=100)` qui parcourt une collection paginée et renvoie un itérateur sur les éléments, sans charger toute la collection en mémoire.


---

# PARTIE VI — Authentification et sécurité


## Authentification

*API Key, Bearer Token, Session Token et OAuth — et ce que Control-M utilise.*

### Le problème

Une API doit répondre à deux questions distinctes avant de traiter votre demande :

```text
Qui êtes-vous ?          → authentification  → échec = 401
Avez-vous le droit ?     → autorisation      → échec = 403
```

Confondre les deux fait perdre du temps en diagnostic. Un 403 ne se corrige jamais en régénérant un token.

### API Key

```http
X-API-Key: xxxxx
```

Une clé statique, généralement longue durée, associée à une application plutôt qu'à une personne. Simple, mais elle ne s'invalide qu'en la révoquant.

### Bearer Token

```http
Authorization: Bearer TOKEN
```

Le format standard. Le mot `Bearer` signifie « porteur » : quiconque détient le token est traité comme le titulaire. Il n'y a pas de second facteur. C'est pourquoi un token intercepté équivaut à un compte compromis.

### Session Token

```text
LOGIN
  │
  ▼
TOKEN
  │
  ▼
REQUÊTES
  │
  ▼
LOGOUT
```

Le token est obtenu contre des identifiants, avec une durée de vie courte. Il faut gérer son expiration et le renouveler.

### OAuth

OAuth répond à un besoin différent : permettre à une application tierce d'agir en votre nom sans connaître votre mot de passe.

```text
Utilisateur
     │
     ▼
Application ──── redirige vers ────► Fournisseur d'identité
     │                                       │
     │                                       ▼
     │                              L'utilisateur s'authentifie
     │                                       │
     │◄──────── code d'autorisation ─────────┘
     │
     ▼
Échange du code contre un access token
     │
     ▼
Appels API avec l'access token
```

Retenez le principe : l'application ne voit jamais le mot de passe, et le token délivré porte un périmètre limité (*scope*) et une durée de vie. Pour l'automatisation d'exploitation interne, un token de service reste plus simple et suffit largement.

### Les deux tokens de Control-M Automation API

C'est le point à retenir de ce chapitre, car les deux ne s'utilisent pas de la même façon.

#### API token

Recommandé par BMC. Il accorde des permissions à des rôles précis, pour une durée que vous définissez, la date d'expiration étant exprimée en UTC. Il requiert Control-M/EM 9.0.21 ou supérieur. Il se crée depuis Control-M Web ou via le service d'authentification.

```http
x-api-key: <token>
```

#### Session token

Le seul type disponible avant la version 9.0.21. Il est valide **30 minutes** pour un utilisateur donné.

```http
Authorization: Bearer <token>
```

:::danger[Les deux sont exclusifs]
Le service Session n'est pas compatible avec un API token. Si vous avez créé un API token, les commandes de session échouent. Choisissez un mécanisme et tenez-vous-y dans un même script.
:::

| Critère | API token | Session token |
| ------- | --------- | ------------- |
| Header | `x-api-key` | `Authorization: Bearer` |
| Durée | Définie à la création | 30 minutes |
| Version minimale | Control-M/EM 9.0.21 | Toutes |
| Portée | Rôles ciblés | L'utilisateur qui se connecte |
| Usage conseillé | Scripts, CI/CD, supervision | Session interactive, démonstration |

### Le login en session

```text
[REST] POST /session/login
```

Corps attendu :

```json
{"username": "<controlMUser>", "password": "<controlMPassword>"}
```

Réponse :

```json
{
  "username": "emuser",
  "token": "E14A4F8E45406977B31A1B091E5E0...",
  "version": "9.0.21"
}
```

#### Test avec curl

```bash
endpoint="https://controlm.exemple.local:8443/automation-api"

curl -H "Content-Type: application/json" \
     -X POST -d "@credentials.json" \
     "$endpoint/session/login"
```

#### Exemple Python

```python
import os

import requests

endpoint = os.environ["CTM_ENDPOINT"]
ca_bundle = os.environ["CTM_CA_BUNDLE"]

reponse = requests.post(
    f"{endpoint}/session/login",
    json={
        "username": os.environ["CTM_USER"],
        "password": os.environ["CTM_PASSWORD"],
    },
    timeout=(5, 15),
    verify=ca_bundle,
)
reponse.raise_for_status()

token = reponse.json()["token"]
```

#### Fermer la session

```text
[REST] POST /session/logout
```

```bash
curl -H "Authorization: Bearer $token" -X POST "$endpoint/session/logout"
```

Un token non révoqué reste valide jusqu'à son expiration. Sur un poste partagé ou dans un conteneur de build, faites toujours le logout.

### Gérer l'expiration

```text
APPEL → HTTP 401
          │
          ▼
   Token déjà renouvelé
   dans cet appel ?
          │
      ┌───┴───┐
     NON     OUI
      │       │
      ▼       ▼
  Renouveler  Arrêter et alerter
  puis        (identifiants invalides
  rejouer     ou compte verrouillé)
  UNE fois
```

Ce garde-fou est essentiel : sans lui, un mot de passe changé provoque une boucle infinie de tentatives de connexion, qui verrouille le compte de service.

### Bonne pratique

Utilisez un compte de service dédié, distinct de votre compte nominatif, avec un rôle limité aux actions réellement nécessaires. Un script de supervision n'a pas besoin du droit de supprimer des jobs.

### Exercice

Écrivez une fonction `obtenir_token()` qui lit les identifiants depuis l'environnement, appelle `/session/login`, et mémorise l'heure d'obtention. Ajoutez une méthode qui indique si le token a plus de 25 minutes.

## TLS et certificats

*Chaîne de confiance, vérification du certificat, et pourquoi verify=False est inacceptable.*

### Ce que fait un certificat

Un certificat serveur associe un nom d'hôte à une clé publique, et cette association est signée par une autorité de certification (**CA**). Votre client fait confiance à la CA ; il en déduit qu'il peut faire confiance au certificat.

```text
Autorité racine (CA)
       │ signe
       ▼
Autorité intermédiaire
       │ signe
       ▼
Certificat du serveur
       │
       ▼
controlm-em.exemple.local
```

La vérification porte sur quatre points, et il suffit qu'un seul échoue pour que la connexion soit refusée :

| Contrôle | Question posée |
| -------- | -------------- |
| Chaîne de confiance | La signature remonte-t-elle à une CA connue de mon client ? |
| Validité | La date du jour est-elle dans la période de validité ? |
| Nom d'hôte | Le nom demandé figure-t-il dans le certificat ? |
| Révocation | Le certificat a-t-il été révoqué ? |

Le troisième point est celui qu'on oublie. Un certificat émis pour `controlm-em.exemple.local` ne validera pas une connexion vers `10.20.30.40` : l'adresse IP doit figurer explicitement dans les *Subject Alternative Names*.

### Le cas Control-M

L'Automation API est livrée avec un **certificat auto-signé**. C'est pour cette raison que la documentation BMC ajoute `-k` à ses exemples `curl`, et `verify=False` à ses exemples Python.

C'est acceptable pour une démonstration. Ce n'est pas une configuration cible.

### verify

```python
verify=True
```

Vérifie le certificat avec le magasin de CA de `certifi`. Convient aux API publiques.

```python
verify="/etc/pki/ca-trust/ctm-ca.pem"
```

Vérifie avec votre bundle CA interne. **C'est la configuration correcte pour un Control-M d'entreprise.**

```python
verify=False
```

```text
verify=False
     │
     ▼
Chiffrement conservé
     │
     ▼
Identité du serveur NON vérifiée
     │
     ▼
Un intercepteur peut se placer entre vous et Control-M,
lire votre token, et le rejouer.
```

:::danger
`verify=False` ne doit jamais apparaître dans un script d'exploitation. Le chiffrement sans authentification du serveur ne protège de rien face à une interception : l'attaquant présente son propre certificat, votre client l'accepte, et il obtient un token qui donne accès à l'ordonnanceur.
:::

Un second symptôme trahit cette pratique : `urllib3` émet un avertissement à chaque appel, et le réflexe est de le masquer avec `urllib3.disable_warnings()`. Masquer l'avertissement ne corrige pas le problème, il le rend invisible.

### Mettre en place la bonne configuration

```text
Certificat auto-signé sur Control-M
              │
              ▼
    ┌─────────┴──────────┐
    │                    │
Option A             Option B
Déployer un          Récupérer le certificat
certificat signé     auto-signé et le déclarer
par la CA interne    comme CA de confiance
    │                    │
    ▼                    ▼
verify=True          verify="/chemin/ctm-ca.pem"
fonctionne           fonctionne
```

L'option A est la cible. L'option B est un intermédiaire acceptable, à condition que le fichier soit récupéré par un canal sûr et non depuis le serveur lui-même en pleine connexion non vérifiée.

#### Récupérer le certificat présenté

```bash
openssl s_client -connect controlm-em.exemple.local:8443 -showcerts </dev/null
```

#### Vérifier la date d'expiration

```bash
echo | openssl s_client -connect controlm-em.exemple.local:8443 2>/dev/null \
  | openssl x509 -noout -dates -subject
```

Surveiller cette date fait partie de l'exploitation : une expiration de certificat interrompt tous les scripts d'un coup, généralement un week-end.

### Diagnostiquer une SSLError

```text
requests.exceptions.SSLError
            │
            ▼
Quel est le message ?
            │
    ┌───────┼──────────────────────┬─────────────────────┐
    │       │                      │                     │
CERTIFICATE_  certificate is    hostname mismatch    unable to get
VERIFY_FAILED    expired                             local issuer
    │              │                  │                   │
    ▼              ▼                  ▼                   ▼
CA absente     Renouveler       Utiliser le nom      Chaîne
du bundle      le certificat    du certificat,       intermédiaire
    │                           pas l'IP             manquante
    ▼                                                    │
Ajouter la CA                                            ▼
au bundle                                     Concaténer les
                                              certificats intermédiaires
```

### Bonne pratique

Centralisez le chemin du bundle CA dans une variable d'environnement, `CTM_CA_BUNDLE`, lue par tous vos scripts. Le jour où le certificat change, un seul endroit est à modifier.

### Exercice

Écrivez un script qui, pour une liste d'hôtes et de ports, affiche le nombre de jours restant avant expiration de leur certificat, et sort en code 1 si l'un d'eux expire dans moins de 30 jours. Ce script est ordonnançable dans Control-M.

## Protéger les secrets

*Variables d'environnement, fichiers .env, coffres et règles de non-divulgation.*

### La mauvaise pratique

```python
TOKEN = "secret123"
```

Un secret écrit dans le code finit dans Git, dans une revue de code, dans un ticket, dans une capture d'écran, dans un canal de discussion. Il survit à la suppression de la ligne, puisque l'historique le conserve.

```text
Secret dans le code
        │
        ▼
    git commit
        │
        ▼
Présent dans l'historique POUR TOUJOURS
        │
        ▼
Supprimer la ligne ne suffit pas
        │
        ▼
Il faut RÉVOQUER le secret
```

### Variables d'environnement

```python
import os

token = os.getenv("API_TOKEN")
```

| Fonction | Comportement si la variable est absente |
| -------- | --------------------------------------- |
| `os.getenv("X")` | Renvoie `None` — l'erreur apparaîtra plus tard, ailleurs |
| `os.getenv("X", "defaut")` | Renvoie la valeur par défaut |
| `os.environ["X"]` | Lève `KeyError` immédiatement |

Pour un secret obligatoire, préférez l'échec immédiat et explicite :

```python
# Échouer tout de suite avec un message clair vaut mieux
# qu'un 401 incompréhensible trois appels plus loin.
try:
    token = os.environ["CTM_API_TOKEN"]
except KeyError:
    raise SystemExit("Variable CTM_API_TOKEN non définie")
```

### Le fichier .env

```env
API_BASE_URL=https://...
API_TOKEN=...
```

```python
from dotenv import load_dotenv

load_dotenv()
```

Ce fichier sert au **développement local**. Il n'a pas sa place sur un serveur de production, où les secrets doivent venir de l'ordonnanceur, du gestionnaire de configuration ou d'un coffre.

Fournissez toujours un modèle versionné :

```env title=".env.example"
CTM_ENDPOINT=https://controlm-em.exemple.local:8443/automation-api
CTM_API_TOKEN=
CTM_CA_BUNDLE=/etc/pki/ca-trust/ctm-ca.pem
```

Et vérifiez :

```bash
git check-ignore -v .env
```

Si cette commande ne renvoie rien, `.env` **n'est pas** ignoré. Corrigez avant de committer.

### Les coffres de secrets

| Solution | Contexte |
| -------- | -------- |
| HashiCorp Vault | Coffre généraliste, rotation automatique, baux à durée limitée |
| Azure Key Vault | Environnements Azure, intégration avec les identités managées |
| GitLab CI/CD Variables | Secrets de pipeline. À marquer **Protected** et **Masked** |
| Jenkins Credentials | Secrets de pipeline, injectés via `withCredentials` |

Control-M dispose aussi de son propre mécanisme de **Secrets** utilisable dans les définitions JSON, sous la forme `"Secret:<secretKey>"`. Il évite d'écrire un mot de passe dans un fichier de définition versionné.

### Ne pas divulguer par inadvertance

Un secret correctement stocké peut fuir de trois façons courantes :

```text
1. LOGS
   logger.info(f"Appel avec {headers}")   ← le token part dans le fichier de log

2. URL
   GET /api?token=xxxxx                   ← les URL sont journalisées par les proxys

3. MESSAGES D'ERREUR
   raise Exception(f"Échec : {config}")   ← la configuration contient le secret
```

```python
def masquer(secret: str) -> str:
    """Rend un secret identifiable dans les logs sans être exploitable."""
    if not secret or len(secret) < 8:
        return "***"
    return f"{secret[:4]}...{secret[-4:]}"
```

:::caution
Un token ne doit jamais transiter en query string. Les URL complètes sont enregistrées par les reverse proxies, les pare-feux applicatifs et les serveurs web, souvent sans rétention limitée. Le token va dans un header.
:::

### Rotation

Un secret doit pouvoir être remplacé sans modifier le code. C'est le test qui valide votre conception : si changer un token impose un commit et un déploiement, la configuration est mal placée.

```text
Rotation prévue
      │
      ▼
Créer le nouveau token
      │
      ▼
Mettre à jour la variable / le coffre
      │
      ▼
Redémarrer ou recharger
      │
      ▼
Vérifier un appel réel
      │
      ▼
Révoquer l'ancien token
```

L'ordre importe : on révoque **après** avoir vérifié que le nouveau fonctionne.

### Règles à respecter systématiquement

- HTTPS uniquement.
- Vérification TLS active, bundle CA explicite.
- Secrets hors du code, hors de Git.
- Moindre privilège : un rôle limité aux actions nécessaires.
- Tokens à durée limitée lorsque la version le permet.
- Aucun token dans les logs, ni dans les URL.
- Timeouts sur tous les appels.
- Rotation planifiée et testée.

### Exercice

Reprenez un de vos scripts existants. Listez tout ce qui devrait être externalisé, écrivez le `.env.example` correspondant, et vérifiez qu'aucune valeur sensible n'apparaît dans la sortie standard ou les logs.


---

# PARTIE VII — Control-M


## Découvrir Control-M

*Rôle de chaque composant, architecture, et différence entre l'interface web et l'API.*

### À quoi sert Control-M

Control-M est un ordonnanceur d'entreprise. Il déclenche des traitements au bon moment, dans le bon ordre, sur les bonnes machines, et en surveille l'issue.

Sans ordonnanceur, on utilise des `cron` dispersés sur des dizaines de serveurs. Le problème n'est pas de lancer un script à 2 h du matin : c'est de garantir que le script de 2 h 30 ne démarre que si celui de 2 h a réussi, sur une machine disponible, avec une reprise possible en cas d'échec, et une trace de tout ce qui s'est passé.

### Les composants

```text
                         UTILISATEURS

           ┌────────────────────────────────┐
           │                                │
           ▼                                ▼
┌─────────────────────┐          ┌─────────────────────┐
│ Control-M Web       │          │ Python / Postman    │
└──────────┬──────────┘          └──────────┬──────────┘
           │                                │
           │                                │ HTTPS
           │                                ▼
           │                     ┌─────────────────────┐
           │                     │ Automation API      │
           │                     └──────────┬──────────┘
           │                                │
           └──────────────┬─────────────────┘
                          ▼
                ┌──────────────────────┐
                │ Control-M/EM         │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ Control-M/Server     │
                └──────────┬───────────┘
                           │
               ┌───────────┼────────────┐
               ▼           ▼            ▼
            Agent 1     Agent 2      Agent N
               │           │            │
               ▼           ▼            ▼
            Scripts      Batch       Applications
```

| Composant | Responsabilité |
| --------- | -------------- |
| Control-M/EM (Enterprise Manager) | Point de gestion central. Définitions, autorisations, supervision, vue consolidée de plusieurs Servers |
| Control-M/Server | Moteur d'ordonnancement. Décide quand un job peut partir, gère les conditions, ressources et dépendances |
| Control-M/Agent | Installé sur la machine cible. Exécute réellement le traitement et remonte le statut et l'output |
| Control-M Web | Interface graphique de l'EM |
| Automation API | Expose en REST les opérations de l'EM et des Servers |
| PostgreSQL | Base de données de l'EM et du Server |

Le chemin d'une exécution : vous définissez un job dans l'EM ; l'EM le transmet au Server concerné ; à l'heure prévue et une fois les conditions satisfaites, le Server envoie l'ordre à l'Agent ; l'Agent lance le traitement, capture la sortie, renvoie un code retour ; le Server en déduit `Ended OK` ou `Ended Not OK` et déclenche les post-traitements.

Cette chaîne explique la plupart des diagnostics. Un job en `Wait Host` n'est pas un problème de définition : c'est le Server qui n'arrive pas à joindre l'Agent.

### Le vocabulaire

| Terme | Définition |
| ----- | ---------- |
| Job | Une unité de traitement |
| Folder | Conteneur de jobs |
| SMART Folder | Folder porteur de sa propre logique d'ordonnancement |
| SubFolder | Sous-ensemble d'un SMART Folder |
| Event | Condition nommée et datée, produite par un job et attendue par un autre |
| Resource Pool | Ressource quantifiable, limitant le nombre d'exécutions simultanées |
| Resource Lock | Ressource exclusive ou partagée |
| ODATE | Date de traitement, distincte de la date système |
| Order | Action d'insérer un job ou un folder dans le plan du jour |
| AJF | Active Jobs Database : les jobs du jour et leur état |
| New Day | Procédure quotidienne qui construit le plan du jour |

:::caution[ODATE]
L'ODATE est la date **de traitement**, pas la date d'exécution. Un job qui rattrape le 3 septembre le 6 septembre garde `ODATE = 3 septembre`. Vos scripts doivent lire la date depuis Control-M, jamais depuis l'horloge système, sous peine de produire des fichiers datés du mauvais jour lors des reprises.
:::

### Les statuts d'un job

```text
Définition
    │
    ▼
Déploiement
    │
    ▼
Ordering
    │
    ▼
Waiting
    │
    ├── Wait Condition
    ├── Wait Resource
    ├── Wait Host
    └── Wait User
    │
    ▼
Executing
    │
    ├───────────────┐
    │               │
    ▼               ▼
Ended OK       Ended Not OK
                    │
                    ▼
                 Rerun ?
```

Les statuts renvoyés par l'API sont exactement ceux-ci : `Ended OK`, `Ended Not OK`, `Wait User`, `Wait Resource`, `Wait Host`, `Wait Workload`, `Wait Condition`, `Executing`, `Status Unknown`.

Chaque statut d'attente désigne une cause différente, donc un diagnostic différent :

| Statut | Ce qui manque |
| ------ | ------------- |
| `Wait Condition` | Un Event attendu n'existe pas |
| `Wait Resource` | Un Pool est saturé ou un Lock est détenu |
| `Wait Host` | L'Agent ou le host group n'est pas disponible |
| `Wait User` | Une confirmation manuelle est attendue |
| `Wait Workload` | Une Workload Policy limite l'exécution |

### Interface graphique ou API

```text
              MÉTHODE MANUELLE
              =================

Administrateur
      │
      ▼
Control-M Web
      │
      ▼
Sélectionner un job
      │
      ▼
Cliquer sur "Hold"
      │
      ▼
Job en Hold


              MÉTHODE AUTOMATISÉE
              ===================

Administrateur / Pipeline
      │
      ▼
Script Python
      │
      ▼
Automation API
      │
      ▼
Action Hold
      │
      ▼
Job en Hold
```

Le résultat est identique. Ce qui change, c'est la reproductibilité : l'action par API est traçable, rejouable, planifiable et testable.

Ce principe s'applique à l'ensemble des opérations traitées dans cette documentation : Hold, Free, Rerun, Kill, récupération du log, récupération de l'output, ordering, gestion des Events, gestion des Agents, déploiement des jobs.

| Ce que l'API apporte | Ce que l'interface garde |
| -------------------- | ------------------------ |
| Traitement en masse | Vue graphique des dépendances |
| Reproductibilité | Exploration visuelle |
| Intégration CI/CD | Actions ponctuelles rapides |
| Rapports automatiques | Analyse d'un cas isolé |

L'API ne remplace pas l'interface : elle prend en charge le répétitif.

### Environnement ciblé par cette documentation

```text
Control-M 9.0.22
Self-hosted
PostgreSQL
Automation API
Python
Postman
```

Les fonctionnalités dépendant d'une version ou d'un fix pack sont signalées explicitement dans chaque chapitre.

### Exercice

Sur votre environnement, listez les composants réellement présents : combien de Control-M/Server, combien d'Agents, quelle version de l'EM. Vous en aurez besoin pour tous les exemples suivants.

## PostgreSQL dans l'architecture Control-M

*Rôle des bases EM et Server, diagnostic supporté et limites à ne pas franchir.*

### Deux bases distinctes

```text
┌──────────────────────┐
│ Control-M/EM         │
└──────────┬───────────┘
           │ SQL
           ▼
┌──────────────────────┐
│ PostgreSQL           │
│ Données EM           │
└──────────────────────┘


┌──────────────────────┐
│ Control-M/Server     │
└──────────┬───────────┘
           │ SQL
           ▼
┌──────────────────────┐
│ PostgreSQL           │
│ Données Server       │
└──────────────────────┘
```

| Base | Contenu |
| ---- | ------- |
| Base EM | Définitions de jobs et folders, utilisateurs, rôles, autorisations, historique de supervision, configuration centrale |
| Base Server | Plan du jour (AJF), conditions, ressources, état d'exécution, statistiques |

Elles peuvent être hébergées sur la même instance PostgreSQL ou sur des instances séparées, selon le dimensionnement.

### La règle absolue

:::danger
Ne modifiez jamais directement le contenu des tables Control-M en SQL. Une écriture directe contourne toute la logique applicative, désynchronise la mémoire des processus et la base, et place votre installation en situation potentiellement non supportée par BMC.
:::

La distinction à garder en tête :

```text
DIAGNOSTIC SUPPORTÉ              INTERVENTION DBA            NON SUPPORTÉ
───────────────────              ────────────────            ────────────
Le service répond-il ?           Sauvegardes                 UPDATE sur une
Connexions saturées ?            Réindexation                table Control-M
Espace disque ?                  Statistiques                DELETE de jobs
Requêtes lentes ?                Tuning mémoire              INSERT manuel
Lecture des logs                 Vacuum                      Modification de
                                                             schéma
```

Tout ce que vous voulez modifier passe par l'interface, par l'Automation API ou par les utilitaires fournis. Si une opération ne semble possible qu'en SQL, ouvrez un ticket BMC plutôt que d'improviser.

### Diagnostic quand Control-M est indisponible

```text
Control-M indisponible
       │
       ▼
PostgreSQL joignable ?
       │
       ├── NON → réseau / service / port
       │
       └── OUI
             │
             ▼
       Connexions saturées ?
             │
             ▼
       Disque disponible ?
             │
             ▼
       Requêtes lentes ?
             │
             ▼
       Logs PostgreSQL
```

#### Le service répond-il

```bash
# [PostgreSQL]
systemctl status postgresql
pg_isready -h localhost -p 5432
```

#### Connexions

```sql
-- Nombre de connexions par base, à comparer avec max_connections.
SELECT datname, count(*) AS connexions
FROM pg_stat_activity
GROUP BY datname
ORDER BY connexions DESC;

SHOW max_connections;
```

Une saturation de connexions se manifeste côté Control-M par des composants qui ne démarrent plus, ou par une interface qui se fige sans message clair.

#### Espace disque

```bash
df -h
```

C'est la cause la plus fréquente d'indisponibilité brutale. PostgreSQL passe en lecture seule quand le disque est plein, et Control-M cesse alors de pouvoir écrire quoi que ce soit.

#### Requêtes lentes

```sql
-- Requêtes actives depuis plus de cinq minutes.
SELECT pid, now() - query_start AS duree, state, left(query, 120)
FROM pg_stat_activity
WHERE state <> 'idle'
  AND now() - query_start > interval '5 minutes'
ORDER BY duree DESC;
```

Ces requêtes sont à transmettre au DBA. Ne les interrompez pas de votre propre initiative sur une base Control-M en production.

#### Les logs

```bash
tail -n 200 /var/lib/pgsql/data/log/postgresql-*.log
```

### Ce qu'il faut surveiller au quotidien

| Indicateur | Seuil d'alerte typique |
| ---------- | ---------------------- |
| Espace disque des données | 80 % |
| Espace disque des logs et WAL | 80 % |
| Connexions utilisées | 80 % de `max_connections` |
| Âge de la dernière sauvegarde | Supérieur à 24 h |
| Requêtes de plus de 5 minutes | Toute occurrence |

Ces contrôles sont ordonnançables dans Control-M lui-même, ce qui a l'avantage de faire remonter l'alerte par le canal habituel d'exploitation.

### Exercice

Écrivez un script qui vérifie l'espace disque, le nombre de connexions et la présence de requêtes de plus de cinq minutes, et renvoie un code retour 0, 4 ou 8 selon la gravité — un contrat compatible avec un job Control-M.

## Control-M Automation API

*Architecture, services, CLI ctm, REST, Swagger et règle de vérification des endpoints.*

### Ce que c'est

L'Automation API expose en REST les opérations de Control-M. Elle permet de définir, déployer, ordonnancer, superviser et administrer sans passer par l'interface graphique.

```text
┌──────────────────────────────────────────────────────┐
│                   CLIENTS API                        │
│                                                      │
│   Postman          curl          Python          CI  │
└──────────┬──────────┬──────────────┬──────────────┬──┘
           │          │              │              │
           └──────────┴──────────────┴──────────────┘
                              │
                              │ HTTPS
                              ▼
                  ┌──────────────────────┐
                  │ Control-M            │
                  │ Automation API       │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ Control-M/EM         │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ Control-M/Server     │
                  └──────────┬───────────┘
                             │
                 ┌───────────┼───────────┐
                 ▼           ▼           ▼
              Agent A     Agent B     Agent C
                 │           │           │
                 ▼           ▼           ▼
              Linux       Windows    Application
```

| Élément | Rôle |
| ------- | ---- |
| Client Python | Envoie les requêtes à l'API |
| Automation API | Expose les opérations Control-M en REST |
| Enterprise Manager | Point de gestion central |
| Control-M/Server | Moteur d'ordonnancement |
| Agent | Exécute réellement les traitements |

L'API n'exécute rien elle-même : elle traduit vos requêtes en ordres pour l'EM, qui les relaie au Server, qui pilote les Agents. Un appel API réussi signifie « l'ordre a été accepté », pas « le traitement est terminé ».

### L'endpoint

```text
https://<hôte-EM>:8443/automation-api
```

Toutes les URL de cette documentation sont relatives à cette base, notée `$endpoint`.

### Les services

L'API est découpée en services, chacun couvrant un domaine.

| Service | Domaine |
| ------- | ------- |
| `session` | Connexion, déconnexion, changement de mot de passe |
| `authentication` | Création et gestion des API tokens |
| `build` | Validation de fichiers de définition, sans déploiement |
| `deploy` | Déploiement des définitions dans Control-M |
| `run` | Ordonnancement, actions sur les jobs, events, ressources |
| `config` | Servers, Agents, host groups, utilisateurs, paramètres |
| `provision` | Installation et mise à jour d'Agents |
| `reporting` | Rapports |
| `archive` | Recherche dans les données archivées |
| `environment` | Gestion des environnements côté CLI |

Les trois qui couvrent l'essentiel de l'exploitation quotidienne sont `run`, `config` et `deploy`.

### Trois syntaxes pour les mêmes opérations

CLI et REST exécutent les mêmes commandes avec des notations différentes. Le REST utilise une notation en chemin, la CLI utilise espaces et deux-points.

```text
CLI
ctm config server:hostgroups::get <server>


REST
GET /config/server/{server}/hostgroups


Python
requests.get(f"{endpoint}/config/server/{server}/hostgroups", ...)
```

La règle de lecture de la notation CLI :

```text
ctm config server:hostgroups::get <server>
    └──┬─┘ └───────┬────────┘└┬┘  └──┬──┘
    service    ressource   action  paramètres
```

Le chemin de ressource est séparé par `:`, l'action par `::`, et les paramètres suivent.

:::caution
Ne mélangez jamais les trois syntaxes dans un même bloc. Un exemple qui mêle une sous-commande `ctm` et une URL REST est illisible et incopiable. Chaque bloc de cette documentation est étiqueté `[CLI ctm]`, `[REST]` ou `[Python]`.
:::

#### Codes retour de la CLI

```text
0 → succès
1 → échec
```

C'est ce qui permet de l'utiliser dans un script shell :

```bash
# [CLI ctm]
if ! ctm deploy jobs.json; then
    printf '%s\n' 'ctm : échec du déploiement' >&2
    exit 1
fi
```

### Le Swagger de votre instance

C'est la seule source de vérité pour **votre** version.

```text
https://<hôte-EM>:8443/automation-api
```

La spécification YAML est également générable :

```text
https://<hôte-EM>:8443/automation-api/yaml
```

#### Comment lire une fiche d'endpoint

```text
1. Méthode HTTP        → GET / POST / PUT / DELETE
2. Chemin              → /run/job/{jobId}/hold
3. Path parameters     → jobId, obligatoire
4. Query parameters    → filtres, optionnels
5. Body                → schéma JSON attendu
6. Responses           → codes et structure de réponse
```

#### Statut et licence du serveur API

```text
[REST] GET /status
[REST] GET /license
```

Le statut renvoie la durée de fonctionnement et les propriétés du serveur. C'est le premier appel à faire quand plus rien ne répond : il indique si le service API lui-même est en vie.

### La règle fondamentale

:::danger[Ne jamais inventer un endpoint]
Tout endpoint, toute sous-commande `ctm`, toute propriété JSON, tout statut et tout paramètre doit être vérifié dans la documentation BMC de votre version ou dans le Swagger de votre instance.

N'écrivez jamais `ctm quelquechose` parce que la commande semblerait logique. N'écrivez jamais `POST /run/job/...` sans vérification.

Lorsque l'information n'est pas suffisamment vérifiable, écrivez-le explicitement plutôt que de supposer :

> La syntaxe exacte doit être vérifiée dans le Swagger de l'instance Control-M 9.0.22 concernée.
:::

Cette règle n'est pas de la prudence excessive. Une commande inventée qui « semble logique » peut correspondre à un endpoint réel au comportement différent — et être exécutée en production par quelqu'un qui vous fait confiance.

#### Checklist de validation

Pour chaque exemple Control-M que vous écrivez :

```text
 1. La fonctionnalité existe-t-elle dans la version ciblée ?
 2. L'endpoint est-il exact ?
 3. La méthode HTTP est-elle la bonne ?
 4. Le payload correspond-il au schéma ?
 5. Les paramètres sont-ils les bons ?
 6. Quel type d'authentification est attendu ?
 7. Quel est le format de réponse ?
 8. Quels codes HTTP sont possibles ?
 9. Y a-t-il une dépendance de version ou de fix pack ?
10. Quelles permissions sont nécessaires ?
```

### L'annotation

Certaines actions exigent une justification en texte libre, selon la configuration d'audit de votre site. Le cas échéant, la CLI utilise l'option `-a`, et le REST deux headers dédiés :

```bash
# [REST]
curl -H "x-api-key: $token" -H "Content-Type: application/json" \
  -H "Annotation-Subject: Incident INC0042" \
  -H "Annotation-Description: Relance après correction du montage NFS" \
  -X POST "$endpoint/run/job/$jobId/rerun"
```

Si l'annotation est obligatoire sur votre site et que vous l'omettez, l'appel est rejeté. Prévoyez le champ dès la conception de vos scripts d'action.

### Environnements CLI

```bash
# [CLI ctm]
ctm environment add prod "https://ctm-em.exemple.fr:8443/automation-api" "$CTM_API_TOKEN"
ctm environment set prod
ctm environment show
```

### Exercice

Ouvrez le Swagger de votre instance. Trouvez la fiche de l'endpoint qui met un job en Hold. Relevez la méthode, le chemin, le path parameter, et les codes de réponse documentés. Comparez avec ce que vous auriez deviné.

## Tester Control-M avec Postman

*Collection organisée, variables, authentification et premières requêtes vérifiées.*

### Pourquoi commencer par Postman

Avant d'écrire du Python, il faut avoir vu de ses propres yeux la réponse réelle de **votre** instance. Les champs présents, leur type, la forme exacte des identifiants : rien de tout cela ne se devine.

### La collection

```text
Control-M
│
├── Authentication
├── Jobs
├── Folders
├── Events
├── Resources
├── Agents
├── Servers
├── Deploy
└── Administration
```

### Les variables d'environnement

```text
base_url
username
password
token
server
folder
job_name
job_id
```

| Variable | Exemple | Remarque |
| -------- | ------- | -------- |
| `base_url` | `https://ctm-em.exemple.fr:8443/automation-api` | Sans slash final |
| `username` | `emuser` | À mettre en **Current value** |
| `password` | — | Type **secret**, jamais en Initial value |
| `token` | rempli automatiquement | Voir le script ci-dessous |
| `server` | `controlm` | Le nom du Control-M/Server |
| `job_id` | `controlm:00fhb` | Format `<server>:<orderId>` |

### Authentification

```text
Postman
   │
   ▼
POST Login
   │
   ▼
Token
   │
   ▼
Variable {{token}}
   │
   ▼
Requêtes suivantes
```

#### La requête de login

```text
[REST] POST {{base_url}}/session/login
```

Onglet **Body**, type **raw**, format **JSON** :

```json
{
  "username": "{{username}}",
  "password": "{{password}}"
}
```

Onglet **Tests** :

```javascript
// Enregistre le token de session pour les requêtes suivantes.
// Sans cela, il faudrait le copier-coller manuellement toutes les 30 minutes.
if (pm.response.code === 200) {
    pm.environment.set("token", pm.response.json().token);
}
```

Le token de session est valide 30 minutes. Si vos requêtes commencent à renvoyer 401 après une pause, relancez simplement le login.

#### Le header d'authentification

Selon le type de token utilisé :

| Type | Header | Valeur |
| ---- | ------ | ------ |
| Session token | `Authorization` | `Bearer {{token}}` |
| API token | `x-api-key` | `{{token}}` |

Définissez-le au niveau de la **collection** (onglet Authorization ou Headers de la collection), pas requête par requête. Toutes les requêtes en hériteront.

#### Le certificat auto-signé

Postman refusera par défaut le certificat auto-signé de l'Automation API. Deux options :

- **Settings → General → SSL certificate verification → Off**, acceptable pour un poste de test ;
- **Settings → Certificates → CA Certificates**, en pointant votre bundle CA interne. C'est la bonne configuration.

### Premières requêtes vérifiées

Les endpoints ci-dessous proviennent de la documentation BMC de l'Automation API.

#### Lister les Control-M/Servers

```text
[REST] GET {{base_url}}/config/servers
```

C'est le meilleur premier appel : il ne modifie rien et confirme d'un coup que l'URL, le token et le TLS sont corrects.

#### Lister les Agents d'un Server

```text
[REST] GET {{base_url}}/config/server/{{server}}/agents
```

Filtrage optionnel par motif :

```text
[REST] GET {{base_url}}/config/server/{{server}}/agents?agent=Agent*1*
```

Réponse :

```json
{
  "agents": [
    {
      "nodeid": "myAgent",
      "status": "Available",
      "hostgroups": ["group1", "group2"],
      "version": "9.0.22.000",
      "operatingSystem": "Microsoft Windows Server 2016  (Build 14393)",
      "tag": "Agent_tag",
      "type": "Agent",
      "sslState": "Enabled"
    }
  ]
}
```

Les statuts possibles d'un Agent sont `Available`, `Unavailable`, `Disabled` et `Discovering`.

#### Rechercher des jobs

```text
[REST] GET {{base_url}}/run/jobs/status?jobname=jobA&status=Ended%20OK&limit=5000
```

Le paramètre `limit` accepte des valeurs de 1 à 10 000, avec 1 000 par défaut.

Champs de recherche disponibles : `jobname`, `jobid`, `folder`, `folderLibrary`, `server`, `application`, `subApplication`, `host`, `hostGroup`, `description`, `runAs`, `command`, `filePath`, `fileName`, `workloadPolicy`, `ruleBasedCalender`, `resourceLock`, `resourcePool`, `eventName`, `waitForEventName`. Les jokers `*` et `?` sont acceptés, sauf pour `jobid`.

Filtres temporels : `orderDateFrom` et `orderDateTo` au format `YYMMDD`, `fromTime` et `toTime` au format `YYYYMMDDhhmmss`.

:::tip
Dans Postman, saisissez `Ended Not OK` tel quel dans l'onglet **Params** : Postman encode l'espace pour vous. C'est en recopiant l'URL à la main qu'on introduit des erreurs.
:::

#### Statut d'un job précis

```text
[REST] GET {{base_url}}/run/job/{{job_id}}/status
```

#### Log et output

```text
[REST] GET {{base_url}}/run/job/{{job_id}}/log
[REST] GET {{base_url}}/run/job/{{job_id}}/output?runNo=0
```

En cas de succès, ces deux endpoints renvoient du `text/plain`, pas du JSON. Les erreurs, elles, sont renvoyées en JSON. Postman l'affiche correctement ; c'est en Python que la distinction devra être gérée.

La récupération du log n'est possible que pour les jobs présents dans l'AJF, et l'output ne concerne que les exécutions du jour courant, c'est-à-dire depuis la dernière procédure New Day.

#### Pourquoi un job attend

```text
[REST] GET {{base_url}}/run/job/{{job_id}}/waitingInfo
```

Cet endpoint est le point d'entrée de tout diagnostic d'attente : il indique les conditions, ressources, hosts, utilisateurs ou workloads manquants.

#### Events et ressources

```text
[REST] GET {{base_url}}/run/events?name=A*&server=controlm
[REST] GET {{base_url}}/run/resources?name=A*&server=*
```

### Progression conseillée dans la collection

```text
1. GET /config/servers          ← ne modifie rien, valide la connexion
2. GET /config/server/X/agents  ← lecture, valide un path parameter
3. GET /run/jobs/status         ← lecture, valide les query parameters
4. GET /run/job/{id}/status     ← lecture ciblée
5. GET /run/job/{id}/log        ← réponse text/plain
6. POST /run/job/{id}/hold      ← PREMIÈRE ÉCRITURE, sur un job de test
```

:::danger
N'exécutez aucune requête POST sur un job de production tant que vous n'avez pas validé toutes les lectures. Un `hold` posé par erreur sur un job de chaîne critique bloque tout ce qui en dépend.
:::

### Bonne pratique

Créez un environnement Postman par instance : `CTM-DEV`, `CTM-PREPROD`, `CTM-PROD`. Donnez à l'environnement de production une couleur ou un nom qui ne laisse aucun doute. La grande majorité des incidents liés aux API viennent d'une bonne requête envoyée au mauvais environnement.

### Exercice

Construisez la collection complète avec les six requêtes de lecture ci-dessus, le script de login automatique, et un environnement DEV. Vérifiez que vous pouvez enchaîner les six requêtes sans jamais copier-coller un token.

## ControlMClient — le client Python

*Du premier appel brut à une classe réutilisable couvrant jobs, events, ressources et agents.*

### Le premier appel

```text
Python
   │
   ▼
Authentification
   │
   ▼
Token
   │
   ▼
GET jobs
   │
   ▼
Réponse JSON
```

```python
"""[Python] premier appel : lister les jobs en échec."""
import os

import requests

# 1. Où est l'API. Jamais en dur : l'URL change entre DEV, TEST et PROD.
endpoint = os.environ["CTM_ENDPOINT"]

# 2. Le jeton d'API voyage dans un en-tête dédié. Jamais dans l'URL :
#    les URL finissent dans les logs des proxys et des serveurs web.
headers = {"x-api-key": os.environ["CTM_API_TOKEN"]}

# 3. Les filtres deviennent la query string. Ici : uniquement les échecs.
params = {"status": "Ended Not OK", "limit": 1000}

reponse = requests.get(
    f"{endpoint}/run/jobs/status",
    headers=headers,
    params=params,
    # 4. timeout OBLIGATOIRE : (connexion, lecture). Sans lui, un réseau
    #    qui ne répond pas fige le script — et fige le job Control-M
    #    qui l'a lancé.
    timeout=(5, 60),
    # 5. verify : chemin du bundle CA. JAMAIS False.
    verify=os.environ["CTM_CA_BUNDLE"],
)

# 6. Lève une exception si le code HTTP est >= 400. Sans cette ligne,
#    un 403 passe inaperçu et le script affiche « 0 job en échec ».
reponse.raise_for_status()

# 7. Les jobs sont dans la clé "statuses".
for job in reponse.json().get("statuses", []):
    print(f"{job['jobId']:<24} {job['name']:<30} {job.get('host', '')}")
```

:::caution
La réponse de `/run/jobs/status` est un objet contenant `statuses`, `startIndex` et `itemsPerPage`, et non une liste directe. Un code qui itère sur `reponse.json()` parcourra les clés du dictionnaire, pas les jobs.
:::

### La pagination

`itemsPerPage` vaut 25 par défaut sur certains endpoints. Ignorer la pagination donne une vue partielle — et une supervision qui rate des incidents.

```python
def parcourir(session, url, taille=500, **filtres):
    """Itère sur tous les jobs correspondant aux filtres, page par page."""
    index = 0
    while True:
        reponse = session.get(
            url,
            params={**filtres, "limit": taille, "startIndex": index},
            timeout=(5, 60),
        )
        reponse.raise_for_status()
        donnees = reponse.json()
        lot = donnees.get("statuses", [])

        if not lot:
            return

        yield from lot

        # Dernière page : le lot est plus petit que la taille demandée.
        if len(lot) < taille:
            return
        index += len(lot)
```

### La classe ControlMClient

Voici la structure cible. Les signatures sont volontairement alignées sur le guide Python de référence, afin qu'un même script fonctionne avec les deux.

```python
class ControlMClient:

    def login(self): ...
    def logout(self): ...

    def get_jobs(self, **filtres): ...
    def get_job_status(self, job_id): ...
    def get_log(self, job_id): ...
    def get_output(self, job_id, run_no=None): ...
    def get_waiting_info(self, job_id): ...
    def get_statistics(self, job_id): ...

    def hold_job(self, job_id): ...
    def free_job(self, job_id): ...
    def rerun_job(self, job_id): ...
    def kill_job(self, job_id): ...
    def set_to_ok(self, job_id): ...
    def confirm_job(self, job_id): ...

    def order_folder(self, server, folder, **options): ...

    def get_events(self, **filtres): ...
    def add_event(self, server, name, date="ODAT"): ...
    def delete_event(self, server, name, date="ODAT"): ...

    def get_resources(self, **filtres): ...

    def get_servers(self): ...
    def get_agents(self, server): ...
    def ping_agent(self, server, agent): ...

    def deploy(self, fichier): ...
```

#### Les exceptions

```python
class ControlMError(Exception):
    """Erreur générique de l'Automation API."""


class ControlMAuthError(ControlMError):
    """401 — token absent, invalide ou expiré."""


class ControlMForbidden(ControlMError):
    """403 — rôle insuffisant pour cette action ou cette ressource."""


class ControlMNotFound(ControlMError):
    """404 — job, agent ou folder inexistant."""


class ControlMValidationError(ControlMError):
    """400 — données de requête invalides."""


class ControlMServerError(ControlMError):
    """5xx — erreur serveur, potentiellement transitoire."""
```

#### Le noyau

```python
import logging
import os
from dataclasses import dataclass

import requests

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class Config:
    endpoint: str
    token: str | None = None
    ca_bundle: str | None = None
    timeout: tuple[int, int] = (5, 60)

    @classmethod
    def depuis_environnement(cls) -> "Config":
        try:
            return cls(
                endpoint=os.environ["CTM_ENDPOINT"].rstrip("/"),
                token=os.getenv("CTM_API_TOKEN"),
                ca_bundle=os.getenv("CTM_CA_BUNDLE"),
            )
        except KeyError as exc:
            raise SystemExit(f"Variable d'environnement manquante : {exc}")


class ControlMClient:
    """Client de l'Automation API Control-M."""

    def __init__(self, config: Config) -> None:
        self.config = config
        self.session = requests.Session()
        # Le bundle CA vaut pour toutes les requêtes : aucune ne peut
        # se retrouver sans vérification TLS par oubli.
        self.session.verify = config.ca_bundle or True
        self.session.headers.update({"Accept": "application/json"})

        if config.token:
            # API token : header x-api-key. Ce mode est incompatible
            # avec le service session.
            self.session.headers["x-api-key"] = config.token

    def __enter__(self) -> "ControlMClient":
        return self

    def __exit__(self, *_exc) -> None:
        self.session.close()

    # -- Authentification par session -------------------------------------

    def login(self, username: str, password: str) -> str:
        """Ouvre une session de 30 minutes et mémorise le token.

        À n'utiliser que si aucun API token n'est configuré : les deux
        mécanismes sont mutuellement exclusifs.
        """
        reponse = self.session.post(
            f"{self.config.endpoint}/session/login",
            json={"username": username, "password": password},
            timeout=self.config.timeout,
        )
        self._verifier(reponse, "/session/login")
        token = reponse.json()["token"]
        self.session.headers["Authorization"] = f"Bearer {token}"
        return token

    def logout(self) -> None:
        self._appeler("POST", "/session/logout")
        self.session.headers.pop("Authorization", None)

    # -- Appel bas niveau --------------------------------------------------

    def _appeler(self, methode: str, chemin: str, **kwargs) -> requests.Response:
        url = f"{self.config.endpoint}{chemin}"
        kwargs.setdefault("timeout", self.config.timeout)

        # On journalise l'appel sans jamais journaliser les headers,
        # qui contiennent le token.
        logger.debug("%s %s", methode, chemin)

        try:
            reponse = self.session.request(methode, url, **kwargs)
        except requests.exceptions.Timeout as exc:
            raise ControlMError(f"Timeout sur {methode} {chemin}") from exc
        except requests.exceptions.SSLError as exc:
            raise ControlMError(f"Erreur TLS : {exc}") from exc
        except requests.exceptions.ConnectionError as exc:
            raise ControlMError(f"Control-M injoignable : {exc}") from exc

        self._verifier(reponse, chemin)
        return reponse

    @staticmethod
    def _verifier(reponse: requests.Response, chemin: str) -> None:
        if reponse.status_code < 400:
            return

        # L'API renvoie un tableau "errors" en JSON, mais un proxy peut
        # renvoyer du HTML : on se protège des deux cas.
        try:
            corps = reponse.json()
            erreurs = corps.get("errors", corps) if isinstance(corps, dict) else corps
        except ValueError:
            erreurs = reponse.text[:500]

        message = f"{reponse.status_code} sur {chemin} : {erreurs}"

        if reponse.status_code == 400:
            raise ControlMValidationError(message)
        if reponse.status_code == 401:
            raise ControlMAuthError(message)
        if reponse.status_code == 403:
            raise ControlMForbidden(message)
        if reponse.status_code == 404:
            raise ControlMNotFound(message)
        if reponse.status_code >= 500:
            raise ControlMServerError(message)
        raise ControlMError(message)

    def _get(self, chemin: str, **params):
        return self._appeler("GET", chemin, params=params or None).json()

    def _post(self, chemin: str, corps: dict | None = None, **kwargs):
        reponse = self._appeler("POST", chemin, json=corps, **kwargs)
        return reponse.json() if reponse.content else None

    def _delete(self, chemin: str):
        reponse = self._appeler("DELETE", chemin)
        return reponse.json() if reponse.content else None
```

#### Les méthodes métier

```python
    # -- Jobs --------------------------------------------------------------

    def get_jobs(self, limit: int = 1000, **filtres) -> list[dict]:
        """Recherche des jobs dans l'AJF selon des critères."""
        donnees = self._get("/run/jobs/status", limit=limit, **filtres)
        # La réponse est un objet, pas une liste : les jobs sont
        # sous la clé "statuses".
        return donnees.get("statuses", [])

    def get_job_status(self, job_id: str) -> dict:
        return self._get(f"/run/job/{job_id}/status")

    def get_waiting_info(self, job_id: str) -> dict:
        """Raisons pour lesquelles un job en attente n'est pas parti."""
        return self._get(f"/run/job/{job_id}/waitingInfo")

    def get_statistics(self, job_id: str) -> dict:
        return self._get(f"/run/job/{job_id}/statistics")

    def get_log(self, job_id: str) -> str:
        """Journal d'activité du job. Uniquement pour les jobs de l'AJF."""
        # Succès = text/plain. _appeler a déjà traité les cas d'erreur.
        return self._appeler("GET", f"/run/job/{job_id}/log").text

    def get_output(self, job_id: str, run_no: int | None = None) -> str:
        """Sortie du traitement, pour les exécutions du jour courant."""
        params = {} if run_no is None else {"runNo": run_no}
        return self._appeler(
            "GET", f"/run/job/{job_id}/output", params=params or None
        ).text

    # -- Actions -----------------------------------------------------------

    def hold_job(self, job_id: str):
        return self._post(f"/run/job/{job_id}/hold")

    def free_job(self, job_id: str):
        return self._post(f"/run/job/{job_id}/free")

    def rerun_job(self, job_id: str):
        return self._post(f"/run/job/{job_id}/rerun")

    def kill_job(self, job_id: str):
        return self._post(f"/run/job/{job_id}/kill")

    def set_to_ok(self, job_id: str):
        return self._post(f"/run/job/{job_id}/setToOk")

    def confirm_job(self, job_id: str):
        return self._post(f"/run/job/{job_id}/confirm")

    # -- Ordering ----------------------------------------------------------

    def order_folder(self, server: str, folder: str, **options):
        """Ordonnance un folder. Renvoie un runId à suivre avec run status."""
        corps = {"ctm": server, "folder": folder, **options}
        return self._post("/run/order", corps)

    def get_run_status(self, run_id: str) -> dict:
        return self._get(f"/run/status/{run_id}")

    # -- Events et ressources ---------------------------------------------

    def get_events(self, **filtres) -> list[dict]:
        return self._get("/run/events", **filtres)

    def add_event(self, server: str, name: str, date: str = "ODAT"):
        return self._post(f"/run/event/{server}", {"name": name, "date": date})

    def delete_event(self, server: str, name: str, date: str = "ODAT"):
        return self._delete(f"/run/event/{server}/{name}/{date}")

    def get_resources(self, **filtres) -> list[dict]:
        return self._get("/run/resources", **filtres)

    # -- Configuration -----------------------------------------------------

    def get_servers(self):
        return self._get("/config/servers")

    def get_agents(self, server: str) -> list[dict]:
        donnees = self._get(f"/config/server/{server}/agents")
        return donnees.get("agents", [])

    def ping_agent(self, server: str, agent: str, timeout_ping: int = 60):
        """Teste la disponibilité d'un Agent.

        discover=False : on ne veut pas qu'un ping ajoute un Agent inconnu
        au Control-M/Server. Ce serait un effet de bord inacceptable pour
        un script de supervision.
        """
        return self._post(
            f"/config/server/{server}/agent/{agent}/ping",
            {"discover": False, "timeout": timeout_ping},
        )

    def agent_analysis(self, server: str, agent: str):
        """Rapport d'analyse de communication. Requiert Control-M/EM 9.0.21+."""
        return self._post(f"/config/server/{server}/agent/{agent}/analysis")
```

### Utilisation

```python
import logging

logging.basicConfig(level=logging.INFO)

with ControlMClient(Config.depuis_environnement()) as ctm:
    en_echec = ctm.get_jobs(status="Ended Not OK")
    print(f"{len(en_echec)} job(s) en échec")

    for job in en_echec:
        print(f"\n=== {job['name']} ({job['jobId']}) ===")
        print(f"Host   : {job.get('host') or 'non renseigné'}")
        print(ctm.get_log(job["jobId"])[:2000])
```

### Le format des identifiants

```text
jobId = <server>:<orderId>
        └──┬──┘  └───┬───┘
      Control-M/   identifiant
        Server     dans l'AJF

Exemple : controlm:00fhb
```

Ce `jobId` est renvoyé par les commandes de statut. Ne le construisez jamais vous-même.

### Bonne pratique

Un seul client pour tous vos scripts, importé depuis un module partagé. Les vingt scripts d'administration du chapitre suivant réutilisent tous cette classe plutôt que de refaire des appels HTTP.

### Exercice

Ajoutez une méthode `jobs_par_statut()` qui renvoie un dictionnaire `{statut: nombre}` pour l'ensemble de l'AJF, en une seule requête, et affichez le résultat trié par nombre décroissant.

## Créer et déployer un premier job

*Jobs as Code, build, deploy, order et vérification du résultat.*

### L'objectif

Créer un job `JOB_HELLO_WORLD` qui exécute :

```bash
echo "Hello Control-M"
```

et le suivre de bout en bout, en JSON, par API.

### Les quatre approches

```text
Control-M Web
      │
      ▼
Définition du job


JSON Jobs as Code
      │
      ▼
Définition équivalente


ctm CLI
      │
      ▼
Déploiement


REST
      │
      ▼
Déploiement


Python
      │
      ▼
Automatisation
```

L'interface reste le meilleur outil pour découvrir les propriétés disponibles. Le JSON devient indispensable dès qu'on veut versionner, rejouer et déployer automatiquement.

### Le fichier de définition

```json title="hello_world.json"
{
  "Defaults": {
    "Application": "FORMATION",
    "SubApplication": "API",
    "RunAs": "ctmuser",
    "Host": "agent-lnx-01"
  },

  "FORMATION_HELLO": {
    "Type": "Folder",
    "ControlmServer": "controlm",
    "Comment": "Folder de démonstration — documentation API",

    "JOB_HELLO_WORLD": {
      "Type": "Job:Command",
      "Command": "echo \"Hello Control-M\"",
      "Description": "Premier job créé par API"
    }
  }
}
```

#### Lecture de la structure

```text
{
  "Defaults"       ← propriétés héritées par tous les objets du fichier
  "NOM_DU_FOLDER"  ← la clé EST le nom du folder
      "Type": "Folder"
      "NOM_DU_JOB" ← la clé EST le nom du job
          "Type": "Job:Command"
}
```

Le nom d'un objet est la clé JSON, pas une propriété `Name`. C'est la principale surprise pour qui découvre le format.

| Propriété | Rôle |
| --------- | ---- |
| `Defaults` | Valeurs appliquées à tous les objets, évite la répétition |
| `Type` | Nature de l'objet : `Folder`, `Job:Command`, `Job:Script`, `Flow`… |
| `ControlmServer` | Le Control-M/Server cible |
| `RunAs` | L'utilisateur d'exécution sur l'Agent |
| `Host` | L'Agent ou le host group qui exécutera |

:::caution
`RunAs` doit correspondre à un **Run as User** déclaré dans Control-M, et `Host` à un Agent existant. Un `Host` inexistant ne provoque pas d'erreur au déploiement : le job partira, puis restera en `Wait Host` sans jamais démarrer.
:::

#### Un job de type Script

```json
"JOB_EXTRACT": {
  "Type": "Job:Script",
  "FilePath": "/opt/data/bin",
  "FileName": "extract.sh"
}
```

### Étape 1 — valider sans déployer

Le service `build` compile les définitions et vérifie qu'elles sont valides pour votre environnement : validité du JSON, longueur des champs, caractères autorisés, champs obligatoires, et respect des site standards si Control-M Change Manager est présent.

```bash
# [CLI ctm]
ctm build hello_world.json
```

```bash
# [REST]
curl -H "x-api-key: $token" -X POST \
     -F "definitionsFile=@hello_world.json" \
     "$endpoint/build"
```

En cas d'erreur, la réponse pointe le fichier, la ligne et la colonne :

```json
{
  "errors": [
    {
      "message": "MainArguments is an unknown keyword therefore it is assumed to be a an object, but it has no object syntax",
      "file": "Spark.json",
      "line": 5,
      "col": 22
    }
  ]
}
```

Ce `build` est ce que vous exécuterez dans votre pipeline CI sur chaque merge request. Il valide sans rien modifier dans Control-M.

### Étape 2 — déployer

```bash
# [CLI ctm]
ctm deploy hello_world.json
```

```bash
# [REST]
curl -H "x-api-key: $token" -X POST \
     -F "definitionsFile=@hello_world.json" \
     "$endpoint/deploy"
```

Le déploiement enregistre les définitions dans Control-M. Il n'exécute rien.

### Étape 3 — ordonnancer

```bash
# [REST]
curl -X POST -H "x-api-key: $token" \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{
        "ctm": "controlm",
        "folder": "FORMATION_HELLO",
        "ignoreCriteria": "true",
        "orderIntoFolder": "Alone"
      }' \
  "$endpoint/run/order"
```

Réponse :

```json
{
  "runId": "e0ddf056-4497-49f7-9d8b-25758b132bd6",
  "statusURI": "https://ctm-em:8443/automation-api/run/status/e0ddf056-4497-49f7-9d8b-25758b132bd6"
}
```

#### Les paramètres d'ordering

| Paramètre | Effet | Défaut |
| --------- | ----- | ------ |
| `ctm` | Le Control-M/Server | obligatoire |
| `folder` | Le folder à ordonnancer | obligatoire |
| `jobs` | Les jobs ciblés. Absent = tous les jobs du folder | tous |
| `hold` | Insère le job en Hold, pour le modifier avant démarrage | `false` |
| `ignoreCriteria` | Exécute sans tenir compte des critères de planification | `true` |
| `orderDate` | Jour de traitement, format `YYYYMMDD` | courant |
| `waitForOrderDate` | Attend la date d'ordre pour exécuter | `false` |
| `orderIntoFolder` | `New`, `Recent`, un Order ID, ou `Alone` | `New` |
| `variables` | Variables passées au job, sous forme de paires | — |
| `independentFlow` | Ordonnance le flow de façon unique | `true` |

:::tip
Pour un premier test, `"hold": "true"` est prudent : le job est inséré mais ne démarre pas. Vous vérifiez qu'il est bien là, puis vous le libérez avec `free`.
:::

### Étape 4 — suivre

```bash
# [REST]
curl -H "x-api-key: $token" "$endpoint/run/status/$runId"
```

```json
{
  "completion": "Completed",
  "statuses": [
    {
      "jobId": "controlm:00fhb",
      "name": "FORMATION_HELLO",
      "type": "Folder",
      "status": "Executing",
      "held": "false",
      "outputURI": "Folder has no output"
    }
  ],
  "startIndex": 0,
  "itemsPerPage": 25
}
```

Le champ `completion` vaut `Pending` ou `Completed`. Tant qu'il est `Pending`, il faut réinterroger. C'est un fonctionnement asynchrone : l'appel d'ordering ne dit pas si le job a réussi, seulement qu'il a été inséré.

### Le cycle complet

```text
Créer
  │
  ▼
Déployer
  │
  ▼
Order
  │
  ▼
Exécuter
  │
  ▼
Status
  │
  ├── OK
  │
  └── NOT OK
       │
       ├── Log
       └── Output
```

### En Python

```python
"""[Python] déploie, ordonnance et suit un folder jusqu'à son terme."""
import time


def deployer_et_lancer(ctm, fichier: str, server: str, folder: str,
                       attente_max: int = 300) -> list[dict]:
    """Déploie un fichier de définitions, ordonnance le folder, attend la fin."""
    with open(fichier, "rb") as f:
        ctm._appeler(
            "POST", "/deploy",
            files={"definitionsFile": (fichier, f, "application/json")},
            # Un déploiement peut être long : le timeout de lecture
            # par défaut serait trop court.
            timeout=(5, 120),
        )

    reponse = ctm.order_folder(server, folder, ignoreCriteria="true",
                               orderIntoFolder="Alone")
    run_id = reponse["runId"]

    debut = time.monotonic()
    while time.monotonic() - debut < attente_max:
        etat = ctm.get_run_status(run_id)
        if etat.get("completion") == "Completed":
            return etat.get("statuses", [])
        # On interroge à intervalle raisonnable : une boucle serrée
        # surcharge l'API sans accélérer l'exécution du job.
        time.sleep(5)

    raise TimeoutError(f"Le run {run_id} n'est pas terminé après {attente_max} s")
```

### Erreurs fréquentes

| Symptôme | Cause | Correction |
| -------- | ----- | ---------- |
| Erreur au `build` avec ligne et colonne | JSON invalide ou propriété inconnue | Corriger à l'endroit indiqué |
| Déploiement accepté, job absent du plan | Le folder n'a pas été ordonnancé | Appeler `/run/order` |
| Job en `Wait Host` | `Host` inexistant ou Agent indisponible | Vérifier avec `/config/server/{server}/agents` |
| Job en `Wait User` | Confirmation attendue | `POST /run/job/{jobId}/confirm` |
| `Ended Not OK` immédiat | `RunAs` inexistant, droits, chemin du script | Lire l'output |

### Bonne pratique

Un fichier JSON par domaine fonctionnel, versionné dans Git, validé par `build` en CI, déployé par pipeline. Le fichier devient la source de vérité, et l'interface web sert à consulter, pas à modifier.

### Exercice

1. Créez `JOB_HELLO_WORLD` et déployez-le en DEV.
2. Ordonnancez-le avec `"hold": "true"`, vérifiez son statut, puis libérez-le.
3. Récupérez son output et vérifiez qu'il contient bien votre message.
4. Modifiez la commande pour qu'elle échoue volontairement, redéployez, et observez la différence entre le log et l'output.

## Créer une chaîne de jobs

*Flow, Events, dépendances parallèles, ressources, ODATE et notifications.*

### La chaîne cible

```text
┌─────────────┐
│ JOB_EXTRACT │
└──────┬──────┘
       │
       │ EXTRACT_OK
       ▼
┌───────────────┐
│ JOB_TRANSFORM │
└──────┬────────┘
       │
       │ TRANSFORM_OK
       ▼
┌──────────┐
│ JOB_LOAD │
└────┬─────┘
     │
     │ LOAD_OK
     ▼
┌────────────┐
│ JOB_REPORT │
└────────────┘
```

### Le mécanisme réel : les Events

Une flèche dans un schéma correspond à un Event produit d'un côté et attendu de l'autre.

```text
JOB_EXTRACT
    AddEvents
        │
        ▼
    EXTRACT_OK
        │
        ▼
JOB_TRANSFORM
    WaitForEvents
```

Un Event est identifié par un **nom et une date**. La date est presque toujours l'ODATE, ce qui garantit que le traitement du 3 septembre attend l'extraction du 3 septembre, et non celle de la veille.

:::caution
C'est la cause la plus fréquente des `Wait Condition` inexplicables : l'Event existe, mais avec une date différente de celle attendue. Un job qui attend `EXTRACT_OK` pour l'ODATE du jour ne verra pas un `EXTRACT_OK` daté d'hier.
:::

### Version simple : le Flow

Pour une séquence linéaire, l'objet `Flow` génère les dépendances automatiquement.

```json title="chaine_simple.json"
{
  "Defaults": {
    "Application": "FORMATION",
    "SubApplication": "ETL",
    "RunAs": "ctmuser",
    "Host": "agent-lnx-01"
  },

  "FORMATION_ETL": {
    "Type": "Folder",
    "ControlmServer": "controlm",

    "JOB_EXTRACT": {
      "Type": "Job:Script",
      "FilePath": "/opt/data/bin",
      "FileName": "extract.sh"
    },

    "JOB_TRANSFORM": {
      "Type": "Job:Script",
      "FilePath": "/opt/data/bin",
      "FileName": "transform.sh"
    },

    "JOB_LOAD": {
      "Type": "Job:Script",
      "FilePath": "/opt/data/bin",
      "FileName": "load.sh"
    },

    "JOB_REPORT": {
      "Type": "Job:Command",
      "Command": "/opt/data/bin/report.sh"
    },

    "Flow": {
      "Type": "Flow",
      "Sequence": ["JOB_EXTRACT", "JOB_TRANSFORM", "JOB_LOAD", "JOB_REPORT"]
    }
  }
}
```

### Version explicite : les Events

Quand les dépendances ne sont pas linéaires, on les déclare directement.

```json
"JOB_EXTRACT": {
  "Type": "Job:Script",
  "FilePath": "/opt/data/bin",
  "FileName": "extract.sh",

  "publier": {
    "Type": "AddEvents",
    "Events": [ { "Event": "EXTRACT_OK" } ]
  }
},

"JOB_TRANSFORM": {
  "Type": "Job:Script",
  "FilePath": "/opt/data/bin",
  "FileName": "transform.sh",

  "attendre": {
    "Type": "WaitForEvents",
    "Events": [ { "Event": "EXTRACT_OK" } ]
  },

  "publier": {
    "Type": "AddEvents",
    "Events": [ { "Event": "TRANSFORM_OK" } ]
  },

  "nettoyer": {
    "Type": "DeleteEvents",
    "Events": [ { "Event": "EXTRACT_OK" } ]
  }
}
```

Les clés `publier`, `attendre` et `nettoyer` sont des noms libres : seul le `Type` compte.

`DeleteEvents` mérite attention : sans nettoyage, les Events s'accumulent dans le Server. Avec un nettoyage trop agressif, un job qui doit être relancé ne retrouve pas sa condition. La règle habituelle est que le consommateur supprime l'Event qu'il vient de consommer, sauf si plusieurs jobs l'attendent.

### Dépendances parallèles

```text
                     ┌──────────────┐
                     │ JOB_SOURCE_A │
                     └──────┬───────┘
                            │ A_OK
                            │
                            ▼
                         ┌─────┐
                         │     │
                         │ AND │───────────────┐
                         │     │               │
                         └─────┘               ▼
                            ▲           ┌───────────────┐
                            │           │ JOB_CONSOLIDE │
                            │           └───────────────┘
                            │
                            │ B_OK
                     ┌──────┴───────┐
                     │ JOB_SOURCE_B │
                     └──────────────┘
```

`JOB_CONSOLIDE` attend les deux traitements parce qu'il consolide leurs résultats : partir avec une seule des deux sources produirait un rapport incomplet, sans aucune erreur technique. C'est précisément ce que l'ordonnanceur empêche.

```json
"JOB_CONSOLIDE": {
  "Type": "Job:Script",
  "FilePath": "/opt/data/bin",
  "FileName": "consolide.sh",

  "attendre": {
    "Type": "WaitForEvents",
    "Events": [
      { "Event": "A_OK" },
      { "Event": "B_OK" }
    ]
  }
}
```

La relation par défaut entre plusieurs Events est **AND**. Pour un OU, ou une combinaison, la syntaxe accepte des opérateurs et des parenthèses :

```json
"attendre": {
  "Type": "WaitForEvents",
  "Events": [
    "(", { "Event": "A_OK" }, "OR", { "Event": "B_OK" }, ")",
    { "Event": "REFERENTIEL_OK" }
  ]
}
```

L'imbrication de parenthèses dans des parenthèses n'est pas supportée.

### Les notions à maîtriser dans ce scénario

| Notion | Rôle |
| ------ | ---- |
| Folder | Conteneur des jobs |
| SMART Folder | Folder portant sa propre logique d'ordonnancement |
| SubFolder | Regroupement à l'intérieur d'un SMART Folder |
| Event | Condition nommée et datée |
| `WaitForEvents` | Conditions attendues avant exécution |
| `AddEvents` | Conditions produites après exécution |
| `DeleteEvents` | Conditions supprimées après exécution |
| Resource Pool | Limite le nombre d'exécutions simultanées |
| Resource Lock | Accès exclusif ou partagé à une ressource |
| Calendrier | Jours d'ordonnancement |
| ODATE | Date de traitement |
| Variables | Paramètres passés au job |
| SLA | Engagement de délai sur une fin de chaîne |
| Notifications | Alertes sur incident |
| Retry | Relance automatique |

### Planification

```json
"When": {
  "Months": ["JAN", "OCT", "DEC"],
  "MonthDays": ["1", "11", "22"],
  "WeekDays": ["MON", "TUE", "WED", "THU", "FRI"],
  "FromTime": "0300",
  "ToTime": "2100"
}
```

`FromTime` et `ToTime` définissent une fenêtre d'exécution. Un job dont les conditions sont satisfaites à 2 h 45 avec `FromTime: 0300` restera en attente jusqu'à 3 h : ce n'est pas un incident.

### Notification en cas d'échec

```json
"ActionIfFailure": {
  "Type": "If",
  "CompletionStatus": "NOTOK",
  "mailToTeam": {
    "Type": "Mail",
    "Message": "%%JOBNAME failed",
    "To": "exploitation@exemple.fr"
  }
}
```

`%%JOBNAME` est une variable système Control-M, résolue à l'exécution.

### Ressources

Un Pool limite la concurrence. Si trois jobs consomment chacun une unité d'un pool de capacité 2, le troisième attend en `Wait Resource`.

```bash
# [CLI ctm] gérer les pools
ctm run resource::add controlm POOL_BASE_FINANCE 2
ctm run resources::get -s "name=POOL_*"
ctm run resource::update controlm POOL_BASE_FINANCE 4
ctm run resource::delete controlm POOL_BASE_FINANCE
```

```bash
# [REST] équivalents
curl -H "x-api-key: $token" -H "Content-Type: application/json" -X POST \
  -d '{"name":"POOL_BASE_FINANCE","max":2}' "$endpoint/run/resource/controlm"

curl -H "x-api-key: $token" -X GET "$endpoint/run/resources?name=POOL_*&server=controlm"
```

Réponse de consultation :

```json
[
  { "name": "POOL_BASE_FINANCE", "ctm": "controlm",
    "available": "2", "max": 2, "workloadPolicy": "N/A" }
]
```

Le rapport entre `available` et `max` est l'indicateur clé : un `available` à 0 durable explique une file d'attente entière.

### Gérer les Events par API

```text
LIST
ADD
DELETE
```

```bash
# [CLI ctm] lister les events présents
ctm run events::get -s "name=EXTRACT_*&server=controlm"

# [CLI ctm] publier un event pour la date de traitement courante
ctm run event::add controlm EXTRACT_OK ODAT

# [CLI ctm] publier pour une date précise (rattrapage)
ctm run event::add controlm EXTRACT_OK 0903

# [CLI ctm] supprimer
ctm run event::delete controlm EXTRACT_OK ODAT
```

```bash
# [REST] équivalents
curl -H "x-api-key: $token" -X GET "$endpoint/run/events?name=EXTRACT_*&server=controlm"

curl -H "x-api-key: $token" -H "Content-Type: application/json" -X POST \
  -d '{"name":"EXTRACT_OK","date":"ODAT"}' "$endpoint/run/event/controlm"

curl -H "x-api-key: $token" -X DELETE "$endpoint/run/event/controlm/EXTRACT_OK/ODAT"
```

| Valeur de `date` | Signification |
| ---------------- | ------------- |
| `MMDD` | Une date précise, par exemple `0903` |
| `ODAT` | La date Control-M courante |
| `STAT` | Event non lié à une date |

:::danger
Publier manuellement un Event débloque un job en `Wait Condition`, mais fait démarrer un traitement dont le prérequis réel n'a peut-être pas été produit. Ne le faites qu'après avoir vérifié que les données attendues existent bien. Sinon, vous ne débloquez pas la chaîne : vous propagez une donnée manquante jusqu'au rapport final.
:::

### Bonne pratique

Nommez vos Events selon une convention stricte, du type `<DOMAINE>_<TRAITEMENT>_OK`. Sur un environnement comptant plusieurs milliers d'Events, une convention est ce qui rend un diagnostic possible en pleine nuit.

### Exercice

1. Créez la chaîne à quatre jobs avec un `Flow`.
2. Réécrivez-la avec des `WaitForEvents` et `AddEvents` explicites, et vérifiez que le comportement est identique.
3. Ajoutez `JOB_SOURCE_B` et transformez `JOB_LOAD` en consolidation attendant deux Events.
4. Faites échouer volontairement `JOB_EXTRACT` et observez où la chaîne s'arrête.


---

# PARTIE VIII — Administration par API


## Automatiser l'administration Control-M

*Chaque opération d'exploitation en trois formes — interface, endpoint REST, code Python.*

Cette partie est l'un des objectifs principaux de la documentation. Pour chaque action, la présentation suit le même schéma :

```text
Control-M Web
      │
      ▼
Action manuelle


Automation API
      │
      ▼
Endpoint


Python
      │
      ▼
Automatisation
```

:::note
Tous les endpoints de ce chapitre proviennent de la documentation BMC de l'Automation API. Les identifiants de job sont au format `<server>:<orderId>`, renvoyé par les commandes de statut.
:::

### Lister les jobs

**Interface** — Le Viewpoint affiche les jobs du plan du jour.

```text
[CLI ctm] ctm run jobs:status::get [limit] -s "<query string>"
[REST]    GET /run/jobs/status?<filtres>&limit=<n>
```

```python
# [Python]
jobs = ctm.get_jobs(limit=5000)
```

### Rechercher un job

La recherche se fait par les mêmes champs de query, combinables.

| Recherche par | Champ |
| ------------- | ----- |
| Nom | `jobname` |
| Folder | `folder` |
| Server | `server` |
| Statut | `status` |
| Application | `application`, `subApplication` |
| Machine | `host`, `hostGroup` |
| Identifiant | `jobid` |

Les jokers `*` et `?` sont acceptés partout sauf sur `jobid`. Plusieurs valeurs se séparent par des virgules.

```bash
# [CLI ctm]
ctm run jobs:status::get -s "jobname=FIN_*&status=Ended Not OK,Executing"
```

```python
# [Python]
jobs = ctm.get_jobs(jobname="FIN_*", status="Ended Not OK,Executing")
```

### Statut d'un job

```text
[CLI ctm] ctm run job:status::get <jobId>
[REST]    GET /run/job/{jobId}/status
```

```python
# [Python]
etat = ctm.get_job_status("controlm:00fhb")
print(etat["status"], etat.get("host"))
```

### Output

L'output est la sortie du traitement lui-même : ce que le script a écrit sur `stdout` et `stderr`. Il n'est disponible que pour les exécutions du jour courant, depuis la dernière procédure New Day.

```text
[CLI ctm] ctm run job:output::get <jobId> [runNo]
[REST]    GET /run/job/{jobId}/output?runNo=0
```

```python
# [Python]
print(ctm.get_output("controlm:00fhb"))
```

Sans `runNo`, c'est la dernière exécution qui est renvoyée. Pour un job cyclique ou relancé plusieurs fois, préciser `runNo` permet de comparer les tentatives.

### Log

Le log est le journal d'activité Control-M : les changements de statut, les décisions du Server, les actions effectuées. Il ne contient pas la sortie du traitement.

```text
[CLI ctm] ctm run job:log::get <jobId>
[REST]    GET /run/job/{jobId}/log
```

La récupération n'est possible que pour les jobs présents dans l'AJF.

```text
LOG                              OUTPUT
───                              ──────
Journal Control-M                Sortie du traitement
Changements de statut            stdout et stderr du script
Décisions du Server              Messages applicatifs
Actions post-traitement          Traces métier
                                 Codes retour
```

Pour diagnostiquer un `Ended Not OK`, on lit l'**output** : c'est là que se trouve la cause métier. Le log dit *quand* le job a échoué, l'output dit *pourquoi*.

### Hold

Suspend le traitement du job. Un job en Hold ne démarre pas, et ne libère pas les jobs qui en dépendent.

```text
[CLI ctm] ctm run job::hold <jobId>
[REST]    POST /run/job/{jobId}/hold
```

```python
# [Python]
ctm.hold_job("controlm:00fhb")
```

Cas d'usage : figer une chaîne le temps d'une intervention sur une base, sans annuler le plan du jour.

### Free

Libère un job en Hold.

```text
[CLI ctm] ctm run job::free <jobId>
[REST]    POST /run/job/{jobId}/free
```

:::caution
Toujours conserver la liste des jobs que **vous** avez mis en Hold. Libérer en masse tout ce qui est en Hold libère aussi ce qu'un collègue avait volontairement suspendu pour une autre raison.
:::

```python
# [Python] hold puis free, avec mémorisation
import json


def hold_masse(ctm, fichier_etat: str, **filtres) -> list[str]:
    """Met en Hold les jobs correspondant aux filtres et mémorise la liste."""
    ids = [j["jobId"] for j in ctm.get_jobs(**filtres)]
    for job_id in ids:
        ctm.hold_job(job_id)
    # On persiste la liste : elle seule permet de ne libérer
    # que ce que nous avons suspendu.
    with open(fichier_etat, "w", encoding="utf-8") as f:
        json.dump(ids, f)
    return ids


def free_masse(ctm, fichier_etat: str) -> int:
    with open(fichier_etat, encoding="utf-8") as f:
        ids = json.load(f)
    for job_id in ids:
        ctm.free_job(job_id)
    return len(ids)
```

### Rerun

Relance un job qui n'est pas en cours d'exécution. Les contraintes existantes du job sont appliquées.

```text
[CLI ctm] ctm run job::rerun <jobId>
[REST]    POST /run/job/{jobId}/rerun
```

#### Quand relancer

```text
ÉCHEC D'UN JOB
      │
      ▼
Lire l'output
      │
      ▼
Nature de l'échec ?
      │
  ┌───┴──────────────────┐
  │                      │
Technique             Fonctionnel
  │                      │
  ├── réseau             ├── données invalides
  ├── disque plein       ├── fichier source absent
  ├── base injoignable   └── règle métier non respectée
  └── timeout                    │
  │                              ▼
  ▼                     Le rerun échouera
Rerun légitime          à l'identique
APRÈS correction               │
                               ▼
                    Corriger la donnée
                    ou la règle d'abord
```

:::danger
Relancer un job non idempotent peut produire des doublons : deux écritures comptables, deux envois de fichier, deux notifications client. Vérifiez toujours ce que le traitement a déjà écrit avant de le relancer.
:::

### Kill

Termine un job en cours d'exécution.

```text
[CLI ctm] ctm run job::kill <jobId>
[REST]    POST /run/job/{jobId}/kill
```

Précautions : le processus est interrompu au milieu de son travail. Une transaction non commitée peut laisser des verrous ; un fichier en cours d'écriture reste tronqué. Avant un kill, identifiez ce que le traitement manipule, et prévoyez la reprise.

### Autres actions sur les jobs

| Action | Endpoint | Usage |
| ------ | -------- | ----- |
| `setToOk` | `POST /run/job/{jobId}/setToOk` | Forcer le statut OK après résolution manuelle |
| `confirm` | `POST /run/job/{jobId}/confirm` | Débloquer un job en attente de confirmation |
| `delete` | `POST /run/job/{jobId}/delete` | Marquer pour suppression à la prochaine date |
| `undelete` | `POST /run/job/{jobId}/undelete` | Retirer la marque de suppression |
| `runNow` | `POST /run/job/{jobId}/runNow` | Démarrer immédiatement, sans appliquer les contraintes |
| `waitingInfo` | `GET /run/job/{jobId}/waitingInfo` | Savoir pourquoi un job attend |
| `statistics` | `GET /run/job/{jobId}/statistics` | Durées des exécutions précédentes |
| `get` | `GET /run/job/{jobId}/get` | Définitions du job en cours d'exécution, en JSON |
| `bypass` | `POST /run/job/{jobId}/bypass` | Ignorer certaines contraintes lors de la soumission |

:::caution
`setToOk` marque un job comme réussi sans qu'il ait tourné : les jobs suivants partiront. `runNow` ignore les contraintes : le job démarre même si ses prérequis manquent. Ces deux actions court-circuitent la logique d'ordonnancement et doivent rester exceptionnelles, tracées, et justifiées par une annotation.
:::

### Order

```text
[CLI ctm] ctm run order <ctm> <folder> [jobs] [-f <fichier de configuration>]
[REST]    POST /run/order
```

```python
# [Python]
reponse = ctm.order_folder("controlm", "FORMATION_ETL",
                           ignoreCriteria="true", orderIntoFolder="Alone")
```

Le paramètre `jobs` permet de cibler certains jobs seulement, séparés par des virgules ou avec le joker `*`.

### Events

```text
[CLI ctm] ctm run events::get -s "<query>"
[CLI ctm] ctm run event::add <server> <name> <date>
[CLI ctm] ctm run event::delete <server> <name> <date>

[REST]    GET    /run/events?<filtres>
[REST]    POST   /run/event/{server}      body {"name": "...", "date": "..."}
[REST]    DELETE /run/event/{server}/{name}/{date}
```

### Resources

```text
[CLI ctm] ctm run resources::get [-s "<query>"]
[CLI ctm] ctm run resource::add <server> <name> <max>
[CLI ctm] ctm run resource::update <server> <name> <max>
[CLI ctm] ctm run resource::delete <server> <name>

[REST]    GET    /run/resources?<filtres>
[REST]    POST   /run/resource/{server}          body {"name": "...", "max": n}
[REST]    POST   /run/resource/{server}/{name}   body {"max": n}
[REST]    DELETE /run/resource/{server}/{name}
```

La réponse de consultation donne `name`, `ctm`, `available`, `max` et `workloadPolicy`.

Les Locks ne se consultent pas via ce service : pour savoir qui détient une ressource exclusive, on passe par `waitingInfo` sur le job en attente, et par la recherche de jobs avec le champ `resourceLock`.

### Agents

```text
[CLI ctm] ctm config server:agents::get <server> [-s "agent=<motif>"]
[CLI ctm] ctm config server:agent::ping <server> <agent>
[CLI ctm] ctm config server:agent::test <server> <agent>
[CLI ctm] ctm config server:agent::enable <server> <agent>
[CLI ctm] ctm config server:agent::disable <server> <agent>
[CLI ctm] ctm config server:agent::analysis <server> <agent>

[REST]    GET  /config/server/{server}/agents?agent=<motif>
[REST]    POST /config/server/{server}/agent/{agent}/ping
[REST]    POST /config/server/{server}/agent/{agent}/test
[REST]    POST /config/server/{server}/agent/{agent}/enable
[REST]    POST /config/server/{server}/agent/{agent}/disable
[REST]    POST /config/server/{server}/agent/{agent}/analysis
```

| Commande | Ce qu'elle fait | Version minimale |
| -------- | --------------- | ---------------- |
| `agents::get` | Liste avec statut, version, OS, host groups, état SSL | — |
| `agent::ping` | Teste la disponibilité | — |
| `agent::test` | Teste la connectivité, avec simulation de paramètres | Control-M/EM 9.0.21.200 |
| `agent::analysis` | Rapport de diagnostic : résolution de nom, connectivité, historique d'indisponibilité | Control-M/EM 9.0.21 |
| `agent::disable` | Empêche de nouveaux jobs de partir sur cet Agent | — |
| `agent::enable` | Rétablit l'exécution | — |

:::caution
Le ping accepte un paramètre `discover`. À `true`, un Agent injoignable est **ajouté** au Control-M/Server. Pour un script de supervision, forcez `discover: false` : un outil de surveillance ne doit jamais modifier la configuration qu'il observe.
:::

```python
# [Python] vérification de tous les agents
def agents_indisponibles(ctm, server: str) -> list[dict]:
    return [a for a in ctm.get_agents(server) if a["status"] != "Available"]
```

`disable` est la bonne réponse à un Agent en cours de maintenance : il évite que des jobs soient soumis à une machine qu'on s'apprête à redémarrer, sans supprimer sa déclaration.

### Servers

```text
[CLI ctm] ctm config servers::get
[REST]    GET /config/servers
```

Cette liste donne les Control-M/Server déclarés et leurs propriétés. Elle sert de point de départ à tout script multi-serveurs : plutôt que de coder les noms en dur, on les découvre.

```python
# [Python] parcourir tous les serveurs
for server in ctm.get_servers():
    nom = server.get("name")
    for agent in ctm.get_agents(nom):
        ...
```

Les host groups associés se consultent avec :

```text
[CLI ctm] ctm config server:hostgroups::get <server>
[REST]    GET /config/server/{server}/hostgroups
```

### Tableau de correspondance

| Opération dans Control-M Web | Endpoint REST |
| ---------------------------- | ------------- |
| Consulter le Viewpoint | `GET /run/jobs/status` |
| Ouvrir le détail d'un job | `GET /run/job/{jobId}/status` |
| Voir la sortie | `GET /run/job/{jobId}/output` |
| Voir le log | `GET /run/job/{jobId}/log` |
| Pourquoi ça attend | `GET /run/job/{jobId}/waitingInfo` |
| Hold | `POST /run/job/{jobId}/hold` |
| Free | `POST /run/job/{jobId}/free` |
| Rerun | `POST /run/job/{jobId}/rerun` |
| Kill | `POST /run/job/{jobId}/kill` |
| Set to OK | `POST /run/job/{jobId}/setToOk` |
| Confirmer | `POST /run/job/{jobId}/confirm` |
| Ordonnancer un folder | `POST /run/order` |
| Ajouter une condition | `POST /run/event/{server}` |
| Consulter les ressources | `GET /run/resources` |
| Liste des Agents | `GET /config/server/{server}/agents` |
| Tester un Agent | `POST /config/server/{server}/agent/{agent}/ping` |

### Exercice

Écrivez un script qui prend un motif de nom de job en argument, affiche les jobs correspondants avec leur statut, et propose une action pour ceux en `Ended Not OK` : afficher l'output, ou relancer après confirmation explicite de l'utilisateur.

## La boîte à outils de scripts

*Les scripts d'exploitation à construire, partageant une bibliothèque commune.*

### Le principe

Chaque script est court et fait une seule chose. Toute la logique HTTP vit dans le module partagé, jamais dupliquée.

```text
scripts/                      src/controlm/
  list_jobs.py    ────┐
  failed_jobs.py  ────┤
  hold_job.py     ────┼────►  client.py   (ControlMClient)
  check_agents.py ────┤       config.py   (Config)
  daily_report.py ────┘       exceptions.py
```

Si un script contient un `requests.get`, c'est le signe qu'une méthode manque au client.

### Les scripts à écrire

```text
list_jobs.py
find_job.py
failed_jobs.py
blocked_jobs.py
long_running_jobs.py

job_status.py
job_output.py
job_log.py

hold_job.py
free_job.py
rerun_job.py
kill_job.py

order_folder.py

list_events.py
add_event.py
delete_event.py

list_agents.py
check_agents.py

daily_report.py

export_definitions.py
```

### Le squelette commun

```python
#!/usr/bin/env python3
"""list_jobs.py — liste les jobs de l'AJF selon des filtres."""
import argparse
import sys

from controlm import Config, ControlMClient, ControlMError


def construire_parseur() -> argparse.ArgumentParser:
    parseur = argparse.ArgumentParser(description=__doc__)
    parseur.add_argument("--jobname", help="Motif de nom, jokers * et ? acceptés")
    parseur.add_argument("--folder")
    parseur.add_argument("--status")
    parseur.add_argument("--limit", type=int, default=1000)
    return parseur


def main() -> int:
    args = construire_parseur().parse_args()

    # On ne transmet que les filtres réellement fournis : envoyer
    # jobname=None produirait une query string invalide.
    filtres = {c: v for c, v in vars(args).items() if v is not None}

    try:
        with ControlMClient(Config.depuis_environnement()) as ctm:
            jobs = ctm.get_jobs(**filtres)
    except ControlMError as exc:
        print(f"Erreur : {exc}", file=sys.stderr)
        return 1

    for job in jobs:
        print(f"{job['jobId']:<22} {job['status']:<16} {job['name']}")

    print(f"\n{len(jobs)} job(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

Le code retour compte : `0` en succès, non nul en échec. C'est ce qui permet d'ordonnancer ces scripts dans Control-M lui-même.

### Jobs en échec

```python
"""failed_jobs.py — jobs terminés en erreur, avec le début de leur output."""

def main() -> int:
    with ControlMClient(Config.depuis_environnement()) as ctm:
        jobs = ctm.get_jobs(status="Ended Not OK")

        for job in jobs:
            print(f"\n{'=' * 70}")
            print(f"{job['name']}  ({job['jobId']})")
            print(f"Folder : {job.get('folder', '')}")
            print(f"Host   : {job.get('host') or 'non renseigné'}")
            print(f"{'-' * 70}")
            try:
                # L'output porte la cause métier ; on n'en affiche
                # que le début, suffisant pour un tri rapide.
                print(ctm.get_output(job["jobId"])[:1500])
            except ControlMError as exc:
                print(f"Output indisponible : {exc}")

    # Code retour non nul s'il y a des échecs : le job Control-M
    # qui exécute ce script passera lui-même en Ended Not OK.
    return 1 if jobs else 0
```

### Jobs bloqués

Un job « bloqué » est un job en attente. Le statut précise la nature de l'attente.

```python
"""blocked_jobs.py — jobs en attente, avec la raison de l'attente."""

ATTENTES = ("Wait Condition", "Wait Resource", "Wait Host",
            "Wait User", "Wait Workload")


def main() -> int:
    with ControlMClient(Config.depuis_environnement()) as ctm:
        jobs = ctm.get_jobs(status=",".join(ATTENTES))

        for job in jobs:
            print(f"\n{job['name']} — {job['status']}")
            try:
                # waitingInfo donne exactement ce qui manque :
                # condition, ressource, host, utilisateur ou workload.
                print(ctm.get_waiting_info(job["jobId"]))
            except ControlMError as exc:
                print(f"  Information indisponible : {exc}")
    return 0
```

### Jobs trop longs

```python
"""long_running_jobs.py — jobs qui dépassent une durée seuil."""
from datetime import datetime


def duree_minutes(debut: str | None) -> int | None:
    """Convertit un startTime au format YYYYMMDDhhmmss en minutes écoulées."""
    if not debut:
        return None
    try:
        depart = datetime.strptime(debut, "%Y%m%d%H%M%S")
    except ValueError:
        # Le format peut varier selon la version ; mieux vaut ignorer
        # la valeur que faire échouer tout le rapport.
        return None
    return int((datetime.now() - depart).total_seconds() // 60)


def main(seuil: int = 60) -> int:
    with ControlMClient(Config.depuis_environnement()) as ctm:
        for job in ctm.get_jobs(status="Executing"):
            duree = duree_minutes(job.get("startTime"))
            if duree is not None and duree > seuil:
                print(f"{job['name']:<35} {duree:>5} min  {job.get('host', '')}")
    return 0
```

Une amélioration utile consiste à comparer la durée courante à la moyenne historique, disponible via `GET /run/job/{jobId}/statistics`, plutôt qu'à un seuil fixe identique pour tous les jobs.

### Vérification des Agents

```python
"""check_agents.py — état de tous les agents de tous les serveurs."""

def main() -> int:
    anomalies = 0
    with ControlMClient(Config.depuis_environnement()) as ctm:
        for server in ctm.get_servers():
            nom_server = server.get("name")
            for agent in ctm.get_agents(nom_server):
                statut = agent["status"]
                if statut != "Available":
                    anomalies += 1
                    print(f"[{statut:<12}] {nom_server}/{agent['nodeid']} "
                          f"— version {agent.get('version', '?')}")
    return 1 if anomalies else 0
```

### Export des définitions

L'export est le socle de l'administration as code : il permet de versionner l'existant avant de le modifier.

```text
[CLI ctm] ctm deploy jobs::get -s "<query>"
[REST]    GET /deploy/jobs?<filtres>
```

:::caution
La liste exacte des objets exportables et la syntaxe des filtres varient selon la version. Vérifiez dans le Swagger de votre instance 9.0.22 avant d'industrialiser un export : les objets supportés incluent typiquement les jobs, les folders et les calendriers, mais tous les types d'objets ne sont pas exportables.
:::

```python
"""export_definitions.py — exporte les définitions et écrit un fichier par folder."""
import json
from pathlib import Path


def main(destination: str = "definitions") -> int:
    dossier = Path(destination)
    dossier.mkdir(parents=True, exist_ok=True)

    with ControlMClient(Config.depuis_environnement()) as ctm:
        for server in ctm.get_servers():
            nom = server.get("name")
            definitions = ctm._get("/deploy/jobs", server=nom)

            # Un fichier par serveur, indenté et trié : c'est ce qui rend
            # les diffs Git lisibles d'un export à l'autre.
            chemin = dossier / f"{nom}.json"
            chemin.write_text(
                json.dumps(definitions, indent=2, ensure_ascii=False, sort_keys=True),
                encoding="utf-8",
            )
            print(f"Écrit : {chemin}")
    return 0
```

Le tri des clés et l'indentation ne sont pas cosmétiques : sans eux, deux exports du même contenu produisent des diffs illisibles, et l'historique Git perd tout intérêt.

### Conventions communes

| Règle | Raison |
| ----- | ------ |
| `argparse` pour les arguments | Aide générée, validation, usage cohérent |
| Code retour explicite | Permet l'ordonnancement dans Control-M |
| Erreurs sur `stderr` | Séparation entre résultat et diagnostic |
| Aucun secret en argument | Les arguments sont visibles avec `ps` |
| `--dry-run` sur les scripts d'action | Voir ce qui serait fait avant de le faire |
| Confirmation pour les actions de masse | Éviter un `kill` sur 400 jobs par erreur |

```python
# Une action de masse demande une confirmation explicite,
# sauf si --yes est passé — indispensable en exécution planifiée.
if not args.yes:
    reponse = input(f"Confirmer l'action sur {len(jobs)} job(s) ? [oui/NON] ")
    if reponse.strip().lower() != "oui":
        return 2
```

### Exercice

Écrivez `job_output.py` qui accepte soit un `jobId`, soit un nom de job. Dans le second cas, si plusieurs jobs correspondent, le script affiche la liste et demande lequel choisir plutôt que d'en prendre un au hasard.


---

# PARTIE IX — Troubleshooting


## Arbres de diagnostic

*Wait Condition, Wait Resource, Wait Host, Held, Ended Not OK, Agent indisponible, API et PostgreSQL.*

### Le point d'entrée universel

Avant tout arbre de décision, un seul appel donne la réponse dans la majorité des cas :

```text
[REST] GET /run/job/{jobId}/waitingInfo
```

Il indique les conditions, ressources, hosts, utilisateurs ou workloads manquants. Commencez toujours par là : les arbres ci-dessous servent à interpréter ce qu'il renvoie et à agir.

### Jobs en erreur

```text
GET jobs
   │
   ▼
Filtrer Ended Not OK
   │
   ▼
Pour chaque job
   │
   ├── Status
   ├── Host
   ├── Order ID
   ├── Log
   └── Output
   │
   ▼
Rapport
```

La lecture se fait dans cet ordre : l'output donne la cause métier, le log donne la chronologie, le host indique où chercher côté système.

### Wait Condition

```text
JOB EN WAIT CONDITION
        │
        ▼
Identifier l'Event attendu
        │
        ▼
Event présent ?
     /       \
   OUI       NON
    │         │
    ▼         ▼
Autre       Identifier
cause       producteur
              │
              ▼
        Producteur exécuté ?
            /       \
          NON       OUI
           │         │
           ▼         ▼
      Diagnostiquer  Vérifier
      job amont      Event/date
```

Si l'Event semble présent mais que le job attend toujours, la cause est presque toujours la **date**. Comparez la date de l'Event et l'ODATE du job en attente.

```python
"""[Python] diagnostic d'un Wait Condition."""

def diagnostiquer_condition(ctm, job_id: str, server: str) -> None:
    info = ctm.get_waiting_info(job_id)
    print(info)

    # On liste les events réellement présents pour comparer noms ET dates :
    # un event au bon nom mais à la mauvaise date ne débloque rien.
    for event in ctm.get_events(server=server):
        print(f"{event['name']:<45} date={event['date']}")
```

Le job producteur se retrouve par recherche sur le champ `eventName` :

```bash
# [CLI ctm] quel job produit cet event ?
ctm run jobs:status::get -s "eventName=EXTRACT_OK"
```

### Wait Resource

```text
JOB EN WAIT RESOURCE
        │
        ▼
Identifier Resource
        │
        ▼
Pool ou Lock ?
     /       \
   Pool      Lock
    │         │
    ▼         ▼
Capacité     Identifier
disponible ? détenteur
```

Pour un Pool, comparez `available` et `max` :

```bash
# [CLI ctm]
ctm run resources::get -s "name=POOL_*"
```

Un `available` à 0 qui ne remonte jamais signale souvent un job tué brutalement qui n'a pas restitué sa ressource, ou une capacité sous-dimensionnée par rapport à la charge réelle.

Pour un Lock, on cherche qui le détient :

```bash
# [CLI ctm] jobs liés à cette ressource exclusive
ctm run jobs:status::get -s "resourceLock=LOCK_BASE_FINANCE"
```

### Wait Host

```text
JOB EN WAIT HOST
       │
       ▼
Identifier le Host / Agent
       │
       ▼
L'Agent existe-t-il ?
       │
   ┌───┴────┐
   │        │
  NON      OUI
   │        │
   ▼        ▼
Corriger   Tester l'Agent
config         │
               ▼
         Ping réussi ?
               │
          ┌────┴────┐
          │         │
         NON       OUI
          │         │
          ▼         ▼
      Vérifier    Vérifier
      réseau      configuration
          │
          ├── DNS
          ├── ports
          ├── Agent
          └── TLS
```

```bash
# [CLI ctm] l'Agent est-il connu et disponible ?
ctm config server:agents::get controlm -s "agent=agent-fin-01"

# [CLI ctm] test de disponibilité
ctm config server:agent::ping controlm agent-fin-01

# [CLI ctm] analyse détaillée (Control-M/EM 9.0.21+)
ctm config server:agent::analysis controlm agent-fin-01
```

Le rapport d'analyse contient trois sections : informations de communication de base, résultats des tests (résolution de nom, connectivité, ping depuis le Server), et l'historique des passages en indisponible. Cette dernière section est précieuse : elle distingue une panne franche d'une instabilité récurrente.

Un `Wait Host` peut aussi venir d'un **host group** vide : tous les Agents du groupe sont indisponibles ou désactivés.

```bash
# [CLI ctm]
ctm config server:hostgroups::get controlm
```

### Agent indisponible

```text
Agent unavailable
       │
       ▼
Ping
       │
       ▼
DNS
       │
       ▼
Ports
       │
       ▼
Processus Agent
       │
       ▼
TLS
       │
       ▼
Logs
       │
       ▼
Retest
```

| Étape | Vérification | Commande type |
| ----- | ------------ | ------------- |
| Ping API | L'Agent répond-il au Server ? | `ctm config server:agent::ping <server> <agent>` |
| DNS | Le nom se résout-il, et vers la bonne IP ? | `nslookup`, `dig` |
| Ports | Le port Agent est-il ouvert ? | `nc -zv <agent> 7006` |
| Processus | Les processus Agent tournent-ils ? | Sur la machine Agent |
| TLS | L'état SSL est-il cohérent des deux côtés ? | `sslState` dans `agents::get` |
| Logs | Que disent les traces ? | Logs Agent et Server |

Une incohérence d'état SSL est un cas classique : `sslState` à `Enabled` d'un côté et `Disabled` de l'autre produit un Agent injoignable sans message explicite.

```text
Agent en maintenance planifiée
              │
              ▼
    ctm config server:agent::disable
              │
              ▼
Les jobs ne sont plus soumis à cet Agent
              │
              ▼
        Intervention
              │
              ▼
    ctm config server:agent::enable
```

Désactiver un Agent avant intervention vaut mieux que de laisser des jobs échouer pendant la maintenance.

### Job en Held

```text
JOB EN HELD
     │
     ▼
Qui l'a mis en Hold ?
     │
 ┌───┴─────────────────┐
 │                     │
Un opérateur       Un ordering
                   avec hold=true
 │                     │
 ▼                     ▼
Vérifier la raison  Le job attendait
avant de libérer    une modification
 │                     │
 ▼                     ▼
Libérer si la       Appliquer la
cause est levée     modification, puis free
```

Ne libérez jamais en masse sans savoir ce qui a été suspendu et pourquoi.

### Ended Not OK

```text
JOB ENDED NOT OK
       │
       ▼
Lire l'OUTPUT (cause métier)
       │
       ▼
Erreur technique ou fonctionnelle ?
       │
   ┌───┴─────────────────────┐
   │                         │
Technique               Fonctionnelle
   │                         │
   ├── disque plein          ├── fichier source absent
   ├── base injoignable      ├── données invalides
   ├── réseau                └── règle métier
   ├── droits
   └── timeout
   │                         │
   ▼                         ▼
Corriger la cause       Corriger la donnée
       │                     │
       ▼                     ▼
   Rerun légitime      Rerun seulement APRÈS
                       correction en amont
```

Le code retour du script porte une information exploitable si vous l'avez conçu ainsi : par convention, `0` succès, `4` succès avec rejets, `8` échec fonctionnel, `16` échec technique. Control-M peut alors distinguer un avertissement d'un échec.

### Problème d'Automation API

```text
L'API NE RÉPOND PLUS
        │
        ▼
GET /status
        │
   ┌────┴─────┐
   │          │
Répond    Ne répond pas
   │          │
   ▼          ▼
Le service  Service arrêté,
API va bien port fermé,
   │        ou EM indisponible
   ▼
Code HTTP ?
   │
   ├── 401 → token expiré ou mauvais header
   │         (x-api-key vs Authorization: Bearer)
   ├── 403 → autorisations du rôle
   ├── 503 → service indisponible après redémarrage,
   │         réessayer avec backoff
   └── 500 → logs de l'EM
```

Le 503 après redémarrage est explicitement documenté par BMC : après un restart de l'EM, l'API peut répondre 503 pendant un moment. Un script de déploiement doit attendre plutôt qu'échouer.

Vérifiez aussi le header utilisé : un API token envoyé en `Authorization: Bearer` produit un 401 déroutant, puisque le token est valide mais transmis dans le mauvais en-tête.

### Problème PostgreSQL

```text
Control-M indisponible
       │
       ▼
PostgreSQL joignable ?
       │
       ├── NON → réseau / service / port
       │
       └── OUI
             │
             ▼
       Connexions saturées ?
             │
             ▼
       Disque disponible ?
             │
             ▼
       Requêtes lentes ?
             │
             ▼
       Logs PostgreSQL
```

Toujours distinguer trois niveaux : le diagnostic supporté, que vous pouvez mener seul ; l'intervention DBA, à déléguer ; et les modifications directes de tables, qui sont proscrites.

### Automatiser le diagnostic

```text
START
  │
  ▼
Connexion Control-M API
  │
  ▼
Récupérer les jobs actifs
  │
  ▼
Pour chaque job
  │
  ▼
Vérifier le statut
  │
  ├── Ended OK ───────────────► Ignorer
  │
  ├── Ended Not OK
  │       │
  │       ├── récupérer log
  │       ├── récupérer output
  │       └── ajouter au rapport
  │
  ├── Wait Condition ─────────► diagnostic Event
  │
  ├── Wait Resource ──────────► diagnostic Resource
  │
  └── Wait Host ──────────────► diagnostic Agent
                                  │
                                  ▼
                            Rapport final
                                  │
                                  ▼
                                 END
```

```python
"""[Python] diagnostic automatique de l'ensemble de l'AJF."""

DIAGNOSTICS = {
    "Ended Not OK": "collecter_output",
    "Wait Condition": "diagnostiquer_condition",
    "Wait Resource": "diagnostiquer_resource",
    "Wait Host": "diagnostiquer_host",
}


def diagnostiquer_tout(ctm, server: str) -> list[dict]:
    """Parcourt l'AJF et produit une entrée de rapport par anomalie."""
    anomalies = []

    for job in ctm.get_jobs(limit=10000):
        statut = job.get("status")
        if statut not in DIAGNOSTICS:
            continue

        entree = {
            "job": job["name"],
            "jobId": job["jobId"],
            "statut": statut,
            "host": job.get("host", ""),
        }

        # Un diagnostic qui échoue ne doit jamais interrompre le parcours :
        # le rapport doit couvrir tous les jobs, même partiellement.
        try:
            if statut == "Ended Not OK":
                entree["output"] = ctm.get_output(job["jobId"])[:1000]
            else:
                entree["attente"] = ctm.get_waiting_info(job["jobId"])
        except Exception as exc:
            entree["erreur_diagnostic"] = str(exc)

        anomalies.append(entree)

    return anomalies
```

### Bonne pratique

Écrivez un runbook par type d'incident, avec les commandes exactes. En astreinte à 3 h du matin, personne ne reconstruit un raisonnement : on suit une procédure.

### Exercice

Rédigez le runbook « Agent indisponible » pour votre environnement, avec les noms d'hôtes réels, les ports réels et les commandes exactes. Testez-le sur un Agent de développement que vous désactivez volontairement.

## Le rapport quotidien d'exploitation

*Produire, publier et ordonnancer un état de santé quotidien de Control-M.*

### Le rendu visé

```text
=========================================
        RAPPORT CONTROL-M
=========================================

Jobs actifs             : 1523
Jobs terminés OK        : 1402
Jobs en échec           : 12
Jobs bloqués            : 8
Jobs Held               : 3

Agents disponibles      : 42
Agents indisponibles    : 2

-----------------------------------------
ANOMALIES
-----------------------------------------

JOB_LOAD_FINANCE
  Status : Ended Not OK
  Host   : agent-fin-01

JOB_REPORTING
  Status : Wait Condition
  Event  : LOAD_FINANCE_OK
```

Un rapport utile tient sur un écran. S'il faut faire défiler, personne ne le lit.

### Le script

```python
#!/usr/bin/env python3
"""daily_report.py — état de santé quotidien de l'environnement Control-M."""
import sys
from collections import Counter
from datetime import datetime

from controlm import Config, ControlMClient, ControlMError

ATTENTES = {"Wait Condition", "Wait Resource", "Wait Host",
            "Wait User", "Wait Workload"}


def collecter(ctm) -> dict:
    """Rassemble en un minimum d'appels les données du rapport."""
    # Un seul appel large plutôt qu'un appel par statut : moins de
    # charge sur l'API, et une photographie cohérente dans le temps.
    jobs = ctm.get_jobs(limit=10000)

    statuts = Counter(job.get("status", "Inconnu") for job in jobs)
    held = sum(1 for job in jobs if str(job.get("held")).lower() == "true")

    agents = []
    for server in ctm.get_servers():
        nom = server.get("name")
        for agent in ctm.get_agents(nom):
            agents.append({"server": nom, **agent})

    anomalies = [
        job for job in jobs
        if job.get("status") == "Ended Not OK" or job.get("status") in ATTENTES
    ]

    return {"jobs": jobs, "statuts": statuts, "held": held,
            "agents": agents, "anomalies": anomalies}


def formater(donnees: dict) -> str:
    statuts = donnees["statuts"]
    agents = donnees["agents"]
    dispo = sum(1 for a in agents if a["status"] == "Available")

    bloques = sum(statuts[s] for s in ATTENTES if s in statuts)

    lignes = [
        "=" * 41,
        "        RAPPORT CONTROL-M",
        f"        {datetime.now():%d/%m/%Y %H:%M}",
        "=" * 41,
        "",
        f"Jobs actifs             : {sum(statuts.values())}",
        f"Jobs terminés OK        : {statuts.get('Ended OK', 0)}",
        f"Jobs en échec           : {statuts.get('Ended Not OK', 0)}",
        f"Jobs bloqués            : {bloques}",
        f"Jobs Held               : {donnees['held']}",
        "",
        f"Agents disponibles      : {dispo}",
        f"Agents indisponibles    : {len(agents) - dispo}",
    ]

    if donnees["anomalies"]:
        lignes += ["", "-" * 41, "ANOMALIES", "-" * 41, ""]
        for job in donnees["anomalies"][:40]:
            lignes.append(job["name"])
            lignes.append(f"  Status : {job.get('status')}")
            if job.get("host"):
                lignes.append(f"  Host   : {job['host']}")
            lignes.append("")

        reste = len(donnees["anomalies"]) - 40
        if reste > 0:
            lignes.append(f"... et {reste} autre(s) anomalie(s)")

    for agent in agents:
        if agent["status"] != "Available":
            lignes.append(f"AGENT {agent['server']}/{agent['nodeid']} "
                          f": {agent['status']}")

    return "\n".join(lignes)


def main() -> int:
    try:
        with ControlMClient(Config.depuis_environnement()) as ctm:
            donnees = collecter(ctm)
    except ControlMError as exc:
        print(f"Rapport impossible : {exc}", file=sys.stderr)
        # Code 16 : échec technique. Le job Control-M qui exécute ce
        # script le distinguera d'une anomalie fonctionnelle.
        return 16

    print(formater(donnees))

    echecs = donnees["statuts"].get("Ended Not OK", 0)
    indispo = sum(1 for a in donnees["agents"] if a["status"] != "Available")

    # Le code retour porte le verdict : Control-M peut déclencher
    # une notification sans qu'on ait à parser la sortie.
    if echecs or indispo:
        return 4
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

### La convention de code retour

```text
 0 → tout est normal
 4 → anomalies détectées (échecs, agents indisponibles)
16 → le rapport n'a pas pu être produit (API injoignable)
```

Cette distinction est essentielle. Un rapport qui ne peut pas être produit est plus grave qu'un rapport signalant des anomalies : dans le premier cas, on ne sait rien.

### Publier le rapport

```text
Rapport produit
       │
       ├──► stdout ──────────► capturé dans l'output du job Control-M
       │
       ├──► fichier ─────────► archivé, historisé
       │
       ├──► e-mail ──────────► envoyé à l'exploitation
       │
       └──► ITSM / chat ─────► ticket ou canal d'équipe
```

L'écriture sur `stdout` est la plus simple et souvent la meilleure : l'output du job Control-M devient l'archive du rapport, consultable dans l'interface habituelle, avec l'historique.

```python
# [Python] écriture d'une copie horodatée, en plus de stdout
from pathlib import Path

archive = Path("/opt/controlm/rapports") / f"{datetime.now():%Y%m%d}.txt"
archive.parent.mkdir(parents=True, exist_ok=True)
archive.write_text(rapport, encoding="utf-8")
```

Pour l'envoi par e-mail, préférez l'action `Mail` de Control-M plutôt que du SMTP dans le script : la configuration de messagerie reste au même endroit que celle des autres notifications.

### Ordonnancer le rapport dans Control-M

Le rapport de Control-M est produit par un job Control-M. C'est cohérent : il bénéficie de l'ordonnancement, du suivi, des notifications et de l'archivage de l'output.

```json title="rapport_quotidien.json"
{
  "Defaults": {
    "Application": "EXPLOITATION",
    "SubApplication": "SUPERVISION",
    "RunAs": "ctmuser",
    "Host": "agent-adm-01"
  },

  "EXPLOITATION_SUPERVISION": {
    "Type": "Folder",
    "ControlmServer": "controlm",

    "JOB_RAPPORT_QUOTIDIEN": {
      "Type": "Job:Script",
      "FilePath": "/opt/controlm/scripts",
      "FileName": "daily_report.py",
      "Description": "État de santé quotidien de l'environnement",

      "When": {
        "WeekDays": ["MON", "TUE", "WED", "THU", "FRI"],
        "FromTime": "0700"
      },

      "AlerteSiAnomalie": {
        "Type": "If",
        "CompletionStatus": "NOTOK",
        "notifier": {
          "Type": "Mail",
          "Message": "%%JOBNAME : anomalies détectées sur Control-M",
          "To": "exploitation@exemple.fr"
        }
      }
    }
  }
}
```

:::caution
Le job qui supervise Control-M ne doit pas dépendre de ce qu'il supervise. S'il tourne sur un Agent qui tombe en même temps que le reste, vous perdez la supervision au moment précis où vous en avez besoin. Placez-le sur un Agent d'administration dédié, et doublez-le d'une surveillance externe simple.
:::

### Aller plus loin

| Enrichissement | Intérêt |
| -------------- | ------- |
| Comparaison avec la veille | Fait ressortir une dégradation progressive |
| Durées comparées à l'historique | Détecte un job qui ralentit avant qu'il ne dépasse le SLA |
| Regroupement par Application | Permet d'adresser le bon interlocuteur métier |
| Top 10 des jobs les plus longs | Cible les optimisations |
| Taux de réussite sur 30 jours | Indicateur de pilotage |

### Exercice

Enrichissez le rapport avec une section comparant, pour chaque job en `Executing`, sa durée actuelle à sa durée moyenne historique obtenue via `GET /run/job/{jobId}/statistics`. Signalez les jobs dépassant le double de leur moyenne.


---

# PARTIE X — Industrialisation


## Administration as Code et Git

*Export des définitions, versionnement, revue par Pull Request.*

### La trajectoire

```text
Administration manuelle
        │
        ▼
Automation API
        │
        ▼
Python
        │
        ▼
JSON
        │
        ▼
Git
        │
        ▼
Pull Request
        │
        ▼
CI/CD
```

Chaque étape répond à une question que la précédente laissait ouverte : l'API rend l'action reproductible, Python la rend composable, le JSON la rend descriptible, Git la rend traçable, la Pull Request la rend relue, la CI la rend automatique.

### Ce que Git apporte à Control-M

```text
Control-M
   │
   ▼
Export JSON
   │
   ▼
Repository Git
   │
   ▼
Historique
```

| Question | Sans Git | Avec Git |
| -------- | -------- | -------- |
| Qui a modifié ce job ? | L'audit Control-M, si activé | `git blame`, avec le motif du commit |
| Quel était l'état la semaine dernière ? | Une sauvegarde, si elle existe | `git checkout` d'un tag |
| Pourquoi cette modification ? | Personne ne s'en souvient | Le message de commit et la Pull Request |
| Qui a validé ? | Un échange oral | L'approbation de la Pull Request |
| Comment revenir en arrière ? | À la main | `git revert`, puis redéploiement |

### Exporter

```text
[CLI ctm] ctm deploy jobs::get -s "<query>"
[REST]    GET /deploy/jobs?<filtres>
```

Les objets exportables couvrent typiquement les jobs, les folders et les calendriers. La liste exacte et la syntaxe des filtres dépendent de la version : vérifiez dans le Swagger de votre instance 9.0.22.

```python
"""[Python] export quotidien des définitions vers Git."""
import json
import subprocess
from pathlib import Path


def git(*args: str) -> subprocess.CompletedProcess:
    """Exécute une commande git dans le dépôt local et vérifie son succès."""
    return subprocess.run(["git", *args], check=True,
                          capture_output=True, text=True)


def exporter(ctm, depot: Path) -> list[Path]:
    """Écrit un fichier de définitions par Control-M/Server."""
    dossier = depot / "definitions"
    dossier.mkdir(parents=True, exist_ok=True)
    ecrits = []

    for server in ctm.get_servers():
        nom = server.get("name")
        definitions = ctm._get("/deploy/jobs", server=nom)

        chemin = dossier / f"{nom}.json"
        # indent et sort_keys sont indispensables : sans eux, deux exports
        # identiques produisent des diffs illisibles et l'historique
        # devient inexploitable.
        chemin.write_text(
            json.dumps(definitions, indent=2, sort_keys=True, ensure_ascii=False),
            encoding="utf-8",
        )
        ecrits.append(chemin)

    return ecrits


def commiter(depot: Path, message: str) -> bool:
    """Commite s'il y a des changements. Renvoie True si un commit a eu lieu."""
    git("-C", str(depot), "add", "definitions")

    # git diff --cached --quiet sort en 1 s'il y a des changements indexés :
    # cela évite de créer un commit vide chaque jour.
    resultat = subprocess.run(
        ["git", "-C", str(depot), "diff", "--cached", "--quiet"]
    )
    if resultat.returncode == 0:
        return False

    git("-C", str(depot), "commit", "-m", message)
    return True
```

Ce script est lui-même ordonnançable dans Control-M. Il produit alors un historique quotidien automatique de vos définitions, indépendamment de la façon dont elles ont été modifiées — y compris à la main dans l'interface.

### Structure du dépôt

```text
controlm-definitions/
│
├── definitions/              ← export automatique, en lecture
│   ├── controlm.json
│   └── controlm-dr.json
│
├── sources/                  ← ce que l'on modifie
│   ├── finance/
│   │   ├── etl_quotidien.json
│   │   └── cloture_mensuelle.json
│   ├── rh/
│   └── commun/
│       └── defaults.json
│
├── environnements/
│   ├── dev.deploy.json       ← deploy descriptors
│   ├── preprod.deploy.json
│   └── prod.deploy.json
│
├── scripts/
├── .gitlab-ci.yml
└── README.md
```

La séparation entre `definitions/` (miroir de la réalité) et `sources/` (intention) est importante : le premier détecte les dérives, le second est la référence.

### Le Deploy Descriptor

Un même fichier de définitions doit pouvoir être déployé sur DEV, PREPROD et PROD sans être modifié. Le **deploy descriptor** applique des règles de transformation aux propriétés lors du déploiement.

```bash
# [REST] déploiement avec descriptor
curl -H "x-api-key: $token" -X POST \
  -F "definitionsFile=@sources/finance/etl_quotidien.json" \
  -F "deployDescriptorFile=@environnements/prod.deploy.json" \
  "$endpoint/deploy"
```

C'est ce qui évite la pire pratique du domaine : maintenir trois copies du même fichier, une par environnement, qui divergent silencieusement.

:::caution
La syntaxe exacte du deploy descriptor doit être vérifiée dans la documentation de votre version. Le principe (transformer les propriétés à la volée) est stable, mais les règles disponibles évoluent.
:::

### La détection de dérive

Comparer l'export du jour au contenu attendu révèle les modifications faites hors du processus.

```python
"""[Python] compare les folders présents dans Control-M et dans Git."""

def folders_de(definitions: dict) -> set[str]:
    return {
        nom for nom, obj in definitions.items()
        if isinstance(obj, dict) and obj.get("Type") == "Folder"
    }


def detecter_derive(export: dict, sources: dict) -> dict[str, set[str]]:
    dans_ctm = folders_de(export)
    dans_git = folders_de(sources)
    return {
        "non_versionnes": dans_ctm - dans_git,   # créés directement dans l'interface
        "non_deployes": dans_git - dans_ctm,     # versionnés mais absents
    }
```

Un folder présent dans Control-M et absent de Git a été créé à la main. Ce n'est pas nécessairement une faute, mais c'est une information à connaître.

### Le processus de modification

```text
Développeur
     │
     ▼
Fichiers JSON
     │
     ▼
Git
     │
     ▼
Pull Request
     │
     ▼
Validation
     │
     ▼
ctm build
     │
     ▼
DEV
     │
     ▼
Tests
     │
     ▼
PREPROD
     │
     ▼
Approbation
     │
     ▼
PROD
```

### Ce que doit vérifier une revue

| Point de contrôle | Question posée |
| ----------------- | -------------- |
| Nommage | Respecte-t-il la convention du site ? |
| `RunAs` | L'utilisateur est-il le bon, avec le moindre privilège ? |
| `Host` | L'Agent ou le host group existe-t-il ? |
| Dépendances | Les Events attendus sont-ils bien produits par quelqu'un ? |
| Calendrier | La fenêtre d'exécution est-elle cohérente avec l'amont ? |
| Notifications | Qui est prévenu en cas d'échec ? |
| Idempotence | Que se passe-t-il si le job est relancé ? |
| Secrets | Aucun mot de passe en clair dans le JSON ? |

Le point sur les Events est celui qui échappe le plus souvent à la revue : un job qui attend `EXTRACT_OK` alors que plus personne ne le produit passe le `build` sans erreur et reste bloqué en production.

### Bonne pratique

Interdisez la modification directe en production dès que le processus Git est en place, et laissez l'export quotidien détecter les exceptions. Une règle non vérifiable n'est pas une règle.

### Exercice

Mettez en place le dépôt, l'export automatique quotidien, et un script de détection de dérive qui échoue si un folder existe dans Control-M sans exister dans Git. Ordonnancez-le dans Control-M.

## CI/CD

*Pipeline GitLab CI et Jenkinsfile pour valider et déployer les définitions Control-M.*

### Le workflow

```text
Développeur
     │
     ▼
Git
     │
     ▼
Pull Request
     │
     ▼
Lint
     │
     ▼
ctm build
     │
     ▼
Tests
     │
     ▼
DEV
     │
     ▼
Tests fonctionnels
     │
     ▼
PREPROD
     │
     ▼
Validation
     │
     ▼
PROD
```

Chaque étape ne passe la main que si la précédente réussit. Le `build` est la barrière la moins chère et la plus rentable : il attrape les erreurs de syntaxe et de règles Control-M sans toucher à aucun environnement.

### Ce que le pipeline doit faire

| Étape | Rôle | Modifie Control-M ? |
| ----- | ---- | ------------------- |
| Lint JSON | Vérifie la syntaxe des fichiers | Non |
| `ctm build` | Valide les définitions contre l'environnement | Non |
| Déploiement DEV | Applique les définitions | Oui, en DEV |
| Tests d'ordonnancement | Ordonnance et vérifie le résultat | Oui, en DEV |
| Déploiement PREPROD | Applique après validation technique | Oui, en PREPROD |
| Déploiement PROD | Applique après approbation manuelle | Oui, en PROD |

### GitLab CI/CD

```yaml title=".gitlab-ci.yml"
stages:
  - lint
  - build
  - deploy-dev
  - test
  - deploy-preprod
  - deploy-prod

default:
  image: python:3.12-slim
  before_script:
    # Une seule dépendance : le pipeline appelle l'API en REST,
    # sans installer la CLI ctm dans le runner.
    - pip install --quiet requests

variables:
  DEFINITIONS_DIR: "sources"

# ---------------------------------------------------------------------------
# 1. Syntaxe JSON — aucune connexion à Control-M nécessaire
# ---------------------------------------------------------------------------
lint:json:
  stage: lint
  script:
    - |
      find "$DEFINITIONS_DIR" -name '*.json' -print0 \
        | xargs -0 -I{} python -c "import json,sys; json.load(open('{}'))"
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == "main"

# ---------------------------------------------------------------------------
# 2. Validation Control-M — ne déploie rien
# ---------------------------------------------------------------------------
build:controlm:
  stage: build
  script:
    - python scripts/ci_build.py "$DEFINITIONS_DIR"
  variables:
    CTM_ENDPOINT: $CTM_DEV_ENDPOINT
  # Les jetons viennent des variables protégées et masquées du projet.
  # Ils ne sont jamais écrits dans le dépôt ni affichés dans les logs.
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == "main"

# ---------------------------------------------------------------------------
# 3. Déploiement DEV — automatique sur main
# ---------------------------------------------------------------------------
deploy:dev:
  stage: deploy-dev
  script:
    - python scripts/ci_deploy.py "$DEFINITIONS_DIR" --descriptor environnements/dev.deploy.json
  variables:
    CTM_ENDPOINT: $CTM_DEV_ENDPOINT
  environment:
    name: dev
  rules:
    - if: $CI_COMMIT_BRANCH == "main"

# ---------------------------------------------------------------------------
# 4. Test d'ordonnancement en DEV
# ---------------------------------------------------------------------------
test:ordonnancement:
  stage: test
  script:
    - python scripts/ci_smoke_test.py --server "$CTM_DEV_SERVER" --folder FORMATION_ETL
  variables:
    CTM_ENDPOINT: $CTM_DEV_ENDPOINT
  rules:
    - if: $CI_COMMIT_BRANCH == "main"

# ---------------------------------------------------------------------------
# 5. PREPROD — manuel
# ---------------------------------------------------------------------------
deploy:preprod:
  stage: deploy-preprod
  script:
    - python scripts/ci_deploy.py "$DEFINITIONS_DIR" --descriptor environnements/preprod.deploy.json
  variables:
    CTM_ENDPOINT: $CTM_PREPROD_ENDPOINT
  environment:
    name: preprod
  when: manual
  rules:
    - if: $CI_COMMIT_BRANCH == "main"

# ---------------------------------------------------------------------------
# 6. PROD — manuel, sur tag uniquement
# ---------------------------------------------------------------------------
deploy:prod:
  stage: deploy-prod
  script:
    - python scripts/ci_deploy.py "$DEFINITIONS_DIR" --descriptor environnements/prod.deploy.json
  variables:
    CTM_ENDPOINT: $CTM_PROD_ENDPOINT
  environment:
    name: production
  when: manual
  rules:
    # Le déploiement en production part d'un tag, jamais d'une branche :
    # on sait exactement quelle version est en production.
    - if: $CI_COMMIT_TAG
```

#### Les variables du projet

| Variable | Type | Protected | Masked |
| -------- | ---- | --------- | ------ |
| `CTM_DEV_ENDPOINT` | Variable | non | non |
| `CTM_PROD_ENDPOINT` | Variable | oui | non |
| `CTM_API_TOKEN` | Variable | oui | oui |
| `CTM_CA_BUNDLE` | File | oui | non |

:::danger
`Masked` empêche l'affichage du token dans les logs du job. `Protected` empêche son exposition aux branches non protégées — sans quoi n'importe qui poussant une branche pourrait lire vos secrets de production via un `echo` dans son `.gitlab-ci.yml`.
:::

Le bundle CA se déclare en variable de type **File** : GitLab l'écrit dans un fichier temporaire et met le chemin dans la variable, exactement ce qu'attend `verify=`.

#### Le script de build

```python
#!/usr/bin/env python3
"""ci_build.py — valide les définitions Control-M sans les déployer."""
import os
import sys
from pathlib import Path

import requests


def build(endpoint: str, token: str, ca: str | None, fichier: Path) -> list[dict]:
    """Envoie un fichier au service build. Renvoie la liste des erreurs."""
    with fichier.open("rb") as f:
        reponse = requests.post(
            f"{endpoint}/build",
            files={"definitionsFile": (fichier.name, f, "application/json")},
            headers={"x-api-key": token},
            timeout=(5, 120),
            verify=ca or True,
        )

    if reponse.status_code == 200:
        return []

    try:
        return reponse.json().get("errors", [{"message": reponse.text[:500]}])
    except ValueError:
        return [{"message": f"HTTP {reponse.status_code} : {reponse.text[:500]}"}]


def main() -> int:
    racine = Path(sys.argv[1] if len(sys.argv) > 1 else "sources")
    endpoint = os.environ["CTM_ENDPOINT"].rstrip("/")
    token = os.environ["CTM_API_TOKEN"]
    ca = os.getenv("CTM_CA_BUNDLE")

    total = 0
    for fichier in sorted(racine.rglob("*.json")):
        erreurs = build(endpoint, token, ca, fichier)
        if not erreurs:
            print(f"OK      {fichier}")
            continue

        total += len(erreurs)
        print(f"ÉCHEC   {fichier}")
        for erreur in erreurs:
            # Le service build renvoie fichier, ligne et colonne :
            # on les affiche pour que la correction soit immédiate.
            position = ""
            if erreur.get("line"):
                position = f" (ligne {erreur['line']}, col {erreur.get('col', '?')})"
            print(f"        {erreur.get('message')}{position}")

    print(f"\n{total} erreur(s)")
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main())
```

### Jenkins

```groovy title="Jenkinsfile"
pipeline {
    agent { label 'linux' }

    environment {
        DEFINITIONS_DIR = 'sources'
    }

    stages {

        stage('Lint JSON') {
            steps {
                sh '''
                    find "$DEFINITIONS_DIR" -name '*.json' -print0 \
                      | xargs -0 -I{} python3 -c "import json;json.load(open('{}'))"
                '''
            }
        }

        stage('Build Control-M') {
            steps {
                // withCredentials injecte le jeton dans une variable
                // d'environnement le temps du bloc, et le masque
                // automatiquement dans la console de sortie.
                withCredentials([
                    string(credentialsId: 'ctm-dev-token', variable: 'CTM_API_TOKEN'),
                    file(credentialsId: 'ctm-ca-bundle',   variable: 'CTM_CA_BUNDLE')
                ]) {
                    sh '''
                        export CTM_ENDPOINT="$CTM_DEV_ENDPOINT"
                        python3 scripts/ci_build.py "$DEFINITIONS_DIR"
                    '''
                }
            }
        }

        stage('Déploiement DEV') {
            when { branch 'main' }
            steps {
                withCredentials([
                    string(credentialsId: 'ctm-dev-token', variable: 'CTM_API_TOKEN'),
                    file(credentialsId: 'ctm-ca-bundle',   variable: 'CTM_CA_BUNDLE')
                ]) {
                    sh '''
                        export CTM_ENDPOINT="$CTM_DEV_ENDPOINT"
                        python3 scripts/ci_deploy.py "$DEFINITIONS_DIR" \
                          --descriptor environnements/dev.deploy.json
                    '''
                }
            }
        }

        stage('Approbation production') {
            when { buildingTag() }
            steps {
                // Un déploiement en production reste une décision humaine,
                // tracée avec le nom de l'approbateur.
                timeout(time: 24, unit: 'HOURS') {
                    input message: 'Déployer en production ?', submitter: 'exploitation'
                }
            }
        }

        stage('Déploiement PROD') {
            when { buildingTag() }
            steps {
                withCredentials([
                    string(credentialsId: 'ctm-prod-token', variable: 'CTM_API_TOKEN'),
                    file(credentialsId: 'ctm-ca-bundle',    variable: 'CTM_CA_BUNDLE')
                ]) {
                    sh '''
                        export CTM_ENDPOINT="$CTM_PROD_ENDPOINT"
                        python3 scripts/ci_deploy.py "$DEFINITIONS_DIR" \
                          --descriptor environnements/prod.deploy.json
                    '''
                }
            }
        }
    }

    post {
        failure {
            mail to: 'exploitation@exemple.fr',
                 subject: "Pipeline Control-M en échec : ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                 body: "Voir ${env.BUILD_URL}"
        }
    }
}
```

### Règles de sécurité du pipeline

```text
INTERDIT                                 OBLIGATOIRE
────────                                 ───────────
Token dans le .gitlab-ci.yml             Variable protégée et masquée
Token dans le Jenkinsfile                Jenkins Credentials
verify=False dans les scripts CI         Bundle CA en variable File
Déploiement PROD automatique             Approbation manuelle
Même token pour DEV et PROD              Un token par environnement
Token sans expiration                    Expiration et rotation planifiées
echo du token pour déboguer              Masquage, et log du seul code HTTP
```

Un token de production accessible depuis un pipeline déclenché par une branche quelconque revient à donner un accès administrateur à Control-M à tout contributeur du dépôt.

### Le smoke test

```python
"""ci_smoke_test.py — ordonnance un folder de test et vérifie qu'il finit OK."""

def smoke_test(ctm, server: str, folder: str, attente: int = 300) -> int:
    reponse = ctm.order_folder(server, folder, ignoreCriteria="true",
                               orderIntoFolder="Alone")
    run_id = reponse["runId"]

    debut = time.monotonic()
    while time.monotonic() - debut < attente:
        etat = ctm.get_run_status(run_id)
        if etat.get("completion") == "Completed":
            # Un folder « Completed » signifie que le suivi est terminé,
            # pas que tous les jobs ont réussi : il faut lire les statuts.
            echecs = [s for s in etat.get("statuses", [])
                      if s.get("status") == "Ended Not OK"]
            for job in echecs:
                print(f"ÉCHEC : {job['name']}")
                print(ctm.get_output(job["jobId"])[:1000])
            return 1 if echecs else 0
        time.sleep(5)

    print(f"Timeout : le run {run_id} n'est pas terminé")
    return 1
```

:::caution
`completion: Completed` indique que le suivi de l'ordonnancement est terminé, pas que les jobs ont réussi. Un smoke test qui s'arrête à ce champ valide des déploiements cassés.
:::

### Exercice

Mettez en place le pipeline complet sur un dépôt de test, avec un token DEV. Vérifiez trois choses : que le `build` échoue sur un JSON volontairement invalide, que le token n'apparaît jamais dans les logs, et que le déploiement en production exige bien une approbation.


---

# PARTIE XI — Projet final


## Le projet final

*Structure complète du package controlm-api-admin et rôle de chaque fichier.*

### L'arborescence

```text
controlm-api-admin/
│
├── src/
│   └── controlm/
│       │
│       ├── __init__.py
│       ├── client.py
│       ├── auth.py
│       ├── config.py
│       ├── exceptions.py
│       │
│       ├── jobs.py
│       ├── folders.py
│       ├── agents.py
│       ├── events.py
│       └── resources.py
│
├── scripts/
│   ├── list_jobs.py
│   ├── failed_jobs.py
│   ├── blocked_jobs.py
│   ├── long_running_jobs.py
│   ├── check_agents.py
│   ├── order_folder.py
│   ├── rerun_job.py
│   └── daily_report.py
│
├── tests/
│   ├── test_client.py
│   ├── test_jobs.py
│   └── test_agents.py
│
├── .env.example
├── .gitignore
├── requirements.txt
├── pyproject.toml
└── README.md
```

### Rôle de chaque module

| Fichier | Responsabilité |
| ------- | -------------- |
| `__init__.py` | Expose l'API publique du package : `ControlMClient`, `Config`, les exceptions |
| `config.py` | Lecture de la configuration et des variables d'environnement |
| `exceptions.py` | Hiérarchie d'exceptions typées |
| `auth.py` | Obtention et renouvellement du token, gestion des deux modes |
| `client.py` | Session HTTP, appel bas niveau, traduction des codes en exceptions |
| `jobs.py` | Recherche, statut, log, output, actions sur les jobs |
| `folders.py` | Ordering, déploiement, définitions |
| `agents.py` | Liste, ping, test, enable, disable, analyse |
| `events.py` | Liste, ajout, suppression |
| `resources.py` | Pools et locks |

La séparation en modules métier garde des fichiers lisibles. Un `client.py` de deux mille lignes est un fichier que personne ne relit.

```text
scripts/          →   utilisent uniquement l'API publique du package
   │
   ▼
src/controlm/
   ├── jobs.py    ┐
   ├── agents.py  ├──► client.py ──► requests.Session
   ├── events.py  │        │
   └── ...        ┘        ├──► config.py
                           └──► exceptions.py
```

### Le point d'entrée du package

```python
"""src/controlm/__init__.py"""
from .client import ControlMClient
from .config import Config
from .exceptions import (
    ControlMError,
    ControlMAuthError,
    ControlMForbidden,
    ControlMNotFound,
    ControlMServerError,
    ControlMValidationError,
)

__all__ = [
    "ControlMClient",
    "Config",
    "ControlMError",
    "ControlMAuthError",
    "ControlMForbidden",
    "ControlMNotFound",
    "ControlMServerError",
    "ControlMValidationError",
]

__version__ = "1.0.0"
```

Déclarer `__all__` définit explicitement ce qui est public. Tout le reste est un détail d'implémentation que vous pouvez modifier sans casser les scripts.

### L'organisation en mixins

Pour éviter un fichier monolithique tout en gardant un seul objet à manipuler, les modules métier peuvent être des mixins composés dans le client.

```python
"""src/controlm/jobs.py"""


class JobsMixin:
    """Opérations sur les jobs. Suppose _get, _post et _appeler."""

    def get_jobs(self, limit: int = 1000, **filtres) -> list[dict]:
        donnees = self._get("/run/jobs/status", limit=limit, **filtres)
        return donnees.get("statuses", [])

    def hold_job(self, job_id: str):
        return self._post(f"/run/job/{job_id}/hold")

    # ... les autres méthodes du chapitre ControlMClient
```

```python
"""src/controlm/client.py"""
from .agents import AgentsMixin
from .events import EventsMixin
from .folders import FoldersMixin
from .jobs import JobsMixin
from .resources import ResourcesMixin


class ControlMClient(JobsMixin, FoldersMixin, AgentsMixin,
                     EventsMixin, ResourcesMixin):
    """Client de l'Automation API Control-M.

    Les mixins apportent les méthodes métier ; cette classe fournit
    la session, la configuration et la traduction des erreurs.
    """
```

L'appelant continue d'écrire `ctm.get_jobs()` et `ctm.ping_agent()` sans savoir d'où viennent ces méthodes.

### pyproject.toml

```toml title="pyproject.toml"
[project]
name = "controlm-api-admin"
version = "1.0.0"
description = "Boîte à outils d'administration Control-M via l'Automation API"
requires-python = ">=3.10"
dependencies = [
    "requests>=2.31",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "responses>=0.25",
    "ruff>=0.5",
]

[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"

[tool.setuptools.packages.find]
where = ["src"]

[tool.ruff]
line-length = 100
```

Installation en mode éditable pendant le développement :

```bash
pip install -e ".[dev]"
```

Ce mode fait que `import controlm` fonctionne depuis n'importe quel répertoire, sans manipuler `PYTHONPATH` dans les scripts.

### .env.example

```env title=".env.example"
# Endpoint de l'Automation API, sans slash final
CTM_ENDPOINT=https://controlm-em.exemple.local:8443/automation-api

# API token (recommandé, Control-M/EM 9.0.21+), envoyé en x-api-key
CTM_API_TOKEN=

# Bundle CA interne permettant de vérifier le certificat du serveur.
# Ne jamais utiliser verify=False à la place.
CTM_CA_BUNDLE=/etc/pki/ca-trust/ctm-ca.pem

# Utilisés uniquement en mode session token (incompatible avec CTM_API_TOKEN)
CTM_USER=
CTM_PASSWORD=
```

### Le README

Un README utile répond à cinq questions, dans cet ordre : ce que fait le projet, comment l'installer, comment le configurer, comment l'utiliser, et à qui s'adresser en cas de problème.

```markdown
# controlm-api-admin

Boîte à outils d'administration Control-M via l'Automation API.

## Installation

    python3 -m venv .venv
    source .venv/bin/activate
    pip install -e ".[dev]"

## Configuration

    cp .env.example .env
    # renseigner CTM_ENDPOINT, CTM_API_TOKEN et CTM_CA_BUNDLE

## Utilisation

    python scripts/failed_jobs.py
    python scripts/check_agents.py
    python scripts/daily_report.py

## Codes retour

     0  normal
     4  anomalies détectées
    16  échec technique

## Contact

Équipe exploitation — exploitation@exemple.fr
```

### Ordonnancer le projet dans Control-M

Le lanceur standardisé évite de répéter l'activation du venv dans chaque job.

```bash title="/opt/controlm/bin/lancer_python.sh"
#!/usr/bin/env bash
# Lanceur standardisé pour les jobs Python d'administration Control-M.
# Usage : lancer_python.sh <script.py> [arguments...]
set -euo pipefail

RACINE="/opt/controlm/controlm-api-admin"

# shellcheck disable=SC1091
source "${RACINE}/.venv/bin/activate"

# Les secrets viennent d'un fichier lisible par le seul compte d'exécution,
# jamais des arguments de la commande : ceux-ci sont visibles avec ps.
set -a
# shellcheck disable=SC1091
source "${RACINE}/.env"
set +a

cd "${RACINE}"
exec python "scripts/$1" "${@:2}"
```

```bash
chmod 700 /opt/controlm/controlm-api-admin/.env
chown ctmuser:ctmgroup /opt/controlm/controlm-api-admin/.env
```

### Bonne pratique

Versionnez ce projet dans son propre dépôt, distinct de celui des définitions de jobs. Les deux ont des cycles de vie et des relecteurs différents.

### Exercice

Assemblez le projet complet à partir des chapitres précédents. Vérifiez qu'aucun script ne contient d'appel `requests` direct, et que `pip install -e .` suivi de `python -c "import controlm"` fonctionne.

## Tester le code Python

*Tests unitaires, mocks de réponses HTTP et simulation des erreurs.*

### Pourquoi tester un client d'API

Un script d'exploitation s'exécute la nuit, sans personne devant l'écran. Les tests répondent à une question simple : que fait le code quand l'API renvoie autre chose que ce que vous espériez ?

```text
Ce que l'on teste                Ce que l'on ne teste PAS
─────────────────                ────────────────────────
Notre parsing des réponses       Que Control-M fonctionne
Notre gestion des erreurs        Le réseau
Nos filtres et notre logique     La performance de l'API
Nos codes retour
```

Un test ne doit jamais appeler le vrai Control-M : il serait lent, dépendant de l'état de l'AJF, et pourrait modifier un environnement.

### Les cas à couvrir

```text
HTTP 200
HTTP 401
HTTP 403
HTTP 404
HTTP 500
Timeout
ConnectionError
```

À ces cas s'ajoutent ceux qui viennent de la forme des données : réponse vide, champ optionnel absent, `outputURI` contenant une phrase et non une URL, corps `text/plain` là où on attendait du JSON.

### Mocker avec responses

```python
"""tests/test_jobs.py"""
import pytest
import responses

from controlm import (Config, ControlMClient, ControlMAuthError,
                      ControlMForbidden, ControlMNotFound, ControlMServerError)

ENDPOINT = "https://ctm-test:8443/automation-api"


@pytest.fixture
def ctm():
    """Client configuré sur un endpoint fictif, jamais appelé réellement."""
    config = Config(endpoint=ENDPOINT, token="jeton-de-test", ca_bundle=None)
    with ControlMClient(config) as client:
        yield client


@responses.activate
def test_get_jobs_extrait_la_cle_statuses(ctm):
    responses.add(
        responses.GET,
        f"{ENDPOINT}/run/jobs/status",
        json={
            "statuses": [
                {"jobId": "ctm:00001", "name": "JOB_A", "status": "Ended OK"},
                {"jobId": "ctm:00002", "name": "JOB_B", "status": "Ended Not OK"},
            ],
            "startIndex": 0,
            "itemsPerPage": 25,
        },
        status=200,
    )

    jobs = ctm.get_jobs()

    # Le piège que ce test verrouille : la réponse est un objet,
    # pas une liste. Itérer dessus directement parcourrait les clés.
    assert len(jobs) == 2
    assert jobs[0]["name"] == "JOB_A"


@responses.activate
def test_liste_vide_n_est_pas_une_erreur(ctm):
    responses.add(responses.GET, f"{ENDPOINT}/run/jobs/status",
                  json={"statuses": []}, status=200)

    assert ctm.get_jobs(status="Ended Not OK") == []
```

### Tester la traduction des erreurs

```python
@responses.activate
@pytest.mark.parametrize("code, exception", [
    (400, "ControlMValidationError"),
    (401, ControlMAuthError),
    (403, ControlMForbidden),
    (404, ControlMNotFound),
    (500, ControlMServerError),
    (503, ControlMServerError),
])
def test_codes_http_traduits_en_exceptions(ctm, code, exception):
    responses.add(
        responses.GET,
        f"{ENDPOINT}/run/job/ctm:00001/status",
        json={"errors": [{"message": "erreur simulée"}]},
        status=code,
    )

    if isinstance(exception, str):
        pytest.skip("importer l'exception attendue")

    with pytest.raises(exception):
        ctm.get_job_status("ctm:00001")
```

Ce test est le plus rentable de tous : il garantit qu'un 403 ne sera jamais confondu avec un 401, et donc qu'aucun script ne bouclera sur un renouvellement de token là où le problème est un rôle insuffisant.

### Simuler les erreurs réseau

```python
import requests


@responses.activate
def test_timeout_leve_une_erreur_controlm(ctm):
    responses.add(
        responses.GET,
        f"{ENDPOINT}/run/jobs/status",
        body=requests.exceptions.Timeout("délai dépassé"),
    )

    with pytest.raises(ControlMError, match="Timeout"):
        ctm.get_jobs()


@responses.activate
def test_serveur_injoignable(ctm):
    responses.add(
        responses.GET,
        f"{ENDPOINT}/config/servers",
        body=requests.exceptions.ConnectionError("connexion refusée"),
    )

    with pytest.raises(ControlMError, match="injoignable"):
        ctm.get_servers()
```

### Tester le contenu text/plain

```python
@responses.activate
def test_output_renvoie_du_texte_brut(ctm):
    responses.add(
        responses.GET,
        f"{ENDPOINT}/run/job/ctm:00001/output",
        body="Traitement démarré\nERREUR : fichier introuvable\n",
        content_type="text/plain",
        status=200,
    )

    sortie = ctm.get_output("ctm:00001")

    # get_output doit renvoyer .text et non .json() : sur un output
    # réel, .json() lèverait une exception.
    assert "fichier introuvable" in sortie
```

### Tester la logique métier sans réseau

La logique de décision se teste sans mock du tout, à condition qu'elle soit séparée des appels HTTP.

```python
from scripts.long_running_jobs import duree_minutes


def test_duree_minutes_gere_un_format_inattendu():
    # Le format des dates varie selon la version : le code ne doit pas
    # planter, sinon un seul job atypique casse tout le rapport.
    assert duree_minutes(None) is None
    assert duree_minutes("") is None
    assert duree_minutes("pas-une-date") is None
```

C'est un argument fort en faveur de la séparation entre collecte et formatage : `collecter()` a besoin de mocks, `formater()` se teste avec un simple dictionnaire.

```python
def test_formater_signale_les_agents_indisponibles():
    donnees = {
        "jobs": [],
        "statuts": Counter({"Ended OK": 10, "Ended Not OK": 2}),
        "held": 1,
        "agents": [
            {"server": "controlm", "nodeid": "agt1", "status": "Available"},
            {"server": "controlm", "nodeid": "agt2", "status": "Unavailable"},
        ],
        "anomalies": [],
    }

    rapport = formater(donnees)

    assert "Agents indisponibles    : 1" in rapport
    assert "agt2" in rapport
```

### Exécuter les tests

```bash
pytest -v
pytest --cov=controlm --cov-report=term-missing
```

Dans le pipeline, les tests passent avant le `build` Control-M : ils ne nécessitent aucun accès à l'API et échouent en quelques secondes.

```yaml
test:python:
  stage: lint
  script:
    - pip install -e ".[dev]"
    - pytest -q
```

### Ce qu'il ne faut pas tester

| À ne pas faire | Pourquoi |
| -------------- | -------- |
| Appeler le vrai Control-M | Lent, instable, et potentiellement destructeur |
| Tester que `requests` fonctionne | C'est le travail de la bibliothèque |
| Viser 100 % de couverture | Le temps est mieux investi sur les cas d'erreur réels |
| Mocker sa propre logique | On ne teste alors plus rien |

### Exercice

Écrivez les tests de `check_agents.py` : un cas où tous les agents sont `Available` et le code retour vaut 0, un cas avec un agent `Unavailable` et un code retour de 1, et un cas où `/config/servers` renvoie 403.


---

# PARTIE XII — Exercices


## Exercices — niveau débutant

*Sept exercices sur les API, avec corrections détaillées.*

Ces exercices utilisent l'API Adresse, publique et sans authentification.

### 1. Appeler une API avec GET

**Énoncé.** Écrivez un script qui interroge l'API Adresse pour « Tour Eiffel » et affiche le code HTTP.

<details>
<summary>Correction</summary>

```python
import requests

reponse = requests.get(
    "https://api-adresse.data.gouv.fr/search/",
    params={"q": "Tour Eiffel", "limit": 1},
    timeout=10,
)
print(reponse.status_code)
```

`params=` construit la query string et encode l'espace. `timeout=10` est déjà un réflexe à prendre, même sur un exercice.
</details>

### 2. Récupérer un JSON

**Énoncé.** Affichez le JSON complet de la réponse, de façon lisible.

<details>
<summary>Correction</summary>

```python
import json

donnees = reponse.json()
print(json.dumps(donnees, indent=2, ensure_ascii=False))
```

`ensure_ascii=False` conserve les accents lisibles. Sans lui, « Amiens » resterait correct mais « Nîmes » deviendrait `N\u00eemes`.
</details>

### 3. Afficher une propriété

**Énoncé.** Affichez uniquement le libellé complet de la première adresse trouvée.

<details>
<summary>Correction</summary>

```python
features = donnees.get("features", [])
if features:
    print(features[0]["properties"]["label"])
else:
    print("Aucun résultat")
```

Le test sur la liste est indispensable : une recherche infructueuse renvoie 200 avec `features` vide, et `features[0]` lèverait `IndexError`.
</details>

### 4. Envoyer des paramètres

**Énoncé.** Recherchez « rue de la Paix » en limitant aux adresses du code postal 75002, et affichez les cinq premiers résultats.

<details>
<summary>Correction</summary>

```python
reponse = requests.get(
    "https://api-adresse.data.gouv.fr/search/",
    params={"q": "rue de la Paix", "postcode": "75002", "limit": 5},
    timeout=10,
)
reponse.raise_for_status()

for feature in reponse.json()["features"]:
    print(feature["properties"]["label"])
```
</details>

### 5. Reproduire dans Postman

**Énoncé.** Refaites l'appel précédent dans Postman, avec les paramètres dans l'onglet **Params**.

<details>
<summary>Correction</summary>

Méthode GET, URL `https://api-adresse.data.gouv.fr/search/`, puis trois lignes dans **Params** : `q`, `postcode`, `limit`.

Vérifiez l'URL reconstruite en haut de la fenêtre : les espaces y apparaissent encodés. C'est exactement ce que `requests` a produit.
</details>

### 6. Reproduire avec curl

**Énoncé.** Écrivez la commande `curl` équivalente, avec sortie formatée.

<details>
<summary>Correction</summary>

```bash
curl -s "https://api-adresse.data.gouv.fr/search/?q=rue%20de%20la%20Paix&postcode=75002&limit=5" \
  | python -m json.tool
```

Les espaces doivent être encodés à la main : `curl` ne le fait pas pour vous, contrairement à `params=` et à Postman.
</details>

### 7. Gérer une erreur 404

**Énoncé.** Appelez une URL inexistante sur le même domaine et traitez proprement l'erreur, sans que le script ne s'arrête sur une trace incompréhensible.

<details>
<summary>Correction</summary>

```python
import requests

url = "https://api-adresse.data.gouv.fr/chemin-inexistant/"

try:
    reponse = requests.get(url, timeout=10)
    reponse.raise_for_status()
    print(reponse.json())

except requests.exceptions.HTTPError as exc:
    # response est disponible sur l'exception : on peut distinguer
    # un 404 d'un 500 sans refaire l'appel.
    code = exc.response.status_code
    if code == 404:
        print("Ressource introuvable : vérifiez le chemin de l'URL")
    else:
        print(f"Erreur HTTP {code}")

except requests.exceptions.RequestException as exc:
    print(f"Erreur réseau : {exc}")
```

Notez l'ordre : `HTTPError` avant `RequestException`, dont elle hérite.
</details>

### Pour aller plus loin

Combinez les sept exercices en un seul script qui prend une adresse en argument de ligne de commande, gère l'absence de résultat et les erreurs réseau, et affiche latitude et longitude dans le bon ordre.

## Exercices — niveau intermédiaire

*Six exercices sur les tokens, POST, erreurs, fonctions, classes et .env.*

### 1. Utiliser un token

**Énoncé.** Écrivez une fonction qui construit les headers d'authentification à partir d'une variable d'environnement, et qui échoue clairement si elle est absente.

<details>
<summary>Correction</summary>

```python
import os


def headers_auth(variable: str = "API_TOKEN") -> dict[str, str]:
    """Construit les headers d'authentification depuis l'environnement."""
    try:
        token = os.environ[variable]
    except KeyError:
        # Échouer ici, avec un message explicite, vaut mieux qu'un 401
        # incompréhensible au premier appel HTTP.
        raise SystemExit(f"Variable {variable} non définie")

    return {"Authorization": f"Bearer {token}", "Accept": "application/json"}
```
</details>

### 2. Réaliser un POST

**Énoncé.** Écrivez la fonction de login Control-M : elle prend un endpoint, un utilisateur et un mot de passe, et renvoie le token.

<details>
<summary>Correction</summary>

```python
import requests


def login(endpoint: str, username: str, password: str, ca_bundle: str) -> str:
    """Ouvre une session Control-M et renvoie le token (valable 30 minutes)."""
    reponse = requests.post(
        f"{endpoint}/session/login",
        # json= sérialise et pose Content-Type: application/json.
        # data= produirait un formulaire et un 415.
        json={"username": username, "password": password},
        timeout=(5, 15),
        verify=ca_bundle,
    )
    reponse.raise_for_status()
    return reponse.json()["token"]
```
</details>

### 3. Gérer les erreurs

**Énoncé.** Écrivez une fonction `appeler()` qui distingue timeout, erreur de connexion, 401, 403 et 5xx, et renvoie un message adapté à chaque cas.

<details>
<summary>Correction</summary>

```python
import requests


def appeler(session, methode: str, url: str, **kwargs) -> requests.Response:
    kwargs.setdefault("timeout", (5, 30))

    try:
        reponse = session.request(methode, url, **kwargs)
    except requests.exceptions.Timeout:
        raise RuntimeError(f"Timeout sur {url}")
    except requests.exceptions.SSLError as exc:
        raise RuntimeError(f"Certificat non validé : {exc}")
    except requests.exceptions.ConnectionError:
        raise RuntimeError(f"Serveur injoignable : {url}")

    if reponse.status_code == 401:
        raise RuntimeError("Token absent, invalide ou expiré")
    if reponse.status_code == 403:
        raise RuntimeError("Authentifié, mais droits insuffisants")
    if reponse.status_code >= 500:
        raise RuntimeError(f"Erreur serveur {reponse.status_code}, réessayable")
    reponse.raise_for_status()

    return reponse
```

L'intérêt des messages distincts : « Token expiré » et « droits insuffisants » n'appellent pas la même action, et personne ne devrait avoir à mémoriser la signification de 401 contre 403 à 3 h du matin.
</details>

### 4. Créer une fonction

**Énoncé.** Écrivez `jobs_en_echec(session, endpoint, token)` qui renvoie la liste des jobs `Ended Not OK`.

<details>
<summary>Correction</summary>

```python
def jobs_en_echec(session, endpoint: str, token: str) -> list[dict]:
    reponse = session.get(
        f"{endpoint}/run/jobs/status",
        params={"status": "Ended Not OK", "limit": 1000},
        headers={"x-api-key": token},
        timeout=(5, 60),
    )
    reponse.raise_for_status()
    # Les jobs sont sous la clé "statuses", pas à la racine.
    return reponse.json().get("statuses", [])
```
</details>

### 5. Créer une classe

**Énoncé.** Transformez la fonction précédente en méthode d'une classe qui possède sa propre session et ses headers.

<details>
<summary>Correction</summary>

```python
import requests


class ClientSimple:
    def __init__(self, endpoint: str, token: str, ca_bundle: str | None = None):
        self.endpoint = endpoint.rstrip("/")
        self.session = requests.Session()
        # Headers et vérification TLS définis une seule fois :
        # aucune méthode ne peut les oublier.
        self.session.headers.update({"x-api-key": token,
                                     "Accept": "application/json"})
        self.session.verify = ca_bundle or True

    def __enter__(self):
        return self

    def __exit__(self, *_exc):
        self.session.close()

    def jobs(self, **filtres) -> list[dict]:
        reponse = self.session.get(
            f"{self.endpoint}/run/jobs/status",
            params={"limit": 1000, **filtres},
            timeout=(5, 60),
        )
        reponse.raise_for_status()
        return reponse.json().get("statuses", [])
```

```python
with ClientSimple(endpoint, token, ca) as client:
    for job in client.jobs(status="Ended Not OK"):
        print(job["name"])
```
</details>

### 6. Utiliser .env

**Énoncé.** Chargez la configuration depuis un `.env`, avec un `.env.example` versionné et un `.gitignore` correct. Vérifiez que le secret n'est pas suivi par Git.

<details>
<summary>Correction</summary>

```env title=".env.example"
CTM_ENDPOINT=https://controlm-em.exemple.local:8443/automation-api
CTM_API_TOKEN=
CTM_CA_BUNDLE=/etc/pki/ca-trust/ctm-ca.pem
```

```gitignore title=".gitignore"
.venv/
__pycache__/
.env
```

```python
import os

from dotenv import load_dotenv

load_dotenv()

endpoint = os.environ["CTM_ENDPOINT"]
token = os.environ["CTM_API_TOKEN"]
ca = os.getenv("CTM_CA_BUNDLE")
```

Vérification :

```bash
git check-ignore -v .env
```

Si la commande ne renvoie rien, `.env` n'est pas ignoré. Corrigez avant tout commit : un secret poussé une fois doit être révoqué, pas seulement supprimé.
</details>

### Pour aller plus loin

Ajoutez à `ClientSimple` un renouvellement automatique du token en cas de 401, avec un garde-fou empêchant plus d'une tentative de renouvellement par appel.

## Exercices — niveau avancé Control-M

*Treize exercices d'exploitation, de l'authentification au rapport quotidien.*

:::caution
Réalisez ces exercices sur un environnement de développement. Les exercices 6 à 8 modifient l'état de Control-M.
:::

### 1. Authentification

**Énoncé.** Obtenez un token, vérifiez sa validité par un appel de lecture, puis fermez la session.

<details>
<summary>Correction</summary>

```python
with ControlMClient(Config.depuis_environnement()) as ctm:
    ctm.login(os.environ["CTM_USER"], os.environ["CTM_PASSWORD"])
    print(ctm.get_servers())      # valide en un appel : URL, token et TLS
    ctm.logout()
```

En mode API token, il n'y a ni login ni logout : le header `x-api-key` suffit, et le service session devient inutilisable.
</details>

### 2. Récupérer les jobs

**Énoncé.** Affichez le nombre de jobs par statut sur l'ensemble de l'AJF.

<details>
<summary>Correction</summary>

```python
from collections import Counter

with ControlMClient(Config.depuis_environnement()) as ctm:
    statuts = Counter(j.get("status", "Inconnu") for j in ctm.get_jobs(limit=10000))

for statut, nombre in statuts.most_common():
    print(f"{statut:<20} {nombre:>6}")
```

Un seul appel large plutôt qu'un appel par statut : moins de charge, et une photographie cohérente.
</details>

### 3. Rechercher un job

**Énoncé.** Recherchez par motif de nom et affichez `jobId`, statut, folder et host.

<details>
<summary>Correction</summary>

```python
def rechercher(ctm, motif: str) -> None:
    jobs = ctm.get_jobs(jobname=motif)
    if not jobs:
        print(f"Aucun job ne correspond à « {motif} »")
        return

    for job in jobs:
        print(f"{job['jobId']:<22} {job['status']:<16} "
              f"{job.get('folder', ''):<25} {job.get('host', '')}")
```
</details>

### 4. Récupérer l'output

**Énoncé.** Affichez l'output du dernier échec d'un job dont vous donnez le nom.

<details>
<summary>Correction</summary>

```python
def dernier_output(ctm, nom: str) -> str | None:
    jobs = ctm.get_jobs(jobname=nom, status="Ended Not OK")
    if not jobs:
        return None

    # Le job le plus récemment terminé d'abord.
    jobs.sort(key=lambda j: j.get("endTime", ""), reverse=True)
    return ctm.get_output(jobs[0]["jobId"])
```

L'output n'existe que pour les exécutions du jour courant. Sur un job qui a échoué hier, l'appel échouera : c'est normal, pas un bug.
</details>

### 5. Récupérer le log

**Énoncé.** Comparez le log et l'output du même job, et concluez sur leur usage respectif.

<details>
<summary>Correction</summary>

```python
job_id = "controlm:00fhb"

print("===== LOG (journal Control-M) =====")
print(ctm.get_log(job_id))

print("\n===== OUTPUT (sortie du traitement) =====")
print(ctm.get_output(job_id))
```

Le log donne la chronologie des statuts et des décisions du Server. L'output donne ce que le script a écrit. Pour un `Ended Not OK`, la cause est dans l'output.
</details>

### 6. Créer un job

**Énoncé.** Créez `JOB_HELLO_WORLD`, validez-le avec `build`, puis déployez-le.

<details>
<summary>Correction</summary>

```json
{
  "Defaults": { "Application": "FORMATION", "RunAs": "ctmuser",
                "Host": "agent-dev-01" },
  "FORMATION_HELLO": {
    "Type": "Folder",
    "ControlmServer": "controlm",
    "JOB_HELLO_WORLD": {
      "Type": "Job:Command",
      "Command": "echo \"Hello Control-M\""
    }
  }
}
```

```bash
ctm build hello_world.json && ctm deploy hello_world.json
```

Le `&&` garantit qu'un build en échec n'aboutit pas à un déploiement.
</details>

### 7. Déployer un Folder

**Énoncé.** Déployez par REST avec un deploy descriptor, et gérez le cas d'erreur.

<details>
<summary>Correction</summary>

```python
def deployer(ctm, fichier: str, descriptor: str | None = None):
    fichiers = {"definitionsFile": (fichier, open(fichier, "rb"), "application/json")}
    if descriptor:
        fichiers["deployDescriptorFile"] = (
            descriptor, open(descriptor, "rb"), "application/json"
        )
    try:
        # Un déploiement peut durer : timeout de lecture allongé.
        return ctm._appeler("POST", "/deploy", files=fichiers,
                            timeout=(5, 180)).json()
    finally:
        # On ferme les fichiers même en cas d'exception.
        for _, (_, handle, _) in fichiers.items():
            handle.close()
```
</details>

### 8. Ordonnancer une chaîne

**Énoncé.** Ordonnancez un folder, suivez le `runId` jusqu'au bout, et affichez le statut final de chaque job.

<details>
<summary>Correction</summary>

```python
import time


def ordonnancer_et_suivre(ctm, server: str, folder: str, attente: int = 300):
    run_id = ctm.order_folder(server, folder, ignoreCriteria="true",
                              orderIntoFolder="Alone")["runId"]

    debut = time.monotonic()
    while time.monotonic() - debut < attente:
        etat = ctm.get_run_status(run_id)
        if etat.get("completion") == "Completed":
            return etat.get("statuses", [])
        time.sleep(5)

    raise TimeoutError(f"Run {run_id} toujours en cours après {attente} s")
```

`completion: Completed` signifie que le suivi est terminé, pas que tout a réussi : il faut lire chaque `status`.
</details>

### 9. Détecter les jobs en échec

**Énoncé.** Produisez un rapport des échecs, avec les 20 premières lignes d'output pour chacun.

<details>
<summary>Correction</summary>

```python
def rapport_echecs(ctm) -> str:
    lignes = []
    for job in ctm.get_jobs(status="Ended Not OK"):
        lignes.append(f"\n{'=' * 70}\n{job['name']} ({job['jobId']})")
        lignes.append(f"Host : {job.get('host') or 'non renseigné'}\n{'-' * 70}")
        try:
            sortie = ctm.get_output(job["jobId"])
            lignes.extend(sortie.splitlines()[:20])
        except ControlMError as exc:
            # Un output indisponible ne doit pas interrompre le rapport.
            lignes.append(f"Output indisponible : {exc}")
    return "\n".join(lignes)
```
</details>

### 10. Rechercher les jobs bloqués

**Énoncé.** Listez les jobs en attente avec la raison exacte de l'attente.

<details>
<summary>Correction</summary>

```python
ATTENTES = ("Wait Condition", "Wait Resource", "Wait Host",
            "Wait User", "Wait Workload")


def jobs_bloques(ctm) -> list[dict]:
    resultats = []
    for job in ctm.get_jobs(status=",".join(ATTENTES)):
        entree = {"nom": job["name"], "statut": job["status"]}
        try:
            entree["raison"] = ctm.get_waiting_info(job["jobId"])
        except ControlMError as exc:
            entree["raison"] = f"indisponible : {exc}"
        resultats.append(entree)
    return resultats
```
</details>

### 11. Vérifier les Agents

**Énoncé.** Parcourez tous les serveurs, listez les agents non disponibles, et lancez un ping sur chacun d'eux.

<details>
<summary>Correction</summary>

```python
def verifier_agents(ctm) -> int:
    anomalies = 0
    for server in ctm.get_servers():
        nom = server.get("name")
        for agent in ctm.get_agents(nom):
            if agent["status"] == "Available":
                continue
            anomalies += 1
            print(f"[{agent['status']}] {nom}/{agent['nodeid']}")
            try:
                # discover=False : un outil de supervision ne doit jamais
                # modifier la configuration qu'il observe.
                print("   ping :", ctm.ping_agent(nom, agent["nodeid"]))
            except ControlMError as exc:
                print(f"   ping impossible : {exc}")
    return 1 if anomalies else 0
```
</details>

### 12. Diagnostiquer un Wait Condition

**Énoncé.** Pour un job en `Wait Condition`, identifiez l'Event attendu, vérifiez s'il existe, et si oui comparez sa date.

<details>
<summary>Correction</summary>

```python
def diagnostiquer(ctm, job_id: str, server: str) -> None:
    job = ctm.get_job_status(job_id)
    print(f"{job['name']} — ODATE {job.get('orderDate')}")
    print("Attente :", ctm.get_waiting_info(job_id))

    print("\nEvents présents sur le serveur :")
    for event in ctm.get_events(server=server):
        print(f"  {event['name']:<45} date={event['date']}")
```

Si l'Event existe au bon nom mais avec une date différente de l'ODATE du job, vous avez la cause. Cherchez ensuite le producteur avec une recherche sur `eventName`.
</details>

### 13. Rapport d'exploitation

**Énoncé.** Assemblez les exercices 2, 9, 10 et 11 en un rapport unique, avec un code retour signifiant.

<details>
<summary>Correction</summary>

Reprenez `daily_report.py` du chapitre consacré au rapport quotidien. Les points à respecter :

```text
0  → aucune anomalie
4  → anomalies détectées
16 → rapport non produit (API injoignable)
```

La distinction entre 4 et 16 est le cœur de l'exercice : un rapport signalant douze échecs est une information ; un rapport qui n'a pas pu être produit est une absence d'information, donc plus grave.
</details>

### Projet de synthèse

Assemblez l'ensemble en un package installable, avec des tests, une configuration externalisée, un pipeline CI qui valide vos définitions, et un job Control-M qui exécute le rapport quotidien chaque matin.


---

# ANNEXES


## Référence des endpoints

*Correspondance CLI ctm, REST et méthode HTTP, vérifiée sur la documentation BMC.*

:::caution
Ce tableau est une aide-mémoire. La source de vérité de votre installation reste le Swagger de votre instance : `https://<votre-endpoint>:8443/automation-api`. Vérifiez-y toute commande avant un usage en production.
:::

### Authentification

| CLI `ctm` | Méthode | Chemin REST |
| --------- | ------- | ----------- |
| `session login` | POST | `/session/login` |
| `session logout` | POST | `/session/logout` |
| `session user:password::update` | POST | `/session/user/password/update` |

| Type de token | Header | Durée |
| ------------- | ------ | ----- |
| API token | `x-api-key: <token>` | définie à la création, Control-M/EM 9.0.21+ |
| Session token | `Authorization: Bearer <token>` | 30 minutes |

### Jobs — lecture

| CLI `ctm` | Méthode | Chemin REST |
| --------- | ------- | ----------- |
| `run jobs:status::get` | GET | `/run/jobs/status?<filtres>&limit=<n>` |
| `run job:status::get` | GET | `/run/job/{jobId}/status` |
| `run job:output::get` | GET | `/run/job/{jobId}/output?runNo=<n>` |
| `run job:log::get` | GET | `/run/job/{jobId}/log` |
| `run job:statistics::get` | GET | `/run/job/{jobId}/statistics` |
| `run job::waitingInfo` | GET | `/run/job/{jobId}/waitingInfo` |
| `run job::get` | GET | `/run/job/{jobId}/get` |
| `run job::related` | GET | `/run/job/{jobId}/related` |
| `run status` | GET | `/run/status/{runId}` |

### Jobs — actions

| CLI `ctm` | Méthode | Chemin REST |
| --------- | ------- | ----------- |
| `run job::hold` | POST | `/run/job/{jobId}/hold` |
| `run job::free` | POST | `/run/job/{jobId}/free` |
| `run job::rerun` | POST | `/run/job/{jobId}/rerun` |
| `run job::kill` | POST | `/run/job/{jobId}/kill` |
| `run job::runNow` | POST | `/run/job/{jobId}/runNow` |
| `run job::setToOk` | POST | `/run/job/{jobId}/setToOk` |
| `run job::confirm` | POST | `/run/job/{jobId}/confirm` |
| `run job::delete` | POST | `/run/job/{jobId}/delete` |
| `run job::undelete` | POST | `/run/job/{jobId}/undelete` |
| `run job::modify` | POST | `/run/job/{jobId}/modify` |
| `run job::bypass` | POST | `/run/job/{jobId}/bypass` |

### Ordonnancement

| CLI `ctm` | Méthode | Chemin REST |
| --------- | ------- | ----------- |
| `run` | POST | `/run` |
| `run order` | POST | `/run/order` |
| `run ondemand` | POST | `/run/ondemand` |

`run ondemand` requiert Control-M/EM 9.0.21.200 ou supérieur.

#### Corps de `/run/order`

```json
{
  "ctm": "controlm",
  "folder": "MON_FOLDER",
  "jobs": "JOB_A,JOB_B",
  "hold": "false",
  "ignoreCriteria": "true",
  "orderDate": "20260910",
  "waitForOrderDate": "false",
  "orderIntoFolder": "New",
  "createDuplicate": "true",
  "independentFlow": "true",
  "variables": [ { "arg": "12345" } ]
}
```

### Events

| CLI `ctm` | Méthode | Chemin REST |
| --------- | ------- | ----------- |
| `run events::get` | GET | `/run/events?<filtres>` |
| `run event::add` | POST | `/run/event/{server}` |
| `run event::delete` | DELETE | `/run/event/{server}/{name}/{date}` |

Valeurs de date : `MMDD`, `ODAT` (date Control-M courante), `STAT` (sans date).

### Ressources

| CLI `ctm` | Méthode | Chemin REST |
| --------- | ------- | ----------- |
| `run resources::get` | GET | `/run/resources?<filtres>` |
| `run resource::add` | POST | `/run/resource/{server}` |
| `run resource::update` | POST | `/run/resource/{server}/{name}` |
| `run resource::delete` | DELETE | `/run/resource/{server}/{name}` |

### Workload Policies

| CLI `ctm` | Méthode | Chemin REST |
| --------- | ------- | ----------- |
| `run workloadpolicies::get` | GET | `/run/workloadpolicies?state=Active` |
| `run workloadpolicies:detailed::get` | GET | `/run/workloadpolicies/detailed` |
| `run workloadpolicies::add` | POST | `/run/workloadpolicies` |
| `run workloadpolicy::delete` | DELETE | `/run/workloadpolicy/{name}` |
| `run workloadpolicy::activate` | POST | `/run/workloadpolicy/{name}/activate?server=<s>` |
| `run workloadpolicy::deactivate` | POST | `/run/workloadpolicy/{name}/deactivate?server=<s>` |

### Services SLA

| CLI `ctm` | Méthode | Chemin REST |
| --------- | ------- | ----------- |
| `run services:sla::get` | GET | `/run/services/sla` |

Requiert Control-M/EM 9.0.18.200 ou supérieur.

### Configuration — Servers et Agents

| CLI `ctm` | Méthode | Chemin REST |
| --------- | ------- | ----------- |
| `config servers::get` | GET | `/config/servers` |
| `config server:hostgroups::get` | GET | `/config/server/{server}/hostgroups` |
| `config server:agents::get` | GET | `/config/server/{server}/agents?agent=<motif>` |
| `config server:agent::add` | POST | `/config/server/{server}/agent` |
| `config server:agent::update` | POST | `/config/server/{server}/agent/{agent}/update` |
| `config server:agent::test` | POST | `/config/server/{server}/agent/{agent}/test` |
| `config server:agent::ping` | POST | `/config/server/{server}/agent/{agent}/ping` |
| `config server:agent::enable` | POST | `/config/server/{server}/agent/{agent}/enable` |
| `config server:agent::disable` | POST | `/config/server/{server}/agent/{agent}/disable` |
| `config server:agent::analysis` | POST | `/config/server/{server}/agent/{agent}/analysis` |
| `config server:agent::delete` | DELETE | `/config/server/{server}/agent/{agent}` |
| `config server:hostRestrictions::get` | GET | `/config/server/{server}/hostRestrictions` |
| `config item::recycle` | POST | `/config/item/{id}/recycle` |

Versions minimales : `agent::test` et `loadbalancer::*` requièrent Control-M/EM 9.0.21.200 ; `agent::analysis` requiert 9.0.21.

### Build et déploiement

| CLI `ctm` | Méthode | Chemin REST |
| --------- | ------- | ----------- |
| `build` | POST | `/build` |
| `deploy` | POST | `/deploy` |
| `deploy jobs::get` | GET | `/deploy/jobs?<filtres>` |
| `deploy ai:jobtypes::get` | GET | `/deploy/ai/jobtypes/?<filtres>` |

Les envois de fichiers se font en multipart, avec le champ `definitionsFile` et, optionnellement, `deployDescriptorFile`.

### Service

| Objet | Méthode | Chemin REST |
| ----- | ------- | ----------- |
| Statut du serveur API | GET | `/status` |
| Licence | GET | `/license` |
| Spécification YAML | GET | `/yaml` |

### Codes HTTP renvoyés par l'API

| Code | Signification |
| ---- | ------------- |
| 200 | Succès |
| 400 | Erreurs dans les données de la requête |
| 403 | Utilisateur non autorisé pour cette action ou cette ressource |
| 404 | Élément introuvable |
| 405 | Méthode REST non reconnue |
| 500 | Erreur interne du serveur |
| 503 | Service indisponible après un redémarrage du serveur |

Corps d'erreur :

```json
{
  "errors": [
    { "message": "texte", "id": 0, "item": "élément",
      "file": "fichier", "line": 0, "col": 0 }
  ]
}
```

### Statuts de job

```text
Ended OK
Ended Not OK
Executing
Wait User
Wait Resource
Wait Host
Wait Workload
Wait Condition
Status Unknown
```

### Statuts d'Agent

```text
Available
Unavailable
Disabled
Discovering
```

### Champs de recherche des jobs

```text
jobname            application         resourceLock
jobid              subApplication      resourcePool
folder             host                eventName
folderLibrary      hostGroup           waitForEventName
server             description         workloadPolicy
command            runAs               ruleBasedCalender
filePath           fileName
```

Filtres temporels : `orderDateFrom`, `orderDateTo` (`YYMMDD`), `fromTime`, `toTime` (`YYYYMMDDhhmmss`), `historyRunDate`, `eventDate`, `waitForEventDate` (`MMDD`).

Booléens : `held`, `folderHeld`, `cyclic`, `deleted`.

Voisinage : `neighborhood` avec `jobid`, `depth` et `direction` (`depend`, `predecessor`, `radial`).

### Annotation

Quand l'audit l'exige :

```text
CLI   : -a "subject=<sujet>&description=<description>"
REST  : -H "Annotation-Subject: <sujet>" -H "Annotation-Description: <description>"
```

## Conventions de schématisation

*Les règles graphiques utilisées dans toute la documentation.*

### Pourquoi pas Mermaid

Cette documentation est publiée avec Astro Starlight. Les diagrammes Mermaid n'y fonctionnent pas de manière fiable. Tous les schémas sont donc réalisés en ASCII et Unicode, dans des blocs de code `text`.

Ce choix a des avantages qui dépassent la contrainte technique : les schémas sont lisibles dans le fichier `.md` brut, sur GitHub, dans un terminal, et dans un e-mail. Ils se copient, se modifient sans outil, et ne dépendent d'aucun moteur de rendu.

### Les éléments graphiques

```text
┌───────────────┐
│  Composant    │
└───────────────┘

       │
       ▼
 Flux normal

──────►
 Communication

◄─────►
 Communication bidirectionnelle

       ├──
       └──
 Branche

[OK]
[ERREUR]
[ATTENTE]
```

### Décision

```text
            Condition ?
             /      \
           OUI      NON
            │        │
            ▼        ▼
```

Ou, pour un arbre plus dense :

```text
Condition ?
     │
 ┌───┴────┐
 │        │
NON      OUI
 │        │
 ▼        ▼
```

### Les cinq formes autorisées

1. Schémas ASCII et Unicode dans des blocs `text`.
2. Tableaux Markdown.
3. Listes hiérarchiques.
4. Arbres de décision textuels.
5. Séquences numérotées.

Ces règles couvrent toutes les représentations du document : architectures, workflows, chaînes Control-M, dépendances, API, authentification, diagnostics, CI/CD, PostgreSQL, Agents, cycle de vie des jobs et processus d'administration.

### Découper plutôt qu'entasser

Un schéma qui ne tient pas dans un écran n'est plus un schéma, c'est un labyrinthe.

```text
Architecture globale
        │
        ├── Architecture EM
        │
        ├── Architecture Server
        │
        ├── Architecture Agents
        │
        ├── Architecture Automation API
        │
        └── Architecture PostgreSQL
```

Chaque sous-partie fait ensuite l'objet d'un schéma distinct.

### Toujours expliquer

Aucun schéma n'est laissé seul. Chacun est suivi d'un tableau de rôles, puis d'une explication du chemin de l'information.

| Élément | Rôle |
| ------- | ---- |
| Client Python | Envoie les requêtes à l'API |
| Automation API | Expose les opérations Control-M en REST |
| Enterprise Manager | Point de gestion central |
| Control-M/Server | Moteur d'ordonnancement |
| Agent | Exécute réellement les traitements |

### Le critère de réussite

Un schéma est réussi lorsqu'un lecteur comprend le processus **avant même de lire l'explication détaillée**.

```text
Simplicité
    +
Lisibilité
    +
Progression
    +
Explication
```

L'objectif n'est pas de produire de beaux diagrammes techniques, mais de rendre les architectures et les processus immédiatement compréhensibles dans Astro Starlight, sur GitHub et dans le fichier Markdown brut.

### Étiquetage des blocs de code

Chaque bloc de commande indique où l'exécuter. La règle est absolue : on ne mélange jamais CLI, REST et Python dans un même bloc.

| Étiquette | Où | Avec quoi |
| --------- | -- | --------- |
| `[CLI ctm]` | N'importe quel poste | CLI Automation API et un token |
| `[REST]` | N'importe où | `curl` et un token |
| `[Python]` | N'importe où | `requests` et un token |
| `[Control-M/Server]` | Machine du Server | Compte propriétaire |
| `[Control-M/EM]` | Machine de l'EM | Compte propriétaire |
| `[PostgreSQL]` | Machine de la base | `postgres` ou propriétaire |

### Structure d'un exemple complet

```text
Objectif
Contexte
Principe
Schéma
API utilisée
Endpoint
Méthode HTTP
Headers
Query parameters
Body
Test Postman
Commande curl
Code Python
Explication du code
Réponse attendue
Codes HTTP possibles
Erreurs fréquentes
Troubleshooting
Bonne pratique
Exercice
```

Les rubriques sans objet pour un exemple donné sont omises, mais l'ordre reste constant afin que le lecteur sache où chercher.

### Callouts Starlight

```markdown
:::note
Information complémentaire.
:::

:::tip
Astuce ou raccourci utile.
:::

:::caution
Point d'attention : erreur fréquente, comportement contre-intuitif.
:::

:::danger
Risque réel : perte de données, faille de sécurité, incident de production.
:::
```

Réservez `:::danger` aux situations qui peuvent réellement causer un dommage. Un avertissement utilisé partout ne prévient plus de rien.
