import { CheckCircle, Check as PhosphorCheck } from "phosphor-react";

export default function Check() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <CheckCircle
        size={16}
        weight="fill"
        className="absolute"
        style={{ fill: "#1a1a1a" }}
      />
      <PhosphorCheck
        size={16}
        weight="fill"
        className="relative z-10"
        style={{ color: "white" }}
      />
    </div>
  );
}
