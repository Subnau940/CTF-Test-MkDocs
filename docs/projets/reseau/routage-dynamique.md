---
title: Routage dynamique RIP et OSPF
---

# Routage dynamique : RIP, OSPF et redistribution

> [!abstract] En bref
> Deux domaines de routage, l'un en RIP et l'autre en OSPF, d'abord reliés par des routes statiques par défaut, puis interconnectés proprement par redistribution sur un routeur frontière. Le résultat : chaque domaine apprend automatiquement les réseaux de l'autre, et le chemin est vérifié de bout en bout.

| | |
| :--- | :--- |
| **Contexte** | Bachelor Cybersécurité et Administrateur Réseaux, module Réseau avancé |
| **Outil** | Cisco Packet Tracer |
| **Date** | Octobre 2026 |

## Objectifs

- Monter un domaine RIP et un domaine OSPF, et valider la connectivité dans chacun.
- Observer le choix de chemin d'OSPF et sa réaction à un changement de coût ou à une coupure de lien.
- Interconnecter les deux domaines, d'abord avec des routes par défaut, puis par redistribution.

## 1. Deux protocoles, deux logiques

| | RIP | OSPF |
| :--- | :--- | :--- |
| Famille | *Distance vector* | *Link state* |
| Métrique | Nombre de sauts (maximum 15) | Coût, dérivé de la bande passante de l'interface |
| Algorithme | Bellman-Ford | Dijkstra (plus court chemin) |
| Vue du réseau | Uniquement ce que disent les voisins | Carte complète de la zone |

Dans le domaine OSPF, la modification du coût d'un lien change le chemin emprunté, et la suppression d'un lien entre deux routeurs est contournée automatiquement : le `tracert` montre le nouveau chemin sans aucune intervention.

## 2. Interconnexion par routes par défaut : la limite

Dans un premier temps, R3 (domaine RIP) et R8 (frontière avec OSPF) sont reliés par des routes statiques par défaut. PC0 joint alors PC3, mais tout ce que R3 ne connaît pas part vers R8.

> [!question] Pourquoi le trafic vers les réseaux internes ne suit-il pas toujours la route par défaut ?
> Une route par défaut ne s'applique qu'à ce que le routeur ne connaît pas. Les réseaux internes de son propre domaine sont connus précisément et l'emportent toujours (correspondance la plus longue). Par ailleurs, R3 ne sait rien du domaine opposé : il ne peut que tout envoyer vers R8, sans choisir de meilleur chemin.

## 3. Redistribution entre RIP et OSPF

Les routes statiques sont supprimées et R8 devient traducteur entre les deux protocoles. Comme les métriques ne sont pas comparables (des sauts d'un côté, un coût de l'autre), il faut fixer la métrique des routes OSPF injectées dans RIP.

```text
R8(config)# router ospf 1
R8(config-router)# redistribute rip subnets
R8(config)# router rip
R8(config-router)# redistribute ospf 1 metric 2
```

- `subnets` est indispensable côté OSPF pour redistribuer aussi les sous-réseaux, et pas seulement les réseaux de classe.
- Côté RIP, `metric 2` donne un nombre de sauts aux routes venues d'OSPF.

## 4. Vérifications

- R10, dans le domaine OSPF, apprend les réseaux RIP sous forme de routes externes `O E2`.
- R3, dans le domaine RIP, apprend les réseaux OSPF sous forme de routes `R`.
- Le `tracert` de PC0 vers PC3 traverse **R1 → R2 → R3 → R8 → R9 → R10 → PC3**, et PC1 joint aussi PC3.

## Comparaison des trois états

| État | PC0 → PC3 | Ce que voit R3 |
| :--- | :---: | :--- |
| Sans interconnexion | KO | Aucune route vers l'autre domaine |
| Routes statiques par défaut | OK | Une ligne `S*` vers R8, rien de précis |
| Redistribution | OK | Chaque réseau de l'autre domaine, mis à jour automatiquement |

## Ce que j'en retiens

- Une route par défaut garde des tables petites, mais le routeur ne connaît pas le réseau d'en face et ne peut pas optimiser son chemin.
- La redistribution donne des préfixes précis, à jour automatiquement, sans route statique à maintenir.
- Le routeur frontière est un point critique : une erreur de redistribution peut injecter de mauvaises routes dans tout un domaine.
