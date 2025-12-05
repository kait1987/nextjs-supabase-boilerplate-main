"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import Link from "next/link";

/**
 * 결제 실패 페이지
 * 
 * 결제 실패 시 표시되는 페이지입니다.
 * 주문 ID를 표시하고 주문 상세 페이지로 이동할 수 있습니다.
 */
export default function PaymentFailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);
  const errorCode = searchParams.get("code");
  const errorMessage = searchParams.get("message");

  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params;
      setOrderId(resolvedParams.orderId);
    };
    init();
  }, [params]);

  // 에러 메시지 개선
  const getErrorMessage = () => {
    if (errorMessage) {
      return errorMessage;
    }
    if (errorCode) {
      return `결제 처리 중 오류가 발생했습니다. (코드: ${errorCode})`;
    }
    return "결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center py-12">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-4">결제에 실패했습니다</h1>
        <p className="text-gray-600 mb-2">{getErrorMessage()}</p>
        {orderId && (
          <p className="text-sm text-gray-500 mb-4">
            주문 번호: {orderId}
          </p>
        )}
        {errorCode && (
          <p className="text-sm text-gray-500 mb-8">에러 코드: {errorCode}</p>
        )}
        <div className="flex gap-4 justify-center">
          {orderId && (
            <Link href={`/payment/${orderId}`}>
              <Button size="lg">다시 시도</Button>
            </Link>
          )}
          {!orderId && (
            <Button onClick={() => router.back()} size="lg">
              다시 시도
            </Button>
          )}
          {orderId && (
            <Link href={`/my/orders/${orderId}`}>
              <Button variant="outline" size="lg">
                주문 확인하기
              </Button>
            </Link>
          )}
          <Link href="/cart">
            <Button variant="outline" size="lg">
              장바구니로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

