import Image from "next/image";

interface Props {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Clip-path reveal on scroll (use for photographs, not cut-outs). */
  clip?: boolean;
  /** Vertical drift while scrolling, 0–1. */
  parallax?: number;
}

/** Product / editorial image with fixed intrinsic size (no layout shift). */
export default function ImageReveal({ src, alt, width, height, sizes, priority, className = "", clip, parallax }: Props) {
  const img = (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={`h-auto w-full select-none ${className}`}
      {...(clip ? { "data-clip-img": "" } : {})}
    />
  );
  const inner = clip ? <div data-clip>{img}</div> : img;
  return parallax ? (
    <div>
      <div data-parallax={parallax}>{inner}</div>
    </div>
  ) : (
    inner
  );
}
