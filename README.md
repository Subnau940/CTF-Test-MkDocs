# 🚩 CTF Writeups

Base de connaissances de mes résolutions de challenges CTF (picoCTF principalement), construite avec [MkDocs](https://www.mkdocs.org/) + [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/), hébergée sur GitHub Pages.

**Le site est vivant et modifiable en quelques minutes** : chaque writeup est un simple fichier Markdown, versionné avec le reste du dépôt. Fini le PDF statique refait à la main dès qu'un outil ou une méthodo évolue.

## 📖 Le site

➡️ **[Voir le site en ligne](https://subnau940.github.io/CTF-Test-MkDocs/)** *(activer GitHub Pages sur ce repo — voir plus bas)*

Le site propose aussi un **téléchargement PDF de l'ensemble du site**, régénéré automatiquement à chaque déploiement (donc toujours synchronisé avec la dernière version des writeups) — bouton en haut de la page d'accueil.

## 📂 Structure

```text
docs/                       ← contenu du site (source de vérité)
├── index.md                ← page d'accueil
├── contributing.md         ← guide pour ajouter un writeup
├── cryptography/
├── forensic/
├── general-skills/
├── reverse-engineering/
└── web-exploitation/
mkdocs.yml                  ← configuration du site (thème, plugins, navigation)
requirements.txt            ← dépendances Python (mkdocs, thème, plugin PDF)
.github/workflows/deploy.yml← build + déploiement automatique sur GitHub Pages
```

Les catégories reprennent la même organisation que l'ancien classement par dossiers (Cryptography, Forensic, General skills, Reverse Engineering, Web exploitation) : 23 writeups au total.

## 🚀 Développer en local

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

mkdocs serve
```

Le site est servi sur `http://127.0.0.1:8000` avec rechargement automatique à chaque sauvegarde. La génération PDF est désactivée par défaut en local (trop lente pour de l'itération rapide) — elle ne tourne qu'en CI via la variable d'environnement `ENABLE_PDF_EXPORT=1`. Pour la tester en local :

```bash
ENABLE_PDF_EXPORT=1 mkdocs build
```

## ✍️ Ajouter un writeup

Voir le guide détaillé : [docs/contributing.md](docs/contributing.md) (aussi disponible sur le site, page « Contribuer »).

En résumé : créer un fichier `.md` dans le bon dossier de catégorie à partir du squelette fourni, l'ajouter à la section `nav:` de `mkdocs.yml`, puis `git push` — le site (et le PDF) se reconstruisent automatiquement.

## ⚙️ Activer l'hébergement (GitHub Pages)

1. Sur GitHub : **Settings → Pages → Build and deployment → Source : GitHub Actions**.
2. Pousser sur `main` déclenche `.github/workflows/deploy.yml`, qui build le site avec MkDocs (PDF inclus) et le déploie.
3. L'URL du site apparaît ensuite dans **Settings → Pages** (généralement `https://subnau940.github.io/CTF-Test-MkDocs/`).

## 🧩 Pile technique

- [MkDocs](https://www.mkdocs.org/) — générateur de site statique à partir de Markdown
- [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) — thème (recherche, mode sombre, navigation, coloration syntaxique)
- [mkdocs-with-pdf](https://github.com/orzih/mkdocs-with-pdf) — export du site entier en un PDF téléchargeable, régénéré à chaque build
- GitHub Actions + GitHub Pages — build et hébergement automatiques
