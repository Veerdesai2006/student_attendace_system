/**
 * Table.jsx
 * ----------
 * Generic, reusable data table.
 *
 * Props:
 *   columns  {Array}  – array of { key, label, render? } objects
 *                        render(row) is an optional custom cell renderer
 *   data     {Array}  – array of row objects
 *   loading  {boolean}
 *   emptyMsg {string} – shown when data is empty (default: 'No records found.')
 */
import Loader from './Loader'

const Table = ({ columns = [], data = [], loading = false, emptyMsg = 'No records found.' }) => {
  if (loading) return <Loader />

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        {/* Head */}
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-gray-100 bg-white">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-gray-400"
              >
                {emptyMsg}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              // Backend uses named PKs (student_id, class_id, etc.) – never generic "id"
              const rowKey =
                row.student_id    ??
                row.class_id      ??
                row.subject_id    ??
                row.teacher_id    ??
                row.attendance_id ??
                rowIndex
              return (
                <tr
                  key={rowKey}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-gray-800 whitespace-nowrap">
                      {col.render ? col.render(row) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Table
