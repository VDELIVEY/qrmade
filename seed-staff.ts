import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD = '1234567rg';
const PASSWORD_HASH = await bcrypt.hash(PASSWORD, 12);

const staffSeeds = [
  {
    role: 'doctor',
    username: 'dr_amina_hassan',
    fullName: 'Dr. Amina Hassan',
    age: 32,
    gender: 'Female',
    institutionName: 'Mulago National Hospital',
    portalKey: 'MULAGO-KEY-2025',
  },
  {
    role: 'doctor',
    username: 'dr_john_baptist',
    fullName: 'Dr. John Baptist',
    age: 29,
    gender: 'Male',
    institutionName: 'Mulago National Hospital',
    portalKey: 'MULAGO-KEY-2025',
  },
  {
    role: 'doctor',
    username: 'dr_fatuma_nakato',
    fullName: 'Dr. Fatuma Nakato',
    age: 35,
    gender: 'Female',
    institutionName: 'Mulago National Hospital',
    portalKey: 'MULAGO-KEY-2025',
  },
  {
    role: 'receptionist',
    username: 'receptionist_mariam',
    fullName: 'Mariam Nakibuule',
    age: 24,
    gender: 'Female',
    institutionName: 'Mulago National Hospital',
    portalKey: 'MULAGO-KEY-2025',
  },
  {
    role: 'receptionist',
    username: 'receptionist_peter',
    fullName: 'Peter Ssembatya',
    age: 27,
    gender: 'Male',
    institutionName: 'Mulago National Hospital',
    portalKey: 'MULAGO-KEY-2025',
  },
  {
    role: 'receptionist',
    username: 'receptionist_sarah',
    fullName: 'Sarah Namubiru',
    age: 22,
    gender: 'Female',
    institutionName: 'Mulago National Hospital',
    portalKey: 'MULAGO-KEY-2025',
  },
  {
    role: 'lab',
    username: 'lab_abdullah',
    fullName: 'Abdullah Wasswa',
    age: 30,
    gender: 'Male',
    institutionName: 'Mulago National Hospital',
    portalKey: 'MULAGO-KEY-2025',
  },
  {
    role: 'lab',
    username: 'lab_grace',
    fullName: 'Grace Kirabo',
    age: 26,
    gender: 'Female',
    institutionName: 'Mulago National Hospital',
    portalKey: 'MULAGO-KEY-2025',
  },
  {
    role: 'lab',
    username: 'lab_raphael',
    fullName: 'Raphael Mugerwa',
    age: 31,
    gender: 'Male',
    institutionName: 'Mulago National Hospital',
    portalKey: 'MULAGO-KEY-2025',
  },
];

async function getOrCreateInstitution(name: string, portalKey: string) {
  const { data: existing } = await supabase
    .from('institutions')
    .select('id, name, portal_key')
    .eq('portal_key', portalKey)
    .single();

  if (existing) return existing;

  const { data, error } = await supabase
    .from('institutions')
    .insert([
      {
        name,
        location: 'Central',
        owner: 'System Administrator',
        license_number: 'LIC-MUL-001',
        services: ['General', 'Emergency', 'Laboratory'],
        portal_key: portalKey,
        is_active: true,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error(`Failed to create institution ${name}:`, error.message);
    throw error;
  }
  return data;
}

async function createStaff(seed: any, institutionId: string) {
  const { data: existingCred } = await supabase
    .from('staff_credentials')
    .select('username')
    .eq('username', seed.username)
    .single();

  if (existingCred) {
    console.log(`- Skipping ${seed.username}: already exists`);
    return;
  }

  const { data: staffRec, error: staffError } = await supabase
    .from('staff')
    .insert([
      {
        institution_id: institutionId,
        full_name: seed.fullName,
        age: seed.age,
        gender: seed.gender,
        occupation: seed.role,
        is_active: true,
      },
    ])
    .select()
    .single();

  if (staffError || !staffRec) {
    console.error(`Failed to create staff ${seed.username}:`, staffError?.message);
    return;
  }

  const { error: credError } = await supabase
    .from('staff_credentials')
    .insert([
      {
        staff_id: staffRec.id,
        username: seed.username,
        password_hash: PASSWORD_HASH,
      },
    ]);

  if (credError) {
    console.error(`Failed to create credentials for ${seed.username}:`, credError.message);
    return;
  }

  console.log(`- Created ${seed.role}: ${seed.username} / ${seed.fullName}`);
}

async function main() {
  console.log('Seeding staff...');
  const institution = await getOrCreateInstitution('Mulago National Hospital', 'MULAGO-KEY-2025');
  console.log(`Using institution: ${institution.name} (${institution.id})`);

  for (const seed of staffSeeds) {
    await createStaff(seed, institution.id);
  }

  console.log('\nDone. All staff use password: 1234567rg');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
