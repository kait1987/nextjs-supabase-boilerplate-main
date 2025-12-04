-- 의류 쇼핑몰 MVP 데이터베이스 스키마
-- RLS는 사용하지 않으며, 서버 사이드에서 권한 체크

-- 1. 카테고리 테이블
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. 상품 테이블
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL, -- 원 단위 (예: 50000 = 50,000원)
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    image_url TEXT, -- 상품 이미지 URL
    stock INTEGER DEFAULT 0 NOT NULL, -- 재고 수량
    is_active BOOLEAN DEFAULT true NOT NULL, -- 판매 중 여부
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 3. 장바구니 테이블
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Clerk user ID
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(user_id, product_id) -- 같은 상품은 하나의 장바구니 항목만
);

-- 4. 주문 테이블
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Clerk user ID
    order_number TEXT NOT NULL UNIQUE, -- 주문 번호 (예: ORD-20250101-001)
    total_amount INTEGER NOT NULL, -- 총 주문 금액 (원 단위)
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'completed')),
    payment_method TEXT, -- 결제 수단
    payment_id TEXT, -- Toss Payments 결제 ID
    shipping_address TEXT, -- 배송 주소
    shipping_name TEXT, -- 수령인 이름
    shipping_phone TEXT, -- 수령인 전화번호
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 5. 주문 상품 테이블
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    product_name TEXT NOT NULL, -- 주문 시점의 상품명 (상품이 삭제되어도 유지)
    product_price INTEGER NOT NULL, -- 주문 시점의 가격
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal INTEGER NOT NULL, -- 상품 가격 * 수량
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- RLS 비활성화 (서버 사이드에서 권한 체크)
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.categories TO anon;
GRANT ALL ON TABLE public.categories TO authenticated;
GRANT ALL ON TABLE public.categories TO service_role;

GRANT ALL ON TABLE public.products TO anon;
GRANT ALL ON TABLE public.products TO authenticated;
GRANT ALL ON TABLE public.products TO service_role;

GRANT ALL ON TABLE public.cart_items TO anon;
GRANT ALL ON TABLE public.cart_items TO authenticated;
GRANT ALL ON TABLE public.cart_items TO service_role;

GRANT ALL ON TABLE public.orders TO anon;
GRANT ALL ON TABLE public.orders TO authenticated;
GRANT ALL ON TABLE public.orders TO service_role;

GRANT ALL ON TABLE public.order_items TO anon;
GRANT ALL ON TABLE public.order_items TO authenticated;
GRANT ALL ON TABLE public.order_items TO service_role;

-- 샘플 데이터 삽입 (개발용)
INSERT INTO public.categories (name, slug, description) VALUES
    ('상의', 'tops', '티셔츠, 셔츠, 후드 등'),
    ('하의', 'bottoms', '바지, 반바지 등'),
    ('아우터', 'outerwear', '자켓, 코트 등'),
    ('신발', 'shoes', '운동화, 구두 등'),
    ('액세서리', 'accessories', '가방, 모자 등')
ON CONFLICT (slug) DO NOTHING;

