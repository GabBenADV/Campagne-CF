/**
 * Decodifica le entita HTML ricevute dall'API (es. &quot;, &#34;, &amp;quot;).
 * Il valore restituito va sempre mostrato come testo React, NON con dangerouslySetInnerHTML.
 */
export function decodeHtmlEntities(value: string | null | undefined): string {
  let result = String(value ?? "");
  if (typeof document === "undefined" || !result.includes("&")) return result;

  const textarea = document.createElement("textarea");
  // Un massimo di due passaggi gestisce sia entita singole che doppiamente codificate.
  for (let i = 0; i < 2; i++) {
    if (!result.includes("&")) break;
    textarea.innerHTML = result;
    const decoded = textarea.value;
    if (decoded === result) break;
    result = decoded;
  }
  return result;
}
