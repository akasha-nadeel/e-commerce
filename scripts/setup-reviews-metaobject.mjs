// Creates the `product_review` metaobject definition in Shopify via the Admin
// API. Run once after adding SHOPIFY_ADMIN_ACCESS_TOKEN to .env.local:
//   node scripts/setup-reviews-metaobject.mjs
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

if (!DOMAIN || !TOKEN) {
  console.error("Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_ACCESS_TOKEN in .env.local");
  process.exit(1);
}

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

const mutation = `
  mutation CreateDef($definition: MetaobjectDefinitionCreateInput!) {
    metaobjectDefinitionCreate(definition: $definition) {
      metaobjectDefinition { id type }
      userErrors { field message code }
    }
  }
`;

const definition = {
  name: "Product Review",
  type: "ge_product_review",
  displayNameKey: "author",
  capabilities: { publishable: { enabled: true } },
  fieldDefinitions: [
    { key: "product_handle", name: "Product handle", type: "single_line_text_field", required: true },
    { key: "product_title", name: "Product title", type: "single_line_text_field" },
    { key: "rating", name: "Rating", type: "number_integer", required: true },
    { key: "author", name: "Author", type: "single_line_text_field", required: true },
    { key: "title", name: "Title", type: "single_line_text_field" },
    { key: "body", name: "Body", type: "multi_line_text_field", required: true },
    { key: "created_at", name: "Created at", type: "single_line_text_field" },
  ],
};

const data = await gql(mutation, { definition });
const r = data.metaobjectDefinitionCreate;
if (r.userErrors?.length) {
  const taken = r.userErrors.some((e) => e.code === "TAKEN");
  if (taken) {
    console.log("✓ Definition `product_review` already exists — nothing to do.");
    process.exit(0);
  }
  console.error("userErrors:", JSON.stringify(r.userErrors, null, 2));
  process.exit(1);
}
console.log("✓ Created metaobject definition:", r.metaobjectDefinition.type, r.metaobjectDefinition.id);
