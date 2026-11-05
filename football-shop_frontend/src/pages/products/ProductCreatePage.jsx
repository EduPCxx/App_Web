import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import ProductForm from '@/features/products/components/ProductForm';
import useProducts from '@/hooks/useProducts';
import { notifyError, notifySuccess } from '@/utils/alerts';
import { syncProductImages } from '@/features/products/productImages';

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const { createProduct } = useProducts();

  const handleSubmit = async (values, images) => {
    const created = await createProduct(values);
    if (!created) return; // el error ya se ha mostrado con SweetAlert2
    try {
      await syncProductImages(created._id, [], images);
    } catch (error) {
      await notifyError(error, 'El producto se guardó, pero no se pudieron guardar sus imágenes');
      navigate(`/products/${created._id}/edit`);
      return;
    }
    notifySuccess('Producto creado');
    navigate('/products');
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <PageHeader eyebrow="Gestión de productos" title="Crear producto" description="Rellena los datos del artículo." />
      <ProductForm onSubmit={handleSubmit} submitLabel="Crear producto" />
    </section>
  );
}
