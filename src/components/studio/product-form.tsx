"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { saveProduct, uploadStudioPhoto } from "@/lib/actions/studio";
import { resizeProductPhoto } from "@/lib/image-resize";
import {
  COLOR_BY_NAME,
  ONE_SIZE,
  STUDIO_AUDIENCES,
  STUDIO_BADGES,
  STUDIO_COLORS,
  STUDIO_SIZES,
  STUDIO_TYPES,
  TYPE_BY_LABEL,
  type StudioAudience,
} from "@/lib/studio/options";
import type { StudioPhotoInput, StudioProductInput } from "@/lib/studio/types";
import { ProductActions } from "./product-actions";
import { ProductPreview } from "./product-preview";
import {
  CheckIcon,
  Chip,
  ColorChip,
  Field,
  MoneyInput,
  Notice,
  PageHeading,
  QtyInput,
  Segmented,
  Spinner,
  Step,
  StudioButton,
  Switch,
  TextArea,
  TextInput,
} from "./ui";

/**
 * The add / edit product form.
 *
 * Structure follows the order the decisions actually depend on each other, which
 * is *not* the order Shopify's form uses and not the order this form used at
 * first: colours have to be chosen before photos, because each photo is tagged
 * with the colour it shows. Getting that backwards left the tagging control
 * empty on every new product.
 *
 * Desktop puts a sticky live preview alongside — the same two-column
 * `[1.25fr_0.95fr]` split the checkout uses. Seeing the product card build up as
 * you type is what makes this usable by someone who doesn't know what a variant
 * is.
 *
 * Photos upload the moment they're chosen rather than on submit, so saving is
 * quick and a slow connection shows progress per photo instead of one long stall.
 */

const MAX_PHOTOS = 12;

interface DraftPhoto {
  key: string;
  previewUrl: string;
  /** Staged upload URL, for a newly added photo. */
  source?: string;
  /** Existing Shopify media GID, for a photo already on the product. */
  mediaId?: string;
  color?: string;
  status: "uploading" | "ready" | "error";
  error?: string;
}

export interface ProductFormInitial {
  id: string;
  handle: string;
  name: string;
  typeLabel: string;
  audience: StudioAudience;
  priceLKR: number;
  compareAtLKR?: number;
  colors: string[];
  sizes: string[];
  stock: Record<string, number>;
  backorder: boolean;
  visible?: boolean;
  description?: string;
  badge?: string;
  fit?: string;
  fabrication?: string;
  photos: { mediaId: string; url: string; color?: string }[];
}

