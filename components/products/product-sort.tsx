/**
 * @file product-sort.tsx
 * @description 상품 정렬 선택 컴포넌트
 *
 * 상품 목록 페이지에서 정렬 옵션을 선택하는 Client Component입니다.
 *
 * @dependencies
 * - next/navigation: useRouter, useSearchParams
 * - @/lib/utils: cn 함수
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type SortOption = "latest" | "price_asc" | "price_desc" | "name_asc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "latest", label: "최신순" },
  { value: "price_asc", label: "가격 낮은순" },
  { value: "price_desc", label: "가격 높은순" },
  { value: "name_asc", label: "이름순" },
];

interface ProductSortProps {
  currentSort: SortOption;
}

/**
 * 상품 정렬 선택 컴포넌트
 *
 * @param currentSort - 현재 선택된 정렬 옵션
 */
export function ProductSort({ currentSort }: ProductSortProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    params.delete("page"); // 정렬 변경 시 첫 페이지로
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm text-gray-600">
        정렬:
      </label>
      <select
        id="sort"
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className={cn(
          "h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

