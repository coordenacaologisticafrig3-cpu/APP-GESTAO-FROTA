/**
 * ROTAS PÚBLICAS — o ÚNICO lugar para liberar páginas sem login.
 *
 * Todas as outras rotas exigem usuário logado (o proxy.ts redireciona para /login).
 * A comparação é por prefixo: "/cardapio" libera também "/cardapio/qualquer-coisa".
 *
 * Exemplo (app de cardápio digital): adicione "/cardapio" aqui e crie uma
 * política RLS "to anon" só de SELECT nas tabelas que a página pública lê.
 */
export const ROTAS_PUBLICAS: string[] = [
  "/login",
  "/redefinir-senha", // tela de nova senha (mostra aviso se o link expirou)
  "/auth", // /auth/confirmar recebe o link do e-mail de recuperação
  "/icone", // ícone da aba (favicon) com as iniciais do negócio — aparece também no login
];

/** Para onde o usuário vai depois de entrar (e ao abrir /login já logado). */
export const ROTA_INICIAL = "/";

/** Rotas que só fazem sentido para quem NÃO está logado (logado é mandado para o início). */
export const ROTAS_SO_DESLOGADO: string[] = ["/login"];

function casa(caminho: string, rota: string) {
  return caminho === rota || caminho.startsWith(rota.endsWith("/") ? rota : rota + "/");
}

export function ehRotaPublica(caminho: string) {
  return ROTAS_PUBLICAS.some((rota) => casa(caminho, rota));
}

export function ehRotaSoDeslogado(caminho: string) {
  return ROTAS_SO_DESLOGADO.some((rota) => casa(caminho, rota));
}

/** Aceita só caminhos internos ("/algo") para evitar redirecionamento para outro site. */
export function destinoSeguro(valor: unknown, padrao = ROTA_INICIAL) {
  if (typeof valor !== "string") return padrao;
  if (!valor.startsWith("/") || valor.startsWith("//") || valor.startsWith("/\\")) return padrao;
  return valor;
}
