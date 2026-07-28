import { CATEGORIES } from '../utils/finance';

export default function CategoryBadge({ category }) {
  const cat = CATEGORIES[category] || CATEGORIES.outros;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{
        backgroundColor: cat.color + '18',
        color: cat.color,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: cat.color }}
      />
      {cat.label}
    </span>
  );
}