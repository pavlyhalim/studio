
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Wand2, AlertTriangle, BookOpen } from 'lucide-react';
import { generateStudyPlan, GenerateStudyPlanInput } from '@/ai/flows/generate-study-plan-flow';
import type { Course, Assignment } from '@/lib/sample-data'; // Import types
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface StudyPlannerDialogProps {
  enrolledCourses: Course[];
  upcomingAssignments?: Assignment[];
}

export function StudyPlannerDialog({ enrolledCourses, upcomingAssignments }: StudyPlannerDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [goals, setGoals] = useState('');
  const [timeframe, setTimeframe] = useState('next week'); // Default timeframe
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null); // Use 'any' for now, replace with GenerateStudyPlanOutput
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    setError(null);
    setPlan(null);

    const input: GenerateStudyPlanInput = {
      enrolledCourses: enrolledCourses.map(c => ({ id: c.id, title: c.title, description: c.description })),
      // Map assignments, ensuring dueDate is a string
       upcomingAssignments: upcomingAssignments?.map(a => ({
            id: a.id,
            title: a.title,
            dueDate: a.dueDate.toISOString(), // Convert Date to ISO string
            courseTitle: enrolledCourses.find(c => c.id === a.courseId)?.title ?? 'Unknown Course',
       })) ?? [],
      studentGoals: goals,
      timeframe: timeframe,
    };

    try {
      const result = await generateStudyPlan(input);
      setPlan(result);
      toast({ title: "Study Plan Generated!", description: "Your personalized plan is ready." });
    } catch (err) {
      console.error("Study Plan Generation Error:", err);
      setError("Failed to generate study plan. Please try again later.");
      toast({ title: "Error", description: "Could not generate study plan.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset state when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Delay reset slightly to allow closing animation
      setTimeout(() => {
          setGoals('');
          // setTimeframe('next week'); // Optionally reset timeframe
          setPlan(null);
          setError(null);
          setIsLoading(false);
      }, 300);
    }
    setIsOpen(open);
  };


  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
            <Wand2 className="mr-2 h-4 w-4" /> Open AI Study Planner
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary"/> AI Study Planner
          </DialogTitle>
          <DialogDescription>
            Generate a personalized study plan based on your courses and goals for the selected timeframe.
          </DialogDescription>
        </DialogHeader>

        {!plan && ( // Show input form only if no plan is generated yet
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="timeframe" className="text-right">
                        Timeframe
                    </Label>
                    {/* Simple input for demo, could be Select */}
                     <Input
                        id="timeframe"
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                        className="col-span-3"
                        placeholder="e.g., next week, next 3 days"
                    />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="goals" className="text-right pt-2">
                        Goals (Optional)
                    </Label>
                    <Textarea
                        id="goals"
                        value={goals}
                        onChange={(e) => setGoals(e.target.value)}
                        placeholder="e.g., Focus on Quantum Physics Chapter 3, Prepare for Astrobiology paper outline..."
                        className="col-span-3"
                        rows={3}
                    />
                </div>
                {error && (
                    <Alert variant="destructive" className="col-span-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Generating your plan...</p>
          </div>
        )}

        {plan && !isLoading && (
          <ScrollArea className="max-h-[400px] py-4 px-1">
            <h3 className="text-lg font-semibold mb-3">{plan.planTitle}</h3>
             <div className="space-y-4">
                {plan.suggestions.map((dayPlan: { day: string; tasks: string[] }, index: number) => (
                  <div key={index} className="p-3 border rounded-md bg-secondary/10">
                    <h4 className="font-medium mb-1">{dayPlan.day}</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {dayPlan.tasks.map((task, taskIndex) => (
                        <li key={taskIndex}>{task}</li>
                      ))}
                    </ul>
                  </div>
                ))}
             </div>
             {plan.generalTips && plan.generalTips.length > 0 && (
                <div className="mt-6 p-3 border border-dashed border-accent rounded-md bg-accent/5">
                    <h4 className="font-medium mb-1 text-accent">General Tips</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {plan.generalTips.map((tip: string, tipIndex: number) => (
                        <li key={tipIndex}>{tip}</li>
                      ))}
                    </ul>
                </div>
             )}
          </ScrollArea>
        )}

        <DialogFooter>
           {!plan && ( // Show Generate button only before plan is generated
               <Button onClick={handleGeneratePlan} disabled={isLoading || enrolledCourses.length === 0} className="w-full sm:w-auto">
                 {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                 Generate Plan
               </Button>
           )}
            {plan && ( // Show Generate New and Close buttons after plan is generated
                 <>
                    <Button variant="outline" onClick={() => setPlan(null)} className="w-full sm:w-auto">Generate New Plan</Button>
                    <Button onClick={() => handleOpenChange(false)} className="w-full sm:w-auto">Close</Button>
                 </>
            )}

        </DialogFooter>
         {enrolledCourses.length === 0 && !plan && !isLoading && (
            <Alert variant="default" className="mt-4 bg-secondary/30 border-secondary">
              <BookOpen className="h-4 w-4 text-secondary-foreground" />
              <AlertTitle className="text-secondary-foreground">No Courses Enrolled</AlertTitle>
              <AlertDescription className="text-secondary-foreground/80">
                You need to be enrolled in at least one course to generate a study plan.
              </AlertDescription>
            </Alert>
         )}
      </DialogContent>
    </Dialog>
  );
}
