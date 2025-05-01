
"use client";

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, User as UserIcon, AlertTriangle, Sparkles } from 'lucide-react'; // Added Sparkles
import { studentAIQueryWithToolSelector } from '@/ai/flows/ai-query-tool-selector'; // Import the Genkit flow
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Added Alert

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    // Initial greeting message from AI
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
  const { user, loading: authLoading } = useAuth(); // Get user and auth loading state

  const isLoggedIn = !!user; // Check if user is logged in

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
      // Wrap in setTimeout to ensure DOM updates are flushed
      setTimeout(() => {
         if(scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
         }
      }, 0);
    }
  }, [messages]);


  const handleSend = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault(); // Prevent default form submission if event exists
    const text = input.trim();
    // Prevent sending if not logged in, loading, auth checking, or no input
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
        text: "Sorry, I encountered an error processing your request. Please try again.",
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
    <Card className="w-full max-w-3xl mx-auto shadow-xl border border-border/50 overflow-hidden"> {/* Slightly wider, border */}
      <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-accent/5"> {/* Subtle gradient header */}
        <CardTitle className="flex items-center gap-2 text-primary font-semibold"> {/* Adjusted font weight */}
          <Sparkles className="h-6 w-6 text-accent" /> {/* Changed icon */}
          AI Q&A Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Assign ref to the ScrollArea's viewport div */}
         <ScrollArea className="h-[450px] p-4 space-y-6 bg-background" viewportRef={scrollAreaRef}> {/* Increased height and spacing */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end gap-3 ${ // Align items to end for bubble effect
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender === 'ai' && (
                <Avatar className="h-8 w-8 border border-primary/20 shadow-sm mb-1"> {/* Added shadow and margin */}
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs"> {/* Smaller text */}
                    <Bot size={16} /> {/* Slightly smaller icon */}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`rounded-xl p-3 max-w-[80%] shadow-md ${ // Rounded-xl, more shadow
                  message.sender === 'user'
                    ? 'bg-accent text-accent-foreground rounded-br-none' // Tail for user bubble
                    : 'bg-secondary text-secondary-foreground rounded-bl-none' // Tail for AI bubble
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p> {/* Better line spacing */}
                 <p className="text-xs text-right mt-1.5 opacity-60"> {/* More margin, less opacity */}
                   {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </p>
              </div>
              {message.sender === 'user' && !authLoading && user && ( // Ensure user exists
                <Avatar className="h-8 w-8 border border-accent/50 shadow-sm mb-1"> {/* Added shadow and margin */}
                  <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? 'User'} />
                  <AvatarFallback className="bg-accent text-accent-foreground text-xs"> {/* Smaller text */}
                      {getInitials(user?.displayName)}
                  </AvatarFallback>
                </Avatar>
              )}
              {/* Render generic user icon if message sender is user but user data is missing */}
               {message.sender === 'user' && (authLoading || !user) && (
                 <Avatar className="h-8 w-8 border border-muted shadow-sm mb-1"> {/* Added shadow and margin */}
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs"> {/* Smaller text */}
                        <UserIcon size={16} /> {/* Slightly smaller icon */}
                    </AvatarFallback>
                 </Avatar>
               )}
            </div>
          ))}
           {isLoading && (
             <div className="flex items-end gap-3 justify-start"> {/* Align start */}
               <Avatar className="h-8 w-8 border border-primary/20 shadow-sm mb-1">
                 <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                   <Bot size={16} />
                 </AvatarFallback>
               </Avatar>
               <div className="rounded-xl p-3 bg-secondary text-secondary-foreground shadow-md rounded-bl-none space-y-1.5"> {/* Loading bubble */}
                  <Skeleton className="h-3 w-16 bg-secondary-foreground/30" />
                  <Skeleton className="h-3 w-12 bg-secondary-foreground/30" />
                </div>
             </div>
           )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4 flex flex-col items-start gap-3 bg-secondary/10"> {/* Subtle background */}
         {!isLoggedIn && !authLoading && ( // Show login reminder if not logged in and auth check is complete
            <Alert variant="default" className="w-full bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 shadow-sm"> {/* Yellowish alert */}
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
            disabled={isLoading || authLoading || !isLoggedIn} // Disable input when loading, checking auth, or not logged in
            className="flex-1 bg-background shadow-inner focus-visible:ring-accent" // Enhanced input style
            autoComplete="off"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim() || authLoading || !isLoggedIn} // Also disable button if not logged in
            aria-label="Send message" // Added aria-label
            className="bg-accent hover:bg-accent/90 shadow-md transform active:scale-95 transition-transform" // Enhanced button style
            >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
