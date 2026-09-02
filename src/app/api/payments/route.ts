import { NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase';
import { requireSession } from '@/lib/session';
import { generateCode } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const auth = requireSession(request, ['cashier', 'admin', 'ministry', 'superadmin']);
    if (auth.response) return auth.response;
    const body = await request.json();
    const { episodeId, amount, method, type } = body;

    if (!episodeId || amount === undefined || !method || !type) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }
    if (Number(amount) !== 1000 || type !== 'consultation' || !['cash', 'mobile', 'card', 'insurance', 'waived'].includes(method)) {
      return NextResponse.json({ error: 'Invalid consultation payment' }, { status: 400 });
    }
    const { data: episode, error: episodeError } = await supabase.from('episodes').select('id, institution_id, status').eq('id', episodeId).single();
    if (episodeError || !episode) return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    if (auth.session.institutionId && episode.institution_id !== auth.session.institutionId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (episode.status !== 'created') return NextResponse.json({ error: 'This episode is not awaiting consultation payment' }, { status: 409 });

    const { data: payment, error: paymentError } = await supabase.from('payments').insert({ episode_id: episodeId, amount: 1000, method, type, cashier_id: auth.session.staffId, receipt_number: generateCode('RCT', 10) }).select().single();
    if (paymentError) return NextResponse.json({ error: 'Payment processing failed: ' + paymentError.message }, { status: 500 });
    const { error: statusError } = await supabase.from('episodes').update({ status: 'in_consultation' }).eq('id', episodeId).eq('status', 'created');
    if (statusError) return NextResponse.json({ error: 'Payment recorded but episode update failed' }, { status: 500 });
    return NextResponse.json({ mock: false, payment, status: 'in_consultation' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Payment processing failed' }, { status: 500 });
  }
}

