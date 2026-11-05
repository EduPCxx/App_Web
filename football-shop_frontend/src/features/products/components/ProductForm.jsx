import { useEffect, useState } from 'react';
import { FiArrowDown, FiArrowUp, FiTrash2 } from 'react-icons/fi';
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
  const [images, setImages] = useState(() => initialValues.images || []);
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrlError, setImageUrlError] = useState('');
  const [imageLoadErrors, setImageLoadErrors] = useState({});
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

  const addImage = () => {
    let parsedUrl;
    try {
      parsedUrl = new URL(imageUrl.trim());
    } catch {
      setImageUrlError('Introduce una URL válida para la imagen.');
      return;
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      setImageUrlError('La URL de la imagen debe comenzar por http:// o https://.');
      return;
    }

    setImageUrlError('');
    setImages((current) => [
      ...current,
      {
        clientId: crypto.randomUUID(),
        url: parsedUrl.href,
        alt_text: '',
        sort_order: current.length,
        is_primary: current.length === 0
      }
    ]);
    setImageUrl('');
  };

  const removeImage = (image) => {
    setImages((current) => {
      const remaining = current.filter((item) => item !== image);
      const needsPrimary = remaining.length > 0 && !remaining.some((item) => item.is_primary);
      return remaining.map((item, sort_order) => ({ ...item, sort_order, is_primary: needsPrimary && sort_order === 0 ? true : item.is_primary }));
    });
  };

  const setPrimary = (selected) => {
    setImages((current) => current.map((image) => ({ ...image, is_primary: image === selected })));
  };

  const moveImage = (image, direction) => {
    setImages((current) => {
      const index = current.indexOf(image);
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const reordered = [...current];
      [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
      return reordered.map((item, sort_order) => ({ ...item, sort_order }));
    });
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit((values) => onSubmit(values, images))} noValidate className="space-y-6">
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
              <option value="pending">Pendiente</option>
              <option value="processing">En proceso</option>
              <option value="published">Publicado</option>
              <option value="finished">Finalizado</option>
              <option value="cancelled">Cancelado</option>
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

        <fieldset className="space-y-4 border-t border-white/10 pt-5">
          <legend className="mb-1 text-sm font-semibold">Imágenes del producto</legend>
          <p className="text-sm text-muted-foreground">Pega la URL de cada imagen para añadirla al producto.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="product-image-url"
              type="url"
              inputMode="url"
              value={imageUrl}
              onChange={(event) => {
                setImageUrl(event.target.value);
                setImageUrlError('');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addImage();
                }
              }}
              aria-label="URL de la imagen"
              aria-invalid={Boolean(imageUrlError)}
              aria-describedby={imageUrlError ? 'product-image-url-error' : undefined}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            <Button type="button" variant="outline" onClick={addImage}>Añadir URL</Button>
          </div>
          {imageUrlError && (
            <p id="product-image-url-error" role="alert" className="text-xs font-medium text-destructive">
              {imageUrlError}
            </p>
          )}
          {images.length > 0 && (
            <ol className="space-y-3">
              {images.map((image, index) => (
                <li key={image._id || image.clientId} className="grid gap-3 rounded-xl border border-white/10 bg-[#181818] p-3 sm:grid-cols-[6rem_1fr_auto]">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg bg-black/30">
                    {imageLoadErrors[image._id || image.clientId] ? (
                      <span role="status" className="px-2 text-center text-xs text-amber-200">
                        No se pudo cargar la imagen
                      </span>
                    ) : (
                      <img
                        src={image.url}
                        alt={image.alt_text || `Imagen ${index + 1} de ${initialValues.name || 'producto'}`}
                        className="h-full w-full object-cover"
                        onError={() => setImageLoadErrors((current) => ({ ...current, [image._id || image.clientId]: true }))}
                        onLoad={() => setImageLoadErrors((current) => {
                          const next = { ...current };
                          delete next[image._id || image.clientId];
                          return next;
                        })}
                      />
                    )}
                  </div>
                  <div className="space-y-3">
                    <p className="break-all text-xs text-muted-foreground">{image.url}</p>
                    <Input
                      aria-label={`Texto alternativo para imagen ${index + 1}`}
                      value={image.alt_text || ''}
                      onChange={(event) => setImages((current) =>
                        current.map((item) => item === image ? { ...item, alt_text: event.target.value } : item)
                      )}
                      placeholder="Texto alternativo"
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="primary-product-image"
                        checked={Boolean(image.is_primary)}
                        onChange={() => setPrimary(image)}
                      />
                      Imagen principal
                    </label>
                  </div>
                  <div className="flex items-start gap-2">
                    <Button type="button" variant="outline" size="icon" aria-label="Mover imagen arriba" onClick={() => moveImage(image, -1)} disabled={index === 0}>
                      <FiArrowUp aria-hidden="true" />
                    </Button>
                    <Button type="button" variant="outline" size="icon" aria-label="Mover imagen abajo" onClick={() => moveImage(image, 1)} disabled={index === images.length - 1}>
                      <FiArrowDown aria-hidden="true" />
                    </Button>
                    <Button type="button" variant="destructive" size="icon" aria-label="Quitar imagen" onClick={() => removeImage(image)}>
                      <FiTrash2 aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </fieldset>

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
