from database import connect_database


def get_dashboard_data():

    connection = None
    cursor = None

    try:

        connection = connect_database()
        cursor = connection.cursor()

        cursor.execute("SELECT COUNT(*) FROM class")
        total_classes = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM student")
        total_students = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM subject")
        total_subjects = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM teacher")
        total_teachers = cursor.fetchone()[0]

        cursor.execute("""
            SELECT COUNT(*)
            FROM attendance
            WHERE attendance_date = CURRENT_DATE
        """)
        today_attendance = cursor.fetchone()[0]

        cursor.execute("""
            SELECT COUNT(*)
            FROM attendance
            WHERE attendance_date = CURRENT_DATE
            AND status='Present'
        """)
        present_today = cursor.fetchone()[0]

        cursor.execute("""
            SELECT COUNT(*)
            FROM attendance
            WHERE attendance_date = CURRENT_DATE
            AND status='Absent'
        """)
        absent_today = cursor.fetchone()[0]

        return {
            "total_classes": total_classes,
            "total_students": total_students,
            "total_subjects": total_subjects,
            "total_teachers": total_teachers,
            "today_attendance": today_attendance,
            "present_today": present_today,
            "absent_today": absent_today
        }

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


def dashboard():

    connection = None
    cursor = None

    try:

        connection = connect_database()
        cursor = connection.cursor()

        # Total Classes
        cursor.execute("SELECT COUNT(*) FROM class")
        total_classes = cursor.fetchone()[0]

        # Total Students
        cursor.execute("SELECT COUNT(*) FROM student")
        total_students = cursor.fetchone()[0]

        # Total Subjects
        cursor.execute("SELECT COUNT(*) FROM subject")
        total_subjects = cursor.fetchone()[0]

        # Total Teachers
        cursor.execute("SELECT COUNT(*) FROM teacher")
        total_teachers = cursor.fetchone()[0]

        # Today's Attendance
        cursor.execute("""
            SELECT COUNT(*)
            FROM attendance
            WHERE attendance_date = CURRENT_DATE
        """)
        today_attendance = cursor.fetchone()[0]

        # Present Today
        cursor.execute("""
            SELECT COUNT(*)
            FROM attendance
            WHERE attendance_date = CURRENT_DATE
            AND status='Present'
        """)
        present_today = cursor.fetchone()[0]

        # Absent Today
        cursor.execute("""
            SELECT COUNT(*)
            FROM attendance
            WHERE attendance_date = CURRENT_DATE
            AND status='Absent'
        """)
        absent_today = cursor.fetchone()[0]

        print("\n========== DASHBOARD ==========\n")

        print(f"Total Classes       : {total_classes}")
        print(f"Total Students      : {total_students}")
        print(f"Total Subjects      : {total_subjects}")
        print(f"Total Teachers      : {total_teachers}")

        print("\nToday's Attendance")

        print(f"Total Records       : {today_attendance}")
        print(f"Present             : {present_today}")
        print(f"Absent              : {absent_today}")

    except Exception as e:

        print(f"An error occurred: {e}")

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()