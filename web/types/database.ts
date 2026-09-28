// Types for the Costwatch Postgres schema (supabase/migrations).
// Kept in the shape produced by `supabase gen types typescript` so it can be
// regenerated with `npm run db:types` once a Supabase project is linked.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      currencies: {
        Row: { code: string; name: string; minor_units: number; sort_order: number };
        Insert: { code: string; name: string; minor_units?: number; sort_order?: number };
        Update: { code?: string; name?: string; minor_units?: number; sort_order?: number };
        Relationships: [];
      };
      categories: {
        Row: { slug: string; name: string; sort_order: number };
        Insert: { slug: string; name: string; sort_order?: number };
        Update: { slug?: string; name?: string; sort_order?: number };
        Relationships: [];
      };
      profiles: {
        Row: { id: string; email: string | null; name: string | null; created_at: string; updated_at: string };
        Insert: { id: string; email?: string | null; name?: string | null; created_at?: string; updated_at?: string };
        Update: { id?: string; email?: string | null; name?: string | null; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          description?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      costs: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          description: string | null;
          amount: number;
          currency: string;
          billing_cycle: Database["public"]["Enums"]["billing_cycle"];
          custom_interval_count: number | null;
          custom_interval_unit: Database["public"]["Enums"]["interval_unit"] | null;
          category: string;
          provider: string | null;
          start_date: string | null;
          next_renewal: string | null;
          status: Database["public"]["Enums"]["cost_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          description?: string | null;
          amount: number;
          currency: string;
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"];
          custom_interval_count?: number | null;
          custom_interval_unit?: Database["public"]["Enums"]["interval_unit"] | null;
          category?: string;
          provider?: string | null;
          start_date?: string | null;
          next_renewal?: string | null;
          status?: Database["public"]["Enums"]["cost_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["costs"]["Insert"]>;
        Relationships: [];
      };
      cost_history: {
        Row: {
          id: number;
          cost_id: string;
          product_id: string;
          amount: number;
          currency: string;
          billing_cycle: Database["public"]["Enums"]["billing_cycle"];
          custom_interval_count: number | null;
          custom_interval_unit: Database["public"]["Enums"]["interval_unit"] | null;
          status: Database["public"]["Enums"]["cost_status"];
          recorded_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      revenue: {
        Row: {
          id: string;
          product_id: string;
          amount: number;
          currency: string;
          source: string | null;
          date: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          amount: number;
          currency: string;
          source?: string | null;
          date?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["revenue"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      delete_account: { Args: Record<string, never>; Returns: undefined };
      owns_product: { Args: { p_product_id: string }; Returns: boolean };
    };
    Enums: {
      billing_cycle: "one_time" | "monthly" | "quarterly" | "yearly" | "custom";
      cost_status: "active" | "paused" | "inactive";
      interval_unit: "day" | "week" | "month" | "year";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type Public = Database["public"];

export type Tables<T extends keyof Public["Tables"]> = Public["Tables"][T]["Row"];
export type Enums<T extends keyof Public["Enums"]> = Public["Enums"][T];

export type Product = Tables<"products">;
export type Cost = Tables<"costs">;
export type CostHistory = Tables<"cost_history">;
export type Revenue = Tables<"revenue">;
export type Profile = Tables<"profiles">;
export type BillingCycle = Enums<"billing_cycle">;
export type CostStatus = Enums<"cost_status">;
export type IntervalUnit = Enums<"interval_unit">;
