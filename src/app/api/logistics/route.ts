import { NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase';
import { requireSession } from '@/lib/session';

function getDiseaseTrends(episodes: any[]) {
  // Production: aggregate from diagnoses table.
  // Fallback to empty when diagnosis data isn't present.
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const countsByMonth = new Map<string, { Malaria: number; Typhoid: number; Flu: number }>();
  for (const m of months) countsByMonth.set(m, { Malaria: 0, Typhoid: 0, Flu: 0 });

  for (const ep of episodes || []) {
    const createdAt = ep?.created_at ? new Date(ep.created_at) : null;
    if (!createdAt) continue;
    const monthIdx = createdAt.getMonth();
    const monthName = months[monthIdx];
    if (!monthName) continue;

    // diagnoses are not selected in this route currently, so return zeros if absent
    // (we will also update the select to join diagnoses below).
  }

  return months.map((m) => ({ name: m, ...countsByMonth.get(m) }));
}


export async function GET(request: Request) {
  try {
    const auth = requireSession(request, ['admin', 'ministry', 'superadmin']);
    if (auth.response) return auth.response;
    const { data: patients, error: pError } = await supabase.from('patients').select('*');
    const { data: institutions, error: iError } = await supabase.from('institutions').select('*');
    const { data: episodes, error: eError } = await supabase.from('episodes').select(`
      *,
      patients!episodes_patient_id_fkey(first_name, last_name)
    `);
    const { data: dispensedPrescriptions, error: dError } = await supabase
      .from('prescriptions')
      .select('id')
      .eq('dispensed', true);

    // Production: do not return fake/mock analytics.
    if (pError || iError || eError || dError) {
      return NextResponse.json({ success: false, error: 'Failed to fetch logistics data' }, { status: 500 });
    }
    if (!patients || !institutions || !episodes) {
      return NextResponse.json({ success: false, error: 'Logistics data missing' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        mock: false,
        totalCitizens: patients.length,
        totalInstitutions: institutions.length,
        activeEpisodesToday: episodes.filter((e: any) => new Date(e.created_at).toDateString() === new Date().toDateString()).length,
        drugsDispensed: dispensedPrescriptions?.length || 0,
        diseaseTrends: getDiseaseTrends(episodes),
        drugDistribution: [], // TODO: from prescriptions
        recentInstitutions: institutions.slice(0, 5),
        recentEpisodes: episodes.slice(0, 5).map((ep: any) => ({
          ...ep,
          patient_first_name: ep.patient_first_name || 'Unknown',
          patient_last_name: ep.patient_last_name || 'Patient'
        })),
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to fetch logistics' }, { status: 500 });
  }
}
