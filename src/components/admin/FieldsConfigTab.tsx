import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabaseClient as supabase } from "@/lib/supabase-helpers";
import { Check } from "lucide-react";

export const FieldsConfigTab = () => {
  const [selectedMode, setSelectedMode] = useState("full");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      const { data } = await supabase
        .from('site_config' as any)
        .select('value')
        .eq('key', 'checkout_fields_mode')
        .maybeSingle();
      
      if (data && (data as any).value) {
        setSelectedMode((data as any).value);
      }
    };
    
    loadConfig();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    
    const { error } = await supabase
      .from('site_config' as any)
      .upsert({
        key: 'checkout_fields_mode',
        value: selectedMode,
      } as any, {
        onConflict: 'key'
      });
    
    if (error) {
      toast({
        description: "Erro ao salvar",
        variant: "destructive",
      });
    } else {
      toast({
        description: "Configuração salva",
      });
    }
    
    setLoading(false);
  };

  const modes = [
    {
      id: "name_email",
      title: "Nome + Email",
      description: "Coleta apenas Nome Completo e Email. Remove etapa de entrega.",
      fields: ["Nome Completo", "Email"],
    },
    {
      id: "name_whatsapp",
      title: "Nome + WhatsApp",
      description: "Coleta apenas Nome Completo e WhatsApp para receber o produto. Remove etapa de entrega.",
      fields: ["Nome Completo", "WhatsApp"],
    },
    {
      id: "full",
      title: "Completo",
      description: "Coleta todos os dados: Email, Celular, Nome Completo, CPF e endereço de entrega.",
      fields: ["Nome Completo", "Email", "Celular", "CPF", "Endereço de Entrega"],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Configuração dos Campos do Checkout</h3>
        <p className="text-sm text-gray-400 mb-6">
          Escolha quais informações você deseja coletar dos clientes no checkout
        </p>
      </div>

      <div className="grid gap-4">
        {modes.map((mode) => (
          <Card
            key={mode.id}
            className={`p-6 cursor-pointer transition-all bg-gray-900 border-gray-800 ${
              selectedMode === mode.id
                ? "border-purple-600 border-2 bg-purple-600/10"
                : "hover:border-purple-600/50"
            }`}
            onClick={() => setSelectedMode(mode.id)}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  selectedMode === mode.id
                    ? "border-purple-600 bg-purple-600"
                    : "border-gray-700"
                }`}
              >
                {selectedMode === mode.id && <Check className="w-4 h-4 text-white" />}
              </div>
              
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-2">{mode.title}</h4>
                <p className="text-sm text-gray-400 mb-3">{mode.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {mode.fields.map((field) => (
                    <span
                      key={field}
                      className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs font-medium border border-gray-700"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
      >
        {loading ? "Salvando..." : "Salvar Configuração"}
      </Button>
    </div>
  );
};
