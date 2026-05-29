"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { adminApi } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { CatalogOption } from "@/types/api";

type CatalogKind = "semesters" | "branches" | "subjects" | "programming-categories";

const labels: Record<CatalogKind, string> = {
  semesters: "Semesters",
  branches: "Branches",
  subjects: "Subjects",
  "programming-categories": "Programming Categories"
};

export default function CatalogPage() {
  const [kind, setKind] = useState<CatalogKind>("subjects");
  const [items, setItems] = useState<CatalogOption[]>([]);
  const [semesters, setSemesters] = useState<CatalogOption[]>([]);
  const [branches, setBranches] = useState<CatalogOption[]>([]);
  const [loading, setLoading] = useState(false);

  async function load(nextKind = kind) {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const [semesterOptions, branchOptions] = await Promise.all([
        adminApi.semesters(token),
        adminApi.branches(token)
      ]);
      setSemesters(semesterOptions);
      setBranches(branchOptions);
      if (nextKind === "semesters") setItems(semesterOptions);
      if (nextKind === "branches") setItems(branchOptions);
      if (nextKind === "subjects") setItems(await adminApi.subjects(token));
      if (nextKind === "programming-categories") setItems(await adminApi.programmingCategories(token));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load catalog.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(kind);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const token = getToken();
    if (!token) return;
    const form = new FormData(formElement);
    const body: Record<string, unknown> = {
      name: String(form.get("name") ?? ""),
      slug: String(form.get("slug") ?? ""),
      code: String(form.get("code") ?? ""),
      fullName: String(form.get("fullName") ?? ""),
      description: String(form.get("description") ?? ""),
      active: true
    };
    if (kind === "semesters") body.number = Number(form.get("number"));
    if (kind === "programming-categories") body.displayOrder = Number(form.get("displayOrder") || 100);
    if (kind === "subjects") {
      body.semesterId = Number(form.get("semesterId"));
      body.branchId = Number(form.get("branchId"));
    }
    try {
      await adminApi.createCatalog(token, `/api/admin/${kind}`, body);
      toast.success("Catalog item created.");
      formElement.reset();
      load(kind);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create catalog item.");
    }
  }

  async function remove(item: CatalogOption) {
    const token = getToken();
    if (!token) return;
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try {
      await adminApi.deleteCatalog(token, `/api/admin/${kind}/${item.id}`);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      toast.success("Catalog item deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete catalog item.");
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-white">Catalog Management</h1>
        <p className="mt-2 text-sm text-zinc-400">Manage semesters, branches, subjects and programming categories used by uploads.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(Object.keys(labels) as CatalogKind[]).map((entry) => (
          <Button key={entry} variant={kind === entry ? "default" : "secondary"} onClick={() => setKind(entry)}>
            {labels[entry]}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card className="p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">Add {labels[kind]}</h2>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" placeholder="Auto-generated if empty" />
            </div>
            {kind === "semesters" ? (
              <div className="space-y-2">
                <Label htmlFor="number">Semester number</Label>
                <Input id="number" name="number" type="number" min="1" max="12" required />
              </div>
            ) : null}
            {kind === "branches" || kind === "subjects" ? (
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input id="code" name="code" />
              </div>
            ) : null}
            {kind === "branches" ? (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full branch name</Label>
                <Input id="fullName" name="fullName" />
              </div>
            ) : null}
            {kind === "subjects" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="semesterId">Semester</Label>
                  <Select id="semesterId" name="semesterId" required>
                    <option value="">Select</option>
                    {semesters.map((semester) => (
                      <option key={semester.id} value={semester.id}>
                        {semester.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branchId">Branch</Label>
                  <Select id="branchId" name="branchId" required>
                    <option value="">Select</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            ) : null}
            {kind === "programming-categories" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Display order</Label>
                  <Input id="displayOrder" name="displayOrder" type="number" defaultValue={100} />
                </div>
              </>
            ) : null}
            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </form>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-white/10 p-5">
            <h2 className="text-lg font-semibold text-white">{labels[kind]}</h2>
            <p className="mt-1 text-sm text-zinc-400">{items.length} items</p>
          </div>
          <div className="divide-y divide-white/10">
            {loading ? (
              <p className="p-5 text-sm text-zinc-400">Loading catalog</p>
            ) : items.length ? (
              items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">{item.name}</p>
                    <p className="mt-1 truncate text-xs text-zinc-500">{item.fullName ?? item.description ?? item.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.code ? <Badge>{item.code}</Badge> : null}
                    <Button variant="danger" size="icon" onClick={() => remove(item)} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-5 text-sm text-zinc-400">No catalog items found.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
