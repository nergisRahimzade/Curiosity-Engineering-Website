"use client";

// W2D1-FE: Live Modal example for the style guide. The style guide page is
// a server component, so the open/close state has to live in this small
// client component.

import { useState } from "react";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";

export default function ModalDemo() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open modal
      </Button>
      <Modal
        open={open}
        onClose={close}
        title="Add an expense"
        footer={
          <>
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button onClick={close}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Item" name="item" required />
          <FormField label="Amount" name="amount" inputMode="decimal" hint="In dollars, e.g. 24.50" />
        </div>
      </Modal>
    </>
  );
}
