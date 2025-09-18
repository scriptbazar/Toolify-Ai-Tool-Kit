
import { z } from 'zod';

export const AiCodeAssistantInputSchema = z.object({
  code: z.string().describe('The code snippet to be analyzed.'),
});
export type AiCodeAssistantInput = z.infer<typeof AiCodeAssistantInputSchema>;

const ImprovementSuggestionSchema = z.object({
  title: z.string().describe('A brief title for the improvement.'),
  description: z.string().describe('A short explanation of why this change is an improvement.'),
  before: z.string().describe('A code snippet showing the original code.'),
  after: z.string().describe('A code snippet showing the suggested improved code.'),
});

export const AiCodeAssistantOutputSchema = z.object({
  language: z.object({
      detected: z.string().describe('A comma-separated list of all detected programming languages.'),
      count: z.number().describe('The total number of unique languages detected.'),
  }).describe('The detected programming languages and their count.'),
  summary: z
    .string()
    .describe('A concise summary of what the code does.'),
  explanation: z
    .string()
    .describe('A step-by-step explanation of how the code works, formatted in Markdown.'),
  performance: z.object({
      timeComplexity: z.string().describe("The Big O notation for time complexity (e.g., O(n), O(n^2))."),
      spaceComplexity: z.string().describe("The Big O notation for space complexity (e.g., O(1), O(n))."),
      explanation: z.string().describe("A brief explanation of the performance analysis."),
  }).describe('An analysis of the code\'s performance.'),
  security: z.object({
      vulnerabilities: z.array(z.object({
          type: z.string().describe("The type of vulnerability (e.g., SQL Injection, XSS)."),
          risk: z.string().describe("A brief explanation of the associated risk."),
      })).describe('A list of potential security vulnerabilities found in the code.'),
      summary: z.string().describe('A summary of the security findings.'),
  }).describe('An analysis of the code\'s security.'),
  improvements: z
    .array(ImprovementSuggestionSchema)
    .describe(
      'A list of actionable suggestions for improving the code, including before and after snippets.'
    ),
});
export type AiCodeAssistantOutput = z.infer<typeof AiCodeAssistantOutputSchema>;
