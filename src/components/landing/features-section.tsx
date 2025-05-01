
import { FeatureCard } from "./feature-card";
import { Bot, BookOpen, BarChart, Users, Presentation, BrainCircuit } from 'lucide-react'; // Added BrainCircuit

export function FeaturesSection() {
  const features = [
    {
      icon: BrainCircuit, // Changed icon
      title: "AI-Powered Q&A", // Adjusted title
      description: "Get instant, context-aware answers to your course-related questions.", // Adjusted description
    },
    {
      icon: BookOpen,
      title: "Smart Study Planner",
      description: "Organize your learning schedule with an AI-driven planner tailored to your courses and goals.", // Adjusted description
    },
    {
      icon: Presentation,
      title: "Live Lecture Tools",
      description: "Access real-time transcriptions and AI-generated summaries during lectures (future feature).", // Clarified feature status
    },
     {
      icon: Users,
      title: "Interactive Forums",
      description: "Engage in discussions with peers and professors within dedicated course forums (future feature).", // Clarified feature status
    },
    {
      icon: BarChart,
      title: "Progress Analytics", // Changed title
      description: "Visualize your grades and track performance across all your enrolled courses.", // Adjusted description
    },
     {
      icon: Users, // Reusing icon for Manage Users
      title: "Role-Based Dashboards", // Changed title
      description: "Secure platform access tailored for Students, Professors, and Administrators.",
    },
  ];

  return (
    <section id="features" className="py-24 md:py-32 bg-background scroll-mt-16"> {/* Adjusted padding */}
      <div className="container mx-auto px-4">
        <div className="text-center mb-16"> {/* Increased bottom margin */}
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Powerful Features for Enhanced Learning
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore the tools designed to streamline your academic journey and boost your understanding.
            </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="transform transition-transform duration-300 hover:scale-105"> {/* Added hover effect wrapper */}
                <FeatureCard
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
