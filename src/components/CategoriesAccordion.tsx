"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";

export default function CategoriesAccordion() {
  const [open, setOpen] = useState<string | null>("Konaklama");

  return (
    <aside className="bg-white rounded-xl border shadow-card">
      <div className="p-4 border-b font-semibold text-ink">Kategoriler</div>

      <div className="divide-y">
        {CATEGORIES.map((data) => {
          const cat = data.anaKategori;
          const isOpen = open === cat;

          return (
            <div key={cat} className="p-3">
              {/* ANA KATEGORİ */}
              <button
                className="w-full flex items-center justify-between text-left"
                onClick={() => setOpen(isOpen ? null : cat)}
              >
                <span className="font-semibold flex items-center gap-2">
                  {data.icon ?? ""} {cat}
                </span>

                <svg
                  className={`h-5 w-5 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* ALT KATEGORİLER */}
              {isOpen && (
                <ul className="mt-2 space-y-1">
                  {data.altKategoriler.map((s) => (
                    <li key={s}>
                      <a
                        href={`/kategori/${encodeURIComponent(s)}`}
                        className="block px-2 py-1 rounded hover:bg-soft text-[15px] text-ink/90"
                      >
                        {s}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
