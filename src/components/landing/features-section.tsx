
import { FeatureCard } from "./feature-card";
import { Bot, BookOpen, BarChart, Users, Presentation } from 'lucide-react'; // Example icons

export function FeaturesSection() {
  const features = [
    {
      icon: Bot,
      title: "AI Q&A Chatbot",
      description: "Get instant answers to your course-related questions, powered by advanced AI.",
    },
    {
      icon: BookOpen,
      title: "Smart Study Planner",
      description: "Organize your learning schedule with an AI-driven planner tailored to your needs.",
    },
    {
      icon: Presentation,
      title: "Live Lecture Tools",
      description: "Access real-time transcriptions and AI-generated notes during lectures.",
    },
     {
      icon: Users,
      title: "Interactive Forums",
      description: "Engage in discussions with peers and professors within dedicated course forums.",
    },
    {
      icon: BarChart,
      title: "Engagement Analytics",
      description: "Professors can track student progress and engagement with insightful analytics.",
    },
     {
      icon: Users, // Reusing icon for Manage Users
      title: "Role-Based Access",
      description: "Secure platform access tailored for Students, Professors, and Administrators.",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 bg-background scroll-mt-16"> {/* Added id and scroll-mt */}
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-12">
          Powerful Features for Enhanced Learning
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

