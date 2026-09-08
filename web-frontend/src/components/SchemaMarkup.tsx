type Schema = Record<string, unknown>;

interface SchemaMarkupProps {
  schemas: Schema[];
}

// JSON-LD must be server-rendered so search crawlers receive it in the initial
// document. Escaping `<` prevents schema values from closing the script tag.
export default function SchemaMarkup({ schemas }: SchemaMarkupProps) {
  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
