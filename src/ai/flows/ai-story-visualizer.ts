
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
  prompt: `You are an expert screenplay writer and concept artist with a powerful visual imagination. Your task is to read the following story, break it down into a comprehensive list of distinct scenes, and generate a powerful, descriptive image prompt for each scene that could be used with an AI image generator.

**Instructions:**
1.  **Analyze the Story:** Read the entire story to deeply understand the plot, characters, setting, emotional tone, and key moments.
2.  **Divide into Scenes:** Break the story into a generous number of logical scenes. A scene change occurs with a change in location, time, a significant shift in action, or a change in emotional focus. Be liberal with scene breaks to capture more visual moments.
3.  **Minimum Scene Count:** You MUST generate a minimum of **10 scenes**. If the story is short, get creative and generate multiple prompts for the same scene from different angles, focusing on different details, characters, or moods (e.g., an establishing shot, a close-up on an object, a character's reaction).
4.  **Scale with Length:** For longer stories, the number of scenes should naturally increase to cover the narrative comprehensively.
5.  **Scene Description:** For each scene, write a brief, one-sentence description summarizing the action or moment.
6.  **Detailed Image Prompt:** For each scene, create a detailed and evocative image prompt. The prompt should be rich with details about:
    *   **Subject & Characters:** Main characters, their appearance (clothing, expressions, posture), and their interactions.
    *   **Setting & Environment:** The environment, time of day, weather, and key background elements (e.g., "a cluttered futuristic workshop," "a serene, misty forest at dawn").
    *   **Action & Composition:** What the characters are doing. Describe the shot type (e.g., wide shot, close-up, dynamic action shot, over-the-shoulder view).
    *   **Mood & Lighting:** The overall atmosphere (e.g., mysterious, dramatic, joyful), and the lighting (e.g., cinematic lighting, soft morning light, neon glow, volumetric rays of light).
    *   **Art Style:** Suggest an appropriate and exciting art style (e.g., photorealistic, digital painting, anime, cinematic 4K, epic, dark fantasy).
7.  **Output Structure:** Structure your output as an array of scene objects.

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
