interface DataTableProps {
  headers: string[];
  rows: (string | number)[][];
}

export function DataTable({ headers, rows }: DataTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border border-line">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-canvas">
            {headers.map((h, i) => (
              <th key={i} className="border-b border-line px-3 py-2 text-left font-medium text-ink">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 1 ? "bg-canvas/50" : ""}>
              {row.map((cell, ci) => (
                <td key={ci} className="border-b border-line px-3 py-2 font-mono tnum text-ink">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
