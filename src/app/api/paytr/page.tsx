"use client";
import { useSearchParams } from "next/navigation";

export default function PaytrRedirectPage() {
  const params = useSearchParams();
  const data = params.get("data");
  const url = params.get("url");

  if (!data || !url) return <p>Yönlendirme bilgisi bulunamadı.</p>;

  const postData = JSON.parse(data);

  return (
    <form id="paytr_form" method="POST" action={url}>
      {Object.entries(postData).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={String(v)} />
      ))}
      <p>PayTR ödeme sayfasına yönlendiriliyorsunuz...</p>
      <button type="submit">Git</button>

      <script dangerouslySetInnerHTML={{ __html: `document.getElementById("paytr_form").submit();` }} />
    </form>
  );
}
