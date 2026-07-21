/**
 * Emits a schema.org JSON-LD block. Server-rendered into the markup so
 * crawlers see it without executing JavaScript.
 *
 * `<` is escaped to `<` so a stray `</script>` inside product copy or a
 * customer review can't break out of the script element.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
