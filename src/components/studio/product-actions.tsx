"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { archiveProduct, deleteProduct } from "@/lib/actions/studio";
import { Notice, StudioButton, TextButton } from "./ui";

/**
 * The two ways to take a product off the store, with guards sized to their
 * consequences.
 *
 *  - **Hide** (Shopify ARCHIVED) — reversible. One inline confirm.
 *  - **Delete** (Shopify productDelete) — permanent. Requires typing DELETE.
 *
 * Hiding is offered first and framed as the normal choice, because it is: it
 * removes the product from the site while keeping it restorable and keeping past
 * orders linked. Delete exists because the owner asked for a way to clear out
 * test products and mistakes.
 *
 * Confirmation is inline rather than a native `confirm()` — a browser modal
 * blocks the page and would freeze the whole Studio.
 */

type Mode = "idle" | "hiding" | "deleting";

export function ProductActions({
  productId,
  productName,
  productHandle,
}: {
  productId: string;
  productName: string;
  productHandle: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<Mode>("idle");
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setMode("idle");
    setTyped("");
    setError(null);
  };

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) {
        setError(res.error ?? "That didn't work. Try again.");
        return;
      }
      router.push("/studio");
      router.refresh();
    });
  }

  if (mode === "idle") {
    return (
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <TextButton onClick={() => setMode("hiding")}>
          Hide from the website
        </TextButton>
        <TextButton tone="danger" onClick={() => setMode("deleting")}>
          Delete permanently
        </TextButton>
      </div>
    );
  }

  if (mode === "hiding") {
    return (
      <div className="rounded-xl border border-[#e7e6e9] bg-[#f7f7f8] p-5">
        <p className="m-0 text-[15px] font-semibold">
          Hide &ldquo;{productName}&rdquo; from the website?
        </p>
        <p className="mt-1.5 text-[13px] leading-[1.65] text-[#6a6a6e]">
          Customers won&apos;t see it any more, but nothing is lost — past orders
          keep it, and you can bring it back from Shopify whenever you like.
        </p>
        {error && (
          <p className="mt-2.5 text-[13px] font-medium text-[#d23b3b]">{error}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2.5">
          <StudioButton
            onClick={() => run(() => archiveProduct(productId, productHandle))}
            loading={pending}
          >
            {pending ? "Hiding" : "Yes, hide it"}
          </StudioButton>
          <StudioButton variant="outline" onClick={reset} disabled={pending}>
            Cancel
          </StudioButton>
        </div>
      </div>
    );
  }

  const canDelete = typed.trim().toUpperCase() === "DELETE";

  return (
    <div className="rounded-xl border border-[#d23b3b]/35 bg-[#d23b3b]/[0.06] p-5">
      <p className="m-0 text-[15px] font-semibold text-[#a82c2c]">
        Permanently delete &ldquo;{productName}&rdquo;?
      </p>
      <p className="mt-1.5 text-[13px] leading-[1.65] text-[#7d2626]">
        This can&apos;t be undone. The product, its sizes, colours and photo links
        are removed from Shopify for good. Past orders will still list what was
        bought, but won&apos;t link to the product any more.
      </p>
      <p className="mt-2 text-[13px] leading-[1.65] text-[#7d2626]">
        If you only want it off the website,{" "}
        <button
          type="button"
          onClick={() => {
            setMode("hiding");
            setTyped("");
          }}
          className="cursor-pointer font-semibold underline underline-offset-2"
        >
          hide it instead
        </button>
        .
      </p>

      <label className="mt-4 block">
        <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#a82c2c]">
          Type DELETE to confirm
        </span>
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          placeholder="DELETE"
          className="mt-1.5 w-full max-w-[220px] rounded-xl border border-[#d23b3b]/30 bg-white px-3.5 py-2.5 text-[15px] tracking-wide outline-none transition-colors placeholder:text-[#c9a3a3] focus:border-[#d23b3b]"
        />
      </label>

      {error && (
        <div className="mt-3">
          <Notice tone="danger">{error}</Notice>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2.5">
        <StudioButton
          variant="danger"
          onClick={() => run(() => deleteProduct(productId, productHandle))}
          disabled={!canDelete}
          loading={pending}
        >
          {pending ? "Deleting" : "Delete for ever"}
        </StudioButton>
        <StudioButton variant="outline" onClick={reset} disabled={pending}>
          Cancel
        </StudioButton>
      </div>
    </div>
  );
}
