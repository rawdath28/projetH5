/**
 * Fonction pour analyser le texte avec Mistral API
 * Détecte l'auto-dépréciation, l'anxiété, les pensées suicidaires et d'autres troubles
 */

import { getMistralApiKey } from './config';

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

export type AnalysisResult = {
  type: 'self_deprecation' | 'anxiety' | 'stress' | 'suicidal_thoughts' | 'none';
  confidence: number;
  responseText?: string; // Réponse textuelle complète de Mistral
};

export async function analyzeTextWithMistral(text: string): Promise<AnalysisResult> {
  console.log('🔍 [MISTRAL API] Début de l\'analyse du texte');
  console.log('📝 [MISTRAL API] Texte à analyser:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
  
  // Récupérer la clé API depuis la configuration
  const apiKey = getMistralApiKey();
  
  if (!apiKey) {
    console.warn('⚠️ [MISTRAL API] Aucune clé API trouvée, utilisation de l\'analyse basique');
    // Fallback: analyse basique avec mots-clés
    return analyzeTextBasic(text);
  }

  console.log('✅ [MISTRAL API] Clé API trouvée (masquée):', apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4));

  try {
    const prompt = `Tu es un assistant bienveillant qui aide les personnes en détresse psychologique. 

Analyse ce texte et détermine s'il contient un ou plusieurs des troubles suivants:
1. Auto-dépréciation (ex: "je suis nul", "je suis une merde", "personne ne m'aime", "je ne vaux rien")
2. Anxiété (ex: "j'ai peur", "je suis inquiet", "je stresse", "je panique", "je suis angoissé", "je me fais du souci")
3. Stress / Surcharge (ex: "je suis débordé", "je n'y arrive pas", "c'est trop", "je suis surchargé", "je suis épuisé")
4. Pensées suicidaires (ex: "je vais en finir", "je préférerais être mort", "je veux mourir", "je veux en finir")

Réponds UNIQUEMENT avec le type détecté suivi d'une description de l'exercice adapté (3-4 phrases):
- Si auto-dépréciation: commence par "AUTO_DEPRECATION:" puis décris l'exercice des cercles de contrôle et comment il aide à distinguer ce qu'on contrôle de ce qu'on ne contrôle pas.
- Si anxiété: commence par "ANXIETY:" puis décris l'exercice des cercles de contrôle et comment il aide à réduire l'anxiété en se concentrant sur ce qu'on peut contrôler.
- Si stress/surcharge: commence par "STRESS:" puis décris l'exercice des cercles de contrôle et comment il aide à prioriser et réduire le sentiment de surcharge.
- Si pensées suicidaires: commence par "SUICIDAL:" puis invite à chercher de l'aide immédiate et mentionne les professionnels disponibles.
- Si rien de particulier: réponds simplement "NONE"

IMPORTANT: Ne décris PAS le trouble, décris uniquement l'exercice adapté et comment il peut aider.

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

    console.log('📤 [MISTRAL API] Envoi de la requête à Mistral API...');
    console.log('🌐 [MISTRAL API] URL:', MISTRAL_API_URL);
    console.log('🤖 [MISTRAL API] Modèle:', requestBody.model);
    console.log('📊 [MISTRAL API] Paramètres:', {
      temperature: requestBody.temperature,
      max_tokens: requestBody.max_tokens,
      prompt_length: prompt.length,
    });

    const startTime = Date.now();
    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`, // S'assurer qu'il n'y a pas d'espaces
      },
      body: JSON.stringify(requestBody),
    });
    const duration = Date.now() - startTime;

    console.log('📥 [MISTRAL API] Réponse reçue en', duration, 'ms');
    console.log('📊 [MISTRAL API] Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [MISTRAL API] Erreur API Mistral:', response.status, response.statusText);
      console.error('❌ [MISTRAL API] Détails erreur:', errorText);
      
      // Si c'est une erreur 401, la clé API est probablement invalide
      if (response.status === 401) {
        console.error('❌ [MISTRAL API] Erreur 401: Clé API invalide ou expirée.');
        console.error('💡 [MISTRAL API] Solutions possibles:');
        console.error('   1. Vérifiez que votre clé API Mistral est valide sur https://console.mistral.ai/');
        console.error('   2. Mettez à jour la clé dans lib/config.ts ou dans votre fichier .env');
        console.error('   3. Redémarrez le serveur Expo après avoir modifié la clé');
        console.error('   4. Clé actuelle (masquée):', apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4));
      }
      
      // Utiliser l'analyse basique en cas d'erreur
      console.warn('⚠️ [MISTRAL API] Utilisation de l\'analyse basique (fallback)');
      return analyzeTextBasic(text);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    console.log('✅ [MISTRAL API] Réponse API reçue avec succès');
    console.log('📄 [MISTRAL API] Contenu de la réponse:', content.substring(0, 200) + (content.length > 200 ? '...' : ''));
    console.log('📊 [MISTRAL API] Métadonnées:', {
      model: data.model,
      usage: data.usage,
      finish_reason: data.choices[0]?.finish_reason,
    });
    
    // Analyser le contenu pour déterminer le type
    const upperContent = content.toUpperCase();
    const lowerContent = content.toLowerCase();
    let type: 'self_deprecation' | 'anxiety' | 'stress' | 'suicidal_thoughts' | 'none' = 'none';
    let confidence = 0.7;
    
    // Vérifier les préfixes de type dans la réponse
    if (upperContent.includes('SUICIDAL:')) {
      type = 'suicidal_thoughts';
      confidence = 0.9;
    } else if (upperContent.includes('AUTO_DEPRECATION:') || upperContent.includes('AUTO-DÉPRÉCIATION:')) {
      type = 'self_deprecation';
      confidence = 0.9;
    } else if (upperContent.includes('ANXIETY:') || upperContent.includes('ANXIÉTÉ:')) {
      type = 'anxiety';
      confidence = 0.9;
    } else if (upperContent.includes('STRESS:')) {
      type = 'stress';
      confidence = 0.9;
    } else if (upperContent.includes('NONE') || content.trim().toUpperCase() === 'NONE') {
      type = 'none';
      confidence = 0.5;
    } else {
      // Fallback: analyser le contenu pour détecter les indices
      const suicidalIndicators = ['suicide', 'mourir', 'en finir', 'aide', 'professionnel', 'appeler'];
      const hasSuicidalIndicators = suicidalIndicators.some(indicator => lowerContent.includes(indicator));
      
      const selfDeprecationIndicators = ['auto-dépréciation', 'distorsion', 'reformulation', 'pensée négative', 'cognitif'];
      const hasSelfDeprecationIndicators = selfDeprecationIndicators.some(indicator => lowerContent.includes(indicator));
      
      const anxietyIndicators = ['anxiété', 'anxieux', 'peur', 'inquiet', 'stress', 'panique', 'angoisse', 'souci', 'respiration', 'relaxation'];
      const hasAnxietyIndicators = anxietyIndicators.some(indicator => lowerContent.includes(indicator));
      
      const stressIndicators = ['débordé', 'surchargé', 'épuisé', 'trop', 'n\'y arrive pas', 'gérer le stress'];
      const hasStressIndicators = stressIndicators.some(indicator => lowerContent.includes(indicator));
      
      // Priorité: suicidal > self_deprecation > anxiety > stress
      if (hasSuicidalIndicators && !hasSelfDeprecationIndicators) {
        type = 'suicidal_thoughts';
        confidence = 0.8;
      } else if (hasSelfDeprecationIndicators) {
        type = 'self_deprecation';
        confidence = 0.8;
      } else if (hasAnxietyIndicators && !hasStressIndicators) {
        type = 'anxiety';
        confidence = 0.8;
      } else if (hasStressIndicators) {
        type = 'stress';
        confidence = 0.8;
      } else {
        // Analyser aussi le texte original pour déterminer le type
        const lowerText = text.toLowerCase();
        const suicidalKeywords = ['en finir', 'préférerais être mort', 'veux mourir', 'suicide', 'mourir'];
        const selfDeprecationKeywords = ['je suis nul', 'je suis une merde', 'personne ne m\'aime'];
        const anxietyKeywords = ['j\'ai peur', 'je suis inquiet', 'je stresse', 'je panique', 'je suis angoissé', 'je me fais du souci', 'anxiété'];
        const stressKeywords = ['je suis débordé', 'je n\'y arrive pas', 'c\'est trop', 'surchargé', 'épuisé'];
        
        if (suicidalKeywords.some(kw => lowerText.includes(kw))) {
          type = 'suicidal_thoughts';
          confidence = 0.8;
        } else if (selfDeprecationKeywords.some(kw => lowerText.includes(kw))) {
          type = 'self_deprecation';
          confidence = 0.8;
        } else if (anxietyKeywords.some(kw => lowerText.includes(kw))) {
          type = 'anxiety';
          confidence = 0.8;
        } else if (stressKeywords.some(kw => lowerText.includes(kw))) {
          type = 'stress';
          confidence = 0.8;
        }
      }
    }

    const result = {
      type,
      confidence,
      responseText: content.trim() || undefined,
    };
    
    console.log('✅ [MISTRAL API] Analyse terminée avec succès');
    console.log('📊 [MISTRAL API] Résultat:', {
      type,
      confidence,
      responseText_length: result.responseText?.length || 0,
    });
    
    return result;
  } catch (error) {
    console.error('❌ [MISTRAL API] Erreur lors de l\'analyse Mistral:', error);
    if (error instanceof Error) {
      console.error('❌ [MISTRAL API] Message d\'erreur:', error.message);
      console.error('❌ [MISTRAL API] Stack:', error.stack);
    }
    console.warn('⚠️ [MISTRAL API] Utilisation de l\'analyse basique (fallback)');
    return analyzeTextBasic(text);
  }
}

