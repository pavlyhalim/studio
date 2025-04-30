"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2, Upload } from 'lucide-react';
import { reviewAIResponse, ReviewAIResponseInput } from '@/ai/flows/professor-review-ai-responses'; // Import Genkit flow
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export function ProfessorDashboard() {
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [courseMaterial, setCourseMaterial] = useState('');
  const [reviewResult, setReviewResult] = useState<any>(null); // TODO: Use ReviewAIResponseOutput type
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const { toast } = useToast();

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !aiResponse || !courseMaterial) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields for the review.",
        variant: "destructive",
      });
      return;
    }

    setIsReviewing(true);
    setReviewError(null);
    setReviewResult(null);

    try {
      const input: ReviewAIResponseInput = { question, aiResponse, courseMaterial };
      const result = await reviewAIResponse(input);
      setReviewResult(result);
      toast({ title: "Review Complete", description: "AI analysis of the response is finished." });
    } catch (error) {
      console.error("AI Review Error:", error);
      setReviewError("Failed to review the AI response. Please try again.");
      toast({
        title: "Review Failed",
        description: "An error occurred during the AI review.",
        variant: "destructive",
      });
    } finally {
      setIsReviewing(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setUploadError(null);
      setUploadSuccess(null);
    } else {
      setSelectedFile(null);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    // TODO: Implement actual file upload logic here
    // This typically involves sending the file to a server endpoint or cloud storage
    console.log("Uploading file:", selectedFile.name, selectedFile.type);

    // Simulate upload process
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

    // Simulate success or failure
    const success = Math.random() > 0.3; // Simulate 70% success rate

    if (success) {
        setUploadSuccess(`File "${selectedFile.name}" uploaded successfully (simulated).`);
        toast({ title: "Upload Successful", description: `File "${selectedFile.name}" uploaded.` });
        setSelectedFile(null); // Clear file input after successful upload
        // Clear the file input visually if needed (requires managing input value or using a key)
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

    } else {
        setUploadError("File upload failed (simulated). Please try again.");
        toast({ title: "Upload Failed", variant: "destructive" });
    }

    setIsUploading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Professor Dashboard</h1>

      {/* Example Professor-Specific Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">List of courses taught...</p>
            {/* TODO: List courses the professor teaches */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Student Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Analytics placeholder...</p>
            {/* TODO: Display engagement analytics */}
          </CardContent>
        </Card>
      </div>

      {/* AI Response Review Section */}
      <Card>
        <CardHeader>
          <CardTitle>Review AI Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <Label htmlFor="question">Student Question</Label>
              <Textarea id="question" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Enter the student's question..." required />
            </div>
            <div>
              <Label htmlFor="aiResponse">AI Response</Label>
              <Textarea id="aiResponse" value={aiResponse} onChange={(e) => setAiResponse(e.target.value)} placeholder="Enter the AI's response..." required />
            </div>
            <div>
              <Label htmlFor="courseMaterial">Relevant Course Material</Label>
              <Textarea id="courseMaterial" value={courseMaterial} onChange={(e) => setCourseMaterial(e.target.value)} placeholder="Paste relevant course material/context..." required rows={5} />
            </div>
            {reviewError && (
                 <Alert variant="destructive">
                   <AlertTriangle className="h-4 w-4" />
                   <AlertTitle>Review Error</AlertTitle>
                   <AlertDescription>{reviewError}</AlertDescription>
                 </Alert>
             )}
            <Button type="submit" disabled={isReviewing} className="w-full">
              {isReviewing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Review Response with AI
            </Button>
          </form>

          {isReviewing && (
            <div className="mt-4 space-y-2">
                 <Skeleton className="h-4 w-1/4" />
                 <Skeleton className="h-4 w-1/2" />
                 <Skeleton className="h-4 w-3/4" />
            </div>
           )}

          {reviewResult && !isReviewing && (
            <div className="mt-6 space-y-3 rounded-md border p-4 bg-secondary/30">
               <h3 className="text-lg font-semibold text-primary">Review Results:</h3>
               <p><strong>Accurate:</strong> {reviewResult.isAccurate ? 'Yes' : 'No'}</p>
               <p><strong>Relevant:</strong> {reviewResult.isRelevant ? 'Yes' : 'No'}</p>
               <p><strong>Feedback:</strong> {reviewResult.feedback}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Upload Section */}
      <Card>
        <CardHeader>
            <CardTitle>Upload Course Materials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <Label htmlFor="file-upload">Select File</Label>
                <Input
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                />
                {selectedFile && <p className="text-sm text-muted-foreground mt-2">Selected: {selectedFile.name} ({ (selectedFile.size / 1024).toFixed(2)} KB)</p>}
            </div>

            {uploadError && (
                 <Alert variant="destructive">
                   <AlertTriangle className="h-4 w-4" />
                   <AlertTitle>Upload Error</AlertTitle>
                   <AlertDescription>{uploadError}</AlertDescription>
                 </Alert>
             )}
             {uploadSuccess && (
                 <Alert variant="default" className="bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700">
                   {/* Consider adding a CheckCircle icon */}
                   <AlertTitle>Upload Successful</AlertTitle>
                   <AlertDescription>{uploadSuccess}</AlertDescription>
                 </Alert>
             )}

             <Button onClick={handleFileUpload} disabled={isUploading || !selectedFile} className="w-full">
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {isUploading ? 'Uploading...' : 'Upload File'}
             </Button>
             <p className="text-xs text-muted-foreground text-center">(Upload functionality is currently simulated)</p>
        </CardContent>
      </Card>

      {/* Other professor-specific sections */}
      {/* e.g., Forum Management, Live Lecture Tools Control */}
       <Card>
        <CardHeader>
          <CardTitle>Forum Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Forum management tools placeholder...</p>
          {/* TODO: Implement Forum Management */}
        </CardContent>
      </Card>
    </div>
  );
}