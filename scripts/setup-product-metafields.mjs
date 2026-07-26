/**
 * One-time setup: define the product metafields the storefront reads.
 *
 * WHY THIS EXISTS
 * The Studio writes `custom.color_swatches`, `custom.badge`, `custom.fit` and
 * `custom.fabrication` via the Admin API, and `shopify/queries.ts` reads them
 * back via the Storefront API. That silently didn't work: since 2023 Shopify
 * only exposes a metafield to the Storefront API if it has a **definition**
 * with storefront access. Undefined ("unstructured") metafields are Admin-only,
 * so the values were written correctly and then read back as `null` — no error
 * anywhere, just swatches falling through to grey and the PDP showing its
 * generic fit/fabric copy.
 *
 * Creating a definition adopts the values already stored on existing products,
 * so this fixes products created before it ran as well as new ones.
 *
 * Run once:  node scripts/setup-product-metafields.mjs
 * Safe to re-run — an existing definition is reported and skipped.
 */
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const DOMAIN = env.SHOPIFY_STORE_DOMAIN;
const TOKEN = env.SHOPIFY_ADMIN_ACCESS_TOKEN;
if (!DOMAIN || !TOKEN) {
  console.error(
    "Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_ACCESS_TOKEN in .env.local.",
  );
  process.exit(1);
}
const ENDPOINT = `https://${DOMAIN}/admin/api/${env.SHOPIFY_API_VERSION || "2025-10"}/graphql.json`;

async function gql(query, variables) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json();
  if (body.errors) throw new Error(JSON.stringify(body.errors));
  return body.data;
}

/**
 * `type` must match what is already stored, or Shopify rejects the definition
 * rather than adopting the existing values.
 */
const DEFINITIONS = [
  {
    key: "color_swatches",
    name: "Colour swatches",
    type: "json",
    description:
      "Colour name → hex map, written by the Studio. transform.ts reads this first, ahead of Shopify's native swatch, so a brand colour never falls back to grey.",
  },
  {
    key: "badge",
    name: "Badge",
    type: "single_line_text_field",
    description: "Merchandising badge shown on product cards, e.g. New Arrival.",
  },
  {
    key: "fit",
    name: "Fit notes",
    type: "multi_line_text_field",
    description: "Fit copy for the PDP details accordion; falls back to default copy when empty.",
  },
  {
    key: "fabrication",
    name: "Fabric & care",
    type: "multi_line_text_field",
    description: "Fabric and care copy for the PDP details accordion.",
  },
];

const CREATE = /* GraphQL */ `
  mutation DefineMetafield($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) {
      createdDefinition {
        key
        type { name }
        access { storefront }
      }
      userErrors { code field message }
    }
  }
`;

let created = 0;
let existing = 0;
let failed = 0;

for (const def of DEFINITIONS) {
  const data = await gql(CREATE, {
    definition: {
      namespace: "custom",
      key: def.key,
      name: def.name,
      description: def.description,
      ownerType: "PRODUCT",
      type: def.type,
      pin: true,
      // The whole point: without PUBLIC_READ the Storefront API returns null.
      access: { storefront: "PUBLIC_READ" },
    },
  });

  const { createdDefinition, userErrors } = data.metafieldDefinitionCreate;
  if (createdDefinition) {
    console.log(
      `  created  custom.${def.key} (${createdDefinition.type.name}, storefront ${createdDefinition.access.storefront})`,
    );
    created++;
  } else if (userErrors.some((e) => e.code === "TAKEN")) {
    console.log(`  exists   custom.${def.key} — skipped`);
    existing++;
  } else {
    console.log(`  FAILED   custom.${def.key}: ${userErrors.map((e) => e.message).join("; ")}`);
    failed++;
  }
}

console.log(`\n${created} created, ${existing} already existed, ${failed} failed.`);
if (failed > 0) process.exit(1);

// Verify through the *Storefront* token — the only check that actually matters,
// since Admin could read these all along.
const sfToken = env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
if (sfToken) {
  const res = await fetch(
    `https://${DOMAIN}/api/${env.SHOPIFY_API_VERSION || "2025-10"}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": sfToken,
      },
      body: JSON.stringify({
        query: `{
          products(first: 1) {
            edges { node {
              handle
              swatches: metafield(namespace: "custom", key: "color_swatches") { value }
            } }
          }
        }`,
      }),
    },
  );
  const body = await res.json();
  const node = body.data?.products?.edges?.[0]?.node;
  console.log(
    node
      ? `\nStorefront check on "${node.handle}": color_swatches = ${node.swatches?.value ?? "STILL NULL"}`
      : "\nStorefront check: no products to test against.",
  );
}
