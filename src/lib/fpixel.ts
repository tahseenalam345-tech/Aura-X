export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

// Prevent TypeScript errors
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export const pageview = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
};

// Generic event tracking function
export const event = (name: string, options = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', name, options);
  }
};