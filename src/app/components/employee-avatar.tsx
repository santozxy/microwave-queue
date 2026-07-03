"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getEmployeeInitials, getEmployeeProfile } from "@/lib/employees";

interface EmployeeAvatarProps {
  className?: string;
  name: string;
}

export function EmployeeAvatar({ className, name }: EmployeeAvatarProps) {
  const profile = getEmployeeProfile(name);

  return (
    <Avatar className={cn("size-15 border border-border bg-muted", className)}>
      {profile?.photo && (
        <AvatarImage
          alt={`Foto de ${name}`}
          className="object-cover"
          src={profile.photo}
        />
      )}
      <AvatarFallback className="text-xs font-semibold">
        {getEmployeeInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
