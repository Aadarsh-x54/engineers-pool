"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { CatalogOption } from "@/types/api";

type UploadMode = "rgpv" | "programming" | "common";

export function UploadNoteForm({ mode }: { mode: UploadMode }) {
  const [semesters, setSemesters] = useState<CatalogOption[]>([]);
  const [branches, setBranches] = useState<CatalogOption[]>([]);
  const [categories, setCategories] = useState<CatalogOption[]>([]);
  const [semesterId, setSemesterId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [published, setPublished] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    const authToken = token;
    async function load() {
      try {
        if (mode === "rgpv") {
          const [semesterOptions, branchOptions] = await Promise.all([
            adminApi.semesters(authToken),
            adminApi.branches(authToken)
          ]);
          setSemesters(semesterOptions);
          setBranches(branchOptions);
        }
        if (mode === "programming") {
          setCategories(await adminApi.programmingCategories(authToken));
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load upload options.");
      }
    }
    load();
  }, [mode]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const token = getToken();
    if (!token) return;
    const form = new FormData(formElement);
    form.set("published", String(published));
    setSubmitting(true);
    try {
      if (mode === "rgpv") {
        await adminApi.createRgpv(token, form);
      } else if (mode === "programming") {
        await adminApi.createProgramming(token, form);
      } else {
        await adminApi.createCommon(token, form);
      }
      toast.success("Note uploaded.");
      formElement.reset();
      setSubjectName("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={submit} className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Note title</Label>
            <Input id="title" name="title" placeholder="Machine Learning Unit 1 Notes" required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Short context for students" />
          </div>

          {mode === "rgpv" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="semesterId">Semester</Label>
                <Select id="semesterId" name="semesterId" value={semesterId} onChange={(event) => setSemesterId(event.target.value)} required>
                  <option value="">Select semester</option>
                  {semesters.map((semester) => (
                    <option key={semester.id} value={semester.id}>
                      {semester.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="branchId">Branch</Label>
                <Select id="branchId" name="branchId" value={branchId} onChange={(event) => setBranchId(event.target.value)} required>
                  <option value="">Select branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="subjectName">Subject</Label>
                <Input
                  id="subjectName"
                  name="subjectName"
                  value={subjectName}
                  onChange={(event) => setSubjectName(event.target.value)}
                  placeholder="e.g. Machine Learning"
                  required
                />
              </div>
            </>
          ) : null}

          {mode === "programming" ? (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="programmingCategoryId">Programming category</Label>
              <Select id="programmingCategoryId" name="programmingCategoryId" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required>
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" name="tags" placeholder="unit-1, important, rgpv" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input id="file" name="file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.zip" required />
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-3 text-sm text-zinc-300">
            <Switch checked={published} onCheckedChange={setPublished} />
            Publish immediately
          </label>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Uploading" : "Upload note"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
