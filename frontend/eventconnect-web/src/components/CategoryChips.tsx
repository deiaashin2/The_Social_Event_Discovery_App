import { categories } from "@/data/mockEvents";

interface CategoryChipsProps {
  selected: string;
  onSelect: (cat: string) => void;
}

export default function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            selected === cat
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
              : "bg-secondary text-secondary-foreground hover:bg-surface-hover"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
