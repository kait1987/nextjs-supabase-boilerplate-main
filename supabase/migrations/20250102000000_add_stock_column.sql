-- products 테이블에 stock 컬럼 추가
-- DB.sql에서 stock_quantity를 사용하는 경우를 대비하여 stock 컬럼 추가

-- stock_quantity가 있는 경우 stock으로 복사 후 stock_quantity 삭제
DO $$
BEGIN
  -- stock_quantity 컬럼이 있는지 확인
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'stock_quantity'
  ) THEN
    -- stock 컬럼이 없으면 추가
    IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'products' 
      AND column_name = 'stock'
    ) THEN
      -- stock 컬럼 추가
      ALTER TABLE public.products ADD COLUMN stock INTEGER DEFAULT 0 NOT NULL;
      
      -- stock_quantity의 값을 stock으로 복사
      UPDATE public.products SET stock = stock_quantity WHERE stock_quantity IS NOT NULL;
      
      -- stock_quantity 컬럼 삭제
      ALTER TABLE public.products DROP COLUMN stock_quantity;
    END IF;
  ELSE
    -- stock_quantity가 없고 stock도 없으면 stock 컬럼 추가
    IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'products' 
      AND column_name = 'stock'
    ) THEN
      ALTER TABLE public.products ADD COLUMN stock INTEGER DEFAULT 0 NOT NULL;
    END IF;
  END IF;
END $$;

-- stock 컬럼에 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_products_stock ON public.products(stock);

