import { abrirBanco, lerLinhas, mapaNomes } from "@/lib/gestao/consulta";
import { ENTIDADES } from "@/lib/gestao/config";
import type { Condicao } from "@/lib/gestao/tipos";
import { ListaGenerica } from "./lista-generica";
import type { OpcoesRef, Pai } from "./form-generico";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Página de cadastro padrão de uma tabela (lista + formulário). */
export async function PaginaLista({
  tabela,
  searchParams,
}: {
  tabela: string;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const e = ENTIDADES[tabela];
  const sp = await searchParams;
  const db = await abrirBanco();
  const refs = e.campos.filter((c) => c.tipo === "ref" && c.ref);

  // ?campo_id=UUID → mostra só os registros daquele "pai" (ex.: etapas de uma obra)
  const campoPai = refs.find((c) => typeof sp[c.nome] === "string" && UUID.test(sp[c.nome] as string));
  const onde: Condicao[] = campoPai ? [[campoPai.nome, "eq", String(sp[campoPai.nome])]] : [];

  const [linhas, nomes] = await Promise.all([
    lerLinhas(db, tabela, { onde, ordem: e.ordem }),
    mapaNomes(
      db,
      refs.map((c) => c.ref as string),
    ),
  ]);

  const opcoes: OpcoesRef = {};
  for (const c of refs) {
    const mapa = nomes[c.ref as string] ?? {};
    opcoes[c.nome] = Object.entries(mapa)
      .map(([id, rotulo]) => ({ id, rotulo }))
      .sort((a, b) => a.rotulo.localeCompare(b.rotulo, "pt-BR"));
  }

  const pai: Pai | null = campoPai
    ? {
        campo: campoPai.nome,
        id: String(sp[campoPai.nome]),
        rotulo: nomes[campoPai.ref as string]?.[String(sp[campoPai.nome])] ?? "registro",
        rota: ENTIDADES[campoPai.ref as string]?.rota ?? "",
      }
    : null;

  return <ListaGenerica entidade={e} linhas={linhas} nomes={nomes} opcoes={opcoes} pai={pai} abrirNovo={sp.novo === "1"} />;
}
