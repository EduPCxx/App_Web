import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEdit2, FiEye, FiPlus, FiTrash2 } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import ActiveBadge from '@/components/common/ActiveBadge';
import DataTable from '@/components/common/DataTable';
import ErrorState from '@/components/common/ErrorState';
import { TableSkeleton } from '@/components/common/Skeletons';
import useProducts from '@/hooks/useProducts';
import { confirmAction, notifySuccess } from '@/utils/alerts';
import { formatPrice, formatSubtitle, isProductActive } from '@/utils/format';

export default function ProductsListPage() {
  const navigate = useNavigate();
  const { products, loading, error, loadProducts, setProductActive, removeProduct } = useProducts();

  const handleToggle = async (product) => {
    const active = isProductActive(product);
    const confirmed = await confirmAction({
      title: active ? '¿Desactivar producto?' : '¿Activar producto?',
      text: product.name,
      confirmButtonText: active ? 'Desactivar' : 'Activar'
    });
    if (confirmed && (await setProductActive(product.slug, !active))) {
      notifySuccess(active ? 'Producto desactivado' : 'Producto activado');
    }
  };

  const handleDelete = async (product) => {
    const confirmed = await confirmAction({
      title: '¿Eliminar producto?',
      text: `“${product.name}” dejará de mostrarse (borrado lógico).`,
      confirmButtonText: 'Eliminar'
    });
    if (confirmed && (await removeProduct(product.slug))) notifySuccess('Producto eliminado');
  };

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Nombre',
        render: (row) => (
          <div>
            <Link to={`/products/${row.slug}`} className="font-semibold hover:text-primary hover:underline">
              {row.name}
            </Link>
            <p className="text-xs text-muted-foreground">{row.slug}</p>
          </div>
        )
      },
      { key: 'category', header: 'Categoría' },
      { key: 'subtitle', header: 'Equipo · Marca', render: (row) => formatSubtitle(row) },
      { key: 'price', header: 'Precio', cellClassName: 'tabular-nums', render: (row) => formatPrice(row.price) },
      {
        key: 'stock',
        header: 'Stock',
        cellClassName: 'tabular-nums',
        render: (row) => (row.stock > 0 ? row.stock : <span className="font-semibold text-destructive">Agotado</span>)
      },
      { key: 'isActive', header: 'Activo', render: (row) => <ActiveBadge active={isProductActive(row)} /> },
      {
        key: 'actions',
        header: 'Acciones',
        render: (row) => (
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" aria-label={`Ver ${row.name}`} title="Ver" onClick={() => navigate(`/products/${row.slug}`)}>
              <FiEye size={14} aria-hidden="true" />
            </Button>
            <Button size="icon" variant="outline" aria-label={`Editar ${row.name}`} title="Editar" onClick={() => navigate(`/products/${row.slug}/edit`)}>
              <FiEdit2 size={14} aria-hidden="true" />
            </Button>
            <Button size="sm" variant="secondary" onClick={() => handleToggle(row)}>
              {isProductActive(row) ? 'Desactivar' : 'Activar'}
            </Button>
            <Button size="icon" variant="destructive" aria-label={`Eliminar ${row.name}`} title="Eliminar" onClick={() => handleDelete(row)}>
              <FiTrash2 size={14} aria-hidden="true" />
            </Button>
          </div>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate, setProductActive, removeProduct]
  );

  let content;
  if (loading && products.length === 0) {
    content = <TableSkeleton rows={6} columns={6} />;
  } else if (error && products.length === 0) {
    content = <ErrorState title="No se pudieron cargar los productos" message={error} onRetry={() => loadProducts({ force: true })} />;
  } else {
    content = <DataTable caption="Listado de productos" columns={columns} data={products} emptyMessage="No hay productos creados." />;
  }

  return (
    <section className="min-h-screen space-y-5 bg-transparent px-4 py-4 sm:px-5 lg:px-7 lg:py-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-200/65">Catálogo</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-100">Productos</h1>
          <p className="mt-1 text-xs text-slate-400">Administra el catálogo de tu tienda.</p>
        </div>
        <Button asChild size="lg">
          <Link to="/products/new">
            <FiPlus aria-hidden="true" /> Crear producto
          </Link>
        </Button>
      </header>
      <div className="overflow-hidden rounded-3xl border border-white/[0.09] bg-[#1b1b1d]/90 p-3 shadow-[0_24px_70px_-46px_rgba(0,0,0,0.72)] sm:p-5">
        {content}
      </div>
    </section>
  );
}
