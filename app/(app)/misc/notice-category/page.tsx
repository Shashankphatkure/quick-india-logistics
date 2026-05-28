import { RiNotification3Line } from '@remixicon/react';
import ComingSoon from '@/components/coming-soon';

export default function NoticeCategoryPage() {
  return (
    <ComingSoon
      icon={RiNotification3Line}
      title="Notice Category"
      subtitle="System notice and alert categories"
      breadcrumbs={[{ label: 'Miscellaneous' }, { label: 'Notice Category' }]}
    />
  );
}
