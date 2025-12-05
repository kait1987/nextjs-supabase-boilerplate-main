"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
  productId: string;
  quantity?: number;
}

/**
 * 장바구니 추가 버튼 컴포넌트
 * 
 * 상품을 장바구니에 추가합니다. 로그인이 필요합니다.
 */
export function AddToCartButton({
  productId,
  quantity = 1,
}: AddToCartButtonProps) {
  const { userId, isSignedIn } = useAuth();
  const router = useRouter();
  const supabase = useClerkSupabaseClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddToCart = async () => {
    if (!isSignedIn || !userId) {
      router.push("/sign-in");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 기존 장바구니 항목 확인
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", userId)
        .eq("product_id", productId)
        .single();

      if (existingItem) {
        // 기존 항목이 있으면 수량 증가
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({
            quantity: existingItem.quantity + quantity,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingItem.id);

        if (updateError) throw updateError;
      } else {
        // 새 항목 추가
        const { error: insertError } = await supabase
          .from("cart_items")
          .insert({
            user_id: userId,
            product_id: productId,
            quantity,
          });

        if (insertError) throw insertError;
      }

      // 장바구니 페이지로 이동
      router.push("/cart");
      router.refresh();
    } catch (err: any) {
      console.error("Error adding to cart:", err);
      setError(err.message || "장바구니 추가에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleAddToCart}
        disabled={loading}
        className="w-full"
        size="lg"
        aria-label={loading ? "장바구니에 추가 중" : "장바구니에 추가"}
        aria-busy={loading}
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        {loading ? "추가 중..." : "장바구니에 추가"}
      </Button>
      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}

