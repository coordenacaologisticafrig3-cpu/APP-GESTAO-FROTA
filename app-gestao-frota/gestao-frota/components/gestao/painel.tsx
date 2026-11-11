import Link from "next/link";
import { BellRing, ChevronRight, Plus } from "lucide-react";
import { Cartao } from "@/components/ui/cartao";
import { formatarDataExtenso, formatarMoeda, formatarNumero } from "@/lib/formatar";
import { abrirBanco, contar, lerLinhas, mapaNomes, somar } from "@/lib/gestao/consulta";
import { ENTIDADES, PAINEL, RELATORIOS, VENCIMENTOS } from "@/lib/gestao/config";
import { IconeDe, icone } from "@/lib/gestao/icones";
import { calcularBloco, formatarCompacto } from "@/lib/gestao/relatorio";
import { carregarVencimentos } from "@/lib/gestao/vencimentos";
import { Valor, rotuloDe } from "@/lib/gestao/valor";
import { obterMarca } from "@/lib/marca-servidor";
import { cn } from "@/lib/utils";
import { AreaGrafico, Rosca } from "./graficos";
import { Kpi } from "./kpi";

/** Painel inicial: destaque da marca com os números principais, alerta de vencimentos, gráficos e listas. */
export async function PainelInicio({ senhaAlterada }: { senhaAlterada?: boolean }) {
  const [db, marca] = await Promise.all([abrirBanco(), obterMarca()]);

  const blocoMensal = RELATORIOS.find((b) => b.tipo === "mensal");
  const blocoCategoria = RELATORIOS.find((b) => b.tipo === "categoria");
  const tabelas = [...new Set([...PAINEL.listas.map((l) => l.tabela), ...VENCIMENTOS.map((v) => v.tabela), ...RELATORIOS.map((b) => b.tabela)])];

  const nomes = await mapaNomes(db, tabelas);
  const [valores, listas, mensal, categoria, vencimentos] = await Promise.all([
    Promise.all(PAINEL.kpis.map((k) => (k.op === "sum" && k.campo ? somar(db, k.tabela, k.campo, k.onde) : contar(db, k.tabela, k.onde)))),
    Promise.all(PAINEL.listas.map((l) => lerLinhas(db, l.tabela, { onde: l.onde, ordem: [l.ordem], limite: l.limite }))),
    blocoMensal ? calcularBloco(db, blocoMensal, nomes) : null,
    blocoCategoria ? calcularBloco(db, blocoCategoria, nomes) : null,
    VENCIMENTOS.length ? carregarVencimentos(db, nomes) : [],
  ]);

  const texto = (k: (typeof PAINEL.kpis)[number], i: number) => (k.formato === "moeda" ? formatarMoeda(valores[i]) : formatarNumero(valores[i]));
  const destaques = PAINEL.kpis.slice(0, 4);
  const demais = PAINEL.kpis.slice(4);
  const nomeIconeMarca = Object.values(ENTIDADES)[0]?.icone ?? "Circle";
  const vencidos = vencimentos.filter((v) => v.dias < 0).length;
  const semana = vencimentos.filter((v) => v.dias >= 0 && v.dias <= 7).length;

  return (
    <>
      {senhaAlterada && (
        <p role="status" className="mb-4 rounded-xl bg-ok-suave p-3 text-sm text-ok">
          Senha alterada com sucesso.
        </p>
      )}

      <section className="relative overflow-hidden rounded-3xl bg-marca p-5 text-marca-texto shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-marca-texto/10" aria-hidden />
        <div className="pointer-events-none absolute -bottom-24 right-40 size-56 rounded-full bg-destaque/30 blur-2xl" aria-hidden />
        <IconeDe nome={nomeIconeMarca} className="pointer-events-none absolute -bottom-6 right-6 size-44 -rotate-12 opacity-[0.12]" aria-hidden />
        <div className="relative">
          <p className="text-sm font-medium opacity-80">{formatarDataExtenso(new Date())}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-4xl">Olá, {marca.nome}!</h1>
          <p className="mt-1 max-w-xl text-sm opacity-85 sm:text-base">{marca.subtitulo ?? "Veja como está o dia."}</p>
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-6 lg:grid-cols-4">
            {destaques.map((k, i) => (
              <Link
                key={k.rotulo}
                href={k.link ?? "/"}
                className="rounded-2xl bg-marca-texto/15 p-3.5 backdrop-blur-sm transition-colors hover:bg-marca-texto/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-texto"
              >
                <p className={cn("font-bold leading-tight tracking-tight", texto(k, i).length > 11 ? "text-xl" : "text-2xl sm:text-3xl")}>{texto(k, i)}</p>
                <p className="mt-1 text-xs opacity-85 sm:text-sm">{k.rotulo}</p>
              </Link>
            ))}
          </div>
          {PAINEL.atalhos.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {PAINEL.atalhos.map((a) => (
                <Link
                  key={a.tabela}
                  href={`/${ENTIDADES[a.tabela].rota}?novo=1`}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-marca-texto px-4 text-sm font-semibold text-marca hover:opacity-90"
                >
                  <Plus className="size-4" aria-hidden /> {a.rotulo}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {(vencidos > 0 || semana > 0) && (
        <Link
          href="/vencimentos"
          className={cn(
            "mt-4 flex items-center gap-3 rounded-2xl border p-4 transition-colors",
            vencidos > 0 ? "border-perigo/30 bg-perigo-suave text-perigo hover:border-perigo" : "border-alerta/30 bg-alerta-suave text-alerta hover:border-alerta",
          )}
        >
          <BellRing className="size-6 shrink-0" aria-hidden />
          <p className="min-w-0 flex-1 text-sm font-medium sm:text-base">
            {vencidos > 0 && (
              <>
                <b>{vencidos}</b> {vencidos === 1 ? "item vencido" : "itens vencidos"}
                {semana > 0 ? " e " : ""}
              </>
            )}
            {semana > 0 && (
              <>
                <b>{semana}</b> {semana === 1 ? "vencendo" : "vencendo"} nos próximos 7 dias
              </>
            )}
            . Veja o que precisa de atenção.
          </p>
          <ChevronRight className="size-5 shrink-0" aria-hidden />
        </Link>
      )}

      {demais.length > 0 && (
        <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {demais.map((k, i) => (
            <Kpi key={k.rotulo} rotulo={k.rotulo} valor={texto(k, i + 4)} icone={icone(k.icone)} tom={k.tom} link={k.link} dica={k.dica} />
          ))}
        </div>
      )}

      {(mensal || categoria) && (
        <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-5">
          {mensal && (
            <Cartao className={cn("lg:col-span-3", !categoria && "lg:col-span-5")}>
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-semibold text-texto">{mensal.b.titulo}</h2>
                <Link href="/relatorios" className="text-sm font-semibold text-marca-forte hover:underline">
                  Relatórios
                </Link>
              </div>
              <AreaGrafico itens={mensal.itens} />
            </Cartao>
          )}
          {categoria && (
            <Cartao className={cn("lg:col-span-2", !mensal && "lg:col-span-5")}>
              <h2 className="mb-4 font-semibold text-texto">{categoria.b.titulo}</h2>
              <Rosca
                itens={categoria.itens.slice(0, 6)}
                centro={formatarCompacto(categoria.b.formato, categoria.total)}
              />
            </Cartao>
          )}
        </div>
      )}

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
        {PAINEL.listas.map((l, i) => {
          const e = ENTIDADES[l.tabela];
          const campos = l.meta.map((nome) => e.campos.find((c) => c.nome === nome)).filter((c) => c !== undefined);
          const Icone = icone(l.icone);
          return (
            <Cartao key={l.titulo} className="overflow-hidden p-0 sm:p-0">
              <div className="flex items-center justify-between gap-3 border-b border-borda px-4 py-3 sm:px-5">
                <h2 className="flex items-center gap-2.5 font-semibold text-texto">
                  <span className="grid size-8 place-items-center rounded-lg bg-marca-suave text-marca-forte">
                    <Icone className="size-4" aria-hidden />
                  </span>
                  {l.titulo}
                </h2>
                <Link href={l.link ?? `/${e.rota}`} className="inline-flex items-center gap-1 text-sm font-semibold text-marca-forte hover:underline">
                  Ver tudo <ChevronRight className="size-4" aria-hidden />
                </Link>
              </div>
              {listas[i].length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-texto-2">{l.vazio}</p>
              ) : (
                <ul className="divide-y divide-borda">
                  {listas[i].map((linha) => (
                    <li key={linha.id}>
                      <Link href={l.link ?? `/${e.rota}`} className="flex min-h-14 items-center justify-between gap-3 px-4 py-2.5 hover:bg-superficie-2 sm:px-5">
                        <span className="min-w-0 break-words text-sm font-medium text-texto">{rotuloDe(e, linha, nomes)}</span>
                        <span className="flex shrink-0 flex-wrap items-center justify-end gap-x-3 gap-y-1 text-right text-sm text-texto-2">
                          {campos.map((c) => (
                            <span key={c.nome}>
                              <Valor campo={c} valor={linha[c.nome]} nomes={nomes} />
                            </span>
                          ))}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Cartao>
          );
        })}
      </div>
    </>
  );
}
