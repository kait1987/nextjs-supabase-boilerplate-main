"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { formatPrice, formatDateTime } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Package, ShoppingBag } from "lucide-react";
import type { Order, OrderWithItems } from "@/types/database";

/**
 * 주문 내역 페이지
 * 
 * 사용자의 모든 주문 내역을 표시합니다.
 */
export default function MyOrdersPage() {
  const { userId, isSignedIn } = useAuth();
  const router = useRouter();
  const supabase = useClerkSupabaseClient();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setError(null);
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items(id, quantity)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data as OrderWithItems[]) || []);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(err.message || "주문 내역을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { text: string; bgColor: string; textColor: string }> = {
      pending: { text: "결제 대기", bgColor: "bg-yellow-100", textColor: "text-yellow-800" },
      paid: { text: "결제 완료", bgColor: "bg-green-100", textColor: "text-green-800" },
      cancelled: { text: "취소됨", bgColor: "bg-red-100", textColor: "text-red-800" },
      completed: { text: "완료", bgColor: "bg-blue-100", textColor: "text-blue-800" },
    };
    return labels[status] || { text: status, bgColor: "bg-muted", textColor: "text-foreground" };
  };

  const getTotalItemCount = (order: OrderWithItems) => {
    return order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  };

  if (!isSignedIn) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
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
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <Button onClick={fetchOrders}>다시 시도</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <ShoppingBag className="h-8 w-8" />
        <h1 className="text-4xl font-bold">주문 내역</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-xl mb-2">주문 내역이 없습니다.</p>
          <p className="text-muted-foreground text-sm mb-6">첫 주문을 시작해보세요!</p>
          <Link href="/products">
            <Button size="lg">상품 보러가기</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = getStatusLabel(order.status);
            const itemCount = getTotalItemCount(order);
            return (
              <Link
                key={order.id}
                href={`/my/orders/${order.id}`}
                className="block"
              >
                <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-card">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {order.order_number}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${status.bgColor} ${status.textColor}`}>
                          {status.text}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {formatDateTime(order.created_at)}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {itemCount}개 상품
                        </span>
                        {order.shipping_name && (
                          <span>수령인: {order.shipping_name}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {formatPrice(order.total_amount)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

