/**
 * Leituras do banco para o kit de gestão (só no servidor).
 * Usa o cliente do Supabase sem tipos de tabela: os campos vêm de lib/gestao/config.ts.
 */
import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { diaLocal, fimDoMes, hoje, inicioDoMes, somarDias } from "@/lib/datas";
import { ENTIDADES } from "./config";
import type { Condicao, Nomes, Registro, ValorCondicao } from "./tipos";
import { rotuloDe } from "./valor";

export type Db = SupabaseClient;
type Consulta = ReturnType<ReturnType<Db["from"]>["select"]>;

export async function abrirBanco(): Promise<Db> {
  return (await createClient()) as unknown as Db;
}

const PAGINA = 1000;

function resolver(valor: ValorCondicao | undefined, tipoCampo: string | undefined, op: string): unknown {
  if (Array.isArray(valor) && (valor[0] === "hoje" || valor[0] === "agora" || valor[0] === "mes_ini" || valor[0] === "mes_fim")) {
    let data: string;
    let instante = "";
    if (valor[0] === "hoje") data = somarDias(hoje(), Number(valor[1]));
    else if (valor[0] === "mes_ini") data = inicioDoMes();
    else if (valor[0] === "mes_fim") data = fimDoMes();
    else {
      const d = new Date(Date.now() + Number(valor[1]) * 3600_000);
      instante = d.toISOString();
      data = diaLocal(d);
    }
    if (tipoCampo === "datahora") {
      if (instante) return instante;
      return `${data}T${op === "lte" ? "23:59:59" : "00:00:00"}-03:00`;
    }
    return data;
  }
  if (tipoCampo === "datahora" && typeof valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return `${valor}T${op === "lte" ? "23:59:59" : "00:00:00"}-03:00`;
  }
  return valor;
}

export function filtrar(q: Consulta, tabela: string, onde: Condicao[]): Consulta {
  const e = ENTIDADES[tabela];
  let r = q;
  for (const [campo, op, valor] of onde) {
    const tipo = e?.campos.find((c) => c.nome === campo)?.tipo;
    const v = resolver(valor, tipo, op);
    if (op === "eq") r = r.eq(campo, v as string);
    else if (op === "neq") r = r.neq(campo, v as string);
    else if (op === "in") r = r.in(campo, v as string[]);
    else if (op === "gt") r = r.gt(campo, v as string);
    else if (op === "gte") r = r.gte(campo, v as string);
    else if (op === "lt") r = r.lt(campo, v as string);
    else if (op === "lte") r = r.lte(campo, v as string);
    else if (op === "nulo") r = r.is(campo, null);
    else if (op === "nao_nulo") r = r.not(campo, "is", null);
  }
  return r;
}

type Opcoes = { colunas?: string; onde?: Condicao[]; ordem?: [string, "asc" | "desc"][]; limite?: number };

/** Lê as linhas (de 1000 em 1000, limite do Supabase) com filtros e ordem. */
export async function lerLinhas(db: Db, tabela: string, { colunas = "*", onde = [], ordem = [], limite = 5000 }: Opcoes = {}): Promise<Registro[]> {
  const todas: Registro[] = [];
  for (let de = 0; de < limite; de += PAGINA) {
    const ate = Math.min(de + PAGINA, limite) - 1;
    let q = filtrar(db.from(tabela).select(colunas), tabela, onde);
    for (const [campo, sentido] of ordem) q = q.order(campo, { ascending: sentido === "asc" });
    q = q.order("id");
    const { data, error } = await q.range(de, ate);
    if (error) {
      console.error(`[lerLinhas ${tabela}]`, error.message);
      break;
    }
    const linhas = (data ?? []) as unknown as Registro[];
    todas.push(...linhas);
    if (linhas.length < ate - de + 1) break;
  }
  return todas;
}

export async function contar(db: Db, tabela: string, onde: Condicao[] = []) {
  const { count, error } = await filtrar(db.from(tabela).select("id", { count: "exact", head: true }), tabela, onde);
  if (error) console.error(`[contar ${tabela}]`, error.message);
  return count ?? 0;
}

export async function somar(db: Db, tabela: string, campo: string, onde: Condicao[] = []) {
  const linhas = await lerLinhas(db, tabela, { colunas: `id, ${campo}`, onde });
  return linhas.reduce((t, l) => t + Number(l[campo] ?? 0), 0);
}

/** Nomes legíveis ({ tabela: { id: "rótulo" } }) das tabelas pedidas e das que elas referenciam. */
export async function mapaNomes(db: Db, tabelas: string[]): Promise<Nomes> {
  const nomes: Nomes = {};
  const unicas = [...new Set(tabelas)].filter((t) => ENTIDADES[t]);
  const dados = await Promise.all(unicas.map((t) => lerLinhas(db, t, { limite: 3000 })));
  const maisTabelas = new Set<string>();
  unicas.forEach((t) => ENTIDADES[t].campos.forEach((c) => c.ref && !unicas.includes(c.ref) && maisTabelas.add(c.ref)));
  const extra = [...maisTabelas];
  const dadosExtra = await Promise.all(extra.map((t) => lerLinhas(db, t, { limite: 3000 })));
  // dois passes: primeiro rótulos simples, depois os que usam nomes de outras tabelas
  const todos: [string, Registro[]][] = [...unicas.map((t, i) => [t, dados[i]] as [string, Registro[]]), ...extra.map((t, i) => [t, dadosExtra[i]] as [string, Registro[]])];
  for (let passo = 0; passo < 2; passo++) {
    for (const [t, linhas] of todos) {
      const e = ENTIDADES[t];
      nomes[t] = Object.fromEntries(linhas.map((l) => [l.id, rotuloDe(e, l, nomes)]));
    }
  }
  return nomes;
}
