import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import ErrorState from '@/components/common/ErrorState';
import PageHeader from '@/components/common/PageHeader';
import { FormSkeleton } from '@/components/common/Skeletons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { catalogEntities } from '@/features/catalog/catalogEntities';
import { catalogServicesByType } from '@/features/catalog/catalogServices';
import { productService } from '@/services/productService';
import { notifyError, notifySuccess } from '@/utils/alerts';
import { normalizeStatus } from '@/utils/status';

const relations = {
  products: productService,
  categories: catalogServicesByType.categories,
  brands: catalogServicesByType.brands,
  variants: catalogServicesByType.variants,
  roles: catalogServicesByType.roles,
  product: productService,
  category: catalogServicesByType.categories,
  brand: catalogServicesByType.brands,
  variant: catalogServicesByType.variants
};
const entityTypeResource = { product: 'products', variant: 'variants', brand: 'brands', category: 'categories' };

function fieldValue(field, value) {
  if (field.type === 'checkbox') return Boolean(value);
  if (field.name === 'status') return normalizeStatus(value);
  if (field.name === 'attributes' && value && typeof value === 'object') return JSON.stringify(value, null, 2);
  if (field.type === 'relation' && value && typeof value === 'object') return value._id;
  return value ?? '';
}

function FieldControl({ field, register, errors, relationItems }) {
  const commonProps = {
    id: field.name,
    'aria-invalid': errors[field.name] ? 'true' : 'false',
    'aria-describedby': errors[field.name] ? `${field.name}-error` : undefined
  };
  let control;
  if (field.type === 'checkbox') {
    control = <input type="checkbox" className="h-4 w-4 rounded accent-primary" {...register(field.name)} />;
  } else if (field.type === 'textarea') {
    control = <Textarea {...commonProps} {...register(field.name)} />;
  } else if (field.type === 'select' || field.type === 'relation') {
    control = (
      <Select {...commonProps} {...register(field.name)}>
        <option value="">Selecciona…</option>
        {(field.options || relationItems).map((option) => (
          <option
            key={typeof option === 'string' ? option : option.value || option._id}
            value={typeof option === 'string' ? option : option.value || option._id}
          >
            {typeof option === 'string' ? option : option.label || option.name || option.title || option.slug || option.sku || option._id}
          </option>
        ))}
      </Select>
    );
  } else {
    control = <Input {...commonProps} type={field.type || 'text'} step={field.type === 'number' ? 'any' : undefined} {...register(field.name)} />;
  }

  return (
    <div className={field.type === 'checkbox' ? 'flex items-center gap-3' : ''}>
      <Label htmlFor={field.name} className={field.type === 'checkbox' ? 'order-1' : 'mb-2 block'}>
        {field.label}
      </Label>
      {control}
      {errors[field.name] && (
        <p id={`${field.name}-error`} role="alert" className="mt-1.5 text-xs font-medium text-destructive">
          {errors[field.name].message}
        </p>
      )}
    </div>
  );
}

export default function CatalogFormPage({ type, useResource }) {
  const entity = catalogEntities[type];
  const service = catalogServicesByType[type];
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const { create, update } = useResource({ autoLoad: false });
  const [loadingRecord, setLoadingRecord] = useState(editing);
  const [loadError, setLoadError] = useState(null);
  const [relationOptions, setRelationOptions] = useState({});
  const defaults = useMemo(() => ({ ...entity.initialValues }), [entity]);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(editing ? entity.updateSchema || entity.schema : entity.schema), defaultValues: defaults });
  const selectedEntityType = watch('entity_type');

  useEffect(() => {
    if (!editing) {
      reset(defaults);
      return undefined;
    }

    let ignore = false;
    setLoadingRecord(true);
    setLoadError(null);
    service
      .getById(id)
      .then((record) => {
        if (ignore) return;
        reset(Object.fromEntries(entity.fields.map((field) => [field.name, fieldValue(field, record[field.name])])));
      })
      .catch(async (err) => {
        if (ignore) return;
        setLoadError(err.message);
        await notifyError(err, `No se pudo cargar ${entity.singular}`);
      })
      .finally(() => {
        if (!ignore) setLoadingRecord(false);
      });

    return () => {
      ignore = true;
    };
  }, [defaults, editing, entity, id, reset, service]);

  useEffect(() => {
    let ignore = false;
    const resourceNames = new Set(
      entity.fields
        .map((field) => (field.resourceFrom ? entityTypeResource[selectedEntityType] : field.resource))
        .filter(Boolean)
    );
    resourceNames.forEach((resource) => {
      if (!relations[resource]) return;
      relations[resource]
        .list()
        .then((items) => {
          if (!ignore) setRelationOptions((current) => ({ ...current, [resource]: items }));
        })
        .catch(async (err) => {
          if (!ignore) await notifyError(err, `No se pudieron cargar las opciones de ${resource}`);
        });
    });
    return () => {
      ignore = true;
    };
  }, [entity, selectedEntityType]);

  const onSubmit = async (values) => {
    const payload = { ...values };
    if (type === 'variants') payload.attributes = JSON.parse(payload.attributes || '{}');
    if (type === 'users' && !payload.password) delete payload.password;
    const result = editing ? await update(id, payload) : await create(payload);
    if (!result) return;
    await notifySuccess(`${entity.singular} ${editing ? 'actualizado' : 'creado'}`);
    navigate(`/${type}`);
  };

  if (loadingRecord) return <FormSkeleton />;
  if (loadError) return <ErrorState title={`No se pudo cargar ${entity.singular}`} message={loadError} onRetry={() => navigate(0)} />;

  return (
    <section className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <PageHeader
        eyebrow={`Gestión de ${entity.label.toLowerCase()}`}
        title={`${editing ? 'Editar' : 'Crear'} ${entity.singular}`}
      />
      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {entity.fields.map((field) => {
            const resource = field.resourceFrom ? entityTypeResource[selectedEntityType] : field.resource;
            return (
              <FieldControl
                key={field.name}
                field={
                  type === 'users' && field.name === 'password' && editing
                    ? { ...field, label: 'Nueva contraseña (opcional)' }
                    : field
                }
                register={register}
                errors={errors}
                relationItems={relationOptions[resource] || []}
              />
            );
          })}
          <div className="flex justify-end gap-2 border-t pt-5">
            <Button type="button" variant="outline" onClick={() => navigate(`/${type}`)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando…' : editing ? 'Guardar cambios' : `Crear ${entity.singular}`}
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
}
