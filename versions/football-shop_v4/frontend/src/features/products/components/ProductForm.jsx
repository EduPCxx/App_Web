import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CATEGORIES, EMPTY_PRODUCT, productSchema } from '@/features/products/productSchema';

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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(productSchema), defaultValues: initialValues });

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
          <Field id="category" label="Categoría" error={errors.category?.message}>
            <Select {...field('category')}>
              <option value="">Selecciona…</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="team" label="Equipo" error={errors.team?.message}>
            <Input {...field('team')} placeholder="N/A si no aplica" />
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="brand" label="Marca" error={errors.brand?.message}>
            <Input {...field('brand')} placeholder="Nike" />
          </Field>
          <Field id="size" label="Talla / tamaño" error={errors.size?.message}>
            <Input {...field('size')} placeholder="M, 42, Talla 5…" />
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="price" label="Precio (€)" error={errors.price?.message}>
            <Input {...field('price')} type="number" step="0.01" min="0" inputMode="decimal" placeholder="0,00" />
          </Field>
          <Field id="stock" label="Stock" error={errors.stock?.message}>
            <Input {...field('stock')} type="number" step="1" min="0" inputMode="numeric" placeholder="0" />
          </Field>
        </div>

        <Field id="description" label="Descripción" error={errors.description?.message}>
          <Textarea {...field('description')} placeholder="Describe el producto…" />
        </Field>

        <label htmlFor="isActive" className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
          <input id="isActive" type="checkbox" className="h-4 w-4 rounded accent-primary" {...register('isActive')} />
          Producto activo
        </label>

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
