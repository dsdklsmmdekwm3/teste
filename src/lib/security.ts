// Sistema de proteções de segurança
// Carrega configurações do Supabase e aplica proteções

let securitySettings: {
  disableRightClick: boolean;
  disableCopy: boolean;
  disableDevTools: boolean;
  disableTextSelection: boolean;
  disableShortcuts: boolean;
  blurOnInspect: boolean;
} = {
  disableRightClick: false, // Desabilitado para permitir edição
  disableCopy: false, // Desabilitado para permitir edição
  disableDevTools: true,
  disableTextSelection: false, // Desabilitado para permitir edição
  disableShortcuts: false, // Desabilitado para permitir edição
  blurOnInspect: true,
};

export async function loadSecuritySettings() {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase
      .from('site_config' as any)
      .select('*')
      .in('key', [
        'disable_right_click',
        'disable_copy',
        'disable_devtools',
        'disable_text_selection',
        'disable_shortcuts',
        'blur_on_inspect'
      ]);

    if (error) {
      console.error('Erro ao carregar configurações de segurança:', error);
      // Usar valores padrão se houver erro
      applySecurityProtections();
      return;
    }

    if (data && data.length > 0) {
      (data as any[]).forEach((item: any) => {
        if (item.key === 'disable_right_click') securitySettings.disableRightClick = item.value === 'true';
        if (item.key === 'disable_copy') securitySettings.disableCopy = item.value === 'true';
        if (item.key === 'disable_devtools') securitySettings.disableDevTools = item.value === 'true';
        if (item.key === 'disable_text_selection') securitySettings.disableTextSelection = item.value === 'true';
        if (item.key === 'disable_shortcuts') securitySettings.disableShortcuts = item.value === 'true';
        if (item.key === 'blur_on_inspect') securitySettings.blurOnInspect = item.value === 'true';
      });
    }

    applySecurityProtections();
  } catch (error) {
    console.error('Erro ao carregar segurança:', error);
    // Aplicar proteções padrão mesmo com erro
    applySecurityProtections();
  }
}

function applySecurityProtections() {
  // 1. Bloquear botão direito (exceto em campos editáveis)
  if (securitySettings.disableRightClick) {
    document.addEventListener('contextmenu', (e) => {
      const target = e.target as HTMLElement;
      // Permitir botão direito em campos editáveis
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      e.preventDefault();
      return false;
    });
  }

  // 2. Bloquear cópia (exceto em campos editáveis)
  if (securitySettings.disableCopy) {
    document.addEventListener('copy', (e) => {
      const target = e.target as HTMLElement;
      // Permitir cópia em campos editáveis
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      e.preventDefault();
      return false;
    });
    
    document.addEventListener('cut', (e) => {
      const target = e.target as HTMLElement;
      // Permitir cortar em campos editáveis
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      e.preventDefault();
      return false;
    });
  }

  // 3. Bloquear seleção de texto (exceto em campos editáveis)
  if (securitySettings.disableTextSelection) {
    document.addEventListener('selectstart', (e) => {
      const target = e.target as HTMLElement;
      // Permitir seleção em campos editáveis
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      e.preventDefault();
      return false;
    });
    
    document.addEventListener('dragstart', (e) => {
      const target = e.target as HTMLElement;
      // Permitir drag em campos editáveis
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      e.preventDefault();
      return false;
    });

    // CSS para desabilitar seleção (exceto campos editáveis)
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
      }
      input, textarea, [contenteditable="true"] {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
    `;
    document.head.appendChild(style);
  }

  // 4. Bloquear DevTools e atalhos
  if (securitySettings.disableDevTools || securitySettings.disableShortcuts) {
    document.addEventListener('keydown', (e) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+C (Inspector)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return false;
      }

      // Ctrl+U (View Source)
      if (securitySettings.disableShortcuts && e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }

      // Ctrl+S (Save)
      if (securitySettings.disableShortcuts && e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
      }

      // Ctrl+P (Print)
      if (securitySettings.disableShortcuts && e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        return false;
      }

      // Ctrl+A (Select All) - permitir em campos editáveis
      if (securitySettings.disableCopy && e.ctrlKey && e.key === 'a') {
        const target = e.target as HTMLElement;
        // Permitir Ctrl+A em campos editáveis
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }
        e.preventDefault();
        return false;
      }
      
      // Permitir edição de campos de input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return; // Não bloquear em campos editáveis
      }
    });
  }

  // 5. Desfocar ao inspecionar - DESABILITADO para não bloquear acesso
  // if (securitySettings.blurOnInspect) {
  //   let devtools = false;
  //   const element = new Image();
  //   Object.defineProperty(element, 'id', {
  //     get: function() {
  //       devtools = true;
  //       document.body.style.filter = 'blur(10px)';
  //       setTimeout(() => {
  //         document.body.style.filter = '';
  //       }, 100);
  //     }
  //   });
  //   
  //   setInterval(() => {
  //     devtools = false;
  //     try {
  //       console.log(element);
  //     } catch (e) {}
  //     if (devtools) {
  //       document.body.style.filter = 'blur(10px)';
  //     }
  //   }, 1000);
  // }

  // 6. Detectar abertura de DevTools - DESABILITADO para não bloquear acesso
  // if (securitySettings.disableDevTools) {
  //   let devtools = { open: false };
  //   const threshold = 160;
  //   
  //   setInterval(() => {
  //     if (window.outerHeight - window.innerHeight > threshold || 
  //         window.outerWidth - window.innerWidth > threshold) {
  //       if (!devtools.open) {
  //         devtools.open = true;
  //         document.body.style.filter = 'blur(10px)';
  //         // Não usar alert para não ser muito intrusivo
  //       }
  //     } else {
  //       if (devtools.open) {
  //         devtools.open = false;
  //         document.body.style.filter = '';
  //       }
  //     }
  //   }, 500);
  // }
  
  // Garantir que não há blur aplicado
  document.body.style.filter = '';
}

// Inicializar quando o módulo for carregado
// APENAS na página de checkout, não no admin
if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin')) {
  loadSecuritySettings();
}

