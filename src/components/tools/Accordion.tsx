import { useState, type ReactNode } from "react";

type AccordionProps = {
  open?: boolean;
  head: ReactNode;
  details: ReactNode;
};

export default function Accordion({
  open: initialOpen = false,
  head,
  details,
}: AccordionProps) {
  const [open, setOpen] = useState(initialOpen);

  return (
    <div>
      <div className="flex w-full items-center">
        <div className="mr-2 flex-1">{head}</div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle details"
          aria-expanded={open}
          className="flex h-3 w-3 cursor-pointer items-center justify-center border-0 bg-transparent p-0"
        >
          <span className="relative block h-3 w-3">
            <span className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-black" />

            <span
              className={[
                "absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-black transition-transform duration-300",
                open ? "rotate-90" : "",
              ].join(" ")}
            />
          </span>
        </button>
      </div>

      {open && (
        <div className="overflow-hidden animate-[slideDown_0.25s_ease] mt-3">
          {details}
        </div>
      )}
    </div>
  );
}