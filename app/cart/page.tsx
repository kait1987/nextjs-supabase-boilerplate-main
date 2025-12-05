"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { formatPrice } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { CartItemWithProduct } from "@/types/database";

/**
 * 장바구니 페이지
 * 
 * 사용자의 장바구니 항목을 표시하고 수량 변경, 삭제, 주문하기 기능을 제공합니다.
 */
export default function CartPage() {
  const { userId, isSignedIn } = useAuth();
  const router = useRouter();
  const supabase = useClerkSupabaseClient();
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn || !userId) {
      router.push("/sign-in");
      return;
    }
    fetchCartItems();
  }, [isSignedIn, userId]);

  const fetchCartItems = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          *,
          product:products(*)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCartItems((data as CartItemWithProduct[]) || []);
    } catch (err: any) {
      console.error("Error fetching cart items:", err);
      setError(err.message || "장바구니를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      const { error } = await supabase
        .from("cart_items")
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", cartItemId);

      if (error) throw error;
      fetchCartItems();
    } catch (err: any) {
      console.error("Error updating quantity:", err);
      const errorMessage = err.message || "수량 변경에 실패했습니다. 잠시 후 다시 시도해주세요.";
      alert(errorMessage);
      fetchCartItems(); // 상태 동기화를 위해 다시 불러오기
    }
  };

  const removeItem = async (cartItemId: string) => {
    if (!confirm("장바구니에서 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", cartItemId);

      if (error) throw error;
      fetchCartItems();
    } catch (err: any) {
      console.error("Error removing item:", err);
      const errorMessage = err.message || "삭제에 실패했습니다. 잠시 후 다시 시도해주세요.";
      alert(errorMessage);
      fetchCartItems(); // 상태 동기화를 위해 다시 불러오기
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  if (!isSignedIn) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="h-24 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <ShoppingCart className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <p className="text-red-500 text-lg mb-2">{error}</p>
          <p className="text-muted-foreground text-sm mb-6">
            장바구니를 불러오는데 문제가 발생했습니다.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={fetchCartItems}>다시 시도</Button>
            <Link href="/products">
              <Button variant="outline">상품 보러가기</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">장바구니</h1>


      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg mb-4">장바구니가 비어있습니다.</p>
          <Link href="/products">
            <Button>상품 보러가기</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 장바구니 항목 목록 */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-4 flex gap-4"
              >
                <Link href={`/products/${item.product.id}`}>
                  <div className="w-24 h-24 bg-gray-100 rounded relative overflow-hidden flex-shrink-0">
                    {item.product.image_url ? (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        이미지 없음
                      </div>
                    )}
                  </div>
                </Link>
                <div className="flex-1">
                  <Link href={`/products/${item.product.id}`}>
                    <h3 className="font-semibold text-lg mb-1 hover:text-primary">
                      {item.product.name}
                    </h3>
                  </Link>
                  <p className="text-primary font-bold mb-2">
                    {formatPrice(item.product.price)}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 border rounded">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.product.stock < item.quantity + 1}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-muted-foreground">
                      소계: {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>

          {/* 주문 요약 */}
          <div className="lg:col-span-1">
            <div className="border rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">주문 요약</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>상품 금액</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>배송비</span>
                  <span>무료</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>총 결제금액</span>
                  <span className="text-primary">{formatPrice(totalAmount)}</span>
                </div>
              </div>
              <Link href="/checkout" className="block">
                <Button className="w-full" size="lg">
                  주문하기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

