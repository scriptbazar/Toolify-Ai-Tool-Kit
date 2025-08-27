
'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, X, Send, User, Bot } from 'lucide-react';
import { Logo } from './Logo';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { addLeadUser } from '@/ai/flows/user-management';
import { aiChat } from '@/ai/flows/ai-chat';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';


type ChatMessage = {
    role: 'user' | 'model';
    content: string;
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'contact' | 'chat'>('contact');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  const { toast } = useToast();
  const chatContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    // Reset to initial state when re-opened
    if (!isOpen) {
        setStep('contact');
        setMessages([]);
        setInput('');
    }
  };

  const handleContactSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingContact(true);
    const formData = new FormData(e.currentTarget);
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    
    try {
      await addLeadUser({ name: `${firstName} ${lastName}`, email, message: `User started a chat.` });
      toast({
        title: 'Thank you!',
        description: "Your information has been saved. You can now chat with our AI.",
      });
      setMessages([{ role: 'model', content: `Hello ${firstName}! How can I help you with ToolifyAI today?` }]);
      setStep('chat');
    } catch (error: any) {
        console.error("Failed to save lead:", error);
        toast({
            title: 'Error',
            description: error.message || 'Could not save your details. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsSubmittingContact(false);
    }
  };

  const handleChatSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSendingMessage(true);

    try {
      const chatHistory = messages.slice(); 
      const result = await aiChat({ history: chatHistory, message: input });
      const aiMessage: ChatMessage = { role: 'model', content: result.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
        console.error("AI chat error:", error);
        const errorMessage: ChatMessage = { role: 'model', content: "Sorry, I'm having trouble connecting. Please try again." };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsSendingMessage(false);
    }
  };

  const ContactForm = (
    <CardContent className="p-0">
      <form onSubmit={handleContactSubmit}>
        <ScrollArea className="h-[350px] w-full p-4">
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg text-center">
              <h4 className="font-semibold text-lg">Welcome!</h4>
              <p className="text-sm text-muted-foreground">
                Please enter your details to get started.
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="firstName" required disabled={isSubmittingContact} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" required disabled={isSubmittingContact} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required disabled={isSubmittingContact} />
              </div>
            </div>
          </div>
        </ScrollArea>
        <CardFooter className="p-4 border-t">
          <Button type="submit" className="w-full" disabled={isSubmittingContact}>
            {isSubmittingContact ? 'Submitting...' : 'Start Chat'}
          </Button>
        </CardFooter>
      </form>
    </CardContent>
  );

  const ChatInterface = (
    <>
      <CardContent className="p-0">
          <ScrollArea className="h-[300px] w-full p-4" ref={chatContainerRef}>
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={cn("flex items-start gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}>
                            {msg.role === 'model' && <Avatar className="h-8 w-8"><AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback></Avatar>}
                            <div className={cn("rounded-lg px-3 py-2 max-w-[80%]", msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted")}>
                                <p className="text-sm">{msg.content}</p>
                            </div>
                             {msg.role === 'user' && <Avatar className="h-8 w-8"><AvatarFallback><User className="h-5 w-5" /></AvatarFallback></Avatar>}
                        </div>
                    ))}
                    {isSendingMessage && (
                        <div className="flex items-start gap-3 justify-start">
                            <Avatar className="h-8 w-8"><AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback></Avatar>
                            <div className="rounded-lg px-3 py-2 bg-muted">
                               <div className="flex items-center space-x-1">
                                  <span className="h-2 w-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                  <span className="h-2 w-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                  <span className="h-2 w-2 bg-foreground rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
          </ScrollArea>
      </CardContent>
      <CardFooter className="p-2 border-t">
        <form onSubmit={handleChatSubmit} className="flex w-full items-center gap-2">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isSendingMessage}
          />
          <Button type="submit" size="icon" disabled={isSendingMessage || !input.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </>
  );
  
  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={toggleOpen}
          className="rounded-full w-12 h-12 shadow-lg"
          aria-label="Toggle chat widget"
        >
          {isOpen ? <X className="h-8 w-8" /> : <Logo className="h-10 w-10 text-primary-foreground" />}
        </Button>
      </div>
      
      {isOpen && (
        <div
          className={cn(
            'fixed bottom-24 right-6 left-6 z-50 max-w-sm sm:left-auto',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-bottom-2 data-[state=open]:slide-in-from-bottom-2'
          )}
          data-state={isOpen ? 'open' : 'closed'}
        >
          <Card className="shadow-2xl flex flex-col max-h-[calc(100vh-8rem)]">
            <CardHeader className="flex flex-row items-center justify-between bg-primary text-primary-foreground p-4 rounded-t-lg">
              <div className="flex items-center gap-3">
                <Logo className="h-6 w-6 text-primary-foreground" />
                <div>
                  <CardTitle className="text-lg">ToolifyAI Assistant</CardTitle>
                  <p className="text-sm text-primary-foreground/80">Ask me about this site!</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={toggleOpen} className="h-8 w-8 hover:bg-primary/80">
                 <X className="h-5 w-5" />
                 <span className="sr-only">Close chat</span>
              </Button>
            </CardHeader>
            {step === 'contact' ? ContactForm : ChatInterface}
          </Card>
        </div>
      )}
    </>
  );
}
