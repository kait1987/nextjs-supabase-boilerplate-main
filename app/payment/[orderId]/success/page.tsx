"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { updateOrderStatus } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

/**
 * 결제 성공 페이지
 * 
 * 결제가 완료되면 주문 상태를 업데이트합니다.
 */
export default function PaymentSuccessPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { userId, isSignedIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params;
      setOrderId(resolvedParams.orderId);

      // URL에서 paymentKey 추출
      const paymentKey = searchParams.get("paymentKey");
      const orderIdFromUrl = searchParams.get("orderId");

      if (paymentKey && orderIdFromUrl && isSignedIn) {
        try {
          await updateOrderStatus(
            orderIdFromUrl,
            "paid",
            paymentKey,
            "toss_payments"
          );
        } catch (err) {
          console.error("Error updating order status:", err);
        }
      }

      setLoading(false);
    };

    init();
  }, [params, searchParams, isSignedIn]);

  if (!isSignedIn) {
    router.push("/sign-in");
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>처리 중...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center py-12">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-4">결제가 완료되었습니다!</h1>
        <p className="text-gray-600 mb-8">
          주문이 성공적으로 처리되었습니다.
        </p>
        <div className="flex gap-4 justify-center">
          {orderId && (
            <Link href={`/my/orders/${orderId}`}>
              <Button size="lg">주문 상세 보기</Button>
            </Link>
          )}
          <Link href="/products">
            <Button variant="outline" size="lg">
              쇼핑 계속하기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

