# 🚩 CTF Writeups

Ce dépôt rassemble mes comptes-rendus de résolution de challenges CTF. L'objectif est de documenter mes méthodologies d'attaque, d'expliquer les concepts techniques (cryptographie, forensic, reverse, exploitation web) et de capitaliser sur chaque vulnérabilité exploitée.

## 📂 Structure

Les writeups sont classés par catégorie, chaque challenge ayant son propre dossier contenant le PDF d'analyse et, le cas échéant, les fichiers annexes (scripts, captures réseau, exports...).

| Catégorie | Challenges |
| :--- | :---: |
| [🔑 Cryptography](#-cryptography) | 8 |
| [🕵️ Forensic](#️-forensic) | 3 |
| [🧰 General skills](#-general-skills) | 2 |
| [⚙️ Reverse Engineering](#️-reverse-engineering) | 2 |
| [🌐 Web exploitation](#-web-exploitation) | 3 |

---

### 🔑 Cryptography

| Challenge | Concept | Writeup |
| :--- | :--- | :--- |
| 13 | ROT13 | [PDF](./Cryptography/13/writeup-crypto-rot13.pdf) |
| EVEN RSA CAN BE BROKEN | RSA | [PDF](<./Cryptography/EVEN RSA CAN BE BROKEN/writeup-crypto-evenrsa.pdf>) |
| Shared Secrets | Échange de clés | [PDF](<./Cryptography/Shared Secrets/writeup-crypto-sharedsecrets.pdf>) |
| Small Trouble (medium) | Attaque Boneh-Durfee (RSA) | [PDF](<./Cryptography/Small Trouble (medium)/writeup-crypto-bonehdurfee.pdf>) |
| StegoRSA | Stéganographie + RSA | [PDF](./Cryptography/StegoRSA/writeup-crypto-stegorsa.pdf) |
| The Numbers (A1Z26) | Chiffrement A1Z26 | [PDF](<./Cryptography/The Numbers (A1Z26)/writeup-crypto-a1z26.pdf>) |
| Timestamped Secrets (Medium) | Faiblesse de seed temporelle | [PDF](<./Cryptography/Timestamped Secrets (Medium)/writeup-timestamped-secrets.pdf>) |
| hashcrack | Cassage de hash | [PDF](./Cryptography/hashcrack/writeup-crypto-hashcrack.pdf) |
| interencdec | Base64 + César imbriqués | [PDF](./Cryptography/interencdec/writeup-crypto-doubleb64caesar.pdf) |

### 🕵️ Forensic

| Challenge | Concept | Writeup | Fichiers annexes |
| :--- | :--- | :--- | :--- |
| Ph4nt0m 1ntrud3r | Analyse de capture réseau (pcap) | [PDF](<./Forensic/Ph4nt0m 1ntrud3r/writeup-forensics-pcap.pdf>) | [pcap](<./Forensic/Ph4nt0m 1ntrud3r/myNetworkTraffic.pcap>), [csv](<./Forensic/Ph4nt0m 1ntrud3r/test.csv>) |
| Riddle Registry | Métadonnées de fichier | [PDF](<./Forensic/Riddle Registry/writeup-pdf-metadata.pdf>) | — |
| Timeline 0 (medium) | Reconstruction de timeline | [PDF](<./Forensic/Timeline 0 (medium)/writeup-forensics-timeline0.pdf>) | — |

### 🧰 General skills

| Challenge | Concept | Writeup |
| :--- | :--- | :--- |
| Sudo make me a sandwich | Droits `sudo` mal configurés | [PDF](<./General skills/Sudo make me a sandwich/writeup-sudo-make-me-a-sandwich.pdf>) |
| ping-cmd | Injection de commande | [PDF](<./General skills/ping-cmd/writeup-ping-cmd.pdf>) |

### ⚙️ Reverse Engineering

| Challenge | Concept | Writeup | Fichiers annexes |
| :--- | :--- | :--- | :--- |
| Flag Hunters | Injection de séparateur d'instructions, pointeur d'instruction (IP), Python | [PDF](<./Reverse Engineering/Flag Hunters/Writeup_Flag_Hunters_picoCTF.pdf>) | — |
| Transformation | Opérations bit-à-bit, encodage Unicode, dépaquetage 16→8 bits | [PDF](<./Reverse Engineering/Transformation/Writeup_Transformation_picoCTF.pdf>) | [script](<./Reverse Engineering/Transformation/test.py>) |

### 🌐 Web exploitation

| Challenge | Concept | Writeup |
| :--- | :--- | :--- |
| Crack the Gate 1 | Falsification d'en-tête HTTP | [PDF](<./Web exploitation/Crack the Gate 1/writeup-backdoor-header.pdf>) |
| Old Sessions | Détournement de session | [PDF](<./Web exploitation/Old Sessions/writeup-session-hijacking.pdf>) |
| SQL / SQLiLite | Injection SQL | [PDF](<./Web exploitation/SQL/SQLiLite/writeup-injection-sql.pdf>) |

