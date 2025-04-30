'use server';
/**
 * @fileOverview An AI-powered Q&A chatbot flow with tool selection for students.
 *
 * - studentAIQueryWithToolSelector - A function that handles student queries using AI and external tools.
 * - StudentAIQueryWithToolSelectorInput - The input type for the studentAIQueryWithToolSelector function.
 * - StudentAIQueryWithToolSelectorOutput - The return type for the studentAIQueryWithToolSelector function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GetExternalKnowledgeInputSchema = z.object({
  query: z.string().describe('The query to use to search for external knowledge.'),
});

const GetExternalKnowledgeOutputSchema = z.string().describe('The external knowledge found.');

const getExternalKnowledge = ai.defineTool(
  {
    name: 'getExternalKnowledge',
    description: 'Retrieves external knowledge based on a query.',
    inputSchema: GetExternalKnowledgeInputSchema,
    outputSchema: GetExternalKnowledgeOutputSchema,
  },
  async input => {
    // TODO: Implement the actual external knowledge retrieval logic here.
    // This is a placeholder implementation.
    return `External knowledge for query: ${input.query}`;
  }
);

const StudentAIQueryWithToolSelectorInputSchema = z.object({
  query: z.string().describe('The student question.'),
});
export type StudentAIQueryWithToolSelectorInput = z.infer<
  typeof StudentAIQueryWithToolSelectorInputSchema
>;

const StudentAIQueryWithToolSelectorOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the student question.'),
});
export type StudentAIQueryWithToolSelectorOutput = z.infer<
  typeof StudentAIQueryWithToolSelectorOutputSchema
>;

export async function studentAIQueryWithToolSelector(
  input: StudentAIQueryWithToolSelectorInput
): Promise<StudentAIQueryWithToolSelectorOutput> {
  return studentAIQueryWithToolSelectorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'studentAIQueryWithToolSelectorPrompt',
  tools: [getExternalKnowledge],
  input: {
    schema: z.object({
      query: z.string().describe('The student question.'),
    }),
  },
  output: {
    schema: z.object({
      answer: z.string().describe('The AI-generated answer to the student question.'),
    }),
  },
  system: `You are an AI Q&A chatbot for students. Use the getExternalKnowledge tool if the student question requires external knowledge to provide a comprehensive answer.`,
  prompt: `{{query}}`,
});

const studentAIQueryWithToolSelectorFlow = ai.defineFlow<
  typeof StudentAIQueryWithToolSelectorInputSchema,
  typeof StudentAIQueryWithToolSelectorOutputSchema
>({
  name: 'studentAIQueryWithToolSelectorFlow',
  inputSchema: StudentAIQueryWithToolSelectorInputSchema,
  outputSchema: StudentAIQueryWithToolSelectorOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
