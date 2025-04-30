
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-primary mb-6">Privacy Policy</h1>
        <div className="prose prose-lg max-w-none text-muted-foreground">
          <p>This is a placeholder for the Privacy Policy.</p>
          <p>Please replace this content with your actual Privacy Policy details.</p>
          <p>Information typically included:</p>
          <ul>
            <li>Types of data collected (personal identification, usage data, etc.)</li>
            <li>How data is collected (sign-up forms, cookies, AI interactions)</li>
            <li>How data is used (provide service, personalize experience, analytics, improve AI)</li>
            <li>Data sharing practices (third-party services like Google Cloud, AI providers)</li>
            <li>Data security measures</li>
            <li>User rights (access, correction, deletion)</li>
            <li>Cookie policy</li>
            <li>Compliance details (GDPR, CCPA, etc.)</li>
            <li>Contact information</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
      