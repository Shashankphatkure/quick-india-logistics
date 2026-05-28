import { RiCompass3Line } from '@remixicon/react';
import ComingSoon from '@/components/coming-soon';

export default function DocketMovementPage() {
  return (
    <ComingSoon
      icon={RiCompass3Line}
      title="Docket Movement Enquiry"
      subtitle="Public-style tracking lookup by docket number"
      breadcrumbs={[{ label: 'Enquiry' }, { label: 'Docket Movement' }]}
      description="A search-by-docket-no page that shows the full status timeline. For now you can view this on each order's detail page."
    />
  );
}
