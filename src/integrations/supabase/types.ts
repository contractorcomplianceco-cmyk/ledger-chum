export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          normal_balance: string
          org_id: string
          parent_id: string | null
          type: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          normal_balance: string
          org_id: string
          parent_id?: string | null
          type: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          normal_balance?: string
          org_id?: string
          parent_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
        ]
      }
      api_clients: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          description: string | null
          expires_at: string | null
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          org_id: string
          provider: string
          revoked_at: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          org_id: string
          provider?: string
          revoked_at?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          org_id?: string
          provider?: string
          revoked_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_clients_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          action: string | null
          actor_id: string
          actor_type: string
          after: Json | null
          before: Json | null
          correlation_id: string | null
          created_at: string
          event_type: string
          id: string
          org_id: string
          reason: string | null
          source: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          action?: string | null
          actor_id: string
          actor_type: string
          after?: Json | null
          before?: Json | null
          correlation_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          org_id: string
          reason?: string | null
          source?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          action?: string | null
          actor_id?: string
          actor_type?: string
          after?: Json | null
          before?: Json | null
          correlation_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          org_id?: string
          reason?: string | null
          source?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_applications: {
        Row: {
          amount_applied: number
          applied_at: string
          credit_id: string
          id: string
          invoice_id: string
        }
        Insert: {
          amount_applied: number
          applied_at?: string
          credit_id: string
          id?: string
          invoice_id: string
        }
        Update: {
          amount_applied?: number
          applied_at?: string
          credit_id?: string
          id?: string
          invoice_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_applications_credit_id_fkey"
            columns: ["credit_id"]
            isOneToOne: false
            referencedRelation: "credits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_applications_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_applications_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "v_ar_aging"
            referencedColumns: ["invoice_id"]
          },
        ]
      }
      credits: {
        Row: {
          amount: number
          created_at: string
          credit_date: string
          customer_id: string
          id: string
          memo: string | null
          org_id: string
          source_id: string | null
          source_type: string | null
          unapplied_amount: number
        }
        Insert: {
          amount: number
          created_at?: string
          credit_date: string
          customer_id: string
          id?: string
          memo?: string | null
          org_id: string
          source_id?: string | null
          source_type?: string | null
          unapplied_amount: number
        }
        Update: {
          amount?: number
          created_at?: string
          credit_date?: string
          customer_id?: string
          id?: string
          memo?: string | null
          org_id?: string
          source_id?: string | null
          source_type?: string | null
          unapplied_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "credits_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credits_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          billing_address: Json | null
          created_at: string
          email: string | null
          external_id: string | null
          external_source: string | null
          id: string
          name: string
          org_id: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string
          email?: string | null
          external_id?: string | null
          external_source?: string | null
          id?: string
          name: string
          org_id: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          billing_address?: Json | null
          created_at?: string
          email?: string | null
          external_id?: string | null
          external_source?: string | null
          id?: string
          name?: string
          org_id?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      fiscal_periods: {
        Row: {
          closed_at: string | null
          closed_by: string | null
          created_at: string
          end_date: string
          fiscal_year_id: string
          id: string
          org_id: string
          period_number: number
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          end_date: string
          fiscal_year_id: string
          id?: string
          org_id: string
          period_number: number
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          end_date?: string
          fiscal_year_id?: string
          id?: string
          org_id?: string
          period_number?: number
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fiscal_periods_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "fiscal_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiscal_periods_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      fiscal_years: {
        Row: {
          created_at: string
          end_date: string
          id: string
          org_id: string
          start_date: string
          status: string
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          org_id: string
          start_date: string
          status?: string
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          org_id?: string
          start_date?: string
          status?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "fiscal_years_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_consumption: {
        Row: {
          consumed_at: string
          external_id: string | null
          external_source: string | null
          id: string
          item_description: string | null
          item_ref: string
          org_id: string
          quantity: number
          total_cost: number
          unit_cost: number
          work_order_ref: string | null
        }
        Insert: {
          consumed_at?: string
          external_id?: string | null
          external_source?: string | null
          id?: string
          item_description?: string | null
          item_ref: string
          org_id: string
          quantity: number
          total_cost: number
          unit_cost: number
          work_order_ref?: string | null
        }
        Update: {
          consumed_at?: string
          external_id?: string | null
          external_source?: string | null
          id?: string
          item_description?: string | null
          item_ref?: string
          org_id?: string
          quantity?: number
          total_cost?: number
          unit_cost?: number
          work_order_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_consumption_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_lines: {
        Row: {
          account_id: string | null
          amount: number
          description: string
          id: string
          invoice_id: string
          line_order: number
          quantity: number
          tax_rate: number
          unit_price: number
        }
        Insert: {
          account_id?: string | null
          amount?: number
          description: string
          id?: string
          invoice_id: string
          line_order?: number
          quantity?: number
          tax_rate?: number
          unit_price?: number
        }
        Update: {
          account_id?: string | null
          amount?: number
          description?: string
          id?: string
          invoice_id?: string
          line_order?: number
          quantity?: number
          tax_rate?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "v_ar_aging"
            referencedColumns: ["invoice_id"]
          },
        ]
      }
      invoices: {
        Row: {
          balance: number
          created_at: string
          customer_id: string
          due_date: string | null
          external_id: string | null
          external_source: string | null
          id: string
          invoice_number: string
          issue_date: string
          memo: string | null
          org_id: string
          status: string
          subtotal: number
          tax: number
          total: number
          updated_at: string
          work_order_ref: string | null
        }
        Insert: {
          balance?: number
          created_at?: string
          customer_id: string
          due_date?: string | null
          external_id?: string | null
          external_source?: string | null
          id?: string
          invoice_number: string
          issue_date: string
          memo?: string | null
          org_id: string
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          work_order_ref?: string | null
        }
        Update: {
          balance?: number
          created_at?: string
          customer_id?: string
          due_date?: string | null
          external_id?: string | null
          external_source?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          memo?: string | null
          org_id?: string
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          work_order_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          correlation_id: string | null
          created_at: string
          entry_date: string
          id: string
          memo: string | null
          org_id: string
          posted_at: string | null
          posted_by: string | null
          source_id: string | null
          source_type: string | null
          status: string
        }
        Insert: {
          correlation_id?: string | null
          created_at?: string
          entry_date: string
          id?: string
          memo?: string | null
          org_id: string
          posted_at?: string | null
          posted_by?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string
        }
        Update: {
          correlation_id?: string | null
          created_at?: string
          entry_date?: string
          id?: string
          memo?: string | null
          org_id?: string
          posted_at?: string | null
          posted_by?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_lines: {
        Row: {
          account_id: string
          credit: number
          debit: number
          id: string
          journal_id: string
          line_order: number
          memo: string | null
        }
        Insert: {
          account_id: string
          credit?: number
          debit?: number
          id?: string
          journal_id: string
          line_order?: number
          memo?: string | null
        }
        Update: {
          account_id?: string
          credit?: number
          debit?: number
          id?: string
          journal_id?: string
          line_order?: number
          memo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "journal_lines_journal_id_fkey"
            columns: ["journal_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_lines_journal_id_fkey"
            columns: ["journal_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["journal_id"]
          },
        ]
      }
      org_members: {
        Row: {
          created_at: string
          id: string
          org_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_settings: {
        Row: {
          accounting_basis: string
          audit_retention_months: number
          close_policy: Json
          created_at: string
          default_currency: string
          fiscal_calendar: string
          id: string
          org_id: string
          timezone: string
          updated_at: string
        }
        Insert: {
          accounting_basis?: string
          audit_retention_months?: number
          close_policy?: Json
          created_at?: string
          default_currency?: string
          fiscal_calendar?: string
          id?: string
          org_id: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          accounting_basis?: string
          audit_retention_months?: number
          close_policy?: Json
          created_at?: string
          default_currency?: string
          fiscal_calendar?: string
          id?: string
          org_id?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_settings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          country: string | null
          created_at: string
          currency: string
          display_name: string | null
          fiscal_year_start_month: number
          id: string
          industry: string | null
          legal_name: string | null
          name: string
          slug: string
          status: string
          timezone: string
          updated_at: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          currency?: string
          display_name?: string | null
          fiscal_year_start_month?: number
          id?: string
          industry?: string | null
          legal_name?: string | null
          name: string
          slug: string
          status?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          currency?: string
          display_name?: string | null
          fiscal_year_start_month?: number
          id?: string
          industry?: string | null
          legal_name?: string | null
          name?: string
          slug?: string
          status?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_account_mappings: {
        Row: {
          account_id: string
          created_at: string
          description: string | null
          id: string
          method: string
          org_id: string
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          description?: string | null
          id?: string
          method: string
          org_id: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          description?: string | null
          id?: string
          method?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_account_mappings_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_account_mappings_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "payment_account_mappings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_applications: {
        Row: {
          amount_applied: number
          applied_at: string
          id: string
          invoice_id: string
          payment_id: string
        }
        Insert: {
          amount_applied: number
          applied_at?: string
          id?: string
          invoice_id: string
          payment_id: string
        }
        Update: {
          amount_applied?: number
          applied_at?: string
          id?: string
          invoice_id?: string
          payment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_applications_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_applications_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "v_ar_aging"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "payment_applications_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          customer_id: string
          external_id: string | null
          external_source: string | null
          id: string
          memo: string | null
          method: string | null
          org_id: string
          payment_date: string
          reference: string | null
          unapplied_amount: number
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id: string
          external_id?: string | null
          external_source?: string | null
          id?: string
          memo?: string | null
          method?: string | null
          org_id: string
          payment_date: string
          reference?: string | null
          unapplied_amount: number
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string
          external_id?: string | null
          external_source?: string | null
          id?: string
          memo?: string | null
          method?: string | null
          org_id?: string
          payment_date?: string
          reference?: string | null
          unapplied_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      refunds: {
        Row: {
          amount: number
          created_at: string
          id: string
          memo: string | null
          method: string | null
          org_id: string
          payment_id: string
          refund_date: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          memo?: string | null
          method?: string | null
          org_id: string
          payment_id: string
          refund_date: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          memo?: string | null
          method?: string | null
          org_id?: string
          payment_id?: string
          refund_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "refunds_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_history: {
        Row: {
          created_at: string
          endpoint: string
          error: string | null
          external_id: string | null
          id: string
          idempotency_key: string
          org_id: string
          request: Json | null
          response: Json | null
          source: string
          status: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          error?: string | null
          external_id?: string | null
          id?: string
          idempotency_key: string
          org_id: string
          request?: Json | null
          response?: Json | null
          source: string
          status: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          error?: string | null
          external_id?: string | null
          id?: string
          idempotency_key?: string
          org_id?: string
          request?: Json | null
          response?: Json | null
          source?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_history_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_ar_aging: {
        Row: {
          balance: number | null
          bucket: string | null
          customer_id: string | null
          customer_name: string | null
          days_past_due: number | null
          due_date: string | null
          invoice_id: string | null
          invoice_number: string | null
          issue_date: string | null
          org_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      v_general_ledger: {
        Row: {
          account_code: string | null
          account_id: string | null
          account_name: string | null
          credit: number | null
          debit: number | null
          entry_date: string | null
          journal_id: string | null
          journal_memo: string | null
          line_id: string | null
          line_memo: string | null
          org_id: string | null
          source_id: string | null
          source_type: string | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
        ]
      }
      v_trial_balance: {
        Row: {
          account_id: string | null
          balance: number | null
          code: string | null
          name: string | null
          org_id: string | null
          total_credit: number | null
          total_debit: number | null
          type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      has_role: {
        Args: {
          _org: string
          _role: Database["public"]["Enums"]["app_role"]
          _user: string
        }
        Returns: boolean
      }
      is_org_member: { Args: { _org: string }; Returns: boolean }
      is_period_open: {
        Args: { _date: string; _org: string }
        Returns: boolean
      }
      record_payment_with_posting: {
        Args: {
          _actor_id: string
          _actor_type: string
          _amount: number
          _apply_to: Json
          _correlation_id: string
          _customer_id: string
          _external_id: string
          _external_source: string
          _memo: string
          _method: string
          _org_id: string
          _payment_date: string
          _reference: string
        }
        Returns: Json
      }
      record_refund_with_posting: {
        Args: {
          _actor_id: string
          _actor_type: string
          _amount: number
          _correlation_id: string
          _memo: string
          _method: string
          _org_id: string
          _payment_id: string
          _refund_date: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role:
        | "owner"
        | "accounting_lead"
        | "accountant"
        | "systems_reviewer"
        | "team_member"
        | "integration_service"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "owner",
        "accounting_lead",
        "accountant",
        "systems_reviewer",
        "team_member",
        "integration_service",
      ],
    },
  },
} as const
