/**
 * exportUtils.js
 * ---------------
 * Client-side export utilities for CSV and Excel (.xlsx).
 *
 * All exports are generated from the CURRENT report data (respects all
 * dashboard filters — student / teacher / subject / date / date-range).
 *
 * ─── CSV Export ──────────────────────────────────────────────────
 * Pure client-side. Generates UTF-8 CSV with BOM from reportData[].
 * Respects current filters. No backend call.
 *
 * ─── Excel Export ────────────────────────────────────────────────
 * Uses ExcelJS (browser bundle) to produce a styled .xlsx workbook.
 * Three sheets:
 *   1. Dashboard Summary  – KPI table with gradient header
 *   2. Attendance Data    – Full report table, frozen headers, alt rows, status colouring
 *   3. Charts             – Screenshots of rendered Recharts charts (via html2canvas)
 *
 * Chart images are real screenshots of the live DOM — they exactly match
 * what is displayed in the dashboard. No fake or static charts.
 *
 * ─── Backend limitations ─────────────────────────────────────────
 * The Flask backend does not support server-side Excel generation.
 * To add true server-generated Excel (with native chart objects) the
 * backend would need:
 *   – Python xlsxwriter or openpyxl[charts]
 *   – A new endpoint: GET /api/export/excel?type=...&filters=...
 * Until then, client-side ExcelJS + html2canvas is the correct approach.
 */

// ─── Dynamic imports (keeps initial bundle lean) ──────────────────
let _ExcelJS = null
const getExcelJS = async () => {
  if (!_ExcelJS) {
    // Use the pre-bundled browser build to avoid Node.js fs/stream deps
    const mod = await import('exceljs/dist/exceljs.min.js')
    _ExcelJS = mod.default ?? mod
  }
  return _ExcelJS
}

// ─── Design constants (match the app's primary palette) ──────────
const C = {
  HEADER_BG  : 'FF1E40AF', // primary-800
  HEADER_FG  : 'FFFFFFFF',
  PRIMARY    : 'FF2563EB', // primary-600
  ACCENT     : 'FF3B82F6', // primary-500
  ALT_ROW    : 'FFEFF6FF', // primary-50
  PRESENT_BG : 'FFD1FAE5',
  PRESENT_FG : 'FF065F46',
  ABSENT_BG  : 'FFFEE2E2',
  ABSENT_FG  : 'FF991B1B',
  BORDER     : 'FFE5E7EB',
  GRAY_TEXT  : 'FF6B7280',
  DARK_TEXT  : 'FF111827',
  SUBHEADER  : 'FF374151',
  SECTION_BG : 'FFF8FAFC',
}

// ─── Helpers ──────────────────────────────────────────────────────
const fmtDate = (raw) => {
  if (!raw) return ''
  const d = new Date(raw)
  return isNaN(d) ? String(raw) : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const cell = (ws, ref) => ws.getCell(ref)

const styleCell = (c, opts = {}) => {
  if (opts.bg)   c.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: opts.bg } }
  if (opts.font) c.font      = opts.font
  if (opts.align)c.alignment = opts.align
  if (opts.border !== false) {
    const b = opts.border || { style: 'thin', color: { argb: C.BORDER } }
    c.border = { top: b, bottom: b, left: b, right: b }
  }
}

const headerFont = (size = 11) => ({ bold: true, color: { argb: C.HEADER_FG }, size, name: 'Calibri' })
const bodyFont   = (bold = false, color = C.DARK_TEXT, size = 10) => ({ bold, color: { argb: color }, size, name: 'Calibri' })

// ─── Derive aggregates from raw rows (mirrors deriveCharts in Reports.jsx) ──
const deriveAggregates = (rows) => {
  if (!rows || rows.length === 0) return null
  let present = 0, absent = 0
  const bySubject = {}, byTeacher = {}

  rows.forEach(r => {
    r.status === 'Present' ? present++ : absent++
    const sub = r.subject || 'Unknown'
    const tch = r.teacher || 'Unknown'
    if (!bySubject[sub]) bySubject[sub] = { Present: 0, Absent: 0 }
    if (!byTeacher[tch]) byTeacher[tch] = { Present: 0, Absent: 0 }
    bySubject[sub][r.status]++
    byTeacher[tch][r.status]++
  })

  return { present, absent, bySubject, byTeacher }
}

