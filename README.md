# # 🚀 My React Native App

Application de suivi TCC entre les séances, permettant au patient de pratiquer des exercices, suivre son humeur et visualiser ses progrès.
## 📦 Stack technique
- Framework : React Native (Expo / React Native CLI)
- Langage : JavaScript
- Navigation : React Navigation
- Backend : SQLite

## ⚙️ Installation
- git clone https://github.com/rawdath28/projetH5.git
- cd projetH5
- npm install

# 🚀 Démarrage rapide
## 1. Prérequis
- Node.js (version recommandée : 18+)
- npm, yarn
- Expo CLI: npm install -g expo-cli
- Application Expo Go sur smartphone ou émulateur Android/iOS configuré

## 2. Installation
- git clone https://github.com/<organisation>/<nom-du-repo>.git
- cd projetH5
- npm install ou yarn install

## 3. Lancer l’app en développement
Avec Expo : 
- npm start ou yarn start
- Scanner le QR code avec l’app Expo Go (sur iOS / Android) Ou appuyer sur a pour lancer l’émulateur Android, i pour iOS

Avec React Native CLI (sans Expo) :
- iOS
  - npx react-native run-ios
- Android
  - npx react-native run-android

## 📂 Structure du projet
- ├── src
- │   ├── components      # Composants UI réutilisables
- │   ├── screens         # Écrans (Home, Exercises, Séances, Progrès.)
- │   ├── navigation      # Stack/Tab navigators
- │   ├── hooks           # Hooks custom
- │   ├── context         # Contexte global (auth, thème, data)
- │   ├── services        # Appels API, clients HTTP
- │   ├── theme           # Design system léger (couleurs, typos)
- │   └── utils           # Fonctions utilitaires
- ├── assets              # Images, icônes, fonts
- ├── app.json / expo.json
- └── README.md

## 🧭 Navigation
L’app utilise React Navigation avec par exemple :
## Tab Navigator :
- Home (suivi/progrès)
- Exercises
- Séances
- Progrès
## Stack Navigator :
- Auth (Login / Register)
- App (tabs principales)

## 🔐 Authentification (si présente)
Écran Login avec :
- Email
- Mot de passe
Une fois connecté : Redirection vers Home

## 🌱 Roadmap (exemple)
- Authentification basique (login / logout)
- Écran Home (suivi rapide du patient)
- Écran Exercises (liste + détail + lancement)
- Écran Séances (mood tracker)
- Écran Progrès
- Intégration backend pour sauvegarder les données
- Design system léger (couleurs, composants réutilisables)

## 👥 Contribution
Créer une branche :
- git checkout -b feature/nom-de-la-feature
Développer, commiter :
- git commit -m "feat: ajoute écran exercices"
Pousser et ouvrir une Pull Request.
