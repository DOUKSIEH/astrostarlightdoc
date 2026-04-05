---
title: "🐳 Guide Ansible : Configuration centralisée de serveurs et d'applications"
description: "📘 Documentation Ansible — Du débutant à la maîtrise"
created: "2026-04-04"
# updated: "2026-04-04"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"

---

<!-- # 📘 Documentation Ansible — Du débutant à la maîtrise -->

> **À qui s'adresse ce guide ?**
> À toute personne qui n'a jamais touché à Ansible et qui veut apprendre étape par étape, sans brûler les étapes. Ce guide suit la structure du livre *Ansible* (Editions ENI) et la complète avec des exemples concrets, commentés et prêts à l'emploi.

---

## Conventions employées dans ce guide

| Notation | Signification |
|---|---|
| **Gras** | Désigne un fichier ou met en évidence un passage important |
| `code` | Exemples de code dans le texte (YAML, Python, Bash) |
| `$ ./commande.sh` | Commande à lancer dans le terminal |
| Blocs de code | Exemples complets de code source, directement réutilisables |

---

## Table des matières

### Avant-propos — Démarrer avec Ansible
1. [C'est quoi Ansible ? La métaphore simple](#1-cest-quoi-ansible--la-métaphore-simple)
2. [Histoire et origine](#2-histoire-et-origine)
3. [Architecture — Comment ça marche ?](#3-architecture--comment-ça-marche-)
4. [Les concepts fondamentaux](#4-les-concepts-fondamentaux)
5. [Installation d'Ansible](#5-installation-dansible)

### Partie I — Utilisation d'Ansible
6. [Découverte de l'inventaire](#6-découverte-de-linventaire-statique)
7. [Inventaires : notions avancées et dynamiques](#7-inventaires--notions-avancées-et-dynamiques)
8. [Fonctionnement d'un Playbook](#8-fonctionnement-dun-playbook)
9. [Les Variables](#9-les-variables)
10. [Les Conditions (when)](#10-les-conditions-when)
11. [Les Boucles (loop)](#11-les-boucles-loop)
12. [Les Handlers](#12-les-handlers)
13. [Les Templates Jinja2 et filtres](#13-les-templates-jinja2-et-filtres)
14. [Introduction à la notion de rôle](#14-introduction-aux-rôles)
15. [Rôles avancés — Exemple complet OpenLDAP](#15-rôles-avancés--exemple-complet-openldap)
16. [Playbooks, rôles et notions avancées](#16-playbooks-rôles-et-notions-avancées)
17. [Inclusion et réutilisation du code](#17-inclusion-et-réutilisation-du-code)
18. [Ansible Galaxy et Collections](#18-ansible-galaxy-et-collections)
19. [Gestion des fichiers](#19-gestion-des-fichiers)
20. [Scalabilité et Rolling Update](#20-scalabilité-et-rolling-update)
21. [Stratégie d'exécution et optimisation (Mitogen)](#21-stratégie-dexécution-et-optimisation-mitogen)
22. [Administration Windows avec Ansible](#22-administration-windows-avec-ansible)
23. [Tester Ansible avec Podman — Conteneurs et Systemd](#23-tester-ansible-avec-podman--conteneurs-et-systemd)
24. [Ansible : virtualisation, Cloud et Kubernetes](#24-ansible--virtualisation-cloud-et-kubernetes)

### Partie II — Tests Ansible
25. [Tests Ansible — Vue d'ensemble](#25-tester-ses-playbooks--vue-densemble)
26. [Ansible-lint — Qualité du code](#26-ansible-lint--qualité-du-code)
27. [Molecule — Tests d'intégration avec Docker et Podman](#27-molecule--tests-dintégration-avec-docker-et-podman)

### Partie III — Sécurité et secrets
28. [Sécurité et bonnes pratiques](#28-sécurité-et-bonnes-pratiques)
29. [Ansible Vault — Protéger ses secrets](#29-ansible-vault--protéger-ses-secrets)

### Partie IV — Débogage et gestion des erreurs
30. [Débogage des playbooks](#30-débogage-des-playbooks)
31. [Gestion des échecs et Rollbacks (Blocks)](#31-gestion-des-échecs-et-rollbacks-blocks)

### Partie V — Personnalisation d'Ansible
32. [Sortie Ansible et centralisation (Callbacks, ARA, Syslog)](#32-sortie-ansible-et-centralisation-callbacks-ara-syslog)
33. [Écriture de modules Ansible personnalisés](#33-écriture-de-modules-ansible-personnalisés)
34. [Écriture de filtres Jinja2 et mécanisme de lookup](#34-écriture-de-filtres-jinja2-et-lookups-personnalisés)
35. [Les plugins Action Ansible](#35-les-plugins-action-ansible)

### Partie VI — Intégration, UI et écosystème
36. [Intégration CI/CD (GitHub Actions / GitLab CI)](#36-intégration-cicd-github-actions--gitlab-ci)
37. [Semaphore — Interface web légère pour Ansible](#37-semaphore--interface-web-légère-pour-ansible)
38. [AWX / Ansible Tower — Plateforme enterprise](#38-awx--ansible-tower--plateforme-enterprise)
39. [Outils utiles de l'écosystème Ansible](#39-outils-utiles-de-lécosystème-ansible)
40. [Résumé des bonnes pratiques et checklist](#40-résumé-des-bonnes-pratiques-et-checklist)
41. [Glossaire](#41-glossaire)

---

# AVANT-PROPOS — DÉMARRER AVEC ANSIBLE

---

## 1. C'est quoi Ansible ? La métaphore simple

Imaginons que vous êtes le chef d'une grande cuisine. Vous avez 50 cuisiniers (vos serveurs). Au lieu d'aller voir chacun d'eux un par un pour leur expliquer la recette, vous écrivez **une seule recette** sur une feuille, et **tous les cuisiniers la suivent en même temps**.

C'est exactement ce que fait **Ansible** : il vous permet d'écrire des "recettes" (appelées **playbooks**) pour configurer, déployer et gérer des dizaines ou des centaines de serveurs Linux **en même temps**, depuis **un seul endroit**, sans avoir à vous connecter manuellement à chacun.

### Les 3 super-pouvoirs d'Ansible

| Pouvoir | Ce que ça veut dire |
|---|---|
| **Agent-less** | Pas besoin d'installer un logiciel sur chaque serveur. Ansible utilise SSH, c'est tout. |
| **Idempotent** | On peut relancer la même recette 10 fois : le résultat sera toujours le même, sans dommage. |
| **YAML** | Les recettes sont écrites dans un langage très lisible, presque comme du français. |

### Ansible vs faire les choses à la main

```
Sans Ansible :
  Connexion SSH sur serveur 1 → apt install nginx → configuration → restart
  Connexion SSH sur serveur 2 → apt install nginx → configuration → restart
  ... (50 fois, avec des erreurs humaines à chaque étape)

Avec Ansible :
  Écrire le playbook une fois → ansible-playbook deploy.yml
  → Ansible s'occupe de tout, en parallèle, sans erreur
```

### À quoi sert Ansible concrètement ?

- **Automatiser les déploiements** : déployer une nouvelle version sur 100 serveurs en un clic
- **Gérer les configurations** : s'assurer que tous les serveurs ont la même configuration (SSH, firewall, NTP...)
- **Orchestrer des tâches complexes** : enchaîner des opérations dans un ordre précis sur plusieurs machines
- **Réagir aux événements** : mode "event-driven" pour répondre aux alertes automatiquement
- **Compléter Terraform** : Terraform crée les VMs dans le cloud, Ansible les configure ensuite

---

## 2. Histoire et origine

- **2012** : Michael DeHaan crée Ansible. Objectif : un outil d'automatisation **simple**, **sans agent**, et **sécurisé**. DeHaan connaissait les limites des outils existants (Puppet, Chef) : trop complexes, nécessitant des agents sur chaque machine.
- **2015** : Red Hat rachète Ansible, renforçant sa crédibilité et son développement.
- **Aujourd'hui** : Ansible est l'un des outils DevOps les plus demandés dans les offres d'emploi mondiales. Il fait partie de l'**Ansible Automation Platform** de Red Hat.

> Le nom "Ansible" vient d'un roman de science-fiction. Un "ansible" est un appareil de communication instantanée entre des planètes distantes. Parfait pour un outil qui parle à des milliers de serveurs simultanément.

---

## 3. Architecture — Comment ça marche ?

```
┌─────────────────────────────────────────────────────┐
│              VOTRE MACHINE (Control Node)            │
│                                                      │
│  ┌──────────┐   ┌──────────┐   ┌─────────────────┐  │
│  │ Playbook │   │Inventaire│   │  ansible.cfg    │  │
│  │ (YAML)   │   │(hôtes)   │   │  (config)       │  │
│  └──────────┘   └──────────┘   └─────────────────┘  │
│                                                      │
│           $ ansible-playbook -i hosts site.yml       │
└──────────────────┬───────────────────────────────────┘
                   │  SSH (port 22) — connexion chiffrée
          ┌────────┼────────┬─────────┐
          ▼        ▼        ▼         ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
    │ Serveur 1│ │ Serveur 2│ │ Serveur 3│ │ Serveur N│
    │ web1     │ │ web2     │ │ db1      │ │ ...      │
    └──────────┘ └──────────┘ └──────────┘ └──────────┘
    Prérequis : SSH activé + Python minimal installé
```

### Ce qui se passe concrètement (étape par étape)

1. Vous lancez `ansible-playbook -i hosts site.yml`
2. Ansible lit votre **playbook** (la recette YAML)
3. Il consulte l'**inventaire** (la liste de vos serveurs et leurs groupes)
4. Il collecte les **facts** (infos sur chaque serveur : OS, RAM, IP...)
5. Il se connecte en **SSH** à chaque serveur (en parallèle par défaut)
6. Il envoie de petits scripts Python (les **modules**) via SSH
7. Les modules s'exécutent et retournent un résultat JSON
8. Ansible affiche les résultats (`ok`, `changed`, `failed`)
9. Les scripts temporaires sont **supprimés automatiquement**

> **Prérequis sur les serveurs cibles** : SSH activé + Python minimal. C'est tout.

---

## 4. Les concepts fondamentaux

### 4.1 Le Control Node

C'est **votre machine** : laptop, serveur CI/CD, VM dédiée. Ansible s'installe uniquement sur Linux ou macOS.

### 4.2 L'Inventaire

La **liste de vos serveurs**, regroupés en groupes logiques.

```ini
[webservers]
web1.monsite.com
web2.monsite.com

[dbservers]
db1.monsite.com
```

### 4.3 Le Playbook

Votre **recette** YAML : un ou plusieurs plays décrivant ce qu'Ansible doit faire.

### 4.4 Le Module

Une **brique fonctionnelle** intégrée dans Ansible. Chaque tâche utilise un module.

| Module | Usage |
|---|---|
| `ansible.builtin.apt` | Paquets Debian/Ubuntu |
| `ansible.builtin.yum` / `dnf` | Paquets RedHat/CentOS |
| `ansible.builtin.service` | Gérer les services |
| `ansible.builtin.copy` | Copier des fichiers |
| `ansible.builtin.file` | Créer/supprimer fichiers et répertoires |
| `ansible.builtin.template` | Déployer des fichiers avec variables |
| `ansible.builtin.user` | Gérer les utilisateurs |
| `ansible.builtin.git` | Cloner des dépôts Git |
| `ansible.builtin.debug` | Afficher messages et variables |
| `ansible.builtin.shell` | Exécuter des commandes shell (dernier recours) |

### 4.5 Le Rôle

Une **bibliothèque réutilisable** de tâches, handlers et templates. On crée un rôle une fois, on l'utilise partout.

### 4.6 Le Handler

Tâche spéciale qui ne s'exécute **que si une autre tâche a provoqué un changement**. Exemple : redémarre Apache seulement si sa configuration a changé.

### 4.7 Le Template (Jinja2)

Fichier modèle avec des variables (extension `.j2`). Ansible remplace les variables avant de copier le fichier sur le serveur.

### 4.8 Register, Notify, Tag

- **register** : stocke le résultat d'une tâche dans une variable
- **notify** : déclenche un handler si la tâche a changé quelque chose
- **tag** : étiquette pour exécuter sélectivement certaines tâches

---

## 5. Installation d'Ansible

Ansible s'installe sur **Linux ou macOS uniquement** (Windows avec WSL2 fonctionne très bien).

### Méthode recommandée : pipx

`pipx` installe Ansible dans un environnement Python isolé, sans polluer votre système.

**Sur Ubuntu/Debian :**
```bash
sudo apt update && sudo apt install pipx
pipx ensurepath
source ~/.bashrc
pipx install --include-deps ansible
```

**Sur macOS :**
```bash
brew install pipx
pipx ensurepath
pipx install --include-deps ansible
```

**Sur Fedora :**
```bash
sudo dnf install pipx
pipx ensurepath
pipx install --include-deps ansible
```

**Sur Arch Linux :**
```bash
sudo pacman -S python-pipx
pipx ensurepath
pipx install --include-deps ansible
```

### Autocomplétion Bash

```bash
sudo pip3 install argcomplete
sudo activate-global-python-argcomplete
```

### Vérifier l'installation

```bash
ansible --version
# ansible [core 2.16.x]
# python version = 3.x.x
```

### Premier test en local

```bash
ansible all -i "localhost," -c local -m shell -a 'echo Bonjour Ansible !'
# localhost | SUCCESS | rc=0 >>
# Bonjour Ansible !
```

### Le fichier ansible.cfg

```ini
# ansible.cfg — à placer à la racine de votre projet
[defaults]
inventory         = hosts
remote_user       = ansible_deployer
host_key_checking = True
gathering         = smart
stdout_callback   = yaml
forks             = 10

[ssh_connection]
pipelining        = True
ssh_args          = -o ControlMaster=auto -o ControlPersist=60s
```

---

# PARTIE I — UTILISATION D'ANSIBLE

---

## 6. Découverte de l'inventaire statique

L'inventaire est le **cœur d'Ansible** : il décrit quels serveurs gérer et comment les regrouper.

### Groupes par défaut

Ansible crée automatiquement deux groupes :
- `all` : contient TOUS les hôtes de l'inventaire
- `ungrouped` : hôtes non assignés à un groupe explicite

### Format INI (le plus courant)

```ini
# hosts — inventaire statique

# Hôte standalone (pas dans un groupe)
jump.example.com

# Groupe webservers
[webservers]
web1.example.com
web2.example.com
web3.example.com

# Groupe dbservers
[dbservers]
db1.example.com
db2.example.com

# Variables pour tout un groupe
[webservers:vars]
http_port=80
ansible_user=deployer
nginx_worker_processes=4

# Variables pour un hôte spécifique (inline)
[dbservers]
db1.example.com mysql_max_connections=200
db2.example.com mysql_max_connections=500

# Groupe de groupes (méta-groupe)
[production:children]
webservers
dbservers

# Notation abrégée pour des séries de machines
[loadbalancers]
lb[01:03].example.com   # = lb01, lb02, lb03

# Avec des lettres
[storage]
nas-[a:c].example.com   # = nas-a, nas-b, nas-c
```

### Mode de connexion aux machines

```ini
# Connexion SSH standard (défaut)
web1.example.com ansible_connection=ssh ansible_user=deployer

# Connexion locale (pour le control node lui-même)
localhost ansible_connection=local

# Connexion via Docker
container1 ansible_connection=docker

# Connexion WinRM (Windows)
winserver1.example.com ansible_connection=winrm ansible_winrm_transport=ntlm

# Port SSH personnalisé
web-special.example.com ansible_port=2222
```

### Format YAML (plus structuré)

```yaml
# inventory.yml
all:
  children:
    webservers:
      hosts:
        web1.example.com:
          http_port: 80
          nginx_worker_processes: 4
        web2.example.com:
          http_port: 8080
    dbservers:
      hosts:
        db1.example.com:
          mysql_max_connections: 500
    production:
      children:
        webservers:
        dbservers:
```

### Séparer les variables (bonne pratique absolue)

```
mon_projet/
├── group_vars/
│   ├── all.yml              # Variables pour TOUS les serveurs
│   ├── all/
│   │   ├── vars.yml         # Variables non secrètes
│   │   └── vault.yml        # Variables chiffrées (Vault)
│   ├── webservers.yml       # Variables du groupe webservers
│   └── dbservers.yml
├── host_vars/
│   └── web1.example.com.yml # Variables spécifiques à un hôte
└── hosts
```

```yaml
# group_vars/all.yml
ansible_user: deployer
ntp_server: ntp.example.com
timezone: Europe/Paris

# group_vars/webservers.yml
nginx_port: 80
ssl_enabled: true
nginx_max_connections: 1000
```

### Hiérarchie des variables (priorité, du plus faible au plus fort)

```
1.  role defaults/main.yml          (le plus facile à surcharger)
2.  group_vars/all
3.  group_vars/<groupe>
4.  host_vars/<hôte>
5.  vars dans le playbook
6.  vars_files dans le playbook
7.  register (résultat d'une tâche)
8.  extra_vars (-e depuis la ligne de commande)   (la plus forte)
```

### Gestion des différents inventaires (staging / prod)

```
inventories/
├── staging/
│   ├── hosts
│   └── group_vars/
│       └── all.yml
└── production/
    ├── hosts
    └── group_vars/
        └── all.yml
```

```bash
# Déployer en staging
ansible-playbook -i inventories/staging/hosts site.yml

# Déployer en production
ansible-playbook -i inventories/production/hosts site.yml
```

### Fusion d'inventaires

Ansible peut fusionner plusieurs sources d'inventaire :

```bash
# Utiliser un répertoire contenant plusieurs fichiers d'inventaire
ansible-playbook -i inventories/ site.yml
# Ansible lit TOUS les fichiers du répertoire inventories/
```

### Création de groupes temporaires

```yaml
tasks:
  # Ajouter dynamiquement un hôte à un groupe pendant le play
  - name: Ajouter un hôte au groupe serveurs_frais
    ansible.builtin.add_host:
      name: "{{ new_server_ip }}"
      groups: serveurs_frais
      ansible_user: ubuntu

  # Utiliser ce groupe dans un play suivant
- name: Configurer les nouveaux serveurs
  hosts: serveurs_frais
  tasks:
    - name: Installer les paquets de base
      ansible.builtin.apt:
        name: [curl, git, vim]
        state: present
```

### Tester son inventaire

```bash
ansible-inventory -i hosts --list     # JSON de l'inventaire complet
ansible-inventory -i hosts --graph    # Vue arborescente
ansible all -i hosts -m ping          # Pinguer tout le monde
ansible webservers -i hosts -m ping   # Pinguer un groupe
ansible all -i hosts -m setup         # Voir tous les facts
ansible web1 -i hosts -m setup -a "filter=ansible_distribution*"
```

---

## 7. Inventaires : notions avancées et dynamiques

### Chiffrement des identifiants de connexion

Les identifiants SSH ne doivent jamais être en clair dans l'inventaire. On les chiffre avec Ansible Vault.

```yaml
# group_vars/all/vault.yml (chiffré avec ansible-vault encrypt)
# Avant chiffrement :
vault_ansible_password: MonMotDePasseSSH
vault_ansible_become_pass: MonMotDePasseSudo

# group_vars/all/vars.yml (non chiffré)
ansible_password: "{{ vault_ansible_password }}"
ansible_become_pass: "{{ vault_ansible_become_pass }}"
```

```bash
ansible-vault encrypt group_vars/all/vault.yml
ansible-playbook -i hosts site.yml --ask-vault-pass
```

### Mécanismes de chiffrement alternatifs (lookup)

Au lieu de Vault, on peut récupérer les secrets depuis d'autres sources :

```yaml
# Depuis HashiCorp Vault
vars:
  db_password: "{{ lookup('hashi_vault', 'secret=secret/db:password') }}"

# Depuis KeePass (plugin personnalisé)
vars:
  db_password: "{{ lookup('keepass', 'path=Servers/DB password=master.kdbx') }}"

# Depuis les variables d'environnement
vars:
  api_key: "{{ lookup('env', 'API_KEY') }}"
```

### Inventaires dynamiques — AWS EC2

```bash
pip3 install boto boto3
```

```yaml
# aws_ec2.yml
plugin: aws_ec2
regions:
  - eu-west-1
  - eu-central-1
filters:
  instance-state-name: running
  tag:Environment: production
keyed_groups:
  - key: tags.Role
    prefix: role
  - key: placement.region
    prefix: aws_region
hostnames:
  - tag:Name
  - private-ip-address
```

```bash
ansible-inventory -i aws_ec2.yml --graph
ansible-playbook -i aws_ec2.yml site.yml
```

### Inventaires dynamiques — Docker

```bash
pip3 install docker-py
```

```yaml
# docker.yml
defaults:
  host: unix:///var/run/docker.sock
# Pour plusieurs hôtes Docker :
# hosts:
#   - host: tcp://192.168.0.15:4243
#   - host: tcp://192.168.0.16:4243
```

```bash
./docker.py --pretty

# Les conteneurs Docker n'ont pas SSH → utiliser le connecteur Docker
ansible -m ping -i ./docker.py image_centos/systemd \
  -e ansible_connection=docker
```

> **Note importante** : Les conteneurs Docker n'ont généralement pas de démon SSH. Utilisez `-e ansible_connection=docker` pour vous connecter via le démon Docker directement. Assurez-vous que Python est installé dans le conteneur.

### Inventaires dynamiques — VMware ESX

```bash
pip3 install pyvmomi
```

```ini
# vmware_inventory.ini
[vmware]
server=192.168.1.100
username=root
password=XXXX
validate_certs=False
```

```bash
./vmware_inventory.py --pretty
ansible -m ping -i vmware_inventory.py MON_FOLDER_VMWARE
```

> Le script d'inventaire VMware crée automatiquement des groupes basés sur le type de VM et les folders VMware.

### Inventaires dynamiques — Nagios/Naemon/Shinken

```ini
# nagios_livestatus.ini
[production]
livestatus_uri=tcp:mon-nagios.example.com:6557
```

```bash
chmod +x nagios_livestatus.py
./nagios_livestatus.py --pretty --list
ansible -m ping -i nagios_livestatus.py linux-servers
```

### Fonctionnement des plugins d'inventaire génériques

Le format `auto` permet à Ansible de détecter automatiquement le bon plugin selon le contenu du fichier.

```yaml
# mon_inventaire.yml — Ansible détecte le plugin grâce au champ "plugin"
plugin: aws_ec2
regions: [eu-west-1]
```

```bash
# Lister les plugins d'inventaire disponibles
ansible-doc -t inventory -l

# Voir la doc d'un plugin
ansible-doc -t inventory aws_ec2

# Utiliser la commande ansible-inventory
ansible-inventory -i mon_inventaire.yml --list
ansible-inventory -i mon_inventaire.yml --graph
ansible-inventory -i mon_inventaire.yml --host web1.example.com
```

### Écrire son propre plugin d'inventaire Python

Si aucun plugin existant ne correspond, on peut écrire le sien. Exemple : lire un fichier `.properties` Java.

```ini
# prop2inv.properties
db.host=mysql1
db.user=test
db.password=password_test
apache.hosts=apache1,apache2
```

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Plugin d'inventaire personnalisé : lit un fichier .properties Java

from ansible.plugins.inventory import BaseInventoryPlugin

class InventoryModule(BaseInventoryPlugin):
    NAME = 'prop2inv'

    def parse(self, inventory, loader, path, cache=True):
        super(InventoryModule, self).parse(inventory, loader, path, cache)

        config = self._read_config_data(path)
        properties_file = config.get("properties_file", "prop2inv.properties")

        # Lire le fichier de properties
        properties = {}
        with open(properties_file) as p:
            for line in p.readlines():
                if '=' in line:
                    k, v = line.split('=', 1)
                    properties[k.strip()] = v.strip()

        # Créer les groupes
        self.inventory.add_group("mysql")
        self.inventory.add_group("apache")

        # Ajouter les hôtes dans les groupes
        if properties.get('db.host'):
            for host in properties.get('db.host').split(','):
                self.inventory.add_host(host.strip(), group="mysql")

        if properties.get('apache.hosts'):
            for host in properties.get('apache.hosts').split(','):
                self.inventory.add_host(host.strip(), group="apache")

        # Les '.' ne sont pas valides dans les noms de variables Ansible
        # → Remplacer par '_'
        for var in ['db.user', 'db.password']:
            if properties.get(var):
                ansible_var = var.replace('.', '_')
                self.inventory.set_variable(
                    "mysql", ansible_var, properties.get(var)
                )
```

```yaml
# prop2inv.yml — fichier d'inventaire qui référence le plugin
plugin: prop2inv
# properties_file: prop2inv.properties  # Optionnel
```

```bash
export ANSIBLE_INVENTORY_PLUGINS=$PWD
ansible-inventory -i prop2inv.yml --list
# Résultat attendu :
# {
#   "mysql": { "hosts": ["mysql1"], "vars": {"db_user": "test", ...} },
#   "apache": { "hosts": ["apache1", "apache2"] }
# }

# Test avec Ansible
ansible -i prop2inv.yml -m debug -a var=groups localhost
ansible -i prop2inv.yml -m debug -a var=db_user all
```

---

## 8. Fonctionnement d'un Playbook

### Structure complète d'un playbook

```yaml
---                           # Début de fichier YAML (obligatoire)
- name: Configurer les serveurs web   # Nom du play
  hosts: webservers           # Groupe(s) ciblé(s)
  become: true                # Élévation de privilèges (sudo)
  gather_facts: true          # Collecter les infos du serveur

  vars:
    app_name: monsite
    app_port: 8080

  tasks:
    - name: Installer nginx   # Toujours nommer ses tâches !
      ansible.builtin.apt:
        name: nginx
        state: present        # present | absent | latest

    - name: Démarrer nginx
      ansible.builtin.service:
        name: nginx
        state: started
        enabled: true         # Démarrage automatique au boot
```

### Anatomie d'une tâche — tous les paramètres

```yaml
tasks:
  - name: Exemple de tâche complète
    ansible.builtin.apt:              # Module à appeler (FQCN recommandé)
      name: apache2
      state: present
    become: true                      # Sudo pour cette tâche uniquement
    become_user: root                 # Utilisateur cible (défaut: root)
    become_method: sudo               # Méthode : sudo | su | doas
    when: ansible_os_family == "Debian"  # Condition d'exécution
    notify: restart apache            # Déclencher un handler si changed
    register: install_result          # Stocker le résultat
    tags:
      - apache
      - install
    ignore_errors: false              # Bloquer si erreur (défaut)
    retries: 3                        # Réessayer si échec
    delay: 5                          # Secondes entre essais
    check_mode: false                 # Exclure du mode --check
    changed_when: false               # Forcer le statut "ok" toujours
    failed_when:                      # Condition personnalisée d'échec
      - install_result.rc != 0
    no_log: false                     # Cacher les sorties (pour secrets)
    environment:                      # Variables d'environnement
      HTTP_PROXY: http://proxy:8080
```

### Le moteur de template Jinja dans les playbooks

Jinja2 n'est pas seulement pour les templates — il est utilisé partout dans les playbooks :

```yaml
tasks:
  # Dans les valeurs de paramètres
  - name: Installer le paquet
    ansible.builtin.apt:
      name: "{{ package_name }}"    # Variable simple

  # Dans les conditions
  - name: Tâche conditionnelle
    ansible.builtin.debug:
      msg: "Ubuntu 22+"
    when: ansible_distribution_major_version | int >= 22

  # Dans les boucles
  - name: Boucle sur les interfaces réseau
    ansible.builtin.debug:
      msg: "Interface {{ item.key }} : {{ item.value.ipv4.address | default('pas d IP') }}"
    loop: "{{ ansible_interfaces | map('extract', ansible_facts.interfaces | default({})) | list }}"

  # Dans les noms de tâches (depuis Ansible 2.9)
  - name: "Installer {{ package_name }} sur {{ inventory_hostname }}"
    ansible.builtin.apt:
      name: "{{ package_name }}"
```

### Délégation de tâche

La délégation permet d'exécuter une tâche sur un hôte différent de la cible principale.

```yaml
tasks:
  # Exécuter sur le control node (localhost)
  - name: Créer un enregistrement DNS
    ansible.builtin.uri:
      url: https://api.dns.example.com/records
      method: POST
      body_format: json
      body:
        name: "{{ inventory_hostname }}"
        ip: "{{ ansible_default_ipv4.address }}"
    delegate_to: localhost

  # Exécuter sur un serveur de monitoring
  - name: Désactiver les alertes pendant la maintenance
    ansible.builtin.uri:
      url: "http://nagios/downtime"
      method: POST
    delegate_to: monitoring.example.com
    delegate_facts: true   # Les facts collectés s'appliquent à l'hôte délégué

  # Exécuter UNE SEULE FOIS depuis la première machine
  - name: Créer le schéma de base de données
    ansible.builtin.shell: php artisan migrate
    run_once: true
    delegate_to: web1.example.com
```

### Mécanisme des tags

```yaml
---
- name: Configuration complète
  hosts: webservers
  tasks:
    - name: Installer Apache
      ansible.builtin.apt:
        name: apache2
        state: present
      tags:
        - apache
        - install

    - name: Configurer Apache
      ansible.builtin.template:
        src: apache.conf.j2
        dest: /etc/apache2/apache2.conf
      tags:
        - apache
        - configure

    - name: Mettre à jour le système
      ansible.builtin.apt:
        upgrade: yes
        update_cache: yes
      tags:
        - update
        - never   # Tag spécial : jamais exécuté sauf si explicitement demandé

    - name: Tâche toujours exécutée
      ansible.builtin.debug:
        msg: "Je tourne toujours"
      tags:
        - always  # Tag spécial : toujours exécuté même sans --tags
```

```bash
# Lister les tags d'un playbook
ansible-playbook site.yml --list-tags

# Exécuter seulement les tâches tagguées "apache"
ansible-playbook site.yml --tags "apache"

# Exécuter toutes les tâches SAUF celles tagguées "update"
ansible-playbook site.yml --skip-tags "update"

# Exécuter les tâches tagguées "never"
ansible-playbook site.yml --tags "never,update"
```

### Exécuter un playbook

```bash
ansible-playbook -i hosts site.yml                      # Exécuter
ansible-playbook -i hosts site.yml --check --diff       # Simuler
ansible-playbook -i hosts site.yml -v                   # Verbose 1
ansible-playbook -i hosts site.yml -vvv                 # Verbose 3
ansible-playbook -i hosts site.yml --limit web1         # Limiter à un hôte
ansible-playbook -i hosts site.yml --tags "apache"      # Par tag
ansible-playbook -i hosts site.yml --skip-tags "tests"  # Exclure tags
ansible-playbook -i hosts site.yml --start-at-task="Configurer Nginx"
ansible-playbook -i hosts site.yml --step               # Mode interactif
ansible-playbook -i hosts site.yml --ask-become-pass    # Demander sudo pass
ansible-playbook -i hosts site.yml -e "env=production" # Extra vars
```

---

## 9. Les Variables

### Déclarer des variables dans le playbook

```yaml
- name: Exemple de variables
  hosts: webservers
  vars:
    # Variable simple
    serveur_http: apache2
    port_http: 8080
    # Liste
    paquets_a_installer:
      - nginx
      - git
      - curl
    # Dictionnaire
    config_db:
      host: db.exemple.com
      port: 5432
      name: mabase
      options:
        ssl: true
        timeout: 30

  tasks:
    - name: Installer le serveur web
      ansible.builtin.apt:
        name: "{{ serveur_http }}"   # Toujours entre {{ }}
        state: present

    - name: Afficher la config DB
      ansible.builtin.debug:
        msg: >
          Connexion à {{ config_db.host }}:{{ config_db.port }}/{{ config_db.name }}
          SSL={{ config_db.options.ssl }}
```

### Variables dans des fichiers externes

```yaml
# vars/config.yml
document_root: /var/www/html
max_upload_size: 50M
allowed_ips:
  - 192.168.1.0/24
  - 10.0.0.0/8
```

```yaml
- hosts: webservers
  vars_files:
    - vars/config.yml
    - vars/secrets.yml    # Fichier chiffré avec Vault
  tasks:
    - name: Créer le répertoire web
      ansible.builtin.file:
        path: "{{ document_root }}"
        state: directory
```

### Les Facts — Variables automatiques du serveur

```yaml
tasks:
  - name: Afficher des infos sur le serveur
    ansible.builtin.debug:
      msg:
        - "Hostname : {{ ansible_hostname }}"
        - "FQDN : {{ ansible_fqdn }}"
        - "OS : {{ ansible_distribution }} {{ ansible_distribution_version }}"
        - "Famille : {{ ansible_os_family }}"
        - "Architecture : {{ ansible_architecture }}"
        - "RAM totale : {{ ansible_memtotal_mb }} MB"
        - "CPUs : {{ ansible_processor_count }}"
        - "IP principale : {{ ansible_default_ipv4.address }}"
        - "Kernel : {{ ansible_kernel }}"
```

```bash
# Voir TOUS les facts d'un serveur
ansible web1 -i hosts -m setup
# Filtrer les facts
ansible web1 -i hosts -m setup -a "filter=ansible_distribution*"
ansible web1 -i hosts -m setup -a "filter=ansible_memory*"
```

### Mise en cache des facts (optimisation)

```ini
# ansible.cfg
[defaults]
gathering        = smart           # Ne collecte que si pas en cache
fact_caching     = jsonfile
fact_caching_connection = /tmp/ansible_facts_cache
fact_caching_timeout    = 3600     # Cache valide 1 heure
```

```yaml
# Désactiver la collecte de facts quand non nécessaire
# Gain de 2-5 secondes par serveur !
- hosts: all
  gather_facts: false
  tasks:
    - name: Redémarrer le service
      ansible.builtin.service:
        name: monapp
        state: restarted
```

### Les Lookups — Récupérer des données externes

```yaml
vars:
  # Lire un fichier local
  config_data: "{{ lookup('file', '/etc/app/config.txt') }}"

  # Lire une variable d'environnement
  db_password: "{{ lookup('env', 'DB_PASSWORD') }}"

  # Résultat d'une commande locale
  git_hash: "{{ lookup('pipe', 'git rev-parse HEAD') }}"

  # Requête DNS
  mail_servers: "{{ lookup('dig', 'example.com', 'qtype=MX') }}"

  # Générer un mot de passe et le stocker
  app_secret: "{{ lookup('password', '/tmp/app_secret length=32') }}"

  # Contenu d'un template rendu
  rendered_config: "{{ lookup('template', 'config.j2') }}"
```

### Utilisation d'une variable sur une tâche (register)

```yaml
tasks:
  - name: Exécuter un script
    ansible.builtin.shell: /opt/check.sh
    register: check_result   # Stocker le résultat

  - name: Afficher la sortie
    ansible.builtin.debug:
      var: check_result.stdout_lines

  - name: Utiliser le résultat dans une condition
    ansible.builtin.debug:
      msg: "Tout va bien !"
    when: check_result.rc == 0

  # Attributs disponibles via register :
  # - check_result.stdout     → sortie standard (string)
  # - check_result.stdout_lines → sortie standard (liste)
  # - check_result.stderr     → sortie erreur
  # - check_result.rc         → code de retour
  # - check_result.changed    → a-t-il changé quelque chose ?
  # - check_result.failed     → a-t-il échoué ?
```

---

## 10. Les Conditions (when)

```yaml
tasks:
  # Condition sur la famille d'OS
  - name: Installer Apache (Debian/Ubuntu)
    ansible.builtin.apt:
      name: apache2
      state: present
    when: ansible_os_family == "Debian"

  - name: Installer Apache (RedHat/CentOS)
    ansible.builtin.yum:
      name: httpd
      state: present
    when: ansible_os_family == "RedHat"

  # Conditions multiples (ET logique — liste)
  - name: Tâche spécifique Ubuntu récent
    ansible.builtin.debug:
      msg: "Ubuntu 22+ avec 2+ Go de RAM"
    when:
      - ansible_distribution == "Ubuntu"
      - ansible_distribution_major_version | int >= 22
      - ansible_memtotal_mb > 2048

  # OU logique (chaîne sur une seule ligne)
  - name: Tâche si Ubuntu OU Debian
    ansible.builtin.debug:
      msg: "Distrib Debian-based"
    when: >
      ansible_distribution == "Ubuntu" or
      ansible_distribution == "Debian"

  # Condition sur une variable enregistrée
  - name: Vérifier si un fichier existe
    ansible.builtin.stat:
      path: /etc/app/config.conf
    register: config_file

  - name: Créer seulement s'il n'existe pas
    ansible.builtin.copy:
      content: "# Config initiale\n"
      dest: /etc/app/config.conf
    when: not config_file.stat.exists

  # Condition sur une variable optionnelle
  - name: Activer le mode debug si demandé
    ansible.builtin.debug:
      msg: "Mode debug activé"
    when: debug_mode is defined and debug_mode | bool

  # Condition avec "in"
  - name: Tâche pour certains environnements
    ansible.builtin.debug:
      msg: "Environnement non-prod"
    when: env_name in ['staging', 'dev', 'test']
```

---

## 11. Les Boucles (loop)

```yaml
tasks:
  # Boucle simple
  - name: Créer des utilisateurs
    ansible.builtin.user:
      name: "{{ item }}"
      state: present
    loop:
      - alice
      - bob
      - charlie

  # Boucle sur des dictionnaires
  - name: Créer des utilisateurs avec des groupes
    ansible.builtin.user:
      name: "{{ item.name }}"
      group: "{{ item.group }}"
      shell: "{{ item.shell | default('/bin/bash') }}"
      create_home: "{{ item.create_home | default(true) }}"
    loop:
      - { name: alice,   group: developers }
      - { name: bob,     group: ops,        shell: /bin/zsh }
      - { name: charlie, group: developers, create_home: false }

  # Boucle sur une variable de liste
  - name: Installer des paquets
    ansible.builtin.apt:
      name: "{{ item }}"
      state: present
    loop: "{{ paquets }}"

  # Contrôle de boucle avancé (loop_control)
  - name: Traitement avec index et pause
    ansible.builtin.debug:
      msg: >
        Serveur {{ ansible_loop.index }}/{{ ansible_loop.length }} :
        {{ item }} (premier={{ ansible_loop.first }}, dernier={{ ansible_loop.last }})
    loop: "{{ groups['webservers'] }}"
    loop_control:
      extended: true      # Active ansible_loop.index, .first, .last, .length...
      label: "{{ item }}" # Personnalise l'affichage dans les logs
      pause: 2            # Pause 2 secondes entre chaque itération

  # Boucle avec variable de boucle renommée (évite les conflits)
  - include_tasks: tasks/configurer_vhost.yml
    loop: "{{ sites_web }}"
    loop_control:
      loop_var: site_courant   # 'item' devient 'site_courant'
```

---

## 12. Les Handlers

```yaml
---
- name: Configurer le serveur web
  hosts: webservers
  become: true

  tasks:
    - name: Copier la configuration Nginx
      ansible.builtin.template:
        src: templates/nginx.conf.j2
        dest: /etc/nginx/nginx.conf
        mode: '0644'
      notify: reload nginx         # Déclenche si changement

    - name: Activer un vhost
      ansible.builtin.file:
        src: /etc/nginx/sites-available/monsite
        dest: /etc/nginx/sites-enabled/monsite
        state: link
      notify: reload nginx         # Même handler, ne s'exécute qu'une fois

    # Notifier plusieurs handlers
    - name: Modifier la configuration SSL
      ansible.builtin.copy:
        src: files/ssl.conf
        dest: /etc/nginx/conf.d/ssl.conf
      notify:
        - reload nginx
        - verify nginx config

    # Forcer l'exécution des handlers MAINTENANT
    # (sans attendre la fin du play)
    - name: Forcer les handlers
      meta: flush_handlers

    - name: Vérifier que Nginx répond
      ansible.builtin.uri:
        url: http://localhost/health
        status_code: 200

  handlers:
    - name: reload nginx
      ansible.builtin.service:
        name: nginx
        state: reloaded

    - name: restart nginx
      ansible.builtin.service:
        name: nginx
        state: restarted

    - name: verify nginx config
      ansible.builtin.command: nginx -t
      changed_when: false
```

> **Règle d'or** : Si 10 tâches notifient le handler `reload nginx`, il ne s'exécutera **qu'une seule fois** à la fin du play.

### Contrôle du lancement des handlers

```yaml
# Contrôler l'ordre des handlers avec listen
tasks:
  - name: Modifier config Apache
    ansible.builtin.template:
      src: apache.conf.j2
      dest: /etc/apache2/apache2.conf
    notify: "Restart web stack"   # Notifie un "topic"

  - name: Modifier config PHP
    ansible.builtin.copy:
      src: php.ini
      dest: /etc/php/8.1/cli/php.ini
    notify: "Restart web stack"   # Même topic

handlers:
  - name: Restart Apache
    ansible.builtin.service:
      name: apache2
      state: restarted
    listen: "Restart web stack"   # Écoute le topic

  - name: Restart PHP-FPM
    ansible.builtin.service:
      name: php8.1-fpm
      state: restarted
    listen: "Restart web stack"   # Écoute aussi le topic
```

---

## 13. Les Templates Jinja2 et filtres

### Créer un template

```jinja2
{# templates/nginx.conf.j2 — Les # indiquent un commentaire Jinja2 #}
server {
    listen {{ nginx_port }};
    server_name {{ domain_name }};

    root /var/www/{{ site_name }};
    index index.html index.php;

    {# Boucle Jinja2 pour les serveurs upstream #}
    upstream backend {
        {% for server in upstream_servers %}
        server {{ server }};
        {% endfor %}
    }

    {# Condition pour SSL #}
    {% if ssl_enabled | bool %}
    listen 443 ssl;
    ssl_certificate /etc/ssl/certs/{{ domain_name }}.crt;
    ssl_certificate_key /etc/ssl/private/{{ domain_name }}.key;
    {% endif %}

    {# Valeur par défaut si variable non définie #}
    client_max_body_size {{ max_upload_size | default('50M') }};

    {# Affichage des interfaces réseau avec boucle #}
    # Serveur : {{ ansible_hostname }}
    # Interfaces : {% for iface in ansible_interfaces %}{{ iface }}{% if not loop.last %}, {% endif %}{% endfor %}
}
```

### Utiliser le template

```yaml
tasks:
  - name: Déployer la configuration Nginx
    ansible.builtin.template:
      src: templates/nginx.conf.j2
      dest: /etc/nginx/sites-available/monsite
      mode: '0644'
      owner: root
      group: root
      validate: '/usr/sbin/nginx -t -c %s'   # Valider AVANT de déployer !
    notify: reload nginx
```

### Mécanisme de boucle sur tableau avec Jinja (dans les templates)

```jinja2
{# Exemple : générer une liste de serveurs avec numérotation #}
[webservers]
{% for host in groups['webservers'] %}
{{ host }} weight={{ loop.index }}
{% endfor %}

{# Afficher les interfaces réseau #}
{% for iface, config in ansible_interfaces.items() %}
{% if config.ipv4 is defined %}
Interface {{ iface }} : {{ config.ipv4.address }}/{{ config.ipv4.netmask }}
{% endif %}
{% endfor %}
```

### Les filtres Jinja2 — exemples complets

```yaml
tasks:
  - ansible.builtin.debug:
      msg:
        # Transformations de chaînes
        - "{{ 'bonjour' | upper }}"                    # BONJOUR
        - "{{ 'BONJOUR' | lower }}"                    # bonjour
        - "{{ 'bonjour monde' | title }}"              # Bonjour Monde
        - "{{ '  texte  ' | trim }}"                   # texte
        - "{{ 'bonjour' | replace('bonjour', 'hello') }}"  # hello

        # Valeurs par défaut
        - "{{ variable | default('valeur_defaut') }}"
        - "{{ item.mode | default(omit) }}"            # Omettre si non défini

        # Opérations sur des listes
        - "{{ [3,1,2] | sort }}"                       # [1, 2, 3]
        - "{{ [3,1,2] | sort | reverse | list }}"      # [3, 2, 1]
        - "{{ ['a','b','c'] | join(', ') }}"           # a, b, c
        - "{{ [1,2,3] | length }}"                     # 3
        - "{{ [1,2,2,3] | unique }}"                   # [1, 2, 3]
        - "{{ [1,2,3] | sum }}"                        # 6
        - "{{ [1,2,3,4,5] | select('odd') | list }}"  # [1, 3, 5]

        # Données structurées
        - "{{ result.stdout | from_json }}"            # Parser du JSON
        - "{{ data | to_json }}"                       # Convertir en JSON
        - "{{ data | to_nice_json(indent=2) }}"        # JSON formaté
        - "{{ data | to_yaml }}"                       # Convertir en YAML

        # Encodage
        - "{{ secret | b64encode }}"                   # Encoder base64
        - "{{ encoded | b64decode }}"                  # Décoder base64
        - "{{ password | password_hash('sha512') }}"   # Hash SHA-512

        # Maths
        - "{{ '3.14' | float | round(1) }}"            # 3.1
        - "{{ 1024 * 1024 | human_readable }}"         # 1.0 MB
        - "{{ ansible_memtotal_mb | int }}"            # Conversion entier

        # Réseau
        - "{{ '192.168.1.0/24' | ipaddr('network') }}"   # 192.168.1.0
        - "{{ '192.168.1.5' | ipaddr('address') }}"      # 192.168.1.5
        - "{{ '192.168.1.0/24' | ipaddr('broadcast') }}" # 192.168.1.255

        # Comparaison de mots de passe salés (filtre personnalisé)
        - "{{ password_en_clair | mon_filtre_hash_compare(hash_stocke) }}"
```

---

## 14. Introduction aux Rôles

Un rôle est une façon d'organiser et de **réutiliser** son code Ansible. C'est comme une bibliothèque que vous créez une fois et utilisez partout.

### Structure d'un rôle

```
roles/
└── apache/
    ├── tasks/
    │   └── main.yml        # Tâches principales (obligatoire)
    ├── handlers/
    │   └── main.yml        # Handlers
    ├── templates/
    │   └── apache.conf.j2  # Templates Jinja2
    ├── files/
    │   └── index.html      # Fichiers statiques
    ├── vars/
    │   └── main.yml        # Variables fixes (haute priorité)
    ├── defaults/
    │   └── main.yml        # Variables par défaut (basse priorité, surchargeables)
    ├── meta/
    │   └── main.yml        # Métadonnées + dépendances entre rôles
    └── README.md           # Documentation du rôle (bonne pratique)
```

### Créer un rôle avec ansible-galaxy

```bash
# Créer la structure automatiquement
ansible-galaxy init roles/apache

# Vérifier la structure créée
tree roles/apache
```

### Exemple de rôle Apache complet

```yaml
# roles/apache/defaults/main.yml
---
apache_port: 80
apache_user: www-data
apache_document_root: /var/www/html
apache_max_clients: 150
apache_server_tokens: Prod   # Masquer la version Apache
```

```yaml
# roles/apache/tasks/main.yml
---
- name: Installer Apache
  ansible.builtin.apt:
    name: apache2
    state: present
    update_cache: true
  tags: install

- name: Déployer la configuration
  ansible.builtin.template:
    src: apache.conf.j2
    dest: /etc/apache2/apache2.conf
    mode: '0644'
    owner: root
    group: root
  notify: restart apache
  tags: configure

- name: Créer le répertoire web
  ansible.builtin.file:
    path: "{{ apache_document_root }}"
    state: directory
    owner: "{{ apache_user }}"
    group: "{{ apache_user }}"
    mode: '0755'

- name: Démarrer et activer Apache
  ansible.builtin.service:
    name: apache2
    state: started
    enabled: true
```

```yaml
# roles/apache/handlers/main.yml
---
- name: restart apache
  ansible.builtin.service:
    name: apache2
    state: restarted

- name: reload apache
  ansible.builtin.service:
    name: apache2
    state: reloaded
```

```yaml
# roles/apache/meta/main.yml
---
galaxy_info:
  author: mon_nom
  description: Rôle pour installer et configurer Apache
  license: MIT
  min_ansible_version: "2.9"
  platforms:
    - name: Ubuntu
      versions: [22.04, 24.04]
    - name: Debian
      versions: [11, 12]

dependencies:
  - role: common      # Ce rôle dépend du rôle "common"
```

### Utiliser un rôle dans un playbook

```yaml
---
- name: Configurer les serveurs web
  hosts: webservers
  become: true

  roles:
    - common                    # Rôle simple (valeurs par défaut)
    - role: apache              # Avec surcharge de variables
      vars:
        apache_port: 8080
        apache_max_clients: 300
    - role: php
      when: php_enabled | bool  # Rôle conditionnel
```

### Structure recommandée d'un projet complet

```
mon_projet_ansible/
├── ansible.cfg
├── hosts                       # Inventaire de développement
├── inventories/
│   ├── staging/
│   │   ├── hosts
│   │   └── group_vars/
│   └── production/
│       ├── hosts
│       └── group_vars/
├── group_vars/
│   ├── all/
│   │   ├── vars.yml
│   │   └── vault.yml
│   └── webservers.yml
├── host_vars/
│   └── web1.example.com.yml
├── roles/
│   ├── common/
│   ├── apache/
│   ├── nginx/
│   ├── mysql/
│   └── ldap/
├── playbooks/
│   ├── site.yml                # Playbook principal (orchestre tout)
│   ├── webservers.yml
│   └── databases.yml
├── molecule/                   # Tests (voir section 26)
│   └── default/
├── requirements.yml            # Dépendances Galaxy
└── .ansible-lint               # Config ansible-lint
```

---

## 15. Rôles avancés — Exemple complet OpenLDAP

Voici un exemple concret et complet d'un rôle Ansible pour installer et configurer un serveur **OpenLDAP**. Il illustre de nombreux concepts avancés : templates, handlers, `stat`, `register`, `when`, `notify`, `meta: flush_handlers`, `shell` avec `changed_when`.

### Arborescence du rôle

```
roles/ldap/
├── defaults/
│   └── main.yml
├── tasks/
│   └── main.yml
├── handlers/
│   └── main.yml
└── templates/
    └── custom_001.ldif.j2
```

### Variables par défaut

```yaml
# roles/ldap/defaults/main.yml
---
ldap_service: slapd
ldap_backup_path: /tmp/slapd_backup.tar.gz
ldap_ldif_dest: /tmp/custom_001.ldif
dir_ldap: /opt/ldap
```

### Le fichier de tâches principal — entièrement commenté

```yaml
# roles/ldap/tasks/main.yml
---

# ─────────────────────────────────────────────────────────
# ÉTAPE 1 : Installation des paquets OpenLDAP
# slapd     = le démon serveur LDAP
# ldap-utils = outils en ligne de commande (ldapsearch, ldapadd...)
# update_cache: yes       → équivalent à "apt-get update"
# cache_valid_time: 3600  → ne refait apt update que si cache > 1h
# ─────────────────────────────────────────────────────────
- name: Install OpenLDAP server and utilities
  ansible.builtin.apt:
    name:
      - slapd
      - ldap-utils
    state: present
    update_cache: yes
    cache_valid_time: 3600

# ─────────────────────────────────────────────────────────
# ÉTAPE 2 : Sauvegarde de l'ancienne configuration slapd
# On sauvegarde /etc/ldap/slapd.d avant de tout réinitialiser
# Permet un rollback si quelque chose se passe mal
# ─────────────────────────────────────────────────────────
- name: Backup slapd.d directory
  ansible.builtin.command:
    cmd: tar czf {{ ldap_backup_path }} /etc/ldap/slapd.d
  changed_when: true    # Cette tâche fait toujours quelque chose

# ─────────────────────────────────────────────────────────
# ÉTAPE 3 : Nettoyer et recréer le répertoire de config slapd
# state: absent → supprime le répertoire et tout son contenu
# On recrée ensuite un répertoire vide avec les bons droits
# owner/group: openldap → l'utilisateur système du service LDAP
# force: yes → supprimer même si non vide
# ─────────────────────────────────────────────────────────
- name: Remove all contents of slapd.d
  ansible.builtin.file:
    path: /etc/ldap/slapd.d
    state: absent
    force: yes

- name: Recreate slapd.d directory
  ansible.builtin.file:
    path: /etc/ldap/slapd.d
    state: directory
    owner: openldap
    group: openldap
    mode: '0755'

# ─────────────────────────────────────────────────────────
# ÉTAPE 4 : Vérifier l'existence d'un répertoire personnalisé
# stat → collecte des informations sur un fichier/répertoire
# register → stocke le résultat dans ldap_dir_stat
# La tâche suivante utilise "when: not ldap_dir_stat.stat.exists"
# → Crée le dossier SEULEMENT s'il n'existe pas (idempotence !)
# ─────────────────────────────────────────────────────────
- name: Check if {{ dir_ldap }} exists
  ansible.builtin.stat:
    path: "{{ dir_ldap }}/"
  register: ldap_dir_stat

- name: Create {{ dir_ldap }} directory if it does not exist
  ansible.builtin.file:
    path: "{{ dir_ldap }}/"
    state: directory
    owner: openldap
    group: openldap
    mode: '0755'
  when: not ldap_dir_stat.stat.exists

# ─────────────────────────────────────────────────────────
# ÉTAPE 5 : Générer le fichier de configuration LDIF
# Le template custom_001.ldif.j2 contient des variables Jinja2
# Ansible les remplace par les vraies valeurs avant de copier
# owner/group: openldap → le service LDAP doit pouvoir le lire
# ─────────────────────────────────────────────────────────
- name: Generate custom LDIF file from template
  ansible.builtin.template:
    src: custom_001.ldif.j2
    dest: "{{ ldap_ldif_dest }}"
    owner: openldap
    group: openldap
    mode: '0644'

# ─────────────────────────────────────────────────────────
# ÉTAPE 6 : Arrêter proprement le processus slapd s'il tourne
# pgrep slapd → retourne le PID si slapd tourne, sinon erreur (rc=1)
# ignore_errors: true → ne pas bloquer si slapd n'est pas lancé
# changed_when: false → c'est une vérification, pas un changement
# La tâche suivante ne tue le process que si slapd_pid.stdout != ""
# ─────────────────────────────────────────────────────────
- name: Check if slapd process is running
  ansible.builtin.shell: pgrep slapd
  register: slapd_pid
  ignore_errors: true
  changed_when: false

- name: Kill slapd process if running
  ansible.builtin.shell: kill -9 {{ slapd_pid.stdout }}
  when: slapd_pid.stdout != ""
  ignore_errors: true

# ─────────────────────────────────────────────────────────
# ÉTAPE 7 : Charger la configuration LDIF dans slapd
# slapadd -F → charge la configuration dans le répertoire slapd.d
# -n 0 → base de données 0 (la config principale, pas les données)
# -l → spécifie le fichier LDIF à charger
# chown → s'assurer que tous les fichiers appartiennent à openldap
# notify → déclenche le handler "start and enable slapd" après
# ─────────────────────────────────────────────────────────
- name: Load the custom LDIF configuration
  ansible.builtin.shell: >
    slapadd -F /etc/ldap/slapd.d -n 0 -l {{ ldap_ldif_dest }} &&
    chown -R openldap:openldap /etc/ldap
  notify: start and enable slapd

# ─────────────────────────────────────────────────────────
# ÉTAPE 8 : Forcer l'exécution du handler maintenant
# Sans cette ligne, le handler attendrait la FIN du play.
# On a besoin que slapd soit démarré AVANT les vérifications.
# meta: flush_handlers → exécute immédiatement les handlers en attente
# ─────────────────────────────────────────────────────────
- name: Flush handlers
  meta: flush_handlers

# ─────────────────────────────────────────────────────────
# ÉTAPE 9 : Vérification que le service tourne correctement
# systemctl status → vérifie l'état du service
# register → stocke la sortie pour l'afficher ensuite
# changed_when: false → c'est une vérification, pas un changement
# debug avec stdout_lines → affiche chaque ligne sur une ligne séparée
# ─────────────────────────────────────────────────────────
- name: Verify slapd service is running
  ansible.builtin.shell: systemctl status {{ ldap_service }}
  register: slapd_status
  changed_when: false

- name: Display slapd status
  ansible.builtin.debug:
    msg: "{{ slapd_status.stdout_lines }}"

# ─────────────────────────────────────────────────────────
# ÉTAPE 10 : Vérifier l'existence du schéma personnalisé
# ldapsearch -Y EXTERNAL → authentification via socket Unix (root)
# -H ldapi:/// → connexion via socket local UNIX (pas TCP)
# -b "cn=schema,cn=config" → recherche dans la configuration
# "(cn={4}somfy)" → filtre LDAP : chercher le schéma à l'index 4
# failed_when: rc != 0 → échec si ldapsearch retourne une erreur
# changed_when: false → lecture seule, pas de modification
# ─────────────────────────────────────────────────────────
- name: Check if custom class exists in cn=config
  ansible.builtin.shell: >
    ldapsearch -Y EXTERNAL -H ldapi:///
    -b "cn=schema,cn=config"
    "(cn={4}somfy)"
  register: ldapsearch_result
  failed_when: ldapsearch_result.rc != 0
  changed_when: false

- name: Display class search result
  ansible.builtin.debug:
    msg: "{{ ldapsearch_result.stdout }}"
```

### Le handler du rôle

```yaml
# roles/ldap/handlers/main.yml
---
- name: start and enable slapd
  ansible.builtin.service:
    name: "{{ ldap_service }}"
    state: started
    enabled: true
```

### Utiliser le rôle dans un playbook

```yaml
# playbooks/ldap.yml
---
- name: Installer et configurer OpenLDAP
  hosts: ldap_servers
  become: true

  pre_tasks:
    - name: Vérifier les prérequis
      ansible.builtin.assert:
        that:
          - dir_ldap is defined
          - ldap_service is defined
        fail_msg: "Les variables dir_ldap et ldap_service doivent être définies"

  roles:
    - role: ldap
      vars:
        ldap_service: slapd
        dir_ldap: /opt/monldap
        ldap_backup_path: /var/backups/slapd_backup.tar.gz

  post_tasks:
    - name: Vérifier la connectivité LDAP
      ansible.builtin.shell: ldapsearch -x -H ldap://localhost -b "" -s base
      changed_when: false
      register: ldap_check

    - name: Afficher le résultat de la vérification
      ansible.builtin.debug:
        var: ldap_check.stdout_lines
```

### Gestion des variables dans un rôle

```yaml
# roles/ldap/vars/main.yml — Variables fixes (ne peuvent pas être surchargées)
# Usage : valeurs qui ne doivent JAMAIS changer entre environnements
ldap_config_dir: /etc/ldap/slapd.d
ldap_data_dir: /var/lib/ldap

# roles/ldap/defaults/main.yml — Variables par défaut (peuvent être surchargées)
# Usage : valeurs raisonnables que l'utilisateur peut personnaliser
ldap_service: slapd
ldap_port: 389
ldap_tls_port: 636
```

---

## 16. Playbooks, rôles et notions avancées

### Gestion de Python sur les machines distantes

Ansible nécessite Python sur les machines cibles. Voici comment gérer les cas difficiles.

```ini
# Spécifier l'interpréteur Python dans l'inventaire
[webservers:vars]
ansible_python_interpreter=/usr/bin/python3

# Détection automatique (Ansible >= 2.8)
[dbservers:vars]
ansible_python_interpreter=auto_silent
```

```yaml
# Pour une machine SANS Python, utiliser le module raw
- name: Installer Python sur une machine vierge
  hosts: new_servers
  gather_facts: false   # Impossible sans Python !
  tasks:
    - name: Installer Python via raw (pas de Python requis)
      ansible.builtin.raw: apt-get install -y python3
      changed_when: true

    - name: Maintenant on peut collecter les facts
      ansible.builtin.setup:
```

### Gestion d'un serveur Apache (exemple de bout en bout)

```yaml
---
- name: Installation et configuration complète d'Apache
  hosts: webservers
  become: true

  vars:
    apache_vhosts:
      - domain: site1.example.com
        docroot: /var/www/site1
        port: 80
      - domain: site2.example.com
        docroot: /var/www/site2
        port: 8080

  tasks:
    - name: Installer Apache et modules nécessaires
      ansible.builtin.apt:
        name:
          - apache2
          - apache2-utils
          - libapache2-mod-php
        state: present

    - name: Activer les modules Apache requis
      community.general.apache2_module:
        name: "{{ item }}"
        state: present
      loop:
        - rewrite
        - ssl
        - headers
      notify: restart apache

    - name: Créer les répertoires des sites
      ansible.builtin.file:
        path: "{{ item.docroot }}"
        state: directory
        owner: www-data
        group: www-data
        mode: '0755'
      loop: "{{ apache_vhosts }}"

    - name: Déployer les configurations des vhosts
      ansible.builtin.template:
        src: templates/vhost.conf.j2
        dest: "/etc/apache2/sites-available/{{ item.domain }}.conf"
        mode: '0644'
      loop: "{{ apache_vhosts }}"
      notify: reload apache

    - name: Activer les vhosts
      ansible.builtin.command: a2ensite {{ item.domain }}
      loop: "{{ apache_vhosts }}"
      register: a2ensite_result
      changed_when: "'already enabled' not in a2ensite_result.stdout"
      notify: reload apache

  handlers:
    - name: restart apache
      ansible.builtin.service:
        name: apache2
        state: restarted

    - name: reload apache
      ansible.builtin.service:
        name: apache2
        state: reloaded
```

### Réduction des opérations impactantes

```yaml
# Utiliser --check pour simuler sans impacter
# ansible-playbook site.yml --check --diff

# Utiliser les tags pour limiter l'impact
# ansible-playbook site.yml --tags "configure"

# Utiliser --limit pour cibler un seul serveur
# ansible-playbook site.yml --limit web1.example.com

# Utiliser serial pour les déploiements progressifs
- name: Mise à jour progressive
  hosts: webservers
  serial: 1        # Un serveur à la fois
  max_fail_percentage: 0   # Arrêter au premier échec
```

### Contrôler le lancement des handlers (bonnes pratiques)

```yaml
# Forcer les handlers après une section critique
tasks:
  - name: Modifier la configuration critique
    ansible.builtin.template:
      src: critical.conf.j2
      dest: /etc/app/critical.conf
    notify: restart service

  # S'assurer que le service est redémarré AVANT de continuer
  - meta: flush_handlers

  - name: Vérifier que le service répond
    ansible.builtin.uri:
      url: http://localhost:8080/health
      status_code: 200
    retries: 5
    delay: 3
```

### Mise à jour de version et réentrance

```yaml
tasks:
  # Vérifier la version installée avant de mettre à jour
  - name: Vérifier la version actuelle
    ansible.builtin.command: monapp --version
    register: current_version
    changed_when: false
    ignore_errors: true

  - name: Mettre à jour si version différente
    ansible.builtin.apt:
      name: monapp=2.0.0
      state: present
    when:
      - current_version.rc == 0
      - "'2.0.0' not in current_version.stdout"

  # Gérer la montée de version du schéma de base de données
  - name: Vérifier si migration nécessaire
    ansible.builtin.shell: monapp db:check-migration
    register: migration_check
    changed_when: false
    failed_when: false

  - name: Exécuter la migration si nécessaire
    ansible.builtin.shell: monapp db:migrate
    when: migration_check.rc == 1
    run_once: true     # N'exécuter qu'une fois même sur plusieurs serveurs
```

---

## 17. Inclusion et réutilisation du code

### import_tasks vs include_tasks

| | `import_tasks` | `include_tasks` |
|---|---|---|
| Traitement | Statique (au démarrage) | Dynamique (à l'exécution) |
| Supporte les boucles | Non | Oui |
| Nom de fichier variable | Non | Oui (`{{ variable }}`) |
| Visible dans les logs | Non (transparent) | Oui |
| Tags propagés | Oui | Non |

```yaml
tasks:
  # Import statique — chargé au démarrage du playbook
  - import_tasks: tasks/installer_dependances.yml

  # Include dynamique — nom de fichier variable
  - include_tasks: "tasks/configurer_{{ ansible_os_family | lower }}.yml"

  # Include dynamique avec boucle (impossible avec import_tasks !)
  - include_tasks: tasks/creer_vhost.yml
    loop: "{{ sites_web }}"
    loop_control:
      loop_var: site_courant   # Renomme 'item' pour éviter les conflits

  # Include conditionnel
  - include_tasks: tasks/configurer_ssl.yml
    when: ssl_enabled | bool
```

### include_role

```yaml
tasks:
  - name: Appliquer le rôle apache
    ansible.builtin.include_role:
      name: apache

  # Avec variables personnalisées
  - name: Appliquer le rôle pour chaque application
    ansible.builtin.include_role:
      name: deployer
    vars:
      app_name: "{{ item.name }}"
      app_port: "{{ item.port }}"
    loop:
      - { name: frontend, port: 3000 }
      - { name: api,      port: 8080 }
    loop_control:
      loop_var: app

  # Inclure seulement les tâches d'un rôle (pas les handlers ni les vars)
  - ansible.builtin.include_role:
      name: common
      tasks_from: setup_firewall  # roles/common/tasks/setup_firewall.yml
```

### pre_tasks et post_tasks

```yaml
---
- name: Déploiement sécurisé avec load balancer
  hosts: webservers
  serial: ["1", "50%"]
  become: true

  pre_tasks:
    - name: Retirer du load balancer
      ansible.builtin.file:
        path: /var/www/html/disabled
        state: touch
    - name: Attendre que HAProxy prenne en compte
      ansible.builtin.pause:
        seconds: 5

  roles:
    - apache
    - monapp

  post_tasks:
    - name: Remettre dans le load balancer
      ansible.builtin.file:
        path: /var/www/html/disabled
        state: absent
    - name: Vérifier que l'app répond
      ansible.builtin.uri:
        url: "http://{{ inventory_hostname }}/health"
        status_code: 200
      retries: 10
      delay: 3
      until: health_check.status == 200
      register: health_check
```

### Gestion du comportement de l'instruction de boucle

```yaml
# Contrôle avancé avec loop_control
- include_tasks: tasks/configurer_serveur.yml
  loop: [1, 2, 3, 4, 5]
  loop_control:
    loop_var: serveur_index   # Renommer 'item'
    label: "Serveur {{ serveur_index }}"
    pause: 2                  # Pause entre les itérations
    index_var: current_index  # Variable contenant l'index (0-based)
    extended: true            # Activer ansible_loop.first/last/length

# Dans tasks/configurer_serveur.yml :
# - name: Configurer le serveur {{ serveur_index }}
#   ansible.builtin.debug:
#     msg: >
#       {{ current_index + 1 }}/5
#       Premier={{ ansible_loop.first }}
#       Dernier={{ ansible_loop.last }}
```

---

## 18. Ansible Galaxy et Collections

### Présentation d'Ansible Galaxy

[Ansible Galaxy](https://galaxy.ansible.com) est le dépôt communautaire officiel de rôles et collections Ansible. On y trouve des milliers de rôles prêts à l'emploi.

### Rechercher et utiliser un rôle

```bash
# Rechercher des rôles sur Galaxy
ansible-galaxy search nginx --author geerlingguy

# Voir les détails d'un rôle
ansible-galaxy info geerlingguy.nginx

# Installer un rôle
ansible-galaxy install geerlingguy.nginx

# Installer dans un répertoire spécifique
ansible-galaxy install geerlingguy.nginx -p roles/

# Lister les rôles installés
ansible-galaxy list

# Supprimer un rôle
ansible-galaxy remove geerlingguy.nginx
```

### Utiliser un fichier de prérequis

```yaml
# requirements.yml — Toujours pincer les versions !
---
roles:
  - name: geerlingguy.apache
    version: "3.2.0"
  - name: geerlingguy.mysql
    version: "4.3.3"
  - name: geerlingguy.php
    version: "5.0.0"
  # Depuis GitHub directement
  - name: mon_role_custom
    src: https://github.com/monorg/ansible-mon-role.git
    version: "v1.2.0"
    scm: git

collections:
  - name: community.general
    version: "7.3.0"
  - name: community.mysql
    version: "3.8.0"
  - name: amazon.aws
    version: "7.0.0"
  - name: community.docker
    version: "3.4.0"
```

```bash
# Installer tout depuis requirements.yml
ansible-galaxy install -r requirements.yml
ansible-galaxy collection install -r requirements.yml

# Ou les deux en une commande (Ansible >= 2.10)
ansible-galaxy install -r requirements.yml
```

### Les Collections Ansible

Les collections sont des paquets qui regroupent : modules, rôles, plugins, et documentation.

```bash
# Rechercher des collections
ansible-galaxy collection search docker

# Installer une collection
ansible-galaxy collection install community.docker

# Installer une version spécifique
ansible-galaxy collection install community.general:==7.3.0

# Lister les collections installées
ansible-galaxy collection list

# Voir la documentation d'un module de collection
ansible-doc community.docker.docker_container
```

```yaml
# Utiliser un module de collection dans un playbook
- name: Gérer des datasources Grafana
  hosts: monitoring
  collections:
    - grafana.grafana   # Déclarer la collection utilisée dans ce play
  tasks:
    - name: Créer une datasource Prometheus
      grafana_datasource:
        name: Prometheus
        ds_type: prometheus
        ds_url: http://prometheus:9090
        state: present
```

### Vérification d'intégrité des collections

```bash
# Vérifier l'intégrité d'une collection installée
ansible-galaxy collection verify community.general

# Utiliser une version spécifique dans un playbook
# ansible.cfg
[defaults]
collections_path = ./collections

# requirements.yml avec checksums (haute sécurité)
collections:
  - name: community.general
    version: "7.3.0"
    # Le checksum est disponible sur Galaxy
```

---

## 19. Gestion des fichiers

### Tableau récapitulatif des modules de fichiers

| Module | Usage principal |
|---|---|
| `file` | Créer/supprimer répertoires, modifier permissions |
| `copy` | Copier un fichier depuis le control node |
| `template` | Copier un fichier avec variables Jinja2 |
| `lineinfile` | Modifier/ajouter une ligne dans un fichier |
| `blockinfile` | Gérer un bloc de lignes entier |
| `replace` | Remplacer du texte avec regex |
| `stat` | Vérifier l'existence/permissions d'un fichier |
| `fetch` | Récupérer un fichier depuis un serveur distant |
| `get_url` | Télécharger depuis une URL HTTP/HTTPS |
| `unarchive` | Extraire une archive (.tar.gz, .zip, .bz2) |
| `git` | Cloner/mettre à jour un dépôt Git |
| `assemble` | Assembler plusieurs fichiers en un seul |
| `tempfile` | Créer des fichiers/répertoires temporaires |
| `slurp` | Lire le contenu d'un fichier distant (base64) |

### Exemples concrets

```yaml
tasks:
  # ── Créer un répertoire avec les bons droits ─────────
  - name: Créer le répertoire de l'application
    ansible.builtin.file:
      path: /var/www/monapp
      state: directory
      mode: '0755'
      owner: www-data
      group: www-data

  # ── Copier avec sauvegarde automatique ───────────────
  - name: Déployer la configuration
    ansible.builtin.copy:
      src: files/app.conf
      dest: /etc/app/app.conf
      mode: '0644'
      owner: root
      group: root
      backup: yes    # Crée app.conf.12345 avant d'écraser

  # ── Modifier une ligne spécifique ────────────────────
  - name: Activer IP forwarding
    ansible.builtin.lineinfile:
      path: /etc/sysctl.conf
      regexp: '^#?net.ipv4.ip_forward'
      line: 'net.ipv4.ip_forward=1'
      state: present

  # ── Ajouter un bloc entier avec marqueurs ────────────
  - name: Configurer SSH de façon sécurisée
    ansible.builtin.blockinfile:
      path: /etc/ssh/sshd_config
      marker: "# {mark} ANSIBLE MANAGED — SSH HARDENING"
      block: |
        PermitRootLogin no
        PasswordAuthentication no
        MaxAuthTries 3
        AllowUsers deployer
      mode: '0600'
    notify: restart sshd

  # ── Remplacer avec expressions régulières ────────────
  - name: Changer le port Nginx
    ansible.builtin.replace:
      path: /etc/nginx/nginx.conf
      regexp: 'listen\s+80;'
      replace: 'listen 8080;'
      backup: yes

  # ── Télécharger depuis une URL avec checksum ─────────
  - name: Télécharger un binaire
    ansible.builtin.get_url:
      url: https://releases.exemple.com/app-v2.tar.gz
      dest: /tmp/app-v2.tar.gz
      checksum: "sha256:abc123..."    # Vérification d'intégrité !
      mode: '0644'

  # ── Extraire une archive ─────────────────────────────
  - name: Décompresser l'application
    ansible.builtin.unarchive:
      src: /tmp/app-v2.tar.gz
      dest: /opt/
      remote_src: yes    # L'archive est déjà sur le serveur

  # ── Télécharger ET extraire depuis une URL ───────────
  - name: Installer depuis une URL
    ansible.builtin.unarchive:
      src: https://example.com/app.tar.gz
      dest: /opt/
      remote_src: no     # Ansible télécharge depuis le control node

  # ── Cloner un dépôt Git ──────────────────────────────
  - name: Déployer depuis Git
    ansible.builtin.git:
      repo: 'https://github.com/monorg/monapp.git'
      dest: /opt/monapp
      version: v2.1.0     # Tag précis pour la production
      force: yes          # Écraser les modifications locales

  # ── Récupérer un fichier depuis un serveur ───────────
  - name: Récupérer les logs de prod
    ansible.builtin.fetch:
      src: /var/log/app/error.log
      dest: logs/{{ inventory_hostname }}/
      flat: no    # Crée un sous-répertoire par hôte

  # ── Vérifier avant d'agir ────────────────────────────
  - name: Vérifier l'existence d'un fichier
    ansible.builtin.stat:
      path: /etc/app/config.conf
    register: config_stat

  - name: Agir seulement si le fichier existe
    ansible.builtin.debug:
      msg: "Permissions : {{ config_stat.stat.mode }}"
    when: config_stat.stat.exists

  # ── Assembler plusieurs fichiers ─────────────────────
  - name: Assembler les fragments de configuration
    ansible.builtin.assemble:
      src: /etc/app/conf.d/   # Répertoire contenant les fragments
      dest: /etc/app/config.conf
      owner: root
      group: root
      mode: '0644'
      # Les fichiers sont concaténés dans l'ordre alphabétique :
      # 00-header.conf, 10-main.conf, 20-footer.conf
```

---

## 20. Scalabilité et Rolling Update

### Le mot-clé serial — Déploiement par vagues

```yaml
---
- name: Mise à jour de l'application web
  hosts: webservers          # 20 serveurs au total
  serial: 3                  # 3 serveurs à la fois
  become: true
  tasks:
    - name: Mettre à jour l'application
      ansible.builtin.apt:
        name: monapp
        state: latest
```

**Syntaxes avancées :**
```yaml
serial: [1, 3, "100%"]      # 1, puis 3, puis tous les restants
serial: ["1%", "5%", "10%"] # Par pourcentage
max_fail_percentage: 20     # Arrêter si + de 20% échouent

# La valeur 1% retourne toujours au moins 1 serveur
# Donc même avec 50 serveurs, "1%" = 1 serveur (pas 0.5)
```

### Rolling update complet avec HAProxy

```yaml
---
- name: Rolling Update sécurisé avec HAProxy
  hosts: webservers
  serial: ["1", "50%"]
  become: true

  pre_tasks:
    # Phase 1 : Désactiver du load balancer
    - name: Créer la page /disabled (signal pour HAProxy)
      ansible.builtin.file:
        path: /var/www/html/disabled
        state: touch

    - name: Attendre que HAProxy exclue ce serveur
      ansible.builtin.pause:
        seconds: 5

  roles:
    # Phase 2 : Mettre à jour (l'instance est hors rotation)
    - role: monapp_deployer

  post_tasks:
    # Phase 3 : Remettre dans le load balancer
    - name: Supprimer la page /disabled
      ansible.builtin.file:
        path: /var/www/html/disabled
        state: absent

    - name: Vérifier que l'application répond
      ansible.builtin.uri:
        url: "http://{{ inventory_hostname }}/health"
        status_code: 200
      retries: 10
      delay: 3
      register: health_check
      until: health_check.status == 200
```

### Désactivation des machines avant mise à jour

La configuration HAProxy pour détecter la page `/disabled` :

```jinja2
{# templates/haproxy.cfg.j2 #}
backend mediawiki
    mode http
    balance roundrobin
    option httpchk GET /disabled
    http-check expect ! status 200    # Exclure si /disabled retourne 200
    option forwardfor
    {% for host in groups['apache'] %}
    server {{ host }} {{ host }}:80 weight 1 maxconn 512 check
    {% endfor %}
```

```bash
# Désactiver manuellement un serveur
ansible -i wiki.yml -m file \
  -a "path=/var/www/html/disabled state=touch" apache2

# Puis HAProxy l'exclut automatiquement du trafic
```

---

## 21. Stratégie d'exécution et optimisation (Mitogen)

### Les stratégies d'exécution

```yaml
# linear (défaut) : tous les hôtes finissent T1, puis T2, etc.
- hosts: all
  strategy: linear

# free : chaque hôte avance à son propre rythme
# web1 peut être à T5 pendant que web2 est à T2
- hosts: all
  strategy: free

# debug : mode débogage interactif
- hosts: all
  debugger: on_failed
```

### Gestion du nombre de tâches en parallèle

```ini
# ansible.cfg
[defaults]
forks = 20    # Connexions SSH parallèles (défaut = 5)
              # Augmenter selon la capacité du control node
```

```bash
# Surcharger depuis la ligne de commande
ansible-playbook site.yml -f 30
```

### Optimiser les connexions SSH

```ini
# ansible.cfg
[ssh_connection]
# Réutiliser les connexions SSH (MAJEUR gain de performance)
pipelining = True
ssh_args   = -o ControlMaster=auto -o ControlPersist=60s

# Vérifier comment Ansible se comporte réellement
# (utile pour comprendre les opérations lancées)
```

### Analyse du fonctionnement interne d'Ansible

```bash
# Activer les traces d'exécution des modules
ANSIBLE_KEEP_REMOTE_FILES=1 ansible-playbook site.yml

# Ansible ne supprime pas les fichiers temporaires
# → Vous pouvez examiner ce qu'il envoie aux serveurs :
# /home/deployer/.ansible/tmp/ansible-tmp-xxx/AnsiballZ_apt.py

# Étude des opérations SSH lancées par Ansible
ansible-playbook site.yml -vvv 2>&1 | grep 'SSH:'
```

### Présentation de Mitogen

**Mitogen** est un plugin de stratégie qui remplace le mécanisme SSH d'Ansible par une implémentation Python optimisée. Les gains sont significatifs : **5 à 10x plus rapide** dans certains cas.

```bash
# Installer Mitogen
pip install mitogen

# Vérifier l'emplacement
python3 -c "import mitogen; print(mitogen.__file__)"
# /usr/local/lib/python3.x/site-packages/mitogen/__init__.py
```

```ini
# ansible.cfg — Activer Mitogen
[defaults]
strategy_plugins = /usr/local/lib/python3.x/site-packages/ansible_mitogen/plugins/strategy
strategy         = mitogen_linear    # Remplace 'linear'
# Ou : strategy = mitogen_free      # Remplace 'free'
```

### Gains potentiels et limitations de Mitogen

```
GAINS :
  → Démarrage beaucoup plus rapide (pas de fork SSH pour chaque tâche)
  → Moins de processus → moins de charge sur le control node
  → Idéal pour les playbooks avec beaucoup de petites tâches

LIMITATIONS :
  → Ne supporte pas tous les modules (les modules C++ en particulier)
  → Incompatible avec certains types de connexion (WinRM, Docker)
  → Peut poser des problèmes avec become et certains systèmes
  → Nécessite Python sur les machines distantes (pas de module raw)
  → Parfois difficile à déboguer en cas de problème

RECOMMANDATION :
  → Tester sur un projet de taille moyenne avant de déployer en prod
  → Garder strategy = linear comme fallback en cas de problème
```

### Mise en cache des facts

```ini
# ansible.cfg — Activer le cache des facts
[defaults]
gathering             = smart       # Seulement si pas en cache
fact_caching          = jsonfile
fact_caching_connection = /tmp/ansible_facts_cache
fact_caching_timeout  = 3600        # 1 heure

# Ou utiliser Redis pour un cache partagé entre plusieurs control nodes
# fact_caching          = redis
# fact_caching_connection = localhost:6379:0
```

```bash
# Vider le cache des facts
rm -rf /tmp/ansible_facts_cache/*

# Forcer la recollecte des facts même si en cache
ansible-playbook site.yml -e "gather_facts=true"
```

---

## 22. Administration Windows avec Ansible

Ansible peut gérer des serveurs Windows via **WinRM** (Windows Remote Management) ou **SSH** (Windows Server 2019+).

### Prérequis côté Windows

```powershell
# Script PowerShell à exécuter sur le serveur Windows (en admin)
# Configure WinRM pour Ansible

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$url = "https://raw.githubusercontent.com/ansible/ansible/devel/examples/scripts/ConfigureRemotingForAnsible.ps1"
$file = "$env:temp\ConfigureRemotingForAnsible.ps1"
(New-Object -TypeName System.Net.WebClient).DownloadFile($url, $file)
powershell.exe -ExecutionPolicy ByPass -File $file
```

### Configuration de l'inventaire Windows

```ini
# hosts
[windows_servers]
win-server1.example.com
win-server2.example.com

[windows_servers:vars]
ansible_connection=winrm
ansible_winrm_transport=ntlm     # ou kerberos, credssp, certificate
ansible_user=Administrateur
ansible_password={{ vault_win_password }}
ansible_winrm_server_cert_validation=ignore   # En dev seulement
ansible_port=5985                             # HTTP (5985) ou HTTPS (5986)
```

### Installer les prérequis Python

```bash
pip install pywinrm
pip install pywinrm[kerberos]    # Si authentification Kerberos
```

### Modules Windows spécifiques

```yaml
---
- name: Administrer des serveurs Windows
  hosts: windows_servers
  tasks:
    # Tester la connexion
    - name: Ping Windows
      ansible.windows.win_ping:

    # Installer des logiciels via Chocolatey
    - name: Installer git via Chocolatey
      chocolatey.chocolatey.win_chocolatey:
        name: git
        state: present
        version: '2.42.0'

    # Gérer les services Windows
    - name: Démarrer le service IIS
      ansible.windows.win_service:
        name: W3SVC
        state: started
        start_mode: auto

    # Gérer le registre Windows
    - name: Configurer le registre
      ansible.windows.win_regedit:
        path: HKLM:\SOFTWARE\MaCompagnie\MonApp
        name: Version
        data: "2.0.0"
        type: string

    # Copier des fichiers
    - name: Copier un fichier de config
      ansible.windows.win_copy:
        src: files/config.xml
        dest: C:\Program Files\MonApp\config.xml

    # Exécuter des commandes PowerShell
    - name: Créer un utilisateur local
      ansible.windows.win_shell: |
        $Password = ConvertTo-SecureString "{{ vault_user_password }}" -AsPlainText -Force
        New-LocalUser -Name "serviceaccount" -Password $Password -FullName "Service Account"
        Add-LocalGroupMember -Group "Administrateurs" -Member "serviceaccount"

    # Gérer les mises à jour Windows
    - name: Installer les mises à jour critiques
      ansible.windows.win_updates:
        category_names:
          - SecurityUpdates
          - CriticalUpdates
        state: installed
        reboot: false    # Ne pas redémarrer automatiquement
      register: update_result

    - name: Redémarrer si nécessaire
      ansible.windows.win_reboot:
      when: update_result.reboot_required
```

---

## 23. Tester Ansible avec Podman — Conteneurs et Systemd

Podman est une alternative à Docker pour tester vos playbooks dans des conteneurs légers, **sans démon** (daemonless). Il est particulièrement adapté aux environnements CI/CD et aux systèmes utilisant SELinux.

### Installation de Podman

```bash
# Sur Ubuntu/Debian
sudo apt-get install -y podman

# Sur Fedora/CentOS/RHEL
sudo dnf install -y podman

# Sur Arch Linux
sudo pacman -S podman

# Vérifier l'installation
podman --version
podman run hello-world
```

### Ansible, Podman et Systemd — Faire cohabiter les conteneurs et Systemd

Le défi principal avec les conteneurs et Ansible est de tester des playbooks qui gèrent des **services systemd**. Les conteneurs standard n'ont pas de systemd initialisé.

**Choisir les bonnes images** — des images spécialement préparées incluent systemd :

```bash
# Images recommandées pour les tests Ansible
docker.io/geerlingguy/docker-ubuntu2204-ansible:latest
docker.io/geerlingguy/docker-debian12-ansible:latest
docker.io/geerlingguy/docker-rockylinux9-ansible:latest
docker.io/geerlingguy/docker-centos8-ansible:latest

# Ces images contiennent :
# - systemd initialisé comme PID 1
# - Python installé
# - Ansible pre-installé (dans les variantes ansible:latest)
```

### Alimentation du fichier d'inventaire pour Podman

```ini
# hosts — inventaire pour les conteneurs Podman
[conteneurs]
conteneur-ubuntu     ansible_connection=podman
conteneur-debian     ansible_connection=podman
conteneur-rocky      ansible_connection=podman

[conteneurs:vars]
ansible_user=root
ansible_python_interpreter=/usr/bin/python3
```

### Playbook de création des conteneurs Podman

```yaml
# playbooks/creer_conteneurs.yml
---
- name: Créer les conteneurs de test Podman
  hosts: localhost
  connection: local
  gather_facts: false

  vars:
    conteneurs:
      - name: conteneur-ubuntu
        image: geerlingguy/docker-ubuntu2204-ansible:latest
      - name: conteneur-debian
        image: geerlingguy/docker-debian12-ansible:latest
      - name: conteneur-rocky
        image: geerlingguy/docker-rockylinux9-ansible:latest

  tasks:
    - name: Créer les conteneurs avec systemd activé
      containers.podman.podman_container:
        name: "{{ item.name }}"
        image: "{{ item.image }}"
        state: started
        # Paramètres nécessaires pour systemd dans le conteneur
        privileged: true
        systemd: true
        command: /lib/systemd/systemd
        volumes:
          - /sys/fs/cgroup:/sys/fs/cgroup:rw
        cgroupns_mode: host
        # Garder le conteneur en vie
        restart_policy: unless-stopped
      loop: "{{ conteneurs }}"

    - name: Attendre que les conteneurs soient prêts
      ansible.builtin.wait_for:
        timeout: 10
```

### Playbook de suppression des conteneurs

```yaml
# playbooks/supprimer_conteneurs.yml
---
- name: Supprimer les conteneurs de test
  hosts: localhost
  connection: local
  gather_facts: false

  tasks:
    - name: Arrêter et supprimer les conteneurs
      containers.podman.podman_container:
        name: "{{ item }}"
        state: absent
        force: true
      loop:
        - conteneur-ubuntu
        - conteneur-debian
        - conteneur-rocky
```

### Présence de l'interpréteur Python dans les conteneurs

```yaml
# Vérifier que Python est disponible (raw ne nécessite pas Python)
- name: Installer Python si manquant
  hosts: conteneurs
  gather_facts: false
  tasks:
    - name: Vérifier Python avec raw
      ansible.builtin.raw: python3 --version
      register: python_check
      ignore_errors: true
      changed_when: false

    - name: Installer Python si absent
      ansible.builtin.raw: apt-get install -y python3
      when: python_check.rc != 0

    - name: Collecter les facts maintenant que Python est disponible
      ansible.builtin.setup:
```

### Pilotage de Podman avec Ansible

Ansible peut aussi **piloter Podman** pour créer et gérer des conteneurs sur des hôtes distants.

```bash
# Installer la collection Podman
ansible-galaxy collection install containers.podman
```

```yaml
# Exemple : déployer une stack avec Podman
---
- name: Déployer Nginx avec Podman
  hosts: serveurs_podman
  become: true

  tasks:
    - name: Créer le réseau Podman
      containers.podman.podman_network:
        name: mon_reseau
        state: present

    - name: Lancer le conteneur Nginx
      containers.podman.podman_container:
        name: nginx_app
        image: nginx:latest
        state: started
        network: mon_reseau
        ports:
          - "80:80"
        volumes:
          - /var/www/html:/usr/share/nginx/html:ro
        restart_policy: always

    - name: Générer le service systemd pour démarrage auto
      containers.podman.podman_generate_systemd:
        name: nginx_app
        dest: /etc/systemd/system/
        restart_policy: always
        new: true

    - name: Activer le service au démarrage
      ansible.builtin.systemd:
        name: container-nginx_app.service
        enabled: true
        daemon_reload: true
```

### Idempotence et immutabilité avec les conteneurs

```yaml
# Approche immutable : reconstruire l'image à chaque déploiement
- name: Construire l'image de l'application
  containers.podman.podman_image:
    name: monapp
    tag: "{{ app_version }}"
    path: "{{ playbook_dir }}/docker"
    state: build
    build:
      cache: false   # Pas de cache = image propre à chaque fois

- name: Remplacer le conteneur par la nouvelle version
  containers.podman.podman_container:
    name: monapp
    image: "monapp:{{ app_version }}"
    state: started
    force_restart: true   # Forcer le redémarrage même si déjà lancé
```

---

## 24. Ansible : virtualisation, Cloud et Kubernetes

### Gestion de machines virtuelles VMware ESX

```bash
pip3 install pyvmomi
```

```yaml
---
- name: Gérer les VMs VMware
  hosts: localhost
  connection: local
  gather_facts: false

  vars:
    vcenter_hostname: vcenter.example.com
    vcenter_username: admin
    vcenter_password: "{{ vault_vcenter_password }}"

  tasks:
    # Créer une VM
    - name: Créer une nouvelle VM
      community.vmware.vmware_guest:
        hostname: "{{ vcenter_hostname }}"
        username: "{{ vcenter_username }}"
        password: "{{ vcenter_password }}"
        validate_certs: false
        datacenter: MonDatacenter
        cluster: MonCluster
        folder: /MonProjet/VMs
        name: ma-nouvelle-vm
        template: template-ubuntu-22.04
        state: poweredon
        hardware:
          memory_mb: 4096
          num_cpus: 2
          num_cpu_cores_per_socket: 1
        networks:
          - name: VLAN-Prod
            ip: 192.168.1.100
            netmask: 255.255.255.0
            gateway: 192.168.1.1
        customization:
          hostname: ma-nouvelle-vm
          domain: example.com
          dns_servers: [8.8.8.8, 8.8.4.4]

    # Customiser les machines créées
    - name: Customiser la VM
      community.vmware.vmware_guest_custom_attributes:
        hostname: "{{ vcenter_hostname }}"
        username: "{{ vcenter_username }}"
        password: "{{ vcenter_password }}"
        validate_certs: false
        name: ma-nouvelle-vm
        attributes:
          - name: Environnement
            value: Production
          - name: Projet
            value: MonProjet

    # Supprimer la VM
    - name: Supprimer une VM
      community.vmware.vmware_guest:
        hostname: "{{ vcenter_hostname }}"
        username: "{{ vcenter_username }}"
        password: "{{ vcenter_password }}"
        validate_certs: false
        name: ancienne-vm
        state: absent
        force: yes
```

### Gestion cloud AWS

```bash
pip3 install boto boto3
export AWS_ACCESS_KEY_ID=XXXXXX
export AWS_SECRET_ACCESS_KEY=XXXXXX
```

```yaml
---
- name: Gérer les ressources AWS
  hosts: localhost
  connection: local
  gather_facts: false

  tasks:
    # Créer une instance EC2
    - name: Lancer une instance EC2
      amazon.aws.ec2_instance:
        name: mon-serveur-web
        key_name: ma-cle-ssh
        instance_type: t3.micro
        image_id: ami-0abcdef1234567890
        region: eu-west-1
        vpc_subnet_id: subnet-12345
        security_groups: [web-sg]
        network:
          assign_public_ip: true
        tags:
          Environment: production
          Project: MonProjet
          Role: webserver
        state: present
        wait: true              # Attendre que l'instance soit running
      register: ec2_instance

    # Tagger les instances
    - name: Ajouter des tags supplémentaires
      amazon.aws.ec2_tag:
        region: eu-west-1
        resource: "{{ ec2_instance.instance_ids[0] }}"
        tags:
          CreatedBy: Ansible
          CreatedDate: "{{ ansible_date_time.date }}"

    # Configurer les accès réseau
    - name: Créer un security group
      amazon.aws.ec2_security_group:
        name: web-sg
        description: Security group pour les serveurs web
        region: eu-west-1
        rules:
          - proto: tcp
            ports: [80, 443]
            cidr_ip: 0.0.0.0/0
          - proto: tcp
            ports: [22]
            cidr_ip: 10.0.0.0/8   # SSH seulement depuis le réseau interne

    # Configurer les clés SSH
    - name: Créer/importer une clé SSH
      amazon.aws.ec2_key:
        name: ma-cle-ssh
        region: eu-west-1
        key_material: "{{ lookup('file', '~/.ssh/id_rsa.pub') }}"

    # Supprimer une instance
    - name: Supprimer l'instance EC2
      amazon.aws.ec2_instance:
        instance_ids: "{{ ec2_instance.instance_ids }}"
        region: eu-west-1
        state: absent
```

### Tests avec Monkeyble

Monkeyble est un plugin de stratégie qui permet de **tester le comportement d'Ansible** sans modifier les playbooks.

```bash
pip install monkeyble
```

```yaml
# monkeyble_config.yml — Configuration des scénarios de test
monkeyble_scenarios:
  - name: "Test installation Apache"
    test:
      - task_name: "Installer Apache"
        # Mocker le résultat de la tâche
        mock_module:
          result:
            changed: true
            rc: 0
        # Vérifier que la tâche a été appelée avec les bons paramètres
        assert_task_args:
          name: apache2
          state: present
```

```ini
# ansible.cfg
[defaults]
strategy_plugins = /path/to/monkeyble/plugins/strategy
strategy         = monkeyble
```

### Pilotage de Kubernetes avec Ansible

```bash
pip install kubernetes openshift
```

```yaml
---
- name: Déployer des ressources Kubernetes
  hosts: localhost
  connection: local
  gather_facts: false

  tasks:
    # Créer un déploiement Kubernetes
    - name: Déployer une application dans Kubernetes
      kubernetes.core.k8s:
        state: present
        definition:
          apiVersion: apps/v1
          kind: Deployment
          metadata:
            name: mon-app
            namespace: production
            labels:
              app: mon-app
          spec:
            replicas: 3
            selector:
              matchLabels:
                app: mon-app
            template:
              metadata:
                labels:
                  app: mon-app
              spec:
                containers:
                  - name: mon-app
                    image: "monregistry/mon-app:{{ app_version }}"
                    ports:
                      - containerPort: 8080
                    resources:
                      requests:
                        memory: "256Mi"
                        cpu: "250m"
                      limits:
                        memory: "512Mi"
                        cpu: "500m"

    # Créer un Service
    - name: Exposer le service
      kubernetes.core.k8s:
        state: present
        definition:
          apiVersion: v1
          kind: Service
          metadata:
            name: mon-app-service
            namespace: production
          spec:
            selector:
              app: mon-app
            ports:
              - port: 80
                targetPort: 8080
            type: LoadBalancer

    # Attendre que le déploiement soit prêt
    - name: Attendre que les pods soient Running
      kubernetes.core.k8s_info:
        kind: Deployment
        name: mon-app
        namespace: production
      register: deployment_info
      until: >
        deployment_info.resources[0].status.readyReplicas is defined and
        deployment_info.resources[0].status.readyReplicas ==
        deployment_info.resources[0].spec.replicas
      retries: 30
      delay: 10
```

### Écriture d'un opérateur Kubernetes avec Ansible

Un opérateur Ansible permet de gérer des Custom Resources Kubernetes avec des playbooks Ansible.

```bash
# Prérequis
pip install operator-sdk

# Initialiser un opérateur
operator-sdk init --plugins=ansible --domain=example.com
operator-sdk create api --group=monprojet --version=v1alpha1 \
  --kind=Keycloak --generate-role
```

```yaml
# roles/keycloak/tasks/main.yml — Opérateur pour Keycloak
---
# Template pour le StatefulSet Keycloak
- name: Créer le StatefulSet Keycloak
  kubernetes.core.k8s:
    state: "{{ state }}"
    definition: "{{ lookup('template', 'statefulset.yml.j2') }}"

# Template pour le Service
- name: Créer le Service Keycloak
  kubernetes.core.k8s:
    state: "{{ state }}"
    definition: "{{ lookup('template', 'service.yml.j2') }}"

# Vérifier que Keycloak est prêt
- name: Attendre que Keycloak soit disponible
  kubernetes.core.k8s_info:
    kind: StatefulSet
    name: "{{ ansible_operator_meta.name }}"
    namespace: "{{ ansible_operator_meta.namespace }}"
  register: keycloak_ss
  until: >
    keycloak_ss.resources | length > 0 and
    keycloak_ss.resources[0].status.readyReplicas is defined and
    keycloak_ss.resources[0].status.readyReplicas ==
    keycloak_ss.resources[0].spec.replicas
  retries: 30
  delay: 10
  when: state == 'present'
```

---

# PARTIE II — TESTS ANSIBLE

---

## 25. Tester ses playbooks — Vue d'ensemble

Tester son code Ansible est **aussi important que tester du code applicatif**. Sans tests, vous ne savez pas si votre playbook fonctionnera sur un serveur vierge, ou si une modification a introduit une régression.

### Pyramide de tests Ansible

```
          /\
         /  \
        / E2E \         Tests end-to-end sur vrais serveurs
       /────────\
      / Intégration \   Molecule + Docker/Podman (rôle complet)
     /──────────────\
    /   Statique      \ ansible-lint, yamllint, syntax-check
   /────────────────────\
```

### Niveau 1 — Vérification syntaxique (minimum absolu)

```bash
# Vérifier la syntaxe YAML
pip install yamllint
yamllint playbooks/

# yamllint avec configuration
cat > .yamllint << 'EOF'
extends: default
rules:
  line-length:
    max: 120
    level: warning
  truthy:
    allowed-values: ['true', 'false']
EOF

# Vérifier la syntaxe Ansible
ansible-playbook --syntax-check -i hosts site.yml

# Simulation complète sans modifier quoi que ce soit
ansible-playbook --check --diff -i hosts site.yml
```

### Niveau 2 — ansible-lint (voir section 25)

### Niveau 3 — Molecule (voir section 26)

### Hook pre-commit Git automatique

```bash
# .git/hooks/pre-commit
#!/bin/bash
set -e

echo "=== Vérification YAML ==="
yamllint .

echo "=== Vérification syntaxe Ansible ==="
ansible-playbook --syntax-check -i hosts site.yml

echo "=== Ansible-lint ==="
ansible-lint

echo "=== Tous les contrôles ont passé ==="
```

```bash
chmod +x .git/hooks/pre-commit
```

Ou avec l'outil `pre-commit` :

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/ansible/ansible-lint
    rev: v24.2.0
    hooks:
      - id: ansible-lint
  - repo: https://github.com/adrienverge/yamllint
    rev: v1.33.0
    hooks:
      - id: yamllint
```

```bash
pip install pre-commit
pre-commit install
pre-commit run --all-files   # Tester tous les fichiers
```

---

## 26. Ansible-lint — Qualité du code

`ansible-lint` vérifie vos playbooks et rôles contre un ensemble de règles de bonnes pratiques.

### Installation et utilisation

```bash
pip install ansible-lint

ansible-lint                          # Scanner tout le projet
ansible-lint playbooks/site.yml       # Scanner un fichier spécifique
ansible-lint roles/apache/            # Scanner un rôle
ansible-lint --list-rules             # Voir toutes les règles
ansible-lint --list-rules | grep name # Filtrer les règles "name"
ansible-lint --skip-list no-changed-when,yaml[line-length]
ansible-lint --offline                # Mode hors ligne
```

### Exemples de règles et corrections

```yaml
# ── Règle name[missing] : toujours nommer ses tâches ──
# Mauvais :
- ansible.builtin.apt:
    name: nginx
    state: present

# Bon :
- name: Installer nginx
  ansible.builtin.apt:
    name: nginx
    state: present

# ── Règle no-changed-when : shell/command nécessite changed_when ──
# Mauvais :
- name: Vérifier la version
  ansible.builtin.shell: nginx -v
  register: nginx_version

# Bon :
- name: Vérifier la version de nginx
  ansible.builtin.shell: nginx -v
  register: nginx_version
  changed_when: false   # Cette tâche ne modifie jamais rien

# ── Règle yaml[truthy] : utiliser true/false ──
# Mauvais :
  become: yes
  gather_facts: no

# Bon :
  become: true
  gather_facts: false

# ── Règle fqcn[action] : utiliser le FQCN complet ──
# Mauvais :
- apt:
    name: nginx
- copy:
    src: fichier
    dest: /tmp/

# Bon :
- ansible.builtin.apt:
    name: nginx
- ansible.builtin.copy:
    src: fichier
    dest: /tmp/

# ── Règle risky-shell-pipe : utiliser pipefail ──
# Mauvais :
- name: Commande avec pipe
  ansible.builtin.shell: cat fichier | grep motif

# Bon :
- name: Commande avec pipe sécurisée
  ansible.builtin.shell: cat fichier | grep motif
  args:
    executable: /bin/bash
  # Ou mieux, utiliser les modules Ansible :
# - ansible.builtin.shell: set -o pipefail && cat fichier | grep motif

# ── Règle partial-become-vars ──
# become_user sans become: true est suspect
# Mauvais :
- name: Commande en tant qu'apache
  ansible.builtin.command: ls /var/www
  become_user: apache   # become n'est pas défini !

# Bon :
- name: Commande en tant qu'apache
  ansible.builtin.command: ls /var/www
  become: true
  become_user: apache
```

### Fichier de configuration .ansible-lint

```yaml
# .ansible-lint
---
profile: production   # moderate | safety | shared | production | test

# Règles à ignorer globalement (avec justification dans les commentaires)
skip_list:
  - yaml[line-length]   # Les URLs longues dépassent souvent la limite

# Règles à signaler comme avertissements (pas d'erreur)
warn_list:
  - experimental
  - name[template]

# Exclure certains répertoires du scan
exclude_paths:
  - .cache/
  - molecule/
  - tests/
  - .git/

# Répertoires des rôles
roles_path:
  - roles/

# Mode offline (ne pas contacter Galaxy)
offline: false

# Verbosité
verbosity: 1
```

### Créer des règles personnalisées

```python
# rules/MonRequierNom.py
"""Règle personnalisée : toutes les tâches doivent avoir un nom avec le préfixe du rôle"""
from ansible_lint.rules import AnsibleLintRule

class MonRequierNomRule(AnsibleLintRule):
    id = "MON001"
    shortdesc = "Les tâches doivent avoir un nom avec le préfixe du rôle"
    description = "Toutes les tâches dans un rôle doivent commencer par le nom du rôle"
    severity = "MEDIUM"
    tags = ["naming"]

    def match_task(self, task):
        name = task.get("name", "")
        # Vérifier que le nom commence par une lettre majuscule
        if name and not name[0].isupper():
            return True
        return False
```

```ini
# .ansible-lint
rulesdir:
  - rules/
```

### Désactivation ponctuelle de règles

```yaml
tasks:
  # Désactiver une règle pour une tâche spécifique (avec justification !)
  - name: Récupérer le mot de passe (nécessite shell, pas de module disponible)
    ansible.builtin.shell: /opt/get_secret.sh   # noqa: command-instead-of-module
    register: secret
    no_log: true

  # Désactiver pour tout un fichier : ajouter en haut du fichier
  # # noqa: yaml[line-length]
```

### Intégration dans GitHub Actions

```yaml
# .github/workflows/lint.yml
name: Ansible Lint
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Installer les outils
        run: pip install ansible ansible-lint yamllint

      - name: Vérification YAML
        run: yamllint .

      - name: Vérification syntaxe
        run: ansible-playbook --syntax-check -i hosts site.yml

      - name: ansible-lint
        run: ansible-lint
        # Ou utiliser l'action officielle :
        # uses: ansible/ansible-lint@v24
```

---

## 27. Molecule — Tests d'intégration avec Docker et Podman

**Molecule** est le framework de test officiel pour les rôles Ansible. Il crée un conteneur (Docker ou Podman), applique votre rôle, puis vérifie que tout fonctionne.

### Concept de base

```
Cycle de vie Molecule :
  create → prepare → converge → idempotence → verify → destroy
     |         |          |             |          |         |
  Crée les  Prépare   Applique      Vérifie     Vérifie  Détruit
  conteneurs  l'env    le rôle    idempotence   les tests  l'env
```

### Installation

```bash
# Avec Docker
pip install molecule molecule-plugins[docker]

# Avec Podman (alternative sans daemon Docker)
pip install molecule molecule-plugins[podman]

# Pour les tests Python
pip install pytest-testinfra

# Prérequis Podman
# Installation de Podman sur Ubuntu :
apt-get install -y podman
# Sur Fedora/CentOS :
dnf install -y podman
```

### Mise en place de Podman

```bash
# Vérifier que Podman fonctionne
podman run hello-world

# Pour les images qui nécessitent systemd
# Il faut des images spécialement préparées
podman run -d --name test-container \
  --privileged \
  -v /sys/fs/cgroup:/sys/fs/cgroup:rw \
  geerlingguy/docker-ubuntu2204-ansible:latest \
  /lib/systemd/systemd
```

### Initialiser les tests pour un rôle

```bash
# Depuis le répertoire du rôle
cd roles/apache

# Avec Docker
molecule init scenario --driver-name docker

# Avec Podman
molecule init scenario --driver-name podman

# Créer un scénario supplémentaire (ex: avec SSL)
molecule init scenario avec_ssl --driver-name docker
```

### Structure créée par Molecule

```
roles/apache/
└── molecule/
    ├── default/              # Scénario par défaut
    │   ├── molecule.yml      # Configuration du scénario
    │   ├── converge.yml      # Playbook qui applique le rôle
    │   ├── verify.yml        # Playbook de vérification
    │   └── prepare.yml       # Préparation optionnelle
    └── avec_ssl/             # Scénario supplémentaire
        ├── molecule.yml
        ├── converge.yml
        └── verify.yml
```

### Configuration molecule.yml avec Docker

```yaml
# molecule/default/molecule.yml
---
dependency:
  name: galaxy
  options:
    ignore-certs: false
    ignore-errors: false
    role-file: requirements.yml

driver:
  name: docker

platforms:
  # Tester sur Ubuntu 22.04 avec systemd
  - name: ubuntu-22.04
    image: geerlingguy/docker-ubuntu2204-ansible:latest
    pre_build_image: true
    command: /lib/systemd/systemd    # Nécessaire pour systemd
    privileged: true                 # Nécessaire pour systemd
    volumes:
      - /sys/fs/cgroup:/sys/fs/cgroup:rw
    cgroupns_mode: host

  # Tester aussi sur Debian 12
  - name: debian-12
    image: geerlingguy/docker-debian12-ansible:latest
    pre_build_image: true
    command: /lib/systemd/systemd
    privileged: true
    volumes:
      - /sys/fs/cgroup:/sys/fs/cgroup:rw
    cgroupns_mode: host

  # Tester sur CentOS/Rocky Linux
  - name: rocky-9
    image: geerlingguy/docker-rockylinux9-ansible:latest
    pre_build_image: true
    command: /lib/systemd/systemd
    privileged: true

provisioner:
  name: ansible
  config_options:
    defaults:
      interpreter_python: auto_silent
      callback_whitelist: profile_tasks
  inventory:
    host_vars:
      ubuntu-22.04:
        ansible_python_interpreter: /usr/bin/python3
  playbooks:
    converge: converge.yml
    verify: verify.yml

verifier:
  name: ansible   # Ou 'testinfra' pour des tests Python

lint: |
  set -e
  yamllint .
  ansible-lint
```

### Configuration molecule.yml avec Podman

```yaml
# molecule/default/molecule.yml (version Podman)
---
driver:
  name: podman

platforms:
  - name: ubuntu-22.04
    image: geerlingguy/docker-ubuntu2204-ansible:latest
    pre_build_image: true
    systemd: true              # Activer systemd dans Podman
    privileged: true
    volumes:
      - /sys/fs/cgroup:/sys/fs/cgroup:rw
    # Avec Podman, on peut aussi utiliser :
    # capabilities:
    #   - SYS_ADMIN
    #   - NET_ADMIN
```

### Playbook de convergence (converge.yml)

```yaml
# molecule/default/converge.yml
---
- name: Converge
  hosts: all
  become: true

  # Variables de test pour personnaliser le rôle pendant les tests
  vars:
    apache_port: 80
    apache_document_root: /var/www/html
    apache_server_tokens: Prod

  pre_tasks:
    - name: Mettre à jour le cache apt (Debian/Ubuntu)
      ansible.builtin.apt:
        update_cache: true
        cache_valid_time: 600
      when: ansible_os_family == "Debian"

  roles:
    - role: apache    # Le rôle à tester
```

### Playbook de vérification (verify.yml)

```yaml
# molecule/default/verify.yml
---
- name: Verify
  hosts: all
  become: true
  gather_facts: false

  tasks:
    - name: Vérifier qu'Apache est installé
      ansible.builtin.package:
        name: apache2
        state: present
      check_mode: true
      register: apache_installed
      failed_when: apache_installed.changed

    - name: Vérifier que le service Apache tourne
      ansible.builtin.service:
        name: apache2
        state: started
        enabled: true
      check_mode: true
      register: apache_running
      failed_when: apache_running.changed

    - name: Vérifier que le port 80 répond
      ansible.builtin.uri:
        url: http://localhost:80
        status_code: [200, 301, 302]  # Accepter les redirections
      register: http_response

    - name: Confirmer la réponse HTTP
      ansible.builtin.assert:
        that:
          - http_response.status in [200, 301, 302]
        fail_msg: "Le serveur web ne répond pas (status={{ http_response.status }})"
        success_msg: "Le serveur web répond correctement"

    - name: Vérifier la configuration du document root
      ansible.builtin.stat:
        path: /var/www/html
      register: docroot_stat

    - name: Vérifier les permissions du document root
      ansible.builtin.assert:
        that:
          - docroot_stat.stat.exists
          - docroot_stat.stat.isdir
          - docroot_stat.stat.pw_name == "www-data"
        fail_msg: "Le document root n'a pas les bonnes propriétés"

    - name: Vérifier que Server Tokens est configuré
      ansible.builtin.lineinfile:
        path: /etc/apache2/apache2.conf
        line: "ServerTokens Prod"
        state: present
      check_mode: true
      register: server_tokens
      failed_when: server_tokens.changed
```

### Tests avec Testinfra (Python)

```python
# molecule/default/tests/test_apache.py
import pytest

def test_apache_is_installed(host):
    """Apache doit être installé"""
    apache = host.package("apache2")
    assert apache.is_installed, "Le paquet apache2 n'est pas installé"

def test_apache_is_running(host):
    """Apache doit tourner et être activé au démarrage"""
    apache = host.service("apache2")
    assert apache.is_running, "Le service apache2 n'est pas démarré"
    assert apache.is_enabled, "Le service apache2 n'est pas activé au démarrage"

def test_apache_listens_on_port_80(host):
    """Apache doit écouter sur le port 80"""
    socket = host.socket("tcp://0.0.0.0:80")
    assert socket.is_listening, "Aucun service n'écoute sur le port 80"

def test_config_file_permissions(host):
    """La configuration doit avoir les bons droits"""
    config = host.file("/etc/apache2/apache2.conf")
    assert config.exists, "Le fichier de config n'existe pas"
    assert config.user == "root", f"Propriétaire incorrect : {config.user}"
    assert config.mode == 0o644, f"Permissions incorrectes : {oct(config.mode)}"

def test_document_root_owner(host):
    """Le répertoire web doit appartenir à www-data"""
    docroot = host.file("/var/www/html")
    assert docroot.is_directory, "/var/www/html n'est pas un répertoire"
    assert docroot.user == "www-data", f"Propriétaire incorrect : {docroot.user}"

def test_apache_responds(host):
    """Apache doit répondre aux requêtes HTTP"""
    curl = host.run("curl -s -o /dev/null -w '%{http_code}' http://localhost/")
    assert curl.stdout in ["200", "301", "302"], \
        f"Apache ne répond pas correctement (code: {curl.stdout})"

def test_no_sensitive_info_in_headers(host):
    """Les headers ne doivent pas exposer la version d'Apache"""
    curl = host.run("curl -s -I http://localhost/")
    assert "Apache/2." not in curl.stdout, \
        "La version d'Apache est exposée dans les headers !"
```

```yaml
# molecule/default/molecule.yml — pour utiliser Testinfra
verifier:
  name: testinfra
  options:
    v: true              # Verbose
    p: no:cacheprovider  # Pas de cache pytest
```

### Gestion des scénarios Molecule

```
roles/apache/molecule/
├── default/         # Scénario par défaut (test de base)
├── avec_ssl/        # Test avec SSL activé
├── avec_vhosts/     # Test avec plusieurs vhosts
└── rhel/            # Test sur RedHat/CentOS
```

```bash
# Lancer un scénario spécifique
molecule test --scenario-name avec_ssl

# Lancer tous les scénarios
for scenario in $(molecule list --format plain | awk '{print $1}'); do
  molecule test --scenario-name $scenario
done
```

### Lancer les tests Molecule

```bash
molecule test           # Cycle complet (créer → converge → verify → destroy)
molecule create         # Créer les conteneurs uniquement
molecule converge       # Appliquer le rôle
molecule idempotence    # Vérifier l'idempotence (2e run → aucun 'changed')
molecule verify         # Lancer les vérifications uniquement
molecule destroy        # Supprimer les conteneurs
molecule login --host ubuntu-22.04   # Entrer dans le conteneur

# Mode debug (garder les conteneurs après échec)
molecule test --destroy=never
molecule converge
molecule verify         # Examiner les problèmes
```

### Débogage des problèmes Molecule

```bash
# Lancer en mode debug
molecule --debug converge 2>&1 | tee molecule_debug.log

# Se connecter dans le conteneur pour déboguer manuellement
molecule login --host ubuntu-22.04

# Dans le conteneur :
systemctl status apache2
journalctl -u apache2
cat /var/log/apache2/error.log
```

### Configuration pour le fonctionnement avec SystemD

Le principal défi de Molecule est de faire fonctionner systemd dans les conteneurs.

```yaml
# molecule/default/molecule.yml — Configuration SystemD
platforms:
  - name: ubuntu-22.04
    image: geerlingguy/docker-ubuntu2204-ansible:latest
    pre_build_image: true
    # Configuration nécessaire pour systemd
    command: /lib/systemd/systemd
    privileged: true
    cgroupns_mode: host
    volumes:
      - /sys/fs/cgroup:/sys/fs/cgroup:rw
    tmpfs:
      - /run
      - /tmp
    capabilities:
      - SYS_ADMIN
```

### Intégration dans GitHub Actions

```yaml
# .github/workflows/molecule.yml
name: Tests Molecule
on: [push, pull_request]

jobs:
  molecule:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        role: [apache, mysql, ldap, common]

    steps:
      - uses: actions/checkout@v4

      - name: Installer Python et Molecule
        run: |
          pip install molecule molecule-plugins[docker] pytest-testinfra
          pip install ansible-lint yamllint

      - name: Tester le rôle ${{ matrix.role }}
        run: cd roles/${{ matrix.role }} && molecule test
        env:
          PY_COLORS: '1'
          ANSIBLE_FORCE_COLOR: '1'
```

---

# PARTIE III — SÉCURITÉ ET SECRETS

---

## 28. Sécurité et bonnes pratiques

> **Ansible est un vecteur d'attaque critique.** Il a accès root à TOUTE votre infrastructure. Un playbook malveillant, une collection compromise ou un secret exposé peut détruire des centaines de serveurs en quelques minutes. Les attaques supply chain ciblent particulièrement les outils d'automatisation.

### Principe du moindre privilège

```yaml
# Mauvais : connexion directe en root
[all:vars]
ansible_user=root

# Bon : utilisateur dédié avec sudo
[all:vars]
ansible_user=ansible_deployer
```

**Créer l'utilisateur Ansible sur les serveurs cibles :**
```bash
# Créer l'utilisateur
useradd -m -s /bin/bash -c "Ansible Deployer" ansible_deployer

# Configurer sudo sans mot de passe (pour l'automatisation)
# ATTENTION : limiter autant que possible les commandes autorisées
cat > /etc/sudoers.d/ansible_deployer << 'EOF'
# Ansible deployer - accès sudo sans mot de passe
ansible_deployer ALL=(ALL) NOPASSWD: ALL
EOF
chmod 440 /etc/sudoers.d/ansible_deployer

# Ou, mieux : limiter aux commandes nécessaires
cat > /etc/sudoers.d/ansible_deployer << 'EOF'
ansible_deployer ALL=(ALL) NOPASSWD: /usr/bin/apt-get, /bin/systemctl
EOF

# SSH par clé uniquement
mkdir -p /home/ansible_deployer/.ssh
chmod 700 /home/ansible_deployer/.ssh
echo "ssh-rsa AAAA... ansible@control-node" \
  >> /home/ansible_deployer/.ssh/authorized_keys
chmod 600 /home/ansible_deployer/.ssh/authorized_keys
chown -R ansible_deployer:ansible_deployer /home/ansible_deployer/.ssh

# Désactiver l'authentification par mot de passe pour cet utilisateur
# (dans /etc/ssh/sshd_config)
Match User ansible_deployer
    PasswordAuthentication no
    PubkeyAuthentication yes
```

### Valider les certificats SSL

```yaml
# JAMAIS faire ça en production :
- ansible.builtin.get_url:
    validate_certs: no    # DANGER absolu !
- ansible.builtin.uri:
    validate_certs: false # DANGER absolu !

# validate_certs: yes est la valeur par défaut
# Ne JAMAIS la surcharger sauf en environnement de développement isolé
```

### Vérifier les collections et rôles externes

```yaml
# requirements.yml — Toujours pincer les versions !
collections:
  - name: community.general
    version: "7.3.0"    # Version PRÉCISE, jamais "latest"
  - name: amazon.aws
    version: "7.0.0"

roles:
  - name: geerlingguy.apache
    version: "3.2.0"
```

```bash
# Vérifier l'intégrité des collections installées
ansible-galaxy collection verify community.general

# Scanner ses collections avec Checkov
pip install checkov
checkov -d . --framework ansible
```

### Masquer les données sensibles dans les logs

```yaml
tasks:
  # Ne jamais afficher dans les logs
  - name: Définir le mot de passe
    ansible.builtin.user:
      name: monapp
      password: "{{ vault_user_password | password_hash('sha512') }}"
    no_log: true   # Masquer TOUTE la sortie de cette tâche

  # Pour les variables qui ne doivent jamais apparaître
  - name: Exécuter avec credentials
    ansible.builtin.shell: curl -u "user:{{ vault_api_key }}" https://api.example.com
    no_log: true
    register: api_result
```

### Scanner avec Checkov

```bash
pip install checkov

# Scanner un répertoire
checkov -d ./playbooks --framework ansible

# Ce que Checkov détecte :
# CKV_ANSIBLE_1 : validate_certs: no
# CKV_ANSIBLE_2 : Mots de passe en clair
# CKV_ANSIBLE_3 : Permissions de fichiers trop larges (0777)
# CKV_ANSIBLE_4 : shell/command non sécurisé

# Générer un rapport JSON
checkov -d . --framework ansible -o json > rapport_securite.json
```

### Règles de sécurité absolues

```
À TOUJOURS FAIRE :
  Utilisateur Ansible dédié, jamais root
  Authentification SSH par clé uniquement
  Ansible Vault pour TOUS les secrets (mots de passe, clés API, tokens)
  Versions PRÉCISES fixées pour les collections et rôles
  Scanner avec ansible-lint ET Checkov en CI/CD
  Journaliser les exécutions (AWX, Semaphore, ou logs)
  Rotation régulière des secrets Vault (tous les 3 mois minimum)
  Revue de code pour les playbooks (pas de merge direct en main)
  Utiliser no_log: true pour les tâches avec des données sensibles

NE JAMAIS FAIRE :
  Mots de passe ou tokens en clair dans les fichiers YAML
  validate_certs: no (même "temporairement")
  Se connecter en root directement via Ansible
  ignore_errors: yes sans raison explicite et documentée
  Utiliser shell/command quand un module idempotent existe
  Committer un fichier Vault déchiffré dans Git
  Partager la clé Vault dans le code source ou les issues
  Installer des collections sans vérifier la version
  Utiliser des collections de sources inconnues ou non maintenues
```

---

## 29. Ansible Vault — Protéger ses secrets

Ansible Vault chiffre vos fichiers de secrets avec **AES-256**. Vos variables sensibles sont protégées, même si quelqu'un accède à votre dépôt Git.

### Créer et gérer des fichiers Vault

```bash
# Créer un nouveau fichier chiffré (ouvre votre éditeur)
ansible-vault create group_vars/all/vault.yml

# Chiffrer un fichier existant
ansible-vault encrypt vars/passwords.yml

# Voir le contenu d'un fichier chiffré (sans déchiffrer sur disque)
ansible-vault view vars/passwords.yml

# Modifier un fichier chiffré (déchiffre → ouvre l'éditeur → rechiffre)
ansible-vault edit vars/passwords.yml

# Déchiffrer sur disque (ATTENTION : le fichier redevient lisible !)
ansible-vault decrypt vars/passwords.yml

# Changer le mot de passe de chiffrement
ansible-vault rekey vars/passwords.yml
```

### Chiffrement de champ unique

```bash
ansible-vault encrypt_string 'MonMotDePasse123' --name 'db_password'
# Résultat :
# db_password: !vault |
#   $ANSIBLE_VAULT;1.1;AES256
#   66386439393432326466636666303938...
```

```yaml
# Utilisation dans un fichier vars.yml non chiffré :
db_user: app_user
db_host: db.example.com
db_password: !vault |
  $ANSIBLE_VAULT;1.1;AES256
  66386439393432326466636666303938616231306236633465393837333534353634376437643339
  6464363531623939313836343832313131313336346636630a376561393430613030326334313561
  ...
```

### Mécanismes de chiffrement alternatifs

```yaml
# Au lieu de Vault, récupérer depuis HashiCorp Vault
vars:
  db_password: "{{ lookup('hashi_vault', 'secret=secret/data/db:password') }}"

# Depuis AWS Secrets Manager
  api_key: "{{ lookup('amazon.aws.aws_secret', 'MyApp/ApiKey') }}"

# Depuis KeePass (plugin personnalisé)
  ldap_bind_password: "{{ lookup('keepass', 'path=Servers/LDAP password=master.kdbx') }}"
```

### Structure recommandée avec Vault

```
group_vars/
├── all/
│   ├── vars.yml       # Variables publiques (non chiffrées, commitées)
│   └── vault.yml      # Variables secrètes (CHIFFRÉES, commitées)
└── webservers/
    ├── vars.yml
    └── vault.yml
```

```yaml
# group_vars/all/vars.yml (non chiffré, committé dans Git)
db_user: app_user
db_host: db.example.com
# La variable db_password vient de vault.yml (chiffré)
db_password: "{{ vault_db_password }}"
api_key: "{{ vault_api_key }}"

# group_vars/all/vault.yml (CHIFFRÉ avec ansible-vault encrypt)
# Contenu AVANT chiffrement :
# vault_db_password: MonMotDePasseSecret123
# vault_api_key: sk-abc123xyz
```

> **Convention** : préfixer les variables sensibles par `vault_` pour distinguer les vraies variables de leurs référenceurs dans `vars.yml`.

### Utiliser Vault lors de l'exécution

```bash
# Méthode 1 : saisie interactive du mot de passe
ansible-playbook -i hosts site.yml --ask-vault-pass

# Méthode 2 : fichier de mot de passe local (ne pas committer !)
echo "mon_mot_de_passe_vault" > ~/.vault_pass
chmod 600 ~/.vault_pass
ansible-playbook -i hosts site.yml --vault-password-file ~/.vault_pass

# Méthode 3 : variable d'environnement
export ANSIBLE_VAULT_PASSWORD_FILE=~/.vault_pass
ansible-playbook -i hosts site.yml

# Méthode 4 : script qui retourne le mot de passe
# (utile pour récupérer depuis un gestionnaire de secrets)
cat > ~/.vault_script.sh << 'EOF'
#!/bin/bash
# Récupérer le mot de passe Vault depuis HashiCorp Vault ou autre
vault kv get -field=ansible_vault_pass secret/ansible
EOF
chmod 700 ~/.vault_script.sh
ansible-playbook -i hosts site.yml --vault-password-file ~/.vault_script.sh

# Méthode 5 : IDs Vault multiples (plusieurs environnements)
ansible-playbook site.yml \
  --vault-id prod@~/.vault_prod \
  --vault-id staging@~/.vault_staging
```

### Intégration GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4

      - name: Installer Ansible
        run: pip install ansible

      - name: Configurer la clé SSH
        uses: webfactory/ssh-agent@v0.8.0
        with:
          ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY_PROD }}

      - name: Déployer avec Vault
        run: |
          # Écrire le mot de passe Vault dans un fichier temporaire
          printf '%s' "$VAULT_PASS" > /tmp/vault.pass
          chmod 600 /tmp/vault.pass
          # Exécuter le playbook
          ansible-playbook -i inventories/production/hosts site.yml \
            --vault-password-file /tmp/vault.pass
          # Supprimer de façon sécurisée
          shred -u /tmp/vault.pass
        env:
          VAULT_PASS: ${{ secrets.VAULT_PASS_PROD }}
```

**Ajouter le secret dans GitHub :**
1. Dépôt → Settings → Secrets and variables → Actions
2. New repository secret
3. Name : `VAULT_PASS_PROD` / Value : votre mot de passe Vault
4. Add secret

> **Règles CI/CD pour les secrets :**
> - Masquer les secrets dans les logs (option par défaut GitHub/GitLab)
> - Limiter l'accès aux branches protégées (option `Protected` GitLab)
> - Rotation régulière (changer le mot de passe Vault tous les 3 mois)
> - Ne jamais afficher `echo $SECRET` dans les scripts (visible dans les logs)
> - Utiliser `printf '%s'` plutôt que `echo` (évite les sauts de ligne)

---

# PARTIE IV — DÉBOGAGE ET GESTION DES ERREURS

---

## 30. Débogage des playbooks

### Mode verbeux

```bash
ansible-playbook site.yml -v      # Résultats des tâches
ansible-playbook site.yml -vv     # + infos sur les fichiers et modules
ansible-playbook site.yml -vvv    # + commandes SSH exactes
ansible-playbook site.yml -vvvv   # + connexions réseau complètes
```

### Simulation (--check et --diff)

```bash
# Ne rien modifier, voir ce qui changerait
ansible-playbook site.yml --check

# Voir aussi les différences dans les fichiers modifiés
ansible-playbook site.yml --check --diff

# Désactiver le check_mode pour une tâche spécifique
tasks:
  - name: Cette tâche tourne même en --check
    ansible.builtin.shell: /opt/check_health.sh
    check_mode: false    # Exclure du mode simulation
```

### Consultation d'informations avec le module debug

```yaml
tasks:
  # Afficher une variable
  - name: Afficher la distribution OS
    ansible.builtin.debug:
      var: ansible_distribution

  # Afficher plusieurs infos formatées
  - name: Rapport sur le serveur
    ansible.builtin.debug:
      msg: >
        Serveur {{ inventory_hostname }}
        — OS : {{ ansible_distribution }} {{ ansible_distribution_version }}
        — RAM : {{ ansible_memtotal_mb }} MB
        — CPUs : {{ ansible_processor_count }}
        — IP : {{ ansible_default_ipv4.address }}

  # Afficher le résultat d'une commande
  - name: Vérifier l'espace disque
    ansible.builtin.shell: df -h /
    register: disk_usage
    changed_when: false

  - name: Afficher l'espace disque
    ansible.builtin.debug:
      var: disk_usage.stdout_lines

  # Message visible seulement en mode -vv
  - name: Message de débogage discret
    ansible.builtin.debug:
      msg: "Exécution de la tâche X sur {{ inventory_hostname }}"
      verbosity: 2    # Visible seulement avec -vv

  # Afficher toutes les variables d'un hôte
  - name: Afficher toutes les variables
    ansible.builtin.debug:
      var: hostvars[inventory_hostname]
```

### Le debugger interactif

```yaml
---
- hosts: all
  debugger: on_failed    # always | never | on_failed | on_unreachable | on_skipped
  tasks:
    - name: Installer un paquet
      ansible.builtin.package:
        name: "{{ pkg_name }}"   # Si pkg_name non défini → va échouer
```

Exemple de session de débogage :
```
TASK [Installer un paquet] ****
fatal: [host1]: FAILED! => {"msg": "pkg_name is undefined"}
[host1] TASK: Installer un paquet (debug)>
```

| Commande | Action |
|---|---|
| `p task.args` | Afficher les arguments de la tâche |
| `task.args['clé'] = valeur` | Modifier un argument |
| `p task_vars` | Afficher les variables disponibles |
| `task_vars['pkg_name'] = 'nginx'` | Définir une variable |
| `u` (update_task) | Recréer la tâche après modif des vars |
| `r` (redo) | Relancer la tâche |
| `c` (continue) | Passer à la tâche suivante |
| `q` (quit) | Quitter le débogage |

### Consultation et modification d'éléments

```bash
# Définir une variable depuis la ligne de commande (pour tester)
ansible-playbook site.yml -e "debug_mode=true pkg_name=nginx"

# Relancer depuis une étape spécifique
ansible-playbook site.yml --start-at-task="Configurer Nginx"

# Mode interactif (confirmation avant chaque tâche)
ansible-playbook site.yml --step
# → Perform task: Installer nginx (y/n/c)?
# y = exécuter, n = ignorer, c = continuer sans demander
```

### Profiling des opérations

```ini
# ansible.cfg
[defaults]
callback_whitelist = profile_tasks,profile_roles,timer
```

```bash
ansible-playbook site.yml
# Affiche en fin d'exécution :
# TASK: Installer nginx ................................................................ 12.34s
# TASK: Configurer Nginx ................................................................ 8.21s
# ...
# PLAY RECAP ............................................................................总 45.67s
```

### Changer le format de sortie

```ini
# ansible.cfg
[defaults]
stdout_callback = yaml       # yaml | json | minimal | debug | dense
```

```bash
# Sortie standard :
# TASK [Installer nginx]
# ok: [web1]

# Sortie YAML (plus lisible) :
# TASK [Installer nginx]
# ok: [web1] =>
#   changed: false
#   msg: "nginx est déjà installé"

# Sortie JSON (pour intégration) :
# {"plays": [{"tasks": [{"task": {"name": "..."}, "hosts": {...}}]}]}
```

---

## 31. Gestion des échecs et Rollbacks (Blocks)

### Les Blocks : try / catch / finally d'Ansible

```yaml
---
- hosts: webservers
  become: true
  tasks:
    - block:
        # ── TRY — Tâches principales ─────────────────────
        - name: Sauvegarder la configuration actuelle
          ansible.builtin.copy:
            src: /etc/app/config.conf
            dest: /etc/app/config.conf.bak
            remote_src: yes

        - name: Déployer la nouvelle version
          ansible.builtin.unarchive:
            src: /tmp/app-v2.tar.gz
            dest: /opt/monapp/
            remote_src: yes

        - name: Redémarrer l'application
          ansible.builtin.service:
            name: monapp
            state: restarted

        - name: Vérifier que l'application répond
          ansible.builtin.uri:
            url: http://localhost:8080/health
            status_code: 200
          retries: 5
          delay: 3

      rescue:
        # ── CATCH — Si une tâche du block échoue ─────────
        - name: "ROLLBACK : Restaurer l'ancienne configuration"
          ansible.builtin.copy:
            src: /etc/app/config.conf.bak
            dest: /etc/app/config.conf
            remote_src: yes

        - name: "ROLLBACK : Redémarrer avec l'ancienne version"
          ansible.builtin.service:
            name: monapp
            state: restarted

        - name: Alerter l'équipe via Slack
          ansible.builtin.uri:
            url: https://hooks.slack.com/services/XXX/YYY/ZZZ
            method: POST
            body_format: json
            body:
              text: >
                DÉPLOIEMENT ÉCHOUÉ sur {{ inventory_hostname }}
                — Rollback effectué automatiquement
          delegate_to: localhost

        # Marquer le play comme en erreur malgré le rescue
        - name: Signaler l'échec
          ansible.builtin.fail:
            msg: "Le déploiement a échoué et un rollback a été effectué"

      always:
        # ── FINALLY — Toujours exécuté (succès ou échec) ─
        - name: Vérifier l'état du service
          ansible.builtin.service_facts:

        - name: Rapport d'état final
          ansible.builtin.debug:
            msg: >
              État de monapp :
              {{ ansible_facts.services['monapp.service'].state | default('inconnu') }}

        - name: Nettoyer les archives temporaires
          ansible.builtin.file:
            path: /tmp/app-v2.tar.gz
            state: absent
          ignore_errors: true
```

### Autres mécanismes de gestion d'erreurs

```yaml
tasks:
  # Continuer malgré une erreur
  - name: Tentative optionnelle
    ansible.builtin.shell: /opt/script_optionnel.sh
    ignore_errors: true
    register: result_optionnel

  # Personnaliser la condition d'échec
  - name: Vérification avec critères personnalisés
    ansible.builtin.shell: /opt/check_health.sh
    register: health_check
    failed_when:
      - health_check.rc != 0
      - "'HEALTHY' not in health_check.stdout"
    # → Réussit si rc=0 OU si 'HEALTHY' est dans stdout

  # Personnaliser quand une tâche est "changed"
  - name: Synchronisation avec changed_when
    ansible.builtin.shell: /opt/sync_data.sh
    register: sync_result
    changed_when: "'synchronized' in sync_result.stdout"
    # → "ok" si stdout ne contient pas 'synchronized'
    # → "changed" si stdout contient 'synchronized'

  # Réessayer automatiquement jusqu'à succès
  - name: Attendre que le service soit disponible
    ansible.builtin.uri:
      url: http://localhost:8080/health
      status_code: 200
    register: health
    until: health.status == 200
    retries: 20     # Réessayer jusqu'à 20 fois
    delay: 5        # Attendre 5 secondes entre chaque essai
    # Attendra au maximum 100 secondes (20 × 5s)
```

---

# PARTIE V — PERSONNALISATION D'ANSIBLE

---

## 32. Sortie Ansible et centralisation (Callbacks, ARA, Syslog)

Les **plugins de callback** contrôlent comment Ansible affiche et enregistre les résultats. C'est le mécanisme de "sortie" d'Ansible.

### Gestion de la sortie standard

```ini
# ansible.cfg — Options d'affichage
[defaults]
# Format de sortie
stdout_callback = yaml        # yaml | json | minimal | debug | dense

# Colorisation
force_color = 1               # Forcer les couleurs (utile en CI)
nocolor = 0                   # 0 = couleurs activées

# Le fameux cowsay (si installé, Ansible l'utilise)
nocows = 1                    # Désactiver cowsay (recommandé en production)

# Journalisation
log_path = /var/log/ansible/ansible.log
```

### Quelques plugins d'affichage alternatifs

```ini
# ansible.cfg
[defaults]
# Callbacks disponibles
# stdout_callback = default    # Sortie classique (défaut)
# stdout_callback = yaml       # Format YAML lisible
# stdout_callback = json       # Format JSON pour intégration
# stdout_callback = minimal    # Sortie minimale (juste les erreurs)
# stdout_callback = dense      # Une ligne par tâche
# stdout_callback = debug      # Très verbeux

# Activer plusieurs callbacks en même temps
callback_whitelist = profile_tasks, timer, mail
```

### Profiling des opérations

```ini
# ansible.cfg
[defaults]
callback_whitelist = profile_tasks, profile_roles, timer
```

Résultat affiché en fin d'exécution :
```
Monday 01 April 2026  14:30:00 +0000 (0:00:00.123)       0:02:45.678 *****
===============================================================================
Installer nginx --------------------------------------------------------- 15.32s
Configurer Nginx -------------------------------------------------------- 8.21s
Créer les vhosts --------------------------------------------------------- 3.45s
...
total ------------------------------------------------------------------- 165.43s
```

### Centralisation via Syslog

```ini
# ansible.cfg
[defaults]
# Envoyer les logs vers syslog
syslog_facility = LOG_LOCAL0   # Facility syslog à utiliser
log_path = /var/log/ansible/ansible.log
```

```bash
# Configurer rsyslog pour Ansible
cat > /etc/rsyslog.d/ansible.conf << 'EOF'
:programname, isequal, "ansible" /var/log/ansible/ansible.log
& stop
EOF
service rsyslog restart
```

### Centralisation via Logstash (Elasticsearch)

```python
# plugins/callback/logstash.py — Callback vers Elasticsearch
from ansible.plugins.callback import CallbackBase
import json, datetime, socket

class CallbackModule(CallbackBase):
    CALLBACK_TYPE = 'notification'
    CALLBACK_NAME = 'logstash_callback'
    CALLBACK_NEEDS_WHITELIST = True

    def __init__(self):
        super(CallbackModule, self).__init__()
        import logstash
        self.logger = logging.getLogger('ansible')
        self.logger.setLevel(logging.DEBUG)
        self.logger.addHandler(logstash.TCPLogstashHandler(
            'logstash.example.com', 5000, version=1
        ))

    def v2_runner_on_ok(self, result):
        data = {
            'status': 'ok',
            'host': result._host.name,
            'task': result._task.name,
            'changed': result._result.get('changed', False),
            'timestamp': datetime.datetime.utcnow().isoformat(),
            'ansible_host': socket.gethostname()
        }
        self.logger.info("Ansible OK", extra=data)

    def v2_runner_on_failed(self, result, ignore_errors=False):
        data = {
            'status': 'failed',
            'host': result._host.name,
            'task': result._task.name,
            'msg': result._result.get('msg', ''),
            'timestamp': datetime.datetime.utcnow().isoformat()
        }
        self.logger.error("Ansible FAILED", extra=data)
```

### Centralisation avec ARA (Ansible Run Analysis)

ARA est l'outil de centralisation des logs Ansible le plus populaire. Il offre une interface web complète.

```bash
# Installer ARA
pip install ara[server]

# Configurer Ansible pour utiliser ARA
# (ARA se configure automatiquement comme callback)
export ANSIBLE_CALLBACK_PLUGINS="$(python3 -m ara.setup.callback_plugins)"
export ANSIBLE_ACTION_PLUGINS="$(python3 -m ara.setup.action_plugins)"
export ANSIBLE_LOOKUP_PLUGINS="$(python3 -m ara.setup.lookup_plugins)"

# Ou dans ansible.cfg
[defaults]
callback_plugins    = ~/.ara/plugins/callback
action_plugins      = ~/.ara/plugins/action
lookup_plugins      = ~/.ara/plugins/lookup

# Démarrer le serveur ARA
ara-manage runserver 0.0.0.0:8000

# Les exécutions de playbooks sont maintenant enregistrées automatiquement
ansible-playbook -i hosts site.yml
# → Accessible sur http://localhost:8000

# Configurer une base de données persistante
export ARA_DATABASE_NAME=/opt/ara/ansible.sqlite
# Ou MySQL/PostgreSQL en production :
export ARA_DATABASE_NAME=ara
export ARA_DATABASE_USER=ara
export ARA_DATABASE_PASSWORD=password
export ARA_DATABASE_HOST=db.example.com
```

**Interface ARA** : tableaux de bord, recherche dans les tâches, comparaison entre exécutions, statistiques.

### Écriture de son propre callback d'affichage

```python
# plugins/callback/mon_callback.py
"""
Plugin de callback personnalisé
→ Envoie les résultats vers une API REST

Pour activer dans ansible.cfg :
[defaults]
callback_whitelist = mon_callback
callback_plugins   = plugins/callback
"""

from ansible.plugins.callback import CallbackBase
import requests
import json

class CallbackModule(CallbackBase):
    CALLBACK_TYPE = 'notification'
    CALLBACK_NAME = 'mon_callback'
    CALLBACK_NEEDS_WHITELIST = True

    # Configuration de l'API
    API_URL = "https://api.exemple.com/ansible/events"

    def _envoyer_evenement(self, type_evenement, host, task, data=None):
        """Envoyer un événement vers l'API"""
        payload = {
            'type': type_evenement,
            'host': host,
            'task': task,
            'data': data or {}
        }
        try:
            requests.post(self.API_URL, json=payload, timeout=5)
        except requests.RequestException:
            pass   # Ne pas bloquer Ansible si l'API est indisponible

    # ── Surcharge des méthodes de callback ─────────────

    def v2_playbook_on_start(self, playbook):
        """Appelé au début d'un playbook"""
        self._envoyer_evenement('playbook_start', 'all', playbook._file_name)

    def v2_runner_on_ok(self, result):
        """Appelé quand une tâche réussit"""
        self._envoyer_evenement(
            'task_ok',
            result._host.name,
            result._task.name,
            {'changed': result._result.get('changed', False)}
        )

    def v2_runner_on_failed(self, result, ignore_errors=False):
        """Appelé quand une tâche échoue"""
        self._envoyer_evenement(
            'task_failed',
            result._host.name,
            result._task.name,
            {'msg': result._result.get('msg', ''), 'ignore': ignore_errors}
        )

    def v2_runner_on_unreachable(self, result):
        """Appelé quand un hôte est inaccessible"""
        self._envoyer_evenement(
            'host_unreachable',
            result._host.name,
            result._task.name
        )

    def v2_playbook_on_stats(self, stats):
        """Appelé à la fin d'un playbook avec le récapitulatif"""
        recap = {}
        hosts = sorted(stats.processed.keys())
        for host in hosts:
            s = stats.summarize(host)
            recap[host] = s
        self._envoyer_evenement('playbook_end', 'all', 'RECAP', recap)
```

### Nomenclature des méthodes de callback

| Méthode | Déclencheur |
|---|---|
| `v2_playbook_on_start` | Début d'un playbook |
| `v2_playbook_on_play_start` | Début d'un play |
| `v2_playbook_on_task_start` | Début d'une tâche |
| `v2_runner_on_ok` | Tâche réussie (ok/changed) |
| `v2_runner_on_failed` | Tâche en échec |
| `v2_runner_on_skipped` | Tâche ignorée (when=false) |
| `v2_runner_on_unreachable` | Hôte inaccessible |
| `v2_playbook_on_handler_task_start` | Début d'un handler |
| `v2_playbook_on_stats` | Récapitulatif final |

---

## 33. Écriture de modules Ansible personnalisés

### Pourquoi écrire un module ?

Un module personnalisé est nécessaire quand :
- Aucun module existant ne fait exactement ce dont vous avez besoin
- Vous devez interagir avec une API ou base de données spécifique
- Vous voulez une opération idempotente et gérer `--check` correctement

### Mécanisme d'appel des modules Python

Quand Ansible exécute un module, il :
1. Génère un fichier Python autonome (AnsiballZ) avec le code du module + les arguments
2. Envoie ce fichier sur le serveur distant via SSH
3. L'exécute avec Python
4. Récupère le résultat JSON
5. Supprime le fichier temporaire

```bash
# Activer les traces pour voir les fichiers temporaires
ANSIBLE_KEEP_REMOTE_FILES=1 ansible-playbook site.yml -vvv

# Les fichiers sont dans :
# ~/.ansible/tmp/ansible-tmp-xxx/AnsiballZ_monmodule.py
```

### Création d'un module — Exemple complet

```python
#!/usr/bin/python
# -*- coding: utf-8 -*-

# library/gestion_schema_bdd.py
# Module pour gérer les schémas de base de données

DOCUMENTATION = r'''
---
module: gestion_schema_bdd
short_description: Gère les schémas de base de données
description:
  - Crée, modifie ou supprime des schémas dans une base de données
  - Gère l'idempotence (ne recrée pas si déjà existant)
  - Supporte le mode --check d'Ansible
version_added: "1.0"
options:
  nom:
    description: Le nom du schéma
    required: true
    type: str
  etat:
    description: L'état souhaité du schéma
    required: false
    type: str
    default: present
    choices: ['present', 'absent']
  charset:
    description: Jeu de caractères du schéma
    required: false
    type: str
    default: utf8mb4
  db_host:
    description: Hôte de la base de données
    required: true
    type: str
  db_user:
    description: Utilisateur de la base de données
    required: true
    type: str
  db_password:
    description: Mot de passe (ne jamais loguer !)
    required: true
    type: str
    no_log: true   # Masquer dans les logs
author:
  - Mon Nom (@mon_github)
'''

EXAMPLES = r'''
# Créer un schéma
- name: Créer le schéma de l'application
  gestion_schema_bdd:
    nom: monapp_db
    etat: present
    charset: utf8mb4
    db_host: localhost
    db_user: root
    db_password: "{{ vault_db_root_password }}"

# Supprimer un schéma
- name: Supprimer le schéma de test
  gestion_schema_bdd:
    nom: test_db
    etat: absent
    db_host: localhost
    db_user: root
    db_password: "{{ vault_db_root_password }}"
'''

RETURN = r'''
schema:
  description: Informations sur le schéma créé/modifié
  returned: when changed
  type: dict
  sample: {'nom': 'monapp_db', 'charset': 'utf8mb4', 'etat': 'created'}
'''

from ansible.module_utils.basic import AnsibleModule

def schema_existe(cursor, nom):
    """Vérifier si un schéma existe"""
    cursor.execute(
        "SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = %s",
        (nom,)
    )
    return cursor.fetchone() is not None

def creer_schema(cursor, nom, charset):
    """Créer un schéma"""
    cursor.execute(
        f"CREATE DATABASE `{nom}` CHARACTER SET {charset} COLLATE {charset}_unicode_ci"
    )

def supprimer_schema(cursor, nom):
    """Supprimer un schéma"""
    cursor.execute(f"DROP DATABASE IF EXISTS `{nom}`")

def run_module():
    # Définir les paramètres du module
    module_args = dict(
        nom=dict(type='str', required=True),
        etat=dict(type='str', default='present', choices=['present', 'absent']),
        charset=dict(type='str', default='utf8mb4'),
        db_host=dict(type='str', required=True),
        db_user=dict(type='str', required=True),
        db_password=dict(type='str', required=True, no_log=True),  # Masqué dans les logs !
    )

    # Résultat par défaut
    result = dict(
        changed=False,
        schema={}
    )

    # Créer l'objet module
    module = AnsibleModule(
        argument_spec=module_args,
        supports_check_mode=True   # Ce module supporte --check !
    )

    nom = module.params['nom']
    etat = module.params['etat']
    charset = module.params['charset']

    # Connexion à la base de données
    try:
        import pymysql
        conn = pymysql.connect(
            host=module.params['db_host'],
            user=module.params['db_user'],
            password=module.params['db_password'],
            connect_timeout=10
        )
        cursor = conn.cursor()
    except Exception as e:
        module.fail_json(msg=f"Impossible de se connecter à la base : {str(e)}")

    try:
        existe = schema_existe(cursor, nom)

        if etat == 'present' and not existe:
            result['changed'] = True
            result['schema'] = {'nom': nom, 'charset': charset, 'etat': 'created'}

            # Si on est en mode --check, ne pas modifier !
            if not module.check_mode:
                creer_schema(cursor, nom, charset)
                conn.commit()

        elif etat == 'absent' and existe:
            result['changed'] = True
            result['schema'] = {'nom': nom, 'etat': 'deleted'}

            if not module.check_mode:
                supprimer_schema(cursor, nom)
                conn.commit()

        # Si déjà dans l'état souhaité : result['changed'] reste False

        # Gérer l'option diff d'Ansible
        if module._diff and result['changed']:
            result['diff'] = {
                'before': {'schema': nom, 'existe': existe},
                'after': {'schema': nom, 'existe': etat == 'present'}
            }

    except Exception as e:
        module.fail_json(msg=f"Erreur lors de l'opération : {str(e)}")
    finally:
        cursor.close()
        conn.close()

    module.exit_json(**result)

if __name__ == '__main__':
    run_module()
```

```yaml
# Utilisation dans un playbook
# (placer le module dans library/ à la racine du projet)
- name: Créer le schéma de l'application
  gestion_schema_bdd:
    nom: monapp_db
    etat: present
    db_host: "{{ db_host }}"
    db_user: root
    db_password: "{{ vault_db_root_password }}"
  register: schema_result

- name: Afficher le résultat
  ansible.builtin.debug:
    var: schema_result
```

### Cas particulier des modules facts

Un module facts enrichit les facts collectés par `ansible.builtin.setup`.

```python
# library/custom_facts.py
from ansible.module_utils.basic import AnsibleModule

def run_module():
    module = AnsibleModule(argument_spec={}, supports_check_mode=True)

    # Collecter des informations personnalisées
    facts = {
        'app_version': open('/opt/app/VERSION').read().strip(),
        'app_install_date': os.path.getmtime('/opt/app'),
        'app_config_valid': os.path.exists('/etc/app/config.conf')
    }

    # Retourner les facts — ils seront disponibles comme ansible_local.custom_*
    module.exit_json(
        changed=False,
        ansible_facts={'custom_app': facts}
    )
```

---

## 34. Écriture de filtres Jinja2 et lookups personnalisés

### Retour sur les filtres Jinja — Tests et exemples

```bash
# Tester un filtre Jinja interactivement
ansible localhost -m debug -a "msg={{ 'bonjour' | upper }}"
ansible localhost -m debug -a "msg={{ [3,1,2] | sort | join(', ') }}"
ansible localhost -m debug -a "msg={{ 'motdepasse' | password_hash('sha512') }}"
```

### Exemples avancés de filtres intégrés

```yaml
tasks:
  - ansible.builtin.debug:
      msg:
        # ── Valeur par défaut et validation ──
        - "{{ variable | default('N/A') }}"
        - "{{ nom | mandatory }}"           # Erreur si non défini
        - "{{ chemin | mandatory('Le chemin est requis') }}"

        # ── Conversion de type ──
        - "{{ '42' | int }}"               # 42
        - "{{ 3.14 | round(1) }}"          # 3.1
        - "{{ true | bool }}"              # True
        - "{{ 'true' | bool }}"            # True

        # ── Chargement de données ──
        - "{{ '[1,2,3]' | from_json }}"
        - "{{ 'key: value' | from_yaml }}"

        # ── Gestion de listes ──
        - "{{ [1,2,3,4,5] | select('even') | list }}"  # [2, 4]
        - "{{ [1,2,3] | map('pow', 2) | list }}"        # [1, 4, 9]
        - "{{ [[1,2],[3,4]] | flatten }}"               # [1, 2, 3, 4]
        - "{{ [1,2] | product([3,4]) | list }}"         # [(1,3),(1,4),(2,3),(2,4)]

        # ── Tables de hachage (dictionnaires) ──
        - "{{ {'a': 1} | combine({'b': 2}) }}"          # {'a': 1, 'b': 2}
        - "{{ mon_dict | dict2items }}"                  # Convertir dict en liste
        - "{{ ma_liste | items2dict }}"                  # Convertir liste en dict

        # ── Calcul de sommes de hachage ──
        - "{{ 'texte' | hash('sha256') }}"
        - "{{ 'fichier.txt' | checksum }}"

        # ── Expressions régulières ──
        - "{{ 'Hello World' | regex_search('W\\w+') }}"       # World
        - "{{ 'a1b2c3' | regex_replace('[0-9]', 'X') }}"     # aXbXcX
```

### Test de comparaison de mots de passe salés

```python
# filter_plugins/password_filters.py
"""
Filtre pour comparer un mot de passe en clair avec son hash salé.
Utilisation : {{ password_clair | verifier_hash(hash_stocke) }}
"""

import crypt
import hmac

def verifier_hash(password_clair, hash_stocke):
    """Comparer un mot de passe avec son hash de façon sécurisée"""
    hash_calcule = crypt.crypt(password_clair, hash_stocke)
    # Comparaison sécurisée contre les attaques timing
    return hmac.compare_digest(hash_calcule, hash_stocke)

def masquer_secret(valeur, longueur=4):
    """Masque un secret en affichant seulement les N derniers caractères"""
    valeur = str(valeur)
    if len(valeur) <= longueur:
        return '*' * len(valeur)
    return '*' * (len(valeur) - longueur) + valeur[-longueur:]

def formater_taille(octets):
    """Convertit des octets en format lisible (Ko, Mo, Go)"""
    for unite in ['o', 'Ko', 'Mo', 'Go', 'To']:
        if octets < 1024.0:
            return f"{octets:.1f} {unite}"
        octets /= 1024.0
    return f"{octets:.1f} Po"

def slug(texte):
    """Convertit un texte en slug URL-friendly"""
    import re, unicodedata
    texte = unicodedata.normalize('NFD', texte)
    texte = texte.encode('ascii', 'ignore').decode('ascii')
    texte = texte.lower()
    texte = re.sub(r'[^\w\s-]', '', texte)
    texte = re.sub(r'[-\s]+', '-', texte)
    return texte.strip('-')

class FilterModule(object):
    """Registre des filtres personnalisés"""
    def filters(self):
        return {
            'verifier_hash': verifier_hash,
            'masquer_secret': masquer_secret,
            'formater_taille': formater_taille,
            'slug': slug,
        }
```

```yaml
tasks:
  - name: Vérifier le mot de passe LDAP
    ansible.builtin.debug:
      msg: "Mot de passe valide : {{ mdp_clair | verifier_hash(hash_ldap) }}"

  - ansible.builtin.debug:
      msg:
        - "{{ db_password | masquer_secret }}"          # ********1234
        - "{{ 1073741824 | formater_taille }}"          # 1.0 Go
        - "{{ 'Mon Application Web' | slug }}"          # mon-application-web
```

### Génération de mot de passe

```python
# filter_plugins/password_generator.py
"""Filtre pour générer des mots de passe sécurisés"""
import secrets
import string

def generer_mot_de_passe(
    longueur=32,
    majuscules=True,
    chiffres=True,
    symboles=True,
    exclure=""
):
    """Générer un mot de passe sécurisé"""
    alphabet = string.ascii_lowercase
    if majuscules:
        alphabet += string.ascii_uppercase
    if chiffres:
        alphabet += string.digits
    if symboles:
        alphabet += "!@#$%^&*()-_+=[]{}|;:,.<>?"

    # Exclure les caractères indésirables
    for char in exclure:
        alphabet = alphabet.replace(char, '')

    # Générer avec secrets (cryptographiquement sûr)
    return ''.join(secrets.choice(alphabet) for _ in range(longueur))

class FilterModule(object):
    def filters(self):
        return {'generer_mot_de_passe': generer_mot_de_passe}
```

### Récupération d'informations — Lookups et Query

```yaml
tasks:
  # Lecture de fichiers
  - name: Lire un fichier de configuration
    ansible.builtin.debug:
      msg: "{{ lookup('file', '/etc/app/config.txt') }}"

  # Résultat d'un template rendu
  - name: Utiliser un template comme lookup
    ansible.builtin.debug:
      msg: "{{ lookup('template', 'templates/mon_template.j2') }}"

  # Requête DNS
  - name: Résoudre les enregistrements MX
    ansible.builtin.debug:
      msg: "{{ lookup('dig', 'example.com', 'qtype=MX') }}"

  # Différence entre lookup et query :
  # lookup → retourne une chaîne (les éléments sont joints)
  # query  → retourne toujours une liste
  vars:
    fichiers_liste: "{{ query('fileglob', '/etc/app/*.conf') }}"
    fichiers_chaine: "{{ lookup('fileglob', '/etc/app/*.conf') }}"
```

### Écriture de son propre lookup — Exemple KeePass

```python
# lookup_plugins/keepass.py
"""
Lookup pour récupérer des mots de passe depuis KeePass.
Usage : {{ lookup('keepass', 'path=Mon Entry', 'field=password', 'db=/path/to/db.kdbx', 'password=master_pass') }}
"""

from ansible.plugins.lookup import LookupBase
from ansible.errors import AnsibleError

class LookupModule(LookupBase):

    def run(self, terms, variables=None, **kwargs):
        # Parser les paramètres
        params = {}
        for term in terms:
            if '=' in term:
                key, value = term.split('=', 1)
                params[key] = value

        # Vérifier les paramètres requis
        if 'db' not in params:
            raise AnsibleError("Le paramètre 'db' (chemin vers le fichier KeePass) est requis")
        if 'password' not in params:
            raise AnsibleError("Le paramètre 'password' (mot de passe maître) est requis")

        # Récupérer le mot de passe depuis KeePass
        try:
            from pykeepass import PyKeePass
            kp = PyKeePass(params['db'], password=params['password'])

            entry_path = params.get('path', '')
            field = params.get('field', 'password')

            # Chercher l'entrée
            entries = kp.find_entries_by_title(entry_path.split('/')[-1])
            if not entries:
                raise AnsibleError(f"Entrée '{entry_path}' non trouvée dans KeePass")

            entry = entries[0]

            # Retourner le champ demandé
            if field == 'password':
                return [entry.password]
            elif field == 'username':
                return [entry.username]
            elif field == 'url':
                return [entry.url]
            elif field == 'notes':
                return [entry.notes]
            else:
                raise AnsibleError(f"Champ '{field}' non supporté")

        except ImportError:
            raise AnsibleError("Module pykeepass requis : pip install pykeepass")
        except Exception as e:
            raise AnsibleError(f"Erreur KeePass : {str(e)}")
```

---

## 35. Les plugins Action Ansible

Les plugins Action s'exécutent **sur le control node** (pas sur les serveurs distants), avant ou à la place du module distant. C'est utile quand vous devez faire du traitement local avant d'envoyer des données.

### Fonctionnement des actions Ansible

```
Module standard :
  Control Node → SSH → Serveur distant (exécution du module)

Plugin Action :
  Control Node (exécution de l'action) → optionnellement → Serveur distant
```

### Exemple : importation de certificat SSL Java

Un cas concret : importer un certificat dans un keystore Java (nécessite des opérations locales ET distantes).

```python
# action_plugins/java_cert.py
"""
Plugin action pour importer un certificat SSL dans un keystore Java.
Nécessite OpenSSL et keytool côté control node.
"""

import os, subprocess, tempfile
from ansible.plugins.action import ActionBase

class ActionModule(ActionBase):

    def run(self, tmp=None, task_vars=None):
        result = super(ActionModule, self).run(tmp, task_vars)

        # Paramètres de la tâche
        cert_url = self._task.args.get('url')
        keystore_path = self._task.args.get('keystore_path', '/etc/ssl/certs/java/cacerts')
        keystore_password = self._task.args.get('keystore_password', 'changeit')
        alias = self._task.args.get('alias')

        # ── Étape 1 : Récupérer le certificat (sur le control node) ──
        with tempfile.NamedTemporaryFile(suffix='.pem', delete=False) as tmp_cert:
            tmp_cert_path = tmp_cert.name

        try:
            # Récupérer le certificat depuis l'URL
            subprocess.run(
                ['openssl', 's_client', '-connect', cert_url, '-showcerts'],
                capture_output=True, text=True, timeout=10
            )

            # ── Étape 2 : Vérifier si le certificat est déjà importé ──
            check_cmd = self._low_level_execute_command(
                f'keytool -list -alias {alias} -keystore {keystore_path} '
                f'-storepass {keystore_password} -noprompt'
            )

            if check_cmd['rc'] == 0:
                # Certificat déjà présent
                result['changed'] = False
                result['msg'] = f"Certificat '{alias}' déjà présent dans le keystore"
                return result

            # ── Étape 3 : Importer le certificat (si en mode check, simuler) ──
            if self._play_context.check_mode:
                result['changed'] = True
                result['msg'] = f"Le certificat '{alias}' serait importé (mode check)"
                return result

            # Copier le certificat sur le serveur distant
            self._transfer_file(tmp_cert_path, f'/tmp/{alias}.pem')

            # Importer dans le keystore
            import_cmd = self._low_level_execute_command(
                f'keytool -import -alias {alias} '
                f'-file /tmp/{alias}.pem '
                f'-keystore {keystore_path} '
                f'-storepass {keystore_password} -noprompt'
            )

            if import_cmd['rc'] != 0:
                result['failed'] = True
                result['msg'] = f"Échec de l'import : {import_cmd['stderr']}"
            else:
                result['changed'] = True
                result['msg'] = f"Certificat '{alias}' importé avec succès"

        finally:
            os.unlink(tmp_cert_path)

        return result
```

```yaml
# Utilisation dans un playbook
- name: Importer le certificat de l'autorité interne
  java_cert:
    url: "internal-ca.example.com:443"
    alias: internal_ca
    keystore_path: /etc/ssl/certs/java/cacerts
    keystore_password: "{{ vault_keystore_password }}"
```

---

# PARTIE VI — INTÉGRATION, UI ET ÉCOSYSTÈME

---

## 36. Intégration CI/CD (GitHub Actions / GitLab CI)

### GitHub Actions — Pipeline complet

```yaml
# .github/workflows/ansible.yml
name: Ansible CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # ── Job 1 : Qualité du code ──────────────────────────
  lint:
    name: Vérification qualité
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Installer les outils
        run: pip install ansible ansible-lint yamllint

      - name: Vérification YAML
        run: yamllint .

      - name: Vérification syntaxe Ansible
        run: ansible-playbook --syntax-check -i hosts site.yml

      - name: Ansible-lint
        run: ansible-lint
        # Ou l'action officielle :
        # uses: ansible/ansible-lint@v24

  # ── Job 2 : Tests Molecule ───────────────────────────
  molecule:
    name: Tests Molecule (${{ matrix.role }})
    runs-on: ubuntu-latest
    needs: lint
    strategy:
      fail-fast: false
      matrix:
        role: [apache, mysql, ldap, common]

    steps:
      - uses: actions/checkout@v4

      - name: Installer Molecule
        run: pip install molecule molecule-plugins[docker] pytest-testinfra

      - name: Tester le rôle ${{ matrix.role }}
        run: cd roles/${{ matrix.role }} && molecule test
        env:
          PY_COLORS: '1'
          ANSIBLE_FORCE_COLOR: '1'

  # ── Job 3 : Scan de sécurité ─────────────────────────
  security:
    name: Scan de sécurité
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - run: pip install checkov
      - run: checkov -d . --framework ansible --output-format github_failed_only

  # ── Job 4 : Déploiement staging ─────────────────────
  deploy_staging:
    name: Déployer en staging
    runs-on: ubuntu-latest
    needs: [molecule, security]
    if: github.ref == 'refs/heads/develop'
    environment: staging
    steps:
      - uses: actions/checkout@v4

      - name: Configurer SSH
        uses: webfactory/ssh-agent@v0.8.0
        with:
          ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}

      - name: Déployer en staging
        run: |
          printf '%s' "$VAULT_PASS" > /tmp/vault.pass
          chmod 600 /tmp/vault.pass
          ansible-playbook -i inventories/staging/hosts site.yml \
            --vault-password-file /tmp/vault.pass \
            -e "deployment_id=${{ github.sha }}"
          shred -u /tmp/vault.pass
        env:
          VAULT_PASS: ${{ secrets.VAULT_PASS_STAGING }}

  # ── Job 5 : Déploiement production ──────────────────
  deploy_prod:
    name: Déployer en production
    runs-on: ubuntu-latest
    needs: [molecule, security]
    if: github.ref == 'refs/heads/main'
    environment:
      name: production     # Nécessite une approbation manuelle configurée sur GitHub
      url: https://monsite.example.com
    steps:
      - uses: actions/checkout@v4

      - name: Configurer SSH
        uses: webfactory/ssh-agent@v0.8.0
        with:
          ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY_PROD }}

      - name: Déployer en production
        run: |
          printf '%s' "$VAULT_PASS" > /tmp/vault.pass
          chmod 600 /tmp/vault.pass
          ansible-playbook -i inventories/production/hosts site.yml \
            --vault-password-file /tmp/vault.pass \
            -e "deployment_id=${{ github.sha }}"
          shred -u /tmp/vault.pass
        env:
          VAULT_PASS: ${{ secrets.VAULT_PASS_PROD }}
```

### GitLab CI — Pipeline complet

```yaml
# .gitlab-ci.yml
stages:
  - validate
  - security
  - test
  - deploy_staging
  - deploy_production

variables:
  ANSIBLE_HOST_KEY_CHECKING: "False"
  PY_COLORS: "1"
  ANSIBLE_FORCE_COLOR: "1"

# ── Template réutilisable ─────────────────────────────
.ansible_base:
  image: cytopia/ansible:latest-tools
  before_script:
    - ansible --version
    - pip install ansible-lint yamllint molecule molecule-plugins[docker] checkov

# ── Validation ────────────────────────────────────────
syntax_check:
  extends: .ansible_base
  stage: validate
  script:
    - yamllint .
    - ansible-playbook --syntax-check -i hosts site.yml

lint:
  extends: .ansible_base
  stage: validate
  script:
    - ansible-lint

# ── Sécurité ──────────────────────────────────────────
security_scan:
  extends: .ansible_base
  stage: security
  script:
    - checkov -d . --framework ansible --output-format cli
  allow_failure: false   # Bloquer si des problèmes de sécurité sont trouvés

# ── Tests Molecule ────────────────────────────────────
.molecule_base:
  extends: .ansible_base
  stage: test
  services:
    - docker:dind
  variables:
    DOCKER_HOST: tcp://docker:2376

molecule_apache:
  extends: .molecule_base
  script:
    - cd roles/apache && molecule test

molecule_mysql:
  extends: .molecule_base
  script:
    - cd roles/mysql && molecule test

molecule_ldap:
  extends: .molecule_base
  script:
    - cd roles/ldap && molecule test

# ── Déploiement Staging ───────────────────────────────
deploy_staging:
  extends: .ansible_base
  stage: deploy_staging
  script:
    - echo "$VAULT_PASS_STAGING" > /tmp/vault.pass
    - |
      ansible-playbook -i inventories/staging/hosts site.yml \
        --vault-password-file /tmp/vault.pass \
        -e "deployment_id=$CI_COMMIT_SHA"
    - shred -u /tmp/vault.pass
  environment:
    name: staging
    url: https://staging.monsite.example.com
  only:
    - develop

# ── Déploiement Production ────────────────────────────
deploy_production:
  extends: .ansible_base
  stage: deploy_production
  script:
    - echo "$VAULT_PASS_PROD" > /tmp/vault.pass
    - |
      ansible-playbook -i inventories/production/hosts site.yml \
        --vault-password-file /tmp/vault.pass \
        -e "deployment_id=$CI_COMMIT_SHA"
    - shred -u /tmp/vault.pass
  environment:
    name: production
    url: https://monsite.example.com
  when: manual          # Approbation manuelle OBLIGATOIRE pour la prod
  only:
    - main
  # Protéger avec des options GitLab :
  # - Protected branches
  # - Required approvals
  # - Environments with approval rules
```

---

## 37. Semaphore — Interface web légère pour Ansible

**Semaphore** est une interface web open-source, légère et facile à installer pour gérer et exécuter des playbooks Ansible. C'est une alternative à AWX/Tower, idéale pour les petites et moyennes équipes.

### Présentation et avantages

```
Semaphore vs AWX :
┌──────────────────┬─────────────────┬──────────────────────┐
│ Critère          │ Semaphore       │ AWX / Tower          │
├──────────────────┼─────────────────┼──────────────────────┤
│ Installation     │ Simple (1 bin)  │ Complexe (Kubernetes)│
│ Ressources       │ Légères (256MB) │ Lourdes (4GB+)       │
│ Interface        │ Simple et claire│ Complète             │
│ RBAC             │ Basique         │ Avancé               │
│ API REST         │ Oui             │ Oui (plus complète)  │
│ Webhooks         │ Oui             │ Oui                  │
│ Licence          │ MIT (gratuit)   │ Apache 2.0 (gratuit) │
│ Support          │ Communautaire   │ Red Hat              │
└──────────────────┴─────────────────┴──────────────────────┘
```

### Installation de Semaphore

**Via Docker Compose (recommandé) :**

```yaml
# docker-compose.yml
version: '3'
services:
  semaphore:
    image: semaphoreui/semaphore:latest
    ports:
      - "3000:3000"
    environment:
      SEMAPHORE_DB_DIALECT: postgres
      SEMAPHORE_DB_HOST: db
      SEMAPHORE_DB_PORT: 5432
      SEMAPHORE_DB_USER: semaphore
      SEMAPHORE_DB_PASS: semaphore_password
      SEMAPHORE_DB_NAME: semaphore
      SEMAPHORE_PLAYBOOK_PATH: /tmp/semaphore/
      SEMAPHORE_ADMIN_PASSWORD: admin_password_fort
      SEMAPHORE_ADMIN_EMAIL: admin@example.com
      SEMAPHORE_ADMIN_NAME: "Administrateur"
      SEMAPHORE_ADMIN: admin
      # Clé secrète pour les sessions
      SEMAPHORE_ACCESS_KEY_ENCRYPTION: "uXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    volumes:
      - semaphore_data:/home/semaphore
      - /var/run/docker.sock:/var/run/docker.sock
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: semaphore
      POSTGRES_PASSWORD: semaphore_password
      POSTGRES_DB: semaphore
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  semaphore_data:
  postgres_data:
```

```bash
docker-compose up -d
# → Accessible sur http://localhost:3000
```

**Installation binaire (sans Docker) :**

```bash
# Télécharger le dernier binaire
curl -s https://api.github.com/repos/semaphoreui/semaphore/releases/latest \
  | grep "browser_download_url.*linux_amd64" \
  | cut -d '"' -f 4 \
  | wget -qi -

tar -xzf semaphore_*.tar.gz
chmod +x semaphore
mv semaphore /usr/local/bin/

# Configuration initiale
semaphore setup

# Démarrer
semaphore service --config /etc/semaphore/config.json start
```

### Configuration et utilisation

```
Concepts Semaphore :

1. PROJETS
   Regroupent les ressources par projet/équipe
   Permissions par projet

2. CLÉS D'ACCÈS (Key Store)
   Clés SSH pour se connecter aux serveurs
   Mots de passe (chiffrés en base)
   Tokens d'API

3. DÉPÔTS (Repositories)
   Connexion à vos dépôts Git
   (GitHub, GitLab, Gitea, ou serveur Git local)

4. INVENTAIRES
   Fichiers d'inventaire statiques
   Ou scripts d'inventaire dynamiques

5. ENVIRONNEMENTS (Variables)
   Variables d'environnement pour les playbooks
   Équivalent de group_vars/all

6. MODÈLES DE TÂCHES (Task Templates)
   Playbook + inventaire + clés + variables
   Peut être planifié (cron) ou déclenché manuellement

7. HISTORIQUE
   Toutes les exécutions sont enregistrées
   Logs complets disponibles
```

### Workflow typique dans Semaphore

```
Étape 1 : Créer un projet "Infrastructure Production"

Étape 2 : Ajouter des clés
  → Clé SSH : "prod-deployer-key" (clé privée pour les serveurs)
  → Mot de passe Vault : "vault-production" (ANSIBLE_VAULT_PASSWORD)

Étape 3 : Ajouter le dépôt Git
  → URL : https://github.com/monorg/ansible-infra.git
  → Branche : main
  → Clé SSH de déploiement Git

Étape 4 : Ajouter l'inventaire
  → Fichier : inventories/production/hosts
  → Type : File (ou dynamic script)

Étape 5 : Configurer l'environnement
  → ANSIBLE_VAULT_PASSWORD_FILE : pointant vers la clé vault
  → Variables supplémentaires

Étape 6 : Créer des modèles de tâches
  → "Déploiement Web" : playbook=webservers.yml, inventaire=prod
  → "Mise à jour Sécurité" : playbook=security_patches.yml
  → Planification cron : tous les dimanches à 2h du matin

Étape 7 : Lancer et surveiller
  → Clic sur "Run" → Voir les logs en temps réel
  → Notifications Slack/email en cas d'échec
```

### API REST Semaphore

```bash
# Authentification
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"auth": "admin", "password": "admin_password"}' \
  | jq -r '.token')

# Lister les projets
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/projects | jq .

# Lancer une tâche
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"template_id": 1}' \
  http://localhost:3000/api/project/1/tasks | jq .

# Voir l'historique
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/project/1/tasks | jq .
```

### Intégration avec les webhooks GitHub/GitLab

```bash
# Configurer un webhook sur GitHub :
# 1. Repository → Settings → Webhooks → Add webhook
# 2. URL : http://semaphore.example.com/api/project/1/tasks
#    (avec authentification Bearer)
# 3. Content type : application/json
# 4. Events : Push events

# Dans Semaphore :
# → Template → Activer "Allow overrides by API"
```

---

## 38. AWX / Ansible Tower — Plateforme enterprise

**AWX** est la version open-source d'Ansible Tower. C'est la solution la plus complète pour gérer Ansible à grande échelle en équipe.

### Présentation et fonctionnalités

- Interface web complète pour gérer et lancer les playbooks
- Planification (cron jobs)
- Gestion sécurisée des credentials (intégration avec HashiCorp Vault, AWS Secrets Manager...)
- Logs et rapports d'exécution détaillés
- **RBAC** avancé (contrôle d'accès par rôle) : par organisation, équipe, projet
- API REST complète
- Webhooks GitHub, GitLab, Bitbucket
- Notifications (email, Slack, Teams, PagerDuty, Webhook...)
- Workflows graphiques (enchaîner des playbooks conditionnellement)
- **Isolated nodes** pour exécuter des playbooks dans des zones réseau isolées
- Inventaires dynamiques intégrés (AWS, Azure, GCP, VMware...)

### Installation d'AWX

```bash
# Prérequis : Kubernetes ou k3s
# Installation avec Helm

helm repo add awx-operator https://ansible.github.io/awx-operator/
helm install awx-operator awx-operator/awx-operator

# Créer la ressource AWX
cat <<EOF | kubectl apply -f -
apiVersion: awx.ansible.com/v1beta1
kind: AWX
metadata:
  name: awx
spec:
  service_type: LoadBalancer
  admin_password_secret: awx-admin-password
EOF

# Récupérer le mot de passe admin
kubectl get secret awx-admin-password -o jsonpath="{.data.password}" | base64 --decode
```

```bash
# Alternative plus simple : Docker Compose pour le développement
git clone https://github.com/ansible/awx.git
cd awx
make docker-compose-build
make docker-compose
# → Accessible sur https://localhost:8043
```

### Différence Semaphore vs AWX

```
Pour des petites équipes (< 10 personnes) et projets simples :
→ Semaphore est suffisant et beaucoup plus facile à gérer

Pour des équipes larges, environnements complexes, entreprises :
→ AWX/Tower avec son RBAC avancé, workflows, audit trail

Les deux offrent :
→ Interface web, API REST, planification, logs
→ Gestion des credentials, inventaires dynamiques
→ Notifications, webhooks
```

---

## 39. Outils utiles de l'écosystème Ansible

### Tableau de synthèse

| Outil | Catégorie | Usage | Installation |
|---|---|---|---|
| **ansible-lint** | Qualité | Vérification des bonnes pratiques | `pip install ansible-lint` |
| **Molecule** | Tests | Tests d'intégration des rôles | `pip install molecule` |
| **yamllint** | Qualité | Validation syntaxe YAML | `pip install yamllint` |
| **Checkov** | Sécurité | Scan de vulnérabilités | `pip install checkov` |
| **ARA** | Monitoring | Interface web pour les logs | `pip install ara[server]` |
| **Semaphore** | UI/CI | Interface web légère | Docker Compose |
| **AWX/Tower** | UI/Enterprise | Plateforme enterprise | Kubernetes |
| **Mitogen** | Performance | Connexions SSH ultra-rapides | `pip install mitogen` |
| **ansible-console** | Debug | Shell interactif | Inclus avec Ansible |
| **ansible-doc** | Documentation | Doc offline des modules | Inclus avec Ansible |
| **ansible-galaxy** | Packages | Gestionnaire rôles/collections | Inclus avec Ansible |
| **pre-commit** | Qualité | Hooks Git automatiques | `pip install pre-commit` |

### ansible-doc — Documentation offline

```bash
ansible-doc ansible.builtin.apt           # Doc d'un module
ansible-doc ansible.builtin.template      # Doc d'un autre module
ansible-doc --list                         # Lister tous les modules
ansible-doc --list | grep -i "docker"     # Chercher par mot-clé
ansible-doc -t inventory -l               # Lister les plugins d'inventaire
ansible-doc -t inventory aws_ec2          # Doc d'un plugin d'inventaire
ansible-doc -t callback profile_tasks     # Doc d'un plugin callback
```

### ansible-console — Débogage interactif

```bash
ansible-console -i hosts webservers

# Dans la console interactive :
webservers (3)[f:5]$ ping
webservers (3)[f:5]$ setup filter=ansible_distribution*
webservers (3)[f:5]$ file path=/tmp/test state=touch mode=0644
webservers (3)[f:5]$ service name=nginx state=restarted
webservers (3)[f:5]$ quit
```

### ansible-galaxy — Partager et réutiliser des rôles

```bash
ansible-galaxy search nginx                          # Chercher des rôles
ansible-galaxy install geerlingguy.nginx             # Installer un rôle
ansible-galaxy install -r requirements.yml           # Depuis un fichier
ansible-galaxy init roles/mon_nouveau_role           # Créer un rôle vide
ansible-galaxy collection install community.general  # Installer une collection
ansible-galaxy collection list                        # Lister les collections
ansible-galaxy collection verify community.general   # Vérifier l'intégrité
```

---

## 40. Résumé des bonnes pratiques et checklist

### Checklist complète avant un projet Ansible

```
ORGANISATION :
  Structure de répertoires claire (roles/, group_vars/, host_vars/)
  Git initialisé avec .gitignore adapté dès le début
  ansible.cfg configuré à la racine du projet
  README.md avec instructions d'installation et d'utilisation
  Chaque rôle documenté (roles/<nom>/README.md)
  requirements.yml avec versions PRÉCISES fixées

SÉCURITÉ :
  Utilisateur Ansible dédié (jamais root)
  Authentification SSH par clé uniquement
  Ansible Vault pour TOUS les secrets
  validate_certs: yes (jamais désactivé)
  Checkov intégré dans le pipeline CI/CD
  no_log: true pour les tâches avec données sensibles
  Rotation des secrets tous les 3 mois

QUALITÉ :
  ansible-lint dans le pipeline CI/CD
  yamllint configuré (.yamllint)
  Toutes les tâches nommées (name: ...)
  mode, owner, group définis pour tous les fichiers
  Chemins absolus utilisés systématiquement
  changed_when défini pour shell/command
  FQCN utilisé pour tous les modules (ansible.builtin.xxx)
  Revue de code pour les playbooks (PR/MR obligatoires)

TESTS :
  Molecule configuré pour chaque rôle
  Tests de vérification écrits (verify.yml)
  Test d'idempotence effectué (molecule idempotence)
  Tests sur plusieurs distributions OS
  --check --diff utilisé avant chaque déploiement prod

CI/CD :
  Pipeline : lint → security → molecule → staging → prod (manuel)
  Secrets dans les variables CI/CD (jamais dans le code)
  Déploiement prod avec approbation manuelle
  Logs centralisés (ARA, Semaphore, ou AWX)

MONITORING :
  ARA ou Semaphore pour visualiser les exécutions
  Notifications en cas d'échec (Slack, email)
  Alertes sur les déploiements en production
```

### Commandes à connaître par cœur

```bash
# ── Exécution ──────────────────────────────────────────
ansible-playbook -i hosts site.yml
ansible-playbook -i hosts site.yml --check --diff
ansible-playbook -i hosts site.yml -vvv
ansible-playbook -i hosts site.yml --limit web1
ansible-playbook -i hosts site.yml --tags "apache"
ansible-playbook -i hosts site.yml --skip-tags "tests"
ansible-playbook -i hosts site.yml --start-at-task="Configurer Nginx"
ansible-playbook -i hosts site.yml --step
ansible-playbook -i hosts site.yml --ask-vault-pass
ansible-playbook -i hosts site.yml -e "env=production version=2.0"

# ── Inventaire ─────────────────────────────────────────
ansible-inventory -i hosts --list
ansible-inventory -i hosts --graph
ansible all -i hosts -m ping
ansible all -i hosts -m setup
ansible all -i hosts -m setup -a "filter=ansible_distribution*"

# ── Vault ─────────────────────────────────────────────
ansible-vault create fichier.yml
ansible-vault encrypt fichier.yml
ansible-vault view fichier.yml
ansible-vault edit fichier.yml
ansible-vault decrypt fichier.yml
ansible-vault rekey fichier.yml
ansible-vault encrypt_string 'valeur' --name 'variable'

# ── Galaxy ────────────────────────────────────────────
ansible-galaxy init roles/mon_role
ansible-galaxy install -r requirements.yml
ansible-galaxy collection install community.general
ansible-galaxy collection verify community.general
ansible-galaxy list

# ── Tests ─────────────────────────────────────────────
yamllint .
ansible-lint
ansible-playbook --syntax-check -i hosts site.yml
checkov -d . --framework ansible
molecule test
molecule converge
molecule verify
molecule idempotence
molecule login --host ubuntu-22.04

# ── Debug ─────────────────────────────────────────────
ansible-doc ansible.builtin.apt
ansible-console -i hosts webservers
```

---

## 41. Glossaire

| Terme | Définition |
|---|---|
| **Control Node** | La machine depuis laquelle on lance Ansible |
| **Managed Node** | Un serveur distant géré par Ansible |
| **Inventaire** | La liste des serveurs (statique ou dynamique) |
| **Playbook** | Le fichier YAML principal contenant les plays |
| **Play** | Un bloc d'un playbook ciblant un groupe de serveurs |
| **Task** | Une action individuelle utilisant un module |
| **Module** | Une brique fonctionnelle d'Ansible (apt, service...) |
| **Rôle** | Un ensemble réutilisable de tâches/handlers/templates |
| **Handler** | Tâche déclenchée uniquement en cas de changement |
| **Template** | Fichier Jinja2 avec des variables dynamiques (.j2) |
| **Fact** | Information collectée automatiquement sur un serveur |
| **Vault** | Outil de chiffrement AES-256 des secrets |
| **Idempotent** | Résultat identique qu'on exécute 1 ou 100 fois |
| **become** | Élévation de privilèges (sudo) |
| **register** | Stocker le résultat d'une tâche dans une variable |
| **notify** | Déclencher un handler si la tâche a changé quelque chose |
| **when** | Condition d'exécution d'une tâche |
| **loop** | Répéter une tâche pour chaque élément d'une liste |
| **tag** | Étiquette pour exécution sélective de tâches |
| **serial** | Nombre de serveurs mis à jour simultanément |
| **delegate_to** | Déléguer l'exécution d'une tâche à un autre hôte |
| **run_once** | Exécuter une tâche une seule fois dans le play |
| **FQCN** | Fully Qualified Collection Name (ansible.builtin.apt) |
| **Molecule** | Framework de test pour les rôles Ansible |
| **ansible-lint** | Outil de vérification des bonnes pratiques |
| **AWX** | Interface web open-source enterprise pour Ansible |
| **Semaphore** | Interface web légère open-source pour Ansible |
| **ARA** | Ansible Run Analysis — interface web pour les logs |
| **Callback** | Plugin contrôlant la sortie et les notifications d'Ansible |
| **Galaxy** | Dépôt communautaire de rôles et collections Ansible |
| **Collection** | Paquet Ansible regroupant modules, rôles et plugins |
| **Mitogen** | Plugin de stratégie pour accélérer les connexions Ansible |
| **pre_tasks** | Tâches exécutées AVANT les rôles |
| **post_tasks** | Tâches exécutées APRÈS les rôles |
| **block** | Groupe de tâches avec gestion d'erreur (try/catch/finally) |
| **rescue** | Bloc exécuté si le block principal échoue (catch) |
| **always** | Bloc toujours exécuté, succès ou échec (finally) |
| **flush_handlers** | Forcer l'exécution immédiate des handlers en attente |
| **no_log** | Masquer la sortie d'une tâche (pour les données sensibles) |
| **check_mode** | Mode simulation (--check), sans modification réelle |
| **changed_when** | Condition personnalisée pour le statut "changed" |
| **failed_when** | Condition personnalisée pour le statut "failed" |
| **add_host** | Ajouter dynamiquement un hôte à l'inventaire pendant le play |
| **WinRM** | Windows Remote Management — protocole pour gérer Windows |

---

*Documentation rédigée à partir des sources : Stéphane Robert (blog.stephane-robert.info), Editions ENI — Ansible (DOUKSIEH ISMAN), documentation officielle Ansible (docs.ansible.com), et la communauté Ansible.*

