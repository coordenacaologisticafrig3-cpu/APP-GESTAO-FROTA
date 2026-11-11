import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Cartao } from "@/components/ui/cartao";
import { cn } from "@/lib/utils";

const TONS = {
  marca: "bg-marca-suave text-marca-forte",
  ok: "bg-ok-suave text-ok",
  alerta: "bg-alerta-suave text-alerta",
  perigo: "bg-perigo-suave text-perigo",
  info: "bg-info-suave text-info",
} as const;

/** Número grande do painel, com ícone e (opcional) link para a tela de origem. */
export function Kpi({
  rotulo,
  valor,
  icone: Icone,
  tom = "marca",
  link,
  dica,
}: {
  rotulo: string;
  valor: string;
  icone: LucideIcon;
  tom?: keyof typeof TONS;
  link?: string | null;
  dica?: string | null;
}) {
  const corpo = (
    <Cartao className={cn("h-full", link && "transition-colors hover:border-marca")}>
      <div className="flex items-start gap-3">
        <div className={cn("grid size-10 shrink-0 place-items-center rounded-xl", TONS[tom])}>
          <Icone className="size-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-texto-2">{rotulo}</p>
          <p className={cn("mt-0.5 break-words font-bold leading-tight tracking-tight text-texto", valor.length > 11 ? "text-xl" : "text-2xl")}>{valor}</p>
          {dica && <p className="mt-0.5 text-xs text-texto-2">{dica}</p>}
        </div>
      </div>
    </Cartao>
  );
  return link ? (
    <Link href={link} className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca">
      {corpo}
    </Link>
  ) : (
    corpo
  );
}
