import { useState } from 'react';
import { CATEGORIES, EMPTY_PRODUCT } from '../models/product';
import { productService } from '../services/productService';

function Field({ label, error, wide, children }) {
  return (
    <label className={wide ? 'full-width' : undefined}>
      <span>{label}</span>
      {children}
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}

export default function ProductForm({ initialValues = EMPTY_PRODUCT, onSubmit, submitLabel = 'Guardar', submitting = false }) {
  const [form, setForm] = useState({ ...EMPTY_PRODUCT, ...initialValues });
  const [errors, setErrors] = useState({});

  function change(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  }

  function submit(event) {
    event.preventDefault();
    const found = productService.validate(form);
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(form);
  }

  return (
    <form className="card form-card" onSubmit={submit} noValidate>
      <div className="form-grid">
        <Field label="Nombre *" error={errors.name} wide>
          <input name="name" value={form.name} onChange={change} maxLength={150} placeholder="Camiseta Oficial 1ª Equipación" />
        </Field>
        <Field label="Categoría *" error={errors.category}>
          <select name="category" value={form.category} onChange={change}>
            <option value="">Selecciona…</option>
            {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </Field>
        <Field label="Equipo *" error={errors.team}>
          <input name="team" value={form.team} onChange={change} placeholder="FC Barcelona (o N/A)" />
        </Field>
        <Field label="Marca *" error={errors.brand}>
          <input name="brand" value={form.brand} onChange={change} placeholder="Nike" />
        </Field>
        <Field label="Talla / tamaño *" error={errors.size}>
          <input name="size" value={form.size} onChange={change} placeholder="M, XL, Talla 5…" />
        </Field>
        <Field label="Precio (€) *" error={errors.price}>
          <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={change} placeholder="99.95" />
        </Field>
        <Field label="Stock *" error={errors.stock}>
          <input name="stock" type="number" min="0" step="1" value={form.stock} onChange={change} placeholder="25" />
        </Field>
        <Field label="Descripción *" error={errors.description} wide>
          <textarea name="description" value={form.description} onChange={change} maxLength={1000} rows="5" placeholder="Describe el producto…" />
          <small className="counter">{form.description.length}/1000</small>
        </Field>
      </div>
      <div className="form-actions">
        <button className="button" disabled={submitting}>{submitting ? 'Guardando…' : submitLabel}</button>
      </div>
    </form>
  );
}
