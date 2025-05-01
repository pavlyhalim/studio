'use server';
/**
 * @fileOverview Generates a personalized study plan for students.
 *
 * - generateStudyPlan - A function that creates a study plan based on courses and goals.
 * - GenerateStudyPlanInput - The input type for the generateStudyPlan function.
 * - GenerateStudyPlanOutput - The return type for the generateStudyPlan function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

const CourseInfoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
});

const AssignmentInfoSchema = z.object({
    id: z.string(),
    title: z.string(),
    dueDate: z.string().describe("The due date of the assignment in ISO format."), // Use string for date simplicity in schema
    courseTitle: z.string().optional(),
});

const GenerateStudyPlanInputSchema = z.object({
  enrolledCourses: z.array(CourseInfoSchema).describe("List of courses the student is enrolled in."),
  upcomingAssignments: z.array(AssignmentInfoSchema).describe("List of upcoming assignments with due dates.").optional(),
  studentGoals: z.string().describe("Optional personal goals or areas the student wants to focus on.").optional(),
  timeframe: z.string().describe("The timeframe for the study plan (e.g., 'next week', 'next 3 days').").default("next week"),
});
export type GenerateStudyPlanInput = z.infer<typeof GenerateStudyPlanInputSchema>;

const StudyTaskSchema = z.object({
    day: z.string().describe("The day the task is suggested for (e.g., 'Monday', 'Day 1')."),
    tasks: z.array(z.string()).describe("List of specific study tasks for that day."),
});

const GenerateStudyPlanOutputSchema = z.object({
  planTitle: z.string().describe("A suitable title for the generated study plan."),
  suggestions: z.array(StudyTaskSchema).describe("A list of suggested tasks grouped by day or period."),
  generalTips: z.array(z.string()).describe("General study tips or advice based on the input.").optional(),
});
export type GenerateStudyPlanOutput = z.infer<typeof GenerateStudyPlanOutputSchema>;

export async function generateStudyPlan(input: GenerateStudyPlanInput): Promise<GenerateStudyPlanOutput> {
  // Convert Date objects to string format if needed before passing to the flow
  const processedInput = {
    ...input,
    // Ensure dates are strings if they were passed as Date objects
    upcomingAssignments: input.upcomingAssignments?.map(a => ({
        ...a,
        dueDate: typeof a.dueDate === 'string' ? a.dueDate : a.dueDate?.toISOString() ?? new Date().toISOString() // Handle potential Date object
    }))
  };
  return generateStudyPlanFlow(processedInput);
}

const prompt = ai.definePrompt({
  name: 'generateStudyPlanPrompt',
  input: {
    schema: GenerateStudyPlanInputSchema,
  },
  output: {
    schema: GenerateStudyPlanOutputSchema,
  },
  prompt: `You are an AI academic advisor. Create a personalized study plan for a student for the timeframe: {{{timeframe}}}.

Student's Enrolled Courses:
{{#each enrolledCourses}}
- {{title}}{{#if description}}: {{description}}{{/if}} (ID: {{id}})
{{/each}}

{{#if upcomingAssignments}}
Upcoming Assignments:
{{#each upcomingAssignments}}
- {{title}} (Course: {{courseTitle}}) - Due: {{dueDate}}
{{/each}}
{{/if}}

{{#if studentGoals}}
Student's Personal Goals: {{{studentGoals}}}
{{/if}}

Based on the courses, upcoming assignments (prioritize those due soonest), and the student's goals, generate a structured study plan.
Organize the plan into daily suggestions (e.g., Monday, Tuesday or Day 1, Day 2).
For each day, list specific, actionable tasks (e.g., "Review Chapter 3 of Quantum Physics", "Work on Problem Set 1", "Outline Astrobiology research paper"). Allocate reasonable time or focus for each task based on potential complexity and deadlines.

Also include a few general study tips relevant to the student's courses or goals.

Provide the output in the specified JSON format with fields: planTitle, suggestions (array of {day, tasks}), and optional generalTips. Ensure the 'suggestions' array contains concrete daily tasks.
`,
});

const generateStudyPlanFlow = ai.defineFlow<
  typeof GenerateStudyPlanInputSchema,
  typeof GenerateStudyPlanOutputSchema
>(
  {
    name: 'generateStudyPlanFlow',
    inputSchema: GenerateStudyPlanInputSchema,
    outputSchema: GenerateStudyPlanOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    // Basic validation or fallback
    if (!output?.suggestions || output.suggestions.length === 0) {
        return {
            planTitle: `Study Plan for ${input.timeframe}`,
            suggestions: [{ day: "General", tasks: ["Review course materials.", "Check assignment deadlines."] }],
            generalTips: ["Stay organized and manage your time effectively."]
        };
    }
    return output;
  }
);
