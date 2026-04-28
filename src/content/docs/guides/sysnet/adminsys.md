---
title: "🐧 Linux Administration Système"
description: "Guide Linux Administration Système et Sécurité"
created: "2026-04-26"
# updated: "2026-04-14"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"

---


> **Documentation pédagogique complète** : du débutant absolu à l'administrateur confirmé, avec analogies, bonnes pratiques sectorielles (banque, santé, énergie, transport, assurance) et toutes les commandes de diagnostic indispensables.

---

## 📚 Table des matières

1. [Introduction : Comprendre Linux](#1-introduction--comprendre-linux)
2. [Premiers pas : se connecter et explorer](#2-premiers-pas--se-connecter-et-explorer)
3. [L'arborescence Linux](#3-larborescence-linux)
4. [Manipuler fichiers et dossiers](#4-manipuler-fichiers-et-dossiers)
5. [Utilisateurs, groupes et permissions](#5-utilisateurs-groupes-et-permissions)
6. [Processus et services](#6-processus-et-services)
7. [Le shell Bash : automatiser votre travail](#7-le-shell-bash--automatiser-votre-travail)
8. [Gestion des paquets logiciels](#8-gestion-des-paquets-logiciels)
9. [Réseau Linux](#9-réseau-linux)
10. [Stockage, disques et systèmes de fichiers](#10-stockage-disques-et-systèmes-de-fichiers)
11. [Démarrage du système et systemd](#11-démarrage-du-système-et-systemd)
12. [Logs et journalisation](#12-logs-et-journalisation)
13. [Sauvegardes et restauration](#13-sauvegardes-et-restauration)
14. [SSH : administration à distance sécurisée](#14-ssh--administration-à-distance-sécurisée)
15. [Sécurité Linux : durcissement complet](#15-sécurité-linux--durcissement-complet)
16. [Pare-feu : iptables, nftables, firewalld, UFW](#16-pare-feu--iptables-nftables-firewalld-ufw)
17. [SELinux et AppArmor : MAC](#17-selinux-et-apparmor--mac)
18. [Détection d'intrusion et surveillance](#18-détection-dintrusion-et-surveillance)
19. [Gestion des secrets et chiffrement](#19-gestion-des-secrets-et-chiffrement)
20. [Toutes les commandes de diagnostic](#20-toutes-les-commandes-de-diagnostic)
21. [Bonnes pratiques par secteur](#21-bonnes-pratiques-par-secteur)
22. [Réponse à incident : que faire en cas d'attaque ?](#22-réponse-à-incident--que-faire-en-cas-dattaque-)
23. [Conformité et réglementation](#23-conformité-et-réglementation)
24. [Annexes et ressources](#24-annexes-et-ressources)

---

## 1. Introduction : Comprendre Linux

### 1.1 Qu'est-ce que Linux ?

**Analogie 🏠** : imaginez un système d'exploitation comme l'organisation d'un immeuble.
- **Le noyau (kernel)** = le concierge qui gère les ressources (eau, électricité, accès aux étages).
- **Les utilisateurs** = les résidents.
- **Les processus** = les activités qui se déroulent dans chaque appartement.
- **Le shell** = l'interphone par lequel vous donnez des instructions au concierge.

Linux est un **système d'exploitation libre et open source** créé en 1991 par Linus Torvalds, basé sur les principes UNIX. Il fait tourner aujourd'hui :
- **96% des serveurs web** publics
- **100% des superordinateurs** du Top500
- La majorité des **infrastructures cloud** (AWS, GCP, Azure)
- Tous les **smartphones Android** (basés sur le noyau Linux)

### 1.2 Pourquoi les entreprises choisissent Linux ?

| Avantage | Explication concrète |
|----------|---------------------|
| **Stabilité** | Un serveur Linux peut tourner des années sans redémarrage. |
| **Sécurité** | Modèle de permissions strict, isolation forte des processus. |
| **Coût** | Pas de licence à payer pour le noyau et la plupart des distributions. |
| **Personnalisation** | Tout est modifiable, des composants au noyau lui-même. |
| **Écosystème** | Énorme catalogue de logiciels libres. |
| **Automatisation** | Scriptable de bout en bout (DevOps, IaC). |

### 1.3 Les distributions : choisir sa famille

Une **distribution** = un noyau Linux + des outils + un gestionnaire de paquets + une politique de mises à jour.

**Analogie 🍕** : Linux est la pâte à pizza. Les distributions sont les pizzas finales — même base, garnitures différentes.

#### Les grandes familles

**Famille Debian** (apt, .deb)
- **Debian** : la référence stabilité. Idéal pour serveurs critiques (banque, santé).
- **Ubuntu** : convivial, fortes communautés, support commercial via Canonical.
- **Linux Mint** : pour postes utilisateurs.

**Famille Red Hat** (dnf/yum, .rpm)
- **RHEL (Red Hat Enterprise Linux)** : distribution payante avec support 24/7. Standard dans les grandes entreprises.
- **Rocky Linux / AlmaLinux** : équivalents gratuits de RHEL (depuis l'arrêt de CentOS 8).
- **Fedora** : laboratoire d'innovation Red Hat.

**Famille SUSE** (zypper, .rpm)
- **SUSE Linux Enterprise Server (SLES)** : très présente en Allemagne, dans l'industrie.
- **openSUSE** : version communautaire.

**Famille indépendante**
- **Arch Linux** : pour utilisateurs avancés, rolling release.
- **Alpine Linux** : ultra légère (5 Mo), reine des conteneurs.
- **NixOS** : configuration déclarative, immuable, idéale pour DevSecOps.

#### Choisir selon son secteur

| Secteur | Distribution recommandée | Pourquoi |
|---------|-------------------------|----------|
| **Banque / Assurance** | RHEL, SLES | Support 24/7, conformité PCI-DSS, certifications |
| **Santé** | RHEL, Debian stable | Conformité HDS, traçabilité, stabilité longue |
| **Transport / Énergie (OT/SCADA)** | Debian stable, RHEL | Maintenance longue durée, pas de surprise |
| **Cloud / DevOps** | Ubuntu LTS, Alpine | Écosystème, conteneurs |
| **Recherche / IA** | Ubuntu, Fedora | Drivers récents, frameworks ML |
| **Postes admin** | Ubuntu, Fedora, Debian | Outillage DevOps |

---

## 2. Premiers pas : se connecter et explorer

### 2.1 Console, terminal, shell : démêlons le vocabulaire

**Analogie ☎️** :
- **La console** = un téléphone fixe physique (clavier-écran branché au serveur).
- **Le terminal** = un téléphone portable (émulateur logiciel : GNOME Terminal, iTerm2, Windows Terminal).
- **Le shell** = la langue dans laquelle vous parlez (Bash, Zsh, Fish).

### 2.2 Se connecter en local

À l'écran de connexion, vous fournissez :
- **login** (nom d'utilisateur)
- **mot de passe** (caché à la frappe — c'est normal)

L'**invite shell** (ou *prompt*) ressemble à :
```bash
alice@serveur-prod-01:~$
```
- `alice` = utilisateur connecté
- `serveur-prod-01` = nom de la machine
- `~` = répertoire courant (`~` = home de l'utilisateur)
- `$` = utilisateur normal (`#` = root, le super-utilisateur)

### 2.3 Anatomie d'une commande

```bash
commande [options] [arguments]
```

Exemple :
```bash
ls -la /etc
```
- `ls` : la commande (lister)
- `-la` : options (`-l` format long, `-a` afficher les fichiers cachés)
- `/etc` : argument (le dossier à lister)

### 2.4 Premières commandes essentielles

```bash
whoami          # Qui suis-je ? (mon login)
hostname        # Nom de la machine
date            # Date et heure courantes
uptime          # Depuis combien de temps la machine tourne ?
uname -a        # Infos noyau et architecture
cal             # Calendrier du mois
clear           # Effacer l'écran (ou Ctrl+L)
echo "Hello"    # Afficher un texte
history         # Historique des commandes tapées
exit            # Se déconnecter
```

### 2.5 Obtenir de l'aide

**3 sources principales** :

```bash
man ls          # Manuel complet (q pour quitter, / pour chercher)
ls --help       # Aide rapide intégrée
info ls         # Documentation hypertexte
apropos réseau  # Chercher une commande par mot-clé
```

💡 **Astuce pro** : `man -k <mot>` ≡ `apropos <mot>`. Et `tldr <commande>` (à installer) donne des exemples concrets en 30 secondes.

### 2.6 Raccourcis clavier indispensables

| Raccourci | Action |
|-----------|--------|
| `Tab` | Auto-complétion (commande, fichier) |
| `Ctrl+C` | Annuler la commande en cours |
| `Ctrl+D` | Fermer le terminal / EOF |
| `Ctrl+L` | Effacer l'écran |
| `Ctrl+R` | Recherche dans l'historique |
| `Ctrl+A` / `Ctrl+E` | Début / fin de ligne |
| `Ctrl+U` / `Ctrl+K` | Effacer avant / après le curseur |
| `Ctrl+Z` | Suspendre le processus (puis `bg` ou `fg`) |
| `↑` / `↓` | Naviguer dans l'historique |

---

## 3. L'arborescence Linux

**Analogie 🗄️** : sous Windows, vous avez plusieurs lecteurs (C:, D:). Sous Linux, **tout est dans un seul arbre**, partant de la racine `/`. Comme une grande bibliothèque où chaque rayon a un rôle précis.

### 3.1 Le standard FHS (Filesystem Hierarchy Standard)

```
/                  ← La racine, point de départ
├── bin → usr/bin  ← Commandes utilisateur essentielles (ls, cp, cat)
├── boot           ← Noyau, initramfs, GRUB (au démarrage)
├── dev            ← Fichiers spéciaux : disques, terminaux, etc.
├── etc            ← FICHIERS DE CONFIGURATION (le QG de l'admin)
├── home           ← Dossiers personnels (/home/alice)
├── lib → usr/lib  ← Bibliothèques partagées (.so)
├── media          ← Points de montage amovibles (USB, CD)
├── mnt            ← Points de montage temporaires
├── opt            ← Logiciels tiers installés à la main
├── proc           ← Système virtuel : infos sur le noyau et processus
├── root           ← Home du super-utilisateur root
├── run            ← Données runtime (PID, sockets, vidé au reboot)
├── sbin → usr/sbin ← Commandes admin (fdisk, iptables)
├── srv            ← Données servies (rare aujourd'hui)
├── sys            ← Système virtuel : interface kernel/devices
├── tmp            ← Fichiers temporaires (vidé régulièrement)
├── usr            ← Logiciels installés (programmes, docs)
└── var            ← Données variables : logs, mails, bases, caches
    ├── log        ← Journaux système (à scruter en cas d'incident)
    └── lib        ← États des services (DB, etc.)
```

### 3.2 Les répertoires que vous toucherez le plus

| Répertoire | Quand y aller ? | Exemples |
|------------|-----------------|----------|
| `/etc` | Configurer un service | `/etc/ssh/sshd_config`, `/etc/nginx/` |
| `/var/log` | Diagnostiquer un problème | `/var/log/auth.log`, `/var/log/syslog` |
| `/home` | Travailler avec ses fichiers | `/home/alice/projets/` |
| `/tmp` | Stockage rapide jetable | Téléchargements ponctuels |
| `/opt` | Installer un logiciel tiers | `/opt/oracle`, `/opt/gitlab` |
| `/proc` | Inspecter le système live | `/proc/cpuinfo`, `/proc/meminfo` |

### 3.3 Naviguer dans l'arborescence

```bash
pwd            # Print Working Directory : où suis-je ?
cd /etc        # Aller dans /etc
cd ..          # Remonter d'un niveau
cd ~           # Retour à mon home
cd -           # Retour au dernier dossier
ls             # Lister
ls -l          # Format long (permissions, taille, date)
ls -lh         # Tailles humaines (K, M, G)
ls -la         # Tous les fichiers (cachés inclus)
ls -lt         # Trier par date (le plus récent en premier)
ls -lS         # Trier par taille
tree -L 2      # Affichage arborescent (à installer)
```

### 3.4 Chemins absolus vs relatifs

- **Absolu** : commence par `/` → `/var/log/syslog` (toujours valide).
- **Relatif** : par rapport au dossier courant → `../config/file.txt`.

💡 **Règle d'or admin** : dans les **scripts** et fichiers de configuration, utilisez **toujours des chemins absolus** pour éviter les ambiguïtés.

---

## 4. Manipuler fichiers et dossiers

### 4.1 Créer, copier, déplacer, supprimer

```bash
# Créer
touch fichier.txt              # Crée un fichier vide ou met à jour la date
mkdir dossier                  # Crée un dossier
mkdir -p a/b/c/d               # Crée toute l'arborescence
echo "contenu" > fichier.txt   # Écrire dans un fichier (écrase)
echo "ajout" >> fichier.txt    # Ajouter à la fin

# Copier
cp source.txt dest.txt         # Copie un fichier
cp -r dossier1 dossier2        # Copie récursive (dossiers)
cp -p src dst                  # Préserve les permissions / dates
cp -a src dst                  # Archive (préserve tout, idéal pour backup)

# Déplacer / renommer (même commande)
mv ancien.txt nouveau.txt      # Renommer
mv fichier.txt /tmp/           # Déplacer

# Supprimer (⚠️ pas de corbeille !)
rm fichier.txt                 # Supprimer un fichier
rm -r dossier                  # Récursif (dossier et contenu)
rm -i fichier                  # Demande confirmation
rm -f fichier                  # Force (pas de confirmation, attention)

# ⚠️ NE JAMAIS faire :
# rm -rf /              # Détruit tout le système
# rm -rf $variable/*    # Si la variable est vide → catastrophe
```

🚨 **Avertissement bancaire/santé** : sur des serveurs de production, utilisez systématiquement `rm -i` ou créez une fonction shell qui déplace vers une "corbeille" avant suppression définitive.

### 4.2 Voir le contenu d'un fichier

```bash
cat fichier.txt           # Affiche tout (petits fichiers)
less fichier.txt          # Pagination (q pour quitter, / pour chercher)
more fichier.txt          # Pagination basique
head fichier.txt          # 10 premières lignes
head -n 50 fichier.txt    # 50 premières lignes
tail fichier.txt          # 10 dernières lignes
tail -n 100 fichier.txt   # 100 dernières lignes
tail -f /var/log/syslog   # Suivre en temps réel ⭐ (essentiel pour logs)
wc -l fichier.txt         # Compter les lignes
file fichier              # Quel type de fichier ?
stat fichier              # Métadonnées détaillées
hexdump -C fichier        # Vue hexadécimale (binaires)
strings binaire           # Extraire les chaînes lisibles
```

### 4.3 Recherche : `find`, `grep`, `locate`

#### `find` — chercher des fichiers

**Analogie 🔎** : `find` est un détective qui fouille tout l'arbre.

```bash
# Par nom
find /etc -name "*.conf"
find / -iname "config*" 2>/dev/null    # iname = insensible casse, 2>/dev/null masque les erreurs

# Par type
find /var -type f          # Fichiers seulement
find /var -type d          # Dossiers seulement
find / -type l             # Liens symboliques

# Par taille
find / -size +100M         # Plus de 100 Mo
find / -size -1k           # Moins de 1 ko

# Par date
find /var/log -mtime -1    # Modifiés il y a moins d'un jour
find /tmp -atime +30       # Non accédés depuis 30 jours

# Par permission / propriétaire
find / -perm -4000         # Fichiers SUID (audit sécurité ⭐)
find /home -user alice
find / -nouser             # Fichiers sans propriétaire (suspects)

# Actions sur les résultats
find /tmp -name "*.log" -delete
find / -name "*.bak" -exec rm {} \;
find / -name "*.sh" -exec chmod 750 {} \;
```

#### `grep` — chercher dans le contenu

```bash
grep "erreur" /var/log/syslog            # Chercher "erreur"
grep -i "error" log.txt                  # Insensible à la casse
grep -r "TODO" /home/projets/            # Récursif
grep -n "fail" auth.log                  # Numéros de ligne
grep -v "info" log.txt                   # Lignes SANS "info"
grep -E "erreur|warning" log.txt         # Regex étendue
grep -c "404" access.log                 # Compter les occurrences
grep -A 3 -B 3 "panic" syslog            # 3 lignes avant/après
```

#### `locate` — base de données rapide

```bash
sudo updatedb               # Mettre à jour la base
locate sshd_config          # Recherche éclair
```

### 4.4 Compresser et archiver

```bash
# tar : archiver (sans compression)
tar -cf archive.tar dossier/         # Créer
tar -xf archive.tar                  # Extraire
tar -tf archive.tar                  # Lister contenu

# tar + gzip
tar -czvf backup.tar.gz dossier/     # Créer compressé
tar -xzvf backup.tar.gz              # Extraire

# tar + bzip2 (meilleur taux mais plus lent)
tar -cjvf backup.tar.bz2 dossier/

# tar + xz (le meilleur taux)
tar -cJvf backup.tar.xz dossier/

# zip / unzip
zip -r archive.zip dossier/
unzip archive.zip

# gzip / gunzip (un fichier seul)
gzip fichier.log         # → fichier.log.gz
gunzip fichier.log.gz
zcat fichier.log.gz      # Voir sans décompresser
```

### 4.5 Liens symboliques et physiques

**Analogie 🔗** :
- **Lien physique (hard link)** = un nom alternatif pour le même livre. Si l'original disparaît, l'autre reste.
- **Lien symbolique (symlink)** = un panneau "voir tel rayon". Si la cible disparaît, le panneau pointe dans le vide.

```bash
ln fichier liendur          # Lien physique
ln -s /etc/nginx/nginx.conf monlien    # Lien symbolique
ls -l                       # Voir les liens (l → cible)
```

---

## 5. Utilisateurs, groupes et permissions

### 5.1 Modèle multi-utilisateur

Linux est **multi-utilisateurs depuis sa naissance**. Chaque utilisateur :
- A un **UID** (numérique, ex : 1000)
- Appartient à un **GID** principal et à des groupes secondaires
- Possède un **home** (`/home/alice`)
- A un **shell** par défaut (`/bin/bash`)

**Comptes spéciaux** :
- `root` (UID 0) : super-utilisateur, pouvoir total. **À éviter au quotidien**.
- Comptes système (UID < 1000) : `daemon`, `mail`, `nginx`... pour faire tourner les services.
- Utilisateurs humains (UID ≥ 1000).

### 5.2 Fichiers clés

| Fichier | Contenu |
|---------|---------|
| `/etc/passwd` | Liste des comptes (lisible par tous) |
| `/etc/shadow` | Mots de passe hachés (root only) |
| `/etc/group` | Groupes et membres |
| `/etc/sudoers` | Règles `sudo` (à éditer avec `visudo`) |

Format de `/etc/passwd` :
```
alice:x:1000:1000:Alice Dupont:/home/alice:/bin/bash
└──┬─┘ ┬ └─┬┘ └─┬┘ └────┬────┘ └────┬───┘ └───┬───┘
  login │  UID  GID    GECOS      home      shell
        │
        x → mot de passe dans /etc/shadow
```

### 5.3 Gérer les utilisateurs et groupes

```bash
# Création
sudo useradd -m -s /bin/bash alice              # -m = créer le home
sudo adduser alice                              # Interactif (Debian/Ubuntu)
sudo passwd alice                               # Définir mot de passe

# Modification
sudo usermod -aG sudo alice                     # Ajouter au groupe sudo
sudo usermod -L alice                           # Verrouiller le compte
sudo usermod -U alice                           # Déverrouiller
sudo chsh -s /bin/zsh alice                     # Changer de shell
sudo chage -l alice                             # Politique d'expiration
sudo chage -E 2026-12-31 alice                  # Expiration du compte

# Suppression
sudo userdel alice                              # Supprime le compte
sudo userdel -r alice                           # ... et son home

# Groupes
sudo groupadd developpeurs
sudo gpasswd -a alice developpeurs              # Ajouter alice au groupe
sudo gpasswd -d alice developpeurs              # Retirer

# Inspection
id alice                # UID, GID, groupes
groups alice            # Groupes
who                     # Qui est connecté ?
w                       # Qui fait quoi ?
last                    # Derniers logins
lastb                   # Échecs de connexion (audit sécurité ⭐)
finger alice            # Infos détaillées (à installer)
```

### 5.4 Le modèle de permissions Unix

**Analogie 🏠** : chaque fichier est une maison avec 3 sortes de personnes qui peuvent y entrer :
- **u (user)** : le propriétaire
- **g (group)** : les membres du groupe
- **o (other)** : tous les autres

Et 3 actions possibles :
- **r (read)** : lire (4)
- **w (write)** : écrire (2)
- **x (execute)** : exécuter (1)

```bash
ls -l fichier.txt
-rw-r--r-- 1 alice users 1234 Apr 26 10:00 fichier.txt
│└┬┘└┬┘└┬┘
│ u  g  o
│
type : - fichier, d dossier, l lien, b bloc, c char, s socket, p pipe
```

#### Notation octale

| Permission | Octal |
|------------|-------|
| `---` | 0 |
| `--x` | 1 |
| `-w-` | 2 |
| `-wx` | 3 |
| `r--` | 4 |
| `r-x` | 5 |
| `rw-` | 6 |
| `rwx` | 7 |

Exemples :
- `chmod 755 script.sh` → `rwxr-xr-x` (exécutable par tous, modifiable par moi)
- `chmod 644 fichier.txt` → `rw-r--r--` (par défaut)
- `chmod 600 secret.key` → `rw-------` (privé, pour clés SSH par exemple)
- `chmod 700 dossier_perso` → `rwx------`

```bash
chmod u+x script.sh        # Ajouter +x au propriétaire
chmod g-w fichier          # Retirer w au groupe
chmod o= fichier           # Retirer toutes permissions aux autres
chmod -R 750 /opt/app      # Récursif
chown alice:dev fichier    # Changer propriétaire et groupe
chown -R www-data:www-data /var/www
chgrp dev fichier          # Changer le groupe seulement
```

### 5.5 Permissions spéciales : SUID, SGID, Sticky bit

**SUID (Set User ID)** : le programme s'exécute avec les droits du propriétaire (souvent root). Exemple : `passwd` (pour modifier `/etc/shadow`).
```bash
ls -l /usr/bin/passwd
-rwsr-xr-x  # le 's' à la place du x → SUID actif
chmod u+s fichier         # Activer SUID
chmod 4755 fichier        # En octal (4 = SUID)
```

**SGID (Set Group ID)** : pareil mais pour le groupe. Sur un dossier → les fichiers créés héritent du groupe du dossier.
```bash
chmod g+s dossier
chmod 2755 dossier
```

**Sticky bit** : sur un dossier partagé (`/tmp`), seul le propriétaire d'un fichier peut le supprimer.
```bash
chmod +t /tmp
chmod 1777 /tmp           # 1 = sticky
```

🚨 **Audit sécurité critique** : les fichiers SUID sont une cible d'attaque privilégiée (escalade de privilèges).
```bash
sudo find / -perm -4000 -type f 2>/dev/null    # Lister tous les SUID
sudo find / -perm -2000 -type f 2>/dev/null    # Lister tous les SGID
```

### 5.6 ACL : permissions fines

Le modèle `ugo/rwx` est limité (un seul groupe). Les **ACL** permettent des règles par utilisateur/groupe.

```bash
getfacl fichier                                  # Voir les ACL
setfacl -m u:bob:r-- fichier.txt                 # Bob a le droit de lecture
setfacl -m g:audit:rw- fichier.txt
setfacl -x u:bob fichier.txt                     # Retirer
setfacl -m d:u:alice:rwx /partage                # ACL par défaut (dossier)
setfacl -b fichier.txt                           # Effacer toutes ACL
```

🏥 **Cas santé** : un dossier patient doit être lisible par le médecin traitant ET les infirmières du service, sans que le concierge informatique y accède. Les ACL sont parfaites pour ça.

### 5.7 sudo : élever les privilèges proprement

`sudo` permet à un utilisateur d'exécuter ponctuellement une commande en tant que root (ou autre).

```bash
sudo apt update                # Une commande root
sudo -i                        # Shell root interactif
sudo -u www-data ls /var/www   # Comme un autre utilisateur
sudo -l                        # Voir mes droits sudo
```

#### Configurer sudo

⚠️ **Ne jamais éditer `/etc/sudoers` à la main** — utilisez `sudo visudo` (vérifie la syntaxe).

```sudoers
# /etc/sudoers.d/admins (préférer un fichier dédié)
%admins         ALL=(ALL:ALL) ALL
alice           ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx
%dev            ALL=(www-data) /usr/bin/git pull
```

✅ **Bonnes pratiques sudo** :
- Limiter aux commandes nécessaires (principe du moindre privilège).
- Pas de `NOPASSWD` sur des opérations sensibles.
- Activer le logging : tout `sudo` est tracé dans `/var/log/auth.log`.
- Auditer régulièrement : `sudo grep COMMAND /var/log/auth.log`.

---

## 6. Processus et services

### 6.1 Qu'est-ce qu'un processus ?

**Analogie 👨‍🍳** : un processus est un **cuisinier** qui exécute une recette (programme). Le système d'exploitation est le chef qui répartit les ressources (cuisine, ingrédients = CPU, RAM).

Chaque processus a :
- Un **PID** (Process ID, unique)
- Un **PPID** (Parent PID)
- Un **UID** (qui l'a lancé)
- Un **état** (running, sleeping, zombie, stopped)
- Une **priorité** (niceness, -20 à +19)

Le processus racine est `init` ou `systemd` (PID 1).

### 6.2 Visualiser les processus

```bash
ps                       # Mes processus dans ce terminal
ps aux                   # TOUS les processus, format BSD ⭐
ps -ef                   # Format SysV (équivalent)
ps auxf                  # Avec arborescence
ps -u alice              # Processus de alice
ps -C nginx              # Processus du programme nginx

# Plus interactif
top                      # Monitoring temps réel (q pour quitter)
htop                     # Version améliorée (à installer) ⭐
btop                     # Encore plus moderne (à installer)

# Arborescence
pstree -p                # Avec PIDs
pstree alice             # Pour un utilisateur
```

#### Lecture de `ps aux`

```
USER  PID  %CPU  %MEM   VSZ   RSS  TTY  STAT  START  TIME  COMMAND
root    1   0.0   0.1  167K  11K   ?    Ss    Apr20  0:14  /sbin/init
alice 543   1.2   3.4  500M  56M   pts/0 R+   10:00  0:01  python script.py
```

| Colonne | Signification |
|---------|--------------|
| `STAT` | R running, S sleeping, D uninterruptible sleep, Z zombie, T stopped |
| `VSZ` | Mémoire virtuelle (Ko) |
| `RSS` | Mémoire physique réelle |
| `TTY` | Terminal associé (`?` = pas de terminal, daemon) |

### 6.3 Signaux et `kill`

Un signal = un message envoyé à un processus. Les plus courants :

| Signal | Numéro | Effet |
|--------|--------|-------|
| `SIGTERM` | 15 | Demande polie de terminer (par défaut) |
| `SIGKILL` | 9 | Tue brutalement (irrécupérable) |
| `SIGHUP` | 1 | Recharger la configuration |
| `SIGINT` | 2 | Interruption (Ctrl+C) |
| `SIGSTOP` | 19 | Suspendre |
| `SIGCONT` | 18 | Reprendre |

```bash
kill 1234                  # SIGTERM au PID 1234
kill -9 1234               # SIGKILL (en dernier recours)
kill -HUP 1234             # Recharger config
killall nginx              # Tuer par nom
pkill -u alice             # Tuer tous les processus d'alice
pgrep -f "python script"   # Trouver le PID
```

### 6.4 Lancer en arrière-plan

```bash
longue_commande &                 # En arrière-plan
jobs                              # Lister mes jobs
fg %1                             # Ramener au premier plan
bg %1                             # Reprendre en arrière-plan
nohup commande &                  # Survit à la déconnexion
disown -h %1                      # Détacher du shell

# Avec tmux ou screen (recommandé en prod)
tmux                              # Nouvelle session
tmux new -s monitoring            # Session nommée
# Ctrl+b puis d : détacher
tmux attach -t monitoring         # Reprendre
```

🏦 **Cas bancaire** : pour des opérations longues (batch de nuit, sauvegarde), `tmux` est indispensable car la connexion SSH peut tomber.

### 6.5 Priorités : nice et renice

```bash
nice -n 10 commande              # Lancer avec priorité +10 (moins prioritaire)
renice -n 5 -p 1234              # Modifier la priorité d'un PID
ionice -c 2 -n 7 -p 1234         # Priorité I/O (disque)
```

---

## 7. Le shell Bash : automatiser votre travail

### 7.1 Variables

```bash
NOM="Alice"               # Pas d'espaces autour de =
echo $NOM                 # Alice
echo "Bonjour $NOM"       # Bonjour Alice
echo '$NOM'               # $NOM (simples quotes = pas d'expansion)
unset NOM                 # Supprimer

export PATH="$PATH:/opt/bin"   # Variable d'environnement (héritée par les enfants)
env                       # Voir les variables d'environnement
```

**Variables prédéfinies importantes** :
- `$HOME` : home utilisateur
- `$USER` : nom utilisateur
- `$PATH` : chemins de recherche des commandes
- `$PWD` : dossier courant
- `$?` : code retour de la dernière commande (0 = succès)
- `$$` : PID du shell courant

### 7.2 Redirections et pipes

**Analogie 🚿** : redirection = brancher un tuyau de la sortie d'une commande à un fichier ou une autre commande.

```bash
commande > fichier        # Stdout vers fichier (écrase)
commande >> fichier       # Stdout, ajoute à la fin
commande 2> erreurs.log   # Stderr vers fichier
commande &> tout.log      # Stdout + stderr
commande > /dev/null 2>&1 # Tout silencer
commande < entree.txt     # Lire depuis fichier

# Pipes : sortie d'une commande = entrée de la suivante
ps aux | grep nginx
cat /var/log/syslog | grep -i error | tail -20
ls -la | wc -l            # Compter les fichiers
```

### 7.3 Outils de traitement de texte

```bash
cut -d':' -f1 /etc/passwd          # Extrait le 1er champ (login)
sort fichier.txt                    # Trier
sort -u fichier.txt                 # Dédoublonner après tri
sort -n nombres.txt                 # Tri numérique
uniq -c fichier_trié                # Compter les doublons
tr 'a-z' 'A-Z' < f.txt              # Minuscules → MAJUSCULES
sed 's/ancien/nouveau/g' f.txt      # Remplacer
awk '{print $1, $3}' f.txt          # 1ère et 3ème colonne
awk -F':' '{print $1}' /etc/passwd  # Avec séparateur

# Combinaisons fréquentes en exploitation
cat /var/log/auth.log | grep "Failed password" | awk '{print $11}' | sort | uniq -c | sort -rn
# → top des IPs ayant échoué une connexion SSH (audit sécurité ⭐)
```

### 7.4 Premier script Bash

```bash
#!/bin/bash
# backup.sh — sauvegarde du home

set -euo pipefail   # Mode strict : arrêt sur erreur, variable non définie, échec dans pipe

DATE=$(date +%Y-%m-%d)
SRC="/home/alice"
DEST="/backup"
LOG="/var/log/backup-$DATE.log"

# Vérifier que la destination existe
if [ ! -d "$DEST" ]; then
    echo "Erreur : $DEST n'existe pas" >&2
    exit 1
fi

# Sauvegarder
echo "Démarrage backup : $(date)" | tee -a "$LOG"
tar -czf "$DEST/home-$DATE.tar.gz" "$SRC" 2>>"$LOG"

if [ $? -eq 0 ]; then
    echo "Backup OK" | tee -a "$LOG"
else
    echo "Backup ÉCHOUÉ" | tee -a "$LOG" >&2
    exit 2
fi
```

```bash
chmod +x backup.sh
./backup.sh
```

### 7.5 Structures de contrôle

```bash
# if
if [ "$USER" = "root" ]; then
    echo "Vous êtes root"
elif [ -f "/etc/passwd" ]; then
    echo "passwd existe"
else
    echo "Autre cas"
fi

# Tests fréquents
[ -f fichier ]      # Existe et est un fichier
[ -d dossier ]      # Existe et est un dossier
[ -r fichier ]      # Lisible
[ -z "$VAR" ]       # Variable vide
[ -n "$VAR" ]       # Variable non vide
[ "$a" = "$b" ]     # Égalité chaînes
[ "$a" -eq "$b" ]   # Égalité numérique (-ne, -lt, -le, -gt, -ge)

# for
for f in *.log; do
    gzip "$f"
done

for i in {1..10}; do
    echo "Itération $i"
done

# while
while read ligne; do
    echo "→ $ligne"
done < fichier.txt

# case
case "$1" in
    start) systemctl start nginx ;;
    stop)  systemctl stop nginx ;;
    *)     echo "Usage: $0 {start|stop}"; exit 1 ;;
esac
```

### 7.6 Planification : cron, at, systemd timers

**cron** : tâches récurrentes.
```bash
crontab -e                 # Éditer son crontab
crontab -l                 # Lister
```

Format crontab :
```
# m h dom mon dow  commande
*/5 * * * *  /usr/local/bin/check.sh        # Toutes les 5 min
0 2 * * *    /usr/local/bin/backup.sh        # Tous les jours à 2h
0 9 * * 1-5  /usr/local/bin/rapport.sh       # Lun-Ven à 9h
@reboot      /opt/app/start.sh               # Au démarrage
```

**at** : tâche unique différée.
```bash
echo "rm /tmp/cache" | at now + 1 hour
atq                        # Lister les jobs at
atrm 1                     # Supprimer
```

**systemd timers** : alternative moderne, plus puissante.
```ini
# /etc/systemd/system/backup.service
[Unit]
Description=Sauvegarde quotidienne

[Service]
Type=oneshot
ExecStart=/usr/local/bin/backup.sh
```

```ini
# /etc/systemd/system/backup.timer
[Unit]
Description=Lance backup tous les jours

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
sudo systemctl enable --now backup.timer
sudo systemctl list-timers
```

---

## 8. Gestion des paquets logiciels

### 8.1 Pourquoi des paquets ?

**Analogie 📦** : installer un logiciel à la main, c'est livrer chaque pièce détachée séparément. Un paquet = un meuble Ikea avec notice et toutes les vis. Le **gestionnaire de paquets** gère les dépendances, signatures et mises à jour.

### 8.2 Famille Debian / Ubuntu — APT

```bash
# Mise à jour des index
sudo apt update

# Mise à jour du système
sudo apt upgrade            # Conservatif
sudo apt full-upgrade       # Peut supprimer si nécessaire
sudo apt dist-upgrade       # Pareil (legacy)

# Installer / supprimer
sudo apt install nginx
sudo apt install -y nginx git curl     # -y = pas de confirmation
sudo apt remove nginx                  # Garde la config
sudo apt purge nginx                   # Supprime tout
sudo apt autoremove                    # Supprime les dépendances orphelines

# Recherche / info
apt search "web server"
apt show nginx
apt list --installed
apt list --upgradable

# Bas niveau (dpkg)
sudo dpkg -i paquet.deb                # Installer un .deb local
sudo dpkg -r paquet                    # Supprimer
dpkg -l                                # Lister
dpkg -L nginx                          # Quels fichiers appartiennent à nginx
dpkg -S /etc/nginx/nginx.conf          # Quel paquet possède ce fichier
dpkg --configure -a                    # Réparer un paquet à moitié configuré
```

### 8.3 Famille Red Hat / Fedora — DNF

```bash
sudo dnf check-update
sudo dnf upgrade
sudo dnf install httpd
sudo dnf remove httpd
sudo dnf search apache
sudo dnf info httpd
sudo dnf list installed
sudo dnf history                       # Historique des transactions ⭐
sudo dnf history undo 42               # Annuler une transaction
sudo dnf groupinstall "Development Tools"
sudo dnf clean all

# Bas niveau (rpm)
sudo rpm -ivh paquet.rpm               # Installer
sudo rpm -Uvh paquet.rpm               # Upgrader
rpm -qa                                # Tous les paquets
rpm -qi httpd                          # Info
rpm -ql httpd                          # Fichiers
rpm -qf /etc/httpd/conf/httpd.conf     # Quel paquet
rpm -V httpd                           # Vérifier intégrité ⭐ (audit)
```

### 8.4 Mises à jour de sécurité

🏦 **Critique en banque/santé/énergie** : appliquer rapidement les correctifs de sécurité (CVE).

```bash
# Debian/Ubuntu
sudo apt list --upgradable
sudo unattended-upgrade --dry-run
sudo apt install unattended-upgrades   # Mises à jour automatiques

# RHEL/Rocky
sudo dnf updateinfo list security
sudo dnf upgrade --security
sudo dnf install dnf-automatic
```

✅ **Bonne pratique** : automatiser les mises à jour de sécurité, mais avec **redémarrage planifié** et **fenêtre de maintenance**. Outils : `livepatch`, `kpatch`, `kernel care` pour patcher le noyau sans reboot.

### 8.5 Autres formats

- **Snap** (Canonical) : universel, isolé, mises à jour auto.
- **Flatpak** : surtout desktop.
- **AppImage** : un binaire portable.
- **Conteneurs** (Docker, Podman) : isolation forte, voir section dédiée.

---

## 9. Réseau Linux

### 9.1 Concepts essentiels

| Terme | Analogie |
|-------|----------|
| Adresse IP | Numéro de rue |
| Masque de sous-réseau | Définit le quartier |
| Passerelle (gateway) | Le carrefour pour sortir du quartier |
| DNS | L'annuaire qui transforme un nom en numéro |
| Port | Le numéro d'appartement (port 80 = HTTP, 443 = HTTPS) |

### 9.2 Commandes réseau modernes (`ip`)

L'ancien `ifconfig` est obsolète. Préférez `ip` (paquet `iproute2`).

```bash
# Adresses
ip address show              # ou ip a (lister les interfaces)
ip a show eth0
ip address add 192.168.1.10/24 dev eth0    # Ajouter (temporaire)
ip address del 192.168.1.10/24 dev eth0

# Liens
ip link show                 # ou ip l
ip link set eth0 up
ip link set eth0 down

# Routes
ip route show                # Table de routage
ip route add 10.0.0.0/8 via 192.168.1.1
ip route add default via 192.168.1.1
ip route get 8.8.8.8         # Quelle route pour cette IP ?

# Voisins (ARP)
ip neighbor                  # Cache ARP / NDP

# Statistiques
ip -s link                   # Stats par interface
```

### 9.3 Tester la connectivité

```bash
ping 8.8.8.8                 # Joindre une IP (Ctrl+C pour arrêter)
ping -c 4 google.com         # 4 paquets
ping6 ::1                    # IPv6

traceroute google.com        # Route empruntée
mtr google.com               # Combiné ping + traceroute (à installer) ⭐
tracepath google.com         # Sans privilèges

# Résolution DNS
host google.com
dig google.com
dig @8.8.8.8 google.com MX   # Serveur spécifique, type d'enregistrement
dig +short google.com
nslookup google.com
getent hosts google.com      # Via la résolution système (NSS)
```

### 9.4 Inspection des connexions

```bash
ss -tunlp                    # ⭐ Sockets en écoute (TCP/UDP, numérique, processus)
ss -tnp                      # Connexions TCP établies
ss -s                        # Résumé statistique
netstat -tunlp               # Ancien équivalent (à éviter)

# Qui écoute sur quel port ?
sudo ss -tlnp | grep :80
sudo lsof -i :443
sudo lsof -i tcp:22
sudo fuser -n tcp 80         # Quel processus utilise le port 80

# Capture de paquets
sudo tcpdump -i eth0
sudo tcpdump -i eth0 port 80 -w capture.pcap
sudo tcpdump -nn -i any 'tcp port 22 and host 10.0.0.5'

# Ports ouverts (côté distant)
nmap -sV 192.168.1.1
nmap -p 1-1000 192.168.1.0/24
```

### 9.5 Configurer le réseau de manière persistante

#### Debian / Ubuntu Server (Netplan)

```yaml
# /etc/netplan/01-network.yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    eth0:
      addresses: [192.168.1.10/24]
      routes:
        - to: default
          via: 192.168.1.1
      nameservers:
        addresses: [1.1.1.1, 9.9.9.9]
```
```bash
sudo netplan try            # Test (rollback auto)
sudo netplan apply
```

#### RHEL / Rocky (NetworkManager)

```bash
nmcli connection show
sudo nmcli connection modify "System eth0" ipv4.addresses 192.168.1.10/24
sudo nmcli connection modify "System eth0" ipv4.gateway 192.168.1.1
sudo nmcli connection modify "System eth0" ipv4.dns "1.1.1.1 9.9.9.9"
sudo nmcli connection modify "System eth0" ipv4.method manual
sudo nmcli connection up "System eth0"
```

### 9.6 Résolution de noms

```bash
# /etc/hosts : entrées statiques (priorité forte)
192.168.1.10 monserveur.lab.local monserveur

# /etc/resolv.conf : serveurs DNS (souvent géré par NetworkManager / systemd-resolved)
nameserver 1.1.1.1
nameserver 9.9.9.9
search lab.local

# /etc/nsswitch.conf : ordre de résolution
hosts: files mdns dns
```

```bash
resolvectl status            # Avec systemd-resolved
resolvectl flush-caches      # Vider le cache DNS
```

### 9.7 Bonnes pratiques réseau en production

✅ **À faire** :
- Documenter chaque interface (rôle, VLAN, ACL).
- Utiliser des **VLAN séparés** pour management, prod, backup.
- IP statique pour serveurs, DHCP avec réservation pour postes.
- Activer **IPv6** correctement ou le désactiver complètement (pas à moitié).
- **Time sync** obligatoire (`chrony` ou `systemd-timesyncd`) — critique pour logs et Kerberos.

🚫 **À éviter** :
- Exposer un service de prod directement sans pare-feu.
- Mettre des credentials en clair dans `/etc/hosts` ou `resolv.conf`.
- Désactiver `ICMP` aveuglément (casse `ping` et MTU discovery).

---

## 10. Stockage, disques et systèmes de fichiers

### 10.1 Identifier les disques

```bash
lsblk                        # ⭐ Vue d'ensemble (très lisible)
lsblk -f                     # Avec UUID et type FS
fdisk -l                     # Détaillé (root)
parted -l
blkid                        # UUID, type FS de chaque partition
df -h                        # Espace utilisé / libre par FS
df -i                        # Inodes (parfois saturés avant la place)
du -sh /var/*                # Taille des dossiers
du -sh * | sort -h           # Top 10 des plus gros
ncdu /                       # Explorateur interactif (à installer) ⭐

# Infos détaillées disque
sudo smartctl -a /dev/sda    # SMART : santé du disque ⭐
sudo hdparm -I /dev/sda      # Caractéristiques
```

### 10.2 Partitionner

```bash
sudo fdisk /dev/sdb          # Interactif (m pour aide, n pour nouvelle, w pour écrire)
sudo parted /dev/sdb         # Plus moderne
sudo cfdisk /dev/sdb         # TUI conviviale

# Avec parted en script
sudo parted /dev/sdb mklabel gpt
sudo parted /dev/sdb mkpart primary ext4 1MiB 100%
```

⚠️ **Toujours vérifier le bon disque** avant `fdisk` — une erreur ici détruit les données.

### 10.3 Créer un système de fichiers

```bash
sudo mkfs.ext4 /dev/sdb1           # ext4 (par défaut sur la plupart)
sudo mkfs.xfs /dev/sdb1            # xfs (RHEL par défaut)
sudo mkfs.btrfs /dev/sdb1          # btrfs (snapshots intégrés)
sudo mkswap /dev/sdb2              # Zone d'échange
```

| FS | Forces | Faiblesses | Cas d'usage |
|----|--------|-----------|-------------|
| **ext4** | Stable, mature, universel | Pas de snapshots natifs | Polyvalent |
| **XFS** | Excellent en gros fichiers, scalabilité | Pas de réduction | Bases de données, gros volumes |
| **Btrfs** | Snapshots, COW, RAID | Encore complexe | Stockage personnel, backup |
| **ZFS** | Toutes fonctionnalités, intégrité | Licence, mémoire | NAS, backup ⭐ |
| **F2FS** | Optimisé SSD/flash | Spécifique | Embarqué, mobile |

### 10.4 Monter un système de fichiers

**Analogie 🔌** : "monter" = brancher une clé USB. Le système de fichiers devient accessible à un point de montage.

```bash
sudo mkdir /mnt/data
sudo mount /dev/sdb1 /mnt/data
mount                              # Lister les montages
sudo umount /mnt/data
sudo umount -l /mnt/data           # Lazy (si occupé)
```

#### Persistance avec `/etc/fstab`

```fstab
# <device>            <mountpoint>  <fs>  <options>             <dump> <pass>
UUID=xxx-xxx-xxx     /             ext4  errors=remount-ro     0      1
UUID=yyy-yyy-yyy     /home         ext4  defaults,nodev,nosuid 0      2
UUID=zzz-zzz-zzz     none          swap  sw                    0      0
tmpfs                /tmp          tmpfs defaults,nosuid,nodev 0      0
//srv/share          /mnt/cifs     cifs  credentials=/root/.creds 0   0
```

✅ **Sécurité** : sur les partitions accessibles aux utilisateurs (`/home`, `/tmp`) :
- `nodev` : pas de fichiers de périphérique
- `nosuid` : pas d'élévation SUID
- `noexec` : pas d'exécutables (attention, certains outils en ont besoin)

```bash
sudo mount -a                # Tester fstab sans reboot
findmnt                      # Vue arborescente des montages ⭐
```

### 10.5 LVM : Logical Volume Manager

**Analogie 🏗️** : LVM, c'est comme regrouper plusieurs petits terrains (PV) en un grand domaine (VG) puis y construire des maisons modulables (LV) qu'on peut agrandir/réduire.

- **PV** (Physical Volume) : disque ou partition.
- **VG** (Volume Group) : pool de PV.
- **LV** (Logical Volume) : volume logique formaté et monté.

```bash
# Créer un PV
sudo pvcreate /dev/sdb /dev/sdc
sudo pvs / pvdisplay

# Créer un VG
sudo vgcreate vg_data /dev/sdb /dev/sdc
sudo vgs / vgdisplay

# Créer un LV
sudo lvcreate -L 50G -n lv_app vg_data
sudo lvs / lvdisplay
sudo mkfs.ext4 /dev/vg_data/lv_app
sudo mount /dev/vg_data/lv_app /opt/app

# Étendre à chaud ⭐
sudo lvextend -L +20G /dev/vg_data/lv_app
sudo resize2fs /dev/vg_data/lv_app          # ext4
sudo xfs_growfs /opt/app                    # XFS

# Snapshot
sudo lvcreate -L 10G -s -n snap_app /dev/vg_data/lv_app
```

🏦 **Cas bancaire** : LVM est la base pour étendre dynamiquement l'espace d'une base de données sans interruption.

### 10.6 RAID logiciel (mdadm)

```bash
sudo mdadm --create /dev/md0 --level=1 --raid-devices=2 /dev/sdb /dev/sdc
sudo mdadm --detail /dev/md0
cat /proc/mdstat                       # État ⭐
sudo mdadm --add /dev/md0 /dev/sdd     # Hot-spare
```

| Niveau RAID | Usage | Capacité utile | Tolérance |
|-------------|-------|----------------|-----------|
| RAID 0 | Performance | 100% | 0 disque |
| RAID 1 | Miroir, fiabilité | 50% | 1 disque |
| RAID 5 | Compromis | (n-1)/n | 1 disque |
| RAID 6 | Sécurité accrue | (n-2)/n | 2 disques |
| RAID 10 | Perf + redondance | 50% | 1+ par miroir |

### 10.7 Quotas

Limiter l'espace par utilisateur ou groupe.

```bash
sudo apt install quota
# Ajouter usrquota,grpquota dans /etc/fstab pour la partition
sudo mount -o remount /home
sudo quotacheck -cugm /home
sudo quotaon /home
sudo edquota -u alice                  # Éditer les quotas
sudo repquota -a                       # Rapport
```

### 10.8 Chiffrement avec LUKS

```bash
sudo cryptsetup luksFormat /dev/sdb1
sudo cryptsetup luksOpen /dev/sdb1 cryptdata
sudo mkfs.ext4 /dev/mapper/cryptdata
sudo mount /dev/mapper/cryptdata /mnt/secret
# À l'arrêt
sudo umount /mnt/secret
sudo cryptsetup luksClose cryptdata
```

🏥 **Obligatoire en santé/banque** : tous les disques contenant des données sensibles **doivent** être chiffrés au repos (RGPD article 32, HDS, PCI-DSS).

---

## 11. Démarrage du système et systemd

### 11.1 Le boot Linux étape par étape

```
[Mise sous tension]
    ↓
[BIOS / UEFI] — POST, choix du disque de boot
    ↓
[Bootloader: GRUB] — affiche le menu, charge le noyau et l'initramfs
    ↓
[Noyau Linux] — init du matériel, monte rootfs
    ↓
[init / systemd (PID 1)] — lance les services selon la cible (target)
    ↓
[Login : getty / display manager]
```

### 11.2 GRUB

```bash
# Configuration : /etc/default/grub
GRUB_TIMEOUT=5
GRUB_DEFAULT=0
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"
GRUB_CMDLINE_LINUX="audit=1"   # Activer audit kernel ⭐ sécurité

# Régénérer après modif
sudo update-grub                      # Debian/Ubuntu
sudo grub2-mkconfig -o /boot/grub2/grub.cfg   # RHEL
```

🔒 **Bonne pratique** : protéger GRUB par mot de passe pour empêcher quelqu'un de booter en single-user et obtenir un shell root sans authentification.

### 11.3 systemd : le chef d'orchestre

systemd est :
- Un système d'init (PID 1)
- Un gestionnaire de services
- Un gestionnaire de logs (journald)
- Un gestionnaire de timers, sockets, montages...

#### Concepts : units et targets

| Type d'unit | Extension | Rôle |
|-------------|-----------|------|
| `service` | `.service` | Démon (nginx, sshd) |
| `target` | `.target` | Groupe de services (équivalent runlevel) |
| `socket` | `.socket` | Socket réseau / Unix |
| `timer` | `.timer` | Tâche planifiée |
| `mount` | `.mount` | Point de montage |
| `path` | `.path` | Surveillance de fichiers |

```bash
# Cibles courantes
graphical.target          # Mode graphique (≈ runlevel 5)
multi-user.target         # Mode texte multi-utilisateur (≈ 3)
rescue.target             # Mono-utilisateur, FS monté
emergency.target          # Shell root, rien de monté
reboot.target / poweroff.target

systemctl get-default
sudo systemctl set-default multi-user.target
```

### 11.4 Gérer les services

```bash
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx           # Recharger config sans couper
sudo systemctl status nginx           # ⭐ État + dernières lignes de log
sudo systemctl enable nginx           # Démarrage auto au boot
sudo systemctl disable nginx
sudo systemctl mask nginx             # Empêcher tout démarrage
sudo systemctl is-active nginx
sudo systemctl is-enabled nginx
sudo systemctl list-units --type=service
sudo systemctl list-units --failed   # ⭐ Services en échec
sudo systemctl list-unit-files
sudo systemctl daemon-reload          # Après modif d'unit
```

### 11.5 Créer son propre service

```ini
# /etc/systemd/system/monapp.service
[Unit]
Description=Mon application
After=network.target
Requires=postgresql.service

[Service]
Type=simple
User=monapp
Group=monapp
WorkingDirectory=/opt/monapp
ExecStart=/opt/monapp/bin/monapp
Restart=on-failure
RestartSec=5

# Durcissement sécurité ⭐
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
ReadWritePaths=/var/log/monapp /var/lib/monapp
CapabilityBoundingSet=
AmbientCapabilities=

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now monapp
```

### 11.6 Modes de récupération

Au menu GRUB, ajoutez à la ligne du noyau :
- `systemd.unit=rescue.target` : root prompt, FS monté
- `systemd.unit=emergency.target` : minimal, FS read-only
- `init=/bin/bash` : shell direct (rescue ultime)
- `1` ou `single` : single user

Puis :
```bash
mount -o remount,rw /
passwd                    # Reset mot de passe root
exec /sbin/init           # ou exit + reboot
```

---

## 12. Logs et journalisation

### 12.1 Deux mondes : syslog et journald

**syslog (rsyslog, syslog-ng)** : texte dans `/var/log/`.
**journald** : binaire structuré, indexé, requêtable.

### 12.2 Logs traditionnels (`/var/log/`)

| Fichier | Contenu |
|---------|---------|
| `syslog` / `messages` | Logs système globaux |
| `auth.log` / `secure` | Authentification (SSH, sudo, su) ⭐ |
| `kern.log` | Noyau |
| `dmesg` | Messages noyau récents |
| `dpkg.log` / `dnf.log` | Installations de paquets |
| `nginx/access.log` | Accès web |
| `nginx/error.log` | Erreurs web |
| `mysql/error.log` | Erreurs DB |

```bash
sudo less /var/log/syslog
sudo tail -f /var/log/auth.log         # Suivi temps réel ⭐
sudo grep -i "fail" /var/log/auth.log
sudo zgrep "error" /var/log/syslog.*.gz   # Inclut archives
dmesg -T                               # Logs noyau avec timestamps
dmesg -wH                              # Suivi en temps réel
```

### 12.3 journalctl

```bash
journalctl                                  # Tout
journalctl -e                               # Aller à la fin
journalctl -f                               # ⭐ Suivi temps réel
journalctl -n 100                           # 100 dernières lignes
journalctl --since "1 hour ago"
journalctl --since "2026-04-26 09:00" --until "2026-04-26 10:00"
journalctl -u nginx                         # Pour un service ⭐
journalctl -u nginx -p err                  # Erreurs seulement
journalctl -k                               # Noyau
journalctl --boot                           # Ce boot
journalctl --list-boots                     # Liste des boots
journalctl _UID=1000                        # Par UID
journalctl /usr/bin/sudo                    # Pour un binaire
journalctl --disk-usage                     # Place occupée
sudo journalctl --vacuum-time=30d           # Nettoyer > 30j
sudo journalctl --vacuum-size=1G
```

### 12.4 logrotate

`logrotate` empêche les logs de saturer le disque.

```conf
# /etc/logrotate.d/monapp
/var/log/monapp/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 640 monapp adm
    postrotate
        systemctl reload monapp >/dev/null 2>&1 || true
    endscript
}
```

```bash
sudo logrotate -d /etc/logrotate.d/monapp    # Test sans appliquer
sudo logrotate -f /etc/logrotate.conf        # Force
```

### 12.5 Centralisation des logs

🏦 **Obligation conformité (PCI-DSS, HDS, NIS2)** : conservation 6 mois à 1 an minimum, hors machine d'origine, signée et inviolable.

Stack courantes :
- **ELK / Elastic Stack** : Elasticsearch + Logstash + Kibana
- **Loki + Grafana** : alternative légère
- **Splunk** : payant, très puissant
- **Graylog** : open source, conviviale
- **rsyslog** : envoi simple vers serveur central

Exemple rsyslog client :
```conf
# /etc/rsyslog.d/50-forward.conf
*.* @@logserver.lab.local:6514     # @@ = TCP, @ = UDP
```

---

## 13. Sauvegardes et restauration

### 13.1 La règle 3-2-1

**3** copies des données — sur **2** supports différents — dont **1** hors site (offsite).

🏥 **Cas santé** : ajoutez **1** copie hors-ligne (offline) protégée des ransomwares.

### 13.2 Stratégies

| Stratégie | Description | Pour / Contre |
|-----------|-------------|---------------|
| **Complète** | Tout, à chaque fois | + Restauration simple, − Volumineux |
| **Incrémentielle** | Diff depuis la dernière (de tout type) | + Rapide, − Restauration en chaîne |
| **Différentielle** | Diff depuis la dernière complète | + Compromis, − Croît avec le temps |
| **Synthétique** | Reconstruite côté serveur | + Best of both worlds |

### 13.3 Outils

#### `tar` / `cpio`

```bash
# Sauvegarde complète
tar -czpf /backup/full-$(date +%F).tar.gz /etc /home /var/log

# Avec exclusions
tar -czf backup.tar.gz --exclude='*.log' --exclude='/var/cache' /

# Restauration
tar -xzpf backup.tar.gz -C /
```

#### `rsync` ⭐

```bash
# Local
rsync -avh /home/ /backup/home/

# Vers un serveur distant via SSH
rsync -avzh -e ssh /home/ alice@backup.lab:/srv/backup/home/

# Options indispensables
# -a : archive (récursif, permissions, dates, liens, devices)
# -v : verbose
# -h : human readable
# -z : compresser sur le réseau
# --delete : miroir (supprime côté destination ce qui n'est plus à la source) ⚠️
# --dry-run : simulation
# --progress : progression
```

#### `dd` — copie bas niveau

```bash
sudo dd if=/dev/sda of=/backup/sda.img bs=4M status=progress
sudo dd if=/backup/sda.img of=/dev/sda bs=4M status=progress
```

⚠️ **dd ne pardonne aucune erreur** ("disk destroyer"). Vérifier `if` et `of` 3 fois.

#### Outils dédiés

- **BorgBackup** : déduplication, chiffrement, incrémentiel ⭐
- **Restic** : moderne, multi-backend (S3, B2, SFTP)
- **Duplicity** : chiffré, GnuPG
- **Bacula / Bareos** : entreprise, multi-clients
- **Veeam** : commercial, snapshots VM
- **Amanda** : référence open source

### 13.4 Tester les restaurations !

🚨 **Une sauvegarde non testée n'est PAS une sauvegarde**. Planifier un test de restauration trimestriel a minima.

### 13.5 Bases de données

Ne jamais sauvegarder à chaud les fichiers d'une DB en cours d'écriture.

```bash
# MySQL / MariaDB
mysqldump -u root -p --all-databases | gzip > db-$(date +%F).sql.gz
mysqldump --single-transaction --routines --triggers ma_db > db.sql

# PostgreSQL
pg_dumpall -U postgres | gzip > pg-all-$(date +%F).sql.gz
pg_dump ma_db > ma_db.sql
pg_basebackup -D /backup/pg_base -F tar -z

# MongoDB
mongodump --uri="mongodb://localhost" --out=/backup/mongo-$(date +%F)
```

---

## 14. SSH : administration à distance sécurisée

### 14.1 Connexion de base

```bash
ssh alice@serveur.lab.local
ssh -p 2222 alice@serveur                 # Port custom
ssh -i ~/.ssh/cle_special.key alice@srv   # Clé spécifique
ssh -v alice@srv                          # Verbose (debug)
ssh -L 8080:localhost:80 alice@srv        # Tunnel local
ssh -D 1080 alice@srv                     # Proxy SOCKS
ssh -J jump.lab.local alice@interne       # Via bastion
```

### 14.2 Authentification par clés

🚫 **Désactiver les mots de passe SSH en production**. C'est non négociable.

```bash
# Sur votre poste : générer une clé moderne
ssh-keygen -t ed25519 -C "alice@laptop" -f ~/.ssh/id_ed25519

# Déposer la clé publique sur le serveur
ssh-copy-id alice@serveur.lab.local
# Ou manuellement
cat ~/.ssh/id_ed25519.pub | ssh alice@serveur "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

#### Agent SSH

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519       # Charger la clé (saisir passphrase une fois)
ssh-add -l                       # Lister
ssh -A user@srv                  # Forwarder l'agent (attention sécurité)
```

### 14.3 Configuration côté client (`~/.ssh/config`)

```sshconfig
Host bastion
    HostName bastion.entreprise.fr
    User alice
    IdentityFile ~/.ssh/id_ed25519_bastion
    Port 2222

Host prod-*
    User admin
    ProxyJump bastion
    IdentityFile ~/.ssh/id_ed25519_prod
    StrictHostKeyChecking yes

Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3
    HashKnownHosts yes
```

### 14.4 Durcissement du serveur SSH (`/etc/ssh/sshd_config`)

```sshd_config
# Identité
Port 22                                 # Changer si exposé Internet
AddressFamily inet                      # IPv4 seulement si pas d'IPv6
ListenAddress 192.168.1.10              # Bind sur une IP précise

# Protocole
Protocol 2

# Authentification
PermitRootLogin no                      # ⭐ JAMAIS de root direct
PasswordAuthentication no               # ⭐ Clés uniquement
ChallengeResponseAuthentication no
KbdInteractiveAuthentication no
UsePAM yes
PubkeyAuthentication yes
PermitEmptyPasswords no
MaxAuthTries 3
MaxSessions 3
LoginGraceTime 30s

# Restreindre les utilisateurs
AllowUsers alice bob
AllowGroups ssh-users

# Algorithmes (modernes seulement)
KexAlgorithms curve25519-sha256,curve25519-sha256@libssh.org,diffie-hellman-group16-sha512
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com
HostKeyAlgorithms ssh-ed25519,rsa-sha2-512

# Limitation
ClientAliveInterval 300
ClientAliveCountMax 2
TCPKeepAlive no
X11Forwarding no
AllowAgentForwarding no
AllowTcpForwarding no

# Logs
LogLevel VERBOSE
SyslogFacility AUTHPRIV

# Bannière (légale en entreprise)
Banner /etc/ssh/banner
```

```bash
sudo sshd -t                       # ⭐ Tester la syntaxe
sudo systemctl reload sshd
```

✅ Compléter avec **fail2ban** (bannit les IPs après X échecs) :
```bash
sudo apt install fail2ban
sudo systemctl enable --now fail2ban
sudo fail2ban-client status sshd
```

### 14.5 Transfert de fichiers

```bash
scp fichier alice@srv:/tmp/
scp -r dossier alice@srv:/tmp/
sftp alice@srv                     # Mode interactif
rsync -avz -e ssh fichiers/ alice@srv:/srv/data/
```

---

## 15. Sécurité Linux : durcissement complet

### 15.1 Les 4 piliers : CIA + 1

- **Confidentialité** : seuls les autorisés voient les données.
- **Intégrité** : les données ne sont pas altérées.
- **Disponibilité** : les services sont accessibles quand attendus.
- **Traçabilité** (l'ajout moderne) : qui a fait quoi, quand.

### 15.2 Principes fondamentaux

| Principe | Application concrète |
|----------|---------------------|
| **Moindre privilège** | Pas de `root` quotidien, sudo ciblé |
| **Défense en profondeur** | Pare-feu **+** SELinux **+** logs **+** EDR |
| **Réduction de surface** | Désactiver services inutiles, fermer ports |
| **Zero Trust** | Ne fais confiance à aucun réseau, vérifie toujours |
| **Fail safe** | En cas d'erreur, refuser plutôt qu'autoriser |
| **Séparation des privilèges** | Utilisateur dédié par service |

### 15.3 Réduire la surface d'attaque

```bash
# Lister les services actifs (analyse) ⭐
sudo systemctl list-unit-files --state=enabled --type=service
sudo ss -tunlp                # Ports en écoute

# Désactiver l'inutile
sudo systemctl disable --now telnet.socket cups.service avahi-daemon

# Désinstaller plutôt que désactiver quand possible
sudo apt purge telnetd rpcbind ftp inetutils-telnet
```

### 15.4 Politique de mots de passe

```bash
# /etc/login.defs
PASS_MAX_DAYS   90
PASS_MIN_DAYS   1
PASS_WARN_AGE   7
PASS_MIN_LEN    14

# /etc/security/pwquality.conf
minlen = 14
minclass = 4          # Maj + min + chiffres + spéciaux
maxrepeat = 3
dcredit = -1
ucredit = -1
ocredit = -1
lcredit = -1
enforce_for_root

# Verrouillage après échecs (PAM faillock)
# /etc/security/faillock.conf
deny = 5
unlock_time = 900
fail_interval = 900
```

### 15.5 PAM : Pluggable Authentication Modules

PAM contrôle l'authentification système. Empilement de règles dans `/etc/pam.d/`.

```pam
# Exemple : exiger 2FA pour SSH (Google Authenticator)
auth required pam_google_authenticator.so
auth substack password-auth
```

### 15.6 Audit des accès

```bash
# Comptes
awk -F: '$3 == 0 {print $1}' /etc/passwd          # Comptes UID 0 ⭐ (devrait être seulement root)
awk -F: '$2 == "" {print $1}' /etc/shadow         # Comptes sans mot de passe ⚠️
awk -F: '$2 ~ /^!|^\*/ {print $1}' /etc/shadow    # Verrouillés

# Connexions
last -50                                          # Dernières connexions
lastb -50                                         # Échecs (root)
who -a
w

# sudo
sudo grep COMMAND /var/log/auth.log | tail -50
```

### 15.7 Audit avec `auditd`

```bash
sudo apt install auditd
sudo systemctl enable --now auditd

# Règles dans /etc/audit/rules.d/audit.rules
# Surveiller modifications de /etc/passwd
-w /etc/passwd -p wa -k passwd_changes
-w /etc/shadow -p wa -k shadow_changes
-w /etc/sudoers -p wa -k sudoers_changes
-a always,exit -F arch=b64 -S execve -k exec_calls

# Activer
sudo augenrules --load
sudo systemctl restart auditd

# Consulter
sudo ausearch -k passwd_changes
sudo aureport --summary
```

### 15.8 Outils d'audit automatisé

#### Lynis ⭐

```bash
sudo apt install lynis
sudo lynis audit system
# Donne un score de durcissement et des recommandations
```

#### OpenSCAP / SCAP

```bash
sudo apt install libopenscap8 ssg-base ssg-debderived
sudo oscap xccdf eval --profile xccdf_org.ssgproject.content_profile_cis_level1_server \
  --results scan.xml --report scan.html \
  /usr/share/xml/scap/ssg/content/ssg-debian12-ds.xml
```

#### CIS Benchmarks
- Scripts de durcissement : https://github.com/CISOfy/lynis
- Profiles automatisés : Ansible (DevSec, hardening role), OpenSCAP

#### ANSSI BP-028
Le guide officiel français : https://cyber.gouv.fr/publications/recommandations-de-configuration-dun-systeme-gnulinux

---

## 16. Pare-feu : iptables, nftables, firewalld, UFW

### 16.1 Vue d'ensemble

```
┌────────────────────────────────────────────────┐
│  Couche framework Netfilter (dans le noyau)    │
└────────────────────────────────────────────────┘
        ▲                                  ▲
        │                                  │
   iptables (ancien)              nftables (moderne)
        ▲                                  ▲
        └────────────┬─────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
    firewalld                    UFW
   (RHEL/Fedora)            (Ubuntu/Debian)
```

### 16.2 UFW (Ubuntu Firewall) — le plus simple

```bash
sudo ufw status verbose
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow ssh                       # Par nom de service
sudo ufw allow from 192.168.1.0/24 to any port 22
sudo ufw allow 80,443/tcp
sudo ufw deny 23
sudo ufw delete allow 80
sudo ufw enable                          # ⚠️ Pas se couper avant SSH OK
sudo ufw reload
sudo ufw logging on
```

### 16.3 firewalld — RHEL/CentOS/Rocky

```bash
sudo firewall-cmd --state
sudo firewall-cmd --get-default-zone
sudo firewall-cmd --list-all
sudo firewall-cmd --get-services

# Permanente (--permanent) puis reload, sinon temporaire
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --permanent --remove-service=cockpit
sudo firewall-cmd --permanent --zone=public --add-source=192.168.1.0/24
sudo firewall-cmd --reload

# Rich rules (puissantes)
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="10.0.0.0/8" port port=22 protocol=tcp accept'
```

### 16.4 iptables — l'historique

```bash
sudo iptables -L -v -n                   # Lister
sudo iptables -L INPUT --line-numbers
sudo iptables -F                         # Vider (attention !)

# Règles classiques
sudo iptables -P INPUT DROP              # Politique par défaut
sudo iptables -P FORWARD DROP
sudo iptables -P OUTPUT ACCEPT
sudo iptables -A INPUT -i lo -j ACCEPT
sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -p icmp --icmp-type echo-request -j ACCEPT

# Sauvegarder (sinon perdu au reboot)
sudo iptables-save > /etc/iptables/rules.v4
sudo netfilter-persistent save
```

### 16.5 nftables — successeur officiel

```bash
sudo nft list ruleset
sudo nft add table inet filter
sudo nft add chain inet filter input { type filter hook input priority 0 \; policy drop \; }
sudo nft add rule inet filter input ct state established,related accept
sudo nft add rule inet filter input iif lo accept
sudo nft add rule inet filter input tcp dport 22 accept
sudo nft -f /etc/nftables.conf
```

### 16.6 NAT et port forwarding

```bash
# Activer le routage
echo 1 | sudo tee /proc/sys/net/ipv4/ip_forward
# Persistant : net.ipv4.ip_forward=1 dans /etc/sysctl.conf

# NAT sortant (masquerade)
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

# DNAT (rediriger un port)
sudo iptables -t nat -A PREROUTING -p tcp --dport 8080 -j DNAT --to-destination 192.168.1.10:80
```

### 16.7 Politique pare-feu en production

🏦 **Pour un serveur bancaire ou santé** :
1. **Default DROP** sur INPUT et FORWARD.
2. Autoriser uniquement les flux nécessaires, par IP source quand possible.
3. Loguer les paquets refusés (avec rate limiting).
4. Documenter chaque règle (fichier de commentaires versionné).
5. Tester depuis l'extérieur (`nmap`).
6. Versionner les règles dans Git (Ansible, Terraform).

---

## 17. SELinux et AppArmor : MAC

### 17.1 DAC vs MAC

- **DAC (Discretionary)** : modèle Unix classique. Le propriétaire décide.
- **MAC (Mandatory)** : règles imposées par l'OS, même root est limité par la politique.

### 17.2 SELinux (RHEL, Fedora)

**Analogie 🛂** : SELinux est un douanier strict qui demande à chaque processus son passeport (contexte) avant d'accéder à une ressource.

```bash
sestatus                           # État
getenforce                         # Mode courant
sudo setenforce 0                  # Permissive (logs, pas de blocage)
sudo setenforce 1                  # Enforcing ⭐

# Modes :
# - enforcing : bloque + log
# - permissive : log seulement (debug)
# - disabled : éteint

# Voir les contextes
ls -Z /etc/passwd
ps -eZ | grep nginx
id -Z

# Diagnostiquer
sudo ausearch -m AVC -ts recent
sudo sealert -a /var/log/audit/audit.log

# Booléens (toggles)
getsebool -a | grep httpd
sudo setsebool -P httpd_can_network_connect on

# Restaurer le contexte d'un fichier
sudo restorecon -Rv /var/www
sudo chcon -t httpd_sys_content_t /opt/web

# Politique custom
sudo audit2allow -a -M monpolicy
sudo semodule -i monpolicy.pp
```

🚫 **Ne désactivez pas SELinux sur un serveur de production** ! Configurer une politique correcte demande du travail mais c'est une couche de défense majeure.

### 17.3 AppArmor (Ubuntu, SUSE)

Plus simple que SELinux : profils par chemin de binaire.

```bash
sudo aa-status
sudo aa-enforce /etc/apparmor.d/usr.sbin.nginx
sudo aa-complain /etc/apparmor.d/usr.sbin.nginx     # Mode "log seulement"
sudo aa-disable /etc/apparmor.d/...
sudo aa-genprof /usr/bin/monapp                     # Générer un profil
sudo aa-logprof                                     # Itérer sur les violations
```

Profil exemple :
```
#include <tunables/global>

/usr/bin/monapp {
  #include <abstractions/base>
  /opt/monapp/** r,
  /var/log/monapp/*.log w,
  /etc/monapp.conf r,
  network inet stream,
}
```

---

## 18. Détection d'intrusion et surveillance

### 18.1 HIDS : Host-based Intrusion Detection

#### AIDE (Advanced Intrusion Detection Environment)

Vérifie l'**intégrité** des fichiers critiques (binaires, configs).

```bash
sudo apt install aide
sudo aideinit                              # Crée la base de référence
sudo cp /var/lib/aide/aide.db.new /var/lib/aide/aide.db
sudo aide --check                          # ⭐ Compare l'état actuel
```

✅ Lancer en cron quotidien et alerter sur changements non planifiés.

#### Fail2ban

Bannit les IPs après échecs répétés.

```bash
sudo apt install fail2ban
# /etc/fail2ban/jail.local
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
findtime = 600
bantime = 3600

sudo fail2ban-client status
sudo fail2ban-client status sshd
sudo fail2ban-client unban 1.2.3.4
```

#### CrowdSec

Évolution moderne de Fail2ban : partage communautaire des IPs malveillantes.

### 18.2 NIDS : Network-based

- **Snort 3** : référence open source.
- **Suricata** : alternative multithreadée.
- **Zeek (Bro)** : analyse comportementale.

### 18.3 Surveillance et SIEM

| Outil | Rôle |
|-------|------|
| **Wazuh** | SIEM open source complet (HIDS + analyse logs) |
| **OSSEC** | HIDS, ancêtre de Wazuh |
| **Elastic SIEM** | Stack complète |
| **Splunk** | Référence commerciale |
| **Graylog** | Logs centralisés |
| **Prometheus + Grafana** | Métriques + dashboards |
| **Zabbix / Nagios** | Monitoring infra classique |

### 18.4 Recherche de compromission rapide

```bash
# Connexions actives suspectes
sudo ss -tunap

# Processus orphelins ou suspects
ps auxf
sudo lsof -i

# Modifications récentes dans /etc et /usr/bin
sudo find /etc /usr/bin /usr/sbin -mtime -7 -type f

# Cron suspects
ls -la /etc/cron.* /var/spool/cron/

# Fichiers SUID hors standard
sudo find / -perm -4000 -not -path "/proc/*" 2>/dev/null

# Modules noyau
lsmod
sudo modinfo nom_module

# Historique récent
last -20
sudo lastb -20
sudo grep "Accepted" /var/log/auth.log | tail
```

---

## 19. Gestion des secrets et chiffrement

### 19.1 Le problème

Mettre des mots de passe / clés API dans :
- ❌ Fichiers texte sur disque
- ❌ Variables d'environnement non protégées
- ❌ Code Git (jamais !)
- ❌ Logs

### 19.2 Bonnes pratiques

✅ **Court terme** : `~/.netrc` chmod 600, fichiers `.env` chmod 600 hors Git.
✅ **Moyen terme** : `pass` (CLI), `gopass`, `KeePassXC`.
✅ **Production** : **HashiCorp Vault**, **OpenBao**, **Infisical**, **AWS Secrets Manager**, **Azure Key Vault**.
✅ **CI/CD** : variables masquées + injection runtime.

### 19.3 Chiffrement de fichiers

```bash
# GPG
gpg --gen-key
gpg --encrypt -r alice@lab.fr secret.txt
gpg --decrypt secret.txt.gpg

# OpenSSL
openssl enc -aes-256-cbc -salt -pbkdf2 -in secret.txt -out secret.enc
openssl enc -d -aes-256-cbc -pbkdf2 -in secret.enc -out secret.txt

# age (moderne, simple)
age-keygen -o key.txt
age -r age1xxx... -o secret.age secret.txt
age -d -i key.txt secret.age
```

### 19.4 Détection de secrets dans le code

```bash
# Avant de pusher !
gitleaks detect --source .
trufflehog filesystem .
detect-secrets scan
```

🏦 **Cas réel** : un AWS access key dans Git public = facture de plusieurs milliers d'euros en quelques minutes (mining crypto). Ajoutez **toujours** un pre-commit hook.

### 19.5 PKI et certificats

```bash
# Générer une CSR
openssl req -new -newkey rsa:4096 -nodes -keyout site.key -out site.csr

# Auto-signé (test/dev seulement)
openssl req -x509 -newkey rsa:4096 -days 365 -nodes -keyout key.pem -out cert.pem

# Vérifier un certificat
openssl x509 -in cert.pem -noout -text
openssl x509 -in cert.pem -noout -dates
openssl s_client -connect example.com:443 -showcerts < /dev/null

# Let's Encrypt avec certbot
sudo certbot --nginx -d example.com -d www.example.com
sudo certbot renew --dry-run
```

---

## 20. Toutes les commandes de diagnostic

### 20.1 Système et identification

```bash
uname -a                       # Noyau, architecture
hostnamectl                    # Identité machine, kernel, OS
lsb_release -a                 # Version distribution
cat /etc/os-release            # Version (universel)
arch                           # Architecture (x86_64, aarch64)
uptime                         # Charge + durée
date && timedatectl            # Heure et fuseau
who && w                       # Utilisateurs connectés
last -20                       # Connexions
```

### 20.2 CPU

```bash
lscpu                          # Vue détaillée CPU ⭐
cat /proc/cpuinfo
nproc                          # Nombre de cœurs
mpstat -P ALL 1                # Par cœur, toutes les sec (sysstat)
top                            # Temps réel
htop                           # Mieux ⭐
glances                        # Vue intégrée
vmstat 1                       # Tableau de bord global
sar -u 1 5                     # Historique CPU (sysstat)
pidstat 1                      # Par processus
```

### 20.3 Mémoire

```bash
free -h                        # ⭐ RAM et swap (lisible)
cat /proc/meminfo              # Détaillé
vmstat -s                      # Stats memory
ps aux --sort=-%mem | head     # Top 10 consommateurs RAM ⭐
top -o %MEM
sar -r 1 5                     # Historique
slabtop                        # Caches noyau
swapon --show                  # Espaces swap actifs
```

### 20.4 Disques et systèmes de fichiers

```bash
df -h                          # ⭐ Espace libre par FS
df -i                          # Inodes
du -sh /*                      # Taille des dossiers
du -sh * | sort -h             # Trié
ncdu /                         # Interactif ⭐
lsblk -f                       # ⭐ Vue arborescente disques
blkid                          # UUID
findmnt                        # Montages arborescents
mount | column -t              # Lisible
iostat -xz 1                   # ⭐ Stats I/O par disque (sysstat)
iotop                          # Processus consommant I/O
sudo smartctl -a /dev/sda      # Santé disque ⭐
sudo hdparm -tT /dev/sda       # Vitesse de lecture
sudo fsck -n /dev/sdb1         # Vérifier (en lecture seule)
sudo tune2fs -l /dev/sda1      # Paramètres ext4
sudo xfs_info /dev/sda1        # Pour XFS
```

### 20.5 Réseau

```bash
ip a                           # ⭐ Adresses IP
ip r                           # Routes
ip n                           # ARP/NDP
ip -s link                     # Stats par interface
nmcli                          # Vue NetworkManager
ss -tunlp                      # ⭐ Sockets en écoute
ss -s                          # Résumé
ss -tnp                        # Connexions TCP établies
sudo lsof -i                   # Tous les sockets ouverts
sudo lsof -i :443              # Port spécifique
sudo netstat -tunlp            # Ancien
ping -c 4 8.8.8.8
ping6 -c 4 ::1
mtr 8.8.8.8                    # ⭐ Combine ping et traceroute
traceroute 8.8.8.8
host google.com
dig google.com
dig +trace google.com          # Récursivité complète
sudo tcpdump -i any -nn port 443    # Capture
sudo nmap -sV 192.168.1.0/24
ethtool eth0                   # Vitesse, duplex carte
sudo iftop -i eth0             # Bande passante temps réel
sudo nethogs                   # Bande passante par processus ⭐
sudo iptraf-ng
sar -n DEV 1 5                 # Historique débit
ss -i                          # Détails connexions TCP
sudo arp -a / ip neighbor      # Cache ARP
```

### 20.6 Processus

```bash
ps aux                         # ⭐ Tous les processus
ps -ef
ps auxf                        # Avec arborescence
pstree -p
top
htop                           # ⭐
btop
pgrep -a nginx
pidof sshd
sudo lsof -p 1234              # Fichiers ouverts par PID
strace -p 1234                 # Tracer les appels système ⭐ (debug)
ltrace -p 1234                 # Tracer les appels bibliothèques
sudo gdb -p 1234               # Debug
```

### 20.7 Services systemd

```bash
systemctl status               # État global
systemctl --failed             # ⭐ Services en échec
systemctl list-units --type=service
systemctl list-unit-files
systemctl status nginx
systemctl cat nginx            # Voir l'unit complète
systemctl show nginx           # Toutes les propriétés
systemd-analyze                # Temps de boot
systemd-analyze blame          # ⭐ Services les plus lents au boot
systemd-analyze critical-chain
systemd-analyze plot > boot.svg
systemd-cgtop                  # Top par cgroup
loginctl                       # Sessions utilisateurs
```

### 20.8 Logs

```bash
journalctl -e                  # Aller à la fin
journalctl -f                  # ⭐ Suivi temps réel
journalctl -u nginx            # ⭐ Pour un service
journalctl -p err -b           # Erreurs depuis ce boot
journalctl --since "1h ago"
journalctl --disk-usage
dmesg -T                       # ⭐ Logs noyau
dmesg -wH                      # Suivi
tail -f /var/log/syslog
tail -f /var/log/auth.log
sudo grep -i error /var/log/syslog
sudo zgrep "panic" /var/log/syslog.*.gz
```

### 20.9 Performance globale

```bash
top
htop
atop                           # Historique inclus ⭐
glances                        # Tout en un
nmon                           # Plein écran
dstat -cdngy 1                 # Polyvalent
vmstat 1
iostat -xz 1
mpstat -P ALL 1
sar -A                         # ⭐ Tout l'historique sysstat
sar -q                         # Charge système historique
collectl
perf stat -p 1234              # Compteurs CPU
perf top                       # Hotspots
```

### 20.10 Sécurité audit

```bash
last -20                       # Connexions
lastb -20                      # Échecs
who -a
sudo aulast                    # Via auditd
sudo ausearch -k passwd_changes
sudo aureport --summary
sudo lynis audit system        # ⭐ Audit complet
sudo chkrootkit                # Détection rootkits
sudo rkhunter --check
sudo debsums -c                # Vérifier intégrité paquets Debian
sudo rpm -Va                   # Idem RHEL
sudo find / -perm -4000 -type f 2>/dev/null
sudo find / -nouser -o -nogroup 2>/dev/null
sudo find / -mtime -1 -type f 2>/dev/null | head -50
```

### 20.11 Dépannage : le golden path

Quand un serveur dysfonctionne, parcourir dans l'ordre :

```bash
# 1. Vue générale
uptime                         # Charge ?
systemctl --failed
journalctl -p err -b

# 2. Ressources
free -h
df -h && df -i
top  ou  htop

# 3. Réseau
ip a
ss -tunlp
ping passerelle
ping 8.8.8.8
dig google.com

# 4. Logs
journalctl -xe
dmesg -T | tail -50
tail -100 /var/log/syslog

# 5. Service spécifique
systemctl status MON_SERVICE
journalctl -u MON_SERVICE -e
```

---

## 21. Bonnes pratiques par secteur

### 21.1 🏦 Secteur bancaire / fintech

**Réglementations clés** : PCI-DSS, DORA, RGPD, LCB-FT, ACPR.

**Exigences techniques** :
- **Segmentation réseau stricte** (zones DMZ, app, data, ops).
- Pas de **données de carte** en clair, jamais (PCI-DSS Req. 3).
- **Chiffrement** de bout en bout (TLS 1.2 minimum, idéalement 1.3).
- **Logs centralisés** conservés 1 an minimum, 7 ans pour transactions.
- **HSM** (Hardware Security Module) pour clés cryptographiques sensibles.
- **MFA obligatoire** pour tout accès admin.
- **Tests d'intrusion annuels** + scans trimestriels.
- **PRA / PCA** testés annuellement (DORA exige des tests réguliers).
- **Séparation des environnements** : prod, pré-prod, dev sur infrastructures distinctes.

**Configuration type** :
```bash
# Forcer TLS 1.2+ partout
# /etc/ssh/sshd_config : seulement KEX/ciphers modernes
# Pare-feu : default DROP, tout flux journalisé
# auditd : activé avec règles ANSSI BP-028
# SELinux : enforcing
```

### 21.2 🏥 Secteur santé

**Réglementations clés** : RGPD, HDS (Hébergement Données Santé) en France, HIPAA aux USA, NIS2.

**Exigences spécifiques** :
- **Hébergement HDS** : seuls les hébergeurs certifiés HDS peuvent héberger des données de santé en France.
- **Pseudonymisation / anonymisation** des données de recherche.
- **Traçabilité fine** des accès aux dossiers (qui a vu quel patient et quand).
- **Sauvegardes chiffrées hors site** + immuables (anti-ransomware).
- **Continuité** : un système qui tombe peut coûter des vies.

**Schéma type** :
```
[Postes médicaux] → [VPN] → [Bastion] → [Serveurs HDS chiffrés]
                                          ├── DB pseudonymisée
                                          ├── Imagerie (DICOM)
                                          └── Backup → S3 immuable
```

### 21.3 ⚡ Secteur énergie / OT (SCADA, ICS)

**Réglementations clés** : NIS2, IEC 62443, LPM (France, OIV).

**Particularités** :
- **Maintenabilité longue** (>10 ans) : noyaux LTS, distributions stables.
- **Air gap** ou DMZ industrielle stricte entre IT et OT.
- **Patching difficile** : ne casser pas la supervision d'une centrale.
- **Surveillance protocoles industriels** (Modbus, DNP3, IEC 61850).
- Outils dédiés : **Claroty, Nozomi, Dragos**.

🚨 **Cas pratique** : l'attaque NotPetya (2017) — cargo Maersk paralysé, plus d'1 milliard de dollars de pertes — était une attaque sur Linux et Windows mal segmentés. La leçon : segmentation et backups offline.

### 21.4 🚆 Secteur transport

- **SLA très élevés** (99,99% = max 52 min/an de panne).
- **Redondance géographique** (multi-DC, multi-régions cloud).
- Surveillance des **systèmes embarqués** Linux (trains, avions, voitures connectées).
- **Conformité ISO 27001, TISAX (automotive), ED-203 (aéronautique)**.

### 21.5 🛡️ Secteur assurance

- Données personnelles **massives** (RGPD).
- **Modèles actuariels** : protection IP des modèles.
- **API exposées** : besoin de WAF, rate limiting, OAuth2/OIDC.
- **Conservation longue** des contrats (parfois >30 ans).

### 21.6 🌐 Bonnes pratiques transverses

| Pratique | Action concrète |
|----------|-----------------|
| **IaC** | Tout en code (Ansible, Terraform, Puppet). Versionner. |
| **Immutable infra** | Pas de modif live, on redéploie. |
| **CI/CD sécurisée** | SAST + SCA + signature des artefacts (Sigstore). |
| **GitOps** | Source de vérité = Git, audit naturel. |
| **Observabilité** | Logs + métriques + traces (3 piliers). |
| **DR drills** | Simuler une perte de DC une fois par an. |
| **Tabletop exercises** | Simuler un ransomware avec les équipes. |
| **Inventaire à jour** | CMDB, SBOM pour la chaîne logicielle. |
| **Politique BYOD claire** | Postes admin dédiés, pas de mélange perso/pro. |

---

## 22. Réponse à incident : que faire en cas d'attaque ?

### 22.1 La méthode NIST : 4 phases

```
┌──────────────┐   ┌────────────────┐   ┌──────────────┐   ┌─────────────┐
│ Préparation  │ → │  Détection &   │ → │ Containment, │ → │ Post-       │
│              │   │  Analyse       │   │ Eradication, │   │ incident    │
│              │   │                │   │ Recovery     │   │             │
└──────────────┘   └────────────────┘   └──────────────┘   └─────────────┘
```

### 22.2 Préparation (avant l'attaque)

- **Plan de réponse écrit** et testé (qui appelle qui ?).
- **Astreintes** définies, numéros à jour.
- **Outils prêts** : forensique (FTK Imager, Volatility), comm (canal hors bande).
- **Sauvegardes immuables** vérifiées.
- **CERT/CSIRT** sectoriel connu (ANSSI CERT-FR pour la France).
- **Assurance cyber** si applicable.

### 22.3 Détection

Signaux d'alerte sur Linux :
- Hausse subite de la **charge CPU**, du trafic réseau sortant.
- Processus **inconnu** ou avec nom suspect (`./aaaa`, `[kworker/0:99]`).
- **Fichiers modifiés** dans `/etc`, `/usr/bin`, `/usr/sbin` récemment.
- Comptes UID 0 inattendus.
- **Connexions sortantes** vers IPs inconnues, ports inhabituels.
- **Logs effacés** ou tronqués.
- **Fail2ban** déborde, ou bannissements normaux disparaissent.
- **AIDE** signale changements.

### 22.4 Investigation rapide

```bash
# 1. Préserver les preuves AVANT toute action ⭐
sudo dd if=/dev/sda of=/mnt/external/disk.img bs=4M status=progress   # Image disque
sudo memdump -p /tmp/memory.dump                                      # Mémoire (LiME)

# 2. Lister tout ce qui tourne et écoute
sudo ps auxf > /tmp/ps.txt
sudo ss -tunlp > /tmp/sockets.txt
sudo lsof -i > /tmp/lsof.txt
sudo netstat -anp > /tmp/netstat.txt

# 3. Connexions et utilisateurs
sudo last -50 > /tmp/last.txt
sudo lastb -50 > /tmp/lastb.txt
sudo who -a
sudo aulast                                    # via auditd
awk -F: '$3 == 0' /etc/passwd                  # comptes UID 0

# 4. Modifications récentes
sudo find / -mtime -7 -type f -not -path "/proc/*" -not -path "/sys/*" 2>/dev/null > /tmp/recent.txt
sudo find / -perm -4000 -type f 2>/dev/null > /tmp/suid.txt

# 5. Persistances classiques
ls -la /etc/cron.* /var/spool/cron/
sudo crontab -l ; sudo crontab -u root -l
ls -la /etc/systemd/system/ /etc/init.d/
cat ~/.bashrc ~/.profile /etc/profile /etc/bash.bashrc
cat ~/.ssh/authorized_keys                     # Clés ajoutées ?
sudo grep -r "ssh-rsa\|ssh-ed25519" /home /root 2>/dev/null

# 6. Logs
sudo journalctl --since "yesterday" > /tmp/journal.log
sudo grep -i "fail\|error\|denied" /var/log/auth.log
sudo dmesg -T

# 7. Modules noyau
lsmod
sudo find /lib/modules -mtime -30
```

### 22.5 Containment (confinement)

Décision difficile : **isoler** ou **observer** ?

**Isoler** :
```bash
# Couper le réseau (sauf SSH d'investigation depuis IP de confiance)
sudo iptables -I INPUT 1 -s VOTRE_IP -j ACCEPT
sudo iptables -P INPUT DROP
sudo iptables -P OUTPUT DROP
sudo iptables -P FORWARD DROP

# Ou plus radical
sudo ip link set eth0 down
```

**Observer** (avec EDR/SOC) : laisser tourner pour identifier la chaîne d'attaque, mais c'est risqué.

### 22.6 Eradication

- **Identifier le patient zéro** (CVE exploitée ? credentials volés ? phishing ?).
- **Patcher** la vulnérabilité.
- **Nettoyer** persistances (cron, services, clés SSH).
- **Réinitialiser** TOUS les mots de passe et clés API potentiellement compromis.
- **Reconstruire** plutôt que nettoyer si compromission profonde (rootkit).

🚨 **Règle d'or** : sur une compromission sérieuse, **on rebuild from scratch** depuis une image vérifiée. Nettoyer un système rootkité, c'est jouer au plus malin avec un attaquant qui connaît mieux son outil que vous.

### 22.7 Recovery

- Restaurer depuis **backup propre** (vérifié antérieur à la compromission).
- **Surveillance renforcée** pendant 30-90 jours.
- Re-tester les **règles de détection** (le SIEM aurait dû voir).

### 22.8 Post-incident

- **Postmortem** sans blâme : qu'est-ce qui a marché, qu'est-ce qui n'a pas marché ?
- Mise à jour de la **documentation** et des **runbooks**.
- **Notification CNIL** sous 72h si données personnelles (RGPD article 33).
- **Notification ANSSI** pour les OIV/OSE (NIS2).
- **Plainte** auprès des autorités si délit constaté.
- **Communication** transparente aux parties prenantes.

### 22.9 Cas type : ransomware Linux

```
1. Vérifier l'absence de propagation (autres serveurs sains ?)
2. Identifier la souche (NoEscape, BlackCat, etc.)
3. NE PAS PAYER (pas de garantie + finance le crime)
4. Restaurer depuis backup offline
5. Identifier la porte d'entrée et la fermer
6. Notifier (CNIL, autorités, clients impactés)
7. Renforcer : EDR, segmentation, MFA partout
```

---

## 23. Conformité et réglementation

### 23.1 Cadres réglementaires

| Réglementation | Périmètre | Sanction |
|----------------|-----------|----------|
| **RGPD** (UE) | Données personnelles | Jusqu'à 4% CA mondial ou 20M€ |
| **NIS2** (UE 2024) | Cyber des entités essentielles | 10M€ ou 2% CA |
| **DORA** (UE 2025) | Résilience opérationnelle finance | Élevée |
| **PCI-DSS** | Données de carte bancaire | Frais bancaires + perte certifs |
| **HDS** (FR) | Données santé | Retrait certification |
| **HIPAA** (US) | Santé | Civile et pénale |
| **SOX** (US) | Reporting financier | Pénale dirigeants |

### 23.2 Référentiels techniques

- **CIS Benchmarks** : guides détaillés par OS et applicatif.
- **ANSSI BP-028** : durcissement Linux français.
- **NIST 800-53** : contrôles de sécurité US.
- **ISO 27001/27002** : système de management de la sécurité.
- **MITRE ATT&CK** : matrice des TTP (tactiques, techniques, procédures).
- **OWASP Top 10** : risques web (et CI/CD, API).

### 23.3 Outils de conformité

```bash
# Audit
sudo lynis audit system
sudo oscap xccdf eval --profile xccdf_org.ssgproject.content_profile_anssi_bp28_high \
    --report report.html /usr/share/xml/scap/ssg/content/ssg-debian12-ds.xml

# Configuration via Ansible (rôles DevSec)
ansible-galaxy install dev-sec.os-hardening
ansible-galaxy install dev-sec.ssh-hardening
```

---

## 24. Annexes et ressources

### 24.1 Distributions de référence (avril 2026)

| Distrib | Version stable | Support jusqu'à | Cas d'usage |
|---------|---------------|-----------------|-------------|
| Debian 12 (Bookworm) | 12.x | 2028 | Serveurs polyvalents |
| Debian 13 (Trixie) | dev/test | TBD | À venir |
| Ubuntu 24.04 LTS | 24.04 | 2034 (ESM) | Polyvalent, cloud |
| Ubuntu 22.04 LTS | 22.04 | 2032 (ESM) | Stable, large déploiement |
| RHEL 9 | 9.x | 2032 | Entreprise critique |
| Rocky Linux 9 | 9.x | 2032 | Alternative gratuite RHEL |
| Fedora | 41+ | 13 mois | Lab, dev |
| openSUSE Leap 15 | 15.x | jusqu'à fin du cycle | Entreprise |
| Alpine Linux | 3.x | par version | Conteneurs, embarqué |

> Les versions évoluent rapidement : vérifiez avant de déployer.

### 24.2 Cheat sheets indispensables

**SSH** :
```bash
ssh-keygen -t ed25519 -C "comment"
ssh-copy-id user@host
ssh -L 8080:localhost:80 user@host           # Tunnel local
ssh -R 8080:localhost:80 user@host           # Tunnel inverse
ssh -D 1080 user@host                        # SOCKS proxy
```

**Diagnostic réseau express** :
```bash
ip a && ip r && ss -tunlp && ping -c 2 8.8.8.8 && dig +short google.com
```

**Diagnostic système express** :
```bash
uptime && free -h && df -h && systemctl --failed && journalctl -p err -b --no-pager | tail -20
```

**Audit sécurité express** :
```bash
sudo last -10
sudo lastb -10
sudo grep "Failed password" /var/log/auth.log | tail
awk -F: '$3 == 0' /etc/passwd
sudo find / -perm -4000 -type f 2>/dev/null
sudo systemctl list-unit-files --state=enabled --type=service
```

### 24.3 Ressources en ligne

**Documentation**
- Manuels en ligne : https://man7.org/linux/man-pages/
- The Linux Documentation Project : https://tldp.org/
- ArchWiki (excellent pour toutes distrib) : https://wiki.archlinux.org/

**Sécurité**
- ANSSI : https://cyber.gouv.fr
- CIS Benchmarks : https://www.cisecurity.org/cis-benchmarks
- MITRE ATT&CK : https://attack.mitre.org/
- CVE Details : https://cve.mitre.org/

**Communautés FR**
- root.me : https://www.root-me.org/
- Linuxfr.org : https://linuxfr.org/
- Stéphane Robert (DevSecOps complet) : https://blog.stephane-robert.info/

**Veille**
- LWN.net : https://lwn.net/
- Phoronix : https://www.phoronix.com/
- Hacker News : https://news.ycombinator.com/

### 24.4 Certifications recommandées

| Certification | Niveau | Public | Coût indicatif |
|---------------|--------|--------|----------------|
| **LPIC-1 / LPIC-2 / LPIC-3** | Junior → Expert | Admins | ~200€/exam |
| **LFCS** (Linux Foundation) | Junior | Admins polyvalents | ~300$ |
| **LFCE** | Confirmé | Admins | ~300$ |
| **RHCSA / RHCE** | Junior / Confirmé | Écosystème Red Hat | ~400$/exam |
| **CKA / CKAD / CKS** | Confirmé | Kubernetes | ~395$ |
| **OSCP** | Confirmé | Pentesters | ~1600$ |
| **CEH** | Junior pentest | Sécu offensive | ~1200$ |
| **CISSP** | Senior | Sécu management | ~750$ |
| **GCFA / GCIA** (SANS) | Expert | Forensique / SOC | $$$$ |

### 24.5 Outils à connaître absolument

**CLI productivité** : `tmux`, `htop`, `bat`, `eza` (ls moderne), `fd`, `ripgrep`, `fzf`, `jq`, `yq`, `httpie`.
**Édition** : `vim`/`neovim`, `nano`, `micro`.
**Monitoring** : `prometheus`, `grafana`, `node_exporter`, `netdata`.
**Logs** : `loki`, `vector`, `fluentbit`, `rsyslog`.
**Sauvegarde** : `borgbackup`, `restic`, `duplicity`.
**Déploiement** : `ansible`, `terraform`, `pulumi`.
**Conteneurs** : `podman`, `docker`, `buildah`, `skopeo`.
**Sécurité** : `lynis`, `chkrootkit`, `rkhunter`, `aide`, `wazuh`, `crowdsec`.

### 24.6 Glossaire

| Terme | Définition |
|-------|-----------|
| **ACL** | Access Control List, permissions fines |
| **CVE** | Common Vulnerabilities and Exposures (identifiant de faille) |
| **EDR** | Endpoint Detection and Response |
| **FHS** | Filesystem Hierarchy Standard |
| **HIDS** | Host Intrusion Detection System |
| **HSM** | Hardware Security Module |
| **IaC** | Infrastructure as Code |
| **IDS / IPS** | Intrusion Detection / Prevention System |
| **LVM** | Logical Volume Manager |
| **MAC** | Mandatory Access Control |
| **MFA** | Multi-Factor Authentication |
| **PAM** | Pluggable Authentication Modules |
| **PKI** | Public Key Infrastructure |
| **RAID** | Redundant Array of Independent Disks |
| **RBAC** | Role-Based Access Control |
| **SBOM** | Software Bill of Materials |
| **SELinux** | Security-Enhanced Linux (MAC) |
| **SIEM** | Security Information and Event Management |
| **SOAR** | Security Orchestration, Automation and Response |
| **SUID** | Set User ID (bit de permission spécial) |
| **TLS** | Transport Layer Security (successeur de SSL) |
| **WAF** | Web Application Firewall |

---

## 🎓 Conclusion

Vous avez maintenant un panorama complet de l'administration Linux et de la sécurité, depuis vos premières commandes jusqu'aux pratiques avancées de réponse à incident dans des secteurs régulés.

**Les 10 commandements de l'admin Linux sécurisé** :

1. 🔒 **Tu chiffreras** les données sensibles au repos et en transit.
2. 🔑 **Tu utiliseras des clés SSH** et désactiveras l'authentification par mot de passe.
3. 👤 **Tu n'utiliseras pas root** au quotidien : `sudo` ciblé.
4. 🛡️ **Tu activeras un MAC** (SELinux ou AppArmor) en mode enforcing.
5. 🚪 **Tu fermeras les ports** inutiles : default deny.
6. 📦 **Tu mettras à jour** régulièrement et automatiserais les patchs de sécurité.
7. 💾 **Tu sauvegarderas** selon la règle 3-2-1 et tu testeras les restaurations.
8. 📜 **Tu centraliseras les logs** et activeras `auditd`.
9. 🔍 **Tu auditeras** régulièrement (Lynis, OpenSCAP, scans de vulnérabilités).
10. 📚 **Tu documenteras** et tu versionneras tout (IaC, runbooks, postmortems).

> *"La sécurité n'est pas un produit, c'est un processus."* — Bruce Schneier

Bonne administration, et restez curieux ! 🐧



