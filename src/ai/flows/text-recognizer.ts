
'use server';

/**
 * @fileOverview An AI agent for recognizing and analyzing text within an image.
 * - analyzeImageForText - Detects text and entities from an image data URI.
 */

import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { ImageAnnotatorClient } from '@google-cloud/vision';

// Schemas based on a simplified version of the Google Cloud Vision API response.
export const VertexSchema = z.object({ x: z.number(), y: z.number() });
export const BoundingPolySchema = z.object({ vertices: z.array(VertexSchema) });

export const TextAnnotationSchema = z.object({
  description: z.string(),
  boundingPoly: BoundingPolySchema,
  // Simplified nested structure for blocks/paragraphs/words/symbols
  pages: z.array(z.any()).optional(),
  blocks: z.array(z.any()).optional(),
  paragraphs: z.array(z.any()).optional(),
  words: z.array(z.any()).optional(),
  symbols: z.array(z.any()).optional(),
  property: z.any().optional(), // To capture language hints
});
export type TextAnnotation = z.infer<typeof TextAnnotationSchema>;

export const EntityAnnotationSchema = z.object({
  mid: z.string().optional(),
  locale: z.string().optional(),
  description: z.string(),
  score: z.number(),
  confidence: z.number().optional(),
  topicality: z.number().optional(),
  boundingPoly: BoundingPolySchema.optional(),
});
export type EntityAnnotation = z.infer<typeof EntityAnnotationSchema>;

const AnalyzeImageInputSchema = z.object({
  imageDataUri: z.string().describe('The image file to analyze, as a data URI.'),
});
type AnalyzeImageInput = z.infer<typeof AnalyzeImageInputSchema>;

const AnalyzeImageOutputSchema = z.object({
  fullTextAnnotation: TextAnnotationSchema.nullable(),
  textAnnotations: z.array(EntityAnnotationSchema),
});
type AnalyzeImageOutput = z.infer<typeof AnalyzeImageOutputSchema>;

export async function analyzeImageForText(input: AnalyzeImageInput): Promise<AnalyzeImageOutput> {
    const visionClient = new ImageAnnotatorClient();
    const imageBuffer = Buffer.from(input.imageDataUri.split(',')[1], 'base64');
    
    try {
        const [result] = await visionClient.textDetection({
            image: { content: imageBuffer },
        });

        const fullTextAnnotation = result.fullTextAnnotation || null;
        const textAnnotations = result.textAnnotations || [];

        // Here you could add more processing, e.g., entity detection if needed
        
        return {
            fullTextAnnotation: fullTextAnnotation,
            textAnnotations: textAnnotations.slice(1) // First element is the full text, we want individual entities
        };

    } catch (error) {
        console.error('Google Cloud Vision API error:', error);
        throw new Error('Failed to analyze the image with the Vision API.');
    }
}
