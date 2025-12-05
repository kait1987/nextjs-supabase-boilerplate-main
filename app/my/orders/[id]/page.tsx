"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { formatPrice, formatDateTime } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Package, ArrowLeft } from "lucide-react";
import type { OrderWithItems, OrderItem } from "@/types/database";

interface OrderItemWithImage extends OrderItem {
  product_image_url?: string | null;
}

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
  const [error, setError] = useState<string | null>(null);
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
      setError(null);
      
      // 주문 정보 조회
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(`
          *,
          order_items(*)
        `)
        .eq("id", orderId)
        .eq("user_id", userId)
        .single();

      if (orderError) throw orderError;
      if (!orderData) {
        throw new Error("주문을 찾을 수 없습니다.");
      }

      // 주문 상품들의 이미지 URL 조회
      const orderItems = orderData.order_items as OrderItem[];
      const productIds = orderItems.map((item) => item.product_id);
      
      let productImages: Map<string, string | null> = new Map();
      if (productIds.length > 0) {
        const { data: products, error: productsError } = await supabase
          .from("products")
          .select("id, image_url")
          .in("id", productIds);

        if (!productsError && products) {
          products.forEach((product) => {
            productImages.set(product.id, product.image_url);
          });
        }
      }

      // 주문 상품에 이미지 URL 추가
      const orderItemsWithImages: OrderItemWithImage[] = orderItems.map((item) => ({
        ...item,
        product_image_url: productImages.get(item.product_id) || null,
      }));

      setOrder({
        ...orderData,
        order_items: orderItemsWithImages,
      } as OrderWithItems);
    } catch (err: any) {
      console.error("Error fetching order:", err);
      setError(err.message || "주문 정보를 불러오는데 실패했습니다.");
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
    return labels[status] || { text: status, color: "text-muted-foreground" };
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
            <div className="lg:col-span-2 space-y-6">
              <div className="border rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
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

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <Package className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <p className="text-red-500 text-xl mb-2">
            {error || "주문을 찾을 수 없습니다."}
          </p>
          <p className="text-muted-foreground text-sm mb-6">
            주문이 존재하지 않거나 접근 권한이 없습니다.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push("/my/orders")} variant="outline">
              주문 내역으로 돌아가기
            </Button>
            <Button onClick={fetchOrder}>다시 시도</Button>
          </div>
        </div>
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
        <Link 
          href="/my/orders" 
          className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          주문 내역으로 돌아가기
        </Link>
        <h1 className="text-4xl font-bold text-foreground">주문 상세</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 주문 정보 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 주문 기본 정보 */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-foreground">주문 정보</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">주문 번호</span>
                <span className="font-semibold text-foreground">{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">주문 일시</span>
                <span className="text-foreground">{formatDateTime(order.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">주문 상태</span>
                <span className={`font-semibold ${status.color}`}>
                  {status.text}
                </span>
              </div>
              {order.payment_method && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">결제 수단</span>
                  <span className="text-foreground">{order.payment_method}</span>
                </div>
              )}
            </div>
          </div>

          {/* 배송 정보 */}
          {order.shipping_name && (
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-foreground">배송 정보</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">수령인: </span>
                  <span className="text-foreground">{order.shipping_name}</span>
                </div>
                {order.shipping_phone && (
                  <div>
                    <span className="text-muted-foreground">전화번호: </span>
                    <span className="text-foreground">{order.shipping_phone}</span>
                  </div>
                )}
                {order.shipping_address && (
                  <div>
                    <span className="text-muted-foreground">배송 주소: </span>
                    <span className="text-foreground">{order.shipping_address}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 주문 상품 목록 */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-foreground">주문 상품</h2>
            <div className="space-y-4">
              {order.order_items.map((item) => {
                const orderItem = item as OrderItemWithImage;
                return (
                  <Link
                    key={item.id}
                    href={`/products/${item.product_id}`}
                    className="block"
                  >
                    <div className="flex gap-4 items-center py-4 border-b last:border-0 hover:bg-muted rounded-lg p-2 -m-2 transition-colors">
                      {/* 상품 이미지 */}
                      <div className="w-20 h-20 bg-muted rounded relative overflow-hidden flex-shrink-0">
                        {orderItem.product_image_url ? (
                          <Image
                            src={orderItem.product_image_url}
                            alt={item.product_name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                            이미지 없음
                          </div>
                        )}
                      </div>
                      
                      {/* 상품 정보 */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base mb-1 hover:text-primary transition-colors">
                          {item.product_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.product_price)} × {item.quantity}개
                        </p>
                      </div>
                      
                      {/* 소계 */}
                      <div className="text-right">
                        <p className="font-semibold text-lg">
                          {formatPrice(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* 결제 요약 */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4 text-foreground">결제 요약</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-muted-foreground">
                <span>상품 금액</span>
                <span className="text-foreground">{formatPrice(order.total_amount)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>배송비</span>
                <span className="text-foreground">무료</span>
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

