
"use client"; // Add 'use client' directive

import { Button } from "@/components/ui/button";
import Image from 'next/image';
import Link from 'next/link'; // Import Link
import { ArrowRight } from 'lucide-react'; // Import an icon

export function HeroSection() {
  return (
    <section className="py-24 md:py-36 lg:py-40 bg-gradient-to-b from-secondary/20 via-background to-background"> {/* Smoother gradient */}
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-16 items-center"> {/* Increased gap */}
        <div className="space-y-8 text-center md:text-left animate-fade-in-left"> {/* Added animation class */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-primary leading-tight"> {/* Tighter tracking, leading */}
            Unlock Your Potential with AI-Powered Learning
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0">
            ALANT Lite leverages cutting-edge AI to provide personalized study plans, instant answers, and enhanced course materials. Elevate your learning experience today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
             {/* Link 'Get Started' button to dashboard */}
            <Link href="/dashboard" passHref legacyBehavior>
               {/* Enhanced button styling */}
               <Button size="lg" variant="default" className="bg-accent hover:bg-accent/90 shadow-lg transform hover:scale-105 transition-transform duration-200 group">
                   Get Started <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
               </Button>
            </Link>
            {/* Link Learn More button to features section */}
            <Link href="#features" passHref legacyBehavior>
                <Button size="lg" variant="outline" className="shadow-md transform hover:scale-105 transition-transform duration-200">Learn More</Button>
            </Link>
          </div>
        </div>
        <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl animate-fade-in-right"> {/* Added animation, larger radius, more shadow */}
           <Image
              src="https://picsum.photos/seed/alant-hero/1280/720" // Seeded image for consistency
              alt="Student using futuristic AI learning interface" // More descriptive alt text
              fill // Use fill instead of layout
              className="object-cover" // Use Tailwind class for object-fit
              data-ai-hint="futuristic education technology ai student learning interface" // Updated hint
              priority // Add priority for LCP optimization
            />
             {/* Subtle overlay */}
             <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent"></div>
        </div>
      </div>

      {/* Basic keyframes for animation (add to globals.css or keep here if scoped CSS is used) */}
      <style jsx global>{`
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in-left { animation: fadeInLeft 0.8s ease-out forwards; }
        .animate-fade-in-right { animation: fadeInRight 0.8s ease-out forwards; }
      `}</style>
    </section>
  );
}
