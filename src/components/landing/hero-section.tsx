
import { Button } from "@/components/ui/button";
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-primary">
            Unlock Your Potential with AI-Powered Learning
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            ALANT Lite leverages cutting-edge AI to provide personalized study plans, instant answers, and enhanced course materials. Elevate your learning experience today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
             {/* Placeholder buttons - replace onClick/href later */}
            <Button size="lg" variant="default" className="bg-accent hover:bg-accent/90">Get Started</Button>
            <Button size="lg" variant="outline">Learn More</Button>
          </div>
        </div>
        <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl">
           <Image
              src="https://picsum.photos/1280/720"
              alt="AI Learning Platform Illustration"
              layout="fill"
              objectFit="cover"
              data-ai-hint="artificial intelligence learning education technology"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>
      </div>
    </section>
  );
}
