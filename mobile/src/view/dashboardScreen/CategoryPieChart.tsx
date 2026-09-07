import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { G, Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'styled-components/native';
import { formatCurrency } from '../../utils/finance';

export interface CategoryChartItem {
  key: string;
  name: string;
  amount: number;
  color: string;
}

interface Props {
  categories: CategoryChartItem[];
  total: number;
  selectedCategoryKey?: string | null;
  onSelectCategory?: (categoryKey: string | null) => void;
}

export function CategoryPieChart({
  categories,
  total,
  selectedCategoryKey,
  onSelectCategory,
}: Props) {
  const theme = useTheme();

  if (total <= 0 || categories.length === 0) {
    return null;
  }

  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Group top 5 and remainder
  const displayCategories: CategoryChartItem[] = [];
  const top5 = categories.slice(0, 5);
  const remainder = categories.slice(5);

  for (const c of top5) {
    displayCategories.push({ ...c });
  }

  const remainingAmount = remainder.reduce((sum, c) => sum + c.amount, 0);
  if (remainingAmount > 0) {
    const existingOutros = displayCategories.find((c) => c.key === 'outros');
    if (existingOutros) {
      existingOutros.amount += remainingAmount;
    } else {
      displayCategories.push({
        key: '__outros_agrupados__',
        name: 'Outros',
        amount: remainingAmount,
        color: '#94A3B8',
      });
    }
  }

  let accumulatedPercent = 0;
  const isAnySelected = Boolean(selectedCategoryKey);
  const selectedItem = displayCategories.find((c) => c.key === selectedCategoryKey);
  const selectedPercent = selectedItem && total > 0
    ? ((selectedItem.amount / total) * 100).toFixed(0)
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <Svg width={size} height={size}>
          <G rotation="-90" origin={`${center}, ${center}`}>
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={theme.colors.border}
              strokeWidth={strokeWidth}
              fill="none"
            />
            {displayCategories.map((item, index) => {
              const percent = item.amount / total;
              const strokeLength = percent * circumference;
              const offset = -accumulatedPercent * circumference;
              accumulatedPercent += percent;
              const isSelected = selectedCategoryKey === item.key;

              return (
                <Circle
                  key={`${item.key}-${index}`}
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={item.color}
                  strokeWidth={isSelected ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={`${strokeLength} ${circumference}`}
                  strokeDashoffset={offset}
                  strokeLinecap="butt"
                  strokeOpacity={isAnySelected ? (isSelected ? 1 : 0.25) : 1}
                  fill="none"
                  onPress={() => {
                    onSelectCategory?.(isSelected ? null : item.key);
                  }}
                />
              );
            })}
          </G>
        </Svg>

        {selectedItem ? (
          <TouchableOpacity
            style={styles.centerLabel}
            onPress={() => onSelectCategory?.(null)}
            activeOpacity={0.7}
          >
            <Text style={[styles.centerCount, { color: selectedItem.color }]}>
              {selectedPercent}%
            </Text>
            <Text
              style={[styles.centerSub, { color: theme.colors.textSecondary }]}
              numberOfLines={1}
            >
              {selectedItem.name}
            </Text>
            <Text style={[styles.centerClear, { color: selectedItem.color }]}>
              limpar ✕
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.centerLabel} pointerEvents="none">
            <Text style={[styles.centerCount, { color: theme.colors.text }]}>
              {categories.length}
            </Text>
            <Text style={[styles.centerSub, { color: theme.colors.textSecondary }]}>
              {categories.length === 1 ? 'categoria' : 'categorias'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.legendWrapper}>
        {displayCategories.map((item, index) => {
          const percent = total > 0 ? ((item.amount / total) * 100).toFixed(0) : '0';
          const isSelected = selectedCategoryKey === item.key;

          return (
            <TouchableOpacity
              key={`${item.key}-${index}`}
              style={[
                styles.legendItem,
                isSelected && {
                  backgroundColor: item.color + '18',
                  borderColor: item.color + '55',
                },
                isAnySelected && !isSelected && {
                  opacity: 0.4,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => onSelectCategory?.(isSelected ? null : item.key)}
            >
              <View style={[styles.colorDot, { backgroundColor: item.color }]} />
              <Text
                style={[
                  styles.legendName,
                  {
                    color: isSelected ? item.color : theme.colors.text,
                    fontWeight: isSelected ? '700' : '600',
                  },
                ]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text style={[styles.legendPercent, { color: theme.colors.textSecondary }]}>
                {percent}%
              </Text>
              <Text
                style={[
                  styles.legendAmount,
                  {
                    color: isSelected ? item.color : theme.colors.text,
                    fontWeight: isSelected ? '800' : '700',
                  },
                ]}
              >
                {formatCurrency(item.amount)}
              </Text>
              {isSelected && (
                <Ionicons
                  name="close-circle"
                  size={15}
                  color={item.color}
                  style={{ marginLeft: 6 }}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    paddingTop: 8,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCount: {
    fontSize: 22,
    fontWeight: '800',
  },
  centerSub: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    maxWidth: 90,
    textAlign: 'center',
  },
  centerClear: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  legendWrapper: {
    width: '100%',
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  legendName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  legendPercent: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 10,
    minWidth: 32,
    textAlign: 'right',
  },
  legendAmount: {
    fontSize: 13,
    fontWeight: '700',
    minWidth: 70,
    textAlign: 'right',
  },
});
