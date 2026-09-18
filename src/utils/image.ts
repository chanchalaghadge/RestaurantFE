const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="#edf3fb"/><path d="M165 285l78-82 57 55 49-47 86 74H165z" fill="#9ab5de"/><circle cx="395" cy="128" r="30" fill="#f3bd55"/><rect x="128" y="82" width="344" height="236" rx="18" fill="none" stroke="#6d91c8" stroke-width="12"/><text x="300" y="365" text-anchor="middle" fill="#52739e" font-family="Arial" font-size="26">Image unavailable</text></svg>`;
export const DEFAULT_IMAGE_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(placeholderSvg)}`;

export const imageUrl = (url?: string) => url?.trim() || DEFAULT_IMAGE_URL;

export const useDefaultImageOnError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = DEFAULT_IMAGE_URL;
};
