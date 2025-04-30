
"use client";

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, User as UserIcon } from 'lucide-react';
import { studentAIQueryWithToolSelector } from '@/ai/flows/ai-query-tool-selector'; // Import the Genkit flow
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import { Skeleton } from "@/components/ui/skeleton";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user, loading: authLoading } = useAuth(); // Get user and auth loading state

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    if (scrollAreaRef.current) {
      // Use scrollHeight to get the total height of the content
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);


  const handleSend = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault(); // Prevent default form submission if event exists
    const text = input.trim();
    if (!text || isLoading || authLoading) return; // Prevent sending if loading or user not loaded

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
      // Call the Genkit flow
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
        text: "Sorry, I encountered an error. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Ensure input focus after sending/receiving
      document.getElementById('chat-input')?.focus();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Bot className="h-6 w-6" />
          AI Q&A Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Assign ref to the ScrollArea's viewport div */}
         <ScrollArea className="h-[400px] p-4 space-y-4" viewportRef={scrollAreaRef}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.sender === 'user' ? 'justify-end' : ''
              }`}
            >
              {message.sender === 'ai' && (
                <Avatar className="h-8 w-8 border border-primary/20">
                  {/* You can use a specific AI avatar image if you have one */}
                  {/* <AvatarImage src="/path/to/ai-avatar.png" alt="AI" /> */}
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot size={18} />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`rounded-lg p-3 max-w-[75%] ${
                  message.sender === 'user'
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                 <p className="text-xs text-right mt-1 opacity-70">
                   {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </p>
              </div>
              {message.sender === 'user' && !authLoading && (
                <Avatar className="h-8 w-8 border border-accent/50">
                  <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? 'User'} />
                  <AvatarFallback className="bg-accent text-accent-foreground">
                      {getInitials(user?.displayName)}
                  </AvatarFallback>
                </Avatar>
              )}
               {message.sender === 'user' && authLoading && (
                 <Skeleton className="h-8 w-8 rounded-full" />
               )}
            </div>
          ))}
           {isLoading && (
             <div className="flex items-start gap-3">
               <Avatar className="h-8 w-8 border border-primary/20">
                 <AvatarFallback className="bg-primary text-primary-foreground">
                   <Bot size={18} />
                 </AvatarFallback>
               </Avatar>
               <div className="rounded-lg p-3 bg-secondary text-secondary-foreground">
                  <Skeleton className="h-4 w-20" />
                </div>
             </div>
           )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSend} className="flex w-full items-center space-x-2">
          <Input
            id="chat-input"
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || authLoading} // Disable input when loading auth or AI response
            className="flex-1"
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim() || authLoading}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
