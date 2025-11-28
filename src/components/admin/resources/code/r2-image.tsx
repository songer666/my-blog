"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getR2ImageAction } from "@/server/actions/resources/r2-client-action";
import { Loader2 } from "lucide-react";

const styles = {
  loadingContainer: `flex items-center justify-center w-full h-full bg-muted`.trim(),
  loadingIcon: `h-6 w-6 animate-spin text-muted-foreground`.trim(),
  errorContainer: `flex items-center justify-center w-full h-full bg-muted text-muted-foreground text-sm`.trim(),
};

interface R2ImageProps {
  r2Key: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
}

export function R2Image({ r2Key, alt, fill, className, sizes }: R2ImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      try {
        const result = await getR2ImageAction(r2Key);
        if (isMounted) {
          if (result.success && result.url) {
            setImageUrl(result.url);
          } else {
            setError(true);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [r2Key]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.loadingIcon} />
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className={styles.errorContainer}>
        加载失败
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
    />
  );
}
