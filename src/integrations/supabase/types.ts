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
      account_mappings: {
        Row: {
          account_id: string
          created_at: string
          description: string | null
          id: string
          org_id: string
          purpose: string
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          description?: string | null
          id?: string
          org_id: string
          purpose: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          description?: string | null
          id?: string
          org_id?: string
          purpose?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_mappings_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_mappings_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "account_mappings_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "account_mappings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      accounting_insights: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          advisory_only: boolean
          category: string
          confidence: number
          created_at: string
          evidence: Json
          id: string
          org_id: string
          period_end: string | null
          period_start: string | null
          persona: string
          recommended_action: string | null
          related_object_id: string | null
          related_object_type: string | null
          status: string
          title: string
          updated_at: string
          what_happened: string
          why: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          advisory_only?: boolean
          category: string
          confidence?: number
          created_at?: string
          evidence?: Json
          id?: string
          org_id: string
          period_end?: string | null
          period_start?: string | null
          persona?: string
          recommended_action?: string | null
          related_object_id?: string | null
          related_object_type?: string | null
          status?: string
          title: string
          updated_at?: string
          what_happened: string
          why?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          advisory_only?: boolean
          category?: string
          confidence?: number
          created_at?: string
          evidence?: Json
          id?: string
          org_id?: string
          period_end?: string | null
          period_start?: string | null
          persona?: string
          recommended_action?: string | null
          related_object_id?: string | null
          related_object_type?: string | null
          status?: string
          title?: string
          updated_at?: string
          what_happened?: string
          why?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounting_insights_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          is_system: boolean
          name: string
          normal_balance: string
          org_id: string
          parent_id: string | null
          sort_order: number
          type: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_system?: boolean
          name: string
          normal_balance: string
          org_id: string
          parent_id?: string | null
          sort_order?: number
          type: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_system?: boolean
          name?: string
          normal_balance?: string
          org_id?: string
          parent_id?: string | null
          sort_order?: number
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
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
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
          environment: string
          expires_at: string | null
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          org_id: string
          provider: string
          revoked_at: string | null
          scopes: string[]
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          environment?: string
          expires_at?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          org_id: string
          provider?: string
          revoked_at?: string | null
          scopes?: string[]
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          environment?: string
          expires_at?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          org_id?: string
          provider?: string
          revoked_at?: string | null
          scopes?: string[]
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
      bank_accounts: {
        Row: {
          account_number_last4: string | null
          bank_name: string | null
          created_at: string
          currency: string
          gl_account_id: string
          id: string
          is_active: boolean
          name: string
          notes: string | null
          opening_balance: number
          opening_balance_date: string | null
          org_id: string
          updated_at: string
        }
        Insert: {
          account_number_last4?: string | null
          bank_name?: string | null
          created_at?: string
          currency?: string
          gl_account_id: string
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          opening_balance?: number
          opening_balance_date?: string | null
          org_id: string
          updated_at?: string
        }
        Update: {
          account_number_last4?: string | null
          bank_name?: string | null
          created_at?: string
          currency?: string
          gl_account_id?: string
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          opening_balance?: number
          opening_balance_date?: string | null
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_gl_account_id_fkey"
            columns: ["gl_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_accounts_gl_account_id_fkey"
            columns: ["gl_account_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "bank_accounts_gl_account_id_fkey"
            columns: ["gl_account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "bank_accounts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_reconciliations: {
        Row: {
          bank_account_id: string
          cleared_balance: number
          completed_at: string | null
          completed_by: string | null
          created_at: string
          id: string
          notes: string | null
          org_id: string
          statement_end_date: string
          statement_ending_balance: number
          statement_start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          bank_account_id: string
          cleared_balance?: number
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          org_id: string
          statement_end_date: string
          statement_ending_balance: number
          statement_start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          bank_account_id?: string
          cleared_balance?: number
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          org_id?: string
          statement_end_date?: string
          statement_ending_balance?: number
          statement_start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_reconciliations_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_reconciliations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_transactions: {
        Row: {
          amount: number
          balance_after: number | null
          bank_account_id: string
          created_at: string
          description: string
          external_id: string | null
          external_source: string | null
          id: string
          matched_at: string | null
          matched_by: string | null
          matched_journal_line_id: string | null
          org_id: string
          posted_date: string | null
          raw: Json | null
          reference: string | null
          source_ref: string | null
          status: string
          txn_date: string
          updated_at: string
        }
        Insert: {
          amount: number
          balance_after?: number | null
          bank_account_id: string
          created_at?: string
          description: string
          external_id?: string | null
          external_source?: string | null
          id?: string
          matched_at?: string | null
          matched_by?: string | null
          matched_journal_line_id?: string | null
          org_id: string
          posted_date?: string | null
          raw?: Json | null
          reference?: string | null
          source_ref?: string | null
          status?: string
          txn_date: string
          updated_at?: string
        }
        Update: {
          amount?: number
          balance_after?: number | null
          bank_account_id?: string
          created_at?: string
          description?: string
          external_id?: string | null
          external_source?: string | null
          id?: string
          matched_at?: string | null
          matched_by?: string | null
          matched_journal_line_id?: string | null
          org_id?: string
          posted_date?: string | null
          raw?: Json | null
          reference?: string | null
          source_ref?: string | null
          status?: string
          txn_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_transactions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transactions_matched_journal_line_id_fkey"
            columns: ["matched_journal_line_id"]
            isOneToOne: false
            referencedRelation: "journal_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transactions_matched_journal_line_id_fkey"
            columns: ["matched_journal_line_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["line_id"]
          },
          {
            foreignKeyName: "bank_transactions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_lines: {
        Row: {
          account_id: string
          amount: number
          bill_id: string
          department_id: string | null
          description: string | null
          id: string
          line_order: number
          location_id: string | null
          product_id: string | null
          project_id: string | null
          quantity: number
          service_id: string | null
          unit_price: number
        }
        Insert: {
          account_id: string
          amount?: number
          bill_id: string
          department_id?: string | null
          description?: string | null
          id?: string
          line_order?: number
          location_id?: string | null
          product_id?: string | null
          project_id?: string | null
          quantity?: number
          service_id?: string | null
          unit_price?: number
        }
        Update: {
          account_id?: string
          amount?: number
          bill_id?: string
          department_id?: string | null
          description?: string | null
          id?: string
          line_order?: number
          location_id?: string | null
          product_id?: string | null
          project_id?: string | null
          quantity?: number
          service_id?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "bill_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "bill_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "bill_lines_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_lines_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "v_ap_aging"
            referencedColumns: ["bill_id"]
          },
        ]
      }
      bill_payment_applications: {
        Row: {
          amount_applied: number
          bill_id: string
          bill_payment_id: string
          created_at: string
          id: string
        }
        Insert: {
          amount_applied: number
          bill_id: string
          bill_payment_id: string
          created_at?: string
          id?: string
        }
        Update: {
          amount_applied?: number
          bill_id?: string
          bill_payment_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bill_payment_applications_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_payment_applications_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "v_ap_aging"
            referencedColumns: ["bill_id"]
          },
          {
            foreignKeyName: "bill_payment_applications_bill_payment_id_fkey"
            columns: ["bill_payment_id"]
            isOneToOne: false
            referencedRelation: "bill_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_payments: {
        Row: {
          amount: number
          created_at: string
          external_id: string | null
          external_source: string | null
          id: string
          memo: string | null
          method: string | null
          org_id: string
          payment_date: string
          posted_journal_id: string | null
          reference: string | null
          source_ref: string | null
          source_system: string | null
          unapplied_amount: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          external_id?: string | null
          external_source?: string | null
          id?: string
          memo?: string | null
          method?: string | null
          org_id: string
          payment_date: string
          posted_journal_id?: string | null
          reference?: string | null
          source_ref?: string | null
          source_system?: string | null
          unapplied_amount?: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          external_id?: string | null
          external_source?: string | null
          id?: string
          memo?: string | null
          method?: string | null
          org_id?: string
          payment_date?: string
          posted_journal_id?: string | null
          reference?: string | null
          source_ref?: string | null
          source_system?: string | null
          unapplied_amount?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bill_payments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_payments_posted_journal_id_fkey"
            columns: ["posted_journal_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_payments_posted_journal_id_fkey"
            columns: ["posted_journal_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["journal_id"]
          },
          {
            foreignKeyName: "bill_payments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      bills: {
        Row: {
          balance: number
          bill_number: string
          created_at: string
          due_date: string
          external_id: string | null
          external_source: string | null
          id: string
          issue_date: string
          memo: string | null
          org_id: string
          posted_at: string | null
          posted_journal_id: string | null
          source_ref: string | null
          source_system: string | null
          status: string
          subtotal: number
          tax: number
          total: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          balance?: number
          bill_number: string
          created_at?: string
          due_date: string
          external_id?: string | null
          external_source?: string | null
          id?: string
          issue_date: string
          memo?: string | null
          org_id: string
          posted_at?: string | null
          posted_journal_id?: string | null
          source_ref?: string | null
          source_system?: string | null
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          balance?: number
          bill_number?: string
          created_at?: string
          due_date?: string
          external_id?: string | null
          external_source?: string | null
          id?: string
          issue_date?: string
          memo?: string | null
          org_id?: string
          posted_at?: string | null
          posted_journal_id?: string | null
          source_ref?: string | null
          source_system?: string | null
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bills_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_posted_journal_id_fkey"
            columns: ["posted_journal_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_posted_journal_id_fkey"
            columns: ["posted_journal_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["journal_id"]
          },
          {
            foreignKeyName: "bills_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      close_approvals: {
        Row: {
          approver_id: string
          close_run_id: string
          created_at: string
          decision: string
          id: string
          note: string | null
          org_id: string
        }
        Insert: {
          approver_id: string
          close_run_id: string
          created_at?: string
          decision: string
          id?: string
          note?: string | null
          org_id: string
        }
        Update: {
          approver_id?: string
          close_run_id?: string
          created_at?: string
          decision?: string
          id?: string
          note?: string | null
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "close_approvals_close_run_id_fkey"
            columns: ["close_run_id"]
            isOneToOne: false
            referencedRelation: "close_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "close_approvals_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      close_runs: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string
          fiscal_period_id: string
          id: string
          notes: string | null
          org_id: string
          started_at: string
          started_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          fiscal_period_id: string
          id?: string
          notes?: string | null
          org_id: string
          started_at?: string
          started_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          fiscal_period_id?: string
          id?: string
          notes?: string | null
          org_id?: string
          started_at?: string
          started_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "close_runs_fiscal_period_id_fkey"
            columns: ["fiscal_period_id"]
            isOneToOne: true
            referencedRelation: "fiscal_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "close_runs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      close_tasks: {
        Row: {
          category: string
          close_run_id: string
          completed_at: string | null
          completed_by: string | null
          created_at: string
          description: string | null
          id: string
          note: string | null
          order_index: number
          org_id: string
          required: boolean
          status: string
          task_key: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          close_run_id: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          id?: string
          note?: string | null
          order_index?: number
          org_id: string
          required?: boolean
          status?: string
          task_key: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          close_run_id?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          id?: string
          note?: string | null
          order_index?: number
          org_id?: string
          required?: boolean
          status?: string
          task_key?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "close_tasks_close_run_id_fkey"
            columns: ["close_run_id"]
            isOneToOne: false
            referencedRelation: "close_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "close_tasks_org_id_fkey"
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
      financial_account_mappings: {
        Row: {
          approved_by: string | null
          created_at: string
          effective_date: string
          expiration_date: string | null
          external_type: string
          external_value: string
          id: string
          integration_source_id: string | null
          ledger_account_id: string | null
          ledger_object_type: string | null
          notes: string | null
          org_id: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          effective_date?: string
          expiration_date?: string | null
          external_type: string
          external_value: string
          id?: string
          integration_source_id?: string | null
          ledger_account_id?: string | null
          ledger_object_type?: string | null
          notes?: string | null
          org_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          effective_date?: string
          expiration_date?: string | null
          external_type?: string
          external_value?: string
          id?: string
          integration_source_id?: string | null
          ledger_account_id?: string | null
          ledger_object_type?: string | null
          notes?: string | null
          org_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_account_mappings_integration_source_id_fkey"
            columns: ["integration_source_id"]
            isOneToOne: false
            referencedRelation: "integration_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_account_mappings_ledger_account_id_fkey"
            columns: ["ledger_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_account_mappings_ledger_account_id_fkey"
            columns: ["ledger_account_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "financial_account_mappings_ledger_account_id_fkey"
            columns: ["ledger_account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "financial_account_mappings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_anomalies: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          advisory_only: boolean
          approval_requirement: string | null
          assumptions: string[]
          confidence: number
          created_at: string
          demonstration_only: boolean
          detector: string
          deviation: number | null
          evidence: Json
          expected_value: number | null
          freshness: string
          id: string
          metric_id: string | null
          metric_key: string
          missing_data: string[]
          narrative: string
          observed_value: number | null
          org_id: string
          period_end: string | null
          period_start: string | null
          recommended_action: string | null
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          advisory_only?: boolean
          approval_requirement?: string | null
          assumptions?: string[]
          confidence?: number
          created_at?: string
          demonstration_only?: boolean
          detector?: string
          deviation?: number | null
          evidence?: Json
          expected_value?: number | null
          freshness?: string
          id?: string
          metric_id?: string | null
          metric_key: string
          missing_data?: string[]
          narrative: string
          observed_value?: number | null
          org_id: string
          period_end?: string | null
          period_start?: string | null
          recommended_action?: string | null
          severity?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          advisory_only?: boolean
          approval_requirement?: string | null
          assumptions?: string[]
          confidence?: number
          created_at?: string
          demonstration_only?: boolean
          detector?: string
          deviation?: number | null
          evidence?: Json
          expected_value?: number | null
          freshness?: string
          id?: string
          metric_id?: string | null
          metric_key?: string
          missing_data?: string[]
          narrative?: string
          observed_value?: number | null
          org_id?: string
          period_end?: string | null
          period_start?: string | null
          recommended_action?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_anomalies_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "financial_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_anomalies_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_event_approvals: {
        Row: {
          approver_id: string | null
          created_at: string
          decision: string
          event_id: string
          id: string
          note: string | null
          org_id: string
        }
        Insert: {
          approver_id?: string | null
          created_at?: string
          decision: string
          event_id: string
          id?: string
          note?: string | null
          org_id: string
        }
        Update: {
          approver_id?: string | null
          created_at?: string
          decision?: string
          event_id?: string
          id?: string
          note?: string | null
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_event_approvals_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "financial_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_event_approvals_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_event_materializations: {
        Row: {
          audit_event_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          error_code: string | null
          error_message: string | null
          event_id: string
          id: string
          materialization_type: string
          org_id: string
          retry_count: number
          status: string
          target_object_id: string | null
          target_object_type: string | null
          updated_at: string
        }
        Insert: {
          audit_event_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_code?: string | null
          error_message?: string | null
          event_id: string
          id?: string
          materialization_type: string
          org_id: string
          retry_count?: number
          status?: string
          target_object_id?: string | null
          target_object_type?: string | null
          updated_at?: string
        }
        Update: {
          audit_event_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_code?: string | null
          error_message?: string | null
          event_id?: string
          id?: string
          materialization_type?: string
          org_id?: string
          retry_count?: number
          status?: string
          target_object_id?: string | null
          target_object_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_event_materializations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "financial_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_event_materializations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_event_rules: {
        Row: {
          actions: Json
          active: boolean
          conditions: Json
          created_at: string
          description: string | null
          id: string
          name: string
          org_id: string
          priority: number
          updated_at: string
        }
        Insert: {
          actions?: Json
          active?: boolean
          conditions?: Json
          created_at?: string
          description?: string | null
          id?: string
          name: string
          org_id: string
          priority?: number
          updated_at?: string
        }
        Update: {
          actions?: Json
          active?: boolean
          conditions?: Json
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          org_id?: string
          priority?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_event_rules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_events: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          correlation_id: string | null
          created_at: string
          error: string | null
          external_event_type: string
          external_id: string | null
          id: string
          idempotency_key: string
          ledger_object: string | null
          mapping_id: string | null
          matched_rule_id: string | null
          materialized_target_id: string | null
          materialized_target_type: string | null
          org_id: string
          payload: Json
          rejected_at: string | null
          rejected_by: string | null
          requires_approval: boolean
          source_id: string | null
          source_system: string
          status: string
          updated_at: string
          validation_errors: Json | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          correlation_id?: string | null
          created_at?: string
          error?: string | null
          external_event_type: string
          external_id?: string | null
          id?: string
          idempotency_key: string
          ledger_object?: string | null
          mapping_id?: string | null
          matched_rule_id?: string | null
          materialized_target_id?: string | null
          materialized_target_type?: string | null
          org_id: string
          payload?: Json
          rejected_at?: string | null
          rejected_by?: string | null
          requires_approval?: boolean
          source_id?: string | null
          source_system: string
          status?: string
          updated_at?: string
          validation_errors?: Json | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          correlation_id?: string | null
          created_at?: string
          error?: string | null
          external_event_type?: string
          external_id?: string | null
          id?: string
          idempotency_key?: string
          ledger_object?: string | null
          mapping_id?: string | null
          matched_rule_id?: string | null
          materialized_target_id?: string | null
          materialized_target_type?: string | null
          org_id?: string
          payload?: Json
          rejected_at?: string | null
          rejected_by?: string | null
          requires_approval?: boolean
          source_id?: string | null
          source_system?: string
          status?: string
          updated_at?: string
          validation_errors?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_events_mapping_id_fkey"
            columns: ["mapping_id"]
            isOneToOne: false
            referencedRelation: "integration_event_mappings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_events_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "integration_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_metric_lineage: {
        Row: {
          created_at: string
          dependency_metric_key: string | null
          id: string
          metric_id: string
          org_id: string
          source_field: string | null
          source_table: string | null
          source_type: Database["public"]["Enums"]["metric_source_type"]
          transformation_description: string
        }
        Insert: {
          created_at?: string
          dependency_metric_key?: string | null
          id?: string
          metric_id: string
          org_id: string
          source_field?: string | null
          source_table?: string | null
          source_type: Database["public"]["Enums"]["metric_source_type"]
          transformation_description: string
        }
        Update: {
          created_at?: string
          dependency_metric_key?: string | null
          id?: string
          metric_id?: string
          org_id?: string
          source_field?: string | null
          source_table?: string | null
          source_type?: Database["public"]["Enums"]["metric_source_type"]
          transformation_description?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_metric_lineage_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "financial_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_metric_lineage_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_metric_values: {
        Row: {
          assumptions: string[]
          calculated_by: string | null
          calculation_timestamp: string
          confidence_score: number
          created_at: string
          freshness_status: Database["public"]["Enums"]["metric_freshness"]
          id: string
          metric_id: string
          missing_data: string[]
          notes: string | null
          org_id: string
          period_end: string | null
          period_start: string | null
          source_count: number
          value: number | null
          value_json: Json | null
        }
        Insert: {
          assumptions?: string[]
          calculated_by?: string | null
          calculation_timestamp?: string
          confidence_score?: number
          created_at?: string
          freshness_status?: Database["public"]["Enums"]["metric_freshness"]
          id?: string
          metric_id: string
          missing_data?: string[]
          notes?: string | null
          org_id: string
          period_end?: string | null
          period_start?: string | null
          source_count?: number
          value?: number | null
          value_json?: Json | null
        }
        Update: {
          assumptions?: string[]
          calculated_by?: string | null
          calculation_timestamp?: string
          confidence_score?: number
          created_at?: string
          freshness_status?: Database["public"]["Enums"]["metric_freshness"]
          id?: string
          metric_id?: string
          missing_data?: string[]
          notes?: string | null
          org_id?: string
          period_end?: string | null
          period_start?: string | null
          source_count?: number
          value?: number | null
          value_json?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_metric_values_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "financial_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_metric_values_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_metrics: {
        Row: {
          calculation_method: string
          category: Database["public"]["Enums"]["metric_category"]
          confidence_rule: string | null
          created_at: string
          demonstration_only: boolean
          description: string
          formula_definition: string
          id: string
          is_sensitive: boolean
          metric_key: string
          metric_name: string
          org_id: string
          owner_role: string
          refresh_frequency: Database["public"]["Enums"]["metric_refresh_frequency"]
          required_permission: string | null
          status: Database["public"]["Enums"]["metric_status"]
          updated_at: string
        }
        Insert: {
          calculation_method: string
          category: Database["public"]["Enums"]["metric_category"]
          confidence_rule?: string | null
          created_at?: string
          demonstration_only?: boolean
          description: string
          formula_definition: string
          id?: string
          is_sensitive?: boolean
          metric_key: string
          metric_name: string
          org_id: string
          owner_role?: string
          refresh_frequency?: Database["public"]["Enums"]["metric_refresh_frequency"]
          required_permission?: string | null
          status?: Database["public"]["Enums"]["metric_status"]
          updated_at?: string
        }
        Update: {
          calculation_method?: string
          category?: Database["public"]["Enums"]["metric_category"]
          confidence_rule?: string | null
          created_at?: string
          demonstration_only?: boolean
          description?: string
          formula_definition?: string
          id?: string
          is_sensitive?: boolean
          metric_key?: string
          metric_name?: string
          org_id?: string
          owner_role?: string
          refresh_frequency?: Database["public"]["Enums"]["metric_refresh_frequency"]
          required_permission?: string | null
          status?: Database["public"]["Enums"]["metric_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_metrics_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_recommendations: {
        Row: {
          advisory_only: boolean
          approval_requirement: string
          assumptions: string[]
          category: string
          confidence: number
          created_at: string
          demonstration_only: boolean
          estimated_impact: string | null
          evidence: Json
          freshness: string
          id: string
          impact_value: number | null
          missing_data: string[]
          narrative: string
          org_id: string
          outcome_note: string | null
          outcome_value: number | null
          owner_role: string | null
          persona: string
          related_anomaly_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk: string
          state: string
          supporting_metric_keys: string[]
          time_horizon: string | null
          title: string
          updated_at: string
        }
        Insert: {
          advisory_only?: boolean
          approval_requirement?: string
          assumptions?: string[]
          category: string
          confidence?: number
          created_at?: string
          demonstration_only?: boolean
          estimated_impact?: string | null
          evidence?: Json
          freshness?: string
          id?: string
          impact_value?: number | null
          missing_data?: string[]
          narrative: string
          org_id: string
          outcome_note?: string | null
          outcome_value?: number | null
          owner_role?: string | null
          persona?: string
          related_anomaly_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk?: string
          state?: string
          supporting_metric_keys?: string[]
          time_horizon?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          advisory_only?: boolean
          approval_requirement?: string
          assumptions?: string[]
          category?: string
          confidence?: number
          created_at?: string
          demonstration_only?: boolean
          estimated_impact?: string | null
          evidence?: Json
          freshness?: string
          id?: string
          impact_value?: number | null
          missing_data?: string[]
          narrative?: string
          org_id?: string
          outcome_note?: string | null
          outcome_value?: number | null
          owner_role?: string | null
          persona?: string
          related_anomaly_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk?: string
          state?: string
          supporting_metric_keys?: string[]
          time_horizon?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_recommendations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_recommendations_related_anomaly_id_fkey"
            columns: ["related_anomaly_id"]
            isOneToOne: false
            referencedRelation: "financial_anomalies"
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
      fixed_asset_categories: {
        Row: {
          accumulated_depreciation_account_id: string | null
          asset_account_id: string | null
          created_at: string
          default_depreciation_method: string
          default_useful_life_months: number | null
          depreciation_expense_account_id: string | null
          id: string
          is_active: boolean
          name: string
          org_id: string
          updated_at: string
        }
        Insert: {
          accumulated_depreciation_account_id?: string | null
          asset_account_id?: string | null
          created_at?: string
          default_depreciation_method?: string
          default_useful_life_months?: number | null
          depreciation_expense_account_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          updated_at?: string
        }
        Update: {
          accumulated_depreciation_account_id?: string | null
          asset_account_id?: string | null
          created_at?: string
          default_depreciation_method?: string
          default_useful_life_months?: number | null
          depreciation_expense_account_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fixed_asset_categories_accumulated_depreciation_account_id_fkey"
            columns: ["accumulated_depreciation_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixed_asset_categories_accumulated_depreciation_account_id_fkey"
            columns: ["accumulated_depreciation_account_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "fixed_asset_categories_accumulated_depreciation_account_id_fkey"
            columns: ["accumulated_depreciation_account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "fixed_asset_categories_asset_account_id_fkey"
            columns: ["asset_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixed_asset_categories_asset_account_id_fkey"
            columns: ["asset_account_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "fixed_asset_categories_asset_account_id_fkey"
            columns: ["asset_account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "fixed_asset_categories_depreciation_expense_account_id_fkey"
            columns: ["depreciation_expense_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixed_asset_categories_depreciation_expense_account_id_fkey"
            columns: ["depreciation_expense_account_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "fixed_asset_categories_depreciation_expense_account_id_fkey"
            columns: ["depreciation_expense_account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "fixed_asset_categories_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      fixed_asset_depreciation: {
        Row: {
          asset_id: string
          created_at: string
          depreciation_amount: number
          id: string
          journal_entry_id: string | null
          memo: string | null
          org_id: string
          period_end: string
          period_start: string
          posted_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          asset_id: string
          created_at?: string
          depreciation_amount: number
          id?: string
          journal_entry_id?: string | null
          memo?: string | null
          org_id: string
          period_end: string
          period_start: string
          posted_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          asset_id?: string
          created_at?: string
          depreciation_amount?: number
          id?: string
          journal_entry_id?: string | null
          memo?: string | null
          org_id?: string
          period_end?: string
          period_start?: string
          posted_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fixed_asset_depreciation_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "fixed_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixed_asset_depreciation_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixed_asset_depreciation_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["journal_id"]
          },
          {
            foreignKeyName: "fixed_asset_depreciation_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      fixed_assets: {
        Row: {
          accumulated_depreciation: number
          acquisition_cost: number
          acquisition_date: string
          asset_number: string
          book_value: number | null
          category_id: string | null
          created_at: string
          depreciation_method: string
          description: string | null
          disposal_date: string | null
          id: string
          in_service_date: string | null
          location: string | null
          name: string
          notes: string | null
          org_id: string
          salvage_value: number
          status: string
          updated_at: string
          useful_life_months: number | null
          vendor_id: string | null
        }
        Insert: {
          accumulated_depreciation?: number
          acquisition_cost: number
          acquisition_date: string
          asset_number: string
          book_value?: number | null
          category_id?: string | null
          created_at?: string
          depreciation_method?: string
          description?: string | null
          disposal_date?: string | null
          id?: string
          in_service_date?: string | null
          location?: string | null
          name: string
          notes?: string | null
          org_id: string
          salvage_value?: number
          status?: string
          updated_at?: string
          useful_life_months?: number | null
          vendor_id?: string | null
        }
        Update: {
          accumulated_depreciation?: number
          acquisition_cost?: number
          acquisition_date?: string
          asset_number?: string
          book_value?: number | null
          category_id?: string | null
          created_at?: string
          depreciation_method?: string
          description?: string | null
          disposal_date?: string | null
          id?: string
          in_service_date?: string | null
          location?: string | null
          name?: string
          notes?: string | null
          org_id?: string
          salvage_value?: number
          status?: string
          updated_at?: string
          useful_life_months?: number | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fixed_assets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "fixed_asset_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixed_assets_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixed_assets_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_event_mappings: {
        Row: {
          account_purpose: string | null
          active: boolean
          config: Json
          created_at: string
          description: string | null
          external_event_type: string
          id: string
          ledger_object: string
          org_id: string
          source_id: string
          updated_at: string
        }
        Insert: {
          account_purpose?: string | null
          active?: boolean
          config?: Json
          created_at?: string
          description?: string | null
          external_event_type: string
          id?: string
          ledger_object: string
          org_id: string
          source_id: string
          updated_at?: string
        }
        Update: {
          account_purpose?: string | null
          active?: boolean
          config?: Json
          created_at?: string
          description?: string | null
          external_event_type?: string
          id?: string
          ledger_object?: string
          org_id?: string
          source_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_event_mappings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_event_mappings_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "integration_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_sources: {
        Row: {
          active: boolean
          config: Json
          contact_email: string | null
          created_at: string
          id: string
          kind: string
          name: string
          notes: string | null
          org_id: string
          source_key: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          config?: Json
          contact_email?: string | null
          created_at?: string
          id?: string
          kind?: string
          name: string
          notes?: string | null
          org_id: string
          source_key: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          config?: Json
          contact_email?: string | null
          created_at?: string
          id?: string
          kind?: string
          name?: string
          notes?: string | null
          org_id?: string
          source_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_sources_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligence_explanations: {
        Row: {
          advisory_only: boolean
          answer: string
          approval_requirement: string | null
          assumptions: string[]
          confidence: number
          created_at: string
          created_by: string | null
          demonstration_only: boolean
          evidence: Json
          freshness: string
          id: string
          missing_data: string[]
          org_id: string
          question: string | null
          recommended_action: string | null
          subject_key: string
          subject_type: string
          supporting_metric_keys: string[]
        }
        Insert: {
          advisory_only?: boolean
          answer: string
          approval_requirement?: string | null
          assumptions?: string[]
          confidence?: number
          created_at?: string
          created_by?: string | null
          demonstration_only?: boolean
          evidence?: Json
          freshness?: string
          id?: string
          missing_data?: string[]
          org_id: string
          question?: string | null
          recommended_action?: string | null
          subject_key: string
          subject_type: string
          supporting_metric_keys?: string[]
        }
        Update: {
          advisory_only?: boolean
          answer?: string
          approval_requirement?: string | null
          assumptions?: string[]
          confidence?: number
          created_at?: string
          created_by?: string | null
          demonstration_only?: boolean
          evidence?: Json
          freshness?: string
          id?: string
          missing_data?: string[]
          org_id?: string
          question?: string | null
          recommended_action?: string | null
          subject_key?: string
          subject_type?: string
          supporting_metric_keys?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "intelligence_explanations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      intercompany_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          from_entity_id: string
          from_journal_entry_id: string | null
          id: string
          memo: string | null
          org_id: string
          settled_at: string | null
          status: string
          to_entity_id: string
          to_journal_entry_id: string | null
          txn_date: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          from_entity_id: string
          from_journal_entry_id?: string | null
          id?: string
          memo?: string | null
          org_id: string
          settled_at?: string | null
          status?: string
          to_entity_id: string
          to_journal_entry_id?: string | null
          txn_date: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          from_entity_id?: string
          from_journal_entry_id?: string | null
          id?: string
          memo?: string | null
          org_id?: string
          settled_at?: string | null
          status?: string
          to_entity_id?: string
          to_journal_entry_id?: string | null
          txn_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intercompany_transactions_from_entity_id_fkey"
            columns: ["from_entity_id"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intercompany_transactions_from_journal_entry_id_fkey"
            columns: ["from_journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intercompany_transactions_from_journal_entry_id_fkey"
            columns: ["from_journal_entry_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["journal_id"]
          },
          {
            foreignKeyName: "intercompany_transactions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intercompany_transactions_to_entity_id_fkey"
            columns: ["to_entity_id"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intercompany_transactions_to_journal_entry_id_fkey"
            columns: ["to_journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intercompany_transactions_to_journal_entry_id_fkey"
            columns: ["to_journal_entry_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["journal_id"]
          },
        ]
      }
      inventory_categories: {
        Row: {
          asset_account_id: string | null
          cogs_account_id: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          org_id: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          asset_account_id?: string | null
          cogs_account_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          asset_account_id?: string | null
          cogs_account_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_categories_asset_account_id_fkey"
            columns: ["asset_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_categories_asset_account_id_fkey"
            columns: ["asset_account_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "inventory_categories_asset_account_id_fkey"
            columns: ["asset_account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "inventory_categories_cogs_account_id_fkey"
            columns: ["cogs_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_categories_cogs_account_id_fkey"
            columns: ["cogs_account_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "inventory_categories_cogs_account_id_fkey"
            columns: ["cogs_account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "inventory_categories_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "inventory_categories"
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
          journal_entry_id: string | null
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
          journal_entry_id?: string | null
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
          journal_entry_id?: string | null
          org_id?: string
          quantity?: number
          total_cost?: number
          unit_cost?: number
          work_order_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_consumption_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_consumption_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["journal_id"]
          },
          {
            foreignKeyName: "inventory_consumption_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          asset_account_id: string | null
          category_id: string | null
          cogs_account_id: string | null
          cost_method: string
          created_at: string
          current_avg_cost: number
          description: string | null
          id: string
          is_active: boolean
          is_tracked: boolean
          name: string
          org_id: string
          quantity_on_hand: number
          sku: string
          standard_cost: number | null
          unit_of_measure: string
          updated_at: string
        }
        Insert: {
          asset_account_id?: string | null
          category_id?: string | null
          cogs_account_id?: string | null
          cost_method?: string
          created_at?: string
          current_avg_cost?: number
          description?: string | null
          id?: string
          is_active?: boolean
          is_tracked?: boolean
          name: string
          org_id: string
          quantity_on_hand?: number
          sku: string
          standard_cost?: number | null
          unit_of_measure?: string
          updated_at?: string
        }
        Update: {
          asset_account_id?: string | null
          category_id?: string | null
          cogs_account_id?: string | null
          cost_method?: string
          created_at?: string
          current_avg_cost?: number
          description?: string | null
          id?: string
          is_active?: boolean
          is_tracked?: boolean
          name?: string
          org_id?: string
          quantity_on_hand?: number
          sku?: string
          standard_cost?: number | null
          unit_of_measure?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_asset_account_id_fkey"
            columns: ["asset_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_asset_account_id_fkey"
            columns: ["asset_account_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "inventory_items_asset_account_id_fkey"
            columns: ["asset_account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "inventory_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "inventory_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_cogs_account_id_fkey"
            columns: ["cogs_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_cogs_account_id_fkey"
            columns: ["cogs_account_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "inventory_items_cogs_account_id_fkey"
            columns: ["cogs_account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "inventory_items_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_locations: {
        Row: {
          address: string | null
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          org_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_locations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          item_id: string
          journal_entry_id: string | null
          location_id: string | null
          memo: string | null
          occurred_at: string
          org_id: string
          quantity: number
          reference_id: string | null
          reference_type: string | null
          total_cost: number
          txn_type: string
          unit_cost: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          item_id: string
          journal_entry_id?: string | null
          location_id?: string | null
          memo?: string | null
          occurred_at?: string
          org_id: string
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          total_cost?: number
          txn_type: string
          unit_cost?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          item_id?: string
          journal_entry_id?: string | null
          location_id?: string | null
          memo?: string | null
          occurred_at?: string
          org_id?: string
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          total_cost?: number
          txn_type?: string
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["journal_id"]
          },
          {
            foreignKeyName: "inventory_transactions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_org_id_fkey"
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
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
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
          description: string | null
          entry_date: string
          external_id: string | null
          id: string
          ledger_impact: Json | null
          memo: string | null
          org_id: string
          posted_at: string | null
          posted_by: string | null
          reversal_of: string | null
          reversed_by: string | null
          source_id: string | null
          source_ref: string | null
          source_system: string | null
          source_type: string | null
          status: string
        }
        Insert: {
          correlation_id?: string | null
          created_at?: string
          description?: string | null
          entry_date: string
          external_id?: string | null
          id?: string
          ledger_impact?: Json | null
          memo?: string | null
          org_id: string
          posted_at?: string | null
          posted_by?: string | null
          reversal_of?: string | null
          reversed_by?: string | null
          source_id?: string | null
          source_ref?: string | null
          source_system?: string | null
          source_type?: string | null
          status?: string
        }
        Update: {
          correlation_id?: string | null
          created_at?: string
          description?: string | null
          entry_date?: string
          external_id?: string | null
          id?: string
          ledger_impact?: Json | null
          memo?: string | null
          org_id?: string
          posted_at?: string | null
          posted_by?: string | null
          reversal_of?: string | null
          reversed_by?: string | null
          source_id?: string | null
          source_ref?: string | null
          source_system?: string | null
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
          {
            foreignKeyName: "journal_entries_reversal_of_fkey"
            columns: ["reversal_of"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_reversal_of_fkey"
            columns: ["reversal_of"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["journal_id"]
          },
          {
            foreignKeyName: "journal_entries_reversed_by_fkey"
            columns: ["reversed_by"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_reversed_by_fkey"
            columns: ["reversed_by"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["journal_id"]
          },
        ]
      }
      journal_lines: {
        Row: {
          account_id: string
          credit: number
          customer_id: string | null
          debit: number
          department_id: string | null
          entity_id: string | null
          id: string
          journal_id: string
          line_order: number
          location_id: string | null
          memo: string | null
          product_id: string | null
          project_id: string | null
          service_id: string | null
          vendor_id: string | null
        }
        Insert: {
          account_id: string
          credit?: number
          customer_id?: string | null
          debit?: number
          department_id?: string | null
          entity_id?: string | null
          id?: string
          journal_id: string
          line_order?: number
          location_id?: string | null
          memo?: string | null
          product_id?: string | null
          project_id?: string | null
          service_id?: string | null
          vendor_id?: string | null
        }
        Update: {
          account_id?: string
          credit?: number
          customer_id?: string | null
          debit?: number
          department_id?: string | null
          entity_id?: string | null
          id?: string
          journal_id?: string
          line_order?: number
          location_id?: string | null
          memo?: string | null
          product_id?: string | null
          project_id?: string | null
          service_id?: string | null
          vendor_id?: string | null
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
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
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
      legal_entities: {
        Row: {
          code: string
          country: string | null
          created_at: string
          entity_type: string
          functional_currency: string
          id: string
          intercompany_ap_account_id: string | null
          intercompany_ar_account_id: string | null
          is_active: boolean
          is_consolidated: boolean
          name: string
          org_id: string
          parent_entity_id: string | null
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          code: string
          country?: string | null
          created_at?: string
          entity_type?: string
          functional_currency?: string
          id?: string
          intercompany_ap_account_id?: string | null
          intercompany_ar_account_id?: string | null
          is_active?: boolean
          is_consolidated?: boolean
          name: string
          org_id: string
          parent_entity_id?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          country?: string | null
          created_at?: string
          entity_type?: string
          functional_currency?: string
          id?: string
          intercompany_ap_account_id?: string | null
          intercompany_ar_account_id?: string | null
          is_active?: boolean
          is_consolidated?: boolean
          name?: string
          org_id?: string
          parent_entity_id?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_entities_intercompany_ap_account_id_fkey"
            columns: ["intercompany_ap_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_entities_intercompany_ap_account_id_fkey"
            columns: ["intercompany_ap_account_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "legal_entities_intercompany_ap_account_id_fkey"
            columns: ["intercompany_ap_account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "legal_entities_intercompany_ar_account_id_fkey"
            columns: ["intercompany_ar_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_entities_intercompany_ar_account_id_fkey"
            columns: ["intercompany_ar_account_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "legal_entities_intercompany_ar_account_id_fkey"
            columns: ["intercompany_ar_account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "legal_entities_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_entities_parent_entity_id_fkey"
            columns: ["parent_entity_id"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
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
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
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
      reconciliation_lines: {
        Row: {
          amount: number
          bank_transaction_id: string | null
          cleared: boolean
          created_at: string
          id: string
          journal_line_id: string | null
          reconciliation_id: string
        }
        Insert: {
          amount: number
          bank_transaction_id?: string | null
          cleared?: boolean
          created_at?: string
          id?: string
          journal_line_id?: string | null
          reconciliation_id: string
        }
        Update: {
          amount?: number
          bank_transaction_id?: string | null
          cleared?: boolean
          created_at?: string
          id?: string
          journal_line_id?: string | null
          reconciliation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reconciliation_lines_bank_transaction_id_fkey"
            columns: ["bank_transaction_id"]
            isOneToOne: false
            referencedRelation: "bank_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reconciliation_lines_journal_line_id_fkey"
            columns: ["journal_line_id"]
            isOneToOne: false
            referencedRelation: "journal_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reconciliation_lines_journal_line_id_fkey"
            columns: ["journal_line_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["line_id"]
          },
          {
            foreignKeyName: "reconciliation_lines_reconciliation_id_fkey"
            columns: ["reconciliation_id"]
            isOneToOne: false
            referencedRelation: "bank_reconciliations"
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
          event_type: string | null
          external_id: string | null
          id: string
          idempotency_key: string
          last_retry_at: string | null
          org_id: string
          request: Json | null
          response: Json | null
          retry_count: number
          source: string
          source_id: string | null
          status: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          error?: string | null
          event_type?: string | null
          external_id?: string | null
          id?: string
          idempotency_key: string
          last_retry_at?: string | null
          org_id: string
          request?: Json | null
          response?: Json | null
          retry_count?: number
          source: string
          source_id?: string | null
          status: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          error?: string | null
          event_type?: string | null
          external_id?: string | null
          id?: string
          idempotency_key?: string
          last_retry_at?: string | null
          org_id?: string
          request?: Json | null
          response?: Json | null
          retry_count?: number
          source?: string
          source_id?: string | null
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
          {
            foreignKeyName: "sync_history_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "integration_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_categories: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          kind: string
          name: string
          org_id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          kind?: string
          name: string
          org_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          kind?: string
          name?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_categories_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_jurisdictions: {
        Row: {
          code: string
          country: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          org_id: string
          region: string | null
          updated_at: string
        }
        Insert: {
          code: string
          country?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          region?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          country?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          region?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_jurisdictions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_liabilities: {
        Row: {
          category_id: string
          created_at: string
          filed_at: string | null
          id: string
          journal_entry_id: string | null
          jurisdiction_id: string
          memo: string | null
          org_id: string
          paid_at: string | null
          period_end: string
          period_start: string
          status: string
          tax_amount: number
          taxable_amount: number
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          filed_at?: string | null
          id?: string
          journal_entry_id?: string | null
          jurisdiction_id: string
          memo?: string | null
          org_id: string
          paid_at?: string | null
          period_end: string
          period_start: string
          status?: string
          tax_amount?: number
          taxable_amount?: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          filed_at?: string | null
          id?: string
          journal_entry_id?: string | null
          jurisdiction_id?: string
          memo?: string | null
          org_id?: string
          paid_at?: string | null
          period_end?: string
          period_start?: string
          status?: string
          tax_amount?: number
          taxable_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_liabilities_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "tax_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tax_liabilities_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tax_liabilities_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "v_general_ledger"
            referencedColumns: ["journal_id"]
          },
          {
            foreignKeyName: "tax_liabilities_jurisdiction_id_fkey"
            columns: ["jurisdiction_id"]
            isOneToOne: false
            referencedRelation: "tax_jurisdictions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tax_liabilities_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_rates: {
        Row: {
          category_id: string
          created_at: string
          effective_from: string
          effective_to: string | null
          expense_account_id: string | null
          id: string
          is_active: boolean
          jurisdiction_id: string
          liability_account_id: string | null
          org_id: string
          rate: number
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          effective_from: string
          effective_to?: string | null
          expense_account_id?: string | null
          id?: string
          is_active?: boolean
          jurisdiction_id: string
          liability_account_id?: string | null
          org_id: string
          rate: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          expense_account_id?: string | null
          id?: string
          is_active?: boolean
          jurisdiction_id?: string
          liability_account_id?: string | null
          org_id?: string
          rate?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_rates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "tax_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tax_rates_expense_account_id_fkey"
            columns: ["expense_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tax_rates_expense_account_id_fkey"
            columns: ["expense_account_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "tax_rates_expense_account_id_fkey"
            columns: ["expense_account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "tax_rates_jurisdiction_id_fkey"
            columns: ["jurisdiction_id"]
            isOneToOne: false
            referencedRelation: "tax_jurisdictions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tax_rates_liability_account_id_fkey"
            columns: ["liability_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tax_rates_liability_account_id_fkey"
            columns: ["liability_account_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "tax_rates_liability_account_id_fkey"
            columns: ["liability_account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "tax_rates_org_id_fkey"
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
      vendors: {
        Row: {
          address: Json | null
          created_at: string
          default_expense_account_id: string | null
          email: string | null
          external_id: string | null
          external_source: string | null
          id: string
          memo: string | null
          name: string
          org_id: string
          phone: string | null
          status: string
          terms_days: number
          updated_at: string
        }
        Insert: {
          address?: Json | null
          created_at?: string
          default_expense_account_id?: string | null
          email?: string | null
          external_id?: string | null
          external_source?: string | null
          id?: string
          memo?: string | null
          name: string
          org_id: string
          phone?: string | null
          status?: string
          terms_days?: number
          updated_at?: string
        }
        Update: {
          address?: Json | null
          created_at?: string
          default_expense_account_id?: string | null
          email?: string | null
          external_id?: string | null
          external_source?: string | null
          id?: string
          memo?: string | null
          name?: string
          org_id?: string
          phone?: string | null
          status?: string
          terms_days?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendors_default_expense_account_id_fkey"
            columns: ["default_expense_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_default_expense_account_id_fkey"
            columns: ["default_expense_account_id"]
            isOneToOne: false
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "vendors_default_expense_account_id_fkey"
            columns: ["default_expense_account_id"]
            isOneToOne: false
            referencedRelation: "v_trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "vendors_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_account_balances: {
        Row: {
          account_id: string | null
          balance: number | null
          code: string | null
          credit_total: number | null
          debit_total: number | null
          is_active: boolean | null
          is_system: boolean | null
          name: string | null
          normal_balance: string | null
          org_id: string | null
          parent_id: string | null
          sort_order: number | null
          type: string | null
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
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
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
      v_ap_aging: {
        Row: {
          balance: number | null
          bill_id: string | null
          bill_number: string | null
          bucket: string | null
          days_past_due: number | null
          due_date: string | null
          issue_date: string | null
          org_id: string | null
          vendor_id: string | null
          vendor_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bills_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
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
      v_control_exceptions: {
        Row: {
          category: string | null
          message: string | null
          occurred_on: string | null
          org_id: string | null
          ref_id: string | null
          severity: string | null
        }
        Relationships: []
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
            referencedRelation: "v_account_balances"
            referencedColumns: ["account_id"]
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
      approve_financial_event: {
        Args: { _event_id: string; _note: string; _org_id: string }
        Returns: Json
      }
      approve_period_close: {
        Args: { _close_run_id: string; _note: string }
        Returns: Json
      }
      client_has_scope: {
        Args: { _client_id: string; _scope: string }
        Returns: boolean
      }
      complete_bank_reconciliation: {
        Args: {
          _cleared_bank_txn_ids: string[]
          _org_id: string
          _reconciliation_id: string
          _statement_ending_balance: number
        }
        Returns: Json
      }
      ensure_sample_demo_membership: { Args: never; Returns: string }
      has_role: {
        Args: {
          _org: string
          _role: Database["public"]["Enums"]["app_role"]
          _user: string
        }
        Returns: boolean
      }
      ingest_financial_event: {
        Args: {
          _correlation_id: string
          _external_event_type: string
          _external_id: string
          _idempotency_key: string
          _org_id: string
          _payload: Json
          _source_id: string
          _source_system: string
        }
        Returns: Json
      }
      is_org_member: { Args: { _org: string }; Returns: boolean }
      is_period_open: {
        Args: { _date: string; _org: string }
        Returns: boolean
      }
      match_bank_transaction: {
        Args: {
          _bank_txn_id: string
          _journal_line_id: string
          _org_id: string
        }
        Returns: Json
      }
      materialize_financial_event: {
        Args: { _event_id: string; _org_id: string }
        Returns: Json
      }
      post_bill_with_posting: {
        Args: {
          _bill_number: string
          _correlation_id: string
          _due_date: string
          _external_id: string
          _external_source: string
          _issue_date: string
          _lines: Json
          _memo: string
          _org_id: string
          _source_ref: string
          _source_system: string
          _tax: number
          _vendor_id: string
        }
        Returns: Json
      }
      post_manual_journal: {
        Args: {
          _description: string
          _entry_date: string
          _lines: Json
          _memo: string
          _org_id: string
        }
        Returns: Json
      }
      record_inventory_consumption_with_posting: {
        Args: {
          _actor_id: string
          _actor_type: string
          _consumed_at: string
          _correlation_id: string
          _external_id: string
          _external_source: string
          _item_description: string
          _item_ref: string
          _org_id: string
          _quantity: number
          _unit_cost: number
          _work_order_ref: string
        }
        Returns: Json
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
      record_vendor_payment_with_posting: {
        Args: {
          _amount: number
          _apply_to: Json
          _correlation_id: string
          _external_id: string
          _external_source: string
          _memo: string
          _method: string
          _org_id: string
          _payment_date: string
          _reference: string
          _source_ref: string
          _source_system: string
          _vendor_id: string
        }
        Returns: Json
      }
      reject_financial_event: {
        Args: { _event_id: string; _org_id: string; _reason: string }
        Returns: Json
      }
      reopen_period: {
        Args: { _org_id: string; _period_id: string; _reason: string }
        Returns: Json
      }
      resolve_account: {
        Args: { _org: string; _purpose: string }
        Returns: string
      }
      retry_materialization: {
        Args: { _event_id: string; _org_id: string }
        Returns: Json
      }
      reverse_journal: {
        Args: { _journal_id: string; _org_id: string; _reason: string }
        Returns: Json
      }
      seed_canonical_metrics: { Args: { _org_id: string }; Returns: number }
      seed_default_close_tasks: {
        Args: { _org: string; _run: string }
        Returns: undefined
      }
      set_close_task_status: {
        Args: { _note: string; _status: string; _task_id: string }
        Returns: Json
      }
      start_period_close: {
        Args: { _org_id: string; _period_id: string }
        Returns: Json
      }
      unmatch_bank_transaction: {
        Args: { _bank_txn_id: string; _org_id: string }
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
      metric_category:
        | "cash"
        | "revenue"
        | "profitability"
        | "ar"
        | "ap"
        | "expenses"
        | "banking"
        | "growth"
        | "operations"
        | "people"
        | "compensation"
        | "technology"
        | "risk"
        | "company_health"
      metric_freshness: "fresh" | "delayed" | "stale" | "unavailable"
      metric_refresh_frequency:
        | "realtime"
        | "minutely"
        | "hourly"
        | "daily"
        | "weekly"
        | "monthly"
        | "on_demand"
      metric_source_type: "table" | "view" | "rpc" | "derived" | "external"
      metric_status: "draft" | "active" | "deprecated"
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
      metric_category: [
        "cash",
        "revenue",
        "profitability",
        "ar",
        "ap",
        "expenses",
        "banking",
        "growth",
        "operations",
        "people",
        "compensation",
        "technology",
        "risk",
        "company_health",
      ],
      metric_freshness: ["fresh", "delayed", "stale", "unavailable"],
      metric_refresh_frequency: [
        "realtime",
        "minutely",
        "hourly",
        "daily",
        "weekly",
        "monthly",
        "on_demand",
      ],
      metric_source_type: ["table", "view", "rpc", "derived", "external"],
      metric_status: ["draft", "active", "deprecated"],
    },
  },
} as const
