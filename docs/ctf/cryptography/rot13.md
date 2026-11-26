---
title: "13 (ROT13)"
---

# 🔑 13 — ROT13

**Plateforme :** picoCTF · **Challenge :** 13 · **Catégorie :** Cryptography · **Difficulté :** *Intro*{: .badge-intro}
{: .ctf-meta}

!!! success "Flag"
    `picoCTF{not_too_bad_of_a_problem}`

## Résumé de la faille

Le texte chiffré est fourni directement dans l'énoncé : `cvpbPGS{abg_gbb_onq_bs_n_ceboyrz}`. C'est du **ROT13**, un chiffrement par décalage de 13 lettres dans l'alphabet — le nom du challenge (« 13 ») et l'énoncé (« do you know what ROT13 is? ») donnent la réponse sans détour.

## Le principe du ROT13

Chaque lettre est décalée de 13 positions dans l'alphabet (A→N, B→O...). Comme l'alphabet fait 26 lettres, appliquer ROT13 une seconde fois **annule** le décalage et retrouve le texte d'origine — c'est son propre inverse (13 + 13 = 26 = un tour complet).

C'est un chiffrement historique très faible (pas de clé secrète, une seule position de décalage possible), utilisé surtout pour « masquer » un texte sans le chiffrer sérieusement (spoilers de forum, blagues...), jamais pour de la vraie confidentialité.

## Méthodo — les étapes

1. Repérer l'indice évident : le nom du challenge (« 13 ») + l'énoncé qui nomme directement ROT13.
2. Coller le texte chiffré dans un décodeur ROT13 (CyberChef, dcode.fr, ou tout site en ligne).
3. Appliquer l'opération **ROT13** → flag en clair.

## Outils utilisés

| Outil | Usage |
| :--- | :--- |
| CyberChef (opération « ROT13 ») | Décoder en 2 clics |
| Sites en ligne (dcode.fr...) | Alternative rapide sans CyberChef |

## ✅ Ce que représente ce challenge

C'est un challenge d'**introduction** à la catégorie Cryptography, volontairement trivial pour permettre à n'importe qui de rentrer dans la catégorie sans bagage crypto. Aucune difficulté technique réelle : l'intérêt est ailleurs — se familiariser avec l'outil (CyberChef) et le réflexe de reconnaissance (« lettres mélangées mais structure de mots préservée » = signe classique d'un chiffrement par substitution simple comme ROT13/César).

Un ROT13 se reconnaît souvent au premier coup d'œil : le texte garde la même longueur de mots et la même ponctuation que l'original, seules les lettres changent — contrairement à du base64 ou du hex qui cassent totalement la structure visuelle du texte.
