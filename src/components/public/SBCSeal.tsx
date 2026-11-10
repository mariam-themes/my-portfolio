'use client';

import Script from 'next/script';

/**
 * Saudi Business Center (SBC) electronic verification seal.
 * The external script reads the data-* attributes on the div
 * and injects the "متجر موثّق" badge + QR code as a fixed overlay.
 * suppressHydrationWarning prevents React from complaining about
 * DOM mutations made by the third-party script after hydration.
 */
export default function SBCSeal() {
  return (
    <>
      <div
        className="sbc-verify-seal"
        data-token="YlltWXkxZG15bmtiLzJ0eFlvUGErZz09"
        data-position="bottom-left"
        suppressHydrationWarning
      />
      <Script
        src="https://eauthenticate.saudibusiness.gov.sa/EAuthSealApi/seal.js"
        strategy="afterInteractive"
      />
    </>
  );
}

