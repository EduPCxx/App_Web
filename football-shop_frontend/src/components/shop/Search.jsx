import { FiSearch, FiX } from 'react-icons/fi';
import { Input } from '@/components/ui/input';

/**
 * @param {{ value: string, onChange: (value: string) => void }} props
 */
export default function Search({ value, onChange }) {
  return (
    <div className="relative w-full sm:max-w-sm">
      <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" aria-hidden="true" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pr-10 pl-9"
        placeholder="Buscar producto"
        aria-label="Buscar producto"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"
          aria-label="Limpiar búsqueda"
        >
          <FiX aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
