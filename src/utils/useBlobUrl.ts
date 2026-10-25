import { useEffect, useState } from "react";
import { getBlobUrl } from "../storage/db";

export function useBlobUrl(id: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    getBlobUrl(id).then((u) => {
      if (!cancelled) setUrl(u);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);
  return url;
}
