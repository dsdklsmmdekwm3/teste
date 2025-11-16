import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabaseClient as supabase } from "@/lib/supabase-helpers";

export function PaymentTab() {
  const [loading, setLoading] = useState(false);
  const [bearerToken, setBearerToken] = useState("54012|Mcl3CB1BHZT6IS0GLtEpn86ex6c4i8WS3W8gQZmdf454d103");
  const { toast } = useToast();

  useEffect(() => {
    loadBearerToken();
  }, []);

  const loadBearerToken = async () => {
    const { data } = await supabase
      .from('site_config' as any)
      .select('*')
      .eq('key', 'pushinpay_bearer_token')
      .maybeSingle();
    
    if (data && (data as any).value) {
      setBearerToken((data as any).value);
    }
  };

  const handleSaveBearerToken = async () => {
    if (!bearerToken.trim()) {
      toast({
        description: "O Bearer Token não pode estar vazio",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('site_config' as any)
        .upsert({
          key: 'pushinpay_bearer_token',
          value: bearerToken.trim(),
          updated_at: new Date().toISOString()
        } as any, {
          onConflict: 'key'
        });

      if (error) throw error;

      toast({
        description: "Bearer Token salvo com sucesso!",
      });
    } catch (error) {
      console.error('Error saving bearer token:', error);
      toast({
        description: "Erro ao salvar",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bearer Token Configuration */}
      <Card className="p-6 bg-gray-900 border-gray-800">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <img 
              src="https://raichu-uploads.s3.amazonaws.com/logo_pushin-pay_68ITS6.png" 
              alt="PushinPay Logo" 
              className="h-10 w-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <h3 className="text-2xl font-semibold text-white">PushinPay</h3>
          </div>
          <p className="text-sm text-gray-400 ml-0">Api de pagamento</p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bearer-token" className="text-sm font-medium text-gray-300">
              Bearer Token
            </Label>
            <Input
              id="bearer-token"
              type="text"
              value={bearerToken}
              onChange={(e) => setBearerToken(e.target.value)}
              placeholder="54012|Mcl3CB1BHZT6IS0GLtEpn86ex6c4i8WS3W8gQZmdf454d103"
              className="h-11 bg-gray-800 border-gray-700 text-white placeholder-gray-500 font-mono text-sm"
            />
            <p className="text-xs text-gray-400">
              Cole o Bearer Token fornecido pela PushinPay
            </p>
          </div>
          
          <Button 
            onClick={handleSaveBearerToken}
            disabled={loading || !bearerToken.trim()}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
          >
            {loading ? "Salvando..." : "Salvar Bearer Token"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

