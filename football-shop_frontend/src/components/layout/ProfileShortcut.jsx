import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/apiService';

export default function ProfileShortcut() {
  const { token, user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [imageFailed, setImageFailed] = useState(false);
  const [loadError, setLoadError] = useState('');
  const initial = (user?.name || user?.email || 'Usuario').charAt(0).toUpperCase();

  useEffect(() => {
    let active = true;
    setAvatarUrl(user?.avatar_url || '');
    setImageFailed(false);
    setLoadError('');

    if (user?.avatar_url || !token) {
      return () => {
        active = false;
      };
    }

    apiService
      .get('/profile/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        if (active) setAvatarUrl(data.data?.avatar_url || '');
      })
      .catch((error) => {
        if (active) setLoadError(error.message || 'No se pudo cargar la foto del perfil');
      });

    return () => {
      active = false;
    };
  }, [token, user?.avatar_url]);

  useEffect(() => {
    const handleProfileUpdated = (event) => {
      setAvatarUrl(event.detail?.avatarUrl || '');
      setImageFailed(false);
      setLoadError('');
    };
    window.addEventListener('profile:updated', handleProfileUpdated);
    return () => window.removeEventListener('profile:updated', handleProfileUpdated);
  }, []);

  const label = loadError ? `Abrir mi perfil. ${loadError}` : 'Abrir mi perfil';

  return (
    <Link
      to="/profile"
      aria-label={label}
      title={label}
      className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#181818] text-sm font-semibold text-[#d8b563] shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold))]"
    >
      {avatarUrl && !imageFailed ? (
        <img
          src={avatarUrl}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{initial}</span>
      )}
    </Link>
  );
}
