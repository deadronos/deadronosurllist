import { useMemo, useState } from "react";

type UseTextFilterOptions<T> = {
  /** Array of items to filter */
  items: T[];
  /** Field names to search within (case-insensitive) */
  searchFields: (keyof T)[];
};

type UseTextFilterResult<T> = {
  /** Filtered array of items matching the search term */
  filteredItems: T[];
  /** Current filter/search term */
  filterTerm: string;
  /** Update the filter term */
  setFilterTerm: (term: string) => void;
  /** Whether a filter is currently active */
  hasFilter: boolean;
};

/**
 * Generic hook for text-based filtering with multiple search fields.
 *
 * Eliminates duplicate filter logic in manager components by providing
 * a reusable hook that:
 * 1. Filters items across multiple fields
 * 2. Performs case-insensitive matching
 * 3. Handles null/undefined values gracefully
 * 4. Memoizes filtered results for performance
 *
 * @template T - The item type (must be a record with string-convertible properties)
 * @param {UseTextFilterOptions<T>} options - Configuration for filtering
 * @returns {UseTextFilterResult<T>} Filter state and items
 *
 * @example
 * ```typescript
 * interface Collection {
 *   id: string;
 *   name: string;
 *   description: string | null;
 * }
 *
 * function Component({ collections }: { collections: Collection[] }) {
 *   const { filteredItems, filterTerm, setFilterTerm } = useTextFilter({
 *     items: collections,
 *     searchFields: ["name", "description"],
 *   });
 *
 *   return (
 *     <>
 *       <input value={filterTerm} onChange={(e) => setFilterTerm(e.target.value)} />
 *       {filteredItems.map(c => <div key={c.id}>{c.name}</div>)}
 *     </>
 *   );
 * }
 * ```
 */
export function useTextFilter<T extends Record<string, unknown>>({
  items,
  searchFields,
}: UseTextFilterOptions<T>): UseTextFilterResult<T> {
  const [filterTerm, setFilterTerm] = useState("");

  const filteredItems = useMemo(() => {
    if (!filterTerm.trim()) return items;
    const query = filterTerm.trim().toLowerCase();

    return items.filter((item) => {
      return searchFields.some((field) => {
        const value = item[field];
        if (value == null) return false;
        return String(value).toLowerCase().includes(query);
      });
    });
  }, [items, filterTerm, searchFields]);

  const hasFilter = filterTerm.trim().length > 0;

  return {
    filteredItems,
    filterTerm,
    setFilterTerm,
    hasFilter,
  };
}
