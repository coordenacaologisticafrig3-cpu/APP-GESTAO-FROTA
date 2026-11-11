import { PainelInicio } from "@/components/gestao/painel";

export default async function Inicio({ searchParams }: { searchParams: Promise<{ senha?: string }> }) {
  const { senha } = await searchParams;
  return <PainelInicio senhaAlterada={senha === "alterada"} />;
}
