import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/apiService';
import { notifyError, notifySuccess } from '@/utils/alerts';

export default function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const { data } = await apiService.post('/auth/login', formData);
      const { token, user } = data.data;

      login({ token, user });
      await notifySuccess('Inicio de sesión correcto');
    } catch (error) {
      await notifyError(error, 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0d0d0d] px-4 py-12 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#141414]/90 p-6 shadow-soft">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4b56d]">Football Shop</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Iniciar sesión</h1>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm text-white/80">Correo electrónico</label>
            <Input id="email" name="email" type="email" autoComplete="email" value={formData.email} onChange={handleChange} placeholder="admin@example.test" required />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm text-white/80">Contraseña</label>
            <Input id="password" name="password" type="password" autoComplete="current-password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Iniciando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </main>
  );
}
