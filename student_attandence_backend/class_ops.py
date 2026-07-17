from database import connect_database

def _close_connection(connection, cursor):
    if cursor is not None:
        cursor.close()
    if connection is not None:
        connection.close()


def add_class_record(class_name, division):
    connection = None
    cursor = None

    try:
        connection = connect_database()
        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO class
            (
                class_name,
                division
            )
            VALUES
            (
                %s,
                %s
            )
            RETURNING class_id;
            """,
            (class_name, division)
        )

        class_id = cursor.fetchone()[0]
        connection.commit()

        return {
            "class_id": class_id,
            "class_name": class_name,
            "division": division
        }

    finally:
        _close_connection(connection, cursor)


def get_all_classes():

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

        rows = cursor.fetchall()

        return [
            {
                "class_id": row[0],
                "class_name": row[1],
                "division": row[2]
            }
            for row in rows
        ]

    finally:
        _close_connection(connection, cursor)


def get_class_by_id(class_id):
    connection = None
    cursor = None

    try:
        connection = connect_database()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                class_id,
                class_name,
                division
            FROM class
            WHERE class_id = %s
            """,
            (class_id,)
        )

        row = cursor.fetchone()

        if row is None:
            return None

        return {
            "class_id": row[0],
            "class_name": row[1],
            "division": row[2]
        }

    finally:
        _close_connection(connection, cursor)


def update_class_record(class_id, class_name, division):
    connection = None
    cursor = None

    try:
        connection = connect_database()
        cursor = connection.cursor()

        cursor.execute(
            """
            UPDATE class
            SET
                class_name = %s,
                division = %s
            WHERE class_id = %s
            """,
            (
                class_name,
                division,
                class_id
            )
        )

        if cursor.rowcount == 0:
            return False

        connection.commit()

        return True

    finally:
        _close_connection(connection, cursor)


def delete_class_record(class_id):
    connection = None
    cursor = None

    try:
        connection = connect_database()
        cursor = connection.cursor()

        cursor.execute(
            """
            DELETE FROM class
            WHERE class_id = %s
            """,
            (class_id,)
        )

        if cursor.rowcount == 0:
            return False

        connection.commit()

        return True

    finally:
        _close_connection(connection, cursor)


def add_class():
    try:
        class_name = input("Enter Class Name: ").strip()
        division = input("Enter Division: ").strip()

        add_class_record(class_name, division)

        print("Class added successfully!")

    except Exception as e:
        print(f"An error occurred: {e}")


def view_classes():
    try:
        classes = get_all_classes()
        for class_item in classes:
            print(
                f"ID: {class_item['class_id']} | "
                f"Class: {class_item['class_name']} | "
                f"Division: {class_item['division']}"
            )
    except Exception as e:
        print(f"An error occurred: {e}")


def update_class(class_id):
    try:
        new_class_name = input("Enter New Class Name: ").strip()
        new_division = input("Enter New Division: ").strip()

        updated = update_class_record(class_id, new_class_name, new_division)

        if updated:
            print("Class updated successfully!")
        else:
            print("Class not found.")
    except Exception as e:
        print(f"An error occurred: {e}")


def delete_class(class_id):
    try:
        deleted = delete_class_record(class_id)

        if deleted:
            print("Class deleted successfully!")
        else:
            print("Class not found.")
    except Exception as e:
        print(f"An error occurred: {e}")


