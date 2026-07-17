import csv
import os
from database import connect_database

def export_attendance_csv_file():

    connection = None
    cursor = None

    try:

        connection = connect_database()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                s.roll_number,
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
            ORDER BY a.attendance_date
            """
        )

        records = cursor.fetchall()

        filename = "attendance.csv"

        with open(
            filename,
            "w",
            newline="",
            encoding="utf-8"
        ) as file:

            writer = csv.writer(file)

            writer.writerow(
                [
                    "Roll Number",
                    "Student Name",
                    "Subject",
                    "Teacher",
                    "Date",
                    "Status"
                ]
            )

            for row in records:

                writer.writerow(
                    [
                        row[0],
                        row[1] + " " + row[2],
                        row[3],
                        row[4] + " " + row[5],
                        row[6],
                        row[7]
                    ]
                )

        return os.path.abspath(filename)

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()
def export_attendance_csv():

    connection = None
    cursor = None

    try:

        connection = connect_database()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT

                s.roll_number,

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

            ORDER BY a.attendance_date;
            """
        )

        records = cursor.fetchall()

        with open(
            "attendance.csv",
            "w",
            newline="",
            encoding="utf-8"
        ) as file:

            writer = csv.writer(file)

            writer.writerow(
                [
                    "Roll Number",
                    "Student Name",
                    "Subject",
                    "Teacher",
                    "Date",
                    "Status"
                ]
            )

            for row in records:

                writer.writerow(
                    [
                        row[0],
                        row[1] + " " + row[2],
                        row[3],
                        row[4] + " " + row[5],
                        row[6],
                        row[7]
                    ]
                )

        print("\nAttendance exported successfully!")
        print("File Name : attendance.csv")

    except Exception as e:

        print(f"An error occurred: {e}")

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()