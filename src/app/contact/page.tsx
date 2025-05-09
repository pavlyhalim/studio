"use client";

import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Mail } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-primary mb-8 text-center">Contact Us</h1>
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-accent" />
                <span>Get in Touch</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center py-10">
              <p className="text-lg mb-6">
                Have questions or need assistance? Feel free to email us at:
              </p>
              <Link 
                href="mailto:support@alantlite.example.com" 
                className="text-xl font-semibold text-accent hover:underline"
              >
                support@alantlite.example.com
              </Link>
              <p className="mt-6 text-sm text-muted-foreground">
                We strive to respond to all inquiries within 24-48 hours.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}