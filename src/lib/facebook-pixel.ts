// Facebook Pixel helper functions

declare global {
  interface Window {
    fbq: any;
  }
}

// Flag global para evitar múltiplas inicializações
let pixelInitialized = false;

export const initFacebookPixel = (pixelId: string) => {
  if (!pixelId) return;
  
  // Check if pixel is already initialized
  if (window.fbq && pixelInitialized) {
    console.log('⚠️  Facebook Pixel já foi inicializado, ignorando nova inicialização');
    return;
  }
  
  // Facebook Pixel Code
  (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    'script',
    'https://connect.facebook.net/en_US/fbevents.js'
  );

  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');
  pixelInitialized = true;
  console.log('✅ Facebook Pixel inicializado:', pixelId);
};

// Flag para evitar múltiplos InitiateCheckout
let checkoutInitiated = false;

export const trackInitiateCheckout = (value: number, currency: string = 'BRL') => {
  if (window.fbq && !checkoutInitiated) {
    window.fbq('track', 'InitiateCheckout', {
      value: value,
      currency: currency,
    });
    checkoutInitiated = true;
    console.log('📊 Evento InitiateCheckout disparado');
  } else if (checkoutInitiated) {
    console.log('⚠️  InitiateCheckout já foi disparado, ignorando');
  }
};

export const trackPurchase = (value: number, currency: string = 'BRL', transactionId?: string) => {
  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      value: value,
      currency: currency,
      transaction_id: transactionId,
    });
  }
};

export const trackAddToCart = (value: number, currency: string = 'BRL') => {
  if (window.fbq) {
    window.fbq('track', 'AddToCart', {
      value: value,
      currency: currency,
    });
  }
};
