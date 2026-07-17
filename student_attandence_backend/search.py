from database import connect_database


def _close_connection(connection, cursor):
    if cursor:
        cursor.close()
    if connection:
        connection.close()


def search_student_by_name_record(name):

    connection = None
    cursor = None

    try:
        connection = connect_database()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                s.student_id,
                s.roll_number,
                s.first_name,
                s.last_name,
                s.contact_number,
                s.email,
                c.class_name,
                c.division
            FROM student s
            JOIN class c
            ON s.class_id = c.class_id
            WHERE
                s.first_name ILIKE %s
                OR s.last_name ILIKE %s
            ORDER BY s.student_id
            """,
            (f"%{name}%", f"%{name}%")
        )

        rows = cursor.fetchall()

        return [
            {
                "student_id": row[0],
                "roll_number": row[1],
                "first_name": row[2],
                "last_name": row[3],
                "contact_number": row[4],
                "email": row[5],
                "class_name": row[6],
                "division": row[7]
            }
            for row in rows
        ]

    finally:
        _close_connection(connection, cursor)


def search_student_by_roll_record(roll):

    connection = None
    cursor = None

    try:
        connection = connect_database()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                s.student_id,
                s.roll_number,
                s.first_name,
                s.last_name,
                c.class_name,
                c.division
            FROM student s
            JOIN class c
            ON s.class_id = c.class_id
            WHERE s.roll_number ILIKE %s
            """,
            (f"%{roll}%",)
        )

        rows = cursor.fetchall()

        return [
            {
                "student_id": row[0],
                "roll_number": row[1],
                "first_name": row[2],
                "last_name": row[3],
                "class_name": row[4],
                "division": row[5]
            }
            for row in rows
        ]

    finally:
        _close_connection(connection, cursor)


def search_subject_record(name):

    connection = None
    cursor = None

    try:
        connection = connect_database()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                subject_id,
                subject_name,
                subject_code
            FROM subject
            WHERE subject_name ILIKE %s
            """,
            (f"%{name}%",)
        )

        rows = cursor.fetchall()

        return [
            {
                "subject_id": row[0],
                "subject_name": row[1],
                "subject_code": row[2]
            }
            for row in rows
        ]

    finally:
        _close_connection(connection, cursor)


def search_teacher_record(name):

    connection = None
    cursor = None

    try:
        connection = connect_database()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                teacher_id,
                first_name,
                last_name,
                contact,
                email
            FROM teacher
            WHERE
                first_name ILIKE %s
                OR last_name ILIKE %s
            """,
            (f"%{name}%", f"%{name}%")
        )

        rows = cursor.fetchall()

        return [
            {
                "teacher_id": row[0],
                "first_name": row[1],
                "last_name": row[2],
                "contact": row[3],
                "email": row[4]
            }
            for row in rows
        ]

    finally:
        _close_connection(connection, cursor)


def search_student_by_name():

    connection = None
    cursor = None

    try:

        connection = connect_database()
        cursor = connection.cursor()

        name = input("Enter Student Name: ").strip()

        cursor.execute(
            """
            SELECT
                s.student_id,
                s.roll_number,
                s.first_name,
                s.last_name,
                s.contact_number,
                s.email,
                c.class_name,
                c.division

            FROM student s

            JOIN class c
            ON s.class_id = c.class_id

            WHERE
                s.first_name ILIKE %s
                OR
                s.last_name ILIKE %s

            ORDER BY s.student_id
            """,
            (f"%{name}%", f"%{name}%")
        )

        students = cursor.fetchall()

        if not students:
            print("No student found.")
            return

        print("\n========== SEARCH RESULT ==========\n")

        for student in students:

            print(f"Student ID     : {student[0]}")
            print(f"Roll Number    : {student[1]}")
            print(f"Name           : {student[2]} {student[3]}")
            print(f"Contact Number : {student[4]}")
            print(f"Email          : {student[5]}")
            print(f"Class          : {student[6]} - {student[7]}")
            print("-" * 40)

    except Exception as e:

        print(f"An error occurred: {e}")

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()
def search_student_by_roll():

    connection = None
    cursor = None

    try:

        connection = connect_database()
        cursor = connection.cursor()

        roll = input("Enter Roll Number: ").strip()

        cursor.execute(
            """
            SELECT
                s.student_id,
                s.roll_number,
                s.first_name,
                s.last_name,
                c.class_name,
                c.division

            FROM student s

            JOIN class c
            ON s.class_id = c.class_id

            WHERE s.roll_number ILIKE %s
            """,
            (f"%{roll}%",)
        )

        students = cursor.fetchall()

        if not students:
            print("No student found.")
            return

        print("\n========== SEARCH RESULT ==========\n")

        for student in students:

            print(f"Student ID  : {student[0]}")
            print(f"Roll Number : {student[1]}")
            print(f"Name        : {student[2]} {student[3]}")
            print(f"Class       : {student[4]} - {student[5]}")
            print("-" * 40)

    except Exception as e:

        print(f"An error occurred: {e}")

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()
def search_subject():

    connection = None
    cursor = None

    try:

        connection = connect_database()
        cursor = connection.cursor()

        name = input("Enter Subject Name: ").strip()

        cursor.execute(
            """
            SELECT *
            FROM subject
            WHERE subject_name ILIKE %s
            """,
            (f"%{name}%",)
        )

        subjects = cursor.fetchall()

        if not subjects:
            print("No subject found.")
            return

        print("\n========== SUBJECTS ==========\n")

        for subject in subjects:

            print(f"Subject ID   : {subject[0]}")
            print(f"Subject Name : {subject[1]}")
            print(f"Subject Code : {subject[2]}")
            print("-" * 35)

    except Exception as e:

        print(f"An error occurred: {e}")

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()
def search_teacher():

    connection = None
    cursor = None

    try:

        connection = connect_database()
        cursor = connection.cursor()

        name = input("Enter Teacher Name: ").strip()

        cursor.execute(
            """
            SELECT *
            FROM teacher
            WHERE
                first_name ILIKE %s
                OR
                last_name ILIKE %s
            """,
            (f"%{name}%", f"%{name}%")
        )

        teachers = cursor.fetchall()

        if not teachers:
            print("No teacher found.")
            return

        print("\n========== TEACHERS ==========\n")

        for teacher in teachers:

            print(f"Teacher ID : {teacher[0]}")
            print(f"Name       : {teacher[1]} {teacher[2]}")
            print(f"Contact    : {teacher[3]}")
            print(f"Email      : {teacher[4]}")
            print("-" * 35)

    except Exception as e:

        print(f"An error occurred: {e}")

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()