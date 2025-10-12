
import { z } from 'zod';

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

export const AnalyzeImageInputSchema = z.object({
  imageDataUri: z.string().describe('The image file to analyze, as a data URI.'),
});
export type AnalyzeImageInput = z.infer<typeof AnalyzeImageInputSchema>;

export const AnalyzeImageOutputSchema = z.object({
  fullTextAnnotation: TextAnnotationSchema.nullable(),
  textAnnotations: z.array(EntityAnnotationSchema),
});
export type AnalyzeImageOutput = z.infer<typeof AnalyzeImageOutputSchema>;
