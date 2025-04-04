import { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface HeadingProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  bgColor?: string;
}

export const Heading = ({
  title,
  description,
  icon: Icon,
  iconColor,
  bgColor,
}: HeadingProps) => {
  return (
    <>
      <div className="px-4 lg:px-8 flex items-center gap-x-3 mb-2">
        <div className={cn("p-1 w-fit rounded-md", bgColor)}>
          <Icon className={cn("w-16 h-16", iconColor)} />
        </div>
        <div>
          <h2 className="text-4xl font-bold py-2">{title}</h2>
          <p className="text-[1rem] text-muted-foreground">{description}</p>
        </div>
      </div>
    </>
  );
};
