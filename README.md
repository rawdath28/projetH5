# 🧠 UMi — Suivi thérapeutique inter-séances

Application mobile de suivi psychologique développée dans le cadre du projet de fin d'étude du programme Grande École (PGE) de HETIC (promotion Mars 2026).

---

## Le problème

En France, **28 000 psychologues libéraux** exercent sans outil numérique dédié à la continuité thérapeutique. Entre deux séances, le patient est livré à lui-même : aucun suivi, aucun exercice guidé, aucune détection des signaux d'alerte. Le thérapeute, lui, reprend chaque consultation à froid : notes dispersées, contexte à reconstruire, évolution inter-séances invisible.

**Résultat :** environ 25 % des patients abandonnent la thérapie, avec en moyenne 2,4 séances pour ceux qui abandonnent contre 7,4 pour ceux qui la complètent.

**Problématique centrale :** *Comment soutenir les personnes en suivi thérapeutique dans leur travail inter-séances afin d'augmenter l'adhésion thérapeutique ?*

---

## La solution

UMi est une solution **B2B2C de suivi psychologique inter-séances**, structurée autour d'une double interface :

- **App mobile patient** : journaling guidé par IA, exercices TCC validés cliniquement, détection de signaux d'alerte
- **SaaS thérapeute** (web) : gestion de patientèle, alertes critiques, suivi d'engagement inter-séances

Le psy invite → le patient utilise → le psy perçoit la valeur. UMi est un prolongement de la thérapie, jamais un substitut.

---

## Données clés

- Une application avec IA générative **augmente la proportion de patients en amélioration fiable de 48 % à 69 %** par rapport aux supports statiques
- Elle **réduit le taux d'abandon** de thérapie de groupe de 46 % à 23 %
- Elle **diminue les séances manquées** de 33 % à 18 %

Sources : [PMC11933774](https://pmc.ncbi.nlm.nih.gov/articles/PMC11933774/) · [PMC2939342](https://pmc.ncbi.nlm.nih.gov/articles/PMC2939342/) · [PMC10207790](https://pmc.ncbi.nlm.nih.gov/articles/PMC10207790/)

---

## Fonctionnalités

### App mobile patient (cœur de valeur)

#### Check-in émotionnel
Notification bi-quotidienne (matin & soir) pour lancer un parcours complet. Point d'entrée systématique à chaque ouverture de l'app.

#### Mood Tracker
Basé sur une matrice énergie × valence (inspiré de *How We Feel*). Sélection en moins d'une minute — l'habitude quotidienne qui ancre l'usage.

#### Journaling augmenté
En fonction de l'émotion sélectionnée, l'app propose 1 à 2 questions contextuelles qui guident l'écriture naturellement. L'IA (Qwen 2.5, hébergée sur serveur certifié **HDS**) analyse les réponses pour détecter des marqueurs cliniques comme les distorsions cognitives.

#### Exercices TCC
Sur la base du mood et de l'analyse du journal, l'app propose un exercice de Thérapie Cognitivo-Comportementale ciblé et validé cliniquement. Un seul exercice pertinent plutôt qu'une bibliothèque générique.

#### Sécurité & urgences
Détection automatique de mots-clés critiques (mutilation, suicide) avec redirection immédiate vers des numéros d'urgence (SOS Suicide). Obligatoire légalement. Le patient garde le contrôle total sur ce qu'il partage avec son thérapeute.

#### Suivi de progression
Historique des entrées, exercices réalisés, évolution émotionnelle dans le temps.

---

### SaaS thérapeute (interface MVP)

L'interface psy est volontairement minimale au lancement, centrée sur la preuve de valeur du cycle complet.

#### Gestion de patientèle
Invitation des patients par lien/code. Suivi de statut : actif/inactif, fréquence d'écriture, exercices réalisés.

#### Alertes critiques
Notification immédiate en cas de signaux d'urgence détectés côté patient.

#### Profil vérifié
Authentification par numéro **ADELI/RPPS** — l'identifiant national des professionnels de santé en France, qui garantit que seuls des praticiens accèdent à la plateforme.

---

## Stack technique

### Frontend

- **React Native** — framework mobile cross-platform
- **Expo** — environnement de développement, test et déploiement
- **Expo Router** — routing basé sur les fichiers
- **TypeScript** — typage statique pour la fiabilité du code

### Backend & IA

- **Qwen 2.5** — modèle open source pour l'analyse du journaling et la détection de marqueurs cliniques
- **Hébergement HDS certifié** (OVH) — obligation légale pour tout hébergement de données de santé (art. L.1111-8 CSP)
- **API REST** — communication entre l'app mobile et le SaaS thérapeute

### Outils

- **Node.js / npm** — gestion des dépendances
- **Figma** — conception UX/UI et prototypage

---

## Getting Started

### 1. Installer les dépendances

```bash
npm install
```

### 2. Lancer l'application

```bash
npx expo start
```

### 3. Reset du projet

Si vous souhaitez repartir d'une base vierge :

```bash
npm run reset-project
```

Cela déplacera le code d'exemple dans `/app-example` et créera un nouveau dossier `/app`.

Vous pourrez ensuite ouvrir l'application dans :

- un Android emulator
- un iOS simulator
- Expo Go
- un development build

### Structure du projet

Le développement se fait principalement dans le dossier `/app`. Ce projet utilise un système de routing basé sur les fichiers avec Expo Router.

---

## Équipe

Projet réalisé dans le cadre du projet de fin d'étude à HETIC.

| Membre | Rôle |
|---|---|
| **Alexandre Andurand** | Business & Stratégie |
| **Alexis Baud** | Design |
| **Rawdath Laabudo Demba Diallo** | Développement et Architecture |
