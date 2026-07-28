import styled from 'styled-components/native';

export const Badge = styled.View<{ color: string }>`
  background-color: ${({ color }) => color}33;
  border-radius: ${({ theme }) => theme.borderRadius.full}px;
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.sm}px;
  align-self: flex-start;
`;

export const BadgeText = styled.Text<{ color: string }>`
  font-size: ${({ theme }) => theme.typography.caption}px;
  color: ${({ color }) => color};
  font-weight: 600;
`;
