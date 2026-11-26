"use client";

// W2D5-FE: The navbar's status line for logging out. It's always on the page
// (empty most of the time), because screen readers only announce changes to a
// role="status" region that already exists. "You're logged out." is for screen
// readers only (everyone else sees the links change); an error shows for all.

import Container from "@/components/Container";
import { useSession } from "@/lib/session";

export default function SessionNotice() {
  const { notice } = useSession();
  const isError = notice?.kind === "error";

  return (
    <div role="status" className={isError ? "border-t border-line" : "sr-only"}>
      {notice && (
        <Container>
          <p className={isError ? "py-3 text-sm text-danger" : undefined}>{notice.text}</p>
        </Container>
      )}
    </div>
  );
}
