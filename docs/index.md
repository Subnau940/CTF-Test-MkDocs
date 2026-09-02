---
title: Accueil
---

# 🚩 CTF Writeups

Base de connaissances de mes résolutions de challenges CTF (picoCTF principalement) : méthodologie, concepts de cybersécurité expliqués, outils utilisés, et réflexes à retenir pour chaque catégorie.

Chaque writeup suit le même plan : **résumé de la faille → méthodo pas à pas → outils → réflexes à retenir → application dans la vraie vie**. L'objectif n'est pas seulement de garder le flag, mais de capitaliser sur le *pourquoi* de chaque vulnérabilité.

[:material-pencil: Ajouter un writeup](contributing.md){ .md-button .md-button--primary }

## Catégories

| Catégorie | Challenges | Concepts couverts |
| :--- | :---: | :--- |
| [🔑 Cryptography](cryptography/index.md) | 9 | RSA, Diffie-Hellman, hachage, César, stéganographie |
| [🕵️ Forensic](forensic/index.md) | 3 | PCAP, métadonnées, timeline disque, timestomping |
| [🧰 General skills](general-skills/index.md) | 4 | PrivEsc sudo, command injection, load balancing |
| [⚙️ Reverse Engineering](reverse-engineering/index.md) | 4 | LLDB, SUID, encodage bit-à-bit, VM/interpréteur custom |
| [🌐 Web exploitation](web-exploitation/index.md) | 3 | Injection SQL, session hijacking, backdoor HTTP |

## Comment ce site fonctionne

Ce site est généré avec [MkDocs](https://www.mkdocs.org/) et le thème [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) à partir de fichiers Markdown dans `docs/`. Il est hébergé sur GitHub Pages et se reconstruit automatiquement à chaque `push` sur `main` — écrire un writeup se résume à ajouter un fichier `.md` et l'ajouter à la navigation (voir [Contribuer](contributing.md)).

Chaque writeup propose son propre bouton de téléchargement PDF, en haut de sa page.
