'use server';
/**
 * @fileOverview AI Chatbot flow that responds to user messages.
 *
 * - aiChat - A function that generates a response based on the chat history.
 * - AiChatInput - The input type for the aiChat function.
 * - AiChatOutput - The return type for the aiChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const AiChatInputSchema = z.object({
  history: z.array(ChatMessageSchema).describe('The history of the chat conversation.'),
  message: z.string().describe('The latest message from the user.'),
});
export type AiChatInput = z.infer<typeof AiChatInputSchema>;

const AiChatOutputSchema = z.object({
  response: z.string().describe('The AI-generated response.'),
});
export type AiChatOutput = z.infer<typeof AiChatOutputSchema>;

export async function aiChat(input: AiChatInput): Promise<AiChatOutput> {
  return aiChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatPrompt',
  input: {schema: AiChatInputSchema},
  output: {schema: AiChatOutputSchema},
  prompt: `You are a friendly and helpful AI assistant for ToolifyAI, a platform with over 100 smart utility tools.

Your role is to answer user questions about the platform, its tools, and how to use them. Keep your responses concise and helpful.

Here is the conversation history:
{{#each history}}
{{#if (eq role 'user')}}User: {{content}}{{/if}}
{{#if (eq role 'model')}}AI: {{content}}{{/if}}
{{/each}}

User's new message: {{{message}}}

AI Response:`,
});

const aiChatFlow = ai.defineFlow(
  {
    name: 'aiChatFlow',
    inputSchema: AiChatInputSchema,
    outputSchema: AiChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return { response: output?.response ?? "I'm sorry, I'm having trouble responding right now." };
  }
);
