/**
 * @file pagination.tsx
 * @description 페이지네이션 컴포넌트
 *
 * 상품 목록 페이지에서 페이지 이동을 위한 페이지네이션 컴포넌트입니다.
 * 카테고리 필터와 정렬 옵션을 유지하면서 페이지를 이동합니다.
 *
 * @dependencies
 * - next/link: Link 컴포넌트
 * - @/components/ui/button: Button 컴포넌트
 * - @/lib/utils: cn 함수
 * - lucide-react: ChevronLeft, ChevronRight 아이콘
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  category?: string;
  sort?: string;
}

/**
 * URL 쿼리 파라미터 생성 헬퍼
 */
function buildQueryString(params: {
  category?: string;
  sort?: string;
  page?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params.category) searchParams.set("category", params.category);
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.page && params.page > 1) {
    searchParams.set("page", params.page.toString());
  }
  return searchParams.toString() ? `?${searchParams.toString()}` : "";
}

/**
 * 페이지네이션 컴포넌트
 *
 * @param currentPage - 현재 페이지 번호
 * @param totalPages - 총 페이지 수
 * @param category - 현재 선택된 카테고리 (선택사항)
 * @param sort - 현재 선택된 정렬 옵션 (선택사항)
 */
export function Pagination({
  currentPage,
  totalPages,
  category,
  sort,
}: PaginationProps) {
  // 표시할 페이지 번호 계산 (현재 페이지 ±2 범위)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5; // 최대 표시할 페이지 번호 개수

    if (totalPages <= maxVisible) {
      // 총 페이지가 적으면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 첫 페이지
      pages.push(1);

      // 현재 페이지 주변 페이지
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      // 마지막 페이지
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      className="flex items-center justify-center gap-2"
      aria-label="페이지네이션"
    >
      {/* 이전 페이지 버튼 */}
      {currentPage > 1 ? (
        <Link
          href={`/products${buildQueryString({
            category,
            sort,
            page: currentPage - 1,
          })}`}
        >
          <Button variant="outline" size="icon" aria-label="이전 페이지">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
      ) : (
        <Button variant="outline" size="icon" disabled aria-label="이전 페이지">
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* 페이지 번호 */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-gray-500"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <Link
              key={pageNum}
              href={`/products${buildQueryString({
                category,
                sort,
                page: pageNum,
              })}`}
            >
              <Button
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={cn(
                  "min-w-[2.5rem]",
                  isActive && "pointer-events-none"
                )}
                aria-label={`${pageNum}페이지로 이동`}
                aria-current={isActive ? "page" : undefined}
              >
                {pageNum}
              </Button>
            </Link>
          );
        })}
      </div>

      {/* 다음 페이지 버튼 */}
      {currentPage < totalPages ? (
        <Link
          href={`/products${buildQueryString({
            category,
            sort,
            page: currentPage + 1,
          })}`}
        >
          <Button variant="outline" size="icon" aria-label="다음 페이지">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      ) : (
        <Button variant="outline" size="icon" disabled aria-label="다음 페이지">
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </nav>
  );
}

