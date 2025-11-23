"use client";

import { ConsoleSelectorProps } from "@/types";
import { CONSOLES } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Console selector component using a Select dropdown
 */
export default function ConsoleSelector({
  value,
  onChange,
  disabled = false,
  customConsoles = [],
}: ConsoleSelectorProps & { customConsoles?: any[] }) {
  // Combine standard and custom consoles, sorting by label
  const allConsoles = [...CONSOLES, ...customConsoles].sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Console/System</CardTitle>
        <CardDescription>
          Select the console/system for this ROM
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder="Select a console..." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Consoles</SelectLabel>
              {allConsoles.map((console) => (
                <SelectItem key={console.value} value={console.value}>
                  {console.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
