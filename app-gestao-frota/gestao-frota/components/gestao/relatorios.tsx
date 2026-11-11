import { BarChart3 } from "lucide-react";
import { CabecalhoPagina, Cartao } from "@/components/ui/cartao";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { hoje } from "@/lib/datas";
import { abrirBanco, mapaNomes } from "@/lib/gestao/consulta";
import { RELATORIOS } from "@/lib/gestao/config";
import { calcularBloco, formatarBloco, formatarCompacto } from "@/lib/gestao/relatorio";
import { AreaGrafico, Rosca } from "./graficos";
import { BarrasHorizontais } from "./barras";

/** Relatórios: evolução por mês (área) e distribuição por categoria (rosca + ranking). */
export async function PaginaRelatorios() {
  const db = await abrirBanco();
  const nomes = await mapaNomes(db, [...new Set(RELATORIOS.map((b) => b.tabela))]);
  const blocos = await Promise.all(RELATORIOS.map((b) => calcularBloco(db, b, nomes)));

  return (
    <>
      <CabecalhoPagina titulo="Relatórios" descricao={`Resumo dos últimos meses · atualizado em ${new Intl.DateTimeFormat("pt-BR").format(new Date(`${hoje()}T12:00:00-03:00`))}`} />
      {!blocos.length ? (
        <EstadoVazio icone={BarChart3} titulo="Sem relatórios" descricao="Os relatórios aparecem aqui conforme você cadastra os dados." />
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
          {blocos.map(({ b, itens, total }) => (
            <Cartao key={b.titulo} className={b.tipo === "mensal" ? "lg:col-span-2" : undefined}>
              <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-semibold text-texto">{b.titulo}</h2>
                <p className="text-sm text-texto-2">
                  Total: <b className="text-lg text-texto">{formatarBloco(b.formato, total)}</b>
                </p>
              </div>
              {b.tipo === "mensal" ? (
                <AreaGrafico itens={itens} />
              ) : (
                <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-2">
                  <Rosca itens={itens.slice(0, 6)} centro={formatarCompacto(b.formato, total)} />
                  <BarrasHorizontais itens={itens} />
                </div>
              )}
              {b.dica && <p className="mt-3 text-xs text-texto-2">{b.dica}</p>}
            </Cartao>
          ))}
        </div>
      )}
    </>
  );
}
