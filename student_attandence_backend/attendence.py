from database import connect_database


def _close_connection(connection, cursor):
    if cursor is not None:
        cursor.close()
    if connection is not None:
        connection.close()


def get_students_for_selection():
    connection = None
    cursor = None
    try:
        connection = connect_database()
        cursor = connection.cursor()
        cursor.execute("""
            SELECT student_id, first_name, last_name
            FROM student
            ORDER BY student_id
        """)
        students = cursor.fetchall()
        return [
            {
                "student_id": student[0],
                "first_name": student[1],
                "last_name": student[2],
            }
            for student in students
        ]
    finally:
        _close_connection(connection, cursor)


def get_subjects_for_selection():
    connection = None
    cursor = None
    try:
        connection = connect_database()
        cursor = connection.cursor()
        cursor.execute("""
            SELECT subject_id, subject_name
            FROM subject
            ORDER BY subject_id
        """)
        subjects = cursor.fetchall()
        return [
            {
                "subject_id": subject[0],
                "subject_name": subject[1],
            }
            for subject in subjects
        ]
    finally:
        _close_connection(connection, cursor)


def get_teachers_for_selection():
    connection = None
    cursor = None
    try:
        connection = connect_database()
        cursor = connection.cursor()
        cursor.execute("""
            SELECT teacher_id, first_name, last_name
            FROM teacher
            ORDER BY teacher_id
        """)
        teachers = cursor.fetchall()
        return [
            {
                "teacher_id": teacher[0],
                "first_name": teacher[1],
                "last_name": teacher[2],
            }
            for teacher in teachers
        ]
    finally:
        _close_connection(connection, cursor)


def add_attendance_record(student_id, subject_id, teacher_id, status):
    connection = None
    cursor = None
    try:
        connection = connect_database()
        cursor = connection.cursor()
        cursor.execute(
            """
            INSERT INTO attendance
            (
                student_id,
                subject_id,
                teacher_id,
                status
            )
            VALUES
            (
                %s,
                %s,
                %s,
                %s
            )
            """,
            (
                student_id,
                subject_id,
                teacher_id,
                status
            )
        )
        connection.commit()
        return {
            "student_id": student_id,
            "subject_id": subject_id,
            "teacher_id": teacher_id,
            "status": status,
        }
    finally:
        _close_connection(connection, cursor)


def get_all_attendance_records():
    connection = None
    cursor = None
    try:
        connection = connect_database()
        cursor = connection.cursor()
        cursor.execute("""
            SELECT
                a.attendance_id,
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
            ORDER BY a.attendance_id;
        """)
        records = cursor.fetchall()
        return [
            {
                "attendance_id": record[0],
                "first_name": record[1],
                "last_name": record[2],
                "subject_name": record[3],
                "teacher_first_name": record[4],
                "teacher_last_name": record[5],
                "attendance_date": record[6],
                "status": record[7],
            }
            for record in records
        ]
    finally:
        _close_connection(connection, cursor)


def get_attendance_by_id(attendance_id):
    connection = None
    cursor = None

    try:
        connection = connect_database()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                a.attendance_id,
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

            WHERE a.attendance_id = %s
            """,
            (attendance_id,)
        )

        row = cursor.fetchone()

        if row is None:
            return None

        return {
            "attendance_id": row[0],
            "student_name": row[1] + " " + row[2],
            "subject_name": row[3],
            "teacher_name": row[4] + " " + row[5],
            "attendance_date": row[6],
            "status": row[7]
        }

    finally:
        _close_connection(connection, cursor)


def update_attendance_record(attendance_id, status):
    connection = None
    cursor = None
    try:
        connection = connect_database()
        cursor = connection.cursor()
        cursor.execute(
            """
            UPDATE attendance
            SET
                status = %s
            WHERE attendance_id = %s
            """,
            (
                status,
                attendance_id
            )
        )
        if cursor.rowcount == 0:
            return False
        connection.commit()
        return True
    finally:
        _close_connection(connection, cursor)


def delete_attendance_record(attendance_id):
    connection = None
    cursor = None
    try:
        connection = connect_database()
        cursor = connection.cursor()
        cursor.execute(
            """
            DELETE FROM attendance
            WHERE attendance_id = %s
            """,
            (attendance_id,)
        )
        if cursor.rowcount == 0:
            return False
        connection.commit()
        return True
    finally:
        _close_connection(connection, cursor)


def get_attendance_percentage_record(student_id):
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

                COUNT(a.attendance_id) AS total_classes,

                SUM(
                    CASE
                        WHEN a.status = 'Present' THEN 1
                        ELSE 0
                    END
                ) AS present_classes

            FROM student s

            LEFT JOIN attendance a
            ON s.student_id = a.student_id

            WHERE s.student_id = %s

            GROUP BY
                s.first_name,
                s.last_name
            """,
            (student_id,)
        )
        result = cursor.fetchone()
        if result is None:
            return None
        first_name = result[0]
        last_name = result[1]
        total_classes = result[2] or 0
        present_classes = result[3] or 0
        if total_classes == 0:
            percentage = 0
        else:
            percentage = (present_classes / total_classes) * 100
        return {
            "first_name": first_name,
            "last_name": last_name,
            "total_classes": total_classes,
            "present_classes": present_classes,
            "absent_classes": total_classes - present_classes,
            "percentage": percentage,
        }
    finally:
        _close_connection(connection, cursor)


