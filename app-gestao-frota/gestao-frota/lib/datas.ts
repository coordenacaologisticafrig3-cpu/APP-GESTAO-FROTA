/**
 * Datas no fuso de São Paulo (sem horário de verão desde 2019: sempre UTC-3).
 * "Data" = texto "AAAA-MM-DD" (igual ao <input type="date">).
 */
import { FUSO, hojeISO } from "@/lib/formatar";

export const hoje = () => hojeISO();

/** Soma (ou subtrai) dias de uma data "AAAA-MM-DD". */
export function somarDias(data: string, dias: number) {
  const d = new Date(`${data}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** Quantos dias de `de` até `ate` (negativo se `ate` é antes). */
export function diasEntre(de: string, ate: string) {
  const a = Date.UTC(Number(de.slice(0, 4)), Number(de.slice(5, 7)) - 1, Number(de.slice(8, 10)));
  const b = Date.UTC(Number(ate.slice(0, 4)), Number(ate.slice(5, 7)) - 1, Number(ate.slice(8, 10)));
  return Math.round((b - a) / 86400000);
}

export const inicioDoMes = (data: string = hoje()) => `${data.slice(0, 8)}01`;

export function fimDoMes(data: string = hoje()) {
  const ano = Number(data.slice(0, 4));
  const mes = Number(data.slice(5, 7));
  return new Date(Date.UTC(ano, mes, 0)).toISOString().slice(0, 10);
}

/** Soma meses ao primeiro dia do mês de `data`. */
export function somarMeses(data: string, meses: number) {
  const d = new Date(Date.UTC(Number(data.slice(0, 4)), Number(data.slice(5, 7)) - 1 + meses, 1));
  return d.toISOString().slice(0, 10);
}

const NOMES_MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
/** "2025-03-01" → "mar/25" */
export const nomeMes = (data: string) => `${NOMES_MES[Number(data.slice(5, 7)) - 1]}/${data.slice(2, 4)}`;

const fmtDia = new Intl.DateTimeFormat("en-CA", { timeZone: FUSO });
const fmtHoraMin = new Intl.DateTimeFormat("en-GB", { timeZone: FUSO, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

/** Data/hora do banco (timestamptz) → dia local "AAAA-MM-DD". */
export function diaLocal(valor: string | Date) {
  return fmtDia.format(typeof valor === "string" ? new Date(valor) : valor);
}

/** timestamptz → valor do <input type="datetime-local"> ("2025-03-10T14:30") no horário de Brasília. */
export function paraInputDataHora(valor: string | null | undefined) {
  if (!valor) return "";
  const d = new Date(valor);
  if (isNaN(d.getTime())) return "";
  return `${fmtDia.format(d)}T${fmtHoraMin.format(d)}`;
}

/** Agora, no formato do <input type="datetime-local">. */
export const agoraParaInput = () => paraInputDataHora(new Date().toISOString());
