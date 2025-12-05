/**
 * @file product-card.tsx
 * @description 상품 카드 컴포넌트
 *
 * 상품 정보를 카드 형태로 표시하는 재사용 가능한 컴포넌트입니다.
 * 이미지, 상품명, 카테고리, 가격을 표시하며 클릭 시 상품 상세 페이지로 이동합니다.
 *
 * @dependencies
 * - next/link: 상품 상세 페이지 링크
 * - next/image: 상품 이미지 표시
 * - @/lib/utils/format: 가격 포맷팅
 * - @/types/database: ProductWithCategory 타입
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { formatPrice } from "@/lib/utils/format";
import { ProductWithCategory } from "@/types/database";

interface ProductCardProps {
  product: ProductWithCategory;
}

/**
 * 상품 카드 컴포넌트
 *
 * @param product - 상품 정보 (카테고리 포함)
 */
export function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block h-full"
      aria-label={`${product.name} 상품 상세 보기`}
    >
      <div className="border-2 border-border rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] dark:hover:neon-glow dark:hover:animate-neon-flow dark:hover:border-primary dark:hover:border-[3px] hover:shadow-2xl bg-card group/card h-full flex flex-col">
        {/* 상품 이미지 */}
        <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
          {/* 호버 시 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-10"></div>
          
          {product.image_url && !imageError ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              unoptimized={product.image_url.startsWith("http")}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary bg-gradient-to-br from-muted to-muted/50 dark:group-hover/card:bg-gradient-to-br dark:group-hover/card:from-primary/10 dark:group-hover/card:to-accent/10 transition-all duration-300">
              <span className="text-6xl font-normal dark:group-hover/card:drop-shadow-[0_0_10px_oklch(0.7_0.3_200),0_0_20px_oklch(0.7_0.3_200),0_0_30px_oklch(0.7_0.3_200)] dark:group-hover/card:animate-neon-glow-flow transition-all duration-300" style={{ fontFamily: "var(--font-great-vibes)" }}>
                V
              </span>
            </div>
          )}
          
          {/* 품절 배지 */}
          {product.stock <= 0 && (
            <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-semibold z-20">
              품절
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="p-5 space-y-2 flex-1 flex flex-col">
          {product.category && (
            <p className="text-xs font-medium text-primary uppercase tracking-wider">
              {product.category.name}
            </p>
          )}
          <h3 className="font-bold text-lg line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-300 flex-1">
            {product.name}
          </h3>
          <div className="flex items-baseline justify-between pt-2 mt-auto">
            <p className="text-2xl font-bold text-primary">
              {formatPrice(product.price)}
            </p>
            {product.stock > 0 && (
              <span className="text-xs text-muted-foreground">
                재고 {product.stock}개
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

