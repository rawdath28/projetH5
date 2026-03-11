# 🧠 Mental Health Companion App

Application mobile développée dans le cadre du projet de fin d’étude du programme Grande École (PGE) de HETIC.

Notre projet s’intéresse à un enjeu majeur : la dégradation de la santé mentale chez les jeunes, qui apparaît de plus en plus tôt et avec des troubles parfois plus sévères.

---

# 🎯 Problématique

**Comment soutenir les personnes en suivi thérapeutique dans leur travail inter-séances afin d’augmenter l’adhésion thérapeutique ?**

Les séances avec un psychologue ne représentent souvent qu’une petite partie du travail thérapeutique.  
Entre ces séances, les patients peuvent avoir des difficultés à :

- suivre les exercices recommandés
- comprendre leurs émotions
- identifier des schémas cognitifs négatifs
- maintenir une continuité dans leur suivi

Notre objectif est donc de **renforcer l’accompagnement entre les séances**.

---

# 💡 Notre solution

Nous développons **une application mobile de suivi thérapeutique** centrée autour d’un **journaling intelligent assisté par IA**.

L’application permet aux patients de mieux comprendre leurs émotions, de suivre leur progression et d’effectuer des exercices recommandés par leur thérapeute.

---

# ✨ Fonctionnalités principales

## 📓 Journaling intelligent

Un espace d’écriture où l’utilisateur peut exprimer ses pensées et ses émotions.

Grâce à l’IA, l’application peut :

- analyser le contenu des entrées
- détecter certains **marqueurs psychologiques**
- proposer des **exercices adaptés**

Exemples :

- détection de **distorsions cognitives**
- suggestion d’exercices thérapeutiques

Dans des cas plus sensibles (ex : idées suicidaires ou auto-mutilation), l’application peut orienter l’utilisateur vers des **ressources d’aide d’urgence**.

---

## 😊 Mood Tracker

Un système de suivi de l’humeur basé sur une matrice :

- **High / Low energy**
- **Positive / Negative emotions**

Inspiré de l’application *How We Feel*, il permet de :

- visualiser son état émotionnel
- identifier des tendances
- suivre l’évolution dans le temps

---

## 📊 Suivi de progression

Chaque utilisateur possède un profil lui permettant de :

- consulter son historique
- revoir les exercices réalisés
- suivre son évolution émotionnelle
- visualiser ses progrès

---

## 👩‍⚕️ Dashboard pour les thérapeutes

Dans le cas d’une utilisation avec un psychologue, un **dashboard dédié** pourrait permettre aux professionnels de :

- suivre leurs patients
- voir les exercices réalisés
- identifier des **marqueurs importants**
- obtenir des **insights clés** entre les séances

L’objectif est de faciliter le **suivi thérapeutique** et améliorer l’accompagnement.

---

# 🛠️ Tech Stack

## 📱 Frontend

- **React Native** : framework utilisé pour développer l'application mobile.
- **Expo** : environnement qui facilite le développement, le test et le déploiement de l’application.
- **Expo Router** : gestion de la navigation avec un système de routing basé sur les fichiers.
- **TypeScript** : utilisé pour améliorer la fiabilité du code et éviter certaines erreurs.

## 🖥️ Backend

- **API & services IA** : utilisés pour analyser les entrées de journaling, détecter certains marqueurs émotionnels et proposer des exercices adaptés.

## 🔧 Autres outils

- **Node.js / npm** : gestion des dépendances et exécution des scripts du projet.
- **Figma** : conception UX/UI et prototypage de l’application.

---

# 🚀 Getting Started

## 1. Installer les dépendances

```bash
npm install
```

## 2. Lancer l’application

```bash
npx expo start
```

### 3. Reset du projet

Si vous souhaitez repartir d’une base vierge :

```bash
npm run reset-project
```

Cela déplacera le code d’exemple dans :

```bash
/app-example
```

et créera un nouveau dossier :

```bash
/app
```

Vous pourrez ensuite ouvrir l’application dans :

- un Android emulator
- un iOS simulator
- Expo Go
- un development build

#### 4. Structure du projet

Le développement se fait principalement dans le dossier :

```bash
/app
```

# 👥 Auteurs

Projet réalisé dans le cadre du projet de fin d’étude à HETIC.

- **Rawdath Laabudo Demba Diallo**
- **Alexis Baud**
- **Alexandre Andurand**

Ce projet utilise un système de routing basé sur les fichiers avec Expo Router.
