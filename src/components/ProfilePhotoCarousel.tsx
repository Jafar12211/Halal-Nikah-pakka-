import React, { useEffect, useMemo, useState } from 'react';

interface ProfilePhotoCarouselProps {
  photos?: string[];
  alt: string;
  initials?: string;
  backgroundColor?: string;
  className?: string;
  imageClassName?: string;
  blurred?: boolean;
}

/**
 * Automatically rotates through candidate-provided photos.
 * Only HTTPS URLs are rendered; broken URLs fall back to the profile monogram.
 */
export const ProfilePhotoCarousel: React.FC<ProfilePhotoCarouselProps> = ({
  photos = [],
  alt,
  initials = '?',
  backgroundColor = '#047857',
  className = '',
  imageClassName = '',
  blurred = false,
}) => {
  const safePhotos = useMemo(
    () => photos.filter((photo) => typeof photo === 'string' && /^https:\/\//i.test(photo)),
    [photos],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedPhotos, setFailedPhotos] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setActiveIndex(0);
    setFailedPhotos(new Set());
  }, [safePhotos.join('|')]);

  useEffect(() => {
    if (safePhotos.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % safePhotos.length);
    }, 3500);
    return () => window.clearInterval(timer);
  }, [safePhotos.length]);

  const currentPhoto = safePhotos[activeIndex];
  const canDisplayPhoto = Boolean(currentPhoto && !failedPhotos.has(currentPhoto));

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      role="img"
      aria-label={canDisplayPhoto ? `${alt}, photo ${activeIndex + 1} of ${safePhotos.length}` : `${alt}, profile placeholder`}
    >
      {canDisplayPhoto ? (
        <img
          key={currentPhoto}
          src={currentPhoto}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => {
            if (currentPhoto) {
              setFailedPhotos((previous) => new Set(previous).add(currentPhoto));
            }
          }}
          className={`w-full h-full object-cover ${blurred ? 'blur-xs scale-105' : ''} ${imageClassName}`}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-white font-serif font-bold"
          style={{ backgroundColor }}
          aria-hidden="true"
        >
          {initials}
        </div>
      )}
      {safePhotos.length > 1 && (
        <span className="absolute bottom-1 right-1 rounded-full bg-stone-950/75 px-1.5 py-0.5 text-[9px] font-semibold text-white">
          {activeIndex + 1}/{safePhotos.length}
        </span>
      )}
    </div>
  );
};
