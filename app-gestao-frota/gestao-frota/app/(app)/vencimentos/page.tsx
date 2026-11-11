import type { Metadata } from "next";
import { PaginaVencimentos } from "@/components/gestao/vencimentos";

export const metadata: Metadata = { title: "Vencimentos" };

export default function Pagina() {
  return <PaginaVencimentos />;
}
