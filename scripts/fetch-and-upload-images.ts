/**
 * 상품 이미지 크롤링 및 Supabase 업로드 스크립트
 * 
 * 사용법:
 * pnpm tsx scripts/fetch-and-upload-images.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as http from "http";

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("환경 변수가 설정되지 않았습니다:");
  console.error("- NEXT_PUBLIC_SUPABASE_URL");
  console.error("- SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 임시 디렉토리
const tempDir = path.join(process.cwd(), "temp-images");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

/**
 * 이미지 다운로드
 */
async function downloadImage(url: string, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`이미지 다운로드 실패: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filePath);
      response.pipe(fileStream);

      fileStream.on("finish", () => {
        fileStream.close();
        resolve();
      });

      fileStream.on("error", (err) => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
    }).on("error", reject);
  });
}

/**
 * Supabase Storage에 이미지 업로드
 */
async function uploadToSupabase(
  filePath: string,
  fileName: string
): Promise<string> {
  const fileBuffer = fs.readFileSync(filePath);
  const fileExt = path.extname(fileName).slice(1);
  const contentType = `image/${fileExt === "jpg" ? "jpeg" : fileExt}`;

  const { data, error } = await supabase.storage
    .from("products")
    .upload(fileName, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`업로드 실패: ${error.message}`);
  }

  // Public URL 생성
  const {
    data: { publicUrl },
  } = supabase.storage.from("products").getPublicUrl(fileName);

  return publicUrl;
}

/**
 * 이미지 검색 (Unsplash API 또는 Pexels API 사용)
 */
async function searchImage(query: string): Promise<string | null> {
  try {
    // 1. Unsplash API 시도
    const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (unsplashAccessKey) {
      try {
        const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&client_id=${unsplashAccessKey}`;
        const response = await fetch(searchUrl);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          return data.results[0].urls.regular;
        }
      } catch (err) {
        console.log(`  Unsplash API 실패, Pexels 시도...`);
      }
    }

    // 2. Pexels API 시도
    const pexelsApiKey = process.env.PEXELS_API_KEY;
    if (pexelsApiKey) {
      try {
        const searchUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`;
        const response = await fetch(searchUrl, {
          headers: {
            'Authorization': pexelsApiKey
          }
        });
        const data = await response.json();
        
        if (data.photos && data.photos.length > 0) {
          return data.photos[0].src.large;
        }
      } catch (err) {
        console.log(`  Pexels API 실패, placeholder 사용...`);
      }
    }

    // 3. Fallback: Unsplash Source (무료, API 키 불필요)
    return `https://source.unsplash.com/800x800/?${encodeURIComponent(query)}`;
  } catch (error) {
    console.error(`이미지 검색 실패 (${query}):`, error);
    return null;
  }
}

/**
 * 상품 이미지 처리
 */
async function processProduct(product: { id: string; name: string; image_url: string | null }) {
  console.log(`\n처리 중: ${product.name} (${product.id})`);

  // 이미 이미지가 있고 Supabase URL이면 스킵
  if (product.image_url && product.image_url.includes("supabase.co")) {
    console.log("  ✓ 이미 Supabase에 업로드된 이미지가 있습니다.");
    return;
  }

  try {
    // 이미지 검색
    console.log(`  검색 중: "${product.name}"`);
    const imageUrl = await searchImage(product.name);

    if (!imageUrl) {
      console.log("  ✗ 이미지를 찾을 수 없습니다.");
      return;
    }

    // 이미지 다운로드
    const fileName = `${product.id}-${Date.now()}.jpg`;
    const tempFilePath = path.join(tempDir, fileName);
    
    console.log(`  다운로드 중: ${imageUrl}`);
    await downloadImage(imageUrl, tempFilePath);

    // Supabase에 업로드
    console.log(`  업로드 중...`);
    const publicUrl = await uploadToSupabase(tempFilePath, `products/${fileName}`);

    // 데이터베이스 업데이트
    const { error: updateError } = await supabase
      .from("products")
      .update({ image_url: publicUrl })
      .eq("id", product.id);

    if (updateError) {
      throw updateError;
    }

    // 임시 파일 삭제
    fs.unlinkSync(tempFilePath);

    console.log(`  ✓ 완료: ${publicUrl}`);
  } catch (error: any) {
    console.error(`  ✗ 오류: ${error.message}`);
  }
}

/**
 * 메인 함수
 */
async function main() {
  console.log("상품 이미지 크롤링 및 업로드 시작...\n");

  // 모든 상품 가져오기
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, image_url")
    .order("name");

  if (error) {
    console.error("상품 목록 가져오기 실패:", error);
    process.exit(1);
  }

  if (!products || products.length === 0) {
    console.log("처리할 상품이 없습니다.");
    return;
  }

  console.log(`총 ${products.length}개의 상품을 처리합니다.\n`);

  // 각 상품 처리
  for (const product of products) {
    await processProduct(product);
    // API 레이트 리밋 방지를 위해 잠시 대기
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // 임시 디렉토리 정리
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  console.log("\n완료!");
}

main().catch(console.error);

