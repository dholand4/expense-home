import React from 'react';
import { CATEGORIES } from '../../utils/finance';
import { Badge, BadgeText } from './style';

interface ICategoryBadgeProps {
  category: string;
}

export function categoryBadgeGlobal({ category }: ICategoryBadgeProps) {
  const cat = CATEGORIES[category] ?? { label: category, color: '#94a3b8' };
  return (
    <Badge color={cat.color}>
      <BadgeText color={cat.color}>{cat.label}</BadgeText>
    </Badge>
  );
}