/**
 * Analyse basique avec mots-clés (fallback si API indisponible)
 */
function analyzeTextBasic(text: string): AnalysisResult {
  console.log('🔧 [MISTRAL API] Utilisation de l\'analyse basique (fallback)');
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
  
  // Mots-clés pour anxiété
  const anxietyKeywords = [
    'j\'ai peur',
    'je suis inquiet',
    'je suis inquiète',
    'je stresse',
    'je panique',
    'je suis angoissé',
    'je suis angoissée',
    'je me fais du souci',
    'je me fais des soucis',
    'anxiété',
    'anxieux',
    'anxieuse',
    'angoisse',
    'panique',
    'peur',
    'inquiétude',
  ];
  
  // Mots-clés pour stress/surcharge
  const stressKeywords = [
    'je suis débordé',
    'je suis débordée',
    'je n\'y arrive pas',
    'c\'est trop',
    'surchargé',
    'surchargée',
    'épuisé',
    'épuisée',
    'surmené',
    'surmenée',
    'je suis fatigué',
    'je suis fatiguée',
    'je suis épuisé',
    'je suis épuisée',
  ];

  // Vérifier d'abord les pensées suicidaires (priorité absolue)
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
  
  // Vérifier l'anxiété
  for (const keyword of anxietyKeywords) {
    if (lowerText.includes(keyword)) {
      return {
        type: 'anxiety',
        confidence: 0.7,
        responseText: 'Nous avons détecté des signes d\'anxiété dans votre texte. L\'anxiété est une réaction normale, et il existe des techniques pour la gérer, comme la respiration profonde ou les exercices de relaxation.',
      };
    }
  }
  
  // Vérifier le stress/surcharge
  for (const keyword of stressKeywords) {
    if (lowerText.includes(keyword)) {
      return {
        type: 'stress',
        confidence: 0.7,
        responseText: 'Nous avons détecté des signes de stress ou de surcharge dans votre texte. Il est important de prendre du recul et de prioriser ce qui est vraiment essentiel.',
      };
    }
  }

  return {
    type: 'none',
    confidence: 0,
    responseText: undefined,
  };
}
