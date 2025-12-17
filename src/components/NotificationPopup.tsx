"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type NotificationData = {
  id: string;
  title?: string;
  text?: string;
  url?: string; // tıklandığında gidilecek sayfa (chat, ilan vs.)
};

type NotificationPopupProps = {
  data: NotificationData | null;
  onClose: () => void;
};

export default function NotificationPopup({ data, onClose }: NotificationPopupProps) {
  if (!data) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 250, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 250, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed bottom-4 right-4 z-50 w-[320px] rounded-xl bg-white shadow-xl border border-gray-200 p-4"
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            {data.title && (
              <h3 className="font-semibold text-sm mb-1">{data.title}</h3>
            )}
            {data.text && (
              <p className="text-xs text-gray-600 mb-2">{data.text}</p>
            )}

            {data.url && (
              <Link
                href={data.url}
                className="inline-flex text-xs font-medium text-primary hover:underline"
                onClick={onClose}
              >
                Detayı Gör
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-2 text-gray-400 hover:text-gray-600 text-sm"
          >
            ×
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
