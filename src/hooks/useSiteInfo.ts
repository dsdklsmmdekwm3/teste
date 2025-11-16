import { useEffect } from 'react';
import { supabaseClient as supabase } from '@/lib/supabase-helpers';

export function useSiteInfo() {
  useEffect(() => {
    const loadSiteInfo = async () => {
      try {
        // Carregar título
        const { data: titleData } = await supabase
          .from('site_config' as any)
          .select('*')
          .eq('key', 'site_title')
          .maybeSingle();
        
        if (titleData && (titleData as any).value) {
          document.title = (titleData as any).value;
        }

        // Carregar favicon
        const { data: faviconData } = await supabase
          .from('site_config' as any)
          .select('*')
          .eq('key', 'favicon_url')
          .maybeSingle();
        
        if (faviconData && (faviconData as any).value) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = (faviconData as any).value;
        }
      } catch (error) {
        console.error('Error loading site info:', error);
      }
    };

    loadSiteInfo();
  }, []);
}

