"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Building2 } from "lucide-react";
import { useCreateClient } from "@/lib/hooks/use-clients";

const industries = [
  "Manufacturing",
  "IT Services",
  "Pharmaceuticals",
  "Automotive",
  "BFSI",
  "Retail",
  "Telecom",
  "Energy",
  "Healthcare",
  "Real Estate",
  "Other",
];

export default function NewClientPage() {
  const router = useRouter();
  const createClient = useCreateClient();

  const [formData, setFormData] = useState({
    name: "",
    pan: "",
    industry: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
  });
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate PAN format
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(formData.pan.toUpperCase())) {
      setError("Invalid PAN format. Expected format: ABCDE1234F");
      return;
    }

    try {
      const result = await createClient.mutateAsync({
        name: formData.name,
        pan: formData.pan.toUpperCase(),
        country: "India",
        industry: formData.industry || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        pincode: formData.pincode || undefined,
        contactPerson: formData.contactPerson || undefined,
        contactEmail: formData.contactEmail || undefined,
        contactPhone: formData.contactPhone || undefined,
      });

      router.push(`/dashboard/clients/${result.client.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create client");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/clients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Add New Client
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Enter client details to create a new client record
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-[var(--error-bg)] p-3 text-sm text-[var(--error)]">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
              <Building2 className="h-5 w-5" />
              Basic Information
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Client Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter client name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pan">PAN *</Label>
                <Input
                  id="pan"
                  name="pan"
                  placeholder="ABCDE1234F"
                  value={formData.pan}
                  onChange={handleChange}
                  required
                  className="uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => handleSelectChange("industry", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Enter registered address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  placeholder="Pincode (6 digits)"
                  value={formData.pincode}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4 border-t border-[var(--border-subtle)] pt-6">
            <div className="text-lg font-semibold text-[var(--text-primary)]">
              Contact Information
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  placeholder="Full name"
                  value={formData.contactPerson}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.contactEmail}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.contactPhone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-[var(--border-subtle)] pt-6">
            <Link href="/dashboard/clients">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={createClient.isPending}>
              {createClient.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Client"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
