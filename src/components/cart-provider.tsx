"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CartLine {
  id: string;
  slug: string;
  name: string;
  colorName: string;
  size: string;
  priceLKR: number;
  image?: string;
  qty: number;
  /** Shopify variant GID (merchandiseId), used to build the checkout cart. */
  variantId?: string;
  /** Variant is out of stock and was ordered as a backorder. */
  backorder?: boolean;
  /** Mock first-come-first-served queue position for the backordered variant. */
  queuePosition?: number;
}

export type NewCartLine = Omit<CartLine, "id" | "qty">;

interface CartState {
  lines: CartLine[];
  /** Total units across all lines (header badge). */
  count: number;
  /** Sum of price × qty in LKR. */
  subtotal: number;
  isOpen: boolean;
  /** Add a line (merges qty when the same slug/colour/size already exists) and opens the drawer. */
  add: (line: NewCartLine, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  open: () => void;
  close: () => void;
}

const CartContext = createContext<CartState | null>(null);

const lineId = (l: NewCartLine) => `${l.slug}::${l.colorName}::${l.size}`;

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const add = useCallback((line: NewCartLine, qty = 1) => {
    const id = lineId(line);
    setLines((prev) => {
      const i = prev.findIndex((l) => l.id === id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + qty };
        return next;
      }
      return [...prev, { ...line, id, qty }];
    });
    setIsOpen(true);
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.id !== id)
        : prev.map((l) => (l.id === id ? { ...l, qty } : l)),
    );
  }, []);

  const remove = useCallback(
    (id: string) => setLines((prev) => prev.filter((l) => l.id !== id)),
    [],
  );

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const count = useMemo(() => lines.reduce((n, l) => n + l.qty, 0), [lines]);
  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.priceLKR * l.qty, 0),
    [lines],
  );

  // Esc to close + lock body scroll while the drawer is open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  const value = useMemo(
    () => ({ lines, count, subtotal, isOpen, add, setQty, remove, open, close }),
    [lines, count, subtotal, isOpen, add, setQty, remove, open, close],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
