"use client";

import { FormEvent, useEffect, useState } from "react";
import { KeyRound, MessageCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminApi, publicApi } from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function AdminSettingsPage() {
  const [whatsapp, setWhatsapp] = useState("");
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    publicApi
      .whatsapp()
      .then((response) => setWhatsapp(response.value))
      .catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load settings."));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      const response = await adminApi.updateWhatsapp(token, whatsapp);
      setWhatsapp(response.value);
      toast.success("WhatsApp number updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update setting.");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getToken();
    if (!token) return;
    setChangingPassword(true);
    try {
      await adminApi.changePassword(token, currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Admin password changed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to change password.");
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-white">Settings</h1>
        <p className="mt-2 text-sm text-zinc-400">Manage contribution contact details used on the public website.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
      <Card className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-google-green text-black">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">WhatsApp contribution number</h2>
            <p className="text-sm text-zinc-400">Shown on the public contribution card.</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp number</Label>
            <Input
              id="whatsapp"
              value={whatsapp}
              onChange={(event) => setWhatsapp(event.target.value)}
              placeholder="+919999999999"
              required
            />
          </div>
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "Saving" : "Save setting"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-google-blue text-black">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Change admin password</h2>
            <p className="text-sm text-zinc-400">Use this after login to replace the default password.</p>
          </div>
        </div>
        <form onSubmit={changePassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              minLength={4}
              required
            />
          </div>
          <Button type="submit" disabled={changingPassword}>
            <Save className="h-4 w-4" />
            {changingPassword ? "Changing" : "Change password"}
          </Button>
        </form>
      </Card>
      </div>
    </div>
  );
}
