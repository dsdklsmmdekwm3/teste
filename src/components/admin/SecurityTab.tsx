import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { InputField } from "@/components/InputField";
import { useToast } from "@/hooks/use-toast";
import { supabaseClient as supabase } from "@/lib/supabase-helpers";
import { Shield, Lock, EyeOff, Copy, MousePointer2 } from "lucide-react";

export function SecurityTab() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    disableRightClick: true,
    disableCopy: true,
    disableDevTools: true,
    disableTextSelection: true,
    disableShortcuts: true,
    blurOnInspect: true,
    mobileOnlyCheckout: false,
    desktopRedirectUrl: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_config' as any)
        .select('*')
        .in('key', [
          'disable_right_click',
          'disable_copy',
          'disable_devtools',
          'disable_text_selection',
          'disable_shortcuts',
          'blur_on_inspect',
          'mobile_only_checkout',
          'desktop_redirect_url'
        ]);

      if (error) throw error;

      if (data) {
        const config: any = {};
        (data as any[]).forEach((item: any) => {
          config[item.key] = item.value;
        });

        setSettings({
          disableRightClick: config.disable_right_click === 'true',
          disableCopy: config.disable_copy === 'true',
          disableDevTools: config.disable_devtools === 'true',
          disableTextSelection: config.disable_text_selection === 'true',
          disableShortcuts: config.disable_shortcuts === 'true',
          blurOnInspect: config.blur_on_inspect === 'true',
          mobileOnlyCheckout: config.mobile_only_checkout === 'true',
          desktopRedirectUrl: config.desktop_redirect_url || '',
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de segurança:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const configs = [
        { key: 'disable_right_click', value: settings.disableRightClick.toString() },
        { key: 'disable_copy', value: settings.disableCopy.toString() },
        { key: 'disable_devtools', value: settings.disableDevTools.toString() },
        { key: 'disable_text_selection', value: settings.disableTextSelection.toString() },
        { key: 'disable_shortcuts', value: settings.disableShortcuts.toString() },
        { key: 'blur_on_inspect', value: settings.blurOnInspect.toString() },
        { key: 'mobile_only_checkout', value: settings.mobileOnlyCheckout.toString() },
        { key: 'desktop_redirect_url', value: settings.desktopRedirectUrl },
      ];

      for (const config of configs) {
        await supabase
          .from('site_config' as any)
          .upsert({ key: config.key, value: config.value } as any);
      }

      toast({
        description: "Configurações de segurança salvas!",
      });
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast({
        description: "Erro ao salvar configurações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Segurança</h2>
        <p className="text-gray-400 text-sm">Configure proteções avançadas contra cópia e inspeção</p>
      </div>

      <Card className="p-6 bg-gray-900 border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" />
          Proteções Anti-Cópia
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center gap-3">
              <MousePointer2 className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-white font-medium">Bloquear Botão Direito</p>
                <p className="text-gray-400 text-xs">Impede acesso ao menu de contexto</p>
              </div>
            </div>
            <Checkbox
              checked={settings.disableRightClick}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, disableRightClick: checked as boolean })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center gap-3">
              <Copy className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-white font-medium">Bloquear Cópia</p>
                <p className="text-gray-400 text-xs">Impede Ctrl+C e cópia de conteúdo</p>
              </div>
            </div>
            <Checkbox
              checked={settings.disableCopy}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, disableCopy: checked as boolean })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center gap-3">
              <EyeOff className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-white font-medium">Bloquear Seleção de Texto</p>
                <p className="text-gray-400 text-xs">Impede seleção e arraste de texto</p>
              </div>
            </div>
            <Checkbox
              checked={settings.disableTextSelection}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, disableTextSelection: checked as boolean })
              }
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gray-900 border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-400" />
          Proteções Anti-Inspeção
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-white font-medium">Bloquear DevTools</p>
                <p className="text-gray-400 text-xs">Impede F12, Ctrl+Shift+I, etc</p>
              </div>
            </div>
            <Checkbox
              checked={settings.disableDevTools}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, disableDevTools: checked as boolean })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-white font-medium">Bloquear Atalhos</p>
                <p className="text-gray-400 text-xs">Impede Ctrl+U, Ctrl+S, Ctrl+P, etc</p>
              </div>
            </div>
            <Checkbox
              checked={settings.disableShortcuts}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, disableShortcuts: checked as boolean })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center gap-3">
              <EyeOff className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-white font-medium">Desfocar ao Inspecionar</p>
                <p className="text-gray-400 text-xs">Desfoca o site quando DevTools é aberto</p>
              </div>
            </div>
            <Checkbox
              checked={settings.blurOnInspect}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, blurOnInspect: checked as boolean })
              }
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gray-900 border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-400" />
          Checkout Mobile-Only
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div>
              <p className="text-white font-medium">Apenas Mobile no Checkout</p>
              <p className="text-gray-400 text-xs">Redireciona usuários de desktop</p>
            </div>
            <Checkbox
              checked={settings.mobileOnlyCheckout}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, mobileOnlyCheckout: checked as boolean })
              }
            />
          </div>

          {settings.mobileOnlyCheckout && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                URL de Redirecionamento (Desktop)
              </label>
              <input
                type="url"
                value={settings.desktopRedirectUrl}
                onChange={(e) =>
                  setSettings({ ...settings, desktopRedirectUrl: e.target.value })
                }
                placeholder="https://exemplo.com"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
          )}
        </div>
      </Card>

      <Button
        onClick={saveSettings}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
      >
        {loading ? "Salvando..." : "Salvar Configurações de Segurança"}
      </Button>
    </div>
  );
}

