export default function Loading({ text = 'Cargando…' }) {
  return <div className="state"><div className="spinner" /><span>{text}</span></div>;
}
