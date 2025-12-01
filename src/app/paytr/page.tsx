import { Suspense } from "react";
import PaytrRedirectContent from "./PaytrRedirectContent";

export default function Page() {
  return (
    <Suspense fallback={<p>Yükleniyor...</p>}>
      <PaytrRedirectContent />
    </Suspense>
  );
}
