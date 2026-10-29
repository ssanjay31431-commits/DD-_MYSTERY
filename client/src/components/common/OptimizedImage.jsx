import React from 'react';

const getResponsiveSources = (src) => {
  try {
    const url = new URL(src);

    if (/\/api\/products\/[0-9a-f]{24}\/image(?:\/content\/[0-9a-f]{24})?$/i.test(url.pathname)) {
      const buildUrl = (width) => {
        const responsiveUrl = new URL(url);
        responsiveUrl.searchParams.set('width', String(width));
        return responsiveUrl.toString();
      };

      return {
        src: buildUrl(640),
        srcSet: [320, 640, 960].map((width) => `${buildUrl(width)} ${width}w`).join(', ')
      };
    }

    if (url.hostname === 'images.unsplash.com') {
      const buildUrl = (width) => {
        const responsiveUrl = new URL(url);
        responsiveUrl.searchParams.set('auto', 'format');
        responsiveUrl.searchParams.set('fit', 'max');
        responsiveUrl.searchParams.set('q', '75');
        responsiveUrl.searchParams.set('w', String(width));
        return responsiveUrl.toString();
      };

      return {
        src: buildUrl(640),
        srcSet: [320, 640, 960].map((width) => `${buildUrl(width)} ${width}w`).join(', ')
      };
    }

    if ((url.hostname === 'cloudinary.com' || url.hostname.endsWith('.cloudinary.com')) && url.pathname.includes('/upload/')) {
      const buildUrl = (width) => {
        const responsiveUrl = new URL(url);
        responsiveUrl.pathname = responsiveUrl.pathname.replace(
          '/upload/',
          `/upload/f_auto,q_auto,w_${width},c_limit/`
        );
        return responsiveUrl.toString();
      };

      return {
        src: buildUrl(640),
        srcSet: [320, 640, 960].map((width) => `${buildUrl(width)} ${width}w`).join(', ')
      };
    }
  } catch {
    return { src };
  }

  return { src };
};

export const OptimizedImage = ({ src, alt, sizes = '(max-width: 768px) 100vw, 50vw', loading = 'lazy', ...props }) => {
  const sources = getResponsiveSources(src || '');

  return (
    <img
      {...props}
      src={sources.src}
      srcSet={sources.srcSet}
      sizes={sources.srcSet ? sizes : undefined}
      alt={alt}
      loading={loading}
      decoding="async"
    />
  );
};
