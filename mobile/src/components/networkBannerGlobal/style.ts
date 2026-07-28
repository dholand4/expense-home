import styled from 'styled-components/native';

export const BannerContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.error};
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const BannerText = styled.Text`
  color: #fff;
  font-size: ${({ theme }) => theme.typography.caption}px;
  font-weight: 600;
`;
