'use server';

/**
 * @fileOverview Allows professors to review AI-generated content and answers provided to students.
 *
 * - reviewAIResponse - A function that handles the AI response review process.
 * - ReviewAIResponseInput - The input type for the reviewAIResponse function.
 * - ReviewAIResponseOutput - The return type for the reviewAIResponse function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ReviewAIResponseInputSchema = z.object({
  question: z.string().describe('The question asked by the student.'),
  aiResponse: z.string().describe('The AI-generated response to the question.'),
  courseMaterial: z.string().describe('Relevant course material for context.'),
});
export type ReviewAIResponseInput = z.infer<typeof ReviewAIResponseInputSchema>;

const ReviewAIResponseOutputSchema = z.object({
  isAccurate: z.boolean().describe('Whether the AI response is accurate and correct.'),
  isRelevant: z.boolean().describe('Whether the AI response is relevant to the question and course material.'),
  feedback: z.string().describe('Feedback for improving the AI response.'),
});
export type ReviewAIResponseOutput = z.infer<typeof ReviewAIResponseOutputSchema>;

export async function reviewAIResponse(input: ReviewAIResponseInput): Promise<ReviewAIResponseOutput> {
  return reviewAIResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reviewAIResponsePrompt',
  input: {
    schema: z.object({
      question: z.string().describe('The question asked by the student.'),
      aiResponse: z.string().describe('The AI-generated response to the question.'),
      courseMaterial: z.string().describe('Relevant course material for context.'),
    }),
  },
  output: {
    schema: z.object({
      isAccurate: z.boolean().describe('Whether the AI response is accurate and correct.'),
      isRelevant: z.boolean().describe('Whether the AI response is relevant to the question and course material.'),
      feedback: z.string().describe('Feedback for improving the AI response.'),
    }),
  },
  prompt: `You are an expert professor reviewing AI-generated responses to student questions.

  Based on the student's question and the relevant course material, assess the accuracy and relevance of the AI's response.

  Provide feedback on how the AI response could be improved.

  Course Material: {{{courseMaterial}}}
  Question: {{{question}}}
  AI Response: {{{aiResponse}}}`,
});

const reviewAIResponseFlow = ai.defineFlow<
  typeof ReviewAIResponseInputSchema,
  typeof ReviewAIResponseOutputSchema
>({
  name: 'reviewAIResponseFlow',
  inputSchema: ReviewAIResponseInputSchema,
  outputSchema: ReviewAIResponseOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
