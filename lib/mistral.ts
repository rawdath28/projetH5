/**
 * Fonction pour analyser le texte avec Mistral API
 * Détecte l'auto-dépréciation et les pensées suicidaires
 */

import { getMistralApiKey } from './config';

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

export type AnalysisResult = {
  type: 'self_deprecation' | 'suicidal_thoughts' | 'none';
  confidence: number;
  responseText?: string; // Réponse textuelle complète de Mistral
};

export async function analyzeTextWithMistral(text: string): Promise<AnalysisResult> {
  // Récupérer la clé API depuis la configuration
  const apiKey = getMistralApiKey();

  // Ne jamais logguer la clé (même masquée) : les logs peuvent être collectés/partagés.
  if (!apiKey) {
    console.error('EXPO_PUBLIC_MISTRAL_API_KEY non trouvée (env/extra).');
    // Fallback: analyse basique avec mots-clés
    return analyzeTextBasic(text);
  }

  try {
    const prompt = `
Rôle : Tu es un assistant psychologique expert en analyse de pensée.
Tâche : Analyse le texte suivant et détermine s'il contient :
- de l'auto-dépréciation (se dévaloriser soi-même)
- des pensées suicidaires (envies de mourir, en finir, se faire du mal)
- ou aucun de ces deux troubles.

Format de réponse attendu :
Réponds UNIQUEMENT au format JSON strict avec deux champs :
{
  "type": "self_deprecation" | "suicidal_thoughts" | "none",
  "explication": "2 à 3 phrases qui expliquent le trouble détecté ET résument l'exercice proposé pour y répondre"
}

- "type" doit être strictement l'une des valeurs suivantes :
  - "self_deprecation" si tu détectes une auto-dépréciation
  - "suicidal_thoughts" si tu détectes des pensées suicidaires
  - "none" si tu ne détectes pas de trouble significatif.
- "explication" doit être une description courte et concrète qui :
  - explique pourquoi tu as choisi ce type de trouble à partir du texte
  - décrit en 1 à 2 phrases l'objectif de l'exercice TCC associé (par ex. reformuler la pensée, prendre du recul, chercher des preuves, etc.).
- Ne rajoute AUCUN texte avant ou après le JSON (pas de phrase, pas de markdown).

Texte de l'utilisateur :
"""${text}"""
`;

    const requestBody = {
      model: 'mistral-small', // Modèle Mistral (peut aussi être 'mistral-tiny', 'mistral-medium', 'mistral-large-latest')
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0,
      max_tokens: 300, // Augmenté pour permettre une réponse plus détaillée avec le message bienveillant
    };

    console.log('Envoi requête à Mistral API...');

    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`, // S'assurer qu'il n'y a pas d'espaces
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API Mistral:', response.status, response.statusText);
      console.error('Détails erreur:', errorText);

      // Si c'est une erreur 401, la clé API est probablement invalide
      if (response.status === 401) {
        console.error('Erreur 401: Clé API invalide ou expirée. Vérifiez votre clé API Mistral.');
      }
      if (response.status === 429) {
        console.log("Trop de requêtes, réessaie plus tard");
      }

      return analyzeTextBasic(text);
    }

    const data = await response.json();
    let rawContent = data.choices[0].message.content as string;

    // Parfois le modèle renvoie le JSON entouré de ``` ou ```json ... ```
    // → on nettoie pour garder uniquement le bloc JSON.
    let cleaned = rawContent.trim();
    if (cleaned.startsWith('```')) {
      // Supprimer le premier fence ``` ou ```json
      cleaned = cleaned.replace(/^```[a-zA-Z]*\s*/, '');
      // Supprimer le dernier fence ```
      cleaned = cleaned.replace(/```$/, '').trim();
    }

    // Exemple de réponse attendue de Mistral :
    // {
    //   "type": "self_deprecation" | "suicidal_thoughts" | "none",
    //   "explication": "L'utilisateur se dévalorise en disant 'il me déteste'. L'exercice proposé..."
    // }
    const parsed = JSON.parse(cleaned) as {
      type: 'self_deprecation' | 'suicidal_thoughts' | 'none';
      explication: string;
    };

    const type = parsed.type;
    const confidence = type === 'none' ? 0.5 : 0.9;

    // Mapper la réponse de l'IA vers la structure utilisée dans l'app
    return {
      type,
      confidence,
      responseText: parsed.explication, // L'explication de l'IA sera affichée dans le bottom sheet ou l'écran d'urgence
    };
  } catch (error) {
    console.error('Erreur lors de l\'analyse Mistral:', error);
    return analyzeTextBasic(text);
  }
}

/**
 * Analyse basique avec mots-clés (fallback si API indisponible)
 */
function analyzeTextBasic(text: string): AnalysisResult {
  const lowerText = text.toLowerCase();

  // Mots-clés pour pensées suicidaires (priorité haute)
  const suicidalKeywords = [
    'en finir',
    'préférerais être mort',
    'préférerai être mort',
    'préférerait être mort',
    'veux mourir',
    'veut mourir',
    'vais me tuer',
    'va me tuer',
    'suicide',
    'me suicider',
    'se suicider',
    'mourir',
    'mort',
    'finir ma vie',
  ];

  // Mots-clés pour auto-dépréciation
  const selfDeprecationKeywords = [
    'je suis nul',
    'je suis nulle',
    'je suis trop nul',
    'je suis une merde',
    'je suis vraiment une merde',
    'je suis vrmt une merde',
    'personne ne m\'aime',
    'personne ne m\'aime pas',
    'je suis inutile',
    'je suis nul en',
    'je suis mauvais',
    'je suis mauvais en',
    'je suis nul à',
    'je suis incapable',
    'je ne vaux rien',
    'je ne vaux pas grand chose',
  ];

  // Vérifier d'abord les pensées suicidaires (priorité)
  for (const keyword of suicidalKeywords) {
    if (lowerText.includes(keyword)) {
      return {
        type: 'suicidal_thoughts',
        confidence: 0.8,
        responseText: 'Nous avons détecté des pensées difficiles dans votre texte. Il est important de parler à quelqu\'un de confiance ou d\'appeler un numéro d\'aide.',
      };
    }
  }

  // Ensuite vérifier l'auto-dépréciation
  for (const keyword of selfDeprecationKeywords) {
    if (lowerText.includes(keyword)) {
      return {
        type: 'self_deprecation',
        confidence: 0.7,
        responseText: 'Nous avons détecté de l\'auto-dépréciation dans votre texte. Il peut être utile de reformuler ces pensées de manière plus équilibrée et réaliste.',
      };
    }
  }

  return {
    type: 'none',
    confidence: 0,
    responseText: undefined,
  };
}
