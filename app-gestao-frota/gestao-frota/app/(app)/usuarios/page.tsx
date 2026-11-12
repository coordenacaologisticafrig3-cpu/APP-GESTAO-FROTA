import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CabecalhoPagina } from "@/components/ui/cartao";
import { obterAdministradorAtual } from "@/lib/auth/administrador";
import { FormUsuarios } from "./form-usuarios";

export const metadata: Metadata = { title: "Usuários" };

export default async function PaginaUsuarios() {
  const administrador = await obterAdministradorAtual();
  if (!administrador) notFound();

  return (
    <>
      <CabecalhoPagina
        titulo="Usuários"
        descricao="Gerencie os acessos da equipe à Gestão de Frota."
      />
      <FormUsuarios />
    </>
  );
}
