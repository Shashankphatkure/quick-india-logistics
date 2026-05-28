import { RiFlagLine } from '@remixicon/react';
import ComingSoon from '@/components/coming-soon';

export default function ConnectUsReportPage() {
  return (
    <ComingSoon
      icon={RiFlagLine}
      title="Report an Issue"
      subtitle="Report bugs or issues to the software team"
      breadcrumbs={[{ label: 'Connect Us' }, { label: 'Report' }]}
    />
  );
}
