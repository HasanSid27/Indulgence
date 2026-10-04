/** The iNdulgence logotype as a colourable mask — inherits `currentColor`. */
export default function Wordmark({ className = "", label = true }: { className?: string; label?: boolean }) {
  return (
    <span
      className={`wordmark ${className}`}
      role={label ? "img" : undefined}
      aria-label={label ? "iNdulgence" : undefined}
      aria-hidden={label ? undefined : true}
    />
  );
}
