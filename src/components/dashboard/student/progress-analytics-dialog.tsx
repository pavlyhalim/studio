
"use client";

import { useState, useMemo } from 'react';
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
import { BarChart, BarChart2, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Import CardDescription
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Grade, Assignment, Course } from '@/lib/sample-data'; // Import types
import { format } from 'date-fns';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"; // Assuming chart components exist
import { Bar, CartesianGrid, XAxis, YAxis, LabelList, ResponsiveContainer, BarChart as RechartsBarChart } from "recharts"; // Example using Recharts

interface ProgressAnalyticsDialogProps {
  grades: Grade[];
  assignments: Assignment[]; // Needed to map grades to assignments
  enrolledCourses: Course[]; // Needed to map grades to courses
}

const chartConfig = {
  score: {
    label: "Score (%)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig; // Assuming ChartConfig type exists from chart component

export function ProgressAnalyticsDialog({ grades, assignments, enrolledCourses }: ProgressAnalyticsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const gradeData = useMemo(() => {
    return grades.map(grade => {
        const assignment = assignments.find(a => a.id === grade.assignmentId);
        const course = enrolledCourses.find(c => c.id === grade.courseId);
        const percentage = grade.maxScore > 0 ? Math.round((grade.score / grade.maxScore) * 100) : 0;
        return {
            ...grade,
            assignmentTitle: assignment?.title ?? 'Unknown Assignment',
            courseTitle: course?.title ?? 'Unknown Course',
            percentage: percentage,
            gradedDateFormatted: format(grade.gradedDate, 'PP'),
             // Determine badge variant based on percentage
            variant: percentage >= 80 ? "success" : percentage >= 60 ? "secondary" : "destructive" as "success" | "secondary" | "destructive" | "default" | "outline" | null | undefined,
        };
    }).sort((a, b) => a.gradedDate.getTime() - b.gradedDate.getTime()); // Sort chronologically for chart
  }, [grades, assignments, enrolledCourses]);


  // Calculate overall average percentage
  const overallAverage = useMemo(() => {
    if (gradeData.length === 0) return 0;
    const totalPercentage = gradeData.reduce((sum, grade) => sum + grade.percentage, 0);
    return Math.round(totalPercentage / gradeData.length);
  }, [gradeData]);

    // Prepare data for the chart (using assignment titles, could be shortened)
  const chartData = useMemo(() => {
     return gradeData.map(grade => ({
         name: grade.assignmentTitle, // Use assignment title for X-axis
         score: grade.percentage,
         fill: `hsl(var(--chart-${(grade.percentage % 5) + 1}))` // Example coloring based on score range
     }));
  }, [gradeData]);

   const averageVariant: "success" | "secondary" | "destructive" | "outline" = overallAverage >= 80 ? "success" : overallAverage >= 60 ? "secondary" : "destructive";


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
            <BarChart2 className="mr-2 h-4 w-4" /> View Analytics
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]"> {/* Wider dialog */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
             <TrendingUp className="h-5 w-5 text-primary"/> My Progress Analytics
          </DialogTitle>
          <DialogDescription>
            Overview of your performance and grades across enrolled courses.
          </DialogDescription>
        </DialogHeader>

         {gradeData.length === 0 ? (
             <Alert variant="default" className="my-6 bg-secondary/30 border-secondary">
                <AlertTriangle className="h-4 w-4 text-secondary-foreground"/>
                <AlertTitle className="text-secondary-foreground">No Grade Data</AlertTitle>
                <AlertDescription className="text-secondary-foreground/80">
                    There are no grades recorded yet to display analytics.
                </AlertDescription>
             </Alert>
         ) : (
             <div className="grid gap-6 py-4">
                {/* Overall Average */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Overall Average</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-baseline gap-2">
                        <span className={`text-4xl font-bold text-${averageVariant === 'success' ? 'green' : averageVariant === 'secondary' ? 'yellow' : 'red'}-600 dark:text-${averageVariant === 'success' ? 'green' : averageVariant === 'secondary' ? 'yellow' : 'red'}-400`}>{overallAverage}%</span>
                        <span className="text-sm text-muted-foreground">across {gradeData.length} graded assignments</span>
                    </CardContent>
                </Card>


                 {/* Grade Chart */}
                 <Card className="shadow-sm">
                    <CardHeader>
                         <CardTitle className="text-lg">Grade Distribution</CardTitle>
                         <CardDescription>Performance on recent assignments.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ChartContainer config={chartConfig} className="h-[250px] w-full">
                           <RechartsBarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}> {/* Adjust margins */}
                             <CartesianGrid vertical={false} strokeDasharray="3 3" />
                             <XAxis
                                dataKey="name"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                // interval={0} // Show all labels if space allows
                                // angle={-30} // Angle labels if needed
                                // textAnchor="end"
                             />
                              <YAxis
                                domain={[0, 100]}
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                label={{ value: 'Score (%)', angle: -90, position: 'insideLeft', offset: -10, style: { textAnchor: 'middle', fontSize: 12, fill: 'hsl(var(--muted-foreground))' } }} // Add Y-axis label
                             />
                             <ChartTooltip
                               cursor={false}
                               content={<ChartTooltipContent indicator="dot" />}
                             />
                             <Bar dataKey="score" radius={4}>
                                <LabelList position="top" offset={5} fontSize={10} fill="hsl(var(--foreground))" />
                             </Bar>
                           </RechartsBarChart>
                         </ChartContainer>
                    </CardContent>
                 </Card>


                {/* Detailed Grades Table */}
                 <Card className="shadow-sm">
                    <CardHeader>
                         <CardTitle className="text-lg">Detailed Grades</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <ScrollArea className="h-[250px] border rounded-md">
                           <Table>
                                <TableHeader>
                                    <TableRow>
                                    <TableHead>Assignment</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Graded Date</TableHead>
                                    <TableHead className="text-right">Score (%)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {gradeData.map((grade) => (
                                    <TableRow key={grade.id}>
                                        <TableCell className="font-medium truncate max-w-[150px]" title={grade.assignmentTitle}>{grade.assignmentTitle}</TableCell>
                                        <TableCell className="truncate max-w-[150px]" title={grade.courseTitle}>{grade.courseTitle}</TableCell>
                                        <TableCell>{grade.gradedDateFormatted}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={grade.variant}>{grade.percentage}%</Badge>
                                        </TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                           </Table>
                         </ScrollArea>
                    </CardContent>
                 </Card>
             </div>
         )}


        <DialogFooter>
          <Button onClick={() => setIsOpen(false)} className="w-full sm:w-auto">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Define ChartConfig if it's not imported/available globally
// This is a basic structure based on ShadCN charts example
type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<string, string> } // Simplified theme for example
  )
}

