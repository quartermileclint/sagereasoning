// Independent third-party verifier for SageReasoning Layer-2 signed assessments.
// Uses ONLY: (1) the published public key from GET /api/public-key, and
// (2) the documented canonicalisation (lexicographically-sorted object keys at
// every level; arrays preserved; finite numbers via toString; -0 -> 0).
// No dependency on the substrate's own code — re-implemented from the public spec.
import { readFileSync } from 'node:fs';
import { verify, createPublicKey } from 'node:crypto';

// --- documented canonicalisation (mirror of layer2-canonical-json.ts) ---
function canon(v, path = 'assessment') {
  if (v === null) return 'null';
  if (v === undefined) throw new Error(`undefined at ${path}`);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) throw new Error(`non-finite at ${path}`);
    return Object.is(v, -0) ? '0' : v.toString();
  }
  if (typeof v === 'string') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map((x, i) => canon(x, `${path}[${i}]`)).join(',') + ']';
  if (typeof v === 'object') {
    const keys = Object.keys(v).sort();
    return '{' + keys.map((k) => `${JSON.stringify(k)}:${canon(v[k], `${path}.${k}`)}`).join(',') + '}';
  }
  throw new Error(`unserialisable ${typeof v} at ${path}`);
}

const pk = JSON.parse(readFileSync('raw/07-public-key.body.json', 'utf8'));
const keyById = { [pk.key_id]: pk.public_key_pem };
if (pk.previous) keyById[pk.previous.key_id] = pk.previous.public_key_pem;

function verifyConsult(label, file) {
  const body = JSON.parse(readFileSync(file, 'utf8'));
  const signed = body.assessment; // { assessment: <bare L2>, signature, key_id }
  const pem = keyById[signed.key_id];
  if (!pem) return console.log(`${label}: FAIL — unknown key_id ${signed.key_id}`);
  const canonical = canon(signed.assessment);
  const sig = Buffer.from(signed.signature, 'base64');
  const ok = verify(null, Buffer.from(canonical, 'utf8'), createPublicKey(pem), sig);
  console.log(`${label}: key_id=${signed.key_id} sigBytes=${sig.length} canonLen=${canonical.length} -> ${ok ? 'PASS ✓' : 'FAIL ✗'}`);

  // Negative control: tamper one field, expect verification to FAIL.
  const tampered = JSON.parse(JSON.stringify(signed.assessment));
  tampered.katorthoma_proximity = tampered.katorthoma_proximity === 'sage_like' ? 'reflexive' : 'sage_like';
  const okT = verify(null, Buffer.from(canon(tampered), 'utf8'), createPublicKey(pem), sig);
  console.log(`${label} (tampered proximity): -> ${okT ? 'PASS (UNEXPECTED!)' : 'FAIL ✓ (tamper correctly rejected)'}`);
  return ok && !okT;
}

const r1 = verifyConsult('consult-1 (task-adoption)', 'raw/01-consult-task-adoption.body.json');
const r2 = verifyConsult('consult-2 (recommend/loop-closure)', 'raw/02-consult-recommend-decision.body.json');
console.log(`\nOVERALL: ${r1 && r2 ? 'BOTH VERIFIED + tamper rejected' : 'CHECK FAILED'}`);
