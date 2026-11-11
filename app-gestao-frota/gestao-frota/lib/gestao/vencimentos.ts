/** Reúne tudo que vence (de várias tabelas) — usado na tela Vencimentos e no alerta do painel. */
import "server-only";
import { diaLocal, diasEntre, hoje } from "@/lib/datas";
import { ENTIDADES, VENCIMENTOS } from "./config";
import { type Db, lerLinhas } from "./consulta";
import type { Campo, Condicao, Nomes } from "./tipos";
import { rotuloDe } from "./valor";

export type ItemVencimento = {
  id: string;
  tipo: string;
  titulo: string;
  detalhe: { campo: Campo; valor: unknown } | null;
  data: string;
  dias: number;
  rota: string;
};

export async function carregarVencimentos(db: Db, nomes: Nomes): Promise<ItemVencimento[]> {
  const h = hoje();
  const grupos = await Promise.all(
    VENCIMENTOS.map(async (f) => {
      const onde: Condicao[] = [...f.onde, [f.campo, "nao_nulo"], [f.campo, "gte", ["hoje", -365]], [f.campo, "lte", ["hoje", f.janela]]];
      const linhas = await lerLinhas(db, f.tabela, { onde, ordem: [[f.campo, "asc"]], limite: 500 });
      const e = ENTIDADES[f.tabela];
      const campoData = e.campos.find((c) => c.nome === f.campo);
      const campoDetalhe = f.detalhe ? e.campos.find((c) => c.nome === f.detalhe) : undefined;
      return linhas.map<ItemVencimento>((l) => {
        const valorData = String(l[f.campo]);
        const data = campoData?.tipo === "datahora" ? diaLocal(valorData) : valorData.slice(0, 10);
        return {
          id: `${f.tabela}-${l.id}-${f.campo}`,
          tipo: f.tipo,
          titulo: rotuloDe(e, l, nomes),
          detalhe: campoDetalhe ? { campo: campoDetalhe, valor: l[campoDetalhe.nome] } : null,
          data,
          dias: diasEntre(h, data),
          rota: e.rota,
        };
      });
    }),
  );
  return grupos.flat().sort((a, b) => a.dias - b.dias);
}
