import React from "react";
import { Sparkles, Crown } from "lucide-react";

interface PremiumBadgeProps {
  size?: "sm" | "md" | "lg";
  showIconOnly?: boolean;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({ size = "md", showIconOnly = false }) => {
  const sizeClasses = {
    sm: "premium-badge-sm",
    md: "premium-badge-md",
    lg: "premium-badge-lg",
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 18,
  };

  return (
    <span className={`premium-badge ${sizeClasses[size]}`} title="Usuário Assinante do Plano Premium">
      <Crown size={iconSizes[size]} className="premium-badge-icon" />
      {!showIconOnly && <span className="premium-badge-text">PREMIUM</span>}
      <Sparkles size={iconSizes[size] - 2} className="premium-badge-sparkle" />
    </span>
  );
};
