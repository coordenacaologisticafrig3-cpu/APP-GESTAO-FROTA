"use client";

/** Importação de planilha CSV: baixa o modelo, valida a planilha inteira e só grava se estiver tudo certo. */
import { Download, FileUp } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { Botao } from "@/components/ui/botao";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { importarCsv } from "@/lib/gestao/acoes";
import type { Entidade } from "@/lib/gestao/tipos";

export function ImportarCsv({ entidade: e, aberto, aoFechar }: { entidade: Entidade; aberto: boolean; aoFechar: () => void }) {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [problemas, setProblemas] = useState<string[]>([]);
  const [pendente, iniciar] = useTransition();
  const entrada = useRef<HTMLInputElement>(null);
  const toast = useToast();

  function fechar() {
    setArquivo(null);
    setMensagem(null);
    setProblemas([]);
    aoFechar();
  }

  function enviar() {
    if (!arquivo) return;
    iniciar(async () => {
      const texto = await arquivo.text();
      const r = await importarCsv(e.tabela, texto);
      if (r.ok) {
        toast.sucesso(r.mensagem ?? "Importado.");
        fechar();
      } else {
        setMensagem(r.mensagem ?? "Não foi possível importar.");
        setProblemas(r.problemas ?? []);
      }
    });
  }

  return (
    <Modal aberto={aberto} onFechar={fechar} titulo={`Importar ${e.plural.toLowerCase()}`} className="max-w-xl">
      <div className="space-y-4 text-sm text-texto">
        <ol className="list-decimal space-y-1.5 pl-5 text-texto-2">
          <li>
            Baixe o modelo e preencha no Excel ou Google Planilhas (uma linha por registro).
            <a
              href={`/exportar/${e.rota}?modelo=1`}
              className="ml-2 inline-flex items-center gap-1 font-semibold text-marca-forte hover:underline"
            >
              <Download className="size-4" aria-hidden /> Baixar modelo
            </a>
          </li>
          <li>Salve como <b>CSV</b> e escolha o arquivo abaixo.</li>
          <li>O app confere tudo antes de gravar. Se algo estiver errado, ele mostra a linha e nada é importado.</li>
        </ol>
        <p className="rounded-xl bg-superficie-2 p-3 text-xs text-texto-2">
          Datas como 31/12/2026, valores como 1.234,56 e opções com o mesmo nome que aparece no app. Campos ligados a outro cadastro (ex.: cliente) precisam ter o nome igual ao cadastrado.
        </p>
        <div>
          <input
            ref={entrada}
            type="file"
            accept=".csv,text/csv"
            aria-label="Arquivo CSV"
            onChange={(ev) => {
              setArquivo(ev.target.files?.[0] ?? null);
              setMensagem(null);
              setProblemas([]);
            }}
            className="block w-full text-sm text-texto file:mr-3 file:min-h-11 file:rounded-xl file:border-0 file:bg-marca-suave file:px-4 file:font-semibold file:text-marca-forte"
          />
        </div>
        {mensagem && (
          <div role="alert" className="rounded-xl bg-perigo-suave p-3 text-perigo">
            <p className="font-semibold">{mensagem}</p>
            {problemas.length > 0 && (
              <ul className="mt-2 max-h-48 list-disc space-y-0.5 overflow-y-auto pl-5 text-xs">
                {problemas.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Botao variante="secundario" onClick={fechar}>
            Cancelar
          </Botao>
          <Botao onClick={enviar} disabled={!arquivo} carregando={pendente}>
            <FileUp className="size-5" aria-hidden /> Importar
          </Botao>
        </div>
      </div>
    </Modal>
  );
}
