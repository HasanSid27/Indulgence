import type { ElementType } from "react";

interface Props {
  children: string;
  as?: ElementType;
  className?: string;
  /** "reveal": masked rise on scroll. "scrub": words brighten while scrolling. */
  mode?: "reveal" | "scrub" | "none";
  id?: string;
}

/**
 * Wraps each word so ScrollAnimations / section timelines can animate them.
 * Server-rendered, so the text is fully readable without JavaScript.
 */
export default function SplitText({ children, as: Tag = "span", className, mode = "reveal", id }: Props) {
  const words = children.split(/\s+/).filter(Boolean);
  const attr = mode === "reveal" ? { "data-split": "" } : mode === "scrub" ? { "data-scrub-words": "" } : {};
  return (
    <Tag className={className} id={id} {...attr}>
      {words.map((w, i) =>
        mode === "scrub" ? (
          <span key={i} className="sw inline-block">
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        ) : (
          <span key={i}>
            <span className="w">
              <span>{w}</span>
            </span>
            {i < words.length - 1 ? " " : ""}
          </span>
        ),
      )}
    </Tag>
  );
}
