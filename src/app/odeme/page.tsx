import { Suspense } from "react";
import OdemeContent from "./success-content";

export default function Page() {
  return (
    <Suspense fallback={<p>Yükleniyor...</p>}>
      <OdemeContent />
    </Suspense>
  );
}
