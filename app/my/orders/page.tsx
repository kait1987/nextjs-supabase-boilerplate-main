"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { formatPrice, formatDateTime } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Order } from "@/types/database";

/**
 * 주문 내역 페이지
 * 
 * 사용자의 모든 주문 내역을 표시합니다.
 */
export default function MyOrdersPage() {
  const { userId, isSignedIn } = useAuth();
  const router = useRouter();
  const supabase = useClerkSupabaseClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn || !userId) {
      router.push("/sign-in");
      return;
    }
    fetchOrders();
  }, [isSignedIn, userId]);

  const fetchOrders = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">주문 내역</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">주문 내역이 없습니다.</p>
          <Link href="/products">
            <Button>상품 보러가기</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = getStatusLabel(order.status);
            return (
              <Link
                key={order.id}
                href={`/my/orders/${order.id}`}
                className="block"
              >
                <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">
                        {order.order_number}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold mb-1 ${status.color}`}
                      >
                        {status.text}
                      </p>
                      <p className="text-xl font-bold text-primary">
                        {formatPrice(order.total_amount)}
                      </p>
                    </div>
                  </div>
                  {order.shipping_name && (
                    <p className="text-sm text-gray-600">
                      수령인: {order.shipping_name}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

