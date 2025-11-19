import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

const cuisines = [
  { label: "American", value: "american" },
  { label: "Asian", value: "asian" },
  { label: "Vegetarian", value: "vegetarian" },
  { label: "Italian", value: "italian" },
  { label: "European", value: "european" },
  { label: "Mexican", value: "mexican" },
  { label: "Regional", value: "regional" },
  { label: "Turkish", value: "turkish" }
];

export function CuisineMultiSelect({ value, onChange }: any) {
  const [open, setOpen] = useState(false);

  const allValues = cuisines.map((c) => c.value);
  const allSelected = value.length === allValues.length;

  const toggleCuisine = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v: string) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(allValues);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between bg-white"
        >
          {value.length === 0 ? (
            "Select cuisine"
          ) : value.length <= 2 ? (
            value
              .map((v: string) => cuisines.find(c => c.value === v)?.label)
              .filter(Boolean)
              .join(", ")
          ) : (
            `${cuisines.find(c => c.value === value[0])?.label} and ${value.length - 1} more`
          )}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0 bg-white">
        <Command>
          <CommandList>
            <CommandGroup>
              {/* SELECT ALL */}
              <CommandItem onSelect={toggleSelectAll}>
                <Check
                  className={
                    allSelected
                      ? "mr-2 opacity-100"
                      : "mr-2 opacity-0"
                  }
                />
                Select All
              </CommandItem>

              {/* INDIVIDUAL OPTIONS */}
              {cuisines.map((c) => (
                <CommandItem
                  key={c.value}
                  onSelect={() => toggleCuisine(c.value)}
                >
                  <Check
                    className={
                      value.includes(c.value)
                        ? "mr-2 opacity-100"
                        : "mr-2 opacity-0"
                    }
                  />
                  {c.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
