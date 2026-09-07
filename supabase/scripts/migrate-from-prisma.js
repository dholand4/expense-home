/**
 * Script de migração de dados do banco local (Prisma / JSON) para o Supabase.
 *
 * Como usar:
 * 1. Exporte os dados atuais usando: cd backend && node scripts/export-data.js
 * 2. Defina as variáveis no seu .env ou passe como argumento:
 *    SUPABASE_URL=https://xyz.supabase.co SUPABASE_SERVICE_ROLE_KEY=ey... node supabase/scripts/migrate-from-prisma.js backend/exports/backup-YYYY-MM-DD.json
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(process.cwd(), 'backend/.env') });
config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERRO: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios.');
  console.error('Nota: Use a chave "service_role" do Supabase para realizar a migração ignorando RLS.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const jsonPath = process.argv[2];
  if (!jsonPath || !existsSync(jsonPath)) {
    console.error(`ERRO: Arquivo de backup não encontrado em: ${jsonPath}`);
    console.log('Exemplo de uso: node supabase/scripts/migrate-from-prisma.js backend/exports/backup-2026-05-12.json');
    process.exit(1);
  }

  console.log(`Carregando backup de ${jsonPath}...`);
  const backup = JSON.parse(readFileSync(jsonPath, 'utf-8'));

  // 1. Inserir Usuários (criar em auth.users ou public.users)
  if (backup.User && backup.User.length > 0) {
    console.log(`Migrando ${backup.User.length} usuários...`);
    for (const u of backup.User) {
      // Inserir diretamente em public.users
      const { error } = await supabase.from('users').upsert({
        id: u.id,
        email: u.email.toLowerCase().trim(),
        full_name: u.full_name,
        role: u.role,
        status: u.status,
        created_at: u.created_at,
        updated_at: u.updated_at,
      });
      if (error) console.error(`Aviso ao migrar usuário ${u.email}:`, error.message);
    }
  }

  // 2. Inserir Cartões
  if (backup.Card && backup.Card.length > 0) {
    console.log(`Migrando ${backup.Card.length} cartões...`);
    const { error } = await supabase.from('cards').upsert(backup.Card);
    if (error) console.error('Erro ao migrar cartões:', error.message);
  }

  // 3. Inserir Contas
  if (backup.BillAccount && backup.BillAccount.length > 0) {
    console.log(`Migrando ${backup.BillAccount.length} contas...`);
    const { error } = await supabase.from('bill_accounts').upsert(backup.BillAccount);
    if (error) console.error('Erro ao migrar contas:', error.message);
  }

  // 4. Inserir Despesas
  if (backup.Expense && backup.Expense.length > 0) {
    console.log(`Migrando ${backup.Expense.length} despesas...`);
    const expenses = backup.Expense.map((e) => ({
      ...e,
      first_charge_date: e.first_charge_date.slice(0, 10),
    }));
    const { error } = await supabase.from('expenses').upsert(expenses);
    if (error) console.error('Erro ao migrar despesas:', error.message);
  }

  // 5. Inserir Parcelas
  if (backup.InstallmentPayment && backup.InstallmentPayment.length > 0) {
    console.log(`Migrando ${backup.InstallmentPayment.length} pagamentos de parcelas...`);
    const installments = backup.InstallmentPayment.map((p) => ({
      ...p,
      paid_date: p.paid_date.slice(0, 10),
    }));
    const { error } = await supabase.from('installment_payments').upsert(installments);
    if (error) console.error('Erro ao migrar parcelas:', error.message);
  }

  // 6. Inserir Faturas
  if (backup.CardInvoicePayment && backup.CardInvoicePayment.length > 0) {
    console.log(`Migrando ${backup.CardInvoicePayment.length} pagamentos de faturas...`);
    const invoices = backup.CardInvoicePayment.map((i) => ({
      ...i,
      paid_date: i.paid_date.slice(0, 10),
    }));
    const { error } = await supabase.from('card_invoice_payments').upsert(invoices);
    if (error) console.error('Erro ao migrar faturas:', error.message);
  }

  // 7. Inserir Dívidas
  if (backup.RunningDebt && backup.RunningDebt.length > 0) {
    console.log(`Migrando ${backup.RunningDebt.length} dívidas em andamento...`);
    const { error } = await supabase.from('running_debts').upsert(backup.RunningDebt);
    if (error) console.error('Erro ao migrar dívidas:', error.message);
  }

  // 8. Inserir Acessos Compartilhados
  if (backup.SharedAccess && backup.SharedAccess.length > 0) {
    console.log(`Migrando ${backup.SharedAccess.length} acessos compartilhados...`);
    const { error } = await supabase.from('shared_accesses').upsert(backup.SharedAccess);
    if (error) console.error('Erro ao migrar acessos compartilhados:', error.message);
  }

  console.log('Migração concluída com sucesso!');
}

main().catch((err) => {
  console.error('Falha na migração:', err);
  process.exit(1);
});
