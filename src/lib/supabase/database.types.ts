export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.4';
  };
  public: {
    Tables: {
      cart_items: {
        Row: {
          created_at: string | null;
          customer_id: string;
          id: string;
          item_id: string;
          quantity: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          customer_id: string;
          id?: string;
          item_id: string;
          quantity: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          customer_id?: string;
          id?: string;
          item_id?: string;
          quantity?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'cart_items_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'cart_items_item_id_fkey';
            columns: ['item_id'];
            isOneToOne: false;
            referencedRelation: 'items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'cart_items_item_id_fkey';
            columns: ['item_id'];
            isOneToOne: false;
            referencedRelation: 'items_with_current_prices';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'cart_items_item_id_fkey';
            columns: ['item_id'];
            isOneToOne: false;
            referencedRelation: 'popular_items';
            referencedColumns: ['id'];
          },
        ];
      };
      categories: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          is_active: boolean | null;
          name: string;
          project_id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean | null;
          name: string;
          project_id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          project_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'categories_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      chat_messages: {
        Row: {
          content: string | null;
          created_at: string | null;
          customer_id: string;
          direction: Database['public']['Enums']['message_direction_enum'];
          id: string;
          is_auto_reply: boolean | null;
          media_url: string | null;
          message_type: Database['public']['Enums']['message_type_enum'] | null;
          project_id: string;
          reply_to_message_id: string | null;
          telegram_message_id: number | null;
        };
        Insert: {
          content?: string | null;
          created_at?: string | null;
          customer_id: string;
          direction: Database['public']['Enums']['message_direction_enum'];
          id?: string;
          is_auto_reply?: boolean | null;
          media_url?: string | null;
          message_type?: Database['public']['Enums']['message_type_enum'] | null;
          project_id: string;
          reply_to_message_id?: string | null;
          telegram_message_id?: number | null;
        };
        Update: {
          content?: string | null;
          created_at?: string | null;
          customer_id?: string;
          direction?: Database['public']['Enums']['message_direction_enum'];
          id?: string;
          is_auto_reply?: boolean | null;
          media_url?: string | null;
          message_type?: Database['public']['Enums']['message_type_enum'] | null;
          project_id?: string;
          reply_to_message_id?: string | null;
          telegram_message_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'chat_messages_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chat_messages_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chat_messages_reply_to_message_id_fkey';
            columns: ['reply_to_message_id'];
            isOneToOne: false;
            referencedRelation: 'chat_messages';
            referencedColumns: ['id'];
          },
        ];
      };
      customer_addresses: {
        Row: {
          address_line_1: string;
          address_line_2: string | null;
          city: string;
          country: string | null;
          created_at: string | null;
          customer_id: string;
          id: string;
          is_default: boolean | null;
          label: string | null;
          postal_code: string | null;
          state_region: string | null;
          updated_at: string | null;
        };
        Insert: {
          address_line_1: string;
          address_line_2?: string | null;
          city: string;
          country?: string | null;
          created_at?: string | null;
          customer_id: string;
          id?: string;
          is_default?: boolean | null;
          label?: string | null;
          postal_code?: string | null;
          state_region?: string | null;
          updated_at?: string | null;
        };
        Update: {
          address_line_1?: string;
          address_line_2?: string | null;
          city?: string;
          country?: string | null;
          created_at?: string | null;
          customer_id?: string;
          id?: string;
          is_default?: boolean | null;
          label?: string | null;
          postal_code?: string | null;
          state_region?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'customer_addresses_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
        ];
      };
      customers: {
        Row: {
          created_at: string | null;
          created_via: string | null;
          email: string | null;
          first_name: string | null;
          id: string;
          is_blocked: boolean | null;
          last_name: string | null;
          notes: string | null;
          phone: string | null;
          preferred_language: string | null;
          project_id: string;
          telegram_user_id: number | null;
          telegram_username: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_via?: string | null;
          email?: string | null;
          first_name?: string | null;
          id?: string;
          is_blocked?: boolean | null;
          last_name?: string | null;
          notes?: string | null;
          phone?: string | null;
          preferred_language?: string | null;
          project_id: string;
          telegram_user_id?: number | null;
          telegram_username?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_via?: string | null;
          email?: string | null;
          first_name?: string | null;
          id?: string;
          is_blocked?: boolean | null;
          last_name?: string | null;
          notes?: string | null;
          phone?: string | null;
          preferred_language?: string | null;
          project_id?: string;
          telegram_user_id?: number | null;
          telegram_username?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'customers_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      health_checks: {
        Row: {
          checked_at: string | null;
          component: Database['public']['Enums']['health_check_component_enum'];
          created_at: string | null;
          details: Json | null;
          id: string;
          message: string | null;
          response_time_ms: number | null;
          status: Database['public']['Enums']['health_check_status_enum'];
          updated_at: string | null;
        };
        Insert: {
          checked_at?: string | null;
          component: Database['public']['Enums']['health_check_component_enum'];
          created_at?: string | null;
          details?: Json | null;
          id?: string;
          message?: string | null;
          response_time_ms?: number | null;
          status?: Database['public']['Enums']['health_check_status_enum'];
          updated_at?: string | null;
        };
        Update: {
          checked_at?: string | null;
          component?: Database['public']['Enums']['health_check_component_enum'];
          created_at?: string | null;
          details?: Json | null;
          id?: string;
          message?: string | null;
          response_time_ms?: number | null;
          status?: Database['public']['Enums']['health_check_status_enum'];
          updated_at?: string | null;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          created_at: string | null;
          due_date: string | null;
          id: string;
          invoice_number: string;
          issued_date: string;
          notes: string | null;
          order_id: string;
          paid_date: string | null;
          project_id: string;
          status: Database['public']['Enums']['invoice_status_enum'] | null;
          subtotal: number;
          tax_amount: number | null;
          total_amount: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          due_date?: string | null;
          id?: string;
          invoice_number: string;
          issued_date?: string;
          notes?: string | null;
          order_id: string;
          paid_date?: string | null;
          project_id: string;
          status?: Database['public']['Enums']['invoice_status_enum'] | null;
          subtotal: number;
          tax_amount?: number | null;
          total_amount: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          due_date?: string | null;
          id?: string;
          invoice_number?: string;
          issued_date?: string;
          notes?: string | null;
          order_id?: string;
          paid_date?: string | null;
          project_id?: string;
          status?: Database['public']['Enums']['invoice_status_enum'] | null;
          subtotal?: number;
          tax_amount?: number | null;
          total_amount?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'invoices_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: true;
            referencedRelation: 'order_summary';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invoices_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: true;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invoices_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      item_images: {
        Row: {
          alt_text: string | null;
          created_at: string | null;
          display_order: number | null;
          id: string;
          image_url: string;
          is_primary: boolean | null;
          item_id: string;
        };
        Insert: {
          alt_text?: string | null;
          created_at?: string | null;
          display_order?: number | null;
          id?: string;
          image_url: string;
          is_primary?: boolean | null;
          item_id: string;
        };
        Update: {
          alt_text?: string | null;
          created_at?: string | null;
          display_order?: number | null;
          id?: string;
          image_url?: string;
          is_primary?: boolean | null;
          item_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'item_images_item_id_fkey';
            columns: ['item_id'];
            isOneToOne: false;
            referencedRelation: 'items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'item_images_item_id_fkey';
            columns: ['item_id'];
            isOneToOne: false;
            referencedRelation: 'items_with_current_prices';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'item_images_item_id_fkey';
            columns: ['item_id'];
            isOneToOne: false;
            referencedRelation: 'popular_items';
            referencedColumns: ['id'];
          },
        ];
      };
      item_prices: {
        Row: {
          base_price: number;
          created_at: string | null;
          discount_percentage: number | null;
          effective_from: string | null;
          effective_until: string | null;
          id: string;
          is_active: boolean | null;
          item_id: string;
          selling_price: number;
        };
        Insert: {
          base_price: number;
          created_at?: string | null;
          discount_percentage?: number | null;
          effective_from?: string | null;
          effective_until?: string | null;
          id?: string;
          is_active?: boolean | null;
          item_id: string;
          selling_price: number;
        };
        Update: {
          base_price?: number;
          created_at?: string | null;
          discount_percentage?: number | null;
          effective_from?: string | null;
          effective_until?: string | null;
          id?: string;
          is_active?: boolean | null;
          item_id?: string;
          selling_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'item_prices_item_id_fkey';
            columns: ['item_id'];
            isOneToOne: false;
            referencedRelation: 'items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'item_prices_item_id_fkey';
            columns: ['item_id'];
            isOneToOne: false;
            referencedRelation: 'items_with_current_prices';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'item_prices_item_id_fkey';
            columns: ['item_id'];
            isOneToOne: false;
            referencedRelation: 'popular_items';
            referencedColumns: ['id'];
          },
        ];
      };
      items: {
        Row: {
          category_id: string | null;
          created_at: string | null;
          description: string | null;
          dimensions: Json | null;
          id: string;
          is_active: boolean | null;
          is_featured: boolean | null;
          min_stock_level: number | null;
          name: string;
          project_id: string;
          sku: string | null;
          stock_quantity: number;
          tags: string[] | null;
          updated_at: string | null;
          weight: number | null;
        };
        Insert: {
          category_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          dimensions?: Json | null;
          id?: string;
          is_active?: boolean | null;
          is_featured?: boolean | null;
          min_stock_level?: number | null;
          name: string;
          project_id: string;
          sku?: string | null;
          stock_quantity?: number;
          tags?: string[] | null;
          updated_at?: string | null;
          weight?: number | null;
        };
        Update: {
          category_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          dimensions?: Json | null;
          id?: string;
          is_active?: boolean | null;
          is_featured?: boolean | null;
          min_stock_level?: number | null;
          name?: string;
          project_id?: string;
          sku?: string | null;
          stock_quantity?: number;
          tags?: string[] | null;
          updated_at?: string | null;
          weight?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'items_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'items_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      order_items: {
        Row: {
          created_at: string | null;
          discount_amount: number | null;
          id: string;
          item_id: string;
          item_snapshot: Json;
          order_id: string;
          quantity: number;
          total_price: number;
          unit_price: number;
        };
        Insert: {
          created_at?: string | null;
          discount_amount?: number | null;
          id?: string;
          item_id: string;
          item_snapshot: Json;
          order_id: string;
          quantity: number;
          total_price: number;
          unit_price: number;
        };
        Update: {
          created_at?: string | null;
          discount_amount?: number | null;
          id?: string;
          item_id?: string;
          item_snapshot?: Json;
          order_id?: string;
          quantity?: number;
          total_price?: number;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'order_items_item_id_fkey';
            columns: ['item_id'];
            isOneToOne: false;
            referencedRelation: 'items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_item_id_fkey';
            columns: ['item_id'];
            isOneToOne: false;
            referencedRelation: 'items_with_current_prices';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_item_id_fkey';
            columns: ['item_id'];
            isOneToOne: false;
            referencedRelation: 'popular_items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'order_summary';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
        ];
      };
      orders: {
        Row: {
          confirmed_at: string | null;
          created_at: string | null;
          customer_id: string;
          customer_phone_secondary: string | null;
          delivered_at: string | null;
          delivery_city: string | null;
          delivery_notes: string | null;
          discount_amount: number | null;
          id: string;
          internal_notes: string | null;
          notes: string | null;
          order_number: string;
          paid_at: string | null;
          payment_method: Database['public']['Enums']['payment_method_enum'];
          payment_reference: string | null;
          payment_status: Database['public']['Enums']['payment_status_enum'] | null;
          project_id: string;
          shipping_address: Json;
          shipping_cost: number | null;
          status: Database['public']['Enums']['order_status_enum'] | null;
          subtotal: number;
          tax_amount: number | null;
          telegram_message_id: number | null;
          telegram_user_id: number | null;
          total_amount: number;
          tracking_number: string | null;
          updated_at: string | null;
        };
        Insert: {
          confirmed_at?: string | null;
          created_at?: string | null;
          customer_id: string;
          customer_phone_secondary?: string | null;
          delivered_at?: string | null;
          delivery_city?: string | null;
          delivery_notes?: string | null;
          discount_amount?: number | null;
          id?: string;
          internal_notes?: string | null;
          notes?: string | null;
          order_number: string;
          paid_at?: string | null;
          payment_method: Database['public']['Enums']['payment_method_enum'];
          payment_reference?: string | null;
          payment_status?: Database['public']['Enums']['payment_status_enum'] | null;
          project_id: string;
          shipping_address: Json;
          shipping_cost?: number | null;
          status?: Database['public']['Enums']['order_status_enum'] | null;
          subtotal: number;
          tax_amount?: number | null;
          telegram_message_id?: number | null;
          telegram_user_id?: number | null;
          total_amount: number;
          tracking_number?: string | null;
          updated_at?: string | null;
        };
        Update: {
          confirmed_at?: string | null;
          created_at?: string | null;
          customer_id?: string;
          customer_phone_secondary?: string | null;
          delivered_at?: string | null;
          delivery_city?: string | null;
          delivery_notes?: string | null;
          discount_amount?: number | null;
          id?: string;
          internal_notes?: string | null;
          notes?: string | null;
          order_number?: string;
          paid_at?: string | null;
          payment_method?: Database['public']['Enums']['payment_method_enum'];
          payment_reference?: string | null;
          payment_status?: Database['public']['Enums']['payment_status_enum'] | null;
          project_id?: string;
          shipping_address?: Json;
          shipping_cost?: number | null;
          status?: Database['public']['Enums']['order_status_enum'] | null;
          subtotal?: number;
          tax_amount?: number | null;
          telegram_message_id?: number | null;
          telegram_user_id?: number | null;
          total_amount?: number;
          tracking_number?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'orders_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      payment_qr_codes: {
        Row: {
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          payment_method: string;
          phone_number: string;
          project_id: string;
          qr_code_url: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          payment_method: string;
          phone_number: string;
          project_id: string;
          qr_code_url?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          payment_method?: string;
          phone_number?: string;
          project_id?: string;
          qr_code_url?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'payment_qr_codes_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      projects: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          is_active: boolean | null;
          name: string;
          payment_methods: Json | null;
          telegram_bot_token: string | null;
          telegram_webhook_url: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean | null;
          name: string;
          payment_methods?: Json | null;
          telegram_bot_token?: string | null;
          telegram_webhook_url?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          payment_methods?: Json | null;
          telegram_bot_token?: string | null;
          telegram_webhook_url?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      stock_movements: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          id: string;
          item_id: string;
          movement_type: Database['public']['Enums']['stock_movement_type_enum'];
          notes: string | null;
          quantity: number;
          reason: Database['public']['Enums']['stock_movement_reason_enum'];
          reference_id: string | null;
          reference_type: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          item_id: string;
          movement_type: Database['public']['Enums']['stock_movement_type_enum'];
          notes?: string | null;
          quantity: number;
          reason: Database['public']['Enums']['stock_movement_reason_enum'];
          reference_id?: string | null;
          reference_type?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          item_id?: string;
          movement_type?: Database['public']['Enums']['stock_movement_type_enum'];
          notes?: string | null;
          quantity?: number;
          reason?: Database['public']['Enums']['stock_movement_reason_enum'];
          reference_id?: string | null;
          reference_type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'stock_movements_item_id_fkey';
            columns: ['item_id'];
            isOneToOne: false;
            referencedRelation: 'items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'stock_movements_item_id_fkey';
            columns: ['item_id'];
            isOneToOne: false;
            referencedRelation: 'items_with_current_prices';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'stock_movements_item_id_fkey';
            columns: ['item_id'];
            isOneToOne: false;
            referencedRelation: 'popular_items';
            referencedColumns: ['id'];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          permissions: Json | null;
          project_id: string;
          role: Database['public']['Enums']['user_role_enum'];
          telegram_user_id: number | null;
          telegram_username: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          permissions?: Json | null;
          project_id: string;
          role?: Database['public']['Enums']['user_role_enum'];
          telegram_user_id?: number | null;
          telegram_username?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          permissions?: Json | null;
          project_id?: string;
          role?: Database['public']['Enums']['user_role_enum'];
          telegram_user_id?: number | null;
          telegram_username?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_roles_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      items_with_current_prices: {
        Row: {
          base_price: number | null;
          category_id: string | null;
          created_at: string | null;
          description: string | null;
          dimensions: Json | null;
          discount_percentage: number | null;
          id: string | null;
          is_active: boolean | null;
          is_featured: boolean | null;
          min_stock_level: number | null;
          name: string | null;
          price_effective_from: string | null;
          project_id: string | null;
          selling_price: number | null;
          sku: string | null;
          stock_quantity: number | null;
          tags: string[] | null;
          updated_at: string | null;
          weight: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'items_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'items_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      order_summary: {
        Row: {
          confirmed_at: string | null;
          created_at: string | null;
          customer_id: string | null;
          customer_phone_secondary: string | null;
          delivered_at: string | null;
          delivery_city: string | null;
          delivery_notes: string | null;
          discount_amount: number | null;
          first_name: string | null;
          id: string | null;
          internal_notes: string | null;
          item_count: number | null;
          last_name: string | null;
          notes: string | null;
          order_number: string | null;
          paid_at: string | null;
          payment_method: Database['public']['Enums']['payment_method_enum'] | null;
          payment_reference: string | null;
          payment_status: Database['public']['Enums']['payment_status_enum'] | null;
          phone: string | null;
          project_id: string | null;
          shipping_address: Json | null;
          shipping_cost: number | null;
          status: Database['public']['Enums']['order_status_enum'] | null;
          subtotal: number | null;
          tax_amount: number | null;
          telegram_message_id: number | null;
          telegram_user_id: number | null;
          total_amount: number | null;
          total_quantity: number | null;
          tracking_number: string | null;
          updated_at: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'orders_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      popular_items: {
        Row: {
          category_id: string | null;
          created_at: string | null;
          description: string | null;
          dimensions: Json | null;
          id: string | null;
          is_active: boolean | null;
          is_featured: boolean | null;
          min_stock_level: number | null;
          name: string | null;
          order_count: number | null;
          project_id: string | null;
          sku: string | null;
          stock_quantity: number | null;
          tags: string[] | null;
          total_sold: number | null;
          updated_at: string | null;
          weight: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'items_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'items_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Functions: {
      create_customer_from_telegram: {
        Args: {
          p_first_name?: string;
          p_last_name?: string;
          p_project_id: string;
          p_telegram_id: number;
          p_telegram_username?: string;
        };
        Returns: string;
      };
      gbt_bit_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_bool_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_bool_fetch: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_bpchar_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_bytea_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_cash_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_cash_fetch: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_date_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_date_fetch: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_decompress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_enum_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_enum_fetch: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_float4_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_float4_fetch: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_float8_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_float8_fetch: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_inet_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_int2_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_int2_fetch: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_int4_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_int4_fetch: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_int8_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_int8_fetch: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_intv_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_intv_decompress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_intv_fetch: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_macad_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_macad_fetch: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_macad8_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_macad8_fetch: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_numeric_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_oid_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_oid_fetch: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_text_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_time_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_time_fetch: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_timetz_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_ts_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_ts_fetch: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_tstz_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_uuid_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_uuid_fetch: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_var_decompress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbt_var_fetch: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbtreekey_var_in: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbtreekey_var_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbtreekey16_in: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbtreekey16_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbtreekey2_in: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbtreekey2_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbtreekey32_in: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbtreekey32_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbtreekey4_in: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbtreekey4_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbtreekey8_in: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gbtreekey8_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      record_health_check: {
        Args: {
          p_component: Database['public']['Enums']['health_check_component_enum'];
          p_details?: Json;
          p_message?: string;
          p_response_time_ms?: number;
          p_status: Database['public']['Enums']['health_check_status_enum'];
        };
        Returns: string;
      };
    };
    Enums: {
      health_check_component_enum:
        | 'database'
        | 'api'
        | 'storage'
        | 'telegram_bot'
        | 'external_service';
      health_check_status_enum: 'healthy' | 'warning' | 'critical' | 'unknown';
      invoice_status_enum: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
      message_direction_enum: 'inbound' | 'outbound';
      message_type_enum: 'text' | 'image' | 'document' | 'location' | 'contact';
      order_status_enum:
        | 'pending'
        | 'confirmed'
        | 'delivering'
        | 'delivered'
        | 'paid'
        | 'done'
        | 'cancelled';
      payment_method_enum: 'cod' | 'online' | 'kbz_pay' | 'aya_pay' | 'cb_pay' | 'mobile_banking';
      payment_status_enum: 'pending' | 'paid' | 'failed' | 'refunded';
      stock_movement_reason_enum:
        | 'purchase'
        | 'sale'
        | 'return'
        | 'damaged'
        | 'adjustment'
        | 'initial';
      stock_movement_type_enum: 'in' | 'out' | 'adjustment';
      user_role_enum: 'admin' | 'agent';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      health_check_component_enum: [
        'database',
        'api',
        'storage',
        'telegram_bot',
        'external_service',
      ],
      health_check_status_enum: ['healthy', 'warning', 'critical', 'unknown'],
      invoice_status_enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
      message_direction_enum: ['inbound', 'outbound'],
      message_type_enum: ['text', 'image', 'document', 'location', 'contact'],
      order_status_enum: [
        'pending',
        'confirmed',
        'delivering',
        'delivered',
        'paid',
        'done',
        'cancelled',
      ],
      payment_method_enum: ['cod', 'online', 'kbz_pay', 'aya_pay', 'cb_pay', 'mobile_banking'],
      payment_status_enum: ['pending', 'paid', 'failed', 'refunded'],
      stock_movement_reason_enum: [
        'purchase',
        'sale',
        'return',
        'damaged',
        'adjustment',
        'initial',
      ],
      stock_movement_type_enum: ['in', 'out', 'adjustment'],
      user_role_enum: ['admin', 'agent'],
    },
  },
} as const;
