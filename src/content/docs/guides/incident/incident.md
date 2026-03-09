---
title: "Gestion d'incident"
description: "Guide Complet : Gestion d'Incident de A à Z"
created: "2026-02-11"
# updated: "2026-02-04"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"
---

# 📘 Guide Complet : Gestion d'Incident de A à Z
### Infrastructure WebLogic & ColdFusion 2021 — Red Hat / Debian 

> **Public cible :** Administrateurs système, équipes d'astreinte, ingénieurs DevOps  
> **Objectif :** Maîtriser le cycle complet d'un incident — de la détection au post-mortem — avec les métriques ITIL (MTTR, MTTD, MTBF, RTO, RPO)

---

## 📋 Table des matières

1. [Les métriques ITIL — Comprendre les briques de temps](#1-les-métriques-itil--comprendre-les-briques-de-temps)
2. [Architecture de référence](#2-architecture-de-référence)
3. [Phase 1 — Détection (MTTD)](#3-phase-1--détection-mttd)
4. [Phase 2 — Qualification & Triage](#4-phase-2--qualification--triage)
5. [Phase 3 — Diagnostic (WebLogic / ColdFusion)](#5-phase-3--diagnostic-weblogic--coldfusion)
6. [Phase 4 — Résolution & Rétablissement](#6-phase-4--résolution--rétablissement)
7. [Phase 5 — Post-Mortem](#7-phase-5--post-mortem)
8. [Scénario complet fil rouge](#8-scénario-complet-fil-rouge)
9. [Tableau de bord des métriques](#9-tableau-de-bord-des-métriques)
10. [Scripts d'automatisation](#10-scripts-dautomatisation)
11. [Aide-mémoire commandes](#11-aide-mémoire-commandes)

---

## 1. Les métriques ITIL — Comprendre les briques de temps

### 1.1 Schéma global du cycle d'un incident

```
         Incident se produit (t=0)
                  │
                  ▼
         ┌────────────────┐
         │   MTTD         │  Détection
         │   Combien de   │  → monitoring, alerte, appel utilisateur
         │   temps avant  │
         │   qu'on sache ?│
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────┐
         │   MTTR         │  Réparation
         │   Combien de   │  → diagnostic, correction, validation
         │   temps pour   │
         │   rétablir ?   │
         └────────┬───────┘
                  │
                  ▼
         Service rétabli
                  │
                  ▼
         ┌────────────────┐
         │   MTBF         │  Fiabilité
         │   Combien de   │  → temps avant le prochain incident
         │   temps avant  │
         │   le suivant ? │
         └────────────────┘

RTO / RPO = objectifs contractuels définis AVANT l'incident
```

---

### 1.2 MTTD — Mean Time To Detect *(réactivité)*

**Définition :** Temps entre le moment où l'incident se produit et le moment où il est détecté.

```
MTTD = Heure de détection − Heure de début de l'incident
```

**Exemple concret :**
```
14h00 → ColdFusion ne répond plus (incident réel)
14h15 → Alerte Centreon / Dynatrace déclenche
─────────────────────────────────────────────
MTTD = 15 minutes
```

**Objectif :** Le plus **bas** possible.

| MTTD | Interprétation |
|---|---|
| < 2 min | Excellent — monitoring temps réel actif |
| 2 – 15 min | Bon — alertes configurées |
| 15 – 60 min | Insuffisant — gaps de monitoring |
| > 60 min | Critique — découverte par les utilisateurs |

**Un MTTD élevé révèle :**
- Monitoring mal configuré ou absent
- Trop d'alertes → effet d'alerte-fatigue, on les ignore
- Pas d'observabilité applicative (JVM heap, GC, pool de threads)
- Seuils d'alerte trop tardifs (alerte à 100% au lieu de 80%)

> 💡 **Phrase clé :** *"Un bon monitoring ne doit pas seulement alerter quand un serveur est down, mais quand la dégradation commence."*

---

### 1.3 MTTR — Mean Time To Repair *(le plus stratégique)*

**Définition :** Temps entre la déclaration de l'incident et le rétablissement complet du service.

```
                  Temps total d'arrêt
MTTR = ─────────────────────────────────────
                 Nombre d'incidents
```

**Exemple concret :**
```
14h00 → WebLogic crash (OOM)
14h10 → Diagnostic lancé       (MTTD = 10 min)
14h20 → Restart appliqué
14h35 → Service validé OK
─────────────────────────────
MTTR = 35 minutes
```

**Objectif :** Le plus **bas** possible.

| MTTR | Interprétation |
|---|---|
| < 15 min | Excellent — procédures automatisées |
| 15 – 30 min | Bon — documentation claire |
| 30 min – 2h | Acceptable selon criticité |
| > 2h | Problématique — voir causes ci-dessous |

**Un MTTR élevé révèle :**
- Absence de procédure documentée
- Logs non centralisés (on cherche partout)
- Diagnostic trop long (GC mal configuré, pas de heap dump auto)
- Rôles flous : personne ne sait qui fait quoi
- Absence d'environnement de recette pour tester un correctif

> 💡 **Phrase clé :** *"Réduire le MTTR passe par la standardisation des procédures, la centralisation des logs et l'automatisation des diagnostics récurrents."*

---

### 1.4 MTBF — Mean Time Between Failures *(fiabilité réelle)*

**Définition :** Temps moyen entre deux incidents du même type.

```
                    Temps total de fonctionnement
MTBF = ──────────────────────────────────────────────────
                       Nombre d'incidents
```

**Exemple concret :**
```
WebLogic tombe tous les 3 jours à cause d'un memory leak non corrigé
→ MTBF = 3 jours → très mauvais
```

**Objectif :** Le plus **élevé** possible.

| Combinaison | Interprétation |
|---|---|
| MTTR bas + MTBF élevé | ✅ Idéal — on répare vite ET le problème est résolu |
| MTTR bas + MTBF bas | ⚠️ On éteint le feu mais sans corriger la cause |
| MTTR élevé + MTBF bas | 🔴 Situation critique — incidents fréquents et longs |

> ⚠️ **Point de maturité :** Un MTTR bas avec un MTBF mauvais signifie qu'on gère les symptômes sans traiter la cause racine. C'est le signe d'une équipe réactive mais pas proactive.

---

### 1.5 RTO & RPO — Objectifs du Plan de Reprise d'Activité

Ces deux métriques sont définies **contractuellement avant tout incident**.

#### RTO — Recovery Time Objective *(durée max d'interruption)*

```
"Le service doit être rétabli en moins de X minutes/heures"
```

| Criticité | RTO typique |
|---|---|
| Production critique (banque, santé) | < 15 min |
| Production standard | < 1 heure |
| Non-production (recette, démo) | < 4 heures |

#### RPO — Recovery Point Objective *(perte de données maximale admissible)*

```
"On accepte de perdre au maximum X minutes/heures de données"
```

| Exemple | RPO |
|---|---|
| Banque, transaction financière | RPO = 0 (aucune perte) |
| Application métier standard | RPO = 15 min à 1h |
| Batch non critique | RPO = 1h à 24h |

> 💡 Si votre MTTR dépasse le RTO contractuel → **violation de SLA** → pénalités financières possibles.

---

## 2. Architecture de référence

L'infrastructure cible de ce guide :

```
                        Internet / Intranet
                               │
                        ┌──────▼──────┐
                        │  LB / Proxy │  (Apache httpd / nginx)
                        │  Port 80/443│
                        └──────┬──────┘
                               │
               ┌───────────────┼───────────────┐
               │                               │
        ┌──────▼──────┐                ┌───────▼──────┐
        │  WebLogic   │                │ ColdFusion   │
        │  Server 1   │                │   2021       │
        │  Port 7001  │                │  Port 8500   │
        │  (Java/JVM) │                │  (Java/JVM)  │
        └──────┬──────┘                └───────┬──────┘
               │                               │
        ┌──────▼───────────────────────────────▼──────┐
        │              Base de données                 │
        │         Oracle / PostgreSQL / MySQL          │
        └──────────────────────────────────────────────┘

OS : Red Hat Enterprise Linux (RHEL) 8/9 ou Debian/Ubuntu 20.04/22.04
Monitoring : Centreon / Nagios / Dynatrace / Prometheus + Grafana
Logs centralisés : ELK Stack (Elasticsearch, Logstash, Kibana) ou Splunk
```

---

## 3. Phase 1 — Détection (MTTD)

### 3.1 Sources de détection

La détection peut venir de trois sources, classées par ordre de préférence :

```
1. Monitoring automatique  → idéal, MTTD le plus bas
2. Supervision humaine     → acceptable (astreinte)
3. Signalement utilisateur → à éviter, MTTD trop élevé
```

### 3.2 Vérifications immédiates à la réception d'une alerte

#### Sur Red Hat / CentOS

```bash
# ─── ÉTAT GLOBAL DU SYSTÈME ───────────────────────────────────────────────

# Charge CPU, mémoire, swap en temps réel (quitter avec 'q')
top

# Vue synthétique instantanée de la mémoire (en Mo)
free -m

# Espace disque — une partition pleine peut tuer une JVM
df -h

# Charge système sur 1, 5 et 15 minutes (si > nb de cœurs → surcharge)
uptime

# ─── PROCESSUS JAVA ────────────────────────────────────────────────────────

# Vérifier si WebLogic tourne (retourne le PID si actif)
pgrep -f weblogic

# Vérifier si ColdFusion tourne
pgrep -f coldfusion

# Voir tous les processus Java avec leur consommation mémoire
ps aux | grep -E "java|weblogic|coldfusion" | grep -v grep

# ─── RÉSEAU ────────────────────────────────────────────────────────────────

# Vérifier si le port WebLogic répond (remplacer l'IP si nécessaire)
ss -tlnp | grep 7001   # WebLogic Admin Console
ss -tlnp | grep 8500   # ColdFusion

# Test de connectivité depuis le serveur lui-même
curl -sv http://localhost:7001/console 2>&1 | head -20
curl -sv http://localhost:8500/CFIDE/administrator/ 2>&1 | head -20
```

#### Sur Debian

```bash
# Les commandes top, free, df, uptime sont identiques
# Différence principale : ss remplace netstat (disponible sur les deux)

# Vérifier les services systemd (si configurés ainsi)
systemctl status weblogic    # adapter le nom du service
systemctl status coldfusion

# Journal système en temps réel
journalctl -f

# Voir les derniers événements système
journalctl -n 100 --no-pager
```

### 3.3 Consulter les logs applicatifs en urgence

```bash
# ─── WEBLOGIC ──────────────────────────────────────────────────────────────

# Log principal WebLogic — chercher ERROR, CRITICAL, OutOfMemoryError
tail -200 /u01/app/oracle/domains/base_domain/servers/AdminServer/logs/AdminServer.log

# Sortie standard du serveur (contient les traces JVM)
tail -200 /u01/app/oracle/domains/base_domain/servers/AdminServer/logs/AdminServer.out

# Recherche rapide des erreurs critiques dans les 100 dernières lignes
grep -iE "outofmemory|error|critical|exception" \
  /u01/app/oracle/domains/base_domain/servers/AdminServer/logs/AdminServer.log | tail -50

# ─── COLDFUSION 2021 ───────────────────────────────────────────────────────

# Log principal ColdFusion
tail -200 /opt/ColdFusion2021/cfusion/logs/coldfusion-error.log

# Log du serveur JVM ColdFusion
tail -200 /opt/ColdFusion2021/cfusion/logs/server.log

# Exceptions applicatives ColdFusion
tail -200 /opt/ColdFusion2021/cfusion/logs/exception.log

# ─── SYSTÈME ───────────────────────────────────────────────────────────────

# Journaux système Red Hat (OOM Killer, kernel panics...)
tail -100 /var/log/messages

# Journaux système Debian
tail -100 /var/log/syslog

# Vérifier si le noyau a tué un processus
dmesg -T | grep -iE "killed process|out of memory" | tail -20
grep -i "killed process" /var/log/messages      # Red Hat
grep -i "killed process" /var/log/kern.log      # Debian
```

---

## 4. Phase 2 — Qualification & Triage

### 4.1 Matrice de sévérité

Avant de plonger dans le diagnostic, **qualifier l'incident** pour prioriser les actions :

| Sévérité | Critères | Action | Escalade |
|---|---|---|---|
| **P1 — Critique** | Service en production totalement indisponible | Intervention immédiate | Chef de projet + direction |
| **P2 — Majeur** | Dégradation forte, majorité des utilisateurs impactés | < 30 min | Responsable technique |
| **P3 — Modéré** | Fonctionnalité partielle indisponible | < 2h | Équipe de support N2 |
| **P4 — Mineur** | Lenteur ou anomalie sans blocage | Planifier | Ticket standard |

### 4.2 Questions de triage (à poser en < 5 minutes)

```bash
# ─── QUESTIONS CLÉS ───────────────────────────────────────────────────────
# 1. Quand exactement le problème a-t-il commencé ?
last reboot                                  # Dernier redémarrage du serveur
who -b                                       # Heure du dernier boot

# 2. Y a-t-il eu un déploiement ou une modification récente ?
rpm -qa --last | head -20                    # Red Hat : derniers paquets installés
dpkg -l --get-selections | grep "install" | tail -20   # Debian

# Historique des commandes récentes de l'utilisateur applicatif
cat /home/weblogic/.bash_history | tail -30

# 3. La mémoire ou le disque sont-ils saturés ?
free -m                                      # Mémoire disponible
df -h                                        # Espace disque
du -sh /tmp /var/log /u01 2>/dev/null       # Taille des répertoires clés

# 4. Y a-t-il des erreurs dans les logs système récents ?
dmesg -T | tail -30
journalctl -p err -n 50 --no-pager          # Uniquement les erreurs (systemd)
```

---

## 5. Phase 3 — Diagnostic (WebLogic / ColdFusion)

### 5.1 Diagnostic WebLogic — Problème mémoire JVM

```bash
# ─── IDENTIFIER LE PID ─────────────────────────────────────────────────────
PID=$(pgrep -f weblogic | head -1)
echo "PID WebLogic : $PID"

# ─── ÉTAT DE LA MÉMOIRE JVM ────────────────────────────────────────────────

# Surveiller le GC en temps réel (Ctrl+C pour arrêter)
# Colonne O (Old Generation) > 95% stable = fuite mémoire probable
jstat -gcutil $PID 2000

# Lire les paramètres JVM actuels (Xmx, Xms, GC configuré...)
# Chercher -Xmx pour connaître le heap maximum alloué
cat /proc/$PID/cmdline | tr '\0' '\n' | grep -E "Xmx|Xms|XX"

# Score OOM Killer (proche de 1000 = risque de kill système)
cat /proc/$PID/oom_score
cat /proc/$PID/oom_score_adj

# ─── THREADS ───────────────────────────────────────────────────────────────

# Compter les threads par état (BLOCKED = contention, deadlock potentiel)
jstack -l $PID | grep "java.lang.Thread.State" | sort | uniq -c | sort -rn

# Détecter un deadlock
jstack -l $PID | grep -A 15 -i "deadlock"

# Sauvegarder le thread dump complet pour analyse
jstack -l $PID > /tmp/wls_thread_$(date +%Y%m%d_%H%M%S).txt

# ─── HEAP DUMP (si Old Gen > 95%) ──────────────────────────────────────────

# Capturer une photo complète de la mémoire
# ⚠️ Opération lourde — gèle brièvement l'application
mkdir -p /tmp/wls-dumps
jmap -dump:format=b,file=/tmp/wls-dumps/heap_$(date +%Y%m%d_%H%M%S).hprof $PID
ls -lh /tmp/wls-dumps/

# ─── CONNEXIONS RÉSEAU ─────────────────────────────────────────────────────

# Compter les connexions actives sur le port WebLogic
ss -tnp | grep ":7001" | wc -l

# Voir les connexions par état (TIME_WAIT excessif = problème de pool)
ss -tn | grep ":7001" | awk '{print $1}' | sort | uniq -c

# ─── LOGS TEMPS RÉEL ───────────────────────────────────────────────────────

# Surveiller les logs WebLogic en direct pendant le diagnostic
tail -f /u01/app/oracle/domains/base_domain/servers/AdminServer/logs/AdminServer.log \
  | grep -iE "error|warning|exception|memory"
```

### 5.2 Diagnostic ColdFusion 2021 — Problème de performance / crash

```bash
# ─── IDENTIFIER LE PID ─────────────────────────────────────────────────────
CF_PID=$(pgrep -f coldfusion | head -1)
echo "PID ColdFusion : $CF_PID"

# ─── ÉTAT DU SERVICE ───────────────────────────────────────────────────────

# Vérifier si ColdFusion répond (code HTTP attendu : 200 ou 302)
curl -o /dev/null -sw "%{http_code}\n" http://localhost:8500/CFIDE/administrator/

# Test de la page d'accueil applicative
curl -o /dev/null -sw "%{http_code}\n" http://localhost:8500/index.cfm

# ─── LOGS COLDFUSION ───────────────────────────────────────────────────────

# Erreurs critiques récentes
tail -100 /opt/ColdFusion2021/cfusion/logs/coldfusion-error.log

# Exceptions applicatives (erreurs dans les templates .cfm)
tail -100 /opt/ColdFusion2021/cfusion/logs/exception.log

# Log serveur JVM ColdFusion
tail -100 /opt/ColdFusion2021/cfusion/logs/server.log

# Rechercher OutOfMemoryError dans tous les logs CF
grep -r "OutOfMemoryError\|java.lang.Error" /opt/ColdFusion2021/cfusion/logs/ | tail -20

# ─── JVM COLDFUSION ────────────────────────────────────────────────────────

# ColdFusion 2021 tourne sur une JVM interne — même outils que WebLogic
jstat -gcutil $CF_PID 2000

# Paramètres JVM de ColdFusion (fichier de configuration)
cat /opt/ColdFusion2021/cfusion/bin/jvm.config | grep -E "java.args|Xmx|Xms"

# ─── SESSIONS ACTIVES ──────────────────────────────────────────────────────

# Nombre de connexions actives sur le port ColdFusion
ss -tnp | grep ":8500" | wc -l

# ─── FICHIERS TEMPORAIRES (souvent cause de saturation disque) ─────────────

# Taille du répertoire temporaire ColdFusion
du -sh /opt/ColdFusion2021/cfusion/temp/
du -sh /opt/ColdFusion2021/cfusion/runtime/work/

# Lister les fichiers les plus volumineux dans /tmp
find /tmp -name "*.hprof" -o -name "*.log" 2>/dev/null | xargs ls -lh 2>/dev/null | sort -k5 -rh | head -10
```

### 5.3 Diagnostic système commun (Red Hat et Debian)

```bash
# ─── CPU ───────────────────────────────────────────────────────────────────

# Identifier le processus qui consomme le plus de CPU
ps aux --sort=-%cpu | head -10

# Détail par thread Java (utile si GC monopolise le CPU)
# Chaque ligne correspond à un thread — PID en colonne 1
ps -eLf | grep java | sort -k3 -rn | head -20

# ─── MÉMOIRE ───────────────────────────────────────────────────────────────

# Vue globale de la consommation mémoire
free -m

# Top 10 des processus par consommation RAM
ps aux --sort=-%mem | head -10

# Détail de la consommation mémoire d'un PID spécifique
cat /proc/$PID/status | grep -E "VmRSS|VmSize|VmSwap"

# ─── DISQUE ────────────────────────────────────────────────────────────────

# Espace disponible par partition
df -h

# Partition qui grossit le plus rapidement
watch -n5 df -h   # Actualisation toutes les 5 secondes (Ctrl+C)

# Identifier les gros fichiers de logs
find /var/log /u01 /opt/ColdFusion2021 -name "*.log" -size +100M 2>/dev/null \
  | xargs ls -lh 2>/dev/null | sort -k5 -rh

# ─── OOM KILLER ────────────────────────────────────────────────────────────

# Red Hat
dmesg -T | grep -iE "out of memory|killed process"
grep -i "killed process" /var/log/messages

# Debian
dmesg -T | grep -iE "out of memory|killed process"
grep -i "killed process" /var/log/kern.log
grep -i "killed process" /var/log/syslog
```

---

## 6. Phase 4 — Résolution & Rétablissement

### 6.1 Actions de remédiation immédiates

#### Cas 1 : WebLogic en OutOfMemoryError

```bash
# ─── PROTECTION IMMÉDIATE (avant restart) ──────────────────────────────────

# Réduire la priorité OOM pour éviter un kill brutal pendant la résolution
PID=$(pgrep -f weblogic | head -1)
echo -500 > /proc/$PID/oom_score_adj

# Forcer un GC explicite sans restart (solution temporaire si heap récupérable)
# Nécessite JDK installé et accès JMX configuré
# jcmd $PID GC.run

# ─── HEAP DUMP AVANT RESTART (pour analyse post-incident) ──────────────────
mkdir -p /tmp/wls-dumps
jmap -dump:format=b,file=/tmp/wls-dumps/heap_$(date +%Y%m%d_%H%M%S).hprof $PID

# ─── RESTART WEBLOGIC ──────────────────────────────────────────────────────

# Méthode 1 : via systemd (recommandée si configuré)
systemctl restart weblogic

# Méthode 2 : via les scripts Oracle
/u01/app/oracle/domains/base_domain/bin/stopWebLogic.sh
sleep 10
/u01/app/oracle/domains/base_domain/bin/startWebLogic.sh &

# Méthode 3 : kill propre puis redémarrage
kill -15 $PID    # SIGTERM — arrêt propre
sleep 30         # Attendre la fin des connexions actives
/u01/app/oracle/domains/base_domain/bin/startWebLogic.sh &
```

#### Cas 2 : ColdFusion 2021 ne répond plus

```bash
# ─── TENTATIVE DE RESTART PROPRE ───────────────────────────────────────────

# Via systemd (si configuré)
systemctl restart coldfusion

# Via le script ColdFusion
/opt/ColdFusion2021/cfusion/bin/coldfusion stop
sleep 15
/opt/ColdFusion2021/cfusion/bin/coldfusion start

# ─── VÉRIFICATION POST-RESTART ─────────────────────────────────────────────

# Attendre que ColdFusion soit prêt (retry toutes les 10s pendant 2 min)
for i in {1..12}; do
  STATUS=$(curl -o /dev/null -sw "%{http_code}" http://localhost:8500/CFIDE/administrator/ 2>/dev/null)
  echo "[$(date +%H:%M:%S)] Tentative $i — HTTP $STATUS"
  [ "$STATUS" = "200" ] || [ "$STATUS" = "302" ] && echo "✓ ColdFusion opérationnel" && break
  sleep 10
done
```

#### Cas 3 : Disque saturé (cause fréquente de crash silencieux)

```bash
# ─── IDENTIFIER LA SOURCE ──────────────────────────────────────────────────

# Partition saturée
df -h | grep "100%\|9[0-9]%"

# Trouver les gros fichiers dans les répertoires applicatifs
du -sh /var/log/* 2>/dev/null | sort -rh | head -10
du -sh /u01/app/oracle/domains/*/logs/* 2>/dev/null | sort -rh | head -10
du -sh /opt/ColdFusion2021/cfusion/logs/* 2>/dev/null | sort -rh | head -10

# ─── LIBÉRER DE L'ESPACE ───────────────────────────────────────────────────

# Archiver et compresser les vieux logs (ne jamais supprimer sans vérifier)
gzip /u01/app/oracle/domains/base_domain/servers/AdminServer/logs/AdminServer.log.bak*

# Vider les logs rotatifs anciens (adapter le chemin)
find /var/log -name "*.log.*" -mtime +30 -exec gzip {} \;
find /var/log -name "*.gz" -mtime +90 -delete

# Purger le répertoire temporaire ColdFusion (fichiers > 1 jour)
find /opt/ColdFusion2021/cfusion/temp/ -mtime +1 -delete 2>/dev/null

# Vider /tmp des heap dumps anciens
find /tmp -name "*.hprof" -mtime +7 -delete
```

### 6.2 Validation du rétablissement

```bash
# ─── CHECKLIST DE VALIDATION ───────────────────────────────────────────────

echo "=== VALIDATION POST-RESTART ==="
echo ""

# 1. Processus actifs ?
echo "[1] Processus Java actifs :"
ps aux | grep -E "weblogic|coldfusion" | grep -v grep | awk '{print "  PID:"$2, "CPU:"$3"%", "MEM:"$4"%", $11}'

# 2. Ports en écoute ?
echo ""
echo "[2] Ports en écoute :"
ss -tlnp | grep -E "7001|8500|80|443"

# 3. Réponse HTTP ?
echo ""
echo "[3] Réponses HTTP :"
echo "  WebLogic  : $(curl -o /dev/null -sw '%{http_code}' http://localhost:7001/console 2>/dev/null)"
echo "  ColdFusion: $(curl -o /dev/null -sw '%{http_code}' http://localhost:8500/CFIDE/administrator/ 2>/dev/null)"

# 4. Mémoire disponible ?
echo ""
echo "[4] Mémoire disponible :"
free -m | grep Mem

# 5. GC stable ?
echo ""
echo "[5] État GC WebLogic (5 mesures) :"
WLS_PID=$(pgrep -f weblogic | head -1)
[ -n "$WLS_PID" ] && jstat -gcutil $WLS_PID 3000 5 || echo "  Processus WebLogic non trouvé"

echo ""
echo "=== FIN VALIDATION ==="
```

---

## 7. Phase 5 — Post-Mortem

Le post-mortem est l'étape la plus importante pour **éviter que l'incident se reproduise**. Il se tient idéalement dans les 24 à 72 heures après l'incident.

### 7.1 Template de rapport post-mortem

```markdown
# Post-Mortem — [Titre de l'incident]

**Date de l'incident :** JJ/MM/AAAA  
**Durée totale :** XX minutes  
**Sévérité :** P1 / P2 / P3  
**Rédacteur :** [Nom]  
**Participants à la réunion post-mortem :** [Noms]

---

## Résumé exécutif (3 lignes max)
[Ce qui s'est passé, impact, résolution]

## Chronologie détaillée

| Heure | Événement | Acteur |
|---|---|---|
| 14h00 | Début de l'incident (WebLogic crash OOM) | Système |
| 14h10 | Alerte Centreon reçue (MTTD = 10 min) | Monitoring |
| 14h12 | Astreinte contactée | Automatique |
| 14h15 | Diagnostic lancé | Admin |
| 14h22 | Heap dump capturé | Admin |
| 14h25 | Restart WebLogic | Admin |
| 14h35 | Service validé OK (MTTR = 35 min) | Admin + métier |

## Métriques de l'incident

| Métrique | Valeur | Objectif | Écart |
|---|---|---|---|
| MTTD | 10 min | < 5 min | +5 min |
| MTTR | 35 min | < 30 min | +5 min |
| RTO | 30 min | 30 min | ✅ Respecté |

## Cause racine identifiée
[Description technique précise de la cause]

## Facteurs aggravants
- [ ] Logs non centralisés
- [ ] Procédure non documentée
- [ ] Manque d'alertes préventives

## Actions correctives

| Action | Responsable | Deadline | Priorité |
|---|---|---|---|
| Augmenter -Xmx de 4G à 8G | Admin infra | JJ+3 | P1 |
| Activer HeapDumpOnOutOfMemoryError | Admin JVM | JJ+1 | P1 |
| Créer alerte GC Old Gen > 80% | Admin monitoring | JJ+7 | P2 |
| Documenter la procédure de restart | Admin | JJ+14 | P2 |

## Leçons apprises
[Ce qu'on ferait différemment la prochaine fois]
```

### 7.2 Analyse des logs post-incident

```bash
# ─── RECONSTITUER LA CHRONOLOGIE ───────────────────────────────────────────

# Extraire les événements entre 13h50 et 14h40 dans les logs WebLogic
awk '/Feb 11.*13:5[0-9]|Feb 11.*14:[0-3][0-9]/' \
  /u01/app/oracle/domains/base_domain/servers/AdminServer/logs/AdminServer.log

# Même recherche dans les logs système (Red Hat)
awk '/Feb 11.*13:5[0-9]|Feb 11.*14:[0-3][0-9]/' /var/log/messages

# ─── CALCULER LES MÉTRIQUES ────────────────────────────────────────────────

# MTBF : calculer le temps entre les derniers incidents OOM
grep -i "OutOfMemoryError" \
  /u01/app/oracle/domains/base_domain/servers/AdminServer/logs/AdminServer.log \
  | awk '{print $1, $2}' | head -20

# Fréquence des Full GC dans les logs GC (si activés)
# Activer les logs GC : -Xlog:gc*:file=/var/log/weblogic/gc.log:time
grep "Full GC" /var/log/weblogic/gc.log | wc -l

# ─── ANALYSER LE HEAP DUMP ─────────────────────────────────────────────────

# Lister les heap dumps disponibles
ls -lh /tmp/wls-dumps/*.hprof 2>/dev/null

# Analyse textuelle rapide avec jmap (sans outil graphique)
# Affiche les classes qui consomment le plus de mémoire
jmap -histo $PID | head -30

# Pour une analyse complète, transférer le .hprof vers votre poste et utiliser :
# → Eclipse MAT : https://eclipse.dev/mat/
# → VisualVM    : https://visualvm.github.io/
```

---

## 8. Scénario complet fil rouge

### 🎬 L'incident : WebLogic OOM un mercredi à 14h00

Voici le déroulé complet d'un incident réel, minute par minute, avec toutes les commandes exécutées.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  14h00 — WebLogic crash (OOM non détecté immédiatement)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

```bash
# Ce qui se passe dans les logs à 14h00 (invisible jusqu'à 14h10)
# java.lang.OutOfMemoryError: Java heap space
#   at com.example.cache.SessionCache.add(SessionCache.java:142)
```

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  14h10 — Alerte Centreon reçue (MTTD = 10 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

```bash
# L'admin reçoit l'alerte et commence le diagnostic
# COMMANDE 1 : Vérification de l'état général
free -m && df -h && uptime

# COMMANDE 2 : WebLogic est-il encore en vie ?
pgrep -f weblogic    # → rien = processus mort

# COMMANDE 3 : Confirmer la cause
dmesg -T | grep -i "killed process"
grep -i "OutOfMemoryError" \
  /u01/app/oracle/domains/base_domain/servers/AdminServer/logs/AdminServer.log | tail -5
```

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  14h15 — Cause identifiée : OOM (MTTR en cours)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

```bash
# COMMANDE 4 : Vérifier l'espace disque avant restart
df -h    # → /u01 à 87% : OK, pas de problème disque

# COMMANDE 5 : Vérifier la RAM disponible pour le restart
free -m  # → 12 Go disponibles sur 32 Go : OK

# COMMANDE 6 : Restart WebLogic
systemctl restart weblogic

# COMMANDE 7 : Surveiller le démarrage en temps réel
tail -f /u01/app/oracle/domains/base_domain/servers/AdminServer/logs/AdminServer.log
```

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  14h25 — WebLogic redémarré, validation en cours
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

```bash
# COMMANDE 8 : Vérifier le port en écoute
ss -tlnp | grep 7001

# COMMANDE 9 : Test HTTP
curl -o /dev/null -sw "%{http_code}\n" http://localhost:7001/console

# COMMANDE 10 : Surveiller le GC pour s'assurer que la mémoire est stable
jstat -gcutil $(pgrep -f weblogic) 5000 6
# → Vérifier que la colonne O (Old Gen) reste < 80%
```

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  14h35 — Service validé OK (MTTR = 35 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

```bash
# COMMANDE 11 : Communication de clôture
echo "Service WebLogic rétabli à $(date). MTTR = 35 min. Post-mortem planifié J+1."

# COMMANDE 12 : Activation de la protection OOM pour la nuit
PID=$(pgrep -f weblogic | head -1)
echo -500 > /proc/$PID/oom_score_adj
echo "Protection OOM activée : $(cat /proc/$PID/oom_score_adj)"

# COMMANDE 13 : Activation du heap dump automatique (jusqu'au prochain redémarrage)
# Idéalement, ajouter -XX:+HeapDumpOnOutOfMemoryError dans les paramètres JVM permanents
```

**Calcul des métriques de cet incident :**

```
MTTD  = 14h10 − 14h00 = 10 minutes
MTTR  = 14h35 − 14h00 = 35 minutes
RTO   = 30 min (contractuel) → ⚠️ légèrement dépassé

Actions pour améliorer :
→ Abaisser MTTD : alerte sur Old Gen > 80% (détection avant le crash)
→ Abaisser MTTR : script de restart automatisé, heap dump auto
→ Améliorer MTBF : corriger la fuite mémoire (analyse heap dump)
```

---

## 9. Tableau de bord des métriques

### 9.1 Calcul pratique sur une période

```bash
# ─── SCRIPT DE CALCUL DES MÉTRIQUES ────────────────────────────────────────
# Exemple : 3 incidents sur le mois de février

# Données saisies manuellement après chaque incident :
# Incident 1 : 10 min d'indispo (OOM WebLogic)
# Incident 2 : 45 min d'indispo (disque plein ColdFusion)
# Incident 3 : 20 min d'indispo (OOM WebLogic)

INCIDENTS=3
TOTAL_DOWNTIME=75  # en minutes (10+45+20)
UPTIME_TOTAL=40320  # minutes dans le mois (30 jours × 24h × 60min)

echo "=== MÉTRIQUES DU MOIS ==="
echo "MTTR = $TOTAL_DOWNTIME / $INCIDENTS = $(echo "scale=1; $TOTAL_DOWNTIME / $INCIDENTS" | bc) minutes"
echo "MTBF = $UPTIME_TOTAL / $INCIDENTS = $(echo "scale=0; $UPTIME_TOTAL / $INCIDENTS" | bc) minutes ($(echo "scale=1; $UPTIME_TOTAL / $INCIDENTS / 1440" | bc) jours)"
echo "Disponibilité = $(echo "scale=4; ($UPTIME_TOTAL - $TOTAL_DOWNTIME) / $UPTIME_TOTAL * 100" | bc)%"
```

### 9.2 Objectifs SLA courants

| Service | Disponibilité | Downtime max/mois | RTO | RPO |
|---|---|---|---|---|
| Production critique | 99.9% | 43 min | 15 min | 0 |
| Production standard | 99.5% | 3h 36min | 30 min | 15 min |
| Pré-production | 99% | 7h 12min | 2h | 1h |
| Développement | 95% | 36h | 4h | 24h |

---

## 10. Scripts d'automatisation

### 10.1 Script de diagnostic complet (`incident_diagnostic.sh`)

```bash
#!/bin/bash
# =============================================================================
# incident_diagnostic.sh — Diagnostic complet WebLogic + ColdFusion
# Usage : ./incident_diagnostic.sh
# =============================================================================

TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
REPORT_DIR="/tmp/incident_$TIMESTAMP"
mkdir -p "$REPORT_DIR"

echo "=========================================================="
echo "  DIAGNOSTIC INCIDENT — $(date '+%Y-%m-%d %H:%M:%S')"
echo "  Rapport : $REPORT_DIR"
echo "=========================================================="

# ─── SECTION 1 : ÉTAT SYSTÈME ─────────────────────────────────────────────
echo -e "\n[1/5] État système..." | tee "$REPORT_DIR/01_system.txt"
{
  echo "=== MÉMOIRE ==="
  free -m
  echo ""
  echo "=== DISQUE ==="
  df -h
  echo ""
  echo "=== CHARGE ==="
  uptime
  echo ""
  echo "=== OOM KILLER (dmesg) ==="
  dmesg -T | grep -iE "out of memory|killed process" | tail -10
} >> "$REPORT_DIR/01_system.txt"
echo "  → Sauvegardé : $REPORT_DIR/01_system.txt"

# ─── SECTION 2 : WEBLOGIC ─────────────────────────────────────────────────
echo -e "\n[2/5] Diagnostic WebLogic..." | tee "$REPORT_DIR/02_weblogic.txt"
WLS_PID=$(pgrep -f weblogic | head -1)

if [ -n "$WLS_PID" ]; then
  echo "  PID WebLogic : $WLS_PID"
  {
    echo "=== PID : $WLS_PID ==="
    echo "Score OOM : $(cat /proc/$WLS_PID/oom_score)"
    echo ""
    echo "=== PARAMÈTRES JVM ==="
    cat /proc/$WLS_PID/cmdline | tr '\0' '\n' | grep -E "Xmx|Xms|XX"
    echo ""
    echo "=== ÉTAT GC (5 mesures) ==="
    jstat -gcutil $WLS_PID 2000 5 2>/dev/null
    echo ""
    echo "=== THREADS PAR ÉTAT ==="
    jstack -l $WLS_PID 2>/dev/null | grep "java.lang.Thread.State" | sort | uniq -c | sort -rn
  } >> "$REPORT_DIR/02_weblogic.txt"
  echo "  → Sauvegardé : $REPORT_DIR/02_weblogic.txt"
else
  echo "  [!] WebLogic non trouvé — processus mort ?"
  echo "  Vérification des dernières erreurs..."
  grep -i "OutOfMemoryError" \
    /u01/app/oracle/domains/base_domain/servers/AdminServer/logs/AdminServer.log \
    2>/dev/null | tail -10 >> "$REPORT_DIR/02_weblogic.txt"
fi

# ─── SECTION 3 : COLDFUSION ───────────────────────────────────────────────
echo -e "\n[3/5] Diagnostic ColdFusion..." | tee "$REPORT_DIR/03_coldfusion.txt"
CF_PID=$(pgrep -f coldfusion | head -1)

if [ -n "$CF_PID" ]; then
  echo "  PID ColdFusion : $CF_PID"
  {
    echo "=== PID : $CF_PID ==="
    echo "Score OOM : $(cat /proc/$CF_PID/oom_score)"
    echo ""
    echo "=== ÉTAT GC (5 mesures) ==="
    jstat -gcutil $CF_PID 2000 5 2>/dev/null
    echo ""
    echo "=== DERNIÈRES ERREURS LOG ==="
    tail -30 /opt/ColdFusion2021/cfusion/logs/coldfusion-error.log 2>/dev/null
  } >> "$REPORT_DIR/03_coldfusion.txt"
  echo "  → Sauvegardé : $REPORT_DIR/03_coldfusion.txt"
else
  echo "  [!] ColdFusion non trouvé — processus mort ?"
fi

# ─── SECTION 4 : TESTS DE CONNECTIVITÉ ───────────────────────────────────
echo -e "\n[4/5] Tests de connectivité..." | tee "$REPORT_DIR/04_connectivity.txt"
{
  echo "=== PORTS EN ÉCOUTE ==="
  ss -tlnp | grep -E "7001|8500|80|443"
  echo ""
  echo "=== RÉPONSES HTTP ==="
  echo "WebLogic   : $(curl -o /dev/null -sw '%{http_code}' http://localhost:7001/console 2>/dev/null)"
  echo "ColdFusion : $(curl -o /dev/null -sw '%{http_code}' http://localhost:8500/CFIDE/administrator/ 2>/dev/null)"
  echo ""
  echo "=== CONNEXIONS ACTIVES ==="
  echo "WebLogic (7001)   : $(ss -tnp | grep ':7001' | wc -l) connexions"
  echo "ColdFusion (8500) : $(ss -tnp | grep ':8500' | wc -l) connexions"
} >> "$REPORT_DIR/04_connectivity.txt"
echo "  → Sauvegardé : $REPORT_DIR/04_connectivity.txt"

# ─── SECTION 5 : RÉSUMÉ ET RECOMMANDATIONS ───────────────────────────────
echo -e "\n[5/5] Génération du résumé..."
{
  echo "=== RÉSUMÉ DIAGNOSTIC — $(date) ==="
  echo ""
  echo "WebLogic  : $([ -n '$WLS_PID' ] && echo 'RUNNING (PID: '$WLS_PID')' || echo 'DOWN')"
  echo "ColdFusion: $([ -n '$CF_PID' ] && echo 'RUNNING (PID: '$CF_PID')' || echo 'DOWN')"
  echo ""
  echo "Mémoire libre : $(free -m | grep Mem | awk '{print $7}') Mo"
  echo "Disque /u01   : $(df -h /u01 2>/dev/null | tail -1 | awk '{print $5}') utilisé"
} > "$REPORT_DIR/00_summary.txt"

echo ""
echo "=========================================================="
echo "  Rapport complet disponible dans : $REPORT_DIR/"
ls -la "$REPORT_DIR/"
echo "=========================================================="
```

### 10.2 Script de restart sécurisé (`safe_restart.sh`)

```bash
#!/bin/bash
# =============================================================================
# safe_restart.sh — Restart sécurisé WebLogic ou ColdFusion avec validation
# Usage : ./safe_restart.sh [weblogic|coldfusion]
# =============================================================================

SERVICE="${1:-weblogic}"
HEAP_DUMP_DIR="/tmp/restart-dumps"

echo "=== RESTART SÉCURISÉ : $SERVICE — $(date) ==="

# Étape 1 : Capturer un heap dump avant d'arrêter
PID=$(pgrep -f "$SERVICE" | head -1)
if [ -n "$PID" ]; then
  echo "[1] Capture heap dump préventif (PID: $PID)..."
  mkdir -p "$HEAP_DUMP_DIR"
  jmap -dump:format=b,file="$HEAP_DUMP_DIR/${SERVICE}_$(date +%Y%m%d_%H%M%S).hprof" $PID 2>/dev/null \
    && echo "  ✓ Heap dump capturé" \
    || echo "  ⚠ Heap dump échoué (continuons quand même)"
else
  echo "[1] Processus déjà arrêté — pas de heap dump nécessaire"
fi

# Étape 2 : Arrêt propre
echo "[2] Arrêt du service..."
systemctl stop "$SERVICE" 2>/dev/null || {
  [ -n "$PID" ] && kill -15 "$PID" && sleep 20
}

# Vérifier l'arrêt effectif
sleep 5
if pgrep -f "$SERVICE" > /dev/null; then
  echo "  ⚠ Processus encore actif — kill forcé"
  pkill -9 -f "$SERVICE"
  sleep 5
fi
echo "  ✓ Service arrêté"

# Étape 3 : Démarrage
echo "[3] Démarrage du service..."
systemctl start "$SERVICE" 2>/dev/null

# Étape 4 : Validation avec retry
echo "[4] Validation (attente max 3 minutes)..."
PORT=$([ "$SERVICE" = "weblogic" ] && echo "7001" || echo "8500")
URL=$([ "$SERVICE" = "weblogic" ] && echo "http://localhost:7001/console" || echo "http://localhost:8500/CFIDE/administrator/")

for i in {1..18}; do
  STATUS=$(curl -o /dev/null -sw "%{http_code}" "$URL" 2>/dev/null)
  echo "  [$(date +%H:%M:%S)] Tentative $i/18 — HTTP $STATUS"
  if [ "$STATUS" = "200" ] || [ "$STATUS" = "302" ]; then
    echo ""
    echo "  ✅ $SERVICE opérationnel ($(date +%H:%M:%S))"
    break
  fi
  [ "$i" = "18" ] && echo "  ❌ Timeout — vérifier les logs manuellement"
  sleep 10
done

echo ""
echo "=== FIN DU RESTART — $(date) ==="
```

---

## 11. Aide-mémoire commandes

### Red Hat / CentOS

| Action | Commande |
|---|---|
| État mémoire | `free -m` |
| État disque | `df -h` |
| Processus Java | `ps aux \| grep java` |
| PID WebLogic | `pgrep -f weblogic` |
| Logs système | `tail -f /var/log/messages` |
| OOM Killer | `dmesg -T \| grep -i oom` |
| Gros fichiers | `find /var/log -size +100M` |
| État service | `systemctl status weblogic` |
| Restart service | `systemctl restart weblogic` |
| Journaux service | `journalctl -u weblogic -n 100` |

### Debian

| Action | Commande |
|---|---|
| Logs système | `tail -f /var/log/syslog` |
| OOM Killer | `grep -i "killed process" /var/log/kern.log` |
| Paquets récents | `dpkg -l \| tail -20` |
| Journaux service | `journalctl -f` |

### JVM (commun)

| Action | Commande |
|---|---|
| Trouver PID Java | `pgrep -f weblogic` |
| État GC temps réel | `jstat -gcutil <PID> 1000` |
| Score OOM | `cat /proc/<PID>/oom_score` |
| Protéger OOM | `echo -500 > /proc/<PID>/oom_score_adj` |
| Heap dump | `jmap -dump:format=b,file=/tmp/heap.hprof <PID>` |
| Thread dump | `jstack -l <PID> > /tmp/threads.txt` |
| Deadlock | `jstack -l <PID> \| grep -A 10 deadlock` |
| Paramètres JVM | `cat /proc/<PID>/cmdline \| tr '\0' '\n' \| grep XX` |
| Histogramme heap | `jmap -histo <PID> \| head -30` |

---

## 📚 Ressources complémentaires

- [Oracle WebLogic Documentation](https://docs.oracle.com/en/middleware/standalone/weblogic-server/)
- [Adobe ColdFusion 2021 Admin Guide](https://helpx.adobe.com/coldfusion/administering-coldfusion.html)
- [Red Hat — Performance Tuning Guide](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/9/html/monitoring_and_managing_system_status_and_performance/)
- [Eclipse Memory Analyzer (MAT)](https://eclipse.dev/mat/)
- [VisualVM](https://visualvm.github.io/)
- ITIL 4 Foundation — Gestion des incidents
