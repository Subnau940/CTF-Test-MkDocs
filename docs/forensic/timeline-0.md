---
title: "Timeline 0"
---

# 🕵️ Timeline 0

Analyse d'image disque, création de MAC Timeline & Timestomping

**Plateforme :** picoCTF 2026 · **Catégorie :** Forensics / Disk · **Difficulté / Auteur :** Medium / LT 'syreal' Jones

!!! success "Flag"
    `picoCTF{71m311n3_0u7113r_h3r_43a2e7af}`

## Objectif & résumé de la vulnérabilité

L'objectif de ce challenge est d'analyser une image disque brute de partition (`partition4.img.gz`) afin de retrouver un flag dissimulé par un attaquant.

L'attaquant a utilisé la technique du **Timestomping** (altération intentionnelle des horodatages du système de fichiers) pour dissimuler un fichier suspect au sein d'une arborescence système classique. La création d'une chronologie globale des métadonnées (MAC Timeline) permet de faire ressortir ce fichier sous forme d'anomalie temporelle extrême (date remontant à 1985).

!!! danger "Concept clé : Timestomping & MACB"
    Le Timestomping consiste à modifier les horodatages d'un fichier (Modified, Accessed, Changed, Birth) pour tromper l'analyse chronologique. Cependant, une modification superficielle laisse souvent des incohérences ou des dates artificiellement lointaines qui ressortent immédiatement lors de la génération d'une timeline globale via The Sleuth Kit (TSK).

## Outils & concepts clés

| Outil / Concept | Rôle & utilisation dans le CTF |
| :--- | :--- |
| `gunzip` | Décompression de l'archive `partition4.img.gz` vers l'image `partition4.img` |
| `fls` (Sleuth Kit) | Parcours récursif de l'image disque et extraction des métadonnées de tous les inodes pour générer un bodyfile |
| `mactime` (Sleuth Kit) | Conversion du bodyfile en une chronologie lisible (Timeline) triée par date |
| `icat` (Sleuth Kit) | Extraction directe du contenu binaire d'un fichier en ciblant son numéro d'inode |
| Base64 & Leetspeak | Décodage du payload extrait de l'inode suspect et interprétation du texte leet |

## Démarche pas à pas

### Étape 1 — Décompression & inspection initiale

```bash
gunzip partition4.img.gz
```

Une première tentative d'analyse avec `exiftool` ou des recherches textuelles brutes (`strings | grep`) échoue : le contenu recherché est encodé et masqué dans la structure profonde des inodes du système de fichiers.

### Étape 2 — Génération de la MAC Timeline (The Sleuth Kit)

En s'appuyant sur l'indice n°1 (« Create a Sleuthkit MAC timeline! »), l'objectif est d'extraire toutes les métadonnées de la partition à l'aide de `fls` pour construire un bodyfile, puis de le formater avec `mactime` :

```bash
# 1. Génération du bodyfile
fls -r -m "/" partition4.img > bodyfile.txt

# 2. Conversion en timeline structurée
mactime -b bodyfile.txt -d -y -z Europe/Paris > timeline.csv
```

### Étape 3 — Détection de l'anomalie temporelle (timestomping)

En examinant `timeline.csv` (conformément à l'indice n°2 : « Sloppy timestomping can yield strange (very old) timestamps »), une ligne isolée ressort immédiatement parmi l'ensemble des fichiers datant de 2025/2026 :

```text
1985-01-01T17:00:00Z,41,macb,r/rrw-r--r--,0,0,4945,"/bin/bcab"
```

- Horodatage anormal : 1er janvier 1985.
- Emplacement suspect : fichier `/bin/bcab`.
- Inode associé : numéro `4945`.

### Étape 4 — Extraction du contenu via inode & décodage

Plutôt que de monter la partition, `icat` extrait directement la charge utile associée à l'inode `4945` :

```bash
icat partition4.img 4945
# Sortie brute : NzFtMzExbjNfMHU3MTEzcl9oM3JfNDNhMmU3YWYK

echo "NzFtMzExbjNfMHU3MTEzcl9oM3JfNDNhMmU3YWYK" | base64 -d
# Sortie décodée : 71m311n3_0u7113r_h3r_43a2e7af
```

Le texte obtenu est en leetspeak : `71m311n3` (Timeline), `0u7113r` (Outlier / Anomalie) → `picoCTF{71m311n3_0u7113r_h3r_43a2e7af}`.

## Mémento technique (cheatsheet Sleuth Kit)

| Commande TSK | Description & rôle forensics |
| :--- | :--- |
| `fls -r -m "/" <img>` | Liste récursivement fichiers/répertoires d'une image disque, produit un bodyfile |
| `mactime -b <bodyfile>` | Analyse le bodyfile pour créer un rapport chronologique (M/A/C/B) |
| `icat <img> <inode>` | Extrait le contenu binaire brut d'un fichier via son numéro d'inode |
| `ils <img>` | Affiche les informations relatives aux inodes (dont supprimés/orphelins) |

## ✅ Leçons retenues & réflexes à garder

- **Recherche ciblée vs globale :** ne pas se limiter à `strings` ou `exiftool` lorsque l'attaquant a pu encoder des données ou modifier la structure du système de fichiers.
- **L'analyse temporelle (timelining)** est le meilleur moyen d'isoler rapidement les anomalies (fichiers modifiés récemment, ou dates artificielles).
- **Extraction par inode (`icat`) :** garder le réflexe pour éviter d'altérer la preuve en montant la partition en écriture.
- **Leetspeak :** dans les CTF, les flags décodés contiennent souvent du texte leet en lien direct avec le thème du challenge.
