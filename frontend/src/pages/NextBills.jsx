import { useState, useEffect, useMemo, useRef } from 'react';
import { CalendarClock, ChevronLeft, ChevronRight, Filter, CheckCircle2, Circle, CreditCard, Eye, EyeOff, Undo2, FileDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import CategoryBadge from '../components/CategoryBadge';
import EmptyState from '../components/EmptyState';
import MarkPaidDialog from '../components/MarkPaidDialog';
import CardInvoicePaymentDialog from '../components/CardInvoicePaymentDialog';
import SourcesPaymentStatus from '../components/SourcesPaymentStatus';
import { listCards } from '../services/cardService';
import { listCardInvoicePayments } from '../services/cardInvoicePaymentService';
import { listPaymentsByMonth, listAllPayments, createPayment, deletePayment } from '../services/installmentPaymentService';
import { listBillAccounts } from '../services/billAccountService';
import { listExpenses } from '../services/expenseService';
import { listRunningDebts } from '../services/runningDebtService';
import { formatCurrency, getInstallments, getMonthKey } from '../utils/finance';
import { addMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function NextBills() {
    const [cards, setCards] = useState([]);
    const [billAccounts, setBillAccounts] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [runningDebts, setRunningDebts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [offset, setOffset] = useState(0);
    const [filterSource, setFilterSource] = useState('all');
    const [filterUnpaid, setFilterUnpaid] = useState(false);
    const [payments, setPayments] = useState([]);
    const [allPayments, setAllPayments] = useState([]);
    const [markingInst, setMarkingInst] = useState(null);
    const [cardInvoicePayments, setCardInvoicePayments] = useState([]);
    const [payingCardInvoice, setPayingCardInvoice] = useState(false);
    const [payingAll, setPayingAll] = useState(false);
    const [confirmPayAll, setConfirmPayAll] = useState(false);
    const [unpayingAll, setUnpayingAll] = useState(false);
    const [confirmUnpayAll, setConfirmUnpayAll] = useState(false);
    const [showSourceStatus, setShowSourceStatus] = useState(() => {
        return localStorage.getItem('showSourceStatus') !== 'false';
    });
    const initialLoaded = useRef(false);

    useEffect(() => {
        async function load() {
            const initialKey = getMonthKey(new Date());
            const [c, b, e, rd, p, ap, cip] = await Promise.all([
                listCards(), listBillAccounts(), listExpenses(), listRunningDebts(),
                listPaymentsByMonth(initialKey), listAllPayments(), listCardInvoicePayments()
            ]);
            setCards(c);
            setBillAccounts(b);
            setExpenses(e);
            setRunningDebts(rd);
            setPayments(p);
            setAllPayments(ap);
            setCardInvoicePayments(cip);
            setLoading(false);
            initialLoaded.current = true;
        }
        load();
    }, []);

    const sourceMap = useMemo(() => {
        const map = {};
        cards.forEach((c) => { map[`card::${c.id}`] = `💳 ${c.name}`; });
        billAccounts.forEach((b) => { map[`bill_account::${b.id}`] = `📄 ${b.name}`; });
        return map;
    }, [cards, billAccounts]);

    const loadPayments = async (key) => {
        const p = await listPaymentsByMonth(key);
        setPayments(p);
    };

    const refreshAllPayments = async (key) => {
        const [p, ap, cip] = await Promise.all([listPaymentsByMonth(key), listAllPayments(), listCardInvoicePayments()]);
        setPayments(p);
        setAllPayments(ap);
        setCardInvoicePayments(cip);
    };

    useEffect(() => {
        if (!initialLoaded.current) return;
        loadPayments(getMonthKey(addMonths(new Date(), offset)));
    }, [offset]);

    const selectedDate = addMonths(new Date(), offset);
    const selectedKey = getMonthKey(selectedDate);
    const monthLabel = format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR });

    const allSources = useMemo(() => [
        ...cards.map((c) => ({ key: `card::${c.id}`, label: `💳 ${c.name}` })),
        ...billAccounts.map((b) => ({ key: `bill_account::${b.id}`, label: `📄 ${b.name}` })),
    ], [cards, billAccounts]);

    // All items for the selected month (and source filter)
    const items = useMemo(() => {
        const allPaidKeys = new Set(allPayments.map((p) => `${p.expense_id}-${p.installment_number}`));
        return expenses
            .flatMap((expense) => getInstallments(expense))
            .filter((inst) => getMonthKey(inst.due_date) === selectedKey)
            .filter((inst) => filterSource === 'all' || `${inst.source_type}::${inst.source_id}` === filterSource)
            .sort((a, b) => a.due_date - b.due_date);
    }, [expenses, selectedKey, filterSource, allPayments]);

    function getPaymentForInst(inst) {
        return payments.find((p) => p.expense_id === inst.expense_id && p.installment_number === inst.number);
    }

    const unpaidItems = useMemo(() => items.filter((inst) => !getPaymentForInst(inst)), [items, payments]);
    const paidItems = useMemo(() => items.filter((inst) => !!getPaymentForInst(inst)), [items, payments]);

    // Displayed items (with optional unpaid filter)
    const displayedItems = useMemo(() => filterUnpaid ? unpaidItems : items, [filterUnpaid, unpaidItems, items]);

    const total = useMemo(() => items.reduce((a, i) => a + i.value, 0), [items]);

    // Check if currently filtered source is a card
    const filteredCardId = filterSource.startsWith('card::') ? filterSource.replace('card::', '') : null;
    const filteredCard = filteredCardId ? cards.find(c => c.id === filteredCardId) : null;

    // For card invoice: include all items (recorrentes included when paying full invoice)
    const cardInvoiceTotal = useMemo(() => {
        if (!filteredCard) return total;
        return total;
    }, [filteredCard, total]);

    // paidTotal: for bill accounts use individual payments; for cards use invoice payment if exists
    const paidTotal = useMemo(() => {
        const billItems = items.filter(i => i.source_type !== 'card');
        const billPaid = payments
            .filter(p => billItems.some(i => i.expense_id === p.expense_id && i.number === p.installment_number))
            .reduce((a, p) => a + p.paid_amount, 0);

        let cardPaid = 0;
        cards.forEach(card => {
            const cardItems = items.filter(i => i.source_type === 'card' && i.source_id === card.id);
            if (cardItems.length === 0) return;
            const invoicePmt = cardInvoicePayments.find(p => p.card_id === card.id && p.month_key === selectedKey);
            if (invoicePmt) {
                cardPaid += Math.min(invoicePmt.paid_amount, cardItems.reduce((a, i) => a + i.value, 0));
            } else {
                cardPaid += payments
                    .filter(p => cardItems.some(i => i.expense_id === p.expense_id && i.number === p.installment_number))
                    .reduce((a, p) => a + p.paid_amount, 0);
            }
        });

        return billPaid + cardPaid;
    }, [payments, items, cardInvoicePayments, cards, selectedKey]);

    // Card invoice payment for the selected card+month
    const currentCardInvoicePayment = filteredCardId
        ? cardInvoicePayments.find(p => p.card_id === filteredCardId && p.month_key === selectedKey)
        : null;

    // All source paid (used to show "unpay all" button) - only for bill accounts
    const allSourcePaid = !filteredCardId && unpaidItems.length === 0 && paidItems.length > 0 && filterSource !== 'all';

    const handlePayAll = async () => {
        setPayingAll(true);
        setConfirmPayAll(false);
        const today = format(new Date(), 'yyyy-MM-dd');
        await Promise.all(unpaidItems.map((inst) =>
            createPayment({
                expense_id: inst.expense_id,
                installment_number: inst.number,
                paid_amount: inst.value,
                paid_date: today,
                month_key: selectedKey,
            })
        ));
        await refreshAllPayments(selectedKey);
        setPayingAll(false);
    };

    const handleGeneratePdf = async () => {
        setGeneratingPdf(true);
        const { default: jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        const logoUrl = 'https://media.base44.com/images/public/69f239847ca6bed7e78c37c0/6d1ce52b1_file_0000000026dc71f5bf3b64f696e5efbc.png';

        // Header
        doc.setFillColor(13, 26, 20);
        doc.rect(0, 0, 210, 30, 'F');
        doc.setTextColor(100, 200, 140);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('DQ Financas', 14, 12);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(180, 220, 190);
        doc.text(`Relatorio de Faturas — ${monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}`, 14, 22);
        doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 140, 22);

        let y = 40;

        const formatVal = (v) => `R$ ${v.toFixed(2).replace('.', ',')}`;

        const addSection = (title) => {
            if (y > 260) { doc.addPage(); y = 20; }
            doc.setFillColor(30, 60, 40);
            doc.rect(10, y - 5, 190, 10, 'F');
            doc.setTextColor(100, 200, 140);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(title, 14, y + 1);
            y += 10;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(30, 30, 30);
            doc.setFontSize(9);
        };

        const addRow = (cols, isHeader = false) => {
            if (y > 270) { doc.addPage(); y = 20; }
            if (isHeader) {
                doc.setFillColor(240, 248, 242);
                doc.rect(10, y - 4, 190, 7, 'F');
                doc.setFont('helvetica', 'bold');
            } else {
                doc.setFont('helvetica', 'normal');
            }
            doc.setTextColor(20, 20, 20);
            doc.text(String(cols[0]).substring(0, 40), 14, y);
            if (cols[1]) doc.text(String(cols[1]), 110, y);
            if (cols[2]) doc.text(String(cols[2]), 145, y);
            if (cols[3]) doc.text(String(cols[3]), 175, y, { align: 'right' });
            y += 7;
        };

        // Faturas do mês
        addSection(`Faturas do mes (${items.length} itens)`);
        addRow(['Descricao', 'Fonte', 'Vencimento', 'Valor'], true);
        let totalFaturas = 0;
        for (const inst of items) {
            const payment = getPaymentForInst(inst);
            const src = sourceMap[`${inst.source_type}::${inst.source_id}`] || 'Removida';
            const status = payment ? `Pago ${payment.paid_date ? format(new Date(payment.paid_date + 'T00:00:00'), 'dd/MM') : ''}` : 'Pendente';
            const desc = `${inst.description}${inst.total > 1 ? ` (${inst.number}/${inst.total})` : ''} [${status}]`;
            addRow([desc, src.replace(/[💳📄]/g, '').trim(), format(inst.due_date, 'dd/MM/yyyy'), formatVal(inst.value)]);
            totalFaturas += inst.value;
        }
        y += 2;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(13, 120, 60);
        doc.text(`Total: ${formatVal(totalFaturas)}`, 175, y, { align: 'right' });
        doc.text(`Pago: ${formatVal(paidTotal)}`, 140, y, { align: 'right' });
        y += 10;

        // Dívidas abatíveis
        const activeDebts = runningDebts.filter(d => (d.total_amount - (d.amount_paid || 0)) > 0);
        if (activeDebts.length > 0) {
            addSection(`Dividas Abativeis (${activeDebts.length} ativas)`);
            addRow(['Nome', 'Total', 'Pago', 'Restante'], true);
            let totalDebts = 0;
            for (const debt of activeDebts) {
                const restante = debt.total_amount - (debt.amount_paid || 0);
                addRow([debt.name, formatVal(debt.total_amount), formatVal(debt.amount_paid || 0), formatVal(restante)]);
                totalDebts += restante;
            }
            y += 2;
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(13, 120, 60);
            doc.text(`Total restante: ${formatVal(totalDebts)}`, 175, y, { align: 'right' });
            y += 10;
        }

        // Footer
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`DQ Financas — Pagina ${i} de ${pageCount}`, 105, 290, { align: 'center' });
        }

        doc.save(`DQ-Financas-${selectedKey}.pdf`);
        setGeneratingPdf(false);
    };

    const handleUnpayAll = async () => {
        setUnpayingAll(true);
        setConfirmUnpayAll(false);
        const paymentsToDelete = paidItems.map(getPaymentForInst).filter(Boolean);
        await Promise.all(paymentsToDelete.map((p) => deletePayment(p.id)));
        await refreshAllPayments(selectedKey);
        setUnpayingAll(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header + nav */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Próximas Faturas</h1>
                    <p className="text-sm text-muted-foreground mt-0.5 capitalize">{monthLabel}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGeneratePdf}
                        disabled={generatingPdf || items.length === 0}
                        className="h-9 gap-1.5 text-xs border-border bg-secondary hover:bg-muted"
                    >
                        <FileDown className="w-4 h-4" />
                        <span className="hidden sm:inline">{generatingPdf ? 'Gerando...' : 'PDF'}</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setOffset(offset - 1)}
                        className="h-9 w-9 border-border bg-secondary hover:bg-muted"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {offset !== 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setOffset(0)}
                            className="text-xs text-muted-foreground hover:text-foreground px-2"
                        >
                            Hoje
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setOffset(offset + 1)}
                        className="h-9 w-9 border-border bg-secondary hover:bg-muted"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Filters row */}
            <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                <Select value={filterSource} onValueChange={(v) => { setFilterSource(v); setConfirmPayAll(false); }}>
                    <SelectTrigger className="w-[200px] bg-secondary border-border text-foreground text-sm h-9">
                        <SelectValue placeholder="Fonte" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                        <SelectItem value="all">Todas as fontes</SelectItem>
                        {allSources.map((s) => (
                            <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Unpaid filter toggle */}
                <Button
                    variant={filterUnpaid ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterUnpaid(!filterUnpaid)}
                    className="h-9 gap-1.5 text-xs"
                >
                    {filterUnpaid ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {filterUnpaid ? 'Mostrar todos' : 'Só não pagos'}
                </Button>

                {/* Card invoice pay button */}
                {filteredCard && items.length > 0 && (
                    <Button
                        onClick={() => setPayingCardInvoice(true)}
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 h-9"
                    >
                        <CreditCard className="w-4 h-4" />
                        {currentCardInvoicePayment ? 'Atualizar Pagamento da Fatura' : 'Pagar Fatura'}
                    </Button>
                )}

                {/* Pay All / Confirm / Unpay All - only for bill accounts */}
                {!filteredCard && filterSource !== 'all' && !allSourcePaid && unpaidItems.length > 0 && !confirmPayAll && (
                    <Button
                        onClick={() => setConfirmPayAll(true)}
                        disabled={payingAll}
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 h-9"
                    >
                        <CreditCard className="w-4 h-4" />
                        {payingAll ? 'Pagando...' : `Pagar todos (${unpaidItems.length})`}
                    </Button>
                )}

                {/* Inline confirmation */}
                {!filteredCard && confirmPayAll && (
                    <div className="flex items-center gap-2 bg-secondary border border-border rounded-lg px-3 py-1.5">
                        <span className="text-xs text-foreground">Confirmar pagamento de {unpaidItems.length} itens?</span>
                        <Button size="sm" className="h-7 text-xs bg-primary text-primary-foreground" onClick={handlePayAll}>
                            Sim, pagar
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setConfirmPayAll(false)}>
                            Cancelar
                        </Button>
                    </div>
                )}

                {/* Unpay All button - only for bill accounts */}
                {!filteredCard && filterSource !== 'all' && allSourcePaid && !confirmUnpayAll && (
                    <Button
                        onClick={() => setConfirmUnpayAll(true)}
                        disabled={unpayingAll}
                        size="sm"
                        variant="outline"
                        className="h-9 gap-1.5 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
                    >
                        <Undo2 className="w-4 h-4" />
                        {unpayingAll ? 'Desfazendo...' : 'Desfazer pagamento em lote'}
                    </Button>
                )}
                {!filteredCard && filterSource !== 'all' && allSourcePaid && confirmUnpayAll && (
                    <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-1.5">
                        <span className="text-xs text-foreground">Desfazer todos os pagamentos da fonte?</span>
                        <Button size="sm" className="h-7 text-xs bg-destructive text-destructive-foreground" onClick={handleUnpayAll} disabled={unpayingAll}>Sim</Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setConfirmUnpayAll(false)}>Cancelar</Button>
                    </div>
                )}
            </div>

            {/* Status por fonte */}
            {filterSource === 'all' && (
                <div className="space-y-2">
                    <button
                        onClick={() => {
                            const next = !showSourceStatus;
                            setShowSourceStatus(next);
                            localStorage.setItem('showSourceStatus', next);
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                    >
                        {showSourceStatus ? '▾ Ocultar resumo por fonte' : '▸ Ver resumo por fonte'}
                    </button>
                    {showSourceStatus && (
                        <SourcesPaymentStatus
                            allSources={allSources}
                            items={items}
                            payments={payments}
                            onSelectSource={(key) => setFilterSource(key)}
                            cardInvoicePayments={cardInvoicePayments}
                            monthKey={selectedKey}
                        />
                    )}
                </div>
            )}

            {/* Total do mês */}
            {items.length > 0 && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground font-medium">
                            Total {filterSource !== 'all' ? `— ${allSources.find(s => s.key === filterSource)?.label}` : 'do mês'}
                        </span>
                        <span className="text-xl font-bold text-primary">{formatCurrency(filteredCard ? cardInvoiceTotal : total)}</span>
                    </div>
                    {filteredCard && currentCardInvoicePayment && (
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Pago na fatura</span>
                            <span className="text-sm font-semibold text-chart-1">{formatCurrency(currentCardInvoicePayment.paid_amount)}</span>
                        </div>
                    )}
                    {!filteredCard && items.length > 0 && (
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Pago</span>
                            <span className="text-sm font-semibold text-chart-1">{formatCurrency(paidTotal)}</span>
                        </div>
                    )}
                    {total > 0 && (
                        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mt-1">
                            <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${Math.min(100, ((filteredCard && currentCardInvoicePayment ? currentCardInvoicePayment.paid_amount : paidTotal) / (filteredCard ? cardInvoiceTotal : total)) * 100)}%` }}
                            />
                        </div>
                    )}
                </div>
            )}

            {displayedItems.length === 0 ? (
                <EmptyState
                    icon={CalendarClock}
                    title={filterUnpaid ? 'Tudo pago!' : 'Nenhuma fatura neste mês'}
                    description={filterUnpaid ? 'Não há itens pendentes de pagamento.' : 'Nenhuma parcela vence neste período.'}
                />
            ) : (
                <div className="space-y-2">
                    {displayedItems.map((inst, idx) => (
                        <div
                            key={`${inst.expense_id}-${inst.number}-${idx}`}
                            onClick={() => {
                                if (inst.source_type !== 'card') setMarkingInst(inst);
                            }}
                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${inst.source_type !== 'card' ? 'cursor-pointer' : 'cursor-default'
                                } ${inst.source_type === 'card'
                                    ? 'border-border/50 bg-card'
                                    : getPaymentForInst(inst)
                                        ? 'border-primary/30 bg-primary/5 opacity-80'
                                        : 'border-border/50 bg-card hover:border-primary/20'
                                }`}
                        >
                            <div className="shrink-0">
                                {inst.source_type === 'card'
                                    ? <CreditCard className="w-5 h-5 text-muted-foreground/40" />
                                    : getPaymentForInst(inst)
                                        ? <CheckCircle2 className="w-5 h-5 text-primary" />
                                        : <Circle className="w-5 h-5 text-muted-foreground/40" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium text-foreground text-sm truncate">{inst.description}</span>
                                    <CategoryBadge category={inst.category} />
                                    {inst.total > 1 && (
                                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                            {inst.number}/{inst.total}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                    <span>{sourceMap[`${inst.source_type}::${inst.source_id}`] || 'Fonte removida'}</span>
                                    <span>·</span>
                                    <span>Vence {format(inst.due_date, 'dd/MM/yyyy')}</span>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-sm font-bold text-foreground whitespace-nowrap">{formatCurrency(inst.value)}</p>
                                {getPaymentForInst(inst) && getPaymentForInst(inst).paid_amount < inst.value && (
                                    <p className="text-xs text-primary">Pago: {formatCurrency(getPaymentForInst(inst).paid_amount)}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {markingInst && (
                <MarkPaidDialog
                    open={!!markingInst}
                    onClose={() => setMarkingInst(null)}
                    installment={markingInst}
                    monthKey={selectedKey}
                    existingPayment={getPaymentForInst(markingInst)}
                    onSuccess={() => refreshAllPayments(selectedKey)}
                    sourceType={markingInst?.source_type}
                />
            )}

            {payingCardInvoice && filteredCard && (
                <CardInvoicePaymentDialog
                    open={payingCardInvoice}
                    onClose={() => setPayingCardInvoice(false)}
                    card={filteredCard}
                    monthKey={selectedKey}
                    totalInvoice={cardInvoiceTotal}
                    onSuccess={() => refreshAllPayments(selectedKey)}
                    recurrentItems={[]}
                    recurrentPayments={[]}
                />
            )}
        </div>
    );
}