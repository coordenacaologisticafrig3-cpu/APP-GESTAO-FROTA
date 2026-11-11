"use client";

/** Formulário de cadastro montado a partir dos campos da entidade (lib/gestao/config.ts). */
import { Botao } from "@/components/ui/botao";
import { AreaTexto, Campo, Entrada, Selecao } from "@/components/ui/campo";
import { agoraParaInput, hoje, paraInputDataHora } from "@/lib/datas";
import { formatarTelefone } from "@/lib/formatar";
import { salvarRegistro } from "@/lib/gestao/acoes";
import type { Campo as CampoMeta, Entidade, Registro } from "@/lib/gestao/tipos";
import { useAcao } from "@/lib/use-acao";

export type OpcoesRef = Record<string, { id: string; rotulo: string }[]>;
export type Pai = { campo: string; id: string; rotulo: string; rota: string };

function valorInicial(c: CampoMeta, r: Registro | undefined, pai: Pai | null): string {
  if (r) {
    const v = r[c.nome];
    if (v === null || v === undefined) return "";
    if (c.tipo === "datahora") return paraInputDataHora(String(v));
    if (c.tipo === "telefone") return formatarTelefone(String(v));
    if (c.tipo === "dinheiro" || c.tipo === "decimal") return String(v).replace(".", ",");
    return String(v);
  }
  if (c.tipo === "ref" && pai && pai.campo === c.nome) return pai.id;
  if (c.padrao === "hoje") return hoje();
  if (c.padrao === "agora") return agoraParaInput();
  if (c.padrao === null || c.padrao === undefined) return c.tipo === "select" && c.obrig && c.opcoes[0] ? c.opcoes[0].valor : "";
  return String(c.padrao).replace(".", c.tipo === "inteiro" ? "" : ",");
}

export function FormGenerico({
  entidade: e,
  registro,
  opcoes,
  pai,
  aoFechar,
}: {
  entidade: Entidade;
  registro?: Registro;
  opcoes: OpcoesRef;
  pai: Pai | null;
  aoFechar: () => void;
}) {
  const { onSubmit, erros, pendente } = useAcao(salvarRegistro, { aoSucesso: aoFechar });
  const campos = e.campos.filter((c) => c.tipo !== "calc" && !c.soLeitura);
  const primeiroTexto = campos.find((c) => c.tipo === "texto")?.nome;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <input type="hidden" name="_tabela" value={e.tabela} />
      <input type="hidden" name="id" value={registro?.id ?? ""} />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
        {campos.map((c) => {
          const inicial = valorInicial(c, registro, pai);
          const largura = c.cheia || c.tipo === "longo" ? "sm:col-span-2" : undefined;
          if (c.tipo === "bool") {
            return (
              <label key={c.nome} className="flex min-h-11 items-center gap-3 text-sm text-texto sm:col-span-2">
                <input
                  type="checkbox"
                  name={c.nome}
                  defaultChecked={registro ? Boolean(registro[c.nome]) : Boolean(c.padrao)}
                  className="size-5 accent-[var(--marca)]"
                />
                {c.rotulo}
              </label>
            );
          }
          return (
            <Campo key={c.nome} rotulo={c.rotulo + (c.obrig ? "" : " (opcional)")} nome={c.nome} erro={erros[c.nome]} ajuda={c.ajuda ?? undefined} className={largura}>
              {(p) => {
                if (c.tipo === "longo") return <AreaTexto {...p} defaultValue={inicial} maxLength={2000} rows={3} placeholder={c.placeholder ?? undefined} />;
                if (c.tipo === "select")
                  return (
                    <Selecao {...p} defaultValue={inicial}>
                      {!c.obrig && <option value="">—</option>}
                      {c.opcoes.map((o) => (
                        <option key={o.valor} value={o.valor}>
                          {o.rotulo}
                        </option>
                      ))}
                    </Selecao>
                  );
                if (c.tipo === "ref")
                  return (
                    <Selecao {...p} defaultValue={inicial}>
                      <option value="">{c.obrig ? "Escolha…" : "—"}</option>
                      {(opcoes[c.nome] ?? []).map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.rotulo}
                        </option>
                      ))}
                    </Selecao>
                  );
                if (c.tipo === "data") return <Entrada {...p} type="date" defaultValue={inicial} />;
                if (c.tipo === "datahora") return <Entrada {...p} type="datetime-local" defaultValue={inicial} />;
                if (c.tipo === "inteiro") return <Entrada {...p} inputMode="numeric" defaultValue={inicial} placeholder={c.placeholder ?? undefined} />;
                if (c.tipo === "decimal" || c.tipo === "dinheiro")
                  return <Entrada {...p} inputMode="decimal" defaultValue={inicial} placeholder={c.placeholder ?? (c.tipo === "dinheiro" ? "0,00" : undefined)} />;
                if (c.tipo === "telefone") return <Entrada {...p} type="tel" inputMode="tel" defaultValue={inicial} placeholder="(11) 90000-0000" />;
                if (c.tipo === "email") return <Entrada {...p} type="email" inputMode="email" defaultValue={inicial} maxLength={120} />;
                return (
                  <Entrada
                    {...p}
                    defaultValue={inicial}
                    maxLength={c.max}
                    placeholder={c.placeholder ?? undefined}
                    autoFocus={!registro && c.nome === primeiroTexto}
                    className={c.maiusculas ? "uppercase" : undefined}
                  />
                );
              }}
            </Campo>
          );
        })}
      </div>
      {e.parcelar && !registro && (
        <fieldset className="rounded-xl border border-borda bg-superficie-2 p-4">
          <legend className="px-1 text-sm font-semibold text-texto">Parcelar ou repetir (opcional)</legend>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
            <Campo rotulo="Número de parcelas" nome="_parcelas" erro={erros._parcelas} ajuda="1 = lançamento único. Máximo 60.">
              {(p) => <Entrada {...p} inputMode="numeric" defaultValue="1" />}
            </Campo>
            <Campo rotulo="Como lançar" nome="_modo" ajuda="As datas seguem de mês em mês, a partir da data informada.">
              {(p) => (
                <Selecao {...p} defaultValue="dividir">
                  <option value="dividir">Dividir o valor total nas parcelas</option>
                  <option value="repetir">Repetir o mesmo valor todo mês</option>
                </Selecao>
              )}
            </Campo>
          </div>
        </fieldset>
      )}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Botao variante="secundario" onClick={aoFechar}>
          Cancelar
        </Botao>
        <Botao type="submit" carregando={pendente}>
          {registro ? "Salvar alterações" : `Cadastrar ${e.singular.toLowerCase()}`}
        </Botao>
      </div>
    </form>
  );
}
