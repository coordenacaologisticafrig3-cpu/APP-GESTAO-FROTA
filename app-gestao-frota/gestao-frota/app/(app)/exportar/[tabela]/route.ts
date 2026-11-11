/** Baixa a planilha (CSV) de um cadastro: /exportar/<tabela>, ou /exportar/<tabela>?modelo=1 para o modelo vazio de importação. */
import { NextResponse } from "next/server";
import { hoje } from "@/lib/datas";
import { ENTIDADES } from "@/lib/gestao/config";
import { abrirBanco, lerLinhas, mapaNomes } from "@/lib/gestao/consulta";
import { montarCsv } from "@/lib/gestao/csv";

export async function GET(req: Request, { params }: { params: Promise<{ tabela: string }> }) {
  const { tabela: rota } = await params;
  const e = Object.values(ENTIDADES).find((x) => x.rota === rota);
  if (!e) return new NextResponse("Cadastro não encontrado.", { status: 404 });

  const db = await abrirBanco();
  const modelo = new URL(req.url).searchParams.get("modelo") === "1";
  const refs = e.campos.filter((c) => c.tipo === "ref" && c.ref).map((c) => c.ref as string);
  const [linhas, nomes] = await Promise.all([modelo ? Promise.resolve([]) : lerLinhas(db, e.tabela, { ordem: e.ordem, limite: 20000 }), mapaNomes(db, refs)]);

  const nome = modelo ? `modelo-importacao-${e.rota}.csv` : `${e.rota}-${hoje()}.csv`;
  return new NextResponse(montarCsv(e, linhas, nomes), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nome}"`,
      "Cache-Control": "no-store",
    },
  });
}
