import { supabase } from "@/integrations/supabase/client";

// Helper to bypass TypeScript errors with Supabase types
export const supabaseClient = supabase as any;
