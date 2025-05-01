"use client";

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, User as UserIcon, AlertTriangle, Sparkles } from 'lucide-react';
import { studentAIQueryWithToolSelector } from '@/ai/flows/ai-query-tool-selector';
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
        id: 'initial-ai-greeting',
        text: 'Hello! Ask me anything about your course. Please note: Login is required to save chat history or use personalized features.',
        sender: 'ai',
        timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user, loading: authLoading } = useAuth(); // Get simplified user object and loading state

  const isLoggedIn = !!user; // Check if user object exists

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      setTimeout(() => {
         if(scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
         }
      }, 0);
    }
  }, [messages]);


  const handleSend = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    const text = input.trim();
    // Updated check: only prevent if not logged in, loading, or no input
    if (!isLoggedIn || !text || isLoading || authLoading) return;

    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await studentAIQueryWithToolSelector({ query: text });

      const aiMessage: Message = {
        id: Date.now().toString() + '-ai',
        text: response.answer,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Query Error:", error);
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        text: "Sorry, I encountered an error processing your request. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      document.getElementById('chat-input')?.focus();
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl border border-border/50 overflow-hidden">
      <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-accent/5">
        <CardTitle className="flex items-center gap-2 text-primary font-semibold">
          <Sparkles className="h-6 w-6 text-accent" />
          AI Q&A Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
         <ScrollArea className="h-[450px] p-4 space-y-6 bg-background" viewportRef={scrollAreaRef}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end gap-3 ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender === 'ai' && (
                <Avatar className="h-8 w-8 border border-primary/20 shadow-sm mb-1">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    <Bot size={16} />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`rounded-xl p-3 max-w-[80%] shadow-md ${
                  message.sender === 'user'
                    ? 'bg-accent text-accent-foreground rounded-br-none'
                    : 'bg-secondary text-secondary-foreground rounded-bl-none'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                 <p className="text-xs text-right mt-1.5 opacity-60">
                   {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </p>
              </div>
              {message.sender === 'user' && !authLoading && user && ( // Use user.name from SimpleUser
                <Avatar className="h-8 w-8 border border-accent/50 shadow-sm mb-1">
                  {/* Removed AvatarImage */}
                  <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                      {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
              )}
               {message.sender === 'user' && (authLoading || !user) && ( // Still show generic if no user or loading
                 <Avatar className="h-8 w-8 border border-muted shadow-sm mb-1">
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        <UserIcon size={16} />
                    </AvatarFallback>
                 </Avatar>
               )}
            </div>
          ))}
           {isLoading && (
             <div className="flex items-end gap-3 justify-start">
               <Avatar className="h-8 w-8 border border-primary/20 shadow-sm mb-1">
                 <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                   <Bot size={16} />
                 </AvatarFallback>
               </Avatar>
               <div className="rounded-xl p-3 bg-secondary text-secondary-foreground shadow-md rounded-bl-none space-y-1.5">
                  <Skeleton className="h-3 w-16 bg-secondary-foreground/30" />
                  <Skeleton className="h-3 w-12 bg-secondary-foreground/30" />
                </div>
             </div>
           )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4 flex flex-col items-start gap-3 bg-secondary/10">
         {!isLoggedIn && !authLoading && (
            <Alert variant="default" className="w-full bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 shadow-sm">
              <AlertTriangle className="h-4 w-4 text-yellow-700 dark:text-yellow-400" />
              <AlertTitle className="text-yellow-800 dark:text-yellow-300">Login Required</AlertTitle>
              <AlertDescription className="text-yellow-700 dark:text-yellow-400/80">
                Please log in to send messages and interact with the AI assistant.
              </AlertDescription>
            </Alert>
          )}
        <form onSubmit={handleSend} className="flex w-full items-center space-x-2">
          <Input
            id="chat-input"
            placeholder={isLoggedIn ? "Ask the AI assistant..." : "Please log in to chat"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || authLoading || !isLoggedIn} // Disable if loading or not logged in
            className="flex-1 bg-background shadow-inner focus-visible:ring-accent"
            autoComplete="off"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim() || authLoading || !isLoggedIn} // Also disable if not logged in
            aria-label="Send message"
            className="bg-accent hover:bg-accent/90 shadow-md transform active:scale-95 transition-transform"
            >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
