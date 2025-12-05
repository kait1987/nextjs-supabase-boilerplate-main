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
import { ErrorState } from "@/components/ui/error-state";

export default async function Home() {
  const supabase = await createClient();

  try {
    // 최신 상품 8개 가져오기 (인기 상품 섹션용)
    const { data: featuredProducts, error: featuredError } = await supabase
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
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    // 에러 처리
    if (featuredError || categoriesError) {
      const error = featuredError || categoriesError;
      // 테이블이 없는 경우는 에러로 표시하지 않고 빈 배열로 처리
      if (error?.code === "PGRST205" || error?.message?.includes("Could not find the table")) {
        // 개발 환경에서만 로깅
        if (process.env.NODE_ENV === "development") {
          console.warn("Database tables not found - showing empty state");
        }
      } else {
        // 다른 에러는 표시
        throw error;
      }
    }

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
        {/* 히어로 섹션 - 시각적으로 매력적인 디자인 */}
        <section className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b border-border py-20 overflow-hidden">
          {/* 배경 장식 요소 */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="inline-block mb-4">
              <span className="text-sm font-semibold text-primary px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                NEW COLLECTION
              </span>
            </div>
            <p className="text-xl md:text-2xl mb-10 text-muted-foreground max-w-2xl mx-auto">
              트렌디한 의류를 만나보세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/products">
                <Button size="lg" className="text-lg px-10 py-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  상품 보러가기
                </Button>
              </Link>
              <Link href="/categories">
                <Button size="lg" variant="outline" className="text-lg px-10 py-6 border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                  카테고리 둘러보기
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 인기 상품 섹션 */}
        <section className="container mx-auto px-4 py-20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
            <div>
              <div className="inline-block mb-2">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Featured
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">인기 상품</h2>
              <p className="text-muted-foreground mt-2">지금 가장 인기 있는 상품들을 만나보세요</p>
            </div>
            <Link href="/products">
              <Button variant="outline" className="border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                전체 보기 →
              </Button>
            </Link>
          </div>

          <ProductGrid
            products={(featuredProducts || []) as ProductWithCategory[]}
            emptyMessage="등록된 상품이 없습니다."
            emptySubMessage="Supabase Dashboard에서 상품을 등록해주세요."
          />
        </section>

        {/* 카테고리별 상품 섹션 */}
        {categoryProducts.map(({ category, products }, index) => {
          if (products.length === 0) return null;

          return (
            <section 
              key={category.id} 
              className={`container mx-auto px-4 py-20 ${index % 2 === 0 ? 'bg-muted/30' : ''}`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
                <div>
                  <div className="inline-block mb-2">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      {category.name}
                    </span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-foreground">{category.name}</h2>
                  <p className="text-muted-foreground mt-2">이 카테고리의 최신 상품들</p>
                </div>
                <Link href={`/products?category=${category.slug}`}>
                  <Button variant="outline" className="border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                    더보기 →
                  </Button>
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
  } catch (error: any) {
    // 에러 발생 시 에러 상태 표시
    return (
      <main className="min-h-[calc(100vh-80px)]">
        <div className="container mx-auto px-4 py-16">
          <ErrorState
            title="데이터를 불러오는데 실패했습니다"
            message={error?.message || "홈페이지 데이터를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요."}
          />
        </div>
      </main>
    );
  }
}
