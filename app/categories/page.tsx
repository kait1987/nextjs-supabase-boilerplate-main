import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * 카테고리 목록 페이지
 * 
 * 모든 카테고리를 표시하고 각 카테고리의 상품으로 이동할 수 있습니다.
 */
export default async function CategoriesPage() {
  const supabase = await createClient();

  // 카테고리 목록 가져오기
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  // 에러 처리
  if (error) {
    // 테이블이 없는 경우 사용자 친화적인 메시지 표시
    if (error.code === "PGRST205" || error.message?.includes("Could not find the table")) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center py-16">
            <h1 className="text-4xl font-bold mb-4 text-foreground">데이터베이스 설정 필요</h1>
            <p className="text-lg text-muted-foreground mb-6">
              카테고리 테이블이 데이터베이스에 생성되지 않았습니다.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-left">
              <h2 className="font-semibold text-lg mb-3 text-foreground">해결 방법:</h2>
              <ol className="list-decimal list-inside space-y-2 text-foreground">
                <li>Supabase 대시보드에 접속합니다</li>
                <li>SQL Editor로 이동합니다</li>
                <li>
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    supabase/migrations/20250101000001_create_ecommerce_schema.sql
                  </code>
                  파일의 내용을 실행합니다
                </li>
              </ol>
            </div>
          </div>
        </div>
      );
    }
    
    // 기타 에러는 로깅
    console.error("Error fetching categories:", JSON.stringify(error, null, 2));
  }

  // 각 카테고리의 상품 개수 가져오기
  const categoriesWithCount = await Promise.all(
    (categories || []).map(async (category) => {
      const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("category_id", category.id)
        .eq("is_active", true)
        .gt("stock", 0);

      return {
        ...category,
        productCount: count || 0,
      };
    })
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-foreground">카테고리</h1>

      {categoriesWithCount && categoriesWithCount.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesWithCount.map((category: any) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group"
            >
              <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <h2 className="text-2xl font-bold mb-2 group-hover:text-primary text-foreground">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="text-muted-foreground mb-4">{category.description}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {category.productCount}개의 상품
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">카테고리가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

