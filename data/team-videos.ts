// ═══════════════════════════════════════════════════════════════════
// Team video testimonials for the /join recruiting page.
//
// ▶ To add a video, paste its URL into videoUrl. Supported formats:
//     YouTube watch:  https://www.youtube.com/watch?v=XXXXXXXX
//     YouTube short:  https://youtu.be/XXXXXXXX
//     YouTube embed:  https://www.youtube.com/embed/XXXXXXXX
//     Vimeo:          https://vimeo.com/123456789
//                     https://player.vimeo.com/video/123456789
//     Direct MP4:     https://anywhere.com/video.mp4
//
// The TeamVideos component normalizes these to an embed URL and
// auto-pulls the YouTube thumbnail as a poster when applicable.
//
// Set videoUrl to null to render a "Coming soon" placeholder card.
// ═══════════════════════════════════════════════════════════════════

export type TeamVideo = {
  slug: string;
  speaker: string;
  title: string;
  description: string;
  videoUrl: string | null;
};

export const teamVideos: TeamVideo[] = [
  {
    slug: "tamara",
    speaker: "Tamara",
    title: "Getting Into the Mortgage Industry",
    description:
      "Tamara on what it took to break into mortgage and how HCMG's structure made it possible.",
    videoUrl: "https://youtu.be/Xrv546SAlso",
  },
  {
    slug: "theresa",
    speaker: "Theresa",
    title: "Why HCMG",
    description:
      "Theresa explains the moment she knew HCMG was the right home for her book of business.",
    videoUrl: "https://youtu.be/0bj1WImYgEk",
  },
  {
    slug: "jarod",
    speaker: "Jarod",
    title: "HCMG Core Values",
    description:
      "Jarod on the operating values that show up in every file, every call, every closing.",
    videoUrl: "/videos/jarod-core-values.mp4",
  },
  {
    slug: "clark",
    speaker: "Clark",
    title: "Getting Into the Mortgage Industry",
    description:
      "Clark's path into mortgage — and what new originators get at HCMG that they wouldn't get anywhere else.",
    videoUrl: "/videos/clark-getting-into-mortgage.mp4",
  },
];
