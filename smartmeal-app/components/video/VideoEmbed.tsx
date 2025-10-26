"use client";

import React from "react";

interface VideoEmbedProps {
  videoId: string;
  title?: string;
  autoplay?: boolean;
}

export function VideoEmbed({ videoId, title = "Recipe Video", autoplay = false }: VideoEmbedProps) {
  if (!videoId) {
    return (
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No video available</p>
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}${autoplay ? "?autoplay=1" : ""}`;

  return (
    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
