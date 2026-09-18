import { ImageResponse } from "next/og";
import { SocialCard } from "./_components/social-card";

export const alt =
  "Jevinik equity decision terminal showing evidence-backed stock analysis";
export const size = { width: 1200, height: 600 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(<SocialCard height={size.height} />, size);
}
