import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, Sparkles, MessageSquare, Zap, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const AskAI = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: "Hello! I'm your AI assistant. Ask me anything about your school data - like student counts, fee payments, or demographics. For example: 'How many grade 9 girls are 14 years old?' or 'How many parents do I have at primary level?'" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const capabilities = [
    { icon: MessageSquare, text: 'Instant answers about student records' },
    { icon: Zap, text: 'Quick report generation' },
    { icon: Sparkles, text: 'Smart insights & analytics' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTryAI = () => {
    inputRef.current?.focus();
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to use the AI assistant with your school data.",
        variant: "destructive",
      });
      return;
    }

    const userMessage = inputValue.trim();
    const nextMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase environment variables are not configured.');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/ask-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          messages: nextMessages,
          schoolId: currentUser.schoolId || currentUser.id,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'AI service request failed');
      }

      if (!response.body) {
        throw new Error('No response stream from AI service.');
      }

      let assistantResponse = '';
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;

          const data = trimmed.slice(5).trim();
          if (!data || data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const token = parsed?.choices?.[0]?.delta?.content;
            if (token) {
              assistantResponse += token;
              setMessages((prev) => {
                const next = [...prev];
                const lastIndex = next.length - 1;
                if (lastIndex >= 0 && next[lastIndex].role === 'assistant') {
                  next[lastIndex] = { ...next[lastIndex], content: assistantResponse };
                }
                return next;
              });
            }
          } catch {
            continue;
          }
        }
      }

      if (!assistantResponse.trim()) {
        setMessages((prev) => {
          const next = [...prev];
          const lastIndex = next.length - 1;
          if (lastIndex >= 0 && next[lastIndex].role === 'assistant') {
            next[lastIndex] = {
              ...next[lastIndex],
              content: 'I could not generate a response right now. Please try again.',
            };
          }
          return next;
        });
      }
    } catch (error) {
      console.error('AI error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response from AI",
        variant: "destructive",
      });

      setMessages((prev) => {
        const next = [...prev];
        const lastIndex = next.length - 1;
        if (lastIndex >= 0 && next[lastIndex].role === 'assistant' && next[lastIndex].content === '') {
          next[lastIndex] = {
            ...next[lastIndex],
            content: "I'm sorry, I couldn't process that request. Please try again or contact support if the issue persists.",
          };
          return next;
        }

        return [...next, {
          role: 'assistant',
          content: "I'm sorry, I couldn't process that request. Please try again or contact support if the issue persists.",
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <section id="ai" className="section-padding bg-gradient-to-br from-secondary/5 via-background to-accent/5">
      <div className="container-max">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full text-secondary font-medium text-sm">
              <Bot size={16} />
              AI-Powered Assistant
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Meet Your{' '}
              <span className="text-secondary">Intelligent School Assistant</span>
            </h2>

            <p className="text-lg text-muted-foreground max-w-xl">
              Ask AI anything about your school data. Get instant answers, generate 
              reports, and receive smart insights—all through natural conversation.
            </p>

            <ul className="space-y-4">
              {capabilities.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center gap-4 animate-fade-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                    <item.icon size={20} />
                  </div>
                  <span className="text-foreground font-medium">{item.text}</span>
                </li>
              ))}
            </ul>

            <Button variant="teal" size="lg" onClick={handleTryAI}>
              <Bot className="mr-2" size={20} />
              Try Ask AI
            </Button>
          </div>

          {/* Chat Preview */}
          <div className="relative animate-fade-up">
            <div className="absolute -inset-4 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-3xl blur-2xl" />
            <div className="relative bg-card rounded-2xl border border-border shadow-card overflow-hidden">
              {/* Chat header */}
              <div className="bg-secondary/10 px-6 py-4 border-b border-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <Bot size={20} className="text-secondary-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold">Zaroda AI Assistant</h4>
                  <p className="text-xs text-muted-foreground">Always ready to help</p>
                </div>
              </div>

              {/* Chat messages */}
              <div className="p-6 space-y-4 bg-background/50 h-64 overflow-y-auto">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                        : 'bg-muted rounded-tl-sm'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                      <span className="w-2 h-2 bg-secondary rounded-full animate-pulse animation-delay-100" />
                      <span className="w-2 h-2 bg-secondary rounded-full animate-pulse animation-delay-200" />
                    </div>
                    <span className="text-xs">AI is thinking...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="px-6 py-4 border-t border-border bg-card">
                <div className="flex items-center gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="How many grade 9 girls are 14 years old?"
                    className="flex-1 bg-muted rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary/30"
                    disabled={isLoading}
                  />
                  <Button 
                    size="sm" 
                    variant="teal" 
                    className="rounded-full"
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputValue.trim()}
                  >
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AskAI;
