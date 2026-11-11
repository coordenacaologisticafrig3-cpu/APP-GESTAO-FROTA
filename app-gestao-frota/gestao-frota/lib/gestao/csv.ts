/**
 * CSV para o Excel brasileiro: separador ";", vírgula decimal e datas dd/mm/aaaa.
 * Usado pela exportação (rota /exportar/[tabela]) e pela importação (Server Action).
 */
import { formatarData, formatarDataHora, somenteDigitos } from "@/lib/formatar";
import type { Campo, Entidade, Nomes, Registro } from "./tipos";

const SEPARADOR = ";";

/** Campos que entram na planilha: tudo o que o formulário preenche. */
export const camposPlanilha = (e: Entidade) => e.campos.filter((c) => c.tipo !== "calc" && !c.soLeitura);

function celula(v: string) {
  // evita que o Excel interprete o texto como fórmula
  const seguro = /^[=+\-@]/.test(v) && !/^-?\d+([.,]\d+)?$/.test(v) ? `'${v}` : v;
  return /[";\n\r]/.test(seguro) ? `"${seguro.replace(/"/g, '""')}"` : seguro;
}

/** Valor do campo escrito do jeito que a importação também entende. */
export function valorParaCsv(c: Campo, v: unknown, nomes: Nomes): string {
  if (c.tipo === "bool") return v ? "Sim" : "Não";
  if (v === null || v === undefined || v === "") return "";
  switch (c.tipo) {
    case "data":
      return formatarData(String(v));
    case "datahora":
      return formatarDataHora(String(v));
    case "dinheiro":
    case "decimal":
      return String(v).replace(".", ",");
    case "select":
      return c.opcoes.find((o) => o.valor === v)?.rotulo ?? String(v);
    case "ref":
      return c.ref ? (nomes[c.ref]?.[String(v)] ?? "") : "";
    default:
      return String(v);
  }
}

export function montarCsv(e: Entidade, linhas: Registro[], nomes: Nomes) {
  const campos = camposPlanilha(e);
  const cabecalho = campos.map((c) => celula(c.rotulo)).join(SEPARADOR);
  const corpo = linhas.map((l) => campos.map((c) => celula(valorParaCsv(c, l[c.nome], nomes))).join(SEPARADOR));
  // BOM para o Excel abrir os acentos certos
  return "﻿" + [cabecalho, ...corpo].join("\r\n") + "\r\n";
}

/** Lê o CSV (separador ; ou ,), com aspas e quebras de linha dentro de campos. */
export function lerCsv(texto: string): string[][] {
  const t = texto.replace(/^﻿/, "");
  const primeira = t.split(/\r?\n/, 1)[0] ?? "";
  const sep = (primeira.match(/;/g)?.length ?? 0) >= (primeira.match(/,/g)?.length ?? 0) ? ";" : ",";
  const linhas: string[][] = [];
  let linha: string[] = [];
  let atual = "";
  let aspas = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (aspas) {
      if (ch === '"' && t[i + 1] === '"') {
        atual += '"';
        i++;
      } else if (ch === '"') aspas = false;
      else atual += ch;
    } else if (ch === '"') aspas = true;
    else if (ch === sep) {
      linha.push(atual);
      atual = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && t[i + 1] === "\n") i++;
      linha.push(atual);
      atual = "";
      if (linha.some((x) => x.trim() !== "")) linhas.push(linha);
      linha = [];
    } else atual += ch;
  }
  linha.push(atual);
  if (linha.some((x) => x.trim() !== "")) linhas.push(linha);
  return linhas;
}

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

export const normalizarCabecalho = norm;

/** Converte o texto de uma célula para o formato que o formulário envia (a validação é a mesma da tela). */
export function celulaParaFormulario(c: Campo, bruto: string, nomes: Nomes): { valor: string } | { erro: string } {
  const v = bruto.trim().replace(/^'(?=[=+\-@])/, "");
  if (v === "") return { valor: "" };
  switch (c.tipo) {
    case "data": {
      const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (m) return { valor: `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` };
      if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return { valor: v };
      return { erro: "use a data como 31/12/2026" };
    }
    case "datahora": {
      const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})[ T](\d{1,2}):(\d{2})$/);
      if (m) return { valor: `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}T${m[4].padStart(2, "0")}:${m[5]}` };
      const iso = v.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/);
      if (iso) return { valor: `${iso[1]}T${iso[2]}` };
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) return celulaParaFormulario(c, `${v} 00:00`, nomes);
      return { erro: "use data e hora como 31/12/2026 14:30" };
    }
    case "select": {
      const o = c.opcoes.find((x) => norm(x.rotulo) === norm(v) || norm(x.valor) === norm(v));
      return o ? { valor: o.valor } : { erro: `opção inválida (use: ${c.opcoes.map((x) => x.rotulo).join(", ")})` };
    }
    case "ref": {
      const mapa = c.ref ? (nomes[c.ref] ?? {}) : {};
      const ids = Object.entries(mapa).filter(([, rot]) => norm(rot) === norm(v));
      if (ids.length === 1) return { valor: ids[0][0] };
      if (ids.length > 1) return { erro: `“${v}” aparece mais de uma vez no cadastro` };
      return { erro: `“${v}” não está cadastrado` };
    }
    case "bool":
      return { valor: ["sim", "s", "1", "true", "x", "verdadeiro"].includes(norm(v)) ? "on" : "" };
    case "telefone":
      return { valor: somenteDigitos(v) };
    default:
      return { valor: v };
  }
}
