import { RiCustomerService2Line } from '@remixicon/react';
import ComingSoon from '@/components/coming-soon';

export default function ServiceRequestPage() {
  return (
    <ComingSoon
      icon={RiCustomerService2Line}
      title="Service Request"
      subtitle="Internal support tickets"
      breadcrumbs={[{ label: 'Connect Us' }, { label: 'Service Request' }]}
    />
  );
}
