# Golden Egal T-shirt Website Design

_Started 2026-06-17 11:53 UTC_

---

## User

study these screen shots fully.....these images from incarnage.com web site.....i need this same style for my web site too.....my web site name is Golden Egal....it also sell Mens and Wemens T shirsts......build a web side design for me

## Assistant



## User

and also add images too and keep the premium look....now continue

## Assistant

I'll build this as a single streaming Design Component — the full Golden Egal homepage in the Carnage style: black nav, big italic headlines, product carousels with colour swatches, category tiles, and a premium dark hero. Setting up my plan first.

_[tool: update_todos]_

_[tool: dc_write]_

_[tool: update_todos]_

Built the Golden Egal homepage. Let me verify it loads cleanly.

_[tool: ready_for_verification]_

Done — **Golden Egal Home.dc.html** is live, built in the Carnage style:

- **Black sticky nav** with diamond-mark wordmark, WOMEN/MEN/ACCESSORIES/GIFT CARDS, search/account/cart (live count, +1 on click).
- **Big italic hero** "BE BETTER EVERYDAY" with Shop Mens/Womens — toggle between Cinematic and Studio versions in Tweaks.
- **Shop The Latest Styles** + **Accessories** scroll carousels (arrow buttons, colour swatches, hover quick-add), **Shop By Category** tiles, **Train In Golden Egal** with a working Mens/Womens switch, a campaign banner, perks row, and footer with newsletter.
- Gold accent (#c79a4b) on a black/white/antique premium palette.

**One note on images:** every photo is a labelled studio/cinematic placeholder (monospace captions mark exactly what goes where) — I can't generate real product photography. To drop in your real model shots, either send me the images or I can swap the placeholders for drag-and-drop image slots. Want me to add product detail pages or the mega-menu dropdown next?

## User

remove "Free Standard Shipping Over LKR 20,000 · Easy 14-Day Returns" this

## Assistant

_[tool: dc_set_props]_

Removed — the announcement bar is now hidden by default (still toggleable in Tweaks if you ever want it back).

## User

add both product detail pages and the mega-menu dropdown next

## Assistant

Adding the mega-menu dropdown to the home nav and creating a full product detail page. First the home edits:

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

Now link product names to the PDP and add the menu handlers to the logic class:

_[tool: dc_html_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

Now the product detail page:

_[tool: dc_write]_

Both done. Verifying the product page and the updated home:

_[tool: ready_for_verification]_

Both added and live:

**Mega-menu dropdown** (home) — hover WOMEN or MEN to drop a white panel with Featured / Explore columns plus two campaign tiles (Recommended For You, Bags); leaves on mouse-out. Clicking any product name or the menu's "T-Shirts" goes to the PDP.

**Product detail page** (`Golden Egal Product.dc.html`) — 4-up image gallery, sticky info column with price + installments, selectable colour swatches, a working size grid (XS/XXL disabled, S–XL selectable), a black ADD TO CART pill that updates the cart count and flips to "Added To Cart", an expandable Product Details accordion, shipping/returns rows, and a "You May Also Like" carousel. Header logo/nav link back home.

Same caveat as before — all imagery is labelled placeholders ready for your real photos. Want me to wire up a cart drawer or a collection/listing page next?

