import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import ActiveBadge from '@/components/common/ActiveBadge';
import ErrorState from '@/components/common/ErrorState';
import { DetailSkeleton } from '@/components/common/Skeletons';
import useProduct from '@/hooks/useProduct';
import useProducts from '@/hooks/useProducts';
import NotFoundPage from '@/pages/NotFoundPage';
import { confirmAction, notifySuccess } from '@/utils/alerts';
import { formatDate, formatPrice, formatSubtitle, isProductActive } from '@/utils/format';

function Detail({ label, children }) {
  return (
    <div className="rounded-xl bg-muted/70 p-4">
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-semibold">{children}</dd>
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { product, loading, error, notFound, retry } = useProduct(slug);
  const { setProductActive, removeProduct } = useProducts();

  const handleToggle = async () => {
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

  const handleDelete = async () => {
    const confirmed = await confirmAction({
      title: '¿Eliminar este producto?',
      text: `“${product.name}” dejará de mostrarse (borrado lógico).`,
      confirmButtonText: 'Eliminar'
    });
    if (confirmed && (await removeProduct(product.slug))) {
      notifySuccess('Producto eliminado');
      navigate('/products', { replace: true });
    }
  };

  if (loading) return <DetailSkeleton />;
  if (notFound) return <NotFoundPage title="Producto no encontrado" description="No existe o ya ha sido eliminado." />;
  if (error) return <ErrorState title="No se pudo cargar el producto" message={error} onRetry={retry} />;

  const active = isProductActive(product);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          <FiArrowLeft aria-hidden="true" /> Volver al listado
        </Link>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to={`/products/${product.slug}/edit`}>
              <FiEdit2 aria-hidden="true" /> Editar
            </Link>
          </Button>
          <Button variant="secondary" onClick={handleToggle}>
            {active ? 'Desactivar' : 'Activar'}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <FiTrash2 aria-hidden="true" /> Eliminar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{product.category}</Badge>
            <ActiveBadge active={active} />
            {product.stock === 0 && <Badge variant="destructive">Agotado</Badge>}
          </div>
          <h2 className="text-3xl font-bold tracking-tight">{product.name}</h2>
          <p className="text-muted-foreground">{formatSubtitle(product)}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-3xl font-bold tabular-nums">{formatPrice(product.price)}</p>

          <div>
            <h3 className="mb-2 text-sm font-bold">Descripción</h3>
            <p className="max-w-2xl leading-relaxed text-muted-foreground">{product.description}</p>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            <Detail label="Talla / tamaño">{product.size}</Detail>
            <Detail label="Stock">{product.stock}</Detail>
            <Detail label="Slug">{product.slug}</Detail>
            <Detail label="Equipo">{product.team}</Detail>
            <Detail label="Creado">{formatDate(product.createdAt)}</Detail>
            <Detail label="Última actualización">{formatDate(product.updatedAt)}</Detail>
          </dl>
        </CardContent>
      </Card>
    </section>
  );
}
