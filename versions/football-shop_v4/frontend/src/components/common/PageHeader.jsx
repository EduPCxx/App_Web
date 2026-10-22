// Cabecera de sección: eyebrow en mayúsculas + título + acciones a la derecha
export default function PageHeader({ eyebrow, title, description, children }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">{eyebrow}</p>}
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}
