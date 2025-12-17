"use client";

import { useSearchParams } from "next/navigation";

export default function PaytrRedirectContent() {
  const params = useSearchParams();
  const data = params.get("data");
  const url = params.get("url");

  if (!data || !url) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-600">
        Yönlendirme bilgisi bulunamadı.
      </main>
    );
  }

  let postData: any = {};
  try {
    postData = JSON.parse(data);
  } catch {
    return (
      <main className="min-h-screen flex items-center justify-center text-red-500">
        PayTR verisi çözümlenemedi.
      </main>
    );
  }

  return (
    <form id="paytr_form" method="POST" action={url}>
      {Object.entries(postData).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={String(value)} />
      ))}

      <p className="text-center mt-10 text-gray-700">
        PayTR ödeme sayfasına yönlendiriliyorsunuz...
      </p>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.getElementById("paytr_form").submit();
          `,
        }}
      />
    </form>
  );
}
