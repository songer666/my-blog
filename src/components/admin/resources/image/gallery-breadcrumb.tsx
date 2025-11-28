"use client";

import { useEffect } from "react";
import { useBreadCrumbStore } from "@/store/breadcrumb/store";

interface GalleryBreadcrumbProps {
  galleryName: string;
}

export function GalleryBreadcrumb({ galleryName }: GalleryBreadcrumbProps) {
  const setCrumbs = useBreadCrumbStore(state => state.setCrumbs);

  useEffect(() => {
    setCrumbs([
      { title: "管理栏" },
      { title: "资源管理" },
      { title: "图库管理", url: "/admin/dashboard/resources/image" },
      { title: galleryName }
    ]);
  }, [galleryName, setCrumbs]);

  return null;
}
