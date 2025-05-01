
import Link from 'next/link';
import { GraduationCap } from 'lucide-react'; // Import icon

export function Footer() {
  return (
    <footer className="bg-background/95 border-t border-border/50 py-8"> {/* Subtle background, lighter border */}
      <div className="container mx-auto px-4 text-center text-muted-foreground">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
           <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-accent" />
                <span className="text-sm">&copy; {new Date().getFullYear()} ALANT Lite. All rights reserved.</span>
           </div>
          <div className="flex space-x-6">
            <Link href="/privacy" className="text-sm hover:text-primary hover:underline transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-sm hover:text-primary hover:underline transition-colors">Terms of Service</Link>
            <Link href="/contact" className="text-sm hover:text-primary hover:underline transition-colors">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
