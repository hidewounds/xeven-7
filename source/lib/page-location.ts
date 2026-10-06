/** Hash routes keep navigation within one file origin in the portable edition. */
export function pageSearchParams(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  if (
    window.location.protocol === "file:" &&
    window.location.hash.startsWith("#/")
  )
    return new URL(window.location.hash.slice(1), "https://xeven.invalid")
      .searchParams;
  return new URLSearchParams(window.location.search);
}
