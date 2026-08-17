const RANK = { emerging:0, developing:1, established:2, advanced:3 }
const T = {
  reflexive_to_habitual:    { min:'emerging',    count:1, elev:'developing' },
  habitual_to_deliberate:   { min:'developing',  count:2, elev:'established' },
  deliberate_to_principled: { min:'established', count:3, elev:'advanced' },
  principled_to_sage_like:  { min:'advanced',    count:4, elev:'advanced' },
}
const DIMS = ['passion_reduction','judgement_quality','disposition_stability','oikeiosis_extension']
const LEVELS = ['emerging','developing','established','advanced']

const meetsFloor = (vals,min) => vals.every(l => RANK[l] >= RANK[min])
const meetsElev  = (vals,n,e) => vals.filter(l => RANK[l] >= RANK[e]).length >= n

// enumerate all 4^4 dimension combinations
const all = []
for (const a of LEVELS) for (const b of LEVELS) for (const c of LEVELS) for (const d of LEVELS)
  all.push({passion_reduction:a, judgement_quality:b, disposition_stability:c, oikeiosis_extension:d})

for (const [rung,t] of Object.entries(T)) {
  let beforePass=0, afterPass=0, loosened=0, tightened=0
  for (const lv of all) {
    const before = Object.values(lv)
    const after  = DIMS.filter(d=>d!=='disposition_stability').map(d=>lv[d])
    const B = meetsFloor(before,t.min) && meetsElev(before,t.count,t.elev)
    const A = meetsFloor(after, t.min) && meetsElev(after, t.count,t.elev)
    if(B) beforePass++; if(A) afterPass++
    if(!B && A) loosened++      // newly ALLOWED  = loosening
    if(B && !A) tightened++     // newly BLOCKED  = tightening
  }
  console.log(`${rung.padEnd(26)} pass ${String(beforePass).padStart(3)} -> ${String(afterPass).padStart(3)}  | newly-ALLOWED ${String(loosened).padStart(3)}  newly-BLOCKED ${String(tightened).padStart(3)}`)
}

console.log('\n=== concrete NEWLY-ALLOWED examples (were blocked, now promote) ===')
for (const [rung,t] of Object.entries(T)) {
  let shown=0
  for (const lv of all) {
    const before=Object.values(lv), after=DIMS.filter(d=>d!=='disposition_stability').map(d=>lv[d])
    const B=meetsFloor(before,t.min)&&meetsElev(before,t.count,t.elev)
    const A=meetsFloor(after,t.min)&&meetsElev(after,t.count,t.elev)
    if(!B&&A&&shown<2){ console.log(`  ${rung}\n    ${JSON.stringify(lv)}`); shown++ }
  }
}
