import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Ban, Shield, Unlock, Info, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabaseClient as supabase } from "@/lib/supabase-helpers";

interface Transaction {
  id: string;
  name: string;
  phone: string;
  email: string;
  cpf: string;
  value: string;
  date: string;
  status: string;
  upsell_added?: boolean;
  ip_address?: string;
}

interface BlockedIP {
  id: string;
  ip_address: string;
  transaction_id: string;
  redirect_url: string;
  active: boolean;
  created_at: string;
}

interface TransactionsTabProps {
  transactions: Transaction[];
}

export function TransactionsTab({ transactions }: TransactionsTabProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [blockRedirectUrl, setBlockRedirectUrl] = useState("https://google.com");
  const [loading, setLoading] = useState(false);
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [loadingBlocked, setLoadingBlocked] = useState(false);
  const { toast } = useToast();

  // Load blocked IPs
  useEffect(() => {
    loadBlockedIPs();
  }, []);

  const loadBlockedIPs = async () => {
    setLoadingBlocked(true);
    try {
      const { data, error } = await supabase
        .from('blocked_ips' as any)
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setBlockedIPs(data as BlockedIP[]);
      }
    } catch (error) {
      console.error('Error loading blocked IPs:', error);
    } finally {
      setLoadingBlocked(false);
    }
  };

  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const message = encodeURIComponent("Olá! Aqui está a confirmação do seu pedido da Dieta Hormonal Natural.");
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, "_blank");
  };

  const handleBlockIP = async (transactionId: string) => {
    setLoading(true);
    try {
      // Get transaction to find IP
      const { data: transaction, error: transError } = await supabase
        .from('transactions' as any)
        .select('ip_address')
        .eq('id', transactionId)
        .maybeSingle();

      if (transError) throw transError;

      const ipAddress = (transaction as any)?.ip_address;
      
      if (!ipAddress) {
        toast({
          description: "IP não encontrado para esta transação",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Check if already blocked
      const { data: existingBlock } = await supabase
        .from('blocked_ips' as any)
        .select('*')
        .eq('ip_address', ipAddress)
        .eq('active', true)
        .maybeSingle();

      if (existingBlock) {
        toast({
          description: "Este IP já está bloqueado",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Block IP
      const { error: blockError } = await supabase
        .from('blocked_ips' as any)
        .insert({
          ip_address: ipAddress,
          transaction_id: transactionId,
          redirect_url: blockRedirectUrl,
          active: true,
          created_at: new Date().toISOString()
        } as any);

      if (blockError) throw blockError;

      toast({
        description: `IP ${ipAddress} bloqueado com sucesso`,
      });
      
      setSelectedTransaction(null);
      setBlockRedirectUrl("https://google.com");
      loadBlockedIPs(); // Reload blocked IPs list
    } catch (error: any) {
      console.error('Error blocking IP:', error);
      toast({
        description: error.message || "Erro ao bloquear IP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockIP = async (blockedIPId: string, ipAddress: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('blocked_ips' as any)
        .update({ active: false } as any)
        .eq('id', blockedIPId);

      if (error) throw error;

      toast({
        description: `IP ${ipAddress} desbloqueado com sucesso`,
      });
      
      loadBlockedIPs(); // Reload blocked IPs list
    } catch (error: any) {
      console.error('Error unblocking IP:', error);
      toast({
        description: error.message || "Erro ao desbloquear IP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockIPByAddress = async (ipAddress: string) => {
    setLoading(true);
    try {
      // Find blocked IP by address
      const { data: blockedIP, error: findError } = await supabase
        .from('blocked_ips' as any)
        .select('*')
        .eq('ip_address', ipAddress)
        .eq('active', true)
        .maybeSingle();

      if (findError) throw findError;

      if (!blockedIP) {
        toast({
          description: "Este IP não está bloqueado",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Unblock IP
      const { error } = await supabase
        .from('blocked_ips' as any)
        .update({ active: false } as any)
        .eq('id', (blockedIP as any).id);

      if (error) throw error;

      toast({
        description: `IP ${ipAddress} desbloqueado com sucesso`,
      });
      
      loadBlockedIPs(); // Reload blocked IPs list
    } catch (error: any) {
      console.error('Error unblocking IP:', error);
      toast({
        description: error.message || "Erro ao desbloquear IP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if IP is blocked
  const isIPBlocked = (ipAddress: string | undefined): boolean => {
    if (!ipAddress) return false;
    return blockedIPs.some(blocked => blocked.ip_address === ipAddress && blocked.active);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (!startDate && !endDate) return true;
    
    const transactionDate = new Date(transaction.date.split('/').reverse().join('-'));
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (start && transactionDate < start) return false;
    if (end && transactionDate > end) return false;
    
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Seção Explicativa sobre Bloqueio de IP */}
      <Card className="p-6 bg-gray-900 border-purple-800 border-2">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-purple-600/20 flex-shrink-0">
            <Info className="h-6 w-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Funcionalidade de Bloqueio de IP
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>
                Esta funcionalidade permite <strong className="text-white">bloquear o acesso de usuários específicos</strong> ao seu site de checkout.
              </p>
              <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 mt-3">
                <p className="font-medium text-white mb-2">Como funciona:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-300 ml-2">
                  <li>O <strong className="text-purple-400">IP do usuário é capturado automaticamente</strong> quando ele preenche o formulário no checkout</li>
                  <li>Você pode <strong className="text-purple-400">bloquear o IP</strong> de qualquer transação clicando no ícone 🚫</li>
                  <li>Quando um IP bloqueado tentar acessar o site, ele será <strong className="text-purple-400">redirecionado automaticamente</strong> para a URL configurada</li>
                  <li>Você pode <strong className="text-purple-400">desbloquear IPs</strong> a qualquer momento na seção abaixo</li>
                </ul>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-800 p-3 rounded-lg mt-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-yellow-200 text-xs">
                  <strong>Atenção:</strong> O bloqueio de IP é uma medida de segurança. Use com responsabilidade e apenas quando necessário.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* IPs Bloqueados */}
      <Card className="p-6 bg-gray-900 border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Ban className="w-5 h-5 text-red-400" />
            IPs Bloqueados ({blockedIPs.length})
          </h2>
        </div>
        {loadingBlocked ? (
          <div className="text-center py-8 text-gray-500">Carregando...</div>
        ) : blockedIPs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum IP bloqueado no momento
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">IP Address</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Transação ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">URL de Redirecionamento</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Data do Bloqueio</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Ação</th>
                </tr>
              </thead>
              <tbody>
                {blockedIPs.map((blocked) => (
                  <tr key={blocked.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-3 px-4 text-sm text-gray-300 font-mono">{blocked.ip_address}</td>
                    <td className="py-3 px-4 text-sm text-gray-400 font-mono text-xs">{blocked.transaction_id}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">
                      <a 
                        href={blocked.redirect_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline truncate block max-w-xs"
                      >
                        {blocked.redirect_url}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-300">
                      {new Date(blocked.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleUnblockIP(blocked.id, blocked.ip_address)}
                        disabled={loading}
                        className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
                        title="Desbloquear IP"
                      >
                        <Unlock className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Filtros */}
      <Card className="p-6 bg-gray-900 border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Filtrar por Data</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Data Inicial
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Data Final
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>
        {(startDate || endDate) && (
          <Button 
            className="mt-4 bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            variant="outline" 
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
          >
            Limpar Filtros
          </Button>
        )}
      </Card>

      {/* Tabela */}
      <Card className="p-6 bg-gray-900 border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">
            Transações ({filteredTransactions.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">ID Transação</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Nome</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">IP Address</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Telefone</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">E-mail</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">CPF</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Valor</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Data</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Upsell</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="py-3 px-4 text-xs text-gray-400 font-mono">
                    {transaction.id.substring(0, 8)}...
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300">{transaction.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-300 font-mono">
                    {transaction.ip_address ? (
                      <span className="text-blue-400">{transaction.ip_address}</span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300">
                    {transaction.phone || '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300">
                    {transaction.email || '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300">
                    {transaction.cpf || '-'}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-white">{transaction.value}</td>
                  <td className="py-3 px-4 text-sm text-gray-300">{transaction.date}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.status === 'Pago' 
                        ? 'bg-green-900/50 text-green-400 border border-green-800' 
                        : transaction.status === 'Aguardando'
                        ? 'bg-blue-900/50 text-blue-400 border border-blue-800'
                        : 'bg-yellow-900/50 text-yellow-400 border border-yellow-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.upsell_added 
                        ? 'bg-purple-900/50 text-purple-400 border border-purple-800' 
                        : 'bg-gray-800 text-gray-500 border border-gray-700'
                    }`}>
                      {transaction.upsell_added ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {transaction.phone && transaction.phone !== '-' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openWhatsApp(transaction.phone)}
                          className="text-gray-300 hover:text-white hover:bg-gray-800"
                          title="Abrir WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      ) : null}
                      {transaction.ip_address && isIPBlocked(transaction.ip_address) ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUnblockIPByAddress(transaction.ip_address!)}
                          disabled={loading}
                          className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
                          title="Desbloquear IP desta transação"
                        >
                          <Unlock className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedTransaction(transaction.id)}
                          disabled={!transaction.ip_address}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={transaction.ip_address ? "Bloquear IP desta transação" : "IP não disponível"}
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma transação encontrada
            </div>
          )}
        </div>
      </Card>

      {/* Modal de Bloqueio de IP */}
      {selectedTransaction && (
        <Card className="p-6 bg-gray-900 border-red-800 border-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-red-600/20">
              <Shield className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Bloquear IP</h3>
              <p className="text-sm text-gray-400">Bloquear o IP da transação selecionada</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-300 mb-1">Transação ID:</p>
                <p className="text-xs text-gray-400 font-mono break-all">{selectedTransaction}</p>
              </div>
              
              {(() => {
                const transaction = transactions.find(t => t.id === selectedTransaction);
                return transaction?.ip_address ? (
                  <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-800">
                    <p className="text-sm text-blue-300 mb-1">IP Address:</p>
                    <p className="text-sm text-blue-400 font-mono font-semibold">{transaction.ip_address}</p>
                  </div>
                ) : (
                  <div className="p-3 bg-yellow-900/20 rounded-lg border border-yellow-800">
                    <p className="text-sm text-yellow-300">
                      ⚠️ IP não capturado para esta transação
                    </p>
                  </div>
                );
              })()}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                URL de Redirecionamento
              </label>
              <Input
                type="url"
                value={blockRedirectUrl}
                onChange={(e) => setBlockRedirectUrl(e.target.value)}
                placeholder="https://google.com"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
              <p className="text-xs text-gray-400">
                URL para onde o usuário será redirecionado quando tentar acessar o site
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => handleBlockIP(selectedTransaction)}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? "Bloqueando..." : "Bloquear IP"}
              </Button>
              <Button
                onClick={() => {
                  setSelectedTransaction(null);
                  setBlockRedirectUrl("https://google.com");
                }}
                variant="outline"
                className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
