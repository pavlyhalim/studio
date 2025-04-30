
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-primary mb-6">Terms of Service</h1>
         <div className="prose prose-lg max-w-none text-muted-foreground">
          <p>This is a placeholder for the Terms of Service.</p>
          <p>Please replace this content with your actual Terms of Service.</p>
          <p>Information typically included:</p>
          <ul>
            <li>Acceptance of terms</li>
            <li>Description of the service</li>
            <li>User accounts and responsibilities (Students, Professors, Admins)</li>
            <li>Acceptable use policy</li>
            <li>Intellectual property rights (user content, platform content)</li>
            <li>AI usage terms (limitations, accuracy disclaimers)</li>
            <li>Payment terms (if applicable)</li>
            <li>Termination of service</li>
            <li>Disclaimers of warranties</li>
            <li>Limitation of liability</li>
            <li>Governing law</li>
            <li>Changes to terms</li>
            <li>Contact information</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
      