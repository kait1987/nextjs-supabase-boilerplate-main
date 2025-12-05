-- 상품 이미지용 public 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,  -- public bucket (상품 이미지는 공개)
  10485760,  -- 10MB 제한
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- Public 버킷이므로 모든 사용자가 읽기 가능
-- 업로드는 서버 사이드(service role)에서만 수행

