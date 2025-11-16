import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/InputField";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabaseClient as supabase } from "@/lib/supabase-helpers";
import { DashboardTab } from "@/components/admin/DashboardTab";
import { UpsellsTab } from "@/components/admin/UpsellsTab";
import { TransactionsTab } from "@/components/admin/TransactionsTab";
import { SettingsTab } from "@/components/admin/SettingsTab";
import { FieldsConfigTab } from "@/components/admin/FieldsConfigTab";
import { SecurityTab } from "@/components/admin/SecurityTab";
import { PaymentTab } from "@/components/admin/PaymentTab";
import { ChatBot } from "@/components/admin/ChatBot";
import { NetflixLoader } from "@/components/admin/NetflixLoader";

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

const Admin = () => {
  // Verificar se já está logado (persistência de sessão)
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const saved = localStorage.getItem('admin_logged_in');
    return saved === 'true';
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [facebookPixelId, setFacebookPixelId] = useState("1352925696565772");
  const [facebookToken, setFacebookToken] = useState("EAAQmsFtPWZA4BP9ZALSFn9BrwBtrxW9tGpJz6ZBkPJXpswI0eS9BAoYm5kyhEm5PHiNZA5bSudEF7BACGnrnUruhc7YNOqrEfHxneWJYb6CF1ZAc1oqzwPvo5m6jHrZAXTZC9CeOXV5S4rVXcekylZCEuoDetyyfEjRuGwmeQZCQiZCvcEdh8VXFSZA7gcTVyuMZBw1qWwZDZD");
  const [pixelOnCheckout, setPixelOnCheckout] = useState(true);
  const [pixelOnPurchase, setPixelOnPurchase] = useState(true);
  const [showNetflixLoader, setShowNetflixLoader] = useState(false);
  
  // Upsell configuration
  interface Upsell {
    id: string;
    title: string;
    description: string;
    price: string;
    original_price: string;
    image_url: string;
    order: number;
    active: boolean;
  }
  
  const [upsells, setUpsells] = useState<Upsell[]>([]);
  
  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    paidRevenue: 0,
    conversionRate: 0,
    averageTicket: 0,
    pendingOrders: 0,
    paidOrders: 0,
    upsellConversion: 0,
  });
  
  const { toast } = useToast();

  // Transactions from database
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load transactions from database
  const loadTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions' as any)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading transactions:', error);
      return;
    }
    
    if (data) {
      const formattedTransactions: Transaction[] = (data as any[]).map((t: any) => ({
        id: t.id,
        name: t.name || 'Não informado',
        phone: t.phone || t.whatsapp || '',
        email: t.email || '',
        cpf: t.cpf || '',
        value: `R$ ${t.total_value.toFixed(2).replace('.', ',')}`,
        date: new Date(t.created_at).toLocaleDateString('pt-BR'),
        status: t.status === 'paid' ? 'Pago' : t.status === 'awaiting_payment' ? 'Aguardando' : 'Pendente',
        upsell_added: t.upsell_added || false,
        ip_address: t.ip_address || undefined,
      }));
      
      console.log('Transações carregadas:', formattedTransactions);
      setTransactions(formattedTransactions);
      
      // Calculate dashboard stats
      const totalSales = (data as any[]).length;
      const totalRevenue = (data as any[]).reduce((sum: number, t: any) => sum + t.total_value, 0);
      const paidRevenue = (data as any[]).filter((t: any) => t.status === 'paid').reduce((sum: number, t: any) => sum + t.total_value, 0);
      const paidOrders = (data as any[]).filter((t: any) => t.status === 'paid').length;
      const pendingOrders = (data as any[]).filter((t: any) => t.status !== 'paid').length;
      const ordersWithUpsell = (data as any[]).filter((t: any) => t.upsell_added).length;
      
      setDashboardStats({
        totalSales,
        totalRevenue,
        paidRevenue,
        conversionRate: totalSales > 0 ? (paidOrders / totalSales) * 100 : 0,
        averageTicket: totalSales > 0 ? totalRevenue / totalSales : 0,
        pendingOrders,
        paidOrders,
        upsellConversion: totalSales > 0 ? (ordersWithUpsell / totalSales) * 100 : 0,
      });
    }
  };

  useEffect(() => {
    const loadPixelConfig = async () => {
      const { data } = await supabase
        .from('site_config' as any)
        .select('*')
        .in('key', ['facebook_pixel_id', 'facebook_token', 'pixel_on_checkout', 'pixel_on_purchase']);
      
      if (data) {
        (data as any[]).forEach((config: any) => {
          if (config.key === 'facebook_pixel_id') setFacebookPixelId(config.value);
          if (config.key === 'facebook_token') setFacebookToken(config.value);
          if (config.key === 'pixel_on_checkout') setPixelOnCheckout(config.value === 'true');
          if (config.key === 'pixel_on_purchase') setPixelOnPurchase(config.value === 'true');
        });
      }
    };
    
    const loadUpsellConfig = async () => {
      const { data } = await supabase
        .from('upsell_config' as any)
        .select('*')
        .order('order', { ascending: true });
      
      if (data) {
        setUpsells(data as Upsell[]);
      }
    };
    
    if (isLoggedIn) {
      loadTransactions();
      loadUpsellConfig();
      loadPixelConfig();
      
      // Subscribe realtime para transações
      const transactionsChannel = supabase
        .channel('transactions-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'transactions'
          },
          () => {
            console.log('Transação atualizada em tempo real');
            loadTransactions();
          }
        )
        .subscribe();

      // Subscribe realtime para upsells
      const upsellsChannel = supabase
        .channel('upsells-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'upsell_config'
          },
          () => {
            console.log('Upsell atualizado em tempo real');
            loadUpsellConfig();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(transactionsChannel);
        supabase.removeChannel(upsellsChannel);
      };
    }
  }, [isLoggedIn]);

  const handleLogin = () => {
    if (username === "venom" && password === "venom198") {
      // Mostrar animação Netflix
      setShowNetflixLoader(true);
    } else {
      toast({
        description: "Credenciais inválidas",
        variant: "destructive",
      });
    }
  };

  const handleLoginComplete = () => {
    setIsLoggedIn(true);
    // Salvar sessão no localStorage
    localStorage.setItem('admin_logged_in', 'true');
    // Limpar campos
    setUsername("");
    setPassword("");
    setShowNetflixLoader(false);
    toast({
      description: "Login realizado",
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('admin_logged_in');
    toast({
      description: "Logout realizado",
    });
  };

  const savePixelConfig = async () => {
    const configs = [
      { key: 'facebook_pixel_id', value: facebookPixelId },
      { key: 'facebook_token', value: facebookToken },
      { key: 'pixel_on_checkout', value: String(pixelOnCheckout) },
      { key: 'pixel_on_purchase', value: String(pixelOnPurchase) },
    ];
    
    for (const config of configs) {
      await supabase
        .from('site_config' as any)
        .upsert({ key: config.key, value: config.value }, { onConflict: 'key' });
    }
    
    toast({
      description: "Configurações salvas",
    });
  };

  const exportTransactionsByPeriod = async () => {
    const monthSelect = document.getElementById('export-month') as HTMLSelectElement;
    const yearInput = document.getElementById('export-year') as HTMLInputElement;
    
    const month = parseInt(monthSelect.value);
    const year = parseInt(yearInput.value);
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const { data, error} = await supabase
      .from('transactions' as any)
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        description: "Erro ao exportar",
        variant: "destructive",
      });
      return;
    }
    
    if (!data || data.length === 0) {
      toast({
        description: "Nenhuma transação encontrada",
      });
      return;
    }
    
    // Create CSV
    const headers = ['Nome', 'Email', 'Telefone', 'CPF', 'Valor', 'Data', 'Status'];
    const rows = (data as any[]).map((t: any) => [
      t.name,
      t.email,
      t.phone,
      t.cpf,
      `R$ ${t.total_value.toFixed(2).replace('.', ',')}`,
      new Date(t.created_at).toLocaleDateString('pt-BR'),
      t.status === 'paid' ? 'Pago' : t.status === 'awaiting_payment' ? 'Aguardando' : 'Pendente'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transacoes_${month}_${year}.csv`;
    link.click();
    
    toast({
      description: `${data.length} transações exportadas`,
    });
  };

  const exportPaidEmails = async () => {
    const { data, error } = await supabase
      .from('transactions' as any)
      .select('email')
      .eq('status', 'paid');
    
    if (error) {
      toast({
        description: "Erro ao exportar",
        variant: "destructive",
      });
      return;
    }
    
    if (!data || data.length === 0) {
      toast({
        description: "Nenhum cliente pago encontrado",
      });
      return;
    }
    
    const emails = (data as any[]).map((t: any) => t.email).join('\n');
    const blob = new Blob([emails], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `emails_clientes_pagos.txt`;
    link.click();
    
    toast({
      description: `${data.length} emails exportados`,
    });
  };

  const exportAllEmails = async () => {
    const { data, error } = await supabase
      .from('transactions' as any)
      .select('email');
    
    if (error) {
      toast({
        description: "Erro ao exportar",
        variant: "destructive",
      });
      return;
    }
    
    if (!data || data.length === 0) {
      toast({
        description: "Nenhum cliente encontrado",
      });
      return;
    }
    
    const emails = (data as any[]).map((t: any) => t.email).join('\n');
    const blob = new Blob([emails], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `emails_todos_clientes.txt`;
    link.click();
    
    toast({
      description: `${data.length} emails exportados`,
    });
  };

  const handleClearMetrics = async () => {
    const confirmClear = window.confirm(
      "Tem certeza que deseja limpar todas as métricas e transações? Um backup será criado automaticamente antes de limpar."
    );
    
    if (!confirmClear) return;

    try {
      // 1. Fazer backup antes de deletar
      const { data: transactionsData, error: fetchError } = await supabase
        .from('transactions' as any)
        .select('*');
      
      if (fetchError) {
        toast({
          description: "Erro ao fazer backup",
          variant: "destructive",
        });
        return;
      }

      // Criar backup no Supabase
      const backupData = {
        transactions: transactionsData || [],
        backup_date: new Date().toISOString(),
        transaction_count: transactionsData?.length || 0
      };

      const { error: backupError } = await supabase
        .from('backups' as any)
        .insert({
          name: `Backup Automático - ${new Date().toLocaleString('pt-BR')}`,
          data: backupData,
          description: `Backup automático antes de limpar métricas. ${transactionsData?.length || 0} transações.`
        } as any);

      if (backupError) {
        console.error('Erro ao criar backup:', backupError);
        toast({
          description: "Erro ao criar backup, mas continuando...",
          variant: "destructive",
        });
      } else {
        toast({
          description: "Backup criado com sucesso!",
        });
      }

      // 2. Deletar todas as transações - MÚLTIPLAS ABORDAGENS
      console.log('🗑️  Iniciando limpeza de transações...');
      
      try {
        // ABORDAGEM 1: Tentar usar função RPC (mais rápida)
        const { data: rpcResult, error: rpcError } = await supabase
          .rpc('delete_all_transactions' as any);
        
        if (!rpcError && rpcResult !== null && rpcResult !== undefined) {
          console.log(`✅ Função RPC executada: ${rpcResult} transações deletadas`);
          await loadTransactions();
          toast({
            description: `${rpcResult} transações deletadas com sucesso!`,
          });
          return;
        }
        
        console.log('⚠️  Função RPC não disponível, usando método alternativo...');
        
        // ABORDAGEM 2: Buscar todos os IDs e deletar
        const { data: allTransactions, error: fetchError } = await supabase
          .from('transactions' as any)
          .select('id');
        
        if (fetchError) {
          console.error('❌ Erro ao buscar transações:', fetchError);
          throw fetchError;
        }

        if (!allTransactions || allTransactions.length === 0) {
          console.log('ℹ️  Nenhuma transação para deletar');
          toast({
            description: "Nenhuma transação encontrada",
          });
          await loadTransactions();
          return;
        }

        const ids = allTransactions.map((t: any) => t.id);
        console.log(`📊 Total de transações a deletar: ${ids.length}`);
        
        // ABORDAGEM 3: Deletar usando .in() com todos os IDs de uma vez
        const { error: deleteAllError } = await supabase
          .from('transactions' as any)
          .delete()
          .in('id', ids);
        
        if (!deleteAllError) {
          console.log(`✅ Todas as ${ids.length} transações deletadas de uma vez!`);
          await loadTransactions();
          toast({
            description: `${ids.length} transações deletadas com sucesso!`,
          });
          return;
        }
        
        console.log('⚠️  Deletar todas de uma vez falhou, tentando em lotes menores...');
        
        // ABORDAGEM 4: Deletar em lotes pequenos (5 por vez)
        let deletedCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < ids.length; i += 5) {
          const batch = ids.slice(i, i + 5);
          
          const { error: batchError } = await supabase
            .from('transactions' as any)
            .delete()
            .in('id', batch);
          
          if (batchError) {
            console.error(`❌ Erro no lote ${Math.floor(i/5) + 1}:`, batchError);
            // Tentar deletar uma por uma neste lote
            for (const id of batch) {
              const { error: singleError } = await supabase
                .from('transactions' as any)
                .delete()
                .eq('id', id);
              
              if (singleError) {
                console.error(`❌ Erro ao deletar ID ${id}:`, singleError);
                errorCount++;
              } else {
                deletedCount++;
              }
            }
          } else {
            deletedCount += batch.length;
          }
          
          console.log(`✅ Progresso: ${Math.min(i + 5, ids.length)}/${ids.length} processadas`);
        }
        
        console.log(`✅ Processo concluído: ${deletedCount} deletadas, ${errorCount} erros`);
        
        if (errorCount > 0 && deletedCount === 0) {
          toast({
            description: `❌ Erro ao deletar. Execute o SQL no Supabase para criar a função RPC.`,
            variant: "destructive",
          });
          return;
        }
        
        if (errorCount > 0) {
          toast({
            description: `${deletedCount} deletadas, ${errorCount} erros.`,
            variant: "destructive",
          });
        } else {
          toast({
            description: `✅ ${deletedCount} transações deletadas com sucesso!`,
          });
        }
      } catch (error: any) {
        console.error('❌ Erro geral ao limpar:', error);
        toast({
          description: `Erro: ${error.message || 'Erro desconhecido'}. Verifique o console.`,
          variant: "destructive",
        });
        return;
      }
      
      // Reload transactions
      await loadTransactions();
      
      toast({
        description: "Métricas e transações limpas com sucesso!",
      });
    } catch (error: any) {
      console.error('Erro ao limpar métricas:', error);
      toast({
        description: error.message || "Erro ao limpar métricas",
        variant: "destructive",
      });
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    const confirmRestore = window.confirm(
      "Tem certeza que deseja restaurar este backup? Todas as transações atuais serão substituídas."
    );
    
    if (!confirmRestore) return;

    try {
      // Buscar backup
      const { data: backup, error: fetchError } = await supabase
        .from('backups' as any)
        .select('*')
        .eq('id', backupId)
        .single();

      if (fetchError || !backup) {
        toast({
          description: "Erro ao buscar backup",
          variant: "destructive",
        });
        return;
      }

      const backupData = backup.data;
      
      if (!backupData.transactions || backupData.transactions.length === 0) {
        toast({
          description: "Backup vazio",
          variant: "destructive",
        });
        return;
      }

      // Limpar transações atuais
      const { data: currentTransactions } = await supabase
        .from('transactions' as any)
        .select('id');
      
      if (currentTransactions && currentTransactions.length > 0) {
        const ids = currentTransactions.map((t: any) => t.id);
        for (let i = 0; i < ids.length; i += 100) {
          const batch = ids.slice(i, i + 100);
          await supabase
            .from('transactions' as any)
            .delete()
            .in('id', batch);
        }
      }

      // Restaurar transações do backup
      // Remover campos que não devem ser restaurados
      const transactionsToRestore = backupData.transactions.map((t: any) => {
        const { id, created_at, updated_at, ...rest } = t;
        return rest;
      });

      const { error: restoreError } = await supabase
        .from('transactions' as any)
        .insert(transactionsToRestore);

      if (restoreError) {
        toast({
          description: "Erro ao restaurar backup",
        variant: "destructive",
      });
      return;
    }
    
      // Atualizar data de restauração
      await supabase
        .from('backups' as any)
        .update({ restored_at: new Date().toISOString() } as any)
        .eq('id', backupId);
    
    // Reload transactions
    await loadTransactions();
    
    toast({
        description: `Backup restaurado! ${backupData.transactions.length} transações recuperadas.`,
      });
    } catch (error: any) {
      console.error('Erro ao restaurar backup:', error);
      toast({
        description: error.message || "Erro ao restaurar backup",
        variant: "destructive",
      });
    }
  };

  if (showNetflixLoader) {
    return <NetflixLoader onComplete={handleLoginComplete} />;
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-gray-900 border-gray-800 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
            Painel Administrativo
          </h1>
            <p className="text-gray-400 text-sm">Acesse com suas credenciais</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Usuário
              </label>
              <input
                type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <Button 
              onClick={handleLogin} 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-6 text-lg"
            >
              Entrar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="flex h-screen">
        {/* Sidebar Esquerdo */}
        <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
          {/* Header Sidebar */}
          <div className="p-6 border-b border-gray-800">
            <h1 className="text-xl font-bold text-white mb-1">
              Painel Admin
          </h1>
            <p className="text-gray-400 text-xs">Gerencie seu site</p>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "dashboard"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("upsells")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "upsells"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Upsells
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "transactions"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Transações
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "settings"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configurações
            </button>
            <button
              onClick={() => setActiveTab("fields")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "fields"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Campos
            </button>
            <button
              onClick={() => setActiveTab("pixels")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "pixels"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Pixels
            </button>
            <button
              onClick={() => setActiveTab("export")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "export"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "security"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Segurança
            </button>
            <button
              onClick={() => setActiveTab("payment")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "payment"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Pagamento
            </button>
          </div>

          {/* Footer Sidebar */}
          <div className="p-4 border-t border-gray-800">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            Sair
          </Button>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="hidden">
            <TabsTrigger 
              value="dashboard"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="upsells"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
            >
              Upsells
            </TabsTrigger>
            <TabsTrigger 
              value="transactions"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
            >
              Transações
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
            >
              Configurações
            </TabsTrigger>
            <TabsTrigger 
              value="fields"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
            >
              Campos
            </TabsTrigger>
            <TabsTrigger 
              value="pixels"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
            >
              Pixels
            </TabsTrigger>
            <TabsTrigger 
              value="export"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
            >
              Exportar
            </TabsTrigger>
            <TabsTrigger 
              value="security"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
            >
              Segurança
            </TabsTrigger>
            <TabsTrigger 
              value="payment"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
            >
              Pagamento
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <DashboardTab 
              stats={dashboardStats} 
              transactions={transactions}
              onClearMetrics={handleClearMetrics}
              onRestoreBackup={handleRestoreBackup}
              onRefresh={() => {
                loadTransactions();
                const loadUpsellConfig = async () => {
                  const { data } = await supabase
                    .from('upsell_config' as any)
                    .select('*')
                    .order('order', { ascending: true });
                  
                  if (data) {
                    setUpsells(data as Upsell[]);
                  }
                };
                loadUpsellConfig();
                toast({
                  description: "Dados atualizados",
                });
              }}
            />
          </TabsContent>
          
          <TabsContent value="upsells">
            <UpsellsTab upsells={upsells} onUpsellsChange={setUpsells} />
          </TabsContent>
          
          <TabsContent value="transactions">
            <TransactionsTab transactions={transactions} />
          </TabsContent>
          
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
          
          <TabsContent value="fields">
            <FieldsConfigTab />
          </TabsContent>
          
          <TabsContent value="security">
            <SecurityTab />
          </TabsContent>
          
          <TabsContent value="payment">
            <PaymentTab />
          </TabsContent>
          
          <TabsContent value="pixels">
            <Card className="p-6 bg-gray-900 border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-4">
                Configuração de Pixels
              </h2>
              <div className="space-y-4">
                <div className="space-y-3 pb-4 border-b border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-300">Facebook Pixel</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Pixel ID
                    </label>
                    <input
                      type="text"
                      value={facebookPixelId}
                      onChange={(e) => setFacebookPixelId(e.target.value)}
                      placeholder="832420726397594"
                      className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Token de Acesso
                    </label>
                    <input
                      type="text"
                      value={facebookToken}
                      onChange={(e) => setFacebookToken(e.target.value)}
                      placeholder="Cole seu token de acesso aqui"
                      className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="checkout"
                      checked={pixelOnCheckout}
                      onCheckedChange={(checked) => setPixelOnCheckout(checked as boolean)}
                    />
                    <label htmlFor="checkout" className="text-sm text-gray-300">
                      Disparar pixel no início do checkout
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="purchase"
                      checked={pixelOnPurchase}
                      onCheckedChange={(checked) => setPixelOnPurchase(checked as boolean)}
                    />
                    <label htmlFor="purchase" className="text-sm text-gray-300">
                      Disparar pixel após compra concluída
                    </label>
                  </div>
                </div>
                <Button 
                  onClick={savePixelConfig} 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  Salvar Configurações
                </Button>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="export">
            <Card className="p-6 bg-gray-900 border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-6">
                Exportar Relatórios
              </h2>
              
              {/* Filtros de Data */}
              <div className="space-y-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-300">Filtrar por Período</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Mês
                    </label>
                    <select
                      id="export-month"
                      className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="1">Janeiro</option>
                      <option value="2">Fevereiro</option>
                      <option value="3">Março</option>
                      <option value="4">Abril</option>
                      <option value="5">Maio</option>
                      <option value="6">Junho</option>
                      <option value="7">Julho</option>
                      <option value="8">Agosto</option>
                      <option value="9">Setembro</option>
                      <option value="10">Outubro</option>
                      <option value="11">Novembro</option>
                      <option value="12">Dezembro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ano
                    </label>
                    <input
                      type="number"
                      id="export-year"
                      defaultValue={new Date().getFullYear()}
                      min="2020"
                      max="2100"
                      className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>
              </div>

              {/* Botões de Exportação */}
              <div className="space-y-3">
                <Button 
                  onClick={exportTransactionsByPeriod} 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Transações do Período
                </Button>
                
                <Button 
                  onClick={exportPaidEmails} 
                  className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Emails - Clientes Pagos
                </Button>
                
                <Button 
                  onClick={exportAllEmails} 
                  className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Emails - Todos os Clientes
                </Button>
              </div>
            </Card>
          </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Chat Bot */}
        <ChatBot />
      </div>
    </div>
  );
};

export default Admin;
