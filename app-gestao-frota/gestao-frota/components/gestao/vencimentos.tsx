import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { CabecalhoPagina, Cartao } from "@/components/ui/cartao";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { abrirBanco, mapaNomes } from "@/lib/gestao/consulta";
import { VENCIMENTOS } from "@/lib/gestao/config";
import { carregarVencimentos } from "@/lib/gestao/vencimentos";
import { Valor } from "@/lib/gestao/valor";
import { cn } from "@/lib/utils";

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const GRUPOS = [
  { id: "vencidos", titulo: "Vencidos", cor: "perigo", teste: (d: number) => d < 0 },
  { id: "hoje", titulo: "Vencem hoje", cor: "alerta", teste: (d: number) => d === 0 },
  { id: "semana", titulo: "Próximos 7 dias", cor: "alerta", teste: (d: number) => d > 0 && d <= 7 },
  { id: "mes", titulo: "De 8 a 30 dias", cor: "info", teste: (d: number) => d > 7 && d <= 30 },
  { id: "depois", titulo: "Depois de 30 dias", cor: "neutro", teste: (d: number) => d > 30 },
] as const;

const COR_DATA = {
  perigo: "bg-perigo-suave text-perigo",
  alerta: "bg-alerta-suave text-alerta",
  info: "bg-info-suave text-info",
  neutro: "bg-superficie-2 text-texto-2",
} as const;
const COR_PONTO = { perigo: "bg-perigo", alerta: "bg-alerta", info: "bg-info", neutro: "bg-texto-2" } as const;

/** Tela "Vencimentos": tudo que está vencido ou vai vencer, reunido de várias tabelas. */
export async function PaginaVencimentos() {
  const db = await abrirBanco();
  const nomes = await mapaNomes(db, [...new Set(VENCIMENTOS.map((f) => f.tabela))]);
  const itens = await carregarVencimentos(db, nomes);

  return (
    <>
      <CabecalhoPagina titulo="Vencimentos" descricao="Documentos, prazos e revisões que vencem — do mais urgente ao mais distante." />
      {!itens.length ? (
        <EstadoVazio icone={CalendarClock} titulo="Nada vencendo" descricao="Quando houver prazos cadastrados, eles aparecem aqui, organizados por urgência." />
      ) : (
        <div className="space-y-7">
          {GRUPOS.map((g) => {
            const doGrupo = itens.filter((i) => g.teste(i.dias));
            if (!doGrupo.length) return null;
            return (
              <section key={g.id} aria-labelledby={`g-${g.id}`}>
                <h2 id={`g-${g.id}`} className="mb-3 flex items-center gap-2.5 text-base font-semibold text-texto">
                  <span className={cn("size-2.5 rounded-full", COR_PONTO[g.cor])} aria-hidden />
                  {g.titulo}
                  <span className="rounded-full bg-superficie-2 px-2.5 py-0.5 text-xs font-semibold text-texto-2">{doGrupo.length}</span>
                </h2>
                <Cartao className="p-0 sm:p-0">
                  <ul className="divide-y divide-borda">
                    {doGrupo.map((i) => (
                      <li key={i.id}>
                        <Link href={`/${i.rota}`} className="flex items-center gap-4 px-4 py-3 hover:bg-superficie-2 sm:px-5">
                          <span className={cn("grid size-14 shrink-0 place-items-center rounded-2xl text-center leading-none", COR_DATA[g.cor])} aria-hidden>
                            <span>
                              <span className="block text-xl font-bold">{i.data.slice(8, 10)}</span>
                              <span className="block pt-0.5 text-[11px] font-semibold uppercase">{MESES[Number(i.data.slice(5, 7)) - 1]}</span>
                            </span>
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-semibold uppercase tracking-wide text-marca-forte">{i.tipo}</span>
                            <span className="block break-words text-sm font-medium text-texto sm:text-base">{i.titulo}</span>
                            {i.detalhe && (
                              <span className="block text-xs text-texto-2">
                                <Valor campo={i.detalhe.campo} valor={i.detalhe.valor} nomes={nomes} />
                              </span>
                            )}
                          </span>
                          <span className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-semibold", COR_DATA[g.cor])}>
                            {i.dias === 0 ? "hoje" : i.dias < 0 ? `há ${-i.dias} dia${i.dias === -1 ? "" : "s"}` : `em ${i.dias} dia${i.dias === 1 ? "" : "s"}`}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Cartao>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
