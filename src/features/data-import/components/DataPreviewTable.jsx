export function DataPreviewTable({ parsedData }) {
  if (!parsedData?.headers?.length) return null;

  return (
    <div className="mt-3 w-full bg-gray-50 border border-gray-200 rounded-xl p-3 max-h-48 overflow-auto">
      <p className="text-xs font-semibold text-gray-600 mb-2">
        Data Preview (first 3 rows)
      </p>

      <div className="w-full overflow-x-auto">
        <table className="w-max min-w-full text-xs">
          <thead>
            <tr>
              {parsedData.headers.map((h, i) => (
                <th
                  key={i}
                  className="text-left py-2 px-3 text-gray-500 font-medium whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {parsedData.rows.slice(0, 3).map((row, i) => (
              <tr key={i} className="border-t border-gray-200">
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className="py-2 px-3 text-gray-700 whitespace-nowrap"
                  >
                    {cell || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}