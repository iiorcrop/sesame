/**
 * Converts sanitized text back to normal text by replacing HTML entities and escape sequences
 * @param {string} sanitizedText - The sanitized text to be converted
 * @return {string} The unsanitized/normal text
 */
export const unsanitizeText = (sanitizedText) => {
  if (!sanitizedText || typeof sanitizedText !== "string") {
    return "";
  }

  return (
    sanitizedText
      // Replace HTML entities
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, "/")
      .replace(/&apos;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/&copy;/g, "©")
      .replace(/&reg;/g, "®")
      .replace(/&euro;/g, "€")
      .replace(/&pound;/g, "£")
      .replace(/&yen;/g, "¥")
      .replace(/&hellip;/g, "…")
      .replace(/&mdash;/g, "—")
      .replace(/&ndash;/g, "–")
      .replace(/&lsquo;/g, "‘")
      .replace(/&rsquo;/g, "’")
      .replace(/&ldquo;/g, "“")
      .replace(/&rdquo;/g, "”")
      // Replace common escape sequences
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\r/g, "\r")
      .replace(/\\\\/g, "\\")
      .replace(/\\\//g, "/")
  );
};
/**
 * Creates safe HTML from potentially sanitized text
 * @param {string} text - Text that might contain HTML entities
 * @return {object} Object with __html property for dangerouslySetInnerHTML
 */
export const createUnsanitizedHtml = (text) => {
  return { __html: unsanitizeText(text) };
};
