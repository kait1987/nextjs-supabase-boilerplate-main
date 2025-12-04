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
    // 주문 번호 생성 (예: ORD-20250101-001)
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0].replace(/-/g, "");
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const orderNumber = `ORD-${dateStr}-${randomNum}`;

    // 주문 생성
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        order_number: orderNumber,
        total_amount: totalAmount,
        status: "pending",
        shipping_name: shippingInfo.shippingName,
        shipping_phone: shippingInfo.shippingPhone,
        shipping_address: shippingInfo.shippingAddress,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 주문 상품 생성
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product.name,
      product_price: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    }));

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
    console.error("Error creating order:", error);
    throw new Error(error.message || "주문 생성에 실패했습니다.");
  }
}

/**
 * 주문 상태 업데이트 Server Action
 */
export async function updateOrderStatus(
  orderId: string,
  status: "pending" | "paid" | "cancelled" | "completed",
  paymentId?: string,
  paymentMethod?: string
) {
  const supabase = createClerkSupabaseClient();

  try {
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
    console.error("Error updating order status:", error);
    throw new Error(error.message || "주문 상태 업데이트에 실패했습니다.");
  }
}

