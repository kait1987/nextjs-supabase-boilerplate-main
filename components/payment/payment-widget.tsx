"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Script from "next/script";

interface PaymentWidgetProps {
  orderId: string;
  amount: number;
  orderName: string;
  customerName: string;
  onSuccess: (paymentId: string) => void;
  onCancel: () => void;
}

/**
 * Toss Payments 결제 위젯 컴포넌트
 * 
 * 테스트 모드로 결제를 진행합니다.
 * 
 * @see {@link https://docs.tosspayments.com/guides/v1/payment-widget/integration Toss Payments 문서}
 */
export function PaymentWidget({
  orderId,
  amount,
  orderName,
  customerName,
  onSuccess,
  onCancel,
}: PaymentWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const paymentWidgetRef = useRef<any>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Toss Payments 클라이언트 키 (테스트 모드)
  // 환경 변수에서 가져오거나 기본 테스트 키 사용
  const CLIENT_KEY =
    process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY ||
    "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";

  const handlePayment = () => {
    if (!window.TossPayments || !paymentWidgetRef.current) {
      setError("결제 스크립트가 로드되지 않았습니다.");
      return;
    }

    try {
      paymentWidgetRef.current
        .requestPayment("카드", {
          amount,
          orderId,
          orderName,
          customerName,
          successUrl: `${window.location.origin}/payment/${orderId}/success`,
          failUrl: `${window.location.origin}/payment/${orderId}/fail`,
        })
        .then((response: any) => {
          // 결제 성공
          if (response.paymentKey) {
            onSuccess(response.paymentKey);
          }
        })
        .catch((err: any) => {
          if (err.code === "USER_CANCEL") {
            // 사용자 취소는 정상 동작이므로 에러로 처리하지 않음
            onCancel();
          } else {
            console.error("Payment error:", err);
            setError(err.message || "결제 처리 중 오류가 발생했습니다.");
          }
        });
    } catch (err: any) {
      console.error("Error requesting payment:", err);
      setError("결제 요청에 실패했습니다.");
    }
  };

  useEffect(() => {
    if (scriptLoaded && window.TossPayments) {
      try {
        const widget = window.TossPayments(CLIENT_KEY);
        paymentWidgetRef.current = widget;
        setLoading(false);
      } catch (err: any) {
        console.error("Error initializing payment widget:", err);
        setError("결제 위젯 초기화에 실패했습니다.");
        setLoading(false);
      }
    }
  }, [scriptLoaded, CLIENT_KEY]);

  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">결제 수단 선택</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p>결제 위젯을 불러오는 중...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <Button onClick={handlePayment} className="w-full" size="lg">
            카드로 결제하기
          </Button>

          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>※ 테스트 모드로 운영 중입니다.</p>
            <p>테스트 카드 번호: 1234-5678-9012-3456</p>
            <p>유효기간: 12/34, CVC: 123</p>
          </div>
        </div>
      )}

      <Script
        src="https://js.tosspayments.com/v1/payment"
        onLoad={() => {
          setScriptLoaded(true);
        }}
        onError={() => {
          setError("결제 스크립트를 불러오는데 실패했습니다.");
          setLoading(false);
        }}
      />
    </div>
  );
}

// TossPayments 타입 선언
declare global {
  interface Window {
    TossPayments: (clientKey: string) => {
      requestPayment: (
        method: string,
        options: {
          amount: number;
          orderId: string;
          orderName: string;
          customerName: string;
          successUrl: string;
          failUrl: string;
        }
      ) => Promise<{
        paymentKey: string;
        orderId: string;
        amount: number;
      }>;
    };
  }
}