export function ProductForm({
  initial,
  canSaveStock = true,
}: {
  initial?: ProductFormInitial;
  /** False when the Admin app lacks the inventory scopes — warn before saving. */
  canSaveStock?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [typeLabel, setTypeLabel] = useState(initial?.typeLabel ?? "T-Shirt");
  const [audience, setAudience] = useState<StudioAudience>(
    initial?.audience ?? "Men",
  );
  const [price, setPrice] = useState(
    initial?.priceLKR ? String(initial.priceLKR) : "",
  );
  const [wasPrice, setWasPrice] = useState(
    initial?.compareAtLKR ? String(initial.compareAtLKR) : "",
  );
  const [colors, setColors] = useState<string[]>(initial?.colors ?? []);
  const [sizes, setSizes] = useState<string[]>(initial?.sizes ?? []);
  const [stock, setStock] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      Object.entries(initial?.stock ?? {}).map(([k, v]) => [k, String(v)]),
    ),
  );
  const [backorder, setBackorder] = useState(initial?.backorder ?? false);
  const [visible, setVisible] = useState(initial?.visible ?? true);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [badge, setBadge] = useState(initial?.badge ?? "");
  const [fit, setFit] = useState(initial?.fit ?? "");
  const [fabrication, setFabrication] = useState(initial?.fabrication ?? "");
  const [showExtras, setShowExtras] = useState(false);

  const [photos, setPhotos] = useState<DraftPhoto[]>(
    () =>
      initial?.photos.map((p, i) => ({
        key: `existing-${i}-${p.mediaId}`,
        previewUrl: p.url,
        mediaId: p.mediaId,
        color: p.color,
        status: "ready" as const,
      })) ?? [],
  );

  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [saved, setSaved] = useState<{ handle: string; visible: boolean } | null>(
    null,
  );

  const type = TYPE_BY_LABEL.get(typeLabel);
  const isAccessory = Boolean(type?.accessory);

  /* --- photos ----------------------------------------------------- */

  const addFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      const room = MAX_PHOTOS - photos.length;
      const picked = Array.from(files)
        .filter((f) => f.type.startsWith("image/"))
        .slice(0, Math.max(0, room));

      for (const file of picked) {
        const key = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const previewUrl = URL.createObjectURL(file);
        setPhotos((prev) => [
          ...prev,
          { key, previewUrl, status: "uploading" as const },
        ]);

        try {
          const blob = await resizeProductPhoto(file);
          const fd = new FormData();
          fd.append("photo", new File([blob], file.name, { type: "image/jpeg" }));
          const res = await uploadStudioPhoto(fd);
          setPhotos((prev) =>
            prev.map((p) =>
              p.key === key
                ? res.ok
                  ? { ...p, source: res.source, status: "ready" as const }
                  : {
                      ...p,
                      status: "error" as const,
                      error: res.error ?? "Upload failed",
                    }
                : p,
            ),
          );
        } catch {
          setPhotos((prev) =>
            prev.map((p) =>
              p.key === key
                ? {
                    ...p,
                    status: "error" as const,
                    error: "Couldn't read that image",
                  }
                : p,
            ),
          );
        }
      }
    },
    [photos.length],
  );

  const removePhoto = (key: string) =>
    setPhotos((prev) => prev.filter((p) => p.key !== key));

  /** Tap the colour a photo shows; tapping it again clears the tag. */
  const tagPhoto = (key: string, color?: string) =>
    setPhotos((prev) =>
      prev.map((p) =>
        p.key === key ? { ...p, color: p.color === color ? undefined : color } : p,
      ),
    );

  /**
   * Promote a photo to the main shot.
   *
   * The main photo is simply the first in the list. This is the only ordering
   * control in the form — per-photo nudge arrows were removed as clutter, since
   * choosing the hero is the decision that actually matters and the rest keep
   * their upload order. Lifts and inserts rather than swapping, so the sequence
   * after the promoted photo stays intact.
   */
  const makeMain = (key: string) =>
    setPhotos((prev) => {
      const i = prev.findIndex((p) => p.key === key);
      if (i <= 0) return prev;
      const next = [...prev];
      const [pick] = next.splice(i, 1);
      return [pick, ...next];
    });

  /** Move a colour to the front, so the card's colourway label matches the main photo. */
  const makeFirstColor = (color: string) =>
    setColors((prev) => [color, ...prev.filter((c) => c !== color)]);

  const uploading = photos.some((p) => p.status === "uploading");
  const readyPhotos = photos.filter((p) => p.status === "ready");

  /** Colours that still have no photo — drives the swatch→gallery behaviour. */
  const untaggedColors = useMemo(
    () => colors.filter((c) => !readyPhotos.some((p) => p.color === c)),
    [colors, readyPhotos],
  );

  /** Colour tagged on the main (first) photo, if any. */
  const mainPhotoColor = readyPhotos[0]?.color;

  /* --- derived ---------------------------------------------------- */

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const orderedSizes = useMemo(
    () => STUDIO_SIZES.filter((s) => sizes.includes(s)),
    [sizes],
  );

  const checklist = useMemo(
    () => [
      { label: "Name it", done: Boolean(name.trim()) },
      { label: "Set a price", done: Number(price) > 0 },
      { label: "Pick colours", done: colors.length > 0 },
      {
        label: isAccessory ? "Accessory — no sizes needed" : "Pick sizes",
        done: isAccessory || sizes.length > 0,
      },
      { label: "Add photos", done: readyPhotos.length > 0 },
      {
        label: "A photo for each colour",
        done: colors.length > 0 && untaggedColors.length === 0,
      },
    ],
    [name, price, colors, sizes, readyPhotos.length, untaggedColors, isAccessory],
  );

  const blockers = checklist.filter((c) => !c.done);

  const previewColors = colors.map((c) => ({
    name: c,
    hex: COLOR_BY_NAME.get(c)?.hex ?? "#8a8a8e",
    image: readyPhotos.find((p) => p.color === c)?.previewUrl,
  }));

  /* --- submit ----------------------------------------------------- */

  function resetForNext() {
    setName("");
    setPrice("");
    setWasPrice("");
    setColors([]);
    setSizes([]);
    setStock({});
    setPhotos([]);
    setDescription("");
    setBadge("");
    setFit("");
    setFabrication("");
    setVisible(true);
    setBackorder(false);
    setWarnings([]);
    setError(null);
    setSaved(null);
    window.scrollTo({ top: 0 });
  }

  function handleSave() {
    setError(null);
    setWarnings([]);

    const payloadPhotos: StudioPhotoInput[] = readyPhotos.map((p) => ({
      ...(p.mediaId ? { mediaId: p.mediaId } : { source: p.source }),
      color: p.color,
    }));

    const sizeList = isAccessory ? [] : orderedSizes;
    const stockNumbers: Record<string, number> = {};
    for (const key of sizeList.length ? sizeList : [ONE_SIZE]) {
      stockNumbers[key] = Math.max(0, Math.floor(Number(stock[key] ?? 0)));
    }

    const payload: StudioProductInput = {
      ...(initial?.id ? { id: initial.id } : {}),
      name: name.trim(),
      typeLabel,
      audience,
      priceLKR: Math.round(Number(price)),
      compareAtLKR: wasPrice ? Math.round(Number(wasPrice)) : undefined,
      colors,
      sizes: sizeList,
      stock: stockNumbers,
      backorder,
      visible,
      description: description.trim() || undefined,
      badge: badge || undefined,
      fit: fit.trim() || undefined,
      fabrication: fabrication.trim() || undefined,
      photos: payloadPhotos,
    };

    startTransition(async () => {
      const res = await saveProduct(payload);
      if (!res.ok) {
        setError(res.error ?? "Something went wrong.");
        setWarnings(res.warnings);
        return;
      }
      setWarnings(res.warnings);
      setSaved({ handle: res.handle ?? "", visible });
      router.refresh();
      window.scrollTo({ top: 0 });
    });
  }

  /* --- saved ------------------------------------------------------ */

  if (saved) {
    return (
      <div className="mx-auto max-w-[560px] px-5 py-20 text-center sm:px-8">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#eec449]">
          <span className="text-[#0c0c0d]">
            <CheckIcon size={28} />
          </span>
        </div>
        <h1 className="display-tight m-0 text-[clamp(26px,4vw,40px)] font-semibold leading-tight">
          {initial
            ? "Changes saved"
            : saved.visible
              ? `${name} is live`
              : "Draft saved"}
        </h1>
        <p className="mx-auto mt-3 max-w-[440px] text-[15px] leading-relaxed text-[#8a8a8e]">
          {saved.visible
            ? `It's on the website and in Shopify — published to every sales channel, with ${colors.length === 1 ? "its colour" : `all ${colors.length} colours`} and photos linked up.`
            : "Saved in Shopify but hidden — nobody can see it. Open it from Products and switch it to Publish when you're ready."}
        </p>

        {warnings.length > 0 && (
          <div className="mt-7 text-left">
            <Notice title="Worth knowing">
              <ul className="flex flex-col gap-2">
                {warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </Notice>
          </div>
        )}

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          {saved.visible && (
            <a
              href={`/products/${saved.handle}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-none bg-[#0c0c0d] px-7 py-3.5 text-[13px] font-semibold text-white no-underline transition-colors hover:bg-[#eec449] hover:text-[#0c0c0d]"
            >
              View on the website
            </a>
          )}
          <StudioButton
            variant={saved.visible ? "outline" : "solid"}
            onClick={() => router.push("/studio")}
          >
            Back to products
          </StudioButton>
          {!initial && (
            <button
              type="button"
              onClick={resetForNext}
              className="cursor-pointer px-2 py-3.5 text-[13px] font-semibold text-[#8a8a8e] underline underline-offset-4 transition-colors hover:text-[#0c0c0d]"
            >
              Add another
            </button>
          )}
        </div>
      </div>
    );
  }

  /* --- form ------------------------------------------------------- */

  return (
    // pb-36 clears the fixed action bar (~68px) plus the iPhone home indicator,
    // so the last photo is fully scrollable into view rather than trapped
    // behind the bar. Keep these two in step if the bar's padding changes.
    <div className="mx-auto max-w-[1100px] px-4 pb-36 pt-8 sm:px-8 sm:pt-10">
      <PageHeading
        title={initial ? "Edit product" : "Add a product"}
        subtitle={
          initial
            ? "Change anything and the website updates within a minute."
            : "Six quick steps. Everything else is handled for you."
        }
      />

      <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-[1.25fr_0.95fr] lg:gap-x-14 lg:gap-y-12">
        {/* ---------------- steps ---------------- */}
        <div>
          <Step n={1} title="Name" done={Boolean(name.trim())}>
            <TextInput
              value={name}
              onChange={setName}
              placeholder="Heavyweight Box Tee"
              large
              autoFocus={!initial}
            />
          </Step>

          <Step n={2} title="What is it?" done>
            <div className="flex flex-wrap gap-2.5">
              {STUDIO_TYPES.map((t) => (
                <Chip
                  key={t.label}
                  on={typeLabel === t.label}
                  onClick={() => setTypeLabel(t.label)}
                >
                  {t.label}
                </Chip>
              ))}
            </div>

            {!isAccessory && (
              <div className="mt-6">
                <p className="mb-2.5 text-[13px] font-semibold text-[#0c0c0d]">
                  Shop section
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {STUDIO_AUDIENCES.map((a) => (
                    <Chip
                      key={a}
                      on={audience === a}
                      onClick={() => setAudience(a)}
                    >
                      {a}
                    </Chip>
                  ))}
                </div>
                {audience === "Unisex" && (
                  <p className="mt-2.5 text-[13px] text-[#8a8a8e]">
                    Shows under both Men and Women on the website.
                  </p>
                )}
              </div>
            )}
          </Step>

          <Step n={3} title="Price" done={Number(price) > 0}>
            <div className="flex flex-wrap gap-4">
              <div className="min-w-[136px] flex-1">
                <Field label="Price" required>
                  <MoneyInput value={price} onChange={setPrice} placeholder="4500" />
                </Field>
              </div>
              <div className="min-w-[136px] flex-1">
                <Field label="Was" hint="Only if it's on sale.">
                  <MoneyInput
                    value={wasPrice}
                    onChange={setWasPrice}
                    placeholder="—"
                  />
                </Field>
              </div>
            </div>
            {Boolean(wasPrice) && Number(wasPrice) <= Number(price) && (
              <p className="mt-2 text-[12px] text-[#d23b3b]">
                &ldquo;Was&rdquo; needs to be higher than the price, or no sale
                badge shows.
              </p>
            )}
          </Step>

          <Step n={4} title="Colours" hint="Tap every colour this comes in." done={colors.length > 0}>
            <div className="flex flex-wrap gap-2.5">
              {STUDIO_COLORS.map((c) => (
                <ColorChip
                  key={c.name}
                  name={c.name}
                  hex={c.hex}
                  on={colors.includes(c.name)}
                  onClick={() => setColors((prev) => toggle(prev, c.name))}
                />
              ))}
            </div>
          </Step>

          <Step
            n={5}
            title="Photos"
            hint="First one is the main photo. Tag each with the colour it shows."
            done={readyPhotos.length > 0 && untaggedColors.length === 0}
          >
            {colors.length === 0 && (
              <div className="mb-4">
                <Notice>
                  Pick your colours above first — then you can tag each photo, which
                  is what makes tapping a colour on the website change the picture.
                </Notice>
              </div>
            )}

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void addFiles(e.dataTransfer.files);
              }}
              className="rounded-xl border-2 border-dashed border-[#d7d6d9] bg-[#f7f7f8] p-6 text-center transition-colors hover:border-[#8a8a8e]"
            >
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  void addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <StudioButton
                onClick={() => fileInput.current?.click()}
                disabled={photos.length >= MAX_PHOTOS}
              >
                Choose photos
              </StudioButton>
              <p className="mt-3 text-[13px] text-[#8a8a8e]">
                or drag them here · {photos.length} of {MAX_PHOTOS}
              </p>
            </div>

            {photos.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                {photos.map((p, i) => (
                  <figure
                    key={p.key}
                    className="overflow-hidden rounded-xl border border-[#e7e6e9]"
                  >
                    <div className="relative aspect-[3/4] bg-[#f5f5f6]">
                      <Image
                        src={p.previewUrl}
                        alt=""
                        fill
                        quality={100}
                        unoptimized={p.previewUrl.startsWith("blob:")}
                        sizes="(max-width: 640px) 45vw, 200px"
                        className="object-cover"
                      />
                      {i === 0 && (
                        <span className="absolute left-0 top-0 bg-[#eec449] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#0c0c0d]">
                          Main
                        </span>
                      )}
                      {p.status === "uploading" && (
                        <div className="absolute inset-0 grid place-items-center gap-2 bg-white/75">
                          <span className="flex items-center gap-2 text-[12px] font-semibold">
                            <Spinner /> Uploading
                          </span>
                        </div>
                      )}
                      {p.status === "error" && (
                        <div className="absolute inset-0 grid place-items-center bg-[#d23b3b]/90 px-3 text-center text-[12px] font-semibold text-white">
                          {p.error}
                        </div>
                      )}
                    </div>

                    <figcaption className="p-2">
                      {/* Colour tagging — dots, not a dropdown: faster on touch
                          and it shows at a glance which colour a shot belongs to. */}
                      {colors.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {colors.map((c) => {
                            const on = p.color === c;
                            const hex = COLOR_BY_NAME.get(c)?.hex ?? "#8a8a8e";
                            return (
                              <button
                                key={c}
                                type="button"
                                title={c}
                                aria-label={`Tag as ${c}`}
                                aria-pressed={on}
                                onClick={() => tagPhoto(p.key, c)}
                                className={`h-[22px] w-[22px] shrink-0 rounded-full border-2 transition-all sm:h-6 sm:w-6 ${
                                  on
                                    ? "scale-110 border-[#eec449] shadow-[0_0_0_2px_rgba(238,196,73,0.32)]"
                                    : "border-black/10 hover:border-[#8a8a8e]"
                                }`}
                                style={{ background: hex }}
                              />
                            );
                          })}
                        </div>
                      )}
                      <p className="mt-1.5 truncate text-[11px] text-[#8a8a8e]">
                        {p.color ?? "All colours"}
                      </p>

                      {/* One click to promote — the arrows below are only for
                          fine-tuning the order of the rest. */}
                      {i === 0 ? (
                        <p className="mt-2 rounded-lg bg-[#eec449]/20 py-1.5 text-center text-[11px] font-bold uppercase tracking-[0.08em] text-[#9a7322]">
                          Main photo
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => makeMain(p.key)}
                          disabled={p.status !== "ready"}
                          className="mt-2 w-full cursor-pointer rounded-lg border border-[#e2e1e4] py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#0c0c0d] transition-colors hover:border-[#0c0c0d] hover:bg-[#0c0c0d] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Make main
                        </button>
                      )}

                      <div className="mt-1.5 flex justify-end text-[11px]">
                        <button
                          type="button"
                          onClick={() => removePhoto(p.key)}
                          className="cursor-pointer font-semibold text-[#d23b3b] hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}

            {untaggedColors.length > 0 && readyPhotos.length > 0 && (
              <p className="mt-4 text-[13px] text-[#9a7322]">
                No photo tagged for {untaggedColors.join(", ")} yet.
              </p>
            )}

            {/* The storefront card labels itself with the *first colour* but
                shows the *first photo*. If those disagree you get a red shirt
                captioned "Blue", so say so and offer the one-click fix. */}
            {mainPhotoColor && colors[0] && mainPhotoColor !== colors[0] && (
              <div className="mt-4">
                <Notice title="Main photo doesn't match the first colour">
                  Your main photo shows <strong>{mainPhotoColor}</strong>, but the
                  card will be labelled <strong>{colors[0]}</strong> — shoppers
                  would see a {mainPhotoColor.toLowerCase()} item called{" "}
                  {colors[0].toLowerCase()}.
                  <button
                    type="button"
                    onClick={() => makeFirstColor(mainPhotoColor)}
                    className="mt-2 block cursor-pointer font-semibold underline underline-offset-2"
                  >
                    Make {mainPhotoColor} the first colour
                  </button>
                </Notice>
              </div>
            )}
          </Step>

          <Step
            n={6}
            title={isAccessory ? "Stock" : "Sizes & stock"}
            hint={
              isAccessory
                ? "How many you have."
                : "Tap the sizes you stock, then how many of each."
            }
            done={isAccessory || sizes.length > 0}
          >
            {!isAccessory && (
              <div className="mb-5 flex flex-wrap gap-2.5">
                {STUDIO_SIZES.map((s) => (
                  <Chip
                    key={s}
                    wide
                    on={sizes.includes(s)}
                    onClick={() => setSizes((prev) => toggle(prev, s))}
                  >
                    {s}
                  </Chip>
                ))}
              </div>
            )}

            {!canSaveStock ? (
              <Notice title="Stock can't be saved yet">
                Shopify hasn&apos;t given this app permission to change stock
                levels, so quantities you type here won&apos;t stick. Everything
                else saves normally, and the product still sells. Ask your
                developer to add the <code>read_locations</code> and{" "}
                <code>write_inventory</code> permissions.
              </Notice>
            ) : (
              <div className="flex flex-wrap gap-3">
                {(isAccessory ? [ONE_SIZE] : orderedSizes).map((s) => (
                  <QtyInput
                    key={s}
                    label={s === ONE_SIZE ? "Units" : s}
                    value={stock[s] ?? ""}
                    onChange={(v) => setStock((prev) => ({ ...prev, [s]: v }))}
                  />
                ))}
              </div>
            )}

            <div className="mt-6">
              <Switch
                checked={backorder}
                onChange={setBackorder}
                title="Keep selling when it runs out"
                description="Customers can still order a sold-out size and join the queue, instead of seeing it greyed out."
              />
            </div>
          </Step>

          {/* Optional extras */}
          <div className="border-b border-[#e7e6e9] py-8">
            <button
              type="button"
              onClick={() => setShowExtras((v) => !v)}
              className="cursor-pointer text-[14px] font-semibold text-[#0c0c0d] underline underline-offset-4 transition-colors hover:text-[#8a8a8e]"
            >
              {showExtras ? "Hide" : "Add"} description, fit &amp; fabric
              <span className="font-normal text-[#8a8a8e]"> — optional</span>
            </button>

            {showExtras && (
              <div className="mt-6 flex flex-col gap-5">
                <Field
                  label="Description"
                  hint="Leave it empty and the website writes one from the product's own details."
                >
                  <TextArea
                    value={description}
                    onChange={setDescription}
                    placeholder="What makes it good to wear."
                  />
                </Field>

                <div>
                  <p className="mb-2.5 text-[13px] font-semibold text-[#0c0c0d]">
                    Badge
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    <Chip on={badge === ""} onClick={() => setBadge("")}>
                      None
                    </Chip>
                    {STUDIO_BADGES.map((b) => (
                      <Chip key={b} on={badge === b} onClick={() => setBadge(b)}>
                        {b}
                      </Chip>
                    ))}
                  </div>
                </div>

                <Field label="Fit notes">
                  <TextInput
                    value={fit}
                    onChange={setFit}
                    placeholder="Relaxed fit. Model is 6'0 wearing L."
                  />
                </Field>
                <Field label="Fabric & care">
                  <TextInput
                    value={fabrication}
                    onChange={setFabrication}
                    placeholder="240gsm combed cotton. Cold wash, hang dry."
                  />
                </Field>
              </div>
            )}
          </div>

          {/* Remove / delete — edit only, and last, so it's never a mis-tap */}
          {initial && (
            <div className="pt-8">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8a8a8e]">
                Remove this product
              </p>
              <ProductActions
                productId={initial.id}
                productName={initial.name}
                productHandle={initial.handle}
              />
            </div>
          )}
        </div>

        {/* ---------------- live preview ---------------- */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ProductPreview
            name={name}
            priceLKR={Number(price) || 0}
            compareAtLKR={Number(wasPrice) || undefined}
            colors={previewColors}
            heroImage={readyPhotos[0]?.previewUrl}
            square={isAccessory}
            badge={badge || undefined}
            visible={visible}
            checklist={checklist}
          />

          <div className="mt-8">
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8a8a8e]">
              When you save
            </p>
            <Segmented
              value={visible ? "live" : "draft"}
              onChange={(v) => setVisible(v === "live")}
              options={[
                { value: "live", label: "Publish" },
                { value: "draft", label: "Save as draft" },
              ]}
            />
            <p className="mt-2.5 text-[13px] leading-relaxed text-[#8a8a8e]">
              {visible
                ? "Customers will see it as soon as you save."
                : "Hidden from the website until you publish it."}
            </p>
          </div>
        </aside>
      </div>

      {error && (
        <div className="mt-8">
          <Notice tone="danger" title="Couldn't save">
            {error}
          </Notice>
        </div>
      )}

      {/* Action bar — always pinned to the bottom of the viewport, on every
          screen size. Ink surface so it reads as fixed chrome rather than more
          page, with the gold CTA unmissable against it.
          `pb-[env(safe-area-inset-bottom)]` lifts it clear of the iPhone home
          indicator, which would otherwise sit on top of the button. The page
          container's matching bottom padding (see `pb-36`) is what lets you
          still scroll to the very last photo instead of it hiding under here. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0c0c0d]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-8 sm:py-3.5">
          {/* One line, always: `truncate` keeps the bar a constant height, so
              the page's bottom padding can't be wrong on a narrow screen. The
              full list of what's outstanding lives in the preview checklist. */}
          <p className="min-w-0 flex-1 truncate text-[12px] leading-snug text-white/60 sm:text-[13px]">
            {uploading ? (
              <span className="flex items-center gap-2 text-white/80">
                <Spinner /> Waiting for photos…
              </span>
            ) : blockers.length > 0 ? (
              <>
                <span className="font-semibold text-white">
                  {blockers.length} to go:
                </span>{" "}
                {blockers[0].label.toLowerCase()}
                {blockers.length > 1 && ` +${blockers.length - 1} more`}
              </>
            ) : initial ? (
              "Ready to save."
            ) : visible ? (
              "Ready to publish."
            ) : (
              "Ready to save as a draft."
            )}
          </p>
          <div className="shrink-0">
            <StudioButton
              variant="gold"
              onClick={handleSave}
              disabled={uploading || blockers.length > 0}
              loading={pending}
              compact
            >
              {pending
                ? "Saving"
                : initial
                  ? "Save changes"
                  : visible
                    ? "Publish"
                    : "Save draft"}
            </StudioButton>
          </div>
        </div>
      </div>
    </div>
  );
}

