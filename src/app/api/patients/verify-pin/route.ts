import { NextResponse } from 'next/server';
import { verifyPatientPin } from '@/lib/patient-pin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientId, pin } = body;

    if (!patientId || !pin) {
      return NextResponse.json({ error: 'patientId and pin are required' }, { status: 400 });
    }

    const result = await verifyPatientPin(patientId, pin);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'PIN verification failed' }, { status: 401 });
    }

    return NextResponse.json({ success: true, patient: result.patient });
  } catch (err: any) {
    return NextResponse.json({ error: 'PIN verification failed: ' + err.message }, { status: 500 });
  }
}
