import Link from 'next/link';
import * as Pagination from '@/components/ui/pagination';
import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react';

export type PaginationLinksProps = {
  page: number;
  totalPages: number;
  basePath: string;
  query?: Record<string, string | undefined>;
  maxVisible?: number;
};

function buildHref(
  basePath: string,
  query: Record<string, string | undefined>,
  page: number,
): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v) params.set(k, v);
  }
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function visiblePages(current: number, total: number, max: number): (number | 'ellipsis')[] {
  if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);
  const result: (number | 'ellipsis')[] = [];
  const side = Math.floor((max - 3) / 2);
  const left = Math.max(2, current - side);
  const right = Math.min(total - 1, current + side);
  result.push(1);
  if (left > 2) result.push('ellipsis');
  for (let i = left; i <= right; i++) result.push(i);
  if (right < total - 1) result.push('ellipsis');
  result.push(total);
  return result;
}

export default function PaginationLinks({
  page,
  totalPages,
  basePath,
  query = {},
  maxVisible = 7,
}: PaginationLinksProps) {
  if (totalPages <= 1) return null;

  const prevHref = buildHref(basePath, query, Math.max(1, page - 1));
  const nextHref = buildHref(basePath, query, Math.min(totalPages, page + 1));
  const items = visiblePages(page, totalPages, maxVisible);

  return (
    <Pagination.Root variant="rounded">
      <Pagination.NavButton asChild>
        <Link href={prevHref} aria-disabled={page === 1} aria-label="Previous page">
          <Pagination.NavIcon as={RiArrowLeftSLine} />
        </Link>
      </Pagination.NavButton>
      {items.map((item, i) =>
        item === 'ellipsis' ? (
          <span key={`e-${i}`} className="px-1 text-text-disabled-300">
            …
          </span>
        ) : (
          <Pagination.Item key={item} current={item === page} asChild>
            <Link href={buildHref(basePath, query, item)}>{item}</Link>
          </Pagination.Item>
        ),
      )}
      <Pagination.NavButton asChild>
        <Link href={nextHref} aria-disabled={page === totalPages} aria-label="Next page">
          <Pagination.NavIcon as={RiArrowRightSLine} />
        </Link>
      </Pagination.NavButton>
    </Pagination.Root>
  );
}
