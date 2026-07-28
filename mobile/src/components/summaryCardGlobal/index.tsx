import React from 'react';
import { Card, CardSubtitle, CardTitle, CardValue } from './style';

interface ISummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
}

export function summaryCardGlobal({ title, value, subtitle }: ISummaryCardProps) {
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <CardValue>{value}</CardValue>
      {subtitle ? <CardSubtitle>{subtitle}</CardSubtitle> : null}
    </Card>
  );
}
