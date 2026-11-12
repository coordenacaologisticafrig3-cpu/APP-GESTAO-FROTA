"use client";

import { KeyRound, UserPlus } from "lucide-react";
import { Botao } from "@/components/ui/botao";
import { Cartao } from "@/components/ui/cartao";
import { Campo, Entrada } from "@/components/ui/campo";
import { criarUsuario } from "./actions";
import { useAcao } from "@/lib/use-acao";

export function FormUsuarios() {
  const cadastro = useAcao(criarUsuario, { toast: false });
  const estado = cadastro.estado;

  return (
    <Cartao className="max-w-2xl">
      <div className="flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-marca-suave text-marca-forte">
          <UserPlus className="size-5" aria-hidden />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-texto">Criar acesso</h2>
          <p className="mt-1 text-sm text-texto-2">A conta poderá entrar imediatamente com o e-mail e a senha definidos aqui.</p>
        </div>
      </div>

      <form onSubmit={cadastro.onSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        <Campo rotulo="E-mail do usuário" nome="email" erro={estado.erros?.email}>
          {(props) => <Entrada {...props} type="email" autoComplete="email" inputMode="email" maxLength={254} required />}
        </Campo>
        <Campo rotulo="Senha inicial" nome="senha" erro={estado.erros?.senha} ajuda="Use pelo menos 8 caracteres. A senha não será exibida novamente após o cadastro.">
          {(props) => <Entrada {...props} type="password" autoComplete="new-password" minLength={8} maxLength={72} required />}
        </Campo>

        {estado.mensagem && !estado.erros && (
          <p role={estado.ok ? "status" : "alert"} className={estado.ok ? "rounded-xl bg-ok-suave p-3 text-sm text-ok" : "rounded-xl bg-perigo-suave p-3 text-sm text-perigo"}>
            {estado.mensagem}
          </p>
        )}

        <div className="flex flex-col gap-3 border-t border-borda pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-xs text-texto-2">
            <KeyRound className="size-4 shrink-0" aria-hidden /> A senha é enviada apenas ao Supabase Auth.
          </p>
          <Botao type="submit" carregando={cadastro.pendente}>
            {cadastro.pendente ? "Criando conta..." : "Criar usuário"}
          </Botao>
        </div>
      </form>
    </Cartao>
  );
}
