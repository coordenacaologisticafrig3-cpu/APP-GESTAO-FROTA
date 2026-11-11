import { cn } from "@/lib/utils";

/** Barras verticais (série mensal). Valores já formatados vêm em `texto`. */
export function BarrasMensais({ itens }: { itens: { rotulo: string; valor: number; texto: string }[] }) {
  const maximo = Math.max(...itens.map((i) => i.valor), 0);
  return (
    <ol className="flex h-48 items-end gap-2 sm:gap-3" aria-label="Valores por mês">
      {itens.map((i) => (
        <li key={i.rotulo} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
          <span className="max-w-full truncate text-[11px] font-medium text-texto-2 sm:text-xs">{i.valor ? i.texto : ""}</span>
          <div
            className={cn("w-full rounded-t-lg bg-marca", i.valor === 0 && "bg-borda")}
            style={{ height: maximo ? `${Math.max((i.valor / maximo) * 78, i.valor ? 3 : 1)}%` : "1%" }}
            role="img"
            aria-label={`${i.rotulo}: ${i.texto}`}
          />
          <span className="text-xs text-texto-2">{i.rotulo}</span>
        </li>
      ))}
    </ol>
  );
}

/** Barras horizontais (ranking por categoria). */
export function BarrasHorizontais({ itens }: { itens: { rotulo: string; valor: number; texto: string }[] }) {
  const maximo = Math.max(...itens.map((i) => i.valor), 0);
  if (!itens.length) return <p className="text-sm text-texto-2">Sem dados no período.</p>;
  return (
    <ul className="space-y-3">
      {itens.map((i) => (
        <li key={i.rotulo}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-texto">{i.rotulo}</span>
            <span className="shrink-0 font-semibold text-texto">{i.texto}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-superficie-2">
            <div className="h-full rounded-full bg-marca" style={{ width: maximo ? `${Math.max((i.valor / maximo) * 100, 2)}%` : "0%" }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
