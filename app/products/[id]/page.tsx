import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { formatPrice } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";

/**
 * 상품 상세 페이지
 * 
 * 상품의 상세 정보를 표시하고 장바구니에 추가할 수 있습니다.
 */
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // 상품 정보 가져오기 (외래키 관계 쿼리 대신 별도 쿼리로 변경)
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !product) {
    notFound();
  }

  // 카테고리 정보 별도 조회
  let category = null;
  if (product.category_id) {
    const { data: categoryData } = await supabase
      .from("categories")
      .select("*")
      .eq("id", product.category_id)
      .single();
    category = categoryData;
  }

  // 카테고리 정보 병합
  const productWithCategory = { ...product, category } as any;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 상품 이미지 */}
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
          {productWithCategory.image_url ? (
            <Image
              src={productWithCategory.image_url}
              alt={productWithCategory.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              이미지 없음
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="space-y-6">
          {productWithCategory.category && (
            <p className="text-sm text-gray-500">{productWithCategory.category.name}</p>
          )}
          <h1 className="text-4xl font-bold">{productWithCategory.name}</h1>
          <p className="text-3xl font-bold text-primary">
            {formatPrice(productWithCategory.price)}
          </p>

          {productWithCategory.description && (
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line">
                {productWithCategory.description}
              </p>
            </div>
          )}

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">재고</span>
              <span
                className={`text-sm font-semibold ${
                  productWithCategory.stock > 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {productWithCategory.stock > 0 ? `${productWithCategory.stock}개` : "품절"}
              </span>
            </div>

            {productWithCategory.stock > 0 ? (
              <AddToCartButton productId={productWithCategory.id} />
            ) : (
              <Button disabled className="w-full">
                품절
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

