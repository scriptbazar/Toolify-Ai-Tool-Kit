
'use server';
/**
 * @fileOverview An AI agent that analyzes a story and generates image prompts for each scene.
 *
 * - aiStoryVisualizer - The main function for generating scene-based image prompts.
 * - AiStoryVisualizerInput - The input type for the function.
 * - AiStoryVisualizerOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import {
    AiStoryVisualizerInputSchema,
    AiStoryVisualizerOutputSchema,
    type AiStoryVisualizerInput,
    type AiStoryVisualizerOutput,
} from './ai-story-visualizer.types';

export async function aiStoryVisualizer(input: AiStoryVisualizerInput): Promise<AiStoryVisualizerOutput> {
  return aiStoryVisualizerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiStoryVisualizerPrompt',
  input: { schema: AiStoryVisualizerInputSchema },
  output: { schema: AiStoryVisualizerOutputSchema },
  prompt: `You are an expert screenplay writer and concept artist. Your task is to read the following story, break it down into distinct scenes, and generate a powerful, descriptive image prompt for each scene that could be used with an AI image generator.

**Instructions:**
1.  Read the entire story to understand the plot, characters, setting, and mood.
2.  Divide the story into logical scenes. A scene change can occur with a change in location, time, or a significant shift in action.
3.  For each scene, write a brief, one-sentence description summarizing the action or moment.
4.  For each scene, create a detailed and evocative image prompt. The prompt should be rich with details about:
    *   **Subject:** Main characters, their appearance, clothing, and expressions.
    *   **Setting:** The environment, time of day, weather, and key background elements.
    *   **Action:** What the characters are doing.
    *   **Mood & Lighting:** The overall atmosphere (e.g., mysterious, dramatic, joyful), and the lighting (e.g., cinematic lighting, soft morning light, neon glow).
    *   **Art Style:** Suggest an appropriate art style (e.g., photorealistic, digital painting, anime, cinematic, epic).
5.  Structure your output as an array of scene objects.

**User's Story:**
---
{{{story}}}
---
`,
});

const aiStoryVisualizerFlow = ai.defineFlow(
  {
    name: 'aiStoryVisualizerFlow',
    inputSchema: AiStoryVisualizerInputSchema,
    outputSchema: AiStoryVisualizerOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output?.scenes) {
        throw new Error("The AI failed to generate any scenes. The story might be too short or unclear.");
    }
    return output;
  }
);
