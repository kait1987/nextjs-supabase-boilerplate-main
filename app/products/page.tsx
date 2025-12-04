import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";

/**
 * 상품 목록 페이지
 * 
 * 모든 활성화된 상품을 카테고리별로 필터링하여 표시합니다.
 */
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const supabase = await createClient();
  const categorySlug = searchParams.category;

  // 카테고리 목록 가져오기
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  // 상품 목록 가져오기
  let productsQuery = supabase
    .from("products")
    .select(`
      *,
      category:categories(*)
    `)
    .eq("is_active", true)
    .gt("stock", 0) // 재고가 있는 상품만 표시
    .order("created_at", { ascending: false });

  // 카테고리 필터링
  if (categorySlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();

    if (category) {
      productsQuery = productsQuery.eq("category_id", category.id);
    }
  }

  const { data: products, error } = await productsQuery;

  if (error) {
    console.error("Error fetching products:", error);
  }

  // 재고가 없는 상품은 제외 (품절 상품)
  const availableProducts = products?.filter((p: any) => p.stock > 0) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">상품 목록</h1>
        
        {/* 카테고리 필터 */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Link href="/products">
            <Button
              variant={!categorySlug ? "default" : "outline"}
              size="sm"
            >
              전체
            </Button>
          </Link>
          {categories?.map((category) => (
            <Link key={category.id} href={`/products?category=${category.slug}`}>
              <Button
                variant={categorySlug === category.slug ? "default" : "outline"}
                size="sm"
              >
                {category.name}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* 상품 그리드 */}
      {availableProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {availableProducts.map((product: any) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group"
            >
              <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      이미지 없음
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  {product.category && (
                    <p className="text-sm text-gray-500 mb-2">
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
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">상품이 없습니다.</p>
        </div>
      )}
    </div>
  );
}

