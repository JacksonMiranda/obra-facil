// Supabase Database TypeScript types
// Generated from schema — per spec_tech.md: TypeScript + Prisma-style strong typing

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'client' | 'professional' | 'store';
export type MessageType = 'text' | 'image' | 'audio' | 'material_list';
export type MaterialListStatus = 'draft' | 'sent' | 'quoted';
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered';
export type WorkStatus = 'scheduled' | 'active' | 'completed';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          clerk_id: string;
          full_name: string;
          avatar_url: string | null;
          phone: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_id: string;
          full_name: string;
          avatar_url?: string | null;
          phone?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: never[];
      };
      professionals: {
        Row: {
          id: string;
          profile_id: string;
          specialty: string;
          bio: string | null;
          rating_avg: number;
          jobs_completed: number;
          is_verified: boolean;
          latitude: number | null;
          longitude: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          specialty: string;
          bio?: string | null;
          rating_avg?: number;
          jobs_completed?: number;
          is_verified?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['professionals']['Insert']>;
        Relationships: never[];
      };
      services: {
        Row: {
          id: string;
          name: string;
          icon_name: string;
          description: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          name: string;
          icon_name: string;
          description?: string | null;
          sort_order?: number;
        };
        Update: Partial<Database['public']['Tables']['services']['Insert']>;
        Relationships: never[];
      };
      reviews: {
        Row: {
          id: string;
          professional_id: string;
          reviewer_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          professional_id: string;
          reviewer_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
        Relationships: never[];
      };
      conversations: {
        Row: {
          id: string;
          client_id: string;
          professional_id: string;
          created_at: string;
          last_message_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          professional_id: string;
          created_at?: string;
          last_message_at?: string;
        };
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>;
        Relationships: never[];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          type: MessageType;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          type?: MessageType;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
        Relationships: never[];
      };
      material_lists: {
        Row: {
          id: string;
          conversation_id: string;
          professional_id: string;
          status: MaterialListStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          professional_id: string;
          status?: MaterialListStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['material_lists']['Insert']>;
        Relationships: never[];
      };
      material_items: {
        Row: {
          id: string;
          material_list_id: string;
          name: string;
          quantity: number;
          unit: string;
          brand: string | null;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          material_list_id: string;
          name: string;
          quantity: number;
          unit?: string;
          brand?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['material_items']['Insert']>;
        Relationships: never[];
      };
      stores: {
        Row: {
          id: string;
          profile_id: string | null;
          name: string;
          address: string | null;
          lat: number | null;
          lng: number | null;
          delivery_time: string | null;
          logo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          name: string;
          address?: string | null;
          lat?: number | null;
          lng?: number | null;
          delivery_time?: string | null;
          logo_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['stores']['Insert']>;
        Relationships: never[];
      };
      store_offers: {
        Row: {
          id: string;
          store_id: string;
          material_list_id: string;
          total_price: number;
          delivery_info: string | null;
          is_best_price: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          material_list_id: string;
          total_price: number;
          delivery_info?: string | null;
          is_best_price?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['store_offers']['Insert']>;
        Relationships: never[];
      };
      orders: {
        Row: {
          id: string;
          client_id: string;
          store_id: string;
          material_list_id: string | null;
          status: OrderStatus;
          total_amount: number;
          order_number: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          store_id: string;
          material_list_id?: string | null;
          status?: OrderStatus;
          total_amount: number;
          order_number: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
        Relationships: never[];
      };
      works: {
        Row: {
          id: string;
          client_id: string;
          professional_id: string;
          title: string;
          status: WorkStatus;
          progress_pct: number;
          next_step: string | null;
          photos: string[];
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          professional_id: string;
          title: string;
          status?: WorkStatus;
          progress_pct?: number;
          next_step?: string | null;
          photos?: string[];
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['works']['Insert']>;
        Relationships: never[];
      };
    };
    Views: Record<string, { Row: Record<string, unknown>; Relationships: never[] }>;
    Functions: Record<string, { Args: Record<string, unknown>; Returns: unknown }>;
    Enums: {
      user_role: 'client' | 'professional' | 'store';
      message_type: 'text' | 'image' | 'audio' | 'material_list';
      material_list_status: 'draft' | 'sent' | 'quoted';
      order_status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
      work_status: 'scheduled' | 'active' | 'completed';
    };
    CompositeTypes: Record<string, never>;
  };
}

// Joined types (convenience for UI)
export type ProfileWithProfessional = Database['public']['Tables']['profiles']['Row'] & {
  professionals: Database['public']['Tables']['professionals']['Row'] | null;
};

export type ProfessionalWithProfile = Database['public']['Tables']['professionals']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'];
};

export type ReviewWithReviewer = Database['public']['Tables']['reviews']['Row'] & {
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'full_name' | 'avatar_url'>;
};

export type MessageWithSender = Database['public']['Tables']['messages']['Row'] & {
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'full_name' | 'avatar_url'>;
};

export type StoreOfferWithStore = Database['public']['Tables']['store_offers']['Row'] & {
  stores: Database['public']['Tables']['stores']['Row'];
};

export type OrderWithStore = Database['public']['Tables']['orders']['Row'] & {
  stores: Pick<Database['public']['Tables']['stores']['Row'], 'id' | 'name' | 'logo_url'>;
};

export type WorkWithProfessional = Database['public']['Tables']['works']['Row'] & {
  professionals: ProfessionalWithProfile;
};

// ── Row type aliases (convenience shorthand) ────────────────────────────────
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Professional = Database['public']['Tables']['professionals']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type MaterialList = Database['public']['Tables']['material_lists']['Row'];
export type MaterialItem = Database['public']['Tables']['material_items']['Row'];
export type Store = Database['public']['Tables']['stores']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type Work = Database['public']['Tables']['works']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
