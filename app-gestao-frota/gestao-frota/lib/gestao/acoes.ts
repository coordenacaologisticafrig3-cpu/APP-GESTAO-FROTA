"use server";

/**
 * Gravar, excluir, mudar de etapa, dar baixa, parcelar e importar planilha — vale para TODAS as telas de cadastro do app.
 * A tabela vem do formulário, mas só são aceitas as que estão em lib/gestao/config.ts.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { type EstadoAcao, errosDoZod, falha, lerFormulario, mensagemErroBanco, sucesso } from "@/lib/acoes";
import { createClient } from "@/lib/supabase/server";
import { hoje } from "@/lib/datas";
import { ENTIDADES } from "./config";
import { abrirBanco, mapaNomes } from "./consulta";
import { camposPlanilha, celulaParaFormulario, lerCsv, normalizarCabecalho } from "./csv";
import { esquemaDe, vazios } from "./esquemas";

/** Mensagens escritas no banco (raise exception) aparecem como estão; as demais usam o padrão do projeto. */
function mensagemErro(erro: { code?: string; message?: string }) {
  if (erro.code === "P0001" && erro.message) return erro.message;
  if (erro.code === "23505") return "Já existe um registro com esses dados (um nome, número ou código repetido).";
  return mensagemErroBanco(erro);
}

