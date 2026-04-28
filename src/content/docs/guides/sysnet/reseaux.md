---
title: "Les réseaux informatiques"
description: "Guide pratique pour l'administration, la sécurité et la supervision"
created: "2026-04-26"
updated: "2026-04-27"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"
---


> *De A à Z — Des bases absolues à la cybersécurité avancée, avec analogies, pratiques sectorielles et scénarios d'incidents.*

---

## 📖 Table des matières

1. [Avant-propos](#avant-propos)
2. [Les fondamentaux](#volet-1--les-fondamentaux)
3. [OSI vers la pratique](#volet-2--osi-vers-la-pratique)
4. [Capstone : Homelab d'entreprise](#volet-3--capstone--homelab-dentreprise)
5. [Sécurité par secteur d'activité](#sécurité-par-secteur-dactivité)
6. [Cyberattaques et défense](#cyberattaques-et-défense)
7. [Supervision et métrologie](#supervision-et-métrologie)
8. [Scénarios d'incidents (transversal)](#scénarios-dincidents-transversal)
9. [Glossaire](#glossaire)

---

## Avant-propos

### À qui s'adresse ce guide ?

Ce document est conçu pour **tout type de public** :

- 🎓 **Étudiants et débutants** : aucun prérequis technique. Les concepts sont introduits par des analogies du quotidien.
- 👨‍💻 **Administrateurs réseau** : approfondir les pratiques avancées (VLANs, SDN, supervision).
- 🔒 **Professionnels de la cybersécurité** : comprendre les attaques et les défenses au niveau réseau.
- 🏢 **Décideurs IT** : choisir les bonnes solutions selon le secteur d'activité.

### Comment lire ce guide ?

Chaque chapitre suit la structure suivante :

| Pictogramme | Signification |
|-------------|---------------|
| 🎯 | Objectif d'apprentissage |
| 💡 | Analogie pour comprendre |
| ⚙️ | Configuration / commande pratique |
| ⚠️ | Point de vigilance / faille de sécurité |
| 🏥 | Application sectorielle (santé, banque, etc.) |
| 🛡️ | Bonne pratique de sécurité |
| 🔧 | Exercice pratique homelab |

---

# Les fondamentaux

## Les bases absolues d'un réseau

### 🎯 Objectif

Comprendre ce qu'est un réseau, pourquoi il existe et comment deux machines peuvent "se parler".

### 💡 Analogie : le réseau, c'est la poste

Imaginez que vous voulez envoyer une **lettre** à votre ami :

1. Vous écrivez son **adresse** sur l'enveloppe (= adresse IP).
2. Vous précisez votre adresse de retour (= IP source).
3. Vous mettez la lettre dans une **enveloppe** (= encapsulation).
4. Le facteur passe de **bureau de poste en bureau de poste** (= routeurs).
5. Pour que votre ami reçoive le courrier dans **sa chambre précise** au sein de la maison, on indique aussi un numéro d'appartement (= port).

Un réseau informatique fonctionne **exactement** de la même manière, mais à la vitesse de la lumière.

### Définitions clés

- **Réseau** : ensemble de machines (ordinateurs, serveurs, téléphones, objets connectés) qui peuvent échanger des données.
- **LAN** (Local Area Network) : votre maison, votre bureau. Quelques mètres à quelques centaines de mètres.
- **WAN** (Wide Area Network) : Internet, les liaisons entre villes ou pays.
- **Protocole** : la "langue" commune que les machines doivent parler pour se comprendre.

### Le modèle en couches : l'idée clé

Plutôt que d'avoir UN énorme protocole qui fait tout, on découpe en **couches spécialisées**, comme dans une entreprise :

| Couche | Rôle | Analogie |
|--------|------|----------|
| Application | Ce que voit l'utilisateur (navigateur, email) | Le contenu de la lettre |
| Transport | Fiabilité, ordre des données | Le service Chronopost vs lettre simple |
| Réseau | Acheminement entre réseaux | La route postale entre villes |
| Liaison | Communication entre voisins directs | La rue dans le quartier |
| Physique | Le câble, l'onde Wi-Fi | Le facteur lui-même |

> 🛡️ **Bonne pratique** : comprendre où "ça casse" dans la pile permet de diagnostiquer 90% des pannes en quelques minutes.

---

## 02 — Adressage IP et sous-réseaux

### 🎯 Objectif

Savoir lire une adresse IP, comprendre les masques de sous-réseau, calculer un sous-réseau.

### 💡 Analogie : l'adresse IP, c'est le numéro de rue

Une adresse IPv4 ressemble à `192.168.1.42`. C'est l'équivalent de :

- **192.168.1** : la rue (le réseau)
- **42** : le numéro de la maison (l'hôte)

Le **masque de sous-réseau** dit où s'arrête la rue et où commence le numéro :
- `/24` (ou `255.255.255.0`) : les 24 premiers bits sont la rue, les 8 derniers sont les maisons. → 254 maisons possibles.
- `/16` : 65 534 maisons (un quartier entier).
- `/30` : 2 maisons (une liaison point-à-point entre deux routeurs).

### Les classes IP (historique) et le CIDR

À l'origine, IP était divisé en **classes A/B/C**. Aujourd'hui on utilise le **CIDR** (Classless Inter-Domain Routing) qui permet une découpe libre.

#### Plages privées (à connaître par cœur)

| Plage | Masque par défaut | Usage typique |
|-------|-------------------|----------------|
| `10.0.0.0` à `10.255.255.255` | /8 | Grandes entreprises |
| `172.16.0.0` à `172.31.255.255` | /12 | Entreprises moyennes |
| `192.168.0.0` à `192.168.255.255` | /16 | Box internet, PME, homelab |

⚠️ Ces adresses **ne sont pas routables sur Internet**. Elles passent par du NAT (voir plus loin).

### ⚙️ Calculer un sous-réseau (exemple pratique)

Soit le réseau `192.168.10.0/26`. Combien d'hôtes ? Quelle est la plage ?

- `/26` = 32 - 26 = **6 bits hôtes** = 2⁶ = 64 adresses
- Adresses utilisables : 64 - 2 (réseau + broadcast) = **62 hôtes**
- Plage : `192.168.10.0` (réseau) → `192.168.10.63` (broadcast)
- Hôtes : `192.168.10.1` à `192.168.10.62`

> 💡 Mémo : pour un /N, les hôtes utilisables = 2^(32-N) - 2

### 🏥 Application sectorielle : segmentation hospitalière

Dans un hôpital, on **séparera systématiquement** :
- `10.10.0.0/22` : postes administratifs
- `10.20.0.0/22` : équipements médicaux (IRM, scanners)
- `10.30.0.0/24` : Wi-Fi patients
- `10.40.0.0/24` : caméras de surveillance

Cette segmentation par IP **+** VLAN empêche un patient sur le Wi-Fi public d'attaquer un IRM.

---

## 03 — IPv6 minimal

### 🎯 Objectif

Comprendre pourquoi IPv6 existe, lire une adresse IPv6, configurer le minimum vital.

### Pourquoi IPv6 ?

IPv4 = 4,3 milliards d'adresses. La planète a dépassé ce chiffre **dès 2011**. IPv6 = **340 sextillions** d'adresses (3,4 × 10³⁸) — assez pour donner une IP à chaque grain de sable.

### Format d'une adresse IPv6

`2001:0db8:85a3:0000:0000:8a2e:0370:7334`

Règles de simplification :
- Les zéros de tête de chaque groupe peuvent être omis
- Une suite de zéros consécutifs peut être remplacée par `::` (une seule fois)

→ Devient : `2001:db8:85a3::8a2e:370:7334`

### Les types d'adresses essentiels

| Type | Préfixe | Rôle |
|------|---------|------|
| Link-local | `fe80::/10` | Communication locale (équivalent du 169.254 IPv4) |
| Unique local | `fc00::/7` | Équivalent des plages privées IPv4 |
| Global unicast | `2000::/3` | Adresses publiques routables |

### SLAAC : la magie de l'auto-configuration

Contrairement à IPv4 qui a besoin de DHCP, IPv6 peut s'auto-configurer via **SLAAC** (Stateless Address Auto-Configuration) :

1. La machine génère une adresse link-local automatiquement
2. Elle écoute les **Router Advertisements** envoyés par le routeur
3. Elle se construit elle-même son IP globale

### Dual-stack : la transition

En 2026, la quasi-totalité des réseaux d'entreprise tournent en **dual-stack** : IPv4 ET IPv6 cohabitent. Les services modernes préfèrent IPv6 quand il est disponible.

> 🛡️ **Bonne pratique** : ne JAMAIS désactiver IPv6 sur une machine sans comprendre l'impact. Beaucoup de services modernes (Microsoft 365, Apple, Google) le préfèrent.

---

## 04 — Routage

### 🎯 Objectif

Comprendre comment un paquet trouve son chemin entre deux machines distantes.

### 💡 Analogie : le GPS du paquet

Quand vous conduisez de Paris à Marseille, vous ne connaissez pas tout le trajet à l'avance. À chaque embranchement, un panneau vous oriente vers la bonne direction.

Le **routeur** est ce panneau. Il consulte sa **table de routage** pour décider où envoyer chaque paquet.

### La table de routage minimale

```
Destination     Passerelle    Interface
192.168.1.0/24  *             eth0      (réseau direct)
0.0.0.0/0       192.168.1.1   eth0      (route par défaut)
```

La **route par défaut** (`0.0.0.0/0`) signifie : "pour tout ce que je ne connais pas, envoie au routeur 192.168.1.1".

### Routage statique vs dynamique

- **Statique** : l'admin écrit chaque route à la main. Simple, prévisible, mais ne s'adapte pas.
- **Dynamique** : les routeurs se parlent et apprennent les routes (OSPF, BGP, EIGRP).

### Les protocoles dynamiques principaux

| Protocole | Usage | Échelle |
|-----------|-------|---------|
| OSPF | Réseau interne d'entreprise | LAN/WAN privé |
| BGP | Internet, opérateurs | Mondial |
| EIGRP | Réseaux Cisco | Privé |

### ⚙️ Voir et modifier la table de routage (Linux)

```bash
# Afficher
ip route show

# Ajouter une route statique
sudo ip route add 10.20.0.0/16 via 192.168.1.254

# Route par défaut
sudo ip route add default via 192.168.1.1
```

### ⚠️ Le piège classique : la route asymétrique

Le paquet part par un chemin, le retour passe par un autre. Résultat : un firewall stateful coupe la connexion (il n'a pas vu le départ).

→ Toujours vérifier que **aller et retour** empruntent le même chemin (ou que les firewalls sont configurés pour l'asymétrie).

---

## 05 — TCP et UDP

### 🎯 Objectif

Distinguer les deux grands protocoles de transport et savoir quand utiliser l'un ou l'autre.

### 💡 Analogie : la lettre recommandée vs la carte postale

- **TCP** = lettre recommandée avec accusé de réception.
  - On vérifie que le destinataire existe (poignée de main en 3 temps : SYN, SYN-ACK, ACK).
  - Chaque page numérotée, ré-envoi en cas de perte.
  - Lent mais fiable.

- **UDP** = carte postale.
  - On envoie sans confirmation.
  - Si elle est perdue, tant pis.
  - Rapide mais non fiable.

### Quand utiliser TCP ?

✅ Web (HTTP/HTTPS), Email, SSH, transfert de fichiers, bases de données.
→ Tout ce qui doit arriver **complet et dans l'ordre**.

### Quand utiliser UDP ?

✅ Voix sur IP, streaming vidéo, jeux en ligne, DNS, SNMP.
→ Tout ce qui doit arriver **vite, quitte à perdre quelques paquets**.

> 💡 En VoIP, perdre 50 ms de son est inaudible. Ré-émettre 200 ms plus tard est inutile.

### La poignée de main TCP en 3 temps

```
Client                    Serveur
  |  ----- SYN ----->       |     "Salut, tu es là ?"
  |  <--- SYN-ACK ----      |     "Oui, et toi ?"
  |  ----- ACK ----->       |     "Oui aussi. C'est parti."
```

### Notion de port

Un port = un numéro qui identifie le **service** sur la machine.

| Port | Protocole | Service |
|------|-----------|---------|
| 22 | TCP | SSH |
| 25 | TCP | SMTP (email) |
| 53 | UDP/TCP | DNS |
| 80 | TCP | HTTP |
| 443 | TCP | HTTPS |
| 3306 | TCP | MySQL |
| 5432 | TCP | PostgreSQL |

### 🔧 Pratique : observer une connexion TCP

```bash
# Voir les connexions actives
ss -tn

# Capture de la poignée de main vers google.com
sudo tcpdump -i any -nn 'host google.com and port 443' -c 10
```

---

## 06 — DNS : l'annuaire d'Internet

### 🎯 Objectif

Comprendre comment `google.com` devient `142.250.74.142`, et savoir débugger un problème DNS.

### 💡 Analogie : les Pages Jaunes

Personne ne mémorise les numéros de téléphone. On cherche le **nom** de la personne dans un annuaire, qui nous donne le numéro.

Le **DNS** (Domain Name System) est l'annuaire des serveurs d'Internet. Il traduit `wikipedia.org` en `208.80.154.224`.

### Comment fonctionne une résolution DNS ?

1. Vous tapez `www.exemple.fr` dans le navigateur.
2. Votre PC interroge son **résolveur DNS** (souvent celui de la box ou un public comme `1.1.1.1`).
3. Le résolveur interroge un **serveur racine** (`.`) → "qui s'occupe de `.fr` ?"
4. Réponse : les serveurs DNS de l'AFNIC.
5. Le résolveur demande à l'AFNIC → "qui s'occupe de `exemple.fr` ?"
6. Réponse : les serveurs DNS du domaine `exemple.fr`.
7. Le résolveur demande → "quelle est l'IP de `www.exemple.fr` ?"
8. Réponse : `203.0.113.42`.

Tout cela en **moins de 100 ms** grâce au cache.

### Les types d'enregistrements à connaître

| Type | Rôle |
|------|------|
| A | Nom → IPv4 |
| AAAA | Nom → IPv6 |
| CNAME | Alias (nom → autre nom) |
| MX | Serveur de mail du domaine |
| TXT | Texte libre (SPF, DKIM, vérifications) |
| NS | Serveurs DNS faisant autorité |
| SRV | Localisation d'un service (XMPP, SIP, AD...) |
| CAA | Quelles autorités peuvent émettre un certificat TLS |

### ⚙️ Outils de diagnostic DNS

```bash
# Résolution simple
dig www.google.com

# Voir tout le chemin (super utile !)
dig +trace www.google.com

# Interroger un serveur DNS spécifique
dig @1.1.1.1 www.example.com

# Voir les enregistrements MX
dig MX gmail.com

# Reverse DNS (IP → nom)
dig -x 8.8.8.8
```

### Le concept de TTL

Chaque enregistrement DNS a une **durée de vie** (TTL). Pendant cette durée, les résolveurs gardent la réponse en cache.

⚠️ **Piège classique** : avant une migration de serveur, **réduisez le TTL à 60 secondes 24h avant**. Sinon, vos utilisateurs continueront à pointer sur l'ancien serveur pendant des heures.

### Split-horizon DNS

Concept avancé : le même nom répond **différemment** selon qui demande.

- En interne (depuis le bureau) : `intranet.entreprise.com` → `10.0.0.5`
- Depuis Internet : `intranet.entreprise.com` → `203.0.113.42` (passe par un VPN/reverse proxy)

🏥 **Application bancaire** : les services internes (intranet RH, applications métier) ne sont **jamais** résolus depuis Internet. Le split-horizon empêche un attaquant externe de simplement deviner la topologie.

---

## 07 — ICMP et diagnostic réseau

### 🎯 Objectif

Maîtriser ping et traceroute, comprendre ce qu'ils révèlent (et leurs limites).

### 💡 Analogie : le sonar

ICMP, c'est le **sonar** du réseau. On envoie un "ping", on attend l'écho, on en déduit la distance et l'état du chemin.

### Le ping en détail

```bash
ping -c 4 google.com

64 bytes from 142.250.74.142: icmp_seq=1 time=8.21 ms
64 bytes from 142.250.74.142: icmp_seq=2 time=7.93 ms
```

On en tire 4 informations essentielles :

1. **La machine répond** (donc joignable au niveau IP).
2. **Le temps de réponse** (latence).
3. **La gigue** (variation du temps entre paquets).
4. **Le taux de perte** (combien manquent).

### ⚠️ Piège : "ça ne ping pas, donc c'est down"

**FAUX**. Beaucoup de machines bloquent ICMP par firewall. Ne pinger pas n'est pas une preuve de panne.

### Traceroute

Affiche tous les routeurs traversés :

```bash
traceroute google.com

 1  192.168.1.1     1.2 ms     (votre box)
 2  10.20.0.1       12 ms      (réseau opérateur)
 3  85.91.32.1      18 ms      
 ...
 8  142.250.74.142  22 ms      (Google)
```

→ Permet de voir **où** ça bloque ou où la latence explose.

### MTR : le combo ping + traceroute en temps réel

```bash
mtr google.com
```

Affiche en continu la latence et les pertes sur chaque saut. **L'outil n°1 pour diagnostiquer un problème réseau intermittent.**

---

## 08 — DHCP : la distribution automatique d'IP

### 🎯 Objectif

Comprendre comment un PC obtient une IP automatiquement, et savoir configurer/sécuriser un serveur DHCP.

### 💡 Analogie : le réceptionniste de l'hôtel

Quand vous arrivez dans un hôtel, vous ne choisissez pas votre chambre. Le réceptionniste vous attribue une chambre disponible, vous donne la clé, et note votre identité.

Le serveur **DHCP** fait exactement ça pour les machines qui rejoignent le réseau.

### Le processus DHCP en 4 temps : DORA

```
1. DISCOVER  : "Y a-t-il un DHCP dans le coin ?"  (broadcast)
2. OFFER     : "Oui ! Je te propose 192.168.1.42" (serveur)
3. REQUEST   : "Je prends !"                       (client)
4. ACK       : "Validé. Bail de 24h."             (serveur)
```

### Que fournit DHCP ?

- ✅ Adresse IP
- ✅ Masque
- ✅ Passerelle par défaut
- ✅ Serveurs DNS
- ✅ Domaine de recherche
- ✅ Durée du bail (lease time)
- ✅ Options avancées (NTP, TFTP, PXE boot...)

### Réservations DHCP

On peut **figer** l'IP d'une machine en associant son **adresse MAC** à une IP précise. Pratique pour les imprimantes, NAS, serveurs.

### ⚠️ Sécurité : le DHCP rogue

Un attaquant peut brancher un faux serveur DHCP. Les clients prendront son IP, ses DNS empoisonnés, sa passerelle (= il fait du **MITM**).

🛡️ **Parade** : activer le **DHCP snooping** sur les switches (voir 04).

---

## 09 — HTTP/HTTPS

### 🎯 Objectif

Comprendre le protocole du Web, les codes de statut, le rôle de TLS.

### 💡 Analogie : la commande au restaurant

- Vous (client) demandez le menu (**GET /menu**).
- Le serveur vous le donne avec le **statut** "200 OK".
- Vous commandez (**POST /commande**).
- Le serveur valide ou refuse.

### Anatomie d'une requête HTTP

```http
GET /index.html HTTP/1.1
Host: www.exemple.fr
User-Agent: Mozilla/5.0
Accept: text/html
```

Et la réponse :

```http
HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 1234

<html>...</html>
```

### Les codes de statut à connaître

| Famille | Sens |
|---------|------|
| 1xx | Informatif (rare) |
| 2xx | Succès (200 OK, 201 Created, 204 No Content) |
| 3xx | Redirection (301 Permanent, 302 Temporaire, 304 Not Modified) |
| 4xx | Erreur côté client (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests) |
| 5xx | Erreur côté serveur (500 Internal Error, 502 Bad Gateway, 503 Unavailable, 504 Gateway Timeout) |

### HTTPS : HTTP + TLS

HTTPS = HTTP **dans un tunnel chiffré** (TLS, anciennement SSL).

Bénéfices :
1. **Confidentialité** : un attaquant ne peut pas lire le contenu.
2. **Intégrité** : il ne peut pas le modifier sans détection.
3. **Authenticité** : le certificat prouve que c'est bien le bon serveur.

### Les versions modernes

- **HTTP/1.1** : encore très répandu (1997).
- **HTTP/2** : multiplexage, compression d'en-têtes (2015).
- **HTTP/3** : basé sur QUIC (UDP), latence réduite (2022).

### 🛡️ Bonnes pratiques sécurité Web

- Forcer HTTPS partout (HSTS).
- Cookies en `Secure` et `HttpOnly`.
- En-têtes de sécurité : `Content-Security-Policy`, `X-Frame-Options`, `Strict-Transport-Security`.
- Renouvellement automatique des certificats (Let's Encrypt + cron).

---

## 10 — Email (SMTP/IMAP/POP3)

### 🎯 Objectif

Comprendre comment un email circule, et configurer SPF/DKIM/DMARC pour ne pas finir en spam.

### 💡 Analogie : la poste internationale

1. Vous postez votre lettre dans la boîte aux lettres (**SMTP** vers votre serveur sortant).
2. La poste française la transmet à la poste allemande (**SMTP** entre serveurs).
3. La poste allemande la met dans la boîte du destinataire (**livraison locale**).
4. Le destinataire vient relever sa boîte (**IMAP** ou **POP3**).

### Les protocoles

| Protocole | Port | Rôle |
|-----------|------|------|
| SMTP | 25, 587, 465 | Envoyer un mail |
| IMAP | 143, 993 (TLS) | Lire les mails (synchronisé) |
| POP3 | 110, 995 (TLS) | Lire les mails (téléchargement) |

### SPF, DKIM, DMARC : la trinité anti-usurpation

🛡️ **Sans ces 3 enregistrements, vos emails iront en spam et n'importe qui peut usurper votre nom de domaine.**

- **SPF** (Sender Policy Framework) : enregistrement TXT qui liste les serveurs autorisés à envoyer du mail pour votre domaine.
- **DKIM** (DomainKeys Identified Mail) : signature cryptographique des emails.
- **DMARC** : politique qui dit aux destinataires quoi faire en cas d'échec SPF/DKIM (rejeter, mettre en quarantaine, juste signaler).

### 🏥 Application bancaire : le phishing

> Une banque sans DMARC strict (`p=reject`) **EST** vulnérable au phishing par usurpation d'identité. Les pirates envoient des emails "au nom" de la banque, indistinguables.

C'est devenu une exigence réglementaire dans plusieurs pays.

---

## 11 — Pare-feu (firewall) : les bases

### 🎯 Objectif

Comprendre ce qu'est un firewall, les types principaux, et savoir écrire des règles simples.

### 💡 Analogie : le portier de boîte de nuit

- Liste VIP : laisse passer.
- Mineurs : refuse.
- Tenue inadaptée : refuse.
- Tout le reste : peut entrer.

Le firewall fait exactement pareil avec les paquets réseau.

### Les types de firewalls

| Type | Niveau | Capacité |
|------|--------|----------|
| Filtrage de paquets | L3/L4 | IP/port. Stateless (rapide, basique). |
| Stateful | L3/L4 + état | Suit les connexions (autorise les retours auto). |
| Proxy applicatif | L7 | Comprend HTTP, FTP, etc. Filtre fin. |
| NGFW (Next-Gen) | L7 + IDS/IPS | Détection d'intrusions, AppID, AntiVirus. |

### ⚙️ Anatomie d'une règle

```
Règle : ACCEPT
Source : 192.168.1.0/24
Destination : any
Protocole : TCP
Port : 443
Action : ALLOW
```

Lecture : "Autoriser toute machine du LAN à sortir en HTTPS."

### La règle d'or : DENY ALL en bas

```
1. Autoriser ce que je veux explicitement
2. Tout le reste : DENY ALL  (avec log !)
```

> 🛡️ **Erreur classique** : oublier le DENY final ou laisser des règles trop larges (`any any allow`).

### DROP vs REJECT

- **DROP** : ignore silencieusement le paquet.
- **REJECT** : renvoie un "refusé" à l'expéditeur.

🛡️ Pour la sécurité externe, préférer **DROP** : ne pas renseigner l'attaquant qu'un firewall existe.

---

## 12 — MTU, MSS et PMTUD

### 🎯 Objectif

Comprendre ces 3 acronymes qui causent **80% des pannes mystérieuses** ("ça marche, mais les gros téléchargements freeze").

### 💡 Analogie : les colis du livreur

- **MTU** (Maximum Transmission Unit) : la taille maximale d'un colis qu'une route peut transporter.
- **MSS** (Maximum Segment Size) : la taille du contenu utile dans le colis (sans l'emballage).
- **PMTUD** (Path MTU Discovery) : "qu'est-ce que la plus petite route entre ici et la destination peut accepter ?"

### Valeurs typiques

| Lien | MTU |
|------|-----|
| Ethernet standard | 1500 octets |
| PPPoE (ADSL) | 1492 octets |
| Tunnel VPN IPSec | ~1400 octets |
| Tunnel WireGuard | 1420 octets |
| Jumbo frames | 9000 octets |

### Le problème classique

Vous montez un VPN. La MTU passe de 1500 à 1400. Mais votre PC continue d'envoyer des paquets de 1500. Que se passe-t-il ?

1. Si les paquets sont marqués `Don't Fragment` → le routeur jette et renvoie un ICMP "Fragmentation needed".
2. Si l'ICMP est **bloqué** par un firewall → le PC ne sait pas. Il ré-émet à l'infini. **TCP freeze**.

Symptômes :
- TLS handshake qui freeze à mi-parcours.
- Téléchargements de gros fichiers qui s'arrêtent.
- SSH qui se connecte mais freeze à `ls` long.

### La solution : MSS clamping

Sur le routeur ou firewall :

```bash
iptables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN \
  -j TCPMSS --clamp-mss-to-pmtu
```

Cela force TCP à négocier une taille adaptée dès le départ.

> 🛡️ **Règle d'or** : ne JAMAIS bloquer aveuglément ICMP type 3 code 4 (Fragmentation Needed).

---

## 13 — TLS et certificats : diagnostic

### 🎯 Objectif

Diagnostiquer une erreur SSL/TLS, comprendre la chaîne de certification.

### 💡 Analogie : le passeport

Votre passeport est valable parce qu'il est **émis par votre pays** (autorité de confiance). Le pays étranger fait confiance au passeport parce qu'il fait confiance à votre pays.

Un certificat TLS fonctionne pareil :
1. Le serveur présente son certificat.
2. Le certificat est signé par une **autorité intermédiaire**.
3. Cette autorité est signée par une **autorité racine**.
4. L'autorité racine est **pré-installée** dans votre OS / navigateur.

### ⚙️ Diagnostic avec openssl

```bash
# Voir le certificat d'un site
openssl s_client -connect www.exemple.fr:443 -servername www.exemple.fr

# Voir uniquement la chaîne
openssl s_client -connect www.exemple.fr:443 -showcerts

# Vérifier une date d'expiration
echo | openssl s_client -connect www.exemple.fr:443 2>/dev/null | \
  openssl x509 -noout -dates
```

### Les erreurs classiques

| Erreur | Cause |
|--------|-------|
| `certificate has expired` | Certificat périmé → renouveler. |
| `unable to verify the first certificate` | Chaîne intermédiaire absente → ajouter le bundle. |
| `certificate name mismatch` | Le nom du site ne correspond pas → mauvais SNI ou mauvais certificat. |
| `self signed certificate` | Certificat non signé par une AC reconnue. |

### SNI : pourquoi c'est important

Plusieurs sites HTTPS peuvent partager **une seule IP**. Le client indique le nom du site visé via le **SNI** (Server Name Indication) au début du handshake TLS, avant le chiffrement complet.

⚠️ Sans SNI correct, le serveur sert le mauvais certificat → erreur "name mismatch".

### NTP : le piège oublié

Un certificat valide aujourd'hui ne le sera pas demain. Et un certificat valide demain ne l'est pas aujourd'hui.

→ Si l'horloge du client/serveur dérive de plusieurs heures, **TLS casse**.

🛡️ **Toujours synchroniser avec NTP/chrony**. C'est la cause #1 des "ça marchait hier".

---

## 14 — DNS de production

### 🎯 Objectif

Aller au-delà des bases : split-horizon, SRV, CAA, troubleshooting fin.

### Au-delà du A/AAAA

#### SRV : la localisation de service

Au lieu de coder en dur l'adresse d'un serveur SIP, on demande au DNS :

```
_sip._tcp.exemple.fr  SRV  10 5 5060  sip1.exemple.fr.
```

Lecture : "Pour le service SIP en TCP du domaine exemple.fr, contacter sip1.exemple.fr port 5060, priorité 10, poids 5."

→ Utilisé par Active Directory, XMPP, SIP, LDAP, etc.

#### CAA : qui peut émettre mes certificats ?

```
exemple.fr  CAA  0 issue "letsencrypt.org"
```

Lecture : "Seule Let's Encrypt peut émettre un certificat pour mon domaine."

🛡️ **Empêche un attaquant qui prend le contrôle d'une autre AC de générer un faux certificat pour vous.**

### DNSSEC

Signe cryptographiquement les réponses DNS pour empêcher l'empoisonnement de cache.

### 🏥 Application secteur santé (RGPD)

Un hôpital DOIT :
- Avoir un DNS interne séparé du DNS Internet.
- DNSSEC activé sur ses zones publiques.
- Logs DNS conservés (détecter une exfiltration via DNS tunneling).
- CAA pour limiter les autorités émettrices.

---

## 15 — Synthèse : checklist de diagnostic

### Quand "ça ne marche pas", testez dans cet ordre :

```
1. Le câble / Wi-Fi est connecté ?           (L1)
2. J'ai une IP ?                             (L3)
   → ip addr
3. Je ping ma passerelle ?                   (L3)
   → ping 192.168.1.1
4. Je ping un IP publique (8.8.8.8) ?        (L3)
   → ping 8.8.8.8
5. Le DNS résout ?                           (L7)
   → dig google.com
6. Je peux atteindre le port voulu ?         (L4)
   → nc -zv www.exemple.fr 443
7. Le service applicatif répond ?            (L7)
   → curl -v https://www.exemple.fr
```

→ La couche où ça casse vous dit quoi corriger.

### Les commandes essentielles à mémoriser

```bash
ip addr                  # Mes IP
ip route                 # Ma table de routage
ss -tnlp                 # Ports en écoute
ping / mtr / traceroute  # Chemin et latence
dig                      # Résolution DNS
nc -zv host port         # Tester un port
curl -v                  # Tester du HTTP/HTTPS
tcpdump / tshark         # Capture brute
```

---

## 16 — Homelab réseau

### 🎯 Objectif

Construire un environnement de test à la maison pour pratiquer **sans risque**.

### Le matériel minimal

- 1 PC (ou Raspberry Pi 4/5) avec 8 Go de RAM minimum.
- VirtualBox / KVM / Proxmox installé.
- 4 VMs Linux légères (Alpine, Debian, Ubuntu Server).

### Architecture minimale recommandée

```
                  [ Internet ]
                       |
                  [ Box ISP ]
                       |
                  [ VM PFsense ]  (firewall homelab)
                  /         \
            [ VLAN 10 ]   [ VLAN 20 ]
            LAN test      DMZ
            VM client     VM web
```

### Ce que vous allez pouvoir tester

✅ DHCP, DNS, NAT, routage statique.
✅ Règles de firewall réelles.
✅ VPN site-à-site entre 2 VMs.
✅ Captures Wireshark sans déranger personne.
✅ Casser et reconstruire à volonté.

> 🛡️ Un homelab, c'est l'**unique moyen sain** de monter en compétence en sécurité. Ne pratiquez **JAMAIS** sur un réseau de production.

---

# VOLET 2 — OSI vers la pratique

## 01 — Le modèle OSI en profondeur

### 🎯 Objectif

Maîtriser les 7 couches OSI et savoir à quelle couche se situe chaque problème.

### Les 7 couches

| # | Nom | Rôle | Exemples | PDU |
|---|-----|------|----------|-----|
| 7 | Application | Interface utilisateur | HTTP, SMTP, DNS, SSH | Donnée |
| 6 | Présentation | Format, chiffrement | TLS, JPEG, ASCII | Donnée |
| 5 | Session | Établissement du dialogue | NetBIOS, RPC | Donnée |
| 4 | Transport | Fiabilité | TCP, UDP | Segment |
| 3 | Réseau | Acheminement | IP, ICMP, OSPF | Paquet |
| 2 | Liaison | Voisinage direct | Ethernet, Wi-Fi, ARP | Trame |
| 1 | Physique | Signaux électriques | Câble, fibre, Wi-Fi (RF) | Bits |

### 💡 Mnémo : "Toutes Pour Sortir Tres Reseau Liaison Physique" (de bas en haut : Please Do Not Throw Sausage Pizza Away)

### L'encapsulation

```
Couche 7 :        [Données HTTP]
Couche 4 (TCP):   [TCP|Données HTTP]
Couche 3 (IP):    [IP|TCP|Données HTTP]
Couche 2 (Eth):   [Eth|IP|TCP|Données HTTP|FCS]
Couche 1 :        [101010101010100101001...]
```

À chaque couche descendante, on **ajoute un en-tête**. À la réception, chaque couche **enlève son en-tête** et passe le reste à la couche du dessus.

### TCP/IP vs OSI

Le modèle TCP/IP réel ne fait que **4 couches** :

```
OSI 7-6-5  →  Application (TCP/IP)
OSI 4      →  Transport
OSI 3      →  Internet
OSI 2-1    →  Accès réseau
```

OSI reste utile comme **outil pédagogique** et pour parler entre admins ("on a un problème L2", "ça casse en L7").

---

## 02 — Équipements réseau par couche

### Hub (L1) — historique

Répète chaque signal sur tous les ports. **Aucune intelligence**. Disparu depuis 20 ans.

### Switch (L2)

Apprend les adresses MAC, envoie le trafic uniquement au bon port.

### Routeur (L3)

Décide du chemin entre **réseaux IP différents**.

### Firewall (L3-L7)

Filtre selon des règles, peut analyser jusqu'au contenu applicatif.

### Point d'accès Wi-Fi (L1-L2)

Pont entre le radio et l'Ethernet.

### Load balancer (L4 ou L7)

Distribue le trafic entre plusieurs serveurs identiques. L4 = par IP/port. L7 = par URL, header, cookie...

### Reverse proxy (L7)

Termine les connexions clientes, transmet aux backends. Ajoute du cache, du chiffrement, de la sécurité (WAF).

---

## 03 — Couche physique (L1)

### Les supports

| Support | Débit max | Distance |
|---------|-----------|----------|
| Cuivre Cat 5e | 1 Gbps | 100 m |
| Cuivre Cat 6/6a | 10 Gbps | 100 m / 55 m |
| Cuivre Cat 7/8 | 25-40 Gbps | 30 m |
| Fibre multimode OM4 | 100 Gbps | ~150 m |
| Fibre monomode | 100+ Gbps | 40+ km |

### PoE : alimenter via le câble réseau

| Norme | Puissance |
|-------|-----------|
| 802.3af (PoE) | 15,4 W |
| 802.3at (PoE+) | 30 W |
| 802.3bt (PoE++) | 60 ou 90 W |

→ Permet d'alimenter caméras, points d'accès Wi-Fi, téléphones IP **via le câble réseau**, sans alim séparée.

### Diagnostic L1

```bash
# État physique du lien
ethtool eth0

# Erreurs de paquet (CRC)
ip -s link show eth0
```

⚠️ **Symptômes L1 typiques** : erreurs CRC croissantes → câble défectueux ou interférence électromagnétique.

---

## 04 — Couche liaison (L2) : MAC, ARP, VLANs, STP

### Adresse MAC

48 bits écrits en hexadécimal : `00:1A:2B:3C:4D:5E`.

- 24 premiers bits : **OUI** (constructeur, attribué par l'IEEE).
- 24 suivants : numéro de série.

→ Théoriquement unique au monde (mais clonable !).

### ARP : la traduction IP → MAC

Quand votre PC veut parler à `192.168.1.42` sur son LAN :

```
1. Broadcast ARP : "Qui a 192.168.1.42 ?"
2. Réponse : "Moi ! Mon MAC est 00:1A:2B:3C:4D:5E"
3. Stockage dans la table ARP locale.
```

```bash
# Voir sa table ARP
ip neigh

# La vider
sudo ip neigh flush all
```

### ⚠️ ARP poisoning / spoofing

Un attaquant envoie de faux ARP : "C'est moi le routeur 192.168.1.1". Tout le trafic passe par lui (MITM).

🛡️ **Parades** :
- **Dynamic ARP Inspection (DAI)** sur les switches.
- IP statique des routeurs critiques.
- Détection : Arpwatch, ArpON.

### Les VLANs (802.1Q)

Un switch physique peut être découpé logiquement en plusieurs réseaux **étanches** : les VLANs.

```
Switch physique :
  Ports 1-12  → VLAN 10 (bureautique)
  Ports 13-20 → VLAN 20 (téléphonie)
  Ports 21-24 → VLAN 30 (caméras)
```

Bénéfices :
- **Sécurité** : un poste bureautique ne peut pas parler à une caméra.
- **Diffusion** : limite les broadcasts.
- **QoS** : prioriser la voix sur la donnée.

### Tagging et trunk

- **Port access** : un seul VLAN, sans tag (machine standard).
- **Port trunk** : plusieurs VLANs avec tag 802.1Q (entre 2 switches).

### Spanning Tree Protocol (STP)

🌪️ **Le problème** : si vous reliez 2 switches par 2 câbles pour la redondance, vous créez une **boucle**. Les broadcasts tournent à l'infini → effondrement du réseau en 30 secondes.

🛡️ **STP** : détecte les boucles et **désactive automatiquement** les liens redondants (tout en gardant la redondance dispo en cas de panne).

Versions :
- STP (802.1D) : lent (~30 s reconvergence)
- RSTP (802.1w) : rapide (~3 s)
- MSTP (802.1s) : un STP par groupe de VLANs

### LACP : agrégation de liens

Au lieu de désactiver le 2ᵉ câble, on **agrège** les 2 câbles en un seul lien logique → débit doublé + redondance.

```
Switch A ----câble 1----  Switch B
         \---câble 2----/
            (LACP = un lien de 2 Gbps)
```

---

## 05 — Couche réseau (L3) avancée

### NAT : la translation d'adresse

Comme vous avez ~3 IP publiques mais 50 machines en interne, le routeur **traduit** :

```
PC (192.168.1.42) → Routeur (203.0.113.1) → Internet
```

Tous les PC partagent une IP publique. Le routeur garde une **table NAT** : "telle machine interne sur tel port externe".

### Types de NAT

| Type | Usage |
|------|-------|
| SNAT (source) | Sortie Internet (votre box) |
| DNAT (destination) | Publier un serveur interne (port forwarding) |
| NAT 1:1 | Une IP publique = une IP privée fixe |
| PAT/Overload | Plusieurs IP privées sur une seule publique |

### Conntrack : la table d'états

Le firewall stateful garde la trace de **chaque connexion TCP/UDP**. Sans cette table, il ne saurait pas que la réponse à votre requête est légitime.

```bash
# Voir la table conntrack
sudo conntrack -L
sudo cat /proc/sys/net/netfilter/nf_conntrack_count
```

⚠️ **Saturation conntrack** : sur un firewall très chargé (IDS, NAT massif), la table peut se remplir → **timeouts aléatoires**.

🛡️ Surveillance : alerte si `nf_conntrack_count` > 80% de `nf_conntrack_max`.

### Policy routing

Routage non basé que sur la destination, mais aussi sur :
- L'IP source.
- Le port.
- Le marquage QoS.

Exemple : "tout ce qui sort du VLAN VoIP passe par la liaison MPLS, le reste par la fibre Internet".

---

## 06 — Couche transport (L4) avancée

### TCP tuning

Paramètres système qui affectent les performances :

```bash
# Taille des buffers TCP
sysctl net.ipv4.tcp_rmem
sysctl net.ipv4.tcp_wmem

# Algorithme de contrôle de congestion
sysctl net.ipv4.tcp_congestion_control
```

Algorithmes principaux :
- **CUBIC** : par défaut Linux, équilibré.
- **BBR** (Google) : excellent sur liens à forte latence ou pertes.
- **Reno** : ancien, à éviter.

### Keepalive

Évite que les connexions inactives soient coupées par les NATs/firewalls intermédiaires.

```bash
sysctl net.ipv4.tcp_keepalive_time      # 7200 par défaut (2h, trop long)
sysctl net.ipv4.tcp_keepalive_intvl
sysctl net.ipv4.tcp_keepalive_probes
```

→ Pour SSH ou applications longues : descendre à 60 s.

---

## 07 — Networking Kubernetes (introduction)

### Les concepts de base

Dans Kubernetes :
- Chaque **Pod** a sa propre IP.
- Les pods communiquent **directement** entre eux.
- Les **Services** exposent des pods sous un nom DNS stable.
- Les **Ingress** exposent des services à l'extérieur via HTTP/HTTPS.

### CoreDNS

Le serveur DNS interne de K8s. Permet de résoudre :
```
mon-service.mon-namespace.svc.cluster.local
```

### NetworkPolicy

Firewall **logiciel** au niveau pod. Par défaut, tout pod peut parler à tout pod (catastrophique en sécurité).

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: db-only-from-api
spec:
  podSelector:
    matchLabels:
      role: database
  ingress:
  - from:
    - podSelector:
        matchLabels:
          role: api
    ports:
    - port: 5432
```

🛡️ **Politique recommandée** : commencer par tout bloquer (`default deny`) et ouvrir explicitement.

---

## 12 — Observabilité réseau

### tcpdump : la base

```bash
# Capture sur eth0, sans résolution DNS, port 443
sudo tcpdump -i eth0 -nn port 443

# Capture vers un fichier (analysable dans Wireshark)
sudo tcpdump -i eth0 -w capture.pcap

# Filtre complexe
sudo tcpdump -i any -nn 'host 1.2.3.4 and (port 80 or port 443)'
```

### Wireshark

Analyseur graphique. Permet de **disséquer** un paquet jusqu'au dernier bit. Indispensable pour :
- Diagnostiquer un handshake TLS qui échoue.
- Comprendre pourquoi un service applicatif freeze.
- Décrypter du HTTPS si on a la clé privée du serveur.

### eBPF : l'observabilité moderne

Permet d'observer le noyau sans patch. Outils :
- **bpftrace** : scripts d'observation.
- **Cilium** : réseau K8s basé sur eBPF.
- **Pixie** : observabilité applicative.

---

## 13 — Scénarios d'incidents (introduction)

Voir la section dédiée [Scénarios d'incidents](#scénarios-dincidents-transversal) en fin de guide.

---

## 14 — iptables ↔ nftables

### iptables (legacy)

Syntaxe historique de filtrage Linux.

```bash
# Autoriser SSH
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Bloquer une IP
iptables -A INPUT -s 1.2.3.4 -j DROP

# Sauvegarder
iptables-save > /etc/iptables/rules.v4
```

### nftables (moderne)

Remplaçant officiel depuis 2014. Plus rapide, syntaxe unifiée IPv4/IPv6.

```bash
nft add table inet filter
nft add chain inet filter input { type filter hook input priority 0 \; }
nft add rule inet filter input tcp dport 22 accept
```

### firewalld (front-end)

Surcouche qui simplifie la gestion (zones, services). Utilisé par RHEL/CentOS/Fedora.

```bash
firewall-cmd --add-service=https --permanent
firewall-cmd --reload
```

---

# VOLET 3 — Capstone : Homelab d'entreprise

## Track A — Sécurité et segmentation

### A0 — Architecture cible

```
                [ Internet ]
                     |
              [ Firewall HA ]   ← OPNsense/pfSense en cluster CARP
              /     |     \
        [ DMZ ] [ LAN ] [ VLAN MGMT ]
        (web)   (postes)  (admin)
```

### A1-A2 — OPNsense / pfSense

Firewalls open source professionnels.

🛡️ **Bonnes pratiques** :
- Aliases pour grouper les IP.
- Règles "floating" pour la QoS.
- Logging systématique (mais raisonné).
- Sauvegarde quotidienne de la config.

### A3 — VLANs et segmentation

Politique recommandée pour une PME :

| VLAN | Usage | Internet | Inter-VLAN |
|------|-------|----------|------------|
| 10 | Postes bureautiques | ✅ | Bureautique → Serveurs uniquement |
| 20 | Serveurs internes | ✅ (limité) | Serveurs → DB uniquement |
| 30 | DMZ (web public) | ✅ | DMZ → DB uniquement |
| 40 | Téléphonie IP | ✅ (SIP) | Isolé |
| 50 | Caméras IP | ❌ | Isolé |
| 60 | IoT | ❌ | Isolé |
| 99 | Management | ❌ | Admin only |

### A4 — VPN site-to-site

Trois grandes options :

| Solution | Avantages | Inconvénients |
|----------|-----------|---------------|
| WireGuard | Simple, rapide, moderne | Pas de support natif sur tous les pare-feux d'entreprise |
| OpenVPN | Mature, flexible | Plus lent, plus complexe |
| IPSec | Standard, multi-vendor | Configuration ardue, NAT-T à gérer |

### A5 — Haute disponibilité firewall

CARP (équivalent de VRRP) + pfsync :
- 2 firewalls en cluster actif/passif.
- Synchronisation de la table d'états.
- Bascule transparente en < 1 seconde.

### A6 — IDS/IPS avec Suricata

Détecte les attaques en analysant le trafic.

```bash
# Règle Suricata exemple
alert tcp any any -> $HOME_NET 3389 (msg:"RDP brute force"; \
  threshold:type both, track by_src, count 10, seconds 60; \
  sid:1000001;)
```

→ Alerte si plus de 10 tentatives RDP en 60 s depuis la même source.

## Track C — Plateforme et virtualisation

### C1-C2 — Proxmox VE

Hyperviseur open source. Cluster 3 nœuds + Ceph = haute dispo + stockage distribué.

### C3 — Switch managé

Pratiquer sur du vrai matériel :
- Cisco Catalyst (occasion < 100€)
- HP/Aruba ProCurve
- MikroTik (excellent rapport qualité/prix)

### C4 — Stockage réseau

| Protocole | Niveau | Usage |
|-----------|--------|-------|
| NFS | Fichier | Linux, partage simple |
| SMB/CIFS | Fichier | Windows, multiplateforme |
| iSCSI | Bloc | Stockage SAN |
| FC | Bloc | SAN haute performance |

### C5 — Monitoring

Stack recommandée 2026 :
- **Prometheus** : collecte de métriques.
- **Grafana** : visualisation.
- **Alertmanager** : alertes intelligentes.
- **Loki** : logs centralisés.

---

# Sécurité par secteur d'activité

Chaque secteur a ses **risques propres**, sa **réglementation**, et ses **cibles privilégiées**. Voici les pratiques essentielles.

## 🏦 Secteur bancaire

### Réglementation

- **DSP2** (Directive sur les Services de Paiement) : authentification forte client, ouverture des API.
- **PCI-DSS** : protection des données de carte bancaire (12 exigences).
- **ACPR** : autorité de contrôle française.
- **NIS2** : directive UE de cybersécurité (depuis 2024).

### Architecture type

```
                    [ Internet ]
                         |
                  [ WAF + DDoS protection ]
                         |
                  [ Load Balancer ]
                         |
                  [ Reverse proxy DMZ ]
                         |
                 ===  Firewall L7  ===
                  /        |         \
            [App layer] [API GW]  [Admin]
                 |          |
            =Firewall=  =Firewall=
                 |          |
            [DB Master]  [DB Replica]
                 |
            [HSM]  ← Hardware Security Module pour les clés
```

### Pratiques essentielles

🛡️ **Microsegmentation stricte** : chaque application a son VLAN, ses règles. Aucun "any-any".

🛡️ **Chiffrement bout-en-bout** : TLS partout, jusque dans le DC. Pas de "trafic interne en clair".

🛡️ **HSM (Hardware Security Module)** : les clés cryptographiques (signature de transaction) ne sortent **jamais** d'un boîtier hardware certifié.

🛡️ **Logs immuables** : SIEM avec stockage WORM (Write Once Read Many). Conservation 1 an minimum.

🛡️ **DDoS protection** : abonnement obligatoire à un service anti-DDoS (Cloudflare, Akamai, OVH...). Une attaque sur la banque en ligne = des millions perdus par minute.

🛡️ **Pen-test annuel** : exigé par PCI-DSS.

### Attaques typiques et parades

| Attaque | Parade |
|---------|--------|
| Phishing → vol de credentials | MFA obligatoire (FIDO2 préféré) |
| DDoS sur le portail client | Anti-DDoS upstream + WAF |
| Injection SQL sur API | WAF + tests réguliers |
| Compromission interne | Microsegmentation + zero trust |
| Skimming sur appli mobile | Cert pinning + RASP |

---

## 🏥 Secteur santé

### Réglementation

- **RGPD** + **HDS** (Hébergement de Données de Santé, certification française).
- **HIPAA** (USA).
- **PSSI-S** (Politique de Sécurité des SI de Santé).

### Particularités

- Équipements **vieux** (IRM, scanners) avec OS obsolètes (Windows XP/7) **toujours en service**.
- Contrainte vitale : un déni de service peut **coûter des vies**.
- Données ultra-sensibles (dossiers médicaux).

### Architecture recommandée

```
[ Postes médicaux ] - VLAN 10
[ Équipements bio  ] - VLAN 20 (ISOLÉ d'Internet !)
[ Équipements imagerie ] - VLAN 30
[ Wi-Fi patients  ] - VLAN 40 (pas d'accès SI)
[ IoT médicaux   ] - VLAN 50
[ Administration ] - VLAN 60
```

### Pratiques essentielles

🛡️ **Isolation matérielle des équipements vieux** : un IRM sous Windows XP **ne doit jamais** voir Internet ni les postes utilisateurs.

🛡️ **Wi-Fi patient sur réseau séparé** : pas d'accès au SI hospitalier (jamais).

🛡️ **Sauvegarde 3-2-1-1-0** :
- 3 copies, 2 supports, 1 hors site, 1 hors ligne (immuable), 0 erreur (vérifier les restaurations).

🛡️ **Plan de continuité écrit et testé** : que faire si tout le SI tombe ? Comment opérer en mode dégradé ?

### Attaques connues

- **WannaCry** (2017) : NHS britannique paralysé pendant des jours. → Patcher, isoler les vieux OS.
- **Ransomware sur CHU** (Rouen 2019, Corbeil-Essonnes 2022) : reports d'opérations. → Sauvegardes immuables + segmentation.

---

## ⚡ Secteur énergie

### Réglementation

- **NIS2** (UE).
- **LPM** (Loi de Programmation Militaire, France) : opérateurs d'importance vitale (OIV).
- **IEC 62443** : norme cybersécurité industrielle.
- **NERC CIP** (Amérique du Nord).

### Particularités : IT vs OT

Deux mondes coexistent :
- **IT** (Information Technology) : bureautique, SI standard.
- **OT** (Operational Technology) : SCADA, automates, capteurs sur le terrain (turbines, transformateurs, vannes de gazoduc).

L'OT a des contraintes spécifiques :
- Cycles de vie de **20-30 ans**.
- Pas de patch possible sans arrêt de production.
- Protocoles industriels (Modbus, DNP3, IEC 61850) **nativement non chiffrés**.

### Architecture Purdue (référence)

```
Niveau 5 : Réseau Entreprise IT
  ↓ (DMZ)
Niveau 4 : Réseau d'entreprise OT
  ↓ (DMZ industrielle)
Niveau 3 : Operations (MES, historian)
  ↓
Niveau 2 : Supervision (SCADA, HMI)
  ↓
Niveau 1 : Contrôle (PLC, automates)
  ↓
Niveau 0 : Process physique (capteurs, actionneurs)
```

🛡️ **Règle d'or** : aucun flux direct entre niveau 5 et niveau 1. Toujours via DMZ.

### Attaques historiques

- **Stuxnet** (2010) : sabotage nucléaire iranien via un ver USB. → Air gap n'est pas suffisant si des USB circulent.
- **BlackEnergy** (Ukraine 2015) : coupure d'électricité pour 230 000 foyers.
- **Industroyer / CrashOverride** (2016) : framework dédié aux réseaux électriques.
- **Colonial Pipeline** (USA 2021) : ransomware → arrêt d'un oléoduc majeur.

### Pratiques essentielles

🛡️ **Diodes réseau** : composants matériels qui imposent un flux **unidirectionnel** entre OT et IT.

🛡️ **Inventaire OT** : connaître **chaque** automate, sa version, son emplacement.

🛡️ **Détection passive** : Nozomi, Claroty, Dragos. Ne génèrent **aucun** trafic, donc ne perturbent pas l'OT.

🛡️ **Plan de réponse incident OT** : qui décide d'arrêter une centrale ? Qui appelle l'ANSSI ?

---

## 🚆 Secteur transport

### Particularités

- Aviation, ferroviaire, maritime, urbain : chacun avec ses normes.
- Souvent des systèmes critiques temps réel (signalisation, contrôle aérien).
- Surface d'attaque large : embarqué + sol + Internet voyageurs.

### Réglementation

- **EASA** (aviation civile européenne).
- **TSI** (Spécifications Techniques d'Interopérabilité ferroviaires).
- **IMO** (maritime).

### Risques typiques

- Compromission du Wi-Fi à bord → accès aux systèmes embarqués (a déjà été démontré sur Boeing).
- Attaques sur les systèmes de billettique.
- DDoS sur les sites de réservation.
- Brouillage GPS / GNSS sur la navigation.

### Pratiques essentielles

🛡️ **Séparation embarqué / divertissement** : bus CAN avionique **physiquement isolé** du Wi-Fi passager.

🛡️ **Chiffrement des communications sol-train** : protocoles ferroviaires modernes (ETCS) en TLS.

🛡️ **Détection de spoofing GNSS** : croisement avec inertiel + multi-constellations.

---

## 🛡️ Secteur assurance

### Réglementation

- **RGPD** (données personnelles).
- **Solvabilité II** : évaluation des risques opérationnels.
- **DORA** (Digital Operational Resilience Act, UE 2025).

### Risques

- Fuites de données massives (un dossier d'assurance = identité + santé + finances).
- Fraude organisée à l'assurance via vol d'identité.
- Ransomware sur les bases clients.

### Pratiques essentielles

🛡️ **Tokenisation** des données sensibles dans les bases.

🛡️ **DLP (Data Loss Prevention)** : empêcher l'exfiltration de fichiers clients via mail/USB/cloud.

🛡️ **Surveillance des accès aux dossiers** : qui consulte quoi, quand. Détection de comportements anormaux (accès massifs en peu de temps).

🛡️ **Test de résilience DORA** : exercices réguliers de simulation de cyberattaque.

---

## 🏛️ Secteur public / collectivités

### Particularités

- Budgets contraints, équipes réduites.
- Cibles fréquentes (mairies, hôpitaux, universités).
- Données citoyens à protéger.

### Réglementation

- **RGPD**.
- **PSSIE** (Politique de Sécurité des SI de l'État).
- Référentiels ANSSI (PVID, RGS, RGAA).

### Pratiques essentielles

🛡️ **Mutualisation** : passer par les centres mutualisés (régions, métropoles).

🛡️ **Sauvegarde immuable obligatoire** : la majorité des collectivités attaquées par ransomware n'avaient pas de sauvegarde restaurable.

🛡️ **Formation des agents** : 80% des intrusions commencent par un phishing.

🛡️ **Cyber-assurance + plan de réponse** : avoir un partenaire (CSIRT régional, prestataire) **avant** l'incident.

---

## 🛒 Secteur e-commerce / retail

### Risques

- Skimming (vol de carte bancaire à la commande).
- Credential stuffing (réutilisation de mots de passe volés ailleurs).
- Fraude au remboursement.
- Vol de catalogue / scraping.

### Pratiques

🛡️ **WAF** + **bot management** (Cloudflare, Akamai).
🛡️ **Tokenisation** des moyens de paiement (Stripe, externalisation).
🛡️ **MFA** sur les comptes vendeur.
🛡️ **PCI-DSS scope reduction** : ne jamais stocker de PAN (Primary Account Number) si évitable.

---

# Cyberattaques et défense

## Les phases d'une attaque (Cyber Kill Chain)

```
1. Reconnaissance      → Récolte d'info (OSINT, scans)
2. Armement (weaponize)→ Création du payload
3. Livraison (deliver) → Phishing, USB, exploit
4. Exploitation        → Le code malveillant s'exécute
5. Installation        → Persistance (backdoor, service)
6. Command & Control   → L'attaquant contrôle à distance
7. Actions sur objectif→ Vol, chiffrement, sabotage
```

🛡️ **Bonne nouvelle** : il suffit de **casser une seule étape** pour bloquer l'attaque.

## Reconnaissance : ce qu'un attaquant peut savoir

### OSINT (Open Source Intelligence)

Ce qui est **public** sur votre entreprise :
- Noms d'employés (LinkedIn).
- Adresses email (corpus de fuites passées : haveibeenpwned).
- Technologies utilisées (BuiltWith, Wappalyzer).
- Sous-domaines (crt.sh, Censys, Shodan).
- Documents PDF (avec métadonnées).

### Scan actif

```bash
# Découverte de machines (à NE PAS faire sur un réseau qui ne vous appartient pas !)
nmap -sn 192.168.1.0/24

# Scan de ports complet
nmap -sS -sV -p- -T4 cible.exemple.fr

# Détection de services et versions
nmap -A cible.exemple.fr
```

🛡️ **Côté défense** : surveiller les scans depuis l'extérieur, IDS, alertes sur scans verticaux/horizontaux.

## Phishing : la porte d'entrée n°1

90% des intrusions commencent par un email piégé.

### Comment ça marche

1. Email "urgent" simulant un service (Microsoft, banque, RH).
2. Lien vers une page imitant le vrai site.
3. L'utilisateur saisit son mot de passe.
4. L'attaquant capture les identifiants.
5. Si MFA absent : il se connecte directement.

### 🛡️ Parades

- **MFA obligatoire** (clé FIDO2 > app TOTP > SMS).
- **DMARC strict** sur votre domaine.
- **Filtrage anti-phishing** dans la passerelle email.
- **Formation continue** + simulations de phishing.
- **Détection des homoglyphes** (`exemp1e.fr` au lieu de `exemple.fr`).

## Ransomware : le cauchemar moderne

### Schéma typique

```
Phishing → exécution macro → backdoor → escalade locale →
mouvement latéral (Windows AD) → vol données →
chiffrement de masse → demande de rançon
```

Le délai moyen entre intrusion et chiffrement est **passé de 60 jours en 2019 à 5 jours en 2024**. Les attaquants vont vite.

### 🛡️ Défense en profondeur

| Couche | Mesure |
|--------|--------|
| Email | Filtrage anti-phishing, sandbox |
| Endpoint | EDR (CrowdStrike, SentinelOne, Defender) |
| Réseau | Microsegmentation, détection de mouvement latéral |
| Identité | MFA, comptes privilégiés isolés (PAM) |
| Sauvegarde | Immuable + air-gappée + testée |
| Réponse | Playbook + exercices |

### Quoi faire si on est victime ?

1. **Isoler** immédiatement les machines compromises (déconnecter du réseau).
2. **NE PAS** payer la rançon (illégal pour les opérateurs publics, pas de garantie).
3. Préserver les preuves (mémoire, disques) pour analyse.
4. Notifier ANSSI / CNIL / autorités sectorielles dans les 72h.
5. Activer le plan de continuité.
6. Restauration depuis les sauvegardes **après** investigation forensique.

## Déni de service distribué (DDoS)

### Types

- **Volumétrique** : saturer la bande passante (UDP flood, amplification DNS/NTP).
- **Protocolaire** : épuiser les états (SYN flood).
- **Applicatif** : épuiser les ressources serveur (HTTP slow, attaque Layer 7).

### Parades

🛡️ **CDN / Anti-DDoS upstream** : Cloudflare, Akamai, OVH.
🛡️ **Rate limiting** au niveau application.
🛡️ **Anycast DNS** : répartit la charge mondialement.
🛡️ **Plan d'absorption** : capacité réseau X10 pour absorber les pics.

## Détection : SOC, SIEM, EDR/XDR

### SOC (Security Operations Center)

Équipe humaine + outils qui surveillent 24/7 les alertes de sécurité.

### SIEM (Security Information and Event Management)

Centralise les logs, corrèle les événements, génère des alertes.

Outils : Splunk, Sentinel, ELK + Wazuh, QRadar.

### EDR/XDR

Surveillance avancée des postes (EDR) ou de l'ensemble (XDR).

🛡️ **Sans EDR moderne, vous avez 0 chance** de détecter un ransomware avant qu'il ne s'exécute.

## Zero Trust : la doctrine moderne

Principe : **"Never trust, always verify."**

Concrètement :
- Aucune machine/utilisateur n'est de confiance par défaut.
- Chaque accès est authentifié + autorisé + chiffré.
- Microsegmentation extrême.
- Plus de "réseau interne sûr".

### ZTNA vs VPN classique

| Aspect | VPN classique | ZTNA |
|--------|---------------|------|
| Accès | Au réseau entier | À une application précise |
| Modèle | Confiance au LAN | Aucune confiance |
| Visibilité | Faible | Granulaire |
| Risque latéral | Élevé | Quasi-nul |

→ Les solutions ZTNA modernes (Cloudflare Access, Zscaler, Tailscale) **remplacent** progressivement les VPN d'entreprise.

---

# Supervision et métrologie

## Pourquoi superviser ?

> "Ce qui n'est pas mesuré ne peut pas être amélioré." — Peter Drucker

🛡️ **Sans supervision, vous découvrez les pannes via les utilisateurs**. Avec supervision, vous les détectez (et idéalement les anticipez) avant qu'elles n'impactent.

## Les protocoles de supervision

### SNMP

Le standard historique. Permet d'interroger un équipement sur :
- Charge CPU, RAM.
- Octets passés sur chaque interface.
- État des ports (up/down).
- Température, alimentation, ventilateurs.

```bash
# Interroger un switch
snmpwalk -v2c -c public 192.168.1.10 IF-MIB::ifInOctets
```

🛡️ **Toujours utiliser SNMPv3 en production** (chiffré + authentifié). v1/v2c = mots de passe en clair.

### Syslog

Centralisation des logs.

```
<134>Oct 26 10:23:45 firewall1 kernel: ALERT: blocked SYN flood from 1.2.3.4
```

Format unifié, facile à parser. Tous les équipements réseau sérieux savent envoyer en Syslog.

### NetFlow / sFlow / IPFIX

Au lieu de regarder chaque paquet, on **résume** les flux : source, destination, ports, octets, durée.

→ Permet de répondre à : "qui a consommé toute la bande passante ce matin ?"

### Telemetry streaming (gNMI, gRPC)

Successeur moderne de SNMP. Push de métriques par l'équipement, en temps réel, en JSON ou Protobuf.

## Les outils 2026

### Stack open source recommandée

```
[ Équipements ]
   |
   |--- SNMP ---> [ Telegraf ]   → collecte
   |--- Syslog -> [ rsyslog ]    
   |
   v
[ InfluxDB / Prometheus ]        → stockage métriques
[ Loki / Elasticsearch ]         → stockage logs
   |
   v
[ Grafana ]                      → visualisation
   |
   v
[ Alertmanager ]                 → notifications
```

### Solutions complètes

| Outil | Type | Avantage |
|-------|------|----------|
| Zabbix | Tout-en-un | Open source mature, complet |
| LibreNMS | Réseau focus | Configuration zéro |
| Nagios / Centreon | Historique | Très répandu |
| PRTG | Commercial | Excellent UX |
| Datadog | Cloud | SaaS, puissant, cher |

## Métriques essentielles à surveiller

### Sur un switch / routeur

- **Disponibilité** (ping, SNMP up).
- **Utilisation des liens** (% de bande passante).
- **Erreurs CRC, drops, discards**.
- **CPU et mémoire**.
- **Température**.

### Sur un firewall

- Sessions actives / max.
- Conntrack utilisé.
- Throughput.
- Règles déclenchées.
- Tentatives bloquées (visualiser géographiquement = parlant).

### Sur un service

- Latence des requêtes.
- Taux d'erreur (4xx, 5xx).
- Throughput (requêtes/seconde).
- Saturation (queues, threads).

### Les "4 golden signals" Google SRE

1. **Latency** : délai de réponse.
2. **Traffic** : volume de demandes.
3. **Errors** : taux d'erreur.
4. **Saturation** : utilisation des ressources.

## Mesurer la disponibilité

### Calcul du SLA

| SLA | Indispo annuelle | Indispo mensuelle |
|-----|------------------|-------------------|
| 99% | 3,65 jours | 7,3 heures |
| 99,9% ("3 neufs") | 8,76 heures | 43,8 minutes |
| 99,99% ("4 neufs") | 52,6 minutes | 4,38 minutes |
| 99,999% ("5 neufs") | 5,26 minutes | 26,3 secondes |

🛡️ Plus de neufs = plus cher (exponentiellement). Un SLA de 99,999% sur un site interne est souvent inutile et coûteux.

## Test de performance réseau

### Iperf3 : la référence

```bash
# Sur le serveur
iperf3 -s

# Sur le client
iperf3 -c 192.168.1.10 -t 30
```

Résultats : débit TCP atteint, jitter, perte (UDP).

### Latence et gigue (jitter)

```bash
# Avec MTR sur 100 paquets
mtr -c 100 -r cible.exemple.fr
```

🏥 **VoIP** : exige < 150 ms de latence, < 30 ms de jitter, < 1% de perte. Au-delà, l'appel devient inutilisable.

---

# Scénarios d'incidents (transversal)

Voici 10 scénarios réalistes que **tout admin réseau rencontrera** dans sa carrière. Pour chacun : symptôme, cause réelle, signaux d'observabilité, mesures préventives.

---

## Scénario 1 — DNS split-horizon

### Symptôme

> "Le site `intranet.exemple.fr` marche au bureau mais pas depuis chez moi en télétravail."

### Cause réelle

DNS interne et DNS externe répondent différemment :
- En interne : `10.0.0.5` (serveur direct)
- En externe : devrait répondre l'IP du VPN, mais cet enregistrement n'existe pas → résolution échoue.

### Signaux d'observabilité

```bash
# Depuis le bureau
dig intranet.exemple.fr
;; ANSWER SECTION:
intranet.exemple.fr.    300    IN    A    10.0.0.5

# Depuis l'extérieur
dig intranet.exemple.fr
;; ANSWER SECTION: (vide ou NXDOMAIN)
```

### 🛡️ Prévention

- Documenter la stratégie split-horizon.
- Toujours créer une vue externe (même si elle pointe vers une IP qui exige le VPN).
- Logs DNS centralisés pour détecter les requêtes échouées.

---

## Scénario 2 — Route asymétrique

### Symptôme

> "Le `ping` fonctionne mais les sessions TCP se coupent au bout de quelques secondes."

### Cause réelle

L'aller passe par le firewall A, le retour par le firewall B. Le firewall B n'a pas vu l'établissement de la connexion → il coupe.

### Signaux

- Captures tcpdump qui montrent les SYN/SYN-ACK, mais pas le ACK final ou les datas.
- Logs firewall : "out-of-state packet dropped".

### 🛡️ Prévention

- Architecture symétrique (un seul chemin par flux).
- Si asymétrie nécessaire, désactiver le stateful inspection sur ces flux (avec précaution !).
- Tracking de flux côté NetFlow pour visualiser les chemins.

---

## Scénario 3 — MTU trop basse

### Symptôme

> "Je peux ouvrir Gmail, mais le téléchargement d'une pièce jointe freeze à 80%. Le TLS handshake d'un site freeze à mi-chemin."

### Cause réelle

Tunnel VPN ou opérateur réduit la MTU à 1400, mais ICMP "Fragmentation Needed" est filtré → le PMTUD échoue, les paquets de 1500 sont jetés silencieusement.

### Signaux

- `ping -M do -s 1472 cible` échoue avant `1372`.
- Capture : SYN + SYN-ACK OK, mais paquets data jamais acquittés.

### 🛡️ Prévention

- Activer le MSS clamping sur tous les routeurs/firewalls de tunneling.
- **Ne jamais** bloquer ICMP type 3 code 4.
- Test régulier de la MTU effective sur les liens critiques.

---

## Scénario 4 — Firewall stateful mal configuré

### Symptôme

> "Le serveur web reçoit les requêtes mais ne peut pas répondre."

### Cause réelle

Règle "ALLOW IN tcp/443", mais pas de règle "ALLOW OUT" pour la réponse. Sur certains firewalls non-stateful ou mal configurés, ce n'est pas automatique.

### Signaux

- `tcpdump` côté serveur : on voit les requêtes mais pas les réponses sortir.
- Compteurs firewall : drops sur la chaîne OUTPUT.

### 🛡️ Prévention

- Privilégier les firewalls stateful modernes.
- Politique : "ESTABLISHED, RELATED → ACCEPT" en première règle.
- Tests systématiques bidirectionnels après chaque modification.

---

## Scénario 5 — NAT/conntrack saturé

### Symptôme

> "Aux heures de pointe, certaines connexions échouent aléatoirement. Au bout de quelques minutes, tout revient."

### Cause réelle

Table conntrack pleine (par défaut 65536 entrées Linux, parfois 32k sur petits routeurs). Quand elle déborde, les nouvelles connexions sont jetées.

### Signaux

```bash
cat /proc/sys/net/netfilter/nf_conntrack_count
cat /proc/sys/net/netfilter/nf_conntrack_max
dmesg | grep "table full"
```

### 🛡️ Prévention

- Augmenter `nf_conntrack_max` selon RAM dispo.
- Réduire les timeouts (`nf_conntrack_tcp_timeout_established`).
- Monitoring → alerte à 80%.
- Pour très haut débit : passer en stateless ou en hardware (CGNAT opérateur).

---

## Scénario 6 — ARP spoofing / IP dupliquée

### Symptôme

> "La connectivité d'un poste est intermittente. Le passage du flux est aléatoire."

### Cause réelle

Deux machines ont la même IP, ou un attaquant fait de l'ARP spoofing.

### Signaux

```bash
# Vérifier les ARP en double
arp-scan --localnet

# Logs switch
"Duplicate IP address detected"
```

### 🛡️ Prévention

- DHCP avec réservations ou DHCP snooping.
- Dynamic ARP Inspection (DAI) sur switches managés.
- IDS pour détecter le spoofing.

---

## Scénario 7 — Boucle STP

### Symptôme

> "Tout le réseau est tombé d'un coup. Les switches clignotent comme un sapin de Noël. Personne ne ping personne."

### Cause réelle

Quelqu'un a branché un câble entre deux switches qui se ne voient pas STP entre eux. Boucle = broadcast storm = effondrement en 30 s.

### Signaux

- Trafic broadcast à 100% sur les ports trunk.
- CPU des switches à 100%.
- Tableau MAC qui change sans cesse.

### 🛡️ Prévention

- **STP/RSTP activé partout** (sauf cas particuliers).
- **BPDU Guard** sur les ports d'accès (= si une trame STP arrive, le port est désactivé immédiatement).
- **Root Guard** sur les ports vers les distributions.
- Documentation à jour de la topologie.

---

## Scénario 8 — Certificat expiré ou chaîne incomplète

### Symptôme

> "Le navigateur affiche un cadenas rouge. `curl` répond bien avec `-k`, mais échoue sans."

### Cause réelle

Soit le certificat est expiré, soit les certificats intermédiaires ne sont pas envoyés par le serveur.

### Signaux

```bash
echo | openssl s_client -connect www.exemple.fr:443 2>/dev/null | \
  openssl x509 -noout -dates
# notAfter=Oct  1 12:00:00 2025 GMT  ← expiré

# Vérifier la chaîne
openssl s_client -connect www.exemple.fr:443 -showcerts
```

### 🛡️ Prévention

- Renouvellement automatique (Let's Encrypt + cron).
- **Monitoring de l'expiration** (Prometheus blackbox-exporter, Zabbix).
- Alerte 30 jours avant expiration.
- Configurer le serveur pour envoyer la **chaîne complète**.

---

## Scénario 9 — DNS TTL trop long

### Symptôme

> "On a migré le serveur vendredi, mais 30% des utilisateurs voient toujours l'ancien lundi matin."

### Cause réelle

Le TTL de l'enregistrement A était de 86400 (24h). Les caches DNS le gardent.

### 🛡️ Prévention

- 24h avant migration : descendre TTL à 60 secondes.
- Une fois migration validée et stable : remonter à 3600.
- Documenter dans le runbook de migration.

---

## Scénario 10 — Pod K8s : egress bloqué

### Symptôme

> "Mes pods se parlent entre eux, mais ne peuvent pas appeler une API externe."

### Cause réelle

NetworkPolicy "default deny" sans règle d'egress vers Internet.

### Signaux

- Connectivité interne OK.
- DNS échoue depuis le pod (`kube-dns` non joignable).
- Pas de logs côté firewall externe.

### 🛡️ Prévention

- Tester systématiquement les NetworkPolicy en **deny-then-allow**.
- Documenter les flux egress requis par chaque service.
- CoreDNS doit être joignable depuis tous les namespaces.

---

# Glossaire

**ACL** (Access Control List) : liste de règles de filtrage.

**ARP** (Address Resolution Protocol) : associe IP et MAC sur un LAN.

**AS** (Autonomous System) : ensemble de réseaux IP gérés par une seule entité.

**ASN** (Autonomous System Number) : identifiant unique d'un AS.

**BGP** (Border Gateway Protocol) : protocole de routage entre AS (Internet).

**BPDU** (Bridge Protocol Data Unit) : trame STP.

**CIDR** (Classless Inter-Domain Routing) : notation /N pour les masques.

**CDN** (Content Delivery Network) : réseau de cache géo-distribué.

**CSIRT** (Computer Security Incident Response Team) : équipe de réponse à incident.

**DDoS** (Distributed Denial of Service) : déni de service distribué.

**DHCP** (Dynamic Host Configuration Protocol) : attribution auto d'IP.

**DMZ** (DeMilitarized Zone) : zone tampon entre LAN et Internet.

**DNS** (Domain Name System) : annuaire des noms.

**EDR** (Endpoint Detection and Response) : surveillance avancée des postes.

**FAI** (Fournisseur d'Accès Internet).

**HSM** (Hardware Security Module) : boîtier de stockage de clés cryptographiques.

**ICMP** (Internet Control Message Protocol) : signalisation IP (ping, etc.).

**IDS / IPS** (Intrusion Detection / Prevention System).

**IPSec** : suite de protocoles de chiffrement IP.

**LACP** (Link Aggregation Control Protocol) : agrégation de liens.

**MAC** (Media Access Control) : adresse physique d'une carte réseau.

**MFA** (Multi-Factor Authentication) : authentification multi-facteurs.

**MITM** (Man-In-The-Middle) : attaque par interception.

**MPLS** (Multi-Protocol Label Switching) : commutation par étiquette (réseaux opérateurs).

**MSS** (Maximum Segment Size) : taille max de payload TCP.

**MTU** (Maximum Transmission Unit) : taille max d'un paquet sur un lien.

**NAC** (Network Access Control) : contrôle d'accès au réseau.

**NAT** (Network Address Translation).

**NFV** (Network Function Virtualization).

**NGFW** (Next-Generation Firewall) : pare-feu nouvelle génération avec L7.

**OSI** : modèle en 7 couches (référence pédagogique).

**OSPF** (Open Shortest Path First) : protocole de routage interne.

**OT** (Operational Technology) : SI industriels.

**PAM** (Privileged Access Management) : gestion des comptes privilégiés.

**PMTUD** (Path MTU Discovery) : découverte de la MTU sur le chemin.

**PoE** (Power over Ethernet) : alimentation via câble réseau.

**QoS** (Quality of Service) : politique de priorisation.

**RIR** (Regional Internet Registry) : registre régional (RIPE, ARIN, APNIC...).

**SASE** (Secure Access Service Edge) : convergence réseau + sécurité cloud.

**SCADA** (Supervisory Control And Data Acquisition) : supervision industrielle.

**SD-WAN** (Software-Defined WAN) : WAN piloté logiciellement.

**SDN** (Software-Defined Network) : réseau piloté logiciellement.

**SIEM** (Security Information and Event Management) : centralisation logs sécurité.

**SLA** (Service Level Agreement) : engagement de niveau de service.

**SNI** (Server Name Indication) : extension TLS pour multi-hébergement.

**SNMP** (Simple Network Management Protocol).

**SOC** (Security Operations Center).

**SPF / DKIM / DMARC** : trinité anti-usurpation email.

**STP** (Spanning Tree Protocol) : prévention des boucles L2.

**TCP** (Transmission Control Protocol) : transport fiable.

**TLS** (Transport Layer Security) : chiffrement de bout en bout.

**UDP** (User Datagram Protocol) : transport non fiable rapide.

**VLAN** (Virtual LAN) : LAN logique sur infrastructure partagée.

**VPN** (Virtual Private Network).

**VRRP** (Virtual Router Redundancy Protocol) : redondance de passerelle.

**WAF** (Web Application Firewall).

**WAN** (Wide Area Network).

**XDR** (Extended Detection and Response) : EDR étendu (réseau, cloud, identité).

**ZTNA** (Zero Trust Network Access).

---

## 🎓 Pour aller plus loin

### Certifications recommandées (par ordre de progression)

1. **CCNA** (Cisco) — fondamentaux réseau.
2. **Network+** (CompTIA) — vendor-neutral.
3. **Security+** (CompTIA) — bases cybersécurité.
4. **CCNP / JNCIP** — réseau avancé.
5. **OSCP** — pentest offensif.
6. **CISSP** — management de la sécurité.
7. **CCIE** — sommet réseau.

### Communautés et ressources

- **r/networking** (Reddit).
- **NANOG** (mailing list opérateur).
- **FRnOG** (équivalent français).
- **RIPE Labs** (publications techniques de qualité).
- **CERT-FR / ANSSI** : alertes officielles France.

### Lecture recommandée

- *TCP/IP Illustrated* — W. Richard Stevens (la référence).
- *Computer Networks* — Tanenbaum.
- *Network Warrior* — Gary A. Donahue (terrain).
- *The Practice of Network Security Monitoring* — Richard Bejtlich.

---

## ✍️ Mot de la fin

> Un bon administrateur réseau n'est pas celui qui connaît tous les protocoles par cœur.
> C'est celui qui sait **où chercher** quand ça casse, **documente** quand ça marche,
> et **anticipe** ce qui va casser demain.

La maîtrise vient avec la **pratique**. Montez votre homelab, cassez-le, réparez-le.
C'est la seule voie.

Bon courage, et **gardez vos sauvegardes immuables** ! 🛡️


