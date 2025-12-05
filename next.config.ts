import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      { hostname: "via.placeholder.com" },
      // Supabase Storage
      { 
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // 일반적인 이미지 호스팅 서비스들
      { hostname: "**.supabase.in" },
      { hostname: "images.unsplash.com" },
      { hostname: "**.cloudinary.com" },
      { hostname: "**.amazonaws.com" },
      { hostname: "**.googleusercontent.com" },
      { hostname: "**.githubusercontent.com" },
    ],
    // 외부 이미지 최적화 비활성화 (모든 이미지 표시 보장)
    unoptimized: false,
    // 이미지 로딩 실패 시 대체 처리
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
