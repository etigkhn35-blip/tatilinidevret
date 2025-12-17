// /src/app/arama-sonuclari/page.tsx

import { Suspense } from "react";
import SearchResultsContent from "./SearchResultsContent";

export default function Page() {
  return (
    <Suspense fallback={<p>Yükleniyor...</p>}>
      <SearchResultsContent />
    </Suspense>
  );
}

export const dynamic = "force-dynamic";
