interface AvatarProps {
  initials: string;
  color: string;
  size?: "sm" | "md" | "lg";
  ring?: string;
}

export default function Avatar({
  initials,
  color,
  size = "md",
  ring,
}: AvatarProps) {
  const sizes = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-xs",
    lg: "w-11 h-11 text-sm",
  };

  return (
    <div
      style={{
        backgroundColor: color,
      }}
      className={[
        "flex items-center justify-center rounded-xl font-bold text-white shrink-0",
        sizes[size],
        ring ?? "",
      ].join(" ")}
    >
      {initials}
    </div>
  );
}