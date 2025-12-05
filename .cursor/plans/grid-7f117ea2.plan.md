<!-- 7f117ea2-165a-4ad9-82f7-e199dbeb99b7 898ef71c-be22-4e11-b738-05a365d468d2 -->
# Phase 2 미완료 기능 개발 계획

## 목표

- 상품 목록 페이지에 정렬 기능 추가 (가격순, 최신순, 이름순)
- 상품 목록 페이지에 페이지네이션 기능 추가
- 어드민 상품 등록 가이드 문서 작성

## 현재 상태

- `app/products/page.tsx`: 카테고리 필터만 구현됨
- 정렬 기능: 없음
- 페이지네이션: 없음
- 어드민 가이드: 없음

## 구현 계획

### 1. 정렬 기능 구현

**파일**: `app/products/page.tsx` 수정

**기능**:

- 정렬 옵션: 최신순(default), 가격 낮은순, 가격 높은순, 이름순
- `searchParams`에 `sort` 파라미터 추가
- 정렬 옵션에 따라 Supabase 쿼리 `order()` 메서드 적용

**정렬 옵션 정의**:

- `latest`: `created_at DESC` (기본값)
- `price_asc`: `price ASC`
- `price_desc`: `price DESC`
- `name_asc`: `name ASC`

**UI**:

- 정렬 선택을 위한 Select 컴포넌트 또는 Button 그룹 사용
- 현재 선택된 정렬 옵션 표시

### 2. 페이지네이션 구현

**파일**:

- `app/products/page.tsx` 수정
- `components/products/pagination.tsx` (신규)

**기능**:

- 페이지당 상품 개수: 12개
- `searchParams`에 `page` 파라미터 추가 (기본값: 1)
- Supabase `range()` 메서드로 페이지네이션 적용
- 총 상품 개수 조회하여 총 페이지 수 계산

**Pagination 컴포넌트**:

- 이전/다음 버튼
- 페이지 번호 표시 (현재 페이지 ±2 범위)
- 첫 페이지/마지막 페이지 이동
- URL 쿼리 파라미터로 페이지 상태 관리

**주의사항**:

- 카테고리 필터와 정렬 옵션을 유지하면서 페이지 이동
- URL 쿼리 파라미터 조합: `?category=xxx&sort=xxx&page=xxx`

### 3. 상품 목록 페이지 통합

**파일**: `app/products/page.tsx` 수정

**변경사항**:

- `searchParams` 타입 확장: `{ category?: string; sort?: string; page?: string }`
- 정렬 로직 추가
- 페이지네이션 로직 추가 (range, count)
- 정렬 UI 추가
- Pagination 컴포넌트 추가

### 4. 어드민 상품 등록 가이드 문서 작성

**파일**: `docs/ADMIN_GUIDE.md` (신규)

**내용**:

- Supabase 대시보드 접속 방법
- 상품 등록 절차 (Table Editor 사용)
- 필수 필드 설명 (name, price, category_id, stock 등)
- 이미지 URL 설정 방법
- 카테고리 생성 방법
- 샘플 데이터 예시

## 주요 파일 변경

- `app/products/page.tsx` (수정)
- `components/products/pagination.tsx` (신규)
- `docs/ADMIN_GUIDE.md` (신규)

## 참고 파일

- `app/products/page.tsx`: 현재 상품 목록 페이지
- `components/products/product-grid.tsx`: 상품 그리드 컴포넌트
- `components/ui/button.tsx`: Button 컴포넌트

## 기술 스택

- Next.js 15 App Router (Server Component)
- Supabase (range, count, order 메서드)
- TypeScript
- Tailwind CSS