import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabaseClient as supabase } from "@/lib/supabase-helpers";
import { ImageIcon, Shield, Smartphone, Globe } from "lucide-react";

export function SettingsTab() {
  const [guaranteeImageUrl, setGuaranteeImageUrl] = useState("");
  const [productImageUrl, setProductImageUrl] = useState("");
  const [productPrice, setProductPrice] = useState("67.00");
  const [checkoutTheme, setCheckoutTheme] = useState("default");
  const [pulseDuration, setPulseDuration] = useState("3.5");
  const [loading, setLoading] = useState(false);
  const [mobileOnly, setMobileOnly] = useState(false);
  const [desktopRedirectUrl, setDesktopRedirectUrl] = useState("");
  const [siteTitle, setSiteTitle] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data: guaranteeData } = await supabase
      .from('site_config' as any)
      .select('*')
      .eq('key', 'guarantee_image_url')
      .maybeSingle();
    
    if (guaranteeData) {
      setGuaranteeImageUrl((guaranteeData as any).value);
    }

    const { data: productData } = await supabase
      .from('site_config' as any)
      .select('*')
      .eq('key', 'product_image_url')
      .maybeSingle();
    
    if (productData) {
      setProductImageUrl((productData as any).value);
    }

    const { data: priceData } = await supabase
      .from('site_config' as any)
      .select('*')
      .eq('key', 'main_product_price')
      .maybeSingle();
    
    if (priceData) {
      setProductPrice((priceData as any).value);
    }

    const { data: themeData } = await supabase
      .from('site_config' as any)
      .select('*')
      .eq('key', 'checkout_theme')
      .maybeSingle();
    
    if (themeData) {
      setCheckoutTheme((themeData as any).value);
    }

    const { data: pulseData } = await supabase
      .from('site_config' as any)
      .select('*')
      .eq('key', 'blackwhite_pulse_duration')
      .maybeSingle();
    
    if (pulseData) {
      // Remove 's' do valor (ex: "3.5s" -> "3.5")
      setPulseDuration((pulseData as any).value.replace('s', ''));
    }

    const { data: mobileOnlyData } = await supabase
      .from('site_config' as any)
      .select('*')
      .eq('key', 'mobile_only_checkout')
      .maybeSingle();
    
    if (mobileOnlyData) {
      setMobileOnly((mobileOnlyData as any).value === 'true');
    }

    const { data: redirectData } = await supabase
      .from('site_config' as any)
      .select('*')
      .eq('key', 'desktop_redirect_url')
      .maybeSingle();
    
    if (redirectData) {
      setDesktopRedirectUrl((redirectData as any).value || '');
    }

    const { data: titleData } = await supabase
      .from('site_config' as any)
      .select('*')
      .eq('key', 'site_title')
      .maybeSingle();
    
    if (titleData) {
      setSiteTitle((titleData as any).value || '');
    }

    const { data: faviconData } = await supabase
      .from('site_config' as any)
      .select('*')
      .eq('key', 'favicon_url')
      .maybeSingle();
    
    if (faviconData) {
      setFaviconUrl((faviconData as any).value || '');
    }
  };

  const handleSaveGuaranteeImage = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('site_config' as any)
        .upsert({
          key: 'guarantee_image_url',
          value: guaranteeImageUrl,
          updated_at: new Date().toISOString()
        } as any, {
          onConflict: 'key'
        });

      if (error) throw error;

      toast({
        description: "Imagem da garantia salva",
      });
    } catch (error) {
      console.error('Error saving guarantee image:', error);
      toast({
        description: "Erro ao salvar",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProductImage = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('site_config' as any)
        .upsert({
          key: 'product_image_url',
          value: productImageUrl,
          updated_at: new Date().toISOString()
        } as any, {
          onConflict: 'key'
        });

      if (error) throw error;

      toast({
        description: "Imagem do produto salva",
      });
    } catch (error) {
      console.error('Error saving product image:', error);
      toast({
        description: "Erro ao salvar",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProductPrice = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('site_config' as any)
        .upsert({
          key: 'main_product_price',
          value: productPrice,
          updated_at: new Date().toISOString()
        } as any, {
          onConflict: 'key'
        });

      if (error) throw error;

      toast({
        description: "Preço salvo",
      });
    } catch (error) {
      console.error('Error saving product price:', error);
      toast({
        description: "Erro ao salvar",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTheme = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('site_config' as any)
        .upsert({
          key: 'checkout_theme',
          value: checkoutTheme,
          updated_at: new Date().toISOString()
        } as any, {
          onConflict: 'key'
        });

      if (error) throw error;

      toast({
        description: "Tema salvo",
      });
    } catch (error) {
      console.error('Error saving theme:', error);
      toast({
        description: "Erro ao salvar tema",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePulseDuration = async () => {
    setLoading(true);
    try {
      const { error} = await supabase
        .from('site_config' as any)
        .upsert({
          key: 'blackwhite_pulse_duration',
          value: `${pulseDuration}s`,
          updated_at: new Date().toISOString()
        } as any, {
          onConflict: 'key'
        });

      if (error) throw error;

      toast({
        description: "Velocidade salva",
      });
    } catch (error) {
      console.error('Error saving pulse duration:', error);
      toast({
        description: "Erro ao salvar",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecuritySettings = async () => {
    setLoading(true);
    try {
      const { error: mobileError } = await supabase
        .from('site_config' as any)
        .upsert({
          key: 'mobile_only_checkout',
          value: mobileOnly ? 'true' : 'false',
          updated_at: new Date().toISOString()
        } as any, {
          onConflict: 'key'
        });

      if (mobileError) throw mobileError;

      const { error: redirectError } = await supabase
        .from('site_config' as any)
        .upsert({
          key: 'desktop_redirect_url',
          value: desktopRedirectUrl,
          updated_at: new Date().toISOString()
        } as any, {
          onConflict: 'key'
        });

      if (redirectError) throw redirectError;

      toast({
        description: "Configurações de segurança salvas",
      });
    } catch (error) {
      console.error('Error saving security settings:', error);
      toast({
        description: "Erro ao salvar",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSiteInfo = async () => {
    setLoading(true);
    try {
      const { error: titleError } = await supabase
        .from('site_config' as any)
        .upsert({
          key: 'site_title',
          value: siteTitle,
          updated_at: new Date().toISOString()
        } as any, {
          onConflict: 'key'
        });

      if (titleError) throw titleError;

      const { error: faviconError } = await supabase
        .from('site_config' as any)
        .upsert({
          key: 'favicon_url',
          value: faviconUrl,
          updated_at: new Date().toISOString()
        } as any, {
          onConflict: 'key'
        });

      if (faviconError) throw faviconError;

      // Atualizar título e favicon dinamicamente
      if (siteTitle) {
        document.title = siteTitle;
      }
      
      if (faviconUrl) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = faviconUrl;
      }

      toast({
        description: "Informações do site salvas",
      });
    } catch (error) {
      console.error('Error saving site info:', error);
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
      {/* Informações do Site (Favicon e Título) */}
      <Card className="p-6 bg-gray-900 border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-yellow-600/20">
            <Globe className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Informações do Site</h3>
            <p className="text-sm text-gray-400">Configure o título e favicon que aparecem na aba do navegador</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site-title" className="text-sm font-medium text-gray-300">
              Título do Site
            </Label>
            <Input
              id="site-title"
              type="text"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              placeholder="Ex: Dieta Hormonal Natural - Checkout Seguro"
              className="h-11 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
            />
            <p className="text-xs text-gray-400">
              Este texto aparecerá na aba do navegador
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="favicon-url" className="text-sm font-medium text-gray-300">
              URL do Favicon
            </Label>
            <Input
              id="favicon-url"
              type="text"
              value={faviconUrl}
              onChange={(e) => setFaviconUrl(e.target.value)}
              placeholder="https://exemplo.com/favicon.ico ou /favicon.ico"
              className="h-11 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
            />
            <p className="text-xs text-gray-400">
              Cole a URL completa do favicon ou o caminho local (ex: /favicon.ico)
            </p>
          </div>
          
          {faviconUrl && (
            <div className="rounded-lg border border-gray-800 overflow-hidden bg-gray-800/50 p-4">
              <p className="text-xs text-gray-400 mb-2">Preview do Favicon:</p>
              <div className="flex items-center gap-3">
                <img 
                  src={faviconUrl} 
                  alt="Favicon"
                  className="w-8 h-8 rounded"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/32x32?text=❌";
                  }}
                />
                <span className="text-sm text-gray-300">{siteTitle || "Título do Site"}</span>
              </div>
            </div>
          )}
          
          <Button 
            onClick={handleSaveSiteInfo}
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
          >
            {loading ? "Salvando..." : "Salvar Informações do Site"}
          </Button>
        </div>
      </Card>

      {/* Imagem do Produto Principal */}
      <Card className="p-6 bg-gray-900 border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-purple-600/20">
            <ImageIcon className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Imagem do Produto Principal</h3>
            <p className="text-sm text-gray-400">Configure a imagem do card "Dieta Hormonal Natural"</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-image" className="text-sm font-medium text-gray-300">
              URL da Imagem
            </Label>
            <Input
              id="product-image"
              type="text"
              value={productImageUrl}
              onChange={(e) => setProductImageUrl(e.target.value)}
              placeholder="https://exemplo.com/imagem.png ou /src/assets/imagem.png"
              className="h-11 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
            />
            <p className="text-xs text-gray-400">
              Cole a URL completa da imagem ou o caminho local do asset
            </p>
          </div>
          
          {productImageUrl && (
            <div className="rounded-lg border border-gray-800 overflow-hidden bg-gray-800/50 p-4">
              <p className="text-xs text-gray-400 mb-2">Preview:</p>
              <img 
                src={productImageUrl} 
                alt="Preview do produto"
                className="w-20 h-20 rounded-lg shadow-sm object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/80x80?text=Imagem+não+encontrada";
                }}
              />
            </div>
          )}
          
          <Button 
            onClick={handleSaveProductImage}
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            {loading ? "Salvando..." : "Salvar Configuração"}
          </Button>
        </div>
      </Card>

      {/* Preço do Produto Principal */}
      <Card className="p-6 bg-gray-900 border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-blue-600/20">
            <ImageIcon className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Preço do Produto Principal</h3>
            <p className="text-sm text-gray-400">Configure o preço do produto (formato: 67.00)</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-price" className="text-sm font-medium text-gray-300">
              Preço (R$)
            </Label>
            <Input
              id="product-price"
              type="text"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              placeholder="67.00"
              className="h-11 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
            />
            <p className="text-xs text-gray-400">
              Digite o preço no formato: 67.00 (sem o símbolo R$)
            </p>
          </div>
          
          <Button 
            onClick={handleSaveProductPrice}
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            {loading ? "Salvando..." : "Salvar Preço"}
          </Button>
        </div>
      </Card>

      {/* Imagem da Garantia */}
      <Card className="p-6 bg-gray-900 border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-green-600/20">
            <ImageIcon className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Imagem de Garantia</h3>
            <p className="text-sm text-gray-400">Configure a imagem exibida no checkout</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guarantee-image" className="text-sm font-medium text-gray-300">
              URL da Imagem
            </Label>
            <Input
              id="guarantee-image"
              type="text"
              value={guaranteeImageUrl}
              onChange={(e) => setGuaranteeImageUrl(e.target.value)}
              placeholder="https://exemplo.com/imagem.png ou /src/assets/imagem.png"
              className="h-11 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
            />
            <p className="text-xs text-gray-400">
              Cole a URL completa da imagem ou o caminho local do asset
            </p>
          </div>
          
          {guaranteeImageUrl && (
            <div className="rounded-lg border border-gray-800 overflow-hidden bg-gray-800/50 p-4">
              <p className="text-xs text-gray-400 mb-2">Preview:</p>
              <img 
                src={guaranteeImageUrl} 
                alt="Preview da garantia"
                className="w-full max-w-md rounded-lg shadow-sm"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/400x200?text=Imagem+não+encontrada";
                }}
              />
            </div>
          )}
          
          <Button 
            onClick={handleSaveGuaranteeImage}
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            {loading ? "Salvando..." : "Salvar Configuração"}
          </Button>
        </div>
      </Card>

      {/* Tema do Checkout */}
      <Card className="p-6 bg-gray-900 border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-purple-600/20">
            <ImageIcon className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Tema do Checkout</h3>
            <p className="text-sm text-gray-400">Escolha o layout e cores do checkout</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tema Default */}
            <button
              onClick={() => setCheckoutTheme("default")}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                checkoutTheme === "default"
                  ? "border-purple-600 bg-purple-600/10"
                  : "border-gray-800 hover:border-purple-600/50 bg-gray-800"
              }`}
            >
              <div className="font-semibold text-white mb-1">Default</div>
              <div className="text-sm text-gray-400">Layout atual com botões verdes nos upsells</div>
            </button>

            {/* Tema Dark */}
            <button
              onClick={() => setCheckoutTheme("dark")}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                checkoutTheme === "dark"
                  ? "border-purple-600 bg-purple-600/10"
                  : "border-gray-800 hover:border-purple-600/50 bg-gray-800"
              }`}
            >
              <div className="font-semibold text-white mb-1">Modo Escuro</div>
              <div className="text-sm text-gray-400">Fundo escuro com textos claros</div>
            </button>

            {/* Tema High Conversion */}
            <button
              onClick={() => setCheckoutTheme("conversion")}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                checkoutTheme === "conversion"
                  ? "border-purple-600 bg-purple-600/10"
                  : "border-gray-800 hover:border-purple-600/50 bg-gray-800"
              }`}
            >
              <div className="font-semibold text-white mb-1">Alta Conversão</div>
              <div className="text-sm text-gray-400">Cores vibrantes que convertem melhor</div>
            </button>

            {/* Tema Minimalist */}
            <button
              onClick={() => setCheckoutTheme("minimalist")}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                checkoutTheme === "minimalist"
                  ? "border-purple-600 bg-purple-600/10"
                  : "border-gray-800 hover:border-purple-600/50 bg-gray-800"
              }`}
            >
              <div className="font-semibold text-white mb-1">Minimalista Verde</div>
              <div className="text-sm text-gray-400">Layout limpo com botões verdes</div>
            </button>

            {/* Tema Black & White */}
            <button
              onClick={() => setCheckoutTheme("blackwhite")}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                checkoutTheme === "blackwhite"
                  ? "border-purple-600 bg-purple-600/10"
                  : "border-gray-800 hover:border-purple-600/50 bg-gray-800"
              }`}
            >
              <div className="font-semibold text-white mb-1">Preto e Branco</div>
              <div className="text-sm text-gray-400">Minimalista em preto e branco</div>
            </button>
          </div>
          
          <Button 
            onClick={handleSaveTheme}
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            {loading ? "Salvando..." : "Salvar Tema"}
          </Button>
        </div>
      </Card>

      {/* Velocidade de Pulsação (Tema Black & White) */}
      <Card className="p-6 bg-gray-900 border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-blue-600/20">
            <ImageIcon className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Velocidade de Pulsação</h3>
            <p className="text-sm text-gray-400">Configure a velocidade da animação do botão no tema Preto e Branco</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pulse-duration" className="text-sm font-medium text-gray-300">
              Duração (segundos)
            </Label>
            <Input
              id="pulse-duration"
              type="number"
              step="0.5"
              min="1"
              max="10"
              value={pulseDuration}
              onChange={(e) => setPulseDuration(e.target.value)}
              placeholder="3.5"
              className="h-11 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
            />
            <p className="text-xs text-gray-400">
              Valores menores = pulsação mais rápida | Valores maiores = pulsação mais lenta (recomendado: 2-5 segundos)
            </p>
          </div>
          
          <Button 
            onClick={handleSavePulseDuration}
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            {loading ? "Salvando..." : "Salvar Configuração"}
          </Button>
        </div>
      </Card>

      {/* Configurações de Segurança */}
      <Card className="p-6 bg-gray-900 border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-red-600/20">
            <Shield className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Segurança</h3>
            <p className="text-sm text-gray-400">Configure restrições de acesso ao checkout</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <Checkbox
              id="mobile-only"
              checked={mobileOnly}
              onCheckedChange={(checked) => setMobileOnly(checked as boolean)}
              className="border-gray-600"
            />
            <div className="flex-1">
              <Label htmlFor="mobile-only" className="text-sm font-medium text-gray-300 cursor-pointer flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Permitir apenas dispositivos móveis no checkout
              </Label>
              <p className="text-xs text-gray-400 mt-1">
                Usuários de computadores serão redirecionados para o link abaixo
              </p>
            </div>
          </div>

          {mobileOnly && (
            <div className="space-y-2">
              <Label htmlFor="desktop-redirect" className="text-sm font-medium text-gray-300">
                URL de Redirecionamento (Desktop)
              </Label>
              <Input
                id="desktop-redirect"
                type="url"
                value={desktopRedirectUrl}
                onChange={(e) => setDesktopRedirectUrl(e.target.value)}
                placeholder="https://exemplo.com/redirecionamento"
                className="h-11 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
              <p className="text-xs text-gray-400">
                Link para onde usuários de computador serão redirecionados
              </p>
            </div>
          )}
          
          <Button 
            onClick={handleSaveSecuritySettings}
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
          >
            {loading ? "Salvando..." : "Salvar Configurações de Segurança"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