/** Checkbox de formulário: marcado = "on" (ou "1"/"true"). */
function marcado(formData: FormData, campo: string) {
  const v = formData.get(campo);
  return v === "on" || v === "1" || v === "true";
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function atualizarTelas(rota: string) {
  revalidatePath(`/${rota}`);
  revalidatePath("/");
  revalidatePath("/vencimentos");
  revalidatePath("/relatorios");
  revalidatePath("/fluxo");
}

/** Soma meses a uma data ISO mantendo o dia (31/01 + 1 mês = 28/02). */
function somarMesesISO(data: string, meses: number) {
  const [a, m, d] = data.split("-").map(Number);
  const alvo = new Date(Date.UTC(a, m - 1 + meses, 1));
  const ultimo = new Date(Date.UTC(alvo.getUTCFullYear(), alvo.getUTCMonth() + 1, 0)).getUTCDate();
  alvo.setUTCDate(Math.min(d, ultimo));
  return alvo.toISOString().slice(0, 10);
}

export async function salvarRegistro(_anterior: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const tabela = String(formData.get("_tabela") ?? "");
  const e = ENTIDADES[tabela];
  if (!e || e.semForm) return falha("Cadastro inválido.");

  const d = esquemaDe(e).safeParse({ ...vazios(e), ...lerFormulario(formData) });
  if (!d.success) return falha("Confira os campos destacados.", errosDoZod(d.error));

  const { id, ...campos } = d.data as { id: string | null } & Record<string, unknown>;
  const registro: Record<string, unknown> = { ...campos };
  for (const c of e.campos) if (c.tipo === "bool") registro[c.nome] = marcado(formData, c.nome);

  const supabase = (await createClient()) as unknown as SupabaseClient;

  // parcelar ou repetir: só ao cadastrar
  const n = Number(formData.get("_parcelas") ?? 1);
  if (!id && e.parcelar && Number.isInteger(n) && n > 1) {
    if (n > 60) return falha("No máximo 60 parcelas por vez.", { _parcelas: "No máximo 60." });
    const { valor, data, texto } = e.parcelar;
    const total = Number(registro[valor] ?? 0);
    const primeira = String(registro[data] ?? "");
    if (!total || !primeira) return falha("Informe o valor e a data para parcelar.");
    const dividir = formData.get("_modo") !== "repetir";
    const centavos = Math.round(total * 100);
    const base = Math.floor(centavos / n);
    const max = e.campos.find((c) => c.nome === texto)?.max ?? 120;
    const linhas = Array.from({ length: n }, (_, i) => {
      const r: Record<string, unknown> = { ...registro };
      r[valor] = (dividir ? (i === n - 1 ? centavos - base * (n - 1) : base) : centavos) / 100;
      r[data] = somarMesesISO(primeira, i);
      if (typeof r.competencia === "string" && r.competencia) r.competencia = somarMesesISO(r.competencia, i);
      const sufixo = ` (${i + 1}/${n})`;
      if (texto && typeof r[texto] === "string") r[texto] = String(r[texto]).slice(0, max - sufixo.length) + sufixo;
      if (i > 0 && e.baixa) {
        r[e.baixa.campo] = e.baixa.aberto;
        if (e.baixa.data) r[e.baixa.data] = null;
      }
      return r;
    });
    const { error } = await supabase.from(tabela).insert(linhas);
    if (error) return falha(mensagemErro(error));
    atualizarTelas(e.rota);
    return sucesso(`${n} lançamentos criados.`);
  }

  const { error } = id ? await supabase.from(tabela).update(registro).eq("id", id) : await supabase.from(tabela).insert(registro);
  if (error) return falha(mensagemErro(error));
  atualizarTelas(e.rota);
  return sucesso(id ? `${e.singular}: alterações salvas.` : `${e.singular} cadastrado.`);
}

export async function excluirRegistro(tabela: string, id: string): Promise<EstadoAcao> {
  const e = ENTIDADES[tabela];
  if (!e || !UUID.test(id)) return falha("Registro inválido.");
  const supabase = (await createClient()) as unknown as SupabaseClient;
  const { error } = await supabase.from(tabela).delete().eq("id", id);
  if (error?.code === "23503" || error?.code === "23001") {
    return falha("Este registro está ligado a outros dados e não pode ser excluído. Remova ou edite os registros ligados a ele antes.");
  }
  if (error) return falha(mensagemErro(error));
  atualizarTelas(e.rota);
  return sucesso(`${e.singular} excluído.`);
}

/** Muda o valor de um campo select (ex.: mover um chamado de coluna no quadro). */
export async function mudarEtapa(tabela: string, id: string, campo: string, valor: string): Promise<EstadoAcao> {
  const e = ENTIDADES[tabela];
  const c = e?.campos.find((x) => x.nome === campo && x.tipo === "select");
  if (!e || !c || !UUID.test(id) || !c.opcoes.some((o) => o.valor === valor)) return falha("Mudança inválida.");
  const supabase = (await createClient()) as unknown as SupabaseClient;
  const { error } = await supabase.from(tabela).update({ [campo]: valor }).eq("id", id);
  if (error) return falha(mensagemErro(error));
  atualizarTelas(e.rota);
  return sucesso(`Movido para “${c.opcoes.find((o) => o.valor === valor)?.rotulo}”.`);
}

/** "Dar baixa": marca como pago/recebido com a data de hoje. Com desfazer, volta para "em aberto". */
export async function darBaixa(tabela: string, id: string, desfazer = false): Promise<EstadoAcao> {
  const e = ENTIDADES[tabela];
  if (!e?.baixa || !UUID.test(id)) return falha("Baixa não disponível neste cadastro.");
  const { campo, pago, data, aberto } = e.baixa;
  const mudanca: Record<string, unknown> = { [campo]: desfazer ? aberto : pago };
  if (data) mudanca[data] = desfazer ? null : hoje();
  const supabase = (await createClient()) as unknown as SupabaseClient;
  const { error } = await supabase.from(tabela).update(mudanca).eq("id", id);
  if (error) return falha(mensagemErro(error));
  atualizarTelas(e.rota);
  return sucesso(desfazer ? "Baixa desfeita." : "Baixa registrada.");
}

const LIMITE_LINHAS = 2000;

export type ResultadoImportacao = EstadoAcao & { problemas?: string[] };

/** Importa uma planilha CSV (a mesma que a exportação gera). Valida tudo antes: se houver erro, não grava nada. */
export async function importarCsv(tabela: string, texto: string): Promise<ResultadoImportacao> {
  const e = ENTIDADES[tabela];
  if (!e || e.semForm) return falha("Cadastro inválido.");
  if (texto.length > 2_000_000) return falha("Arquivo grande demais (máximo 2 MB).");
  const linhas = lerCsv(texto);
  if (linhas.length < 2) return falha("A planilha está vazia. Baixe o modelo para ver as colunas.");
  if (linhas.length - 1 > LIMITE_LINHAS) return falha(`Máximo de ${LIMITE_LINHAS} linhas por importação.`);

  const campos = camposPlanilha(e);
  const cabecalho = linhas[0].map(normalizarCabecalho);
  const indice = new Map<string, number>();
  for (const c of campos) {
    const i = cabecalho.indexOf(normalizarCabecalho(c.rotulo));
    if (i >= 0) indice.set(c.nome, i);
  }
  const faltam = campos.filter((c) => c.obrig && c.tipo !== "bool" && !indice.has(c.nome));
  if (faltam.length) return falha(`Faltam colunas obrigatórias: ${faltam.map((c) => c.rotulo).join(", ")}. Baixe o modelo.`);

  const db = await abrirBanco();
  const nomes = await mapaNomes(
    db,
    campos.filter((c) => c.tipo === "ref" && c.ref).map((c) => c.ref as string),
  );
  const esquema = esquemaDe(e);
  const registros: Record<string, unknown>[] = [];
  const problemas: string[] = [];

  linhas.slice(1).forEach((cels, k) => {
    const nl = k + 2;
    const form: Record<string, string> = { ...vazios(e), id: "" };
    const bools: Record<string, boolean> = {};
    let linhaOk = true;
    for (const c of campos) {
      const i = indice.get(c.nome);
      const bruto = i === undefined ? "" : (cels[i] ?? "");
      const vazio = bruto.trim() === "";
      if (c.tipo === "bool") {
        const r = celulaParaFormulario(c, bruto, nomes);
        bools[c.nome] = vazio ? Boolean(c.padrao) : "valor" in r && r.valor === "on";
        continue;
      }
      if (vazio && c.padrao !== null && c.padrao !== undefined && c.padrao !== "hoje" && c.padrao !== "agora") {
        form[c.nome] = String(c.padrao);
        continue;
      }
      const r = celulaParaFormulario(c, bruto, nomes);
      if ("erro" in r) {
        problemas.push(`Linha ${nl} · ${c.rotulo}: ${r.erro}.`);
        linhaOk = false;
      } else form[c.nome] = r.valor;
    }
    if (!linhaOk) return;
    const v = esquema.safeParse(form);
    if (!v.success) {
      for (const [campo, msg] of Object.entries(errosDoZod(v.error))) {
        problemas.push(`Linha ${nl} · ${campos.find((c) => c.nome === campo)?.rotulo ?? campo}: ${msg}`);
      }
      return;
    }
    const { id: _id, ...resto } = v.data as { id: string | null } & Record<string, unknown>;
    void _id;
    registros.push({ ...resto, ...bools });
  });

  if (problemas.length) {
    return { ...falha(`Encontrei ${problemas.length} problema(s) na planilha. Nada foi importado; corrija e envie de novo.`), problemas: problemas.slice(0, 25) };
  }
  const supabase = (await createClient()) as unknown as SupabaseClient;
  for (let i = 0; i < registros.length; i += 500) {
    const { error } = await supabase.from(tabela).insert(registros.slice(i, i + 500));
    if (error) return falha(`${mensagemErro(error)} ${i > 0 ? `As primeiras ${i} linhas já foram importadas.` : "Nada foi importado."}`);
  }
  atualizarTelas(e.rota);
  return sucesso(`${registros.length} registro(s) importado(s).`);
}
