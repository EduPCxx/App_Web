import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import ProductForm from '@/features/products/components/ProductForm';
import useProducts from '@/hooks/useProducts';
import { notifySuccess } from '@/utils/alerts';

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const { createProduct } = useProducts();

  const handleSubmit = async (values) => {
    const created = await createProduct(values);
    if (!created) return; // el error ya se ha mostrado con SweetAlert2
    notifySuccess('Producto creado');
    navigate(`/products/${created.slug}`);
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <PageHeader eyebrow="Gestión de productos" title="Crear producto" description="Rellena los datos del artículo." />
      <ProductForm onSubmit={handleSubmit} submitLabel="Crear producto" />
    </section>
  );
}
