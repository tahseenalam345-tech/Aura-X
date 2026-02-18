"use client";

import dynamic from 'next/dynamic';

// This handles the lazy loading securely on the client side
const TrustPopup = dynamic(() => import('@/components/TrustPopup'), {
  ssr: false,
});

export default function PopupLoader() {
  return <TrustPopup />;
}
