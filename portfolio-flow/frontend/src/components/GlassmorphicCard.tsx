import { motion } from "framer-motion";
import React from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
}

export const GlassmorphicCard: React.FC<Props> = ({
  children,
  className,
  delay = 0,
  style,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`glassmorphic rounded-2xl p-6 float-animation ${className}`}
      style={style}
    >
      {children}
    </motion.div>
  );
};
