/**
 * MENU DO APP — sidebar (computador) e barra inferior (celular) são geradas daqui.
 * No celular aparecem no máximo 4 itens com `celular: true`; o restante vai para o botão "Mais".
 */
import { BarChart3, CalendarClock, Fuel, Home, Palette, Route, Settings, TriangleAlert, Truck, UserRound, Wallet, Wrench, type LucideIcon } from "lucide-react";

export type ItemNavegacao = {
  titulo: string;
  href: string;
  icone: LucideIcon;
  /** Mostrar direto na barra inferior do celular (máx. 4). Padrão: false. */
  celular?: boolean;
};

export const NAVEGACAO: ItemNavegacao[] = [
  { titulo: "Início", href: "/", icone: Home, celular: true },
  { titulo: "Veículos", href: "/veiculos", icone: Truck, celular: true },
  { titulo: "Motoristas", href: "/motoristas", icone: UserRound },
  { titulo: "Viagens e rotas", href: "/viagens", icone: Route, celular: true },
  { titulo: "Abastecimentos", href: "/abastecimentos", icone: Fuel, celular: true },
  { titulo: "Manutenções", href: "/manutencoes", icone: Wrench },
  { titulo: "Despesas da frota", href: "/despesas", icone: Wallet },
  { titulo: "Multas", href: "/multas", icone: TriangleAlert },
  { titulo: "Vencimentos", href: "/vencimentos", icone: CalendarClock, celular: true },
  { titulo: "Relatórios", href: "/relatorios", icone: BarChart3 },
  { titulo: "Configurações", href: "/configuracoes", icone: Settings },
  { titulo: "Personalização", href: "/personalizacao", icone: Palette },
];

export const NOME_APP = "Gestão de Frota";
export const DESCRICAO_APP = "Controle de veículos, motoristas, abastecimentos, manutenções, multas e vencimentos";

/** Item ativo: "/" só quando exato; demais por prefixo. */
export function itemAtivo(caminho: string, href: string) {
  if (href === "/") return caminho === "/";
  return caminho === href || caminho.startsWith(href + "/");
}
