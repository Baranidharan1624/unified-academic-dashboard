import './ui.css';

function GlassTable({ columns, data, onRowClick }) {
  return (
    <div className="table-container">
      <table className="glass-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} onClick={() => onRowClick && onRowClick(row)}>
              {columns.map((col) => (
                <td key={col.key}>{row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GlassTable;
