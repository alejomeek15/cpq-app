import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Importamos el locale en español
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/ui/button';
import { Calendar } from '@/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/ui/popover';

export function DatePicker({ date, setDate, placeholder = "Selecciona una fecha" }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: es }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          locale={es} // Usamos el locale en español para el calendario
        />
      </PopoverContent>
    </Popover>
  );
}