"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Review = { name: string; rating: number; date: string; text: string };

/**
 * "Latest Reviews" block for the PDP — average score, a rating breakdown, a
 * working write-a-review form (optimistic, client-side) and a swipeable review
 * carousel with paging dots. Until Shopify product reviews are wired in, the
 * seed reviews stand in as realistic social proof.
 */
const SEED_REVIEWS: Review[] = [
  {
    name: "Dilani Perera",
    rating: 5,
    date: "2 weeks ago",
    text: "Premium quality and the fit is exactly as described. Heavyweight fabric that holds its shape wash after wash — easily my new everyday piece.",
  },
  {
    name: "Kasun Fernando",
    rating: 5,
    date: "1 month ago",
    text: "Impressed by the build quality. Clean stitching, the drop-shoulder cut is spot on, and delivery was quick island-wide. Will order again.",
  },
  {
    name: "Aisha Rahman",
    rating: 4,
    date: "3 weeks ago",
    text: "Great everyday tee — soft, breathable and true to size. Took off one star only because I wanted a slightly longer length. Still love it.",
  },
  {
    name: "Ruwan Jayasuriya",
    rating: 5,
    date: "5 days ago",
    text: "Exactly what I was looking for. The colour is rich and the material feels durable. Worth every rupee and then some.",
  },
  {
    name: "Nethmi Silva",
    rating: 4,
    date: "2 months ago",
    text: "Comfortable and stylish, pairs with everything. The size guide was accurate which made ordering online painless.",
  },
  {
    name: "Tariq Hassan",
    rating: 5,
    date: "1 week ago",
    text: "Top tier. Heavyweight cotton that doesn't go see-through, and the finish looks far more expensive than the price.",
  },
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function rotate<T>(arr: T[], n: number): T[] {
  if (arr.length === 0) return arr;
  const k = ((n % arr.length) + arr.length) % arr.length;
  return [...arr.slice(k), ...arr.slice(0, k)];
}

/** Top-heavy 5★→1★ breakdown (percent), nudged by the average so it reads consistent. */
function breakdown(rating: number): number[] {
  const p5 = Math.round((rating / 5) ** 3 * 100);
  const rem = 100 - p5;
  const p4 = Math.round(rem * 0.55);
  const p3 = Math.round(rem * 0.25);
  const p2 = Math.round(rem * 0.12);
  const p1 = Math.max(0, 100 - p5 - p4 - p3 - p2);
  return [p5, p4, p3, p2, p1];
}

function formatCount(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
}

function StarIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: "block" }}>
      <path d="M12 2l3 6.5 7 .8-5.2 4.7L18.4 21 12 17.3 5.6 21 7.2 14 2 9.3l7-.8z" />
    </svg>
  );
}

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={`${value} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <StarIcon size={size} color="#d7d6d9" />
            {fill > 0 && (
              <span
                className="absolute left-0 top-0 overflow-hidden"
                style={{ width: `${fill * 100}%`, height: size }}
              >
                <StarIcon size={size} color="#c79a4b" />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

export function ProductReviews({
  rating,
  reviewCount,
  seed = "",
}: {
  rating: number;
  reviewCount: number;
  seed?: string;
}) {
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [stars, setStars] = useState(0);
  const [text, setText] = useState("");
  const [activeDot, setActiveDot] = useState(0);

  const rowRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const base = useMemo(() => rotate(SEED_REVIEWS, hashStr(seed)), [seed]);
  const reviews = useMemo(() => [...userReviews, ...base], [userReviews, base]);

  const bars = breakdown(rating);
  const total = reviewCount + userReviews.length;
  const valid = name.trim() !== "" && text.trim() !== "" && stars > 0;

  function openForm() {
    setOpen(true);
    requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setUserReviews((prev) => [
      { name: name.trim(), rating: stars, date: "Just now", text: text.trim() },
      ...prev,
    ]);
    setName("");
    setStars(0);
    setText("");
    setOpen(false);
    requestAnimationFrame(() => rowRef.current?.scrollTo({ left: 0, behavior: "smooth" }));
  }

  function cardStep(): number {
    const el = rowRef.current;
    const card = el?.firstElementChild as HTMLElement | null;
    return card ? card.offsetWidth + 18 : el?.clientWidth ?? 1;
  }

  function onRowScroll() {
    const el = rowRef.current;
    if (el) setActiveDot(Math.round(el.scrollLeft / cardStep()));
  }

  function goTo(i: number) {
    rowRef.current?.scrollTo({ left: i * cardStep(), behavior: "smooth" });
  }

  return (
    <section className="border-t border-[#e7e6e9] bg-white">
      <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8">
        <h2 className="text-center text-[clamp(26px,4vw,40px)] font-semibold tracking-[-0.01em]">
          Latest Reviews
        </h2>

        {/* Summary card */}
        <div className="mx-auto mt-10 grid max-w-[1100px] grid-cols-1 gap-10 border border-[#e7e6e9] p-6 sm:p-9 lg:grid-cols-2 lg:gap-16">
          {/* Score + breakdown */}
          <div>
            <div className="flex items-center gap-4">
              <div className="text-[44px] font-bold leading-none tracking-[-0.02em]">
                {rating.toFixed(1)}
              </div>
              <div>
                <Stars value={rating} size={18} />
                <div className="mt-1.5 text-[13px] text-[#8a8a8e]">
                  {formatCount(total)} Reviews
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              {bars.map((pct, idx) => {
                const star = 5 - idx;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="w-3 text-[13px] text-[#6a6a6e]">{star}</span>
                    <div className="h-2 flex-1 overflow-hidden bg-[#eeedef]">
                      <div
                        className="h-full bg-[#0c0c0d] transition-[width] duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-9 text-right text-[12px] text-[#8a8a8e]">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Write your experience */}
          <div className="flex flex-col items-start justify-center lg:border-l lg:border-[#e7e6e9] lg:pl-16">
            <h3 className="text-[22px] font-semibold tracking-[-0.01em]">
              Write your Experience
            </h3>
            <p className="mt-3 max-w-[440px] text-[14px] leading-[1.7] text-[#8a8a8e]">
              Share your feedback and help shape an exceptional shopping journey.
              Together, let&apos;s build a community where every voice is heard and
              every experience counts.
            </p>
            <Button onClick={openForm} className="mt-6">
              Submit Reviews
            </Button>
          </div>
        </div>

        {/* Write-a-review form */}
        {open && (
          <form
            ref={formRef}
            onSubmit={submit}
            className="mx-auto mt-6 max-w-[1100px] border border-[#e7e6e9] p-6 sm:p-8"
          >
            <h3 className="text-[18px] font-semibold">Write a Review</h3>

            <div className="mt-4 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Rate ${i + 1} star${i ? "s" : ""}`}
                  aria-pressed={stars === i + 1}
                  onClick={() => setStars(i + 1)}
                  className="cursor-pointer p-0.5"
                >
                  <StarIcon size={26} color={i < stars ? "#c79a4b" : "#d7d6d9"} />
                </button>
              ))}
            </div>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              aria-label="Your name"
              className="mt-4 w-full max-w-[360px] border border-[#d7d6d9] px-4 py-3 text-[15px] outline-none transition-colors focus:border-[#0c0c0d]"
            />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share the details of your experience with this product…"
              aria-label="Your review"
              rows={4}
              className="mt-4 w-full resize-none border border-[#d7d6d9] px-4 py-3 text-[15px] outline-none transition-colors focus:border-[#0c0c0d]"
            />

            <div className="mt-4 flex items-center gap-3">
              <Button type="submit" disabled={!valid}>
                Post Review
              </Button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="cursor-pointer px-4 py-2 text-[13px] font-semibold text-[#6a6a6e] transition-colors hover:text-[#0c0c0d]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Review carousel */}
        <div
          ref={rowRef}
          onScroll={onRowScroll}
          className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-[18px] overflow-x-auto pb-2"
        >
          {reviews.map((r, i) => (
            <article
              key={`${r.name}-${i}`}
              className="flex w-[86%] shrink-0 snap-start flex-col items-center border border-[#e7e6e9] p-6 text-center sm:w-[calc(50%-9px)] lg:w-[calc(33.333%-12px)]"
            >
              <Stars value={r.rating} size={16} />
              <p className="mt-4 flex-1 text-[14px] leading-[1.7] text-[#6a6a6e]">
                &ldquo;{r.text}&rdquo;
              </p>
              <div className="mt-4 text-[14px] font-semibold text-[#0c0c0d]">{r.name}</div>
              <div className="mt-0.5 text-[12px] text-[#a3a3a8]">{r.date}</div>
            </article>
          ))}
        </div>

        {/* Paging dots */}
        {reviews.length > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {reviews.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to review ${i + 1}`}
                aria-current={activeDot === i}
                onClick={() => goTo(i)}
                className={`h-2 cursor-pointer transition-all ${
                  activeDot === i ? "w-6 bg-[#0c0c0d]" : "w-2 bg-[#d7d6d9] hover:bg-[#8a8a8e]"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
