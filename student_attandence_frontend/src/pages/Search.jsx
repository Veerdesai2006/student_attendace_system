/**
 * Search.jsx
 * -----------
 * Phase 8 – Search Module
 *
 * Provides four independent search cards:
 *   1. Search Students by Name      → GET /students?search=<name>
 *   2. Search Students by Roll No.  → GET /students?roll_number=<roll>
 *   3. Search Teachers              → GET /teachers?search=<name>
 *   4. Search Subjects              → GET /subjects?search=<name>
 *
 * Rules:
 *   • No hardcoded/dummy data – all results come from the Flask backend.
 *   • Uses only confirmed, existing endpoints (probed live).
 *   • Backend field names are used exactly as returned.
 *   • Reuses Table, Loader components.
 *   • addToast prop used for error notifications.
 */

import { useState, useCallback, useRef } from 'react'
import Table          from '../components/Table'
import Loader         from '../components/Loader'
import searchService  from '../services/searchService'

// ─── Column definitions (exact backend field names) ──────────────
// NOTE: The two student search endpoints return different field sets:
//   /search/student/name/<name> → includes contact_number, email
//   /search/student/roll/<roll> → does NOT include contact_number, email

/** Columns for student-by-name search (full details returned) */
const STUDENT_NAME_COLUMNS = [
  { key: 'student_id',     label: 'ID' },
  { key: 'roll_number',    label: 'Roll No.' },
  {
    key: 'student_name',
    label: 'Student Name',
    render: (row) => `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim() || '—',
  },
  { key: 'class_name',     label: 'Class' },
  { key: 'division',       label: 'Division' },
  { key: 'contact_number', label: 'Contact' },
  { key: 'email',          label: 'Email' },
]

/** Columns for student-by-roll search (contact_number & email not returned by backend) */
const STUDENT_ROLL_COLUMNS = [
  { key: 'student_id',  label: 'ID' },
  { key: 'roll_number', label: 'Roll No.' },
  {
    key: 'student_name',
    label: 'Student Name',
    render: (row) => `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim() || '—',
  },
  { key: 'class_name', label: 'Class' },
  { key: 'division',   label: 'Division' },
]

