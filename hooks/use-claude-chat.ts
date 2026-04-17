// hooks/use-claude-chat.ts

import { useState, useCallback, useRef } from 'react';
import {
    CirclesOfControlData,
    ExerciseItem,
    SYSTEM_PROMPT,
} from '../lib/circles_of_control';
import { supabase } from '../lib/supabase';

// Ensure trailing slash on Supabase URL
const _supabaseUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '');
const EDGE_FUNCTION_URL = `${_supabaseUrl}/functions/v1/claude-chat`;
console.log('[useClaudeChat] Edge Function URL:', EDGE_FUNCTION_URL);
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
        const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
        console.log('[callClaude] Appel Edge Function →', EDGE_FUNCTION_URL);
        console.log('[callClaude] Historique messages count:', history.length);

        let response: Response;
        try {
            response = await fetch(EDGE_FUNCTION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'apikey': SUPABASE_ANON_KEY,
                },
                body: JSON.stringify({
                    system: SYSTEM_PROMPT,
                    tools: CLAUDE_TOOLS,
                    tool_choice: { type: 'auto' },
                    messages: history,
                }),
            });
        } catch (fetchErr: any) {
            console.error('[callClaude] Erreur réseau (fetch failed):', fetchErr?.message ?? fetchErr);
            throw fetchErr;
        }

        console.log('[callClaude] Réponse status:', response.status);

        if (!response.ok) {
            const err = await response.text();
            console.error('[callClaude] Erreur HTTP:', response.status, err);
            throw new Error(`Erreur Edge Function ${response.status} : ${err}`);
        }

        const data = await response.json();
        console.log('[callClaude] Réponse Claude - stop_reason:', data.stop_reason, '| nb blocs:', data.content?.length ?? 0);
        return data;
    }, []);

    // ── Traitement d'un tour (texte + tool calls) ─────────────────────────────

    const processTurn = useCallback(async (history: ClaudeMessage[]) => {
        console.log('[processTurn] Début du tour, historique:', history.length, 'messages');
        const data = await callClaude(history);
        const content: ClaudeContentBlock[] = data.content ?? [];

        console.log('[processTurn] Blocs reçus:', content.map(b => b.type));

        let assistantText: string | null = null;
        const toolUses: { id: string; name: string; input: any }[] = [];

        for (const block of content) {
            if (block.type === 'text') {
                assistantText = block.text;
                console.log('[processTurn] Texte assistant (100 chars):', block.text?.slice(0, 100));
            } else if (block.type === 'tool_use') {
                console.log('[processTurn] Tool use détecté:', block.name, '| input:', JSON.stringify(block.input)?.slice(0, 100));
                toolUses.push({ id: block.id, name: block.name, input: block.input });
            }
        }

        // Stocker le message assistant avec tous ses blocs
        let updatedHistory: ClaudeMessage[] = [
            ...history,
            { role: 'assistant', content },
        ];

        if (assistantText) {
            console.log('[processTurn] Ajout message assistant dans state');
            setMessages((prev) => [
                ...prev,
                { id: Date.now().toString(), role: 'assistant', text: assistantText! },
            ]);
        } else {
            console.warn('[processTurn] Aucun texte dans la réponse — rien affiché');
        }

        // Traiter les tool calls
        if (toolUses.length > 0) {
            console.log('[processTurn] Traitement', toolUses.length, 'tool(s)');
            const toolResults: ClaudeContentBlock[] = [];

            for (const tc of toolUses) {
                if (tc.name === 'update_exercise_data') {
                    buffer.current = mergeBuffer(buffer.current, tc.input);
                    console.log('[processTurn] Buffer mis à jour:', JSON.stringify(buffer.current)?.slice(0, 150));
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

        // Si Claude a fait des tool calls sans texte → rappeler pour obtenir la réponse
        if (toolUses.length > 0 && !assistantText) {
            console.log('[processTurn] Tool use sans texte → 2ème appel pour réponse...');
            const data2 = await callClaude(updatedHistory);
            const content2: ClaudeContentBlock[] = data2.content ?? [];
            console.log('[processTurn] Blocs 2ème appel:', content2.map(b => b.type));

            for (const block of content2) {
                if (block.type === 'text' && block.text) {
                    console.log('[processTurn] Texte 2ème appel:', block.text.slice(0, 100));
                    setMessages((prev) => [
                        ...prev,
                        { id: Date.now().toString(), role: 'assistant', text: block.text },
                    ]);
                    break;
                }
            }

            updatedHistory = [
                ...updatedHistory,
                { role: 'assistant', content: content2 },
            ];
        }

        claudeHistory.current = updatedHistory;
        console.log('[processTurn] Fin du tour OK');
    }, [callClaude]);

    // ── Message d'ouverture ───────────────────────────────────────────────────

    const initConversation = useCallback(async () => {
        console.log('[initConversation] Démarrage de la conversation...');
        setIsLoading(true);
        setError(null);
        try {
            const initialHistory: ClaudeMessage[] = [
                { role: 'user', content: 'Bonjour' },
            ];
            await processTurn(initialHistory);
            console.log('[initConversation] Conversation initialisée avec succès');
        } catch (e: any) {
            console.error('[initConversation] Erreur:', e?.message ?? e);
            setError(`Erreur : ${e?.message ?? 'inconnue'}`);
        } finally {
            setIsLoading(false);
        }
    }, [processTurn]);

    // ── Envoi d'un message utilisateur ───────────────────────────────────────

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || isLoading) return;

        console.log('[sendMessage] Message envoyé:', text.slice(0, 60), '| Tour:', turnCount.current + 1, '/', MAX_TURNS);

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

        // Après 3 tours → message de transition + lancement de l'exercice
        if (turnCount.current >= 3) {
            console.log('[sendMessage] Tour 4 atteint → lancement exercice');
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
                console.log('[sendMessage] Buffer final:', JSON.stringify(buffer.current));
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
            console.error('[sendMessage] Erreur:', e?.message ?? e);
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
