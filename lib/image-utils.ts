/**
 * Resolves full image URL from relative paths, absolute URLs, or data URLs.
 */
export function resolveImageUrl(url: string | null | undefined): string | undefined {
  if (!url || typeof url !== 'string') return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;

  // If already a data URI or blob URL
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090/api/v1';
  const backendBase = apiUrl.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '');

  // If URL points to localhost/127.0.0.1 (e.g., stored as http://localhost:8080/uploads/... by backend)
  // rewrite host to current active backend origin so it works in both local and production environments
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(trimmed)) {
    const pathPart = trimmed.replace(/^https?:\/\/[^\/]+/, '');
    return `${backendBase}${pathPart}`;
  }

  // If it's an external full URL (e.g. S3, Cloudinary, etc.)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // If it's a relative backend path (e.g., /uploads/... or uploads/...)
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${backendBase}${cleanPath}`;
}

/**
 * Extracts and formats image URL for an officer or user object from all possible backend property names.
 */
export function getOfficerImageUrl(officer: any): string | undefined {
  if (!officer || typeof officer !== 'object') return undefined;

  const rawUrl =
    officer.photoUrl ||
    officer.photo_url ||
    officer.imageUrl ||
    officer.image_url ||
    officer.avatarUrl ||
    officer.avatar_url ||
    officer.profileImage ||
    officer.profile_image ||
    officer.picture ||
    officer.photo;

  return resolveImageUrl(rawUrl);
}

/**
 * Helper to generate initials from Khmer or English names.
 */
export function getOfficerInitials(officer: any): string {
  if (!officer || typeof officer !== 'object') return 'ម';

  const khmerName = `${officer.last_name_kh || ''} ${officer.first_name_kh || ''}`.trim();
  if (khmerName) {
    const parts = khmerName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`;
    }
    return parts[0]?.slice(0, 2) || 'ម';
  }

  const enFirst = officer.first_name || officer.first_name_en || '';
  const enLast = officer.last_name || officer.last_name_en || '';
  if (enFirst || enLast) {
    return `${enFirst[0] || ''}${enLast[0] || ''}`.toUpperCase() || 'OFF';
  }

  return 'ម';
}
