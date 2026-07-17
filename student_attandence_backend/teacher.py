from database import connect_database
from psycopg2.errors import ForeignKeyViolation


def _close_connection(connection, cursor):
    if cursor is not None:
        cursor.close()
    if connection is not None:
        connection.close()


def add_teacher_record(first_name, last_name, contact, email):
    connection = None
    cursor = None
    try:
        connection = connect_database()
        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO teacher
            (
                first_name,
                last_name,
                contact,
                email
            )
            VALUES
            (
                %s,
                %s,
                %s,
                %s
            )
            RETURNING teacher_id;
            """,
            (
                first_name,
                last_name,
                contact,
                email
            )
        )

        teacher_id = cursor.fetchone()[0]
        connection.commit()
        return {
            "teacher_id": teacher_id,
            "first_name": first_name,
            "last_name": last_name,
            "contact": contact,
            "email": email,
        }
    finally:
        _close_connection(connection, cursor)


def get_all_teachers():
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
            ORDER BY teacher_id
            """
        )

        teachers = cursor.fetchall()
        return [
            {
                "teacher_id": teacher[0],
                "first_name": teacher[1],
                "last_name": teacher[2],
                "contact": teacher[3],
                "email": teacher[4],
            }
            for teacher in teachers
        ]
    finally:
        _close_connection(connection, cursor)


def get_teacher_by_id(teacher_id):
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
            WHERE teacher_id = %s
            """,
            (teacher_id,)
        )

        row = cursor.fetchone()

        if row is None:
            return None

        return {
            "teacher_id": row[0],
            "first_name": row[1],
            "last_name": row[2],
            "contact": row[3],
            "email": row[4]
        }

    finally:
        _close_connection(connection, cursor)


def update_teacher_record(teacher_id, first_name, last_name, contact, email):
    connection = None
    cursor = None
    try:
        connection = connect_database()
        cursor = connection.cursor()

        cursor.execute(
            """
            UPDATE teacher
            SET
                first_name = %s,
                last_name = %s,
                contact = %s,
                email = %s
            WHERE teacher_id = %s
            """,
            (
                first_name,
                last_name,
                contact,
                email,
                teacher_id
            )
        )

        if cursor.rowcount == 0:
            return False

        connection.commit()
        return True
    finally:
        _close_connection(connection, cursor)


def delete_teacher_record(teacher_id):

    connection = None
    cursor = None

    try:

        connection = connect_database()
        cursor = connection.cursor()

        cursor.execute(
            """
            DELETE FROM teacher
            WHERE teacher_id = %s
            """,
            (teacher_id,)
        )

        if cursor.rowcount == 0:
            return False

        connection.commit()

        return True

    except ForeignKeyViolation:

        connection.rollback()

        return None

    finally:

        _close_connection(connection, cursor)


def add_teacher():
    try:
        print("\n===== Add Teacher =====")

        first_name = input("Enter First Name: ").strip()
        last_name = input("Enter Last Name: ").strip()
        contact = input("Enter Contact Number: ").strip()
        email = input("Enter Email: ").strip()

        add_teacher_record(first_name, last_name, contact, email)

        print("Teacher added successfully!")

    except Exception as e:
        print(f"An error occurred: {e}")


def view_teachers():
    try:
        teachers = get_all_teachers()

        if not teachers:
            print("No teachers found.")
            return

        print("\n========== TEACHER LIST ==========")

        for teacher in teachers:
            print(f"Teacher ID   : {teacher['teacher_id']}")
            print(f"First Name   : {teacher['first_name']}")
            print(f"Last Name    : {teacher['last_name']}")
            print(f"Contact      : {teacher['contact']}")
            print(f"Email        : {teacher['email']}")
            print("-----------------------------------")

    except Exception as e:
        print(f"An error occurred: {e}")


def update_teacher():
    try:
        teacher_id = int(input("Enter Teacher ID: "))

        first_name = input("Enter New First Name: ").strip()
        last_name = input("Enter New Last Name: ").strip()
        contact = input("Enter New Contact Number: ").strip()
        email = input("Enter New Email: ").strip()

        updated = update_teacher_record(teacher_id, first_name, last_name, contact, email)

        if updated:
            print("Teacher updated successfully!")
        else:
            print("Teacher not found.")

    except Exception as e:
        print(f"An error occurred: {e}")


def delete_teacher():
    try:
        teacher_id = int(input("Enter Teacher ID to delete: "))

        deleted = delete_teacher_record(teacher_id)

        if deleted:
            print("Teacher deleted successfully!")
        else:
            print("Teacher not found.")

    except Exception as e:
        print(f"An error occurred: {e}")