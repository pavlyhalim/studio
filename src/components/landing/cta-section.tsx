
import { Button } from "@/components/ui/button";
import Link from "next/link"; // Import Link

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
           {/* Placeholder button - replace onClick/href later */}
           <Button size="lg" variant="secondary" className="text-primary hover:bg-secondary/90" disabled>Sign Up Now</Button> {/* Keep Sign Up disabled for now */}
           {/* Link Request a Demo button to /contact */}
            <Link href="/contact" passHref legacyBehavior>
              <Button
                size="lg"
                variant="ghost" // Changed from outline
                className="border border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" // Updated classes for visibility
              >
                Request a Demo
              </Button>
            </Link>
        </div>
      </div>
    </section>
  );
}
