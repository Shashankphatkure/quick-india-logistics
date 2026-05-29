import { config } from 'dotenv'; config({ path: '.env.local' });
import { Pool } from 'pg';
const p=new Pool({connectionString:process.env.DATABASE_URL!,ssl:{rejectUnauthorized:false}});
(async()=>{const r=await p.query("select manifest_no from manifests where org_id='00000000-0000-0000-0000-000000000001' order by created_at desc limit 1");console.log('MAN '+(r.rows[0]?.manifest_no||'none'));await p.end();})();
