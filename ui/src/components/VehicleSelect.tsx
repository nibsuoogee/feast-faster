import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { vehicleOptions } from "@/data/vehicles";

export function VehicleSelect({ value, onChange }: any) {
  const [open, setOpen] = useState(false);

  const selected = vehicleOptions.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between bg-white"
        >
          {selected ? selected.label : "Select EV model"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0 bg-white">
        <Command>
          <CommandInput placeholder="Search vehicle..." />
          <CommandList>
            <CommandEmpty>No vehicles found.</CommandEmpty>
            <CommandGroup>
              {vehicleOptions.map((v) => (
                <CommandItem
                  key={v.value}
                  onSelect={() => {
                    onChange(v.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={
                      value === v.value ? "mr-2 opacity-100" : "mr-2 opacity-0"
                    }
                  />
                  {v.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default VehicleSelect;
