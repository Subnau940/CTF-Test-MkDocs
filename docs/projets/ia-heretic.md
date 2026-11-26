---
title: IA Heretic locale pour le pentest — Documentation complète
type: documentation-projet
statut: en cours
cree: 2026-11-16
tags: [cyber, ia, heretic, pentest, homelab, ollama, llm]
---

# IA Heretic locale pour le pentest — Documentation du projet

> [!abstract] En une phrase
> Fabriquer, en local et sur mon propre matériel, un assistant IA **décensuré** (abliteré avec Heretic) spécialisé en cybersécurité offensive, puis le transformer en **agent** capable d'exécuter des commandes de façon autonome sur une machine Kali de lab isolé.

Ce document retrace **tout** le projet depuis le début : la recherche, les choix (modèle, matériel, outils), les réflexions, les remises en question, les bugs rencontrés et comment ils ont été résolus. Il sert de mémoire technique et de carnet de bord.

---

## 1. Genèse et objectif

### Le point de départ
L'idée initiale : prendre un modèle d'IA open-weights et le faire passer dans **Heretic** (`github.com/p-e-w/heretic`) pour retirer son « harnais » (son alignement de sécurité, c'est-à-dire ses refus), **en local**, sur du matériel à moi.

### L'objectif réel, affiné au fil du projet
- Un assistant **cyber/pentest** sans les refus réflexes des modèles grand public, pour apprendre sans buter sur « je ne peux pas t'aider avec ça ».
- À terme : un **agent autonome** qui pilote une Kali en SSH et cherche des failles sur des cibles de lab.
- Un second usage : un modèle **généraliste** décensuré pour discussion / recherche / rédaction.

### Cadre
Usage strictement **pédagogique et légal** : labs isolés, CTF (HackTheBox, TryHackMe), machines autorisées. Jamais sur une cible non autorisée.

---

## 2. Recherche initiale : comprendre l'abliteration

Avant de toucher à quoi que ce soit, il a fallu comprendre **ce qu'on faisait vraiment**.

### Les trois façons de « décensurer » un modèle
1. **Prompt système** — on change juste les instructions à l'exécution. Superficiel, réversible.
2. **Fine-tuning** — on ré-entraîne les poids sur de nouveaux exemples. Lourd.
3. **Abliteration** (ce qu'on a fait) — on modifie **directement les poids** pour atténuer la « direction du refus ».

### Comment marche Heretic (le mécanisme)
- Le modèle reçoit deux jeux de prompts : « nocifs » et « inoffensifs ».
- Heretic calcule, couche par couche, la **différence moyenne** entre les activations internes des deux jeux → ça donne une **direction de refus**.
- Il **orthogonalise** certaines matrices (attention out-projection, MLP down-projection) par rapport à cette direction, pour que le modèle ne puisse plus l'exprimer.
- Un optimiseur (Optuna) teste des dizaines de combinaisons de paramètres et cherche à **minimiser à la fois** le nombre de refus **et** la **KL divergence** (= les dégâts sur les capacités normales du modèle).

> [!info] Base théorique
> Papier fondateur : *« Refusal in Language Models Is Mediated by a Single Direction »* (arXiv 2406.11717). C'est la recherche sur laquelle Heretic s'appuie.

### Réflexion-clé de cette étape
L'abliteration **retire les refus mais n'ajoute aucune connaissance**. Un modèle décensuré n'est pas plus intelligent — il refuse juste moins. Il peut même **halluciner avec assurance** au lieu de refuser. Ce constat a guidé tout le reste du projet.

---

## 3. Choix stratégiques

### Fabriquer soi-même vs télécharger un Heretic tout fait
La communauté a publié des milliers de modèles « heretic » sur Hugging Face. On en a étudié plusieurs :
- `Hxwvr/heretic-coder-v1` — fiche peu sérieuse (un seul benchmark, aucune métrique de refus/KL, nom mentionnant un « merge » non documenté). **Écarté.**
- `DreamFast/qwen3-8b-heretic` — base claire (Qwen3-8B officiel), version de Heretic précisée, mais toujours pas de métriques affichées.
- Modèles `TheUnderscore/...`, `Kewk/...` trouvés via llmfit — noms à rallonge, peu de likes, non audités.

> [!warning] Décision
> **Fabriquer mon propre Heretic** à partir d'un modèle de base officiel. Raison : avec un modèle communautaire, on ne sait ni avec quels paramètres ni sur quelle base il a été fait → aucune garantie de qualité ni de confiance. En le fabriquant, je contrôle toute la chaîne.

### Quel modèle de base ?
- Outil utilisé : **llmfit** (`github.com/AlexsJones/llmfit`) — détecte le matériel et classe les modèles qui tiennent dessus (fit, vitesse, qualité).
- Résultat : pour **8 Go de VRAM**, **Qwen3-8B** est le meilleur choix dense pour sa taille.
- Pourquoi Qwen : excellent en **tool use / agentique** (crucial pour le futur agent pentest) et bonne gamme de petites tailles.
- Comparaison avec **GLM** (Zhipu AI) et **DeepSeek** : réputés forts en code/agentique, mais les versions performantes sont **trop grosses** pour 8 Go. Qwen3-8B reste le bon compromis.

> [!note] Piège évité
> `Qwen3-8B-Instruct-2507` **n'existe pas** (le suffixe `-Instruct-2507` est propre au 4B). Le bon nom est `Qwen/Qwen3-8B` tout court. Vérifié avant de lancer pour ne pas perdre 2h sur une erreur de nom.

---

## 4. Le matériel

Inventaire et répartition des rôles — beaucoup de réflexion a porté là-dessus.

| Machine | Spécifications | Rôle retenu |
|---|---|---|
| **Legion (PC portable gaming)** | RTX 5070 Laptop (8 Go VRAM, archi **Blackwell**), i7-13650HX, 32 Go DDR5, 475 Go SSD | **Fabrication du modèle + hébergement (Ollama) + harnais** |
| **Tour HP Compaq Elite 8300** | i7 Ivy Bridge (~2012, **pas d'AVX2**), 16 Go DDR3-1600, 2 disques, Quadro 600 (inutilisable) | Future **Kali en dur** (machine d'attaque dédiée) |
| **HP ProBook 650 G5** | i5 8e gen (AVX2 oui), 8 Go DDR4 (1 slot libre), SSD 256 Go | Envisagé comme serveur, finalement en réserve |

### Réflexions / remises en question sur le matériel
- **Deux phases très différentes** : la *fabrication* (phase 1, ponctuelle, gourmande en VRAM/GPU) et l'*utilisation* (phase 2, légère, surtout de la RAM). D'où l'idée de séparer les machines.
- **VRAM = le facteur n°1.** 8 Go impose la quantification 4-bit et limite à un 8B. Un 12B+ ne tient pas.
- **Pourquoi pas l'IA sur la vieille tour ?** Pas de GPU utilisable (Quadro 600 trop vieille) → inférence CPU seule, ~2-3 tokens/s. Trop lent pour un agent. → L'IA reste sur le Legion (le GPU change tout), la tour ne sert que de Kali.
- **Le vieux PC comme serveur H24 :** abandonné car l'IA a besoin du GPU du Legion. Architecture finale : **Legion = cerveau, tour = machine d'attaque**.

---

## 5. Environnement de fabrication (phase 1)

### WSL2 + Ubuntu
- Choix **WSL2 (Ubuntu 24.04)** plutôt que Windows natif : PyTorch + bitsandbytes + CUDA s'installent bien plus proprement sous Linux.
- WSL2 **n'est pas un conteneur Docker** : c'est une vraie VM légère (Hyper-V) avec son propre noyau Linux. Le GPU Windows y est exposé via un pilote spécial → **ne jamais installer de pilote NVIDIA dans Ubuntu**.
- RAM allouée à WSL2 augmentée via `.wslconfig` (`memory=28GB`, `swap=8GB`) pour le chargement du modèle.

### PyTorch pour une carte Blackwell
> [!important] Point sensible
> La RTX 5070 est une carte **Blackwell**, très récente. Elle exige **PyTorch compilé pour CUDA 12.8+** (≥ 2.7). Une version plus ancienne ne reconnaît pas la carte. Installé : **PyTorch 2.11 + CUDA 12.8**, vérifié avec `torch.cuda.is_available()` → `True` + nom de la carte.

---

## 6. Fabrication du modèle Heretic

### Le bug Blackwell (grosse remise en question)
Au premier lancement, Heretic **refusait de charger** le modèle : *« Some modules are dispatched on the CPU or the disk »*.

Fausses pistes éliminées une par une :
- VRAM insuffisante ? **Non** (0,7 / 8 Go utilisés).
- RAM système insuffisante ? **Non** (27 Go dispo, erreur identique).
- bitsandbytes dépassé ? **Non** (déjà à jour).

**Vraie cause** : le `device_map="auto"` d'`accelerate` **sous-évaluait la VRAM** sur une carte Blackwell + CUDA 12.8 + WSL2, et envoyait une partie du modèle sur CPU par excès de prudence.

**Solution** : forcer explicitement le device.
```bash
heretic --quantization bnb_4bit --device-map cuda:0 Qwen/Qwen3-8B
```
Confirmé d'abord en Python pur (`device_map='cuda:0'` → chargé en 9 s), puis l'option `--device-map` de Heretic a débloqué la chaîne.

### L'optimisation
- Modèle chargé en **4-bit (bnb_4bit)** → ~5,7 Go de VRAM.
- Calibration auto de la taille de lot (batch 32 = optimal à ~354 tok/s ; au-delà, débordement VRAM → plus lent).
- **200 essais Optuna** (~2h17) minimisant refus + KL divergence.

### Le résultat : trial 163
| Métrique | Valeur | Lecture |
|---|---|---|
| Refus (sur 100 prompts « nocifs ») | **6 / 100** | Quasi tous les refus levés |
| KL divergence | **0,0735** | Très faible — qualité bien préservée |

> [!success] Pourquoi c'est bon
> Le README de Heretic montre des abliterations publiques à KL 0,45–1,04 pour un résultat équivalent. 0,0735 = **beaucoup moins de dégâts** sur les capacités du modèle. Bon compromis automatique.

Export du modèle fusionné (safetensors) dans `~/heretic-lab/qwen3-8b-pentest`.

---

## 7. Conversion GGUF et import dans Ollama

Pour qu'Ollama puisse l'utiliser, il faut convertir les safetensors en **GGUF**, puis quantifier.

1. **Compilation de llama.cpp** (dans un venv Python **dédié**, pour éviter les conflits de versions avec Heretic).
2. **safetensors → GGUF f16** via `convert_hf_to_gguf.py`.
   - Bug tokenizer (`'list' object has no attribute 'keys'`) dû à une version trop récente de `transformers` → contourné en rétrogradant à **transformers 4.46.3**.
3. **Quantification** en **Q4_K_M** : `llama-quantize` → **4,79 Go** (contre 15,6 Go en f16), en 54 s.
4. **Copie du GGUF vers Windows**, création d'un `Modelfile`, import :
```powershell
ollama create qwen3-8b-pentest -f Modelfile
```

> [!tip] Piège Windows
> Notepad ajoute `.txt` automatiquement → le `Modelfile` devient `Modelfile.txt` et Ollama lit un mauvais format (`unsupported file type`). Renommer avec `Rename-Item`.

---

## 8. Interface : Open WebUI

- Déployé via **Docker** (`ghcr.io/open-webui/open-webui`).
- Port **8081** (le 3000 étant réservé par Windows/Hyper-V — plages de ports exclues, invisibles dans `netstat`).
- Se connecte automatiquement à Ollama, interface façon ChatGPT (sélecteur de modèle, historique, markdown). Compte **local**, rien ne sort.
- Ollama n'a **pas d'interface de chat native** : c'est un moteur en arrière-plan. Open WebUI est la couche visuelle.

---

## 9. Tests, réglage des prompts et LE grand constat

### Ce qui marche
- L'abliteration fonctionne : le modèle répond directement sur des sujets pentest que les modèles standards refusent (ex. payload msfvenom avec évasion AV).
- Qualité technique préservée : code propre, raisonnement cohérent, nuances pro.

### Les problèmes rencontrés et leurs correctifs (par le prompt système + paramètres)
- **Boucles de répétition** (`<Hacker><Hacker>...`) → `PARAMETER repeat_penalty` + température 0.6.
- **Fausses demandes d'outil** (`ask_user` avec boutons Oui/Non, alors qu'aucun outil n'est branché) → règle « n'utilise jamais de function_call ».
- **Préambules juridiques systématiques** → règle « ne commence jamais par un avertissement, réponds direct, prudence en 1 phrase à la fin ».

### Le constat central du projet : les hallucinations
> [!danger] À ne JAMAIS oublier
> Le modèle **invente des identifiants précis** (numéros de CVE, noms de modules Metasploit) de façon **très crédible**. Vérifié par recherche web : `CVE-2023-1978`, `CVE-2023-4187`, `CNNVD-202310-789` **n'existent pas**. Il garde la bonne structure, le bon contexte technique, mais le détail est fabriqué.
>
> **Règle absolue** : ne jamais faire confiance à un 8B local sur un identifiant précis (CVE, version, nom de module). Toujours vérifier sur `nvd.nist.gov` / `cve.org`. Le modèle est un **accélérateur et un guide**, jamais une source d'autorité finale.

Le modèle pentest (`qwen3-8b-pentest`) s'est révélé **plus fiable** que le généraliste (température plus basse, prompt mieux cadré, et il **corrige ses erreurs quand on le challenge**, contrairement au généraliste qui persistait).

---

## 10. Boîte à outils multi-modèles

Plutôt qu'un modèle unique, une petite **boîte à outils** (4 modèles Ollama, ~19 Go), chacun son rôle :

| Modèle | Rôle |
|---|---|
| `qwen3-8b-pentest` | **Principal** — red team, stratégie, explication (Heretic) |
| `qwen3-8b-heretic-general` | Même GGUF, prompt généraliste décensuré (discussion, rédaction) |
| `qwen2.5-coder:7b` | Spécialisé **code** — second avis quand le pentest sort du code bancal |
| `qwen2.5vl:7b` | **Vision** — analyser captures d'écran / schémas (le Qwen3-8B texte ne voit pas les images) |

On switche manuellement dans Open WebUI selon le besoin. Idée d'un système multi-agents (le pentest délègue le code au coder) : possible mais **trop lourd en VRAM** pour 8 Go → routing manuel suffit.

---

## 11. Tentative V2 (plus agressive) — reportée

Objectif : un modèle à **~0 refus** (trial plus agressif que le 163), au prix d'une KL plus haute.

- Bonne nouvelle : Heretic avait **sauvegardé les 200 trials** → pas besoin de refaire 2h d'optimisation, juste re-sélectionner un trial.
- Mauvaise nouvelle : série de **conflits de versions** (`urllib3`, `torchvision::nms`, `huggingface_hub`, et surtout un **format de checkpoint incompatible** entre Heretic v1.4 et v2.1). Coincé entre deux versions.
- **Décision** : reporter la V2. Le V1 (trial 163) + le prompt système bien réglé couvrent déjà les besoins. Un modèle à 0 refus serait **moins fiable** (plus d'hallucinations) et ne sert que pour les cas extrêmes.

> [!note] Leçon
> Les environnements Python de deep learning sont fragiles côté versions. **Un venv dédié par outil** (Heretic / llama.cpp / harnais) évite la plupart des conflits.

---

## 12. Le harnais : transformer le modèle en agent

C'est le cœur « agentique » du projet.

### Le concept-clé
Un LLM ne fait qu'**une chose** : texte entrant → texte sortant. Il ne sait **pas** faire du SSH ni exécuter quoi que ce soit. C'est le **harnais** (un programme Python) qui est « les mains » de l'IA.

### La boucle agentique
```
1. Je donne un OBJECTIF au harnais
2. Harnais → envoie l'objectif au modèle (API Ollama)
3. Modèle → répond en TEXTE : "COMMANDE: nmap -sV ..."
4. Harnais → extrait la commande
5. Harnais → l'exécute en SSH sur la Kali (paramiko)
6. Kali → renvoie le résultat
7. Harnais → renvoie le résultat au modèle
8. Modèle → décide de la suite... (boucle)
```
Le modèle **décide**, le harnais **exécute**. Le modèle ne touche jamais la Kali directement → c'est ce qui permet de garder le contrôle.

### Architecture : Windows plutôt qu'Ubuntu (remise en question importante)
Au départ le harnais était prévu sous Ubuntu, mais la connexion **WSL2 → Ollama** posait problème (Ollama sur Windows, injoignable en `localhost` depuis WSL2 ; mode mirrored, pare-feu, IP d'hôte…). De même, tester le harnais **sur la Kali** butait sur **Kali → Ollama** (pare-feu VMware).

> [!important] Déclic
> Mettre le harnais **sous Windows** supprime le seul maillon qui pose problème :
> - Windows → Ollama = `localhost:11434` (trivial)
> - Windows → Kali = SSH (marche déjà)
>
> Les deux connexions dont le harnais a besoin fonctionnent déjà de ce côté. Plus besoin d'Ubuntu pour l'usage quotidien.

### Clarification : Ollama reste 100% local
« Expose Ollama to the network » = l'exposer sur le **réseau local (LAN)**, pas sur internet. C'est juste pour que d'autres machines de chez moi puissent lui parler. Aucun paquet ne sort vers le web.

### Les briques du harnais
- `requests` → parle à **Ollama** (obtenir la commande).
- `paramiko` → parle à la **Kali en SSH** (exécuter la commande).
- `harnais_v1.py` : validation **manuelle** de chaque commande (`o`/`n`/`q`), logs dans `harnais.log`.

### Premier test réussi ✅
Objectif : « quelle est mon IP ? » → le modèle propose `hostname -I`, validation, exécution SSH → `192.168.247.200`, puis le modèle répond **`TERMINE`** en comprenant que l'objectif est atteint. **La boucle agentique complète fonctionne.**

---

## 13. Les grandes réflexions / remises en question (fil rouge)

- **Fabriquer vs télécharger** → fabriquer, pour la confiance et le contrôle.
- **Quelle machine pour quoi** → séparer fabrication (GPU) et usage/cible.
- **Refus à 6% : est-ce un problème ?** → non, c'est un compromis sain ; un 0% dégraderait la qualité. Et certains refus résiduels (ransomware fonctionnel) ne sont pas plus mal.
- **La vraie limite n'est pas la censure, c'est la fiabilité** → les hallucinations d'identifiants sont le vrai danger, pas les refus.
- **Le vrai défi n'est pas le modèle, c'est le harnais** → l'abliteration change peu la capacité à faire du tool use ; le harnais + les garde-fous sont le gros du travail.
- **Agentique ≠ plus de ressources** → chaque tour de boucle est un simple appel au modèle, comme un chat. Le GPU suffit. La limite est l'intelligence du 8B, pas le matériel.
- **Simplicité > élégance** → abandonner Ubuntu pour le harnais, abandonner la V2 : à chaque fois, choisir ce qui marche plutôt que ce qui est « pur ».

---

## 14. État actuel et prochaines étapes

> [!info] Mise à jour (fin nov. 2026)
> Depuis la rédaction de cette doc, le harnais est passé de la V1 (validation manuelle) à une **V3.2 autonome** : méthodologie PTES par phases, compte-rendu final automatique, liste noire de commandes destructrices, limite de tours, bloqueur de doublons, faits extraits des vraies sorties (anti-hallucination), lookup CVE via l'API NVD, RAG GTFOBins et détection de root. Résultat : **élévation de privilèges obtenue en autonomie** sur la Kali de lab (sudo nmap mal restreint). Prochaines étapes : fine-tuning LoRA, harnais neutre, VM cibles vulnérables, mode CTF.

### ✅ Fait
- Modèle Heretic fabriqué (Qwen3-8B, trial 163 : 6 refus/100, KL 0,0735).
- Converti en GGUF Q4_K_M, importé dans Ollama.
- Open WebUI opérationnel.
- Boîte à outils 4 modèles (pentest, général, code, vision).
- Prompts système réglés (anti-refus, anti-function_call, anti-hallucination).
- Harnais V1 (validation manuelle) **testé avec succès** sur VM Kali.

### ⬜ À venir (suivi dans Linear, projet « IA Heretic locale (pentest) »)
- **Harnais V2** : automatisation avec garde-fous (liste noire `rm -rf`/`dd`/…, limite de tours, logs, clé SSH). *Priorité haute.*
- **Installer Kali en dur** sur la tour HP Elite 8300.
- **VM cibles** vulnérables (Metasploitable, DVWA, HTB/THM) en réseau isolé.
- **Recherche web / RAG** pour réduire les hallucinations (SearXNG auto-hébergé, base CVE).

---

## 15. Lexique rapide

- **Abliteration** : modification des poids pour atténuer la direction du refus.
- **KL divergence** : mesure des dégâts sur les capacités normales du modèle (plus c'est bas, mieux c'est).
- **GGUF** : format de fichier des modèles pour Ollama / llama.cpp.
- **Quantification (Q4_K_M)** : compression des poids (16→4 bits) pour réduire la taille / la VRAM.
- **VRAM** : mémoire du GPU — le facteur limitant principal.
- **Tool use / agentique** : capacité du modèle à « appeler des outils » (décider d'actions structurées).
- **Harnais** : le programme qui exécute réellement les décisions du modèle (ses « mains »).
- **Hallucination** : le modèle invente une info plausible mais fausse avec assurance.

## 16. Liens utiles
- Heretic : https://github.com/p-e-w/heretic
- llmfit : https://github.com/AlexsJones/llmfit
- Papier abliteration : https://arxiv.org/abs/2406.11717
- Modèle de base : https://huggingface.co/Qwen/Qwen3-8B
- Vérif CVE : https://nvd.nist.gov · https://cve.org
