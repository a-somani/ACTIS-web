export function ratioToAspect(ratio: string): number {
  const [width, height] = ratio.split(':').map((value) => Number(value));
  if (!width || !height) {
    return 1;
  }
  return width / height;
}

export function formatAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${Math.round(width / divisor)}:${Math.round(height / divisor)}`;
}
