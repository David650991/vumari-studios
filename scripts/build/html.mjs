export const escape = value => String(value).replace(/[&<>"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
export const withPrefix = (prefix, target) => `${prefix}${target}`;
export const absoluteUrl = (siteUrl, file) => new URL(file, siteUrl).href;
