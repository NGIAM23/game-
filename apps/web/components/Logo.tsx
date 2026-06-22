export default function Logo({ size = 22 }: { size?: number }) {
  return (
    <span className="font-heading inline-flex items-baseline gap-0.5" style={{ fontSize: size }}>
      luav<span className="text-secondary">i</span>o
    </span>
  );
}
