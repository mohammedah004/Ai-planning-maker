"use client";

import { useMemo } from "react";
import { normalizeContentItem } from "@/lib/content-preview-adapter";
import CarouselPreview from "./CarouselPreview";
import ReelPreview from "./ReelPreview";
import PostPreview from "./PostPreview";

export default function ContentFormatPreview({
  item,
  isEditing = false,
  editState = {},
  onFieldChange = null,
  isLoading = false,
  className = "",
}) {
  const normalized = useMemo(() => {
    if (!item) return null;
    return normalizeContentItem(item);
  }, [item]);

  if (isLoading) {
    return (
      <div className={`space-y-4 animate-pulse ${className}`}>
        <div className="h-44 rounded-2xl bg-slate-100 dark:bg-zinc-800/60" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="h-24 rounded-xl bg-slate-100 dark:bg-zinc-800/60" />
          <div className="h-24 rounded-xl bg-slate-100 dark:bg-zinc-800/60" />
          <div className="h-24 rounded-xl bg-slate-100 dark:bg-zinc-800/60" />
        </div>
      </div>
    );
  }

  if (!normalized) {
    return (
      <div className={`p-8 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-center text-slate-500 text-sm ${className}`}>
        لا توجد بيانات متاحة لهذا المنشور.
      </div>
    );
  }

  const postType = isEditing
    ? editState.post_type || normalized.postType
    : normalized.postType;

  switch (postType) {
    case "carousel":
      return (
        <CarouselPreview
          item={normalized}
          isEditing={isEditing}
          editState={editState}
          onFieldChange={onFieldChange}
          className={className}
        />
      );
    case "reel":
      return (
        <ReelPreview
          item={normalized}
          isEditing={isEditing}
          editState={editState}
          onFieldChange={onFieldChange}
          className={className}
        />
      );
    case "static_post":
    case "story":
    default:
      return (
        <PostPreview
          item={normalized}
          isEditing={isEditing}
          editState={editState}
          onFieldChange={onFieldChange}
          className={className}
        />
      );
  }
}
