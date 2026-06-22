"use client";

import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

export default function Shell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <main className="flex-1 px-6 pb-28 lg:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className={`mx-auto pt-8 lg:pt-12 ${wide ? "max-w-5xl" : "max-w-xl"}`}
        >
          {children}
        </motion.div>
      </main>
      <BottomNav />
    </div>
  );
}
