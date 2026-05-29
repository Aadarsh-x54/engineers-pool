"use client";

import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { whatsappUrl } from "@/lib/utils";

export function WhatsappCard({ number }: { number: string }) {
  return (
    <Card className="overflow-hidden p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-google-green text-black">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Want to contribute notes?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Send your notes on WhatsApp. After verification, we will upload them.
            </p>
            <p className="mt-1 text-sm text-zinc-500">{number}</p>
          </div>
        </div>
        <Button asChild className="sm:w-auto">
          <a href={whatsappUrl(number)} target="_blank" rel="noreferrer">
            <Send className="h-4 w-4" />
            Send on WhatsApp
          </a>
        </Button>
      </div>
    </Card>
  );
}
