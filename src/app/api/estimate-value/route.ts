import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const { rank, level, uc_balance, skin_count, legendary_count } = await req.json();

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.rpc('estimate_account_value', {
    p_rank: rank,
    p_level: level,
    p_uc_balance: uc_balance,
    p_skin_count: skin_count,
    p_legendary_count: legendary_count,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
