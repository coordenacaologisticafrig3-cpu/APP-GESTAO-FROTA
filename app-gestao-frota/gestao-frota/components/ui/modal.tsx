"use client";

/**
 * Janela (modal) genérica com o <dialog> nativo: foco preso, Esc fecha, clique fora fecha.
 *
 *   const [aberto, setAberto] = useState(false);
 *   <Modal aberto={aberto} onFechar={() => setAberto(false)} titulo="Novo cliente">...</Modal>
 */
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function Modal({
  aberto,
  onFechar,
  titulo,
  children,
  className,
}: {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  children: React.ReactNode;
  className?: string;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    if (aberto && !d.open) d.showModal();
    if (!aberto && d.open) d.close();
  }, [aberto]);

  return (
    <dialog
      ref={dialogo}
      onCancel={(e) => {
        e.preventDefault();
        onFechar();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onFechar();
      }}
      aria-labelledby="modal-titulo"
      className={cn(
        "m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-borda bg-superficie p-0 text-texto shadow-xl backdrop:bg-black/50",
        className,
      )}
    >
      {aberto && (
        <div className="p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <h2 id="modal-titulo" className="text-lg font-semibold">
              {titulo}
            </h2>
            <button
              type="button"
              onClick={onFechar}
              className="-mt-2 -mr-2 grid size-11 shrink-0 place-items-center rounded-xl text-texto-2 hover:bg-superficie-2"
              aria-label="Fechar"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
