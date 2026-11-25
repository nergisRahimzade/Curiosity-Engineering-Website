// W2D1-FE: A data table for lists such as the expense log, attendee lists
// and the officer members page. Pass columns and rows; the table adds the
// <caption> and scope attributes the plan asks for, so screen readers read
// each cell with its column name.
//
//   <Table
//     caption="Expenses this term"
//     columns={[
//       { key: "date", header: "Date" },
//       { key: "item", header: "Item" },
//       { key: "amount", header: "Amount", align: "right",
//         render: (row) => formatCents(row.amountCents) },
//       { key: "status", header: "Status",
//         render: (row) => <Badge tone="success">{row.status}</Badge> },
//     ]}
//     rows={expenses}
//     rowKey="id"                         // field that's unique per row
//     rowHeader="item"                    // optional: this column names the row
//     empty="No expenses logged yet."     // shown when rows is empty
//     id="expenses-table"                 // optional, only if two captions match
//   />
//
// Set hideCaption to keep the caption for screen readers only, when a
// heading right above the table already says the same thing.

const alignments = {
  left: "text-left",
  right: "text-right tabular-nums", // money and counts line up by digit
  center: "text-center",
};

function cellValue(column, row) {
  return column.render ? column.render(row) : row[column.key];
}

export default function Table({
  caption,
  hideCaption = false,
  columns,
  rows,
  rowKey = "id",
  rowHeader,
  empty = "Nothing here yet.",
  id,
  className = "",
}) {
  // The caption's id lets the scroll area below be named by it. It's made
  // from the caption text; pass `id` if two tables on a page share a caption.
  const captionId = id ?? `table-${String(caption).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    // On phones a wide table scrolls sideways inside this box instead of
    // making the whole page scroll. tabIndex lets keyboard users focus it
    // and scroll with the arrow keys; the label tells them what it is.
    <div
      role="region"
      aria-labelledby={captionId}
      // jsx-a11y doesn't know a scrollable region needs focus; axe's
      // "scrollable-region-focusable" rule asks for exactly this.
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      className={`overflow-x-auto rounded-lg border border-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`}
    >
      <table className="w-full border-collapse text-sm">
        <caption
          id={captionId}
          className={
            hideCaption
              ? "sr-only"
              : "border-b border-line px-4 py-3 text-left font-semibold"
          }
        >
          {caption}
        </caption>

        <thead>
          <tr className="border-b border-line">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`whitespace-nowrap px-4 py-2.5 text-xs font-medium text-muted ${
                  alignments[column.align] ?? alignments.left
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            // An empty table still says why it's empty (plan: "Empty" state).
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-muted">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row[rowKey]} className="border-b border-line last:border-b-0">
                {columns.map((column) => {
                  const align = alignments[column.align] ?? alignments.left;
                  // The row's "name" cell is a <th scope="row">, so a screen
                  // reader says "Snacks, Amount, $24.00" instead of just "$24.00".
                  return column.key === rowHeader ? (
                    <th key={column.key} scope="row" className={`px-4 py-3 font-medium ${align}`}>
                      {cellValue(column, row)}
                    </th>
                  ) : (
                    <td key={column.key} className={`px-4 py-3 ${align}`}>
                      {cellValue(column, row)}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
