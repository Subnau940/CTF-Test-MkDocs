---
title: "EVEN RSA CAN BE BROKEN"
---

# 🔑 EVEN RSA CAN BE BROKEN??? (N pair)

**Plateforme :** picoCTF · **Catégorie :** Cryptography · **Difficulté :** *Easy*{: .badge-easy}
{: .ctf-meta}

!!! success "Flag"
    `picoCTF{tw0_1$_pr!m3lc9046c4}`

## Résumé de la faille

Un service génère des paires de clés RSA (1024 bits) et chiffre le flag avec. Le service fournit `N`, `e=65537` et le texte chiffré. La faille : le `N` généré est **systématiquement pair** — impossible en RSA normal, où `N = p × q` doit toujours être impair (produit de deux nombres premiers, forcément impairs sauf le nombre 2).

Un `N` pair signifie que l'un des deux facteurs premiers est **2** (le seul nombre premier pair) → `N` devient trivial à factoriser, et donc tout le RSA s'effondre.

## Méthodo — les étapes

1. **Lire l'énoncé et les hints** — « How much do we trust randomness? » (suspecter la génération aléatoire), « Notice anything interesting about N? » (observer N attentivement), « Try comparing N across multiple requests ».
2. **Se connecter plusieurs fois** au service et collecter les `N` :
   ```bash
   nc verbal-sleep.picoctf.net PORT
   ```
   → récupérer `N`, `e`, `cyphertext` à chaque connexion (9 essais).
3. **Analyser le code source fourni** (`encryption.py`) — confirme un RSA standard (`e=65537`, chiffrement `pow(m, e, N)` classique). La fonction `get_primes()` est importée d'un fichier `setup.py` non fourni → la faille est cachée là, à déduire par observation plutôt que par lecture directe.
4. **Repérer l'anomalie : tester la parité de N** — un nombre premier > 2 est toujours impair, donc `N = p × q` doit toujours être impair. En regardant le dernier chiffre de chaque `N` récupéré : tous pairs, systématiquement → `p = 2` à chaque génération.
5. **Résoudre avec dcode.fr** (Chiffre RSA) — renseigner `C` (cyphertext), `E` (65537), `N`, laisser le reste vide, cliquer « Calculer/Déchiffrer ». L'outil teste automatiquement plusieurs attaques et affiche le résultat.

## Pourquoi dcode.fr a réussi à casser ce RSA

dcode.fr/chiffre-rsa n'est pas magique : il teste plusieurs attaques RSA connues automatiquement dès qu'on lui donne `N`, `e` et `C` sans clé privée. Dans le panneau de résultats :

- « Attaque de Wiener : échec » → tentée, ne fonctionne pas ici
- « P,Q calculé(s) avec N (Décomposition en Facteurs premiers) » → réussi
- « D calculé(s) avec P,Q,E » → réussi
- « Déchiffrement avec C,D,N » → réussi

Factoriser un `N` normal (produit de deux grands nombres premiers aléatoires) est un problème mathématiquement très difficile — c'est précisément ce qui rend RSA sûr. Mais ici, un des deux facteurs est 2, le plus petit nombre premier possible. Un simple test de divisibilité par les petits nombres premiers (2, 3, 5, 7...) suffit à trouver immédiatement que `N` est divisible par 2. Une fois `p=2` trouvé, `q = N/2` est immédiat, et tout le reste suit mécaniquement.

## Outils utilisés

| Outil | Rôle |
| :--- | :--- |
| `nc` (netcat) | Récupérer plusieurs jeux de N/e/cyphertext |
| Lecture du code source | Confirmer le protocole RSA et repérer où chercher la faille |
| dcode.fr/chiffre-rsa | Factorisation automatique + calcul de D + déchiffrement, sans script |

## ✅ Réflexes à retenir

- Un `N` RSA est toujours impair en théorie — un `N` pair est une anomalie immédiate à exploiter (facteur = 2).
- Vérifier la parité d'un nombre est le test le plus simple possible — à tester avant des analyses plus complexes (PGCD entre plusieurs N, attaque de Wiener...).
- dcode.fr/chiffre-rsa est un bon réflexe de premier essai sur un challenge RSA avec seulement N/e/C connus.
- Un code source fourni peut ne pas tout révéler directement (ici, `setup.py` avec la vraie faille était absent) — parfois il faut compléter par de l'observation empirique.

## 🏢 Dans la vraie vie

Ce challenge illustre un principe fondamental : la sécurité de RSA repose entièrement sur la difficulté de factoriser `N`. Cette difficulté n'existe que si `p` et `q` sont deux grands nombres premiers choisis aléatoirement et indépendamment. Toute faiblesse dans leur génération (mauvais générateur aléatoire, biais, facteur prévisible comme ici) réduit à néant toute la sécurité — peu importe que `N` fasse 1024 bits ou plus.
