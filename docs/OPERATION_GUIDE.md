# 운영 가이드

이 문서는 의류 쇼핑몰 MVP의 일상적인 운영 작업을 안내합니다.

## 📋 목차

1. [상품 관리](#상품-관리)
2. [주문 관리](#주문-관리)
3. [사용자 관리](#사용자-관리)
4. [에러 대응](#에러-대응)
5. [로그 확인](#로그-확인)
6. [백업 및 복구](#백업-및-복구)

## 상품 관리

### 상품 등록

1. Supabase Dashboard → **Table Editor** → **products** 테이블
2. **Insert row** 클릭
3. 필수 필드 입력:
   - `name`: 상품명
   - `description`: 상품 설명 (선택사항)
   - `price`: 가격 (원 단위, 숫자)
   - `stock`: 재고 수량 (숫자)
   - `category_id`: 카테고리 ID (categories 테이블에서 확인)
   - `image_url`: 상품 이미지 URL (선택사항)
   - `is_active`: 판매 중 여부 (true/false)
4. **Save** 클릭

자세한 내용은 [어드민 가이드](./ADMIN_GUIDE.md)를 참고하세요.

### 상품 수정

1. Supabase Dashboard → **Table Editor** → **products** 테이블
2. 수정할 상품 행 클릭
3. 필드 수정
4. **Save** 클릭

### 상품 삭제

1. Supabase Dashboard → **Table Editor** → **products** 테이블
2. 삭제할 상품 행 선택
3. **Delete** 클릭
4. 확인

**주의**: 삭제된 상품은 복구할 수 없습니다. 대신 `is_active`를 `false`로 설정하여 비활성화하는 것을 권장합니다.

### 재고 관리

1. Supabase Dashboard → **Table Editor** → **products** 테이블
2. 재고를 수정할 상품 선택
3. `stock` 필드 수정
4. **Save** 클릭

**재고 부족 시**:
- `stock`이 0이면 상품 상세 페이지에서 "품절" 표시
- 장바구니에 추가 불가
- 기존 장바구니 항목의 수량 증가 불가

## 주문 관리

### 주문 조회

1. Supabase Dashboard → **Table Editor** → **orders** 테이블
2. 주문 목록 확인
3. 주문 상세는 `order_items` 테이블에서 확인

### 주문 상태 변경

주문 상태는 다음 값들을 가질 수 있습니다:
- `pending`: 결제 대기
- `paid`: 결제 완료
- `cancelled`: 취소됨
- `completed`: 완료

**상태 변경 방법**:
1. Supabase Dashboard → **Table Editor** → **orders** 테이블
2. 상태를 변경할 주문 선택
3. `status` 필드 수정
4. **Save** 클릭

**주의**: 
- 주문 상태는 일반적으로 자동으로 변경됩니다 (결제 완료 시 `paid`로 변경)
- 수동으로 변경할 때는 주의가 필요합니다

### 주문 취소

1. Supabase Dashboard → **Table Editor** → **orders** 테이블
2. 취소할 주문 선택
3. `status`를 `cancelled`로 변경
4. **Save** 클릭

**참고**: 취소된 주문의 재고는 자동으로 복구되지 않습니다. 필요시 수동으로 재고를 조정해야 합니다.

## 사용자 관리

### 사용자 조회

1. Supabase Dashboard → **Table Editor** → **users** 테이블
2. 사용자 목록 확인

**사용자 정보**:
- `clerk_id`: Clerk 사용자 ID
- `name`: 사용자 이름
- `created_at`: 가입일시

### 사용자 삭제

**주의**: 사용자 삭제는 신중하게 진행해야 합니다.

1. Supabase Dashboard → **Table Editor** → **users** 테이블
2. 삭제할 사용자 선택
3. **Delete** 클릭
4. 확인

**영향**:
- 해당 사용자의 장바구니 항목 삭제
- 주문 내역은 유지 (데이터 보존)

## 에러 대응

### 일반적인 에러

#### "상품을 찾을 수 없습니다"
- **원인**: 데이터베이스 테이블이 생성되지 않음
- **해결**: Supabase Dashboard에서 마이그레이션 실행 확인

#### "주문을 찾을 수 없습니다"
- **원인**: 주문 ID가 잘못되었거나 주문이 삭제됨
- **해결**: 주문 ID 확인, orders 테이블에서 주문 존재 여부 확인

#### "재고가 부족합니다"
- **원인**: 주문하려는 수량이 재고보다 많음
- **해결**: 재고 확인 및 조정

### 데이터베이스 에러

#### 테이블이 없다는 에러
1. Supabase Dashboard → **SQL Editor**
2. 마이그레이션 파일 확인:
   - `supabase/migrations/20250101000001_create_ecommerce_schema.sql`
   - `supabase/migrations/20250102000000_add_stock_column.sql`
3. 마이그레이션 실행

#### 외래키 관계 에러
- **원인**: 카테고리나 상품이 삭제되었지만 참조가 남아있음
- **해결**: 관련 데이터 확인 및 정리

### 결제 에러

#### 결제 실패
- **원인**: Toss Payments 테스트 키 오류, 네트워크 문제 등
- **해결**: 
  1. 환경 변수 확인
  2. Toss Payments 대시보드에서 로그 확인
  3. 테스트 카드 정보 확인

#### 결제는 성공했지만 주문 상태가 업데이트되지 않음
- **원인**: 서버 에러, 네트워크 문제
- **해결**:
  1. Vercel 로그 확인
  2. Supabase 로그 확인
  3. 수동으로 주문 상태 업데이트

## 로그 확인

### Vercel 로그

1. Vercel Dashboard → 프로젝트 선택
2. **Logs** 탭 클릭
3. 에러 로그 확인

**확인 사항**:
- 빌드 에러
- 런타임 에러
- API 요청 실패

### Supabase 로그

1. Supabase Dashboard → 프로젝트 선택
2. **Logs** → **Postgres Logs** 또는 **API Logs**
3. 로그 확인

**확인 사항**:
- 데이터베이스 쿼리 에러
- API 요청 에러
- 인증 에러

### Clerk 로그

1. Clerk Dashboard → 프로젝트 선택
2. **Logs** 탭 클릭
3. 로그 확인

**확인 사항**:
- 로그인/회원가입 에러
- 인증 토큰 문제

### Toss Payments 로그

1. Toss Payments 개발자 콘솔 → 프로젝트 선택
2. **결제 내역** 또는 **로그** 확인

**확인 사항**:
- 결제 실패 원인
- 결제 금액 불일치

## 백업 및 복구

### 데이터베이스 백업

#### Supabase 자동 백업
- Supabase는 자동으로 일일 백업을 수행합니다
- 백업은 7일간 보관됩니다

#### 수동 백업

1. Supabase Dashboard → **Database** → **Backups**
2. **Create backup** 클릭
3. 백업 이름 입력
4. 백업 생성

### 데이터 복구

1. Supabase Dashboard → **Database** → **Backups**
2. 복구할 백업 선택
3. **Restore** 클릭
4. 확인

**주의**: 복구는 전체 데이터베이스를 덮어씁니다. 신중하게 진행하세요.

### 특정 테이블 복구

SQL Editor를 사용하여 특정 테이블만 복구할 수 있습니다:

```sql
-- 예시: products 테이블 복구
-- 백업 파일에서 데이터를 가져와 INSERT
```

## 일일 운영 체크리스트

### 매일 확인 사항

- [ ] 주문 내역 확인 (새로운 주문 확인)
- [ ] 재고 부족 상품 확인
- [ ] 에러 로그 확인
- [ ] 결제 실패 건 확인

### 주간 확인 사항

- [ ] 사용자 가입 현황 확인
- [ ] 주문 통계 확인
- [ ] 인기 상품 확인
- [ ] 데이터베이스 성능 확인

### 월간 확인 사항

- [ ] 데이터베이스 백업 확인
- [ ] 환경 변수 보안 확인
- [ ] 서비스 상태 점검
- [ ] 사용자 피드백 검토

## 문제 해결 가이드

### 자주 발생하는 문제

#### 1. 상품이 표시되지 않음
- **확인**: `is_active`가 `true`인지 확인
- **확인**: `stock`이 0보다 큰지 확인
- **확인**: 카테고리 연결 확인

#### 2. 장바구니에 추가되지 않음
- **확인**: 사용자 로그인 상태 확인
- **확인**: 재고 확인
- **확인**: 네트워크 연결 확인

#### 3. 결제가 진행되지 않음
- **확인**: Toss Payments 테스트 키 확인
- **확인**: 환경 변수 설정 확인
- **확인**: 브라우저 콘솔 에러 확인

#### 4. 주문이 생성되지 않음
- **확인**: 장바구니에 상품이 있는지 확인
- **확인**: 배송 정보 입력 확인
- **확인**: 서버 로그 확인

## 연락처 및 지원

### 기술 지원
- Supabase: [Supabase Support](https://supabase.com/support)
- Clerk: [Clerk Support](https://clerk.com/support)
- Toss Payments: [Toss Payments Support](https://developers.tosspayments.com/support)
- Vercel: [Vercel Support](https://vercel.com/support)

### 문서
- [설정 가이드](./ECOMMERCE_SETUP.md)
- [어드민 가이드](./ADMIN_GUIDE.md)
- [배포 가이드](./DEPLOYMENT.md)

## 주의사항

1. **데이터 삭제**: 삭제 작업은 신중하게 진행하세요. 복구가 어려울 수 있습니다.
2. **주문 상태 변경**: 주문 상태를 수동으로 변경할 때는 주의가 필요합니다.
3. **재고 관리**: 재고 부족 시 주문이 실패할 수 있으므로 정기적으로 확인하세요.
4. **보안**: 환경 변수와 API 키는 절대 공개하지 마세요.
5. **백업**: 중요한 데이터 변경 전에는 백업을 권장합니다.

