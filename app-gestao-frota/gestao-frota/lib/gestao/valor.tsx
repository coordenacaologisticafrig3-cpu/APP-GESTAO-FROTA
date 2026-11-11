/**
 * Mostra o valor de um campo conforme o tipo (moeda, data, selo colorido, nome do registro ligado...).
 * Funciona no servidor e no navegador.
 */
import { Selo } from "@/components/ui/cartao";
import { formatarData, formatarDataHora, formatarMoeda, formatarNumero, formatarTelefone } from "@/lib/formatar";
import type { Campo, Entidade, Nomes, Registro } from "./tipos";

const vazio = (v: unknown) => v === null || v === undefined || v === "";

/** Texto puro do valor (usado em títulos, buscas e mensagens de WhatsApp). */
export function textoCampo(c: Campo, valor: unknown, nomes: Nomes = {}): string {
  if (c.tipo === "bool") return valor ? "Sim" : "Não";
  if (vazio(valor)) return "";
  switch (c.tipo) {
    case "inteiro":
      return formatarNumero(Number(valor)) + c.sufixo;
    case "decimal":
      return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: c.casas }).format(Number(valor)) + c.sufixo;
    case "dinheiro":
      return formatarMoeda(Number(valor));
    case "data":
      return formatarData(String(valor));
    case "datahora":
      return formatarDataHora(String(valor));
    case "telefone":
      return formatarTelefone(String(valor));
    case "select":
      return c.opcoes.find((o) => o.valor === valor)?.rotulo ?? String(valor);
    case "ref":
      return c.ref ? (nomes[c.ref]?.[String(valor)] ?? "") : "";
    case "calc":
      if (c.exibir === "dinheiro") return formatarMoeda(Number(valor));
      if (c.exibir === "inteiro") return formatarNumero(Number(valor)) + c.sufixo;
      if (c.exibir === "numero") return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: c.casas }).format(Number(valor)) + c.sufixo;
      return String(valor);
    default:
      return String(valor);
  }
}

/** Valor para a tela: selects viram selos coloridos; o resto, texto formatado. */
export function Valor({ campo, valor, nomes }: { campo: Campo; valor: unknown; nomes?: Nomes }) {
  if (campo.tipo === "select" && !vazio(valor)) {
    const o = campo.opcoes.find((x) => x.valor === valor);
    return <Selo cor={o?.tom ?? "neutro"}>{o?.rotulo ?? String(valor)}</Selo>;
  }
  if (campo.tipo === "bool") return <Selo cor={valor ? "ok" : "neutro"}>{valor ? "Sim" : "Não"}</Selo>;
  const t = textoCampo(campo, valor, nomes);
  return <>{t || "—"}</>;
}

/** Substitui {campo} do modelo pelos valores do registro e limpa separadores soltos. */
export function aplicarModelo(modelo: string, e: Entidade, linha: Registro, nomes: Nomes = {}) {
  const texto = modelo.replace(/\{(\w+)\}/g, (_, k: string) => {
    const c = e.campos.find((x) => x.nome === k);
    if (!c) {
      const v = linha[k];
      return vazio(v) ? "" : String(v);
    }
    return textoCampo(c, linha[k], nomes);
  });
  return texto
    .replace(/(\s*[·–—]\s*){2,}/g, " · ")
    .replace(/^[\s·–—]+|[\s·–—]+$/g, "")
    .trim();
}

export const rotuloDe = (e: Entidade, linha: Registro, nomes: Nomes = {}) => aplicarModelo(e.titulo, e, linha, nomes) || "(sem nome)";

/** Texto usado na busca da lista (títulos + campos de busca, sem acento e minúsculo). */
export function textoBusca(e: Entidade, linha: Registro, nomes: Nomes = {}) {
  const partes = [rotuloDe(e, linha, nomes)];
  for (const nome of e.busca) {
    const c = e.campos.find((x) => x.nome === nome);
    if (c) partes.push(textoCampo(c, linha[nome], nomes));
  }
  return normalizar(partes.join(" "));
}

export function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
