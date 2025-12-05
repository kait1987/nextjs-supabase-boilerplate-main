"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { formatPrice } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "@/app/actions/orders";
import type { Order, OrderWithItems } from "@/types/database";
import { PaymentWidget } from "@/components/payment/payment-widget";
import { LoadingSkeleton, CardSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";

/**
 * 결제 페이지
 * 
 * Toss Payments를 사용하여 결제를 진행합니다.
 */
export default function PaymentPage() {
  const { userId, isSignedIn } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  const supabase = useClerkSupabaseClient();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn || !userId) {
      router.push("/sign-in");
      return;
    }
    fetchOrder();
  }, [isSignedIn, userId, orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items(*)
        `)
        .eq("id", orderId)
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error("주문을 찾을 수 없습니다.");
      }

      // 이미 결제 완료된 주문 처리
      if (data.status === "paid") {
        // 결제 완료된 주문은 주문 상세로 이동
        router.push(`/my/orders/${orderId}`);
        return;
      }

      // 취소된 주문 처리
      if (data.status === "cancelled") {
        setError("이 주문은 취소되었습니다.");
        return;
      }

      // 완료된 주문 처리
      if (data.status === "completed") {
        router.push(`/my/orders/${orderId}`);
        return;
      }

      // pending 상태인 주문만 결제 진행
      if (data.status === "pending") {
        setOrder(data as OrderWithItems);
      } else {
        throw new Error("결제할 수 없는 주문 상태입니다.");
      }
    } catch (err: any) {
      console.error("Error fetching order:", err);
      setError(err.message || "주문 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    try {
      await updateOrderStatus(orderId, "paid", paymentId, "toss_payments");
      router.push(`/my/orders/${orderId}?success=true`);
    } catch (err: any) {
      console.error("Error updating order status:", err);
      setError("결제는 완료되었지만 주문 상태 업데이트에 실패했습니다.");
    }
  };

  const handlePaymentCancel = () => {
    router.push("/cart");
  };

  if (!isSignedIn) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <LoadingSkeleton variant="text" width="200px" height="32px" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <CardSkeleton lines={4} />
              <CardSkeleton lines={2} />
            </div>
            <div className="lg:col-span-1">
              <CardSkeleton lines={3} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorState
          message={error || "주문을 찾을 수 없습니다."}
          onRetry={fetchOrder}
          retryLabel="다시 시도"
        >
          <div className="flex gap-4 justify-center mt-4">
            {orderId && (
              <Button variant="outline" onClick={() => router.push(`/my/orders/${orderId}`)}>
                주문 확인하기
              </Button>
            )}
            <Button onClick={() => router.push("/cart")}>장바구니로 돌아가기</Button>
          </div>
        </ErrorState>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">결제하기</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 결제 정보 */}
        <div className="lg:col-span-2">
          <div className="border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">주문 정보</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">주문 번호</span>
                <span className="font-semibold">{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">수령인</span>
                <span>{order.shipping_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">전화번호</span>
                <span>{order.shipping_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">배송 주소</span>
                <span className="text-right">{order.shipping_address}</span>
              </div>
            </div>
          </div>

          <PaymentWidget
            orderId={orderId}
            amount={order.total_amount}
            orderName={`주문번호: ${order.order_number}`}
            customerName={order.shipping_name}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </div>

        {/* 결제 요약 */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">결제 요약</h2>
            <div className="space-y-2 mb-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.product_name} × {item.quantity}
                  </span>
                  <span>{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>총 결제금액</span>
                <span className="text-primary">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

