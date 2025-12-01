import { Suspense } from "react";
import SuccessContent from "./success-content";

export default function Page() {
  return (
    <Suspense fallback={<p>Yükleniyor...</p>}>
      <SuccessContent />
    </Suspense>
  );
}

