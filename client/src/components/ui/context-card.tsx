import React, { useMemo } from "react";
import { Tooltip } from "react-tooltip";

interface ContextCardTriggerProps {
  content: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
}

const ContextCardTrigger = ({
  content,
  side = "top",
  children
}: ContextCardTriggerProps) => {
  const id = useMemo(() => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  }, []);

  return (
    <>
      <div id={id}>{children}</div>
      <Tooltip
        anchorSelect={`#${id}`}
        place={side}
        opacity={1}
        border={"2px solid #3b82f6"}
        className={`!font-sans !text-left !text-sm !rounded-lg !bg-blue-50 !text-black !shadow-lg !z-50 !backdrop-blur-sm`}
        style={{
          backgroundColor: '#dbeafe !important',
          color: '#000000 !important',
          border: '2px solid #3b82f6 !important',
          boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3) !important',
          zIndex: 9999
        }}
      >
        {content}
      </Tooltip>
    </>
  );
};

export const ContextCard = {
  Trigger: ContextCardTrigger
};