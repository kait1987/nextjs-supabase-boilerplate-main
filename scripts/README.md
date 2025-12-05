# 이미지 크롤링 및 업로드 스크립트

## 개요

이 스크립트는 상품 이미지를 검색하고 Supabase Storage에 업로드합니다.

## 사용 전 준비

### 1. 환경 변수 설정

`.env` 파일에 다음 변수들이 설정되어 있어야 합니다:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. (선택사항) 이미지 API 키

고품질 이미지를 원한다면 다음 API 키 중 하나를 발급받아 설정하세요:

#### Unsplash API (권장)
1. [Unsplash Developers](https://unsplash.com/developers)에서 앱 등록
2. Access Key 발급
3. `.env` 파일에 추가:

```bash
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

#### Pexels API (대안)
1. [Pexels API](https://www.pexels.com/api/)에서 API 키 발급
2. `.env` 파일에 추가:

```bash
PEXELS_API_KEY=your_pexels_api_key
```

**참고**: API 키가 없어도 동작하지만, 이미지 품질이 낮을 수 있습니다.

### 3. Storage 버킷 확인

`products` 버킷이 Supabase에 생성되어 있어야 합니다. 마이그레이션이 자동으로 생성합니다.

## 사용 방법

```bash
pnpm fetch-images
```

## 동작 방식

1. 데이터베이스에서 모든 상품을 가져옵니다
2. 각 상품에 대해:
   - 상품명으로 이미지를 검색합니다 (Unsplash API 또는 placeholder)
   - 이미지를 다운로드합니다
   - Supabase Storage의 `products` 버킷에 업로드합니다
   - 데이터베이스의 `image_url`을 업데이트합니다
3. 이미 Supabase에 업로드된 이미지는 스킵합니다

## 주의사항

- API 레이트 리밋을 피하기 위해 각 이미지 처리 사이에 1초 대기합니다
- 이미지 다운로드 실패 시 해당 상품은 스킵됩니다
- 임시 파일은 자동으로 정리됩니다

