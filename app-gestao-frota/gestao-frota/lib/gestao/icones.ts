/** Ícones usados pelas telas montadas em config.ts (só os que o app precisa — o resto não entra no pacote). */
import { createElement } from "react";
import { Activity, CalendarClock, Circle, FileWarning, Fuel, IdCard, List, Receipt, Route, TriangleAlert, Truck, UserRound, Wallet, Wrench, type LucideIcon, type LucideProps } from "lucide-react";

const ICONES: Record<string, LucideIcon> = { Activity, CalendarClock, Circle, FileWarning, Fuel, IdCard, List, Receipt, Route, TriangleAlert, Truck, UserRound, Wallet, Wrench };

export const icone = (nome: string): LucideIcon => ICONES[nome] ?? Circle;

/** Ícone pelo nome, para usar como elemento: <IconeDe nome="Truck" className="size-5" />. */
export const IconeDe = ({ nome, ...props }: { nome: string } & LucideProps) => createElement(ICONES[nome] ?? Circle, props);
