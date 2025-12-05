# 어드민 상품 등록 가이드

이 문서는 Supabase 대시보드를 사용하여 쇼핑몰에 상품을 등록하는 방법을 안내합니다.

## 목차

1. [Supabase 대시보드 접속](#supabase-대시보드-접속)
2. [카테고리 생성](#카테고리-생성)
3. [상품 등록](#상품-등록)
4. [필수 필드 설명](#필수-필드-설명)
5. [이미지 URL 설정](#이미지-url-설정)
6. [샘플 데이터 예시](#샘플-데이터-예시)

---

## Supabase 대시보드 접속

1. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인합니다.
2. 프로젝트를 선택합니다.
3. 왼쪽 메뉴에서 **Table Editor**를 클릭합니다.

---

## 카테고리 생성

상품을 등록하기 전에 먼저 카테고리를 생성해야 합니다.

### 카테고리 생성 절차

1. **Table Editor**에서 `categories` 테이블을 선택합니다.
2. 상단의 **Insert** 버튼을 클릭합니다.
3. 다음 필드를 입력합니다:

   | 필드명 | 타입 | 설명 | 예시 |
   |--------|------|------|------|
   | `name` | TEXT | 카테고리 이름 (필수) | "상의" |
   | `slug` | TEXT | URL에 사용될 고유 식별자 (필수, 중복 불가) | "tops" |
   | `description` | TEXT | 카테고리 설명 (선택사항) | "티셔츠, 셔츠, 후드 등" |

4. **Save** 버튼을 클릭하여 저장합니다.

### 기본 카테고리 예시

```sql
-- 상의
name: "상의"
slug: "tops"
description: "티셔츠, 셔츠, 후드 등"

-- 하의
name: "하의"
slug: "bottoms"
description: "바지, 반바지 등"

-- 아우터
name: "아우터"
slug: "outerwear"
description: "자켓, 코트 등"

-- 신발
name: "신발"
slug: "shoes"
description: "운동화, 구두 등"

-- 액세서리
name: "액세서리"
slug: "accessories"
description: "가방, 모자 등"
```

> **참고**: `id`, `created_at`, `updated_at` 필드는 자동으로 생성되므로 입력할 필요가 없습니다.

---

## 상품 등록

### 상품 등록 절차

1. **Table Editor**에서 `products` 테이블을 선택합니다.
2. 상단의 **Insert** 버튼을 클릭합니다.
3. 다음 필드를 입력합니다 (필수 필드는 아래 [필수 필드 설명](#필수-필드-설명) 참조):

   | 필드명 | 타입 | 설명 | 필수 여부 |
   |--------|------|------|-----------|
   | `name` | TEXT | 상품명 | ✅ 필수 |
   | `description` | TEXT | 상품 설명 | ❌ 선택 |
   | `price` | INTEGER | 가격 (원 단위) | ✅ 필수 |
   | `category_id` | UUID | 카테고리 ID | ❌ 선택 |
   | `image_url` | TEXT | 상품 이미지 URL | ❌ 선택 |
   | `stock` | INTEGER | 재고 수량 | ✅ 필수 |
   | `is_active` | BOOLEAN | 판매 중 여부 | ✅ 필수 |

4. **Save** 버튼을 클릭하여 저장합니다.

> **참고**: `id`, `created_at`, `updated_at` 필드는 자동으로 생성되므로 입력할 필요가 없습니다.

---

## 필수 필드 설명

### name (상품명)

- **타입**: TEXT
- **필수**: ✅
- **설명**: 상품의 이름입니다.
- **예시**: "면 100% 기본 티셔츠", "후드 집업 자켓"

### price (가격)

- **타입**: INTEGER
- **필수**: ✅
- **설명**: 상품 가격을 원 단위로 입력합니다. 소수점은 사용하지 않습니다.
- **예시**: 
  - 25,000원 → `25000`
  - 68,000원 → `68000`

### category_id (카테고리 ID)

- **타입**: UUID
- **필수**: ❌ (null 가능)
- **설명**: 상품이 속할 카테고리의 ID입니다.
- **설정 방법**:
  1. `categories` 테이블에서 원하는 카테고리를 찾습니다.
  2. 해당 카테고리의 `id` 값을 복사합니다.
  3. 상품 등록 시 `category_id` 필드에 붙여넣습니다.
- **예시**: `550e8400-e29b-41d4-a716-446655440000`

### image_url (이미지 URL)

- **타입**: TEXT
- **필수**: ❌ (null 가능)
- **설명**: 상품 이미지의 URL입니다. 자세한 내용은 [이미지 URL 설정](#이미지-url-설정) 참조.

### stock (재고 수량)

- **타입**: INTEGER
- **필수**: ✅
- **설명**: 상품의 재고 수량입니다. 0 이상의 정수를 입력합니다.
- **예시**: `150`, `80`, `200`
- **주의**: 재고가 0인 상품은 상품 목록에 표시되지 않습니다.

### is_active (판매 중 여부)

- **타입**: BOOLEAN
- **필수**: ✅
- **설명**: 상품이 판매 중인지 여부를 나타냅니다.
- **값**:
  - `true`: 판매 중 (상품 목록에 표시됨)
  - `false`: 판매 중지 (상품 목록에 표시되지 않음)
- **기본값**: `true`

### description (상품 설명)

- **타입**: TEXT
- **필수**: ❌ (null 가능)
- **설명**: 상품에 대한 상세 설명입니다.
- **예시**: "심플한 디자인, 5가지 컬러", "부드러운 안감, 캐주얼 스타일"

---

## 이미지 URL 설정

### 방법 1: 외부 이미지 URL 사용

이미 호스팅된 이미지의 URL을 사용할 수 있습니다.

**예시**:
```
https://example.com/images/product1.jpg
https://cdn.example.com/products/shirt-blue.png
```

### 방법 2: Supabase Storage 사용 (권장)

Supabase Storage에 이미지를 업로드하고 URL을 사용할 수 있습니다.

1. **Storage** 메뉴로 이동합니다.
2. `study` 버킷을 선택합니다 (또는 새 버킷 생성).
3. 이미지 파일을 업로드합니다.
4. 업로드된 파일의 **Public URL**을 복사합니다.
5. 상품 등록 시 `image_url` 필드에 붙여넣습니다.

**Public URL 형식**:
```
https://[project-id].supabase.co/storage/v1/object/public/study/[파일명]
```

### 방법 3: 이미지 없이 등록

`image_url` 필드를 비워두면 (null) 상품 카드에 "이미지 없음" 플레이스홀더가 표시됩니다.

---

## 샘플 데이터 예시

### 예시 1: 기본 티셔츠

```json
{
  "name": "면 100% 기본 티셔츠",
  "description": "심플한 디자인, 5가지 컬러",
  "price": 25000,
  "category_id": "[카테고리 ID 복사]",
  "image_url": "https://example.com/images/tshirt.jpg",
  "stock": 300,
  "is_active": true
}
```

### 예시 2: 후드 집업 자켓

```json
{
  "name": "후드 집업 자켓",
  "description": "부드러운 안감, 캐주얼 스타일",
  "price": 68000,
  "category_id": "[카테고리 ID 복사]",
  "image_url": "https://example.com/images/hoodie.jpg",
  "stock": 150,
  "is_active": true
}
```

### 예시 3: 청바지

```json
{
  "name": "청바지 슬림핏",
  "description": "신축성 좋은 데님, 남녀공용",
  "price": 79000,
  "category_id": "[카테고리 ID 복사]",
  "image_url": "https://example.com/images/jeans.jpg",
  "stock": 180,
  "is_active": true
}
```

---

## 주의사항

1. **가격 입력**: 가격은 원 단위로 입력하며, 소수점은 사용하지 않습니다.
   - ✅ 올바른 예: `25000` (25,000원)
   - ❌ 잘못된 예: `25.5` 또는 `25000.00`

2. **재고 관리**: 재고가 0인 상품은 자동으로 상품 목록에서 제외됩니다.

3. **카테고리 ID**: 카테고리를 지정하지 않으려면 `category_id`를 비워두면 됩니다 (null).

4. **판매 중지**: 일시적으로 상품을 숨기려면 `is_active`를 `false`로 설정합니다.

5. **이미지 URL**: 이미지 URL이 유효하지 않으면 상품 카드에 "이미지 없음"이 표시됩니다.

---

## 문제 해결

### 상품이 목록에 표시되지 않을 때

다음 항목을 확인하세요:

1. ✅ `is_active`가 `true`인지 확인
2. ✅ `stock`이 0보다 큰지 확인
3. ✅ 카테고리 필터가 올바르게 설정되었는지 확인

### 이미지가 표시되지 않을 때

1. ✅ `image_url`이 올바른 URL 형식인지 확인
2. ✅ 이미지 URL이 공개적으로 접근 가능한지 확인
3. ✅ CORS 설정이 올바른지 확인 (외부 이미지 사용 시)

---

## 추가 도움말

- [Supabase 공식 문서](https://supabase.com/docs)
- [Table Editor 가이드](https://supabase.com/docs/guides/database/tables)
- [Storage 가이드](https://supabase.com/docs/guides/storage)

