import { NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase';
import { validateRequired, validateNumber, validateEnum, handleApiError } from '@/lib/validation';
import { generateCode } from '@/lib/auth';
import { requireSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const auth = requireSession(request, ['ministry', 'superadmin']);
    if (auth.response) return auth.response;
    const body = await request.json();
    const validation = validateRequired(body, ['firstName', 'lastName', 'age', 'gender']);
    if (validation) return validation;

    const ageErr = validateNumber(body.age, 'age', 0, 150);
    if (ageErr) return ageErr;

    const genderErr = validateEnum(body.gender, 'gender', ['Male', 'Female', 'Other']);
    if (genderErr) return genderErr;

    if (body.bloodType) {
      const btErr = validateEnum(body.bloodType, 'bloodType', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']);
      if (btErr) return btErr;
    }

    const qr_code = generateCode('PAT', 10);

    const { data, error } = await supabase
      .from('patients')
      .insert([
        {
          qr_code,
          first_name: body.firstName.trim(),
          last_name: body.lastName.trim(),
          age: parseInt(body.age),
          gender: body.gender,
          blood_type: body.bloodType || 'Unknown',
          underlying_conditions: body.conditions?.trim() || null,
          medical_history: body.history?.trim() || null,
          allergies: body.allergies?.trim() || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to register citizen: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, patient: data }, { status: 201 });
  } catch (err) {
    return handleApiError(err, 'Failed to register citizen');
  }
}

export async function GET(request: Request) {
  try {
    const auth = requireSession(request);
    if (auth.response) return auth.response;
    const { searchParams } = new URL(request.url);
    const qr = searchParams.get('qr');
    const search = searchParams.get('search');

    if (qr) {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('qr_code', qr)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
        }
        console.error('Supabase error:', error);
        return NextResponse.json({ error: 'Database error: ' + error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, patient: data });
    }

    if (search) {
      const parts = search.trim().split(/\s+/).filter(Boolean);
      let query = supabase.from('patients').select('*');
      
      if (parts.length === 1) {
        query = query.or(`first_name.ilike.%${parts[0]}%,last_name.ilike.%${parts[0]}%`);
      } else if (parts.length > 1) {
        query = query.or(`and(first_name.ilike.%${parts[0]}%,last_name.ilike.%${parts[1]}%),and(first_name.ilike.%${parts[1]}%,last_name.ilike.%${parts[0]}%)`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json({ error: 'Database error: ' + error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, patients: data || [] });
    }

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Database error: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, patients: data || [] });
  } catch (err) {
    return handleApiError(err, 'Failed to fetch citizens');
  }
}

export async function PUT(request: Request) {
  try {
    const auth = requireSession(request, ['ministry', 'superadmin']);
    if (auth.response) return auth.response;
    const body = await request.json();
    const { id, photo_url } = body;

    if (!id) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('patients')
      .update({ photo_url })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: 'Failed to update patient: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, patient: data });
  } catch (err) {
    return handleApiError(err, 'Failed to update patient');
  }
}

