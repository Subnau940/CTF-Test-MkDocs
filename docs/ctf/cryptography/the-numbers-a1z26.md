---
title: "The Numbers (A1Z26)"
---

# 🔑 The Numbers (A1Z26)

**Plateforme :** picoCTF · **Catégorie :** Cryptography · **Difficulté :** *Intro*{: .badge-intro}
{: .ctf-meta}

!!! success "Flag"
    `picoCTF{THENUMBERSMASON}`

## Résumé de la faille

Une image bruitée (parasites visuels anti-OCR) affiche une suite de nombres encadrée d'accolades. Chaque nombre est en fait la position d'une lettre dans l'alphabet (encodage **A1Z26** : A=1, B=2, C=3 ... Z=26).

**Concept :** reconnaître un encodage inconnu à partir des caractéristiques des données (ici, la plage de valeurs 1-26).

## Méthodo — les étapes

1. **Récupérer le texte de l'image** — tentative d'OCR automatique (`tesseract`) : échec, même après nettoyage (`convert` + threshold), à cause du bruit visuel anti-OCR volontaire. Solution retenue : **lecture directe à l'œil**. Pour un petit volume (~20 nombres), c'est plus rapide et fiable que de configurer un OCR.
2. **Observer les nombres extraits** :
   ```text
   16 9 3 15 3 20 6 { 20 8 5 14 21 13 2 5 18 19 13 1 19 15 14 }
   ```
3. **Repérer les bornes (le réflexe clé)** — minimum observé : 1, maximum observé : 21 (jamais > 26). Une suite de nombres qui ne dépasse jamais 26 est un signal fort : l'alphabet a exactement 26 lettres → hypothèse : chaque nombre = position d'une lettre.
4. **Tester l'hypothèse sur un échantillon** — 16→P, 9→I, 3→C → « PIC » → cohérent avec le début attendu « picoCTF ». Hypothèse confirmée dès les 3 premiers nombres.
5. **Décoder l'ensemble (CyberChef)** — retirer les accolades avant de coller les nombres (CyberChef gère mal les caractères `{ }` mélangés aux nombres), chercher l'opération « A1Z26 » et l'appliquer, puis réassembler le flag en replaçant les `{ }`.

## Méthode générale : reconnaître un encodage inconnu

Face à une suite de nombres/caractères mystérieuse :

1. Observer les bornes (min/max) et les caractères utilisés.
2. Émettre une hypothèse à partir de repères connus :

| Plage / caractères observés | Encodage probable |
| :--- | :--- |
| 1 à 26 | Position alphabet (A1Z26) |
| 0 à 127 | ASCII standard |
| 0 à 255 | Octets (ASCII étendu, RGB...) |
| Que des 0 et 1 | Binaire |
| 0-9 et A-F uniquement | Hexadécimal |
| Alphanumérique + `+` `/` `=` | Base64 |

3. Tester l'hypothèse sur un petit échantillon (2-3 premiers éléments).
4. Si ça ne donne rien : essayer l'opération « Magic » de CyberChef (détection automatique).
5. Sinon : rechercher/se documenter — normal de ne pas tout connaître.

## Outils utilisés (et leurs limites ici)

| Outil | Rôle | Résultat sur ce challenge |
| :--- | :--- | :--- |
| `tesseract` | OCR (image → texte) | Échec, même après nettoyage |
| `convert` (ImageMagick) | Nettoyer l'image (threshold, resize) | Image nette visuellement, mais toujours pas d'OCR exploitable |
| Lecture manuelle | Recopier les nombres à l'œil | ✅ La bonne solution ici |
| CyberChef (A1Z26) | Décoder les nombres en lettres | ✅ Donne le flag |

## ✅ Réflexes à retenir

- **Automatiser n'est pas toujours la bonne solution.** Sur un petit volume, la lecture manuelle est souvent plus rapide que de configurer un OCR. Automatiser vaut le coup à partir d'un GROS volume.
- Les bornes d'une suite de nombres sont un indice fort sur l'encodage utilisé (26 → alphabet, 255 → octets, etc.).
- Tester une hypothèse sur un petit échantillon avant de tout décoder — ça valide (ou invalide) vite le raisonnement.
- CyberChef a une opération dédiée pour chaque encodage courant, en plus de « Magic » (détection auto).
