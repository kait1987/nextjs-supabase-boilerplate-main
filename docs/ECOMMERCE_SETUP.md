# 의류 쇼핑몰 MVP 설정 가이드

## 📋 개요

이 문서는 의류 쇼핑몰 MVP의 설정 및 사용 방법을 안내합니다.

## 🗄️ 데이터베이스 설정

### 1. Supabase 마이그레이션 실행

1. Supabase Dashboard → **SQL Editor**로 이동
2. `supabase/migrations/20250101000001_create_ecommerce_schema.sql` 파일 내용 복사
3. SQL Editor에 붙여넣고 **Run** 클릭
4. 성공 메시지 확인

### 2. 샘플 상품 데이터 추가

Supabase Dashboard → **Table Editor** → **products** 테이블에서 직접 상품을 추가하거나, SQL Editor에서 다음 쿼리를 실행하세요:

```sql
-- 샘플 상품 추가 예시
INSERT INTO public.products (name, description, price, category_id, image_url, stock, is_active)
SELECT 
  '기본 티셔츠',
  '편안한 착용감의 기본 티셔츠입니다.',
  29000,
  (SELECT id FROM categories WHERE slug = 'tops' LIMIT 1),
  'https://via.placeholder.com/400x400?text=Basic+T-Shirt',
  100,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = '기본 티셔츠'
);
```

## 🔑 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 추가하세요:

```env
# Toss Payments (테스트 모드)
NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY=test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq
```

> 💡 **Toss Payments 테스트 키 발급**:
> 1. [Toss Payments 개발자 콘솔](https://developers.tosspayments.com/) 접속
> 2. 테스트 계정 생성 또는 로그인
> 3. 테스트 키 발급
> 4. 환경 변수에 추가

## 🛒 주요 기능

### 상품 관리

- **상품 등록**: Supabase Dashboard → Table Editor → products 테이블에서 직접 추가
- **카테고리 관리**: categories 테이블에서 관리
- **재고 관리**: products 테이블의 `stock` 컬럼으로 관리

### 주문 프로세스

1. 상품 목록에서 상품 선택
2. 상품 상세 페이지에서 장바구니에 추가
3. 장바구니에서 주문하기 클릭
4. 배송 정보 입력
5. 결제 진행 (Toss Payments 테스트 모드)
6. 주문 완료

### 주문 관리

- **주문 내역**: `/my/orders`에서 확인
- **주문 상세**: 각 주문을 클릭하여 상세 정보 확인
- **주문 상태**: pending → paid → completed

## 🧪 테스트 결제

Toss Payments 테스트 모드에서는 다음 정보를 사용하세요:

- **카드 번호**: 1234-5678-9012-3456
- **유효기간**: 12/34
- **CVC**: 123
- **비밀번호**: 생년월일 6자리 (예: 900101)

## 📊 데이터베이스 스키마

### 주요 테이블

- **categories**: 상품 카테고리
- **products**: 상품 정보
- **cart_items**: 장바구니 항목
- **orders**: 주문 정보
- **order_items**: 주문 상품 상세

### RLS 정책

⚠️ **중요**: 이 프로젝트는 RLS를 사용하지 않습니다. 서버 사이드에서 권한을 체크합니다.

## 🚀 배포 전 체크리스트

- [ ] Supabase 마이그레이션 실행 완료
- [ ] 샘플 상품 데이터 추가
- [ ] Toss Payments 테스트 키 설정
- [ ] 환경 변수 확인
- [ ] 결제 테스트 완료
- [ ] 주문 프로세스 테스트 완료

## 📝 참고사항

- 어드민 기능은 MVP에 포함되지 않습니다
- 상품 등록은 Supabase Dashboard에서 직접 수행합니다
- 결제는 테스트 모드로만 운영합니다
- 실제 배송 기능은 구현되지 않았습니다 (주문 상태만 관리)

