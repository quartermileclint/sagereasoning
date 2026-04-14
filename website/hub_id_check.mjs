import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync('/sessions/serene-nifty-allen/mnt/sagereasoning/website/.env.local', 'utf8');
const getEnv = (key) => {
  const m = env.match(new RegExp('^' + key + '=(.+)$', 'm'));
  return m ? m[1].trim() : null;
};

const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Find Clinton's user_id via email
const { data: users, error: userErr } = await supabase.auth.admin.listUsers();
if (userErr) { console.error('users err', userErr); process.exit(1); }

const clinton = users.users.find(u => u.email === 'clintonaitkenhead@hotmail.com');
if (!clinton) {
  console.log('Clinton not found by email. Listing first 5 emails:');
  users.users.slice(0, 5).forEach(u => console.log('  -', u.email, u.id));
  process.exit(1);
}
console.log('Clinton auth id:', clinton.id);

// Get mentor profile(s)
const { data: profiles, error: profErr } = await supabase
  .from('mentor_profiles')
  .select('id')
  .eq('user_id', clinton.id);
if (profErr) { console.error('profile err', profErr); process.exit(1); }
console.log('mentor_profiles for Clinton:', profiles.map(p => p.id));

const profileIds = profiles.map(p => p.id);

// Get all interactions for those profile ids
const { data: interactions, error: intErr } = await supabase
  .from('mentor_interactions')
  .select('hub_id')
  .in('profile_id', profileIds);
if (intErr) { console.error('interactions err', intErr); process.exit(1); }

console.log('Total mentor_interactions for Clinton:', interactions.length);

const counts = {};
for (const row of interactions) {
  const k = row.hub_id ?? '(null)';
  counts[k] = (counts[k] || 0) + 1;
}
console.log('hub_id distribution:');
for (const [k, v] of Object.entries(counts).sort((a,b) => b[1]-a[1])) {
  console.log(`  ${k}: ${v}`);
}
