import { cn } from '@/utils/cn';

// Tabla reutilizable. columns: [{ key, header, render?(row), headerClassName?, cellClassName? }]
export default function DataTable({ columns, data, rowKey = '_id', emptyMessage = 'No hay datos.', caption }) {
  if (!data.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-10 text-center text-sm font-medium text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className="bg-muted/70">
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" className={cn('px-4 py-3 text-left font-semibold', column.headerClassName)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row[rowKey]} className="border-t border-border bg-card/70 transition-colors hover:bg-muted/30">
                {columns.map((column) => (
                  <td key={column.key} className={cn('px-4 py-3 align-middle', column.cellClassName)}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
