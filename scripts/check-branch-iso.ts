import { config } from 'dotenv';
config({ path: '.env.local' });
import { Pool } from 'pg';
const url = process.env.DATABASE_URL!;
const ORG = '00000000-0000-0000-0000-000000000001';
const p = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });

const BRANCH = `($2::uuid[] is null or o.current_branch_id = any($2) or o.origin_branch_id = any($2) or o.destination_branch_id = any($2))`;

(async () => {
  // Org-wide (super_admin: branchIds = null)
  const all = await p.query(`select count(*)::int n from orders o where o.org_id=$1 and ${BRANCH}`, [ORG, null]);

  // emp1's assigned branches
  const emp = await p.query(`select id from users where lower(username)='emp1' and org_id=$1`, [ORG]);
  const empId = emp.rows[0]?.id;
  const ub = await p.query(`select branch_id from user_branches where user_id=$1`, [empId]);
  let branchIds = ub.rows.map(r => r.branch_id);
  if (branchIds.length === 0) {
    // fall back to home_branch_id like session would (session.branchIds comes from user_branches; if empty, [] => sees nothing)
    const hb = await p.query(`select home_branch_id from users where id=$1`, [empId]);
    console.log('emp1 has NO user_branches rows; home_branch=', hb.rows[0]?.home_branch_id);
  }
  const scoped = await p.query(`select count(*)::int n from orders o where o.org_id=$1 and ${BRANCH}`, [ORG, branchIds]);

  // Per-branch breakdown for context
  const bd = await p.query(
    `select b.code, count(*)::int n from orders o join branches b on b.id=o.current_branch_id where o.org_id=$1 group by b.code order by n desc`,
    [ORG],
  );

  console.log('Org-wide orders (super_admin sees):', all.rows[0].n);
  console.log('emp1 branchIds:', branchIds);
  console.log('emp1-scoped orders (employee sees):', scoped.rows[0].n);
  console.log('By current_branch:', JSON.stringify(bd.rows));
  console.log(scoped.rows[0].n < all.rows[0].n ? 'PASS: employee sees a strict subset' : 'CHECK: counts equal (emp may be assigned all branches or data uniform)');
  await p.end();
})();
