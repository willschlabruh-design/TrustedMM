import React from 'react';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & { size?: number };

export default function Avatar({ src, alt, className, size = 48, ...rest }: Props){
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 24 24'>
      <rect width='100%' height='100%' fill='%23071129' rx='6' />
      <g fill='%23ffffff' opacity='0.95'>
        <circle cx='12' cy='8' r='4' />
        <path d='M12 14c-5 0-8 2.5-8 4v2h16v-2c0-1.5-3-4-8-4z' />
      </g>
    </svg>
  `;
  const placeholder = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img
      src={src || placeholder}
      alt={alt}
      className={className}
      onError={(e) => {
        const t = e.currentTarget as HTMLImageElement;
        if (t && t.src !== placeholder) {
          t.onerror = null;
          t.src = placeholder;
        }
      }}
      {...rest}
    />
  );
}
