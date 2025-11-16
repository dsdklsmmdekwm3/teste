import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Send, Bot, Loader2 } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const SYSTEM_KNOWLEDGE = {
  dashboard: {
    title: "Dashboard",
    description: "Visualize todas as métricas e estatísticas do seu negócio",
    features: [
      "Total de vendas e receita",
      "Taxa de conversão",
      "Ticket médio",
      "Pedidos pendentes e pagos",
      "Funil de vendas",
      "Exportação de relatórios em PDF",
      "Filtros por mês e ano",
      "Limpar métricas e criar backups"
    ],
    howTo: "Use os filtros no topo para ver métricas de períodos específicos. Clique em 'Limpar Métricas' para resetar tudo (um backup será criado automaticamente)."
  },
  upsells: {
    title: "Upsells",
    description: "Gerencie ofertas adicionais para aumentar o ticket médio",
    features: [
      "Criar múltiplas ofertas",
      "Definir preços e descrições",
      "Adicionar imagens por URL",
      "Reordenar ofertas",
      "Ativar/desativar ofertas"
    ],
    howTo: "Clique em 'Adicionar Upsell' para criar uma nova oferta. Configure título, descrição, preço e imagem. Use os botões de seta para reordenar."
  },
  transactions: {
    title: "Transações",
    description: "Visualize todos os pedidos e clientes",
    features: [
      "Lista completa de transações",
      "Filtros por data",
      "Status de pagamento",
      "Informações do cliente",
      "Bloquear IPs por transação",
      "Exportar dados"
    ],
    howTo: "Use os filtros para encontrar transações específicas. Clique em 'Bloquear IP' para bloquear um IP específico baseado na transação."
  },
  settings: {
    title: "Configurações",
    description: "Configure o tema, preços e aparência do site",
    features: [
      "Temas visuais (Black/White, Colorido, etc)",
      "Preços do produto principal",
      "Duração de animações",
      "Configurações de campos"
    ],
    howTo: "Altere o tema, preço e outras configurações. As mudanças são salvas automaticamente no Supabase."
  },
  security: {
    title: "Segurança",
    description: "Proteções avançadas contra cópia e inspeção",
    features: [
      "Bloqueio de botão direito",
      "Proteção contra cópia",
      "Bloqueio de DevTools",
      "Proteção de seleção de texto",
      "Bloqueio de atalhos (F12, Ctrl+Shift+I)",
      "Mobile-only checkout",
      "Bloqueio de IPs"
    ],
    howTo: "Configure as proteções de segurança na aba 'Segurança'. Ative as opções desejadas para proteger seu site."
  },
  pixels: {
    title: "Pixels",
    description: "Configure rastreamento do Facebook Pixel",
    features: [
      "Configurar Pixel ID",
      "Token de acesso",
      "Disparar no checkout",
      "Disparar na compra"
    ],
    howTo: "Insira seu Pixel ID e Token. Marque as opções para disparar eventos no checkout e após compra."
  },
  export: {
    title: "Exportar",
    description: "Exporte dados dos clientes",
    features: [
      "Exportar emails de clientes pagos",
      "Exportar todos os emails",
      "Download em formato .txt"
    ],
    howTo: "Clique nos botões de exportação para baixar listas de emails dos seus clientes."
  }
};

