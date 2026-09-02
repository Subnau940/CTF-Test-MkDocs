---
title: "Ph4nt0m 1ntrud3r"
---

# 🕵️ Ph4nt0m 1ntrud3r (données cachées dans un PCAP)

**Plateforme :** picoCTF · **Catégorie :** Forensics · **Difficulté :** *Easy*{: .badge-easy}
{: .ctf-meta}

!!! success "Flag"
    `picoCTF{1t_w4snt_th4t_34sy_tbh_...}`

## Résumé de la faille

Un fichier PCAP contient ~22 paquets TCP déguisés en « retransmissions ». Chaque paquet cache un fragment de données encodé en base64. Les paquets sont volontairement dans le désordre temporel. Il faut : extraire les fragments, les trier par timestamp, les assembler, convertir l'hex en texte, puis décoder le base64 → flag.

**Concept :** exfiltration de données cachée dans du trafic réseau + ordre temporel comme clé.

## Méthodo — les étapes

1. **Explorer le PCAP** dans Wireshark (GUI) pour observer : trafic bizarre (toutes des « TCP Retransmission » SYN), timestamps en désordre, fragments base64 dans les données (finissent par `=`). Indices de l'énoncé : « well timely manner » (le TIMING) + « right filters ».
2. **Basculer en ligne de commande** — le GUI sert à explorer/comprendre ; pour extraire et traiter en masse, le CLI (`tshark` + pipes Unix) est bien plus efficace et reproductible.

### Les commandes

```bash
# Extraire les données TCP (test)
tshark -r myNetworkTraffic.pcap -T fields -e tcp.segment_data

# Extraire temps + données (pour trier)
tshark -r myNetworkTraffic.pcap -T fields -e frame.time_epoch -e tcp.segment_data

# LA commande finale
tshark -r myNetworkTraffic.pcap -T fields -e frame.time_epoch -e tcp.segment_data \
  | sort | cut -f2 | tr -d '\n' | xxd -r -p | base64 -d
# → flag picoCTF{...}
```

### Décorticage de la commande finale

| Maillon | Rôle |
| :--- | :--- |
| `tshark -r f -T fields -e ...` | Extrait timestamp + données TCP du pcap |
| `\| sort` | Trie les lignes par timestamp (remet dans l'ordre) |
| `\| cut -f2` | Garde seulement la colonne 2 (le fragment hex) |
| `\| tr -d '\n'` | Supprime les retours à la ligne (colle tout) |
| `\| xxd -r -p` | Convertit l'hex en texte (= le base64) |
| `\| base64 -d` | Décode le base64 → le flag |

Le `|` (pipe) envoie la sortie d'une commande vers la suivante — philosophie Unix : chaque outil fait UNE chose, on les enchaîne.

## tshark — les bases (Wireshark en CLI)

```bash
tshark -r fichier.pcap -T fields -e CHAMP
```

| Option | Rôle |
| :--- | :--- |
| `-r fichier` | Lire un fichier de capture |
| `-T fields` | Sortie en champs bruts |
| `-e champ` | Quel champ extraire (répétable) |
| `-Y "filtre"` | Filtre d'affichage (ex: `-Y "http.request"`) |
| `-c N` | Limiter à N paquets |

Champs utiles : `frame.time_epoch` (timestamp), `frame.number`, `ip.src`/`ip.dst`, `tcp.port`, `tcp.segment_data`, `http.request.uri`, `dns.qry.name`.

## ✅ Réflexes à retenir

- **GUI (Wireshark) pour explorer/comprendre, CLI (tshark) pour extraire/traiter.**
- Fragments qui finissent par `=` → base64.
- Données en hex → `xxd -r -p` pour convertir en texte.
- Timestamps en désordre + indice « timing » → il faut TRIER par le temps.
- Chaîner les outils avec des pipes `|` : extraire → trier → nettoyer → décoder.
