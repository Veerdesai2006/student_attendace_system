from flask import Blueprint, jsonify, request
from student import (
    get_all_students,
    get_student_by_id,
    add_student_record,
    update_student_record,
    delete_student_record
)
student_bp = Blueprint("student_bp", __name__)


# GET ALL STUDENTS
@student_bp.route("/api/students", methods=["GET"])
def get_students():

    students = get_all_students()

    return jsonify(students), 200


@student_bp.route("/api/students/<int:student_id>", methods=["GET"])
def get_student(student_id):

    student = get_student_by_id(student_id)

    if student is None:

        return jsonify(
            {
                "message": "Student not found"
            }
        ), 404

    return jsonify(student), 200


# ADD STUDENT
@student_bp.route("/api/students", methods=["POST"])
def add_student():

    data = request.get_json()

    student = add_student_record(
        data["roll_number"],
        data["first_name"],
        data["last_name"],
        data["contact_number"],
        data["email"],
        data["class_id"]
    )

    return jsonify(student), 201


# UPDATE STUDENT
@student_bp.route("/api/students/<int:student_id>", methods=["PUT"])
def update_student(student_id):

    data = request.get_json()

    updated = update_student_record(
        student_id,
        data["roll_number"],
        data["first_name"],
        data["last_name"],
        data["contact_number"],
        data["email"],
        data["class_id"]
    )

    if not updated:
        return jsonify({"message": "Student not found"}), 404

    return jsonify({"message": "Student updated successfully"}), 200


# DELETE STUDENT
@student_bp.route("/api/students/<int:student_id>", methods=["DELETE"])
def delete_student(student_id):

    deleted = delete_student_record(student_id)

    if not deleted:
        return jsonify({"message": "Student not found"}), 404

    return jsonify({"message": "Student deleted successfully"}), 200