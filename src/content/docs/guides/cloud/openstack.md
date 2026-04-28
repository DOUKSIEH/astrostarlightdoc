---
title: "Cloud Privé OpenStack"
description: "Cloud Privé OpenStack — Documentation Pédagogique Complète"
created: "2026-04-24"
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
2. [Partie 1 — Les fondamentaux](#partie-1--les-fondamentaux)
3. [Partie 2 — Architecture et équipements](#partie-2--architecture-et-équipements)
4. [Partie 3 — Sécurité réseau](#partie-3--sécurité-réseau)
5. [Partie 4 — Cyberattaques et défense](#partie-4--cyberattaques-et-défense)
6. [Partie 5 — Pratiques par secteur d'activité](#partie-5--pratiques-par-secteur-dactivité)
7. [Partie 6 — Supervision et métrologie](#partie-6--supervision-et-métrologie)
8. [Partie 7 — Scénarios d'incidents](#partie-7--scénarios-dincidents)
9. [Glossaire](#glossaire)

---

## Avant-propos

### À qui s'adresse ce guide ?

- 🎓 **Étudiants et débutants** : aucun prérequis. Concepts introduits par analogies du quotidien.
- 👨‍💻 **Administrateurs réseau** : pratiques avancées (VLANs, supervision, sécurité).
- 🔒 **Professionnels cybersécurité** : attaques et défenses au niveau réseau.
- 🏢 **Décideurs IT** : choisir les bonnes solutions selon le secteur.

### Conventions du guide

| Pictogramme | Signification |
|-------------|---------------|
| 🎯 | Objectif d'apprentissage |
| 💡 | Analogie pour comprendre |
| ⚙️ | Configuration / commande pratique |
| ⚠️ | Point de vigilance / faille |
| 🛡️ | Bonne pratique de sécurité |
| 🏥 | Application sectorielle |

---

# PARTIE 1 — Les fondamentaux

## 1.1 Qu'est-ce qu'un réseau ?

### 💡 Analogie : la poste

Imaginez envoyer une lettre à un ami :
1. Vous écrivez son **adresse** (= adresse IP).
2. Vous mettez votre adresse retour (= IP source).
3. La lettre va dans une **enveloppe** (= encapsulation).
4. Le facteur passe de **bureau de poste en bureau de poste** (= routeurs).
5. Pour atteindre la bonne pièce de la maison, on précise un numéro (= port).

Un réseau informatique fait pareil, à la vitesse de la lumière.

### Définitions essentielles

- **Réseau** : ensemble de machines qui échangent des données.
- **LAN** (Local Area Network) : maison, bureau (quelques mètres à quelques centaines).
- **WAN** (Wide Area Network) : Internet, liaisons entre villes/pays.
- **Protocole** : la "langue" commune que les machines parlent.

### Le modèle en couches

Plutôt qu'un seul énorme protocole, on découpe en **couches spécialisées** :

| Couche | Rôle | Analogie |
|--------|------|----------|
| Application | Ce que voit l'utilisateur | Le contenu de la lettre |
| Transport | Fiabilité, ordre | Chronopost vs lettre simple |
| Réseau | Acheminement entre réseaux | La route entre villes |
| Liaison | Communication entre voisins | La rue dans le quartier |
| Physique | Câble, ondes | Le facteur lui-même |

> 🛡️ Comprendre où "ça casse" dans la pile permet de diagnostiquer 90% des pannes.

---

## 1.2 Adressage IP et sous-réseaux

### 💡 Analogie : le numéro de rue

Une IP comme `192.168.1.42` se lit :
- **192.168.1** : la rue (le réseau)
- **42** : le numéro de la maison (l'hôte)

Le **masque** dit où s'arrête la rue :
- `/24` = 254 maisons possibles
- `/16` = 65 534 maisons (un quartier)
- `/30` = 2 maisons (liaison point-à-point)

### Plages privées (à connaître par cœur)

| Plage | Masque | Usage typique |
|-------|--------|----------------|
| `10.0.0.0/8` | /8 | Grandes entreprises |
| `172.16.0.0/12` | /12 | Entreprises moyennes |
| `192.168.0.0/16` | /16 | Box internet, PME, homelab |

⚠️ Ces adresses **ne sont pas routables sur Internet**. Elles passent par du NAT.

### Calculer un sous-réseau

Soit `192.168.10.0/26`. Combien d'hôtes ?
- `/26` → 32 - 26 = **6 bits hôtes** = 2⁶ = 64 adresses
- Utilisables : 64 - 2 = **62 hôtes**
- Plage : `.0` (réseau) à `.63` (broadcast), hôtes de `.1` à `.62`

> 💡 Mémo : pour /N, hôtes utilisables = 2^(32-N) - 2

### IPv6 minimal

IPv4 = 4,3 milliards d'adresses → épuisées en 2011. IPv6 = 3,4 × 10³⁸ adresses.

Format : `2001:0db8:85a3:0000:0000:8a2e:0370:7334`
Simplifié : `2001:db8:85a3::8a2e:370:7334`

| Type | Préfixe | Rôle |
|------|---------|------|
| Link-local | `fe80::/10` | Communication locale |
| Unique local | `fc00::/7` | Équivalent privé IPv4 |
| Global unicast | `2000::/3` | Public routable |

🛡️ En 2026 : **dual-stack** (IPv4 + IPv6) est la norme. Ne désactivez jamais IPv6 sans comprendre l'impact.

---

## 1.3 Routage

### 💡 Analogie : le GPS

À chaque embranchement, un panneau (= routeur) consulte sa **table de routage** pour décider où envoyer chaque paquet.

### Table de routage minimale

```
Destination     Passerelle    Interface
192.168.1.0/24  *             eth0      (réseau direct)
0.0.0.0/0       192.168.1.1   eth0      (route par défaut)
```

La **route par défaut** dit : "pour tout ce que je ne connais pas, envoie au 192.168.1.1".

### Statique vs dynamique

- **Statique** : l'admin écrit chaque route. Simple, prévisible.
- **Dynamique** : les routeurs apprennent automatiquement (OSPF, BGP).

| Protocole | Usage | Échelle |
|-----------|-------|---------|
| OSPF | Réseau interne d'entreprise | LAN/WAN privé |
| BGP | Internet, opérateurs | Mondial |
| EIGRP | Réseaux Cisco | Privé |

### ⚙️ Commandes Linux

```bash
ip route show                                    # Afficher
sudo ip route add 10.20.0.0/16 via 192.168.1.254 # Ajouter
sudo ip route add default via 192.168.1.1        # Route par défaut
```

---

## 1.4 TCP et UDP

### 💡 Analogie : recommandé vs carte postale

- **TCP** = lettre recommandée : poignée de main, accusé de réception, ré-émission. Fiable mais lent.
- **UDP** = carte postale : on envoie sans confirmation. Rapide mais non fiable.

### Quand utiliser quoi ?

✅ **TCP** : Web, email, SSH, fichiers, BDD → arriver **complet et dans l'ordre**.
✅ **UDP** : VoIP, streaming, jeux, DNS, SNMP → arriver **vite, peu importe quelques pertes**.

### Poignée de main TCP

```
Client                    Serveur
  | ----- SYN ----->        |    "Salut, tu es là ?"
  | <--- SYN-ACK ----       |    "Oui, et toi ?"
  | ----- ACK ----->        |    "Oui aussi. C'est parti."
```

### Ports essentiels

| Port | Protocole | Service |
|------|-----------|---------|
| 22 | TCP | SSH |
| 25/587 | TCP | SMTP |
| 53 | UDP/TCP | DNS |
| 80 | TCP | HTTP |
| 443 | TCP | HTTPS |
| 3306 | TCP | MySQL |
| 5432 | TCP | PostgreSQL |

---

## 1.5 DNS : l'annuaire d'Internet

### 💡 Analogie : les Pages Jaunes

Personne ne mémorise les numéros. On cherche un nom, on obtient le numéro. DNS traduit `wikipedia.org` en `208.80.154.224`.

### Comment ça marche ?

1. Vous tapez `www.exemple.fr`.
2. Votre PC interroge son **résolveur** (box, ou public comme `1.1.1.1`).
3. Le résolveur descend la hiérarchie : racine `.` → `.fr` → `exemple.fr` → `www.exemple.fr`.
4. Réponse : `203.0.113.42`.

Tout cela en **moins de 100 ms** grâce au cache.

### Types d'enregistrements

| Type | Rôle |
|------|------|
| A | Nom → IPv4 |
| AAAA | Nom → IPv6 |
| CNAME | Alias |
| MX | Serveur mail |
| TXT | Texte (SPF, DKIM, vérifications) |
| NS | Serveurs DNS faisant autorité |
| SRV | Localisation d'un service |
| CAA | Quelles AC peuvent émettre un certificat TLS |

### ⚙️ Outils de diagnostic

```bash
dig www.google.com                  # Résolution simple
dig +trace www.google.com           # Voir tout le chemin
dig @1.1.1.1 www.example.com        # Interroger un DNS précis
dig MX gmail.com                    # Voir les MX
dig -x 8.8.8.8                      # Reverse DNS
```

### Le piège du TTL

Avant une migration de serveur : **réduisez le TTL à 60s, 24h avant**. Sinon vos utilisateurs pointeront sur l'ancien serveur pendant des heures.

### Split-horizon DNS

Le même nom répond **différemment** selon qui demande :
- En interne : `intranet.entreprise.com` → `10.0.0.5`
- Depuis Internet : `intranet.entreprise.com` → IP de VPN

🏥 **Application bancaire** : les services internes ne sont jamais résolus depuis Internet → empêche l'attaquant externe de cartographier la topologie.

---

## 1.6 ICMP et diagnostic

### 💡 Analogie : le sonar

On envoie un "ping", on attend l'écho, on en déduit l'état du chemin.

### Le ping en détail

```bash
ping -c 4 google.com

64 bytes from 142.250.74.142: icmp_seq=1 time=8.21 ms
```

Donne 4 informations : machine joignable, latence, gigue, taux de perte.

⚠️ "Ça ne ping pas" ≠ "c'est down". Beaucoup de machines bloquent ICMP.

### Traceroute et MTR

```bash
traceroute google.com   # Tous les routeurs traversés
mtr google.com          # Combo ping + traceroute en temps réel ⭐
```

> MTR est **l'outil n°1** pour les problèmes intermittents.

---

## 1.7 DHCP : la distribution automatique d'IP

### 💡 Analogie : le réceptionniste de l'hôtel

Vous arrivez, le réceptionniste vous attribue une chambre, vous donne la clé, note votre identité. DHCP fait pareil pour les machines.

### Le processus DORA

```
1. DISCOVER : "Y a-t-il un DHCP ?"        (broadcast client)
2. OFFER    : "Je te propose 192.168.1.42" (serveur)
3. REQUEST  : "Je prends !"                (client)
4. ACK      : "Validé. Bail de 24h."      (serveur)
```

### Ce que fournit DHCP

✅ IP, masque, passerelle, DNS, durée du bail, options (NTP, PXE...).

### ⚠️ Le DHCP rogue

Un attaquant branche un faux DHCP → les clients prennent ses DNS → MITM.

🛡️ **Parade** : DHCP snooping sur les switches managés.

---

## 1.8 HTTP, HTTPS et TLS

### 💡 Analogie : la commande au restaurant

- Client demande le menu (**GET /menu**).
- Serveur répond avec un **statut** "200 OK".
- Client commande (**POST /commande**).
- Serveur valide ou refuse.

### Anatomie d'une requête

```http
GET /index.html HTTP/1.1
Host: www.exemple.fr
User-Agent: Mozilla/5.0
```

```http
HTTP/1.1 200 OK
Content-Type: text/html

<html>...</html>
```

### Codes de statut

| Famille | Sens |
|---------|------|
| 2xx | Succès (200, 201, 204) |
| 3xx | Redirection (301, 302, 304) |
| 4xx | Erreur client (400, 401, 403, 404, 429) |
| 5xx | Erreur serveur (500, 502, 503, 504) |

### HTTPS = HTTP + TLS

Bénéfices : **confidentialité**, **intégrité**, **authenticité** du serveur.

### Diagnostic TLS

```bash
# Voir le certificat
openssl s_client -connect www.exemple.fr:443 -servername www.exemple.fr

# Vérifier la date d'expiration
echo | openssl s_client -connect www.exemple.fr:443 2>/dev/null | \
  openssl x509 -noout -dates
```

### Erreurs TLS classiques

| Erreur | Cause |
|--------|-------|
| `certificate expired` | À renouveler |
| `unable to verify the first certificate` | Chaîne intermédiaire absente |
| `name mismatch` | Mauvais SNI ou mauvais certificat |
| `self signed` | Non signé par AC reconnue |

### NTP : le piège oublié

Si l'horloge dérive, **TLS casse** (cause #1 des "ça marchait hier"). Toujours synchroniser via NTP/chrony.

### 🛡️ Bonnes pratiques HTTPS

- HSTS forcé.
- Cookies `Secure` + `HttpOnly`.
- En-têtes : `Content-Security-Policy`, `X-Frame-Options`.
- Renouvellement automatique (Let's Encrypt + cron).

---

## 1.9 Email (SMTP/IMAP/POP3)

### 💡 Analogie : la poste internationale

1. Vous postez (**SMTP** vers serveur sortant).
2. Poste française → poste allemande (**SMTP** entre serveurs).
3. Boîte du destinataire (livraison locale).
4. Le destinataire relève (**IMAP** ou **POP3**).

### Protocoles

| Protocole | Port | Rôle |
|-----------|------|------|
| SMTP | 25, 587, 465 | Envoyer |
| IMAP | 143, 993 (TLS) | Lire (synchronisé) |
| POP3 | 110, 995 (TLS) | Lire (téléchargement) |

### SPF, DKIM, DMARC : indispensables

🛡️ Sans ces 3 enregistrements DNS, vos emails finissent en spam **et** n'importe qui peut usurper votre domaine.

- **SPF** : liste les serveurs autorisés à envoyer pour votre domaine.
- **DKIM** : signature cryptographique des emails.
- **DMARC** : politique en cas d'échec SPF/DKIM (rejeter, quarantaine).

🏥 **Application bancaire** : sans DMARC strict (`p=reject`), vous êtes vulnérable au phishing par usurpation. C'est devenu une exigence réglementaire.

---

## 1.10 MTU, MSS et fragmentation

### 💡 Analogie : la taille des colis

- **MTU** : taille max d'un colis qu'une route accepte.
- **MSS** : taille du contenu (sans l'emballage).
- **PMTUD** : "qu'est-ce que la plus petite route entre ici et la cible accepte ?"

### Valeurs typiques

| Lien | MTU |
|------|-----|
| Ethernet standard | 1500 |
| PPPoE (ADSL) | 1492 |
| VPN IPSec | ~1400 |
| WireGuard | 1420 |
| Jumbo frames | 9000 |

### Le problème classique

VPN monté → MTU = 1400 → PC envoie toujours 1500 → si ICMP "Fragmentation Needed" est bloqué → **TCP freeze silencieux**.

Symptômes :
- TLS qui freeze à mi-handshake.
- Téléchargements qui s'arrêtent.
- SSH connecté mais qui freeze à `ls` long.

### 🛡️ Solution : MSS clamping

```bash
iptables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN \
  -j TCPMSS --clamp-mss-to-pmtu
```

> Règle d'or : ne **jamais** bloquer aveuglément ICMP type 3 code 4.

---

## 1.11 Checklist de diagnostic

Quand "ça ne marche pas", testez **dans cet ordre** :

```
1. Câble / Wi-Fi connecté ?            (L1)
2. J'ai une IP ?                       → ip addr
3. Je ping ma passerelle ?             → ping 192.168.1.1
4. Je ping une IP publique ?           → ping 8.8.8.8
5. Le DNS résout ?                     → dig google.com
6. Le port est joignable ?             → nc -zv host 443
7. Le service applicatif répond ?      → curl -v https://...
```

→ La couche où ça casse vous dit quoi corriger.

### Commandes essentielles

```bash
ip addr / ip route                     # IP et routage
ss -tnlp                              # Ports en écoute
ping / mtr / traceroute               # Chemin et latence
dig                                   # Résolution DNS
nc -zv host port                      # Tester un port
curl -v                               # Tester HTTP/HTTPS
tcpdump / tshark                      # Capture brute
```

---

# PARTIE 2 — Architecture et équipements

## 2.1 Le modèle OSI en pratique

| # | Couche | Exemples | Outils diagnostic |
|---|--------|----------|-------------------|
| 7 | Application | HTTP, SMTP, DNS, SSH | curl, dig |
| 6 | Présentation | TLS, JPEG | openssl |
| 5 | Session | NetBIOS, RPC | rare |
| 4 | Transport | TCP, UDP | ss, nc, iperf |
| 3 | Réseau | IP, ICMP, OSPF | ping, traceroute, ip |
| 2 | Liaison | Ethernet, Wi-Fi, ARP | arp, tcpdump |
| 1 | Physique | Câble, fibre, RF | ethtool |

### Encapsulation

```
Couche 7 :        [Données HTTP]
Couche 4 (TCP):   [TCP|Données]
Couche 3 (IP):    [IP|TCP|Données]
Couche 2 (Eth):   [Eth|IP|TCP|Données|FCS]
Couche 1 :        [10101010101001...]
```

À chaque couche descendante on **ajoute un en-tête**, à la réception chaque couche **enlève le sien**.

---

## 2.2 Les équipements réseau

| Équipement | Couche | Rôle |
|------------|--------|------|
| Hub (obsolète) | 1 | Répète tout sur tous les ports |
| Switch | 2 | Apprend les MAC, envoie au bon port |
| Routeur | 3 | Décide du chemin entre réseaux IP |
| Firewall | 3-7 | Filtre selon des règles |
| Point d'accès Wi-Fi | 1-2 | Pont radio ↔ Ethernet |
| Load balancer | 4 ou 7 | Distribue entre plusieurs serveurs |
| Reverse proxy | 7 | Termine connexions clientes, transmet aux backends |

---

## 2.3 La couche physique (L1)

### Supports

| Support | Débit max | Distance |
|---------|-----------|----------|
| Cuivre Cat 5e | 1 Gbps | 100 m |
| Cuivre Cat 6/6a | 10 Gbps | 100 m / 55 m |
| Cuivre Cat 7/8 | 25-40 Gbps | 30 m |
| Fibre multimode OM4 | 100 Gbps | ~150 m |
| Fibre monomode | 100+ Gbps | 40+ km |

### PoE (Power over Ethernet)

| Norme | Puissance |
|-------|-----------|
| 802.3af (PoE) | 15,4 W |
| 802.3at (PoE+) | 30 W |
| 802.3bt (PoE++) | 60 ou 90 W |

→ Alimente caméras, points d'accès, téléphones IP via le câble réseau.

⚠️ **Symptômes L1** : erreurs CRC croissantes → câble défectueux ou interférence.

```bash
ethtool eth0                # État du lien
ip -s link show eth0        # Stats erreurs
```

---

## 2.4 ARP, VLANs, STP : la couche 2 en pratique

### Adresse MAC

48 bits hexa : `00:1A:2B:3C:4D:5E`. Théoriquement unique au monde (mais clonable !).

### ARP : IP → MAC sur un LAN

```
1. Broadcast : "Qui a 192.168.1.42 ?"
2. Réponse : "Moi ! MAC = 00:1A:2B:3C:4D:5E"
3. Stockage dans la table ARP locale.
```

```bash
ip neigh                    # Voir la table ARP
sudo ip neigh flush all     # La vider
```

### ⚠️ ARP poisoning

Attaquant envoie de faux ARP : "C'est moi le routeur". Tout le trafic passe par lui (MITM).

🛡️ **Parades** : Dynamic ARP Inspection (DAI) sur switches, IP statique des routeurs critiques, Arpwatch.

### Les VLANs (802.1Q)

Un switch physique se découpe logiquement en **réseaux étanches** :

```
Switch :
  Ports 1-12  → VLAN 10 (bureautique)
  Ports 13-20 → VLAN 20 (téléphonie)
  Ports 21-24 → VLAN 30 (caméras)
```

Bénéfices : sécurité (un poste ne voit pas une caméra), broadcasts limités, QoS.

- **Port access** : un VLAN, sans tag (machine standard).
- **Port trunk** : plusieurs VLANs avec tag 802.1Q (entre switches).

### Spanning Tree (STP)

🌪️ Si vous reliez 2 switches par 2 câbles → boucle → broadcast storm → effondrement en 30 s.

🛡️ **STP** détecte les boucles et désactive automatiquement les liens redondants.

| Version | Reconvergence |
|---------|----------------|
| STP (802.1D) | ~30 s |
| RSTP (802.1w) | ~3 s |
| MSTP (802.1s) | un STP par groupe de VLANs |

🛡️ **Toujours activer BPDU Guard** sur les ports d'accès : si une trame STP arrive d'un poste, le port est désactivé immédiatement.

### LACP : agrégation de liens

Plutôt que désactiver le 2ᵉ câble, on **agrège** : un lien logique de 2 Gbps.

---

## 2.5 NAT, conntrack, routage avancé

### NAT (Network Address Translation)

Traduit les IP privées vers une IP publique partagée.

| Type | Usage |
|------|-------|
| SNAT | Sortie Internet (votre box) |
| DNAT | Publier un serveur interne (port forwarding) |
| NAT 1:1 | Une publique = une privée fixe |
| PAT | Plusieurs privées sur une seule publique |

### Conntrack : la table d'états

Le firewall stateful garde la trace de **chaque connexion**. Sans elle, il ne saurait pas qu'une réponse est légitime.

```bash
sudo conntrack -L
cat /proc/sys/net/netfilter/nf_conntrack_count
```

⚠️ **Saturation** : sur firewall très chargé, la table déborde → timeouts aléatoires.

🛡️ Monitoring + alerte si > 80% de `nf_conntrack_max`.

---

## 2.6 Architecture WAN et opérateurs

### Hiérarchie des opérateurs

| Niveau | Description |
|--------|-------------|
| Tier 1 | Backbone mondial, peering gratuit avec autres Tier 1 |
| Tier 2 | National/régional, achète du transit aux Tier 1 |
| Tier 3 | Local (FAI grand public), achète aux Tier 2 |

### Boucle locale fibre (FTTH)

```
Domicile → PMZ (point de mutualisation) → NRO (nœud raccordement optique)
        → POP opérateur → Backbone Internet
```

### Choisir une offre WAN entreprise

| Type | Avantages | Inconvénients |
|------|-----------|---------------|
| FTTO (fibre dédiée) | GTR 4h, débit garanti | Cher (300-1000€/mois) |
| Fibre pro mutualisée | Bon prix | GTR limitée |
| 4G/5G secours | Backup mobile | Latence variable |
| MPLS | Privé, qualité opérateur | Cher, lent à déployer |

🛡️ **MultiWAN obligatoire** pour tout site critique : 2 opérateurs distincts, idéalement avec arrivées physiques différentes.

---

## 2.7 Haute disponibilité

### Redondance L2

- **STP / RSTP** : protection contre boucles.
- **LACP** : agrégation active/active.
- **MLAG / Stack** : 2 switches vus comme un seul.

### Redondance L3

- **VRRP** (standard) : 2 routeurs partagent une IP virtuelle.
- **HSRP** (Cisco) : équivalent propriétaire.
- **CARP** (BSD/pfSense) : équivalent open source.

```
        IP virtuelle 192.168.1.1
        /                      \
[ Routeur A ]            [ Routeur B ]
  Master                   Backup
  (priorité 200)          (priorité 100)
```

Si A tombe → B prend l'IP virtuelle en < 1 seconde.

### Stockage de configuration

Pratique professionnelle : **gérer les configs réseau dans Git**.

```bash
# Backup automatique d'une config Cisco
ssh switch1 "show running-config" > configs/switch1.txt
git commit -am "Daily backup $(date +%Y-%m-%d)"
```

---

# PARTIE 3 — Sécurité réseau

## 3.1 Pare-feu : les bases

### 💡 Analogie : le portier de boîte de nuit

Liste VIP → entre. Mineur → refuse. Tenue inadaptée → refuse. Le firewall fait pareil avec les paquets.

### Types de firewalls

| Type | Niveau | Capacité |
|------|--------|----------|
| Filtrage paquets | L3/L4 | IP/port. Stateless (rapide, basique) |
| Stateful | L3/L4 + état | Suit les connexions |
| Proxy applicatif | L7 | Comprend HTTP, FTP. Filtre fin |
| NGFW | L7 + IDS/IPS | Détection, AppID, AV intégré |

### Anatomie d'une règle

```
Source : 192.168.1.0/24
Destination : any
Protocole : TCP
Port : 443
Action : ALLOW
```

Lecture : "Autoriser le LAN à sortir en HTTPS."

### Règle d'or : DENY ALL en bas

```
1. Autoriser explicitement ce qu'on veut
2. Tout le reste : DENY ALL (avec log !)
```

### DROP vs REJECT

- **DROP** : ignore silencieusement.
- **REJECT** : renvoie un "refusé".

🛡️ Pour la sécurité externe : préférer **DROP** (ne pas renseigner l'attaquant).

### Solutions du marché

| Solution | Type |
|----------|------|
| OPNsense / pfSense | Open source pro |
| Fortinet FortiGate | Commercial leader |
| Palo Alto | Commercial premium |
| Check Point | Commercial historique |
| Cisco Firepower | Commercial |
| iptables / nftables | Linux natif |

---

## 3.2 Sécurité au niveau switch

### Port-security

Limite le nombre de MAC autorisées sur un port.

```
Port 1 : max 2 MAC, action si dépassement = shutdown
```

→ Empêche le branchement d'un switch pirate.

### DHCP snooping

Le switch n'autorise les réponses DHCP que sur les ports déclarés "trusted" (ceux du vrai DHCP).

→ Bloque les DHCP rogue.

### 802.1X : authentification réseau

Avant d'avoir accès au réseau, l'utilisateur ou la machine doit s'authentifier (RADIUS, certificats).

```
PC → Switch (port bloqué) → "Authentifie-toi"
PC → fournit identifiant/cert → RADIUS valide → port ouvert
```

🏥 Indispensable dans les environnements sensibles (hôpitaux, banques, sites industriels).

### Saut de VLAN (VLAN hopping)

Attaque qui exploite la mauvaise config des trunks pour passer d'un VLAN à un autre.

🛡️ **Parades** : ne jamais utiliser le VLAN 1 (natif) pour des données, désactiver DTP, configurer manuellement les trunks.

---

## 3.3 VPN et accès distants

### VPN nomade

L'utilisateur en télétravail établit un tunnel chiffré vers le SI.

| Solution | Type |
|----------|------|
| WireGuard | Moderne, simple, rapide |
| OpenVPN | Mature, flexible |
| IPSec IKEv2 | Standard, multi-vendor |
| Solutions commerciales | Fortinet, Palo Alto, Cisco AnyConnect |

### VPN site-à-site

Relie deux sites (par exemple siège + agence) via Internet en chiffré.

Phases IPSec :
1. **Phase 1 (IKE)** : authentification mutuelle, clés Diffie-Hellman.
2. **Phase 2 (ESP)** : échange chiffré effectif des données.

### Zero Trust Network Access (ZTNA)

Approche moderne qui remplace le VPN classique.

| Aspect | VPN classique | ZTNA |
|--------|---------------|------|
| Accès | Réseau entier | Application précise |
| Modèle | Confiance au LAN | Aucune confiance |
| Visibilité | Faible | Granulaire |
| Mouvement latéral | Possible | Quasi-nul |

Solutions : Cloudflare Access, Zscaler, Tailscale, Twingate.

🛡️ **Doctrine 2026** : "Never trust, always verify." Chaque accès est authentifié, autorisé, chiffré, sans périmètre de confiance.

---

## 3.4 Bonnes pratiques générales

### Segmentation : la clé

Politique recommandée pour une PME :

| VLAN | Usage | Internet | Inter-VLAN |
|------|-------|----------|------------|
| 10 | Postes bureautiques | ✅ | → Serveurs uniquement |
| 20 | Serveurs internes | ✅ limité | → DB uniquement |
| 30 | DMZ web public | ✅ | → DB uniquement |
| 40 | Téléphonie IP | ✅ SIP | Isolé |
| 50 | Caméras IP | ❌ | Isolé |
| 60 | IoT | ❌ | Isolé |
| 99 | Management | ❌ | Admin only |

### Principe de moindre privilège

🛡️ **Default deny everywhere** : tout est interdit, on ouvre explicitement ce qui est nécessaire.

### Patch management

- **Inventaire** complet et à jour des équipements.
- **Surveillance** des CVE publiées (CERT-FR, CISA).
- **Fenêtres de maintenance** régulières.
- **Tests** avant déploiement en production.

### Sauvegarde de configurations

🛡️ **Stratégie 3-2-1-1-0** :
- 3 copies, 2 supports différents, 1 hors site, 1 hors ligne (immuable), 0 erreur (vérifier les restaurations !).

---

# PARTIE 4 — Cyberattaques et défense

## 4.1 La Cyber Kill Chain

```
1. Reconnaissance       → OSINT, scans
2. Armement (weaponize) → Création du payload
3. Livraison            → Phishing, USB, exploit
4. Exploitation         → Le code malveillant s'exécute
5. Installation         → Persistance (backdoor)
6. Command & Control    → L'attaquant contrôle à distance
7. Actions sur objectif → Vol, chiffrement, sabotage
```

🛡️ **Bonne nouvelle** : il suffit de **casser une seule étape** pour bloquer l'attaque.

---

## 4.2 Reconnaissance : ce que sait l'attaquant

### OSINT (Open Source Intelligence)

Informations publiques sur votre entreprise :
- Noms d'employés (LinkedIn).
- Emails fuités passés (haveibeenpwned).
- Technologies utilisées (BuiltWith, Wappalyzer).
- Sous-domaines (crt.sh, Censys, Shodan).
- Métadonnées de PDF.

### Scan actif

```bash
# À NE faire QUE sur des réseaux qui vous appartiennent !
nmap -sn 192.168.1.0/24             # Découverte machines
nmap -sS -sV -p- -T4 cible.fr       # Scan complet
nmap -A cible.fr                    # Détection services et OS
```

🛡️ **Côté défense** : IDS qui détecte les scans, alertes sur scans verticaux/horizontaux, firewall externe en mode DROP.

---

## 4.3 Phishing : la porte d'entrée n°1

90% des intrusions commencent par un email piégé.

### Comment ça marche

1. Email "urgent" simulant Microsoft, banque, RH.
2. Lien vers une page imitant le vrai site.
3. L'utilisateur saisit son mot de passe.
4. L'attaquant capture les credentials.
5. Si MFA absent → connexion immédiate.

### 🛡️ Parades

- **MFA obligatoire** (clé FIDO2 > app TOTP > SMS).
- **DMARC strict** sur votre domaine.
- **Filtrage anti-phishing** dans la passerelle email.
- **Formation continue** + simulations régulières.
- **Détection homoglyphes** (`exemp1e.fr` au lieu de `exemple.fr`).

---

## 4.4 Ransomware : le cauchemar moderne

### Schéma typique

```
Phishing → exécution macro → backdoor → escalade locale →
mouvement latéral (Active Directory) → vol données →
chiffrement de masse → demande de rançon
```

⚠️ Délai entre intrusion et chiffrement : passé de **60 jours en 2019 à 5 jours en 2024**.

### 🛡️ Défense en profondeur

| Couche | Mesure |
|--------|--------|
| Email | Filtrage anti-phishing, sandbox |
| Endpoint | EDR (CrowdStrike, SentinelOne, Defender) |
| Réseau | Microsegmentation, détection mouvement latéral |
| Identité | MFA, comptes privilégiés isolés (PAM) |
| Sauvegarde | Immuable + air-gappée + testée |
| Réponse | Playbook + exercices |

### En cas d'incident

1. **Isoler** immédiatement (déconnecter du réseau).
2. **NE PAS** payer la rançon.
3. **Préserver les preuves** (mémoire, disques) pour analyse.
4. **Notifier** ANSSI / CNIL / autorités sectorielles dans les 72h.
5. **Activer** le plan de continuité.
6. **Restaurer** depuis sauvegardes après investigation forensique.

---

## 4.5 Déni de service distribué (DDoS)

### Types

- **Volumétrique** : saturer la bande passante (UDP flood, amplification DNS/NTP).
- **Protocolaire** : épuiser les états (SYN flood).
- **Applicatif** : épuiser le serveur (HTTP slow, attaque L7).

### 🛡️ Parades

- **CDN / Anti-DDoS upstream** : Cloudflare, Akamai, OVH.
- **Rate limiting** au niveau application.
- **Anycast DNS** : répartit la charge mondialement.
- **Plan d'absorption** : capacité réseau dimensionnée pour les pics.

---

## 4.6 Détection : SOC, SIEM, EDR/XDR

### SOC (Security Operations Center)

Équipe humaine + outils qui surveillent 24/7.

### SIEM

Centralise les logs, corrèle les événements, génère des alertes.

→ Outils : Splunk, Microsoft Sentinel, ELK + Wazuh, QRadar.

### EDR/XDR

Surveillance avancée des postes (EDR) ou de l'ensemble (XDR : réseau + cloud + identité).

🛡️ **Sans EDR moderne, vous avez 0 chance** de détecter un ransomware avant exécution.

---

# PARTIE 5 — Pratiques par secteur d'activité

Chaque secteur a ses **risques propres**, sa **réglementation**, ses **cibles privilégiées**.

## 5.1 🏦 Secteur bancaire

### Réglementation

- **DSP2** : authentification forte client, ouverture des API.
- **PCI-DSS** : protection des données carte (12 exigences).
- **ACPR** : autorité de contrôle française.
- **NIS2** : directive UE cybersécurité (2024).
- **DORA** : résilience opérationnelle (2025).

### Architecture type

```
                [ Internet ]
                     |
              [ WAF + Anti-DDoS ]
                     |
              [ Load Balancer ]
                     |
              [ Reverse proxy DMZ ]
                     |
             ===  Firewall L7  ===
              /        |        \
        [App] [API GW] [Admin]
             |          |
       =Firewall=  =Firewall=
             |          |
        [DB Master] [DB Replica]
             |
          [HSM] ← clés cryptographiques
```

### 🛡️ Pratiques essentielles

- **Microsegmentation stricte** : aucun "any-any".
- **Chiffrement bout-en-bout** : TLS partout, même en interne.
- **HSM** (Hardware Security Module) : les clés cryptographiques ne sortent **jamais** du boîtier certifié.
- **Logs immuables** : SIEM avec stockage WORM. Conservation 1 an minimum.
- **Anti-DDoS upstream** obligatoire (millions perdus par minute en cas d'attaque).
- **Pen-test annuel** (exigé PCI-DSS).

### Attaques typiques et parades

| Attaque | Parade |
|---------|--------|
| Phishing → vol credentials | MFA FIDO2 |
| DDoS portail client | Anti-DDoS upstream + WAF |
| Injection SQL sur API | WAF + tests réguliers |
| Compromission interne | Microsegmentation + zero trust |
| Skimming appli mobile | Cert pinning + RASP |

---

## 5.2 🏥 Secteur santé

### Réglementation

- **RGPD** + **HDS** (Hébergement Données de Santé).
- **HIPAA** (USA).
- **PSSI-S** (Politique Sécurité SI Santé).

### Particularités

- Équipements **vieux** (IRM, scanners) avec OS obsolètes (Windows XP/7) **toujours en service**.
- Contrainte **vitale** : un déni de service peut coûter des vies.
- Données ultra-sensibles.

### Architecture recommandée

| VLAN | Usage |
|------|-------|
| 10 | Postes médicaux |
| 20 | Équipements bio (ISOLÉ d'Internet) |
| 30 | Imagerie |
| 40 | Wi-Fi patients (pas d'accès SI !) |
| 50 | IoT médicaux |
| 60 | Administration |

### 🛡️ Pratiques essentielles

- **Isolation matérielle** des équipements vieux : un IRM sous Windows XP ne doit jamais voir Internet ni les postes utilisateurs.
- **Wi-Fi patient strictement séparé** du SI hospitalier.
- **Sauvegardes 3-2-1-1-0** rigoureuses.
- **Plan de continuité** écrit et **testé** : comment opérer en mode dégradé ?

### Attaques connues

- **WannaCry** (2017) : NHS britannique paralysé. → Patcher, isoler les vieux OS.
- **Ransomwares CHU** (Rouen 2019, Corbeil 2022) : reports d'opérations. → Sauvegardes immuables + segmentation.

---

## 5.3 ⚡ Secteur énergie

### Réglementation

- **NIS2** (UE).
- **LPM** (Loi de Programmation Militaire) : opérateurs d'importance vitale (OIV).
- **IEC 62443** : norme cybersécurité industrielle.
- **NERC CIP** (Amérique du Nord).

### IT vs OT

Deux mondes coexistent :
- **IT** : bureautique, SI standard.
- **OT** : SCADA, automates, capteurs (turbines, transformateurs, vannes).

L'OT a des contraintes spécifiques :
- Cycles de vie de **20-30 ans**.
- Pas de patch sans arrêt de production.
- Protocoles industriels (Modbus, DNP3, IEC 61850) souvent **non chiffrés**.

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

🛡️ **Règle d'or** : aucun flux direct niveau 5 → niveau 1. Toujours via DMZ.

### Attaques historiques

- **Stuxnet** (2010) : sabotage nucléaire iranien via USB.
- **BlackEnergy** (Ukraine 2015) : 230 000 foyers sans électricité.
- **Industroyer / CrashOverride** (2016) : framework dédié réseaux électriques.
- **Colonial Pipeline** (USA 2021) : ransomware → arrêt d'un oléoduc majeur.

### 🛡️ Pratiques essentielles

- **Diodes réseau** : composants matériels imposant un flux **unidirectionnel** OT → IT.
- **Inventaire OT** : connaître chaque automate, version, emplacement.
- **Détection passive** (Nozomi, Claroty, Dragos) : ne génèrent **aucun** trafic.
- **Plan de réponse OT** : qui décide d'arrêter une centrale ? Qui appelle l'ANSSI ?

---

## 5.4 🚆 Secteur transport

### Particularités

- Aviation, ferroviaire, maritime, urbain : chacun ses normes.
- Systèmes critiques **temps réel** (signalisation, contrôle aérien).
- Surface d'attaque large : embarqué + sol + Wi-Fi voyageurs.

### Réglementation

- **EASA** (aviation civile).
- **TSI** (ferroviaire).
- **IMO** (maritime).

### Risques typiques

- Compromission Wi-Fi à bord → accès systèmes embarqués (démontré sur Boeing).
- Attaques sur billettique.
- DDoS sur sites de réservation.
- Brouillage GPS / GNSS.

### 🛡️ Pratiques essentielles

- **Séparation embarqué / divertissement** : bus CAN avionique **physiquement isolé** du Wi-Fi passager.
- **Chiffrement sol-train** : protocoles ferroviaires modernes (ETCS) en TLS.
- **Détection spoofing GNSS** : croisement avec inertiel + multi-constellations.

---

## 5.5 🛡️ Secteur assurance

### Réglementation

- **RGPD**.
- **Solvabilité II**.
- **DORA** (UE 2025).

### Risques

- Fuites massives (un dossier = identité + santé + finances).
- Fraude organisée par vol d'identité.
- Ransomware sur bases clients.

### 🛡️ Pratiques essentielles

- **Tokenisation** des données sensibles.
- **DLP** : empêcher l'exfiltration via mail/USB/cloud.
- **Surveillance accès** : qui consulte quoi, quand. Détection comportements anormaux.
- **Tests DORA** : exercices de simulation cyberattaque réguliers.

---

## 5.6 🏛️ Secteur public / collectivités

### Particularités

- Budgets contraints, équipes réduites.
- Cibles fréquentes (mairies, hôpitaux, universités).
- Données citoyens à protéger.

### Réglementation

- **RGPD**.
- **PSSIE** (Politique Sécurité SI État).
- Référentiels ANSSI (PVID, RGS, RGAA).

### 🛡️ Pratiques essentielles

- **Mutualisation** via centres régionaux/métropolitains.
- **Sauvegarde immuable obligatoire** : majorité des collectivités attaquées par ransomware n'avaient pas de sauvegarde restaurable.
- **Formation des agents** : 80% des intrusions commencent par phishing.
- **Cyber-assurance + plan de réponse** : avoir un partenaire CSIRT **avant** l'incident.

---

## 5.7 🛒 Secteur e-commerce / retail

### Risques

- Skimming (vol carte bancaire à la commande).
- Credential stuffing (réutilisation mots de passe volés ailleurs).
- Fraude au remboursement.
- Vol catalogue / scraping.

### 🛡️ Pratiques

- **WAF** + **bot management**.
- **Tokenisation** moyens de paiement (Stripe, externalisation).
- **MFA** sur comptes vendeur.
- **PCI-DSS scope reduction** : ne jamais stocker de PAN si évitable.

---

# PARTIE 6 — Supervision et métrologie

## 6.1 Pourquoi superviser ?

> "Ce qui n'est pas mesuré ne peut pas être amélioré." — Peter Drucker

🛡️ **Sans supervision, vous découvrez les pannes via les utilisateurs**. Avec, vous les détectez (et anticipez).

---

## 6.2 Les protocoles de supervision

### SNMP

Standard historique. Permet d'interroger un équipement sur :
- Charge CPU, RAM.
- Octets passés sur chaque interface.
- État des ports (up/down).
- Température, alimentation, ventilateurs.

```bash
snmpwalk -v2c -c public 192.168.1.10 IF-MIB::ifInOctets
```

🛡️ **Toujours utiliser SNMPv3 en production** (chiffré + authentifié). v1/v2c = mots de passe en clair.

### Syslog

Centralisation des logs.

```
<134>Oct 26 10:23:45 firewall1 kernel: ALERT: blocked SYN flood from 1.2.3.4
```

Format unifié, parsable. Tous les équipements sérieux savent envoyer en Syslog.

### NetFlow / sFlow / IPFIX

Plutôt que regarder chaque paquet, on **résume** les flux : source, destination, ports, octets, durée.

→ Répond à : "qui a consommé toute la bande passante ce matin ?"

### Telemetry streaming (gNMI, gRPC)

Successeur moderne de SNMP. Push de métriques par l'équipement, en temps réel, en JSON ou Protobuf.

---

## 6.3 La stack moderne 2026

```
[ Équipements ]
   |
   |--- SNMP ---> [ Telegraf ]   → collecte
   |--- Syslog -> [ rsyslog ]
   |
   v
[ InfluxDB / Prometheus ]        → métriques
[ Loki / Elasticsearch ]         → logs
   |
   v
[ Grafana ]                      → visualisation
   |
   v
[ Alertmanager ]                 → alertes
```

### Solutions complètes

| Outil | Type | Avantage |
|-------|------|----------|
| Zabbix | Tout-en-un | Open source mature |
| LibreNMS | Réseau focus | Configuration zéro |
| Nagios / Centreon | Historique | Très répandu |
| PRTG | Commercial | Excellent UX |
| Datadog | SaaS | Puissant, cher |

---

## 6.4 Les métriques qui comptent

### Sur switch / routeur

- Disponibilité (ping, SNMP up).
- Utilisation des liens (% bande passante).
- Erreurs CRC, drops, discards.
- CPU et mémoire.
- Température.

### Sur firewall

- Sessions actives / max.
- Conntrack utilisé.
- Throughput.
- Règles déclenchées.
- Tentatives bloquées (carte géo = parlant).

### Sur service applicatif

Les **4 golden signals** Google SRE :
1. **Latency** : délai de réponse.
2. **Traffic** : volume de demandes.
3. **Errors** : taux d'erreur.
4. **Saturation** : utilisation des ressources.

---

## 6.5 Mesurer la disponibilité

### Calcul du SLA

| SLA | Indispo annuelle | Indispo mensuelle |
|-----|------------------|-------------------|
| 99% | 3,65 jours | 7,3 heures |
| 99,9% ("3 neufs") | 8,76 heures | 43,8 minutes |
| 99,99% ("4 neufs") | 52,6 minutes | 4,38 minutes |
| 99,999% ("5 neufs") | 5,26 minutes | 26,3 secondes |

⚠️ Plus de neufs = plus cher (exponentiellement). Un SLA 99,999% sur un site interne est souvent inutile et coûteux.

---

## 6.6 Tester les performances

### Iperf3 : la référence débit

```bash
# Sur le serveur
iperf3 -s

# Sur le client
iperf3 -c 192.168.1.10 -t 30
```

### Latence et gigue

```bash
mtr -c 100 -r cible.exemple.fr
```

🏥 **VoIP** : exige < 150 ms de latence, < 30 ms de jitter, < 1% de perte. Au-delà, l'appel devient inutilisable.

---

# PARTIE 7 — Scénarios d'incidents

10 scénarios réalistes que **tout admin réseau rencontrera**. Chaque scénario : symptôme, cause, signaux, prévention.

---

## Scénario 1 — DNS split-horizon

**Symptôme** : "Le site `intranet.exemple.fr` marche au bureau mais pas en télétravail."

**Cause** : DNS interne et externe répondent différemment. L'enregistrement externe est manquant.

**Signaux** :
```bash
# Bureau : OK
dig intranet.exemple.fr → 10.0.0.5

# Extérieur : NXDOMAIN
```

**🛡️ Prévention** : documenter la stratégie split-horizon, créer une vue externe (même pointant vers VPN), logs DNS centralisés.

---

## Scénario 2 — Route asymétrique

**Symptôme** : "Le ping passe mais les sessions TCP se coupent."

**Cause** : aller par firewall A, retour par firewall B → B n'a pas vu l'établissement → coupe.

**Signaux** : tcpdump montre SYN/SYN-ACK mais pas le ACK final. Logs firewall : "out-of-state packet dropped".

**🛡️ Prévention** : architecture symétrique, NetFlow pour visualiser les chemins, désactiver stateful sur flux asymétriques (avec précaution).

---

## Scénario 3 — MTU trop basse

**Symptôme** : "Gmail s'ouvre, mais télécharger une pièce jointe freeze à 80%. TLS handshake bloque."

**Cause** : VPN réduit MTU à 1400, mais ICMP "Fragmentation Needed" est filtré → PMTUD échoue.

**Signaux** :
```bash
ping -M do -s 1472 cible    # Échoue
ping -M do -s 1372 cible    # Passe
```

**🛡️ Prévention** : MSS clamping sur tous les routeurs/firewalls de tunneling, **ne jamais** bloquer ICMP type 3 code 4.

---

## Scénario 4 — Firewall stateful mal configuré

**Symptôme** : "Le serveur web reçoit les requêtes mais ne peut pas répondre."

**Cause** : règle "ALLOW IN tcp/443" sans règle correspondante OUT.

**Signaux** : tcpdump côté serveur montre les requêtes, pas les réponses sortantes. Compteurs firewall : drops sur OUTPUT.

**🛡️ Prévention** : firewalls stateful modernes, règle "ESTABLISHED, RELATED → ACCEPT" en première position.

---

## Scénario 5 — NAT/conntrack saturé

**Symptôme** : "Aux heures de pointe, certaines connexions échouent aléatoirement."

**Cause** : table conntrack pleine (par défaut 65536 entrées Linux).

**Signaux** :
```bash
cat /proc/sys/net/netfilter/nf_conntrack_count
dmesg | grep "table full"
```

**🛡️ Prévention** : augmenter `nf_conntrack_max`, réduire timeouts, monitoring + alerte à 80%.

---

## Scénario 6 — ARP spoofing / IP dupliquée

**Symptôme** : "Connectivité intermittente d'un poste."

**Cause** : deux machines avec la même IP, ou ARP spoofing.

**Signaux** :
```bash
arp-scan --localnet              # Voir les MAC en double
# Logs switch : "Duplicate IP address detected"
```

**🛡️ Prévention** : DHCP avec réservations, DHCP snooping, Dynamic ARP Inspection.

---

## Scénario 7 — Boucle STP

**Symptôme** : "Tout le réseau est tombé d'un coup. Plus rien ne ping."

**Cause** : câble entre deux switches sans STP correctement configuré → broadcast storm.

**Signaux** : trafic broadcast à 100% sur trunks, CPU switches à 100%.

**🛡️ Prévention** : STP/RSTP partout, **BPDU Guard** sur ports d'accès, Root Guard sur ports vers distribution.

---

## Scénario 8 — Certificat expiré ou chaîne incomplète

**Symptôme** : "Le navigateur affiche un cadenas rouge. `curl -k` marche, sans `-k` non."

**Cause** : certificat expiré OU chaîne intermédiaire non envoyée par le serveur.

**Signaux** :
```bash
echo | openssl s_client -connect www.exemple.fr:443 2>/dev/null | \
  openssl x509 -noout -dates
```

**🛡️ Prévention** : renouvellement automatique (Let's Encrypt + cron), monitoring expiration, alerte 30 jours avant.

---

## Scénario 9 — DNS TTL trop long

**Symptôme** : "On a migré vendredi, 30% des utilisateurs voient toujours l'ancien serveur lundi."

**Cause** : TTL de 86400 (24h) → caches DNS conservent l'ancienne adresse.

**🛡️ Prévention** : 24h avant migration, baisser TTL à 60s. Remonter à 3600 après stabilisation.

---

## Scénario 10 — Pod K8s : egress bloqué

**Symptôme** : "Les pods se parlent entre eux, mais ne peuvent pas appeler une API externe."

**Cause** : NetworkPolicy "default deny" sans règle d'egress vers Internet.

**Signaux** : connectivité interne OK, DNS échoue depuis le pod.

**🛡️ Prévention** : tester systématiquement les NetworkPolicy en deny-then-allow, documenter les flux egress requis.

---

# Glossaire

**ACL** (Access Control List) : liste de règles de filtrage.

**ARP** (Address Resolution Protocol) : associe IP et MAC sur un LAN.

**AS** (Autonomous System) : ensemble de réseaux IP gérés par une seule entité.

**BGP** (Border Gateway Protocol) : protocole de routage entre AS (Internet).

**BPDU** (Bridge Protocol Data Unit) : trame STP.

**CIDR** (Classless Inter-Domain Routing) : notation /N pour les masques.

**CDN** (Content Delivery Network) : réseau de cache géo-distribué.

**CSIRT** (Computer Security Incident Response Team) : équipe de réponse à incident.

**DDoS** (Distributed Denial of Service) : déni de service distribué.

**DHCP** (Dynamic Host Configuration Protocol) : attribution automatique d'IP.

**DMZ** (DeMilitarized Zone) : zone tampon entre LAN et Internet.

**DNS** (Domain Name System) : annuaire des noms.

**EDR** (Endpoint Detection and Response) : surveillance avancée des postes.

**FAI** : Fournisseur d'Accès Internet.

**HSM** (Hardware Security Module) : boîtier de stockage de clés cryptographiques.

**ICMP** (Internet Control Message Protocol) : signalisation IP.

**IDS / IPS** : Intrusion Detection / Prevention System.

**IPSec** : suite de protocoles de chiffrement IP.

**LACP** (Link Aggregation Control Protocol) : agrégation de liens.

**MAC** (Media Access Control) : adresse physique d'une carte réseau.

**MFA** (Multi-Factor Authentication) : authentification multi-facteurs.

**MITM** (Man-In-The-Middle) : attaque par interception.

**MPLS** (Multi-Protocol Label Switching) : commutation par étiquette.

**MSS** (Maximum Segment Size) : taille max de payload TCP.

**MTU** (Maximum Transmission Unit) : taille max d'un paquet.

**NAC** (Network Access Control) : contrôle d'accès au réseau.

**NAT** (Network Address Translation).

**NGFW** (Next-Generation Firewall) : pare-feu nouvelle génération.

**OSI** : modèle en 7 couches (référence).

**OSPF** (Open Shortest Path First) : protocole de routage interne.

**OT** (Operational Technology) : SI industriels.

**PAM** (Privileged Access Management) : gestion comptes privilégiés.

**PoE** (Power over Ethernet) : alimentation via câble réseau.

**QoS** (Quality of Service) : politique de priorisation.

**SASE** (Secure Access Service Edge) : convergence réseau + sécurité cloud.

**SCADA** (Supervisory Control And Data Acquisition) : supervision industrielle.

**SD-WAN** (Software-Defined WAN).

**SDN** (Software-Defined Network).

**SIEM** (Security Information and Event Management).

**SLA** (Service Level Agreement) : engagement de niveau de service.

**SNI** (Server Name Indication) : extension TLS.

**SNMP** (Simple Network Management Protocol).

**SOC** (Security Operations Center).

**SPF / DKIM / DMARC** : trinité anti-usurpation email.

**STP** (Spanning Tree Protocol) : prévention boucles L2.

**TCP** (Transmission Control Protocol) : transport fiable.

**TLS** (Transport Layer Security) : chiffrement de bout en bout.

**UDP** (User Datagram Protocol) : transport non fiable rapide.

**VLAN** (Virtual LAN).

**VPN** (Virtual Private Network).

**VRRP** (Virtual Router Redundancy Protocol).

**WAF** (Web Application Firewall).

**WAN** (Wide Area Network).

**XDR** (Extended Detection and Response).

**ZTNA** (Zero Trust Network Access).

---

## ✍️ Mot de la fin

> Un bon administrateur réseau n'est pas celui qui connaît tous les protocoles par cœur.
> C'est celui qui sait **où chercher** quand ça casse, **documente** quand ça marche,
> et **anticipe** ce qui va casser demain.

La maîtrise vient avec la **pratique**. Montez votre homelab, cassez-le, réparez-le.
C'est la seule voie.

Et **gardez vos sauvegardes immuables** ! 🛡️




