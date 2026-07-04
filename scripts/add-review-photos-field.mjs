// Adds a `photos` (list of image files) field to the ge_product_review
// metaobject definition. Run once:  node scripts/add-review-photos-field.mjs
import fs from "node:fs";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

const DOMAIN = env.SHOPIFY_STORE_DOMAIN;
const TOKEN = env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const VERSION = env.SHOPIFY_API_VERSION ?? "2025-10";
const endpoint = `https://${DOMAIN}/admin/api/${VERSION}/graphql.json`;

async function gql(query, variables) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

// Look up the definition id by type.
const byType = await gql(`
  query { metaobjectDefinitionByType(type: "ge_product_review") { id fieldDefinitions { key } } }
`);
const def = byType.metaobjectDefinitionByType;
if (!def) {
  console.error("ge_product_review definition not found. Run setup-reviews-metaobject.mjs first.");
  process.exit(1);
}
if (def.fieldDefinitions.some((f) => f.key === "photos")) {
  console.log("✓ `photos` field already exists — nothing to do.");
  process.exit(0);
}

const data = await gql(
  `mutation Update($id: ID!, $definition: MetaobjectDefinitionUpdateInput!) {
     metaobjectDefinitionUpdate(id: $id, definition: $definition) {
       metaobjectDefinition { id }
       userErrors { field message code }
     }
   }`,
  {
    id: def.id,
    definition: {
      fieldDefinitions: [
        {
          create: {
            key: "photos",
            name: "Photos",
            type: "list.file_reference",
            validations: [{ name: "file_type_options", value: '["Image"]' }],
          },
        },
      ],
    },
  },
);

const r = data.metaobjectDefinitionUpdate;
if (r.userErrors?.length) {
  console.error("userErrors:", JSON.stringify(r.userErrors, null, 2));
  process.exit(1);
}
console.log("✓ Added `photos` field to ge_product_review.");
