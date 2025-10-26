"use client";

import React, { useState } from "react";
import Image from "next/image";

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  fill,
  className = "",
  priority = false,
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        className={`${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        onLoadingComplete={() => setIsLoading(false)}
        onError={() => setError(true)}
        priority={priority}
        loading={priority ? undefined : "lazy"}
      />
    </div>
  );
}