// ──────────────────────────────────────────────────────────────────
// CSV EXPORT
// ──────────────────────────────────────────────────────────────────
/**
 * Generate and download a UTF-8 CSV from the current reportData.
 * Respects all active dashboard filters.
 *
 * @param {Array}  reportData  – current filtered rows
 * @param {string} reportTitle – used for filename
 */
export const exportToCsv = (reportData, reportTitle = 'Attendance_Report') => {
  if (!reportData || reportData.length === 0) return

  const keys          = [...new Set(reportData.flatMap(Object.keys))]
  const friendlyLabel = {
    attendance_date : 'Date',
    student         : 'Student',
    student_name    : 'Student',
    subject         : 'Subject',
    teacher         : 'Teacher',
    status          : 'Status',
  }

  const escape = (v) => {
    const s = String(v)
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }

  const header = keys.map(k => escape(friendlyLabel[k] || k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))).join(',')
  const rows   = reportData.map(row =>
    keys.map(k => {
      const v = row[k] ?? ''
      return escape(k === 'attendance_date' ? fmtDate(v) : v)
    }).join(',')
  )

  const csv  = '\uFEFF' + [header, ...rows].join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), {
    href     : url,
    download : `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`,
  })
  a.click()
  URL.revokeObjectURL(url)
}

// ──────────────────────────────────────────────────────────────────
// CHART SCREENSHOT CAPTURE (html2canvas)
// ──────────────────────────────────────────────────────────────────
/**
 * Captures an array of DOM elements as PNG data-URLs.
 * Each element must have a `data-chart-title` attribute for labelling.
 *
 * @param {HTMLElement[]} elements – chart container DOM nodes
 * @returns {Promise<{title, dataUrl, width, height}[]>}
 */
export const captureChartImages = async (elements) => {
  const { default: html2canvas } = await import('html2canvas')
  const results = []

  for (const el of elements) {
    if (!el) continue
    try {
      const canvas = await html2canvas(el, {
        backgroundColor : '#ffffff',
        scale           : 2,          // retina quality
        useCORS         : true,
        logging         : false,
        allowTaint      : true,
      })
      results.push({
        title   : el.dataset.chartTitle || 'Chart',
        dataUrl : canvas.toDataURL('image/png'),
        width   : el.offsetWidth,
        height  : el.offsetHeight,
      })
    } catch (err) {
      console.warn(`Chart capture failed: ${el.dataset.chartTitle}`, err)
    }
  }
  return results
}

// ──────────────────────────────────────────────────────────────────
// EXCEL EXPORT
// ──────────────────────────────────────────────────────────────────
/**
 * Generate and download a styled .xlsx workbook.
 *
 * @param {object} opts
 *   kpi         – dashboard KPI object from GET /api/dashboard
 *   reportData  – current filtered report rows []
 *   reportTitle – label used in headers and filename
 *   chartImages – [{title, dataUrl, width, height}] from captureChartImages()
 */
