import { RiRouteLine } from '@remixicon/react';
import ComingSoon from '@/components/coming-soon';

export default function RoutesPage() {
  return (
    <ComingSoon
      icon={RiRouteLine}
      title="Routes"
      subtitle="Origin → destination routes with TAT"
      breadcrumbs={[{ label: 'Master', href: '/master/commodities' }, { label: 'Routes' }]}
      description="Per-client TAT (turn-around-time) per route. The underlying tat_routes table exists in DB; UI is planned."
    />
  );
}
