import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { EMPTY_PRODUCT, productSchema } from '@/features/products/productSchema';
import { brandService } from '@/services/brandService';
import { categoryService } from '@/services/categoryService';
import { notifyError } from '@/utils/alerts';

function Field({ id, label, error, className, children }) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-2 block">
        {label}
      </Label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

// Formulario controlado por react-hook-form + Zod. `onSubmit` debe devolver una promesa:
// así `isSubmitting` deshabilita el botón mientras se guarda.
export default function ProductForm({ initialValues = EMPTY_PRODUCT, onSubmit, submitLabel = 'Guardar', cancelTo = '/products' }) {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loadingRelations, setLoadingRelations] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(productSchema), defaultValues: initialValues });

  useEffect(() => {
    let ignore = false;
    Promise.all([categoryService.list(), brandService.list()])
      .then(([categoryItems, brandItems]) => {
        if (ignore) return;
        setCategories(categoryItems);
        setBrands(brandItems);
      })
      .catch(async (error) => {
        if (!ignore) await notifyError(error, 'No se pudieron cargar categorías y marcas');
      })
      .finally(() => {
        if (!ignore) setLoadingRelations(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const field = (name) => ({
    id: name,
    'aria-invalid': errors[name] ? 'true' : 'false',
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
    ...register(name)
  });

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <Field id="name" label="Nombre" error={errors.name?.message}>
          <Input {...field('name')} placeholder="Camiseta Oficial 1ª Equipación" autoComplete="off" />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="category_id" label="Categoría" error={errors.category_id?.message}>
            <Select {...field('category_id')} disabled={loadingRelations}>
              <option value="">Selecciona…</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="brand_id" label="Marca" error={errors.brand_id?.message}>
            <Select {...field('brand_id')} disabled={loadingRelations}>
              <option value="">Selecciona…</option>
              {brands.map((brand) => (
                <option key={brand._id} value={brand._id}>
                  {brand.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="status" label="Estado" error={errors.status?.message}>
            <Select {...field('status')}>
              <option value="draft">Borrador</option>
              <option value="active">Activo</option>
              <option value="archived">Archivado</option>
            </Select>
          </Field>
          <label htmlFor="isActive" className="flex cursor-pointer items-center gap-3 self-end text-sm font-semibold">
            <input id="isActive" type="checkbox" className="h-4 w-4 rounded accent-primary" {...register('isActive')} />
            Producto activo
          </label>
        </div>

        <Field id="description" label="Descripción" error={errors.description?.message}>
          <Textarea {...field('description')} placeholder="Describe el producto…" />
        </Field>

        <div className="flex justify-end gap-2 border-t pt-6">
          <Button asChild variant="outline">
            <Link to={cancelTo}>Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
}
