import { NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Seed endpoint is disabled in production' }, { status: 404 });
    }
    const configuredSecret = process.env.MEDQR_SEED_SECRET;
    if (!configuredSecret || request.headers.get('x-seed-secret') !== configuredSecret) {
      return NextResponse.json({ error: 'Seed authorization required' }, { status: 401 });
    }
    const plainPassword = process.env.MEDQR_SEED_PASSWORD;
    if (!plainPassword || plainPassword.length < 12) {
      return NextResponse.json({ error: 'MEDQR_SEED_PASSWORD must be configured with at least 12 characters' }, { status: 500 });
    }
    // Check if superadmin already exists
    const { data: existing } = await supabase
      .from('staff_credentials')
      .select('username')
      .eq('username', 'superadmin')
      .single();

    if (existing) {
      const passwordHash = await hashPassword(plainPassword);
      const { error: resetError } = await supabase
        .from('staff_credentials')
        .update({ password_hash: passwordHash, last_login: null })
        .eq('username', 'superadmin');
      if (resetError) {
        return NextResponse.json({ error: 'Failed to reset existing superadmin password' }, { status: 500 });
      }
      return NextResponse.json(
        { success: true, message: 'Existing development superadmin password reset successfully.', credentials: { username: 'superadmin' } },
        { status: 200 }
      );
    }

    // 1. Create default institution for the superadmin
    const { data: inst, error: instError } = await supabase
      .from('institutions')
      .insert([
        {
          name: 'Ministry of Health HQ',
          location: 'Central',
          owner: 'System Administrator',
          license_number: 'LIC-MOH-001',
          services: ['Administration', 'Oversight'],
          portal_key: 'MINISTRY-HQ-001',
          is_active: true,
        },
      ])
      .select()
      .single();

    if (instError || !inst) {
      return NextResponse.json(
        { error: 'Failed to create seed institution: ' + (instError?.message || 'unknown') },
        { status: 500 }
      );
    }

    // 2. Create superadmin staff record
    const { data: staffRec, error: staffError } = await supabase
      .from('staff')
      .insert([
        {
          institution_id: inst.id,
          full_name: 'System Administrator',
          age: 30,
          gender: 'Other',
          occupation: 'superadmin',
          is_active: true,
        },
      ])
      .select()
      .single();

    if (staffError || !staffRec) {
      return NextResponse.json(
        { error: 'Failed to create seed staff: ' + (staffError?.message || 'unknown') },
        { status: 500 }
      );
    }

    // 3. Create credentials
    const passwordHash = await hashPassword(plainPassword);

    const { error: credError } = await supabase
      .from('staff_credentials')
      .insert([
        {
          staff_id: staffRec.id,
          username: 'superadmin',
          password_hash: passwordHash,
        },
      ]);

    if (credError) {
      return NextResponse.json(
        { error: 'Failed to create seed credentials: ' + credError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Seed completed successfully.',
      credentials: { username: 'superadmin' },
      institution: {
        id: inst.id,
        name: inst.name,
        portal_key: inst.portal_key,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Seed failed: ' + err.message },
      { status: 500 }
    );
  }
}

