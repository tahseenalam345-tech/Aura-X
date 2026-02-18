"use client";

import dynamic from 'next/dynamic';

// 1. Lazy load the real popup
// 2. ssr: false = Never run this on the server (saves resources)
const TrustPopup = dynamic(() => import('@/components/TrustPopup'), {
  ssr: false,
});

export default function PopupLoader() {
  return <TrustPopup />;
}
