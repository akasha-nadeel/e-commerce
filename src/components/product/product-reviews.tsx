"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { submitReview } from "@/lib/actions/review";
import { resizeImage } from "@/lib/image-resize";

/**
 * Per-product "Ratings & Reviews" — real reviews from Shopify (metaobjects),
 * shown as a left-aligned Daraz/AliExpress-style list. The write-a-review form
 * submits via a server action; reviews appear once approved in Shopify admin.
 */

interface ReviewItem {
  id: string;
  rating: number;
  author: string;
  title: string;
  body: string;
  createdAt: string;
  photos: string[];
}

const MAX_PHOTOS = 4;

interface Summary {
  count: number;
  average: number;
  breakdown: number[]; // 5★ … 1★ (percent)
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <StarIcon size={size} color="#d7d6d9" />
            {fill > 0 && (
              <span className="absolute left-0 top-0 overflow-hidden" style={{ width: `${fill * 100}%`, height: size }}>
                <StarIcon size={size} color="#eec449" />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

export function ProductReviews({
  productHandle,
  productTitle,
  reviews,
  summary,
}: {
  productHandle: string;
  productTitle: string;
  reviews: ReviewItem[];
  summary: Summary;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [stars, setStars] = useState(0);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [lightbox, setLightbox] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  // Local object URLs for previewing selected photos before upload.
  const previews = useMemo(
    () => photos.map((f) => URL.createObjectURL(f)),
    [photos],
  );
  useEffect(
    () => () => previews.forEach((u) => URL.revokeObjectURL(u)),
    [previews],
  );

  const hasReviews = summary.count > 0;
  const valid = name.trim() !== "" && text.trim() !== "" && stars > 0;

  // Per-star counts for the breakdown (index 0 = 5★ … 4 = 1★).
  const counts = useMemo(() => {
    const c = [0, 0, 0, 0, 0];
    for (const r of reviews) c[5 - r.rating] += 1;
    return c;
  }, [reviews]);

  function openForm() {
    setOpen(true);
    setDone(false);
    setError("");
    requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
    );
  }

  function addPhotos(list: FileList | null) {
    if (!list) return;
    const picked = Array.from(list).filter((f) => f.type.startsWith("image/"));
    setPhotos((prev) => [...prev, ...picked].slice(0, MAX_PHOTOS));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    setError("");

    const fd = new FormData();
    fd.set("productHandle", productHandle);
    fd.set("productTitle", productTitle);
    fd.set("rating", String(stars));
    fd.set("author", name.trim());
    fd.set("title", title.trim());
    fd.set("body", text.trim());
    for (const file of photos) {
      try {
        const blob = await resizeImage(file);
        fd.append("photos", blob, file.name.replace(/\.\w+$/, "") + ".jpg");
      } catch {
        fd.append("photos", file, file.name);
      }
    }

    const res = await submitReview(fd);
    setBusy(false);
    if (res.ok) {
      setName("");
      setStars(0);
      setTitle("");
      setText("");
      setPhotos([]);
      setOpen(false);
      setDone(true);
    } else {
      setError(res.error ?? "Something went wrong.");
    }
  }

  return (
    <section className="border-t border-[#e7e6e9] bg-white">
      <div className="mx-auto max-w-[1000px] px-5 py-14 sm:px-8">
        <h2 className="text-[clamp(22px,3vw,30px)] font-semibold tracking-[-0.01em]">
          Ratings &amp; Reviews
        </h2>

        {/* Summary */}
        <div className="mt-8 grid grid-cols-1 gap-8 border-b border-[#e7e6e9] pb-10 sm:grid-cols-[auto_1fr] sm:gap-12">
          <div className="flex flex-col items-start">
            <div className="flex items-end gap-1">
              <span className="text-[52px] font-bold leading-none tracking-[-0.02em]">
                {hasReviews ? summary.average.toFixed(1) : "0.0"}
              </span>
              <span className="mb-1 text-[18px] text-[#9a9a9e]">/5</span>
            </div>
            <div className="mt-3">
              <Stars value={summary.average} size={22} />
            </div>
            <div className="mt-2 text-[13px] text-[#8a8a8e]">
              {summary.count} {summary.count === 1 ? "Rating" : "Ratings"}
            </div>
          </div>

          <div className="flex flex-col justify-center gap-2">
            {summary.breakdown.map((pct, idx) => {
              const star = 5 - idx;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="flex w-7 items-center gap-0.5 text-[13px] text-[#6a6a6e]">
                    {star}
                    <StarIcon size={12} color="#eec449" />
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#eeedef]">
                    <div
                      className="h-full rounded-full bg-[#eec449] transition-[width] duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-[13px] text-[#8a8a8e]">
                    {counts[idx]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Write a review row */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-6">
          <div>
            <h3 className="text-[17px] font-semibold">Write your Experience</h3>
            <p className="mt-1 max-w-[520px] text-[14px] leading-[1.6] text-[#8a8a8e]">
              Share your feedback on the {productTitle} and help other shoppers.
            </p>
            {done && (
              <p className="mt-2 text-[14px] font-medium text-[#0c0c0d]">
                Thanks! Your review was submitted and will appear once approved.
              </p>
            )}
          </div>
          <Button onClick={openForm}>Write a Review</Button>
        </div>

        {/* Write-a-review form */}
        {open && (
          <form ref={formRef} onSubmit={submit} className="mb-8 border border-[#e7e6e9] p-6 sm:p-8">
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
                  <StarIcon size={26} color={i < stars ? "#eec449" : "#d7d6d9"} />
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
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Review title (optional)"
              aria-label="Review title"
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

            {/* Photos */}
            <div className="mt-4">
              <div className="flex flex-wrap gap-3">
                {previews.map((src, i) => (
                  <div
                    key={src}
                    className="relative h-[72px] w-[72px] overflow-hidden border border-[#e2e1e4]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      aria-label="Remove photo"
                      onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <line x1="6" y1="6" x2="18" y2="18" />
                        <line x1="18" y1="6" x2="6" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <label className="flex h-[72px] w-[72px] cursor-pointer flex-col items-center justify-center gap-1 border border-dashed border-[#c7c6ca] text-[#8a8a8e] transition-colors hover:border-[#0c0c0d] hover:text-[#0c0c0d]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <circle cx="9" cy="10" r="1.5" />
                      <path d="M21 16l-5-5-9 8" />
                    </svg>
                    <span className="text-[10px]">Add</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => addPhotos(e.target.files)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="mt-2 text-[12px] text-[#a3a3a8]">
                Add up to {MAX_PHOTOS} photos (optional).
              </p>
            </div>

            {error && <p className="mt-3 text-[13px] text-[#d23b3b]">{error}</p>}

            <div className="mt-4 flex items-center gap-3">
              <Button type="submit" disabled={!valid || busy}>
                {busy ? "Submitting…" : "Post Review"}
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

        {/* Review list */}
        {hasReviews ? (
          <>
            <h3 className="border-b border-[#e7e6e9] pb-4 text-[16px] font-semibold">
              Product Reviews
            </h3>
            <div className="divide-y divide-[#f0eff1]">
              {reviews.map((r) => (
                <article key={r.id} className="py-6">
                  <div className="flex items-start justify-between gap-4">
                    <Stars value={r.rating} size={16} />
                    {r.createdAt && (
                      <span className="shrink-0 text-[13px] text-[#a3a3a8]">
                        {formatDate(r.createdAt)}
                      </span>
                    )}
                  </div>
                  {r.title && (
                    <div className="mt-2.5 text-[15px] font-semibold text-[#0c0c0d]">
                      {r.title}
                    </div>
                  )}
                  <p className="mt-1.5 text-[14px] leading-[1.7] text-[#4a4a4e]">
                    {r.body}
                  </p>
                  {r.photos.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {r.photos.map((src) => (
                        <button
                          key={src}
                          type="button"
                          onClick={() => setLightbox(src)}
                          className="relative h-[84px] w-[84px] cursor-pointer overflow-hidden border border-[#e7e6e9]"
                          aria-label="View review photo"
                        >
                          <Image
                            src={src}
                            alt={`Photo from ${r.author}'s review`}
                            fill
                            sizes="84px"
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 text-[13px] text-[#8a8a8e]">
                    by <span className="font-medium text-[#0c0c0d]">{r.author}</span>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="border-t border-[#e7e6e9] py-10 text-center">
            <p className="m-0 text-[15px] text-[#8a8a8e]">
              No reviews yet — be the first to review the {productTitle}.
            </p>
          </div>
        )}
      </div>

      {/* Photo lightbox */}
      {lightbox && (
        <div
          role="dialog"
          aria-label="Review photo"
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-6"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setLightbox(null)}
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
          <div className="relative h-[86vh] w-full max-w-[760px]" onClick={(e) => e.stopPropagation()}>
            <Image src={lightbox} alt="Review photo" fill className="object-contain" sizes="760px" />
          </div>
        </div>
      )}
    </section>
  );
}
