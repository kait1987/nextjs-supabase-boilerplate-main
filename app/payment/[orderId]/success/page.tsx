"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { updateOrderStatus } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

/**
 * 결제 성공 페이지
 * 
 * 결제가 완료되면 주문 상태를 업데이트합니다.
 * 중복 업데이트 방지 및 에러 처리를 포함합니다.
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
  const [error, setError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const hasUpdatedRef = useRef(false);

  useEffect(() => {
    const init = async () => {
      if (!isSignedIn || !userId) {
        router.push("/sign-in");
        return;
      }

      const resolvedParams = await params;
      const resolvedOrderId = resolvedParams.orderId;
      setOrderId(resolvedOrderId);

      // URL에서 paymentKey 추출 (Toss Payments 리다이렉트 파라미터)
      const paymentKey = searchParams.get("paymentKey");
      const orderIdFromUrl = searchParams.get("orderId");

      // 경로 파라미터의 orderId를 우선 사용
      const targetOrderId = resolvedOrderId || orderIdFromUrl;

      if (paymentKey && targetOrderId && !hasUpdatedRef.current) {
        hasUpdatedRef.current = true;
        try {
          await updateOrderStatus(
            targetOrderId,
            "paid",
            paymentKey,
            "toss_payments",
            userId
          );
          setUpdateSuccess(true);
        } catch (err: any) {
          console.error("Error updating order status:", err);
          setError(err.message || "주문 상태 업데이트에 실패했습니다.");
        }
      } else if (!paymentKey) {
        // paymentKey가 없는 경우 (이미 처리되었거나 잘못된 접근)
        setError("결제 정보를 찾을 수 없습니다.");
      }

      setLoading(false);
    };

    init();
  }, [params, searchParams, isSignedIn, userId, router]);

  if (!isSignedIn) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center py-12">
          <p>처리 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center py-12">
        {error ? (
          <>
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">처리 중 오류가 발생했습니다</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <div className="flex gap-4 justify-center">
              {orderId && (
                <Link href={`/my/orders/${orderId}`}>
                  <Button size="lg">주문 확인하기</Button>
                </Link>
              )}
              <Button variant="outline" size="lg" onClick={() => window.location.reload()}>
                다시 시도
              </Button>
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}

