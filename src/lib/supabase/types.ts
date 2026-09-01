/**
 * Supabase database types, matched by hand to faceup-server's shared/schema.ts (Drizzle).
 * Re-sync manually if that schema changes, or regenerate properly once you have CLI access:
 *
 *   npx supabase gen types typescript --project-id <project-ref> > src/lib/supabase/types.ts
 *
 * Only the columns this dashboard reads are listed — the real tables have more.
 */

type Table<Row> = {
  Row: Row
  Insert: Partial<Row>
  Update: Partial<Row>
  Relationships: []
}

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: '12'
  }
  public: {
    Tables: {
      users: Table<{
        id: string
        username: string
        email: string
        created_at: string | null
        last_active_at: string | null
        coins: number | null
        gems: number | null
        selected_avatar_id: string | null
        membership_type: 'normal' | 'premium' | null
        subscription_expires_at: string | null
        subscription_cancel_at_period_end: boolean | null
        subscription_cancel_reason: string | null
        subscription_plan: string | null
        all_in_lose_streak: number | null
        privacy_settings: { dataCollection?: boolean } | null
      }>
      gem_transactions: Table<{
        id: string
        user_id: string
        transaction_type: 'purchase' | 'reward' | 'spend' | 'refund'
        amount: number
        description: string
        created_at: string | null
      }>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}

export type UserRow = Database['public']['Tables']['users']['Row']
export type GemTransactionRow = Database['public']['Tables']['gem_transactions']['Row']
