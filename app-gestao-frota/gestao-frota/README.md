# Gestão de Frota — Next.js + Supabase

Controle de veículos, motoristas, abastecimentos, manutenções, multas e vencimentos (exemplo fictício: **Transportes Vale do Sol**). Para transportadoras, empresas de entregas, construtoras, prestadores de serviço e qualquer negócio com carros, vans ou caminhões. Funciona no celular e no computador, a equipe inteira usa os mesmos dados, com login, banco na nuvem (Supabase) e hospedagem grátis (Vercel).

**Telas:** Login · Esqueci minha senha · Início (painel do dia) · Motoristas · Veículos · Viagens e rotas · Abastecimentos · Manutenções · Despesas da frota · Multas · Vencimentos · Relatórios · Configurações · Personalização (logo, cores, fonte, nome exibido)
**Tabelas:** `configuracoes`, `motoristas`, `veiculos`, `viagens`, `abastecimentos`, `manutencoes`, `despesas`, `multas` · **Storage:** pasta pública `marca` (logo)

**Destaques:** cada abastecimento atualiza a quilometragem do veículo e calcula o R$/litro sozinho · a tela **Vencimentos** reúne CRLV, IPVA, seguro, CNH, revisões e multas do mais urgente ao mais distante · **viagens** com os km rodados de cada saída · **despesas** parceláveis (IPVA, seguro) com baixa em um clique · manutenções em **quadro** (agendada → em andamento → concluída) · WhatsApp direto para o motorista.

> Os cadastros, o painel, os vencimentos e os relatórios são montados a partir de `lib/gestao/config.ts` (veja o fim do `COMO-ESTENDER.md`): para acrescentar um campo, crie a coluna no `schema.sql` e inclua-o ali.

---

## Passo a passo (do zero ao ar)

