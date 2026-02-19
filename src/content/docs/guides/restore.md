---
title: "Restauration après un Ransomware"
description: "Guide Pédagogique : Restauration après un Ransomware "
created: "2026-02-11"
# updated: "2026-02-04"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"
---

# 📋 Guide Pédagogique : Restauration après un Ransomware
> ***Exemple concret :** VM, stockage partagé et bases de données critiques compromis, sauvegardes récentes potentiellement infectées.*

---

## 🚨 **1. Réaction Immédiate (0-2h) : Isoler & Contenir**
### **Objectif** : Empêcher la propagation du ransomware et limiter les dégâts.

### **Actions à mener**
| Étape | Description | Exemple  | Outils/Commandes |
|-------|------------|--------------|------------------|
| **1.1** | Déconnecter les systèmes infectés du réseau (LAN/WAN). | Isoler les serveurs de gestion des trains et le stockage partagé des horaires. | `netsh interface set interface "Ethernet" admin=disable` (Windows) ou `ifdown eth0` (Linux). |
| **1.2** | Couper l’accès internet aux segments touchés. | Désactiver l’accès web des postes de contrôle du métro. | Désactiver le routeur ou le VLAN dédié. |
| **1.3** | Identifier la souche du ransomware. | Utiliser Veeam Recon Scanner pour analyser un échantillon du malware. | [Veeam Recon Scanner](https://www.veeam.com/fr/solutions/data-security/ransomware-recovery.html), CrowdStrike. |
| **1.4** | Activer le **PCA (Plan de Continuité d’Activité)**. | Basculer la signalétique voyageur en mode manuel. | Document PCA  (ex. : activation des procédures papier). |
| **1.5** | Constituer une cellule de crise. | DSI, sécurité, métiers (ex. : responsable trafic), communication, juridique. | Réunion d’urgence (Teams/Zoom) + canal dédié (Slack/Teams). |
| **1.6** | Alerter les autorités et assureurs. | Contacter l’ANSSI et la CNIL (si données personnelles impactées). | [ANSSI - Signalement](https://www.cybermalveillance.gouv.fr/), contrat cyber-assurance. |

---
## 🔍 **2. Évaluation & Préparation (2-6h) : Analyser & Planifier**
### **Objectif** : Comprendre l’étendue de l’attaque et préparer la restauration.

### **Actions à mener**
| Étape | Description | Exemple  | Outils |
|-------|------------|--------------|--------|
| **2.1** | Cartographier les systèmes touchés. | Lister les VM (ex. : serveur de réservation), stockage (ex. : partage des horaires), bases de données (ex. : tarification). | Outils de scan réseau (Nmap, SolarWinds). |
| **2.2** | Vérifier l’intégrité des sauvegardes. | Utiliser Veeam SureBackup pour tester une sauvegarde du serveur de réservation. | [Veeam SureBackup](https://www.veeam.com/fr/solutions/data-security/ransomware-recovery.html), Commvault Data Verification. |
| **2.3** | Identifier la dernière sauvegarde saine. | Trouver une sauvegarde du 10/02/2026 (avant l’attaque du 15/02). | Interface Veeam/Commvault (onglet "Backup Jobs"). |
| **2.4** | Préparer un environnement isolé. | Créer un lab de test avec VMware pour restaurer une VM sans risque. | VMware ESXi, Hyper-V. |
| **2.5** | Vérifier l’accès aux clés de chiffrement. | Récupérer la clé AES-256 stockée dans HashiCorp Vault pour déchiffrer les sauvegardes. | [HashiCorp Vault](https://www.vaultproject.io/). |

---
## 🛠️ **3. Restauration des Systèmes (6-48h) : Prioriser & Récupérer**
### **Objectif** : Restaurer les services critiques en utilisant des sauvegardes saines.

### **Stratégie de restauration**
1. **Prioriser les services** :
   - **Niveau 1** : Services vitaux (ex. : gestion du trafic, sécurité voyageur).
   - **Niveau 2** : Bases de données critiques (ex. : réservation, tarification).
   - **Niveau 3** : Stockage partagé (ex. : fichiers métiers).
   - **Niveau 4** : VM non critiques (ex. : intranet).

2. **Méthodes de restauration** :
   | Scénario                                 | Solution | Exemple | Outils |
   |------------------------------------------|----------|--------------|--------|
   |Sauvegardes saines disponibles.          | Restaurer depuis une sauvegarde inaltérable. | Restaurer le serveur de réservation depuis une sauvegarde Veeam du 10/02. | [Veeam Immutable Backups](https://www.veeam.com/fr/solutions/data-security/ransomware-recovery.html). |
   | Sauvegardes récentes compromises. | Utiliser un snapshot ou réplica sain. | Restaurer la base de données tarification depuis un réplica Commvault hébergé dans le cloud. | [Commvault SnapProtect](https://www.commvault.com/). |
   | Aucune sauvegarde saine. | Restaurer depuis une sauvegarde plus ancienne (avec perte de données). | Restaurer le stockage partagé depuis une sauvegarde du 05/02 (perte de 5 jours de données). | Veeam/Commvault (option "Restore from older backup"). |
   | Bases de données chiffrées. | Restaurer depuis un dump SQL/NoSQL. | Importer un dump MySQL de la base "tarification" depuis une sauvegarde logique. | `mysql -u root -p database_name < backup.sql`. |

3. **Vérifications post-restauration** :
   - Scanner les données restaurées avec un outil EDR (ex. : CrowdStrike, SentinelOne) pour détecter toute trace de malware:refs[1-31].
   - Tester les services restaurés dans l’environnement isolé avant la remise en production.

---
## 🔄 **4. Remise en Production & Sécurisation (48-72h)**
### **Objectif** : Reconstruire un environnement sain et sécurisé.

### **Actions à mener**
| Étape | Description | Exemple  | Outils |
|-------|------------|--------------|--------|
| **4.1** | Reformater et réinstaller les serveurs touchés. | Réinstaller Windows Server sur le serveur de réservation. | ISO Windows Server, script d’installation automatisée. |
| **4.2** | Appliquer les correctifs de sécurité. | Mettre à jour les VM avec les derniers patches Windows/Linux. | WSUS (Windows), `apt update && apt upgrade` (Linux). |
| **4.3** | Renforcer les accès. | Activer la MFA pour l’accès aux serveurs critiques. | Microsoft Authenticator, Duo Security. |
| **4.4** | Basculer vers le **PRA (Plan de Reprise d’Activité)**. | Restaurer progressivement les services en surveillant les logs. | Veeam PRA, Commvault Orchestration. |
| **4.5** | Documenter chaque étape. | Rédiger un rapport d’incident avec les actions menées et les leçons apprises. | Confluence, SharePoint. |

---
## 📚 **5. Post-Incident (72h+) : Analyser & Améliorer**
### **Objectif** : Tirer les leçons de l’incident et renforcer la résilience.

### **Actions à mener**
| Étape | Description | Exemple  | Outils |
|-------|------------|--------------|--------|
| **5.1** | **Retour d’expérience (REX)**. | Organiser une réunion avec la cellule de crise pour analyser les failles. | Template REX (ex. : [ANSSI](https://www.cybermalveillance.gouv.fr/)). |
| **5.2** | **Renforcer les sauvegardes**. | Mettre en place des sauvegardes inaltérables et un air gap. | Veeam Immutable Backups, stockage sur bande (LTO). |
| **5.3** | **Automatiser les tests de restauration**. | Planifier des tests mensuels avec Veeam SureBackup. | [Veeam SureBackup](https://www.veeam.com/fr/solutions/data-security/ransomware-recovery.html). |
| **5.4** | **Former les équipes**. | Organiser une session de sensibilisation aux ransomwares et aux bonnes pratiques. | Plateforme e-learning (ex. : Cyberini). |
| **5.5** | **Communiquer en transparence**. | Publier un communiqué expliquant les mesures prises pour rassurer les usagers. | Site web , réseaux sociaux. |

---
## ❌ **Erreurs à Éviter**
| Erreur | Risque | Solution |
|--------|--------|----------|
| Ne pas isoler les systèmes infectés. | Propagation du ransomware à d’autres serveurs. | Déconnecter immédiatement du réseau. |
| Restaurer sans vérifier l’intégrité des sauvegardes. | Réinfection des systèmes restaurés. | Toujours scanner les sauvegardes avant restauration. |
| Négliger la communication. | Perte de confiance des usagers et partenaires. | Désigner un porte-parole et communiquer régulièrement. |
| Payer la rançon. | Finance la cybercriminalité, aucune garantie de récupération. | Se concentrer sur la restauration depuis des sauvegardes. |

---
## 📌 **Checklist Résumée**
```markdown
- [ ] Isoler les systèmes infectés (réseau + internet).
- [ ] Identifier la souche du ransomware.
- [ ] Activer le PCA et constituer une cellule de crise.
- [ ] Vérifier l’intégrité des sauvegardes (Veeam SureBackup/Commvault).
- [ ] Restaurer depuis la dernière sauvegarde saine (priorité aux services critiques).
- [ ] Scanner les données restaurées (CrowdStrike/SentinelOne).
- [ ] Reformater et réinstaller les serveurs touchés.
- [ ] Basculer vers le PRA et surveiller les systèmes.
- [ ] Documenter l’incident et organiser un REX.
- [ ] Renforcer les sauvegardes (immutable, air gap) et former les équipes.
```

---
## 🎓 Exemple Pédagogique : Restauration d’un Serveur de Réservation

### **Scénario**
:::tip
Le serveur de réservation (VM Windows Server 2022) est chiffré par un ransomware. La dernière sauvegarde saine date du **10/02/2026** (stockée sur un repository Veeam immuable).
:::
---

### **Étapes de Restauration**

#### **1️⃣ Isoler la VM**
- **Action** : Déconnecter la VM infectée du réseau via **vCenter**.
- **Objectif** : Empêcher la propagation du ransomware.
- **Commande/Interface** :
```bash
  # Exemple via vCenter (UI) :
  Clic droit sur la VM → "Settings" → "Network Adapter" → Décocher "Connected".
```
#### **2️⃣ Vérifier la sauvegarde**
* **Ouvrir Veeam Backup & Replication**
- Aller dans l’onglet "Backups" → "Disk".
- Sélectionner le job "SRV-RESERVATION" → "Restore" → "Entire VM".
- Choisir le point de restauration du 10/02/2026.


* **Vérification :**
- Utiliser Veeam SureBackup pour confirmer que la sauvegarde est exempte de malware et restaurable.


#### **3️⃣ Restaurer dans un environnement isolé (Lab)**

* **Sélectionner l’option de restauration :**

- Choisir "Restore to a new location" → "VMware vSphere".
- Sélectionner un cluster isolé (ex. : "LAB-SECURE").

* **Paramètres :**

- Nommer la VM restaurée (ex. : SRV-RESERVATION_RESTO_10022026).
- Configurer le réseau en mode "Isolé" (pas d’accès au réseau de production).

#### **4️⃣ Scanner la VM restaurée **

* **Outil :** Lancer un scan complet avec CrowdStrike ou SentinelOne.
* **Procédure :**

- Installer l’agent de sécurité sur la VM restaurée.
- Exécuter un scan complet :

```bash


# Exemple avec CrowdStrike (via interface ou CLI)
cscli scan start --path C:\ --type full
``` 
:::note
Résultat attendu : Aucun malware détecté.
:::

#### **5️⃣ Valider le service**

* **Test fonctionnel :**

- Démarrer l’application de réservation sur la VM restaurée.
- Simuler une réservation (ex. : créer un ticket test).
- Vérifier l’intégrité des données (ex. : base de données, fichiers de configuration).

* **Critères de validation :**

- L’application répond normalement.
- Les données sont cohérentes (pas de corruption).

#### **6️⃣ Remise en production**

* **Préparation :**

- **Arrêter la VM infectée** (si toujours présente).
- **Renommer la VM restaurée** pour correspondre à l’ancien nom ***(ex. : SRV-RESERVATION).***

* **Intégration :**

- Reconnecter la VM au réseau de production (via vCenter).
- Vérifier les connexions réseau et les services dépendants.

* **Surveillance :**

- **Monitorer les logs** pendant 24h (outils : Splunk, ELK, graylog, Loki ou Veeam ONE).
- **Alertes :** Configurer des alertes pour toute activité suspecte ***(ex. : tentative de chiffrement)***.

---
### 📌 Checklist Résumée
```markdown


- [ ] Isoler la VM infectée (vCenter).
- [ ] Vérifier et sélectionner la sauvegarde saine (Veeam → 10/02/2026).
- [ ] Restaurer la VM dans un lab isolé (cluster "LAB-SECURE").
- [ ] Scanner la VM avec CrowdStrike/SentinelOne.
- [ ] Valider le service (test de réservation).
- [ ] Intégrer la VM en production (renommer + surveiller).

```

---
## 🔗 Ressources Utiles

- **[Guide ANSSI : Réagir à un ransomware](https://www.cybermalveillance.gouv.fr/tous-nos-contenus/fiches-reflexes/rancongiciels-ransomwares)**
  *Fiche réflexe officielle pour les organisations victimes d’un ransomware, incluant les étapes clés de réponse et les contacts utiles.*

- **[Veeam : Restauration après ransomware](https://www.veeam.com/fr/solutions/data-security/ransomware-recovery.html)**
  *Solutions et bonnes pratiques pour restaurer des environnements virtualisés après une attaque par ransomware.*

- **[Commvault : Protection contre les ransomwares](https://www.commvault.com/)**
  *Plateforme unifiée pour la sauvegarde, la restauration et la protection des données contre les cybermenaces.*

- **[HashiCorp Vault : Gestion des clés de chiffrement](https://www.vaultproject.io/)**
  *Outil pour gérer de manière sécurisée les secrets, clés de chiffrement et accès sensibles.*

- **[CrowdStrike : Détection des malwares](https://www.crowdstrike.com/)**
  *Solution de détection et réponse aux menaces (EDR) pour identifier et neutraliser les ransomwares et autres malwares.*
