// Componente para gerenciar backup/restauração de dados
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import * as storage from "@/lib/local-storage";
import { Download, Upload, Trash2, Database } from "lucide-react";

export function StorageManager() {
  const [exportData, setExportData] = useState("");
  const [importData, setImportData] = useState("");
  const { toast } = useToast();

  const handleExport = () => {
    try {
      const data = storage.exportData();
      setExportData(data);
      toast({
        description: "Dados exportados com sucesso",
      });
    } catch (error) {
      toast({
        description: "Erro ao exportar dados",
        variant: "destructive",
      });
    }
  };

  const handleImport = () => {
    try {
      if (!importData.trim()) {
        toast({
          description: "Cole os dados JSON para importar",
          variant: "destructive",
        });
        return;
      }
      
      storage.importData(importData);
      setImportData("");
      toast({
        description: "Dados importados com sucesso",
      });
      
      // Recarregar página para atualizar dados
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      toast({
        description: `Erro ao importar: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!exportData) {
      handleExport();
      return;
    }
    
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      description: "Arquivo baixado",
    });
  };

  const handleClear = () => {
    if (confirm('Tem certeza que deseja limpar TODOS os dados? Esta ação não pode ser desfeita!')) {
      storage.clearAllData();
      toast({
        description: "Todos os dados foram limpos",
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const data = storage.loadLocalData();
  const stats = {
    transactions: data.transactions?.length || 0,
    configs: data.site_config?.length || 0,
    upsells: data.upsell_config?.length || 0,
    blockedIPs: data.blocked_ips?.filter((ip: any) => ip.active).length || 0,
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gray-900 border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-blue-600/20">
            <Database className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Gerenciador de Armazenamento</h3>
            <p className="text-sm text-gray-400">Backup e restauração de dados locais</p>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-2xl font-bold text-white">{stats.transactions}</p>
            <p className="text-xs text-gray-400">Transações</p>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-2xl font-bold text-white">{stats.configs}</p>
            <p className="text-xs text-gray-400">Configurações</p>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-2xl font-bold text-white">{stats.upsells}</p>
            <p className="text-xs text-gray-400">Upsells</p>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-2xl font-bold text-white">{stats.blockedIPs}</p>
            <p className="text-xs text-gray-400">IPs Bloqueados</p>
          </div>
        </div>

        {/* Exportar */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">Exportar Dados</h4>
            <div className="flex gap-2">
              <Button
                onClick={handleExport}
                variant="outline"
                className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Gerar Export
              </Button>
              <Button
                onClick={handleDownload}
                disabled={!exportData}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar JSON
              </Button>
            </div>
          </div>
          {exportData && (
            <div className="space-y-2">
              <Label className="text-sm text-gray-300">Dados Exportados:</Label>
              <Textarea
                value={exportData}
                readOnly
                className="bg-gray-800 border-gray-700 text-white font-mono text-xs h-40"
              />
              <p className="text-xs text-gray-400">
                Copie este JSON e salve em um arquivo seguro para backup
              </p>
            </div>
          )}
        </div>

        {/* Importar */}
        <div className="space-y-4 mb-6">
          <h4 className="text-lg font-semibold text-white">Importar Dados</h4>
          <div className="space-y-2">
            <Label className="text-sm text-gray-300">
              Cole o JSON exportado anteriormente:
            </Label>
            <Textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder='{"transactions": [...], "site_config": [...]}'
              className="bg-gray-800 border-gray-700 text-white font-mono text-xs h-40"
            />
            <Button
              onClick={handleImport}
              disabled={!importData.trim()}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Importar Dados
            </Button>
            <p className="text-xs text-yellow-400">
              ⚠️ Importar dados irá substituir todos os dados atuais!
            </p>
          </div>
        </div>

        {/* Limpar */}
        <div className="pt-4 border-t border-gray-800">
          <Button
            onClick={handleClear}
            variant="destructive"
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Todos os Dados
          </Button>
          <p className="text-xs text-red-400 mt-2 text-center">
            ⚠️ Esta ação não pode ser desfeita!
          </p>
        </div>
      </Card>
    </div>
  );
}

