"use client";

import { useEffect } from "react";
import { useBreadCrumbStore } from "@/store/breadcrumb/store";

interface AlbumBreadcrumbProps {
  albumName: string;
}

export function AlbumBreadcrumb({ albumName }: AlbumBreadcrumbProps) {
  const setCrumbs = useBreadCrumbStore(state => state.setCrumbs);

  useEffect(() => {
    setCrumbs([
      { title: "管理栏" },
      { title: "资源管理" },
      { title: "音乐管理", url: "/admin/dashboard/resources/music" },
      { title: albumName }
    ]);
  }, [albumName, setCrumbs]);

  return null;
}
