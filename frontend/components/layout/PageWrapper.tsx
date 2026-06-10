import { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  /** Use narrow for 800px-capped content like article/docs layouts */
  narrow?: boolean;
}

export default function PageWrapper({ children, className = "", narrow = false }: PageWrapperProps) {
  return (
    <div
      className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${
        narrow ? "max-w-[860px]" : "max-w-[1280px]"
      } ${className}`}
    >
      {children}
    </div>
  );
}
