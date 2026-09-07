import React from 'react';
import { View } from 'react-native';
import { buttonGlobal as ButtonGlobal } from '../buttonGlobal';
import { FluidModalGlobal } from '../fluidModalGlobal';
import styled from 'styled-components/native';

const Message = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  line-height: 20px;
`;

interface IProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function confirmModalGlobal({
  visible, title, message, confirmLabel = 'Excluir',
  onConfirm, onCancel, loading,
}: IProps) {
  return (
    <FluidModalGlobal
      visible={visible}
      onClose={onCancel}
      title={title}
    >
      <View style={{ paddingHorizontal: 20, paddingBottom: 24, gap: 10 }}>
        {message ? <Message>{message}</Message> : null}
        <ButtonGlobal label={confirmLabel} variant="danger" onPress={onConfirm} loading={loading} />
        <ButtonGlobal label="Cancelar" variant="outline" onPress={onCancel} />
      </View>
    </FluidModalGlobal>
  );
}
