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

import Link from "next/link";
import Image from "next/image";
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
  return (
    <Link
      href={`/products/${product.id}`}
      className="group block"
      aria-label={`${product.name} 상품 상세 보기`}
    >
      <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        {/* 상품 이미지 */}
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              이미지 없음
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-foreground">
            {product.name}
          </h3>
          {product.category && (
            <p className="text-sm text-muted-foreground mb-2">
              {product.category.name}
            </p>
          )}
          <p className="text-xl font-bold text-primary">
            {formatPrice(product.price)}
          </p>
          {product.stock <= 0 && (
            <p className="text-sm text-red-500 mt-2">품절</p>
          )}
        </div>
      </div>
    </Link>
  );
}

