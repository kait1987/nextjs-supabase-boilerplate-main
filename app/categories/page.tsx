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

  if (error) {
    console.error("Error fetching categories:", error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">카테고리</h1>

      {categoriesWithCount && categoriesWithCount.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesWithCount.map((category: any) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group"
            >
              <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <h2 className="text-2xl font-bold mb-2 group-hover:text-primary">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="text-gray-600 mb-4">{category.description}</p>
                )}
                <p className="text-sm text-gray-500">
                  {category.productCount}개의 상품
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">카테고리가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

