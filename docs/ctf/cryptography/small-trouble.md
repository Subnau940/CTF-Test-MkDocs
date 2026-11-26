---
title: "Small Trouble"
---

# 🔑 Small Trouble (Boneh-Durfee, d trop petit)

**Plateforme :** picoCTF · **Catégorie :** Cryptography · **Difficulté :** *Medium*{: .badge-medium}
{: .ctf-meta}

!!! success "Flag"
    `picoCTF{sm4ll_d_57ff60e1}`

## Résumé de la faille

Un service RSA génère la clé d'une façon inversée par rapport à la normale : au lieu de choisir `e` (petit, fixe) puis calculer `d`, le script choisit `d` en premier, et **petit** (256 bits, alors que `N` fait ~2096 bits), puis calcule `e` à partir de `d` :

```python
d = getPrime(256)
e = inverse(d, phi)
```

Un `d` aussi petit par rapport à `N` rend RSA cassable via l'**attaque de Boneh-Durfee** (1999), qui permet de retrouver `d` à partir de `(N, e)` seuls, dès que `d < N^0.292` environ.

## Pourquoi c'est cassable : Boneh-Durfee en une phrase

RSA repose sur la difficulté de factoriser `N`. Boneh-Durfee ne factorise pas `N` directement — elle exploite une relation mathématique entre `e`, `d` et `N` (via `e·d ≡ 1 mod φ(N)`) grâce à une technique de **réduction de réseau** (lattice reduction, LLL). Si `d` est petit, cette relation devient « résolvable » par cette technique, ce qui casse tout RSA construit ainsi, quelle que soit la taille de `N`.

## Méthodo — les étapes

1. **Lire le hint** : « This might be a job for Boneh-Durfee » → attaque nommée explicitement.
2. **Confirmer la faille** en lisant le script fourni : `d = getPrime(256)` avant `e = inverse(d, phi)` → génération inversée, `d` anormalement petit → signature classique d'un challenge Boneh-Durfee.
3. **Chercher un outil pour exécuter l'attaque** (pas la recoder à la main — Boneh-Durfee est mathématiquement complexe : réseaux, polynômes multivariés, LLL).
4. **Tentative RsaCtfTool** — installée avec succès, mais échoue : `Can't load boneh_durfee because sage binary is not installed`. RsaCtfTool délègue cette attaque à un binaire SageMath externe.
5. **Tentative d'installation de SageMath en local** — échec (paquet cassé / conflit de version Python sur Kali).
6. **Solution retenue : SageMath en ligne, sans rien installer localement** — [CoCalc](https://cocalc.com) : environnement Sage complet dans le navigateur, gratuit. Récupérer le script de référence [`mimoo/RSA-and-LLL-attacks`](https://github.com/mimoo/RSA-and-LLL-attacks/blob/master/boneh_durfee.sage), créer un fichier `.sage`, remplacer les valeurs d'exemple par les vraies valeurs du challenge, puis :
   ```bash
   sage solve.sage
   ```
   → résultat en ~2 secondes : `private key found: 6993006695...716709`
7. **Déchiffrement final** — une fois `d` récupéré, le déchiffrement RSA est trivial (`m = c^d mod n`), pas besoin de rester dans Sage :
   ```python
   from Crypto.Util.number import long_to_bytes
   m = pow(c, d, n)
   print(long_to_bytes(m))
   # → picoCTF{sm4ll_d_57ff60e1}
   ```

## Outils utilisés / tentés

| Outil | Résultat |
| :--- | :--- |
| RsaCtfTool | Installé, mais dépend de Sage en interne pour cette attaque précise |
| `apt install sagemath` | Échec (paquet cassé / conflit Python sur Kali) |
| CoCalc (cocalc.com) | ✅ Sage fonctionnel en ligne, script exécuté avec succès |
| Script `mimoo/RSA-and-LLL-attacks` | ✅ Implémentation Boneh-Durfee de référence en CTF |
| Python + pycryptodome | ✅ Déchiffrement final une fois `d` connu |

## ✅ Réflexes à retenir

- `d` anormalement petit face à `N` = vulnérabilité Boneh-Durfee (ou Wiener pour des cas encore plus extrêmes, `d < N^0.25`).
- Les attaques crypto avancées (Boneh-Durfee, Coppersmith...) ont presque toujours une implémentation de référence déjà écrite (souvent en SageMath) — chercher plutôt que recoder à la main.
- Quand un outil système (apt) est cassé ou en conflit de versions, chercher une alternative en ligne (CoCalc, SageMathCell) plutôt que de s'acharner sur l'installation locale.
- Ne pas tout faire dans le même environnement par principe : Sage pour la partie mathématique complexe (LLL), Python pur pour le déchiffrement final simple.

## 🏢 Dans la vraie vie

Boneh-Durfee (1999) et Wiener (1990, son prédécesseur) sont des attaques historiques et bien documentées qui ont poussé les standards RSA à imposer des tailles minimales pour `d` (généralement, `d` doit être du même ordre de grandeur que `N`, jamais volontairement réduit pour « optimiser les performances »).
