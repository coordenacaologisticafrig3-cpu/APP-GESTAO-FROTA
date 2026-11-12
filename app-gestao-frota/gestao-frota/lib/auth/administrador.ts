import "server-only";
import { createClient } from "@/lib/supabase/server";

export const EMAIL_ADMIN_INICIAL = "coordenacaologisticafrig3@gmail.com";

export function ehAdministrador(email?: string | null) {
  return email?.trim().toLowerCase() === EMAIL_ADMIN_INICIAL;
}

export async function obterAdministradorAtual() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || !ehAdministrador(data.user.email)) return null;
  return data.user;
}
