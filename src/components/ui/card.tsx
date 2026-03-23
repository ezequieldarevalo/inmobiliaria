import { cn } from "@/lib/utils";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-gray-900 border border-gray-800 rounded-2xl p-6", className)}>
      {children}
    </div>
  );
}
