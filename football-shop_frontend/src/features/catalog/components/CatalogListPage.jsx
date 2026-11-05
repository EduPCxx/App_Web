import { Link } from 'react-router-dom';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import DataTable from '@/components/common/DataTable';
import ErrorState from '@/components/common/ErrorState';
import { TableSkeleton } from '@/components/common/Skeletons';
import { Button } from '@/components/ui/button';
import { catalogEntities } from '@/features/catalog/catalogEntities';
import { confirmAction, notifySuccess } from '@/utils/alerts';

export default function CatalogListPage({ type, useResource }) {
  const entity = catalogEntities[type];
  const { items, loading, error, load, remove } = useResource();

  const handleDelete = async (item) => {
    const confirmed = await confirmAction({
      title: `¿Eliminar ${entity.singular}?`,
      text: item.name || item.url || item.sku || item._id,
      confirmButtonText: 'Eliminar'
    });
    if (confirmed && (await remove(item._id))) notifySuccess(`${entity.singular} eliminado`);
  };

  const columns = [
    {
      key: 'name',
      header: 'Nombre',
      render: (item) => item.name || item.title || item.url || item.sku || item._id
    },
    {
      key: 'status',
      header: 'Estado',
      render: (item) => (item.isActive === false ? 'Inactivo' : item.status || 'Activo')
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Button asChild size="icon" variant="outline" aria-label={`Editar ${entity.singular}`}>
            <Link to={`/${type}/${item._id}/edit`}>
              <FiEdit2 aria-hidden="true" />
            </Link>
          </Button>
          <Button
            size="icon"
            variant="destructive"
            aria-label={`Eliminar ${entity.singular}`}
            onClick={() => handleDelete(item)}
          >
            <FiTrash2 aria-hidden="true" />
          </Button>
        </div>
      )
    }
  ];

  let content;
  if (loading && !items.length) content = <TableSkeleton rows={5} columns={3} />;
  else if (error && !items.length) content = <ErrorState title={`No se pudieron cargar ${entity.label.toLowerCase()}`} message={error} onRetry={load} />;
  else content = <DataTable caption={entity.label} columns={columns} data={items} emptyMessage={`No hay ${entity.label.toLowerCase()} todavía.`} />;

  return (
    <section className="space-y-5 px-4 py-4 sm:px-5 lg:px-7 lg:py-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-200/65">Gestión del catálogo</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-100">{entity.label}</h1>
        </div>
        <Button asChild>
          <Link to={`/${type}/new`}>
            <FiPlus aria-hidden="true" /> Crear {entity.singular}
          </Link>
        </Button>
      </header>
      <div className="overflow-hidden rounded-3xl border border-white/[0.09] bg-[#1b1b1d]/90 p-3 sm:p-5">{content}</div>
    </section>
  );
}
