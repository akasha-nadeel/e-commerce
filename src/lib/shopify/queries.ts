/**
 * Storefront API GraphQL documents. Fields here map 1:1 onto the `Product`
 * shape produced in `transform.ts`. Merchandising extras (rating, badge, colour
 * swatches) come from product metafields until they're set up in Shopify.
 */

export const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    handle
    title
    description
    productType
    tags
    availableForSale
    priceRange { minVariantPrice { amount currencyCode } }
    compareAtPriceRange { minVariantPrice { amount currencyCode } }
    options { name values }
    images(first: 8) {
      edges { node { url altText } }
    }
    variants(first: 100) {
      edges {
        node {
          availableForSale
          selectedOptions { name value }
        }
      }
    }
    rating: metafield(namespace: "reviews", key: "rating_value") { value }
    reviewCount: metafield(namespace: "reviews", key: "rating_count") { value }
    badge: metafield(namespace: "custom", key: "badge") { value }
    swatches: metafield(namespace: "custom", key: "color_swatches") { value }
  }
`;

export const GET_PRODUCT_BY_HANDLE = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) { ...ProductFields }
  }
  ${PRODUCT_FRAGMENT}
`;

export const GET_PRODUCTS = /* GraphQL */ `
  query Products(
    $first: Int!
    $query: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) {
    products(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse) {
      edges { node { ...ProductFields } }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const GET_COLLECTION_PRODUCTS = /* GraphQL */ `
  query CollectionProducts($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      products(first: $first) {
        edges { node { ...ProductFields } }
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const GET_ALL_PRODUCT_HANDLES = /* GraphQL */ `
  query AllHandles($first: Int!) {
    products(first: $first) {
      edges { node { handle } }
    }
  }
`;
