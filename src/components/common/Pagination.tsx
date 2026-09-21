import "./Pagination.css";

type PaginationProps = { count: number; page: number; pageSize: number; label: string; onChange: (page: number) => void };

export default function Pagination({ count, page, pageSize, label, onChange }: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(count / pageSize));
  const currentPage = Math.min(page, pageCount);
  const first = count ? (currentPage - 1) * pageSize + 1 : 0;
  const last = Math.min(currentPage * pageSize, count);
  return <div className="list-pagination"><span>Showing {first} to {last} of {count} {label}</span><div className="pagination-controls"><button type="button" onClick={() => onChange(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page">‹</button>{Array.from({ length: Math.min(pageCount, 5) }, (_, index) => index + 1).map((number) => <button type="button" key={number} className={number === currentPage ? "current" : ""} onClick={() => onChange(number)}>{number}</button>)}<button type="button" onClick={() => onChange(currentPage + 1)} disabled={currentPage === pageCount} aria-label="Next page">›</button></div></div>;
}