def add_attendance():
    try:
        print("\n========== STUDENTS ==========")

        students = get_students_for_selection()

        for student in students:
            print(f"{student['student_id']} - {student['first_name']} {student['last_name']}")

        student_id = int(input("\nEnter Student ID: "))

        print("\n========== SUBJECTS ==========")

        subjects = get_subjects_for_selection()

        for subject in subjects:
            print(f"{subject['subject_id']} - {subject['subject_name']}")

        subject_id = int(input("\nEnter Subject ID: "))

        print("\n========== TEACHERS ==========")

        teachers = get_teachers_for_selection()

        for teacher in teachers:
            print(f"{teacher['teacher_id']} - {teacher['first_name']} {teacher['last_name']}")

        teacher_id = int(input("\nEnter Teacher ID: "))

        status = input(
            "Enter Attendance (P = Present, A = Absent): "
        ).strip().upper()

        if status == "P":
            status = "Present"

        elif status == "A":
            status = "Absent"

        else:
            print("Invalid Status")
            return

        add_attendance_record(student_id, subject_id, teacher_id, status)

        print("Attendance added successfully!")

    except Exception as e:
        print(f"An error occurred: {e}")


def view_attendance():
    try:
        records = get_all_attendance_records()

        if not records:
            print("No attendance records found.")
            return

        print("\n========== ATTENDANCE ==========")

        for record in records:
            print(f"""
Attendance ID : {record['attendance_id']}
Student       : {record['first_name']} {record['last_name']}
Subject       : {record['subject_name']}
Teacher       : {record['teacher_first_name']} {record['teacher_last_name']}
Date          : {record['attendance_date']}
Status        : {record['status']}
-----------------------------------------
""")

    except Exception as e:
        print(f"An error occurred: {e}")


def update_attendance():
    try:
        attendance_id = int(input("Enter Attendance ID: "))

        status = input(
            "Enter New Status (P = Present, A = Absent): "
        ).strip().upper()

        if status == "P":
            status = "Present"

        elif status == "A":
            status = "Absent"

        else:
            print("Invalid Status")
            return

        updated = update_attendance_record(attendance_id, status)

        if updated:
            print("Attendance updated successfully!")
        else:
            print("Attendance record not found.")

    except Exception as e:
        print(f"An error occurred: {e}")


def delete_attendance():
    try:
        attendance_id = int(
            input("Enter Attendance ID to delete: ")
        )

        deleted = delete_attendance_record(attendance_id)

        if deleted:
            print("Attendance deleted successfully!")
        else:
            print("Attendance record not found.")

    except Exception as e:
        print(f"An error occurred: {e}")


def attendance_percentage():
    try:
        student_id = int(input("Enter Student ID: "))

        result = get_attendance_percentage_record(student_id)

        if result is None:
            print("Student not found.")
            return

        print("\n========== ATTENDANCE PERCENTAGE ==========")
        print(f"Student Name     : {result['first_name']} {result['last_name']}")
        print(f"Total Classes    : {result['total_classes']}")
        print(f"Present          : {result['present_classes']}")
        print(f"Absent           : {result['absent_classes']}")
        print(f"Percentage       : {result['percentage']:.2f}%")

    except Exception as e:
        print(f"An error occurred: {e}")