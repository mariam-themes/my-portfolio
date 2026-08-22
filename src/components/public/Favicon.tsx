'use client';

import { useState } from 'react';

/**
 * Renders a website's favicon (the icon shown in the browser tab) for a given
 * URL. Falls back to a neutral circle if the URL is invalid or the favicon
 * fails to load — used for social links whose platform isn't a known brand.
 */
export default function Favicon({
  url,
  className,
}: {
  url: string;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);

  let host = '';
  try {
    host = new URL(url).host;
  } catch {
    host = '';
  }

  if (!host || errored) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
        <circle cx="12" cy="12" r="10" />
      </svg>
    );
  }

  const favicon = `https://www.google.com/s2/favicons?domain=${host}&sz=64`;

  return (
    <img
      src={favicon}
      alt=""
      className={`${className || ''} rounded-full object-cover`}
      onError={() => setErrored(true)}
    />
  );
}
