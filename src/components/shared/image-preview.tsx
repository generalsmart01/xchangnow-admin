"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Renders a remote image URL (e.g. Cloudinary) as a clickable image that opens
 * full-size in a new tab. If the image fails to load, falls back to a plain
 * "Open image" link so a bad URL never shows a broken-image icon silently.
 */
export function ImagePreview({
  src,
  alt = "Image",
  className,
  imgClassName,
}: {
  src: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-1.5 text-sm text-primary hover:underline",
          className,
        )}
      >
        <ExternalLink className="size-3.5" /> Open image
      </a>
    );
  }

  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("block", className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onError={() => setFailed(true)}
        className={cn("rounded-md border object-contain", imgClassName)}
      />
    </a>
  );
}
