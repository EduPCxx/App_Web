import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Loading from '../components/Loading';
import ProductForm from '../components/ProductForm';
import useProduct from '../hooks/useProduct';
import useProducts from '../hooks/useProducts';

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { product, loading, error } = useProduct(id);
  const { updateProduct } = useProducts();
  const [saveError, setSaveError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function update(form) {
    setSubmitting(true);
    setSaveError('');
    try {
      await updateProduct(id, form);
      navigate(`/products/${id}`);
    } catch (err) {
      setSaveError(err.message);
      setSubmitting(false);
    }
  }

  if (loading) return <Loading />;
  if (error) return <div className="alert error">{error}<Link to="/products">Volver</Link></div>;

  return (
    <section>
      <Link className="back-link" to={`/products/${id}`}>← Volver al detalle</Link>
      <div className="page-header compact">
        <div>
          <p className="eyebrow">EDITAR</p>
          <h1>Editar producto</h1>
          <p className="muted">Actualiza los datos y guarda los cambios.</p>
        </div>
      </div>
      {saveError && <div className="alert error">{saveError}</div>}
      <ProductForm initialValues={product} onSubmit={update} submitLabel="Guardar cambios" submitting={submitting} />
    </section>
  );
}
