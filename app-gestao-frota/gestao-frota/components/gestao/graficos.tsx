/** Gráficos leves em SVG (sem biblioteca): área com a evolução por mês e rosca por categoria. */
import { cn } from "@/lib/utils";

type Item = { rotulo: string; valor: number; texto: string };

/** Curva suave passando pelos pontos (0–100 em x e y). */
function caminho(pontos: [number, number][]) {
  if (pontos.length < 2) return "";
  let d = `M ${pontos[0][0]} ${pontos[0][1]}`;
  for (let i = 1; i < pontos.length; i++) {
    const [x0, y0] = pontos[i - 1];
    const [x1, y1] = pontos[i];
    const cx = (x0 + x1) / 2;
    d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
  }
  return d;
}

export function AreaGrafico({ itens, className }: { itens: Item[]; className?: string }) {
  const maximo = Math.max(...itens.map((i) => i.valor), 1);
  const passo = itens.length > 1 ? 100 / (itens.length - 1) : 100;
  const pontos: [number, number][] = itens.map((i, k) => [k * passo, 100 - (i.valor / maximo) * 82 - 6]);
  const linha = caminho(pontos);
  const area = pontos.length > 1 ? `${linha} L 100 100 L 0 100 Z` : "";
  const ultimo = itens.length - 1;
  const idGrad = "g-area-" + itens.map((i) => i.rotulo).join("").length;
  return (
    <div className={cn("w-full", className)}>
      <div className="relative h-56 lg:h-72">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" role="img" aria-label="Evolução por mês">
          <defs>
            <linearGradient id={idGrad} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--marca)" stopOpacity="0.38" />
              <stop offset="100%" stopColor="var(--marca)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[25, 50, 75].map((y) => (
            <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="var(--borda)" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeDasharray="3 4" />
          ))}
          <path d={area} fill={`url(#${idGrad})`} />
          <path d={linha} fill="none" stroke="var(--marca)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
        </svg>
        {pontos.map(([x, y], k) => (
          <span
            key={itens[k].rotulo}
            className={cn("absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-superficie bg-marca", k === ultimo ? "size-3.5" : "size-2.5")}
            style={{ left: `${x}%`, top: `${y}%` }}
            title={`${itens[k].rotulo}: ${itens[k].texto}`}
          />
        ))}
        {itens[ultimo] && (
          <span
            className="absolute -translate-x-full -translate-y-full whitespace-nowrap rounded-lg bg-marca px-2 py-1 text-xs font-semibold text-marca-texto shadow"
            style={{ left: "100%", top: `${Math.max(pontos[ultimo][1] - 6, 4)}%` }}
          >
            {itens[ultimo].texto}
          </span>
        )}
      </div>
      <div className="mt-2 flex justify-between text-xs text-texto-2">
        {itens.map((i, k) => (
          // com muitos meses, no celular mostra só um rótulo sim, outro não
          <span key={i.rotulo} className={cn(itens.length > 7 && k % 2 === 1 && "hidden sm:inline")}>
            {i.rotulo}
          </span>
        ))}
      </div>
    </div>
  );
}

const CORES = ["var(--marca)", "var(--destaque)", "var(--info)", "var(--ok)", "var(--alerta)", "var(--perigo)", "var(--texto-2)", "var(--borda)"];

export function Rosca({ itens, centro }: { itens: Item[]; centro: string }) {
  const total = itens.reduce((t, i) => t + i.valor, 0);
  const R = 42;
  const C = 2 * Math.PI * R;
  const inicios = itens.map((_, k) => itens.slice(0, k).reduce((t, i) => t + (i.valor / (total || 1)) * C, 0));
  if (!total) return <p className="text-sm text-texto-2">Sem dados no período.</p>;
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative size-36 shrink-0">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90" role="img" aria-label="Distribuição por categoria">
          <circle cx="50" cy="50" r={R} fill="none" stroke="var(--superficie-2)" strokeWidth="14" />
          {itens.map((i, k) => {
            const fatia = (i.valor / total) * C;
            return (
              <circle
                key={i.rotulo}
                cx="50"
                cy="50"
                r={R}
                fill="none"
                stroke={CORES[k % CORES.length]}
                strokeWidth="14"
                strokeDasharray={`${Math.max(fatia - 1.2, 0)} ${C}`}
                strokeDashoffset={-inicios[k]}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="px-3 text-base font-bold leading-tight text-texto">{centro}</p>
            <p className="text-[11px] text-texto-2">total</p>
          </div>
        </div>
      </div>
      <ul className="w-full min-w-0 flex-1 space-y-2">
        {itens.map((i, k) => (
          <li key={i.rotulo} className="flex items-center gap-2.5 text-sm">
            <span className="size-3 shrink-0 rounded-full" style={{ background: CORES[k % CORES.length] }} />
            <span className="min-w-0 flex-1 truncate text-texto">{i.rotulo}</span>
            <span className="shrink-0 font-semibold text-texto">{i.texto}</span>
            <span className="w-10 shrink-0 text-right text-xs text-texto-2">{Math.round((i.valor / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
