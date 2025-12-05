/**
 * @file page.tsx
 * @description 홈페이지
 *
 * 히어로 섹션, 인기 상품 섹션, 카테고리별 상품 섹션을 표시합니다.
 * ProductCard와 ProductGrid 컴포넌트를 사용하여 재사용 가능한 구조로 구현되었습니다.
 *
 * @dependencies
 * - @/lib/supabase/server: Supabase 클라이언트
 * - @/components/products/product-grid: ProductGrid 컴포넌트
 * - @/components/ui/button: Button 컴포넌트
 * - @/types/database: ProductWithCategory 타입
 */

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductWithCategory } from "@/types/database";

export default async function Home() {
  const supabase = await createClient();

  // 최신 상품 8개 가져오기 (인기 상품 섹션용)
  const { data: featuredProducts } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(*)
    `)
    .eq("is_active", true)
    .gt("stock", 0)
    .order("created_at", { ascending: false })
    .limit(8);

  // 카테고리 목록 가져오기
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  // 각 카테고리별로 최신 상품 4개씩 가져오기
  const categoryProducts = await Promise.all(
    (categories || []).map(async (category) => {
      const { data: products } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*)
        `)
        .eq("is_active", true)
        .eq("category_id", category.id)
        .gt("stock", 0)
        .order("created_at", { ascending: false })
        .limit(4);

      return {
        category,
        products: (products || []) as ProductWithCategory[],
      };
    })
  );

  return (
    <main className="min-h-[calc(100vh-80px)]">
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            의류 쇼핑몰에 오신 것을 환영합니다
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            트렌디한 의류를 만나보세요
          </p>
          <Link href="/products">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              상품 보러가기
            </Button>
          </Link>
        </div>
      </section>

      {/* 인기 상품 섹션 */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">인기 상품</h2>
          <Link href="/products">
            <Button variant="outline">전체 보기</Button>
          </Link>
        </div>

        <ProductGrid
          products={(featuredProducts || []) as ProductWithCategory[]}
          emptyMessage="등록된 상품이 없습니다."
          emptySubMessage="Supabase Dashboard에서 상품을 등록해주세요."
        />
      </section>

      {/* 카테고리별 상품 섹션 */}
      {categoryProducts.map(({ category, products }) => {
        if (products.length === 0) return null;

        return (
          <section key={category.id} className="container mx-auto px-4 py-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">{category.name}</h2>
              <Link href={`/products?category=${category.slug}`}>
                <Button variant="outline">더보기</Button>
              </Link>
            </div>

            <ProductGrid
              products={products}
              columns={{ mobile: 1, sm: 2, lg: 4 }}
            />
          </section>
        );
      })}
    </main>
  );
}
