
"use client"; // Add 'use client' directive

import { Button } from "@/components/ui/button";
import Link from "next/link"; // Import Link
import { Rocket } from 'lucide-react'; // Import an icon

export function CallToActionSection() {
  return (
    <section className="py-24 md:py-32 bg-gradient-to-br from-primary via-primary/90 to-accent/80 text-primary-foreground"> {/* Enhanced gradient */}
      <div className="container mx-auto px-4 text-center">
        <Rocket className="h-12 w-12 text-secondary mx-auto mb-6 animate-bounce" /> {/* Added icon and animation */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"> {/* Increased font size */}
          Ready to Transform Your Learning?
        </h2>
        <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-3xl mx-auto"> {/* Increased bottom margin */}
          Join ALANT Lite today and experience the future of education. Sign up now or explore a demo to see how AI can enhance your studies or teaching.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
           {/* Placeholder button - replace onClick/href later */}
           <Button size="lg" variant="secondary" className="text-primary hover:bg-secondary/90 shadow-lg transform hover:scale-105 transition-transform duration-200" disabled>Sign Up Now</Button> {/* Keep Sign Up disabled for now, added effects */}
           {/* Link Request a Demo button to /contact */}
            <Link href="/contact" passHref legacyBehavior>
              <Button
                size="lg"
                variant="outline" // Changed back to outline for contrast
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary shadow-md transform hover:scale-105 transition-transform duration-200" // Added effects
              >
                Request a Demo
              </Button>
            </Link>
        </div>
      </div>

      {/* Keyframes for bounce animation */}
       <style jsx global>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(-15%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
          50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
        }
        .animate-bounce { animation: bounce 1.5s infinite; }
      `}</style>
    </section>
  );
}
