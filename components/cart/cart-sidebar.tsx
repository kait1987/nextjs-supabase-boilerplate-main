"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { formatPrice } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { X, Plus, Minus, Trash2, ShoppingCart, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { CartItemWithProduct } from "@/types/database";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 장바구니 사이드바 컴포넌트
 * 
 * 오른쪽에 고정된 사이드바로 장바구니 항목을 표시하고 결제할 수 있습니다.
 */
export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { userId, isSignedIn } = useAuth();
  const router = useRouter();
  const supabase = useClerkSupabaseClient();
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && isSignedIn && userId) {
      fetchCartItems();
    }
  }, [isOpen, isSignedIn, userId]);

  // 장바구니가 비어있으면 사이드바를 닫음
  useEffect(() => {
    if (cartItems.length === 0 && isOpen) {
      onClose();
    }
  }, [cartItems.length, isOpen, onClose]);

  // 실시간 업데이트를 위한 구독
  useEffect(() => {
    if (!isOpen || !isSignedIn || !userId) return;

    const channel = supabase
      .channel("cart-sidebar-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cart_items",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchCartItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, isSignedIn, userId, supabase]);

  // 사이드바가 항상 보이므로 body 스크롤 잠금하지 않음

  const fetchCartItems = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          *,
          product:products(*)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCartItems((data as CartItemWithProduct[]) || []);
    } catch (err: any) {
      console.error("Error fetching cart items:", err);
      setError(err.message || "장바구니를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      const { error } = await supabase
        .from("cart_items")
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", cartItemId);

      if (error) throw error;
      fetchCartItems();
    } catch (err: any) {
      console.error("Error updating quantity:", err);
      setError(err.message || "수량 변경에 실패했습니다.");
    }
  };

  const removeItem = async (cartItemId: string) => {
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", cartItemId);

      if (error) throw error;
      fetchCartItems();
    } catch (err: any) {
      console.error("Error removing item:", err);
      setError(err.message || "삭제에 실패했습니다.");
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 사이드바 - 항상 보이도록 오버레이 제거, 작은 크기 */}
      <div className="fixed right-0 top-0 h-full w-full max-w-xs bg-white shadow-xl z-40 flex flex-col border-l">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-3 border-b">
          <h2 className="text-lg font-bold flex items-center gap-1.5">
            <ShoppingCart className="h-4 w-4" />
            장바구니
          </h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 px-2 text-xs"
              title="장바구니 숨기기"
            >
              <EyeOff className="h-3.5 w-3.5 mr-1" />
              숨기기
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={onClose}
              title="닫기"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="text-center py-8">
              <p>로딩 중...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">장바구니가 비어있습니다.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-2 flex gap-2"
                >
                  <Link
                    href={`/products/${item.product.id}`}
                    onClick={onClose}
                    className="w-16 h-16 bg-gray-100 rounded relative overflow-hidden flex-shrink-0"
                  >
                    {item.product.image_url ? (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        이미지 없음
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.product.id}`}
                      onClick={onClose}
                    >
                      <h3 className="font-semibold text-xs mb-0.5 hover:text-primary truncate">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-primary font-bold text-xs mb-1.5">
                      {formatPrice(item.product.price)}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5 border rounded">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-2.5 w-2.5" />
                        </Button>
                        <span className="w-6 text-center text-xs">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.product.stock < item.quantity + 1}
                        >
                          <Plus className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-red-500 hover:text-red-700"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 푸터 (총액 및 결제 버튼) */}
        {cartItems.length > 0 && (
          <div className="border-t p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold">총 결제금액</span>
              <span className="text-base font-bold text-primary">
                {formatPrice(totalAmount)}
              </span>
            </div>
            <Button
              onClick={handleCheckout}
              className="w-full"
              size="sm"
            >
              결제하기
            </Button>
            <Link href="/cart" onClick={onClose}>
              <Button variant="outline" className="w-full" size="sm">
                장바구니 전체보기
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

