/**
 * @file product-grid.tsx
 * @description 상품 그리드 컴포넌트
 *
 * 상품 배열을 받아 반응형 grid 레이아웃으로 표시하는 컴포넌트입니다.
 * 빈 상태 처리도 포함합니다.
 *
 * @dependencies
 * - @/components/products/product-card: ProductCard 컴포넌트
 * - @/types/database: ProductWithCategory 타입
 */

import { ProductCard } from "./product-card";
import { ProductWithCategory } from "@/types/database";

interface ProductGridProps {
  products: ProductWithCategory[];
  /**
   * Grid 열 개수 설정 (기본값: 4)
   * - mobile: 1열
   * - sm: 2열
   * - lg: 3열 또는 4열
   * - xl: 4열
   */
  columns?: {
    mobile?: number;
    sm?: number;
    lg?: number;
    xl?: number;
  };
  /**
   * 빈 상태 메시지 (기본값: "등록된 상품이 없습니다.")
   */
  emptyMessage?: string;
  /**
   * 빈 상태 하위 메시지
   */
  emptySubMessage?: string;
}

/**
 * 상품 그리드 컴포넌트
 *
 * @param products - 표시할 상품 배열
 * @param columns - Grid 열 개수 설정
 * @param emptyMessage - 빈 상태 메시지
 * @param emptySubMessage - 빈 상태 하위 메시지
 */
export function ProductGrid({
  products,
  columns = { mobile: 1, sm: 2, lg: 4 },
  emptyMessage = "등록된 상품이 없습니다.",
  emptySubMessage,
}: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg mb-4">{emptyMessage}</p>
        {emptySubMessage && (
          <p className="text-sm text-muted-foreground">{emptySubMessage}</p>
        )}
      </div>
    );
  }

  // Tailwind 클래스를 명시적으로 지정 (동적 생성 방지)
  const getGridCols = () => {
    const mobile = columns.mobile ?? 1;
    const sm = columns.sm ?? 2;
    const lg = columns.lg ?? 4;
    const xl = columns.xl;

    const gridClasses: Record<number, string> = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
    };

    const smClasses: Record<number, string> = {
      1: "sm:grid-cols-1",
      2: "sm:grid-cols-2",
      3: "sm:grid-cols-3",
      4: "sm:grid-cols-4",
      5: "sm:grid-cols-5",
      6: "sm:grid-cols-6",
    };

    const lgClasses: Record<number, string> = {
      1: "lg:grid-cols-1",
      2: "lg:grid-cols-2",
      3: "lg:grid-cols-3",
      4: "lg:grid-cols-4",
      5: "lg:grid-cols-5",
      6: "lg:grid-cols-6",
    };

    const xlClasses: Record<number, string> = {
      1: "xl:grid-cols-1",
      2: "xl:grid-cols-2",
      3: "xl:grid-cols-3",
      4: "xl:grid-cols-4",
      5: "xl:grid-cols-5",
      6: "xl:grid-cols-6",
    };

    const baseClass = gridClasses[mobile] || "grid-cols-1";
    const smClass = smClasses[sm] || "sm:grid-cols-2";
    const lgClass = lgClasses[lg] || "lg:grid-cols-4";
    const xlClass = xl ? xlClasses[xl] : "";

    return `${baseClass} ${smClass} ${lgClass} ${xlClass}`.trim();
  };

  return (
    <div className={`grid ${getGridCols()} gap-6 items-stretch`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

