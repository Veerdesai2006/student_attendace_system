from database import connect_database


def _close_connection(connection, cursor):
    if cursor is not None:
        cursor.close()
    if connection is not None:
        connection.close()


def add_student_record(roll_number, first_name, last_name, contact_number, email, class_id):
    connection = None
    cursor = None
    try:
        connection = connect_database()
        cursor = connection.cursor()
        cursor.execute(
            """
            INSERT INTO student
            (
                roll_number,
                first_name,
                last_name,
                contact_number,
                email,
                class_id
            )
            VALUES
            (%s, %s, %s, %s, %s, %s)
            RETURNING student_id;
            """,
            (
                roll_number,
                first_name,
                last_name,
                contact_number,
                email,
                class_id
            )
        )
        student_id = cursor.fetchone()[0]
        connection.commit()
        return {
            "student_id": student_id,
            "roll_number": roll_number,
            "first_name": first_name,
            "last_name": last_name,
            "contact_number": contact_number,
            "email": email,
            "class_id": class_id,
        }
    finally:
        _close_connection(connection, cursor)


def get_all_students():
    connection = None
    cursor = None
    try:
        connection = connect_database()
        cursor = connection.cursor()
        cursor.execute("""
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
            ORDER BY s.student_id;
        """)
        students = cursor.fetchall()
        return [
            {
                "student_id": student[0],
                "roll_number": student[1],
                "first_name": student[2],
                "last_name": student[3],
                "contact_number": student[4],
                "email": student[5],
                "class_name": student[6],
                "division": student[7],
            }
            for student in students
        ]
    finally:
        _close_connection(connection, cursor)


def get_available_classes():
    connection = None
    cursor = None
    try:
        connection = connect_database()
        cursor = connection.cursor()
        cursor.execute("""
            SELECT
                class_id,
                class_name,
                division
            FROM class
            ORDER BY class_id
        """)
        return cursor.fetchall()
    finally:
        _close_connection(connection, cursor)


def update_student_record(student_id, roll_number, first_name, last_name, contact_number, email, class_id):
    connection = None
    cursor = None
    try:
        connection = connect_database()
        cursor = connection.cursor()
        cursor.execute(
            """
            UPDATE student
            SET
                roll_number=%s,
                first_name=%s,
                last_name=%s,
                contact_number=%s,
                email=%s,
                class_id=%s
            WHERE student_id=%s
            """,
            (
                roll_number,
                first_name,
                last_name,
                contact_number,
                email,
                class_id,
                student_id
            )
        )
        if cursor.rowcount == 0:
            return False
        connection.commit()
        return True
    finally:
        _close_connection(connection, cursor)


def delete_student_record(student_id):
    connection = None
    cursor = None
    try:
        connection = connect_database()
        cursor = connection.cursor()
        cursor.execute(
            """
            DELETE FROM student
            WHERE student_id=%s
            """,
            (student_id,)
        )
        if cursor.rowcount == 0:
            return False
        connection.commit()
        return True
    finally:
        _close_connection(connection, cursor)


def add_student():
    try:
        print("\n===== Add Student =====")

        roll_number = input("Enter Roll Number: ").strip()
        first_name = input("Enter First Name: ").strip()
        last_name = input("Enter Last Name: ").strip()
        contact_number = input("Enter Contact Number: ").strip()
        email = input("Enter Email: ").strip()
        class_id = int(input("Enter Class ID: "))
        add_student_record(
            roll_number,
            first_name,
            last_name,
            contact_number,
            email,
            class_id
        )
        print("Student added successfully!")
    except Exception as e:
        print(f"An error occurred: {e}")


def view_students():
    try:
        students = get_all_students()

        if not students:
            print("No students found.")
            return

        print("\n========== STUDENT LIST ==========")

        for student in students:
            print(f"""
Student ID     : {student['student_id']}
Roll Number    : {student['roll_number']}
Name           : {student['first_name']} {student['last_name']}
Contact Number : {student['contact_number']}
Email          : {student['email']}
Class          : {student['class_name']} - {student['division']}
-----------------------------------------
""")

    except Exception as e:
        print(f"An error occurred: {e}")


def update_student():
    try:
        student_id = int(input("Enter Student ID: "))

        roll_number = input("Enter New Roll Number: ").strip()
        first_name = input("Enter New First Name: ").strip()
        last_name = input("Enter New Last Name: ").strip()
        contact_number = input("Enter New Contact Number: ").strip()
        email = input("Enter New Email: ").strip()

        classes = get_available_classes()

        print("\nAvailable Classes")

        for row in classes:
            print(f"{row[0]} - {row[1]} ({row[2]})")

        class_id = int(input("Enter New Class ID: "))

        updated = update_student_record(
            student_id,
            roll_number,
            first_name,
            last_name,
            contact_number,
            email,
            class_id
        )

        if updated is False:
            print("Student not found.")
        else:
            print("Student updated successfully!")

    except Exception as e:
        print(f"An error occurred: {e}")


def delete_student():
    try:
        student_id = int(input("Enter Student ID to delete: "))

        deleted = delete_student_record(student_id)

        if deleted is False:
            print("Student not found.")
        else:
            print("Student deleted successfully!")

    except Exception as e:
        print(f"An error occurred: {e}")
def get_student_by_id(student_id):

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

            WHERE s.student_id=%s
            """,
            (student_id,)
        )

        student = cursor.fetchone()

        if student is None:
            return None

        return {
            "student_id": student[0],
            "roll_number": student[1],
            "first_name": student[2],
            "last_name": student[3],
            "contact_number": student[4],
            "email": student[5],
            "class_name": student[6],
            "division": student[7],
        }

    finally:

        _close_connection(connection, cursor)
def get_student_by_id(student_id):

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

            WHERE s.student_id = %s
            """,
            (student_id,)
        )

        student = cursor.fetchone()

        if student is None:
            return None

        return {
            "student_id": student[0],
            "roll_number": student[1],
            "first_name": student[2],
            "last_name": student[3],
            "contact_number": student[4],
            "email": student[5],
            "class_name": student[6],
            "division": student[7],
        }

    finally:

        _close_connection(connection, cursor)