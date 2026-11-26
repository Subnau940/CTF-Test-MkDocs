---
title: "Transformation"
---

# ⚙️ Transformation

**Plateforme :** picoCTF 2021 · **Catégorie :** Reverse Engineering · **Difficulté :** *Easy*{: .badge-easy}
{: .ctf-meta}

!!! success "Flag"
    `picoCTF{16_bits_inst34d_of_8_b7f62ca5}`

## Objectif / description

Déchiffrer une chaîne de caractères (ressemblant à du texte asiatique) accompagnée d'un snippet Python de chiffrement d'une ligne. Le but est de comprendre la logique de transformation binaire pour coder le script inverse.

## Outils & concepts clés

- Manipulation d'encodage et tables de caractères (ASCII / Unicode).
- Opérations bit-à-bit (Bitwise Shift `<<`, `>>`).
- Fonctions Python natives : `ord()` pour obtenir la valeur décimale et `chr()` pour reconvertir en caractère.
- Mathématiques modulaires (division entière `//`, modulo `%`).

## Démarche pas à pas

### 1. Reconnaissance & analyse statique

Le challenge fournit une chaîne chiffrée (des sinogrammes) et un algorithme d'encodage Python compacté :

```python
''.join([chr((ord(flag[i]) << 8) + ord(flag[i + 1])) for i in range(0, len(flag), 2)])
```

Le programme prend les caractères du flag original deux par deux (`range(0, len(flag), 2)`). Il décale le premier caractère de 8 bits vers la gauche (`<< 8`, équivalent à multiplier par 256) et lui additionne la valeur du second caractère. Deux caractères de 8 bits sont ainsi « empaquetés » en un seul nombre de 16 bits.

!!! tip "Le piège de la traduction"
    L'ordinateur interprète ces blocs de 16 bits comme des caractères dans la table Unicode, ce qui correspond par hasard à la plage des sinogrammes (CJK). Essayer de traduire le texte via Google Translate est un « rabbit hole » classique : il s'agit d'un pur artefact mathématique, pas de stéganographie linguistique.

### 2. Exploitation & création du script inverse

Pour inverser le processus, il faut lire la valeur décimale du caractère Unicode avec `ord()`, puis extraire les deux octets d'origine. La division entière par 256 (ou un décalage binaire `>> 8`) permet de récupérer le premier caractère (quotient), et le modulo 256 (ou un masque `& 0xFF`) permet de récupérer le second (reste).

```python
chaine_encodee = '灩捯䍔䙻ㄶ形楴獟楮獴㌴摟潦弸形㝦㘲捡㕽'
resultat_clair = ""
for char in chaine_encodee:
    valeur = ord(char)
    char1 = valeur // 256   # Extraction du 1er caractère
    char2 = valeur % 256    # Extraction du 2eme caractère
    resultat_clair += chr(char1) + chr(char2)
print(resultat_clair)
```

### 3. Obtention du flag

L'exécution du script de décodage révèle : `picoCTF{16_bits_inst34d_of_8_b7f62ca5}`.

## ✅ Leçons retenues & automatismes à garder

- **Capitalisation des outils :** ce script de « dépaquetage » binaire 16 bits est à archiver dans sa boîte à outils (`decode_16bit_unicode.py`), la manipulation d'encodage étant récurrente en CTF.
- **Connaître ses équivalences mathématiques et binaires :**
    - Un décalage à gauche (`<< 8`) est une multiplication par 256.
    - Un décalage à droite (`>> 8`) est une division entière par 256 (`// 256`).
    - Un masque binaire (`& 0xFF`) est l'équivalent du modulo 256 (`% 256`).