const TEACHER_COLUMNS = [
  { key: 'teacher_id', label: 'ID' },
  {
    key: 'teacher_name',
    label: 'Teacher Name',
    render: (row) => `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim() || '—',
  },
  { key: 'contact', label: 'Contact' },
  { key: 'email',   label: 'Email' },
]

const SUBJECT_COLUMNS = [
  { key: 'subject_id',   label: 'ID' },
  { key: 'subject_name', label: 'Subject Name' },
  { key: 'subject_code', label: 'Subject Code' },
]

// ─── Search card icons ────────────────────────────────────────────

const icons = {
  student: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  roll: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
    </svg>
  ),
  teacher: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  subject: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  search: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  reset: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
}

// ─── Colour accent map per card ──────────────────────────────────
const accentMap = {
  student: {
    header: 'from-primary-600 to-primary-700',
    badge:  'bg-primary-100 text-primary-700',
    ring:   'focus:ring-primary-200 focus:border-primary-500',
    btn:    'bg-primary-600 hover:bg-primary-700 active:bg-primary-800',
  },
  roll: {
    header: 'from-violet-600 to-violet-700',
    badge:  'bg-violet-100 text-violet-700',
    ring:   'focus:ring-violet-200 focus:border-violet-500',
    btn:    'bg-violet-600 hover:bg-violet-700 active:bg-violet-800',
  },
  teacher: {
    header: 'from-emerald-600 to-emerald-700',
    badge:  'bg-emerald-100 text-emerald-700',
    ring:   'focus:ring-emerald-200 focus:border-emerald-500',
    btn:    'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800',
  },
  subject: {
    header: 'from-amber-500 to-amber-600',
    badge:  'bg-amber-100 text-amber-700',
    ring:   'focus:ring-amber-200 focus:border-amber-500',
    btn:    'bg-amber-500 hover:bg-amber-600 active:bg-amber-700',
  },
}

// ─── useSearchCard hook – encapsulates all state for one search card ─

/**
 * @param {Function} apiFn      – the searchService function to call
 * @param {Function} addToast   – toast callback
 */
const useSearchCard = (apiFn, addToast) => {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState(null)   // null = not yet searched
  const [loading, setLoading] = useState(false)
  const inputRef              = useRef(null)

  const handleSearch = useCallback(async () => {
    const trimmed = query.trim()
    if (!trimmed) {
      inputRef.current?.focus()
      return
    }
    setLoading(true)
    try {
      const res = await apiFn(trimmed)
      setResults(res.data)
    } catch (err) {
      // Show backend message; only fall back to generic if server is unreachable
      const msg = err.message || 'An unexpected error occurred.'
      addToast(msg, 'error')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [query, apiFn, addToast])

  const handleReset = useCallback(() => {
    setQuery('')
    setResults(null)
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = useCallback(
    (e) => { if (e.key === 'Enter') handleSearch() },
    [handleSearch]
  )

  return { query, setQuery, results, loading, inputRef, handleSearch, handleReset, handleKeyDown }
}

// ─── SearchCard component ─────────────────────────────────────────

/**
 * A self-contained search card with input, buttons, and results table.
 *
 * Props:
 *   id          {string}  – unique HTML id prefix for the card
 *   accent      {string}  – key into accentMap
 *   icon        {JSX}
 *   title       {string}
 *   subtitle    {string}
 *   placeholder {string}
 *   label       {string}  – input label
 *   columns     {Array}   – Table column definitions
 *   hook        {object}  – from useSearchCard()
 */
const SearchCard = ({
  id,
  accent,
  icon,
  title,
  subtitle,
  placeholder,
  label,
  columns,
  hook,
}) => {
  const { query, setQuery, results, loading, inputRef, handleSearch, handleReset, handleKeyDown } = hook
  const ac = accentMap[accent]

  return (
    <div id={`search-card-${id}`} className="card overflow-hidden">
      {/* Card header */}
      <div className={`bg-gradient-to-r ${ac.header} px-6 py-4 flex items-center gap-3`}>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-white">
          {icon}
        </div>
        <div>
          <h2 className="text-base font-semibold text-white leading-tight">{title}</h2>
          <p className="text-xs text-white/70 mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Search controls */}
      <div className="px-6 py-4 border-b border-gray-100">
        <label htmlFor={`input-${id}`} className="label">{label}</label>
        <div className="flex flex-col sm:flex-row gap-2 mt-1">
          <input
            id={`input-${id}`}
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder={placeholder}
            autoComplete="off"
            className={`input flex-1 ${ac.ring}`}
            aria-label={label}
          />
          <div className="flex gap-2 shrink-0">
            <button
              id={`btn-search-${id}`}
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className={`inline-flex items-center gap-2 ${ac.btn} text-white
                          px-4 py-2 rounded-lg font-medium text-sm
                          disabled:opacity-50 disabled:cursor-not-allowed
                          transition-colors duration-150`}
              aria-label={`Search ${title}`}
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : icons.search}
              Search
            </button>
            <button
              id={`btn-reset-${id}`}
              onClick={handleReset}
              disabled={loading}
              className="btn-secondary"
              aria-label={`Reset ${title} search`}
            >
              {icons.reset}
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Results area */}
      <div className="p-6">
        {/* Not yet searched */}
        {results === null && !loading && (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${ac.badge} mb-3`}>
              {icon}
            </div>
            <p className="text-sm">Enter a search term and press <strong>Search</strong> or <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs font-mono">Enter</kbd></p>
          </div>
        )}

        {/* Loading spinner */}
        {loading && <Loader />}

        {/* No results */}
        {!loading && results !== null && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <svg className="h-10 w-10 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-gray-500">No records found.</p>
            <p className="text-xs text-gray-400 mt-1">Try a different search term.</p>
          </div>
        )}

        {/* Results table */}
        {!loading && results !== null && results.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500">
                Showing <span className={`font-semibold ${ac.badge.split(' ')[1]} px-1.5 py-0.5 rounded-full`}>{results.length}</span> result{results.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Table
              columns={columns}
              data={results}
              loading={false}
              emptyMsg="No records found."
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Search page ──────────────────────────────────────────────────

const Search = ({ addToast }) => {
  // One hook per search card
  const studentNameHook = useSearchCard(searchService.searchStudentsByName, addToast)
  const studentRollHook = useSearchCard(searchService.searchStudentsByRoll, addToast)
  const teacherHook     = useSearchCard(searchService.searchTeachers,       addToast)
  const subjectHook     = useSearchCard(searchService.searchSubjects,       addToast)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white shrink-0">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div>
          <h1 className="page-title">Search</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Find students, teachers, and subjects across the attendance system.
          </p>
        </div>
      </div>

      {/* Quick-tip banner */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
        <svg className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
        <p className="text-sm text-blue-700">
          Type your query and press <strong>Search</strong> or hit <kbd className="px-1 py-0.5 bg-blue-100 border border-blue-300 rounded text-xs font-mono">Enter</kbd>.
          Use the <strong>Reset</strong> button to clear a card.
        </p>
      </div>

      {/* 2-column grid on wider screens, single column on mobile */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Card 1 – Search Students by Name */}
        <SearchCard
          id="student-name"
          accent="student"
          icon={icons.student}
          title="Search by Student Name"
          subtitle="Find students using their first or last name"
          placeholder="e.g. Veer, Desai…"
          label="Student Name"
          columns={STUDENT_NAME_COLUMNS}
          hook={studentNameHook}
        />

        {/* Card 2 – Search Students by Roll Number */}
        <SearchCard
          id="student-roll"
          accent="roll"
          icon={icons.roll}
          title="Search by Roll Number"
          subtitle="Look up a student using their exact roll number"
          placeholder="e.g. 506"
          label="Roll Number"
          columns={STUDENT_ROLL_COLUMNS}
          hook={studentRollHook}
        />

        {/* Card 3 – Search Teachers */}
        <SearchCard
          id="teacher"
          accent="teacher"
          icon={icons.teacher}
          title="Search Teachers"
          subtitle="Find teachers by first or last name"
          placeholder="e.g. Rakesh, Sharma…"
          label="Teacher Name"
          columns={TEACHER_COLUMNS}
          hook={teacherHook}
        />

        {/* Card 4 – Search Subjects */}
        <SearchCard
          id="subject"
          accent="subject"
          icon={icons.subject}
          title="Search Subjects"
          subtitle="Find subjects by name"
          placeholder="e.g. Machine Learning, Cloud…"
          label="Subject Name"
          columns={SUBJECT_COLUMNS}
          hook={subjectHook}
        />
      </div>
    </div>
  )
}

export default Search