Você vai precisar de contas gratuitas em: [supabase.com](https://supabase.com), [github.com](https://github.com) e [vercel.com](https://vercel.com).

### 1. Criar o projeto no Supabase
1. Entre no Supabase ▸ **New project**.
2. Dê um nome (ex.: `studio-da-ana`), crie uma senha forte para o banco (guarde-a) e escolha a região **South America (São Paulo)**.
3. Aguarde uns 2 minutos até o projeto ficar pronto.

> Dica: crie **um projeto Supabase por cliente**. Assim os dados de cada negócio ficam separados.

### 2. Criar as tabelas (schema.sql)
1. No menu lateral, abra **SQL Editor** ▸ **New query**.
2. Abra o arquivo [`supabase/schema.sql`](supabase/schema.sql) deste projeto, copie **tudo** e cole no editor.
3. Clique em **Run**. Deve aparecer "Success. No rows returned".

Pode rodar de novo sem medo: o script não apaga dados.

### 3. (Opcional) Dados de exemplo (seed.sql)
Para demonstrar o app com dados fictícios: nova query ▸ cole [`supabase/seed.sql`](supabase/seed.sql) ▸ **Run**.
Para o cliente real, pule este passo (ou edite tudo depois na tela Configurações).

### 4. Criar o usuário de acesso
1. **Authentication ▸ Users ▸ Add user ▸ Create new user**.
2. Informe e-mail e senha e marque **Auto Confirm User**.
3. Repita para cada pessoa da equipe. Todos os usuários logados veem e editam os mesmos dados.

### 5. Desligar o cadastro público
**Authentication ▸ Sign In / Providers** (ou *Settings*) ▸ desmarque **Allow new users to sign up** ▸ **Save**.
Assim ninguém de fora consegue criar conta — só você, pelo painel.

### 6. Subir o código no GitHub
1. No GitHub, **New repository** (pode ser privado).
2. Envie os arquivos desta pasta (pelo GitHub Desktop, VS Code ou arrastando os arquivos em *uploading an existing file*).
   Não envie a pasta `node_modules` nem o arquivo `.env.local` (o `.gitignore` já cuida disso).

### 7. Importar na Vercel
Vercel ▸ **Add New ▸ Project** ▸ escolha o repositório ▸ ainda **não** clique em Deploy.

### 8. Colar as 2 variáveis de ambiente
Na mesma tela, abra **Environment Variables** e adicione:

| Nome | Onde achar no Supabase |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings ▸ API (ou botão **Connect**) ▸ *Project URL* |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Mesma tela ▸ chave **anon public** (ou **publishable**, `sb_publishable_...`) |

Se o seu projeto só mostrar a chave *publishable*, você pode usar o nome `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` no lugar da anon.
**Nunca** use a chave `service_role` / `secret`.

### 9. Deploy
Clique em **Deploy**. Em 1–2 minutos o app está no ar em `https://seu-projeto.vercel.app`.
Se aparecer a tela "Configure as variáveis de ambiente", confira os nomes/valores e faça **Redeploy**.

**Último ajuste (para o "Esqueci minha senha" funcionar):** no Supabase, **Authentication ▸ URL Configuration**:
- **Site URL:** o endereço da Vercel (ex.: `https://seu-projeto.vercel.app`)
- **Redirect URLs:** adicione `https://seu-projeto.vercel.app/**` (e `http://localhost:3000/**` para testes locais).

### 10. Rodar no seu computador (opcional)
Precisa do [Node.js](https://nodejs.org) 20 ou mais novo.
```bash
npm install
cp .env.example .env.local   # no Windows: copy .env.example .env.local
# edite .env.local com a URL e a chave do Supabase
npm run dev
```
Abra http://localhost:3000.

---

## Recuperação de senha
Na tela de login, **Esqueci minha senha** envia um e-mail com um link. O link abre `/redefinir-senha`, onde a pessoa cria a nova senha.

- O e-mail padrão do Supabase tem limite de poucos envios por hora. Para uso real, configure um SMTP próprio em **Authentication ▸ Emails ▸ SMTP Settings**.
- O link deve ser aberto **no mesmo navegador** em que foi pedido. Para que funcione em qualquer navegador, edite o template **Authentication ▸ Emails ▸ Reset Password** e troque o link por:
  `{{ .SiteURL }}/auth/confirmar?token_hash={{ .TokenHash }}&type=recovery&next=/redefinir-senha`

## Personalizar sem código (logo, cores e fonte)
A marca do cliente se troca **dentro do próprio app**, sem mexer em código: menu ▸ **Personalização**.

1. **Logo:** clique em **Enviar logo** (PNG, JPG, SVG ou WebP até 1 MB; quadrada e com fundo transparente fica melhor). Ela aparece no menu, no topo do celular, na tela de login e no ícone da aba do navegador. Sem logo, o app mostra as iniciais do nome.
2. **Cores:** escolha uma das 8 paletas prontas com 1 clique ou monte a sua (cor principal + cor de destaque, pelo seletor ou digitando o código `#RRGGBB`). O app calcula sozinho a cor do texto (branco ou preto) e avisa se a combinação ficar difícil de ler.
3. **Fonte:** Moderna, Elegante, Amigável, Clássica, Técnica ou Divertida.
4. **Nome exibido e subtítulo** (ex.: "Studio Bella Forma" / "Agenda online"), **tema padrão** (claro, escuro ou seguir o sistema — cada pessoa ainda pode trocar no botão de sol/lua) e **arredondamento** dos cantos.
5. Confira na **Prévia ao vivo** (app e login, claro e escuro) e clique em **Salvar**. Mudou de ideia? **Restaurar padrão**.

> A logo fica no Supabase ▸ **Storage** ▸ pasta `marca` (criada pelo `schema.sql`). Se aparecer "A pasta de arquivos marca não existe", rode o `schema.sql` de novo.
> Os dados de contato (WhatsApp, endereço, mensagem padrão) continuam em **Configurações**.

## Personalizar com IA
Abra a pasta no [Claude Code](https://claude.com/claude-code) (ou cole os arquivos no Claude) e peça, por exemplo:

- "Adicione mais uma paleta pronta chamada 'Menta' na tela Personalização (lib/marca.ts)."
- "Mostre a logo do negócio no topo do recibo impresso usando o componente LogoNegocio."
- "Mude o nome padrão do produto para 'Agenda da Ana' em `lib/navegacao.ts` (usado enquanto o dono não preencher o nome exibido)."
- "Crie uma tabela `clientes` (nome, telefone, observações) com tela de lista, cadastro, edição e exclusão com confirmação, seguindo o COMO-ESTENDER.md."
- "Adicione um botão de WhatsApp em cada cliente usando a mensagem padrão das Configurações."
- "Adicione um campo 'horário de funcionamento' em Configurações (schema.sql, tipos e formulário)."

O arquivo [`COMO-ESTENDER.md`](COMO-ESTENDER.md) explica a estrutura do projeto e os padrões que a IA deve seguir.

## Tecnologias
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase (Postgres + Auth + Storage) · lucide-react · zod
