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

  // 상품 정보 가져오기
  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(*)
    `)
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 상품 이미지 */}
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
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
          {product.category && (
            <p className="text-sm text-gray-500">{product.category.name}</p>
          )}
          <h1 className="text-4xl font-bold">{product.name}</h1>
          <p className="text-3xl font-bold text-primary">
            {formatPrice(product.price)}
          </p>

          {product.description && (
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">재고</span>
              <span
                className={`text-sm font-semibold ${
                  product.stock > 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {product.stock > 0 ? `${product.stock}개` : "품절"}
              </span>
            </div>

            {product.stock > 0 ? (
              <AddToCartButton productId={product.id} />
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

