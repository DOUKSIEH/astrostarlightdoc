---
title: "🤖 Plan d'action : IA agentique pour la gestion d'incidents"
description: "🤖 Comprendre l'IA"
created: "2026-05-15"
# updated: "2026-04-28"
locales: "fr"
author:
  name: "Douksieh IH"
  role: "DevOps Engineer"
  avatar: "https://github.com/DOUKSIEH.png"

---

**Architecture sécurisée, résiliente et performante — alignée ITIL 4 / CALMS / DevSecOps**

<!-- **Version 3 — Enrichie des fiches détaillées CrewAI, LangChain, LangGraph, LlamaIndex, Weaviate** -->

---

## Sommaire

1. [Cadrage et objectifs mesurables](#1-cadrage-et-objectifs-mesurables)
2. [Architecture cible — modèle agentique en 4 couches](#2-architecture-cible--modèle-agentique-en-4-couches)
3. [La triade CrewAI + LangChain + LlamaIndex — vue d'ensemble](#3-la-triade-crewai--langchain--llamaindex--vue-densemble)
4. [Fiches détaillées des outils-clés](#4-fiches-détaillées-des-outils-clés)
   - 4.1 [CrewAI — l'orchestrateur multi-agents](#41-crewai--lorchestrateur-multi-agents)
   - 4.2 [LangChain — la boîte à outils des LLM](#42-langchain--la-boîte-à-outils-des-llm)
   - 4.3 [LangGraph — le moteur de workflows à état](#43-langgraph--le-moteur-de-workflows-à-état)
   - 4.4 [LlamaIndex — le framework RAG de référence](#44-llamaindex--le-framework-rag-de-référence)
   - 4.5 [Weaviate — la base vectorielle](#45-weaviate--la-base-vectorielle)
5. [Stack technique complète — justification de chaque choix](#5-stack-technique-complète--justification-de-chaque-choix)
6. [Modèle de sécurité (DevSecOps + Zero Trust)](#6-modèle-de-sécurité-devsecops--zero-trust)
7. [Résilience et haute disponibilité de l'agent](#7-résilience-et-haute-disponibilité-de-lagent)
8. [Plan de mise en œuvre par phases (roadmap 6 mois)](#8-plan-de-mise-en-œuvre-par-phases-roadmap-6-mois)
9. [Gouvernance, conformité ITIL et indicateurs](#9-gouvernance-conformité-itil-et-indicateurs)
10. [Risques, limites et plan de mitigation](#10-risques-limites-et-plan-de-mitigation)
11. [Annexe — exemples de code et configurations](#11-annexe--exemples-de-code-et-configurations)

---

## 1. Cadrage et objectifs mesurables

### 1.1 Définition fonctionnelle de l'agent

L'agent IA agentique (que nous appellerons **SRE-Copilot** dans la suite) est un système autonome de classe "AIOps + GenAI" qui exécute en boucle continue le cycle **Perception → Analyse → Action → Apprentissage**, en s'inscrivant dans les 5 phases ITIL de la gestion d'incident : Détection → Qualification/Triage → Diagnostic → Résolution → Post-mortem.

Trois modes de fonctionnement coexistent, du moins au plus autonome :

| Mode | Description | Cas d'usage |
|---|---|---|
| **Advisor** | L'agent diagnostique et propose, l'humain exécute | Incidents P1, actions destructives, environnement bancaire |
| **Co-pilot** | L'agent exécute après validation humaine via Slack/Teams (HITL) | Incidents P2, premiers mois de production |
| **Autopilot** | L'agent exécute seul un sous-ensemble d'actions whitelistées | Incidents P3/P4 répétitifs, runbooks éprouvés |

Cette gradation est non négociable : elle découle directement du principe ITIL 4 *"Commencer là où vous êtes"* et du pilier Culture de CALMS (confiance qui se construit par la mesure, pas par décret).

### 1.2 Objectifs chiffrés (SLO de l'agent)

| Métrique | État sans agent (référence) | Cible avec agent à M+12 | Méthode de mesure |
|---|---|---|---|
| MTTD | 10–30 min | < 2 min sur incidents instrumentés | Diff entre apparition signal et création ticket |
| MTTR P1 | 35–120 min | < 20 min | Diff entre création et clôture ticket |
| MTTR P3 répétitifs | 60+ min (humain) | < 5 min (autopilot) | Idem |
| Taux de faux positifs | n/a | < 10 % des alertes promues incident | Revue hebdomadaire |
| Couverture runbooks RAG | 0 % | > 80 % des familles d'incidents connues | Indexation runbooks / total |
| Rapports post-mortem auto-générés | 0 % | 100 % des P1/P2, draft validé en < 24h | Comptage Jira |
| Change Failure Rate des actions agent | n/a | < 2 % | Actions qui dégradent le SLI |

### 1.3 Hors-scope (volontaire)

- **Non-scope phase 1** : actions DBA destructives (DROP, TRUNCATE), modifications réseau (firewall, BGP), gestion des secrets en production, prise de décision financière (achat de capacité cloud).
- **Non-scope permanent** : remplacement de la décision humaine sur incidents P1 en environnement régulé (banque, santé, OIV au sens LPM/NIS2). L'agent assiste, il ne décide pas.

---

## 2. Architecture cible — modèle agentique en 4 couches

### 2.1 Vue logique : la pile à 4 couches

L'architecture s'articule sur **4 couches superposées** où chaque framework a un rôle clair et non-substituable :

```
┌───────────────────────────────────────────────────────────────────────┐
│  COUCHE 4 — ORCHESTRATION MULTI-AGENTS (CrewAI)                       │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ ┌────────────┐  │
│  │  Détecteur   │  │   Analyste   │  │  Exécuteur   │ │ Rédacteur  │  │
│  │  (Triage)    │  │    (RCA)     │  │  (Actions)   │ │ Post-mortem│  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ └─────┬──────┘  │
│         │                 │                 │               │         │
└─────────┼─────────────────┼─────────────────┼───────────────┼─────────┘
          │                 │                 │               │
          ▼                 ▼                 ▼               ▼
┌───────────────────────────────────────────────────────────────────────┐
│  COUCHE 3 — OUTILS & WORKFLOWS (LangChain + LangGraph)                │
│                                                                       │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐        │
│  │ Prometheus │ │   Loki     │ │ Kubernetes │ │ Ansible AWX  │  ...   │
│  │  (PromQL)  │ │  (LogQL)   │ │   (API)    │ │  (Playbooks) │        │
│  └────────────┘ └────────────┘ └────────────┘ └──────────────┘        │
│                                                                       │
│  + LangGraph pour les sous-workflows à état (boucles diagnostic-test) │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────────┐
│  COUCHE 2 — CONNAISSANCE & MÉMOIRE (LlamaIndex / RAG)                 │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  Base vectorielle (Weaviate) :                                  │  │
│  │    • runbooks/      — procédures (Markdown)                     │  │
│  │    • post-mortems/  — incidents passés (Markdown structuré)     │  │
│  │    • documentation/ — Confluence, wikis, guides techniques      │  │
│  │    • logs-indexed/  — patterns de logs récurrents               │  │
│  │                                                                 │  │
│  │  Embeddings : bge-m3 (local, multilingue FR/EN)                 │  │
│  │  Chunking   : SimpleNodeParser, 512 tokens, overlap 64          │  │
│  │  Recherche  : hybride (BM25 + vecteur), top_k=5                 │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────────┐
│  COUCHE 1 — OBSERVABILITÉ (source de vérité)                          │
│                                                                       │
│  Prometheus/Thanos · Loki · Tempo · Hubble · Wazuh · CMDB             │
└───────────────────────────────────────────────────────────────────────┘
```

**Lecture de l'architecture** : chaque couche consomme la couche inférieure et expose une abstraction à la couche supérieure. CrewAI n'appelle jamais directement Prometheus ; il passe par un tool LangChain. LangChain n'invente jamais une solution ; il interroge le RAG LlamaIndex pour vérifier qu'elle est documentée.

### 2.2 Vue des agents CrewAI (couche 4 détaillée)

Quatre agents spécialisés collaborent. La spécialisation est volontaire : chaque agent a un prompt système court, un objectif unique, et un sous-ensemble d'outils. C'est l'application directe du principe Unix appliqué à l'IA — **un agent, une responsabilité**.

| Agent | Objectif (goal) | Backstory (rôle) | Outils LangChain accessibles | Sortie attendue |
|---|---|---|---|---|
| **Détecteur** | Qualifier l'alerte entrante en sévérité ITIL (P1/P2/P3/P4) | "SRE senior expert en triage, 10 ans d'astreinte" | `prometheus_query`, `alertmanager_get_context`, `cmdb_get_service_criticality` | JSON `{severity, service_impacted, business_impact}` |
| **Analyste** | Identifier la cause racine probable | "Expert en RCA, maîtrise corrélation logs/métriques/traces" | `loki_query`, `tempo_query`, `hubble_flows`, `rag_search_runbooks`, `rag_search_postmortems` | JSON `{hypothesis, evidence[], recommended_action, confidence}` |
| **Exécuteur** | Appliquer l'action corrective de manière sécurisée | "Ops senior, obsédé par l'idempotence et le rollback" | `awx_run_job`, `k8s_restart_pod`, `k8s_scale_deployment`, `slack_request_approval` | JSON `{action_taken, status, metrics_before, metrics_after}` |
| **Rédacteur** | Produire le rapport post-mortem conforme ITIL | "Rédacteur technique, ancien chef de projet ITIL" | `jira_create_ticket`, `confluence_publish`, `rag_index_new_document` | Document Markdown structuré + ticket Jira |

Le **process CrewAI** retenu est `Process.sequential` pour les incidents simples (Détecteur → Analyste → Exécuteur → Rédacteur) et `Process.hierarchical` pour les incidents complexes (un manager-agent route dynamiquement vers les spécialistes selon l'évolution de la situation).

### 2.3 Flux de bout en bout d'un incident (scénario WebLogic OOM)

Le scénario fil rouge de la documentation (WebLogic OOM le mercredi à 14h00) sert ici de gabarit :

1. **t = 0** — Prometheus détecte `jvm_memory_used_bytes{area="heap",pool="Old Gen"} / jvm_memory_max_bytes > 0.85` pendant 2 min. Alertmanager route vers le webhook de l'agent.
2. **t + 5 s — Agent Détecteur** : enrichit l'alerte avec la criticité CMDB, qualifie en **P2**.
3. **t + 20 s — Agent Analyste** : parallélise Loki/Tempo/Hubble, interroge le RAG LlamaIndex sur *"Incidents similaires de saturation Old Gen sur WebLogic"*. Le RAG retourne le post-mortem du 11 février. Hypothèse en 40 s : *fuite mémoire récurrente, runbook éprouvé*.
4. **t + 60 s — Agent Exécuteur** : vérifie la whitelist RBAC, poste un message Slack à l'astreinte (mode Co-pilot).
5. **t + 3 min** — Astreinte approuve. Job AWX déclenché, heap dump capturé dans Ceph RGW, restart, validation des 4 Golden Signals.
6. **t + 7 min** — Service rétabli. **MTTR = 7 min** vs 35 min en mode humain.
7. **t + 15 min — Agent Rédacteur** : génère le draft post-mortem, le publie sur Confluence + ticket Jira "Problem", **et le ré-indexe dans le RAG**.

---

## 3. La triade CrewAI + LangChain + LlamaIndex — vue d'ensemble

### 3.1 Pourquoi pas un seul framework ?

| Approche | Forces | Limites bloquantes pour notre cas |
|---|---|---|
| **CrewAI seul** | Orchestration multi-agents naturelle, prompts en YAML | Pas de RAG natif robuste, pas de graphe à état |
| **LangChain seul** | Très large catalogue d'outils | Orchestration multi-agents lourde, pas de modèle de rôles explicite |
| **LlamaIndex seul** | RAG de référence | Pas d'orchestration d'agents, pas adapté à un workflow d'actions |
| **CrewAI + LangChain** | Orchestration + outils | Connaissances statiques, pas de capitalisation |
| **CrewAI + LangChain + LlamaIndex** | Couverture complète des 4 phases | Complexité accrue (mitigeable par discipline d'architecture) |

**Conclusion** : la triade est la seule combinaison qui couvre les 4 phases du cycle agentique sans compromis fonctionnel.

### 3.2 Répartition stricte des responsabilités

| Framework | Responsabilité exclusive | Ce que les autres NE font PAS |
|---|---|---|
| **CrewAI** | Définition des agents (role, goal, backstory), tasks, process | LangChain ne définit pas d'agents ; LlamaIndex ne route pas de tasks |
| **LangChain** | Tools (Prometheus, Loki, K8s, AWX), prompts d'enrichissement, parsing Pydantic | CrewAI n'écrit pas de tools ; LlamaIndex ne fait pas d'appel opérationnel |
| **LangGraph** | Sous-workflows à état (boucle d'investigation interne à l'Analyste), checkpointing | CrewAI gère mal l'état persistant fin ; LangChain seul gère mal les boucles |
| **LlamaIndex** | Indexation documents, embeddings, recherche sémantique, mise à jour RAG | CrewAI ne fait pas de recherche vectorielle ; LangChain peut faire du RAG moins bien |

Cette séparation est codée dans la structure du repo : `agents/` pour CrewAI, `tools/` pour LangChain, `rag/` pour LlamaIndex, `workflows/` pour LangGraph.

### 3.3 Le rôle de LlamaIndex dans la boucle Perception → Analyse → Action → Apprentissage

LlamaIndex intervient à **deux moments distincts** du cycle, sur deux opérations opposées :

**Phase Analyse — lecture du RAG** :
- L'Analyste reçoit le contexte enrichi (alerte + métriques + logs).
- Il formule une question en langage naturel : *"Incidents passés avec saturation Old Gen sur WebLogic, et leurs résolutions"*.
- LlamaIndex effectue une recherche hybride (BM25 + similarité vectorielle) sur les chunks de runbooks/post-mortems.
- Les top-5 chunks sont injectés dans le prompt de l'Analyste comme contexte.
- L'Analyste raisonne sur ces données **et seulement ces données** — pas d'invention.

**Phase Apprentissage — écriture du RAG** :
- Après publication du post-mortem par l'agent Rédacteur, un hook déclenche l'indexation du nouveau document.
- Le post-mortem est chunké, embeddé via `bge-m3`, inséré dans Weaviate.
- À l'incident suivant similaire, ce nouveau post-mortem fait partie des sources interrogées.

C'est cette **double boucle lecture/écriture** qui transforme le système en organisme apprenant. Sans elle, l'agent réinvente l'eau chaude à chaque incident.

---

## 4. Fiches détaillées des outils-clés

Cette section présente, pour chacun des 5 outils centraux de la stack agentique, son **histoire**, son **utilité**, son **fonctionnement**, sa **place dans notre architecture**, et ses **limites**. L'objectif est de donner à toute l'équipe — y compris non-développeurs (RSSI, manager SRE, comité ITIL) — une compréhension solide de pourquoi chaque brique a été retenue.

---

### 4.1 CrewAI — l'orchestrateur multi-agents

#### Historique et origine

CrewAI a été créé par **João (Joe) Moura**, ingénieur brésilien ancien de Clearbit (acquis par HubSpot). Le projet a vu le jour comme un side-project fin 2023, et a été publié pour la première fois sur **PyPI en décembre 2023**, avec un lancement officiel en **janvier 2024**. Le déclic est venu d'un constat simple : les frameworks existants à l'époque (LangChain agents, AutoGPT, BabyAGI) étaient conçus autour d'un **agent unique** ou d'une boucle ReAct, alors que la plupart des problèmes d'entreprise impliquent **plusieurs spécialistes qui collaborent** — exactement comme une équipe humaine.

Le projet a explosé rapidement. CrewAI Inc. a levé 18 M$ en seed + Series A en octobre 2024, avec parmi les investisseurs Boldstart Ventures, Craft Ventures, Insight Partners, et à titre personnel **Andrew Ng** (co-fondateur de Google Brain) et **Dharmesh Shah** (co-fondateur de HubSpot). Fin 2025, CrewAI revendiquait 1,4 milliard d'exécutions agentiques cumulées et une adoption dans ~60 % des entreprises du Fortune 500 (Oracle, IBM, PwC, Capgemini, NVIDIA cités publiquement). Le framework est sous licence **MIT** et reste totalement open source, avec une offre commerciale séparée (**CrewAI AMP** — Agent Management Platform) pour le déploiement enterprise.

Point important à noter : CrewAI est **indépendant de LangChain** depuis 2024. Les premières versions s'appuyaient sur LangChain pour certaines abstractions, mais le framework a depuis développé ses propres primitives. On peut utiliser CrewAI **avec ou sans** LangChain — ce qui n'empêche pas la combinaison, comme nous le faisons.

#### Utilité — quel problème résout-il ?

CrewAI résout un problème précis : **comment faire collaborer plusieurs agents IA spécialisés** sans réécrire à chaque fois la plomberie d'orchestration (qui parle à qui, qui décide, qui valide, comment passer le contexte). Avant CrewAI, il fallait :
- écrire manuellement un *AgentExecutor* LangChain par agent,
- écrire la logique de passage de message entre agents,
- gérer la mémoire partagée,
- coder le HITL (human-in-the-loop) à la main.

CrewAI fournit ces primitives **out-of-the-box**, avec un modèle mental qui colle à la réalité d'une équipe humaine : un *agent* a un **rôle**, un **objectif**, une **backstory**, et accède à un sous-ensemble d'**outils**. Une *task* est ce que l'agent doit produire. Un *crew* est l'équipe, avec un *process* (séquentiel ou hiérarchique).

#### Fonctionnement — les primitives clés

**Agent** — défini en YAML ou en Python :
```yaml
analyste_incident:
  role: Expert en Root Cause Analysis
  goal: Identifier la cause racine probable et proposer une action
  backstory: SRE senior avec 10 ans d'expérience JVM et Kubernetes
  tools: [loki_query, tempo_query, rag_search]
  allow_delegation: false
  max_iter: 10
```

**Task** — une unité de travail confiée à un agent, avec un `expected_output` qui peut être un schéma Pydantic. Une task peut consommer le contexte d'une task précédente via `context=[previous_task]`.

**Process** — deux modes principaux :
- `Process.sequential` : les tasks s'exécutent dans l'ordre, la sortie de chacune alimente la suivante. Adapté aux workflows déterministes (notre cas pour les incidents simples).
- `Process.hierarchical` : un **manager-agent** (souvent un LLM plus puissant) route dynamiquement entre spécialistes. Adapté aux incidents complexes où l'ordre des étapes n'est pas connu d'avance.

**Crew** — l'équipe + le process + la mémoire courte (différente du RAG long terme). Avec `memory=True`, le crew se souvient des échanges récents au sein de la session.

**Human-in-the-loop natif** — `human_input=True` sur une task fait pauser CrewAI avant l'exécution de l'outil, demande validation à l'humain (via CLI, API, Slack avec adaptateur), puis reprend.

CrewAI 0.150+ supporte également les **guardrails** (validation de format/contenu en sortie), le protocole **MCP** (Model Context Protocol d'Anthropic), et le protocole **A2A** (Agent-to-Agent) pour interopérer avec des agents construits sur d'autres frameworks.

#### Place dans notre architecture

CrewAI est notre **chef d'orchestre principal** (couche 4). Il définit les 4 agents (Détecteur, Analyste, Exécuteur, Rédacteur), assigne les tasks, gère le process séquentiel ou hiérarchique selon la complexité, et déclenche le HITL pour les actions critiques.

**Pourquoi nous le préférons à LangGraph pur** : le modèle "rôle + objectif + backstory" est immédiatement compréhensible par les SRE et les managers, alors qu'un graphe d'états avec nodes/edges/conditional_edges demande une formation. Les fichiers `agents.yaml` et `tasks.yaml` peuvent être lus, relus, amendés par des non-développeurs — ce qui est précieux pour la gouvernance ITIL (CAB qui valide les prompts).

**Pourquoi nous le préférons à AutoGen** : AutoGen (Microsoft, désormais part du Microsoft Agent Framework) excelle dans les conversations multi-agents libres ; CrewAI est plus adapté aux workflows structurés à étapes prédéfinies, qui est exactement notre besoin (un incident suit un cycle ITIL connu).

#### Limites à connaître

- **Indépendance LangChain depuis 2024** : si vous souhaitez utiliser des composants LangChain (tools, retrievers), il faut explicitement les wrapper en tools CrewAI. Coût ponctuel mais non nul.
- **Pas idéal pour les graphes très complexes** : si votre workflow a 50 nœuds avec des branchements conditionnels profonds, LangGraph (qui modélise nativement un graphe) reste plus expressif. D'où notre choix de **combiner les deux** : CrewAI pour l'orchestration globale, LangGraph pour les sous-workflows internes (notamment dans l'agent Analyste).
- **Adoption rapide = changements fréquents** : entre v0.50 et v0.150, des breaking changes ont eu lieu. Il faut pinner les versions et tester avant montée.

---

### 4.2 LangChain — la boîte à outils des LLM

#### Historique et origine

LangChain a été créé par **Harrison Chase** en **octobre 2022**, alors qu'il travaillait chez Robust Intelligence (startup de validation de modèles ML). Les premières lignes de code ont été poussées sur GitHub entre le 16 et le 25 octobre 2022 — quelques semaines avant la sortie publique de ChatGPT (30 novembre 2022). Ce timing n'est pas un hasard : Harrison Chase avait déjà testé GPT-3 (et son ancêtre `text-davinci-002`) et avait identifié un problème récurrent — les développeurs réécrivaient les mêmes abstractions à chaque projet (prompt templating, chaînes d'appels LLM, gestion de la mémoire conversationnelle, parsing des sorties).

La première version était une simple bibliothèque Python wrappant le formateur de strings de Python pour faire du prompt templating. Le projet a explosé en popularité au début 2023 grâce à la vague ChatGPT, et l'entreprise **LangChain Inc.** a été incorporée en **janvier 2023**. Levée de fonds rapide : seed avec Benchmark en avril 2023, Series A de 20 M$ avec Sequoia mi-2023, puis levées successives jusqu'à devenir **licorne (valorisation ~1,2 milliard de dollars)** en octobre 2025. LangChain figurait dans le **Forbes AI 50** en avril 2025.

Le framework est sous licence **MIT**, écrit en Python (avec un port TypeScript/JavaScript). L'écosystème s'est étoffé avec des produits complémentaires : **LangSmith** (observabilité et debugging, lancé en juillet 2023, fer de lance commercial de LangChain Inc.), **LCEL — LangChain Expression Language** (DSL de composition, 2023), **LangServe** (déploiement comme API, fin 2023), et **LangGraph** (mai 2024, voir section 4.3).

Le terme "LangChain" vient de "Language Model **Chain**s" — l'idée que les applications LLM ne sont jamais une simple requête, mais une **chaîne** d'appels combinant LLM, outils, mémoire, et logique métier.

#### Utilité — quel problème résout-il ?

LangChain résout un problème d'**intégration et de composabilité**. Un LLM seul ne sait pas :
- récupérer des informations à jour (besoin d'outils),
- accéder à des données privées (besoin de connecteurs),
- exécuter du code ou des appels API (besoin de tools),
- se souvenir d'une conversation longue (besoin de mémoire),
- parser sa sortie en JSON structuré (besoin de output parsers).

LangChain fournit toutes ces briques sous forme d'abstractions standardisées, avec **plus de 700 intégrations** dans son écosystème : tous les LLM majeurs (OpenAI, Anthropic, Google, Cohere, Mistral, Hugging Face, Ollama, vLLM…), toutes les bases vectorielles (Weaviate, Pinecone, Qdrant, Chroma, Elasticsearch, PostgreSQL/pgvector…), tous les outils d'observabilité, tous les ITSM (Jira, ServiceNow, Linear…), tous les protocoles de communication (Slack, Teams, email, webhooks…).

#### Fonctionnement — les concepts clés

**Tool** — une fonction Python typée que le LLM peut appeler. Le décorateur `@tool` génère automatiquement le schéma JSON consommable par les API de tool-calling des LLM modernes :
```python
from langchain_core.tools import tool

@tool
def prometheus_query(promql: str, range_minutes: int = 5) -> str:
    """Exécute une requête PromQL sur les N dernières minutes."""
    # appel HTTP vers Prometheus
    return formatted_result
```

**Chain / Runnable / LCEL** — la composition d'appels LLM se fait via le LangChain Expression Language, un DSL `|` (pipe) :
```python
chain = prompt | llm | output_parser
result = chain.invoke({"question": "..."})
```

**Prompt template** — texte paramétrable avec variables, support du few-shot, des messages multi-rôles (system/user/assistant).

**Output parser** — convertit la sortie texte du LLM en structure typée (Pydantic). Indispensable pour fiabiliser la sortie (un LLM qui doit retourner du JSON peut hallucination du texte autour ; le parser nettoie ou re-tente).

**Memory** — différents types selon le besoin : `ConversationBufferMemory` (tout l'historique), `ConversationSummaryMemory` (résumé), `ConversationKGMemory` (graphe de connaissances).

**Retriever** — interface générique vers un store de documents. Les `VectorStoreRetriever` font de la recherche par similarité ; les `MultiQueryRetriever`, `ContextualCompressionRetriever`, `EnsembleRetriever` permettent des stratégies avancées.

**Agent** (l'ancien modèle) — un *AgentExecutor* qui boucle ReAct (Reasoning + Acting). Aujourd'hui, l'agent est plutôt construit avec LangGraph ; le LangChain "core" se concentre sur les tools et la composition.

#### Place dans notre architecture

LangChain est notre **boîte à outils** (couche 3). C'est lui qui fournit :
- les **tools** pour interroger Prometheus, Loki, Tempo, Hubble, la CMDB ;
- les **tools** pour déclencher des actions (Ansible AWX, Kubernetes API, Jira, Confluence) ;
- les **prompt templates** réutilisables pour l'enrichissement de contexte ;
- les **output parsers** Pydantic qui garantissent que les sorties des agents CrewAI sont du JSON valide et typé ;
- le **tracing LangSmith** qui rend chaque appel auditable — point critique pour la conformité ITIL.

CrewAI consomme ces tools : chaque agent CrewAI déclare la liste des tools LangChain auxquels il a accès. Le LLM choisit quel tool appeler, LangChain valide les paramètres contre le schéma Pydantic, exécute, et retourne le résultat à l'agent.

#### Limites à connaître

- **Surface d'API très large** : LangChain a évolué vite, ce qui fait que la documentation peut paraître éclatée. Plusieurs façons de faire la même chose existent (legacy `Chain` vs nouveau LCEL vs LangGraph). Il faut s'aligner sur la version récente et ignorer le legacy.
- **Dépendances Python lourdes** : l'écosystème complet (`langchain` + `langchain-community` + intégrations) tire beaucoup de dépendances. On installe ce qu'on utilise.
- **Pas idéal pour les agents seul** : pour un agent ReAct simple, LangChain core suffit. Pour un workflow agentique long et à état, **utiliser LangGraph**. C'est désormais la position officielle de l'équipe LangChain.

---

### 4.3 LangGraph — le moteur de workflows à état

#### Historique et origine

LangGraph est un produit de **LangChain Inc.** (même équipe), lancé en **mai 2024** comme bibliothèque séparée mais complémentaire de LangChain. Sa raison d'être : combler une limite fondamentale de LangChain pour les **agents longs et complexes** — pas de gestion native de l'état persistant, pas de cycles propres, difficile de modéliser des branchements conditionnels et le human-in-the-loop.

LangGraph est inspiré explicitement de deux références techniques :
- **Pregel** — le système de Google pour le traitement de graphes à très grande échelle (sur lequel s'est appuyé Apache Giraph),
- **Apache Beam** — le framework de pipelines de données distribués.

Son interface publique s'inspire de **NetworkX** (la bibliothèque Python de référence pour les graphes), ce qui rend la prise en main plus naturelle pour quiconque a déjà manipulé des graphes orientés.

Le projet est passé en **version 1.0 fin 2025** et est désormais le **runtime par défaut de tous les agents LangChain**. Utilisé en production par Klarna (support client pour 85 millions d'utilisateurs), Uber, J.P. Morgan, Replit, LinkedIn, GitLab, Elastic (assistant sécurité), entre autres. Licence MIT.

#### Utilité — quel problème résout-il ?

LangGraph répond à 4 limites majeures des agents LangChain classiques (boucle ReAct) :

1. **Cycles** — les pipelines LangChain classiques sont des DAG (graphes orientés sans cycle). Or un raisonnement d'agent réel a besoin de boucler : "j'ai testé une hypothèse, ça n'a pas marché, je re-formule et je re-teste". LangGraph supporte nativement les cycles avec garde-fous (limite d'itérations).
2. **État persistant** — entre deux étapes d'un raisonnement, un agent doit pouvoir transporter un état riche (résultats intermédiaires, hypothèses testées, scores de confiance). LangGraph définit un **schéma d'état partagé** (TypedDict ou Pydantic) que chaque nœud lit et écrit.
3. **Reprise sur erreur (durable execution)** — si l'agent crash au milieu d'un incident qui dure 20 minutes, on ne veut pas tout recommencer. LangGraph permet le **checkpointing** automatique de l'état dans un store persistant (PostgreSQL, SQLite, Redis). Au redémarrage, l'agent reprend exactement où il s'était arrêté.
4. **Human-in-the-loop fin** — `interrupt_before` et `interrupt_after` permettent d'épingler n'importe quel nœud du graphe et d'attendre une validation humaine avant de continuer.

#### Fonctionnement — les concepts clés

**State** — un dictionnaire typé partagé entre tous les nœuds :
```python
from typing import TypedDict
from langgraph.graph import StateGraph, START, END

class InvestigationState(TypedDict):
    alert: dict
    metrics: dict
    logs: list
    hypothesis: str
    confidence: float
    iterations: int
```

**Node** — une fonction Python qui prend l'état en entrée et retourne un (sous-)état à fusionner :
```python
def fetch_metrics(state: InvestigationState) -> InvestigationState:
    metrics = prometheus_query(state["alert"]["service"])
    return {"metrics": metrics}
```

**Edge** — une transition entre nœuds. Peut être :
- *normale* : `graph.add_edge("fetch_metrics", "fetch_logs")` — toujours suivre cette flèche.
- *conditionnelle* : `graph.add_conditional_edges("hypothesize", router_fn)` — la fonction `router_fn` lit l'état et retourne le nom du prochain nœud.

**Compilation** — `graph.compile(checkpointer=PostgresSaver(...))` produit un *runnable* exécutable, avec persistance optionnelle.

**Interruption HITL** :
```python
graph.compile(
    checkpointer=checkpointer,
    interrupt_before=["execute_action"],  # pause avant action critique
)
```

**Streaming** — LangGraph supporte le streaming token-par-token et le streaming d'étapes intermédiaires. Crucial pour montrer en temps réel à l'astreinte ce que l'agent est en train de raisonner.

#### Place dans notre architecture

LangGraph joue chez nous un **rôle ciblé** : il modélise la **boucle d'investigation interne à l'agent Analyste**. CrewAI orchestre les 4 agents au niveau macro ; LangGraph orchestre, à l'intérieur de l'agent Analyste, le micro-workflow :

```
[ALERT] → fetch_metrics → fetch_logs → fetch_traces → query_rag
              ↓
        hypothesize ──┐
              ↓       │
        test_hypothesis  │ (boucle si confidence < seuil et iterations < max)
              ↓       │
        evaluate ─────┘
              ↓
        [HYPOTHESIS + CONFIDENCE]
```

Cette boucle est **stateful** (l'état accumule les preuves), **cyclique** (l'analyste peut reformuler son hypothèse plusieurs fois), et **checkpointée** (si l'agent est interrompu, il reprend où il en était). L'ensemble est encapsulé dans un tool CrewAI exposé à l'agent Analyste.

L'intégration officielle existe et est documentée — voir le dépôt `crewAIInc/crewAI-examples/integrations/CrewAI-LangGraph` (archivé en avril 2026 mais code de référence figé et utilisable).

#### Limites à connaître

- **Courbe d'apprentissage plus raide que CrewAI** : il faut comprendre les notions de state schema, conditional edges, checkpointing, interrupts. C'est pourquoi nous le réservons aux endroits où c'est strictement nécessaire (sous-workflows complexes) et nous laissons CrewAI gérer le haut niveau.
- **Bas niveau et extensible — mais peu d'opinions** : LangGraph est volontairement minimal et ne dicte pas de structure. Cette flexibilité est puissante mais demande de la discipline d'architecture, sinon le code devient illisible.
- **Couplage fort avec LangSmith pour le tracing** : techniquement, LangGraph fonctionne sans LangSmith, mais pour debugger un graphe à 20 nœuds en production, LangSmith est quasi obligatoire. À budgéter (offre SaaS, ou auto-hébergement via LangSmith Self-Hosted).

---

### 4.4 LlamaIndex — le framework RAG de référence

#### Historique et origine

LlamaIndex a été créé par **Jerry Liu**, ancien chercheur ML chez Uber puis Quora puis Robust Intelligence (oui, comme Harrison Chase de LangChain — Jerry et Harrison étaient collègues chez Robust Intelligence en 2022). Premier commit sur GitHub le **5 novembre 2022**, sous le nom initial **"GPT Tree Index"** puis **"GPT Index"**.

L'origine est très spécifique : Jerry Liu voulait construire un bot de vente capable de répondre à partir de données privées d'entreprise, mais GPT-3 à l'époque avait une fenêtre de contexte de seulement **4 096 tokens**. Impossible d'injecter de gros documents directement. Comment alors connecter le LLM à des données externes sans le fine-tuner ? L'idée a été de **structurer les données dans un arbre** indexé, et de faire descendre le LLM dans l'arbre pour ne charger que les nœuds pertinents.

Le projet a été co-fondé avec **Simon Suo** (également ex-Uber). L'entreprise **LlamaIndex Inc.** a été incorporée en **avril 2023**, et a rapidement levé 8,5 M$ avec Greylock. Le rebranding "GPT Index" → "LlamaIndex" a eu lieu en 2023 pour s'éloigner de la dépendance perçue à OpenAI et embrasser l'écosystème multi-LLM. Le logo lama est devenu emblématique de la communauté RAG.

Aujourd'hui LlamaIndex est sous **licence MIT**, disponible en Python et TypeScript, avec **LlamaHub** (centaines de data loaders communautaires) et **LlamaParse** (parsing avancé de documents PDF, DOCX, PPTX — produit commercial). LlamaIndex Inc. propose également **LlamaCloud** (RAG managé) pour les entreprises qui ne veulent pas auto-héberger.

#### Utilité — quel problème résout-il ?

LlamaIndex résout **le problème du RAG** (Retrieval-Augmented Generation) de bout en bout : **comment connecter un LLM à des données privées** (qui n'étaient pas dans son entraînement) **pour qu'il puisse répondre factuellement, sans halluciner**.

Le RAG implique 5 étapes, et LlamaIndex couvre chacune :
1. **Ingestion** — charger des documents depuis des sources hétérogènes (fichiers, web, bases de données, APIs).
2. **Parsing / chunking** — découper intelligemment les documents en morceaux exploitables.
3. **Indexing** — vectoriser et stocker les chunks dans une base.
4. **Retrieval** — à partir d'une question, récupérer les chunks les plus pertinents.
5. **Synthesis** — injecter les chunks dans le prompt du LLM et obtenir une réponse sourcée.

Là où LangChain a un module RAG fonctionnel mais générique, **LlamaIndex est spécialisé** : il offre plus de stratégies d'indexation (vector, tree, list, keyword, knowledge graph, document summary), plus de retrievers avancés (auto-merging, sentence window, hybrid), un meilleur support des évaluations RAG (faithfulness, relevance, context precision), et une intégration native avec quasiment toutes les bases vectorielles.

#### Fonctionnement — les concepts clés

**Document** — l'unité de données chargée depuis une source. Un PDF est un Document, un post-mortem en Markdown est un Document.

**Data loader** (via LlamaHub) — connecteur pour ingérer depuis une source : `SimpleDirectoryReader` (fichiers locaux), `ConfluenceReader`, `JiraReader`, `S3Reader`, `WebReader`, `ElasticsearchReader`, etc.

**Node parser** — découpe les documents en chunks :
```python
from llama_index.core.node_parser import SimpleNodeParser

parser = SimpleNodeParser.from_defaults(
    chunk_size=512,
    chunk_overlap=64,
    include_metadata=True,
)
nodes = parser.get_nodes_from_documents(documents)
```

**Embedding model** — convertit chaque chunk en vecteur. LlamaIndex est agnostique : OpenAI, Cohere, Hugging Face, Ollama, vLLM, custom. Nous utilisons **bge-m3** local.

**Index** — la structure indexée. Le plus courant : `VectorStoreIndex` (chunks vectorisés stockés dans un vector store comme Weaviate). Mais aussi :
- `TreeIndex` (l'idée originelle de Jerry Liu — chunks hiérarchisés en arbre),
- `KeywordTableIndex` (recherche par mots-clés),
- `KnowledgeGraphIndex` (graphe d'entités extraites).

**Retriever** — interroge l'index. Le `VectorIndexRetriever` retourne les top-k chunks par similarité ; le `HybridRetriever` combine BM25 et similarité vectorielle (notre cas).

**Query engine** — boucle complète : *question → retrieval → synthesis → réponse sourcée*. Peut être enrichi d'un *response synthesizer* qui agrège plusieurs chunks intelligemment.

**Mise à jour incrémentale** — `index.insert(new_document)` ou `index.insert_nodes(new_nodes)` permet d'ajouter du contenu sans tout réindexer. C'est exactement ce dont nous avons besoin pour la boucle d'apprentissage post-incident.

#### Place dans notre architecture

LlamaIndex est notre **moteur de connaissance** (couche 2). Concrètement :

- **Au démarrage du projet** (phase 0), LlamaIndex ingère les runbooks, post-mortems, documentation Confluence/Wiki via les data loaders correspondants. Les chunks sont vectorisés via `bge-m3` et stockés dans Weaviate.
- **Pendant un incident**, l'agent Analyste (CrewAI) appelle un tool LangChain qui interroge LlamaIndex via un query engine hybride. Les top-5 chunks pertinents sont retournés et injectés dans le prompt de l'Analyste.
- **Après un incident**, l'agent Rédacteur publie le post-mortem, et un hook appelle `index.insert(new_postmortem)`. Le post-mortem fraîchement publié devient instantanément disponible pour le prochain incident.

C'est cette boucle qui fait de l'agent un **organisme apprenant**.

#### Limites à connaître

- **Choix d'index complexe** : avec 7+ types d'index disponibles, il faut savoir lequel utiliser. Pour notre cas (recherche par similarité dans des runbooks), le `VectorStoreIndex` suffit. Ne pas sur-ingénierer.
- **Qualité du chunking détermine la qualité du RAG** : un chunking trop fin perd le contexte, trop grossier dilue la pertinence. Tester avec votre corpus réel. `chunk_size=512, overlap=64` est un point de départ raisonnable pour des runbooks Markdown structurés.
- **Embeddings sont la moitié du jeu** : un mauvais embedding model (faible, ou non aligné sur la langue/le domaine) plombe le RAG quoi que vous fassiez. `bge-m3` est un choix solide en 2026 pour FR+EN.
- **Pas de versioning natif des documents** : si un runbook est mis à jour, l'ancien chunk reste dans l'index sauf si on le supprime explicitement. Il faut maintenir une discipline de pipeline d'indexation (delete-then-insert sur mise à jour).
- **LlamaIndex évolue rapidement** : v0.10 a marqué une refonte importante (séparation `core` / `integrations`). Pinner les versions.

---

### 4.5 Weaviate — la base vectorielle

#### Historique et origine

Weaviate est une **base de données vectorielle open source** créée par **Bob van Luijt**, entrepreneur néerlandais. L'histoire commence en **mars 2016**, quand Bob — alors consultant via sa société Kubrickology et passionné par le rapport entre langage, musique et logiciel — démarre Weaviate comme **projet open source**. Le déclencheur : le Google I/O 2016 où Sundar Pichai annonce le passage de Google de "mobile-first" à "AI-first". Bob expérimentait déjà avec les premiers embeddings de mots (word2vec, GloVe) et avait constaté que la distance vectorielle entre "Eiffel Tour" et "Paris" était plus petite qu'avec "Londres". Il a vu là le futur de la recherche.

À l'origine, Weaviate était un **graphe sémantique** avec une couche NLP. La transformation en **base vectorielle pure** s'est faite progressivement, avec l'arrivée de son co-fondateur **Etienne Dilocker** qui a porté l'architecture vers un design où *les embeddings sont citoyens de première classe* (avec son propre index ANN — Approximate Nearest Neighbors). En **janvier 2021**, Weaviate devient une vraie base de données vectorielle autonome.

L'entreprise a d'abord été incorporée sous le nom **SeMI Technologies** (Semantic Machine Insights), puis renommée **Weaviate** pour correspondre au produit. Levée totale ~67 M$ auprès d'Index Ventures, Battery Ventures, NEA, Zetta Venture Partners. La valorisation a fortement progressé avec l'explosion du RAG en 2023. Aujourd'hui, Weaviate est devenu l'une des bases vectorielles **les plus adoptées en entreprise** pour les workloads de production.

Licence **BSD 3-Clause** pour le cœur open source, avec offres commerciales **Weaviate Cloud** (SaaS) et **Bring Your Own Cloud** (déploiement dans le VPC client).

#### Utilité — quel problème résout-il ?

Weaviate résout un problème spécifique de la recherche moderne : **comment chercher par sens, pas par mots-clés**.

Une base SQL classique cherche par égalité ("WHERE nom = 'Paul'"). Elasticsearch cherche par tokens et BM25 ("trouve les documents contenant ces mots"). Une base vectorielle cherche **par similarité sémantique** : "trouve les chunks dont le sens est proche de ma question, même s'ils utilisent d'autres mots".

C'est cette capacité qui rend possible le RAG : transformer une question en vecteur (via embedding), chercher les vecteurs les plus proches dans la base, retourner les chunks associés.

Mais Weaviate ne fait pas que la similarité pure. Sa proposition de valeur unique tient en trois points :

1. **Recherche hybride native** — BM25 (mots-clés classique) **+** similarité vectorielle, combinés avec une fonction de scoring paramétrable. C'est crucial pour les requêtes qui mélangent termes techniques précis ("OOM WebLogic Old Gen") et concepts sémantiques ("incident mémoire java").
2. **Filtrage structuré + recherche sémantique** — on peut combiner *"chunks dont l'embedding est proche de X"* avec *"ET dont la métadonnée severity = P1 ET dont la date > 2025-01-01"*. Beaucoup de bases vectorielles ne le font pas efficacement.
3. **Modules d'inférence intégrés** — Weaviate peut vectoriser les données à l'ingestion via des modules (Cohere, OpenAI, Hugging Face, Ollama). On peut aussi fournir les vecteurs pré-calculés (notre cas avec `bge-m3` local).

#### Fonctionnement — les concepts clés

**Class / Collection** — l'équivalent d'une table SQL. On définit un schéma : nom de la classe, propriétés (texte, nombre, date, etc.), et configuration du vector index.

**Object** — une ligne dans une classe. A des propriétés (métadonnées) et un vecteur associé (calculé automatiquement ou fourni).

**Vector index — HNSW** (Hierarchical Navigable Small World) — l'algorithme de référence pour la recherche ANN à grande échelle. Permet de chercher les top-k voisins en O(log n) au lieu de O(n). Paramètres ajustables : `ef`, `efConstruction`, `maxConnections` (compromis vitesse / précision / mémoire).

**Modules** — système d'extension. Exemples : `text2vec-cohere`, `text2vec-openai`, `text2vec-transformers`, `qna-openai`, `generative-openai`, `multi2vec-clip` (multimodal).

**GraphQL / REST / gRPC** — trois APIs. GraphQL pour les requêtes complexes, REST pour les opérations CRUD simples, gRPC (depuis v1.19) pour les workloads à très haut débit.

**Multi-tenant** — Weaviate supporte le cloisonnement de données par tenant (utile pour isoler runbooks par BU, par exemple). C'est un vrai différenciateur vs Chroma qui ne le fait pas.

**Sharding et réplication** — pour les déploiements production. Sharding horizontal sur les classes très volumineuses, réplication pour la HA.

**Backup / restore** — vers S3 (Ceph RGW dans notre cas), GCS, Azure Blob, ou local. Critère essentiel pour le PRA.

**Operator Kubernetes officiel** — `weaviate-helm` chart et `weaviate-operator`, ce qui simplifie le déploiement HA dans notre cluster Talos.

#### Place dans notre architecture

Weaviate est notre **backend de la couche 2 (RAG)**. Il stocke physiquement les vecteurs et métadonnées que LlamaIndex orchestre logiquement. Concrètement :

- LlamaIndex envoie les chunks vectorisés (via `bge-m3`) à Weaviate pour stockage.
- Quand un agent CrewAI interroge le RAG via un tool LangChain, le tool appelle LlamaIndex qui appelle Weaviate pour la recherche ANN + filtrage métadonnées.
- Weaviate retourne les top-k chunks avec leur score, leurs métadonnées (source, date, sévérité, service), et leur contenu.
- LlamaIndex synthétise et retourne à l'agent.

**Déploiement** : 3 nœuds Weaviate sur le cluster Kubernetes, sharding par classe, réplication x2, backups quotidiens vers Ceph RGW S3, snapshots avant chaque ré-indexation massive.

#### Limites à connaître

- **Consommation mémoire** : HNSW stocke un grand nombre de connexions par vecteur. Pour 1 M vecteurs en 1024 dimensions, prévoir plusieurs Go de RAM dédiés. Bien dimensionner les nœuds.
- **HNSW = ANN, pas exact** : la recherche par approximation peut rater 1–2 % des "vrais" voisins selon les paramètres. Pour la plupart des cas RAG, c'est acceptable. Pour des cas critiques où la complétude est exigée, augmenter `ef` (coût en latence) ou utiliser une recherche exacte sur un sous-ensemble filtré.
- **Choix entre alternatives** : Qdrant, Pinecone (SaaS), pgvector (extension PostgreSQL), Chroma sont des concurrents valables. Notre choix Weaviate repose sur : recherche hybride native (avantage vs Chroma/pgvector pour des requêtes mixtes), auto-hébergement Kubernetes solide (avantage vs Pinecone), maturité enterprise (avantage vs Chroma).
- **Versions et migrations** : Weaviate évolue rapidement, et les migrations majeures (par ex. v1.18 → v1.19 avec gRPC) demandent une lecture attentive des release notes. Pinner les versions, tester en pré-prod.

---

### 4.6 Synthèse comparative des 5 outils

| Outil | Créé par | Année | Type | Rôle dans SRE-Copilot |
|---|---|---|---|---|
| **CrewAI** | João Moura | déc. 2023 (PyPI), janv. 2024 (lancement) | Framework Python multi-agents | Orchestration des 4 agents spécialisés |
| **LangChain** | Harrison Chase | oct. 2022 | Framework Python de composition LLM | Tools, prompts, parsers, intégrations |
| **LangGraph** | LangChain Inc. | mai 2024 | Bibliothèque Python de graphes à état | Sous-workflows à état (Analyste) |
| **LlamaIndex** | Jerry Liu | nov. 2022 (sous le nom GPT Index) | Framework Python de RAG | Indexation, recherche, mise à jour de la base de connaissances |
| **Weaviate** | Bob van Luijt | 2016 (projet), 2019 (entreprise) | Base de données vectorielle | Stockage physique des vecteurs RAG |

**Lecture transverse** : ces 5 outils couvrent ensemble les 4 phases du cycle agentique sans recouvrement :

- **Perception** : LangChain (tools de lecture observabilité) + CrewAI (agent Détecteur qui consomme)
- **Analyse** : LlamaIndex + Weaviate (RAG) + LangGraph (boucle d'investigation) + CrewAI (agent Analyste)
- **Action** : LangChain (tools d'exécution) + CrewAI (agent Exécuteur) + HITL natif CrewAI
- **Apprentissage** : LlamaIndex `insert()` + Weaviate update + CrewAI (agent Rédacteur qui publie et ré-indexe)

---

## 5. Stack technique complète — justification de chaque choix

### 5.1 Plateforme d'exécution : Kubernetes (Talos Linux)

**Besoin** : héberger l'agent et ses composants avec haute disponibilité, isolation, mise à jour sans interruption.

**Choix** : **Talos Linux + Kubernetes** sur le cluster existant. OS immuable sans SSH (configuration par API gRPC uniquement), surface d'attaque minimale exigée par DevSecOps. Auto-healing, scaling, rolling update natifs. Alternative écartée : VM Linux classique (mise à jour devient un événement risqué).

### 5.2 LLM : stratégie hybride (SaaS + local)

**Besoin** : raisonnement de haut niveau ET tâches sur données confidentielles.

**Choix** : modèle SaaS de pointe (Claude Sonnet/Opus, GPT-4-class) pour planification et rédaction ; modèle local (Llama 3.3 70B ou Mistral via vLLM) pour les données sensibles ; embeddings 100 % locaux (`bge-m3`). Un **router LLM** intégré dans les agents CrewAI sélectionne le modèle selon la sensibilité du contexte.

**Justification** : raisonnement complexe sur K8s/JVM demande le haut du panier ; les logs production peuvent contenir PII/secrets, donc pas d'envoi SaaS sans anonymisation préalable par le LLM local.

### 5.3 Observabilité : Prometheus/Thanos + Loki + Tempo + Hubble

**Besoin** : source de vérité unique métriques/logs/traces/flux réseau.

**Choix** : la stack documentée. Pas de réinvention (principe ITIL *"Commencer là où vous êtes"*). Thanos pour la rétention long terme (comparaison aux patterns historiques). Hubble apporte la dimension réseau L3-L7 décisive pour les incidents inter-services. L'agent accède **en lecture seule** (séparation stricte).

### 5.4 Corrélation et bus d'événements : Alertmanager + NATS JetStream

**Besoin** : déduplication, fenêtrage, file durable.

**Choix** : Alertmanager (déjà en place) puis NATS JetStream comme bus durable. Streams persistants, replay, consumer groups. Kafka écarté (surdimensionné), Redis Streams écarté (moins de garanties at-least-once).

### 5.5 Catalogue d'actions (Tools) : Ansible AWX + Kubernetes API + Python signés

**Besoin** : actions correctives auditables, idempotentes, révocables.

**Choix** : trois canaux —
1. **Ansible AWX** pour les actions serveurs (scripts `incident_diagnostic.sh`, `safe_restart.sh`).
2. **Kubernetes API** (ServiceAccount dédiée, RBAC minimal) pour actions cluster.
3. **Fonctions Python whitelistées** exposées comme tools LangChain pour actions complexes.

**Pas d'exécution arbitraire de bash par le LLM**. Le LLM choisit *quel* tool appeler avec *quels paramètres typés*, mais le code exécuté est versionné et signé.

### 5.6 Sécurité et gestion des secrets : Vault + Keycloak + SPIFFE/SPIRE

Détaillé en section 6.

### 5.7 SIEM et audit : Wazuh + Graylog + Suricata

**Besoin** : journalisation immuable, corrélation sécurité des actions agent.

**Choix** : stack documentée. Toute action agent forwardée vers Graylog (journal immuable séparé). Wazuh détecte les déviations comportementales.

### 5.8 Tableau récapitulatif

| Couche | Composant | Rôle | Alternative écartée |
|---|---|---|---|
| OS | Talos Linux | OS immuable des nœuds K8s | Ubuntu (mutable) |
| Orchestrateur | Kubernetes | Exécution conteneurisée | Nomad |
| **Multi-agents** | **CrewAI 0.152+** | **Rôles, tasks, process** | **AutoGen, agent maison** |
| **Tools & workflows** | **LangChain + LangGraph** | **Outils typés, sous-graphes à état** | **Tools custom (perte tracing)** |
| **RAG** | **LlamaIndex** | **Indexation, recherche, MAJ** | **LangChain RAG (moins optimisé)** |
| **Vector DB** | **Weaviate** | **Backend RAG** | **Pinecone (SaaS), Qdrant (acceptable)** |
| LLM raisonnement | Claude/GPT classe Sonnet+ | Planification, rédaction | Llama local seul (insuffisant K8s) |
| LLM données sensibles | Llama 3.3 / Mistral via vLLM | Anonymisation, résumé | SaaS impensable |
| Embeddings | bge-m3 local | Vectorisation FR/EN | OpenAI (envoi doc interne) |
| Métriques | Prometheus + Thanos | Time-series long terme | Datadog (coût) |
| Logs | Loki + Ceph RGW S3 | Aggregation | ELK (coût opérationnel) |
| Traces | Tempo | Tracing OTel | Jaeger |
| Réseau | Cilium + Hubble | CNI + visibilité L3-L7 | Calico (pas d'équivalent Hubble) |
| Bus | NATS JetStream | File durable | Kafka |
| Actions OS | Ansible AWX | Playbooks audités | SSH direct |
| Secrets | HashiCorp Vault | Coffre + rotation | SOPS |
| Identité | Keycloak + SPIFFE/SPIRE | Authn humains + workloads | Auth0 |
| SIEM | Wazuh + Graylog + Suricata | Audit + détection | Splunk |
| Storage objet | Ceph RGW (S3) | Heap dumps, logs, modèles | AWS S3 |
| ITSM | Jira + Confluence | Tickets + post-mortems | ServiceNow |
| HITL | Slack/Mattermost + bot OIDC | Validation humaine | Email |

---

## 6. Modèle de sécurité (DevSecOps + Zero Trust)

### 6.1 Moindre privilège — personas techniques

L'agent n'est pas un compte unique. Il est décomposé en personas (ServiceAccounts K8s) avec RBAC minimal :

- `sre-copilot-reader` : lecture seule Prometheus, Loki, Tempo, Hubble, CMDB.
- `sre-copilot-restarter` : uniquement `kubectl rollout restart` sur deployments taggés `managed-by-agent: true`.
- `sre-copilot-scaler` : ajuste replicas entre bornes min/max par namespace.
- `sre-copilot-dba` : **n'existe pas**. Actions base toujours en Advisor.

L'orchestrateur CrewAI sélectionne le persona selon l'action ; refus avant cluster si hors périmètre.

### 6.2 Human-in-the-loop gradué

| Type d'action | Mode | Validation |
|---|---|---|
| Lecture (logs, métriques) | Autopilot | Aucune |
| Restart pod namespace dev | Autopilot | Notification a posteriori Slack |
| Restart pod namespace prod | Co-pilot | Approbation Slack 1 personne d'astreinte |
| Scale-up | Co-pilot | Approbation Slack 1 personne |
| Scale-down, rollback release | Co-pilot | Approbation Slack 1 personne |
| Actions DB, suppression, modif réseau | Advisor | Humain exécute |

Révision trimestrielle en CAB ITIL. Au début presque tout en Co-pilot ; bascule progressive vers Autopilot après 6 mois de mesure.

### 6.3 Auditabilité — 6 questions, 3 destinations

Pour chaque action : Quoi / Qui / Quand / Pourquoi / Comment / Résultat. Traces vers Loki + audit Kubernetes + SIEM (Wazuh/Graylog). Incohérence entre les trois → alerte sécurité.

### 6.4 Protections spécifiques LLM

- **Prompt injection via logs** : logs jamais injectés bruts ; bloc utilisateur clairement délimité ; prompt système rappelle que logs = donnée, jamais instruction.
- **Hallucinations sur commandes** : pas de shell généré ; tools whitelistés signés ; paramètres validés par schéma Pydantic.
- **Exfiltration** : LLM SaaS ne reçoit que des résumés anonymisés produits par le LLM local.
- **Validation RAG des actions critiques** : avant exécution, l'Exécuteur interroge le RAG : *"Cette action est-elle recommandée dans les runbooks ?"*. Si aucune référence → mode Advisor automatique.

---

## 7. Résilience et haute disponibilité de l'agent

### 7.1 Topologie

- ≥ 3 réplicas de chaque composant stateless (CrewAI workers, LangChain tools, LlamaIndex retriever) sur nœuds distincts.
- PostgreSQL HA via CloudNativePG pour persistance états CrewAI Flow + checkpoints LangGraph. RPO < 1 min via WAL streaming.
- Weaviate cluster 3 nœuds avec réplication shards.
- Pool vLLM HA, ≥ 2 instances actives.

### 7.2 Dégradation contrôlée

| Composant en panne | Comportement |
|---|---|
| LLM SaaS inaccessible | Fallback LLM local, qualité réduite assumée |
| Weaviate inaccessible | Mode "sans RAG", prévention humaine |
| Prometheus inaccessible | Refus d'agir, notification Slack |
| AWX inaccessible | Bascule Advisor pur |
| Slack/Teams inaccessible | Fallback webhook email + portail web |

Chacun testé via **GameDay trimestriel**.

### 7.3 Garde-fous

- **Max steps par incident** : 30 nœuds LangGraph. Au-delà → escalade humaine.
- **Max actions correctives** : 3. Au-delà → escalade.
- **Cooldown** : 30 s minimum entre 2 actions sur même service.
- **Budget tokens LLM/mois** : plafond, fallback local si dépassé.
- **Circuit breaker** : > 3 actions dégradant SLI dans l'heure → mode dormant + alerte SRE manager.

---

## 8. Plan de mise en œuvre par phases (roadmap 6 mois)

### Phase 0 — Préparation (semaines 1–2)

- Atelier cadrage avec SRE, sécurité, RSSI, métier. Validation SLO section 1.2.
- Inventaire top 20 familles d'incidents (6 derniers mois).
- **Indexation initiale RAG via LlamaIndex** : runbooks existants, 12 derniers mois post-mortems, doc interne. Embeddings `bge-m3`. Stockage Weaviate.
- Provisioning infra : namespace K8s `sre-copilot`, Vault namespace dédié, ServiceAccounts vides.

**Livrable** : cadrage signé, backlog priorisé, RAG initial peuplé (> 100 documents), infra prête.

### Phase 1 — Agent en lecture seule (semaines 3–6)

- Connexion Alertmanager (webhook).
- Tools LangChain de lecture : PromQL, LogQL, TempoQL, Hubble, CMDB.
- Premier crew CrewAI : Détecteur + Analyste, process sequential.
- Sortie : message Slack riche avec hypothèse + commandes proposées + liens runbooks RAG.
- Astreinte humaine compare ses actions à celles proposées.

**Métrique fin phase** : taux "hypothèse correcte" > 60 %. Sinon → retravailler le RAG (chunking, couverture) avant phase 2.

### Phase 2 — Co-pilot sur P3/P4 (semaines 7–12)

- Ajout agent Exécuteur. Persona `sre-copilot-restarter` sur 3 services pilotes en pré-prod.
- HITL Slack : Approve/Reject/Modify (`human_input=True` natif CrewAI).
- Ajout agent Rédacteur. Premier post-mortem auto-généré (validation manuelle SRE avant publication).
- **Boucle d'apprentissage activée** : chaque post-mortem publié → `index.insert()` LlamaIndex.
- GameDay #1 : simulation OOM avec agent dans la boucle.

**Métrique fin phase** : 100 % actions Co-pilot tracées et auditables ; CFR < 5 %.

### Phase 3 — Extension production + Autopilot ciblé (semaines 13–20)

- Extension `tier: standard` (exclusion `tier: critical`).
- Autopilot autorisé : restart pod CrashLoopBackOff, scaling sous seuil, vidage fichiers temporaires.
- Process `hierarchical` CrewAI pour incidents complexes.
- Circuit breaker en place.
- GameDay #2 : test dégradation contrôlée (Weaviate down, LLM SaaS down).

**Métrique fin phase** : MTTR P3 < 10 min ; > 30 % incidents auto-résolus.

### Phase 4 — Industrialisation (semaines 21+)

- Extension Co-pilot `tier: critical` (double validation astreinte + manager).
- **Ré-indexation hebdomadaire RAG** (pipeline automatisé).
- Comité ITIL trimestriel : revue actions, ajustement permissions, rétro CALMS.
- Dashboard exécutif : MTTR par sévérité, autonomie, économies estimées.

---

## 9. Gouvernance, conformité ITIL et indicateurs

### 9.1 Cartographie ITIL ↔ composant

| Pratique ITIL 4 | Composant |
|---|---|
| Gestion des incidents | CrewAI (Détecteur/Analyste/Exécuteur) + LangChain tools + HITL |
| Gestion des problèmes | Agent Rédacteur + LlamaIndex (analyse récurrence) |
| Gestion des changements | AWX + CAB pour permissions |
| Gestion des configurations | CMDB consommée par Détecteur |
| **Gestion de la connaissance** | **LlamaIndex + Weaviate** |
| Mesures et rapports | Dashboard Grafana dédié |
| Supervision & événements | Prometheus + Alertmanager + NATS |
| **Amélioration continue** | **Boucle post-mortems → ré-indexation LlamaIndex** |

### 9.2 Indicateurs CALMS

- **Culture** : 100 % post-mortems blameless co-rédigés agent + humain.
- **Automation** : > 50 % alertes traitées sans intervention (cible phase 4).
- **Lean** : temps moyen investigation manuelle évité (60 s agent vs 10–15 min humain).
- **Measurement** : 7 SLO section 1.2, revus mensuellement.
- **Sharing** : taux runbooks couverts par RAG, accès self-service via portail.

### 9.3 Conformité réglementaire

- **NIS2 / DORA** : traçabilité des actions automatisées exigée (stack SIEM y répond).
- **RGPD** : anonymisation obligatoire avant envoi LLM SaaS (router LLM le fait par défaut).
- **AI Act européen** : catégorie "haut risque". Dossier de conformité formel à produire (évaluation des risques, supervision humaine, journalisation, robustesse).

---

## 10. Risques, limites et plan de mitigation

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Hallucination LLM proposant commande dangereuse | Moyenne | Élevé | Tools whitelistés, validation Pydantic, HITL, validation RAG |
| Prompt injection via logs | Moyenne | Élevé | Séparation prompt système / utilisateur |
| Dérive modèle SaaS (changement version) | Élevée | Moyen | Pin version, tests régression, fallback local |
| Coût LLM SaaS dérape | Élevée | Moyen | Budget mensuel + circuit breaker + cache Redis |
| Sur-dépendance SRE à l'agent | Moyenne | Élevé | Rotation "sans agent" 1j/sem ; GameDays sans agent |
| Compromission agent (privesc) | Faible | Très élevé | Personas RBAC, SPIFFE/SPIRE, Wazuh, SIEM externe |
| **Couverture RAG insuffisante** | **Très élevée** | **Moyen** | **Phase 0 indexation massive + boucle apprentissage + mode "je ne sais pas"** |
| **Qualité données RAG** | **Élevée** | **Moyen** | **Nettoyage mensuel ; tag `deprecated` ; ré-indexation périodique** |
| Désalignement actions / CAB | Moyenne | Moyen | Revue CAB trimestrielle obligatoire |
| Faux positifs alert fatigue inverse | Élevée | Moyen | Seuil minimum confiance ; consolidation fenêtre |
| LLM local indisponible en pic | Moyenne | Moyen | Pool vLLM HA, fallback SaaS si non sensible |
| **Complexité débogage triade** | **Élevée** | **Moyen** | **Tracing LangSmith unifié ; logs JSON ; tests par couche ; séparation stricte section 3.2** |
| **Breaking changes CrewAI/LangChain/LlamaIndex** | **Élevée** | **Moyen** | **Versions pinnées (uv/poetry) ; CI teste intégrations à chaque PR** |

---

## 11. Annexe — exemples de code et configurations

### 11.1 Définition d'un agent CrewAI (extrait `agents.yaml`)

```yaml
analyste_incident:
  role: >
    Expert en Root Cause Analysis (RCA), spécialiste corrélation
    logs/métriques/traces sur stack Kubernetes et JVM
  goal: >
    Identifier la cause racine probable d'un incident à partir du
    contexte enrichi et des runbooks historiques, et proposer une
    action corrective avec un niveau de confiance chiffré
  backstory: >
    Tu es SRE senior avec 10 ans d'expérience sur des stacks
    WebLogic, ColdFusion, Kubernetes. Tu ne proposes JAMAIS d'action
    qui ne soit pas documentée dans un runbook ou un post-mortem
    historique. Si tu n'as pas de référence solide, tu dis "Je ne sais
    pas avec certitude" et tu demandes l'aide d'un humain.
  tools:
    - loki_query
    - tempo_query
    - hubble_flows
    - rag_search_runbooks
    - rag_search_postmortems
  allow_delegation: false
  verbose: true
  max_iter: 10
  llm: ${LLM_REASONING}  # Claude Sonnet 4+ ou équivalent
```

### 11.2 Tool LangChain qui interroge le RAG LlamaIndex

```python
from langchain_core.tools import tool
from llama_index.core import VectorStoreIndex
from pydantic import BaseModel, Field

class RAGSearchInput(BaseModel):
    query: str = Field(description="Question en langage naturel, FR ou EN")
    document_type: str = Field(
        description="Type de doc à chercher",
        examples=["runbook", "postmortem", "documentation"]
    )
    top_k: int = Field(default=5, ge=1, le=10)

@tool(args_schema=RAGSearchInput)
def rag_search_runbooks(query: str, document_type: str, top_k: int = 5) -> str:
    """Recherche dans la base de connaissances (runbooks, post-mortems, doc).
    
    Utilise une recherche hybride BM25 + vecteur sur Weaviate via LlamaIndex.
    Retourne les top_k chunks les plus pertinents avec leur source.
    """
    index = get_index_for_type(document_type)  # cached singleton
    retriever = index.as_retriever(
        similarity_top_k=top_k,
        vector_store_query_mode="hybrid",  # BM25 + similarité
    )
    nodes = retriever.retrieve(query)
    
    results = []
    for node in nodes:
        results.append({
            "source": node.metadata.get("file_name"),
            "section": node.metadata.get("section"),
            "date": node.metadata.get("date"),
            "content": node.get_content(),
            "score": node.score,
        })
    return json.dumps(results, ensure_ascii=False)
```

### 11.3 Sous-workflow LangGraph (boucle d'investigation de l'Analyste)

```python
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.postgres import PostgresSaver

class InvestigationState(TypedDict):
    alert: dict
    metrics: dict
    logs: list
    rag_context: list
    hypothesis: str
    confidence: float
    iterations: int

def fetch_observability(state: InvestigationState) -> dict:
    return {
        "metrics": prometheus_query(state["alert"]["service"]),
        "logs": loki_query(state["alert"]["service"]),
    }

def query_rag(state: InvestigationState) -> dict:
    return {"rag_context": rag_search_runbooks(state["alert"]["summary"])}

def hypothesize(state: InvestigationState) -> dict:
    # Appel LLM avec contexte enrichi
    result = llm.invoke(build_prompt(state))
    return {
        "hypothesis": result.hypothesis,
        "confidence": result.confidence,
        "iterations": state["iterations"] + 1,
    }

def should_continue(state: InvestigationState) -> str:
    if state["confidence"] >= 0.8 or state["iterations"] >= 3:
        return END
    return "hypothesize"  # boucle de raffinement

# Construction du graphe
workflow = StateGraph(InvestigationState)
workflow.add_node("fetch_obs", fetch_observability)
workflow.add_node("query_rag", query_rag)
workflow.add_node("hypothesize", hypothesize)

workflow.add_edge(START, "fetch_obs")
workflow.add_edge("fetch_obs", "query_rag")
workflow.add_edge("query_rag", "hypothesize")
workflow.add_conditional_edges("hypothesize", should_continue)

# Checkpoint pour reprise sur erreur
checkpointer = PostgresSaver(connection_string=...)
graph = workflow.compile(checkpointer=checkpointer)
```

### 11.4 Boucle d'apprentissage : ré-indexation post-mortem

```python
from llama_index.core import SimpleDirectoryReader
from llama_index.core.node_parser import SimpleNodeParser

def add_postmortem_to_rag(postmortem_path: str, incident_metadata: dict):
    """Hook appelé par l'agent Rédacteur après publication Confluence."""
    docs = SimpleDirectoryReader(input_files=[postmortem_path]).load_data()
    
    for doc in docs:
        doc.metadata.update({
            "doc_type": "postmortem",
            "incident_id": incident_metadata["incident_id"],
            "severity": incident_metadata["severity"],
            "service": incident_metadata["service_impacted"],
            "date": incident_metadata["date"],
            "mttr_minutes": incident_metadata["mttr_minutes"],
        })
    
    parser = SimpleNodeParser.from_defaults(chunk_size=512, chunk_overlap=64)
    nodes = parser.get_nodes_from_documents(docs)
    
    index = get_index_for_type("postmortem")
    index.insert_nodes(nodes)
    
    redis_client.delete_keys_matching("rag_cache:*")
    
    logger.info(
        "RAG enrichi",
        extra={
            "incident_id": incident_metadata["incident_id"],
            "chunks_added": len(nodes),
            "source": postmortem_path,
        }
    )
```

### 11.5 Définition d'un Crew complet pour la gestion d'un incident

```python
from crewai import Agent, Task, Crew, Process

incident_crew = Crew(
    agents=[detecteur, analyste, executeur, redacteur],
    tasks=[
        Task(
            description="Qualifier l'alerte {alert_payload} en sévérité ITIL",
            expected_output="JSON avec severity, service_impacted, business_impact",
            agent=detecteur,
        ),
        Task(
            description="""Identifier la cause racine probable.
            Étapes obligatoires :
            1. Récupérer logs Loki des 10 dernières minutes du service
            2. Vérifier les traces Tempo pour les requêtes lentes
            3. Interroger le RAG pour les incidents similaires passés
            4. Formuler une hypothèse avec niveau de confiance""",
            expected_output="JSON avec hypothesis, evidence, recommended_action, confidence",
            agent=analyste,
            context=[task_detection],
        ),
        Task(
            description="""Appliquer l'action corrective recommandée.
            CONTRAINTES STRICTES :
            - Si confidence < 0.7 → escalade humaine, NE PAS exécuter
            - Si l'action n'est pas dans la whitelist du persona actif → escalade
            - Toujours capturer les métriques avant/après pour validation""",
            expected_output="JSON avec action_taken, status, metrics_before, metrics_after",
            agent=executeur,
            context=[task_analyse],
            human_input=True,  # HITL natif CrewAI sur action en production
        ),
        Task(
            description="""Rédiger le post-mortem conforme au template ITIL.
            Structure obligatoire :
            - Résumé exécutif (3 lignes)
            - Chronologie détaillée
            - Métriques (MTTD, MTTR, RTO)
            - Cause racine
            - Facteurs aggravants
            - Actions correctives avec deadline
            - Leçons apprises
            Publication automatique Confluence + ticket Jira Problem.""",
            expected_output="URL Confluence + URL Jira",
            agent=redacteur,
            context=[task_detection, task_analyse, task_execution],
        ),
    ],
    process=Process.sequential,
    verbose=True,
    memory=True,  # mémoire courte du Crew (différente du RAG long terme)
)
```

---

## Conclusion opérationnelle

Cet agent n'est pas un produit qu'on achète : c'est une **plateforme qui se construit, se mesure et se gouverne**. La triade **CrewAI + LangChain (+ LangGraph) + LlamaIndex (+ Weaviate)** n'est pas un effet de mode — c'est la seule combinaison qui couvre rigoureusement les 4 phases du cycle agentique (Perception, Analyse, Action, Apprentissage) en environnement de production sécurisé.

Chacun de ces 5 outils a une histoire courte mais dense (de 2016 pour Weaviate à 2024 pour LangGraph), une raison d'être précise, et une place non-substituable dans notre architecture. La section 4 documente cela en profondeur, pour que toute l'équipe — y compris les non-développeurs — puisse comprendre et défendre les choix.

Les trois facteurs de succès, par ordre d'importance :

1. **La qualité du RAG LlamaIndex** (runbooks, post-mortems indexés dans Weaviate). Un agent avec un LLM de pointe et un RAG vide est médiocre ; un agent avec un LLM moyen et un RAG riche est excellent.
2. **La discipline du HITL CrewAI** au démarrage. Toute tentation de basculer trop vite en autopilot dégrade la confiance et coûte cher en incidents auto-générés.
3. **La culture blameless** qui permet d'alimenter honnêtement les post-mortems, donc le RAG, donc l'agent. Sans CALMS Culture, la boucle d'apprentissage se referme sur elle-même et l'agent stagne.

La stack technique choisie est cohérente avec l'existant documenté dans les guides de référence. Elle ne demande pas de nouveaux investissements majeurs en plateforme — uniquement en compétences IA (les 5 outils détaillés en section 4), en gouvernance des actions (CAB ITIL adapté), et en discipline opérationnelle (post-mortems blameless systématiques).

L'objectif quantifié à 12 mois est ambitieux mais atteignable : MTTR P1 divisé par 2 minimum, P3 répétitifs divisés par 10, 100 % des post-mortems draftés automatiquement par l'agent Rédacteur et ré-indexés dans LlamaIndex/Weaviate. Ces gains se mesurent en euros (temps SRE), mais surtout en fiabilité perçue par les utilisateurs métier — qui est le seul vrai juge.
