import DOMPurify from "dompurify";

type EditorContentProps = {
  html: string | null | undefined;
  className?: string;
};

function decodeHtmlEntities(value: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

export default function EditorContent({ html, className }: EditorContentProps) {
  const decodedHtml = decodeHtmlEntities(html ?? "");
  const cleanHtml = DOMPurify.sanitize(decodedHtml);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
}