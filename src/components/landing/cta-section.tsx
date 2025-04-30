
import { Button } from "@/components/ui/button";

export function CallToActionSection() {
  return (
    <section className="py-20 md:py-28 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Transform Your Learning?
        </h2>
        <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-3xl mx-auto">
          Join ALANT Lite today and experience the future of education. Sign up now or explore a demo to see how AI can enhance your studies or teaching.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
           {/* Placeholder buttons - replace onClick/href later */}
          <Button size="lg" variant="secondary" className="text-primary hover:bg-secondary/90">Sign Up Now</Button>
          <Button size="lg" variant="outline" className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">Request a Demo</Button>
        </div>
      </div>
    </section>
  );
}
