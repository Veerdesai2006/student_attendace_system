--
-- PostgreSQL database dump
--

\restrict 0pTkGzoCztdKcz9v5SwkYYnYkxL8uShuKXTSM05WkrWJEaspmBvbf2E2djPp51Z

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

-- Started on 2026-07-17 12:44:05

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5067 (class 0 OID 16478)
-- Dependencies: 228
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendance (attendance_id, student_id, subject_id, teacher_id, attendance_date, status) FROM stdin;
2	1	1	1	2026-07-16	Absent
\.


--
-- TOC entry 5059 (class 0 OID 16414)
-- Dependencies: 220
-- Data for Name: class; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.class (class_id, class_name, division) FROM stdin;
1	Computer science	A
3	CSE 4	B
\.


--
-- TOC entry 5065 (class 0 OID 16454)
-- Dependencies: 226
-- Data for Name: student; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student (student_id, roll_number, first_name, last_name, contact_number, email, class_id) FROM stdin;
3	5566	sasds	asds	5548484262	dsdsadsa@gmaill.com	\N
4	660	xssc	cdscdsc	9688778895	cdcsc@gmail.com	\N
1	506	Veer	Desai	9688778896	veer@gmail.com	3
\.


--
-- TOC entry 5061 (class 0 OID 16426)
-- Dependencies: 222
-- Data for Name: subject; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subject (subject_id, subject_name, subject_code) FROM stdin;
2	Cloud Computing	CC101
1	Machine Learning	ML101
\.


--
-- TOC entry 5063 (class 0 OID 16438)
-- Dependencies: 224
-- Data for Name: teacher; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teacher (teacher_id, first_name, last_name, contact, email) FROM stdin;
2	Rakesh	Patel	9999999999	rakesh@gmail.com
1	Rakesh	Sharma	8888888888	rakeshsharma@gmail.com
\.


--
-- TOC entry 5078 (class 0 OID 0)
-- Dependencies: 227
-- Name: attendance_attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attendance_attendance_id_seq', 4, true);


--
-- TOC entry 5079 (class 0 OID 0)
-- Dependencies: 219
-- Name: class_class_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.class_class_id_seq', 4, true);


--
-- TOC entry 5080 (class 0 OID 0)
-- Dependencies: 225
-- Name: student_student_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_student_id_seq', 7, true);


--
-- TOC entry 5081 (class 0 OID 0)
-- Dependencies: 221
-- Name: subject_subject_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subject_subject_id_seq', 3, true);


--
-- TOC entry 5082 (class 0 OID 0)
-- Dependencies: 223
-- Name: teacher_teacher_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.teacher_teacher_id_seq', 3, true);


-- Completed on 2026-07-17 12:44:05

--
-- PostgreSQL database dump complete
--

\unrestrict 0pTkGzoCztdKcz9v5SwkYYnYkxL8uShuKXTSM05WkrWJEaspmBvbf2E2djPp51Z

