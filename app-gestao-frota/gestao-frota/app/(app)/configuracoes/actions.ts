"use server";

/**
 * MUTATIONS de Configurações — exemplo do PADRÃO do projeto (Server Actions):
 *   1. validar com zod
 *   2. gravar com o cliente Supabase do servidor (respeita RLS)
 *   3. revalidatePath() para as telas mostrarem o dado novo
 *   4. devolver EstadoAcao ({ ok, mensagem, erros }) para o formulário
 *
 * Exemplo de ação de 1 clique com confirmação: app/(app)/personalizacao/botao-restaurar.tsx
 */
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { type EstadoAcao, errosDoZod, falha, lerFormulario, mensagemErroBanco, sucesso } from "@/lib/acoes";
import { somenteDigitos } from "@/lib/formatar";
import { createClient } from "@/lib/supabase/server";

/** Texto opcional: "" vira null no banco. */
const textoOpcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo de ${max} caracteres.`)
    .transform((v) => (v === "" ? null : v));

const esquema = z.object({
  nome_negocio: z.string().trim().min(2, "Informe o nome do negócio.").max(80, "Máximo de 80 caracteres."),
  whatsapp: z
    .string()
    .transform((v) => somenteDigitos(v))
    .refine((v) => v === "" || (v.length >= 10 && v.length <= 13), "WhatsApp com DDD, ex.: (11) 90000-0000.")
    .transform((v) => (v === "" ? null : v)),
  cidade: textoOpcional(80),
  endereco: textoOpcional(160),
  instagram: textoOpcional(60).transform((v) => (v ? v.replace(/^@/, "") : v)),
  mensagem_whatsapp: textoOpcional(500),
});

export async function salvarConfiguracoes(_anterior: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const dados = esquema.safeParse(lerFormulario(formData));
  if (!dados.success) return falha("Confira os campos destacados.", errosDoZod(dados.error));

  const supabase = await createClient();
  // Linha única: "unica = true" + ON CONFLICT garante que sempre exista só uma.
  const { error } = await supabase
    .from("configuracoes")
    .upsert({ unica: true, ...dados.data }, { onConflict: "unica" });

  if (error) {
    console.error("[salvarConfiguracoes]", error);
    return falha(mensagemErroBanco(error));
  }

  // "layout" atualiza também o nome no topo/menu de todas as páginas.
  revalidatePath("/", "layout");
  return sucesso("Configurações salvas.");
}
