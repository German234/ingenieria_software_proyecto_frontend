"use client";

import { Search } from "lucide-react";

interface AsistenciaSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function AsistenciaSearchBar({
  value,
  onChange,
  placeholder = "Buscar por nombre o correo...",
}: AsistenciaSearchBarProps) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#003C71] focus:border-[#003C71] transition"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
