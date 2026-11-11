/** Validação (zod) montada a partir dos campos da entidade. Os formulários mandam tudo como texto. */
import { z } from "zod";
import { lerMoeda, somenteDigitos } from "@/lib/formatar";
import type { Campo, Entidade } from "./tipos";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function zodCampo(c: Campo): z.ZodType {
  const obrig = c.obrig;
  const infoObrig = `Informe ${c.rotulo.toLowerCase()}.`;
  switch (c.tipo) {
    case "texto":
    case "longo": {
      const max = c.tipo === "longo" ? 2000 : c.max;
      return z
        .string()
        .trim()
        .max(max, `Máximo de ${max} caracteres.`)
        .refine((v) => !obrig || v !== "", infoObrig)
        .transform((v) => (v === "" ? null : c.maiusculas ? v.toUpperCase() : v));
    }
    case "inteiro":
    case "decimal":
    case "dinheiro":
      return z
        .string()
        .trim()
        .transform((v) => (v === "" ? null : c.tipo === "inteiro" ? Number(v.replace(",", ".")) : lerMoeda(v)))
        .refine((n) => !obrig || n !== null, infoObrig)
        .refine((n) => n === null || Number.isFinite(n), "Número inválido.")
        .refine((n) => n === null || c.tipo !== "inteiro" || Number.isInteger(n), "Use um número inteiro.")
        .refine((n) => n === null || c.min === null || n >= c.min, `O mínimo é ${c.min}.`)
        .refine((n) => n === null || c.maxv === null || n <= c.maxv, `O máximo é ${c.maxv}.`);
    case "data":
      return z
        .string()
        .trim()
        .refine((v) => (v === "" ? !obrig : /^\d{4}-\d{2}-\d{2}$/.test(v)), obrig ? infoObrig : "Data inválida.")
        .transform((v) => (v === "" ? null : v));
    case "datahora":
      return z
        .string()
        .trim()
        .refine((v) => (v === "" ? !obrig : /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)), obrig ? infoObrig : "Data e hora inválidas.")
        .transform((v) => (v === "" ? null : `${v}:00-03:00`));
    case "select":
      return z
        .string()
        .trim()
        .refine((v) => (v === "" ? !obrig : c.opcoes.some((o) => o.valor === v)), obrig ? `Escolha ${c.rotulo.toLowerCase()}.` : "Opção inválida.")
        .transform((v) => (v === "" ? null : v));
    case "telefone":
      return z
        .string()
        .transform((v) => somenteDigitos(v))
        .refine((v) => (v === "" ? !obrig : v.length >= 10 && v.length <= 13), obrig ? "WhatsApp com DDD, ex.: (11) 90000-0000." : "Telefone com DDD, ex.: (11) 90000-0000.")
        .transform((v) => (v === "" ? null : v));
    case "email":
      return z
        .string()
        .trim()
        .max(120, "Máximo de 120 caracteres.")
        .refine((v) => (v === "" ? !obrig : EMAIL.test(v)), obrig ? infoObrig : "E-mail inválido.")
        .transform((v) => (v === "" ? null : v));
    case "ref":
      return z
        .string()
        .trim()
        .refine((v) => (v === "" ? !obrig : UUID.test(v)), obrig ? `Escolha ${c.rotulo.toLowerCase()}.` : "Registro inválido.")
        .transform((v) => (v === "" ? null : v));
    default:
      return z.any();
  }
}

export function esquemaDe(e: Entidade) {
  const forma: Record<string, z.ZodType> = {
    id: z
      .string()
      .refine((v) => v === "" || UUID.test(v), "Registro inválido.")
      .transform((v) => (v === "" ? null : v)),
  };
  for (const c of e.campos) {
    if (c.tipo === "calc" || c.tipo === "bool" || c.soLeitura) continue;
    forma[c.nome] = zodCampo(c);
  }
  return z.object(forma);
}

/** Valores "vazios" para campos que o navegador não enviar (assim a validação mostra a mensagem certa). */
export function vazios(e: Entidade) {
  const v: Record<string, string> = { id: "" };
  for (const c of e.campos) if (c.tipo !== "calc" && c.tipo !== "bool" && !c.soLeitura) v[c.nome] = "";
  return v;
}
