
'use server';

/**
 * @fileOverview An AI agent for recognizing and analyzing text within an image.
 * - analyzeImageForText - Detects text and entities from an image data URI.
 */

import { z } from 'zod';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { 
    AnalyzeImageInputSchema,
    AnalyzeImageOutputSchema,
    type AnalyzeImageInput,
    type AnalyzeImageOutput
} from './text-recognizer.types';


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
