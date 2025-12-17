import { Suspense } from "react";
import MesajlarContent from "./MesajlarContent";

export default function Page() {
  return (
    <Suspense fallback={<p>Yükleniyor...</p>}>
      <MesajlarContent />
    </Suspense>
  );
}