export const exportToExcel = async ({ kpi, reportData, reportTitle, chartImages }) => {
  const ExcelJS = await getExcelJS()
  const wb      = new ExcelJS.Workbook()

  wb.creator     = 'Attendance System'
  wb.company     = 'Attendance System'
  wb.created     = new Date()
  wb.modified    = new Date()
  wb.lastModifiedBy = 'Attendance System'

  const generatedAt = new Date().toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  // ════════════════════════════════════════════════════════════════
  // SHEET 1: Dashboard Summary
  // ════════════════════════════════════════════════════════════════
  const ws1 = wb.addWorksheet('Dashboard Summary', { views: [{ showGridLines: false }] })

  // — Title block —
  ws1.mergeCells('A1:E1')
  const t1 = cell(ws1, 'A1')
  t1.value = '📊  ATTENDANCE SYSTEM  —  DASHBOARD SUMMARY'
  t1.font  = headerFont(16)
  t1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.HEADER_BG } }
  t1.alignment = { horizontal: 'center', vertical: 'middle' }
  ws1.getRow(1).height = 48

  ws1.mergeCells('A2:E2')
  const t2 = cell(ws1, 'A2')
  t2.value = `Report Generated: ${generatedAt}`
  t2.font  = { italic: true, size: 10, color: { argb: C.GRAY_TEXT }, name: 'Calibri' }
  t2.alignment = { horizontal: 'center', vertical: 'middle' }
  ws1.getRow(2).height = 22

  ws1.addRow([]) // spacer

  // — Section: Institution Overview —
  ws1.mergeCells('A4:E4')
  const sh1 = cell(ws1, 'A4')
  sh1.value = 'INSTITUTION OVERVIEW'
  sh1.font  = { bold: true, size: 11, color: { argb: C.HEADER_FG }, name: 'Calibri' }
  sh1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.PRIMARY } }
  sh1.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
  ws1.getRow(4).height = 26

  const overview = [
    ['Total Students',    kpi?.total_students  ?? 0, 'students enrolled in the system'],
    ['Total Teachers',    kpi?.total_teachers  ?? 0, 'active teaching staff'],
    ['Total Subjects',    kpi?.total_subjects  ?? 0, 'subjects being tracked'],
    ['Total Classes',     kpi?.total_classes   ?? 0, 'class sections registered'],
  ]

  overview.forEach(([label, val, note], i) => {
    const r   = ws1.addRow([label, val, note])
    const isAlt = i % 2 === 0
    const bgColor = isAlt ? C.ALT_ROW : 'FFFFFFFF'

    r.getCell(1).font  = bodyFont(true, C.SUBHEADER)
    r.getCell(1).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } }
    r.getCell(2).font  = { bold: true, size: 16, color: { argb: C.PRIMARY }, name: 'Calibri' }
    r.getCell(2).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } }
    r.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' }
    r.getCell(3).font  = bodyFont(false, C.GRAY_TEXT, 9)
    r.getCell(3).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } }
    r.eachCell(c => {
      c.border = { top: { style: 'thin', color: { argb: C.BORDER } }, bottom: { style: 'thin', color: { argb: C.BORDER } }, left: { style: 'thin', color: { argb: C.BORDER } }, right: { style: 'thin', color: { argb: C.BORDER } } }
      c.alignment = c.alignment ?? { vertical: 'middle', indent: 1 }
    })
    r.height = 32
  })

  ws1.addRow([]) // spacer

  // — Section: Today's Attendance —
  const todayRow = ws1.addRow([])
  ws1.mergeCells(`A${todayRow.number}:E${todayRow.number}`)
  const sh2 = cell(ws1, `A${todayRow.number}`)
  sh2.value = "TODAY'S ATTENDANCE"
  sh2.font  = headerFont(11)
  sh2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.HEADER_BG } }
  sh2.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
  ws1.getRow(todayRow.number).height = 26

  const pct     = kpi?.today_attendance ? Math.round((kpi.present_today / kpi.today_attendance) * 100) : 0
  const todayStats = [
    ["Total Records Today",  kpi?.today_attendance ?? 0, '—'],
    ["Present Today",        kpi?.present_today    ?? 0, `${pct}% attendance rate`],
    ["Absent Today",         kpi?.absent_today     ?? 0, `${kpi?.today_attendance ? Math.round((kpi.absent_today / kpi.today_attendance) * 100) : 0}% absence rate`],
    ["Attendance Rate",      `${pct}%`,                  pct >= 75 ? '✔ Meets attendance threshold' : '⚠ Below 75% threshold'],
  ]

  todayStats.forEach(([label, val, note], i) => {
    const r     = ws1.addRow([label, val, note])
    const isAlt = i % 2 === 0
    const fgC   = i === 1 ? C.PRESENT_FG : i === 2 ? C.ABSENT_FG : C.PRIMARY
    const bgC   = i === 1 ? C.PRESENT_BG : i === 2 ? C.ABSENT_BG : isAlt ? C.ALT_ROW : 'FFFFFFFF'

    r.getCell(1).font = bodyFont(true, C.SUBHEADER)
    r.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgC } }
    r.getCell(2).font = { bold: true, size: 16, color: { argb: fgC }, name: 'Calibri' }
    r.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgC } }
    r.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' }
    r.getCell(3).font = bodyFont(false, C.GRAY_TEXT, 9)
    r.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgC } }
    r.eachCell(c => {
      if (!c.alignment) c.alignment = { vertical: 'middle', indent: 1 }
      c.border = { top: { style: 'thin', color: { argb: C.BORDER } }, bottom: { style: 'thin', color: { argb: C.BORDER } }, left: { style: 'thin', color: { argb: C.BORDER } }, right: { style: 'thin', color: { argb: C.BORDER } } }
    })
    r.height = 32
  })

  ws1.addRow([])

  // — Current Report summary —
  if (reportData && reportData.length > 0) {
    const agg    = deriveAggregates(reportData)
    const rpct   = reportData.length ? Math.round((agg.present / reportData.length) * 100) : 0
    const crRow  = ws1.addRow([])
    ws1.mergeCells(`A${crRow.number}:E${crRow.number}`)
    const sh3 = cell(ws1, `A${crRow.number}`)
    sh3.value = 'CURRENT REPORT SUMMARY'
    sh3.font  = headerFont(11)
    sh3.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } }
    sh3.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
    ws1.getRow(crRow.number).height = 26

    const rpData = [
      ['Report Title',       reportTitle,        ''],
      ['Total Records',      reportData.length,  'filtered records in this report'],
      ['Present Count',      agg.present,        `${rpct}% of records`],
      ['Absent Count',       agg.absent,         `${100 - rpct}% of records`],
      ['Attendance Rate',    `${rpct}%`,         rpct >= 75 ? '✔ Good' : '⚠ Needs attention'],
    ]

    rpData.forEach(([label, val, note], i) => {
      const r   = ws1.addRow([label, val, note])
      const isA = i % 2 === 0
      r.getCell(1).font = bodyFont(true, C.SUBHEADER)
      r.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isA ? 'FFEEF2FF' : 'FFFFFFFF' } }
      r.getCell(2).font = { bold: true, size: 13, color: { argb: '4F46E5' }, name: 'Calibri' }
      r.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isA ? 'FFEEF2FF' : 'FFFFFFFF' } }
      r.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' }
      r.getCell(3).font = bodyFont(false, C.GRAY_TEXT, 9)
      r.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isA ? 'FFEEF2FF' : 'FFFFFFFF' } }
      r.eachCell(c => {
        if (!c.alignment) c.alignment = { vertical: 'middle', indent: 1 }
        c.border = { top: { style: 'thin', color: { argb: C.BORDER } }, bottom: { style: 'thin', color: { argb: C.BORDER } }, left: { style: 'thin', color: { argb: C.BORDER } }, right: { style: 'thin', color: { argb: C.BORDER } } }
      })
      r.height = 28
    })
  }

  ws1.getColumn(1).width = 28
  ws1.getColumn(2).width = 18
  ws1.getColumn(3).width = 38
  ws1.getColumn(4).width = 5
  ws1.getColumn(5).width = 5

  // ════════════════════════════════════════════════════════════════
  // SHEET 2: Attendance Data
  // ════════════════════════════════════════════════════════════════
  const ws2 = wb.addWorksheet('Attendance Data', {
    views: [{ state: 'frozen', ySplit: 3, showGridLines: false }],
  })

  // Sheet title
  const st2a = ws2.addRow([`${reportTitle}  —  Attendance Data`])
  const stC  = st2a.getCell(1)
  stC.font   = headerFont(14)
  stC.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.HEADER_BG } }
  stC.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
  st2a.height = 38

  const st2b = ws2.addRow([`Generated: ${generatedAt}   |   Total records: ${reportData?.length ?? 0}`])
  const stC2 = st2b.getCell(1)
  stC2.font   = { italic: true, size: 9, color: { argb: C.GRAY_TEXT }, name: 'Calibri' }
  stC2.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.SECTION_BG } }
  stC2.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
  st2b.height = 18

  if (!reportData || reportData.length === 0) {
    ws2.addRow(['No data available for the current filter selection.'])
  } else {
    const friendlyLabel = {
      attendance_date : 'Date',
      student         : 'Student',
      student_name    : 'Student',
      subject         : 'Subject',
      teacher         : 'Teacher',
      status          : 'Status',
    }
    const keys = [...new Set(reportData.flatMap(Object.keys))]
    const labels = keys.map(k => friendlyLabel[k] || k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))

    // Header row
    const hRow = ws2.addRow(labels)
    hRow.height = 28
    hRow.eachCell((c, i) => {
      c.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.HEADER_BG } }
      c.font      = { bold: true, size: 11, color: { argb: C.HEADER_FG }, name: 'Calibri' }
      c.alignment = { horizontal: 'center', vertical: 'middle' }
      c.border    = { top: { style: 'medium', color: { argb: C.ACCENT } }, bottom: { style: 'medium', color: { argb: C.ACCENT } }, left: { style: 'thin', color: { argb: 'FF93C5FD' } }, right: { style: 'thin', color: { argb: 'FF93C5FD' } } }
    })

    // Enable autofilter on header
    ws2.autoFilter = { from: { row: hRow.number, column: 1 }, to: { row: hRow.number, column: keys.length } }

    // Data rows
    reportData.forEach((row, idx) => {
      const values = keys.map(k => {
        const v = row[k] ?? ''
        return k === 'attendance_date' ? fmtDate(v) : String(v)
      })
      const r   = ws2.addRow(values)
      const isA = idx % 2 === 1
      r.height  = 22

      r.eachCell((c, colIdx) => {
        const k = keys[colIdx - 1]
        if (k === 'status') {
          const isP = row[k] === 'Present'
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isP ? C.PRESENT_BG : C.ABSENT_BG } }
          c.font = { bold: true, size: 10, color: { argb: isP ? C.PRESENT_FG : C.ABSENT_FG }, name: 'Calibri' }
          c.alignment = { horizontal: 'center', vertical: 'middle' }
        } else {
          c.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: isA ? C.ALT_ROW : 'FFFFFFFF' } }
          c.font      = bodyFont(false)
          c.alignment = { vertical: 'middle', indent: 1 }
        }
        c.border = { top: { style: 'thin', color: { argb: C.BORDER } }, bottom: { style: 'thin', color: { argb: C.BORDER } }, left: { style: 'thin', color: { argb: C.BORDER } }, right: { style: 'thin', color: { argb: C.BORDER } } }
      })
    })

    // Summary footer
    const agg  = deriveAggregates(reportData)
    const rpct = reportData.length ? Math.round((agg.present / reportData.length) * 100) : 0
    ws2.addRow([])
    const fRow = ws2.addRow([
      `Total: ${reportData.length} records`,
      `Present: ${agg.present} (${rpct}%)`,
      `Absent: ${agg.absent} (${100-rpct}%)`,
      ...(keys.length > 3 ? Array(keys.length - 3).fill('') : []),
    ])
    fRow.height = 24
    fRow.eachCell(c => {
      c.font = { bold: true, size: 10, color: { argb: C.PRIMARY }, name: 'Calibri' }
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.ALT_ROW } }
      c.border = { top: { style: 'medium', color: { argb: C.ACCENT } }, bottom: { style: 'medium', color: { argb: C.ACCENT } }, left: { style: 'thin', color: { argb: C.BORDER } }, right: { style: 'thin', color: { argb: C.BORDER } } }
      c.alignment = { vertical: 'middle', indent: 1 }
    })

    // Auto-column widths
    ws2.columns.forEach((col, i) => {
      const k      = keys[i]
      const header = labels[i]
      const maxLen = Math.max(
        header.length,
        ...reportData.map(r => String(r[k] ?? '').length)
      )
      col.width = Math.min(Math.max(maxLen + 4, 12), 45)
    })
  }

  // ════════════════════════════════════════════════════════════════
  // SHEET 3: Charts (embedded html2canvas screenshots)
  // ════════════════════════════════════════════════════════════════
  const ws3 = wb.addWorksheet('Charts', { views: [{ showGridLines: false }] })

  // Sheet title
  ws3.mergeCells('A1:L1')
  const ct1 = cell(ws3, 'A1')
  ct1.value = `📈  ${reportTitle}  —  Visual Analytics`
  ct1.font  = headerFont(15)
  ct1.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.HEADER_BG } }
  ct1.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
  ws3.getRow(1).height = 42

  ws3.mergeCells('A2:L2')
  const ct2 = cell(ws3, 'A2')
  ct2.value = `These charts are live screenshots of the Analytics Dashboard — they exactly match what is displayed on screen.   Generated: ${generatedAt}`
  ct2.font  = { italic: true, size: 9, color: { argb: C.GRAY_TEXT }, name: 'Calibri' }
  ct2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.SECTION_BG } }
  ct2.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
  ws3.getRow(2).height = 18

  if (!chartImages || chartImages.length === 0) {
    ws3.addRow([])
    const noData = ws3.addRow(['  ⚠  No chart images were captured. Run a report and ensure charts are visible before exporting.'])
    noData.getCell(1).font = bodyFont(false, C.GRAY_TEXT)
  } else {
    // Each chart is laid out in a 2-column grid
    const CHART_START_ROW    = 4
    const ROWS_PER_PX        = 0.75  // ExcelJS row height ~= 0.75px
    const CHART_GAP_ROWS     = 3
    const COL_CHART_WIDTH_PX = 600   // target embed width in pixels

    let currentRow = CHART_START_ROW

    for (let idx = 0; idx < chartImages.length; idx++) {
      const { title, dataUrl, width, height } = chartImages[idx]
      if (!dataUrl) continue

      const base64   = dataUrl.replace(/^data:image\/png;base64,/, '')
      const imageId  = wb.addImage({ base64, extension: 'png' })

      // Scale to target width preserving aspect ratio
      const scale    = COL_CHART_WIDTH_PX / Math.max(width, 1)
      const embedW   = Math.round(width  * scale)
      const embedH   = Math.round(height * scale)
      const rowsNeeded = Math.ceil(embedH * ROWS_PER_PX / 20) + 1

      // Chart label row
      const lRow = ws3.addRow([`  ${title}`])
      lRow.getCell(1).font      = { bold: true, size: 11, color: { argb: C.HEADER_BG }, name: 'Calibri' }
      lRow.getCell(1).fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.ALT_ROW } }
      lRow.getCell(1).alignment = { vertical: 'middle', indent: 1 }
      lRow.height               = 22
      currentRow                = lRow.number + 1

      // Embed image
      ws3.addImage(imageId, {
        tl  : { col: 0, row: currentRow - 1 },
        ext : { width: embedW, height: embedH },
      })

      // Add enough rows to make room for the image
      for (let r = 0; r < rowsNeeded; r++) {
        const rr = ws3.addRow([])
        rr.height = 20
      }
      currentRow += rowsNeeded

      // Gap between charts
      for (let g = 0; g < CHART_GAP_ROWS; g++) {
        ws3.addRow([])
        currentRow++
      }
    }
  }

  // Column widths for Charts sheet
  for (let i = 1; i <= 12; i++) ws3.getColumn(i).width = 10
  ws3.getColumn(1).width = 80 // wide first column holds chart images

  // ════════════════════════════════════════════════════════════════
  // Write & download
  // ════════════════════════════════════════════════════════════════
  const buffer = await wb.xlsx.writeBuffer()
  const blob   = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  const { saveAs } = await import('file-saver')
  saveAs(blob, `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`)
}
