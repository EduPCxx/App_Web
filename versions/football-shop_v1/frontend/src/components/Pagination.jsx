export default function Pagination({ pagination, onChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages } = pagination;

  return (
    <div className="pagination">
      <button className="button button-ghost" disabled={page <= 1} onClick={() => onChange(page - 1)}>← Anterior</button>
      <span>Página {page} de {totalPages}</span>
      <button className="button button-ghost" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Siguiente →</button>
    </div>
  );
}
