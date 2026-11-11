import type { Metadata } from "next";
import { PaginaRelatorios } from "@/components/gestao/relatorios";

export const metadata: Metadata = { title: "Relatórios" };

export default function Pagina() {
  return <PaginaRelatorios />;
}
