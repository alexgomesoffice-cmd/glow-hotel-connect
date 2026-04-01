import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, format, isSameDay, isSameMonth, startOfMonth } from "date-fns";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = {
  className?: string;
  showOutsideDays?: boolean;
  mode?: "single";
  month?: Date;
  onMonthChange?: (month: Date) => void;
  selected?: Date;
  disabled?: (date: Date) => boolean;
  onSelect?: (date: Date | undefined) => void;
  initialFocus?: boolean;
};

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

function Calendar({
  className,
  showOutsideDays = true,
  mode = "single",
  month: controlledMonth,
  onMonthChange,
  selected,
  disabled,
  onSelect,
  initialFocus,
}: CalendarProps) {
  const today = React.useMemo(() => new Date(), []);
  const [uncontrolledMonth, setUncontrolledMonth] = React.useState<Date>(() =>
    startOfMonth(controlledMonth ?? selected ?? today),
  );

  // Keep internal month in sync if parent controls it.
  React.useEffect(() => {
    if (controlledMonth) setUncontrolledMonth(startOfMonth(controlledMonth));
  }, [controlledMonth]);

  const month = uncontrolledMonth;
  const setMonth = (next: Date) => {
    if (controlledMonth) onMonthChange?.(next);
    else setUncontrolledMonth(next);
  };

  const headerRef = React.useRef<HTMLDivElement>(null);
  const firstFocusableDayRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!initialFocus) return;
    // Prefer focusing selected day; fallback to the first enabled day.
    const t = window.setTimeout(() => {
      firstFocusableDayRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [initialFocus]);

  const firstOfMonth = React.useMemo(() => startOfMonth(month), [month]);
  const startWeek = React.useMemo(() => {
    // JS getDay(): 0 (Sun) .. 6 (Sat)
    const offset = firstOfMonth.getDay();
    return addDays(firstOfMonth, -offset);
  }, [firstOfMonth]);

  const days = React.useMemo(() => {
    const out: Array<{
      date: Date;
      isOutside: boolean;
      isDisabled: boolean;
      isToday: boolean;
      isSelected: boolean;
    }> = [];

    for (let i = 0; i < 42; i++) {
      const d = addDays(startWeek, i);
      const isOutside = !isSameMonth(d, month);
      const isDisabled = disabled ? disabled(d) : false;
      out.push({
        date: d,
        isOutside,
        isDisabled,
        isToday: isSameDay(d, today),
        isSelected: selected ? isSameDay(d, selected) : false,
      });
    }

    return out;
  }, [disabled, month, selected, startWeek, today]);

  // Build day button styles without button size padding (buttonVariants includes px/py by default).
  const baseDayButton = cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "hover:bg-secondary hover:text-secondary-foreground",
    "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
  );

  const handlePrev = () => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
  const handleNext = () => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));

  return (
    <div ref={headerRef} className={cn("p-3 pointer-events-auto", className)}>
      <div className="flex items-center justify-center relative pt-1 pb-2">
        <div className="text-sm font-medium">{format(month, "MMMM yyyy")}</div>

        <button
          type="button"
          onClick={handlePrev}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          )}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          )}
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 w-full">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="h-9 w-9 p-0 text-center text-muted-foreground rounded-md font-normal text-[0.8rem] flex items-center justify-center flex-none"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 w-full gap-0">
        {days.map(({ date, isOutside, isDisabled, isToday, isSelected }, idx) => {
          // If user doesn't want outside days, render them as blanks.
          if (!showOutsideDays && isOutside) {
            return <div key={idx} className="h-9 w-9" />;
          }

          const classNameForDay = cn(
            baseDayButton,
            isDisabled && "text-muted-foreground opacity-50 cursor-not-allowed",
            !isDisabled && isOutside && "text-muted-foreground opacity-50",
            isToday && !isSelected && "bg-accent text-accent-foreground",
            isSelected &&
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          );

          return (
            <button
              key={idx}
              type="button"
              className={classNameForDay}
              aria-selected={isSelected}
              disabled={isDisabled}
              onClick={() => {
                if (mode !== "single") return;
                if (isDisabled) return;
                onSelect?.(date);
              }}
              ref={(ref) => {
                // Focus the first enabled day if requested.
                if (!ref) return;
                const shouldFocus = initialFocus && !isDisabled && !isOutside;
                if (shouldFocus) firstFocusableDayRef.current = ref;
              }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
