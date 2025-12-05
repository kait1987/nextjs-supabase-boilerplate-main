<!-- 7f117ea2-165a-4ad9-82f7-e199dbeb99b7 020f1240-a373-4373-829e-11f73842bbf4 -->
# Phase 4: 결제 통합 (Toss Payments 테스트 모드) 완성 계획

## 현재 상태

### 완료된 기능

- 결제 위젯 기본 구현 (`components/payment/payment-widget.tsx`)
- 결제 페이지 기본 구현 (`app/payment/[orderId]/page.tsx`)
- 결제 성공/실패 페이지 구현 (`app/payment/[orderId]/success/page.tsx`, `app/payment/[orderId]/fail/page.tsx`)
- 주문 상태 업데이트 함수 (`app/actions/orders.ts`의 `updateOrderStatus`)

### 개선 필요 사항

- 결제 성공 페이지에서 중복 상태 업데이트 방지
- 결제 금액 검증 (서버 사이드)
- 이미 결제된 주문 재결제 방지
- 에러 처리 및 사용자 피드백 개선
- 환경 변수 설정 문서화

## 작업 항목

### 1. 결제 성공 페이지 개선

**파일**: `app/payment/[orderId]/success/page.tsx`

**문제점**:

- URL 쿼리 파라미터에서 `orderId`를 가져오지만, 실제로는 경로 파라미터에 있음
- 중복 상태 업데이트 가능성 (페이지 새로고침 시)
- 에러 처리 부족

**개선 사항**:

- 경로 파라미터의 `orderId` 사용
- 중복 업데이트 방지 (이미 `paid` 상태인 주문은 업데이트하지 않음)
- 주문 소유자 검증 (현재 사용자의 주문인지 확인)
- 에러 상태 표시 및 재시도 기능
- 로딩 상태 개선

### 2. 주문 상태 업데이트 함수 개선

**파일**: `app/actions/orders.ts`

**개선 사항**:

- 주문 소유자 검증 추가 (`user_id` 확인)
- 이미 결제된 주문 재업데이트 방지 (`status`가 이미 `paid`인 경우)
- 결제 금액 검증 (선택사항 - 향후 개선)
- 더 명확한 에러 메시지

### 3. 결제 페이지 개선

**파일**: `app/payment/[orderId]/page.tsx`

**개선 사항**:

- 이미 결제된 주문에 대한 명확한 안내
- 결제 위젯 플로우 개선 (리다이렉트 방식에 맞춤)
- 에러 처리 개선

### 4. 결제 위젯 개선

**파일**: `components/payment/payment-widget.tsx`

**개선 사항**:

- `onSuccess` 콜백 제거 또는 개선 (Toss Payments는 리다이렉트 방식이므로)
- 에러 메시지 개선
- 로딩 상태 개선

### 5. 결제 실패 페이지 개선

**파일**: `app/payment/[orderId]/fail/page.tsx`

**개선 사항**:

- 주문 ID 표시 (경로 파라미터에서 가져오기)
- 더 명확한 에러 메시지
- 주문 상세 페이지로 이동 링크 추가

### 6. 환경 변수 설정 문서화

**파일**: `.env.example` 또는 `docs/ECOMMERCE_SETUP.md`

**추가 사항**:

- `NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY` 환경 변수 설명
- 테스트 모드 클라이언트 키 사용 안내

## 구현 순서

1. 주문 상태 업데이트 함수 개선 (소유자 검증, 중복 방지)
2. 결제 성공 페이지 개선 (중복 업데이트 방지, 에러 처리)
3. 결제 페이지 개선 (이미 결제된 주문 처리)
4. 결제 위젯 개선 (리다이렉트 플로우에 맞춤)
5. 결제 실패 페이지 개선
6. 환경 변수 문서화
7. 테스트 및 검증

## 검증 사항

- 결제 성공 후 주문 상태가 정상적으로 `paid`로 변경되는지
- 이미 결제된 주문에 대한 재결제 시도가 차단되는지
- 결제 성공 페이지 새로고침 시 중복 업데이트가 발생하지 않는지
- 결제 실패 시 적절한 에러 메시지가 표시되는지
- 주문 소유자가 아닌 사용자가 결제 페이지에 접근할 수 없는지

## 참고 파일

- `components/payment/payment-widget.tsx` - 결제 위젯
- `app/payment/[orderId]/page.tsx` - 결제 페이지
- `app/payment/[orderId]/success/page.tsx` - 결제 성공 페이지
- `app/payment/[orderId]/fail/page.tsx` - 결제 실패 페이지
- `app/actions/orders.ts` - 주문 상태 업데이트 함수
- `types/database.ts` - Order 타입 정의

### To-dos

- [ ] 주문 상태 업데이트 함수에 소유자 검증 및 중복 방지 로직 추가
- [ ] 결제 성공 페이지에서 중복 업데이트 방지 및 에러 처리 개선
- [ ] 결제 페이지에서 이미 결제된 주문 처리 개선
- [ ] 결제 위젯 플로우 개선 (리다이렉트 방식에 맞춤)
- [ ] 결제 실패 페이지 개선 (주문 ID 표시, 에러 메시지 개선)
- [ ] 환경 변수 설정 문서화
- [ ] 전체 결제 플로우 테스트 및 검증