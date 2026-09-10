export function prepareDownload(anchor, {blob, fileName}) {
  const objectUrl = URL.createObjectURL(blob);
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.hidden = false;

  let active = true;
  const release = () => {
    if (!active) return;
    active = false;
    URL.revokeObjectURL(objectUrl);
    anchor.removeAttribute('href');
    anchor.hidden = true;
  };
  anchor.addEventListener('click', () => setTimeout(release, 0), {once: true});
  return release;
}
