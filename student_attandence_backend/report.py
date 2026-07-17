from database import connect_database


def get_student_report(student_id):

    connection = None
    cursor = None

    try:

        connection = connect_database()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                s.first_name,
                s.last_name,
                sub.subject_name,
                t.first_name,
                t.last_name,
                a.attendance_date,
                a.status
            FROM attendance a
            JOIN student s
            ON a.student_id = s.student_id
            JOIN subject sub
            ON a.subject_id = sub.subject_id
            JOIN teacher t
            ON a.teacher_id = t.teacher_id
            WHERE a.student_id = %s
            ORDER BY a.attendance_date
            """,
            (student_id,)
        )

        rows = cursor.fetchall()

        return [
            {
                "student_name": f"{row[0]} {row[1]}",
                "subject": row[2],
                "teacher": f"{row[3]} {row[4]}",
                "attendance_date": row[5],
                "status": row[6]
            }
            for row in rows
        ]

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


def get_subject_report(subject_id):

    connection = None
    cursor = None

    try:

        connection = connect_database()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                sub.subject_name,
                s.first_name,
                s.last_name,
                t.first_name,
                t.last_name,
                a.attendance_date,
                a.status
            FROM attendance a
            JOIN student s
            ON a.student_id = s.student_id
            JOIN subject sub
            ON a.subject_id = sub.subject_id
            JOIN teacher t
            ON a.teacher_id = t.teacher_id
            WHERE a.subject_id = %s
            ORDER BY a.attendance_date
            """,
            (subject_id,)
        )

        rows = cursor.fetchall()

        return [
            {
                "subject": row[0],
                "student": f"{row[1]} {row[2]}",
                "teacher": f"{row[3]} {row[4]}",
                "attendance_date": row[5],
                "status": row[6]
            }
            for row in rows
        ]

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


