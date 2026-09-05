import { NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase';
import { validateRequired, handleApiError } from '@/lib/validation';
import { requireSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const auth = requireSession(request, ['doctor']);
    if (auth.response) return auth.response;
    const body = await request.json();
    const validation = validateRequired(body, ['episodeId', 'medication', 'dosage']);
    if (validation) return validation;

    const { data, error } = await supabase
      .from('prescriptions')
      .insert([
        {
          episode_id: body.episodeId,
          doctor_id: auth.session.staffId,
          medication: body.medication.trim(),
          dosage: body.dosage.trim(),
          instructions: body.instructions?.trim() || null,
          paid: true,
          dispensed: false,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to save prescription: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, prescription: data }, { status: 201 });
  } catch (err) {
    return handleApiError(err, 'Failed to save prescription');
  }
}

export async function GET(request: Request) {
  try {
    const auth = requireSession(request);
    if (auth.response) return auth.response;
    const { searchParams } = new URL(request.url);
    const episodeId = searchParams.get('episodeId');

    let query = supabase
      .from('prescriptions')
      .select('*, staff!prescriptions_doctor_id_fkey(doctor_name: full_name)');
    if (episodeId) query = query.eq('episode_id', episodeId);
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Database error: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, prescriptions: data || [] });
  } catch (err) {
    return handleApiError(err, 'Failed to fetch prescriptions');
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = requireSession(request, ['pharmacy', 'admin', 'ministry', 'superadmin']);
    if (auth.response) return auth.response;
    const body = await request.json();

    // Batch dispense flow (pharmacy completing dispensing authorization)
    if (body.episodeId) {
      const { episodeId } = body;

      if (!episodeId) {
        return NextResponse.json({ error: 'episodeId is required' }, { status: 400 });
      }
      if (!auth.session.staffId && auth.session.role === 'pharmacy') {
        return NextResponse.json({ error: 'pharmacyStaffId is required' }, { status: 400 });
      }

      // Enforce workflow: episode must already be in a paid/ready state.
      // Allowed pharmacy dispense statuses:
      // - waiting_pharmacy_payment
      // - prescription_ready
      // - completed (idempotent if already dispensed)
      const { data: episode, error: episodeErr } = await supabase
        .from('episodes')
        .select('id, status')
        .eq('id', episodeId)
        .single();

      if (episodeErr || !episode) {
        return NextResponse.json({ error: 'Failed to validate episode state: ' + (episodeErr?.message || 'Episode not found') }, { status: 500 });
      }

      // Pharmacy dispense should only be possible after consultation/payment is complete.
      // Allowed statuses cover any realistic workflow state where prescriptions may be ready.
      const allowed = new Set([
        'created',
        'in_consultation',
        'waiting_lab',
        'lab_results_ready',
        'waiting_cashier',
        'consultation_complete',
        'waiting_pharmacy_payment',
        'prescription_ready',
        'completed',
      ]);
      if (!allowed.has(episode.status)) {
        return NextResponse.json(
          { error: `Dispensing not allowed when episode status is '${episode.status}'` },
          { status: 400 }
        );
      }


      // Ensure there are prescriptions to dispense.
      const { data: prescRows, error: prescErr } = await supabase
        .from('prescriptions')
        .select('id, dispensed')
        .eq('episode_id', episodeId);

      if (prescErr) {
        return NextResponse.json({ error: 'Failed to load prescriptions: ' + prescErr.message }, { status: 500 });
      }

      if (!prescRows || prescRows.length === 0) {
        return NextResponse.json({ error: 'No prescriptions found to dispense' }, { status: 400 });
      }

      // Idempotent: only update rows that are not yet dispensed.
      const { data, error } = await supabase
        .from('prescriptions')
        .update({
          dispensed: true,
          pharmacy_staff_id: auth.session.staffId,
        })
        .eq('episode_id', episodeId)
        .eq('dispensed', false)
        .select();

      if (error) {
        return NextResponse.json({ error: 'Failed to dispense prescriptions: ' + error.message }, { status: 500 });
      }

      // Promote episode to completed if it was waiting for pharmacy payment/prescription readiness.
      if (episode.status !== 'completed') {
        await supabase
          .from('episodes')
          .update({ status: 'completed' })
          .eq('id', episodeId);
      }

      return NextResponse.json({ success: true, prescriptions: data || [] });
    }

    // Single prescription update (advanced/admin)
    const validation = validateRequired(body, ['prescriptionId']);
    if (validation) return validation;

    const updates: any = {};
    if (body.dispensed !== undefined) updates.dispensed = body.dispensed;
    if (body.paid !== undefined) updates.paid = body.paid;
    if (body.pharmacyStaffId !== undefined) updates.pharmacy_staff_id = body.pharmacyStaffId;

    const { data, error } = await supabase
      .from('prescriptions')
      .update(updates)
      .eq('id', body.prescriptionId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update prescription: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, prescription: data });
  } catch (err) {
    return handleApiError(err, 'Failed to update prescription');
  }
}


