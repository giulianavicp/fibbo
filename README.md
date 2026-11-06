# fibbo

Plataforma de apoio ao ensino com IA para alunos e professores da FATEC (TCC).

## Stack

- React 18 + Vite + Tailwind 4 + shadcn/ui
- Supabase (auth, Postgres, storage, edge functions)
- Vercel (hosting)

## Rodando localmente

```bash
cp .env.example .env.local   # preencher com a URL e a publishable key do Supabase
pnpm install
pnpm dev
```

## Banco de dados

As migrations ficam em `supabase/migrations`. Os dados de demonstração (contas, disciplinas, envios e apostilas) existem apenas no banco do Supabase e não fazem parte do repositório.

Regras de acesso (RLS): alunos veem apenas os próprios dados e as disciplinas em que estão matriculados; professores veem apenas as próprias disciplinas e seus alunos. Gabaritos e palavras-chave ficam em uma tabela visível só para o professor da disciplina. O gabarito em arquivo (PDF, PNG ou JPG, até 10 MB, bucket `answer-keys`) fica oculto para os alunos até o prazo da atividade. Cada disciplina tem uma unidade FATEC, e uma atividade pode ser publicada de uma vez em disciplinas de até 3 unidades. O login bloqueia a conta por 5 minutos após 3 tentativas erradas. Esse bloqueio é aplicado pelo app, não pelo servidor de autenticação, e pode ser contornado por quem chamar a API do Supabase Auth diretamente; a proteção de força bruta do próprio Supabase continua valendo.

A conta de professor de demonstração tem um botão em Perfil que restaura os dados de demonstração (`reset_demo`). Contas de demonstração não podem ser excluídas.

## Privacidade (LGPD)

- `/privacidade` e `/termos` descrevem os dados tratados e os fornecedores (Supabase, Vercel, Google Gemini no plano gratuito, Brevo para os e-mails).
- Em Perfil → Seus dados, qualquer usuário baixa um JSON com seus dados ou exclui a conta (edge function `delete-account`, que remove o usuário, os dados em cascata e os PDFs do professor).

## E-mails

Os modelos em pt-BR ficam em `supabase/templates` e são colados em Authentication → Emails → Templates no painel do Supabase.

## Estrutura

```
src/app
├── auth/       login e sessão
├── legal/      privacidade, termos e ajuda
├── lib/        tokens de design, cliente supabase
├── shared/     componentes comuns (ui, feedback, seus dados)
├── student/    app do aluno
└── teacher/    app do professor
```

## Rotas

| rota | quem acessa |
|---|---|
| `/` | login |
| `/cadastro` | criar conta |
| `/esqueci-senha`, `/redefinir-senha` | recuperação de senha |
| `/privacidade`, `/termos`, `/ajuda` | público |
| `/aluno/:page` | aluno (home, disciplinas, atividades, katherine, correcoes, perfil) |
| `/professor/:page` | professor (dashboard, turmas, disciplinas, atividades, provas, correcoes, analytics, relatorios, perfil) |
