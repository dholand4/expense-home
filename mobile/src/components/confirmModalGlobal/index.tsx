import React from 'react';
import { Modal } from 'react-native';
import { buttonGlobal as ButtonGlobal } from '../buttonGlobal';
import { ModalCard, ModalContent, ModalOverlay, ModalTitle } from '../expenseFormGlobal/style';
import styled from 'styled-components/native';

const Message = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <ModalOverlay>
        <ModalCard>
          <ModalContent>
            <ModalTitle>{title}</ModalTitle>
            {message ? <Message>{message}</Message> : null}
            <ButtonGlobal label={confirmLabel} variant="danger" onPress={onConfirm} loading={loading} />
            <ButtonGlobal label="Cancelar" variant="outline" onPress={onCancel} />
          </ModalContent>
        </ModalCard>
      </ModalOverlay>
    </Modal>
  );
}
