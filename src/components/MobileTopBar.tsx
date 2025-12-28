// components/MobileTopbar.tsx
import React from "react";
export default function MobileTopbar({
  searchForm,
  menuButton,
  ilanVerButton,
}: {
  searchForm: React.ReactNode;
  menuButton: React.ReactNode;
  ilanVerButton: React.ReactNode;
}) {
  return (
    <div className="md:hidden w-full bg-white border-b border-gray-200 px-3 py-2 flex items-center gap-2">
      {menuButton}
      <div className="flex-1">{searchForm}</div>
      {ilanVerButton}
    </div>
  );
}
