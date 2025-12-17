export const dynamic = "force-dynamic";
export const revalidate = false;

import MessagesClient from "./MessagesClient";

export default function Page() {
  return <MessagesClient />;
}
