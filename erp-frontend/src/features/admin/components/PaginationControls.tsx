interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  const from = totalItems === 0 ? 0 : currentPage * pageSize + 1;
  const to = Math.min((currentPage + 1) * pageSize, totalItems);

  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
      <div className="d-flex align-items-center gap-2">
        <span className="text-muted small">
          Showing {from}–{to} of {totalItems}
        </span>
        <select
          className="form-select form-select-sm"
          style={{ width: 'auto' }}
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {[5, 10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
      </div>
      <nav aria-label="Pagination">
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => onPageChange(0)} disabled={currentPage === 0}>
              First
            </button>
          </li>
          <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              Prev
            </button>
          </li>
          <li className="page-item disabled">
            <span className="page-link">
              {currentPage + 1} / {Math.max(totalPages, 1)}
            </span>
          </li>
          <li className={`page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              Next
            </button>
          </li>
          <li className={`page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
            >
              Last
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
