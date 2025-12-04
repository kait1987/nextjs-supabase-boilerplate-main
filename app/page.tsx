import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";

/**
 * 홈페이지
 * 
 * 인기 상품 목록을 표시합니다.
 */
export default async function Home() {
  const supabase = await createClient();

  // 최신 상품 8개 가져오기
  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(*)
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(8);

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

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
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
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">등록된 상품이 없습니다.</p>
            <p className="text-sm text-gray-400">
              Supabase Dashboard에서 상품을 등록해주세요.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
