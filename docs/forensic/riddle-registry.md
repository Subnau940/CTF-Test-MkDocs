---
title: "Riddle Registry"
---

# 🕵️ Flag caché dans les métadonnées PDF

**Plateforme :** picoCTF · **Challenge :** The Ultimate Guide to Flag Hunting · **Catégorie :** Forensics · **Difficulté :** Intro

!!! success "Flag"
    `picoCTF{puzzl3d_m3tadata_f0und!_c999e2a4}`

## Résumé de la faille

Un PDF affiche un texte « leurre » qui prétend qu'il n'y a rien à trouver (« No flag here. Nice try though! »). Le flag n'est ni dans le texte visible ni dans le texte caché du contenu — il est planqué dans les **métadonnées** du fichier (le champ Author), encodé en base64.

**Concept :** le contenu visible d'un fichier n'est qu'une partie de ce qu'il contient. Les métadonnées sont une couche invisible à l'utilisateur normal, souvent négligée — et donc un bon endroit pour cacher (ou faire fuiter) de l'information.

## Méthodo — les étapes

1. **Lire l'énoncé attentivement** — texte volontairement trompeur (« just random text », « wrong place », « the answer might not be here after all »). Piste : chercher dans ce qui n'est PAS le texte visible du PDF.
2. **Premier réflexe : `strings`** :
   ```bash
   strings Bureau/confidential.pdf | grep -i pico
   strings Bureau/confidential.pdf | grep -i flag
   ```
   Résultat : `/Flags 32` (plusieurs fois) → faux positif, une propriété technique interne du format PDF. Rien de concluant.
3. **Deuxième réflexe : `exiftool`** (les métadonnées) :
   ```bash
   exiftool Bureau/confidential.pdf
   ```
   Résultat clé, dans le champ **Author** : `cGljb0NURntwdXp6bDNkX20zdGFkYXRhX2YwdW5kIV9jOTk5ZTJhNH0=` — une chaîne bizarre à cet endroit (au lieu d'un vrai nom) = suspect.
4. **Reconnaître l'encodage** — la chaîne finit par `=` (padding) et a une longueur cohérente → signature classique du base64.
5. **Décoder (CyberChef)** — coller la chaîne → opération `From Base64` → `picoCTF{puzzl3d_m3tadata_f0und!_c999e2a4}`.

## Réflexe forensics — la triade de départ

Sur n'importe quel fichier inconnu à analyser :

1. `file fichier` → quel type de fichier c'est vraiment.
2. `strings fichier` → chaînes de texte lisibles cachées dedans.
3. `exiftool fichier` → métadonnées (auteur, dates, logiciel, GPS...).

Ces trois commandes couvrent une grande partie des cas simples, avant de sortir l'artillerie plus lourde (`binwalk`, `pdf-parser`, `peepdf`...).

## Outils utilisés

| Outil | Rôle |
| :--- | :--- |
| `strings` | Extraire les chaînes de texte lisibles d'un binaire |
| `exiftool` | Lire les métadonnées d'un fichier (auteur, dates, logiciel...) |
| CyberChef | Décoder le base64 trouvé |

## ✅ Réflexes à retenir

- Un texte qui dit « il n'y a rien ici » dans un CTF est presque toujours un mensonge/indice détourné.
- `strings` + `exiftool` sont les deux premiers réflexes sur un fichier suspect.
- Se méfier des faux positifs qui ressemblent au flag de loin (`/Flags 32` ≠ `picoCTF{...}`).
- Une chaîne bizarre dans un champ censé contenir du texte normal (auteur, titre...) = suspect → tester un décodage base64 en premier réflexe.

## 🏢 Dans la vraie vie : pourquoi les métadonnées comptent

Les métadonnées fuient souvent des informations sensibles sans que l'utilisateur s'en rende compte : photos avec coordonnées GPS exactes, PDF/Word avec le vrai nom de l'auteur dans un document censé être anonyme, historique de modification, nom de l'ordinateur, logiciel utilisé.

**Réflexe pro / vie privée :** nettoyer les métadonnées avant de partager un fichier publiquement :

```bash
exiftool -all= fichier.pdf
```

Utilisé en OSINT (extraire un maximum d'infos d'un fichier public) et en hygiène numérique (éviter de fuiter des infos par erreur).
