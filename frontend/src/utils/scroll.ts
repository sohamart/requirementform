/**
 * Smooth scrolling utility for landing page sections and anchor navigation.
 * Handles sticky navbar offset (default 85px) and avoids abrupt browser jumping.
 */

export const smoothScrollTo = (targetId: string, offset = 85): boolean => {
  if (typeof window === 'undefined') return false;

  const cleanId = targetId.replace(/^#/, '');
  const element = document.getElementById(cleanId);

  if (!element) {
    return false;
  }

  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;

  window.scrollTo({
    top: Math.max(0, offsetPosition),
    behavior: 'smooth',
  });

  // Update hash in URL smoothly without triggering browser abrupt jump
  if (window.history && window.history.pushState) {
    window.history.pushState(null, '', `#${cleanId}`);
  }

  return true;
};
