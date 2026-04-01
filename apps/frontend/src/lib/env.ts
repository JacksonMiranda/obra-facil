const PLACEHOLDER_MARKERS = ['<...', '<your-', 'your-project-ref'];

function hasPlaceholder(value: string): boolean {
  return PLACEHOLDER_MARKERS.some((marker) => value.includes(marker));
}

function isFilled(value: string | undefined): value is string {
  return Boolean(value && value.trim() && !hasPlaceholder(value));
}

export function isClerkConfigured(): boolean {
  if (process.env.NEXT_PUBLIC_DISABLE_CLERK_AUTH === 'true') {
    return false;
  }

  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;

  return (
    isFilled(publishableKey) &&
    isFilled(secretKey) &&
    /^pk_(test|live)_/.test(publishableKey) &&
    /^sk_(test|live)_/.test(secretKey)
  );
}

