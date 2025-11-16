export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      site_config: {
        Row: {
          id: string
          key: string
          value: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          cpf: string
          whatsapp: string | null
          upsell_added: boolean | null
          total_value: number
          status: string | null
          pix_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          cpf: string
          whatsapp?: string | null
          upsell_added?: boolean | null
          total_value?: number
          status?: string | null
          pix_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          cpf?: string
          whatsapp?: string | null
          upsell_added?: boolean | null
          total_value?: number
          status?: string | null
          pix_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      upsell_config: {
        Row: {
          id: string
          title: string
          description: string
          price: string
          original_price: string
          image_url: string | null
          active: boolean | null
          order: number | null
          updated_at: string
        }
        Insert: {
          id?: string
          title?: string
          description?: string
          price?: string
          original_price?: string
          image_url?: string | null
          active?: boolean | null
          order?: number | null
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          price?: string
          original_price?: string
          image_url?: string | null
          active?: boolean | null
          order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
