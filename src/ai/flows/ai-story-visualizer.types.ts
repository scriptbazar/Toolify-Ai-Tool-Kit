
import { z } from 'zod';

export const AiStoryVisualizerInputSchema = z.object({
  story: z.string().describe('The full text of the story to be visualized.'),
});
export type AiStoryVisualizerInput = z.infer<typeof AiStoryVisualizerInputSchema>;


const SceneSchema = z.object({
  sceneDescription: z.string().describe('A brief, one-sentence description of the scene.'),
  imagePrompt: z.string().describe('A detailed, evocative prompt for an AI image generator, describing the characters, setting, action, mood, and style of the scene.'),
});
export type Scene = z.infer<typeof SceneSchema>;


export const AiStoryVisualizerOutputSchema = z.object({
  scenes: z.array(SceneSchema).describe('An array of objects, each representing a scene with its description and a corresponding image prompt.'),
});
export type AiStoryVisualizerOutput = z.infer<typeof AiStoryVisualizerOutputSchema>;
