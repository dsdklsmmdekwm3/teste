import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface LgpdModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LgpdModal({ isOpen, onClose }: LgpdModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="bg-background rounded-2xl max-w-2xl w-full p-6 relative my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Proteção de Dados - LGPD
            </h2>
            <p className="text-sm text-muted-foreground">
              Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018)
            </p>
          </div>

          <div className="space-y-4 text-sm text-foreground">
            <div>
              <h3 className="font-semibold text-lg mb-2">🔒 Compromisso com sua Privacidade</h3>
              <p className="text-muted-foreground">
                Nós seguimos rigorosamente a Lei Geral de Proteção de Dados (LGPD) para garantir 
                que seus dados pessoais sejam tratados com total segurança e transparência.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">📋 Como Coletamos seus Dados</h3>
              <p className="text-muted-foreground mb-2">
                Coletamos apenas os dados necessários para processar sua compra:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Nome completo</li>
                <li>E-mail</li>
                <li>Telefone/WhatsApp</li>
                <li>CPF (para emissão de nota fiscal)</li>
                <li>Endereço IP (para segurança da transação)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">🛡️ Como Protegemos seus Dados</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Criptografia SSL/TLS em todas as transações</li>
                <li>Armazenamento seguro em servidores protegidos</li>
                <li>Acesso restrito apenas a pessoal autorizado</li>
                <li>Monitoramento constante contra ameaças</li>
                <li>Backup regular dos dados</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">🎯 Finalidade do Uso dos Dados</h3>
              <p className="text-muted-foreground mb-2">
                Utilizamos seus dados exclusivamente para:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Processar e confirmar seu pedido</li>
                <li>Enviar informações sobre o produto adquirido</li>
                <li>Emitir nota fiscal</li>
                <li>Garantir a segurança da transação</li>
                <li>Melhorar nossos serviços (dados anonimizados)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">👤 Seus Direitos</h3>
              <p className="text-muted-foreground mb-2">
                De acordo com a LGPD, você tem direito a:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Confirmar a existência de tratamento de dados</li>
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos ou desatualizados</li>
                <li>Solicitar anonimização, bloqueio ou eliminação de dados</li>
                <li>Revogar seu consentimento a qualquer momento</li>
                <li>Solicitar portabilidade dos dados</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">📞 Como Exercer seus Direitos</h3>
              <p className="text-muted-foreground">
                Para exercer qualquer um dos seus direitos ou esclarecer dúvidas sobre o 
                tratamento de seus dados pessoais, entre em contato conosco através do 
                WhatsApp ou e-mail informado no momento da compra.
              </p>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Importante:</strong> Seus dados são tratados 
                com total confidencialidade e não serão compartilhados com terceiros, exceto 
                quando necessário para cumprimento de obrigações legais ou processamento 
                do pagamento.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button 
              onClick={onClose}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Entendi
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

