import re


def validate_name(message):

    while True:

        name = input(message).strip()

        if name == "":
            print("Input cannot be empty.")
            continue

        if not name.replace(" ", "").isalpha():
            print("Name should contain only alphabets.")
            continue

        return name


def validate_email():

    while True:

        email = input("Enter Email: ").strip()

        pattern = r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'

        if re.match(pattern, email):
            return email

        print("Invalid Email Format.")


def validate_phone():

    while True:

        phone = input("Enter Contact Number: ").strip()

        if phone.isdigit() and len(phone) == 10:
            return phone

        print("Phone number must contain exactly 10 digits.")


def validate_status():

    while True:

        status = input("Enter Status (P/A): ").strip().upper()

        if status == "P":
            return "Present"

        elif status == "A":
            return "Absent"

        print("Enter only P or A.")


def validate_id(message):

    while True:

        try:

            value = int(input(message))

            if value > 0:
                return value

            print("ID must be greater than 0.")

        except ValueError:

            print("Please enter a valid integer.")


def validate_roll_number():

    while True:

        roll = input("Enter Roll Number: ").strip()

        if roll == "":
            print("Roll Number cannot be empty.")
            continue

        return roll


def validate_subject_code():

    while True:

        code = input("Enter Subject Code: ").strip().upper()

        if code == "":
            print("Subject Code cannot be empty.")
            continue

        return code


def validate_class_name():

    while True:

        class_name = input("Enter Class Name: ").strip()

        if class_name == "":
            print("Class Name cannot be empty.")
            continue

        return class_name


def validate_division():

    while True:

        division = input("Enter Division: ").strip().upper()

        if len(division) == 1 and division.isalpha():
            return division

        print("Division must be a single alphabet (A-Z).")


def validate_date():

    while True:

        date = input("Enter Date (YYYY-MM-DD): ").strip()

        pattern = r'^\d{4}-\d{2}-\d{2}$'

        if re.match(pattern, date):
            return date

        print("Invalid Date Format. Use YYYY-MM-DD.")