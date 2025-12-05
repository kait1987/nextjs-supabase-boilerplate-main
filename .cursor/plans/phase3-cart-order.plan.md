# Phase 3: 장바구니 & 주문 개발 플랜

## 개요

Phase 3에서는 장바구니 기능을 완성하고 주문 생성 프로세스를 개선합니다. 현재 기본 구현은 완료되었으나, 합계 검증, 재고 검증, 주문 메모 기능 등을 추가하여 안정성과 사용자 경험을 향상시킵니다.

## 현재 상태

### 완료된 기능
- 장바구니 담기/삭제/수량 변경 (`app/cart/page.tsx`, `components/cart/add-to-cart-button.tsx`)
- 주문 생성 기본 흐름 (`app/checkout/page.tsx`, `components/checkout/checkout-form.tsx`)
- 주문 저장 로직 (`app/actions/orders.ts`)

### 개선 필요 사항
- 주문 메모 필드 추가 (TODO에 명시됨)
- 서버 사이드 합계 검증 강화
- 재고 검증 로직 추가
- 에러 처리 개선

## 작업 항목

### 1. 데이터베이스 스키마 업데이트

**파일**: `supabase/migrations/20250103000000_add_order_note.sql`

orders 테이블에 `order_note` 컬럼 추가:

```sql
-- orders 테이블에 주문 메모 필드 추가
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_note TEXT;
```

### 2. 타입 정의 업데이트

**파일**: `types/database.ts`

Order 인터페이스에 `order_note` 필드 추가:

```typescript
export interface Order {
  // ... 기존 필드
  order_note: string | null;
}
```

### 3. 주문 폼에 메모 필드 추가

**파일**: `components/checkout/checkout-form.tsx`

- `formData`에 `orderNote` 필드 추가
- Textarea 컴포넌트로 주문 메모 입력 필드 추가 (선택사항)
- `createOrder` 호출 시 `orderNote` 전달

### 4. 주문 생성 로직 개선

**파일**: `app/actions/orders.ts`

#### 4.1 서버 사이드 합계 검증
- `createOrder` 함수 내에서 `cartItems`를 데이터베이스에서 다시 조회
- 각 상품의 최신 가격으로 합계 재계산
- 클라이언트에서 전달된 `totalAmount`와 비교하여 불일치 시 에러 발생

#### 4.2 재고 검증
- 주문 생성 전 각 상품의 재고 확인
- `quantity > stock`인 경우 에러 발생
- 품절 상품이 있는 경우 에러 발생

#### 4.3 주문 메모 저장
- `CreateOrderParams` 인터페이스에 `orderNote` 필드 추가
- `orders` 테이블 insert 시 `order_note` 포함

#### 4.4 에러 처리 개선
- 재고 부족 시 명확한 에러 메시지
- 합계 불일치 시 에러 메시지
- 트랜잭션 롤백 고려 (필요시)

### 5. 장바구니 수량 변경 시 재고 검증

**파일**: `app/cart/page.tsx`

`updateQuantity` 함수 개선:
- 수량 변경 전 상품 재고 확인
- `newQuantity > product.stock`인 경우 에러 표시 및 수량 변경 차단
- 재고 부족 시 사용자에게 명확한 메시지 표시

### 6. 장바구니 추가 시 재고 검증

**파일**: `components/cart/add-to-cart-button.tsx`

`handleAddToCart` 함수 개선:
- 장바구니 추가 전 상품 재고 확인
- 재고가 0인 경우 에러 표시
- 수량 증가 시 총 수량이 재고를 초과하는지 확인

### 7. 에러 처리 및 사용자 경험 개선

**파일들**: 
- `app/cart/page.tsx`
- `components/checkout/checkout-form.tsx`
- `app/actions/orders.ts`

- 재고 부족 시 명확한 에러 메시지 표시
- 주문 생성 중 로딩 상태 개선
- 성공/실패 피드백 개선
- 장바구니가 비어있을 때 체크아웃 페이지 접근 방지 (이미 구현됨)

## 구현 순서

1. 데이터베이스 마이그레이션 생성 및 적용
2. 타입 정의 업데이트
3. 주문 폼에 메모 필드 추가
4. 주문 생성 로직 개선 (합계 검증, 재고 검증, 메모 저장)
5. 장바구니 기능 개선 (재고 검증)
6. 에러 처리 및 사용자 경험 개선
7. 테스트 및 검증

## 검증 사항

- 주문 생성 시 서버에서 합계가 정확히 검증되는지
- 재고 부족 시 적절한 에러 메시지가 표시되는지
- 주문 메모가 정상적으로 저장되는지
- 장바구니 수량 변경 시 재고 검증이 작동하는지
- 에러 상황에서 사용자에게 명확한 피드백이 제공되는지

## 참고 파일

- `supabase/migrations/20250101000001_create_ecommerce_schema.sql` - 현재 스키마
- `app/actions/orders.ts` - 주문 생성 로직
- `components/checkout/checkout-form.tsx` - 주문 폼
- `app/cart/page.tsx` - 장바구니 페이지
- `components/cart/add-to-cart-button.tsx` - 장바구니 추가 버튼
- `types/database.ts` - 타입 정의

