import { useNavigate, useParams } from 'react-router-dom';
import ErrorState from '@/components/common/ErrorState';
import PageHeader from '@/components/common/PageHeader';
import { FormSkeleton } from '@/components/common/Skeletons';
import ProductForm from '@/features/products/components/ProductForm';
import { toFormValues } from '@/features/products/productSchema';
import useProduct from '@/hooks/useProduct';
import useProducts from '@/hooks/useProducts';
import NotFoundPage from '@/pages/NotFoundPage';
import { notifySuccess } from '@/utils/alerts';

export default function ProductEditPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { product, loading, error, notFound, retry } = useProduct(slug);
  const { updateProduct } = useProducts();

  const handleSubmit = async (values) => {
    const updated = await updateProduct(slug, values);
    if (!updated) return; // el error ya se ha mostrado con SweetAlert2
    notifySuccess('Producto actualizado');
    // Si cambia el nombre, el backend genera un slug nuevo
    navigate(`/products/${updated.slug}`);
  };

  if (loading) return <FormSkeleton />;
  if (notFound) return <NotFoundPage title="Producto no encontrado" description="No existe o ya ha sido eliminado." />;
  if (error) return <ErrorState title="No se pudo cargar el producto" message={error} onRetry={retry} />;

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <PageHeader eyebrow="Gestión de productos" title="Editar producto" description={product.name} />
      <ProductForm
        key={product._id}
        initialValues={toFormValues(product)}
        onSubmit={handleSubmit}
        submitLabel="Guardar cambios"
        cancelTo={`/products/${product.slug}`}
      />
    </section>
  );
}
