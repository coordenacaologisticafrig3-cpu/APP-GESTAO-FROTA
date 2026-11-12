"use server";

import { z } from "zod";
import { falha, sucesso } from "@/lib/acoes";
import { obterAdministradorAtual } from "@/lib/auth/administrador";
import { criarClienteAdminSupabase } from "@/lib/supabase/admin";

const esquema = z.object({
  email: z.string().trim().email("Informe um e-mail válido.").max(254, "O e-mail é muito longo."),
  senha: z.string().min(8, "A senha deve ter pelo menos 8 caracteres.").max(72, "A senha deve ter no máximo 72 caracteres."),
});

export async function criarUsuario(_anterior: { ok: boolean; mensagem?: string; erros?: Record<string, string> }, formData: FormData) {
  const administrador = await obterAdministradorAtual();
  if (!administrador) return falha("Acesso não autorizado.");

  const dados = esquema.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
  });
  if (!dados.success) {
    const erros: Record<string, string> = {};
    for (const erro of dados.error.issues) {
      const campo = String(erro.path[0] ?? "_");
      if (!erros[campo]) erros[campo] = erro.message;
    }
    return falha("Revise os campos destacados.", erros);
  }

  const supabaseAdmin = criarClienteAdminSupabase();
  const { error } = await supabaseAdmin.auth.admin.createUser({
    email: dados.data.email,
    password: dados.data.senha,
    email_confirm: true,
  });

  if (error) {
    if (error.code === "email_exists" || error.message.toLowerCase().includes("already registered")) {
      return falha("Este e-mail já está cadastrado.", { email: "Escolha outro e-mail." });
    }
    if (error.code === "weak_password") {
      return falha("A senha não atende aos requisitos de segurança.", { senha: "Escolha uma senha mais forte." });
    }
    console.error("[usuarios] Falha ao criar conta no Supabase Auth:", error.code ?? "erro inesperado");
    return falha("Não foi possível criar a conta. Verifique os dados e tente novamente.");
  }

  return sucesso("Usuário criado e pronto para entrar.");
}
