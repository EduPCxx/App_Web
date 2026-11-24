import { useEffect, useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import { FormSkeleton } from '@/components/common/Skeletons';
import ErrorState from '@/components/common/ErrorState';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiService } from '@/services/apiService';
import { notifyError, notifySuccess } from '@/utils/alerts';

const emptyProfile = {
  full_name: '',
  bio: '',
  avatar_url: '',
  phone: '',
  address: ''
};

export default function ProfilePage() {
  const [form, setForm] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [savedProfile, setSavedProfile] = useState(emptyProfile);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  useEffect(() => {
    setAvatarLoadError(false);
  }, [form.avatar_url]);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiService.get('/profile/me');
      const profile = {
        ...emptyProfile,
        ...(data.data || {})
      };
      setForm(profile);
      setSavedProfile(profile);
    } catch (loadError) {
      setError(loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};
    if (form.full_name.length > 150) nextErrors.full_name = 'Máximo 150 caracteres';
    if (form.bio.length > 500) nextErrors.bio = 'Máximo 500 caracteres';
    if (form.phone.length > 30) nextErrors.phone = 'Máximo 30 caracteres';
    if (form.address.length > 250) nextErrors.address = 'Máximo 250 caracteres';
    if (form.avatar_url) {
      try {
        const url = new URL(form.avatar_url);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
      } catch {
        nextErrors.avatar_url = 'Introduce una URL válida de http o https';
      }
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setFieldErrors({});
    try {
      const payload = {
        full_name: form.full_name.trim(),
        bio: form.bio.trim(),
        avatar_url: form.avatar_url.trim(),
        phone: form.phone.trim(),
        address: form.address.trim()
      };
      const { data } = await apiService.patch('/profile/me', payload);
      const profile = {
        ...emptyProfile,
        ...(data.data || payload)
      };
      setForm(profile);
      setSavedProfile(profile);
      window.dispatchEvent(new CustomEvent('profile:updated', {
        detail: { avatarUrl: profile.avatar_url }
      }));
      await notifySuccess('Perfil actualizado correctamente');
    } catch (saveError) {
      await notifyError(saveError, 'No se pudo guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <FormSkeleton />;

  if (error) {
    return (
      <ErrorState
        title="No se pudo cargar el perfil"
        message={error.message}
        onRetry={loadProfile}
      />
    );
  }

  const displayName = form.full_name || form.user?.name || 'Usuario';
  const accountEmail = form.user?.email || '';

  return (
    <section className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <PageHeader
        eyebrow="Cuenta"
        title="Mi perfil"
        description="Actualiza tus datos personales y preferencias de contacto."
      />

      <Card className="p-6">
        <h2 className="mb-5 text-lg font-semibold">Mis datos</h2>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#181818]">
            {form.avatar_url && !avatarLoadError ? (
              <img
                src={form.avatar_url}
                alt={`Foto de perfil de ${displayName}`}
                className="h-full w-full object-cover"
                onError={() => setAvatarLoadError(true)}
              />
            ) : (
              <span className="text-3xl font-semibold text-[#d8b563]" aria-hidden="true">
                {displayName.trim().charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="break-words text-xl font-semibold">{displayName}</h3>
            {accountEmail && <p className="mt-1 break-all text-sm text-muted-foreground">{accountEmail}</p>}
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Teléfono</dt>
                <dd className="mt-1 break-words">{form.phone || 'Sin indicar'}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Dirección</dt>
                <dd className="mt-1 break-words">{form.address || 'Sin indicar'}</dd>
              </div>
            </dl>
            {avatarLoadError && (
              <p role="status" className="mt-3 text-xs text-muted-foreground">
                No se pudo cargar la foto. Comprueba la URL en el formulario.
              </p>
            )}
          </div>
        </div>
        {form.bio && <p className="mt-5 max-w-prose border-t border-white/10 pt-4 text-sm text-muted-foreground">{form.bio}</p>}
      </Card>

      <Card className="p-6">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <Label htmlFor="full_name" className="mb-2 block">Nombre completo</Label>
              <Input
                id="full_name"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                maxLength={150}
                aria-invalid={Boolean(fieldErrors.full_name)}
                aria-describedby={fieldErrors.full_name ? 'full_name-error' : undefined}
                placeholder="Tu nombre"
              />
              {fieldErrors.full_name && <p id="full_name-error" role="alert" className="mt-1.5 text-xs font-medium text-destructive">{fieldErrors.full_name}</p>}
            </div>

            <div>
              <Label htmlFor="phone" className="mb-2 block">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                maxLength={30}
                aria-invalid={Boolean(fieldErrors.phone)}
                aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
                placeholder="+34 600 000 000"
              />
              {fieldErrors.phone && <p id="phone-error" role="alert" className="mt-1.5 text-xs font-medium text-destructive">{fieldErrors.phone}</p>}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="avatar_url" className="mb-2 block">URL del avatar</Label>
              <Input
                id="avatar_url"
                name="avatar_url"
                type="url"
                value={form.avatar_url}
                onChange={handleChange}
                aria-invalid={Boolean(fieldErrors.avatar_url)}
                aria-describedby={fieldErrors.avatar_url ? 'avatar_url-error' : undefined}
                placeholder="https://example.com/avatar.jpg"
              />
              {fieldErrors.avatar_url && <p id="avatar_url-error" role="alert" className="mt-1.5 text-xs font-medium text-destructive">{fieldErrors.avatar_url}</p>}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address" className="mb-2 block">Dirección</Label>
              <Input
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                maxLength={250}
                aria-invalid={Boolean(fieldErrors.address)}
                aria-describedby={fieldErrors.address ? 'address-error' : undefined}
                placeholder="Calle, número, ciudad"
              />
              {fieldErrors.address && <p id="address-error" role="alert" className="mt-1.5 text-xs font-medium text-destructive">{fieldErrors.address}</p>}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="bio" className="mb-2 block">Biografía</Label>
              <Textarea
                id="bio"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                maxLength={500}
                aria-invalid={Boolean(fieldErrors.bio)}
                aria-describedby={fieldErrors.bio ? 'bio-error' : 'bio-count'}
                placeholder="Cuéntanos algo sobre ti"
              />
              <div className="flex justify-between gap-3">
                {fieldErrors.bio
                  ? <p id="bio-error" role="alert" className="mt-1.5 text-xs font-medium text-destructive">{fieldErrors.bio}</p>
                  : <span />}
                <p id="bio-count" className="mt-1.5 text-xs text-muted-foreground">{form.bio.length}/500</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setForm(savedProfile);
                setFieldErrors({});
              }}
            >
              Restablecer
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
}
