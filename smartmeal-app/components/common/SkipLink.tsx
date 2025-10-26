"use client";

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

/**
 * Skip navigation link for accessibility
 * Allows keyboard users to skip to main content
 */
export function SkipLink({ href, children }: SkipLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector(href) as HTMLElement;
    if (target) {
      target.tabIndex = -1;
      target.focus();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      
      // Remove tabindex after focus
      setTimeout(() => {
        target.removeAttribute("tabindex");
      }, 1000);
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:shadow-lg"
    >
      {children}
    </a>
  );
}
