import { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, CreditCard, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import CardForm from '../components/CardForm';
import CardEditForm from '../components/CardEditForm';
import BillAccountForm from '../components/BillAccountForm';
import BillAccountEditForm from '../components/BillAccountEditForm';
import EmptyState from '../components/EmptyState';
import { listCards, deleteCard } from '../services/cardService';
import { listExpenses } from '../services/expenseService';
import { listAllPayments } from '../services/installmentPaymentService';
import { listCardInvoicePayments } from '../services/cardInvoicePaymentService';
import { calcCardAvailableLimit } from '../utils/finance';
import { listBillAccounts, deleteBillAccount } from '../services/billAccountService';
import { formatCurrency } from '../utils/finance';

export default function Sources() {
    const [cards, setCards] = useState([]);
    const [billAccounts, setBillAccounts] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [allPayments, setAllPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCardForm, setShowCardForm] = useState(false);
    const [showBillForm, setShowBillForm] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [editingBill, setEditingBill] = useState(null);

    const [cardInvoicePayments, setCardInvoicePayments] = useState([]);

    const load = async () => {
        const [c, b, e, p, cip] = await Promise.all([listCards(), listBillAccounts(), listExpenses(), listAllPayments(), listCardInvoicePayments()]);
        setCards(c);
        setBillAccounts(b);
        setExpenses(e);
        setAllPayments(p);
        setCardInvoicePayments(cip);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Cards Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-foreground tracking-tight">Cartões</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">{cards.length} cartão(ões)</p>
                    </div>
                    <Button onClick={() => setShowCardForm(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Novo Cartão</span>
                    </Button>
                </div>

                {cards.length === 0 ? (
                    <EmptyState icon={CreditCard} title="Nenhum cartão" description="Cadastre um cartão para vincular despesas." />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {cards.map((card) => (
                            <div key={card.id} className="rounded-xl border border-border/50 bg-card p-5 group hover:border-primary/20 transition-all">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <CreditCard className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground text-sm">{card.name}</h3>
                                            <p className="text-xs text-muted-foreground">Vence dia {card.due_day}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-secondary h-8 w-8" onClick={() => setEditingCard(card)}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="bg-card border-border">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="text-foreground">Remover cartão?</AlertDialogTitle>
                                                    <AlertDialogDescription>Todas as despesas vinculadas a este cartão serão removidas permanentemente.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="bg-secondary text-foreground border-border">Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => deleteCard(card.id).then(load)} className="bg-destructive text-destructive-foreground">Remover</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-border/50 space-y-1">
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Limite Total</p>
                                        <p className="text-xs text-muted-foreground">{formatCurrency(card.credit_limit)}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Disponível</p>
                                        <p className={`text-lg font-bold ${calcCardAvailableLimit(card, expenses.filter(e => e.source_type === 'card' && e.source_id === card.id), allPayments, cardInvoicePayments) < 0
                                            ? 'text-destructive' : 'text-primary'
                                            }`}>{formatCurrency(calcCardAvailableLimit(card, expenses.filter(e => e.source_type === 'card' && e.source_id === card.id), allPayments, cardInvoicePayments))}</p>
                                    </div>
                                    {(() => {
                                        const available = calcCardAvailableLimit(card, expenses.filter(e => e.source_type === 'card' && e.source_id === card.id), allPayments, cardInvoicePayments);
                                        const pct = Math.max(0, Math.min(100, (available / card.credit_limit) * 100));
                                        return (
                                            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mt-1">
                                                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Bill Accounts Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-foreground tracking-tight">Contas Avulsas</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">{billAccounts.length} conta(s)</p>
                    </div>
                    <Button onClick={() => setShowBillForm(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Nova Conta</span>
                    </Button>
                </div>

                {billAccounts.length === 0 ? (
                    <EmptyState icon={FileText} title="Nenhuma conta avulsa" description="Cadastre uma conta para vincular despesas." />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {billAccounts.map((bill) => (
                            <div key={bill.id} className="rounded-xl border border-border/50 bg-card p-5 group hover:border-primary/20 transition-all">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground text-sm">{bill.name}</h3>
                                            {bill.description && <p className="text-xs text-muted-foreground">{bill.description}</p>}
                                            {bill.due_day && <p className="text-xs text-muted-foreground">Vence dia {bill.due_day}</p>}
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-secondary h-8 w-8" onClick={() => setEditingBill(bill)}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="bg-card border-border">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="text-foreground">Remover conta?</AlertDialogTitle>
                                                    <AlertDialogDescription>Todas as despesas vinculadas a esta conta serão removidas permanentemente.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="bg-secondary text-foreground border-border">Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => deleteBillAccount(bill.id).then(load)} className="bg-destructive text-destructive-foreground">Remover</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <CardForm open={showCardForm} onClose={() => setShowCardForm(false)} onSuccess={load} />
            <BillAccountForm open={showBillForm} onClose={() => setShowBillForm(false)} onSuccess={load} />
            <CardEditForm card={editingCard} open={!!editingCard} onClose={() => setEditingCard(null)} onSuccess={load} />
            <BillAccountEditForm bill={editingBill} open={!!editingBill} onClose={() => setEditingBill(null)} onSuccess={load} />
        </div>
    );
}