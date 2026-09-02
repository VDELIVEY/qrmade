import { NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';
import { requireSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const auth = requireSession(request, ['admin', 'ministry', 'superadmin']);
    if (auth.response) return auth.response;
    const body = await request.json();
    const { fullName, age, gender, occupation, doctorServices, institutionId: requestedInstitutionId, username, password } = body;
    const institutionId = auth.session.institutionId || requestedInstitutionId;

    if (!fullName || !age || !gender || !occupation || !username || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Create Staff Record
    const { data: staffData, error: staffError } = await supabase.from('staff').insert([
      {
        institution_id: institutionId,
        full_name: fullName,
        age: parseInt(age),
        gender,
        occupation,
        doctor_services: occupation === 'doctor' ? doctorServices || [] : null,
      }
    ]).select();

    if (staffError || !staffData?.[0]) {
      return NextResponse.json({ error: staffError?.message || 'Failed to create staff record' }, { status: 500 });
    }

    const staffId = staffData[0].id;

    // 2. Create Credentials
    const passwordHash = await hashPassword(password);
    const { error: credError } = await supabase.from('staff_credentials').insert([
      {
        staff_id: staffId,
        username,
        password_hash: passwordHash,
      }
    ]);

    if (credError) {
      // Cleanup staff record if credential creation fails
      await supabase.from('staff').delete().eq('id', staffId);
      return NextResponse.json({ error: 'Username already exists or failed to create credentials' }, { status: 409 });
    }

    return NextResponse.json({ success: true, staff: staffData[0] });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to register staff' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const auth = requireSession(request, ['admin', 'ministry', 'superadmin']);
    if (auth.response) return auth.response;
    const { data, error } = await supabase.from('staff').select('*, institutions(*)');
    if (error) {
      return NextResponse.json({ mock: true, staff: [] });
    }
    return NextResponse.json({ mock: false, staff: data || [] });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

