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
  
  if (!apiKey) {
    // Fallback: analyse basique avec mots-clés
    return analyzeTextBasic(text);
  }

  try {
    const prompt = `Tu es un assistant bienveillant qui aide les personnes en détresse psychologique. 

Analyse ce texte et détermine s'il contient:
- De l'auto-dépréciation (ex: "je suis nul", "je suis une merde", "personne ne m'aime")
- Des pensées suicidaires (ex: "je vais en finir", "je préférerais être mort", "je veux mourir")

Si tu détectes de l'auto-dépréciation:
Rédige un message d'auto-éducation bienveillant (3-4 phrases) qui:
1. Explique pourquoi ces pensées sont des distorsions cognitives
2. Explique comment on peut les travailler
3. Présente l'exercice de reformulation: "La reformulation te permet de sortir de l'émotion pour revenir aux faits. Le but est de reformuler ta pensée avec une approche moins dramatique."

Si tu détectes des pensées suicidaires:
Rédige un message bienveillant et encourageant (2-3 phrases) qui invite à chercher de l'aide et mentionne qu'il existe des professionnels disponibles.

Si tu ne détectes rien de particulier, réponds simplement "none".

Texte à analyser: "${text}"`;

    const requestBody = {
      model: 'mistral-small', // Modèle Mistral (peut aussi être 'mistral-tiny', 'mistral-medium', 'mistral-large-latest')
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 300, // Augmenté pour permettre une réponse plus détaillée avec le message bienveillant
    };

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
      
      return analyzeTextBasic(text);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    // Analyser le contenu pour déterminer le type (sans JSON)
    const lowerContent = content.toLowerCase();
    let type: 'self_deprecation' | 'suicidal_thoughts' | 'none' = 'none';
    let confidence = 0.7;
    
    // Vérifier si la réponse contient des indices de pensées suicidaires
    const suicidalIndicators = ['suicide', 'mourir', 'en finir', 'aide', 'professionnel', 'appeler'];
    const hasSuicidalIndicators = suicidalIndicators.some(indicator => lowerContent.includes(indicator));
    
    // Vérifier si la réponse contient des indices d'auto-dépréciation
    const selfDeprecationIndicators = ['auto-dépréciation', 'distorsion', 'reformulation', 'pensée négative', 'cognitif'];
    const hasSelfDeprecationIndicators = selfDeprecationIndicators.some(indicator => lowerContent.includes(indicator));
    
    // Vérifier si c'est "none"
    if (lowerContent.includes('none') || content.trim().toLowerCase() === 'none') {
      type = 'none';
      confidence = 0.5;
    } else if (hasSuicidalIndicators && !hasSelfDeprecationIndicators) {
      type = 'suicidal_thoughts';
      confidence = 0.8;
    } else if (hasSelfDeprecationIndicators || lowerContent.includes('reformulation')) {
      type = 'self_deprecation';
      confidence = 0.8;
    } else {
      // Analyser aussi le texte original pour déterminer le type
      const lowerText = text.toLowerCase();
      const suicidalKeywords = ['en finir', 'préférerais être mort', 'veux mourir', 'suicide', 'mourir'];
      const selfDeprecationKeywords = ['je suis nul', 'je suis une merde', 'personne ne m\'aime'];
      
      if (suicidalKeywords.some(kw => lowerText.includes(kw))) {
        type = 'suicidal_thoughts';
        confidence = 0.8;
      } else if (selfDeprecationKeywords.some(kw => lowerText.includes(kw))) {
        type = 'self_deprecation';
        confidence = 0.8;
      }
    }

    return {
      type,
      confidence,
      responseText: content.trim() || undefined,
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
