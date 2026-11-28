---
title: MITM — ARP spoofing et DNS spoofing
---

# MITM — ARP spoofing et DNS spoofing

> [!abstract] En bref
> TP de sécurité réseau mené sur une plateforme de lab isolée (machines virtuelles dédiées, aucun équipement ni réseau réel) : empoisonnement ARP entre un poste "admin" et sa passerelle pour se placer en position de Man-in-the-Middle, puis interception HTTP et empoisonnement DNS. L'objectif du TP est autant offensif (comprendre le mécanisme) que défensif (identifier les contre-mesures).

| | |
| :--- | :--- |
| **Contexte** | Bachelor Cybersécurité et Administrateur Réseaux, module Sécurité réseau |
| **Environnement** | Plateforme de lab isolée (machines virtuelles dédiées : admin, routeur, dev), aucun équipement de production |
| **Outils** | `arpspoof`, `dnsspoof` (suite dsniff), `tcpdump`, Wireshark |
| **Date** | Novembre 2026 |

## Objectifs

- Comprendre pourquoi le protocole ARP est intrinsèquement vulnérable à l'usurpation.
- Observer l'effet d'un empoisonnement ARP à sens unique, puis dans les deux sens, sur les tables ARP des machines concernées.
- Constater en pratique ce que l'absence de chiffrement (HTTP) expose une fois en position de MITM.
- Étendre la même position de MITM à un empoisonnement DNS.
- En tirer les contre-mesures réseau applicables (DAI, DHCP Snooping, DNSSEC, TLS).

## Plan d'adressage

Relevé des adresses IP/MAC de chaque machine du LAN de lab via `ip a`. La passerelle par défaut du segment est le routeur de lab, à l'adresse `.1` du sous-réseau.

## ARP spoofing

### Pourquoi l'attaque est possible

Le protocole ARP ne prévoit aucune authentification des réponses : une machine qui a besoin de l'adresse MAC associée à une IP accepte la première réponse reçue et met à jour son cache sans vérifier l'émetteur. Un poste positionné sur le même réseau local peut donc envoyer des réponses ARP forgées associant sa propre adresse MAC à l'IP d'une machine tierce (ici la passerelle). Les victimes mettent alors à jour leur table ARP avec cette fausse correspondance, et leur trafic destiné à la vraie machine transite par l'attaquant.

### Empoisonnement à sens unique

Première étape, empoisonnement dans un seul sens (admin → passerelle) avec `arpspoof`. Vérification via `watch -n1 arp -a` sur les trois machines : la table ARP de l'admin associe désormais l'IP de la passerelle à l'adresse MAC du poste de lab, et non plus à celle du vrai routeur — l'empoisonnement fonctionne.

En parallèle, un `tcpdump` filtré sur HTTP et une requête `curl` vers la passerelle montrent les requêtes GET qui partent bien de l'admin, mais aucune réponse HTTP n'arrive.

**Analyse** : seul le sens admin → passerelle est intercepté. Le routeur, lui, n'a pas été trompé sur l'adresse MAC de l'admin, donc ses réponses repartent directement vers la vraie adresse de l'admin sans repasser par le poste de lab. Un seul des deux sens du trafic est détourné.

### Empoisonnement dans les deux sens

Pour intercepter l'échange complet, il faut tromper la passerelle sur l'adresse MAC de l'admin en plus de l'inverse — une seconde instance d'`arpspoof` en sens opposé. Il faut aussi activer le transfert IP (`ip_forward`) sur le poste de lab pour que le trafic continue d'être relayé dans les deux sens, plutôt que simplement bloqué (ce qui reviendrait à un déni de service).

Une fois les deux sens empoisonnés, la même requête `curl` depuis l'admin apparaît complète dans `tcpdump` : la requête GET et la réponse `HTTP/1.1 200 OK`. Position de MITM totale sur l'échange admin ↔ passerelle.

### Interception d'un formulaire HTTP en clair

Avec le MITM bidirectionnel actif, capture `tcpdump` au format pcap pendant qu'un formulaire de connexion est soumis en HTTP (sans TLS) depuis l'admin. Analyse du pcap dans Wireshark avec le filtre `http.request.method == "POST"` pour isoler la requête de soumission (une simple requête GET ne contient pas les identifiants), puis `Follow → HTTP Stream` pour lire le flux.

**Constat** : les champs du formulaire apparaissent en clair dans le flux intercepté. Le formulaire étant soumis en HTTP simple, sans chiffrement TLS, les identifiants sont lisibles directement dans le flux applicatif dès lors qu'on est en position de MITM.

## DNS spoofing

Une fois le MITM ARP en place, la même position permet d'empoisonner les réponses DNS pour rediriger la victime vers une IP arbitraire, avec `dnsspoof` et un fichier de correspondances falsifiées.

**Constat côté attaquant** : la console `dnsspoof` affiche chaque requête DNS interceptée et falsifiée dès réception, avant même que la vraie réponse n'arrive.

**Constat côté Wireshark** (filtre `dns.qry.name`) : le détournement fonctionne sur la première requête qui suit l'empoisonnement, mais les requêtes suivantes reçoivent la vraie réponse du serveur DNS légitime — la réponse falsifiée doit arriver avant la réponse authentique pour être retenue par le client, ce qui n'est pas garanti à chaque tentative.

## Contre-mesures

Le TP se conclut volontairement sur la défense plutôt que sur l'attaque : la partie intéressante de cet exercice est de savoir **comment un administrateur réseau s'en protège**.

- **Contre l'ARP spoofing** : activer *Dynamic ARP Inspection* (DAI) sur les switches, couplé au *DHCP Snooping* — chaque réponse ARP est validée par rapport à une table de correspondances IP/MAC/port connue, et une réponse forgée est rejetée avant d'atteindre les victimes. Pour les hôtes critiques (passerelle, serveurs), des entrées ARP statiques renforcent le dispositif. Segmenter le réseau en VLAN limite aussi la portée d'un empoisonnement à un seul segment.
- **Contre le DNS spoofing** : déployer DNSSEC pour signer et authentifier les réponses DNS, et forcer l'usage de résolveurs internes de confiance, éventuellement chiffrés (DoH/DoT).
- **Défense en profondeur** : passer tout service web en HTTPS avec un certificat valide. Cela n'empêche pas l'attaque ARP/DNS elle-même — l'attaquant reste en position de MITM — mais cela neutralise l'exploitation la plus dangereuse observée dans ce TP : la lecture en clair des identifiants, puisque TLS chiffre le contenu de bout en bout et que le navigateur signale toute substitution de certificat.

## Ce que j'en retiens

- ARP et DNS (en l'absence de DNSSEC) partagent la même faiblesse de fond : aucune authentification de la source d'une réponse. Toute la défense consiste à réintroduire cette authentification à un niveau ou un autre (DAI, entrées statiques, DNSSEC, TLS).
- Un empoisonnement à sens unique est détectable par son propre symptôme : des requêtes qui partent sans jamais recevoir de réponse.
- Le chiffrement (TLS) ne supprime pas la position de MITM, il la rend simplement inutile pour l'attaquant : la vraie contre-mesure côté réseau reste DAI/DHCP Snooping, TLS n'est qu'un filet de sécurité côté applicatif.
