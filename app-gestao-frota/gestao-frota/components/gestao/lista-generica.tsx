"use client";

/**
 * Tela de cadastro padrão: busca, filtros, lista em cartões (ou tabela), quadro por etapa,
 * janela para criar/editar e exclusão com confirmação. Montada por lib/gestao/config.ts.
 */
import Link from "next/link";
import { CircleCheck, Download, FileUp, MessageCircle, Pencil, Plus, RotateCcw, Search, Trash2, X } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { Botao, classesBotao } from "@/components/ui/botao";
import { CabecalhoPagina, Cartao } from "@/components/ui/cartao";
import { useConfirmar } from "@/components/ui/confirmar";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { darBaixa, excluirRegistro, mudarEtapa } from "@/lib/gestao/acoes";
import { ENTIDADES } from "@/lib/gestao/config";
import { icone } from "@/lib/gestao/icones";
import type { Entidade, Nomes, Registro } from "@/lib/gestao/tipos";
import { Valor, aplicarModelo, normalizar, rotuloDe, textoBusca } from "@/lib/gestao/valor";
import { linkWhatsApp } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { FormGenerico, type OpcoesRef, type Pai } from "./form-generico";
import { ImportarCsv } from "./importar-csv";

const PONTO = { neutro: "bg-texto-2", marca: "bg-marca", ok: "bg-ok", alerta: "bg-alerta", perigo: "bg-perigo", info: "bg-info" } as const;
const BORDA = { neutro: "border-l-borda", marca: "border-l-marca", ok: "border-l-ok", alerta: "border-l-alerta", perigo: "border-l-perigo", info: "border-l-info" } as const;

