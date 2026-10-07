interface AvatarProps {
  name: string;
  color: string;
  url?: string;
  size?: number;
  className?: string;
}

export function Avatar({ name, color, url, size = 54, className = '' }: AvatarProps) {
  const initials = getInitials(name);
  const fontSize = Math.floor(size * 0.4);

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 text-white font-medium select-none ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize,
        lineHeight: 1,
      }}
    >
      {initials}
    </div>
  );
}

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (/^\d+$/.test(trimmed)) {
    // Phone number — show first 2 digits
    return trimmed.slice(0, 2);
  }
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
