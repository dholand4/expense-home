import styled from 'styled-components/native';

export const ModalOverlay = styled.View`
  flex: 1;
  background-color: #00000099;
  justify-content: flex-end;
`;

export const ModalCard = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-top-left-radius: ${({ theme }) => theme.borderRadius.lg}px;
  border-top-right-radius: ${({ theme }) => theme.borderRadius.lg}px;
  max-height: 92%;
`;

export const ModalContent = styled.View`
  padding: ${({ theme }) => theme.spacing.lg}px;
`;

export const TitleRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

export const ModalTitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.h3}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
`;

export const CloseButton = styled.TouchableOpacity`
  padding: ${({ theme }) => theme.spacing.xs}px;
`;

export const FieldLabel = styled.Text`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

export const SegmentRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.xs}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const SegmentButton = styled.TouchableOpacity<{ active: boolean }>`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  border-width: 1px;
  border-color: ${({ theme, active }) => (active ? theme.colors.primary : theme.colors.border)};
  background-color: ${({ theme, active }) => (active ? theme.colors.primary + '22' : 'transparent')};
  align-items: center;
`;

export const SegmentText = styled.Text<{ active: boolean }>`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme, active }) => (active ? theme.colors.primary : theme.colors.textSecondary)};
  font-weight: 600;
`;

export const SourceOption = styled.TouchableOpacity<{ active: boolean }>`
  flex-direction: row;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  border-width: 1px;
  border-color: ${({ theme, active }) => (active ? theme.colors.primary : theme.colors.border)};
  background-color: ${({ theme, active }) => (active ? theme.colors.primary + '22' : theme.colors.card)};
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

export const SourceOptionText = styled.Text<{ active: boolean }>`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme, active }) => (active ? theme.colors.primary : theme.colors.text)};
  margin-left: ${({ theme }) => theme.spacing.sm}px;
  flex: 1;
`;

export const WarningBox = styled.View`
  background-color: ${({ theme }) => theme.colors.warning}22;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const WarningText = styled.Text`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme }) => theme.colors.warning};
`;

export const CategorySelector = styled.TouchableOpacity<{ hasValue: boolean }>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  border-width: 1px;
  border-color: ${({ theme, hasValue }) => (hasValue ? theme.colors.primary : theme.colors.border)};
  background-color: ${({ theme, hasValue }) => (hasValue ? theme.colors.primary + '11' : theme.colors.card)};
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

export const CategorySelectorText = styled.Text<{ hasValue: boolean }>`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme, hasValue }) => (hasValue ? theme.colors.text : theme.colors.textSecondary)};
  flex: 1;
`;

export const CategoryGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const CategoryChip = styled.TouchableOpacity<{ active: boolean; color: string }>`
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.full}px;
  background-color: ${({ active, color }) => (active ? color + '44' : color + '22')};
  border-width: 1px;
  border-color: ${({ active, color }) => (active ? color : 'transparent')};
`;

export const CategoryChipText = styled.Text<{ color: string }>`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ color }) => color};
  font-weight: 600;
`;

export const CategoryDropdown = styled.View`
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.card};
  max-height: 220px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  overflow: hidden;
`;

export const CategoryPickerOverlay = styled.TouchableOpacity`
  flex: 1;
  background-color: #00000088;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.lg}px;
`;

export const CategoryPickerCard = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  overflow: hidden;
  max-height: 420px;
`;

export const CategoryPickerHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

export const CategoryPickerTitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
`;

export const CategoryItem = styled.TouchableOpacity<{ active: boolean; color: string }>`
  flex-direction: row;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ active, color }) => (active ? color + '22' : 'transparent')};
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

export const CategoryDot = styled.View<{ color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: ${({ color }) => color};
  margin-right: ${({ theme }) => theme.spacing.sm}px;
`;

export const CategoryItemText = styled.Text<{ active: boolean; color: string }>`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ active, color, theme }) => (active ? color : theme.colors.text)};
  font-weight: ${({ active }) => (active ? '700' : '400')};
  flex: 1;
`;

export const PreviewBox = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const PreviewRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

export const PreviewLabel = styled.Text`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const PreviewValue = styled.Text`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;
