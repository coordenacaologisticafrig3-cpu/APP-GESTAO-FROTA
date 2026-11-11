"use client";

/**
 * Formulário padrão do projeto: useAcao(serverAction) + <form onSubmit> + <Botao carregando>.
 * O hook mostra o toast de sucesso/erro e devolve os erros por campo.
 */
import Link from "next/link";
import { Palette } from "lucide-react";
import { Botao } from "@/components/ui/botao";
import { AreaTexto, Campo, Entrada } from "@/components/ui/campo";
import { Cartao } from "@/components/ui/cartao";
import { formatarTelefone } from "@/lib/formatar";
import type { Configuracoes } from "@/lib/tipos";
import { useAcao } from "@/lib/use-acao";
import { salvarConfiguracoes } from "./actions";

export function FormConfiguracoes({ config }: { config: Configuracoes }) {
  const { onSubmit, erros: e, pendente } = useAcao(salvarConfiguracoes);

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <Cartao className="space-y-4">
        <h2 className="text-base font-semibold text-texto">Negócio</h2>
        <Campo rotulo="Nome do negócio" nome="nome_negocio" erro={e.nome_negocio}>
          {(p) => <Entrada {...p} defaultValue={config.nome_negocio} required maxLength={80} autoComplete="organization" />}
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="WhatsApp" nome="whatsapp" erro={e.whatsapp} ajuda="Com DDD. Ex.: (11) 90000-0000">
            {(p) => (
              <Entrada
                {...p}
                type="tel"
                inputMode="tel"
                defaultValue={formatarTelefone(config.whatsapp)}
                placeholder="(11) 90000-0000"
                autoComplete="tel"
              />
            )}
          </Campo>
          <Campo rotulo="Instagram" nome="instagram" erro={e.instagram}>
            {(p) => <Entrada {...p} defaultValue={config.instagram ?? ""} placeholder="@seunegocio" />}
          </Campo>
          <Campo rotulo="Cidade" nome="cidade" erro={e.cidade}>
            {(p) => <Entrada {...p} defaultValue={config.cidade ?? ""} placeholder="São Paulo - SP" />}
          </Campo>
          <Campo rotulo="Endereço" nome="endereco" erro={e.endereco}>
            {(p) => <Entrada {...p} defaultValue={config.endereco ?? ""} placeholder="Rua, número, bairro" />}
          </Campo>
        </div>
      </Cartao>

      <Cartao className="space-y-4">
        <h2 className="text-base font-semibold text-texto">Mensagens</h2>
        <Campo
          rotulo="Mensagem padrão do WhatsApp"
          nome="mensagem_whatsapp"
          erro={e.mensagem_whatsapp}
          ajuda="Pode usar {nome} para o nome do cliente."
        >
          {(p) => <AreaTexto {...p} defaultValue={config.mensagem_whatsapp ?? ""} maxLength={500} rows={3} />}
        </Campo>
      </Cartao>

      <Link
        href="/personalizacao"
        className="flex min-h-11 items-center gap-3 rounded-2xl border border-dashed border-borda p-4 text-sm text-texto-2 hover:bg-superficie-2"
      >
        <Palette className="size-5 shrink-0 text-marca-forte" aria-hidden />
        <span>
          <strong className="text-texto">Logo, cores e fonte</strong> ficam em{" "}
          <span className="font-medium text-marca-forte underline">Personalização</span>.
        </span>
      </Link>

      <div className="flex justify-end">
        <Botao type="submit" carregando={pendente} className="w-full sm:w-auto">
          {pendente ? "Salvando..." : "Salvar configurações"}
        </Botao>
      </div>
    </form>
  );
}
