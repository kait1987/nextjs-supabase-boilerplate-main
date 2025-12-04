"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { formatPrice, formatDateTime } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import type { OrderWithItems } from "@/types/database";

/**
 * 주문 상세 페이지
 * 
 * 주문의 상세 정보와 주문 상품 목록을 표시합니다.
 */
export default function OrderDetailPage() {
  const { userId, isSignedIn } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  const supabase = useClerkSupabaseClient();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const showSuccess = searchParams.get("success") === "true";

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
      setOrder(data as OrderWithItems);
    } catch (err: any) {
      console.error("Error fetching order:", err);
      router.push("/my/orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { text: string; color: string }> = {
      pending: { text: "결제 대기", color: "text-yellow-600" },
      paid: { text: "결제 완료", color: "text-green-600" },
      cancelled: { text: "취소됨", color: "text-red-600" },
      completed: { text: "완료", color: "text-blue-600" },
    };
    return labels[status] || { text: status, color: "text-gray-600" };
  };

  if (!isSignedIn) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>주문을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const status = getStatusLabel(order.status);

  return (
    <div className="container mx-auto px-4 py-8">
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-800">결제가 완료되었습니다!</p>
        </div>
      )}

      <div className="mb-8">
        <Link href="/my/orders" className="text-blue-600 hover:underline mb-4 inline-block">
          ← 주문 내역으로 돌아가기
        </Link>
        <h1 className="text-4xl font-bold">주문 상세</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 주문 정보 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 주문 기본 정보 */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">주문 정보</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">주문 번호</span>
                <span className="font-semibold">{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">주문 일시</span>
                <span>{formatDateTime(order.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">주문 상태</span>
                <span className={`font-semibold ${status.color}`}>
                  {status.text}
                </span>
              </div>
              {order.payment_method && (
                <div className="flex justify-between">
                  <span className="text-gray-600">결제 수단</span>
                  <span>{order.payment_method}</span>
                </div>
              )}
            </div>
          </div>

          {/* 배송 정보 */}
          {order.shipping_name && (
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">배송 정보</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">수령인: </span>
                  <span>{order.shipping_name}</span>
                </div>
                {order.shipping_phone && (
                  <div>
                    <span className="text-gray-600">전화번호: </span>
                    <span>{order.shipping_phone}</span>
                  </div>
                )}
                {order.shipping_address && (
                  <div>
                    <span className="text-gray-600">배송 주소: </span>
                    <span>{order.shipping_address}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 주문 상품 목록 */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">주문 상품</h2>
            <div className="space-y-4">
              {order.order_items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-semibold">{item.product_name}</p>
                    <p className="text-sm text-gray-500">
                      {formatPrice(item.product_price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {formatPrice(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 결제 요약 */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">결제 요약</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>상품 금액</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>배송비</span>
                <span>무료</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                <span>총 결제금액</span>
                <span className="text-primary">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

