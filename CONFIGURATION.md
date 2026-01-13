# Configuration de l'API Mistral

Pour utiliser l'analyse de texte avec Mistral API, vous devez configurer votre clé API.

## Étapes de configuration

1. **Obtenir une clé API Mistral**
   - Rendez-vous sur https://console.mistral.ai/
   - Créez un compte ou connectez-vous
   - Générez une clé API

2. **Configurer la clé API dans le projet**

   Pour Expo, vous avez deux options :

   **Option 1 : Variables d'environnement (recommandé)**
   
   Créez un fichier `.env` à la racine du projet avec :
   ```
   EXPO_PUBLIC_MISTRAL_API_KEY=2haQR5kEQFrjxvwVDuCuK4fgTK5TVKBb
   ```
   
   **Option 2 : Fichier de configuration**
   
   Modifiez directement `lib/config.ts` et remplacez la fonction `getMistralApiKey()` pour retourner votre clé :
   ```typescript
   export const getMistralApiKey = (): string | undefined => {
     return '2haQR5kEQFrjxvwVDuCuK4fgTK5TVKBb';
   };
   ```

3. **Redémarrer le serveur Expo**
   
   Après avoir ajouté la clé API, redémarrez votre serveur de développement :
   ```bash
   npm start
   ```

## Fonctionnalités

L'application analyse automatiquement le texte entré par l'utilisateur et détecte :

- **Auto-dépréciation** : Phrases comme "je suis nul", "je suis une merde", "personne ne m'aime"
  - Affiche un exercice de reformulation
  
- **Pensées suicidaires** : Phrases comme "je vais en finir", "je préférerais être mort"
  - Affiche une alerte avec option d'appel au numéro d'aide (3114)

## Note de sécurité

⚠️ **Important** : Ne commitez jamais votre clé API dans le dépôt Git. Le fichier `.env` est déjà ignoré par `.gitignore`.
