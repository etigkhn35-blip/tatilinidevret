import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");
  if (!uid) return NextResponse.json({ isAdmin: false });

  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (snap.exists() && snap.data().role === "admin") {
    return NextResponse.json({ isAdmin: true });
  } else {
    return NextResponse.json({ isAdmin: false });
  }
}
