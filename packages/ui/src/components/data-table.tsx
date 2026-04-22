import type { ReactNode } from "react";

type TableColumn<Row> = {
  key: string;
  header: string;
  render: (row: Row) => ReactNode;
};

type DataTableProps<Row> = {
  caption?: string;
  columns: TableColumn<Row>[];
  rows: Row[];
};

export const DataTable = <Row,>({ caption, columns, rows }: DataTableProps<Row>) => (
  <div className="table-frame">
    <table className="data-table">
      {caption ? <caption>{caption}</caption> : null}
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key}>{column.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((column) => (
              <td key={column.key}>{column.render(row)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

