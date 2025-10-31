
'use server';

/**
 * @fileOverview An AI agent for recognizing and analyzing text within an image.
 * - analyzeImage - Detects text and entities from an image data URI.
 */

import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import serviceAccount from '@/firebase-service-account-key.json';
import { 
    AnalyzeImageInputSchema,
    AnalyzeImageOutputSchema,
    type AnalyzeImageInput,
    type AnalyzeImageOutput
} from './text-recognizer.types';


export async function analyzeImage(input: AnalyzeImageInput): Promise<AnalyzeImageOutput> {
    return textRecognizerFlow(input);
}


const textRecognizerFlow = ai.defineFlow(
    {
        name: 'textRecognizerFlow',
        inputSchema: AnalyzeImageInputSchema,
        outputSchema: AnalyzeImageOutputSchema,
    },
    async (input) => {
        // Correctly initialize with the full service account object
        const visionClient = new ImageAnnotatorClient({
            credentials: {
                client_email: serviceAccount.client_email,
                private_key: serviceAccount.private_key,
            },
            projectId: serviceAccount.project_id,
        });

        const imageBuffer = Buffer.from(input.imageDataUri.split(',')[1], 'base64');
        
        try {
            const [result] = await visionClient.textDetection({
                image: { content: imageBuffer },
            });

            const fullTextAnnotation = result.fullTextAnnotation || null;
            const textAnnotations = result.textAnnotations || [];

            return {
                fullTextAnnotation: fullTextAnnotation,
                textAnnotations: textAnnotations,
            };

        } catch (error) {
            console.error('Google Cloud Vision API error:', error);
            throw new Error('Failed to analyze the image with the Vision API.');
        }
    }
);
