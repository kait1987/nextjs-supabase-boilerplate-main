"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";

/**
 * 장바구니 개수를 가져오는 커스텀 훅
 * 
 * 장바구니 아이콘에 표시할 개수를 제공합니다.
 */
export function useCartCount() {
  const { userId, isSignedIn } = useAuth();
  const supabase = useClerkSupabaseClient();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isSignedIn || !userId) {
      setCount(0);
      return;
    }

    const fetchCount = async () => {
      try {
        const { count, error } = await supabase
          .from("cart_items")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId);

        if (error) throw error;
        setCount(count || 0);
      } catch (err) {
        console.error("Error fetching cart count:", err);
        setCount(0);
      }
    };

    fetchCount();

    // 실시간 업데이트를 위한 구독 (선택사항)
    const channel = supabase
      .channel("cart-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cart_items",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSignedIn, userId, supabase]);

  return count;
}

