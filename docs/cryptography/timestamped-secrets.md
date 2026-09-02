---
title: "Timestamped Secrets"
---

# 🔑 Timestamped Secrets

Attaque sur PRNG prédictible basé sur un timestamp Unix (AES-128-ECB)

**Plateforme :** picoCTF 2026 · **Catégorie :** Cryptography · **Difficulté / Auteur :** Medium / Yahaya Meddy

!!! success "Flag"
    `picoCTF{sa3S_sEc9t_194672d0}`

## Objectif & résumé de la vulnérabilité

L'objectif du challenge est de déchiffrer un message intercepté chiffré en **AES-128-ECB**. La vulnérabilité découle d'une mauvaise génération de clé cryptographique : la clé symétrique dépend uniquement d'une valeur prédictible (le timestamp Unix d'exécution).

!!! danger "Concept clé : faiblesse d'entropie & PKCS#7 padding"
    Un générateur de clé dérivé du temps système (`int(time.time())`) réduit drastiquement l'espace de recherche (entropie). L'apparition de caractères non imprimables au déchiffrement correspond au bourrage **PKCS#7**, utilisé pour aligner la taille du texte sur des blocs de 16 octets.

## Outils & concepts clés

| Outil / Concept | Rôle & utilisation dans le CTF |
| :--- | :--- |
| CyberChef | Reconstruction de la recette `From Hex` + `AES Decrypt` |
| AES-128-ECB | Mode de chiffrement par bloc sans IV, vulnérable si la clé est faible |
| SHA-256 (tronqué) | Fonction de hachage appliquée à la représentation textuelle du timestamp |
| PKCS#7 Padding | Complète le dernier bloc avec des octets dont la valeur = nombre d'octets ajoutés |

## Démarche pas à pas

### Étape 1 — Analyse du code source Python

Le script d'encryption révèle la logique exacte de génération de la clé :

```python
timestamp = int(time.time())
key = sha256(str(timestamp).encode()).digest()[:16]
cipher = AES.new(key, AES.MODE_ECB)
```

La clé correspond aux 16 premiers octets bruts (32 caractères hex) du SHA-256 du timestamp Unix.

### Étape 2 — Dérivation de la clé avec le timestamp fourni

L'indice indique que le chiffrement a été réalisé autour du timestamp `1770242597`.

- String d'entrée : `"1770242597"`
- Hash SHA-256 complet : `1e072065e84dd5...`
- Clé AES hex (32 hex / 16 bytes) : `1e072065e84dd5...` (formatée en HEX dans CyberChef)

### Étape 3 — Déchiffrement dans CyberChef

Configuration de la recette CyberChef :

1. `From Hex` (pour convertir le ciphertext `77c36bef...` en octets)
2. `AES Decrypt` :
     - Mode : `ECB/NoPadding`
     - Key : `1e072065e84dd5...` (Input Format: HEX)

Résultat : `picoCTF{sa3S_sEc9t_194672d0}`

## ✅ Leçons retenues & réflexes à garder

!!! tip "Automatismes de sécurité cryptographique"
    - **Formats de clés dans les outils :** toujours s'assurer du format d'entrée des clés (brut, UTF-8, Base64 ou Hexadécimal). Une clé binaire doit être déclarée en format HEX dans des utilitaires comme CyberChef.
    - **Ne jamais utiliser le temps comme source d'entropie :** utiliser des générateurs cryptographiquement sûrs (`secrets` ou `os.urandom()` en Python) plutôt que `time.time()` ou `random`.
    - **Comprendre le bourrage (padding) :** ne pas s'inquiéter des octets non imprimables en fin de chaîne déchiffrée, ils font partie du mécanisme normal PKCS#7.
