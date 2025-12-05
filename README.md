# 의류 쇼핑몰 MVP

Next.js 15, Clerk, Supabase, Toss Payments를 활용한 의류 쇼핑몰 MVP입니다.

## 📋 목차

1. [소개](#소개)
2. [기술 스택](#기술-스택)
3. [주요 기능](#주요-기능)
4. [시작하기](#시작하기)
5. [프로젝트 구조](#프로젝트-구조)

## 소개

최소 기능으로 빠른 시장 검증을 목표로 하는 의류 쇼핑몰 MVP입니다.

**핵심 특징:**
- ✨ Next.js 15 + React 19
- 🔐 Clerk 인증 (한국어 지원)
- 🗄️ Supabase 데이터베이스 (RLS 미사용)
- 💳 Toss Payments 결제 (테스트 모드)
- 🎨 Tailwind CSS v4 + shadcn/ui

## 기술 스택

### 프레임워크 & 라이브러리

- **Next.js 15.5.6** - React 프레임워크 (App Router)
- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안정성

### 인증 & 데이터베이스

- **Clerk** - 사용자 인증 및 관리
- **Supabase** - PostgreSQL 데이터베이스
  - RLS 미사용 (서버 사이드 권한 체크)

### 결제

- **Toss Payments** - 결제 게이트웨이 (테스트 모드)

### UI & 스타일링

- **Tailwind CSS v4** - 유틸리티 우선 CSS
- **shadcn/ui** - 재사용 가능한 컴포넌트
- **lucide-react** - 아이콘 라이브러리

## 주요 기능

### 🛍️ 쇼핑 기능

- 홈페이지 (인기 상품, 카테고리별 상품 섹션)
- 상품 목록 조회 (페이지네이션, 정렬, 카테고리 필터)
- 상품 상세 보기 (재고, 가격, 설명)
- 장바구니 (추가/삭제/수량 변경, 실시간 업데이트)
- 장바구니 사이드바 (항상 표시, 숨기기 기능)

### 💳 주문 & 결제

- 주문 프로세스 (배송 정보 입력, 서버 사이드 검증)
- Toss Payments 결제 (테스트 모드, 리다이렉트 방식)
- 결제 성공/실패 처리
- 주문 상태 관리 (pending → paid → completed)

### 👤 마이페이지

- 주문 내역 목록 (주문 번호, 상태, 총액, 상품 개수)
- 주문 상세 보기 (주문 정보, 배송 정보, 상품 목록, 결제 요약)

## 시작하기

### 필수 요구사항

- Node.js 18 이상
- pnpm
- Supabase 프로젝트
- Clerk 애플리케이션
- Toss Payments 테스트 계정

### 1. 프로젝트 클론 및 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Toss Payments (테스트 모드)
NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY=test_ck_...
```

### 3. 데이터베이스 설정

1. Supabase Dashboard → SQL Editor
2. `supabase/migrations/20250101000001_create_ecommerce_schema.sql` 실행
3. 샘플 상품 데이터 추가 (선택사항)

자세한 내용은 [ECOMMERCE_SETUP.md](./docs/ECOMMERCE_SETUP.md)를 참고하세요.

### 4. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

## 프로젝트 구조

```
├── app/                    # Next.js App Router
│   ├── products/          # 상품 목록 및 상세
│   ├── cart/              # 장바구니
│   ├── checkout/         # 주문하기
│   ├── payment/           # 결제
│   ├── my/                # 마이페이지
│   └── page.tsx           # 홈페이지
│
├── components/            # React 컴포넌트
│   ├── cart/             # 장바구니 관련
│   ├── checkout/         # 주문 관련
│   ├── payment/          # 결제 관련
│   └── ui/               # shadcn/ui 컴포넌트
│
├── lib/                   # 유틸리티
│   ├── supabase/         # Supabase 클라이언트
│   ├── utils/            # 포맷팅 등 유틸리티
│   └── validations/      # Zod 검증 스키마
│
├── types/                 # TypeScript 타입 정의
│   └── database.ts       # 데이터베이스 타입
│
├── supabase/             # Supabase 설정
│   └── migrations/       # 데이터베이스 마이그레이션
│
└── docs/                 # 문서
    ├── ECOMMERCE_SETUP.md # 설정 가이드
    ├── ADMIN_GUIDE.md     # 어드민 가이드
    ├── DEPLOYMENT.md      # 배포 가이드
    ├── DEPLOYMENT_CHECKLIST.md # 배포 전 체크리스트
    ├── E2E_TEST_CHECKLIST.md  # E2E 테스트 체크리스트
    ├── BUG_REPORT.md      # 버그 리포트 템플릿
    └── TODO.md            # 프로젝트 진행 상황
```

## 주요 페이지

- `/` - 홈페이지 (인기 상품)
- `/products` - 상품 목록
- `/products/[id]` - 상품 상세
- `/cart` - 장바구니
- `/checkout` - 주문하기
- `/payment/[orderId]` - 결제
- `/my/orders` - 주문 내역
- `/my/orders/[id]` - 주문 상세

## 개발 가이드

### 상품 등록

Supabase Dashboard → Table Editor → products 테이블에서 직접 추가합니다.

자세한 내용은 [어드민 가이드](./docs/ADMIN_GUIDE.md)를 참고하세요.

**필수 필드:**
- `name`: 상품명
- `price`: 가격 (원 단위)
- `stock`: 재고 수량
- `is_active`: 판매 중 여부

### 결제 테스트

Toss Payments 테스트 모드에서는 다음 정보를 사용하세요:

- 카드 번호: `1234-5678-9012-3456`
- 유효기간: `12/34`
- CVC: `123`
- 비밀번호: 생년월일 6자리

## 배포

Vercel에 배포하는 방법은 [배포 가이드](./docs/DEPLOYMENT.md)를 참고하세요.

배포 전에는 [배포 전 체크리스트](./docs/DEPLOYMENT_CHECKLIST.md)를 확인하세요.

## 문서

### 프로젝트 문서

- [설정 가이드](./docs/ECOMMERCE_SETUP.md) - 초기 설정 및 데이터베이스 구성
- [어드민 가이드](./docs/ADMIN_GUIDE.md) - 상품 등록 및 관리 방법
- [배포 가이드](./docs/DEPLOYMENT.md) - Vercel 배포 방법
- [배포 전 체크리스트](./docs/DEPLOYMENT_CHECKLIST.md) - 배포 전 확인 사항
- [E2E 테스트 체크리스트](./docs/E2E_TEST_CHECKLIST.md) - 전체 플로우 테스트 가이드
- [버그 리포트](./docs/BUG_REPORT.md) - 버그 기록 템플릿
- [프로젝트 진행 상황](./docs/TODO.md) - Phase별 완료 현황

### 외부 문서

- [Clerk 문서](https://clerk.com/docs) - 인증 및 사용자 관리
- [Supabase 문서](https://supabase.com/docs) - 데이터베이스 및 백엔드
- [Toss Payments 문서](https://docs.tosspayments.com/) - 결제 통합
- [Next.js 문서](https://nextjs.org/docs) - 프레임워크 가이드
