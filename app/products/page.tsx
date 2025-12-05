/**
 * @file page.tsx
 * @description 상품 목록 페이지
 *
 * 모든 활성화된 상품을 카테고리별로 필터링, 정렬, 페이지네이션하여 표시합니다.
 * ProductCard와 ProductGrid 컴포넌트를 사용하여 재사용 가능한 구조로 구현되었습니다.
 *
 * @dependencies
 * - @/lib/supabase/server: Supabase 클라이언트
 * - @/components/products/product-grid: ProductGrid 컴포넌트
 * - @/components/products/pagination: Pagination 컴포넌트
 * - @/components/ui/button: Button 컴포넌트
 * - @/types/database: ProductWithCategory 타입
 */

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/products/product-grid";
import { Pagination } from "@/components/products/pagination";
import { ProductSort } from "@/components/products/product-sort";
import { ProductWithCategory } from "@/types/database";

type SortOption = "latest" | "price_asc" | "price_desc" | "name_asc";

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    page?: string;
  }>;
}

// 정렬 옵션 정의
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "latest", label: "최신순" },
  { value: "price_asc", label: "가격 낮은순" },
  { value: "price_desc", label: "가격 높은순" },
  { value: "name_asc", label: "이름순" },
];

// 페이지당 상품 개수
const ITEMS_PER_PAGE = 12;


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
  if (params.page && params.page > 1) searchParams.set("page", params.page.toString());
  return searchParams.toString() ? `?${searchParams.toString()}` : "";
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const supabase = await createClient();
  const resolvedSearchParams = await searchParams;
  const categorySlug = resolvedSearchParams.category;
  const sortParam = (resolvedSearchParams.sort || "latest") as SortOption;
  const currentPage = Math.max(1, parseInt(resolvedSearchParams.page || "1", 10));

  // 카테고리 목록 가져오기
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  // 카테고리 조회 에러 처리
  let hasCategoriesError = false;
  if (categoriesError) {
    // 테이블이 없는 경우 플래그 설정 (카테고리 필터는 숨김)
    if (
      categoriesError.code === "PGRST205" ||
      categoriesError.message?.includes("Could not find the table")
    ) {
      hasCategoriesError = true;
      // 개발 환경에서만 로깅
      if (process.env.NODE_ENV === "development") {
        console.warn("Categories table not found - category filter will be hidden");
      }
    } else {
      // 기타 에러는 로깅
      console.error("Error fetching categories:", JSON.stringify(categoriesError, null, 2));
    }
  }

  // 카테고리 필터링을 위한 카테고리 조회
  let categoryId: string | undefined;
  if (categorySlug && !hasCategoriesError) {
    const { data: category, error: categoryLookupError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();

    if (categoryLookupError) {
      console.error("Error fetching category by slug:", JSON.stringify(categoryLookupError, null, 2));
      // 카테고리 조회 실패 시 categoryId는 undefined로 유지
    } else if (category) {
      categoryId = category.id;
    }
  }

  // 총 개수 조회 (페이지네이션용)
  let countQuery = supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)
    .gt("stock", 0);

  if (categoryId) {
    countQuery = countQuery.eq("category_id", categoryId);
  }

  const { count, error: countError } = await countQuery;

  // 상품 목록 쿼리 생성
  // 외래키 관계 쿼리 대신 별도 쿼리로 변경 (PGRST200 에러 방지)
  let productsQuery = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .gt("stock", 0); // 재고가 있는 상품만 표시

  // 카테고리 필터링
  if (categoryId) {
    productsQuery = productsQuery.eq("category_id", categoryId);
  }

  // 정렬 적용
  switch (sortParam) {
    case "latest":
      productsQuery = productsQuery.order("created_at", { ascending: false });
      break;
    case "price_asc":
      productsQuery = productsQuery.order("price", { ascending: true });
      break;
    case "price_desc":
      productsQuery = productsQuery.order("price", { ascending: false });
      break;
    case "name_asc":
      productsQuery = productsQuery.order("name", { ascending: true });
      break;
    default:
      productsQuery = productsQuery.order("created_at", { ascending: false });
  }

  // 페이지네이션 적용
  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  productsQuery = productsQuery.range(from, to);

  const { data: products, error } = await productsQuery;

  // 에러 처리 - products 쿼리 실패 시
  if (error) {
    // 테이블이 없는 경우 사용자 친화적인 메시지 표시
    if (error.code === "PGRST205" || error.message?.includes("Could not find the table")) {
      // 개발 환경에서만 로깅
      if (process.env.NODE_ENV === "development") {
        console.warn("Products table not found - showing setup instructions");
      }
      
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center py-16">
            <h1 className="text-4xl font-bold mb-4">데이터베이스 설정 필요</h1>
            <p className="text-lg text-gray-600 mb-6">
              상품 테이블이 데이터베이스에 생성되지 않았습니다.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-left">
              <h2 className="font-semibold text-lg mb-3">해결 방법:</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Supabase 대시보드에 접속합니다</li>
                <li>SQL Editor로 이동합니다</li>
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    supabase/migrations/20250101000001_create_ecommerce_schema.sql
                  </code>
                  파일의 내용을 실행합니다
                </li>
                <li>또는 Supabase CLI를 사용하여 마이그레이션을 적용합니다:
                  <pre className="bg-gray-100 p-2 rounded mt-2 text-sm">
                    supabase db push
                  </pre>
                </li>
              </ol>
            </div>
          </div>
        </div>
      );
    }

    // PGRST200 에러 (외래키 관계를 찾을 수 없음) - 별도 쿼리로 처리하므로 무시
    if (error.code === "PGRST200" || error.message?.includes("Could not find a relationship")) {
      // 개발 환경에서만 로깅
      if (process.env.NODE_ENV === "development") {
        console.warn("Foreign key relationship not found - using separate queries instead");
      }
      // 에러를 무시하고 계속 진행 (별도 쿼리로 카테고리 정보를 가져올 예정)
    } 
    // 42703 에러 (컬럼이 존재하지 않음) - stock 컬럼이 없는 경우
    else if (error.code === "42703" || error.message?.includes("does not exist")) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center py-16">
            <h1 className="text-4xl font-bold mb-4">데이터베이스 스키마 업데이트 필요</h1>
            <p className="text-lg text-gray-600 mb-6">
              상품 테이블에 <code className="bg-gray-100 px-2 py-1 rounded">stock</code> 컬럼이 없습니다.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-left">
              <h2 className="font-semibold text-lg mb-3">해결 방법:</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Supabase 대시보드에 접속합니다</li>
                <li>SQL Editor로 이동합니다</li>
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    supabase/migrations/20250102000000_add_stock_column.sql
                  </code>
                  파일의 내용을 실행합니다
                </li>
                <li>또는 다음 SQL을 직접 실행합니다:
                  <pre className="bg-gray-100 p-2 rounded mt-2 text-sm overflow-x-auto">
{`ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0 NOT NULL;`}
                  </pre>
                </li>
              </ol>
            </div>
          </div>
        </div>
      );
    } else {
      // 기타 에러의 경우 일반적인 에러 메시지 표시
      console.error("Error fetching products:", JSON.stringify(error, null, 2));
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center py-16">
            <h1 className="text-4xl font-bold mb-4">상품을 불러올 수 없습니다</h1>
            <p className="text-lg text-gray-600 mb-6">
              상품 목록을 가져오는 중 오류가 발생했습니다.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-left">
              <h2 className="font-semibold text-lg mb-3 text-red-800">에러 정보:</h2>
              <p className="text-sm text-red-700 mb-2">
                {error.message || "알 수 없는 오류가 발생했습니다."}
              </p>
              {error.code && (
                <p className="text-xs text-red-600">
                  에러 코드: <code className="bg-red-100 px-1 rounded">{error.code}</code>
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }
  }

  // countError 처리 (페이지네이션에 영향이 있지만 상품 목록은 표시 가능)
  if (countError) {
    console.error("Error fetching product count:", JSON.stringify(countError, null, 2));
    // count 에러는 로깅만 하고 계속 진행 (상품 목록은 표시 가능)
  }

  // 재고가 없는 상품은 제외 (품절 상품)
  const availableProductsRaw = products?.filter((p: any) => p.stock > 0) || [];

  // 카테고리 정보를 별도로 조회하여 병합 (PGRST200 에러 방지)
  const availableProducts = await Promise.all(
    availableProductsRaw.map(async (product: any) => {
      if (product.category_id && !hasCategoriesError) {
        const { data: category } = await supabase
          .from("categories")
          .select("*")
          .eq("id", product.category_id)
          .single();
        return { ...product, category: category || null };
      }
      return { ...product, category: null };
    })
  ) as ProductWithCategory[];

  // 총 페이지 수 계산
  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-4xl font-bold">상품 목록</h1>

          {/* 정렬 선택 */}
          <ProductSort currentSort={sortParam} />
        </div>

        {/* 카테고리 필터 */}
        {!hasCategoriesError && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Link href={buildQueryString({ sort: sortParam })}>
              <Button
                variant={!categorySlug ? "default" : "outline"}
                size="sm"
              >
                전체
              </Button>
            </Link>
            {categories?.map((category) => {
              const queryString = buildQueryString({
                category: category.slug,
                sort: sortParam,
              });
              return (
                <Link key={category.id} href={`/products${queryString}`}>
                  <Button
                    variant={categorySlug === category.slug ? "default" : "outline"}
                    size="sm"
                  >
                    {category.name}
                  </Button>
                </Link>
              );
            })}
          </div>
        )}
        {hasCategoriesError && (
          <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              카테고리 필터를 사용할 수 없습니다. 데이터베이스에 카테고리 테이블이 생성되지 않았습니다.
            </p>
          </div>
        )}
      </div>

      {/* 상품 그리드 */}
      <ProductGrid
        products={availableProducts}
        columns={{ mobile: 1, sm: 2, lg: 3, xl: 4 }}
        emptyMessage="상품이 없습니다."
      />

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            category={categorySlug}
            sort={sortParam}
          />
        </div>
      )}
    </div>
  );
}

