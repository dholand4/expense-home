import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useTheme } from 'styled-components/native';
import { useIncomes } from '../../hooks/useIncomes';
import { useProportionalSplit } from '../../hooks/useProportionalSplit';
import { useExpenses } from '../../hooks/useExpenses';
import { formatCurrency, getInstallments, getMonthKey } from '../../utils/finance';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/mask';
import { FluidModalGlobal } from '../../components/fluidModalGlobal';
import { confirmModalGlobal as ConfirmModal } from '../../components/confirmModalGlobal';
import { buttonGlobal as ButtonGlobal } from '../../components/buttonGlobal';
import { inputGlobal as InputGlobal } from '../../components/inputGlobal';
import { IIncome } from '../../@types/models';

interface Props {
  onBack: () => void;
}

export function RevenuesView({ onBack }: Props) {
  const theme = useTheme();
  const { incomes, isLoading, createIncome, updateIncome, removeIncome } = useIncomes();
  const { members, totalIncome, split, isConfigured } = useProportionalSplit();
  const { expenses } = useExpenses();

  const [showModal, setShowModal] = useState(false);
  const [editIncome, setEditIncome] = useState<IIncome | null>(null);
  const [formDesc, setFormDesc] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formPerson, setFormPerson] = useState('');
  const [formRecurring, setFormRecurring] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ person?: string; desc?: string; amount?: string }>({});
  const [simValue, setSimValue] = useState('');
  const [confirmTarget, setConfirmTarget] = useState<IIncome | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const monthKey = getMonthKey(new Date());
  const monthTotal = useMemo(() => {
    return expenses
      .flatMap(getInstallments)
      .filter(i => i.month_key === monthKey)
      .reduce((sum, i) => sum + i.value, 0);
  }, [expenses, monthKey]);

  const monthSplit = isConfigured ? split(monthTotal) : [];

  const simAmount = parseCurrencyInput(simValue);
  const simSplit = isConfigured && simAmount > 0 ? split(simAmount) : [];

  const incomesByPerson = useMemo(() => {
    const map: Record<string, IIncome[]> = {};
    for (const inc of incomes) {
      if (!map[inc.person_name]) map[inc.person_name] = [];
      map[inc.person_name].push(inc);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [incomes]);

  const existingPersonNames = useMemo(
    () => [...new Set(incomes.map(i => i.person_name))],
    [incomes],
  );

  const openCreateModal = () => {
    setEditIncome(null);
    setFormDesc('');
    setFormAmount('');
    setFormPerson('');
    setFormRecurring(true);
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (income: IIncome) => {
    setEditIncome(income);
    setFormDesc(income.description);
    setFormAmount(formatCurrencyInput(String(Math.round(income.amount * 100))));
    setFormPerson(income.person_name);
    setFormRecurring(income.is_recurring);
    setErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    const amount = parseCurrencyInput(formAmount);
    const newErrors: { person?: string; desc?: string; amount?: string } = {};

    if (!formPerson.trim()) newErrors.person = 'Informe o nome da pessoa';
    if (!formDesc.trim()) newErrors.desc = 'Informe uma descrição';
    if (isNaN(amount) || amount <= 0) newErrors.amount = 'Informe um valor maior que zero';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    try {
      if (editIncome) {
        await updateIncome({
          id: editIncome.id,
          data: {
            description: formDesc.trim(),
            amount,
            person_name: formPerson.trim(),
            is_recurring: formRecurring,
          },
        });
      } else {
        await createIncome({
          description: formDesc.trim(),
          amount,
          person_name: formPerson.trim(),
          is_recurring: formRecurring,
        });
      }
      setShowModal(false);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a receita.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmTarget) return;
    setIsDeleting(true);
    try {
      await removeIncome(confirmTarget.id);
      setConfirmTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={onBack} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.primary} />
          <Text style={[s.backText, { color: theme.colors.primary }]}>Voltar para Fontes</Text>
        </TouchableOpacity>
        <Text style={[s.title, { color: theme.colors.text }]}>Receitas</Text>
        <Text style={[s.subtitle, { color: theme.colors.textSecondary }]}>
          Gerencie receitas e veja a divisão proporcional
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Hero - Renda Combinada */}
        {isConfigured && (
          <View style={[s.heroCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[s.heroLabel, { color: theme.colors.textSecondary }]}>
              Renda familiar combinada
            </Text>
            <Text style={[s.heroAmount, { color: theme.colors.text }]}>
              {formatCurrency(totalIncome)}
            </Text>

            {/* Barra de proporção */}
            <View style={s.proportionBar}>
              {members.map((m, i) => (
                <View
                  key={m.name}
                  style={[
                    s.proportionSegment,
                    {
                      backgroundColor: colors[i % colors.length],
                      flex: m.percent,
                      borderTopLeftRadius: i === 0 ? 6 : 0,
                      borderBottomLeftRadius: i === 0 ? 6 : 0,
                      borderTopRightRadius: i === members.length - 1 ? 6 : 0,
                      borderBottomRightRadius: i === members.length - 1 ? 6 : 0,
                    },
                  ]}
                />
              ))}
            </View>

            {/* Tags dos membros */}
            <View style={s.membersRow}>
              {members.map((m, i) => (
                <View key={m.name} style={[s.memberTag, { borderColor: colors[i % colors.length] + '55' }]}>
                  <View style={[s.memberDot, { backgroundColor: colors[i % colors.length] }]} />
                  <View>
                    <Text style={[s.memberName, { color: theme.colors.text }]}>{m.name}</Text>
                    <Text style={[s.memberInfo, { color: theme.colors.textSecondary }]}>
                      {formatCurrency(m.totalIncome)} ({m.percent.toFixed(1)}%)
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Divisão dos gastos do mês */}
        {isConfigured && monthTotal > 0 && (
          <View style={[s.splitCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[s.splitTitle, { color: theme.colors.text }]}>
              Rateio do mês atual
            </Text>
            <Text style={[s.splitTotal, { color: theme.colors.textSecondary }]}>
              Total de gastos: {formatCurrency(monthTotal)}
            </Text>
            {monthSplit.map((r, i) => {
              const member = members.find(m => m.name === r.name);
              const free = member ? member.totalIncome - r.value : 0;
              return (
                <View key={r.name} style={[s.splitRow, { borderTopColor: theme.colors.border }]}>
                  <View style={s.splitLeft}>
                    <View style={[s.memberDot, { backgroundColor: colors[i % colors.length] }]} />
                    <Text style={[s.splitName, { color: theme.colors.text }]}>{r.name}</Text>
                  </View>
                  <View style={s.splitRight}>
                    <Text style={[s.splitValue, { color: theme.colors.error }]}>
                      {formatCurrency(r.value)}
                    </Text>
                    <Text style={[s.splitFree, { color: free >= 0 ? theme.colors.success : theme.colors.error }]}>
                      {free >= 0 ? 'Sobra' : 'Falta'}: {formatCurrency(Math.abs(free))}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Simulador */}
        {isConfigured && (
          <View style={[s.simCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[s.simTitle, { color: theme.colors.text }]}>
              Simulador de divisão
            </Text>
            <Text style={[s.simDesc, { color: theme.colors.textSecondary }]}>
              Digite um valor para ver a divisão proporcional
            </Text>
            <TextInput
              style={[s.simInput, {
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              }]}
              placeholder="R$ 0,00"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
              value={simValue}
              onChangeText={t => setSimValue(formatCurrencyInput(t))}
            />
            {simSplit.length > 0 && (
              <View style={s.simResults}>
                {simSplit.map((r, i) => (
                  <View key={r.name} style={[s.simResultRow, { borderColor: colors[i % colors.length] + '33' }]}>
                    <View style={[s.memberDot, { backgroundColor: colors[i % colors.length] }]} />
                    <Text style={[s.simResultName, { color: theme.colors.text }]}>{r.name}</Text>
                    <Text style={[s.simResultValue, { color: colors[i % colors.length] }]}>
                      {formatCurrency(r.value)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Lista de Receitas */}
        <View style={s.listSection}>
          <View style={s.listHeader}>
            <Text style={[s.listTitle, { color: theme.colors.text }]}>Receitas cadastradas</Text>
          </View>

          {incomes.length === 0 && !isLoading && (
            <View style={[s.emptyCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Ionicons name="wallet-outline" size={36} color={theme.colors.textSecondary} />
              <Text style={[s.emptyTitle, { color: theme.colors.text }]}>Nenhuma receita cadastrada</Text>
              <Text style={[s.emptyDesc, { color: theme.colors.textSecondary }]}>
                Cadastre os salários e rendimentos de cada pessoa para ativar a divisão proporcional das despesas.
              </Text>
            </View>
          )}

          {incomesByPerson.map(([personName, personIncomes]) => (
            <View key={personName} style={{ marginBottom: 12 }}>
              <Text style={[s.personHeader, { color: theme.colors.textSecondary }]}>
                {personName}
              </Text>
              {personIncomes.map(inc => (
                <TouchableOpacity
                  key={inc.id}
                  style={[s.incomeItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                  onPress={() => openEditModal(inc)}
                  onLongPress={() => setConfirmTarget(inc)}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[s.incomeDesc, { color: theme.colors.text }]}>{inc.description}</Text>
                    <Text style={[s.incomeMeta, { color: theme.colors.textSecondary }]}>
                      {inc.is_recurring ? 'Recorrente' : 'Unica'}
                    </Text>
                  </View>
                  <Text style={[s.incomeAmount, { color: theme.colors.success }]}>
                    {formatCurrency(inc.amount)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[s.fab, { backgroundColor: theme.colors.primary }]}
        onPress={openCreateModal}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal de criação / edição */}
      <FluidModalGlobal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title={editIncome ? 'Editar receita' : 'Nova receita'}
        subtitle={editIncome ? editIncome.description : 'Cadastre salários ou rendimentos'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, gap: 14 }}
        >
          {existingPersonNames.length > 0 && (
            <View>
              <Text style={[s.fieldLabel, { color: theme.colors.textSecondary, marginBottom: 8 }]}>
                Pessoas sugeridas
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {existingPersonNames.map(name => (
                  <TouchableOpacity
                    key={name}
                    onPress={() => {
                      setFormPerson(name);
                      if (errors.person) setErrors(prev => ({ ...prev, person: undefined }));
                    }}
                    style={[
                      s.personChip,
                      {
                        backgroundColor: formPerson === name ? theme.colors.primary + '22' : theme.colors.surface,
                        borderColor: formPerson === name ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: formPerson === name ? '700' : '500',
                        color: formPerson === name ? theme.colors.primary : theme.colors.text,
                      }}
                    >
                      {name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <InputGlobal
            label="Nome da pessoa"
            placeholder="Ex: Daniel, Quintina..."
            value={formPerson}
            onChangeText={t => {
              setFormPerson(t);
              if (errors.person) setErrors(prev => ({ ...prev, person: undefined }));
            }}
            error={errors.person}
          />

          <InputGlobal
            label="Descrição"
            placeholder="Ex: Salário CLT, Freelance..."
            value={formDesc}
            onChangeText={t => {
              setFormDesc(t);
              if (errors.desc) setErrors(prev => ({ ...prev, desc: undefined }));
            }}
            error={errors.desc}
          />

          <InputGlobal
            label="Valor (R$)"
            placeholder="0,00"
            keyboardType="numeric"
            value={formAmount}
            onChangeText={t => {
              setFormAmount(formatCurrencyInput(t));
              if (errors.amount) setErrors(prev => ({ ...prev, amount: undefined }));
            }}
            error={errors.amount}
          />

          <TouchableOpacity
            style={[s.toggleRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => setFormRecurring(!formRecurring)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={formRecurring ? 'checkbox' : 'square-outline'}
              size={22}
              color={formRecurring ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text style={[s.toggleText, { color: theme.colors.text }]}>Receita recorrente (mensal)</Text>
          </TouchableOpacity>

          <ButtonGlobal
            label={editIncome ? 'Salvar alterações' : 'Adicionar receita'}
            onPress={handleSave}
            loading={isSaving}
          />
        </ScrollView>
      </FluidModalGlobal>

      {/* Confirmação de exclusão */}
      <ConfirmModal
        visible={!!confirmTarget}
        title={`Excluir "${confirmTarget?.description ?? ''}"`}
        message="Esta ação não pode ser desfeita."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmTarget(null)}
        loading={isDeleting}
      />
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  backText: { fontSize: 13, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { fontSize: 13, fontWeight: '500', marginTop: 2 },

  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  heroLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  heroAmount: { fontSize: 28, fontWeight: '800', marginTop: 4, marginBottom: 16 },
  proportionBar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 14,
    gap: 2,
  },
  proportionSegment: {},
  membersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  memberTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  memberDot: { width: 8, height: 8, borderRadius: 4 },
  memberName: { fontSize: 13, fontWeight: '700' },
  memberInfo: { fontSize: 11, fontWeight: '500' },

  splitCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  splitTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  splitTotal: { fontSize: 12, fontWeight: '500', marginBottom: 12 },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  splitLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  splitRight: { alignItems: 'flex-end' },
  splitName: { fontSize: 14, fontWeight: '600' },
  splitValue: { fontSize: 15, fontWeight: '700' },
  splitFree: { fontSize: 11, fontWeight: '600', marginTop: 2 },

  simCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  simTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  simDesc: { fontSize: 12, fontWeight: '500', marginBottom: 10 },
  simInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  simResults: { marginTop: 12, gap: 6 },
  simResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  simResultName: { fontSize: 14, fontWeight: '600', flex: 1 },
  simResultValue: { fontSize: 16, fontWeight: '800' },

  listSection: { marginTop: 4 },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitle: { fontSize: 16, fontWeight: '700' },
  personHeader: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  incomeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
  },
  incomeDesc: { fontSize: 14, fontWeight: '600' },
  incomeMeta: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  incomeAmount: { fontSize: 16, fontWeight: '800' },

  emptyCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700' },
  emptyDesc: { fontSize: 12, fontWeight: '500', textAlign: 'center', lineHeight: 18 },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  fieldLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  personChip: {
    borderWidth: 1,
    borderRadius: 99,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  toggleText: { fontSize: 14, fontWeight: '500' },
});
