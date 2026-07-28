export { ScreenSafe as Safe } from '../../components/screenSafe';

import styled from 'styled-components/native';

export const TopBar = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

export const BackButton = styled.TouchableOpacity`
  padding: ${({ theme }) => theme.spacing.sm}px;
  margin-right: ${({ theme }) => theme.spacing.sm}px;
`;


export const Container = styled.ScrollView`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg}px;
`;

export const Header = styled.View`
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xl}px 0 ${({ theme }) => theme.spacing.lg}px;
`;

export const Avatar = styled.View`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: ${({ theme }) => theme.colors.primary};
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const AvatarText = styled.Text`
  font-size: 28px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
`;

export const UserName = styled.Text`
  font-size: ${({ theme }) => theme.typography.h3}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
`;

export const UserEmail = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

export const RoleBadge = styled.View`
  background-color: ${({ theme }) => theme.colors.primary}22;
  border-radius: ${({ theme }) => theme.borderRadius.full}px;
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.md}px;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

export const RoleText = styled.Text`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  text-transform: capitalize;
`;

export const TabBar = styled.View`
  flex-direction: row;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.xs}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const TabButton = styled.TouchableOpacity<{ active: boolean }>`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm}px;
  align-items: center;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  background-color: ${({ theme, active }) => (active ? theme.colors.primary + '33' : 'transparent')};
`;

export const TabButtonText = styled.Text<{ active: boolean }>`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme, active }) => (active ? theme.colors.primary : theme.colors.textSecondary)};
  font-weight: 600;
`;

export const Section = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  overflow: hidden;
`;

export const SectionTitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

export const SectionItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

export const ItemLabel = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.text};
  flex: 1;
  margin-left: ${({ theme }) => theme.spacing.md}px;
`;

export const DangerItem = styled(SectionItem)`
  border-bottom-width: 0;
`;

export const DangerLabel = styled(ItemLabel)`
  color: ${({ theme }) => theme.colors.error};
`;

export const AccessCard = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const AccessEmail = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  flex: 1;
`;

export const AccessRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

export const StatusBadge = styled.View<{ status: string }>`
  background-color: ${({ theme, status }) =>
    status === 'accepted' ? theme.colors.success + '22'
    : status === 'pending' ? theme.colors.warning + '22'
    : theme.colors.error + '22'};
  border-radius: ${({ theme }) => theme.borderRadius.full}px;
  padding: 2px ${({ theme }) => theme.spacing.sm}px;
`;

export const StatusText = styled.Text<{ status: string }>`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme, status }) =>
    status === 'accepted' ? theme.colors.success
    : status === 'pending' ? theme.colors.warning
    : theme.colors.error};
  font-weight: 600;
`;

export const ActionRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.sm}px;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

export const SmallButton = styled.TouchableOpacity<{ variant?: 'danger' | 'success' | 'warning' }>`
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  background-color: ${({ theme, variant }) =>
    variant === 'danger' ? theme.colors.error + '22'
    : variant === 'success' ? theme.colors.success + '22'
    : variant === 'warning' ? theme.colors.warning + '22'
    : theme.colors.primary + '22'};
`;

export const SmallButtonText = styled.Text<{ variant?: 'danger' | 'success' | 'warning' }>`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme, variant }) =>
    variant === 'danger' ? theme.colors.error
    : variant === 'success' ? theme.colors.success
    : variant === 'warning' ? theme.colors.warning
    : theme.colors.primary};
  font-weight: 600;
`;

export const UserCard = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const UserCardName = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

export const UserCardEmail = styled.Text`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 2px;
`;

export const EmptyText = styled.Text`
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg}px;
`;
