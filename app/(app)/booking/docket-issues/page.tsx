import { RiAlertLine } from '@remixicon/react';
import ComingSoon from '@/components/coming-soon';

export default function DocketIssuesPage() {
  return (
    <ComingSoon
      icon={RiAlertLine}
      title="Docket Issues"
      subtitle="Track and resolve docket-level problems"
      breadcrumbs={[{ label: 'Booking', href: '/booking/orders' }, { label: 'Docket Issues' }]}
      description="Operational issue tracking on orders. Currently you can update order status from the order detail page; a dedicated issue queue is planned."
    />
  );
}
