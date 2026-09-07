import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'styled-components/native';
import { useProportionalSplit } from '../../hooks/useProportionalSplit';
import { formatCurrency } from '../../utils/finance';

interface Props {
  amount: number;
  compact?: boolean;
  variant?: 'inline' | 'compact' | 'banner';
}

export function ProportionalBadge({ amount, compact = false, variant }: Props) {
  const theme = useTheme();
  const { split, isConfigured, members } = useProportionalSplit();

  if (!isConfigured || amount <= 0) return null;

  const results = split(amount);
  const activeVariant = variant ?? (compact ? 'compact' : 'inline');

  if (activeVariant === 'banner') {
    return (
      <View style={[styles.bannerCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.bannerTitle, { color: theme.colors.textSecondary }]}>
          Divisão proporcional desta conta
        </Text>
        <View style={styles.bannerRow}>
          {results.map((r) => {
            const member = members.find(m => m.name === r.name);
            return (
              <View
                key={r.name}
                style={[styles.bannerCol, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              >
                <View style={styles.bannerColHeader}>
                  <Text style={[styles.bannerName, { color: theme.colors.text }]}>
                    {r.name}
                  </Text>
                  {member && (
                    <Text style={[styles.bannerPercent, { color: theme.colors.textSecondary }]}>
                      {member.percent.toFixed(1)}%
                    </Text>
                  )}
                </View>
                <Text style={[styles.bannerValue, { color: theme.colors.primary }]}>
                  {formatCurrency(r.value)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  if (activeVariant === 'compact') {
    return (
      <View style={styles.compactRow}>
        {results.map((r, i) => (
          <React.Fragment key={r.name}>
            {i > 0 && (
              <Text style={[styles.separator, { color: theme.colors.textSecondary }]}> · </Text>
            )}
            <Text style={[styles.compactName, { color: theme.colors.textSecondary }]}>
              {r.name}:{' '}
            </Text>
            <Text style={[styles.compactValue, { color: theme.colors.text }]}>
              {formatCurrency(r.value)}
            </Text>
          </React.Fragment>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.row}>
      {results.map((r, i) => (
        <React.Fragment key={r.name}>
          {i > 0 && (
            <Text style={[styles.separator, { color: theme.colors.textSecondary }]}> · </Text>
          )}
          <Text style={[styles.name, { color: theme.colors.textSecondary }]}>
            {r.name}:{' '}
          </Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>
            {formatCurrency(r.value)}
          </Text>
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 3,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  name: {
    fontSize: 11,
    fontWeight: '500',
  },
  value: {
    fontSize: 11,
    fontWeight: '700',
  },
  compactName: {
    fontSize: 10,
    fontWeight: '500',
  },
  compactValue: {
    fontSize: 10,
    fontWeight: '600',
  },
  separator: {
    fontSize: 11,
    fontWeight: '400',
  },
  bannerCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    marginTop: 4,
  },
  bannerTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  bannerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bannerCol: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
  },
  bannerColHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  bannerName: {
    fontSize: 12,
    fontWeight: '700',
  },
  bannerPercent: {
    fontSize: 10,
    fontWeight: '600',
  },
  bannerValue: {
    fontSize: 14,
    fontWeight: '800',
  },
});
