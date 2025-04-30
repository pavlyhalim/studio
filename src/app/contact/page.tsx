
"use client"; // Add "use client" directive

import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast'; // Import useToast

export default function ContactPage() {
  const { toast } = useToast(); // Get toast function

  // Placeholder form submission handler
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: Implement actual form submission logic (e.g., send email, save to DB)
    console.log("Form submitted (placeholder). Data:", new FormData(event.currentTarget as HTMLFormElement));
    toast({
        title: "Message Sent (Placeholder)",
        description: "Thank you for contacting us! We'll get back to you soon.",
    });
    // Optionally reset the form
    (event.target as HTMLFormElement).reset();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-primary mb-8 text-center">Contact Us</h1>
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" placeholder="Your Name" required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="your.email@example.com" required />
                </div>
                 <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" name="subject" placeholder="Subject of your message" required />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" name="message" placeholder="Your message..." required rows={5} />
                </div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Send Message</Button>
              </form>
            </CardContent>
          </Card>
          <div className="mt-8 text-center text-muted-foreground">
              <p>Alternatively, you can reach us at:</p>
              <p>Email: <a href="mailto:support@alantlite.example.com" className="text-accent hover:underline">support@alantlite.example.com</a></p>
              {/* Add phone number or address if applicable */}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