export function ListaGenerica({
  entidade: e,
  linhas,
  nomes,
  opcoes,
  pai,
  abrirNovo,
}: {
  entidade: Entidade;
  linhas: Registro[];
  nomes: Nomes;
  opcoes: OpcoesRef;
  pai: Pai | null;
  abrirNovo: boolean;
}) {
  const [editando, setEditando] = useState<Registro | "novo" | null>(abrirNovo ? "novo" : null);
  const [busca, setBusca] = useState("");
  const [filtros, setFiltros] = useState<Record<string, string>>({});
  const [visao, setVisao] = useState<"lista" | "quadro">("lista");
  const [importando, setImportando] = useState(false);
  const confirmar = useConfirmar();
  const toast = useToast();
  const [, iniciar] = useTransition();
  const Icone = icone(e.icone);
  const novo_ = e.feminino ? "Nova" : "Novo";
  const nenhum_ = e.feminino ? "Nenhuma" : "Nenhum";

  const camposFiltro = e.campos.filter((c) => c.tipo === "select" && c.filtro);
  const camposLista = e.campos.filter((c) => c.lista && !c.destaque);
  const camposSelo = e.campos.filter((c) => c.destaque);

  const filtradas = useMemo(() => {
    const termo = normalizar(busca.trim());
    return linhas.filter((l) => {
      if (termo && !textoBusca(e, l, nomes).includes(termo)) return false;
      for (const [campo, valor] of Object.entries(filtros)) if (valor && l[campo] !== valor) return false;
      return true;
    });
  }, [linhas, busca, filtros, e, nomes]);

  function excluir(l: Registro) {
    void (async () => {
      const ok = await confirmar({
        titulo: `Excluir “${rotuloDe(e, l, nomes)}”?`,
        mensagem: "Isso não pode ser desfeito.",
        perigo: true,
      });
      if (!ok) return;
      iniciar(async () => {
        const r = await excluirRegistro(e.tabela, l.id);
        if (r.ok) toast.sucesso(r.mensagem ?? "Excluído.");
        else toast.erro(r.mensagem ?? "Não foi possível excluir.");
      });
    })();
  }

  function mover(l: Registro, campo: string, valor: string) {
    iniciar(async () => {
      const r = await mudarEtapa(e.tabela, l.id, campo, valor);
      if (r.ok) toast.sucesso(r.mensagem ?? "Movido.");
      else toast.erro(r.mensagem ?? "Não foi possível mover.");
    });
  }

  function baixar(l: Registro, desfazer: boolean) {
    iniciar(async () => {
      const r = await darBaixa(e.tabela, l.id, desfazer);
      if (r.ok) toast.sucesso(r.mensagem ?? "Pronto.");
      else toast.erro(r.mensagem ?? "Não foi possível dar baixa.");
    });
  }

  function botaoBaixa(l: Registro, compacto = false) {
    if (!e.baixa) return null;
    const pago = l[e.baixa.campo] === e.baixa.pago;
    const rotulo = pago ? "Estornar" : (e.baixa.rotulo ?? "Dar baixa");
    const Ic = pago ? RotateCcw : CircleCheck;
    return (
      <Botao
        variante={pago ? "fantasma" : "secundario"}
        className={pago ? undefined : "border-ok/40 text-ok"}
        onClick={() => baixar(l, pago)}
        aria-label={`${rotulo}: ${rotuloDe(e, l, nomes)}`}
        title={rotulo}
      >
        <Ic className="size-4" aria-hidden /> {!compacto && rotulo}
      </Botao>
    );
  }

  function acoes(l: Registro) {
    const telefone = e.wa ? String(l[e.wa.campo] ?? "") : "";
    const msg = e.wa ? aplicarModelo(e.wa.msg.replace("{titulo}", rotuloDe(e, l, nomes)), e, l, nomes) : "";
    return (
      <div className="mt-auto flex flex-wrap items-center gap-1 pt-1">
        {e.filhos.map((f) => {
          const filho = ENTIDADES[f.tabela];
          return filho ? (
            <Link
              key={f.tabela + f.campo}
              href={`/${filho.rota}?${f.campo}=${l.id}`}
              className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-marca-forte hover:bg-marca-suave"
            >
              {f.rotulo}
            </Link>
          ) : null;
        })}
        {telefone && (
          <a
            href={linkWhatsApp(telefone, msg)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-whats px-3 text-sm font-semibold text-white hover:opacity-90 dark:text-black"
          >
            <MessageCircle className="size-4" aria-hidden /> WhatsApp
          </a>
        )}
        {botaoBaixa(l)}
        {!e.semForm && (
          <Botao variante="fantasma" onClick={() => setEditando(l)} aria-label={`Editar ${rotuloDe(e, l, nomes)}`}>
            <Pencil className="size-4" aria-hidden /> Editar
          </Botao>
        )}
        <Botao variante="fantasma" className="text-perigo" onClick={() => excluir(l)} aria-label={`Excluir ${rotuloDe(e, l, nomes)}`}>
          <Trash2 className="size-4" aria-hidden /> Excluir
        </Botao>
      </div>
    );
  }

  function acento(l: Registro) {
    const c = camposSelo.find((x) => x.tipo === "select");
    const o = c?.opcoes.find((x) => x.valor === l[c.nome]);
    return BORDA[o?.tom ?? "neutro"];
  }

  function titulo(l: Registro) {
    const sub = e.subtitulo ? aplicarModelo(e.subtitulo, e, l, nomes) : "";
    return (
      <div className="flex items-start justify-between gap-2">
        <span className="mr-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-marca-suave text-marca-forte" aria-hidden>
          <Icone className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="break-words font-semibold text-texto">{rotuloDe(e, l, nomes)}</h2>
          {sub && <p className="mt-0.5 break-words text-sm text-texto-2">{sub}</p>}
        </div>
        {camposSelo.length > 0 && (
          <div className="flex shrink-0 flex-wrap justify-end gap-1">
            {camposSelo.map((c) => (
              <Valor key={c.nome} campo={c} valor={l[c.nome]} nomes={nomes} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const novo = !e.semForm && (
    <Botao onClick={() => setEditando("novo")}>
      <Plus className="size-5" aria-hidden /> {novo_} {e.singular.toLowerCase()}
    </Botao>
  );

  const quadro = e.quadro ? e.campos.find((c) => c.nome === e.quadro) : undefined;

  return (
    <>
      <CabecalhoPagina
        titulo={e.plural}
        descricao={e.descricao}
        acoes={
          <>
            {quadro && (
              <div className="inline-flex rounded-xl border border-borda bg-superficie p-1" role="group" aria-label="Forma de exibir">
                {(["lista", "quadro"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={visao === v}
                    onClick={() => setVisao(v)}
                    className={cn(
                      "min-h-9 rounded-lg px-3 text-sm font-semibold",
                      visao === v ? "bg-marca text-marca-texto" : "text-texto-2 hover:text-texto",
                    )}
                  >
                    {v === "lista" ? "Lista" : "Quadro"}
                  </button>
                ))}
              </div>
            )}
            {!e.semForm && (
              <Botao variante="secundario" onClick={() => setImportando(true)}>
                <FileUp className="size-4" aria-hidden /> Importar
              </Botao>
            )}
            {linhas.length > 0 && (
              <a href={`/exportar/${e.rota}`} className={classesBotao("secundario")}>
                <Download className="size-4" aria-hidden /> Exportar
              </a>
            )}
            {novo}
          </>
        }
      />

      {pai && (
        <p className="mb-4 flex flex-wrap items-center gap-2 rounded-xl bg-marca-suave px-4 py-2 text-sm text-marca-forte">
          Mostrando só: <b>{pai.rotulo}</b>
          <Link href={`/${e.rota}`} className="inline-flex items-center gap-1 font-semibold underline">
            <X className="size-4" aria-hidden /> Ver todos
          </Link>
        </p>
      )}

      {linhas.length > 0 && (
        <div className="mb-4 space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-texto-2" aria-hidden />
            <input
              type="search"
              value={busca}
              onChange={(ev) => setBusca(ev.target.value)}
              placeholder={`Buscar ${e.plural.toLowerCase()}…`}
              aria-label={`Buscar ${e.plural.toLowerCase()}`}
              className="block min-h-11 w-full rounded-xl border border-borda bg-superficie pl-10 pr-3 text-base text-texto placeholder:text-texto-2/70 focus:border-marca focus:outline-none focus:ring-2 focus:ring-foco/40"
            />
          </div>
          {camposFiltro.map((c, idx) => {
            const opcoes = [{ valor: "", rotulo: "Todos", tom: "neutro" as const }, ...c.opcoes];
            const contagem = (valor: string) => (valor ? linhas.filter((l) => l[c.nome] === valor).length : linhas.length);
            if (idx === 0) {
              return (
                <div key={c.nome} className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-[repeat(auto-fit,minmax(8.5rem,1fr))] sm:overflow-visible sm:px-0" role="group" aria-label={`Filtrar por ${c.rotulo.toLowerCase()}`}>
                  {opcoes.map((o) => {
                    const ativo = (filtros[c.nome] ?? "") === o.valor;
                    return (
                      <button
                        key={o.valor}
                        type="button"
                        aria-pressed={ativo}
                        onClick={() => setFiltros((f) => ({ ...f, [c.nome]: o.valor }))}
                        className={cn(
                          "min-w-32 shrink-0 rounded-2xl border bg-superficie p-3 text-left transition-colors sm:min-w-0",
                          ativo ? "border-marca ring-2 ring-marca/30" : "border-borda hover:border-marca/50",
                        )}
                      >
                        <span className="flex items-center gap-2 text-xs font-medium text-texto-2">
                          <span className={cn("size-2.5 rounded-full", PONTO[o.tom])} aria-hidden />
                          {o.rotulo}
                        </span>
                        <span className="mt-1 block text-2xl font-bold leading-none text-texto">{contagem(o.valor)}</span>
                      </button>
                    );
                  })}
                </div>
              );
            }
            return (
              <div key={c.nome} className="flex flex-wrap gap-2" role="group" aria-label={`Filtrar por ${c.rotulo.toLowerCase()}`}>
                {opcoes.map((o) => {
                  const ativo = (filtros[c.nome] ?? "") === o.valor;
                  return (
                    <button
                      key={o.valor}
                      type="button"
                      aria-pressed={ativo}
                      onClick={() => setFiltros((f) => ({ ...f, [c.nome]: o.valor }))}
                      className={cn(
                        "min-h-9 rounded-full border px-3.5 text-sm font-medium",
                        ativo ? "border-marca bg-marca text-marca-texto" : "border-borda bg-superficie text-texto-2 hover:text-texto",
                      )}
                    >
                      {o.rotulo} <span className="opacity-70">{contagem(o.valor)}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {!linhas.length ? (
        <EstadoVazio
          icone={Icone}
          titulo={`${nenhum_} ${e.singular.toLowerCase()} por aqui`}
          descricao={e.vazio || `Cadastre o primeiro para começar.`}
          acao={novo || undefined}
        />
      ) : !filtradas.length ? (
        <EstadoVazio icone={Search} titulo="Nada encontrado" descricao="Tente outra busca ou limpe os filtros." />
      ) : visao === "quadro" && quadro ? (
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
          {quadro.opcoes.map((o) => {
            const col = filtradas.filter((l) => l[quadro.nome] === o.valor);
            return (
              <section key={o.valor} className="w-72 shrink-0 rounded-2xl bg-superficie-2 p-3" aria-label={o.rotulo}>
                <h2 className="mb-3 flex items-center justify-between px-1 text-sm font-semibold text-texto">
                  {o.rotulo}
                  <span className="rounded-full bg-superficie px-2 py-0.5 text-xs text-texto-2">{col.length}</span>
                </h2>
                <ul className="space-y-2">
                  {col.map((l) => (
                    <li key={l.id}>
                      <Cartao className="space-y-2 p-3 sm:p-3">
                        <h3 className="break-words text-sm font-semibold text-texto">{rotuloDe(e, l, nomes)}</h3>
                        {camposLista.slice(0, 3).map((c) => (
                          <p key={c.nome} className="text-xs text-texto-2">
                            {c.rotulo}: <span className="font-medium text-texto"><Valor campo={c} valor={l[c.nome]} nomes={nomes} /></span>
                          </p>
                        ))}
                        <select
                          value={String(l[quadro.nome] ?? "")}
                          onChange={(ev) => mover(l, quadro.nome, ev.target.value)}
                          aria-label={`Mover ${rotuloDe(e, l, nomes)}`}
                          className="block min-h-10 w-full rounded-lg border border-borda bg-superficie px-2 text-sm text-texto"
                        >
                          {quadro.opcoes.map((x) => (
                            <option key={x.valor} value={x.valor}>
                              {x.rotulo}
                            </option>
                          ))}
                        </select>
                        <Botao variante="fantasma" className="w-full" onClick={() => setEditando(l)}>
                          <Pencil className="size-4" aria-hidden /> Abrir
                        </Botao>
                      </Cartao>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : e.visual === "tabela" ? (
        <Cartao className="overflow-hidden p-0 sm:p-0">
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="bg-superficie-2 text-xs uppercase tracking-wide text-texto-2">
                <tr>
                  <th className="px-4 py-3 font-semibold">{e.singular}</th>
                  {camposSelo.map((c) => (
                    <th key={c.nome} className="px-3 py-3 font-semibold">
                      {c.rotulo}
                    </th>
                  ))}
                  {camposLista.map((c) => (
                    <th key={c.nome} className="px-3 py-3 font-semibold">
                      {c.rotulo}
                    </th>
                  ))}
                  <th className="px-3 py-3 text-right font-semibold">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borda">
                {filtradas.map((l) => {
                  const sub = e.subtitulo ? aplicarModelo(e.subtitulo, e, l, nomes) : "";
                  return (
                    <tr key={l.id} className="align-top hover:bg-superficie-2/60">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-texto">{rotuloDe(e, l, nomes)}</p>
                        {sub && <p className="text-xs text-texto-2">{sub}</p>}
                      </td>
                      {camposSelo.map((c) => (
                        <td key={c.nome} className="px-3 py-3">
                          <Valor campo={c} valor={l[c.nome]} nomes={nomes} />
                        </td>
                      ))}
                      {camposLista.map((c) => (
                        <td key={c.nome} className="px-3 py-3 text-texto">
                          <Valor campo={c} valor={l[c.nome]} nomes={nomes} />
                        </td>
                      ))}
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-1">
                          {botaoBaixa(l, true)}
                          {!e.semForm && (
                            <Botao variante="fantasma" onClick={() => setEditando(l)} aria-label={`Editar ${rotuloDe(e, l, nomes)}`}>
                              <Pencil className="size-4" aria-hidden />
                            </Botao>
                          )}
                          <Botao variante="fantasma" className="text-perigo" onClick={() => excluir(l)} aria-label={`Excluir ${rotuloDe(e, l, nomes)}`}>
                            <Trash2 className="size-4" aria-hidden />
                          </Botao>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Cartao>
      ) : (
        <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtradas.map((l) => (
            <li key={l.id}>
              <Cartao className={cn("flex h-full flex-col gap-3 border-l-4 transition-shadow hover:shadow-md", acento(l))}>
                {titulo(l)}
                {camposLista.length > 0 && (
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    {camposLista.map((c) => (
                      <div key={c.nome} className="min-w-0">
                        <dt className="text-xs text-texto-2">{c.rotulo}</dt>
                        <dd className="break-words font-medium text-texto">
                          <Valor campo={c} valor={l[c.nome]} nomes={nomes} />
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
                {acoes(l)}
              </Cartao>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-xs text-texto-2">
        {filtradas.length === linhas.length ? `${linhas.length} registro(s)` : `${filtradas.length} de ${linhas.length} registro(s)`}
      </p>

      {!e.semForm && <ImportarCsv entidade={e} aberto={importando} aoFechar={() => setImportando(false)} />}

      <Modal
        aberto={editando !== null}
        onFechar={() => setEditando(null)}
        titulo={editando === "novo" ? `${novo_} ${e.singular.toLowerCase()}` : `Editar ${e.singular.toLowerCase()}`}
        className="max-w-2xl"
      >
        {editando !== null && (
          <FormGenerico
            key={editando === "novo" ? "novo" : editando.id}
            entidade={e}
            registro={editando === "novo" ? undefined : editando}
            opcoes={opcoes}
            pai={pai}
            aoFechar={() => setEditando(null)}
          />
        )}
      </Modal>
    </>
  );
}
