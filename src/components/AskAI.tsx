import { Button } from '@/components/ui/button';
import { Bot, Sparkles, MessageSquare, Zap } from 'lucide-react';

const AskAI = () => {
  const capabilities = [
    { icon: MessageSquare, text: 'Instant answers about student records' },
    { icon: Zap, text: 'Quick report generation' },
    { icon: Sparkles, text: 'Smart insights & analytics' },
  ];

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

            <Button variant="teal" size="lg">
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
              <div className="p-6 space-y-4 bg-background/50">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                    <p className="text-sm">How many students paid fees this month?</p>
                  </div>
                </div>

                {/* AI response */}
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                    <p className="text-sm">
                      This month, <strong>847 students</strong> have completed fee payments, 
                      representing <strong>92%</strong> of enrolled students. Would you like 
                      a detailed breakdown by class?
                    </p>
                  </div>
                </div>

                {/* Typing indicator */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                    <span className="w-2 h-2 bg-secondary rounded-full animate-pulse animation-delay-100" />
                    <span className="w-2 h-2 bg-secondary rounded-full animate-pulse animation-delay-200" />
                  </div>
                  <span className="text-xs">AI is thinking...</span>
                </div>
              </div>

              {/* Input area */}
              <div className="px-6 py-4 border-t border-border bg-card">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Ask anything about your school..."
                    className="flex-1 bg-muted rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary/30"
                  />
                  <Button size="sm" variant="teal" className="rounded-full">
                    <Sparkles size={16} />
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
