---
title: "Bypassme"
---

# ⚙️ Bypass Me (LLDB + SUID)

**Plateforme :** picoCTF · **Catégorie :** Reverse Engineering · **Difficulté :** Medium

!!! success "Flag"
    `picoCTF{d3bugg3r_p0w3r_is_4w3s0m3_30b6c610}`

## Résumé de la faille

Un binaire `bypassme.bin` demande un mot de passe. Le mot de passe correct est décodé en mémoire au tout début de l'exécution (avant même l'affichage du prompt), via une fonction `decode_password()`. En utilisant un débogueur (LLDB) pour arrêter le programme juste après ce décodage et lire la mémoire, on récupère le mot de passe en clair sans jamais avoir à le deviner ou le casser.

Une seconde subtilité s'ajoute : le binaire a le **bit SUID** actif (appartient à `root`), ce qui lui permet de lire un fichier flag normalement inaccessible — mais ce mécanisme est désactivé quand le programme tourne sous un débogueur, ce qui oblige à relancer le binaire « normalement » une fois le mot de passe en poche.

## Méthodo — les étapes

### 1. Connexion et reconnaissance de base

```bash
ssh ctf-player@foggy-cliff.picoctf.net -p 64701
file bypassme.bin
strings bypassme.bin | grep -i pass
```

!!! tip "Piège de syntaxe évité"
    `ssh` utilise `-p` (minuscule) pour le port, séparé de l'hôte par un espace — pas `hote:port` comme dans un navigateur.

### 2. Explorer les symboles du binaire (avant tout désassemblage)

```text
lldb ./bypassme.bin
(lldb) image dump symtab bypassme.bin
```

Repérage des fonctions « maison » : `sanitize`, `main`, `auth_sequence`, `decode_password`, `type_out`, `intro_sequence`. `decode_password(char*)` est le nom le plus révélateur : le mot de passe correct n'est pas stocké en clair, mais encodé, puis décodé au runtime — exactement le genre de moment qu'un débogueur permet d'intercepter.

### 3. Premier essai (erroné) : breakpoint sur auth_sequence

```text
(lldb) breakpoint set --name auth_sequence
(lldb) run
```

Le breakpoint n'a jamais été atteint (`hit count = 0`) alors que le programme s'est exécuté jusqu'au bout. **Leçon :** `auth_sequence()` n'est appelée que si le mot de passe est correct — elle n'était donc jamais atteinte avec un mauvais mot de passe.

### 4. Désassembler main pour comprendre la logique complète

```text
(lldb) disassemble --name main
```

Points clés repérés :
```text
callq 0x1333  ; decode_password  <- appelée TOUT AU DÉBUT
callq 0x14c6  ; intro_sequence
...
callq 0x1180  ; strcmp (comparaison input vs mot de passe décodé)
testl %eax, %eax
jne   0x1801  ; si DIFFÉRENT -> Access Denied
callq 0x1457  ; si ÉGAL -> auth_sequence()
```

### 5. Breakpoint fiable : par fichier + ligne (pas par adresse absolue)

Une première tentative avec `--address 0x555555555759` a échoué (« unresolved »). Cause probable : **ASLR** (Address Space Layout Randomization), qui randomise les adresses à chaque exécution.

Solution robuste — cibler par fichier source + numéro de ligne, résolu dynamiquement au runtime :

```text
(lldb) breakpoint set --file bypassme.c --line 82
(lldb) run
```

### 6. Lire la mémoire pour extraire le mot de passe décodé

```text
(lldb) memory read --format s $rbp-0x110
0x7ffe0068a9e0: "SuperSecure"
```

### 7. Piège : le SUID est désactivé sous débogueur

En tapant `SuperSecure` sous LLDB, l'authentification réussit mais : `Flag file not found.` Les strings révèlent le chemin recherché : `../../root/flag.txt`.

```bash
ls -la /root/flag.txt      # Permission denied
ls -la ~/bypassme.bin
# -rwsr-xr-x 1 root root 21672 ... bypassme.bin
```

Le `s` à la place du `x` (droits propriétaire) = **bit SUID actif**, binaire appartenant à `root`. Mais le noyau Linux désactive le SUID quand un programme tourne sous un débogueur (mesure de sécurité) — d'où l'échec pendant la session LLDB.

### 8. Solution finale : relancer SANS débogueur

```text
(lldb) quit
./bypassme.bin
# Enter password: SuperSecure
Authenticating...
Flag: picoCTF{d3bugg3r_p0w3r_is_4w3s0m3_30b6c610}
```

## Commandes LLDB utilisées — récap

| Commande | Rôle |
| :--- | :--- |
| `lldb ./binaire` | Lancer LLDB sur un exécutable |
| `image dump symtab binaire` | Lister tous les symboles/fonctions du binaire |
| `disassemble --name FONCTION` | Voir l'assembleur d'une fonction précise |
| `breakpoint set --name FONCTION` | Breakpoint sur l'entrée d'une fonction |
| `breakpoint set --file F --line N` | Breakpoint fiable par fichier/ligne (résiste à l'ASLR) |
| `memory read --format s ADRESSE` | Lire une chaîne de caractères en mémoire |
| `x/s ADRESSE` | Alternative pour lire une chaîne en mémoire |

## ✅ Réflexes à retenir

- `file` / `strings` / `image dump symtab` en tout premier, avant de désassembler quoi que ce soit.
- Le nom des fonctions est un indice énorme : `decode_password` annonçait clairement où chercher.
- Toujours privilégier les breakpoints par fichier/ligne plutôt que par adresse absolue — l'ASLR randomise les adresses à chaque exécution.
- Une fonction jamais atteinte (`hit count = 0`) est une info en soi.
- Le bit SUID donne des droits élevés, mais est désactivé sous débogueur — un binaire qui se comporte différemment sous LLDB que lancé normalement peut être le signe d'un SUID en jeu.

## 🏢 Dans la vraie vie

Le pattern « secret décodé en mémoire au runtime, jamais en clair dans le binaire au repos » est une vraie technique anti-reverse utilisée par certains logiciels (et malwares). Elle retarde l'analyse mais ne l'empêche jamais totalement : un débogueur permet toujours d'observer l'état réel du programme à un instant T. Le bit SUID est un mécanisme Linux légitime, mais aussi une source classique d'escalade de privilèges en pentest (`find / -perm -4000 2>/dev/null` pour lister les binaires SUID d'un système).
