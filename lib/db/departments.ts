import 'server-only';
import { many, one } from '@/lib/db';

export type DepartmentRow = {
  id: string;
  name: string;
  is_active: boolean;
  user_count: number;
};

export async function listDepartments(orgId: string) {
  return many<DepartmentRow>(
    `select d.id, d.name, d.is_active,
       (select count(*)::int from users u where u.department_id = d.id) as user_count
     from departments d where d.org_id = $1 order by d.name`,
    [orgId],
  );
}

export type DesignationRow = {
  id: string;
  name: string;
  is_active: boolean;
  user_count: number;
};

export async function listDesignations(orgId: string) {
  return many<DesignationRow>(
    `select d.id, d.name, d.is_active,
       (select count(*)::int from users u where u.designation_id = d.id) as user_count
     from designations d where d.org_id = $1 order by d.name`,
    [orgId],
  );
}
