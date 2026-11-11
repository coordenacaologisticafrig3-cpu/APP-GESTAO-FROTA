import type { Metadata } from "next";
import { PaginaLista } from "@/components/gestao/pagina-lista";

export const metadata: Metadata = { title: "Veículos" };

export default function Pagina({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <PaginaLista tabela="veiculos" searchParams={searchParams} />;
}