const getResponse = (question: string): string => {
  const lowerQuestion = question.toLowerCase();
  
  // Detectar se pergunta sobre uma aba específica
  for (const [key, info] of Object.entries(SYSTEM_KNOWLEDGE)) {
    if (lowerQuestion.includes(key) || lowerQuestion.includes(info.title.toLowerCase())) {
      return `📋 **${info.title}**\n\n${info.description}\n\n**Funcionalidades:**\n${info.features.map(f => `• ${f}`).join('\n')}\n\n**Como usar:**\n${info.howTo}`;
    }
  }
  
  // Perguntas gerais
  if (lowerQuestion.includes('como') && lowerQuestion.includes('limpar')) {
    return `🗑️ **Como limpar métricas:**\n\n1. Vá na aba Dashboard\n2. Clique em "Limpar Métricas"\n3. Confirme a ação\n4. Um backup será criado automaticamente antes de limpar\n\n💡 Dica: Você pode recuperar backups clicando em "Recuperar Backup"`;
  }
  
  if (lowerQuestion.includes('backup')) {
    return `💾 **Sistema de Backup:**\n\n• Backups são criados automaticamente antes de limpar métricas\n• Você pode restaurar backups na aba Dashboard\n• Clique em "Recuperar Backup" para ver backups disponíveis\n• Cada backup contém todas as transações do momento`;
  }
  
  if (lowerQuestion.includes('upsell') || lowerQuestion.includes('oferta')) {
    return `🎁 **Upsells:**\n\nUpsells são ofertas adicionais mostradas durante o checkout para aumentar o ticket médio.\n\n**Como criar:**\n1. Vá na aba "Upsells"\n2. Clique em "Adicionar Upsell"\n3. Preencha título, descrição, preço e URL da imagem\n4. Salve\n\n**Dica:** Use imagens de alta qualidade e descrições convincentes!`;
  }
  
  if (lowerQuestion.includes('transação') || lowerQuestion.includes('pedido')) {
    return `📦 **Transações:**\n\nTodas as compras dos clientes aparecem aqui.\n\n**Funcionalidades:**\n• Ver todos os pedidos\n• Filtrar por data\n• Ver status de pagamento\n• Bloquear IPs de clientes problemáticos\n• Exportar dados\n\n**Bloquear IP:**\n1. Encontre a transação\n2. Clique em "Bloquear IP"\n3. Configure URL de redirecionamento\n4. O IP será bloqueado automaticamente`;
  }
  
  if (lowerQuestion.includes('segurança') || lowerQuestion.includes('proteger')) {
    return `🔒 **Segurança:**\n\nO sistema tem várias camadas de proteção:\n\n**Proteções Ativas:**\n• Bloqueio de botão direito\n• Proteção contra cópia\n• Bloqueio de DevTools (F12)\n• Proteção de seleção de texto\n• Mobile-only checkout (opcional)\n• Bloqueio de IPs\n\n**Como configurar:**\nVá na aba "Segurança" no painel admin para ativar/desativar proteções.`;
  }
  
  if (lowerQuestion.includes('pixel') || lowerQuestion.includes('facebook')) {
    return `📊 **Facebook Pixel:**\n\nConfigure o rastreamento do Facebook para suas campanhas.\n\n**Como configurar:**\n1. Vá na aba "Pixels"\n2. Insira seu Pixel ID\n3. Insira seu Token de Acesso\n4. Marque as opções desejadas\n5. Salve\n\n**Eventos:**\n• InitiateCheckout: Dispara quando o cliente inicia o checkout\n• Purchase: Dispara quando o pagamento é confirmado`;
  }
  
  if (lowerQuestion.includes('ajuda') || lowerQuestion.includes('help') || lowerQuestion.includes('duvida')) {
    return `🤖 **Como posso ajudar?**\n\nPosso explicar sobre:\n\n• 📊 Dashboard - Métricas e relatórios\n• 🎁 Upsells - Ofertas adicionais\n• 📦 Transações - Pedidos e clientes\n• ⚙️ Configurações - Temas e preços\n• 🔒 Segurança - Proteções do site\n• 📊 Pixels - Rastreamento Facebook\n• 📤 Exportar - Exportação de dados\n\n**Dica:** Pergunte sobre qualquer aba ou funcionalidade!`;
  }
  
  // Resposta padrão
  return `🤖 Olá! Sou o assistente do sistema.\n\nPosso ajudar com:\n• Dashboard e métricas\n• Upsells e ofertas\n• Transações e clientes\n• Configurações\n• Segurança\n• Pixels\n• Exportação\n\n**Exemplo:** Pergunte "Como funciona o dashboard?" ou "O que são upsells?"`;
};

const QUICK_QUESTIONS = [
  { text: "📊 Como funciona o Dashboard?", value: "dashboard" },
  { text: "🎁 O que são Upsells?", value: "upsells" },
  { text: "📦 Como ver Transações?", value: "transactions" },
  { text: "🔒 Configurar Segurança", value: "security" },
  { text: "🗑️ Como limpar métricas?", value: "limpar" },
  { text: "💾 Sobre Backups", value: "backup" },
];

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '👋 Olá! Sou a assistente Agnes, criada pelo meu pai Víctor Hugo.\n\nComo posso ajudar você hoje? Escolha uma opção abaixo ou faça sua pergunta!',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleQuickQuestion = async (questionValue: string) => {
    const question = QUICK_QUESTIONS.find(q => q.value === questionValue);
    if (!question) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: question.text,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    let response = '';
    if (questionValue === 'limpar') {
      response = getResponse('como limpar métricas');
    } else if (questionValue === 'backup') {
      response = getResponse('backup');
    } else {
      response = getResponse(questionValue);
    }
    
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: "",
      isBot: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);

    for (let i = 0; i < response.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 20));
      setMessages(prev => {
        const updated = [...prev];
        const lastMessage = updated[updated.length - 1];
        if (lastMessage && lastMessage.isBot) {
          lastMessage.text = response.substring(0, i + 1);
        }
        return updated;
      });
    }

    setIsTyping(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    const response = getResponse(input);
    
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: "",
      isBot: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);

    for (let i = 0; i < response.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 20));
      setMessages(prev => {
        const updated = [...prev];
        const lastMessage = updated[updated.length - 1];
        if (lastMessage && lastMessage.isBot) {
          lastMessage.text = response.substring(0, i + 1);
        }
        return updated;
      });
    }

    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Botão Flutuante com Animação Pulsante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-110 transition-transform duration-300 pulse-glow-button"
        aria-label="Abrir chat"
      >
        <Bot className="w-8 h-8 text-white relative z-10" />
      </button>
      
      <style>{`
        .pulse-glow-button {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.7), 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 8px rgba(147, 51, 234, 0), 0 0 0 16px rgba(59, 130, 246, 0);
          }
        }
      `}</style>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] z-50 flex flex-col">
          <Card className="flex flex-col h-full bg-gray-900 border-gray-800 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gradient-to-r from-purple-600 to-blue-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Agnes</h3>
                  <p className="text-xs text-purple-100">Assistente Virtual</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div key={message.id}>
                  <div
                    className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.isBot
                          ? "bg-gray-800 text-gray-100"
                          : "bg-purple-600 text-white"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    </div>
                  </div>
                  
                  {/* Botões de escolha rápida apenas após a primeira mensagem do bot */}
                  {message.isBot && index === 0 && (
                    <div className="mt-3 space-y-2">
                      {QUICK_QUESTIONS.map((q) => (
                        <button
                          key={q.value}
                          onClick={() => handleQuickQuestion(q.value)}
                          disabled={isTyping}
                          className="w-full text-left px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {q.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 rounded-2xl px-4 py-2">
                    <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua pergunta..."
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

