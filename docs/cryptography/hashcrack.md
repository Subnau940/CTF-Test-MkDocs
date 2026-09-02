---
title: "hashcrack"
---

# 🔑 Chaîne de hash à cracker (MD5 → SHA1 → SHA256)

**Plateforme :** picoCTF · **Catégorie :** Cryptography · **Difficulté :** Easy

!!! success "Flag"
    `picoCTF{UseStr0nG_h@shEs_&PaSswDs!_5b836723}`

## Résumé de la faille

Un service réseau (`nc`) présente successivement trois hash à casser (MD5, puis SHA1, puis SHA256), chacun correspondant à un mot de passe faible présent dans la wordlist **rockyou.txt**. Il faut casser les trois dans l'ordre, dans la même session `nc`, pour obtenir le flag.

**Concept :** cracking de hash par dictionnaire (wordlist attack) — la faiblesse n'est pas dans l'algorithme de hash lui-même, mais dans le choix de mots de passe trop communs/faibles.

## Méthodo — les étapes

1. **Se connecter au service et récupérer le premier hash** :
   ```bash
   nc verbal-sleep.picoctf.net 52455
   # → 482c811da5d5b4bc6d497ffa98491e38 (32 caractères hex → MD5)
   ```
2. **Identifier l'algorithme par la longueur du hash** :

   | Longueur (hex) | Algorithme probable |
   | :--- | :--- |
   | 32 caractères | MD5 |
   | 40 caractères | SHA1 |
   | 64 caractères | SHA256 |

3. **Préparer rockyou.txt** (déjà présent sur Kali) :
   ```bash
   ls -la /usr/share/wordlists/rockyou*
   gunzip /usr/share/wordlists/rockyou.txt.gz  # si encore compressé
   ```
4. **Cracker chaque hash avec John the Ripper** :
   ```bash
   echo "HASH_ICI" > hash.txt
   john --wordlist=/usr/share/wordlists/rockyou.txt --format=FORMAT hash.txt
   # --format=raw-md5, raw-SHA1 ou raw-SHA256 selon le hash
   ```
   Résultats obtenus : MD5 → `password123`, SHA1 → `letmein`, SHA256 → `qwerty098`.
5. **Répondre dans la MÊME session nc, dans l'ordre.**

!!! warning "Piège"
    Chaque connexion `nc` redémarre la séquence depuis le début — il faut enchaîner les 3 bonnes réponses d'affilée dans une seule session, pas les tester séparément sur des connexions différentes.

## Piège rencontré : le cache de John (« No password hashes left to crack »)

En relançant `john` sur un nouveau hash mis dans le même fichier `hash.txt`, l'erreur peut apparaître alors que le mot de passe n'a pourtant pas encore été trouvé pour ce hash précis.

**Cause :** John garde un cache persistant (`~/.john/john.pot`) de tous les hashs déjà traités lors de sessions précédentes.

**Diagnostic :**
```bash
john --show --format=FORMAT hash.txt
```
S'il affiche un résultat (`?:motdepasse`) → le hash a déjà été cassé lors d'un essai précédent. Sinon, forcer un nouveau run avec un cache vierge (`--pot=nouveau.pot`) ou vider le cache global (`rm ~/.john/john.pot`).

## Outils utilisés

| Outil | Rôle |
| :--- | :--- |
| `nc` (netcat) | Se connecter au service, dialoguer en direct |
| `john` (John the Ripper) | Cracker les hash par dictionnaire |
| rockyou.txt | Wordlist de mots de passe réels ayant fuité (14M+ entrées) |

## ✅ Réflexes à retenir

- Longueur du hash en hexadécimal = indice fort sur l'algorithme (32→MD5, 40→SHA1, 64→SHA256).
- rockyou.txt est déjà présent sur Kali (`/usr/share/wordlists/`), pas besoin de le télécharger.
- `john --show --format=X fichier` permet de vérifier si un hash a déjà été cassé.
- Dans un challenge en chaîne via `nc`, bien répondre dans la même session, dans l'ordre.

## 🏢 Dans la vraie vie

Ce challenge illustre une réalité concrète : même un hash cryptographiquement solide (SHA256) ne protège rien si le mot de passe hashé est trop faible/commun. En audit de sécurité réel, cracker des hash de mots de passe fuités avec rockyou.txt (ou des wordlists plus grandes) est une pratique courante pour évaluer la robustesse réelle des mots de passe d'une organisation.
