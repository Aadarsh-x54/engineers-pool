import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: number;
  icon: LucideIcon;
};

export function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-400">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{value.toLocaleString("en-IN")}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
