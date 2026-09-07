import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { useTheme } from 'styled-components/native';
import styled from 'styled-components/native';
import { IRunningDebt, IRunningDebtTransaction } from '../../@types/models';
import { runningDebtService } from '../../services/runningDebtService';
import { formatCurrency } from '../../utils/finance';
import { FluidModalGlobal } from '../fluidModalGlobal';
import { PreviewBox, PreviewLabel, PreviewRow, PreviewValue } from '../expenseFormGlobal/style';

const TxList = styled.View`
  max-height: 350px;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

const TxItem = styled.View<{ isPayment: boolean }>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-left-width: 4px;
  border-left-color: ${({ theme, isPayment }) => isPayment ? theme.colors.success : theme.colors.error};
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

const TxLeft = styled.View`
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing.sm}px;
`;

const TxDate = styled.Text`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TxNotes = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
  margin-top: 2px;
`;

const TxRight = styled.View`
  align-items: flex-end;
`;

const TxAmount = styled.Text<{ isPayment: boolean }>`
  font-size: ${({ theme }) => theme.typography.body}px;
  font-weight: 700;
  color: ${({ theme, isPayment }) => isPayment ? theme.colors.success : theme.colors.error};
`;

const TxBadge = styled.Text<{ isPayment: boolean }>`
  font-size: 10px;
  font-weight: 600;
  color: ${({ theme, isPayment }) => isPayment ? theme.colors.success : theme.colors.error};
  text-transform: uppercase;
`;

const EmptyText = styled.Text`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: ${({ theme }) => theme.spacing.lg}px;
  font-size: ${({ theme }) => theme.typography.body}px;
`;

interface IProps {
  visible: boolean;
  debt: IRunningDebt | null;
  onClose: () => void;
}

function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const dateOnly = dateStr.slice(0, 10);
  const parts = dateOnly.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export function debtStatementModalGlobal({ visible, debt, onClose }: IProps) {
  const theme = useTheme();
  const [transactions, setTransactions] = useState<IRunningDebtTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible && debt) {
      setIsLoading(true);
      runningDebtService
        .listTransactions(debt.id)
        .then((data) => setTransactions(data || []))
        .catch(() => setTransactions([]))
        .finally(() => setIsLoading(false));
    }
  }, [visible, debt]);

  if (!debt) return null;

  const remaining = debt.total_amount - debt.amount_paid;

  return (
    <FluidModalGlobal
      visible={visible}
      onClose={onClose}
      title="Extrato do Fiado"
      subtitle={debt.name}
      maxHeight="88%"
    >
      <View style={{ paddingHorizontal: 20, paddingBottom: 24, gap: 14 }}>
        <PreviewBox>
          <PreviewRow>
            <PreviewLabel>Total Acumulado</PreviewLabel>
            <PreviewValue>{formatCurrency(debt.total_amount)}</PreviewValue>
          </PreviewRow>
          <PreviewRow>
            <PreviewLabel>Total Pago</PreviewLabel>
            <PreviewValue style={{ color: theme.colors.success }}>
              {formatCurrency(debt.amount_paid)}
            </PreviewValue>
          </PreviewRow>
          <PreviewRow>
            <PreviewLabel>Saldo Devedor</PreviewLabel>
            <PreviewValue style={{ color: remaining <= 0 ? theme.colors.success : theme.colors.error }}>
              {formatCurrency(Math.max(0, remaining))}
            </PreviewValue>
          </PreviewRow>
        </PreviewBox>

        {isLoading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        ) : (
          <TxList>
            <FlatList
              data={transactions}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <EmptyText>Nenhuma movimentação detalhada registrada ainda.</EmptyText>
              }
              renderItem={({ item }) => {
                const isPayment = item.type === 'payment';
                return (
                  <TxItem isPayment={isPayment}>
                    <TxLeft>
                      <TxDate>{formatDateBR(item.date)}</TxDate>
                      <TxNotes numberOfLines={2}>
                        {item.notes || (isPayment ? 'Pagamento' : 'Gasto')}
                      </TxNotes>
                    </TxLeft>
                    <TxRight>
                      <TxAmount isPayment={isPayment}>
                        {isPayment ? '- ' : '+ '}
                        {formatCurrency(item.amount)}
                      </TxAmount>
                      <TxBadge isPayment={isPayment}>
                        {isPayment ? 'Pagamento' : 'Gasto'}
                      </TxBadge>
                    </TxRight>
                  </TxItem>
                );
              }}
            />
          </TxList>
        )}
      </View>
    </FluidModalGlobal>
  );
}
