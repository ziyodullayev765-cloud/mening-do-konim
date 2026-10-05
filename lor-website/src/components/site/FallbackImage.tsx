"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

/**
 * next/image that swaps to `fallback` when the image cannot be loaded
 * (e.g. a deleted external link), instead of showing a broken image.
 */
export function FallbackImage({ fallback = null, ...props }: ImageProps & { fallback?: React.ReactNode }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;
  return <Image {...props} onError={() => setFailed(true)} />;
}
