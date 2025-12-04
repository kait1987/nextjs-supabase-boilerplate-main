"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import Link from "next/link";

/**
 * 결제 실패 페이지
 */
export default function PaymentFailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("code");
  const errorMessage = searchParams.get("message");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center py-12">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-4">결제에 실패했습니다</h1>
        {errorMessage && (
          <p className="text-gray-600 mb-2">{errorMessage}</p>
        )}
        {errorCode && (
          <p className="text-sm text-gray-500 mb-8">에러 코드: {errorCode}</p>
        )}
        <div className="flex gap-4 justify-center">
          <Button onClick={() => router.back()} size="lg">
            다시 시도
          </Button>
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

