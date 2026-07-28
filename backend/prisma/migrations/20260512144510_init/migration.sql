-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'invited', 'disabled');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('avista', 'parcelado', 'recorrente');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('alimentacao', 'transporte', 'moradia', 'saude', 'educacao', 'lazer', 'vestuario', 'tecnologia', 'assinaturas', 'financiamento', 'emprestimo', 'pet', 'outros');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('card', 'bill_account');

-- CreateEnum
CREATE TYPE "SharedAccessStatus" AS ENUM ('pending', 'accepted', 'rejected');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "credit_limit" DECIMAL(12,2) NOT NULL,
    "due_day" INTEGER NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bill_accounts" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "due_day" INTEGER,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bill_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "installments" INTEGER NOT NULL,
    "first_charge_date" DATE NOT NULL,
    "payment_type" "PaymentType" NOT NULL DEFAULT 'avista',
    "category" "ExpenseCategory",
    "source_type" "SourceType" NOT NULL,
    "source_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "installment_payments" (
    "id" UUID NOT NULL,
    "expense_id" UUID NOT NULL,
    "installment_number" INTEGER NOT NULL,
    "paid_amount" DECIMAL(12,2) NOT NULL,
    "paid_date" DATE NOT NULL,
    "month_key" VARCHAR(7) NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "installment_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_invoice_payments" (
    "id" UUID NOT NULL,
    "card_id" UUID NOT NULL,
    "month_key" VARCHAR(7) NOT NULL,
    "paid_amount" DECIMAL(12,2) NOT NULL,
    "paid_date" DATE NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_invoice_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "running_debts" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "amount_paid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "running_debts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_accesses" (
    "id" UUID NOT NULL,
    "owner_email" TEXT NOT NULL,
    "shared_with_email" TEXT NOT NULL,
    "status" "SharedAccessStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shared_accesses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "cards_created_by_idx" ON "cards"("created_by");

-- CreateIndex
CREATE INDEX "bill_accounts_created_by_idx" ON "bill_accounts"("created_by");

-- CreateIndex
CREATE INDEX "expenses_created_by_idx" ON "expenses"("created_by");

-- CreateIndex
CREATE INDEX "expenses_source_type_source_id_idx" ON "expenses"("source_type", "source_id");

-- CreateIndex
CREATE INDEX "installment_payments_created_by_idx" ON "installment_payments"("created_by");

-- CreateIndex
CREATE INDEX "installment_payments_expense_id_idx" ON "installment_payments"("expense_id");

-- CreateIndex
CREATE INDEX "installment_payments_month_key_idx" ON "installment_payments"("month_key");

-- CreateIndex
CREATE INDEX "card_invoice_payments_created_by_idx" ON "card_invoice_payments"("created_by");

-- CreateIndex
CREATE INDEX "card_invoice_payments_card_id_idx" ON "card_invoice_payments"("card_id");

-- CreateIndex
CREATE INDEX "card_invoice_payments_month_key_idx" ON "card_invoice_payments"("month_key");

-- CreateIndex
CREATE INDEX "running_debts_created_by_idx" ON "running_debts"("created_by");

-- CreateIndex
CREATE INDEX "shared_accesses_owner_email_idx" ON "shared_accesses"("owner_email");

-- CreateIndex
CREATE INDEX "shared_accesses_shared_with_email_idx" ON "shared_accesses"("shared_with_email");

-- CreateIndex
CREATE UNIQUE INDEX "shared_accesses_owner_email_shared_with_email_key" ON "shared_accesses"("owner_email", "shared_with_email");

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_accounts" ADD CONSTRAINT "bill_accounts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installment_payments" ADD CONSTRAINT "installment_payments_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installment_payments" ADD CONSTRAINT "installment_payments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_invoice_payments" ADD CONSTRAINT "card_invoice_payments_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_invoice_payments" ADD CONSTRAINT "card_invoice_payments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "running_debts" ADD CONSTRAINT "running_debts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_accesses" ADD CONSTRAINT "shared_accesses_owner_email_fkey" FOREIGN KEY ("owner_email") REFERENCES "users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_accesses" ADD CONSTRAINT "shared_accesses_shared_with_email_fkey" FOREIGN KEY ("shared_with_email") REFERENCES "users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
