"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { CartItemWithProduct } from "@/types/database";

interface CreateOrderParams {
  userId: string;
  cartItems: CartItemWithProduct[];
  totalAmount: number;
  shippingInfo: {
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
  };
}

/**
 * 주문 생성 Server Action
 * 
 * 장바구니 항목을 기반으로 주문을 생성합니다.
 */
export async function createOrder({
  userId,
  cartItems,
  totalAmount,
  shippingInfo,
}: CreateOrderParams) {
  const supabase = createClerkSupabaseClient();

  try {
    // 서버 사이드 합계 검증: 장바구니 항목을 데이터베이스에서 다시 조회하여 최신 가격으로 재계산
    const productIds = cartItems.map((item) => item.product_id);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, price")
      .in("id", productIds);

    if (productsError) {
      throw new Error("상품 정보를 불러오는데 실패했습니다.");
    }

    if (!products || products.length !== productIds.length) {
      throw new Error("일부 상품을 찾을 수 없습니다.");
    }

    // 상품 가격 맵 생성 (최신 가격)
    const priceMap = new Map(products.map((p) => [p.id, p.price]));

    // 서버에서 재계산한 총액
    const calculatedTotal = cartItems.reduce((sum, item) => {
      const productPrice = priceMap.get(item.product_id);
      if (!productPrice) {
        throw new Error(`상품 ${item.product_id}의 가격을 찾을 수 없습니다.`);
      }
      return sum + productPrice * item.quantity;
    }, 0);

    // 클라이언트에서 전달된 금액과 서버에서 계산한 금액 비교
    if (Math.abs(calculatedTotal - totalAmount) > 1) {
      // 1원 오차는 허용 (반올림 등으로 인한 미세한 차이)
      throw new Error(
        `주문 금액이 일치하지 않습니다. 계산된 금액: ${calculatedTotal}원, 전달된 금액: ${totalAmount}원`
      );
    }

    // 주문 번호 생성 (예: ORD-20250101-001)
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0].replace(/-/g, "");
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const orderNumber = `ORD-${dateStr}-${randomNum}`;

    // 검증된 금액으로 주문 생성
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        order_number: orderNumber,
        total_amount: calculatedTotal, // 서버에서 계산한 금액 사용
        status: "pending",
        shipping_name: shippingInfo.shippingName,
        shipping_phone: shippingInfo.shippingPhone,
        shipping_address: shippingInfo.shippingAddress,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 주문 상품 생성 (서버에서 조회한 최신 가격 사용)
    const orderItems = cartItems.map((item) => {
      const productPrice = priceMap.get(item.product_id);
      if (!productPrice) {
        throw new Error(`상품 ${item.product_id}의 가격을 찾을 수 없습니다.`);
      }
      return {
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product.name,
        product_price: productPrice, // 서버에서 조회한 최신 가격 사용
        quantity: item.quantity,
        subtotal: productPrice * item.quantity,
      };
    });

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // 장바구니 비우기
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      console.error("Error clearing cart:", deleteError);
      // 장바구니 삭제 실패는 주문 생성에 영향을 주지 않음
    }

    return order;
  } catch (error: any) {
    // 개발 환경에서 상세 로깅
    if (process.env.NODE_ENV === "development") {
      console.error("Error creating order:", {
        message: error.message,
        stack: error.stack,
        userId,
        cartItemsCount: cartItems.length,
      });
    }

    // 사용자 친화적 에러 메시지
    const errorMessage = error.message || "주문 생성에 실패했습니다. 잠시 후 다시 시도해주세요.";
    throw new Error(errorMessage);
  }
}

/**
 * 주문 상태 업데이트 Server Action
 * 
 * 주문 소유자 검증 및 중복 업데이트 방지를 포함합니다.
 */
export async function updateOrderStatus(
  orderId: string,
  status: "pending" | "paid" | "cancelled" | "completed",
  paymentId?: string,
  paymentMethod?: string,
  userId?: string
) {
  const supabase = createClerkSupabaseClient();

  try {
    // 주문 조회 및 소유자 검증
    const { data: existingOrder, error: fetchError } = await supabase
      .from("orders")
      .select("id, user_id, status")
      .eq("id", orderId)
      .single();

    if (fetchError) {
      throw new Error("주문을 찾을 수 없습니다.");
    }

    if (!existingOrder) {
      throw new Error("주문을 찾을 수 없습니다.");
    }

    // 주문 소유자 검증 (userId가 제공된 경우)
    if (userId && existingOrder.user_id !== userId) {
      throw new Error("이 주문에 대한 권한이 없습니다.");
    }

    // 이미 결제된 주문은 재업데이트 방지
    if (status === "paid" && existingOrder.status === "paid") {
      // 이미 결제된 주문이지만, payment_id가 없으면 업데이트 허용
      if (paymentId) {
        // payment_id가 이미 있는 경우 중복 업데이트 방지
        const { data: orderWithPayment } = await supabase
          .from("orders")
          .select("payment_id")
          .eq("id", orderId)
          .single();

        if (orderWithPayment?.payment_id) {
          // 이미 결제 정보가 있는 경우 업데이트하지 않음
          return existingOrder;
        }
      }
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (paymentId) {
      updateData.payment_id = paymentId;
    }

    if (paymentMethod) {
      updateData.payment_method = paymentMethod;
    }

    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    // 개발 환경에서 상세 로깅
    if (process.env.NODE_ENV === "development") {
      console.error("Error updating order status:", {
        message: error.message,
        stack: error.stack,
        orderId,
        status,
        userId,
      });
    }

    // 사용자 친화적 에러 메시지
    const errorMessage = error.message || "주문 상태 업데이트에 실패했습니다. 잠시 후 다시 시도해주세요.";
    throw new Error(errorMessage);
  }
}

