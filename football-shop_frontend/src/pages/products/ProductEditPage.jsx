import { useNavigate, useParams } from 'react-router-dom';
import ErrorState from '@/components/common/ErrorState';
import PageHeader from '@/components/common/PageHeader';
import { FormSkeleton } from '@/components/common/Skeletons';
import ProductForm from '@/features/products/components/ProductForm';
import { toFormValues } from '@/features/products/productSchema';
import useProduct from '@/hooks/useProduct';
import useProducts from '@/hooks/useProducts';
import NotFoundPage from '@/pages/NotFoundPage';
import { notifyError, notifySuccess } from '@/utils/alerts';
import { syncProductImages } from '@/features/products/productImages';

export default function ProductEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { product, loading, error, notFound, retry } = useProduct(id);
  const { updateProduct } = useProducts();

  const handleSubmit = async (values, images) => {
    const updated = await updateProduct(id, values);
    if (!updated) return; // el error ya se ha mostrado con SweetAlert2
    try {
      await syncProductImages(id, product.images || [], images);
    } catch (imageError) {
      await notifyError(imageError, 'El producto se guardó, pero no se pudieron actualizar sus imágenes');
      return;
    }
    notifySuccess('Producto actualizado');
    navigate('/products');
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
        cancelTo="/products"
      />
    </section>
  );
}
