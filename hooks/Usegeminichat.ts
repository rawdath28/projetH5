// hooks/Usegeminichat.ts
import { useCallback, useRef, useState } from 'react';
import {
  CirclesOfControlData,
  ExerciseItem,
  SYSTEM_PROMPT,
} from '../lib/circles_of_control';
import { getMistralApiKey } from '../lib/config';

const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_MODEL = 'mistral-small-latest';

// ─── Outils Mistral (format OpenAI) ──────────────────────────────────────────

const MISTRAL_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'update_exercise_data',
      description:
        "Met à jour le buffer avec les informations identifiées au fil de la conversation. Appeler à chaque fois qu'une ou plusieurs informations sont identifiées.",
      parameters: {
        type: 'object',
        properties: {
          situation: {
            type: 'string',
            description: "Description contextualisée de la préoccupation de l'utilisateur.",
          },
          items: {
            type: 'array',
            description: 'Éléments concrets identifiés dans la situation',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string', description: "L'aspect concret identifié" },
                action: {
                  type: 'string',
                  description: 'Piste d action concrète identifiée',
                },
              },
              required: ['label'],
            },
          },
        },
      },
    },
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

export type ChatMessage = {
  id: string;
  role: 'ai' | 'user';
  text: string;
};

type ToolCall = {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
};

type MistralMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
};

// ─── Merge du buffer ──────────────────────────────────────────────────────────

function mergeBuffer(
  current: Partial<CirclesOfControlData>,
  incoming: Partial<CirclesOfControlData>
): Partial<CirclesOfControlData> {
  const merged = { ...current };

  if (incoming.situation) {
    merged.situation = incoming.situation;
  }

  if (incoming.items && Array.isArray(incoming.items)) {
    const existing = current.items ?? [];
    const existingLabels = new Set(existing.map((i) => i.label.toLowerCase()));
    const newItems = (incoming.items as ExerciseItem[]).filter(
      (item) => item.label && !existingLabels.has(item.label.toLowerCase())
    );
    merged.items = [...existing, ...newItems];
  }

  return merged;
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useGeminiChat(onExerciseLaunch: (data: CirclesOfControlData) => void) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mistralHistory = useRef<MistralMessage[]>([]);
  const buffer = useRef<Partial<CirclesOfControlData>>({});
  const turnCount = useRef(0);
  const MAX_TURNS = 20;

  // ── Appel à l'API Mistral ─────────────────────────────────────────────────

  const callMistral = useCallback(async (history: MistralMessage[]) => {
    const apiKey = getMistralApiKey();
    if (!apiKey) throw new Error('Clé API Mistral manquante');

    const res = await fetch(MISTRAL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        messages: history,
        tools: MISTRAL_TOOLS,
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 512,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Erreur Mistral ${res.status} : ${err}`);
    }

    return res.json();
  }, []);

  // ── Parse la réponse Mistral ──────────────────────────────────────────────

  const parseMistralResponse = (data: any): {
    text: string | null;
    toolCalls: { id: string; name: string; args: any }[];
    rawMessage: any;
  } => {
    const message = data?.choices?.[0]?.message;
    const text: string | null = message?.content ?? null;
    const toolCalls: { id: string; name: string; args: any }[] = [];

    if (message?.tool_calls) {
      for (const tc of message.tool_calls) {
        toolCalls.push({
          id: tc.id,
          name: tc.function.name,
          args: (() => {
            try {
              return JSON.parse(tc.function.arguments);
            } catch {
              return {};
            }
          })(),
        });
      }
    }

    return { text, toolCalls, rawMessage: message };
  };

  // ── Traitement des tool calls ─────────────────────────────────────────────

  const handleToolCalls = useCallback(
    async (
      toolCalls: { id: string; name: string; args: any }[],
      currentHistory: MistralMessage[]
    ): Promise<MistralMessage[]> => {
      let updatedHistory = [...currentHistory];

      for (const tc of toolCalls) {
        if (tc.name === 'update_exercise_data') {
          buffer.current = mergeBuffer(buffer.current, tc.args);

          const toolResponse: MistralMessage = {
            role: 'tool',
            tool_call_id: tc.id,
            content: JSON.stringify({
              status: 'updated',
              currentBuffer: buffer.current,
              message: 'Données mises à jour.',
            }),
          };

          updatedHistory = [...updatedHistory, toolResponse];
        }
      }

      return updatedHistory;
    },
    [callMistral, onExerciseLaunch]
  );

  // ── Traitement complet d'un tour ──────────────────────────────────────────

  const processTurn = useCallback(
    async (history: MistralMessage[]) => {
      const data = await callMistral(history);
      const { text, toolCalls, rawMessage } = parseMistralResponse(data);

      // Stocker le message assistant dans l'historique (avec ses tool_calls si présents)
      const assistantMsg: MistralMessage = {
        role: 'assistant',
        content: rawMessage?.content ?? null,
        ...(rawMessage?.tool_calls ? { tool_calls: rawMessage.tool_calls } : {}),
      };
      let updatedHistory = [...history, assistantMsg];

      if (text) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: 'ai', text },
        ]);
      }

      if (toolCalls.length > 0) {
        updatedHistory = await handleToolCalls(toolCalls, updatedHistory);
      }

      mistralHistory.current = updatedHistory;
    },
    [callMistral, handleToolCalls]
  );

  // ── Message d'ouverture ───────────────────────────────────────────────────

  const initConversation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const initialHistory: MistralMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: 'Bonjour' },
      ];
      await processTurn(initialHistory);
    } catch (e: any) {
      console.error('[useGeminiChat] initConversation error:', e?.message ?? e);
      setError(`Erreur : ${e?.message ?? 'inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  }, [processTurn]);

  // ── Envoi d'un message utilisateur ───────────────────────────────────────

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      if (turnCount.current >= MAX_TURNS) {
        setError("La conversation a atteint sa limite. Lance l'exercice avec les données collectées.");
        return;
      }

      turnCount.current += 1;
      setError(null);

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'user', text },
      ]);

      // Après 3 interactions Q:R complètes (R1→Q2, R2→Q3, R3→Q4, R4→transition)
      // on affiche juste le message de transition puis on lance l'exo
      if (turnCount.current >= 4) {
        setIsLoading(true);
        try {
          await new Promise((resolve) => setTimeout(resolve, 600));
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: 'ai',
              text: "Je te propose quelque chose qui pourrait t'aider à y voir plus clair sur tout ça.",
            },
          ]);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          onExerciseLaunch(buffer.current as CirclesOfControlData);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      const userMsg: MistralMessage = { role: 'user', content: text };
      const updatedHistory = [...mistralHistory.current, userMsg];

      setIsLoading(true);
      try {
        await processTurn(updatedHistory);
      } catch (e: any) {
        console.error('[useGeminiChat] sendMessage error:', e?.message ?? e);
        setError(`Erreur : ${e?.message ?? 'inconnue'}`);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, processTurn, onExerciseLaunch]
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    initConversation,
    currentBuffer: buffer.current,
  };
}
