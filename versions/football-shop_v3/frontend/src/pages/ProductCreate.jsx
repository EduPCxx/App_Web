import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import useProducts from '../hooks/useProducts';

export default function ProductCreate() {
  const navigate = useNavigate();
  const { createProduct } = useProducts();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function create(form) {
    setSubmitting(true);
    setError('');
    try {
      const created = await createProduct(form);
      navigate(`/products/${created._id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <section>
      <Link className="back-link" to="/products">← Volver</Link>
      <div className="page-header compact">
        <div>
          <p className="eyebrow">NUEVO</p>
          <h1>Crear producto</h1>
          <p className="muted">Añade un producto al catálogo.</p>
        </div>
      </div>
      {error && <div className="alert error">{error}</div>}
      <ProductForm onSubmit={create} submitLabel="Crear producto" submitting={submitting} />
    </section>
  );
}
