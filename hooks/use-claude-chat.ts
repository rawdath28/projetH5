// hooks/use-claude-chat.ts

import { useState, useCallback, useRef } from 'react';
import {
  CirclesOfControlData,
  ExerciseItem,
  SYSTEM_PROMPT,
} from '../lib/circles_of_control';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-sonnet-4-6';
const MAX_TURNS = 20;

// ─── Outil Claude (format Anthropic) ─────────────────────────────────────────

const CLAUDE_TOOLS = [
  {
    name: 'update_exercise_data',
    description:
      "Met à jour le buffer avec les informations identifiées au fil de la conversation. Appeler à chaque fois qu'une ou plusieurs informations sont identifiées.",
    input_schema: {
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
                description: "Piste d'action concrète identifiée",
              },
            },
            required: ['label'],
          },
        },
      },
    },
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

type ClaudeContentBlock =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: any }
  | { type: 'tool_result'; tool_use_id: string; content: string };

type ClaudeMessage = {
  role: 'user' | 'assistant';
  content: string | ClaudeContentBlock[];
};

// ─── Merge du buffer ──────────────────────────────────────────────────────────

function mergeBuffer(
  current: Partial<CirclesOfControlData>,
  incoming: Partial<CirclesOfControlData>
): Partial<CirclesOfControlData> {
  const merged = { ...current };
  if (incoming.situation) merged.situation = incoming.situation;
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

export function useClaudeChat(onExerciseLaunch: (data: CirclesOfControlData) => void) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const claudeHistory = useRef<ClaudeMessage[]>([]);
  const buffer = useRef<Partial<CirclesOfControlData>>({});
  const turnCount = useRef(0);

  // ── Appel à l'API Claude ──────────────────────────────────────────────────

  const callClaude = useCallback(async (history: ClaudeMessage[]) => {
    const apiKey = process.env.EXPO_PUBLIC_CLAUDE_API_KEY?.trim();
    if (!apiKey) throw new Error('Clé API Claude manquante');

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: CLAUDE_TOOLS,
        tool_choice: { type: 'auto' },
        messages: history,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Erreur Claude ${response.status} : ${err}`);
    }

    return response.json();
  }, []);

  // ── Traitement d'un tour (texte + tool calls) ─────────────────────────────

  const processTurn = useCallback(async (history: ClaudeMessage[]) => {
    const data = await callClaude(history);
    const content: ClaudeContentBlock[] = data.content ?? [];

    let assistantText: string | null = null;
    const toolUses: { id: string; name: string; input: any }[] = [];

    for (const block of content) {
      if (block.type === 'text') assistantText = block.text;
      else if (block.type === 'tool_use') toolUses.push({ id: block.id, name: block.name, input: block.input });
    }

    // Stocker le message assistant avec tous ses blocs
    let updatedHistory: ClaudeMessage[] = [
      ...history,
      { role: 'assistant', content },
    ];

    if (assistantText) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', text: assistantText! },
      ]);
    }

    // Traiter les tool calls
    if (toolUses.length > 0) {
      const toolResults: ClaudeContentBlock[] = [];

      for (const tc of toolUses) {
        if (tc.name === 'update_exercise_data') {
          buffer.current = mergeBuffer(buffer.current, tc.input);
          toolResults.push({
            type: 'tool_result',
            tool_use_id: tc.id,
            content: JSON.stringify({
              status: 'updated',
              currentBuffer: buffer.current,
              message: 'Données mises à jour.',
            }),
          });
        }
      }

      updatedHistory = [
        ...updatedHistory,
        { role: 'user', content: toolResults },
      ];
    }

    claudeHistory.current = updatedHistory;
  }, [callClaude]);

  // ── Message d'ouverture ───────────────────────────────────────────────────

  const initConversation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const initialHistory: ClaudeMessage[] = [
        { role: 'user', content: 'Bonjour' },
      ];
      await processTurn(initialHistory);
    } catch (e: any) {
      console.error('[useClaudeChat] initConversation error:', e?.message ?? e);
      setError(`Erreur : ${e?.message ?? 'inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  }, [processTurn]);

  // ── Envoi d'un message utilisateur ───────────────────────────────────────

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    if (turnCount.current >= MAX_TURNS) {
      setError("La conversation a atteint sa limite.");
      return;
    }

    turnCount.current += 1;
    setError(null);

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', text },
    ]);

    // Après 4 tours → message de transition + lancement de l'exercice
    if (turnCount.current >= 4) {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 600));
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
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

    const updatedHistory: ClaudeMessage[] = [
      ...claudeHistory.current,
      { role: 'user', content: text },
    ];

    setIsLoading(true);
    try {
      await processTurn(updatedHistory);
    } catch (e: any) {
      console.error('[useClaudeChat] sendMessage error:', e?.message ?? e);
      setError(`Erreur : ${e?.message ?? 'inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, processTurn, onExerciseLaunch]);

  const clearMessages = () => setMessages([]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    initConversation,
    currentBuffer: buffer.current,
  };
}
