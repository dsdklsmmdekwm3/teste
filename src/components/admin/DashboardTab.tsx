import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, ShoppingCart, DollarSign, Users, FileText, Trash2, RefreshCw, Download, History } from "lucide-react";
import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabaseClient as supabase } from "@/lib/supabase-helpers";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  paidRevenue: number;
  conversionRate: number;
  averageTicket: number;
  pendingOrders: number;
  paidOrders: number;
  upsellConversion: number;
}

interface DashboardTabProps {
  stats: DashboardStats;
  transactions: any[];
  onClearMetrics: () => void;
  onRefresh: () => void;
  onRestoreBackup?: (backupId: string) => void;
}

export function DashboardTab({ stats, transactions, onClearMetrics, onRefresh, onRestoreBackup }: DashboardTabProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [backups, setBackups] = useState<any[]>([]);
  const [showBackups, setShowBackups] = useState(false);
  const { toast } = useToast();

  // Carregar backups
  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const { data, error } = await supabase
        .from('backups' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      if (data) {
        setBackups(data);
      }
    } catch (error) {
      console.error('Erro ao carregar backups:', error);
    }
  };

  // Get available years from transactions
  const availableYears = Array.from(new Set(
    transactions.map(t => new Date(t.date.split('/').reverse().join('-')).getFullYear())
  )).sort((a, b) => b - a);

  // Filter transactions by month/year
  const filteredTransactions = transactions.filter(t => {
    const [day, month, year] = t.date.split('/');
    const transactionDate = new Date(`${year}-${month}-${day}`);
    
    if (selectedMonth === "all") {
      return transactionDate.getFullYear().toString() === selectedYear;
    }
    
    return transactionDate.getMonth() === parseInt(selectedMonth) && 
           transactionDate.getFullYear().toString() === selectedYear;
  });

  // Calculate filtered stats
  const filteredStats = {
    totalSales: filteredTransactions.length,
    totalRevenue: filteredTransactions.reduce((sum, t) => {
      const value = parseFloat(t.value.replace('R$ ', '').replace(',', '.'));
      return sum + value;
    }, 0),
    paidRevenue: filteredTransactions.filter(t => t.status === 'Pago').reduce((sum, t) => {
      const value = parseFloat(t.value.replace('R$ ', '').replace(',', '.'));
      return sum + value;
    }, 0),
    paidOrders: filteredTransactions.filter(t => t.status === 'Pago').length,
    pendingOrders: filteredTransactions.filter(t => t.status !== 'Pago').length,
    conversionRate: filteredTransactions.length > 0 ? 
      (filteredTransactions.filter(t => t.status === 'Pago').length / filteredTransactions.length) * 100 : 0,
    averageTicket: filteredTransactions.length > 0 ? 
      filteredTransactions.reduce((sum, t) => {
        const value = parseFloat(t.value.replace('R$ ', '').replace(',', '.'));
        return sum + value;
      }, 0) / filteredTransactions.length : 0,
    upsellConversion: stats.upsellConversion,
  };

  const currentStats = selectedMonth === "all" && selectedYear === new Date().getFullYear().toString() 
    ? stats 
    : filteredStats;

  const exportMetricsPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Relatório de Métricas - Nutricionista Marina", 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Período: ${selectedMonth === "all" ? "Ano Completo" : getMonthName(parseInt(selectedMonth))} ${selectedYear}`, 14, 30);
    doc.text(`Data de Geração: ${new Date().toLocaleDateString('pt-BR')}`, 14, 37);
    
    const metricsData = [
      ["Total de Vendas", currentStats.totalSales.toString()],
      ["Vendas Geradas", `R$ ${currentStats.totalRevenue.toFixed(2).replace('.', ',')}`],
      ["Vendas Pagas", `R$ ${currentStats.paidRevenue.toFixed(2).replace('.', ',')}`],
      ["Taxa de Conversão", `${currentStats.conversionRate.toFixed(1)}%`],
      ["Ticket Médio", `R$ ${currentStats.averageTicket.toFixed(2).replace('.', ',')}`],
      ["Pedidos Pendentes", currentStats.pendingOrders.toString()],
      ["Pedidos Pagos", currentStats.paidOrders.toString()],
      ["Conversão de Upsell", `${currentStats.upsellConversion.toFixed(1)}%`],
    ];
    
    autoTable(doc, {
      startY: 45,
      head: [["Métrica", "Valor"]],
      body: metricsData,
      theme: 'grid',
    });
    
    doc.save(`metricas-${selectedMonth === "all" ? "ano" : getMonthName(parseInt(selectedMonth))}-${selectedYear}.pdf`);
  };

  const exportPendingPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Clientes Pendentes - Nutricionista Marina", 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Data de Geração: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);
    
    const pendingTransactions = filteredTransactions.filter(t => t.status !== 'Pago');
    
    const tableData = pendingTransactions.map(t => [
      t.name,
      t.phone,
      t.email,
      t.value,
      t.date,
      t.status
    ]);
    
    autoTable(doc, {
      startY: 40,
      head: [["Nome", "Telefone", "Email", "Valor", "Data", "Status"]],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
    });
    
    doc.save(`clientes-pendentes-${selectedMonth === "all" ? "ano" : getMonthName(parseInt(selectedMonth))}-${selectedYear}.pdf`);
  };

  const exportGeneralReportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Relatório Geral - Nutricionista Marina", 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Período: ${selectedMonth === "all" ? "Ano Completo" : getMonthName(parseInt(selectedMonth))} ${selectedYear}`, 14, 30);
    doc.text(`Data de Geração: ${new Date().toLocaleDateString('pt-BR')}`, 14, 37);
    
    // Metrics section
    doc.setFontSize(14);
    doc.text("Métricas Gerais", 14, 50);
    
    const metricsData = [
      ["Total de Vendas", currentStats.totalSales.toString()],
      ["Vendas Geradas", `R$ ${currentStats.totalRevenue.toFixed(2).replace('.', ',')}`],
      ["Vendas Pagas", `R$ ${currentStats.paidRevenue.toFixed(2).replace('.', ',')}`],
      ["Taxa de Conversão", `${currentStats.conversionRate.toFixed(1)}%`],
      ["Ticket Médio", `R$ ${currentStats.averageTicket.toFixed(2).replace('.', ',')}`],
    ];
    
    autoTable(doc, {
      startY: 55,
      head: [["Métrica", "Valor"]],
      body: metricsData,
      theme: 'grid',
    });
    
    // Transactions section
    doc.addPage();
    doc.setFontSize(14);
    doc.text("Todas as Transações", 14, 20);
    
    const tableData = filteredTransactions.map(t => [
      t.name,
      t.phone,
      t.email,
      t.value,
      t.date,
      t.status
    ]);
    
    autoTable(doc, {
      startY: 30,
      head: [["Nome", "Telefone", "Email", "Valor", "Data", "Status"]],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
    });
    
    doc.save(`relatorio-geral-${selectedMonth === "all" ? "ano" : getMonthName(parseInt(selectedMonth))}-${selectedYear}.pdf`);
  };

  const getMonthName = (month: number) => {
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
                    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    return months[month];
  };

  return (
    <div className="space-y-6">
      {/* Header com título */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Dashboard</h2>
        <p className="text-gray-400 text-sm">Visualize métricas e gerencie seus dados</p>
      </div>

      {/* Filters and Actions */}
      <Card className="p-6 bg-gray-900 border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-gray-300 mb-2 block">Ano</label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                {availableYears.length > 0 ? availableYears.map(year => (
                  <SelectItem key={year} value={year.toString()} className="hover:bg-gray-700 focus:bg-gray-700">{year}</SelectItem>
                )) : (
                  <SelectItem value={new Date().getFullYear().toString()} className="hover:bg-gray-700 focus:bg-gray-700">{new Date().getFullYear()}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-gray-300 mb-2 block">Mês</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="all" className="hover:bg-gray-700 focus:bg-gray-700">Todos os meses</SelectItem>
                <SelectItem value="0" className="hover:bg-gray-700 focus:bg-gray-700">Janeiro</SelectItem>
                <SelectItem value="1" className="hover:bg-gray-700 focus:bg-gray-700">Fevereiro</SelectItem>
                <SelectItem value="2" className="hover:bg-gray-700 focus:bg-gray-700">Março</SelectItem>
                <SelectItem value="3" className="hover:bg-gray-700 focus:bg-gray-700">Abril</SelectItem>
                <SelectItem value="4" className="hover:bg-gray-700 focus:bg-gray-700">Maio</SelectItem>
                <SelectItem value="5" className="hover:bg-gray-700 focus:bg-gray-700">Junho</SelectItem>
                <SelectItem value="6" className="hover:bg-gray-700 focus:bg-gray-700">Julho</SelectItem>
                <SelectItem value="7" className="hover:bg-gray-700 focus:bg-gray-700">Agosto</SelectItem>
                <SelectItem value="8" className="hover:bg-gray-700 focus:bg-gray-700">Setembro</SelectItem>
                <SelectItem value="9" className="hover:bg-gray-700 focus:bg-gray-700">Outubro</SelectItem>
                <SelectItem value="10" className="hover:bg-gray-700 focus:bg-gray-700">Novembro</SelectItem>
                <SelectItem value="11" className="hover:bg-gray-700 focus:bg-gray-700">Dezembro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-800">
          <Button 
            onClick={onRefresh} 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button 
            onClick={exportMetricsPDF} 
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            variant="outline" 
            size="sm"
          >
            <FileText className="w-4 h-4 mr-2" />
            Exportar Métricas
          </Button>
          <Button 
            onClick={exportPendingPDF} 
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            variant="outline" 
            size="sm"
          >
            <FileText className="w-4 h-4 mr-2" />
            Exportar Pendentes
          </Button>
          <Button 
            onClick={exportGeneralReportPDF} 
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            variant="outline" 
            size="sm"
          >
            <FileText className="w-4 h-4 mr-2" />
            Relatório Geral
          </Button>
          <Button 
            onClick={onClearMetrics} 
            className="bg-red-600 hover:bg-red-700 text-white"
            size="sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Métricas
          </Button>
          <Button 
            onClick={() => {
              setShowBackups(!showBackups);
              if (!showBackups) {
                loadBackups();
              }
            }} 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <History className="w-4 h-4 mr-2" />
            Recuperar Backup
          </Button>
        </div>
      </Card>

      {/* Lista de Backups */}
      {showBackups && (
        <Card className="p-6 bg-gray-900 border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Backups Disponíveis</h3>
          {backups.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhum backup encontrado</p>
          ) : (
            <div className="space-y-2">
              {backups.map((backup) => (
                <div 
                  key={backup.id} 
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700"
                >
                  <div className="flex-1">
                    <p className="text-white font-medium">{backup.name}</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(backup.created_at).toLocaleString('pt-BR')} • 
                      {backup.data?.transaction_count || 0} transações
                    </p>
                    {backup.restored_at && (
                      <p className="text-green-400 text-xs">
                        Restaurado em {new Date(backup.restored_at).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                  {onRestoreBackup && (
                    <Button
                      onClick={() => {
                        onRestoreBackup(backup.id);
                        setShowBackups(false);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white ml-4"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Restaurar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Cards de Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="p-6 bg-gray-900 border-gray-800 hover:border-purple-600 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total de Vendas</p>
              <p className="text-2xl font-bold text-white">{currentStats.totalSales}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-600/20">
              <ShoppingCart className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gray-900 border-gray-800 hover:border-blue-600 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Vendas Geradas</p>
              <p className="text-2xl font-bold text-white">R$ {currentStats.totalRevenue.toFixed(2).replace('.', ',')}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-600/20">
              <DollarSign className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gray-900 border-gray-800 hover:border-green-600 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Vendas Pagas</p>
              <p className="text-2xl font-bold text-white">R$ {currentStats.paidRevenue.toFixed(2).replace('.', ',')}</p>
            </div>
            <div className="p-3 rounded-full bg-green-600/20">
              <DollarSign className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gray-900 border-gray-800 hover:border-purple-600 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-white">{currentStats.conversionRate.toFixed(1)}%</p>
            </div>
            <div className="p-3 rounded-full bg-purple-600/20">
              <TrendingUp className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gray-900 border-gray-800 hover:border-blue-600 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Ticket Médio</p>
              <p className="text-2xl font-bold text-white">R$ {currentStats.averageTicket.toFixed(2).replace('.', ',')}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-600/20">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Funil de Vendas */}
      <Card className="p-6 bg-gray-900 border-gray-800">
        <h3 className="text-xl font-semibold text-white mb-6">Funil de Vendas</h3>
        <div className="space-y-4">
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Pedidos Pendentes</span>
              <span className="text-sm font-bold text-yellow-400">{currentStats.pendingOrders}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-yellow-500 h-4 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${currentStats.totalSales > 0 ? (currentStats.pendingOrders / currentStats.totalSales) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Pedidos Pagos</span>
              <span className="text-sm font-bold text-green-400">{currentStats.paidOrders}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-green-500 h-4 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${currentStats.totalSales > 0 ? (currentStats.paidOrders / currentStats.totalSales) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Conversão de Upsell</span>
              <span className="text-sm font-bold text-purple-400">{currentStats.upsellConversion.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-purple-500 h-4 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${currentStats.upsellConversion}%` }}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
