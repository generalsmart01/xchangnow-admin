"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import {
  ACCEPTED_IMAGE_TYPES,
  uploadImage,
  type UploadPurpose,
} from "@/lib/api/uploads";

/**
 * Image picker that uploads to `/uploads/image` with the given `purpose` and
 * reports the returned URL via `onChange`. Shows a thumbnail of the chosen
 * image with a remove button. `value` is the uploaded URL ("" = none).
 */
export function ImageUploadField({
  value,
  onChange,
  purpose,
  disabled,
  buttonLabel = "Upload image",
}: {
  value: string;
  onChange: (url: string) => void;
  purpose: UploadPurpose;
  disabled?: boolean;
  buttonLabel?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function pick(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file, purpose);
      onChange(url);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Upload failed.";
      toast.error(message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />

      {value ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Receipt preview"
            className="max-h-40 w-auto rounded-md border object-contain"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={disabled}
            className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-foreground text-background shadow"
            aria-label="Remove image"
          >
            <X className="size-3" />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ImagePlus className="size-4" />
          )}
          {uploading ? "Uploading…" : buttonLabel}
        </Button>
      )}
    </div>
  );
}
