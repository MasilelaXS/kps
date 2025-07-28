export const isMobileDevice = (): boolean => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return false;
  
  // Check user agent for mobile indicators
  const userAgent = window.navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone',
    'mobile', 'webos', 'opera mini', 'iemobile'
  ];
  
  const isMobileUserAgent = mobileKeywords.some(keyword => 
    userAgent.includes(keyword)
  );
  
  // Check screen size (mobile-like dimensions)
  const isMobileScreen = window.innerWidth <= 768 || window.innerHeight <= 1024;
  
  // Check for touch support
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  return isMobileUserAgent || (isMobileScreen && isTouchDevice);
};

export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  return userAgent.includes('ipad') || 
         (userAgent.includes('android') && !userAgent.includes('mobile'));
};

export const isDesktop = (): boolean => {
  return !isMobileDevice();
};
