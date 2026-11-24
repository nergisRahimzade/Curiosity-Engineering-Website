"use client";

// W2D1-FE: A pop-up window built on the browser's <dialog> element, as the
// plan asks. <dialog> gives us for free: focus moves inside when it opens,
// Tab stays inside, Esc closes it, the page behind can't be clicked, and
// focus goes back to the button that opened it.
//
//   const [open, setOpen] = useState(false);
//   <Button onClick={() => setOpen(true)}>Archive project</Button>
//   <Modal
//     open={open}
//     onClose={() => setOpen(false)}
//     title="Archive this project?"
//     footer={
//       <>
//         <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
//         <Button onClick={archive}>Archive</Button>
//       </>
//     }
//   >
//     It disappears from the public list. Officers can restore it later.
//   </Modal>
//
// The parent owns `open`. onClose runs for every way of closing (Esc, the
// × button), so always set `open` back to false there.

import { useEffect, useId, useRef } from "react";

export default function Modal({ open, onClose, title, footer, children }) {
  const dialogRef = useRef(null);
  const titleId = useId();

  // Keep the real <dialog> in step with the `open` prop. showModal() (not
  // show()) is what makes it a true modal with the dimmed backdrop.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    // Clicking the backdrop does NOT close it on purpose: a stray tap
    // shouldn't throw away a half-filled form. Use × or Esc.
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-lg border border-line bg-background p-0 text-foreground backdrop:bg-foreground/40"
    >
      <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
        <h2 id={titleId} className="text-lg font-semibold tracking-tight">
          {title}
        </h2>
        {/* Icon-only button, so it needs aria-label (plan accessibility table). */}
        <button
          type="button"
          aria-label="Close"
          onClick={() => dialogRef.current?.close()}
          className="-mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
        </button>
      </div>

      <div className="px-6 py-5 text-sm">{children}</div>

      {footer && (
        <div className="flex flex-wrap justify-end gap-3 border-t border-line px-6 py-4">
          {footer}
        </div>
      )}
    </dialog>
  );
}
