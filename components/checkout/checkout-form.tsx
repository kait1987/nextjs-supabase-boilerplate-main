"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CartItemWithProduct } from "@/types/database";
import { createOrder } from "@/app/actions/orders";

interface CheckoutFormProps {
  cartItems: CartItemWithProduct[];
  totalAmount: number;
}

/**
 * 주문 폼 컴포넌트
 * 
 * 배송 정보를 입력받고 결제를 진행합니다.
 */
export function CheckoutForm({ cartItems, totalAmount }: CheckoutFormProps) {
  const { userId } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    shippingName: "",
    shippingPhone: "",
    shippingAddress: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      // 주문 생성
      const order = await createOrder({
        userId,
        cartItems,
        totalAmount,
        shippingInfo: formData,
      });

      if (!order) {
        throw new Error("주문 생성에 실패했습니다.");
      }

      // 결제 페이지로 이동
      router.push(`/payment/${order.id}`);
    } catch (err: any) {
      console.error("Error creating order:", err);
      setError(err.message || "주문 처리에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-bold mb-4">배송 정보</h2>

        <div className="space-y-2">
          <Label htmlFor="shippingName">수령인 이름 *</Label>
          <Input
            id="shippingName"
            required
            value={formData.shippingName}
            onChange={(e) =>
              setFormData({ ...formData, shippingName: e.target.value })
            }
            placeholder="홍길동"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shippingPhone">전화번호 *</Label>
          <Input
            id="shippingPhone"
            type="tel"
            required
            value={formData.shippingPhone}
            onChange={(e) =>
              setFormData({ ...formData, shippingPhone: e.target.value })
            }
            placeholder="010-1234-5678"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shippingAddress">배송 주소 *</Label>
          <Textarea
            id="shippingAddress"
            required
            value={formData.shippingAddress}
            onChange={(e) =>
              setFormData({ ...formData, shippingAddress: e.target.value })
            }
            placeholder="서울시 강남구 테헤란로 123"
            rows={3}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? "처리 중..." : "결제하기"}
      </Button>
    </form>
  );
}

