import { avatarUrl } from "@luavio/shared";

export default function Avatar({
  seed,
  size = 40,
  className = "",
}: {
  seed: string;
  size?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={avatarUrl(seed)}
      alt=""
      width={size}
      height={size}
      className={`rounded-full border-2 border-outline bg-white flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
