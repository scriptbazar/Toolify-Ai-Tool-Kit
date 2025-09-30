
'use server';

/**
 * @fileOverview An AI agent that extracts text from an image using Google Cloud Vision.
 * This provides more detailed and accurate OCR than a standard Gemini prompt.
 */

import { z } from 'zod';
import { ImageAnnotatorClient } from '@google-cloud/vision';

// --- Input Schema ---
const AnalyzeImageInputSchema = z.object({
  imageDataUri: z.string().describe("The image to analyze, as a Base64 data URI."),
});
export type AnalyzeImageInput = z.infer<typeof AnalyzeImageInputSchema>;

// --- Output Schemas (simplified from Vision API response for clarity) ---
const VertexSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const BoundingPolySchema = z.object({
  vertices: z.array(VertexSchema),
});

const DetectedLanguageSchema = z.object({
  languageCode: z.string(),
  confidence: z.number(),
});

const TextPropertySchema = z.object({
  detectedLanguages: z.array(DetectedLanguageSchema).optional(),
});

const SymbolSchema = z.object({
  property: TextPropertySchema.optional(),
  boundingBox: BoundingPolySchema,
  text: z.string(),
  confidence: z.number(),
});

const WordSchema = z.object({
  property: TextPropertySchema.optional(),
  boundingBox: BoundingPolySchema,
  symbols: z.array(SymbolSchema),
  confidence: z.number(),
});

const ParagraphSchema = z.object({
  property: TextPropertySchema.optional(),
  boundingBox: BoundingPolySchema,
  words: z.array(WordSchema),
  confidence: z.number(),
});

const BlockSchema = z.object({
  property: TextPropertySchema.optional(),
  boundingBox: BoundingPolySchema,
  paragraphs: z.array(ParagraphSchema),
  blockType: z.string(), // e.g., 'TEXT', 'TABLE', 'PICTURE'
  confidence: z.number(),
});

const PageSchema = z.object({
  property: TextPropertySchema.optional(),
  width: z.number(),
  height: z.number(),
  blocks: z.array(BlockSchema),
  confidence: z.number(),
});

const FullTextAnnotationSchema = z.object({
  pages: z.array(PageSchema),
  text: z.string(),
});
export type TextAnnotation = z.infer<typeof FullTextAnnotationSchema>;

const AnalyzeImageOutputSchema = z.object({
  fullTextAnnotation: FullTextAnnotationSchema.nullable(),
});
export type AnalyzeImageOutput = z.infer<typeof AnalyzeImageOutputSchema>;

// --- Server Action ---
export async function analyzeImageForText(input: AnalyzeImageInput): Promise<AnalyzeImageOutput> {
  try {
    const { imageDataUri } = AnalyzeImageInputSchema.parse(input);
    
    // Extract base64 content from the data URI
    const base64EncodedImageString = imageDataUri.split(',')[1];
    if (!base64EncodedImageString) {
      throw new Error('Invalid image data URI format.');
    }

    const client = new ImageAnnotatorClient({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });

    const request = {
      image: {
        content: base64EncodedImageString,
      },
      features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
    };

    const [result] = await client.documentTextDetection(request);
    
    // The result from the Vision API is massive and complex.
    // We parse it with our Zod schema to ensure type safety and strip out unnecessary fields.
    const validation = AnalyzeImageOutputSchema.safeParse(result);
    
    if (!validation.success) {
      console.error("Vision API response validation error:", validation.error);
      throw new Error("Received invalid data from Vision API.");
    }
    
    return validation.data;

  } catch (error: any) {
    console.error('Vision API error:', error);
    // Provide a more user-friendly error message
    if (error.message.includes('INVALID_ARGUMENT')) {
      throw new Error('The uploaded image is invalid or corrupted.');
    }
    throw new Error('Failed to analyze image with Vision API.');
  }
}
