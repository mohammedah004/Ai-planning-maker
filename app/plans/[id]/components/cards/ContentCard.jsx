"use client";

import ReelCard from "./ReelCard";
import CarouselCard from "./CarouselCard";
import PostCard from "./PostCard";
import StoryCard from "./StoryCard";
import GenericContentCard from "./GenericContentCard";

export default function ContentCard({
  item,
  planId,
  isMini = false,
  onRegenerate = null,
  readOnly = false,
  className = "",
}) {
  if (!item) return null;

  const postType = (item.postType || item.post_type || "").toLowerCase();

  switch (postType) {
    case "reel":
      return (
        <ReelCard
          item={item}
          planId={planId}
          isMini={isMini}
          onRegenerate={onRegenerate}
          readOnly={readOnly}
          className={className}
        />
      );

    case "carousel":
      return (
        <CarouselCard
          item={item}
          planId={planId}
          isMini={isMini}
          onRegenerate={onRegenerate}
          readOnly={readOnly}
          className={className}
        />
      );

    case "static_post":
    case "post":
      return (
        <PostCard
          item={item}
          planId={planId}
          isMini={isMini}
          onRegenerate={onRegenerate}
          readOnly={readOnly}
          className={className}
        />
      );

    case "story":
      return (
        <StoryCard
          item={item}
          planId={planId}
          isMini={isMini}
          onRegenerate={onRegenerate}
          readOnly={readOnly}
          className={className}
        />
      );

    default:
      return (
        <GenericContentCard
          item={item}
          planId={planId}
          isMini={isMini}
          onRegenerate={onRegenerate}
          readOnly={readOnly}
          className={className}
        />
      );
  }
}
