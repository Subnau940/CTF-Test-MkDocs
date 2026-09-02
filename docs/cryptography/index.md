---
title: Cryptography
---

# 🔑 Cryptography

Casser des implémentations cryptographiques mal utilisées : mauvaise génération de clé, dérivation faible, attaques mathématiques sur RSA, substitution/encodage classique.

| Challenge | Concept | Difficulté |
| :--- | :--- | :---: |
| [13 (ROT13)](rot13.md) | Chiffrement par substitution simple | Intro |
| [EVEN RSA CAN BE BROKEN](even-rsa.md) | Facteur premier prévisible (N pair) | Easy |
| [Shared Secrets](shared-secrets.md) | Diffie-Hellman + dérivation de clé faible | Easy |
| [Small Trouble](small-trouble.md) | Attaque Boneh-Durfee (d trop petit) | Medium |
| [StegoRSA](stegorsa.md) | Clé privée cachée dans des métadonnées EXIF | Easy |
| [The Numbers (A1Z26)](the-numbers-a1z26.md) | Reconnaissance d'encodage par les bornes | Intro |
| [Timestamped Secrets](timestamped-secrets.md) | Clé AES dérivée d'un timestamp prévisible | Medium |
| [hashcrack](hashcrack.md) | Cracking de hash par dictionnaire | Easy |
| [interencdec](interencdec.md) | Double Base64 imbriqué + César | Easy |
