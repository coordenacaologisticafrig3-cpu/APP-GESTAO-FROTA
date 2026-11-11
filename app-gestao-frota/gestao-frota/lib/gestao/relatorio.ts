/** Cálculo dos blocos de relatório (série mensal e ranking por categoria) — usado pelos Relatórios e pelo painel. */
import "server-only";
import { formatarMoeda, formatarNumero } from "@/lib/formatar";
import { diaLocal, inicioDoMes, nomeMes, somarMeses } from "@/lib/datas";
import { ENTIDADES } from "./config";
import { type Db, lerLinhas } from "./consulta";
import type { BlocoRelatorio, Condicao, Nomes, Registro } from "./tipos";
import { textoCampo } from "./valor";

export type ItemBloco = { rotulo: string; valor: number; texto: string };
export type ResultadoBloco = { b: BlocoRelatorio; itens: ItemBloco[]; total: number };

export const formatarBloco = (formato: BlocoRelatorio["formato"], n: number) =>
  formato === "moeda" ? formatarMoeda(n) : formatarNumero(Math.round(n * 100) / 100);

/** "R$ 176 mil", "R$ 1,2 mi", "345": cabe no centro da rosca. */
export function formatarCompacto(formato: BlocoRelatorio["formato"], n: number) {
  const pre = formato === "moeda" ? "R$ " : "";
  if (n >= 1_000_000) return `${pre}${(n / 1_000_000).toFixed(1).replace(".", ",").replace(",0", "")} mi`;
  if (n >= 10_000) return `${pre}${Math.round(n / 1000)} mil`;
  return formato === "moeda" ? formatarMoeda(Math.round(n)).replace(",00", "") : formatarNumero(Math.round(n));
}

function mesDe(l: Registro, campo: string, tipo: string) {
  const v = String(l[campo] ?? "");
  const data = tipo === "datahora" ? diaLocal(v) : v.slice(0, 10);
  return `${data.slice(0, 7)}-01`;
}

export async function calcularBloco(db: Db, b: BlocoRelatorio, nomes: Nomes): Promise<ResultadoBloco> {
  const e = ENTIDADES[b.tabela];
  if (b.tipo === "mensal" && b.campoData) {
    const campoData = e.campos.find((c) => c.nome === b.campoData);
    const primeiro = somarMeses(inicioDoMes(), -(b.meses - 1));
    const onde: Condicao[] = [...b.onde, [b.campoData, "gte", primeiro]];
    const linhas = await lerLinhas(db, b.tabela, { onde, limite: 20000 });
    const meses = Array.from({ length: b.meses }, (_, i) => somarMeses(primeiro, i));
    const soma = new Map<string, number>(meses.map((m) => [m, 0]));
    for (const l of linhas) {
      const m = mesDe(l, b.campoData, campoData?.tipo ?? "data");
      if (soma.has(m)) soma.set(m, (soma.get(m) ?? 0) + (b.valor ? Number(l[b.valor] ?? 0) : 1));
    }
    const itens = meses.map((m) => ({ rotulo: nomeMes(m), valor: soma.get(m) ?? 0, texto: formatarBloco(b.formato, soma.get(m) ?? 0) }));
    return { b, itens, total: itens.reduce((t, i) => t + i.valor, 0) };
  }
  const campo = e.campos.find((c) => c.nome === b.agrupar);
  const linhas = await lerLinhas(db, b.tabela, { onde: b.onde, limite: 20000 });
  const soma = new Map<string, number>();
  for (const l of linhas) {
    const chave = campo ? textoCampo(campo, l[campo.nome], nomes) || "Sem informação" : "Sem informação";
    soma.set(chave, (soma.get(chave) ?? 0) + (b.valor ? Number(l[b.valor] ?? 0) : 1));
  }
  const itens = [...soma.entries()]
    .map(([rotulo, valor]) => ({ rotulo, valor, texto: formatarBloco(b.formato, valor) }))
    .sort((x, y) => y.valor - x.valor)
    .slice(0, 8);
  return { b, itens, total: [...soma.values()].reduce((t, v) => t + v, 0) };
}
