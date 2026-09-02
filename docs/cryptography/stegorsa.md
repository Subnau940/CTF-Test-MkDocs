---
title: "StegoRSA"
---

# 🔑 StegoRSA (clé cachée dans une image)

**Plateforme :** picoCTF · **Catégorie :** Cryptography · **Difficulté :** Easy

!!! success "Flag"
    `picoCTF{rs4_k3y_1n_1mg_51611ab8}`

## Résumé de la faille

Un fichier `flag.enc` est chiffré en RSA, mais la clé publique a « disparu ». Une image fournie avec le challenge contient, cachée dans ses **métadonnées EXIF** (champ Comment), une clé privée RSA encodée en hexadécimal. Une fois extraite et convertie, cette clé permet de déchiffrer directement le fichier avec `openssl`.

**Concept :** combinaison stéganographie (donnée cachée dans une image) + cryptographie RSA classique.

## Méthodo — les étapes

1. **Lire l'énoncé** — « The public key is gone… but someone might have been careless with the private key. » + hints : « Metadata can tell you more than you expect » et « Hex can be turned back into a key file ».
2. **Extraire les métadonnées de l'image** :
   ```bash
   exiftool Téléchargements/image.jpg
   ```
   → un champ **Comment** contenant une longue chaîne hexadécimale (`2d2d2d2d2d424547494e...`).
3. **Reconnaître le contenu caché** — décodage mental du début : `2d`=`-`, `42`=`B`, `45`=`E`... → `-----BEGIN`, signature reconnaissable du format PEM.
4. **Convertir le hex en texte (CyberChef)** — opération « From Hex » (delimiter: Auto) → révèle le bloc complet :
   ```text
   -----BEGIN PRIVATE KEY-----
   MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcw...
   -----END PRIVATE KEY-----
   ```
5. **Piège rencontré : mauvaise première conversion.** Une première tentative (repasser par « Generate RSA key pair » après un hex mal interprété) a donné une clé RSA différente et incorrecte (1024 bits au lieu de la vraie). Symptôme trompeur : `openssl` refusait de déchiffrer avec l'erreur `data greater than mod len`.
6. **Bonne extraction** — repartir du texte brut donné par `exiftool` et appliquer directement « From Hex » sans étape intermédiaire erronée. On obtient la vraie clé privée RSA (2048 bits, cohérente avec la taille de `flag.enc`). Sauvegarder dans `pico.pem`.
7. **Déchiffrer avec openssl** :
   ```bash
   openssl pkeyutl -decrypt -inkey pico.pem -in flag.enc
   # → picoCTF{rs4_k3y_1n_1mg_51611ab8}
   ```

## Comprendre l'erreur « data greater than mod len »

En RSA, la taille max des données déchiffrables en un bloc est limitée par la taille de la clé (1024 bits → ~128 octets max, 2048 bits → ~256 octets max). Si le fichier chiffré dépasse ce que permet la clé fournie, `openssl` refuse avec cette erreur. Deux causes possibles à distinguer :

1. La clé utilisée est la mauvaise clé (cas ici — clé mal extraite/convertie).
2. Le fichier a été chiffré par blocs artisanaux avec une vraie clé trop petite pour un seul bloc.

→ Toujours vérifier l'hypothèse 1 (clé correcte ?) avant de partir sur l'hypothèse 2 (plus complexe à mettre en œuvre).

## Outils utilisés

| Outil | Rôle |
| :--- | :--- |
| `exiftool` | Extraire les métadonnées de l'image (champ Comment) |
| CyberChef (From Hex) | Convertir la chaîne hex en texte (la clé PEM) |
| `openssl pkeyutl -decrypt` | Déchiffrer le fichier avec la clé privée RSA |

`pkeyutl` est la sous-commande OpenSSL pour les opérations à clé publique/privée (remplace `rsautl`, dépréciée depuis OpenSSL 3.0).

## ✅ Réflexes à retenir

- Sur une image/fichier suspect : toujours tester `exiftool` en premier pour les métadonnées cachées.
- Une chaîne hex commençant par `2d2d2d2d2d42454749...` = signature de `-----BEGIN` → probablement une clé/certificat PEM caché.
- En cas d'erreur inattendue lors d'un déchiffrement, revérifier d'abord l'extraction/conversion des données en amont avant de chercher une explication technique plus complexe côté chiffrement.
- La taille du fichier chiffré doit être cohérente avec la taille de la clé RSA — une incohérence est un signal d'alerte utile pour diagnostiquer.

## 🏢 Dans la vraie vie

Une clé privée ne doit **jamais** être stockée dans des métadonnées, un fichier public, ou tout endroit accessible — c'est exactement la faille que ce challenge illustre (« someone might have been careless with the private key »).
