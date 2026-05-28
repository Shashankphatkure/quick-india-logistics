import { RiMoneyRupeeCircleLine } from '@remixicon/react';
import ComingSoon from '@/components/coming-soon';

export default function ChargesPage() {
  return (
    <ComingSoon
      icon={RiMoneyRupeeCircleLine}
      title="Charges"
      subtitle="Tariff and surcharge master"
      breadcrumbs={[{ label: 'Master', href: '/master/commodities' }, { label: 'Charges' }]}
      description="Charge codes (fuel surcharge, handling, COD fee, etc.). Currently charges are captured per order in the Tariff step of Add Order."
    />
  );
}
