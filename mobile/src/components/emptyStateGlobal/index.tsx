import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTheme } from 'styled-components/native';
import { Container, Description, Title } from './style';

interface IEmptyStateProps {
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  description?: string;
}

export function emptyStateGlobal({ icon = 'folder-open-outline', title, description }: IEmptyStateProps) {
  const theme = useTheme();
  return (
    <Container>
      <Ionicons name={icon} size={64} color={theme.colors.textSecondary} />
      <Title>{title}</Title>
      {description ? <Description>{description}</Description> : null}
    </Container>
  );
}
