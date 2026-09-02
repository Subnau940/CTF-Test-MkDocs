---
title: Contribuer
---

# ✍️ Ajouter un writeup

Le but de ce site est d'être **modifiable en quelques minutes** : pas de PDF à recomposer, pas d'export manuel. Un writeup = un fichier Markdown.

## 1. Créer le fichier

Dans le dossier de la catégorie concernée (`docs/cryptography/`, `docs/forensic/`, `docs/general-skills/`, `docs/reverse-engineering/`, `docs/web-exploitation/`), crée un fichier `mon-challenge.md` (nom en minuscules, tirets, sans accents).

## 2. Copier ce squelette

````markdown
---
title: "Nom du challenge"
---

# 🔑 Nom du challenge

**Plateforme :** picoCTF · **Catégorie :** Cryptography · **Difficulté :** Easy

!!! success "Flag"
    `picoCTF{...}`

## Résumé de la faille

Une ou deux phrases : c'est quoi la vulnérabilité, en clair.

## Le concept

Explique le *pourquoi* de la faille — le mécanisme général, pas juste ce challenge précis.

## Méthodo — les étapes

1. Première étape
2. Deuxième étape

```bash
commande-utilisée --avec des options
```

## Outils utilisés

| Outil | Rôle |
| :--- | :--- |
| CyberChef | ... |

## ✅ Réflexes à retenir

- Point clé n°1
- Point clé n°2

## 🏢 Dans la vraie vie

Comment cette faille se manifeste en dehors d'un CTF, et comment s'en protéger.
````

## 3. Ajouter la page à la navigation

Ouvre `mkdocs.yml` à la racine du repo, et ajoute une ligne dans la section `nav:` sous la bonne catégorie :

```yaml
  - Cryptography:
      - cryptography/index.md
      - Mon challenge: cryptography/mon-challenge.md   # <- nouvelle ligne
```

## 4. Prévisualiser en local (optionnel mais conseillé)

```bash
pip install -r requirements.txt
mkdocs serve
```

Le site est servi sur `http://127.0.0.1:8000` avec rechargement automatique à chaque sauvegarde. (La génération PDF est désactivée par défaut en local pour aller plus vite — elle ne tourne qu'en CI, via la variable `ENABLE_PDF_EXPORT`.)

## 5. Push

```bash
git add docs/ mkdocs.yml
git commit -m "Ajoute le writeup <nom du challenge>"
git push
```

Le site (et le PDF téléchargeable) se régénèrent automatiquement sur GitHub Pages en 1 à 2 minutes.

## Blocs utiles (admonitions Material)

```markdown
!!! success "Flag"
    `picoCTF{...}`

!!! warning "Piège rencontré"
    Détail du piège.

!!! tip "Astuce"
    Un raccourci ou une astuce.

!!! danger "Faille critique"
    Pour insister sur la gravité d'une vulnérabilité.
```
