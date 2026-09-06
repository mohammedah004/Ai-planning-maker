export type ActionType = "camera_speech" | "on_screen_text" | "b_roll";

export interface CarouselSlide {
  order: number;
  headline: string;
  subtext: string;
  visualNote?: string;
  slideCta?: string;
}

export interface ReelScene {
  order: number;
  durationSec: number;
  actionType: ActionType;
  visualDirection: string;
  onScreenText?: string;
  voiceover?: string;
}

export interface StructuredDesignCopy {
  headline?: string;
  subtext?: string;
  cta?: string;
  slides?: CarouselSlide[];
  scenes?: ReelScene[];
  hookLine?: string;
  totalDurationSec?: number;
  generationSource?: "structured" | "legacy";
}

export interface BaseContentItem {
  id?: string;
  dayNumber: number;
  caption: string;
  contentObjective: string;
  contentPillar: string;
  designReference: string;
  cta: string;
  revision?: number;
  updatedAt?: string;
}

export interface PostContentDetails extends BaseContentItem {
  postType: "static_post" | "story";
  designCopy: {
    headline?: string;
    subtext?: string;
    cta?: string;
    generationSource?: "structured" | "legacy";
  };
}

export interface CarouselContentDetails extends BaseContentItem {
  postType: "carousel";
  designCopy: {
    headline?: string;
    subtext?: string;
    cta?: string;
    slides: CarouselSlide[];
    generationSource?: "structured" | "legacy";
  };
}

export interface ReelContentDetails extends BaseContentItem {
  postType: "reel";
  designCopy: {
    hookLine?: string;
    totalDurationSec?: number;
    scenes: ReelScene[];
    headline?: string;
    subtext?: string;
    cta?: string;
    generationSource?: "structured" | "legacy";
  };
}

export type NormalizedContentDetails =
  | PostContentDetails
  | CarouselContentDetails
  | ReelContentDetails;
