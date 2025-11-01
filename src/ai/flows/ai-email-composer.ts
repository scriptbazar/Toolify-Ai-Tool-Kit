
'use server';

/**
 * @fileOverview An AI agent for composing and generating various types of emails.
 */

import { z } from 'zod';
import { ai } from '@/ai/genkit';
import {
    AiEmailComposerInputSchema,
    AiEmailComposerOutputSchema,
    GenerateFeatureAnnouncementEmailInputSchema,
    GenerateFeatureAnnouncementEmailOutputSchema,
    RegenerateEmailTemplateInputSchema,
    RegenerateEmailTemplateOutputSchema,
    type AiEmailComposerInput,
} from './ai-email-composer.types';


export async function composeEmail(input: AiEmailComposerInput): Promise<z.infer<typeof AiEmailComposerOutputSchema>> {
  return emailComposerFlow(input);
}

const emailComposerFlow = ai.defineFlow(
  {
    name: 'emailComposerFlow',
    inputSchema: AiEmailComposerInputSchema,
    outputSchema: AiEmailComposerOutputSchema,
  },
  async ({ subject, keyPoints, tone }) => {
    const { output } = await ai.generate({
      prompt: `Compose a ${tone.toLowerCase()} email with the subject "${subject}".
      The email should be based on these key points:
      - ${keyPoints.split('\n').join('\n- ')}
      
      The output should be a single string containing only the email body text.`,
       config: {
        responseMimeType: "application/json",
      },
      output: {
        schema: AiEmailComposerOutputSchema,
      },
    });

    if (!output) {
      throw new Error('Failed to compose email.');
    }
    return output;
  }
);


export async function generateFeatureAnnouncementEmail(input: z.infer<typeof GenerateFeatureAnnouncementEmailInputSchema>): Promise<z.infer<typeof GenerateFeatureAnnouncementEmailOutputSchema>> {
  return generateFeatureAnnouncementEmailFlow(input);
}

const generateFeatureAnnouncementEmailFlow = ai.defineFlow(
  {
    name: 'generateFeatureAnnouncementEmailFlow',
    inputSchema: GenerateFeatureAnnouncementEmailInputSchema,
    outputSchema: GenerateFeatureAnnouncementEmailOutputSchema,
  },
  async ({ featureName, featureDescription }) => {
    const { output } = await ai.generate({
      prompt: `Write an exciting and engaging email body announcing a new feature.
      Feature Name: ${featureName}
      Description: ${featureDescription}
      
      Start with a friendly greeting like "Hi {{name}}," and end with a sign-off from "The ToolifyAI Team". 
      The tone should be enthusiastic. Explain the feature and its benefits.
      The output should be a single string of text, with line breaks for paragraphs.`,
       config: {
        responseMimeType: "application/json",
      },
      output: {
        schema: GenerateFeatureAnnouncementEmailOutputSchema,
      },
    });
     if (!output) {
      throw new Error('Failed to generate announcement email.');
    }
    return output;
  }
);


export async function regenerateEmailTemplate(input: z.infer<typeof RegenerateEmailTemplateInputSchema>): Promise<z.infer<typeof RegenerateEmailTemplateOutputSchema>> {
  return regenerateEmailTemplateFlow(input);
}

const regenerateEmailTemplateFlow = ai.defineFlow(
  {
    name: 'regenerateEmailTemplateFlow',
    inputSchema: RegenerateEmailTemplateInputSchema,
    outputSchema: RegenerateEmailTemplateOutputSchema,
  },
  async ({ templateType }) => {
    const { output } = await ai.generate({
      prompt: `Regenerate the email body for a "${templateType}" template. 
      Use placeholders like {{name}} and {{link}} where appropriate. 
      The tone should be professional and clear. 
      Keep it concise and to the point.
      
      Output only the email body text.`,
       config: {
        responseMimeType: "application/json",
      },
      output: {
        schema: RegenerateEmailTemplateOutputSchema,
      },
    });
     if (!output) {
      throw new Error('Failed to regenerate template.');
    }
    return output;
  }
);

