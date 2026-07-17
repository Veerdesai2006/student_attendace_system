from database import connect_database
from psycopg2.errors import ForeignKeyViolation


def _close_connection(connection, cursor):
    if cursor is not None:
        cursor.close()
    if connection is not None:
        connection.close()


def add_subject_record(subject_name, subject_code):
    connection = None
    cursor = None
    try:
        connection = connect_database()
        cursor = connection.cursor()
        cursor.execute(
            """
            INSERT INTO subject
            (
                subject_name,
                subject_code
            )
            VALUES
            (
                %s,
                %s
            )
            RETURNING subject_id;
            """,
            (
                subject_name,
                subject_code
            )
        )
        subject_id = cursor.fetchone()[0]
        connection.commit()
        return {
            "subject_id": subject_id,
            "subject_name": subject_name,
            "subject_code": subject_code,
        }
    finally:
        _close_connection(connection, cursor)


def get_all_subjects():
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
            ORDER BY subject_id
            """
        )
        subjects = cursor.fetchall()
        return [
            {
                "subject_id": subject[0],
                "subject_name": subject[1],
                "subject_code": subject[2],
            }
            for subject in subjects
        ]
    finally:
        _close_connection(connection, cursor)


def get_subject_by_id(subject_id):
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
            WHERE subject_id = %s
            """,
            (subject_id,)
        )

        row = cursor.fetchone()

        if row is None:
            return None

        return {
            "subject_id": row[0],
            "subject_name": row[1],
            "subject_code": row[2]
        }

    finally:
        _close_connection(connection, cursor)


def update_subject_record(subject_id, new_subject_name, new_subject_code):
    connection = None
    cursor = None
    try:
        connection = connect_database()
        cursor = connection.cursor()
        cursor.execute(
            """
            UPDATE subject
            SET
                subject_name = %s,
                subject_code = %s
            WHERE subject_id = %s
            """,
            (new_subject_name, new_subject_code, subject_id)
        )
        if cursor.rowcount == 0:
            return False
        connection.commit()
        return True
    finally:
        _close_connection(connection, cursor)


def delete_subject_record(subject_id):
    connection = None
    cursor = None

    try:
        connection = connect_database()
        cursor = connection.cursor()
        cursor.execute(
            """
            DELETE FROM subject
            WHERE subject_id = %s
            """,
            (subject_id,)
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


def add_subject():
    try:
        print("\n===== Add Subject =====")
        subject_name = input("Enter Subject Name: ").strip()
        subject_code = input("Enter Subject Code: ").strip()
        add_subject_record(subject_name, subject_code)
        print("Subject added successfully!")
    except Exception as e:
        print(f"An error occurred: {e}")


def view_subjects():
    try:
        subjects = get_all_subjects()
        if not subjects:
            print("No subjects found.")
            return
        print("\n========== SUBJECT LIST ==========")
        for subject in subjects:
            print(f"Subject ID   : {subject['subject_id']}")
            print(f"Subject Name : {subject['subject_name']}")
            print(f"Subject Code : {subject['subject_code']}")
            print("-----------------------------------")
    except Exception as e:
        print(f"Error happened{e}")


def update_subject():
    try:
        subject_id = int(input("Enter subject id : "))
        new_subject_name = input("Enter New Subject Name: ").strip()
        new_subject_code = input("Enter New Subject Code: ").strip()
        updated = update_subject_record(subject_id, new_subject_name, new_subject_code)
        if updated:
            print("Subject updated successfully!")
        else:
            print("Subject not found.")
    except Exception as e:
        print(f"An error occurred: {e}")


def delete_subject():
    try:
        subject_id = int(input("Please enter the subject_id for deletion"))
        deleted = delete_subject_record(subject_id)
        if deleted:
            print("Subject deleted successfully!")
        else:
            print("Subject not found.")
    except Exception as e:
        print(f"An error occurred: {e}")