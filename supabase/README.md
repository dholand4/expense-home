# Configuração do Supabase (Backend-as-a-Service)

Este diretório contém os scripts de banco de dados, regras de segurança e migração para utilizar o **Supabase** como backend completo do **expense-home**, eliminando a necessidade de rodar ou hospedar um servidor Node.js/Express.

---

## 🚀 Passo a Passo: Configuração Rápida (5 minutos)

### 1. Criar um projeto gratuito no Supabase
1. Acesse [supabase.com](https://supabase.com) e faça login ou crie uma conta.
2. Clique em **"New Project"**.
3. Escolha uma organização, defina um nome (ex: `expense-home`), uma senha forte para o banco de dados e selecione a região mais próxima (ex: `sa-east-1` São Paulo).
4. Aguarde cerca de 1 a 2 minutos até o projeto ser provisionado.

---

### 2. Executar os Scripts no SQL Editor
No painel do seu projeto Supabase:
1. No menu lateral esquerdo, clique no ícone **SQL Editor** (ou tecle `Cmd + K` e digite `SQL Editor`).
2. Clique em **"New query"**.
3. Abra o arquivo [`supabase/schema.sql`](./schema.sql), copie todo o conteúdo, cole no SQL Editor e clique em **"Run"** (ou `Cmd + Enter`).
4. Crie outra query, copie todo o conteúdo de [`supabase/rls_policies.sql`](./rls_policies.sql), cole e clique em **"Run"**.

Pronto! Todas as tabelas, índices, enums, triggers e regras de segurança (Row Level Security) estão configuradas.

---

### 3. Obter as Chaves de Conexão
No painel do Supabase:
1. Vá em **Project Settings** (ícone de engrenagem no rodapé do menu lateral) > **API**.
2. Copie:
   - **Project URL** (ex: `https://xyzcompany.supabase.co`)
   - **Project API Keys** -> chave **`anon`** / **`public`** (ex: `eyJhbGciOi...`)

---

### 4. Configurar no Frontend Web
No diretório `frontend/`:
1. Edite o arquivo `.env` (ou crie a partir de `.env.example`):
   ```env
   VITE_BACKEND_PROVIDER=supabase
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
   ```
2. Inicie o frontend:
   ```bash
   cd frontend
   npm run dev
   ```

### 5. Configurar no Mobile (Expo)
No diretório `mobile/`:
1. Edite o arquivo `.env`:
   ```env
   EXPO_PUBLIC_BACKEND_PROVIDER=supabase
   EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
   ```
2. Inicie o app:
   ```bash
   cd mobile
   npm run start
   ```

---

## 🔄 Alternando entre Supabase e o Backend Node/Express

O projeto foi estruturado para suportar **ambos os backends**:
- Para usar o **Supabase** (sem servidor Node rodando):
  ```env
  VITE_BACKEND_PROVIDER=supabase
  ```
- Para voltar a usar o **Backend Express atual** (porta 3001):
  ```env
  VITE_BACKEND_PROVIDER=custom
  VITE_API_URL=http://localhost:3001/api
  ```

---

## 🔒 Segurança e Autenticação
- O Supabase Auth gerencia usuários, senhas criptografadas e tokens JWT automaticamente.
- A segurança é garantida diretamente no PostgreSQL via **Row Level Security (RLS)**:
  - Cada usuário só acessa seus próprios dados (`created_by = auth.uid()`).
  - Quando um acesso compartilhado é concedido e aceito (`shared_accesses`), a política permite que o convidado visualize as despesas e faturas do proprietário em modo leitura.
- Não há necessidade de middleware de autenticação intermediário.
