---
title: "Incident Mémoire & Java OutOfMemory"
description: "Guide de Diagnostic : Incident Mémoire & Java OutOfMemory"
created: "2026-02-11"
updated: "2026-04-28"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"
---



> **Public cible :** Administrateurs système et équipes d'astreinte  
> **Objectif :** Diagnostiquer et remédier aux incidents mémoire sur serveurs d'applications (WebLogic, JBoss, WildFly)

---

## 📋 Table des matières

1. [Comprendre les deux types d'arrêts mémoire](#1-comprendre-les-deux-types-darrêts-mémoire)
2. [Diagnostic Système : L'OOM Killer](#2-diagnostic-système--loom-killer)
3. [Diagnostic Java : Monitoring du Garbage Collector](#3-diagnostic-java--monitoring-du-garbage-collector)
4. [Analyse Profonde (Post-Mortem)](#4-analyse-profonde-post-mortem)
5. [Optimisation : Choisir son Garbage Collector](#5-optimisation--choisir-son-garbage-collector)
6. [Aide-mémoire des commandes](#6-aide-mémoire-des-commandes-cheat-sheet)
7. [Script d'Auto-Diagnostic](#7-script-dauto-diagnostic-health_check_javash)

---

## 1. Comprendre les deux types d'arrêts mémoire

Avant d'intervenir, il est essentiel de distinguer **qui** a tué le processus Java. Les symptômes sont radicalement différents :

| Type d'incident | Acteur | Cause | Symptôme visible |
|---|---|---|---|
| **Crash Interne** | Java (JVM) | La mémoire allouée (`-Xmx`) est pleine | Erreur `java.lang.OutOfMemoryError` dans les logs applicatifs |
| **Kill Système** | Linux (OOM Killer) | Le serveur entier n'a plus de RAM | Le processus Java **disparaît silencieusement**, sans aucun log |

> 💡 **Règle d'or :** Si Java est mort sans laisser de trace dans ses logs, c'est Linux qui l'a tué — pas Java lui-même.

---

## 2. Diagnostic Système : L'OOM Killer

### Comment fonctionne l'OOM Killer ?

Quand le noyau Linux manque de mémoire, il active l'**OOM Killer** *(Out Of Memory Killer)*. Ce mécanisme :
1. Calcule un **score** pour chaque processus (basé sur sa consommation mémoire)
2. Tue le processus avec le **score le plus élevé**
3. Laisse une trace dans les journaux système

### 2.1 Confirmer l'intervention de l'OOM Killer

```bash
# Rechercher les événements OOM récents avec horodatage lisible (-T)
# → Confirme qu'un incident a eu lieu et à quelle heure exacte
dmesg -T | grep -i "out of memory"

# Identifier quel processus a été tué et son PID
# → /var/log/messages contient l'historique persistant (contrairement à dmesg qui se vide au reboot)
grep -i "killed process" /var/log/messages
```

**Exemple de sortie positive :**
```
[Wed Feb 11 08:42:10 2026] Out of memory: Kill process 12345 (java) score 892 or sacrifice child
[Wed Feb 11 08:42:10 2026] Killed process 12345 (java) total-vm:8192000kB, anon-rss:7654321kB
```

> Si ces commandes ne renvoient rien, l'OOM Killer n'est pas en cause — concentrez-vous sur [le diagnostic Java](#3-diagnostic-java--monitoring-du-garbage-collector).

---

### 2.2 Modifier la priorité OOM d'un processus

Le score OOM de chaque processus est lisible et ajustable via `/proc`. Un score élevé = cible prioritaire pour le noyau.

**Tableau des valeurs `oom_score_adj` :**

| Valeur | Comportement |
|---|---|
| `-1000` | **Jamais tué** (protection maximale) |
| `0` | Comportement par défaut du noyau |
| `+1000` | **Tué en premier** (cible prioritaire) |

#### Méthode temporaire — effet immédiat, perdu au redémarrage

```bash
# Consulter le score actuel AVANT de modifier (bonne pratique)
cat /proc/<PID_JAVA>/oom_score      # Score calculé par le noyau (lecture seule)
cat /proc/<PID_JAVA>/oom_score_adj  # Ajustement en cours (modifiable)

# Protéger Java : réduire sa priorité de ciblage
# → Remplacez <PID_JAVA> par le PID réel (ex: $(pgrep -f weblogic))
echo -500 > /proc/<PID_JAVA>/oom_score_adj

# Vérifier que la modification a bien été appliquée
cat /proc/<PID_JAVA>/oom_score_adj
```

#### Méthode permanente — via Systemd, survit aux redémarrages

```bash
# Ouvrir le fichier de service du serveur d'application
vi /etc/systemd/system/weblogic.service
```

Ajoutez la directive dans la section `[Service]` :

```ini
[Service]
# Valeurs possibles : -1000 (jamais tué) à +1000 (tué en premier)
# -500 offre une bonne protection sans bloquer totalement le mécanisme de sécurité
OOMScoreAdjust=-500
```

```bash
# Recharger la configuration systemd (sans redémarrer le service)
systemctl daemon-reload

# Vérifier que la valeur est bien enregistrée
systemctl show weblogic.service | grep OOMScoreAdjust
```

---

## 3. Diagnostic Java : Monitoring du Garbage Collector

### Quand utiliser cette section ?

Si Java tourne encore mais est **extrêmement lent**, le Garbage Collector (GC) consomme probablement tout le CPU pour tenter de libérer de la mémoire. C'est le signe précurseur d'un `OutOfMemoryError` imminent.

### 3.1 Commande clé : `jstat -gcutil`

`jstat` permet d'observer l'état des zones mémoire de la JVM **en temps réel**, sans interrompre l'application.

```bash
# Surveiller le GC toutes les secondes, indéfiniment (Ctrl+C pour arrêter)
# $(pgrep -f weblogic) récupère automatiquement le PID du processus
jstat -gcutil $(pgrep -f weblogic) 1000

# Capturer 10 mesures toutes les 2 secondes puis s'arrêter automatiquement
jstat -gcutil $(pgrep -f weblogic) 2000 10
```

---

### 3.2 Anatomie de la mémoire Java (JVM)

Avant d'interpréter les colonnes, voici comment la mémoire est organisée :

```
┌─────────────────────────────────────────────────────────┐
│                        HEAP (-Xmx)                      │
│  ┌──────────────────────────┐  ┌───────────────────────┐│
│  │    Young Generation      │  │   Old Generation (O)  ││
│  │  ┌──────┬──────┬───────┐ │  │  Objets "âgés" qui   ││
│  │  │ Eden │  S0  │  S1   │ │  │  ont survécu à        ││
│  │  │  (E) │      │       │ │  │  plusieurs GC         ││
│  │  └──────┴──────┴───────┘ │  └───────────────────────┘│
│  └──────────────────────────┘                           │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│              Metaspace (M) — hors Heap                   │
│         Métadonnées des classes chargées                 │
└─────────────────────────────────────────────────────────┘
```

---

### 3.3 Interpréter les colonnes de `jstat -gcutil`

| Colonne | Zone mémoire | Seuil d'alerte | Interprétation |
|---|---|---|---|
| `S0` | Survivor Space 0 | > 90% stable | Tampon entre Eden et Old. Alterne normalement avec S1 |
| `S1` | Survivor Space 1 | > 90% stable | Les objets "rebondissent" entre S0 et S1 à chaque Minor GC |
| `E` | Eden Space | Fluctuation normale | Objets récemment créés. Vidé à chaque Minor GC |
| **`O`** | **Old Generation** | **> 95% stable** ⚠️ | **Zone critique — proche du crash si saturée en permanence** |
| `M` | Metaspace | > 90% | Métadonnées des classes Java (hors heap) |
| `CCS` | Compressed Class Space | > 90% | Sous-ensemble compressé du Metaspace |
| `YGC` | Young GC Count | Croissance très rapide | Nombre total de Minor GC effectués depuis le démarrage |
| `YGCT` | Young GC Time (s) | — | Temps cumulé passé en Minor GC |
| **`FGC`** | **Full GC Count** | **Augmente vite** ⚠️ | **Chaque Full GC = pause totale de l'application ("freeze")** |
| `FGCT` | Full GC Time (s) | — | Temps cumulé en Full GC ("Stop-the-world") |
| `GCT` | Total GC Time (s) | — | Temps total toutes collections confondues |

---

### 3.4 Cas concret — Lecture et analyse d'une sortie `jstat`

Voici un exemple réel avec deux mesures consécutives à 1 seconde d'intervalle :

```
  S0     S1     E      O      M     CCS    YGC   YGCT    FGC  FGCT    GCT
92.56   0.00  92.95  99.77  73.25  36.69  42538 1410.507  632 657.927 2068.434
 0.00  87.04  20.70  99.77  73.25  36.69  42539 1410.545  632 657.927 2068.471
```

**Analyse colonne par colonne :**

**`S0` : 92.56% → 0.00%** et **`S1` : 0.00% → 87.04%**
> ✅ **Normal.** Les objets survivants ont migré de S0 vers S1 lors du Minor GC. L'alternance S0/S1 est le comportement attendu du ramasse-miettes.

**`E` (Eden) : 92.95% → 20.70%**
> ✅ **Normal.** Eden a été vidé par le Minor GC (YGC est passé de 42538 à 42539). L'application crée beaucoup d'objets temporaires, mais ils sont bien collectés.

**`O` (Old Generation) : 99.77% → 99.77%** 🔴
> ❌ **Situation critique.** La Old Generation est saturée et ne se vide pas entre les deux mesures. Les objets s'y accumulent sans être collectés — signe fort d'une **fuite mémoire**. Un `OutOfMemoryError` est imminent.

**`M` : 73.25%** et **`CCS` : 36.69%**
> ✅ **Stable.** Le Metaspace ne croît pas. Pas de chargement excessif de classes en cours.

**`YGC` : 42538 → 42539** (+1 en 1 seconde)
> ⚠️ **À surveiller.** 42 538 Minor GC depuis le démarrage est un volume très élevé, indicateur d'une création intensive d'objets temporaires. Chaque Minor GC est rapide (~0.03s), mais la fréquence peut peser.

**`FGC` : 632** (stable sur cette mesure) / **`FGCT` : 657.927s**
> 🟡 **Historique préoccupant.** 632 Full GC × ~1 seconde chacun = 657 secondes de pauses totales depuis le démarrage. Aucune nouvelle pause pendant cette fenêtre, mais la Old Generation saturée en déclenchera une bientôt.

**Synthèse de l'analyse :**

| Indicateur | Valeur observée | Verdict |
|---|---|---|
| Young Generation (S0/S1/E) | Fluctue normalement | ✅ Normal |
| Old Generation (O) | 99.77% — stable et saturée | 🔴 Fuite mémoire probable |
| Full GC (FGC) | 632 collectes historiques | 🟡 Préoccupant |
| Metaspace (M/CCS) | Stable | ✅ Normal |

**Actions immédiates recommandées :**
1. 🔴 Capturer un **Heap Dump** (section 4.1) pour identifier les objets qui saturent la Old Generation
2. 🟡 Analyser les threads (section 4.2) pour détecter un deadlock ou une boucle infinie
3. 🟡 Planifier un redémarrage préventif si le service est critique et `O > 99%`

---

## 4. Analyse Profonde (Post-Mortem)

Si le problème persiste, il faut analyser le **contenu** de la mémoire pour identifier une fuite (*Memory Leak*).

### 4.1 Capturer un Heap Dump

Un Heap Dump est une **photographie complète de la mémoire** à un instant T. Il permet d'identifier quels objets occupent l'espace et pourquoi ils ne sont pas collectés.

```bash
# Créer le répertoire de destination
mkdir -p /tmp/java-dumps

# Capturer le Heap Dump au format binaire (.hprof)
# ⚠️  Peut geler brièvement l'application (quelques secondes à quelques minutes selon la taille)
# → Nommage horodaté pour distinguer plusieurs captures
jmap -dump:format=b,file=/tmp/java-dumps/heap_$(date +%Y%m%d_%H%M%S).hprof <PID>

# Vérifier que le fichier est bien créé et noter sa taille
ls -lh /tmp/java-dumps/
```

> 💡 **Analyse du fichier .hprof :** Transférez-le sur votre poste et ouvrez-le avec [Eclipse Memory Analyzer (MAT)](https://eclipse.dev/mat/) ou [VisualVM](https://visualvm.github.io/). Cherchez les objets qui dominent la Old Generation — ce sont eux qui fuient.

---

### 4.2 Analyser les Threads (Thread Dump)

Si le serveur est **figé**, un Thread Dump révèle l'état de tous les threads : attente en base de données, deadlock, boucle infinie...

```bash
# Capturer l'état de tous les threads dans un fichier horodaté
# -l : inclut les informations détaillées sur les verrous (locks) détenus
jstack -l <PID> > /tmp/java-dumps/thread_$(date +%Y%m%d_%H%M%S).txt

# Aperçu rapide des 50 premières lignes
head -50 /tmp/java-dumps/thread_*.txt

# Rechercher directement un deadlock dans la sortie
jstack -l <PID> | grep -A 10 "deadlock"

# Compter les threads par état pour évaluer la situation globale
# Un grand nombre de threads BLOCKED = problème de contention (DB, cache, lock...)
jstack -l <PID> | grep "java.lang.Thread.State" | sort | uniq -c | sort -rn
```

---

## 5. Optimisation : Choisir son Garbage Collector

Le choix du GC impacte directement la durée des pauses "Stop-the-world". Modifiez les paramètres de démarrage JVM de votre serveur d'application :

| GC | Paramètre JVM | Heap recommandé | Avantage | Inconvénient |
|---|---|---|---|---|
| **G1GC** | `-XX:+UseG1GC` | 4 Go – 16 Go, Java 8+ | Bon équilibre débit/latence | Pauses de 100–200ms possibles |
| **ZGC** | `-XX:+UseZGC` | > 16 Go, Java 11+ | Pauses < 10ms garanties | Consomme plus de CPU |
| **Shenandoah** | `-XX:+UseShenandoahGC` | Toutes tailles, Java 12+ | Similaire à ZGC | Disponibilité selon la distribution JDK |

**Exemple de configuration JVM recommandée pour WebLogic :**

```bash
# À ajouter dans le script de démarrage de votre serveur d'application
JAVA_OPTS="\
  -Xms4g \                           # Heap initial (évite les redimensionnements au démarrage)
  -Xmx8g \                           # Heap maximum (adapter selon la RAM disponible)
  -XX:+UseG1GC \                     # Activer G1GC (bon choix pour la plupart des cas)
  -XX:MaxGCPauseMillis=200 \         # Objectif de pause max en ms (G1 fera de son mieux)
  -XX:+HeapDumpOnOutOfMemoryError \  # Capturer automatiquement un dump en cas de crash OOM
  -XX:HeapDumpPath=/tmp/java-dumps/" # Répertoire de destination des dumps automatiques
```

---

## 6. Aide-mémoire des commandes (Cheat Sheet)

| Action | Commande |
|---|---|
| Trouver le PID Java | `pgrep -f weblogic` |
| Vérifier l'OOM Killer (noyau) | `dmesg -T \| grep -i oom` |
| Vérifier l'OOM Killer (logs) | `grep -i "killed process" /var/log/messages` |
| Lire le score OOM actuel | `cat /proc/<PID>/oom_score` |
| Modifier le score OOM | `echo -500 > /proc/<PID>/oom_score_adj` |
| Voir l'état du GC en temps réel | `jstat -gcutil <PID> 1000` |
| Capturer un Heap Dump | `jmap -dump:format=b,file=/tmp/heap.hprof <PID>` |
| Capturer un Thread Dump | `jstack -l <PID> > /tmp/threads.txt` |
| Détecter un deadlock | `jstack -l <PID> \| grep -A 10 deadlock` |
| Recharger la config systemd | `systemctl daemon-reload` |

---

## 7. Script d'Auto-Diagnostic (`health_check_java.sh`)

Ce script centralise tous les diagnostics en une seule commande. Idéal pour les **astreintes** ou les premières minutes d'un incident en production.

### Installation

```bash
# Créer et éditer le script
vi health_check_java.sh

# Le rendre exécutable
chmod +x health_check_java.sh

# Utilisation (mot-clé par défaut : weblogic)
./health_check_java.sh

# Utilisation avec un processus différent
./health_check_java.sh jboss
./health_check_java.sh wildfly
```

### Code source

```bash
#!/bin/bash
# =============================================================================
# health_check_java.sh — Diagnostic mémoire & OOM Killer pour serveurs Java
# Usage   : ./health_check_java.sh [mot_clé_processus]
# Exemple : ./health_check_java.sh weblogic
# =============================================================================

# --- CONFIGURATION ---
# Mot-clé pour identifier le processus (modifiable en argument ou directement ici)
PROCESS_KEYWORD="${1:-weblogic}"

# Seuil d'alerte pour le score OOM (au-dessus = risque élevé de kill système)
OOM_ALERT_THRESHOLD=800

# =============================================================================

echo "=========================================================="
echo "   DIAGNOSTIC MÉMOIRE & OOM KILLER — $PROCESS_KEYWORD"
echo "   $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================================="

# --- ÉTAPE 1 : Recherche du PID ---
echo -e "\n[1/4] Recherche du processus Java..."
PID=$(pgrep -f "$PROCESS_KEYWORD" | head -n 1)

if [ -z "$PID" ]; then
    echo "  [!] ERREUR : Aucun processus trouvé pour '$PROCESS_KEYWORD'."
    echo "  [?] Le processus a peut-être été tué. Recherche de traces dans dmesg..."
    echo ""
    # Chercher une trace de mort récente dans les journaux noyau
    dmesg -T | grep -iE "killed process|out of memory" | tail -n 5
    exit 1
fi

echo "  [✓] Processus trouvé : PID $PID"

# --- ÉTAPE 2 : Vérification du score OOM Killer ---
echo -e "\n[2/4] Analyse du score OOM Killer..."
SCORE=$(cat /proc/$PID/oom_score)
ADJ=$(cat /proc/$PID/oom_score_adj)

echo "  Score actuel    : $SCORE  (0 = faible risque | 1000 = risque maximal)"
echo "  Ajustement (adj): $ADJ   (-1000 = jamais tué | 0 = défaut | +1000 = tué en premier)"

# Alerte automatique si le score dépasse le seuil configuré
if [ "$SCORE" -gt "$OOM_ALERT_THRESHOLD" ]; then
    echo ""
    echo "  ⚠️  RISQUE ÉLEVÉ : Score OOM = $SCORE (seuil d'alerte = $OOM_ALERT_THRESHOLD)"
    echo "  → Protéger le processus immédiatement avec :"
    echo "     echo -500 > /proc/$PID/oom_score_adj"
fi

# --- ÉTAPE 3 : Analyse des logs noyau ---
echo -e "\n[3/4] Recherche d'événements OOM récents dans dmesg..."
OOM_EVENTS=$(dmesg -T | grep -i "out of memory" | tail -n 5)

if [ -z "$OOM_EVENTS" ]; then
    echo "  [✓] Aucun événement OOM détecté dans dmesg."
else
    echo "  [!] Événements OOM trouvés :"
    echo "$OOM_EVENTS" | sed 's/^/     /'
fi

# --- ÉTAPE 4 : Analyse flash du Garbage Collector ---
echo -e "\n[4/4] Analyse du Garbage Collector (jstat)..."

if command -v jstat &> /dev/null; then
    echo "  Colonnes : S0/S1=Survivors | E=Eden | O=Old (critique si >95%) | FGC=Full GC"
    echo "  ---------------------------------------------------------------"
    # 1 mesure instantanée (500ms d'intervalle, 1 itération) pour ne pas bloquer le script
    jstat -gcutil $PID 500 1 | sed 's/^/  /'

    # Lire la valeur de la Old Generation pour une alerte automatique
    OLD_GEN=$(jstat -gcutil $PID 500 1 | tail -1 | awk '{print $4}' | cut -d. -f1)
    if [ -n "$OLD_GEN" ] && [ "$OLD_GEN" -ge 95 ] 2>/dev/null; then
        echo ""
        echo "  ⚠️  CRITIQUE : Old Generation à ${OLD_GEN}% — OutOfMemoryError imminent !"
        echo "  → Capturer un Heap Dump maintenant :"
        echo "     jmap -dump:format=b,file=/tmp/heap_$(date +%Y%m%d_%H%M%S).hprof $PID"
    fi
else
    echo "  [!] jstat introuvable. Vérifiez que le JDK est dans le PATH :"
    echo "     export PATH=\$JAVA_HOME/bin:\$PATH"
fi

echo ""
echo "=========================================================="
echo "  Diagnostic terminé. Consultez le guide complet pour la suite."
echo "=========================================================="
```

---

## 📚 Ressources complémentaires

- [Oracle — jstat documentation](https://docs.oracle.com/en/java/javase/11/tools/jstat.html)
- [Eclipse Memory Analyzer (MAT)](https://eclipse.dev/mat/) — Analyse des Heap Dumps
- [VisualVM](https://visualvm.github.io/) — Profiler Java tout-en-un
- [Red Hat — Tuning JVM on RHEL](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/)
- `man proc` — Documentation complète du système de fichiers `/proc`
