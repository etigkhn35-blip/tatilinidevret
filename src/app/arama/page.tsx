export const dynamic = "force-dynamic";
export const revalidate = false;

import AramaClient from "./AramaClient";

export default function Page({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q || "";
  return <AramaClient q={q} />;
}
