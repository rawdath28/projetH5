# Données de Démonstration

Ce fichier explique comment utiliser les données de démonstration pour votre présentation.

## Fichier de données

Le fichier `demo-data.json` contient 15 entrées de mood réparties sur 3 jours (10, 11 et 12 janvier 2026) avec des heures et des textes variés pour créer un scénario réaliste.

## Comment charger les données

1. **Ouvrez l'application**
2. **Allez dans l'onglet "Profile"** (icône de profil en bas)
3. **Faites défiler jusqu'à la section "Actions rapides"**
4. **Trouvez le bouton "Charger données de démo"** (il est légèrement transparent pour être discret)
5. **Appuyez sur ce bouton**
6. **Une alerte confirmera le chargement** (15 entrées chargées)
7. **Retournez à l'écran d'accueil** pour voir les données

## Structure des données

Chaque entrée contient :
- `id` : Identifiant unique
- `mood` : Objet avec `id`, `label` et `color` du mood
- `text` : Texte optionnel associé au mood
- `time` : Heure au format HH:MM
- `date` : Date au format ISO (pour le tri)

## Personnaliser les données

Vous pouvez modifier le fichier `demo-data.json` pour :
- Changer les dates
- Modifier les heures
- Changer les moods (utilisez les IDs de `constants/moods.ts`)
- Modifier les textes associés

**Important** : Après modification, vous devrez peut-être redémarrer l'application pour que les changements soient pris en compte.

## Supprimer les données de démonstration

Pour supprimer les données de démonstration :
1. Allez à l'écran d'accueil
2. Appuyez sur le bouton "Effacer l'historique du jour"
3. Répétez pour chaque jour si nécessaire

Ou utilisez la fonction de développement pour vider complètement AsyncStorage.
