"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { formatPrice } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CartItemWithProduct } from "@/types/database";
import { CheckoutForm } from "@/components/checkout/checkout-form";

/**
 * 주문 페이지
 * 
 * 배송 정보를 입력하고 결제를 진행합니다.
 */
export default function CheckoutPage() {
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
      setError(null);
    } catch (err: any) {
      console.error("Error fetching cart items:", err);
      setError(err.message || "장바구니를 불러오는데 실패했습니다.");
      // 장바구니가 비어있거나 에러가 발생하면 장바구니 페이지로 이동
      setTimeout(() => {
        router.push("/cart");
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="border rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
                <div className="space-y-4">
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="border rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-500 text-lg mb-2">{error}</p>
          <p className="text-muted-foreground text-sm mb-6">
            장바구니 페이지로 이동합니다...
          </p>
          <Button onClick={() => router.push("/cart")}>장바구니로 이동</Button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg mb-4">장바구니가 비어있습니다.</p>
          <Button onClick={() => router.push("/cart")}>장바구니로 이동</Button>
        </div>
      </div>
    );
  }

  const totalAmount = cartItems.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">주문하기</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 주문 정보 입력 폼 */}
        <div className="lg:col-span-2">
          <CheckoutForm cartItems={cartItems} totalAmount={totalAmount} />
        </div>

        {/* 주문 요약 */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">주문 요약</h2>
            <div className="space-y-4 mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span>{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-2">
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
          </div>
        </div>
      </div>
    </div>
  );
}

