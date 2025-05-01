
import type { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="text-center h-full shadow-lg hover:shadow-xl transition-shadow duration-300 border border-transparent hover:border-primary/20 bg-gradient-to-br from-background to-secondary/5"> {/* Added gradient, hover border */}
      <CardHeader className="items-center p-6"> {/* Adjusted padding */}
        {/* Enhanced Icon Styling */}
        <div className="p-4 bg-primary/10 rounded-full mb-4 inline-block ring-4 ring-primary/5 transition-all duration-300 group-hover:ring-primary/10">
           <Icon className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
        </div>
        <CardTitle className="text-xl font-semibold text-primary mb-2">{title}</CardTitle> {/* Added margin */}
        <CardDescription className="text-muted-foreground leading-relaxed">{description}</CardDescription> {/* Improved leading */}
      </CardHeader>
    </Card>
  );
}