def get_teacher_report(teacher_id):

    connection = None
    cursor = None

    try:

        connection = connect_database()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                t.first_name,
                t.last_name,
                s.first_name,
                s.last_name,
                sub.subject_name,
                a.attendance_date,
                a.status
            FROM attendance a
            JOIN student s
            ON a.student_id = s.student_id
            JOIN subject sub
            ON a.subject_id = sub.subject_id
            JOIN teacher t
            ON a.teacher_id = t.teacher_id
            WHERE a.teacher_id = %s
            ORDER BY a.attendance_date
            """,
            (teacher_id,)
        )

        rows = cursor.fetchall()

        return [
            {
                "teacher": f"{row[0]} {row[1]}",
                "student": f"{row[2]} {row[3]}",
                "subject": row[4],
                "attendance_date": row[5],
                "status": row[6]
            }
            for row in rows
        ]

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


def student_report():

    connection = None
    cursor = None

    try:

        connection = connect_database()
        cursor = connection.cursor()

        student_id = int(input("Enter Student ID: "))

        cursor.execute(
            """
            SELECT

                s.first_name,
                s.last_name,

                sub.subject_name,

                t.first_name,
                t.last_name,

                a.attendance_date,
                a.status

            FROM attendance a

            JOIN student s
            ON a.student_id = s.student_id

            JOIN subject sub
            ON a.subject_id = sub.subject_id

            JOIN teacher t
            ON a.teacher_id = t.teacher_id

            WHERE a.student_id = %s

            ORDER BY a.attendance_date
            """,
            (student_id,)
        )

        records = cursor.fetchall()

        if not records:
            print("No attendance records found.")
            return

        print("\n========== STUDENT ATTENDANCE REPORT ==========")
        print(f"Student : {records[0][0]} {records[0][1]}")
        print("-" * 70)
        print("Date\t\tSubject\t\tTeacher\t\tStatus")
        print("-" * 70)

        for row in records:

            print(
                f"{row[5]}\t"
                f"{row[2]}\t\t"
                f"{row[3]} {row[4]}\t"
                f"{row[6]}"
            )

    except Exception as e:

        print(f"An error occurred: {e}")

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()
def subject_report():

    connection = None
    cursor = None

    try:

        connection = connect_database()
        cursor = connection.cursor()

        subject_id = int(input("Enter Subject ID: "))

        cursor.execute(
            """
            SELECT

                sub.subject_name,

                s.first_name,
                s.last_name,

                t.first_name,
                t.last_name,

                a.attendance_date,
                a.status

            FROM attendance a

            JOIN student s
            ON a.student_id = s.student_id

            JOIN subject sub
            ON a.subject_id = sub.subject_id

            JOIN teacher t
            ON a.teacher_id = t.teacher_id

            WHERE a.subject_id = %s

            ORDER BY a.attendance_date
            """,
            (subject_id,)
        )

        records = cursor.fetchall()

        if not records:
            print("No attendance records found.")
            return

        print("\n========== SUBJECT ATTENDANCE REPORT ==========")
        print(f"Subject : {records[0][0]}")
        print("-" * 80)
        print("Date\t\tStudent\t\tTeacher\t\tStatus")
        print("-" * 80)

        for row in records:

            print(
                f"{row[5]}\t"
                f"{row[1]} {row[2]}\t"
                f"{row[3]} {row[4]}\t"
                f"{row[6]}"
            )

    except Exception as e:

        print(f"An error occurred: {e}")

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()
def teacher_report():

    connection = None
    cursor = None

    try:

        connection = connect_database()
        cursor = connection.cursor()

        teacher_id = int(input("Enter Teacher ID: "))

        cursor.execute(
            """
            SELECT

                t.first_name,
                t.last_name,

                s.first_name,
                s.last_name,

                sub.subject_name,

                a.attendance_date,
                a.status

            FROM attendance a

            JOIN student s
            ON a.student_id = s.student_id

            JOIN subject sub
            ON a.subject_id = sub.subject_id

            JOIN teacher t
            ON a.teacher_id = t.teacher_id

            WHERE a.teacher_id = %s

            ORDER BY a.attendance_date
            """,
            (teacher_id,)
        )

        records = cursor.fetchall()

        if not records:
            print("No attendance records found.")
            return

        print("\n========== TEACHER ATTENDANCE REPORT ==========")
        print(f"Teacher : {records[0][0]} {records[0][1]}")
        print("-" * 80)
        print("Date\t\tStudent\t\tSubject\t\tStatus")
        print("-" * 80)

        for row in records:

            print(
                f"{row[5]}\t"
                f"{row[2]} {row[3]}\t"
                f"{row[4]}\t\t"
                f"{row[6]}"
            )

    except Exception as e:

        print(f"An error occurred: {e}")

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()
def get_daily_report(attendance_date):

    connection = None
    cursor = None

    try:

        connection = connect_database()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                s.first_name,
                s.last_name,
                sub.subject_name,
                t.first_name,
                t.last_name,
                a.status
            FROM attendance a
            JOIN student s
            ON a.student_id = s.student_id
            JOIN subject sub
            ON a.subject_id = sub.subject_id
            JOIN teacher t
            ON a.teacher_id = t.teacher_id
            WHERE a.attendance_date = %s
            ORDER BY s.first_name
            """,
            (attendance_date,)
        )

        rows = cursor.fetchall()

        return [
            {
                "student": f"{row[0]} {row[1]}",
                "subject": row[2],
                "teacher": f"{row[3]} {row[4]}",
                "status": row[5]
            }
            for row in rows
        ]

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()
def daily_report():

    connection = None
    cursor = None

    try:

        connection = connect_database()
        cursor = connection.cursor()

        attendance_date = input(
            "Enter Date (YYYY-MM-DD): "
        ).strip()

        cursor.execute(
            """
            SELECT

                s.first_name,
                s.last_name,

                sub.subject_name,

                t.first_name,
                t.last_name,

                a.status

            FROM attendance a

            JOIN student s
            ON a.student_id = s.student_id

            JOIN subject sub
            ON a.subject_id = sub.subject_id

            JOIN teacher t
            ON a.teacher_id = t.teacher_id

            WHERE a.attendance_date = %s

            ORDER BY s.first_name
            """,
            (attendance_date,)
        )

        records = cursor.fetchall()

        if not records:
            print("No attendance records found.")
            return

        print("\n========== DAILY ATTENDANCE REPORT ==========")
        print(f"Date : {attendance_date}")
        print("-" * 90)
        print("Student\t\tSubject\t\tTeacher\t\tStatus")
        print("-" * 90)

        for row in records:

            print(
                f"{row[0]} {row[1]}\t"
                f"{row[2]}\t\t"
                f"{row[3]} {row[4]}\t"
                f"{row[5]}"
            )

    except Exception as e:

        print(f"An error occurred: {e}")

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()
def get_date_range_report(start_date, end_date):

    connection = None
    cursor = None

    try:

        connection = connect_database()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                s.first_name,
                s.last_name,
                sub.subject_name,
                t.first_name,
                t.last_name,
                a.attendance_date,
                a.status
            FROM attendance a
            JOIN student s
            ON a.student_id = s.student_id
            JOIN subject sub
            ON a.subject_id = sub.subject_id
            JOIN teacher t
            ON a.teacher_id = t.teacher_id
            WHERE a.attendance_date
            BETWEEN %s AND %s
            ORDER BY a.attendance_date
            """,
            (start_date, end_date)
        )

        rows = cursor.fetchall()

        return [
            {
                "student": f"{row[0]} {row[1]}",
                "subject": row[2],
                "teacher": f"{row[3]} {row[4]}",
                "attendance_date": row[5],
                "status": row[6]
            }
            for row in rows
        ]

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()

def date_range_report():

    connection = None
    cursor = None

    try:

        connection = connect_database()
        cursor = connection.cursor()

        start_date = input("Enter Start Date (YYYY-MM-DD): ").strip()
        end_date = input("Enter End Date (YYYY-MM-DD): ").strip()

        cursor.execute(
            """
            SELECT

                s.first_name,
                s.last_name,

                sub.subject_name,

                t.first_name,
                t.last_name,

                a.attendance_date,
                a.status

            FROM attendance a

            JOIN student s
            ON a.student_id = s.student_id

            JOIN subject sub
            ON a.subject_id = sub.subject_id

            JOIN teacher t
            ON a.teacher_id = t.teacher_id

            WHERE a.attendance_date
            BETWEEN %s AND %s

            ORDER BY a.attendance_date;
            """,
            (start_date, end_date)
        )

        records = cursor.fetchall()

        if not records:
            print("No attendance records found.")
            return

        print("\n========== DATE RANGE REPORT ==========")
        print(f"From : {start_date}")
        print(f"To   : {end_date}")
        print("-" * 100)

        print(
            "Date\t\tStudent\t\tSubject\t\tTeacher\t\tStatus"
        )

        print("-" * 100)

        for row in records:

            print(
                f"{row[5]}\t"
                f"{row[0]} {row[1]}\t"
                f"{row[2]}\t\t"
                f"{row[3]} {row[4]}\t"
                f"{row[6]}"
            )

    except Exception as e:

        print(f"An error occurred: {e}")

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()