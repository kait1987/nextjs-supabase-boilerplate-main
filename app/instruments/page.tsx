import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

/**
 * Supabase 공식 문서 예시 페이지
 * 
 * @see {@link https://supabase.com/docs/guides/getting-started/quickstarts/nextjs Supabase Next.js Quickstart}
 * 
 * 이 페이지는 Supabase 공식 문서의 예시를 따릅니다.
 * instruments 테이블의 데이터를 조회하여 표시합니다.
 * 
 * 사용 전 확인사항:
 * 1. Supabase Dashboard에서 instruments 테이블 생성
 * 2. RLS 정책 설정 (공개 데이터의 경우)
 * 3. 환경 변수 설정 (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
 */
async function InstrumentsData() {
  const supabase = await createClient();
  const { data: instruments, error } = await supabase
    .from("instruments")
    .select();

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-red-800 font-semibold mb-2">Error</h2>
        <p className="text-red-700 text-sm">{error.message}</p>
        <p className="text-red-600 text-xs mt-2">
          💡 테이블이 존재하지 않거나 RLS 정책이 설정되지 않았을 수 있습니다.
        </p>
      </div>
    );
  }

  if (!instruments || instruments.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">No instruments found.</p>
        <p className="text-yellow-700 text-sm mt-2">
          Supabase Dashboard에서 instruments 테이블에 데이터를 추가해보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {instruments.map((instrument: any) => (
        <div
          key={instrument.id}
          className="p-3 bg-white border rounded-lg shadow-sm"
        >
          <p className="font-medium">{instrument.name}</p>
          <p className="text-sm text-gray-500">ID: {instrument.id}</p>
        </div>
      ))}
    </div>
  );
}

export default function Instruments() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Instruments</h1>
        <p className="text-gray-600">
          Supabase 공식 문서 예시 페이지입니다. instruments 테이블의 데이터를
          조회합니다.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          📖{" "}
          <a
            href="https://supabase.com/docs/guides/getting-started/quickstarts/nextjs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Supabase Next.js Quickstart 문서
          </a>
        </p>
      </div>

      <Suspense fallback={<div>Loading instruments...</div>}>
        <InstrumentsData />
      </Suspense>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold mb-2 text-blue-900">
          💡 이 페이지의 작동 원리
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>
            <code className="bg-blue-100 px-1 rounded">createClient</code> 함수를
            사용하여 Supabase 클라이언트 생성
          </li>
          <li>
            Clerk 세션 토큰이 자동으로 Supabase 요청에 포함됩니다
          </li>
          <li>
            Server Component에서 비동기로 데이터를 조회합니다
          </li>
          <li>
            <code className="bg-blue-100 px-1 rounded">Suspense</code>를 사용하여
            로딩 상태를 처리합니다
          </li>
        </ul>
      </div>
    </div>
  );
}

