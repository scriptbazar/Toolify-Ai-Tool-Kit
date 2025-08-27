'use server';

/**
 * @fileOverview Manages AI prompt templates for different AI tools in Firestore.
 *
 * - getPromptTemplate - Retrieves a prompt template by name.
 * - getAllPromptTemplates - Retrieves all prompt templates.
 * - savePromptTemplate - Saves or updates a prompt template.
 * - AiPromptTemplateInput - The input type for prompt templates.
 * - AiPromptTemplateOutput - The return type for prompt templates.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {getFirestore} from 'firebase-admin/firestore';
import {getApps, initializeApp} from 'firebase-admin/app';

// Initialize Firebase Admin SDK if not already done
if (!getApps().length) {
  initializeApp();
}
const db = getFirestore();
const templatesCollection = db.collection('promptTemplates');

const AiPromptTemplateSchema = z.object({
  name: z.string().describe('The unique name of the prompt template.'),
  content: z.string().describe('The content of the prompt template.'),
  description: z.string().optional().describe('A description of the prompt template.'),
});
export type AiPromptTemplateInput = z.infer<typeof AiPromptTemplateSchema>;
export type AiPromptTemplateOutput = z.infer<typeof AiPromptTemplateSchema>;

const GetPromptTemplateInputSchema = z.object({
  name: z.string(),
});

export async function getPromptTemplate(name: string): Promise<AiPromptTemplateOutput | undefined> {
  return getPromptTemplateFlow({name});
}

export async function getAllPromptTemplates(): Promise<AiPromptTemplateOutput[]> {
    return getAllPromptTemplatesFlow();
}

export async function savePromptTemplate(input: AiPromptTemplateInput): Promise<AiPromptTemplateOutput> {
  return savePromptTemplateFlow(input);
}

const getPromptTemplateFlow = ai.defineFlow(
  {
    name: 'getPromptTemplateFlow',
    inputSchema: GetPromptTemplateInputSchema,
    outputSchema: AiPromptTemplateSchema.optional(),
  },
  async ({name}) => {
    const docSnap = await templatesCollection.doc(name).get();
    if (!docSnap.exists) {
      return undefined;
    }
    return docSnap.data() as AiPromptTemplateOutput;
  }
);

const getAllPromptTemplatesFlow = ai.defineFlow(
    {
      name: 'getAllPromptTemplatesFlow',
      outputSchema: z.array(AiPromptTemplateSchema),
    },
    async () => {
      const snapshot = await templatesCollection.get();
      if (snapshot.empty) {
        return [];
      }
      return snapshot.docs.map(doc => doc.data() as AiPromptTemplateOutput);
    }
);


const savePromptTemplateFlow = ai.defineFlow(
  {
    name: 'savePromptTemplateFlow',
    inputSchema: AiPromptTemplateSchema,
    outputSchema: AiPromptTemplateSchema,
  },
  async input => {
    // Using the 'name' field as the document ID for easy retrieval.
    await templatesCollection.doc(input.name).set(input, { merge: true });
    return input;
  }
);
