from class_ops import *
from student import *
from subject import *
from teacher import *
from attendence import *

from report import *
from search import *
from dashboard import dashboard
from export_csv import export_attendance_csv


# ===========================
# CLASS MENU
# ===========================

def class_menu():

    while True:

        print("\n========== CLASS MANAGEMENT ==========")
        print("1. Add Class")
        print("2. View Classes")
        print("3. Update Class")
        print("4. Delete Class")
        print("5. Back")

        choice = input("Enter your choice: ")

        if choice == "1":
            add_class()

        elif choice == "2":
            view_classes()

        elif choice == "3":
            class_id = int(input("Enter Class ID: "))
            update_class(class_id)

        elif choice == "4":
            class_id = int(input("Enter Class ID: "))
            delete_class(class_id)

        elif choice == "5":
            break

        else:
            print("Invalid Choice.")


# ===========================
# STUDENT MENU
# ===========================

def student_menu():

    while True:

        print("\n========== STUDENT MANAGEMENT ==========")
        print("1. Add Student")
        print("2. View Students")
        print("3. Update Student")
        print("4. Delete Student")
        print("5. Back")

        choice = input("Enter your choice: ")

        if choice == "1":
            add_student()

        elif choice == "2":
            view_students()

        elif choice == "3":
            update_student()

        elif choice == "4":
            delete_student()

        elif choice == "5":
            break

        else:
            print("Invalid Choice.")


# ===========================
# SUBJECT MENU
# ===========================

def subject_menu():

    while True:

        print("\n========== SUBJECT MANAGEMENT ==========")
        print("1. Add Subject")
        print("2. View Subjects")
        print("3. Update Subject")
        print("4. Delete Subject")
        print("5. Back")

        choice = input("Enter your choice: ")

        if choice == "1":
            add_subject()

        elif choice == "2":
            view_subjects()

        elif choice == "3":
            update_subject()

        elif choice == "4":
            delete_subject()

        elif choice == "5":
            break

        else:
            print("Invalid Choice.")


# ===========================
# TEACHER MENU
# ===========================

def teacher_menu():

    while True:

        print("\n========== TEACHER MANAGEMENT ==========")
        print("1. Add Teacher")
        print("2. View Teachers")
        print("3. Update Teacher")
        print("4. Delete Teacher")
        print("5. Back")

        choice = input("Enter your choice: ")

        if choice == "1":
            add_teacher()

        elif choice == "2":
            view_teachers()

        elif choice == "3":
            update_teacher()

        elif choice == "4":
            delete_teacher()

        elif choice == "5":
            break

        else:
            print("Invalid Choice.")


# ===========================
# REPORT MENU
# ===========================

def reports_menu():

    while True:

        print("\n========== ATTENDANCE REPORTS ==========")
        print("1. Student Attendance Report")
        print("2. Subject Attendance Report")
        print("3. Teacher Attendance Report")
        print("4. Daily Attendance Report")
        print("5. Date Range Report")
        print("6. Back")

        choice = input("Enter your choice: ")

        if choice == "1":
            student_report()

        elif choice == "2":
            subject_report()

        elif choice == "3":
            teacher_report()

        elif choice == "4":
            daily_report()

        elif choice == "5":
            date_range_report()

        elif choice == "6":
            break

        else:
            print("Invalid Choice.")


# ===========================
# ATTENDANCE MENU
# ===========================

def attendance_menu():

    while True:

        print("\n========== ATTENDANCE MANAGEMENT ==========")
        print("1. Add Attendance")
        print("2. View Attendance")
        print("3. Update Attendance")
        print("4. Delete Attendance")
        print("5. Attendance Reports")
        print("6. Attendance percentage")
        print("7. Back")

        choice = input("Enter your choice: ")

        if choice == "1":
            add_attendance()

        elif choice == "2":
            view_attendance()

        elif choice == "3":
            update_attendance()

        elif choice == "4":
            delete_attendance()

        elif choice == "5":
            reports_menu()

        elif choice == "6":
            attendance_percentage()
            

        elif choice == "7":
            break

        else:
            print("Invalid Choice.")


# ===========================
# SEARCH MENU
# ===========================

def search_menu():

    while True:

        print("\n========== SEARCH ==========")
        print("1. Search Student by Name")
        print("2. Search Student by Roll Number")
        print("3. Search Subject")
        print("4. Search Teacher")
        print("5. Back")

        choice = input("Enter your choice: ")

        if choice == "1":
            search_student_by_name()

        elif choice == "2":
            search_student_by_roll()

        elif choice == "3":
            search_subject()

        elif choice == "4":
            search_teacher()

        elif choice == "5":
            break

        else:
            print("Invalid Choice.")


# ===========================
# EXPORT MENU
# ===========================

def export_menu():

    while True:

        print("\n========== EXPORT ==========")
        print("1. Export Attendance CSV")
        print("2. Back")

        choice = input("Enter your choice: ")

        if choice == "1":
            export_attendance_csv()

        elif choice == "2":
            break

        else:
            print("Invalid Choice.")


# ===========================
# MAIN MENU
# ===========================

def main():

    # Show dashboard once when application starts
    dashboard()

    while True:

        print("\n========================================")
        print("   STUDENT ATTENDANCE MANAGEMENT SYSTEM")
        print("========================================")

        print("1. Class Management")
        print("2. Student Management")
        print("3. Subject Management")
        print("4. Teacher Management")
        print("5. Attendance Management")
        print("6. Search")
        print("7. Export CSV")
        print("8. Exit")

        choice = input("\nEnter your choice: ")

        if choice == "1":
            class_menu()

        elif choice == "2":
            student_menu()

        elif choice == "3":
            subject_menu()

        elif choice == "4":
            teacher_menu()

        elif choice == "5":
            attendance_menu()

        elif choice == "6":
            search_menu()

        elif choice == "7":
            export_menu()

        elif choice == "8":
            print("\nThank you for using Student Attendance Management System!")
            break

        else:
            print("Invalid Choice. Please try again.")


if __name__ == "__main__":
    main()