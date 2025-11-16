import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { StepTabs } from "@/components/StepTabs";
import { InputField } from "@/components/InputField";
import { CheckoutButton } from "@/components/CheckoutButton";
import { Footer } from "@/components/Footer";
import { UpsellOffer } from "@/components/UpsellOffer";
import { PixModal } from "@/components/PixModal";
import { cpfMask, phoneMask, validateCPF, validateEmail } from "@/utils/masks";
import { useToast } from "@/hooks/use-toast";
import { supabaseClient as supabase } from "@/lib/supabase-helpers";
import { initFacebookPixel, trackInitiateCheckout, trackPurchase, trackAddToCart } from "@/lib/facebook-pixel";
import { createPix, checkPixStatus } from "@/lib/pix-api";
import "@/lib/security"; // Carrega proteções de segurança

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  
  // Form data
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // PIX modal
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixData, setPixData] = useState<{ qrCode: string; qrCodeBase64: string; pixId: string; paymentStatus?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [purchaseTracked, setPurchaseTracked] = useState(false); // Flag para evitar múltiplos eventos Purchase
  
  // Upsell state
  interface Upsell {
    id: string;
    title: string;
    description: string;
    price: string;
    original_price: string;
    image_url: string;
    order: number;
  }
  
  const [upsells, setUpsells] = useState<Upsell[]>([]);
  const [selectedUpsells, setSelectedUpsells] = useState<Set<string>>(new Set());
  
  // Guarantee image
  const [guaranteeImageUrl, setGuaranteeImageUrl] = useState(new URL('../assets/garantia-30-dias.png', import.meta.url).href);
  
  // Product image
  const [productImageUrl, setProductImageUrl] = useState("https://via.placeholder.com/80x80?text=Produto");
  
  // Main product price
  const [mainProductPrice, setMainProductPrice] = useState(67.00);
  
  // Checkout theme
  const [checkoutTheme, setCheckoutTheme] = useState("default");
  
  // Pulse duration for blackwhite theme
  const [pulseDuration, setPulseDuration] = useState("3.5s");
  
  // Fields configuration mode
  const [fieldsMode, setFieldsMode] = useState("full");
  
  // Transaction ID
  const [transactionId, setTransactionId] = useState<string | null>(null);
  
  // Pixel configuration
  const [pixelOnCheckout, setPixelOnCheckout] = useState(false);
  const [pixelOnPurchase, setPixelOnPurchase] = useState(true);
  
  // Payment status
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');

  // Security: Check mobile-only and IP blocking
  useEffect(() => {
    const checkSecurity = async () => {
      // Get user IP
      let userIP = '';
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        userIP = ipData.ip;
      } catch (error) {
        console.error('Error getting IP:', error);
      }

      // Check if IP is blocked
      if (userIP) {
        const { data: blockedIPs } = await supabase
          .from('blocked_ips' as any)
          .select('*')
          .eq('ip_address', userIP)
          .eq('active', true)
          .maybeSingle();
        
        if (blockedIPs) {
          const redirectUrl = (blockedIPs as any).redirect_url || 'https://google.com';
          window.location.href = redirectUrl;
          return;
        }
      }

      // Check mobile-only setting
      const { data: mobileOnlyData } = await supabase
        .from('site_config' as any)
        .select('*')
        .eq('key', 'mobile_only_checkout')
        .maybeSingle();
      
      if (mobileOnlyData && (mobileOnlyData as any).value === 'true') {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (!isMobile) {
          const { data: redirectData } = await supabase
            .from('site_config' as any)
            .select('*')
            .eq('key', 'desktop_redirect_url')
            .maybeSingle();
          
          const redirectUrl = redirectData ? (redirectData as any).value : 'https://google.com';
          if (redirectUrl) {
            window.location.href = redirectUrl;
          }
        }
      }
    };

    checkSecurity();
  }, []);

  // Initialize Facebook Pixel
  useEffect(() => {
    const loadPixelConfig = async () => {
      const { data } = await supabase
        .from('site_config' as any)
        .select('*')
        .in('key', ['facebook_pixel_id', 'pixel_on_checkout', 'pixel_on_purchase']);
      
      let pixelId = '';
      let onCheckout = false;
      let onPurchase = true;
      
      if (data) {
        (data as any[]).forEach((config: any) => {
          if (config.key === 'facebook_pixel_id') pixelId = config.value;
          if (config.key === 'pixel_on_checkout') onCheckout = config.value === 'true';
          if (config.key === 'pixel_on_purchase') onPurchase = config.value === 'true';
        });
      }
      
      setPixelOnCheckout(onCheckout);
      setPixelOnPurchase(onPurchase);
      
      if (pixelId) {
        initFacebookPixel(pixelId);
      }
    };
    
    loadPixelConfig();
  }, []);

  // Verificação automática instantânea do pagamento (1 segundo)
  useEffect(() => {
    if (!pixData?.pixId) return;

    setIsCheckingPayment(true);
    
    const checkPayment = async () => {
      try {
        // Usar helper que funciona automaticamente em localhost e Vercel
        const data = await checkPixStatus(pixData.pixId);

        console.log('Auto-check PIX status:', data);

        if (data && data.status === 'paid') {
          setIsCheckingPayment(false);
          setPixData(prev => prev ? { ...prev, paymentStatus: 'paid' } : null);
          
          // Calcular valor total para o pixel
          const upsellTotal = Array.from(selectedUpsells).reduce((sum, upsellId) => {
            const upsell = upsells.find(u => u.id === upsellId);
            if (upsell) {
              const cleanPrice = upsell.price.replace(/[R$\s]/g, '').replace(',', '.');
              return sum + (parseFloat(cleanPrice) || 0);
            }
            return sum;
          }, 0);
          const totalValueInReais = mainProductPrice + upsellTotal;
          
          // Atualizar status da transação no banco de dados
          const { error: updateError } = await supabase
            .from('transactions')
            .update({ status: 'paid' })
            .eq('pix_id', pixData.pixId);
          
          if (updateError) {
            console.error('Error updating transaction:', updateError);
          }
          
          // Disparar evento de compra do Facebook Pixel APENAS UMA VEZ
          if (window.fbq && pixelOnPurchase && !purchaseTracked) {
            console.log('📊 Disparando evento Purchase do Facebook Pixel');
            trackPurchase(totalValueInReais, 'BRL', pixData.pixId);
            setPurchaseTracked(true); // Marcar como já disparado
          }
        }
      } catch (error) {
        console.error('Error auto-checking payment:', error);
      }
    };

    // Verifica imediatamente e depois a cada 1 segundo para resposta instantânea
    checkPayment();
    const interval = setInterval(checkPayment, 1000);

    return () => {
      clearInterval(interval);
      setIsCheckingPayment(false);
    };
  }, [pixData?.pixId, selectedUpsells, upsells, mainProductPrice, pixelOnPurchase, purchaseTracked]);

  // Load upsell config from database
  useEffect(() => {
    const loadUpsellConfig = async () => {
      const { data } = await supabase
        .from('upsell_config' as any)
        .select('*')
        .eq('active', true)
        .order('order', { ascending: true });
      
      if (data) {
        setUpsells(data as Upsell[]);
      }
    };
    
    const loadGuaranteeImage = async () => {
      const { data } = await supabase
        .from('site_config' as any)
        .select('value')
        .eq('key', 'guarantee_image_url')
        .maybeSingle();
      
      if (data && (data as any).value) {
        // If it's a relative path, convert it
        if ((data as any).value.startsWith('/src/')) {
          setGuaranteeImageUrl(new URL((data as any).value.replace('/src/', '../'), import.meta.url).href);
        } else {
          setGuaranteeImageUrl((data as any).value);
        }
      }
    };
    
    const loadProductImage = async () => {
      const { data } = await supabase
        .from('site_config' as any)
        .select('value')
        .eq('key', 'product_image_url')
        .maybeSingle();
      
      if (data && (data as any).value) {
        // If it's a relative path, convert it
        if ((data as any).value.startsWith('/src/')) {
          setProductImageUrl(new URL((data as any).value.replace('/src/', '../'), import.meta.url).href);
        } else {
          setProductImageUrl((data as any).value);
        }
      }
    };
    
    const loadMainProductPrice = async () => {
      const { data } = await supabase
        .from('site_config' as any)
        .select('value')
        .eq('key', 'main_product_price')
        .maybeSingle();
      
      if (data && (data as any).value) {
        setMainProductPrice(parseFloat((data as any).value));
      }
    };
    
    const loadTheme = async () => {
      const { data } = await supabase
        .from('site_config' as any)
        .select('value')
        .eq('key', 'checkout_theme')
        .maybeSingle();
      
      if (data && (data as any).value) {
        setCheckoutTheme((data as any).value);
      }
    };
    
    const loadPulseDuration = async () => {
      const { data } = await supabase
        .from('site_config' as any)
        .select('value')
        .eq('key', 'blackwhite_pulse_duration')
        .maybeSingle();
      
      if (data && (data as any).value) {
        setPulseDuration((data as any).value);
      }
    };
    
    const loadFieldsMode = async () => {
      const { data } = await supabase
        .from('site_config' as any)
        .select('value')
        .eq('key', 'checkout_fields_mode')
        .maybeSingle();
      
      if (data && (data as any).value) {
        setFieldsMode((data as any).value);
      }
    };
    
    loadUpsellConfig();
    loadGuaranteeImage();
    loadProductImage();
    loadMainProductPrice();
    loadTheme();
    loadPulseDuration();
    loadFieldsMode();
  }, []);
  
  // Monitor transaction status for Purchase event
  useEffect(() => {
    if (!transactionId) return;
    
    const channel = supabase
      .channel('transaction-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
          filter: `id=eq.${transactionId}`
        },
        (payload) => {
          const newStatus = (payload.new as any).status;
          setPaymentStatus(newStatus);
          
          // Disparar Purchase apenas se ainda não foi disparado
          if (newStatus === 'paid' && pixelOnPurchase && !purchaseTracked) {
            const totalValue = (payload.new as any).total_value;
            console.log('📊 Disparando evento Purchase via subscription');
            trackPurchase(totalValue, 'BRL', transactionId);
            setPurchaseTracked(true); // Marcar como já disparado
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [transactionId, pixelOnPurchase, purchaseTracked]);

  const validateStep = (step: number): boolean => {
    // Aceita qualquer dado fornecido - sem validação obrigatória
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      // Apenas valida formato se o campo foi preenchido
      if (email && !validateEmail(email)) {
        newErrors.email = "E-mail inválido";
      }
      if (phone && phone.replace(/\D/g, "").length > 0 && phone.replace(/\D/g, "").length < 10) {
        newErrors.phone = "Telefone inválido";
      }
      if (cpf && !validateCPF(cpf)) {
        newErrors.cpf = "CPF inválido";
      }
    } else if (step === 1 && fieldsMode === "full") {
      // Valida formato de whatsapp apenas se foi preenchido
      if (whatsapp && whatsapp.replace(/\D/g, "").length > 0 && whatsapp.replace(/\D/g, "").length < 10) {
        newErrors.whatsapp = "WhatsApp inválido";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (validateStep(currentStep)) {
      // Salva dados no banco ao sair do step 0
      if (currentStep === 0) {
        try {
          // Get user IP
          let userIP = '';
          try {
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            userIP = ipData.ip;
          } catch (error) {
            console.error('Error getting IP:', error);
          }

          // Monta o objeto apenas com os campos que foram preenchidos
          const insertData: any = {
            name: name || 'Não informado',
            total_value: mainProductPrice,
            status: 'pending',
            upsell_added: false,
            ip_address: userIP || null
          };
          
          // Adiciona campos baseado no modo selecionado
          if (fieldsMode === "name_email") {
            insertData.email = email || '';
            insertData.phone = '';
            insertData.cpf = '';
            insertData.whatsapp = '';
          } else if (fieldsMode === "name_whatsapp") {
            insertData.email = '';
            insertData.phone = whatsapp || ''; // Salva whatsapp no campo phone
            insertData.cpf = '';
            insertData.whatsapp = whatsapp || '';
          } else {
            // Modo completo
            insertData.email = email || '';
            insertData.phone = phone || '';
            insertData.cpf = cpf || '';
            insertData.whatsapp = '';
          }
          
          console.log('Salvando transação:', insertData);
          
          const { data, error } = await supabase
            .from('transactions' as any)
            .insert(insertData)
            .select()
            .single();
          
          if (error) throw error;
          
          if (data) {
            setTransactionId((data as any).id);
            console.log('Transação salva com ID:', (data as any).id);
          }
        } catch (error) {
          console.error('Error saving transaction:', error);
          toast({
            title: "Erro",
            description: "Não foi possível salvar os dados",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Update whatsapp quando sair do step 1 (somente em modo full)
      if (currentStep === 1 && transactionId && fieldsMode === "full") {
        try {
          await supabase
            .from('transactions' as any)
            .update({ whatsapp: whatsapp || '' } as any)
            .eq('id', transactionId);
        } catch (error) {
          console.error('Error updating whatsapp:', error);
        }
      }
      
      // Pula para etapa de pagamento se não for modo full
      const maxStep = fieldsMode === "full" ? 2 : 1;
      if (currentStep < maxStep) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePayment = async () => {
    if (!validateStep(0) || !validateStep(1)) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos corretamente",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Calculate total value based on upsell
      const upsellTotal = Array.from(selectedUpsells).reduce((sum, upsellId) => {
        const upsell = upsells.find(u => u.id === upsellId);
        if (upsell) {
          // Remove "R$" and any spaces, then replace comma with dot for parsing
          const cleanPrice = upsell.price.replace(/[R$\s]/g, '').replace(',', '.');
          const priceValue = parseFloat(cleanPrice) || 0;
          console.log(`Upsell ${upsell.title}: preço="${upsell.price}", limpo="${cleanPrice}", valor em reais=${priceValue}`);
          return sum + priceValue;
        }
        return sum;
      }, 0);
      
      const baseValue = mainProductPrice;
      const totalValueInReais = baseValue + upsellTotal;
      const totalValueInCents = Math.round(totalValueInReais * 100); // Converter para centavos
      
      console.log('Cálculo completo:', {
        baseValueInReais: baseValue,
        upsellTotalInReais: upsellTotal,
        totalValueInReais,
        totalValueInCents,
        description: 'Valor enviado ao PIX em centavos (mínimo 50 centavos)'
      });
      
      console.log('Cálculo do pagamento:', {
        baseValue,
        upsellTotal,
        totalValueInReais,
        totalValueInCents,
        selectedUpsells: Array.from(selectedUpsells)
      });

      // Validação mínima da Pushinpay: 50 centavos
      if (totalValueInCents < 50) {
        toast({
          title: "Erro",
          description: "O valor mínimo para pagamento PIX é R$ 0,50",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      console.log('💰 Criando PIX com valor:', totalValueInCents, 'centavos');
      
      // Usar helper que funciona automaticamente em localhost e Vercel
      const data = await createPix(totalValueInCents);

      console.log('✅ PIX criado com sucesso!', data);
      
      // Update transaction with PIX ID and upsell info
      if (transactionId) {
        await supabase
          .from('transactions' as any)
          .update({
            pix_id: (data as any).id,
            upsell_added: selectedUpsells.size > 0,
            total_value: totalValueInReais,
            status: 'awaiting_payment'
          } as any)
          .eq('id', transactionId);
      }
      
      // Dados já vêm formatados do helper
      const { id: pixId, copiaCola, qrCode } = data;
      
      if (!copiaCola) {
        console.error('❌ Código PIX não encontrado na resposta:', data);
        toast({
          title: "Erro",
          description: "Não foi possível obter o código PIX. Verifique o console.",
          variant: "destructive",
        });
        throw new Error('Código PIX não encontrado na resposta da API');
      }
      
      if (!pixId) {
        console.error('❌ ID da transação não encontrado:', data);
        throw new Error('ID da transação não encontrado');
      }
      
      // Dados formatados: copiaCola = código PIX, qrCode = imagem QR Code
      setPixData({
        qrCode: copiaCola, // Código PIX copia e cola (string longa)
        qrCodeBase64: qrCode, // QR Code em base64 (data:image/png;base64,...)
        pixId: pixId,
      });
      
      console.log('✅ PIX Data configurado:', {
        pixId,
        copiaColaLength: copiaCola.length,
        qrCodeLength: qrCode.length,
      });
      
      // Track InitiateCheckout event when opening PIX modal
      if (pixelOnCheckout) {
        trackInitiateCheckout(totalValueInReais, 'BRL');
      }
      
      setShowPixModal(true);
    } catch (error) {
      console.error('Erro completo ao processar pagamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Theme-based styles
  const getThemeClasses = () => {
    switch (checkoutTheme) {
      case "dark":
        return {
          background: "bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900",
          card: "bg-gray-800 border-gray-700",
          mainCard: "bg-gray-800 border-2 border-purple-500",
          text: "text-gray-100",
          mutedText: "text-gray-400",
          button: "bg-purple-600 hover:bg-purple-700 text-white",
          continueButton: "bg-purple-600 hover:bg-purple-700 text-white",
          upsellButton: "bg-purple-600 hover:bg-purple-700 text-white rounded-full",
        };
      case "conversion":
        return {
          background: "bg-gradient-to-b from-orange-50 via-yellow-50 to-orange-50",
          card: "bg-white border-orange-200",
          mainCard: "bg-gradient-to-br from-orange-500 to-red-500 border-2 border-orange-600 text-white",
          text: "text-gray-900",
          mutedText: "text-gray-600",
          button: "bg-green-600 hover:bg-green-700 text-white",
          continueButton: "bg-green-600 hover:bg-green-700 text-white",
          upsellButton: "bg-green-600 hover:bg-green-700 text-white rounded-full",
        };
      case "minimalist":
        return {
          background: "bg-white",
          card: "bg-white border-gray-200",
          mainCard: "bg-white border-2 border-gray-300",
          text: "text-gray-900",
          mutedText: "text-gray-600",
          button: "bg-green-600 hover:bg-green-700 text-white",
          continueButton: "bg-green-600 hover:bg-green-700 text-white",
          upsellButton: "bg-green-600 hover:bg-green-700 text-white rounded-full",
        };
      case "blackwhite":
        return {
          background: "bg-white",
          card: "bg-white border-black",
          mainCard: "bg-white border-2 border-green-600",
          text: "text-black",
          mutedText: "text-gray-600",
          button: "bg-green-600 hover:bg-green-700 text-white",
          continueButton: "bg-black hover:bg-gray-800 text-white",
          upsellButton: "bg-green-600 hover:bg-green-700 text-white rounded-full",
        };
      default: // "default"
        return {
          background: "bg-background",
          card: "bg-card border-border",
          mainCard: "bg-card border-2 border-primary",
          text: "text-foreground",
          mutedText: "text-muted-foreground",
          button: "bg-primary hover:bg-primary/90 text-primary-foreground",
          continueButton: "bg-primary hover:bg-primary/90 text-primary-foreground",
          upsellButton: "bg-green-600 hover:bg-green-700 text-white rounded-full",
        };
    }
  };

  const themeClasses = getThemeClasses();

  return (
    <div className={`min-h-screen flex flex-col ${themeClasses.background}`}>
      <Header />
      
      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-6">
        <StepTabs currentStep={currentStep} onStepChange={setCurrentStep} fieldsMode={fieldsMode} />

        <div className="mt-6">
          {currentStep === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Dados pessoais
              </h2>
              
              <InputField
                label="Nome completo"
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
              />
              
              {fieldsMode === "name_email" && (
                <InputField
                  label="E-mail"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                />
              )}
              
              {fieldsMode === "name_whatsapp" && (
                <InputField
                  label="WhatsApp para receber o produto"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(phoneMask(e.target.value))}
                  error={errors.whatsapp}
                />
              )}
              
              {fieldsMode === "full" && (
                <>
                  <InputField
                    label="E-mail"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                  />
                  
                  <InputField
                    label="Celular"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={(e) => setPhone(phoneMask(e.target.value))}
                    error={errors.phone}
                  />
                  
                  <InputField
                    label="CPF"
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(cpfMask(e.target.value))}
                    error={errors.cpf}
                  />
                </>
              )}

              <div className="pt-4">
                <CheckoutButton onClick={handleContinue} className={themeClasses.continueButton}>
                  Continuar
                </CheckoutButton>
              </div>
            </div>
          )}

          {currentStep === 1 && fieldsMode === "full" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Entrega do produto
              </h2>
              
              <InputField
                label="WhatsApp para receber o produto"
                type="tel"
                placeholder="+55 (__) _____-____"
                value={whatsapp}
                onChange={(e) => setWhatsapp(phoneMask(e.target.value))}
                error={errors.whatsapp}
              />
              
              <p className="text-sm text-muted-foreground">
                Usaremos este número para enviar as informações de entrega.
              </p>

              <div className="pt-4">
                <CheckoutButton onClick={handleContinue} className={themeClasses.continueButton}>
                  Continuar
                </CheckoutButton>
              </div>
            </div>
          )}

          {((currentStep === 2 && fieldsMode === "full") || (currentStep === 1 && fieldsMode !== "full")) && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Pagamento
              </h2>

              {/* Produto Principal */}
              <div className={`${themeClasses.mainCard} rounded-xl p-6`}>
                <div className={`flex flex-col items-center text-center space-y-4 ${checkoutTheme === 'conversion' ? 'text-white' : ''}`}>
                  {productImageUrl && (
                    <img 
                      src={productImageUrl} 
                      alt="Dieta Hormonal Natural"
                      className="max-w-full rounded-lg"
                    />
                  )}
                  <div>
                    <p className={`text-lg font-bold ${checkoutTheme === 'conversion' ? 'text-white' : themeClasses.text}`}>
                      Dieta Hormonal Natural
                    </p>
                    <p className={`text-sm ${checkoutTheme === 'conversion' ? 'text-white/80' : themeClasses.mutedText}`}>
                      Acesso imediato
                    </p>
                  </div>
                  <p className={`text-2xl font-bold ${
                    checkoutTheme === 'conversion' ? 'text-white' : 
                     checkoutTheme === 'blackwhite' ? 'text-green-600' : 
                     'text-primary'
                   }`}>
                     R$ {mainProductPrice.toFixed(2).replace('.', ',')}
                   </p>
                </div>
              </div>

              {/* Upsells */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground mb-2">Aproveite estas ofertas especiais:</p>
                {upsells.map((upsell) => (
                  <UpsellOffer 
                    key={upsell.id}
                    title={upsell.title}
                    description={upsell.description}
                    price={upsell.price}
                    originalPrice={upsell.original_price}
                    imageUrl={upsell.image_url}
                    buttonClassName={themeClasses.upsellButton}
                    onToggle={(added) => {
                      const newSelected = new Set(selectedUpsells);
                      if (added) {
                        newSelected.add(upsell.id);
                        // Track AddToCart event
                        const upsellPrice = parseFloat(upsell.price.replace(/[R$\s]/g, '').replace(',', '.')) || 0;
                        trackAddToCart(upsellPrice);
                      } else {
                        newSelected.delete(upsell.id);
                      }
                      setSelectedUpsells(newSelected);
                    }}
                  />
                ))}
              </div>

              {/* Banner Garantia */}
              <div className="rounded-xl overflow-hidden">
                <img 
                  src={guaranteeImageUrl}
                  alt="Garantia de 30 dias"
                  className="w-full"
                />
              </div>

              {/* Botão e Total */}
              <div className="space-y-3">
                <CheckoutButton 
                  onClick={handlePayment} 
                  loading={loading} 
                  className={themeClasses.button}
                  animate={checkoutTheme === 'blackwhite'}
                  pulseDuration={pulseDuration}
                >
                  Pagar com PIX
                </CheckoutButton>
                
                <p className="text-center text-xl font-bold text-foreground">
                  Valor total: R$ {(mainProductPrice + Array.from(selectedUpsells).reduce((sum, id) => {
                    const upsell = upsells.find(u => u.id === id);
                    return sum + (upsell ? parseFloat(upsell.price.replace(',', '.')) : 0);
                  }, 0)).toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {showPixModal && pixData && (
        <PixModal
          qrCode={pixData.qrCode}
          qrCodeBase64={pixData.qrCodeBase64}
          pixId={pixData.pixId}
          onClose={() => setShowPixModal(false)}
          paymentStatus={pixData.paymentStatus}
          isCheckingPayment={isCheckingPayment}
        />
      )}
    </div>
  );
};

export default Checkout;
