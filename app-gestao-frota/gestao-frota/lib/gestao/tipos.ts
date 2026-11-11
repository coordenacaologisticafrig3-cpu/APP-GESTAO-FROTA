/**
 * Tipos do "kit de gestão": cada tela do app (lista, formulário, painel, vencimentos,
 * relatórios) é montada a partir destes metadados, definidos em lib/gestao/config.ts.
 */

export type Tom = "neutro" | "marca" | "ok" | "alerta" | "perigo" | "info";

export type TipoCampo =
  | "texto"
  | "longo"
  | "inteiro"
  | "decimal"
  | "dinheiro"
  | "data"
  | "datahora"
  | "select"
  | "bool"
  | "telefone"
  | "email"
  | "ref"
  | "calc";

export type OpcaoCampo = { valor: string; rotulo: string; tom: Tom };

export type Campo = {
  nome: string;
  rotulo: string;
  tipo: TipoCampo;
  obrig: boolean;
  max: number;
  min: number | null;
  maxv: number | null;
  casas: number;
  opcoes: OpcaoCampo[];
  padrao: string | number | boolean | null;
  ref: string | null;
  lista: boolean;
  destaque: boolean;
  filtro: boolean;
  ajuda: string | null;
  placeholder: string | null;
  cheia: boolean;
  sufixo: string;
  exibir: string;
  maiusculas: boolean;
  soLeitura: boolean;
};

export type Entidade = {
  tabela: string;
  singular: string;
  plural: string;
  rota: string;
  icone: string;
  descricao: string;
  vazio: string;
  /** Modelo do título: "{placa} · {modelo}" */
  titulo: string;
  subtitulo: string | null;
  busca: string[];
  ordem: [string, "asc" | "desc"][];
  visual: "cartoes" | "tabela";
  /** Campo select usado como colunas do quadro (ou null). */
  quadro: string | null;
  wa: { campo: string; msg: string } | null;
  filhos: { tabela: string; campo: string; rotulo: string }[];
  campos: Campo[];
  semForm: boolean;
  feminino: boolean;
  /** "Dar baixa": marca o campo de situação como pago e grava a data de hoje (e o inverso, "Estornar"). */
  baixa: { campo: string; pago: string | boolean; data: string | null; aberto: string | boolean; rotulo: string | null } | null;
  /** Parcelar o valor ou repetir todo mês ao cadastrar. */
  parcelar: { valor: string; data: string; texto: string | null } | null;
};

export type Op = "eq" | "neq" | "in" | "gt" | "gte" | "lt" | "lte" | "nulo" | "nao_nulo";
export type ValorRelativo = ["hoje", number] | ["agora", number] | ["mes_ini"] | ["mes_fim"];
export type ValorCondicao = string | number | boolean | string[] | ValorRelativo;
export type Condicao = [campo: string, op: Op, valor?: ValorCondicao];

export type Kpi = {
  rotulo: string;
  tabela: string;
  op: "count" | "sum";
  campo: string | null;
  onde: Condicao[];
  formato: "numero" | "moeda";
  icone: string;
  tom: "marca" | "ok" | "alerta" | "perigo" | "info";
  link: string | null;
  dica: string | null;
};

export type ListaPainel = {
  titulo: string;
  tabela: string;
  onde: Condicao[];
  ordem: [string, "asc" | "desc"];
  limite: number;
  meta: string[];
  vazio: string;
  link: string | null;
  icone: string;
};

export type FonteVencimento = {
  tabela: string;
  campo: string;
  tipo: string;
  onde: Condicao[];
  detalhe: string | null;
  janela: number;
};

export type BlocoRelatorio = {
  tipo: "mensal" | "categoria";
  titulo: string;
  tabela: string;
  campoData: string | null;
  valor: string | null;
  agrupar: string | null;
  onde: Condicao[];
  formato: "numero" | "moeda";
  meses: number;
  dica: string | null;
};

export type Registro = { id: string; created_at: string } & Record<string, unknown>;
/** { tabela: { id: "rótulo" } } — nomes legíveis de registros referenciados. */
export type Nomes = Record<string, Record<string, string>>;
